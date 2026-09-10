import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  CORPUS_MODULES,
  CORPUS_RESEARCH_STORAGE_KEY,
  analyzeCorpusDeterministically,
  createCorpusDocument,
  createCorpusReview,
  inspectCorpus,
  readCorpusResearchState,
  saveCorpusResearchState,
  validateCorpusAiOutput,
} from "../lib/corpus-research.js";
import corpusResearchHandler from "../pages/api/corpus-research.js";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
function memoryStorage() { const data = new Map(); return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }; }
function response() { return { statusCode: 200, headers: {}, setHeader(key, value) { this.headers[key] = value; }, status(code) { this.statusCode = code; return this; }, json(value) { this.body = value; return this; } }; }

test("corpus research exposes exactly the create and analyze preview modules in its canonical path", () => {
  assert.deepEqual(CORPUS_MODULES, ["create", "analyze"]);
  const page = source("pages/tools/corpus-research.js");
  for (const label of ["إنشاء مدونة جديدة", "تحليل المدونة", "Create Corpus", "Corpus Analysis", "تجريب بحثي", "Research Preview", "يظل الباحث مسؤولًا"]) assert.match(page, new RegExp(label));
  assert.doesNotMatch(source("pages/ar-tools.js"), /\/tools\/corpus-research/);
  assert.match(source("lib/research-paths.js"), /href: "\/tools\/corpus-research"[^\n]+Research Preview[^\n]+تجريب بحثي/);
});

test("corpus readiness detects missing metadata and exact duplicate texts without fabrication", () => {
  const first = createCorpusDocument({ text: "هذا نص عربي للبحث.", metadata: { source: "المصدر أ" } }, "first");
  const duplicate = createCorpusDocument({ text: "  هذا  نص عربي للبحث. ", metadata: {} }, "second");
  const inspection = inspectCorpus([first, duplicate]);
  assert.deepEqual(inspection.duplicateIds, ["second"]);
  assert.deepEqual(inspection.missingMetadata[0], { documentId: "first", fields: ["genre", "date", "author", "notes"] });
  assert.equal(first.metadata.genre, "");
});

test("deterministic corpus analysis calculates observed frequency contexts and ngrams locally", () => {
  const documents = [createCorpusDocument({ text: "اللغة مهمة. اللغة أداة بحث." }, "one")];
  const result = analyzeCorpusDeterministically(documents, { query: "اللغة", ngramSize: 2 });
  assert.equal(result.wordCount, 5);
  assert.deepEqual(result.frequencies[0], ["اللغة", 2]);
  assert.deepEqual(result.contexts, ["اللغة مهمة", "اللغة أداة بحث"]);
  assert.ok(result.ngrams.some(([gram]) => gram === "اللغة مهمة"));
});

test("research review preserves the original AI output separately from the human final result", () => {
  const aiOutput = { summary: "ملخص أولي.", patterns: ["تكررت اللغة مرتين."], researchQuestions: ["كيف يتوزع المصطلح؟"], caution: "يتطلب التحقق." };
  const finalOutput = { ...aiOutput, summary: "ملخص راجعه الباحث." };
  assert.equal(validateCorpusAiOutput("analyze", aiOutput), true);
  const review = createCorpusReview({ moduleId: "analyze", aiOutput, decision: "edit", finalOutput });
  assert.equal(review.aiOutput.summary, "ملخص أولي.");
  assert.equal(review.researcherDecision, "edit");
  assert.equal(review.finalOutput.summary, "ملخص راجعه الباحث.");
});

test("corpus project state uses guarded bounded localStorage only", () => {
  const storage = memoryStorage();
  const documents = Array.from({ length: 105 }, (_, index) => createCorpusDocument({ text: `نص عربي ${index}` }, String(index)));
  assert.equal(saveCorpusResearchState({ documents, reviews: [] }, storage).ok, true);
  assert.equal(readCorpusResearchState(storage).documents.length, 100);
  assert.ok(storage.getItem(CORPUS_RESEARCH_STORAGE_KEY));
  const blocked = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
  assert.deepEqual(readCorpusResearchState(blocked), { documents: [], reviews: [] });
  assert.equal(saveCorpusResearchState({ documents: [], reviews: [] }, blocked).ok, false);
  assert.doesNotMatch(source("pages/tools/corpus-research.js"), /sessionStorage|indexedDB|fetch\([^\n]*documents/);
});

test("AI requests are explicit and receive only corpus summaries or deterministic results", () => {
  const page = source("pages/tools/corpus-research.js");
  assert.match(page, /onClick=\{requestAi\}/);
  assert.match(page, /corpusSummary: inspection/);
  assert.match(page, /results \}/);
  assert.doesNotMatch(page, /useEffect\([\s\S]{0,400}fetch\(/);
  assert.doesNotMatch(source("pages/api/corpus-research.js"), /Math\.|confidence/i);
  assert.match(page, /ARABIC_PATTERN\.test\(text\)/);
});

test("corpus research API rejects invalid requests and keeps OpenAI credentials server-side", async () => {
  const invalid = response();
  await corpusResearchHandler({ method: "POST", body: { moduleId: "unknown" } }, invalid);
  assert.equal(invalid.statusCode, 400);
  const previous = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  try {
    const unavailable = response();
    await corpusResearchHandler({ method: "POST", body: { moduleId: "create", corpusSummary: { documentCount: 1 } } }, unavailable);
    assert.equal(unavailable.statusCode, 503);
  } finally {
    if (previous === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previous;
  }
  assert.doesNotMatch(source("pages/tools/corpus-research.js"), /OPENAI_API_KEY|new OpenAI/);
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  SEMANTICS_REVIEW_STORAGE_KEY,
  SEMANTICS_TOOLS,
  createSemanticsReviewedCase,
  readSemanticsReviewedCases,
  saveSemanticsReviewedCase,
  validateSemanticsOutput,
} from "../lib/semantics-analysis.js";
import semanticsHandler from "../pages/api/semantics.js";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
function memoryStorage() { const data = new Map(); return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }; }
function mockResponse() { return { statusCode: 200, headers: {}, setHeader(key, value) { this.headers[key] = value; }, status(code) { this.statusCode = code; return this; }, json(value) { this.body = value; return this; } }; }

test("Semantics preview defines exactly the three approved tools and similarity categories", () => {
  assert.deepEqual(Object.keys(SEMANTICS_TOOLS), ["similarity", "topic", "grouping"]);
  assert.deepEqual(SEMANTICS_TOOLS.similarity.categories, ["متشابه دلاليًا", "متشابه جزئيًا", "غير متشابه"]);
});

test("similarity and topic outputs require evidence copied from their source text", () => {
  const similarityInputs = { primary: "تركز الدراسة على تعليم اللغة.", secondary: "يبحث المشروع في تعلم اللغات." };
  const similarity = { category: "متشابه جزئيًا", evidence: { primary: "تعليم اللغة", secondary: "تعلم اللغات" }, explanation: "يشترك النصان في موضوع التعلم اللغوي." };
  assert.equal(validateSemanticsOutput("similarity", similarityInputs, similarity), true);
  assert.equal(validateSemanticsOutput("similarity", similarityInputs, { ...similarity, evidence: { ...similarity.evidence, secondary: "تحليل الخطاب" } }), false);
  const topicInputs = { primary: "تتناول الدراسة أثر الذكاء الاصطناعي في تعليم اللغة.", secondary: "" };
  assert.equal(validateSemanticsOutput("topic", topicInputs, { topic: "الذكاء الاصطناعي وتعليم اللغة", evidence: "أثر الذكاء الاصطناعي في تعليم اللغة", explanation: "هذا هو المحور الصريح للنص." }), true);
});

test("semantic grouping assigns every submitted text exactly once without invention", () => {
  const inputs = { texts: ["تعلم اللغة بالتقنية", "تحليل النصوص العربية", "تقويم نماذج التصنيف"] };
  const output = { groups: [{ label: "التقنية اللغوية", texts: ["تعلم اللغة بالتقنية", "تحليل النصوص العربية"], rationale: "موضوعات لغوية تقنية." }, { label: "التقييم", texts: ["تقويم نماذج التصنيف"], rationale: "يركز على تقييم النموذج." }], explanation: "تجميع أولي بحسب المعنى الظاهر." };
  assert.equal(validateSemanticsOutput("grouping", inputs, output), true);
  assert.equal(validateSemanticsOutput("grouping", inputs, { ...output, groups: [{ ...output.groups[0], texts: ["نص غير مدخل"] }] }), false);
});

test("research review preserves original semantic AI output and requires a human final output", () => {
  const inputs = { primary: "النص عن التعليم.", secondary: "المقطع يناقش التعلم." };
  const aiOutput = { category: "متشابه دلاليًا", evidence: { primary: "التعليم", secondary: "التعلم" }, explanation: "الموضوع متقارب." };
  const finalOutput = { category: "متشابه جزئيًا", evidence: { primary: "التعليم", secondary: "التعلم" } };
  const record = createSemanticsReviewedCase({ toolId: "similarity", inputs, aiOutput, decision: "edit", finalOutput });
  assert.equal(record.aiOutput.category, "متشابه دلاليًا");
  assert.equal(record.researcherDecision, "edit");
  assert.equal(record.finalOutput.category, "متشابه جزئيًا");
  assert.equal(createSemanticsReviewedCase({ toolId: "similarity", inputs, aiOutput, decision: "reject", finalOutput: { category: "", evidence: { primary: "", secondary: "" } } }), null);
});

test("semantic reviews use guarded bounded localStorage only", () => {
  const storage = memoryStorage();
  const inputs = { primary: "النص عن التعليم.", secondary: "المقطع عن التعلم." };
  const aiOutput = { category: "متشابه جزئيًا", evidence: { primary: "التعليم", secondary: "التعلم" }, explanation: "تقارب جزئي." };
  for (let index = 0; index < 105; index += 1) saveSemanticsReviewedCase(createSemanticsReviewedCase({ toolId: "similarity", inputs, aiOutput, decision: "accept", finalOutput: aiOutput }), storage);
  assert.equal(readSemanticsReviewedCases(storage).length, 100);
  assert.ok(storage.getItem(SEMANTICS_REVIEW_STORAGE_KEY));
  const blocked = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
  assert.deepEqual(readSemanticsReviewedCases(blocked), []);
  assert.equal(saveSemanticsReviewedCase(createSemanticsReviewedCase({ toolId: "similarity", inputs, aiOutput, decision: "accept", finalOutput: aiOutput }), blocked).ok, false);
});

test("Semantics route is bilingual, responsibility-labeled, and activated only in its linguistic path", () => {
  const page = source("pages/tools/semantics.js");
  for (const label of ["التشابه الدلالي", "اكتشاف الموضوع", "التجميع الدلالي", "تجريب بحثي", "يظل الباحث مسؤولًا", "Research Preview"]) assert.match(page, new RegExp(label));
  assert.doesNotMatch(source("pages/ar-tools.js"), /\/tools\/semantics/);
  assert.match(source("lib/research-paths.js"), /href: "\/tools\/semantics"[^\n]+Research Preview[^\n]+تجريب بحثي/);
  assert.doesNotMatch(page, /validated|definitive|academically approved/i);
});

test("Semantics API rejects invalid input and keeps credentials server-side", async () => {
  const invalid = mockResponse();
  await semanticsHandler({ method: "POST", body: { toolId: "topic", inputs: { primary: "English only" } } }, invalid);
  assert.equal(invalid.statusCode, 400);
  const previousKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  try {
    const unavailable = mockResponse();
    await semanticsHandler({ method: "POST", body: { toolId: "topic", inputs: { primary: "هذا نص عربي." } } }, unavailable);
    assert.equal(unavailable.statusCode, 503);
  } finally {
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
  }
  assert.doesNotMatch(source("pages/tools/semantics.js"), /OPENAI_API_KEY|new OpenAI/);
});

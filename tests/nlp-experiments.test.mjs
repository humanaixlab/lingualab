import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  COMPARISON_CHOICES,
  NLP_EXPERIMENTS_STORAGE_KEY,
  NLP_EXPERIMENT_MODULES,
  SANDBOX_DECISIONS,
  createComparisonReview,
  createSandboxReview,
  parseAllowedLabels,
  readNlpExperimentReviews,
  saveNlpExperimentReview,
  validateOutputComparison,
  validatePromptExperiment,
  validateSandboxOutput,
} from "../lib/nlp-experiments.js";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
function memoryStorage() { const data = new Map(); return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }; }

test("the preview exposes exactly the three requested modules", () => {
  assert.deepEqual(NLP_EXPERIMENT_MODULES, ["prompt-experiment", "output-comparison", "task-sandbox"]);
  assert.deepEqual(COMPARISON_CHOICES, ["a", "b", "tie"]);
  assert.deepEqual(SANDBOX_DECISIONS, ["accept", "edit", "reject"]);
  const page = source("pages/tools/nlp-experiments.js");
  for (const label of ["تجربة التعليمات", "مقارنة المخرجات", "مختبر مهام NLP", "Prompt Experiment", "Model Output Comparison", "NLP Task Sandbox", "تجريب بحثي", "Research Preview", "يظل الباحث مسؤولًا"]) assert.match(page, new RegExp(label));
});

test("prompt experiments preserve both outputs and never accept an automatic winner", () => {
  const outputs = { variantA: "المخرج الأول", variantB: "المخرج الثاني" };
  assert.equal(validatePromptExperiment(outputs), true);
  assert.equal(validatePromptExperiment({ ...outputs, winner: "a" }), false);
  const review = createComparisonReview({ moduleId: "prompt-experiment", inputs: { task: "تصنيف", text: "هذا نص عربي", variantA: "أ", variantB: "ب" }, outputs, choice: "b", reason: "الدليل أوضح" });
  assert.deepEqual(review.originalOutputs, outputs);
  assert.equal(review.researcherChoice, "b");
  assert.equal(review.researcherReason, "الدليل أوضح");
});

test("model comparison evaluates required dimensions without selecting a winner", () => {
  const analysis = { categoryDecision: "اختلف القرار", textualEvidence: "الدليل أوضح في أ", explanation: "تفصيل موجز", consistency: "ب أكثر اتساقًا" };
  assert.equal(validateOutputComparison(analysis), true);
  assert.equal(validateOutputComparison({ ...analysis, winner: "a" }), false);
  const outputs = { outputA: "النص الأصلي أ", outputB: "النص الأصلي ب", analysis };
  const review = createComparisonReview({ moduleId: "output-comparison", inputs: { task: "مهمة" }, outputs, choice: "tie", reason: "الفروق محدودة" });
  assert.equal(review.originalOutputs.outputA, "النص الأصلي أ");
  assert.equal(review.originalOutputs.outputB, "النص الأصلي ب");
  assert.equal(review.researcherChoice, "tie");
});

test("sandbox enforces researcher labels and exact source evidence", () => {
  const text = "يدعم الكاتب هذا المقترح بوضوح.";
  const labels = parseAllowedLabels("مؤيد\nمعارض، محايد\nمؤيد");
  assert.deepEqual(labels, ["مؤيد", "معارض", "محايد"]);
  const valid = { label: "مؤيد", evidence: "يدعم الكاتب هذا المقترح", result: "موقف مؤيد", explanation: "الدليل صريح." };
  assert.equal(validateSandboxOutput(text, labels, valid), true);
  assert.equal(validateSandboxOutput(text, labels, { ...valid, label: "مختلط" }), false);
  assert.equal(validateSandboxOutput(text, labels, { ...valid, evidence: "دليل غير موجود" }), false);
});

test("sandbox review preserves original AI output and separate human final output", () => {
  const inputs = { taskName: "الموقف", instruction: "صنف النص", allowedLabels: ["مؤيد", "معارض"], expectedStructure: "", text: "يدعم الكاتب المقترح." };
  const aiOutput = { label: "مؤيد", evidence: "يدعم الكاتب المقترح", result: "مؤيد", explanation: "اقتراح أولي." };
  const finalOutput = { label: "معارض", evidence: "يدعم الكاتب المقترح", result: "معارض", explanation: "" };
  const review = createSandboxReview({ inputs, aiOutput, decision: "edit", finalOutput });
  assert.equal(review.aiOutput.label, "مؤيد");
  assert.equal(review.finalOutput.label, "معارض");
  assert.equal(review.researcherDecision, "edit");
  assert.equal(createSandboxReview({ inputs, aiOutput, decision: "reject", finalOutput: {} }), null);
});

test("review persistence is guarded, local-only, and bounded to 100 cases", () => {
  const storage = memoryStorage();
  const review = { moduleId: "prompt-experiment", createdAt: "2026-01-01T00:00:00.000Z" };
  for (let index = 0; index < 105; index += 1) assert.equal(saveNlpExperimentReview(review, storage).ok, true);
  assert.equal(readNlpExperimentReviews(storage).length, 100);
  assert.ok(storage.getItem(NLP_EXPERIMENTS_STORAGE_KEY));
  const blocked = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
  assert.deepEqual(readNlpExperimentReviews(blocked), []);
  assert.equal(saveNlpExperimentReview(review, blocked).ok, false);
});

test("route is activated in computational workflows and AI actions require explicit form submission", () => {
  const page = source("pages/tools/nlp-experiments.js");
  assert.match(page, /href="\/ar-tools#build"/);
  assert.match(page, /onSubmit=\{runPrompt\}/);
  assert.match(page, /onSubmit=\{runComparison\}/);
  assert.match(page, /onSubmit=\{runSandbox\}/);
  assert.doesNotMatch(page, /useEffect\s*\(|confidence|chart/i);
  assert.match(source("pages/ar-tools.js"), /link: "\/tools\/nlp-experiments"[^\n]+preview: true/);
  assert.doesNotMatch(source("lib/research-paths.js"), /\/tools\/nlp-experiments/);
});

test("server AI stays structured, uses one provider, and forbids automatic winners", () => {
  const api = source("pages/api/nlp-experiments.js");
  assert.match(api, /type: "json_schema"/);
  assert.match(api, /Do not compare variants or declare a winner/);
  assert.match(api, /Do not select a winner, score superiority/);
  assert.match(api, /Choose exactly one allowed label/);
  assert.match(api, /exact contiguous span from the input/);
  assert.doesNotMatch(pageClientSource(), /OPENAI_API_KEY|new OpenAI/);
});

function pageClientSource() { return source("pages/tools/nlp-experiments.js"); }

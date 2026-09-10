import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  CLASSIFICATION_REVIEW_DECISIONS,
  TEXT_CLASSIFICATION_MODULES,
  TEXT_CLASSIFICATION_REVIEW_STORAGE_KEY,
  createClassificationReview,
  parseLabeledRows,
  readClassificationReviews,
  saveClassificationReview,
  trainNaiveBayesBaseline,
  validateAiClassification,
} from "../lib/text-classification-research.js";
import handler from "../pages/api/text-classification-research.js";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
function memoryStorage() { const data = new Map(); return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }; }
function response() { return { statusCode: 200, headers: {}, setHeader(key, value) { this.headers[key] = value; }, status(code) { this.statusCode = code; return this; }, json(value) { this.body = value; return this; } }; }

const LABELED = [
  "الخدمة ممتازة\tإيجابي", "التجربة رائعة\tإيجابي", "المنتج مفيد\tإيجابي",
  "الخدمة سيئة\tسلبي", "التجربة مخيبة\tسلبي", "المنتج رديء\tسلبي",
].join("\n");

test("preview defines exactly the three requested computational modules", () => {
  assert.deepEqual(TEXT_CLASSIFICATION_MODULES, ["baseline", "ai-assisted", "error-analysis"]);
  const page = source("pages/tools/text-classification-research.js");
  for (const label of ["التصنيف الأساسي", "التصنيف بمساندة الذكاء الاصطناعي", "تحليل أخطاء التصنيف", "Baseline Classification", "AI-assisted Classification", "Error Analysis", "تجريب بحثي", "Research Preview", "يظل الباحث مسؤولًا"]) assert.match(page, new RegExp(label));
});

test("deterministic Naive Bayes uses only researcher-provided labeled rows and returns real evaluation values", () => {
  const rows = parseLabeledRows(LABELED);
  assert.equal(rows.length, 6);
  const result = trainNaiveBayesBaseline(rows);
  assert.equal(result.trainCount, 4);
  assert.equal(result.testCount, 2);
  assert.deepEqual(result.labels, ["إيجابي", "سلبي"]);
  assert.equal(result.confusionMatrix.flat().reduce((total, count) => total + count, 0), result.testCount);
  assert.equal(result.predictions.every((item) => item.humanLabel && item.systemPrediction && typeof item.match === "boolean"), true);
  assert.throws(() => trainNaiveBayesBaseline(rows.slice(0, 5)), /six-records/);
});

test("AI classification accepts only allowed labels and exact evidence", () => {
  const text = "أرى أن الخدمة ممتازة وسريعة.";
  const labels = ["إيجابي", "سلبي"];
  const valid = { label: "إيجابي", evidence: "الخدمة ممتازة", explanation: "يتضمن النص تقييمًا إيجابيًا صريحًا." };
  assert.equal(validateAiClassification(text, labels, valid), true);
  assert.equal(validateAiClassification(text, labels, { ...valid, label: "محايد" }), false);
  assert.equal(validateAiClassification(text, labels, { ...valid, evidence: "دليل غير موجود" }), false);
});

test("researcher review preserves original AI output and requires a separate final human result", () => {
  const text = "أرى أن الخدمة ممتازة وسريعة.";
  const labels = ["إيجابي", "سلبي"];
  const aiOutput = { label: "إيجابي", evidence: "الخدمة ممتازة", explanation: "اقتراح أولي." };
  const review = createClassificationReview({ text, allowedLabels: labels, aiOutput, decision: "edit", finalOutput: { label: "سلبي", evidence: "الخدمة ممتازة" } });
  assert.equal(review.aiOutput.label, "إيجابي");
  assert.equal(review.researcherDecision, "edit");
  assert.equal(review.finalOutput.label, "سلبي");
  assert.equal(createClassificationReview({ text, allowedLabels: labels, aiOutput, decision: "reject", finalOutput: { label: "", evidence: "" } }), null);
  assert.deepEqual(CLASSIFICATION_REVIEW_DECISIONS, ["accept", "edit", "reject"]);
});

test("classification reviews use guarded bounded localStorage only", () => {
  const storage = memoryStorage();
  const input = { text: "الخدمة ممتازة.", allowedLabels: ["إيجابي", "سلبي"], aiOutput: { label: "إيجابي", evidence: "ممتازة", explanation: "اقتراح." }, decision: "accept", finalOutput: { label: "إيجابي", evidence: "ممتازة" } };
  for (let index = 0; index < 105; index += 1) assert.equal(saveClassificationReview(createClassificationReview(input), storage).ok, true);
  assert.equal(readClassificationReviews(storage).length, 100);
  assert.ok(storage.getItem(TEXT_CLASSIFICATION_REVIEW_STORAGE_KEY));
  const blocked = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
  assert.deepEqual(readClassificationReviews(blocked), []);
  assert.equal(saveClassificationReview(createClassificationReview(input), blocked).ok, false);
});

test("route is activated in computational workflows without becoming a research path", () => {
  const page = source("pages/tools/text-classification-research.js");
  assert.match(page, /href="\/ar-tools#build"/);
  assert.match(source("pages/ar-tools.js"), /link: "\/tools\/text-classification-research"[^\n]+preview: true/);
  assert.doesNotMatch(source("lib/research-paths.js"), /\/tools\/text-classification-research/);
  assert.doesNotMatch(page, /useEffect|automatic/i);
});

test("server AI validates inputs and keeps human labels authoritative during error interpretation", async () => {
  const invalid = response();
  await handler({ method: "POST", body: { action: "classify", text: "English", allowedLabels: ["a", "b"] } }, invalid);
  assert.equal(invalid.statusCode, 400);
  const previous = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  try {
    const unavailable = response();
    await handler({ method: "POST", body: { action: "classify", text: "النص العربي", allowedLabels: ["أ", "ب"] } }, unavailable);
    assert.equal(unavailable.statusCode, 503);
  } finally {
    if (previous === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previous;
  }
  const api = source("pages/api/text-classification-research.js");
  assert.match(api, /Human reference labels are authoritative: never change, relabel, or dispute them/);
  assert.match(api, /type: "json_schema"/);
  assert.doesNotMatch(source("pages/tools/text-classification-research.js"), /OPENAI_API_KEY|new OpenAI/);
});

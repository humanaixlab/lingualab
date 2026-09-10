import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  ENTITY_CATEGORIES,
  INFORMATION_EXTRACTION_DECISIONS,
  INFORMATION_EXTRACTION_STORAGE_KEY,
  INFORMATION_EXTRACTION_TOOLS,
  createInformationExtractionReview,
  readInformationExtractionReviews,
  saveInformationExtractionReview,
  validateInformationExtractionOutput,
} from "../lib/information-extraction.js";
import handler from "../pages/api/information-extraction.js";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
function memoryStorage() { const data = new Map(); return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }; }
function response() { return { statusCode: 200, headers: {}, setHeader(key, value) { this.headers[key] = value; }, status(code) { this.statusCode = code; return this; }, json(value) { this.body = value; return this; } }; }

test("preview exposes exactly the three requested extraction modules and closed entity categories", () => {
  assert.deepEqual(Object.keys(INFORMATION_EXTRACTION_TOOLS), ["ner", "relations", "terminology"]);
  assert.deepEqual(ENTITY_CATEGORIES, ["شخص", "جهة/مؤسسة", "مكان", "تاريخ/زمن", "أخرى"]);
  const page = source("pages/tools/information-extraction.js");
  for (const label of ["التعرف على الكيانات المسماة", "استخراج العلاقات", "استخراج المصطلحات والعبارات المفتاحية", "Named Entity Recognition", "Relation Extraction", "Terminology & Keyphrase Extraction", "تجريب بحثي", "Research Preview", "يظل الباحث مسؤولًا"]) assert.match(page, new RegExp(label));
});

test("named entities must be exact source spans and use only approved categories", () => {
  const text = "زارت سارة جامعة الملك سعود في الرياض يوم الأحد.";
  const valid = { entities: [{ span: "سارة", category: "شخص" }, { span: "جامعة الملك سعود", category: "جهة/مؤسسة" }, { span: "الرياض", category: "مكان" }], explanation: "كيانات ظاهرة في النص." };
  assert.equal(validateInformationExtractionOutput("ner", text, valid), true);
  assert.equal(validateInformationExtractionOutput("ner", text, { ...valid, entities: [{ span: "جدة", category: "مكان" }] }), false);
  assert.equal(validateInformationExtractionOutput("ner", text, { ...valid, entities: [{ span: "سارة", category: "منتج" }] }), false);
});

test("relations require exact entities and evidence and cannot introduce external facts", () => {
  const text = "تعمل سارة في جامعة الملك سعود بمدينة الرياض.";
  const valid = { relations: [{ entity1: "سارة", relation: "تعمل في", entity2: "جامعة الملك سعود", evidence: "تعمل سارة في جامعة الملك سعود", explanation: "العلاقة مذكورة صراحة." }], explanation: "علاقة نصية واحدة." };
  assert.equal(validateInformationExtractionOutput("relations", text, valid), true);
  assert.equal(validateInformationExtractionOutput("relations", text, { ...valid, relations: [{ ...valid.relations[0], entity2: "وزارة التعليم" }] }), false);
  assert.equal(validateInformationExtractionOutput("relations", text, { ...valid, relations: [{ ...valid.relations[0], evidence: "معلومة خارجية" }] }), false);
});

test("terminology preserves exact meaningful source forms", () => {
  const text = "تبحث الدراسة في معالجة اللغة الطبيعية وتحليل الخطاب الرقمي.";
  const valid = { terms: [{ term: "معالجة اللغة الطبيعية", rationale: "مصطلح مركب مرتبط بمجال الدراسة." }, { term: "تحليل الخطاب الرقمي", rationale: "عبارة مفتاحية متخصصة." }], explanation: "مصطلحات مجال ظاهرة في النص." };
  assert.equal(validateInformationExtractionOutput("terminology", text, valid), true);
  assert.equal(validateInformationExtractionOutput("terminology", text, { ...valid, terms: [{ term: "التعلم العميق", rationale: "غير موجود." }] }), false);
});

test("researcher review preserves original AI output and requires a separate valid final output", () => {
  const text = "زارت سارة الرياض.";
  const aiOutput = { entities: [{ span: "سارة", category: "شخص" }, { span: "الرياض", category: "مكان" }], explanation: "اقتراح أولي." };
  const finalOutput = { entities: [{ span: "سارة", category: "شخص" }], explanation: "" };
  const review = createInformationExtractionReview({ toolId: "ner", text, aiOutput, decision: "edit", finalOutput });
  assert.equal(review.aiOutput.entities.length, 2);
  assert.equal(review.finalOutput.entities.length, 1);
  assert.equal(review.researcherDecision, "edit");
  assert.equal(createInformationExtractionReview({ toolId: "ner", text, aiOutput, decision: "reject", finalOutput: {} }), null);
  assert.deepEqual(INFORMATION_EXTRACTION_DECISIONS, ["accept", "edit", "reject"]);
});

test("review state uses guarded bounded localStorage only", () => {
  const storage = memoryStorage();
  const input = { toolId: "ner", text: "زارت سارة الرياض.", aiOutput: { entities: [{ span: "سارة", category: "شخص" }], explanation: "اقتراح." }, decision: "accept", finalOutput: { entities: [{ span: "سارة", category: "شخص" }], explanation: "اقتراح." } };
  const review = createInformationExtractionReview(input);
  for (let index = 0; index < 105; index += 1) assert.equal(saveInformationExtractionReview(review, storage).ok, true);
  assert.equal(readInformationExtractionReviews(storage).length, 100);
  assert.ok(storage.getItem(INFORMATION_EXTRACTION_STORAGE_KEY));
  const blocked = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
  assert.deepEqual(readInformationExtractionReviews(blocked), []);
  assert.equal(saveInformationExtractionReview(review, blocked).ok, false);
});

test("tool is activated in computational workflows and runs AI only after explicit submission", () => {
  const page = source("pages/tools/information-extraction.js");
  assert.match(page, /href="\/ar-tools#build"/);
  assert.match(page, /onSubmit=\{analyze\}/);
  assert.doesNotMatch(page, /useEffect|confidence|chart/i);
  assert.match(source("pages/ar-tools.js"), /link: "\/tools\/information-extraction"[^\n]+preview: true/);
  assert.doesNotMatch(source("lib/research-paths.js"), /\/tools\/information-extraction/);
});

test("server rejects invalid input and explicitly forbids external knowledge", async () => {
  const invalid = response();
  await handler({ method: "POST", body: { toolId: "ner", text: "English only" } }, invalid);
  assert.equal(invalid.statusCode, 400);
  const previous = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  try {
    const unavailable = response();
    await handler({ method: "POST", body: { toolId: "ner", text: "زارت سارة الرياض." } }, unavailable);
    assert.equal(unavailable.statusCode, 503);
  } finally {
    if (previous === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previous;
  }
  const api = source("pages/api/information-extraction.js");
  assert.match(api, /never add external knowledge or real-world facts/i);
  assert.match(api, /exact contiguous copy from the source text/);
  assert.match(api, /type: "json_schema"/);
  assert.doesNotMatch(source("pages/tools/information-extraction.js"), /OPENAI_API_KEY|new OpenAI/);
});

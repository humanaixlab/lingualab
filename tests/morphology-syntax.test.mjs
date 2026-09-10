import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  MORPHOLOGY_SYNTAX_DECISIONS,
  MORPHOLOGY_SYNTAX_STORAGE_KEY,
  MORPHOLOGY_SYNTAX_TOOLS,
  createMorphologySyntaxReview,
  readMorphologySyntaxReviews,
  saveMorphologySyntaxReview,
  validateMorphologySyntaxOutput,
} from "../lib/morphology-syntax.js";
import handler from "../pages/api/morphology-syntax.js";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
function memoryStorage() { const data = new Map(); return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }; }
function response() { return { statusCode: 200, headers: {}, setHeader(key, value) { this.headers[key] = value; }, status(code) { this.statusCode = code; return this; }, json(value) { this.body = value; return this; } }; }

test("one canonical preview contains exactly two sections and three approved tools in each", () => {
  assert.deepEqual(Object.keys(MORPHOLOGY_SYNTAX_TOOLS), ["lemmatization", "morphological-features", "word-structure", "pos", "syntactic-relations", "sentence-structure"]);
  assert.deepEqual(Object.values(MORPHOLOGY_SYNTAX_TOOLS).filter((tool) => tool.section === "morphology").map((tool) => tool.id), ["lemmatization", "morphological-features", "word-structure"]);
  assert.deepEqual(Object.values(MORPHOLOGY_SYNTAX_TOOLS).filter((tool) => tool.section === "syntax").map((tool) => tool.id), ["pos", "syntactic-relations", "sentence-structure"]);
  const page = source("pages/tools/morphology-syntax.js");
  for (const label of ["التحليل الصرفي", "الإرجاع إلى الصيغة المعجمية", "السمات الصرفية", "بنية الكلمة", "التحليل النحوي", "أقسام الكلام", "العلاقات النحوية", "البنية التركيبية للجملة", "Research Preview", "تجريب بحثي"]) assert.match(page, new RegExp(label));
});

test("morphological outputs preserve the original token and reject unsupported evidence", () => {
  const inputs = { text: "كتب الباحثون النتائج بعناية.", token: "الباحثون", firstElement: "", secondElement: "" };
  const lemma = { original: "الباحثون", lemma: "باحث", evidence: "الباحثون", explanation: "صيغة جمع لكلمة باحث.", uncertain: false };
  assert.equal(validateMorphologySyntaxOutput("lemmatization", inputs, lemma), true);
  assert.equal(validateMorphologySyntaxOutput("lemmatization", inputs, { ...lemma, original: "باحث" }), false);
  assert.equal(validateMorphologySyntaxOutput("lemmatization", inputs, { ...lemma, evidence: "كلمة غير موجودة" }), false);
  const features = { original: "الباحثون", evidence: "الباحثون", features: { gender: "مذكر", number: "جمع", definiteness: "معرفة", person: "", tenseAspect: "", voice: "" }, explanation: "تدعم الصيغة هذه السمات." };
  assert.equal(validateMorphologySyntaxOutput("morphological-features", inputs, features), true);
});

test("word structure and syntax require grounded source spans and explicit uncertainty", () => {
  const wordInputs = { text: "وبالمدرسة تعلم الطلاب.", token: "وبالمدرسة", firstElement: "", secondElement: "" };
  const structure = { original: "وبالمدرسة", prefixes: ["و", "ب", "ال"], stem: "مدرسة", suffixes: [], evidence: "وبالمدرسة", explanation: "تقسيم مقترح.", uncertain: true };
  assert.equal(validateMorphologySyntaxOutput("word-structure", wordInputs, structure), true);
  assert.equal(validateMorphologySyntaxOutput("word-structure", wordInputs, { ...structure, prefixes: ["س"] }), false);
  const relationInputs = { text: "قرأ الطالب الكتاب.", token: "", firstElement: "الطالب", secondElement: "الكتاب" };
  const relation = { firstElement: "الطالب", secondElement: "الكتاب", relation: "فاعل وفعل مع مفعول به", evidence: "الطالب ثم الكتاب", explanation: "العنصران مرتبطان بالفعل قرأ." };
  assert.equal(validateMorphologySyntaxOutput("syntactic-relations", relationInputs, relation), false);
  assert.equal(validateMorphologySyntaxOutput("syntactic-relations", relationInputs, { ...relation, evidence: "قرأ الطالب الكتاب" }), true);
  const sentence = { text: "قرأ الطالب الكتاب.", token: "", firstElement: "", secondElement: "" };
  assert.equal(validateMorphologySyntaxOutput("sentence-structure", sentence, { constituents: [{ label: "فعل", span: "قرأ" }, { label: "فاعل", span: "الطالب" }], explanation: "مكوّنان رئيسان.", uncertain: false }), true);
});

test("research review preserves original AI output and requires a separate valid final output", () => {
  const inputs = { text: "كتب الباحث التقرير.", token: "كتب", firstElement: "", secondElement: "" };
  const aiOutput = { original: "كتب", category: "فعل ماضٍ", evidence: "كتب", explanation: "السياق يدعم الفعل الماضي.", uncertain: false };
  const finalOutput = { ...aiOutput, category: "فعل" };
  const review = createMorphologySyntaxReview({ toolId: "pos", inputs, aiOutput, decision: "edit", finalOutput });
  assert.equal(review.aiOutput.category, "فعل ماضٍ");
  assert.equal(review.finalOutput.category, "فعل");
  assert.equal(review.researcherDecision, "edit");
  assert.equal(createMorphologySyntaxReview({ toolId: "pos", inputs, aiOutput, decision: "reject", finalOutput: {} }), null);
  assert.deepEqual(MORPHOLOGY_SYNTAX_DECISIONS, ["accept", "edit", "reject"]);
});

test("reviewed cases use guarded bounded localStorage only", () => {
  const storage = memoryStorage();
  const inputs = { text: "كتب الباحث التقرير.", token: "كتب", firstElement: "", secondElement: "" };
  const aiOutput = { original: "كتب", category: "فعل", evidence: "كتب", explanation: "اقتراح.", uncertain: false };
  const review = createMorphologySyntaxReview({ toolId: "pos", inputs, aiOutput, decision: "accept", finalOutput: aiOutput });
  for (let index = 0; index < 105; index += 1) assert.equal(saveMorphologySyntaxReview(review, storage).ok, true);
  assert.equal(readMorphologySyntaxReviews(storage).length, 100);
  assert.ok(storage.getItem(MORPHOLOGY_SYNTAX_STORAGE_KEY));
  const blocked = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
  assert.deepEqual(readMorphologySyntaxReviews(blocked), []);
  assert.equal(saveMorphologySyntaxReview(review, blocked).ok, false);
});

test("preview is activated only inside Morphology & Syntax and existing POS stays independent", () => {
  assert.doesNotMatch(source("pages/ar-tools.js"), /\/tools\/morphology-syntax/);
  assert.match(source("lib/research-paths.js"), /href: "\/tools\/morphology-syntax"[^\n]+Research Preview[^\n]+تجريب بحثي/);
  assert.match(source("pages/tools/pos.js"), /backHref="\/tools\/analyze"/);
  const page = source("pages/tools/morphology-syntax.js");
  assert.doesNotMatch(page, /useEffect|confidence|chart/i);
  assert.match(page, /onSubmit=\{analyze\}/);
});

test("server validates Arabic inputs, grounds evidence, and keeps credentials server-side", async () => {
  const invalid = response();
  await handler({ method: "POST", body: { toolId: "pos", inputs: { text: "English text", token: "text" } } }, invalid);
  assert.equal(invalid.statusCode, 400);
  const previous = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  try {
    const unavailable = response();
    await handler({ method: "POST", body: { toolId: "pos", inputs: { text: "كتب الباحث.", token: "كتب" } } }, unavailable);
    assert.equal(unavailable.statusCode, 503);
  } finally {
    if (previous === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previous;
  }
  const api = source("pages/api/morphology-syntax.js");
  assert.match(api, /Every evidence\/span value must be an exact contiguous copy/);
  assert.match(api, /Use an empty string for every unsupported or inapplicable feature/);
  assert.match(api, /type: "json_schema"/);
  assert.doesNotMatch(source("pages/tools/morphology-syntax.js"), /OPENAI_API_KEY|new OpenAI/);
});

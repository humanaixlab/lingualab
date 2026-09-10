import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  DISCOURSE_REVIEW_STORAGE_KEY,
  DISCOURSE_TOOLS,
  createReviewedCase,
  readReviewedCases,
  saveReviewedCase,
  validateDiscourseAiOutput,
} from "../lib/discourse-analysis.js";
import discourseHandler from "../pages/api/discourse-analysis.js";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

function mockResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; },
  };
}

test("the three research-preview tools expose only their approved closed categories", () => {
  assert.deepEqual(Object.keys(DISCOURSE_TOOLS), ["stance", "hedging-assertion", "discourse-relations"]);
  assert.deepEqual(DISCOURSE_TOOLS.stance.categories, ["مؤيد", "معارض", "محايد"]);
  assert.deepEqual(DISCOURSE_TOOLS["hedging-assertion"].categories, ["تحفظ", "توكيد", "لا يوجد"]);
  assert.deepEqual(DISCOURSE_TOOLS["discourse-relations"].categories, ["سبب", "نتيجة", "استدراك", "مقارنة", "إضافة", "تفسير", "لا توجد علاقة واضحة"]);
  assert.doesNotMatch(JSON.stringify(DISCOURSE_TOOLS), /confidence|stanceHolder|intensity/i);
});

test("evidence validation accepts exact source spans and rejects invented evidence", () => {
  const text = "أؤيد المقترح لأنه يحسن الوصول إلى المعرفة.";
  const valid = { category: "مؤيد", evidence: { primary: "أؤيد المقترح", secondary: "" }, explanation: "يعرض النص تأييدًا صريحًا." };
  assert.equal(validateDiscourseAiOutput("stance", text, valid), true);
  assert.equal(validateDiscourseAiOutput("stance", text, { ...valid, evidence: { primary: "يدعم الباحث المقترح", secondary: "" } }), false);

  const relation = { category: "سبب", evidence: { primary: "أؤيد المقترح", secondary: "لأنه يحسن الوصول إلى المعرفة" }, explanation: "تربط الأداة بين الرأي وسببه." };
  assert.equal(validateDiscourseAiOutput("discourse-relations", text, relation), true);
  assert.equal(validateDiscourseAiOutput("discourse-relations", text, { ...relation, evidence: { ...relation.evidence, secondary: "سبب غير موجود" } }), false);
});

test("researcher decisions preserve original AI output and always require a final result", () => {
  const text = "لكن النتيجة تحتاج إلى مراجعة.";
  const aiOutput = { category: "استدراك", evidence: { primary: "لكن", secondary: "النتيجة تحتاج إلى مراجعة" }, explanation: "تظهر علاقة استدراكية." };
  for (const decision of ["accept", "edit", "reject"]) {
    const record = createReviewedCase({ toolId: "discourse-relations", text, aiOutput, decision, finalOutput: aiOutput });
    assert.equal(record.researcherDecision, decision);
    assert.deepEqual(record.aiOutput, aiOutput);
    assert.equal(record.finalOutput.category, aiOutput.category);
  }
  assert.equal(createReviewedCase({ toolId: "discourse-relations", text, aiOutput, decision: "reject", finalOutput: { category: "", evidence: { primary: "", secondary: "" } } }), null);
  assert.match(source("pages/tools/discourse-analysis.js"), /decision === "edit" \|\| decision === "reject"/);
});

test("reviewed cases use guarded localStorage and retain at most 100 records", () => {
  const storage = memoryStorage();
  const text = "أؤيد هذا القرار.";
  const aiOutput = { category: "مؤيد", evidence: { primary: "أؤيد", secondary: "" }, explanation: "موقف صريح." };
  for (let index = 0; index < 105; index += 1) {
    const record = createReviewedCase({ toolId: "stance", text, target: "القرار", aiOutput, decision: "accept", finalOutput: aiOutput });
    assert.equal(saveReviewedCase(record, storage).ok, true);
  }
  assert.equal(readReviewedCases(storage).length, 100);
  assert.ok(storage.getItem(DISCOURSE_REVIEW_STORAGE_KEY));
  const blocked = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
  assert.deepEqual(readReviewedCases(blocked), []);
  assert.equal(saveReviewedCase(createReviewedCase({ toolId: "stance", text, target: "القرار", aiOutput, decision: "accept", finalOutput: aiOutput }), blocked).ok, false);
});

test("Discourse & Pragmatics is the single canonical path for the research preview", () => {
  const page = source("pages/tools/discourse-analysis.js");
  const hub = source("pages/ar-tools.js");
  const paths = source("lib/research-paths.js");
  const api = source("pages/api/discourse-analysis.js");
  for (const label of ["تحليل الموقف", "التحفظ والتوكيد", "العلاقات الخطابية", "تجريب بحثي", "قبول", "تعديل", "رفض"])
    assert.match(page, new RegExp(label));
  assert.doesNotMatch(hub, /key: "discourse"|key: "discoursePreview"|link: "\/tools\/discourse-analysis"/);
  assert.match(paths, /id: "discourse-pragmatics"[\s\S]*?href: "\/tools\/discourse-analysis"/);
  assert.match(paths, /Discourse Analysis · Research Preview/);
  assert.match(paths, /تحليل الخطاب · تجريب بحثي/);
  assert.match(api, /type: "json_schema"/);
  assert.match(api, /validateDiscourseAiOutput/);
  assert.doesNotMatch(page, /validated|production-ready|academically approved/i);
});

test("API rejects invalid Arabic input and keeps provider credentials server-side", async () => {
  const invalid = mockResponse();
  await discourseHandler({ method: "POST", body: { toolId: "stance", text: "English only", target: "topic" } }, invalid);
  assert.equal(invalid.statusCode, 400);

  const previousKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  try {
    const unavailable = mockResponse();
    await discourseHandler({ method: "POST", body: { toolId: "stance", text: "أؤيد هذا المقترح.", target: "المقترح" } }, unavailable);
    assert.equal(unavailable.statusCode, 503);
  } finally {
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
  }
  assert.doesNotMatch(source("pages/tools/discourse-analysis.js"), /OPENAI_API_KEY|new OpenAI/);
});

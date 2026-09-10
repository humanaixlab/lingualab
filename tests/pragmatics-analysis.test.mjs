import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  PRAGMATICS_REVIEW_STORAGE_KEY,
  PRAGMATICS_TOOLS,
  createPragmaticsReviewedCase,
  readPragmaticsReviewedCases,
  savePragmaticsReviewedCase,
  validatePragmaticsOutput,
} from "../lib/pragmatics-analysis.js";
import pragmaticsHandler from "../pages/api/pragmatics.js";
import { RESEARCH_PATHS } from "../lib/research-paths.js";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
function memoryStorage() { const data = new Map(); return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }; }
function mockResponse() { return { statusCode: 200, headers: {}, setHeader(key, value) { this.headers[key] = value; }, status(code) { this.statusCode = code; return this; }, json(value) { this.body = value; return this; } }; }

test("the Pragmatics preview exposes exactly three closed taxonomies", () => {
  assert.deepEqual(Object.keys(PRAGMATICS_TOOLS), ["speech-acts", "implicature", "deixis"]);
  assert.deepEqual(PRAGMATICS_TOOLS["speech-acts"].categories, ["طلب", "اقتراح", "وعد", "اعتذار", "شكر", "تحذير", "لا يوجد فعل كلامي واضح"]);
  assert.deepEqual(PRAGMATICS_TOOLS.implicature.categories, ["يوجد استلزام", "لا يوجد استلزام واضح"]);
  assert.deepEqual(PRAGMATICS_TOOLS.deixis.categories, ["شخص", "مكان", "زمان", "لا توجد إشارة واضحة"]);
});

test("pragmatics output requires exact evidence and grounded interpretation", () => {
  const text = "سأعود إلى هنا غدًا، فانتظرني.";
  const output = { category: "زمان", evidence: "غدًا", interpretation: "اليوم التالي لوقت التلفظ", explanation: "يتحدد المرجع بزمن القول." };
  assert.equal(validatePragmaticsOutput("deixis", text, output), true);
  assert.equal(validatePragmaticsOutput("deixis", text, { ...output, evidence: "في الأسبوع القادم" }), false);
  assert.equal(validatePragmaticsOutput("implicature", text, { category: "لا يوجد استلزام واضح", evidence: "", interpretation: "", explanation: "لا يظهر معنى مستلزم واضح." }), true);
});

test("researcher modification and rejection preserve AI output separately", () => {
  const text = "هل يمكنك إغلاق الباب؟";
  const aiOutput = { category: "طلب", evidence: "هل يمكنك إغلاق الباب؟", interpretation: "", explanation: "صيغة استفهام تؤدي طلبًا." };
  for (const decision of ["accept", "edit", "reject"]) {
    const finalOutput = decision === "accept" ? aiOutput : { category: "اقتراح", evidence: "هل يمكنك إغلاق الباب؟", interpretation: "" };
    const record = createPragmaticsReviewedCase({ toolId: "speech-acts", text, aiOutput, decision, finalOutput });
    assert.equal(record.aiOutput.category, "طلب");
    assert.equal(record.researcherDecision, decision);
    assert.equal(record.finalOutput.category, decision === "accept" ? "طلب" : "اقتراح");
  }
  assert.equal(createPragmaticsReviewedCase({ toolId: "speech-acts", text, aiOutput, decision: "reject", finalOutput: { category: "", evidence: "", interpretation: "" } }), null);
});

test("reviewed Pragmatics cases use guarded bounded localStorage", () => {
  const storage = memoryStorage();
  const text = "شكرًا لك على المساعدة.";
  const aiOutput = { category: "شكر", evidence: "شكرًا", interpretation: "", explanation: "فعل شكر صريح." };
  for (let index = 0; index < 105; index += 1) savePragmaticsReviewedCase(createPragmaticsReviewedCase({ toolId: "speech-acts", text, aiOutput, decision: "accept", finalOutput: aiOutput }), storage);
  assert.equal(readPragmaticsReviewedCases(storage).length, 100);
  assert.ok(storage.getItem(PRAGMATICS_REVIEW_STORAGE_KEY));
  const blocked = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
  assert.deepEqual(readPragmaticsReviewedCases(blocked), []);
  assert.equal(savePragmaticsReviewedCase(createPragmaticsReviewedCase({ toolId: "speech-acts", text, aiOutput, decision: "accept", finalOutput: aiOutput }), blocked).ok, false);
});

test("canonical Discourse & Pragmatics path exposes both previews without a general-tools section", () => {
  const path = RESEARCH_PATHS.find((item) => item.id === "discourse-pragmatics");
  assert.deepEqual(path.available.map((tool) => tool.href), ["/tools/discourse-analysis", "/tools/pragmatics"]);
  const hub = source("pages/ar-tools.js");
  assert.doesNotMatch(hub, /key: "pragmatics"|link: "\/tools\/pragmatics"/);
  const page = source("pages/tools/pragmatics.js");
  for (const label of ["الأفعال الكلامية", "الاستلزام الحواري", "الإشارة والسياق", "تجريب بحثي", "قبول", "تعديل", "رفض"]) assert.match(page, new RegExp(label));
});

test("Pragmatics API validates Arabic input and retains server-side credentials", async () => {
  const invalid = mockResponse();
  await pragmaticsHandler({ method: "POST", body: { toolId: "speech-acts", text: "English only" } }, invalid);
  assert.equal(invalid.statusCode, 400);
  const previousKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  try {
    const unavailable = mockResponse();
    await pragmaticsHandler({ method: "POST", body: { toolId: "speech-acts", text: "شكرًا لك." } }, unavailable);
    assert.equal(unavailable.statusCode, 503);
  } finally {
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
  }
  assert.doesNotMatch(source("pages/tools/pragmatics.js"), /OPENAI_API_KEY|new OpenAI/);
});

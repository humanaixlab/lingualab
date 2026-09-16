import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {
  ALGORITHM_FAMILIES,
  ALGORITHM_STEPS,
  BUILDER_MODES,
  PHENOMENA,
  PHENOMENON_DOMAINS,
  RESEARCH_STEPS,
  buildMachineRepresentation,
  buildResearchPackage,
  buildRuleAlgorithmPackage,
  changePhenomenon,
  createNlpBuilderState,
  readNlpBuilderState,
  saveNlpBuilderState,
  validateBuilderStep,
} from "../lib/nlp-builder.js";

const source = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("NLP Builder exposes two complete nine-step building paths", () => {
  assert.deepEqual(BUILDER_MODES.map((mode) => mode.id), ["research-task", "linguistic-algorithm"]);
  assert.equal(RESEARCH_STEPS.length, 9);
  assert.equal(ALGORITHM_STEPS.length, 9);
  assert.equal(PHENOMENON_DOMAINS.length, 8);
  assert.ok(PHENOMENA.some((item) => item.id === "semantic-similarity"));
  assert.ok(PHENOMENA.some((item) => item.domain === "text-classification"));
  assert.ok(PHENOMENA.some((item) => item.id === "custom"));
  assert.ok(ALGORITHM_FAMILIES.some((item) => item.id === "rule-based"));
  assert.ok(ALGORITHM_FAMILIES.some((item) => item.id === "hybrid"));
});

test("the Arabic NER example progresses from tokens to an explicitly illustrative BIO representation", () => {
  const state = createNlpBuilderState();
  const view = buildMachineRepresentation(state);
  assert.deepEqual(view.tokens.slice(0, 7), ["زار", "خالد", "جامعة", "الملك", "سعود", "في", "الرياض"]);
  assert.deepEqual(view.illustrativeLabels.slice(0, 7), ["O", "B-PER", "B-ORG", "I-ORG", "I-ORG", "O", "B-LOC"]);
  assert.match(view.python, /Illustrative only/);
  assert.match(view.python, /REVIEW|B-PER/);
});

test("research-task output reflects phenomenon choices without inventing results", () => {
  let state = changePhenomenon(createNlpBuilderState(), "speech-acts");
  state = { ...state, example: "هل تستطيع إغلاق النافذة؟", unit: "utterance", algorithmFamily: "hybrid", metrics: ["macro-f1", "agreement"] };
  const pack = buildResearchPackage(state, "ar");
  assert.equal(pack.status, "planned-computational-design");
  assert.equal(pack.computationalTask.id, "text-classification");
  assert.ok(pack.dataSchema.includes("directness"));
  assert.deepEqual(pack.annotation.labels, ["REQUEST", "QUESTION", "PROMISE", "APOLOGY"]);
  assert.match(pack.computationalDesignSummary, /ملخص تصميم حاسوبي/);
  assert.match(pack.computationalDesignSummary, /ليس منهجية دراسة مكتملة/);
  assert.doesNotMatch(pack.computationalDesignSummary, /حقق|دقة بلغت|نتائج التجربة/);
  assert.equal("methodology" in pack, false);
});

test("speech-act design preserves the distinction between surface form and pragmatic function", () => {
  const state = changePhenomenon(createNlpBuilderState(), "speech-acts");
  const view = buildMachineRepresentation(state);
  assert.equal(state.example, "هل تستطيع إغلاق النافذة؟");
  assert.equal(view.layeredAnnotation.surface_form, "QUESTION");
  assert.equal(view.layeredAnnotation.speech_act, "REQUEST");
  assert.equal(view.layeredAnnotation.directness, "INDIRECT");
  assert.match(view.layeredAnnotation.status, /illustrative/);
});

test("custom phenomena and draft state persist safely", () => {
  const store = new Map();
  const storage = { getItem: (key) => store.get(key) || null, setItem: (key, value) => store.set(key, value) };
  const state = { ...changePhenomenon(createNlpBuilderState(), "custom"), customPhenomenon: "ظاهرة مخصصة", labelsText: "A\nB" };
  assert.equal(saveNlpBuilderState(storage, state).ok, true);
  const restored = readNlpBuilderState(storage);
  assert.equal(restored.customPhenomenon, "ظاهرة مخصصة");
  assert.equal(restored.phenomenonId, "custom");
  assert.equal(validateBuilderStep({ ...restored, step: 0 }), true);
});

test("malformed persisted selections and AI review fall back without breaking the builder", () => {
  const store = new Map([["lingualab-nlp-builder-v1", JSON.stringify({ ...createNlpBuilderState(), unit: "unsafe", task: "invented", algorithmFamily: "invented", aiReview: { summary: "broken" } })]]);
  const restored = readNlpBuilderState({ getItem: (key) => store.get(key) });
  assert.equal(restored.unit, "token");
  assert.equal(restored.task, "ner");
  assert.equal(restored.algorithmFamily, "rule-based");
  assert.equal(restored.aiReview, null);
});

test("linguistic-rule design preserves conditions, exceptions, REVIEW, tests, and TODO code", () => {
  const state = {
    ...createNlpBuilderState(), mode: "linguistic-algorithm", ruleDomain: "morphology", ruleName: "رصد جمع مذكر سالم محتمل",
    ruleDescription: "قاعدة أولية تحتاج إلى سياق وتحليل معجمي", ruleUnit: "word", positiveExamples: "المعلمون", negativeExamples: "هارون",
    conditions: "تنتهي الوحدة بـ ون\nللصيغة تحليل اسمي موثق", exceptions: "أسماء الأعلام\nغياب السياق", testCases: "معلمون دون سياق => REVIEW",
  };
  const pack = buildRuleAlgorithmPackage(state, "ar");
  assert.equal(pack.status, "planned-and-unimplemented");
  assert.equal(pack.conditions.length, 2);
  assert.ok(pack.tests.some((item) => item.expected === "MATCH"));
  assert.ok(pack.tests.some((item) => item.expected === "NO_MATCH"));
  assert.ok(pack.tests.some((item) => item.expected === "REVIEW"));
  assert.match(pack.pseudocode.join("\n"), /أعد REVIEW/);
  assert.match(pack.pythonStarter, /TODO C1/);
  assert.match(pack.pythonStarter, /Decision\("REVIEW"/);
  assert.match(pack.computationalDesignSummary, /لا تمثل حكمًا لغويًا نهائيًا/);
  assert.equal("methodology" in pack, false);
});

test("the page is bilingual, editable, exportable, and keeps AI review optional", () => {
  const page = source("pages/tools/nlp-builder.js");
  const builder = source("lib/nlp-builder.js");
  const api = source("pages/api/nlp-builder.js");
  const hub = source("pages/research-planner.js");
  assert.match(page, /بناء المعالجة اللغوية حاسوبيًا/);
  assert.match(builder, /Design a linguistic algorithm/);
  assert.match(page, /How does the machine see this/);
  assert.match(page, /index > state\.maxStep/);
  assert.match(page, /familyAdvantage/);
  assert.match(page, /downloadCsv/);
  assert.match(page, /Accept review|قبول المراجعة/);
  assert.match(page, /fetchAiJson\("\/api\/nlp-builder"/);
  assert.match(api, /createOpenAiOutput/);
  assert.match(api, /Do not invent corpus sources/);
  assert.match(hub, /\/tools\/nlp-builder/);
});

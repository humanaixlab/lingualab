import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { buildRuleAlgorithmPackage, createNlpBuilderState } from "../lib/nlp-builder.js";
import { DEBUG_CATEGORIES, GUIDE_LEVELS, buildGuideContext, buildProgrammingBridge, currentStageGuidance, detectBuilderIssues, recordGuideDecision } from "../lib/nlp-builder-guide.js";

const algorithmState = (patch = {}) => ({
  ...createNlpBuilderState(), mode: "linguistic-algorithm", step: 3,
  ruleName: "قاعدة المطابقة", ruleDescription: "تفحص المطابقة داخل نطاق محدد", ruleUnit: "sentence",
  conditions: "يتطابق العدد\nيتطابق الجنس", exceptions: "التنسيق يحتاج مراجعة",
  positiveExamples: "حضرت الطالبة", negativeExamples: "حضر الطالبات", testCases: "غاب الفاعل => REVIEW",
  ...patch,
});

test("Smart Guide knows the current structured state and changes explanation level only", () => {
  const state = algorithmState();
  const beginner = currentStageGuidance(state, "beginner", "ar");
  const technical = currentStageGuidance(state, "technical", "ar");
  assert.equal(GUIDE_LEVELS.length, 3);
  assert.equal(beginner.stage, "الشروط");
  assert.notEqual(beginner.levelNote, technical.levelNote);
  assert.deepEqual(state, algorithmState());
  assert.doesNotMatch(JSON.stringify(beginner), /مزيد من التفاصيل|more details/i);
  const context = buildGuideContext(state, buildRuleAlgorithmPackage(state, "ar"));
  assert.equal(context.mode, "linguistic-algorithm");
  assert.equal(context.phenomenonOrRule, "قاعدة المطابقة");
  assert.equal(context.unitOfAnalysis, "sentence");
  assert.ok(Array.isArray(context.conditions) && "pythonStarterCode" in context && "dependencies" in context && "researcherDecisions" in context);
});

test("Smart Guide detects missing feature sources, dependencies, ambiguity, and code/spec divergence", () => {
  const state = algorithmState({
    requiredFeatures: "subject_gender\nword_order", featureSources: "manual annotation",
    dependencies: "find_subject | placeholder", exceptions: "", decisionOutput: "MATCH / NO_MATCH",
    pythonDraft: "# C1\n# C3\nreturn 'MATCH'",
  });
  const pack = buildRuleAlgorithmPackage(state, "ar");
  const issues = detectBuilderIssues(state, pack, "ar");
  assert.deepEqual(new Set(issues.map((item) => item.category)), new Set(["missing-feature", "missing-dependency", "linguistic-ambiguity", "missing-exception", "code-spec-divergence"]));
  for (const issue of issues) {
    assert.equal(issue.provenance.source, "smart-guide-suggestion");
    assert.equal(issue.provenance.status, "pending");
    assert.ok(issue.simpler && issue.reason && issue.example && issue.impact);
  }
});

test("Smart Guide identifies an out-of-scope test whose boundary was not defined", () => {
  const state = algorithmState({ ruleDescription: "قاعدة عامة", testCases: "صيغة لهجية => OUTSIDE_SCOPE" });
  const issues = detectBuilderIssues(state, buildRuleAlgorithmPackage(state, "ar"), "ar");
  assert.ok(issues.some((item) => item.category === "out-of-scope-input"));
});

test("Guide suggestions do not apply until the researcher records a decision and provenance remains intact", () => {
  const state = algorithmState();
  const accepted = recordGuideDecision(state, "missing-dependency", "accepted");
  assert.equal(state.guideDecisions.length, 0);
  assert.equal(accepted.guideDecisions[0].source, "smart-guide-suggestion");
  assert.equal(accepted.guideDecisions[0].status, "accepted");
  const modified = recordGuideDecision(accepted, "missing-dependency", "modified", "استخدم محللًا خارجيًا مراجعًا");
  assert.equal(modified.guideDecisions[0].status, "modified");
  assert.match(modified.guideDecisions[0].modifiedText, /محللًا خارجيًا/);
});

test("Beginner bridge connects the same rule to logic, pseudocode, Python, traceability, and a decision trace", () => {
  const state = algorithmState({ requiredFeatures: "subject_gender", featureSources: "manual" });
  const pack = buildRuleAlgorithmPackage(state, "ar");
  const bridge = buildProgrammingBridge(state, pack, "ar");
  assert.match(bridge.python, /Generated from C1/);
  assert.equal(bridge.trace.ruleId, "C1");
  assert.equal(bridge.trace.status, "placeholder");
  assert.ok(bridge.explanation.some((item) => /متغير/.test(item)));
  assert.match(bridge.decisionTrace.at(-1), /النتيجة وفق القاعدة الحالية/);
  for (const category of ["programming-error", "missing-dependency", "missing-feature", "linguistic-ambiguity", "code-spec-divergence"]) assert.ok(DEBUG_CATEGORIES.includes(category));
});

test("Builder UI keeps Arabic RTL, Python LTR, three guide levels, and explicit beginner actions", () => {
  const page = fs.readFileSync(new URL("../pages/tools/nlp-builder.js", import.meta.url), "utf8");
  const css = fs.readFileSync(new URL("../styles/NlpBuilder.module.css", import.meta.url), "utf8");
  for (const text of ["المرشد الذكي لبناء الخوارزمية", "اشرحها بصورة أبسط", "وضّح لي بمثال", "لا أعرف كيف أحوّل هذه الخطوة إلى كود", "كيف اتخذت الخوارزمية هذا القرار؟"]) assert.match(page, new RegExp(text));
  assert.match(page, /dir=\"ltr\" value=\{state\.pythonDraft/);
  assert.match(page, /dir=\{locale === \"ar\" \? \"rtl\" : \"ltr\"\}/);
  assert.match(css, /\.codeEditor[^}]*direction: ltr/);
});

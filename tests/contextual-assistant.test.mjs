import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { ASSISTANT_RESEARCH_PATHS, ASSISTANT_ROUTES, getAssistantGuidance } from "../lib/assistant-guidance.js";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const expectedRoutes = [
  "/",
  "/workspace",
  "/tools/analyze",
  "/tools/frequency",
  "/tools/concordance",
  "/tools/ngrams",
  "/tools/pos",
  "/research-advisor",
  "/ar-tools",
  "/research-report",
  "/tools/prompt",
  "/tools/code",
  "/tools/excel",
  "/tools/colab",
  "/student-dashboard",
];

test("contextual assistant covers every requested core and tool route", () => {
  for (const route of expectedRoutes) {
    assert.ok(ASSISTANT_ROUTES.includes(route), `missing assistant route: ${route}`);
    assert.ok(getAssistantGuidance(route, "en"));
    assert.ok(getAssistantGuidance(route, "ar"));
  }
  assert.equal(getAssistantGuidance("/unrelated", "en"), null);
});

test("each page context provides four equivalent bilingual questions", () => {
  for (const route of expectedRoutes) {
    const english = getAssistantGuidance(route, "en");
    const arabic = getAssistantGuidance(route, "ar");
    assert.equal(english.contextId, arabic.contextId);
    assert.equal(english.suggestions.length, 4);
    assert.equal(arabic.suggestions.length, 4);
    for (const suggestion of [...english.suggestions, ...arabic.suggestions]) {
      assert.ok(suggestion.question.length > 10);
      assert.ok(suggestion.answer.length > 20);
    }
  }
});

test("technical guidance is attached to the relevant analysis page", () => {
  assert.match(getAssistantGuidance("/tools/ngrams", "ar").suggestions[0].question, /Bigrams.*Trigrams/);
  assert.match(getAssistantGuidance("/tools/pos", "en").suggestions[0].question, /POS/);
  assert.match(getAssistantGuidance("/research-report", "ar").suggestions[2].question, /Macro-F1.*Confusion Matrix/);
  assert.match(getAssistantGuidance("/tools/frequency", "en").suggestions[2].question, /raw.*normalized frequency/i);
});

test("home and Research Hub receive distinct page-specific guidance", () => {
  assert.equal(getAssistantGuidance("/", "en").contextId, "home");
  assert.equal(getAssistantGuidance("/ar-tools", "ar").contextId, "research");
  assert.match(getAssistantGuidance("/", "ar").suggestions[0].question, /أبدأ/);
  assert.match(getAssistantGuidance("/ar-tools", "en").suggestions[0].question, /research stage/i);
});

test("invalid language values safely use English guidance", () => {
  assert.deepEqual(
    getAssistantGuidance("/workspace", "unsupported").suggestions,
    getAssistantGuidance("/workspace", "en").suggestions,
  );
});

test("all seven research paths provide distinct bilingual contextual guidance", () => {
  assert.deepEqual(ASSISTANT_RESEARCH_PATHS, [
    "corpus-linguistics",
    "text-classification",
    "morphology-syntax",
    "semantics",
    "discourse-pragmatics",
    "information-extraction",
    "language-technology",
  ]);
  for (const pathId of ASSISTANT_RESEARCH_PATHS) {
    const english = getAssistantGuidance("/ar-tools", "en", { pathId });
    const arabic = getAssistantGuidance("/ar-tools", "ar", { pathId });
    assert.equal(english.pathId, pathId);
    assert.equal(arabic.pathId, pathId);
    assert.equal(english.suggestions.length, 4);
    assert.equal(arabic.suggestions.length, 4);
  }
  assert.match(getAssistantGuidance("/ar-tools", "en", { pathId: "corpus-linguistics" }).suggestions[1].question, /Frequency.*Concordance/);
  assert.match(getAssistantGuidance("/ar-tools", "ar", { pathId: "language-technology" }).suggestions[3].question, /Colab/);
});

test("Beginner and Advanced levels produce different bounded guidance", () => {
  const beginner = getAssistantGuidance("/tools/frequency", "ar", { level: "beginner" });
  const advanced = getAssistantGuidance("/tools/frequency", "ar", { level: "advanced" });
  assert.equal(beginner.level, "beginner");
  assert.equal(advanced.level, "advanced");
  assert.match(beginner.suggestions[0].answer, /ببساطة:.*مثال قصير:.*الخطوة التالية:/);
  assert.match(advanced.suggestions[0].answer, /الافتراضات.*حدود العينة.*الخطوة المتقدمة التالية:/);
  assert.notEqual(beginner.suggestions[0].answer, advanced.suggestions[0].answer);
});

test("known visible terms add only page-safe technical context", () => {
  const report = getAssistantGuidance("/research-report", "en");
  assert.deepEqual(report.technicalTerms, ["Macro-F1", "Confusion Matrix"]);
  assert.match(report.suggestions[2].question, /Macro-F1.*Confusion Matrix/);
  const classification = getAssistantGuidance("/workspace", "ar", { pathId: "text-classification" });
  assert.deepEqual(classification.technicalTerms, ["Naive Bayes", "Evaluation Metrics"]);
  assert.match(classification.suggestions.map((item) => item.question).join(" "), /Naive Bayes.*Evaluation Metrics/);
});

test("unavailable paths never suggest launching nonexistent tools", () => {
  for (const pathId of ["semantics", "discourse-pragmatics", "information-extraction"]) {
    const result = getAssistantGuidance("/ar-tools", "en", { pathId });
    assert.match(result.suggestions.map((item) => item.answer).join(" "), /no dedicated|No dedicated|not runnable|cannot be launched|Coming next/i);
    assert.ok(result.suggestions.every((item) => !("href" in item)));
  }
});

test("assistant level storage is isolated and guidance has no automatic actions or raw data", () => {
  const assistant = source("components/SmartAssistant.js");
  assert.match(assistant, /lingualab-assistant-level/);
  assert.match(assistant, /localStorage\.getItem\(ASSISTANT_LEVEL_KEY\)/);
  assert.match(assistant, /localStorage\.setItem\(ASSISTANT_LEVEL_KEY, nextLevel\)/);
  assert.doesNotMatch(assistant, /router\.push|window\.location|fetch\(|sessionStorage/);
  const result = getAssistantGuidance("/tools/frequency", "en", { level: "advanced", rawRows: ["private"], dataset: "private" });
  assert.doesNotMatch(JSON.stringify(result), /private|rawRows|dataset/);
});

test("Research Copilot receives its own page-mode guidance", () => {
  const copilot = getAssistantGuidance("/workspace", "en", { mode: "copilot" });
  assert.equal(copilot.contextId, "copilot");
  assert.match(copilot.suggestions[0].question, /study type suggested/i);
  assert.match(copilot.suggestions[1].question, /Baseline/);
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { ASSISTANT_ROUTES, getAssistantGuidance } from "../lib/assistant-guidance.js";

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

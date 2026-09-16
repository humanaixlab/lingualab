import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { LEARNING_LESSONS } from "../lib/learning-lessons.js";
import { LEARNING_INTERACTION_PLACEMENTS, LEARNING_MICRO_INTERACTIONS, microInteractionsForLesson } from "../lib/learning-micro-interactions.js";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

function allLocalizedValues(value, found = []) {
  if (!value || typeof value !== "object") return found;
  if (typeof value.en === "string" && typeof value.ar === "string") found.push(value);
  for (const nested of Object.values(value)) allLocalizedValues(nested, found);
  return found;
}

test("approved lesson content remains byte-for-byte preserved", () => {
  const approvedSource = source("lib/learning-lessons.js");
  const digest = createHash("sha256").update(approvedSource).digest("hex");
  assert.equal(digest, "6117840d832466ae1983895c74024115e699f3dec3f97955f5a23eb6a119a2db");
  for (const lesson of LEARNING_LESSONS) {
    assert.ok(lesson.outcomes.length >= 3);
    assert.ok(lesson.concepts.length >= 4);
    assert.ok(lesson.example.steps.length >= 3);
    assert.ok(lesson.exercise.steps.length >= 3);
    assert.ok(lesson.check.options.length >= 3);
  }
});

test("every lesson gains bilingual educational interactions without losing its canonical route", () => {
  assert.deepEqual(Object.keys(LEARNING_MICRO_INTERACTIONS), ["text-analysis", "prompt-practice", "code-learning", "data-learning"]);
  assert.deepEqual(Object.values(LEARNING_MICRO_INTERACTIONS).map((items) => items.length), [4, 4, 5, 4]);
  for (const lesson of LEARNING_LESSONS) {
    const interactions = microInteractionsForLesson(lesson.id);
    assert.ok(interactions.length >= 4 && interactions.length <= 5);
    assert.equal(new Set(interactions.map((item) => item.id)).size, interactions.length);
    for (const localized of allLocalizedValues(interactions)) {
      assert.ok(localized.en.trim());
      assert.ok(localized.ar.trim());
    }
    const placedIds = Object.values(LEARNING_INTERACTION_PLACEMENTS[lesson.id]).flat();
    assert.deepEqual(placedIds.sort(), interactions.map((item) => item.id).sort());
  }
});

test("Text Analysis interactions teach representation, unit choice, frequency limits, and task selection", () => {
  const interactions = microInteractionsForLesson("text-analysis");
  assert.deepEqual(interactions.map((item) => item.id), ["computer-view", "unit-choice", "frequency-prediction", "analysis-family"]);
  const computerView = interactions[0];
  assert.equal(computerView.type, "reveal");
  assert.deepEqual(computerView.steps.map((step) => step.label.en), ["Full text", "Sentence", "Surface tokens", "Countable units", "Observable patterns"]);
  assert.match(computerView.note.en, /not a universal Arabic tokenization/i);
  assert.equal(interactions[1].scenarios.length, 2);
  assert.ok(interactions[1].scenarios.some((scenario) => scenario.options.some((item) => item.correct && item.label.en === "Document")));
  assert.match(interactions[2].explanation.en, /observation|observable/i);
  assert.equal(interactions[3].scenarios.length, 4);
  for (const family of ["Frequency", "Named Entity Recognition", "Sentiment classification", "Dependency analysis"])
    assert.ok(interactions[3].scenarios.some((scenario) => scenario.options.some((item) => item.correct && item.label.en === family)));
});

test("Prompt interactions compare, diagnose, assemble, and improve instructions without generating them", () => {
  const interactions = microInteractionsForLesson("prompt-practice");
  assert.deepEqual(interactions.map((item) => item.id), ["weak-prompt", "instruction-components", "compare-prompts", "improve-prompt"]);
  assert.match(interactions[0].prompt.ar, /حلل هذا النص/);
  assert.ok(interactions[0].options.filter((item) => item.correct).length >= 3);
  assert.match(interactions[1].success.en, /more than one legitimate way/i);
  assert.ok(interactions[2].scenarios[0].options.some((item) => item.correct && /three bullets/i.test(item.label.en)));
  assert.equal(interactions[3].scenarios.length, 2);
});

test("Code interactions preserve the rule-to-code bridge and distinguish placeholders from implementation", () => {
  const interactions = microInteractionsForLesson("code-learning");
  assert.deepEqual(interactions.map((item) => item.id), ["rule-to-code", "predict-output", "explain-code", "missing-pipeline-step", "placeholder-awareness"]);
  assert.deepEqual(interactions[0].steps.map((step) => step.label.en), ["Plain-language rule", "Logical condition", "Pseudocode", "Python"]);
  assert.equal(interactions[0].steps.at(-1).code, true);
  assert.equal(interactions[1].correctIndex, 0);
  assert.equal(interactions[1].codeSample, "len('لغة عربية'.split())");
  assert.equal(interactions[2].lines.length, 3);
  assert.match(interactions[3].scenarios[1].options.find((item) => item.correct).label.en, /normalization/i);
  assert.match(interactions[4].scenarios[0].options.find((item) => item.correct).label.en, /placeholder|dependency/i);
});

test("Data interactions teach inspection, issue types, column roles, and readiness without editing datasets", () => {
  const interactions = microInteractionsForLesson("data-learning");
  assert.deepEqual(interactions.map((item) => item.id), ["mini-table", "issue-types", "column-roles", "readiness"]);
  assert.equal(interactions[0].rows.length, 5);
  assert.ok(interactions[0].rows.some((row) => row[1] === ""));
  assert.equal(interactions[1].scenarios.length, 4);
  assert.ok(interactions[2].scenarios.some((scenario) => scenario.options.some((item) => item.correct && item.label.en === "text")));
  assert.ok(interactions[2].scenarios.some((scenario) => scenario.options.some((item) => item.correct && item.label.en === "label")));
  assert.match(interactions[3].scenarios[0].options.find((item) => item.correct).label.en, /cleaning and label review/i);
});

test("shared interactions are semantic, keyboard reachable, bilingual, and direction safe", () => {
  const component = source("components/learning/LessonMicroInteractions.js");
  const css = source("styles/LessonMicroInteractions.module.css");
  for (const semantic of ["<button", "<fieldset", "<legend", "type=\"radio\"", "type=\"checkbox\"", "role=\"status\"", "aria-pressed"])
    assert.ok(component.includes(semantic));
  assert.match(component, /dir=\{step\.code \? "ltr"/);
  assert.match(component, /className=\{styles\.codeExplorer\} dir="ltr"/);
  assert.match(component, /className=\{styles\.codeSample\} dir="ltr"/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /overflow-x:\s*auto/);
  assert.match(css, /@media \(max-width:/);
});

test("micro-interactions use local state and never duplicate a production workflow", () => {
  const implementation = [
    source("components/learning/LessonMicroInteractions.js"),
    source("lib/learning-micro-interactions.js"),
    source("pages/learning-center/[lesson].js"),
  ].join("\n");
  assert.match(implementation, /useState/);
  assert.doesNotMatch(implementation, /fetch\(|\/api\/|type="file"|FileReader|createAnalysisHandoff|createReportContext|client\.responses|openai/i);
  assert.doesNotMatch(implementation, /\/tools\/(analyze|prompt|code|excel)/);
});

test("the approved example becomes progressive while its steps and final handoff remain intact", () => {
  const component = source("components/learning/LessonMicroInteractions.js");
  const page = source("pages/learning-center/[lesson].js");
  assert.match(component, /example\.steps\.slice\(0, visibleCount\)/);
  assert.match(page, /<ProgressiveWorkedExample/);
  assert.match(page, /answeredCorrectly \? \([\s\S]*learningApplicationHref\(lesson\.id\)/);
  assert.match(page, /selectedAnswer === lesson\.check\.correctIndex/);
});

test("successful understanding checks reuse the existing progress store and fail safely without storage", () => {
  const page = source("pages/learning-center/[lesson].js");
  assert.match(page, /selectedAnswer !== lesson\.check\.correctIndex\) return/);
  assert.match(page, /localStorage\.getItem\("lingualab-learning-progress"\)/);
  assert.match(page, /localStorage\.setItem\("lingualab-learning-progress"/);
  assert.match(page, /try \{[\s\S]*localStorage[\s\S]*\} catch \{/);
  assert.match(page, /lesson and its handoff remain available when browser storage is blocked/);
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  LEARNING_LESSONS,
  LEARNING_LESSON_IDS,
  learningApplicationHref,
  learningLessonRoute,
} from "../lib/learning-lessons.js";
import { readResearchPathContext } from "../lib/research-path-context.js";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("every Learning Center card resolves to a complete guided lesson", () => {
  assert.deepEqual(LEARNING_LESSON_IDS, ["text-analysis", "prompt-practice", "code-learning", "data-learning"]);
  for (const lesson of LEARNING_LESSONS) {
    assert.equal(learningLessonRoute(lesson.id), `/learning-center/${lesson.id}`);
    assert.ok(lesson.overview.en && lesson.overview.ar);
    assert.ok(lesson.outcomes.length >= 3);
    assert.ok(lesson.concepts.length >= 4);
    assert.ok(lesson.example.steps.length >= 3);
    assert.ok(lesson.exercise.steps.length >= 3);
    assert.ok(lesson.check.options.length >= 3);
    assert.ok(Number.isInteger(lesson.check.correctIndex));
    assert.ok(lesson.application.label.en && lesson.application.label.ar);
  }
});

test("Text Analysis Basics teaches the promised foundations before Analyze", () => {
  const lesson = LEARNING_LESSONS.find((item) => item.id === "text-analysis");
  const content = lesson.concepts.map((item) => `${item.title.en} ${item.text.en}`).join(" ");
  for (const phrase of ["computational text analysis", "computer sees Arabic", "unit of analysis", "Tokens", "Frequencies", "deeper NLP task", "Choose analysis"])
    assert.match(content, new RegExp(phrase, "i"));
  assert.match(lesson.example.sample.ar, /اللغة واضحة/);
  assert.match(lesson.exercise.prompt.ar, /الباحث/);
});

test("Learning Center cards never directly open production tools", () => {
  const hub = source("pages/learning-center.js");
  for (const id of LEARNING_LESSON_IDS)
    assert.match(hub, new RegExp(`learningLessonRoute\\("${id}"\\)`));
  assert.doesNotMatch(hub, /\/tools\/(analyze|prompt|code|excel)/);
  assert.doesNotMatch(hub, /practiceHref|researchPathHref/);
});

test("production handoffs appear only after a correct understanding check", () => {
  const page = source("pages/learning-center/[lesson].js");
  const interactions = source("components/learning/LessonMicroInteractions.js");
  assert.match(page, /const answeredCorrectly = submitted && selectedAnswer === lesson\.check\.correctIndex/);
  assert.match(page, /answeredCorrectly \? \([\s\S]*learningApplicationHref\(lesson\.id\)/);
  assert.doesNotMatch(`${page}\n${interactions}`, /fetch\(|\/api\/|type="file"|createAnalysisHandoff|createReportContext/);
});

test("lesson application links preserve context without creating duplicate workflows", () => {
  const analyzeHref = learningApplicationHref("text-analysis");
  const context = readResearchPathContext(analyzeHref, "/tools/analyze");
  assert.deepEqual(context, {
    pathId: "corpus-linguistics",
    sourcePath: "corpus-linguistics",
    selectedPath: "corpus-linguistics",
    selectedDomain: "linguistic",
    workflow: "corpus-analysis",
    sourceSection: "learning-center",
  });
  assert.match(analyzeHref, /learningLesson=text-analysis/);
  assert.match(analyzeHref, /#quick-analysis$/);
  assert.equal(learningApplicationHref("prompt-practice"), "/tools/prompt?from=learn&lesson=prompt-practice");
  assert.equal(learningApplicationHref("code-learning"), "/tools/code?from=learn&lesson=code-learning");
  assert.equal(learningApplicationHref("data-learning"), "/tools/excel?from=learn&lesson=data-learning");
  assert.equal(learningApplicationHref("missing"), "/learning-center");
});

test("lesson routes do not reintroduce legacy Prompt Builder navigation", () => {
  const allSources = [
    source("pages/learning-center.js"),
    source("pages/learning-center/[lesson].js"),
    source("lib/learning-lessons.js"),
  ].join("\n");
  assert.doesNotMatch(allSources, /prompt-builder|\/prompt-builder|\/build-prompt/);
  assert.equal((allSources.match(/"\/tools\/prompt"/g) || []).length, 1);
});

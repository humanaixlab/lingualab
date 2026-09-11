import assert from "node:assert/strict";
import test from "node:test";
import { ARABIC_CHALLENGE_FAMILIES } from "../lib/arabic-challenges.js";
import { APPLIED_PROJECT_ENTRIES } from "../lib/applied-projects.js";
import { PATH_GUIDANCE, PROJECT_CATALOG, PROJECT_TOOL_ROUTES } from "../lib/project-catalog.js";
import { PROJECT_TASK_LABELS, PROJECT_TOOL_LABELS, getProjectTaskLabel, getProjectToolLabel } from "../lib/project-display-labels.js";
import { SOCIAL_IMPACT_PROJECTS, SOCIAL_PROBLEM_MAPPINGS } from "../lib/social-impact-projects.js";

const unique = (values) => [...new Set(values)];

test("every current project-facing tool has an explicit bilingual display label", () => {
  const tools = unique([
    ...PROJECT_CATALOG.flatMap((project) => project.tools),
    ...Object.values(PATH_GUIDANCE).flatMap((path) => path.tools),
    ...ARABIC_CHALLENGE_FAMILIES.flatMap((challenge) => challenge.suitableTools),
    ...APPLIED_PROJECT_ENTRIES.flatMap((project) => project.suitableTools),
    ...SOCIAL_IMPACT_PROJECTS.flatMap((project) => project.tools),
  ]);
  for (const tool of tools) {
    assert.ok(PROJECT_TOOL_LABELS[tool], `missing tool label: ${tool}`);
    assert.ok(getProjectToolLabel(tool, "en"));
    assert.ok(getProjectToolLabel(tool, "ar"));
    assert.ok(PROJECT_TOOL_ROUTES[tool], `tool route changed or missing: ${tool}`);
  }
});

test("every current Applied and Social task has an explicit bilingual display label", () => {
  const tasks = unique([
    ...APPLIED_PROJECT_ENTRIES.flatMap((project) => project.nlpTasks),
    ...SOCIAL_IMPACT_PROJECTS.flatMap((project) => project.socialImpact.nlpTasks),
    ...SOCIAL_PROBLEM_MAPPINGS.map((mapping) => mapping.task),
  ]);
  for (const task of tasks) {
    assert.ok(PROJECT_TASK_LABELS[task], `missing task label: ${task}`);
    assert.ok(getProjectTaskLabel(task, "en"));
    assert.ok(getProjectTaskLabel(task, "ar"));
  }
});

test("project label helpers preserve internal values and provide safe readable fallbacks", () => {
  assert.equal(getProjectToolLabel("Information Extraction", "ar"), "استخراج المعلومات");
  assert.equal(getProjectToolLabel("Semantics Research Preview", "en"), "Semantic Analysis");
  assert.equal(getProjectTaskLabel("terminology-extraction", "ar"), "استخراج المصطلحات");
  assert.equal(getProjectTaskLabel("named-entities", "en"), "Named Entity Recognition");
  assert.equal(getProjectTaskLabel("future-task-id", "ar"), "Future Task Id");
  assert.equal(PROJECT_TOOL_ROUTES["Information Extraction"], "/tools/information-extraction");
});

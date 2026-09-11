import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { PATH_GUIDANCE, PROJECT_CATALOG, recommendProjects } from "../lib/project-catalog.js";
const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("guidance covers four linguistic paths and three computational workflows", () => {
  assert.deepEqual(Object.keys(PATH_GUIDANCE), ["corpus-linguistics", "morphology-syntax", "semantics", "discourse-pragmatics", "text-classification", "information-extraction", "nlp-experiments"]);
  for (const path of Object.values(PATH_GUIDANCE)) {
    for (const field of ["name", "problem", "questions", "data", "annotation", "outputs", "evaluation", "beginner"]) assert.ok(path[field]?.en && path[field]?.ar, `missing bilingual ${field}`);
    assert.ok(path.tools.length);
  }
});

test("catalog is structured, varied, bilingual, and connected to current tools", () => {
  assert.equal(PROJECT_CATALOG.length, 10);
  assert.deepEqual(new Set(PROJECT_CATALOG.map((item) => item.path)), new Set(Object.keys(PATH_GUIDANCE)));
  assert.ok(PROJECT_CATALOG.some((item) => item.teamType === "individual"));
  assert.ok(PROJECT_CATALOG.some((item) => item.teamType === "team" && item.annotatorsRequired));
  for (const item of PROJECT_CATALOG) {
    for (const field of ["id", "title", "problem", "impact", "path", "tools", "dataRequirements", "teamType", "annotatorsRequired", "annotationNotes", "complexity", "steps", "expectedResults", "evaluation", "possibleOutputs", "applicationPotential", "tags"]) assert.notEqual(item[field], undefined, `${item.id} missing ${field}`);
    assert.ok(item.title.en && item.title.ar);
    assert.ok(item.tools.every((tool) => PATH_GUIDANCE[item.path].tools.includes(tool)), `${item.id} has a nonexistent tool`);
  }
});

test("recommendations respond deterministically to researcher needs", () => {
  const discourse = recommendProjects({ path: "discourse-pragmatics", team: "team", annotation: "yes" });
  assert.equal(discourse[0].path, "discourse-pragmatics");
  assert.equal(discourse[0].annotatorsRequired, true);
  assert.equal(recommendProjects({ path: "text-classification", task: "classification", complexity: "intermediate" })[0].id, "arabic-review-classification");
});

test("Projects remains navigation-only and separates result layers", () => {
  const page = source("pages/projects.js");
  assert.match(page, /PROJECT_CATALOG/);
  assert.match(page, /recommendProjects/);
  assert.match(page, /Measured \/ computed results/);
  assert.match(page, /AI-supported interpretation/);
  assert.match(page, /Researcher conclusions/);
  assert.doesNotMatch(page, /localStorage|sessionStorage|fetch\(|\/api\/|projectId|auth|collaborator|WebSocket/);
  assert.doesNotMatch(source("lib/project-catalog.js"), /href|route|localStorage|sessionStorage/);
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { PATH_GUIDANCE, PROJECT_CATALOG, PROJECT_PATH_ROUTES, PROJECT_TOOL_ROUTES, buildProjectRoadmap, recommendProjects } from "../lib/project-catalog.js";
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
  assert.doesNotMatch(page, /localStorage|sessionStorage|auth|collaborator|WebSocket|useEffect/);
  assert.match(page, /fetch\("\/api\/project-prototype-guidance"/);
  assert.doesNotMatch(source("lib/project-catalog.js"), /localStorage|sessionStorage|fetch\(|\/api\//);
});

test("every project links to real canonical, data, tool, evaluation, interpretation, and reporting destinations", () => {
  const routeFiles = new Set([
    "/", "/ar-tools", "/workspace", "/research-report", "/research-paths/corpus-linguistics", "/tools/analyze", "/tools/prompt",
    ...Object.values(PROJECT_TOOL_ROUTES),
  ]);
  for (const project of PROJECT_CATALOG) {
    assert.ok(PROJECT_PATH_ROUTES[project.path]);
    assert.ok(project.tools.every((tool) => PROJECT_TOOL_ROUTES[tool]));
    const roadmap = buildProjectRoadmap(project);
    for (const stage of ["path", "data", "tool", "run", "review", "evaluate", "errors", "interpret", "report", "writing"]) {
      const step = roadmap.find((item) => item.stage === stage);
      assert.ok(step?.href, `${project.id} missing ${stage} destination`);
      assert.ok(routeFiles.has(step.href.split("#")[0]), `${project.id} uses unknown route ${step.href}`);
    }
    assert.ok(roadmap.some((item) => item.external && item.stage === "responsibility"));
    if (project.annotatorsRequired) assert.ok(roadmap.some((item) => item.external && item.stage === "annotation"));
  }
});

test("unsupported work is labeled external and the executable roadmap does not trigger work", () => {
  const page = source("pages/projects.js");
  assert.match(page, /External step/);
  assert.match(page, /خطوة خارجية/);
  assert.match(page, /buildProjectRoadmap/);
  assert.doesNotMatch(page, /router\.push|window\.location|useEffect/);
});

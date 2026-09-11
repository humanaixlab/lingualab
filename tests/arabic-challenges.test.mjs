import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { ARABIC_CHALLENGE_FAMILIES, ARABIC_CHALLENGE_PROJECTS, CHALLENGE_BY_ID, filterChallenges } from "../lib/arabic-challenges.js";
import { PATH_GUIDANCE, PROJECT_CATALOG, PROJECT_TOOL_ROUTES, recommendProjects } from "../lib/project-catalog.js";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("Arabic challenge layer defines seven complete bilingual reusable families", () => {
  assert.deepEqual(ARABIC_CHALLENGE_FAMILIES.map((item) => item.id), ["dialects", "orthography", "morphology", "speech", "semantics", "discourse", "corpus-data"]);
  for (const item of ARABIC_CHALLENGE_FAMILIES) {
    for (const field of ["id", "titleAr", "titleEn", "description", "whyItIsHardInArabic", "commonResearchQuestions", "suitablePaths", "suitableTools", "dataNeeds", "annotationNeeds", "evaluationApproaches", "possibleProjects", "applicationPotential", "complexity", "tags"]) assert.notEqual(item[field], undefined, `${item.id} missing ${field}`);
    for (const field of ["description", "whyItIsHardInArabic", "commonResearchQuestions", "dataNeeds", "annotationNeeds", "evaluationApproaches", "applicationPotential"]) assert.ok(item[field].en && item[field].ar, `${item.id} missing bilingual ${field}`);
    assert.ok(item.suitablePaths.every((path) => PATH_GUIDANCE[path]), `${item.id} has an unknown path`);
    assert.ok(item.suitableTools.every((tool) => PROJECT_TOOL_ROUTES[tool]), `${item.id} has an unknown tool`);
    assert.ok(item.possibleProjects.every((id) => PROJECT_CATALOG.some((project) => project.id === id)), `${item.id} has an unknown project`);
  }
  assert.equal(Object.keys(CHALLENGE_BY_ID).length, 7);
});

test("eight challenge projects remain connected to actual LinguaLab tools", () => {
  assert.equal(ARABIC_CHALLENGE_PROJECTS.length, 8);
  for (const project of ARABIC_CHALLENGE_PROJECTS) {
    assert.ok(CHALLENGE_BY_ID[project.challengeId]);
    assert.ok(project.tools.every((tool) => PROJECT_TOOL_ROUTES[tool]));
    assert.ok(project.tags.includes(project.challengeId) || CHALLENGE_BY_ID[project.challengeId].tags.some((tag) => project.tags.includes(tag)));
  }
});

test("challenge-aware recommendations extend rather than replace existing scoring", () => {
  assert.equal(recommendProjects({ challenge: "dialects", task: "classification" })[0].id, "dialect-identification");
  assert.ok(["arabic-root-evaluation", "arabic-lemma-evaluation", "morphological-ambiguity"].includes(recommendProjects({ challenge: "morphology", challengeFocus: "ambiguity" })[0].id));
  assert.equal(recommendProjects({ challenge: "speech", task: "evaluation" })[0].id, "arabic-asr-evaluation");
  assert.equal(recommendProjects({ path: "text-classification", task: "classification", complexity: "intermediate" })[0].id, "arabic-review-classification");
  assert.deepEqual(filterChallenges({ family: "speech" }).map((item) => item.id), ["speech"]);
});

test("speech and data collection limitations are explicitly external", () => {
  assert.ok(CHALLENGE_BY_ID.speech.externalSteps.length);
  const asr = PROJECT_CATALOG.find((item) => item.id === "arabic-asr-evaluation");
  assert.ok(asr.externalSteps.length);
  assert.match(asr.dataRequirements.en, /Externally generated ASR transcripts/);
  assert.doesNotMatch(asr.applicationPotential.en, /ASR engine/);
});

test("Projects renders challenge discovery without changing routes, APIs, or prototype handoff", () => {
  const page = source("pages/projects.js");
  assert.match(page, /Arabic Language Challenges/);
  assert.match(page, /تحديات اللغة العربية/);
  assert.match(page, /ChallengeExplorer/);
  assert.match(page, /CHALLENGE_BY_ID/);
  assert.match(page, /External step/);
  assert.match(page, /buildPrototypeHandoff/);
  assert.doesNotMatch(source("lib/arabic-challenges.js"), /href|router|fetch\(|\/api\/|localStorage|sessionStorage/);
});

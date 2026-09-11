import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { CHALLENGE_BY_ID } from "../lib/arabic-challenges.js";
import { APPLIED_NEW_PROJECTS, APPLIED_PROJECT_BY_PROJECT_ID, APPLIED_PROJECT_ENTRIES, APPLIED_REUSED_PROJECT_IDS, APPLIED_SECTORS, filterAppliedProjects } from "../lib/applied-projects.js";
import { PROJECT_CATALOG, PROJECT_TOOL_ROUTES, recommendProjects } from "../lib/project-catalog.js";
import { buildPrototypeHandoff, getPrototypeHandoffFields, getPrototypeProfile } from "../lib/project-guides.js";
import { SOCIAL_IMPACT_PROJECTS } from "../lib/social-impact-projects.js";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("applied discovery defines ten bilingual sectors and ten structured records", () => {
  assert.equal(APPLIED_SECTORS.length, 10);
  assert.equal(APPLIED_PROJECT_ENTRIES.length, 10);
  assert.equal(APPLIED_NEW_PROJECTS.length, 2);
  for (const entry of APPLIED_PROJECT_ENTRIES) {
    for (const field of ["id", "titleAr", "titleEn", "sector", "needAr", "needEn", "languageProblem", "whyItMatters", "nlpTasks", "suitablePaths", "suitableTools", "relatedArabicChallenges", "dataNeeds", "annotationNeeds", "humanReferenceNeeds", "externalSteps", "evaluationApproaches", "errorAnalysisFocus", "prototypeIdea", "possibleApplication", "expectedPracticalValue", "privacyConsiderations", "legalOrLicensingNotes", "complexity", "individualOrTeam", "needsAnnotators", "tags"]) assert.notEqual(entry[field], undefined, `${entry.id} missing ${field}`);
    assert.ok(PROJECT_CATALOG.some((project) => project.id === entry.projectId));
    assert.ok(entry.suitableTools.every((tool) => PROJECT_TOOL_ROUTES[tool]), `${entry.id} has an unknown tool`);
    assert.ok(entry.relatedArabicChallenges.every((id) => CHALLENGE_BY_ID[id]), `${entry.id} has an unknown challenge`);
  }
});

test("eight canonical Social Impact projects are reused without duplicate project records", () => {
  assert.equal(APPLIED_REUSED_PROJECT_IDS.length, 8);
  for (const id of APPLIED_REUSED_PROJECT_IDS) {
    assert.ok(SOCIAL_IMPACT_PROJECTS.some((item) => item.id === id));
    assert.equal(PROJECT_CATALOG.filter((item) => item.id === id).length, 1);
  }
  for (const title of ["Reuse Match AI", "Academic Instruction Analyzer", "Pre-Arrival Delivery Check", "Natural Place Description Structuring"]) assert.equal(PROJECT_CATALOG.filter((item) => item.title.en === title).length, 1);
});

test("applied filters and recommendation signals preserve previous scoring", () => {
  assert.deepEqual(filterAppliedProjects({ sector: "culture-heritage" }).map((item) => item.projectId), ["heritage-description-assistant"]);
  assert.equal(recommendProjects({ appliedSector: "sustainability-environment", appliedNeed: "semantic-matching", goal: "prototype" })[0].id, "reuse-match-ai");
  assert.equal(recommendProjects({ appliedSector: "culture-heritage", appliedNeed: "extraction" })[0].id, "heritage-description-assistant");
  assert.equal(recommendProjects({ appliedSector: "education-universities", appliedNeed: "ambiguity" })[0].id, "academic-instruction-analyzer");
  assert.equal(recommendProjects({ appliedSector: "health-information", appliedNeed: "instructions" })[0].id, "health-instruction-review");
  assert.equal(recommendProjects({ socialDomain: "social-integration", socialNeed: "pragmatics", goal: "prototype" })[0].id, "social-pragmatics-assistant");
});

test("applied prototype handoff inherits context through the existing review mechanism", () => {
  const project = PROJECT_CATALOG.find((item) => item.id === "heritage-description-assistant");
  assert.ok(getPrototypeProfile(project.id));
  assert.ok(getPrototypeHandoffFields(project).some((field) => field.id === "sector"));
  const handoff = buildPrototypeHandoff(project, "ar");
  for (const field of ["sector", "practicalNeed", "appliedLanguageProblem", "appliedNlpTask", "possibleApplication", "expectedPracticalValue", "appliedLimitations"]) assert.ok(handoff.inherited[field], `missing ${field}`);
  assert.deepEqual(handoff.missing, []);
});

test("legal positioning avoids contracts, partners, calls, and live opportunities", () => {
  const page = source("pages/projects.js");
  const data = source("lib/applied-projects.js");
  assert.match(page, /Applied Project Ideas/);
  assert.match(page, /مقترحات المشروعات التطبيقية/);
  assert.match(page, /do not represent contracts, formal partnerships, procurement opportunities/);
  assert.match(page, /لا تمثل فرص تعاقد أو شراكات رسمية/);
  assert.match(data, /no authority data is assumed/i);
  assert.match(data, /not medical advice/i);
  assert.doesNotMatch(data, /https?:\/\/|fetch\(|localStorage|sessionStorage/);
  assert.doesNotMatch(page, /procurement form|submit proposal|partner logo|live opportunity/i);
});

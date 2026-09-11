import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { CHALLENGE_BY_ID } from "../lib/arabic-challenges.js";
import { PROJECT_CATALOG, PROJECT_TOOL_ROUTES, recommendProjects } from "../lib/project-catalog.js";
import { buildPrototypeHandoff, getPrototypeHandoffFields, getPrototypeProfile } from "../lib/project-guides.js";
import { SOCIAL_IMPACT_DOMAINS, SOCIAL_IMPACT_PROJECTS, SOCIAL_PROBLEM_MAPPINGS, filterSocialImpactProjects } from "../lib/social-impact-projects.js";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("social impact layer defines ten bilingual domains and ten reusable projects", () => {
  assert.equal(SOCIAL_IMPACT_DOMAINS.length, 10);
  assert.equal(SOCIAL_IMPACT_PROJECTS.length, 10);
  assert.deepEqual(SOCIAL_IMPACT_DOMAINS.map((item) => item.id), ["transport", "tourism", "sustainability", "recreation", "public-services", "accessibility", "health", "social-integration", "education", "local-services"]);
  for (const project of SOCIAL_IMPACT_PROJECTS) {
    assert.ok(PROJECT_CATALOG.includes(project));
    assert.ok(project.title.en && project.title.ar);
    assert.ok(project.tools.every((tool) => PROJECT_TOOL_ROUTES[tool]), `${project.id} has an unknown tool`);
    assert.ok(project.challengeIds.every((id) => CHALLENGE_BY_ID[id]), `${project.id} has an unknown Arabic challenge`);
    for (const field of ["id", "titleAr", "titleEn", "domain", "problemAr", "problemEn", "affectedUsers", "languageProblem", "whyItMatters", "nlpTasks", "suitablePaths", "suitableTools", "dataNeeds", "annotationSchema", "humanReferenceNeeds", "externalSteps", "evaluationApproaches", "errorAnalysisFocus", "prototypeIdea", "expectedSocialImpact", "risksAndLimitations", "privacyConsiderations", "complexity", "individualOrTeam", "needsAnnotators", "tags"]) assert.notEqual(project[field], undefined, `${project.id} missing ${field}`);
  }
  assert.equal(SOCIAL_PROBLEM_MAPPINGS.length, 8);
});

test("social impact filters and recommendation signals extend existing discovery", () => {
  assert.deepEqual(filterSocialImpactProjects({ domain: "transport" }).map((item) => item.id), ["delivery-instruction-check"]);
  assert.equal(recommendProjects({ socialDomain: "sustainability", socialNeed: "semantic-matching", goal: "prototype" })[0].id, "reuse-match-ai");
  assert.equal(recommendProjects({ socialDomain: "social-integration", socialNeed: "pragmatics", goal: "prototype" })[0].id, "social-pragmatics-assistant");
  assert.equal(recommendProjects({ socialDomain: "accessibility", socialNeed: "simplification" })[0].id, "accessibility-stress-test");
  assert.equal(recommendProjects({ path: "text-classification", task: "classification", complexity: "intermediate" })[0].id, "arabic-review-classification");
});

test("social projects preserve ethical and external-capability honesty", () => {
  const delivery = SOCIAL_IMPACT_PROJECTS.find((item) => item.id === "delivery-instruction-check");
  const health = SOCIAL_IMPACT_PROJECTS.find((item) => item.id === "health-instruction-review");
  const location = SOCIAL_IMPACT_PROJECTS.find((item) => item.id === "natural-place-description");
  assert.match(delivery.dataRequirements.en, /no platform data is assumed/i);
  assert.match(health.socialImpact.risksAndLimitations.en, /not medical advice/i);
  assert.match(health.socialImpact.privacyConsiderations.en, /health data/i);
  assert.ok(location.externalSteps.length);
  assert.match(location.externalSteps[0].en, /GIS/);
  assert.doesNotMatch(source("lib/social-impact-projects.js"), /https?:\/\/|fetch\(|localStorage|sessionStorage/);
});

test("prototype handoff inherits social context without changing ordinary project fields", () => {
  const social = SOCIAL_IMPACT_PROJECTS.find((item) => item.id === "social-pragmatics-assistant");
  const ordinary = PROJECT_CATALOG.find((item) => item.id === "arabic-review-classification");
  assert.ok(getPrototypeProfile(social.id));
  assert.ok(getPrototypeHandoffFields(social).length > getPrototypeHandoffFields(ordinary).length);
  const handoff = buildPrototypeHandoff(social, "ar");
  for (const field of ["socialProblem", "affectedUsers", "languageProblem", "nlpTask", "annotationSchema", "expectedSocialImpact", "risksAndLimitations"]) assert.ok(handoff.inherited[field], `missing ${field}`);
  assert.deepEqual(handoff.missing, []);
  assert.equal(buildPrototypeHandoff(social, "en", { expectedSocialImpact: "Researcher-edited impact" }).reviewed.expectedSocialImpact, "Researcher-edited impact");
});

test("Projects exposes the fourth pathway, detail ethics, and no new destination or persistence", () => {
  const page = source("pages/projects.js");
  assert.match(page, /NLP for Social Impact/);
  assert.match(page, /اللسانيات الحاسوبية للأثر المجتمعي/);
  assert.match(page, /SocialImpactExplorer/);
  assert.match(page, /SocialImpactDetail/);
  assert.match(page, /getPrototypeHandoffFields/);
  assert.match(page, /Educational\/research use only/);
  assert.doesNotMatch(page, /router\.push|window\.location|useEffect|localStorage|sessionStorage/);
  assert.doesNotMatch(source("lib/social-impact-projects.js"), /href|router|\/api\//);
});

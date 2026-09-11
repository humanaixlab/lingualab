import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { PROJECT_CATALOG } from "../lib/project-catalog.js";
import { GUIDE_MEDIA, PROTOTYPE_HANDOFF_FIELDS, PROTOTYPE_PROFILES, RESEARCH_GUIDES, buildPrototypeHandoff, buildPrototypeRoadmap, getProjectGuides, getPrototypeLinks, getPrototypeProfile } from "../lib/project-guides.js";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("step guides use a complete bilingual practical structure", () => {
  assert.deepEqual(Object.keys(RESEARCH_GUIDES), ["data", "annotation", "corpus", "classification", "extraction", "experiments", "interpretation", "implementation"]);
  for (const guide of Object.values(RESEARCH_GUIDES)) {
    for (const field of ["title", "what", "why", "prepare", "inside", "inspect", "warnings", "next"])
      assert.ok(guide[field].en && guide[field].ar, `${guide.id} missing bilingual ${field}`);
  }
  const classification = getProjectGuides(PROJECT_CATALOG.find((item) => item.id === "arabic-review-classification"));
  assert.deepEqual(classification.map((item) => item.id), ["data", "classification", "interpretation", "implementation"]);
  const stance = getProjectGuides(PROJECT_CATALOG.find((item) => item.id === "arabic-stance-reference"));
  assert.ok(stance.some((item) => item.id === "annotation"));
});

test("video-ready metadata has text fallback and no fabricated media URL", () => {
  for (const media of Object.values(GUIDE_MEDIA)) {
    assert.equal(media.preferredOwner, "LinguaLab");
    assert.equal(media.fallback, "text-visual");
    assert.equal(media.linguaLabVideo, null);
    assert.equal(media.approvedEmbed, null);
    assert.equal(media.externalReference, null);
  }
});

test("prototype guidance is limited to suitable projects and extends research findings safely", () => {
  assert.ok(Object.keys(PROTOTYPE_PROFILES).length > 0);
  for (const project of PROJECT_CATALOG) {
    const profile = getPrototypeProfile(project.id);
    const roadmap = buildPrototypeRoadmap(project);
    if (!profile) {
      assert.deepEqual(roadmap, []);
      continue;
    }
    assert.deepEqual(roadmap.map((item) => item.stage), ["problem", "solution", "inputs", "outputs", "data", "method", "logic", "test", "evaluate", "improve"]);
    assert.equal(roadmap.find((item) => item.stage === "inputs").href, "/workspace");
    assert.equal(roadmap.find((item) => item.stage === "improve").href, "/tools/code");
    assert.deepEqual(getPrototypeLinks(project).map((item) => item.href), ["/workspace", roadmap.find((item) => item.stage === "method").href, "/tools/code", "/tools/colab", "/research-report", "/tools/prompt"]);
  }
});

test("Projects requests guidance only by explicit action and sends no research data", () => {
  const page = source("pages/projects.js");
  assert.match(page, /Generate prototype guidance/);
  assert.match(page, /ولّد إرشاد النموذج الأولي/);
  assert.match(page, /onClick=\{requestGuidance\}/);
  assert.match(page, /JSON\.stringify\(\{ projectId: project\.id, uiLanguage: language, researcherEdits: current\.researcherEdits \}\)/);
  assert.doesNotMatch(page, /useEffect/);
  assert.doesNotMatch(page, /JSON\.stringify\([^)]*(?:dataset|rawText|fileContent)/);
});

test("prototype handoff inherits every required project field and preserves researcher edits separately", () => {
  assert.deepEqual(PROTOTYPE_HANDOFF_FIELDS.map((field) => field.id), ["idea", "problem", "impact", "path", "tools", "requiredData", "expectedOutputs", "evaluation", "applicationPotential"]);
  const project = PROJECT_CATALOG.find((item) => item.id === "arabic-terminology");
  const initial = buildPrototypeHandoff(project, "en");
  assert.deepEqual(initial.missing, []);
  assert.equal(initial.inherited.idea, project.title.en);
  assert.equal(initial.inherited.impact, project.impact.en);
  assert.equal(initial.inherited.tools, project.tools.join(", "));
  assert.equal(initial.inherited.expectedOutputs, project.expectedResults.en);
  assert.equal(initial.inherited.applicationPotential, project.applicationPotential.en);
  assert.equal(initial.researcherEdits.problem, "");
  const edited = buildPrototypeHandoff(project, "en", { problem: "Researcher-refined problem" });
  assert.equal(edited.inherited.problem, project.problem.en);
  assert.equal(edited.researcherEdits.problem, "Researcher-refined problem");
  assert.equal(edited.reviewed.problem, "Researcher-refined problem");
});

test("prototype handoff action opens review before AI guidance and asks only for missing fields", () => {
  const page = source("pages/projects.js");
  assert.match(page, /Turn this project into a prototype/);
  assert.match(page, /حوّل هذا المشروع إلى نموذج أولي/);
  assert.match(page, /Inherited project information/);
  assert.match(page, /Researcher edits \/ additions/);
  assert.match(page, /disabled=\{!contextReviewed \|\| guidanceStatus === "loading"\}/);
  assert.match(page, /missingFields\.includes\(field\.id\)/);
  assert.match(page, /requestAnimationFrame/);
  assert.doesNotMatch(page, /router\.push|window\.location|useEffect/);
});

test("server-side AI prompt preserves research, code, and licensing safeguards", () => {
  const api = source("pages/api/project-prototype-guidance.js");
  assert.match(api, /process\.env\.OPENAI_API_KEY/);
  assert.match(api, /buildPrototypeHandoff\(project, language, researcherEdits\)/);
  assert.match(api, /missing: handoff\.missing/);
  assert.match(api, /guidance, not measured evidence/);
  assert.match(api, /Do not invent data, results, metrics/);
  assert.match(api, /Do not copy code from repositories/);
  assert.match(api, /do not provide production deployment instructions/i);
  assert.doesNotMatch(api, /localStorage|sessionStorage|database|apiKey:\s*req/);
  const page = source("pages/projects.js");
  assert.match(page, /LinguaLab does not grant a license to third-party materials/);
  assert.match(page, /لا تمنح LinguaLab ترخيصًا لمواد يملكها طرف ثالث/);
  assert.match(page, /examples only/);
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { PROJECT_CATALOG } from "../lib/project-catalog.js";
import { GUIDE_MEDIA, PROTOTYPE_PROFILES, RESEARCH_GUIDES, buildPrototypeRoadmap, getProjectGuides, getPrototypeLinks, getPrototypeProfile } from "../lib/project-guides.js";

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
  assert.match(page, /JSON\.stringify\(\{ projectId: project\.id, uiLanguage: language \}\)/);
  assert.doesNotMatch(page, /useEffect/);
  assert.doesNotMatch(page, /JSON\.stringify\([^)]*(?:dataset|rawText|fileContent)/);
});

test("server-side AI prompt preserves research, code, and licensing safeguards", () => {
  const api = source("pages/api/project-prototype-guidance.js");
  assert.match(api, /process\.env\.OPENAI_API_KEY/);
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

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const guidedPages = [
  "pages/tools/text-classification-research.js",
  "pages/tools/corpus-research.js",
  "pages/tools/information-extraction.js",
  "pages/tools/nlp-experiments.js",
  "pages/tools/semantics.js",
  "pages/tools/morphology-syntax.js",
  "pages/research-advisor.js",
];

test("priority research and tool pages use the shared bilingual guidance pattern", () => {
  for (const path of guidedPages) {
    const page = source(path);
    assert.match(page, /import PageGuidance/);
    assert.match(page, /<PageGuidance/);
    assert.match(page, /const GUIDANCE = \{/);
    assert.match(page, /ar: \[/);
    assert.match(page, /en: \[/);
  }
});

test("Projects distinguishes catalog, detail, and prototype guidance", () => {
  const page = source("pages/projects.js");
  for (const name of ["PROJECT_GUIDANCE", "PROJECT_DETAIL_GUIDANCE", "PROTOTYPE_GUIDANCE"]) {
    assert.match(page, new RegExp(`<PageGuidance[^>]+${name}`));
  }
  assert.match(page, /هذه الصفحة ترشد الخطة ولا تنفذها/);
  assert.match(page, /Ask AI for an initial implementation plan/);
  assert.match(page, /اطلب من الذكاء الاصطناعي اقتراح خطة تنفيذ أولية/);
  assert.doesNotMatch(page, /معلومات المشروع الموروثة|Inherited project information/);
  assert.match(page, /معلومات المشروع الحالية|Current project information/);
});

test("shared guidance safely handles missing or malformed content", () => {
  const component = source("components/PageGuidance.js");
  assert.match(component, /Array\.isArray\(steps\)/);
  assert.match(component, /typeof step === "string"/);
  assert.match(component, /if \(safeSteps\.length === 0\) return null/);
  assert.match(component, /title \|\| DEFAULT_TITLES\[locale\]/);
  assert.match(component, /كيف تستخدم هذه الصفحة؟/);
  assert.match(component, /How to use this page/);
});

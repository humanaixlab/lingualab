import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { translate } from "../lib/i18n/translate.js";
import { PATH_GUIDANCE, PROJECT_CATALOG, PROJECT_PATH_ROUTES, PROJECT_TOOL_ROUTES, buildProjectRoadmap, recommendProjects } from "../lib/project-catalog.js";
import { buildPrototypeRoadmap, getProjectGuides, getPrototypeLinks, getPrototypeProfile } from "../lib/project-guides.js";

const require = createRequire(import.meta.url);
const swc = require("next/dist/build/swc");
await swc.loadBindings();
const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

async function renderPage(path, language) {
  const { code } = await swc.transform(source(path), {
    jsc: { parser: { syntax: "ecmascript", jsx: true }, transform: { react: { runtime: "automatic" } } },
    module: { type: "commonjs" },
  });
  const exports = {};
  const scope = {
    exports,
    require(module) {
      if (module === "react") return React;
      if (module === "react/jsx-runtime") return awaitImportJsxRuntime;
      if (module === "next/head") return function MockHead() { return null; };
      if (module === "next/link") return function MockLink({ children, ...props }) { return React.createElement("a", props, children); };
      if (module === "../components/LanguageProvider") return { useLanguage: () => ({ language, t: (key, variables) => translate(language, key, variables) }) };
      if (module === "../lib/project-catalog") return { PATH_GUIDANCE, PROJECT_CATALOG, PROJECT_PATH_ROUTES, PROJECT_TOOL_ROUTES, buildProjectRoadmap, recommendProjects };
      if (module === "../lib/project-guides") return { buildPrototypeRoadmap, getProjectGuides, getPrototypeLinks, getPrototypeProfile };
      if (module === "../styles/Projects.module.css") return new Proxy({}, { get: (_, key) => String(key) });
      throw new Error(`Unexpected module: ${module}`);
    },
  };
  Function("exports", "require", code)(scope.exports, scope.require);
  return renderToStaticMarkup(React.createElement(scope.exports.default));
}

const awaitImportJsxRuntime = await import("react/jsx-runtime");

test("Learning Hub keeps its compatible route, progress logic, and tool learning links", async () => {
  const page = source("pages/student-dashboard.js");
  const en = await renderPage("pages/student-dashboard.js", "en");
  const ar = await renderPage("pages/student-dashboard.js", "ar");
  assert.match(en, /Learning Hub/);
  assert.match(ar, /مركز التعلّم/);
  assert.doesNotMatch(`${en}${ar}`, /Student Dashboard|لوحة الطالبة/);
  assert.match(page, /lingualab-learning-progress/);
  assert.match(page, /completedCount/);
  assert.match(page, /togglePath/);
  assert.match(page, /resetProgress/);
  assert.match(page, /`\$\{path\.href\}\?from=learn`/);
});

test("Projects is a bilingual research navigator without persistence or fake upload", async () => {
  const page = source("pages/projects.js");
  const en = await renderPage("pages/projects.js", "en");
  const ar = await renderPage("pages/projects.js", "ar");
  assert.match(en, /RESEARCH PROJECT NAVIGATOR/);
  assert.match(en, /How can this path help my research/);
  assert.match(ar, /دليل المشاريع البحثية/);
  assert.match(ar, /كيف يخدمني هذا المسار/);
  assert.doesNotMatch(page, /type="file"|type="checkbox"|sessionStorage|localStorage|useEffect/);
  assert.match(page, /fetch\("\/api\/project-prototype-guidance"/);
  assert.doesNotMatch(`${en}${ar}`, /Student Dashboard|لوحة الطالبة|رفع المشروع|Upload project/);
  assert.doesNotMatch(ar, /ارفعي|اختاري|اكتبي|ألصقي|حددي/);
  assert.match(source("styles/Projects.module.css"), /font-family:\s*var\(--font-ui\)/);
  assert.doesNotMatch(source("styles/Projects.module.css"), /font-family:\s*Arial/);
});

test("visible learning navigation no longer uses the Student Dashboard identity", () => {
  for (const path of ["pages/projects.js", "pages/profile.js", "pages/student-dashboard.js"])
    assert.doesNotMatch(source(path), /Student Dashboard|لوحة الطالبة/);
  assert.match(source("pages/profile.js"), /href="\/student-dashboard">مركز التعلّم/);
});

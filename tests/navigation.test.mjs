import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const swc = require("next/dist/build/swc");
await swc.loadBindings();
const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("Home exposes exactly the four canonical intent destinations", () => {
  const home = source("pages/index.js");
  const goals = home.slice(home.indexOf("const goals = ["), home.indexOf("const workflow = ["));
  for (const [key, href] of [
    ["research", "/ar-tools"], ["analyze", "/tools/analyze"], ["build", "/tools/prompt"], ["learn", "/student-dashboard"],
  ]) {
    assert.match(goals, new RegExp(`key: "${key}"[\\s\\S]*?href: "${href.replaceAll("/", "\\/")}"`));
  }
  assert.equal((goals.match(/key: /g) || []).length, 4);
  assert.match(source("lib/i18n/en.js"), /Capabilities overview/);
  assert.match(home, /href="\/ar-tools#all-tools"/);
});

test("All Tools is the secondary directory and non-analysis tool back links target it", () => {
  const hub = source("pages/ar-tools.js");
  assert.match(hub, /id="all-tools"/);
  assert.match(hub, /aria-labelledby="all-tools-title"/);
  assert.match(hub, /hub\.allToolsLabel/);
  assert.ok(hub.indexOf("hub.pathTitle") < hub.indexOf('id="all-tools"'));

  assert.match(source("components/Layout.js"), /backHref = "\/ar-tools#all-tools"/);
  assert.match(source("pages/tools/colab.js"), /backHref="\/ar-tools#build-tools"/);

  for (const path of [
    "components/Layout.js",
    "pages/index.js",
    "pages/ar-tools.js",
    "pages/student-dashboard.js",
    "pages/tools/frequency.js",
    "pages/tools/pos.js",
    "pages/tools/colab.js",
  ]) assert.doesNotMatch(source(path), /href="\/tools"/);
});

test("corpus-analysis tools return to Analyze instead of the Research Interpreter section", () => {
  for (const path of ["pages/tools/frequency.js", "pages/tools/pos.js"]) {
    assert.match(source(path), /backHref="\/tools\/analyze"/);
    assert.doesNotMatch(source(path), /href="\/ar-tools#all-tools"/);
  }
  for (const path of ["pages/tools/concordance.js", "pages/tools/ngrams.js"]) {
    assert.match(source(path), /backHref="\/tools\/analyze"/);
  }
});

test("Research Hub retains context-aware research destinations", () => {
  const hub = source("pages/ar-tools.js");
  assert.match(hub, /researchContextHref\(href, context\)/);
  assert.match(hub, /contextHref\("\/research-advisor"\)/);
  assert.match(hub, /"\/workspace\?copilot=1"/);
  assert.match(hub, /link\.copilot/);
  assert.match(hub, /href=\{contextHref\(tool\.link\)\}/);
});

test("main Research Hub navigation uses one consistent name", () => {
  for (const path of ["pages/workspace.js", "pages/research-advisor.js"]) {
    const page = source(path);
    const navigation = page.slice(page.indexOf("<nav"), page.indexOf("</nav>"));
    assert.match(navigation, /href="\/ar-tools"[^>]*>\{t\("nav\.researchHub"\)\}<\/Link>/);
    assert.doesNotMatch(navigation, /Research Tools/);
  }
});

test("Learning Hub identifies operational links as learning paths", () => {
  const learning = source("pages/student-dashboard.js");
  assert.match(learning, /learning\.pathsTitle/);
  assert.match(source("lib/i18n/en.js"), /Choose a learning path to practice/);
  for (const href of ["/tools/analyze", "/tools/prompt", "/tools/code", "/tools/excel"])
    assert.ok(learning.includes(`href: "${href}"`));
});

test("Frequency, POS, and Colab remain renderable as standalone routes", async () => {
  for (const name of ["frequency", "pos", "colab"]) {
    const { code } = await swc.transform(source(`pages/tools/${name}.js`), {
      jsc: { parser: { syntax: "ecmascript", jsx: true }, transform: { react: { runtime: "automatic" } } },
      module: { type: "commonjs" },
    });
    const exports = {};
    const scope = {
      exports,
      require(module) {
        if (module === "react") return React;
        if (module === "next/link") return function MockLink({ children, ...props }) { return React.createElement("a", props, children); };
        if (module === "next/router") return { useRouter: () => ({ asPath: `/tools/${name}` }) };
        if (module === "../../components/Layout") return function MockLayout({ children, backHref }) { return React.createElement("main", null, React.createElement("a", { href: backHref }, "Back"), children); };
        if (module === "../../components/LanguageProvider") return { useLanguage: () => ({ language: "en" }) };
        if (module === "../../styles/AnalysisTool.module.css") return new Proxy({}, { get: (_, key) => String(key) });
        if (module === "../../lib/tool-handoff") return { readToolHandoff: () => null };
        if (module === "../../lib/report-context") return { createReportContext: () => "/research-report?reportId=test" };
        return require(module);
      },
    };
    vm.createContext(scope);
    vm.runInContext(code, scope);
    const html = renderToStaticMarkup(React.createElement(exports.default));
    assert.match(html, name === "colab" ? /href="\/ar-tools#build-tools"/ : /href="\/tools\/analyze"/);
  }
});

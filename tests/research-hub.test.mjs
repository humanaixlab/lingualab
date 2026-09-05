import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import vm from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const swc = require("next/dist/build/swc");
await swc.loadBindings();
const hubSource = readFileSync(new URL("../pages/ar-tools.js", import.meta.url), "utf8");
const helperSource = readFileSync(new URL("../lib/research-context.js", import.meta.url), "utf8").replaceAll("export function", "function").replaceAll("export const", "const");
const workspaceSource = readFileSync(new URL("../pages/workspace.js", import.meta.url), "utf8");
const { code } = await swc.transform(hubSource, {
  jsc: { parser: { syntax: "ecmascript", jsx: true }, transform: { react: { runtime: "automatic" } } },
  module: { type: "commonjs" },
});
const current = { source: "dataset-understanding", handoffId: "current-five", fileName: "current.csv", rows: 5, createdAt: new Date().toISOString() };
const query = "?from=workspace&handoffId=current-five";
const hubCopy = {
  "nav.openWorkspace": "Open Workspace", "nav.researchAdvisor": "Research Advisor", "hub.pageName": "Research Hub", "hub.heroTitle": "Choose the next step in your research workflow.", "hub.heroText": "Research journey", "hub.currentDataset": "Current dataset: {filename} · {count} records", "hub.guidanceLabel": "GENERAL WORKFLOW GUIDANCE", "hub.pathTitle": "Recommended Research Path", "hub.pathText": "General path", "hub.allToolsLabel": "SECONDARY DIRECTORY", "hub.allToolsTitle": "All Tools", "hub.allToolsText": "Browse tools", "hub.featured": "Featured",
};
for (const [key, title] of Object.entries({ understand: "Understand your dataset", design: "Design your study", explore: "Explore linguistic patterns", run: "Run or prepare analysis", report: "Review and report" })) { hubCopy[`hub.stages.${key}.title`] = title; hubCopy[`hub.stages.${key}.description`] = "Description"; }
for (const [key, label] of Object.entries({ workspace: "Open Workspace", copilot: "Use Research Copilot", advisor: "Research Advisor", frequency: "Frequency", concordance: "Concordance", ngrams: "N-grams", analyze: "Analyze", code: "Code", excel: "Excel", colab: "Colab", report: "Research Report" })) for (const stage of ["understand", "design", "explore", "run", "report"]) hubCopy[`hub.stages.${stage}.${key}`] = label;
const testTranslate = (key, variables = {}) => String(hubCopy[key] || key).replace(/\{(\w+)\}/g, (_, name) => variables[name]);

function harness(saved = null, search = "") {
  let context = null;
  let effect;
  let frame;
  const listeners = {};
  const exports = {};
  const scope = {
    URLSearchParams, exports,
    sessionStorage: {
      getItem(key) { assert.equal(key, "lingualab-advisor-context"); return saved; },
      setItem(key, value) { assert.equal(key, "lingualab-advisor-context"); saved = value; },
    },
    window: {
      location: { search, href: "" }, crypto: { randomUUID },
      requestAnimationFrame(fn) { frame = fn; return 1; }, cancelAnimationFrame() {},
      setTimeout() { return 1; }, clearTimeout() {},
      addEventListener(name, fn) { listeners[name] = fn; }, removeEventListener() {},
    },
    require(name) {
      if (name === "react") return { ...React, useEffect: (fn) => { effect = fn; }, useState: () => [context, (value) => { context = value; }] };
      if (name === "next/router") return { useRouter: () => ({ asPath: "/ar-tools" + search }) };
      if (name === "next/link") return function MockLink({ children, ...props }) { return React.createElement("a", props, children); };
      if (name === "../lib/research-context") return { readResearchContext: scope.readResearchContext, researchContextHref: scope.researchContextHref, RESEARCH_CONTEXT_TTL_MS: 30 * 60 * 1000 };
      if (name === "../components/LanguageProvider") return { useLanguage: () => ({ language: "en", direction: "ltr", t: testTranslate }) };
      if (name === "../components/ResearchPaths") return function MockResearchPaths() { return React.createElement("section", { "data-testid": "research-paths" }); };
      return require(name);
    },
  };
  vm.createContext(scope);
  vm.runInContext(helperSource, scope);
  vm.runInContext(code, scope);
  return {
    scope, stored: () => JSON.parse(saved),
    render() { return renderToStaticMarkup(exports.default()); },
    mount() { exports.default(); effect(); frame(); },
    invalidate() { saved = null; listeners.focus(); },
  };
}

test("no-context Hub retains its independent five-stage navigation", () => {
  const h = harness(); h.mount();
  const html = h.render();
  assert.doesNotMatch(html, /Current dataset:|handoffId=/);
  for (const stage of ["Understand your dataset", "Design your study", "Explore linguistic patterns", "Run or prepare analysis", "Review and report"]) assert.ok(html.includes(stage));
  for (const href of ["/workspace", "/research-advisor", "/tools/analyze", "/tools/code", "/tools/excel", "/tools/colab", "/tools/prompt"]) assert.ok(html.includes(`href="${href}"`));
});

test("current metadata is shown and only supported destinations receive it", () => {
  const h = harness(JSON.stringify(current), query); h.mount();
  const html = h.render();
  assert.match(html, /Current dataset: current.csv · 5 records/);
  for (const href of ["/research-advisor", "/tools/analyze"]) assert.ok(html.includes(`href="${href}?from=workspace&amp;handoffId=current-five"`));
  assert.ok(html.includes('href="/workspace?copilot=1&amp;from=workspace&amp;handoffId=current-five"'));
  for (const href of ["/workspace", "/tools/code", "/tools/excel", "/tools/colab", "/tools/prompt", "/tools/frequency", "/tools/concordance", "/tools/ngrams"]) assert.ok(html.includes(`href="${href}"`));
  h.invalidate();
  assert.doesNotMatch(h.render(), /Current dataset:|handoffId=/);
});

test("stale, missing, malformed, and mismatched handoffs are not displayed or forwarded", () => {
  for (const [saved, search] of [
    [JSON.stringify({ ...current, handoffId: "stale", rows: 30 }), query],
    [JSON.stringify(current), ""], [JSON.stringify(current), "?handoffId=current-five"],
    [null, query], ["invalid JSON", query], [JSON.stringify({ ...current, rows: "5" }), query],
  ]) {
    const h = harness(saved, search); h.mount();
    assert.doesNotMatch(h.render(), /Current dataset:|handoffId=/);
  }
});

test("Workspace hands off fresh metadata, replacing stale context without raw rows", () => {
  const h = harness(JSON.stringify({ ...current, handoffId: "stale", rows: 30 }));
  const section = (start, end) => workspaceSource.slice(workspaceSource.indexOf(start), workspaceSource.indexOf(end, workspaceSource.indexOf(start)));
  vm.runInContext(section("function buildAdvisorContext(", "function buildPotentialOutcomes(") + section("  function openResearchHub(", "  async function designMyStudy("), h.scope);
  h.scope.result = { ...current, columns: 2, headers: ["text", "label"], arabicRatio: 1, missingPercent: 0, labelDistribution: [], recommendation: { type: "classification", title: "Classification" }, rawRows: ["must not transfer"] };
  h.scope.datasetRows = [];
  h.scope.selectedTextColumn = "text";
  h.scope.selectedLabelColumn = "label";
  let prevented = false;
  h.scope.openResearchHub({ preventDefault() { prevented = true; } });
  assert.ok(prevented);
  const saved = h.stored();
  assert.equal(saved.rows, 5);
  assert.notEqual(saved.handoffId, "stale");
  assert.equal(saved.rawRows, undefined);
  const url = new URL(h.scope.window.location.href, "https://example.test");
  assert.equal(url.pathname, "/ar-tools");
  assert.equal(url.searchParams.get("handoffId"), saved.handoffId);
  assert.equal(h.scope.readResearchContext(url.search).rows, 5);
  h.scope.result = null;
  prevented = false;
  h.scope.openResearchHub({ preventDefault() { prevented = true; } });
  assert.equal(prevented, false);
});

test("30-minute TTL rejects expired, missing, invalid, and future timestamps", () => {
  for (const createdAt of [new Date(Date.now() - 30 * 60 * 1000).toISOString(), undefined, "invalid", new Date(Date.now() + 60000).toISOString()]) {
    const h = harness(JSON.stringify({ ...current, createdAt }), query); h.mount();
    assert.doesNotMatch(h.render(), /Current dataset:|handoffId=/);
  }
  const h = harness(JSON.stringify({ ...current, createdAt: new Date(Date.now() - 29 * 60 * 1000).toISOString() }), query);
  h.mount();
  assert.match(h.render(), /Current dataset: current.csv/);
});

test("Analyze adapter makes labeled Arabic metadata interpretable without planner changes", () => {
  const h = harness();
  const source = readFileSync(new URL("../pages/tools/analyze.js", import.meta.url), "utf8");
  vm.runInContext(source.slice(source.indexOf("const DEFAULT_PLAN"), source.indexOf("export default function Analyzer")), h.scope);
  const adapted = h.scope.analyzeContext({ ...current, labelColumn: "label", arabicPercent: 100 });
  const plan = h.scope.buildPlan(adapted);
  assert.equal(plan.title, "Start with the strongest testable signal.");
  assert.equal(plan.eyebrow, "AI ANALYSIS PLANNER · ARABIC DATA");
  assert.equal(h.scope.buildPlan(h.scope.analyzeContext({ ...current, labelColumn: "Not detected", arabicPercent: 0 })).title, "Explore the corpus before choosing a model.");
  assert.equal(h.scope.analyzeContext(null), null);
});

test("Hub Copilot opens with metadata, sends the existing payload, and rejects expiry before submission", async () => {
  const initial = harness();
  const rows = Array.from({ length: 5 }, (_, i) => ({ text: "PRIVATE ROW " + i, label: i < 3 ? "A" : "B" }));
  const dataset = { rows: 5, columns: 2, headers: ["text", "label"], arabicRatio: 1, missingPercent: 0, duplicateCount: 0, recommendation: { type: "Supervised classification" } };
  const metadata = initial.scope.hubCopilotMetadata(dataset, rows, "text", "label");
  assert.equal(metadata.classCount, 2);
  const h = harness(JSON.stringify({ ...current, copilotMetadata: metadata }), query + "&copilot=1");
  const scope = h.scope;
  let calls = 0;
  let payload;
  Object.assign(scope, {
    AbortController, result: null, datasetRows: [], selectedLabelColumn: "", copilotStatus: "idle", researchGoal: "Study Arabic", language: "en",
    setHubCopilotContext: (value) => { scope.hubCopilotContext = value; },
    setCopilotOpen: (value) => { scope.copilotOpen = value; },
    setCopilotStatus: (value) => { scope.copilotStatus = value; },
    setCopilotError: (value) => { scope.copilotError = value; },
    setStudyDesign: (value) => { scope.studyDesign = value; },
    fetch: async (url, options) => {
      assert.equal(url, "/api/research-copilot");
      calls += 1; payload = JSON.parse(options.body);
      return { ok: true, json: async () => ({ design: {} }) };
    },
  });
  const effect = workspaceSource.slice(workspaceSource.indexOf("  useEffect(() => {") + "  useEffect(() => {".length, workspaceSource.indexOf("  }, [router.asPath]);"));
  vm.runInContext(`(function(){${effect}})()`, scope);
  // Flush the mount effect's animation frame without rendering the Hub.
  scope.window.requestAnimationFrame = (fn) => { fn(); return 1; };
  vm.runInContext(`(function(){${effect}})()`, scope);
  assert.equal(scope.hubCopilotContext.rows, 5);
  assert.equal(scope.copilotOpen, true);
  assert.equal(scope.result, null);
  assert.deepEqual(scope.datasetRows, []);
  vm.runInContext(workspaceSource.slice(workspaceSource.indexOf("  async function designMyStudy()"), workspaceSource.indexOf("  function runWorkflow()")), scope);
  await scope.designMyStudy();
  assert.deepEqual(payload, JSON.parse(JSON.stringify({ ...metadata, researchGoal: "Study Arabic", uiLanguage: "en" })));
  assert.doesNotMatch(JSON.stringify(payload), /PRIVATE ROW/);
  assert.equal(scope.copilotStatus, "success");
  const expiredNow = Date.now() + 31 * 60 * 1000;
  scope.Date = class extends Date { static now() { return expiredNow; } };
  await scope.designMyStudy();
  assert.equal(calls, 1);
  assert.equal(scope.copilotStatus, "error");
  assert.match(scope.copilotError, /expired or changed/);
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { RESEARCH_PATHS } from "../lib/research-paths.js";
import { readResearchPathContext, researchPathHref, researchPathNavigation } from "../lib/research-path-context.js";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("the seven bilingual computational-linguistics research paths are defined", () => {
  assert.equal(RESEARCH_PATHS.length, 7);
  assert.deepEqual(RESEARCH_PATHS.map((path) => path.id), [
    "corpus-linguistics",
    "text-classification",
    "morphology-syntax",
    "semantics",
    "discourse-pragmatics",
    "information-extraction",
    "language-technology",
  ]);
  for (const path of RESEARCH_PATHS) {
    for (const field of ["name", "overview", "question", "data", "output", "report", "beginner", "advanced"])
      assert.ok(path[field].en && path[field].ar, `${path.id}.${field} must be bilingual`);
    assert.ok(Array.isArray(path.available));
    assert.ok(path.coming.en.length && path.coming.ar.length);
  }
});
test("available tools map only to routes that exist in the current product", () => {
  const allowed = new Set([
    "/workspace",
    "/tools/frequency",
    "/tools/concordance",
    "/tools/ngrams",
    "/tools/pos",
    "/tools/prompt",
    "/tools/code",
    "/tools/excel",
    "/tools/colab",
  ]);
  for (const path of RESEARCH_PATHS) {
    for (const tool of path.available) {
      assert.ok(allowed.has(tool.href), `${tool.href} is not an approved existing route`);
      assert.ok(tool.en && tool.ar);
    }
  }
  assert.deepEqual(RESEARCH_PATHS.find((path) => path.id === "semantics").available, []);
  assert.deepEqual(RESEARCH_PATHS.find((path) => path.id === "discourse-pragmatics").available, []);
  assert.deepEqual(RESEARCH_PATHS.find((path) => path.id === "information-extraction").available, []);
});

test("every available tool carries only matching lightweight path metadata", () => {
  for (const path of RESEARCH_PATHS) {
    for (const tool of path.available) {
      const href = researchPathHref(tool.href, path.id);
      const url = new URL(href, "https://lingualab.test");
      assert.equal(url.searchParams.get("from"), "research-path");
      assert.equal(url.searchParams.get("pathId"), path.id);
      assert.equal(url.searchParams.get("sourcePath"), path.id);
      assert.equal(url.searchParams.get("sourceSection"), "research-paths");
      assert.doesNotMatch(href, /dataset|rows|text=|file|content/i);
    }
  }
});

test("path-aware back navigation accepts only the canonical tool and path pairing", () => {
  const href = researchPathHref("/tools/frequency", "corpus-linguistics");
  const context = readResearchPathContext(href, "/tools/frequency");
  assert.deepEqual(context, { pathId: "corpus-linguistics", sourcePath: "corpus-linguistics", sourceSection: "research-paths" });
  assert.deepEqual(researchPathNavigation(context, "en", "Frequency"), {
    href: "/ar-tools#corpus-linguistics",
    backLabel: "Back to Corpus Linguistics",
    crumbs: ["Research Path", "Corpus Linguistics", "Frequency"],
  });
  assert.equal(readResearchPathContext(href, "/tools/pos"), null);
  assert.equal(readResearchPathContext("/tools/frequency?from=research-path&pathId=semantics&sourcePath=semantics&sourceSection=research-paths", "/tools/frequency"), null);
});

test("Coming next capabilities are non-interactive and never receive routes", () => {
  for (const path of RESEARCH_PATHS) {
    for (const item of [...path.coming.en, ...path.coming.ar]) assert.equal(typeof item, "string");
  }
  const component = source("components/ResearchPaths.js");
  assert.match(component, /id="research-paths"/);
  assert.match(component, /path\.coming\[locale\]\.map\(\(item\) => <li/);
  assert.doesNotMatch(component, /path\.coming[\s\S]{0,160}<Link/);
});

test("canonical homes remain separated across Analyze, Build, Research, Workspace, and Learn", () => {
  const hub = source("pages/ar-tools.js");
  const analyze = source("pages/tools/analyze.js");
  assert.match(analyze, /href="\/ar-tools#research-paths"/);
  assert.equal((analyze.match(/CORPUS_TOOLS\.map/g) || []).length, 1);
  assert.match(hub, /Prepare data → Generate \/ review code → Run \/ reproduce → Evaluate/);
  assert.match(hub, /section\.key === "writing" \? "writing-tools"/);
  assert.match(source("lib/research-paths.js"), /href: "\/tools\/prompt"[^\n]+contextual: true/);
  assert.doesNotMatch(source("pages/workspace.js"), /<ResearchPaths|RESEARCH_PATHS\.map/);
  assert.doesNotMatch(source("pages/student-dashboard.js"), /<ResearchPaths|RESEARCH_PATHS\.map/);
  assert.match(source("pages/_app.js"), /<SmartAssistant \/>/);
});

test("Research Paths layer preserves the existing assistant and Workspace role", () => {
  assert.match(source("pages/ar-tools.js"), /<ResearchPaths language=\{language\} \/>/);
  assert.match(source("pages/_app.js"), /<SmartAssistant \/>/);
  const workspace = source("pages/workspace.js");
  assert.doesNotMatch(workspace, /ResearchPaths|RESEARCH_PATHS|Explore by Research Path|استكشف حسب المسار البحثي/);
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { RESEARCH_PATHS } from "../lib/research-paths.js";

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

test("Coming next capabilities are non-interactive and never receive routes", () => {
  for (const path of RESEARCH_PATHS) {
    for (const item of [...path.coming.en, ...path.coming.ar]) assert.equal(typeof item, "string");
  }
  const component = source("components/ResearchPaths.js");
  assert.match(component, /path\.coming\[locale\]\.map\(\(item\) => <li/);
  assert.doesNotMatch(component, /path\.coming[\s\S]{0,160}<Link/);
});

test("Research Paths layer preserves the existing assistant and Workspace role", () => {
  assert.match(source("pages/ar-tools.js"), /<ResearchPaths language=\{language\} \/>/);
  assert.match(source("pages/_app.js"), /<SmartAssistant \/>/);
  const workspace = source("pages/workspace.js");
  assert.doesNotMatch(workspace, /ResearchPaths|RESEARCH_PATHS|Explore by Research Path|استكشف حسب المسار البحثي/);
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { reportReturnTarget } from "../lib/navigation-flow.js";
import { createReportContext, readReportContext } from "../lib/report-context.js";
import { PROJECT_CATALOG, buildProjectRoadmap } from "../lib/project-catalog.js";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const memoryStorage = () => {
  const values = new Map();
  return { getItem: (key) => values.get(key) || null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) };
};

const workflows = [
  ["morphology-syntax", "morphology-syntax", "/research-planner#morphology-syntax"],
  ["semantics", "semantics", "/research-planner#semantics"],
  ["discourse-analysis", "discourse-pragmatics", "/research-planner#discourse-pragmatics"],
  ["pragmatics", "discourse-pragmatics", "/research-planner#discourse-pragmatics"],
  ["text-classification", "text-classification", "/research-planner#build-tools"],
  ["information-extraction", "information-extraction", "/research-planner#build-tools"],
  ["nlp-experiments", "nlp-experiments", "/research-planner#build-tools"],
];

test("reviewed non-corpus results preserve source, AI, human decision, and final output through report handoff", () => {
  for (const [sourceTool, pathId, home] of workflows) {
    const storage = memoryStorage();
    const now = 1_900_000_000_000;
    const url = createReportContext(sourceTool, "reviewed-analysis", {
      pathId,
      taskLabel: "Task",
      sourceText: "نص عربي",
      aiOutput: { category: "AI" },
      researcherDecision: "edit",
      finalOutput: { category: "Human" },
      returnHref: `/tools/${sourceTool}`,
    }, storage, now);
    const context = readReportContext(new URL(url, "https://example.test").search, storage, now);
    assert.equal(context.sourceTool, sourceTool);
    assert.equal(context.pathId, pathId);
    assert.deepEqual(JSON.parse(context.payload.aiOutput), { category: "AI" });
    assert.equal(context.payload.researcherDecision, "edit");
    assert.deepEqual(JSON.parse(context.payload.finalOutput), { category: "Human" });
    assert.equal(reportReturnTarget(sourceTool, "en", pathId).href, home);
  }
});

test("missing, stale, malformed, or mismatched report handoffs fail safely", () => {
  const storage = memoryStorage();
  assert.equal(readReportContext("", storage), null);
  assert.throws(() => createReportContext("unknown", "reviewed-analysis", {}, storage), /Unsupported/);
  const url = createReportContext("semantics", "reviewed-analysis", { pathId: "morphology-syntax", finalOutput: { result: "x" } }, storage, 1000);
  const context = readReportContext(new URL(url, "https://example.test").search, storage, 1000);
  assert.equal(context.pathId, null);
  assert.equal(readReportContext(new URL(url, "https://example.test").search, storage, 1000 + 31 * 60 * 1000), null);
});

test("all non-corpus preview tools expose report continuation only after an actual result or review", () => {
  for (const [tool] of workflows) {
    const filename = tool === "text-classification" ? "text-classification-research" : tool;
    const page = source(`pages/tools/${filename}.js`);
    assert.match(page, /ResearchCompletionActions/);
    assert.doesNotMatch(page, /href="\/tools\/analyze"/);
  }
  assert.doesNotMatch(source("pages/research-advisor.js"), /<Link href="\/research-advisor"/);
});

test("project execution roads preserve project context and avoid repeated or generic destinations", () => {
  for (const project of PROJECT_CATALOG) {
    const roadmap = buildProjectRoadmap(project);
    const linked = roadmap.filter((step) => step.href);
    assert.equal(new Set(linked.map((step) => step.href)).size, linked.length, `${project.id} has a duplicate linked destination`);
    const executionLink = roadmap.find((step) => step.stage === "tool").href || roadmap.find((step) => step.stage === "data").href;
    assert.match(executionLink, new RegExp(`project=${project.id}`));
    assert.doesNotMatch(JSON.stringify(roadmap), /\/tools\/analyze|\/research-report/);
  }
});

test("the study overview does not link interpretation or reporting to premature duplicate destinations", () => {
  const hub = source("pages/research-planner.js");
  assert.match(hub, /\{ key: "analysis", href: "\/tools\/analyze" \}/);
  assert.match(hub, /\{ key: "interpretation", href: null \}/);
  assert.match(hub, /\{ key: "report", href: null \}/);
  assert.doesNotMatch(hub, /\{ key: "interpretation", href: "\/tools\/analyze" \}/);
  assert.doesNotMatch(hub, /\{ key: "report", href: "\/research-report" \}/);
});

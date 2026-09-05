import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createReportContext, readReportContext, REPORT_CONTEXT_KEY, REPORT_CONTEXT_TTL_MS } from "../lib/report-context.js";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

function storage() {
  const values = new Map();
  return { getItem: (key) => values.get(key) || null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key), values };
}

test("report handoff is source-specific, matched, fresh, and contains result data only", () => {
  const store = storage();
  const url = createReportContext("concordance", "concordance", { target: "term", contexts: ["real context"], rawRows: [{ secret: true }] }, store, 1000);
  const reportId = new URL(url, "https://example.test").searchParams.get("reportId");
  const context = readReportContext(`?reportId=${reportId}`, store, 1500);
  assert.equal(context.sourceTool, "concordance");
  assert.equal(context.analysisType, "concordance");
  assert.deepEqual(context.payload.contexts, ["real context"]);
  assert.equal("rawRows" in context.payload, false);
  assert.equal(context.availableSpatialData, false);
  assert.equal(readReportContext("?reportId=wrong", store, 1500), null);
});

test("expired, malformed, and unavailable report storage fails safely", () => {
  const store = storage();
  const url = createReportContext("frequency", "frequency", { wordCount: 2, frequencies: [["a", 2]] }, store, 1000);
  const reportId = new URL(url, "https://example.test").searchParams.get("reportId");
  assert.equal(readReportContext(`?reportId=${reportId}`, store, 1000 + REPORT_CONTEXT_TTL_MS + 1), null);
  assert.equal(store.getItem(REPORT_CONTEXT_KEY), null);
  store.setItem(REPORT_CONTEXT_KEY, "not json");
  assert.equal(readReportContext("?reportId=x", store, 1000), null);
  assert.equal(createReportContext("frequency", "frequency", { frequencies: [["a", 1]] }, { setItem() { throw new Error("blocked"); } }, 1000), null);
});

test("completed analysis sources expose Generate Report without changing analysis logic", () => {
  for (const path of ["pages/tools/frequency.js", "pages/tools/concordance.js", "pages/tools/ngrams.js"]) {
    const page = source(path);
    assert.match(page, /createReportContext/);
    assert.match(page, /إنشاء تقرير/);
    assert.match(page, /Generate Report/);
  }
  assert.match(source("pages/tools/analyze.js"), /createReportContext\(sourceAnalysis\?\.sourceTool \|\| "interpreter", "interpretation"/);
  assert.match(source("pages/research-advisor.js"), /createReportContext\("advisor", "methodology"/);
  assert.match(source("pages/workspace.js"), /createReportContext\("copilot", "methodology"/);
  assert.doesNotMatch(source("pages/tools/pos.js"), /Generate Report|إنشاء تقرير/);
});

test("Research Report provides Standard, Visual, and conditional Diagram views", () => {
  const report = source("pages/research-report.js");
  assert.match(report, /standard: "Standard"/);
  assert.match(report, /visual: "Visual"/);
  assert.match(report, /diagram: "Diagram"/);
  assert.match(report, /disabled=\{!context\.availableWorkflow\}/);
  assert.match(report, /context\.analysisType === "pos"/);
  assert.match(report, /className="barChart"/);
  assert.match(report, /className="donut"/);
  assert.match(report, /className="workflowDiagram"/);
  assert.doesNotMatch(report, /mapbox|leaflet|google\.maps|timeSeries/);
});

test("methodology reports diagram only actual supplied workflow steps", () => {
  const store = storage();
  const url = createReportContext("advisor", "methodology", { researchGoal: "Goal", workflow: ["Collect", "Analyze"], extraStage: "Invented" }, store, 1000);
  const reportId = new URL(url, "https://example.test").searchParams.get("reportId");
  const context = readReportContext(`?reportId=${reportId}`, store, 1001);
  assert.equal(context.availableWorkflow, true);
  assert.deepEqual(context.payload.workflow, ["Collect", "Analyze"]);
  assert.equal("extraStage" in context.payload, false);
});

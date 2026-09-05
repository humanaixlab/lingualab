import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  ANALYSIS_HANDOFF_KEY,
  ANALYSIS_HANDOFF_TTL_MS,
  createAnalysisHandoff,
  readAnalysisHandoff,
} from "../lib/analysis-handoff.js";
import {
  ANALYZE_HOME,
  BUILD_HOME,
  LEARN_HOME,
  RESEARCH_HOME,
  TOOL_OWNERSHIP,
  reportReturnTarget,
} from "../lib/navigation-flow.js";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

function storage() {
  const values = new Map();
  return {
    values,
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

test("analysis results reach the Interpreter through a fresh source-specific handoff", () => {
  const store = storage();
  const url = createAnalysisHandoff("frequency", "frequency", {
    text: "alpha beta alpha",
    frequencies: [["alpha", 2], ["beta", 1]],
    rawRows: [{ private: true }],
  }, store, 1000);
  const query = new URL(url, "https://example.test").search;
  const handoff = readAnalysisHandoff(query, store, 1001);

  assert.equal(handoff.sourceTool, "frequency");
  assert.equal(handoff.analysisType, "frequency");
  assert.equal(handoff.text, "alpha beta alpha");
  assert.deepEqual(handoff.evidence.frequencies, [["alpha", 2], ["beta", 1]]);
  assert.equal("rawRows" in handoff.evidence, false);
  assert.match(url, /^\/tools\/analyze\?interpretHandoff=.+#quick-analysis$/);
});

test("analysis handoffs reject stale, mismatched, malformed, and cross-workflow state", () => {
  const store = storage();
  const url = createAnalysisHandoff("concordance", "concordance", {
    text: "one target context",
    target: "target",
    contexts: ["one target context"],
  }, store, 1000);
  const id = new URL(url, "https://example.test").searchParams.get("interpretHandoff");

  assert.equal(readAnalysisHandoff("?interpretHandoff=wrong", store, 1001), null);
  assert.equal(readAnalysisHandoff(`?interpretHandoff=${id}`, store, 1000 + ANALYSIS_HANDOFF_TTL_MS), null);
  assert.equal(store.getItem(ANALYSIS_HANDOFF_KEY), null);

  store.setItem(ANALYSIS_HANDOFF_KEY, "not-json");
  assert.equal(readAnalysisHandoff("?interpretHandoff=x", store, 1001), null);
  store.setItem("lingualab-advisor-context", JSON.stringify({ handoffId: id }));
  assert.equal(readAnalysisHandoff(`?interpretHandoff=${id}`, store, 1001), null);
});

test("each tool has one canonical owner and the intended back/next hierarchy", () => {
  assert.equal(TOOL_OWNERSHIP.workspace.role, "project");
  assert.equal(TOOL_OWNERSHIP.researchAdvisor.home, RESEARCH_HOME);
  assert.equal(TOOL_OWNERSHIP.researchCopilot.home, RESEARCH_HOME);
  for (const key of ["frequency", "concordance", "ngrams", "pos", "interpreter"])
    assert.equal(TOOL_OWNERSHIP[key].home, ANALYZE_HOME);
  for (const key of ["prompt", "spreadsheet", "code", "colab"])
    assert.equal(TOOL_OWNERSHIP[key].home, BUILD_HOME);
  assert.equal(TOOL_OWNERSHIP.learn.home, LEARN_HOME);

  assert.deepEqual(reportReturnTarget("frequency", "en"), { href: "/tools/frequency", label: "Back to previous tool" });
  assert.deepEqual(reportReturnTarget("advisor", "ar"), { href: "/research-advisor", label: "العودة إلى الأداة السابقة" });
  assert.deepEqual(reportReturnTarget("copilot", "en"), { href: "/workspace", label: "Back to Workspace" });
});

test("result CTAs, research progression, Build backs, and Learn returns use canonical routes", () => {
  for (const name of ["frequency", "concordance", "ngrams"]) {
    const page = source(`pages/tools/${name}.js`);
    assert.match(page, /createAnalysisHandoff/);
    assert.match(page, /createReportContext/);
    assert.match(page, /backHref="\/tools\/analyze"/);
  }
  assert.doesNotMatch(source("pages/tools/pos.js"), /createAnalysisHandoff|createReportContext/);
  assert.match(source("pages/research-advisor.js"), /researchContextHref\("\/tools\/analyze", datasetContext\)/);
  assert.match(source("pages/workspace.js"), /onClick=\{openAnalyze\}/);
  assert.match(source("pages/tools/analyze.js"), /createReportContext\(sourceAnalysis\?\.sourceTool \|\| "interpreter"/);
  for (const name of ["prompt", "code", "excel", "colab"])
    assert.match(source(`pages/tools/${name}.js`), /backHref="\/ar-tools#build-tools"/);
  assert.match(source("pages/student-dashboard.js"), /`\$\{path\.href\}\?from=learn`/);
  assert.match(source("components/Layout.js"), /fromLearn \? "\/student-dashboard" : backHref/);
});

test("data-source indicators distinguish project context, transferred results, and standalone input", () => {
  const indicator = source("components/DataSourceIndicator.js");
  for (const label of [
    "Data source: Current project",
    "Data source: Standalone input",
    "Data source: Previous tool results",
    "مصدر البيانات: مشروعك الحالي",
    "مصدر البيانات: إدخال مستقل",
  ]) assert.ok(indicator.includes(label));

  assert.match(source("pages/workspace.js"), /mode="project"/);
  assert.match(source("pages/tools/analyze.js"), /sourceAnalysis \? "transferred" : context \? "projectContext" : "standalone"/);
  for (const name of ["frequency", "concordance", "ngrams", "pos", "prompt", "excel"])
    assert.match(source(`pages/tools/${name}.js`), /dataSource="standalone"/);

  const standalone = ["frequency", "concordance", "ngrams", "pos", "prompt", "code", "excel", "colab"]
    .map((name) => source(`pages/tools/${name}.js`)).join("\n");
  assert.doesNotMatch(standalone, /lingualab-advisor-context/);
});

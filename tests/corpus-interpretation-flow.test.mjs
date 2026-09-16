import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  ANALYSIS_HANDOFF_KEY,
  createAnalysisHandoff,
  readAnalysisHandoff,
  readAnalysisResultHandoff,
} from "../lib/analysis-handoff.js";
import { CORPUS_WORKFLOW_TTL_MS, createCorpusWorkflowHandoff, readCorpusWorkflowHandoff } from "../lib/corpus-workflow-context.js";
import { createReportContext, readReportContext } from "../lib/report-context.js";
import { reportReturnTarget } from "../lib/navigation-flow.js";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

function storage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

const CASES = {
  frequency: {
    text: "اللغة مهمة اللغة",
    frequencies: [["اللغة", 2], ["مهمة", 1]],
  },
  concordance: {
    text: "اللغة مهمة في البحث",
    target: "اللغة",
    contexts: ["اللغة مهمة في البحث"],
  },
  ngrams: {
    text: "اللغة العربية مهمة",
    size: 2,
    results: [["اللغة العربية", 1], ["العربية مهمة", 1]],
  },
  "corpus-research": {
    text: "اللغة العربية مهمة",
    documentCount: 1,
    wordCount: 3,
    query: "اللغة",
    frequencies: [["اللغة", 1]],
    contexts: ["اللغة العربية مهمة"],
    size: 2,
    ngrams: [["اللغة العربية", 1]],
  },
};

test("all Corpus Linguistics tools create contextual result handoffs", () => {
  for (const [sourceTool, input] of Object.entries(CASES)) {
    const store = storage();
    const url = createAnalysisHandoff(sourceTool, sourceTool, input, store, 1000);
    const handoff = readAnalysisHandoff(new URL(url, "https://example.test").search, store, 1001);
    assert.equal(handoff.pathId, "corpus-linguistics");
    assert.equal(handoff.sourceTool, sourceTool);
    assert.equal(handoff.text, input.text);
    assert.ok(handoff.evidence);
  }
});

test("legacy corpus handoffs remain contextual while invalid handoffs fail safely", () => {
  const store = storage();
  store.setItem(ANALYSIS_HANDOFF_KEY, JSON.stringify({
    version: 1,
    id: "legacy",
    destination: "interpreter",
    sourceTool: "frequency",
    analysisType: "frequency",
    createdAt: 1000,
    text: "اللغة اللغة",
    evidence: { frequencies: [["اللغة", 2]] },
  }));
  assert.equal(readAnalysisHandoff("?interpretHandoff=legacy", store, 1001).pathId, "corpus-linguistics");
  assert.equal(readAnalysisHandoff("?interpretHandoff=missing", store, 1001), null);

  store.setItem(ANALYSIS_HANDOFF_KEY, JSON.stringify({
    version: 2,
    id: "invalid",
    destination: "interpreter",
    pathId: "corpus-linguistics",
    sourceTool: "unknown",
    analysisType: "unknown",
    createdAt: 1000,
    text: "نص",
    evidence: {},
  }));
  assert.equal(readAnalysisHandoff("?interpretHandoff=invalid", store, 1001), null);
});

test("direct Analyze stays generic and valid corpus handoffs switch to contextual interpretation", () => {
  const page = source("pages/tools/analyze.js");
  assert.match(page, /const isCorpusInterpretation = sourceAnalysis\?\.pathId === "corpus-linguistics"/);
  assert.match(page, /!isCorpusInterpretation && <section className=\{styles\.hero\}/);
  assert.match(page, /!isCorpusInterpretation && !hasSelectedResearchPath && <section className=\{styles\.toolDirectory\} aria-labelledby="research-path-entry-title"/);
  assert.match(page, /!isCorpusInterpretation && !hasSelectedResearchPath && <section className=\{styles\.toolDirectory\} aria-labelledby="corpus-tools-title"/);
  assert.match(page, /!isCorpusInterpretation && <section[\s\S]*className=\{styles\.planner\}/);
  assert.match(page, /isCorpusInterpretation \? <ContextualCorpusResult/);
  assert.match(page, /تفسير نتائج لسانيات المدونات/);
  assert.match(page, /مصدر البيانات\/السياق/);
  assert.match(page, /النتيجة الفعلية المنقولة/);
  assert.match(page, /إعداد التقرير البحثي/);
});

test("frequency, concordance, n-grams, and Corpus Research preserve actual result context", () => {
  for (const tool of ["frequency", "concordance", "ngrams"]) {
    const page = source(`pages/tools/${tool}.js`);
    assert.match(page, new RegExp(`createAnalysisHandoff\\("${tool}", "${tool}"`));
  }
  const corpus = source("pages/tools/corpus-research.js");
  assert.match(corpus, /createAnalysisHandoff\("corpus-research", "corpus-research"/);
  for (const field of ["documentCount", "wordCount", "frequencies", "contexts", "ngrams"])
    assert.match(corpus, new RegExp(`${field}: results\\.${field}`));
});

test("corpus preparation, frequency, contexts, and n-grams form an ordered workflow", () => {
  const store = storage();
  const text = "اللغة العربية مهمة";
  const one = createCorpusWorkflowHandoff("corpus-research", "frequency", { text, result: { documentCount: 1, wordCount: 3 } }, store, 1000);
  assert.match(one, /^\/tools\/frequency\?/);
  assert.equal(readCorpusWorkflowHandoff(new URL(one, "https://example.test").search, "frequency", store, 1001).text, text);
  const two = createCorpusWorkflowHandoff("frequency", "concordance", { text, result: { frequencies: [["اللغة", 1]] } }, store, 2000);
  assert.match(two, /^\/tools\/concordance\?/);
  assert.deepEqual(readCorpusWorkflowHandoff(new URL(two, "https://example.test").search, "concordance", store, 2001).previousResult.frequencies, [["اللغة", 1]]);
  const three = createCorpusWorkflowHandoff("concordance", "ngrams", { text, result: { target: "اللغة", contexts: [text] } }, store, 3000);
  assert.match(three, /^\/tools\/ngrams\?/);
  assert.equal(readCorpusWorkflowHandoff(new URL(three, "https://example.test").search, "ngrams", store, 3001).previousResult.target, "اللغة");
  assert.equal(createCorpusWorkflowHandoff("frequency", "ngrams", { text, result: {} }, store, 4000), null);
  assert.equal(readCorpusWorkflowHandoff(new URL(three, "https://example.test").search, "ngrams", store, 3000 + CORPUS_WORKFLOW_TTL_MS), null);
});

test("contextual interpretation returns to the exact source result", () => {
  const store = storage();
  const url = createAnalysisHandoff("ngrams", "ngrams", CASES.ngrams, store, 1000);
  const handoff = readAnalysisHandoff(new URL(url, "https://example.test").search, store, 1001);
  assert.match(handoff.returnHref, /^\/tools\/ngrams\?/);
  const restored = readAnalysisResultHandoff(new URL(handoff.returnHref, "https://example.test").search, "ngrams", store, 1002);
  assert.equal(restored.text, CASES.ngrams.text);
  assert.deepEqual(restored.evidence.results, CASES.ngrams.results);
  assert.equal(readAnalysisResultHandoff(new URL(handoff.returnHref, "https://example.test").search, "frequency", store, 1002), null);
});

test("contextual reports preserve source evidence and return to the corpus path", () => {
  for (const [sourceTool, input] of Object.entries(CASES)) {
    const store = storage();
    const url = createReportContext(sourceTool, sourceTool, { ...input, interpretation: { interpretation: "تفسير مراجع" }, pathId: "corpus-linguistics" }, store, 1000);
    const report = readReportContext(new URL(url, "https://example.test").search, store, 1001);
    assert.equal(report.sourceTool, sourceTool);
    assert.equal(report.analysisType, sourceTool);
    assert.equal(report.pathId, "corpus-linguistics");
    assert.equal(report.payload.interpretation.interpretation, "تفسير مراجع");
  }
  assert.equal(reportReturnTarget("ngrams", "ar", "corpus-linguistics").href, "/research-paths/corpus-linguistics");
});

test("corpus path opens only executable stages and waits for a result before interpretation/report", () => {
  const path = source("pages/research-paths/corpus-linguistics.js");
  assert.doesNotMatch(path, /key: "interpret", href: "\/tools\/analyze"/);
  assert.doesNotMatch(path, /key: "report", href: "\/research-report"/);
  assert.match(path, /requiresResult: true/);
  assert.match(path, /researchPathHref\(stage\.href, "corpus-linguistics"/);
  assert.match(source("pages/tools/corpus-research.js"), /createCorpusWorkflowHandoff\("corpus-research", "frequency"/);
  assert.match(source("pages/tools/frequency.js"), /createCorpusWorkflowHandoff\("frequency", "concordance"/);
  assert.match(source("pages/tools/concordance.js"), /createCorpusWorkflowHandoff\("concordance", "ngrams"/);
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  ANALYSIS_HANDOFF_KEY,
  createAnalysisHandoff,
  readAnalysisHandoff,
} from "../lib/analysis-handoff.js";

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
  assert.match(page, /!isCorpusInterpretation && <section className=\{styles\.toolDirectory\} aria-labelledby="research-path-entry-title"/);
  assert.match(page, /!isCorpusInterpretation && <section className=\{styles\.toolDirectory\} aria-labelledby="corpus-tools-title"/);
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

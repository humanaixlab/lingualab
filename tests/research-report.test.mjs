import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../pages/research-report.js", import.meta.url), "utf8");

function loadHelpers() {
  const start = source.indexOf("function detectInterpretationLanguage");
  const end = source.indexOf("const REPORT_COPY");
  const scope = {};
  vm.createContext(scope);
  vm.runInContext(`${source.slice(start, end)}; this.detect = detectInterpretationLanguage; this.distribution = normalizeDistribution;`, scope);
  return scope;
}

test("Research Report detects stored interpretation language from descriptive fields", () => {
  const { detect } = loadHelpers();
  assert.equal(detect({ interpretation: "تشير النتائج إلى نمط لغوي أولي.", limitations: "لا تكفي العينة للتعميم." }), "ar");
  assert.equal(detect({ interpretation: "The findings suggest an initial pattern.", limitations: "The sample is too small to generalize." }), "en");
  assert.equal(detect({}), null);
});

test("Research Report regenerates through the existing interpreter with the exact UI language", () => {
  assert.match(source, /fetch\("\/api\/research-interpreter"/);
  assert.match(source, /body: JSON\.stringify\(\{ text: analysis\.text, wordCount: analysis\.wordCount, sentenceCount: analysis\.sentenceCount, topWords, uiLanguage: language \}\)/);
  assert.match(source, /Regenerate interpretation in English/);
  assert.match(source, /إعادة توليد التفسير بالعربية/);
  assert.match(source, /languageMismatch \? <div className="languageNotice"/);
});

test("visual report data accepts only real positive categorical values", () => {
  const { distribution } = loadHelpers();
  assert.deepEqual(Array.from(distribution({ A: 3, B: 2 }), (item) => Array.from(item)), [["A", 3], ["B", 2]]);
  assert.deepEqual(Array.from(distribution({ A: 0, B: -1, C: "bad" })), []);
  assert.match(source, /topWords\.length > 0 \|\| distribution\.length > 0/);
  assert.match(source, /maxFrequency/);
  assert.doesNotMatch(source, /lineChart|timeSeries|generatedChartData/);
});

test("report sections follow summary, metrics, visuals, interpretation, limitations, conclusions", () => {
  const ordered = ["report.summary", "copy.metrics", "copy.visuals", "copy.interpretation", "report.limitations", "copy.conclusions"];
  let cursor = -1;
  for (const token of ordered) {
    const next = source.indexOf(token, cursor + 1);
    assert.ok(next > cursor, `${token} must follow the previous report section`);
    cursor = next;
  }
});

test("report typography uses the active UI font and a page-sized title", () => {
  assert.match(source, /\.reportPage \{[\s\S]*?font-family: var\(--font-ui\)/);
  assert.match(source, /\.hero h1 \{[\s\S]*?font-size: var\(--text-page\)/);
  assert.match(source, /html\[lang="ar"\][\s\S]*?letter-spacing: 0/);
});

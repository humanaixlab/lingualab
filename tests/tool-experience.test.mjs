import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const corpusPages = ["frequency", "concordance", "ngrams", "pos"];

test("corpus tools share the Analyze return path and bilingual label", () => {
  for (const name of corpusPages) {
    const page = source(`pages/tools/${name}.js`);
    assert.match(page, /backHref="\/tools\/analyze"/);
    assert.match(page, /العودة إلى مركز التحليل/);
    assert.match(page, /Back to Analyze/);
    assert.doesNotMatch(page, /backHref="\/ar-tools|backHref="\/research/);
  }
});

test("result-producing corpus tools offer optional AI interpretation only in result UI", () => {
  for (const name of ["frequency", "concordance", "ngrams"]) {
    const page = source(`pages/tools/${name}.js`);
    assert.match(page, /Interpret results/);
    assert.match(page, /فسّر النتائج/);
    assert.match(page, /createAnalysisHandoff/);
  }
  assert.doesNotMatch(source("pages/tools/pos.js"), /Interpret results with AI/);
});

test("N-gram display labels are neutral while internal values remain numeric", () => {
  const page = source("pages/tools/ngrams.js");
  assert.match(page, /اختر نوع المتتالية/);
  assert.match(page, /ثنائيات \(Bigrams\)/);
  assert.match(page, /ثلاثيات \(Trigrams\)/);
  assert.match(page, /option value=\{2\}/);
  assert.match(page, /option value=\{3\}/);
  assert.doesNotMatch(page, /اختاري|ألصقي|اكتبي|حددي/);
});

test("Prompt Assistant localizes display copy without changing API values", () => {
  const page = source("pages/tools/prompt.js");
  assert.match(page, /Prompt Assistant/);
  assert.match(page, /مساعد التعليمات/);
  assert.match(page, /أنشئ تعليمات واضحة ومنظمة لمهام البحث والتحليل والكتابة/);
  for (const value of ["Text analysis", "Summarization", "Academic writing", "Academic", "Simple", "Formal", "Creative"]) {
    assert.ok(page.includes(`"${value}"`));
  }
  assert.match(page, /JSON\.stringify\(\{ taskType, topic, audience, style \}\)/);
});

test("Analyze is the single corpus-tool hub and Build shows a coherent sequence", () => {
  const analyze = source("pages/tools/analyze.js");
  for (const name of corpusPages) assert.ok(analyze.includes(`/tools/${name}`));
  assert.match(analyze, /AI Research Interpreter as a separate next stage/);
  const hub = source("pages/ar-tools.js");
  assert.match(hub, /Prepare data → Generate code → Run in Colab/);
  assert.match(hub, /language === "ar" \? "فتح الأداة" : "Open tool"/);
});

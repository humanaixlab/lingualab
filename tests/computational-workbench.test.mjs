import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("the computational section presents the complete bilingual research cycle", () => {
  const en = source("lib/i18n/en.js");
  const ar = source("lib/i18n/ar.js");
  assert.match(en, /Data → Prepare → Configure → Run → Evaluate → Interpret → Improve/);
  assert.match(ar, /البيانات ← التجهيز ← إعداد المهمة ← التشغيل ← التقييم ← التفسير ← التحسين/);
  assert.match(source("pages/ar-tools.js"), /hub\.architecture\.computational\.sequence/);
});

test("every canonical computational tool exposes the shared workbench", () => {
  for (const page of [
    "text-classification-research",
    "information-extraction",
    "nlp-experiments",
    "excel",
    "code",
    "colab",
  ]) {
    const content = source(`pages/tools/${page}.js`);
    assert.match(content, /import ComputationalWorkbench/);
    assert.match(content, /<ComputationalWorkbench/);
  }
});

test("the workbench visibly separates measured computation from AI-supported inference", () => {
  const component = source("components/ComputationalWorkbench.js");
  assert.match(component, /Deterministic computation/);
  assert.match(component, /AI-supported inference/);
  assert.match(component, /Measured outputs are calculated/);
  assert.match(component, /does not create measured results or human reference labels/);
  assert.match(component, /حوسبة حتمية/);
  assert.match(component, /استدلال مدعوم بالذكاء الاصطناعي/);

  assert.match(source("pages/tools/text-classification-research.js"), /methodType="deterministic"/);
  assert.match(source("pages/tools/information-extraction.js"), /methodType="ai"/);
  assert.match(source("pages/tools/nlp-experiments.js"), /methodType="ai"/);
  assert.match(source("pages/tools/excel.js"), /methodType="preparation"/);
  assert.match(source("pages/tools/code.js"), /methodType="implementation"/);
  assert.match(source("pages/tools/colab.js"), /methodType="environment"/);
});

test("classification exposes actual inspection, baseline metrics, reference comparison, and errors", () => {
  const page = source("pages/tools/text-classification-research.js");
  assert.match(page, /const inspectedRows = parseLabeledRows\(datasetInput\)/);
  assert.match(page, /inspectedDistribution/);
  assert.match(page, /baseline\.accuracy/);
  assert.match(page, /ConfusionMatrix result=\{baseline\}/);
  assert.match(page, /ComparisonTable rows=\{baseline\.predictions\}/);
  assert.match(page, /Human reference × system prediction/);
  assert.match(page, /Naive Bayes baseline \+ separate AI inference/);
});

test("presentation changes do not add automatic execution or client-side provider access", () => {
  const pages = ["text-classification-research", "information-extraction", "nlp-experiments", "excel", "code", "colab"]
    .map((page) => source(`pages/tools/${page}.js`)).join("\n");
  assert.doesNotMatch(pages, /new OpenAI|OPENAI_API_KEY/);
  assert.doesNotMatch(source("components/ComputationalWorkbench.js"), /fetch\(|router|localStorage|sessionStorage/);
});

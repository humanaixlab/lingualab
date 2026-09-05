import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("remaining Build and writing tools provide complete bilingual display copy", () => {
  const expectations = {
    "pages/tools/prompt.js": ["Prompt Assistant", "مساعد التعليمات", "Task type", "نوع المهمة", "Writing style", "أسلوب الكتابة"],
    "pages/tools/code.js": ["AI Code Assistant", "مساعد البرمجة بالذكاء الاصطناعي", "Programming language", "لغة البرمجة", "Experience level", "مستوى الخبرة", "Research coding task", "مهمة البرمجة البحثية", "Beginner", "مبتدئ"],
    "pages/tools/excel.js": ["Spreadsheet Explorer", "مستكشف الجداول", "Choose file", "اختر ملفًا", "No file chosen", "لم يتم اختيار ملف", "No spreadsheet selected", "لم يتم تحديد جدول"],
    "pages/tools/colab.js": ["Google Colab Workspace", "مساحة Google Colab", "Copy response", "نسخ الناتج", "Start now", "ابدأ الآن"],
  };
  for (const [path, labels] of Object.entries(expectations)) {
    const page = source(path);
    assert.match(page, /useLanguage/);
    for (const label of labels) assert.ok(page.includes(label), `${path} is missing ${label}`);
  }
});

test("display translations preserve Code and Prompt internal option values", () => {
  const code = source("pages/tools/code.js");
  assert.match(code, /const LEVEL_VALUES = \["Beginner", "Intermediate", "Advanced"\]/);
  assert.match(code, /details: `Researcher experience level: \$\{level\}`/);
  const prompt = source("pages/tools/prompt.js");
  assert.match(prompt, /const TASK_VALUES = \["Text analysis", "Summarization"/);
  assert.match(prompt, /const STYLE_VALUES = \["Academic", "Simple", "Formal", "Creative"\]/);
});

test("tool homes use dedicated Research Hub anchors", () => {
  const hub = source("pages/ar-tools.js");
  assert.match(hub, /"workflows" \? "build-tools"/);
  assert.match(hub, /"writing" \? "writing-tools"/);
  for (const path of ["pages/tools/code.js", "pages/tools/excel.js", "pages/tools/colab.js"]) assert.match(source(path), /backHref="\/ar-tools#build-tools"/);
  assert.match(source("pages/tools/prompt.js"), /backHref="\/ar-tools#build-tools"/);
  for (const path of ["frequency", "concordance", "ngrams", "pos"]) assert.match(source(`pages/tools/${path}.js`), /backHref="\/tools\/analyze"/);
});

test("modified Arabic tool copy uses neutral imperatives and active UI fonts", () => {
  const pages = ["prompt", "code", "excel", "colab", "frequency", "concordance", "ngrams", "pos"].map((name) => source(`pages/tools/${name}.js`)).join("\n");
  assert.doesNotMatch(pages, /اختاري|اكتبي|ألصقي|حددي|ابدئي|جربي/);
  assert.doesNotMatch(pages, /fontFamily:\s*["']Arial/);
  assert.match(source("components/Layout.js"), /fontFamily: "var\(--font-ui\)"/);
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("research AI requests carry the selected UI language without changing user content", () => {
  const analyze = source("pages/tools/analyze.js");
  const advisor = source("pages/research-advisor.js");
  const workspace = source("pages/workspace.js");

  assert.match(analyze, /body: JSON\.stringify\(\{[\s\S]*?text,[\s\S]*?uiLanguage: language,[\s\S]*?wordCount:/);
  assert.match(advisor, /body: JSON\.stringify\(\{ \.\.\.form, uiLanguage: language \}\)/);
  assert.match(workspace, /uiLanguage: language,[\s\S]*?rowCount:/);
  assert.match(workspace, /researchGoal: researchGoal\.trim\(\), uiLanguage: language/);
  assert.doesNotMatch([analyze, advisor, workspace].join("\n"), /translate(?:Output|Result)|translatedOutput/);
});

test("research APIs generate directly in the selected academic language while preserving schemas", () => {
  const interpreter = source("pages/api/research-interpreter.js");
  const advisor = source("pages/api/research-advisor.js");
  const copilot = source("pages/api/research-copilot.js");

  for (const api of [interpreter, advisor, copilot]) {
    assert.match(api, /uiLanguage[^\n]*=== "ar" \? "ar" : "en"/);
    assert.match(api, /academic Arabic|academically appropriate Arabic/);
    assert.match(api, /academic English/);
  }

  assert.match(interpreter, /Keep JSON field names exactly as specified in English/);
  assert.match(advisor, /Keep the JSON field names exactly as specified in English/);
  assert.match(copilot, /Keep schema field names and enum values exactly as defined in English/);
  assert.match(copilot, /enum: \["strong", "conditional", "exploratory"\]/);
  assert.match(copilot, /enum: \["supervised_classification", "corpus_exploration", "qualitative_exploration"\]/);
});

test("Research Report presents stored AI output unchanged rather than translating it", () => {
  const report = source("pages/research-report.js");
  assert.match(report, /readStoredJson\("lingualab-interpretation"\)/);
  assert.match(report, /<p dir="auto">\{interpretationText\}<\/p>/);
  assert.match(report, /<blockquote dir="auto">\{paperParagraph\}<\/blockquote>/);
  assert.doesNotMatch(report, /t\(interpretationText\)|t\(paperParagraph\)/);
});

test("one compact bilingual assistant is mounted globally and limited to core routes", () => {
  const app = source("pages/_app.js");
  const layout = source("components/Layout.js");
  const assistant = source("components/SmartAssistant.js");

  assert.match(app, /import SmartAssistant from "\.\.\/components\/SmartAssistant"/);
  assert.match(app, /<SmartAssistant \/>/);
  assert.doesNotMatch(layout, /SmartAssistant/);
  for (const route of ["/", "/workspace", "/ar-tools", "/tools/analyze", "/research-advisor", "/research-report", "/student-dashboard"]) {
    assert.ok(assistant.includes(`"${route}"`), `missing assistant core route: ${route}`);
  }
  assert.match(assistant, /const \[isOpen, setIsOpen\] = useState\(false\)/);
  assert.match(assistant, /onClick=\{\(\) => setIsOpen\(true\)\}/);
  assert.match(assistant, /onClick=\{\(\) => setIsOpen\(false\)\}/);
  assert.match(assistant, /t\("assistant\.open"\)/);
  assert.match(assistant, /t\("assistant\.close"\)/);
  assert.match(assistant, /width: "min\(260px, calc\(100vw - 36px\)\)"/);
});

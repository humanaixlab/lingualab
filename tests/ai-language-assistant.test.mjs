import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { advisorOutputLanguageInstruction, normalizeAdvisorUiLanguage } from "../lib/advisor-language.js";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("research AI requests carry the selected UI language without changing user content", () => {
  const analyze = source("pages/tools/analyze.js");
  const advisor = source("pages/research-advisor.js");
  const workspace = source("pages/workspace.js");

  assert.match(analyze, /body: JSON\.stringify\(\{[\s\S]*?text,[\s\S]*?uiLanguage: language,[\s\S]*?wordCount:/);
  assert.match(advisor, /const uiLanguage = normalizeAdvisorUiLanguage\(language\)/);
  assert.match(advisor, /body: JSON\.stringify\(\{ \.\.\.form, uiLanguage \}\)/);
  assert.match(workspace, /uiLanguage: language,[\s\S]*?rowCount:/);
  assert.match(workspace, /researchGoal: researchGoal\.trim\(\), uiLanguage: language/);
  assert.doesNotMatch([analyze, advisor, workspace].join("\n"), /translate(?:Output|Result)|translatedOutput/);
});

test("Arabic Advisor UI sends ar and selects the mandatory Arabic output instruction", () => {
  const uiLanguage = normalizeAdvisorUiLanguage("ar");
  assert.equal(uiLanguage, "ar");
  assert.match(advisorOutputLanguageInstruction(uiLanguage), /MANDATORY.*native, publication-quality academic Arabic/);
  assert.doesNotMatch(advisorOutputLanguageInstruction(uiLanguage), /academic English/);

  assert.equal(normalizeAdvisorUiLanguage("en"), "en");
  assert.match(advisorOutputLanguageInstruction("en"), /MANDATORY.*academic English/);

  const api = source("pages/api/research-advisor.js");
  assert.match(api, /normalizeAdvisorUiLanguage\(req\.body\?\.uiLanguage\)/);
  assert.match(api, /const prompt = `\$\{outputLanguageInstruction\}/);
  assert.match(api, /\$\{outputLanguageInstruction\}`;/);
});

test("research APIs generate directly in the selected academic language while preserving schemas", () => {
  const interpreter = source("pages/api/research-interpreter.js");
  const advisor = source("pages/api/research-advisor.js");
  const copilot = source("pages/api/research-copilot.js");

  for (const api of [interpreter, copilot]) {
    assert.match(api, /uiLanguage[^\n]*=== "ar" \? "ar" : "en"/);
    assert.match(api, /academic Arabic|academically appropriate Arabic/);
    assert.match(api, /academic English/);
  }

  assert.match(advisor, /advisorOutputLanguageInstruction\(uiLanguage\)/);

  assert.match(interpreter, /Keep JSON field names exactly as specified in English/);
  assert.match(source("lib/advisor-language.js"), /Keep JSON field names unchanged/);
  assert.match(copilot, /Keep schema field names and enum values exactly as defined in English/);
  assert.match(copilot, /enum: \["strong", "conditional", "exploratory"\]/);
  assert.match(copilot, /enum: \["supervised_classification", "corpus_exploration", "qualitative_exploration"\]/);
});

test("Arabic research output instructions require native non-literal prose and Arabic-first terminology", () => {
  const advisorInstruction = advisorOutputLanguageInstruction("ar");
  const copilot = source("pages/api/research-copilot.js");
  const interpreter = source("pages/api/research-interpreter.js");

  for (const instruction of [advisorInstruction, copilot, interpreter]) {
    assert.match(instruction, /native, publication-quality academic Arabic/);
    assert.match(instruction, /Do not translate literally/);
    assert.match(instruction, /English sentence order/);
    assert.match(instruction, /Arabic technical term first/);
    assert.match(instruction, /English term in parentheses only when it has genuine scholarly value/);
    assert.match(instruction, /TF-IDF, LDA, POS, and Macro-F1 unchanged/);
  }

  assert.match(advisorInstruction, /درجة F1 الكلية \(Macro-F1\)/);
  assert.match(interpreter, /مصفوفة الالتباس/);
  assert.match(copilot, /المتتاليات اللفظية \(N-grams\)/);
});

test("Research Report presents stored AI output unchanged rather than translating it", () => {
  const report = source("pages/research-report.js");
  assert.match(report, /readStoredJson\("lingualab-interpretation"\)/);
  assert.match(report, /<p dir="auto">\{interpretationText\}<\/p>/);
  assert.match(report, /<blockquote dir="auto">\{paperParagraph\}<\/blockquote>/);
  assert.doesNotMatch(report, /t\(interpretationText\)|t\(paperParagraph\)/);
});

test("one compact bilingual assistant is mounted globally with contextual route guidance", () => {
  const app = source("pages/_app.js");
  const layout = source("components/Layout.js");
  const assistant = source("components/SmartAssistant.js");
  const guidance = source("lib/assistant-guidance.js");

  assert.match(app, /import SmartAssistant from "\.\.\/components\/SmartAssistant"/);
  assert.match(app, /<SmartAssistant \/>/);
  assert.doesNotMatch(layout, /SmartAssistant/);
  for (const route of ["/", "/workspace", "/ar-tools", "/tools/analyze", "/research-advisor", "/research-report", "/student-dashboard", "/tools/frequency", "/tools/concordance", "/tools/ngrams", "/tools/pos", "/tools/prompt", "/tools/code", "/tools/excel", "/tools/colab"]) {
    assert.ok(guidance.includes(`"${route}"`), `missing assistant route: ${route}`);
  }
  assert.match(assistant, /const \[isOpen, setIsOpen\] = useState\(false\)/);
  assert.match(assistant, /onClick=\{\(\) => setIsOpen\(true\)\}/);
  assert.match(assistant, /onClick=\{\(\) => setIsOpen\(false\)\}/);
  assert.match(assistant, /t\("assistant\.open"\)/);
  assert.match(assistant, /t\("assistant\.close"\)/);
  assert.match(assistant, /width: "min\(260px, calc\(100vw - 36px\)\)"/);
  assert.match(assistant, /getAssistantGuidance\(router\.pathname, language, \{/);
  assert.doesNotMatch(assistant, /router\.push|fetch\(/);
});

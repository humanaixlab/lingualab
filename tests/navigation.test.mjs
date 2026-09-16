import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const swc = require("next/dist/build/swc");
await swc.loadBindings();
const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("Home exposes exactly three distinct canonical intent destinations", () => {
  const home = source("pages/index.js");
  const goals = home.slice(home.indexOf("const goals = ["), home.indexOf("const workflow = ["));
  for (const [key, href] of [
    ["research", "/research-planner"], ["analyze", "/tools/analyze"], ["learn", "/learning-center"],
  ]) {
    assert.match(goals, new RegExp(`key: "${key}"[\\s\\S]*?href: "${href.replaceAll("/", "\\/")}"`));
  }
  assert.equal((goals.match(/key: /g) || []).length, 3);
  assert.doesNotMatch(goals, /\/tools\/prompt|key: "build"/);
  assert.doesNotMatch(source("lib/i18n/en.js"), /title: "Create a structured research prompt"/);
  assert.doesNotMatch(source("lib/i18n/ar.js"), /title: "أنشئ تعليمات بحثية منظّمة"/);
  assert.doesNotMatch(source("lib/i18n/en.js"), /title: "Build a research workflow"/);
  assert.match(source("lib/i18n/en.js"), /Capabilities overview/);
  assert.match(home, /href="\/research-planner#all-tools"/);
});

test("Home describes Semantic Lab as semantic analysis in both languages", () => {
  const en = source("lib/i18n/en.js");
  const ar = source("lib/i18n/ar.js");
  assert.match(en, /semantic: \{ name: "Semantic Lab", detail: "Explore semantic similarity, topic discovery, and meaning-based grouping in Arabic text\." \}/);
  assert.match(ar, /semantic: \{ name: "مختبر الدلالة", detail: "استكشف التشابه الدلالي، واكتشاف الموضوعات، وتجميع النصوص وفق المعنى\." \}/);
  assert.doesNotMatch(en, /semantic: \{[^\n]+text-classification experiments/);
  assert.doesNotMatch(ar, /semantic: \{[^\n]+تجارب تصنيف النصوص/);
});

test("Home gives researchers exactly four bilingual onboarding steps without exposing hidden previews", () => {
  const home = source("pages/index.js");
  const steps = home.slice(home.indexOf("const onboardingSteps = ["), home.indexOf("const capabilities = ["));
  assert.equal((steps.match(/key: /g) || []).length, 4);
  for (const [key, href] of [
    ["linguistic", "/research-planner#research-paths"],
    ["computational", "/research-planner#build-tools"],
    ["study", "/research-advisor"],
    ["output", "/tools/analyze#quick-analysis"],
  ]) assert.match(steps, new RegExp(`key: "${key}"[\\s\\S]*?href: "${href.replaceAll("/", "\\/")}"`));
  assert.match(home, /aria-labelledby="research-onboarding-title"/);
  assert.match(source("lib/i18n/en.js"), /How do I start my research in LinguaLab\?/);
  assert.match(source("lib/i18n/ar.js"), /كيف أبدأ بحثي في LinguaLab؟/);
  for (const hidden of ["/tools/semantics", "/tools/information-extraction", "/tools/nlp-experiments", "/tools/text-classification-research"])
    assert.doesNotMatch(home, new RegExp(hidden.replaceAll("/", "\\/")));
});

test("Home explains the complete bilingual computational research journey before tools", () => {
  const home = source("pages/index.js");
  const en = source("lib/i18n/en.js");
  const ar = source("lib/i18n/ar.js");
  const journey = home.slice(home.indexOf('id="workflow"'), home.indexOf('id="capabilities"'));
  const workflowKeys = home.match(/const workflow = \[([^\]]+)\]/)[1].match(/"[^"]+"/g).map((item) => item.slice(1, -1));

  assert.deepEqual(workflowKeys, ["understand", "prepare", "choose", "apply", "view", "evaluate", "interpret", "errors", "improve"]);
  assert.match(journey, /home\.computationalJourney\.steps/);
  assert.match(journey, /href="\/research-planner#build-tools"/);
  for (const label of ["Understand Data", "Prepare Data", "Choose Task", "Apply Method", "View Results", "Evaluate", "Interpret", "Analyze Errors", "Improve"])
    assert.match(en, new RegExp(label));
  for (const label of ["أفهم البيانات", "أجهزها", "أختار المهمة", "أطبق الطريقة", "أرى النتائج", "أقيّمها", "أفسرها", "أحلل الأخطاء", "أحسن التجربة"])
    assert.match(ar, new RegExp(label));
  assert.match(en, /Confusion matrices · Human-reference comparison/);
  assert.match(ar, /مصفوفات الالتباس · المقارنة بالمرجع البشري/);
  assert.match(en, /You do not need to be an advanced programmer/);
  assert.match(ar, /لا تحتاج إلى خبرة متقدمة في البرمجة/);
  for (const label of ["Deterministic computation", "AI-supported inference", "Researcher-reviewed result"])
    assert.match(en, new RegExp(label));
  for (const label of ["حساب حتمي", "استدلال مدعوم بالذكاء الاصطناعي", "مراجعة من الباحث"])
    assert.match(ar, new RegExp(label));
  assert.match(journey, /home\.computationalJourney\.execution/);
  assert.match(en, /LinguaLab does not rely on AI alone/);
  assert.match(ar, /لا تعتمد LinguaLab على الذكاء الاصطناعي وحده؛ بل توظفه ضمن منظومة بحثية/);
});

test("Home keeps compact branding, typography, workflow cards, and separated execution badges", () => {
  const home = source("pages/index.js");
  const css = source("styles/Home.module.css");
  const en = source("lib/i18n/en.js");
  const ar = source("lib/i18n/ar.js");
  assert.match(en, /Smart Language Lab \| LinguaLab/);
  assert.match(ar, /مختبر اللغة الذكي \| LinguaLab/);
  assert.match(ar, /بيئة بحثية رقمية للغة العربية واللسانيات الحاسوبية، تجمع بين التحليل الحاسوبي والذكاء الاصطناعي والمراجعة البحثية البشرية/);
  assert.match(home, /home\.heroTitleSecond/);
  assert.match(css, /font-size: clamp\(2\.35rem, 5vw, 4\.25rem\)/);
  assert.match(css, /font-size: clamp\(1\.75rem, 3vw, 2\.55rem\)/);
  assert.match(css, /\.workflowTrack[\s\S]*grid-template-columns: repeat\(5, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media \(max-width: 980px\)[\s\S]*\.workflowTrack[\s\S]*grid-template-columns: repeat\(3, 1fr\)/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.workflowTrack[\s\S]*grid-template-columns: repeat\(2, 1fr\)/);
  assert.match(css, /\.executionTypes > div[\s\S]*display: flex[\s\S]*gap: 8px/);
  assert.match(css, /\.executionTypes span[\s\S]*border-radius: 999px/);
});

test("the computational workflow section retains compatible directory anchors and tool returns", () => {
  const hub = source("pages/research-planner.js");
  assert.match(hub, /id="all-tools"/);
  assert.match(hub, /id="build-tools"/);
  assert.match(hub, /aria-labelledby="computational-workflows-title"/);
  assert.ok(hub.indexOf('mode="linguistic"') < hub.indexOf('id="all-tools"'));

  assert.match(source("components/Layout.js"), /backHref = "\/research-planner#all-tools"/);
  assert.match(source("pages/tools/colab.js"), /backHref="\/research-planner#build-tools"/);

  for (const path of [
    "components/Layout.js",
    "pages/index.js",
    "pages/research-planner.js",
    "pages/learning-center.js",
    "pages/tools/frequency.js",
    "pages/tools/pos.js",
    "pages/tools/colab.js",
  ]) assert.doesNotMatch(source(path), /href="\/tools"/);
});

test("corpus-analysis tools retain a safe standalone return and contextual path return", () => {
  for (const path of ["pages/tools/frequency.js", "pages/tools/concordance.js", "pages/tools/ngrams.js"])
    assert.match(source(path), /inCorpusPath \? "\/research-paths\/corpus-linguistics" : "\/tools\/analyze"/);
  assert.match(source("pages/tools/pos.js"), /backHref="\/tools\/analyze"/);
});

test("Research Planner retains context-aware research destinations", () => {
  const hub = source("pages/research-planner.js");
  assert.match(hub, /researchContextHref\(href, context\)/);
  assert.match(hub, /contextHref\("\/research-advisor"\)/);
  assert.match(hub, /"\/workspace\?copilot=1"/);
  assert.match(hub, /step\.copilot/);
  assert.match(hub, /contextHref\(tool\.link\)/);
  assert.match(hub, /<ResearchPaths language=\{language\} mode="linguistic" \/>/);
});

test("Research Planner separates linguistic paths, computational work, and study completion", () => {
  const hub = source("pages/research-planner.js");
  const paths = source("components/ResearchPaths.js");
  assert.match(paths, /Linguistic Research Paths/);
  assert.match(paths, /المسارات اللغوية/);
  assert.match(paths, /LINGUISTIC_PATH_IDS = new Set\(\["corpus-linguistics", "morphology-syntax", "semantics", "discourse-pragmatics"\]\)/);
  assert.match(hub, /hub\.architecture\.computational\.title/);
  assert.match(hub, /hub\.architecture\.study\.title/);
  assert.doesNotMatch(hub, /const recommendedPath|hub\.pathTitle|hub\.sections\.corpus/);
  for (const active of ["/tools/information-extraction", "/tools/nlp-experiments", "/tools/text-classification-research"])
    assert.match(hub, new RegExp(active.replaceAll("/", "\\/")));
  assert.doesNotMatch(hub, /\/tools\/(semantics|morphology-syntax|corpus-research|discourse-analysis|pragmatics)/);
});

test("completed previews are activated once in their canonical Hub locations", () => {
  const hub = source("pages/research-planner.js");
  const paths = source("lib/research-paths.js");
  for (const route of ["corpus-research", "morphology-syntax", "semantics", "discourse-analysis", "pragmatics"])
    assert.equal((paths.match(new RegExp(`href: "\\/tools\\/${route}"`, "g")) || []).length, 1);
  for (const route of ["text-classification-research", "information-extraction", "nlp-experiments"])
    assert.equal((hub.match(new RegExp(`link: "\\/tools\\/${route}"`, "g")) || []).length, 1);
  assert.equal((hub.match(/preview: true/g) || []).length, 3);
  assert.match(hub, /Research Preview/);
  assert.match(hub, /تجريب بحثي/);
  for (const route of ["semantics", "morphology-syntax", "corpus-research", "discourse-analysis", "pragmatics"])
    assert.doesNotMatch(hub, new RegExp(`link: "\\/tools\\/${route}"`));
});

test("main Research Planner navigation uses one consistent name", () => {
  for (const path of ["pages/research-advisor.js"]) {
    const page = source(path);
    const navigation = page.slice(page.indexOf("<nav"), page.indexOf("</nav>"));
    assert.match(navigation, /href="\/research-planner"[^>]*>\{t\("nav\.researchHub"\)\}<\/Link>/);
    assert.doesNotMatch(navigation, /Research Tools/);
  }
  const workspace = source("pages/workspace.js");
  const workspaceNavigation = workspace.slice(workspace.indexOf("<nav"), workspace.indexOf("</nav>"));
  assert.doesNotMatch(workspaceNavigation, /navActions|nav\.workspace|nav\.researchHub|nav\.analyze/);
  assert.match(workspace, /ابدأ بمجموعة بياناتك البحثية/);
  assert.match(workspace, /Start with your research dataset/);
});

test("Learning Center cards open educational lessons rather than production tools", () => {
  const learning = source("pages/learning-center.js");
  assert.match(learning, /learning\.pathsTitle/);
  assert.match(source("lib/i18n/en.js"), /Choose a learning path to practice/);
  for (const id of ["text-analysis", "prompt-practice", "code-learning", "data-learning"])
    assert.ok(learning.includes(`learningLessonRoute("${id}")`));
  assert.doesNotMatch(learning, /\/tools\/(analyze|prompt|code|excel)/);
});

test("Frequency, POS, and Colab remain renderable as standalone routes", async () => {
  for (const name of ["frequency", "pos", "colab"]) {
    const { code } = await swc.transform(source(`pages/tools/${name}.js`), {
      jsc: { parser: { syntax: "ecmascript", jsx: true }, transform: { react: { runtime: "automatic" } } },
      module: { type: "commonjs" },
    });
    const exports = {};
    const scope = {
      exports,
      require(module) {
        if (module === "react") return React;
        if (module === "next/link") return function MockLink({ children, ...props }) { return React.createElement("a", props, children); };
        if (module === "next/router") return { useRouter: () => ({ asPath: `/tools/${name}` }) };
        if (module === "../../components/Layout") return function MockLayout({ children, backHref }) { return React.createElement("main", null, React.createElement("a", { href: backHref }, "Back"), children); };
        if (module === "../../components/ComputationalWorkbench") return function MockWorkbench() { return null; };
        if (module === "../../components/LanguageProvider") return { useLanguage: () => ({ language: "en" }) };
        if (module === "../../styles/AnalysisTool.module.css") return new Proxy({}, { get: (_, key) => String(key) });
        if (module === "../../lib/tool-handoff") return { readToolHandoff: () => null };
        if (module === "../../lib/report-context") return { createReportContext: () => "/research-report?reportId=test" };
        if (module === "../../lib/analysis-handoff") return { createAnalysisHandoff: () => "/tools/analyze?interpretHandoff=test" };
        if (module === "../../lib/corpus-workflow-context") return { createCorpusWorkflowHandoff: () => "/tools/concordance?corpusWorkflow=test", readCorpusWorkflowHandoff: () => null };
        return require(module);
      },
    };
    vm.createContext(scope);
    vm.runInContext(code, scope);
    const html = renderToStaticMarkup(React.createElement(exports.default));
    assert.match(html, name === "colab" ? /href="\/research-planner#build-tools"/ : /href="\/tools\/analyze"/);
  }
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { RESEARCH_PATHS } from "../lib/research-paths.js";
import { CORPUS_PATH_HUB_SECTION, LEARNING_PATH_SECTION, readResearchPathContext, researchPathHref, researchPathNavigation } from "../lib/research-path-context.js";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("the seven bilingual computational-linguistics research paths are defined", () => {
  assert.equal(RESEARCH_PATHS.length, 7);
  assert.deepEqual(RESEARCH_PATHS.map((path) => path.id), [
    "corpus-linguistics",
    "text-classification",
    "morphology-syntax",
    "semantics",
    "discourse-pragmatics",
    "information-extraction",
    "language-technology",
  ]);
  for (const path of RESEARCH_PATHS) {
    for (const field of ["name", "overview", "question", "data", "output", "report", "beginner", "advanced"])
      assert.ok(path[field].en && path[field].ar, `${path.id}.${field} must be bilingual`);
    assert.ok(Array.isArray(path.available));
    assert.ok(path.coming.en.length && path.coming.ar.length);
  }
});
test("available tools map only to routes that exist in the current product", () => {
  const allowed = new Set([
    "/workspace",
    "/tools/frequency",
    "/tools/concordance",
    "/tools/ngrams",
    "/tools/corpus-research",
    "/tools/pos",
    "/tools/morphology-syntax",
    "/tools/semantics",
    "/tools/discourse-analysis",
    "/tools/pragmatics",
    "/tools/prompt",
    "/tools/code",
    "/tools/excel",
    "/tools/colab",
  ]);
  for (const path of RESEARCH_PATHS) {
    for (const tool of path.available) {
      assert.ok(allowed.has(tool.href), `${tool.href} is not an approved existing route`);
      assert.ok(tool.en && tool.ar);
    }
  }
  assert.deepEqual(RESEARCH_PATHS.find((path) => path.id === "semantics").available.map((tool) => tool.href), ["/tools/semantics"]);
  assert.deepEqual(RESEARCH_PATHS.find((path) => path.id === "discourse-pragmatics").available.map((tool) => tool.href), ["/tools/discourse-analysis", "/tools/pragmatics"]);
  assert.deepEqual(RESEARCH_PATHS.find((path) => path.id === "information-extraction").available, []);
});

test("every available tool carries only matching lightweight path metadata", () => {
  for (const path of RESEARCH_PATHS) {
    for (const tool of path.available) {
      const href = researchPathHref(tool.href, path.id);
      const url = new URL(href, "https://lingualab.test");
      assert.equal(url.searchParams.get("from"), "research-path");
      assert.equal(url.searchParams.get("pathId"), path.id);
      assert.equal(url.searchParams.get("sourcePath"), path.id);
      assert.equal(url.searchParams.get("sourceSection"), "research-paths");
      assert.doesNotMatch(href, /dataset|rows|text=|file|content/i);
    }
  }
});

test("path-aware back navigation accepts only the canonical tool and path pairing", () => {
  const href = researchPathHref("/tools/frequency", "corpus-linguistics");
  const context = readResearchPathContext(href, "/tools/frequency");
  assert.deepEqual(context, { pathId: "corpus-linguistics", sourcePath: "corpus-linguistics", sourceSection: "research-paths" });
  assert.deepEqual(researchPathNavigation(context, "en", "Frequency"), {
    href: "/research-planner#corpus-linguistics",
    backLabel: "Back to Corpus Linguistics",
    crumbs: ["Research Path", "Corpus Linguistics", "Frequency"],
  });
  assert.equal(readResearchPathContext(href, "/tools/pos"), null);
  assert.equal(readResearchPathContext("/tools/frequency?from=research-path&pathId=semantics&sourcePath=semantics&sourceSection=research-paths", "/tools/frequency"), null);
});

test("the Corpus Linguistics hub preserves lightweight path context and returns to the hub", () => {
  const href = researchPathHref("/tools/frequency", "corpus-linguistics", CORPUS_PATH_HUB_SECTION);
  const context = readResearchPathContext(href, "/tools/frequency");
  assert.deepEqual(context, { pathId: "corpus-linguistics", sourcePath: "corpus-linguistics", sourceSection: "corpus-path-hub" });
  assert.deepEqual(researchPathNavigation(context, "ar", "تحليل التكرار"), {
    href: "/research-paths/corpus-linguistics",
    backLabel: "العودة إلى لسانيات المدونات (Corpus Linguistics)",
    crumbs: ["المسار البحثي", "لسانيات المدونات (Corpus Linguistics)", "تحليل التكرار"],
  });
  const invalid = "/tools/pos?from=research-path&pathId=morphology-syntax&sourcePath=morphology-syntax&sourceSection=corpus-path-hub";
  assert.equal(readResearchPathContext(invalid, "/tools/pos"), null);
});

test("Analyze reuses a valid selected path while direct entry remains context-free", () => {
  const plannerHref = researchPathHref("/tools/analyze", "corpus-linguistics");
  const learningHref = researchPathHref("/tools/analyze", "corpus-linguistics", LEARNING_PATH_SECTION);
  const expectedBase = {
    pathId: "corpus-linguistics",
    sourcePath: "corpus-linguistics",
    selectedPath: "corpus-linguistics",
    selectedDomain: "linguistic",
    workflow: "corpus-analysis",
  };
  assert.deepEqual(readResearchPathContext(plannerHref, "/tools/analyze"), { ...expectedBase, sourceSection: "research-paths" });
  assert.deepEqual(readResearchPathContext(learningHref, "/tools/analyze"), { ...expectedBase, sourceSection: "learning-center" });
  assert.equal(readResearchPathContext("/tools/analyze", "/tools/analyze"), null);
  assert.equal(readResearchPathContext(plannerHref.replace("workflow=corpus-analysis", "workflow=semantic-analysis"), "/tools/analyze"), null);

  const analyze = source("pages/tools/analyze.js");
  assert.match(analyze, /!hasSelectedResearchPath && <section className=\{styles\.toolDirectory\} aria-labelledby="research-path-entry-title"/);
  assert.match(analyze, /hasSelectedResearchPath && <section className=\{styles\.toolDirectory\} aria-labelledby="selected-research-path-title"/);
  assert.match(analyze, /setResearchPathContext\(selectedResearchPath\)/);
});

test("Coming next capabilities are non-interactive and never receive routes", () => {
  for (const path of RESEARCH_PATHS) {
    for (const item of [...path.coming.en, ...path.coming.ar]) assert.equal(typeof item, "string");
  }
  const component = source("components/ResearchPaths.js");
  assert.match(component, /id="research-paths"/);
  assert.match(component, /path\.coming\[locale\]\.map\(\(item\) => <li/);
  assert.doesNotMatch(component, /path\.coming[\s\S]{0,160}<Link/);
});

test("canonical homes remain separated across Analyze, Build, Research, Workspace, and Learn", () => {
  const hub = source("pages/research-planner.js");
  const analyze = source("pages/tools/analyze.js");
  assert.match(analyze, /href="\/research-planner#research-paths"/);
  assert.doesNotMatch(analyze, /href="\/tools\/(frequency|concordance|ngrams|pos)"/);
  assert.match(analyze, /href="\/research-paths\/corpus-linguistics"/);
  assert.match(source("lib/i18n/en.js"), /Data → Prepare → Configure → Run → Evaluate → Interpret → Improve/);
  assert.match(hub, /id="writing-tools"/);
  assert.match(source("lib/research-paths.js"), /href: "\/tools\/prompt"[^\n]+contextual: true/);
  assert.doesNotMatch(source("pages/workspace.js"), /<ResearchPaths|RESEARCH_PATHS\.map/);
  assert.doesNotMatch(source("pages/learning-center.js"), /<ResearchPaths|RESEARCH_PATHS\.map/);
  assert.match(source("pages/_app.js"), /<SmartAssistant \/>/);
});

test("Corpus Linguistics keeps its educational card and adds a dedicated executable hub", () => {
  const corpus = RESEARCH_PATHS.find((path) => path.id === "corpus-linguistics");
  for (const field of ["overview", "question", "data", "available", "coming", "output", "report", "beginner", "advanced"])
    assert.ok(corpus[field], `Corpus educational field ${field} must remain`);
  assert.equal(corpus.hubHref, "/research-paths/corpus-linguistics");
  assert.deepEqual(corpus.cta, { en: "Start the Corpus Linguistics workflow", ar: "ابدأ مسار لسانيات المدونات" });
  assert.match(corpus.overview.en, /Prepare the corpus → check corpus readiness → analyze frequency → examine contexts → extract n-grams → review patterns → interpret findings → prepare the research report/);
  assert.match(corpus.overview.ar, /إعداد المدونة ← فحص جاهزية المدونة ← تحليل التكرار ← تحليل السياقات ← المتتاليات اللفظية ← مراجعة الأنماط ← تفسير النتائج ← التقرير البحثي/);
  assert.deepEqual(corpus.available.map((tool) => tool.href), ["/tools/corpus-research", "/tools/frequency", "/tools/concordance", "/tools/ngrams"]);
  assert.match(source("components/ResearchPaths.js"), /className=\{styles\.primaryCta\}[\s\S]*path\.hubHref \|\| path\.ctaHref/);

  const hub = source("pages/research-paths/corpus-linguistics.js");
  for (const route of ["corpus-research", "frequency", "concordance", "ngrams"])
    assert.match(hub, new RegExp(`href: "\\/tools\\/${route}"`));
  assert.match(hub, /Corpus Research · Research Preview/);
  assert.match(hub, /إنشاء وتحليل المدونة · تجريب بحثي/);
  assert.doesNotMatch(hub, /\/tools\/pos|Parts of Speech|أقسام الكلام/);
  assert.match(hub, /COMING\[locale\]\.map\(\(item\) => <li/);
  assert.doesNotMatch(hub, /COMING[\s\S]{0,180}<Link/);
});

test("Corpus Linguistics leads with a practical evidence-based workflow", () => {
  const hub = source("pages/research-paths/corpus-linguistics.js");
  assert.match(hub, /How do I run a corpus-linguistics study in LinguaLab\?/);
  assert.match(hub, /كيف أطبق لسانيات المدونات داخل LinguaLab؟/);
  const stageKeys = [...hub.matchAll(/\{ key: "([^"]+)"(?:, href: "([^"]+)")?, (?:type: "([^"]+)"|types: \[([^\]]+)\])(?:, requiresResult: true)? \}/g)];
  assert.deepEqual(stageKeys.map((match) => match[1]), ["prepare", "inspect", "frequency", "contexts", "ngrams", "review", "interpret", "report"]);
  assert.deepEqual(stageKeys.map((match) => match[2]), ["/tools/corpus-research", "/tools/corpus-research", "/tools/frequency", "/tools/concordance", "/tools/ngrams", undefined, undefined, undefined]);
  assert.match(hub, /types: \["deterministic", "review"\]/);
  assert.match(hub, /Prepare the corpus[\s\S]*Check corpus readiness/);
  assert.match(hub, /إعداد المدونة[\s\S]*فحص جاهزية المدونة/);
  assert.doesNotMatch(hub, /Corpus \/ texts|النصوص \/ المدونة|Inspect corpus quality|فحص جودة المدونة/);
  assert.match(hub, /practical\.stages\?\.\[stage\.key\] \|\| \[copy\.missingStage, ""\]/);
  for (const label of ["Deterministic computation", "AI-supported interpretation", "Researcher review", "حساب حتمي", "تفسير مدعوم بالذكاء الاصطناعي", "مراجعة الباحث"])
    assert.match(hub, new RegExp(label));
  assert.match(hub, /Frequency does not automatically mean importance/);
  assert.match(hub, /التكرار لا يعني الأهمية تلقائيًا/);
  assert.match(hub, /Studying frequent expressions in university messages/);
  assert.match(hub, /دراسة الألفاظ المتكررة في رسائل الجامعات/);
  assert.doesNotMatch(hub, /AI-generated counts|تكرارات مولدة بالذكاء الاصطناعي/);
});

test("POS remains owned by Morphology & Syntax and Arabic path labels include scientific English", () => {
  const corpus = RESEARCH_PATHS.find((path) => path.id === "corpus-linguistics");
  const morphology = RESEARCH_PATHS.find((path) => path.id === "morphology-syntax");
  assert.equal(corpus.available.some((tool) => tool.href === "/tools/pos"), false);
  assert.equal(morphology.available.some((tool) => tool.href === "/tools/pos"), true);
  assert.equal(corpus.name.ar, "لسانيات المدونات (Corpus Linguistics)");
  assert.match(corpus.available.find((tool) => tool.href === "/tools/frequency").ar, /\(Frequency Analysis\)/);
  assert.match(corpus.available.find((tool) => tool.href === "/tools/concordance").ar, /\(Concordance \/ Contexts\)/);
  assert.match(corpus.available.find((tool) => tool.href === "/tools/ngrams").ar, /\(N-grams\)/);
  for (const path of RESEARCH_PATHS) assert.match(path.name.ar, /\([^)]+\)/);
});

test("ready paths use their existing canonical homes without duplicate hubs", () => {
  const classification = RESEARCH_PATHS.find((path) => path.id === "text-classification");
  assert.equal(classification.ctaHref, "/workspace");
  assert.equal(classification.hubHref, undefined);
  assert.equal(classification.cta.en, "Start Text Classification Workflow");
  assert.deepEqual(classification.available.map((tool) => tool.href), ["/workspace"]);
  assert.equal(classification.available.some((tool) => /sentiment|logistic|svm/i.test(tool.href)), false);

  const technology = RESEARCH_PATHS.find((path) => path.id === "language-technology");
  assert.equal(technology.ctaHref, "/research-planner#build-tools");
  assert.equal(technology.hubHref, undefined);
  assert.deepEqual(technology.available.filter((tool) => !tool.contextual).map((tool) => tool.href), [
    "/tools/excel",
    "/tools/code",
    "/tools/colab",
  ]);
  assert.deepEqual(technology.available.filter((tool) => tool.contextual).map((tool) => tool.href), ["/tools/prompt"]);
});

test("non-linguistic inactive path definitions retain no executable CTA or fake routes", () => {
  for (const id of ["information-extraction"]) {
    const path = RESEARCH_PATHS.find((item) => item.id === id);
    assert.deepEqual(path.available, []);
    assert.equal(path.hubHref, undefined);
    assert.equal(path.ctaHref, undefined);
    assert.ok(path.coming.en.every((item) => typeof item === "string"));
    assert.ok(path.coming.ar.every((item) => typeof item === "string"));
  }
});

test("secondary paths retain bilingual scientific tool terminology", () => {
  const morphology = RESEARCH_PATHS.find((path) => path.id === "morphology-syntax");
  assert.equal(morphology.available.length, 2);
  assert.equal(morphology.available[0].href, "/tools/pos");
  assert.equal(morphology.available[0].ar, "تحليل أقسام الكلام (Part-of-Speech Analysis, POS)");

  const technology = RESEARCH_PATHS.find((path) => path.id === "language-technology");
  assert.match(technology.available.find((tool) => tool.href === "/tools/excel").ar, /\(Spreadsheet Explorer\)$/);
  assert.match(technology.available.find((tool) => tool.href === "/tools/code").ar, /\(Code Builder\)$/);
  assert.match(technology.available.find((tool) => tool.href === "/tools/prompt").ar, /\(Prompt Builder\)$/);
});

test("Research Paths layer preserves the existing assistant and Workspace role", () => {
  assert.match(source("pages/research-planner.js"), /<ResearchPaths language=\{language\} mode="linguistic" \/>/);
  assert.match(source("pages/_app.js"), /<SmartAssistant \/>/);
  const workspace = source("pages/workspace.js");
  assert.doesNotMatch(workspace, /ResearchPaths|RESEARCH_PATHS|Explore by Research Path|استكشف حسب المسار البحثي/);
});

test("Research Planner renders only the four canonical linguistic paths", () => {
  const component = source("components/ResearchPaths.js");
  const hub = source("pages/research-planner.js");
  assert.match(component, /LINGUISTIC_PATH_IDS = new Set\(\["corpus-linguistics", "morphology-syntax", "semantics", "discourse-pragmatics"\]\)/);
  assert.match(component, /mode === "linguistic" \? RESEARCH_PATHS\.filter/);
  assert.match(hub, /mode="linguistic"/);
  assert.doesNotMatch(hub, /<ResearchPaths[^>]+mode="all"/);
});

test("visual hierarchy preserves every educational field, link, CTA, and collapsible guide", () => {
  const component = source("components/ResearchPaths.js");
  const css = source("styles/ResearchPaths.module.css");

  for (const field of ["overview", "question", "data", "coming", "output", "report", "beginner", "advanced"])
    assert.match(component, new RegExp(`path\\.${field}\\[locale\\]`), `${field} remains visible`);
  assert.match(component, /path\.available\.map/);
  assert.equal((component.match(/<details className=\{styles\.guide\}>/g) || []).length, 2);
  assert.match(component, /className=\{styles\.researchQuestion\}/);
  assert.match(component, /path\.available\.length \? styles\.availableBlock : styles\.unavailableBlock/);
  assert.match(css, /\.primaryCta:focus-visible/);
  assert.match(css, /\.unavailableBlock/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);

  const routes = Object.fromEntries(RESEARCH_PATHS.map((path) => [
    path.id,
    path.available.map((tool) => tool.href),
  ]));
  assert.deepEqual(routes, {
    "corpus-linguistics": ["/tools/corpus-research", "/tools/frequency", "/tools/concordance", "/tools/ngrams"],
    "text-classification": ["/workspace"],
    "morphology-syntax": ["/tools/pos", "/tools/morphology-syntax"],
    semantics: ["/tools/semantics"],
    "discourse-pragmatics": ["/tools/discourse-analysis", "/tools/pragmatics"],
    "information-extraction": [],
    "language-technology": ["/tools/excel", "/tools/code", "/tools/colab", "/tools/prompt"],
  });
  assert.deepEqual(Object.fromEntries(RESEARCH_PATHS.filter((path) => path.cta).map((path) => [path.id, path.hubHref || path.ctaHref])), {
    "corpus-linguistics": "/research-paths/corpus-linguistics",
    "text-classification": "/workspace",
    "language-technology": "/research-planner#build-tools",
  });
});

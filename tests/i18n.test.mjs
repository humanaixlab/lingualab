import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import en from "../lib/i18n/en.js";
import ar from "../lib/i18n/ar.js";
import { translate } from "../lib/i18n/translate.js";
import * as config from "../lib/i18n/config.js";

const require = createRequire(import.meta.url);
const swc = require("next/dist/build/swc");
await swc.loadBindings();
const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

function lookup(dictionary, path) {
  return path.split(".").reduce((value, key) => value?.[key], dictionary);
}

function leafKeys(value, prefix = "") {
  if (Array.isArray(value) || typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) => leafKeys(child, prefix ? `${prefix}.${key}` : key));
}

function declarationsFor(css, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]+)\\}`));
  assert.ok(match, `missing CSS rule: ${selector}`);
  return Object.fromEntries(match[1].split(";").flatMap((declaration) => {
    const separator = declaration.indexOf(":");
    if (separator < 0) return [];
    return [[declaration.slice(0, separator).trim(), declaration.slice(separator + 1).trim()]];
  }));
}

function resolveCustomProperties(value, properties) {
  let resolved = value;
  for (let pass = 0; pass < 10 && resolved.includes("var("); pass += 1) {
    resolved = resolved.replace(/var\((--[^)]+)\)/g, (_, name) => {
      assert.ok(properties[name], `unresolved custom property: ${name}`);
      return properties[name];
    });
  }
  assert.doesNotMatch(resolved, /var\(/);
  return resolved;
}

function analyzePlanner() {
  const page = source("pages/tools/analyze.js");
  const logic = page.slice(page.indexOf("const DEFAULT_PLAN"), page.indexOf("export default function Analyzer"));
  const sandbox = {};
  vm.runInNewContext(`${logic}\nthis.buildPlanForTest = buildPlan;`, sandbox);
  return sandbox.buildPlanForTest;
}

async function renderLanguageProvider(storage) {
  const { code } = await swc.transform(source("components/LanguageProvider.js"), {
    jsc: { parser: { syntax: "ecmascript", jsx: true }, transform: { react: { runtime: "automatic" } } },
    module: { type: "commonjs" },
  });
  const states = [];
  const dependencies = [];
  let stateCursor = 0;
  let effectCursor = 0;
  let rendered;
  const document = { documentElement: { lang: "", dir: "" } };
  const route = { value: "/workspace?handoff=current" };
  const workspaceState = { rows: 5 };
  const context = { current: null };
  const React = {
    createContext() {
      return { Provider({ value, children }) { context.current = value; return typeof children === "function" ? children(value) : children; } };
    },
    useContext: () => context.current,
    useState(initial) {
      const index = stateCursor++;
      if (!(index in states)) states[index] = initial;
      return [states[index], (value) => { states[index] = typeof value === "function" ? value(states[index]) : value; }];
    },
    useCallback: (callback) => callback,
    useMemo: (factory) => factory(),
    useEffect(callback, deps) {
      const index = effectCursor++;
      const prior = dependencies[index];
      if (!prior || deps.some((value, item) => value !== prior[item])) callback();
      dependencies[index] = deps;
    },
  };
  const window = { setTimeout(callback) { callback(); return 1; }, clearTimeout() {} };
  Object.defineProperty(window, "localStorage", { get: () => storage });
  const exports = {};
  vm.runInNewContext(code, {
    exports,
    require(name) {
      if (name === "react") return React;
      if (name === "react/jsx-runtime") return { jsx: (type, props) => typeof type === "function" ? type(props) : { type, props }, jsxs: (type, props) => typeof type === "function" ? type(props) : { type, props } };
      if (name.endsWith("/config")) return config;
      if (name.endsWith("/translate")) return { translate };
      return require(name);
    },
    window,
    document,
  });
  const render = () => {
    stateCursor = 0;
    effectCursor = 0;
    exports.LanguageProvider({ children(value) { rendered = { label: value.t("language.arabic"), value }; } });
    return rendered;
  };
  render();
  return { render, document, route, workspaceState };
}

test("LanguageProvider renders, switches EN to AR to EN, and preserves route and state", async () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) };
  const app = await renderLanguageProvider(storage);
  let view = app.render();
  assert.equal(view.value.language, "en");
  assert.equal(view.label, "Arabic");
  assert.deepEqual(app.document.documentElement, { lang: "en", dir: "ltr" });
  view.value.setLanguage("ar");
  view = app.render();
  assert.equal(view.label, "العربية");
  assert.deepEqual(app.document.documentElement, { lang: "ar", dir: "rtl" });
  assert.equal(values.get("lingualab-ui-language"), "ar");
  view.value.setLanguage("en");
  view = app.render();
  assert.equal(view.label, "Arabic");
  assert.deepEqual(app.document.documentElement, { lang: "en", dir: "ltr" });
  assert.equal(app.route.value, "/workspace?handoff=current");
  assert.deepEqual(app.workspaceState, { rows: 5 });
});

test("saved language restores and blocked localStorage never breaks rendering", async () => {
  const saved = await renderLanguageProvider({ getItem: () => "ar", setItem() {} });
  assert.equal(saved.render().value.language, "ar");
  assert.deepEqual(saved.document.documentElement, { lang: "ar", dir: "rtl" });
  const blocked = {};
  Object.defineProperty(blocked, "getItem", { get() { throw new Error("blocked"); } });
  const fallback = await renderLanguageProvider(blocked);
  assert.equal(fallback.render().value.language, "en");
});

test("English and Arabic dictionaries have identical complete key structure", () => {
  const englishKeys = leafKeys(en).sort();
  const arabicKeys = leafKeys(ar).sort();
  assert.deepEqual(arabicKeys, englishKeys);
  for (const path of englishKeys) {
    assert.notEqual(translate("en", path), path, `missing English translation: ${path}`);
    assert.notEqual(translate("ar", path), path, `missing Arabic translation: ${path}`);
  }
});

test("all literal core translation keys resolve in both real dictionaries", () => {
  const files = ["pages/index.js", "pages/ar-tools.js", "pages/workspace.js", "pages/tools/analyze.js", "pages/research-advisor.js", "pages/research-report.js", "pages/student-dashboard.js", "components/Layout.js", "components/SmartAssistant.js"];
  const used = new Set(files.flatMap((path) => [...source(path).matchAll(/\bt\(["']([^"']+)["']/g)].map((match) => match[1])));
  for (const path of used) {
    assert.notEqual(lookup(en, path), undefined, `missing English key used by core UI: ${path}`);
    assert.notEqual(lookup(ar, path), undefined, `missing Arabic key used by core UI: ${path}`);
  }
});

test("every real Workspace error key resolves in both languages", () => {
  const used = [...source("pages/workspace.js").matchAll(/workspace\.errors\.([a-z]+)/g)].map((match) => match[1]);
  assert.ok(used.length > 0);
  for (const key of new Set(used)) {
    assert.notEqual(translate("en", `workspace.errors.${key}`), `workspace.errors.${key}`);
    assert.notEqual(translate("ar", `workspace.errors.${key}`), `workspace.errors.${key}`);
  }
});

test("the real translator interpolates dynamic values and detects missing keys", () => {
  assert.equal(translate("en", "workspace.insights.records", { rows: "5", columns: "2" }), "5 records were analyzed across 2 columns.");
  assert.equal(translate("ar", "workspace.insights.records", { rows: "٥", columns: "٢" }), "تم تحليل ٥ سجل عبر ٢ عمودًا.");
  assert.equal(translate("ar", "missing.core.key"), "missing.core.key");
});

test("Analyze labels only explicitly Arabic labeled data as Arabic", () => {
  const buildPlan = analyzePlanner();
  const englishLabeled = buildPlan({ dataDescription: "customer review text with a target label" });
  const arabicLabeled = buildPlan({ dataDescription: "Arabic review text with a target label" });
  assert.equal(englishLabeled.variant, "labeled");
  assert.equal(englishLabeled.eyebrowVariant, "default");
  assert.equal(arabicLabeled.variant, "labeled");
  assert.equal(arabicLabeled.eyebrowVariant, "labeled");
  assert.doesNotMatch(translate("en", `analyze.plans.${englishLabeled.eyebrowVariant}.eyebrow`), /ARABIC DATA/);
  assert.match(translate("en", `analyze.plans.${arabicLabeled.eyebrowVariant}.eyebrow`), /ARABIC DATA/);
});

test("language switching is isolated from routes, internal values, context, and handoffs", () => {
  const joined = ["pages/index.js", "pages/ar-tools.js", "pages/workspace.js", "pages/tools/analyze.js", "pages/research-advisor.js"].map(source).join("\n");
  for (const route of ["/ar-tools", "/tools/analyze", "/tools/prompt", "/student-dashboard", "/api/research-advisor", "/api/research-copilot", "/api/research-interpreter"]) assert.ok(joined.includes(route));
  for (const value of ["classification", "exploration", "supervised_classification", "analysis"]) assert.ok(joined.includes(value));
  assert.doesNotMatch(source("components/LanguageProvider.js"), /sessionStorage|router|location|reload|fetch\(/);
  assert.doesNotMatch(source("lib/research-context.js"), /lingualab-ui-language/);
  assert.doesNotMatch(source("lib/tool-handoff.js"), /lingualab-ui-language/);
  for (const path of ["pages/workspace.js", "pages/ar-tools.js", "pages/research-advisor.js", "pages/tools/analyze.js"]) assert.doesNotMatch(source(path), /\}, \[[^\]]*language[^\]]*\]\);/);
});

test("dataset, user, and AI content keeps automatic direction", () => {
  assert.match(source("pages/workspace.js"), /<td key=\{header\} dir="auto">\{String\(row\[header\]/);
  assert.match(source("pages/workspace.js"), /className=\{styles\.studyDesign\} dir="auto">/);
  assert.doesNotMatch(source("styles/Workspace.module.css"), /\.studyDesign\{direction:/);
  assert.match(source("pages/tools/analyze.js"), /value=\{text\}[\s\S]*?dir="auto"/);
  assert.match(source("pages/research-advisor.js"), /className=\{styles\.summary\} dir="auto">\{advisor\.summary\}/);
  assert.match(source("pages/research-report.js"), /<p dir="auto">\{interpretationText\}<\/p>/);
});

test("core typography exposes one explicit bilingual semantic scale", () => {
  const globals = source("stylesglobals.css");
  for (const declaration of [
    '--font-ui-en: var(--font-inter-loaded), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    '--font-ui-ar: var(--font-ibm-plex-arabic-loaded), "Noto Sans Arabic", Tahoma, Arial, sans-serif',
    "--text-hero: 54px",
    "--text-page: 36px",
    "--text-section: 26px",
    "--text-card: 19px",
    "--text-body: 16px",
    "--text-helper: 14px",
    "--text-meta: 13px",
    "--text-button: 15px",
    "--text-nav: 15px",
    "--text-input: 15px",
  ]) assert.ok(globals.includes(declaration), `missing typography declaration: ${declaration}`);

  assert.match(globals, /html\[lang="ar"\][\s\S]*?--text-hero: 56px;[\s\S]*?--text-page: 38px;[\s\S]*?--text-section: 28px;[\s\S]*?--text-card: 20px;[\s\S]*?--text-body: 17px;/);
  assert.match(globals, /@media \(max-width: 640px\)[\s\S]*?--text-hero: 40px;[\s\S]*?--text-page: 30px;[\s\S]*?--text-section: 22px;[\s\S]*?--text-card: 18px;[\s\S]*?html\[lang="ar"\][\s\S]*?--text-hero: 42px;[\s\S]*?--text-page: 32px;[\s\S]*?--text-section: 24px;/);
  assert.match(globals, /html\[lang="ar"\][\s\S]*?--tracking-heading: 0;[\s\S]*?--tracking-overline: 0;/);
  assert.doesNotMatch(globals, /--type-(?:display|page-title|section-title|card-title|body|helper|caption|button)/);
});

test("Next self-hosts the intended bilingual fonts with only approved weights", () => {
  const app = source("pages/_app.js");
  assert.match(app, /import \{ IBM_Plex_Sans_Arabic, Inter \} from "next\/font\/google"/);
  assert.match(app, /Inter\(\{[\s\S]*?subsets: \["latin"\][\s\S]*?weight: \["400", "500", "600", "700"\][\s\S]*?display: "swap"[\s\S]*?variable: "--font-inter-loaded"/);
  assert.match(app, /IBM_Plex_Sans_Arabic\(\{[\s\S]*?subsets: \["arabic"\][\s\S]*?weight: \["400", "500", "600", "700"\][\s\S]*?display: "swap"[\s\S]*?variable: "--font-ibm-plex-arabic-loaded"/);
  assert.match(app, /className=\{`\$\{inter\.variable\} \$\{ibmPlexSansArabic\.variable\} lingualabApp`\}/);
});

test("the app wrapper computes the correct active font for each UI language", () => {
  const globals = source("stylesglobals.css");
  const wrapper = declarationsFor(globals, ".lingualabApp");
  const arabicWrapper = declarationsFor(globals, 'html[lang="ar"] .lingualabApp');
  const loadedFonts = {
    "--font-inter-loaded": '"Inter"',
    "--font-ibm-plex-arabic-loaded": '"IBM Plex Sans Arabic"',
  };

  const effectiveFont = (language) => {
    const properties = { ...loadedFonts };
    for (const [name, value] of Object.entries(wrapper)) if (name.startsWith("--")) properties[name] = value;
    if (language === "ar") {
      for (const [name, value] of Object.entries(arabicWrapper)) if (name.startsWith("--")) properties[name] = value;
    }
    return resolveCustomProperties(wrapper["font-family"], properties);
  };

  assert.equal(effectiveFont("en").split(",")[0].trim(), '"Inter"');
  assert.equal(effectiveFont("ar").split(",")[0].trim(), '"IBM Plex Sans Arabic"');
  assert.doesNotMatch(effectiveFont("en"), /^"IBM Plex Sans Arabic"/);
  assert.doesNotMatch(effectiveFont("ar"), /^"Inter"/);
});

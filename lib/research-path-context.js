export const RESEARCH_PATH_SOURCE = "research-path";
export const RESEARCH_PATH_SECTION = "research-paths";
export const CORPUS_PATH_HUB_SECTION = "corpus-path-hub";
export const LEARNING_PATH_SECTION = "learning-center";

const TOOL_PATHS = Object.freeze({
  "/tools/frequency": "corpus-linguistics",
  "/tools/concordance": "corpus-linguistics",
  "/tools/ngrams": "corpus-linguistics",
  "/tools/corpus-research": "corpus-linguistics",
  "/tools/pos": "morphology-syntax",
  "/tools/morphology-syntax": "morphology-syntax",
  "/tools/semantics": "semantics",
  "/tools/discourse-analysis": "discourse-pragmatics",
  "/tools/pragmatics": "discourse-pragmatics",
  "/workspace": "text-classification",
  "/tools/prompt": "language-technology",
  "/tools/excel": "language-technology",
  "/tools/code": "language-technology",
  "/tools/colab": "language-technology",
});

const PATH_NAMES = Object.freeze({
  "corpus-linguistics": { en: "Corpus Linguistics", ar: "لسانيات المدونات (Corpus Linguistics)" },
  "text-classification": { en: "Text Classification", ar: "تصنيف النصوص" },
  "morphology-syntax": { en: "Morphology & Syntax", ar: "الصرف والنحو" },
  "semantics": { en: "Semantics", ar: "الدلالة" },
  "discourse-pragmatics": { en: "Discourse & Pragmatics", ar: "الخطاب والتداولية" },
  "language-technology": { en: "Language Technology & NLP Experiments", ar: "تقنيات اللغة وتجارب NLP" },
});

const ANALYZE_PATHS = new Set(["corpus-linguistics"]);
const PATH_DOMAINS = Object.freeze({
  "corpus-linguistics": "linguistic",
  "text-classification": "computational",
  "morphology-syntax": "linguistic",
  semantics: "linguistic",
  "discourse-pragmatics": "linguistic",
  "language-technology": "computational",
});
const PATH_WORKFLOWS = Object.freeze({
  "corpus-linguistics": "corpus-analysis",
  "text-classification": "text-classification",
  "morphology-syntax": "morphology-syntax-analysis",
  semantics: "semantic-analysis",
  "discourse-pragmatics": "discourse-pragmatics-analysis",
  "language-technology": "nlp-experiment",
});

function isMatchingDestination(href, pathId) {
  return TOOL_PATHS[href] === pathId || (href === "/tools/analyze" && ANALYZE_PATHS.has(pathId));
}

function isMatchingSource(sourceSection, href, pathId) {
  if (sourceSection === RESEARCH_PATH_SECTION) return true;
  if (sourceSection === CORPUS_PATH_HUB_SECTION) return pathId === "corpus-linguistics" && href !== "/tools/analyze";
  return sourceSection === LEARNING_PATH_SECTION && href === "/tools/analyze" && pathId === "corpus-linguistics";
}

export function researchPathHref(href, pathId, sourceSection = RESEARCH_PATH_SECTION) {
  if (!isMatchingDestination(href, pathId) || !isMatchingSource(sourceSection, href, pathId)) return href;
  const params = new URLSearchParams({
    from: RESEARCH_PATH_SOURCE,
    pathId,
    sourcePath: pathId,
    sourceSection,
    selectedDomain: PATH_DOMAINS[pathId],
    workflow: PATH_WORKFLOWS[pathId],
  });
  return `${href}?${params.toString()}`;
}

export function readResearchPathContext(asPath, pathname) {
  if (typeof asPath !== "string" || typeof pathname !== "string") return null;
  const query = asPath.includes("?") ? asPath.slice(asPath.indexOf("?") + 1).split("#")[0] : "";
  const params = new URLSearchParams(query);
  const pathId = params.get("pathId");
  const sourceSection = params.get("sourceSection");
  const selectedDomain = params.get("selectedDomain");
  const workflow = params.get("workflow");
  if (
    params.get("from") !== RESEARCH_PATH_SOURCE ||
    params.get("sourcePath") !== pathId ||
    !isMatchingDestination(pathname, pathId) ||
    !isMatchingSource(sourceSection, pathname, pathId) ||
    selectedDomain !== PATH_DOMAINS[pathId] ||
    workflow !== PATH_WORKFLOWS[pathId] ||
    !PATH_NAMES[pathId]
  ) return null;
  if (pathname === "/tools/analyze") {
    return { pathId, sourcePath: pathId, sourceSection, selectedPath: pathId, selectedDomain, workflow };
  }
  return { pathId, sourcePath: pathId, sourceSection };
}

export function researchPathLabel(pathId, language = "en") {
  const locale = language === "ar" ? "ar" : "en";
  return PATH_NAMES[pathId]?.[locale] || "";
}

export function researchPathNavigation(context, language, toolTitle) {
  if (!context || !PATH_NAMES[context.pathId]) return null;
  const locale = language === "ar" ? "ar" : "en";
  return {
    href: context.sourceSection === CORPUS_PATH_HUB_SECTION
      ? "/research-paths/corpus-linguistics"
      : `/research-planner#${context.pathId}`,
    backLabel: locale === "ar" ? `العودة إلى ${PATH_NAMES[context.pathId].ar}` : `Back to ${PATH_NAMES[context.pathId].en}`,
    crumbs: [
      locale === "ar" ? "المسار البحثي" : "Research Path",
      PATH_NAMES[context.pathId][locale],
      toolTitle,
    ],
  };
}

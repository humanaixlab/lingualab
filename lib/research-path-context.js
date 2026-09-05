export const RESEARCH_PATH_SOURCE = "research-path";
export const RESEARCH_PATH_SECTION = "research-paths";

const TOOL_PATHS = Object.freeze({
  "/tools/frequency": "corpus-linguistics",
  "/tools/concordance": "corpus-linguistics",
  "/tools/ngrams": "corpus-linguistics",
  "/tools/pos": "morphology-syntax",
  "/workspace": "text-classification",
  "/tools/prompt": "language-technology",
  "/tools/excel": "language-technology",
  "/tools/code": "language-technology",
  "/tools/colab": "language-technology",
});

const PATH_NAMES = Object.freeze({
  "corpus-linguistics": { en: "Corpus Linguistics", ar: "لسانيات المدونات" },
  "text-classification": { en: "Text Classification", ar: "تصنيف النصوص" },
  "morphology-syntax": { en: "Morphology & Syntax", ar: "الصرف والنحو" },
  "language-technology": { en: "Language Technology & NLP Experiments", ar: "تقنيات اللغة وتجارب NLP" },
});

export function researchPathHref(href, pathId) {
  if (TOOL_PATHS[href] !== pathId) return href;
  const params = new URLSearchParams({
    from: RESEARCH_PATH_SOURCE,
    pathId,
    sourcePath: pathId,
    sourceSection: RESEARCH_PATH_SECTION,
  });
  return `${href}?${params.toString()}`;
}

export function readResearchPathContext(asPath, pathname) {
  if (typeof asPath !== "string" || typeof pathname !== "string") return null;
  const query = asPath.includes("?") ? asPath.slice(asPath.indexOf("?") + 1).split("#")[0] : "";
  const params = new URLSearchParams(query);
  const pathId = params.get("pathId");
  if (
    params.get("from") !== RESEARCH_PATH_SOURCE ||
    params.get("sourcePath") !== pathId ||
    params.get("sourceSection") !== RESEARCH_PATH_SECTION ||
    TOOL_PATHS[pathname] !== pathId ||
    !PATH_NAMES[pathId]
  ) return null;
  return { pathId, sourcePath: pathId, sourceSection: RESEARCH_PATH_SECTION };
}

export function researchPathNavigation(context, language, toolTitle) {
  if (!context || !PATH_NAMES[context.pathId]) return null;
  const locale = language === "ar" ? "ar" : "en";
  return {
    href: `/ar-tools#${context.pathId}`,
    backLabel: locale === "ar" ? `العودة إلى ${PATH_NAMES[context.pathId].ar}` : `Back to ${PATH_NAMES[context.pathId].en}`,
    crumbs: [
      locale === "ar" ? "المسار البحثي" : "Research Path",
      PATH_NAMES[context.pathId][locale],
      toolTitle,
    ],
  };
}

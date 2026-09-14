import { PROJECT_CATALOG } from "./project-catalog.js";

export const ACTIVE_TOOLS = Object.freeze([
  ["analysis", "/tools/analyze", "Analysis & Interpretation", "التحليل والتفسير"],
  ["frequency", "/tools/frequency", "Frequency Analysis", "تحليل التكرار"],
  ["concordance", "/tools/concordance", "Concordance / Contexts", "السياقات"],
  ["ngrams", "/tools/ngrams", "N-grams", "المتتاليات اللفظية"],
  ["pos", "/tools/pos", "Part-of-Speech Analysis", "تحليل أقسام الكلام"],
  ["corpus-research", "/tools/corpus-research", "Corpus Research", "إنشاء وتحليل المدونة"],
  ["morphology-syntax", "/tools/morphology-syntax", "Morphology & Syntax", "التحليل الصرفي والنحوي"],
  ["semantics", "/tools/semantics", "Semantic Analysis", "التحليل الدلالي"],
  ["discourse-analysis", "/tools/discourse-analysis", "Discourse Analysis", "تحليل الخطاب"],
  ["pragmatics", "/tools/pragmatics", "Pragmatics", "التداولية"],
  ["text-classification", "/tools/text-classification-research", "Text Classification", "تصنيف النصوص"],
  ["information-extraction", "/tools/information-extraction", "Information Extraction", "استخراج المعلومات"],
  ["nlp-experiments", "/tools/nlp-experiments", "NLP Experiments", "تجارب معالجة اللغة الطبيعية"],
  ["spreadsheet", "/tools/excel", "Spreadsheet Explorer", "مستكشف الجداول"],
  ["code", "/tools/code", "AI Code Assistant", "مساعد البرمجة بالذكاء الاصطناعي"],
  ["colab", "/tools/colab", "Google Colab Handoff", "الانتقال إلى Google Colab"],
  ["prompt", "/tools/prompt", "Prompt Assistant", "مساعد التعليمات"],
].map(([id, route, en, ar]) => Object.freeze({ id, route, name: { en, ar } })));

export const RESEARCH_AREAS = Object.freeze([
  ["corpus-linguistics", "linguistic", "Corpus Linguistics", "لسانيات المدونات"],
  ["morphology-syntax", "linguistic", "Morphology & Syntax", "الصرف والنحو"],
  ["semantics", "linguistic", "Semantics", "الدلالة"],
  ["discourse-pragmatics", "linguistic", "Discourse & Pragmatics", "الخطاب والتداولية"],
  ["text-classification", "computational", "Text Classification", "تصنيف النصوص"],
  ["information-extraction", "computational", "Information Extraction", "استخراج المعلومات"],
  ["nlp-experiments", "computational", "Language Technology & NLP Experiments", "تقنيات اللغة وتجارب معالجة اللغة الطبيعية"],
].map(([id, kind, en, ar]) => Object.freeze({ id, kind, name: { en, ar } })));

export const PROJECT_OUTPUT_TYPES = Object.freeze([
  ["paper", "Research paper", "ورقة بحثية"],
  ["corpus", "Corpus", "مدونة لغوية"],
  ["dataset", "Dataset", "مجموعة بيانات"],
  ["benchmark", "Benchmark", "معيار مرجعي"],
  ["prototype", "Prototype", "نموذج أولي"],
].map(([id, en, ar]) => Object.freeze({ id, name: { en, ar } })));

export const INCLUDED_DATASETS = Object.freeze([{
  id: "arabic-reviews-demo",
  name: { en: "Arabic Reviews Demo", ar: "بيانات عرض للمراجعات العربية" },
  records: 30,
  files: ["public/sample-datasets/arabic_reviews_demo.csv", "public/sample-datasets/arabic_reviews_demo.xlsx", "sample-datasets/arabic_reviews_demo.csv"],
  source: {
    en: "Repository-created demonstration sample. No external dataset source is identified in the repository.",
    ar: "عينة عرض منشأة داخل المستودع، ولا يذكر المستودع مصدر بيانات خارجيًا لها.",
  },
  license: {
    status: "not-separately-documented",
    en: "No dataset-specific license is recorded. The repository MIT license covers original source code, but the dataset is not separately licensed.",
    ar: "لا يوجد ترخيص مستقل موثق لمجموعة البيانات. يغطي ترخيص MIT الشفرة الأصلية للمستودع، لكن المجموعة ليست مرخصة بصورة منفصلة.",
  },
}]);

export const USER_ACTIVITY_ARCHITECTURE = Object.freeze({
  enabled: false,
  values: null,
  metrics: ["uniqueUsers", "toolRuns", "completedReviews", "reportsCreated"],
  rules: {
    en: "Architecture placeholder only. No user count or usage value is collected, inferred, or displayed.",
    ar: "بنية مستقبلية فقط. لا تُجمع أو تُستنتج أو تُعرض أي أعداد للمستخدمين أو الاستخدام.",
  },
});

export const FUTURE_PLAN_ARCHITECTURE = Object.freeze({
  enabled: false,
  paymentsEnabled: false,
  plans: [
    { id: "individual-research", name: { en: "Individual Research", ar: "البحث الفردي" }, price: null },
    { id: "research-team", name: { en: "Research Team", ar: "فريق البحث" }, price: null },
    { id: "institution", name: { en: "Institution", ar: "المؤسسة" }, price: null },
  ],
});

export function getPlatformInventorySummary() {
  return {
    activeTools: ACTIVE_TOOLS.length,
    researchAreas: RESEARCH_AREAS.length,
    linguisticPaths: RESEARCH_AREAS.filter((area) => area.kind === "linguistic").length,
    computationalWorkflows: RESEARCH_AREAS.filter((area) => area.kind === "computational").length,
    projectRecords: PROJECT_CATALOG.length,
    projectTypes: PROJECT_OUTPUT_TYPES.length,
    includedDatasets: INCLUDED_DATASETS.length,
    includedDatasetFiles: INCLUDED_DATASETS.reduce((total, dataset) => total + dataset.files.length, 0),
  };
}

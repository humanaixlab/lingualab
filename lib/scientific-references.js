export const SCIENTIFIC_REFERENCE_STORAGE_KEY = "lingualab-scientific-references-v1";
export const MAX_RESEARCHER_REFERENCES_PER_PATH = 50;

const placeholder = (id, typeEn, typeAr, noteEn, noteAr) => ({
  id,
  author: { en: "Platform reference pending", ar: "مرجع المنصة قيد الإضافة" },
  year: null,
  title: { en: "Methodological reference placeholder", ar: "موضع مخصص لمرجع منهجي" },
  publisher: { en: "Official source pending", ar: "المصدر الرسمي قيد الإضافة" },
  doiOrUrl: null,
  referenceType: { en: typeEn, ar: typeAr },
  note: { en: noteEn, ar: noteAr },
  isPlaceholder: true,
  verified: false,
});

const path = (titleEn, titleAr, slots) => ({
  title: { en: titleEn, ar: titleAr },
  platformReferences: slots.map(([typeEn, typeAr, noteEn, noteAr], index) =>
    placeholder(`${titleEn.toLowerCase().replace(/[^a-z]+/g, "-")}-${index + 1}`, typeEn, typeAr, noteEn, noteAr)),
});

export const SCIENTIFIC_FOUNDATIONS = {
  "corpus-linguistics": path("Corpus Linguistics", "لسانيات المدونات", [
    ["Foundational methodology", "منهجية تأسيسية", "Reserved for a source supporting corpus design and representativeness.", "مخصص لمصدر يدعم تصميم المدونة وتمثيلها."],
    ["Corpus analysis", "تحليل المدونات", "Reserved for a source supporting frequency, concordance, and N-gram methods.", "مخصص لمصدر يدعم مناهج التكرار والسياقات والمتتاليات اللفظية."],
    ["Research interpretation", "التفسير البحثي", "Reserved for a source supporting evidence-led corpus interpretation.", "مخصص لمصدر يدعم تفسير نتائج المدونة بالاستناد إلى الأدلة."],
  ]),
  "morphology-syntax": path("Morphology & Syntax", "الصرف والنحو", [
    ["Morphology", "الصرف", "Reserved for a source supporting Arabic morphological analysis.", "مخصص لمصدر يدعم التحليل الصرفي للعربية."],
    ["Syntax", "النحو", "Reserved for a source supporting syntactic analysis and relations.", "مخصص لمصدر يدعم التحليل النحوي والعلاقات التركيبية."],
    ["Annotation methodology", "منهجية التوسيم", "Reserved for a source supporting linguistic annotation and researcher review.", "مخصص لمصدر يدعم التوسيم اللغوي ومراجعة الباحث."],
  ]),
  semantics: path("Semantics", "الدلالة", [
    ["Semantic similarity", "التشابه الدلالي", "Reserved for a source supporting semantic-similarity methodology.", "مخصص لمصدر يدعم منهجية التشابه الدلالي."],
    ["Topic analysis", "تحليل الموضوعات", "Reserved for a source supporting topic discovery and interpretation.", "مخصص لمصدر يدعم اكتشاف الموضوعات وتفسيرها."],
    ["Semantic grouping", "التجميع الدلالي", "Reserved for a source supporting meaning-based grouping and validation.", "مخصص لمصدر يدعم التجميع القائم على المعنى والتحقق منه."],
  ]),
  "discourse-pragmatics": path("Discourse & Pragmatics", "الخطاب والتداولية", [
    ["Discourse analysis", "تحليل الخطاب", "Reserved for a source supporting stance and discourse-relation analysis.", "مخصص لمصدر يدعم تحليل الموقف والعلاقات الخطابية."],
    ["Pragmatics", "التداولية", "Reserved for a source supporting speech acts, implicature, and deixis.", "مخصص لمصدر يدعم الأفعال الكلامية والاستلزام والإشارة."],
    ["Annotation methodology", "منهجية التوسيم", "Reserved for a source supporting evidence spans and researcher validation.", "مخصص لمصدر يدعم الأدلة النصية والتحقق البحثي."],
  ]),
  "text-classification": path("Text Classification", "تصنيف النصوص", [
    ["Classification methodology", "منهجية التصنيف", "Reserved for a source supporting supervised text classification.", "مخصص لمصدر يدعم تصنيف النصوص الموجّه."],
    ["Baseline evaluation", "تقييم النموذج المرجعي", "Reserved for a source supporting baseline models and evaluation metrics.", "مخصص لمصدر يدعم النماذج المرجعية ومقاييس التقييم."],
    ["Error analysis", "تحليل الأخطاء", "Reserved for a source supporting reference comparison and error analysis.", "مخصص لمصدر يدعم المقارنة بالمرجع وتحليل الأخطاء."],
  ]),
  "information-extraction": path("Information Extraction", "استخراج المعلومات", [
    ["Entity extraction", "استخراج الكيانات", "Reserved for a source supporting named-entity extraction.", "مخصص لمصدر يدعم استخراج الكيانات المسماة."],
    ["Relation extraction", "استخراج العلاقات", "Reserved for a source supporting text-grounded relation extraction.", "مخصص لمصدر يدعم استخراج العلاقات المسندة إلى النص."],
    ["Terminology extraction", "استخراج المصطلحات", "Reserved for a source supporting terminology and keyphrase extraction.", "مخصص لمصدر يدعم استخراج المصطلحات والعبارات المفتاحية."],
  ]),
  "nlp-experiments": path("NLP Experiments", "تجارب معالجة اللغة الطبيعية", [
    ["Experimental design", "التصميم التجريبي", "Reserved for a source supporting controlled NLP experiments.", "مخصص لمصدر يدعم تصميم تجارب معالجة اللغة الطبيعية المنضبطة."],
    ["Prompt and output comparison", "مقارنة التعليمات والمخرجات", "Reserved for a source supporting controlled output comparison.", "مخصص لمصدر يدعم المقارنة المنضبطة بين التعليمات والمخرجات."],
    ["Research evaluation", "التقييم البحثي", "Reserved for a source supporting reproducibility and researcher evaluation.", "مخصص لمصدر يدعم قابلية إعادة الإنتاج والتقييم البحثي."],
  ]),
};

export function emptyScientificReferenceState() {
  return { researcherReferences: [], suggestedPlatformReferenceIds: [] };
}

const clean = (value, limit = 600) => typeof value === "string" ? value.trim().slice(0, limit) : "";

export function normalizeResearcherReference(reference) {
  if (!reference || typeof reference !== "object") return null;
  const normalized = {
    id: clean(reference.id, 120),
    author: clean(reference.author),
    year: clean(reference.year, 20),
    title: clean(reference.title),
    publisher: clean(reference.publisher),
    doiOrUrl: clean(reference.doiOrUrl, 1000),
    suggestedForReport: reference.suggestedForReport === true,
  };
  return normalized.id && normalized.author && normalized.year && normalized.title && normalized.publisher ? normalized : null;
}

function storageFor(storage) {
  if (storage) return storage;
  try { return globalThis.localStorage; } catch { return null; }
}

export function readScientificReferenceState(pathId, storage) {
  if (!SCIENTIFIC_FOUNDATIONS[pathId]) return emptyScientificReferenceState();
  try {
    const raw = storageFor(storage)?.getItem(`${SCIENTIFIC_REFERENCE_STORAGE_KEY}:${pathId}`);
    if (!raw) return emptyScientificReferenceState();
    const parsed = JSON.parse(raw);
    const validPlatformIds = new Set(SCIENTIFIC_FOUNDATIONS[pathId].platformReferences.map((item) => item.id));
    return {
      researcherReferences: Array.isArray(parsed.researcherReferences)
        ? parsed.researcherReferences.map(normalizeResearcherReference).filter(Boolean).slice(0, MAX_RESEARCHER_REFERENCES_PER_PATH)
        : [],
      suggestedPlatformReferenceIds: Array.isArray(parsed.suggestedPlatformReferenceIds)
        ? [...new Set(parsed.suggestedPlatformReferenceIds.filter((id) => validPlatformIds.has(id)))]
        : [],
    };
  } catch { return emptyScientificReferenceState(); }
}

export function saveScientificReferenceState(pathId, state, storage) {
  if (!SCIENTIFIC_FOUNDATIONS[pathId]) return { ok: false, state: emptyScientificReferenceState() };
  const validPlatformIds = new Set(SCIENTIFIC_FOUNDATIONS[pathId].platformReferences.map((item) => item.id));
  const safeState = {
    researcherReferences: Array.isArray(state?.researcherReferences)
      ? state.researcherReferences.map(normalizeResearcherReference).filter(Boolean).slice(0, MAX_RESEARCHER_REFERENCES_PER_PATH)
      : [],
    suggestedPlatformReferenceIds: Array.isArray(state?.suggestedPlatformReferenceIds)
      ? [...new Set(state.suggestedPlatformReferenceIds.filter((id) => validPlatformIds.has(id)))]
      : [],
  };
  try {
    const target = storageFor(storage);
    if (!target) return { ok: false, state: safeState };
    target.setItem(`${SCIENTIFIC_REFERENCE_STORAGE_KEY}:${pathId}`, JSON.stringify(safeState));
    return { ok: true, state: safeState };
  } catch { return { ok: false, state: safeState }; }
}

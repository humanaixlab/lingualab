export const SCIENTIFIC_REFERENCE_STORAGE_KEY = "lingualab-scientific-references-v1";
export const MAX_RESEARCHER_REFERENCES_PER_PATH = 50;

const approvedArabicReference = ({ id, author, translator = null, year, edition = null, title, publisher = null, isbn = null, doiOrUrl = null, referenceType, note }) => ({
  id,
  author: { en: author, ar: author },
  translator: translator ? { en: translator, ar: translator } : null,
  year,
  edition: edition ? { en: edition, ar: edition } : null,
  title: { en: title, ar: title },
  publisher: publisher ? { en: publisher, ar: publisher } : null,
  isbn,
  doiOrUrl,
  referenceType: { en: referenceType, ar: referenceType },
  note: { en: note, ar: note },
  isPlaceholder: false,
  verified: true,
});

const path = (titleEn, titleAr, references) => ({
  title: { en: titleEn, ar: titleAr },
  platformReferences: references.map(approvedArabicReference),
});

export const SCIENTIFIC_FOUNDATIONS = {
  "corpus-linguistics": path("Corpus Linguistics", "لسانيات المدونات", [
    { id: "corpus-arabic-corpora-2015", author: "صالح بن فهد العصيمي (محرر)، ومجموعة من الباحثين", year: 2015, title: "المدونات اللغوية العربية: بناؤها وطرائق الإفادة منها", publisher: "مركز الملك عبدالله بن عبدالعزيز الدولي لخدمة اللغة العربية، الرياض", isbn: "9786039066484", referenceType: "كتاب أكاديمي جماعي", note: "يدعم بناء المدونات اللغوية واختيار البيانات وتنظيمها وطرائق الإفادة منها في البحث اللغوي." },
    { id: "corpus-dakrouri-2024", author: "أيمن الدكروري", year: 2024, title: "المدونات اللغوية ودورها في معالجة النصوص العربية", publisher: "مجمع الملك سلمان العالمي للغة العربية", referenceType: "كتاب", note: "يدعم توظيف المدونات العربية في معالجة النصوص والتحليل اللغوي الحاسوبي." },
    { id: "corpus-standards-2025", author: "مجمع الملك سلمان العالمي للغة العربية", year: 2025, title: "معايير بناء المدونات اللغوية العربية", publisher: "مجمع الملك سلمان العالمي للغة العربية", referenceType: "كتاب / وثيقة معايير", note: "يدعم معايير جمع المدونات وتنظيمها وتخزينها وضمان جودتها وجاهزيتها للتحليل." },
  ]),
  "morphology-syntax": path("Morphology & Syntax", "الصرف والنحو", [
    { id: "morphology-rajhi-1998", author: "عبده الراجحي", year: 1998, title: "التطبيق الصرفي", publisher: "دار المعرفة الجامعية، الإسكندرية", referenceType: "كتاب", note: "يدعم التحليل الصرفي والأوزان والاشتقاق وبنية الكلمة والمشتقات." },
    { id: "syntax-rajhi-1998", author: "عبده الراجحي", year: 1998, edition: "الطبعة الثانية", title: "التطبيق النحوي", publisher: "دار المعرفة الجامعية، الإسكندرية", referenceType: "كتاب", note: "يدعم التحليل النحوي التطبيقي للجملة والعلاقات التركيبية." },
    { id: "syntax-treebank-2017", author: "أحمد روبي محمد", year: 2017, title: "البنك الشجري النحوي: بناؤه وتوظيفه في إطار تقنيات الذكاء الاصطناعي", referenceType: "كتاب / دراسة متخصصة", note: "يربط التحليل النحوي بالتوسيم الآلي والبنوك الشجرية والنمذجة الحاسوبية." },
  ]),
  semantics: path("Semantics", "الدلالة", [
    { id: "semantics-omar-2009", author: "أحمد مختار عمر", year: 2009, edition: "الطبعة السابعة", title: "علم الدلالة", publisher: "عالم الكتب، القاهرة", referenceType: "كتاب", note: "مرجع تأسيسي في المعنى والعلاقات الدلالية والحقول الدلالية وتغير المعنى." },
    { id: "semantics-anis-1976", author: "إبراهيم أنيس", year: 1976, edition: "الطبعة الثالثة", title: "دلالة الألفاظ", publisher: "مكتبة الأنجلو المصرية، القاهرة", referenceType: "كتاب", note: "يدعم دراسة العلاقة بين اللفظ والمعنى والتطور الدلالي واستعمال الألفاظ." },
    { id: "semantics-latif-2000", author: "محمد حماسة عبد اللطيف", year: 2000, title: "النحو والدلالة: مدخل لدراسة المعنى النحوي الدلالي", publisher: "دار الشروق، القاهرة", referenceType: "كتاب", note: "يدعم الربط بين البنية النحوية وتفسير المعنى والسياق الدلالي." },
  ]),
  "discourse-pragmatics": path("Discourse & Pragmatics", "الخطاب والتداولية", [
    { id: "pragmatics-sahrawi-2005", author: "مسعود صحراوي", year: 2005, title: "التداولية عند العلماء العرب: دراسة تداولية لظاهرة الأفعال الكلامية في التراث اللساني العربي", publisher: "دار الطليعة", isbn: "9789953456058", referenceType: "كتاب", note: "يدعم تحليل الأفعال الكلامية والقصد والسياق ومفاهيم التداولية في العربية." },
    { id: "discourse-yaqout-2021", author: "محمود سليمان ياقوت", year: 2021, title: "في التحليل اللغوي: علم اللغة النصي، التداولية، الأفعال الكلامية، تحليل الخطاب", publisher: "دار النابغة", doiOrUrl: null, referenceType: "كتاب", note: "يدعم التكامل بين علم اللغة النصي والتداولية والأفعال الكلامية وتحليل الخطاب." },
    { id: "discourse-miftah-1985", author: "محمد مفتاح", year: 1985, title: "تحليل الخطاب الشعري: استراتيجية التناص", publisher: "دار التنوير", referenceType: "كتاب", note: "يدعم التحليل المنهجي للخطاب والعلاقات النصية والتناص وتفسير البنية الخطابية." },
  ]),
  "text-classification": path("Text Classification", "تصنيف النصوص", [
    { id: "classification-habash-2014", author: "نزار حبش", translator: "هند سليمان الخليفة", year: 2014, title: "مقدمة في المعالجة الطبيعية للغة العربية", publisher: "دار جامعة الملك سعود للنشر", isbn: "9786035072571", referenceType: "كتاب مترجم إلى العربية", note: "يوفر الأساس اللغوي والحاسوبي لمعالجة النص العربي وبناء المهام الآلية وتقييمها." },
    { id: "classification-rashwan-2019", author: "محسن رشوان، المعتز بالله السعيد", year: 2019, title: "تطبيقات أساسية في المعالجة الآلية للغة العربية", publisher: "مركز الملك عبدالله بن عبدالعزيز الدولي لخدمة اللغة العربية", isbn: "9786038221532", referenceType: "كتاب", note: "يدعم تصميم تطبيقات معالجة النص العربي وبناء التجارب الحاسوبية وتقييمها." },
    { id: "classification-standards-2025", author: "مجمع الملك سلمان العالمي للغة العربية", year: 2025, title: "معايير الحوسبة اللغوية العربية", publisher: "مجمع الملك سلمان العالمي للغة العربية", referenceType: "كتاب / وثيقة معايير", note: "يدعم جودة البيانات والتوسيم والمعالجة والتقييم في تطبيقات الحوسبة اللغوية العربية." },
  ]),
  "information-extraction": path("Information Extraction", "استخراج المعلومات", [
    { id: "extraction-habash-2014", author: "نزار حبش", translator: "هند سليمان الخليفة", year: 2014, title: "مقدمة في المعالجة الطبيعية للغة العربية", publisher: "دار جامعة الملك سعود للنشر", isbn: "9786035072571", referenceType: "كتاب مترجم إلى العربية", note: "يدعم التحليل الآلي للعربية اللازم لاستخراج المعلومات والسمات والكيانات من النص." },
    { id: "extraction-jomaa-2024", author: "عمرو جمعة", year: 2024, title: "تقنيات اللغة العربية الحاسوبية: معايير التقويم ورؤى التطوير", publisher: "مجمع الملك سلمان العالمي للغة العربية", referenceType: "كتاب", note: "يدعم تقويم تطبيقات تحليل النص العربي وتقنيات المعالجة الآلية واستخراج المعلومات." },
    { id: "extraction-standards-2025", author: "مجمع الملك سلمان العالمي للغة العربية", year: 2025, title: "معايير الحوسبة اللغوية العربية", publisher: "مجمع الملك سلمان العالمي للغة العربية", referenceType: "كتاب / وثيقة معايير", note: "يدعم توسيم البيانات وتمثيل المعلومات وضمان جودة الموارد المستخدمة في الاستخراج." },
  ]),
  "nlp-experiments": path("NLP Experiments", "تجارب معالجة اللغة الطبيعية", [
    { id: "nlp-habash-2014", author: "نزار حبش", translator: "هند سليمان الخليفة", year: 2014, title: "مقدمة في المعالجة الطبيعية للغة العربية", publisher: "دار جامعة الملك سعود للنشر", isbn: "9786035072571", referenceType: "كتاب مترجم إلى العربية", note: "مرجع أساسي لبناء تجارب معالجة العربية وفهم مستويات المعالجة وقيودها." },
    { id: "nlp-rashwan-2019", author: "محسن رشوان، المعتز بالله السعيد", year: 2019, title: "تطبيقات أساسية في المعالجة الآلية للغة العربية", publisher: "مركز الملك عبدالله بن عبدالعزيز الدولي لخدمة اللغة العربية", isbn: "9786038221532", referenceType: "كتاب", note: "يدعم التطبيق العملي وبناء المهام الحاسوبية واختبار المخرجات والتقييم." },
    { id: "nlp-jomaa-2024", author: "عمرو جمعة", year: 2024, title: "تقنيات اللغة العربية الحاسوبية: معايير التقويم ورؤى التطوير", publisher: "مجمع الملك سلمان العالمي للغة العربية", referenceType: "كتاب", note: "يدعم تقويم التقنيات اللغوية الحاسوبية وتحليل جودة المخرجات وتحديد جوانب التحسين في التجارب." },
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

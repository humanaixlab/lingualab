export const NLP_BUILDER_STORAGE_KEY = "lingualab-nlp-builder-v1";

const bi = (en, ar) => Object.freeze({ en, ar });

export const BUILDER_MODES = Object.freeze([
  { id: "research-task", name: bi("Build an NLP research task", "ابنِ مهمة معالجة لغوية"), description: bi("Move from a linguistic phenomenon to annotation, representation, task, model options, and evaluation.", "انتقل من الظاهرة اللغوية إلى الترميز والتمثيل والمهمة وبدائل النماذج والتقييم.") },
  { id: "linguistic-algorithm", name: bi("Design a linguistic algorithm", "صمّم خوارزمية لغوية"), description: bi("Turn an Arabic morphological or syntactic rule into computable conditions, decision logic, tests, pseudocode, and starter code.", "حوّل قاعدة صرفية أو نحوية عربية إلى شروط قابلة للحوسبة ومنطق قرار واختبارات وشفرة وصفية وكود أولي.") },
]);

export const PHENOMENON_DOMAINS = Object.freeze([
  ["morphology", "Morphology", "الصرف"], ["syntax", "Syntax", "النحو"], ["semantics", "Semantics", "الدلالة"], ["discourse", "Discourse", "الخطاب"], ["pragmatics", "Pragmatics", "التداولية"], ["text-classification", "Text classification", "تصنيف النصوص"], ["information-extraction", "Information extraction", "استخراج المعلومات"], ["custom", "Other or custom", "أخرى أو مخصصة"],
].map(([id, en, ar]) => Object.freeze({ id, name: bi(en, ar) })));

export const PHENOMENA = Object.freeze([
  { id: "named-entities", domain: "information-extraction", name: bi("Named entities", "الكيانات المسماة"), examples: bi("people, organizations, locations", "الأشخاص والمؤسسات والأماكن"), units: ["token", "span"], labels: ["PER", "ORG", "LOC"], representation: "bio", task: "ner", schema: ["document_id", "text", "token", "label", "start_offset", "end_offset", "annotator", "confidence", "notes"], algorithms: ["rule-based", "classical-ml", "transformer", "hybrid"], metrics: ["precision", "recall", "f1"] },
  { id: "sentiment", domain: "semantics", name: bi("Sentiment", "المشاعر"), examples: bi("positive, neutral, negative", "إيجابي ومحايد وسلبي"), units: ["sentence", "document"], labels: ["POSITIVE", "NEUTRAL", "NEGATIVE"], representation: "class-label", task: "text-classification", schema: ["document_id", "text", "sentiment_label", "annotator", "confidence", "notes"], algorithms: ["rule-based", "classical-ml", "transformer", "llm"], metrics: ["accuracy", "macro-f1", "confusion-matrix"] },
  { id: "speech-acts", domain: "pragmatics", name: bi("Speech acts", "أفعال الكلام"), examples: bi("request, question, promise, apology", "الطلب والسؤال والوعد والاعتذار"), units: ["utterance"], labels: ["REQUEST", "QUESTION", "PROMISE", "APOLOGY"], representation: "class-label", task: "text-classification", schema: ["utterance", "speech_act", "speaker", "addressee", "context", "directness", "annotator", "confidence", "notes"], algorithms: ["rule-based", "classical-ml", "transformer", "llm", "hybrid"], metrics: ["macro-f1", "confusion-matrix", "agreement"] },
  { id: "morphological-features", domain: "morphology", name: bi("Morphological features", "السمات الصرفية"), examples: bi("lemma, root, pattern, gender, number", "اللمّة والجذر والوزن والجنس والعدد"), units: ["word", "morpheme"], labels: ["LEMMA", "ROOT", "PATTERN", "GENDER", "NUMBER"], representation: "feature-bundle", task: "morphological-tagging", schema: ["sentence_id", "token", "lemma", "root", "pattern", "gender", "number", "annotator", "notes"], algorithms: ["rule-based", "statistical", "transformer", "hybrid"], metrics: ["accuracy", "macro-f1", "error-analysis"] },
  { id: "grammatical-roles", domain: "syntax", name: bi("Grammatical roles", "الأدوار النحوية"), examples: bi("subject, object, predicate", "الفاعل والمفعول والخبر"), units: ["word", "span"], labels: ["SUBJECT", "OBJECT", "PREDICATE"], representation: "span-label", task: "sequence-labeling", schema: ["sentence_id", "text", "span", "role", "start_offset", "end_offset", "annotator", "notes"], algorithms: ["rule-based", "statistical", "transformer", "hybrid"], metrics: ["precision", "recall", "f1", "agreement"] },
  { id: "dependency-relations", domain: "syntax", name: bi("Dependency relations", "علاقات الاعتماد"), examples: bi("head and dependent relations", "علاقات الرأس والتابع"), units: ["word"], labels: ["nsubj", "obj", "amod", "case"], representation: "dependency", task: "dependency-parsing", schema: ["sentence_id", "token_id", "token", "head_id", "dependency_relation", "annotator", "notes"], algorithms: ["statistical", "neural", "transformer"], metrics: ["uas", "las", "error-analysis"] },
  { id: "word-sense", domain: "semantics", name: bi("Word sense", "معنى اللفظ في السياق"), examples: bi("sense distinctions for an ambiguous word", "تمييز معاني اللفظ المشترك بحسب السياق"), units: ["word", "sentence"], labels: ["SENSE_1", "SENSE_2", "OTHER"], representation: "class-label", task: "word-sense-disambiguation", schema: ["instance_id", "sentence", "target_word", "target_offset", "sense_label", "annotator", "confidence", "notes"], algorithms: ["rule-based", "classical-ml", "transformer", "llm"], metrics: ["accuracy", "macro-f1", "confusion-matrix"] },
  { id: "semantic-similarity", domain: "semantics", name: bi("Semantic similarity", "التشابه الدلالي"), examples: bi("similarity between two words, sentences, or passages", "التشابه بين كلمتين أو جملتين أو مقطعين"), units: ["sentence", "document"], labels: ["SIMILAR", "PARTIALLY_SIMILAR", "NOT_SIMILAR"], representation: "paired-text-label", task: "semantic-similarity", schema: ["pair_id", "text_1", "text_2", "similarity_label", "optional_score", "annotator", "confidence", "notes"], algorithms: ["statistical", "classical-ml", "transformer", "llm"], metrics: ["accuracy", "macro-f1", "confusion-matrix", "agreement"] },
  { id: "stance", domain: "discourse", name: bi("Stance", "الموقف الخطابي"), examples: bi("support, oppose, neutral", "التأييد والمعارضة والحياد"), units: ["sentence", "utterance", "document"], labels: ["SUPPORT", "OPPOSE", "NEUTRAL"], representation: "class-label", task: "text-classification", schema: ["document_id", "text", "target", "stance_label", "annotator", "confidence", "notes"], algorithms: ["classical-ml", "transformer", "llm", "hybrid"], metrics: ["macro-f1", "confusion-matrix", "agreement"] },
  { id: "intent-classification", domain: "text-classification", name: bi("Intent or document classification", "تصنيف المقصد أو الوثيقة"), examples: bi("researcher-defined intents, topics, or document classes", "مقاصد أو موضوعات أو فئات وثائق يحددها الباحث"), units: ["utterance", "sentence", "document"], labels: ["CLASS_A", "CLASS_B", "OTHER"], representation: "class-label", task: "text-classification", schema: ["document_id", "text", "class_label", "label_definition_version", "annotator", "confidence", "notes"], algorithms: ["rule-based", "classical-ml", "transformer", "llm", "hybrid"], metrics: ["accuracy", "macro-f1", "confusion-matrix", "agreement"] },
  { id: "relations", domain: "information-extraction", name: bi("Entity relations", "العلاقات بين الكيانات"), examples: bi("works-for, located-in, part-of", "يعمل لدى ويقع في وجزء من"), units: ["span", "sentence"], labels: ["WORKS_FOR", "LOCATED_IN", "PART_OF", "NO_RELATION"], representation: "relation-triple", task: "relation-extraction", schema: ["sentence_id", "text", "entity_1", "entity_2", "relation_label", "annotator", "confidence", "notes"], algorithms: ["rule-based", "classical-ml", "transformer", "llm", "hybrid"], metrics: ["precision", "recall", "f1"] },
  { id: "custom", domain: "custom", name: bi("Other or custom phenomenon", "ظاهرة أخرى أو مخصصة"), examples: bi("Define the phenomenon and its theoretical scope", "عرّف الظاهرة وحدودها النظرية"), units: ["word", "span", "sentence", "utterance", "document"], labels: ["LABEL_A", "LABEL_B"], representation: "class-label", task: "custom-task", schema: ["item_id", "text", "label", "annotator", "confidence", "notes"], algorithms: ["rule-based", "classical-ml", "transformer", "llm", "hybrid"], metrics: ["precision", "recall", "f1", "agreement"] },
]);

export const UNITS = Object.freeze([
  ["character", "Character", "حرف"], ["morpheme", "Morpheme", "مورفيم"], ["token", "Token", "وحدة نصية"], ["word", "Word", "كلمة"], ["phrase", "Phrase", "عبارة"], ["span", "Span", "نطاق نصي"], ["sentence", "Sentence", "جملة"], ["utterance", "Utterance", "ملفوظ"], ["paragraph", "Paragraph", "فقرة"], ["document", "Document", "وثيقة"], ["discourse-segment", "Discourse segment", "مقطع خطابي"],
].map(([id, en, ar]) => Object.freeze({ id, name: bi(en, ar) })));

export const ALGORITHM_FAMILIES = Object.freeze([
  ["rule-based", "Rule-based", "قائم على القواعد", "Explicit conditions written by the researcher; useful when the rule is clear and coverage can be tested.", "شروط صريحة يكتبها الباحث؛ تناسب القواعد الواضحة التي يمكن اختبار تغطيتها."],
  ["statistical", "Statistical", "إحصائي", "Estimates patterns from annotated observations and requires representative data.", "يقدّر الأنماط من مشاهدات مرمزة، ويحتاج إلى بيانات ممثلة للظاهرة."],
  ["classical-ml", "Classical machine learning", "تعلم آلي تقليدي", "Learns from engineered or count-based features and labeled examples.", "يتعلم من سمات مصممة أو عددية ومن أمثلة مصنفة."],
  ["neural", "Neural networks", "شبكات عصبية", "Learns representations from larger labeled datasets and needs careful validation.", "تتعلم التمثيلات من بيانات موسومة أكبر، وتحتاج إلى تحقق دقيق."],
  ["transformer", "Transformer-based models", "نماذج المحولات", "Fine-tunes contextual representations; resource needs and domain fit must be reviewed.", "تضبط تمثيلات سياقية، مع ضرورة مراجعة الموارد وملاءمة المجال."],
  ["llm", "Large language models", "نماذج لغوية كبيرة", "Can support few-shot or prompted tasks, but outputs remain model inferences rather than validated labels.", "قد تدعم المهام بالتعليمات أو الأمثلة القليلة، لكن مخرجاتها تظل استدلالات وليست ترميزات موثقة."],
  ["hybrid", "Hybrid", "هجين", "Combines explicit linguistic constraints with learned predictions.", "يجمع بين القيود اللغوية الصريحة والتنبؤات المتعلمة."],
].map(([id, en, ar, descriptionEn, descriptionAr]) => Object.freeze({ id, name: bi(en, ar), description: bi(descriptionEn, descriptionAr) })));

export const ALGORITHM_GUIDANCE = Object.freeze({
  "rule-based": { data: bi("Documented rules and reviewed tests; labeled training data are not required.", "قواعد موثقة واختبارات مراجعة؛ ولا تتطلب بيانات تدريب موسومة."), advantage: bi("Transparent decisions and direct linguistic control.", "قرارات قابلة للتفسير وتحكم لغوي مباشر."), limitation: bi("Coverage can be brittle across varieties and unseen exceptions.", "قد تضعف التغطية مع التنوع اللغوي والاستثناءات غير المرصودة."), fit: bi("Explicit conditions where interpretability is central.", "الشروط الصريحة عندما تكون قابلية التفسير محورية.") },
  statistical: { data: bi("Representative observations with labels or countable outcomes.", "مشاهدات ممثلة مع فئات موسومة أو نواتج قابلة للعد."), advantage: bi("Interpretable estimates and measurable uncertainty.", "تقديرات قابلة للتفسير وقياس لعدم اليقين."), limitation: bi("Depends on sampling, features, and distributional assumptions.", "يعتمد على العينة والسمات والافتراضات التوزيعية."), fit: bi("Hypothesis-driven patterns and measurable baselines.", "الأنماط الموجهة بالفرضيات وخطوط الأساس القابلة للقياس.") },
  "classical-ml": { data: bi("Labeled examples, explicit features, and documented data splits.", "أمثلة موسومة وسمات صريحة وتقسيمات بيانات موثقة."), advantage: bi("Efficient baselines with inspectable features and errors.", "خطوط أساس فعالة بسمات وأخطاء قابلة للفحص."), limitation: bi("Engineered features may miss context or transfer poorly.", "قد تفوّت السمات المصممة السياق أو تضعف عند الانتقال."), fit: bi("Moderate labeled data and a transparent baseline.", "بيانات موسومة متوسطة والحاجة إلى خط أساس واضح.") },
  neural: { data: bi("Substantial labeled data, validation data, and suitable compute.", "قدر كاف من البيانات الموسومة وبيانات تحقق وموارد حوسبة."), advantage: bi("Learns nonlinear patterns and task-specific representations.", "يتعلم أنماطًا غير خطية وتمثيلات خاصة بالمهمة."), limitation: bi("Resource-intensive, opaque, and sensitive to data quality.", "يتطلب موارد أكبر ويصعب تفسيره ويتأثر بجودة البيانات."), fit: bi("Data and compute justify learning beyond a simpler baseline.", "عندما تبرر البيانات والموارد تجاوز خط أساس أبسط.") },
  transformer: { data: bi("Task labels or validated prompting, plus domain-relevant evaluation data.", "فئات للمهمة أو تعليمات متحقق منها، مع بيانات تقييم ملائمة للمجال."), advantage: bi("Strong contextual representations and pretrained transfer.", "تمثيلات سياقية قوية واستفادة من التعلم المسبق."), limitation: bi("Domain mismatch, cost, opacity, and bias require evaluation.", "تحتاج فجوة المجال والتكلفة والغموض والتحيز إلى تقييم."), fit: bi("Context-sensitive tasks after establishing a baseline.", "المهام الحساسة للسياق بعد تأسيس خط أساس.") },
  llm: { data: bi("Controlled prompts or examples and a researcher-reviewed evaluation set.", "تعليمات مضبوطة أو أمثلة ومجموعة تقييم يراجعها الباحث."), advantage: bi("Flexible for exploratory few-shot and qualitative assistance.", "مرن للاستكشاف بالأمثلة القليلة وللمساعدة النوعية."), limitation: bi("Outputs can vary or lack evidence; generated labels are not gold data.", "قد تتغير المخرجات أو تفتقر إلى الدليل؛ والفئات المولدة ليست معيارية."), fit: bi("A reviewed inference layer, not a replacement for annotation.", "طبقة استدلال خاضعة للمراجعة، لا بديلًا للترميز.") },
  hybrid: { data: bi("Documented rules plus labeled or reviewable examples.", "قواعد موثقة مع أمثلة موسومة أو قابلة للمراجعة."), advantage: bi("Combines linguistic constraints with contextual generalization.", "يجمع القيود اللغوية بالتعميم السياقي."), limitation: bi("Attribution, maintenance, and evaluation become more complex.", "يزداد تعقيد تفسير المصدر والصيانة والتقييم."), fit: bi("Both explicit constraints and learned coverage are required.", "عندما تكون القيود الصريحة والتغطية المتعلمة مطلوبتين.") },
});

export const TASKS = Object.freeze({
  ner: bi("Token classification and named entity recognition", "تصنيف الوحدات والتعرف على الكيانات المسماة"),
  "text-classification": bi("Text classification", "تصنيف النصوص"),
  "morphological-tagging": bi("Morphological tagging", "الوسم الصرفي"),
  "sequence-labeling": bi("Sequence or span labeling", "وسم المتتاليات أو النطاقات"),
  "dependency-parsing": bi("Dependency parsing", "تحليل الاعتماد النحوي"),
  "word-sense-disambiguation": bi("Word-sense disambiguation", "إزالة غموض معنى اللفظ"),
  "semantic-similarity": bi("Similarity or embedding-based task", "مهمة تشابه أو تمثيلات تضمينية"),
  "relation-extraction": bi("Relation extraction", "استخراج العلاقات"),
  "custom-task": bi("Researcher-defined NLP task", "مهمة معالجة يحددها الباحث"),
});

export const METRICS = Object.freeze({
  accuracy: bi("Accuracy", "الدقة الكلية"), precision: bi("Precision", "الإحكام"), recall: bi("Recall", "الاسترجاع"), f1: bi("F1", "درجة F1"), "macro-f1": bi("Macro-F1", "متوسط F1 الكلي"), "micro-f1": bi("Micro-F1", "متوسط F1 الجزئي"), "confusion-matrix": bi("Confusion matrix", "مصفوفة الالتباس"), agreement: bi("Annotator agreement", "اتفاق المرمزين"), uas: bi("Unlabeled attachment score", "دقة الارتباط دون نوع العلاقة"), las: bi("Labeled attachment score", "دقة الارتباط مع نوع العلاقة"), "error-analysis": bi("Linguistic error analysis", "تحليل الأخطاء اللغوية"),
});

export const RESEARCH_STEPS = Object.freeze([
  bi("Phenomenon", "الظاهرة"), bi("Example", "المثال"), bi("Unit", "الوحدة"), bi("Annotation", "الترميز"), bi("Representation", "التمثيل"), bi("Task", "المهمة"), bi("Algorithm", "الخوارزمية"), bi("Evaluation", "التقييم"), bi("Blueprint", "المخطط"),
]);

export const ALGORITHM_STEPS = Object.freeze([
  bi("Rule", "القاعدة"), bi("Examples", "الأمثلة"), bi("Unit", "الوحدة"), bi("Conditions", "الشروط"), bi("Decision logic", "منطق القرار"), bi("Exceptions", "الاستثناءات"), bi("Tests", "الاختبارات"), bi("Pseudocode", "الشفرة الوصفية"), bi("Blueprint", "المخطط"),
]);

export function splitLines(value) {
  return String(value || "").split(/\r?\n|،|,/).map((item) => item.trim()).filter(Boolean).slice(0, 30);
}

export function getPhenomenon(id) {
  return PHENOMENA.find((item) => item.id === id) || PHENOMENA[0];
}

export function createNlpBuilderState() {
  const phenomenon = PHENOMENA[0];
  return {
    version: 1, mode: "research-task", step: 0, maxStep: 0,
    phenomenonId: phenomenon.id, customPhenomenon: "", example: "زار خالد جامعة الملك سعود في الرياض.",
    unit: "token", labelsText: phenomenon.labels.join("\n"), representation: phenomenon.representation,
    task: phenomenon.task, algorithmFamily: phenomenon.algorithms[0], metrics: [...phenomenon.metrics],
    notes: "", aiReview: null, aiDecision: "", aiEditedReview: "",
    ruleDomain: "morphology", ruleName: "", ruleDescription: "", ruleUnit: "word",
    positiveExamples: "", negativeExamples: "", conditions: "", decisionOutput: "MATCH / NO_MATCH / REVIEW",
    exceptions: "", testCases: "", ruleNotes: "", requiredFeatures: "", featureSources: "", dependencies: "", pythonDraft: "", guideDecisions: [], incomingProjectContext: null,
  };
}

export function changePhenomenon(state, phenomenonId) {
  const phenomenon = getPhenomenon(phenomenonId);
  const useSpeechExample = phenomenonId === "speech-acts" && (!state.example.trim() || state.example.trim() === "زار خالد جامعة الملك سعود في الرياض.");
  return { ...state, phenomenonId, example: useSpeechExample ? "هل تستطيع إغلاق النافذة؟" : state.example, unit: phenomenon.units[0], labelsText: phenomenon.labels.join("\n"), representation: phenomenon.representation, task: phenomenon.task, algorithmFamily: phenomenon.algorithms[0], metrics: [...phenomenon.metrics], aiReview: null, aiDecision: "", aiEditedReview: "" };
}

export function normalizeNlpBuilderState(value) {
  const base = createNlpBuilderState();
  if (!value || typeof value !== "object" || value.version !== 1) return base;
  const mode = BUILDER_MODES.some((item) => item.id === value.mode) ? value.mode : base.mode;
  const phenomenonId = PHENOMENA.some((item) => item.id === value.phenomenonId) ? value.phenomenonId : base.phenomenonId;
  const safeString = (key, max = 8000) => typeof value[key] === "string" ? value[key].slice(0, max) : base[key];
  const validUnit = UNITS.some((item) => item.id === value.unit) ? value.unit : getPhenomenon(phenomenonId).units[0];
  const validRuleUnit = UNITS.some((item) => item.id === value.ruleUnit) ? value.ruleUnit : base.ruleUnit;
  const validTask = TASKS[value.task] ? value.task : getPhenomenon(phenomenonId).task;
  const validAlgorithm = ALGORITHM_FAMILIES.some((item) => item.id === value.algorithmFamily) ? value.algorithmFamily : getPhenomenon(phenomenonId).algorithms[0];
  const validAiReview = validStoredReview(value.aiReview) ? value.aiReview : null;
  return {
    ...base, ...value, mode, phenomenonId,
    step: Math.max(0, Math.min(8, Number(value.step) || 0)), maxStep: Math.max(0, Math.min(8, Number(value.maxStep) || 0)),
    example: safeString("example"), customPhenomenon: safeString("customPhenomenon", 500), labelsText: safeString("labelsText", 1500), notes: safeString("notes", 3000),
    ruleName: safeString("ruleName", 300), ruleDescription: safeString("ruleDescription", 3000), positiveExamples: safeString("positiveExamples", 3000), negativeExamples: safeString("negativeExamples", 3000), conditions: safeString("conditions", 4000), exceptions: safeString("exceptions", 4000), testCases: safeString("testCases", 5000), ruleNotes: safeString("ruleNotes", 3000), decisionOutput: safeString("decisionOutput", 500), aiEditedReview: safeString("aiEditedReview", 8000), requiredFeatures: safeString("requiredFeatures", 4000), featureSources: safeString("featureSources", 4000), dependencies: safeString("dependencies", 4000), pythonDraft: safeString("pythonDraft", 30000),
    unit: validUnit, ruleUnit: validRuleUnit, task: validTask, algorithmFamily: validAlgorithm,
    ruleDomain: ["morphology", "syntax"].includes(value.ruleDomain) ? value.ruleDomain : base.ruleDomain,
    representation: typeof value.representation === "string" && value.representation.trim() ? value.representation.slice(0, 100) : base.representation,
    aiReview: validAiReview, aiDecision: ["accept", "modify", "reject"].includes(value.aiDecision) ? value.aiDecision : "",
    guideDecisions: Array.isArray(value.guideDecisions) ? value.guideDecisions.filter(validGuideDecision).slice(-50) : [],
    incomingProjectContext: validIncomingProjectContext(value.incomingProjectContext) ? value.incomingProjectContext : null,
    metrics: Array.isArray(value.metrics) ? value.metrics.filter((metric) => METRICS[metric]).slice(0, 8) : base.metrics,
  };
}

function validGuideDecision(value) {
  return value && typeof value === "object" && typeof value.id === "string" && value.id.length <= 200 && value.source === "smart-guide-suggestion" && ["accepted", "modified", "rejected"].includes(value.status) && typeof value.modifiedText === "string" && value.modifiedText.length <= 4000 && typeof value.decidedAt === "string";
}

function validIncomingProjectContext(value) {
  return value && typeof value === "object" && typeof value.source === "string" && typeof value.transition === "string" && value.provenance?.status === "accepted" && value.payload && typeof value.payload === "object";
}

function validStoredReview(value) {
  return value && typeof value === "object"
    && ["summary", "safeguard"].every((key) => typeof value[key] === "string" && value[key].length <= 4000)
    && ["assumptions", "alternatives", "ambiguities", "nextChecks"].every((key) => Array.isArray(value[key]) && value[key].length <= 20 && value[key].every((item) => typeof item === "string" && item.length <= 2000));
}

export function readNlpBuilderState(storage) {
  try { return normalizeNlpBuilderState(JSON.parse(storage?.getItem(NLP_BUILDER_STORAGE_KEY) || "null")); }
  catch { return createNlpBuilderState(); }
}

export function saveNlpBuilderState(storage, state) {
  const normalized = normalizeNlpBuilderState(state);
  try { storage?.setItem(NLP_BUILDER_STORAGE_KEY, JSON.stringify(normalized)); return { ok: true, state: normalized }; }
  catch { return { ok: false, state: normalized }; }
}

export function validateBuilderStep(state) {
  if (state.mode === "linguistic-algorithm") {
    const checks = [state.ruleName.trim() && state.ruleDescription.trim(), splitLines(state.positiveExamples).length, state.ruleUnit, splitLines(state.conditions).length, state.decisionOutput.trim(), state.exceptions.trim(), splitLines(state.testCases).length, true, true];
    return Boolean(checks[state.step]);
  }
  const labels = splitLines(state.labelsText);
  const checks = [state.phenomenonId !== "custom" || state.customPhenomenon.trim(), state.example.trim(), state.unit, labels.length >= 2, state.representation, state.task, state.algorithmFamily, state.metrics.length, true];
  return Boolean(checks[state.step]);
}

function quotePython(value) {
  return JSON.stringify(String(value || ""), null, 0);
}

export function tokenizeArabicExample(text) {
  return String(text || "").trim().match(/[\p{L}\p{M}\p{N}_]+|[^\s\p{L}\p{M}\p{N}_]/gu) || [];
}

export function buildMachineRepresentation(state) {
  const phenomenon = getPhenomenon(state.phenomenonId);
  const tokens = tokenizeArabicExample(state.example);
  const labels = splitLines(state.labelsText);
  const defaultNer = state.phenomenonId === "named-entities" && state.example.trim() === "زار خالد جامعة الملك سعود في الرياض.";
  const illustrativeLabels = defaultNer
    ? tokens.map((token) => ({ "زار": "O", "خالد": "B-PER", "جامعة": "B-ORG", "الملك": "I-ORG", "سعود": "I-ORG", "في": "O", "الرياض": "B-LOC", ".": "O" })[token] || "REVIEW")
    : tokens.map(() => "REVIEW");
  const defaultSpeechAct = state.phenomenonId === "speech-acts" && state.example.trim() === "هل تستطيع إغلاق النافذة؟";
  const humanInterpretation = defaultNer
    ? ["خالد → PERSON", "جامعة الملك سعود → ORGANIZATION", "الرياض → LOCATION"]
    : defaultSpeechAct
      ? ["البنية السطحية → QUESTION", "الفعل الكلامي المحتمل → REQUEST", "المباشرة → INDIRECT"]
      : ["تحتاج الفئات إلى قرار لغوي موثق من الباحث"];
  const layeredAnnotation = defaultSpeechAct
    ? { utterance: state.example.trim(), surface_form: "QUESTION", speech_act: "REQUEST", directness: "INDIRECT", status: "illustrative-and-theoretically-reviewable" }
    : null;
  return {
    original: state.example.trim(), tokens, labels,
    illustrativeLabels, humanInterpretation, layeredAnnotation,
    note: state.representation === "bio" ? "BIO labels mark the beginning and continuation of spans; O marks tokens outside the selected entity classes." : "The selected labels describe the researcher-defined categories. They are illustrative until validated through a documented annotation process.",
    python: `tokens = ${JSON.stringify(tokens, null, 2)}\nlabels = ${JSON.stringify(illustrativeLabels, null, 2)}\n\n# Illustrative only. Validate every label against the documented annotation guide.`,
    schema: phenomenon.schema,
  };
}

function computationalDesignSummaryText(state, locale) {
  const p = getPhenomenon(state.phenomenonId);
  const labels = splitLines(state.labelsText);
  const name = state.phenomenonId === "custom" ? state.customPhenomenon.trim() : p.name[locale];
  if (locale === "ar") return `يلخص التصميم الحاسوبي تمثيل «${name}» على مستوى ${UNITS.find((item) => item.id === state.unit)?.name.ar || state.unit}. تُعرّف فئات الترميز مسبقًا (${labels.join("، ")}) وتُسجل في بنية بيانات قابلة للمراجعة. تُصاغ المشكلة حاسوبيًا بوصفها ${TASKS[state.task]?.ar || state.task}، مع إبقاء أسرة ${ALGORITHM_FAMILIES.find((item) => item.id === state.algorithmFamily)?.name.ar || state.algorithmFamily} خيارًا مرشحًا. تُحدد مقاييس التقييم وفئات الأخطاء اللغوية المطلوب فحصها. هذا ملخص تصميم حاسوبي، وليس منهجية دراسة مكتملة أو تجربة منفذة أو نتيجة أداء.`;
  return `The computational design represents “${name}” at the ${UNITS.find((item) => item.id === state.unit)?.name.en || state.unit} level. Annotation categories (${labels.join(", ")}) are defined in advance and recorded in a reviewable data structure. The problem is mapped to ${TASKS[state.task]?.en || state.task}, with the ${ALGORITHM_FAMILIES.find((item) => item.id === state.algorithmFamily)?.name.en || state.algorithmFamily} family retained as a candidate. It identifies evaluation metrics and linguistic error categories to inspect. This is a computational design summary, not a complete study methodology, executed experiment, or performance result.`;
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function buildAnnotationCsv(state) {
  const schema = getPhenomenon(state.phenomenonId).schema;
  return `${schema.map(csvEscape).join(",")}\n${schema.map(() => "").join(",")}\n`;
}

export function buildResearchPackage(state, locale = "en") {
  const p = getPhenomenon(state.phenomenonId);
  const labels = splitLines(state.labelsText);
  const phenomenonName = state.phenomenonId === "custom" ? state.customPhenomenon.trim() : p.name[locale];
  const taskName = TASKS[state.task]?.[locale] || state.task;
  const algorithm = ALGORITHM_FAMILIES.find((item) => item.id === state.algorithmFamily);
  const machine = buildMachineRepresentation(state);
  const workflow = locale === "ar"
    ? ["تعريف الظاهرة وحدودها النظرية", `تحديد وحدة التحليل: ${UNITS.find((item) => item.id === state.unit)?.name.ar || state.unit}`, "كتابة دليل الترميز والتحكيم", `إنشاء تمثيل من نوع ${state.representation}`, `بناء بيانات موثقة لمهمة ${taskName}`, `تشغيل خط أساس مراجع من أسرة ${algorithm?.name.ar || state.algorithmFamily}`, "التقييم على بيانات منفصلة أو محكّمة", "تحليل الأخطاء اللغوية وتوثيق كل تعديل"]
    : ["Define phenomenon and theoretical scope", `Set unit: ${state.unit}`, "Write annotation and adjudication guide", `Create ${state.representation} representation`, `Build documented data for ${state.task}`, `Run a reviewed ${state.algorithmFamily} baseline`, "Evaluate on held-out or adjudicated data", "Inspect linguistic errors and document each revision"];
  const pseudocode = locale === "ar"
    ? ["حمّل الأمثلة الموثقة ودليل الترميز", `لكل وحدة من نوع ${UNITS.find((item) => item.id === state.unit)?.name.ar || state.unit} في البيانات`, "  احتفظ بالنص الأصلي وأسند الفئات المسموح بها فقط", `درّب أو اضبط الطريقة المختارة: ${algorithm?.name.ar || state.algorithmFamily}`, "طبّق التنبؤ على حالات تقييم منفصلة", "احسب المقاييس المختارة", "جمّع حالات الاختلاف بحسب الفئة اللغوية وموضع الغموض", "عدّل البيانات أو الفئات أو الطريقة بعد مراجعة موثقة فقط"]
    : ["LOAD documented examples and annotation guide", `FOR each ${state.unit} in the dataset`, "  PRESERVE the original text and assign only allowed labels", `TRAIN or configure the selected ${state.algorithmFamily} method`, "PREDICT on separate evaluation cases", "COMPUTE the selected metrics", "GROUP mismatches by linguistic category and ambiguity", "REVISE data, labels, or method only after documented review"];
  const python = `# Starter structure only; review and test before research use.\nfrom dataclasses import dataclass\n\nALLOWED_LABELS = ${JSON.stringify(labels, null, 2)}\n\n@dataclass\nclass Example:\n    text: str\n    label: str\n\ndef validate(example: Example) -> bool:\n    return bool(example.text.strip()) and example.label in ALLOWED_LABELS\n\ndef train_and_evaluate(examples):\n    \"\"\"Add a documented split, a reviewed ${state.algorithmFamily} method, and task-appropriate metrics.\"\"\"\n    valid = [item for item in examples if validate(item)]\n    raise NotImplementedError(\"Choose and test the method before claiming results.\")\n`;
  return {
    kind: "nlp-research-blueprint", status: "planned-computational-design", phenomenon: phenomenonName, example: state.example.trim(), unit: state.unit,
    annotation: { labels, representation: state.representation, status: "illustrative-until-validated" },
    dataSchema: machine.schema, computationalTask: { id: state.task, name: taskName, rationale: locale === "ar" ? `تطابق هذه المهمة وحدة التحليل (${state.unit}) وطريقة إسناد الفئات المختارة.` : `This task matches the selected unit (${state.unit}) and label assignment.` },
    algorithm: { family: state.algorithmFamily, name: algorithm?.name[locale] || state.algorithmFamily, description: algorithm?.description[locale] || "" },
    evaluation: { metrics: state.metrics.map((metric) => METRICS[metric]?.[locale] || metric), errorAnalysis: locale === "ar" ? "راجع التباس الفئات، وحدود النطاق، واختلاف المرمزين، وأثر السياق والمعالجة المسبقة." : "Inspect label confusion, span boundaries, annotator disagreement, context, and preprocessing effects." },
    workflow, pseudocode, pythonStarter: python, computationalDesignSummary: computationalDesignSummaryText(state, locale), notes: state.notes.trim(), annotationCsv: buildAnnotationCsv(state),
  };
}

function ruleTests(state) {
  const positives = splitLines(state.positiveExamples).map((input) => ({ input, expected: "MATCH", source: "positive-example" }));
  const negatives = splitLines(state.negativeExamples).map((input) => ({ input, expected: "NO_MATCH", source: "negative-example" }));
  const custom = splitLines(state.testCases).map((line) => {
    const [input, expected = "REVIEW"] = line.split(/=>|→/).map((item) => item.trim());
    return { input, expected, source: "researcher-test" };
  });
  return [...positives, ...negatives, ...custom].filter((item) => item.input).slice(0, 50);
}

export function buildRuleAlgorithmPackage(state, locale = "en") {
  const conditions = splitLines(state.conditions);
  const exceptions = splitLines(state.exceptions);
  const requiredFeatures = splitLines(state.requiredFeatures);
  const featureSources = splitLines(state.featureSources);
  const dependencies = splitLines(state.dependencies).map((entry) => {
    const [name, status = "placeholder"] = entry.split("|").map((item) => item.trim());
    return { name, status: /^(implemented|external|manual)$/i.test(status) ? status.toLowerCase() : "placeholder" };
  });
  const tests = ruleTests(state);
  const pseudocode = locale === "ar" ? [
    "استقبل وحدة إدخال موثقة وسياقها",
    "احتفظ بالصيغة الأصلية قبل أي تطبيع",
    ...conditions.map((condition, index) => `تحقق من C${index + 1}: ${condition}`),
    "إذا غاب الدليل اللازم: أعد REVIEW",
    ...exceptions.map((exception, index) => `إذا انطبق الاستثناء E${index + 1} (${exception}): أعد REVIEW`),
    "إذا تحققت جميع الشروط اللازمة: أعد MATCH",
    "وإلا: أعد NO_MATCH",
    "سجّل الشروط المتحققة والاستثناءات وسبب القرار",
  ] : [
    "RECEIVE one documented input unit and its context",
    "PRESERVE the original form before normalization",
    ...conditions.map((condition, index) => `CHECK C${index + 1}: ${condition}`),
    "IF required evidence is missing: RETURN REVIEW",
    ...exceptions.map((exception, index) => `IF exception E${index + 1} applies (${exception}): RETURN REVIEW`),
    "IF all required conditions hold: RETURN MATCH",
    "OTHERWISE: RETURN NO_MATCH",
    "LOG the matched conditions, exception flags, and decision reason",
  ];
  const conditionObjects = conditions.map((text, index) => ({ id: `C${index + 1}`, description: text, implemented: false }));
  const python = `# Starter rule scaffold only. Linguistic conditions remain TODO until formalized and tested.\nfrom dataclasses import dataclass\n\n@dataclass\nclass Decision:\n    label: str\n    matched_conditions: list[str]\n    review_reasons: list[str]\n\ndef analyze(text: str, context: dict | None = None) -> Decision:\n    context = context or {}\n    original = text\n    if not original.strip():\n        return Decision("REVIEW", [], ["empty input"])\n\n    matched = []\n${conditionObjects.map((condition) => `    # TODO ${condition.id}: ${condition.description.replace(/\n/g, " ")}\n    ${condition.id.toLowerCase()} = False\n    if ${condition.id.toLowerCase()}:\n        matched.append(${quotePython(condition.id)})`).join("\n\n") || "    # TODO: add documented linguistic conditions\n    matched_condition = False"}\n\n    # Preserve ambiguity and exceptions instead of forcing a binary answer.\n    review_reasons = []\n${exceptions.map((exception) => `    # TODO exception: ${exception.replace(/\n/g, " ")}\n    exception_applies = False\n    if exception_applies:\n        review_reasons.append(${quotePython(exception)})`).join("\n") || "    # No exceptions documented yet."}\n    if review_reasons:\n        return Decision("REVIEW", matched, review_reasons)\n    if ${conditionObjects.length ? conditionObjects.map((condition) => condition.id.toLowerCase()).join(" and ") : "matched_condition"}:\n        return Decision("MATCH", matched, [])\n    return Decision("NO_MATCH", matched, [])\n`;
  const computationalDesignSummary = locale === "ar"
    ? `تُحوّل القاعدة «${state.ruleName.trim()}» في مجال ${state.ruleDomain === "morphology" ? "الصرف" : "النحو"} إلى شروط صريحة تطبق على مستوى ${UNITS.find((item) => item.id === state.ruleUnit)?.name.ar || state.ruleUnit}. تحفظ الخوارزمية الصيغة الأصلية والسياق، وتعيد MATCH أو NO_MATCH أو REVIEW بدل إخفاء الغموض. تختبر الحالات الموجبة والسالبة والاستثناءات قبل اعتبار القاعدة قابلة للاستخدام البحثي. هذه بنية أولية، ولا تمثل حكمًا لغويًا نهائيًا.`
    : `The “${state.ruleName.trim()}” rule in ${state.ruleDomain} is converted into explicit conditions applied at the ${UNITS.find((item) => item.id === state.ruleUnit)?.name.en || state.ruleUnit} level. The algorithm preserves the original form and context and returns MATCH, NO_MATCH, or REVIEW rather than hiding ambiguity. Positive, negative, and exception cases must be tested before research use. This is a starter design, not a final linguistic judgment.`;
  const traceability = conditionObjects.map((condition) => ({ ruleId: condition.id, logicBlock: `check-${condition.id.toLowerCase()}`, codeBlock: `generated-${condition.id.toLowerCase()}`, status: "placeholder", generatedFrom: condition.description }));
  return {
    kind: "linguistic-rule-algorithm", status: "planned-and-unimplemented", domain: state.ruleDomain, ruleName: state.ruleName.trim(), ruleDescription: state.ruleDescription.trim(), unit: state.ruleUnit,
    inputs: { positiveExamples: splitLines(state.positiveExamples), negativeExamples: splitLines(state.negativeExamples) },
    requiredFeatures: requiredFeatures.map((name, index) => ({ name, source: featureSources[index] || "unspecified" })), dependencies, conditions: conditionObjects, exceptions, outputLabels: String(state.decisionOutput || "MATCH / NO_MATCH / REVIEW").split(/\s*\/\s*|\r?\n|،|,/).filter(Boolean), tests, pseudocode, pythonStarter: state.pythonDraft.trim() || python, generatedPythonStarter: python, traceability,
    safeguards: locale === "ar"
      ? ["الاحتفاظ بالصيغة الأصلية", "استخدام السياق عندما تعتمد عليه القاعدة", "إعادة REVIEW عند بقاء الغموض", "تسجيل الشروط المتحققة والاستثناءات", "التحقق بحالات اختبرها الباحث"]
      : ["Preserve the original form", "Use context when the rule depends on it", "Return REVIEW for unresolved ambiguity", "Record matched conditions and exceptions", "Validate against researcher-reviewed test cases"],
    computationalDesignSummary, notes: state.ruleNotes.trim(),
  };
}

export function buildCurrentPackage(state, locale = "en") {
  return state.mode === "linguistic-algorithm" ? buildRuleAlgorithmPackage(state, locale) : buildResearchPackage(state, locale);
}

export function serializePackage(value) {
  return JSON.stringify(value, null, 2);
}

export function applyIncomingToNlpBuilder(state, acceptedContext) {
  if (!acceptedContext?.payload || acceptedContext.provenance?.status !== "accepted") return state;
  const p = acceptedContext.payload;
  const base = createNlpBuilderState();
  const next = { ...state, incomingProjectContext: acceptedContext };
  if (acceptedContext.source === "research") {
    if ((!state.customPhenomenon || state.customPhenomenon === base.customPhenomenon) && p.knownPhenomenon) {
      next.phenomenonId = "custom";
      next.customPhenomenon = p.knownPhenomenon;
    }
    const researchNote = [p.projectTitle, p.researchQuestion, p.proposedData, ...(p.methodologicalConstraints || [])].filter(Boolean).join("\n");
    if (!state.notes.trim() && researchNote) next.notes = researchNote;
  }
  if (acceptedContext.source === "code") {
    if (state.labelsText === base.labelsText && Array.isArray(p.availableLabels) && p.availableLabels.length) next.labelsText = p.availableLabels.join("\n");
    if (state.unit === base.unit && UNITS.some((item) => item.id === p.unitOfAnalysis)) next.unit = p.unitOfAnalysis;
    const issue = [p.linguisticIssue, p.ambiguityIssue].filter(Boolean).join("\n");
    if (!state.notes.trim() && issue) next.notes = issue;
  }
  return next;
}

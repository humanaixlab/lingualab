const label = (en, ar) => Object.freeze({ en, ar });

export const PROJECT_TOOL_LABELS = Object.freeze({
  "AI Code Assistant": label("Code Builder", "أداة بناء الكود"),
  "Code Generator": label("Code Builder", "أداة بناء الكود"),
  "Concordance / Contexts": label("Concordance / Contexts", "السياقات"),
  "Corpus Research": label("Corpus Research", "إنشاء وتحليل المدونة (Corpus Research)"),
  "Discourse Analysis": label("Discourse Analysis", "تحليل الخطاب (Discourse Analysis)"),
  Frequency: label("Frequency Analysis", "تحليل التكرار"),
  "Google Colab": label("Google Colab", "Google Colab"),
  "Information Extraction": label("Information Extraction", "استخراج المعلومات (Information Extraction)"),
  "Morphology & Syntax Research Preview": label("Morphology & Syntax Analysis", "التحليل الصرفي والنحوي (Morphology & Syntax)"),
  "N-grams": label("N-grams", "المتتاليات اللفظية"),
  "NLP Experiments": label("NLP Experiments", "تجارب معالجة اللغة الطبيعية (NLP Experiments)"),
  POS: label("Part-of-Speech Analysis (POS)", "تحليل أقسام الكلام (POS)"),
  Pragmatics: label("Pragmatics", "التداولية (Pragmatics)"),
  "Prompt Assistant": label("Prompt Builder", "أداة بناء التعليمات"),
  "Semantics Research Preview": label("Semantic Analysis", "التحليل الدلالي (Semantic Analysis)"),
  "Spreadsheet Explorer": label("Spreadsheet Explorer", "مستكشف الجداول"),
  "Text Classification Research Preview": label("Text Classification", "تصنيف النصوص (Text Classification)"),
  Workspace: label("Workspace", "مساحة العمل"),
});

export const PROJECT_TASK_LABELS = Object.freeze({
  "action-extraction": label("Action Extraction", "استخراج الإجراءات"),
  "activity-generation": label("Activity Generation", "توليد الأنشطة"),
  "ambiguity-detection": label("Ambiguity Detection", "اكتشاف الغموض"),
  "attribute-extraction": label("Attribute Extraction", "استخراج السمات"),
  classification: label("Text Classification", "تصنيف النصوص (Text Classification)"),
  "complexity-analysis": label("Complexity Analysis", "تحليل التعقيد"),
  "condition-extraction": label("Condition Extraction", "استخراج الشروط"),
  "content-adaptation": label("Content Adaptation", "تكييف المحتوى"),
  "contextual-interpretation": label("Contextual Interpretation", "التفسير السياقي"),
  "corpus-analysis": label("Corpus Analysis", "تحليل المدونة"),
  "discourse-comparison": label("Discourse Comparison", "مقارنة الخطاب"),
  formality: label("Formality Analysis", "تحليل درجة الرسمية"),
  implicature: label("Conversational Implicature", "الاستلزام الحواري"),
  "instruction-classification": label("Instruction Classification", "تصنيف التعليمات"),
  "instruction-decomposition": label("Instruction Decomposition", "تفكيك التعليمات"),
  "instruction-segmentation": label("Instruction Segmentation", "تقسيم التعليمات"),
  "intent-extraction": label("Intent Extraction", "استخراج المقصد"),
  "landmark-extraction": label("Landmark Extraction", "استخراج المعالم"),
  "lexical-simplification": label("Lexical Simplification", "التبسيط المعجمي"),
  "location-extraction": label("Location Extraction", "استخراج المواقع"),
  "named-entities": label("Named Entity Recognition (NER)", "استخراج الكيانات المسماة (Named Entity Recognition – NER)"),
  "question-generation": label("Question Generation", "توليد الأسئلة"),
  ranking: label("Ranking", "الترتيب"),
  "readability-review": label("Readability Review", "مراجعة قابلية القراءة"),
  "relation-extraction": label("Relation Extraction", "استخراج العلاقات (Relation Extraction)"),
  "requirement-extraction": label("Requirement Extraction", "استخراج المتطلبات"),
  segmentation: label("Segmentation", "التقسيم"),
  "semantic-grouping": label("Semantic Grouping", "التجميع الدلالي (Semantic Grouping)"),
  "semantic-similarity": label("Semantic Similarity", "التشابه الدلالي (Semantic Similarity)"),
  similarity: label("Semantic Similarity", "التشابه الدلالي (Semantic Similarity)"),
  simplification: label("Simplification", "التبسيط"),
  "speech-acts": label("Speech Acts", "الأفعال الكلامية"),
  stance: label("Stance Analysis", "تحليل الموقف"),
  "stance-analysis": label("Stance Analysis", "تحليل الموقف"),
  structuring: label("Information Structuring", "هيكلة المعلومات"),
  "terminology-detection": label("Terminology Detection", "اكتشاف المصطلحات"),
  "terminology-extraction": label("Terminology Extraction", "استخراج المصطلحات"),
  "terminology-normalization": label("Terminology Normalization", "توحيد المصطلحات"),
  "terminology-tracking": label("Terminology Tracking", "تتبّع المصطلحات"),
  topic: label("Topic Analysis", "تحليل الموضوعات"),
  "topic-discovery": label("Topic Discovery", "اكتشاف الموضوعات"),
  "Ambiguity detection": label("Ambiguity Detection", "اكتشاف الغموض"),
  "Information extraction": label("Information Extraction", "استخراج المعلومات"),
  "Instruction segmentation · simplification · comprehension checking": label("Instruction Segmentation · Simplification · Comprehension Checking", "تقسيم التعليمات · التبسيط · التحقق من الفهم"),
  "Pragmatics · speech acts · implicature": label("Pragmatics · Speech Acts · Implicature", "التداولية · الأفعال الكلامية · الاستلزام الحواري"),
  "Segmentation · simplification · terminology analysis": label("Segmentation · Simplification · Terminology Analysis", "التقسيم · التبسيط · تحليل المصطلحات"),
  "Semantic matching · normalization · entity extraction": label("Semantic Matching · Normalization · Entity Extraction", "المطابقة الدلالية · التوحيد · استخراج الكيانات"),
  "Semantic similarity · clustering · variation analysis": label("Semantic Similarity · Clustering · Variation Analysis", "التشابه الدلالي · التجميع · تحليل التنوع"),
  "Stance classification": label("Stance Classification", "تصنيف الموقف"),
});

export const SCIENTIFIC_TERM_LABELS = Object.freeze({
  baseline: label("Baseline", "نموذج مرجعي بسيط (Baseline)"),
  "confusion-matrix": label("Confusion Matrix", "مصفوفة الالتباس (Confusion Matrix)"),
  accuracy: label("Accuracy", "الدقة (Accuracy)"),
  precision: label("Precision", "الدقة الإيجابية (Precision)"),
  recall: label("Recall", "الاستدعاء (Recall)"),
  "f1-score": label("F1 Score", "درجة F1 (F1 Score)"),
  ner: label("Named Entity Recognition (NER)", "استخراج الكيانات المسماة (Named Entity Recognition – NER)"),
  "relation-extraction": label("Relation Extraction", "استخراج العلاقات (Relation Extraction)"),
  "semantic-grouping": label("Semantic Grouping", "التجميع الدلالي (Semantic Grouping)"),
  "semantic-similarity": label("Semantic Similarity", "التشابه الدلالي (Semantic Similarity)"),
  normalization: label("Text Normalization", "التطبيع النصي (Text Normalization)"),
  annotation: label("Annotation", "التوسيم (Annotation)"),
  "human-reference": label("Human Reference / Gold Standard", "المرجع البشري (Human Reference / Gold Standard)"),
  evaluation: label("Evaluation", "التقييم (Evaluation)"),
  "error-analysis": label("Error Analysis", "تحليل الأخطاء (Error Analysis)"),
  inference: label("AI-supported Inference", "الاستدلال المدعوم بالذكاء الاصطناعي (AI-supported Inference)"),
  deterministic: label("Deterministic Computation", "الحساب الحتمي (Deterministic Computation)"),
  prototype: label("Prototype", "النموذج الأولي (Prototype)"),
  benchmark: label("Benchmark", "المعيار المرجعي (Benchmark)"),
  classification: label("Text Classification", "تصنيف النصوص (Text Classification)"),
  "code-switching": label("Code-switching", "التناوب اللغوي (Code-switching)"),
  asr: label("Automatic Speech Recognition (ASR)", "التعرّف الآلي على الكلام (Automatic Speech Recognition – ASR)"),
});

function humanize(value) {
  if (typeof value !== "string" || !value.trim()) return "—";
  return value.trim().replace(/[-_]+/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function displayLabel(labels, value, language) {
  const selectedLanguage = language === "ar" ? "ar" : "en";
  return labels[value]?.[selectedLanguage] || labels[value]?.en || humanize(value);
}

export const getProjectToolLabel = (value, language) => displayLabel(PROJECT_TOOL_LABELS, value, language);
export const getProjectTaskLabel = (value, language) => displayLabel(PROJECT_TASK_LABELS, value, language);
export const getScientificTermLabel = (value, language) => displayLabel(SCIENTIFIC_TERM_LABELS, value, language);

import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import DataSourceIndicator from "../../components/DataSourceIndicator";
import ProgressiveAiOutput from "../../components/ProgressiveAiOutput";
import { useLanguage } from "../../components/LanguageProvider";
import { fetchAiJson } from "../../lib/ai-stream";
import {
  ALGORITHM_FAMILIES,
  ALGORITHM_GUIDANCE,
  ALGORITHM_STEPS,
  BUILDER_MODES,
  METRICS,
  PHENOMENA,
  PHENOMENON_DOMAINS,
  RESEARCH_STEPS,
  TASKS,
  UNITS,
  buildCurrentPackage,
  buildMachineRepresentation,
  buildRuleAlgorithmPackage,
  changePhenomenon,
  createNlpBuilderState,
  getPhenomenon,
  readNlpBuilderState,
  saveNlpBuilderState,
  serializePackage,
  splitLines,
  validateBuilderStep,
  applyIncomingToNlpBuilder,
} from "../../lib/nlp-builder";
import { GUIDE_LEVELS, buildGuideContext, buildProgrammingBridge, currentStageGuidance, detectBuilderIssues, recordGuideDecision } from "../../lib/nlp-builder-guide";
import { TOOL_OWNERS } from "../../lib/capability-ownership";
import { acceptProjectHandoff, buildNlpProjectPayload, createProjectHandoff, incomingHandoffPreview, readProjectHandoff } from "../../lib/structured-handoff";
import styles from "../../styles/NlpBuilder.module.css";

const COPY = {
  en: {
    head: "NLP Builder | LinguaLab", eyebrow: "BUILD · COMPUTATIONAL LINGUISTICS", title: "NLP Builder", subtitle: "Turn linguistic phenomena into computational models", lead: "Build the research logic before choosing code or a model. LinguaLab shows how a linguistic concept becomes annotation, structured data, a computational task, and an evaluation plan.", back: "Back to Build", preview: "Research prototype", notice: "This workspace produces a planned design and illustrative representations. It does not train a model, validate annotations, or report experimental results.",
    chooseMode: "Choose what you want to build", saved: "Draft saved locally in this browser.", saveError: "Local saving is unavailable; your current draft remains visible in this tab.", previous: "Previous", next: "Next", openStep: "Open step", required: "Complete the required information before continuing.", reset: "Start a new design", resetConfirm: "Start over and clear the current local draft?", explanation: "What does this mean?", blueprint: "Live Blueprint", incomplete: "Not defined yet", labels: "Labels", unit: "Unit", task: "Task", algorithm: "Algorithm family", evaluation: "Evaluation", phenomenon: "Phenomenon", rule: "Rule", domain: "Domain", status: "Status", planned: "Planned design", review: "Researcher review required",
    phenomenonTitle: "Define the linguistic phenomenon", phenomenonText: "Choose the linguistic concept before choosing the method. A custom phenomenon should include its theoretical scope.", customPhenomenon: "Custom phenomenon and scope", customPlaceholder: "Example: forms of epistemic certainty in institutional discourse", exampleTitle: "Add an Arabic example", exampleText: "Use one bounded example that makes the phenomenon observable. The example is for design, not a substitute for a dataset.", exampleLabel: "Word, phrase, sentence, or short passage", unitTitle: "Choose the unit of analysis", unitText: "The unit determines what receives a label or enters the algorithm. Different layers may require different units.", annotationTitle: "Define annotation labels", annotationText: "A label connects the linguistic definition to a machine-readable value. It is the bridge between linguistic theory and the computational model. Write one label per line and retain an annotation guide outside the model.", labelsLabel: "Allowed labels", labelsHint: "At least two labels are required. Labels remain illustrative until validated.", representationTitle: "How does the machine see this?", representationText: "The original text is preserved, interpreted at a stated linguistic layer, segmented into units, and paired with machine-readable labels. REVIEW marks items that still need a documented human decision.", original: "Original text", humanView: "Human linguistic interpretation", tokenized: "Tokenized representation", illustrative: "Illustrative computational annotation", layered: "Layered annotation record", codeView: "Python-like representation", schema: "Data schema", representationCaution: "Illustrative example only; it is not gold-standard research data. BIO marks the beginning (B) and continuation (I) of a span; O marks a token outside the selected classes.", taskTitle: "Map the research question to an NLP task", taskText: "The computational task describes the prediction or structure to produce. It is not the algorithm, trained model, or data representation.", taskRationale: "This mapping follows the selected unit and label structure. Change it when the research question requires a different output.", algorithmTitle: "Compare algorithm and model families", algorithmText: "Select a candidate family after considering annotation, data volume, interpretability, and resource needs. An algorithm is a procedure; a trained model is the fitted result. No family is universally best.", evaluationTitle: "Plan evaluation and error analysis", evaluationText: "Choose metrics that match the task, then inspect which linguistic categories and ambiguous cases produce errors.", errorPrompt: "What should the linguist inspect?", errorText: "Label confusion, span boundaries, annotator disagreement, context dependence, preprocessing effects, and errors concentrated in one variety or category.", blueprintTitle: "Computational Linguistics Blueprint", blueprintText: "Review the complete planned design before implementation. Every generated artifact remains editable and requires scholarly validation.", computationalDesignSummary: "Computational design summary", workflow: "Workflow", pseudocode: "Pseudocode", starterCode: "Python starter code", packageJson: "Structured blueprint", downloadJson: "Download blueprint JSON", downloadCsv: "Download annotation CSV", downloadPython: "Download Python starter", copyPseudocode: "Copy pseudocode", copied: "Copied", notes: "Researcher notes", notesPlaceholder: "Record theoretical choices, exclusions, or unresolved cases.",
    ruleTitle: "Define an Arabic linguistic rule", ruleText: "State a bounded morphological or syntactic rule in your own terms. The Builder will not treat it as universally correct.", morphology: "Morphology", syntax: "Syntax", ruleName: "Rule name", ruleNamePlaceholder: "Example: detecting a possible sound masculine plural ending", ruleDescription: "Linguistic definition and scope", ruleDescriptionPlaceholder: "State what the rule covers, required context, and what it does not establish.", examplesTitle: "Document positive and negative examples", examplesText: "Examples reveal the intended coverage and help prevent a rule from being coded too broadly.", positive: "Positive examples", negative: "Negative or contrastive examples", onePerLine: "One case per line", ruleUnitTitle: "Choose the input unit", ruleUnitText: "Define whether the rule receives a word, morpheme, token, span, or sentence, and whether surrounding context is required.", conditionsTitle: "Translate the rule into conditions", conditionsText: "Write observable conditions rather than repeating the linguistic label. Each condition must later become a testable function.", conditions: "Computable conditions", conditionsPlaceholder: "Example: the token ends with ون\nthe preceding context does not mark a proper name\nthe form has a documented lexical analysis", logicTitle: "Define decision logic", logicText: "Use explicit outcomes. REVIEW prevents the algorithm from forcing a decision when evidence or context is insufficient.", outputs: "Decision outputs", exceptionsTitle: "Preserve ambiguity and exceptions", exceptionsText: "List lexical exceptions, contextual dependencies, spelling variation, and theoretically disputed cases.", exceptions: "Exceptions and review triggers", exceptionsPlaceholder: "One exception or ambiguity trigger per line", testsTitle: "Create test cases", testsText: "Include expected outcomes before writing the implementation. A passing test checks your stated rule, not universal linguistic truth.", tests: "Test cases", testsPlaceholder: "المعلمون => MATCH\nهارون => NO_MATCH\nمعلمون without context => REVIEW", pseudoTitle: "Review pseudocode and starter code", pseudoText: "The generated code contains TODO conditions. Replace them only after formalizing and testing the linguistic rule.", algorithmBlueprint: "Linguistic Algorithm Blueprint", algorithmBlueprintText: "The blueprint preserves the rule, conditions, exceptions, tests, and REVIEW outcome as separate research decisions.",
    familyData: "Data and training", familyAdvantage: "Advantage", familyLimitation: "Limitation", familyFit: "When it fits", aiTitle: "Optional computational design review", aiText: "Ask the model to identify assumptions, alternatives, ambiguities, and validation checks. It cannot alter your blueprint.", generateReview: "Generate design review", generating: "Generating review…", aiError: "The review could not be completed.", assumptions: "Assumptions to verify", alternatives: "Alternatives", ambiguities: "Ambiguities", nextChecks: "Next checks", safeguard: "Safeguard", accept: "Accept review", modify: "Modify review", reject: "Reject review", finalReview: "Researcher decision", modifyLabel: "Editable review record", decisionRequired: "Choose Accept, Modify, or Reject after reviewing the suggestion.",
    smartGuide: "Smart Algorithm Guide", currentStage: "Current stage", whatNow: "What are we doing now?", whyNeeded: "Why is this necessary?", researcherDecision: "What must the researcher decide?", whatNext: "What happens next?", simpler: "Explain more simply", why: "Why?", showExample: "Show me with an example", impact: "What happens if I choose this?", detectedIssues: "Design checks", noIssues: "No current issue was detected at this stage. Continue reviewing; this is not a validity guarantee.", source: "Source", pending: "Pending", accepted: "Researcher accepted", modified: "Researcher modified", rejected: "Researcher rejected", modifySuggestion: "Modify this suggestion", requiredFeatures: "Required linguistic features", featureSources: "Feature sources", dependencies: "Dependencies", featureHint: "One feature per line, for example: subject_gender", sourceHint: "One matching source per line: manual, rule, or named external parser", dependencyHint: "One per line: name | implemented, external, manual, or placeholder", bridge: "Beginner Programming Bridge", sameIdea: "The same idea in four forms", linguisticRule: "1. Linguistic rule", decisionLogic: "2. Decision logic", codeExplanation: "Explain this code", traceability: "Generated from", placeholder: "Placeholder", dontKnow: "I don't know how to code this", infoQuestion: "What information does the algorithm need for this step?", gradualPath: "Linguistic information → variable → condition → pseudocode → Python", decisionTrace: "How did the algorithm make this decision?", incoming: "Incoming project context", incomingNotice: "Nothing in your current design has been replaced. Review the context before accepting it.", mergeIncoming: "Accept and merge available context", dismissIncoming: "Keep current design", transferTitle: "Continue the same project", continueCode: "Continue to Code Builder", useResearch: "Use in Research", transferPreview: "You are transferring", confirmTransfer: "Confirm transfer", cancelTransfer: "Cancel", ownerMap: "Capability ownership", codeOwner: "Code Builder implements datasets, pipelines, training, and reusable code. NLP Builder keeps only educational code tied to this linguistic design.",
  },
  ar: {
    head: "بناء المعالجة اللغوية حاسوبيًا | LinguaLab", eyebrow: "البناء · اللسانيات الحاسوبية", title: "بناء المعالجة اللغوية حاسوبيًا", subtitle: "حوّل الظاهرة اللغوية إلى بيانات وترميز ونموذج حاسوبي", lead: "ابنِ منطق الدراسة قبل اختيار الكود أو النموذج. يوضح LinguaLab كيف يتحول المفهوم اللغوي إلى ترميز وبيانات منظمة ومهمة حاسوبية وخطة تقييم.", back: "العودة إلى البناء", preview: "نموذج أولي بحثي", notice: "تنتج هذه المساحة تصميمًا مخططًا وتمثيلات توضيحية. وهي لا تدرب نموذجًا، ولا توثق الترميزات، ولا تعرض نتائج تجربة منفذة.",
    chooseMode: "اختر ما تريد بناءه", saved: "حُفظت المسودة محليًا في هذا المتصفح.", saveError: "تعذر الحفظ المحلي، وتبقى المسودة الحالية ظاهرة في علامة التبويب.", previous: "السابق", next: "التالي", openStep: "فتح المرحلة", required: "أكمل المعلومات المطلوبة قبل المتابعة.", reset: "بدء تصميم جديد", resetConfirm: "هل تريد البدء من جديد ومسح المسودة المحلية الحالية؟", explanation: "ماذا يعني هذا؟", blueprint: "المخطط المباشر", incomplete: "لم يحدد بعد", labels: "الفئات", unit: "الوحدة", task: "المهمة", algorithm: "أسرة الخوارزمية", evaluation: "التقييم", phenomenon: "الظاهرة", rule: "القاعدة", domain: "المجال", status: "الحالة", planned: "تصميم مخطط", review: "يتطلب مراجعة الباحث",
    phenomenonTitle: "حدّد الظاهرة اللغوية", phenomenonText: "اختر المفهوم اللغوي قبل اختيار المنهج. وإذا كانت الظاهرة مخصصة، فعرّفها وحدد نطاقها النظري.", customPhenomenon: "الظاهرة المخصصة ونطاقها", customPlaceholder: "مثال: صيغ اليقين المعرفي في الخطاب المؤسسي", exampleTitle: "أضف مثالًا عربيًا", exampleText: "استخدم مثالًا محدودًا يجعل الظاهرة قابلة للملاحظة. يساعد المثال على التصميم ولا يحل محل مجموعة البيانات.", exampleLabel: "كلمة أو عبارة أو جملة أو مقطع قصير", unitTitle: "اختر وحدة التحليل", unitText: "تحدد الوحدة ما الذي سيحمل الفئة أو يدخل إلى الخوارزمية. وقد تحتاج المستويات اللغوية المختلفة إلى وحدات مختلفة.", annotationTitle: "عرّف فئات الترميز", annotationText: "تربط الفئة بين التعريف اللغوي والقيمة التي يقرؤها الحاسوب؛ فهي الجسر بين النظرية اللغوية والنموذج الحاسوبي. اكتب فئة في كل سطر واحتفظ بدليل ترميز مستقل عن النموذج.", labelsLabel: "الفئات المسموح بها", labelsHint: "يلزم وجود فئتين على الأقل. وتظل الفئات توضيحية حتى تخضع للتحقق.", representationTitle: "كيف يرى الحاسوب هذه البيانات؟", representationText: "يحفظ النص الأصلي، ثم يفسر على مستوى لغوي محدد، ويقسّم إلى وحدات ترتبط بفئات قابلة للقراءة آليًا. وتعني REVIEW أن العنصر ما يزال يحتاج إلى قرار بشري موثق.", original: "النص الأصلي", humanView: "التفسير اللغوي البشري", tokenized: "التمثيل بعد التجزئة", illustrative: "الترميز الحاسوبي التوضيحي", layered: "سجل الترميز متعدد المستويات", codeView: "تمثيل شبيه ببايثون", schema: "بنية البيانات", representationCaution: "هذا مثال توضيحي وليس بيانات بحثية معيارية موثقة. تشير B إلى بداية النطاق، وI إلى استمراره، وO إلى وحدة خارج الفئات المختارة.", taskTitle: "اربط سؤال البحث بمهمة معالجة لغوية", taskText: "تصف المهمة الحاسوبية نوع التنبؤ أو البنية المطلوب إنتاجها، وليست هي الخوارزمية أو النموذج المدرب أو تمثيل البيانات.", taskRationale: "بني هذا الربط على وحدة التحليل وطريقة إسناد الفئات. غيّره إذا كان سؤال البحث يتطلب مخرجًا آخر.", algorithmTitle: "قارن أسر الخوارزميات والنماذج", algorithmText: "اختر أسرة مرشحة بعد النظر في الترميز وحجم البيانات وقابلية التفسير والموارد. الخوارزمية إجراء، أما النموذج المدرب فهو الناتج الملائم للبيانات. ولا توجد أسرة هي الأفضل لجميع الحالات.", evaluationTitle: "خطط للتقييم وتحليل الأخطاء", evaluationText: "اختر مقاييس تناسب المهمة، ثم افحص الفئات اللغوية والحالات الملتبسة التي تنتج الأخطاء.", errorPrompt: "ما الأخطاء التي ينبغي أن يفحصها اللغوي؟", errorText: "التباس الفئات، وحدود النطاق، واختلاف المرمزين، والاعتماد على السياق، وأثر المعالجة المسبقة، وتركز الأخطاء في تنوع لغوي أو فئة محددة.", blueprintTitle: "مخطط بناء المعالجة اللغوية حاسوبيًا", blueprintText: "راجع التصميم المخطط كاملًا قبل التنفيذ. تبقى جميع المخرجات قابلة للتعديل وتحتاج إلى تحقق علمي.", computationalDesignSummary: "ملخص التصميم الحاسوبي", workflow: "مسار العمل", pseudocode: "الشفرة الوصفية", starterCode: "كود Python أولي", packageJson: "المخطط المنظم", downloadJson: "تنزيل المخطط JSON", downloadCsv: "تنزيل قالب الترميز CSV", downloadPython: "تنزيل كود Python", copyPseudocode: "نسخ الشفرة الوصفية", copied: "تم النسخ", notes: "ملاحظات الباحث", notesPlaceholder: "سجل الخيارات النظرية أو الاستبعادات أو الحالات غير المحسومة.",
    ruleTitle: "عرّف قاعدة لغوية عربية", ruleText: "صغ قاعدة صرفية أو نحوية محددة بلغتك. لن يعاملها Builder بوصفها صحيحة في جميع السياقات.", morphology: "الصرف", syntax: "النحو", ruleName: "اسم القاعدة", ruleNamePlaceholder: "مثال: رصد نهاية محتملة لجمع المذكر السالم", ruleDescription: "التعريف اللغوي والنطاق", ruleDescriptionPlaceholder: "حدد ما تشمله القاعدة والسياق المطلوب وما لا تستطيع إثباته.", examplesTitle: "وثّق الأمثلة الموجبة والسالبة", examplesText: "تكشف الأمثلة حدود التغطية، وتمنع تحويل القاعدة إلى شروط أوسع من المقصود.", positive: "أمثلة موجبة", negative: "أمثلة سالبة أو مقابلة", onePerLine: "حالة واحدة في كل سطر", ruleUnitTitle: "اختر وحدة الإدخال", ruleUnitText: "حدد هل تستقبل القاعدة كلمة أو مورفيمًا أو وحدة نصية أو نطاقًا أو جملة، وهل تحتاج إلى السياق المحيط.", conditionsTitle: "حوّل القاعدة إلى شروط", conditionsText: "اكتب شروطًا قابلة للملاحظة بدل تكرار اسم الظاهرة. ويجب أن يتحول كل شرط لاحقًا إلى اختبار برمجي.", conditions: "الشروط القابلة للحوسبة", conditionsPlaceholder: "مثال: تنتهي الوحدة بـ ون\nلا يشير السياق السابق إلى اسم علم\nللصيغة تحليل معجمي موثق", logicTitle: "حدّد منطق القرار", logicText: "استخدم مخرجات صريحة. تمنع REVIEW الخوارزمية من فرض حكم عند نقص الدليل أو السياق.", outputs: "مخرجات القرار", exceptionsTitle: "حافظ على الغموض والاستثناءات", exceptionsText: "سجل الاستثناءات المعجمية والاعتماد على السياق والتنوع الإملائي والحالات المختلف فيها نظريًا.", exceptions: "الاستثناءات ومحفزات المراجعة", exceptionsPlaceholder: "استثناء أو سبب مراجعة في كل سطر", testsTitle: "أنشئ حالات الاختبار", testsText: "حدد النتيجة المتوقعة قبل كتابة التنفيذ. نجاح الاختبار يثبت توافق الكود مع القاعدة المصاغة، ولا يثبت صحة لغوية عامة.", tests: "حالات الاختبار", testsPlaceholder: "المعلمون => MATCH\nهارون => NO_MATCH\nمعلمون دون سياق => REVIEW", pseudoTitle: "راجع الشفرة الوصفية والكود الأولي", pseudoText: "يتضمن الكود الناتج شروط TODO. لا تستبدلها إلا بعد صياغة القاعدة واختبارها بصورة موثقة.", algorithmBlueprint: "مخطط تصميم الخوارزمية اللغوية", algorithmBlueprintText: "يحفظ المخطط القاعدة والشروط والاستثناءات والاختبارات وقرار REVIEW بوصفها قرارات بحثية منفصلة.",
    familyData: "البيانات والتدريب", familyAdvantage: "الميزة", familyLimitation: "القيد", familyFit: "متى يناسب", aiTitle: "مراجعة اختيارية للتصميم الحاسوبي بالذكاء الاصطناعي", aiText: "اطلب من النموذج تحديد الافتراضات والبدائل ومواطن الغموض واختبارات التحقق. ولا يستطيع تعديل مخططك.", generateReview: "إنشاء مراجعة للتصميم", generating: "جارٍ إنشاء المراجعة…", aiError: "تعذر إكمال المراجعة.", assumptions: "افتراضات تحتاج إلى تحقق", alternatives: "بدائل", ambiguities: "مواطن الغموض", nextChecks: "اختبارات تالية", safeguard: "الضابط المنهجي", accept: "قبول المراجعة", modify: "تعديل المراجعة", reject: "رفض المراجعة", finalReview: "قرار الباحث", modifyLabel: "سجل المراجعة القابل للتعديل", decisionRequired: "اختر القبول أو التعديل أو الرفض بعد مراجعة الاقتراح.",
    smartGuide: "المرشد الذكي لبناء الخوارزمية", currentStage: "المرحلة الحالية", whatNow: "ماذا نفعل الآن؟", whyNeeded: "لماذا هذه الخطوة ضرورية؟", researcherDecision: "ما القرار المطلوب من الباحث؟", whatNext: "ماذا سيحدث بعد ذلك؟", simpler: "اشرحها بصورة أبسط", why: "لماذا؟", showExample: "وضّح لي بمثال", impact: "ماذا يترتب على هذا الاختيار؟", detectedIssues: "فحوص التصميم", noIssues: "لم تُكتشف مشكلة حالية في هذه المرحلة. استمر في المراجعة؛ وهذا لا يمثل ضمانًا للصدق العلمي.", source: "المصدر", pending: "قيد المراجعة", accepted: "قبله الباحث", modified: "عدّله الباحث", rejected: "رفضه الباحث", modifySuggestion: "عدّل هذا الاقتراح", requiredFeatures: "السمات اللغوية المطلوبة", featureSources: "مصادر السمات", dependencies: "الاعتمادات", featureHint: "سمة واحدة في كل سطر، مثل: subject_gender", sourceHint: "مصدر مقابل في كل سطر: إدخال يدوي أو قاعدة أو محلل خارجي مسمى", dependencyHint: "واحد في كل سطر: الاسم | implemented أو external أو manual أو placeholder", bridge: "الجسر البرمجي للمبتدئ", sameIdea: "الفكرة نفسها في أربع صور", linguisticRule: "1. القاعدة اللغوية", decisionLogic: "2. منطق القرار", codeExplanation: "اشرح لي هذا الكود", traceability: "مولّد من", placeholder: "عنصر مؤقت", dontKnow: "لا أعرف كيف أحوّل هذه الخطوة إلى كود", infoQuestion: "ما المعلومات التي تحتاجها الخوارزمية لتنفيذ هذه الخطوة؟", gradualPath: "معلومة لغوية ← متغير ← شرط ← شفرة وصفية ← Python", decisionTrace: "كيف اتخذت الخوارزمية هذا القرار؟", incoming: "سياق مشروع وارد", incomingNotice: "لم يُستبدل شيء من تصميمك الحالي. راجع السياق قبل قبوله.", mergeIncoming: "قبول السياق المتاح ودمجه", dismissIncoming: "الاحتفاظ بالتصميم الحالي", transferTitle: "تابع المشروع نفسه", continueCode: "المتابعة إلى أداة بناء الكود", useResearch: "استخدامه في البحث", transferPreview: "ستنقل الآن", confirmTransfer: "تأكيد النقل", cancelTransfer: "إلغاء", ownerMap: "حدود ملكية الوظائف", codeOwner: "تملك أداة بناء الكود تنفيذ البيانات والمسارات والتدريب والكود القابل لإعادة الاستخدام. ويقتصر الكود هنا على التعليم المرتبط بهذا التصميم اللغوي.",
  },
};

const STEP_EXPLANATIONS = {
  en: ["Start from a linguistic definition, not a preferred model.", "One example helps expose the annotation decision without pretending to represent the full dataset.", "The unit controls what one training or rule decision applies to.", "Labels operationalize theory and therefore require definitions, examples, and disagreement rules.", "Representation is the structure stored in rows, spans, sequences, or relations.", "A task states what the system must output; an algorithm states how it may learn or decide.", "Compare method families only after the data and output are defined.", "Metrics summarize performance; error analysis explains which linguistic decisions failed.", "The blueprint records a proposed method. It contains no experimental result."],
  ar: ["ابدأ من تعريف لغوي، لا من نموذج تفضله مسبقًا.", "يكشف المثال الواحد قرار الترميز، لكنه لا يمثل مجموعة البيانات كاملة.", "تحدد الوحدة المجال الذي يطبق عليه قرار التدريب أو القاعدة.", "تحول الفئات النظرية إلى إجراء؛ لذلك تحتاج إلى تعريف وأمثلة وقواعد لحسم الخلاف.", "التمثيل هو البنية التي تحفظ في صفوف أو نطاقات أو متتاليات أو علاقات.", "تحدد المهمة ما يجب أن ينتجه النظام، وتحدد الخوارزمية كيف يمكن أن يتعلم أو يقرر.", "لا تقارن أسر المناهج إلا بعد تحديد البيانات والمخرج.", "تلخص المقاييس الأداء، ويشرح تحليل الأخطاء القرارات اللغوية التي أخفقت.", "يسجل المخطط تصميمًا حاسوبيًا مقترحًا ولا يكتب منهجية الدراسة ولا يتضمن نتيجة تجريبية."],
};

const RULE_EXPLANATIONS = {
  en: ["A computable rule must have a bounded claim and observable evidence.", "Positive and negative examples reveal overgeneralization before coding.", "The input unit and required context must be explicit.", "Each linguistic condition should become one testable predicate.", "Three-way outcomes preserve uncertainty better than forced binary classification.", "Exceptions are part of the algorithm design, not inconvenient cases to hide.", "Tests are written before implementation so the intended behavior remains visible.", "Pseudocode exposes missing logic; starter code keeps unresolved conditions as TODO items.", "The blueprint is a hypothesis about implementation that still requires linguistic validation."],
  ar: ["تحتاج القاعدة القابلة للحوسبة إلى ادعاء محدد ودليل يمكن ملاحظته.", "تكشف الأمثلة الموجبة والسالبة التعميم الزائد قبل كتابة الكود.", "يجب التصريح بوحدة الإدخال والسياق الذي تحتاج إليه القاعدة.", "ينبغي أن يتحول كل شرط لغوي إلى محمول برمجي قابل للاختبار.", "تحفظ المخرجات الثلاثية الغموض بدل فرض تصنيف ثنائي.", "الاستثناءات جزء من تصميم الخوارزمية، وليست حالات ينبغي إخفاؤها.", "تكتب الاختبارات قبل التنفيذ حتى يبقى السلوك المقصود واضحًا.", "تكشف الشفرة الوصفية المنطق الناقص، ويبقي الكود الأولي الشروط غير المحسومة بصيغة TODO.", "المخطط فرضية تنفيذية ما تزال تحتاج إلى تحقق لغوي."],
};

export default function NlpBuilderPage() {
  const { language } = useLanguage();
  const locale = language === "ar" ? "ar" : "en";
  const copy = COPY[locale];
  const [state, setState] = useState(createNlpBuilderState);
  const [hydrated, setHydrated] = useState(false);
  const [message, setMessage] = useState("");
  const [aiStatus, setAiStatus] = useState("idle");
  const [aiProgress, setAiProgress] = useState("");
  const [aiError, setAiError] = useState("");
  const [guideLevel, setGuideLevel] = useState("beginner");
  const [guideDetail, setGuideDetail] = useState(null);
  const [incomingHandoff, setIncomingHandoff] = useState(null);
  const [transferTarget, setTransferTarget] = useState("");
  const [transferError, setTransferError] = useState("");
  const steps = state.mode === "linguistic-algorithm" ? ALGORITHM_STEPS : RESEARCH_STEPS;
  const pack = useMemo(() => buildCurrentPackage(state, locale), [state, locale]);
  const stageGuide = useMemo(() => currentStageGuidance(state, guideLevel, locale), [state, guideLevel, locale]);
  const guideIssues = useMemo(() => detectBuilderIssues(state, pack, locale), [state, pack, locale]);

  useEffect(() => {
    let storage;
    try { storage = window.localStorage; } catch { storage = null; }
    const frame = window.requestAnimationFrame(() => {
      setState(readNlpBuilderState(storage));
      try { setIncomingHandoff(readProjectHandoff("nlp-builder", window.location.search)); } catch { setIncomingHandoff(null); }
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    let storage;
    try { storage = window.localStorage; } catch { storage = null; }
    const timer = window.setTimeout(() => {
      const saved = saveNlpBuilderState(storage, state);
      if (!saved.ok) setMessage(copy.saveError);
    }, 180);
    return () => window.clearTimeout(timer);
  }, [state, hydrated, copy.saveError]);

  function update(patch) {
    setState((current) => ({ ...current, ...patch, aiReview: patch.aiReview === undefined ? null : patch.aiReview, aiDecision: patch.aiDecision === undefined ? "" : patch.aiDecision, aiEditedReview: patch.aiEditedReview === undefined ? "" : patch.aiEditedReview }));
    setMessage(""); setAiError("");
  }

  function chooseMode(mode) {
    setState((current) => ({ ...current, mode, step: 0, maxStep: 0, aiReview: null, aiDecision: "", aiEditedReview: "" }));
    setMessage(""); setAiStatus("idle"); setAiProgress(""); setAiError("");
  }

  function choosePhenomenon(id) {
    setState((current) => changePhenomenon(current, id));
    setMessage("");
  }

  function goNext() {
    if (!validateBuilderStep(state)) { setMessage(copy.required); return; }
    const next = Math.min(8, state.step + 1);
    setState((current) => ({ ...current, step: next, maxStep: Math.max(current.maxStep, next) }));
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openStep(index) {
    if (index > state.maxStep) return;
    setState((current) => ({ ...current, step: index })); setMessage("");
  }

  function reset() {
    if (!window.confirm(copy.resetConfirm)) return;
    const next = createNlpBuilderState();
    setState(next); setMessage(""); setAiStatus("idle"); setAiProgress(""); setAiError("");
  }

  async function requestAiReview() {
    setAiStatus("loading"); setAiProgress(""); setAiError("");
    setState((current) => ({ ...current, aiReview: null, aiDecision: "", aiEditedReview: "" }));
    try {
      const payload = await fetchAiJson("/api/nlp-builder", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uiLanguage: locale, blueprint: pack }) }, setAiProgress);
      setState((current) => ({ ...current, aiReview: payload.review, aiDecision: "", aiEditedReview: JSON.stringify(payload.review, null, 2) }));
      setAiStatus("success"); setAiProgress("");
    } catch (error) {
      setAiProgress((current) => error.partialText || current); setAiError(error.message || copy.aiError); setAiStatus("error");
    }
  }

  function decideAi(decision) {
    setState((current) => ({ ...current, aiDecision: decision, aiEditedReview: decision === "reject" ? "" : current.aiEditedReview || JSON.stringify(current.aiReview, null, 2) }));
  }

  function decideGuide(id, status, modifiedText = "") {
    setState((current) => recordGuideDecision(current, id, status, modifiedText));
  }

  function mergeIncoming() {
    const accepted = acceptProjectHandoff(state, incomingHandoff, "merge");
    if (!accepted.accepted) return;
    setState((current) => applyIncomingToNlpBuilder(current, accepted.state.incomingProjectContext));
    setIncomingHandoff(null);
  }

  function confirmTransfer() {
    try {
      const payload = buildNlpProjectPayload(state, pack, transferTarget);
      window.location.href = createProjectHandoff("nlp-builder", transferTarget, payload, { sourceStateId: `nlp-builder-v${state.version}` });
    } catch (error) { setTransferError(error.message); }
  }

  return <><Head><title>{copy.head}</title><meta name="description" content={copy.lead} /></Head><main className={styles.page} dir={locale === "ar" ? "rtl" : "ltr"}>
    <Link className={styles.back} href="/ar-tools#build-tools">← {copy.back}</Link>
    <header className={styles.hero}><div><p>{copy.eyebrow}</p><h1>{copy.title}</h1><strong>{copy.subtitle}</strong><span>{copy.lead}</span></div><small>{copy.preview}</small></header>
    <p className={styles.notice}>{copy.notice}</p>
    <DataSourceIndicator language={locale} mode="standalone" />
    {incomingHandoff && <IncomingHandoff handoff={incomingHandoffPreview(incomingHandoff)} copy={copy} locale={locale} onAccept={mergeIncoming} onDismiss={() => setIncomingHandoff(null)} />}

    <section className={styles.modeSection} aria-labelledby="builder-mode-title"><h2 id="builder-mode-title">{copy.chooseMode}</h2><div className={styles.modeGrid}>{BUILDER_MODES.map((mode) => <button type="button" key={mode.id} className={state.mode === mode.id ? styles.selectedMode : ""} aria-pressed={state.mode === mode.id} onClick={() => chooseMode(mode.id)}><strong>{mode.name[locale]}</strong><span>{mode.description[locale]}</span></button>)}</div></section>

    <nav className={styles.progress} aria-label={copy.chooseMode}>{steps.map((step, index) => <button type="button" key={step.en} className={index === state.step ? styles.currentStep : index <= state.maxStep ? styles.completedStep : ""} disabled={index > state.maxStep} onClick={() => openStep(index)} aria-current={index === state.step ? "step" : undefined}><span>{index + 1}</span><small>{step[locale]}</small></button>)}</nav>

    <div className={styles.workspace}>
      <section className={styles.stepCard}>{state.mode === "linguistic-algorithm" ? <AlgorithmStep state={state} update={update} copy={copy} locale={locale} pack={pack} /> : <ResearchStep state={state} update={update} choosePhenomenon={choosePhenomenon} copy={copy} locale={locale} pack={pack} />}
        {message && <p className={styles.error} role="alert">{message}</p>}
        <div className={styles.navButtons}><button type="button" onClick={() => openStep(Math.max(0, state.step - 1))} disabled={state.step === 0}>{copy.previous}</button>{state.step < 8 && <button type="button" className={styles.primary} onClick={goNext}>{copy.next}</button>}</div>
      </section>
      <aside className={styles.sidePanel}><SmartGuide state={state} pack={pack} level={guideLevel} setLevel={setGuideLevel} detail={guideDetail} setDetail={setGuideDetail} guide={stageGuide} issues={guideIssues} decide={decideGuide} copy={copy} locale={locale} /><section><h2>{copy.explanation}</h2><p>{(state.mode === "linguistic-algorithm" ? RULE_EXPLANATIONS : STEP_EXPLANATIONS)[locale][state.step]}</p></section><LiveBlueprint state={state} copy={copy} locale={locale} pack={pack} /><button className={styles.reset} type="button" onClick={reset}>{copy.reset}</button><small className={styles.localNote}>{copy.saved}</small></aside>
    </div>

    {state.step === 8 && <section className={styles.aiReview} aria-labelledby="ai-review-title"><div><h2 id="ai-review-title">{copy.aiTitle}</h2><p>{copy.aiText}</p></div><button type="button" className={styles.primary} disabled={aiStatus === "loading"} onClick={requestAiReview}>{aiStatus === "loading" ? copy.generating : copy.generateReview}</button><ProgressiveAiOutput text={aiProgress} language={locale} active={aiStatus === "loading"} label={copy.generating} />{aiError && <p className={styles.error} role="alert">{aiError}</p>}{state.aiReview && <AiReview review={state.aiReview} state={state} setState={setState} decide={decideAi} copy={copy} />}</section>}
    {state.step === 8 && <ProjectContinuation state={state} pack={pack} target={transferTarget} setTarget={setTransferTarget} confirm={confirmTransfer} error={transferError} copy={copy} locale={locale} />}
  </main></>;
}

function ResearchStep({ state, update, choosePhenomenon, copy, locale, pack }) {
  const phenomenon = getPhenomenon(state.phenomenonId);
  const machine = buildMachineRepresentation(state);
  if (state.step === 0) return <Step title={copy.phenomenonTitle} text={copy.phenomenonText}><div className={styles.domainList}>{PHENOMENON_DOMAINS.map((domain) => <section key={domain.id}><h3>{domain.name[locale]}</h3><div className={styles.choiceGrid}>{PHENOMENA.filter((item) => item.domain === domain.id).map((item) => <button type="button" key={item.id} className={state.phenomenonId === item.id ? styles.selectedChoice : ""} aria-pressed={state.phenomenonId === item.id} onClick={() => choosePhenomenon(item.id)}><strong>{item.name[locale]}</strong><span>{item.examples[locale]}</span></button>)}</div></section>)}</div>{state.phenomenonId === "custom" && <Field label={copy.customPhenomenon}><textarea value={state.customPhenomenon} onChange={(event) => update({ customPhenomenon: event.target.value })} placeholder={copy.customPlaceholder} /></Field>}</Step>;
  if (state.step === 1) return <Step title={copy.exampleTitle} text={copy.exampleText}><Field label={copy.exampleLabel}><textarea dir="rtl" lang="ar" value={state.example} onChange={(event) => update({ example: event.target.value })} /></Field></Step>;
  if (state.step === 2) return <Step title={copy.unitTitle} text={copy.unitText}><ChoiceButtons items={UNITS} selected={state.unit} onSelect={(unit) => update({ unit })} locale={locale} /></Step>;
  if (state.step === 3) return <Step title={copy.annotationTitle} text={copy.annotationText}><Field label={copy.labelsLabel} hint={copy.labelsHint}><textarea dir="ltr" value={state.labelsText} onChange={(event) => update({ labelsText: event.target.value })} /></Field></Step>;
  if (state.step === 4) return <Step title={copy.representationTitle} text={copy.representationText}><div className={styles.representation}><ResultBlock title={copy.original}><p dir="rtl" lang="ar">{machine.original}</p></ResultBlock><ResultBlock title={copy.humanView}><ul>{machine.humanInterpretation.map((item) => <li key={item} dir="auto">{item}</li>)}</ul></ResultBlock><ResultBlock title={copy.tokenized}><pre>{JSON.stringify(machine.tokens, null, 2)}</pre></ResultBlock><ResultBlock title={copy.illustrative}><div className={styles.annotationRows}>{machine.tokens.map((token, index) => <span key={`${token}-${index}`}><b dir="rtl">{token}</b><code>{machine.illustrativeLabels[index]}</code></span>)}</div></ResultBlock>{machine.layeredAnnotation && <ResultBlock title={copy.layered}><pre>{JSON.stringify(machine.layeredAnnotation, null, 2)}</pre></ResultBlock>}<ResultBlock title={copy.codeView}><pre>{machine.python}</pre></ResultBlock><ResultBlock title={copy.schema}><div className={styles.tags}>{machine.schema.map((field) => <code key={field}>{field}</code>)}</div></ResultBlock><p className={styles.caution}>{copy.representationCaution}</p></div></Step>;
  if (state.step === 5) return <Step title={copy.taskTitle} text={copy.taskText}><select className={styles.select} value={state.task} onChange={(event) => update({ task: event.target.value })}>{Object.entries(TASKS).map(([id, name]) => <option key={id} value={id}>{name[locale]}</option>)}</select><p className={styles.helper}>{copy.taskRationale}</p></Step>;
  if (state.step === 6) return <Step title={copy.algorithmTitle} text={copy.algorithmText}><div className={styles.choiceGrid}>{phenomenon.algorithms.map((id) => { const item = ALGORITHM_FAMILIES.find((entry) => entry.id === id); const guidance = ALGORITHM_GUIDANCE[id]; return <button type="button" key={id} className={state.algorithmFamily === id ? styles.selectedChoice : ""} aria-pressed={state.algorithmFamily === id} onClick={() => update({ algorithmFamily: id })}><strong>{item.name[locale]}</strong><span>{item.description[locale]}</span><dl className={styles.familyGuide}><div><dt>{copy.familyData}</dt><dd>{guidance.data[locale]}</dd></div><div><dt>{copy.familyAdvantage}</dt><dd>{guidance.advantage[locale]}</dd></div><div><dt>{copy.familyLimitation}</dt><dd>{guidance.limitation[locale]}</dd></div><div><dt>{copy.familyFit}</dt><dd>{guidance.fit[locale]}</dd></div></dl></button>; })}</div></Step>;
  if (state.step === 7) return <Step title={copy.evaluationTitle} text={copy.evaluationText}><div className={styles.checkGrid}>{Object.entries(METRICS).map(([id, name]) => <label key={id}><input type="checkbox" checked={state.metrics.includes(id)} onChange={() => update({ metrics: state.metrics.includes(id) ? state.metrics.filter((item) => item !== id) : [...state.metrics, id] })} />{name[locale]}</label>)}</div><h3>{copy.errorPrompt}</h3><p className={styles.helper}>{copy.errorText}</p></Step>;
  return <FinalPackage pack={pack} state={state} update={update} copy={copy} locale={locale} research />;
}

function AlgorithmStep({ state, update, copy, locale, pack }) {
  if (state.step === 0) return <Step title={copy.ruleTitle} text={copy.ruleText}><div className={styles.twoChoices}><button type="button" className={state.ruleDomain === "morphology" ? styles.selectedChoice : ""} onClick={() => update({ ruleDomain: "morphology" })}>{copy.morphology}</button><button type="button" className={state.ruleDomain === "syntax" ? styles.selectedChoice : ""} onClick={() => update({ ruleDomain: "syntax" })}>{copy.syntax}</button></div><Field label={copy.ruleName}><input value={state.ruleName} onChange={(event) => update({ ruleName: event.target.value })} placeholder={copy.ruleNamePlaceholder} /></Field><Field label={copy.ruleDescription}><textarea value={state.ruleDescription} onChange={(event) => update({ ruleDescription: event.target.value })} placeholder={copy.ruleDescriptionPlaceholder} /></Field></Step>;
  if (state.step === 1) return <Step title={copy.examplesTitle} text={copy.examplesText}><div className={styles.twoColumns}><Field label={copy.positive} hint={copy.onePerLine}><textarea dir="rtl" value={state.positiveExamples} onChange={(event) => update({ positiveExamples: event.target.value })} /></Field><Field label={copy.negative} hint={copy.onePerLine}><textarea dir="rtl" value={state.negativeExamples} onChange={(event) => update({ negativeExamples: event.target.value })} /></Field></div></Step>;
  if (state.step === 2) return <Step title={copy.ruleUnitTitle} text={copy.ruleUnitText}><ChoiceButtons items={UNITS.filter((item) => ["character", "morpheme", "token", "word", "span", "sentence"].includes(item.id))} selected={state.ruleUnit} onSelect={(ruleUnit) => update({ ruleUnit })} locale={locale} /></Step>;
  if (state.step === 3) return <Step title={copy.conditionsTitle} text={copy.conditionsText}><Field label={copy.requiredFeatures} hint={copy.featureHint}><textarea dir="auto" value={state.requiredFeatures} onChange={(event) => update({ requiredFeatures: event.target.value })} /></Field><Field label={copy.featureSources} hint={copy.sourceHint}><textarea dir="auto" value={state.featureSources} onChange={(event) => update({ featureSources: event.target.value })} /></Field><Field label={copy.conditions} hint={copy.onePerLine}><textarea value={state.conditions} onChange={(event) => update({ conditions: event.target.value })} placeholder={copy.conditionsPlaceholder} /></Field><Field label={copy.dependencies} hint={copy.dependencyHint}><textarea dir="ltr" value={state.dependencies} onChange={(event) => update({ dependencies: event.target.value })} /></Field></Step>;
  if (state.step === 4) return <Step title={copy.logicTitle} text={copy.logicText}><Field label={copy.outputs}><input dir="ltr" value={state.decisionOutput} onChange={(event) => update({ decisionOutput: event.target.value })} /></Field><div className={styles.decisionFlow}><span>INPUT</span><b>→</b><span>CONDITIONS</span><b>→</b><span>MATCH / NO_MATCH / REVIEW</span></div></Step>;
  if (state.step === 5) return <Step title={copy.exceptionsTitle} text={copy.exceptionsText}><Field label={copy.exceptions} hint={copy.onePerLine}><textarea value={state.exceptions} onChange={(event) => update({ exceptions: event.target.value })} placeholder={copy.exceptionsPlaceholder} /></Field></Step>;
  if (state.step === 6) return <Step title={copy.testsTitle} text={copy.testsText}><Field label={copy.tests} hint={copy.onePerLine}><textarea dir="auto" value={state.testCases} onChange={(event) => update({ testCases: event.target.value })} placeholder={copy.testsPlaceholder} /></Field>{buildRuleAlgorithmPackage(state, locale).tests.length > 0 && <div className={styles.testList}>{buildRuleAlgorithmPackage(state, locale).tests.map((test, index) => <div key={`${test.input}-${index}`}><span dir="auto">{test.input}</span><code>{test.expected}</code></div>)}</div>}</Step>;
  if (state.step === 7) return <Step title={copy.pseudoTitle} text={copy.pseudoText}><ProgrammingBridge state={state} pack={pack} copy={copy} locale={locale} /><ResultBlock title={copy.pseudocode}><pre>{pack.pseudocode.join("\n")}</pre></ResultBlock><Field label={copy.starterCode} hint={copy.codeOwner}><textarea className={styles.codeEditor} dir="ltr" value={state.pythonDraft || pack.generatedPythonStarter} onChange={(event) => update({ pythonDraft: event.target.value })} /></Field><div className={styles.tags}>{pack.dependencies.map((dependency) => <code key={dependency.name}>{dependency.name}: {dependency.status}</code>)}</div></Step>;
  return <FinalPackage pack={pack} state={state} update={update} copy={copy} locale={locale} />;
}

function FinalPackage({ pack, state, update, copy, locale, research = false }) {
  const [copied, setCopied] = useState(false);
  function download(content, filename, type = "text/plain;charset=utf-8") { const url = URL.createObjectURL(new Blob([content], { type })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; anchor.click(); URL.revokeObjectURL(url); }
  async function copyPseudo() { try { await navigator.clipboard.writeText(pack.pseudocode.join("\n")); setCopied(true); window.setTimeout(() => setCopied(false), 1600); } catch { setCopied(false); } }
  return <Step title={research ? copy.blueprintTitle : copy.algorithmBlueprint} text={research ? copy.blueprintText : copy.algorithmBlueprintText}><div className={styles.packageGrid}><ResultBlock title={copy.computationalDesignSummary}><p>{pack.computationalDesignSummary}</p></ResultBlock><ResultBlock title={copy.workflow}><ol>{(pack.workflow || pack.safeguards).map((item) => <li key={item}>{item}</li>)}</ol></ResultBlock><ResultBlock title={copy.schema}><div className={styles.tags}>{(pack.dataSchema || pack.conditions.map((item) => `${item.id}: ${item.description}`)).map((field) => <code key={field}>{field}</code>)}</div></ResultBlock><ResultBlock title={copy.pseudocode}><pre>{pack.pseudocode.join("\n")}</pre></ResultBlock><ResultBlock title={copy.starterCode}><pre>{pack.pythonStarter}</pre></ResultBlock></div><Field label={copy.notes}><textarea value={research ? state.notes : state.ruleNotes} onChange={(event) => update(research ? { notes: event.target.value } : { ruleNotes: event.target.value })} placeholder={copy.notesPlaceholder} /></Field><div className={styles.downloads}><button type="button" onClick={() => download(serializePackage(pack), "lingualab-nlp-blueprint.json", "application/json;charset=utf-8")}>{copy.downloadJson}</button>{research && <button type="button" onClick={() => download(pack.annotationCsv, "lingualab-annotation-template.csv", "text/csv;charset=utf-8")}>{copy.downloadCsv}</button>}<button type="button" onClick={() => download(pack.pythonStarter, "lingualab-starter.py", "text/x-python;charset=utf-8")}>{copy.downloadPython}</button><button type="button" onClick={copyPseudo}>{copied ? copy.copied : copy.copyPseudocode}</button></div></Step>;
}

function Step({ title, text, children }) { return <><header className={styles.stepHeader}><h2>{title}</h2><p>{text}</p></header>{children}</>; }
function Field({ label, hint, children }) { return <label className={styles.field}><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>; }
function ChoiceButtons({ items, selected, onSelect, locale }) { return <div className={styles.compactChoices}>{items.map((item) => <button type="button" key={item.id} className={selected === item.id ? styles.selectedChoice : ""} aria-pressed={selected === item.id} onClick={() => onSelect(item.id)}>{item.name[locale]}</button>)}</div>; }
function ResultBlock({ title, children }) { return <section className={styles.resultBlock}><h3>{title}</h3>{children}</section>; }

function LiveBlueprint({ state, copy, locale, pack }) {
  const phenomenon = getPhenomenon(state.phenomenonId);
  const rows = state.mode === "linguistic-algorithm"
    ? [[copy.domain, state.ruleDomain === "morphology" ? copy.morphology : copy.syntax], [copy.rule, state.ruleName || copy.incomplete], [copy.unit, UNITS.find((item) => item.id === state.ruleUnit)?.name[locale] || state.ruleUnit], [copy.labels, state.decisionOutput || copy.incomplete], [copy.status, copy.planned]]
    : [[copy.phenomenon, state.phenomenonId === "custom" ? state.customPhenomenon || copy.incomplete : phenomenon.name[locale]], [copy.unit, UNITS.find((item) => item.id === state.unit)?.name[locale] || state.unit], [copy.labels, splitLines(state.labelsText).join(" · ") || copy.incomplete], [copy.task, TASKS[state.task]?.[locale] || state.task], [copy.algorithm, ALGORITHM_FAMILIES.find((item) => item.id === state.algorithmFamily)?.name[locale] || state.algorithmFamily], [copy.evaluation, pack.evaluation?.metrics?.join(" · ") || copy.incomplete], [copy.status, copy.planned]];
  return <section className={styles.liveBlueprint}><h2>{copy.blueprint}</h2><dl>{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><p>{copy.review}</p></section>;
}

function AiReview({ review, state, setState, decide, copy }) {
  return <div className={styles.aiResult}><p>{review.summary}</p><ReviewList title={copy.assumptions} items={review.assumptions} /><ReviewList title={copy.alternatives} items={review.alternatives} /><ReviewList title={copy.ambiguities} items={review.ambiguities} /><ReviewList title={copy.nextChecks} items={review.nextChecks} /><p><strong>{copy.safeguard}:</strong> {review.safeguard}</p><div className={styles.decisions}>{[["accept", copy.accept], ["modify", copy.modify], ["reject", copy.reject]].map(([id, label]) => <button type="button" key={id} aria-pressed={state.aiDecision === id} onClick={() => decide(id)}>{label}</button>)}</div>{state.aiDecision === "modify" && <Field label={copy.modifyLabel}><textarea dir="auto" value={state.aiEditedReview} onChange={(event) => setState((current) => ({ ...current, aiEditedReview: event.target.value }))} /></Field>}{state.aiDecision && <p className={styles.decisionStatus}><strong>{copy.finalReview}:</strong> {state.aiDecision}</p>}{!state.aiDecision && <p className={styles.helper}>{copy.decisionRequired}</p>}</div>;
}
function ReviewList({ title, items }) { return <section><h3>{title}</h3><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></section>; }

function SmartGuide({ state, pack, level, setLevel, detail, setDetail, guide, issues, decide, copy, locale }) {
  const example = state.mode === "linguistic-algorithm" ? splitLines(state.positiveExamples)[0] || state.ruleDescription || copy.incomplete : state.example;
  const snapshot = buildGuideContext(state, pack);
  return <section className={styles.smartGuide}><h2>{copy.smartGuide}</h2><div className={styles.guideLevels}>{GUIDE_LEVELS.map((item) => <button type="button" key={item.id} aria-pressed={level === item.id} onClick={() => { setLevel(item.id); setDetail(null); }}>{item.name[locale]}</button>)}</div><p className={styles.stageName}>{copy.currentStage}: {guide.stage}</p><dl className={styles.contextSnapshot}><div><dt>{copy.domain}</dt><dd>{snapshot.domain}</dd></div><div><dt>{copy.unit}</dt><dd>{snapshot.unitOfAnalysis}</dd></div><div><dt>{copy.labels}</dt><dd>{snapshot.labels.join(" · ") || copy.incomplete}</dd></div><div><dt>{copy.status}</dt><dd>{snapshot.validationStatus}</dd></div></dl><dl className={styles.stageGuide}><div><dt>{copy.whatNow}</dt><dd>{guide.now}</dd></div><div><dt>{copy.whyNeeded}</dt><dd>{guide.why}</dd></div><div><dt>{copy.researcherDecision}</dt><dd>{guide.decision}</dd></div><div><dt>{copy.whatNext}</dt><dd>{guide.next}</dd></div></dl><div className={styles.guideActions}><button type="button" onClick={() => setDetail({ label: copy.simpler, text: guide.levelNote })}>{copy.simpler}</button><button type="button" onClick={() => setDetail({ label: copy.why, text: guide.why })}>{copy.why}</button><button type="button" onClick={() => setDetail({ label: copy.showExample, text: `${example} — ${locale === "ar" ? "مثال توضيحي يحتاج إلى مراجعة، وليس بيانات بحثية معيارية." : "Illustrative and reviewable; not research-grade annotated data."}` })}>{copy.showExample}</button><button type="button" onClick={() => setDetail({ label: copy.impact, text: `${guide.decision} ${guide.next}` })}>{copy.impact}</button></div>{detail && <div className={styles.guideDetail}><strong>{detail.label}</strong><p dir="auto">{detail.text}</p></div>}<h3>{copy.detectedIssues}</h3>{issues.length ? <div className={styles.issueList}>{issues.map((issue) => <GuideIssue key={issue.id} issue={issue} decide={decide} setDetail={setDetail} copy={copy} />)}</div> : <p>{copy.noIssues}</p>}</section>;
}

function GuideIssue({ issue, decide, setDetail, copy }) {
  const [editing, setEditing] = useState(false);
  const [edited, setEdited] = useState(issue.provenance.modifiedText || issue.title);
  const statusText = issue.provenance.status === "accepted" ? copy.accepted : issue.provenance.status === "modified" ? copy.modified : issue.provenance.status === "rejected" ? copy.rejected : copy.pending;
  return <article className={styles.guideIssue}><strong>{issue.title}</strong><p>{issue.reason}</p><small>{copy.source}: Smart Guide suggestion · {statusText}</small><div className={styles.guideActions}><button type="button" onClick={() => setDetail({ label: copy.simpler, text: issue.simpler })}>{copy.simpler}</button><button type="button" onClick={() => setDetail({ label: copy.why, text: issue.reason })}>{copy.why}</button><button type="button" onClick={() => setDetail({ label: copy.showExample, text: issue.example })}>{copy.showExample}</button><button type="button" onClick={() => setDetail({ label: copy.impact, text: issue.impact })}>{copy.impact}</button></div><div className={styles.decisions}><button type="button" onClick={() => decide(issue.id, "accepted")}>{copy.accept}</button><button type="button" onClick={() => setEditing((value) => !value)}>{copy.modify}</button><button type="button" onClick={() => decide(issue.id, "rejected")}>{copy.reject}</button></div>{editing && <Field label={copy.modifySuggestion}><textarea value={edited} onChange={(event) => setEdited(event.target.value)} /><button type="button" onClick={() => { decide(issue.id, "modified", edited); setEditing(false); }}>{copy.modify}</button></Field>}</article>;
}

function ProgrammingBridge({ state, pack, copy, locale }) {
  const bridge = buildProgrammingBridge(state, pack, locale);
  const [selectedExplanation, setSelectedExplanation] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const blocks = [[copy.linguisticRule, bridge.linguisticRule, false], [copy.decisionLogic, bridge.decisionLogic, true], [`3. ${copy.pseudocode}`, bridge.pseudocode, true], [`4. Python`, bridge.python, true]];
  return <section className={styles.programmingBridge}><h3>{copy.bridge}</h3><p>{bridge.sameIdea}</p><div className={styles.bridgeGrid}>{blocks.map(([title, content, code]) => <article key={title}><strong>{title}</strong>{code ? <pre>{content}</pre> : <p>{content}</p>}</article>)}</div><details><summary>{copy.codeExplanation}</summary><select value={selectedExplanation} onChange={(event) => setSelectedExplanation(Number(event.target.value))}>{bridge.explanation.map((item, index) => <option key={item} value={index}>{item.split("=")[0]}</option>)}</select><p>{bridge.explanation[selectedExplanation]}</p></details><button type="button" className={styles.bridgeHelp} onClick={() => setShowHelp((value) => !value)}>{copy.dontKnow}</button>{showHelp && <div className={styles.guideDetail}><strong>{copy.infoQuestion}</strong><p>{copy.gradualPath}</p><p dir="auto">{state.requiredFeatures || state.ruleDescription || copy.incomplete}</p></div>}<details><summary>{copy.decisionTrace}</summary><ol>{bridge.decisionTrace.map((item) => <li key={item}>{item}</li>)}</ol></details>{bridge.trace && <p className={styles.trace}><strong>{copy.traceability}:</strong> {bridge.trace.ruleId} → {bridge.trace.logicBlock} → {bridge.trace.codeBlock} · {copy.placeholder}</p>}</section>;
}

function IncomingHandoff({ handoff, copy, locale, onAccept, onDismiss }) {
  return <section className={styles.incoming}><h2>{copy.incoming}</h2><p>{copy.incomingNotice}</p><small>{TOOL_OWNERS[handoff.source]?.name[locale]} → {TOOL_OWNERS[handoff.target]?.name[locale]} · {new Date(handoff.createdAt).toLocaleString(locale === "ar" ? "ar-SA" : "en")}</small><HandoffFields payload={handoff.payload} /><div className={styles.downloads}><button type="button" onClick={onAccept}>{copy.mergeIncoming}</button><button type="button" onClick={onDismiss}>{copy.dismissIncoming}</button></div></section>;
}

function ProjectContinuation({ state, pack, target, setTarget, confirm, error, copy, locale }) {
  const payload = target ? buildNlpProjectPayload(state, pack, target) : null;
  return <section className={styles.continuation}><h2>{copy.transferTitle}</h2><p>{copy.codeOwner}</p><div className={styles.ownerGrid}>{Object.entries(TOOL_OWNERS).map(([id, owner]) => <article key={id}><strong>{owner.name[locale]}</strong><p>{owner.description[locale]}</p></article>)}</div><div className={styles.downloads}><button type="button" onClick={() => setTarget("code")}>{copy.continueCode}</button><button type="button" onClick={() => setTarget("research")}>{copy.useResearch}</button></div>{payload && <div className={styles.transferPreview}><h3>{copy.transferPreview}: {TOOL_OWNERS[target].name[locale]}</h3><HandoffFields payload={payload} /><div className={styles.downloads}><button type="button" onClick={confirm}>{copy.confirmTransfer}</button><button type="button" onClick={() => setTarget("")}>{copy.cancelTransfer}</button></div></div>}{error && <p className={styles.error}>{error}</p>}</section>;
}

function HandoffFields({ payload }) {
  return <dl className={styles.handoffFields}>{Object.entries(payload || {}).filter(([, value]) => value && (!Array.isArray(value) || value.length)).slice(0, 12).map(([key, value]) => <div key={key}><dt>{key}</dt><dd dir="auto">{Array.isArray(value) ? value.join(" · ") : String(value).slice(0, 900)}</dd></div>)}</dl>;
}

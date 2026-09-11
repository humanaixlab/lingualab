import { PATH_GUIDANCE, PROJECT_TOOL_ROUTES } from "./project-catalog.js";

const bi = (en, ar) => ({ en, ar });
const guide = (id, title, what, why, prepare, inside, inspect, warnings, next) => ({
  id, title: bi(...title), what: bi(...what), why: bi(...why), prepare: bi(...prepare), inside: bi(...inside), inspect: bi(...inspect), warnings: bi(...warnings), next: bi(...next),
});

// Media metadata is deliberately separate from project records. Approved assets can be
// attached later without changing recommendation or routing logic.
export const GUIDE_MEDIA = Object.freeze({
  data: { preferredOwner: "LinguaLab", linguaLabVideo: null, approvedEmbed: null, externalReference: null, fallback: "text-visual" },
  annotation: { preferredOwner: "LinguaLab", linguaLabVideo: null, approvedEmbed: null, externalReference: null, fallback: "text-visual" },
  corpus: { preferredOwner: "LinguaLab", linguaLabVideo: null, approvedEmbed: null, externalReference: null, fallback: "text-visual" },
  classification: { preferredOwner: "LinguaLab", linguaLabVideo: null, approvedEmbed: null, externalReference: null, fallback: "text-visual" },
  extraction: { preferredOwner: "LinguaLab", linguaLabVideo: null, approvedEmbed: null, externalReference: null, fallback: "text-visual" },
  experiments: { preferredOwner: "LinguaLab", linguaLabVideo: null, approvedEmbed: null, externalReference: null, fallback: "text-visual" },
  interpretation: { preferredOwner: "LinguaLab", linguaLabVideo: null, approvedEmbed: null, externalReference: null, fallback: "text-visual" },
  implementation: { preferredOwner: "LinguaLab", linguaLabVideo: null, approvedEmbed: null, externalReference: null, fallback: "text-visual" },
});

export const RESEARCH_GUIDES = Object.freeze({
  data: guide("data", ["Prepare linguistic data", "تجهيز البيانات اللغوية"], ["Organize rows, text fields, labels, and metadata before analysis.", "تنظيم الصفوف وحقول النص والفئات والبيانات الوصفية قبل التحليل."], ["Clear inputs make later results traceable and errors diagnosable.", "وضوح المدخلات يجعل النتائج قابلة للتتبع والأخطاء قابلة للتشخيص."], ["Document data rights, columns, missing values, duplicates, and Arabic coverage.", "وثق حقوق البيانات والأعمدة والقيم المفقودة والتكرار وتغطية العربية."], ["Workspace and Spreadsheet Explorer support inspection and preparation.", "تدعم مساحة العمل ومستكشف الجداول الفحص والتجهيز."], ["Decide the text unit, reference column, and whether normalization or tokenization is actually required.", "حدد وحدة النص وعمود المرجع، وما إذا كانت المعايرة أو التجزئة مطلوبة فعلًا."], ["Do not delete variation or overwrite labels without a documented rule.", "لا تحذف التنوع أو تستبدل الفئات دون قاعدة موثقة."], ["Open the recommended analysis tool with a documented dataset.", "افتح أداة التحليل الموصى بها ببيانات موثقة."]),
  annotation: guide("annotation", ["Create a human reference", "بناء مرجع بشري"], ["Define labels and independently annotate comparable cases.", "تعريف الفئات وترميز حالات قابلة للمقارنة بصورة مستقلة."], ["A human reference enables defensible evaluation of system output.", "يتيح المرجع البشري تقييم مخرجات النظام بصورة قابلة للدفاع."], ["Prepare an annotation guide, examples, boundary rules, and at least two coders when feasible.", "جهز دليل ترميز وأمثلة وقواعد للحالات الحدية ومرمزين على الأقل متى أمكن."], ["LinguaLab can show AI suggestions for review; annotation management remains external.", "يعرض LinguaLab مقترحات AI للمراجعة، بينما تبقى إدارة الترميز خطوة خارجية."], ["Inspect disagreement, agreement, adjudication decisions, and reference quality.", "افحص الخلاف والاتفاق وقرارات التحكيم وجودة المرجع."], ["Do not let annotators copy AI suggestions without independent judgment.", "لا تجعل المرمزين ينسخون مقترحات AI دون حكم مستقل."], ["Finalize the reference, then compare it with system results.", "اعتمد المرجع ثم قارنه بنتائج النظام."]),
  corpus: guide("corpus", ["Build a specialized corpus", "بناء مدونة متخصصة"], ["Define a bounded collection with documented sampling and metadata.", "تعريف مجموعة محددة بعينة وبيانات وصفية موثقة."], ["Corpus boundaries determine what frequency and context patterns mean.", "تحدد حدود المدونة معنى أنماط التكرار والسياق."], ["Prepare inclusion/exclusion criteria, sources, permissions, and metadata fields.", "جهز معايير الإدراج والاستبعاد والمصادر والتصاريح وحقول البيانات الوصفية."], ["Corpus Research checks readiness; Frequency, Contexts, and N-grams compute patterns.", "يفحص إنشاء المدونة الجاهزية، وتحسب أدوات التكرار والسياقات والمتتاليات الأنماط."], ["Inspect coverage, duplicates, missing metadata, normalization choices, and contextual examples.", "افحص التغطية والتكرار والبيانات المفقودة وخيارات المعايرة والأمثلة السياقية."], ["Frequency is not importance, and incomparable corpora should not be contrasted directly.", "التكرار لا يساوي الأهمية، ولا تقارن مدونات غير متكافئة مباشرة."], ["Run deterministic corpus tools, then interpret their measured results.", "شغل أدوات المدونات الحتمية ثم فسر نتائجها المقاسة."]),
  classification: guide("classification", ["Evaluate text classification", "تقييم تصنيف النصوص"], ["Learn a mapping from labeled texts and compare predictions with a held-out human reference.", "تعلم إسناد النصوص المصنفة ومقارنة التنبؤات بمرجع بشري محجوز."], ["A baseline reveals whether a more complex method adds value.", "يكشف خط الأساس ما إذا كانت الطريقة الأعقد تضيف قيمة."], ["Prepare stable labels, text/reference columns, and a train/test separation.", "جهز فئات مستقرة وعمودي النص والمرجع وفصل التدريب عن الاختبار."], ["The classification preview runs the deterministic Naive Bayes baseline separately from AI-supported classification.", "يشغل التصنيف خط أساس Naive Bayes الحتمي منفصلًا عن التصنيف المساند بالذكاء الاصطناعي."], ["Inspect label balance, accuracy, confusion matrix, predictions, and mismatches.", "افحص توازن الفئات والدقة ومصفوفة الالتباس والتنبؤات والاختلافات."], ["Never tune on test labels or let AI replace the human reference.", "لا تضبط النموذج على فئات الاختبار ولا تجعل AI يستبدل المرجع البشري."], ["Classify errors and revise data or configuration before re-running.", "صنف الأخطاء وراجع البيانات أو الإعداد قبل إعادة التشغيل."]),
  extraction: guide("extraction", ["Define an extraction schema", "تعريف مخطط الاستخراج"], ["Specify which entities, relations, or terms count as results.", "حدد الكيانات أو العلاقات أو المصطلحات التي تعد نتائج."], ["A narrow schema makes span-level review and evaluation possible.", "يتيح المخطط الضيق مراجعة النطاقات وتقييمها."], ["Prepare definitions, positive/negative examples, and optional reference annotations.", "جهز تعريفات وأمثلة موجبة وسالبة وترميزات مرجعية اختيارية."], ["Information Extraction returns structured source spans for researcher review.", "يعيد استخراج المعلومات نطاقات مصدرية منظمة لمراجعة الباحث."], ["Inspect exact spans, category errors, false positives, and false negatives.", "افحص النطاقات الدقيقة وأخطاء الفئات والإيجابيات والسلبيات الكاذبة."], ["Do not infer external facts or accept a plausible phrase absent from the source.", "لا تستنتج حقائق خارجية ولا تقبل عبارة معقولة غائبة عن المصدر."], ["Review cases and evaluate against a complete reference when available.", "راجع الحالات وقيّمها مقابل مرجع مكتمل عند توفره."]),
  experiments: guide("experiments", ["Run a controlled NLP experiment", "تنفيذ تجربة NLP مضبوطة"], ["Hold task and input constant while changing one instruction or output condition.", "ثبت المهمة والمدخل وغيّر تعليمة واحدة أو شرط مخرج واحد."], ["Control makes output differences interpretable.", "يجعل الضبط فروق المخرجات قابلة للتفسير."], ["Prepare fixed cases, two variants, an output schema, and a researcher rubric.", "جهز حالات ثابتة وصيغتين ومخطط مخرجات ومحكّمات للباحث."], ["NLP Experiments records both outputs unchanged and supports researcher evaluation.", "يحفظ مختبر NLP المخرجين دون تغيير ويدعم تقييم الباحث."], ["Inspect consistency, evidence, category differences, and failure cases.", "افحص الاتساق والأدلة وفروق الفئات وحالات الفشل."], ["A preferred output does not prove that one model or prompt is universally superior.", "لا يثبت تفضيل مخرج تفوق نموذج أو تعليمة بصورة عامة."], ["Document errors, revise one condition, and re-run the fixed cases.", "وثق الأخطاء وراجع شرطًا واحدًا وأعد تشغيل الحالات الثابتة."]),
  interpretation: guide("interpretation", ["Interpret computational results", "تفسير النتائج الحاسوبية"], ["Connect measured output to the research question without changing the evidence.", "اربط المخرج المقاس بسؤال البحث دون تغيير الدليل."], ["Interpretation separates defensible findings from plausible speculation.", "يفصل التفسير النتائج القابلة للدفاع عن الافتراض المعقول."], ["Prepare actual metrics, structured outputs, errors, and limitations.", "جهز المقاييس الفعلية والمخرجات المنظمة والأخطاء والقيود."], ["LinguaLab can support interpretation and reporting after results exist.", "يدعم LinguaLab التفسير والتقرير بعد وجود نتائج."], ["Inspect which claims are measured, AI-supported, or researcher conclusions.", "افحص ما هو مقاس أو مدعوم بالذكاء الاصطناعي أو استنتاج للباحث."], ["Do not promote AI interpretation to measured evidence.", "لا ترفع تفسير AI إلى مرتبة الدليل المقاس."], ["Approve bounded conclusions, then continue to reporting and writing.", "اعتمد استنتاجات منضبطة ثم انتقل إلى التقرير والكتابة."]),
  implementation: guide("implementation", ["Turn a finding into a prototype", "تحويل النتيجة إلى نموذج أولي"], ["Translate a reviewed research workflow into explicit inputs, processing, and outputs.", "حوّل مسارًا بحثيًا مراجعًا إلى مدخلات ومعالجة ومخرجات صريحة."], ["A prototype tests usefulness and failure modes; it is not production software.", "يختبر النموذج الأولي المنفعة وحالات الفشل، وليس برنامجًا إنتاجيًا."], ["Prepare accepted requirements, test cases, expected outputs, and safeguards.", "جهز متطلبات معتمدة وحالات اختبار ومخرجات متوقعة وضوابط."], ["Code Generator can provide starter direction and Colab can support larger custom experiments.", "يوفر مساعد البرمجة اتجاهًا أوليًا، ويدعم Colab التجارب المخصصة الأكبر."], ["Inspect generated code, dependencies, data rights, errors, and reproducibility.", "افحص الكود المولد والاعتماديات وحقوق البيانات والأخطاء وقابلية إعادة الإنتاج."], ["Starter/example code requires review and testing; never expose credentials or assume production readiness.", "يتطلب الكود الابتدائي/المثال مراجعة واختبارًا؛ ولا تعرض بيانات دخول أو تفترض جاهزية إنتاجية."], ["Test with documented cases, evaluate failures, and improve one component at a time.", "اختبر بحالات موثقة وقيّم حالات الفشل وحسن مكونًا واحدًا كل مرة."]),
});

const prototype = (projectId, solution, users, inputs, outputs, method, logic) => ({ projectId, solution: bi(...solution), users: bi(...users), inputs: bi(...inputs), outputs: bi(...outputs), method: bi(...method), logic: bi(...logic) });

export const PROTOTYPE_PROFILES = Object.freeze({
  "arabic-stance-reference": prototype("arabic-stance-reference", ["A review-first stance annotation assistant.", "مساعد لترميز الموقف يبدأ بالمراجعة."], ["Discourse researchers and trained annotators.", "باحثو الخطاب والمرمزون المدربون."], ["Arabic passage, stance target, and approved label guide.", "مقطع عربي وموضوع الموقف ودليل فئات معتمد."], ["Suggested label and exact evidence, followed by a human final decision.", "فئة مقترحة ودليل دقيق يليهما قرار بشري نهائي."], ["AI-supported closed-label inference with human reference evaluation.", "استدلال مساند بالذكاء الاصطناعي ضمن فئات مغلقة وتقييم بمرجع بشري."], ["Validate input → request suggestion → review evidence → accept/edit/reject → compare with reference.", "تحقق من المدخل → اطلب المقترح → راجع الدليل → اقبل/عدّل/ارفض → قارن بالمرجع."]),
  "arabic-terminology": prototype("arabic-terminology", ["An expert-reviewed terminology discovery aid.", "أداة لاكتشاف المصطلحات بمراجعة خبير."], ["Domain researchers, terminologists, and technical writers.", "باحثو التخصص والمصطلحيون والكتاب التقنيون."], ["Rights-cleared domain texts and explicit terminology criteria.", "نصوص تخصصية مصرح بها ومعايير صريحة للمصطلحات."], ["Source-grounded candidate terms with review status.", "مصطلحات مرشحة مرتبطة بالمصدر مع حالة المراجعة."], ["AI-supported keyphrase extraction constrained to source spans.", "استخراج عبارات مساند بالذكاء الاصطناعي ومقيد بنطاقات المصدر."], ["Prepare schema → extract candidates → validate spans → expert review → evaluate errors.", "جهز المخطط → استخرج المرشحات → تحقق من النطاقات → راجع خبيرًا → قيّم الأخطاء."]),
  "arabic-review-classification": prototype("arabic-review-classification", ["A transparent domain classification demonstrator.", "عارض شفاف للتصنيف التخصصي."], ["Researchers testing labeled Arabic collections.", "باحثون يختبرون مجموعات عربية مصنفة."], ["Labeled reviews, stable categories, and held-out test cases.", "مراجعات مصنفة وفئات مستقرة وحالات اختبار محجوزة."], ["Predictions, measured baseline metrics, error cases, and reviewed AI suggestions.", "تنبؤات ومقاييس خط أساس وحالات أخطاء ومقترحات AI مراجعة."], ["Deterministic Naive Bayes baseline kept separate from AI-supported classification.", "خط أساس Naive Bayes حتمي منفصل عن التصنيف المساند بالذكاء الاصطناعي."], ["Inspect labels → split data → train baseline → predict → evaluate → analyze errors.", "افحص الفئات → اقسم البيانات → درب خط الأساس → تنبأ → قيّم → حلل الأخطاء."]),
  "specialized-corpus": prototype("specialized-corpus", ["A bounded corpus browsing and analysis prototype.", "نموذج لتصفح مدونة محددة وتحليلها."], ["Domain researchers and corpus curators.", "باحثو التخصص وقيمو المدونات."], ["Rights-cleared texts, metadata, and documented corpus boundaries.", "نصوص مصرح بها وبيانات وصفية وحدود مدونة موثقة."], ["Corpus inventory plus deterministic frequency, context, and sequence views.", "جرد للمدونة مع عروض حتمية للتكرار والسياق والمتتاليات."], ["Deterministic corpus calculations with a separate AI interpretation layer.", "حسابات مدونات حتمية مع طبقة منفصلة لتفسير AI."], ["Ingest → inspect metadata → deduplicate → compute patterns → review contexts → interpret.", "أدخل → افحص البيانات الوصفية → أزل التكرار → احسب الأنماط → راجع السياقات → فسر."]),
  "semantic-grouping": prototype("semantic-grouping", ["A researcher-reviewed thematic browser.", "متصفح موضوعي بمراجعة الباحث."], ["Researchers exploring small comparable text collections.", "باحثون يستكشفون مجموعات صغيرة من النصوص المتقاربة."], ["Short Arabic texts and a documented grouping purpose.", "نصوص عربية قصيرة وهدف موثق للتجميع."], ["Proposed groups, assigned texts, rationales, and final human decisions.", "مجموعات مقترحة ونصوص مسندة ومسوغات وقرارات بشرية نهائية."], ["AI-supported semantic grouping, not measured clustering.", "تجميع دلالي مساند بالذكاء الاصطناعي، وليس عنقدة مقاسة."], ["Define purpose → submit texts → review groups → edit assignments → record ambiguity.", "حدد الهدف → أدخل النصوص → راجع المجموعات → عدل الإسناد → سجل الغموض."]),
  "prompt-sensitivity": prototype("prompt-sensitivity", ["A controlled prompt comparison workbench.", "منضدة لمقارنة التعليمات بصورة مضبوطة."], ["Researchers evaluating instruction sensitivity in Arabic NLP tasks.", "باحثون يقيمون حساسية التعليمات في مهام NLP العربية."], ["Fixed input cases, fixed task, two instruction variants, and a rubric.", "حالات إدخال ثابتة ومهمة ثابتة وصيغتا تعليمات ومحكّمات."], ["Two preserved outputs, researcher preference, reasons, and error record.", "مخرجان محفوظان وتفضيل الباحث وأسبابه وسجل الأخطاء."], ["AI-supported experiment runs evaluated by the researcher.", "تشغيلات تجريبية مساندة بالذكاء الاصطناعي يقيمها الباحث."], ["Fix task → run A/B → compare evidence and consistency → record judgment → revise one variable.", "ثبت المهمة → شغل أ/ب → قارن الأدلة والاتساق → سجل الحكم → راجع متغيرًا واحدًا."]),
  "policy-relations": prototype("policy-relations", ["A source-grounded document relation explorer.", "مستكشف لعلاقات الوثائق مرتبط بالمصدر."], ["Policy and discourse researchers reviewing document collections.", "باحثو السياسات والخطاب الذين يراجعون مجموعات وثائقية."], ["Rights-cleared documents and a narrow entity/relation schema.", "وثائق مصرح بها ومخطط ضيق للكيانات والعلاقات."], ["Entities, textual relations, exact support spans, and review decisions.", "كيانات وعلاقات نصية ونطاقات دعم دقيقة وقرارات مراجعة."], ["AI-supported extraction constrained to text evidence.", "استخراج مساند بالذكاء الاصطناعي ومقيد بالدليل النصي."], ["Define schema → extract spans → review relations → compare reference → classify errors.", "حدد المخطط → استخرج النطاقات → راجع العلاقات → قارن المرجع → صنف الأخطاء."]),
});

const PATH_GUIDES = {
  "corpus-linguistics": ["data", "corpus", "interpretation"],
  "morphology-syntax": ["data", "annotation", "interpretation"],
  semantics: ["data", "annotation", "interpretation"],
  "discourse-pragmatics": ["data", "annotation", "interpretation"],
  "text-classification": ["data", "classification", "interpretation"],
  "information-extraction": ["data", "extraction", "interpretation"],
  "nlp-experiments": ["data", "experiments", "interpretation"],
};

export function getProjectGuides(project) {
  const ids = [...PATH_GUIDES[project.path]];
  if (project.annotatorsRequired && !ids.includes("annotation")) ids.splice(1, 0, "annotation");
  if (PROTOTYPE_PROFILES[project.id]) ids.push("implementation");
  return [...new Set(ids)].map((id) => ({ ...RESEARCH_GUIDES[id], media: GUIDE_MEDIA[id] }));
}

export function getPrototypeProfile(projectId) { return PROTOTYPE_PROFILES[projectId] || null; }

export function buildPrototypeRoadmap(project) {
  const profile = getPrototypeProfile(project.id);
  if (!profile) return [];
  const primaryTool = project.tools.find((tool) => PROJECT_TOOL_ROUTES[tool]);
  const toolRoute = PROJECT_TOOL_ROUTES[primaryTool];
  return [
    { stage: "problem", label: project.problem, href: null },
    { stage: "solution", label: profile.solution, href: null },
    { stage: "inputs", label: profile.inputs, href: "/workspace" },
    { stage: "outputs", label: profile.outputs, href: null },
    { stage: "data", label: project.dataRequirements, href: "/workspace" },
    { stage: "method", label: profile.method, href: toolRoute },
    { stage: "logic", label: profile.logic, href: toolRoute },
    { stage: "test", label: bi("Test with documented cases", "اختبر بحالات موثقة"), href: toolRoute },
    { stage: "evaluate", label: project.evaluation, href: toolRoute },
    { stage: "improve", label: bi("Review one component, then re-run", "راجع مكونًا واحدًا ثم أعد التشغيل"), href: "/tools/code" },
  ];
}

export function getPrototypeLinks(project) {
  const primaryTool = project.tools.find((tool) => PROJECT_TOOL_ROUTES[tool]);
  return [
    { id: "data", label: bi("Data / Workspace", "البيانات / مساحة العمل"), href: "/workspace" },
    { id: "tool", label: bi("Research tool", "الأداة البحثية"), href: PROJECT_TOOL_ROUTES[primaryTool] },
    { id: "code", label: bi("Code Generator", "مساعد البرمجة"), href: "/tools/code" },
    { id: "colab", label: bi("Google Colab", "Google Colab"), href: "/tools/colab" },
    { id: "report", label: bi("Research Report", "التقرير البحثي"), href: "/research-report" },
    { id: "writing", label: bi("Writing Support", "دعم الكتابة"), href: "/tools/prompt" },
  ];
}

export function getPrototypePromptContext(project) {
  const profile = getPrototypeProfile(project.id);
  if (!profile) return null;
  return { projectId: project.id, path: PATH_GUIDANCE[project.path].name, problem: project.problem, solution: profile.solution, users: profile.users, inputs: profile.inputs, outputs: profile.outputs, method: profile.method, logic: profile.logic };
}

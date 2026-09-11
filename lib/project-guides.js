import { PATH_GUIDANCE, PROJECT_TOOL_ROUTES } from "./project-catalog.js";
import { SOCIAL_PROTOTYPE_PROFILES } from "./social-impact-projects.js";

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
  "dialect-identification": prototype("dialect-identification", ["A review-first Arabic dialect classifier.", "مصنف للهجات العربية يبدأ بالمراجعة."], ["Dialect researchers and trained annotators.", "باحثو اللهجات والمرمزون المدربون."], ["Balanced labeled texts, dialect definitions, and held-out cases.", "نصوص مصنفة متوازنة وتعريفات للهجات وحالات اختبار محجوزة."], ["Baseline predictions, confusion evidence, and human-reviewed final labels.", "تنبؤات خط أساس وأدلة التباس وفئات نهائية مراجعة بشريًا."], ["Deterministic Naive Bayes baseline separated from AI-supported review.", "خط أساس Naive Bayes حتمي منفصل عن المراجعة المساندة بالذكاء الاصطناعي."], ["Inspect labels → split data → run baseline → review predictions → analyze dialect confusion.", "افحص الفئات → اقسم البيانات → شغل خط الأساس → راجع التنبؤات → حلل الالتباس اللهجي."]),
  "dialect-corpus": prototype("dialect-corpus", ["A documented dialect corpus browser.", "متصفح لمدونة لهجية موثقة."], ["Dialect researchers and corpus curators.", "باحثو اللهجات وقيمو المدونات."], ["Rights-cleared dialect texts and region/source metadata.", "نصوص لهجية مصرح بها وبيانات المنطقة/المصدر."], ["Corpus inventory and deterministic pattern views.", "جرد للمدونة وعروض حتمية للأنماط."], ["Deterministic corpus analyses with separate researcher-reviewed interpretation.", "تحليلات مدونات حتمية مع تفسير منفصل يراجعه الباحث."], ["Collect externally → inspect metadata → deduplicate → compute patterns → review contexts.", "اجمع خارجيًا → افحص البيانات الوصفية → أزل التكرار → احسب الأنماط → راجع السياقات."]),
  "arabic-spelling-variation": prototype("arabic-spelling-variation", ["A reviewed Arabic normalization assistant.", "مساعد مراجع لمعايرة الكتابة العربية."], ["Corpus researchers, editors, and data curators.", "باحثو المدونات والمحررون وقيمو البيانات."], ["Original forms, context, normalization policy, and human reference.", "الصيغ الأصلية والسياق وسياسة المعايرة والمرجع البشري."], ["Suggested normalized form, retained original, review decision, and error type.", "صيغة معيارية مقترحة مع الأصل وقرار المراجعة ونوع الخطأ."], ["Controlled AI-supported suggestions evaluated against a human reference.", "مقترحات مضبوطة مساندة بالذكاء الاصطناعي تقيم مقابل مرجع بشري."], ["Define policy → preserve original → suggest form → review → compare reference → revise rule.", "حدد السياسة → احفظ الأصل → اقترح الصيغة → راجع → قارن المرجع → راجع القاعدة."]),
  "arabic-asr-evaluation": prototype("arabic-asr-evaluation", ["A transcript error-review aid built around external ASR output.", "أداة لمراجعة أخطاء التفريغ مبنية على مخرج ASR خارجي."], ["Arabic speech researchers and transcript annotators.", "باحثو الكلام العربي ومرمزو التفريغ."], ["External ASR transcript, human reference transcript, and recording conditions.", "تفريغ ASR خارجي وتفريغ مرجعي بشري وظروف التسجيل."], ["Aligned error cases, human decisions, and an error taxonomy.", "حالات أخطاء محاذاة وقرارات بشرية وتصنيف أخطاء."], ["External speech recognition followed by LinguaLab-supported data inspection and qualitative error analysis.", "تعرف خارجي على الكلام يليه فحص للبيانات وتحليل نوعي للأخطاء داخل LinguaLab."], ["Run ASR externally → align transcripts externally → inspect records → classify errors → interpret conditions.", "شغل ASR خارجيًا → حاذ التفريغات خارجيًا → افحص السجلات → صنف الأخطاء → فسر الظروف."]),
  "arabic-code-switching": prototype("arabic-code-switching", ["A reviewed code-switching exploration aid.", "أداة مراجعة لاستكشاف التناوب اللغوي."], ["Sociolinguists and corpus researchers.", "باحثو اللغة الاجتماعية والمدونات."], ["Mixed Arabic–English texts, boundary guide, and source metadata.", "نصوص عربية–إنجليزية مختلطة ودليل حدود وبيانات مصدرية."], ["Reviewed switching points and contextual pattern evidence.", "نقاط تناوب مراجعة وأدلة أنماط سياقية."], ["Deterministic corpus patterns combined with independent human annotation.", "أنماط مدونات حتمية مقترنة بترميز بشري مستقل."], ["Define units → annotate boundaries → compute patterns → inspect contexts → analyze disagreements.", "حدد الوحدات → رمز الحدود → احسب الأنماط → افحص السياقات → حلل الخلافات."]),
  "lexical-ambiguity": prototype("lexical-ambiguity", ["A contextual Arabic sense browser.", "متصفح سياقي للمعاني العربية."], ["Semantic researchers and trained reviewers.", "باحثو الدلالة والمراجعون المدربون."], ["Selected words, contextual occurrences, and a documented sense guide.", "كلمات مختارة وشواهد سياقية ودليل موثق للمعاني."], ["Proposed sense groups, exact contexts, disagreements, and final human decisions.", "مجموعات معانٍ مقترحة وسياقات دقيقة وخلافات وقرارات بشرية نهائية."], ["AI-supported semantic grouping evaluated by independent human judgment.", "تجميع دلالي مساند بالذكاء الاصطناعي يقيم بأحكام بشرية مستقلة."], ["Select word → collect contexts → propose groups → review independently → adjudicate ambiguity.", "اختر الكلمة → اجمع السياقات → اقترح المجموعات → راجع مستقلًا → حكّم الغموض."]),
  "arabic-stance-reference": prototype("arabic-stance-reference", ["A review-first stance annotation assistant.", "مساعد لترميز الموقف يبدأ بالمراجعة."], ["Discourse researchers and trained annotators.", "باحثو الخطاب والمرمزون المدربون."], ["Arabic passage, stance target, and approved label guide.", "مقطع عربي وموضوع الموقف ودليل فئات معتمد."], ["Suggested label and exact evidence, followed by a human final decision.", "فئة مقترحة ودليل دقيق يليهما قرار بشري نهائي."], ["AI-supported closed-label inference with human reference evaluation.", "استدلال مساند بالذكاء الاصطناعي ضمن فئات مغلقة وتقييم بمرجع بشري."], ["Validate input → request suggestion → review evidence → accept/edit/reject → compare with reference.", "تحقق من المدخل → اطلب المقترح → راجع الدليل → اقبل/عدّل/ارفض → قارن بالمرجع."]),
  "arabic-terminology": prototype("arabic-terminology", ["An expert-reviewed terminology discovery aid.", "أداة لاكتشاف المصطلحات بمراجعة خبير."], ["Domain researchers, terminologists, and technical writers.", "باحثو التخصص والمصطلحيون والكتاب التقنيون."], ["Rights-cleared domain texts and explicit terminology criteria.", "نصوص تخصصية مصرح بها ومعايير صريحة للمصطلحات."], ["Source-grounded candidate terms with review status.", "مصطلحات مرشحة مرتبطة بالمصدر مع حالة المراجعة."], ["AI-supported keyphrase extraction constrained to source spans.", "استخراج عبارات مساند بالذكاء الاصطناعي ومقيد بنطاقات المصدر."], ["Prepare schema → extract candidates → validate spans → expert review → evaluate errors.", "جهز المخطط → استخرج المرشحات → تحقق من النطاقات → راجع خبيرًا → قيّم الأخطاء."]),
  "arabic-review-classification": prototype("arabic-review-classification", ["A transparent domain classification demonstrator.", "عارض شفاف للتصنيف التخصصي."], ["Researchers testing labeled Arabic collections.", "باحثون يختبرون مجموعات عربية مصنفة."], ["Labeled reviews, stable categories, and held-out test cases.", "مراجعات مصنفة وفئات مستقرة وحالات اختبار محجوزة."], ["Predictions, measured baseline metrics, error cases, and reviewed AI suggestions.", "تنبؤات ومقاييس خط أساس وحالات أخطاء ومقترحات AI مراجعة."], ["Deterministic Naive Bayes baseline kept separate from AI-supported classification.", "خط أساس Naive Bayes حتمي منفصل عن التصنيف المساند بالذكاء الاصطناعي."], ["Inspect labels → split data → train baseline → predict → evaluate → analyze errors.", "افحص الفئات → اقسم البيانات → درب خط الأساس → تنبأ → قيّم → حلل الأخطاء."]),
  "specialized-corpus": prototype("specialized-corpus", ["A bounded corpus browsing and analysis prototype.", "نموذج لتصفح مدونة محددة وتحليلها."], ["Domain researchers and corpus curators.", "باحثو التخصص وقيمو المدونات."], ["Rights-cleared texts, metadata, and documented corpus boundaries.", "نصوص مصرح بها وبيانات وصفية وحدود مدونة موثقة."], ["Corpus inventory plus deterministic frequency, context, and sequence views.", "جرد للمدونة مع عروض حتمية للتكرار والسياق والمتتاليات."], ["Deterministic corpus calculations with a separate AI interpretation layer.", "حسابات مدونات حتمية مع طبقة منفصلة لتفسير AI."], ["Ingest → inspect metadata → deduplicate → compute patterns → review contexts → interpret.", "أدخل → افحص البيانات الوصفية → أزل التكرار → احسب الأنماط → راجع السياقات → فسر."]),
  "semantic-grouping": prototype("semantic-grouping", ["A researcher-reviewed thematic browser.", "متصفح موضوعي بمراجعة الباحث."], ["Researchers exploring small comparable text collections.", "باحثون يستكشفون مجموعات صغيرة من النصوص المتقاربة."], ["Short Arabic texts and a documented grouping purpose.", "نصوص عربية قصيرة وهدف موثق للتجميع."], ["Proposed groups, assigned texts, rationales, and final human decisions.", "مجموعات مقترحة ونصوص مسندة ومسوغات وقرارات بشرية نهائية."], ["AI-supported semantic grouping, not measured clustering.", "تجميع دلالي مساند بالذكاء الاصطناعي، وليس عنقدة مقاسة."], ["Define purpose → submit texts → review groups → edit assignments → record ambiguity.", "حدد الهدف → أدخل النصوص → راجع المجموعات → عدل الإسناد → سجل الغموض."]),
  "prompt-sensitivity": prototype("prompt-sensitivity", ["A controlled prompt comparison workbench.", "منضدة لمقارنة التعليمات بصورة مضبوطة."], ["Researchers evaluating instruction sensitivity in Arabic NLP tasks.", "باحثون يقيمون حساسية التعليمات في مهام NLP العربية."], ["Fixed input cases, fixed task, two instruction variants, and a rubric.", "حالات إدخال ثابتة ومهمة ثابتة وصيغتا تعليمات ومحكّمات."], ["Two preserved outputs, researcher preference, reasons, and error record.", "مخرجان محفوظان وتفضيل الباحث وأسبابه وسجل الأخطاء."], ["AI-supported experiment runs evaluated by the researcher.", "تشغيلات تجريبية مساندة بالذكاء الاصطناعي يقيمها الباحث."], ["Fix task → run A/B → compare evidence and consistency → record judgment → revise one variable.", "ثبت المهمة → شغل أ/ب → قارن الأدلة والاتساق → سجل الحكم → راجع متغيرًا واحدًا."]),
  "speech-act-reference": prototype("speech-act-reference", ["A review-first pragmatic annotation assistant.", "مساعد للترميز التداولي يبدأ بالمراجعة."], ["Pragmatics researchers and trained annotators.", "باحثو التداولية والمرمزون المدربون."], ["Contextual Arabic utterances, an annotation guide, and approved categories.", "تلفظات عربية سياقية ودليل ترميز وفئات معتمدة."], ["Suggested speech-act labels with source evidence and final human decisions.", "فئات أفعال كلامية مقترحة مع دليل مصدري وقرارات بشرية نهائية."], ["AI-supported closed-category analysis evaluated against an adjudicated human reference.", "تحليل مساند بالذكاء الاصطناعي ضمن فئات مغلقة وتقييم بمرجع بشري محكّم."], ["Prepare guide → annotate independently → request suggestion → review evidence → adjudicate → evaluate.", "جهز الدليل → رمز مستقلًا → اطلب المقترح → راجع الدليل → حكّم الخلاف → قيّم."]),
  "policy-relations": prototype("policy-relations", ["A source-grounded document relation explorer.", "مستكشف لعلاقات الوثائق مرتبط بالمصدر."], ["Policy and discourse researchers reviewing document collections.", "باحثو السياسات والخطاب الذين يراجعون مجموعات وثائقية."], ["Rights-cleared documents and a narrow entity/relation schema.", "وثائق مصرح بها ومخطط ضيق للكيانات والعلاقات."], ["Entities, textual relations, exact support spans, and review decisions.", "كيانات وعلاقات نصية ونطاقات دعم دقيقة وقرارات مراجعة."], ["AI-supported extraction constrained to text evidence.", "استخراج مساند بالذكاء الاصطناعي ومقيد بالدليل النصي."], ["Define schema → extract spans → review relations → compare reference → classify errors.", "حدد المخطط → استخرج النطاقات → راجع العلاقات → قارن المرجع → صنف الأخطاء."]),
  ...SOCIAL_PROTOTYPE_PROFILES,
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
  const social = project.socialImpact;
  return { projectId: project.id, idea: project.title, problem: project.problem, impact: project.impact, path: PATH_GUIDANCE[project.path].name, tools: bi(project.tools.join(", "), project.tools.join("، ")), requiredData: project.dataRequirements, expectedOutputs: project.expectedResults, evaluation: project.evaluation, applicationPotential: project.applicationPotential, solution: profile.solution, users: profile.users, inputs: profile.inputs, outputs: profile.outputs, method: profile.method, logic: profile.logic, ...(social ? { socialProblem: project.problem, affectedUsers: social.affectedUsers, languageProblem: social.languageProblem, nlpTask: bi(social.nlpTasks.join(", "), social.nlpTasks.join("، ")), annotationSchema: social.annotationSchema, expectedSocialImpact: social.expectedSocialImpact, risksAndLimitations: social.risksAndLimitations } : {}) };
}

export const PROTOTYPE_HANDOFF_FIELDS = Object.freeze([
  { id: "idea", label: bi("Project idea", "فكرة المشروع") },
  { id: "problem", label: bi("Research problem", "المشكلة البحثية") },
  { id: "impact", label: bi("Expected impact", "الأثر المتوقع") },
  { id: "path", label: bi("Research path", "المسار البحثي") },
  { id: "tools", label: bi("LinguaLab tools", "أدوات LinguaLab") },
  { id: "requiredData", label: bi("Required data", "البيانات المطلوبة") },
  { id: "expectedOutputs", label: bi("Expected outputs", "المخرجات المتوقعة") },
  { id: "evaluation", label: bi("Evaluation approach", "منهج التقييم") },
  { id: "applicationPotential", label: bi("Application potential", "إمكانات التطبيق") },
]);

export const SOCIAL_PROTOTYPE_HANDOFF_FIELDS = Object.freeze([
  { id: "socialProblem", label: bi("Social problem", "المشكلة المجتمعية") },
  { id: "affectedUsers", label: bi("Affected users", "الفئات المتأثرة") },
  { id: "languageProblem", label: bi("Language problem", "المشكلة اللغوية") },
  { id: "nlpTask", label: bi("NLP task", "مهمة NLP") },
  { id: "annotationSchema", label: bi("Annotation schema", "مخطط الترميز") },
  { id: "expectedSocialImpact", label: bi("Expected social impact", "الأثر المجتمعي المتوقع") },
  { id: "risksAndLimitations", label: bi("Risks and limitations", "المخاطر والحدود") },
]);

export function getPrototypeHandoffFields(project) {
  return project.socialImpact ? [...PROTOTYPE_HANDOFF_FIELDS, ...SOCIAL_PROTOTYPE_HANDOFF_FIELDS] : PROTOTYPE_HANDOFF_FIELDS;
}

export function buildPrototypeHandoff(project, language = "en", edits = {}) {
  const source = getPrototypePromptContext(project);
  if (!source) return null;
  const fields = getPrototypeHandoffFields(project);
  const inherited = Object.fromEntries(fields.map(({ id }) => [id, source[id]?.[language] || ""]));
  const researcherEdits = Object.fromEntries(fields.map(({ id }) => [id, typeof edits[id] === "string" ? edits[id] : ""]));
  const reviewed = Object.fromEntries(fields.map(({ id }) => [id, researcherEdits[id].trim() || inherited[id].trim()]));
  const missing = fields.filter(({ id }) => !reviewed[id]).map(({ id }) => id);
  return { projectId: project.id, inherited, researcherEdits, reviewed, missing };
}

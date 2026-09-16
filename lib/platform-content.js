import { ACTIVE_TOOLS } from "./platform-inventory.js";

const bilingual = (en, ar) => Object.freeze({ en, ar });

export const PLATFORM_SECTIONS = Object.freeze([
  { id: "about", href: "/platform/about", title: bilingual("About LinguaLab", "عن LinguaLab"), description: bilingual("A concise overview of the platform, its audience, and its scope.", "نظرة موجزة إلى المنصة وجمهورها ونطاقها.") },
  { id: "documentation", href: "/documentation", title: bilingual("Documentation", "التوثيق"), description: bilingual("A consistent guide to the purpose, inputs, outputs, and limits of every tool.", "دليل موحّد لغرض كل أداة ومدخلاتها ومخرجاتها وحدودها.") },
  { id: "references", href: "/platform/references", title: bilingual("References", "المراجع"), description: bilingual("Browse the approved scientific references already used across LinguaLab research paths.", "تصفّح المراجع العلمية المعتمدة والمستخدمة في مسارات LinguaLab البحثية.") },
  { id: "trust", href: "/platform/trust", title: bilingual("Trust", "الثقة"), description: bilingual("Understand AI transparency, scientific responsibility, and capability boundaries.", "تعرّف إلى شفافية الذكاء الاصطناعي والمسؤولية العلمية وحدود الإمكانات.") },
  { id: "support", href: "/platform/support", title: bilingual("Support", "الدعم"), description: bilingual("Find the right channel for product, scientific, dataset, or reference feedback.", "حدّد قناة الملاحظات المناسبة للمنتج أو البحث أو البيانات أو المراجع.") },
  { id: "release-notes", href: "/platform/release-notes", title: bilingual("Release Notes", "ملاحظات الإصدار"), description: bilingual("Review the scope and readiness of the first LinguaLab release.", "راجع نطاق الإصدار الأول من LinguaLab وجاهزيته.") },
]);

export const ABOUT_CARDS = Object.freeze([
  { id: "purpose", title: bilingual("Purpose", "الغاية"), text: bilingual("LinguaLab is a digital research environment for Arabic language and computational linguistics.", "LinguaLab بيئة بحثية رقمية للغة العربية واللسانيات الحاسوبية.") },
  { id: "audience", title: bilingual("Who it serves", "لمن صُممت"), text: bilingual("It supports researchers and learners who need guided access to linguistic and computational workflows.", "تدعم الباحثين والمتعلمين الذين يحتاجون إلى وصول موجّه للمسارات اللغوية والحاسوبية.") },
  { id: "approach", title: bilingual("Research approach", "النهج البحثي"), text: bilingual("Computational outputs, AI-supported interpretation, and researcher review remain visibly distinct.", "تبقى المخرجات الحاسوبية والتفسير المدعوم بالذكاء الاصطناعي ومراجعة الباحث عناصر متميزة بوضوح.") },
  { id: "scope", title: bilingual("Platform scope", "نطاق المنصة"), text: bilingual("The platform inventory records the tools, research areas, project types, and included demo data.", "يوثّق جرد المنصة الأدوات والمجالات البحثية وأنواع المشاريع وبيانات العرض المضمّنة.") },
]);

export const SUPPORT_CARDS = Object.freeze([
  { id: "bug", title: bilingual("Report Bug", "الإبلاغ عن خلل"), text: bilingual("Describe the page, action, expected result, and what happened instead.", "اذكر الصفحة والإجراء والنتيجة المتوقعة وما حدث بدلًا منها.") },
  { id: "scientific", title: bilingual("Scientific Feedback", "ملاحظات علمية"), text: bilingual("Share a methodological or interpretive concern about an existing workflow.", "شارك ملاحظة منهجية أو تفسيرية حول مسار عمل قائم.") },
  { id: "feature", title: bilingual("Feature Request", "طلب ميزة"), text: bilingual("Document a clearly defined need for future product consideration.", "وثّق حاجة محددة بوضوح للنظر فيها مستقبلًا.") },
  { id: "dataset", title: bilingual("Dataset Issue", "مشكلة في البيانات"), text: bilingual("Report a problem with an included sample file, schema, or data description.", "أبلغ عن مشكلة في ملف عينة مضمّن أو مخطط بيانات أو وصف للبيانات.") },
  { id: "reference", title: bilingual("Reference Suggestion", "اقتراح مرجع"), text: bilingual("Provide complete bibliographic details and the research path the source supports.", "قدّم البيانات الببليوغرافية الكاملة والمسار البحثي الذي يدعمه المصدر.") },
  { id: "contact", title: bilingual("Contact", "التواصل"), text: bilingual("Use your institution’s established LinguaLab contact channel for general enquiries.", "استخدم قناة التواصل المعتمدة في مؤسستك للاستفسارات العامة عن LinguaLab.") },
]);

export const TRUST_CARDS = Object.freeze([
  { id: "ai-transparency", title: bilingual("AI Transparency", "شفافية الذكاء الاصطناعي"), text: bilingual("AI-supported content is identified so it is not confused with deterministic computation or researcher judgment.", "يُعرَّف المحتوى المدعوم بالذكاء الاصطناعي حتى لا يختلط بالحساب الحتمي أو حكم الباحث.") },
  { id: "scientific-responsibility", title: bilingual("Scientific Responsibility", "المسؤولية العلمية"), text: bilingual("Researchers remain responsible for validating evidence, interpretation, and claims.", "يبقى الباحث مسؤولًا عن التحقق من الأدلة والتفسير والادعاءات.") },
  { id: "capability-boundaries", title: bilingual("Capability Boundaries", "حدود الإمكانات"), text: bilingual("Each tool keeps its stated role; guidance and handoffs do not transfer ownership of the final decision.", "تحتفظ كل أداة بدورها المعلن، ولا ينقل الإرشاد أو التسليم مسؤولية القرار النهائي.") },
  { id: "citation-policy", title: bilingual("Citation Policy", "سياسة الاستشهاد"), text: bilingual("Platform references are displayed with their available bibliographic details and research-path context.", "تُعرض مراجع المنصة ببياناتها الببليوغرافية المتاحة وسياق مسارها البحثي.") },
  { id: "known-limitations", title: bilingual("Known Limitations", "القيود المعروفة"), text: bilingual("Outputs depend on data quality, task fit, method assumptions, and careful human review.", "تعتمد المخرجات على جودة البيانات وملاءمة المهمة وافتراضات المنهج والمراجعة البشرية الدقيقة.") },
]);

export const RELEASE_CARDS = Object.freeze([
  { id: "release-scope", title: bilingual("First release scope", "نطاق الإصدار الأول"), text: bilingual("A connected Arabic-language research environment with linguistic, computational, learning, and reporting pathways.", "بيئة مترابطة للبحث في العربية تضم مسارات لغوية وحاسوبية وتعليمية ومسارات لإعداد التقارير.") },
  { id: "organization", title: bilingual("Platform organization", "تنظيم المنصة"), text: bilingual("Platform information, documentation, references, trust, and support are now grouped in one center.", "جُمعت معلومات المنصة والتوثيق والمراجع والثقة والدعم في مركز واحد.") },
  { id: "documentation", title: bilingual("Documentation access", "الوصول إلى التوثيق"), text: bilingual("Every tool has a direct route to documentation using one shared structure.", "لكل أداة مسار مباشر إلى التوثيق ضمن بنية موحّدة.") },
]);

const TOOL_PURPOSES = Object.freeze({
  analysis: bilingual("Analyze Arabic text and support careful interpretation of the resulting evidence.", "تحليل النص العربي ودعم التفسير المتأني للأدلة الناتجة."),
  frequency: bilingual("Count recurring words and inspect their distribution in the submitted text.", "حساب الكلمات المتكررة وفحص توزيعها في النص المقدّم."),
  concordance: bilingual("Inspect a search term in the contexts where it occurs.", "فحص مصطلح البحث في السياقات التي يرد فيها."),
  ngrams: bilingual("Identify recurring multi-word sequences in the submitted text.", "تحديد المتتاليات متعددة الكلمات المتكررة في النص المقدّم."),
  pos: bilingual("Explore part-of-speech categories in Arabic text.", "استكشاف فئات أقسام الكلام في النص العربي."),
  "corpus-research": bilingual("Prepare and inspect a corpus through its existing guided research workflow.", "إعداد مدونة لغوية وفحصها عبر مسارها البحثي الموجّه القائم."),
  "morphology-syntax": bilingual("Support morphological and syntactic investigation of Arabic text.", "دعم البحث الصرفي والنحوي في النص العربي."),
  semantics: bilingual("Support semantic investigation through the analyses available in the tool.", "دعم البحث الدلالي عبر التحليلات المتاحة في الأداة."),
  "discourse-analysis": bilingual("Support researcher-reviewed discourse analysis and coding.", "دعم تحليل الخطاب وترميزه تحت مراجعة الباحث."),
  pragmatics: bilingual("Support researcher-reviewed pragmatic analysis of Arabic language use.", "دعم التحليل التداولي لاستعمال العربية تحت مراجعة الباحث."),
  "text-classification": bilingual("Guide a text-classification research experiment and its evaluation.", "توجيه تجربة بحثية لتصنيف النصوص وتقييمها."),
  "information-extraction": bilingual("Guide an information-extraction research workflow over text data.", "توجيه مسار بحثي لاستخراج المعلومات من البيانات النصية."),
  "nlp-experiments": bilingual("Configure and review a guided NLP experiment.", "إعداد تجربة موجّهة في معالجة اللغة الطبيعية ومراجعتها."),
  "nlp-builder": bilingual("Build a researcher-controlled NLP pipeline with explicit review decisions.", "بناء خط معالجة لغوية يتحكم فيه الباحث عبر قرارات مراجعة صريحة."),
  spreadsheet: bilingual("Inspect structured spreadsheet data in the existing guided workspace.", "فحص بيانات الجداول المنظمة في مساحة العمل الموجّهة القائمة."),
  code: bilingual("Generate and review task-focused analysis code with Code Builder.", "إنشاء شفرة تحليل مرتبطة بالمهمة ومراجعتها عبر أداة بناء الكود."),
  colab: bilingual("Continue selected work in a Google Colab notebook handoff.", "متابعة العمل المحدد عبر تسليم إلى دفتر Google Colab."),
  prompt: bilingual("Develop clearer structured instructions for a defined research task.", "تطوير تعليمات أوضح ومنظمة لمهمة بحثية محددة."),
});

const inputFor = (id) => {
  if (["frequency", "concordance", "ngrams", "pos", "morphology-syntax", "semantics", "discourse-analysis", "pragmatics", "analysis"].includes(id)) {
    return bilingual("Arabic text and the options requested by the tool.", "نص عربي والخيارات التي تطلبها الأداة.");
  }
  if (["text-classification", "information-extraction", "nlp-experiments", "nlp-builder", "spreadsheet", "corpus-research"].includes(id)) {
    return bilingual("Research data plus the task settings requested in the guided workflow.", "بيانات البحث وإعدادات المهمة المطلوبة في المسار الموجّه.");
  }
  return bilingual("The research task and the information requested on the tool page.", "المهمة البحثية والمعلومات المطلوبة في صفحة الأداة.");
};

const outputFor = (id) => {
  if (["frequency", "concordance", "ngrams", "pos"].includes(id)) {
    return bilingual("A structured descriptive result for review and further research use.", "نتيجة وصفية منظمة للمراجعة والاستخدام البحثي اللاحق.");
  }
  if (id === "colab") return bilingual("A structured handoff for continuing the selected work in Colab.", "تسليم منظم لمتابعة العمل المحدد في Colab.");
  if (id === "code") return bilingual("Task-focused starter code and its visible review context.", "شفرة بداية مرتبطة بالمهمة وسياق مراجعتها الظاهر.");
  if (id === "prompt") return bilingual("A structured prompt for the defined task.", "تعليمات منظمة للمهمة المحددة.");
  return bilingual("The tool’s existing structured result, guidance, or experiment review.", "النتيجة المنظمة أو الإرشاد أو مراجعة التجربة المتاحة حاليًا في الأداة.");
};

const workflowFor = (id) => {
  if (id === "prompt") return bilingual(
    "Define the task → provide the requested context → generate the prompt → review and edit it → copy or continue through the visible handoff.",
    "حدّد المهمة ← أضف السياق المطلوب ← أنشئ التعليمات ← راجعها وعدّلها ← انسخها أو تابع عبر التسليم الظاهر."
  );
  if (id === "code") return bilingual(
    "Define the implementation task → review any incoming context → generate starter code → inspect and test it → continue through an explicit handoff when needed.",
    "حدّد مهمة التنفيذ ← راجع أي سياق وارد ← أنشئ شفرة البداية ← افحصها واختبرها ← تابع عبر تسليم صريح عند الحاجة."
  );
  return bilingual(
    "Provide the required input → review the detected or selected settings → run the existing workflow → inspect the result and limitations → use the visible next or return action.",
    "قدّم المدخلات المطلوبة ← راجع الإعدادات المكتشفة أو المحددة ← شغّل المسار القائم ← افحص النتيجة والقيود ← استخدم إجراء المتابعة أو العودة الظاهر."
  );
};

const commonErrorsFor = (id) => bilingual(
  id === "colab"
    ? "Missing notebook context, unavailable dependencies, or unreviewed code copied into a new session."
    : "Missing required input, incompatible task settings, stale transferred context, or using an unreviewed result as a final claim.",
  id === "colab"
    ? "غياب سياق الدفتر، أو عدم توفر الاعتماديات، أو نسخ شفرة غير مراجعة إلى جلسة جديدة."
    : "نقص المدخلات المطلوبة، أو عدم توافق إعدادات المهمة، أو تقادم السياق المنقول، أو استخدام نتيجة غير مراجعة بوصفها ادعاءً نهائيًا."
);

export const TOOL_DOCUMENTATION = Object.freeze(ACTIVE_TOOLS.map((tool) => Object.freeze({
  ...tool,
  documentationRoute: `/documentation/${tool.id}`,
  purpose: TOOL_PURPOSES[tool.id],
  input: inputFor(tool.id),
  output: outputFor(tool.id),
  workflow: workflowFor(tool.id),
  commonErrors: commonErrorsFor(tool.id),
  responsibility: bilingual("Review the source data, settings, and result before using it in a research claim or downstream step.", "راجع البيانات المصدرية والإعدادات والنتيجة قبل استخدامها في ادعاء بحثي أو خطوة لاحقة."),
  limitations: bilingual("The tool does not replace methodological judgment, source verification, or domain review.", "لا تستبدل الأداة الحكم المنهجي أو التحقق من المصدر أو المراجعة التخصصية."),
  references: bilingual("Use the approved scientific references associated with the relevant LinguaLab research path, and verify the original source before citation.", "استخدم المراجع العلمية المعتمدة والمرتبطة بمسار LinguaLab البحثي ذي الصلة، وتحقق من المصدر الأصلي قبل الاستشهاد."),
})));

export function documentationForRoute(route) {
  return TOOL_DOCUMENTATION.find((tool) => tool.route === route) || null;
}

export function documentationForId(id) {
  return TOOL_DOCUMENTATION.find((tool) => tool.id === id) || null;
}

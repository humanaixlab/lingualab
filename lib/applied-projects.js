import { SOCIAL_IMPACT_BY_ID } from "./social-impact-projects.js";

const bi = (en, ar) => ({ en, ar });

export const APPLIED_SECTORS = Object.freeze([
  ["culture-heritage", "Culture & Heritage", "الثقافة والتراث"],
  ["health-information", "Health Information", "المعلومات الصحية"],
  ["sustainability-environment", "Sustainability & Environment", "الاستدامة والبيئة"],
  ["tourism-events", "Tourism & Events", "السياحة والفعاليات"],
  ["recreation-hobbies", "Recreation & Hobbies", "الترفيه والهوايات"],
  ["education-universities", "Education & Universities", "التعليم والجامعات"],
  ["public-services", "Public Services", "الخدمات العامة"],
  ["transport-logistics", "Transport & Logistics", "النقل والخدمات اللوجستية"],
  ["media-content", "Media & Content", "الإعلام والمحتوى"],
  ["local-community", "Local Services & Community", "الخدمات المحلية والمجتمعية"],
].map(([id, titleEn, titleAr]) => ({ id, titleEn, titleAr })));

const fromSocial = (projectId, sector, need, possibleApplication, legalOrLicensingNotes) => {
  const project = SOCIAL_IMPACT_BY_ID[projectId];
  return {
    id: `applied-${projectId}`,
    projectId,
    titleAr: project.titleAr,
    titleEn: project.titleEn,
    sector,
    needAr: need[1],
    needEn: need[0],
    languageProblem: project.languageProblem,
    whyItMatters: project.whyItMatters,
    nlpTasks: project.nlpTasks,
    suitablePaths: project.suitablePaths,
    suitableTools: project.suitableTools,
    relatedArabicChallenges: project.challengeIds,
    dataNeeds: project.dataNeeds,
    annotationNeeds: project.annotationSchema,
    humanReferenceNeeds: project.humanReferenceNeeds,
    externalSteps: project.externalSteps,
    evaluationApproaches: project.evaluationApproaches,
    errorAnalysisFocus: project.errorAnalysisFocus,
    prototypeIdea: project.prototypeIdea,
    possibleApplication: bi(...possibleApplication),
    expectedPracticalValue: project.expectedSocialImpact,
    privacyConsiderations: project.privacyConsiderations,
    legalOrLicensingNotes: bi(...legalOrLicensingNotes),
    limitations: project.risksAndLimitations,
    complexity: project.complexity,
    individualOrTeam: project.individualOrTeam,
    needsAnnotators: project.needsAnnotators,
    tags: [...project.tags, sector, "applied-project"],
    reusedFromSocialImpact: true,
  };
};

const newAppliedProject = (id, title, path, tools, data, problem, impact, evaluation, challenges, tags) => ({
  id,
  title: bi(...title),
  problem: bi(...problem),
  impact: bi(...impact),
  path,
  tools,
  dataRequirements: bi(...data),
  teamType: "team",
  annotatorsRequired: true,
  annotationNotes: bi("Develop a narrow guide and independently review entities, terms, topics, or uncertainty labels.", "طوّر دليلًا ضيقًا وراجع بصورة مستقلة الكيانات أو المصطلحات أو الموضوعات أو فئات عدم اليقين."),
  complexity: "intermediate",
  steps: bi(["Define the applied need", "Secure data rights", "Define schema", "Run the tool", "Review evidence", "Evaluate errors"], ["حدد الاحتياج التطبيقي", "تحقق من حقوق البيانات", "عرّف المخطط", "شغّل الأداة", "راجع الأدلة", "قيّم الأخطاء"]),
  expectedResults: bi(...impact),
  evaluation: bi(...evaluation),
  possibleOutputs: ["paper", "dataset", "prototype"],
  applicationPotential: bi("A review-first research prototype, not a production or partner-commissioned system.", "نموذج بحثي يبدأ بالمراجعة، وليس نظامًا إنتاجيًا أو مكلفًا من شريك."),
  tags: [...tags, "applied-project", "team", "annotation"],
  challengeIds: challenges,
  externalSteps: [],
});

export const APPLIED_NEW_PROJECTS = Object.freeze([
  newAppliedProject("heritage-description-assistant", ["Heritage Description Assistant", "مساعد وصف المواد التراثية"], "information-extraction", ["Information Extraction"], ["Public, researcher-provided, licensed, or synthetic heritage descriptions; no authority data is assumed.", "أوصاف تراثية عامة أو مقدمة من الباحث أو مرخصة أو اصطناعية؛ ولا يُفترض الوصول إلى بيانات جهة تراثية."], ["Heritage descriptions may contain inconsistent terminology, implicit entities, and uncertain readings.", "قد تتضمن الأوصاف التراثية مصطلحات غير متسقة وكيانات ضمنية وقراءات غير يقينية."], ["A reviewed description dataset with traceable terms, entities, relations, and uncertainty notes.", "مجموعة أوصاف مراجعة ذات مصطلحات وكيانات وعلاقات وملاحظات عدم يقين قابلة للتتبع."], ["Expert span review; precision/recall only with a complete human reference; qualitative uncertainty-error analysis.", "مراجعة خبير للنطاقات؛ والدقة والاسترجاع فقط مع مرجع بشري مكتمل؛ وتحليل نوعي لأخطاء عدم اليقين."], ["orthography", "morphology", "corpus-data"], ["culture-heritage", "extraction", "terminology", "evaluation"]),
  newAppliedProject("media-stance-topic-analysis", ["Media Stance and Topic Analysis", "تحليل الموقف والموضوع في المحتوى الإعلامي"], "discourse-pragmatics", ["Discourse Analysis"], ["Rights-cleared media texts with documented source, date, genre, and sampling boundaries.", "نصوص إعلامية مصرح بها مع توثيق المصدر والتاريخ والنوع وحدود العينة."], ["Media comparisons can blur measured topic patterns, stance evidence, and researcher interpretation.", "قد تخلط مقارنات الإعلام بين أنماط الموضوع المقاسة وأدلة الموقف وتفسير الباحث."], ["A reviewed stance/topic sample, evidence spans, comparison notes, and an error taxonomy.", "عينة موقف وموضوع مراجعة ونطاقات أدلة وملاحظات مقارنة وتصنيف أخطاء."], ["Human-reference comparison, evidence review, agreement where applicable, and disputed-case analysis.", "المقارنة بمرجع بشري ومراجعة الأدلة والاتفاق عند ملاءمته وتحليل الحالات المختلف عليها."], ["discourse", "semantics", "corpus-data"], ["media-content", "stance", "topic", "evaluation"]),
]);

const customEntry = (project, sector, need, languageProblem, tasks, tools, challenges, application, value, privacy, licensing) => ({
  id: `applied-${project.id}`,
  projectId: project.id,
  titleAr: project.title.ar,
  titleEn: project.title.en,
  sector,
  needAr: need[1], needEn: need[0],
  languageProblem: bi(...languageProblem),
  whyItMatters: project.impact,
  nlpTasks: tasks,
  suitablePaths: [project.path], suitableTools: tools,
  relatedArabicChallenges: challenges,
  dataNeeds: project.dataRequirements,
  annotationNeeds: project.annotationNotes,
  humanReferenceNeeds: project.evaluation,
  externalSteps: project.externalSteps,
  evaluationApproaches: project.evaluation,
  errorAnalysisFocus: bi("Inspect missing, incorrect, unsupported, and ambiguous outputs.", "افحص المخرجات الفائتة والخاطئة وغير المدعومة والغامضة."),
  prototypeIdea: project.applicationPotential,
  possibleApplication: bi(...application),
  expectedPracticalValue: bi(...value),
  privacyConsiderations: bi(...privacy),
  legalOrLicensingNotes: bi(...licensing),
  limitations: bi("Results remain research suggestions requiring expert validation.", "تبقى النتائج مقترحات بحثية تحتاج إلى تحقق خبير."),
  complexity: project.complexity, individualOrTeam: project.teamType, needsAnnotators: project.annotatorsRequired,
  tags: [...project.tags, sector, "applied-project"], reusedFromSocialImpact: false,
});

export const APPLIED_PROJECT_ENTRIES = Object.freeze([
  customEntry(APPLIED_NEW_PROJECTS[0], "culture-heritage", ["Create consistent, traceable heritage catalog descriptions.", "إنشاء أوصاف متسقة وقابلة للتتبع للمواد التراثية."], ["Terminology, entities, relations, and uncertain readings vary across descriptions.", "تختلف المصطلحات والكيانات والعلاقات والقراءات غير اليقينية بين الأوصاف."], ["terminology-extraction", "named-entities", "relation-extraction", "semantic-grouping", "corpus-analysis"], ["Information Extraction", "Corpus Research", "Semantics Research Preview"], ["orthography", "morphology", "corpus-data"], ["A heritage-description review assistant.", "مساعد لمراجعة الأوصاف التراثية."], ["Potentially more consistent and researchable catalog descriptions.", "قيمة محتملة في جعل أوصاف الفهارس أكثر اتساقًا وقابلية للبحث."], ["Remove private ownership or location details when not necessary.", "أزل تفاصيل الملكية الخاصة أو المواقع عندما لا تكون ضرورية."], ["Confirm reuse rights for descriptions and images; no heritage-authority access or endorsement is implied.", "تحقق من حقوق إعادة استخدام الأوصاف والصور؛ ولا يُفترض وصول إلى جهة تراثية أو تأييد منها."]),
  fromSocial("health-instruction-review", "health-information", ["Review clarity of non-clinical health information.", "مراجعة وضوح المعلومات الصحية غير السريرية."], ["A research-only clarity and comprehension review aid.", "أداة بحثية لمراجعة الوضوح والفهم فقط."], ["Use approved texts only; research/educational use—not medical advice.", "استخدم نصوصًا معتمدة فقط؛ للاستخدام البحثي/التعليمي وليس نصيحة طبية."]),
  fromSocial("reuse-match-ai", "sustainability-environment", ["Match differently worded surplus and need descriptions.", "مطابقة أوصاف الفائض والاحتياج المختلفة في الصياغة."], ["A human-reviewed resource-match demonstrator.", "عارض لمطابقة الموارد بمراجعة بشرية."], ["No organization, contract, or access to private inventory is implied.", "لا يُفترض وجود جهة أو عقد أو وصول إلى مخزون خاص."]),
  fromSocial("visitor-instruction-comprehension", "tourism-events", ["Improve research understanding of visitor-instruction clarity.", "تحسين الفهم البحثي لوضوح تعليمات الزوار."], ["A visitor-instruction clarity prototype.", "نموذج أولي لوضوح تعليمات الزوار."], ["Use public or licensed instructions; no event or tourism partner is implied.", "استخدم تعليمات عامة أو مرخصة؛ ولا يُفترض وجود شريك سياحي أو فعالية."]),
  fromSocial("arabic-hobby-transformer", "recreation-hobbies", ["Study safe adaptation of Arabic hobby activities.", "دراسة التكييف الآمن لأنشطة الهوايات العربية."], ["A reviewed activity-adaptation prototype.", "نموذج مراجع لتكييف الأنشطة."], ["No developmental or therapeutic outcome is claimed.", "لا يُدّعى أثر نمائي أو علاجي."]),
  fromSocial("academic-instruction-analyzer", "education-universities", ["Structure requirements and ambiguity in academic instructions.", "هيكلة المتطلبات والغموض في التعليمات الأكاديمية."], ["A reviewable academic-instruction checklist.", "قائمة تحقق قابلة للمراجعة للتعليمات الأكاديمية."], ["No university assignment, approval, or access to student records is implied.", "لا يُفترض تكليف أو اعتماد جامعي أو وصول إلى سجلات الطلاب."]),
  fromSocial("public-instruction-actions", "public-services", ["Turn public instructions into reviewable requirements and actions.", "تحويل التعليمات العامة إلى متطلبات وإجراءات قابلة للمراجعة."], ["A comprehension-to-action research prototype.", "نموذج بحثي للانتقال من الفهم إلى الإجراء."], ["Not official legal or administrative advice; no government partnership is implied.", "ليس نصيحة قانونية أو إدارية رسمية؛ ولا تُفترض شراكة حكومية."]),
  fromSocial("delivery-instruction-check", "transport-logistics", ["Detect ambiguity before operational use of delivery notes.", "اكتشاف الغموض قبل الاستخدام التشغيلي لتعليمات التسليم."], ["A pre-arrival instruction review demonstrator.", "عارض لمراجعة التعليمات قبل الوصول."], ["No delivery platform data, client, or operational integration is implied.", "لا يُفترض الوصول إلى بيانات منصة توصيل أو وجود عميل أو تكامل تشغيلي."]),
  customEntry(APPLIED_NEW_PROJECTS[1], "media-content", ["Compare stance and topics in a bounded media collection.", "مقارنة الموقف والموضوعات في مجموعة إعلامية محددة."], ["Stance, topic, terminology, and discourse patterns require source-grounded interpretation.", "تحتاج أنماط الموقف والموضوع والمصطلحات والخطاب إلى تفسير مرتبط بالمصدر."], ["stance-analysis", "topic-discovery", "terminology-tracking", "discourse-comparison"], ["Discourse Analysis", "Semantics Research Preview", "Corpus Research"], ["discourse", "semantics", "corpus-data"], ["A reviewed media comparison workspace.", "مساحة مراجعة لمقارنة المحتوى الإعلامي."], ["Potentially clearer evidence for bounded media-language studies.", "قيمة محتملة في توضيح أدلة دراسات اللغة الإعلامية المحددة."], ["Respect copyright and avoid unnecessary personal profiling.", "احترم حقوق النشر وتجنب التنميط الشخصي غير الضروري."], ["Use licensed/public excerpts within permitted limits; no media endorsement is implied.", "استخدم مقتطفات عامة أو مرخصة ضمن الحدود المسموحة؛ ولا يُفترض تأييد جهة إعلامية."]),
  fromSocial("natural-place-description", "local-community", ["Structure natural-language place descriptions for research review.", "هيكلة أوصاف الأماكن الطبيعية للمراجعة البحثية."], ["A reviewable place-component extractor without GPS claims.", "مستخرج مكونات مكانية قابل للمراجعة دون ادعاء دقة GPS."], ["GIS, geocoding, and real service integration remain external and separately licensed.", "تبقى GIS والترميز الجغرافي والتكامل الخدمي الحقيقي خطوات خارجية ذات تراخيص منفصلة."]),
]);

export const APPLIED_PROJECT_BY_PROJECT_ID = Object.freeze(Object.fromEntries(APPLIED_PROJECT_ENTRIES.map((item) => [item.projectId, item])));
export const APPLIED_REUSED_PROJECT_IDS = Object.freeze(APPLIED_PROJECT_ENTRIES.filter((item) => item.reusedFromSocialImpact).map((item) => item.projectId));

export const APPLIED_PROTOTYPE_PROFILES = Object.freeze(Object.fromEntries(APPLIED_NEW_PROJECTS.map((project) => [project.id, {
  projectId: project.id,
  solution: project.applicationPotential,
  users: bi("Researchers, curators, and trained reviewers.", "الباحثون والقيمون والمراجعون المدربون."),
  inputs: project.dataRequirements,
  outputs: project.expectedResults,
  method: bi("Configured LinguaLab analysis with evidence-preserving human review.", "تحليل مضبوط داخل LinguaLab مع مراجعة بشرية تحفظ الأدلة."),
  logic: bi("Prepare → analyze → preserve evidence → review → evaluate errors.", "جهز ← حلل ← احفظ الأدلة ← راجع ← قيّم الأخطاء."),
}])));

export function filterAppliedProjects(filters = {}) {
  return APPLIED_PROJECT_ENTRIES.filter((item) => (!filters.sector || item.sector === filters.sector) && (!filters.form || PROJECT_OUTPUTS[item.projectId]?.includes(filters.form)) && (!filters.team || item.individualOrTeam === filters.team) && (!filters.annotation || (filters.annotation === "yes") === item.needsAnnotators) && (!filters.complexity || item.complexity === filters.complexity));
}

const PROJECT_OUTPUTS = Object.freeze(Object.fromEntries([...Object.values(SOCIAL_IMPACT_BY_ID), ...APPLIED_NEW_PROJECTS].map((item) => [item.id, item.possibleOutputs])));

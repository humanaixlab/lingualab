import { ALGORITHM_STEPS, RESEARCH_STEPS, splitLines } from "./nlp-builder.js";

const bi = (en, ar) => ({ en, ar });
export const GUIDE_LEVELS = Object.freeze([
  { id: "beginner", name: bi("Beginner Guidance", "إرشاد المبتدئ") },
  { id: "research", name: bi("Research Guidance", "الإرشاد البحثي") },
  { id: "technical", name: bi("Technical Guidance", "الإرشاد التقني") },
]);

export const DEBUG_CATEGORIES = Object.freeze(["programming-error", "missing-dependency", "missing-feature", "rule-logic-problem", "linguistic-ambiguity", "missing-exception", "out-of-scope-input", "code-spec-divergence"]);

const LEVEL_STYLE = {
  beginner: bi("Use plain language, define the term in context, and connect it to one concrete Arabic example.", "استخدم لغة مباشرة، وعرّف المصطلح في سياقه، واربطه بمثال عربي واحد."),
  research: bi("Relate the decision to validity, annotation consistency, scope, and error analysis.", "اربط القرار بالصدق واتساق الترميز والنطاق وتحليل الأخطاء."),
  technical: bi("State the input, representation, dependency, validation rule, and expected output precisely.", "حدد المدخل والتمثيل والاعتماد وقاعدة التحقق والمخرج المتوقع بدقة."),
};

export function currentStageGuidance(state, level = "beginner", locale = "en") {
  const algorithm = state.mode === "linguistic-algorithm";
  const step = Math.max(0, Math.min(8, Number(state.step) || 0));
  const name = (algorithm ? ALGORITHM_STEPS : RESEARCH_STEPS)[step][locale];
  const actions = algorithm
    ? [
      bi("Bound the linguistic rule and state what it does not decide.", "حدّد القاعدة اللغوية وما الذي لا تحسمه."), bi("Use positive and contrastive examples to expose coverage.", "استخدم أمثلة موجبة ومقابلة لكشف حدود التغطية."), bi("Choose the smallest input unit that contains the required evidence.", "اختر أصغر وحدة إدخال تتضمن الدليل المطلوب."), bi("List observable features, their sources, and testable conditions.", "حدّد السمات الملحوظة ومصادرها والشروط القابلة للاختبار."), bi("Define explicit outcomes, including uncertainty when evidence is missing.", "عرّف نواتج صريحة، ومنها عدم اليقين عند غياب الدليل."), bi("Preserve exceptions instead of forcing them into the main rule.", "احتفظ بالاستثناءات بدل إجبارها على الدخول في القاعدة العامة."), bi("Give each case an expected result under the current rule.", "امنح كل حالة نتيجة متوقعة وفق القاعدة الحالية."), bi("Trace the same decision from rule to logic, pseudocode, and Python.", "تتبّع القرار نفسه من القاعدة إلى المنطق والشفرة الوصفية وPython."), bi("Review scope, dependencies, tests, and unresolved ambiguity before transfer.", "راجع النطاق والاعتمادات والاختبارات والغموض قبل النقل."),
    ][step]
    : [
      bi("Select the linguistic concept before choosing a computational method.", "اختر المفهوم اللغوي قبل اختيار الطريقة الحاسوبية."), bi("Provide one bounded Arabic example that makes the phenomenon observable.", "قدّم مثالًا عربيًا محدودًا يجعل الظاهرة قابلة للملاحظة."), bi("Choose what receives a label or enters the algorithm.", "اختر ما الذي سيحمل الفئة أو يدخل الخوارزمية."), bi("Turn theoretical categories into defined machine-readable labels.", "حوّل الفئات النظرية إلى فئات مقروءة آليًا ومحددة التعريف."), bi("Compare human interpretation with the stored representation.", "قارن التفسير البشري بالتمثيل الذي سيخزنه الحاسوب."), bi("Name the output the computational task must produce.", "حدّد المخرج الذي يجب أن تنتجه المهمة الحاسوبية."), bi("Compare methodological families without treating one as universally best.", "قارن الأسر المنهجية دون اعتبار إحداها الأفضل دائمًا."), bi("Select task-appropriate metrics and plan linguistic error inspection.", "اختر مقاييس تناسب المهمة وخطط لفحص الأخطاء لغويًا."), bi("Review the complete blueprint before implementation or methodology writing.", "راجع المخطط كاملًا قبل التنفيذ أو كتابة المنهجية."),
    ][step];
  return {
    stage: name,
    now: actions[locale],
    why: algorithm ? bi("A program cannot apply a linguistic label until the evidence and decision rule are explicit.", "لا يستطيع البرنامج تطبيق الوصف اللغوي حتى يصبح الدليل ومنطق القرار صريحين.")[locale] : bi("Each decision constrains the annotation, data structure, task, and later evaluation.", "كل قرار يقيّد الترميز وبنية البيانات والمهمة والتقييم اللاحق.")[locale],
    decision: algorithm ? bi("Decide only what the current rule needs; leave unresolved cases as REVIEW.", "احسم فقط ما تحتاج إليه القاعدة الحالية، واترك الحالات غير المحسومة بصيغة REVIEW.")[locale] : bi("Choose the option that matches the research question, not the most complex technology.", "اختر ما يطابق سؤال البحث، لا التقنية الأكثر تعقيدًا.")[locale],
    next: step === 8 ? bi("Transfer the reviewed design to its next owner only when a new task is needed.", "انقل التصميم المراجع إلى الأداة المالكة التالية فقط عند وجود مهمة جديدة.")[locale] : bi("The next step will formalize another part of the same design without discarding this choice.", "ستحوّل المرحلة التالية جزءًا آخر من التصميم نفسه دون إلغاء هذا القرار.")[locale],
    levelNote: LEVEL_STYLE[level]?.[locale] || LEVEL_STYLE.beginner[locale],
  };
}

export function buildGuideContext(state, pack) {
  const algorithm = state.mode === "linguistic-algorithm";
  return {
    mode: state.mode,
    step: state.step,
    domain: algorithm ? state.ruleDomain : getPhenomenonDomain(state.phenomenonId),
    phenomenonOrRule: algorithm ? state.ruleName : pack?.phenomenon,
    scope: algorithm ? state.ruleDescription : state.notes,
    unitOfAnalysis: algorithm ? state.ruleUnit : state.unit,
    features: algorithm ? splitLines(state.requiredFeatures) : [],
    featureSources: algorithm ? splitLines(state.featureSources) : [],
    labels: algorithm ? pack?.outputLabels || [] : pack?.annotation?.labels || [],
    schema: algorithm ? pack?.requiredFeatures || [] : pack?.dataSchema || [],
    conditions: algorithm ? pack?.conditions || [] : [],
    exceptions: algorithm ? pack?.exceptions || [] : [],
    ambiguities: algorithm ? pack?.exceptions || [] : [],
    decisionLogic: algorithm ? pack?.pseudocode || [] : [],
    tests: algorithm ? pack?.tests || [] : [],
    pseudocode: pack?.pseudocode || [],
    pythonStarterCode: pack?.pythonStarter || "",
    dependencies: algorithm ? pack?.dependencies || [] : [],
    validationStatus: state.step <= state.maxStep ? "current-or-reviewed-step" : "not-reached",
    researcherDecisions: state.guideDecisions || [],
    aiReviewDecision: state.aiDecision || "pending",
    incomingContext: state.incomingProjectContext || null,
  };
}

function getPhenomenonDomain(id) {
  const domains = { "named-entities": "information-extraction", sentiment: "semantics", "speech-acts": "pragmatics", "morphological-features": "morphology", "grammatical-roles": "syntax", "dependency-relations": "syntax", "word-sense": "semantics", "semantic-similarity": "semantics", stance: "discourse", "intent-classification": "text-classification", relations: "information-extraction", custom: "custom" };
  return domains[id] || "custom";
}

function decisionFor(state, id) {
  return Array.isArray(state.guideDecisions) ? state.guideDecisions.find((item) => item.id === id) : null;
}

function suggestion(state, locale, definition) {
  const decision = decisionFor(state, definition.id);
  return { ...definition, title: definition.title[locale], reason: definition.reason[locale], simpler: definition.simpler[locale], example: definition.example[locale], impact: definition.impact[locale], provenance: { source: "smart-guide-suggestion", status: decision?.status || "pending", modifiedText: decision?.modifiedText || "" } };
}

export function detectBuilderIssues(state, pack, locale = "en") {
  const issues = [];
  const features = splitLines(state.requiredFeatures);
  const sources = splitLines(state.featureSources);
  const dependencies = splitLines(state.dependencies);
  if (state.mode === "linguistic-algorithm" && features.length && sources.length < features.length) issues.push(suggestion(state, locale, {
    id: "missing-feature-source", category: "missing-feature", severity: "warning",
    title: bi("Feature source is incomplete", "مصدر السمة غير مكتمل"),
    reason: bi("The rule uses a linguistic feature, but not every feature has a declared source.", "تستخدم القاعدة سمة لغوية، لكن لم يحدد مصدر لكل سمة."),
    simpler: bi("The program needs to know where each fact comes from: manual input, a rule, or an external parser.", "يحتاج البرنامج أن يعرف من أين تأتي كل معلومة: إدخال يدوي، أو قاعدة، أو محلل خارجي."),
    example: bi("subject_gender may come from manual annotation or a reviewed morphological analyzer.", "قد تأتي سمة subject_gender من ترميز يدوي أو محلل صرفي خضع للمراجعة."),
    impact: bi("Without a source, the condition cannot be implemented or validated.", "من دون مصدر، لا يمكن تنفيذ الشرط أو التحقق منه."),
  }));
  if (state.mode === "linguistic-algorithm" && dependencies.some((item) => !/implemented|manual|external/i.test(item))) issues.push(suggestion(state, locale, {
    id: "missing-dependency", category: "missing-dependency", severity: "warning",
    title: bi("A dependency is still a placeholder", "يوجد اعتماد ما يزال عنصرًا مؤقتًا"),
    reason: bi("A named helper is used without an implemented, external, or manual source.", "توجد وظيفة مسماة دون تحديد أنها منفذة أو خارجية أو إدخال يدوي."),
    simpler: bi("Python does not know how to find a subject just because a function is named find_subject().", "لا يعرف Python كيف يحدد الفاعل لمجرد أن الدالة سميت find_subject()."),
    example: bi("find_subject() → external dependency: reviewed dependency parser.", "find_subject() ← اعتماد خارجي: محلل اعتماد نحوي خضع للمراجعة."),
    impact: bi("The starter code will stop or return REVIEW until this dependency is supplied.", "سيتوقف الكود الأولي أو يعيد REVIEW حتى يتوفر هذا الاعتماد."),
  }));
  if (state.mode === "linguistic-algorithm" && !String(state.decisionOutput).includes("REVIEW")) issues.push(suggestion(state, locale, {
    id: "ambiguity-collapsed", category: "linguistic-ambiguity", severity: "warning",
    title: bi("Ambiguity may be resolved too early", "قد يكون الغموض حُسم مبكرًا"),
    reason: bi("The current decision design does not preserve both REVIEW and documented exception triggers.", "لا يحفظ منطق القرار الحالي كلاً من REVIEW ومحفزات الاستثناء الموثقة."),
    simpler: bi("If the evidence is not enough, the program should say that instead of guessing.", "إذا لم يكف الدليل، ينبغي أن يصرح البرنامج بذلك بدل التخمين."),
    example: bi("A word with two possible morphological readings → REVIEW.", "كلمة تحتمل تحليلين صرفيين ← REVIEW."),
    impact: bi("Keeping REVIEW prevents uncertain cases from becoming false definitive labels.", "الإبقاء على REVIEW يمنع تحويل الحالات الملتبسة إلى أحكام قطعية زائفة."),
  }));
  if (state.mode === "linguistic-algorithm" && splitLines(state.conditions).length && !splitLines(state.exceptions).length) issues.push(suggestion(state, locale, {
    id: "missing-exception", category: "missing-exception", severity: "warning",
    title: bi("No exception or review trigger is documented", "لم يوثق استثناء أو محفز للمراجعة"),
    reason: bi("The current rule has computable conditions but no stated exception boundary.", "تحتوي القاعدة الحالية شروطًا قابلة للحوسبة دون حد استثناء معلن."),
    simpler: bi("State when the rule should stop and ask for review.", "حدد متى تتوقف القاعدة وتطلب المراجعة."),
    example: bi("Coordination or an unresolved proper-name reading may trigger REVIEW.", "قد يؤدي التنسيق أو قراءة اسم العلم غير المحسومة إلى REVIEW."),
    impact: bi("Documented exceptions prevent broad conditions from becoming overgeneralized claims.", "تمنع الاستثناءات الموثقة تحويل الشروط الواسعة إلى تعميمات زائدة."),
  }));
  const hasOutsideScopeTest = /OUTSIDE_SCOPE|خارج النطاق/i.test(String(state.testCases || ""));
  const scopeDefinesOutside = /OUTSIDE_SCOPE|خارج النطاق|لا تشمل|does not cover|exclude/i.test(String(state.ruleDescription || ""));
  if (state.mode === "linguistic-algorithm" && hasOutsideScopeTest && !scopeDefinesOutside) issues.push(suggestion(state, locale, {
    id: "scope-conflict", category: "out-of-scope-input", severity: "warning",
    title: bi("A test is outside an undefined scope boundary", "توجد حالة اختبار خارج حد نطاق غير معرّف"),
    reason: bi("A test expects OUTSIDE_SCOPE, but the rule specification does not state what is excluded.", "تتوقع حالة اختبار OUTSIDE_SCOPE، لكن مواصفة القاعدة لا تحدد ما تستبعده."),
    simpler: bi("The test says the case is outside the rule, but the rule has not explained where its boundary is.", "تقول الحالة إنها خارج القاعدة، لكن القاعدة لم توضح أين تنتهي حدودها."),
    example: bi("Dialectal forms => OUTSIDE_SCOPE requires the scope to exclude or separately handle dialectal data.", "الصيغ اللهجية ← OUTSIDE_SCOPE يتطلب أن يستبعد النطاق البيانات اللهجية أو يعالجها منفصلة."),
    impact: bi("Defining the boundary makes test expectations auditable and prevents silent exclusion.", "يجعل تحديد الحد توقعات الاختبار قابلة للمراجعة ويمنع الاستبعاد الصامت."),
  }));
  const code = String(state.pythonDraft || "");
  const conditionIds = (pack?.conditions || []).map((item) => item.id);
  if (code && conditionIds.some((id) => !code.includes(id)) || /\bC\d+\b/.test(code) && [...code.matchAll(/\bC\d+\b/g)].some((match) => !conditionIds.includes(match[0]))) issues.push(suggestion(state, locale, {
    id: "code-spec-divergence", category: "code-spec-divergence", severity: "error",
    title: bi("Code and rule specification diverge", "يوجد اختلاف بين الكود ومواصفة القاعدة"),
    reason: bi("The edited Python no longer traces cleanly to every approved condition ID.", "لم يعد كود Python المعدل مرتبطًا بوضوح بكل معرف شرط معتمد."),
    simpler: bi("The code says something different from the rule list.", "الكود يقول شيئًا مختلفًا عن قائمة القواعد."),
    example: bi("C3 appears in Python but no C3 exists in the approved specification.", "يظهر C3 في Python مع عدم وجود C3 في المواصفة المعتمدة."),
    impact: bi("Reconcile the specification and code before transferring to Code Builder.", "طابق المواصفة والكود قبل النقل إلى أداة بناء الكود."),
  }));
  return issues;
}

export function recordGuideDecision(state, suggestionId, status, modifiedText = "") {
  if (!["accepted", "modified", "rejected"].includes(status)) return state;
  const decisions = Array.isArray(state.guideDecisions) ? state.guideDecisions.filter((item) => item.id !== suggestionId) : [];
  decisions.push({ id: suggestionId, source: "smart-guide-suggestion", status, modifiedText: status === "modified" ? String(modifiedText).slice(0, 4000) : "", decidedAt: new Date().toISOString() });
  return { ...state, guideDecisions: decisions };
}

export function buildProgrammingBridge(state, pack, locale = "en") {
  const first = pack?.conditions?.[0];
  const linguisticRule = first?.description || state.ruleDescription || bi("No rule condition has been defined.", "لم يعرّف شرط للقاعدة بعد.")[locale];
  const logic = first ? `IF C1 holds\nTHEN continue toward MATCH\nELSE return NO_MATCH or REVIEW` : "IF required evidence is missing\nTHEN return REVIEW";
  const pseudocode = first ? (pack.pseudocode || []).filter((line) => /C1|REVIEW|MATCH/.test(line)).slice(0, 4).join("\n") : "IF evidence is missing:\n    RETURN REVIEW";
  const python = first ? `# Generated from C1\nc1 = False  # TODO: ${first.description}\nif c1:\n    matched.append("C1")` : `if evidence is None:\n    return "REVIEW"`;
  return {
    sameIdea: bi("These four forms express the same decision with increasing formality.", "تمثل الصور الأربع القرار نفسه بدرجات متزايدة من الصياغة الرسمية.")[locale],
    linguisticRule, decisionLogic: logic, pseudocode, python,
    explanation: locale === "ar" ? ["if = إذا", "c1 = متغير يحتفظ بنتيجة فحص الشرط الأول", "False = الشرط لم ينفذ بعد", "return = أعد نتيجة القرار إلى الجزء الذي استدعى الدالة"] : ["if means: test a condition", "c1 is a variable holding the first condition result", "False marks an unimplemented placeholder", "return sends the decision back to the caller"],
    trace: first ? { ruleId: first.id, logicBlock: "condition-check", codeBlock: "generated-condition-c1", status: first.implemented ? "implemented" : "placeholder" } : null,
    decisionTrace: [bi("Input", "المدخل")[locale], bi("Extracted features", "السمات المستخرجة")[locale], bi("Scope check", "فحص النطاق")[locale], first?.id || bi("Rule check", "فحص القاعدة")[locale], bi("Exception check", "فحص الاستثناء")[locale], bi("Ambiguity check", "فحص الغموض")[locale], bi("Result under the current rule", "النتيجة وفق القاعدة الحالية")[locale]],
  };
}

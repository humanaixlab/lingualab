import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { readResearchContext, analyzeContext } from "../../lib/research-context";
import { createReportContext } from "../../lib/report-context";
import { interpretationContextText, readAnalysisHandoff } from "../../lib/analysis-handoff";
import DataSourceIndicator from "../../components/DataSourceIndicator";
import styles from "../../styles/Analyze.module.css";
import { useLanguage } from "../../components/LanguageProvider";
import ProgressiveAiOutput from "../../components/ProgressiveAiOutput";
import { fetchAiJson } from "../../lib/ai-stream";
import { createProjectHandoff, incomingHandoffPreview, readProjectHandoff } from "../../lib/structured-handoff";
import { LEARNING_PATH_SECTION, RESEARCH_PATH_SECTION, readResearchPathContext, researchPathLabel } from "../../lib/research-path-context";

const DEFAULT_PLAN = {
  variant: "default",
  eyebrowVariant: "default",
  eyebrow: "ANALYZE",
  title: "A clear path from data to evidence.",
  summary:
    "LinguaLab recommends a focused sequence: understand the signal, explain the pattern, then turn the findings into a research-ready report.",
  confidence: 92,
  estimatedTime: "2–3 minutes",
  steps: [
    {
      number: "01",
      title: "Text profile",
      description:
        "Establish the size, structure, and strongest recurring signals in the text.",
      status: "Best first step",
    },
    {
      number: "02",
      title: "Keyword discovery",
      description:
        "Identify the terms that help explain the dominant patterns in the dataset.",
      status: "Recommended next",
    },
    {
      number: "03",
      title: "Research report",
      description:
        "Convert the analysis into a concise, defensible summary with limitations and next steps.",
      status: "Final output",
    },
  ],
};

const SOURCE_ROUTES = {
  frequency: "/tools/frequency",
  concordance: "/tools/concordance",
  ngrams: "/tools/ngrams",
  "corpus-research": "/tools/corpus-research",
  pos: "/tools/pos",
};

const CORPUS_TOOL_LABELS = {
  frequency: { ar: "تحليل التكرار", en: "Frequency Analysis" },
  concordance: { ar: "تحليل السياقات", en: "Concordance / Contexts" },
  ngrams: { ar: "المتتاليات اللفظية", en: "N-grams" },
  "corpus-research": { ar: "إنشاء وتحليل المدونة", en: "Corpus Research" },
};

function ContextualCorpusResult({ handoff, language }) {
  const evidence = handoff?.evidence || {};
  const label = CORPUS_TOOL_LABELS[handoff?.sourceTool]?.[language] || handoff?.sourceTool || "";
  const rows = handoff?.sourceTool === "frequency"
    ? evidence.frequencies
    : handoff?.sourceTool === "ngrams"
      ? evidence.results
      : handoff?.sourceTool === "corpus-research"
        ? evidence.frequencies
        : [];
  const contexts = Array.isArray(evidence.contexts) ? evidence.contexts : [];
  const ngrams = handoff?.sourceTool === "corpus-research" && Array.isArray(evidence.ngrams) ? evidence.ngrams : [];
  const target = evidence.target || evidence.query;

  return (
    <article className={styles.contextResult} aria-labelledby="transferred-result-title">
      <p className={styles.sectionLabel}>{language === "ar" ? "النتيجة الفعلية المنقولة" : "TRANSFERRED COMPUTED RESULT"}</p>
      <h2 id="transferred-result-title">{label}</h2>
      <p className={styles.contextSource}>
        <strong>{language === "ar" ? "مصدر البيانات/السياق:" : "Data source/context:"}</strong>{" "}
        {language === "ar"
          ? `النص والنتيجة المنقولة من أداة ${label}. لا تُعرض بيانات وصفية غير متاحة.`
          : `Text and results transferred from ${label}. Unavailable metadata is not shown.`}
      </p>
      {handoff?.sourceTool === "corpus-research" && (evidence.documentCount !== null || evidence.wordCount !== null) && (
        <div className={styles.contextMetrics}>
          {evidence.documentCount !== null && <div><span>{language === "ar" ? "عدد النصوص" : "Texts"}</span><strong>{evidence.documentCount}</strong></div>}
          {evidence.wordCount !== null && <div><span>{language === "ar" ? "عدد الكلمات" : "Words"}</span><strong>{evidence.wordCount}</strong></div>}
        </div>
      )}
      {target && <p><strong>{language === "ar" ? "عنصر البحث:" : "Target:"}</strong> <span dir="auto">{target}</span></p>}
      {rows?.length > 0 && <EvidenceTable rows={rows} language={language} />}
      {contexts.length > 0 && <div className={styles.contextList}><h3>{language === "ar" ? "السياقات الفعلية" : "Observed contexts"}</h3><ul>{contexts.map((item, index) => <li key={`${index}-${item}`} dir="auto">{item}</li>)}</ul></div>}
      {ngrams.length > 0 && <div className={styles.contextList}><h3>{language === "ar" ? "المتتاليات اللفظية الفعلية" : "Observed N-grams"}</h3><EvidenceTable rows={ngrams} language={language} /></div>}
    </article>
  );
}

function EvidenceTable({ rows, language }) {
  return <div className={styles.contextTable}><table><thead><tr><th>{language === "ar" ? "العنصر" : "Item"}</th><th>{language === "ar" ? "القيمة المحسوبة" : "Computed value"}</th></tr></thead><tbody>{rows.map(([item, count], index) => <tr key={`${index}-${item}`}><td dir="auto">{item}</td><td>{count}</td></tr>)}</tbody></table></div>;
}

function analyzeTextValue(text) {
  const words = text.trim().split(/\s+/);
  const sentences = text.split(/[.!؟]/);
  const frequency = {};
  words.forEach((word) => {
    const clean = word.toLowerCase().replace(/[،؛:!?.,"'()\[\]]/g, "");
    if (clean) frequency[clean] = (frequency[clean] || 0) + 1;
  });
  return {
    wordCount: words.filter(Boolean).length,
    sentenceCount: sentences.filter((sentence) => sentence.trim()).length,
    topWords: Object.entries(frequency).sort((a, b) => b[1] - a[1]).slice(0, 5),
  };
}

function buildPlan(context) {
  if (!context) return DEFAULT_PLAN;

  const description = context.dataDescription || "";
  const hasLabels = /label|class|target|تصنيف|فئة/i.test(description);
  const hasArabic = /Arabic|عربي/i.test(description);

  return {
    ...DEFAULT_PLAN,
    variant: hasLabels ? "labeled" : "corpus",
    eyebrowVariant: hasArabic ? "labeled" : "default",
    title: hasLabels
      ? "Start with the strongest testable signal."
      : "Explore the corpus before choosing a model.",
    summary: hasLabels
      ? "Your dataset appears to include text and labels. Begin with a baseline analysis, inspect the language behind each class, then document the evidence and limitations."
      : "Your dataset is best approached as a corpus first. Establish its profile, discover recurring language patterns, and only then decide whether modeling is justified.",
    confidence: hasLabels ? 94 : 88,
    steps: hasLabels
      ? [
          {
            number: "01",
            title: "Baseline classification",
            description:
              "Test whether the available labels can be predicted from the text with a transparent baseline.",
            status: "Best first step",
          },
          {
            number: "02",
            title: "Class-level keywords",
            description:
              "Compare the language associated with each label to explain what drives the prediction.",
            status: "Recommended next",
          },
          {
            number: "03",
            title: "Research report",
            description:
              "Summarize performance, interpretation, limitations, and the most defensible next study.",
            status: "Final output",
          },
        ]
      : DEFAULT_PLAN.steps,
    eyebrow: hasArabic
      ? "ANALYZE · ARABIC DATA"
      : DEFAULT_PLAN.eyebrow,
  };
}

export default function Analyzer() {
  const { language, t } = useLanguage();
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [interpretation, setInterpretation] = useState(null);
  const [loadingInterpretation, setLoadingInterpretation] = useState(false);
  const [interpretationError, setInterpretationError] = useState("");
  const [progressText, setProgressText] = useState("");
  const [context, setContext] = useState(null);
  const [sourceAnalysis, setSourceAnalysis] = useState(null);
  const [projectHandoff, setProjectHandoff] = useState(null);
  const [acceptedProject, setAcceptedProject] = useState(null);
  const [projectTarget, setProjectTarget] = useState("");
  const [researchPathContext, setResearchPathContext] = useState(null);
  const router = useRouter();
  const isCorpusInterpretation = sourceAnalysis?.pathId === "corpus-linguistics" && Boolean(CORPUS_TOOL_LABELS[sourceAnalysis?.sourceTool]);
  const hasSelectedResearchPath = Boolean(researchPathContext?.selectedPath);
  const fromLearningPath = researchPathContext?.sourceSection === LEARNING_PATH_SECTION;
  const fromResearchPlanner = researchPathContext?.sourceSection === RESEARCH_PATH_SECTION;
  const returnDestination = fromLearningPath || router.query?.from === "learn"
    ? { href: "/learning-center", label: language === "ar" ? "العودة إلى مركز التعلّم" : "Back to Learning Center" }
    : fromResearchPlanner
      ? { href: `/research-planner#${researchPathContext.selectedPath}`, label: language === "ar" ? "العودة إلى مخطط البحث" : "Back to Research Planner" }
      : null;
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const nextContext = analyzeContext(readResearchContext(window.location.search));
      const handoff = readAnalysisHandoff(window.location.search);
      const incomingProject = readProjectHandoff("analyze", window.location.search);
      const selectedResearchPath = readResearchPathContext(router.asPath, router.pathname);
      setContext(nextContext);
      setSourceAnalysis(handoff);
      setProjectHandoff(incomingProject);
      setResearchPathContext(selectedResearchPath);
      if (handoff) {
        setText(handoff.text);
        setResult(analyzeTextValue(handoff.text));
        setInterpretation(null);
        setInterpretationError("");
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [router.asPath, router.pathname]);

  const mergeProjectContext = () => {
    if (!projectHandoff) return;
    setAcceptedProject({ ...incomingHandoffPreview(projectHandoff), provenance: { ...projectHandoff.provenance, status: "accepted", researcherDecision: "merge" } });
    const incomingText = projectHandoff.payload.datasetContext || projectHandoff.payload.datasetDescription || "";
    if (!text.trim() && incomingText) setText(incomingText);
    setProjectHandoff(null);
  };

  const transferProject = (target) => {
    if (!result) return;
    const payload = target === "code"
      ? { task: "Revise the implementation that produced or prepares this analysis.", requiredChange: "Review preprocessing, derived features, or evaluation code based on the observed result.", outputSchema: ["wordCount", "sentenceCount", "topWords"], importantErrors: interpretation?.limitations ? [interpretation.limitations] : [], metrics: [`wordCount=${result.wordCount}`, `sentenceCount=${result.sentenceCount}`], codeContext: "No executable code is transferred from Analyze." }
      : { analysisType: sourceAnalysis?.analysisType || "descriptive-text-analysis", resultSummary: `Words: ${result.wordCount}; sentences: ${result.sentenceCount}; frequent items: ${result.topWords.map(([word, count]) => `${word}=${count}`).join(", ")}`, metrics: [`wordCount=${result.wordCount}`, `sentenceCount=${result.sentenceCount}`], importantErrors: interpretation?.limitations ? [interpretation.limitations] : [], datasetDescription: acceptedProject?.payload?.datasetContext || context?.dataDescription || "User-provided text in Analyze", knownLimitations: ["Interpret results in relation to the research question and data collection method"] };
    window.location.href = createProjectHandoff("analyze", target, payload, { sourceStateId: "analyze-current-result" });
  };

  const plan = useMemo(() => buildPlan(context), [context]);
  const planVariant = plan.variant;
  const planText = (field) => t(`analyze.plans.${field === "eyebrow" ? (plan.eyebrowVariant || planVariant) : planVariant}.${field}`);
  const stepText = (index, part) => {
    const translated = t(`analyze.plans.${planVariant}.s${index + 1}`);
    const fallback = t(`analyze.plans.default.s${index + 1}`);
    return (Array.isArray(translated) ? translated : fallback)[part];
  };

  const analyzeText = () => {
    setInterpretation(null);
    setInterpretationError("");
    setProgressText("");
    setLoadingInterpretation(false);

    setSourceAnalysis(null);
    setResult(analyzeTextValue(text));
  };

const interpretResults = async () => {
  if (!result || loadingInterpretation) return;

  setLoadingInterpretation(true);
  setInterpretationError("");
  setProgressText("");

  try {
    const data = await fetchAiJson("/api/research-interpreter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        uiLanguage: language,
        wordCount: result.wordCount,
        sentenceCount: result.sentenceCount,
        topWords: result.topWords,
        datasetContext: interpretationContextText(sourceAnalysis),
      }),
    }, setProgressText);

    const payload = data?.result || data?.data || data;

    const normalizedInterpretation =
      payload?.interpretation &&
      typeof payload.interpretation === "object" &&
      !Array.isArray(payload.interpretation)
        ? {
            ...payload.interpretation,
            mode: payload.mode || payload.interpretation.mode,
          }
        : payload;

    setInterpretation(normalizedInterpretation);
    setProgressText("");

    const savedAnalysis = {
      text,
      wordCount: result.wordCount,
      sentenceCount: result.sentenceCount,
      topWords: result.topWords,
    };

    sessionStorage.setItem(
      "lingualab-interpretation",
      JSON.stringify(normalizedInterpretation)
    );

    sessionStorage.setItem(
      "lingualab-analysis-result",
      JSON.stringify(savedAnalysis)
    );

    localStorage.setItem(
      "lingualab-interpretation",
      JSON.stringify(normalizedInterpretation)
    );

    localStorage.setItem(
      "lingualab-analysis-result",
      JSON.stringify(savedAnalysis)
    );
  } catch (error) {
    console.error("Research interpreter error:", error);

    if (error?.partialText) setProgressText(error.partialText);

    setInterpretationError(
      error instanceof Error
        ? error.message
        : "LinguaLab could not interpret these findings."
    );
  } finally {
    setLoadingInterpretation(false);
  }
};

  const generateInterpretationReport = () => {
    if (!result || !interpretation) return;
    const sourceTool = sourceAnalysis?.sourceTool || "interpreter";
    const analysisType = sourceAnalysis?.analysisType || "interpretation";
    const evidence = sourceAnalysis?.evidence || {};
    const payload = sourceAnalysis ? {
      ...evidence,
      interpretation,
      pathId: "corpus-linguistics",
    } : {
      wordCount: result.wordCount,
      sentenceCount: result.sentenceCount,
      topWords: result.topWords,
      interpretation,
    };
    const url = createReportContext(sourceTool, analysisType, payload);
    if (url) window.location.href = url;
  };

  const startWorkflow = () => {
    document
      .getElementById("quick-analysis")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  const methodology =
    interpretation?.methodology ||
    interpretation?.methodologicalImplications ||
    interpretation?.researchImplications;

  const nextStep =
    interpretation?.nextStep ||
    interpretation?.recommendedNextStep ||
    interpretation?.next_step;

  const paperParagraph =
    interpretation?.paperParagraph ||
    interpretation?.draftParagraph ||
    interpretation?.paper_paragraph;

  return (
    <>
      <Head>
        <title>{t("analyze.pageTitle")}</title>
        <meta
          name="description"
          content={t("analyze.meta")}
        />
      </Head>

      <main className={styles.page}>
        <nav className={styles.nav} aria-label={t("analyze.primaryNav")}>
          <Link href="/" className={styles.brand}>
            <span className={styles.brandMark}>L</span>
            <span>LinguaLab</span>
          </Link>

          <div className={styles.navLinks}>
            {isCorpusInterpretation ? (
              <Link href="/research-paths/corpus-linguistics">{language === "ar" ? "مسار لسانيات المدونات" : "Corpus Linguistics path"}</Link>
            ) : returnDestination ? (
              <Link href={returnDestination.href}>{returnDestination.label}</Link>
            ) : <>
              <Link href="/workspace">{t("nav.workspace")}</Link>
              <Link href="/research-advisor">{t("nav.researchAdvisor")}</Link>
            </>}
          </div>
        </nav>

        {!isCorpusInterpretation && <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{planText("eyebrow")}</p>
            <h1>{planText("title")}</h1>
            <p className={styles.lead}>{planText("summary")}</p>
          </div>

          <div className={styles.heroNote}>
            <span>{t("analyze.principleLabel")}</span>
            <strong>{t("analyze.principle")}</strong>
          </div>
        </section>}

        {!isCorpusInterpretation && !hasSelectedResearchPath && <section className={styles.toolDirectory} aria-labelledby="research-path-entry-title">
          <div>
            <p className={styles.sectionLabel}>{language === "ar" ? "المسارات البحثية" : "RESEARCH PATHS"}</p>
            <h2 id="research-path-entry-title">{language === "ar" ? "استكشف حسب المسار البحثي" : "Explore by Research Path"}</h2>
            <p>{language === "ar" ? "اختر مجالًا في اللسانيات الحاسوبية، ثم افتح أدوات التحليل المتاحة ضمنه." : "Choose a computational-linguistics area, then open the analysis tools currently available within it."}</p>
          </div>
          <div className={styles.toolLinks}>
            <Link href="/research-planner#research-paths">{language === "ar" ? "عرض المسارات البحثية" : "View research paths"} <span aria-hidden="true">↗</span></Link>
          </div>
        </section>}

        {!isCorpusInterpretation && hasSelectedResearchPath && <section className={styles.toolDirectory} aria-labelledby="selected-research-path-title">
          <div>
            <p className={styles.sectionLabel}>{language === "ar" ? "المسار المختار" : "SELECTED RESEARCH PATH"}</p>
            <h2 id="selected-research-path-title">{researchPathLabel(researchPathContext.selectedPath, language)}</h2>
            <p>{language === "ar" ? "تم استلام اختيار المسار من الخطوة السابقة، لذلك لن يُطلب منك اختياره مرة أخرى. يمكنك متابعة التحليل مباشرة." : "The path selected in the previous step has been received, so Analyze will not ask you to choose it again. Continue directly with the analysis."}</p>
            <dl className={styles.contextIdentity}>
              <div><dt>{language === "ar" ? "المجال" : "Domain"}</dt><dd>{language === "ar" ? "لساني" : "Linguistic"}</dd></div>
              <div><dt>{language === "ar" ? "مسار العمل" : "Workflow"}</dt><dd>{language === "ar" ? "تحليل المدونة" : "Corpus analysis"}</dd></div>
            </dl>
          </div>
          <div className={styles.toolLinks}>
            <a href="#quick-analysis">{language === "ar" ? "متابعة التحليل" : "Continue analysis"} <span aria-hidden="true">↓</span></a>
          </div>
        </section>}

        <div className={isCorpusInterpretation ? styles.contextHeader : styles.sourceContext}>
          {isCorpusInterpretation ? <>
            <p className={styles.eyebrow}>{language === "ar" ? "تفسير سياقي لنتيجة فعلية" : "CONTEXTUAL INTERPRETATION OF AN ACTUAL RESULT"}</p>
            <h1>{language === "ar" ? "تفسير نتائج لسانيات المدونات" : "Interpret Corpus Linguistics Results"}</h1>
            <dl className={styles.contextIdentity}>
              <div><dt>{language === "ar" ? "المسار" : "Research path"}</dt><dd>{language === "ar" ? "لسانيات المدونات (Corpus Linguistics)" : "Corpus Linguistics"}</dd></div>
              <div><dt>{language === "ar" ? "الأداة" : "Source tool"}</dt><dd>{CORPUS_TOOL_LABELS[sourceAnalysis.sourceTool][language]}</dd></div>
            </dl>
            <DataSourceIndicator language={language} mode="transferred" />
            <p className={styles.caution}>{language === "ar" ? "تنبيه منهجي: يجب تفسير التكرارات والسياقات والمتتاليات في ضوء حجم المدونة وطريقة جمعها وسؤال البحث. التفسير المدعوم بالذكاء الاصطناعي اقتراح يخضع لمراجعة الباحث ولا يغيّر النتائج المحسوبة." : "Methodological caution: frequencies, contexts, and N-grams must be interpreted in light of corpus size, collection method, and the research question. AI-supported interpretation is a suggestion subject to researcher review and does not alter computed results."}</p>
          </> : <DataSourceIndicator language={language} mode={context ? "projectContext" : "standalone"} />}
        </div>

        {projectHandoff && <section className={styles.toolDirectory}><div><p className={styles.sectionLabel}>{language === "ar" ? "سياق مشروع وارد" : "INCOMING PROJECT CONTEXT"}</p><h2>{language === "ar" ? "راجع قبل دمج السياق" : "Review before merging context"}</h2><p>{language === "ar" ? "لم تُستبدل حالة التحليل الحالية. لن تُستخدم المعلومات إلا بعد قبولك." : "The current Analyze state has not been replaced. Nothing is used until you accept it."}</p><pre dir="ltr">{JSON.stringify(incomingHandoffPreview(projectHandoff).payload, null, 2)}</pre></div><div className={styles.toolLinks}><button type="button" onClick={mergeProjectContext}>{language === "ar" ? "قبول ودمج" : "Accept and merge"}</button><button type="button" onClick={() => setProjectHandoff(null)}>{language === "ar" ? "تجاهل" : "Keep current state"}</button></div></section>}

        {!isCorpusInterpretation && !hasSelectedResearchPath && <section className={styles.toolDirectory} aria-labelledby="corpus-tools-title">
          <div>
            <p className={styles.sectionLabel}>{language === "ar" ? "أدوات التحليل" : "ANALYSIS TOOLS"}</p>
            <h2 id="corpus-tools-title">{language === "ar" ? "لسانيات المدونات (Corpus Linguistics)" : "Corpus Linguistics"}</h2>
            <p>{language === "ar" ? "افتح مركز المسار لاختيار تحليل التكرار أو السياقات أو المتتاليات اللفظية، ثم استخدم مفسّر النتائج البحثية كمرحلة لاحقة عند الحاجة." : "Open the path hub to choose Frequency Analysis, Concordance / Contexts, or N-grams, then use the AI Research Interpreter as a later stage when needed."}</p>
          </div>
          <div className={styles.toolLinks}>
            <Link href="/research-paths/corpus-linguistics">{language === "ar" ? "استكشف مسار لسانيات المدونات" : "Explore Corpus Linguistics"} <span aria-hidden="true">↗</span></Link>
          </div>
        </section>}

        {!isCorpusInterpretation && <section
          className={styles.planner}
          aria-labelledby="planner-title"
        >
          <div className={styles.plannerHeader}>
            <div>
              <p className={styles.sectionLabel}>
                {t("analyze.workflowLabel")}
              </p>
              <h2 id="planner-title">{t("analyze.planTitle")}</h2>
            </div>

            <div className={styles.metrics}>
              <div>
                <span>{t("analyze.confidence")}</span>
                <strong>{plan.confidence}%</strong>
              </div>

              <div>
                <span>{t("analyze.estimatedTime")}</span>
                <strong>{t("analyze.minutes")}</strong>
              </div>
            </div>
          </div>

          <div className={styles.steps}>
            {plan.steps.map((step) => (
              <article className={styles.step} key={step.number}>
                <span className={styles.stepNumber}>
                  {step.number}
                </span>

                <div>
                  <span className={styles.stepStatus}>
                    {stepText(Number(step.number) - 1, 2)}
                  </span>
                  <h3>{stepText(Number(step.number) - 1, 0)}</h3>
                  <p>{stepText(Number(step.number) - 1, 1)}</p>
                </div>
              </article>
            ))}
          </div>

          <div className={styles.plannerFooter}>
            <p>
              {t("analyze.plannerNote")}
            </p>

            <button
              type="button"
              onClick={startWorkflow}
              className={styles.primaryButton}
            >
              {t("analyze.start")}
              <span aria-hidden="true">↘</span>
            </button>
          </div>
        </section>}

        <section
          className={styles.analysisSection}
          id="quick-analysis"
        >
          <div className={styles.analysisIntro}>
            <p className={styles.sectionLabel}>{isCorpusInterpretation ? (language === "ar" ? "التفسير المرتبط بالنتيجة" : "RESULT-BOUND INTERPRETATION") : t("analyze.quickLabel")}</p>
            <h2>{isCorpusInterpretation ? (language === "ar" ? "راجع النتيجة الفعلية ثم اطلب تفسيرها" : "Review the actual result, then request interpretation") : t("analyze.quickTitle")}</h2>
            <p>{isCorpusInterpretation ? (language === "ar" ? "تبقى النتيجة المحسوبة منفصلة عن التفسير المدعوم بالذكاء الاصطناعي، ويظل اعتماد الاستنتاج للباحث." : "The computed result remains separate from AI-supported interpretation; the researcher decides whether to accept the conclusion.") : t("analyze.quickText")}</p>
          </div>

          <div className={styles.analysisGrid}>
            {isCorpusInterpretation ? <ContextualCorpusResult handoff={sourceAnalysis} language={language} /> : <>
            <div className={styles.inputCard}>
              <label htmlFor="analysis-text">{t("analyze.sample")}</label>

              <textarea
                id="analysis-text"
                placeholder={t("analyze.placeholder")}
                dir="auto"
                value={text}
                onChange={(event) => {
                  setText(event.target.value);
                  setSourceAnalysis(null);
                }}
              />

              <button
                type="button"
                onClick={analyzeText}
                className={styles.secondaryButton}
                disabled={!text.trim()}
              >
                {t("analyze.run")}
              </button>
            </div>

            <div
              className={styles.resultCard}
              aria-live="polite"
            >
              {!result ? (
                <div className={styles.emptyState}>
                  <span>✦</span>
                  <h3>{t("analyze.emptyTitle")}</h3>
                  <p>{t("analyze.emptyText")}</p>
                </div>
              ) : (
                <>
                  <p className={styles.sectionLabel}>
                    {t("analyze.complete")}
                  </p>

                  <div className={styles.statGrid}>
                    <div>
                      <span>{t("analyze.words")}</span>
                      <strong>{result.wordCount.toLocaleString(language)}</strong>
                    </div>

                    <div>
                      <span>{t("analyze.sentences")}</span>
                      <strong>{result.sentenceCount.toLocaleString(language)}</strong>
                    </div>
                  </div>

                  <h3>{t("analyze.frequent")}</h3>

                  {result.topWords.length ? (
                    <ol className={styles.wordList}>
                      {result.topWords.map(([word, count]) => (
                        <li key={word}>
                          <span dir="auto">{word}</span>
                          <strong>{count}</strong>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p>{t("analyze.none")}</p>
                  )}
                </>
              )}
            </div>
            </>}
          </div>

          {result && (
            <section
              className={styles.interpreterCard}
              aria-labelledby="interpreter-title"
            >
              <div
                className={styles.interpreterIcon}
                aria-hidden="true"
              >
                ✦
              </div>

              <div className={styles.interpreterCopy}>
                <p className={styles.sectionLabel}>
                  {t("analyze.interpreterLabel")}
                </p>

                <h2 id="interpreter-title">
                  {t("analyze.interpreterTitle")}
                </h2>

                <p>
                  {t("analyze.interpreterText")}
                </p>
              </div>

              <button
                type="button"
                className={styles.interpreterButton}
                onClick={interpretResults}
                disabled={loadingInterpretation}
              >
                {loadingInterpretation
                  ? t("analyze.interpreting")
                  : t("analyze.interpret")}
                <span aria-hidden="true">✦</span>
              </button>
            </section>
          )}

          {interpretationError && (
            <div
              className={styles.resultCard}
              role="alert"
              aria-live="assertive"
            >
              <p className={styles.sectionLabel}>
                {t("analyze.errorLabel")}
              </p>
              <h3>{t("analyze.errorTitle")}</h3>
              <p dir="auto">{interpretationError}</p>
            </div>
          )}

          <ProgressiveAiOutput
            text={progressText}
            language={language}
            active={loadingInterpretation}
            label={t("analyze.interpreting")}
          />

          {isCorpusInterpretation && <div className={styles.contextActions}>
            <Link href={sourceAnalysis.returnHref || SOURCE_ROUTES[sourceAnalysis.sourceTool]}>{language === "ar" ? "العودة إلى النتائج" : "Back to results"}</Link>
            <Link href="/research-paths/corpus-linguistics">{language === "ar" ? "العودة إلى مسار لسانيات المدونات" : "Back to Corpus Linguistics path"}</Link>
            {interpretation && <button type="button" onClick={generateInterpretationReport}>{language === "ar" ? "إعداد التقرير البحثي" : "Prepare research report"}</button>}
          </div>}

          {interpretation && (
            <section
              className={styles.resultCard}
              aria-labelledby="interpretation-title"
              aria-live="polite"
            >
              <p className={styles.sectionLabel}>
                {t("analyze.resultLabel")}
              </p>

              <h2 id="interpretation-title">
                {t("analyze.resultTitle")}
              </h2>

              {interpretation.mode === "preview" && (
                <p>
                  {t("analyze.preview")}
                </p>
              )}

              <div>
                <h3>{t("analyze.interpretation")}</h3>
                <p dir="auto">
                  {interpretation.interpretation ||
                    t("analyze.noInterpretation")}
                </p>
              </div>

              <div>
                <h3>{t("analyze.methodology")}</h3>
                <p dir="auto">
                  {methodology ||
                    t("analyze.noMethodology")}
                </p>
              </div>

              <div>
                <h3>{t("analyze.limitations")}</h3>
                <p dir="auto">
                  {interpretation.limitations ||
                    t("analyze.noLimitations")}
                </p>
              </div>

              <div>
                <h3>{t("analyze.next")}</h3>
                <p dir="auto">
                  {nextStep ||
                    t("analyze.noNext")}
                </p>
              </div>

              <div>
                <h3>{t("analyze.draft")}</h3>
                <p dir="auto">
                  {paperParagraph ||
                    t("analyze.noDraft")}
                </p>
              </div>

              {!isCorpusInterpretation && <button type="button" className={styles.interpreterButton} onClick={generateInterpretationReport}>
                {language === "ar" ? "إنشاء تقرير" : "Generate Report"}
              </button>}
            </section>
          )}
          {result && !isCorpusInterpretation && <section className={styles.toolDirectory}><div><p className={styles.sectionLabel}>{language === "ar" ? "الخطوة المالكة التالية" : "NEXT OWNER-SPECIFIC STEP"}</p><h2>{language === "ar" ? "تابع المشروع دون إعادة بناء النتيجة" : "Continue without rebuilding the result"}</h2><p>{language === "ar" ? "عدّل التنفيذ في أداة بناء الكود، أو استخدم ملخص النتيجة في تصميم البحث ومنهجيته." : "Revise implementation in Code Builder, or use the result summary in Research for study design and methodology."}</p></div><div className={styles.toolLinks}><button type="button" onClick={() => setProjectTarget("code")}>{language === "ar" ? "التعديل في أداة بناء الكود" : "Modify in Code Builder"}</button><button type="button" onClick={() => setProjectTarget("research")}>{language === "ar" ? "الاستخدام في البحث" : "Use in Research"}</button></div>{projectTarget && <div><p>{language === "ar" ? "ستُنقل النتيجة المنظمة فقط، ولن يُنقل النص الخام تلقائيًا." : "Only structured result context will transfer; raw text is not transferred automatically."}</p><button type="button" onClick={() => transferProject(projectTarget)}>{language === "ar" ? "تأكيد النقل" : "Confirm transfer"}</button><button type="button" onClick={() => setProjectTarget("")}>{language === "ar" ? "إلغاء" : "Cancel"}</button></div>}</section>}
        </section>
      </main>
    </>
  );
}

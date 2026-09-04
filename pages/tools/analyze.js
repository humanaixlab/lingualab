import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { readResearchContext, analyzeContext } from "../../lib/research-context";
import styles from "../../styles/Analyze.module.css";
import { useLanguage } from "../../components/LanguageProvider";

const DEFAULT_PLAN = {
  variant: "default",
  eyebrowVariant: "default",
  eyebrow: "AI ANALYSIS PLANNER",
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

const CORPUS_TOOLS = [
  { href: "/tools/frequency", en: "Frequency Analysis", ar: "تحليل التكرار" },
  { href: "/tools/concordance", en: "Contexts", ar: "السياقات" },
  { href: "/tools/ngrams", en: "N-grams", ar: "المتتاليات اللفظية" },
  { href: "/tools/pos", en: "Parts of Speech Analysis (POS)", ar: "تحليل أقسام الكلام (POS)" },
];

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
      ? "AI ANALYSIS PLANNER · ARABIC DATA"
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
  const [context, setContext] = useState(null);
  const router = useRouter();
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setContext(analyzeContext(readResearchContext(window.location.search))));
    return () => window.cancelAnimationFrame(frame);
  }, [router.asPath]);

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
    setLoadingInterpretation(false);

    const words = text.trim().split(/\s+/);
    const sentences = text.split(/[.!؟]/);
    const wordCount = words.filter(Boolean).length;
    const sentenceCount = sentences.filter(
      (sentence) => sentence.trim()
    ).length;
    const frequency = {};

    words.forEach((word) => {
      const clean = word
        .toLowerCase()
        .replace(/[،؛:!?.,"'()\[\]]/g, "");

      if (clean) {
        frequency[clean] = (frequency[clean] || 0) + 1;
      }
    });

    const topWords = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    setResult({
      wordCount,
      sentenceCount,
      topWords,
    });
  };

const interpretResults = async () => {
  if (!result || loadingInterpretation) return;

  setLoadingInterpretation(true);
  setInterpretationError("");

  try {
    const response = await fetch("/api/research-interpreter", {
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
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error ||
          data?.message ||
          "LinguaLab could not interpret these findings."
      );
    }

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

    setInterpretationError(
      error instanceof Error
        ? error.message
        : "LinguaLab could not interpret these findings."
    );
  } finally {
    setLoadingInterpretation(false);
  }
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
            <Link href="/workspace">{t("nav.workspace")}</Link>
            <Link href="/research-advisor">{t("nav.researchAdvisor")}</Link>
          </div>
        </nav>

        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{planText("eyebrow")}</p>
            <h1>{planText("title")}</h1>
            <p className={styles.lead}>{planText("summary")}</p>
          </div>

          <div className={styles.heroNote}>
            <span>{t("analyze.principleLabel")}</span>
            <strong>{t("analyze.principle")}</strong>
          </div>
        </section>

        <section className={styles.toolDirectory} aria-labelledby="corpus-tools-title">
          <div>
            <p className={styles.sectionLabel}>{language === "ar" ? "أدوات التحليل" : "ANALYSIS TOOLS"}</p>
            <h2 id="corpus-tools-title">{language === "ar" ? "استكشف النص بأدوات المدونة" : "Explore text with corpus tools"}</h2>
            <p>{language === "ar" ? "ابدأ بأداة وصفية، ثم استخدم مفسّر النتائج البحثية كمرحلة مستقلة عند الحاجة." : "Start with a descriptive tool, then use the AI Research Interpreter as a separate next stage when needed."}</p>
          </div>
          <div className={styles.toolLinks}>
            {CORPUS_TOOLS.map((tool) => <Link key={tool.href} href={tool.href}>{tool[language]} <span aria-hidden="true">↗</span></Link>)}
          </div>
        </section>

        <section
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
        </section>

        <section
          className={styles.analysisSection}
          id="quick-analysis"
        >
          <div className={styles.analysisIntro}>
            <p className={styles.sectionLabel}>
              {t("analyze.quickLabel")}
            </p>
            <h2>{t("analyze.quickTitle")}</h2>
            <p>{t("analyze.quickText")}</p>
          </div>

          <div className={styles.analysisGrid}>
            <div className={styles.inputCard}>
              <label htmlFor="analysis-text">{t("analyze.sample")}</label>

              <textarea
                id="analysis-text"
                placeholder={t("analyze.placeholder")}
                dir="auto"
                value={text}
                onChange={(event) => setText(event.target.value)}
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
            </section>
          )}
        </section>
      </main>
    </>
  );
}

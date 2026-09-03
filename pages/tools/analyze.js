import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { readResearchContext, analyzeContext } from "../../lib/research-context";
import styles from "../../styles/Analyze.module.css";

const DEFAULT_PLAN = {
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

function buildPlan(context) {
  if (!context) return DEFAULT_PLAN;

  const description = context.dataDescription || "";
  const hasLabels = /label|class|target|تصنيف|فئة/i.test(description);
  const hasArabic = /Arabic|عربي/i.test(description);

  return {
    ...DEFAULT_PLAN,
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
        <title>AI Analysis Planner | LinguaLab</title>
        <meta
          name="description"
          content="Plan and run a focused Arabic-language analysis workflow with LinguaLab."
        />
      </Head>

      <main className={styles.page}>
        <nav className={styles.nav} aria-label="Primary navigation">
          <Link href="/" className={styles.brand}>
            <span className={styles.brandMark}>L</span>
            <span>LinguaLab</span>
          </Link>

          <div className={styles.navLinks}>
            <Link href="/workspace">Workspace</Link>
            <Link href="/research-advisor">Research Advisor</Link>
          </div>
        </nav>

        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{plan.eyebrow}</p>
            <h1>{plan.title}</h1>
            <p className={styles.lead}>{plan.summary}</p>
          </div>

          <div className={styles.heroNote}>
            <span>RESEARCH PRINCIPLE</span>
            <strong>
              Choose the next analysis because it answers the question—not
              because the tool exists.
            </strong>
          </div>
        </section>

        <section
          className={styles.planner}
          aria-labelledby="planner-title"
        >
          <div className={styles.plannerHeader}>
            <div>
              <p className={styles.sectionLabel}>
                RECOMMENDED WORKFLOW
              </p>
              <h2 id="planner-title">Your analysis plan</h2>
            </div>

            <div className={styles.metrics}>
              <div>
                <span>Confidence</span>
                <strong>{plan.confidence}%</strong>
              </div>

              <div>
                <span>Estimated time</span>
                <strong>{plan.estimatedTime}</strong>
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
                    {step.status}
                  </span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </article>
            ))}
          </div>

          <div className={styles.plannerFooter}>
            <p>
              The planner guides the sequence. You remain in control of
              the interpretation and research claim.
            </p>

            <button
              type="button"
              onClick={startWorkflow}
              className={styles.primaryButton}
            >
              Start recommended workflow
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
              01 · TEXT PROFILE
            </p>
            <h2>Run a quick text analysis</h2>
            <p>
              Paste a sample to establish its size and most frequent
              words before moving to deeper analysis.
            </p>
          </div>

          <div className={styles.analysisGrid}>
            <div className={styles.inputCard}>
              <label htmlFor="analysis-text">Text sample</label>

              <textarea
                id="analysis-text"
                placeholder="Paste Arabic or English text here..."
                value={text}
                onChange={(event) => setText(event.target.value)}
              />

              <button
                type="button"
                onClick={analyzeText}
                className={styles.secondaryButton}
                disabled={!text.trim()}
              >
                Analyze text
              </button>
            </div>

            <div
              className={styles.resultCard}
              aria-live="polite"
            >
              {!result ? (
                <div className={styles.emptyState}>
                  <span>✦</span>
                  <h3>Your first evidence appears here.</h3>
                  <p>
                    Run the text profile to reveal counts and
                    recurring language signals.
                  </p>
                </div>
              ) : (
                <>
                  <p className={styles.sectionLabel}>
                    ANALYSIS COMPLETE
                  </p>

                  <div className={styles.statGrid}>
                    <div>
                      <span>Words</span>
                      <strong>{result.wordCount}</strong>
                    </div>

                    <div>
                      <span>Sentences</span>
                      <strong>{result.sentenceCount}</strong>
                    </div>
                  </div>

                  <h3>Most frequent words</h3>

                  {result.topWords.length ? (
                    <ol className={styles.wordList}>
                      {result.topWords.map(([word, count]) => (
                        <li key={word}>
                          <span>{word}</span>
                          <strong>{count}</strong>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p>No recurring words were found.</p>
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
                  AI RESEARCH INTERPRETER
                </p>

                <h2 id="interpreter-title">
                  Turn descriptive results into research meaning.
                </h2>

                <p>
                  LinguaLab can interpret the pattern, identify
                  methodological limits, recommend the next analysis,
                  and draft a research-ready paragraph.
                </p>
              </div>

              <button
                type="button"
                className={styles.interpreterButton}
                onClick={interpretResults}
                disabled={loadingInterpretation}
              >
                {loadingInterpretation
                  ? "Interpreting..."
                  : "Interpret results"}
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
                INTERPRETATION ERROR
              </p>
              <h3>LinguaLab could not interpret the results.</h3>
              <p>{interpretationError}</p>
            </div>
          )}

          {interpretation && (
            <section
              className={styles.resultCard}
              aria-labelledby="interpretation-title"
              aria-live="polite"
            >
              <p className={styles.sectionLabel}>
                AI RESEARCH INTERPRETATION
              </p>

              <h2 id="interpretation-title">
                What these findings may mean
              </h2>

              {interpretation.mode === "preview" && (
                <p>
                  Preview mode is active. Add an OpenAI API key to
                  generate a model-based interpretation.
                </p>
              )}

              <div>
                <h3>Interpretation</h3>
                <p>
                  {interpretation.interpretation ||
                    "No interpretation was returned."}
                </p>
              </div>

              <div>
                <h3>Methodological implications</h3>
                <p>
                  {methodology ||
                    "No methodological implications were returned."}
                </p>
              </div>

              <div>
                <h3>Limitations</h3>
                <p>
                  {interpretation.limitations ||
                    "No limitations were returned."}
                </p>
              </div>

              <div>
                <h3>Recommended next analysis</h3>
                <p>
                  {nextStep ||
                    "No next analysis was returned."}
                </p>
              </div>

              <div>
                <h3>Research-ready paragraph</h3>
                <p>
                  {paperParagraph ||
                    "No draft paragraph was returned."}
                </p>
              </div>
            </section>
          )}
        </section>
      </main>
    </>
  );
}

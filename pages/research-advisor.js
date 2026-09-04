import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "../styles/ResearchAdvisor.module.css";
import { useLanguage } from "../components/LanguageProvider";

const stages = ["idea", "data", "analysis", "interpretation", "writing"];

const examples = [
  {
    key: "sentiment",
    goal: "Compare sentiment patterns in Arabic customer reviews across product categories.",
    data: "A CSV file with 1,200 Arabic reviews, product category, and manually assigned sentiment labels.",
    stage: "analysis",
    question: "Which baseline should I use, and what should I check before training?",
  },
  {
    key: "corpus",
    goal: "Identify recurring themes and expressions in Arabic student reflections.",
    data: "About 250 short, unlabeled reflections collected from one university course.",
    stage: "data",
    question: "Should I use classification, topic exploration, or concordance analysis?",
  },
];

function buildDemoAdvisor(goal, data, stage, t) {
  const stageLabel = stages.includes(stage) ? t(`advisor.stages.${stage}`) : t("advisor.stages.planning");
  return {
    summary: t("advisor.demo.summary", { stage: stageLabel }),
    researchQuestions: [
      t("advisor.demo.q1", { goal }), t("advisor.demo.q2"), t("advisor.demo.q3"),
    ],
    recommendedMethod: data.toLowerCase().includes("label")
      ? t("advisor.demo.supervised") : t("advisor.demo.corpus"),
    steps: [1, 2, 3, 4].map((number) => t(`advisor.demo.s${number}`)),
    nextAction: t("advisor.demo.next"), caution: t("advisor.demo.caution"),
    isPreview: true,
  };
}

export default function ResearchAdvisorPage() {
  const { language, t } = useLanguage();
  const [form, setForm] = useState({
    researchGoal: "",
    dataDescription: "",
    currentStage: "idea",
    question: "",
  });
  const [advisor, setAdvisor] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [datasetContext, setDatasetContext] = useState(null);

  useEffect(() => {
    let frameId;

    try {
      const query = new URLSearchParams(window.location.search);
      const handoffId = query.get("handoffId");
      if (query.get("from") !== "workspace" || !handoffId) return undefined;
      const saved = sessionStorage.getItem("lingualab-advisor-context");
      if (!saved) return undefined;

      const context = JSON.parse(saved);
      if (!context || context.handoffId !== handoffId) return undefined;
      frameId = window.requestAnimationFrame(() => {
        setDatasetContext(context);
        setForm((current) => ({
          ...current,
          dataDescription: [
            `${context.fileName}: ${context.rows.toLocaleString()} records across ${context.columns} columns.`,
            `Arabic script detected in ${context.arabicPercent}% of the sample.`,
            `Detected text column: ${context.textColumn}. Detected label column: ${context.labelColumn}.`,
            `Missing cells: ${context.missingPercent}%. Possible duplicate texts: ${context.duplicateCount}.`,
            `Label distribution: ${context.labelSummary}.`,
            `LinguaLab recommendation: ${context.recommendationTitle} (${context.recommendationType}).`,
          ].join(" "),
          currentStage: "analysis",
          question: current.question || "What is the most defensible next research step for this dataset?",
        }));
      });
    } catch {
      sessionStorage.removeItem("lingualab-advisor-context");
    }

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  const canSubmit = useMemo(
    () => form.researchGoal.trim() && form.dataDescription.trim() && status !== "loading",
    [form, status]
  );

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function loadExample(example) {
    setForm({
      researchGoal: example.goal,
      dataDescription: example.data,
      currentStage: example.stage,
      question: example.question,
    });
    setAdvisor(null);
    setError("");
  }

  function clearDatasetContext() {
    sessionStorage.removeItem("lingualab-advisor-context");
    setDatasetContext(null);
    setForm({ researchGoal: "", dataDescription: "", currentStage: "idea", question: "" });
    setAdvisor(null);
    setError("");
  }

  async function submit(event) {
    event.preventDefault();
    if (!canSubmit) return;

    setStatus("loading");
    setError("");
    setAdvisor(null);

    try {
      const response = await fetch("/api/research-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, uiLanguage: language }),
      });
      const payload = await response.json();

      if (!response.ok) {
        if (response.status === 503) {
          setAdvisor(buildDemoAdvisor(form.researchGoal, form.dataDescription, form.currentStage, t));
          setStatus("preview");
          return;
        }
        throw new Error(payload.error || t("advisor.requestError"));
      }

      setAdvisor(payload.advisor);
      setStatus("success");
    } catch (requestError) {
      setError(requestError.message || t("advisor.genericError"));
      setStatus("error");
    }
  }

  return (
    <>
      <Head>
        <title>{t("advisor.pageTitle")}</title>
        <meta
          name="description"
          content={t("advisor.meta")}
        />
      </Head>

      <main className={styles.page}>
        <nav className={styles.nav}>
          <Link href="/" className={styles.brand}>
            <span className={styles.brandMark}>L</span>
            <span>LinguaLab</span>
          </Link>
          <div className={styles.navActions}>
            <Link href="/workspace">{t("nav.workspace")}</Link>
            <Link href="/ar-tools">{t("nav.researchHub")}</Link>
            <Link href="/research-advisor">{t("nav.researchAdvisor")}</Link>
          </div>
        </nav>

        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>{t("advisor.eyebrow")}</p>
            <h1>{t("advisor.title")}</h1>
            <p className={styles.lead}>{t("advisor.lead")}</p>
          </div>
          <div className={styles.principleCard}>
            <span>{t("advisor.principleLabel")}</span><strong>{t("advisor.principle")}</strong>
          </div>
        </section>

        <section className={styles.workspace}>
          <form className={styles.formCard} onSubmit={submit}>
            <div className={styles.cardHeading}>
              <div>
                <p className={styles.step}>{t("advisor.contextStep")}</p><h2>{t("advisor.contextTitle")}</h2>
              </div>
              <span className={styles.privateBadge}>{t("advisor.private")}</span>
            </div>

            {datasetContext ? (
              <div className={styles.contextBanner}>
                <div>
                  <span>{t("advisor.imported")}</span><strong dir="auto">{datasetContext.fileName}</strong>
                  <small dir="auto">{t("advisor.records", { count: datasetContext.rows.toLocaleString(language), text: datasetContext.textColumn, label: datasetContext.labelColumn })}</small>
                </div>
                <button type="button" onClick={clearDatasetContext}>{t("advisor.clear")}</button>
              </div>
            ) : null}

            <label>
              {t("advisor.goal")}
              <textarea
                name="researchGoal"
                value={form.researchGoal}
                onChange={updateField}
                maxLength={4000}
                placeholder={t("advisor.goalPlaceholder")} dir="auto"
                required
              />
            </label>

            <label>
              {t("advisor.data")}
              <textarea
                name="dataDescription"
                value={form.dataDescription}
                onChange={updateField}
                maxLength={4000}
                placeholder={t("advisor.dataPlaceholder")} dir="auto"
                required
              />
            </label>

            <div className={styles.twoColumns}>
              <label>
                {t("advisor.stage")}
                <select name="currentStage" value={form.currentStage} onChange={updateField}>
                  {stages.map((stage) => (
                    <option key={stage} value={stage}>{t(`advisor.stages.${stage}`)}</option>
                  ))}
                </select>
              </label>

              <label>
                {t("advisor.question")} <span>{t("advisor.optional")}</span>
                <input
                  name="question"
                  value={form.question}
                  onChange={updateField}
                  maxLength={4000}
                  placeholder={t("advisor.questionPlaceholder")} dir="auto"
                />
              </label>
            </div>

            <div className={styles.examples}>
              <span>{t("advisor.try")}</span>
              {examples.map((example) => (
                <button type="button" key={example.key} onClick={() => loadExample(example)}>
                  {t(`advisor.examples.${example.key}`)}
                </button>
              ))}
            </div>

            <button className={styles.submitButton} type="submit" disabled={!canSubmit}>
              {status === "loading" ? t("advisor.loading") : t("advisor.submit")}
              <span aria-hidden="true">↗</span>
            </button>
            {error ? <p className={styles.error} role="alert" dir="auto">{error}</p> : null}
          </form>

          <aside className={styles.resultCard} aria-live="polite">
            {!advisor ? (
              <div className={styles.emptyState}>
                <div className={styles.spark}>✦</div>
                <p className={styles.step}>{t("advisor.responseStep")}</p><h2>{t("advisor.emptyTitle")}</h2><p>{t("advisor.emptyText")}</p>
                <div className={styles.emptyChecklist}>
                  <span>{t("advisor.framing")}</span><span>{t("advisor.methodChoice")}</span><span>{t("advisor.nextAction")}</span><span>{t("advisor.cautionShort")}</span>
                </div>
              </div>
            ) : (
              <div className={styles.advisorOutput}>
                <div className={styles.outputHeader}>
                  <div className={styles.spark}>✦</div>
                  <div>
                    <p className={styles.step}>{t("advisor.recommendation")}</p><h2>{t("advisor.decision")}</h2>
                  </div>
                  {advisor.isPreview ? <span className={styles.previewBadge}>{t("advisor.preview")}</span> : null}
                </div>

                <p className={styles.summary} dir="auto">{advisor.summary}</p>

                <section>
                  <h3>{t("advisor.questions")}</h3>
                  <ol>
                    {advisor.researchQuestions.map((item) => <li key={item} dir="auto">{item}</li>)}
                  </ol>
                </section>

                <section className={styles.methodBox}>
                  <span>{t("advisor.method")}</span><p dir="auto">{advisor.recommendedMethod}</p>
                </section>

                <section>
                  <h3>{t("advisor.workflow")}</h3>
                  <div className={styles.stepsList}>
                    {advisor.steps.map((item, index) => (
                      <div key={item}>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <p dir="auto">{item}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className={styles.nextAction}>
                  <div>
                    <span>{t("advisor.doNext")}</span><strong dir="auto">{advisor.nextAction}</strong>
                  </div>
                  <Link href="/workspace">{t("advisor.openWorkspace")}</Link>
                </section>

                <p className={styles.caution} dir="auto"><strong>{t("advisor.caution")}</strong> {advisor.caution}</p>
              </div>
            )}
          </aside>
        </section>
      </main>
    </>
  );
}

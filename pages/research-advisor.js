import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "../styles/ResearchAdvisor.module.css";

const stages = [
  { value: "idea", label: "Framing the idea" },
  { value: "data", label: "Preparing the data" },
  { value: "analysis", label: "Choosing or running analysis" },
  { value: "interpretation", label: "Interpreting results" },
  { value: "writing", label: "Writing the report" },
];

const examples = [
  {
    label: "Sentiment study",
    goal: "Compare sentiment patterns in Arabic customer reviews across product categories.",
    data: "A CSV file with 1,200 Arabic reviews, product category, and manually assigned sentiment labels.",
    stage: "analysis",
    question: "Which baseline should I use, and what should I check before training?",
  },
  {
    label: "Corpus exploration",
    goal: "Identify recurring themes and expressions in Arabic student reflections.",
    data: "About 250 short, unlabeled reflections collected from one university course.",
    stage: "data",
    question: "Should I use classification, topic exploration, or concordance analysis?",
  },
];

function buildDemoAdvisor(goal, data, stage) {
  const stageLabel = stages.find((item) => item.value === stage)?.label || "research planning";
  return {
    summary: `Your project has a clear direction and is currently at the “${stageLabel}” stage. Before selecting a model, connect the research question to the structure, size, and annotation quality of the data.`,
    researchQuestions: [
      `What observable language pattern would provide evidence for: “${goal}”?`,
      "Which variables or labels are essential, and how were they created?",
      "What comparison or baseline would make the result interpretable?",
    ],
    recommendedMethod: data.toLowerCase().includes("label")
      ? "Start with a transparent supervised baseline, then compare it with a stronger model only after checking label balance and annotation consistency."
      : "Begin with corpus exploration—frequency, concordance, and recurring phrases—before deciding whether a predictive model is justified.",
    steps: [
      "Define one primary research question and one measurable outcome.",
      "Audit missing values, duplicates, Arabic-script consistency, and label distribution.",
      "Create a simple baseline and record the evaluation setup.",
      "Interpret errors and limitations before writing conclusions.",
    ],
    nextAction: "Open the workspace, upload the dataset, and confirm the detected text and label columns.",
    caution: "This preview is a local planning template. Use the AI-generated recommendation only after checking it against your actual dataset and research design.",
    isPreview: true,
  };
}

export default function ResearchAdvisorPage() {
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
        body: JSON.stringify(form),
      });
      const payload = await response.json();

      if (!response.ok) {
        if (response.status === 503) {
          setAdvisor(buildDemoAdvisor(form.researchGoal, form.dataDescription, form.currentStage));
          setStatus("preview");
          return;
        }
        throw new Error(payload.error || "The advisor could not create a plan.");
      }

      setAdvisor(payload.advisor);
      setStatus("success");
    } catch (requestError) {
      setError(requestError.message || "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <>
      <Head>
        <title>AI Research Advisor — LinguaLab</title>
        <meta
          name="description"
          content="Turn an Arabic-language research goal into a clear, defensible next step."
        />
      </Head>

      <main className={styles.page}>
        <nav className={styles.nav}>
          <Link href="/" className={styles.brand}>
            <span className={styles.brandMark}>L</span>
            <span>LinguaLab</span>
          </Link>
          <div className={styles.navActions}>
            <Link href="/workspace">Workspace</Link>
            <Link href="/ar-tools">Research Tools</Link>
            <Link href="/research-advisor">Research Advisor</Link>
          </div>
        </nav>

        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>AI Research Advisor</p>
            <h1>Move from a research idea to a defensible next step.</h1>
            <p className={styles.lead}>
              Describe your goal and data. LinguaLab helps frame the question,
              choose a method, surface risks, and decide what to do next.
            </p>
          </div>
          <div className={styles.principleCard}>
            <span>Research principle</span>
            <strong>Method follows the question—not the other way around.</strong>
          </div>
        </section>

        <section className={styles.workspace}>
          <form className={styles.formCard} onSubmit={submit}>
            <div className={styles.cardHeading}>
              <div>
                <p className={styles.step}>01 · Research context</p>
                <h2>Tell the advisor what you are trying to learn.</h2>
              </div>
              <span className={styles.privateBadge}>No file required</span>
            </div>

            {datasetContext ? (
              <div className={styles.contextBanner}>
                <div>
                  <span>Dataset context imported</span>
                  <strong>{datasetContext.fileName}</strong>
                  <small>{datasetContext.rows.toLocaleString()} records · {datasetContext.textColumn} · {datasetContext.labelColumn}</small>
                </div>
                <button type="button" onClick={clearDatasetContext}>Clear</button>
              </div>
            ) : null}

            <label>
              Research goal
              <textarea
                name="researchGoal"
                value={form.researchGoal}
                onChange={updateField}
                maxLength={4000}
                placeholder="Example: Compare sentiment patterns in Arabic customer reviews..."
                required
              />
            </label>

            <label>
              What data do you have?
              <textarea
                name="dataDescription"
                value={form.dataDescription}
                onChange={updateField}
                maxLength={4000}
                placeholder="Describe the file, number of records, columns, labels, source, and language variety."
                required
              />
            </label>

            <div className={styles.twoColumns}>
              <label>
                Current stage
                <select name="currentStage" value={form.currentStage} onChange={updateField}>
                  {stages.map((stage) => (
                    <option key={stage.value} value={stage.value}>{stage.label}</option>
                  ))}
                </select>
              </label>

              <label>
                Your immediate question <span>(optional)</span>
                <input
                  name="question"
                  value={form.question}
                  onChange={updateField}
                  maxLength={4000}
                  placeholder="What should I do next?"
                />
              </label>
            </div>

            <div className={styles.examples}>
              <span>Try an example:</span>
              {examples.map((example) => (
                <button type="button" key={example.label} onClick={() => loadExample(example)}>
                  {example.label}
                </button>
              ))}
            </div>

            <button className={styles.submitButton} type="submit" disabled={!canSubmit}>
              {status === "loading" ? "Building your research plan…" : "Ask the Research Advisor"}
              <span aria-hidden="true">↗</span>
            </button>
            {error ? <p className={styles.error} role="alert">{error}</p> : null}
          </form>

          <aside className={styles.resultCard} aria-live="polite">
            {!advisor ? (
              <div className={styles.emptyState}>
                <div className={styles.spark}>✦</div>
                <p className={styles.step}>02 · Advisor response</p>
                <h2>Your research roadmap will appear here.</h2>
                <p>
                  You will receive focused research questions, a recommended method,
                  practical steps, and one validity warning.
                </p>
                <div className={styles.emptyChecklist}>
                  <span>Question framing</span>
                  <span>Method choice</span>
                  <span>Next action</span>
                  <span>Research caution</span>
                </div>
              </div>
            ) : (
              <div className={styles.advisorOutput}>
                <div className={styles.outputHeader}>
                  <div className={styles.spark}>✦</div>
                  <div>
                    <p className={styles.step}>LinguaLab recommendation</p>
                    <h2>Your next research decision</h2>
                  </div>
                  {advisor.isPreview ? <span className={styles.previewBadge}>Preview mode</span> : null}
                </div>

                <p className={styles.summary}>{advisor.summary}</p>

                <section>
                  <h3>Questions worth answering</h3>
                  <ol>
                    {advisor.researchQuestions.map((item) => <li key={item}>{item}</li>)}
                  </ol>
                </section>

                <section className={styles.methodBox}>
                  <span>Recommended method</span>
                  <p>{advisor.recommendedMethod}</p>
                </section>

                <section>
                  <h3>Suggested workflow</h3>
                  <div className={styles.stepsList}>
                    {advisor.steps.map((item, index) => (
                      <div key={item}>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <p>{item}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className={styles.nextAction}>
                  <div>
                    <span>Do this next</span>
                    <strong>{advisor.nextAction}</strong>
                  </div>
                  <Link href="/workspace">Open workspace ↗</Link>
                </section>

                <p className={styles.caution}><strong>Research caution:</strong> {advisor.caution}</p>
              </div>
            )}
          </aside>
        </section>
      </main>
    </>
  );
}


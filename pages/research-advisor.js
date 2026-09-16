import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "../styles/ResearchAdvisor.module.css";
import { useLanguage } from "../components/LanguageProvider";
import { normalizeAdvisorUiLanguage } from "../lib/advisor-language";
import { createReportContext } from "../lib/report-context";
import { readResearchContext, researchContextHref } from "../lib/research-context";
import DataSourceIndicator from "../components/DataSourceIndicator";
import PageGuidance from "../components/PageGuidance";
import ProgressiveAiOutput from "../components/ProgressiveAiOutput";
import { fetchAiJson } from "../lib/ai-stream";
import { createProjectHandoff, incomingHandoffPreview, readProjectHandoff } from "../lib/structured-handoff";

const stages = ["idea", "data", "analysis", "interpretation", "writing"];

const GUIDANCE = {
  ar: ["صف هدف البحث والبيانات المتاحة والمرحلة الحالية.", "يقدّم المستشار طريقة وخطوات مقترحة تناسب السياق.", "راجع الافتراضات والقيود والأسئلة المقترحة.", "اعتمد ما يناسب دراستك ثم انتقل إلى التحليل أو التقرير."],
  en: ["Describe the research goal, available data, and current stage.", "The advisor proposes a method and steps suited to that context.", "Review the assumptions, limitations, and suggested questions.", "Accept what fits your study, then continue to analysis or reporting."],
};

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
  const [progressText, setProgressText] = useState("");
  const [datasetContext, setDatasetContext] = useState(null);
  const [projectHandoff, setProjectHandoff] = useState(null);
  const [acceptedProject, setAcceptedProject] = useState(null);
  const [projectTarget, setProjectTarget] = useState("");

  useEffect(() => {
    let frameId;

    try {
      const context = readResearchContext(window.location.search);
      if (!context) return undefined;
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

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setProjectHandoff(readProjectHandoff("research", window.location.search)));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function mergeProjectContext() {
    if (!projectHandoff) return;
    const preview = incomingHandoffPreview(projectHandoff);
    setAcceptedProject({ ...preview, provenance: { ...projectHandoff.provenance, status: "accepted", researcherDecision: "merge" } });
    setForm((current) => {
      const p = projectHandoff.payload;
      const goal = p.phenomenon ? `Study ${p.phenomenon} using the approved computational design.` : p.resultSummary ? `Interpret the available ${p.analysisType || "analysis"} in relation to the research question.` : current.researchGoal;
      const details = [p.operationalDefinition, p.unitOfAnalysis && `Unit: ${p.unitOfAnalysis}`, p.annotationScheme?.length && `Annotation: ${p.annotationScheme.join(", ")}`, p.algorithmSpec, p.resultSummary, p.datasetDescription, ...(p.limitations || []), ...(p.knownLimitations || [])].filter(Boolean).join("\n");
      return {
        ...current,
        researchGoal: current.researchGoal || goal,
        dataDescription: current.dataDescription || details,
        currentStage: current.currentStage && current.currentStage !== "idea"
          ? current.currentStage
          : p.resultSummary ? "interpretation" : "analysis",
      };
    });
    setProjectHandoff(null);
  }

  function transferProject(target) {
    try {
      const payload = target === "nlp-builder"
        ? { researchQuestion: form.researchGoal, linguisticDomain: "To be confirmed from the research question", proposedData: form.dataDescription, methodologicalConstraints: advisor?.caution ? [advisor.caution] : [], knownPhenomenon: form.researchGoal, projectTitle: form.researchGoal.slice(0, 200) }
        : { analysisTask: advisor?.recommendedMethod || form.question || form.researchGoal, datasetContext: form.dataDescription, researchQuestion: form.researchGoal, requestedOutputs: advisor?.steps || [], methodologicalConstraints: advisor?.caution ? [advisor.caution] : [] };
      window.location.href = createProjectHandoff("research", target, payload, { sourceStateId: "research-advisor-current" });
    } catch { setError(t("advisor.genericError")); }
  }

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
    setProgressText("");
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
      const uiLanguage = normalizeAdvisorUiLanguage(language);
      const payload = await fetchAiJson("/api/research-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, uiLanguage }),
      }, setProgressText);

      setAdvisor(payload.advisor);
      setProgressText("");
      setStatus("success");
    } catch (requestError) {
      if (requestError.partialText) setProgressText(requestError.partialText);
      if (/not configured/i.test(requestError.message || "")) {
        setAdvisor(buildDemoAdvisor(form.researchGoal, form.dataDescription, form.currentStage, t));
        setProgressText("");
        setStatus("preview");
        return;
      }
      setError(requestError.message || t("advisor.genericError"));
      setStatus("error");
    }
  }

  function generateAdvisorReport() {
    if (!advisor) return;
    const url = createReportContext("advisor", "methodology", {
      researchGoal: form.researchGoal,
      summary: advisor.summary,
      recommendedMethod: advisor.recommendedMethod,
      workflow: advisor.steps,
      limitations: advisor.caution,
      nextSteps: [advisor.nextAction],
      questions: advisor.researchQuestions,
    });
    if (url) window.location.href = url;
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
            <Link href="/research-planner">{t("nav.researchHub")}</Link>
            <span aria-current="page">{t("nav.researchAdvisor")}</span>
          </div>
        </nav>

        <div style={{ width: "min(1180px, calc(100% - 40px))", margin: "16px auto 0" }}>
          <DataSourceIndicator language={language} mode={datasetContext ? "projectContext" : "standalone"} />
        </div>

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

        <PageGuidance language={language} steps={GUIDANCE[language === "ar" ? "ar" : "en"]} />

        {projectHandoff && <section className={styles.workspace}><div className={styles.formCard}><p className={styles.step}>{language === "ar" ? "سياق مشروع وارد" : "INCOMING PROJECT CONTEXT"}</p><h2>{language === "ar" ? "راجع السياق قبل استخدامه في البحث" : "Review context before using it in Research"}</h2><p>{language === "ar" ? "لن تُستبدل صياغتك الحالية تلقائيًا." : "Your current research form will not be replaced automatically."}</p><pre dir="ltr">{JSON.stringify(incomingHandoffPreview(projectHandoff).payload, null, 2)}</pre><div className={styles.actions}><button type="button" onClick={mergeProjectContext}>{language === "ar" ? "قبول ودمج" : "Accept and merge"}</button><button type="button" onClick={() => setProjectHandoff(null)}>{language === "ar" ? "الاحتفاظ بالحالة الحالية" : "Keep current state"}</button></div></div></section>}

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
            <ProgressiveAiOutput text={progressText} language={language} active={status === "loading"} label={t("advisor.loading")} />
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
                  {datasetContext && <Link href={researchContextHref("/tools/analyze", datasetContext)}>{language === "ar" ? "متابعة تحليل مجموعة البيانات الحالية" : "Continue current dataset analysis"}</Link>}
                </section>

                <p className={styles.caution} dir="auto"><strong>{t("advisor.caution")}</strong> {advisor.caution}</p>
                <button className={styles.submitButton} type="button" onClick={generateAdvisorReport}>
                  {language === "ar" ? "إنشاء تقرير" : "Generate Report"}
                </button>
                <section className={styles.nextAction}>
                  <div><span>{language === "ar" ? "المالك التالي" : "NEXT OWNER"}</span><strong>{language === "ar" ? "انقل فقط المهمة الجديدة المطلوبة" : "Transfer only the new owner-specific task"}</strong></div>
                  <button type="button" onClick={() => setProjectTarget("nlp-builder")}>{language === "ar" ? "تصميم النهج الحاسوبي في NLP Builder" : "Design computational approach in NLP Builder"}</button>
                  <button type="button" onClick={() => setProjectTarget("analyze")}>{language === "ar" ? "التشغيل في Analyze" : "Run in Analyze"}</button>
                </section>
                {acceptedProject && <p className={styles.caution}>{language === "ar" ? "سياق مقبول من" : "Accepted context from"}: {acceptedProject.source} · {acceptedProject.provenance.status}</p>}
                {projectTarget && <section className={styles.methodBox}><span>{language === "ar" ? "معاينة النقل" : "TRANSFER PREVIEW"}</span><p>{projectTarget === "nlp-builder" ? form.researchGoal : form.dataDescription}</p><button type="button" onClick={() => transferProject(projectTarget)}>{language === "ar" ? "تأكيد النقل" : "Confirm transfer"}</button><button type="button" onClick={() => setProjectTarget("")}>{language === "ar" ? "إلغاء" : "Cancel"}</button></section>}
              </div>
            )}
          </aside>
        </section>
      </main>
    </>
  );
}

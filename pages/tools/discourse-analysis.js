import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../components/LanguageProvider";
import {
  DISCOURSE_TOOLS,
  createReviewedCase,
  readReviewedCases,
  saveReviewedCase,
} from "../../lib/discourse-analysis";
import styles from "../../styles/DiscourseAnalysis.module.css";

const TOOL_COPY = {
  stance: {
    ar: { title: "تحليل الموقف", description: "حدّد الموقف المقترح تجاه موضوع بعينه، ثم راجع الدليل النصي." },
    en: { title: "Stance Analysis", description: "Identify a suggested stance toward a specified target, then review its textual evidence." },
  },
  "hedging-assertion": {
    ar: { title: "التحفظ والتوكيد", description: "افحص ما إذا كان النص يعرض تحفظًا أو توكيدًا صريحًا." },
    en: { title: "Hedging and Assertion", description: "Inspect whether the text primarily expresses hedging, assertion, or neither." },
  },
  "discourse-relations": {
    ar: { title: "العلاقات الخطابية", description: "حدّد علاقة خطابية أولية بين عبارتين ظاهرتين في النص." },
    en: { title: "Discourse Relations", description: "Identify one initial discourse relation between two explicit text spans." },
  },
};

const COPY = {
  ar: {
    pageTitle: "تحليل الخطاب · تجريب بحثي",
    back: "العودة إلى مركز البحث",
    eyebrow: "تحليل الخطاب والتداولية",
    title: "مختبر تحليل الخطاب",
    lead: "منطقة تجريب بحثية لترميز ظواهر خطابية محددة بمراجعة الباحث.",
    badge: "تجريب بحثي",
    notice: "هذه الأدوات في مرحلة تجريب بحثي، ومخرجات الذكاء الاصطناعي مقترحات تحليلية تخضع لمراجعة الباحث.",
    choose: "اختر أداة",
    text: "النص العربي",
    textPlaceholder: "ألصق النص العربي المراد تحليله…",
    target: "موقف تجاه / موضوع الموقف",
    targetPlaceholder: "مثال: استخدام الذكاء الاصطناعي في التعليم",
    analyze: "حلّل النص بالذكاء الاصطناعي",
    analyzing: "جارٍ إنشاء الاقتراح…",
    aiSuggestion: "اقتراح الذكاء الاصطناعي",
    category: "الفئة المقترحة",
    evidence: "الدليل النصي",
    firstEvidence: "العبارة الأولى",
    secondEvidence: "العبارة الثانية",
    explanation: "التفسير المختصر",
    review: "مراجعة الباحث",
    accept: "قبول",
    edit: "تعديل",
    reject: "رفض",
    finalCategory: "الفئة النهائية",
    finalEvidence: "الدليل النهائي",
    finalFirst: "العبارة الأولى النهائية",
    finalSecond: "العبارة الثانية النهائية",
    save: "حفظ المراجعة النهائية",
    saved: "حُفظت المراجعة محليًا على هذا الجهاز.",
    storageError: "تعذر حفظ المراجعة محليًا. لم تُحذف نتيجة الذكاء الاصطناعي الحالية.",
    validationError: "اختر نتيجة نهائية صحيحة، وتأكد من أن الأدلة مقتبسة حرفيًا من النص المدخل.",
    requestError: "تعذر إنشاء اقتراح موثوق.",
    summary: "ملخص المراجعات المحلية",
    filter: "تصفية حسب الأداة",
    all: "كل الأدوات",
    total: "إجمالي الحالات المراجعة",
    accepted: "عدد المقبول",
    edited: "عدد المعدل",
    rejected: "عدد المرفوض",
    noCases: "لا توجد حالات مراجعة محفوظة لهذا الاختيار.",
  },
  en: {
    pageTitle: "Discourse Analysis · Research Preview",
    back: "Back to Research Hub",
    eyebrow: "DISCOURSE & PRAGMATICS",
    title: "Discourse Analysis Lab",
    lead: "A research experimentation area for annotating defined discourse phenomena with researcher review.",
    badge: "Research Preview",
    notice: "These tools are in research preview. AI outputs are analytical suggestions that require researcher review.",
    choose: "Choose a tool",
    text: "Arabic text",
    textPlaceholder: "Paste the Arabic text to analyze…",
    target: "Stance toward / stance target",
    targetPlaceholder: "Example: the use of AI in education",
    analyze: "Analyze text with AI",
    analyzing: "Generating suggestion…",
    aiSuggestion: "AI suggestion",
    category: "Suggested category",
    evidence: "Textual evidence",
    firstEvidence: "First span",
    secondEvidence: "Second span",
    explanation: "Short explanation",
    review: "Researcher review",
    accept: "Accept",
    edit: "Modify",
    reject: "Reject",
    finalCategory: "Final category",
    finalEvidence: "Final evidence",
    finalFirst: "Final first span",
    finalSecond: "Final second span",
    save: "Save reviewed annotation",
    saved: "The review was saved locally on this device.",
    storageError: "The review could not be saved locally. The current AI result was not removed.",
    validationError: "Choose a valid final result and copy final evidence exactly from the submitted text.",
    requestError: "A reliable suggestion could not be generated.",
    summary: "Local review summary",
    filter: "Filter by tool",
    all: "All tools",
    total: "Total reviewed cases",
    accepted: "Accepted",
    edited: "Modified",
    rejected: "Rejected",
    noCases: "No saved reviewed cases match this selection.",
  },
};

const EMPTY_EVIDENCE = { primary: "", secondary: "" };

export default function DiscourseAnalysisTool() {
  const { language } = useLanguage();
  const locale = language === "ar" ? "ar" : "en";
  const copy = COPY[locale];
  const [toolId, setToolId] = useState("stance");
  const [text, setText] = useState("");
  const [target, setTarget] = useState("");
  const [aiOutput, setAiOutput] = useState(null);
  const [decision, setDecision] = useState("");
  const [finalCategory, setFinalCategory] = useState("");
  const [finalEvidence, setFinalEvidence] = useState(EMPTY_EVIDENCE);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [cases, setCases] = useState([]);
  const [filter, setFilter] = useState("all");
  const tool = DISCOURSE_TOOLS[toolId];

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const requestedTool = window.location.hash.slice(1);
      if (DISCOURSE_TOOLS[requestedTool]) setToolId(requestedTool);
      setCases(readReviewedCases());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function resetSuggestion() {
    setAiOutput(null);
    setDecision("");
    setFinalCategory("");
    setFinalEvidence(EMPTY_EVIDENCE);
    setStatus("idle");
    setMessage("");
  }

  function changeTool(nextToolId) {
    setToolId(nextToolId);
    resetSuggestion();
  }

  async function analyze(event) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    setAiOutput(null);
    setDecision("");
    try {
      const response = await fetch("/api/discourse-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolId, text, target: tool.requiresTarget ? target : "" }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || copy.requestError);
      setAiOutput(payload.result);
      setFinalCategory(payload.result.category);
      setFinalEvidence({ ...payload.result.evidence });
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setMessage(error.message || copy.requestError);
    }
  }

  function chooseDecision(nextDecision) {
    setDecision(nextDecision);
    setMessage("");
    if (nextDecision === "accept" && aiOutput) {
      setFinalCategory(aiOutput.category);
      setFinalEvidence({ ...aiOutput.evidence });
    } else if (nextDecision === "reject") {
      setFinalCategory("");
      setFinalEvidence(EMPTY_EVIDENCE);
    }
  }

  function saveReview() {
    const record = createReviewedCase({
      toolId,
      text,
      target: tool.requiresTarget ? target : "",
      aiOutput,
      decision,
      finalOutput: { category: finalCategory, evidence: finalEvidence },
    });
    if (!record) {
      setMessage(copy.validationError);
      return;
    }
    const saved = saveReviewedCase(record);
    if (!saved.ok) {
      setMessage(copy.storageError);
      return;
    }
    setCases(saved.cases);
    setMessage(copy.saved);
    setText("");
    setTarget("");
    setAiOutput(null);
    setDecision("");
    setFinalCategory("");
    setFinalEvidence(EMPTY_EVIDENCE);
    setStatus("idle");
  }

  const filteredCases = filter === "all" ? cases : cases.filter((item) => item.toolId === filter);
  const summary = useMemo(() => ({
    total: filteredCases.length,
    accept: filteredCases.filter((item) => item.researcherDecision === "accept").length,
    edit: filteredCases.filter((item) => item.researcherDecision === "edit").length,
    reject: filteredCases.filter((item) => item.researcherDecision === "reject").length,
  }), [filteredCases]);

  const evidenceLabels = tool.requiresSecondEvidence
    ? [copy.firstEvidence, copy.secondEvidence]
    : [copy.evidence];

  return (
    <>
      <Head><title>{copy.pageTitle} · LinguaLab</title></Head>
      <main className={styles.page}>
        <Link className={styles.back} href="/ar-tools#discourse-analysis">← {copy.back}</Link>
        <header className={styles.header}>
          <div><p className={styles.eyebrow}>{copy.eyebrow}</p><h1>{copy.title}</h1><p>{copy.lead}</p></div>
          <span className={styles.previewBadge}>{copy.badge}</span>
        </header>
        <p className={styles.notice}>{copy.notice}</p>

        <section aria-labelledby="discourse-tools-title">
          <h2 id="discourse-tools-title">{copy.choose}</h2>
          <div className={styles.toolTabs} role="tablist" aria-label={copy.choose}>
            {Object.keys(DISCOURSE_TOOLS).map((id) => (
              <button type="button" role="tab" aria-selected={toolId === id} className={toolId === id ? styles.activeTool : ""} onClick={() => changeTool(id)} key={id}>
                <strong>{TOOL_COPY[id][locale].title}</strong><span>{TOOL_COPY[id][locale].description}</span>
              </button>
            ))}
          </div>
        </section>

        <section className={styles.workflow} id={toolId} aria-labelledby="active-tool-title">
          <form className={styles.inputCard} onSubmit={analyze}>
            <div className={styles.cardHeading}><span>01</span><h2 id="active-tool-title">{TOOL_COPY[toolId][locale].title}</h2></div>
            <label>{copy.text}<textarea required dir="rtl" lang="ar" maxLength={12000} value={text} onChange={(event) => { setText(event.target.value); resetSuggestion(); }} placeholder={copy.textPlaceholder} /></label>
            {tool.requiresTarget && <label>{copy.target}<input required dir="auto" maxLength={500} value={target} onChange={(event) => { setTarget(event.target.value); resetSuggestion(); }} placeholder={copy.targetPlaceholder} /></label>}
            <button className={styles.primaryButton} disabled={status === "loading" || !text.trim() || (tool.requiresTarget && !target.trim())}>{status === "loading" ? copy.analyzing : copy.analyze}</button>
            {status === "error" && <p className={styles.error} role="alert">{message}</p>}
          </form>

          {aiOutput && (
            <div className={styles.resultColumn}>
              <article className={styles.aiCard}>
                <div className={styles.cardHeading}><span>02</span><h2>{copy.aiSuggestion}</h2></div>
                <dl><div><dt>{copy.category}</dt><dd>{aiOutput.category}</dd></div>{evidenceLabels.map((label, index) => <div key={label}><dt>{label}</dt><dd dir="auto">{index === 0 ? aiOutput.evidence.primary || "—" : aiOutput.evidence.secondary || "—"}</dd></div>)}<div><dt>{copy.explanation}</dt><dd>{aiOutput.explanation}</dd></div></dl>
              </article>

              <article className={styles.reviewCard}>
                <div className={styles.cardHeading}><span>03</span><h2>{copy.review}</h2></div>
                <div className={styles.decisions} role="group" aria-label={copy.review}>
                  {[["accept", copy.accept], ["edit", copy.edit], ["reject", copy.reject]].map(([value, label]) => <button type="button" aria-pressed={decision === value} onClick={() => chooseDecision(value)} key={value}>{label}</button>)}
                </div>
                {(decision === "edit" || decision === "reject") && <div className={styles.editFields}>
                  <label>{copy.finalCategory}<select value={finalCategory} onChange={(event) => setFinalCategory(event.target.value)}><option value="" disabled>—</option>{tool.categories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
                  <label>{tool.requiresSecondEvidence ? copy.finalFirst : copy.finalEvidence}<textarea dir="rtl" lang="ar" value={finalEvidence.primary} onChange={(event) => setFinalEvidence((current) => ({ ...current, primary: event.target.value }))} /></label>
                  {tool.requiresSecondEvidence && <label>{copy.finalSecond}<textarea dir="rtl" lang="ar" value={finalEvidence.secondary} onChange={(event) => setFinalEvidence((current) => ({ ...current, secondary: event.target.value }))} /></label>}
                </div>}
                {decision && <button type="button" className={styles.primaryButton} onClick={saveReview}>{copy.save}</button>}
                {message && status !== "error" && <p className={message === copy.saved ? styles.success : styles.error} role="status">{message}</p>}
              </article>
            </div>
          )}
        </section>

        <section className={styles.summary} aria-labelledby="review-summary-title">
          <div className={styles.summaryHeader}><h2 id="review-summary-title">{copy.summary}</h2><label>{copy.filter}<select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">{copy.all}</option>{Object.keys(DISCOURSE_TOOLS).map((id) => <option key={id} value={id}>{TOOL_COPY[id][locale].title}</option>)}</select></label></div>
          <div className={styles.metrics}><div><strong>{summary.total}</strong><span>{copy.total}</span></div><div><strong>{summary.accept}</strong><span>{copy.accepted}</span></div><div><strong>{summary.edit}</strong><span>{copy.edited}</span></div><div><strong>{summary.reject}</strong><span>{copy.rejected}</span></div></div>
          {!summary.total && <p className={styles.empty}>{copy.noCases}</p>}
        </section>
      </main>
    </>
  );
}

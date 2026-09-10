import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../components/LanguageProvider";
import {
  PRAGMATICS_TOOLS,
  createPragmaticsReviewedCase,
  readPragmaticsReviewedCases,
  savePragmaticsReviewedCase,
} from "../../lib/pragmatics-analysis";
import styles from "../../styles/DiscourseAnalysis.module.css";

const TOOL_COPY = {
  "speech-acts": {
    ar: { title: "الأفعال الكلامية", description: "حدّد الفعل الكلامي الرئيس والدليل الذي يعبّر عنه." },
    en: { title: "Speech Acts", description: "Identify the primary speech act and the evidence that expresses it." },
  },
  implicature: {
    ar: { title: "الاستلزام الحواري", description: "افحص ما إذا كان النص يوصل معنى مستلزمًا يتجاوز المعنى المباشر." },
    en: { title: "Conversational Implicature", description: "Inspect whether the text conveys an implicated meaning beyond its direct wording." },
  },
  deixis: {
    ar: { title: "الإشارة والسياق", description: "حدّد التعبير الإشاري وفسّر مرجعه السياقي عندما يكون واضحًا." },
    en: { title: "Deixis & Context", description: "Identify a deictic expression and interpret its contextual reference when clear." },
  },
};

const COPY = {
  ar: {
    pageTitle: "التداولية · تجريب بحثي", back: "العودة إلى الخطاب والتداولية", eyebrow: "الخطاب والتداولية", title: "مختبر التداولية",
    lead: "منطقة تجريب بحثية لترميز ظواهر تداولية محددة بمراجعة الباحث.", badge: "تجريب بحثي",
    notice: "هذه الأدوات في مرحلة تجريب بحثي، ومخرجات الذكاء الاصطناعي مقترحات تحليلية تخضع لمراجعة الباحث.",
    choose: "اختر أداة", text: "النص العربي", textPlaceholder: "ألصق النص العربي المراد تحليله…", analyze: "حلّل النص بالذكاء الاصطناعي", analyzing: "جارٍ إنشاء الاقتراح…",
    aiSuggestion: "اقتراح الذكاء الاصطناعي", category: "الفئة المقترحة", evidence: "الدليل النصي", referringExpression: "التعبير الإشاري", inferredMeaning: "المعنى المستلزم", contextualInterpretation: "التفسير السياقي", explanation: "التفسير المختصر",
    review: "مراجعة الباحث", accept: "قبول", edit: "تعديل", reject: "رفض", finalCategory: "الفئة النهائية", finalEvidence: "الدليل النهائي", finalReferringExpression: "التعبير الإشاري النهائي", finalInferredMeaning: "المعنى المستلزم النهائي", finalContextualInterpretation: "التفسير السياقي النهائي",
    save: "حفظ المراجعة النهائية", saved: "حُفظت المراجعة محليًا على هذا الجهاز.", storageError: "تعذر حفظ المراجعة محليًا. لم تُحذف نتيجة الذكاء الاصطناعي الحالية.", validationError: "اختر نتيجة نهائية صحيحة، وتأكد من أن الدليل مقتبس حرفيًا من النص المدخل.", requestError: "تعذر إنشاء اقتراح موثوق.",
    summary: "ملخص المراجعات المحلية", filter: "تصفية حسب الأداة", all: "كل الأدوات", total: "إجمالي الحالات المراجعة", accepted: "عدد المقبول", edited: "عدد المعدل", rejected: "عدد المرفوض", noCases: "لا توجد حالات مراجعة محفوظة لهذا الاختيار.",
  },
  en: {
    pageTitle: "Pragmatics · Research Preview", back: "Back to Discourse & Pragmatics", eyebrow: "DISCOURSE & PRAGMATICS", title: "Pragmatics Lab",
    lead: "A research experimentation area for annotating defined pragmatic phenomena with researcher review.", badge: "Research Preview",
    notice: "These tools are in research preview. AI outputs are analytical suggestions that require researcher review.",
    choose: "Choose a tool", text: "Arabic text", textPlaceholder: "Paste the Arabic text to analyze…", analyze: "Analyze text with AI", analyzing: "Generating suggestion…",
    aiSuggestion: "AI suggestion", category: "Suggested category", evidence: "Textual evidence", referringExpression: "Referring expression", inferredMeaning: "Inferred meaning", contextualInterpretation: "Contextual interpretation", explanation: "Short explanation",
    review: "Researcher review", accept: "Accept", edit: "Modify", reject: "Reject", finalCategory: "Final category", finalEvidence: "Final evidence", finalReferringExpression: "Final referring expression", finalInferredMeaning: "Final inferred meaning", finalContextualInterpretation: "Final contextual interpretation",
    save: "Save reviewed annotation", saved: "The review was saved locally on this device.", storageError: "The review could not be saved locally. The current AI result was not removed.", validationError: "Choose a valid final result and copy final evidence exactly from the submitted text.", requestError: "A reliable suggestion could not be generated.",
    summary: "Local review summary", filter: "Filter by tool", all: "All tools", total: "Total reviewed cases", accepted: "Accepted", edited: "Modified", rejected: "Rejected", noCases: "No saved reviewed cases match this selection.",
  },
};

export default function PragmaticsTool() {
  const { language } = useLanguage();
  const locale = language === "ar" ? "ar" : "en";
  const copy = COPY[locale];
  const [toolId, setToolId] = useState("speech-acts");
  const [text, setText] = useState("");
  const [aiOutput, setAiOutput] = useState(null);
  const [decision, setDecision] = useState("");
  const [finalCategory, setFinalCategory] = useState("");
  const [finalEvidence, setFinalEvidence] = useState("");
  const [finalInterpretation, setFinalInterpretation] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [cases, setCases] = useState([]);
  const [filter, setFilter] = useState("all");
  const tool = PRAGMATICS_TOOLS[toolId];

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const requestedTool = window.location.hash.slice(1);
      if (PRAGMATICS_TOOLS[requestedTool]) setToolId(requestedTool);
      setCases(readPragmaticsReviewedCases());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function resetSuggestion() {
    setAiOutput(null); setDecision(""); setFinalCategory(""); setFinalEvidence(""); setFinalInterpretation(""); setStatus("idle"); setMessage("");
  }
  function changeTool(nextToolId) { setToolId(nextToolId); resetSuggestion(); }

  async function analyze(event) {
    event.preventDefault(); setStatus("loading"); setMessage(""); setAiOutput(null); setDecision("");
    try {
      const response = await fetch("/api/pragmatics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ toolId, text }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || copy.requestError);
      setAiOutput(payload.result); setFinalCategory(payload.result.category); setFinalEvidence(payload.result.evidence); setFinalInterpretation(payload.result.interpretation || ""); setStatus("success");
    } catch (error) { setStatus("error"); setMessage(error.message || copy.requestError); }
  }

  function chooseDecision(nextDecision) {
    setDecision(nextDecision); setMessage("");
    if (nextDecision === "accept" && aiOutput) {
      setFinalCategory(aiOutput.category); setFinalEvidence(aiOutput.evidence); setFinalInterpretation(aiOutput.interpretation || "");
    } else if (nextDecision === "reject") {
      setFinalCategory(""); setFinalEvidence(""); setFinalInterpretation("");
    }
  }

  function saveReview() {
    const record = createPragmaticsReviewedCase({
      toolId, text, aiOutput, decision,
      finalOutput: { category: finalCategory, evidence: finalEvidence, interpretation: finalInterpretation },
    });
    if (!record) { setMessage(copy.validationError); return; }
    const saved = savePragmaticsReviewedCase(record);
    if (!saved.ok) { setMessage(copy.storageError); return; }
    setCases(saved.cases); setMessage(copy.saved); setText(""); setAiOutput(null); setDecision(""); setFinalCategory(""); setFinalEvidence(""); setFinalInterpretation(""); setStatus("idle");
  }

  const filteredCases = filter === "all" ? cases : cases.filter((item) => item.toolId === filter);
  const summary = useMemo(() => ({
    total: filteredCases.length,
    accept: filteredCases.filter((item) => item.researcherDecision === "accept").length,
    edit: filteredCases.filter((item) => item.researcherDecision === "edit").length,
    reject: filteredCases.filter((item) => item.researcherDecision === "reject").length,
  }), [filteredCases]);
  const evidenceLabel = toolId === "deixis" ? copy.referringExpression : copy.evidence;
  const finalEvidenceLabel = toolId === "deixis" ? copy.finalReferringExpression : copy.finalEvidence;
  const interpretationLabel = toolId === "implicature" ? copy.inferredMeaning : copy.contextualInterpretation;
  const finalInterpretationLabel = toolId === "implicature" ? copy.finalInferredMeaning : copy.finalContextualInterpretation;

  return <>
    <Head><title>{copy.pageTitle} · LinguaLab</title></Head>
    <main className={styles.page}>
      <Link className={styles.back} href="/ar-tools#discourse-pragmatics">← {copy.back}</Link>
      <header className={styles.header}><div><p className={styles.eyebrow}>{copy.eyebrow}</p><h1>{copy.title}</h1><p>{copy.lead}</p></div><span className={styles.previewBadge}>{copy.badge}</span></header>
      <p className={styles.notice}>{copy.notice}</p>
      <section aria-labelledby="pragmatics-tools-title"><h2 id="pragmatics-tools-title">{copy.choose}</h2><div className={styles.toolTabs} role="tablist" aria-label={copy.choose}>
        {Object.keys(PRAGMATICS_TOOLS).map((id) => <button type="button" role="tab" aria-selected={toolId === id} className={toolId === id ? styles.activeTool : ""} onClick={() => changeTool(id)} key={id}><strong>{TOOL_COPY[id][locale].title}</strong><span>{TOOL_COPY[id][locale].description}</span></button>)}
      </div></section>
      <section className={styles.workflow} id={toolId} aria-labelledby="active-pragmatics-tool-title">
        <form className={styles.inputCard} onSubmit={analyze}><div className={styles.cardHeading}><span>01</span><h2 id="active-pragmatics-tool-title">{TOOL_COPY[toolId][locale].title}</h2></div>
          <label>{copy.text}<textarea required dir="rtl" lang="ar" maxLength={12000} value={text} onChange={(event) => { setText(event.target.value); resetSuggestion(); }} placeholder={copy.textPlaceholder} /></label>
          <button className={styles.primaryButton} disabled={status === "loading" || !text.trim()}>{status === "loading" ? copy.analyzing : copy.analyze}</button>
          {status === "error" && <p className={styles.error} role="alert">{message}</p>}
        </form>
        {aiOutput && <div className={styles.resultColumn}>
          <article className={styles.aiCard}><div className={styles.cardHeading}><span>02</span><h2>{copy.aiSuggestion}</h2></div><dl>
            <div><dt>{copy.category}</dt><dd>{aiOutput.category}</dd></div><div><dt>{evidenceLabel}</dt><dd dir="auto">{aiOutput.evidence || "—"}</dd></div>
            {tool.requiresInterpretation && <div><dt>{interpretationLabel}</dt><dd dir="auto">{aiOutput.interpretation || "—"}</dd></div>}<div><dt>{copy.explanation}</dt><dd>{aiOutput.explanation}</dd></div>
          </dl></article>
          <article className={styles.reviewCard}><div className={styles.cardHeading}><span>03</span><h2>{copy.review}</h2></div>
            <div className={styles.decisions} role="group" aria-label={copy.review}>{[["accept", copy.accept], ["edit", copy.edit], ["reject", copy.reject]].map(([value, label]) => <button type="button" aria-pressed={decision === value} onClick={() => chooseDecision(value)} key={value}>{label}</button>)}</div>
            {(decision === "edit" || decision === "reject") && <div className={styles.editFields}>
              <label>{copy.finalCategory}<select value={finalCategory} onChange={(event) => setFinalCategory(event.target.value)}><option value="" disabled>—</option>{tool.categories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
              <label>{finalEvidenceLabel}<textarea dir="rtl" lang="ar" value={finalEvidence} onChange={(event) => setFinalEvidence(event.target.value)} /></label>
              {tool.requiresInterpretation && <label>{finalInterpretationLabel}<textarea dir="auto" value={finalInterpretation} onChange={(event) => setFinalInterpretation(event.target.value)} /></label>}
            </div>}
            {decision && <button type="button" className={styles.primaryButton} onClick={saveReview}>{copy.save}</button>}
            {message && status !== "error" && <p className={message === copy.saved ? styles.success : styles.error} role="status">{message}</p>}
          </article>
        </div>}
      </section>
      <section className={styles.summary} aria-labelledby="pragmatics-review-summary-title"><div className={styles.summaryHeader}><h2 id="pragmatics-review-summary-title">{copy.summary}</h2><label>{copy.filter}<select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">{copy.all}</option>{Object.keys(PRAGMATICS_TOOLS).map((id) => <option key={id} value={id}>{TOOL_COPY[id][locale].title}</option>)}</select></label></div>
        <div className={styles.metrics}><div><strong>{summary.total}</strong><span>{copy.total}</span></div><div><strong>{summary.accept}</strong><span>{copy.accepted}</span></div><div><strong>{summary.edit}</strong><span>{copy.edited}</span></div><div><strong>{summary.reject}</strong><span>{copy.rejected}</span></div></div>{!summary.total && <p className={styles.empty}>{copy.noCases}</p>}
      </section>
    </main>
  </>;
}

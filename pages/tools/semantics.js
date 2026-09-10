import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../components/LanguageProvider";
import {
  SEMANTICS_TOOLS,
  createSemanticsReviewedCase,
  readSemanticsReviewedCases,
  saveSemanticsReviewedCase,
} from "../../lib/semantics-analysis";
import styles from "../../styles/DiscourseAnalysis.module.css";

const TOOL_COPY = {
  similarity: {
    ar: { title: "التشابه الدلالي", description: "قارن نصين عربيين وحدّد درجة التشابه الدلالي بينهما." },
    en: { title: "Semantic Similarity", description: "Compare two Arabic texts and identify their degree of semantic similarity." },
  },
  topic: {
    ar: { title: "اكتشاف الموضوع", description: "اقترح تسمية موجزة للموضوع الرئيس مدعومة بدليل من النص." },
    en: { title: "Topic Discovery", description: "Suggest one concise main-topic label supported by textual evidence." },
  },
  grouping: {
    ar: { title: "التجميع الدلالي", description: "اجمع نصوصًا عربية قصيرة في مجموعات قائمة على تقارب المعنى." },
    en: { title: "Semantic Grouping", description: "Group short Arabic texts according to meaning-based similarity." },
  },
};

const COPY = {
  ar: {
    pageTitle: "الدلالة · تجريب بحثي", back: "العودة إلى مركز البحث", eyebrow: "الدلالة", title: "مختبر الدلالة",
    lead: "منطقة تجريب بحثية لفحص التشابه والموضوعات والتجمعات الدلالية بمراجعة الباحث.", badge: "تجريب بحثي",
    notice: "المخرجات مقترحات تحليلية مدعومة بالذكاء الاصطناعي، ويظل الباحث مسؤولًا عن التحقق من النتائج واعتمادها في الاستخدام البحثي.",
    choose: "اختر أداة", firstText: "النص العربي الأول", secondText: "النص العربي الثاني", text: "النص العربي", texts: "النصوص العربية القصيرة", textPlaceholder: "ألصق النص العربي هنا…", textsPlaceholder: "أدخل نصًا قصيرًا في كل سطر…",
    analyze: "حلّل بالذكاء الاصطناعي", analyzing: "جارٍ إنشاء الاقتراح…", aiSuggestion: "اقتراح الذكاء الاصطناعي", category: "درجة التشابه", topic: "الموضوع المقترح", evidence: "الدليل النصي", firstEvidence: "دليل من النص الأول", secondEvidence: "دليل من النص الثاني", explanation: "التفسير المختصر", groups: "المجموعات المقترحة", groupLabel: "تسمية المجموعة", assignedTexts: "النصوص المسندة", rationale: "المسوغ المختصر",
    review: "مراجعة الباحث", accept: "قبول", edit: "تعديل", reject: "رفض", finalCategory: "درجة التشابه النهائية", finalTopic: "الموضوع النهائي", finalEvidence: "الدليل النهائي", finalFirstEvidence: "الدليل النهائي من النص الأول", finalSecondEvidence: "الدليل النهائي من النص الثاني", finalGroups: "المجموعات النهائية",
    save: "حفظ المراجعة النهائية", saved: "حُفظت المراجعة محليًا على هذا الجهاز.", storageError: "تعذر الحفظ محليًا، ولم تُحذف نتيجة الذكاء الاصطناعي.", validationError: "أدخل نتيجة نهائية صحيحة ومسنَدة إلى النصوص الأصلية.", requestError: "تعذر إنشاء اقتراح موثوق.",
    summary: "ملخص المراجعات المحلية", filter: "تصفية حسب الأداة", all: "كل الأدوات", total: "إجمالي الحالات المراجعة", accepted: "عدد المقبول", edited: "عدد المعدل", rejected: "عدد المرفوض", noCases: "لا توجد حالات مراجعة محفوظة لهذا الاختيار.",
  },
  en: {
    pageTitle: "Semantics · Research Preview", back: "Back to Research Hub", eyebrow: "SEMANTICS", title: "Semantics Lab",
    lead: "A research experimentation area for reviewing semantic similarity, topic, and grouping suggestions.", badge: "Research Preview",
    notice: "Outputs are AI-supported analytical suggestions. The researcher remains responsible for verifying and approving results for research use.",
    choose: "Choose a tool", firstText: "First Arabic text", secondText: "Second Arabic text", text: "Arabic text", texts: "Short Arabic texts", textPlaceholder: "Paste Arabic text here…", textsPlaceholder: "Enter one short text per line…",
    analyze: "Analyze with AI", analyzing: "Generating suggestion…", aiSuggestion: "AI suggestion", category: "Similarity category", topic: "Suggested topic", evidence: "Textual evidence", firstEvidence: "Evidence from first text", secondEvidence: "Evidence from second text", explanation: "Short explanation", groups: "Suggested groups", groupLabel: "Group label", assignedTexts: "Assigned texts", rationale: "Short rationale",
    review: "Researcher review", accept: "Accept", edit: "Modify", reject: "Reject", finalCategory: "Final similarity category", finalTopic: "Final topic", finalEvidence: "Final evidence", finalFirstEvidence: "Final evidence from first text", finalSecondEvidence: "Final evidence from second text", finalGroups: "Final groups",
    save: "Save reviewed annotation", saved: "The review was saved locally on this device.", storageError: "The review could not be saved locally. The AI result was not removed.", validationError: "Enter a valid final result grounded in the original texts.", requestError: "A reliable suggestion could not be generated.",
    summary: "Local review summary", filter: "Filter by tool", all: "All tools", total: "Total reviewed cases", accepted: "Accepted", edited: "Modified", rejected: "Rejected", noCases: "No saved reviewed cases match this selection.",
  },
};

const emptyOutput = (toolId) => toolId === "similarity"
  ? { category: "", evidence: { primary: "", secondary: "" } }
  : toolId === "topic" ? { topic: "", evidence: "" } : { groups: [] };

export default function SemanticsTool() {
  const { language } = useLanguage();
  const locale = language === "ar" ? "ar" : "en";
  const copy = COPY[locale];
  const [toolId, setToolId] = useState("similarity");
  const [primary, setPrimary] = useState("");
  const [secondary, setSecondary] = useState("");
  const [groupText, setGroupText] = useState("");
  const [aiOutput, setAiOutput] = useState(null);
  const [decision, setDecision] = useState("");
  const [finalOutput, setFinalOutput] = useState(emptyOutput("similarity"));
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [cases, setCases] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const requested = window.location.hash.slice(1);
      if (SEMANTICS_TOOLS[requested]) { setToolId(requested); setFinalOutput(emptyOutput(requested)); }
      setCases(readSemanticsReviewedCases());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function resetSuggestion(nextToolId = toolId) {
    setAiOutput(null); setDecision(""); setFinalOutput(emptyOutput(nextToolId)); setStatus("idle"); setMessage("");
  }
  function changeTool(nextToolId) { setToolId(nextToolId); resetSuggestion(nextToolId); }
  function inputs() { return toolId === "grouping" ? { texts: groupText.split(/\r?\n/).map((text) => text.trim()).filter(Boolean) } : { primary: primary.trim(), secondary: secondary.trim() }; }

  async function analyze(event) {
    event.preventDefault(); setStatus("loading"); setMessage(""); setAiOutput(null); setDecision("");
    try {
      const response = await fetch("/api/semantics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ toolId, inputs: inputs() }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || copy.requestError);
      setAiOutput(payload.result); setFinalOutput(JSON.parse(JSON.stringify(payload.result))); setStatus("success");
    } catch (error) { setStatus("error"); setMessage(error.message || copy.requestError); }
  }

  function chooseDecision(nextDecision) {
    setDecision(nextDecision); setMessage("");
    setFinalOutput(nextDecision === "accept" && aiOutput ? JSON.parse(JSON.stringify(aiOutput)) : emptyOutput(toolId));
  }
  function updateGroup(index, field, value) {
    setFinalOutput((current) => ({ ...current, groups: current.groups.map((group, groupIndex) => groupIndex === index ? { ...group, [field]: field === "texts" ? value.split(/\r?\n/).map((text) => text.trim()).filter(Boolean) : value } : group) }));
  }
  function addGroup() { setFinalOutput((current) => ({ ...current, groups: [...current.groups, { label: "", texts: [], rationale: "" }] })); }

  function saveReview() {
    const record = createSemanticsReviewedCase({ toolId, inputs: inputs(), aiOutput, decision, finalOutput });
    if (!record) { setMessage(copy.validationError); return; }
    const saved = saveSemanticsReviewedCase(record);
    if (!saved.ok) { setMessage(copy.storageError); return; }
    setCases(saved.cases); setMessage(copy.saved); setPrimary(""); setSecondary(""); setGroupText(""); setAiOutput(null); setDecision(""); setFinalOutput(emptyOutput(toolId)); setStatus("idle");
  }

  const filteredCases = filter === "all" ? cases : cases.filter((item) => item.toolId === filter);
  const summary = useMemo(() => ({ total: filteredCases.length, accept: filteredCases.filter((item) => item.researcherDecision === "accept").length, edit: filteredCases.filter((item) => item.researcherDecision === "edit").length, reject: filteredCases.filter((item) => item.researcherDecision === "reject").length }), [filteredCases]);
  const canAnalyze = toolId === "similarity" ? primary.trim() && secondary.trim() : toolId === "topic" ? primary.trim() : inputs().texts.length >= 2;

  return <>
    <Head><title>{copy.pageTitle} · LinguaLab</title></Head>
    <main className={styles.page}>
      <Link className={styles.back} href="/ar-tools#semantics">← {copy.back}</Link>
      <header className={styles.header}><div><p className={styles.eyebrow}>{copy.eyebrow}</p><h1>{copy.title}</h1><p>{copy.lead}</p></div><span className={styles.previewBadge}>{copy.badge}</span></header>
      <p className={styles.notice}>{copy.notice}</p>
      <section aria-labelledby="semantics-tools-title"><h2 id="semantics-tools-title">{copy.choose}</h2><div className={styles.toolTabs} role="tablist" aria-label={copy.choose}>
        {Object.keys(SEMANTICS_TOOLS).map((id) => <button type="button" role="tab" aria-selected={toolId === id} className={toolId === id ? styles.activeTool : ""} onClick={() => changeTool(id)} key={id}><strong>{TOOL_COPY[id][locale].title}</strong><span>{TOOL_COPY[id][locale].description}</span></button>)}
      </div></section>
      <section className={styles.workflow} id={toolId} aria-labelledby="active-semantics-tool-title">
        <form className={styles.inputCard} onSubmit={analyze}><div className={styles.cardHeading}><span>01</span><h2 id="active-semantics-tool-title">{TOOL_COPY[toolId][locale].title}</h2></div>
          {toolId === "grouping" ? <label>{copy.texts}<textarea required dir="rtl" lang="ar" maxLength={12000} value={groupText} onChange={(event) => { setGroupText(event.target.value); resetSuggestion(); }} placeholder={copy.textsPlaceholder} /></label> : <>
            <label>{toolId === "similarity" ? copy.firstText : copy.text}<textarea required dir="rtl" lang="ar" maxLength={12000} value={primary} onChange={(event) => { setPrimary(event.target.value); resetSuggestion(); }} placeholder={copy.textPlaceholder} /></label>
            {toolId === "similarity" && <label>{copy.secondText}<textarea required dir="rtl" lang="ar" maxLength={12000} value={secondary} onChange={(event) => { setSecondary(event.target.value); resetSuggestion(); }} placeholder={copy.textPlaceholder} /></label>}
          </>}
          <button className={styles.primaryButton} disabled={status === "loading" || !canAnalyze}>{status === "loading" ? copy.analyzing : copy.analyze}</button>{status === "error" && <p className={styles.error} role="alert">{message}</p>}
        </form>
        {aiOutput && <div className={styles.resultColumn}>
          <article className={styles.aiCard}><div className={styles.cardHeading}><span>02</span><h2>{copy.aiSuggestion}</h2></div><dl>
            {toolId === "similarity" && <><div><dt>{copy.category}</dt><dd>{aiOutput.category}</dd></div><div><dt>{copy.firstEvidence}</dt><dd dir="auto">{aiOutput.evidence.primary}</dd></div><div><dt>{copy.secondEvidence}</dt><dd dir="auto">{aiOutput.evidence.secondary}</dd></div></>}
            {toolId === "topic" && <><div><dt>{copy.topic}</dt><dd>{aiOutput.topic}</dd></div><div><dt>{copy.evidence}</dt><dd dir="auto">{aiOutput.evidence}</dd></div></>}
            {toolId === "grouping" && <div><dt>{copy.groups}</dt><dd>{aiOutput.groups.map((group) => <div key={`${group.label}-${group.texts.join("|")}`}><strong>{group.label}</strong><ul>{group.texts.map((text) => <li dir="auto" key={text}>{text}</li>)}</ul><span>{group.rationale}</span></div>)}</dd></div>}
            <div><dt>{copy.explanation}</dt><dd>{aiOutput.explanation}</dd></div>
          </dl></article>
          <article className={styles.reviewCard}><div className={styles.cardHeading}><span>03</span><h2>{copy.review}</h2></div><div className={styles.decisions} role="group" aria-label={copy.review}>{[["accept", copy.accept], ["edit", copy.edit], ["reject", copy.reject]].map(([value, label]) => <button type="button" aria-pressed={decision === value} onClick={() => chooseDecision(value)} key={value}>{label}</button>)}</div>
            {(decision === "edit" || decision === "reject") && <div className={styles.editFields}>
              {toolId === "similarity" && <><label>{copy.finalCategory}<select value={finalOutput.category} onChange={(event) => setFinalOutput((current) => ({ ...current, category: event.target.value }))}><option value="" disabled>—</option>{SEMANTICS_TOOLS.similarity.categories.map((category) => <option key={category}>{category}</option>)}</select></label><label>{copy.finalFirstEvidence}<textarea dir="rtl" lang="ar" value={finalOutput.evidence.primary} onChange={(event) => setFinalOutput((current) => ({ ...current, evidence: { ...current.evidence, primary: event.target.value } }))} /></label><label>{copy.finalSecondEvidence}<textarea dir="rtl" lang="ar" value={finalOutput.evidence.secondary} onChange={(event) => setFinalOutput((current) => ({ ...current, evidence: { ...current.evidence, secondary: event.target.value } }))} /></label></>}
              {toolId === "topic" && <><label>{copy.finalTopic}<input value={finalOutput.topic} onChange={(event) => setFinalOutput((current) => ({ ...current, topic: event.target.value }))} /></label><label>{copy.finalEvidence}<textarea dir="rtl" lang="ar" value={finalOutput.evidence} onChange={(event) => setFinalOutput((current) => ({ ...current, evidence: event.target.value }))} /></label></>}
              {toolId === "grouping" && <><h3>{copy.finalGroups}</h3>{finalOutput.groups.map((group, index) => <div key={index}><label>{copy.groupLabel}<input value={group.label} onChange={(event) => updateGroup(index, "label", event.target.value)} /></label><label>{copy.assignedTexts}<textarea dir="rtl" lang="ar" value={group.texts.join("\n")} onChange={(event) => updateGroup(index, "texts", event.target.value)} /></label><label>{copy.rationale}<textarea dir="auto" value={group.rationale} onChange={(event) => updateGroup(index, "rationale", event.target.value)} /></label></div>)}<button type="button" onClick={addGroup}>+ {copy.groups}</button></>}
            </div>}
            {decision && <button type="button" className={styles.primaryButton} onClick={saveReview}>{copy.save}</button>}{message && status !== "error" && <p className={message === copy.saved ? styles.success : styles.error} role="status">{message}</p>}
          </article>
        </div>}
      </section>
      <section className={styles.summary} aria-labelledby="semantics-summary-title"><div className={styles.summaryHeader}><h2 id="semantics-summary-title">{copy.summary}</h2><label>{copy.filter}<select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">{copy.all}</option>{Object.keys(SEMANTICS_TOOLS).map((id) => <option key={id} value={id}>{TOOL_COPY[id][locale].title}</option>)}</select></label></div><div className={styles.metrics}><div><strong>{summary.total}</strong><span>{copy.total}</span></div><div><strong>{summary.accept}</strong><span>{copy.accepted}</span></div><div><strong>{summary.edit}</strong><span>{copy.edited}</span></div><div><strong>{summary.reject}</strong><span>{copy.rejected}</span></div></div>{!summary.total && <p className={styles.empty}>{copy.noCases}</p>}</section>
    </main>
  </>;
}

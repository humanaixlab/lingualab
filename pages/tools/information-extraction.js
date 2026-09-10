import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "../../components/LanguageProvider";
import {
  INFORMATION_EXTRACTION_DECISIONS,
  INFORMATION_EXTRACTION_TOOLS,
  createInformationExtractionReview,
  saveInformationExtractionReview,
} from "../../lib/information-extraction";
import styles from "../../styles/CorpusResearch.module.css";

const TOOL_COPY = {
  ner: { ar: ["التعرف على الكيانات المسماة", "استخرج الكيانات الظاهرة في النص ضمن فئات مغلقة مع الحفاظ على صورتها الأصلية."], en: ["Named Entity Recognition", "Extract visible entities using a closed category set while preserving exact source forms."] },
  relations: { ar: ["استخراج العلاقات", "حدّد العلاقات الصريحة أو المدعومة نصيًا بقوة بين الكيانات دون معرفة خارجية."], en: ["Relation Extraction", "Identify explicit or strongly text-supported entity relations without external knowledge."] },
  terminology: { ar: ["استخراج المصطلحات والعبارات المفتاحية", "استخرج المصطلحات والعبارات متعددة الكلمات ذات الصلة بالمجال بدل الكلمات العامة."], en: ["Terminology & Keyphrase Extraction", "Extract domain-relevant terms and multiword expressions instead of generic frequent words."] },
};

const COPY = {
  ar: {
    head: "استخراج المعلومات · تجريب بحثي", back: "العودة إلى البناء", eyebrow: "البيانات ومسارات العمل الحاسوبية", title: "مختبر استخراج المعلومات", badge: "تجريب بحثي",
    lead: "حوّل العناصر الصريحة في النص العربي إلى مقترحات منظّمة قابلة لمراجعة الباحث.", notice: "المخرجات مقترحات تحليلية مدعومة بالذكاء الاصطناعي، ويظل الباحث مسؤولًا عن التحقق من النتائج واعتمادها في الاستخدام البحثي.", choose: "اختر وحدة الاستخراج", text: "النص العربي", placeholder: "ألصق النص العربي المراد استخراج المعلومات منه…", analyze: "استخرج بالذكاء الاصطناعي", analyzing: "جارٍ إنشاء الاقتراح…", aiSuggestion: "اقتراح الذكاء الاصطناعي", review: "مراجعة الباحث", accept: "قبول", edit: "تعديل", reject: "رفض", final: "النتيجة النهائية المراجعة", finalHint: "عدّل القيم في بنية JSON مع إبقاء جميع العناصر والأدلة من النص الأصلي.", save: "حفظ المراجعة", saved: "حُفظ اقتراح الذكاء الاصطناعي والنتيجة النهائية منفصلين محليًا.", invalidFinal: "النتيجة النهائية غير مكتملة أو تتضمن عنصرًا غير موجود في النص.", storageError: "تعذر الحفظ محليًا.", requestError: "تعذر إنشاء اقتراح موثوق.", entities: "الكيانات", span: "النص الأصلي", category: "الفئة", relations: "العلاقات النصية", entity1: "الكيان الأول", relation: "العلاقة", entity2: "الكيان الثاني", evidence: "الدليل النصي", terms: "المصطلحات والعبارات المفتاحية", term: "المصطلح", rationale: "المسوغ المختصر", explanation: "التفسير المختصر", none: "لم تُستخرج عناصر مدعومة من النص.",
  },
  en: {
    head: "Information Extraction · Research Preview", back: "Back to Build", eyebrow: "DATA & COMPUTATIONAL WORKFLOWS", title: "Information Extraction Lab", badge: "Research Preview",
    lead: "Turn explicit Arabic-text elements into structured suggestions for researcher review.", notice: "Outputs are AI-supported analytical suggestions. The researcher remains responsible for verifying and approving results for research use.", choose: "Choose an extraction module", text: "Arabic text", placeholder: "Paste the Arabic text from which information should be extracted…", analyze: "Extract with AI", analyzing: "Generating suggestion…", aiSuggestion: "AI suggestion", review: "Researcher review", accept: "Accept", edit: "Modify", reject: "Reject", final: "Final reviewed result", finalHint: "Edit values in the JSON structure while keeping every item and evidence span in the original text.", save: "Save review", saved: "The original AI suggestion and final human result were saved separately on this device.", invalidFinal: "The final result is incomplete or contains content absent from the source text.", storageError: "Local storage is unavailable.", requestError: "A reliable suggestion could not be generated.", entities: "Entities", span: "Exact source span", category: "Category", relations: "Textual relations", entity1: "Entity 1", relation: "Relation", entity2: "Entity 2", evidence: "Supporting span", terms: "Terms and keyphrases", term: "Term", rationale: "Short rationale", explanation: "Short explanation", none: "No text-supported items were extracted.",
  },
};

export default function InformationExtraction() {
  const { language } = useLanguage();
  const locale = language === "ar" ? "ar" : "en";
  const copy = COPY[locale];
  const [toolId, setToolId] = useState("ner");
  const [text, setText] = useState("");
  const [aiOutput, setAiOutput] = useState(null);
  const [decision, setDecision] = useState("");
  const [finalJson, setFinalJson] = useState("{}");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  function resetResult() { setAiOutput(null); setDecision(""); setFinalJson("{}"); setStatus("idle"); setMessage(""); }
  function changeTool(next) { setToolId(next); resetResult(); }
  async function analyze(event) {
    event.preventDefault(); setStatus("loading"); setMessage(""); setAiOutput(null); setDecision("");
    try {
      const response = await fetch("/api/information-extraction", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ toolId, text: text.trim(), uiLanguage: locale }) });
      const payload = await response.json(); if (!response.ok) throw new Error(payload.error || copy.requestError);
      setAiOutput(payload.result); setFinalJson(JSON.stringify(payload.result, null, 2)); setStatus("success");
    } catch (error) { setStatus("error"); setMessage(error.message || copy.requestError); }
  }
  function chooseDecision(next) {
    setDecision(next); setMessage(""); setFinalJson(next === "reject" ? "{}" : JSON.stringify(aiOutput, null, 2));
  }
  function saveReview() {
    let finalOutput;
    try { finalOutput = JSON.parse(finalJson); } catch { setMessage(copy.invalidFinal); return; }
    const review = createInformationExtractionReview({ toolId, text: text.trim(), aiOutput, decision, finalOutput });
    if (!review) { setMessage(copy.invalidFinal); return; }
    const saved = saveInformationExtractionReview(review);
    setMessage(saved.ok ? copy.saved : copy.storageError);
  }

  return <>
    <Head><title>{copy.head} · LinguaLab</title></Head>
    <main className={styles.page}>
      <Link className={styles.back} href="/ar-tools#build">← {copy.back}</Link>
      <header className={styles.header}><div><p className={styles.eyebrow}>{copy.eyebrow}</p><h1>{copy.title}</h1><p>{copy.lead}</p></div><span className={styles.previewBadge}>{copy.badge}</span></header>
      <p className={styles.notice}>{copy.notice}</p>
      <section aria-labelledby="extraction-tools-title"><h2 id="extraction-tools-title">{copy.choose}</h2><div className={styles.moduleTabs} role="tablist">
        {Object.keys(INFORMATION_EXTRACTION_TOOLS).map((id) => <button type="button" role="tab" aria-selected={toolId === id} className={toolId === id ? styles.activeTab : ""} onClick={() => changeTool(id)} key={id}><strong>{TOOL_COPY[id][locale][0]}</strong><span>{TOOL_COPY[id][locale][1]}</span></button>)}
      </div></section>
      <section className={styles.module} aria-labelledby="active-extraction-title">
        <form className={styles.card} onSubmit={analyze}><h2 id="active-extraction-title">{TOOL_COPY[toolId][locale][0]}</h2><p className={styles.hint}>{TOOL_COPY[toolId][locale][1]}</p><label>{copy.text}<textarea required lang="ar" dir="rtl" maxLength={12000} value={text} onChange={(event) => { setText(event.target.value); resetResult(); }} placeholder={copy.placeholder} /></label><button className={styles.primaryButton} disabled={status === "loading"}>{status === "loading" ? copy.analyzing : copy.analyze}</button>{status === "error" && <p className={styles.error} role="alert">{message}</p>}</form>
        <div className={styles.stack}>{aiOutput && <><article className={styles.card}><h2>{copy.aiSuggestion}</h2><ExtractionOutput toolId={toolId} output={aiOutput} copy={copy} /></article><article className={styles.card}><h2>{copy.review}</h2><div className={styles.decisions}>{INFORMATION_EXTRACTION_DECISIONS.map((id) => <button type="button" aria-pressed={decision === id} onClick={() => chooseDecision(id)} key={id}>{copy[id]}</button>)}</div>{(decision === "edit" || decision === "reject") && <div className={styles.editFields}><label>{copy.final}<textarea dir="ltr" value={finalJson} onChange={(event) => setFinalJson(event.target.value)} /></label><p className={styles.hint}>{copy.finalHint}</p></div>}{decision && <button type="button" className={styles.primaryButton} onClick={saveReview}>{copy.save}</button>}{message && status !== "error" && <p className={message === copy.saved ? styles.success : styles.error}>{message}</p>}</article></>}</div>
      </section>
    </main>
  </>;
}

function ExtractionOutput({ toolId, output, copy }) {
  const rows = toolId === "ner" ? output.entities : toolId === "relations" ? output.relations : output.terms;
  const columns = toolId === "ner" ? ["span", "category"] : toolId === "relations" ? ["entity1", "relation", "entity2", "evidence", "explanation"] : ["term", "rationale"];
  return <><h3>{copy[toolId === "ner" ? "entities" : toolId]}</h3>{rows.length ? <div className={styles.tableWrap}><table><thead><tr>{columns.map((column) => <th key={column}>{copy[column]}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{columns.map((column) => <td dir="auto" key={column}>{row[column]}</td>)}</tr>)}</tbody></table></div> : <p className={styles.empty}>{copy.none}</p>}<dl className={styles.output}><div><dt>{copy.explanation}</dt><dd dir="auto">{output.explanation}</dd></div></dl></>;
}

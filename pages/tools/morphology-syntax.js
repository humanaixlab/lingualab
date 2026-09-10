import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "../../components/LanguageProvider";
import {
  MORPHOLOGY_SYNTAX_DECISIONS,
  MORPHOLOGY_SYNTAX_TOOLS,
  createMorphologySyntaxReview,
  saveMorphologySyntaxReview,
} from "../../lib/morphology-syntax";
import styles from "../../styles/CorpusResearch.module.css";

const TOOL_COPY = {
  lemmatization: { ar: ["الإرجاع إلى الصيغة المعجمية", "اقترح الصيغة المعجمية لكلمة عربية محددة في سياقها."], en: ["Lemmatization", "Propose the lemma of a selected Arabic word in context."] },
  "morphological-features": { ar: ["السمات الصرفية", "افحص السمات التي يدعمها شكل الكلمة وسياقها فقط."], en: ["Morphological Features", "Inspect only features supported by the word form and context."] },
  "word-structure": { ar: ["بنية الكلمة", "اقترح السوابق والجذع أو الأساس واللواحق عند انطباقها."], en: ["Word Structure", "Propose applicable prefixes, stem or base, and suffixes."] },
  pos: { ar: ["أقسام الكلام", "صنّف الكلمة وفق موقعها في سياق الجملة دون ادعاء تحقق نهائي."], en: ["Part of Speech", "Classify a word in sentence context without claiming validated output."] },
  "syntactic-relations": { ar: ["العلاقات النحوية", "اقترح العلاقة النحوية الرئيسة بين عنصرين محددين من الجملة."], en: ["Syntactic Relations", "Propose the main grammatical relation between two selected sentence elements."] },
  "sentence-structure": { ar: ["البنية التركيبية للجملة", "قدّم تحليلًا موجزًا للمكوّنات الرئيسة دون تحليل اعتمادي عميق."], en: ["Sentence Structure", "Provide a concise major-constituent analysis without deep dependency claims."] },
};

const COPY = {
  ar: {
    head: "الصرف والنحو · تجريب بحثي", back: "العودة إلى مركز البحث", eyebrow: "الصرف والنحو", title: "مختبر الصرف والنحو", badge: "تجريب بحثي",
    lead: "منطقة تجريبية لتحليل الكلمة والجملة العربية مع إبقاء الاعتماد النهائي بيد الباحث.", notice: "المخرجات مقترحات تحليلية مدعومة بالذكاء الاصطناعي، ويظل الباحث مسؤولًا عن التحقق من النتائج واعتمادها في الاستخدام البحثي.",
    morphology: "التحليل الصرفي", morphologyDesc: "تحليل الصيغة المعجمية والسمات وبنية الكلمة.", syntax: "التحليل النحوي", syntaxDesc: "تحليل أقسام الكلام والعلاقات والبنية التركيبية الأساسية.", choose: "اختر الأداة", source: "النص أو الجملة العربية", sourcePlaceholder: "أدخل الجملة التي تحتوي على الكلمة أو العناصر المراد تحليلها…", token: "الكلمة المحددة", tokenPlaceholder: "أدخل الكلمة كما تظهر في النص", first: "العنصر الأول", second: "العنصر الثاني", analyze: "حلّل بالذكاء الاصطناعي", analyzing: "جارٍ إنشاء الاقتراح…", aiSuggestion: "اقتراح الذكاء الاصطناعي", review: "مراجعة الباحث", accept: "قبول", edit: "تعديل", reject: "رفض", final: "النتيجة النهائية المراجعة", finalHint: "راجع بنية JSON وعدّل القيم فقط، مع إبقاء الأدلة من النص الأصلي.", save: "حفظ المراجعة", saved: "حُفظ اقتراح الذكاء الاصطناعي والنتيجة النهائية منفصلين محليًا.", invalid: "أدخل نصًا عربيًا صحيحًا وحدد العناصر المطلوبة من النص نفسه.", invalidFinal: "النتيجة النهائية غير مكتملة أو تتضمن دليلًا غير موجود في النص.", storageError: "تعذر الحفظ محليًا.", requestError: "تعذر إنشاء اقتراح موثوق.", original: "الكلمة الأصلية", lemma: "الصيغة المعجمية", features: "السمات الصرفية", prefixes: "السوابق", stem: "الجذع أو الأساس", suffixes: "اللواحق", category: "قسم الكلام", relation: "العلاقة النحوية", evidence: "الدليل النصي", constituents: "المكوّنات الرئيسة", explanation: "التفسير المختصر", uncertain: "تحليل مقترح غير مؤكد", yes: "نعم", no: "لا",
  },
  en: {
    head: "Morphology & Syntax · Research Preview", back: "Back to Research Hub", eyebrow: "MORPHOLOGY & SYNTAX", title: "Morphology & Syntax Lab", badge: "Research Preview",
    lead: "An experimental area for analyzing Arabic words and sentences while leaving final approval to the researcher.", notice: "Outputs are AI-supported analytical suggestions. The researcher remains responsible for verifying and approving results for research use.",
    morphology: "Morphology", morphologyDesc: "Analyze lemmas, morphological features, and word structure.", syntax: "Syntax", syntaxDesc: "Analyze parts of speech, grammatical relations, and major sentence structure.", choose: "Choose a tool", source: "Arabic text or sentence", sourcePlaceholder: "Enter the sentence containing the word or elements to analyze…", token: "Selected word", tokenPlaceholder: "Enter the word exactly as it appears in the text", first: "First element", second: "Second element", analyze: "Analyze with AI", analyzing: "Generating suggestion…", aiSuggestion: "AI suggestion", review: "Researcher review", accept: "Accept", edit: "Modify", reject: "Reject", final: "Final reviewed result", finalHint: "Review the JSON structure and edit values only, keeping evidence grounded in the source text.", save: "Save review", saved: "The original AI suggestion and final human result were saved separately on this device.", invalid: "Enter valid Arabic text and select required elements copied from that text.", invalidFinal: "The final result is incomplete or contains evidence not found in the source text.", storageError: "Local storage is unavailable.", requestError: "A reliable suggestion could not be generated.", original: "Original word", lemma: "Lemma", features: "Morphological features", prefixes: "Prefixes", stem: "Stem or base", suffixes: "Suffixes", category: "Part of speech", relation: "Syntactic relation", evidence: "Textual evidence", constituents: "Major constituents", explanation: "Short explanation", uncertain: "Proposed / uncertain analysis", yes: "Yes", no: "No",
  },
};

const sectionTools = {
  morphology: ["lemmatization", "morphological-features", "word-structure"],
  syntax: ["pos", "syntactic-relations", "sentence-structure"],
};

export default function MorphologySyntax() {
  const { language } = useLanguage();
  const locale = language === "ar" ? "ar" : "en";
  const copy = COPY[locale];
  const [section, setSection] = useState("morphology");
  const [toolId, setToolId] = useState("lemmatization");
  const [text, setText] = useState("");
  const [token, setToken] = useState("");
  const [firstElement, setFirstElement] = useState("");
  const [secondElement, setSecondElement] = useState("");
  const [aiOutput, setAiOutput] = useState(null);
  const [decision, setDecision] = useState("");
  const [finalJson, setFinalJson] = useState("{}");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const tool = MORPHOLOGY_SYNTAX_TOOLS[toolId];
  const inputs = { text: text.trim(), token: token.trim(), firstElement: firstElement.trim(), secondElement: secondElement.trim() };
  const toolCopy = TOOL_COPY[toolId][locale];
  function resetResult() { setAiOutput(null); setDecision(""); setFinalJson("{}"); setStatus("idle"); setMessage(""); }
  function changeSection(next) { setSection(next); setToolId(sectionTools[next][0]); resetResult(); }
  function changeTool(next) { setToolId(next); resetResult(); }
  function updateInput(setter, value) { setter(value); resetResult(); }
  async function analyze(event) {
    event.preventDefault(); setStatus("loading"); setMessage(""); setAiOutput(null); setDecision("");
    try {
      const response = await fetch("/api/morphology-syntax", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ toolId, inputs, uiLanguage: locale }) });
      const payload = await response.json(); if (!response.ok) throw new Error(payload.error || copy.requestError);
      setAiOutput(payload.result); setFinalJson(JSON.stringify(payload.result, null, 2)); setStatus("success");
    } catch (error) { setStatus("error"); setMessage(error.message || copy.requestError); }
  }
  function chooseDecision(next) {
    setDecision(next); setMessage("");
    setFinalJson(next === "reject" ? "{}" : JSON.stringify(aiOutput, null, 2));
  }
  function saveReview() {
    let finalOutput;
    try { finalOutput = JSON.parse(finalJson); } catch { setMessage(copy.invalidFinal); return; }
    const review = createMorphologySyntaxReview({ toolId, inputs, aiOutput, decision, finalOutput });
    if (!review) { setMessage(copy.invalidFinal); return; }
    const saved = saveMorphologySyntaxReview(review);
    setMessage(saved.ok ? copy.saved : copy.storageError);
  }

  return <>
    <Head><title>{copy.head} · LinguaLab</title></Head>
    <main className={styles.page}>
      <Link className={styles.back} href="/ar-tools#all-tools">← {copy.back}</Link>
      <header className={styles.header}><div><p className={styles.eyebrow}>{copy.eyebrow}</p><h1>{copy.title}</h1><p>{copy.lead}</p></div><span className={styles.previewBadge}>{copy.badge}</span></header>
      <p className={styles.notice}>{copy.notice}</p>
      <div className={styles.moduleTabs} role="tablist">
        {["morphology", "syntax"].map((id) => <button type="button" role="tab" aria-selected={section === id} className={section === id ? styles.activeTab : ""} onClick={() => changeSection(id)} key={id}><strong>{copy[id]}</strong><span>{copy[`${id}Desc`]}</span></button>)}
      </div>
      <section aria-labelledby={`${section}-title`}><h2 id={`${section}-title`}>{copy[section]}</h2><p className={styles.hint}>{copy.choose}</p><div className={styles.moduleTabs} role="tablist">
        {sectionTools[section].map((id) => <button type="button" role="tab" aria-selected={toolId === id} className={toolId === id ? styles.activeTab : ""} onClick={() => changeTool(id)} key={id}><strong>{TOOL_COPY[id][locale][0]}</strong><span>{TOOL_COPY[id][locale][1]}</span></button>)}
      </div></section>
      <section className={styles.module} aria-labelledby="active-tool-title">
        <form className={styles.card} onSubmit={analyze}><h2 id="active-tool-title">{toolCopy[0]}</h2><p className={styles.hint}>{toolCopy[1]}</p><label>{copy.source}<textarea required lang="ar" dir="rtl" maxLength={12000} value={text} onChange={(event) => updateInput(setText, event.target.value)} placeholder={copy.sourcePlaceholder} /></label>
          {tool.input === "token" && <label>{copy.token}<input required lang="ar" dir="rtl" value={token} onChange={(event) => updateInput(setToken, event.target.value)} placeholder={copy.tokenPlaceholder} /></label>}
          {tool.input === "elements" && <><label>{copy.first}<input required lang="ar" dir="rtl" value={firstElement} onChange={(event) => updateInput(setFirstElement, event.target.value)} /></label><label>{copy.second}<input required lang="ar" dir="rtl" value={secondElement} onChange={(event) => updateInput(setSecondElement, event.target.value)} /></label></>}
          <button className={styles.primaryButton} disabled={status === "loading"}>{status === "loading" ? copy.analyzing : copy.analyze}</button>{status === "error" && <p className={styles.error} role="alert">{message}</p>}
        </form>
        <div className={styles.stack}>{aiOutput && <><article className={styles.card}><h2>{copy.aiSuggestion}</h2><OutputView output={aiOutput} copy={copy} /></article><article className={styles.card}><h2>{copy.review}</h2><div className={styles.decisions}>{MORPHOLOGY_SYNTAX_DECISIONS.map((id) => <button type="button" aria-pressed={decision === id} onClick={() => chooseDecision(id)} key={id}>{copy[id]}</button>)}</div>{(decision === "edit" || decision === "reject") && <div className={styles.editFields}><label>{copy.final}<textarea dir="ltr" value={finalJson} onChange={(event) => setFinalJson(event.target.value)} /></label><p className={styles.hint}>{copy.finalHint}</p></div>}{decision && <button type="button" className={styles.primaryButton} onClick={saveReview}>{copy.save}</button>}{message && status !== "error" && <p className={message === copy.saved ? styles.success : styles.error}>{message}</p>}</article></>}</div>
      </section>
    </main>
  </>;
}

function OutputView({ output, copy }) {
  const labels = { original: copy.original, lemma: copy.lemma, features: copy.features, prefixes: copy.prefixes, stem: copy.stem, suffixes: copy.suffixes, category: copy.category, relation: copy.relation, evidence: copy.evidence, constituents: copy.constituents, explanation: copy.explanation, uncertain: copy.uncertain };
  return <dl className={styles.output}>{Object.entries(output).map(([key, value]) => <div key={key}><dt>{labels[key] || key}</dt><dd dir="auto">{typeof value === "boolean" ? (value ? copy.yes : copy.no) : typeof value === "object" ? <pre>{JSON.stringify(value, null, 2)}</pre> : value}</dd></div>)}</dl>;
}

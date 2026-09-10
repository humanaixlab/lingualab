import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../components/LanguageProvider";
import {
  analyzeCorpusDeterministically,
  createCorpusDocument,
  createCorpusReview,
  inspectCorpus,
  readCorpusResearchState,
  saveCorpusResearchState,
} from "../../lib/corpus-research";
import styles from "../../styles/CorpusResearch.module.css";

const EMPTY_METADATA = { source: "", genre: "", date: "", author: "", notes: "" };
const EMPTY_SETUP = { metadataFields: [], inclusionCriteria: [], exclusionCriteria: [], textTypes: [], corpusStructure: [], readinessIssues: [] };
const EMPTY_INTERPRETATION = { summary: "", patterns: [], researchQuestions: [], caution: "" };
const ARABIC_PATTERN = /[\u0600-\u06ff]/;

const COPY = {
  ar: {
    head: "لسانيات المدونات · تجريب بحثي", back: "العودة إلى مركز البحث", eyebrow: "لسانيات المدونات", title: "مختبر أبحاث المدونات", badge: "تجريب بحثي",
    lead: "أنشئ مدونة عربية أولية وافحص نتائج حتمية قبل مراجعة التفسير المدعوم بالذكاء الاصطناعي.", notice: "المخرجات مقترحات تحليلية مدعومة بالذكاء الاصطناعي، ويظل الباحث مسؤولًا عن التحقق من النتائج واعتمادها في الاستخدام البحثي.",
    create: "إنشاء مدونة جديدة", createDesc: "اجمع نصوصًا عربية مع بيانات وصفية بسيطة، وافحص الجاهزية والتكرار.", analyze: "تحليل المدونة", analyzeDesc: "نفّذ تحليل التكرار والسياقات والمتتاليات اللفظية محليًا، ثم اطلب تفسيرًا اختياريًا.",
    paste: "النص العربي", pastePlaceholder: "ألصق نصًا عربيًا لإضافته إلى المدونة…", files: "رفع ملفات نصية عربية", fileHelp: "يمكن اختيار عدة ملفات نصية. تبقى النصوص محفوظة محليًا على هذا الجهاز فقط.",
    source: "المصدر", genre: "النوع", date: "التاريخ", author: "المؤلف أو المتحدث", notes: "ملاحظات", optional: "اختياري", add: "إضافة النص", remove: "إزالة", documents: "نصوص المدونة", noDocuments: "لم تُضف نصوص بعد.",
    readiness: "فحص الجاهزية", documentCount: "عدد النصوص", characterCount: "عدد المحارف", duplicates: "النصوص المكررة", missing: "سجلات بها بيانات وصفية ناقصة", noDuplicates: "لا توجد تكرارات واضحة.",
    setup: "اقتراح إعداد المدونة بالذكاء الاصطناعي", settingUp: "جارٍ إعداد الاقتراح…", run: "تشغيل التحليل الحتمي", query: "كلمة أو عبارة للسياقات", queryPlaceholder: "أدخل عنصر البحث اختياريًا…", ngram: "نوع المتتالية", bigrams: "ثنائيات (Bigrams)", trigrams: "ثلاثيات (Trigrams)",
    results: "النتائج الحتمية", wordCount: "عدد الكلمات", frequency: "تحليل التكرار", contexts: "السياقات", ngrams: "المتتاليات اللفظية", item: "العنصر", count: "التكرار", noContexts: "أدخل كلمة أو عبارة ثم أعد التحليل لعرض السياقات.",
    interpret: "تفسير النتائج بالذكاء الاصطناعي", interpreting: "جارٍ إنشاء التفسير…", aiSuggestion: "اقتراح الذكاء الاصطناعي", review: "مراجعة الباحث", accept: "قبول", edit: "تعديل", reject: "رفض", save: "حفظ النتيجة المراجعة", saved: "حُفظت النتيجة والمراجعة محليًا.", storageError: "تعذر الحفظ محليًا.", invalidFinal: "أدخل نتيجة نهائية كاملة قبل الحفظ.", requestError: "تعذر إنشاء اقتراح موثوق.",
    metadataFields: "حقول وصفية مقترحة", inclusionCriteria: "معايير الإدراج", exclusionCriteria: "معايير الاستبعاد", textTypes: "أنواع النصوص المناسبة", corpusStructure: "بنية مقترحة للمدونة", readinessIssues: "مسائل الجاهزية", summary: "الملخص", patterns: "أنماط تستحق المراجعة", researchQuestions: "أسئلة بحثية ممكنة", caution: "تنبيه منهجي", onePerLine: "عنصر واحد في كل سطر", clear: "مسح المدونة المحلية", confirmClear: "مسح جميع نصوص هذه المدونة ومراجعاتها المحلية؟", arabicRequired: "أدخل نصًا عربيًا صالحًا. لم تُضف الملفات التي لا تحتوي على نص عربي.",
  },
  en: {
    head: "Corpus Linguistics · Research Preview", back: "Back to Research Hub", eyebrow: "CORPUS LINGUISTICS", title: "Corpus Research Lab", badge: "Research Preview",
    lead: "Build an initial Arabic corpus and inspect deterministic results before reviewing AI-supported interpretation.", notice: "Outputs are AI-supported analytical suggestions. The researcher remains responsible for verifying and approving results for research use.",
    create: "Create Corpus", createDesc: "Combine Arabic texts with simple metadata, then inspect readiness and duplicates.", analyze: "Corpus Analysis", analyzeDesc: "Run frequency, contexts, and N-gram analysis locally, then request optional interpretation.",
    paste: "Arabic text", pastePlaceholder: "Paste Arabic text to add to the corpus…", files: "Upload Arabic text files", fileHelp: "You may select multiple text files. Text remains stored only on this device.",
    source: "Source", genre: "Genre", date: "Date", author: "Author or speaker", notes: "Notes", optional: "optional", add: "Add text", remove: "Remove", documents: "Corpus texts", noDocuments: "No texts have been added.",
    readiness: "Readiness check", documentCount: "Texts", characterCount: "Characters", duplicates: "Duplicate texts", missing: "Records with missing metadata", noDuplicates: "No obvious duplicates detected.",
    setup: "Suggest corpus setup with AI", settingUp: "Generating setup suggestion…", run: "Run deterministic analysis", query: "Context word or phrase", queryPlaceholder: "Optionally enter a search expression…", ngram: "Sequence type", bigrams: "Bigrams", trigrams: "Trigrams",
    results: "Deterministic results", wordCount: "Words", frequency: "Frequency Analysis", contexts: "Contexts", ngrams: "N-grams", item: "Item", count: "Count", noContexts: "Enter a word or phrase and rerun the analysis to show contexts.",
    interpret: "Interpret results with AI", interpreting: "Generating interpretation…", aiSuggestion: "AI suggestion", review: "Researcher review", accept: "Accept", edit: "Modify", reject: "Reject", save: "Save reviewed result", saved: "The result and review were saved locally.", storageError: "Local storage is unavailable.", invalidFinal: "Complete the final result before saving.", requestError: "A reliable suggestion could not be generated.",
    metadataFields: "Suggested metadata fields", inclusionCriteria: "Inclusion criteria", exclusionCriteria: "Exclusion criteria", textTypes: "Suitable text types", corpusStructure: "Possible corpus structure", readinessIssues: "Readiness issues", summary: "Summary", patterns: "Patterns for review", researchQuestions: "Possible research questions", caution: "Methodological caution", onePerLine: "One item per line", clear: "Clear local corpus", confirmClear: "Clear all texts and local reviews for this corpus?", arabicRequired: "Enter valid Arabic text. Files without Arabic text were not added.",
  },
};

const fieldsFor = (moduleId) => moduleId === "create"
  ? ["metadataFields", "inclusionCriteria", "exclusionCriteria", "textTypes", "corpusStructure", "readinessIssues"]
  : ["summary", "patterns", "researchQuestions", "caution"];

const clone = (value) => JSON.parse(JSON.stringify(value));

export default function CorpusResearch() {
  const { language } = useLanguage();
  const locale = language === "ar" ? "ar" : "en";
  const copy = COPY[locale];
  const [moduleId, setModuleId] = useState("create");
  const [documents, setDocuments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [text, setText] = useState("");
  const [metadata, setMetadata] = useState(EMPTY_METADATA);
  const [query, setQuery] = useState("");
  const [ngramSize, setNgramSize] = useState(2);
  const [results, setResults] = useState(null);
  const [aiOutput, setAiOutput] = useState(null);
  const [finalOutput, setFinalOutput] = useState(EMPTY_SETUP);
  const [decision, setDecision] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const state = readCorpusResearchState();
      setDocuments(state.documents);
      setReviews(state.reviews);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const inspection = useMemo(() => inspectCorpus(documents), [documents]);
  function persist(nextDocuments = documents, nextReviews = reviews) {
    return saveCorpusResearchState({ documents: nextDocuments, reviews: nextReviews });
  }
  function resetAi(nextModule = moduleId) {
    setAiOutput(null); setDecision(""); setFinalOutput(nextModule === "create" ? clone(EMPTY_SETUP) : clone(EMPTY_INTERPRETATION)); setStatus("idle"); setMessage("");
  }
  function changeModule(next) { setModuleId(next); resetAi(next); }
  function addDocument(document) {
    if (!document) return;
    const next = [...documents, document].slice(-100);
    setDocuments(next); persist(next, reviews); setResults(null); resetAi();
  }
  function submitText(event) {
    event.preventDefault();
    if (!ARABIC_PATTERN.test(text)) { setStatus("error"); setMessage(copy.arabicRequired); return; }
    const document = createCorpusDocument({ text, metadata });
    if (!document) return;
    addDocument(document); setText(""); setMetadata(EMPTY_METADATA);
  }
  async function loadFiles(event) {
    const files = Array.from(event.target.files || []);
    const loaded = await Promise.all(files.map(async (file) => createCorpusDocument({ text: await file.text(), fileName: file.name })));
    const accepted = loaded.filter((document) => document && ARABIC_PATTERN.test(document.text));
    const next = [...documents, ...accepted].slice(-100);
    setDocuments(next); persist(next, reviews); setResults(null); resetAi(); event.target.value = "";
    if (accepted.length !== files.length) { setStatus("error"); setMessage(copy.arabicRequired); }
  }
  function removeDocument(id) {
    const next = documents.filter((document) => document.id !== id);
    setDocuments(next); persist(next, reviews); setResults(null); resetAi();
  }
  function runAnalysis() { setResults(analyzeCorpusDeterministically(documents, { query, ngramSize })); resetAi("analyze"); }

  async function requestAi() {
    setStatus("loading"); setMessage(""); setAiOutput(null); setDecision("");
    const body = moduleId === "create"
      ? { moduleId, uiLanguage: locale, corpusSummary: inspection }
      : { moduleId, uiLanguage: locale, results };
    try {
      const response = await fetch("/api/corpus-research", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || copy.requestError);
      setAiOutput(payload.result); setFinalOutput(clone(payload.result)); setStatus("success");
    } catch (error) { setStatus("error"); setMessage(error.message || copy.requestError); }
  }
  function chooseDecision(next) {
    setDecision(next); setMessage("");
    setFinalOutput(next === "accept" && aiOutput ? clone(aiOutput) : moduleId === "create" ? clone(EMPTY_SETUP) : clone(EMPTY_INTERPRETATION));
  }
  function updateFinal(field, value) {
    setFinalOutput((current) => ({ ...current, [field]: Array.isArray(current[field]) ? value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean) : value }));
  }
  function saveReview() {
    const review = createCorpusReview({ moduleId, aiOutput, decision, finalOutput });
    if (!review) { setMessage(copy.invalidFinal); return; }
    const next = [...reviews, review].slice(-100);
    const saved = persist(documents, next);
    if (!saved.ok) { setMessage(copy.storageError); return; }
    setReviews(next); setMessage(copy.saved);
  }
  function clearCorpus() {
    if (!window.confirm(copy.confirmClear)) return;
    setDocuments([]); setReviews([]); setResults(null); resetAi(); persist([], []);
  }

  return <>
    <Head><title>{copy.head} · LinguaLab</title></Head>
    <main className={styles.page}>
      <Link className={styles.back} href="/ar-tools#all-tools">← {copy.back}</Link>
      <header className={styles.header}><div><p className={styles.eyebrow}>{copy.eyebrow}</p><h1>{copy.title}</h1><p>{copy.lead}</p></div><span className={styles.previewBadge}>{copy.badge}</span></header>
      <p className={styles.notice}>{copy.notice}</p>
      <div className={styles.moduleTabs} role="tablist">
        {["create", "analyze"].map((id) => <button type="button" role="tab" aria-selected={moduleId === id} className={moduleId === id ? styles.activeTab : ""} onClick={() => changeModule(id)} key={id}><strong>{copy[id]}</strong><span>{copy[`${id}Desc`]}</span></button>)}
      </div>

      {moduleId === "create" ? <section className={styles.module} aria-labelledby="create-corpus-title">
        <form className={styles.card} onSubmit={submitText}><h2 id="create-corpus-title">{copy.create}</h2>
          <label>{copy.paste}<textarea required lang="ar" dir="rtl" value={text} onChange={(event) => setText(event.target.value)} placeholder={copy.pastePlaceholder} /></label>
          <div className={styles.metadataGrid}>{Object.keys(EMPTY_METADATA).map((field) => <label key={field}>{copy[field]} <small>({copy.optional})</small>{field === "notes" ? <textarea value={metadata[field]} onChange={(event) => setMetadata((current) => ({ ...current, [field]: event.target.value }))} /> : <input type={field === "date" ? "date" : "text"} value={metadata[field]} onChange={(event) => setMetadata((current) => ({ ...current, [field]: event.target.value }))} />}</label>)}</div>
          <button className={styles.primaryButton}>{copy.add}</button>
          <label className={styles.fileLabel}>{copy.files}<input type="file" accept=".txt,text/plain" multiple onChange={loadFiles} /><small>{copy.fileHelp}</small></label>
        </form>
        <div className={styles.stack}>
          <article className={styles.card}><div className={styles.cardTitle}><h2>{copy.documents}</h2>{documents.length > 0 && <button type="button" className={styles.linkButton} onClick={clearCorpus}>{copy.clear}</button>}</div>
            {!documents.length ? <p className={styles.empty}>{copy.noDocuments}</p> : <div className={styles.documentList}>{documents.map((document, index) => <div key={document.id}><div><strong>{document.fileName || `${copy.paste} ${index + 1}`}</strong><span>{document.text.slice(0, 110)}{document.text.length > 110 ? "…" : ""}</span></div><button type="button" onClick={() => removeDocument(document.id)}>{copy.remove}</button></div>)}</div>}
          </article>
          <article className={styles.card}><h2>{copy.readiness}</h2><div className={styles.metrics}><div><strong>{inspection.documentCount}</strong><span>{copy.documentCount}</span></div><div><strong>{inspection.characterCount}</strong><span>{copy.characterCount}</span></div><div><strong>{inspection.duplicateIds.length}</strong><span>{copy.duplicates}</span></div><div><strong>{inspection.missingMetadata.length}</strong><span>{copy.missing}</span></div></div><p className={styles.hint}>{inspection.duplicateIds.length ? `${copy.duplicates}: ${inspection.duplicateIds.length}` : copy.noDuplicates}</p>
            <button type="button" className={styles.primaryButton} disabled={!documents.length || status === "loading"} onClick={requestAi}>{status === "loading" ? copy.settingUp : copy.setup}</button>
          </article>
        </div>
      </section> : <section className={styles.module} aria-labelledby="corpus-analysis-title">
        <article className={styles.card}><h2 id="corpus-analysis-title">{copy.analyze}</h2><label>{copy.query}<input value={query} onChange={(event) => { setQuery(event.target.value); setResults(null); resetAi("analyze"); }} placeholder={copy.queryPlaceholder} /></label><label>{copy.ngram}<select value={ngramSize} onChange={(event) => { setNgramSize(Number(event.target.value)); setResults(null); resetAi("analyze"); }}><option value="2">{copy.bigrams}</option><option value="3">{copy.trigrams}</option></select></label><button type="button" className={styles.primaryButton} disabled={!documents.length} onClick={runAnalysis}>{copy.run}</button></article>
        <div className={styles.stack}>{results && <article className={styles.card}><h2>{copy.results}</h2><div className={styles.metrics}><div><strong>{results.documentCount}</strong><span>{copy.documentCount}</span></div><div><strong>{results.wordCount}</strong><span>{copy.wordCount}</span></div></div><ResultTable title={copy.frequency} rows={results.frequencies} copy={copy} />{results.query ? <ResultList title={copy.contexts} rows={results.contexts} /> : <p className={styles.hint}>{copy.noContexts}</p>}<ResultTable title={copy.ngrams} rows={results.ngrams} copy={copy} /><button type="button" className={styles.primaryButton} disabled={status === "loading"} onClick={requestAi}>{status === "loading" ? copy.interpreting : copy.interpret}</button></article>}</div>
      </section>}

      {status === "error" && <p className={styles.error} role="alert">{message}</p>}
      {aiOutput && <section className={styles.reviewGrid}><article className={styles.card}><h2>{copy.aiSuggestion}</h2><OutputFields output={aiOutput} moduleId={moduleId} copy={copy} /></article><article className={styles.card}><h2>{copy.review}</h2><div className={styles.decisions}>{[["accept", copy.accept], ["edit", copy.edit], ["reject", copy.reject]].map(([id, label]) => <button type="button" aria-pressed={decision === id} onClick={() => chooseDecision(id)} key={id}>{label}</button>)}</div>{(decision === "edit" || decision === "reject") && <div className={styles.editFields}>{fieldsFor(moduleId).map((field) => <label key={field}>{copy[field]}<textarea value={Array.isArray(finalOutput[field]) ? finalOutput[field].join("\n") : finalOutput[field]} onChange={(event) => updateFinal(field, event.target.value)} placeholder={Array.isArray(finalOutput[field]) ? copy.onePerLine : ""} /></label>)}</div>}{decision && <button type="button" className={styles.primaryButton} onClick={saveReview}>{copy.save}</button>}{message && status !== "error" && <p className={message === copy.saved ? styles.success : styles.error}>{message}</p>}</article></section>}
    </main>
  </>;
}

function ResultTable({ title, rows, copy }) {
  if (!rows?.length) return null;
  return <div className={styles.resultBlock}><h3>{title}</h3><div className={styles.tableWrap}><table><thead><tr><th>{copy.item}</th><th>{copy.count}</th></tr></thead><tbody>{rows.map(([item, count]) => <tr key={item}><td dir="auto">{item}</td><td>{count}</td></tr>)}</tbody></table></div></div>;
}

function ResultList({ title, rows }) {
  if (!rows?.length) return null;
  return <div className={styles.resultBlock}><h3>{title}</h3><ul>{rows.map((item, index) => <li key={`${index}-${item}`} dir="auto">{item}</li>)}</ul></div>;
}

function OutputFields({ output, moduleId, copy }) {
  return <dl className={styles.output}>{fieldsFor(moduleId).map((field) => <div key={field}><dt>{copy[field]}</dt><dd>{Array.isArray(output[field]) ? <ul>{output[field].map((item, index) => <li key={`${index}-${item}`} dir="auto">{item}</li>)}</ul> : <span dir="auto">{output[field]}</span>}</dd></div>)}</dl>;
}

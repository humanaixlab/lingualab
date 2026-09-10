import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "../../components/LanguageProvider";
import {
  CLASSIFICATION_REVIEW_DECISIONS,
  TEXT_CLASSIFICATION_MODULES,
  createClassificationReview,
  parseLabeledRows,
  saveClassificationReview,
  trainNaiveBayesBaseline,
} from "../../lib/text-classification-research";
import styles from "../../styles/CorpusResearch.module.css";

const COPY = {
  ar: {
    head: "تصنيف النصوص · تجريب بحثي", back: "العودة إلى البناء", eyebrow: "البيانات ومسارات العمل الحاسوبية", title: "مختبر تصنيف النصوص", badge: "تجريب بحثي",
    lead: "اختبر خط أساس حتميًا، وراجع تصنيفًا مقترحًا بالذكاء الاصطناعي، وافحص الأخطاء مقارنةً بالمرجع البشري.", notice: "المخرجات مقترحات تحليلية مدعومة بالذكاء الاصطناعي، ويظل الباحث مسؤولًا عن التحقق من النتائج واعتمادها في الاستخدام البحثي.",
    baseline: "التصنيف الأساسي", baselineDesc: "درّب خط أساس Naive Bayes على بيانات عربية مصنفة من الباحث.", ai: "التصنيف بمساندة الذكاء الاصطناعي", aiDesc: "اطلب تصنيف نص ضمن فئات مغلقة يحددها الباحث ثم راجع الاقتراح.", errors: "تحليل أخطاء التصنيف", errorsDesc: "قارن توقع النظام بالتصنيف المرجعي البشري وافحص أنماط عدم التطابق.",
    labeledData: "البيانات العربية المصنفة", dataHint: "أدخل في كل سطر: النص، ثم Tab، ثم التصنيف المرجعي. يلزم ستة سجلات على الأقل وثلاثة أمثلة لكل فئة.", sample: "الخدمة ممتازة\tإيجابي\nالتجربة رائعة ومفيدة\tإيجابي\nأعجبني المنتج كثيرًا\tإيجابي\nالخدمة سيئة جدًا\tسلبي\nالتجربة مخيبة للآمال\tسلبي\nلم يعجبني المنتج\tسلبي", run: "تشغيل خط الأساس", invalidData: "أدخل بيانات عربية مصنفة صحيحة: ستة سجلات على الأقل، وفئتان، وثلاثة أمثلة لكل فئة.",
    baselineResults: "نتائج خط الأساس الحتمية", training: "سجلات التدريب", testing: "سجلات الاختبار", accuracy: "الدقة", vocabulary: "حجم المفردات", matrix: "مصفوفة الالتباس", actualPredicted: "المرجع البشري × توقع النظام",
    allowedLabels: "الفئات المسموح بها", labelsHint: "أدخل فئة في كل سطر أو افصل الفئات بفواصل.", arabicText: "النص العربي", textPlaceholder: "ألصق النص المراد تصنيفه…", classify: "حلّل بالذكاء الاصطناعي", classifying: "جارٍ إنشاء الاقتراح…", aiSuggestion: "اقتراح الذكاء الاصطناعي", label: "التصنيف المقترح", evidence: "الدليل النصي", explanation: "التفسير المختصر",
    review: "مراجعة الباحث", accept: "قبول", edit: "تعديل", reject: "رفض", finalLabel: "التصنيف النهائي", finalEvidence: "الدليل النهائي", save: "حفظ النتيجة المراجعة", saved: "حُفظ اقتراح الذكاء الاصطناعي والنتيجة النهائية كلٌ على حدة محليًا.", invalidFinal: "اختر تصنيفًا نهائيًا وأدخل دليلًا من النص الأصلي.", storageError: "تعذر الحفظ محليًا.",
    comparisons: "مقارنة التوقعات بالمرجع البشري", text: "النص", human: "التصنيف المرجعي البشري", prediction: "توقع النظام", status: "الحالة", match: "متطابق", mismatch: "غير متطابق", noBaseline: "شغّل التصنيف الأساسي أولًا لتوفير توقعات مرتبطة بمرجع بشري.", noErrors: "لم تظهر حالات عدم تطابق في عينة الاختبار الحالية.", interpretErrors: "فسّر أنماط الأخطاء بالذكاء الاصطناعي", interpreting: "جارٍ تفسير الأنماط…", errorSummary: "ملخص الأخطاء", patterns: "الأنماط المتكررة", caution: "تنبيه منهجي", requestError: "تعذر إنشاء اقتراح موثوق.",
  },
  en: {
    head: "Text Classification · Research Preview", back: "Back to Build", eyebrow: "DATA & COMPUTATIONAL WORKFLOWS", title: "Text Classification Lab", badge: "Research Preview",
    lead: "Test a deterministic baseline, review an AI classification suggestion, and inspect errors against human reference labels.", notice: "Outputs are AI-supported analytical suggestions. The researcher remains responsible for verifying and approving results for research use.",
    baseline: "Baseline Classification", baselineDesc: "Train a Naive Bayes baseline on researcher-provided labeled Arabic data.", ai: "AI-assisted Classification", aiDesc: "Classify a text within a researcher-defined closed label set, then review the suggestion.", errors: "Error Analysis", errorsDesc: "Compare system predictions with human reference labels and inspect mismatch patterns.",
    labeledData: "Labeled Arabic data", dataHint: "Enter each row as: text, Tab, human reference label. At least six records and three examples per label are required.", sample: "الخدمة ممتازة\tإيجابي\nالتجربة رائعة ومفيدة\tإيجابي\nأعجبني المنتج كثيرًا\tإيجابي\nالخدمة سيئة جدًا\tسلبي\nالتجربة مخيبة للآمال\tسلبي\nلم يعجبني المنتج\tسلبي", run: "Run baseline", invalidData: "Enter valid labeled Arabic data with at least six records, two labels, and three examples per label.",
    baselineResults: "Deterministic baseline results", training: "Training records", testing: "Test records", accuracy: "Accuracy", vocabulary: "Vocabulary size", matrix: "Confusion matrix", actualPredicted: "Human reference × system prediction",
    allowedLabels: "Allowed labels", labelsHint: "Enter one label per line or separate labels with commas.", arabicText: "Arabic text", textPlaceholder: "Paste the Arabic text to classify…", classify: "Analyze with AI", classifying: "Generating suggestion…", aiSuggestion: "AI suggestion", label: "Suggested label", evidence: "Textual evidence", explanation: "Short explanation",
    review: "Researcher review", accept: "Accept", edit: "Modify", reject: "Reject", finalLabel: "Final label", finalEvidence: "Final evidence", save: "Save reviewed result", saved: "The original AI suggestion and final human result were saved separately on this device.", invalidFinal: "Choose a final label and enter evidence copied from the original text.", storageError: "Local storage is unavailable.",
    comparisons: "System predictions compared with human reference", text: "Text", human: "Human reference label", prediction: "System prediction", status: "Status", match: "Match", mismatch: "Mismatch", noBaseline: "Run Baseline Classification first to create predictions tied to human reference labels.", noErrors: "No mismatches occurred in the current test sample.", interpretErrors: "Interpret error patterns with AI", interpreting: "Interpreting patterns…", errorSummary: "Error summary", patterns: "Recurring patterns", caution: "Methodological caution", requestError: "A reliable suggestion could not be generated.",
  },
};

const parseLabels = (value) => [...new Set(value.split(/[\n,،]/).map((item) => item.trim()).filter(Boolean))];

export default function TextClassificationResearch() {
  const { language } = useLanguage();
  const locale = language === "ar" ? "ar" : "en";
  const copy = COPY[locale];
  const [moduleId, setModuleId] = useState("baseline");
  const [datasetInput, setDatasetInput] = useState(copy.sample);
  const [baseline, setBaseline] = useState(null);
  const [labelsInput, setLabelsInput] = useState("إيجابي\nسلبي");
  const [text, setText] = useState("");
  const [aiOutput, setAiOutput] = useState(null);
  const [decision, setDecision] = useState("");
  const [finalOutput, setFinalOutput] = useState({ label: "", evidence: "" });
  const [errorInterpretation, setErrorInterpretation] = useState(null);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const labels = parseLabels(labelsInput);
  const mismatches = baseline?.predictions.filter((item) => !item.match) || [];
  function resetAi() { setAiOutput(null); setDecision(""); setFinalOutput({ label: "", evidence: "" }); setStatus("idle"); setMessage(""); }
  function changeModule(next) { setModuleId(next); setMessage(""); setStatus("idle"); }
  function runBaseline() {
    try { setBaseline(trainNaiveBayesBaseline(parseLabeledRows(datasetInput))); setErrorInterpretation(null); setMessage(""); }
    catch { setBaseline(null); setErrorInterpretation(null); setMessage(copy.invalidData); }
  }
  async function requestClassification(event) {
    event.preventDefault(); setStatus("loading"); setMessage(""); setAiOutput(null); setDecision("");
    try {
      const response = await fetch("/api/text-classification-research", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "classify", uiLanguage: locale, text: text.trim(), allowedLabels: labels }) });
      const payload = await response.json(); if (!response.ok) throw new Error(payload.error || copy.requestError);
      setAiOutput(payload.result); setFinalOutput({ label: payload.result.label, evidence: payload.result.evidence }); setStatus("success");
    } catch (error) { setStatus("error"); setMessage(error.message || copy.requestError); }
  }
  async function requestErrorInterpretation() {
    setStatus("loading"); setMessage(""); setErrorInterpretation(null);
    try {
      const response = await fetch("/api/text-classification-research", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "interpret-errors", uiLanguage: locale, errors: mismatches }) });
      const payload = await response.json(); if (!response.ok) throw new Error(payload.error || copy.requestError);
      setErrorInterpretation(payload.result); setStatus("success");
    } catch (error) { setStatus("error"); setMessage(error.message || copy.requestError); }
  }
  function chooseDecision(next) {
    setDecision(next); setMessage("");
    setFinalOutput(next === "accept" && aiOutput ? { label: aiOutput.label, evidence: aiOutput.evidence } : { label: "", evidence: "" });
  }
  function saveReview() {
    const review = createClassificationReview({ text: text.trim(), allowedLabels: labels, aiOutput, decision, finalOutput });
    if (!review) { setMessage(copy.invalidFinal); return; }
    const saved = saveClassificationReview(review);
    setMessage(saved.ok ? copy.saved : copy.storageError);
  }

  return <>
    <Head><title>{copy.head} · LinguaLab</title></Head>
    <main className={styles.page}>
      <Link className={styles.back} href="/ar-tools#build">← {copy.back}</Link>
      <header className={styles.header}><div><p className={styles.eyebrow}>{copy.eyebrow}</p><h1>{copy.title}</h1><p>{copy.lead}</p></div><span className={styles.previewBadge}>{copy.badge}</span></header>
      <p className={styles.notice}>{copy.notice}</p>
      <div className={styles.moduleTabs} role="tablist">
        {TEXT_CLASSIFICATION_MODULES.map((id) => {
          const key = id === "baseline" ? "baseline" : id === "ai-assisted" ? "ai" : "errors";
          return <button type="button" role="tab" aria-selected={moduleId === id} className={moduleId === id ? styles.activeTab : ""} onClick={() => changeModule(id)} key={id}><strong>{copy[key]}</strong><span>{copy[`${key}Desc`]}</span></button>;
        })}
      </div>

      {moduleId === "baseline" && <section className={styles.module} aria-labelledby="baseline-title">
        <article className={styles.card}><h2 id="baseline-title">{copy.baseline}</h2><label>{copy.labeledData}<textarea lang="ar" dir="rtl" value={datasetInput} onChange={(event) => { setDatasetInput(event.target.value); setBaseline(null); setErrorInterpretation(null); setMessage(""); }} /></label><p className={styles.hint}>{copy.dataHint}</p><button type="button" className={styles.primaryButton} onClick={runBaseline}>{copy.run}</button>{message && <p className={styles.error}>{message}</p>}</article>
        <article className={styles.card}><h2>{copy.baselineResults}</h2>{baseline ? <><div className={styles.metrics}><Metric value={baseline.trainCount} label={copy.training} /><Metric value={baseline.testCount} label={copy.testing} /><Metric value={`${(baseline.accuracy * 100).toFixed(1)}%`} label={copy.accuracy} /><Metric value={baseline.vocabularySize} label={copy.vocabulary} /></div><ConfusionMatrix result={baseline} copy={copy} /></> : <p className={styles.empty}>{copy.invalidData}</p>}</article>
      </section>}

      {moduleId === "ai-assisted" && <section className={styles.module} aria-labelledby="ai-classification-title">
        <form className={styles.card} onSubmit={requestClassification}><h2 id="ai-classification-title">{copy.ai}</h2><label>{copy.allowedLabels}<textarea value={labelsInput} onChange={(event) => { setLabelsInput(event.target.value); resetAi(); }} /></label><p className={styles.hint}>{copy.labelsHint}</p><label>{copy.arabicText}<textarea required lang="ar" dir="rtl" value={text} onChange={(event) => { setText(event.target.value); resetAi(); }} placeholder={copy.textPlaceholder} /></label><button className={styles.primaryButton} disabled={status === "loading" || labels.length < 2 || !text.trim()}>{status === "loading" ? copy.classifying : copy.classify}</button>{status === "error" && <p className={styles.error}>{message}</p>}</form>
        <div className={styles.stack}>{aiOutput && <><article className={styles.card}><h2>{copy.aiSuggestion}</h2><dl className={styles.output}><Output label={copy.label} value={aiOutput.label} /><Output label={copy.evidence} value={aiOutput.evidence} /><Output label={copy.explanation} value={aiOutput.explanation} /></dl></article><article className={styles.card}><h2>{copy.review}</h2><div className={styles.decisions}>{CLASSIFICATION_REVIEW_DECISIONS.map((id) => <button type="button" aria-pressed={decision === id} onClick={() => chooseDecision(id)} key={id}>{copy[id]}</button>)}</div>{(decision === "edit" || decision === "reject") && <div className={styles.editFields}><label>{copy.finalLabel}<select value={finalOutput.label} onChange={(event) => setFinalOutput((current) => ({ ...current, label: event.target.value }))}><option value="">—</option>{labels.map((label) => <option key={label}>{label}</option>)}</select></label><label>{copy.finalEvidence}<textarea lang="ar" dir="rtl" value={finalOutput.evidence} onChange={(event) => setFinalOutput((current) => ({ ...current, evidence: event.target.value }))} /></label></div>}{decision && <button type="button" className={styles.primaryButton} onClick={saveReview}>{copy.save}</button>}{message && status !== "error" && <p className={message === copy.saved ? styles.success : styles.error}>{message}</p>}</article></>}</div>
      </section>}

      {moduleId === "error-analysis" && <section aria-labelledby="error-analysis-title"><article className={styles.card}><h2 id="error-analysis-title">{copy.errors}</h2>{!baseline ? <p className={styles.empty}>{copy.noBaseline}</p> : <><ComparisonTable rows={baseline.predictions} copy={copy} />{mismatches.length ? <button type="button" className={styles.primaryButton} disabled={status === "loading"} onClick={requestErrorInterpretation}>{status === "loading" ? copy.interpreting : copy.interpretErrors}</button> : <p className={styles.hint}>{copy.noErrors}</p>}</>}{status === "error" && <p className={styles.error}>{message}</p>}</article>{errorInterpretation && <article className={styles.card}><h2>{copy.errorSummary}</h2><dl className={styles.output}><Output label={copy.errorSummary} value={errorInterpretation.summary} /><Output label={copy.patterns} value={errorInterpretation.patterns} /><Output label={copy.caution} value={errorInterpretation.caution} /></dl></article>}</section>}
    </main>
  </>;
}

function Metric({ value, label }) { return <div><strong>{value}</strong><span>{label}</span></div>; }
function Output({ label, value }) { return <div><dt>{label}</dt><dd dir="auto">{Array.isArray(value) ? <ul>{value.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul> : value}</dd></div>; }

function ConfusionMatrix({ result, copy }) {
  return <div className={styles.resultBlock}><h3>{copy.matrix}</h3><p className={styles.hint}>{copy.actualPredicted}</p><div className={styles.tableWrap}><table><thead><tr><th></th>{result.labels.map((label) => <th key={label} dir="auto">{label}</th>)}</tr></thead><tbody>{result.labels.map((label, row) => <tr key={label}><th dir="auto">{label}</th>{result.confusionMatrix[row].map((count, column) => <td key={result.labels[column]}>{count}</td>)}</tr>)}</tbody></table></div></div>;
}

function ComparisonTable({ rows, copy }) {
  return <div className={styles.resultBlock}><h3>{copy.comparisons}</h3><div className={styles.tableWrap}><table><thead><tr><th>{copy.text}</th><th>{copy.human}</th><th>{copy.prediction}</th><th>{copy.status}</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td dir="auto">{row.text}</td><td dir="auto">{row.humanLabel}</td><td dir="auto">{row.systemPrediction}</td><td>{row.match ? copy.match : copy.mismatch}</td></tr>)}</tbody></table></div></div>;
}

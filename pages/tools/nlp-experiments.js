import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "../../components/LanguageProvider";
import ComputationalWorkbench from "../../components/ComputationalWorkbench";
import {
  COMPARISON_CHOICES,
  NLP_EXPERIMENT_MODULES,
  SANDBOX_DECISIONS,
  createComparisonReview,
  createSandboxReview,
  parseAllowedLabels,
  saveNlpExperimentReview,
} from "../../lib/nlp-experiments";
import styles from "../../styles/CorpusResearch.module.css";

const COPY = {
  ar: {
    head: "تجارب تقنيات اللغة · تجريب بحثي", back: "العودة إلى البناء", eyebrow: "البيانات ومسارات العمل الحاسوبية", title: "مختبر تجارب NLP", badge: "تجريب بحثي",
    lead: "اختبر أثر التعليمات، وقارن المخرجات، ونفّذ مهمة لغوية محددة مع إبقاء الحكم النهائي بيد الباحث.", notice: "المخرجات مقترحات تحليلية مدعومة بالذكاء الاصطناعي، ويظل الباحث مسؤولًا عن التحقق من النتائج واعتمادها في الاستخدام البحثي.",
    prompt: "تجربة التعليمات", promptDesc: "نفّذ المهمة والنص نفسيهما بتعليمات أ وب ثم قيّم النتيجتين.", comparison: "مقارنة المخرجات", comparisonDesc: "قارن مخرجين محفوظين للمهمة نفسها دون إعلان فائز تلقائي.", sandbox: "مختبر مهام NLP", sandboxDesc: "حدّد مهمة وبنية مخرجات أو فئات مسموحة ثم راجع النتيجة المنظمة.",
    task: "المهمة اللغوية الثابتة", taskPlaceholder: "مثال: صنّف الموقف في النص", text: "النص العربي الثابت", textPlaceholder: "ألصق النص العربي المستخدم في التجربة…", variantA: "التعليمات أ (Variant A)", variantB: "التعليمات ب (Variant B)", runPrompt: "تشغيل التجربتين", running: "جارٍ تشغيل التجربة…", outputA: "مخرج أ", outputB: "مخرج ب", researcherEvaluation: "تقييم الباحث", betterA: "أفضل أ", betterB: "أفضل ب", tie: "متقاربان", reason: "سبب الاختيار", reasonPlaceholder: "وضّح معيار المقارنة وسبب الحكم…", saveEvaluation: "حفظ تقييم الباحث", saved: "حُفظت المخرجات الأصلية وتقييم الباحث محليًا.",
    comparisonTask: "المهمة المشتركة", originalA: "المخرج الأصلي أ", originalB: "المخرج الأصلي ب", compare: "تحليل الفروق", comparing: "جارٍ تحليل الفروق…", comparisonResult: "تحليل المقارنة", categoryDecision: "الفئة أو القرار", textualEvidence: "الدليل النصي", explanation: "التفسير", consistency: "الاتساق", noWinner: "لا تختار LinguaLab فائزًا؛ القرار للباحث.",
    taskName: "اسم المهمة", instruction: "تعليمات المهمة", labels: "الفئات المسموح بها", labelsHint: "أدخل فئة في كل سطر، أو اتركها فارغة إذا حددت بنية متوقعة.", expected: "بنية المخرج المتوقعة", expectedHint: "صف البنية المطلوبة إذا لم تكن المهمة تصنيفًا مغلقًا.", runSandbox: "تشغيل المهمة", aiSuggestion: "اقتراح الذكاء الاصطناعي", label: "الفئة", evidence: "الدليل", result: "المخرج المنظم", review: "مراجعة الباحث", accept: "قبول", edit: "تعديل", reject: "رفض", final: "النتيجة النهائية المراجعة", finalHint: "عدّل JSON مع الحفاظ على الفئات المحددة والأدلة النصية الصحيحة.", saveReview: "حفظ المراجعة", invalidReview: "أكمل قرار الباحث وسببه أو أدخل نتيجة نهائية صحيحة.", storageError: "تعذر الحفظ محليًا.", requestError: "تعذر تنفيذ التجربة بصورة موثوقة.",
  },
  en: {
    head: "Language Technology & NLP Experiments · Research Preview", back: "Back to Build", eyebrow: "DATA & COMPUTATIONAL WORKFLOWS", title: "NLP Experiments Lab", badge: "Research Preview",
    lead: "Test instruction effects, compare outputs, and run a defined linguistic task while keeping final judgment with the researcher.", notice: "Outputs are AI-supported analytical suggestions. The researcher remains responsible for verifying and approving results for research use.",
    prompt: "Prompt Experiment", promptDesc: "Run the same task and text with instruction variants A and B, then evaluate both outputs.", comparison: "Model Output Comparison", comparisonDesc: "Compare two preserved outputs for the same task without an automatic winner.", sandbox: "NLP Task Sandbox", sandboxDesc: "Define a task and expected structure or allowed labels, then review the structured result.",
    task: "Fixed linguistic task", taskPlaceholder: "Example: Classify the stance in the text", text: "Fixed Arabic input", textPlaceholder: "Paste the Arabic text used for both variants…", variantA: "Variant A instruction", variantB: "Variant B instruction", runPrompt: "Run both variants", running: "Running experiment…", outputA: "Variant A output", outputB: "Variant B output", researcherEvaluation: "Researcher evaluation", betterA: "A is better", betterB: "B is better", tie: "Comparable", reason: "Reason for the judgment", reasonPlaceholder: "State the comparison criterion and reason…", saveEvaluation: "Save researcher evaluation", saved: "The original outputs and researcher evaluation were saved locally.",
    comparisonTask: "Shared task", originalA: "Original output A", originalB: "Original output B", compare: "Analyze differences", comparing: "Analyzing differences…", comparisonResult: "Comparison analysis", categoryDecision: "Category or decision", textualEvidence: "Textual evidence", explanation: "Explanation", consistency: "Consistency", noWinner: "LinguaLab does not select a winner; the researcher decides.",
    taskName: "Task name", instruction: "Task instruction", labels: "Allowed output labels", labelsHint: "Enter one label per line, or leave empty when an expected structure is defined.", expected: "Expected output structure", expectedHint: "Describe the required structure when this is not a closed-label task.", runSandbox: "Run task", aiSuggestion: "AI suggestion", label: "Label", evidence: "Evidence", result: "Structured result", review: "Researcher review", accept: "Accept", edit: "Modify", reject: "Reject", final: "Final reviewed result", finalHint: "Edit the JSON while preserving allowed labels and valid textual evidence.", saveReview: "Save review", invalidReview: "Complete the researcher decision and reason, or enter a valid final result.", storageError: "Local storage is unavailable.", requestError: "The experiment could not be run reliably.",
  },
};

const moduleCopy = { "prompt-experiment": ["prompt", "promptDesc"], "output-comparison": ["comparison", "comparisonDesc"], "task-sandbox": ["sandbox", "sandboxDesc"] };
const WORKBENCH = {
  ar: [["مدخل ثابت", "النص والمهمة"], ["إعداد التجربة", "تعليمات أو فئات أو بنية"], ["تشغيل تجريبي", "إجراء صريح"], ["مخرجات منظمة", "حفظ أ وب دون تغيير"], ["المقارنة", "الفئة والدليل والتفسير والاتساق"], ["تقييم الباحث", "لا فائز تلقائيًا"], ["فحص الأخطاء", "سجّل سبب الحكم"], ["التحسين", "عدّل الإعداد ثم أعد التشغيل"]],
  en: [["Fixed Input", "Text and task"], ["Experiment Setup", "Instructions, labels, or structure"], ["Experiment Run", "Explicit action"], ["Structured Outputs", "Preserved A and B outputs"], ["Comparison", "Decision, evidence, explanation, consistency"], ["Researcher Evaluation", "No automatic winner"], ["Error Inspection", "Record the reason"], ["Improvement", "Adjust setup, then re-run"]],
};

export default function NlpExperiments() {
  const { language } = useLanguage();
  const locale = language === "ar" ? "ar" : "en";
  const copy = COPY[locale];
  const [moduleId, setModuleId] = useState("prompt-experiment");
  const [task, setTask] = useState(""); const [text, setText] = useState("");
  const [variantA, setVariantA] = useState(""); const [variantB, setVariantB] = useState("");
  const [promptOutputs, setPromptOutputs] = useState(null);
  const [outputA, setOutputA] = useState(""); const [outputB, setOutputB] = useState(""); const [comparison, setComparison] = useState(null);
  const [choice, setChoice] = useState(""); const [reason, setReason] = useState("");
  const [taskName, setTaskName] = useState(""); const [instruction, setInstruction] = useState(""); const [allowedLabels, setAllowedLabels] = useState(""); const [expectedStructure, setExpectedStructure] = useState("");
  const [sandboxOutput, setSandboxOutput] = useState(null); const [decision, setDecision] = useState(""); const [finalJson, setFinalJson] = useState("{}");
  const [status, setStatus] = useState("idle"); const [message, setMessage] = useState("");

  function clearStatus() { setStatus("idle"); setMessage(""); }
  function changeModule(next) { setModuleId(next); clearStatus(); setChoice(""); setReason(""); }
  async function callApi(body) {
    const response = await fetch("/api/nlp-experiments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, uiLanguage: locale }) });
    const payload = await response.json(); if (!response.ok) throw new Error(payload.error || copy.requestError); return payload.result;
  }
  async function runPrompt(event) {
    event.preventDefault(); setStatus("loading"); setMessage(""); setPromptOutputs(null); setChoice(""); setReason("");
    try { setPromptOutputs(await callApi({ action: "prompt-experiment", task, text, variantA, variantB })); setStatus("success"); }
    catch (error) { setStatus("error"); setMessage(error.message || copy.requestError); }
  }
  async function runComparison(event) {
    event.preventDefault(); setStatus("loading"); setMessage(""); setComparison(null); setChoice(""); setReason("");
    try { setComparison(await callApi({ action: "compare-outputs", task, outputA, outputB })); setStatus("success"); }
    catch (error) { setStatus("error"); setMessage(error.message || copy.requestError); }
  }
  async function runSandbox(event) {
    event.preventDefault(); setStatus("loading"); setMessage(""); setSandboxOutput(null); setDecision("");
    try { const result = await callApi({ action: "task-sandbox", taskName, instruction, allowedLabels, expectedStructure, text }); setSandboxOutput(result); setFinalJson(JSON.stringify(result, null, 2)); setStatus("success"); }
    catch (error) { setStatus("error"); setMessage(error.message || copy.requestError); }
  }
  function saveComparison() {
    const inputs = moduleId === "prompt-experiment" ? { task, text, variantA, variantB } : { task, outputA, outputB };
    const outputs = moduleId === "prompt-experiment" ? promptOutputs : { outputA, outputB, analysis: comparison };
    const review = createComparisonReview({ moduleId, inputs, outputs, choice, reason });
    if (!review) { setMessage(copy.invalidReview); return; }
    setMessage(saveNlpExperimentReview(review).ok ? copy.saved : copy.storageError);
  }
  function chooseDecision(next) { setDecision(next); setMessage(""); setFinalJson(next === "reject" ? "{}" : JSON.stringify(sandboxOutput, null, 2)); }
  function saveSandbox() {
    let finalOutput; try { finalOutput = JSON.parse(finalJson); } catch { setMessage(copy.invalidReview); return; }
    const inputs = { taskName, instruction, expectedStructure, allowedLabels: parseAllowedLabels(allowedLabels), text };
    const review = createSandboxReview({ inputs, aiOutput: sandboxOutput, decision, finalOutput });
    if (!review) { setMessage(copy.invalidReview); return; }
    setMessage(saveNlpExperimentReview(review).ok ? copy.saved : copy.storageError);
  }

  return <><Head><title>{copy.head} · LinguaLab</title></Head><main className={styles.page}>
    <Link className={styles.back} href="/ar-tools#build">← {copy.back}</Link><header className={styles.header}><div><p className={styles.eyebrow}>{copy.eyebrow}</p><h1>{copy.title}</h1><p>{copy.lead}</p></div><span className={styles.previewBadge}>{copy.badge}</span></header><p className={styles.notice}>{copy.notice}</p>
    <ComputationalWorkbench language={locale} methodType="ai" stages={WORKBENCH[locale].map(([label, detail]) => ({ label, detail }))} />
    <div className={styles.moduleTabs} role="tablist">{NLP_EXPERIMENT_MODULES.map((id) => <button type="button" role="tab" aria-selected={moduleId === id} className={moduleId === id ? styles.activeTab : ""} onClick={() => changeModule(id)} key={id}><strong>{copy[moduleCopy[id][0]]}</strong><span>{copy[moduleCopy[id][1]]}</span></button>)}</div>
    {moduleId === "prompt-experiment" && <section className={styles.module}><form className={styles.card} onSubmit={runPrompt}><h2>{copy.prompt}</h2><Field label={copy.task} value={task} setValue={setTask} placeholder={copy.taskPlaceholder} /><Field label={copy.text} value={text} setValue={setText} placeholder={copy.textPlaceholder} arabic /><Field label={copy.variantA} value={variantA} setValue={setVariantA} /><Field label={copy.variantB} value={variantB} setValue={setVariantB} /><RunButton status={status} copy={copy} label={copy.runPrompt} /></form><div className={styles.stack}>{promptOutputs && <><div className={styles.reviewGrid}><ResultCard title={copy.outputA} value={promptOutputs.variantA} /><ResultCard title={copy.outputB} value={promptOutputs.variantB} /></div><Evaluation copy={copy} choice={choice} setChoice={setChoice} reason={reason} setReason={setReason} save={saveComparison} /></>}</div></section>}
    {moduleId === "output-comparison" && <section className={styles.module}><form className={styles.card} onSubmit={runComparison}><h2>{copy.comparison}</h2><Field label={copy.comparisonTask} value={task} setValue={setTask} /><Field label={copy.originalA} value={outputA} setValue={setOutputA} /><Field label={copy.originalB} value={outputB} setValue={setOutputB} /><RunButton status={status} copy={copy} label={copy.compare} loading={copy.comparing} /></form><div className={styles.stack}>{comparison && <><article className={styles.card}><h2>{copy.comparisonResult}</h2><p className={styles.notice}>{copy.noWinner}</p><dl className={styles.output}>{["categoryDecision", "textualEvidence", "explanation", "consistency"].map((field) => <div key={field}><dt>{copy[field]}</dt><dd dir="auto">{comparison[field]}</dd></div>)}</dl></article><Evaluation copy={copy} choice={choice} setChoice={setChoice} reason={reason} setReason={setReason} save={saveComparison} /></>}</div></section>}
    {moduleId === "task-sandbox" && <section className={styles.module}><form className={styles.card} onSubmit={runSandbox}><h2>{copy.sandbox}</h2><Field label={copy.taskName} value={taskName} setValue={setTaskName} /><Field label={copy.instruction} value={instruction} setValue={setInstruction} /><Field label={copy.labels} value={allowedLabels} setValue={setAllowedLabels} hint={copy.labelsHint} /><Field label={copy.expected} value={expectedStructure} setValue={setExpectedStructure} hint={copy.expectedHint} /><Field label={copy.text} value={text} setValue={setText} arabic /><RunButton status={status} copy={copy} label={copy.runSandbox} /></form><div className={styles.stack}>{sandboxOutput && <><article className={styles.card}><h2>{copy.aiSuggestion}</h2><dl className={styles.output}>{["label", "evidence", "result", "explanation"].map((field) => <div key={field}><dt>{copy[field]}</dt><dd dir="auto">{sandboxOutput[field]}</dd></div>)}</dl></article><article className={styles.card}><h2>{copy.review}</h2><div className={styles.decisions}>{SANDBOX_DECISIONS.map((id) => <button type="button" aria-pressed={decision === id} onClick={() => chooseDecision(id)} key={id}>{copy[id]}</button>)}</div>{(decision === "edit" || decision === "reject") && <div className={styles.editFields}><label>{copy.final}<textarea dir="ltr" value={finalJson} onChange={(event) => setFinalJson(event.target.value)} /></label><p className={styles.hint}>{copy.finalHint}</p></div>}{decision && <button className={styles.primaryButton} type="button" onClick={saveSandbox}>{copy.saveReview}</button>}</article></>}</div></section>}
    {status === "error" && <p className={styles.error}>{message}</p>}{message && status !== "error" && <p className={message === copy.saved ? styles.success : styles.error}>{message}</p>}
  </main></>;
}

function Field({ label, value, setValue, placeholder = "", hint = "", arabic = false }) { return <label>{label}<textarea required={!hint} lang={arabic ? "ar" : undefined} dir={arabic ? "rtl" : "auto"} value={value} onChange={(event) => setValue(event.target.value)} placeholder={placeholder} />{hint && <small>{hint}</small>}</label>; }
function RunButton({ status, copy, label, loading }) { return <button className={styles.primaryButton} disabled={status === "loading"}>{status === "loading" ? (loading || copy.running) : label}</button>; }
function ResultCard({ title, value }) { return <article className={styles.card}><h2>{title}</h2><p dir="auto">{value}</p></article>; }
function Evaluation({ copy, choice, setChoice, reason, setReason, save }) { return <article className={styles.card}><h2>{copy.researcherEvaluation}</h2><div className={styles.decisions}>{COMPARISON_CHOICES.map((id) => <button type="button" aria-pressed={choice === id} onClick={() => setChoice(id)} key={id}>{copy[id === "a" ? "betterA" : id === "b" ? "betterB" : "tie"]}</button>)}</div><Field label={copy.reason} value={reason} setValue={setReason} placeholder={copy.reasonPlaceholder} /><button type="button" className={styles.primaryButton} onClick={save}>{copy.saveEvaluation}</button></article>; }

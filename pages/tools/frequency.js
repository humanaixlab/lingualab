import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { useLanguage } from "../../components/LanguageProvider";
import { createReportContext } from "../../lib/report-context";
import { createAnalysisHandoff, readAnalysisResultHandoff } from "../../lib/analysis-handoff";
import { createCorpusWorkflowHandoff, readCorpusWorkflowHandoff } from "../../lib/corpus-workflow-context";
import styles from "../../styles/AnalysisTool.module.css";

export default function Frequency() {
  const { language } = useLanguage();
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [workflowSource, setWorkflowSource] = useState(null);

  useEffect(() => {
    const restored = readAnalysisResultHandoff(window.location.search, "frequency");
    const incoming = readCorpusWorkflowHandoff(window.location.search, "frequency");
    if (restored) {
      setText(restored.text);
      setResult(JSON.stringify(Object.fromEntries(restored.evidence.frequencies), null, 2));
      setWorkflowSource(restored);
    } else if (incoming) {
      setText(incoming.text);
      setWorkflowSource(incoming);
    }
  }, []);

  const frequencies = () => Object.entries(JSON.parse(result)).sort((a, b) => b[1] - a[1]);
  const analyze = () => {
    const words = text.split(" ");
    const freq = {};
    words.forEach((word) => { freq[word] = (freq[word] || 0) + 1; });
    setResult(JSON.stringify(freq, null, 2));
  };
  const inCorpusPath = workflowSource || (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("researchPath") === "corpus-linguistics");

  const generateReport = () => {
    const url = createReportContext("frequency", "frequency", {
      wordCount: text.split(/\s+/).filter(Boolean).length,
      frequencies: frequencies(),
      summary: language === "ar" ? "يعرض التقرير توزيع الكلمات المرصود في النص المدخل." : "This report presents the observed word distribution in the submitted text.",
      pathId: inCorpusPath ? "corpus-linguistics" : null,
    });
    if (url) window.location.href = url;
  };
  const interpretResults = () => {
    const url = createAnalysisHandoff("frequency", "frequency", { text, frequencies: frequencies() });
    if (url) window.location.href = url;
  };
  const continueWorkflow = () => {
    const url = createCorpusWorkflowHandoff("frequency", "concordance", { text, result: { frequencies: frequencies() } });
    if (url) window.location.href = url;
  };

  return <Layout title={language === "ar" ? "تحليل التكرار" : "Frequency Analysis"} backHref={inCorpusPath ? "/research-paths/corpus-linguistics" : "/tools/analyze"} backLabel={language === "ar" ? (inCorpusPath ? "العودة إلى مسار لسانيات المدونات" : "العودة إلى مركز التحليل") : (inCorpusPath ? "Back to Corpus Linguistics path" : "Back to Analyze")} description={language === "ar" ? "استكشف تكرار الكلمات والأنماط المعجمية في نصك البحثي." : "Explore word frequency and lexical patterns in your research text."} dataSource={inCorpusPath ? "research-path" : "standalone"}>
    {workflowSource && <p>{language === "ar" ? "تم نقل نص المدونة من المرحلة السابقة. راجعه ثم شغّل التحليل." : "Corpus text was transferred from the previous stage. Review it, then run the analysis."}</p>}
    <textarea rows={6} placeholder={language === "ar" ? "ألصق النص هنا…" : "Paste text here…"} value={text} onChange={(e) => setText(e.target.value)} className={styles.control} />
    <div className={styles.actions}><button className={styles.button} onClick={analyze}>{language === "ar" ? "ابدأ التحليل" : "Run analysis"}</button></div>
    {result && <section className={styles.result}><h2>{language === "ar" ? "النتائج" : "Results"}</h2><pre>{result}</pre><div className={styles.actions}>
      <button className={styles.button} type="button" onClick={continueWorkflow}>{language === "ar" ? "متابعة إلى تحليل السياقات" : "Continue to Concordance / Contexts"}</button>
      <button className={`${styles.button} ${styles.next}`} type="button" onClick={interpretResults}>{language === "ar" ? "فسّر النتائج" : "Interpret results"}</button>
      <button className={`${styles.button} ${styles.next}`} type="button" onClick={generateReport}>{language === "ar" ? "إنشاء تقرير" : "Generate Report"}</button>
    </div></section>}
  </Layout>;
}

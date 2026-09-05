import { useState } from "react";
import Layout from "../../components/Layout";
import { useLanguage } from "../../components/LanguageProvider";
import { createReportContext } from "../../lib/report-context";
import { createAnalysisHandoff } from "../../lib/analysis-handoff";
import styles from "../../styles/AnalysisTool.module.css";

export default function Frequency() {
  const { language } = useLanguage();
  const [text, setText] = useState("");
  const [result, setResult] = useState("");

  const analyze = () => {
    const words = text.split(" ");
    const freq = {};

    words.forEach((word) => {
      freq[word] = (freq[word] || 0) + 1;
    });

    setResult(JSON.stringify(freq, null, 2));
  };

  const generateReport = () => {
    const frequencies = Object.entries(JSON.parse(result)).sort((a, b) => b[1] - a[1]);
    const url = createReportContext("frequency", "frequency", {
      wordCount: text.split(/\s+/).filter(Boolean).length,
      frequencies,
      summary: language === "ar" ? "يعرض التقرير توزيع الكلمات المرصود في النص المدخل." : "This report presents the observed word distribution in the submitted text.",
    });
    if (url) window.location.href = url;
  };

  const interpretResults = () => {
    const url = createAnalysisHandoff("frequency", "frequency", {
      text,
      frequencies: Object.entries(JSON.parse(result)).sort((a, b) => b[1] - a[1]),
    });
    if (url) window.location.href = url;
  };

  return (
    <Layout
      title={language === "ar" ? "تحليل التكرار" : "Frequency Analysis"}
      backHref="/tools/analyze"
      backLabel={language === "ar" ? "العودة إلى مركز التحليل" : "Back to Analyze"}
      description={language === "ar" ? "استكشف تكرار الكلمات والأنماط المعجمية في نصك البحثي." : "Explore word frequency and lexical patterns in your research text."}
      dataSource="standalone"
    >

      <textarea
        rows={6}
        placeholder={language === "ar" ? "ألصق النص هنا…" : "Paste text here…"}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className={styles.control}
      />
      <div className={styles.actions}><button className={styles.button} onClick={analyze}>{language === "ar" ? "ابدأ التحليل" : "Run analysis"}</button></div>
      {result && <section className={styles.result}><h2>{language === "ar" ? "النتائج" : "Results"}</h2><pre>{result}</pre><div className={styles.actions}><button className={`${styles.button} ${styles.next}`} type="button" onClick={interpretResults}>{language === "ar" ? "فسّر النتائج" : "Interpret results"}</button><button className={`${styles.button} ${styles.next}`} type="button" onClick={generateReport}>{language === "ar" ? "إنشاء تقرير" : "Generate Report"}</button></div></section>}
    </Layout>
  );
}

import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { useLanguage } from "../../components/LanguageProvider";
import styles from "../../styles/AnalysisTool.module.css";
import { createReportContext } from "../../lib/report-context";
import { createAnalysisHandoff, readAnalysisResultHandoff } from "../../lib/analysis-handoff";
import { readCorpusWorkflowHandoff } from "../../lib/corpus-workflow-context";

export default function NgramsTool() {
  const { language } = useLanguage();
  const [text, setText] = useState("");
  const [size, setSize] = useState(2);
  const [results, setResults] = useState([]);
  const [workflowSource, setWorkflowSource] = useState(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const restored = readAnalysisResultHandoff(window.location.search, "ngrams");
      const incoming = readCorpusWorkflowHandoff(window.location.search, "ngrams");
      if (restored) { setText(restored.text); setSize(restored.evidence.size); setResults(restored.evidence.results); setWorkflowSource(restored); }
      else if (incoming) { setText(incoming.text); setWorkflowSource(incoming); }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const inCorpusPath = workflowSource || (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("researchPath") === "corpus-linguistics");

  const analyzeNgrams = () => {
    if (!text.trim()) return;

    const words = text
      .replace(/[.,!?،؛:]/g, "")
      .split(/\s+/)
      .filter(Boolean);

    const grams = {};

    for (let i = 0; i <= words.length - size; i++) {
      const gram = words.slice(i, i + size).join(" ");
      grams[gram] = (grams[gram] || 0) + 1;
    }

    const sorted = Object.entries(grams).sort((a, b) => b[1] - a[1]);
    setResults(sorted);

    if (typeof window !== "undefined") {
      localStorage.setItem("ngrams_done", "true");
    }
  };

  const loadSample = () => {
    setText("اللغة العربية لغة جميلة واللغة العربية لغة واسعة واللغة العربية لغة حية");
    setResults([]);
  };

  const clearAll = () => {
    setText("");
    setResults([]);
  };

  const generateReport = () => {
    const url = createReportContext("ngrams", "ngrams", {
      size,
      results,
      summary: language === "ar" ? "يعرض التقرير المتتاليات اللفظية الأكثر تكرارًا في النص المدخل." : "This report presents the most frequent word sequences in the submitted text.",
      pathId: inCorpusPath ? "corpus-linguistics" : null,
    });
    if (url) window.location.href = url;
  };

  const interpretResults = () => {
    const url = createAnalysisHandoff("ngrams", "ngrams", { text, size, results });
    if (url) window.location.href = url;
  };

  return (
    <Layout title={language === "ar" ? "المتتاليات اللفظية" : "N-grams"} backHref={inCorpusPath ? "/research-paths/corpus-linguistics" : "/tools/analyze"} backLabel={language === "ar" ? (inCorpusPath ? "العودة إلى مسار لسانيات المدونات" : "العودة إلى مركز التحليل") : (inCorpusPath ? "Back to Corpus Linguistics path" : "Back to Analyze")} description={language === "ar" ? "اكتشف المتتاليات اللفظية والعبارات المتجاورة المتكررة في النص." : "Discover recurring word sequences and adjacent phrases in the text."} dataSource={inCorpusPath ? "research-path" : "standalone"}>
      {workflowSource && <p>{language === "ar" ? "تم نقل نص المدونة من مرحلة السياقات. راجعه ثم شغّل التحليل." : "Corpus text was transferred from the contexts stage. Review it, then run the analysis."}</p>}

      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
          {language === "ar" ? "اختر نوع المتتالية" : "Choose sequence type"}
        </label>
        <select
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className={styles.control}
        >
          <option value={2}>{language === "ar" ? "ثنائيات (Bigrams)" : "Bigrams"}</option>
          <option value={3}>{language === "ar" ? "ثلاثيات (Trigrams)" : "Trigrams"}</option>
        </select>
      </div>

      <textarea
        rows="8"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={language === "ar" ? "ألصق النص هنا…" : "Paste text here…"}
        className={styles.control}
      />

      <div className={styles.actions}>
        <button
          onClick={analyzeNgrams}
          className={styles.button}
        >
          {language === "ar" ? "تحليل المتتاليات" : "Analyze sequences"}
        </button>

        <button
          onClick={clearAll}
          className={styles.danger}
        >
          {language === "ar" ? "مسح" : "Clear"}
        </button>

        <button
          onClick={loadSample}
          className={styles.secondary}
        >
          {language === "ar" ? "تحميل مثال" : "Load example"}
        </button>
      </div>

      {results.length > 0 && (
        <section className={styles.result}>
          <h2>{language === "ar" ? "النتائج" : "Results"}</h2>

          <div className={styles.tableWrap}><table className={styles.table}>
            <thead>
              <tr><th>{language === "ar" ? "المتتالية" : "Sequence"}</th><th>{language === "ar" ? "عدد التكرارات" : "Frequency"}</th>
              </tr>
            </thead>
            <tbody>
              {results.map(([gram, count], index) => (
                <tr key={index}>
                  <td>
                    {gram}
                  </td>
                  <td>
                    {count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
          <div className={styles.actions}><button className={`${styles.button} ${styles.next}`} type="button" onClick={interpretResults}>{language === "ar" ? "فسّر النتائج" : "Interpret results"}</button><button className={`${styles.button} ${styles.next}`} type="button" onClick={generateReport}>{language === "ar" ? "إنشاء تقرير" : "Generate Report"}</button></div>
        </section>
      )}

      <div className={styles.note}>
        <h2>{language === "ar" ? "ماذا تعني هذه النتيجة؟" : "What does this result mean?"}</h2>
        <p>{language === "ar" ? "تعرض النتائج أكثر العبارات القصيرة تكرارًا للمساعدة في اكتشاف الأنماط اللغوية والتراكيب الشائعة." : "The results identify frequent short phrases to support discovery of recurring linguistic patterns."}</p>
      </div>
    </Layout>
  );
}

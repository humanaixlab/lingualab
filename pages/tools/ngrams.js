import { useState } from "react";
import Layout from "../../components/Layout";
import Link from "next/link";
import { useLanguage } from "../../components/LanguageProvider";
import styles from "../../styles/AnalysisTool.module.css";
import { createReportContext } from "../../lib/report-context";

export default function NgramsTool() {
  const { language } = useLanguage();
  const [text, setText] = useState("");
  const [size, setSize] = useState(2);
  const [results, setResults] = useState([]);

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
    });
    if (url) window.location.href = url;
  };

  return (
    <Layout title={language === "ar" ? "المتتاليات اللفظية" : "N-grams"} backHref="/tools/analyze" backLabel={language === "ar" ? "العودة إلى مركز التحليل" : "Back to Analyze"} description={language === "ar" ? "اكتشف المتتاليات اللفظية والعبارات المتجاورة المتكررة في النص." : "Discover recurring word sequences and adjacent phrases in the text."}>

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
          <div className={styles.actions}><button className={`${styles.button} ${styles.next}`} type="button" onClick={generateReport}>{language === "ar" ? "إنشاء تقرير" : "Generate Report"}</button><Link className={`${styles.button} ${styles.next}`} href="/tools/analyze">{language === "ar" ? "فسّر النتائج بالذكاء الاصطناعي" : "Interpret results with AI"}</Link></div>
        </section>
      )}

      <div className={styles.note}>
        <h2>{language === "ar" ? "ماذا تعني هذه النتيجة؟" : "What does this result mean?"}</h2>
        <p>{language === "ar" ? "تعرض النتائج أكثر العبارات القصيرة تكرارًا للمساعدة في اكتشاف الأنماط اللغوية والتراكيب الشائعة." : "The results identify frequent short phrases to support discovery of recurring linguistic patterns."}</p>
      </div>
    </Layout>
  );
}

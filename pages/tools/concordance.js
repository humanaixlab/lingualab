import { useState } from "react";
import Layout from "../../components/Layout";
import Link from "next/link";
import { useLanguage } from "../../components/LanguageProvider";
import styles from "../../styles/AnalysisTool.module.css";

export default function ConcordanceTool() {
  const { language } = useLanguage();
  const [text, setText] = useState("");
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);

  const analyzeConcordance = () => {
    if (!text.trim() || !keyword.trim()) return;

    const sentences = text
      .split(/[.!؟\n]/)
      .map((sentence) => sentence.trim())
      .filter(Boolean);

    const matches = sentences.filter((sentence) => sentence.includes(keyword));
    setResults(matches);

    if (typeof window !== "undefined") {
      localStorage.setItem("concordance_done", "true");
    }
  };

  const loadSample = () => {
    setText(
      "اللغة العربية من أهم اللغات في العالم. تسهم التقنية في خدمة اللغة العربية. تعلم اللغة العربية يساعد على فهم النصوص وتحليلها."
    );
    setKeyword("اللغة العربية");
    setResults([]);
  };

  const clearAll = () => {
    setText("");
    setKeyword("");
    setResults([]);
  };

  return (
    <Layout title={language === "ar" ? "السياقات" : "Contexts"} backHref="/tools/analyze" backLabel={language === "ar" ? "العودة إلى مركز التحليل" : "Back to Analyze"} description={language === "ar" ? "افحص كلمة أو عبارة داخل الجمل التي وردت فيها لفهم استعمالها في السياق." : "Examine a word or phrase in the sentences where it occurs to understand its use in context."}>

      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
          {language === "ar" ? "الكلمة أو العبارة المراد البحث عنها" : "Word or phrase"}
        </label>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder={language === "ar" ? "أدخل الكلمة هنا" : "Enter a word or phrase"}
          className={styles.control}
        />
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
          onClick={analyzeConcordance}
          className={styles.button}
        >
          {language === "ar" ? "عرض السياقات" : "Show contexts"}
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
          <h2>{language === "ar" ? "السياقات" : "Contexts"}</h2>
          <div className={styles.resultList}>
          {results.map((sentence, index) => (
            <div
              key={index}
              className={styles.resultItem}
            >
              {sentence}
            </div>
          ))}</div>
          <Link className={`${styles.button} ${styles.next}`} href="/tools/analyze">{language === "ar" ? "فسّر النتائج بالذكاء الاصطناعي" : "Interpret results with AI"}</Link>
        </section>
      )}

      <div className={styles.note}>
        <h2>{language === "ar" ? "ماذا تعني هذه النتيجة؟" : "What does this result mean?"}</h2>
        <p>{language === "ar" ? "تتيح الأداة رؤية الكلمة داخل استعمالها الفعلي في الجمل لفهم معناها وسياقها." : "The tool shows the term in its actual sentence contexts to support interpretation of meaning and use."}</p>
      </div>
    </Layout>
  );
}

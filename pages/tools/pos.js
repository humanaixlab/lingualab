import { useState } from "react";
import Layout from "../../components/Layout";
import { useLanguage } from "../../components/LanguageProvider";
import styles from "../../styles/AnalysisTool.module.css";

export default function POS() {
  const { language } = useLanguage();
  const [text, setText] = useState("");

  return (
    <Layout
      title={language === "ar" ? "تحليل أقسام الكلام (POS)" : "Parts of Speech Analysis (POS)"}
      backHref="/tools/analyze"
      backLabel={language === "ar" ? "العودة إلى مركز التحليل" : "Back to Analyze"}
      description={language === "ar" ? "استكشف الأنماط الأولية لأقسام الكلام في النص المدخل." : "Explore preliminary parts-of-speech patterns in the supplied text."}
    >

      <textarea
        rows={6}
        placeholder={language === "ar" ? "ألصق النص هنا…" : "Paste text here…"}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className={styles.control}
      />
      <div className={styles.note}><p>{language === "ar" ? "هذه نسخة تجريبية لعرض الفكرة." : "This is an experimental preview of the concept."}</p></div>
    </Layout>
  );
}

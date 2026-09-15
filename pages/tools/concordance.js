import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { useLanguage } from "../../components/LanguageProvider";
import styles from "../../styles/AnalysisTool.module.css";
import { createReportContext } from "../../lib/report-context";
import { createAnalysisHandoff, readAnalysisResultHandoff } from "../../lib/analysis-handoff";
import { createCorpusWorkflowHandoff, readCorpusWorkflowHandoff } from "../../lib/corpus-workflow-context";

export default function ConcordanceTool() {
  const { language } = useLanguage();
  const [text, setText] = useState("");
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [workflowSource, setWorkflowSource] = useState(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const restored = readAnalysisResultHandoff(window.location.search, "concordance");
      const incoming = readCorpusWorkflowHandoff(window.location.search, "concordance");
      if (restored) { setText(restored.text); setKeyword(restored.evidence.target); setResults(restored.evidence.contexts); setWorkflowSource(restored); }
      else if (incoming) { setText(incoming.text); setWorkflowSource(incoming); }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const inCorpusPath = workflowSource || (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("researchPath") === "corpus-linguistics");

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

  const generateReport = () => {
    const url = createReportContext("concordance", "concordance", {
      target: keyword,
      contexts: results,
      summary: language === "ar" ? "يعرض التقرير السياقات الفعلية التي ورد فيها العنصر المستهدف." : "This report presents the observed contexts containing the target expression.",
      pathId: inCorpusPath ? "corpus-linguistics" : null,
    });
    if (url) window.location.href = url;
  };

  const interpretResults = () => {
    const url = createAnalysisHandoff("concordance", "concordance", { text, target: keyword, contexts: results });
    if (url) window.location.href = url;
  };

  const continueWorkflow = () => {
    const url = createCorpusWorkflowHandoff("concordance", "ngrams", { text, result: { target: keyword, contexts: results } });
    if (url) window.location.href = url;
  };

  return (
    <Layout title={language === "ar" ? "السياقات" : "Contexts"} backHref={inCorpusPath ? "/research-paths/corpus-linguistics" : "/tools/analyze"} backLabel={language === "ar" ? (inCorpusPath ? "العودة إلى مسار لسانيات المدونات" : "العودة إلى مركز التحليل") : (inCorpusPath ? "Back to Corpus Linguistics path" : "Back to Analyze")} description={language === "ar" ? "افحص كلمة أو عبارة داخل الجمل التي وردت فيها لفهم استعمالها في السياق." : "Examine a word or phrase in the sentences where it occurs to understand its use in context."} dataSource={inCorpusPath ? "research-path" : "standalone"}>
      {workflowSource && <p>{language === "ar" ? "تم نقل نص المدونة من المرحلة السابقة. حدّد عنصر البحث ثم شغّل التحليل." : "Corpus text was transferred from the previous stage. Choose a target, then run the analysis."}</p>}

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
          <div className={styles.actions}><button className={styles.button} type="button" onClick={continueWorkflow}>{language === "ar" ? "متابعة إلى المتتاليات اللفظية" : "Continue to N-grams"}</button><button className={`${styles.button} ${styles.next}`} type="button" onClick={interpretResults}>{language === "ar" ? "فسّر النتائج" : "Interpret results"}</button><button className={`${styles.button} ${styles.next}`} type="button" onClick={generateReport}>{language === "ar" ? "إنشاء تقرير" : "Generate Report"}</button></div>
        </section>
      )}

      <div className={styles.note}>
        <h2>{language === "ar" ? "ماذا تعني هذه النتيجة؟" : "What does this result mean?"}</h2>
        <p>{language === "ar" ? "تتيح الأداة رؤية الكلمة داخل استعمالها الفعلي في الجمل لفهم معناها وسياقها." : "The tool shows the term in its actual sentence contexts to support interpretation of meaning and use."}</p>
      </div>
    </Layout>
  );
}

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import { useLanguage } from "../../components/LanguageProvider";
import { readToolHandoff } from "../../lib/tool-handoff";

const COPY = {
  en: { title: "Google Colab Workspace", description: "Run reviewed research code in a cloud notebook without installing local software.", review: "Review your generated response", selected: "Selected language", warning: "This response may include explanations or non-Python code. Review it before copying anything into Colab. Nothing has been sent or executed.", copy: "Copy response", clear: "Clear transferred response", copied: "Copied. Paste only the reviewed code into your notebook.", copyFailed: "Copy failed. Select and copy the response manually.", cleanupFailed: "Response cleared from this page, but the saved handoff could not be removed from this tab.", intro: "A ready environment for testing code without installing software on your device.", what: "What is Google Colab?", whatText: "A Google platform that runs Python code directly in the browser without requiring local installation.", when: "When should I use it?", uses: ["Run reviewed generated code", "Analyze larger text collections", "Experiment with AI projects"], start: "Start now", open: "Open Google Colab", suggestions: "Starter ideas", ideas: ["Try tokenizing a text", "Try a word-frequency analysis", "Try reading a CSV file"] },
  ar: { title: "مساحة Google Colab", description: "شغّل الشفرة البحثية التي راجعتها في دفتر سحابي دون تثبيت برامج محلية.", review: "راجع الناتج المنقول", selected: "لغة البرمجة المحددة", warning: "قد يتضمن هذا الناتج شرحًا أو شفرة بلغة غير Python. راجعه قبل نسخه إلى Colab. لم يُرسل أو يُنفذ أي شيء تلقائيًا.", copy: "نسخ الناتج", clear: "مسح الناتج المنقول", copied: "تم النسخ. ألصق الشفرة التي راجعتها فقط في دفتر العمل.", copyFailed: "تعذر النسخ. حدد الناتج وانسخه يدويًا.", cleanupFailed: "مُسح الناتج من الصفحة، لكن تعذر حذف النقل المحفوظ من علامة التبويب.", intro: "بيئة جاهزة لتجربة الشفرة دون تثبيت برامج على جهازك.", what: "ما Google Colab؟", whatText: "منصة من Google تتيح تشغيل شفرة Python مباشرة من المتصفح دون تثبيت برامج محلية.", when: "متى تستخدمه؟", uses: ["تشغيل الشفرة المنشأة بعد مراجعتها", "تحليل مجموعات نصية أكبر", "تجربة مشروعات الذكاء الاصطناعي"], start: "ابدأ الآن", open: "فتح Google Colab", suggestions: "أفكار للبدء", ideas: ["جرّب تجزئة نص إلى كلمات", "جرّب تحليل تكرار الكلمات", "جرّب قراءة ملف CSV"] },
};

export default function ColabPage() {
  const { language, direction } = useLanguage();
  const copy = COPY[language];
  const [handoff, setHandoff] = useState(null);
  const [copyStatus, setCopyStatus] = useState("");
  const router = useRouter();
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setHandoff(readToolHandoff("colab", window.location.search));
      setCopyStatus("");
    });
    return () => window.cancelAnimationFrame(frame);
  }, [router.asPath]);

  return (
    <Layout title={copy.title} description={copy.description} backHref="/ar-tools#build-tools" backLabel={language === "ar" ? "العودة إلى البناء" : "Back to Build"} dataSource={handoff ? "transferred" : "standalone"}>
      <div style={{ direction, color: "#111827" }}>
        {handoff && (
          <section style={styles.card}>
            <h2 style={styles.title}>{copy.review}</h2>
            <p style={styles.text}>{copy.selected}: <span dir="auto">{handoff.payload.language}</span>. {copy.warning}</p>
            <pre dir="ltr" style={styles.output}>{handoff.payload.response}</pre>
            <div style={styles.actions}>
              <button type="button" style={styles.button} onClick={async () => {
                try { await navigator.clipboard.writeText(handoff.payload.response); setCopyStatus(copy.copied); }
                catch { setCopyStatus(copy.copyFailed); }
              }}>{copy.copy}</button>
              <button type="button" style={styles.secondaryButton} onClick={() => {
                setCopyStatus("");
                try { sessionStorage.removeItem("lingualab-tool-handoff:colab"); }
                catch { setCopyStatus(copy.cleanupFailed); }
                finally { setHandoff(null); }
              }}>{copy.clear}</button>
            </div>
            <p role="status" style={styles.status}>{copyStatus}</p>
          </section>
        )}
        {!handoff && copyStatus && <p role="status" style={styles.status}>{copyStatus}</p>}
        <p style={styles.intro}>{copy.intro}</p>
        <section style={styles.card}><h2 style={styles.title}>{copy.what}</h2><p style={styles.text}>{copy.whatText}</p></section>
        <section style={styles.card}><h2 style={styles.title}>{copy.when}</h2><ul style={styles.list}>{copy.uses.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section style={styles.card}><h2 style={styles.title}>{copy.start}</h2><button type="button" style={styles.button} onClick={() => window.open("https://colab.research.google.com/", "_blank")}>{copy.open}</button></section>
        <section style={styles.card}><h2 style={styles.title}>{copy.suggestions}</h2><ul style={styles.list}>{copy.ideas.map((item) => <li key={item}>{item}</li>)}</ul></section>
      </div>
    </Layout>
  );
}

const styles = {
  intro: { color: "#cbd5e1", lineHeight: 1.8, margin: "0 0 22px" },
  card: { background: "#fff", padding: "24px", borderRadius: "16px", marginBottom: "20px", boxShadow: "0 4px 14px rgba(0,0,0,.08)" },
  title: { margin: "0 0 10px", fontSize: "var(--text-card)" },
  text: { margin: 0, color: "#475467", lineHeight: 1.75 },
  list: { margin: 0, paddingInlineStart: "22px", color: "#475467", lineHeight: 1.9 },
  output: { padding: "16px", borderRadius: "12px", background: "#0f172a", color: "#e5e7eb", whiteSpace: "pre-wrap", overflowWrap: "anywhere", textAlign: "left" },
  actions: { display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "16px" },
  button: { padding: "11px 16px", border: 0, borderRadius: "11px", background: "#4f46e5", color: "#fff", cursor: "pointer", font: "inherit", fontWeight: 600 },
  secondaryButton: { padding: "11px 16px", border: "1px solid #d0d5dd", borderRadius: "11px", background: "#fff", color: "#344054", cursor: "pointer", font: "inherit", fontWeight: 600 },
  status: { color: "#667085", fontSize: "var(--text-helper)", lineHeight: 1.7 },
};

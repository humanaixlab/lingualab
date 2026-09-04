import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { readToolHandoff } from "../../lib/tool-handoff";

export default function ColabPage() {
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
    <div
      style={{
        minHeight: "100vh",
        padding: "40px",
        background: "#f7f8fc",
        direction: "rtl",
        fontFamily: "Arial"
      }}
    >
      <Link href="/ar-tools#all-tools">← الرجوع إلى جميع الأدوات</Link>
      <h1>Google Colab Workspace</h1>
      {handoff && (
        <section dir="ltr" style={{ background: "#fff", padding: "25px", borderRadius: "16px", marginBottom: "20px", textAlign: "left" }}>
          <h2>Review your generated response</h2>
          <p>Selected language: {handoff.payload.language}. This response may include explanations or non-Python code. Review it before copying anything into Colab. Nothing has been sent or executed.</p>
          <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{handoff.payload.response}</pre>
          <button type="button" onClick={async () => {
            try {
              await navigator.clipboard.writeText(handoff.payload.response);
              setCopyStatus("Copied. Paste only the reviewed code into your notebook.");
            } catch { setCopyStatus("Copy failed. Select and copy the response manually."); }
          }}>Copy response</button>
          <button type="button" onClick={() => {
            setCopyStatus("");
            try {
              sessionStorage.removeItem("lingualab-tool-handoff:colab");
            } catch {
              setCopyStatus("Response cleared from this page, but the saved handoff could not be removed from this tab.");
            } finally {
              setHandoff(null);
            }
          }}>Clear transferred response</button>
          <p role="status">{copyStatus}</p>
        </section>
      )}
      {!handoff && copyStatus && <p role="status">{copyStatus}</p>}

      <p style={{ color: "#555", marginBottom: "30px" }}>
        بيئة جاهزة لتجربة الأكواد بدون تثبيت أي شيء على جهازك
      </p>

      <div
        style={{
          background: "#fff",
          padding: "25px",
          borderRadius: "16px",
          marginBottom: "20px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
        }}
      >
        <h3>ما هو Google Colab؟</h3>
        <p>
          منصة من Google تسمح لك بتشغيل أكواد Python مباشرة من المتصفح
          بدون الحاجة لتثبيت أي برامج.
        </p>
      </div>

      <div
        style={{
          background: "#fff",
          padding: "25px",
          borderRadius: "16px",
          marginBottom: "20px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
        }}
      >
        <h3>متى أستخدمه؟</h3>
        <ul>
          <li>تشغيل الأكواد التي تم توليدها</li>
          <li>تحليل النصوص الكبيرة</li>
          <li>تجربة مشاريع الذكاء الاصطناعي</li>
        </ul>
      </div>

      <div
        style={{
          background: "#fff",
          padding: "25px",
          borderRadius: "16px",
          marginBottom: "20px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
        }}
      >
        <h3>ابدئي الآن</h3>

        <button
          onClick={() =>
            window.open("https://colab.research.google.com/", "_blank")
          }
          style={{
            padding: "12px 20px",
            borderRadius: "10px",
            cursor: "pointer"
          }}
        >
          فتح Google Colab
        </button>
      </div>

      <div
        style={{
          background: "#fff",
          padding: "25px",
          borderRadius: "16px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
        }}
      >
        <h3>اقتراحات جاهزة</h3>

        <ul>
          <li>جربي كود تقسيم النص إلى كلمات</li>
          <li>جربي تحليل تكرار الكلمات</li>
          <li>جربي قراءة ملف CSV</li>
        </ul>
      </div>
    </div>
  );
}

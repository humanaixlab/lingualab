import { useState } from "react";
import Layout from "../../components/Layout";

export default function ConcordanceTool() {
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
    <Layout title="أداة سياقات الكلمة" backHref="/tools/analyze">
      <p style={{ color: "#4b5563", lineHeight: "1.8", marginBottom: "20px" }}>
        تعرض هذه الأداة الكلمة أو العبارة داخل الجمل التي وردت فيها، مما يساعد
        على فهم معناها واستعمالها في السياق.
      </p>

      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
          الكلمة أو العبارة المراد البحث عنها
        </label>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="اكتبي الكلمة هنا"
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "12px",
            border: "1px solid #d1d5db",
            fontSize: "15px",
            backgroundColor: "#f9fafb",
            boxSizing: "border-box",
          }}
        />
      </div>

      <textarea
        rows="8"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="ألصقي النص هنا..."
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "14px",
          border: "1px solid #d1d5db",
          fontSize: "15px",
          lineHeight: "1.8",
          backgroundColor: "#f9fafb",
          boxSizing: "border-box",
        }}
      />

      <div
        style={{
          marginTop: "16px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={analyzeConcordance}
          style={{
            padding: "10px 16px",
            borderRadius: "12px",
            border: "none",
            backgroundColor: "#10b981",
            color: "#fff",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          عرض السياقات
        </button>

        <button
          onClick={clearAll}
          style={{
            padding: "10px 16px",
            borderRadius: "12px",
            border: "none",
            backgroundColor: "#ef4444",
            color: "#fff",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          مسح
        </button>

        <button
          onClick={loadSample}
          style={{
            padding: "10px 16px",
            borderRadius: "12px",
            border: "none",
            backgroundColor: "#3b82f6",
            color: "#fff",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          تحميل مثال
        </button>
      </div>

      {results.length > 0 && (
        <div style={{ marginTop: "28px" }}>
          <h3 style={{ marginBottom: "12px", color: "#111827" }}>السياقات</h3>
          {results.map((sentence, index) => (
            <div
              key={index}
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "14px",
                padding: "14px",
                marginBottom: "10px",
                boxShadow: "0 4px 14px rgba(0,0,0,0.05)",
                lineHeight: "1.8",
              }}
            >
              {sentence}
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          marginTop: "30px",
          backgroundColor: "#f8fafc",
          border: "1px solid #e5e7eb",
          borderRadius: "14px",
          padding: "18px",
        }}
      >
        <h3 style={{ marginBottom: "10px" }}>ماذا تعني هذه النتيجة؟</h3>
        <p style={{ color: "#4b5563", lineHeight: "1.8", margin: 0 }}>
          تساعدك هذه الأداة على رؤية الكلمة داخل استعمالها الحقيقي في الجمل،
          مما يسهل فهم معناها وسياقها.
        </p>
      </div>
    </Layout>
  );
}

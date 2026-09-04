import { useState } from "react";
import Layout from "../../components/Layout";

export default function NgramsTool() {
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

  return (
    <Layout title="أداة الثنائيات والثلاثيات" backHref="/tools/analyze">
      <p style={{ color: "#4b5563", lineHeight: "1.8", marginBottom: "20px" }}>
        تعرض هذه الأداة التراكيب المتجاورة الأكثر تكرارًا في النص، وتساعد على
        اكتشاف الأنماط اللغوية والعبارات الشائعة.
      </p>

      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
          اختاري نوع التحليل
        </label>
        <select
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          style={{
            padding: "12px",
            borderRadius: "12px",
            border: "1px solid #d1d5db",
            backgroundColor: "#f9fafb",
            fontSize: "15px",
          }}
        >
          <option value={2}>ثنائيات</option>
          <option value={3}>ثلاثيات</option>
        </select>
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
          onClick={analyzeNgrams}
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
          تحليل التراكيب
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
          <h3 style={{ marginBottom: "12px", color: "#111827" }}>النتائج</h3>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "#fff",
              overflow: "hidden",
              borderRadius: "14px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#eef2ff" }}>
                <th
                  style={{
                    padding: "14px",
                    textAlign: "right",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  التركيب
                </th>
                <th
                  style={{
                    padding: "14px",
                    textAlign: "right",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  عدد التكرارات
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map(([gram, count], index) => (
                <tr key={index}>
                  <td
                    style={{
                      padding: "12px 14px",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    {gram}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    {count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
          تبين النتائج أكثر العبارات القصيرة تكرارًا في النص، مما يساعد على
          اكتشاف الأنماط اللغوية والتراكيب الشائعة.
        </p>
      </div>
    </Layout>
  );
}

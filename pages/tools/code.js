import { useState } from "react";
import Layout from "../../components/Layout";

export default function CodeTool() {
  const [language, setLanguage] = useState("Python");
  const [task, setTask] = useState("");
  const [level, setLevel] = useState("مبتدئ");
  const [generatedCode, setGeneratedCode] = useState("");

  const generateCode = () => {
    const code = `# لغة البرمجة: ${language}
# المستوى: ${level}

# المهمة:
# ${task || "لم يتم تحديد المهمة"}

# الكود المقترح:

def main():
    print("ابدأ تنفيذ المهمة هنا")

if __name__ == "__main__":
    main()
`;

    setGeneratedCode(code);
  };

  const copyCode = async () => {
    if (!generatedCode) return;
    await navigator.clipboard.writeText(generatedCode);
    alert("تم نسخ الكود");
  };

  const clearAll = () => {
    setLanguage("Python");
    setTask("");
    setLevel("مبتدئ");
    setGeneratedCode("");
  };

  return (
    <Layout title="أداة توليد الأكواد">
      <p style={{ color: "#4b5563", lineHeight: "1.8", marginBottom: "20px" }}>
        أنشئي قوالب أكواد جاهزة بناءً على نوع المهمة ولغة البرمجة.
      </p>

      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "18px",
          border: "1px solid #e5e7eb",
          padding: "22px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
          marginBottom: "22px",
        }}
      >
        {/* اللغة */}
        <div style={{ marginBottom: "16px" }}>
          <label>لغة البرمجة</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={inputStyle}
          >
            <option>Python</option>
            <option>JavaScript</option>
            <option>HTML</option>
            <option>CSS</option>
          </select>
        </div>

        {/* المهمة */}
        <div style={{ marginBottom: "16px" }}>
          <label>وصف المهمة</label>
          <textarea
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="مثال: تحليل نص عربي واستخراج الكلمات الأكثر تكرارًا"
            style={{ ...inputStyle, height: "100px" }}
          />
        </div>

        {/* المستوى */}
        <div style={{ marginBottom: "16px" }}>
          <label>المستوى</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            style={inputStyle}
          >
            <option>مبتدئ</option>
            <option>متوسط</option>
            <option>متقدم</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={generateCode} style={primaryBtn}>
            توليد الكود
          </button>

          <button onClick={clearAll} style={dangerBtn}>
            مسح
          </button>
        </div>
      </div>

      {/* الناتج */}
      {generatedCode && (
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "18px",
            border: "1px solid #e5e7eb",
            padding: "22px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
          }}
        >
          <h3>الكود الناتج</h3>

          <pre
            style={{
              background: "#0f172a",
              color: "#e5e7eb",
              padding: "16px",
              borderRadius: "12px",
              overflowX: "auto",
              marginBottom: "12px",
            }}
          >
            {generatedCode}
          </pre>

          <button onClick={copyCode} style={primaryBtn}>
            نسخ الكود
          </button>
        </div>
      )}
    </Layout>
  );
}

/* 🎨 ستايلات */
const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "12px",
  border: "1px solid #d1d5db",
  backgroundColor: "#f9fafb",
  marginTop: "6px",
};

const primaryBtn = {
  padding: "10px 16px",
  borderRadius: "12px",
  border: "none",
  backgroundColor: "#3b82f6",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "bold",
};

const dangerBtn = {
  padding: "10px 16px",
  borderRadius: "12px",
  border: "none",
  backgroundColor: "#ef4444",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "bold",
};
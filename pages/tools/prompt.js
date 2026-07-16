import { useState } from "react";
import Layout from "../../components/Layout";

export default function PromptTool() {
  const [taskType, setTaskType] = useState("تحليل نص");
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [style, setStyle] = useState("أكاديمي");
  const [generatedPrompt, setGeneratedPrompt] = useState("");

  const generatePrompt = () => {
    const prompt = `أنت مساعد ذكي متخصص في ${taskType}. 
الموضوع هو: ${topic || "لم يتم تحديد الموضوع بعد"}.
الفئة المستهدفة: ${audience || "لم يتم تحديد الفئة بعد"}.
نمط الكتابة المطلوب: ${style}.
أعطني مخرجات واضحة ومنظمة ومناسبة للمهمة، مع مراعاة الدقة والوضوح وإمكانية التطبيق العملي.`;

    setGeneratedPrompt(prompt);
  };

  const clearAll = () => {
    setTaskType("تحليل نص");
    setTopic("");
    setAudience("");
    setStyle("أكاديمي");
    setGeneratedPrompt("");
  };

  const copyPrompt = async () => {
    if (!generatedPrompt) return;
    await navigator.clipboard.writeText(generatedPrompt);
    alert("تم نسخ الأمر.");
  };

  return (
    <Layout title="أداة توليد الأوامر">
      <p style={{ color: "#4b5563", lineHeight: "1.8", marginBottom: "20px" }}>
        تساعدك هذه الأداة على إنشاء أوامر جاهزة ومنظمة بحسب نوع المهمة
        والموضوع والفئة المستهدفة.
      </p>

      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "18px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
          padding: "22px",
          marginBottom: "22px",
        }}
      >
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
            نوع المهمة
          </label>
          <select
            value={taskType}
            onChange={(e) => setTaskType(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid #d1d5db",
              backgroundColor: "#f9fafb",
            }}
          >
            <option>تحليل نص</option>
            <option>تلخيص</option>
            <option>شرح مبسط</option>
            <option>كتابة أكاديمية</option>
            <option>تصنيف بيانات</option>
            <option>إنشاء نشاط تعليمي</option>
          </select>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
            الموضوع
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="مثال: تحليل المشاعر في النصوص العربية"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid #d1d5db",
              backgroundColor: "#f9fafb",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
            الفئة المستهدفة
          </label>
          <input
            type="text"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="مثال: طالبات المستوى السادس"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid #d1d5db",
              backgroundColor: "#f9fafb",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
            نمط الكتابة
          </label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid #d1d5db",
              backgroundColor: "#f9fafb",
            }}
          >
            <option>أكاديمي</option>
            <option>مبسط</option>
            <option>رسمي</option>
            <option>إبداعي</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={generatePrompt}
            style={{
              padding: "10px 16px",
              borderRadius: "12px",
              border: "none",
              backgroundColor: "#ec4899",
              color: "#fff",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            توليد الأمر
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
        </div>
      </div>

      {generatedPrompt && (
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "18px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
            padding: "22px",
          }}
        >
          <h3 style={{ marginTop: 0, color: "#111827" }}> <h3>الأمر الناتج</h3></h3>

          <div
            style={{
              backgroundColor: "#f8fafc",
              border: "1px solid #e5e7eb",
              borderRadius: "14px",
              padding: "16px",
              whiteSpace: "pre-wrap",
              lineHeight: "1.9",
              color: "#374151",
              marginBottom: "14px",
            }}
          >
            {generatedPrompt}
          </div>

          <button
            onClick={copyPrompt}
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
            نسخ الأمر
          </button>
        </div>
      )}

      <div
        style={{
          marginTop: "28px",
          backgroundColor: "#f8fafc",
          border: "1px solid #e5e7eb",
          borderRadius: "14px",
          padding: "18px",
        }}
      >
        <h3 style={{ marginBottom: "10px" }}>كيف تستفيدين من الأداة؟</h3>
        <p style={{ color: "#4b5563", lineHeight: "1.8", margin: 0 }}>
          استخدمي هذه الصفحة لبناء برومبتات جاهزة للشرح، التحليل، التلخيص،
          والأنشطة التعليمية، ثم انسخي النص واستخدميه في أدوات الذكاء الاصطناعي.
        </p>
      </div>
    </Layout>
  );
}
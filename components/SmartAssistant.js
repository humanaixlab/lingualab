import { useState } from "react";
import { useRouter } from "next/router";

const suggestions = [
  "كيف أبدأ تحليل نص عربي؟",
  "ما الفرق بين POS و N-grams؟",
  "ما الأداة المناسبة لتحليل التكرار؟",
];

export default function SmartAssistant() {
  const router = useRouter();
  const [messages, setMessages] = useState([
    { role: "assistant", content: "مرحبًا 👋 أنا مساعد LinguaLab" },
  ]);

  const handleClick = (text) => {
    let response = "";
    let route = null;

    if (text.includes("تحليل نص")) {
      response = "جاري توجيهك إلى أداة Analyze...";
      route = "/tools/analyze";
    } else if (text.includes("POS")) {
      response = "جاري توجيهك إلى أداة POS...";
      route = "/tools/pos";
    } else if (text.includes("التكرار")) {
      response = "جاري توجيهك إلى أداة Frequency...";
      route = "/tools/frequency";
    } else {
      response = "يمكنني مساعدتك في اختيار الأداة المناسبة ✨";
    }

    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
      { role: "assistant", content: response },
    ]);

    if (route) {
      setTimeout(() => router.push(route), 800);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "20px",
        width: "280px",
        background: "#fff",
        borderRadius: "16px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        overflow: "hidden",
        direction: "rtl",
        fontFamily: "Arial, sans-serif",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "#4f46e5",
          color: "#fff",
          padding: "12px",
          fontWeight: "bold",
          boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
        }}
      >
        مساعد LinguaLab
      </div>

      <div
        style={{
          padding: "10px",
          maxHeight: "220px",
          overflowY: "auto",
          background: "#f9fafb",
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              background: m.role === "assistant" ? "#eeeeee" : "#dbeafe",
              padding: "10px",
              marginBottom: "8px",
              borderRadius: "10px",
              lineHeight: "1.7",
              color: "#111827",
            }}
          >
            {m.content}
          </div>
        ))}
      </div>

      <div style={{ padding: "10px", background: "#fff" }}>
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => handleClick(s)}
            style={{
              width: "100%",
              marginBottom: "8px",
              padding: "10px",
              borderRadius: "10px",
              border: "none",
              background: "#eef2ff",
              cursor: "pointer",
              fontSize: "15px",
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
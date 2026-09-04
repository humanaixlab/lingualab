import { useState } from "react";
import { useRouter } from "next/router";
import { useLanguage } from "./LanguageProvider";

const suggestions = [
  { id: "text", key: "assistant.textAnalysis" },
  { id: "pos", key: "assistant.posDifference" },
  { id: "frequency", key: "assistant.frequencyTool" },
];

export default function SmartAssistant() {
  const router = useRouter();
  const { direction, t } = useLanguage();
  const [messages, setMessages] = useState([
    { role: "assistant", key: "assistant.welcome" },
  ]);

  const handleClick = (suggestion) => {
    let response = "";
    let route = null;

    if (suggestion.id === "text") {
      response = "assistant.routingAnalyze";
      route = "/tools/analyze";
    } else if (suggestion.id === "pos") {
      response = "assistant.routingPos";
      route = "/tools/pos";
    } else if (suggestion.id === "frequency") {
      response = "assistant.routingFrequency";
      route = "/tools/frequency";
    } else {
      response = "assistant.fallback";
    }

    setMessages((prev) => [
      ...prev,
      { role: "user", key: suggestion.key },
      { role: "assistant", key: response },
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
        direction,
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
        {t("assistant.title")}
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
              {t(m.key)}
          </div>
        ))}
      </div>

      <div style={{ padding: "10px", background: "#fff" }}>
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => handleClick(suggestion)}
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
            {t(suggestion.key)}
          </button>
        ))}
      </div>
    </div>
  );
}

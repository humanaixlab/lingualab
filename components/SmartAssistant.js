import { useState } from "react";
import { useRouter } from "next/router";
import { useLanguage } from "./LanguageProvider";

const suggestions = [
  { id: "text", key: "assistant.textAnalysis" },
  { id: "pos", key: "assistant.posDifference" },
  { id: "frequency", key: "assistant.frequencyTool" },
];

const CORE_ROUTES = new Set([
  "/",
  "/workspace",
  "/ar-tools",
  "/tools/analyze",
  "/research-advisor",
  "/research-report",
  "/student-dashboard",
]);

export default function SmartAssistant() {
  const router = useRouter();
  const { direction, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", key: "assistant.welcome" },
  ]);

  if (!CORE_ROUTES.has(router.pathname)) return null;

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={t("assistant.open")}
        title={t("assistant.open")}
        style={{
          position: "fixed",
          insetInlineEnd: "18px",
          bottom: "18px",
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          border: "none",
          background: "#4f46e5",
          color: "#fff",
          cursor: "pointer",
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.22)",
          zIndex: 9999,
          fontSize: "20px",
        }}
      >
        ✦
      </button>
    );
  }

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
        bottom: "18px",
        insetInlineEnd: "18px",
        width: "min(260px, calc(100vw - 36px))",
        background: "#fff",
        borderRadius: "16px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        overflow: "hidden",
        direction,
        fontFamily: "var(--font-ui)",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "#4f46e5",
          color: "#fff",
          padding: "12px",
          fontWeight: "600",
          fontSize: "var(--text-button)",
          boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>{t("assistant.title")}</span>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label={t("assistant.close")}
          title={t("assistant.close")}
          style={{
            border: "none",
            background: "transparent",
            color: "inherit",
            cursor: "pointer",
            padding: "0 4px",
            fontSize: "18px",
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>

      <div
        style={{
          padding: "10px",
          maxHeight: "180px",
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
              fontSize: "var(--text-helper)",
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
              fontSize: "var(--text-button)",
            }}
          >
            {t(suggestion.key)}
          </button>
        ))}
      </div>
    </div>
  );
}

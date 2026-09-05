import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useLanguage } from "./LanguageProvider";
import { getAssistantGuidance } from "../lib/assistant-guidance";
import { readResearchPathContext } from "../lib/research-path-context";

const ASSISTANT_LEVEL_KEY = "lingualab-assistant-level";

export default function SmartAssistant() {
  const router = useRouter();
  const { direction, language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [level, setLevel] = useState("beginner");
  const pathContext = readResearchPathContext(router.asPath, router.pathname);
  const hubPathId = router.pathname === "/ar-tools" ? router.asPath?.split("#")[1]?.split("?")[0] : null;
  const guidance = getAssistantGuidance(router.pathname, language, {
    level,
    pathId: pathContext?.pathId || hubPathId,
    mode: router.asPath?.includes("copilot=1") ? "copilot" : undefined,
  });

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const saved = localStorage.getItem(ASSISTANT_LEVEL_KEY);
        if (saved === "beginner" || saved === "advanced") setLevel(saved);
      } catch {}
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const changeLevel = (nextLevel) => {
    setLevel(nextLevel);
    setAnswers([]);
    try {
      localStorage.setItem(ASSISTANT_LEVEL_KEY, nextLevel);
    } catch {}
  };

  if (!guidance) return null;

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

  const visibleAnswers = answers.filter((answer) => answer.contextId === guidance.contextId);

  const handleClick = (suggestion) => {
    setAnswers((previous) => [
      ...previous.filter((answer) => answer.contextId !== guidance.contextId),
      { contextId: guidance.contextId, suggestionId: suggestion.id },
    ]);
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
          maxHeight: "210px",
          overflowY: "auto",
          background: "#f9fafb",
        }}
      >
        <div
          style={{
            background: "#eeeeee",
            padding: "10px",
            marginBottom: "8px",
            borderRadius: "10px",
            lineHeight: "1.7",
            fontSize: "var(--text-helper)",
            color: "#111827",
          }}
        >
          {t("assistant.welcome")}
        </div>
        {visibleAnswers.map((message) => {
          const suggestion = guidance.suggestions.find((item) => item.id === message.suggestionId);
          if (!suggestion) return null;
          return (
            <div key={message.suggestionId}>
              <div
                style={{
                  background: "#dbeafe",
                  padding: "10px",
                  marginBottom: "8px",
                  borderRadius: "10px",
                  lineHeight: "1.7",
                  fontSize: "var(--text-helper)",
                  color: "#111827",
                }}
              >
                {suggestion.question}
              </div>
              <div
                style={{
                  background: "#eeeeee",
                  padding: "10px",
                  marginBottom: "8px",
                  borderRadius: "10px",
                  lineHeight: "1.7",
                  fontSize: "var(--text-helper)",
                  color: "#111827",
                }}
              >
                {suggestion.answer}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ padding: "10px", background: "#fff" }}>
        <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }} role="group" aria-label={language === "ar" ? "مستوى الإرشاد" : "Guidance level"}>
          {["beginner", "advanced"].map((option) => (
            <button
              type="button"
              key={option}
              aria-pressed={level === option}
              onClick={() => changeLevel(option)}
              style={{ flex: 1, padding: "7px", borderRadius: "8px", border: "1px solid #c7d2fe", background: level === option ? "#4f46e5" : "#fff", color: level === option ? "#fff" : "#3730a3", cursor: "pointer", fontSize: "var(--text-meta)", fontWeight: 600 }}
            >
              {language === "ar" ? option === "beginner" ? "مبتدئ" : "متقدم" : option === "beginner" ? "Beginner" : "Advanced"}
            </button>
          ))}
        </div>
        {guidance.suggestions.map((suggestion) => (
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
            {suggestion.question}
          </button>
        ))}
      </div>
    </div>
  );
}

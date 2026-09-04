import { useLanguage } from "./LanguageProvider";

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <div
      role="group"
      aria-label={t("language.switcherLabel")}
      dir="ltr"
      style={{
        position: "fixed", top: "14px", right: "14px", zIndex: 10000,
        display: "inline-flex", gap: "3px", padding: "4px", borderRadius: "999px",
        border: "1px solid rgba(99, 102, 241, 0.24)", background: "rgba(255,255,255,0.94)",
        boxShadow: "0 8px 24px rgba(15,23,42,0.14)", backdropFilter: "blur(12px)",
      }}
    >
      {["ar", "en"].map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={language === option}
          aria-label={option === "ar" ? t("language.arabic") : t("language.english")}
          onClick={() => setLanguage(option)}
          style={{
            border: 0, borderRadius: "999px", padding: "7px 10px", cursor: "pointer",
            fontWeight: 800, fontSize: "12px",
            color: language === option ? "#fff" : "#4b5563",
            background: language === option ? "#4f46e5" : "transparent",
          }}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

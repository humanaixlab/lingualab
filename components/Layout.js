import Link from "next/link";
import SmartAssistant from "./SmartAssistant";
import { useLanguage } from "./LanguageProvider";

export default function Layout({ title, children }) {
  const { direction, t } = useLanguage();
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #1e293b 0%, #0f172a 40%, #020617 100%)",
        padding: "40px 20px",
        fontFamily: "var(--font-ui)",
        color: "#fff",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <Link href="/ar-tools#all-tools" style={{ textDecoration: "none" }}>
          <button
            style={{
              marginBottom: "20px",
              padding: "10px 18px",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.05)",
              color: "#e2e8f0",
              cursor: "pointer",
              fontSize: "var(--text-button)",
            }}
          >
            {t("common.backToAllTools")}
          </button>
        </Link>

        <div
          style={{
            background: "rgba(15, 23, 42, 0.72)",
            borderRadius: "24px",
            padding: "30px",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
            direction,
            textAlign: "start",
          }}
        >
          <h1
            style={{
              marginBottom: "10px",
              fontSize: "var(--text-page)",
              lineHeight: "var(--leading-heading)",
              letterSpacing: "var(--tracking-heading)",
              fontWeight: "700",
              background: "linear-gradient(90deg, #22d3ee, #818cf8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {title}
          </h1>

          <p
            style={{
              marginBottom: "25px",
              color: "#94a3b8",
              fontSize: "var(--text-body)",
              lineHeight: "var(--leading-body)",
            }}
          >
            {t("common.smartToolsDescription")}
          </p>

          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              borderRadius: "16px",
              padding: "20px",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            {children}
          </div>
        </div>
      </div>

      <SmartAssistant />
    </div>
  );
}

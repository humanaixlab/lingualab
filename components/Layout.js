import Link from "next/link";
import { useRouter } from "next/router";
import { useLanguage } from "./LanguageProvider";
import DataSourceIndicator from "./DataSourceIndicator";
import { readResearchPathContext, researchPathNavigation } from "../lib/research-path-context";

export default function Layout({ title, children, backHref = "/ar-tools#all-tools", backLabel, description, dataSource }) {
  const { direction, language, t } = useLanguage();
  const router = useRouter();
  const fromLearn = router.query?.from === "learn";
  const pathContext = readResearchPathContext(router.asPath, router.pathname);
  const pathNavigation = researchPathNavigation(pathContext, language, title);
  const effectiveBackHref = pathNavigation?.href || (fromLearn ? "/student-dashboard" : backHref);
  const effectiveBackLabel = pathNavigation?.backLabel || (fromLearn
    ? language === "ar" ? "العودة إلى مركز التعلّم" : "Back to Learn"
    : backLabel || t("common.backToAllTools"));
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
        {pathNavigation && (
          <nav aria-label={language === "ar" ? "سياق المسار البحثي" : "Research path context"} style={{ marginBottom: "12px", color: "#94a3b8", fontSize: "var(--text-meta)", lineHeight: 1.7 }}>
            {pathNavigation.crumbs.map((crumb, index) => <span key={`${crumb}-${index}`}>{index > 0 && <span aria-hidden="true"> ← </span>}{crumb}</span>)}
          </nav>
        )}
        <Link href={effectiveBackHref} style={{ textDecoration: "none" }}>
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
            {effectiveBackLabel}
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
            {description || t("common.smartToolsDescription")}
          </p>

          {dataSource && <DataSourceIndicator language={language} mode={dataSource} />}

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
    </div>
  );
}

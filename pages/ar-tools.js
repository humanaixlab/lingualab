import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { readResearchContext, researchContextHref, RESEARCH_CONTEXT_TTL_MS } from "../lib/research-context";
import { useLanguage } from "../components/LanguageProvider";
import DataSourceIndicator from "../components/DataSourceIndicator";
import ResearchPaths from "../components/ResearchPaths";

const computationalTools = [
  { key: "classification", link: "/workspace", icon: "01" },
  { key: "excel", link: "/tools/excel", icon: "X" },
  { key: "code", link: "/tools/code", icon: "</>" },
  { key: "colab", link: "/tools/colab", icon: "C" },
];

const studyWorkflow = [
  { key: "advisor", href: "/research-advisor" },
  { key: "assistant", href: "/workspace?copilot=1", copilot: true },
  { key: "analysis", href: "/tools/analyze" },
  { key: "interpretation", href: "/tools/analyze" },
  { key: "report", href: "/research-report" },
  { key: "writing", href: "/tools/prompt" },
];

const guidanceItems = ["phenomenon", "task", "unsure", "after"];
const sectionStyle = { marginBottom: "32px", padding: "28px", border: "1px solid rgba(73, 67, 137, 0.13)", borderRadius: "24px", background: "rgba(255, 255, 255, 0.88)", boxShadow: "0 18px 50px rgba(45, 42, 96, 0.07)", scrollMarginTop: "24px" };

export default function ArabicToolsPage() {
  const { language, t } = useLanguage();
  const router = useRouter();
  const [context, setContext] = useState(null);

  useEffect(() => {
    let expiryTimer;
    const refresh = () => {
      window.clearTimeout(expiryTimer);
      const current = readResearchContext(window.location.search);
      setContext(current);
      if (current) expiryTimer = window.setTimeout(refresh, Math.max(1, Date.parse(current.createdAt) + RESEARCH_CONTEXT_TTL_MS - Date.now()));
    };
    const frame = window.requestAnimationFrame(refresh);
    window.addEventListener("pageshow", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(expiryTimer);
      window.removeEventListener("pageshow", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [router.asPath]);

  const contextHref = (href) => researchContextHref(href, context);

  return (
    <main style={{ minHeight: "100vh", background: "radial-gradient(circle at top right, rgba(109, 91, 255, 0.12), transparent 34%), #f8f8ff", color: "#17152f", fontFamily: "var(--font-ui)" }}>
      <div style={{ width: "min(1220px, calc(100% - 40px))", margin: "0 auto", padding: "24px 0 72px" }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px", paddingBottom: "22px", borderBottom: "1px solid rgba(23, 21, 47, 0.09)" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "12px", color: "#17152f", textDecoration: "none", fontWeight: 600, fontSize: "18px" }}>
            <span style={{ width: "38px", height: "38px", borderRadius: "12px", display: "grid", placeItems: "center", color: "#fff", background: "linear-gradient(135deg, #705bff, #416fe9)", boxShadow: "0 10px 24px rgba(84, 82, 226, 0.22)" }}>L</span>
            <span>LinguaLab</span>
          </Link>
          <nav style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <Link href="/workspace" style={{ color: "#17152f", textDecoration: "none", fontWeight: 600, fontSize: "var(--text-nav)" }}>{t("nav.openWorkspace")}</Link>
            <Link href={contextHref("/research-advisor")} style={{ color: "#17152f", textDecoration: "none", fontWeight: 600, fontSize: "var(--text-nav)" }}>{t("nav.researchAdvisor")}</Link>
          </nav>
        </header>

        <section style={{ padding: "58px 0 30px" }}>
          <p style={{ margin: "0 0 14px", color: "#6258f5", fontWeight: 600, fontSize: "var(--text-meta)", letterSpacing: "var(--tracking-overline)" }}>{t("hub.pageName")}</p>
          <h1 style={{ margin: 0, maxWidth: "780px", fontSize: "var(--text-hero)", lineHeight: "var(--leading-heading)", letterSpacing: "var(--tracking-heading)" }}>{t("hub.heroTitle")}</h1>
          <p style={{ maxWidth: "760px", margin: "20px 0 0", color: "#706c88", fontSize: "var(--text-body)", lineHeight: "var(--leading-body)" }}>{t("hub.heroText")}</p>
        </section>

        <DataSourceIndicator language={language} mode={context ? "projectContext" : "standalone"} />
        {context && <p role="status" dir="auto" style={{ margin: "0 0 20px", padding: "12px 16px", border: "1px solid rgba(112, 91, 255, 0.2)", borderRadius: "12px", background: "#efedff", color: "#4c43ce", fontSize: "13px" }}>{t("hub.currentDataset", { filename: context.fileName, count: context.rows.toLocaleString(language) })}</p>}

        <ResearchPaths language={language} mode="linguistic" />

        <section id="all-tools" aria-labelledby="computational-workflows-title" style={sectionStyle}>
          <div id="build-tools" style={{ scrollMarginTop: "24px" }}>
            <SectionHeading eyebrow={t("hub.architecture.computational.eyebrow")} title={t("hub.architecture.computational.title")} subtitle={t("hub.architecture.computational.subtitle")} text={t("hub.architecture.computational.text")} titleId="computational-workflows-title" />
            <p style={{ margin: "-8px 0 22px", color: "#4c43ce", fontSize: "var(--text-helper)", fontWeight: 600 }}>{t("hub.architecture.computational.sequence")}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "14px" }}>
              {computationalTools.map((tool) => (
                <Link key={tool.key} href={contextHref(tool.link)} style={{ color: "inherit", textDecoration: "none", minHeight: "180px" }}>
                  <article style={{ height: "100%", boxSizing: "border-box", padding: "22px", borderRadius: "20px", border: "1px solid rgba(73, 67, 137, 0.13)", background: "#fff", boxShadow: "0 10px 26px rgba(45, 42, 96, 0.05)", display: "flex", flexDirection: "column" }}>
                    <span style={{ width: "42px", height: "42px", borderRadius: "13px", display: "grid", placeItems: "center", color: "#5e51ea", background: "#efedff", fontSize: "var(--text-meta)", fontWeight: 600 }}>{tool.icon}</span>
                    <h3 style={{ margin: "20px 0 9px", fontSize: "var(--text-card)", lineHeight: 1.3 }}>{t(`hub.tools.${tool.key}.title`)}</h3>
                    <p style={{ margin: 0, color: "#716d86", lineHeight: 1.7, fontSize: "var(--text-helper)" }}>{t(`hub.tools.${tool.key}.description`)}</p>
                    <span style={{ marginTop: "auto", paddingTop: "20px", color: "#4c43ce", fontSize: "var(--text-button)", fontWeight: 600 }}>{language === "ar" ? "فتح الأداة" : "Open tool"} ↗</span>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="writing-tools" aria-labelledby="build-study-title" style={sectionStyle}>
          <SectionHeading eyebrow={t("hub.architecture.study.eyebrow")} title={t("hub.architecture.study.title")} subtitle={t("hub.architecture.study.subtitle")} text={t("hub.architecture.study.text")} titleId="build-study-title" />
          <ol style={{ margin: 0, padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))", gap: "10px", listStyle: "none" }}>
            {studyWorkflow.map((step, index) => (
              <li key={step.key} style={{ minHeight: "142px", padding: "17px", display: "flex", flexDirection: "column", border: "1px solid rgba(73, 67, 137, 0.12)", borderRadius: "15px", background: "#fff" }}>
                <span style={{ color: "#6258f5", fontSize: "var(--text-meta)", fontWeight: 600 }}>{String(index + 1).padStart(2, "0")}</span>
                <strong style={{ marginTop: "13px", fontSize: "var(--text-helper)", lineHeight: 1.5 }}>{t(`hub.architecture.study.steps.${step.key}.title`)}</strong>
                <Link href={contextHref(context && step.copilot ? "/workspace?copilot=1" : step.href)} style={{ marginTop: "auto", paddingTop: "14px", color: "#4c43ce", fontSize: "var(--text-helper)", fontWeight: 600, textDecoration: "none" }}>{t(`hub.architecture.study.steps.${step.key}.action`)} ↗</Link>
              </li>
            ))}
          </ol>
          <div style={{ marginTop: "18px", padding: "18px 20px", borderRadius: "15px", background: "#f4f2ff" }}>
            <strong style={{ fontSize: "var(--text-card)" }}>{t("hub.architecture.guidance.title")}</strong>
            <ul style={{ margin: "10px 0 0", paddingInlineStart: "20px", color: "#706c88", fontSize: "var(--text-helper)", lineHeight: 1.75 }}>
              {guidanceItems.map((item) => <li key={item}>{t(`hub.architecture.guidance.${item}`)}</li>)}
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}

function SectionHeading({ eyebrow, title, subtitle, text, titleId }) {
  return <header style={{ maxWidth: "800px", marginBottom: "24px" }}>
    <p style={{ margin: "0 0 8px", color: "#6258f5", fontWeight: 600, fontSize: "var(--text-meta)", letterSpacing: "var(--tracking-overline)" }}>{eyebrow}</p>
    <h2 id={titleId} style={{ margin: 0, fontSize: "var(--text-section)", lineHeight: "var(--leading-heading)", letterSpacing: "var(--tracking-heading)" }}>{title}</h2>
    <p style={{ margin: "9px 0 0", color: "#312c54", fontSize: "var(--text-card)", fontWeight: 600 }}>{subtitle}</p>
    <p style={{ margin: "10px 0 0", color: "#706c88", fontSize: "var(--text-body)", lineHeight: "var(--leading-body)" }}>{text}</p>
  </header>;
}

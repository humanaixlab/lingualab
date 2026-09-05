import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { readResearchContext, researchContextHref, RESEARCH_CONTEXT_TTL_MS } from "../lib/research-context";
import { useLanguage } from "../components/LanguageProvider";
import DataSourceIndicator from "../components/DataSourceIndicator";
import ResearchPaths from "../components/ResearchPaths";

const sections = [
  {
    key: "research",
    tools: [
      {
        key: "interpreter",
        link: "/tools/analyze",
        featured: true,
        icon: "✦",
      },
      {
        key: "advisor",
        link: "/research-advisor",
        icon: "◎",
      },
      {
        key: "report",
        link: "/research-report",
        icon: "↗",
      },
    ],
  },
  {
    key: "corpus",
    tools: [
      {
        key: "frequency",
        link: "/tools/frequency",
        icon: "02",
      },
      {
        key: "concordance",
        link: "/tools/concordance",
        icon: "03",
      },
      {
        key: "ngrams",
        link: "/tools/ngrams",
        icon: "04",
      },
      {
        key: "pos",
        link: "/tools/pos",
        icon: "05",
      },
    ],
  },
  {
    key: "workflows",
    tools: [
      {
        key: "excel",
        link: "/tools/excel",
        icon: "X",
      },
      {
        key: "code",
        link: "/tools/code",
        icon: "</>",
      },
      {
        key: "colab",
        link: "/tools/colab",
        icon: "C",
      },
    ],
  },
  {
    key: "writing",
    tools: [
      {
        key: "prompt",
        link: "/tools/prompt",
        icon: "P",
      },
    ],
  },
];

const recommendedPath = [
  {
    key: "understand",
    links: [{ key: "workspace", href: "/workspace" }],
  },
  {
    key: "design",
    links: [
      { key: "copilot", href: "/workspace", copilot: true },
      { key: "advisor", href: "/research-advisor" },
    ],
  },
  {
    key: "explore",
    links: [
      { key: "frequency", href: "/tools/frequency" },
      { key: "concordance", href: "/tools/concordance" },
      { key: "ngrams", href: "/tools/ngrams" },
    ],
  },
  {
    key: "run",
    links: [
      { key: "analyze", href: "/tools/analyze" },
      { key: "code", href: "/tools/code" },
      { key: "excel", href: "/tools/excel" },
      { key: "colab", href: "/tools/colab" },
    ],
  },
  {
    key: "report",
    links: [
      { key: "report", href: "/research-report" },
    ],
  },
];

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
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top right, rgba(109, 91, 255, 0.12), transparent 34%), #f8f8ff",
        color: "#17152f",
        fontFamily: "var(--font-ui)",
      }}
    >
      <div
        style={{
          width: "min(1220px, calc(100% - 40px))",
          margin: "0 auto",
          padding: "24px 0 72px",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
            paddingBottom: "22px",
            borderBottom: "1px solid rgba(23, 21, 47, 0.09)",
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              color: "#17152f",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "18px",
            }}
          >
            <span
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "12px",
                display: "grid",
                placeItems: "center",
                color: "#fff",
                background: "linear-gradient(135deg, #705bff, #416fe9)",
                boxShadow: "0 10px 24px rgba(84, 82, 226, 0.22)",
              }}
            >
              L
            </span>
            <span>LinguaLab</span>
          </Link>

          <nav style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <Link
              href="/workspace"
              style={{
                color: "#17152f",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "var(--text-nav)",
              }}
            >
              {t("nav.openWorkspace")}
            </Link>
            <Link
              href={contextHref("/research-advisor")}
              style={{
                color: "#17152f",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "var(--text-nav)",
              }}
            >
              {t("nav.researchAdvisor")}
            </Link>
          </nav>
        </header>

        <section style={{ padding: "58px 0 30px" }}>
          <p
            style={{
              margin: "0 0 14px",
              color: "#6258f5",
              fontWeight: 600,
              fontSize: "var(--text-meta)",
              letterSpacing: "var(--tracking-overline)",
            }}
          >
            {t("hub.pageName")}
          </p>

          <h1
            style={{
              margin: 0,
              maxWidth: "780px",
              fontSize: "var(--text-hero)",
              lineHeight: "var(--leading-heading)",
              letterSpacing: "var(--tracking-heading)",
            }}
          >
            {t("hub.heroTitle")}
          </h1>

          <p
            style={{
              maxWidth: "760px",
              margin: "20px 0 0",
              color: "#706c88",
              fontSize: "var(--text-body)",
              lineHeight: "var(--leading-body)",
            }}
          >
            {t("hub.heroText")}
          </p>
        </section>

        <DataSourceIndicator language={language} mode={context ? "projectContext" : "standalone"} />

        {context && (
          <p role="status" dir="auto" style={{ margin: "0 0 20px", padding: "12px 16px", border: "1px solid rgba(112, 91, 255, 0.2)", borderRadius: "12px", background: "#efedff", color: "#4c43ce", fontSize: "13px" }}>
            {t("hub.currentDataset", { filename: context.fileName, count: context.rows.toLocaleString(language) })}
          </p>
        )}

        <ResearchPaths language={language} />

        <section
          aria-labelledby="recommended-research-path"
          style={{
            marginBottom: "28px",
            padding: "28px",
            border: "1px solid rgba(112, 91, 255, 0.2)",
            borderRadius: "24px",
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.94), rgba(242,240,255,0.94))",
            boxShadow: "0 18px 50px rgba(45, 42, 96, 0.08)",
          }}
        >
          <div style={{ maxWidth: "760px", marginBottom: "22px" }}>
            <p
              style={{
                margin: "0 0 8px",
                color: "#6258f5",
                fontWeight: 600,
                fontSize: "var(--text-meta)",
                letterSpacing: "var(--tracking-overline)",
              }}
            >
              {t("hub.guidanceLabel")}
            </p>
            <h2
              id="recommended-research-path"
              style={{
                margin: 0,
                fontSize: "var(--text-section)",
                lineHeight: "var(--leading-heading)",
                letterSpacing: "var(--tracking-heading)",
              }}
            >
              {t("hub.pathTitle")}
            </h2>
            <p
              style={{
                margin: "11px 0 0",
                color: "#706c88",
                fontSize: "var(--text-body)",
                lineHeight: "var(--leading-body)",
              }}
            >
              {t("hub.pathText")}
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              gap: "12px",
            }}
          >
            {recommendedPath.map((step, index) => (
              <article
                key={step.key}
                style={{
                  minHeight: "220px",
                  padding: "19px",
                  display: "flex",
                  flexDirection: "column",
                  border: "1px solid rgba(73, 67, 137, 0.12)",
                  borderRadius: "17px",
                  background: "rgba(255, 255, 255, 0.92)",
                }}
              >
                <span
                  style={{
                    width: "34px",
                    height: "34px",
                    display: "grid",
                    placeItems: "center",
                    borderRadius: "11px",
                    color: "#ffffff",
                    background: "linear-gradient(135deg, #705bff, #416fe9)",
                    fontSize: "var(--text-meta)",
                    fontWeight: 600,
                  }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3
                  style={{
                    margin: "17px 0 8px",
                    fontSize: "var(--text-card)",
                    lineHeight: 1.3,
                    letterSpacing: "var(--tracking-heading)",
                  }}
                >
                  {t(`hub.stages.${step.key}.title`)}
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: "#716d86",
                    fontSize: "var(--text-helper)",
                    lineHeight: 1.65,
                  }}
                >
                  {t(`hub.stages.${step.key}.description`)}
                </p>
                <div
                  style={{
                    marginTop: "auto",
                    paddingTop: "17px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "7px",
                  }}
                >
                  {step.links.map((link) => (
                    <Link
                      key={`${step.key}-${link.key}`}
                      href={contextHref(context && link.copilot ? "/workspace?copilot=1" : link.href)}
                      style={{
                        padding: "7px 9px",
                        borderRadius: "999px",
                        color: "#4c43ce",
                        background: "#efedff",
                        fontSize: "var(--text-button)",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      {t(`hub.stages.${step.key}.${link.key}`)} ↗
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          id="all-tools"
          aria-labelledby="all-tools-title"
          style={{ scrollMarginTop: "24px" }}
        >
          <div style={{ maxWidth: "760px", margin: "42px 0 22px" }}>
            <p style={{ margin: "0 0 8px", color: "#6258f5", fontWeight: 600, fontSize: "var(--text-meta)", letterSpacing: "var(--tracking-overline)" }}>
              {t("hub.allToolsLabel")}
            </p>
            <h2 id="all-tools-title" style={{ margin: 0, fontSize: "var(--text-page)", lineHeight: "var(--leading-heading)", letterSpacing: "var(--tracking-heading)" }}>
              {t("hub.allToolsTitle")}
            </h2>
            <p style={{ margin: "12px 0 0", color: "#706c88", fontSize: "var(--text-body)", lineHeight: "var(--leading-body)" }}>
              {t("hub.allToolsText")}
            </p>
          </div>

          <div style={{ display: "grid", gap: "24px" }}>
          {sections.map((section) => (
            <section
              key={section.key}
              id={section.key === "workflows" ? "build-tools" : section.key === "writing" ? "writing-tools" : undefined}
              style={{
                padding: "26px",
                border: "1px solid rgba(73, 67, 137, 0.13)",
                borderRadius: "24px",
                background: "rgba(255, 255, 255, 0.86)",
                boxShadow: "0 18px 50px rgba(45, 42, 96, 0.07)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  gap: "18px",
                  flexWrap: "wrap",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <p
                    style={{
                      margin: "0 0 8px",
                      color: "#6258f5",
                      fontWeight: 600,
                      fontSize: "var(--text-meta)",
                      letterSpacing: "var(--tracking-overline)",
                    }}
                  >
                    {t(`hub.sections.${section.key}.eyebrow`)}
                  </p>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "var(--text-section)",
                      lineHeight: "var(--leading-heading)",
                      letterSpacing: "var(--tracking-heading)",
                    }}
                  >
                    {t(`hub.sections.${section.key}.title`)}
                  </h2>
                </div>

                <p
                  style={{
                    maxWidth: "500px",
                    margin: 0,
                    color: "#77728f",
                    lineHeight: "var(--leading-body)",
                    fontSize: "var(--text-body)",
                  }}
                >
                  {t(`hub.sections.${section.key}.description`)}
                </p>
                {section.key === "workflows" && (
                  <p style={{ width: "100%", margin: "12px 0 0", color: "#4c43ce", fontSize: "var(--text-helper)", fontWeight: 600 }}>
                    {language === "ar" ? "جهّز البيانات ← أنشئ الشفرة ← شغّلها في Colab" : "Prepare data → Generate code → Run in Colab"}
                  </p>
                )}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                  gap: "14px",
                }}
              >
                {section.tools.map((tool) => (
                  <Link
                    key={tool.key}
                    href={contextHref(tool.link)}
                    style={{
                      color: "inherit",
                      textDecoration: "none",
                      minHeight: "190px",
                    }}
                  >
                    <article
                      style={{
                        height: "100%",
                        boxSizing: "border-box",
                        padding: "22px",
                        borderRadius: "20px",
                        border: tool.featured
                          ? "1px solid rgba(112, 91, 255, 0.7)"
                          : "1px solid rgba(73, 67, 137, 0.13)",
                        background: tool.featured
                          ? "linear-gradient(145deg, #1a1738, #222046)"
                          : "#ffffff",
                        color: tool.featured ? "#ffffff" : "#17152f",
                        boxShadow: tool.featured
                          ? "0 20px 42px rgba(30, 27, 71, 0.2)"
                          : "0 10px 26px rgba(45, 42, 96, 0.05)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "12px",
                            marginBottom: "22px",
                          }}
                        >
                          <span
                            style={{
                              width: "42px",
                              height: "42px",
                              borderRadius: "13px",
                              display: "grid",
                              placeItems: "center",
                              fontWeight: 600,
                              fontSize: "var(--text-meta)",
                              background: tool.featured
                                ? "rgba(190, 181, 255, 0.2)"
                                : "#efedff",
                              color: tool.featured ? "#d8d2ff" : "#5e51ea",
                            }}
                          >
                            {tool.icon}
                          </span>

                          {tool.badge ? (
                            <span
                              style={{
                                padding: "6px 10px",
                                borderRadius: "999px",
                                background: "rgba(190, 181, 255, 0.16)",
                                color: "#d8d2ff",
                                fontSize: "var(--text-meta)",
                                fontWeight: 600,
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                              }}
                            >
                              {t("hub.featured")}
                            </span>
                          ) : null}
                        </div>

                        <h3
                          style={{
                            margin: "0 0 10px",
                            fontSize: "var(--text-card)",
                            lineHeight: 1.3,
                            letterSpacing: "var(--tracking-heading)",
                          }}
                        >
                          {t(`hub.tools.${tool.key}.title`)}
                        </h3>

                        <p
                          style={{
                            margin: 0,
                            color: tool.featured ? "#c9c5dd" : "#716d86",
                            lineHeight: 1.7,
                            fontSize: "var(--text-helper)",
                          }}
                        >
                            {t(`hub.tools.${tool.key}.description`)}
                        </p>
                      </div>

                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          marginTop: "24px",
                          fontWeight: 600,
                          fontSize: "var(--text-button)",
                          color: tool.featured ? "#ffffff" : "#4c43ce",
                        }}
                      >
                        {language === "ar" ? "فتح الأداة" : "Open tool"} <span aria-hidden="true">↗</span>
                      </span>
                    </article>
                  </Link>
                ))}
              </div>
            </section>
          ))}
          </div>
        </section>
      </div>
    </main>
  );
}

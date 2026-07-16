import Link from "next/link";

const sections = [
  {
    eyebrow: "AI RESEARCH",
    title: "AI Research",
    description:
      "Move from descriptive results to defensible interpretation, guidance, and reporting.",
    tools: [
      {
        title: "AI Research Interpreter",
        description:
          "Turn descriptive findings into a research interpretation, methodological implications, limitations, and a next step.",
        link: "/tools/analyze",
        featured: true,
        badge: "Featured",
        icon: "✦",
      },
      {
        title: "Research Advisor",
        description:
          "Get a focused analysis plan based on the research question rather than the available tools.",
        link: "/research-advisor",
        icon: "◎",
      },
      {
        title: "Research Report",
        description:
          "Open the saved analysis as a structured, research-ready report.",
        link: "/research-report",
        icon: "↗",
      },
    ],
  },
  {
    eyebrow: "CORPUS ANALYSIS",
    title: "Corpus Analysis",
    description:
      "Explore recurring forms, context, and lexical patterns in Arabic text.",
    tools: [
      {
        title: "Text Analysis",
        description:
          "Create a focused lexical profile before moving to deeper interpretation.",
        link: "/tools/analyze",
        icon: "01",
      },
      {
        title: "Frequency Analysis",
        description:
          "Identify the most frequent lexical items in a text or dataset.",
        link: "/tools/frequency",
        icon: "02",
      },
      {
        title: "Concordance",
        description:
          "Inspect words and expressions inside their surrounding context.",
        link: "/tools/concordance",
        icon: "03",
      },
      {
        title: "N-grams",
        description:
          "Discover recurring multi-word sequences and phrase-level patterns.",
        link: "/tools/ngrams",
        icon: "04",
      },
      {
        title: "POS Analysis",
        description:
          "Explore initial part-of-speech patterns in the submitted text.",
        link: "/tools/pos",
        icon: "05",
      },
    ],
  },
  {
    eyebrow: "DATA & WORKFLOWS",
    title: "Data and Computational Workflows",
    description:
      "Move from structured data to reproducible computational experiments.",
    tools: [
      {
        title: "Excel Workflow",
        description:
          "Start from a structured spreadsheet and prepare columns for analysis.",
        link: "/tools/excel",
        icon: "X",
      },
      {
        title: "Code Generator",
        description:
          "Generate a clear starting point for the computational workflow you need.",
        link: "/tools/code",
        icon: "</>",
      },
      {
        title: "Google Colab",
        description:
          "Continue the workflow in a cloud notebook for experimentation and reproducibility.",
        link: "/tools/colab",
        icon: "C",
      },
    ],
  },
  {
    eyebrow: "RESEARCH WRITING",
    title: "Research Writing Support",
    description:
      "Create clearer prompts and more structured instructions for research tasks.",
    tools: [
      {
        title: "Prompt Helper",
        description:
          "Turn a research objective into a precise and structured prompt.",
        link: "/tools/prompt",
        icon: "P",
      },
    ],
  },
];

export default function ArabicToolsPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top right, rgba(109, 91, 255, 0.12), transparent 34%), #f8f8ff",
        color: "#17152f",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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
            href="/workspace"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              color: "#17152f",
              textDecoration: "none",
              fontWeight: 800,
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
                fontWeight: 700,
                fontSize: "14px",
              }}
            >
              Workspace
            </Link>
            <Link
              href="/research-advisor"
              style={{
                color: "#17152f",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "14px",
              }}
            >
              Research Advisor
            </Link>
          </nav>
        </header>

        <section style={{ padding: "58px 0 30px" }}>
          <p
            style={{
              margin: "0 0 14px",
              color: "#6258f5",
              fontWeight: 800,
              fontSize: "12px",
              letterSpacing: "0.16em",
            }}
          >
            RESEARCH TOOLS
          </p>

          <h1
            style={{
              margin: 0,
              maxWidth: "780px",
              fontSize: "clamp(34px, 5vw, 56px)",
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
            }}
          >
            Choose the right tool for your research goal.
          </h1>

          <p
            style={{
              maxWidth: "760px",
              margin: "20px 0 0",
              color: "#706c88",
              fontSize: "17px",
              lineHeight: 1.8,
            }}
          >
            Use each tool independently, or combine them inside the LinguaLab
            workflow to move from data understanding to analysis, interpretation,
            and reporting.
          </p>
        </section>

        <div style={{ display: "grid", gap: "24px" }}>
          {sections.map((section) => (
            <section
              key={section.eyebrow}
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
                      fontWeight: 800,
                      fontSize: "10px",
                      letterSpacing: "0.14em",
                    }}
                  >
                    {section.eyebrow}
                  </p>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "clamp(24px, 3vw, 34px)",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    {section.title}
                  </h2>
                </div>

                <p
                  style={{
                    maxWidth: "500px",
                    margin: 0,
                    color: "#77728f",
                    lineHeight: 1.7,
                    fontSize: "14px",
                  }}
                >
                  {section.description}
                </p>
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
                    key={tool.title}
                    href={tool.link}
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
                              fontWeight: 900,
                              fontSize: "12px",
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
                                fontSize: "9px",
                                fontWeight: 800,
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                              }}
                            >
                              {tool.badge}
                            </span>
                          ) : null}
                        </div>

                        <h3
                          style={{
                            margin: "0 0 10px",
                            fontSize: "20px",
                            letterSpacing: "-0.025em",
                          }}
                        >
                          {tool.title}
                        </h3>

                        <p
                          style={{
                            margin: 0,
                            color: tool.featured ? "#c9c5dd" : "#716d86",
                            lineHeight: 1.7,
                            fontSize: "13px",
                          }}
                        >
                          {tool.description}
                        </p>
                      </div>

                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          marginTop: "24px",
                          fontWeight: 800,
                          fontSize: "12px",
                          color: tool.featured ? "#ffffff" : "#4c43ce",
                        }}
                      >
                        Open tool <span aria-hidden="true">↗</span>
                      </span>
                    </article>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
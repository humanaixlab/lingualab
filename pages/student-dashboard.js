import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const learningPaths = [
  {
    id: "text-analysis",
    label: "FOUNDATIONS",
    title: "Text Analysis Basics",
    description:
      "Learn how to inspect Arabic text, identify useful patterns, and choose an appropriate analysis task.",
    href: "/tools/analyze",
    action: "Start text analysis",
    completed: false,
  },
  {
    id: "prompt-practice",
    label: "AI LITERACY",
    title: "Prompt Practice",
    description:
      "Practice writing clear instructions for AI tools and improve prompts through guided experimentation.",
    href: "/tools/prompt",
    action: "Practice prompting",
    completed: false,
  },
  {
    id: "code-learning",
    label: "APPLIED NLP",
    title: "Arabic NLP with Code",
    description:
      "Generate and study practical code for Arabic NLP, data preparation, and research-oriented analysis.",
    href: "/tools/code",
    action: "Open coding assistant",
    completed: false,
  },
  {
    id: "data-learning",
    label: "RESEARCH DATA",
    title: "Working with Research Data",
    description:
      "Explore structured datasets, understand columns and quality issues, and prepare data for analysis.",
    href: "/tools/excel",
    action: "Explore data tools",
    completed: false,
  },
];

function ArrowIcon() {
  return <span aria-hidden="true">↗</span>;
}

export default function LearningHubPage() {
  const [paths, setPaths] = useState(learningPaths);

  useEffect(() => {
    const saved = localStorage.getItem("lingualab-learning-progress");

    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        setPaths(
          learningPaths.map((path) => {
            const savedPath = parsed.find((item) => item.id === path.id);
            return savedPath
              ? { ...path, completed: Boolean(savedPath.completed) }
              : path;
          })
        );
      }
    } catch (error) {
      console.error("Failed to load learning progress:", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "lingualab-learning-progress",
      JSON.stringify(
        paths.map(({ id, completed }) => ({
          id,
          completed,
        }))
      )
    );
  }, [paths]);

  const completedCount = useMemo(
    () => paths.filter((path) => path.completed).length,
    [paths]
  );

  const progress = useMemo(() => {
    if (!paths.length) return 0;
    return Math.round((completedCount / paths.length) * 100);
  }, [completedCount, paths.length]);

  const togglePath = (id) => {
    setPaths((currentPaths) =>
      currentPaths.map((path) =>
        path.id === id ? { ...path, completed: !path.completed } : path
      )
    );
  };

  const resetProgress = () => {
    setPaths((currentPaths) =>
      currentPaths.map((path) => ({
        ...path,
        completed: false,
      }))
    );
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <nav style={styles.nav}>
          <Link href="/" style={styles.brand}>
            <span style={styles.brandMark}>L</span>
            <span>LinguaLab</span>
          </Link>

          <div style={styles.navLinks}>
            <Link href="/workspace" style={styles.navLink}>
              Workspace
            </Link>
            <Link href="/ar-tools" style={styles.navLink}>
              Research Hub
            </Link>
            <Link href="/research-advisor" style={styles.navLink}>
              Research Advisor
            </Link>
          </div>

          <Link href="/" style={styles.backLink}>
            Back home
          </Link>
        </nav>

        <section style={styles.hero}>
          <div>
            <p style={styles.eyebrow}>LEARN BY DOING</p>
            <h1 style={styles.heroTitle}>Learning Hub</h1>
            <p style={styles.heroLead}>
              Build practical skills in Arabic NLP, AI prompting, research data,
              and text analysis through guided hands-on activities.
            </p>
          </div>

          <div style={styles.progressCard}>
            <div style={styles.progressTop}>
              <div>
                <p style={styles.miniLabel}>SELF-GUIDED PROGRESS</p>
                <strong style={styles.progressValue}>{progress}%</strong>
              </div>
              <span style={styles.progressCount}>
                {completedCount}/{paths.length} completed
              </span>
            </div>

            <div style={styles.progressTrack}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${progress}%`,
                }}
              />
            </div>

            <p style={styles.progressNote}>
              Progress is saved in this browser. Mark a path complete after you
              finish its activity.
            </p>

            <button type="button" onClick={resetProgress} style={styles.resetButton}>
              Reset progress
            </button>
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeading}>
            <div>
              <p style={styles.eyebrow}>GUIDED LEARNING PATHS</p>
              <h2 style={styles.sectionTitle}>Choose what you want to practice.</h2>
            </div>
            <p style={styles.sectionText}>
              Each path connects directly to an active LinguaLab tool, so learning
              happens through real tasks rather than isolated lessons.
            </p>
          </div>

          <div style={styles.grid}>
            {paths.map((path, index) => (
              <article key={path.id} style={styles.card}>
                <div style={styles.cardTop}>
                  <span style={styles.pathNumber}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span style={styles.pathLabel}>{path.label}</span>
                </div>

                <h3 style={styles.cardTitle}>{path.title}</h3>
                <p style={styles.cardDescription}>{path.description}</p>

                <div style={styles.cardFooter}>
                  <Link href={path.href} style={styles.primaryAction}>
                    {path.action} <ArrowIcon />
                  </Link>

                  <label style={styles.completeLabel}>
                    <input
                      type="checkbox"
                      checked={path.completed}
                      onChange={() => togglePath(path.id)}
                    />
                    <span>{path.completed ? "Completed" : "Mark complete"}</span>
                  </label>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section style={styles.aiSection}>
          <div>
            <p style={styles.eyebrow}>NEED DIRECTION?</p>
            <h2 style={styles.aiTitle}>Ask the AI Research Advisor what to learn next.</h2>
            <p style={styles.aiText}>
              Describe your goal, research stage, or data, and receive a suggested
              next step based on your project.
            </p>
          </div>

          <Link href="/research-advisor" style={styles.aiButton}>
            Open Research Advisor <ArrowIcon />
          </Link>
        </section>
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #f7f9ff 0%, #ffffff 48%, #f6f8fc 100%)",
    color: "#111827",
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    direction: "ltr",
  },
  container: {
    width: "min(1180px, calc(100% - 40px))",
    margin: "0 auto",
    paddingBottom: "72px",
  },
  nav: {
    minHeight: "82px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "24px",
    flexWrap: "wrap",
  },
  brand: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    color: "#111827",
    textDecoration: "none",
    fontSize: "18px",
    fontWeight: "800",
  },
  brandMark: {
    width: "34px",
    height: "34px",
    borderRadius: "11px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#111827",
    color: "#ffffff",
  },
  navLinks: {
    display: "flex",
    gap: "22px",
    flexWrap: "wrap",
  },
  navLink: {
    color: "#667085",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "600",
  },
  backLink: {
    color: "#111827",
    textDecoration: "none",
    border: "1px solid #dfe3ea",
    borderRadius: "999px",
    padding: "10px 16px",
    fontSize: "13px",
    fontWeight: "700",
    background: "#ffffff",
  },
  hero: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.4fr) minmax(300px, 0.8fr)",
    gap: "32px",
    alignItems: "stretch",
    padding: "56px 0 34px",
  },
  eyebrow: {
    margin: "0 0 12px",
    color: "#6366f1",
    fontSize: "12px",
    letterSpacing: "0.13em",
    fontWeight: "800",
  },
  heroTitle: {
    margin: 0,
    fontSize: "clamp(42px, 7vw, 76px)",
    lineHeight: "1",
    letterSpacing: "-0.055em",
  },
  heroLead: {
    maxWidth: "710px",
    margin: "24px 0 0",
    color: "#5f6878",
    fontSize: "18px",
    lineHeight: "1.75",
  },
  progressCard: {
    background: "#111827",
    color: "#ffffff",
    borderRadius: "28px",
    padding: "28px",
    boxShadow: "0 22px 60px rgba(17, 24, 39, 0.18)",
  },
  progressTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
  },
  miniLabel: {
    margin: "0 0 8px",
    color: "#aeb7c6",
    fontSize: "11px",
    letterSpacing: "0.11em",
    fontWeight: "800",
  },
  progressValue: {
    fontSize: "48px",
    lineHeight: "1",
  },
  progressCount: {
    color: "#d1d5db",
    fontSize: "13px",
    fontWeight: "700",
  },
  progressTrack: {
    height: "10px",
    margin: "28px 0 18px",
    overflow: "hidden",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.14)",
  },
  progressFill: {
    height: "100%",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #818cf8, #c084fc)",
    transition: "width 0.3s ease",
  },
  progressNote: {
    color: "#c5ccd7",
    fontSize: "13px",
    lineHeight: "1.7",
  },
  resetButton: {
    marginTop: "8px",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: "12px",
    padding: "9px 13px",
    background: "transparent",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "700",
  },
  section: {
    padding: "54px 0",
  },
  sectionHeading: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 0.7fr)",
    gap: "32px",
    alignItems: "end",
    marginBottom: "28px",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "clamp(30px, 5vw, 48px)",
    letterSpacing: "-0.04em",
  },
  sectionText: {
    margin: 0,
    color: "#6b7280",
    lineHeight: "1.75",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "18px",
  },
  card: {
    minHeight: "300px",
    display: "flex",
    flexDirection: "column",
    background: "#ffffff",
    border: "1px solid #e4e7ec",
    borderRadius: "24px",
    padding: "26px",
    boxShadow: "0 14px 38px rgba(15, 23, 42, 0.055)",
  },
  cardTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "14px",
  },
  pathNumber: {
    color: "#98a2b3",
    fontSize: "13px",
    fontWeight: "800",
  },
  pathLabel: {
    padding: "7px 10px",
    borderRadius: "999px",
    background: "#f1f3ff",
    color: "#4f46e5",
    fontSize: "10px",
    letterSpacing: "0.08em",
    fontWeight: "800",
  },
  cardTitle: {
    margin: "28px 0 12px",
    fontSize: "25px",
    letterSpacing: "-0.025em",
  },
  cardDescription: {
    margin: 0,
    color: "#667085",
    lineHeight: "1.75",
    flex: 1,
  },
  cardFooter: {
    marginTop: "28px",
    paddingTop: "20px",
    borderTop: "1px solid #edf0f4",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
  },
  primaryAction: {
    color: "#111827",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "800",
  },
  completeLabel: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    color: "#667085",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
  },
  aiSection: {
    marginTop: "42px",
    padding: "34px",
    borderRadius: "28px",
    background:
      "linear-gradient(135deg, rgba(238,242,255,1) 0%, rgba(250,245,255,1) 100%)",
    border: "1px solid #dddff7",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "28px",
    flexWrap: "wrap",
  },
  aiTitle: {
    margin: 0,
    fontSize: "30px",
    letterSpacing: "-0.035em",
  },
  aiText: {
    maxWidth: "720px",
    margin: "12px 0 0",
    color: "#667085",
    lineHeight: "1.7",
  },
  aiButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "13px 18px",
    borderRadius: "14px",
    background: "#111827",
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "800",
  },
};


import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../components/LanguageProvider";

const learningPaths = [
  {
    id: "text-analysis",
    copyKey: "text",
    href: "/tools/analyze",
    completed: false,
  },
  {
    id: "prompt-practice",
    copyKey: "prompt",
    href: "/tools/prompt",
    completed: false,
  },
  {
    id: "code-learning",
    copyKey: "code",
    href: "/tools/code",
    completed: false,
  },
  {
    id: "data-learning",
    copyKey: "data",
    href: "/tools/excel",
    completed: false,
  },
];

export default function LearningHubPage() {
  const { t } = useLanguage();
  const [paths, setPaths] = useState(learningPaths);

  useEffect(() => {
    let restoreTimer;
    const saved = localStorage.getItem("lingualab-learning-progress");

    if (!saved) return undefined;

    try {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        restoreTimer = window.setTimeout(() => setPaths(
          learningPaths.map((path) => {
            const savedPath = parsed.find((item) => item.id === path.id);
            return savedPath
              ? { ...path, completed: Boolean(savedPath.completed) }
              : path;
          })
        ), 0);
      }
    } catch (error) {
      console.error("Failed to load learning progress:", error);
    }
    return () => window.clearTimeout(restoreTimer);
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
              {t("nav.openWorkspace")}
            </Link>
            <Link href="/ar-tools" style={styles.navLink}>
              {t("nav.researchHub")}
            </Link>
            <Link href="/research-advisor" style={styles.navLink}>
              {t("nav.researchAdvisor")}
            </Link>
          </div>

          <Link href="/" style={styles.backLink}>
            {t("learning.backHome")}
          </Link>
        </nav>

        <section style={styles.hero}>
          <div>
            <p style={styles.eyebrow}>{t("learning.eyebrow")}</p>
            <h1 style={styles.heroTitle}>{t("learning.title")}</h1>
            <p style={styles.heroLead}>
              {t("learning.lead")}
            </p>
          </div>

          <div style={styles.progressCard}>
            <div style={styles.progressTop}>
              <div>
                <p style={styles.miniLabel}>{t("learning.progressLabel")}</p>
                <strong style={styles.progressValue}>{progress}%</strong>
              </div>
              <span style={styles.progressCount}>
                {t("learning.completed", { done: completedCount, total: paths.length })}
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
              {t("learning.progressNote")}
            </p>

            <button type="button" onClick={resetProgress} style={styles.resetButton}>
              {t("learning.reset")}
            </button>
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeading}>
            <div>
              <p style={styles.eyebrow}>{t("learning.pathsLabel")}</p>
              <h2 style={styles.sectionTitle}>{t("learning.pathsTitle")}</h2>
            </div>
            <p style={styles.sectionText}>
              {t("learning.pathsDescription")}
            </p>
          </div>

          <div style={styles.grid}>
            {paths.map((path, index) => (
              <article key={path.id} style={styles.card}>
                <div style={styles.cardTop}>
                  <span style={styles.pathNumber}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span style={styles.pathLabel}>{t(`learning.paths.${path.copyKey}.label`)}</span>
                </div>

                <h3 style={styles.cardTitle}>{t(`learning.paths.${path.copyKey}.title`)}</h3>
                <p style={styles.cardDescription}>{t(`learning.paths.${path.copyKey}.description`)}</p>

                <div style={styles.cardFooter}>
                  <Link href={path.href} style={styles.primaryAction}>
                    {t(`learning.paths.${path.copyKey}.action`)}
                  </Link>

                  <label style={styles.completeLabel}>
                    <input
                      type="checkbox"
                      checked={path.completed}
                      onChange={() => togglePath(path.id)}
                    />
                    <span>{path.completed ? t("learning.complete") : t("learning.markComplete")}</span>
                  </label>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section style={styles.aiSection}>
          <div>
            <p style={styles.eyebrow}>{t("learning.optionalLabel")}</p>
            <h2 style={styles.aiTitle}>{t("learning.optionalTitle")}</h2>
            <p style={styles.aiText}>
              {t("learning.optionalText")}
            </p>
          </div>

          <Link href="/research-advisor" style={styles.aiButton}>
            {t("learning.askAdvisor")}
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
    fontFamily: "var(--font-ui)",
    direction: "inherit",
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
    fontWeight: "600",
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
    fontSize: "var(--text-nav)",
    fontWeight: "600",
  },
  backLink: {
    color: "#111827",
    textDecoration: "none",
    border: "1px solid #dfe3ea",
    borderRadius: "999px",
    padding: "10px 16px",
    fontSize: "var(--text-nav)",
    fontWeight: "600",
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
    fontSize: "var(--text-meta)",
    letterSpacing: "var(--tracking-overline)",
    fontWeight: "600",
  },
  heroTitle: {
    margin: 0,
    fontSize: "var(--text-hero)",
    lineHeight: "var(--leading-heading)",
    letterSpacing: "var(--tracking-heading)",
  },
  heroLead: {
    maxWidth: "710px",
    margin: "24px 0 0",
    color: "#5f6878",
    fontSize: "var(--text-body)",
    lineHeight: "var(--leading-body)",
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
    fontSize: "var(--text-meta)",
    letterSpacing: "var(--tracking-overline)",
    fontWeight: "600",
  },
  progressValue: {
    fontSize: "48px",
    lineHeight: "1",
  },
  progressCount: {
    color: "#d1d5db",
    fontSize: "13px",
    fontWeight: "600",
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
    fontWeight: "600",
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
    fontSize: "var(--text-page)",
    lineHeight: "var(--leading-heading)",
    letterSpacing: "var(--tracking-heading)",
  },
  sectionText: {
    margin: 0,
    color: "#6b7280",
    fontSize: "var(--text-body)",
    lineHeight: "var(--leading-body)",
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
    fontWeight: "600",
  },
  pathLabel: {
    padding: "7px 10px",
    borderRadius: "999px",
    background: "#f1f3ff",
    color: "#4f46e5",
    fontSize: "var(--text-meta)",
    letterSpacing: "var(--tracking-overline)",
    fontWeight: "600",
  },
  cardTitle: {
    margin: "28px 0 12px",
    fontSize: "var(--text-card)",
    lineHeight: "1.3",
    letterSpacing: "var(--tracking-heading)",
  },
  cardDescription: {
    margin: 0,
    color: "#667085",
    fontSize: "var(--text-body)",
    lineHeight: "var(--leading-body)",
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
    fontSize: "var(--text-button)",
    fontWeight: "600",
  },
  completeLabel: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    color: "#667085",
    fontSize: "13px",
    fontWeight: "600",
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
    fontSize: "var(--text-section)",
    lineHeight: "var(--leading-heading)",
    letterSpacing: "var(--tracking-heading)",
  },
  aiText: {
    maxWidth: "720px",
    margin: "12px 0 0",
    color: "#667085",
    fontSize: "var(--text-body)",
    lineHeight: "var(--leading-body)",
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
    fontSize: "var(--text-button)",
    fontWeight: "600",
  },
};

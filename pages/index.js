import Head from "next/head";
import Link from "next/link";
import styles from "../styles/Home.module.css";
import { useLanguage } from "../components/LanguageProvider";

const goals = [
  {
    key: "research",
    href: "/ar-tools",
    icon: "01",
  },
  {
    key: "analyze",
    href: "/tools/analyze",
    icon: "02",
  },
  {
    key: "build",
    href: "/tools/prompt",
    icon: "03",
  },
  {
    key: "learn",
    href: "/student-dashboard",
    icon: "04",
  },
];

const workflow = ["upload", "understand", "choose", "analyze", "interpret", "report"];

const capabilities = [
  "corpus", "frequency", "concordance", "ngrams", "pos", "semantic", "code", "assistant",
];

function ArrowIcon() {
  return <span aria-hidden="true">↗</span>;
}

export default function HomePage() {
  const { t } = useLanguage();
  return (
    <>
      <Head>
        <title>{t("home.pageTitle")}</title>
        <meta
          name="description"
          content={t("home.metaDescription")}
        />
        <link rel="icon" href="/favicon.svg" />
        <meta property="og:title" content={t("home.pageTitle")} />
        <meta
          property="og:description"
          content={t("home.metaDescription")}
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <main className={styles.page}>
        <nav className={styles.nav} aria-label={t("a11y.primaryNavigation")}>
          <Link href="/" className={styles.brand}>
            <span className={styles.brandMark}>L</span>
            <span>LinguaLab</span>
          </Link>

          <div className={styles.navLinks}>
            <a href="#workspace">{t("home.navWorkspace")}</a>
            <a href="#capabilities">{t("home.navExplore")}</a>
            <Link href="/student-dashboard">{t("nav.learn")}</Link>
            <Link href="/projects">{t("nav.projects")}</Link>
          </div>

          <Link href="/workspace" className={styles.navCta}>
            {t("home.startExploring")}
          </Link>
        </nav>

        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{t("home.eyebrow")}</p>
            <h1>
              {t("home.heroTitle")}
              <br />
              {t("home.heroTitleSecond")}
            </h1>
            <p className={styles.heroLead}>
              {t("home.heroLead")}
            </p>
            <p className={styles.heroText}>
              {t("home.heroText")}
            </p>

            <div className={styles.heroActions}>
              <Link href="/workspace" className={styles.primaryButton}>
                {t("home.startWorkspace")}
              </Link>
              <a href="#workflow" className={styles.secondaryButton}>
                {t("home.exploreDemo")}
              </a>
            </div>

            <div className={styles.proofRow} aria-label={t("a11y.strengths")}>
              <span>{t("home.strengths.arabic")}</span>
              <span>{t("home.strengths.research")}</span>
              <span>{t("home.strengths.learning")}</span>
            </div>
          </div>

          <div className={styles.productPreview} aria-label={t("a11y.productPreview")}>
            <div className={styles.previewTopbar}>
              <div className={styles.windowDots} aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <span>{t("home.preview.workspace")}</span>
              <span className={styles.liveBadge}>{t("home.preview.active")}</span>
            </div>

            <div className={styles.previewBody}>
              <div className={styles.uploadCard}>
                <div>
                  <p className={styles.miniLabel}>{t("home.preview.uploaded")}</p>
                  <strong dir="auto">arabic_reviews.xlsx</strong>
                </div>
                <span className={styles.fileBadge}>XLSX</span>
              </div>

              <div className={styles.analysisHeading}>
                <div className={styles.spark}>✦</div>
                <div>
                  <p className={styles.miniLabel}>{t("home.preview.understood")}</p>
                  <h2>{t("home.preview.found")}</h2>
                </div>
              </div>

              <div className={styles.findingsGrid}>
                <div className={styles.findingCard}>
                  <span>{t("home.preview.language")}</span>
                  <strong>{t("home.preview.arabic")}</strong>
                </div>
                <div className={styles.findingCard}>
                  <span>{t("home.preview.records")}</span>
                  <strong>{t("home.preview.recordValue")}</strong>
                </div>
                <div className={styles.findingCard}>
                  <span>{t("home.preview.missing")}</span>
                  <strong>{t("home.preview.missingValue")}</strong>
                </div>
                <div className={styles.findingCard}>
                  <span>{t("home.preview.labels")}</span>
                  <strong>{t("home.preview.labelValue")}</strong>
                </div>
              </div>

              <div className={styles.recommendation}>
                <div>
                  <p className={styles.miniLabel}>{t("home.preview.recommended")}</p>
                  <strong>{t("home.preview.recommendation")}</strong>
                  <p>{t("home.preview.recommendationText")}</p>
                </div>
                <Link href="/workspace" className={styles.continueButton}>
                  {t("home.preview.continue")}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section} id="workspace">
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>{t("home.goalsEyebrow")}</p>
            <h2>{t("home.goalsTitle")}</h2>
            <p>{t("home.goalsText")}</p>
          </div>

          <div className={styles.goalsGrid}>
            {goals.map((goal) => (
              <Link href={goal.href} className={styles.goalCard} key={goal.label}>
                <span className={styles.goalNumber}>{goal.icon}</span>
                <p className={styles.goalLabel}>{t(`home.goals.${goal.key}.label`)}</p>
                <h3>{t(`home.goals.${goal.key}.title`)}</h3>
                <p>{t(`home.goals.${goal.key}.description`)}</p>
                <span className={styles.cardLink}>
                  {t(`home.goals.${goal.key}.action`)} <ArrowIcon />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className={`${styles.section} ${styles.workflowSection}`} id="workflow">
          <div className={styles.workflowIntro}>
            <p className={styles.eyebrow}>{t("home.workflowEyebrow")}</p>
            <h2>{t("home.workflowTitle")}</h2>
            <p>{t("home.workflowText")}</p>
          </div>

          <div className={styles.workflowTrack}>
            {workflow.map((step, index) => (
              <div className={styles.workflowStep} key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{t(`home.workflow.${step}`)}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section} id="capabilities">
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>{t("home.capabilitiesEyebrow")}</p>
            <h2>{t("home.capabilitiesTitle")}</h2>
            <p>{t("home.capabilitiesText")}</p>
            <Link href="/ar-tools#all-tools" className={styles.secondaryButton}>
              {t("home.browse")}
            </Link>
          </div>

          <div className={styles.capabilitiesGrid}>
            {capabilities.map((item) => (
              <article className={styles.capabilityCard} key={item}>
                <div className={styles.capabilityIcon}>✦</div>
                <h3>{t(`home.capabilities.${item}.name`)}</h3>
                <p>{t(`home.capabilities.${item}.detail`)}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={`${styles.section} ${styles.partnerSection}`}>
          <div className={styles.partnerCopy}>
            <p className={styles.eyebrow}>{t("home.partnerEyebrow")}</p>
            <h2>{t("home.partnerTitle")}</h2>
            <p>{t("home.partnerText")}</p>
            <Link href="/smart-home" className={styles.secondaryDarkButton}>
              {t("home.meetAssistant")}
            </Link>
          </div>

          <div className={styles.chatCard}>
            <div className={styles.userMessage}>
              {t("home.userMessage")}
            </div>
            <div className={styles.aiMessage}>
              <div className={styles.aiAvatar}>L</div>
              <div>
                <strong>LinguaLab</strong>
                <p>
                  {t("home.aiMessage")}
                </p>
                <button type="button">{t("home.buildWorkflow")}</button>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.finalCta}>
          <p className={styles.eyebrow}>{t("home.finalEyebrow")}</p>
          <h2>
            {t("home.finalTitle")}
            <br />
            {t("home.finalTitleSecond")}
          </h2>
          <Link href="/workspace" className={styles.primaryButton}>
            {t("home.startWorkspace")}
          </Link>
        </section>

        <footer className={styles.footer}>
          <Link href="/" className={styles.brand}>
            <span className={styles.brandMark}>L</span>
            <span>LinguaLab</span>
          </Link>
          <p>{t("home.footer")}</p>
          <span>{t("home.edition")}</span>
        </footer>
      </main>
    </>
  );
}

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

const workflow = ["understand", "prepare", "choose", "apply", "view", "evaluate", "interpret", "errors", "improve"];

const computationalAreas = ["data", "preparation", "results", "improvement"];

const onboardingSteps = [
  { key: "linguistic", href: "/ar-tools#research-paths" },
  { key: "computational", href: "/ar-tools#build-tools" },
  { key: "study", href: "/research-advisor" },
  { key: "output", href: "/research-report" },
];

const capabilities = [
  "corpus", "frequency", "concordance", "ngrams", "pos", "semantic", "code", "assistant",
];

const capabilityIcons = {
  corpus: "layers",
  frequency: "bars",
  concordance: "context",
  ngrams: "sequence",
  pos: "tags",
  semantic: "nodes",
  code: "code",
  assistant: "spark",
};

function ArrowIcon() {
  return (
    <svg className={styles.arrowIcon} viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 13 13 3M6 3h7v7" />
    </svg>
  );
}

function VisualIcon({ name }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round", strokeLinejoin: "round" };
  const drawings = {
    layers: <><path d="m4 7 8-4 8 4-8 4-8-4Z" /><path d="m4 12 8 4 8-4M4 16l8 4 8-4" /></>,
    bars: <><path d="M5 19V9M12 19V4M19 19v-6" /><path d="M3 19h18" /></>,
    context: <><path d="M5 7h14M3 12h18M6 17h12" /><circle cx="12" cy="12" r="3" /></>,
    sequence: <><circle cx="5" cy="12" r="2.5" /><circle cx="12" cy="12" r="2.5" /><circle cx="19" cy="12" r="2.5" /><path d="M7.5 12h2M14.5 12h2" /></>,
    tags: <><path d="M4 6h7l9 9-5 5-9-9V4Z" /><circle cx="8" cy="8" r="1" /></>,
    nodes: <><circle cx="6" cy="7" r="3" /><circle cx="18" cy="6" r="2.5" /><circle cx="15" cy="18" r="3" /><path d="m9 7 6.5-.7M8 9.5l5 6" /></>,
    code: <><path d="m9 7-5 5 5 5M15 7l5 5-5 5M14 4l-4 16" /></>,
    spark: <><path d="m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4L12 3Z" /><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>{drawings[name] || drawings.spark}</svg>;
}

function FlowConnector() {
  return (
    <svg className={styles.flowConnector} viewBox="0 0 28 12" aria-hidden="true">
      <path d="M1 6h23M19 2l5 4-5 4" />
    </svg>
  );
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
              {t("home.heroTitleSecond") && <><br />{t("home.heroTitleSecond")}</>}
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

        <section className={`${styles.section} ${styles.onboardingSection}`} aria-labelledby="research-onboarding-title">
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>{t("home.onboarding.eyebrow")}</p>
            <h2 id="research-onboarding-title">{t("home.onboarding.title")}</h2>
            <p>{t("home.onboarding.intro")}</p>
          </div>

          <div className={styles.onboardingGrid}>
            {onboardingSteps.map((step, index) => (
              <article className={styles.onboardingCard} key={step.key}>
                <span className={styles.onboardingNumber}>{String(index + 1).padStart(2, "0")}</span>
                <h3>{t(`home.onboarding.steps.${step.key}.title`)}</h3>
                <p>{t(`home.onboarding.steps.${step.key}.description`)}</p>
                <p className={styles.onboardingExamples}>{t(`home.onboarding.steps.${step.key}.examples`)}</p>
                <Link href={step.href} className={styles.onboardingLink}>
                  {t(`home.onboarding.steps.${step.key}.action`)} <ArrowIcon />
                </Link>
              </article>
            ))}
          </div>

          <div className={styles.startingGuide}>
            <strong>{t("home.onboarding.guideTitle")}</strong>
            <ul>
              {["phenomenon", "task", "unsure", "after"].map((item) => (
                <li key={item}>{t(`home.onboarding.guide.${item}`)}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className={`${styles.section} ${styles.workflowSection}`} id="workflow">
          <div className={styles.workflowIntro}>
            <p className={styles.eyebrow}>{t("home.computationalJourney.eyebrow")}</p>
            <h2>{t("home.computationalJourney.title")}</h2>
            <p>{t("home.computationalJourney.intro")}</p>
          </div>

          <div className={styles.workflowTrack}>
            {workflow.map((step, index) => (
              <div className={styles.workflowStep} key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{t(`home.computationalJourney.steps.${step}`)}</strong>
                {index < workflow.length - 1 && <FlowConnector />}
              </div>
            ))}
          </div>

          <div className={styles.platformStats} aria-label={t("home.visuals.stats.label")}>
            <article>
              <VisualIcon name="layers" />
              <strong>{goals.length}</strong>
              <span>{t("home.visuals.stats.destinations")}</span>
            </article>
            <article>
              <VisualIcon name="sequence" />
              <strong>{workflow.length}</strong>
              <span>{t("home.visuals.stats.stages")}</span>
            </article>
            <article>
              <VisualIcon name="nodes" />
              <strong>{capabilities.length}</strong>
              <span>{t("home.visuals.stats.capabilities")}</span>
            </article>
          </div>

          <div className={styles.computationalAreas}>
            {computationalAreas.map((area) => (
              <article className={styles.computationalArea} key={area}>
                <h3>{t(`home.computationalJourney.areas.${area}.title`)}</h3>
                <p>{t(`home.computationalJourney.areas.${area}.items`)}</p>
              </article>
            ))}
          </div>

          <div className={styles.executionTypes}>
            <p>{t("home.computationalJourney.execution.intro")}</p>
            <div>
              {["deterministic", "ai", "researcher"].map((type) => (
                <span key={type}>{t(`home.computationalJourney.execution.${type}`)}</span>
              ))}
            </div>
          </div>

          <div className={styles.computationalMessage}>
            <p>{t("home.computationalJourney.message")}</p>
            <Link href="/ar-tools#build-tools" className={styles.computationalLink}>
              {t("home.computationalJourney.action")} <ArrowIcon />
            </Link>
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
                <div className={styles.capabilityIcon}><VisualIcon name={capabilityIcons[item]} /></div>
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
          <p>{t("home.footer")} · <Link href="/platform-inventory">{t("home.inventory")}</Link></p>
          <span>{t("home.edition")}</span>
        </footer>
      </main>
    </>
  );
}

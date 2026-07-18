import Head from "next/head";
import Link from "next/link";
import styles from "../styles/Home.module.css";

const goals = [
  {
    label: "Build",
    title: "Build research-ready code",
    description:
      "Generate practical code for Arabic NLP, data analysis, and research tasks with explanations and setup guidance.",
    href: "/tools/code",
    linkText: "Open AI Coding Assistant",
    icon: "01",
  },
  {
    label: "Analyze",
    title: "Explore Arabic research tools",
    description:
      "Access connected tools for frequency, concordance, n-grams, classification, and other Arabic text analysis tasks.",
    href: "/ar-tools",
    linkText: "Open Research Hub",
    icon: "02",
  },
  {
    label: "Learn",
    title: "Learn by doing",
    description:
      "Move from concepts to practical experiments through a guided learning dashboard designed for students.",
    href: "/student-dashboard",
    linkText: "Open Learning Dashboard",
    icon: "03",
  },
  {
    label: "Discover",
    title: "Plan your analysis",
    description:
      "Analyze Arabic text, interpret key results, and identify a clear next step for your research project.",
    href: "/tools/analyze",
    linkText: "Open AI Analysis Planner",
    icon: "04",
  },
];

const workflow = [
  "Upload",
  "Understand",
  "Choose a goal",
  "Analyze",
  "Interpret",
  "Report",
];

const capabilities = [
  { name: "Corpus Explorer", detail: "Inspect Arabic datasets and prepare them for analysis." },
  { name: "Frequency Analysis", detail: "Find repeated words and emerging language patterns." },
  { name: "Concordance", detail: "Study a word through the contexts in which it appears." },
  { name: "N-grams", detail: "Discover recurring phrases and multi-word expressions." },
  { name: "Arabic POS", detail: "Explore grammatical categories in Arabic text." },
  { name: "Semantic Lab", detail: "Build and understand text-classification experiments." },
  { name: "Code Assistant", detail: "Generate a practical starting point for analysis code." },
  { name: "AI Research Assistant", detail: "Ask better questions and decide what to do next." },
];

function ArrowIcon() {
  return <span aria-hidden="true">↗</span>;
}

export default function HomePage() {
  return (
    <>
      <Head>
        <title>LinguaLab — The AI workspace for Arabic language</title>
        <meta
          name="description"
          content="Build, analyze, learn, and discover with Arabic language in one AI workspace."
        />
        <link rel="icon" href="/favicon.svg" />
        <meta property="og:title" content="LinguaLab — The AI workspace for Arabic language" />
        <meta
          property="og:description"
          content="From Arabic datasets to guided analysis, insights, and research-ready reports."
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <main className={styles.page}>
        <nav className={styles.nav} aria-label="Primary navigation">
          <Link href="/" className={styles.brand}>
            <span className={styles.brandMark}>L</span>
            <span>LinguaLab</span>
          </Link>

          <div className={styles.navLinks}>
            <a href="#workspace">Workspace</a>
            <a href="#capabilities">Explore</a>
            <Link href="/student-dashboard">Learn</Link>
            <Link href="/projects">Projects</Link>
          </div>

          <Link href="/workspace" className={styles.navCta}>
            Start exploring <ArrowIcon />
          </Link>
        </nav>

        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Arabic language, reimagined with AI</p>
            <h1>
              Build. Analyze.
              <br />
              Learn. Discover.
            </h1>
            <p className={styles.heroLead}>
              One AI workspace for everything you do with Arabic language.
            </p>
            <p className={styles.heroText}>
              Upload Arabic data, explore language patterns, build intelligent
              workflows, and turn text into meaningful insights.
            </p>

            <div className={styles.heroActions}>
              <Link href="/workspace" className={styles.primaryButton}>
                Start your workspace <ArrowIcon />
              </Link>
              <a href="#workflow" className={styles.secondaryButton}>
                Explore the demo
              </a>
            </div>

            <div className={styles.proofRow} aria-label="LinguaLab strengths">
              <span>Arabic-native</span>
              <span>Research-driven</span>
              <span>Learning by doing</span>
            </div>
          </div>

          <div className={styles.productPreview} aria-label="Product preview">
            <div className={styles.previewTopbar}>
              <div className={styles.windowDots} aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <span>New workspace</span>
              <span className={styles.liveBadge}>AI active</span>
            </div>

            <div className={styles.previewBody}>
              <div className={styles.uploadCard}>
                <div>
                  <p className={styles.miniLabel}>Uploaded dataset</p>
                  <strong>arabic_reviews.xlsx</strong>
                </div>
                <span className={styles.fileBadge}>XLSX</span>
              </div>

              <div className={styles.analysisHeading}>
                <div className={styles.spark}>✦</div>
                <div>
                  <p className={styles.miniLabel}>Dataset understood</p>
                  <h2>Here&apos;s what LinguaLab found</h2>
                </div>
              </div>

              <div className={styles.findingsGrid}>
                <div className={styles.findingCard}>
                  <span>Language</span>
                  <strong>Arabic detected</strong>
                </div>
                <div className={styles.findingCard}>
                  <span>Records</span>
                  <strong>4,268 texts</strong>
                </div>
                <div className={styles.findingCard}>
                  <span>Missing values</span>
                  <strong>2%</strong>
                </div>
                <div className={styles.findingCard}>
                  <span>Labels</span>
                  <strong>Sentiment found</strong>
                </div>
              </div>

              <div className={styles.recommendation}>
                <div>
                  <p className={styles.miniLabel}>Recommended next step</p>
                  <strong>Build a sentiment analysis workflow</strong>
                  <p>
                    Your file is ready for a guided classification experiment.
                  </p>
                </div>
                <Link href="/workspace" className={styles.continueButton}>
                  Continue analysis <ArrowIcon />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section} id="workspace">
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>A workspace built around your goal</p>
            <h2>What would you like to accomplish?</h2>
            <p>
              Start with the outcome you need. LinguaLab connects the right
              language tools behind the scenes.
            </p>
          </div>

          <div className={styles.goalsGrid}>
            {goals.map((goal) => (
              <Link href={goal.href} className={styles.goalCard} key={goal.label}>
                <span className={styles.goalNumber}>{goal.icon}</span>
                <p className={styles.goalLabel}>{goal.label}</p>
                <h3>{goal.title}</h3>
                <p>{goal.description}</p>
                <span className={styles.cardLink}>
                  {goal.linkText} <ArrowIcon />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className={`${styles.section} ${styles.workflowSection}`} id="workflow">
          <div className={styles.workflowIntro}>
            <p className={styles.eyebrow}>One connected journey</p>
            <h2>From Arabic text to insight — in one workspace.</h2>
            <p>
              LinguaLab replaces scattered spreadsheets, notebooks, scripts,
              and chat windows with a guided path from data to decision.
            </p>
          </div>

          <div className={styles.workflowTrack}>
            {workflow.map((step, index) => (
              <div className={styles.workflowStep} key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{step}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section} id="capabilities">
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>Everything you need, connected</p>
            <h2>Powerful capabilities. One clear experience.</h2>
            <p>
              The tools remain available, but they now serve the user&apos;s goal
              instead of defining the product.
            </p>
          </div>

          <div className={styles.capabilitiesGrid}>
            {capabilities.map((item) => (
              <article className={styles.capabilityCard} key={item.name}>
                <div className={styles.capabilityIcon}>✦</div>
                <h3>{item.name}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={`${styles.section} ${styles.partnerSection}`}>
          <div className={styles.partnerCopy}>
            <p className={styles.eyebrow}>Meet your AI research partner</p>
            <h2>Not another chatbot. A partner that understands the task.</h2>
            <p>
              LinguaLab examines the data, highlights what matters, and helps
              the user choose a sound next step.
            </p>
            <Link href="/smart-home" className={styles.secondaryDarkButton}>
              Meet the assistant <ArrowIcon />
            </Link>
          </div>

          <div className={styles.chatCard}>
            <div className={styles.userMessage}>
              I want to classify Arabic customer reviews.
            </div>
            <div className={styles.aiMessage}>
              <div className={styles.aiAvatar}>L</div>
              <div>
                <strong>LinguaLab</strong>
                <p>
                  I found a text column and a sentiment label. Your classes are
                  slightly imbalanced, so I recommend reviewing the distribution
                  before training the model.
                </p>
                <button type="button">Build the workflow</button>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.finalCta}>
          <p className={styles.eyebrow}>Start with the language. End with insight.</p>
          <h2>
            Your Arabic data already contains a story.
            <br />
            LinguaLab helps you discover it.
          </h2>
          <Link href="/workspace" className={styles.primaryButton}>
            Start your workspace <ArrowIcon />
          </Link>
        </section>

        <footer className={styles.footer}>
          <Link href="/" className={styles.brand}>
            <span className={styles.brandMark}>L</span>
            <span>LinguaLab</span>
          </Link>
          <p>The AI workspace for Arabic language.</p>
          <span>Build Week edition</span>
        </footer>
      </main>
    </>
  );
}


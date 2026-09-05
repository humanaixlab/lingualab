import Link from "next/link";
import { RESEARCH_PATHS } from "../lib/research-paths";
import styles from "../styles/ResearchPaths.module.css";

const COPY = {
  en: {
    eyebrow: "COMPUTATIONAL LINGUISTICS",
    title: "Explore by Research Path",
    positioning: "LinguaLab is an AI-supported research workspace for computational linguistics.",
    support: "Deterministic tools perform the available analyses. AI supports guidance, study design, interpretation, reporting, and research assistance.",
    overview: "What is this path?",
    question: "Research question",
    data: "Data needed",
    available: "Available now",
    unavailable: "No dedicated tool is available in this path yet.",
    coming: "Coming next",
    output: "Expected output",
    report: "Report",
    beginner: "Beginner guide",
    advanced: "Advanced details",
  },
  ar: {
    eyebrow: "اللسانيات الحاسوبية",
    title: "استكشف حسب المسار البحثي",
    positioning: "LinguaLab مساحة بحث ذكية مدعومة بالذكاء الاصطناعي للباحثين في اللسانيات الحاسوبية.",
    support: "تنفذ الأدوات الحتمية التحليلات المتاحة، بينما يدعم الذكاء الاصطناعي الإرشاد وتصميم الدراسة والتفسير وإعداد التقارير والمساعدة البحثية.",
    overview: "ما هذا المسار؟",
    question: "السؤال البحثي",
    data: "البيانات المطلوبة",
    available: "الأدوات المتاحة الآن",
    unavailable: "لا تتوفر أداة متخصصة في هذا المسار حاليًا.",
    coming: "قدرات قادمة",
    output: "المخرجات المتوقعة",
    report: "التقرير المتوقع",
    beginner: "للمبتدئ",
    advanced: "تفاصيل متقدمة",
  },
};

export default function ResearchPaths({ language }) {
  const copy = COPY[language === "ar" ? "ar" : "en"];
  const locale = language === "ar" ? "ar" : "en";

  return (
    <section className={styles.section} aria-labelledby="research-paths-title">
      <header className={styles.header}>
        <p className={styles.eyebrow}>{copy.eyebrow}</p>
        <h2 id="research-paths-title">{copy.title}</h2>
        <p>{copy.positioning}</p>
        <p className={styles.support}>{copy.support}</p>
      </header>

      <div className={styles.grid}>
        {RESEARCH_PATHS.map((path) => (
          <article className={styles.card} id={path.id} key={path.id}>
            <h3>{path.name[locale]}</h3>
            <dl className={styles.details}>
              <div><dt>{copy.overview}</dt><dd>{path.overview[locale]}</dd></div>
              <div><dt>{copy.question}</dt><dd>{path.question[locale]}</dd></div>
              <div><dt>{copy.data}</dt><dd>{path.data[locale]}</dd></div>
            </dl>

            <div className={styles.toolBlock}>
              <h4>{copy.available}</h4>
              {path.available.length ? (
                <div className={styles.tools}>
                  {path.available.map((tool) => <Link href={tool.href} key={tool.href}>{tool[locale]} <span aria-hidden="true">↗</span></Link>)}
                </div>
              ) : <p className={styles.unavailable}>{copy.unavailable}</p>}
            </div>

            <div className={styles.coming}>
              <h4>{copy.coming}</h4>
              <ul>{path.coming[locale].map((item) => <li key={item}>{item}</li>)}</ul>
            </div>

            <dl className={styles.details}>
              <div><dt>{copy.output}</dt><dd>{path.output[locale]}</dd></div>
              <div><dt>{copy.report}</dt><dd>{path.report[locale]}</dd></div>
            </dl>

            <details className={styles.guide}>
              <summary>{copy.beginner}</summary>
              <p>{path.beginner[locale]}</p>
            </details>
            <details className={styles.guide}>
              <summary>{copy.advanced}</summary>
              <p>{path.advanced[locale]}</p>
            </details>
          </article>
        ))}
      </div>
    </section>
  );
}

import Head from "next/head";
import Link from "next/link";
import { useLanguage } from "../../components/LanguageProvider";
import { CORPUS_PATH_HUB_SECTION, researchPathHref } from "../../lib/research-path-context";
import styles from "../../styles/CorpusPath.module.css";

const TOOLS = [
  {
    href: "/tools/frequency",
    title: { en: "Frequency Analysis", ar: "تحليل التكرار (Frequency Analysis)" },
    description: { en: "Count recurring words and inspect the strongest lexical signals.", ar: "احسب الكلمات المتكررة وافحص أبرز المؤشرات المعجمية." },
  },
  {
    href: "/tools/concordance",
    title: { en: "Concordance / Contexts", ar: "السياقات (Concordance / Contexts)" },
    description: { en: "Examine a term in its observed contexts and compare usage patterns.", ar: "افحص المصطلح في سياقاته المرصودة وقارن أنماط استعماله." },
  },
  {
    href: "/tools/ngrams",
    title: { en: "N-grams", ar: "المتتاليات اللفظية (N-grams)" },
    description: { en: "Find recurring two- or three-word sequences in the text.", ar: "اكتشف المتتاليات المتكررة المكوّنة من كلمتين أو ثلاث كلمات." },
  },
];

const COMING = {
  en: ["Collocations", "Keyword Analysis", "Corpus Comparison"],
  ar: ["المصاحبات اللفظية (Collocations)", "تحليل الكلمات المفتاحية (Keyword Analysis)", "مقارنة المدونات (Corpus Comparison)"],
};

export default function CorpusLinguisticsPath() {
  const { language } = useLanguage();
  const locale = language === "ar" ? "ar" : "en";
  const copy = locale === "ar" ? {
    eyebrow: "المسار البحثي",
    title: "لسانيات المدونات (Corpus Linguistics)",
    description: "اختر الأداة المناسبة لما تريد تنفيذه الآن، ثم انتقل من الوصف إلى السياق والمتتاليات وفق سؤالك البحثي.",
    available: "الأدوات المتاحة الآن",
    coming: "قدرات قادمة",
    sequence: "ابدأ بتحليل التكرار لرؤية الأنماط العامة، واستخدم السياقات لفهم الاستعمال، ثم افحص المتتاليات اللفظية لاكتشاف العبارات المتكررة.",
    back: "العودة إلى المسارات البحثية",
  } : {
    eyebrow: "RESEARCH PATH",
    title: "Corpus Linguistics",
    description: "Choose the tool that matches what you need to do now, then move from description to context and sequences according to your research question.",
    available: "Available now",
    coming: "Coming next",
    sequence: "Start with frequency to see broad patterns, use contexts to understand usage, then inspect N-grams to discover recurring phrases.",
    back: "Back to Research Paths",
  };

  return (
    <>
      <Head><title>{copy.title} · LinguaLab</title></Head>
      <main className={styles.page}>
        <Link className={styles.back} href="/ar-tools#corpus-linguistics">← {copy.back}</Link>
        <header className={styles.header}>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p>{copy.description}</p>
        </header>

        <section aria-labelledby="available-corpus-tools">
          <h2 id="available-corpus-tools">{copy.available}</h2>
          <p className={styles.sequence}>{copy.sequence}</p>
          <div className={styles.grid}>
            {TOOLS.map((tool, index) => (
              <Link
                className={styles.tool}
                href={researchPathHref(tool.href, "corpus-linguistics", CORPUS_PATH_HUB_SECTION)}
                key={tool.href}
              >
                <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
                <h3>{tool.title[locale]}</h3>
                <p>{tool.description[locale]}</p>
                <span className={styles.open} aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.coming} aria-labelledby="coming-corpus-tools">
          <h2 id="coming-corpus-tools">{copy.coming}</h2>
          <ul>{COMING[locale].map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
      </main>
    </>
  );
}

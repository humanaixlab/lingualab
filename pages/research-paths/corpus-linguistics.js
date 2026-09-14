import Head from "next/head";
import Link from "next/link";
import { useLanguage } from "../../components/LanguageProvider";
import { CORPUS_PATH_HUB_SECTION, researchPathHref } from "../../lib/research-path-context";
import styles from "../../styles/CorpusPath.module.css";

const TOOLS = [
  {
    href: "/tools/corpus-research",
    title: { en: "Corpus Research · Research Preview", ar: "إنشاء وتحليل المدونة · تجريب بحثي" },
    description: { en: "Create and review a corpus, then explore its observed patterns in a researcher-led workflow.", ar: "أنشئ مدونة وراجعها، ثم استكشف أنماطها المرصودة ضمن مسار يقوده الباحث." },
  },
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

const WORKFLOW = [
  { key: "prepare", href: "/tools/corpus-research", type: "review" },
  { key: "inspect", href: "/tools/corpus-research", types: ["deterministic", "review"] },
  { key: "frequency", href: "/tools/frequency", type: "deterministic" },
  { key: "contexts", href: "/tools/concordance", type: "deterministic" },
  { key: "ngrams", href: "/tools/ngrams", type: "deterministic" },
  { key: "review", type: "review" },
  { key: "interpret", type: "ai", requiresResult: true },
  { key: "report", type: "review", requiresResult: true },
];

const PRACTICAL = {
  en: {
    title: "How do I run a corpus-linguistics study in LinguaLab?",
    lead: "Follow the corpus from preparation to evidence-led interpretation. Each stage shows who or what produces the result.",
    types: {
      deterministic: "Deterministic computation",
      ai: "AI-supported interpretation",
      review: "Researcher review",
    },
    stages: {
      prepare: ["Prepare the corpus", "Collect the texts relevant to the research question, organize them into a clear corpus, and add essential metadata when available."],
      inspect: ["Check corpus readiness", "Check missing data, duplicates, text quality, and whether the corpus is ready for analysis."],
      frequency: ["Frequency analysis", "Compute word counts directly from the submitted corpus."],
      contexts: ["Concordance / Contexts", "Retrieve the actual contexts in which a selected word or phrase occurs."],
      ngrams: ["N-grams", "Compute recurring two- or three-word sequences from the submitted corpus."],
      review: ["Review patterns", "Compare the measured patterns and record observations supported by the displayed evidence."],
      interpret: ["Interpret findings", "Use AI-supported interpretation based on actual results, then review it as the researcher."],
      report: ["Research report", "Organize the available analysis context into a structured report and verify the final account."],
    },
    open: "Open stage",
    fromResult: "Available from a completed result",
    exampleTitle: "Example: Studying frequent expressions in university messages",
    exampleSteps: [
      "Collect a documented set of texts.",
      "Create the corpus.",
      "Inspect missing information, duplicates, and metadata.",
      "Extract the most frequent words.",
      "Open the contexts of important words.",
      "Inspect N-grams.",
      "Record a linguistic observation supported by evidence.",
      "Continue to interpretation and reporting.",
    ],
    caution: "Frequency does not automatically mean importance. Interpret results in light of corpus size, data collection, context, and the research question.",
  },
  ar: {
    title: "كيف أطبق لسانيات المدونات داخل LinguaLab؟",
    lead: "اتبع مسار المدونة من التجهيز إلى التفسير المدعوم بالدليل، مع توضيح الجهة التي تنتج النتيجة في كل مرحلة.",
    types: {
      deterministic: "حساب حتمي",
      ai: "تفسير مدعوم بالذكاء الاصطناعي",
      review: "مراجعة الباحث",
    },
    stages: {
      prepare: ["إعداد المدونة", "اجمع النصوص التي تخدم سؤال البحث، ونظّمها في مدونة واضحة، وأضف البيانات الوصفية الأساسية عند توفرها."],
      inspect: ["فحص جاهزية المدونة", "تحقق من البيانات الناقصة، والتكرار، وجودة النصوص، ومدى جاهزية المدونة للتحليل."],
      frequency: ["تحليل التكرار", "احسب تكرارات الكلمات مباشرة من المدونة المقدمة."],
      contexts: ["تحليل السياقات", "استرجع السياقات الفعلية التي تظهر فيها الكلمة أو العبارة المحددة."],
      ngrams: ["المتتاليات اللفظية", "احسب المتتاليات الثنائية أو الثلاثية المتكررة من المدونة المقدمة."],
      review: ["مراجعة الأنماط", "قارن الأنماط المقاسة وسجّل ملاحظات تستند إلى الأدلة المعروضة."],
      interpret: ["تفسير النتائج", "استخدم تفسيرًا مدعومًا بالذكاء الاصطناعي قائمًا على النتائج الفعلية، ثم راجعه بوصفك الباحث."],
      report: ["التقرير البحثي", "نظّم سياق التحليل المتاح في تقرير منظم وتحقق من الصياغة النهائية."],
    },
    open: "فتح المرحلة",
    fromResult: "تتاح من النتيجة المكتملة",
    exampleTitle: "مثال: دراسة الألفاظ المتكررة في رسائل الجامعات",
    exampleSteps: [
      "اجمع مجموعة نصوص موثقة.",
      "أنشئ المدونة.",
      "افحص النواقص والتكرار والبيانات الوصفية.",
      "استخرج أكثر الكلمات تكرارًا.",
      "افتح السياقات للكلمات المهمة.",
      "افحص المتتاليات اللفظية (N-grams).",
      "سجّل ملاحظة لغوية مدعومة بالدليل.",
      "انتقل إلى التفسير والتقرير.",
    ],
    caution: "التكرار لا يعني الأهمية تلقائيًا. يجب تفسير النتائج في ضوء حجم المدونة، وطريقة جمع البيانات، والسياق، وسؤال البحث.",
  },
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
    sequence: "أنشئ مدونة جديدة عند الحاجة، أو ابدأ بتحليل التكرار لرؤية الأنماط العامة، ثم استخدم السياقات والمتتاليات اللفظية وفق سؤالك البحثي.",
    missingStage: "مرحلة من مسار المدونة",
    back: "العودة إلى المسارات البحثية",
  } : {
    eyebrow: "RESEARCH PATH",
    title: "Corpus Linguistics",
    description: "Choose the tool that matches what you need to do now, then move from description to context and sequences according to your research question.",
    available: "Available now",
    coming: "Coming next",
    sequence: "Create a corpus when needed, or start with frequency to see broad patterns, then use contexts and N-grams according to your research question.",
    missingStage: "Corpus workflow stage",
    back: "Back to Research Paths",
  };
  const practical = PRACTICAL[locale];

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

        <section className={styles.workflow} aria-labelledby="corpus-practical-workflow">
          <div className={styles.workflowHeading}>
            <p className={styles.eyebrow}>{locale === "ar" ? "مسار تطبيقي" : "PRACTICAL WORKFLOW"}</p>
            <h2 id="corpus-practical-workflow">{practical.title}</h2>
            <p>{practical.lead}</p>
          </div>
          <div className={styles.typeLegend} aria-label={locale === "ar" ? "أنواع التنفيذ" : "Execution types"}>
            {Object.entries(practical.types).map(([type, label]) => <span className={styles[type]} key={type}>{label}</span>)}
          </div>
          <ol className={styles.workflowSteps}>
            {WORKFLOW.map((stage, index) => {
              const [title, description] = practical.stages?.[stage.key] || [copy.missingStage, ""];
              const executionTypes = (stage.types || [stage.type]).filter((type) => practical.types?.[type]);
              const content = <>
                <span className={styles.stageNumber}>{String(index + 1).padStart(2, "0")}</span>
                {executionTypes.length > 0 && <span className={styles.typeBadges}>{executionTypes.map((type) => <span className={`${styles.executionType} ${styles[type] || ""}`} key={type}>{practical.types[type]}</span>)}</span>}
                <h3>{title}</h3>
                <p>{description}</p>
                {stage.href && <span className={styles.stageAction}>{practical.open} <span aria-hidden="true">→</span></span>}
                {stage.requiresResult && <span className={styles.stageAction}>{practical.fromResult}</span>}
              </>;
              const stageHref = stage.href ? researchPathHref(stage.href, "corpus-linguistics", CORPUS_PATH_HUB_SECTION) : null;
              return <li key={stage.key}>{stageHref ? <Link href={stageHref}>{content}</Link> : <div>{content}</div>}</li>;
            })}
          </ol>
          <div className={styles.practicalSupport}>
            <article className={styles.example}>
              <h3>{practical.exampleTitle}</h3>
              <ol>{practical.exampleSteps.map((step) => <li key={step}>{step}</li>)}</ol>
            </article>
            <aside className={styles.caution}>
              <strong>{locale === "ar" ? "تنبيه منهجي" : "Methodological caution"}</strong>
              <p>{practical.caution}</p>
            </aside>
          </div>
        </section>

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

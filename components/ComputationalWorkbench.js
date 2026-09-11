import styles from "../styles/ComputationalWorkbench.module.css";

const COPY = {
  en: {
    eyebrow: "COMPUTATIONAL WORKBENCH",
    title: "How this research workflow processes your data",
    method: "Method",
    deterministic: "Deterministic computation",
    ai: "AI-supported inference",
    preparation: "Local data preparation",
    implementation: "AI-supported implementation",
    environment: "External computational environment",
    distinction: {
      deterministic: "Measured outputs are calculated by the stated method. AI interpretation, when offered, remains separate.",
      ai: "The model produces structured suggestions for researcher review; it does not create measured results or human reference labels.",
      preparation: "Inspection and preparation happen locally. This stage does not perform or invent downstream analysis.",
      implementation: "AI proposes code from the stated configuration. The researcher must review it before any execution.",
      environment: "LinguaLab transfers reviewed content only after an explicit action. Execution happens in the external notebook.",
    },
  },
  ar: {
    eyebrow: "منضدة العمل الحاسوبية",
    title: "كيف يعالج مسار البحث بياناتك؟",
    method: "الطريقة",
    deterministic: "حوسبة حتمية",
    ai: "استدلال مدعوم بالذكاء الاصطناعي",
    preparation: "تجهيز محلي للبيانات",
    implementation: "تنفيذ برمجي مدعوم بالذكاء الاصطناعي",
    environment: "بيئة حاسوبية خارجية",
    distinction: {
      deterministic: "تُحسب المخرجات المقاسة بالطريقة المعلنة، ويبقى تفسير الذكاء الاصطناعي—عند توفره—طبقة منفصلة.",
      ai: "ينتج النموذج مقترحات منظمة لمراجعة الباحث، ولا ينشئ نتائج مقاسة أو تصنيفات مرجعية بشرية.",
      preparation: "يتم الفحص والتجهيز محليًا، ولا تنفذ هذه المرحلة تحليلًا لاحقًا أو تخترع نتائجه.",
      implementation: "يقترح الذكاء الاصطناعي شفرة وفق الإعداد المحدد، وعلى الباحث مراجعتها قبل أي تشغيل.",
      environment: "لا تنقل LinguaLab المحتوى المراجع إلا بإجراء صريح، ويحدث التنفيذ داخل دفتر العمل الخارجي.",
    },
  },
};

export default function ComputationalWorkbench({ language, stages, methodType, methodName }) {
  const locale = language === "ar" ? "ar" : "en";
  const copy = COPY[locale];

  return (
    <section className={styles.workbench} aria-label={copy.title}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h2>{copy.title}</h2>
        </div>
        <div className={`${styles.methodBadge} ${styles[methodType]}`}>
          <span>{copy.method}</span>
          <strong>{methodName || copy[methodType]}</strong>
        </div>
      </header>
      <ol className={styles.pipeline}>
        {stages.map((stage, index) => (
          <li key={stage.label}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{stage.label}</strong>
            {stage.detail && <small>{stage.detail}</small>}
          </li>
        ))}
      </ol>
      <p className={styles.distinction}>{copy.distinction[methodType]}</p>
    </section>
  );
}

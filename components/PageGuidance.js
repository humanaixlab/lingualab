import styles from "../styles/PageGuidance.module.css";

const DEFAULT_TITLES = {
  ar: "كيف تستخدم هذه الصفحة؟",
  en: "How to use this page",
};

export default function PageGuidance({ language = "en", title, steps }) {
  const locale = language === "ar" ? "ar" : "en";
  const safeSteps = Array.isArray(steps)
    ? steps.filter((step) => typeof step === "string" && step.trim()).slice(0, 4)
    : [];

  if (safeSteps.length === 0) return null;

  return (
    <aside className={styles.guidance} aria-label={title || DEFAULT_TITLES[locale]} dir={locale === "ar" ? "rtl" : "ltr"}>
      <h2>{title || DEFAULT_TITLES[locale]}</h2>
      <ol>
        {safeSteps.map((step, index) => (
          <li key={`${index}-${step}`}><span>{index + 1}</span><p>{step}</p></li>
        ))}
      </ol>
    </aside>
  );
}

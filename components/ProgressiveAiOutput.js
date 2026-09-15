import styles from "../styles/ProgressiveAiOutput.module.css";

export default function ProgressiveAiOutput({ text, language = "en", active = false, label }) {
  if (!active && !text) return null;
  const direction = language === "ar" ? "rtl" : "ltr";
  return <div className={styles.output} dir={direction} lang={language} aria-live="polite" aria-busy={active}>
    {active && <div className={styles.indicator} role="status"><span aria-hidden="true" />{label}</div>}
    {text && <div className={styles.text}>{text}</div>}
  </div>;
}

import styles from "../../styles/ResearchVisuals.module.css";

function validMetric(metric) {
  return metric && typeof metric.label === "string" && metric.label.trim() &&
    typeof metric.value === "number" && Number.isFinite(metric.value);
}

export default function SummaryCards({ metrics = [], language = "en", title }) {
  const available = metrics.filter(validMetric);
  if (!available.length) return null;

  const heading = title || (language === "ar" ? "المؤشرات المقاسة" : "Measured metrics");
  return (
    <section className={styles.block} aria-labelledby="research-summary-cards-title">
      <h2 id="research-summary-cards-title" className={styles.sectionTitle}>{heading}</h2>
      <div className={styles.summaryGrid}>
        {available.map((metric, index) => (
          <article className={styles.summaryCard} key={metric.id || `${metric.label}-${index}`}>
            <span>{metric.label}</span>
            <strong>{metric.value.toLocaleString(language, metric.formatOptions)}</strong>
            {metric.caption && <small>{metric.caption}</small>}
          </article>
        ))}
      </div>
    </section>
  );
}

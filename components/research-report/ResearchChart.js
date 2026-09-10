import styles from "../../styles/ResearchVisuals.module.css";

const COLORS = ["#6554f6", "#3399b8", "#3ca37a", "#d68b39", "#c65b82", "#64748b"];

function validEntries(data) {
  return (Array.isArray(data) ? data : []).filter((entry) => (
    entry && typeof entry.label === "string" && entry.label.trim() &&
    ((typeof entry.value === "number" && Number.isFinite(entry.value)) ||
      (typeof entry.secondaryValue === "number" && Number.isFinite(entry.secondaryValue)))
  ));
}

function BarChart({ entries, language, horizontal, secondaryLabel, primaryLabel }) {
  const maximum = Math.max(0, ...entries.flatMap((entry) => [entry.value || 0, entry.secondaryValue || 0]));
  return (
    <div className={`${styles.barChart} ${horizontal ? styles.horizontalChart : ""}`}>
      {entries.map((entry, index) => (
        <div className={styles.barRow} key={entry.id || `${entry.label}-${index}`}>
          <span className={styles.dataLabel} dir="auto">{entry.label}</span>
          <div className={styles.barTracks}>
            {typeof entry.value === "number" && <div className={styles.barTrack}><i style={{ width: `${maximum ? Math.max(2, entry.value / maximum * 100) : 0}%`, background: COLORS[index % COLORS.length] }} /><span>{entry.value.toLocaleString(language)}</span><em>{primaryLabel}</em></div>}
            {typeof entry.secondaryValue === "number" && <div className={styles.barTrack}><i style={{ width: `${maximum ? Math.max(2, entry.secondaryValue / maximum * 100) : 0}%`, background: "#9b8ff8" }} /><span>{entry.secondaryValue.toLocaleString(language)}</span><em>{secondaryLabel}</em></div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ entries, language }) {
  const positive = entries.map((entry) => ({ ...entry, value: Math.max(0, entry.value || 0) })).filter((entry) => entry.value > 0);
  const total = positive.reduce((sum, entry) => sum + entry.value, 0);
  if (!total) return null;
  const gradient = positive.map((entry, index) => {
    const start = positive.slice(0, index).reduce((sum, item) => sum + item.value, 0) / total * 100;
    const end = start + entry.value / total * 100;
    return `${COLORS[index % COLORS.length]} ${start}% ${end}%`;
  }).join(", ");
  return (
    <div className={styles.donutLayout}>
      <div className={styles.donut} style={{ background: `conic-gradient(${gradient})` }} aria-hidden="true"><span>{total.toLocaleString(language)}</span></div>
      <ul>{positive.map((entry, index) => <li key={entry.id || `${entry.label}-${index}`}><i style={{ background: COLORS[index % COLORS.length] }} /><span dir="auto">{entry.label}</span><strong>{entry.value.toLocaleString(language)}</strong></li>)}</ul>
    </div>
  );
}

export default function ResearchChart({ type = "bar", data = [], title, caption, language = "en", primaryLabel = "", secondaryLabel = "" }) {
  const entries = validEntries(data);
  if (!entries.length) return null;
  const donut = type === "donut" || type === "pie";
  const comparison = type === "comparison" || type === "reference-prediction";

  return (
    <figure className={`${styles.visualCard} ${styles.chart}`}>
      {title && <h2 className={styles.sectionTitle}>{title}</h2>}
      {donut ? <DonutChart entries={entries} language={language} /> : <BarChart entries={entries} language={language} horizontal={type === "horizontal-bar"} primaryLabel={primaryLabel} secondaryLabel={comparison ? secondaryLabel : ""} />}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

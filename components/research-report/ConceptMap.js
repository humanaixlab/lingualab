import styles from "../../styles/ResearchVisuals.module.css";

export default function ConceptMap({ nodes = [], connections = [], title, language = "en" }) {
  const available = nodes.filter((node) => node && node.id && typeof node.label === "string" && node.label.trim());
  if (!available.length) return null;
  const ids = new Set(available.map((node) => node.id));
  const links = connections.filter((link) => link && ids.has(link.from) && ids.has(link.to));

  return (
    <section className={`${styles.visualCard} ${styles.conceptMap}`} aria-labelledby="concept-map-title">
      <div className={styles.visualHeading}>
        <span className={styles.aiBadge}>{language === "ar" ? "تفسير مدعوم بالذكاء الاصطناعي" : "AI-supported interpretation"}</span>
        <h2 id="concept-map-title" className={styles.sectionTitle}>{title || (language === "ar" ? "خريطة المفاهيم" : "Concept map")}</h2>
        <p>{language === "ar" ? "تمثل هذه الخريطة تفسيرًا مقترحًا، وليست دليلًا مقاسًا." : "This map represents a suggested interpretation, not measured evidence."}</p>
      </div>
      <div className={styles.conceptNodes}>{available.map((node) => <article key={node.id}><strong dir="auto">{node.label}</strong>{node.detail && <p dir="auto">{node.detail}</p>}</article>)}</div>
      {links.length > 0 && <ul className={styles.conceptLinks}>{links.map((link, index) => {
        const from = available.find((node) => node.id === link.from);
        const to = available.find((node) => node.id === link.to);
        return <li key={link.id || `${link.from}-${link.to}-${index}`}><span dir="auto">{from.label}</span><b>—</b><em dir="auto">{link.label || (language === "ar" ? "مرتبط بـ" : "related to")}</em><b>—</b><span dir="auto">{to.label}</span></li>;
      })}</ul>}
    </section>
  );
}

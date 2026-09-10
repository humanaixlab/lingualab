import styles from "../../styles/ResearchVisuals.module.css";

export default function StructuralDiagram({ nodes = [], relations = [], title, caption, language = "en" }) {
  const validNodes = nodes.filter((node) => node && node.id && typeof node.label === "string" && node.label.trim());
  const nodeIds = new Set(validNodes.map((node) => node.id));
  const validRelations = relations.filter((relation) => relation && nodeIds.has(relation.from) && nodeIds.has(relation.to));
  if (!validNodes.length || !validRelations.length) return null;

  return (
    <figure className={`${styles.visualCard} ${styles.diagram}`}>
      <div className={styles.visualHeading}>
        <span>{language === "ar" ? "بنية مستخرجة من النتائج" : "Structure from supplied results"}</span>
        {title && <h2 className={styles.sectionTitle}>{title}</h2>}
      </div>
      <div className={styles.nodeGrid}>
        {validNodes.map((node) => <div className={styles.node} key={node.id}><strong dir="auto">{node.label}</strong>{node.detail && <small dir="auto">{node.detail}</small>}</div>)}
      </div>
      <ul className={styles.relationList}>
        {validRelations.map((relation, index) => {
          const from = validNodes.find((node) => node.id === relation.from);
          const to = validNodes.find((node) => node.id === relation.to);
          return <li key={relation.id || `${relation.from}-${relation.to}-${index}`}><span dir="auto">{from.label}</span><b aria-hidden="true">→</b><em dir="auto">{relation.label || (language === "ar" ? "يرتبط بـ" : "relates to")}</em><b aria-hidden="true">→</b><span dir="auto">{to.label}</span></li>;
        })}
      </ul>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

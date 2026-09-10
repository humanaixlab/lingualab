import styles from "../../styles/ResearchVisuals.module.css";

export default function ResearchResultLayers({ measured, interpretation, researcherApproved, language = "en" }) {
  if (!measured && !interpretation && !researcherApproved) return null;
  const copy = language === "ar" ? {
    measured: "نتائج مقاسة / محسوبة",
    interpretation: "تفسير مدعوم بالذكاء الاصطناعي",
    approved: "ملاحظات معتمدة من الباحث / قرارات نهائية",
  } : {
    measured: "Measured / Computed Results",
    interpretation: "AI-supported Interpretation",
    approved: "Researcher-approved Notes / Final Decisions",
  };
  return (
    <section className={styles.layers}>
      {measured && <article className={`${styles.layer} ${styles.measuredLayer}`}><h2>{copy.measured}</h2><div>{measured}</div></article>}
      {interpretation && <article className={`${styles.layer} ${styles.aiLayer}`}><h2>{copy.interpretation}</h2><div>{interpretation}</div></article>}
      {researcherApproved && <article className={`${styles.layer} ${styles.researcherLayer}`}><h2>{copy.approved}</h2><div>{researcherApproved}</div></article>}
    </section>
  );
}

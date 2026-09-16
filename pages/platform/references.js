import { useMemo, useState } from "react";
import PlatformShell from "../../components/PlatformShell";
import { useLanguage } from "../../components/LanguageProvider";
import { SCIENTIFIC_FOUNDATIONS } from "../../lib/scientific-references";
import styles from "../../styles/Platform.module.css";

const allReferences = Object.entries(SCIENTIFIC_FOUNDATIONS).flatMap(([pathId, path]) => path.platformReferences.map((reference) => ({ ...reference, pathId, pathTitle: path.title })));

export default function ReferencesPage() {
  const { language } = useLanguage();
  const [query, setQuery] = useState("");
  const [pathId, setPathId] = useState("all");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("path");

  const referenceTypes = useMemo(() => [...new Set(allReferences.map((reference) => reference.referenceType[language]))].sort((a, b) => a.localeCompare(b, language)), [language]);
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase(language === "ar" ? "ar" : "en");
    const matches = allReferences.filter((reference) => {
      const searchable = [reference.author[language], reference.title[language], reference.publisher?.[language], reference.referenceType[language], reference.pathTitle[language]].filter(Boolean).join(" ").toLocaleLowerCase(language === "ar" ? "ar" : "en");
      return (!term || searchable.includes(term)) && (pathId === "all" || reference.pathId === pathId) && (type === "all" || reference.referenceType[language] === type);
    });
    return [...matches].sort((a, b) => {
      if (sort === "year-desc") return Number(b.year) - Number(a.year);
      if (sort === "title") return a.title[language].localeCompare(b.title[language], language);
      return a.pathTitle[language].localeCompare(b.pathTitle[language], language) || a.title[language].localeCompare(b.title[language], language);
    });
  }, [language, pathId, query, sort, type]);

  return (
    <PlatformShell
      eyebrow={{ en: "SCIENTIFIC REFERENCES", ar: "المراجع العلمية" }}
      title={{ en: "References", ar: "المراجع" }}
      description={{ en: "Search, filter, and review the approved references already associated with LinguaLab research paths.", ar: "ابحث في المراجع المعتمدة والمرتبطة بالفعل بمسارات LinguaLab البحثية، وصفِّها وراجعها." }}
    >
      <section className={styles.section}>
        <div className={styles.controls}>
          <input className={styles.control} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={language === "ar" ? "ابحث بالمؤلف أو العنوان أو الناشر" : "Search author, title, or publisher"} aria-label={language === "ar" ? "البحث في المراجع" : "Search references"} />
          <select className={styles.control} value={pathId} onChange={(event) => setPathId(event.target.value)} aria-label={language === "ar" ? "تصفية حسب المسار" : "Filter by path"}>
            <option value="all">{language === "ar" ? "كل المسارات" : "All paths"}</option>
            {Object.entries(SCIENTIFIC_FOUNDATIONS).map(([id, path]) => <option value={id} key={id}>{path.title[language]}</option>)}
          </select>
          <select className={styles.control} value={type} onChange={(event) => setType(event.target.value)} aria-label={language === "ar" ? "تصفية حسب النوع" : "Filter by type"}>
            <option value="all">{language === "ar" ? "كل الأنواع" : "All types"}</option>
            {referenceTypes.map((referenceType) => <option value={referenceType} key={referenceType}>{referenceType}</option>)}
          </select>
          <select className={styles.control} value={sort} onChange={(event) => setSort(event.target.value)} aria-label={language === "ar" ? "ترتيب المراجع" : "Sort references"}>
            <option value="path">{language === "ar" ? "حسب المسار" : "By research path"}</option>
            <option value="year-desc">{language === "ar" ? "الأحدث أولًا" : "Newest first"}</option>
            <option value="title">{language === "ar" ? "حسب العنوان" : "By title"}</option>
          </select>
        </div>
        <p className={styles.resultCount}>{language === "ar" ? `${filtered.length} مرجعًا` : `${filtered.length} references`}</p>
        {filtered.length ? (
          <div className={styles.referenceGrid}>
            {filtered.map((reference) => (
              <article className={styles.referenceCard} key={`${reference.pathId}-${reference.id}`}>
                <div className={styles.referenceMeta}>
                  <span>{reference.pathTitle[language]}</span>
                  <span>{reference.referenceType[language]}</span>
                  <span>{reference.year}</span>
                </div>
                <h2>{reference.title[language]}</h2>
                <p><strong>{language === "ar" ? "المؤلف:" : "Author:"}</strong> {reference.author[language]}</p>
                {reference.translator && <p><strong>{language === "ar" ? "المترجم:" : "Translator:"}</strong> {reference.translator[language]}</p>}
                {reference.publisher && <p><strong>{language === "ar" ? "الناشر:" : "Publisher:"}</strong> {reference.publisher[language]}</p>}
                {reference.edition && <p><strong>{language === "ar" ? "الطبعة:" : "Edition:"}</strong> {reference.edition[language]}</p>}
                {reference.isbn && <p><strong>ISBN:</strong> {reference.isbn}</p>}
                <p>{reference.note[language]}</p>
                {reference.doiOrUrl && <a className={styles.referenceSource} href={reference.doiOrUrl} target="_blank" rel="noopener noreferrer">{language === "ar" ? "فتح المصدر الرسمي" : "Open official source"}</a>}
              </article>
            ))}
          </div>
        ) : <div className={styles.emptyState}>{language === "ar" ? "لا توجد مراجع مطابقة لهذه المرشحات." : "No references match these filters."}</div>}
      </section>
    </PlatformShell>
  );
}

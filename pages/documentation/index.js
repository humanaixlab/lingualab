import { useMemo, useState } from "react";
import Link from "next/link";
import PlatformShell from "../../components/PlatformShell";
import { useLanguage } from "../../components/LanguageProvider";
import { TOOL_DOCUMENTATION } from "../../lib/platform-content";
import styles from "../../styles/Platform.module.css";

export default function DocumentationPage() {
  const { language } = useLanguage();
  const [query, setQuery] = useState("");
  const tools = useMemo(() => {
    const term = query.trim().toLocaleLowerCase(language === "ar" ? "ar" : "en");
    if (!term) return TOOL_DOCUMENTATION;
    return TOOL_DOCUMENTATION.filter((tool) => `${tool.name[language]} ${tool.purpose[language]}`.toLocaleLowerCase(language === "ar" ? "ar" : "en").includes(term));
  }, [language, query]);

  return (
    <PlatformShell
      eyebrow={{ en: "DOCUMENTATION", ar: "التوثيق" }}
      title={{ en: "Tool documentation", ar: "توثيق الأدوات" }}
      description={{ en: "Find every LinguaLab tool in one directory and review its purpose, inputs, outputs, responsibilities, and limits.", ar: "ابحث عن كل أداة في LinguaLab ضمن دليل واحد، وراجع غرضها ومدخلاتها ومخرجاتها والمسؤوليات والحدود المرتبطة بها." }}
    >
      <section className={styles.section}>
        <div className={styles.controls}>
          <input
            className={styles.control}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={language === "ar" ? "ابحث في توثيق الأدوات" : "Search tool documentation"}
            aria-label={language === "ar" ? "البحث في التوثيق" : "Search documentation"}
          />
        </div>
        <p className={styles.resultCount}>{language === "ar" ? `${tools.length} أداة` : `${tools.length} tools`}</p>
        {tools.length ? (
          <div className={styles.documentationGrid}>
            {tools.map((tool) => (
              <Link className={styles.documentationCard} href={tool.documentationRoute} key={tool.id}>
                <span className={styles.tag}>{language === "ar" ? "توثيق الأداة" : "Tool documentation"}</span>
                <h2>{tool.name[language]}</h2>
                <p>{tool.purpose[language]}</p>
                <span className={styles.cardAction}>{language === "ar" ? "اقرأ التوثيق ←" : "Read documentation →"}</span>
              </Link>
            ))}
          </div>
        ) : <div className={styles.emptyState}>{language === "ar" ? "لا توجد نتائج مطابقة." : "No matching documentation found."}</div>}
      </section>
    </PlatformShell>
  );
}

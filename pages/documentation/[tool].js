import Link from "next/link";
import PlatformShell from "../../components/PlatformShell";
import { useLanguage } from "../../components/LanguageProvider";
import { TOOL_DOCUMENTATION, documentationForId } from "../../lib/platform-content";
import styles from "../../styles/Platform.module.css";

const sections = [
  ["purpose", "Purpose", "الغرض"],
  ["input", "Inputs", "المدخلات"],
  ["output", "Outputs", "المخرجات"],
  ["workflow", "Workflow", "خطوات العمل"],
  ["commonErrors", "Common errors", "الأخطاء الشائعة"],
  ["responsibility", "Researcher responsibility", "مسؤولية الباحث"],
  ["limitations", "Limitations", "الحدود"],
  ["references", "References", "المراجع"],
];

export default function ToolDocumentationPage({ toolId }) {
  const { language } = useLanguage();
  const tool = documentationForId(toolId);
  if (!tool) return null;
  return (
    <PlatformShell
      eyebrow={{ en: "TOOL DOCUMENTATION", ar: "توثيق الأداة" }}
      title={tool.name}
      description={tool.purpose}
    >
      <div className={styles.documentationSections}>
        {sections.map(([key, en, ar]) => (
          <section className={styles.documentationSection} key={key}>
            <h2>{language === "ar" ? ar : en}</h2>
            <p>{tool[key][language]}</p>
          </section>
        ))}
      </div>
      <h2 className={styles.relatedTitle}>{language === "ar" ? "الصفحات المرتبطة" : "Related pages"}</h2>
      <div className={styles.backRow}>
        <Link href={tool.route}>{language === "ar" ? "افتح الأداة" : "Open tool"}</Link>
        <Link href="/platform/references">{language === "ar" ? "المراجع العلمية" : "Scientific references"}</Link>
        <Link href="/documentation">{language === "ar" ? "كل التوثيق" : "All documentation"}</Link>
      </div>
    </PlatformShell>
  );
}

export function getStaticPaths() {
  return { paths: TOOL_DOCUMENTATION.map((tool) => ({ params: { tool: tool.id } })), fallback: false };
}

export function getStaticProps({ params }) {
  return { props: { toolId: params.tool } };
}

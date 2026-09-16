import Head from "next/head";
import Link from "next/link";
import { useLanguage } from "../../components/LanguageProvider";
import { ACTIVE_TOOLS, FUTURE_PLAN_ARCHITECTURE, INCLUDED_DATASETS, PROJECT_OUTPUT_TYPES, RESEARCH_AREAS, USER_ACTIVITY_ARCHITECTURE, getPlatformInventorySummary } from "../../lib/platform-inventory";
import styles from "../../styles/PlatformInventory.module.css";

const COPY = {
  en: {
    title: "Platform inventory", eyebrow: "TRANSPARENT PLATFORM INVENTORY", lead: "A code-backed inventory of what LinguaLab currently includes—and what it does not measure or sell.", home: "Back to home",
    tools: "Active tool destinations", areas: "Research paths and workflows", projects: "Project catalog", datasets: "Built-in and demo datasets", activity: "User and activity statistics", plans: "Future plan architecture",
    toolCount: "active tools", areaCount: "research areas", projectCount: "project suggestions", datasetCount: "included dataset", types: "project-output types", files: "included files", linguistic: "Linguistic path", computational: "Computational workflow",
    projectText: "The catalog contains {projects} structured project suggestions across {types} possible output types.", source: "Source status", license: "License status", records: "records", fileList: "Included files",
    disabled: "Disabled", noActivity: "No live analytics", activityText: "The data model reserves metric names for a future consent-aware analytics layer. All values remain null and collection is disabled.",
    noPricing: "No active pricing or payments", plansText: "These are disabled structural placeholders only. Prices are unset, checkout does not exist, and no commercial plan is active.", priceUnset: "Price not set",
    scope: "Counting rule", scopeText: "Tools count active /tools destinations. Research areas count four linguistic paths and three computational workflows. One dataset stored in multiple formats is counted once.",
  },
  ar: {
    title: "جرد المنصة", eyebrow: "جرد شفاف لمنصة LinguaLab", lead: "جرد مستند إلى التكوين البرمجي يوضح ما تتضمنه LinguaLab حاليًا، وما لا تقيسه أو تبيعه.", home: "العودة إلى الصفحة الرئيسية",
    tools: "وجهات الأدوات النشطة", areas: "المسارات البحثية ومسارات العمل", projects: "دليل المشاريع", datasets: "مجموعات البيانات المضمنة وبيانات العرض", activity: "إحصاءات المستخدمين والنشاط", plans: "بنية الخطط المستقبلية",
    toolCount: "أداة نشطة", areaCount: "مجالات بحثية", projectCount: "فكرة مشروع", datasetCount: "مجموعة بيانات مضمنة", types: "أنواع مخرجات المشاريع", files: "ملفات مضمنة", linguistic: "مسار لغوي", computational: "مسار عمل حاسوبي",
    projectText: "يتضمن الدليل {projects} فكرة مشروع منظمة ضمن {types} أنواع محتملة للمخرجات.", source: "حالة المصدر", license: "حالة الترخيص", records: "سجلًا", fileList: "الملفات المضمنة",
    disabled: "معطّل", noActivity: "لا توجد تحليلات استخدام حية", activityText: "يحجز نموذج البيانات أسماء مؤشرات لبنية تحليل مستقبلية تراعي الموافقة. تبقى جميع القيم فارغة ويظل الجمع معطلًا.",
    noPricing: "لا توجد أسعار أو مدفوعات مفعلة", plansText: "هذه قوالب بنيوية مستقبلية معطلة فقط. لم تحدد أسعار، ولا توجد صفحة دفع، ولا توجد خطة تجارية نشطة.", priceUnset: "السعر غير محدد",
    scope: "قاعدة العد", scopeText: "يحسب عدد الأدوات وجهات /tools النشطة. وتشمل المجالات أربعة مسارات لغوية وثلاثة مسارات عمل حاسوبية. وتُحسب مجموعة البيانات المحفوظة بصيغ متعددة مرة واحدة.",
  },
};

export default function PlatformInventoryPage() {
  const { language } = useLanguage();
  const locale = language === "ar" ? "ar" : "en";
  const copy = COPY[locale];
  const summary = getPlatformInventorySummary();
  const interpolate = (text, values) => Object.entries(values).reduce((result, [key, value]) => result.replace(`{${key}}`, value), text);
  return <main className={styles.page} dir={locale === "ar" ? "rtl" : "ltr"}>
    <Head><title>{copy.title} — LinguaLab</title><meta name="description" content={copy.lead} /></Head>
    <header className={styles.hero}><Link href="/" className={styles.back}>{copy.home}</Link><p>{copy.eyebrow}</p><h1>{copy.title}</h1><div className={styles.lead}>{copy.lead}</div><aside><strong>{copy.scope}</strong><span>{copy.scopeText}</span></aside></header>
    <section className={styles.stats} aria-label={copy.title}><Stat value={summary.activeTools} label={copy.toolCount} /><Stat value={summary.researchAreas} label={copy.areaCount} /><Stat value={summary.projectRecords} label={copy.projectCount} /><Stat value={summary.includedDatasets} label={copy.datasetCount} /></section>
    <InventorySection title={copy.tools}><div className={styles.toolGrid}>{ACTIVE_TOOLS.map((tool) => <article key={tool.id}><strong>{tool.name[locale]}</strong><code>{tool.route}</code></article>)}</div></InventorySection>
    <InventorySection title={copy.areas}><div className={styles.areaGrid}>{RESEARCH_AREAS.map((area) => <article key={area.id}><span>{area.kind === "linguistic" ? copy.linguistic : copy.computational}</span><strong>{area.name[locale]}</strong></article>)}</div></InventorySection>
    <InventorySection title={copy.projects}><p>{interpolate(copy.projectText, { projects: summary.projectRecords, types: summary.projectTypes })}</p><div className={styles.badges}>{PROJECT_OUTPUT_TYPES.map((type) => <span key={type.id}>{type.name[locale]}</span>)}</div></InventorySection>
    <InventorySection title={copy.datasets}>{INCLUDED_DATASETS.map((dataset) => <article className={styles.dataset} key={dataset.id}><div><h3>{dataset.name[locale]}</h3><span>{dataset.records} {copy.records} · {dataset.files.length} {copy.files}</span></div><dl><div><dt>{copy.source}</dt><dd>{dataset.source[locale]}</dd></div><div><dt>{copy.license}</dt><dd>{dataset.license[locale]}</dd></div><div><dt>{copy.fileList}</dt><dd>{dataset.files.map((file) => <code key={file}>{file}</code>)}</dd></div></dl></article>)}</InventorySection>
    <div className={styles.futureGrid}>
      <InventorySection title={copy.activity} compact><StatusBadge copy={copy} /><h3>{copy.noActivity}</h3><p>{copy.activityText}</p><p>{USER_ACTIVITY_ARCHITECTURE.rules[locale]}</p></InventorySection>
      <InventorySection title={copy.plans} compact><StatusBadge copy={copy} /><h3>{copy.noPricing}</h3><p>{copy.plansText}</p><div className={styles.planList}>{FUTURE_PLAN_ARCHITECTURE.plans.map((plan) => <span key={plan.id}><strong>{plan.name[locale]}</strong><small>{copy.priceUnset}</small></span>)}</div></InventorySection>
    </div>
    <footer className={styles.footer}><Link href="/platform">{locale === "ar" ? "العودة إلى مركز المنصة" : "Back to Platform"}</Link></footer>
  </main>;
}

function Stat({ value, label }) { return <article><strong>{value}</strong><span>{label}</span></article>; }
function InventorySection({ title, children, compact = false }) { return <section className={`${styles.section} ${compact ? styles.compact : ""}`}><h2>{title}</h2>{children}</section>; }
function StatusBadge({ copy }) { return <span className={styles.disabled}>{copy.disabled}</span>; }

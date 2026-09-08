import Head from "next/head";
import Link from "next/link";
import { useLanguage } from "../components/LanguageProvider";
import styles from "../styles/Projects.module.css";

const COPY = {
  en: {
    pageTitle: "Projects | LinguaLab",
    home: "Home",
    learn: "Learning Hub",
    projects: "Projects",
    eyebrow: "PROJECT LAUNCHER",
    title: "Start a new research project",
    lead: "Begin with your research dataset and move through a connected workspace for exploration, study design, analysis, interpretation, and reporting.",
    workspaceLabel: "YOUR PROJECT WORKSPACE",
    workspaceTitle: "Research work starts in Workspace",
    workspaceText: "Workspace is where you add your files, inspect the data structure, identify important columns, and choose an appropriate next step.",
    steps: ["Explore the current dataset", "Review quality, columns, and labels", "Continue to research planning or analysis"],
    note: "This page does not upload or save projects. Files and active work remain in Workspace under the existing privacy controls.",
    action: "Open Workspace",
  },
  ar: {
    pageTitle: "المشاريع | LinguaLab",
    home: "الرئيسية",
    learn: "مركز التعلّم",
    projects: "المشاريع",
    eyebrow: "بدء مشروع بحثي",
    title: "ابدأ مشروعًا بحثيًا جديدًا",
    lead: "ابدأ ببياناتك البحثية، وانتقل ضمن مساحة عمل مترابطة للاستكشاف وتصميم الدراسة والتحليل والتفسير وإعداد التقرير.",
    workspaceLabel: "مساحة مشروعك",
    workspaceTitle: "يبدأ العمل البحثي في مساحة العمل",
    workspaceText: "مساحة العمل هي المكان المخصص لإضافة الملفات وفحص بنية البيانات وتحديد الأعمدة المهمة واختيار الخطوة التالية المناسبة.",
    steps: ["استكشف مجموعة البيانات الحالية", "راجع الجودة والأعمدة والتصنيفات", "تابع إلى تخطيط البحث أو التحليل"],
    note: "لا ترفع هذه الصفحة المشاريع ولا تحفظها. تبقى الملفات والعمل الفعلي داخل مساحة العمل وفق ضوابط الخصوصية الحالية.",
    action: "افتح مساحة العمل",
  },
};

export default function Projects() {
  const { language } = useLanguage();
  const copy = COPY[language === "ar" ? "ar" : "en"];

  return (
    <main className={styles.page}>
      <Head><title>{copy.pageTitle}</title></Head>

      <nav className={styles.nav} aria-label={language === "ar" ? "التنقل الرئيسي" : "Primary navigation"}>
        <Link href="/" className={styles.brand}><span className={styles.brandMark}>L</span><span>LinguaLab</span></Link>
        <div className={styles.navLinks}>
          <Link href="/">{copy.home}</Link>
          <Link href="/student-dashboard">{copy.learn}</Link>
          <Link href="/projects" aria-current="page">{copy.projects}</Link>
        </div>
      </nav>

      <section className={styles.hero}>
        <p className={styles.eyebrow}>{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p className={styles.lead}>{copy.lead}</p>
      </section>

      <section className={styles.launcher} aria-labelledby="project-workspace-title">
        <div className={styles.launcherCopy}>
          <p className={styles.eyebrow}>{copy.workspaceLabel}</p>
          <h2 id="project-workspace-title">{copy.workspaceTitle}</h2>
          <p>{copy.workspaceText}</p>
          <ol>{copy.steps.map((step) => <li key={step} dir="auto">{step}</li>)}</ol>
        </div>

        <div className={styles.actionPanel}>
          <p>{copy.note}</p>
          <Link href="/workspace" className={styles.primaryAction}>{copy.action}<span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </main>
  );
}

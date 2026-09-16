import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useLanguage } from "./LanguageProvider";
import styles from "../styles/Platform.module.css";

const navigation = [
  ["/platform", "Platform", "المنصة"],
  ["/documentation", "Documentation", "التوثيق"],
  ["/platform/references", "References", "المراجع"],
  ["/platform/trust", "Trust", "الثقة"],
  ["/platform/support", "Support", "الدعم"],
];

export function PlatformIcon({ name }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round", strokeLinejoin: "round" };
  const paths = {
    about: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7h.01" /></>,
    documentation: <><path d="M6 3h9l3 3v15H6z" /><path d="M14 3v4h4M9 11h6M9 15h6" /></>,
    references: <><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3Z" /><path d="M8 4v16" /></>,
    trust: <><path d="M12 3 20 6v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6Z" /><path d="m8.5 12 2.2 2.2 4.8-5" /></>,
    support: <><circle cx="12" cy="12" r="9" /><path d="M8 10a4 4 0 0 1 8 0c0 3-4 2.5-4 5M12 18h.01" /></>,
    "release-notes": <><path d="M6 3h12v18H6z" /><path d="M9 8h6M9 12h6M9 16h4" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>{paths[name] || paths.documentation}</svg>;
}

export function PlatformCards({ cards, compact = false }) {
  const { language } = useLanguage();
  return (
    <div className={`${styles.cardGrid} ${compact ? styles.compactGrid : ""}`}>
      {cards.map((card) => {
        const body = <><span className={styles.cardIcon}><PlatformIcon name={card.id} /></span><h2>{card.title[language]}</h2><p>{(card.description || card.text)[language]}</p>{card.meta && <span className={styles.cardMeta}>{card.meta[language]}</span>}</>;
        return card.href ? <Link className={styles.card} href={card.href} key={card.id}>{body}<span className={styles.cardAction}>{language === "ar" ? "افتح ←" : "Open →"}</span></Link> : <article className={styles.card} key={card.id}>{body}</article>;
      })}
    </div>
  );
}

export default function PlatformShell({ title, eyebrow, description, children }) {
  const { language } = useLanguage();
  const router = useRouter();
  const pageTitle = typeof title === "string" ? title : title[language];
  const pageDescription = typeof description === "string" ? description : description[language];
  const isActive = (href) => href === "/platform"
    ? router.pathname === href
    : router.pathname === href || router.pathname.startsWith(`${href}/`);
  return (
    <>
      <Head>
        <title>{pageTitle} | LinguaLab</title>
        <meta name="description" content={pageDescription} />
      </Head>
      <div className={styles.page}>
        <header className={styles.header}>
          <Link className={styles.brand} href="/"><span className={styles.brandMark}>L</span><span>LinguaLab</span></Link>
          <nav className={styles.nav} aria-label={language === "ar" ? "تنقل المنصة" : "Platform navigation"}>
            {navigation.map(([href, en, ar]) => <Link href={href} key={href} aria-current={isActive(href) ? "page" : undefined}>{language === "ar" ? ar : en}</Link>)}
          </nav>
        </header>
        <main>
          <section className={styles.hero}>
            <p className={styles.eyebrow}>{typeof eyebrow === "string" ? eyebrow : eyebrow[language]}</p>
            <h1>{pageTitle}</h1>
            <p>{pageDescription}</p>
          </section>
          <div className={styles.content}>{children}</div>
        </main>
        <footer className={styles.footer}>
          {router.pathname !== "/platform" && <Link href="/platform">{language === "ar" ? "العودة إلى مركز المنصة" : "Back to Platform"}</Link>}
          <Link href="/">{language === "ar" ? "الرئيسية" : "Home"}</Link>
          <span>LinguaLab</span>
        </footer>
      </div>
    </>
  );
}

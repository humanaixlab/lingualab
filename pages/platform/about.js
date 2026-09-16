import Link from "next/link";
import PlatformShell, { PlatformCards } from "../../components/PlatformShell";
import { ABOUT_CARDS } from "../../lib/platform-content";
import { useLanguage } from "../../components/LanguageProvider";
import styles from "../../styles/Platform.module.css";

export default function AboutPage() {
  const { language } = useLanguage();
  return (
    <PlatformShell
      eyebrow={{ en: "PLATFORM OVERVIEW", ar: "نظرة على المنصة" }}
      title={{ en: "About LinguaLab", ar: "عن LinguaLab" }}
      description={{ en: "A concise introduction to the platform’s purpose, audience, research approach, and documented scope.", ar: "مقدمة موجزة عن غاية المنصة وجمهورها ونهجها البحثي ونطاقها الموثّق." }}
    >
      <PlatformCards cards={ABOUT_CARDS} compact />
      <Link className={styles.inventoryLink} href="/platform/inventory">
        {language === "ar" ? "عرض جرد المنصة" : "View platform inventory"}
      </Link>
    </PlatformShell>
  );
}

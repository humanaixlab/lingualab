import Link from "next/link";
import { useRouter } from "next/router";
import { useLanguage } from "./LanguageProvider";
import { documentationForRoute } from "../lib/platform-content";
import styles from "../styles/Platform.module.css";

export default function ToolDocumentationLink() {
  const router = useRouter();
  const { language } = useLanguage();
  const route = (router.asPath || "").split(/[?#]/)[0];
  const documentation = documentationForRoute(route);
  if (!documentation) return null;
  return (
    <Link className={styles.toolDocumentationLink} href={documentation.documentationRoute}>
      <span aria-hidden="true">?</span>
      {language === "ar" ? "التوثيق" : "Documentation"}
    </Link>
  );
}

import "../stylesglobals.css";
import { IBM_Plex_Sans_Arabic, Inter } from "next/font/google";
import { LanguageProvider, useLanguage } from "../components/LanguageProvider";
import LanguageSwitcher from "../components/LanguageSwitcher";
import SmartAssistant from "../components/SmartAssistant";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter-loaded",
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
});

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-ibm-plex-arabic-loaded",
  fallback: ["Noto Sans Arabic", "Tahoma", "Arial", "sans-serif"],
});

function LocalizedApp({ Component, pageProps }) {
  const { direction, language } = useLanguage();
  return (
    <div
      className={`${inter.variable} ${ibmPlexSansArabic.variable} lingualabApp`}
      lang={language}
      dir={direction}
    >
      <LanguageSwitcher />
      <Component {...pageProps} />
      <SmartAssistant />
    </div>
  );
}

export default function App({ Component, pageProps }) {
  return (
    <LanguageProvider>
      <LocalizedApp Component={Component} pageProps={pageProps} />
    </LanguageProvider>
  );
}

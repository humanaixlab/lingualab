import "../stylesglobals.css";
import { LanguageProvider, useLanguage } from "../components/LanguageProvider";
import LanguageSwitcher from "../components/LanguageSwitcher";

function LocalizedApp({ Component, pageProps }) {
  const { direction, language } = useLanguage();
  return (
    <div lang={language} dir={direction}>
      <LanguageSwitcher />
      <Component {...pageProps} />
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

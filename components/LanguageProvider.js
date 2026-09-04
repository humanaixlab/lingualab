import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_LANGUAGE, directionFor, isSupportedLanguage, readStoredLanguage, writeStoredLanguage } from "../lib/i18n/config";
import { translate } from "../lib/i18n/translate";

const LanguageContext = createContext(null);

function applyDocumentLanguage(language) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = language;
  document.documentElement.dir = directionFor(language);
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);

  useEffect(() => {
    let storage;
    try { storage = window.localStorage; } catch { storage = null; }
    const restored = readStoredLanguage(storage);
    const timer = window.setTimeout(() => setLanguageState(restored), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    applyDocumentLanguage(language);
  }, [language]);

  const setLanguage = useCallback((nextLanguage) => {
    if (!isSupportedLanguage(nextLanguage)) return;
    setLanguageState(nextLanguage);
    applyDocumentLanguage(nextLanguage);
    let storage;
    try { storage = window.localStorage; } catch { storage = null; }
    writeStoredLanguage(storage, nextLanguage);
  }, []);

  const value = useMemo(() => ({
    language,
    direction: directionFor(language),
    setLanguage,
    t: (path, variables) => translate(language, path, variables),
  }), [language, setLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider.");
  return context;
}

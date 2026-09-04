export const DEFAULT_LANGUAGE = "en";
export const SUPPORTED_LANGUAGES = ["en", "ar"];
export const LANGUAGE_STORAGE_KEY = "lingualab-ui-language";

export function isSupportedLanguage(value) {
  return SUPPORTED_LANGUAGES.includes(value);
}

export function directionFor(language) {
  return language === "ar" ? "rtl" : "ltr";
}

export function readStoredLanguage(storage) {
  try {
    const saved = storage?.getItem(LANGUAGE_STORAGE_KEY);
    return isSupportedLanguage(saved) ? saved : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

export function writeStoredLanguage(storage, language) {
  if (!storage || !isSupportedLanguage(language)) return false;
  try {
    storage.setItem(LANGUAGE_STORAGE_KEY, language);
    return true;
  } catch {
    return false;
  }
}

export function normalizeAdvisorUiLanguage(value) {
  return value === "ar" ? "ar" : "en";
}

export function advisorOutputLanguageInstruction(value) {
  return normalizeAdvisorUiLanguage(value) === "ar"
    ? "OUTPUT LANGUAGE (MANDATORY): Write every descriptive string value and every array item in natural academic Arabic. Keep JSON field names unchanged."
    : "OUTPUT LANGUAGE (MANDATORY): Write every descriptive string value and every array item in clear academic English. Keep JSON field names unchanged.";
}

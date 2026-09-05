export function normalizeAdvisorUiLanguage(value) {
  return value === "ar" ? "ar" : "en";
}

export function advisorOutputLanguageInstruction(value) {
  return normalizeAdvisorUiLanguage(value) === "ar"
    ? `OUTPUT LANGUAGE (MANDATORY): Write every descriptive string value and every array item directly in native, publication-quality academic Arabic. Compose the meaning naturally in Arabic from the outset. Do not translate literally, mirror English sentence order, or preserve English syntactic structure. Use clear, cohesive, unforced Arabic prose. Use the established Arabic technical term first, adding the English term in parentheses only when it has genuine scholarly value (for example: التصنيف الخاضع للإشراف (Supervised Classification)، درجة F1 الكلية (Macro-F1)، مصفوفة الالتباس، تمثيل TF-IDF، والمتتاليات اللفظية (N-grams)). Keep standard technical abbreviations such as TF-IDF, LDA, POS, and Macro-F1 unchanged. Integrate metrics into complete Arabic sentences rather than colon-separated fragments. Keep JSON field names unchanged.`
    : "OUTPUT LANGUAGE (MANDATORY): Write every descriptive string value and every array item in clear academic English. Keep JSON field names unchanged.";
}

import en from "./en.js";
import ar from "./ar.js";
import { DEFAULT_LANGUAGE, isSupportedLanguage } from "./config.js";

const dictionaries = { en, ar };

function lookup(dictionary, path) {
  return path.split(".").reduce((value, key) => value?.[key], dictionary);
}

function interpolate(value, variables) {
  if (Array.isArray(value)) return value.map((item) => interpolate(item, variables));
  if (typeof value !== "string" || !variables) return value;
  return value.replace(/\{(\w+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(variables, key) ? String(variables[key]) : match
  );
}

export function translate(language, path, variables) {
  const selected = isSupportedLanguage(language) ? language : DEFAULT_LANGUAGE;
  const value = lookup(dictionaries[selected], path) ?? lookup(dictionaries[DEFAULT_LANGUAGE], path);
  return interpolate(value ?? path, variables);
}

// A short-lived, destination-specific bridge from a completed corpus tool to
// the Research Interpreter. It is deliberately separate from project and report context.
export const ANALYSIS_HANDOFF_TTL_MS = 10 * 60 * 1000;
export const ANALYSIS_HANDOFF_KEY = "lingualab-analysis-handoff:interpreter";

const SOURCES = new Set(["frequency", "concordance", "ngrams", "pos"]);
const TYPES = new Set(["frequency", "concordance", "ngrams", "pos"]);

const cleanText = (value, max) => typeof value === "string" ? value.slice(0, max) : "";
const cleanEntries = (value) => Array.isArray(value)
  ? value.slice(0, 50).filter((item) => Array.isArray(item) && cleanText(item[0], 500).trim() && Number.isFinite(Number(item[1]))).map(([label, count]) => [cleanText(label, 500), Number(count)])
  : [];
const cleanStrings = (value) => Array.isArray(value) ? value.slice(0, 50).map((item) => cleanText(item, 2000)).filter(Boolean) : [];

function cleanEvidence(type, value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  if (type === "frequency") return { frequencies: cleanEntries(value.frequencies) };
  if (type === "concordance") return { target: cleanText(value.target, 500), contexts: cleanStrings(value.contexts) };
  if (type === "ngrams") return { size: value.size === 3 ? 3 : 2, results: cleanEntries(value.results) };
  if (type === "pos") return { distribution: cleanEntries(value.distribution) };
  return null;
}

export function createAnalysisHandoff(sourceTool, analysisType, input, storage = globalThis?.sessionStorage, now = Date.now()) {
  if (!SOURCES.has(sourceTool) || !TYPES.has(analysisType) || sourceTool !== analysisType || !input || typeof input !== "object") return null;
  const text = cleanText(input.text, 12000);
  const evidence = cleanEvidence(analysisType, input);
  if (!text.trim() || !evidence) return null;
  const id = globalThis?.crypto?.randomUUID?.() || `${now}-${Math.random().toString(36).slice(2)}`;
  const handoff = { version: 1, id, destination: "interpreter", sourceTool, analysisType, createdAt: now, text, evidence };
  const serialized = JSON.stringify(handoff);
  if (serialized.length > 100000 || !storage) return null;
  try {
    storage.setItem(ANALYSIS_HANDOFF_KEY, serialized);
    return `/tools/analyze?interpretHandoff=${encodeURIComponent(id)}#quick-analysis`;
  } catch {
    return null;
  }
}

export function readAnalysisHandoff(search, storage = globalThis?.sessionStorage, now = Date.now()) {
  const id = new URLSearchParams(search || "").get("interpretHandoff");
  if (!id || !storage) return null;
  try {
    const raw = storage.getItem(ANALYSIS_HANDOFF_KEY);
    if (!raw || raw.length > 100000) return null;
    const value = JSON.parse(raw);
    const age = now - value?.createdAt;
    const valid = value?.version === 1 && value.id === id && value.destination === "interpreter" &&
      SOURCES.has(value.sourceTool) && value.analysisType === value.sourceTool && Number.isFinite(value.createdAt) &&
      age >= 0 && age < ANALYSIS_HANDOFF_TTL_MS;
    if (!valid) {
      if (value?.id === id) storage.removeItem(ANALYSIS_HANDOFF_KEY);
      return null;
    }
    const text = cleanText(value.text, 12000);
    const evidence = cleanEvidence(value.analysisType, value.evidence);
    return text.trim() && evidence ? { sourceTool: value.sourceTool, analysisType: value.analysisType, text, evidence } : null;
  } catch {
    return null;
  }
}

export function interpretationContextText(handoff) {
  if (!handoff) return "";
  return JSON.stringify({ sourceTool: handoff.sourceTool, analysisType: handoff.analysisType, results: handoff.evidence });
}

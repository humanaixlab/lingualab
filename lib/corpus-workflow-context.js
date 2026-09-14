export const CORPUS_WORKFLOW_KEY = "lingualab-corpus-workflow";
export const CORPUS_WORKFLOW_TTL_MS = 30 * 60 * 1000;

const TRANSITIONS = Object.freeze({
  "corpus-research": "frequency",
  frequency: "concordance",
  concordance: "ngrams",
});
const TOOL_ROUTES = Object.freeze({
  "corpus-research": "/tools/corpus-research",
  frequency: "/tools/frequency",
  concordance: "/tools/concordance",
  ngrams: "/tools/ngrams",
});
const cleanText = (value, max = 12000) => typeof value === "string" ? value.slice(0, max) : "";
const cleanEntries = (value) => Array.isArray(value)
  ? value.slice(0, 50).filter((item) => Array.isArray(item) && cleanText(item[0], 500).trim() && Number.isFinite(Number(item[1]))).map(([label, count]) => [cleanText(label, 500), Number(count)])
  : [];
const cleanStrings = (value) => Array.isArray(value) ? value.slice(0, 50).map((item) => cleanText(item, 2000)).filter(Boolean) : [];

function cleanResult(tool, value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  if (tool === "corpus-research") return {
    documentCount: Number.isFinite(Number(value.documentCount)) ? Number(value.documentCount) : null,
    wordCount: Number.isFinite(Number(value.wordCount)) ? Number(value.wordCount) : null,
  };
  if (tool === "frequency") return { frequencies: cleanEntries(value.frequencies) };
  if (tool === "concordance") return { target: cleanText(value.target, 500), contexts: cleanStrings(value.contexts) };
  return null;
}

const contextQuery = (id) => `?researchPath=corpus-linguistics&from=research-path&returnSection=corpus-linguistics&corpusFlow=${encodeURIComponent(id)}`;

export function createCorpusWorkflowHandoff(sourceTool, nextTool, input, storage = globalThis?.sessionStorage, now = Date.now()) {
  if (TRANSITIONS[sourceTool] !== nextTool || !TOOL_ROUTES[nextTool] || !input || typeof input !== "object") return null;
  const text = cleanText(input.text);
  const previousResult = cleanResult(sourceTool, input.result || {});
  if (!text.trim() || !previousResult || !storage) return null;
  const id = globalThis?.crypto?.randomUUID?.() || `${now}-${Math.random().toString(36).slice(2)}`;
  const value = { version: 1, id, pathId: "corpus-linguistics", sourceTool, nextTool, text, previousResult, createdAt: now };
  const serialized = JSON.stringify(value);
  if (serialized.length > 100000) return null;
  try {
    storage.setItem(CORPUS_WORKFLOW_KEY, serialized);
    return `${TOOL_ROUTES[nextTool]}${contextQuery(id)}`;
  } catch {
    return null;
  }
}

export function readCorpusWorkflowHandoff(search, expectedTool, storage = globalThis?.sessionStorage, now = Date.now()) {
  const id = new URLSearchParams(search || "").get("corpusFlow");
  if (!id || !TOOL_ROUTES[expectedTool] || !storage) return null;
  try {
    const raw = storage.getItem(CORPUS_WORKFLOW_KEY);
    if (!raw || raw.length > 100000) return null;
    const value = JSON.parse(raw);
    const age = now - value?.createdAt;
    const valid = value?.version === 1 && value.id === id && value.pathId === "corpus-linguistics" &&
      value.nextTool === expectedTool && TRANSITIONS[value.sourceTool] === expectedTool &&
      Number.isFinite(value.createdAt) && age >= 0 && age < CORPUS_WORKFLOW_TTL_MS;
    if (!valid) {
      if (value?.id === id) storage.removeItem(CORPUS_WORKFLOW_KEY);
      return null;
    }
    const text = cleanText(value.text);
    const previousResult = cleanResult(value.sourceTool, value.previousResult);
    return text.trim() && previousResult ? { ...value, text, previousResult } : null;
  } catch {
    return null;
  }
}

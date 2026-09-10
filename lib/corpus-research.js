export const CORPUS_RESEARCH_STORAGE_KEY = "lingualab-corpus-research-preview";
export const CORPUS_REVIEW_DECISIONS = Object.freeze(["accept", "edit", "reject"]);
export const CORPUS_MODULES = Object.freeze(["create", "analyze"]);
export const MAX_CORPUS_DOCUMENTS = 100;

const METADATA_FIELDS = Object.freeze(["source", "genre", "date", "author", "notes"]);

const clean = (value) => typeof value === "string" ? value.trim() : "";
const clone = (value) => JSON.parse(JSON.stringify(value));
const normalizedText = (value) => clean(value).replace(/\s+/g, " ");

export function createCorpusDocument({ text, fileName = "", metadata = {} }, id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`) {
  const content = clean(text);
  if (!content) return null;
  return {
    id,
    text: content,
    fileName: clean(fileName),
    metadata: Object.fromEntries(METADATA_FIELDS.map((field) => [field, clean(metadata[field])])),
  };
}

export function inspectCorpus(documents) {
  const valid = Array.isArray(documents) ? documents.filter((document) => document && clean(document.text)) : [];
  const seen = new Map();
  const duplicateIds = [];
  valid.forEach((document) => {
    const signature = normalizedText(document.text);
    if (seen.has(signature)) duplicateIds.push(document.id);
    else seen.set(signature, document.id);
  });
  return {
    documentCount: valid.length,
    characterCount: valid.reduce((total, document) => total + clean(document.text).length, 0),
    duplicateIds,
    missingMetadata: valid.map((document) => ({
      documentId: document.id,
      fields: METADATA_FIELDS.filter((field) => !clean(document.metadata?.[field])),
    })).filter((item) => item.fields.length),
  };
}

export function combineCorpusText(documents) {
  return (Array.isArray(documents) ? documents : []).map((document) => clean(document?.text)).filter(Boolean).join("\n\n");
}

export function analyzeCorpusDeterministically(documents, { query = "", ngramSize = 2 } = {}) {
  const text = combineCorpusText(documents);
  const words = text.replace(/[.,!?،؛:؟"'()\[\]]/g, " ").split(/\s+/).filter(Boolean);
  const frequencies = Object.entries(words.reduce((counts, word) => {
    counts[word] = (counts[word] || 0) + 1;
    return counts;
  }, {})).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 25);
  const size = ngramSize === 3 ? 3 : 2;
  const gramCounts = {};
  for (let index = 0; index <= words.length - size; index += 1) {
    const gram = words.slice(index, index + size).join(" ");
    gramCounts[gram] = (gramCounts[gram] || 0) + 1;
  }
  const ngrams = Object.entries(gramCounts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 25);
  const target = clean(query);
  const contexts = target ? text.split(/[.!؟\n]/).map((sentence) => sentence.trim()).filter((sentence) => sentence && sentence.includes(target)).slice(0, 50) : [];
  return { documentCount: inspectCorpus(documents).documentCount, wordCount: words.length, frequencies, query: target, contexts, ngramSize: size, ngrams };
}

export function validateCorpusAiOutput(moduleId, output) {
  if (!CORPUS_MODULES.includes(moduleId) || !output || typeof output !== "object") return false;
  if (moduleId === "create") {
    return ["metadataFields", "inclusionCriteria", "exclusionCriteria", "textTypes", "corpusStructure", "readinessIssues"]
      .every((field) => Array.isArray(output[field]) && output[field].every((item) => typeof item === "string" && item.trim()));
  }
  return typeof output.summary === "string" && Boolean(output.summary.trim())
    && Array.isArray(output.patterns) && output.patterns.every((item) => typeof item === "string" && item.trim())
    && Array.isArray(output.researchQuestions) && output.researchQuestions.every((item) => typeof item === "string" && item.trim())
    && typeof output.caution === "string" && Boolean(output.caution.trim());
}

export function createCorpusReview({ moduleId, aiOutput, decision, finalOutput, createdAt = new Date().toISOString() }) {
  if (!CORPUS_MODULES.includes(moduleId) || !CORPUS_REVIEW_DECISIONS.includes(decision)) return null;
  if (!validateCorpusAiOutput(moduleId, aiOutput) || !validateCorpusAiOutput(moduleId, finalOutput)) return null;
  return { moduleId, aiOutput: clone(aiOutput), researcherDecision: decision, finalOutput: clone(finalOutput), createdAt };
}

const emptyState = () => ({ documents: [], reviews: [] });

export function readCorpusResearchState(storage = globalThis?.localStorage) {
  try {
    const parsed = JSON.parse(storage?.getItem(CORPUS_RESEARCH_STORAGE_KEY) || "null");
    if (!parsed || typeof parsed !== "object") return emptyState();
    return {
      documents: Array.isArray(parsed.documents) ? parsed.documents.slice(-MAX_CORPUS_DOCUMENTS) : [],
      reviews: Array.isArray(parsed.reviews) ? parsed.reviews.filter((review) => CORPUS_MODULES.includes(review?.moduleId)).slice(-100) : [],
    };
  } catch {
    return emptyState();
  }
}

export function saveCorpusResearchState(state, storage = globalThis?.localStorage) {
  const safe = {
    documents: (Array.isArray(state?.documents) ? state.documents : []).slice(-MAX_CORPUS_DOCUMENTS),
    reviews: (Array.isArray(state?.reviews) ? state.reviews : []).slice(-100),
  };
  try {
    storage?.setItem(CORPUS_RESEARCH_STORAGE_KEY, JSON.stringify(safe));
    return { ok: true, state: safe };
  } catch {
    return { ok: false, state: readCorpusResearchState(storage) };
  }
}

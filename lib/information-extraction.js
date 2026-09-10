export const INFORMATION_EXTRACTION_STORAGE_KEY = "lingualab-information-extraction-reviewed-cases";
export const INFORMATION_EXTRACTION_DECISIONS = Object.freeze(["accept", "edit", "reject"]);
export const ENTITY_CATEGORIES = Object.freeze(["شخص", "جهة/مؤسسة", "مكان", "تاريخ/زمن", "أخرى"]);

export const INFORMATION_EXTRACTION_TOOLS = Object.freeze({
  ner: { id: "ner" },
  relations: { id: "relations" },
  terminology: { id: "terminology" },
});

const clean = (value) => typeof value === "string" ? value.trim() : "";
const exact = (text, span) => Boolean(clean(span)) && clean(text).includes(span);
const clone = (value) => JSON.parse(JSON.stringify(value));

export function informationExtractionTool(toolId) {
  return INFORMATION_EXTRACTION_TOOLS[toolId] || null;
}

export function validateInformationExtractionOutput(toolId, text, output, { requireExplanation = true } = {}) {
  const source = clean(text);
  if (!informationExtractionTool(toolId) || !source || !/[\u0600-\u06ff]/.test(source) || !output || typeof output !== "object") return false;
  if (requireExplanation && (typeof output.explanation !== "string" || !output.explanation.trim())) return false;
  if (toolId === "ner") return Array.isArray(output.entities) && output.entities.every((entity) => entity && ENTITY_CATEGORIES.includes(entity.category) && exact(source, entity.span));
  if (toolId === "relations") return Array.isArray(output.relations) && output.relations.every((relation) => relation
    && exact(source, relation.entity1) && exact(source, relation.entity2) && exact(source, relation.evidence)
    && clean(relation.relation) && clean(relation.explanation));
  return Array.isArray(output.terms) && output.terms.every((term) => term && exact(source, term.term) && clean(term.rationale));
}

export function createInformationExtractionReview({ toolId, text, aiOutput, decision, finalOutput, createdAt = new Date().toISOString() }) {
  if (!INFORMATION_EXTRACTION_DECISIONS.includes(decision) || !validateInformationExtractionOutput(toolId, text, aiOutput)
    || !validateInformationExtractionOutput(toolId, text, finalOutput, { requireExplanation: false })) return null;
  return { toolId, originalText: text, aiOutput: clone(aiOutput), researcherDecision: decision, finalOutput: clone(finalOutput), createdAt };
}

export function readInformationExtractionReviews(storage = globalThis?.localStorage) {
  try {
    const parsed = JSON.parse(storage?.getItem(INFORMATION_EXTRACTION_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => informationExtractionTool(item?.toolId) && INFORMATION_EXTRACTION_DECISIONS.includes(item?.researcherDecision)).slice(-100) : [];
  } catch { return []; }
}

export function saveInformationExtractionReview(review, storage = globalThis?.localStorage) {
  if (!review) return { ok: false, reviews: readInformationExtractionReviews(storage) };
  const reviews = [...readInformationExtractionReviews(storage), review].slice(-100);
  try { storage?.setItem(INFORMATION_EXTRACTION_STORAGE_KEY, JSON.stringify(reviews)); return { ok: true, reviews }; }
  catch { return { ok: false, reviews: readInformationExtractionReviews(storage) }; }
}

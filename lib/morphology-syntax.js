export const MORPHOLOGY_SYNTAX_STORAGE_KEY = "lingualab-morphology-syntax-reviewed-cases";
export const MORPHOLOGY_SYNTAX_DECISIONS = Object.freeze(["accept", "edit", "reject"]);

export const MORPHOLOGY_SYNTAX_TOOLS = Object.freeze({
  lemmatization: { id: "lemmatization", section: "morphology", input: "token" },
  "morphological-features": { id: "morphological-features", section: "morphology", input: "token" },
  "word-structure": { id: "word-structure", section: "morphology", input: "token" },
  pos: { id: "pos", section: "syntax", input: "token" },
  "syntactic-relations": { id: "syntactic-relations", section: "syntax", input: "elements" },
  "sentence-structure": { id: "sentence-structure", section: "syntax", input: "sentence" },
});

const clean = (value) => typeof value === "string" ? value.trim() : "";
const exact = (text, span) => Boolean(clean(span)) && clean(text).includes(span);
const clone = (value) => JSON.parse(JSON.stringify(value));

export function morphologySyntaxTool(toolId) {
  return MORPHOLOGY_SYNTAX_TOOLS[toolId] || null;
}

export function validateMorphologySyntaxInputs(toolId, inputs) {
  const tool = morphologySyntaxTool(toolId);
  const text = clean(inputs?.text);
  if (!tool || !text || !/[\u0600-\u06ff]/.test(text)) return false;
  if (tool.input === "token") return exact(text, clean(inputs?.token));
  if (tool.input === "elements") return exact(text, clean(inputs?.firstElement)) && exact(text, clean(inputs?.secondElement));
  return true;
}

export function validateMorphologySyntaxOutput(toolId, inputs, output, { requireExplanation = true } = {}) {
  if (!validateMorphologySyntaxInputs(toolId, inputs) || !output || typeof output !== "object") return false;
  const text = clean(inputs.text);
  const explanationOk = !requireExplanation || (typeof output.explanation === "string" && Boolean(output.explanation.trim()));
  if (!explanationOk) return false;
  if (toolId === "lemmatization") return output.original === clean(inputs.token) && clean(output.lemma) && exact(text, output.evidence) && typeof output.uncertain === "boolean";
  if (toolId === "morphological-features") {
    const fields = ["gender", "number", "definiteness", "person", "tenseAspect", "voice"];
    return output.original === clean(inputs.token) && exact(text, output.evidence) && output.features && typeof output.features === "object"
      && fields.every((field) => typeof output.features[field] === "string") && fields.some((field) => clean(output.features[field]));
  }
  if (toolId === "word-structure") return output.original === clean(inputs.token) && exact(text, output.evidence) && Array.isArray(output.prefixes)
    && output.prefixes.every((item) => typeof item === "string") && clean(output.stem) && Array.isArray(output.suffixes)
    && output.suffixes.every((item) => typeof item === "string") && [...output.prefixes, output.stem, ...output.suffixes].join("") === output.original
    && typeof output.uncertain === "boolean";
  if (toolId === "pos") return output.original === clean(inputs.token) && exact(text, output.evidence) && clean(output.category) && typeof output.uncertain === "boolean";
  if (toolId === "syntactic-relations") return Boolean(output.firstElement === clean(inputs.firstElement) && output.secondElement === clean(inputs.secondElement)
    && exact(text, output.evidence) && clean(output.relation));
  if (!Array.isArray(output.constituents) || !output.constituents.length || typeof output.uncertain !== "boolean") return false;
  return output.constituents.every((item) => item && clean(item.label) && exact(text, item.span));
}

export function createMorphologySyntaxReview({ toolId, inputs, aiOutput, decision, finalOutput, createdAt = new Date().toISOString() }) {
  if (!MORPHOLOGY_SYNTAX_DECISIONS.includes(decision) || !validateMorphologySyntaxOutput(toolId, inputs, aiOutput)
    || !validateMorphologySyntaxOutput(toolId, inputs, finalOutput, { requireExplanation: false })) return null;
  return {
    toolId,
    inputs: clone(inputs),
    aiOutput: clone(aiOutput),
    researcherDecision: decision,
    finalOutput: clone(finalOutput),
    createdAt,
  };
}

export function readMorphologySyntaxReviews(storage = globalThis?.localStorage) {
  try {
    const parsed = JSON.parse(storage?.getItem(MORPHOLOGY_SYNTAX_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => morphologySyntaxTool(item?.toolId) && MORPHOLOGY_SYNTAX_DECISIONS.includes(item?.researcherDecision)).slice(-100) : [];
  } catch { return []; }
}

export function saveMorphologySyntaxReview(review, storage = globalThis?.localStorage) {
  if (!review) return { ok: false, reviews: readMorphologySyntaxReviews(storage) };
  const reviews = [...readMorphologySyntaxReviews(storage), review].slice(-100);
  try { storage?.setItem(MORPHOLOGY_SYNTAX_STORAGE_KEY, JSON.stringify(reviews)); return { ok: true, reviews }; }
  catch { return { ok: false, reviews: readMorphologySyntaxReviews(storage) }; }
}

export const SEMANTICS_REVIEW_STORAGE_KEY = "lingualab-semantics-reviewed-cases";
export const SEMANTICS_REVIEW_DECISIONS = Object.freeze(["accept", "edit", "reject"]);

export const SEMANTICS_TOOLS = Object.freeze({
  similarity: {
    id: "similarity",
    categories: ["متشابه دلاليًا", "متشابه جزئيًا", "غير متشابه"],
  },
  topic: { id: "topic" },
  grouping: { id: "grouping" },
});

export function semanticsTool(toolId) {
  return SEMANTICS_TOOLS[toolId] || null;
}

export function semanticTexts(inputs) {
  if (!inputs || typeof inputs !== "object") return [];
  if (Array.isArray(inputs.texts)) return inputs.texts.map((text) => typeof text === "string" ? text.trim() : "").filter(Boolean);
  return [inputs.primary, inputs.secondary].map((text) => typeof text === "string" ? text.trim() : "").filter(Boolean);
}

function exactEvidence(text, evidence) {
  return typeof text === "string" && typeof evidence === "string" && evidence.length > 0 && text.includes(evidence);
}

function validExplanation(output, required) {
  return !required || (typeof output.explanation === "string" && Boolean(output.explanation.trim()));
}

export function validateSemanticsOutput(toolId, inputs, output, { requireExplanation = true } = {}) {
  if (!semanticsTool(toolId) || !output || typeof output !== "object" || !validExplanation(output, requireExplanation)) return false;
  if (toolId === "similarity") {
    return SEMANTICS_TOOLS.similarity.categories.includes(output.category)
      && output.evidence && exactEvidence(inputs.primary, output.evidence.primary)
      && exactEvidence(inputs.secondary, output.evidence.secondary);
  }
  if (toolId === "topic") {
    return typeof output.topic === "string" && Boolean(output.topic.trim()) && output.topic.trim().length <= 120
      && exactEvidence(inputs.primary, output.evidence);
  }
  if (!Array.isArray(output.groups) || !output.groups.length) return false;
  const submitted = semanticTexts(inputs);
  const assigned = [];
  for (const group of output.groups) {
    if (!group || typeof group.label !== "string" || !group.label.trim() || typeof group.rationale !== "string" || !group.rationale.trim()) return false;
    if (!Array.isArray(group.texts) || !group.texts.length || group.texts.some((text) => !submitted.includes(text))) return false;
    assigned.push(...group.texts);
  }
  return assigned.length === submitted.length && new Set(assigned).size === submitted.length && submitted.every((text) => assigned.includes(text));
}

function cloneOutput(output) {
  return JSON.parse(JSON.stringify(output));
}

export function createSemanticsReviewedCase({ toolId, inputs, aiOutput, decision, finalOutput, createdAt = new Date().toISOString() }) {
  if (!semanticsTool(toolId) || !SEMANTICS_REVIEW_DECISIONS.includes(decision)) return null;
  if (!validateSemanticsOutput(toolId, inputs, aiOutput)) return null;
  if (!validateSemanticsOutput(toolId, inputs, finalOutput, { requireExplanation: false })) return null;
  return {
    id: `${createdAt}-${toolId}-${Math.random().toString(36).slice(2, 10)}`,
    toolId,
    inputs: cloneOutput(inputs),
    aiOutput: cloneOutput(aiOutput),
    researcherDecision: decision,
    finalOutput: cloneOutput(finalOutput),
    createdAt,
  };
}

export function readSemanticsReviewedCases(storage = globalThis?.localStorage) {
  try {
    const parsed = JSON.parse(storage?.getItem(SEMANTICS_REVIEW_STORAGE_KEY) || "[]");
    return Array.isArray(parsed)
      ? parsed.filter((item) => item && SEMANTICS_TOOLS[item.toolId] && SEMANTICS_REVIEW_DECISIONS.includes(item.researcherDecision))
      : [];
  } catch {
    return [];
  }
}

export function saveSemanticsReviewedCase(record, storage = globalThis?.localStorage) {
  if (!record) return { ok: false, cases: readSemanticsReviewedCases(storage) };
  const cases = [...readSemanticsReviewedCases(storage), record].slice(-100);
  try {
    storage?.setItem(SEMANTICS_REVIEW_STORAGE_KEY, JSON.stringify(cases));
    return { ok: true, cases };
  } catch {
    return { ok: false, cases: readSemanticsReviewedCases(storage) };
  }
}

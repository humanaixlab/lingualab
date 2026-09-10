export const NLP_EXPERIMENTS_STORAGE_KEY = "lingualab-nlp-experiments-reviews";
export const NLP_EXPERIMENT_MODULES = Object.freeze(["prompt-experiment", "output-comparison", "task-sandbox"]);
export const COMPARISON_CHOICES = Object.freeze(["a", "b", "tie"]);
export const SANDBOX_DECISIONS = Object.freeze(["accept", "edit", "reject"]);

const clean = (value) => typeof value === "string" ? value.trim() : "";
const clone = (value) => JSON.parse(JSON.stringify(value));

export function parseAllowedLabels(value) {
  return [...new Set(clean(value).split(/[\n,،]/).map(clean).filter(Boolean))].slice(0, 20);
}

export function validatePromptExperiment(output) {
  return Boolean(output && typeof output.variantA === "string" && output.variantA.trim() && typeof output.variantB === "string" && output.variantB.trim()
    && !Object.hasOwn(output, "winner"));
}

export function validateOutputComparison(output) {
  return Boolean(output && ["categoryDecision", "textualEvidence", "explanation", "consistency"].every((field) => typeof output[field] === "string" && output[field].trim())
    && !Object.hasOwn(output, "winner"));
}

export function validateSandboxOutput(text, allowedLabels, output, { requireExplanation = true } = {}) {
  if (!output || typeof output !== "object" || typeof output.result !== "string" || !output.result.trim()) return false;
  if (allowedLabels.length ? !allowedLabels.includes(output.label) : output.label !== "") return false;
  if (typeof output.evidence !== "string" || (output.evidence && !clean(text).includes(output.evidence))) return false;
  return !requireExplanation || (typeof output.explanation === "string" && Boolean(output.explanation.trim()));
}

export function createComparisonReview({ moduleId, inputs, outputs, choice, reason, createdAt = new Date().toISOString() }) {
  if (!["prompt-experiment", "output-comparison"].includes(moduleId) || !COMPARISON_CHOICES.includes(choice) || !clean(reason)) return null;
  if (moduleId === "prompt-experiment" ? !validatePromptExperiment(outputs)
    : (!clean(outputs?.outputA) || !clean(outputs?.outputB) || !validateOutputComparison(outputs?.analysis))) return null;
  return { moduleId, inputs: clone(inputs), originalOutputs: clone(outputs), researcherChoice: choice, researcherReason: clean(reason), createdAt };
}

export function createSandboxReview({ inputs, aiOutput, decision, finalOutput, createdAt = new Date().toISOString() }) {
  const labels = Array.isArray(inputs?.allowedLabels) ? inputs.allowedLabels : [];
  if (!SANDBOX_DECISIONS.includes(decision) || !validateSandboxOutput(inputs?.text, labels, aiOutput)
    || !validateSandboxOutput(inputs?.text, labels, finalOutput, { requireExplanation: false })) return null;
  return { moduleId: "task-sandbox", inputs: clone(inputs), aiOutput: clone(aiOutput), researcherDecision: decision, finalOutput: clone(finalOutput), createdAt };
}

export function readNlpExperimentReviews(storage = globalThis?.localStorage) {
  try {
    const parsed = JSON.parse(storage?.getItem(NLP_EXPERIMENTS_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => NLP_EXPERIMENT_MODULES.includes(item?.moduleId)).slice(-100) : [];
  } catch { return []; }
}

export function saveNlpExperimentReview(review, storage = globalThis?.localStorage) {
  if (!review) return { ok: false, reviews: readNlpExperimentReviews(storage) };
  const reviews = [...readNlpExperimentReviews(storage), review].slice(-100);
  try { storage?.setItem(NLP_EXPERIMENTS_STORAGE_KEY, JSON.stringify(reviews)); return { ok: true, reviews }; }
  catch { return { ok: false, reviews: readNlpExperimentReviews(storage) }; }
}

export const PRAGMATICS_REVIEW_STORAGE_KEY = "lingualab-pragmatics-reviewed-cases";
export const PRAGMATICS_REVIEW_DECISIONS = Object.freeze(["accept", "edit", "reject"]);

export const PRAGMATICS_TOOLS = Object.freeze({
  "speech-acts": {
    id: "speech-acts",
    categories: ["طلب", "اقتراح", "وعد", "اعتذار", "شكر", "تحذير", "لا يوجد فعل كلامي واضح"],
    requiresInterpretation: false,
    noEvidenceCategory: "لا يوجد فعل كلامي واضح",
  },
  implicature: {
    id: "implicature",
    categories: ["يوجد استلزام", "لا يوجد استلزام واضح"],
    requiresInterpretation: true,
    noEvidenceCategory: "لا يوجد استلزام واضح",
  },
  deixis: {
    id: "deixis",
    categories: ["شخص", "مكان", "زمان", "لا توجد إشارة واضحة"],
    requiresInterpretation: true,
    noEvidenceCategory: "لا توجد إشارة واضحة",
  },
});

export function pragmaticsTool(toolId) {
  return PRAGMATICS_TOOLS[toolId] || null;
}

export function pragmaticsEvidenceAppearsInText(text, evidence) {
  return typeof text === "string" && typeof evidence === "string" && evidence.length > 0 && text.includes(evidence);
}

export function validatePragmaticsOutput(toolId, text, output, { requireExplanation = true } = {}) {
  const tool = pragmaticsTool(toolId);
  if (!tool || !output || typeof output !== "object" || !tool.categories.includes(output.category)) return false;
  if (requireExplanation && (typeof output.explanation !== "string" || !output.explanation.trim())) return false;
  if (tool.requiresInterpretation && typeof output.interpretation !== "string") return false;

  const evidence = typeof output.evidence === "string" ? output.evidence : "";
  if (output.category === tool.noEvidenceCategory) {
    return evidence === "" && (!tool.requiresInterpretation || output.interpretation === "");
  }
  if (!pragmaticsEvidenceAppearsInText(text, evidence)) return false;
  return !tool.requiresInterpretation || Boolean(output.interpretation.trim());
}

export function createPragmaticsReviewedCase({ toolId, text, aiOutput, decision, finalOutput, createdAt = new Date().toISOString() }) {
  if (!pragmaticsTool(toolId) || !PRAGMATICS_REVIEW_DECISIONS.includes(decision)) return null;
  if (!validatePragmaticsOutput(toolId, text, aiOutput)) return null;
  if (!validatePragmaticsOutput(toolId, text, finalOutput, { requireExplanation: false })) return null;

  return {
    id: `${createdAt}-${toolId}-${Math.random().toString(36).slice(2, 10)}`,
    toolId,
    originalText: text,
    aiOutput: {
      category: aiOutput.category,
      evidence: aiOutput.evidence,
      interpretation: aiOutput.interpretation || "",
      explanation: aiOutput.explanation,
    },
    researcherDecision: decision,
    finalOutput: {
      category: finalOutput.category,
      evidence: finalOutput.evidence,
      interpretation: finalOutput.interpretation || "",
    },
    createdAt,
  };
}

export function readPragmaticsReviewedCases(storage = globalThis?.localStorage) {
  try {
    const parsed = JSON.parse(storage?.getItem(PRAGMATICS_REVIEW_STORAGE_KEY) || "[]");
    return Array.isArray(parsed)
      ? parsed.filter((item) => item && PRAGMATICS_TOOLS[item.toolId] && PRAGMATICS_REVIEW_DECISIONS.includes(item.researcherDecision))
      : [];
  } catch {
    return [];
  }
}

export function savePragmaticsReviewedCase(record, storage = globalThis?.localStorage) {
  if (!record) return { ok: false, cases: readPragmaticsReviewedCases(storage) };
  const cases = [...readPragmaticsReviewedCases(storage), record].slice(-100);
  try {
    storage?.setItem(PRAGMATICS_REVIEW_STORAGE_KEY, JSON.stringify(cases));
    return { ok: true, cases };
  } catch {
    return { ok: false, cases: readPragmaticsReviewedCases(storage) };
  }
}

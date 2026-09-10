export const DISCOURSE_REVIEW_STORAGE_KEY = "lingualab-discourse-reviewed-cases";
export const DISCOURSE_REVIEW_DECISIONS = Object.freeze(["accept", "edit", "reject"]);

export const DISCOURSE_TOOLS = Object.freeze({
  stance: {
    id: "stance",
    categories: ["مؤيد", "معارض", "محايد"],
    requiresTarget: true,
    requiresSecondEvidence: false,
  },
  "hedging-assertion": {
    id: "hedging-assertion",
    categories: ["تحفظ", "توكيد", "لا يوجد"],
    requiresTarget: false,
    requiresSecondEvidence: false,
    noEvidenceCategory: "لا يوجد",
  },
  "discourse-relations": {
    id: "discourse-relations",
    categories: ["سبب", "نتيجة", "استدراك", "مقارنة", "إضافة", "تفسير", "لا توجد علاقة واضحة"],
    requiresTarget: false,
    requiresSecondEvidence: true,
    noEvidenceCategory: "لا توجد علاقة واضحة",
  },
});

export function discourseTool(toolId) {
  return DISCOURSE_TOOLS[toolId] || null;
}

export function evidenceAppearsInText(text, evidence) {
  return typeof text === "string" && typeof evidence === "string" && evidence.length > 0 && text.includes(evidence);
}

export function validateDiscourseAiOutput(toolId, text, output) {
  const tool = discourseTool(toolId);
  if (!tool || !output || typeof output !== "object") return false;
  if (!tool.categories.includes(output.category)) return false;
  if (typeof output.explanation !== "string" || !output.explanation.trim()) return false;
  if (!output.evidence || typeof output.evidence !== "object") return false;

  const primary = typeof output.evidence.primary === "string" ? output.evidence.primary : "";
  const secondary = typeof output.evidence.secondary === "string" ? output.evidence.secondary : "";
  if (output.category === tool.noEvidenceCategory) return primary === "" && secondary === "";
  if (!evidenceAppearsInText(text, primary)) return false;
  return !tool.requiresSecondEvidence || evidenceAppearsInText(text, secondary);
}

export function createReviewedCase({ toolId, text, target = "", aiOutput, decision, finalOutput, createdAt = new Date().toISOString() }) {
  if (!discourseTool(toolId) || !DISCOURSE_REVIEW_DECISIONS.includes(decision)) return null;
  if (!validateDiscourseAiOutput(toolId, text, aiOutput)) return null;
  if (!validateDiscourseAiOutput(toolId, text, { ...finalOutput, explanation: aiOutput.explanation })) return null;

  return {
    id: `${createdAt}-${toolId}-${Math.random().toString(36).slice(2, 10)}`,
    toolId,
    originalText: text,
    target: target || "",
    aiOutput: {
      category: aiOutput.category,
      evidence: { primary: aiOutput.evidence.primary, secondary: aiOutput.evidence.secondary || "" },
      explanation: aiOutput.explanation,
    },
    researcherDecision: decision,
    finalOutput: {
      category: finalOutput.category,
      evidence: { primary: finalOutput.evidence.primary, secondary: finalOutput.evidence.secondary || "" },
    },
    createdAt,
  };
}

export function readReviewedCases(storage = globalThis?.localStorage) {
  try {
    const parsed = JSON.parse(storage?.getItem(DISCOURSE_REVIEW_STORAGE_KEY) || "[]");
    return Array.isArray(parsed)
      ? parsed.filter((item) => item && DISCOURSE_TOOLS[item.toolId] && DISCOURSE_REVIEW_DECISIONS.includes(item.researcherDecision))
      : [];
  } catch {
    return [];
  }
}

export function saveReviewedCase(record, storage = globalThis?.localStorage) {
  if (!record) return { ok: false, cases: readReviewedCases(storage) };
  const cases = [...readReviewedCases(storage), record].slice(-100);
  try {
    storage?.setItem(DISCOURSE_REVIEW_STORAGE_KEY, JSON.stringify(cases));
    return { ok: true, cases };
  } catch {
    return { ok: false, cases: readReviewedCases(storage) };
  }
}

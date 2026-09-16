const bi = (en, ar) => Object.freeze({ en, ar });

export const TOOL_OWNERS = Object.freeze({
  "nlp-builder": Object.freeze({
    route: "/tools/nlp-builder",
    name: bi("NLP Builder", "بناء المعالجة اللغوية حاسوبيًا"),
    question: bi("How do I turn this linguistic phenomenon or rule into a computational design?", "كيف أحوّل هذه الظاهرة أو القاعدة اللغوية إلى تصميم حاسوبي؟"),
    description: bi("Design how a linguistic phenomenon or rule becomes a representation and computational algorithm.", "صمّم كيف تتحول الظاهرة أو القاعدة اللغوية إلى تمثيل وخوارزمية حاسوبية."),
    capabilities: ["linguistic-phenomenon", "unit-of-analysis", "annotation-design", "conceptual-schema", "task-mapping", "rule-formalization", "ambiguity", "exceptions", "decision-logic", "linguistic-pseudocode", "educational-starter-code"],
  }),
  code: Object.freeze({
    route: "/tools/code",
    name: bi("Code Builder", "مساعد بناء الكود"),
    question: bi("The task is defined; how do I implement it in code?", "المهمة محددة؛ كيف أنفذها فعليًا بالكود؟"),
    description: bi("Turn a defined task or dataset into executable code.", "حوّل المهمة أو البيانات المحددة إلى كود قابل للتنفيذ."),
    capabilities: ["dataset-code", "file-manipulation", "preprocessing-code", "feature-extraction-code", "training-code", "evaluation-code", "visualization-code", "technical-debugging", "reusable-scripts"],
  }),
  analyze: Object.freeze({
    route: "/tools/analyze",
    name: bi("Analyze", "التحليل"),
    question: bi("What do my data and results show?", "ماذا تظهر بياناتي؟"),
    description: bi("Analyze data and explore supported results.", "حلّل البيانات واستكشف النتائج."),
    capabilities: ["deterministic-results", "counts", "concordances", "frequency-tables", "metrics", "result-exploration", "result-bound-interpretation", "result-bound-methodological-implications", "supported-extraction"],
  }),
  research: Object.freeze({
    route: "/research-advisor",
    name: bi("Research", "البحث"),
    question: bi("How do I design and document the study scientifically?", "كيف أصمم الدراسة وأوثقها علميًا؟"),
    description: bi("Design the study and methodology and document it scientifically.", "صمّم الدراسة ومنهجيتها ووثّقها علميًا."),
    capabilities: ["research-question", "objectives", "hypotheses", "study-design", "sampling", "collection-planning", "reliability-planning", "methodology-writing", "limitations", "research-reporting", "reproducibility"],
  }),
});

export const HANDOFF_TRANSITIONS = Object.freeze({
  "nlp-builder:code": "implementation",
  "code:nlp-builder": "linguistic-refinement",
  "nlp-builder:research": "methodology-use",
  "research:nlp-builder": "computational-formalization",
  "code:analyze": "result-exploration",
  "analyze:code": "implementation-revision",
  "analyze:research": "research-interpretation",
  "research:analyze": "analysis-execution",
});

export function ownerForCapability(capability) {
  return Object.entries(TOOL_OWNERS).find(([, owner]) => owner.capabilities.includes(capability))?.[0] || null;
}

export function auditOwnership() {
  const seen = new Map();
  const duplicates = [];
  for (const [owner, definition] of Object.entries(TOOL_OWNERS)) {
    for (const capability of definition.capabilities) {
      if (seen.has(capability)) duplicates.push({ capability, owners: [seen.get(capability), owner] });
      else seen.set(capability, owner);
    }
  }
  return { duplicates, capabilityCount: seen.size, ownerCount: Object.keys(TOOL_OWNERS).length };
}

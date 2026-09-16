import { HANDOFF_TRANSITIONS, TOOL_OWNERS } from "./capability-ownership.js";

export const PROJECT_HANDOFF_TTL_MS = 30 * 60 * 1000;
const PREFIX = "lingualab-project-handoff:";
const MAX_BYTES = 80000;
const text = (value, max = 5000) => typeof value === "string" && value.length <= max ? value.trim() : "";
const list = (value, maxItems = 40, maxText = 1000) => Array.isArray(value) ? value.filter((item) => typeof item === "string").slice(0, maxItems).map((item) => item.slice(0, maxText)) : [];

const TRANSFER_FIELDS = Object.freeze({
  "nlp-builder:code": ["domain", "linguisticTask", "computationalTask", "unitOfAnalysis", "inputSchema", "labelSchema", "requiredFeatures", "algorithmType", "decisionLogic", "pseudocode", "testCases", "dependencies", "evaluationPlan"],
  "code:nlp-builder": ["domain", "task", "availableSchema", "availableLabels", "unitOfAnalysis", "linguisticIssue", "ambiguityIssue", "codeContext", "dependencies"],
  "nlp-builder:research": ["phenomenon", "operationalDefinition", "unitOfAnalysis", "annotationScheme", "algorithmSpec", "scope", "limitations", "ambiguities", "evaluationPlan", "dependencies"],
  "research:nlp-builder": ["researchQuestion", "linguisticDomain", "proposedData", "methodologicalConstraints", "knownPhenomenon", "projectTitle"],
  "code:analyze": ["datasetReference", "task", "outputSchema", "predictionColumn", "targetColumn", "metrics", "generatedArtifacts", "knownLimitations"],
  "analyze:code": ["datasetReference", "task", "requiredChange", "outputSchema", "importantErrors", "metrics", "codeContext"],
  "analyze:research": ["analysisType", "resultSummary", "metrics", "importantErrors", "datasetDescription", "knownLimitations"],
  "research:analyze": ["analysisTask", "datasetContext", "researchQuestion", "requestedOutputs", "methodologicalConstraints"],
});

const ARRAY_FIELDS = new Set(["inputSchema", "labelSchema", "requiredFeatures", "pseudocode", "testCases", "dependencies", "availableSchema", "availableLabels", "evaluationPlan", "limitations", "ambiguities", "metrics", "generatedArtifacts", "importantErrors", "knownLimitations", "requestedOutputs", "methodologicalConstraints"]);

export function sanitizeProjectPayload(source, target, input) {
  const key = `${source}:${target}`;
  const fields = TRANSFER_FIELDS[key];
  if (!fields || !input || typeof input !== "object") return null;
  const payload = {};
  for (const field of fields) {
    if (ARRAY_FIELDS.has(field)) {
      const safe = list(input[field]);
      if (safe.length) payload[field] = safe;
    } else {
      const safe = text(input[field]);
      if (safe) payload[field] = safe;
    }
  }
  return Object.keys(payload).length ? payload : null;
}

export function createProjectHandoff(source, target, input, options = {}) {
  const transition = HANDOFF_TRANSITIONS[`${source}:${target}`];
  const payload = sanitizeProjectPayload(source, target, input);
  if (!transition || !payload || source === target) throw new Error("This transfer is unsupported or has no new owner-specific task.");
  const storage = options.storage || globalThis?.sessionStorage;
  const now = Number.isFinite(options.now) ? options.now : Date.now();
  const id = options.id || globalThis?.crypto?.randomUUID?.();
  if (!storage || !id) throw new Error("The transfer cannot be saved in this tab.");
  const handoff = {
    version: 1, id, source, target, transition, createdAt: now,
    projectId: text(options.projectId, 200) || `project-${id}`,
    sourceStateId: text(options.sourceStateId, 200) || null,
    sourceVersion: text(options.sourceVersion, 100) || "1",
    provenance: { sourceTool: source, status: "incoming-preview", researcherDecision: "pending" },
    payload,
  };
  const serialized = JSON.stringify(handoff);
  if (serialized.length > MAX_BYTES) throw new Error("The transfer is too large. Remove unnecessary context and try again.");
  storage.setItem(PREFIX + target, serialized);
  return `${TOOL_OWNERS[target].route}?projectHandoff=${encodeURIComponent(id)}`;
}

export function readProjectHandoff(target, search, storage = globalThis?.sessionStorage, now = Date.now()) {
  if (!TOOL_OWNERS[target] || !storage) return null;
  try {
    const id = new URLSearchParams(search || "").get("projectHandoff");
    if (!id) return null;
    const saved = storage.getItem(PREFIX + target);
    if (!saved || saved.length > MAX_BYTES) return null;
    const handoff = JSON.parse(saved);
    const age = now - handoff?.createdAt;
    if (!handoff || handoff.version !== 1 || handoff.id !== id || handoff.target !== target || !HANDOFF_TRANSITIONS[`${handoff.source}:${target}`] || !Number.isFinite(handoff.createdAt) || age < 0 || age >= PROJECT_HANDOFF_TTL_MS) {
      if (Number.isFinite(handoff?.createdAt) && age >= PROJECT_HANDOFF_TTL_MS) storage.removeItem(PREFIX + target);
      return null;
    }
    const payload = sanitizeProjectPayload(handoff.source, target, handoff.payload);
    return payload ? { ...handoff, payload, stale: false, requiresDecision: true } : null;
  } catch {
    return null;
  }
}

export function projectHandoffStatus(target, search, storage = globalThis?.sessionStorage, now = Date.now()) {
  try {
    const id = new URLSearchParams(search || "").get("projectHandoff");
    if (!id || !storage) return "missing";
    const saved = storage.getItem(PREFIX + target);
    if (!saved) return "missing";
    const handoff = JSON.parse(saved);
    if (handoff?.id !== id || handoff?.target !== target) return "mismatch";
    const age = now - handoff.createdAt;
    if (!Number.isFinite(handoff.createdAt) || age < 0) return "invalid-time";
    if (age >= PROJECT_HANDOFF_TTL_MS) return "stale";
    return sanitizeProjectPayload(handoff.source, target, handoff.payload) ? "valid" : "invalid-payload";
  } catch {
    return "invalid";
  }
}

export function incomingHandoffPreview(handoff) {
  if (!handoff) return null;
  return {
    source: handoff.source, target: handoff.target, transition: handoff.transition,
    id: handoff.id, projectId: handoff.projectId, createdAt: handoff.createdAt,
    sourceStateId: handoff.sourceStateId, sourceVersion: handoff.sourceVersion,
    payload: handoff.payload,
    provenance: handoff.provenance, notice: "Target state has not been changed.",
  };
}

export function acceptProjectHandoff(currentState, handoff, strategy = "merge") {
  if (!handoff || !["merge", "replace-empty"].includes(strategy)) return { state: currentState, accepted: false, conflicts: [] };
  const current = currentState && typeof currentState === "object" ? currentState : {};
  const conflicts = Object.keys(handoff.payload).filter((key) => current[key] !== undefined && current[key] !== "" && JSON.stringify(current[key]) !== JSON.stringify(handoff.payload[key]));
  const incomingProjectContext = {
    source: handoff.source, transition: handoff.transition, projectId: handoff.projectId,
    createdAt: handoff.createdAt, sourceStateId: handoff.sourceStateId,
    provenance: { ...handoff.provenance, status: "accepted", researcherDecision: strategy },
    payload: handoff.payload,
  };
  return { state: { ...current, incomingProjectContext }, accepted: true, conflicts };
}

export function projectHandoffTask(handoff, locale = "en") {
  if (!handoff) return "";
  const p = handoff.payload;
  if (handoff.target === "code") {
    const heading = locale === "ar" ? "نفّذ التصميم الحاسوبي التالي دون إعادة تعريف قراراته اللغوية:" : "Implement the following computational design without redefining its linguistic decisions:";
    return [heading, p.linguisticTask || p.task, p.computationalTask, p.unitOfAnalysis && `Unit: ${p.unitOfAnalysis}`, p.labelSchema?.length && `Labels: ${p.labelSchema.join(", ")}`, p.inputSchema?.length && `Input schema: ${p.inputSchema.join(", ")}`, p.pseudocode?.length && `Pseudocode:\n${p.pseudocode.join("\n")}`, p.dependencies?.length && `Dependencies requiring implementation or verification: ${p.dependencies.join(", ")}`].filter(Boolean).join("\n");
  }
  return JSON.stringify(p, null, 2);
}

export function buildNlpProjectPayload(state, pack, target) {
  if (!state || !pack || !["code", "research"].includes(target)) return null;
  const algorithm = state.mode === "linguistic-algorithm";
  if (target === "code") return {
    domain: algorithm ? state.ruleDomain : getText(pack.phenomenon),
    linguisticTask: algorithm ? state.ruleName : pack.phenomenon,
    computationalTask: algorithm ? "linguistic-rule-implementation" : pack.computationalTask?.name,
    unitOfAnalysis: algorithm ? state.ruleUnit : state.unit,
    inputSchema: algorithm ? [state.ruleUnit, "context"] : pack.dataSchema,
    labelSchema: algorithm ? pack.outputLabels : pack.annotation?.labels,
    requiredFeatures: algorithm ? pack.requiredFeatures?.map((item) => `${item.name} | ${item.source}`) : [],
    algorithmType: algorithm ? "rule-based linguistic algorithm" : pack.algorithm?.family,
    decisionLogic: algorithm ? pack.pseudocode?.join("\n") : "Implement the approved task mapping and preserve the annotation schema.",
    pseudocode: pack.pseudocode,
    testCases: algorithm ? pack.tests?.map((item) => `${item.input} => ${item.expected}`) : [],
    dependencies: algorithm ? pack.dependencies?.map((item) => `${item.name} | ${item.status}`) : [],
    evaluationPlan: algorithm ? ["Run documented positive, negative, exception, and REVIEW cases"] : pack.evaluation?.metrics,
  };
  return {
    phenomenon: algorithm ? state.ruleName : pack.phenomenon,
    operationalDefinition: algorithm ? state.ruleDescription : `Annotation: ${(pack.annotation?.labels || []).join(", ")}`,
    unitOfAnalysis: algorithm ? state.ruleUnit : state.unit,
    annotationScheme: algorithm ? pack.outputLabels : pack.annotation?.labels,
    algorithmSpec: algorithm ? pack.pseudocode?.join("\n") : `${pack.computationalTask?.name}; ${pack.algorithm?.name}`,
    scope: algorithm ? state.ruleDescription : state.notes,
    limitations: algorithm ? ["Planned starter logic; not a final linguistic judgment"] : ["Computational design only; study methodology remains to be developed in Research; no completed experiment or validated results"],
    ambiguities: algorithm ? pack.exceptions : [],
    evaluationPlan: algorithm ? ["Researcher-reviewed rule tests and decision trace"] : pack.evaluation?.metrics,
    dependencies: algorithm ? pack.dependencies?.map((item) => `${item.name} | ${item.status}`) : [],
  };
}

function getText(value) {
  return typeof value === "string" ? value : "";
}

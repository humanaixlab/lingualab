export const REPORT_CONTEXT_KEY = "lingualab-report-context";
export const REPORT_CONTEXT_TTL_MS = 30 * 60 * 1000;

const SOURCES = new Set(["frequency", "concordance", "ngrams", "pos", "interpreter", "advisor", "copilot"]);
const TYPES = new Set(["frequency", "concordance", "ngrams", "pos", "interpretation", "methodology"]);
const MAX_STORED_SIZE = 100000;

function cleanString(value, max = 4000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function cleanEntries(value, limit = 50) {
  return Array.isArray(value)
    ? value.slice(0, limit).filter((item) => Array.isArray(item) && cleanString(item[0], 500) && Number.isFinite(Number(item[1])) && Number(item[1]) >= 0).map(([label, count]) => [cleanString(label, 500), Number(count)])
    : [];
}

function cleanStrings(value, limit = 50, max = 2000) {
  return Array.isArray(value) ? value.slice(0, limit).map((item) => cleanString(item, max)).filter(Boolean) : [];
}

function cleanInterpretation(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const result = {};
  for (const key of ["interpretation", "summary", "methodology", "methodologicalImplications", "limitations", "nextStep", "recommendedNextStep", "paperParagraph"]) {
    const clean = cleanString(value[key], 6000);
    if (clean) result[key] = clean;
  }
  return Object.keys(result).length ? result : null;
}

function cleanPayload(type, value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  if (type === "frequency") return { wordCount: Number.isFinite(Number(value.wordCount)) ? Number(value.wordCount) : null, frequencies: cleanEntries(value.frequencies), summary: cleanString(value.summary) };
  if (type === "concordance") return { target: cleanString(value.target, 500), contexts: cleanStrings(value.contexts, 50, 2000), summary: cleanString(value.summary), interpretation: cleanInterpretation(value.interpretation) };
  if (type === "ngrams") return { size: value.size === 3 ? 3 : 2, results: cleanEntries(value.results), summary: cleanString(value.summary), interpretation: cleanInterpretation(value.interpretation) };
  if (type === "pos") return { distribution: cleanEntries(value.distribution), summary: cleanString(value.summary), interpretation: cleanInterpretation(value.interpretation) };
  if (type === "interpretation") return { wordCount: Number.isFinite(Number(value.wordCount)) ? Number(value.wordCount) : null, sentenceCount: Number.isFinite(Number(value.sentenceCount)) ? Number(value.sentenceCount) : null, topWords: cleanEntries(value.topWords, 20), interpretation: cleanInterpretation(value.interpretation) };
  if (type === "methodology") return { researchGoal: cleanString(value.researchGoal), summary: cleanString(value.summary), recommendedMethod: cleanString(value.recommendedMethod), studyDesign: cleanString(value.studyDesign), workflow: cleanStrings(value.workflow, 30), limitations: cleanString(value.limitations), nextSteps: cleanStrings(value.nextSteps, 20), questions: cleanStrings(value.questions, 20) };
  return null;
}

function describeAvailability(type, payload) {
  const metrics = [];
  const charts = [];
  if (Number.isFinite(payload.wordCount)) metrics.push("wordCount");
  if (Number.isFinite(payload.sentenceCount)) metrics.push("sentenceCount");
  if (type === "concordance" && payload.contexts.length) metrics.push("contextCount");
  if (type === "frequency" && payload.frequencies.length) charts.push("bar");
  if (type === "ngrams" && payload.results.length) charts.push("bar");
  if (type === "pos" && payload.distribution.length) charts.push("donut", "bar");
  return { availableMetrics: metrics, availableCharts: charts, availableWorkflow: type === "methodology" && payload.workflow.length > 0, availableSpatialData: false };
}

export function createReportContext(sourceTool, analysisType, payload, storage = globalThis?.sessionStorage, now = Date.now()) {
  if (!SOURCES.has(sourceTool) || !TYPES.has(analysisType)) throw new Error("Unsupported report source.");
  const clean = cleanPayload(analysisType, payload);
  if (!clean) throw new Error("Valid report results are required.");
  const availability = describeAvailability(analysisType, clean);
  const reportId = globalThis?.crypto?.randomUUID?.() || `${now}-${Math.random().toString(36).slice(2)}`;
  const context = { version: 1, reportId, sourceTool, analysisType, timestamp: now, ...availability, payload: clean };
  const serialized = JSON.stringify(context);
  if (serialized.length > MAX_STORED_SIZE) throw new Error("Report context is too large.");
  try {
    storage?.setItem(REPORT_CONTEXT_KEY, serialized);
  } catch {
    return null;
  }
  if (!storage) return null;
  return `/research-report?reportId=${encodeURIComponent(reportId)}`;
}

export function readReportContext(search, storage = globalThis?.sessionStorage, now = Date.now()) {
  const reportId = new URLSearchParams(search || "").get("reportId");
  if (!reportId || !storage) return null;
  try {
    const raw = storage.getItem(REPORT_CONTEXT_KEY);
    if (!raw || raw.length > MAX_STORED_SIZE) return null;
    const context = JSON.parse(raw);
    const valid = context?.version === 1 && context.reportId === reportId && SOURCES.has(context.sourceTool) && TYPES.has(context.analysisType) && Number.isFinite(context.timestamp) && now >= context.timestamp && now - context.timestamp <= REPORT_CONTEXT_TTL_MS;
    if (!valid) {
      if (context?.reportId === reportId) storage.removeItem(REPORT_CONTEXT_KEY);
      return null;
    }
    const payload = cleanPayload(context.analysisType, context.payload);
    if (!payload) return null;
    return { ...context, ...describeAvailability(context.analysisType, payload), payload };
  } catch {
    return null;
  }
}

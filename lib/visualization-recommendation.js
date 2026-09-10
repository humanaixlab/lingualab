const CHART_KINDS = new Set([
  "categorical",
  "comparison",
  "errors",
  "reference-prediction",
  "frequency",
]);

const DIAGRAM_KINDS = new Set([
  "word-structure",
  "sentence-structure",
  "syntactic-relations",
  "discourse-relations",
  "entity-relations",
  "workflow",
]);

function finiteValue(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function hasMetrics(metrics) {
  if (Array.isArray(metrics)) return metrics.some((metric) => finiteValue(metric?.value));
  if (!metrics || typeof metrics !== "object") return false;
  return Object.values(metrics).some(finiteValue);
}

function hasChartData(data) {
  return Array.isArray(data) && data.some((entry) => (
    entry && typeof entry.label === "string" && entry.label.trim() &&
    (finiteValue(entry.value) || finiteValue(entry.secondaryValue))
  ));
}

function hasDiagramData(diagram) {
  return Boolean(
    Array.isArray(diagram?.nodes) && diagram.nodes.length > 0 &&
    Array.isArray(diagram?.relations) && diagram.relations.length > 0
  );
}

function hasConceptData(conceptMap) {
  return Boolean(
    conceptMap?.aiSupported === true &&
    Array.isArray(conceptMap.nodes) &&
    conceptMap.nodes.some((node) => typeof node?.label === "string" && node.label.trim())
  );
}

export function recommendResearchVisualizations(result = {}) {
  const recommendations = [];

  if (hasMetrics(result.metrics)) recommendations.push("summary-cards");
  if (CHART_KINDS.has(result.quantitativeType) && hasChartData(result.chartData)) recommendations.push("chart");
  if (DIAGRAM_KINDS.has(result.structureType) && hasDiagramData(result.diagram)) recommendations.push("diagram");
  if (hasConceptData(result.conceptMap)) recommendations.push("concept-map");

  return recommendations.length ? recommendations : ["none"];
}

export const VISUALIZATION_TYPES = Object.freeze({
  SUMMARY_CARDS: "summary-cards",
  CHART: "chart",
  DIAGRAM: "diagram",
  CONCEPT_MAP: "concept-map",
  NONE: "none",
});

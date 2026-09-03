// Hub/Analyze/Copilot handoffs expire after 30 minutes; reads never renew them.
export const RESEARCH_CONTEXT_TTL_MS = 30 * 60 * 1000;

// Read only the metadata explicitly handed off by the current Workspace.
export function readResearchContext(search) {
  if (typeof window === "undefined") return null;
  try {
    const query = new URLSearchParams(search);
    const handoffId = query.get("handoffId");
    if (query.get("from") !== "workspace" || !handoffId) return null;
    const context = JSON.parse(sessionStorage.getItem("lingualab-advisor-context"));
    const createdAt = Date.parse(context?.createdAt);
    const age = Date.now() - createdAt;
    if (!context || context.handoffId !== handoffId ||
        !Number.isFinite(age) || age < 0 || age >= RESEARCH_CONTEXT_TTL_MS ||
        context.source !== "dataset-understanding" ||
        typeof context.fileName !== "string" ||
        !Number.isSafeInteger(context.rows) || context.rows < 1) return null;
    return context;
  } catch {
    return null;
  }
}

export function researchContextHref(href, context) {
  if (!context || !["/research-advisor", "/tools/analyze", "/workspace?copilot=1"].includes(href)) return href;
  return `${href}${href.includes("?") ? "&" : "?"}from=workspace&handoffId=${encodeURIComponent(context.handoffId)}`;
}

export function analyzeContext(context) {
  if (!context) return null;
  return { ...context, dataDescription: [
    context.labelColumn && context.labelColumn !== "Not detected" ? "Labeled dataset." : "Corpus.",
    context.arabicPercent > 0 ? "Arabic text." : "",
  ].filter(Boolean).join(" ") };
}

export function hubCopilotMetadata(dataset, rows, textColumn, labelColumn) {
  const distribution = labelColumn ? Object.entries(rows.reduce((counts, row) => {
    const label = String(row[labelColumn] ?? "").trim();
    if (label) counts[label] = (counts[label] || 0) + 1;
    return counts;
  }, {})).sort((a, b) => b[1] - a[1]) : [];
  return {
    rowCount: dataset.rows, columnCount: dataset.columns,
    columnNames: dataset.headers.slice(0, 20),
    selectedTextColumn: textColumn || null, selectedLabelColumn: labelColumn || null,
    arabicPercentage: Number((dataset.arabicRatio * 100).toFixed(1)),
    missingPercentage: Number(dataset.missingPercent.toFixed(1)), duplicateCount: dataset.duplicateCount,
    classCount: distribution.length,
    labelDistribution: distribution.slice(0, 10).map(([label, count]) => ({ label, count })),
    recommendedWorkflow: dataset.recommendation.type,
  };
}

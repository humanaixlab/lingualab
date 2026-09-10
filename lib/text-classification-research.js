export const TEXT_CLASSIFICATION_REVIEW_STORAGE_KEY = "lingualab-text-classification-reviewed-cases";
export const TEXT_CLASSIFICATION_MODULES = Object.freeze(["baseline", "ai-assisted", "error-analysis"]);
export const CLASSIFICATION_REVIEW_DECISIONS = Object.freeze(["accept", "edit", "reject"]);

const ARABIC_PATTERN = /[\u0600-\u06ff]/;
const clean = (value) => typeof value === "string" ? value.trim() : "";
const clone = (value) => JSON.parse(JSON.stringify(value));

export function parseLabeledRows(value) {
  return clean(value).split(/\r?\n/).map((line, index) => {
    const separator = line.lastIndexOf("\t");
    if (separator < 1) return null;
    const text = clean(line.slice(0, separator));
    const label = clean(line.slice(separator + 1));
    return text && label && ARABIC_PATTERN.test(text) ? { id: index + 1, text, label } : null;
  }).filter(Boolean);
}

export function tokenizeArabicText(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .toLowerCase()
    .match(/[\u0600-\u06FFa-z0-9]+/g) || [];
}

function seededShuffle(items) {
  return items.map((item, index) => ({ item, key: ((index + 1) * 9301 + 49297) % 233280 }))
    .sort((a, b) => a.key - b.key).map(({ item }) => item);
}

export function trainNaiveBayesBaseline(rows, testRatio = 0.25) {
  const usable = Array.isArray(rows) ? rows.filter((row) => clean(row?.text) && clean(row?.label) && ARABIC_PATTERN.test(row.text)) : [];
  if (usable.length < 6) throw new Error("six-records");
  const labels = [...new Set(usable.map((row) => clean(row.label)))];
  if (labels.length < 2) throw new Error("two-labels");
  const grouped = labels.map((label) => seededShuffle(usable.filter((row) => clean(row.label) === label)));
  if (grouped.some((group) => group.length < 3)) throw new Error("three-per-label");
  const testRows = [];
  const trainRows = [];
  grouped.forEach((group) => {
    const desired = Math.max(1, Math.round(group.length * testRatio));
    const testSize = Math.min(desired, Math.max(1, group.length - 2));
    testRows.push(...group.slice(0, testSize));
    trainRows.push(...group.slice(testSize));
  });
  const vocabulary = new Set();
  const classDocs = Object.fromEntries(labels.map((label) => [label, 0]));
  const classTokenTotals = Object.fromEntries(labels.map((label) => [label, 0]));
  const tokenCounts = Object.fromEntries(labels.map((label) => [label, {}]));
  trainRows.forEach((row) => {
    classDocs[row.label] += 1;
    tokenizeArabicText(row.text).forEach((token) => {
      vocabulary.add(token);
      tokenCounts[row.label][token] = (tokenCounts[row.label][token] || 0) + 1;
      classTokenTotals[row.label] += 1;
    });
  });
  function predict(text) {
    const scores = labels.map((label) => {
      let score = Math.log((classDocs[label] + 1) / (trainRows.length + labels.length));
      tokenizeArabicText(text).forEach((token) => { score += Math.log(((tokenCounts[label][token] || 0) + 1) / (classTokenTotals[label] + vocabulary.size)); });
      return [label, score];
    }).sort((a, b) => b[1] - a[1]);
    return scores[0]?.[0] || labels[0];
  }
  const predictions = testRows.map((row) => {
    const systemPrediction = predict(row.text);
    return { id: row.id, text: row.text, humanLabel: row.label, systemPrediction, match: row.label === systemPrediction };
  });
  const correct = predictions.filter((item) => item.match).length;
  const confusionMatrix = labels.map((humanLabel) => labels.map((systemPrediction) => predictions.filter((item) => item.humanLabel === humanLabel && item.systemPrediction === systemPrediction).length));
  return { trainCount: trainRows.length, testCount: testRows.length, accuracy: predictions.length ? correct / predictions.length : 0, labels, confusionMatrix, predictions, vocabularySize: vocabulary.size };
}

export function validateAiClassification(text, allowedLabels, output) {
  return Boolean(output && Array.isArray(allowedLabels) && allowedLabels.includes(output.label)
    && typeof output.evidence === "string" && output.evidence.length > 0 && text.includes(output.evidence)
    && typeof output.explanation === "string" && output.explanation.trim());
}

export function createClassificationReview({ text, allowedLabels, aiOutput, decision, finalOutput, createdAt = new Date().toISOString() }) {
  if (!CLASSIFICATION_REVIEW_DECISIONS.includes(decision) || !validateAiClassification(text, allowedLabels, aiOutput)) return null;
  if (!finalOutput || !allowedLabels.includes(finalOutput.label) || !clean(finalOutput.evidence) || !text.includes(finalOutput.evidence)) return null;
  return { text, allowedLabels: [...allowedLabels], aiOutput: clone(aiOutput), researcherDecision: decision, finalOutput: { label: finalOutput.label, evidence: finalOutput.evidence }, createdAt };
}

export function readClassificationReviews(storage = globalThis?.localStorage) {
  try {
    const parsed = JSON.parse(storage?.getItem(TEXT_CLASSIFICATION_REVIEW_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => item && CLASSIFICATION_REVIEW_DECISIONS.includes(item.researcherDecision)).slice(-100) : [];
  } catch { return []; }
}

export function saveClassificationReview(review, storage = globalThis?.localStorage) {
  if (!review) return { ok: false, reviews: readClassificationReviews(storage) };
  const reviews = [...readClassificationReviews(storage), review].slice(-100);
  try { storage?.setItem(TEXT_CLASSIFICATION_REVIEW_STORAGE_KEY, JSON.stringify(reviews)); return { ok: true, reviews }; }
  catch { return { ok: false, reviews: readClassificationReviews(storage) }; }
}

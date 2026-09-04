import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useLanguage } from "../components/LanguageProvider";
import { readResearchContext, hubCopilotMetadata } from "../lib/research-context";
import styles from "../styles/Workspace.module.css";

const TEXT_HINTS = [
  "text", "content", "sentence", "review", "tweet", "comment", "message", "body",
  "النص", "محتوى", "الجملة", "تغريدة", "تعليق", "رسالة", "مراجعة"
];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function decodeExcelCell(value) {
  if (typeof value !== "string") return value ?? "";
  return value.replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
}

const LABEL_HINTS = [
  "label", "class", "category", "sentiment", "target", "type", "topic",
  "التصنيف", "الفئة", "المشاعر", "الوسم", "النوع", "الموضوع"
];

function normalizeHeader(value) {
  return String(value || "").trim().toLowerCase();
}

function isMissing(value) {
  return value === null || value === undefined || String(value).trim() === "";
}

function parseDelimited(text, delimiter) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell);
      if (row.some((item) => String(item).trim() !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some((item) => String(item).trim() !== "")) rows.push(row);
  return rows;
}

function rowsToObjects(matrix) {
  if (!matrix.length) return { headers: [], rows: [] };
  const rawHeaders = matrix[0].map((header, index) => String(header || `Column ${index + 1}`).trim());
  const seen = {};
  const headers = rawHeaders.map((header) => {
    const base = header || "Column";
    seen[base] = (seen[base] || 0) + 1;
    return seen[base] === 1 ? base : `${base} ${seen[base]}`;
  });

  const rows = matrix.slice(1).map((values) => {
    const item = {};
    headers.forEach((header, index) => {
      item[header] = values[index] ?? "";
    });
    return item;
  });
  return { headers, rows };
}

function detectColumn(headers, rows, hints, mode) {
  const hinted = headers.find((header) => hints.some((hint) => normalizeHeader(header).includes(hint)));
  if (hinted) return hinted;

  const scored = headers.map((header) => {
    const values = rows.slice(0, 300).map((row) => row[header]).filter((value) => !isMissing(value));
    const strings = values.map((value) => String(value));
    const unique = new Set(strings).size;
    const averageLength = strings.length
      ? strings.reduce((sum, value) => sum + value.length, 0) / strings.length
      : 0;
    const ratio = strings.length ? unique / strings.length : 0;

    if (mode === "text") return { header, score: averageLength + ratio * 12 };
    const classLike = unique >= 2 && unique <= Math.max(20, Math.ceil(strings.length * 0.2));
    return { header, score: classLike ? 100 - unique : -unique };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.score > 0 ? scored[0].header : null;
}

function containsArabic(value) {
  return /[\u0600-\u06FF]/.test(String(value || ""));
}

function analyzeDataset(fileName, headers, rows) {
  const totalCells = Math.max(headers.length * rows.length, 1);
  let missingCells = 0;
  headers.forEach((header) => {
    rows.forEach((row) => {
      if (isMissing(row[header])) missingCells += 1;
    });
  });

  const textColumn = detectColumn(headers, rows, TEXT_HINTS, "text");
  let labelColumn = detectColumn(headers.filter((header) => header !== textColumn), rows, LABEL_HINTS, "label");
  if (labelColumn) {
    const unique = new Set(rows.map((row) => String(row[labelColumn])).filter(Boolean));
    if (unique.size < 2 || unique.size > Math.max(30, rows.length * 0.35)) labelColumn = null;
  }

  const samples = textColumn
    ? rows.slice(0, 500).map((row) => row[textColumn]).filter((value) => !isMissing(value))
    : rows.slice(0, 500).flatMap((row) => headers.map((header) => row[header])).filter((value) => !isMissing(value));
  const arabicCount = samples.filter(containsArabic).length;
  const arabicRatio = samples.length ? arabicCount / samples.length : 0;

  const duplicateCount = textColumn
    ? rows.length - new Set(rows.map((row) => String(row[textColumn] || "").trim()).filter(Boolean)).size
    : 0;

  const labelValues = labelColumn
    ? rows.map((row) => String(row[labelColumn] || "").trim()).filter(Boolean)
    : [];
  const labelCounts = labelValues.reduce((acc, value) => {
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
  const labelDistribution = Object.entries(labelCounts).sort((a, b) => b[1] - a[1]);
  const imbalance = labelDistribution.length > 1
    ? labelDistribution[0][1] / Math.max(labelDistribution[labelDistribution.length - 1][1], 1)
    : 1;

  let recommendation = {
    title: "Explore your Arabic corpus",
    description: "Start with frequency, concordance, and recurring phrase analysis to understand the data before modeling.",
    href: "/ar-tools",
    action: "Explore corpus",
    type: "Corpus exploration",
  };

  if (textColumn && labelColumn) {
    recommendation = {
      title: "Build a guided text-classification workflow",
      description: `Use “${textColumn}” as the text input and “${labelColumn}” as the target label, then evaluate the model clearly.`,
      href: "/tools/analyze",
      action: "Continue to analysis",
      type: "Supervised classification",
    };
  } else if (textColumn && rows.length < 30) {
    recommendation = {
      title: "Begin with qualitative corpus exploration",
      description: "This is a small dataset. Concordance and close reading will be more informative than training a model.",
      href: "/tools/concordance",
      action: "Open concordance",
      type: "Qualitative exploration",
    };
  }

  return {
    fileName,
    rows: rows.length,
    columns: headers.length,
    headers,
    missingPercent: (missingCells / totalCells) * 100,
    textColumn,
    labelColumn,
    arabicRatio,
    duplicateCount,
    labelDistribution: labelDistribution.slice(0, 6),
    imbalance,
    recommendation,
  };
}


function tokenizeArabicText(value) {
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
  return items
    .map((item, index) => ({ item, key: ((index + 1) * 9301 + 49297) % 233280 }))
    .sort((a, b) => a.key - b.key)
    .map(({ item }) => item);
}

function trainNaiveBayes(rows, textColumn, labelColumn, testRatio = 0.25) {
  const usable = rows.filter((row) => !isMissing(row[textColumn]) && !isMissing(row[labelColumn]));
  if (usable.length < 6) {
    throw new Error("At least six labeled records are required to run the classification baseline.");
  }
  const labels = [...new Set(usable.map((row) => String(row[labelColumn]).trim()))];
  const grouped = labels.map((label) => seededShuffle(usable.filter((row) => String(row[labelColumn]).trim() === label)));
  const testRows = [];
  const trainRows = [];
  grouped.forEach((group) => {
    const desired = Math.max(1, Math.round(group.length * testRatio));
    const classTestSize = Math.min(desired, Math.max(1, group.length - 2));
    testRows.push(...group.slice(0, classTestSize));
    trainRows.push(...group.slice(classTestSize));
  });
  if (trainRows.length < labels.length * 2) {
    throw new Error("Each label needs at least three examples for a meaningful baseline.");
  }
  const vocabulary = new Set();
  const classDocs = {};
  const classTokenTotals = {};
  const tokenCounts = {};

  labels.forEach((label) => {
    classDocs[label] = 0;
    classTokenTotals[label] = 0;
    tokenCounts[label] = {};
  });

  trainRows.forEach((row) => {
    const label = String(row[labelColumn]).trim();
    classDocs[label] += 1;
    tokenizeArabicText(row[textColumn]).forEach((token) => {
      vocabulary.add(token);
      tokenCounts[label][token] = (tokenCounts[label][token] || 0) + 1;
      classTokenTotals[label] += 1;
    });
  });

  function predict(text) {
    const tokens = tokenizeArabicText(text);
    const scores = labels.map((label) => {
      let score = Math.log((classDocs[label] + 1) / (trainRows.length + labels.length));
      tokens.forEach((token) => {
        score += Math.log(((tokenCounts[label][token] || 0) + 1) / (classTokenTotals[label] + vocabulary.size));
      });
      return [label, score];
    });
    scores.sort((a, b) => b[1] - a[1]);
    return scores[0]?.[0] || labels[0];
  }

  const predictions = testRows.map((row) => ({
    actual: String(row[labelColumn]).trim(),
    predicted: predict(row[textColumn]),
    text: String(row[textColumn]).slice(0, 150),
  }));
  const correct = predictions.filter((item) => item.actual === item.predicted).length;
  const accuracy = predictions.length ? correct / predictions.length : 0;
  const confusion = labels.map((actual) => labels.map((predicted) =>
    predictions.filter((item) => item.actual === actual && item.predicted === predicted).length
  ));

  return { accuracy, trainSize: trainRows.length, testSize: testRows.length, labels, confusion, predictions: predictions.slice(0, 5), vocabularySize: vocabulary.size };
}

function exploreCorpus(rows, textColumn) {
  const texts = rows.map((row) => String(row[textColumn] || "")).filter(Boolean);
  const tokens = texts.flatMap(tokenizeArabicText).filter((token) => token.length > 1);
  const stop = new Set(["في","من","على","الى","إلى","عن","هو","هي","هذا","هذه","كان","كانت","مع","ما","لا","و","او","أو","ان","أن","التي","الذي"]);
  const counts = tokens.reduce((acc, token) => {
    if (!stop.has(token)) acc[token] = (acc[token] || 0) + 1;
    return acc;
  }, {});
  const topWords = Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0, 12);
  const bigrams = {};
  texts.forEach((text) => {
    const words = tokenizeArabicText(text).filter((token) => token.length > 1 && !stop.has(token));
    for (let i=0;i<words.length-1;i+=1) {
      const phrase = `${words[i]} ${words[i+1]}`;
      bigrams[phrase] = (bigrams[phrase] || 0) + 1;
    }
  });
  const topBigrams = Object.entries(bigrams).sort((a,b) => b[1]-a[1]).slice(0, 8);
  return {
    documents: texts.length,
    tokens: tokens.length,
    uniqueTokens: new Set(tokens).size,
    averageLength: texts.length ? tokens.length / texts.length : 0,
    topWords,
    topBigrams,
  };
}


function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildInsights(dataset, workflowResult, textColumn, labelColumn, language, t) {
  if (!dataset || !workflowResult) return [];
  const insights = [];
  insights.push(t("workspace.insights.records", { rows: dataset.rows.toLocaleString(language), columns: dataset.columns.toLocaleString(language) }));
  if (dataset.arabicRatio >= 0.5) insights.push(t("workspace.insights.arabic", { percent: Math.round(dataset.arabicRatio * 100).toLocaleString(language) }));
  if (dataset.missingPercent > 0) insights.push(t("workspace.insights.missing", { percent: dataset.missingPercent.toLocaleString(language, { maximumFractionDigits: 1 }) }));
  if (dataset.duplicateCount > 0) insights.push(t("workspace.insights.duplicates", { count: dataset.duplicateCount.toLocaleString(language) }));

  if (workflowResult.mode === "classification") {
    const data = workflowResult.data;
    insights.push(t("workspace.insights.accuracy", { percent: Math.round(data.accuracy * 100).toLocaleString(language), count: data.testSize.toLocaleString(language) }));
    if (data.testSize < 10) insights.push(t("workspace.insights.tinyTest"));
    else if (data.accuracy >= 0.8) insights.push(t("workspace.insights.separable"));
    else insights.push(t("workspace.insights.review"));
    if (dataset.imbalance >= 2) insights.push(t("workspace.insights.imbalanced"));
    insights.push(t("workspace.insights.columnsUsed", { text: textColumn, label: labelColumn }));
  } else {
    const data = workflowResult.data;
    insights.push(t("workspace.insights.tokens", { tokens: data.tokens.toLocaleString(language), unique: data.uniqueTokens.toLocaleString(language) }));
    if (data.topWords[0]) insights.push(t("workspace.insights.topWord", { word: data.topWords[0][0], count: data.topWords[0][1].toLocaleString(language) }));
    if (data.topBigrams[0]) insights.push(t("workspace.insights.topPhrase", { phrase: data.topBigrams[0][0], count: data.topBigrams[0][1].toLocaleString(language) }));
    insights.push(t("workspace.insights.corpusReady"));
  }
  return insights;
}

function createReportHtml(dataset, workflowResult, textColumn, labelColumn, language, t) {
  const direction = language === "ar" ? "rtl" : "ltr";
  const generated = new Date().toLocaleString(language === "ar" ? "ar-SA" : "en-GB", { dateStyle: "long", timeStyle: "short" });
  const insights = buildInsights(dataset, workflowResult, textColumn, labelColumn, language, t);
  const reportText = (key) => t(`workspace.reportHtml.${key}`);
  const number = (value, options) => Number(value).toLocaleString(language, options);
  const mode = reportText(workflowResult.mode === "classification" ? "classification" : "exploration");
  const resultRows = workflowResult.mode === "classification"
    ? `
      <tr><th>${reportText("accuracy")}</th><td>${number(Math.round(workflowResult.data.accuracy * 100))}%</td></tr>
      <tr><th>${reportText("training")}</th><td>${number(workflowResult.data.trainSize)}</td></tr>
      <tr><th>${reportText("testing")}</th><td>${number(workflowResult.data.testSize)}</td></tr>
      <tr><th>${reportText("vocabulary")}</th><td>${number(workflowResult.data.vocabularySize)}</td></tr>`
    : `
      <tr><th>${reportText("documents")}</th><td>${number(workflowResult.data.documents)}</td></tr>
      <tr><th>${reportText("tokens")}</th><td>${number(workflowResult.data.tokens)}</td></tr>
      <tr><th>${reportText("uniqueTokens")}</th><td>${number(workflowResult.data.uniqueTokens)}</td></tr>
      <tr><th>${reportText("averageLength")}</th><td>${number(workflowResult.data.averageLength, { maximumFractionDigits: 1 })} ${reportText("tokenUnit")}</td></tr>`;
  const topPatterns = workflowResult.mode === "classification"
    ? `<p>${reportText("baseline")}</p>`
    : `<div class="patterns"><div><h3>${reportText("topWords")}</h3><ol>${workflowResult.data.topWords.slice(0, 10).map(([word,count]) => `<li dir="auto">${escapeHtml(word)} <span>${number(count)}</span></li>`).join("")}</ol></div><div><h3>${reportText("phrases")}</h3><ol>${workflowResult.data.topBigrams.slice(0, 8).map(([phrase,count]) => `<li dir="auto">${escapeHtml(phrase)} <span>${number(count)}</span></li>`).join("")}</ol></div></div>`;

  return `<!doctype html><html lang="${language}" dir="${direction}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${reportText("title")}</title><style>
  :root{font-family:Inter,Arial,sans-serif;color:#18253c;background:#f5f7fb}*{box-sizing:border-box}body{margin:0;padding:40px}.report{max-width:900px;margin:auto;background:white;border:1px solid #e4e8f0;border-radius:24px;padding:44px;box-shadow:0 20px 60px rgba(39,54,87,.10)}.brand{font-weight:900;color:#6151d8}.eyebrow{text-transform:uppercase;letter-spacing:.12em;font-size:11px;color:#7b8799;font-weight:800}.hero{padding-bottom:26px;border-bottom:1px solid #e4e8f0}.hero h1{font-size:42px;letter-spacing:-.04em;margin:10px 0}.hero p{color:#65738a;line-height:1.7}.meta{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:24px 0}.meta div{padding:14px;background:#f7f8fc;border-radius:14px}.meta span{display:block;font-size:10px;color:#8490a2}.meta strong{display:block;margin-top:5px;font-size:13px}section{margin-top:30px}h2{font-size:22px}table{width:100%;border-collapse:collapse}th,td{padding:12px;border-bottom:1px solid #e8ebf2;text-align:start;font-size:13px}th{width:36%;color:#67758a}ul{padding-inline-start:20px;line-height:1.8;color:#46566e}.patterns{display:grid;grid-template-columns:1fr 1fr;gap:18px}.patterns>div{padding:18px;border:1px solid #e4e8f0;border-radius:16px}.patterns ol{padding-inline-start:22px}.patterns li{padding:6px}.patterns span{float:inline-end;font-weight:800}.note{padding:18px;border-radius:15px;background:#17243d;color:#dce3ef;line-height:1.7}.footer{margin-top:38px;padding-top:18px;border-top:1px solid #e4e8f0;color:#8a94a4;font-size:11px}@media print{body{padding:0;background:white}.report{box-shadow:none;border:0;border-radius:0;max-width:none}}@media(max-width:650px){body{padding:14px}.report{padding:24px}.meta,.patterns{grid-template-columns:1fr}.hero h1{font-size:31px}}
  </style></head><body><main class="report"><div class="hero"><div class="brand">LinguaLab</div><p class="eyebrow">${reportText("eyebrow")}</p><h1 dir="auto">${escapeHtml(dataset.fileName)}</h1><p>${reportText("intro")}</p></div>
  <div class="meta"><div><span>${reportText("generated")}</span><strong>${escapeHtml(generated)}</strong></div><div><span>${reportText("workflow")}</span><strong>${mode}</strong></div><div><span>${reportText("textColumn")}</span><strong dir="auto">${escapeHtml(textColumn)}</strong></div></div>
  <section><h2>${reportText("datasetSummary")}</h2><table><tr><th>${reportText("records")}</th><td>${number(dataset.rows)}</td></tr><tr><th>${reportText("columns")}</th><td>${number(dataset.columns)}</td></tr><tr><th>${reportText("arabicSample")}</th><td>${number(Math.round(dataset.arabicRatio * 100))}%</td></tr><tr><th>${reportText("missingCells")}</th><td>${number(dataset.missingPercent, { maximumFractionDigits: 1 })}%</td></tr><tr><th>${reportText("duplicates")}</th><td>${number(dataset.duplicateCount)}</td></tr>${labelColumn ? `<tr><th>${reportText("targetLabel")}</th><td dir="auto">${escapeHtml(labelColumn)}</td></tr>` : ""}</table></section>
  <section><h2>${reportText("methodResults")}</h2><table><tr><th>${reportText("analysisMode")}</th><td>${mode}</td></tr>${resultRows}</table>${topPatterns}</section>
  <section><h2>${reportText("insights")}</h2><ul>${insights.map((item) => `<li dir="auto">${escapeHtml(item)}</li>`).join("")}</ul></section>
  <section><h2>${reportText("limitations")}</h2><div class="note">${reportText(workflowResult.mode === "classification" ? "classificationLimitations" : "corpusLimitations")}</div></section>
  <div class="footer">${reportText("footer")}</div></main></body></html>`;
}

function buildAdvisorContext(dataset) {
  if (!dataset) return null;
  const labelSummary = dataset.labelDistribution?.length
    ? dataset.labelDistribution.map(([label, count]) => `${label}: ${count}`).join(", ")
    : "No label column detected";

  return {
    source: "dataset-understanding",
    createdAt: new Date().toISOString(),
    fileName: dataset.fileName,
    rows: dataset.rows,
    columns: dataset.columns,
    textColumn: dataset.textColumn || "Not confirmed",
    labelColumn: dataset.labelColumn || "Not detected",
    arabicPercent: Math.round(dataset.arabicRatio * 100),
    missingPercent: Number(dataset.missingPercent.toFixed(1)),
    duplicateCount: dataset.duplicateCount,
    recommendationType: dataset.recommendation.type,
    recommendationTitle: dataset.recommendation.title,
    labelSummary,
  };
}

function buildPotentialOutcomes(dataset, rows, textColumn, labelColumn) {
  if (!dataset) return [];

  const labelCounts = labelColumn
    ? rows.reduce((counts, row) => {
        const text = String(row[textColumn] ?? "").trim();
        const label = String(row[labelColumn] ?? "").trim();
        if (text && label) counts[label] = (counts[label] || 0) + 1;
        return counts;
      }, {})
    : {};
  const classSizes = Object.values(labelCounts);
  const classCount = classSizes.length;
  const labeledRecords = classSizes.reduce((sum, count) => sum + count, 0);
  const minimumClassSize = classSizes.length ? Math.min(...classSizes) : 0;
  const maximumClassSize = classSizes.length ? Math.max(...classSizes) : 0;
  const smallDataset = dataset.rows < 100;
  const classificationFeasible = Boolean(
    textColumn && labelColumn && classCount >= 2 && labeledRecords >= 6 && minimumClassSize >= 3
  );
  const balancedEnough = classCount >= 2 && maximumClassSize < minimumClassSize * 2;
  const arabicCoverage = dataset.arabicRatio >= 0.5;
  const dataQualityConcern = dataset.missingPercent > 0 || dataset.duplicateCount > 0;
  const corpusRecommended = !labelColumn || /corpus|qualitative/i.test(dataset.recommendation.type);
  const selected = [];

  function add(key, title, reason, variables = {}) {
    if (selected.length < 4 && !selected.some((item) => item.title === title)) {
      selected.push({ key, title, reason, variables });
    }
  }

  if (dataQualityConcern) {
    const issues = [
      dataset.missingPercent > 0 ? `${dataset.missingPercent.toFixed(1)}% missing cells` : "",
      dataset.duplicateCount > 0 ? `${dataset.duplicateCount} possible duplicate texts` : "",
    ].filter(Boolean).join(" and ");
    add("quality", "Data-quality and cleaning protocol", `The current profile identifies ${issues} that should be handled systematically.`);
  }

  if (classificationFeasible && arabicCoverage) {
    add("baseline", "Reproducible Arabic NLP baseline", `The selected columns provide ${labeledRecords} Arabic-text records across ${classCount} classes for a transparent exploratory baseline.`, { records: labeledRecords, classes: classCount });
  }

  if (corpusRecommended && textColumn) {
    add("corpus", "Corpus exploration report", "A text column is available for documenting frequencies, concordance evidence, and recurring linguistic patterns.");
  }

  if (smallDataset || !classificationFeasible) {
    add("pilot", "Pilot research study", `${dataset.rows} records support an initial investigation, while conclusions should remain exploratory.`, { records: dataset.rows });
  }

  if (labelColumn && (minimumClassSize < 5 || !balancedEnough)) {
    add("annotation", "Annotation guideline", "The current class representation supports documenting label definitions and reviewing annotation consistency.");
  }

  if (smallDataset || (labelColumn && !classificationFeasible)) {
    add("expansion", "Follow-up dataset expansion plan", "The current sample can identify collection and annotation priorities before larger-scale validation.");
  }

  if (classificationFeasible && !smallDataset && balancedEnough && minimumClassSize >= 10) {
    add("comparison", "Comparative experiment", `The ${classCount} sufficiently represented classes support a controlled comparison between transparent analysis methods.`, { classes: classCount });
  }

  if (selected.length < 3) {
    add("classroom", "Classroom research project", "The available workflow can demonstrate research design, analysis, evaluation, and responsible interpretation.");
  }

  if (selected.length < 3 && (classificationFeasible || (textColumn && dataset.rows >= 30))) {
    add("poster", "Conference poster or technical demonstration", "The bounded workflow could communicate a preliminary method and its limitations as a technical demonstration.");
  }

  if (selected.length < 3) {
    add("expansion", "Follow-up dataset expansion plan", "The current profile can guide the next round of data collection and validation planning.");
  }

  return selected;
}

const OUTCOME_ICONS = {
  "Pilot research study": "📄",
  "Reproducible Arabic NLP baseline": "📊",
  "Follow-up dataset expansion plan": "🗂",
  "Classroom research project": "🏫",
  "Data-quality and cleaning protocol": "🧹",
  "Annotation guideline": "📚",
  "Comparative experiment": "📈",
  "Conference poster or technical demonstration": "🎤",
  "Corpus exploration report": "📖",
};

export default function WorkspacePage() {
  const { language, t } = useLanguage();
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [preview, setPreview] = useState([]);
  const [datasetRows, setDatasetRows] = useState([]);
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [workflowStatus, setWorkflowStatus] = useState("configure");
  const [workflowResult, setWorkflowResult] = useState(null);
  const [workflowError, setWorkflowError] = useState("");
  const [selectedTextColumn, setSelectedTextColumn] = useState("");
  const [selectedLabelColumn, setSelectedLabelColumn] = useState("");
  const [reportReady, setReportReady] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [researchGoal, setResearchGoal] = useState("");
  const [copilotStatus, setCopilotStatus] = useState("idle");
  const [copilotError, setCopilotError] = useState("");
  const [studyDesign, setStudyDesign] = useState(null);
  const [hubCopilotContext, setHubCopilotContext] = useState(null);
  const router = useRouter();
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const query = new URLSearchParams(window.location.search);
      const context = query.get("copilot") === "1" ? readResearchContext(window.location.search) : null;
      setHubCopilotContext(context?.copilotMetadata ? context : null);
      if (context?.copilotMetadata) setCopilotOpen(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [router.asPath]);

  const qualityNotes = useMemo(() => {
    if (!result) return [];
    const notes = [];
    if (result.missingPercent > 0) notes.push(t("workspaceDynamic.missingCells", { percent: result.missingPercent.toFixed(1) }));
    if (result.duplicateCount > 0) notes.push(t("workspaceDynamic.duplicates", { count: result.duplicateCount }));
    if (result.labelColumn && result.imbalance >= 2) notes.push(t("workspaceDynamic.imbalanced"));
    if (!result.textColumn) notes.push(t("workspaceDynamic.noText"));
    if (notes.length === 0) notes.push(t("workspaceDynamic.ready"));
    return notes;
  }, [result, t]);

  const recommendationCopy = useMemo(() => {
    if (!result) return null;
    const key = result.recommendation.type === "Supervised classification" ? "classification" : result.recommendation.type === "Qualitative exploration" ? "qualitative" : "exploration";
    const copy = t(`workspaceDynamic.recommendation.${key}`, { text: result.textColumn, label: result.labelColumn });
    return { type: copy[0], title: copy[1], description: copy[2] };
  }, [result, t]);

  const potentialOutcomes = useMemo(
    () => buildPotentialOutcomes(result, datasetRows, selectedTextColumn, selectedLabelColumn),
    [result, datasetRows, selectedTextColumn, selectedLabelColumn]
  );

  function resetWorkspace() {
    setHubCopilotContext(null);
    try {
      sessionStorage.removeItem("lingualab-advisor-context");
    } catch { /* Storage cleanup must not block local reset. */ }
    setWorkflowError("");
    setDragActive(false);
    setStatus("idle");
    setError("");
    setResult(null);
    setPreview([]);
    setDatasetRows([]);
    setWorkflowOpen(false);
    setWorkflowStatus("configure");
    setWorkflowResult(null);
    setSelectedTextColumn("");
    setSelectedLabelColumn("");
    setReportReady(false);
    setCopilotOpen(false);
    setResearchGoal("");
    setCopilotStatus("idle");
    setCopilotError("");
    setStudyDesign(null);
    if (inputRef.current) inputRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function loadDemoDataset() {
    setError("");
    setStatus("reading");
    try {
      const response = await fetch("/sample-datasets/arabic_reviews_demo.csv");
      if (!response.ok) throw new Error(t("workspace.errors.demo"));
      const blob = await response.blob();
      const file = new File([blob], "arabic_reviews_demo.csv", { type: "text/csv" });
      await processFile(file);
    } catch (err) {
      setStatus("error");
      setError(err.message || t("workspace.errors.demo"));
    }
  }

  async function processFile(file) {
    if (!file) return;
    setHubCopilotContext(null);
    try {
      sessionStorage.removeItem("lingualab-advisor-context");
    } catch { /* Storage cleanup must not block local file processing. */ }
    setWorkflowError("");
    if (file.size > MAX_FILE_SIZE) {
      setStatus("error");
      setError(t("workspace.errors.size"));
      return;
    }
    setError("");
    setStatus("reading");
    setResult(null);
    setPreview([]);
    setDatasetRows([]);
    setWorkflowOpen(false);
    setWorkflowStatus("configure");
    setWorkflowResult(null);
    setReportReady(false);
    setCopilotOpen(false);
    setResearchGoal("");
    setCopilotStatus("idle");
    setCopilotError("");
    setStudyDesign(null);

    try {
      const extension = file.name.split(".").pop().toLowerCase();
      let parsed;

      if (["csv", "tsv", "txt"].includes(extension)) {
        const text = await file.text();
        const delimiter = extension === "tsv" ? "\t" : text.split("\n")[0].split(";").length > text.split("\n")[0].split(",").length ? ";" : ",";
        parsed = rowsToObjects(parseDelimited(text, delimiter));
      } else if (extension === "xlsx") {
        const { readSheet } = await import("read-excel-file/browser");
        const matrix = await readSheet(file);
        parsed = rowsToObjects(matrix.map((row) => row.map(decodeExcelCell)));
      } else if (extension === "xls") {
        throw new Error(t("workspace.errors.xls"));
      } else {
        throw new Error(t("workspace.errors.type"));
      }

      if (!parsed.headers.length || !parsed.rows.length) {
        throw new Error(t("workspace.errors.empty"));
      }

      const analysis = analyzeDataset(file.name, parsed.headers, parsed.rows);
      setPreview(parsed.rows.slice(0, 4));
      setDatasetRows(parsed.rows);
      setSelectedTextColumn(analysis.textColumn || parsed.headers[0] || "");
      setSelectedLabelColumn(analysis.labelColumn || "");
      setResult(analysis);
      setStatus("ready");
    } catch (err) {
      setStatus("error");
      setError(err.message || t("workspace.errors.read"));
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragActive(false);
    processFile(event.dataTransfer.files?.[0]);
  }

  function openWorkflow() {
    setWorkflowOpen(true);
    setWorkflowStatus("configure");
    setWorkflowResult(null);
    setReportReady(false);
    window.setTimeout(() => document.getElementById("guided-workflow")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  function openResearchAdvisor() {
    if (typeof window === "undefined" || !result) return;
    const handoffId = window.crypto.randomUUID();
    const context = { ...buildAdvisorContext(result), handoffId };
    sessionStorage.setItem("lingualab-advisor-context", JSON.stringify(context));
    window.location.href = `/research-advisor?from=workspace&handoffId=${encodeURIComponent(handoffId)}`;
  }

  function openResearchHub(event) {
    if (!result) return;
    event.preventDefault();
    try {
      const handoffId = window.crypto.randomUUID();
      const copilotMetadata = hubCopilotMetadata(result, datasetRows, selectedTextColumn, selectedLabelColumn);
      sessionStorage.setItem("lingualab-advisor-context", JSON.stringify({ ...buildAdvisorContext(result), handoffId, copilotMetadata }));
      window.location.href = `/ar-tools?from=workspace&handoffId=${encodeURIComponent(handoffId)}`;
    } catch {
      window.location.href = "/ar-tools";
    }
  }

  async function designMyStudy() {
    if ((!result && !hubCopilotContext) || copilotStatus === "loading") return;
    const currentHubContext = !result ? readResearchContext(window.location.search) : null;
    if (!result && (!currentHubContext?.copilotMetadata || currentHubContext.handoffId !== hubCopilotContext.handoffId)) {
      setStudyDesign(null);
      setCopilotStatus("error");
      setCopilotError("Dataset context has expired or changed. Open Research Copilot again from your current Workspace dataset.");
      return;
    }

    setCopilotStatus("loading");
    setCopilotError("");
    setStudyDesign(null);

    const selectedLabelDistribution = selectedLabelColumn
      ? Object.entries(datasetRows.reduce((counts, row) => {
          const label = String(row[selectedLabelColumn] ?? "").trim();
          if (label) counts[label] = (counts[label] || 0) + 1;
          return counts;
        }, {})).sort((a, b) => b[1] - a[1])
      : [];

    const payload = result ? {
      rowCount: result.rows,
      columnCount: result.columns,
      columnNames: result.headers.slice(0, 20),
      selectedTextColumn: selectedTextColumn || null,
      selectedLabelColumn: selectedLabelColumn || null,
      arabicPercentage: Number((result.arabicRatio * 100).toFixed(1)),
      missingPercentage: Number(result.missingPercent.toFixed(1)),
      duplicateCount: result.duplicateCount,
      classCount: selectedLabelDistribution.length,
      labelDistribution: selectedLabelDistribution.slice(0, 10).map(([label, count]) => ({ label, count })),
      recommendedWorkflow: result.recommendation.type,
      researchGoal: researchGoal.trim(),
    } : { ...currentHubContext.copilotMetadata, researchGoal: researchGoal.trim() };

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 65000);

    try {
      const response = await fetch("/api/research-copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "AI Research Copilot could not design this study.");

      setStudyDesign(data.design);
      setCopilotStatus("success");
    } catch (requestError) {
      setCopilotError(requestError.name === "AbortError"
        ? "The study design request timed out. Please try again."
        : requestError.message || "AI Research Copilot could not design this study.");
      setCopilotStatus("error");
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  function runWorkflow() {
    if (!selectedTextColumn) return;
    setWorkflowError("");
    setWorkflowStatus("running");
    setWorkflowResult(null);
    window.setTimeout(() => {
      try {
        const output = selectedLabelColumn
          ? { mode: "classification", data: trainNaiveBayes(datasetRows, selectedTextColumn, selectedLabelColumn) }
          : { mode: "exploration", data: exploreCorpus(datasetRows, selectedTextColumn) };
        setWorkflowResult(output);
        setWorkflowStatus("complete");
        setReportReady(true);
      } catch (err) {
        setWorkflowStatus("configure");
        const knownError = err.message === "At least six labeled records are required to run the classification baseline." ? t("workspace.errors.six") : err.message === "Each label needs at least three examples for a meaningful baseline." ? t("workspace.errors.three") : err.message;
        setWorkflowError(knownError || t("workspace.errors.workflow"));
      }
    }, 650);
  }

  function downloadResearchReport() {
    if (!result || !workflowResult) return;
    const html = createReportHtml(result, workflowResult, selectedTextColumn, selectedLabelColumn, language, t);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const baseName = String(result.fileName || "lingualab-analysis").replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]+/g, "-");
    anchor.href = url;
    anchor.download = `${baseName}-lingualab-report.html`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <Head>
        <title>{t("workspace.pageTitle")}</title>
        <meta name="description" content={t("workspaceDynamic.meta")} />
      </Head>

      <main className={styles.page}>
        <nav className={styles.nav}>
          <Link href="/" className={styles.brand}><span>L</span>LinguaLab</Link>
          <div className={styles.navActions}>
            <Link href="/workspace">{t("nav.workspace")}</Link><Link href="/ar-tools" onClick={openResearchHub}>{t("nav.researchHub")}</Link><Link href="/research-advisor">{t("nav.researchAdvisor")}</Link>
          </div>
        </nav>

        <section className={styles.hero}>
          <p className={styles.eyebrow}>{t("workspace.step1")}</p><h1>{t("workspace.title")}</h1><p>{t("workspace.lead")}</p>
        </section>

        <div className={styles.journeyBar} aria-label={t("workspace.progress")}>
          <div className={styles.journeyActive}><span>1</span><strong>{t("workspace.understand")}</strong></div>
          <i />
          <div className={workflowOpen ? styles.journeyActive : ""}><span>2</span><strong>{t("workspace.analyze")}</strong></div>
          <i />
          <div className={workflowStatus === "complete" ? styles.journeyActive : ""}><span>3</span><strong>{t("workspace.report")}</strong></div>
        </div>

        <section className={styles.workspaceGrid}>
          <div className={styles.uploadPanel}>
            <div
              className={`${styles.dropzone} ${dragActive ? styles.dropzoneActive : ""}`}
              onDragOver={(event) => { event.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") inputRef.current?.click(); }}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".csv,.tsv,.txt,.xlsx"
                onChange={(event) => processFile(event.target.files?.[0])}
                hidden
              />
              <div className={styles.uploadIcon}>↥</div>
              <h2>{status === "reading" ? t("workspace.reading") : t("workspace.drop")}</h2><p>{t("workspace.chooseHint")}</p><span>{t("workspace.local")}</span>
            </div>

            {error && <div className={styles.errorBox} role="alert">{error}</div>}

            {!result && status !== "reading" && (
              <div className={styles.exampleBox}>
                <div><strong>{t("workspace.tryNow")}</strong><span>{t("workspace.tryText")}</span></div>
                <div className={styles.exampleActions}>
                  <button type="button" className={styles.demoButton} onClick={loadDemoDataset}>{t("workspace.demo")}</button><button type="button" onClick={() => inputRef.current?.click()}>{t("workspace.choose")}</button>
                </div>
              </div>
            )}

            {preview.length > 0 && result && (
              <div className={styles.previewTableWrap}>
                <div className={styles.panelHeading}><span>{t("workspace.preview")}</span><small>{t("workspace.firstRows", { count: preview.length })}</small></div>
                <div className={styles.tableScroller}>
                  <table>
                    <thead><tr>{result.headers.slice(0, 5).map((header) => <th key={header} dir="auto">{header}</th>)}</tr></thead>
                    <tbody>
                      {preview.map((row, rowIndex) => (
                        <tr key={rowIndex}>{result.headers.slice(0, 5).map((header) => <td key={header} dir="auto">{String(row[header] ?? "").slice(0, 80)}</td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <aside className={styles.insightPanel}>
            {!result ? (
              <div className={styles.emptyState}>
                <div className={styles.aiOrb}>✦</div>
                <p className={styles.eyebrow}>{t("workspace.understanding")}</p><h2>{t("workspace.findings")}</h2><p>{t("workspace.empty")}</p>
                <div className={styles.placeholderList}><span /><span /><span /><span /></div>
              </div>
            ) : (
              <div className={styles.results}>
                <div className={styles.resultHeader}>
                  <div className={styles.aiOrb}>✦</div>
                  <div><p className={styles.eyebrow}>{t("workspace.understood")}</p><h2>{t("workspace.found")}</h2></div>
                </div>

                <div className={styles.fileLine}><span dir="auto">{result.fileName}</span><strong>{t("workspace.records", { count: result.rows.toLocaleString(language) })}</strong></div>

                <div className={styles.metricGrid}>
                  <article><span>{t("workspace.language")}</span><strong>{t(result.arabicRatio >= 0.5 ? "workspace.arabic" : "workspace.mixed")}</strong><small>{t("workspace.arabicSample", { percent: Math.round(result.arabicRatio * 100) })}</small></article>
                  <article><span>{t("workspace.structure")}</span><strong>{t("workspace.columns", { count: result.columns })}</strong><small>{t("workspace.dataRows", { count: result.rows.toLocaleString(language) })}</small></article>
                  <article><span>{t("workspace.textColumn")}</span><strong dir="auto">{result.textColumn || t("workspace.review")}</strong><small>{t("workspace.bestInput")}</small></article>
                  <article><span>{t("workspace.labelColumn")}</span><strong dir="auto">{result.labelColumn || t("workspace.notDetected")}</strong><small>{t(result.labelColumn ? "workspace.classification" : "workspace.exploreFirst")}</small></article>
                </div>

                <div className={styles.qualityBox}>
                  <div className={styles.panelHeading}><span>{t("workspace.quality")}</span><small>{t("workspace.missing", { percent: result.missingPercent.toFixed(1) })}</small></div>
                  <ul>{qualityNotes.map((note) => <li key={note}>{note}</li>)}</ul>
                </div>

                {result.labelDistribution.length > 0 && (
                  <div className={styles.distributionBox}>
                    <div className={styles.panelHeading}><span>{t("workspace.distribution")}</span><small>{t("workspace.topClasses")}</small></div>
                    {result.labelDistribution.map(([label, count]) => {
                      const max = result.labelDistribution[0][1];
                      return <div className={styles.barRow} key={label}><span dir="auto">{label}</span><div><i style={{ width: `${(count / max) * 100}%` }} /></div><strong>{count}</strong></div>;
                    })}
                  </div>
                )}

                <div className={styles.recommendation}>
                  <p className={styles.eyebrow}>{t("workspace.recommended")}</p>
                  <span className={styles.workflowTag}>{recommendationCopy.type}</span><h3>{recommendationCopy.title}</h3><p>{recommendationCopy.description}</p>
                  <div className={styles.recommendationActions}>
                    <button type="button" onClick={openWorkflow}>{t(result.labelColumn ? "workspace.build" : "workspace.explore")} →</button><button type="button" className={styles.advisorButton} onClick={openResearchAdvisor}>{t("workspace.askAdvisor")}</button><button type="button" className={styles.copilotButton} onClick={() => setCopilotOpen(true)}>{t("workspace.design")}</button>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </section>

        {(result || hubCopilotContext) && copilotOpen && (
          <section className={styles.copilotPanel} aria-labelledby="research-copilot-title">
            <div className={styles.copilotHeader}>
              <div>
                <p className={styles.eyebrow}>{t("workspace.copilot")}</p><h2 id="research-copilot-title">{t("workspace.copilotTitle")}</h2><p>{t("workspace.copilotLead")}</p>
                {!result && <p dir="auto">{t("workspace.contextOnly", { filename: hubCopilotContext.fileName, count: hubCopilotContext.rows.toLocaleString(language) })}</p>}
              </div>
              <button type="button" onClick={() => setCopilotOpen(false)} aria-label={t("workspace.close")}>×</button>
            </div>

            <div className={styles.copilotInput}>
              <label htmlFor="copilot-research-goal">{t("workspace.goal")} <span>{t("workspace.optional")}</span></label>
              <textarea
                id="copilot-research-goal"
                value={researchGoal}
                maxLength={1000}
                onChange={(event) => setResearchGoal(event.target.value)}
                placeholder={t("workspace.goalPlaceholder")} dir="auto"
              />
              <p className={styles.privacyNotice}><span aria-hidden="true">ⓘ</span><span><strong>{t("workspace.privacy")}</strong>{t("workspace.privacyText")}</span></p>
              <button type="button" className={styles.generateButton} onClick={designMyStudy} disabled={copilotStatus === "loading"}>
                {copilotStatus === "loading" ? t("workspace.designing") : t("workspace.generate")}
              </button>
            </div>

            <div className={styles.copilotOutput} aria-live="polite">
              {copilotStatus === "idle" && <p className={styles.copilotEmpty}>{t("workspace.idle")}</p>}{copilotStatus === "loading" && <p className={styles.copilotEmpty}>{t("workspace.loading")}</p>}{copilotStatus === "error" && <div className={styles.copilotError} role="alert"><strong>{t("workspace.unavailable")}</strong><p dir="auto">{copilotError}</p></div>}
              {copilotStatus === "success" && studyDesign && (
                <article className={styles.studyDesign} dir="auto">
                  <div className={styles.evidenceBanner}><strong>{t("workspaceStudy.based")}</strong><span>• {t("workspaceStudy.records", { count: (result ? result.rows : hubCopilotContext.rows).toLocaleString(language) })}</span><span>• {studyDesign.studyDesign.type === "supervised_classification" ? t("workspaceStudy.classes", { count: result ? new Set(datasetRows.map((row) => String(row[selectedLabelColumn] ?? "").trim()).filter(Boolean)).size : hubCopilotContext.copilotMetadata.classCount }) : t("workspaceStudy.noClasses")}</span><span>• {t("workspaceStudy.arabic", { percent: result ? Math.round(result.arabicRatio * 100) : hubCopilotContext.arabicPercent })}</span><span>• {t("workspaceStudy.missing", { percent: (result ? result.missingPercent : hubCopilotContext.missingPercent).toFixed(1) })}</span></div>
                  <div className={styles.studyTitle}><span>{t("workspaceStudy.blueprint")}</span><h3 dir="auto">{studyDesign.studyTitle}</h3><p dir="auto">{studyDesign.feasibility.summary}</p></div>
                  <section><h4>{t("workspaceStudy.question")}</h4><strong dir="auto">{studyDesign.researchQuestion.primary}</strong><p dir="auto">{studyDesign.researchQuestion.rationale}</p></section>
                  <div className={styles.studyGrid}>
                    <section><h4>{t("workspaceStudy.design")}</h4><strong dir="auto">{studyDesign.studyDesign.type.replaceAll("_", " ")}</strong><p dir="auto">{studyDesign.studyDesign.description}</p></section><section><h4>{t("workspaceStudy.baseline")}</h4><strong dir="auto">{studyDesign.baseline.method}</strong><p dir="auto">{studyDesign.baseline.why}</p></section><section><h4>{t("workspaceStudy.evaluation")}</h4><strong dir="auto">{studyDesign.evaluationPlan.primaryMetrics.join(" · ")}</strong><p dir="auto">{studyDesign.evaluationPlan.validationMethod}</p></section><section><h4>{t("workspaceStudy.preprocessing")}</h4><ul dir="auto">{studyDesign.preprocessingPlan.map((item) => <li key={item.step}><strong>{item.step}</strong> — {item.reason}</li>)}</ul></section>
                  </div>
                  <section><h4>{t("workspaceStudy.steps")}</h4><ol dir="auto">{studyDesign.experimentSteps.map((item) => <li key={item.order}><strong>{item.title}</strong><span>{item.action}</span></li>)}</ol></section><section><h4>{t("workspaceStudy.risks")}</h4><ul dir="auto">{studyDesign.risks.map((item) => <li key={`${item.category}-${item.risk}`}><strong>{item.severity}: {item.risk}</strong> — {item.mitigation}</li>)}</ul></section>
                  {studyDesign.notSupported.length > 0 && <section><h4>{t("workspaceStudy.unsupported")}</h4><ul dir="auto">{studyDesign.notSupported.map((item) => <li key={item}>{item}</li>)}</ul></section>}<div className={styles.nextAction}><span>{t("workspaceStudy.next")}</span><strong dir="auto">{studyDesign.immediateNextAction.action}</strong><p dir="auto">{studyDesign.immediateNextAction.reason}</p></div>
                  {result && <section className={styles.potentialOutcomes}>
                    <p className={styles.outcomeEyebrow}>{t("workspaceStudy.outcomes")}</p><h4 className={styles.outcomeHeading}>{t("workspaceStudy.outcomesTitle")}</h4><p className={styles.outcomeCaption}>{t("workspaceStudy.outcomesText")}<br />{t("workspaceStudy.notAi")}</p>
                    <div className={styles.outcomeGrid}>
                      {potentialOutcomes.map((outcome) => (
                        <article key={outcome.title}>
                          <span className={styles.outcomeIcon} aria-hidden="true">{OUTCOME_ICONS[outcome.title]}</span>
                          <strong>{language === "en" ? outcome.title : t(`workspaceOutcomes.${outcome.key}`)[0]}</strong><p>{language === "en" ? outcome.reason : t(`workspaceOutcomes.${outcome.key}`, outcome.variables)[1]}</p>
                        </article>
                      ))}
                    </div>
                    <p className={styles.outcomeDisclaimer}>{t("workspaceStudy.disclaimer")}</p>
                  </section>}
                </article>
              )}
            </div>
          </section>
        )}

        {result && workflowOpen && (
          <section className={styles.workflowSection} id="guided-workflow">
            <div className={styles.workflowHeader}>
              <div>
                <p className={styles.eyebrow}>{t("workspace.step2")}</p><h2>{t(selectedLabelColumn ? "workspace.configureClass" : "workspace.configureCorpus")}</h2><p>{t("workspace.control")}</p>
              </div>
              <div className={styles.progressSteps}><span className={styles.activeStep}>1</span><i /><span className={workflowStatus !== "configure" ? styles.activeStep : ""}>2</span><i /><span className={workflowStatus === "complete" ? styles.activeStep : ""}>3</span></div>
            </div>

            <div className={styles.workflowGrid}>
              <div className={styles.configCard}>
                <div className={styles.panelHeading}><span>{t("workspace.configuration")}</span><small>{t("workspace.editable")}</small></div>
                <label>{t("workspace.textColumn")}<select dir="auto" value={selectedTextColumn} onChange={(event) => setSelectedTextColumn(event.target.value)}>{result.headers.map((header) => <option key={header} value={header}>{header}</option>)}</select></label>
                <label>{t("workspace.target")}<select dir="auto" value={selectedLabelColumn} onChange={(event) => setSelectedLabelColumn(event.target.value)}><option value="">{t("workspace.noLabel")}</option>{result.headers.filter((header) => header !== selectedTextColumn).map((header) => <option key={header} value={header}>{header}</option>)}</select></label>
                <div className={styles.pipelinePreview}>
                  <span>{t("workspace.pipeline")}</span><div><b>{t("workspace.normalize")}</b><em>→</em><b>{t(selectedLabelColumn ? "workspace.tokenize" : "workspace.countPatterns")}</b><em>→</em><b>{t(selectedLabelColumn ? "workspace.naiveBayes" : "workspace.corpusInsights")}</b></div>
                </div>
                <button className={styles.runButton} type="button" onClick={runWorkflow} disabled={workflowStatus === "running"}>{t(workflowStatus === "running" ? "workspace.running" : "workspace.run")}</button><small className={styles.localNote}>{t("workspace.localRun")}</small>
              </div>

              <div className={styles.outputCard} aria-live="polite">
                {workflowError && <div className={styles.errorBox} role="alert">{workflowError}</div>}
                {workflowStatus !== "complete" ? (
                  <div className={styles.outputEmpty}><div className={styles.aiOrb}>✦</div><h3>{t(workflowStatus === "running" ? "workspace.building" : "workspace.outputEmpty")}</h3><p>{t(workflowStatus === "running" ? "workspace.buildingText" : "workspace.reviewColumns")}</p></div>
                ) : workflowResult.mode === "classification" ? (
                  <div className={styles.workflowResults}>
                    <p className={styles.eyebrow}>{t("workspace.baseline")}</p><h3>{t("workspace.accuracy", { percent: Math.round(workflowResult.data.accuracy * 100) })}</h3>
                    <div className={styles.resultStats}><article><span>{t("workspace.training")}</span><strong>{workflowResult.data.trainSize}</strong></article><article><span>{t("workspace.testing")}</span><strong>{workflowResult.data.testSize}</strong></article><article><span>{t("workspace.vocabulary")}</span><strong>{workflowResult.data.vocabularySize}</strong></article></div>
                    <div className={styles.matrixWrap}><div className={styles.panelHeading}><span>{t("workspace.matrix")}</span><small>{t("workspace.actualPredicted")}</small></div><table dir="auto"><thead><tr><th></th>{workflowResult.data.labels.map((label)=><th key={label}>{label}</th>)}</tr></thead><tbody>{workflowResult.data.labels.map((label,rowIndex)=><tr key={label}><th>{label}</th>{workflowResult.data.confusion[rowIndex].map((value,colIndex)=><td key={workflowResult.data.labels[colIndex]}>{value}</td>)}</tr>)}</tbody></table></div>
                    <div className={styles.interpretation}><strong>{t("workspace.interpretation")}</strong><p>{t(workflowResult.data.testSize < 10 ? "workspace.smallScore" : workflowResult.data.accuracy >= .8 ? "workspace.strongScore" : "workspace.weakScore")}</p></div>
                  </div>
                ) : (
                  <div className={styles.workflowResults}>
                    <p className={styles.eyebrow}>{t("workspace.corpusDone")}</p><h3>{t("workspace.tokens", { count: workflowResult.data.tokens.toLocaleString(language) })}</h3>
                    <div className={styles.resultStats}><article><span>{t("workspace.documents")}</span><strong>{workflowResult.data.documents}</strong></article><article><span>{t("workspace.unique")}</span><strong>{workflowResult.data.uniqueTokens}</strong></article><article><span>{t("workspace.average")}</span><strong>{workflowResult.data.averageLength.toFixed(1)}</strong></article></div>
                    <div className={styles.termGrid}><div><strong>{t("workspace.topWords")}</strong>{workflowResult.data.topWords.slice(0,8).map(([word,count])=><span key={word} dir="auto">{word}<em>{count}</em></span>)}</div><div><strong>{t("workspace.phrases")}</strong>{workflowResult.data.topBigrams.slice(0,6).map(([phrase,count])=><span key={phrase} dir="auto">{phrase}<em>{count}</em></span>)}</div></div>
                    <div className={styles.interpretation}><strong>{t("workspace.interpretation")}</strong><p>{t("workspace.corpusInterpretation")}</p></div>
                  </div>
                )}
              </div>
            </div>

            {workflowStatus === "complete" && workflowResult && reportReady && (
              <div className={styles.reportCard}>
                <div>
                  <p className={styles.eyebrow}>{t("workspace.step3")}</p><h3>{t("workspace.reportReady")}</h3><p>{t("workspace.reportText")}</p>
                  <div className={styles.insightChips}>{buildInsights(result, workflowResult, selectedTextColumn, selectedLabelColumn, language, t).slice(0, 3).map((item) => <span key={item}>{item}</span>)}</div>
                </div>
                <div className={styles.reportActions}>
                  <button type="button" onClick={downloadResearchReport}>{t("workspace.download")}</button><small>{t("workspace.downloadHint")}</small>
                </div>
              </div>
            )}
          </section>
        )}

      </main>
    </>
  );
}

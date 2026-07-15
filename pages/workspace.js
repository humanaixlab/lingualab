import Head from "next/head";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
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

function buildInsights(dataset, workflowResult, textColumn, labelColumn) {
  if (!dataset || !workflowResult) return [];
  const insights = [];
  insights.push(`${dataset.rows.toLocaleString()} records were analyzed across ${dataset.columns} columns.`);
  if (dataset.arabicRatio >= 0.5) insights.push(`${Math.round(dataset.arabicRatio * 100)}% of the sampled text contains Arabic script.`);
  if (dataset.missingPercent > 0) insights.push(`${dataset.missingPercent.toFixed(1)}% of all cells are missing and should be reviewed.`);
  if (dataset.duplicateCount > 0) insights.push(`${dataset.duplicateCount} possible duplicate text records may affect the analysis.`);

  if (workflowResult.mode === "classification") {
    const data = workflowResult.data;
    insights.push(`The baseline model achieved ${Math.round(data.accuracy * 100)}% accuracy on ${data.testSize} held-out records.`);
    if (data.testSize < 10) insights.push("The test set is very small, so the score should be treated as exploratory rather than conclusive.");
    else if (data.accuracy >= 0.8) insights.push("The current labels are reasonably separable; error analysis and cross-validation are the strongest next steps.");
    else insights.push("The baseline indicates a need to review class balance, ambiguous labels, and preprocessing choices.");
    if (dataset.imbalance >= 2) insights.push("The class distribution is imbalanced, which may bias model performance toward the largest class.");
    insights.push(`The workflow used “${textColumn}” as input and “${labelColumn}” as the target label.`);
  } else {
    const data = workflowResult.data;
    insights.push(`${data.tokens.toLocaleString()} tokens and ${data.uniqueTokens.toLocaleString()} unique tokens were identified.`);
    if (data.topWords[0]) insights.push(`The most frequent content word is “${data.topWords[0][0]}” (${data.topWords[0][1]} occurrences).`);
    if (data.topBigrams[0]) insights.push(`The most frequent recurring phrase is “${data.topBigrams[0][0]}” (${data.topBigrams[0][1]} occurrences).`);
    insights.push("The corpus is suitable for forming research questions and inspecting frequent patterns in context.");
  }
  return insights;
}

function createReportHtml(dataset, workflowResult, textColumn, labelColumn) {
  const generated = new Date().toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" });
  const insights = buildInsights(dataset, workflowResult, textColumn, labelColumn);
  const mode = workflowResult.mode === "classification" ? "Text classification" : "Corpus exploration";
  const resultRows = workflowResult.mode === "classification"
    ? `
      <tr><th>Test accuracy</th><td>${Math.round(workflowResult.data.accuracy * 100)}%</td></tr>
      <tr><th>Training records</th><td>${workflowResult.data.trainSize}</td></tr>
      <tr><th>Testing records</th><td>${workflowResult.data.testSize}</td></tr>
      <tr><th>Vocabulary size</th><td>${workflowResult.data.vocabularySize}</td></tr>`
    : `
      <tr><th>Documents</th><td>${workflowResult.data.documents}</td></tr>
      <tr><th>Tokens</th><td>${workflowResult.data.tokens.toLocaleString()}</td></tr>
      <tr><th>Unique tokens</th><td>${workflowResult.data.uniqueTokens.toLocaleString()}</td></tr>
      <tr><th>Average document length</th><td>${workflowResult.data.averageLength.toFixed(1)} tokens</td></tr>`;
  const topPatterns = workflowResult.mode === "classification"
    ? `<p>The baseline used Arabic normalization, tokenization, and multinomial Naive Bayes. Results should be followed by error analysis and cross-validation before formal research claims are made.</p>`
    : `<div class="patterns"><div><h3>Top words</h3><ol>${workflowResult.data.topWords.slice(0, 10).map(([word,count]) => `<li>${escapeHtml(word)} <span>${count}</span></li>`).join("")}</ol></div><div><h3>Recurring phrases</h3><ol>${workflowResult.data.topBigrams.slice(0, 8).map(([phrase,count]) => `<li>${escapeHtml(phrase)} <span>${count}</span></li>`).join("")}</ol></div></div>`;

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>LinguaLab Research Report</title><style>
  :root{font-family:Inter,Arial,sans-serif;color:#18253c;background:#f5f7fb}*{box-sizing:border-box}body{margin:0;padding:40px}.report{max-width:900px;margin:auto;background:white;border:1px solid #e4e8f0;border-radius:24px;padding:44px;box-shadow:0 20px 60px rgba(39,54,87,.10)}.brand{font-weight:900;color:#6151d8}.eyebrow{text-transform:uppercase;letter-spacing:.12em;font-size:11px;color:#7b8799;font-weight:800}.hero{padding-bottom:26px;border-bottom:1px solid #e4e8f0}.hero h1{font-size:42px;letter-spacing:-.04em;margin:10px 0}.hero p{color:#65738a;line-height:1.7}.meta{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:24px 0}.meta div{padding:14px;background:#f7f8fc;border-radius:14px}.meta span{display:block;font-size:10px;color:#8490a2}.meta strong{display:block;margin-top:5px;font-size:13px}section{margin-top:30px}h2{font-size:22px}table{width:100%;border-collapse:collapse}th,td{padding:12px;border-bottom:1px solid #e8ebf2;text-align:left;font-size:13px}th{width:36%;color:#67758a}ul{padding-left:20px;line-height:1.8;color:#46566e}.patterns{display:grid;grid-template-columns:1fr 1fr;gap:18px}.patterns>div{padding:18px;border:1px solid #e4e8f0;border-radius:16px}.patterns ol{padding-left:22px}.patterns li{padding:6px}.patterns span{float:right;font-weight:800}.note{padding:18px;border-radius:15px;background:#17243d;color:#dce3ef;line-height:1.7}.footer{margin-top:38px;padding-top:18px;border-top:1px solid #e4e8f0;color:#8a94a4;font-size:11px}@media print{body{padding:0;background:white}.report{box-shadow:none;border:0;border-radius:0;max-width:none}}@media(max-width:650px){body{padding:14px}.report{padding:24px}.meta,.patterns{grid-template-columns:1fr}.hero h1{font-size:31px}}
  </style></head><body><main class="report"><div class="hero"><div class="brand">LinguaLab</div><p class="eyebrow">AI-assisted Arabic language research report</p><h1>${escapeHtml(dataset.fileName)}</h1><p>This report summarizes the dataset, workflow, results, interpretation, limitations, and recommended next steps generated from the completed LinguaLab analysis.</p></div>
  <div class="meta"><div><span>Generated</span><strong>${escapeHtml(generated)}</strong></div><div><span>Workflow</span><strong>${mode}</strong></div><div><span>Text column</span><strong>${escapeHtml(textColumn)}</strong></div></div>
  <section><h2>Dataset summary</h2><table><tr><th>Records</th><td>${dataset.rows.toLocaleString()}</td></tr><tr><th>Columns</th><td>${dataset.columns}</td></tr><tr><th>Arabic sample</th><td>${Math.round(dataset.arabicRatio * 100)}%</td></tr><tr><th>Missing cells</th><td>${dataset.missingPercent.toFixed(1)}%</td></tr><tr><th>Possible duplicate texts</th><td>${dataset.duplicateCount}</td></tr>${labelColumn ? `<tr><th>Target label</th><td>${escapeHtml(labelColumn)}</td></tr>` : ""}</table></section>
  <section><h2>Method and results</h2><table><tr><th>Analysis mode</th><td>${mode}</td></tr>${resultRows}</table>${topPatterns}</section>
  <section><h2>Key insights</h2><ul>${insights.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>
  <section><h2>Limitations and next steps</h2><div class="note">${workflowResult.mode === "classification" ? "This is an interpretable baseline, not a final research model. Review misclassified examples, apply cross-validation, document annotation quality, and compare with stronger models before reporting definitive findings." : "Frequency does not equal importance. Inspect words and phrases in context, define a focused research question, and combine quantitative patterns with qualitative interpretation."}</div></section>
  <div class="footer">Generated locally by LinguaLab. The uploaded dataset was not sent to a remote server by this prototype.</div></main></body></html>`;
}

export default function WorkspacePage() {
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
  const [selectedTextColumn, setSelectedTextColumn] = useState("");
  const [selectedLabelColumn, setSelectedLabelColumn] = useState("");
  const [reportReady, setReportReady] = useState(false);

  const qualityNotes = useMemo(() => {
    if (!result) return [];
    const notes = [];
    if (result.missingPercent > 0) notes.push(`${result.missingPercent.toFixed(1)}% of cells are missing.`);
    if (result.duplicateCount > 0) notes.push(`${result.duplicateCount} possible duplicate text records detected.`);
    if (result.labelColumn && result.imbalance >= 2) notes.push("The label distribution may be imbalanced.");
    if (!result.textColumn) notes.push("No clear text column was detected. Review column names before analysis.");
    if (notes.length === 0) notes.push("The dataset is structurally ready for the recommended next step.");
    return notes;
  }, [result]);

  function resetWorkspace() {
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
    if (inputRef.current) inputRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function loadDemoDataset() {
    setError("");
    setStatus("reading");
    try {
      const response = await fetch("/sample-datasets/arabic_reviews_demo.csv");
      if (!response.ok) throw new Error("The demo dataset could not be loaded.");
      const blob = await response.blob();
      const file = new File([blob], "arabic_reviews_demo.csv", { type: "text/csv" });
      await processFile(file);
    } catch (err) {
      setStatus("error");
      setError(err.message || "The demo dataset could not be loaded.");
    }
  }

  async function processFile(file) {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setStatus("error");
      setError("Please use a file smaller than 10 MB for this browser-based prototype.");
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
        throw new Error("Legacy .xls files are not supported securely. Please save the file as .xlsx or CSV and upload it again.");
      } else {
        throw new Error("Please upload a CSV, TSV, or XLSX file.");
      }

      if (!parsed.headers.length || !parsed.rows.length) {
        throw new Error("The file does not contain a readable header row and data records.");
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
      setError(err.message || "LinguaLab could not read this file.");
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

  function runWorkflow() {
    if (!selectedTextColumn) return;
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
        setError(err.message || "The workflow could not be completed with this dataset.");
      }
    }, 650);
  }

  function downloadResearchReport() {
    if (!result || !workflowResult) return;
    const html = createReportHtml(result, workflowResult, selectedTextColumn, selectedLabelColumn);
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
        <title>New Workspace — LinguaLab</title>
        <meta name="description" content="Upload and understand an Arabic language dataset in LinguaLab." />
      </Head>

      <main className={styles.page}>
        <nav className={styles.nav}>
          <Link href="/" className={styles.brand}><span>L</span>LinguaLab</Link>
          <div className={styles.stepLabel}>New Arabic language workspace</div>
          {result ? <button type="button" className={styles.navReset} onClick={resetWorkspace}>New analysis</button> : <Link href="/ar-tools" className={styles.navLink}>Browse tools ↗</Link>}
        </nav>

        <section className={styles.hero}>
          <p className={styles.eyebrow}>Step 1 · Understand your data</p>
          <h1>Start with your Arabic dataset.</h1>
          <p>LinguaLab reads the structure locally, identifies likely text and label columns, checks data quality, and recommends a realistic next step.</p>
        </section>

        <div className={styles.journeyBar} aria-label="Analysis progress">
          <div className={styles.journeyActive}><span>1</span><strong>Understand</strong></div>
          <i />
          <div className={workflowOpen ? styles.journeyActive : ""}><span>2</span><strong>Analyze</strong></div>
          <i />
          <div className={workflowStatus === "complete" ? styles.journeyActive : ""}><span>3</span><strong>Report</strong></div>
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
              <h2>{status === "reading" ? "Reading your dataset…" : "Drop a dataset here"}</h2>
              <p>or click to choose CSV, TSV, or XLSX</p>
              <span>Your file is analyzed in your browser for this prototype.</span>
            </div>

            {error && <div className={styles.errorBox} role="alert">{error}</div>}

            {!result && status !== "reading" && (
              <div className={styles.exampleBox}>
                <div><strong>Try it immediately</strong><span>Use our small Arabic reviews dataset, or choose your own file.</span></div>
                <div className={styles.exampleActions}>
                  <button type="button" className={styles.demoButton} onClick={loadDemoDataset}>Try demo dataset</button>
                  <button type="button" onClick={() => inputRef.current?.click()}>Choose file</button>
                </div>
              </div>
            )}

            {preview.length > 0 && result && (
              <div className={styles.previewTableWrap}>
                <div className={styles.panelHeading}><span>Data preview</span><small>First {preview.length} rows</small></div>
                <div className={styles.tableScroller}>
                  <table>
                    <thead><tr>{result.headers.slice(0, 5).map((header) => <th key={header}>{header}</th>)}</tr></thead>
                    <tbody>
                      {preview.map((row, rowIndex) => (
                        <tr key={rowIndex}>{result.headers.slice(0, 5).map((header) => <td key={header}>{String(row[header] ?? "").slice(0, 80)}</td>)}</tr>
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
                <p className={styles.eyebrow}>Dataset understanding</p>
                <h2>Your findings will appear here.</h2>
                <p>Upload a file to reveal its structure, Arabic-language content, data-quality signals, and recommended workflow.</p>
                <div className={styles.placeholderList}><span /><span /><span /><span /></div>
              </div>
            ) : (
              <div className={styles.results}>
                <div className={styles.resultHeader}>
                  <div className={styles.aiOrb}>✦</div>
                  <div><p className={styles.eyebrow}>Dataset understood</p><h2>Here&apos;s what LinguaLab found.</h2></div>
                </div>

                <div className={styles.fileLine}><span>{result.fileName}</span><strong>{result.rows.toLocaleString()} records</strong></div>

                <div className={styles.metricGrid}>
                  <article><span>Language</span><strong>{result.arabicRatio >= 0.5 ? "Arabic detected" : "Mixed / review"}</strong><small>{Math.round(result.arabicRatio * 100)}% Arabic sample</small></article>
                  <article><span>Structure</span><strong>{result.columns} columns</strong><small>{result.rows.toLocaleString()} data rows</small></article>
                  <article><span>Text column</span><strong>{result.textColumn || "Review needed"}</strong><small>Best detected input</small></article>
                  <article><span>Label column</span><strong>{result.labelColumn || "Not detected"}</strong><small>{result.labelColumn ? "Classification possible" : "Explore first"}</small></article>
                </div>

                <div className={styles.qualityBox}>
                  <div className={styles.panelHeading}><span>Quality notes</span><small>{result.missingPercent.toFixed(1)}% missing</small></div>
                  <ul>{qualityNotes.map((note) => <li key={note}>{note}</li>)}</ul>
                </div>

                {result.labelDistribution.length > 0 && (
                  <div className={styles.distributionBox}>
                    <div className={styles.panelHeading}><span>Label distribution</span><small>Top classes</small></div>
                    {result.labelDistribution.map(([label, count]) => {
                      const max = result.labelDistribution[0][1];
                      return <div className={styles.barRow} key={label}><span>{label}</span><div><i style={{ width: `${(count / max) * 100}%` }} /></div><strong>{count}</strong></div>;
                    })}
                  </div>
                )}

                <div className={styles.recommendation}>
                  <p className={styles.eyebrow}>Recommended next step</p>
                  <span className={styles.workflowTag}>{result.recommendation.type}</span>
                  <h3>{result.recommendation.title}</h3>
                  <p>{result.recommendation.description}</p>
                  <button type="button" onClick={openWorkflow}>{result.labelColumn ? "Build guided workflow" : "Explore this corpus"} →</button>
                </div>
              </div>
            )}
          </aside>
        </section>

        {result && workflowOpen && (
          <section className={styles.workflowSection} id="guided-workflow">
            <div className={styles.workflowHeader}>
              <div>
                <p className={styles.eyebrow}>Step 2 · Build and run</p>
                <h2>{selectedLabelColumn ? "Configure a text-classification workflow." : "Configure a corpus-exploration workflow."}</h2>
                <p>LinguaLab uses the columns it detected, but keeps you in control before analysis begins.</p>
              </div>
              <div className={styles.progressSteps}><span className={styles.activeStep}>1</span><i /><span className={workflowStatus !== "configure" ? styles.activeStep : ""}>2</span><i /><span className={workflowStatus === "complete" ? styles.activeStep : ""}>3</span></div>
            </div>

            <div className={styles.workflowGrid}>
              <div className={styles.configCard}>
                <div className={styles.panelHeading}><span>Workflow configuration</span><small>Editable</small></div>
                <label>Text column<select value={selectedTextColumn} onChange={(event) => setSelectedTextColumn(event.target.value)}>{result.headers.map((header) => <option key={header} value={header}>{header}</option>)}</select></label>
                <label>Target label (optional)<select value={selectedLabelColumn} onChange={(event) => setSelectedLabelColumn(event.target.value)}><option value="">No label — explore corpus</option>{result.headers.filter((header) => header !== selectedTextColumn).map((header) => <option key={header} value={header}>{header}</option>)}</select></label>
                <div className={styles.pipelinePreview}>
                  <span>Pipeline</span>
                  <div><b>Normalize Arabic</b><em>→</em><b>{selectedLabelColumn ? "Tokenize" : "Count patterns"}</b><em>→</em><b>{selectedLabelColumn ? "Naive Bayes baseline" : "Corpus insights"}</b></div>
                </div>
                <button className={styles.runButton} type="button" onClick={runWorkflow} disabled={workflowStatus === "running"}>{workflowStatus === "running" ? "Running analysis…" : "Run workflow"}</button>
                <small className={styles.localNote}>This prototype runs locally in your browser. No dataset upload is required.</small>
              </div>

              <div className={styles.outputCard} aria-live="polite">
                {workflowStatus !== "complete" ? (
                  <div className={styles.outputEmpty}><div className={styles.aiOrb}>✦</div><h3>{workflowStatus === "running" ? "Building your results…" : "Your analysis will appear here."}</h3><p>{workflowStatus === "running" ? "Normalizing Arabic text, preparing the workflow, and calculating interpretable results." : "Review the detected columns, then run the guided workflow."}</p></div>
                ) : workflowResult.mode === "classification" ? (
                  <div className={styles.workflowResults}>
                    <p className={styles.eyebrow}>Baseline complete</p><h3>{Math.round(workflowResult.data.accuracy * 100)}% test accuracy</h3>
                    <div className={styles.resultStats}><article><span>Training</span><strong>{workflowResult.data.trainSize}</strong></article><article><span>Testing</span><strong>{workflowResult.data.testSize}</strong></article><article><span>Vocabulary</span><strong>{workflowResult.data.vocabularySize}</strong></article></div>
                    <div className={styles.matrixWrap}><div className={styles.panelHeading}><span>Confusion matrix</span><small>Actual × predicted</small></div><table><thead><tr><th></th>{workflowResult.data.labels.map((label)=><th key={label}>{label}</th>)}</tr></thead><tbody>{workflowResult.data.labels.map((label,rowIndex)=><tr key={label}><th>{label}</th>{workflowResult.data.confusion[rowIndex].map((value,colIndex)=><td key={workflowResult.data.labels[colIndex]}>{value}</td>)}</tr>)}</tbody></table></div>
                    <div className={styles.interpretation}><strong>LinguaLab interpretation</strong><p>{workflowResult.data.testSize < 10 ? "This dataset is small, so the score is only a baseline signal. Add more labeled examples before drawing research conclusions." : workflowResult.data.accuracy >= .8 ? "The baseline separates the current labels well. The next useful step is error analysis and cross-validation." : "The baseline needs improvement. Review label balance, ambiguous examples, and text normalization before trying a more complex model."}</p></div>
                  </div>
                ) : (
                  <div className={styles.workflowResults}>
                    <p className={styles.eyebrow}>Corpus explored</p><h3>{workflowResult.data.tokens.toLocaleString()} tokens analyzed</h3>
                    <div className={styles.resultStats}><article><span>Documents</span><strong>{workflowResult.data.documents}</strong></article><article><span>Unique tokens</span><strong>{workflowResult.data.uniqueTokens}</strong></article><article><span>Avg. length</span><strong>{workflowResult.data.averageLength.toFixed(1)}</strong></article></div>
                    <div className={styles.termGrid}><div><strong>Top words</strong>{workflowResult.data.topWords.slice(0,8).map(([word,count])=><span key={word}>{word}<em>{count}</em></span>)}</div><div><strong>Recurring phrases</strong>{workflowResult.data.topBigrams.slice(0,6).map(([phrase,count])=><span key={phrase}>{phrase}<em>{count}</em></span>)}</div></div>
                    <div className={styles.interpretation}><strong>LinguaLab interpretation</strong><p>The corpus is ready for close exploration. Use the frequent words and recurring phrases to form a research question, then inspect them in context.</p></div>
                  </div>
                )}
              </div>
            </div>

            {workflowStatus === "complete" && workflowResult && reportReady && (
              <div className={styles.reportCard}>
                <div>
                  <p className={styles.eyebrow}>Step 3 · Interpret and report</p>
                  <h3>Your research-ready report is prepared.</h3>
                  <p>LinguaLab has converted the completed workflow into a structured report with dataset context, method, results, key insights, limitations, and recommended next steps.</p>
                  <div className={styles.insightChips}>{buildInsights(result, workflowResult, selectedTextColumn, selectedLabelColumn).slice(0, 3).map((item) => <span key={item}>{item}</span>)}</div>
                </div>
                <div className={styles.reportActions}>
                  <button type="button" onClick={downloadResearchReport}>Download research report</button>
                  <small>HTML · Open in any browser · Print or save as PDF</small>
                </div>
              </div>
            )}
          </section>
        )}

      </main>
    </>
  );
}

import Link from "next/link";
import { useRef, useState } from "react";
import Layout from "../../components/Layout";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const PREVIEW_ROW_LIMIT = 15;
const SUPPORTED_EXTENSIONS = new Set(["xlsx", "xls", "csv"]);

function getExtension(fileName) {
  return fileName.split(".").pop()?.toLowerCase() || "";
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatCellValue(value) {
  if (value === null || value === undefined) return "—";
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? "Invalid date" : value.toISOString().slice(0, 10);
  }
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "—";
  if (typeof value === "string") {
    const clean = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
    return clean.length > 500 ? `${clean.slice(0, 497)}…` : clean || "—";
  }
  return String(value).slice(0, 500);
}

function createHeaders(headerRow, columnCount) {
  const seen = new Map();
  return Array.from({ length: columnCount }, (_, index) => {
    const raw = formatCellValue(headerRow?.[index]);
    const base = raw === "—" ? `Column ${index + 1}` : raw;
    const count = (seen.get(base) || 0) + 1;
    seen.set(base, count);
    return count === 1 ? base : `${base} (${count})`;
  });
}

function summarizeSheet(workbook, sheetName, XLSX) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return { headers: [], previewRows: [], rowCount: 0, columnCount: 0, empty: true };

  const matrix = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: true,
    defval: null,
    blankrows: false,
  });

  const columnCount = matrix.reduce((largest, row) => Math.max(largest, row.length), 0);
  if (!matrix.length || !columnCount) {
    return { headers: [], previewRows: [], rowCount: 0, columnCount: 0, empty: true };
  }

  const headers = createHeaders(matrix[0], columnCount);
  const dataRows = matrix.slice(1);
  const previewRows = dataRows.slice(0, PREVIEW_ROW_LIMIT).map((row) =>
    headers.map((_, index) => formatCellValue(row[index]))
  );

  return {
    headers,
    previewRows,
    rowCount: dataRows.length,
    columnCount,
    empty: dataRows.length === 0,
  };
}

export default function ExcelTool() {
  const inputRef = useRef(null);
  const workbookRef = useRef(null);
  const parserRef = useRef(null);
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState("");
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [sheetSummary, setSheetSummary] = useState(null);
  const [status, setStatus] = useState("empty");
  const [error, setError] = useState("");

  const resetTool = () => {
    workbookRef.current = null;
    parserRef.current = null;
    setFile(null);
    setFileType("");
    setSheetNames([]);
    setSelectedSheet("");
    setSheetSummary(null);
    setStatus("empty");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const parseFile = async (uploadedFile) => {
    if (!uploadedFile) return;

    const extension = getExtension(uploadedFile.name);
    if (!SUPPORTED_EXTENSIONS.has(extension)) {
      resetTool();
      setStatus("error");
      setError("Unsupported format. Upload an .xlsx, .xls, or .csv file.");
      return;
    }
    if (uploadedFile.size > MAX_FILE_SIZE) {
      resetTool();
      setStatus("error");
      setError("This file is larger than the 10 MB demo limit.");
      return;
    }
    if (uploadedFile.size === 0) {
      resetTool();
      setStatus("error");
      setError("The selected file is empty.");
      return;
    }

    setStatus("loading");
    setError("");
    setSheetSummary(null);

    try {
      const XLSX = await import("xlsx");
      const buffer = await uploadedFile.arrayBuffer();
      const workbook = XLSX.read(buffer, {
        type: "array",
        cellDates: true,
        dense: true,
      });
      const names = workbook.SheetNames || [];

      if (!names.length) throw new Error("The workbook does not contain any readable sheets.");

      const firstSheet = names[0];
      workbookRef.current = workbook;
      parserRef.current = XLSX;
      setFile(uploadedFile);
      setFileType(extension === "csv" ? "CSV" : extension.toUpperCase());
      setSheetNames(names);
      setSelectedSheet(firstSheet);
      setSheetSummary(summarizeSheet(workbook, firstSheet, XLSX));
      setStatus("ready");
    } catch (parseError) {
      resetTool();
      setStatus("error");
      setError(
        parseError?.message === "The workbook does not contain any readable sheets."
          ? parseError.message
          : "This spreadsheet is malformed, encrypted, or unreadable. Please verify the file and try again."
      );
    }
  };

  const handleUpload = (event) => {
    parseFile(event.target.files?.[0]);
  };

  const handleSheetChange = (event) => {
    const nextSheet = event.target.value;
    setSelectedSheet(nextSheet);
    setSheetSummary(summarizeSheet(workbookRef.current, nextSheet, parserRef.current));
  };

  const handleDownload = () => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = file.name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return (
    <Layout title="Spreadsheet Explorer">
      <div style={styles.page}>
        <p style={styles.intro}>
          Preview and understand research datasets before deeper analysis. Files are parsed locally
          in your browser and raw spreadsheet data is never uploaded to an API.
        </p>

        <section style={styles.uploadCard}>
          <div>
            <p style={styles.eyebrow}>LOCAL DATA PREVIEW</p>
            <h2 style={styles.cardTitle}>Open a research spreadsheet</h2>
            <p style={styles.cardText}>Supports XLSX, XLS, and CSV files up to 10 MB.</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleUpload}
            style={styles.fileInput}
            disabled={status === "loading"}
          />
        </section>

        {status === "empty" && (
          <div style={styles.emptyState}>
            <span aria-hidden="true" style={styles.emptyIcon}>▦</span>
            <strong>No spreadsheet selected</strong>
            <span>Upload a file to inspect its sheets, dimensions, columns, and sample rows.</span>
          </div>
        )}

        {status === "loading" && (
          <div role="status" aria-live="polite" style={styles.loadingState}>
            <span style={styles.spinner} />
            <div><strong>Reading spreadsheet locally…</strong><span style={styles.loadingText}> Large workbooks may take a moment.</span></div>
          </div>
        )}

        {status === "error" && (
          <div role="alert" style={styles.errorState}>
            <strong>Spreadsheet could not be opened</strong>
            <span>{error}</span>
            <button type="button" onClick={() => inputRef.current?.click()} style={styles.errorButton}>Choose another file</button>
          </div>
        )}

        {status === "ready" && file && sheetSummary && (
          <>
            <section style={styles.detailsCard}>
              <div style={styles.detailsHeader}>
                <div>
                  <p style={styles.eyebrow}>DATASET OVERVIEW</p>
                  <h2 style={styles.cardTitle}>{file.name}</h2>
                </div>
                <div style={styles.actions}>
                  <button type="button" onClick={handleDownload} style={styles.primaryButton}>Download original</button>
                  <button type="button" onClick={() => inputRef.current?.click()} style={styles.secondaryButton}>Upload another</button>
                  <button type="button" onClick={resetTool} style={styles.removeButton}>Remove file</button>
                </div>
              </div>

              <div style={styles.metricsGrid}>
                <Metric label="File size" value={formatFileSize(file.size)} />
                <Metric label="File type" value={fileType} />
                <Metric label="Sheets" value={String(sheetNames.length)} />
                <Metric label="Rows" value={sheetSummary.empty ? "0" : sheetSummary.rowCount.toLocaleString()} />
                <Metric label="Columns" value={sheetSummary.columnCount.toLocaleString()} />
              </div>

              <div style={styles.sheetControl}>
                <label htmlFor="sheet-selector" style={styles.label}>Selected sheet</label>
                <select id="sheet-selector" value={selectedSheet} onChange={handleSheetChange} style={styles.select}>
                  {sheetNames.map((name) => <option key={name}>{name}</option>)}
                </select>
                <p style={styles.sheetNames}><strong>Workbook sheets:</strong> {sheetNames.join(", ")}</p>
              </div>
            </section>

            {sheetSummary.empty ? (
              <div style={styles.emptySheet}>
                <strong>This sheet has no data rows.</strong>
                <span>Select another sheet or upload a different workbook.</span>
              </div>
            ) : (
              <section style={styles.previewCard}>
                <div style={styles.previewHeader}>
                  <div>
                    <p style={styles.eyebrow}>BOUNDED PREVIEW</p>
                    <h2 style={styles.cardTitle}>First {Math.min(PREVIEW_ROW_LIMIT, sheetSummary.rowCount)} rows</h2>
                  </div>
                  <span style={styles.previewNote}>Preview only — the original file is unchanged.</span>
                </div>

                <div style={styles.columnList}>
                  <strong>Columns</strong>
                  <div style={styles.chips}>{sheetSummary.headers.map((header) => <span key={header} style={styles.chip}>{header}</span>)}</div>
                </div>

                <div style={styles.tableScroller}>
                  <table style={styles.table}>
                    <thead><tr>{sheetSummary.headers.map((header) => <th key={header} style={styles.th}>{header}</th>)}</tr></thead>
                    <tbody>
                      {sheetSummary.previewRows.map((row, rowIndex) => (
                        <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={`${rowIndex}-${cellIndex}`} style={styles.td}>{cell}</td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            <section style={styles.ctaCard}>
              <div>
                <p style={styles.eyebrow}>READY FOR DEEPER ANALYSIS?</p>
                <h2 style={styles.ctaTitle}>Continue in the LinguaLab Workspace</h2>
                <p style={styles.cardText}>Inspect language coverage, missing values, duplicates, labels, and recommended research workflows.</p>
              </div>
              <Link href="/workspace" style={styles.ctaButton}>Open Workspace →</Link>
            </section>
          </>
        )}
      </div>
    </Layout>
  );
}

function Metric({ label, value }) {
  return <div style={styles.metric}><span style={styles.metricLabel}>{label}</span><strong style={styles.metricValue}>{value}</strong></div>;
}

const styles = {
  page: { direction: "ltr", textAlign: "left", minWidth: 0 },
  intro: { color: "#667085", lineHeight: 1.8, margin: "0 0 22px", maxWidth: "820px" },
  uploadCard: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px", flexWrap: "wrap", padding: "24px", marginBottom: "22px", backgroundColor: "#fff", border: "1px solid #e4e7ec", borderRadius: "22px", boxShadow: "0 12px 34px rgba(15,23,42,.06)" },
  eyebrow: { margin: "0 0 7px", color: "#6366f1", fontSize: "11px", letterSpacing: ".1em", fontWeight: 800 },
  cardTitle: { margin: 0, color: "#111827", fontSize: "22px", lineHeight: 1.3, overflowWrap: "anywhere" },
  cardText: { margin: "8px 0 0", color: "#667085", lineHeight: 1.7 },
  fileInput: { maxWidth: "100%", padding: "10px", border: "1px solid #d0d5dd", borderRadius: "12px", backgroundColor: "#f9fafb", color: "#344054" },
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "34px 22px", color: "#667085", textAlign: "center", border: "1px dashed #cbd5e1", borderRadius: "18px", backgroundColor: "#f8fafc" },
  emptyIcon: { fontSize: "30px", color: "#6366f1" },
  loadingState: { display: "flex", alignItems: "center", gap: "12px", padding: "20px", border: "1px solid #dddff7", borderRadius: "16px", backgroundColor: "#f5f3ff", color: "#344054" },
  loadingText: { color: "#667085" },
  spinner: { width: "18px", height: "18px", border: "3px solid #c7d2fe", borderTopColor: "#4f46e5", borderRadius: "50%" },
  errorState: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "8px", padding: "18px", border: "1px solid #fecdca", borderRadius: "16px", backgroundColor: "#fef3f2", color: "#b42318" },
  errorButton: { marginTop: "4px", padding: "9px 13px", border: "1px solid #fda29b", borderRadius: "10px", backgroundColor: "#fff", color: "#b42318", cursor: "pointer", fontWeight: 700 },
  detailsCard: { padding: "24px", marginBottom: "22px", backgroundColor: "#fff", border: "1px solid #e4e7ec", borderRadius: "22px", boxShadow: "0 12px 34px rgba(15,23,42,.06)" },
  detailsHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "18px", flexWrap: "wrap", marginBottom: "20px" },
  actions: { display: "flex", gap: "9px", flexWrap: "wrap" },
  primaryButton: { padding: "10px 14px", border: "none", borderRadius: "11px", backgroundColor: "#111827", color: "#fff", cursor: "pointer", fontWeight: 800 },
  secondaryButton: { padding: "10px 14px", border: "1px solid #d0d5dd", borderRadius: "11px", backgroundColor: "#fff", color: "#344054", cursor: "pointer", fontWeight: 700 },
  removeButton: { padding: "10px 14px", border: "1px solid #fecdca", borderRadius: "11px", backgroundColor: "#fff", color: "#b42318", cursor: "pointer", fontWeight: 700 },
  metricsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px", marginBottom: "20px" },
  metric: { display: "flex", flexDirection: "column", gap: "5px", minHeight: "68px", padding: "14px", border: "1px solid #e4e7ec", borderRadius: "14px", backgroundColor: "#f8fafc" },
  metricLabel: { color: "#667085", fontSize: "12px", fontWeight: 700 },
  metricValue: { color: "#111827", fontSize: "18px" },
  sheetControl: { paddingTop: "18px", borderTop: "1px solid #eaecf0" },
  label: { display: "block", marginBottom: "7px", color: "#344054", fontSize: "14px", fontWeight: 700 },
  select: { width: "100%", maxWidth: "420px", padding: "12px 13px", border: "1px solid #d0d5dd", borderRadius: "12px", backgroundColor: "#f9fafb", color: "#111827" },
  sheetNames: { margin: "10px 0 0", color: "#667085", fontSize: "13px", lineHeight: 1.7, overflowWrap: "anywhere" },
  emptySheet: { display: "flex", flexDirection: "column", gap: "6px", padding: "22px", marginBottom: "22px", border: "1px dashed #cbd5e1", borderRadius: "16px", backgroundColor: "#f8fafc", color: "#667085" },
  previewCard: { minWidth: 0, padding: "24px", marginBottom: "22px", backgroundColor: "#fff", border: "1px solid #e4e7ec", borderRadius: "22px", boxShadow: "0 12px 34px rgba(15,23,42,.06)" },
  previewHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "14px", flexWrap: "wrap", marginBottom: "18px" },
  previewNote: { color: "#667085", fontSize: "12px" },
  columnList: { marginBottom: "16px", color: "#344054", fontSize: "14px" },
  chips: { display: "flex", gap: "7px", flexWrap: "wrap", marginTop: "9px" },
  chip: { maxWidth: "100%", padding: "6px 9px", borderRadius: "999px", backgroundColor: "#eef2ff", color: "#4338ca", fontSize: "12px", overflowWrap: "anywhere" },
  tableScroller: { width: "100%", maxWidth: "100%", overflowX: "auto", border: "1px solid #e4e7ec", borderRadius: "14px" },
  table: { width: "100%", minWidth: "640px", borderCollapse: "collapse", fontSize: "13px" },
  th: { position: "sticky", top: 0, padding: "12px", borderBottom: "1px solid #d0d5dd", backgroundColor: "#f1f5f9", color: "#344054", textAlign: "left", whiteSpace: "nowrap" },
  td: { maxWidth: "320px", padding: "11px 12px", borderBottom: "1px solid #eaecf0", color: "#475467", verticalAlign: "top", whiteSpace: "pre-wrap", overflowWrap: "anywhere" },
  ctaCard: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "18px", flexWrap: "wrap", padding: "22px", border: "1px solid #dddff7", borderRadius: "20px", background: "linear-gradient(135deg,#eef2ff 0%,#faf5ff 100%)" },
  ctaTitle: { margin: 0, color: "#111827", fontSize: "20px" },
  ctaButton: { display: "inline-block", padding: "11px 16px", borderRadius: "12px", backgroundColor: "#4f46e5", color: "#fff", textDecoration: "none", fontWeight: 800 },
};

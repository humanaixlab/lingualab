import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildReportExportModel, createDocxBlob, figureToSvg, tablesToCsv } from "../lib/report-export.js";

const source = readFileSync(new URL("../pages/research-report.js", import.meta.url), "utf8");

test("PDF and DOCX are available for a real report without adding export persistence", () => {
  assert.match(source, /onClick=\{printReport\}>\{exportCopy\.pdf\}/);
  assert.match(source, /onClick=\{exportDocx\}>\{exportCopy\.docx\}/);
  assert.match(source, /hasReportData && \(/);
  assert.doesNotMatch(source, /sessionStorage\.setItem\([^)]*export|localStorage\.setItem\([^)]*export|REPORT_EXPORT_KEY/);
});

test("figure and data exports are exposed only when real derived data exists", () => {
  const empty = buildReportExportModel({ context: { analysisType: "methodology", payload: { workflow: ["Review"] } } });
  assert.deepEqual(empty, { figures: [], tables: [], hasFigures: false, hasData: false });

  const frequency = buildReportExportModel({
    context: { analysisType: "frequency", payload: { frequencies: [["term", 4], ["pattern", 2]] } },
    language: "en",
  });
  assert.equal(frequency.hasFigures, true);
  assert.equal(frequency.hasData, true);
  assert.equal(frequency.figures.length, 1);
  assert.deepEqual(frequency.tables[0].rows, [["term", 4], ["pattern", 2]]);

  assert.match(source, /exportModel\.hasFigures &&/);
  assert.match(source, /exportModel\.hasData &&/);
});

test("PNG and SVG use only an existing figure model", () => {
  const emptySvg = figureToSvg({ type: "bar", entries: [] }, "en");
  assert.equal(emptySvg, "");
  const svg = figureToSvg({ type: "bar", title: "Observed frequency", entries: [["actual", 3]] }, "en");
  assert.match(svg, /^<svg/);
  assert.match(svg, /Observed frequency/);
  assert.match(svg, />actual</);
  assert.match(svg, />3</);
  assert.doesNotMatch(svg, /invented|generatedChartData/);
  assert.match(source, /if \(!svg\) return/);
  assert.match(source, /image\/png/);
  assert.match(source, /image\/svg\+xml/);
});

test("CSV and XLSX are built only from report tables", () => {
  const contexts = buildReportExportModel({
    context: { analysisType: "concordance", payload: { contexts: ["left target right"] } },
    language: "en",
  });
  assert.equal(contexts.hasFigures, false);
  assert.equal(contexts.hasData, true);
  assert.deepEqual(contexts.tables[0].rows, [[1, "left target right"]]);
  assert.match(tablesToCsv(contexts.tables), /Number,Context\r\n1,left target right/);
  assert.match(source, /await import\("xlsx"\)/);
  assert.match(source, /exportModel\.tables\.forEach/);
});

test("DOCX output is a real OOXML package with the selected direction and unchanged text", async () => {
  const blob = createDocxBlob("تقرير", ["TF-IDF واسم_العمود"], "ar");
  assert.equal(blob.type, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  const bytes = new Uint8Array(await blob.arrayBuffer());
  assert.deepEqual(Array.from(bytes.slice(0, 4)), [0x50, 0x4b, 0x03, 0x04]);
  const content = new TextDecoder().decode(bytes);
  assert.match(content, /word\/document\.xml/);
  assert.match(content, /<w:bidi\/>/);
  assert.match(content, /IBM Plex Sans Arabic/);
  assert.match(content, /TF-IDF واسم_العمود/);
});

test("export model excludes raw dataset and file fields", () => {
  const model = buildReportExportModel({
    context: { analysisType: "frequency", payload: { frequencies: [["safe", 2]], rawRows: [{ secret: true }], text: "raw dataset", file: "raw.csv" } },
  });
  const serialized = JSON.stringify(model);
  assert.doesNotMatch(serialized, /secret|raw dataset|raw\.csv|rawRows/);
  assert.match(source, /clone\.querySelectorAll\("\.viewTabs, \.reportFooter, \.sourceDetails"\)/);
});

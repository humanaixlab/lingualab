import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import readXlsxFile from "read-excel-file/node";
import { INCLUDED_DATASETS } from "../lib/platform-inventory.js";

const publicCsvPath = new URL("../public/sample-datasets/arabic_reviews_demo.csv", import.meta.url);
const sourceCsvPath = new URL("../sample-datasets/arabic_reviews_demo.csv", import.meta.url);
const xlsxPath = new URL("../public/sample-datasets/arabic_reviews_demo.xlsx", import.meta.url);
const documentation = fs.readFileSync(new URL("../sample-datasets/README.md", import.meta.url), "utf8");

function csvRows(path) {
  return fs.readFileSync(path, "utf8").trim().split(/\r?\n/).map((line) => line.split(","));
}

test("all demo formats contain the same synthetic records and preserved schema", async () => {
  const publicRows = csvRows(publicCsvPath);
  const sourceRows = csvRows(sourceCsvPath);
  const workbook = await readXlsxFile(xlsxPath);
  const workbookRows = Array.isArray(workbook[0]?.data) ? workbook[0].data : workbook;
  assert.deepEqual(publicRows[0], ["text", "label"]);
  assert.equal(publicRows.length, 31);
  assert.deepEqual(sourceRows, publicRows);
  assert.deepEqual(workbookRows, publicRows);
  assert.deepEqual(Object.fromEntries(["إيجابي", "محايد", "سلبي"].map((label) => [label, publicRows.slice(1).filter((row) => row[1] === label).length])), { إيجابي: 10, محايد: 10, سلبي: 10 });
});

test("demo data has explicit synthetic provenance and redistribution clearance", () => {
  assert.match(documentation, /fully synthetic Arabic records generated specifically for LinguaLab/i);
  assert.match(documentation, /do not contain real user data/i);
  assert.match(documentation, /not scraped, copied from reviews, or derived from an external dataset/i);
  assert.match(documentation, /publicly redistributed/i);
  assert.equal(INCLUDED_DATASETS[0].license.status, "project-owned-cleared-for-redistribution");
});

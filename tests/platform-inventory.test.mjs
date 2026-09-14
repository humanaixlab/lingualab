import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { ACTIVE_TOOLS, FUTURE_PLAN_ARCHITECTURE, INCLUDED_DATASETS, PROJECT_OUTPUT_TYPES, RESEARCH_AREAS, USER_ACTIVITY_ARCHITECTURE, getPlatformInventorySummary } from "../lib/platform-inventory.js";
import { PROJECT_CATALOG } from "../lib/project-catalog.js";

const page = fs.readFileSync(new URL("../pages/platform-inventory.js", import.meta.url), "utf8");

test("inventory reports exact active routes and canonical research areas", () => {
  assert.equal(ACTIVE_TOOLS.length, 17);
  assert.equal(new Set(ACTIVE_TOOLS.map((tool) => tool.route)).size, ACTIVE_TOOLS.length);
  for (const tool of ACTIVE_TOOLS) assert.ok(fs.existsSync(new URL(`../pages${tool.route}.js`, import.meta.url)), tool.route);
  assert.equal(RESEARCH_AREAS.filter((area) => area.kind === "linguistic").length, 4);
  assert.equal(RESEARCH_AREAS.filter((area) => area.kind === "computational").length, 3);
});

test("project and dataset counts are derived from current inventories", () => {
  const summary = getPlatformInventorySummary();
  assert.equal(summary.projectRecords, PROJECT_CATALOG.length);
  assert.equal(summary.projectRecords, 30);
  assert.deepEqual(PROJECT_OUTPUT_TYPES.map((type) => type.id), ["paper", "corpus", "dataset", "benchmark", "prototype"]);
  assert.equal(summary.includedDatasets, 1);
  assert.equal(summary.includedDatasetFiles, 3);
  for (const dataset of INCLUDED_DATASETS) for (const file of dataset.files) assert.ok(fs.existsSync(new URL(`../${file}`, import.meta.url)), file);
});

test("every included dataset discloses source and license status", () => {
  for (const dataset of INCLUDED_DATASETS) {
    assert.ok(dataset.source.en && dataset.source.ar);
    assert.ok(dataset.license.en && dataset.license.ar && dataset.license.status);
  }
  assert.match(page, /dataset\.license\[locale\]/);
});

test("activity values and commercial plans remain disabled", () => {
  assert.equal(USER_ACTIVITY_ARCHITECTURE.enabled, false);
  assert.equal(USER_ACTIVITY_ARCHITECTURE.values, null);
  assert.equal(FUTURE_PLAN_ARCHITECTURE.enabled, false);
  assert.equal(FUTURE_PLAN_ARCHITECTURE.paymentsEnabled, false);
  assert.ok(FUTURE_PLAN_ARCHITECTURE.plans.every((plan) => plan.price === null));
  assert.doesNotMatch(page, /from ["']stripe|fetch\([^\n]+checkout|paymentIntent|userCount\s*[:=]\s*\d/i);
});

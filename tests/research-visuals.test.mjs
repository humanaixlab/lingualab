import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const ROOT = new URL("../", import.meta.url);
const source = (path) => fs.readFileSync(new URL(path, ROOT), "utf8");

test("visualization recommendations require actual justified data", async () => {
  const { recommendResearchVisualizations } = await import("../lib/visualization-recommendation.js");
  assert.deepEqual(recommendResearchVisualizations({}), ["none"]);
  assert.deepEqual(recommendResearchVisualizations({ metrics: [{ label: "Accuracy", value: 0 }] }), ["summary-cards"]);
  assert.deepEqual(recommendResearchVisualizations({ quantitativeType: "frequency", chartData: [] }), ["none"]);
  assert.deepEqual(recommendResearchVisualizations({ quantitativeType: "frequency", chartData: [{ label: "word", value: 4 }] }), ["chart"]);
  assert.deepEqual(recommendResearchVisualizations({ structureType: "workflow", diagram: { nodes: [{ id: "a" }], relations: [] } }), ["none"]);
  assert.deepEqual(recommendResearchVisualizations({ structureType: "workflow", diagram: { nodes: [{ id: "a" }], relations: [{ from: "a", to: "a" }] } }), ["diagram"]);
  assert.deepEqual(recommendResearchVisualizations({ conceptMap: { aiSupported: false, nodes: [{ label: "Finding" }] } }), ["none"]);
  assert.deepEqual(recommendResearchVisualizations({ conceptMap: { aiSupported: true, nodes: [{ label: "Finding" }] } }), ["concept-map"]);
});

test("summary cards and charts suppress missing or invalid values", () => {
  const cards = source("components/research-report/SummaryCards.js");
  const chart = source("components/research-report/ResearchChart.js");
  assert.match(cards, /typeof metric\.value === "number" && Number\.isFinite/);
  assert.match(cards, /if \(!available\.length\) return null/);
  assert.match(chart, /if \(!entries\.length\) return null/);
  assert.doesNotMatch(`${cards}${chart}`, /Math\.random|fallbackValue|defaultValue/);
});

test("structural diagrams only render supplied valid relations", () => {
  const diagram = source("components/research-report/StructuralDiagram.js");
  assert.match(diagram, /nodeIds\.has\(relation\.from\) && nodeIds\.has\(relation\.to\)/);
  assert.match(diagram, /if \(!validNodes\.length \|\| !validRelations\.length\) return null/);
});

test("concept maps are explicitly separated from measured evidence", () => {
  const map = source("components/research-report/ConceptMap.js");
  assert.match(map, /AI-supported interpretation/);
  assert.match(map, /تفسير مدعوم بالذكاء الاصطناعي/);
  assert.match(map, /not measured evidence/);
  assert.match(map, /ليست دليلًا مقاسًا/);
});

test("result layers distinguish measured, AI, and researcher-approved content", () => {
  const layers = source("components/research-report/ResearchResultLayers.js");
  for (const label of ["Measured / Computed Results", "AI-supported Interpretation", "Researcher-approved Notes / Final Decisions", "نتائج مقاسة / محسوبة", "ملاحظات معتمدة من الباحث / قرارات نهائية"])
    assert.match(layers, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("visual report layer stays independent from projects, storage, APIs, and hidden tools", () => {
  const files = [
    "components/research-report/SummaryCards.js",
    "components/research-report/ResearchChart.js",
    "components/research-report/StructuralDiagram.js",
    "components/research-report/ConceptMap.js",
    "components/research-report/ResearchResultLayers.js",
    "lib/visualization-recommendation.js",
  ].map(source).join("\n");
  assert.doesNotMatch(files, /projectId|localStorage|sessionStorage|fetch\(|\/api\/|research-preview/);
});

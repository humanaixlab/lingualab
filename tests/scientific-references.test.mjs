import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  MAX_RESEARCHER_REFERENCES_PER_PATH,
  SCIENTIFIC_FOUNDATIONS,
  SCIENTIFIC_REFERENCE_STORAGE_KEY,
  normalizeResearcherReference,
  readScientificReferenceState,
  saveScientificReferenceState,
} from "../lib/scientific-references.js";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), values };
}

test("seven paths expose exactly three clearly unverified platform placeholders", () => {
  assert.deepEqual(Object.keys(SCIENTIFIC_FOUNDATIONS), ["corpus-linguistics", "morphology-syntax", "semantics", "discourse-pragmatics", "text-classification", "information-extraction", "nlp-experiments"]);
  for (const foundation of Object.values(SCIENTIFIC_FOUNDATIONS)) {
    assert.equal(foundation.platformReferences.length, 3);
    for (const reference of foundation.platformReferences) {
      assert.equal(reference.isPlaceholder, true);
      assert.equal(reference.verified, false);
      assert.equal(reference.doiOrUrl, null);
      for (const field of ["author", "title", "publisher", "referenceType", "note"]) assert.ok(reference[field]?.ar && reference[field]?.en);
    }
  }
});

test("researcher references are normalized, bounded, editable by replacement, and isolated by path", () => {
  const storage = memoryStorage();
  const reference = normalizeResearcherReference({ id: "r1", author: "Researcher", year: "2026", title: "Study", publisher: "Journal", doiOrUrl: "https://doi.org/example", suggestedForReport: true });
  assert.ok(reference);
  const saved = saveScientificReferenceState("semantics", { researcherReferences: [reference], suggestedPlatformReferenceIds: [SCIENTIFIC_FOUNDATIONS.semantics.platformReferences[0].id, "unknown"] }, storage);
  assert.equal(saved.ok, true);
  assert.deepEqual(readScientificReferenceState("semantics", storage).researcherReferences, [reference]);
  assert.equal(readScientificReferenceState("semantics", storage).suggestedPlatformReferenceIds.length, 1);
  assert.equal(readScientificReferenceState("corpus-linguistics", storage).researcherReferences.length, 0);

  const tooMany = Array.from({ length: MAX_RESEARCHER_REFERENCES_PER_PATH + 5 }, (_, index) => ({ ...reference, id: `r${index}` }));
  assert.equal(saveScientificReferenceState("semantics", { researcherReferences: tooMany }, storage).state.researcherReferences.length, MAX_RESEARCHER_REFERENCES_PER_PATH);
});

test("malformed or blocked local storage fails safely without external persistence", () => {
  const malformed = memoryStorage({ [`${SCIENTIFIC_REFERENCE_STORAGE_KEY}:semantics`]: "{" });
  assert.deepEqual(readScientificReferenceState("semantics", malformed), { researcherReferences: [], suggestedPlatformReferenceIds: [] });
  const blocked = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
  assert.equal(saveScientificReferenceState("semantics", { researcherReferences: [] }, blocked).ok, false);
  assert.deepEqual(readScientificReferenceState("unknown", blocked), { researcherReferences: [], suggestedPlatformReferenceIds: [] });
  assert.doesNotMatch(source("components/ScientificFoundations.js") + source("lib/scientific-references.js"), /fetch\(|\/api\/|sessionStorage|indexedDB/);
});

test("all seven executable paths mount the shared bilingual reference framework", () => {
  const mounts = {
    "pages/research-paths/corpus-linguistics.js": "corpus-linguistics",
    "pages/tools/morphology-syntax.js": "morphology-syntax",
    "pages/tools/semantics.js": "semantics",
    "pages/tools/discourse-analysis.js": "discourse-pragmatics",
    "pages/tools/pragmatics.js": "discourse-pragmatics",
    "pages/tools/text-classification-research.js": "text-classification",
    "pages/tools/information-extraction.js": "information-extraction",
    "pages/tools/nlp-experiments.js": "nlp-experiments",
  };
  for (const [file, pathId] of Object.entries(mounts)) {
    const page = source(file);
    assert.match(page, /ScientificFoundations/);
    assert.match(page, new RegExp(`pathId="${pathId}"`));
  }
  const component = source("components/ScientificFoundations.js");
  for (const label of ["الأساس العلمي للمسار", "Scientific Foundations", "مراجع الباحث", "Researcher References", "مرجع مقترح للتضمين في التقرير", "Suggested for the research report"]) assert.match(component, new RegExp(label));
  assert.match(component, /setEditingId/);
  assert.match(component, /researcherReferences\.filter/);
  assert.match(source("lib/scientific-references.js"), /isPlaceholder: true/);
});

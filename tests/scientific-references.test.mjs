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

test("seven paths expose exactly three approved platform references", () => {
  assert.deepEqual(Object.keys(SCIENTIFIC_FOUNDATIONS), ["corpus-linguistics", "morphology-syntax", "semantics", "discourse-pragmatics", "text-classification", "information-extraction", "nlp-experiments"]);
  let total = 0;
  for (const foundation of Object.values(SCIENTIFIC_FOUNDATIONS)) {
    assert.equal(foundation.platformReferences.length, 3);
    for (const reference of foundation.platformReferences) {
      total += 1;
      assert.equal(reference.isPlaceholder, false);
      assert.equal(reference.verified, true);
      assert.ok(reference.id);
      assert.ok(Number.isInteger(reference.year));
      for (const field of ["author", "title", "referenceType", "note"]) assert.ok(reference[field]?.ar && reference[field]?.en);
    }
  }
  assert.equal(total, 21);
});

test("approved bibliographic details keep only the previously verified official sources", () => {
  const allReferences = Object.values(SCIENTIFIC_FOUNDATIONS).flatMap((foundation) => foundation.platformReferences);
  const linked = allReferences.filter((reference) => reference.doiOrUrl);
  assert.equal(linked.length, 9);
  assert.ok(linked.every((reference) => /^https:\/\/(library\.ksaa\.gov\.sa|ksupress\.ksu\.edu\.sa)\//.test(reference.doiOrUrl)));
  assert.ok(allReferences.filter((reference) => !reference.doiOrUrl).every((reference) => reference.doiOrUrl === null));

  const corpusBook = SCIENTIFIC_FOUNDATIONS["corpus-linguistics"].platformReferences[0];
  assert.equal(corpusBook.author.ar, "صالح بن فهد العصيمي (محرر)، ومجموعة من الباحثين");
  assert.equal(corpusBook.title.ar, "المدونات اللغوية العربية: بناؤها وطرائق الإفادة منها");
  assert.equal(corpusBook.isbn, "9786039066484");
  assert.equal(corpusBook.doiOrUrl, "https://library.ksaa.gov.sa/links/epubs/Arabic-Corpora.pdf");
  assert.equal(SCIENTIFIC_FOUNDATIONS["corpus-linguistics"].platformReferences[1].doiOrUrl, "https://library.ksaa.gov.sa/index/book/141");

  const treebank = SCIENTIFIC_FOUNDATIONS["morphology-syntax"].platformReferences[2];
  assert.equal(treebank.publisher, null);
  assert.equal(treebank.doiOrUrl, null);
  assert.equal(treebank.referenceType.ar, "كتاب / دراسة متخصصة");

  assert.equal(SCIENTIFIC_FOUNDATIONS["morphology-syntax"].platformReferences[1].edition.ar, "الطبعة الثانية");
  assert.equal(SCIENTIFIC_FOUNDATIONS.semantics.platformReferences[0].edition.ar, "الطبعة السابعة");
  assert.equal(SCIENTIFIC_FOUNDATIONS.semantics.platformReferences[1].edition.ar, "الطبعة الثالثة");
  assert.equal(SCIENTIFIC_FOUNDATIONS["discourse-pragmatics"].platformReferences[0].isbn, "9789953456058");
  assert.equal(SCIENTIFIC_FOUNDATIONS["discourse-pragmatics"].platformReferences[1].doiOrUrl, null);

  for (const pathId of ["text-classification", "information-extraction", "nlp-experiments"]) {
    const translatedBook = SCIENTIFIC_FOUNDATIONS[pathId].platformReferences[0];
    assert.equal(translatedBook.author.ar, "نزار حبش");
    assert.equal(translatedBook.translator.ar, "هند سليمان الخليفة");
    assert.equal(translatedBook.year, 2014);
    assert.equal(translatedBook.isbn, "9786035072571");
    assert.equal(translatedBook.doiOrUrl, "https://ksupress.ksu.edu.sa/ar/books/6635/9786035072571");
  }

  for (const pathId of ["text-classification", "nlp-experiments"]) {
    assert.equal(SCIENTIFIC_FOUNDATIONS[pathId].platformReferences[1].isbn, "9786038221532");
    assert.equal(SCIENTIFIC_FOUNDATIONS[pathId].platformReferences[1].doiOrUrl, "https://library.ksaa.gov.sa/links/epubs/essential-app.pdf");
  }
  for (const pathId of ["text-classification", "information-extraction"])
    assert.equal(SCIENTIFIC_FOUNDATIONS[pathId].platformReferences[2].doiOrUrl, "https://library.ksaa.gov.sa/links/epubs/maeayir_alhawsabat_allughawiat_alearabia.pdf");

  for (const id of ["corpus-standards-2025", "syntax-treebank-2017", "discourse-yaqout-2021", "extraction-jomaa-2024", "nlp-jomaa-2024"])
    assert.equal(allReferences.find((reference) => reference.id === id).doiOrUrl, null);
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
  assert.doesNotMatch(component, /togglePlatform|suggestedPlatformReferenceIds\.includes/);
  assert.match(component, /checked=\{form\.suggestedForReport\}/);
  assert.match(component, /reference\.isPlaceholder \? styles\.placeholder : styles\.approved/);
  assert.match(component, /reference\.doiOrUrl \? <a/);
  assert.match(component, /فتح المصدر الرسمي/);
  assert.match(component, /Open official source/);
  assert.match(component, /rel="noopener noreferrer"/);
  const directory = source("pages/platform/references.js");
  assert.match(directory, /فتح المصدر الرسمي/);
  assert.match(directory, /Open official source/);
  assert.match(directory, /rel="noopener noreferrer"/);
  assert.match(source("lib/scientific-references.js"), /isPlaceholder: false/);
  assert.doesNotMatch(source("lib/scientific-references.js"), /placeholderReference|isPlaceholder: true/);
});

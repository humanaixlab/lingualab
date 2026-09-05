import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import vm from "node:vm";

// Execute the page's actual handlers/effect without JSX or browser dependencies.
const workspace = readFileSync(new URL("../pages/workspace.js", import.meta.url), "utf8");
const advisor = readFileSync(new URL("../pages/research-advisor.js", import.meta.url), "utf8");
const key = "lingualab-advisor-context";
function section(source, start, end) {
  assert.ok(source.includes(start) && source.includes(end));
  return source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start)));
}
const builder = section(workspace, "function buildAdvisorContext(", "function buildPotentialOutcomes(");
const opener = section(workspace, "  function openResearchAdvisor()", "  async function designMyStudy()");
const reset = section(workspace, "  function resetWorkspace()", "  async function loadDemoDataset()");
const processFile = section(workspace, "  async function processFile(", "  function handleDrop(");
const effect = section(advisor, "  useEffect(() => {", "  }, []);").replace("  useEffect(() => {", "");

function harness() {
  let saved = JSON.stringify({ fileName: "arabic_reviews_demo.csv", rows: 30, handoffId: "old" });
  const state = { context: null, form: {}, result: null };
  const scope = {
    URLSearchParams, MAX_FILE_SIZE: 10 * 1024 * 1024,
    t(key) { return ({ "workspace.errors.size": "Please use a file smaller than 10 MB for this browser-based prototype.", "workspace.errors.xls": "Legacy .xls files are not supported securely. Please save the file as .xlsx or CSV and upload it again.", "workspace.errors.type": "Please upload a CSV, TSV, or XLSX file.", "workspace.errors.empty": "The file does not contain a readable header row and data records.", "workspace.errors.read": "LinguaLab could not read this file." })[key] || key; },
    result: {
      fileName: "current.csv", rows: 5, columns: 2, textColumn: "text", labelColumn: "label",
      arabicRatio: 1, missingPercent: 0, duplicateCount: 0, labelDistribution: [["A", 3], ["B", 2]],
      recommendation: { type: "Supervised classification", title: "Classification" },
    },
    sessionStorage: {
      getItem: (name) => { assert.equal(name, key); return saved; },
      setItem: (name, value) => { assert.equal(name, key); saved = value; },
      removeItem: (name) => { assert.equal(name, key); saved = null; },
    },
    window: {
      location: { href: "", search: "" }, crypto: { randomUUID }, scrollTo() {},
      requestAnimationFrame(callback) { callback(); return 1; }, cancelAnimationFrame() {},
    },
    inputRef: { current: null },
    setDatasetContext(value) { state.context = value; },
    setForm(update) { state.form = update(state.form); },
    readResearchContext(search) {
      try {
        const query = new URLSearchParams(search);
        const handoffId = query.get("handoffId");
        if (query.get("from") !== "workspace" || !handoffId) return null;
        const context = JSON.parse(saved);
        return context?.handoffId === handoffId ? context : null;
      } catch { return null; }
    },
  };
  for (const name of reset.match(/set\w+(?=\()/g)) scope[name] = (value) => { state[name] = value; };
  scope.setResult = (value) => { state.result = value; };
  vm.createContext(scope);
  vm.runInContext(builder + opener + reset + processFile, scope);
  return {
    scope, state, stored: () => saved,
    mount(search) { scope.window.location.search = search; vm.runInContext(`(function(){${effect}})()`, scope); },
  };
}

test("fresh five-row handoff replaces stale demo in banner and AI form", () => {
  const h = harness();
  h.scope.openResearchAdvisor();
  const first = JSON.parse(h.stored()).handoffId;
  assert.notEqual(first, "old");
  h.mount(new URL(h.scope.window.location.href, "https://example.test").search);
  assert.equal(h.state.context.rows, 5);
  assert.equal(h.state.context.fileName, "current.csv");
  assert.match(h.state.form.dataDescription, /5 records/);
  assert.doesNotMatch(h.state.form.dataDescription, /30 records|arabic_reviews_demo/);
  h.scope.openResearchAdvisor();
  assert.notEqual(JSON.parse(h.stored()).handoffId, first);
});

test("missing, mismatched, or unrelated handoff leaves context and form empty", () => {
  for (const query of ["", "?from=workspace", "?from=workspace&handoffId=new", "?handoffId=old"]) {
    const h = harness();
    h.mount(query);
    assert.equal(h.state.context, null);
    assert.deepEqual(h.state.form, {});
  }
});

test("no current dataset prevents navigation and handoff", () => {
  const h = harness();
  h.scope.result = null;
  h.scope.openResearchAdvisor();
  assert.equal(h.scope.window.location.href, "");
  assert.equal(JSON.parse(h.stored()).handoffId, "old");
});

test("reset clears Advisor context", () => {
  const h = harness();
  h.scope.resetWorkspace();
  assert.equal(h.stored(), null);
});

test("replacement clears Advisor context before reading the new file", async () => {
  const h = harness();
  await h.scope.processFile({ name: "replacement.csv", size: 10, text() {
    assert.equal(h.stored(), null);
    throw new Error("Stop after verifying replacement invalidation");
  } });
  assert.equal(h.stored(), null);
});

test("Workspace reset completes with both available and blocked storage", () => {
  for (const blocked of [false, true]) {
    const h = harness();
    h.state.result = h.scope.result;
    h.scope.inputRef.current = { value: "previous.csv" };
    if (blocked) h.scope.sessionStorage.removeItem = () => { throw new Error("Storage blocked"); };
    assert.doesNotThrow(() => h.scope.resetWorkspace());
    assert.equal(h.state.result, null);
    assert.equal(h.state.setHubCopilotContext, null);
    assert.equal(h.state.setStatus, "idle");
    assert.equal(h.state.setWorkflowError, "");
    assert.equal(h.state.setWorkflowOpen, false);
    assert.equal(h.state.setStudyDesign, null);
    assert.equal(h.state.setDatasetRows.length, 0);
    assert.equal(h.state.setPreview.length, 0);
    assert.equal(h.scope.inputRef.current.value, "");
    if (!blocked) assert.equal(h.stored(), null);
  }
});

test("Workspace upload preserves validation and CSV parsing when storage is blocked", async () => {
  for (const blocked of [false, true]) {
    const h = harness();
    vm.runInContext(section(workspace, "const TEXT_HINTS", "export default function WorkspacePage"), h.scope);
    if (blocked) h.scope.sessionStorage.removeItem = () => { throw new Error("Storage blocked"); };
    await h.scope.processFile({ name: "large.csv", size: h.scope.MAX_FILE_SIZE + 1, text() { assert.fail("Oversized files must not be read"); } });
    assert.equal(h.state.setStatus, "error");
    assert.match(h.state.setError, /smaller than 10 MB/);
    await h.scope.processFile({ name: "invalid.pdf", size: 10 });
    assert.equal(h.state.setStatus, "error");
    assert.equal(h.state.setError, "Please upload a CSV, TSV, or XLSX file.");
    await h.scope.processFile({ name: "current.csv", size: 100, text: async () => "text,label\nمرحبا بالعالم,A\nتجربة عربية,B" });
    assert.equal(h.state.setStatus, "ready");
    assert.equal(h.state.setError, "");
    assert.equal(h.state.result.fileName, "current.csv");
    assert.equal(h.state.result.rows, 2);
    assert.equal(h.state.setDatasetRows[0].text, "مرحبا بالعالم");
    assert.equal(h.state.setSelectedTextColumn, "text");
    assert.equal(h.state.setSelectedLabelColumn, "label");
    if (!blocked) assert.equal(h.stored(), null);
  }
});

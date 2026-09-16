import assert from "node:assert/strict";
import test from "node:test";
import { acceptProjectHandoff, createProjectHandoff, incomingHandoffPreview, projectHandoffStatus, readProjectHandoff, sanitizeProjectPayload } from "../lib/structured-handoff.js";

function storage() {
  const map = new Map();
  return { getItem: (key) => map.get(key) || null, setItem: (key, value) => map.set(key, value), removeItem: (key) => map.delete(key) };
}

const cases = [
  ["nlp-builder", "code", { domain: "pragmatics", linguisticTask: "speech acts", computationalTask: "classification", unitOfAnalysis: "utterance", labelSchema: ["REQUEST", "QUESTION"] }],
  ["code", "nlp-builder", { task: "classification", linguisticIssue: "Labels overlap", availableLabels: ["REQUEST", "QUESTION"] }],
  ["nlp-builder", "research", { phenomenon: "speech acts", unitOfAnalysis: "utterance", annotationScheme: ["REQUEST", "QUESTION"] }],
  ["research", "nlp-builder", { researchQuestion: "How are requests expressed?", linguisticDomain: "pragmatics", proposedData: "Arabic posts" }],
  ["code", "analyze", { task: "classification", outputSchema: ["prediction"], metrics: ["Macro-F1"] }],
  ["analyze", "code", { task: "classification", requiredChange: "Add normalization", importantErrors: ["dialect spelling"] }],
  ["analyze", "research", { analysisType: "classification", resultSummary: "Observed summary", metrics: ["Macro-F1"] }],
  ["research", "analyze", { analysisTask: "frequency comparison", datasetContext: "licensed corpus metadata", requestedOutputs: ["frequency table"] }],
];

test("all eight owner transitions carry bounded structured payloads and provenance", () => {
  cases.forEach(([source, target, payload], index) => {
    const store = storage();
    const url = createProjectHandoff(source, target, { ...payload, rawRows: ["must not transfer"] }, { storage: store, now: 1000, id: `id-${index}`, projectId: "project-1", sourceStateId: "state-7" });
    const handoff = readProjectHandoff(target, new URL(url, "https://example.test").search, store, 1001);
    assert.equal(handoff.source, source);
    assert.equal(handoff.target, target);
    assert.equal(handoff.projectId, "project-1");
    assert.equal(handoff.sourceStateId, "state-7");
    assert.equal(handoff.sourceVersion, "1");
    assert.equal(handoff.provenance.status, "incoming-preview");
    assert.equal("rawRows" in handoff.payload, false);
    const preview = incomingHandoffPreview(handoff);
    assert.equal(preview.id, `id-${index}`);
    assert.equal(preview.sourceStateId, "state-7");
    assert.equal(preview.sourceVersion, "1");
  });
});

test("target state is never replaced silently and acceptance preserves incoming provenance", () => {
  const store = storage();
  const url = createProjectHandoff("nlp-builder", "code", cases[0][2], { storage: store, now: 1000, id: "safe" });
  const handoff = readProjectHandoff("code", new URL(url, "https://example.test").search, store, 1001);
  const current = { task: "My current task", output: "Keep me" };
  assert.deepEqual(current, { task: "My current task", output: "Keep me" });
  const accepted = acceptProjectHandoff(current, handoff, "merge");
  assert.equal(accepted.state.task, "My current task");
  assert.equal(accepted.state.output, "Keep me");
  assert.equal(accepted.state.incomingProjectContext.provenance.status, "accepted");
  assert.equal(accepted.state.incomingProjectContext.provenance.sourceTool, "nlp-builder");
});

test("destination-owned fields remain unchanged when accepted context conflicts", () => {
  const store = storage();
  const url = createProjectHandoff("analyze", "research", cases[6][2], { storage: store, now: 1000, id: "conflict" });
  const handoff = readProjectHandoff("research", new URL(url, "https://example.test").search, store, 1001);
  const current = { researchGoal: "Existing goal", currentStage: "writing", dataDescription: "Existing dataset" };
  const accepted = acceptProjectHandoff(current, handoff, "merge");
  assert.equal(accepted.state.researchGoal, "Existing goal");
  assert.equal(accepted.state.currentStage, "writing");
  assert.equal(accepted.state.dataDescription, "Existing dataset");
  assert.deepEqual(accepted.conflicts, []);
  assert.equal(accepted.state.incomingProjectContext.payload.resultSummary, "Observed summary");
});

test("stale, mismatched, unsupported, empty, and circular same-owner transfers fail safely", () => {
  const store = storage();
  const url = createProjectHandoff("research", "analyze", cases[7][2], { storage: store, now: 1000, id: "stale" });
  const search = new URL(url, "https://example.test").search;
  assert.equal(projectHandoffStatus("analyze", search, store, 1001), "valid");
  assert.equal(projectHandoffStatus("analyze", search, store, 1000 + 30 * 60 * 1000), "stale");
  assert.equal(readProjectHandoff("analyze", search, store, 1000 + 30 * 60 * 1000), null);
  assert.equal(readProjectHandoff("code", search, store, 1001), null);
  assert.throws(() => createProjectHandoff("nlp-builder", "nlp-builder", { task: "x" }, { storage: store, id: "loop" }));
  assert.equal(sanitizeProjectPayload("code", "research", { task: "unsupported" }), null);
  assert.throws(() => createProjectHandoff("code", "analyze", {}, { storage: store, id: "empty" }));
});

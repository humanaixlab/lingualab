import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { HANDOFF_TRANSITIONS, TOOL_OWNERS, auditOwnership, ownerForCapability } from "../lib/capability-ownership.js";

const source = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("each core capability has exactly one owner and every transfer has a new owner-specific purpose", () => {
  const audit = auditOwnership();
  assert.equal(audit.ownerCount, 4);
  assert.deepEqual(audit.duplicates, []);
  assert.equal(ownerForCapability("annotation-design"), "nlp-builder");
  assert.equal(ownerForCapability("training-code"), "code");
  assert.equal(ownerForCapability("frequency-tables"), "analyze");
  assert.equal(ownerForCapability("result-bound-interpretation"), "analyze");
  assert.equal(ownerForCapability("result-bound-methodological-implications"), "analyze");
  assert.equal(ownerForCapability("study-design"), "research");
  assert.equal(ownerForCapability("methodology-writing"), "research");
  assert.equal(Object.keys(HANDOFF_TRANSITIONS).length, 8);
  for (const [transition, purpose] of Object.entries(HANDOFF_TRANSITIONS)) {
    const [sourceOwner, targetOwner] = transition.split(":");
    assert.notEqual(sourceOwner, targetOwner);
    assert.ok(TOOL_OWNERS[sourceOwner] && TOOL_OWNERS[targetOwner] && purpose);
  }
});

test("owner pages do not duplicate another owner's full core workflow", () => {
  const nlp = source("pages/tools/nlp-builder.js");
  const code = source("pages/tools/code.js");
  const analyze = source("pages/tools/analyze.js");
  const research = source("pages/research-advisor.js");
  assert.doesNotMatch(nlp, /FileReader|train_test_split|fit_transform|production pipeline/i);
  assert.doesNotMatch(code, /PHENOMENA|changePhenomenon|annotation theory|ruleDomain/);
  assert.doesNotMatch(analyze, /ruleName|pythonStarter|requiredFeatures/);
  assert.doesNotMatch(research, /pythonStarter|featureSources|decisionOutput/);
  for (const page of [nlp, code, analyze, research]) assert.match(page, /ProjectHandoff|projectHandoff/);
});

test("owner routes and the audited hub return anchors are not orphaned", () => {
  const routeFiles = {
    "/tools/nlp-builder": "pages/tools/nlp-builder.js",
    "/tools/code": "pages/tools/code.js",
    "/tools/analyze": "pages/tools/analyze.js",
    "/research-advisor": "pages/research-advisor.js",
  };
  for (const owner of Object.values(TOOL_OWNERS)) assert.ok(source(routeFiles[owner.route]).length > 0);
  const hub = source("pages/research-planner.js");
  assert.match(hub, /id="build-tools"/);
  assert.match(hub, /id="research-paths"/);
});

test("Research merge preserves an already selected destination stage", () => {
  const research = source("pages/research-advisor.js");
  assert.match(research, /current\.currentStage && current\.currentStage !== "idea"/);
  assert.match(research, /researchGoal: current\.researchGoal \|\| goal/);
  assert.match(research, /dataDescription: current\.dataDescription \|\| details/);
});

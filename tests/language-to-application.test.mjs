import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LANGUAGE_TO_APPLICATION_EXAMPLES, WHY_THIS_PATH, WHY_THIS_STEP } from "../lib/language-to-application.js";

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const planner = read("pages/research-planner.js");
const bridge = read("components/FromLanguageToApplication.js");
const paths = read("components/ResearchPaths.js");
const builder = read("pages/tools/nlp-builder.js");

assert.match(planner, /FromLanguageToApplication/);
assert.match(bridge, /من اللغة إلى التطبيق/);
assert.match(bridge, /From Language to Application/);
assert.match(bridge, /useState/);
assert.match(bridge, /Reveal next step/);
assert.match(bridge, /aria-pressed/);
assert.equal(LANGUAGE_TO_APPLICATION_EXAMPLES.length, 4);
for (const example of LANGUAGE_TO_APPLICATION_EXAMPLES) {
  assert.ok(example.goal.en && example.problem.en && example.stages.en.length > 4);
  assert.ok(example.evaluation.en && example.errors.en && example.limitation.en);
}
const grammar = LANGUAGE_TO_APPLICATION_EXAMPLES.find((item) => item.id === "grammar-agreement");
assert.deepEqual(grammar.capabilities.en, ["Morphology", "Syntax"]);
assert.match(grammar.limitation.en, /do not equal a complete grammar checker/);
const classification = LANGUAGE_TO_APPLICATION_EXAMPLES.find((item) => item.id === "classification");
assert.match(classification.limitation.en, /not requirements for every NLP workflow/);
const rule = LANGUAGE_TO_APPLICATION_EXAMPLES.find((item) => item.id === "rule");
assert.match(rule.algorithm.en, /Python is an implementation language, not the algorithm/);
assert.match(bridge, /application is not an algorithm/i);

assert.match(paths, /WhyThisPath/);
assert.equal(Object.keys(WHY_THIS_PATH).length, 7);
for (const [id, guide] of Object.entries(WHY_THIS_PATH)) {
  assert.ok(guide.problem && guide.computer && guide.capability && guide.contributions.length >= 3 && guide.limit, id);
  assert.match(guide.limit, /not|does not/i, id);
}
assert.match(WHY_THIS_PATH["morphology-syntax"].limit, /grammar checker/);

assert.match(builder, /WhyThisStep/);
assert.deepEqual(Object.keys(WHY_THIS_STEP).sort(), ["algorithm", "annotation", "error-analysis", "evaluation", "representation"]);
assert.match(WHY_THIS_STEP.annotation.en, /does not automatically know/);
assert.match(WHY_THIS_STEP.representation.en, /consistent computational form/);
assert.match(WHY_THIS_STEP.evaluation.en, /Executing an algorithm does not demonstrate/);
assert.match(WHY_THIS_STEP["error-analysis"].en, /metric does not explain why/i);
assert.equal((builder.match(/<WhyThisStep/g) || []).length, 5, "guidance is used at meaningful stages, not every step");

// Scope guardrails: this completion does not restart unrelated product work.
assert.ok(read("pages/learning-center.js").includes("Learning"));
assert.ok(read("lib/structured-handoff.js").includes("createProjectHandoff"));
assert.ok(read("lib/research-paths.js").includes("Corpus Linguistics"));
assert.ok(!planner.includes("Project Lab"));
console.log("language-to-application guidance checks passed");

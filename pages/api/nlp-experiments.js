import OpenAI from "openai";
import { parseAllowedLabels, validateOutputComparison, validatePromptExperiment, validateSandboxOutput } from "../../lib/nlp-experiments.js";

const clean = (value) => typeof value === "string" ? value.trim() : "";
const ARABIC_PATTERN = /[\u0600-\u06ff]/;
const MAX_TEXT_LENGTH = 12000;
const outputSchema = { type: "object", additionalProperties: false, required: ["output"], properties: { output: { type: "string" } } };
const comparisonSchema = { type: "object", additionalProperties: false, required: ["categoryDecision", "textualEvidence", "explanation", "consistency"], properties: Object.fromEntries(["categoryDecision", "textualEvidence", "explanation", "consistency"].map((field) => [field, { type: "string" }])) };

async function structured(client, name, prompt, schema) {
  const response = await client.responses.create({ model: "gpt-4.1-mini", input: prompt, text: { format: { type: "json_schema", name, strict: true, schema } } });
  return JSON.parse(response.output_text || "null");
}

export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "Method not allowed" }); }
  const action = clean(req.body?.action);
  const locale = req.body?.uiLanguage === "en" ? "en" : "ar";
  const language = locale === "ar" ? "Write concise, natural academic Arabic." : "Write concise academic English.";
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: "NLP experiments AI is not configured on this deployment." });
  const client = new OpenAI({ apiKey });
  try {
    if (action === "prompt-experiment") {
      const task = clean(req.body?.task); const text = clean(req.body?.text); const variantA = clean(req.body?.variantA); const variantB = clean(req.body?.variantB);
      if (!task || !text || !ARABIC_PATTERN.test(text) || !variantA || !variantB || text.length > MAX_TEXT_LENGTH) return res.status(400).json({ error: "A fixed task, Arabic text, and two instruction variants are required." });
      const base = `${language}\nPerform this fixed Arabic NLP task: ${task}\nUse only the submitted text. Do not compare variants or declare a winner.\n\nArabic input:\n${text}`;
      const [a, b] = await Promise.all([
        structured(client, "prompt_variant_a", `${base}\n\nInstruction variant A:\n${variantA}`, outputSchema),
        structured(client, "prompt_variant_b", `${base}\n\nInstruction variant B:\n${variantB}`, outputSchema),
      ]);
      const result = { variantA: clean(a?.output), variantB: clean(b?.output) };
      if (!validatePromptExperiment(result)) return res.status(422).json({ error: "Both prompt variants must return usable outputs." });
      return res.status(200).json({ result });
    }
    if (action === "compare-outputs") {
      const task = clean(req.body?.task); const outputA = clean(req.body?.outputA); const outputB = clean(req.body?.outputB);
      if (!task || !outputA || !outputB) return res.status(400).json({ error: "A shared task and two original outputs are required." });
      const prompt = `${language}\nCompare two preserved AI outputs for the same Arabic linguistic task. Describe differences in category or decision, textual evidence, explanation, and internal consistency. Do not select a winner, score superiority, or alter either output. Base the comparison only on the supplied content.\n\nTask:\n${task}\n\nVariant A:\n${outputA}\n\nVariant B:\n${outputB}`;
      const result = await structured(client, "nlp_output_comparison", prompt, comparisonSchema);
      if (!validateOutputComparison(result)) return res.status(422).json({ error: "The comparison response was incomplete." });
      return res.status(200).json({ result });
    }
    if (action === "task-sandbox") {
      const taskName = clean(req.body?.taskName); const instruction = clean(req.body?.instruction); const expectedStructure = clean(req.body?.expectedStructure); const text = clean(req.body?.text); const labels = parseAllowedLabels(req.body?.allowedLabels);
      if (!taskName || !instruction || !text || !ARABIC_PATTERN.test(text) || text.length > MAX_TEXT_LENGTH || (!labels.length && !expectedStructure)) return res.status(400).json({ error: "Task details, Arabic input, and labels or an expected structure are required." });
      const schema = { type: "object", additionalProperties: false, required: ["label", "evidence", "result", "explanation"], properties: { label: labels.length ? { type: "string", enum: labels } : { type: "string", enum: [""] }, evidence: { type: "string" }, result: { type: "string" }, explanation: { type: "string" } } };
      const prompt = `${language}\nRun this researcher-defined Arabic NLP task.\nTask: ${taskName}\nInstruction: ${instruction}\n${labels.length ? `Choose exactly one allowed label: ${labels.join(" | ")}.` : "Return an empty label."}\n${expectedStructure ? `Expected output structure: ${expectedStructure}` : ""}\nEvidence, when applicable, must be an exact contiguous span from the input. Do not invent evidence or labels. This is an unvalidated research suggestion requiring researcher review.\n\nArabic input:\n${text}`;
      const result = await structured(client, "nlp_task_sandbox", prompt, schema);
      if (!validateSandboxOutput(text, labels, result)) return res.status(422).json({ error: "The sandbox response did not follow the researcher-defined constraints." });
      return res.status(200).json({ result });
    }
    return res.status(400).json({ error: "A supported NLP experiment is required." });
  } catch (error) {
    console.error("nlp-experiments failed", error);
    return res.status(500).json({ error: "The NLP experiment could not be generated reliably." });
  }
}

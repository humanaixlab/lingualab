import OpenAI from "openai";
import { validateAiClassification } from "../../lib/text-classification-research.js";

const ARABIC_PATTERN = /[\u0600-\u06ff]/;
const clean = (value) => typeof value === "string" ? value.trim() : "";
const MAX_TEXT_LENGTH = 12000;

function classifySchema(labels) {
  return { type: "object", additionalProperties: false, required: ["label", "evidence", "explanation"], properties: { label: { type: "string", enum: labels }, evidence: { type: "string" }, explanation: { type: "string" } } };
}

const ERROR_SCHEMA = {
  type: "object", additionalProperties: false, required: ["summary", "patterns", "caution"],
  properties: { summary: { type: "string" }, patterns: { type: "array", maxItems: 6, items: { type: "string" } }, caution: { type: "string" } },
};

export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "Method not allowed" }); }
  const action = clean(req.body?.action);
  const locale = req.body?.uiLanguage === "en" ? "en" : "ar";
  const language = locale === "ar" ? "Write concise, natural academic Arabic." : "Write concise academic English.";
  let schema;
  let prompt;
  let classificationInput = null;
  if (action === "classify") {
    const text = clean(req.body?.text);
    const labels = Array.isArray(req.body?.allowedLabels) ? [...new Set(req.body.allowedLabels.map(clean).filter(Boolean))].slice(0, 20) : [];
    if (!text || !ARABIC_PATTERN.test(text) || text.length > MAX_TEXT_LENGTH || labels.length < 2) return res.status(400).json({ error: "Arabic text and at least two allowed labels are required." });
    classificationInput = { text, labels };
    schema = classifySchema(labels);
    prompt = `${language}\nClassify the submitted Arabic text using exactly one researcher-provided label: ${labels.join(" | ")}. Copy one exact contiguous evidence span from the text and give one short cautious explanation. Do not invent or rename labels. This is a research suggestion requiring researcher review.\n\nText:\n${text}`;
  } else if (action === "interpret-errors") {
    const errors = Array.isArray(req.body?.errors) ? req.body.errors.slice(0, 50).map((item) => ({ humanLabel: clean(item?.humanLabel), systemPrediction: clean(item?.systemPrediction), text: clean(item?.text).slice(0, 500) })).filter((item) => item.humanLabel && item.systemPrediction) : [];
    if (!errors.length) return res.status(400).json({ error: "Observed classification comparisons are required." });
    schema = ERROR_SCHEMA;
    prompt = `${language}\nInterpret only the observed classification comparisons below. Summarize recurring mismatch patterns cautiously. Human reference labels are authoritative: never change, relabel, or dispute them. Do not invent counts, examples, or metrics. Return research guidance, not definitive findings.\n\nObserved comparisons:\n${JSON.stringify(errors)}`;
  } else return res.status(400).json({ error: "A supported AI action is required." });
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: "Text classification AI is not configured on this deployment." });
  try {
    const client = new OpenAI({ apiKey });
    const response = await client.responses.create({ model: "gpt-4.1-mini", input: prompt, text: { format: { type: "json_schema", name: `text_classification_${action.replaceAll("-", "_")}`, strict: true, schema } } });
    const output = JSON.parse(response.output_text || "null");
    if (action === "classify" && !validateAiClassification(classificationInput.text, classificationInput.labels, output)) return res.status(422).json({ error: "The AI response was not grounded in the submitted text and labels." });
    if (action === "interpret-errors" && (!output || typeof output.summary !== "string" || !Array.isArray(output.patterns) || typeof output.caution !== "string")) return res.status(422).json({ error: "The AI response did not match the error-analysis structure." });
    return res.status(200).json({ result: output });
  } catch (error) {
    console.error("text-classification-research failed", error);
    return res.status(500).json({ error: "The classification suggestion could not be generated reliably." });
  }
}

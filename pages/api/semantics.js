import OpenAI from "openai";
import { semanticTexts, semanticsTool, validateSemanticsOutput } from "../../lib/semantics-analysis.js";

const MAX_TEXT_LENGTH = 12000;
const MAX_GROUP_TEXTS = 30;
const ARABIC_PATTERN = /[\u0600-\u06ff]/;
const clean = (value) => typeof value === "string" ? value.trim() : "";

function schemaFor(toolId) {
  if (toolId === "similarity") return {
    type: "object", additionalProperties: false, required: ["category", "evidence", "explanation"],
    properties: {
      category: { type: "string", enum: ["متشابه دلاليًا", "متشابه جزئيًا", "غير متشابه"] },
      evidence: { type: "object", additionalProperties: false, required: ["primary", "secondary"], properties: { primary: { type: "string" }, secondary: { type: "string" } } },
      explanation: { type: "string" },
    },
  };
  if (toolId === "topic") return {
    type: "object", additionalProperties: false, required: ["topic", "evidence", "explanation"],
    properties: { topic: { type: "string" }, evidence: { type: "string" }, explanation: { type: "string" } },
  };
  return {
    type: "object", additionalProperties: false, required: ["groups", "explanation"],
    properties: {
      groups: { type: "array", minItems: 1, items: { type: "object", additionalProperties: false, required: ["label", "texts", "rationale"], properties: { label: { type: "string" }, texts: { type: "array", minItems: 1, items: { type: "string" } }, rationale: { type: "string" } } } },
      explanation: { type: "string" },
    },
  };
}

function task(toolId) {
  if (toolId === "similarity") return "Compare the two Arabic texts and choose exactly one approved semantic-similarity category. Copy one supporting span from each text.";
  if (toolId === "topic") return "Identify one concise main-topic label and copy one supporting span from the Arabic text.";
  return "Group every submitted short Arabic text exactly once into meaning-based groups. Copy each assigned text exactly, and give each group a concise label and short rationale.";
}

export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "Method not allowed" }); }
  const toolId = clean(req.body?.toolId);
  const tool = semanticsTool(toolId);
  const inputs = toolId === "grouping"
    ? { texts: Array.isArray(req.body?.inputs?.texts) ? req.body.inputs.texts.map(clean).filter(Boolean) : [] }
    : { primary: clean(req.body?.inputs?.primary), secondary: clean(req.body?.inputs?.secondary) };
  const texts = semanticTexts(inputs);
  if (!tool || !texts.length || texts.some((text) => !ARABIC_PATTERN.test(text)) || (toolId === "similarity" && texts.length !== 2) || (toolId === "grouping" && texts.length < 2)) {
    return res.status(400).json({ error: "A valid semantics tool and the required Arabic text inputs are needed." });
  }
  if (texts.some((text) => text.length > MAX_TEXT_LENGTH) || texts.length > MAX_GROUP_TEXTS) return res.status(413).json({ error: "The submitted content is too long." });
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: "Semantics AI is not configured on this deployment." });
  const numbered = texts.map((text, index) => `Text ${index + 1}: ${text}`).join("\n");
  const prompt = `You are assisting a researcher with a narrowly scoped Arabic semantics research preview.

${task(toolId)}

Rules:
- Use only the submitted texts and never invent evidence, labels based on outside facts, or additional texts.
- Evidence and assigned texts must be exact contiguous copies from the submitted input.
- Give one short, cautious Arabic explanation. The output is a research suggestion requiring researcher verification.
- Return only the required structured object.

${numbered}`;
  try {
    const client = new OpenAI({ apiKey });
    const response = await client.responses.create({ model: "gpt-4.1-mini", input: prompt, text: { format: { type: "json_schema", name: `semantics_${toolId}`, strict: true, schema: schemaFor(toolId) } } });
    const output = JSON.parse(response.output_text || "null");
    if (!validateSemanticsOutput(toolId, inputs, output)) return res.status(422).json({ error: "The AI response was not grounded exactly in the submitted text." });
    return res.status(200).json({ result: output });
  } catch (error) {
    console.error("semantics-analysis failed", error);
    return res.status(500).json({ error: "The semantics suggestion could not be generated reliably. Please try again." });
  }
}

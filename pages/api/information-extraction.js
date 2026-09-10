import OpenAI from "openai";
import { ENTITY_CATEGORIES, informationExtractionTool, validateInformationExtractionOutput } from "../../lib/information-extraction.js";

const MAX_TEXT_LENGTH = 12000;
const clean = (value) => typeof value === "string" ? value.trim() : "";

const schemas = {
  ner: {
    type: "object", additionalProperties: false, required: ["entities", "explanation"],
    properties: { entities: { type: "array", maxItems: 40, items: { type: "object", additionalProperties: false, required: ["span", "category"], properties: { span: { type: "string" }, category: { type: "string", enum: ENTITY_CATEGORIES } } } }, explanation: { type: "string" } },
  },
  relations: {
    type: "object", additionalProperties: false, required: ["relations", "explanation"],
    properties: { relations: { type: "array", maxItems: 30, items: { type: "object", additionalProperties: false, required: ["entity1", "relation", "entity2", "evidence", "explanation"], properties: { entity1: { type: "string" }, relation: { type: "string" }, entity2: { type: "string" }, evidence: { type: "string" }, explanation: { type: "string" } } } }, explanation: { type: "string" } },
  },
  terminology: {
    type: "object", additionalProperties: false, required: ["terms", "explanation"],
    properties: { terms: { type: "array", maxItems: 40, items: { type: "object", additionalProperties: false, required: ["term", "rationale"], properties: { term: { type: "string" }, rationale: { type: "string" } } } }, explanation: { type: "string" } },
  },
};

function task(toolId) {
  if (toolId === "ner") return `Extract named entities using only these categories: ${ENTITY_CATEGORIES.join("، ")}. Return exact entity spans; an empty list is valid when none are supported.`;
  if (toolId === "relations") return "Identify only explicit or strongly text-supported relations between entities present in the text. Each entity and supporting evidence must be copied exactly. Describe a textual relation only; never add external knowledge or real-world facts.";
  return "Extract domain-relevant terms or multiword keyphrases. Prefer meaningful expressions over generic high-frequency words, preserve each exact source form, and give a short rationale.";
}

export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "Method not allowed" }); }
  const toolId = clean(req.body?.toolId);
  const text = clean(req.body?.text);
  if (!informationExtractionTool(toolId) || !text || !/[\u0600-\u06ff]/.test(text)) return res.status(400).json({ error: "A supported extraction tool and Arabic text are required." });
  if (text.length > MAX_TEXT_LENGTH) return res.status(413).json({ error: "The submitted text is too long." });
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: "Information extraction AI is not configured on this deployment." });
  const locale = req.body?.uiLanguage === "en" ? "en" : "ar";
  const language = locale === "ar" ? "Write concise, natural academic Arabic." : "Write concise academic English.";
  const prompt = `You are assisting a researcher with an Arabic information-extraction research preview.\n${language}\n${task(toolId)}\nUse only the submitted text. Never invent an entity, term, relation, fact, or evidence. Every entity, term, relation endpoint, and evidence span must be an exact contiguous copy from the source text. Outputs are unvalidated suggestions requiring researcher review. Return only the required structured object.\n\nArabic text:\n${text}`;
  try {
    const client = new OpenAI({ apiKey });
    const response = await client.responses.create({ model: "gpt-4.1-mini", input: prompt, text: { format: { type: "json_schema", name: `information_extraction_${toolId}`, strict: true, schema: schemas[toolId] } } });
    const output = JSON.parse(response.output_text || "null");
    if (!validateInformationExtractionOutput(toolId, text, output)) return res.status(422).json({ error: "The AI response included unsupported or non-exact source content." });
    return res.status(200).json({ result: output });
  } catch (error) {
    console.error("information-extraction failed", error);
    return res.status(500).json({ error: "The extraction suggestion could not be generated reliably." });
  }
}

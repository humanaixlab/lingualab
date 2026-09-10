import OpenAI from "openai";
import { morphologySyntaxTool, validateMorphologySyntaxInputs, validateMorphologySyntaxOutput } from "../../lib/morphology-syntax.js";

const MAX_TEXT_LENGTH = 12000;
const clean = (value) => typeof value === "string" ? value.trim() : "";

const base = { evidence: { type: "string" }, explanation: { type: "string" } };
const schemas = {
  lemmatization: { type: "object", additionalProperties: false, required: ["original", "lemma", "evidence", "explanation", "uncertain"], properties: { original: { type: "string" }, lemma: { type: "string" }, ...base, uncertain: { type: "boolean" } } },
  "morphological-features": { type: "object", additionalProperties: false, required: ["original", "features", "evidence", "explanation"], properties: { original: { type: "string" }, features: { type: "object", additionalProperties: false, required: ["gender", "number", "definiteness", "person", "tenseAspect", "voice"], properties: Object.fromEntries(["gender", "number", "definiteness", "person", "tenseAspect", "voice"].map((field) => [field, { type: "string" }])) }, ...base } },
  "word-structure": { type: "object", additionalProperties: false, required: ["original", "prefixes", "stem", "suffixes", "evidence", "explanation", "uncertain"], properties: { original: { type: "string" }, prefixes: { type: "array", items: { type: "string" } }, stem: { type: "string" }, suffixes: { type: "array", items: { type: "string" } }, ...base, uncertain: { type: "boolean" } } },
  pos: { type: "object", additionalProperties: false, required: ["original", "category", "evidence", "explanation", "uncertain"], properties: { original: { type: "string" }, category: { type: "string" }, ...base, uncertain: { type: "boolean" } } },
  "syntactic-relations": { type: "object", additionalProperties: false, required: ["firstElement", "secondElement", "relation", "evidence", "explanation"], properties: { firstElement: { type: "string" }, secondElement: { type: "string" }, relation: { type: "string" }, ...base } },
  "sentence-structure": { type: "object", additionalProperties: false, required: ["constituents", "explanation", "uncertain"], properties: { constituents: { type: "array", minItems: 1, maxItems: 8, items: { type: "object", additionalProperties: false, required: ["label", "span"], properties: { label: { type: "string" }, span: { type: "string" } } } }, explanation: { type: "string" }, uncertain: { type: "boolean" } } },
};

function task(toolId, inputs) {
  if (toolId === "lemmatization") return `Propose the lemma of the selected token «${inputs.token}». Keep original exactly unchanged and briefly explain genuine ambiguity.`;
  if (toolId === "morphological-features") return `Identify only morphological features supported by the form and context for «${inputs.token}»: gender, number, definiteness, person, tense/aspect, and voice. Use an empty string for every unsupported or inapplicable feature.`;
  if (toolId === "word-structure") return `Propose relevant prefixes, stem or base, and suffixes for «${inputs.token}». Keep original unchanged and mark uncertain true whenever segmentation is not secure.`;
  if (toolId === "pos") return `Classify «${inputs.token}» by part of speech according to this sentence context. Mark ambiguity with uncertain; this experimental result is not validated.`;
  if (toolId === "syntactic-relations") return `Identify the main grammatical relation between the selected elements «${inputs.firstElement}» and «${inputs.secondElement}».`;
  return "Give a concise shallow structural analysis with major sentence constituents only. Avoid unsupported deep parsing claims.";
}

export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "Method not allowed" }); }
  const toolId = clean(req.body?.toolId);
  const inputs = { text: clean(req.body?.inputs?.text), token: clean(req.body?.inputs?.token), firstElement: clean(req.body?.inputs?.firstElement), secondElement: clean(req.body?.inputs?.secondElement) };
  const tool = morphologySyntaxTool(toolId);
  if (!tool || !validateMorphologySyntaxInputs(toolId, inputs)) return res.status(400).json({ error: "A supported tool and valid Arabic source input are required." });
  if (inputs.text.length > MAX_TEXT_LENGTH) return res.status(413).json({ error: "The submitted text is too long." });
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: "Morphology and syntax AI is not configured on this deployment." });
  const locale = req.body?.uiLanguage === "en" ? "en" : "ar";
  const language = locale === "ar" ? "Write concise, natural academic Arabic." : "Write concise academic English.";
  const prompt = `You are assisting a researcher with an Arabic morphology and syntax research preview.\n${language}\n${task(toolId, inputs)}\nUse only the supplied form and sentence context. Never fabricate a feature or relation. Every evidence/span value must be an exact contiguous copy from the source text. Treat the output as an unvalidated analytical suggestion requiring researcher review. Return only the required structured object.\n\nSource text:\n${inputs.text}`;
  try {
    const client = new OpenAI({ apiKey });
    const response = await client.responses.create({ model: "gpt-4.1-mini", input: prompt, text: { format: { type: "json_schema", name: `morphology_syntax_${toolId.replaceAll("-", "_")}`, strict: true, schema: schemas[toolId] } } });
    const output = JSON.parse(response.output_text || "null");
    if (!validateMorphologySyntaxOutput(toolId, inputs, output)) return res.status(422).json({ error: "The AI response was not grounded in the submitted Arabic text." });
    return res.status(200).json({ result: output });
  } catch (error) {
    console.error("morphology-syntax failed", error);
    return res.status(500).json({ error: "The morphology or syntax suggestion could not be generated reliably." });
  }
}

import OpenAI from "openai";
import { validateCorpusAiOutput } from "../../lib/corpus-research.js";

const MAX_PAYLOAD_LENGTH = 30000;
const clean = (value) => typeof value === "string" ? value.trim() : "";

const SETUP_SCHEMA = {
  type: "object", additionalProperties: false,
  required: ["metadataFields", "inclusionCriteria", "exclusionCriteria", "textTypes", "corpusStructure", "readinessIssues"],
  properties: Object.fromEntries(["metadataFields", "inclusionCriteria", "exclusionCriteria", "textTypes", "corpusStructure", "readinessIssues"].map((field) => [field, { type: "array", items: { type: "string" }, maxItems: 8 }])),
};

const ANALYSIS_SCHEMA = {
  type: "object", additionalProperties: false, required: ["summary", "patterns", "researchQuestions", "caution"],
  properties: {
    summary: { type: "string" },
    patterns: { type: "array", items: { type: "string" }, maxItems: 6 },
    researchQuestions: { type: "array", items: { type: "string" }, maxItems: 5 },
    caution: { type: "string" },
  },
};

function safeJson(value) {
  const serialized = JSON.stringify(value ?? {});
  return serialized.length <= MAX_PAYLOAD_LENGTH ? serialized : null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "Method not allowed" }); }
  const moduleId = clean(req.body?.moduleId);
  const locale = req.body?.uiLanguage === "en" ? "en" : "ar";
  if (!['create', 'analyze'].includes(moduleId)) return res.status(400).json({ error: "A supported corpus research module is required." });
  const context = moduleId === "create" ? req.body?.corpusSummary : req.body?.results;
  const serialized = safeJson(context);
  if (!serialized) return res.status(413).json({ error: "The submitted research summary is too large." });
  if (!context || typeof context !== "object" || !Object.keys(context).length) return res.status(400).json({ error: "Current corpus information is required." });
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: "Corpus research AI is not configured on this deployment." });

  const languageInstruction = locale === "ar" ? "Write concise, natural academic Arabic." : "Write concise academic English.";
  const task = moduleId === "create"
    ? `Suggest optional corpus setup choices: useful metadata field names, inclusion criteria, exclusion criteria, suitable text types, a possible corpus structure, and readiness issues. Do not fill or infer any missing metadata. Treat every suggestion as editable research guidance.`
    : `Interpret only the deterministic corpus results supplied below. Identify potentially interesting observed patterns and evidence-based research questions. Never invent counts, contexts, sequences, comparisons, or findings, and never present an interpretation as definitive.`;
  const prompt = `You are supporting a researcher in a Corpus Linguistics Research Preview. ${languageInstruction}\n\n${task}\nThe researcher remains responsible for verification and approval. Return only the required structured object.\n\nCurrent derived context:\n${serialized}`;

  try {
    const client = new OpenAI({ apiKey });
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      text: { format: { type: "json_schema", name: `corpus_research_${moduleId}`, strict: true, schema: moduleId === "create" ? SETUP_SCHEMA : ANALYSIS_SCHEMA } },
    });
    const output = JSON.parse(response.output_text || "null");
    if (!validateCorpusAiOutput(moduleId, output)) return res.status(422).json({ error: "The AI response did not match the required research-preview structure." });
    return res.status(200).json({ result: output });
  } catch (error) {
    console.error("corpus-research failed", error);
    return res.status(500).json({ error: "The corpus research suggestion could not be generated reliably." });
  }
}

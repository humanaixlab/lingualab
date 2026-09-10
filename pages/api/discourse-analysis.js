import OpenAI from "openai";
import { discourseTool, validateDiscourseAiOutput } from "../../lib/discourse-analysis.js";

const MAX_TEXT_LENGTH = 12000;
const MAX_TARGET_LENGTH = 500;
const ARABIC_PATTERN = /[\u0600-\u06ff]/;

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function schemaFor(tool) {
  return {
    type: "object",
    additionalProperties: false,
    required: ["category", "evidence", "explanation"],
    properties: {
      category: { type: "string", enum: tool.categories },
      evidence: {
        type: "object",
        additionalProperties: false,
        required: ["primary", "secondary"],
        properties: {
          primary: { type: "string" },
          secondary: { type: "string" },
        },
      },
      explanation: { type: "string" },
    },
  };
}

function taskInstruction(toolId, target) {
  if (toolId === "stance") return `Classify the text's stance toward this target only: ${target}.`;
  if (toolId === "hedging-assertion") return "Identify whether the text primarily contains hedging, assertion, or neither.";
  return "Identify one primary discourse relation between two explicit spans in the text.";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const toolId = clean(req.body?.toolId);
  const text = clean(req.body?.text);
  const target = clean(req.body?.target);
  const tool = discourseTool(toolId);

  if (!tool || !text || !ARABIC_PATTERN.test(text) || (tool.requiresTarget && !target)) {
    return res.status(400).json({ error: "A valid tool, Arabic text, and required target are needed." });
  }
  if (text.length > MAX_TEXT_LENGTH || target.length > MAX_TARGET_LENGTH) {
    return res.status(413).json({ error: "The submitted content is too long." });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: "Discourse analysis AI is not configured on this deployment." });

  const prompt = `You are assisting a researcher with a narrowly scoped Arabic discourse annotation preview.

${taskInstruction(toolId, target)}

Rules:
- Choose exactly one category from: ${tool.categories.join("، ")}.
- Copy evidence spans exactly and contiguously from the submitted Arabic text. Never paraphrase or invent evidence.
- Put the first evidence span in evidence.primary.
- ${tool.requiresSecondEvidence ? "Put the second related span in evidence.secondary." : "Always return an empty string in evidence.secondary."}
- ${tool.noEvidenceCategory ? `For category «${tool.noEvidenceCategory}», return empty strings for both evidence fields.` : "Evidence is required."}
- Give one short, cautious Arabic explanation. Treat the output as a research suggestion, not a validated conclusion.
- Return only the required structured object.

Arabic text:
${text}`;

  try {
    const client = new OpenAI({ apiKey });
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          name: `discourse_${toolId.replaceAll("-", "_")}`,
          strict: true,
          schema: schemaFor(tool),
        },
      },
    });
    const output = JSON.parse(response.output_text || "null");
    if (!validateDiscourseAiOutput(toolId, text, output)) {
      return res.status(422).json({ error: "The AI response did not contain valid evidence copied from the submitted text." });
    }
    return res.status(200).json({ result: output });
  } catch (error) {
    console.error("discourse-analysis failed", error);
    return res.status(500).json({ error: "The discourse suggestion could not be generated reliably. Please try again." });
  }
}

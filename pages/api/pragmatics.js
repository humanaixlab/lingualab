import OpenAI from "openai";
import { pragmaticsTool, validatePragmaticsOutput } from "../../lib/pragmatics-analysis.js";

const MAX_TEXT_LENGTH = 12000;
const ARABIC_PATTERN = /[\u0600-\u06ff]/;

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function schemaFor(tool) {
  return {
    type: "object",
    additionalProperties: false,
    required: ["category", "evidence", "interpretation", "explanation"],
    properties: {
      category: { type: "string", enum: tool.categories },
      evidence: { type: "string" },
      interpretation: { type: "string" },
      explanation: { type: "string" },
    },
  };
}

function taskInstruction(toolId) {
  if (toolId === "speech-acts") return "Identify exactly one primary speech act from the closed category set.";
  if (toolId === "implicature") return "Decide whether one clear conversational implicature is present and state the inferred meaning.";
  return "Identify one primary deictic expression and interpret its person, place, or time reference from the supplied context when possible.";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const toolId = clean(req.body?.toolId);
  const text = clean(req.body?.text);
  const tool = pragmaticsTool(toolId);
  if (!tool || !text || !ARABIC_PATTERN.test(text)) {
    return res.status(400).json({ error: "A valid pragmatics tool and Arabic text are required." });
  }
  if (text.length > MAX_TEXT_LENGTH) return res.status(413).json({ error: "The submitted text is too long." });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: "Pragmatics AI is not configured on this deployment." });

  const prompt = `You are assisting a researcher with a narrowly scoped Arabic pragmatics annotation preview.

${taskInstruction(toolId)}

Rules:
- Choose exactly one category from: ${tool.categories.join("، ")}.
- Copy evidence exactly and contiguously from the submitted Arabic text. Never paraphrase or invent evidence.
- ${tool.noEvidenceCategory ? `For category «${tool.noEvidenceCategory}», return empty strings for evidence and interpretation.` : "Evidence is required."}
- ${tool.requiresInterpretation ? "Return a short contextual interpretation or inferred meaning grounded only in the submitted text." : "Always return an empty string in interpretation."}
- Give one short, cautious Arabic explanation. Treat the output as a research suggestion requiring researcher review.
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
          name: `pragmatics_${toolId.replaceAll("-", "_")}`,
          strict: true,
          schema: schemaFor(tool),
        },
      },
    });
    const output = JSON.parse(response.output_text || "null");
    if (!validatePragmaticsOutput(toolId, text, output)) {
      return res.status(422).json({ error: "The AI response did not contain valid evidence copied from the submitted text." });
    }
    return res.status(200).json({ result: output });
  } catch (error) {
    console.error("pragmatics-analysis failed", error);
    return res.status(500).json({ error: "The pragmatics suggestion could not be generated reliably. Please try again." });
  }
}

import OpenAI from "openai";
import { createOpenAiOutput } from "../../lib/ai-stream";

const MAX_PAYLOAD_LENGTH = 16000;

function parseJson(text) {
  return JSON.parse(String(text || "").replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim());
}

function validReview(value) {
  return value && typeof value === "object"
    && ["summary", "safeguard"].every((key) => typeof value[key] === "string" && value[key].trim())
    && ["assumptions", "alternatives", "ambiguities", "nextChecks"].every((key) => Array.isArray(value[key]) && value[key].length > 0 && value[key].every((item) => typeof item === "string" && item.trim()));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const uiLanguage = req.body?.uiLanguage === "ar" ? "ar" : "en";
  const blueprint = req.body?.blueprint && typeof req.body.blueprint === "object" ? req.body.blueprint : null;
  if (!blueprint) return res.status(400).json({ error: "A structured blueprint is required." });
  const serialized = JSON.stringify(blueprint);
  if (serialized.length > MAX_PAYLOAD_LENGTH) return res.status(413).json({ error: "The blueprint is too large." });
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: "AI methodological review is not configured on this deployment." });

  const languageRule = uiLanguage === "ar"
    ? "اكتب عربية أكاديمية طبيعية وموجزة، وأبق المصطلحات والرموز البرمجية كما هي."
    : "Write concise, natural academic English and preserve technical labels as supplied.";
  const prompt = `${languageRule}

You are LinguaLab's bounded methodological reviewer for computational-linguistics designs. Review the researcher-created blueprint below without overwriting it or presenting illustrative annotations as gold-standard truth.

Blueprint:
${serialized}

Return ONLY valid JSON with this exact shape:
{
  "summary": "a concise assessment of the internal coherence of the planned design",
  "assumptions": ["assumption that the researcher should verify"],
  "alternatives": ["one defensible alternative and when it may fit"],
  "ambiguities": ["linguistic or computational ambiguity that must remain visible"],
  "nextChecks": ["concrete validation or test to perform before implementation"],
  "safeguard": "a concise statement distinguishing planned methodology, illustrative annotation, and validated research data"
}

Do not invent corpus sources, sample sizes, labels, references, packages, benchmark results, model accuracy, completed experiments, or platform capabilities. Do not claim the rule is universally correct. For a rule-based design, preserve exceptions and REVIEW outcomes. For a learned task, distinguish task, representation, algorithm family, trained model, and evaluation. Keep every statement advisory and subject to researcher review.`;

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const generated = await createOpenAiOutput({
      client, req, res,
      request: { model: "gpt-4.1-mini", input: prompt },
      parse: parseJson,
      validate: validReview,
      envelope: (review) => ({ review }),
    });
    if (generated.streamed) return;
    return res.status(200).json({ review: generated.value });
  } catch (error) {
    console.error("nlp-builder review failed", error);
    if (error.aiStreamHandled) return;
    return res.status(500).json({ error: "The methodological review could not be generated reliably." });
  }
}

export { parseJson, validReview };

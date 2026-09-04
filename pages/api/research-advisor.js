import OpenAI from "openai";

const MAX_FIELD_LENGTH = 4000;
const ALLOWED_STAGES = new Set(["idea", "data", "analysis", "interpretation", "writing"]);

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function parseAdvisorJson(text) {
  const cleaned = String(text || "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  return JSON.parse(cleaned);
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function validateAdvisor(value) {
  if (!value || typeof value !== "object") return false;
  return ["summary", "recommendedMethod", "nextAction", "caution"].every(
    (key) => typeof value[key] === "string" && value[key].trim()
  ) && isStringArray(value.researchQuestions) && isStringArray(value.steps);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const researchGoal = clean(req.body?.researchGoal);
  const dataDescription = clean(req.body?.dataDescription);
  const currentStage = clean(req.body?.currentStage);
  const question = clean(req.body?.question);
  const uiLanguage = req.body?.uiLanguage === "ar" ? "ar" : "en";

  if (!researchGoal || !dataDescription || !ALLOWED_STAGES.has(currentStage)) {
    return res.status(400).json({
      error: "Research goal, data description, and a valid stage are required.",
    });
  }

  if ([researchGoal, dataDescription, question].some((field) => field.length > MAX_FIELD_LENGTH)) {
    return res.status(413).json({ error: "One or more fields are too long." });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: "The AI Research Advisor is not configured on this deployment.",
    });
  }

  const prompt = `You are LinguaLab's AI Research Advisor for Arabic-language research.
Your role is to help the user make a defensible next research decision, not to invent findings.

Research goal:
${researchGoal}

Data:
${dataDescription}

Current stage:
${currentStage}

User question:
${question || "What should I do next?"}

Return ONLY valid JSON with this exact shape:
{
  "summary": "2-3 sentence assessment",
  "researchQuestions": ["question 1", "question 2", "question 3"],
  "recommendedMethod": "a concise method recommendation with rationale",
  "steps": ["step 1", "step 2", "step 3", "step 4"],
  "nextAction": "one concrete next action the user can take now",
  "caution": "one important limitation, validity risk, or ethics note"
}

Write every response value directly in ${uiLanguage === "ar" ? "natural academic Arabic" : "clear academic English"}. Keep the JSON field names exactly as specified in English. Do not translate dataset content, filenames, column names, user-provided quotations, or original citations. Respect Arabic-data considerations such as normalization, dialect, annotation quality, class imbalance, and interpretability when relevant. Never claim that an analysis has been run unless the user explicitly says so.`;

  try {
    const client = new OpenAI({ apiKey });
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const advisor = parseAdvisorJson(response.output_text);
    if (!validateAdvisor(advisor)) {
      throw new Error("Advisor response did not match the expected shape.");
    }

    return res.status(200).json({ advisor });
  } catch (error) {
    console.error("research-advisor failed", error);
    return res.status(500).json({
      error: "The advisor could not generate a reliable plan. Please try again.",
    });
  }
}

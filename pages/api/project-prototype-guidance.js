import OpenAI from "openai";
import { PROJECT_CATALOG } from "../../lib/project-catalog";
import { getPrototypePromptContext } from "../../lib/project-guides";

const cleanLanguage = (value) => value === "ar" ? "ar" : "en";

function parseJson(text) {
  return JSON.parse(String(text || "").replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim());
}

function validGuidance(value) {
  const strings = ["purpose", "intendedUsers", "inputs", "outputs", "method", "starterCodeDirection", "testing", "evaluation", "improvement", "caution"];
  return value && typeof value === "object" && strings.every((key) => typeof value[key] === "string" && value[key].trim()) && ["processingFlow", "architecture", "pseudocode"].every((key) => Array.isArray(value[key]) && value[key].length && value[key].every((item) => typeof item === "string" && item.trim()));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const projectId = typeof req.body?.projectId === "string" ? req.body.projectId.trim() : "";
  const language = cleanLanguage(req.body?.uiLanguage);
  const project = PROJECT_CATALOG.find((item) => item.id === projectId);
  const context = project ? getPrototypePromptContext(project) : null;
  if (!context) return res.status(400).json({ error: "This project does not support prototype guidance." });
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: "AI prototype guidance is not configured on this deployment." });

  const localized = (value) => value[language];
  const languageRule = language === "ar" ? "Write concise, natural academic Arabic." : "Write concise academic English.";
  const prompt = `${languageRule}
You are providing bounded, AI-supported prototype guidance for a computational-linguistics research project. This is guidance, not measured evidence, definitive engineering advice, or production-ready software.

Project: ${project.id}
Path: ${localized(context.path)}
Research problem: ${localized(context.problem)}
Proposed solution: ${localized(context.solution)}
Intended users: ${localized(context.users)}
Inputs: ${localized(context.inputs)}
Outputs: ${localized(context.outputs)}
Method: ${localized(context.method)}
Prototype logic: ${localized(context.logic)}

Return ONLY JSON with this exact shape:
{
  "purpose": "what the prototype would do",
  "intendedUsers": "who would use it",
  "inputs": "required inputs",
  "outputs": "expected outputs",
  "method": "linguistic/computational method and whether it is deterministic or AI-supported",
  "processingFlow": ["step 1", "step 2", "step 3"],
  "architecture": ["component 1", "component 2", "component 3"],
  "pseudocode": ["plain-language step 1", "plain-language step 2", "plain-language step 3"],
  "starterCodeDirection": "safe starter/example-code direction",
  "testing": "how to test with documented cases",
  "evaluation": "how to evaluate without fabricating metrics",
  "improvement": "what to inspect and change after testing",
  "caution": "one research, licensing, or engineering limitation"
}

Do not invent data, results, metrics, reference labels, software capabilities, URLs, packages, credentials, or external resources. Do not copy code from repositories. Do not provide production deployment instructions. Any pseudocode or starter-code direction must be explicitly suitable only as an example requiring researcher review and testing. Keep deterministic/computed results, AI-supported interpretation, and researcher decisions separate.`;

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({ model: "gpt-4.1-mini", input: prompt });
    const guidance = parseJson(response.output_text);
    if (!validGuidance(guidance)) throw new Error("Prototype guidance did not match the expected shape.");
    return res.status(200).json({ guidance });
  } catch (error) {
    console.error("project-prototype-guidance failed", error);
    return res.status(500).json({ error: "Prototype guidance could not be generated reliably." });
  }
}

import OpenAI from "openai";
import { advisorOutputLanguageInstruction, normalizeAdvisorUiLanguage } from "../../lib/advisor-language";

const MAX_QUESTION = 1200;
const MAX_CONTEXT = 12000;
const ALLOWED_KINDS = new Set(["path", "project"]);

function clean(value) { return typeof value === "string" ? value.trim() : ""; }
function safeContext(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const serialized = JSON.stringify(value);
  if (serialized.length > MAX_CONTEXT) return null;
  return value;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const kind = clean(req.body?.kind);
  const question = clean(req.body?.question);
  const context = safeContext(req.body?.context);
  const uiLanguage = normalizeAdvisorUiLanguage(req.body?.uiLanguage);
  if (!ALLOWED_KINDS.has(kind) || !question || question.length > MAX_QUESTION || !context) {
    return res.status(400).json({ error: "A valid advisor context and question are required." });
  }
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: "The contextual advisor is not configured on this deployment." });

  const outputLanguageInstruction = advisorOutputLanguageInstruction(uiLanguage);
  const role = kind === "project" ? "Project Advisor" : "Research Path Advisor";
  const boundaries = kind === "project"
    ? "Explain how to execute THIS project. Discuss data, sampling, annotation when relevant, representation, computational task, evaluation, error analysis, LinguaLab/external boundaries, and prototype potential. Do not invent project facts or claim work was executed. A prototype is optional, not an inevitable outcome."
    : "Explain THIS research path in context. Discuss suitable questions, data, linguistic information, task-appropriate representation, computational tasks, annotation only when relevant, evaluation, boundaries, and appropriate next LinguaLab tool. Do not turn the path into a complete application or claim one capability solves an entire product.";

  const prompt = `${outputLanguageInstruction}\n\nYou are LinguaLab's contextual ${role} inside an intelligent computational-linguistics research environment.\nYou are not a generic chatbot. Ground the answer in the supplied on-page context.\n${boundaries}\nPreserve these scientific distinctions: application != algorithm; research path != complete application; Python is an implementation language, not the algorithm; evaluation != execution; error analysis != metrics; linguistic validity != code correctness; representation depends on the task; annotation is not always required.\nIf the question reaches formal algorithm design, implementation, or actual data analysis, explain the boundary and point to NLP Builder, Code Builder, or Analyze only when appropriate. Research Advisor remains the place for broader study-design advice.\nBe concise but substantive. If context does not support a claim, say what must be decided or verified instead of inventing it.\n\nCurrent ${kind} context:\n${JSON.stringify(context, null, 2)}\n\nUser question:\n${question}\n\nReturn plain text only, with short readable paragraphs or bullets when useful.\n${outputLanguageInstruction}`;

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({ model: "gpt-4.1-mini", input: prompt });
    const answer = clean(response.output_text);
    if (!answer) throw new Error("empty contextual advisor response");
    return res.status(200).json({ answer });
  } catch (error) {
    console.error("contextual-advisor failed", error);
    return res.status(500).json({ error: "The contextual advisor could not generate a reliable answer." });
  }
}
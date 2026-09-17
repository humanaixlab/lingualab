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

function writeEvent(res, type, payload = {}) {
  res.write(`${JSON.stringify({ type, ...payload })}\n`);
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

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.flushHeaders?.();

  let sentText = false;
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const stream = await client.responses.create({ model: "gpt-4.1-mini", input: prompt, stream: true });
    writeEvent(res, "start");
    for await (const event of stream) {
      if (event.type === "response.output_text.delta" && event.delta) {
        sentText = true;
        writeEvent(res, "delta", { delta: event.delta });
      }
      if (event.type === "response.failed") {
        throw new Error(event.response?.error?.message || "contextual advisor stream failed");
      }
    }
    if (!sentText) throw new Error("empty contextual advisor response");
    writeEvent(res, "done");
    return res.end();
  } catch (error) {
    console.error("contextual-advisor failed", error);
    writeEvent(res, "error", { message: sentText ? "The stream ended before the answer was complete." : "The contextual advisor could not generate a reliable answer." });
    return res.end();
  }
}
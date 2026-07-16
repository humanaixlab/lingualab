import OpenAI from "openai";

const MAX_TEXT_LENGTH = 12000;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: "AI analysis is not configured on this deployment.",
    });
  }

  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return res.status(413).json({
      error: `Text must be ${MAX_TEXT_LENGTH.toLocaleString()} characters or fewer.`,
    });
  }

  try {
    const client = new OpenAI({ apiKey });
    const prompt = `حلل النص التالي تحليلًا لغويًا مبسطًا:\n\n${text}\n\nأعطني:\n1. نوع النص\n2. ملخص قصير\n3. أهم الكلمات\n4. ملاحظات لغوية`;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    return res.status(200).json({
      result: response.output_text || "لم يتم توليد نتيجة.",
    });
  } catch (error) {
    console.error("analyze-ai failed", error);
    return res.status(500).json({ error: "AI analysis failed. Please try again." });
  }
}

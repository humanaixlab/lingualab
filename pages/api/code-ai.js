import OpenAI from "openai";

const MAX_FIELD_LENGTH = 6000;

function cleanField(value) {
  return typeof value === "string" ? value.trim() : "";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: "The code assistant is not configured on this deployment.",
    });
  }

  const task = cleanField(req.body?.task);
  const language = cleanField(req.body?.language);
  const details = cleanField(req.body?.details);

  if (!task || !language) {
    return res.status(400).json({ error: "Task and language are required" });
  }
  if ([task, language, details].some((value) => value.length > MAX_FIELD_LENGTH)) {
    return res.status(413).json({ error: "Request fields are too long." });
  }

  try {
    const client = new OpenAI({ apiKey });
    const prompt = `أنت مساعد برمجي تعليمي لطالبات اللسانيات الحاسوبية.\n\nالمهمة:\n${task}\n\nاللغة:\n${language}\n\nتفاصيل إضافية:\n${details || "لا يوجد"}\n\nأعطني:\n1. عنوان بسيط\n2. الكود فقط\n3. شرح بالعربية\n4. خطوات التشغيل`;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    return res.status(200).json({
      result: response.output_text || "لم يتم توليد نتيجة.",
    });
  } catch (error) {
    console.error("code-ai failed", error);
    return res.status(500).json({ error: "Code generation failed. Please try again." });
  }
}

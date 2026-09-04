import OpenAI from "openai";

const MAX_TEXT_LENGTH = 12000;

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanTopWords(value) {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (item) =>
        Array.isArray(item) &&
        typeof item[0] === "string" &&
        Number.isFinite(Number(item[1]))
    )
    .slice(0, 10)
    .map(([word, count]) => [word.trim(), Number(count)]);
}

function parseJson(text) {
  const cleaned = String(text || "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  return JSON.parse(cleaned);
}

function isValidInterpretation(value) {
  if (!value || typeof value !== "object") return false;

  return [
    "interpretation",
    "methodologicalImplications",
    "limitations",
    "nextStep",
    "paperParagraph",
  ].every((key) => typeof value[key] === "string" && value[key].trim());
}

function createPreview({ wordCount, sentenceCount, topWords, uiLanguage }) {
  const repeated = topWords[0];
  if (uiLanguage === "ar") {
    const focus = repeated
      ? `العنصر الأكثر تكرارًا هو «${repeated[0]}» (${repeated[1]} مرة)، مما يشير إلى تركز معجمي ظاهر في هذه العينة.`
      : "لم تُرصد إشارة معجمية متكررة بوضوح في العينة المقدمة.";
    const smallSample = wordCount < 100 || sentenceCount <= 1;
    return {
      interpretation: smallSample
        ? `يظل الملف المعجمي استكشافيًا وغير ممثل بسبب محدودية المادة المقدمة. ${focus}`
        : `يقدم الملف المعجمي المرصود وصفًا أوليًا للأنماط اللغوية المتكررة. ${focus}`,
      methodologicalImplications: "تدعم هذه النتائج الوصفية انتقالًا حذرًا إلى تحليل الكلمات المفتاحية في سياقها، أو مراجعة السياقات، أو المقارنة بين مجموعات ذات دلالة قبل صياغة استنتاجات أقوى.",
      limitations: "لا تكفي أدلة التكرار السطحي وحدها لإثبات العلاقات الدلالية أو المشاعر أو السببية أو بنية الموضوعات أو الدلالة الإحصائية أو قابلية تعميم النتائج على المجتمع.",
      nextStep: "افحص أكثر المفردات تكرارًا في سياقاتها، وقارن تكراراتها المعيارية بين الفئات أو المدونات الفرعية ذات الصلة.",
      paperParagraph: smallSample
        ? "ينبغي التعامل مع الملف المعجمي الأولي بوصفه توضيحيًا لا تمثيليًا؛ لأنه مستمد من عينة نصية محدودة للغاية. وعلى الرغم من ظهور مجموعة صغيرة من الصيغ المتكررة، فإن تقديم تفسير لغوي موضوعي يقتضي إجراء تحليل سياقي ومقارن إضافي."
        : "يكشف الملف المعجمي الأولي عن صيغ متكررة قد تستحق فحصًا سياقيًا أدق. وتوفر هذه الأنماط الوصفية أساسًا استكشافيًا لتحليلات لاحقة للسياقات والمقارنات، لكنها لا تسوغ بمفردها استنتاجات موضوعية عن المعنى أو السلوك اللغوي.",
    };
  }
  const focus = repeated
    ? `The most frequent item is “${repeated[0]}” (${repeated[1]} occurrences), indicating a visible lexical concentration in this sample.`
    : "No strong recurring lexical signal was detected in the submitted sample.";

  const smallSample = wordCount < 100 || sentenceCount <= 1;

  return {
    interpretation: smallSample
      ? `The lexical profile is exploratory rather than representative because the submitted material is very limited. ${focus}`
      : `The observed lexical profile provides an initial account of recurring language patterns. ${focus}`,
    methodologicalImplications:
      "These descriptive findings support a cautious transition to contextual keyword analysis, concordance review, or comparison across meaningful groups before stronger claims are made.",
    limitations:
      "Surface-frequency evidence alone cannot establish semantic relations, sentiment, causality, topic structure, statistical significance, or population-level generalizability.",
    nextStep:
      "Inspect the most frequent terms in context and compare their normalized frequencies across relevant categories or subcorpora.",
    paperParagraph: smallSample
      ? "The preliminary lexical profile should be treated as illustrative rather than representative because it is derived from a very limited text sample. Although a small set of recurring forms is visible, contextual and comparative analysis is required before any substantive linguistic interpretation can be advanced."
      : "The preliminary lexical profile identifies recurring forms that may warrant closer contextual investigation. These descriptive patterns provide an exploratory basis for subsequent concordance and comparative analyses, but they do not independently support substantive claims about meaning or linguistic behavior.",
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const text = cleanText(req.body?.text);
  const wordCount = Number(req.body?.wordCount);
  const sentenceCount = Number(req.body?.sentenceCount);
  const topWords = cleanTopWords(req.body?.topWords);
  const datasetContext = cleanText(req.body?.datasetContext);
  const uiLanguage = req.body?.uiLanguage === "ar" ? "ar" : "en";

  if (!text || !Number.isFinite(wordCount) || !Number.isFinite(sentenceCount)) {
    return res
      .status(400)
      .json({ error: "Text and valid analysis results are required." });
  }

  if (text.length > MAX_TEXT_LENGTH || datasetContext.length > 4000) {
    return res.status(413).json({ error: "The submitted content is too long." });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(200).json({
      interpretation: createPreview({ wordCount, sentenceCount, topWords, uiLanguage }),
      preview: true,
    });
  }

  const frequencySummary = topWords.length
    ? topWords.map(([word, count]) => `${word}: ${count}`).join(", ")
    : "No repeated terms available";

  const sampleScale =
    wordCount < 100 || sentenceCount <= 1
      ? "very small and illustrative"
      : wordCount < 500
        ? "small and exploratory"
        : wordCount < 5000
          ? "moderate and suitable for preliminary descriptive interpretation"
          : "substantial enough for broader descriptive interpretation, while still requiring methodological caution";

  const prompt = `You are LinguaLab's AI Research Interpreter, a specialist research assistant for Arabic-language studies, corpus linguistics, computational linguistics, discourse analysis, and research methodology.

Your task is to transform descriptive text-analysis evidence into a cautious, academically defensible interpretation. Do not merely restate counts. Explain what the supplied evidence may suggest, what it cannot establish, and what the researcher should do next.

CORE PRINCIPLES
- Use only the supplied text, counts, recurring terms, and optional dataset context.
- Never invent labels, metadata, significance tests, causes, sentiment, author intention, topic dominance, genre certainty, discourse function, or population-level claims.
- Distinguish clearly between direct observation and interpretation.
- Use calibrated language such as "suggests", "may indicate", "appears consistent with", "shows features associated with", or "warrants further investigation".
- Avoid categorical wording such as "proves", "confirms", "demonstrates", or "establishes" unless the supplied evidence genuinely supports it.
- The current evidence scale is: ${sampleScale}.
- If the material is very small, state explicitly that it is illustrative, exploratory, and non-representative.
- If evidence is ambiguous, say so rather than forcing a classification.

EVIDENCE-FIRST REASONING
- Before writing each sentence, verify that it is directly supported by the submitted text, descriptive statistics, recurring terms, or optional dataset context.
- If no explicit evidence supports a statement, do not include it.
- Do not infer communicative intention, target audience, discourse goal, contextual setting, or specific real-world circumstances unless they are directly observable in the supplied evidence.
- Prefer cautious formulations such as "appears consistent with", "may reflect", or "is compatible with" rather than categorical formulations such as "is", "was written to", "aims to", "targets", or "demonstrates".
- Every interpretive claim must remain traceable to observable evidence.

TEXT-TYPE AWARENESS
Before writing the five fields, infer the most plausible text type internally from the submitted sample. Possible types include academic prose, news reporting, poetry, literary prose, narrative, interview, social-media post, advertisement, institutional communication, legal or administrative text, instructional text, recipe, dialogue, and opinion writing.

Do not output a separate text-type label. Incorporate text-type awareness only when the evidence is strong enough, and use cautious phrasing for short or ambiguous samples.
Text-type awareness is only an interpretive lens for evidence already present. It must never introduce new facts, intentions, audiences, circumstances, or discourse purposes.

When relevant, adapt the interpretation as follows:
- Poetry: imagery, compression, repetition, rhythm, figurative language, line-level structure.
- News: attribution, information density, reporting verbs, stance, headline-like framing.
- Academic prose: terminology, argumentation, cohesion, evidential language, disciplinary register.
- Social media: brevity, informality, stance, interactional markers, hashtags, compression.
- Narrative or literary prose: sequencing, perspective, characterization, temporal structure, event progression.
- Instructional or recipe text: procedural language, imperatives, sequencing, domain-specific vocabulary.
- Advertisement: persuasion, evaluation, calls to action, audience positioning.
- Institutional, legal, or administrative text: formality, directives, obligations, modality, and administrative register.
- Interview or dialogue: turn-taking, stance, interactional markers, question-answer structure.

ARABIC-LANGUAGE AWARENESS
- Mention Arabic-specific issues only when genuinely relevant to the observed evidence.
- Relevant issues may include tokenization, clitic segmentation, normalization, stop words, attached prepositions or pronouns, orthographic variation, dialect, punctuation, and script conventions.
- Do not treat a frequent Arabic function word as topical evidence.
- Do not assume Modern Standard Arabic, dialect, or genre unless the sample supports that inference.

ANALYTICAL AWARENESS
- Interpret only the analyses actually supplied.
- The current input contains surface counts and frequent terms only.
- Do not claim sentiment, topic modeling, POS patterns, syntactic relations, semantic clusters, collocations, significance, or prediction performance unless those results are explicitly provided.
- When proposing a next step, choose one analysis that fits both the available evidence and the likely text type.
- Appropriate next steps may include concordance analysis, normalized frequency comparison, keyword analysis, collocation analysis, POS tagging, dependency parsing, discourse analysis, metaphor analysis, terminology extraction, semantic clustering, topic modeling, or comparison against a reference corpus.

WRITING STANDARD
- Write every response value directly in ${uiLanguage === "ar" ? "natural, publication-quality academic Arabic" : "concise, publication-quality academic English"}.
- Keep JSON field names exactly as specified in English. Do not translate field names, quoted source material, dataset content, filenames, column names, or original citations.
- Sound like a careful discussion section in a peer-reviewed article, not a generic chatbot.
- Avoid filler, repetition, inflated claims, and unnecessary technical jargon.
- Do not repeat statistics already visible in the interface unless one value is essential to a research claim.
- Keep the five fields meaningfully distinct:
  1. interpretation = what the evidence may suggest;
  2. methodologicalImplications = how the evidence should shape research design;
  3. limitations = what cannot be concluded and why;
  4. nextStep = one concrete, best next analysis;
  5. paperParagraph = an original, publication-ready synthesis rather than a repetition of the interpretation.
- Every interpretation must remain traceable to observable evidence; avoid plausible but unsupported elaboration.
- Keep "interpretation", "methodologicalImplications", "limitations", and "nextStep" concise.
- Keep "paperParagraph" to approximately 90-150 words.

INPUT TEXT
${text}

DESCRIPTIVE RESULTS
- Word count: ${wordCount}
- Sentence count: ${sentenceCount}
- Most frequent terms: ${frequencySummary}

OPTIONAL DATASET CONTEXT
${datasetContext || "No additional dataset context was provided."}

Return ONLY valid JSON. Do not use markdown fences, headings, commentary, or extra keys.

Use exactly this structure:
{
  "interpretation": "Explain what the observed lexical profile may suggest, using text-type awareness only when justified and without simply repeating the counts.",
  "methodologicalImplications": "Explain how the evidence should shape the research design or analytical strategy.",
  "limitations": "State the strongest evidence-specific limitation and identify conclusions that must not be drawn.",
  "nextStep": "Recommend one concrete analysis or validation step that best fits the evidence and likely text type.",
  "paperParagraph": "Write one cautious, coherent, publication-ready paragraph suitable for a preliminary Results or Discussion section."
}`;

  try {
    const client = new OpenAI({ apiKey });
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const interpretation = parseJson(response.output_text);

    if (!isValidInterpretation(interpretation)) {
      throw new Error("Interpreter response did not match the expected shape.");
    }

    return res.status(200).json({ interpretation, preview: false });
  } catch (error) {
    console.error("research-interpreter failed", error);

    return res.status(500).json({
      error:
        "The research interpreter could not generate a reliable explanation. Please try again.",
    });
  }
}


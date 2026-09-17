import { useState } from "react";

const COPY = {
  ar: {
    pathTitle: "مستشار المسار الذكي",
    projectTitle: "مستشار المشروع الذكي",
    pathLead: "اسأل عن هذا المسار وبياناته وتمثيلاته ومهامه الحاسوبية وحدوده.",
    projectLead: "اسأل عن آلية تنفيذ هذا المشروع وبياناته وتقييمه وحدود التنفيذ.",
    ask: "اسأل عن هذا السياق…",
    send: "اسأل المستشار",
    loading: "يفكر المستشار…",
    error: "تعذر الحصول على إجابة موثوقة الآن. حاول مرة أخرى.",
    boundary: "الإرشاد سياقي ولا يعني تنفيذ التحليل أو اتخاذ القرار البحثي نيابةً عن الباحث.",
  },
  en: {
    pathTitle: "Smart Path Advisor",
    projectTitle: "Smart Project Advisor",
    pathLead: "Ask about this path, its data, representations, computational tasks, and boundaries.",
    projectLead: "Ask how to execute this project, prepare its data, evaluate it, and understand execution boundaries.",
    ask: "Ask about this context…",
    send: "Ask advisor",
    loading: "Advisor is thinking…",
    error: "A reliable answer is unavailable right now. Please try again.",
    boundary: "Contextual guidance does not run an analysis or make the research decision for the researcher.",
  },
};

export const PATH_ADVISOR_QUESTIONS = {
  ar: ["لماذا أحتاج هذا المسار؟", "ما نوع الأسئلة البحثية التي يناسبها؟", "ما البيانات المناسبة؟", "ما المعلومات اللغوية التي أحتاجها؟", "كيف تُمثّل هذه المعلومات حاسوبيًا؟", "ما المهام الحاسوبية الممكنة؟", "هل أحتاج إلى Annotation؟", "كيف أقيم النتائج؟", "ما حدود هذا المسار؟", "إلى أي أداة في LinguaLab أنتقل بعد ذلك؟"],
  en: ["Why do I need this path?", "What research questions fit it?", "What data is suitable?", "What linguistic information do I need?", "How should that information be represented computationally?", "What computational tasks are possible?", "Do I need annotation?", "How should I evaluate results?", "What are this path's boundaries?", "Which LinguaLab tool should I use next?"],
};

export const PROJECT_ADVISOR_QUESTIONS = {
  ar: ["كيف أبدأ تنفيذ هذا المشروع؟", "ما البيانات التي أحتاجها؟", "كيف أبني العينة؟", "هل أحتاج إلى Annotation؟", "ما أفضل طريقة لتمثيل البيانات؟", "ما المهمة الحاسوبية المناسبة هنا؟", "كيف أقيم النتائج؟", "ما الأخطاء التي ينبغي تحليلها؟", "ما الذي أستطيع تنفيذه داخل LinguaLab وما الذي يجب تنفيذه خارجه؟", "كيف أحول نتائج هذا المشروع إلى Prototype؟"],
  en: ["How do I start implementing this project?", "What data do I need?", "How should I build the sample?", "Do I need annotation?", "What is the best way to represent the data?", "What computational task fits here?", "How should I evaluate the results?", "What errors should I analyze?", "What can I do inside LinguaLab and what must be done outside it?", "How can I turn the project results into a prototype?"],
};

export default function ContextualAdvisor({ language = "en", kind = "path", context }) {
  const locale = language === "ar" ? "ar" : "en";
  const copy = COPY[locale];
  const questions = kind === "project" ? PROJECT_ADVISOR_QUESTIONS[locale] : PATH_ADVISOR_QUESTIONS[locale];
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function ask(value = question) {
    const clean = String(value || "").trim();
    if (!clean || loading) return;
    setQuestion(clean);
    setLoading(true);
    setError("");
    setAnswer("");
    try {
      const response = await fetch("/api/contextual-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, question: clean, context, uiLanguage: locale }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.answer) throw new Error(payload.error || "advisor unavailable");
      setAnswer(payload.answer);
    } catch {
      setError(copy.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="contextualAdvisor" dir={locale === "ar" ? "rtl" : "ltr"} aria-label={kind === "project" ? copy.projectTitle : copy.pathTitle}>
      <div className="contextualAdvisorHead">
        <strong>{kind === "project" ? copy.projectTitle : copy.pathTitle}</strong>
        <p>{kind === "project" ? copy.projectLead : copy.pathLead}</p>
      </div>
      <div className="contextualAdvisorPrompts">
        {questions.map((item) => <button type="button" key={item} onClick={() => ask(item)} disabled={loading}>{item}</button>)}
      </div>
      <div className="contextualAdvisorAsk">
        <textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={copy.ask} rows={2} maxLength={1200} />
        <button type="button" onClick={() => ask()} disabled={loading || !question.trim()}>{loading ? copy.loading : copy.send}</button>
      </div>
      {answer && <div className="contextualAdvisorAnswer" aria-live="polite"><p>{answer}</p></div>}
      {error && <p className="contextualAdvisorError" role="alert">{error}</p>}
      <small className="contextualAdvisorBoundary">{copy.boundary}</small>
      <style jsx>{`
        .contextualAdvisor{margin:1rem 0;padding:1rem;border:1px solid var(--border-color,#d8dee8);border-radius:16px;background:var(--surface,#fff)}
        .contextualAdvisorHead p{margin:.35rem 0 .8rem;color:var(--muted,#5b6472)}
        .contextualAdvisorPrompts{display:flex;flex-wrap:wrap;gap:.45rem;margin-bottom:.8rem}
        .contextualAdvisorPrompts button{border:1px solid var(--border-color,#d8dee8);background:transparent;border-radius:999px;padding:.45rem .7rem;cursor:pointer;text-align:start}
        .contextualAdvisorAsk{display:grid;grid-template-columns:1fr auto;gap:.6rem;align-items:stretch}
        textarea{width:100%;resize:vertical;border:1px solid var(--border-color,#d8dee8);border-radius:10px;padding:.65rem;font:inherit;direction:inherit}
        .contextualAdvisorAsk button{border:0;border-radius:10px;padding:.65rem .9rem;cursor:pointer;background:var(--accent,#2447d8);color:white}
        button:disabled{opacity:.55;cursor:not-allowed}
        .contextualAdvisorAnswer{margin-top:.8rem;padding:.8rem;border-radius:10px;background:var(--surface-subtle,#f6f8fb);white-space:pre-wrap}
        .contextualAdvisorError{margin:.7rem 0;color:#a22}
        .contextualAdvisorBoundary{display:block;margin-top:.65rem;color:var(--muted,#5b6472)}
        @media(max-width:640px){.contextualAdvisorAsk{grid-template-columns:1fr}}
      `}</style>
    </section>
  );
}
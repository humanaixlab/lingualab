import { useState } from "react";

const COPY = {
  ar: {
    pathTitle: "مستشار المسار الذكي", projectTitle: "مستشار المشروع الذكي", labTitle: "مستشار المختبر الذكي",
    pathLead: "اسأل عن هذا المسار وبياناته وتمثيلاته ومهامه الحاسوبية وحدوده.",
    projectLead: "اسأل عن آلية تنفيذ هذا المشروع وبياناته وتقييمه وحدود التنفيذ.",
    labLead: "اسأل عمّا تفعله الآن في المختبر: البيانات، الأداة، النتيجة، تفسيرها، حدودها، أو الخطوة التالية.",
    ask: "اسأل عن هذا السياق…", send: "اسأل المستشار", loading: "يحلل المستشار سياقك…",
    streaming: "يكتب المستشار الإجابة…", you: "أنت", advisor: "المستشار",
    error: "تعذر الحصول على إجابة موثوقة الآن. حاول مرة أخرى.",
    partialError: "انقطع توليد الإجابة. أبقينا الجزء الذي وصل، لكنه ليس إجابة نهائية مكتملة.",
    boundary: "الإرشاد سياقي ولا يعني تنفيذ التحليل أو اتخاذ القرار البحثي نيابةً عن الباحث.",
  },
  en: {
    pathTitle: "Smart Path Advisor", projectTitle: "Smart Project Advisor", labTitle: "Smart Lab Advisor",
    pathLead: "Ask about this path, its data, representations, computational tasks, and boundaries.",
    projectLead: "Ask how to execute this project, prepare its data, evaluate it, and understand execution boundaries.",
    labLead: "Ask about your current lab work: data, tool, result, interpretation, limitations, or next step.",
    ask: "Ask about this context…", send: "Ask advisor", loading: "Advisor is analyzing the context…",
    streaming: "Advisor is writing the answer…", you: "You", advisor: "Advisor",
    error: "A reliable answer is unavailable right now. Please try again.",
    partialError: "The answer stream was interrupted. The received text remains visible, but it is not a complete final answer.",
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
export const LAB_ADVISOR_QUESTIONS = {
  ar: ["ماذا أفعل الآن؟", "لماذا أستخدم هذه الأداة؟", "هل البيانات الحالية مناسبة؟", "كيف أفسر هذه النتيجة؟", "ما الذي لا أستطيع استنتاجه من هذه النتيجة؟", "ما الخطوة التالية؟"],
  en: ["What should I do now?", "Why am I using this tool?", "Is the current data suitable?", "How should I interpret this result?", "What can I not conclude from this result?", "What should I do next?"],
};

function parseNdjson(buffer, onEvent) {
  const lines = buffer.split("\n"); const remainder = lines.pop() || "";
  for (const line of lines) { if (line.trim()) onEvent(JSON.parse(line)); }
  return remainder;
}

export default function ContextualAdvisor({ language = "en", kind = "path", context }) {
  const locale = language === "ar" ? "ar" : "en"; const copy = COPY[locale];
  const questions = kind === "project" ? PROJECT_ADVISOR_QUESTIONS[locale] : kind === "lab" ? LAB_ADVISOR_QUESTIONS[locale] : PATH_ADVISOR_QUESTIONS[locale];
  const title = kind === "project" ? copy.projectTitle : kind === "lab" ? copy.labTitle : copy.pathTitle;
  const lead = kind === "project" ? copy.projectLead : kind === "lab" ? copy.labLead : copy.pathLead;
  const [question, setQuestion] = useState(""); const [submittedQuestion, setSubmittedQuestion] = useState(""); const [answer, setAnswer] = useState(""); const [loading, setLoading] = useState(false); const [streaming, setStreaming] = useState(false); const [error, setError] = useState("");

  async function ask(value = question) {
    const clean = String(value || "").trim(); if (!clean || loading) return;
    setQuestion(clean); setSubmittedQuestion(clean); setLoading(true); setStreaming(false); setError(""); setAnswer(""); let received = "";
    try {
      const response = await fetch("/api/contextual-advisor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, question: clean, context, uiLanguage: locale }) });
      if (!response.ok || !response.body) throw new Error("advisor unavailable");
      const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = ""; let completed = false;
      const handleEvent = (event) => { if (event.type === "delta" && typeof event.delta === "string") { received += event.delta; setAnswer(received); setStreaming(true); } else if (event.type === "done") { completed = true; setStreaming(false); } else if (event.type === "error") throw new Error(event.message || "stream failed"); };
      while (true) { const { value: chunk, done } = await reader.read(); buffer += decoder.decode(chunk || new Uint8Array(), { stream: !done }); buffer = parseNdjson(buffer, handleEvent); if (done) break; }
      if (buffer.trim()) handleEvent(JSON.parse(buffer)); if (!completed || !received.trim()) throw new Error("incomplete stream");
    } catch { setStreaming(false); setError(received ? copy.partialError : copy.error); } finally { setLoading(false); }
  }

  const status = loading ? (streaming ? copy.streaming : copy.loading) : "";
  return <section className="contextualAdvisor" dir={locale === "ar" ? "rtl" : "ltr"} aria-label={title}>
    <div className="contextualAdvisorHead"><strong>{title}</strong><p>{lead}</p></div>
    <div className="contextualAdvisorPrompts">{questions.map((item) => <button type="button" key={item} onClick={() => ask(item)} disabled={loading}>{item}</button>)}</div>
    {submittedQuestion && <div className="liveConversation" aria-live="polite"><article className="message questionMessage"><header><span className="speakerIcon" aria-hidden="true">●</span><strong>{copy.you}</strong></header><p>{submittedQuestion}</p></article><article className={`message advisorMessage${streaming ? " isStreaming" : ""}`} aria-busy={loading}><header><span className="advisorMark" aria-hidden="true">✦</span><strong>{title}</strong></header>{!answer && loading && <div className="typingState" role="status"><span className="typingDots" aria-hidden="true"><i /><i /><i /></span><span>{status}</span></div>}{answer && <div className="answerFlow"><p>{answer}</p>{streaming && <span className="streamCursor" aria-hidden="true" />}</div>}{answer && streaming && <div className="typingState subtle" role="status"><span className="typingDots" aria-hidden="true"><i /><i /><i /></span><span>{copy.streaming}</span></div>}{error && <p className="contextualAdvisorError" role="alert">{error}</p>}</article></div>}
    <div className="contextualAdvisorAsk"><textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={copy.ask} rows={2} maxLength={1200} /><button type="button" onClick={() => ask()} disabled={loading || !question.trim()}>{loading ? copy.loading : copy.send}</button></div><small className="contextualAdvisorBoundary">{copy.boundary}</small>
    <style jsx>{`.contextualAdvisor{margin:1rem 0;padding:1rem;border:1px solid var(--border-color,#d8dee8);border-radius:16px;background:var(--surface,#fff)}.contextualAdvisorHead p{margin:.35rem 0 .8rem;color:var(--muted,#5b6472)}.contextualAdvisorPrompts{display:flex;flex-wrap:wrap;gap:.45rem;margin-bottom:.9rem}.contextualAdvisorPrompts button{border:1px solid var(--border-color,#d8dee8);background:transparent;border-radius:999px;padding:.45rem .7rem;cursor:pointer;text-align:start}.liveConversation{display:grid;gap:.7rem;margin:.8rem 0 1rem}.message{border:1px solid var(--border-color,#d8dee8);border-radius:14px;padding:.85rem .95rem;text-align:start;overflow:hidden}.message header{display:flex;align-items:center;gap:.5rem;margin-bottom:.55rem;color:var(--muted,#5b6472);font-size:.9rem}.message p{margin:0;line-height:1.85;white-space:pre-wrap;unicode-bidi:plaintext}.questionMessage{background:var(--surface-subtle,#f6f8fb)}.questionMessage .speakerIcon{font-size:.55rem;color:var(--accent,#2447d8)}.advisorMessage{background:var(--surface,#fff);border-color:color-mix(in srgb,var(--accent,#2447d8) 25%,var(--border-color,#d8dee8));min-height:92px;transition:min-height .18s ease}.advisorMark{display:grid;place-items:center;width:1.65rem;height:1.65rem;border-radius:50%;background:color-mix(in srgb,var(--accent,#2447d8) 9%,white);color:var(--accent,#2447d8);font-size:.9rem}.answerFlow{display:block;white-space:pre-wrap;overflow-wrap:anywhere}.answerFlow p{display:inline;margin:0;white-space:pre-wrap}.streamCursor{display:inline-block;width:.12rem;height:1.05em;margin-inline-start:.22rem;background:var(--accent,#2447d8);vertical-align:-.13em;animation:blink .8s steps(2,end) infinite}.typingState{display:flex;align-items:center;gap:.55rem;color:var(--muted,#5b6472);font-size:.9rem;min-height:1.6rem}.typingState.subtle{margin-top:.7rem;font-size:.82rem}.typingDots{display:inline-flex;align-items:center;gap:.22rem;direction:ltr}.typingDots i{display:block;width:.38rem;height:.38rem;border-radius:50%;background:var(--accent,#2447d8);animation:typing 1.15s ease-in-out infinite}.typingDots i:nth-child(2){animation-delay:.15s}.typingDots i:nth-child(3){animation-delay:.3s}.contextualAdvisorAsk{display:grid;grid-template-columns:1fr auto;gap:.6rem;align-items:stretch;margin-top:.8rem}textarea{width:100%;resize:vertical;border:1px solid var(--border-color,#d8dee8);border-radius:10px;padding:.65rem;font:inherit;direction:inherit}.contextualAdvisorAsk button{border:0;border-radius:10px;padding:.65rem .9rem;cursor:pointer;background:var(--accent,#2447d8);color:white}button:disabled{opacity:.55;cursor:not-allowed}.contextualAdvisorError{margin:.7rem 0 0;color:#a22}.contextualAdvisorBoundary{display:block;margin-top:.65rem;color:var(--muted,#5b6472)}@keyframes typing{0%,60%,100%{opacity:.28;transform:translateY(0)}30%{opacity:1;transform:translateY(-2px)}}@keyframes blink{50%{opacity:0}}@media(prefers-reduced-motion:reduce){.advisorMessage{transition:none}.typingDots i,.streamCursor{animation:none}.typingDots i{opacity:.7}}@media(max-width:640px){.contextualAdvisor{padding:.8rem}.contextualAdvisorAsk{grid-template-columns:1fr}.message{padding:.75rem}.contextualAdvisorPrompts{flex-wrap:nowrap;overflow-x:auto;padding-bottom:.2rem}.contextualAdvisorPrompts button{white-space:nowrap}}`}</style>
  </section>;
}

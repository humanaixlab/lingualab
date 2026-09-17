import { useState } from "react";

const COPY = {
  ar: {
    title: "معلّم LinguaLab الذكي",
    lead: "اسأل عن المفهوم أو المثال أو التمرين الذي تعمل عليه الآن. يشرح المعلّم ويساعدك على الفهم من دون أن يستبدل محتوى الدرس أو ينفذ المهمة عنك.",
    concept: "المفهوم الحالي", example: "المثال المحلول", exercise: "التمرين الحالي", check: "تحقق الفهم",
    ask: "اسأل عن هذا الجزء من الدرس…", send: "اسأل المعلّم", loading: "يقرأ المعلّم سياق الدرس…", streaming: "يشرح المعلّم…",
    prompts: ["اشرح لي هذا بطريقة أبسط", "أعطني مثالًا عربيًا آخر", "لماذا أحتاج إلى هذا المفهوم؟", "ساعدني على فهم التمرين دون إعطائي الإجابة"],
    error: "تعذر الحصول على شرح موثوق الآن.", partial: "انقطع الشرح. أبقينا الجزء المستلم، لكنه غير مكتمل.",
    boundary: "المعلّم يشرح السياق التعليمي الحالي ولا يستبدل محاولة المتعلّم أو ينفذ التحليل داخل مركز التعلّم.",
  },
  en: {
    title: "LinguaLab Smart Tutor",
    lead: "Ask about the concept, worked example, or exercise you are working on now. The tutor supports understanding without replacing the lesson or doing the task for you.",
    concept: "Current concept", example: "Worked example", exercise: "Current exercise", check: "Understanding check",
    ask: "Ask about this part of the lesson…", send: "Ask tutor", loading: "Tutor is reading the lesson context…", streaming: "Tutor is explaining…",
    prompts: ["Explain this more simply", "Give me another example", "Why do I need this concept?", "Help me understand the exercise without giving me the answer"],
    error: "A reliable explanation is unavailable right now.", partial: "The explanation stream was interrupted. The received part remains visible but is incomplete.",
    boundary: "The tutor explains the current learning context; it does not replace the learner’s attempt or execute analysis inside the Learning Center.",
  },
};

function text(value, locale) { return value?.[locale] ?? value?.en ?? value ?? ""; }
function parseNdjson(buffer, onEvent) {
  const lines = buffer.split("\n"); const remainder = lines.pop() || "";
  for (const line of lines) if (line.trim()) onEvent(JSON.parse(line));
  return remainder;
}

export default function LearningContextualTutor({ lesson, locale = "en", focus, onFocusChange }) {
  const lang = locale === "ar" ? "ar" : "en"; const copy = COPY[lang];
  const [question, setQuestion] = useState(""); const [submitted, setSubmitted] = useState("");
  const [answer, setAnswer] = useState(""); const [loading, setLoading] = useState(false); const [streaming, setStreaming] = useState(false); const [error, setError] = useState("");
  const concept = focus.type === "concept" ? lesson.concepts[focus.index] : null;
  const focusLabel = concept ? `${copy.concept}: ${text(concept.title, lang)}` : focus.type === "exercise" ? `${copy.exercise}: ${text(lesson.exercise.title, lang)}` : focus.type === "check" ? copy.check : copy.example;

  async function ask(value = question) {
    const clean = String(value || "").trim(); if (!clean || loading) return;
    setQuestion(clean); setSubmitted(clean); setAnswer(""); setError(""); setLoading(true); setStreaming(false); let received = "";
    const current = concept ? { type: "concept", index: focus.index + 1, title: text(concept.title, lang), text: text(concept.text, lang) }
      : focus.type === "exercise" ? { type: "exercise", title: text(lesson.exercise.title, lang), prompt: text(lesson.exercise.prompt, lang), steps: lesson.exercise.steps.map((item) => text(item, lang)) }
      : focus.type === "check" ? { type: "understanding-check", question: text(lesson.check.question, lang), options: lesson.check.options.map((item) => text(item, lang)) }
      : { type: "worked-example", title: text(lesson.example.title, lang), sample: text(lesson.example.sample, lang), steps: lesson.example.steps.map((item) => text(item, lang)) };
    const context = { lessonId: lesson.id, lessonTitle: text(lesson.title, lang), lessonOverview: text(lesson.overview, lang), learningOutcomes: lesson.outcomes.map((item) => text(item, lang)), currentLearningContext: current };
    try {
      const response = await fetch("/api/contextual-advisor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "learning", question: clean, context, uiLanguage: lang }) });
      if (!response.ok || !response.body) throw new Error("tutor unavailable");
      const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = ""; let completed = false;
      const handle = (event) => { if (event.type === "delta" && typeof event.delta === "string") { received += event.delta; setAnswer(received); setStreaming(true); } else if (event.type === "done") { completed = true; setStreaming(false); } else if (event.type === "error") throw new Error(event.message || "stream failed"); };
      while (true) { const { value: chunk, done } = await reader.read(); buffer += decoder.decode(chunk || new Uint8Array(), { stream: !done }); buffer = parseNdjson(buffer, handle); if (done) break; }
      if (buffer.trim()) handle(JSON.parse(buffer)); if (!completed || !received.trim()) throw new Error("incomplete stream");
    } catch { setStreaming(false); setError(received ? copy.partial : copy.error); } finally { setLoading(false); }
  }

  const focuses = [
    ...lesson.concepts.map((item, index) => ({ type: "concept", index, label: text(item.title, lang) })),
    { type: "example", index: 0, label: copy.example }, { type: "exercise", index: 0, label: copy.exercise }, { type: "check", index: 0, label: copy.check },
  ];

  return <section className="learningTutor" dir={lang === "ar" ? "rtl" : "ltr"} aria-label={copy.title}>
    <header><span className="mark" aria-hidden="true">✦</span><div><h2>{copy.title}</h2><p>{copy.lead}</p></div></header>
    <div className="focuses" role="tablist" aria-label={focusLabel}>{focuses.map((item) => { const active = item.type === focus.type && item.index === focus.index; return <button type="button" role="tab" aria-selected={active} className={active ? "active" : ""} key={`${item.type}-${item.index}`} onClick={() => { onFocusChange(item); setSubmitted(""); setAnswer(""); setError(""); }}>{item.label}</button>; })}</div>
    <div className="focusLabel"><span>{focusLabel}</span></div>
    <div className="prompts">{copy.prompts.map((item) => <button type="button" key={item} disabled={loading} onClick={() => ask(item)}>{item}</button>)}</div>
    {submitted && <div className="conversation"><article className="question"><strong>{lang === "ar" ? "سؤالك" : "Your question"}</strong><p>{submitted}</p></article><article className="answer"><strong><span aria-hidden="true">✦</span> {copy.title}</strong>{!answer && loading && <div className="typing" role="status"><i/><i/><i/><span>{copy.loading}</span></div>}{answer && <p>{answer}{streaming && <span className="cursor" aria-hidden="true" />}</p>}{error && <small role="alert">{error}</small>}</article></div>}
    <div className="ask"><textarea rows={2} maxLength={1200} value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={copy.ask}/><button type="button" disabled={loading || !question.trim()} onClick={() => ask()}>{loading ? copy.streaming : copy.send}</button></div>
    <small className="boundary">{copy.boundary}</small>
    <style jsx>{`
      .learningTutor{margin:1.2rem 0;padding:1rem;border:1px solid var(--border-color,#d8dee8);border-radius:16px;background:var(--surface,#fff)}header{display:flex;gap:.7rem;align-items:flex-start}header h2,header p{margin:0}header p{margin-top:.3rem;color:var(--muted,#5b6472);line-height:1.7}.mark{display:grid;place-items:center;flex:0 0 2rem;height:2rem;border-radius:50%;background:color-mix(in srgb,var(--accent,#2447d8) 9%,white);color:var(--accent,#2447d8)}
      .focuses,.prompts{display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.85rem}.focuses button,.prompts button{border:1px solid var(--border-color,#d8dee8);border-radius:999px;background:transparent;padding:.45rem .7rem;cursor:pointer;text-align:start}.focuses button.active{background:var(--accent,#2447d8);border-color:var(--accent,#2447d8);color:#fff}.focusLabel{margin-top:.75rem;padding:.55rem .7rem;border-inline-start:3px solid var(--accent,#2447d8);background:var(--surface-subtle,#f6f8fb);font-weight:700}
      .conversation{display:grid;gap:.6rem;margin-top:.85rem}.question,.answer{padding:.8rem .9rem;border:1px solid var(--border-color,#d8dee8);border-radius:13px}.question{background:var(--surface-subtle,#f6f8fb)}.question p,.answer p{margin:.35rem 0 0;white-space:pre-wrap;line-height:1.85;unicode-bidi:plaintext}.answer{min-height:78px}.answer small{display:block;color:#a22;margin-top:.5rem}.typing{display:flex;align-items:center;gap:.22rem;margin-top:.65rem;color:var(--muted,#5b6472)}.typing i{width:.38rem;height:.38rem;border-radius:50%;background:var(--accent,#2447d8);animation:typing 1.1s ease-in-out infinite}.typing i:nth-child(2){animation-delay:.15s}.typing i:nth-child(3){animation-delay:.3s}.typing span{margin-inline-start:.35rem}.cursor{display:inline-block;width:.12rem;height:1em;margin-inline-start:.2rem;background:var(--accent,#2447d8);animation:blink .8s steps(2,end) infinite;vertical-align:-.12em}
      .ask{display:grid;grid-template-columns:1fr auto;gap:.6rem;margin-top:.85rem}.ask textarea{width:100%;resize:vertical;border:1px solid var(--border-color,#d8dee8);border-radius:10px;padding:.65rem;font:inherit;direction:inherit}.ask button{border:0;border-radius:10px;padding:.65rem .9rem;background:var(--accent,#2447d8);color:#fff;cursor:pointer}.ask button:disabled,.prompts button:disabled{opacity:.5;cursor:not-allowed}.boundary{display:block;margin-top:.65rem;color:var(--muted,#5b6472)}
      @keyframes typing{0%,60%,100%{opacity:.28;transform:translateY(0)}30%{opacity:1;transform:translateY(-2px)}}@keyframes blink{50%{opacity:0}}@media(prefers-reduced-motion:reduce){.typing i,.cursor{animation:none}}@media(max-width:640px){.learningTutor{padding:.8rem}.focuses,.prompts{flex-wrap:nowrap;overflow-x:auto;padding-bottom:.2rem}.focuses button,.prompts button{white-space:nowrap}.ask{grid-template-columns:1fr}}
    `}</style>
  </section>;
}
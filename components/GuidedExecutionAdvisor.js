import { useState } from "react";
import Link from "next/link";

const COPY = {
  ar: {
    title: "مستشار تنفيذ المشروع", lead: "سأرشدك في تنفيذ هذا المشروع خطوة بخطوة، مع توضيح ما يحدث داخل LinguaLab وما يبقى من مسؤولية الباحث.",
    current: "الخطوة الحالية", previous: "السابق", next: "التالي", finish: "مراجعة الخطوات", external: "خطوة خارجية", inside: "داخل LinguaLab",
    ask: "اسأل عن هذه الخطوة…", send: "اسأل المستشار", loading: "يحلل المستشار الخطوة الحالية…", streaming: "يكتب المستشار الإجابة…",
    prompts: ["ماذا أفعل في هذه الخطوة؟", "لماذا أحتاج هذه الخطوة؟", "هل أنفذها داخل LinguaLab أم خارجه؟"],
    error: "تعذر الحصول على إجابة موثوقة الآن.", partial: "انقطع البث. أبقينا الجزء المستلم، لكنه ليس إجابة نهائية مكتملة.",
    boundary: "الانتقال بين الخطوات هنا إرشادي فقط؛ لا يعني أن الباحث أكمل الخطوة فعليًا.",
  },
  en: {
    title: "Project Execution Advisor", lead: "I’ll guide you through this project step by step, showing what happens inside LinguaLab and what remains the researcher’s responsibility.",
    current: "Current step", previous: "Previous", next: "Next", finish: "Review steps", external: "External step", inside: "Inside LinguaLab",
    ask: "Ask about this step…", send: "Ask advisor", loading: "Advisor is analyzing the current step…", streaming: "Advisor is writing the answer…",
    prompts: ["What should I do in this step?", "Why do I need this step?", "Do I do this inside LinguaLab or outside it?"],
    error: "A reliable answer is unavailable right now.", partial: "The stream was interrupted. The received text remains visible, but it is not a complete final answer.",
    boundary: "Moving between steps is guidance only; it does not mean the researcher actually completed the step.",
  },
};

function localized(value, language) { return value?.[language] ?? value?.en ?? value ?? ""; }
function parseNdjson(buffer, onEvent) {
  const lines = buffer.split("\n");
  const remainder = lines.pop() || "";
  for (const line of lines) { if (line.trim()) onEvent(JSON.parse(line)); }
  return remainder;
}

export default function GuidedExecutionAdvisor({ language = "en", projectContext, roadmap = [] }) {
  const locale = language === "ar" ? "ar" : "en";
  const copy = COPY[locale];
  const [index, setIndex] = useState(0);
  const [question, setQuestion] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const step = roadmap[index];
  if (!step) return null;

  function move(nextIndex) {
    setIndex(Math.max(0, Math.min(roadmap.length - 1, nextIndex)));
    setQuestion(""); setSubmitted(""); setAnswer(""); setError(""); setStreaming(false);
  }

  async function ask(value = question) {
    const clean = String(value || "").trim();
    if (!clean || loading) return;
    setQuestion(clean); setSubmitted(clean); setAnswer(""); setError(""); setLoading(true); setStreaming(false);
    let received = "";
    const stepContext = {
      ...projectContext,
      executionGuidanceMode: true,
      currentExecutionStep: index + 1,
      totalExecutionSteps: roadmap.length,
      stepStage: step.stage,
      stepLabel: localized(step.label, locale),
      stepNote: localized(step.note, locale),
      stepIsExternal: Boolean(step.external),
      stepHasLinguaLabLink: Boolean(step.href),
      instruction: locale === "ar"
        ? "أجب فقط عن الخطوة الحالية في خارطة تنفيذ هذا المشروع. اشرح ما يفعله الباحث الآن، لماذا، وما إذا كان التنفيذ داخل LinguaLab أو خارجه. لا تدّعِ أن الخطوة اكتملت ولا تنفذها نيابة عن الباحث."
        : "Answer only about the current step in this project's execution roadmap. Explain what the researcher does now, why, and whether it happens inside LinguaLab or outside. Do not claim the step is completed or execute it for the researcher.",
    };
    try {
      const response = await fetch("/api/contextual-advisor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "project", question: clean, context: stepContext, uiLanguage: locale }) });
      if (!response.ok || !response.body) throw new Error("advisor unavailable");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = ""; let completed = false;
      const handle = (event) => {
        if (event.type === "delta" && typeof event.delta === "string") { received += event.delta; setAnswer(received); setStreaming(true); }
        else if (event.type === "done") { completed = true; setStreaming(false); }
        else if (event.type === "error") throw new Error(event.message || "stream failed");
      };
      while (true) {
        const { value, done } = await reader.read();
        buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
        buffer = parseNdjson(buffer, handle);
        if (done) break;
      }
      if (buffer.trim()) handle(JSON.parse(buffer));
      if (!completed || !received.trim()) throw new Error("incomplete stream");
    } catch {
      setStreaming(false); setError(received ? copy.partial : copy.error);
    } finally { setLoading(false); }
  }

  return <div className="executionAdvisor" dir={locale === "ar" ? "rtl" : "ltr"}>
    <header className="guideHead"><span className="mark" aria-hidden="true">✦</span><div><h3>{copy.title}</h3><p>{copy.lead}</p></div></header>
    <ol className="progress" aria-label={copy.title}>{roadmap.map((item, i) => <li key={`${item.stage}-${i}`} className={i === index ? "active" : i < index ? "visited" : ""}><button type="button" onClick={() => move(i)} aria-current={i === index ? "step" : undefined}><span>{i < index ? "✓" : String(i + 1).padStart(2, "0")}</span></button></li>)}</ol>
    <section className="stepCard">
      <div className="stepMeta"><span>{copy.current} {String(index + 1).padStart(2, "0")} / {String(roadmap.length).padStart(2, "0")}</span><b className={step.external ? "external" : "inside"}>{step.external ? copy.external : copy.inside}</b></div>
      <h4>{localized(step.label, locale)}</h4><p>{localized(step.note, locale)}</p>
      {step.href && <Link className="stepLink" href={step.href}>{locale === "ar" ? "فتح الأداة المرتبطة" : "Open related tool"}<span aria-hidden="true">↗</span></Link>}
    </section>
    <div className="quickPrompts">{copy.prompts.map((item) => <button type="button" key={item} disabled={loading} onClick={() => ask(item)}>{item}</button>)}</div>
    {submitted && <div className="conversation">
      <div className="questionBubble"><strong>{locale === "ar" ? "سؤالك" : "Your question"}</strong><p>{submitted}</p></div>
      <div className="answerBubble"><strong><span aria-hidden="true">✦</span> {copy.title}</strong>{!answer && loading && <div className="typing"><i/><i/><i/><span>{copy.loading}</span></div>}{answer && <p>{answer}{streaming && <span className="cursor" aria-hidden="true" />}</p>}{error && <small role="alert">{error}</small>}</div>
    </div>}
    <div className="askRow"><textarea rows={2} maxLength={1200} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder={copy.ask}/><button type="button" disabled={loading || !question.trim()} onClick={() => ask()}>{loading ? copy.loading : copy.send}</button></div>
    <nav className="stepNav"><button type="button" disabled={index === 0} onClick={() => move(index - 1)}>{copy.previous}</button><span>{copy.boundary}</span><button type="button" disabled={index === roadmap.length - 1} onClick={() => move(index + 1)}>{index === roadmap.length - 1 ? copy.finish : copy.next}</button></nav>
    <style jsx>{`
      .executionAdvisor{display:grid;gap:1rem;margin:.8rem 0 1.2rem}.guideHead{display:flex;gap:.7rem;align-items:flex-start}.guideHead h3,.guideHead p{margin:0}.guideHead p{margin-top:.3rem;color:var(--muted,#5b6472)}.mark{display:grid;place-items:center;flex:0 0 2rem;height:2rem;border-radius:50%;background:color-mix(in srgb,var(--accent,#2447d8) 9%,white);color:var(--accent,#2447d8)}
      .progress{display:flex;align-items:center;gap:.35rem;list-style:none;padding:0;margin:0}.progress li{display:flex;align-items:center;flex:1}.progress li:not(:last-child)::after{content:"";height:2px;flex:1;background:var(--border-color,#d8dee8)}.progress li.visited:not(:last-child)::after{background:var(--accent,#2447d8)}.progress button{width:2.25rem;height:2.25rem;border-radius:50%;border:1px solid var(--border-color,#d8dee8);background:#fff;color:inherit;cursor:pointer}.progress .active button,.progress .visited button{background:var(--accent,#2447d8);border-color:var(--accent,#2447d8);color:#fff}
      .stepCard{padding:1rem;border:1px solid color-mix(in srgb,var(--accent,#2447d8) 24%,var(--border-color,#d8dee8));border-radius:14px;background:var(--surface,#fff)}.stepMeta{display:flex;justify-content:space-between;gap:.5rem;align-items:center;color:var(--muted,#5b6472);font-size:.85rem}.stepMeta b{padding:.25rem .5rem;border-radius:999px}.stepMeta .external{background:#fff7e8;color:#8a5a13}.stepMeta .inside{background:var(--surface-subtle,#f6f8fb);color:var(--accent,#2447d8)}.stepCard h4{font-size:1.12rem;margin:.65rem 0 .35rem}.stepCard p{margin:0;line-height:1.8}.stepLink{display:inline-flex;gap:.35rem;margin-top:.7rem;font-weight:700}
      .quickPrompts{display:flex;gap:.45rem;flex-wrap:wrap}.quickPrompts button{border:1px solid var(--border-color,#d8dee8);border-radius:999px;background:transparent;padding:.45rem .7rem;cursor:pointer}.conversation{display:grid;gap:.6rem}.questionBubble,.answerBubble{padding:.8rem .9rem;border-radius:13px;border:1px solid var(--border-color,#d8dee8)}.questionBubble{background:var(--surface-subtle,#f6f8fb)}.answerBubble{background:#fff;min-height:80px}.questionBubble p,.answerBubble p{margin:.35rem 0 0;white-space:pre-wrap;line-height:1.8}.answerBubble small{display:block;color:#a22;margin-top:.5rem}
      .typing{display:flex;align-items:center;gap:.22rem;margin-top:.65rem;color:var(--muted,#5b6472)}.typing i{width:.38rem;height:.38rem;border-radius:50%;background:var(--accent,#2447d8);animation:typing 1.1s ease-in-out infinite}.typing i:nth-child(2){animation-delay:.15s}.typing i:nth-child(3){animation-delay:.3s}.typing span{margin-inline-start:.35rem}.cursor{display:inline-block;width:.12rem;height:1em;margin-inline-start:.2rem;background:var(--accent,#2447d8);animation:blink .8s steps(2,end) infinite;vertical-align:-.12em}
      .askRow{display:grid;grid-template-columns:1fr auto;gap:.6rem}.askRow textarea{width:100%;resize:vertical;border:1px solid var(--border-color,#d8dee8);border-radius:10px;padding:.65rem;font:inherit;direction:inherit}.askRow button,.stepNav button{border:0;border-radius:10px;padding:.65rem .9rem;background:var(--accent,#2447d8);color:#fff;cursor:pointer}.askRow button:disabled,.stepNav button:disabled,.quickPrompts button:disabled{opacity:.5;cursor:not-allowed}.stepNav{display:grid;grid-template-columns:auto 1fr auto;gap:.7rem;align-items:center}.stepNav span{text-align:center;color:var(--muted,#5b6472);font-size:.8rem}
      @keyframes typing{0%,60%,100%{opacity:.28;transform:translateY(0)}30%{opacity:1;transform:translateY(-2px)}}@keyframes blink{50%{opacity:0}}@media(prefers-reduced-motion:reduce){.typing i,.cursor{animation:none}}@media(max-width:640px){.quickPrompts{flex-wrap:nowrap;overflow-x:auto}.quickPrompts button{white-space:nowrap}.askRow{grid-template-columns:1fr}.stepNav{grid-template-columns:1fr 1fr}.stepNav span{grid-column:1/-1;grid-row:2}.progress{overflow-x:auto}.progress li{min-width:3.4rem}.progress li::after{min-width:1rem}}
    `}</style>
  </div>;
}
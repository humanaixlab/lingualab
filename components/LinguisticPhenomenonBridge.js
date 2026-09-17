import Link from "next/link";
import { useState } from "react";
import { PATH_PHENOMENON_BRIDGES } from "../lib/language-to-application";

const labels = {
  en: ["Language example", "Linguistic phenomenon/problem", "What information matters?", "How can it be represented computationally?", "What is the computational task?", "What does this path do?", "What can this contribute to?", "What is the boundary?"],
  ar: ["المثال اللغوي", "الظاهرة أو المشكلة اللغوية", "ما المعلومات المهمة؟", "كيف يمكن تمثيلها حاسوبيًا؟", "ما المهمة الحاسوبية؟", "ماذا يفعل هذا المسار؟", "ما الذي يمكن أن يسهم فيه؟", "ما الحد؟"],
};

export default function LinguisticPhenomenonBridge({ pathId, language }) {
  const locale = language === "ar" ? "ar" : "en";
  const [selectedId, setSelectedId] = useState(null);
  const [revealed, setRevealed] = useState(0);
  const examples = PATH_PHENOMENON_BRIDGES[pathId] || [];
  const selected = examples.find((item) => item.id === selectedId);
  const content = selected ? [selected.languageExample, selected.phenomenon, selected.information, selected.representation, selected.task, selected.pathAction, selected.contribution, selected.boundary] : [];
  const choose = (id) => { setSelectedId(id); setRevealed(1); };
  return <section data-testid={`phenomenon-bridge-${pathId}`} dir={locale === "ar" ? "rtl" : "ltr"} aria-labelledby={`phenomenon-bridge-title-${pathId}`} style={{ margin: "0 0 18px", padding: "16px", border: "1px solid rgba(98,88,245,.18)", borderRadius: "14px", background: "#fbfaff", color: "#494367", fontSize: "var(--text-helper)", lineHeight: 1.55 }}>
    <h4 id={`phenomenon-bridge-title-${pathId}`} style={{ margin: "0 0 8px", color: "#433abf" }}>{locale === "ar" ? "شاهد كيف تتحول الظاهرة اللغوية إلى مهمة حاسوبية" : "See how a linguistic phenomenon becomes a computational task"}</h4>
    <p style={{ margin: "0 0 10px" }}>{locale === "ar" ? "اختر مثالًا ثم اكشف علاقاته خطوة بخطوة. هذا تمثيل تعليمي، وليس تصميم خوارزمية أو تنفيذًا للتحليل." : "Choose an example, then reveal its relationships step by step. This is an educational representation, not an algorithm design or analysis execution."}</p>
    <div role="group" aria-label={locale === "ar" ? "اختر مثالًا لغويًا" : "Choose a linguistic example"} style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>{examples.map((example) => <button type="button" key={example.id} aria-pressed={selectedId === example.id} onClick={() => choose(example.id)} style={{ cursor: "pointer", padding: "7px 9px", borderRadius: "9px", border: selectedId === example.id ? "2px solid #5148d9" : "1px solid #bdb8e9", background: selectedId === example.id ? "#ece9ff" : "#fff", color: "#312c54", fontWeight: 600 }}>{example.title[locale]}</button>)}</div>
    {selected && <div style={{ marginTop: "12px" }}><ol style={{ margin: 0, paddingInlineStart: "20px" }}>{content.slice(0, revealed).map((value, index) => <li key={labels[locale][index]} style={{ margin: "8px 0" }}><strong>{labels[locale][index]}</strong>{index === 3 ? <pre dir={value.direction} style={{ margin: "5px 0 0", padding: "8px", overflowX: "auto", borderRadius: "8px", background: "#f1f0f8", whiteSpace: "pre-wrap" }}>{value.content[locale]}</pre> : <span style={{ display: "block" }}>{value[locale]}</span>}</li>)}</ol>{revealed < labels[locale].length && <button type="button" onClick={() => setRevealed((value) => value + 1)} style={{ cursor: "pointer", marginTop: "8px", padding: "8px 10px", border: 0, borderRadius: "9px", background: "#6258f5", color: "#fff", fontWeight: 700 }}>{locale === "ar" ? "اكشف الخطوة التالية" : "Reveal next step"}</button>}{revealed === labels[locale].length && selected.handoff === "nlp-builder" && <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid rgba(98,88,245,.16)" }}><p style={{ margin: "0 0 7px" }}>{locale === "ar" ? "هل تريد تحويل هذه الظاهرة إلى تصميم حاسوبي؟" : "Want to turn this phenomenon into a computational design?"}</p><Link href="/tools/nlp-builder" style={{ color: "#5148d9", fontWeight: 700 }}>{locale === "ar" ? "انتقل إلى NLP Builder" : "Continue to NLP Builder"}</Link></div>}</div>}
  </section>;
}

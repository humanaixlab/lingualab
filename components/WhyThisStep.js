import { WHY_THIS_STEP } from "../lib/language-to-application";

export default function WhyThisStep({ step, language }) {
  const item = WHY_THIS_STEP[step];
  if (!item) return null;
  const ar = language === "ar";
  return <aside dir={ar ? "rtl" : "ltr"} aria-label={ar ? "لماذا أفعل هذه الخطوة؟" : "Why this step?"} style={{ margin: "14px 0", padding: "13px 15px", borderInlineStart: "3px solid #6258f5", borderRadius: "0 12px 12px 0", background: "#f4f2ff", color: "#494367", fontSize: "var(--text-helper)", lineHeight: 1.65 }}><strong>{ar ? "لماذا أفعل هذه الخطوة؟" : "Why this step?"}</strong><p style={{ margin: "5px 0 0" }}>{item[ar ? "ar" : "en"]}</p></aside>;
}

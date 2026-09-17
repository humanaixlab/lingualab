import { WHY_THIS_PATH } from "../lib/language-to-application";

export default function WhyThisPath({ pathId, language }) {
  const item = WHY_THIS_PATH[pathId];
  if (!item) return null;
  const locale = language === "ar" ? "ar" : "en";
  const ar = locale === "ar";
  return <section data-testid={`why-this-path-${pathId}`} dir={ar ? "rtl" : "ltr"} style={{ margin: "0 0 18px", padding: "16px", border: "1px solid rgba(98,88,245,.18)", borderRadius: "14px", background: "#fbfaff", color: "#494367", fontSize: "var(--text-helper)", lineHeight: 1.55 }}>
    <h4 style={{ margin: "0 0 8px", color: "#433abf" }}>{ar ? "لماذا أحتاج هذا المسار؟" : "Why this path?"}</h4>
    <p style={{ margin: "0 0 7px" }}><b>{ar ? "المشكلة:" : "Problem:"}</b> {item.problem[locale]} → <b>{ar ? "القدرة:" : "Capability:"}</b> {item.capability[locale]}</p>
    <p style={{ margin: "0 0 8px" }}><b>{ar ? "ما الذي يحتاج الحاسوب إلى تمثيله أو تحديده؟" : "What must the computer represent or identify?"}</b> {item.computer[locale]}</p>
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>{item.contributions[locale].map((value) => <span key={value} style={{ padding: "4px 8px", borderRadius: "999px", background: "#ece9ff", color: "#5148d9" }}>{value}</span>)}</div>
    <p style={{ margin: 0 }}><b>{ar ? "الحد:" : "Boundary:"}</b> {item.limit[locale]}</p>
  </section>;
}

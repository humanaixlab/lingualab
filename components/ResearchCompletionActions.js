import { createReportContext } from "../lib/report-context";

export default function ResearchCompletionActions({ language = "en", sourceTool, pathId, taskLabel, sourceText, aiOutput, researcherDecision, finalOutput, summary, returnHref }) {
  const locale = language === "ar" ? "ar" : "en";
  const prepareReport = () => {
    const url = createReportContext(sourceTool, "reviewed-analysis", { pathId, taskLabel, sourceText, aiOutput, researcherDecision, finalOutput, summary, returnHref });
    if (url) window.location.href = url;
  };
  return <div aria-label={locale === "ar" ? "الخطوة التالية" : "Next step"} style={{ marginTop: 16, padding: 14, border: "1px solid #ded9ee", borderRadius: 14, background: "#faf9ff" }}>
    <strong>{locale === "ar" ? "النتيجة المراجعة جاهزة" : "Reviewed result ready"}</strong>
    <p style={{ margin: "6px 0 12px" }}>{locale === "ar" ? "أعد تقريرًا من هذه النتيجة الفعلية دون العودة إلى اختيار المسار أو الأداة." : "Prepare a report from this actual result without returning to path or tool selection."}</p>
    <button type="button" onClick={prepareReport} style={{ border: 0, borderRadius: 10, padding: "10px 14px", background: "#6258f5", color: "#fff", font: "inherit", fontWeight: 700, cursor: "pointer" }}>{locale === "ar" ? "إعداد التقرير البحثي" : "Prepare research report"}</button>
  </div>;
}

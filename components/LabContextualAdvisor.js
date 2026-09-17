import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import ContextualAdvisor from "./ContextualAdvisor";
import { useLanguage } from "./LanguageProvider";

const TOOL_LABELS = {
  analyze: { ar: "التحليل", en: "Analyze" },
  frequency: { ar: "تحليل التكرار", en: "Frequency Analysis" },
  concordance: { ar: "تحليل السياقات", en: "Concordance" },
  ngrams: { ar: "المتتاليات اللفظية", en: "N-grams" },
  "corpus-research": { ar: "إنشاء وتحليل المدونة", en: "Corpus Research" },
  pos: { ar: "الوسم النحوي", en: "POS Tagging" },
  "morphology-syntax": { ar: "الصرف والنحو", en: "Morphology & Syntax" },
  "discourse-analysis": { ar: "تحليل الخطاب والتداولية", en: "Discourse & Pragmatics" },
  "information-extraction": { ar: "استخراج المعلومات", en: "Information Extraction" },
  semantics: { ar: "الدلالة", en: "Semantics" },
  "text-classification": { ar: "تصنيف النصوص", en: "Text Classification" },
  excel: { ar: "بيانات Excel", en: "Excel Data" },
};

const COPY = {
  ar: { open: "✦ مستشار المختبر الذكي", close: "إغلاق مستشار المختبر", context: "سياق المختبر الحالي" },
  en: { open: "✦ Smart Lab Advisor", close: "Close Smart Lab Advisor", context: "Current lab context" },
};

function safeSessionContext() {
  if (typeof window === "undefined") return {};
  const keys = ["lingualab-research-context", "lingualab-analysis-handoff", "lingualab-research-path-context"];
  const result = {};
  for (const key of keys) {
    try {
      const raw = window.sessionStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      result[key] = parsed && typeof parsed === "object" ? parsed : undefined;
    } catch {}
  }
  return result;
}

export default function LabContextualAdvisor() {
  const router = useRouter();
  const { language } = useLanguage();
  const locale = language === "ar" ? "ar" : "en";
  const copy = COPY[locale];
  const [open, setOpen] = useState(false);
  const [sessionContext, setSessionContext] = useState({});
  const match = router.pathname.match(/^\/tools\/([^/]+)$/);
  const toolId = match?.[1] || "";
  const isLabTool = Boolean(toolId && TOOL_LABELS[toolId]);

  useEffect(() => {
    if (!isLabTool) return;
    const refresh = () => setSessionContext(safeSessionContext());
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, [isLabTool, router.asPath]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const context = useMemo(() => ({
    toolId,
    toolName: TOOL_LABELS[toolId]?.[locale] || toolId,
    route: router.asPath,
    purpose: locale === "ar" ? "مساعدة الباحث أثناء العمل الفعلي في أداة المختبر الحالية" : "Support the researcher while working in the current lab tool",
    availableSessionContext: sessionContext,
    evidenceBoundary: locale === "ar"
      ? "لا تفترض وجود بيانات أو نتائج غير ظاهرة في السياق المنقول. ميّز بين النتيجة المحسوبة والتفسير المنهجي."
      : "Do not assume data or results that are absent from the transferred context. Distinguish computed evidence from methodological interpretation.",
  }), [locale, router.asPath, sessionContext, toolId]);

  if (!isLabTool) return null;

  return <>
    <button className="labAdvisorTrigger" type="button" onClick={() => setOpen(true)} aria-expanded={open}>{copy.open}</button>
    {open && <div className="labAdvisorOverlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <aside className="labAdvisorDrawer" role="dialog" aria-modal="true" aria-label={copy.open}>
        <div className="labAdvisorBar"><div><strong>{copy.open}</strong><small>{copy.context}: {TOOL_LABELS[toolId][locale]}</small></div><button type="button" onClick={() => setOpen(false)} aria-label={copy.close}>×</button></div>
        <ContextualAdvisor language={locale} kind="lab" context={context} />
      </aside>
    </div>}
    <style jsx>{`
      .labAdvisorTrigger{position:fixed;z-index:44;inset-inline-end:1.2rem;bottom:5.1rem;border:1px solid color-mix(in srgb,var(--accent,#6258f5) 30%,#d8dee8);border-radius:999px;padding:.72rem 1rem;background:var(--surface,#fff);color:var(--accent,#5148d9);font:700 .9rem var(--font-ui,inherit);box-shadow:0 10px 30px rgba(41,37,65,.12);cursor:pointer}
      .labAdvisorOverlay{position:fixed;z-index:80;inset:0;display:flex;justify-content:flex-end;background:rgba(24,28,38,.24)}
      [dir="rtl"] .labAdvisorOverlay{justify-content:flex-start}
      .labAdvisorDrawer{width:min(570px,94vw);height:100%;overflow:auto;background:var(--surface,#fff);box-shadow:0 0 38px rgba(24,28,38,.18);padding:1rem;animation:drawerIn .2s ease-out}
      [dir="rtl"] .labAdvisorDrawer{animation-name:drawerInRtl}
      .labAdvisorBar{position:sticky;top:0;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.3rem .2rem .8rem;background:var(--surface,#fff)}
      .labAdvisorBar div{display:grid;gap:.2rem}.labAdvisorBar small{color:var(--muted,#5b6472)}
      .labAdvisorBar button{width:2.2rem;height:2.2rem;border:1px solid var(--border-color,#d8dee8);border-radius:50%;background:#fff;font-size:1.35rem;cursor:pointer}
      @keyframes drawerIn{from{transform:translateX(18px);opacity:.6}to{transform:none;opacity:1}}@keyframes drawerInRtl{from{transform:translateX(-18px);opacity:.6}to{transform:none;opacity:1}}
      @media(prefers-reduced-motion:reduce){.labAdvisorDrawer{animation:none}}
      @media(max-width:640px){.labAdvisorTrigger{inset-inline-end:.75rem;bottom:4.6rem}.labAdvisorDrawer{width:100vw}}
    `}</style>
  </>;
}

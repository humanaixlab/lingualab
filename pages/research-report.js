import Head from "next/head";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { useLanguage } from "../components/LanguageProvider";
import { readReportContext } from "../lib/report-context";
import { reportReturnTarget } from "../lib/navigation-flow";
import DataSourceIndicator from "../components/DataSourceIndicator";

function subscribe() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

function readStoredJson(key) {
  if (typeof window === "undefined") return null;

  try {
    const saved =
      sessionStorage.getItem(key) ||
      localStorage.getItem(key);

    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function normalizeInterpretation(value) {
  if (!value || typeof value !== "object") return null;

  const payload = value?.result || value?.data || value;

  if (
    payload?.interpretation &&
    typeof payload.interpretation === "object" &&
    !Array.isArray(payload.interpretation)
  ) {
    return {
      ...payload.interpretation,
      mode: payload.mode || payload.interpretation.mode,
    };
  }

  return payload;
}

function getInterpretationField(interpretation, keys, fallback) {
  for (const key of keys) {
    const value = interpretation?.[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return fallback;
}

function detectInterpretationLanguage(interpretation) {
  const text = [
    interpretation?.interpretation,
    interpretation?.methodologicalImplications,
    interpretation?.methodology,
    interpretation?.limitations,
    interpretation?.nextStep,
    interpretation?.paperParagraph,
  ].filter((value) => typeof value === "string").join(" ");
  const arabic = (text.match(/[\u0600-\u06ff]/g) || []).length;
  const latin = (text.match(/[a-z]/gi) || []).length;
  if (!arabic && !latin) return null;
  return arabic >= latin ? "ar" : "en";
}

function normalizeDistribution(value) {
  const entries = Array.isArray(value) ? value : value && typeof value === "object" ? Object.entries(value) : [];
  return entries
    .filter((item) => Array.isArray(item) && String(item[0]).trim() && Number.isFinite(Number(item[1])) && Number(item[1]) > 0)
    .map(([label, count]) => [String(label), Number(count)]);
}

const REPORT_COPY = {
  en: { metrics: "Key Metrics", visuals: "Visual Results", frequencyChart: "Most frequent terms", distributionChart: "Category distribution", regenerate: "Regenerate interpretation in English", regenerating: "Regenerating interpretation…", mismatch: "The saved interpretation was generated in another language. Regenerate it to match the English interface.", regenerateError: "The interpretation could not be regenerated. Please try again.", interpretation: "AI Interpretation", conclusions: "Conclusions / Next Steps" },
  ar: { metrics: "المقاييس الرئيسة", visuals: "النتائج البصرية", frequencyChart: "أكثر المفردات تكرارًا", distributionChart: "توزيع الفئات", regenerate: "إعادة توليد التفسير بالعربية", regenerating: "جارٍ إعادة توليد التفسير…", mismatch: "أُنشئ التفسير المحفوظ بلغة أخرى. أعد توليده ليتوافق مع الواجهة العربية.", regenerateError: "تعذرت إعادة توليد التفسير. حاول مرة أخرى.", interpretation: "تفسير الذكاء الاصطناعي", conclusions: "الاستنتاجات والخطوات التالية" },
};

const CONTEXT_COPY = {
  en: { standard: "Standard", visual: "Visual", diagram: "Diagram", unavailable: "Diagram unavailable", source: "Report source", generated: "Generated", metrics: "Key Metrics", visuals: "Visual Results", interpretation: "AI Interpretation", summary: "Summary", limitations: "Limitations", next: "Conclusions / Next Steps", workflow: "Methodological sequence", words: "Words", sentences: "Sentences", contexts: "Contexts", items: "Reported items", target: "Target expression", method: "Recommended method", design: "Study design", questions: "Research questions", frequency: "Frequency", distribution: "Distribution", noDiagram: "No structured workflow is available for this report." },
  ar: { standard: "قياسي", visual: "مرئي", diagram: "مخطط", unavailable: "المخطط غير متاح", source: "مصدر التقرير", generated: "تاريخ الإنشاء", metrics: "المؤشرات الرئيسة", visuals: "النتائج المرئية", interpretation: "التفسير البحثي", summary: "الملخص", limitations: "القيود", next: "الاستنتاجات والخطوات التالية", workflow: "المسار المنهجي", words: "الكلمات", sentences: "الجمل", contexts: "السياقات", items: "العناصر المعروضة", target: "العبارة المستهدفة", method: "المنهج المقترح", design: "تصميم الدراسة", questions: "أسئلة البحث", frequency: "التكرار", distribution: "التوزيع", noDiagram: "لا يتضمن هذا التقرير مسارًا بنيويًا يمكن تمثيله بمخطط." },
};

function contextualTitle(type, language, size) {
  const titles = {
    frequency: ["Frequency report", "تقرير التكرارات"],
    concordance: ["Contexts report", "تقرير السياقات"],
    ngrams: [size === 3 ? "Trigram report" : "Bigram report", size === 3 ? "تقرير الثلاثيات" : "تقرير الثنائيات"],
    pos: ["Parts-of-speech report", "تقرير أقسام الكلام"],
    interpretation: ["Research interpretation report", "تقرير التفسير البحثي"],
    methodology: ["Research methodology report", "التقرير المنهجي للبحث"],
  };
  return titles[type]?.[language === "ar" ? 1 : 0] || (language === "ar" ? "تقرير بحثي" : "Research report");
}

function ContextualReport({ context, language, reportRef, view, setView, returnTarget }) {
  const copy = CONTEXT_COPY[language];
  const payload = context.payload;
  const interpretation = payload.interpretation;
  const entries = context.analysisType === "frequency" ? payload.frequencies : context.analysisType === "ngrams" ? payload.results : context.analysisType === "pos" ? payload.distribution : [];
  const maxValue = Math.max(0, ...entries.map(([, count]) => count));
  const total = entries.reduce((sum, [, count]) => sum + count, 0);
  const gradient = entries.map(([, count], index) => {
    const start = entries.slice(0, index).reduce((sum, [, value]) => sum + value, 0) / total * 100;
    const end = start + count / total * 100;
    return `${["#7c6cf2", "#4da7d8", "#55b89f", "#e6a85c", "#d96f91"][index % 5]} ${start}% ${end}%`;
  }).join(", ");
  const metrics = [
    Number.isFinite(payload.wordCount) && [copy.words, payload.wordCount],
    Number.isFinite(payload.sentenceCount) && [copy.sentences, payload.sentenceCount],
    payload.contexts?.length > 0 && [copy.contexts, payload.contexts.length],
    entries.length > 0 && [copy.items, entries.length],
  ].filter(Boolean);
  const summary = payload.summary || interpretation?.summary || interpretation?.interpretation;
  const limitations = payload.limitations || interpretation?.limitations;
  const nextSteps = payload.nextSteps || [interpretation?.nextStep || interpretation?.recommendedNextStep].filter(Boolean);
  const workflow = payload.workflow || [];
  const showStandard = view === "standard";
  const showVisual = view === "visual";

  return (
    <article className="report contextualReport">
      <header className="reportHeader">
        <div><p className="sectionLabel">{copy.source}: {context.sourceTool}</p><h2>{contextualTitle(context.analysisType, language, payload.size)}</h2></div>
        <div className="reportMeta"><span>{copy.generated}</span><strong>{new Date(context.timestamp).toLocaleString(language)}</strong></div>
      </header>
      <div className="viewTabs" role="group" aria-label={language === "ar" ? "نمط عرض التقرير" : "Report view"}>
        <button type="button" aria-pressed={view === "standard"} onClick={() => setView("standard")}>{copy.standard}</button>
        <button type="button" aria-pressed={view === "visual"} onClick={() => setView("visual")}>{copy.visual}</button>
        <button type="button" aria-pressed={view === "diagram"} disabled={!context.availableWorkflow} onClick={() => setView("diagram")}>{context.availableWorkflow ? copy.diagram : copy.unavailable}</button>
      </div>

      {view === "diagram" ? (
        <section className="reportSection"><p className="sectionLabel">01</p><h3>{copy.workflow}</h3><div className="workflowDiagram">{workflow.map((step, index) => <div className="workflowNode" key={`${index}-${step}`}><span>{String(index + 1).padStart(2, "0")}</span><p dir="auto">{step}</p></div>)}</div></section>
      ) : (
        <>
          {summary && <section className="reportSection"><p className="sectionLabel">01</p><h3>{copy.summary}</h3><p dir="auto">{summary}</p></section>}
          {metrics.length > 0 && <section className="reportSection"><p className="sectionLabel">02</p><h3>{copy.metrics}</h3><div className="stats">{metrics.map(([label, value]) => <div className="stat" key={label}><span>{label}</span><strong>{Number(value).toLocaleString(language)}</strong></div>)}</div></section>}
          {context.analysisType === "concordance" && <section className="reportSection"><p className="sectionLabel">03</p><h3>{copy.contexts}</h3><p><strong>{copy.target}:</strong> <span dir="auto">{payload.target}</span></p><ol className="contextList">{payload.contexts.map((item, index) => <li key={index} dir="auto">{item}</li>)}</ol></section>}
          {entries.length > 0 && <section className="reportSection"><p className="sectionLabel">03</p><h3>{copy.visuals}</h3><div className="visualGrid"><figure className="chartCard"><figcaption>{copy.frequency}</figcaption><div className="barChart">{entries.slice(0, 15).map(([label, count]) => <div className="barRow" key={`${label}-${count}`}><span dir="auto">{label}</span><div><i style={{ width: `${maxValue ? Math.max(4, count / maxValue * 100) : 0}%` }} /></div><strong>{count}</strong></div>)}</div></figure>{context.analysisType === "pos" && total > 0 && <figure className="chartCard"><figcaption>{copy.distribution}</figcaption><div className="donutLayout"><div className="donut" style={{ background: `conic-gradient(${gradient})` }} /><ul>{entries.map(([label, count], index) => <li key={`${label}-${count}`}><i style={{ background: ["#7c6cf2", "#4da7d8", "#55b89f", "#e6a85c", "#d96f91"][index % 5] }} /><span dir="auto">{label}</span><strong>{count}</strong></li>)}</ul></div></figure>}</div></section>}
          {showStandard && context.analysisType === "methodology" && <section className="reportSection"><p className="sectionLabel">04</p><h3>{copy.method}</h3><p dir="auto">{payload.recommendedMethod}</p>{payload.studyDesign && <><h4>{copy.design}</h4><p dir="auto">{payload.studyDesign}</p></>}{payload.questions?.length > 0 && <><h4>{copy.questions}</h4><ul>{payload.questions.map((item) => <li key={item} dir="auto">{item}</li>)}</ul></>}</section>}
          {showStandard && workflow.length > 0 && <section className="reportSection"><p className="sectionLabel">05</p><h3>{copy.workflow}</h3><div className="workflowDiagram">{workflow.map((step, index) => <div className="workflowNode" key={`${index}-${step}`}><span>{String(index + 1).padStart(2, "0")}</span><p dir="auto">{step}</p></div>)}</div></section>}
          {showStandard && interpretation && <section className="reportSection"><h3>{copy.interpretation}</h3><p dir="auto">{interpretation.interpretation || interpretation.summary}</p></section>}
          {showStandard && limitations && <section className="reportSection limitationCard"><h3>{copy.limitations}</h3><p dir="auto">{limitations}</p></section>}
          {showStandard && nextSteps.length > 0 && <section className="reportSection"><h3>{copy.next}</h3><ul>{nextSteps.map((item) => <li key={item} dir="auto">{item}</li>)}</ul></section>}
          {showVisual && !metrics.length && !entries.length && <section className="reportSection"><p>{summary}</p></section>}
        </>
      )}
      <footer className="reportFooter"><Link href={returnTarget.href} className="secondaryLink">{returnTarget.label}</Link></footer>
    </article>
  );
}

export default function ResearchReport() {
  const { language, t } = useLanguage();
  const copy = REPORT_COPY[language];
  const [regeneratedInterpretation, setRegeneratedInterpretation] = useState(null);
  const [regenerating, setRegenerating] = useState(false);
  const [regenerationError, setRegenerationError] = useState("");
  const isClient = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  const reportContext = isClient
    ? readReportContext(window.location.search)
    : null;
  const hasContextRequest = isClient && new URLSearchParams(window.location.search).has("reportId");

  const analysis = isClient && !hasContextRequest
    ? readStoredJson("lingualab-analysis-result")
    : null;

  const storedInterpretation = isClient && !hasContextRequest
    ? readStoredJson("lingualab-interpretation")
    : null;

  const interpretation = regeneratedInterpretation || normalizeInterpretation(storedInterpretation);
  const interpretationLanguage = detectInterpretationLanguage(interpretation);
  const languageMismatch = Boolean(interpretation && interpretationLanguage && interpretationLanguage !== language);
  const displayedInterpretation = languageMismatch ? null : interpretation;

  const methodologicalImplications = getInterpretationField(
    displayedInterpretation,
    [
      "methodology",
      "methodologicalImplications",
      "researchImplications",
      "methodological_implications",
    ],
    t("reportFallback.methodology")
  );

  const limitations = getInterpretationField(
    displayedInterpretation,
    ["limitations", "limitation"],
    t("reportFallback.limitations")
  );

  const nextStep = getInterpretationField(
    displayedInterpretation,
    [
      "nextStep",
      "recommendedNextStep",
      "next_step",
      "recommended_next_step",
    ],
    t("reportFallback.next")
  );

  const paperParagraph = getInterpretationField(
    displayedInterpretation,
    [
      "paperParagraph",
      "draftParagraph",
      "paper_paragraph",
      "researchParagraph",
    ],
    t("reportFallback.draft")
  );

  const interpretationText = getInterpretationField(
    displayedInterpretation,
    ["interpretation", "summary"],
    t("reportFallback.interpretation")
  );

  const topWords = Array.isArray(analysis?.topWords)
    ? analysis.topWords
    : [];
  const distribution = normalizeDistribution(analysis?.labelDistribution || analysis?.distribution);
  const maxFrequency = Math.max(0, ...topWords.map((item) => Number(item?.[1]) || 0));
  const distributionTotal = distribution.reduce((sum, item) => sum + item[1], 0);
  const distributionGradient = distribution.map(([, count], index) => {
    const start = distribution.slice(0, index).reduce((sum, item) => sum + item[1], 0) / distributionTotal * 100;
    const end = start + count / distributionTotal * 100;
    return `${["#7c6cf2", "#4da7d8", "#55b89f", "#e6a85c", "#d96f91"][index % 5]} ${start}% ${end}%`;
  }).join(", ");

  const hasReportData = Boolean(reportContext || analysis || interpretation);
  const exportModel = reportExportModel(reportContext, analysis);
  const reportTitle = reportContext
    ? contextualTitle(reportContext.analysisType, language, reportContext.payload.size)
    : t("report.title");
  const returnTarget = reportReturnTarget(reportContext?.sourceTool, language);

  const printReport = () => {
    window.print();
  };

  const regenerateInterpretation = async () => {
    if (!analysis?.text || regenerating) return;
    setRegenerating(true);
    setRegenerationError("");
    try {
      const response = await fetch("/api/research-interpreter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: analysis.text, wordCount: analysis.wordCount, sentenceCount: analysis.sentenceCount, topWords, uiLanguage: language }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || copy.regenerateError);
      const regenerated = normalizeInterpretation(data);
      setRegeneratedInterpretation(regenerated);
      try { sessionStorage.setItem("lingualab-interpretation", JSON.stringify(regenerated)); } catch {}
      try { localStorage.setItem("lingualab-interpretation", JSON.stringify(regenerated)); } catch {}
    } catch {
      setRegenerationError(copy.regenerateError);
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <>
      <Head>
        <title>{t("report.pageTitle")}</title>
        <meta
          name="description"
          content={t("report.meta")}
        />
      </Head>

      <main className="reportPage">
        <nav className="nav">
          <Link href="/" className="brand">
            <span className="brandMark">L</span>
            <span>LinguaLab</span>
          </Link>

          <div className="navLinks">
            <Link href="/workspace">{t("nav.workspace")}</Link>
            <Link href="/tools/analyze">{t("nav.analyze")}</Link>
            <button
              type="button"
              onClick={printReport}
              className="exportButton"
            >
              {t("report.export")}
            </button>
          </div>
        </nav>

        <section className="hero">
          <div>
            <p className="eyebrow">{t("report.eyebrow")}</p>
            <h1>{t("report.title")}</h1><p className="lead">{t("report.lead")}</p>
          </div>

          <aside className="principleCard">
            <span>{t("report.principleLabel")}</span><strong>{t("report.principle")}</strong>
          </aside>
        </section>

        {hasReportData && <div className="sourceIndicator"><DataSourceIndicator language={language} mode="report" /></div>}

        {!isClient ? (
          <section className="emptyCard">
            <span className="spark">✦</span>
            <h2>{t("report.preparing")}</h2>
          </section>
        ) : !hasReportData ? (
          <section className="emptyCard">
            <span className="spark">✦</span>
            <h2>{t("report.empty")}</h2><p>{t("report.emptyText")}</p>

            <Link href="/tools/analyze" className="primaryLink">
              {t("report.goAnalyze")}
              <span aria-hidden="true">↗</span>
            </Link>
          </section>
        ) : reportContext ? (
          <ContextualReport context={reportContext} language={language} reportRef={reportRef} view={reportView} setView={setReportView} returnTarget={returnTarget} />
        ) : (
          <article className="report">
            <header className="reportHeader">
              <div>
                <p className="sectionLabel">{t("report.generated")}</p><h2>{t("report.summary")}</h2>
              </div>

              <div className="reportMeta">
                <span>
                  {interpretation?.mode === "preview"
                    ? t("report.preview") : t("report.assisted")}
                </span>
                <strong>
                  {new Date().toLocaleDateString(language, {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </strong>
              </div>
            </header>

            {analysis && (
              <section className="reportSection">
                <p className="sectionLabel">02</p><h3>{copy.metrics}</h3>
                <div className="stats">
                  {Number.isFinite(Number(analysis.wordCount)) && <div className="stat"><span>{t("report.words")}</span><strong>{Number(analysis.wordCount).toLocaleString(language)}</strong></div>}
                  {Number.isFinite(Number(analysis.sentenceCount)) && <div className="stat"><span>{t("report.sentences")}</span><strong>{Number(analysis.sentenceCount).toLocaleString(language)}</strong></div>}
                  {topWords.length > 0 && <div className="stat"><span>{t("report.terms")}</span><strong>{topWords.length.toLocaleString(language)}</strong></div>}
                </div>
              </section>
            )}

            {(topWords.length > 0 || distribution.length > 0) && (
              <section className="reportSection">
                <p className="sectionLabel">03</p><h3>{copy.visuals}</h3>
                <div className="visualGrid">
                  {topWords.length > 0 && <figure className="chartCard"><figcaption>{copy.frequencyChart}</figcaption><div className="barChart">{topWords.map(([word, count]) => <div className="barRow" key={`${word}-${count}`}><span dir="auto">{word}</span><div><i style={{ width: `${maxFrequency ? Math.max(4, Number(count) / maxFrequency * 100) : 0}%` }} /></div><strong>{count}</strong></div>)}</div></figure>}
                  {distribution.length > 0 && <figure className="chartCard"><figcaption>{copy.distributionChart}</figcaption><div className="donutLayout"><div className="donut" style={{ background: `conic-gradient(${distributionGradient})` }} aria-label={copy.distributionChart} /><ul>{distribution.map(([label, count], index) => <li key={`${label}-${count}`}><i style={{ background: ["#7c6cf2", "#4da7d8", "#55b89f", "#e6a85c", "#d96f91"][index % 5] }} /><span dir="auto">{label}</span><strong>{count}</strong></li>)}</ul></div></figure>}
                </div>
              </section>
            )}

            <section className="reportSection">
              <p className="sectionLabel">04</p><h3>{copy.interpretation}</h3>
              {languageMismatch ? <div className="languageNotice" role="status"><p>{copy.mismatch}</p><button type="button" onClick={regenerateInterpretation} disabled={regenerating || !analysis?.text}>{regenerating ? copy.regenerating : copy.regenerate}</button>{regenerationError && <span role="alert">{regenerationError}</span>}</div> : <><p dir="auto">{interpretationText}</p><h4>{t("report.methodology")}</h4><p dir="auto">{methodologicalImplications}</p></>}
            </section>

            <section className="reportSection limitationCard">
              <p className="sectionLabel">05</p><h3>{t("report.limitations")}</h3><p dir="auto">{limitations}</p>
            </section>

            <section className="reportSection nextStepSection">
              <div>
                <p className="sectionLabel">06</p><h3>{copy.conclusions}</h3><p dir="auto">{nextStep}</p>
              </div>

              <Link href={returnTarget.href} className="secondaryLink">
                {returnTarget.label}
                <span aria-hidden="true">↗</span>
              </Link>
            </section>

            <section className="draftSection">
              <h3>{t("report.draft")}</h3><blockquote dir="auto">{paperParagraph}</blockquote>

              <p className="draftNote">
                {t("report.draftNote")}
              </p>
            </section>

            {analysis?.text && (
              <details className="sourceDetails">
                <summary>{t("report.viewSource")}</summary>
                <p dir="auto">{analysis.text}</p>
              </details>
            )}

            <footer className="reportFooter">
              <div>
                <strong>LinguaLab</strong>
                <span>{t("report.tagline")}</span>
              </div>

              <p>
                {t("report.footer")}
              </p>
            </footer>
          </article>
        )}
      </main>

      <style jsx>{`
        :global(*) {
          box-sizing: border-box;
        }

        :global(body) {
          margin: 0;
          background:
            radial-gradient(circle at 15% 10%, #ece9ff 0, transparent 34%),
            linear-gradient(135deg, #fbfbff 0%, #f5f5ff 100%);
          color: #17142f;
        }

        :global(a) {
          color: inherit;
          text-decoration: none;
        }

        .reportPage {
          min-height: 100vh;
          padding: 0 34px 70px;
          font-family: var(--font-ui);
        }

        .nav {
          min-height: 76px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          border-bottom: 1px solid rgba(23, 20, 47, 0.1);
        }

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          font-size: 20px;
          font-weight: 700;
        }

        .brandMark {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          color: white;
          background: #6554f6;
          box-shadow: 0 12px 25px rgba(101, 84, 246, 0.24);
        }

        .navLinks {
          display: flex;
          align-items: center;
          gap: 24px;
          font-size: var(--text-nav);
          font-weight: 600;
        }

        .exportButton {
          border: 0;
          border-radius: 999px;
          background: #17142f;
          color: white;
          padding: 13px 20px;
          font: inherit;
          cursor: pointer;
        }
        .sourceIndicator { max-width: 1240px; margin: 0 auto 18px; }

        .hero {
          max-width: 1240px;
          margin: 0 auto;
          padding: 82px 0 42px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 320px;
          align-items: end;
          gap: 70px;
        }

        .eyebrow,
        .sectionLabel {
          margin: 0 0 15px;
          color: #6351f4;
          font-size: var(--text-meta);
          font-weight: 500;
          letter-spacing: 0.14em;
        }

        .hero h1 {
          max-width: 850px;
          margin: 0;
          font-size: var(--text-page);
          line-height: var(--leading-heading);
          letter-spacing: var(--tracking-heading);
        }

        .lead {
          max-width: 850px;
          margin: 28px 0 0;
          color: #6d6889;
          font-size: var(--text-body);
          line-height: var(--leading-body);
        }

        .principleCard {
          padding: 30px;
          border: 1px solid #d8d2ff;
          border-radius: 26px;
          background: rgba(255, 255, 255, 0.74);
          box-shadow: 0 24px 60px rgba(80, 67, 160, 0.1);
        }

        .principleCard span {
          display: block;
          margin-bottom: 16px;
          color: #9089ad;
          font-size: var(--text-meta);
          letter-spacing: 0.13em;
        }

        .principleCard strong {
          font-size: var(--text-body);
          line-height: var(--leading-body);
        }

        :global(html[lang="ar"]) .eyebrow,
        :global(html[lang="ar"]) .sectionLabel,
        :global(html[lang="ar"]) .principleCard span,
        :global(html[lang="ar"]) .stat span {
          letter-spacing: 0;
          text-transform: none;
        }

        .emptyCard,
        .report {
          max-width: 1240px;
          margin: 0 auto;
          border-radius: 30px;
          background: #19152f;
          color: white;
          box-shadow: 0 28px 80px rgba(32, 24, 93, 0.18);
          overflow: hidden;
        }

        .emptyCard {
          min-height: 340px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          padding: 70px;
        }

        .emptyCard h2 {
          margin: 20px 0 10px;
          font-size: var(--text-page);
          line-height: var(--leading-heading);
        }

        .emptyCard p {
          max-width: 660px;
          color: #c5c0dc;
          font-size: var(--text-body);
          line-height: var(--leading-body);
        }

        .spark {
          font-size: 32px;
          color: #b8afff;
        }

        .primaryLink,
        .secondaryLink {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          border-radius: 999px;
          padding: 14px 20px;
          font-size: var(--text-button);
          font-weight: 600;
        }

        .primaryLink {
          margin-top: 18px;
          background: white;
          color: #17142f;
        }

        .secondaryLink {
          flex: 0 0 auto;
          background: white;
          color: #17142f;
        }

        .reportHeader,
        .reportSection,
        .draftSection,
        .reportFooter {
          padding: 46px 52px;
        }

        .reportHeader {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        }

        .reportHeader h2 {
          margin: 0;
          font-size: var(--text-page);
          line-height: var(--leading-heading);
          letter-spacing: var(--tracking-heading);
        }

        .reportMeta {
          min-width: 190px;
          padding: 18px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.06);
        }

        .reportMeta span,
        .reportMeta strong {
          display: block;
        }

        .reportMeta span {
          color: #aaa4c7;
          font-size: var(--text-meta);
          margin-bottom: 8px;
        }

        .reportSection {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .reportSection h3,
        .draftSection h3 {
          margin: 0 0 20px;
          font-size: var(--text-section);
          line-height: var(--leading-heading);
          letter-spacing: var(--tracking-heading);
        }

        .reportSection p,
        .draftSection p {
          color: #d8d4e8;
          font-size: var(--text-body);
          line-height: var(--leading-body);
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin: 30px 0;
        }

        .stat {
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.13);
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.06);
        }

        .stat span,
        .stat strong {
          display: block;
        }

        .stat span {
          margin-bottom: 9px;
          color: #aaa4c7;
          font-size: var(--text-meta);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .stat strong {
          font-size: var(--text-section);
        }

        .keywordBlock {
          margin-top: 35px;
        }

        .keywordBlock h4 {
          margin: 0 0 14px;
          font-size: var(--text-card);
          font-weight: 600;
        }

        .keywordList {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .keywordList li {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
          padding: 13px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .visualGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 18px;
          margin-top: 26px;
        }

        .chartCard {
          margin: 0;
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.13);
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.06);
        }

        .chartCard figcaption {
          margin-bottom: 20px;
          font-size: var(--text-card);
          font-weight: 600;
        }

        .barChart { display: grid; gap: 13px; }
        .barRow { display: grid; grid-template-columns: minmax(80px, 0.7fr) minmax(120px, 2fr) auto; align-items: center; gap: 12px; font-size: var(--text-helper); }
        .barRow > div { height: 10px; overflow: hidden; border-radius: 999px; background: rgba(255, 255, 255, 0.1); }
        .barRow i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #7c6cf2, #62b5dc); }
        .donutLayout { display: flex; align-items: center; gap: 24px; }
        .donut { width: 150px; aspect-ratio: 1; flex: 0 0 auto; border-radius: 50%; position: relative; }
        .donut::after { content: ""; position: absolute; inset: 28%; border-radius: 50%; background: #27223d; }
        .donutLayout ul { display: grid; gap: 10px; width: 100%; margin: 0; padding: 0; list-style: none; }
        .donutLayout li { display: grid; grid-template-columns: 10px 1fr auto; align-items: center; gap: 9px; font-size: var(--text-helper); }
        .donutLayout li i { width: 10px; height: 10px; border-radius: 50%; }

        .languageNotice { padding: 22px; border: 1px solid rgba(184, 175, 255, 0.35); border-radius: 18px; background: rgba(184, 175, 255, 0.08); }
        .languageNotice p { margin-top: 0; }
        .languageNotice button { border: 0; border-radius: 999px; padding: 12px 18px; background: #fff; color: #17142f; font: inherit; font-size: var(--text-button); font-weight: 600; cursor: pointer; }
        .languageNotice button:disabled { cursor: not-allowed; opacity: 0.65; }
        .languageNotice span { display: block; margin-top: 12px; color: #ffc9c9; font-size: var(--text-helper); }

        .reportSection h4 { margin: 26px 0 8px; font-size: var(--text-card); }

        .splitSection {
          display: grid;
          grid-template-columns: 1fr 0.85fr;
          gap: 28px;
        }

        .limitationCard {
          background: rgba(255, 255, 255, 0.07);
        }

        .nextStepSection {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 35px;
        }

        .draftSection {
          background: #f5f3ff;
          color: #17142f;
        }

        .draftSection blockquote {
          margin: 0;
          padding: 30px;
          border-left: 5px solid #6554f6;
          border-radius: 0 20px 20px 0;
          background: white;
          color: #24203d;
          font-size: var(--text-body);
          line-height: var(--leading-body);
          box-shadow: 0 15px 45px rgba(75, 59, 160, 0.09);
        }

        .draftSection .draftNote {
          color: #716b8c;
          font-size: var(--text-meta);
          line-height: var(--leading-helper);
        }

        .sourceDetails {
          padding: 28px 52px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .sourceDetails summary {
          cursor: pointer;
          font-size: var(--text-card);
          font-weight: 600;
        }

        .sourceDetails p {
          color: #d8d4e8;
          line-height: 1.9;
          white-space: pre-wrap;
        }

        .reportFooter {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
        }

        .reportFooter div {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .reportFooter div span,
        .reportFooter p {
          color: #aaa4c7;
          font-size: var(--text-meta);
        }

        .reportFooter p {
          max-width: 470px;
          margin: 0;
          text-align: end;
          line-height: 1.6;
        }

        .viewTabs {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          padding: 20px 52px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .viewTabs button {
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 999px;
          padding: 10px 17px;
          background: transparent;
          color: white;
          font: inherit;
          font-size: var(--text-button);
          font-weight: 600;
          cursor: pointer;
        }

        .viewTabs button[aria-pressed="true"] { background: white; color: #17142f; }
        .viewTabs button:disabled { cursor: not-allowed; opacity: 0.45; }
        .contextList { display: grid; gap: 12px; padding-inline-start: 24px; }
        .contextList li { padding: 14px 16px; border-radius: 14px; background: rgba(255, 255, 255, 0.06); color: #d8d4e8; font-size: var(--text-body); line-height: var(--leading-body); }
        .workflowDiagram { display: grid; gap: 12px; margin-top: 24px; }
        .workflowNode { display: grid; grid-template-columns: 44px 1fr; align-items: center; gap: 14px; position: relative; padding: 16px 18px; border: 1px solid rgba(255, 255, 255, 0.13); border-radius: 16px; background: rgba(255, 255, 255, 0.06); }
        .workflowNode span { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 50%; background: #6554f6; font-size: var(--text-meta); font-weight: 700; }
        .workflowNode p { margin: 0; }

        @media (max-width: 900px) {
          .reportPage {
            padding: 0 18px 45px;
          }

          .nav {
            align-items: flex-start;
            padding: 18px 0;
          }

          .navLinks {
            flex-wrap: wrap;
            justify-content: flex-end;
            gap: 12px;
          }

          .hero {
            grid-template-columns: 1fr;
            gap: 30px;
            padding-top: 55px;
          }

          .principleCard {
            max-width: none;
          }

          .reportHeader,
          .nextStepSection,
          .reportFooter {
            align-items: flex-start;
            flex-direction: column;
          }

          .splitSection {
            grid-template-columns: 1fr;
          }

          .stats {
            grid-template-columns: 1fr;
          }

          .visualGrid { grid-template-columns: 1fr; }
          .donutLayout { align-items: flex-start; flex-direction: column; }
          .barRow { grid-template-columns: minmax(70px, 0.8fr) minmax(90px, 1.5fr) auto; }

          .reportHeader,
          .reportSection,
          .draftSection,
          .reportFooter,
          .sourceDetails,
          .viewTabs {
            padding-left: 26px;
            padding-right: 26px;
          }

          .reportFooter p {
            text-align: start;
          }
        }

        @media print {
          :global(body) {
            background: white;
          }

          .reportPage {
            padding: 0;
          }

          .nav,
          .hero,
          .languageNotice,
          .emptyCard,
          .secondaryLink {
            display: none !important;
          }

          .report {
            max-width: none;
            border-radius: 0;
            box-shadow: none;
          }

          .reportSection,
          .draftSection,
          .reportHeader,
          .reportFooter,
          .sourceDetails {
            break-inside: avoid;
          }
        }
      `}</style>
    </>
  );
}

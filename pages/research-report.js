import Head from "next/head";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useLanguage } from "../components/LanguageProvider";

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

export default function ResearchReport() {
  const { language, t } = useLanguage();
  const isClient = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  const analysis = isClient
    ? readStoredJson("lingualab-analysis-result")
    : null;

  const storedInterpretation = isClient
    ? readStoredJson("lingualab-interpretation")
    : null;

  const interpretation = normalizeInterpretation(storedInterpretation);

  const methodologicalImplications = getInterpretationField(
    interpretation,
    [
      "methodology",
      "methodologicalImplications",
      "researchImplications",
      "methodological_implications",
    ],
    t("reportFallback.methodology")
  );

  const limitations = getInterpretationField(
    interpretation,
    ["limitations", "limitation"],
    t("reportFallback.limitations")
  );

  const nextStep = getInterpretationField(
    interpretation,
    [
      "nextStep",
      "recommendedNextStep",
      "next_step",
      "recommended_next_step",
    ],
    t("reportFallback.next")
  );

  const paperParagraph = getInterpretationField(
    interpretation,
    [
      "paperParagraph",
      "draftParagraph",
      "paper_paragraph",
      "researchParagraph",
    ],
    t("reportFallback.draft")
  );

  const interpretationText = getInterpretationField(
    interpretation,
    ["interpretation", "summary"],
    t("reportFallback.interpretation")
  );

  const topWords = Array.isArray(analysis?.topWords)
    ? analysis.topWords
    : [];

  const hasReportData = Boolean(analysis || interpretation);

  const printReport = () => {
    window.print();
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

            <section className="reportSection">
              <p className="sectionLabel">{t("report.overview")}</p><h3>{t("report.profile")}</h3>

              <div className="stats">
                <div className="stat">
                  <span>{t("report.words")}</span>
                  <strong>{analysis?.wordCount ?? "—"}</strong>
                </div>

                <div className="stat">
                  <span>{t("report.sentences")}</span>
                  <strong>{analysis?.sentenceCount ?? "—"}</strong>
                </div>

                <div className="stat">
                  <span>{t("report.terms")}</span>
                  <strong>{topWords.length || "—"}</strong>
                </div>
              </div>

              {topWords.length > 0 && (
                <div className="keywordBlock">
                  <h4>{t("report.frequent")}</h4>

                  <ol className="keywordList">
                    {topWords.map(([word, count]) => (
                      <li key={`${word}-${count}`}>
                        <span dir="auto">{word}</span>
                        <strong>{count}</strong>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </section>

            <section className="reportSection">
              <p className="sectionLabel">{t("report.interpretationLabel")}</p><h3>{t("report.meaning")}</h3><p dir="auto">{interpretationText}</p>
            </section>

            <section className="reportSection splitSection">
              <div>
                <p className="sectionLabel">
                  {t("report.methodologyLabel")}
                </p>
                <h3>{t("report.methodology")}</h3><p dir="auto">{methodologicalImplications}</p>
              </div>

              <div className="limitationCard">
                <p className="sectionLabel">{t("report.limitationsLabel")}</p><h3>{t("report.limitations")}</h3><p dir="auto">{limitations}</p>
              </div>
            </section>

            <section className="reportSection nextStepSection">
              <div>
                <p className="sectionLabel">{t("report.nextLabel")}</p><h3>{t("report.continue")}</h3><p dir="auto">{nextStep}</p>
              </div>

              <Link href="/tools/analyze" className="secondaryLink">
                {t("report.return")}
                <span aria-hidden="true">↗</span>
              </Link>
            </section>

            <section className="draftSection">
              <p className="sectionLabel">{t("report.draftLabel")}</p><h3>{t("report.draft")}</h3><blockquote dir="auto">{paperParagraph}</blockquote>

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
          font-family:
            Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
            "Segoe UI", sans-serif;
        }

        :global(a) {
          color: inherit;
          text-decoration: none;
        }

        .reportPage {
          min-height: 100vh;
          padding: 0 34px 70px;
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
          font-weight: 850;
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
          font-size: 14px;
          font-weight: 750;
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
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.14em;
        }

        .hero h1 {
          max-width: 850px;
          margin: 0;
          font-size: clamp(48px, 6.2vw, 88px);
          line-height: 0.97;
          letter-spacing: -0.065em;
        }

        .lead {
          max-width: 850px;
          margin: 28px 0 0;
          color: #6d6889;
          font-size: 19px;
          line-height: 1.7;
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
          font-size: 11px;
          letter-spacing: 0.13em;
        }

        .principleCard strong {
          font-size: 17px;
          line-height: 1.5;
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
          font-size: 38px;
        }

        .emptyCard p {
          max-width: 660px;
          color: #c5c0dc;
          font-size: 17px;
          line-height: 1.7;
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
          font-weight: 850;
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
          font-size: 46px;
          letter-spacing: -0.04em;
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
          font-size: 12px;
          margin-bottom: 8px;
        }

        .reportSection {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .reportSection h3,
        .draftSection h3 {
          margin: 0 0 20px;
          font-size: 29px;
          letter-spacing: -0.025em;
        }

        .reportSection p,
        .draftSection p {
          color: #d8d4e8;
          font-size: 16px;
          line-height: 1.75;
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
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .stat strong {
          font-size: 30px;
        }

        .keywordBlock {
          margin-top: 35px;
        }

        .keywordBlock h4 {
          margin: 0 0 14px;
          font-size: 19px;
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

        .splitSection {
          display: grid;
          grid-template-columns: 1fr 0.85fr;
          gap: 28px;
        }

        .limitationCard {
          padding: 27px;
          border-radius: 22px;
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
          font-size: 18px;
          line-height: 1.8;
          box-shadow: 0 15px 45px rgba(75, 59, 160, 0.09);
        }

        .draftSection .draftNote {
          color: #716b8c;
          font-size: 13px;
        }

        .sourceDetails {
          padding: 28px 52px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .sourceDetails summary {
          cursor: pointer;
          font-weight: 800;
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
          font-size: 12px;
        }

        .reportFooter p {
          max-width: 470px;
          margin: 0;
          text-align: end;
          line-height: 1.6;
        }

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

          .reportHeader,
          .reportSection,
          .draftSection,
          .reportFooter,
          .sourceDetails {
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

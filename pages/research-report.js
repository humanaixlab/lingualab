import Head from "next/head";
import Link from "next/link";
import { useSyncExternalStore } from "react";

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
    "No methodological implications are available yet."
  );

  const limitations = getInterpretationField(
    interpretation,
    ["limitations", "limitation"],
    "No limitations are available yet."
  );

  const nextStep = getInterpretationField(
    interpretation,
    [
      "nextStep",
      "recommendedNextStep",
      "next_step",
      "recommended_next_step",
    ],
    "No recommended next analysis is available yet."
  );

  const paperParagraph = getInterpretationField(
    interpretation,
    [
      "paperParagraph",
      "draftParagraph",
      "paper_paragraph",
      "researchParagraph",
    ],
    "No research-ready paragraph is available yet."
  );

  const interpretationText = getInterpretationField(
    interpretation,
    ["interpretation", "summary"],
    "No AI interpretation is available yet."
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
        <title>Research Report | LinguaLab</title>
        <meta
          name="description"
          content="A research-ready LinguaLab report combining descriptive analysis, AI interpretation, limitations, and next steps."
        />
      </Head>

      <main className="reportPage">
        <nav className="nav">
          <Link href="/" className="brand">
            <span className="brandMark">L</span>
            <span>LinguaLab</span>
          </Link>

          <div className="navLinks">
            <Link href="/workspace">Workspace</Link>
            <Link href="/tools/analyze">Analyze</Link>
            <button
              type="button"
              onClick={printReport}
              className="exportButton"
            >
              Export report
            </button>
          </div>
        </nav>

        <section className="hero">
          <div>
            <p className="eyebrow">RESEARCH REPORT</p>
            <h1>From descriptive evidence to a defensible research summary.</h1>
            <p className="lead">
              LinguaLab combines the text profile and AI Research Interpreter
              into one report with findings, methodological implications,
              limitations, and a recommended next step.
            </p>
          </div>

          <aside className="principleCard">
            <span>REPORTING PRINCIPLE</span>
            <strong>
              Treat AI interpretation as research support—not as a substitute
              for researcher judgment.
            </strong>
          </aside>
        </section>

        {!isClient ? (
          <section className="emptyCard">
            <span className="spark">✦</span>
            <h2>Preparing your report...</h2>
          </section>
        ) : !hasReportData ? (
          <section className="emptyCard">
            <span className="spark">✦</span>
            <h2>No analysis has been saved yet.</h2>
            <p>
              Run a text analysis and use the AI Research Interpreter before
              opening the report.
            </p>

            <Link href="/tools/analyze" className="primaryLink">
              Go to Analyze
              <span aria-hidden="true">↗</span>
            </Link>
          </section>
        ) : (
          <article className="report">
            <header className="reportHeader">
              <div>
                <p className="sectionLabel">LINGUALAB GENERATED REPORT</p>
                <h2>Research analysis summary</h2>
              </div>

              <div className="reportMeta">
                <span>
                  {interpretation?.mode === "preview"
                    ? "Preview interpretation"
                    : "AI-assisted interpretation"}
                </span>
                <strong>
                  {new Date().toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </strong>
              </div>
            </header>

            <section className="reportSection">
              <p className="sectionLabel">01 · ANALYSIS OVERVIEW</p>
              <h3>Text profile</h3>

              <div className="stats">
                <div className="stat">
                  <span>Words</span>
                  <strong>{analysis?.wordCount ?? "—"}</strong>
                </div>

                <div className="stat">
                  <span>Sentences</span>
                  <strong>{analysis?.sentenceCount ?? "—"}</strong>
                </div>

                <div className="stat">
                  <span>Recurring terms</span>
                  <strong>{topWords.length || "—"}</strong>
                </div>
              </div>

              {topWords.length > 0 && (
                <div className="keywordBlock">
                  <h4>Most frequent words</h4>

                  <ol className="keywordList">
                    {topWords.map(([word, count]) => (
                      <li key={`${word}-${count}`}>
                        <span>{word}</span>
                        <strong>{count}</strong>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </section>

            <section className="reportSection">
              <p className="sectionLabel">02 · AI INTERPRETATION</p>
              <h3>What the findings may mean</h3>
              <p>{interpretationText}</p>
            </section>

            <section className="reportSection splitSection">
              <div>
                <p className="sectionLabel">
                  03 · METHODOLOGICAL IMPLICATIONS
                </p>
                <h3>How the result should guide the research design</h3>
                <p>{methodologicalImplications}</p>
              </div>

              <div className="limitationCard">
                <p className="sectionLabel">04 · LIMITATIONS</p>
                <h3>What this analysis cannot establish</h3>
                <p>{limitations}</p>
              </div>
            </section>

            <section className="reportSection nextStepSection">
              <div>
                <p className="sectionLabel">05 · RECOMMENDED NEXT STEP</p>
                <h3>Continue the investigation</h3>
                <p>{nextStep}</p>
              </div>

              <Link href="/tools/analyze" className="secondaryLink">
                Return to analysis
                <span aria-hidden="true">↗</span>
              </Link>
            </section>

            <section className="draftSection">
              <p className="sectionLabel">06 · RESEARCH-READY DRAFT</p>
              <h3>Draft paragraph</h3>
              <blockquote>{paperParagraph}</blockquote>

              <p className="draftNote">
                Review this paragraph against the original data and your
                disciplinary conventions before using it in academic work.
              </p>
            </section>

            {analysis?.text && (
              <details className="sourceDetails">
                <summary>View analyzed text sample</summary>
                <p dir="auto">{analysis.text}</p>
              </details>
            )}

            <footer className="reportFooter">
              <div>
                <strong>LinguaLab</strong>
                <span>Build. Analyze. Learn. Discover.</span>
              </div>

              <p>
                AI-generated interpretation should be validated by the
                researcher before it is used to support a claim.
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
          text-align: right;
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
            text-align: left;
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
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import { createToolHandoff, readToolHandoff, codeTask } from "../../lib/tool-handoff";

export default function CodeTool() {
  const [language, setLanguage] = useState("Python");
  const [task, setTask] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [generatedCode, setGeneratedCode] = useState("");
  const [generatedLanguage, setGeneratedLanguage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const handoff = readToolHandoff("code", window.location.search);
      if (handoff) setTask(codeTask(handoff));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [router.asPath]);

  const generateCode = async () => {
    const cleanTask = task.trim();

    if (!cleanTask) {
      setError("Describe the research or coding task before generating code.");
      setGeneratedCode("");
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 180000);

    setLoading(true);
    setError("");
    setGeneratedCode("");
    setCopied(false);

    try {
      const response = await fetch("/api/code-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: cleanTask,
          language,
          details: `Researcher experience level: ${level}`,
        }),
        signal: controller.signal,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Code generation failed.");
      }

      if (!data?.result) {
        throw new Error("GPT-5.6 did not return a usable result.");
      }

      setGeneratedCode(data.result);
      setGeneratedLanguage(language);
    } catch (requestError) {
      setError(
        requestError?.name === "AbortError"
          ? "Code generation timed out. Please shorten the task or split it into smaller steps, then try again."
          : requestError?.message || "Code generation failed. Please try again."
      );
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  };

  const copyCode = async () => {
    if (!generatedCode) return;

    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (copyError) {
      console.error("Failed to copy generated code:", copyError);
      setError("The result could not be copied. Please select and copy it manually.");
    }
  };

  const clearAll = () => {
    setLanguage("Python");
    setTask("");
    setLevel("Beginner");
    setGeneratedCode("");
    setError("");
    setCopied(false);
  };

  return (
    <Layout title="AI Code Assistant">
      <div style={styles.page}>
        <p style={styles.intro}>
          Generate research-ready code for Arabic NLP, corpus analysis, data
          preparation, and reproducible experiments—with implementation guidance
          from GPT-5.6.
        </p>

        <div style={styles.infoCard}>
          <span aria-hidden="true" style={styles.infoIcon}>✦</span>
          <div>
            <strong style={styles.infoTitle}>Research-oriented generation</strong>
            <p style={styles.infoText}>
              Describe the method, expected input, and desired output. Never include
              API keys, participant identifiers, or sensitive raw data.
            </p>
          </div>
        </div>

        <div style={styles.formCard}>
          <div style={styles.fieldGrid}>
            <div style={styles.field}>
              <label htmlFor="code-language" style={styles.label}>Programming language</label>
              <select
                id="code-language"
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                style={styles.control}
                disabled={loading}
              >
                <option>Python</option>
                <option>JavaScript</option>
                <option>HTML</option>
                <option>CSS</option>
              </select>
            </div>

            <div style={styles.field}>
              <label htmlFor="experience-level" style={styles.label}>Experience level</label>
              <select
                id="experience-level"
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                style={styles.control}
                disabled={loading}
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
          </div>

          <div style={styles.field}>
            <label htmlFor="research-code-task" style={styles.label}>Research coding task</label>
            <textarea
              id="research-code-task"
              value={task}
              onChange={(event) => setTask(event.target.value)}
              placeholder="Example: Build a Python script that compares word frequencies across two Arabic text corpora and exports a reproducible CSV summary."
              style={styles.textarea}
              maxLength={6000}
              disabled={loading}
            />
            <p style={styles.fieldHint}>
              Include your research objective, input format, constraints, and expected output.
            </p>
          </div>

          {error && <p role="alert" style={styles.error}>{error}</p>}

          <div style={styles.actions}>
            <button
              type="button"
              onClick={generateCode}
              style={{ ...styles.primaryButton, opacity: loading ? 0.7 : 1 }}
              disabled={loading}
            >
              {loading ? "Generating research code..." : "✦ Generate Research Code"}
            </button>
            <button
              type="button"
              onClick={clearAll}
              style={styles.secondaryButton}
              disabled={loading}
            >
              Clear
            </button>
          </div>
        </div>

        {generatedCode && (
          <div style={styles.outputCard}>
            <div style={styles.outputHeader}>
              <div>
                <p style={styles.eyebrow}>GPT-5.6 RESEARCH OUTPUT</p>
                <h2 style={styles.outputTitle}>Implementation blueprint</h2>
              </div>
              <button type="button" onClick={copyCode} style={styles.copyButton}>
                {copied ? "Copied" : "Copy output"}
              </button>
            </div>
            <pre style={styles.output}>{generatedCode}</pre>
            <button type="button" style={styles.secondaryButton} onClick={() => {
              try {
                window.location.href = createToolHandoff("code", "colab", { response: generatedCode, language: generatedLanguage });
              } catch (transferError) { setError(transferError.message); }
            }}>Continue to Google Colab →</button>
          </div>
        )}
      </div>
    </Layout>
  );
}

const styles = {
  page: { direction: "ltr", textAlign: "left" },
  intro: { color: "#667085", lineHeight: 1.8, margin: "0 0 20px", maxWidth: "820px" },
  infoCard: {
    display: "flex", gap: "12px", alignItems: "flex-start", padding: "16px 18px",
    marginBottom: "22px", border: "1px solid #dddff7", borderRadius: "16px",
    background: "linear-gradient(135deg, #eef2ff 0%, #faf5ff 100%)",
  },
  infoIcon: { color: "#4f46e5", fontSize: "18px", lineHeight: 1.4 },
  infoTitle: { display: "block", color: "#1f2937", marginBottom: "3px" },
  infoText: { margin: 0, color: "#667085", lineHeight: 1.65, fontSize: "14px" },
  formCard: {
    backgroundColor: "#fff", borderRadius: "22px", border: "1px solid #e4e7ec",
    padding: "26px", boxShadow: "0 12px 34px rgba(15, 23, 42, 0.06)", marginBottom: "24px",
  },
  fieldGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" },
  field: { marginBottom: "18px" },
  label: { display: "block", marginBottom: "8px", color: "#1f2937", fontWeight: 700, fontSize: "14px" },
  control: {
    width: "100%", padding: "13px 14px", borderRadius: "12px", border: "1px solid #d0d5dd",
    backgroundColor: "#f9fafb", color: "#111827", boxSizing: "border-box", fontSize: "14px",
  },
  textarea: {
    width: "100%", minHeight: "150px", resize: "vertical", padding: "14px", borderRadius: "12px",
    border: "1px solid #d0d5dd", backgroundColor: "#f9fafb", color: "#111827",
    boxSizing: "border-box", fontSize: "14px", lineHeight: 1.7, fontFamily: "inherit",
  },
  fieldHint: { margin: "7px 0 0", color: "#667085", fontSize: "13px", lineHeight: 1.6 },
  error: {
    margin: "0 0 16px", padding: "12px 14px", border: "1px solid #fecdca",
    borderRadius: "12px", backgroundColor: "#fef3f2", color: "#b42318", lineHeight: 1.6,
  },
  actions: { display: "flex", gap: "10px", flexWrap: "wrap" },
  primaryButton: {
    padding: "11px 17px", borderRadius: "12px", border: "none", backgroundColor: "#111827",
    color: "#fff", cursor: "pointer", fontWeight: 800,
  },
  secondaryButton: {
    padding: "11px 17px", borderRadius: "12px", border: "1px solid #d0d5dd",
    backgroundColor: "#fff", color: "#344054", cursor: "pointer", fontWeight: 700,
  },
  outputCard: {
    backgroundColor: "#fff", borderRadius: "22px", border: "1px solid #e4e7ec",
    padding: "26px", boxShadow: "0 12px 34px rgba(15, 23, 42, 0.06)",
  },
  outputHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    gap: "16px", flexWrap: "wrap", marginBottom: "18px",
  },
  eyebrow: { margin: "0 0 6px", color: "#6366f1", fontWeight: 800, fontSize: "11px", letterSpacing: "0.1em" },
  outputTitle: { margin: 0, color: "#111827", fontSize: "24px" },
  copyButton: {
    padding: "10px 15px", borderRadius: "12px", border: "none", backgroundColor: "#4f46e5",
    color: "#fff", cursor: "pointer", fontWeight: 800,
  },
  output: {
    margin: 0, padding: "20px", borderRadius: "14px", overflowX: "auto", whiteSpace: "pre-wrap",
    overflowWrap: "anywhere", backgroundColor: "#0f172a", color: "#e5e7eb",
    fontSize: "13px", lineHeight: 1.75, direction: "ltr", textAlign: "left",
  },
};

import { useState } from "react";
import Layout from "../../components/Layout";
import { createToolHandoff } from "../../lib/tool-handoff";
import { useLanguage } from "../../components/LanguageProvider";

const COPY = {
  en: { title: "Prompt Assistant", description: "Create clear, structured instructions for research, analysis, and writing tasks.", intro: "Build an editable prompt from your task, topic, audience, and preferred writing style.", task: "Task type", topic: "Topic", topicPlaceholder: "Example: Sentiment patterns in customer reviews", audience: "Target audience", audiencePlaceholder: "Example: Undergraduate researchers", style: "Writing style", generate: "Generate prompt with GPT-5.6", generating: "Generating with GPT-5.6…", clear: "Clear", output: "GENERATED OUTPUT", yours: "Your prompt", copied: "Copied", copy: "Copy prompt", continue: "Continue to Code Generator →", guide: "HOW TO USE THIS TOOL", guideTitle: "Create a stronger starting prompt.", guideText: "Choose a task, describe the topic and audience, then generate a reusable prompt for analysis, explanation, summarization, academic writing, or learning activities.", tasks: ["Text analysis", "Summarization", "Simplified explanation", "Academic writing", "Data classification", "Learning activity design"], styles: ["Academic", "Simple", "Formal", "Creative"] },
  ar: { title: "مساعد التعليمات", description: "أنشئ تعليمات واضحة ومنظمة لمهام البحث والتحليل والكتابة.", intro: "أنشئ تعليمات قابلة للمراجعة انطلاقًا من المهمة والموضوع والجمهور وأسلوب الكتابة.", task: "نوع المهمة", topic: "الموضوع", topicPlaceholder: "مثال: أنماط المشاعر في مراجعات العملاء", audience: "الجمهور المستهدف", audiencePlaceholder: "مثال: باحثون في المرحلة الجامعية", style: "أسلوب الكتابة", generate: "أنشئ التعليمات باستخدام GPT-5.6", generating: "جارٍ إنشاء التعليمات باستخدام GPT-5.6…", clear: "مسح", output: "الناتج المنشأ", yours: "تعليماتك", copied: "تم النسخ", copy: "نسخ التعليمات", continue: "المتابعة إلى مولّد الشفرة ←", guide: "طريقة استخدام الأداة", guideTitle: "أنشئ نقطة بداية أكثر وضوحًا.", guideText: "اختر المهمة، وحدد الموضوع والجمهور، ثم أنشئ تعليمات قابلة لإعادة الاستخدام في التحليل أو الشرح أو التلخيص أو الكتابة الأكاديمية أو أنشطة التعلم.", tasks: ["تحليل النص", "التلخيص", "شرح مبسط", "الكتابة الأكاديمية", "تصنيف البيانات", "تصميم نشاط تعليمي"], styles: ["أكاديمي", "مبسّط", "رسمي", "إبداعي"] },
};

const TASK_VALUES = ["Text analysis", "Summarization", "Simplified explanation", "Academic writing", "Data classification", "Learning activity design"];
const STYLE_VALUES = ["Academic", "Simple", "Formal", "Creative"];

export default function PromptTool() {
  const { language, direction } = useLanguage();
  const copy = COPY[language];
  const [taskType, setTaskType] = useState("Text analysis");
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [style, setStyle] = useState("Academic");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generatePrompt = async () => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 65000);

    setLoading(true);
    setError("");
    setGeneratedPrompt("");
    setCopied(false);

    try {
      const response = await fetch("/api/prompt-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskType, topic, audience, style }),
        signal: controller.signal,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Prompt generation failed.");
      }

      if (!data?.result) {
        throw new Error("GPT-5.6 did not return a usable prompt.");
      }

      setGeneratedPrompt(data.result);
    } catch (requestError) {
      setError(
        requestError?.name === "AbortError"
          ? "Prompt generation timed out. Please try again."
          : requestError?.message || "Prompt generation failed. Please try again."
      );
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  };

  const clearAll = () => {
    setTaskType("Text analysis");
    setTopic("");
    setAudience("");
    setStyle("Academic");
    setGeneratedPrompt("");
    setCopied(false);
    setError("");
  };

  const copyPrompt = async () => {
    if (!generatedPrompt) return;

    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error("Failed to copy prompt:", error);
    }
  };

  return (
    <Layout title={copy.title} description={copy.description}>
      <div style={{ direction }}>
        <p style={styles.intro}>
          {copy.intro}
        </p>

        <div style={styles.formCard}>
          <div style={styles.field}>
            <label style={styles.label}>{copy.task}</label>
            <select
              value={taskType}
              onChange={(event) => setTaskType(event.target.value)}
              style={styles.control}
            >
              {TASK_VALUES.map((value, index) => <option key={value} value={value}>{copy.tasks[index]}</option>)}
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>{copy.topic}</label>
            <input
              type="text"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder={copy.topicPlaceholder}
              style={styles.control}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>{copy.audience}</label>
            <input
              type="text"
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
              placeholder={copy.audiencePlaceholder}
              style={styles.control}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>{copy.style}</label>
            <select
              value={style}
              onChange={(event) => setStyle(event.target.value)}
              style={styles.control}
            >
              {STYLE_VALUES.map((value, index) => <option key={value} value={value}>{copy.styles[index]}</option>)}
            </select>
          </div>

          <div style={styles.actions}>
            {error && (
              <p role="alert" style={styles.error}>
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={generatePrompt}
              style={{
                ...styles.primaryButton,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              disabled={loading}
            >
              {loading ? copy.generating : copy.generate}
            </button>

            <button
              type="button"
              onClick={clearAll}
              style={styles.secondaryButton}
              disabled={loading}
            >
              {copy.clear}
            </button>
          </div>
        </div>

        {generatedPrompt && (
          <div style={styles.outputCard}>
            <div style={styles.outputHeader}>
              <div>
                <p style={styles.miniLabel}>{copy.output}</p>
                <h3 style={styles.outputTitle}>{copy.yours}</h3>
              </div>

              <button
                type="button"
                onClick={copyPrompt}
                style={styles.copyButton}
              >
                {copied ? copy.copied : copy.copy}
              </button>
            </div>

            <div style={styles.promptBox}>{generatedPrompt}</div>
            <button type="button" style={styles.secondaryButton} onClick={() => {
              try {
                window.location.href = createToolHandoff("prompt", "code", { prompt: generatedPrompt });
              } catch (transferError) { setError(transferError.message); }
            }}>{copy.continue}</button>
          </div>
        )}

        <div style={styles.guideCard}>
          <p style={styles.miniLabel}>{copy.guide}</p>
          <h3 style={styles.guideTitle}>{copy.guideTitle}</h3>
          <p style={styles.guideText}>
            {copy.guideText}
          </p>
        </div>
      </div>
    </Layout>
  );
}

const styles = {
  intro: {
    color: "#667085",
    lineHeight: "1.8",
    marginBottom: "24px",
    maxWidth: "760px",
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: "22px",
    border: "1px solid #e4e7ec",
    boxShadow: "0 12px 34px rgba(15, 23, 42, 0.06)",
    padding: "26px",
    marginBottom: "24px",
  },
  field: {
    marginBottom: "18px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "700",
    color: "#1f2937",
    fontSize: "14px",
  },
  control: {
    width: "100%",
    padding: "13px 14px",
    borderRadius: "12px",
    border: "1px solid #d0d5dd",
    backgroundColor: "#f9fafb",
    color: "#111827",
    boxSizing: "border-box",
    fontSize: "14px",
    outline: "none",
  },
  actions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "6px",
  },
  error: {
    flexBasis: "100%",
    margin: "0 0 4px",
    color: "#b42318",
    lineHeight: "1.6",
    fontSize: "14px",
  },
  primaryButton: {
    padding: "11px 17px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#111827",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "800",
  },
  secondaryButton: {
    padding: "11px 17px",
    borderRadius: "12px",
    border: "1px solid #d0d5dd",
    backgroundColor: "#ffffff",
    color: "#344054",
    cursor: "pointer",
    fontWeight: "700",
  },
  outputCard: {
    backgroundColor: "#ffffff",
    borderRadius: "22px",
    border: "1px solid #e4e7ec",
    boxShadow: "0 12px 34px rgba(15, 23, 42, 0.06)",
    padding: "26px",
    marginBottom: "24px",
  },
  outputHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "18px",
    flexWrap: "wrap",
    marginBottom: "18px",
  },
  miniLabel: {
    margin: "0 0 7px",
    color: "#6366f1",
    fontSize: "11px",
    letterSpacing: "0.1em",
    fontWeight: "800",
  },
  outputTitle: {
    margin: 0,
    color: "#111827",
    fontSize: "24px",
  },
  promptBox: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e4e7ec",
    borderRadius: "14px",
    padding: "18px",
    whiteSpace: "pre-wrap",
    lineHeight: "1.8",
    color: "#344054",
    fontSize: "14px",
  },
  copyButton: {
    padding: "10px 15px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "800",
  },
  guideCard: {
    marginTop: "26px",
    background:
      "linear-gradient(135deg, rgba(238,242,255,1) 0%, rgba(250,245,255,1) 100%)",
    border: "1px solid #dddff7",
    borderRadius: "20px",
    padding: "22px",
  },
  guideTitle: {
    margin: "0 0 10px",
    color: "#111827",
    fontSize: "21px",
  },
  guideText: {
    color: "#667085",
    lineHeight: "1.8",
    margin: 0,
  },
};

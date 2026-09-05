import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import { createToolHandoff, readToolHandoff, codeTask } from "../../lib/tool-handoff";
import { useLanguage } from "../../components/LanguageProvider";

const COPY = {
  en: { title: "AI Code Assistant", description: "Generate and review code for research, data preparation, and reproducible workflows.", intro: "Generate research-ready code for corpus analysis, data preparation, and reproducible experiments—with implementation guidance from GPT-5.6.", infoTitle: "Research-oriented generation", infoText: "Describe the method, expected input, and desired output. Never include API keys, participant identifiers, or sensitive raw data.", programming: "Programming language", experience: "Experience level", task: "Research coding task", placeholder: "Example: Build a Python script that compares word frequencies across two text corpora and exports a reproducible CSV summary.", hint: "Include your research objective, input format, constraints, and expected output.", generate: "✦ Generate Research Code", generating: "Generating research code…", clear: "Clear", output: "GPT-5.6 RESEARCH OUTPUT", blueprint: "Implementation blueprint", copied: "Copied", copy: "Copy output", colab: "Continue to Google Colab →", required: "Describe the research or coding task before generating code.", failed: "Code generation failed. Please try again.", unavailable: "The model did not return a usable result.", timeout: "Code generation timed out. Shorten the task or split it into smaller steps, then try again.", copyFailed: "The result could not be copied. Select and copy it manually.", transfer: "The result could not be transferred. Please try again.", levels: ["Beginner", "Intermediate", "Advanced"] },
  ar: { title: "مساعد البرمجة بالذكاء الاصطناعي", description: "أنشئ الشفرة وراجعها لمهام البحث وإعداد البيانات ومسارات العمل القابلة لإعادة الإنتاج.", intro: "أنشئ شفرة صالحة للبحث لتحليل المدونات وإعداد البيانات والتجارب القابلة لإعادة الإنتاج، مع إرشادات تنفيذية من GPT-5.6.", infoTitle: "إنشاء موجّه للبحث", infoText: "صف المنهج والمدخلات المتوقعة والمخرجات المطلوبة. لا تُدخل مفاتيح API أو معرّفات المشاركين أو البيانات الخام الحساسة.", programming: "لغة البرمجة", experience: "مستوى الخبرة", task: "مهمة البرمجة البحثية", placeholder: "مثال: أنشئ برنامج Python يقارن تكرار الكلمات بين مدونتين نصيتين ويصدر ملخصًا قابلًا لإعادة الإنتاج بصيغة CSV.", hint: "أدخل هدف البحث وصيغة المدخلات والقيود والمخرجات المتوقعة.", generate: "✦ إنشاء الشفرة البحثية", generating: "جارٍ إنشاء الشفرة البحثية…", clear: "مسح", output: "ناتج GPT-5.6 البحثي", blueprint: "مخطط التنفيذ", copied: "تم النسخ", copy: "نسخ الناتج", colab: "المتابعة إلى Google Colab ←", required: "أدخل مهمة البحث أو البرمجة قبل إنشاء الشفرة.", failed: "تعذر إنشاء الشفرة. حاول مرة أخرى.", unavailable: "لم يُرجع النموذج نتيجة قابلة للاستخدام.", timeout: "انتهت مهلة إنشاء الشفرة. اختصر المهمة أو قسّمها إلى خطوات أصغر ثم حاول مرة أخرى.", copyFailed: "تعذر نسخ الناتج. حدده وانسخه يدويًا.", transfer: "تعذر نقل الناتج. حاول مرة أخرى.", levels: ["مبتدئ", "متوسط", "متقدم"] },
};
const LEVEL_VALUES = ["Beginner", "Intermediate", "Advanced"];

export default function CodeTool() {
  const { language: uiLanguage, direction } = useLanguage();
  const copy = COPY[uiLanguage];
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
      setError(copy.required);
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
        throw new Error(uiLanguage === "ar" ? copy.failed : data?.error || copy.failed);
      }

      if (!data?.result) {
        throw new Error(copy.unavailable);
      }

      setGeneratedCode(data.result);
      setGeneratedLanguage(language);
    } catch (requestError) {
      setError(
        requestError?.name === "AbortError"
          ? copy.timeout
          : requestError?.message || copy.failed
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
      setError(copy.copyFailed);
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
    <Layout title={copy.title} description={copy.description} backHref="/ar-tools#build-tools" backLabel={uiLanguage === "ar" ? "العودة إلى البناء" : "Back to Build"}>
      <div style={{ ...styles.page, direction, textAlign: "start" }}>
        <p style={styles.intro}>
          {copy.intro}
        </p>

        <div style={styles.infoCard}>
          <span aria-hidden="true" style={styles.infoIcon}>✦</span>
          <div>
            <strong style={styles.infoTitle}>{copy.infoTitle}</strong>
            <p style={styles.infoText}>
              {copy.infoText}
            </p>
          </div>
        </div>

        <div style={styles.formCard}>
          <div style={styles.fieldGrid}>
            <div style={styles.field}>
              <label htmlFor="code-language" style={styles.label}>{copy.programming}</label>
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
              <label htmlFor="experience-level" style={styles.label}>{copy.experience}</label>
              <select
                id="experience-level"
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                style={styles.control}
                disabled={loading}
              >
                {LEVEL_VALUES.map((value, index) => <option key={value} value={value}>{copy.levels[index]}</option>)}
              </select>
            </div>
          </div>

          <div style={styles.field}>
            <label htmlFor="research-code-task" style={styles.label}>{copy.task}</label>
            <textarea
              id="research-code-task"
              value={task}
              onChange={(event) => setTask(event.target.value)}
              placeholder={copy.placeholder}
              style={styles.textarea}
              maxLength={6000}
              disabled={loading}
            />
            <p style={styles.fieldHint}>
              {copy.hint}
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

        {generatedCode && (
          <div style={styles.outputCard}>
            <div style={styles.outputHeader}>
              <div>
                <p style={styles.eyebrow}>{copy.output}</p>
                <h2 style={styles.outputTitle}>{copy.blueprint}</h2>
              </div>
              <button type="button" onClick={copyCode} style={styles.copyButton}>
                {copied ? copy.copied : copy.copy}
              </button>
            </div>
            <pre style={styles.output}>{generatedCode}</pre>
            <button type="button" style={styles.secondaryButton} onClick={() => {
              try {
                window.location.href = createToolHandoff("code", "colab", { response: generatedCode, language: generatedLanguage });
              } catch { setError(copy.transfer); }
            }}>{copy.colab}</button>
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

import { useState } from "react";

export default function Analyzer() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);

  const analyzeText = () => {
    const words = text.trim().split(/\s+/);
    const sentences = text.split(/[.!؟]/);

    const wordCount = words.filter(w => w).length;
    const sentenceCount = sentences.filter(s => s.trim()).length;

    // حساب تكرار الكلمات
    const freq = {};
    words.forEach(word => {
      const clean = word.toLowerCase();
      if (clean) {
        freq[clean] = (freq[clean] || 0) + 1;
      }
    });

    // ترتيب الكلمات
    const sorted = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    setResult({
      wordCount,
      sentenceCount,
      topWords: sorted
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px",
        background: "#f7f8fc",
        direction: "rtl"
      }}
    >
      <h1>تحليل النصوص</h1>

      <textarea
        placeholder="اكتبي النص هنا..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{
          width: "100%",
          height: "150px",
          padding: "10px",
          borderRadius: "8px",
          marginBottom: "15px"
        }}
      />

      <button onClick={analyzeText}>
        تحليل
      </button>

      {result && (
        <div style={{ marginTop: "20px", background: "#fff", padding: "15px", borderRadius: "10px" }}>
          <p>عدد الكلمات: {result.wordCount}</p>
          <p>عدد الجمل: {result.sentenceCount}</p>

          <h3>أكثر الكلمات تكرارًا:</h3>
          <ul>
            {result.topWords.map(([word, count], i) => (
              <li key={i}>
                {word} - {count}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
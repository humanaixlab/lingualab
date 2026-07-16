import { useState } from "react";

export default function Frequency() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");

  const analyze = () => {
    const words = text.split(" ");
    const freq = {};

    words.forEach((word) => {
      freq[word] = (freq[word] || 0) + 1;
    });

    setResult(JSON.stringify(freq, null, 2));
  };

  return (
    <div style={{ padding: 40, direction: "rtl" }}>
      <h1>تحليل التكرار</h1>

      <textarea
        rows={6}
        placeholder="اكتبي النص هنا..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <button onClick={analyze}>تحليل</button>

      <pre>{result}</pre>
    </div>
  );
}
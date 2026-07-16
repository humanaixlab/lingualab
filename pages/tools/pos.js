import { useState } from "react";

export default function POS() {
  const [text, setText] = useState("");

  return (
    <div style={{ padding: 40, direction: "rtl" }}>
      <h1>تحليل POS (تجريبي)</h1>

      <textarea
        rows={6}
        placeholder="اكتبي النص هنا..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <p>هذه نسخة تجريبية لعرض الفكرة.</p>
    </div>
  );
}
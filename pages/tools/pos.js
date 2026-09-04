import { useState } from "react";
import Link from "next/link";

export default function POS() {
  const [text, setText] = useState("");

  return (
    <div style={{ padding: 40, direction: "rtl" }}>
      <Link href="/tools/analyze">← الرجوع إلى جميع الأدوات</Link>
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

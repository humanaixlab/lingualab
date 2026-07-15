import Link from "next/link";

export default function ArabicToolsPage() {
  const tools = [
    { title: "تحليل النص", link: "/tools/analyze" },
    { title: "توليد الأكواد", link: "/tools/code" },
    { title: "Google Colab", link: "/tools/colab" },
    { title: "Concordance", link: "/tools/concordance" },
    { title: "Excel", link: "/tools/excel" },
    { title: "التكرار", link: "/tools/frequency" },
    { title: "N-grams", link: "/tools/ngrams" },
    { title: "تحليل POS", link: "/tools/pos" },
    { title: "Prompt Helper", link: "/tools/prompt" },
  ];

  return (
    <div style={{ padding: "40px", direction: "rtl" }}>
      <h1 style={{ textAlign: "center" }}>
        الأدوات اللغوية لتحليل النصوص
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        {tools.map((tool, i) => (
          <Link key={i} href={tool.link}>
            <div
              style={{
                padding: "20px",
                border: "1px solid #ddd",
                borderRadius: "12px",
                textAlign: "center",
                cursor: "pointer",
                background: "#fff",
              }}
            >
              <h3>{tool.title}</h3>
              <p>فتح الأداة</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
import Link from "next/link";

export default function Projects() {
  return (
    <div
      style={{
        fontFamily: "Arial",
        direction: "rtl",
        background: "#f7f8fc",
        minHeight: "100vh"
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "16px 30px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <h2 style={{ margin: 0 }}>LinguaLab</h2>

        <div style={{ display: "flex", gap: "15px" }}>
          <Link href="/">الرئيسية</Link>
          <Link href="/student-dashboard">لوحة الطالبة</Link>
          <Link href="/projects">المشاريع</Link>
        </div>
      </div>

      <div style={{ padding: "40px", maxWidth: "700px", margin: "0 auto" }}>
        <h1>رفع مشروع</h1>
        <p style={{ color: "#555", marginBottom: "25px" }}>
          ارفعي مشروعك بصيغة PDF أو ZIP مع تأكيد الأصالة واحترام الملكية الفكرية.
        </p>

        <div
          style={{
            background: "#fff",
            padding: "24px",
            borderRadius: "16px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
          }}
        >
          <label style={{ display: "block", marginBottom: "8px" }}>
            عنوان المشروع
          </label>
          <input
            type="text"
            placeholder="مثال: مشروع تحليل نص عربي"
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "16px",
              borderRadius: "10px",
              border: "1px solid #ddd"
            }}
          />

          <label style={{ display: "block", marginBottom: "8px" }}>
            رفع الملف
          </label>
          <input
            type="file"
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "16px",
              borderRadius: "10px",
              border: "1px solid #ddd",
              background: "#fff"
            }}
          />

          <label style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <input type="checkbox" />
            <span>
              أتعهد بأن هذا العمل أصيل وأحترم حقوق الملكية الفكرية.
            </span>
          </label>

          <button
            style={{
              padding: "12px 20px",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer"
            }}
          >
            رفع المشروع
          </button>
        </div>
      </div>
    </div>
  );
}
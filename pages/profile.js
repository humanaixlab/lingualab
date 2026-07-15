import Link from "next/link";

export default function Profile() {
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
          <Link href="/profile">الملف الشخصي</Link>
        </div>
      </div>

      <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
        <h1>👤 الملف الشخصي</h1>

        <div
          style={{
            background: "#fff",
            padding: "24px",
            borderRadius: "16px",
            marginTop: "20px"
          }}
        >
          <p><strong>الاسم:</strong> طالبة LinguaLab</p>
          <p><strong>البريد:</strong> student@example.com</p>
          <p><strong>المستوى:</strong> مبتدئ</p>

          <button
            style={{
              marginTop: "20px",
              padding: "10px 18px",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer"
            }}
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    </div>
  );
}
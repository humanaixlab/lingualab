export default function ColabPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px",
        background: "#f7f8fc",
        direction: "rtl",
        fontFamily: "Arial"
      }}
    >
      <h1>Google Colab Workspace</h1>

      <p style={{ color: "#555", marginBottom: "30px" }}>
        بيئة جاهزة لتجربة الأكواد بدون تثبيت أي شيء على جهازك
      </p>

      <div
        style={{
          background: "#fff",
          padding: "25px",
          borderRadius: "16px",
          marginBottom: "20px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
        }}
      >
        <h3>ما هو Google Colab؟</h3>
        <p>
          منصة من Google تسمح لك بتشغيل أكواد Python مباشرة من المتصفح
          بدون الحاجة لتثبيت أي برامج.
        </p>
      </div>

      <div
        style={{
          background: "#fff",
          padding: "25px",
          borderRadius: "16px",
          marginBottom: "20px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
        }}
      >
        <h3>متى أستخدمه؟</h3>
        <ul>
          <li>تشغيل الأكواد التي تم توليدها</li>
          <li>تحليل النصوص الكبيرة</li>
          <li>تجربة مشاريع الذكاء الاصطناعي</li>
        </ul>
      </div>

      <div
        style={{
          background: "#fff",
          padding: "25px",
          borderRadius: "16px",
          marginBottom: "20px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
        }}
      >
        <h3>ابدئي الآن</h3>

        <button
          onClick={() =>
            window.open("https://colab.research.google.com/", "_blank")
          }
          style={{
            padding: "12px 20px",
            borderRadius: "10px",
            cursor: "pointer"
          }}
        >
          فتح Google Colab
        </button>
      </div>

      <div
        style={{
          background: "#fff",
          padding: "25px",
          borderRadius: "16px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
        }}
      >
        <h3>اقتراحات جاهزة</h3>

        <ul>
          <li>جربي كود تقسيم النص إلى كلمات</li>
          <li>جربي تحليل تكرار الكلمات</li>
          <li>جربي قراءة ملف CSV</li>
        </ul>
      </div>
    </div>
  );
}
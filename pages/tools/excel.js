import { useState } from "react";
import Layout from "../../components/Layout";

export default function ExcelTool() {
  const [excelFile, setExcelFile] = useState(null);

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setExcelFile(file);
    }
  };

  const handleDownload = () => {
    if (!excelFile) return;
    const url = URL.createObjectURL(excelFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = excelFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = () => {
    setExcelFile(null);
  };

  const handleEdit = () => {
    alert("يمكن لاحقًا ربط زر التعديل بصفحة عرض وتحرير بيانات Excel.");
  };

  return (
    <Layout title="أداة Excel">
      <p style={{ color: "#4b5563", lineHeight: "1.8", marginBottom: "20px" }}>
        تتيح لك هذه الصفحة رفع ملف Excel ثم تنزيله أو حذفه أو الانتقال لاحقًا إلى
        صفحة تعديل مخصصة.
      </p>

      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "18px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
          padding: "22px",
          marginBottom: "22px",
        }}
      >
        <h3 style={{ marginTop: 0, color: "#111827" }}>رفع ملف Excel</h3>

        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleUpload}
          style={{ marginTop: "10px" }}
        />
      </div>

      {excelFile ? (
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "18px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
            padding: "22px",
          }}
        >
          <h3 style={{ marginTop: 0, color: "#111827" }}>الملف المرفوع</h3>

          <div
            style={{
              backgroundColor: "#f8fafc",
              border: "1px solid #e5e7eb",
              borderRadius: "14px",
              padding: "14px",
              marginBottom: "16px",
              color: "#374151",
            }}
          >
            {excelFile.name}
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={handleDownload}
              style={{
                padding: "10px 16px",
                borderRadius: "12px",
                border: "none",
                backgroundColor: "#10b981",
                color: "#fff",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              تنزيل
            </button>

            <button
              onClick={handleEdit}
              style={{
                padding: "10px 16px",
                borderRadius: "12px",
                border: "none",
                backgroundColor: "#3b82f6",
                color: "#fff",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              تعديل
            </button>

            <button
              onClick={handleDelete}
              style={{
                padding: "10px 16px",
                borderRadius: "12px",
                border: "none",
                backgroundColor: "#ef4444",
                color: "#fff",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              حذف
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "#f9fafb",
            border: "1px dashed #cbd5e1",
            borderRadius: "16px",
            padding: "18px",
            color: "#6b7280",
          }}
        >
          لم يتم رفع أي ملف Excel بعد.
        </div>
      )}

      <div
        style={{
          marginTop: "28px",
          backgroundColor: "#f8fafc",
          border: "1px solid #e5e7eb",
          borderRadius: "14px",
          padding: "18px",
        }}
      >
        <h3 style={{ marginBottom: "10px" }}>ماذا يمكن تطويره لاحقًا؟</h3>
        <p style={{ color: "#4b5563", lineHeight: "1.8", margin: 0 }}>
          يمكن في الخطوة التالية ربط هذه الصفحة بعرض بيانات الملف داخل جدول،
          وإتاحة تعديل بعض الخلايا أو الانتقال إلى صفحة تحليل بيانات.
        </p>
      </div>
    </Layout>
  );
}
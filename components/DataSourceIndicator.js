import React from "react";

export default function DataSourceIndicator({ language, mode = "standalone" }) {
  const copy = language === "ar" ? {
    project: "مصدر البيانات: مشروعك الحالي",
    projectContext: "مصدر البيانات: سياق مشروعك الحالي (بيانات وصفية فقط)",
    transferred: "مصدر البيانات: نتائج الأداة السابقة",
    report: "مصدر البيانات: نتائج التقرير الحالية",
    standalone: "مصدر البيانات: إدخال مستقل — لن يغيّر بيانات المشروع الحالية",
  } : {
    project: "Data source: Current project",
    projectContext: "Data source: Current project context (metadata only)",
    transferred: "Data source: Previous tool results",
    report: "Data source: Current report results",
    standalone: "Data source: Standalone input — current project data will not be changed",
  };
  return React.createElement(
    "p",
    {
      role: "status",
      style: {
        display: "inline-flex",
        margin: "0 0 18px",
        padding: "7px 11px",
        borderRadius: "999px",
        background: "rgba(99, 102, 241, 0.12)",
        color: "inherit",
        fontSize: "var(--text-meta)",
        lineHeight: 1.6,
      },
    },
    copy[mode] || copy.standalone,
  );
}

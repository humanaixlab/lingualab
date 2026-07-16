import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const initialTasks = [
  {
    id: "text-analysis",
    title: "تحليل نص",
    description: "البدء في تحليل نص داخل أدوات المنصة.",
    href: "/tools/analyze",
    completed: false,
  },
  {
    id: "project-upload",
    title: "رفع مشروع",
    description: "رفع أو متابعة مشروع الطالبة داخل المنصة.",
    href: "/projects",
    completed: false,
  },
  {
    id: "excel-task",
    title: "Excel",
    description: "استخدام أداة Excel في المهام اللغوية والتحليلية.",
    href: "/tools/excel",
    completed: false,
  },
  {
    id: "prompt-task",
    title: "نشاط الأوامر",
    description: "التدرّب على كتابة الأوامر الذكية وصياغة الطلبات بوضوح.",
    href: "/tools/prompt",
    completed: false,
  },
  {
    id: "code-task",
    title: "تنفيذ الأكواد",
    description: "تجربة كتابة الأكواد أو تشغيلها داخل بيئة الأدوات البرمجية.",
    href: "/tools/code",
    completed: false,
  },
];

export default function StudentDashboardPage() {
  const [tasks, setTasks] = useState(initialTasks);

  useEffect(() => {
    const saved = localStorage.getItem("lingualab-student-tasks");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Restore persisted progress after the client mounts.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTasks(parsed);
      } catch (error) {
        console.error("Failed to load student tasks:", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("lingualab-student-tasks", JSON.stringify(tasks));
  }, [tasks]);

  const progress = useMemo(() => {
    if (!tasks.length) return 0;
    const completedCount = tasks.filter((task) => task.completed).length;
    return Math.round((completedCount / tasks.length) * 100);
  }, [tasks]);

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const resetProgress = () => {
    const resetTasks = tasks.map((task) => ({
      ...task,
      completed: false,
    }));
    setTasks(resetTasks);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #eef4ff 0%, #f8fbff 55%, #f3f7ff 100%)",
        padding: "40px 20px",
        direction: "rtl",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <button
            style={{
              marginBottom: "24px",
              padding: "10px 18px",
              borderRadius: "999px",
              border: "1px solid #dbeafe",
              background: "#ffffff",
              color: "#334155",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
              boxShadow: "0 6px 18px rgba(15,23,42,0.05)",
            }}
          >
            ← الرجوع إلى الرئيسية
          </button>
        </Link>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "28px",
            padding: "32px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 12px 35px rgba(15,23,42,0.08)",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "8px 14px",
              borderRadius: "999px",
              background: "#fef3c7",
              border: "1px solid #fde68a",
              color: "#92400e",
              fontSize: "12px",
              marginBottom: "14px",
              fontWeight: "600",
            }}
          >
            Student Dashboard
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "38px",
              fontWeight: "800",
              color: "#0f172a",
            }}
          >
            لوحة الطالبة
          </h1>

          <p
            style={{
              marginTop: "14px",
              color: "#475569",
              fontSize: "15px",
              lineHeight: "1.9",
              maxWidth: "760px",
            }}
          >
            متابعة التقدم في المسارات والوصول السريع للأنشطة، مع ربط نسبة الإنجاز
            بالمهام التي تنجزها الطالبة داخل المنصة.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.6fr",
            gap: "20px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "24px",
              padding: "24px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
              alignSelf: "start",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: "18px",
                fontSize: "24px",
                color: "#0f172a",
              }}
            >
              التقدم
            </h2>

            <div
              style={{
                fontSize: "16px",
                color: "#475569",
                marginBottom: "10px",
              }}
            >
              نسبة الإنجاز:{" "}
              <strong style={{ color: "#0f172a" }}>{progress}%</strong>
            </div>

            <div
              style={{
                width: "100%",
                height: "16px",
                background: "#e2e8f0",
                borderRadius: "999px",
                overflow: "hidden",
                marginBottom: "18px",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background: "linear-gradient(135deg, #38bdf8, #6366f1)",
                  borderRadius: "999px",
                  transition: "width 0.3s ease",
                }}
              />
            </div>

            <div
              style={{
                color: "#64748b",
                fontSize: "14px",
                lineHeight: "1.9",
                marginBottom: "18px",
              }}
            >
              يتم حساب النسبة تلقائيًا بناءً على عدد الأنشطة التي تم تعليمها
              كمكتملة.
            </div>

            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "18px",
                padding: "16px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "#0f172a",
                  marginBottom: "10px",
                }}
              >
                الأنشطة المحتسبة في التقدم
              </div>

              <ul
                style={{
                  margin: 0,
                  paddingRight: "18px",
                  color: "#475569",
                  fontSize: "14px",
                  lineHeight: "2",
                }}
              >
                <li>تحليل نص</li>
                <li>رفع مشروع</li>
                <li>Excel</li>
                <li>نشاط الأوامر</li>
                <li>تنفيذ الأكواد</li>
              </ul>
            </div>

            <button
              onClick={resetProgress}
              style={{
                padding: "10px 16px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
                color: "#334155",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              إعادة ضبط التقدم
            </button>
          </div>

          <div
            style={{
              background: "#ffffff",
              borderRadius: "24px",
              padding: "24px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: "18px",
                fontSize: "24px",
                color: "#0f172a",
              }}
            >
              الأنشطة السريعة
            </h2>

            <div style={{ display: "grid", gap: "14px" }}>
              {tasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    background: "#f8fbff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "18px",
                    padding: "18px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "14px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "18px",
                          fontWeight: "700",
                          color: "#0f172a",
                          marginBottom: "6px",
                        }}
                      >
                        {task.title}
                      </div>

                      <div
                        style={{
                          color: "#475569",
                          fontSize: "14px",
                          lineHeight: "1.8",
                        }}
                      >
                        {task.description}
                      </div>
                    </div>

                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        color: "#334155",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                      />
                      تم الإنجاز
                    </label>
                  </div>

                  <div
                    style={{
                      marginTop: "14px",
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <Link href={task.href} style={{ textDecoration: "none" }}>
                      <button
                        style={{
                          padding: "10px 16px",
                          borderRadius: "12px",
                          border: "none",
                          background:
                            "linear-gradient(135deg, #38bdf8, #6366f1)",
                          color: "#fff",
                          cursor: "pointer",
                          fontWeight: "700",
                        }}
                      >
                        فتح النشاط
                      </button>
                    </Link>

                    <span
                      style={{
                        display: "inline-block",
                        padding: "10px 14px",
                        borderRadius: "12px",
                        background: task.completed ? "#dcfce7" : "#f1f5f9",
                        color: task.completed ? "#166534" : "#475569",
                        fontSize: "13px",
                        fontWeight: "700",
                        border: task.completed
                          ? "1px solid #bbf7d0"
                          : "1px solid #e2e8f0",
                      }}
                    >
                      {task.completed ? "مكتمل" : "قيد المتابعة"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
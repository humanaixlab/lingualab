export default function BlogsPage() {
  const blogs = [
    {
      title: "المدونة القرآنية",
      desc: "الدخول إلى المدونة القرآنية للاستفادة من التحليل الصرفي والنحوي والدلالي للنص القرآني.",
      link: "https://corpus.quran.com/",
      color: "#6366f1",
    },
    {
      title: "Sketch Engine",
      desc: "أداة متقدمة لبناء المدونات وتحليل التكرار والتوافقات والكلمات المفتاحية.",
      link: "https://www.sketchengine.eu/",
      color: "#22c55e",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "40px 20px",
        direction: "rtl",
        fontFamily: "Tahoma, Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div
          style={{
            background: "#fff",
            borderRadius: "28px",
            padding: "42px 28px",
            marginBottom: "30px",
            boxShadow: "0 10px 28px rgba(15, 23, 42, 0.06)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "inline-block",
              background: "#eef2ff",
              color: "#4f46e5",
              padding: "10px 18px",
              borderRadius: "999px",
              fontSize: "15px",
              marginBottom: "18px",
            }}
          >
            LinguaLab Blogs
          </div>

          <h1
            style={{
              margin: "0 0 12px",
              fontSize: "44px",
              color: "#0f172a",
              fontWeight: "800",
            }}
          >
            المدونة
          </h1>

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "20px",
              lineHeight: "1.9",
            }}
          >
            روابط مختارة لمدونات لغوية وأدوات خارجية مفيدة.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "22px",
          }}
        >
          {blogs.map((item, index) => (
            <a
              key={index}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: "20px",
                  padding: "22px",
                  boxShadow: "0 10px 28px rgba(15, 23, 42, 0.08)",
                  transition: "0.2s ease",
                  cursor: "pointer",
                  height: "100%",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  style={{
                    height: "150px",
                    borderRadius: "16px",
                    background: `linear-gradient(135deg, ${item.color}, #dbeafe)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "30px",
                    fontWeight: "700",
                    marginBottom: "18px",
                    textAlign: "center",
                    padding: "10px",
                  }}
                >
                  {item.title}
                </div>

                <p
                  style={{
                    color: "#64748b",
                    fontSize: "15px",
                    lineHeight: "1.9",
                    margin: 0,
                  }}
                >
                  {item.desc}
                </p>

                <div
                  style={{
                    marginTop: "16px",
                    color: item.color,
                    fontWeight: "700",
                    fontSize: "14px",
                  }}
                >
                  فتح الرابط ←
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
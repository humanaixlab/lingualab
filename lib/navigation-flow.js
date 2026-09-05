export const BUILD_HOME = "/ar-tools#build-tools";
export const RESEARCH_HOME = "/ar-tools";
export const ANALYZE_HOME = "/tools/analyze";
export const LEARN_HOME = "/student-dashboard";

export const TOOL_OWNERSHIP = Object.freeze({
  workspace: { home: "/workspace", role: "project", source: "project", next: [RESEARCH_HOME, ANALYZE_HOME, BUILD_HOME] },
  researchAdvisor: { home: RESEARCH_HOME, route: "/research-advisor", role: "research", source: "project-or-standalone", next: [ANALYZE_HOME] },
  researchCopilot: { home: RESEARCH_HOME, route: "/workspace?copilot=1", role: "research", source: "project", next: [ANALYZE_HOME] },
  frequency: { home: ANALYZE_HOME, route: "/tools/frequency", role: "analyze", source: "standalone", next: ["/tools/analyze", "/research-report"] },
  concordance: { home: ANALYZE_HOME, route: "/tools/concordance", role: "analyze", source: "standalone", next: ["/tools/analyze", "/research-report"] },
  ngrams: { home: ANALYZE_HOME, route: "/tools/ngrams", role: "analyze", source: "standalone", next: ["/tools/analyze", "/research-report"] },
  pos: { home: ANALYZE_HOME, route: "/tools/pos", role: "analyze", source: "standalone", next: ["/tools/analyze", "/research-report"] },
  interpreter: { home: ANALYZE_HOME, route: "/tools/analyze", role: "interpret", source: "project-or-standalone", next: ["/research-report"] },
  report: { home: RESEARCH_HOME, route: "/research-report", role: "report", source: "current-results", next: [] },
  prompt: { home: BUILD_HOME, route: "/tools/prompt", role: "build", source: "standalone", next: ["/tools/code"] },
  spreadsheet: { home: BUILD_HOME, route: "/tools/excel", role: "build", source: "standalone", next: ["/tools/code"] },
  code: { home: BUILD_HOME, route: "/tools/code", role: "build", source: "standalone", next: ["/tools/colab"] },
  colab: { home: BUILD_HOME, route: "/tools/colab", role: "build", source: "standalone", next: [] },
  learn: { home: LEARN_HOME, route: LEARN_HOME, role: "learn", source: "none", next: [] },
});

const REPORT_RETURN = {
  frequency: ["/tools/frequency", "previous"],
  concordance: ["/tools/concordance", "previous"],
  ngrams: ["/tools/ngrams", "previous"],
  pos: ["/tools/pos", "previous"],
  interpreter: [ANALYZE_HOME, "analyze"],
  advisor: ["/research-advisor", "previous"],
  copilot: ["/workspace", "workspace"],
};

export function reportReturnTarget(sourceTool, language = "en") {
  const [href, labelType] = REPORT_RETURN[sourceTool] || [ANALYZE_HOME, "analyze"];
  const labels = language === "ar"
    ? { previous: "العودة إلى الأداة السابقة", analyze: "العودة إلى مركز التحليل", workspace: "العودة إلى مساحة العمل" }
    : { previous: "Back to previous tool", analyze: "Back to Analyze", workspace: "Back to Workspace" };
  return { href, label: labels[labelType] };
}

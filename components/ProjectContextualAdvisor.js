import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/router";
import { useLanguage } from "./LanguageProvider";
import ContextualAdvisor from "./ContextualAdvisor";
import GuidedExecutionAdvisor from "./GuidedExecutionAdvisor";
import { PATH_GUIDANCE, PROJECT_CATALOG, buildProjectRoadmap } from "../lib/project-catalog";
import { APPLIED_PROJECT_BY_PROJECT_ID } from "../lib/applied-projects";

function localized(value, language) { return value?.[language] ?? value?.en ?? value ?? ""; }
const TABS = {
  ar: [["overview","نظرة عامة"],["data","البيانات"],["execution","التنفيذ"],["evaluation","التقييم والنتائج"],["prototype","Prototype"]],
  en: [["overview","Overview"],["data","Data"],["execution","Execution"],["evaluation","Evaluation & results"],["prototype","Prototype"]],
};
const LETTER_TAB = { A:"overview", B:"data", C:"overview", D:"execution", E:"evaluation", F:"evaluation", G:"prototype", H:"execution" };
function sectionTab(section) {
  if (section.id === "prototype-builder") return "prototype";
  const match = section.querySelector(":scope > h2")?.textContent?.trim().match(/^([A-H])\./);
  return match ? LETTER_TAB[match[1]] || "overview" : "overview";
}

export default function ProjectContextualAdvisor() {
  const router = useRouter();
  const { language } = useLanguage();
  const locale = language === "ar" ? "ar" : "en";
  const projectId = typeof router.query?.project === "string" ? router.query.project : "";
  const project = router.pathname === "/projects" ? PROJECT_CATALOG.find((item) => item.id === projectId) : null;
  const [mountNode,setMountNode] = useState(null);
  const [drawerRoot,setDrawerRoot] = useState(null);
  const [executionRoot,setExecutionRoot] = useState(null);
  const [drawerOpen,setDrawerOpen] = useState(false);
  const [activeTab,setActiveTab] = useState("overview");

  useEffect(() => {
    if (!project) { setMountNode(null); setDrawerRoot(null); setExecutionRoot(null); return undefined; }
    const detail = document.querySelector("main article");
    if (!detail) return undefined;
    const guidance = detail.children[1];
    const host = document.createElement("div"); host.setAttribute("data-project-workspace-nav",project.id);
    if (guidance) guidance.insertAdjacentElement("afterend",host); else detail.prepend(host);
    const portal = document.createElement("div"); portal.setAttribute("data-project-advisor-drawer",project.id); document.body.appendChild(portal);
    const sections = Array.from(detail.querySelectorAll(":scope > section"));
    sections.forEach((section) => section.setAttribute("data-project-tab",sectionTab(section)));

    const executionSection = sections.find((section) => section.getAttribute("data-project-tab") === "execution" && /^D\./.test(section.querySelector(":scope > h2")?.textContent?.trim() || ""));
    let executionHost = null; let originalRoadmap = null;
    if (executionSection) {
      originalRoadmap = executionSection.querySelector(":scope > ol");
      if (originalRoadmap) originalRoadmap.hidden = true;
      executionHost = document.createElement("div"); executionHost.setAttribute("data-guided-execution-advisor",project.id); executionSection.appendChild(executionHost);
    }
    setMountNode(host); setDrawerRoot(portal); setExecutionRoot(executionHost); setActiveTab("overview"); setDrawerOpen(false);
    return () => {
      sections.forEach((section) => { section.removeAttribute("data-project-tab"); section.hidden=false; });
      if (originalRoadmap) originalRoadmap.hidden=false;
      setMountNode(null); setDrawerRoot(null); setExecutionRoot(null); host.remove(); portal.remove(); executionHost?.remove();
    };
  },[project?.id]);

  useEffect(() => {
    if (!project) return;
    const detail=document.querySelector("main article");
    const sections=detail ? Array.from(detail.querySelectorAll(":scope > section[data-project-tab]")) : [];
    sections.forEach((section)=>{ section.hidden=section.getAttribute("data-project-tab")!==activeTab; });
  },[activeTab,project?.id]);

  useEffect(()=>{ if(!drawerOpen)return undefined; const onKeyDown=(event)=>{if(event.key==="Escape")setDrawerOpen(false);}; document.addEventListener("keydown",onKeyDown); return()=>document.removeEventListener("keydown",onKeyDown); },[drawerOpen]);
  if(!project||!mountNode||!drawerRoot)return null;

  const path=PATH_GUIDANCE[project.path]; const applied=APPLIED_PROJECT_BY_PROJECT_ID[project.id];
  const context={
    projectId:project.id,title:localized(project.title,locale),problem:localized(project.problem,locale),impact:localized(project.impact,locale),researchPath:localized(path?.name,locale),
    dataRequirements:localized(project.dataRequirements,locale),annotationRequired:Boolean(project.annotatorsRequired),annotationNotes:localized(project.annotationNotes,locale),
    executionSteps:Array.isArray(project.steps)?localized(project.steps,locale):[],evaluation:localized(project.evaluation,locale),expectedResults:localized(project.expectedResults,locale),
    applicationPotential:localized(project.applicationPotential,locale),possibleOutputs:project.possibleOutputs||[],availableLinguaLabTools:project.tools||[],
    externalSteps:Array.isArray(project.externalSteps)?project.externalSteps.map((item)=>localized(item,locale)):[],
    appliedContext:applied?{practicalNeed:locale==="ar"?applied.needAr:applied.needEn,languageProblem:localized(applied.languageProblem,locale),nlpTasks:applied.nlpTasks||[],possibleApplication:localized(applied.possibleApplication,locale),limitations:localized(applied.limitations,locale)}:null,
  };

  const nav=createPortal(<div className="projectWorkspaceNav" dir={locale==="ar"?"rtl":"ltr"}>
    <div className="projectTabs" role="tablist" aria-label={locale==="ar"?"أقسام تفاصيل المشروع":"Project detail sections"}>{TABS[locale].map(([id,label])=><button key={id} type="button" role="tab" aria-selected={activeTab===id} className={activeTab===id?"active":""} onClick={()=>setActiveTab(id)}>{label}</button>)}</div>
    <button type="button" className="advisorTrigger" aria-expanded={drawerOpen} onClick={()=>setDrawerOpen(true)}>{locale==="ar"?"✦ مستشار المشروع الذكي":"✦ Smart Project Advisor"}</button>
    <style jsx>{`.projectWorkspaceNav{display:flex;align-items:center;justify-content:space-between;gap:.8rem;flex-wrap:wrap;margin:1rem 0 1.4rem;padding:.7rem;border:1px solid var(--border-color,#d8dee8);border-radius:14px;background:var(--surface,#fff);position:sticky;top:.5rem;z-index:20}.projectTabs{display:flex;gap:.35rem;flex-wrap:wrap;min-width:0}.projectTabs button,.advisorTrigger{min-height:42px;border:1px solid var(--border-color,#d8dee8);border-radius:10px;padding:.55rem .8rem;background:transparent;color:inherit;font:inherit;cursor:pointer}.projectTabs button.active{background:var(--accent,#2447d8);border-color:var(--accent,#2447d8);color:#fff}.advisorTrigger{background:var(--surface-subtle,#f6f8fb);font-weight:700}button:focus-visible{outline:3px solid color-mix(in srgb,var(--accent,#2447d8) 35%,transparent);outline-offset:2px}@media(max-width:700px){.projectWorkspaceNav{position:static}.projectTabs{width:100%;overflow-x:auto;flex-wrap:nowrap;padding-bottom:.15rem}.projectTabs button{white-space:nowrap}.advisorTrigger{width:100%}}`}</style>
  </div>,mountNode);

  const drawer=createPortal(drawerOpen?<div className="advisorOverlay" dir={locale==="ar"?"rtl":"ltr"} onMouseDown={(event)=>{if(event.target===event.currentTarget)setDrawerOpen(false);}}><aside className="advisorDrawer" role="dialog" aria-modal="true" aria-label={locale==="ar"?"مستشار المشروع":"Project Advisor"}><header className="drawerHead"><strong>{locale==="ar"?"مستشار المشروع الذكي":"Smart Project Advisor"}</strong><button type="button" onClick={()=>setDrawerOpen(false)} aria-label={locale==="ar"?"إغلاق المستشار":"Close advisor"}>×</button></header><div className="drawerBody"><ContextualAdvisor language={locale} kind="project" context={context}/></div></aside><style jsx>{`.advisorOverlay{position:fixed;inset:0;z-index:1000;background:rgba(20,28,45,.28);display:flex;justify-content:flex-end}.advisorDrawer{width:min(560px,94vw);height:100%;background:var(--surface,#fff);box-shadow:0 0 30px rgba(20,28,45,.16);display:flex;flex-direction:column}[dir="rtl"].advisorOverlay{justify-content:flex-start}.drawerHead{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1rem 1.1rem;border-bottom:1px solid var(--border-color,#d8dee8)}.drawerHead button{width:42px;height:42px;border:1px solid var(--border-color,#d8dee8);border-radius:10px;background:transparent;font-size:1.6rem;cursor:pointer}.drawerBody{padding:0 1rem 1.5rem;overflow:auto;overscroll-behavior:contain}@media(prefers-reduced-motion:no-preference){.advisorDrawer{animation:drawerIn .18s ease-out}@keyframes drawerIn{from{opacity:.6;transform:translateX(18px)}to{opacity:1;transform:none}}[dir="rtl"] .advisorDrawer{animation-name:drawerInRtl}@keyframes drawerInRtl{from{opacity:.6;transform:translateX(-18px)}to{opacity:1;transform:none}}}`}</style></div>:null,drawerRoot);

  const guided=executionRoot?createPortal(<GuidedExecutionAdvisor language={locale} projectContext={context} roadmap={buildProjectRoadmap(project)}/>,executionRoot):null;
  return <>{nav}{drawer}{guided}</>;
}

import { useRouter } from "next/router";
import { useLanguage } from "./LanguageProvider";
import ContextualAdvisor from "./ContextualAdvisor";
import { PATH_GUIDANCE, PROJECT_CATALOG } from "../lib/project-catalog";
import { APPLIED_PROJECT_BY_PROJECT_ID } from "../lib/applied-projects";

function localized(value, language) {
  return value?.[language] ?? value?.en ?? value ?? "";
}

export default function ProjectContextualAdvisor() {
  const router = useRouter();
  const { language } = useLanguage();
  const locale = language === "ar" ? "ar" : "en";
  if (router.pathname !== "/projects") return null;
  const projectId = typeof router.query?.project === "string" ? router.query.project : "";
  const project = PROJECT_CATALOG.find((item) => item.id === projectId);
  if (!project) return null;

  const path = PATH_GUIDANCE[project.path];
  const applied = APPLIED_PROJECT_BY_PROJECT_ID[project.id];
  const context = {
    projectId: project.id,
    title: localized(project.title, locale),
    problem: localized(project.problem, locale),
    impact: localized(project.impact, locale),
    researchPath: localized(path?.name, locale),
    dataRequirements: localized(project.dataRequirements, locale),
    annotationRequired: Boolean(project.annotatorsRequired),
    annotationNotes: localized(project.annotationNotes, locale),
    executionSteps: Array.isArray(project.steps) ? localized(project.steps, locale) : [],
    evaluation: localized(project.evaluation, locale),
    expectedResults: localized(project.expectedResults, locale),
    applicationPotential: localized(project.applicationPotential, locale),
    possibleOutputs: project.possibleOutputs || [],
    availableLinguaLabTools: project.tools || [],
    externalSteps: Array.isArray(project.externalSteps) ? project.externalSteps.map((item) => localized(item, locale)) : [],
    appliedContext: applied ? {
      practicalNeed: locale === "ar" ? applied.needAr : applied.needEn,
      languageProblem: localized(applied.languageProblem, locale),
      nlpTasks: applied.nlpTasks || [],
      possibleApplication: localized(applied.possibleApplication, locale),
      limitations: localized(applied.limitations, locale),
    } : null,
  };

  return (
    <aside style={{ maxWidth: "1180px", margin: "0 auto 2rem", padding: "0 1rem" }} aria-label={locale === "ar" ? "مستشار المشروع" : "Project Advisor"}>
      <ContextualAdvisor language={locale} kind="project" context={context} />
    </aside>
  );
}

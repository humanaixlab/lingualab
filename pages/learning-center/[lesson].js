import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "../../components/LanguageProvider";
import { LessonMicroInteractions, ProgressiveWorkedExample } from "../../components/learning/LessonMicroInteractions";
import LearningContextualTutor from "../../components/learning/LearningContextualTutor";
import { LEARNING_LESSON_IDS, learningApplicationHref, learningLessonForId } from "../../lib/learning-lessons";
import styles from "../../styles/LearningLesson.module.css";

const copy = {
  en: { back:"Back to Learning Center", outcomes:"What you will learn", concept:"Concept", example:"Worked example", exercise:"Guided practice", check:"Understanding check", submit:"Check answer", choose:"Choose one answer before checking.", retry:"Review the explanation and try again.", application:"Application step", locked:"Complete the understanding check to open the optional production-tool application.", nextExampleStep:"Next example step" },
  ar: { back:"العودة إلى مركز التعلّم", outcomes:"ما الذي ستتعلّمه؟", concept:"المفهوم", example:"مثال محلول", exercise:"تطبيق موجّه", check:"تحقق من الفهم", submit:"تحقق من الإجابة", choose:"اختر إجابة واحدة قبل التحقق.", retry:"راجع الشرح ثم حاول مرة أخرى.", application:"مرحلة التطبيق", locked:"أكمل اختبار الفهم لفتح الانتقال الاختياري إلى الأداة الإنتاجية.", nextExampleStep:"الخطوة التالية في المثال" },
};

export default function LearningLessonPage({ lessonId }) {
  const { language } = useLanguage(); const locale = language === "ar" ? "ar" : "en"; const ui = copy[locale]; const lesson = learningLessonForId(lessonId);
  const [selectedAnswer, setSelectedAnswer] = useState(null); const [submitted, setSubmitted] = useState(false); const [tutorFocus, setTutorFocus] = useState({ type:"concept", index:0 });
  if (!lesson) return null;
  const text = (value) => value[locale]; const answeredCorrectly = submitted && selectedAnswer === lesson.check.correctIndex;
  const checkAnswer = (event) => { event.preventDefault(); if (selectedAnswer === null) return; setSubmitted(true); if (selectedAnswer !== lesson.check.correctIndex) return; try { const saved = JSON.parse(localStorage.getItem("lingualab-learning-progress") || "[]"); const current = Array.isArray(saved) ? saved : []; localStorage.setItem("lingualab-learning-progress", JSON.stringify(LEARNING_LESSON_IDS.map((id) => ({ id, completed: id === lesson.id || Boolean(current.find((item) => item.id === id)?.completed) })))); } catch {} };

  return <main className={styles.page}>
    <Head><title>{text(lesson.title)} | LinguaLab</title><meta name="description" content={text(lesson.overview)} /></Head>
    <div className={styles.container}>
      <nav className={styles.nav} aria-label={ui.back}><Link href="/learning-center" className={styles.backLink}>← {ui.back}</Link><span className={styles.brand}>LinguaLab</span></nav>
      <header className={styles.hero}><p className={styles.eyebrow}>{text(lesson.eyebrow)}</p><h1>{text(lesson.title)}</h1><p className={styles.lead}>{text(lesson.overview)}</p></header>
      <section className={styles.panel}><p className={styles.sectionLabel}>{ui.outcomes}</p><ul className={styles.outcomeList}>{lesson.outcomes.map((outcome) => <li key={outcome.en}>{text(outcome)}</li>)}</ul></section>

      <LearningContextualTutor lesson={lesson} locale={locale} focus={tutorFocus} onFocusChange={setTutorFocus} />

      <section className={styles.lessonSection}><p className={styles.sectionLabel}>{ui.concept}</p><div className={styles.conceptStream}>{lesson.concepts.map((concept, index) => <div className={styles.conceptUnit} key={concept.title.en}><article className={styles.conceptCard} onFocusCapture={() => setTutorFocus({ type:"concept", index })} onMouseEnter={() => setTutorFocus({ type:"concept", index })}><h2>{text(concept.title)}</h2><p>{text(concept.text)}</p></article><LessonMicroInteractions lessonId={lesson.id} locale={locale} afterConcept={index} /></div>)}</div></section>

      <section className={styles.twoColumn}>
        <article className={styles.learningCard} onFocusCapture={() => setTutorFocus({ type:"example", index:0 })} onMouseEnter={() => setTutorFocus({ type:"example", index:0 })}><p className={styles.sectionLabel}>{ui.example}</p><h2>{text(lesson.example.title)}</h2><ProgressiveWorkedExample example={lesson.example} locale={locale} label={ui.nextExampleStep} /></article>
        <article className={styles.learningCard} onFocusCapture={() => setTutorFocus({ type:"exercise", index:0 })} onMouseEnter={() => setTutorFocus({ type:"exercise", index:0 })}><p className={styles.sectionLabel}>{ui.exercise}</p><h2>{text(lesson.exercise.title)}</h2><p className={styles.sample}>{text(lesson.exercise.prompt)}</p><ol>{lesson.exercise.steps.map((step) => <li key={step.en}>{text(step)}</li>)}</ol></article>
      </section>

      <section className={styles.checkCard} onFocusCapture={() => setTutorFocus({ type:"check", index:0 })} onMouseEnter={() => setTutorFocus({ type:"check", index:0 })}><p className={styles.sectionLabel}>{ui.check}</p><h2>{text(lesson.check.question)}</h2><form onSubmit={checkAnswer}><fieldset className={styles.options}><legend className={styles.srOnly}>{text(lesson.check.question)}</legend>{lesson.check.options.map((option,index) => <label className={styles.option} key={option.en}><input type="radio" name="lesson-check" value={index} checked={selectedAnswer === index} onChange={() => { setSelectedAnswer(index); setSubmitted(false); setTutorFocus({ type:"check", index:0 }); }} /><span>{text(option)}</span></label>)}</fieldset><button className={styles.checkButton} type="submit">{ui.submit}</button></form>{submitted && <p className={answeredCorrectly ? styles.correct : styles.incorrect} role="status">{answeredCorrectly ? text(lesson.check.correct) : `${text(lesson.check.incorrect)} ${ui.retry}`}</p>}{!submitted && selectedAnswer === null && <p className={styles.hint}>{ui.choose}</p>}</section>

      <section className={styles.applicationCard}><div><p className={styles.sectionLabel}>{ui.application}</p><h2>{text(lesson.application.tool)}</h2><p>{text(lesson.application.description)}</p></div>{answeredCorrectly ? <Link href={learningApplicationHref(lesson.id)} className={styles.applicationButton}>{text(lesson.application.label)} ↗</Link> : <p className={styles.locked}>{ui.locked}</p>}</section>
    </div>
  </main>;
}

export function getStaticPaths() { return { paths: LEARNING_LESSON_IDS.map((lesson) => ({ params:{ lesson } })), fallback:false }; }
export function getStaticProps({ params }) { return { props:{ lessonId:params.lesson } }; }

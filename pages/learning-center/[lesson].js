import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "../../components/LanguageProvider";
import {
  LEARNING_LESSON_IDS,
  learningApplicationHref,
  learningLessonForId,
} from "../../lib/learning-lessons";
import styles from "../../styles/LearningLesson.module.css";

const copy = {
  en: {
    back: "Back to Learning Center",
    outcomes: "What you will learn",
    concept: "Concept",
    example: "Worked example",
    exercise: "Guided practice",
    check: "Understanding check",
    submit: "Check answer",
    choose: "Choose one answer before checking.",
    retry: "Review the explanation and try again.",
    application: "Application step",
    locked: "Complete the understanding check to open the optional production-tool application.",
  },
  ar: {
    back: "العودة إلى مركز التعلّم",
    outcomes: "ما الذي ستتعلّمه؟",
    concept: "المفهوم",
    example: "مثال محلول",
    exercise: "تطبيق موجّه",
    check: "تحقق من الفهم",
    submit: "تحقق من الإجابة",
    choose: "اختر إجابة واحدة قبل التحقق.",
    retry: "راجع الشرح ثم حاول مرة أخرى.",
    application: "مرحلة التطبيق",
    locked: "أكمل اختبار الفهم لفتح الانتقال الاختياري إلى الأداة الإنتاجية.",
  },
};

export default function LearningLessonPage({ lessonId }) {
  const { language } = useLanguage();
  const locale = language === "ar" ? "ar" : "en";
  const ui = copy[locale];
  const lesson = learningLessonForId(lessonId);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  if (!lesson) return null;

  const text = (value) => value[locale];
  const answeredCorrectly = submitted && selectedAnswer === lesson.check.correctIndex;

  const checkAnswer = (event) => {
    event.preventDefault();
    if (selectedAnswer !== null) setSubmitted(true);
  };

  return (
    <main className={styles.page}>
      <Head>
        <title>{text(lesson.title)} | LinguaLab</title>
        <meta name="description" content={text(lesson.overview)} />
      </Head>

      <div className={styles.container}>
        <nav className={styles.nav} aria-label={ui.back}>
          <Link href="/learning-center" className={styles.backLink}>← {ui.back}</Link>
          <span className={styles.brand}>LinguaLab</span>
        </nav>

        <header className={styles.hero}>
          <p className={styles.eyebrow}>{text(lesson.eyebrow)}</p>
          <h1>{text(lesson.title)}</h1>
          <p className={styles.lead}>{text(lesson.overview)}</p>
        </header>

        <section className={styles.panel}>
          <p className={styles.sectionLabel}>{ui.outcomes}</p>
          <ul className={styles.outcomeList}>
            {lesson.outcomes.map((outcome) => <li key={outcome.en}>{text(outcome)}</li>)}
          </ul>
        </section>

        <section className={styles.lessonSection}>
          <p className={styles.sectionLabel}>{ui.concept}</p>
          <div className={styles.conceptGrid}>
            {lesson.concepts.map((concept) => (
              <article className={styles.conceptCard} key={concept.title.en}>
                <h2>{text(concept.title)}</h2>
                <p>{text(concept.text)}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.twoColumn}>
          <article className={styles.learningCard}>
            <p className={styles.sectionLabel}>{ui.example}</p>
            <h2>{text(lesson.example.title)}</h2>
            <p className={styles.sample}>{text(lesson.example.sample)}</p>
            <ol>{lesson.example.steps.map((step) => <li key={step.en}>{text(step)}</li>)}</ol>
          </article>

          <article className={styles.learningCard}>
            <p className={styles.sectionLabel}>{ui.exercise}</p>
            <h2>{text(lesson.exercise.title)}</h2>
            <p className={styles.sample}>{text(lesson.exercise.prompt)}</p>
            <ol>{lesson.exercise.steps.map((step) => <li key={step.en}>{text(step)}</li>)}</ol>
          </article>
        </section>

        <section className={styles.checkCard}>
          <p className={styles.sectionLabel}>{ui.check}</p>
          <h2>{text(lesson.check.question)}</h2>
          <form onSubmit={checkAnswer}>
            <fieldset className={styles.options}>
              <legend className={styles.srOnly}>{text(lesson.check.question)}</legend>
              {lesson.check.options.map((option, index) => (
                <label className={styles.option} key={option.en}>
                  <input
                    type="radio"
                    name="lesson-check"
                    value={index}
                    checked={selectedAnswer === index}
                    onChange={() => {
                      setSelectedAnswer(index);
                      setSubmitted(false);
                    }}
                  />
                  <span>{text(option)}</span>
                </label>
              ))}
            </fieldset>
            <button className={styles.checkButton} type="submit">{ui.submit}</button>
          </form>

          {submitted && (
            <p className={answeredCorrectly ? styles.correct : styles.incorrect} role="status">
              {answeredCorrectly ? text(lesson.check.correct) : `${text(lesson.check.incorrect)} ${ui.retry}`}
            </p>
          )}
          {!submitted && selectedAnswer === null && <p className={styles.hint}>{ui.choose}</p>}
        </section>

        <section className={styles.applicationCard}>
          <div>
            <p className={styles.sectionLabel}>{ui.application}</p>
            <h2>{text(lesson.application.tool)}</h2>
            <p>{text(lesson.application.description)}</p>
          </div>
          {answeredCorrectly ? (
            <Link href={learningApplicationHref(lesson.id)} className={styles.applicationButton}>
              {text(lesson.application.label)} ↗
            </Link>
          ) : (
            <p className={styles.locked}>{ui.locked}</p>
          )}
        </section>
      </div>
    </main>
  );
}

export function getStaticPaths() {
  return {
    paths: LEARNING_LESSON_IDS.map((lesson) => ({ params: { lesson } })),
    fallback: false,
  };
}

export function getStaticProps({ params }) {
  return { props: { lessonId: params.lesson } };
}

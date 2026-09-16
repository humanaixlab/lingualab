import { useState } from "react";
import { microInteractionsForLesson } from "../../lib/learning-micro-interactions";
import styles from "../../styles/LessonMicroInteractions.module.css";

const ui = {
  en: {
    lab: "Interactive mini-lab",
    next: "Reveal next step",
    complete: "All steps revealed",
    reveal: "Reveal the count",
    check: "Check selections",
    choose: "Make a prediction first.",
    selected: "Your prediction",
    tryAgain: "You can choose again and compare the explanation.",
    inspectLine: "Select a line to inspect it.",
  },
  ar: {
    lab: "مختبر تعلّم مصغّر",
    next: "اكشف الخطوة التالية",
    complete: "اكتملت الخطوات",
    reveal: "اكشف العد",
    check: "تحقق من الاختيارات",
    choose: "ضع توقّعك أولًا.",
    selected: "توقّعك",
    tryAgain: "يمكنك اختيار إجابة أخرى ومقارنة التفسير.",
    inspectLine: "اختر سطرًا لفحصه.",
  },
};

function InteractionFrame({ interaction, locale, children }) {
  const text = (value) => value[locale];
  return (
    <section className={styles.frame} data-interaction-id={interaction.id}>
      <p className={styles.kicker}>{ui[locale].lab}</p>
      <h3>{text(interaction.title)}</h3>
      <p className={styles.prompt}>{text(interaction.prompt)}</p>
      {children}
    </section>
  );
}

function RevealInteraction({ interaction, locale }) {
  const [visibleCount, setVisibleCount] = useState(1);
  const text = (value) => value[locale];
  const done = visibleCount >= interaction.steps.length;
  return (
    <InteractionFrame interaction={interaction} locale={locale}>
      <ol className={styles.revealList} aria-live="polite">
        {interaction.steps.slice(0, visibleCount).map((step) => (
          <li key={step.label.en}>
            <strong>{text(step.label)}</strong>
            <span className={step.code ? styles.code : undefined} dir={step.code ? "ltr" : undefined}>{text(step.value)}</span>
          </li>
        ))}
      </ol>
      {!done ? (
        <button type="button" className={styles.secondaryButton} onClick={() => setVisibleCount((count) => count + 1)}>
          {ui[locale].next}
        </button>
      ) : <p className={styles.completeNote}>{ui[locale].complete}</p>}
      {done && interaction.note && <p className={styles.caution}>{text(interaction.note)}</p>}
    </InteractionFrame>
  );
}

function ChoiceSetInteraction({ interaction, locale }) {
  const [answers, setAnswers] = useState({});
  const text = (value) => value[locale];
  return (
    <InteractionFrame interaction={interaction} locale={locale}>
      <div className={styles.scenarioList}>
        {interaction.scenarios.map((scenario, scenarioIndex) => {
          const selectedIndex = answers[scenarioIndex];
          const selected = Number.isInteger(selectedIndex) ? scenario.options[selectedIndex] : null;
          return (
            <fieldset className={styles.scenario} key={scenario.question.en}>
              <legend>{text(scenario.question)}</legend>
              {scenario.codeSample && <pre className={styles.codeSample} dir="ltr"><code>{scenario.codeSample}</code></pre>}
              <div className={styles.choiceGrid}>
                {scenario.options.map((item, optionIndex) => (
                  <button
                    type="button"
                    className={styles.choiceButton}
                    aria-pressed={selectedIndex === optionIndex}
                    key={item.label.en}
                    onClick={() => setAnswers((current) => ({ ...current, [scenarioIndex]: optionIndex }))}
                  >
                    {text(item.label)}
                  </button>
                ))}
              </div>
              {selected && (
                <div className={selected.correct ? styles.correct : styles.incorrect} role="status">
                  <strong>{selected.correct ? "✓" : "↻"}</strong> {text(selected.feedback)}
                  {!selected.correct && <span className={styles.retry}>{ui[locale].tryAgain}</span>}
                </div>
              )}
            </fieldset>
          );
        })}
      </div>
    </InteractionFrame>
  );
}

function MultiSelectInteraction({ interaction, locale, showTable = false }) {
  const [selected, setSelected] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const text = (value) => value[locale];
  const toggle = (index) => {
    setSelected((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index]);
    setSubmitted(false);
  };
  const expected = interaction.options.map((item, index) => item.correct ? index : -1).filter((index) => index >= 0);
  const correct = submitted && expected.length === selected.length && expected.every((index) => selected.includes(index));
  return (
    <InteractionFrame interaction={interaction} locale={locale}>
      {showTable && (
        <div className={styles.tableWrap} tabIndex="0" aria-label={text(interaction.title)}>
          <table>
            <thead><tr>{interaction.columns.map((column) => <th scope="col" key={column.en}>{text(column)}</th>)}</tr></thead>
            <tbody>{interaction.rows.map((row, rowIndex) => <tr key={`${row[0]}-${rowIndex}`}>{row.map((cell, index) => <td key={`${rowIndex}-${index}`}>{cell || <span className={styles.missing}>—</span>}</td>)}</tr>)}</tbody>
          </table>
        </div>
      )}
      <fieldset className={styles.checkList}>
        <legend className={styles.srOnly}>{text(interaction.prompt)}</legend>
        {interaction.options.map((item, index) => (
          <label key={item.label.en}>
            <input type="checkbox" checked={selected.includes(index)} onChange={() => toggle(index)} />
            <span>{text(item.label)}</span>
          </label>
        ))}
      </fieldset>
      <button type="button" className={styles.secondaryButton} onClick={() => setSubmitted(true)}>{ui[locale].check}</button>
      {submitted && (
        <div className={correct ? styles.correct : styles.incorrect} role="status">
          <strong>{correct ? "✓" : "↻"}</strong>{" "}
          {correct ? text(interaction.success) : interaction.options.filter((_, index) => selected.includes(index)).map((item) => text(item.feedback)).join(" ") || ui[locale].choose}
          {!correct && <span className={styles.retry}>{ui[locale].tryAgain}</span>}
        </div>
      )}
    </InteractionFrame>
  );
}

function PredictionInteraction({ interaction, locale }) {
  const [prediction, setPrediction] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const text = (value) => value[locale];
  return (
    <InteractionFrame interaction={interaction} locale={locale}>
      {interaction.codeSample && <pre className={styles.codeSample} dir="ltr"><code>{interaction.codeSample}</code></pre>}
      <fieldset className={styles.options}>
        <legend className={styles.srOnly}>{text(interaction.prompt)}</legend>
        {interaction.options.map((item, index) => (
          <label key={item.en}>
            <input type="radio" name={interaction.id} checked={prediction === index} onChange={() => { setPrediction(index); setRevealed(false); }} />
            <span className={interaction.code ? styles.code : undefined} dir={interaction.code ? "ltr" : undefined}>{text(item)}</span>
          </label>
        ))}
      </fieldset>
      <button type="button" className={styles.secondaryButton} disabled={prediction === null} onClick={() => setRevealed(true)}>{ui[locale].reveal}</button>
      {prediction === null && <p className={styles.hint}>{ui[locale].choose}</p>}
      {revealed && (
        <div className={prediction === interaction.correctIndex ? styles.correct : styles.incorrect} role="status">
          <strong>{text(interaction.result)}</strong>
          <p>{text(interaction.explanation)}</p>
          {prediction !== interaction.correctIndex && <span className={styles.retry}>{ui[locale].tryAgain}</span>}
        </div>
      )}
    </InteractionFrame>
  );
}

function CodeExplorerInteraction({ interaction, locale }) {
  const [selectedLine, setSelectedLine] = useState(null);
  const text = (value) => value[locale];
  return (
    <InteractionFrame interaction={interaction} locale={locale}>
      <div className={styles.codeExplorer} dir="ltr">
        {interaction.lines.map((line, index) => (
          <button type="button" aria-pressed={selectedLine === index} onClick={() => setSelectedLine(index)} key={line.code}>
            <code>{line.code}</code>
          </button>
        ))}
      </div>
      {selectedLine === null ? <p className={styles.hint}>{ui[locale].inspectLine}</p> : (
        <p className={styles.explanation} role="status">{text(interaction.lines[selectedLine].explanation)}</p>
      )}
    </InteractionFrame>
  );
}

function Interaction({ interaction, locale }) {
  if (interaction.type === "reveal") return <RevealInteraction interaction={interaction} locale={locale} />;
  if (interaction.type === "choice-set") return <ChoiceSetInteraction interaction={interaction} locale={locale} />;
  if (interaction.type === "multi-select") return <MultiSelectInteraction interaction={interaction} locale={locale} />;
  if (interaction.type === "table-inspection") return <MultiSelectInteraction interaction={interaction} locale={locale} showTable />;
  if (interaction.type === "prediction") return <PredictionInteraction interaction={interaction} locale={locale} />;
  if (interaction.type === "code-explorer") return <CodeExplorerInteraction interaction={interaction} locale={locale} />;
  return null;
}

export function LessonMicroInteractions({ lessonId, locale, afterConcept }) {
  const interactions = microInteractionsForLesson(lessonId, afterConcept);
  if (!interactions.length) return null;
  return (
    <section className={styles.labSection} aria-label={ui[locale].lab}>
      {interactions.map((interaction) => <Interaction interaction={interaction} locale={locale} key={interaction.id} />)}
    </section>
  );
}

export function ProgressiveWorkedExample({ example, locale, label }) {
  const [visibleCount, setVisibleCount] = useState(1);
  const text = (value) => value[locale];
  const done = visibleCount >= example.steps.length;
  return (
    <div className={styles.progressiveExample}>
      <p className={styles.sample}>{text(example.sample)}</p>
      <ol aria-live="polite">
        {example.steps.slice(0, visibleCount).map((step) => <li key={step.en}>{text(step)}</li>)}
      </ol>
      {!done ? (
        <button type="button" className={styles.secondaryButton} onClick={() => setVisibleCount((count) => count + 1)}>{label}</button>
      ) : <p className={styles.completeNote}>{ui[locale].complete}</p>}
    </div>
  );
}

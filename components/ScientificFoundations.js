import { useEffect, useState } from "react";
import {
  SCIENTIFIC_FOUNDATIONS,
  emptyScientificReferenceState,
  normalizeResearcherReference,
  readScientificReferenceState,
  saveScientificReferenceState,
} from "../lib/scientific-references";
import styles from "../styles/ScientificFoundations.module.css";

const EMPTY_FORM = { author: "", year: "", title: "", publisher: "", doiOrUrl: "", suggestedForReport: false };

const COPY = {
  ar: {
    title: "الأساس العلمي للمسار", intro: "مراجع منهجية عربية اختارتها المنصة من القائمة المعتمدة لدعم هذا المسار.", platform: "مراجع المنصة", approved: "مرجع معتمد من قائمة المنصة", placeholder: "عنصر مؤقت — لم يُضف مرجع حقيقي أو موثّق بعد", author: "المؤلف", translator: "المترجم", year: "السنة", referenceTitle: "العنوان", publisher: "المجلة / الناشر", source: "DOI أو رابط المصدر الرسمي", type: "نوع المرجع", note: "صلة المرجع بالمنهجية", notSupplied: "غير متوفر في القائمة المعتمدة", suggested: "مرجع مقترح للتضمين في التقرير", suggestionOnly: "علامة اقتراح فقط؛ لن يُدرج المرجع أو يُستشهد به تلقائيًا في التقرير.", researcher: "مراجع الباحث", researcherIntro: "أضف مراجعك الخاصة بصورة منفصلة. تبقى مسؤولية التحقق منها واختيار إدراجها في التقرير للباحث.", add: "إضافة مرجع", edit: "تعديل المرجع", save: "حفظ المرجع", cancel: "إلغاء", delete: "حذف", editAction: "تعديل", empty: "لم تُضف مراجع للباحث في هذا المسار بعد.", required: "أكمل المؤلف والسنة والعنوان والمجلة أو الناشر.", saved: "حُفظت المراجع محليًا على هذا الجهاز.", storageError: "تعذر الحفظ المحلي. لم تُرسل المراجع إلى أي خدمة خارجية.", limitation: "الحفظ محلي في هذا المتصفح والجهاز فقط، ولا يزامن المراجع مع أجهزة أخرى أو يضيفها إلى التقرير تلقائيًا.",
  },
  en: {
    title: "Scientific Foundations", intro: "Arabic methodological references curated by the platform from the approved list to support this path.", platform: "Platform references", approved: "Approved platform-list reference", placeholder: "Placeholder — no real or verified reference has been added yet", author: "Author", translator: "Translator", year: "Year", referenceTitle: "Title", publisher: "Journal / publisher", source: "DOI or official source URL", type: "Reference type", note: "Why it supports the methodology", notSupplied: "Not supplied in the approved list", suggested: "Suggested for the research report", suggestionOnly: "Suggestion flag only; the reference will not be inserted or cited automatically in the report.", researcher: "Researcher References", researcherIntro: "Add your own references separately. Verification and final report inclusion remain the researcher's responsibility.", add: "Add reference", edit: "Edit reference", save: "Save reference", cancel: "Cancel", delete: "Delete", editAction: "Edit", empty: "No researcher references have been added for this path.", required: "Complete author, year, title, and journal or publisher.", saved: "References were saved locally on this device.", storageError: "Local saving is unavailable. References were not sent to any external service.", limitation: "References are stored only in this browser on this device. They are not synced across devices or inserted into reports automatically.",
  },
};

export default function ScientificFoundations({ pathId, language = "en" }) {
  const locale = language === "ar" ? "ar" : "en";
  const copy = COPY[locale];
  const foundation = SCIENTIFIC_FOUNDATIONS[pathId];
  const [state, setState] = useState(emptyScientificReferenceState);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (foundation) setState(readScientificReferenceState(pathId));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [foundation, pathId]);

  if (!foundation) return null;

  function persist(nextState) {
    const saved = saveScientificReferenceState(pathId, nextState);
    setState(saved.state);
    setMessage(saved.ok ? copy.saved : copy.storageError);
  }

  function submit(event) {
    event.preventDefault();
    const id = editingId || `researcher-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const reference = normalizeResearcherReference({ ...form, id });
    if (!reference) { setMessage(copy.required); return; }
    const references = editingId
      ? state.researcherReferences.map((item) => item.id === editingId ? reference : item)
      : [...state.researcherReferences, reference];
    persist({ ...state, researcherReferences: references });
    setForm(EMPTY_FORM); setEditingId("");
  }

  function startEdit(reference) {
    setEditingId(reference.id);
    setForm({ author: reference.author, year: reference.year, title: reference.title, publisher: reference.publisher, doiOrUrl: reference.doiOrUrl, suggestedForReport: reference.suggestedForReport });
    setMessage("");
  }

  return <section className={styles.foundations} aria-labelledby={`${pathId}-scientific-foundations`}>
    <header><p>{foundation.title[locale]}</p><h2 id={`${pathId}-scientific-foundations`}>{copy.title}</h2><span>{copy.intro}</span></header>
    <h3>{copy.platform}</h3>
    <div className={styles.platformGrid}>
      {foundation.platformReferences.map((reference) => <article className={styles.platformReference} key={reference.id}>
        <strong className={reference.isPlaceholder ? styles.placeholder : styles.approved}>{reference.isPlaceholder ? copy.placeholder : copy.approved}</strong>
        <dl>
          <div><dt>{copy.author}</dt><dd>{reference.author[locale]}</dd></div>
          {reference.translator && <div><dt>{copy.translator}</dt><dd>{reference.translator[locale]}</dd></div>}
          <div><dt>{copy.year}</dt><dd>{reference.year || copy.pending}</dd></div>
          <div><dt>{copy.referenceTitle}</dt><dd>{reference.title[locale]}</dd></div>
          <div><dt>{copy.publisher}</dt><dd>{reference.publisher[locale]}</dd></div>
          <div><dt>{copy.source}</dt><dd>{reference.doiOrUrl ? <a href={reference.doiOrUrl} target="_blank" rel="noreferrer">{reference.doiOrUrl}</a> : copy.notSupplied}</dd></div>
          <div><dt>{copy.type}</dt><dd>{reference.referenceType[locale]}</dd></div>
          <div className={styles.full}><dt>{copy.note}</dt><dd>{reference.note[locale]}</dd></div>
        </dl>
      </article>)}
    </div>

    <div className={styles.researcherHeader}><div><h3>{copy.researcher}</h3><p>{copy.researcherIntro}</p></div></div>
    {state.researcherReferences.length ? <div className={styles.researcherList}>{state.researcherReferences.map((reference) => <article key={reference.id}>
      <div><strong>{reference.title}</strong><span>{reference.author} · {reference.year} · {reference.publisher}</span>{reference.doiOrUrl && <small dir="auto">{reference.doiOrUrl}</small>}{reference.suggestedForReport && <em>{copy.suggested}</em>}</div>
      <div className={styles.actions}><button type="button" onClick={() => startEdit(reference)}>{copy.editAction}</button><button type="button" onClick={() => persist({ ...state, researcherReferences: state.researcherReferences.filter((item) => item.id !== reference.id) })}>{copy.delete}</button></div>
    </article>)}</div> : <p className={styles.empty}>{copy.empty}</p>}

    <form className={styles.referenceForm} onSubmit={submit}>
      <h3>{editingId ? copy.edit : copy.add}</h3>
      <div className={styles.fields}>
        <label>{copy.author}<input required value={form.author} onChange={(event) => setForm({ ...form, author: event.target.value })} /></label>
        <label>{copy.year}<input required inputMode="numeric" maxLength={20} value={form.year} onChange={(event) => setForm({ ...form, year: event.target.value })} /></label>
        <label className={styles.wide}>{copy.referenceTitle}<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
        <label>{copy.publisher}<input required value={form.publisher} onChange={(event) => setForm({ ...form, publisher: event.target.value })} /></label>
        <label>{copy.source}<input dir="ltr" type="text" value={form.doiOrUrl} onChange={(event) => setForm({ ...form, doiOrUrl: event.target.value })} /></label>
      </div>
      <label className={styles.suggestion}><input type="checkbox" checked={form.suggestedForReport} onChange={(event) => setForm({ ...form, suggestedForReport: event.target.checked })} />{copy.suggested}</label>
      <p className={styles.suggestionNote}>{copy.suggestionOnly}</p>
      <div className={styles.formActions}><button type="submit">{copy.save}</button>{editingId && <button type="button" onClick={() => { setEditingId(""); setForm(EMPTY_FORM); setMessage(""); }}>{copy.cancel}</button>}</div>
      {message && <p role="status">{message}</p>}
    </form>
    <p className={styles.limitation}>{copy.limitation}</p>
  </section>;
}

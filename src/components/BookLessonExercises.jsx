import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { LESSON01_GROUPS, LESSON01_PRACTICE, LESSON01_TEST, checkAnswer, scoreTest, checkNameSpelling, extractNameLetters } from '@/data/deutschsprintExercises';
import { audioPath } from '@/data/deutschsprintAudio';

const button = 'brand-focus inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold';
const primary = `${button} bg-[#087F80] text-white hover:bg-[#096c6d] disabled:cursor-not-allowed disabled:opacity-50`;
const secondary = `${button} border border-slate-300 bg-white text-[#15344B] hover:border-[#087F80] disabled:opacity-40`;
const SESSION_KEY = 'deutschsprint-a1-01-exercises-v1';

function loadSession() {
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(SESSION_KEY) || '{}') || {};
    const answers = Object.fromEntries(LESSON01_PRACTICE.flatMap((question) => typeof saved.answers?.[question.id] === 'string' ? [[question.id, saved.answers[question.id].slice(0, 50)]] : []));
    const results = Object.fromEntries(LESSON01_PRACTICE.flatMap((question) => typeof saved.results?.[question.id] === 'boolean' && answers[question.id]?.trim() ? [[question.id, checkAnswer(question, answers[question.id])]] : []));
    const testAnswers = Object.fromEntries(LESSON01_TEST.flatMap((question) => question.options.includes(saved.testAnswers?.[question.id]) ? [[question.id, saved.testAnswers[question.id]]] : []));
    return { step: Number.isInteger(saved.step) && saved.step >= 0 && saved.step < LESSON01_GROUPS.length ? saved.step : 0, answers, results, testAnswers, submitted: saved.submitted === true && scoreTest(testAnswers).complete };
  } catch {
    return { step: 0, answers: {}, results: {}, testAnswers: {}, submitted: false };
  }
}

function Feedback({ correct, answer, explanation }) {
  return <div role="status" className={`mt-3 rounded-lg p-3 text-sm leading-6 ${correct ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900'}`}>
    <p className="flex items-center gap-2 font-black">{correct ? <CheckCircle2 size={18} aria-hidden="true" /> : <XCircle size={18} aria-hidden="true" />}{correct ? 'إجابة صحيحة' : 'إجابة غير صحيحة'}</p>
    {!correct && <p className="mt-1">الإجابة الصحيحة: <bdi dir="auto" className="font-black">{answer}</bdi></p>}
    <p className="mt-1">{explanation}</p>
  </div>;
}

function Question({ question, value, result, onChange, onCheck, test = false, locked = false }) {
  return <fieldset className="min-w-0 rounded-xl border border-slate-200 bg-white p-4">
    <legend className="px-1 text-sm font-bold text-slate-700">{question.prompt}</legend>
    {question.display && <p dir="ltr" lang="de" className="german-text mb-4 text-center text-2xl font-black text-[#15344B]">{question.display}</p>}
    {question.type === 'choice' ? (
      <div className="flex flex-wrap gap-2">
        {question.options.map((option) => <button type="button" key={option} disabled={locked} aria-pressed={value === option} onClick={() => { onChange(option); if (!test) onCheck(option); }}
          className={`${button} min-w-[58px] border text-lg ${value === option ? 'border-[#087F80] bg-[#087F80]/10 text-[#15344B] ring-1 ring-[#087F80]' : 'border-slate-200 bg-white text-slate-800 hover:border-[#087F80]'} disabled:cursor-default`}><bdi dir="auto">{option}</bdi></button>)}
      </div>
    ) : (
      <form onSubmit={(event) => { event.preventDefault(); onCheck(value); }} className="flex flex-wrap gap-2">
        <input dir="ltr" lang="de" maxLength={50} value={value} onChange={(event) => onChange(event.target.value)} autoComplete="off" autoCapitalize="characters" spellCheck={false} aria-label={`${question.prompt}: ${question.display}`} placeholder={question.type === 'spelling' ? 'A - B - …' : '…'} className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-lg font-bold focus:border-[#087F80]" />
        <button type="submit" disabled={!value.trim()} className={primary}>تحقّق</button>
      </form>
    )}
    {result !== undefined && <Feedback correct={result} answer={question.answer} explanation={question.explanation} />}
    {test && locked && result === false && <Link to={audioPath(question.review)} className="mt-3 inline-flex min-h-10 items-center font-bold text-[#087F80] underline">راجع شرح هذا السؤال</Link>}
  </fieldset>;
}

function PersonalPractice() {
  const [name, setName] = useState('');
  const [spelling, setSpelling] = useState('');
  const [checked, setChecked] = useState(false);
  const letters = extractNameLetters(name);
  const correct = checkNameSpelling(name, spelling);
  return <form onSubmit={(event) => { event.preventDefault(); setChecked(true); }} className="rounded-xl border border-slate-200 bg-white p-4">
    <label className="block font-bold text-[#15344B]">الاسم (Mein Name)
      <input dir="ltr" maxLength={80} value={name} onChange={(event) => { setName(event.target.value); setChecked(false); }} autoComplete="off" spellCheck={false} placeholder="Mira" className="mt-2 block w-full rounded-lg border border-slate-300 p-3" />
    </label>
    <label className="mt-4 block font-bold text-[#15344B]">التهجئة (Buchstaben)
      <input dir="ltr" maxLength={240} value={spelling} onChange={(event) => { setSpelling(event.target.value); setChecked(false); }} autoComplete="off" spellCheck={false} placeholder="A - B - …" className="mt-2 block w-full rounded-lg border border-slate-300 p-3" />
    </label>
    <p className="mt-3 text-sm leading-6 text-slate-600">اترك مسافة أو شرطة بين الحروف. لا يُحفظ اسمك ولا يدخل هذا التدريب ضمن العلامة.</p>
    <button type="submit" disabled={!letters.length || !spelling.trim()} className={`${primary} mt-4`}>تحقّق من التهجئة</button>
    {name.trim() && !letters.length && <p role="status" className="mt-2 text-sm text-red-800">اكتب الاسم بالأحرف اللاتينية فقط.</p>}
    {checked && <Feedback correct={correct} answer={letters.map((letter) => letter === 'ß' ? 'ẞ' : letter.toUpperCase()).join(' – ')} explanation="ينبغي أن تطابق التهجئة ترتيب حروف الاسم المكتوب دون نقص أو زيادة؛ لا نقيّم طريقة نطقك هنا." />}
  </form>;
}

export default function BookLessonExercises() {
  const [saved] = useState(loadSession);
  const [step, setStep] = useState(saved.step);
  const [answers, setAnswers] = useState(saved.answers);
  const [results, setResults] = useState(saved.results);
  const [testAnswers, setTestAnswers] = useState(saved.testAnswers);
  const [submitted, setSubmitted] = useState(saved.submitted);
  const groupRef = useRef(null);
  const scrollOnChange = useRef(false);
  useEffect(() => {
    try { window.sessionStorage.setItem(SESSION_KEY, JSON.stringify({ step, answers, results, testAnswers, submitted })); } catch { /* Training still works without storage. */ }
  }, [step, answers, results, testAnswers, submitted]);
  useEffect(() => {
    if (scrollOnChange.current) {
      groupRef.current?.focus({ preventScroll: true });
      groupRef.current?.scrollIntoView({ block: 'start', behavior: 'auto' });
      scrollOnChange.current = false;
    }
  }, [step]);
  const group = LESSON01_GROUPS[step];
  const test = scoreTest(testAnswers);
  const practiced = LESSON01_PRACTICE.filter((question) => results[question.id] !== undefined).length;
  const correctCount = LESSON01_PRACTICE.filter((question) => results[question.id] === true).length;
  const change = (question, value) => {
    setAnswers((current) => ({ ...current, [question.id]: value }));
    setResults((current) => { const next = { ...current }; delete next[question.id]; return next; });
  };
  const check = (question, value) => setResults((current) => ({ ...current, [question.id]: checkAnswer(question, value) }));
  const resetPractice = () => {
    setAnswers((current) => Object.fromEntries(Object.entries(current).filter(([id]) => !group.questions.some((question) => question.id === id))));
    setResults((current) => Object.fromEntries(Object.entries(current).filter(([id]) => !group.questions.some((question) => question.id === id))));
  };
  const selectStep = (index) => {
    const next = Math.max(0, Math.min(LESSON01_GROUPS.length - 1, index));
    if (next !== step) { scrollOnChange.current = true; setStep(next); }
  };

  return <div className="space-y-6">
    <section className="rounded-2xl bg-[#15344B] p-5 text-white sm:p-7">
      <p className="text-sm font-bold text-[#D5AC55]">الدرس 01 · الصفحتان 6–7</p>
      <h1 className="mt-2 text-3xl font-black">تدرّب واختبر نفسك</h1>
      <p dir="ltr" lang="de" className="german-text mt-2 font-bold">Übungen · Mini-Test</p>
      <p className="mt-3 leading-7 text-white/90">اعمل على التمارين الخمسة ثم حلّ الاختبار المكوّن من خمسة أسئلة. يمكنك العودة إلى أي تدريب في أي وقت.</p>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-sm font-bold"><span>التدريبات المصحّحة: {practiced} / {LESSON01_PRACTICE.length}</span><span>صحيحة الآن: {correctCount}</span></div>
      <div role="progressbar" aria-label="التمارين المصحّحة" aria-valuemin={0} aria-valuemax={LESSON01_PRACTICE.length} aria-valuenow={practiced} className="mt-2 h-2 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-[#D5AC55]" style={{ width: `${practiced / LESSON01_PRACTICE.length * 100}%` }} /></div>
    </section>
    <nav aria-label="مراحل التدريب" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {LESSON01_GROUPS.map((entry, index) => <button type="button" key={entry.id} aria-current={index === step ? 'step' : undefined} onClick={() => selectStep(index)} className={`brand-focus min-h-14 rounded-xl border p-3 text-right text-sm font-bold ${index === step ? 'border-[#087F80] bg-[#087F80]/10 text-[#15344B]' : 'border-slate-200 bg-white text-slate-700'}`}><span className="ml-1 text-[#087F80]">{index + 1}.</span>{entry.title}</button>)}
    </nav>
    <section ref={groupRef} tabIndex={-1} aria-labelledby="exercise-group-title" className="scroll-mt-28 rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none sm:p-6">
      <header className="mb-5">
        <p dir="ltr" lang="de" className="german-text text-sm font-bold text-[#087F80]">{group.german} · Seite {group.page}</p>
        <h2 id="exercise-group-title" className="mt-2 text-xl font-black text-[#15344B]">{step + 1}. {group.title}</h2>
        <p className="mt-2 leading-7 text-slate-700">{group.instruction}</p>
        {group.review && <Link to={audioPath(group.review)} className="mt-2 inline-flex min-h-9 items-center text-sm font-bold text-[#087F80] underline">راجع الحروف والأمثلة</Link>}
      </header>
      {group.questions && <div className="space-y-4">
        {group.questions.map((question) => <Question key={question.id} question={question} value={answers[question.id] || ''} result={results[question.id]} onChange={(value) => change(question, value)} onCheck={(value) => check(question, value)} />)}
        <button type="button" className={secondary} onClick={resetPractice}><RotateCcw size={17} aria-hidden="true" /> إعادة هذا التدريب</button>
      </div>}
      {group.id === 'personal' && <PersonalPractice />}
      {group.id === 'test' && <div className="space-y-4">
        {submitted && <div role="status" className={`rounded-xl border p-4 ${test.passed ? 'border-green-300 bg-green-50 text-green-900' : 'border-amber-300 bg-amber-50 text-amber-900'}`}><p className="text-2xl font-black">نتيجتك: {test.score} / {test.total}</p><p className="mt-2 leading-7">{test.passed ? 'أحسنت! أنت جاهز للدرس التالي بحسب معيار هذا الاختبار.' : 'راجع الإجابات الخاطئة والحروف والتركيبات، ثم حاول مرة أخرى.'}</p><button type="button" className={`${secondary} mt-3`} onClick={() => { setTestAnswers({}); setSubmitted(false); }}><RotateCcw size={17} aria-hidden="true" /> إعادة الاختبار</button></div>}
        {LESSON01_TEST.map((question, index) => <Question key={question.id} question={{ ...question, prompt: `${index + 1}. ${question.prompt}` }} value={testAnswers[question.id] || ''} result={submitted ? checkAnswer(question, testAnswers[question.id]) : undefined} test locked={submitted} onChange={(value) => setTestAnswers((current) => ({ ...current, [question.id]: value }))} />)}
        {!submitted && <div className="flex flex-wrap items-center gap-3"><button type="button" className={primary} disabled={!test.complete} onClick={() => setSubmitted(true)}>إنهاء الاختبار وإظهار النتيجة</button><span className="text-sm text-slate-600">{LESSON01_TEST.filter((question) => testAnswers[question.id]).length} / 5 إجابات</span></div>}
      </div>}
    </section>
    <div className="flex items-center justify-between gap-3">
      <button type="button" className={secondary} disabled={step === 0} onClick={() => selectStep(step - 1)}><ArrowRight size={18} aria-hidden="true" /> السابق</button>
      <span className="text-sm font-bold text-slate-600">{step + 1} / {LESSON01_GROUPS.length}</span>
      <button type="button" className={primary} disabled={step === LESSON01_GROUPS.length - 1} onClick={() => selectStep(step + 1)}>التالي <ArrowLeft size={18} aria-hidden="true" /></button>
    </div>
  </div>;
}

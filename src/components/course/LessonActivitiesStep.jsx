import React, { useEffect, useMemo, useState } from 'react';
import { Check, CheckCircle2, Eye, RotateCcw, Save, Sparkles } from 'lucide-react';
import {
  clearLessonActivityProgress,
  getLessonActivitiesProgress,
  saveLessonActivityProgress,
} from '@/utils/lessonActivityProgress';

const asText = (value) => (typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '');

const asAcceptedAnswers = (value) => {
  if (Array.isArray(value)) return value.map(asText).filter(Boolean);
  const text = asText(value);
  return text ? text.split('|').map((answer) => answer.trim()).filter(Boolean) : [];
};

const normalizeAnswer = (value) => asText(value).replace(/\s+/g, ' ').toLocaleLowerCase('de-DE');

const getActivityId = (activity, index) => (
  asText(activity.sourceId)
  || (activity.id && !/^exercise-\d+$/.test(activity.id) ? asText(activity.id) : '')
  || `activity-${String(index + 1).padStart(2, '0')}`
);

const buildActivities = (activities) => (
  (Array.isArray(activities) ? activities : []).map((activity, index) => ({
    ...activity,
    activityId: getActivityId(activity, index),
  }))
);

const LessonActivitiesStep = ({ lessonId, activities, onCompletionChange }) => {
  const safeActivities = useMemo(() => buildActivities(activities), [activities]);
  const [records, setRecords] = useState(() => getLessonActivitiesProgress(lessonId));
  const [drafts, setDrafts] = useState(() => Object.fromEntries(
    Object.entries(getLessonActivitiesProgress(lessonId)).map(([id, entry]) => [id, entry.answer])
  ));
  const [messages, setMessages] = useState({});
  const [revealedAnswers, setRevealedAnswers] = useState([]);

  useEffect(() => {
    const stored = getLessonActivitiesProgress(lessonId);
    setRecords(stored);
    setDrafts(Object.fromEntries(Object.entries(stored).map(([id, entry]) => [id, entry.answer])));
    setMessages({});
    setRevealedAnswers([]);
  }, [lessonId, safeActivities]);

  const completedCount = safeActivities.filter((activity) => records[activity.activityId]?.completed).length;
  const allCompleted = safeActivities.length > 0 && completedCount === safeActivities.length;
  const progressPercent = safeActivities.length ? Math.round((completedCount / safeActivities.length) * 100) : 0;

  useEffect(() => {
    onCompletionChange?.(allCompleted);
  }, [allCompleted, onCompletionChange]);

  const setMessage = (activityId, text, tone = 'neutral') => {
    setMessages((current) => ({ ...current, [activityId]: { text, tone } }));
  };

  const saveActivity = (activityId, values = {}) => {
    const previous = records[activityId] || { answer: '', completed: false };
    const result = saveLessonActivityProgress(lessonId, activityId, {
      answer: values.answer ?? drafts[activityId] ?? '',
      completed: values.completed ?? previous.completed,
    });
    if (!result.success) {
      setMessage(activityId, `تعذر الحفظ: ${result.error}`, 'error');
      return null;
    }
    setRecords((current) => ({ ...current, [activityId]: result.entry }));
    setDrafts((current) => ({ ...current, [activityId]: result.entry.answer }));
    return result.entry;
  };

  const handleSave = (activityId) => {
    if (saveActivity(activityId)) setMessage(activityId, 'تم حفظ الإجابة', 'success');
  };

  const handleClear = (activityId) => {
    const result = clearLessonActivityProgress(lessonId, activityId);
    if (!result.success) {
      setMessage(activityId, `تعذر المسح: ${result.error}`, 'error');
      return;
    }
    setRecords((current) => {
      const next = { ...current };
      delete next[activityId];
      return next;
    });
    setDrafts((current) => ({ ...current, [activityId]: '' }));
    setMessage(activityId, 'تم مسح الإجابة', 'neutral');
  };

  const handleToggleCompleted = (activityId) => {
    const completed = !records[activityId]?.completed;
    if (saveActivity(activityId, { completed })) {
      setMessage(activityId, completed ? 'تم إنجاز النشاط' : 'أعيد النشاط إلى غير مكتمل', completed ? 'success' : 'neutral');
    }
  };

  const handleCheck = (activity) => {
    const acceptedAnswers = asAcceptedAnswers(activity.acceptedAnswers);
    const answer = normalizeAnswer(drafts[activity.activityId]);
    if (!answer) {
      setMessage(activity.activityId, 'اكتب إجابتك أولًا ثم حاول التحقق.', 'error');
      return;
    }
    const correct = acceptedAnswers.some((accepted) => normalizeAnswer(accepted) === answer);
    setMessage(activity.activityId, correct ? 'إجابة صحيحة' : 'الإجابة لا تطابق الإجابات المقبولة، حاول مجددًا.', correct ? 'success' : 'error');
  };

  return (
    <div className="space-y-6">
      <section className={`rounded-lg border p-4 ${allCompleted ? 'border-emerald-200 bg-emerald-50' : 'border-black/10 bg-[#fcfaf6]'}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-black text-[#111111]">أنجزت {completedCount} من {safeActivities.length} أنشطة</p>
          <span className="text-sm font-bold text-slate-600">{progressPercent}%</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white" dir="ltr">
          <div className={`h-full rounded-full transition-[width] ${allCompleted ? 'bg-emerald-600' : 'bg-[#d71920]'}`} style={{ width: `${progressPercent}%` }} />
        </div>
        {allCompleted && (
          <p className="mt-3 flex items-center gap-2 font-black text-emerald-800">
            <Sparkles size={18} /> أحسنت، أنجزت جميع أنشطة الدرس.
          </p>
        )}
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        {safeActivities.map((activity, index) => {
          const activityId = activity.activityId;
          const stored = records[activityId] || { answer: '', completed: false };
          const draft = drafts[activityId] ?? stored.answer;
          const saved = Boolean(stored.answer) && draft === stored.answer;
          const status = stored.completed ? 'مكتمل' : saved ? 'محفوظ' : 'غير مكتمل';
          const modelAnswer = asText(activity.modelAnswer || activity.sampleAnswer);
          const acceptedAnswers = asAcceptedAnswers(activity.acceptedAnswers);
          const revealed = revealedAnswers.includes(activityId);
          const message = messages[activityId];
          const prompt = asText(activity.question || activity.text || activity.instructions);

          return (
            <article key={activityId} className="flex min-w-0 flex-col rounded-lg border border-black/10 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-black text-[#b08000]">النشاط {index + 1}</p>
                  <h3 className="mt-1 text-lg font-black leading-7 text-[#111111]">{activity.title || 'نشاط تطبيقي'}</h3>
                </div>
                <span className={`shrink-0 rounded-md border px-2 py-1 text-xs font-black ${
                  stored.completed
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : saved
                      ? 'border-amber-200 bg-amber-50 text-amber-900'
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}>{status}</span>
              </div>

              {prompt && <p className="mt-3 whitespace-pre-line leading-7 text-slate-700">{prompt}</p>}

              <label htmlFor={`${lessonId}-${activityId}`} className="mt-4 text-sm font-black text-[#111111]">إجابتك</label>
              <textarea
                id={`${lessonId}-${activityId}`}
                dir="auto"
                value={draft}
                onChange={(event) => {
                  setDrafts((current) => ({ ...current, [activityId]: event.target.value }));
                  setMessages((current) => ({ ...current, [activityId]: undefined }));
                }}
                placeholder="اكتب إجابتك هنا..."
                className="brand-focus mt-2 min-h-32 w-full resize-y rounded-md border border-black/15 bg-[#fcfaf6] p-3 leading-7 text-[#111111]"
              />

              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => handleSave(activityId)} className="brand-focus inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-md bg-[#111111] px-3 text-sm font-black text-white hover:bg-black/80">
                  <Save size={16} /> حفظ الإجابة
                </button>
                <button type="button" onClick={() => handleClear(activityId)} className="brand-focus inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-md border border-black/15 bg-white px-3 text-sm font-black text-slate-700 hover:border-[#d71920]/50">
                  <RotateCcw size={16} /> مسح الإجابة
                </button>
                <button
                  type="button"
                  aria-pressed={stored.completed}
                  onClick={() => handleToggleCompleted(activityId)}
                  className={`brand-focus inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border px-3 text-sm font-black ${stored.completed ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-emerald-300 bg-emerald-50 text-emerald-900'}`}
                >
                  {stored.completed ? <CheckCircle2 size={17} /> : <Check size={17} />}
                  {stored.completed ? 'تم إنجاز النشاط' : 'وضع علامة تم الإنجاز'}
                </button>
              </div>

              {(modelAnswer || acceptedAnswers.length > 0) && (
                <div className="mt-3 flex flex-wrap gap-2 border-t border-black/10 pt-3">
                  {modelAnswer && (
                    <button
                      type="button"
                      onClick={() => setRevealedAnswers((current) => current.includes(activityId) ? current.filter((id) => id !== activityId) : [...current, activityId])}
                      className="brand-focus inline-flex min-h-9 items-center gap-2 rounded-md px-3 text-sm font-black text-[#b91218] hover:bg-red-50"
                    >
                      <Eye size={16} /> {revealed ? 'إخفاء الإجابة النموذجية' : 'عرض إجابة نموذجية'}
                    </button>
                  )}
                  {acceptedAnswers.length > 0 && (
                    <button type="button" onClick={() => handleCheck(activity)} className="brand-focus inline-flex min-h-9 items-center gap-2 rounded-md px-3 text-sm font-black text-emerald-800 hover:bg-emerald-50">
                      <CheckCircle2 size={16} /> تحقق من الإجابة
                    </button>
                  )}
                </div>
              )}

              {revealed && modelAnswer && (
                <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3">
                  <p className="text-xs font-black text-amber-900">إجابة نموذجية</p>
                  <p dir="auto" className="mt-1 whitespace-pre-line leading-7 text-[#111111]">{modelAnswer}</p>
                </div>
              )}

              {message?.text && (
                <p role="status" className={`mt-3 text-sm font-bold ${message.tone === 'success' ? 'text-emerald-700' : message.tone === 'error' ? 'text-red-700' : 'text-slate-600'}`}>
                  {message.text}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default LessonActivitiesStep;


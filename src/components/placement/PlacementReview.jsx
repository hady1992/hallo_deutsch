import React, { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PLACEMENT_SKILL_LABELS } from '@/utils/placementTestScoring';
import BidiText from '@/components/common/BidiText';

const filters = [
  { id: 'all', label: 'الكل' },
  { id: 'wrong', label: 'الإجابات الخاطئة' },
  { id: 'A1', label: 'A1' },
  { id: 'A2', label: 'A2' },
  { id: 'B1', label: 'B1' },
  { id: 'B2', label: 'B2' },
  { id: 'language_use', label: 'القواعد والمفردات' },
  { id: 'reading', label: 'القراءة' },
  { id: 'listening', label: 'الاستماع' },
];

const PlacementReview = ({ result, preparedQuestions, onBack }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const questionMap = useMemo(
    () => new Map(preparedQuestions.map((question) => [question.id, question])),
    [preparedQuestions]
  );
  const answeredQuestions = useMemo(() => result.presentedQuestionIds
    .map((questionId) => questionMap.get(questionId))
    .filter((question) => question && result.answers[question.id] !== undefined), [questionMap, result]);
  const visibleQuestions = answeredQuestions.filter((question) => {
    const isCorrect = result.answers[question.id] === question.correctAnswer;
    if (activeFilter === 'all') return true;
    if (activeFilter === 'wrong') return !isCorrect;
    return question.level === activeFilter || question.skill === activeFilter;
  });

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-24 md:px-8" dir="rtl">
      <header className="border-b border-black/10 pb-6">
        <Button type="button" variant="outline" onClick={onBack} className="brand-focus mb-5 min-h-11 gap-2">
          <ArrowRight size={18} /> العودة إلى النتيجة
        </Button>
        <h1 className="text-3xl font-black text-[#111111] md:text-4xl">مراجعة الإجابات</h1>
        <p className="mt-3 leading-7 text-slate-600">يظهر التصحيح والشرح هنا بعد انتهاء الاختبار فقط.</p>
      </header>

      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="فلترة مراجعة الإجابات">
        {filters.map((filter) => (
          <Button
            key={filter.id}
            type="button"
            size="sm"
            variant={activeFilter === filter.id ? 'default' : 'outline'}
            onClick={() => setActiveFilter(filter.id)}
            className={cn('brand-focus', activeFilter === filter.id && 'bg-[#111111] text-white hover:bg-black')}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      <section className="mt-7 grid gap-5">
        {visibleQuestions.length === 0 ? (
          <p className="rounded-md border border-black/10 bg-white px-5 py-10 text-center font-bold text-slate-500">
            لا توجد إجابات ضمن هذا الفلتر.
          </p>
        ) : visibleQuestions.map((question, index) => {
          const selectedIndex = result.answers[question.id];
          const isCorrect = selectedIndex === question.correctAnswer;
          return (
            <article key={question.id} className="rounded-md border border-black/10 bg-white p-5 shadow-sm md:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-bold text-slate-500">
                  السؤال {index + 1} • {question.level} • {PLACEMENT_SKILL_LABELS[question.skill]}
                </p>
                <span className={cn('flex items-center gap-2 font-black', isCorrect ? 'text-green-700' : 'text-red-700')}>
                  {isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                  {isCorrect ? 'صحيح' : 'خاطئ'}
                </span>
              </div>

              {question.skill === 'reading' && question.stimulus?.text && (
                <BidiText as="p" text={question.stimulus.text} fallbackDirection="ltr" className="mt-5 whitespace-pre-line rounded-md bg-[#fffaf0] p-4 leading-8" />
              )}
              {question.skill === 'listening' && question.stimulus?.audioText && (
                <div className="mt-5 rounded-md bg-[#fffaf0] p-4">
                  <p className="text-xs font-bold text-slate-500">نص الاستماع</p>
                  <BidiText as="p" text={question.stimulus.audioText} fallbackDirection="ltr" className="mt-2 leading-8" />
                </div>
              )}

              <BidiText as="h2" text={question.question} className="mt-5 text-lg font-black leading-8 text-[#111111]" />
              <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className={cn('rounded-md border p-4', isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50')}>
                  <dt className="text-xs font-bold text-slate-500">إجابتك</dt>
                  <BidiText as="dd" text={question.options[selectedIndex] ?? 'لم تتم الإجابة'} className="mt-2 font-black" />
                </div>
                <div className="rounded-md border border-green-200 bg-green-50 p-4">
                  <dt className="text-xs font-bold text-slate-500">الإجابة الصحيحة</dt>
                  <BidiText as="dd" text={question.options[question.correctAnswer]} className="mt-2 font-black text-green-900" />
                </div>
              </dl>
              <div className="mt-4 border-r-4 border-[#e0b21b] bg-[#fffaf0] p-4">
                <p className="text-xs font-bold text-slate-500">الشرح</p>
                <BidiText as="p" text={question.explanation} className="mt-2 leading-7 text-slate-700" />
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
};

export default PlacementReview;

import React from 'react';
import { ArrowLeft, BookOpenText, Headphones, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PLACEMENT_SKILL_LABELS } from '@/utils/placementTestScoring';
import PlacementAudioPlayer from './PlacementAudioPlayer';
import PlacementTimer from './PlacementTimer';
import BidiText from '@/components/common/BidiText';

const skillIcons = {
  language_use: Languages,
  reading: BookOpenText,
  listening: Headphones,
};

const PlacementQuestion = ({
  question,
  selectedAnswer,
  onSelectAnswer,
  onNext,
  questionNumber,
  answeredCount,
  remainingSeconds,
  audioPlayCount,
  onSuccessfulAudioPlay,
}) => {
  const SkillIcon = skillIcons[question.skill] || Languages;
  const progress = Math.min(100, Math.max(2, Math.round((answeredCount / 60) * 100)));

  return (
    <main className="mx-auto w-full max-w-4xl px-4 pb-16 pt-24 md:px-8" dir="rtl">
      <header className="mb-6 border-b border-black/10 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-500">السؤال {questionNumber} • عُرض حتى الآن {questionNumber}</p>
            <p className="mt-2 flex items-center gap-2 font-black text-[#111111]">
              <SkillIcon size={19} className="text-[#d71920]" aria-hidden="true" />
              {PLACEMENT_SKILL_LABELS[question.skill]}
            </p>
          </div>
          <PlacementTimer remainingSeconds={remainingSeconds} />
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-black/10" aria-label="التقدم التقريبي">
          <div className="h-full bg-[#d71920] transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>
      </header>

      {remainingSeconds <= 300 && (
        <p role="status" className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">
          بقي أقل من خمس دقائق. أجب بهدوء وسيتم إرسال إجاباتك تلقائيًا عند انتهاء الوقت.
        </p>
      )}

      <section className="rounded-md border border-black/10 bg-white shadow-sm">
        <div className="space-y-5 border-b border-black/10 p-5 md:p-8">
          {question.skill === 'reading' && question.stimulus?.text && (
            <BidiText as="article" text={question.stimulus.text} fallbackDirection="ltr" className="whitespace-pre-line rounded-md border-r-4 border-[#e0b21b] bg-[#fffaf0] p-5 leading-8 text-slate-800" />
          )}

          {question.skill === 'listening' && (
            <PlacementAudioPlayer
              key={question.id}
              stimulus={question.stimulus}
              playCount={audioPlayCount}
              onSuccessfulPlay={onSuccessfulAudioPlay}
            />
          )}

          <BidiText as="h1" text={question.question} className="text-xl font-black leading-9 text-[#111111] md:text-2xl" />
        </div>

        <fieldset className="grid gap-3 p-5 md:p-8">
          <legend className="sr-only">اختر إجابة واحدة</legend>
          {question.options.map((option, optionIndex) => {
            const selected = selectedAnswer === optionIndex;
            return (
              <label
                key={`${question.id}-${optionIndex}`}
                className={cn(
                  'brand-focus flex min-h-14 cursor-pointer items-center gap-4 rounded-md border-2 px-4 py-3 transition-colors',
                  selected
                    ? 'border-[#d71920] bg-red-50 text-[#8f1116]'
                    : 'border-black/10 bg-white text-slate-800 hover:border-[#d71920]/40'
                )}
              >
                <input
                  type="radio"
                  name={`placement-question-${question.id}`}
                  value={optionIndex}
                  checked={selected}
                  onChange={() => onSelectAnswer(optionIndex)}
                  className="h-5 w-5 shrink-0 accent-[#d71920]"
                />
                <BidiText text={option} className="min-w-0 flex-1 text-base font-bold leading-7" />
              </label>
            );
          })}
        </fieldset>

        <footer className="flex flex-col gap-3 border-t border-black/10 bg-[#fcfaf6] p-5 sm:flex-row sm:items-center sm:justify-between md:px-8">
          <p className="text-sm text-slate-500">التنقل إلى الأمام فقط للحفاظ على دقة الاختبار التكيفي.</p>
          <Button
            type="button"
            onClick={onNext}
            disabled={selectedAnswer === undefined}
            className="brand-focus min-h-12 gap-2 bg-[#d71920] px-8 text-white hover:bg-[#b91218]"
          >
            التالي <ArrowLeft size={18} aria-hidden="true" />
          </Button>
        </footer>
      </section>
    </main>
  );
};

export default PlacementQuestion;

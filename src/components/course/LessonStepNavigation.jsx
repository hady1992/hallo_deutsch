import React from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

const LessonStepNavigation = ({
  canGoBack,
  isLastStep,
  onBack,
  onNext,
  onFinish,
}) => (
  <nav aria-label="التنقل بين خطوات الدرس" className="mt-6 flex items-center justify-between gap-3 border-t border-black/10 pt-5">
    <button
      type="button"
      onClick={onBack}
      disabled={!canGoBack}
      className="brand-focus inline-flex min-h-11 items-center gap-2 rounded-md border border-black/15 bg-white px-4 font-black text-[#111111] transition hover:border-[#d71920]/50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <ArrowRight size={18} />
      السابق
    </button>

    {isLastStep ? (
      <button
        type="button"
        onClick={onFinish}
        className="brand-focus inline-flex min-h-11 items-center gap-2 rounded-md bg-[#d71920] px-5 font-black text-white transition hover:bg-[#b91218]"
      >
        <Check size={18} />
        إنهاء الدرس
      </button>
    ) : (
      <button
        type="button"
        onClick={onNext}
        className="brand-focus inline-flex min-h-11 items-center gap-2 rounded-md bg-[#111111] px-5 font-black text-white transition hover:bg-black/80"
      >
        التالي
        <ArrowLeft size={18} />
      </button>
    )}
  </nav>
);

export default LessonStepNavigation;


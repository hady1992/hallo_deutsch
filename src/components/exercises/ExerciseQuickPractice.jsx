import React from 'react';
import { ArrowDown, Shuffle } from 'lucide-react';

const ExerciseQuickPractice = ({ available, onStart, onCustomize }) => (
  <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="quick-practice-title">
    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-red-50 text-[#d71920]">
          <Shuffle size={22} aria-hidden="true" />
        </span>
        <div>
          <h2 id="quick-practice-title" className="text-xl font-black text-[#111111]">تمرين سريع</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">ابدأ تدريبًا متنوعًا من المستوى المختار.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[5, 10, 15, 20].map((count) => (
          <button
            key={count}
            type="button"
            disabled={available < count}
            onClick={() => onStart(count)}
            className="brand-focus min-h-11 rounded-md border border-slate-300 bg-white px-4 font-bold text-slate-700 transition hover:border-[#d71920] hover:text-[#d71920] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {count} سؤالًا
          </button>
        ))}
        <button
          type="button"
          onClick={onCustomize}
          className="brand-focus inline-flex min-h-11 items-center gap-2 rounded-md bg-[#111111] px-4 font-bold text-white transition hover:bg-black/85"
        >
          تخصيص التدريب <ArrowDown size={17} aria-hidden="true" />
        </button>
      </div>
    </div>
  </section>
);

export default ExerciseQuickPractice;

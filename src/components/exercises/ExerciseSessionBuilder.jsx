import React, { useEffect, useMemo, useState } from 'react';
import { Play, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ExerciseEmptyState from '@/components/exercises/ExerciseEmptyState';

const ExerciseSessionBuilder = ({ sourceKey, level, sourceLabel, available, onStart, children }) => {
  const countOptions = useMemo(() => {
    const regular = [5, 10, 15, 20].filter((count) => count <= available);
    if (available <= 100) return [...regular, 'all'];
    return [...regular, 50];
  }, [available]);
  const defaultCount = countOptions.includes(10) ? 10 : countOptions[0];
  const [selectedCount, setSelectedCount] = useState(defaultCount);

  useEffect(() => {
    setSelectedCount(defaultCount);
  }, [defaultCount, sourceKey]);

  if (available === 0) return <ExerciseEmptyState message="لا توجد تمارين منشورة لهذا الاختيار." />;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="session-builder-title">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700">
          <SlidersHorizontal size={21} aria-hidden="true" />
        </span>
        <div>
          <h2 id="session-builder-title" className="text-xl font-black text-[#111111]">إعداد جلسة التدريب</h2>
          <p className="mt-1 text-sm text-slate-600">المستوى {level} · {sourceLabel} · {available} تمرين متاح</p>
        </div>
      </div>

      {children && <div className="mt-6 border-t border-slate-100 pt-5">{children}</div>}

      <fieldset className="mt-6 border-t border-slate-100 pt-5">
        <legend className="mb-3 font-black text-slate-800">عدد الأسئلة</legend>
        <div className="flex flex-wrap gap-2">
          {countOptions.map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => setSelectedCount(count)}
              className={cn(
                'brand-focus min-h-11 min-w-20 rounded-md border px-4 font-bold transition',
                selectedCount === count
                  ? 'border-[#d71920] bg-[#d71920] text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-[#d71920]',
              )}
            >
              {count === 'all' ? `الكل (${available})` : `${count} سؤالًا`}
            </button>
          ))}
        </div>
        {available > 100 && <p className="mt-3 text-sm text-slate-500">الحد الأقصى للجلسة العامة 50 سؤالًا.</p>}
      </fieldset>

      <Button
        type="button"
        onClick={() => onStart(selectedCount === 'all' ? available : selectedCount)}
        className="mt-6 min-h-12 w-full gap-2 rounded-md bg-[#111111] text-base font-black text-white hover:bg-[#d71920]"
      >
        <Play size={18} aria-hidden="true" /> ابدأ التمرين
      </Button>
    </section>
  );
};

export default ExerciseSessionBuilder;

import React from 'react';
import { ArrowLeft, BookOpen, Languages } from 'lucide-react';
import BidiText from '@/components/common/BidiText';
import ExerciseEmptyState from '@/components/exercises/ExerciseEmptyState';

const ExerciseUnitsView = ({ units, onSelect }) => {
  if (units.length === 0) return <ExerciseEmptyState message="لا توجد وحدات تحتوي تمارين منشورة في هذا المستوى." />;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {units.map((unit) => {
        const readingAndCommunication = (unit.skillCounts.reading || 0) + (unit.skillCounts.communication || 0);
        const unitCode = unit.key === 'general' ? 'عام' : unit.key;
        return (
          <article key={unit.key} className="flex min-h-[280px] flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-red-200 hover:shadow-md">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex rounded-md bg-red-50 px-3 py-1 text-sm font-black text-[#d71920]">{unit.key === 'general' ? 'تدريب عام' : `الوحدة ${unitCode}`}</span>
              <BookOpen className="h-5 w-5 text-[#e6ad19]" aria-hidden="true" />
            </div>
            <div className="mt-4 min-h-20">
              <h3 className="text-xl font-black leading-8 text-[#111111]">{unit.unitTitleAr || `الوحدة ${unitCode}`}</h3>
              {unit.unitTitleDe && <BidiText as="p" text={unit.unitTitleDe} className="mt-1 text-sm font-bold text-slate-500" />}
            </div>
            <p className="mt-3 flex items-center gap-2 font-bold text-slate-700"><Languages size={17} aria-hidden="true" /> {unit.count} تمرين</p>
            <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center text-sm">
              <div><dt className="text-slate-500">مفردات</dt><dd className="font-black text-slate-800">{unit.skillCounts.vocabulary || 0}</dd></div>
              <div><dt className="text-slate-500">قواعد</dt><dd className="font-black text-slate-800">{unit.skillCounts.grammar || 0}</dd></div>
              <div><dt className="text-slate-500">قراءة وتواصل</dt><dd className="font-black text-slate-800">{readingAndCommunication}</dd></div>
            </dl>
            <button
              type="button"
              onClick={() => onSelect(unit.key)}
              className="brand-focus mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#111111] px-4 font-bold text-white transition hover:bg-[#d71920]"
            >
              فتح الوحدة <ArrowLeft size={17} aria-hidden="true" />
            </button>
          </article>
        );
      })}
    </div>
  );
};

export default ExerciseUnitsView;

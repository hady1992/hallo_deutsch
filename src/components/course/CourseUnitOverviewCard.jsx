import React from 'react';
import { ArrowLeft, BookOpen, CheckCircle2, Layers3 } from 'lucide-react';
import { Link } from 'react-router-dom';

const CourseUnitOverviewCard = ({ unit, level, completedCount = 0 }) => (
  <Link
    to={`/level/${level.toLowerCase()}?unit=${encodeURIComponent(unit.unit)}`}
    className="brand-focus group flex min-h-[230px] min-w-0 flex-col justify-between rounded-lg border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#d71920]/50 hover:shadow-md sm:p-6"
  >
    <div className="min-w-0">
      <div className="mb-5 flex items-center justify-between gap-3">
        <span dir="ltr" className="german-text rounded-md bg-[#111111] px-3 py-1.5 text-sm font-black text-white">{unit.unit}</span>
        <Layers3 size={22} className="text-[#d71920]" />
      </div>
      <h2 className="text-xl font-black leading-8 text-[#111111]">{unit.unitTitleAr || unit.unit}</h2>
      {unit.unitTitleDe && (
        <p dir="ltr" className="german-text mt-2 font-bold leading-7 text-[#b08000]">{unit.unitTitleDe}</p>
      )}
    </div>

    <div className="mt-6 border-t border-black/10 pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-bold text-slate-600">
        <span className="inline-flex items-center gap-2"><BookOpen size={16} /> {unit.lessons.length} درس</span>
        {completedCount > 0 && (
          <span className="inline-flex items-center gap-1.5 text-emerald-700"><CheckCircle2 size={16} /> {completedCount} مكتمل</span>
        )}
      </div>
      <span className="mt-4 inline-flex items-center gap-2 font-black text-[#b91218]">
        عرض دروس الوحدة <ArrowLeft size={17} className="transition-transform group-hover:-translate-x-1" />
      </span>
    </div>
  </Link>
);

export default CourseUnitOverviewCard;


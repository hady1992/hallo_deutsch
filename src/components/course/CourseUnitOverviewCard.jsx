import React from 'react';
import { ArrowLeft, BookOpen, CheckCircle2, Layers3 } from 'lucide-react';
import { Link } from 'react-router-dom';

const CourseUnitOverviewCard = ({ unit, level, completedCount = 0 }) => {
  const progressPercent = unit.lessons.length > 0 ? Math.round((completedCount / unit.lessons.length) * 100) : 0;

  return (
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
        <span className={`inline-flex items-center gap-1.5 ${completedCount > 0 ? 'text-emerald-700' : 'text-slate-500'}`}><CheckCircle2 size={16} /> {completedCount} من {unit.lessons.length}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-red-100" role="progressbar" aria-label={`تقدم الوحدة ${progressPercent}%`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={progressPercent} dir="ltr">
        <span className="block h-full rounded-full bg-[#d71920]" style={{ width: `${progressPercent}%` }} />
      </div>
      <span className="mt-4 inline-flex items-center gap-2 font-black text-[#b91218]">
        فتح المسار <ArrowLeft size={17} className="transition-transform group-hover:-translate-x-1" />
      </span>
    </div>
  </Link>
  );
};

export default CourseUnitOverviewCard;


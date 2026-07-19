import React from 'react';
import { ArrowLeft, BookOpen, CheckCircle2, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import BidiText from '@/components/common/BidiText';

const lessonPath = (level, lesson) => `/level/${level.toLowerCase()}/lesson/${encodeURIComponent(lesson.slug)}`;

const CourseUnitPathHeader = ({ unit, level, path }) => {
  const actionLesson = path.continueLesson || path.lessons[0];

  return (
    <header className="rounded-lg border border-black/10 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div className="min-w-0">
          <span dir="ltr" className="german-text inline-flex rounded-md bg-[#111111] px-3 py-1.5 text-sm font-black text-white">{unit.unit}</span>
          <h2 className="mt-4 text-2xl font-black leading-tight text-[#111111] sm:text-3xl">{unit.unitTitleAr || unit.unit}</h2>
          {unit.unitTitleDe && <BidiText as="p" text={unit.unitTitleDe} className="mt-2 text-base font-bold text-[#b08000]" />}
        </div>

        {actionLesson && (
          <Link
            to={lessonPath(level, actionLesson)}
            className="brand-focus inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-[#d71920] px-6 font-black text-white transition-colors hover:bg-[#b91218]"
          >
            {path.isCompleted ? 'مراجعة الوحدة' : 'متابعة التعلّم'} <ArrowLeft size={18} aria-hidden="true" />
          </Link>
        )}
      </div>

      <div className="mt-7 grid gap-5 border-t border-black/10 pt-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <div className="mb-2 flex items-center justify-between gap-3 text-sm font-bold text-slate-600">
            <span>تقدم الوحدة</span>
            <span>{path.progressPercent}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-red-100" role="progressbar" aria-label={`تقدم الوحدة ${path.progressPercent}%`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={path.progressPercent} dir="ltr">
            <div className="h-full rounded-full bg-[#d71920] transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${path.progressPercent}%` }} />
          </div>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-bold text-slate-600">
          <span className="inline-flex items-center gap-2"><BookOpen size={17} className="text-[#d71920]" aria-hidden="true" /> {path.lessons.length} درس</span>
          <span className="inline-flex items-center gap-2"><CheckCircle2 size={17} className="text-emerald-700" aria-hidden="true" /> {path.completedCount} مكتمل</span>
          {path.totalMinutes > 0 && <span className="inline-flex items-center gap-2"><Clock3 size={17} className="text-[#b08000]" aria-hidden="true" /> {path.totalMinutes} دقيقة</span>}
        </div>
      </div>
    </header>
  );
};

export default CourseUnitPathHeader;

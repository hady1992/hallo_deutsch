import React from 'react';
import { ArrowLeft, Award, BookOpen, Dumbbell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getUnitExercisesPath } from '@/utils/courseLearningPath';

const CourseUnitCompletionCard = ({ unit, level, path }) => {
  const continuePath = path.continueLesson
    ? `/level/${level.toLowerCase()}/lesson/${encodeURIComponent(path.continueLesson.slug)}`
    : `/level/${level.toLowerCase()}`;

  return (
    <section className={`mt-8 rounded-lg border p-5 text-center shadow-sm sm:p-7 ${path.isCompleted ? 'border-emerald-200 bg-emerald-50' : 'border-black/10 bg-white'}`}>
      <span className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${path.isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-50 text-[#b08000]'}`}>
        {path.isCompleted ? <Award size={25} aria-hidden="true" /> : <BookOpen size={24} aria-hidden="true" />}
      </span>
      <h3 className="mt-4 text-xl font-black text-[#111111]">{path.isCompleted ? 'أكملت مسار الوحدة' : 'تابع مسار الوحدة'}</h3>
      <p className="mx-auto mt-2 max-w-xl leading-7 text-slate-600">
        {path.isCompleted
          ? 'أتممت جميع دروس هذه الوحدة. راجع ما تعلمته من خلال تمارين الوحدة.'
          : `تبقّى ${path.remainingCount} من الدروس لإكمال الوحدة. تابع من الدرس المقترح عندما تكون جاهزًا.`}
      </p>

      <Link
        to={path.isCompleted ? getUnitExercisesPath(level, unit.unit) : continuePath}
        className={`brand-focus mx-auto mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 font-black text-white ${path.isCompleted ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-[#111111] hover:bg-[#d71920]'}`}
      >
        {path.isCompleted ? <Dumbbell size={18} aria-hidden="true" /> : <ArrowLeft size={18} aria-hidden="true" />}
        {path.isCompleted ? 'تدريب على الوحدة' : 'متابعة التعلّم'}
      </Link>
    </section>
  );
};

export default CourseUnitCompletionCard;

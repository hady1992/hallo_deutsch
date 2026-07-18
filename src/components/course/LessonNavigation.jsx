import React from 'react';
import { ArrowLeft, ArrowRight, Check, Dumbbell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const LessonNavigation = ({ previousLesson, nextLesson, level, lesson, completed, onComplete }) => {
  const lessonPath = (item) => `/level/${level.toLowerCase()}/lesson/${encodeURIComponent(item.slug)}`;
  const exercisesPath = `/exercises?level=${encodeURIComponent(level)}&unit=${encodeURIComponent(lesson.unit || '')}&lesson=${encodeURIComponent(lesson.exerciseLessonId || lesson.id || '')}`;

  return (
    <div className="space-y-4 border-t border-black/10 pt-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild className="min-h-11 flex-1 gap-2 bg-[#111111] text-white hover:bg-black/85">
          <Link to={exercisesPath}><Dumbbell size={18} /> ابدأ تمارين الدرس</Link>
        </Button>
        <Button
          type="button"
          onClick={onComplete}
          disabled={completed}
          variant={completed ? 'secondary' : 'default'}
          className="min-h-11 flex-1 gap-2"
        >
          <Check size={18} /> {completed ? 'تم إكمال الدرس' : 'تحديد كمكتمل'}
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {previousLesson ? (
          <Link to={lessonPath(previousLesson)} className="brand-focus rounded-lg border border-black/10 bg-white p-4 hover:border-[#d71920]/40">
            <span className="flex items-center gap-2 text-xs font-bold text-slate-500"><ArrowRight size={15} /> الدرس السابق</span>
            <strong className="mt-1 block text-[#111111]">{previousLesson.title}</strong>
          </Link>
        ) : <span />}
        {nextLesson && (
          <Link to={lessonPath(nextLesson)} className="brand-focus rounded-lg border border-black/10 bg-white p-4 text-left hover:border-[#d71920]/40">
            <span className="flex items-center justify-end gap-2 text-xs font-bold text-slate-500">الدرس التالي <ArrowLeft size={15} /></span>
            <strong className="mt-1 block text-[#111111]">{nextLesson.title}</strong>
          </Link>
        )}
      </div>
    </div>
  );
};

export default LessonNavigation;

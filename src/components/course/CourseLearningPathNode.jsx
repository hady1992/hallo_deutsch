import React from 'react';
import { Check, Circle, Clock3, Play, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import BidiText from '@/components/common/BidiText';
import { cn } from '@/lib/utils';

const STATUS = {
  completed: {
    label: 'مكتمل',
    action: 'راجع',
    Icon: Check,
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    circle: 'border-emerald-600 bg-emerald-600 text-white',
  },
  started: {
    label: 'قيد التعلّم',
    action: 'تابع',
    Icon: Play,
    badge: 'border-red-200 bg-red-50 text-[#b91218]',
    circle: 'border-[#d71920] bg-white text-[#b91218]',
  },
  'not-started': {
    label: 'لم يبدأ',
    action: 'ابدأ',
    Icon: Circle,
    badge: 'border-slate-200 bg-slate-50 text-slate-600',
    circle: 'border-slate-300 bg-white text-slate-700',
  },
};

const CourseLearningPathNode = ({ lesson, level, index, previousCompleted, suggested }) => {
  const state = STATUS[lesson.status] || STATUS['not-started'];
  const StatusIcon = state.Icon;
  const path = `/level/${level.toLowerCase()}/lesson/${encodeURIComponent(lesson.slug)}`;
  const progressStyle = lesson.status === 'started' && Number.isFinite(lesson.progressPercent)
    ? { background: `conic-gradient(#d71920 ${lesson.progressPercent}%, #fecaca ${lesson.progressPercent}% 100%)` }
    : undefined;

  return (
    <article className="relative grid min-w-0 grid-cols-[52px_minmax(0,1fr)] items-center gap-3 py-4 md:grid-cols-[minmax(0,1fr)_76px_minmax(0,1fr)] md:gap-5 md:py-6" dir="ltr">
      {index > 0 && previousCompleted && <span className="absolute left-[25px] top-0 h-1/2 w-0.5 bg-emerald-500 md:left-1/2 md:-translate-x-1/2" aria-hidden="true" />}

      <div className="relative z-10 col-start-1 row-start-1 flex justify-center md:col-start-2">
        <Link
          to={path}
          aria-label={`الدرس ${index + 1}: ${lesson.title}، ${state.label}`}
          style={progressStyle}
          className={cn(
            'brand-focus flex h-12 w-12 items-center justify-center rounded-full border-2 p-1 shadow-sm transition-transform hover:scale-105 motion-reduce:transform-none md:h-14 md:w-14',
            lesson.status === 'started' && lesson.progressPercent !== null ? 'border-transparent' : state.circle,
            suggested && 'ring-4 ring-red-100 motion-safe:animate-[pulse_2.5s_ease-in-out_infinite]',
          )}
        >
          <span className={cn(
            'flex h-full w-full items-center justify-center rounded-full text-sm font-black',
            lesson.status === 'started' && lesson.progressPercent !== null ? 'bg-white text-[#b91218]' : '',
          )}>
            {lesson.status === 'completed' ? <Check size={22} aria-hidden="true" /> : index + 1}
          </span>
        </Link>
      </div>

      <Link
        to={path}
        className={cn(
          'brand-focus group col-start-2 row-start-1 min-w-0 rounded-lg border bg-white p-4 text-right shadow-sm transition hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none sm:p-5 md:col-span-1',
          index % 2 === 0 ? 'md:col-start-3' : 'md:col-start-1',
          suggested ? 'border-red-200 shadow-[0_8px_24px_rgba(215,25,32,0.10)]' : 'border-black/10 hover:border-[#d71920]/40',
        )}
        dir="rtl"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={cn('inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-bold', state.badge)}>
            <StatusIcon size={14} aria-hidden="true" /> {state.label}
          </span>
          {lesson.estimatedMinutes > 0 && <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500"><Clock3 size={14} aria-hidden="true" /> {lesson.estimatedMinutes} دقيقة</span>}
        </div>

        <h3 className="mt-3 text-lg font-black leading-7 text-[#111111]">{lesson.title}</h3>
        {lesson.germanTitle && <BidiText as="p" text={lesson.germanTitle} className="mt-1 text-sm font-bold text-[#b08000]" />}

        {lesson.stepProgress && lesson.status === 'started' && (
          <p className="mt-3 text-sm font-bold text-slate-500">
            {lesson.stepProgress.completed} من {lesson.stepProgress.total} خطوة
            {lesson.progressPercent !== null && ` · ${lesson.progressPercent}%`}
          </p>
        )}

        <span className="mt-4 inline-flex items-center gap-2 text-sm font-black text-[#b91218]">
          {lesson.status === 'completed' ? <RotateCcw size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
          {state.action}
        </span>
      </Link>
    </article>
  );
};

export default CourseLearningPathNode;

import React from 'react';
import { ArrowLeft, CheckCircle2, Circle, Clock3, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const STATUS = {
  completed: { label: 'مكتمل', icon: CheckCircle2, className: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  started: { label: 'قيد التعلّم', icon: PlayCircle, className: 'text-amber-800 bg-amber-50 border-amber-200' },
  'not-started': { label: 'لم يبدأ', icon: Circle, className: 'text-slate-600 bg-slate-50 border-slate-200' },
};

const CourseLessonCard = ({ lesson, level, status }) => {
  const state = STATUS[status] || STATUS['not-started'];
  const StatusIcon = state.icon;

  return (
    <Link
      to={`/level/${level.toLowerCase()}/lesson/${encodeURIComponent(lesson.slug)}`}
      className="brand-focus group flex min-h-[154px] flex-col justify-between rounded-lg border border-black/10 bg-white p-5 shadow-sm transition-colors hover:border-[#d71920]/50"
    >
      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-bold ${state.className}`}>
            <StatusIcon size={14} />
            {state.label}
          </span>
          {lesson.estimatedMinutes > 0 && (
            <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
              <Clock3 size={14} /> {lesson.estimatedMinutes} دقيقة
            </span>
          )}
        </div>
        <h3 className="text-lg font-black leading-7 text-[#111111]">{lesson.title}</h3>
      </div>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#b91218]">
        فتح الدرس <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
      </span>
    </Link>
  );
};

export default CourseLessonCard;

import React from 'react';
import { CheckCircle2, List, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const SidebarLinks = ({ lessons, currentLessonId, level }) => (
  <div className="space-y-1.5">
    {lessons.map((lesson) => {
      const current = lesson.id === currentLessonId;
      return (
        <Link
          key={lesson.id}
          to={`/level/${level.toLowerCase()}/lesson/${encodeURIComponent(lesson.slug)}`}
          aria-current={current ? 'page' : undefined}
          className={`brand-focus flex min-h-11 items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-bold ${
            current ? 'bg-red-50 text-[#b91218]' : 'text-slate-600 hover:bg-slate-50 hover:text-[#111111]'
          }`}
        >
          <span className="line-clamp-2">{lesson.title}</span>
          {current ? <PlayCircle size={16} /> : <CheckCircle2 size={16} className="opacity-35" />}
        </Link>
      );
    })}
  </div>
);

const LessonSidebar = ({ lessons, currentLessonId, level, unitTitle }) => (
  <>
    <aside className="hidden self-start border-r border-black/10 pr-5 lg:sticky lg:top-24 lg:block">
      <h2 className="mb-3 flex items-center gap-2 font-black text-[#111111]">
        <List size={18} className="text-[#d71920]" />
        {unitTitle}
      </h2>
      <SidebarLinks lessons={lessons} currentLessonId={currentLessonId} level={level} />
    </aside>

    <details className="rounded-lg border border-black/10 bg-white p-4 lg:hidden">
      <summary className="cursor-pointer font-black text-[#111111]">دروس الوحدة: {unitTitle}</summary>
      <div className="mt-4 border-t border-black/10 pt-3">
        <SidebarLinks lessons={lessons} currentLessonId={currentLessonId} level={level} />
      </div>
    </details>
  </>
);

export default LessonSidebar;

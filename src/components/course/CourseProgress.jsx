import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const CourseProgress = ({ value, completed, total }) => (
  <div className="space-y-2" aria-label={`التقدم ${value}%`}>
    <div className="flex items-center justify-between gap-3 text-sm font-bold">
      <span className="flex items-center gap-2 text-slate-700">
        <CheckCircle2 size={17} className="text-[#d71920]" />
        تقدم المستوى
      </span>
      <span className="text-slate-500">{completed} من {total} مكتمل</span>
    </div>
    <div className="h-2.5 overflow-hidden rounded-full bg-red-100" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={value}>
      <div className="h-full bg-[#d71920] transition-[width] duration-300" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  </div>
);

export default CourseProgress;

import React from 'react';
import { Blocks, GraduationCap, Tags } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { key: 'units', label: 'حسب الوحدة', icon: Blocks },
  { key: 'skills', label: 'حسب المهارة', icon: GraduationCap },
  { key: 'topics', label: 'حسب الموضوع', icon: Tags },
];

const ExercisesBrowseTabs = ({ value, onChange }) => (
  <div className="overflow-x-auto pb-1" role="tablist" aria-label="طرق تصفح التمارين">
    <div className="inline-flex min-w-full rounded-lg border border-slate-200 bg-white p-1 sm:min-w-0">
      {TABS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={value === key}
          onClick={() => onChange(key)}
          className={cn(
            'brand-focus inline-flex min-h-11 min-w-[145px] flex-1 items-center justify-center gap-2 rounded-md px-4 font-bold transition',
            value === key ? 'bg-[#111111] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-[#111111]',
          )}
        >
          <Icon size={18} aria-hidden="true" /> {label}
        </button>
      ))}
    </div>
  </div>
);

export default ExercisesBrowseTabs;

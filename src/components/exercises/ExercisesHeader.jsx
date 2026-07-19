import React from 'react';
import { BarChart3, Blocks, GraduationCap, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ExercisesHeader = ({ level, total, unitsCount, skillsCount, onChangeLevel, lessonMode = false }) => {
  const stats = [
    { label: 'تمرين في المستوى', value: total, icon: BarChart3 },
    { label: 'وحدة متاحة', value: unitsCount, icon: Blocks },
    { label: 'مهارة متاحة', value: skillsCount, icon: GraduationCap },
  ];

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <span className="inline-flex min-h-9 items-center rounded-md bg-[#111111] px-3 text-sm font-black text-white">{level}</span>
              {!lessonMode && (
                <Button type="button" variant="outline" onClick={onChangeLevel} className="min-h-9 gap-2 rounded-md">
                  <RefreshCw size={16} aria-hidden="true" /> تغيير المستوى
                </Button>
              )}
            </div>
            <h1 className="text-3xl font-black text-[#111111] sm:text-4xl">{lessonMode ? 'تمارين الدرس' : 'التمارين التفاعلية'}</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
              {lessonMode
                ? 'اختر عدد الأسئلة وابدأ تدريبًا مرتبطًا مباشرة بهذا الدرس.'
                : 'تدرّب حسب الوحدة أو المهارة أو القاعدة، واختر عدد الأسئلة المناسب لوقتك.'}
            </p>
          </div>

          <div className="grid grid-cols-1 divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 sm:grid-cols-3 sm:divide-x sm:divide-x-reverse sm:divide-y-0 lg:min-w-[520px]">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex min-h-20 items-center gap-3 px-4 py-3">
                <Icon className="h-5 w-5 shrink-0 text-[#d71920]" aria-hidden="true" />
                <div>
                  <strong className="block text-xl font-black text-[#111111]">{value}</strong>
                  <span className="text-sm text-slate-500">{label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default ExercisesHeader;

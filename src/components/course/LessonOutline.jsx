import React from 'react';
import { Check, List, X } from 'lucide-react';

const OutlineItems = ({ steps, currentStepId, completedStepIds, onSelect }) => (
  <ol className="space-y-1.5">
    {steps.map((step, index) => {
      const current = step.id === currentStepId;
      const completed = completedStepIds.includes(step.id);
      return (
        <li key={step.id}>
          <button
            type="button"
            onClick={() => onSelect(step.id)}
            aria-current={current ? 'step' : undefined}
            className={`brand-focus flex min-h-11 w-full items-center gap-3 rounded-md px-3 py-2 text-right text-sm font-bold transition ${
              current
                ? 'bg-[#d71920] text-white'
                : completed
                  ? 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                  : 'text-slate-500 hover:bg-black/[0.04] hover:text-[#111111]'
            }`}
          >
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
              current ? 'bg-white/20' : completed ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {completed && !current ? <Check size={14} /> : index + 1}
            </span>
            <span className="min-w-0 leading-5">{step.title}</span>
          </button>
        </li>
      );
    })}
  </ol>
);

const LessonOutline = ({
  steps,
  currentStepId,
  completedStepIds,
  mobileOpen,
  onMobileOpen,
  onMobileClose,
  onSelect,
}) => {
  const selectFromMobile = (stepId) => {
    onSelect(stepId);
    onMobileClose();
  };

  return (
    <>
      <button
        type="button"
        onClick={onMobileOpen}
        className="brand-focus mb-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-4 font-black text-[#111111] lg:hidden"
      >
        <List size={19} className="text-[#d71920]" />
        محتويات الدرس
      </button>

      <aside className="sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-y-auto rounded-lg border border-black/10 bg-white p-4 lg:block">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-[#111111]">
          <List size={19} className="text-[#d71920]" />
          محتويات الدرس
        </h2>
        <OutlineItems
          steps={steps}
          currentStepId={currentStepId}
          completedStepIds={completedStepIds}
          onSelect={onSelect}
        />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden" role="dialog" aria-modal="true" aria-label="محتويات الدرس">
          <button type="button" aria-label="إغلاق محتويات الدرس" onClick={onMobileClose} className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto rounded-t-lg bg-[#fcfaf6] p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-lg font-black text-[#111111]">
                <List size={19} className="text-[#d71920]" />
                محتويات الدرس
              </h2>
              <button type="button" onClick={onMobileClose} aria-label="إغلاق" className="brand-focus flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600">
                <X size={20} />
              </button>
            </div>
            <OutlineItems
              steps={steps}
              currentStepId={currentStepId}
              completedStepIds={completedStepIds}
              onSelect={selectFromMobile}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default LessonOutline;


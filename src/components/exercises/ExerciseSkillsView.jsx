import React from 'react';
import { ArrowLeft, BookText, Ear, Languages, MessageCircle, Puzzle, SpellCheck } from 'lucide-react';
import ExerciseEmptyState from '@/components/exercises/ExerciseEmptyState';

const SKILL_ICONS = {
  vocabulary: Languages,
  grammar: SpellCheck,
  reading: BookText,
  listening: Ear,
  communication: MessageCircle,
  mixed: Puzzle,
};

const ExerciseSkillsView = ({ skills, onSelect }) => {
  if (skills.length === 0) return <ExerciseEmptyState message="لا توجد تمارين منشورة لهذه المهارات." />;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {skills.map((skill) => {
        const Icon = SKILL_ICONS[skill.key] || Puzzle;
        return (
          <article key={skill.key} className="flex min-h-[240px] flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-yellow-300 hover:shadow-md">
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-yellow-50 text-[#b08000]">
              <Icon size={22} aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-xl font-black text-[#111111]">{skill.label}</h3>
            <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{skill.description}</p>
            <p className="my-4 font-black text-slate-800">{skill.count} تمرين</p>
            <button
              type="button"
              onClick={() => onSelect(skill.key)}
              className="brand-focus inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 font-bold text-slate-800 transition hover:border-[#d71920] hover:text-[#d71920]"
            >
              اختيار التدريب <ArrowLeft size={17} aria-hidden="true" />
            </button>
          </article>
        );
      })}
    </div>
  );
};

export default ExerciseSkillsView;

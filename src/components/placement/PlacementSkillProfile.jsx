import React from 'react';

const PlacementSkillProfile = ({ skills }) => (
  <section aria-labelledby="placement-skills-heading">
    <h2 id="placement-skills-heading" className="text-xl font-black text-[#111111]">ملف المهارات</h2>
    <div className="mt-4 grid gap-5 md:grid-cols-3">
      {skills.map((skill) => (
        <article key={skill.skill} className="rounded-md border border-black/10 bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-black text-slate-800">{skill.label}</h3>
            <span className="font-black text-[#b91218]">{skill.percentage}%</span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/10">
            <div className="h-full bg-[#d71920]" style={{ width: `${skill.percentage}%` }} />
          </div>
          <p className="mt-3 text-sm font-bold text-slate-600">{skill.correct} صحيحة من {skill.total}</p>
          <p className="mt-1 text-sm text-slate-500">{skill.assessment}</p>
        </article>
      ))}
    </div>
  </section>
);

export default PlacementSkillProfile;

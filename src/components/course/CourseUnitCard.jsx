import React from 'react';
import CourseLessonCard from '@/components/course/CourseLessonCard';

const CourseUnitCard = ({ unit, level, getStatus }) => (
  <section className="border-t-2 border-[#e8b21e] pt-5">
    <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        <p dir="ltr" className="german-text text-sm font-black text-[#b91218]">{unit.unit}</p>
        <h2 className="mt-1 text-2xl font-black text-[#111111]">{unit.unitTitleAr || unit.unit}</h2>
        {unit.unitTitleDe && <p dir="ltr" className="german-text mt-1 font-bold text-[#b08000]">{unit.unitTitleDe}</p>}
      </div>
      <span className="text-sm font-bold text-slate-500">{unit.lessons.length} درس</span>
    </div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {unit.lessons.map((lesson) => (
        <CourseLessonCard
          key={lesson.id}
          lesson={lesson}
          level={level}
          status={getStatus(lesson.id)}
        />
      ))}
    </div>
  </section>
);

export default CourseUnitCard;

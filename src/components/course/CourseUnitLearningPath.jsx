import React, { useMemo } from 'react';
import CourseLearningPathNode from '@/components/course/CourseLearningPathNode';
import CourseUnitCompletionCard from '@/components/course/CourseUnitCompletionCard';
import CourseUnitPathHeader from '@/components/course/CourseUnitPathHeader';
import { buildUnitLearningPath } from '@/utils/courseLearningPath';
import { buildLessonSteps } from '@/utils/lessonSteps';
import { getLessonStepProgress } from '@/utils/lessonStepProgress';

const getStepInfo = (lesson) => {
  const { steps } = buildLessonSteps(lesson);
  const lessonKey = `${lesson.slug || lesson.supabaseId || lesson.id || 'lesson'}-lesson`;
  const stored = getLessonStepProgress(lessonKey);
  const validIds = new Set(steps.map((step) => step.id));
  const completedIds = stored.completedStepIds.filter((stepId) => validIds.has(stepId));
  const currentIndex = steps.findIndex((step) => step.id === stored.currentStepId);
  const hasKnownProgress = completedIds.length > 0 || currentIndex >= 0;
  const hasOnlyUnknownProgress = stored.completedStepIds.length > 0 && completedIds.length === 0 && currentIndex < 0;

  return {
    reliable: hasKnownProgress && !hasOnlyUnknownProgress,
    completedSteps: completedIds.length,
    totalSteps: steps.length,
    currentStep: currentIndex >= 0 ? currentIndex + 1 : 0,
    currentStepId: currentIndex >= 0 ? stored.currentStepId : '',
  };
};

const CourseUnitLearningPath = ({ unit, level, progress }) => {
  const path = useMemo(() => buildUnitLearningPath({
    lessons: unit.lessons,
    courseProgress: progress,
    getStepInfo,
  }), [progress, unit.lessons]);
  const suggestedId = path.continueLesson?.supabaseId || path.continueLesson?.id || path.continueLesson?.slug;

  return (
    <section aria-label={`مسار دروس ${unit.unitTitleAr || unit.unit}`}>
      <CourseUnitPathHeader unit={unit} level={level} path={path} />

      <div className="relative mx-auto mt-8 max-w-5xl" dir="ltr">
        {path.lessons.length > 1 && <span className="absolute bottom-12 left-[25px] top-12 w-0.5 bg-slate-200 md:left-1/2 md:-translate-x-1/2" aria-hidden="true" />}
        {path.lessons.map((lesson, index) => (
          <CourseLearningPathNode
            key={lesson.lessonId || lesson.slug}
            lesson={lesson}
            level={level}
            index={index}
            previousCompleted={index > 0 && path.lessons[index - 1].status === 'completed'}
            suggested={lesson.lessonId === suggestedId && !path.isCompleted}
          />
        ))}
      </div>

      <CourseUnitCompletionCard unit={unit} level={level} path={path} />
    </section>
  );
};

export default CourseUnitLearningPath;

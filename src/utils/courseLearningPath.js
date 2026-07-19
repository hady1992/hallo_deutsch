const asArray = (value) => (Array.isArray(value) ? value : []);

const asOrder = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : Number.MAX_SAFE_INTEGER;
};
const lessonId = (lesson) => lesson?.supabaseId || lesson?.id || lesson?.slug || '';

export const sortLearningPathLessons = (lessons) => [...asArray(lessons)].sort((a, b) => (
  asOrder(a?.order) - asOrder(b?.order)
  || String(a?.title || '').localeCompare(String(b?.title || ''), 'ar')
));

export const getUnitExercisesPath = (level, unit) => (
  `/exercises?level=${encodeURIComponent(String(level || '').toUpperCase())}&view=units&unit=${encodeURIComponent(unit || '')}`
);

const buildLessonProgress = (lesson, courseProgress, stepInfo) => {
  const id = lessonId(lesson);
  const completedIds = asArray(courseProgress?.completedLessonIds);
  const startedIds = asArray(courseProgress?.startedLessonIds);
  const isCompleted = Boolean(id && completedIds.includes(id));
  const hasStepActivity = Boolean(stepInfo?.currentStepId || stepInfo?.completedSteps > 0);
  const isStarted = !isCompleted && Boolean(id && startedIds.includes(id) || hasStepActivity);
  const status = isCompleted ? 'completed' : (isStarted ? 'started' : 'not-started');
  const hasReliableSteps = Boolean(
    stepInfo?.reliable
    && Number.isFinite(stepInfo?.totalSteps)
    && stepInfo.totalSteps > 0
    && Number.isFinite(stepInfo?.completedSteps)
    && stepInfo.completedSteps >= 0
    && stepInfo.completedSteps <= stepInfo.totalSteps
  );
  const completedSteps = isCompleted && hasReliableSteps ? stepInfo.totalSteps : stepInfo?.completedSteps;
  const progressPercent = isCompleted
    ? 100
    : (isStarted && hasReliableSteps
      ? Math.round((completedSteps / stepInfo.totalSteps) * 100)
      : null);

  return {
    ...lesson,
    lessonId: id,
    status,
    progressPercent,
    stepProgress: hasReliableSteps ? {
      completed: completedSteps,
      total: stepInfo.totalSteps,
      currentStep: stepInfo.currentStep || 0,
    } : null,
    locked: false,
  };
};

export const selectUnitContinueLesson = (lessons, courseProgress = {}) => {
  const ordered = sortLearningPathLessons(lessons);
  const completedIds = asArray(courseProgress.completedLessonIds);
  const startedIds = asArray(courseProgress.startedLessonIds);
  const unitLessonIds = new Set(ordered.map(lessonId).filter(Boolean));
  const level = String(ordered[0]?.level || '').toUpperCase();
  const lastLessonId = courseProgress.lastLessonIdByLevel?.[level];
  const lastStarted = ordered.find((lesson) => (
    lessonId(lesson) === lastLessonId
    && !completedIds.includes(lessonId(lesson))
  ));
  if (lastStarted) return lastStarted;

  const started = ordered.find((lesson) => (
    unitLessonIds.has(lessonId(lesson))
    && startedIds.includes(lessonId(lesson))
    && !completedIds.includes(lessonId(lesson))
  ));
  return started || ordered.find((lesson) => !completedIds.includes(lessonId(lesson))) || ordered[0] || null;
};

export const buildUnitLearningPath = ({ lessons, courseProgress = {}, getStepInfo = () => null }) => {
  const ordered = sortLearningPathLessons(lessons);
  const lessonModels = ordered.map((lesson) => buildLessonProgress(lesson, courseProgress, getStepInfo(lesson)));
  const completedCount = lessonModels.filter((lesson) => lesson.status === 'completed').length;
  const totalMinutes = lessonModels.reduce((total, lesson) => total + Math.max(0, Number(lesson.estimatedMinutes) || 0), 0);
  const progressPercent = lessonModels.length === 0 ? 0 : Math.round(
    lessonModels.reduce((total, lesson) => total + (lesson.progressPercent || 0), 0) / lessonModels.length
  );

  return {
    lessons: lessonModels,
    completedCount,
    remainingCount: Math.max(0, lessonModels.length - completedCount),
    totalMinutes,
    progressPercent,
    isCompleted: lessonModels.length > 0 && completedCount === lessonModels.length,
    continueLesson: selectUnitContinueLesson(ordered, courseProgress),
    hasHardLocks: lessonModels.some((lesson) => lesson.locked),
  };
};

export const LESSON_STEP_PROGRESS_KEY = 'hallo_lesson_step_progress_v1';

const asUniqueStrings = (value) => (
  Array.isArray(value) ? [...new Set(value.filter((item) => typeof item === 'string' && item))] : []
);

const readAllProgress = () => {
  if (typeof window === 'undefined') return {};
  try {
    const stored = JSON.parse(localStorage.getItem(LESSON_STEP_PROGRESS_KEY) || '{}');
    return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
  } catch {
    return {};
  }
};

const writeAllProgress = (progress) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LESSON_STEP_PROGRESS_KEY, JSON.stringify(progress));
};

export const getLessonStepProgress = (lessonKey) => {
  const stored = readAllProgress()[lessonKey] || {};
  return {
    currentStepId: typeof stored.currentStepId === 'string' ? stored.currentStepId : '',
    completedStepIds: asUniqueStrings(stored.completedStepIds),
    updatedAt: typeof stored.updatedAt === 'string' ? stored.updatedAt : '',
  };
};

export const saveLessonStepProgress = (lessonKey, nextProgress) => {
  if (!lessonKey) return getLessonStepProgress('');
  const progress = {
    currentStepId: typeof nextProgress.currentStepId === 'string' ? nextProgress.currentStepId : '',
    completedStepIds: asUniqueStrings(nextProgress.completedStepIds),
    updatedAt: new Date().toISOString(),
  };
  writeAllProgress({
    ...readAllProgress(),
    [lessonKey]: progress,
  });
  return progress;
};


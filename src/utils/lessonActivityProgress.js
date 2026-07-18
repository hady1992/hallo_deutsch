export const LESSON_ACTIVITY_PROGRESS_KEY = 'hallo_lesson_activity_progress_v1';

const isRecord = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const readAllProgress = () => {
  if (typeof window === 'undefined') return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(LESSON_ACTIVITY_PROGRESS_KEY) || '{}');
    return isRecord(parsed) ? parsed : {};
  } catch (error) {
    console.warn('[LessonActivityProgress] Ignoring invalid stored activity progress:', error);
    return {};
  }
};

const writeAllProgress = (progress) => {
  if (typeof window === 'undefined') return { success: false, error: 'التخزين المحلي غير متاح' };
  try {
    localStorage.setItem(LESSON_ACTIVITY_PROGRESS_KEY, JSON.stringify(progress));
    window.dispatchEvent(new Event('lessonActivityProgressUpdated'));
    return { success: true };
  } catch (error) {
    console.error('[LessonActivityProgress] Failed to save activity progress:', error);
    return { success: false, error: error.message || 'تعذر حفظ الإجابة محليًا' };
  }
};

const normalizeEntry = (entry) => ({
  answer: typeof entry?.answer === 'string' ? entry.answer : '',
  completed: entry?.completed === true,
  updatedAt: typeof entry?.updatedAt === 'string' ? entry.updatedAt : '',
});

export const getLessonActivitiesProgress = (lessonId) => {
  if (!lessonId) return {};
  const stored = readAllProgress()[lessonId];
  if (!isRecord(stored)) return {};
  return Object.fromEntries(
    Object.entries(stored)
      .filter(([activityId]) => Boolean(activityId))
      .map(([activityId, entry]) => [activityId, normalizeEntry(entry)])
  );
};

export const saveLessonActivityProgress = (lessonId, activityId, values) => {
  if (!lessonId || !activityId) return { success: false, error: 'معرّف الدرس أو النشاط غير صالح' };
  const allProgress = readAllProgress();
  const lessonProgress = isRecord(allProgress[lessonId]) ? allProgress[lessonId] : {};
  const entry = {
    answer: typeof values?.answer === 'string' ? values.answer : '',
    completed: values?.completed === true,
    updatedAt: new Date().toISOString(),
  };
  const result = writeAllProgress({
    ...allProgress,
    [lessonId]: {
      ...lessonProgress,
      [activityId]: entry,
    },
  });
  return { ...result, entry };
};

export const clearLessonActivityProgress = (lessonId, activityId) => {
  if (!lessonId || !activityId) return { success: false, error: 'معرّف الدرس أو النشاط غير صالح' };
  const allProgress = readAllProgress();
  const lessonProgress = { ...(isRecord(allProgress[lessonId]) ? allProgress[lessonId] : {}) };
  delete lessonProgress[activityId];
  const nextProgress = { ...allProgress };
  if (Object.keys(lessonProgress).length > 0) nextProgress[lessonId] = lessonProgress;
  else delete nextProgress[lessonId];
  return writeAllProgress(nextProgress);
};


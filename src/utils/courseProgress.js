export const COURSE_PROGRESS_KEY = 'hallo_course_progress_v1';

const EMPTY_PROGRESS = {
  completedLessonIds: [],
  lastLessonIdByLevel: {},
  startedLessonIds: [],
};
const uniqueStrings = (value) => (
  Array.isArray(value) ? [...new Set(value.filter((item) => typeof item === 'string' && item))] : []
);

export const getCourseProgress = () => {
  if (typeof window === 'undefined') return { ...EMPTY_PROGRESS };
  try {
    const stored = JSON.parse(localStorage.getItem(COURSE_PROGRESS_KEY) || '{}');
    return {
      completedLessonIds: uniqueStrings(stored.completedLessonIds),
      startedLessonIds: uniqueStrings(stored.startedLessonIds),
      lastLessonIdByLevel: stored.lastLessonIdByLevel && typeof stored.lastLessonIdByLevel === 'object'
        ? stored.lastLessonIdByLevel
        : {},
    };
  } catch {
    return { ...EMPTY_PROGRESS };
  }
};

const saveCourseProgress = (progress) => {
  localStorage.setItem(COURSE_PROGRESS_KEY, JSON.stringify(progress));
  window.dispatchEvent(new Event('courseProgressUpdated'));
  return progress;
};

export const markLessonStarted = (lessonId, level) => {
  if (!lessonId || !level) return getCourseProgress();
  const progress = getCourseProgress();
  return saveCourseProgress({
    ...progress,
    startedLessonIds: uniqueStrings([...progress.startedLessonIds, lessonId]),
    lastLessonIdByLevel: {
      ...progress.lastLessonIdByLevel,
      [String(level).toUpperCase()]: lessonId,
    },
  });
};

export const markLessonCompleted = (lessonId, level) => {
  if (!lessonId || !level) return getCourseProgress();
  const progress = getCourseProgress();
  return saveCourseProgress({
    ...progress,
    completedLessonIds: uniqueStrings([...progress.completedLessonIds, lessonId]),
    startedLessonIds: uniqueStrings([...progress.startedLessonIds, lessonId]),
    lastLessonIdByLevel: {
      ...progress.lastLessonIdByLevel,
      [String(level).toUpperCase()]: lessonId,
    },
  });
};

export const getLessonProgressStatus = (lessonId, progress = getCourseProgress()) => {
  if (progress.completedLessonIds.includes(lessonId)) return 'completed';
  if (progress.startedLessonIds.includes(lessonId)) return 'started';
  return 'not-started';
};

export const getCourseLessonId = (lesson) => lesson?.supabaseId || lesson?.id || '';

export const getLevelProgressPercent = (lessons, progress = getCourseProgress()) => {
  const lessonIds = (Array.isArray(lessons) ? lessons : []).map(getCourseLessonId).filter(Boolean);
  if (lessonIds.length === 0) return 0;
  const completed = lessonIds.filter((id) => progress.completedLessonIds.includes(id)).length;
  return Math.round((completed / lessonIds.length) * 100);
};

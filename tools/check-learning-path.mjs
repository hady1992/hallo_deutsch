import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import {
  buildUnitLearningPath,
  getUnitExercisesPath,
  selectUnitContinueLesson,
  sortLearningPathLessons,
} from '../src/utils/courseLearningPath.js';
import { getCourseLessonId, getLevelProgressPercent } from '../src/utils/courseProgress.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const lessons = [
  { id: 'lesson-3', slug: 'lesson-3', level: 'A1', order: 3, title: 'الدرس الثالث', estimatedMinutes: 12 },
  { id: 'lesson-1', slug: 'lesson-1', level: 'A1', order: 1, title: 'الدرس الأول', estimatedMinutes: 10 },
  { id: 'lesson-2', slug: 'lesson-2', level: 'A1', order: 2, title: 'الدرس الثاني', estimatedMinutes: 8 },
];

assert.deepEqual(sortLearningPathLessons(lessons).map((lesson) => lesson.id), ['lesson-1', 'lesson-2', 'lesson-3']);
assert.equal(getCourseLessonId({ id: 'content-id', supabaseId: 'cloud-id' }), 'cloud-id');
assert.equal(getLevelProgressPercent([{ id: 'content-id', supabaseId: 'cloud-id' }], {
  completedLessonIds: ['cloud-id'],
  startedLessonIds: ['cloud-id'],
  lastLessonIdByLevel: { A1: 'cloud-id' },
}), 100);

const emptyProgress = { completedLessonIds: [], startedLessonIds: [], lastLessonIdByLevel: {} };
assert.equal(selectUnitContinueLesson(lessons, emptyProgress)?.id, 'lesson-1');

const activeProgress = {
  completedLessonIds: ['lesson-1'],
  startedLessonIds: ['lesson-1', 'lesson-2'],
  lastLessonIdByLevel: { A1: 'lesson-2' },
};
assert.equal(selectUnitContinueLesson(lessons, activeProgress)?.id, 'lesson-2');

const activePath = buildUnitLearningPath({
  lessons,
  courseProgress: activeProgress,
  getStepInfo: (lesson) => lesson.id === 'lesson-2'
    ? { reliable: true, completedSteps: 2, totalSteps: 4, currentStep: 3, currentStepId: 'grammar' }
    : null,
});
assert.equal(activePath.lessons[0].status, 'completed');
assert.equal(activePath.lessons[1].status, 'started');
assert.equal(activePath.lessons[1].progressPercent, 50);
assert.equal(activePath.lessons[2].status, 'not-started');
assert.equal(activePath.hasHardLocks, false);

const completedPath = buildUnitLearningPath({
  lessons,
  courseProgress: {
    completedLessonIds: lessons.map((lesson) => lesson.id),
    startedLessonIds: lessons.map((lesson) => lesson.id),
    lastLessonIdByLevel: { A1: 'lesson-3' },
  },
});
assert.equal(completedPath.isCompleted, true);
assert.equal(completedPath.completedCount, 3);
assert.equal(completedPath.progressPercent, 100);
assert.equal(completedPath.hasHardLocks, false);
assert.equal(getUnitExercisesPath('a1', 'A1-01'), '/exercises?level=A1&view=units&unit=A1-01');

const appSource = readFileSync(resolve(root, 'src/App.jsx'), 'utf8');
assert.match(appSource, /path="\/grammar" element=\{<Navigate to="\/vocabulary\?tab=grammar" replace \/>\}/);

const navigationSource = readFileSync(resolve(root, 'src/components/Navigation.jsx'), 'utf8');
assert.match(navigationSource, /path: '\/vocabulary'/);
assert.doesNotMatch(navigationSource, /path: '\/grammar'/);

const vocabularySource = readFileSync(resolve(root, 'src/pages/Vocabulary.jsx'), 'utf8');
for (const tab of ['words', 'nouns', 'verbs', 'grammar']) {
  assert.match(vocabularySource, new RegExp(`TabsTrigger value="${tab}"`));
}

console.log('Unified library routing and course learning path checks passed.');

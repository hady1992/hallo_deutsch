import { normalizeLessonForDisplay } from '@/utils/lessonNormalizer';

const asArray = (value) => (Array.isArray(value) ? value : []);

const STEP_TITLES = {
  vocabulary: 'المفردات',
  grammar: 'القواعد',
  examples: 'الأمثلة',
  conversation: 'الحوار',
  reading: 'القراءة',
  quiz: 'الاختبار القصير',
};

const LEGACY_ACTIVITY_STEP_PATTERN = /(^|[-_])(activities?|exercises?)([-_]|$)/i;

export const resolveLessonStepId = (requestedStepId, steps) => {
  const safeSteps = asArray(steps);
  const requested = String(requestedStepId || '').trim();
  if (requested && safeSteps.some((step) => step.id === requested)) return requested;
  if (requested && LEGACY_ACTIVITY_STEP_PATTERN.test(requested)) {
    return safeSteps.find((step) => step.type === 'quiz')?.id || safeSteps[safeSteps.length - 1]?.id || '';
  }
  return safeSteps[0]?.id || '';
};

const uniqueStepId = (candidate, usedIds) => {
  const base = String(candidate || 'lesson-step').trim() || 'lesson-step';
  let id = base;
  let suffix = 2;
  while (usedIds.has(id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }
  usedIds.add(id);
  return id;
};

export const buildLessonSteps = (rawLesson) => {
  const lesson = normalizeLessonForDisplay(rawLesson);
  const usedIds = new Set(['intro']);
  const steps = [{
    id: 'intro',
    type: 'intro',
    title: 'مقدمة الدرس',
    germanTitle: lesson.germanTitle,
    data: lesson,
  }];

  asArray(lesson.sections).forEach((section, index) => {
    steps.push({
      id: uniqueStepId(section.id || `section-${index + 1}`, usedIds),
      type: 'section',
      title: section.title || 'جزء من الدرس',
      germanTitle: section.germanTitle || '',
      data: section,
    });
  });

  const groupedSteps = [
    ['vocabulary', lesson.vocabulary],
    ['grammar', lesson.grammar],
    ['examples', lesson.examples],
    ['conversation', lesson.conversation],
    ['reading', lesson.reading],
    ['quiz', lesson.shortQuiz],
  ];

  groupedSteps.forEach(([type, items]) => {
    if (!Array.isArray(items) || items.length === 0) return;
    steps.push({
      id: uniqueStepId(type, usedIds),
      type,
      title: STEP_TITLES[type],
      data: items,
    });
  });

  return { lesson, steps };
};

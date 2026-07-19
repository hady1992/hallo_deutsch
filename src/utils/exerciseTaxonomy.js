import { getExerciseCategoryKey, getCategoryLabel } from './exerciseAudio.js';

export const EXERCISE_SKILLS = [
  {
    key: 'vocabulary',
    label: 'المفردات',
    description: 'ثبّت الكلمات والتعابير المستخدمة في الحياة اليومية.',
  },
  {
    key: 'grammar',
    label: 'القواعد',
    description: 'تدرّب على تركيب الجملة والأفعال والحالات وحروف الجر.',
  },
  {
    key: 'reading',
    label: 'فهم المقروء',
    description: 'طوّر فهم النصوص والرسائل والمواقف المكتوبة.',
  },
  {
    key: 'listening',
    label: 'فهم المسموع',
    description: 'استمع إلى الألمانية وتدرّب على التقاط المعنى.',
  },
  {
    key: 'communication',
    label: 'التواصل',
    description: 'تمرّن على العبارات والمواقف والتواصل العملي.',
  },
  {
    key: 'mixed',
    label: 'تدريب مختلط',
    description: 'اجمع عدة مهارات في جلسة تدريب متنوعة.',
  },
];

export const TOPIC_GROUPS = [
  {
    key: 'sentences',
    label: 'الجملة والأسئلة',
    terms: ['satzbau', 'reihenfolge', 'fragen', 'w-fragen', 'w fragen', 'es-sätze', 'es-satze', 'es gibt', 'negation'],
  },
  {
    key: 'verbs',
    label: 'الأفعال',
    terms: ['verben', 'trennbare verben', 'modalverben', 'können', 'konnen', 'müssen', 'mussen', 'dürfen', 'durfen', 'möchten', 'mochten', 'perfekt', 'sein', 'haben', 'reflexiv'],
  },
  {
    key: 'cases',
    label: 'الحالات والأدوات',
    terms: ['akkusativ', 'dativ', 'artikel', 'possessivartikel', 'präpositionen', 'prapositionen', 'mit + dativ', 'zu + dativ'],
  },
  {
    key: 'vocabulary',
    label: 'المفردات والتواصل',
    terms: ['wortschatz', 'kommunikation', 'redemittel', 'höflichkeit', 'hoflichkeit', 'e-mail', 'email', 'termin'],
  },
  {
    key: 'comprehension',
    label: 'القراءة والاستماع',
    terms: ['leseverstehen', 'lesen', 'aussprache', 'hören', 'horen', 'lauten'],
  },
  {
    key: 'daily-life',
    label: 'الحياة اليومية والعمل',
    terms: ['arbeit', 'gesundheit', 'wohnen', 'reisen', 'einkaufen', 'familie', 'kurs', 'arzt', 'apotheke'],
  },
];

const firstText = (...values) => values
  .map((value) => String(value ?? '').trim())
  .find(Boolean) || '';

export const normalizeExerciseTaxonomyText = (value) => String(value ?? '')
  .trim()
  .toLocaleLowerCase('de-DE')
  .replace(/\s+/g, ' ');

const includesAny = (text, terms) => terms.some((term) => text.includes(term));

export const getExerciseUnitKey = (exercise) => {
  const explicitUnit = firstText(exercise?.unit, exercise?.unitId, exercise?.metadata?.unit);
  if (explicitUnit) return explicitUnit;
  const encodedKey = firstText(
    exercise?.lessonId,
    exercise?.lesson,
    exercise?.lessonSlug,
    exercise?.metadata?.lessonId,
    exercise?.id,
  );
  const encodedUnit = encodedKey.match(/^([A-D]\d)[-_](\d{1,2})(?:[-_]|$)/i);
  if (encodedUnit) return `${encodedUnit[1].toUpperCase()}-${encodedUnit[2].padStart(2, '0')}`;
  return 'general';
};

export const getExerciseLessonKey = (exercise) => firstText(
  exercise?.lessonId,
  exercise?.lesson,
  exercise?.lessonSlug,
  exercise?.metadata?.lessonId,
);

export const getExerciseTopicKey = (exercise) => firstText(
  getExerciseCategoryKey(exercise),
  exercise?.title,
  'عام',
);

export const getExerciseSkillKey = (exercise) => {
  if (!exercise) return 'mixed';
  if (exercise.audioText || exercise.audioUrl || exercise.audio) return 'listening';

  const searchable = normalizeExerciseTaxonomyText([
    exercise.skill,
    exercise.category,
    exercise.topic,
    exercise.type,
    exercise.title,
  ].filter(Boolean).join(' '));

  if (includesAny(searchable, ['leseverstehen', 'lesen', 'reading', 'textverständnis', 'textverstandnis'])) return 'reading';
  if (includesAny(searchable, ['hör', 'hor', 'listening', 'aussprache', 'lauten'])) return 'listening';
  if (includesAny(searchable, ['kommunikation', 'communication', 'redemittel', 'dialog', 'sprechen', 'schreiben', 'e-mail', 'email', 'termin', 'höflichkeit', 'hoflichkeit'])) return 'communication';
  if (includesAny(searchable, ['wortschatz', 'vocabulary', 'vokabel', 'lexik'])) return 'vocabulary';
  if (includesAny(searchable, [
    'grammar', 'grammatik', 'satzbau', 'reihenfolge', 'frage', 'negation', 'verb',
    'artikel', 'akkusativ', 'dativ', 'genitiv', 'präposition', 'praposition',
    'perfekt', 'konjunktiv', 'passiv', 'adjektiv', 'plural', 'konnektor',
  ])) return 'grammar';

  return 'mixed';
};

export const getTopicGroupKey = (topic) => {
  const normalizedTopic = normalizeExerciseTaxonomyText(topic);
  return TOPIC_GROUPS.find((group) => includesAny(normalizedTopic, group.terms))?.key || 'additional';
};

const asSortOrder = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : Number.MAX_SAFE_INTEGER;
};

const getUnitNumber = (value) => {
  const match = String(value || '').match(/(\d+)(?!.*\d)/);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
};

const mostFrequentText = (values) => {
  const counts = new Map();
  values.filter(Boolean).forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || '';
};

const buildLessonUnitMap = (lessons) => {
  const lessonGroups = new Map();
  (Array.isArray(lessons) ? lessons : []).forEach((lesson) => {
    const unit = firstText(lesson?.unit, lesson?.metadata?.unit, lesson?.topic);
    if (!unit) return;
    const current = lessonGroups.get(unit) || [];
    current.push(lesson);
    lessonGroups.set(unit, current);
  });

  const unitMap = new Map();
  lessonGroups.forEach((unitLessons, unit) => unitMap.set(unit, {
    unitTitleAr: mostFrequentText(unitLessons.map((lesson) => firstText(lesson?.unitTitleAr, lesson?.metadata?.unitTitleAr))),
    unitTitleDe: mostFrequentText(unitLessons.map((lesson) => firstText(lesson?.unitTitleDe, lesson?.metadata?.unitTitleDe))),
    description: mostFrequentText(unitLessons.map((lesson) => firstText(lesson?.description, lesson?.metadata?.unitDescription))),
    unitOrder: Math.min(...unitLessons.map((lesson) => asSortOrder(lesson?.unitOrder ?? lesson?.metadata?.unitOrder))),
  }));
  return unitMap;
};

export const buildExerciseTaxonomy = (exercises, lessons = []) => {
  const safeExercises = Array.isArray(exercises) ? exercises : [];
  const lessonUnits = buildLessonUnitMap(lessons);
  const unitMap = new Map();
  const topicMap = new Map();
  const skillCounts = Object.fromEntries(EXERCISE_SKILLS.map((skill) => [skill.key, 0]));

  safeExercises.forEach((exercise) => {
    const skill = getExerciseSkillKey(exercise);
    skillCounts[skill] = (skillCounts[skill] || 0) + 1;

    const unit = getExerciseUnitKey(exercise);
    if (unit) {
      const lessonUnit = lessonUnits.get(unit) || {};
      const current = unitMap.get(unit) || {
        key: unit,
        unitTitleAr: unit === 'general' ? 'تمارين عامة' : '',
        unitTitleDe: '',
        description: '',
        unitOrder: Number.MAX_SAFE_INTEGER,
        count: 0,
        skillCounts: Object.fromEntries(EXERCISE_SKILLS.map((item) => [item.key, 0])),
      };
      current.count += 1;
      current.skillCounts[skill] = (current.skillCounts[skill] || 0) + 1;
      current.unitTitleAr = current.unitTitleAr || firstText(exercise?.unitTitleAr, exercise?.metadata?.unitTitleAr, lessonUnit.unitTitleAr);
      current.unitTitleDe = current.unitTitleDe || firstText(exercise?.unitTitleDe, exercise?.metadata?.unitTitleDe, lessonUnit.unitTitleDe);
      current.description = current.description || firstText(exercise?.unitDescription, exercise?.metadata?.unitDescription, lessonUnit.description);
      current.unitOrder = Math.min(
        current.unitOrder,
        asSortOrder(exercise?.unitOrder ?? exercise?.metadata?.unitOrder),
        asSortOrder(lessonUnit.unitOrder),
      );
      unitMap.set(unit, current);
    }

    const topic = getExerciseTopicKey(exercise);
    const topicId = normalizeExerciseTaxonomyText(topic) || 'عام';
    const currentTopic = topicMap.get(topicId) || {
      key: topic,
      label: getCategoryLabel(topic),
      normalizedKey: topicId,
      groupKey: getTopicGroupKey(topic),
      count: 0,
    };
    currentTopic.count += 1;
    topicMap.set(topicId, currentTopic);
  });

  const units = [...unitMap.values()].sort((a, b) => (
    a.unitOrder - b.unitOrder
    || getUnitNumber(a.key) - getUnitNumber(b.key)
    || a.key.localeCompare(b.key, 'de')
  ));
  const skills = EXERCISE_SKILLS.map((skill) => ({
    ...skill,
    count: skill.key === 'mixed' ? safeExercises.length : skillCounts[skill.key] || 0,
  })).filter((skill) => skill.count > 0);
  const topics = [...topicMap.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'de'));

  return { units, skills, topics, skillCounts };
};

export const filterExercisesBySkill = (exercises, skillKey) => {
  const safeExercises = Array.isArray(exercises) ? exercises : [];
  if (!skillKey || skillKey === 'mixed') return safeExercises;
  return safeExercises.filter((exercise) => getExerciseSkillKey(exercise) === skillKey);
};

export const filterExercisesByTopic = (exercises, topicKey) => {
  const normalizedTopic = normalizeExerciseTaxonomyText(topicKey);
  return (Array.isArray(exercises) ? exercises : []).filter(
    (exercise) => normalizeExerciseTaxonomyText(getExerciseTopicKey(exercise)) === normalizedTopic,
  );
};

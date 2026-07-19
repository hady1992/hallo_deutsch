import {
  PLACEMENT_DIFFICULTIES,
  PLACEMENT_LEVELS,
  PLACEMENT_SKILLS,
  PLACEMENT_STAGES,
  PLACEMENT_TEST_VERSION,
  normalizePlacementQuestions,
} from './placementTestNormalizer.js';

const EXPECTED_DISTRIBUTION = {
  core: { language_use: 4, reading: 3, listening: 3 },
  tiebreaker: { language_use: 2, reading: 2, listening: 1 },
};

const normalizedTextKey = (value) => String(value ?? '').trim().toLocaleLowerCase('de-DE');

const createEmptySummary = () => ({
  total: 0,
  levels: Object.fromEntries(PLACEMENT_LEVELS.map((level) => [level, 0])),
  stages: Object.fromEntries(PLACEMENT_STAGES.map((stage) => [stage, 0])),
  skills: Object.fromEntries(PLACEMENT_SKILLS.map((skill) => [skill, 0])),
});

const summarizeQuestions = (questions) => questions.reduce((summary, question) => {
  summary.total += 1;
  if (question.level in summary.levels) summary.levels[question.level] += 1;
  if (question.stage in summary.stages) summary.stages[question.stage] += 1;
  if (question.skill in summary.skills) summary.skills[question.skill] += 1;
  return summary;
}, createEmptySummary());

const validateQuestion = (question, index) => {
  const errors = [];
  if (!question.id) errors.push('id مطلوب');
  if (question.testVersion !== PLACEMENT_TEST_VERSION) errors.push(`testVersion يجب أن يكون ${PLACEMENT_TEST_VERSION}`);
  if (!PLACEMENT_LEVELS.includes(question.level)) errors.push('level غير صالح');
  if (!PLACEMENT_SKILLS.includes(question.skill)) errors.push('skill غير صالح');
  if (!PLACEMENT_STAGES.includes(question.stage)) errors.push('stage غير صالح');
  if (!PLACEMENT_DIFFICULTIES.includes(question.difficulty)) errors.push('difficulty يجب أن يكون 1 أو 2 أو 3');
  if (!question.question) errors.push('question مطلوب');
  if (question.options.length < 4) errors.push('يجب توفير أربعة خيارات على الأقل');

  const optionKeys = question.options.map(normalizedTextKey);
  if (optionKeys.some((option) => !option)) errors.push('لا يجوز أن يحتوي options على خيار فارغ');
  if (new Set(optionKeys).size !== optionKeys.length) errors.push('الخيارات مكررة');
  if (question.correctAnswer < 0 || question.correctAnswer >= question.options.length) errors.push('correctAnswer غير موجود داخل options');
  if (!question.explanation) errors.push('explanation مطلوب');

  if (question.skill === 'reading' && (!question.stimulus?.text || question.stimulus.type !== 'text')) {
    errors.push('سؤال القراءة يحتاج stimulus من النوع text مع نص');
  }
  if (question.skill === 'listening' && (
    question.stimulus?.type !== 'audio'
    || (!question.stimulus?.audioUrl && !question.stimulus?.audioText)
  )) {
    errors.push('سؤال الاستماع يحتاج stimulus من النوع audio مع audioUrl أو audioText');
  }

  return errors.length > 0 ? { index, id: question.id || null, errors } : null;
};

const validateDistribution = (questions) => {
  const errors = [];

  PLACEMENT_LEVELS.forEach((level) => {
    const levelQuestions = questions.filter((question) => question.level === level);
    if (levelQuestions.length !== 15) {
      errors.push(`${level}: العدد المطلوب 15، الموجود ${levelQuestions.length}`);
    }

    PLACEMENT_STAGES.forEach((stage) => {
      const stageQuestions = levelQuestions.filter((question) => question.stage === stage);
      const expectedStageTotal = stage === 'core' ? 10 : 5;
      if (stageQuestions.length !== expectedStageTotal) {
        errors.push(`${level}/${stage}: العدد المطلوب ${expectedStageTotal}، الموجود ${stageQuestions.length}`);
      }

      PLACEMENT_SKILLS.forEach((skill) => {
        const actual = stageQuestions.filter((question) => question.skill === skill).length;
        const expected = EXPECTED_DISTRIBUTION[stage][skill];
        if (actual !== expected) {
          errors.push(`${level}/${stage}/${skill}: العدد المطلوب ${expected}، الموجود ${actual}`);
        }
      });
    });
  });

  if (questions.length !== 60) errors.push(`البنك الكامل يحتاج 60 سؤالًا، الموجود ${questions.length}`);
  return errors;
};

export const createPlacementBankSignature = (questions) => {
  const source = [...questions]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((question) => [
      question.id,
      question.testVersion,
      question.level,
      question.skill,
      question.stage,
      question.difficulty,
      question.question,
      question.options.join('\u241f'),
      question.correctAnswer,
    ].join('\u241e'))
    .join('\u241d');

  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `pt-${(hash >>> 0).toString(16)}-${questions.length}`;
};

export const validatePlacementQuestionBank = (rawQuestions, options = {}) => {
  const { requireComplete = true } = options;
  const questions = normalizePlacementQuestions(rawQuestions);
  const itemErrors = questions.map(validateQuestion).filter(Boolean);
  const invalidIndexes = new Set(itemErrors.map((error) => error.index));
  const seenIds = new Map();
  const seenQuestionTexts = new Map();
  let duplicates = 0;

  questions.forEach((question, index) => {
    if (invalidIndexes.has(index)) return;
    const idKey = normalizedTextKey(question.id);
    const questionKey = normalizedTextKey(question.question);
    const duplicateErrors = [];

    if (seenIds.has(idKey)) duplicateErrors.push(`id مكرر مع العنصر ${seenIds.get(idKey) + 1}`);
    if (seenQuestionTexts.has(questionKey)) duplicateErrors.push(`نص السؤال مكرر مع العنصر ${seenQuestionTexts.get(questionKey) + 1}`);
    if (duplicateErrors.length > 0) {
      duplicates += 1;
      invalidIndexes.add(index);
      itemErrors.push({ index, id: question.id, errors: duplicateErrors });
      return;
    }

    seenIds.set(idKey, index);
    seenQuestionTexts.set(questionKey, index);
  });

  const validQuestions = questions.filter((_, index) => !invalidIndexes.has(index));
  const distributionErrors = requireComplete ? validateDistribution(validQuestions) : [];
  const complete = itemErrors.length === 0 && distributionErrors.length === 0;

  return {
    complete,
    structurallyValid: itemErrors.length === 0,
    questions,
    validQuestions,
    itemErrors,
    distributionErrors,
    duplicates,
    summary: summarizeQuestions(validQuestions),
    bankSignature: complete ? createPlacementBankSignature(validQuestions) : '',
  };
};

export const PLACEMENT_EXPECTED_DISTRIBUTION = EXPECTED_DISTRIBUTION;

import { PLACEMENT_LEVELS, PLACEMENT_SKILLS } from './placementTestNormalizer.js';

export const PLACEMENT_SKILL_LABELS = {
  language_use: 'القواعد والمفردات',
  reading: 'فهم المقروء',
  listening: 'فهم المسموع',
};

export const getPlacementSkillAssessment = (percentage) => {
  if (percentage >= 80) return 'قوة واضحة';
  if (percentage >= 60) return 'جيد مع حاجة إلى تدريب بسيط';
  if (percentage >= 40) return 'يحتاج مراجعة';
  return 'يحتاج تأسيس';
};

const buildSkillProfile = (answeredQuestions, answers) => PLACEMENT_SKILLS.map((skill) => {
  const questions = answeredQuestions.filter((question) => question.skill === skill);
  const correct = questions.filter((question) => answers[question.id] === question.correctAnswer).length;
  const total = questions.length;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  return {
    skill,
    label: PLACEMENT_SKILL_LABELS[skill],
    correct,
    total,
    percentage,
    assessment: getPlacementSkillAssessment(percentage),
  };
});

const getRecommendation = (estimatedLevel, suggestedLevel, reviewSkills) => {
  const reviewText = reviewSkills.length > 0
    ? ` مع مراجعة ${reviewSkills.map((skill) => skill.label).join(' و')}`
    : '';

  if (estimatedLevel === 'Pre-A1') {
    return `ابدأ مستوى A1 لبناء أساس واضح في اللغة الألمانية${reviewText}.`;
  }
  if (estimatedLevel === 'B2') {
    return `لديك أداء ثابت حتى B2. واصل التعمق في محتوى B2 المتقدم${reviewText}.`;
  }
  return `لديك أساس جيد في ${estimatedLevel}. ابدأ مستوى ${suggestedLevel}${reviewText}.`;
};

export const buildPlacementResult = (attempt, preparedQuestions) => {
  const questionMap = new Map(preparedQuestions.map((question) => [question.id, question]));
  const answeredQuestions = Object.keys(attempt.answers)
    .map((questionId) => questionMap.get(questionId))
    .filter(Boolean);
  const correct = answeredQuestions.filter(
    (question) => attempt.answers[question.id] === question.correctAnswer
  ).length;
  const total = answeredQuestions.length;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  const passedLevels = attempt.levelResults.filter((levelResult) => levelResult.passed);
  const estimatedLevel = passedLevels.length > 0
    ? passedLevels[passedLevels.length - 1].level
    : 'Pre-A1';
  const estimatedIndex = PLACEMENT_LEVELS.indexOf(estimatedLevel);
  const passedB2 = estimatedLevel === 'B2';
  const suggestedLevel = estimatedLevel === 'Pre-A1'
    ? 'A1'
    : passedB2
      ? 'B2'
      : PLACEMENT_LEVELS[estimatedIndex + 1];
  const suggestedDisplay = passedB2 ? 'B2 متقدم' : suggestedLevel;
  const skillProfile = buildSkillProfile(answeredQuestions, attempt.answers);
  const strengths = skillProfile.filter((skill) => skill.total > 0 && skill.percentage >= 80);
  const reviewSkills = skillProfile.filter((skill) => skill.total > 0 && skill.percentage < 60);

  return {
    testVersion: attempt.testVersion,
    bankSignature: attempt.bankSignature,
    seed: attempt.seed,
    completedAt: new Date().toISOString(),
    estimatedLevel,
    suggestedLevel,
    suggestedDisplay,
    confidence: attempt.usedTiebreaker ? 'متوسطة' : 'مرتفعة',
    correct,
    total,
    percentage,
    levelResults: attempt.levelResults,
    skillProfile,
    strengths: strengths.map((skill) => skill.label),
    reviewSkills: reviewSkills.map((skill) => skill.label),
    recommendation: getRecommendation(estimatedLevel, suggestedDisplay, reviewSkills),
    answers: attempt.answers,
    presentedQuestionIds: attempt.presentedQuestionIds,
    timedOut: Boolean(attempt.timedOut),
  };
};

import {
  PLACEMENT_LEVELS,
  PLACEMENT_SKILLS,
  PLACEMENT_TEST_VERSION,
} from './placementTestNormalizer.js';
import { createAttemptSeed, seededShuffle } from './seededShuffle.js';

export const PLACEMENT_DURATION_SECONDS = 45 * 60;

export const preparePlacementBank = (questions, seed) => questions.map((question) => {
  const optionEntries = question.options.map((option, originalIndex) => ({ option, originalIndex }));
  const shuffledOptions = seededShuffle(optionEntries, `${seed}:options:${question.id}`);
  return {
    ...question,
    options: shuffledOptions.map((entry) => entry.option),
    correctAnswer: shuffledOptions.findIndex((entry) => entry.originalIndex === question.correctAnswer),
  };
});

export const getPlacementQuestionMap = (questions) => new Map(
  questions.map((question) => [question.id, question])
);

const buildStageQuestionIds = (questions, level, stage, seed) => {
  const grouped = PLACEMENT_SKILLS.flatMap((skill) => seededShuffle(
    questions.filter((question) => (
      question.level === level && question.stage === stage && question.skill === skill
    )),
    `${seed}:${level}:${stage}:${skill}`
  ));

  return seededShuffle(grouped, `${seed}:${level}:${stage}:combined`).map((question) => question.id);
};

const appendPresentedQuestion = (attempt, questionId) => ({
  ...attempt,
  presentedQuestionIds: questionId && !attempt.presentedQuestionIds.includes(questionId)
    ? [...attempt.presentedQuestionIds, questionId]
    : attempt.presentedQuestionIds,
});

const startStage = (attempt, questions, level, stage) => {
  const activeQuestionIds = buildStageQuestionIds(questions, level, stage, attempt.seed);
  return appendPresentedQuestion({
    ...attempt,
    currentLevel: level,
    currentStage: stage,
    currentQuestionIndex: 0,
    activeQuestionIds,
  }, activeQuestionIds[0]);
};

export const createPlacementAttempt = (questions, bankSignature, seed = createAttemptSeed()) => {
  const startedAt = new Date().toISOString();
  const baseAttempt = {
    testVersion: PLACEMENT_TEST_VERSION,
    bankSignature,
    seed,
    startedAt,
    currentLevel: 'A1',
    currentStage: 'core',
    currentQuestionIndex: 0,
    activeQuestionIds: [],
    presentedQuestionIds: [],
    answers: {},
    audioPlayCounts: {},
    remainingSeconds: PLACEMENT_DURATION_SECONDS,
    levelResults: [],
    usedTiebreaker: false,
    completed: false,
    timedOut: false,
  };

  return startStage(baseAttempt, questions, 'A1', 'core');
};

export const getCurrentPlacementQuestion = (attempt, questionMap) => {
  const questionId = attempt?.activeQuestionIds?.[attempt.currentQuestionIndex];
  return questionId ? questionMap.get(questionId) || null : null;
};

export const recordPlacementAnswer = (attempt, questionId, answerIndex) => ({
  ...attempt,
  answers: {
    ...attempt.answers,
    [questionId]: answerIndex,
  },
});

export const recordAudioPlayCount = (attempt, questionId, count) => ({
  ...attempt,
  audioPlayCounts: {
    ...attempt.audioPlayCounts,
    [questionId]: count,
  },
});

const scoreQuestionIds = (questionIds, answers, questionMap) => questionIds.reduce((score, questionId) => {
  const question = questionMap.get(questionId);
  return score + (question && answers[questionId] === question.correctAnswer ? 1 : 0);
}, 0);

const createLevelResult = (attempt, questionMap, passed, usedTiebreaker) => {
  const answeredQuestionIds = Object.keys(attempt.answers).filter(
    (questionId) => questionMap.get(questionId)?.level === attempt.currentLevel
  );
  return {
    level: attempt.currentLevel,
    score: scoreQuestionIds(answeredQuestionIds, attempt.answers, questionMap),
    total: answeredQuestionIds.length,
    passed,
    usedTiebreaker,
  };
};

const completeAttempt = (attempt, levelResult, timedOut = false) => ({
  ...attempt,
  levelResults: [...attempt.levelResults, levelResult],
  completed: true,
  timedOut,
  remainingSeconds: timedOut ? 0 : attempt.remainingSeconds,
});

export const advancePlacementAttempt = (attempt, questions) => {
  if (!attempt || attempt.completed) return attempt;
  const questionMap = getPlacementQuestionMap(questions);
  const currentQuestion = getCurrentPlacementQuestion(attempt, questionMap);
  if (!currentQuestion || attempt.answers[currentQuestion.id] === undefined) return attempt;

  const nextIndex = attempt.currentQuestionIndex + 1;
  if (nextIndex < attempt.activeQuestionIds.length) {
    return appendPresentedQuestion(
      { ...attempt, currentQuestionIndex: nextIndex },
      attempt.activeQuestionIds[nextIndex]
    );
  }

  const stageScore = scoreQuestionIds(attempt.activeQuestionIds, attempt.answers, questionMap);
  if (attempt.currentStage === 'core') {
    if (stageScore >= 7) {
      const levelResult = createLevelResult(attempt, questionMap, true, false);
      const levelIndex = PLACEMENT_LEVELS.indexOf(attempt.currentLevel);
      if (levelIndex === PLACEMENT_LEVELS.length - 1) return completeAttempt(attempt, levelResult);

      return startStage({
        ...attempt,
        levelResults: [...attempt.levelResults, levelResult],
      }, questions, PLACEMENT_LEVELS[levelIndex + 1], 'core');
    }

    if (stageScore <= 4) {
      return completeAttempt(attempt, createLevelResult(attempt, questionMap, false, false));
    }

    return startStage({ ...attempt, usedTiebreaker: true }, questions, attempt.currentLevel, 'tiebreaker');
  }

  const levelQuestionIds = Object.keys(attempt.answers).filter(
    (questionId) => questionMap.get(questionId)?.level === attempt.currentLevel
  );
  const totalLevelScore = scoreQuestionIds(levelQuestionIds, attempt.answers, questionMap);
  const passed = totalLevelScore >= 10;
  const levelResult = createLevelResult(attempt, questionMap, passed, true);

  if (!passed) return completeAttempt(attempt, levelResult);
  const levelIndex = PLACEMENT_LEVELS.indexOf(attempt.currentLevel);
  if (levelIndex === PLACEMENT_LEVELS.length - 1) return completeAttempt(attempt, levelResult);

  return startStage({
    ...attempt,
    levelResults: [...attempt.levelResults, levelResult],
  }, questions, PLACEMENT_LEVELS[levelIndex + 1], 'core');
};

export const finishPlacementAttemptForTimeout = (attempt, questions) => {
  if (!attempt || attempt.completed) return attempt;
  const questionMap = getPlacementQuestionMap(questions);
  return completeAttempt(
    attempt,
    createLevelResult(attempt, questionMap, false, attempt.currentStage === 'tiebreaker'),
    true
  );
};

export const getAttemptRemainingSeconds = (attempt, now = Date.now()) => {
  if (!attempt?.startedAt) return PLACEMENT_DURATION_SECONDS;
  const startedAt = new Date(attempt.startedAt).getTime();
  const savedRemaining = Number.isFinite(Number(attempt.remainingSeconds))
    ? Number(attempt.remainingSeconds)
    : PLACEMENT_DURATION_SECONDS;
  if (!Number.isFinite(startedAt)) return Math.max(0, Math.min(savedRemaining, PLACEMENT_DURATION_SECONDS));
  const elapsed = Math.max(0, Math.floor((now - startedAt) / 1000));
  return Math.max(0, Math.min(savedRemaining, PLACEMENT_DURATION_SECONDS - elapsed));
};

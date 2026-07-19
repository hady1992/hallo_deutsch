import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  advancePlacementAttempt,
  createPlacementAttempt,
  getCurrentPlacementQuestion,
  getPlacementQuestionMap,
  preparePlacementBank,
  recordPlacementAnswer,
} from '../src/utils/placementTestEngine.js';
import { buildPlacementResult } from '../src/utils/placementTestScoring.js';
import { validatePlacementQuestionBank } from '../src/utils/placementTestValidator.js';

const bankPath = process.argv[2];

const assert = (condition, message) => {
  if (!condition) throw new Error(`[check:placement] ${message}`);
};

const distribution = {
  core: { language_use: 4, reading: 3, listening: 3 },
  tiebreaker: { language_use: 2, reading: 2, listening: 1 },
};

const createEngineFixture = () => ['A1', 'A2', 'B1', 'B2'].flatMap((level) => (
  Object.entries(distribution).flatMap(([stage, skills]) => (
    Object.entries(skills).flatMap(([skill, count]) => Array.from({ length: count }, (_, index) => ({
      id: `fixture-${level}-${stage}-${skill}-${index + 1}`,
      testVersion: 'cefr-placement-v1',
      level,
      skill,
      stage,
      difficulty: 1,
      question: `Fixture ${level} ${stage} ${skill} ${index + 1}`,
      stimulus: skill === 'reading'
        ? { type: 'text', text: 'Fixture reading text.' }
        : skill === 'listening'
          ? { type: 'audio', audioText: 'Fixture listening text.' }
          : null,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 0,
      explanation: 'Fixture explanation.',
      descriptor: 'Fixture descriptor.',
    })))
  ))
));

const answerCurrentStage = (attempt, questions, correctCount) => {
  const questionMap = getPlacementQuestionMap(questions);
  const stageQuestionIds = [...attempt.activeQuestionIds];
  let nextAttempt = attempt;
  stageQuestionIds.forEach((_, index) => {
    const question = getCurrentPlacementQuestion(nextAttempt, questionMap);
    const answerIndex = index < correctCount
      ? question.correctAnswer
      : (question.correctAnswer + 1) % question.options.length;
    nextAttempt = recordPlacementAnswer(nextAttempt, question.id, answerIndex);
    nextAttempt = advancePlacementAttempt(nextAttempt, questions);
  });
  return nextAttempt;
};

const runEngineChecks = () => {
  const fixtureValidation = validatePlacementQuestionBank(createEngineFixture());
  assert(fixtureValidation.complete, 'The internal 60-question engine fixture is invalid.');
  const prepared = preparePlacementBank(fixtureValidation.validQuestions, 'engine-check-seed');

  let failedA1 = createPlacementAttempt(prepared, fixtureValidation.bankSignature, 'fail-a1');
  failedA1 = answerCurrentStage(failedA1, prepared, 4);
  const failedA1Result = buildPlacementResult(failedA1, prepared);
  assert(failedA1.completed && failedA1Result.estimatedLevel === 'Pre-A1' && failedA1Result.suggestedLevel === 'A1', 'A1 failure decision is incorrect.');

  let passedA1 = createPlacementAttempt(prepared, fixtureValidation.bankSignature, 'pass-a1');
  passedA1 = answerCurrentStage(passedA1, prepared, 7);
  passedA1 = answerCurrentStage(passedA1, prepared, 4);
  const passedA1Result = buildPlacementResult(passedA1, prepared);
  assert(passedA1.completed && passedA1Result.estimatedLevel === 'A1' && passedA1Result.suggestedLevel === 'A2', 'A1 pass and A2 failure decision is incorrect.');

  let tiePass = createPlacementAttempt(prepared, fixtureValidation.bankSignature, 'tie-pass');
  tiePass = answerCurrentStage(tiePass, prepared, 5);
  assert(tiePass.currentStage === 'tiebreaker' && !tiePass.completed, 'A core score of 5 did not open tiebreaker questions.');
  tiePass = answerCurrentStage(tiePass, prepared, 5);
  assert(tiePass.currentLevel === 'A2' && tiePass.currentStage === 'core', 'Passing tiebreaker did not advance to the next level.');

  let tieFail = createPlacementAttempt(prepared, fixtureValidation.bankSignature, 'tie-fail');
  tieFail = answerCurrentStage(tieFail, prepared, 5);
  tieFail = answerCurrentStage(tieFail, prepared, 4);
  assert(tieFail.completed && tieFail.levelResults[0]?.passed === false, 'Failing tiebreaker did not stop the test.');

  let passedB2 = createPlacementAttempt(prepared, fixtureValidation.bankSignature, 'pass-b2');
  ['A1', 'A2', 'B1', 'B2'].forEach(() => {
    passedB2 = answerCurrentStage(passedB2, prepared, 7);
  });
  const passedB2Result = buildPlacementResult(passedB2, prepared);
  assert(passedB2.completed && passedB2Result.estimatedLevel === 'B2' && passedB2Result.suggestedDisplay === 'B2 متقدم', 'B2 completion decision is incorrect.');
};

runEngineChecks();

if (!bankPath) {
  const smokeQuestion = [{
    id: 'validator-smoke-a1-core-use',
    testVersion: 'cefr-placement-v1',
    level: 'A1',
    skill: 'language_use',
    stage: 'core',
    difficulty: 1,
    question: 'Validator smoke question',
    stimulus: null,
    options: ['A', 'B', 'C', 'D'],
    correctAnswer: 'A',
    explanation: 'Validator smoke explanation.',
    descriptor: 'Validator smoke descriptor.',
  }];
  const smoke = validatePlacementQuestionBank(smokeQuestion, { requireComplete: false });
  if (!smoke.structurallyValid || smoke.validQuestions[0]?.correctAnswer !== 0) {
    throw new Error('[check:placement] Validator smoke check failed.');
  }
  console.log('[check:placement] Validator and adaptive-engine checks passed. No production bank path was supplied.');
  console.log('[check:placement] To validate a 60-question bank: npm run check:placement -- path/to/bank.json');
  process.exit(0);
}

const absolutePath = resolve(bankPath);
const parsed = JSON.parse(await readFile(absolutePath, 'utf8'));
const validation = validatePlacementQuestionBank(Array.isArray(parsed) ? parsed : [parsed]);

if (!validation.complete) {
  console.error('[check:placement] Bank validation failed.');
  console.error(JSON.stringify({
    summary: validation.summary,
    itemErrors: validation.itemErrors,
    distributionErrors: validation.distributionErrors,
    duplicates: validation.duplicates,
  }, null, 2));
  process.exit(1);
}

console.log(`[check:placement] OK: ${validation.summary.total} questions, signature ${validation.bankSignature}`);

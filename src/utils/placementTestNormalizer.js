export const PLACEMENT_TEST_VERSION = 'cefr-placement-v1';
export const PLACEMENT_LEVELS = ['A1', 'A2', 'B1', 'B2'];
export const PLACEMENT_SKILLS = ['language_use', 'reading', 'listening'];
export const PLACEMENT_STAGES = ['core', 'tiebreaker'];
export const PLACEMENT_DIFFICULTIES = [1, 2, 3];

const asText = (value) => String(value ?? '').trim();

const normalizeStimulus = (stimulus) => {
  if (!stimulus || typeof stimulus !== 'object' || Array.isArray(stimulus)) return null;
  return {
    type: asText(stimulus.type).toLowerCase(),
    text: asText(stimulus.text),
    audioUrl: asText(stimulus.audioUrl),
    audioText: asText(stimulus.audioText),
  };
};

export const normalizeCorrectAnswerIndex = (options, correctAnswer) => {
  if (!Array.isArray(options)) return -1;
  if (Number.isInteger(correctAnswer)) {
    return correctAnswer >= 0 && correctAnswer < options.length ? correctAnswer : -1;
  }

  const answerText = asText(correctAnswer);
  if (!answerText) return -1;
  return options.findIndex((option) => asText(option) === answerText);
};

export const normalizePlacementQuestion = (rawQuestion = {}) => {
  const options = Array.isArray(rawQuestion.options)
    ? rawQuestion.options.map(asText)
    : [];

  return {
    id: asText(rawQuestion.id),
    testVersion: asText(rawQuestion.testVersion),
    level: asText(rawQuestion.level || rawQuestion.targetLevel).toUpperCase(),
    skill: asText(rawQuestion.skill).toLowerCase(),
    stage: asText(rawQuestion.stage).toLowerCase(),
    difficulty: Number(rawQuestion.difficulty),
    question: asText(rawQuestion.question),
    stimulus: normalizeStimulus(rawQuestion.stimulus),
    options,
    correctAnswer: normalizeCorrectAnswerIndex(options, rawQuestion.correctAnswer),
    explanation: asText(rawQuestion.explanation),
    descriptor: asText(rawQuestion.descriptor),
    supabaseId: rawQuestion.supabaseId || null,
    source: rawQuestion.source || null,
  };
};

export const normalizePlacementQuestions = (questions) => (
  (Array.isArray(questions) ? questions : []).map(normalizePlacementQuestion)
);

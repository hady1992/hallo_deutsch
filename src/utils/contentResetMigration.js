const CONTENT_RESET_KEY = 'hallo_content_reset_v1_done';

const EXACT_NON_KIDS_KEYS = [
  'importedLessons',
  'importedVocabulary',
  'importedNouns',
  'importedVerbs',
  'importedGrammarRules',
  'importedExercises',
  'importedPlacementTests',
  'importedExams_A1',
  'importedExams_A2',
  'importedExams_B1',
  'importedExams_B2',
  'importedExamModels',
  'manualQuestions',
];

const NON_KIDS_PREFIXES = ['manualQuestions_'];

export const runContentResetMigration = () => {
  if (typeof window === 'undefined') return { migrated: false, removed: [] };
  if (localStorage.getItem(CONTENT_RESET_KEY) === 'true') {
    return { migrated: false, removed: [], reason: 'already-complete' };
  }

  const removed = [];
  EXACT_NON_KIDS_KEYS.forEach((key) => {
    if (localStorage.getItem(key) !== null) {
      localStorage.removeItem(key);
      removed.push(key);
    }
  });

  Object.keys(localStorage).forEach((key) => {
    if (NON_KIDS_PREFIXES.some((prefix) => key.startsWith(prefix))) {
      localStorage.removeItem(key);
      removed.push(key);
    }
  });

  localStorage.setItem(CONTENT_RESET_KEY, 'true');
  return { migrated: true, removed };
};

export { CONTENT_RESET_KEY };

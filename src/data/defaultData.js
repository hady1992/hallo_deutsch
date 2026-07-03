import { exercisesA1 } from './exercisesA1';
import { exercisesA2 } from './exercisesA2';
import { exercisesB1 } from './exercisesB1';
import { exercisesB2 } from './exercisesB2';
import { examsA1 } from './examsA1';
import { examsA2 } from './examsA2';
import { examsB1 } from './examsB1';
import { examsB2 } from './examsB2';
import { placementTestData } from './placementTestData';
import { kidsVocabularyData } from './kidsVocabularyData';
import { kidsVerbsDatabase } from './kidsVerbsDatabase';
import { kidsConversationsDatabase } from './kidsConversationsDatabase';

// Helper to flat map exams if needed, or keep structured by level
const allExams = [
    ...examsA1.map(e => ({...e, level: 'A1'})),
    ...examsA2.map(e => ({...e, level: 'A2'})),
    ...examsB1.map(e => ({...e, level: 'B1'})),
    ...examsB2.map(e => ({...e, level: 'B2'}))
];

export const defaultData = {
  exercises: [
    ...exercisesA1,
    ...exercisesA2,
    ...exercisesB1,
    ...exercisesB2
  ],
  exams: allExams,
  placementTest: placementTestData || [],
  kidsData: {
      vocabulary: kidsVocabularyData || [],
      verbs: kidsVerbsDatabase || [],
      conversations: kidsConversationsDatabase || [],
      // Add other kids data categories if available as exports
  },
  customQuizzes: [], // Placeholder for future default custom quizzes
  manualQuestions: [] // Placeholder
};
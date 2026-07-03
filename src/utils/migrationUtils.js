import { getCustomPlacementTestQuestions } from './storageManager';

/**
 * Extracts placement test questions from localStorage and formats them
 * as a JavaScript module content string.
 */
export const generatePlacementTestFileContent = () => {
  try {
    const questions = getCustomPlacementTestQuestions();
    
    // Check if we have data
    if (!questions || questions.length === 0) {
      return "// No questions found in localStorage 'importedPlacementTests' or 'customPlacementTestQuestions'";
    }

    const fileContent = `// Exported from localStorage on ${new Date().toLocaleDateString()}
// Contains ${questions.length} questions

export const placementTestData = ${JSON.stringify(questions, null, 2)};
`;
    return {
      content: fileContent,
      count: questions.length,
      success: true
    };
  } catch (error) {
    console.error("Migration failed:", error);
    return {
      content: `// Error generating content: ${error.message}`,
      count: 0,
      success: false
    };
  }
};
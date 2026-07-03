import { defaultData } from '@/data/defaultData';
import { 
  getImportedExercises, saveImportedExercises, 
  getCustomPlacementTestQuestions, saveCustomPlacementTestQuestions,
  getCustomQuizzes, saveCustomQuizzes,
  getImportedExams, saveImportedExams,
  getKidsVocabulary, saveKidsVocabulary,
  getKidsVerbs, saveKidsVerbs
} from '@/utils/storageManager';

export const initializeDefaultData = () => {
    try {
        console.log("Initializing default data check...");
        
        // 1. Exercises
        const mergedExercises = getImportedExercises();
        if (!mergedExercises || mergedExercises.length === 0) {
             if (defaultData.exercises?.length > 0) {
                saveImportedExercises(defaultData.exercises);
                console.log("Initialized default exercises.");
             }
        }

        // 2. Placement Tests
        const mergedPlacementTests = getCustomPlacementTestQuestions();
        if (!mergedPlacementTests || mergedPlacementTests.length === 0) {
             if (defaultData.placementTest?.length > 0) {
                saveCustomPlacementTestQuestions(defaultData.placementTest);
             }
        }

        // 3. Exams
        ['A1', 'A2', 'B1', 'B2'].forEach(level => {
            const storedExams = getImportedExams(level);
            if (!storedExams || storedExams.length === 0) {
                const defaults = defaultData.exams.filter(e => e.level === level);
                if (defaults.length > 0) {
                    saveImportedExams(level, defaults);
                }
            }
        });

        // 4. Kids Data
        const kidsVocab = getKidsVocabulary();
        if (kidsVocab.length === 0 && defaultData.kidsData?.vocabulary?.length > 0) {
            saveKidsVocabulary(defaultData.kidsData.vocabulary);
        }
        
        const kidsVerbs = getKidsVerbs();
        if (kidsVerbs.length === 0 && defaultData.kidsData?.verbs?.length > 0) {
            saveKidsVerbs(defaultData.kidsData.verbs);
        }

        console.log("Data initialization check complete.");
    } catch (error) {
        console.error("Failed to initialize default data:", error);
    }
};
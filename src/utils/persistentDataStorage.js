import { dedupeByKey, getExerciseDedupKey, getPlacementQuestionDedupKey } from '@/utils/contentDedupUtils';
import { getPublishedContent, publishContentItems } from '@/services/contentRepository';

const LOCAL_STORAGE_KEYS = {
  PLACEMENT_TESTS: 'importedPlacementTests',
  EXERCISES: 'importedExercises',
};

export const getPersistentPlacementTestQuestions = async () => (
  getPublishedContent('placement_tests')
);

export const savePlacementTestQuestions = async (questions) => (
  publishContentItems(
    'placement_tests',
    dedupeByKey(questions, getPlacementQuestionDedupKey)
  )
);

export const getPersistentExercises = async () => getPublishedContent('exercises');

export const saveExercises = async (exercises) => (
  publishContentItems('exercises', dedupeByKey(exercises, getExerciseDedupKey))
);

export const clearPersistentData = async (type) => {
  const key = type === 'placement' ? LOCAL_STORAGE_KEYS.PLACEMENT_TESTS : LOCAL_STORAGE_KEYS.EXERCISES;
  localStorage.removeItem(key);
  return { success: true, localOnly: true };
};

export const getStorageStats = () => ({
  placementCount: 0,
  exercisesCount: 0,
  storageMode: 'supabase-only',
});

import { kidsVocabularyData } from '@/data/kidsVocabularyData';
import { kidsVerbsDatabase } from '@/data/kidsVerbsDatabase';
import {
  getKidsVocabulary,
  getKidsVerbs,
  saveKidsVocabulary,
  saveKidsVerbs,
} from '@/utils/storageManager';

const DEFAULT_DATA_VERSION = '2026-07-18-kids-defaults-v1';
const INITIALIZED_VERSION_KEY = 'halloDeutschDefaultDataVersion';

export const initializeDefaultData = () => {
  try {
    if (localStorage.getItem(INITIALIZED_VERSION_KEY) === DEFAULT_DATA_VERSION) {
      return { initialized: false, reason: 'already-current' };
    }

    if (getKidsVocabulary().length === 0 && kidsVocabularyData.length > 0) {
      saveKidsVocabulary(kidsVocabularyData);
    }

    if (getKidsVerbs().length === 0 && kidsVerbsDatabase.length > 0) {
      saveKidsVerbs(kidsVerbsDatabase);
    }

    localStorage.setItem(INITIALIZED_VERSION_KEY, DEFAULT_DATA_VERSION);
    return { initialized: true, protectedContentOnly: true };
  } catch (error) {
    console.error('[DataInitializer] Failed to initialize protected kids data:', error);
    return { initialized: false, error };
  }
};

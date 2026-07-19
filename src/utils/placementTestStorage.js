import { PLACEMENT_TEST_VERSION } from './placementTestNormalizer.js';

export const PLACEMENT_ATTEMPT_STORAGE_KEY = 'hallo_placement_test_v2_attempt';
export const PLACEMENT_RESULT_STORAGE_KEY = 'hallo_placement_test_v2_result';
const LEGACY_RESULT_STORAGE_KEY = 'placement_test_result';

const canUseStorage = () => typeof window !== 'undefined' && window.localStorage;

const readJson = (key) => {
  if (!canUseStorage()) return null;
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.warn(`[PlacementStorage] Ignoring invalid ${key}:`, error);
    localStorage.removeItem(key);
    return null;
  }
};

const writeJson = (key, value) => {
  if (!canUseStorage()) return;
  localStorage.setItem(key, JSON.stringify(value));
};

const matchesBank = (value, bankSignature) => (
  value?.testVersion === PLACEMENT_TEST_VERSION && value?.bankSignature === bankSignature
);

export const removeLegacyPlacementResult = () => {
  if (canUseStorage() && localStorage.getItem(LEGACY_RESULT_STORAGE_KEY) !== null) {
    localStorage.removeItem(LEGACY_RESULT_STORAGE_KEY);
  }
};

export const loadPlacementAttempt = (bankSignature) => {
  const attempt = readJson(PLACEMENT_ATTEMPT_STORAGE_KEY);
  if (!attempt) return null;
  if (!matchesBank(attempt, bankSignature)) {
    localStorage.removeItem(PLACEMENT_ATTEMPT_STORAGE_KEY);
    return null;
  }
  return attempt;
};

export const savePlacementAttempt = (attempt) => writeJson(PLACEMENT_ATTEMPT_STORAGE_KEY, attempt);

export const clearPlacementAttempt = () => {
  if (canUseStorage()) localStorage.removeItem(PLACEMENT_ATTEMPT_STORAGE_KEY);
};

export const loadPlacementResult = (bankSignature) => {
  const result = readJson(PLACEMENT_RESULT_STORAGE_KEY);
  if (!result) return null;
  if (!matchesBank(result, bankSignature)) {
    localStorage.removeItem(PLACEMENT_RESULT_STORAGE_KEY);
    return null;
  }
  return result;
};

export const savePlacementResult = (result) => writeJson(PLACEMENT_RESULT_STORAGE_KEY, result);

export const clearPlacementResult = () => {
  if (canUseStorage()) localStorage.removeItem(PLACEMENT_RESULT_STORAGE_KEY);
};

export const clearPlacementSession = () => {
  clearPlacementAttempt();
  clearPlacementResult();
};

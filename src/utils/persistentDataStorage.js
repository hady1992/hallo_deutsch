import { supabase } from '@/lib/customSupabaseClient';
import { defaultData } from '@/data/defaultData';
import {
  dedupeByKey,
  getExerciseDedupKey,
  getPlacementQuestionDedupKey,
} from '@/utils/contentDedupUtils';

// Storage Keys
const LOCAL_STORAGE_KEYS = {
  PLACEMENT_TESTS: 'importedPlacementTests',
  EXERCISES: 'importedExercises'
};

// Helper: Merge arrays by ID
// Strategy: Cloud > Local > Default
const mergeData = (local, remote, defaults = [], getKey = (item) => item?.id || item?.question || '') => {
  const map = new Map();
  
  // 1. Start with defaults
  if (Array.isArray(defaults)) {
      defaults.forEach(item => {
        if (item && (item.id || item.question)) {
          // Use ID if available, otherwise hash or question text as key (fallback)
          const key = getKey(item) || item.id || item.question;
          map.set(key, { ...item, source: 'default' });
        }
      });
  }

  // 2. Apply LocalStorage (overrides defaults)
  if (Array.isArray(local)) {
      local.forEach(item => {
        if (item && (item.id || item.question)) {
          const key = getKey(item) || item.id || item.question;
          if (!map.has(key)) map.set(key, { ...item, source: 'local' });
        }
      });
  }

  // 3. Apply Remote (overrides local)
  if (Array.isArray(remote)) {
      remote.forEach(item => {
        if (item && (item.id || item.content?.question)) {
          // If remote item has content wrapper (common in Supabase jsonb patterns), unwrap it
          // But ensure we keep the top-level ID from the DB
          const content = item.content || item;
          const merged = { 
            ...content, 
            id: item.id, // Ensure UUID from DB is used if available
            level: item.level || content.level,
            source: 'cloud' 
          };
          const key = getKey(merged) || item.id;
          if (!map.has(key)) map.set(key, merged);
        }
      });
  }

  return dedupeByKey(Array.from(map.values()), getKey);
};

// --- Placement Tests ---

export const getPersistentPlacementTestQuestions = async () => {
  try {
    // 1. Get Local Data
    const localJson = localStorage.getItem(LOCAL_STORAGE_KEYS.PLACEMENT_TESTS);
    const localData = localJson ? JSON.parse(localJson) : [];

    // 2. Get Remote Data (Supabase)
    let remoteData = [];
    try {
        const { data, error } = await supabase
        .from('placement_tests')
        .select('*');
        
        if (error) throw error;
        remoteData = data || [];
    } catch (dbError) {
        console.warn('Supabase fetch warning (placement_tests):', dbError.message);
        // Continue with local data only
    }

    // 3. Merge
    const merged = mergeData(localData, remoteData, defaultData.placementTest || [], getPlacementQuestionDedupKey);
    
    // 4. Update Local Cache with "user added" items to keep localStorage in sync for offline
    // We filter out 'default' so we don't bloat LS with hardcoded data
    const userAdded = merged.filter(i => i.source !== 'default');
    localStorage.setItem(LOCAL_STORAGE_KEYS.PLACEMENT_TESTS, JSON.stringify(userAdded));

    return merged;
  } catch (err) {
    console.error('Error in getPersistentPlacementTestQuestions:', err);
    // Critical fallback: try to return whatever is in localStorage or defaults
    try {
        const localJson = localStorage.getItem(LOCAL_STORAGE_KEYS.PLACEMENT_TESTS);
        return localJson ? JSON.parse(localJson) : (defaultData.placementTest || []);
    } catch {
        return defaultData.placementTest || [];
    }
  }
};

export const savePlacementTestQuestions = async (questions) => {
  try {
    console.log(`Saving ${questions.length} placement questions...`);
    
    // 1. Save to LocalStorage immediately (Safety)
    const dedupedQuestions = dedupeByKey(questions, getPlacementQuestionDedupKey);
    localStorage.setItem(LOCAL_STORAGE_KEYS.PLACEMENT_TESTS, JSON.stringify(dedupedQuestions));

    // 2. Sync to Supabase
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        return { success: true, warning: 'Saved locally only (not logged in)' };
    }

    // Filter: You might want to upsert EVERYTHING from the "user added" list to ensure sync
    // But typically we only need to upsert items that are modified. 
    // For simplicity and robustness: Upsert all.
    const payload = dedupedQuestions.map(q => ({
      id: q.id, // Supabase expects UUID. If your ID is not UUID, this might fail unless column type is text.
                  // Ideally, ensure IDs generated are UUIDs.
      level: q.level || 'A1',
      content: q, // Store full object in content JSONB
      updated_at: new Date().toISOString()
    }));

    // Chunking could be added here if payload is massive, but for hundreds it's fine.
    const { error } = await supabase
      .from('placement_tests')
      .upsert(payload, { onConflict: 'id' });

    if (error) throw error;

    return { success: true };
  } catch (err) {
    console.error('Error saving placement tests to Supabase:', err);
    // Return success: false but the local save succeeded, so technically data isn't "lost" to the user immediately.
    return { success: false, error: err.message };
  }
};

// --- Exercises ---

export const getPersistentExercises = async () => {
  try {
    const localJson = localStorage.getItem(LOCAL_STORAGE_KEYS.EXERCISES);
    const localData = localJson ? JSON.parse(localJson) : [];

    let remoteData = [];
    try {
        const { data, error } = await supabase.from('exercises').select('*');
        if (error) throw error;
        remoteData = data || [];
    } catch (dbError) {
        console.warn('Supabase fetch warning (exercises):', dbError.message);
    }

    const merged = mergeData(localData, remoteData, defaultData.exercises || [], getExerciseDedupKey);
    
    // Update cache
    const userAdded = merged.filter(i => i.source !== 'default');
    localStorage.setItem(LOCAL_STORAGE_KEYS.EXERCISES, JSON.stringify(userAdded));

    return merged;
  } catch (err) {
    console.error('Error in getPersistentExercises:', err);
    try {
        const localJson = localStorage.getItem(LOCAL_STORAGE_KEYS.EXERCISES);
        return localJson ? JSON.parse(localJson) : (defaultData.exercises || []);
    } catch {
        return defaultData.exercises || [];
    }
  }
};

export const saveExercises = async (exercises) => {
  try {
    console.log(`Saving ${exercises.length} exercises...`);
    const dedupedExercises = dedupeByKey(exercises, getExerciseDedupKey);
    localStorage.setItem(LOCAL_STORAGE_KEYS.EXERCISES, JSON.stringify(dedupedExercises));

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { success: true, warning: 'Saved locally only' };

    const payload = dedupedExercises.map(ex => ({
      id: ex.id,
      level: ex.level || 'A1',
      content: ex,
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('exercises')
      .upsert(payload, { onConflict: 'id' });

    if (error) throw error;

    return { success: true };
  } catch (err) {
    console.error('Error saving exercises to Supabase:', err);
    return { success: false, error: err.message };
  }
};

// Helper to clear data (For debugging)
export const clearPersistentData = async (type) => {
    if (type === 'placement' || type === 'all') {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.PLACEMENT_TESTS);
    }
    if (type === 'exercises' || type === 'all') {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.EXERCISES);
    }
    return true;
};

// Helper to get raw local stats
export const getStorageStats = () => {
    return {
        placementCount: (localStorage.getItem(LOCAL_STORAGE_KEYS.PLACEMENT_TESTS) ? JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.PLACEMENT_TESTS)).length : 0),
        exercisesCount: (localStorage.getItem(LOCAL_STORAGE_KEYS.EXERCISES) ? JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.EXERCISES)).length : 0),
        totalLocalStorageSize: Math.round(JSON.stringify(localStorage).length / 1024) + ' KB'
    };
};

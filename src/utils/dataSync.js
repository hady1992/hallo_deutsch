import { 
  getPersistentPlacementTestQuestions, 
  getPersistentExercises 
} from './persistentDataStorage';

/**
 * Automatically syncs user-added data to Supabase when the app loads.
 * This ensures data persists across deployments and is available to all users immediately.
 */
export const syncUserData = async () => {
  console.log("🔄 Starting Data Sync...");
  
  try {
    // We invoke the getters which handle the "fetch remote -> merge -> update local" logic
    await Promise.all([
      getPersistentPlacementTestQuestions(),
      getPersistentExercises()
    ]);
    
    console.log("✅ Data Sync Complete");
    return true;
  } catch (error) {
    console.error("❌ Data Sync Failed:", error);
    return false;
  }
};

// Helper to trigger sync from UI
export const triggerManualSync = async () => {
  return await syncUserData();
};
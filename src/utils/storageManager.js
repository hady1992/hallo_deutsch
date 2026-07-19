import { supabase } from '@/lib/customSupabaseClient';
import { fetchPublishedRowsPaginated, splitIntoContentBatches } from '@/services/contentPagination';
import {
  dedupeByKey,
  getExamDedupKey,
  getExerciseDedupKey,
  getNounDedupKey,
  getPlacementQuestionDedupKey,
  getVerbDedupKey,
  getVocabularyDedupKey,
} from '@/utils/contentDedupUtils';

// Local Storage Keys
const VERBS_KEY = 'importedVerbs';
const NOUNS_KEY = 'importedNouns';
const VOCABULARY_KEY = 'importedVocabulary';
const GRAMMAR_RULES_KEY = 'importedGrammarRules';
const EXAM_MODELS_KEY = 'importedExamModels';
const LESSONS_KEY = 'importedLessons';
const EXERCISES_KEY = 'importedExercises';

const CUSTOM_EXAMS_KEY_PREFIX = 'importedExams_';
const CUSTOM_PLACEMENT_TEST_KEY = 'importedPlacementTests';

const KIDS_TOPICS_KEY = 'kidsTopics';
const KIDS_VOCABULARY_KEY = 'kidsVocabulary';
const KIDS_VERBS_KEY = 'kidsVerbs';
const KIDS_SENTENCES_KEY = 'kidsSentences';
const KIDS_EXERCISES_KEY = 'kidsExercises';
const KIDS_QUIZZES_KEY = 'kidsQuizzes';
const KIDS_PROGRESS_KEY = 'kidsProgress';
const CUSTOM_QUIZZES_KEY = 'customQuizzes';

const MANUAL_QUESTIONS_PREFIX = 'manualQuestions_';
const MANUAL_QUESTIONS_KEY = 'manualQuestions';

// Helper: Dispatch Events
const dispatchDataEvents = (specificEventName) => {
    window.dispatchEvent(new Event('dataImported'));
    if (specificEventName) {
        window.dispatchEvent(new Event(specificEventName));
    }
};

const createStableKidsVocabularyId = (item) => {
    const seed = [
        item?.category || item?.topic || 'general',
        item?.german || item?.word || item?.noun || '',
        item?.arabic || item?.translation || '',
    ].join('|').normalize('NFKC').trim().toLowerCase();
    let hash = 0;

    for (let index = 0; index < seed.length; index += 1) {
        hash = ((hash << 5) - hash + seed.charCodeAt(index)) | 0;
    }

    return `kids_recovered_${Math.abs(hash).toString(36)}`;
};

const normalizeKidsVocabulary = (data) => (
    (Array.isArray(data) ? data : [])
        .filter((item) => item && typeof item === 'object' && !Array.isArray(item))
        .map((item) => {
            const hasId = item.id !== undefined
                && item.id !== null
                && String(item.id).trim() !== '';

            if (hasId) return item;

            return {
                ...item,
                id: createStableKidsVocabularyId(item),
                isImported: true,
                source: item.source || 'legacy-import',
            };
        })
);

// Helper: Merge Data
export const mergeDataWithDefaults = (storedData, defaultData, uniqueField = 'id') => {
    const safeStored = Array.isArray(storedData) ? storedData : [];
    const safeDefault = Array.isArray(defaultData) ? defaultData : [];

    const getKey = typeof uniqueField === 'function'
      ? uniqueField
      : (item) => item?.[uniqueField] || item?.id || item?.german || item?.question || '';

    return dedupeByKey([...safeDefault, ...safeStored], getKey);
};

// --- SUPABASE SYNC LOGIC ---

/**
 * Syncs specific items to a Supabase table.
 * Does not delete items from Supabase (append/upsert only).
 */
const uploadBatchToSupabase = async (contentType, items, levelField = 'level') => {
    if (!items || items.length === 0) return { success: true, count: 0 };

    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return { success: false, error: "Not authenticated" };

        // 1. Fetch existing IDs from Supabase to avoid duplicates
        // We assume 'content' -> 'id' holds the unique local ID
        // Note: This fetch can be heavy if table is huge. For this scale, it's okay.
        const existingData = await fetchPublishedRowsPaginated({
            contentType,
            columns: 'id,content',
            isPublished: null,
        });

        const existingIds = new Set(existingData.map(row => row.content?.id));

        // 2. Filter out items that already exist
        const newItems = items.filter(item => item.id && !existingIds.has(item.id));

        if (newItems.length === 0) return { success: true, count: 0 };

        console.log(`Syncing ${newItems.length} new ${contentType} items to content_items...`);

        // 3. Prepare payload
        const payload = newItems.map(item => ({
            content_type: contentType,
            level: item[levelField] || item.level || 'A1',
            content: item,
            topic: item.topic || item.category || null,
            title: typeof item.title === 'string' ? item.title : null,
            is_published: true,
            created_by: session.user.id,
        }));

        // 4. Insert
        for (const payloadBatch of splitIntoContentBatches(payload)) {
            const { error: insertError } = await supabase
                .from('content_items')
                .insert(payloadBatch);
            if (insertError) throw insertError;
        }

        return { success: true, count: newItems.length };

    } catch (error) {
        console.error(`Supabase sync error for ${contentType}:`, error);
        return { success: false, error: error.message };
    }
};

export const syncLocalStorageToSupabase = async () => {
    console.log("Starting Full Supabase Sync...");
    let log = [];
    let hasErrors = false;

    // 1. Exercises
    try {
        const exercises = getImportedExercises();
        // Filter: Only sync custom imported ones (assume defaults are already in code or handled separately)
        // Usually, 'uploadedAt' or 'isImported' flag helps, or ID pattern.
        // We will sync all 'custom_' IDs or items with 'uploadedAt'.
        const customExercises = exercises.filter(ex => ex.id?.startsWith('custom_') || ex.uploadedAt);
        const res = await uploadBatchToSupabase('exercises', customExercises);
        log.push(`Exercises: ${res.success ? `Synced ${res.count}` : `Failed - ${res.error}`}`);
        if (!res.success) hasErrors = true;
    } catch (e) { log.push(`Exercises Error: ${e.message}`); hasErrors = true; }

    // 2. Vocabulary
    try {
        const vocab = getImportedVocabulary();
        const customVocab = vocab.filter(v => v.id?.startsWith('vocab_') || v.isImported);
        const res = await uploadBatchToSupabase('vocabulary', customVocab);
        log.push(`Vocabulary: ${res.success ? `Synced ${res.count}` : `Failed - ${res.error}`}`);
        if (!res.success) hasErrors = true;
    } catch (e) { log.push(`Vocab Error: ${e.message}`); hasErrors = true; }

    // 3. Exams
    try {
        const levels = ['A1', 'A2', 'B1', 'B2'];
        let totalExams = 0;
        for (const level of levels) {
            const exams = getImportedExams(level);
            const customExams = exams.filter(ex => ex.id?.startsWith('custom_exam_') || ex.uploadedAt);
            const res = await uploadBatchToSupabase('exams', customExams);
            if (!res.success) hasErrors = true;
            else totalExams += res.count;
        }
        log.push(`Exams: Synced ${totalExams}`);
    } catch (e) { log.push(`Exams Error: ${e.message}`); hasErrors = true; }

    // 4. Placement Tests
    try {
        const tests = getCustomPlacementTestQuestions();
        const customTests = tests.filter(t => t.id?.startsWith('custom_placement_') || t.uploadedAt);
        const res = await uploadBatchToSupabase('placement_tests', customTests);
        log.push(`Placement Tests: ${res.success ? `Synced ${res.count}` : `Failed - ${res.error}`}`);
        if (!res.success) hasErrors = true;
    } catch (e) { log.push(`Placement Error: ${e.message}`); hasErrors = true; }

    console.log("Sync Complete:", log);
    return { success: !hasErrors, log };
};

// --- DATA ACCESS FUNCTIONS (With Sync Triggers) ---

// Exercises
export const getImportedExercises = () => {
  try {
    const data = localStorage.getItem(EXERCISES_KEY);
    return dedupeByKey(data ? JSON.parse(data) : [], getExerciseDedupKey);
  } catch { return []; }
};

export const saveImportedExercises = (exercises) => {
  try {
    const sanitized = dedupeByKey(exercises.map(ex => ({
      ...ex,
      id: ex.id || `custom_exercise_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      uploadedAt: new Date().toISOString()
    })), getExerciseDedupKey);
    localStorage.setItem(EXERCISES_KEY, JSON.stringify(sanitized));
    dispatchDataEvents('exercisesUpdated');
    
    // Attempt background sync
    uploadBatchToSupabase('exercises', sanitized).then(res => {
        if(res.count > 0) console.log(`Auto-synced ${res.count} exercises to cloud.`);
    });
    
    return true;
  } catch (e) {
    console.error('Error saving exercises:', e);
    return false;
  }
};

export const deleteImportedExercise = (id) => {
  const current = getImportedExercises();
  const filtered = current.filter(ex => ex.id !== id);
  // Note: We don't delete from Supabase here automatically to be safe, 
  // or we could add a delete helper. For now, local delete only.
  // Real app would need delete sync.
  return saveImportedExercises(filtered);
};

export const clearImportedExercises = () => {
    localStorage.removeItem(EXERCISES_KEY);
    dispatchDataEvents('exercisesUpdated');
    return true;
};

// Vocabulary
export const getImportedVocabulary = () => {
  try {
    const data = localStorage.getItem(VOCABULARY_KEY);
    return dedupeByKey(data ? JSON.parse(data) : [], getVocabularyDedupKey);
  } catch (e) { return []; }
};

export const saveImportedVocabulary = (vocabulary) => {
  try {
    const sanitized = dedupeByKey(vocabulary.map(item => ({
      ...item,
      id: item.id || `vocab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      level: item.level || 'A1',
      uploadedAt: new Date().toISOString()
    })), getVocabularyDedupKey);
    localStorage.setItem(VOCABULARY_KEY, JSON.stringify(sanitized));
    dispatchDataEvents('vocabularyUpdated');
    
    uploadBatchToSupabase('vocabulary', sanitized).then(res => {
        if(res.count > 0) console.log(`Auto-synced ${res.count} vocabulary items.`);
    });
    return true;
  } catch (e) { return false; }
};

export const deleteImportedVocabulary = (id) => {
  const current = getImportedVocabulary();
  const filtered = current.filter(item => item.id !== id);
  return saveImportedVocabulary(filtered);
};

// Exams
export const getImportedExams = (level) => {
    try {
        const key = `${CUSTOM_EXAMS_KEY_PREFIX}${level}`;
        const data = localStorage.getItem(key);
        return dedupeByKey(data ? JSON.parse(data) : [], getExamDedupKey);
    } catch { return []; }
};

export const saveImportedExams = (level, exams) => {
    try {
        const key = `${CUSTOM_EXAMS_KEY_PREFIX}${level}`;
        const sanitized = dedupeByKey(exams.map(ex => ({
            ...ex,
            id: ex.id || `custom_exam_${level}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            uploadedAt: new Date().toISOString()
        })), getExamDedupKey);
        localStorage.setItem(key, JSON.stringify(sanitized));
        dispatchDataEvents(`examsUpdated_${level}`);
        
        uploadBatchToSupabase('exams', sanitized, 'level').then(res => {
             if(res.count > 0) console.log(`Auto-synced ${res.count} exams.`);
        });
        return true;
    } catch (e) { return false; }
};

export const deleteImportedExam = (level, id) => {
    const current = getImportedExams(level);
    const filtered = current.filter(ex => ex.id !== id);
    return saveImportedExams(level, filtered);
};

// Placement Tests
export const getCustomPlacementTestQuestions = () => {
    try {
        const data = localStorage.getItem(CUSTOM_PLACEMENT_TEST_KEY);
        return dedupeByKey(data ? JSON.parse(data) : [], getPlacementQuestionDedupKey);
    } catch { return []; }
};

export const saveCustomPlacementTestQuestions = (questions) => {
    try {
        const sanitized = dedupeByKey(questions.map(q => ({
            ...q,
            id: q.id || `custom_placement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            uploadedAt: new Date().toISOString()
        })), getPlacementQuestionDedupKey);
        localStorage.setItem(CUSTOM_PLACEMENT_TEST_KEY, JSON.stringify(sanitized));
        dispatchDataEvents('placementTestsUpdated');
        
        uploadBatchToSupabase('placement_tests', sanitized).then(res => {
             if(res.count > 0) console.log(`Auto-synced ${res.count} placement questions.`);
        });
        return true;
    } catch (e) { return false; }
};

export const deleteCustomPlacementTestQuestion = (id) => {
    const current = getCustomPlacementTestQuestions();
    const filtered = current.filter(q => q.id !== id);
    return saveCustomPlacementTestQuestions(filtered);
};

// --- Other getters/setters (Legacy/Unchanged but needed for compatibility) ---

// Verbs
export const getImportedVerbs = () => {
    try { return dedupeByKey(JSON.parse(localStorage.getItem(VERBS_KEY) || '[]'), getVerbDedupKey); } catch { return []; }
};
export const saveImportedVerbs = (verbs) => {
    localStorage.setItem(VERBS_KEY, JSON.stringify(dedupeByKey(verbs, getVerbDedupKey)));
    dispatchDataEvents('verbsUpdated');
    return true;
};
export const deleteImportedVerb = (id) => {
    const current = getImportedVerbs();
    const filtered = current.filter(v => v.id !== id);
    return saveImportedVerbs(filtered);
};
export const clearImportedVerbs = () => {
    localStorage.removeItem(VERBS_KEY);
    dispatchDataEvents('verbsUpdated');
    return true;
};

// Nouns
export const getImportedNouns = () => {
    try { return dedupeByKey(JSON.parse(localStorage.getItem(NOUNS_KEY) || '[]'), getNounDedupKey); } catch { return []; }
};
export const saveImportedNouns = (nouns) => {
    localStorage.setItem(NOUNS_KEY, JSON.stringify(dedupeByKey(nouns, getNounDedupKey)));
    dispatchDataEvents('nounsUpdated');
    return true;
};
export const deleteImportedNoun = (id) => {
    const current = getImportedNouns();
    const filtered = current.filter(n => n.id !== id);
    return saveImportedNouns(filtered);
};
export const clearImportedNouns = () => {
    localStorage.removeItem(NOUNS_KEY);
    dispatchDataEvents('nounsUpdated');
    return true;
};

// Grammar Rules
export const getImportedGrammarRules = () => {
    try { return JSON.parse(localStorage.getItem(GRAMMAR_RULES_KEY) || '[]'); } catch { return []; }
};
export const saveImportedGrammarRules = (rules) => {
    localStorage.setItem(GRAMMAR_RULES_KEY, JSON.stringify(rules));
    dispatchDataEvents('grammarRulesUpdated');
    return true;
};
export const deleteImportedGrammarRule = (id) => {
    const current = getImportedGrammarRules();
    const filtered = current.filter(r => r.id !== id);
    return saveImportedGrammarRules(filtered);
};
export const clearImportedGrammarRules = () => {
    localStorage.removeItem(GRAMMAR_RULES_KEY);
    dispatchDataEvents('grammarRulesUpdated');
    return true;
};

// Exam Models
export const getImportedExamModels = () => {
    try { return JSON.parse(localStorage.getItem(EXAM_MODELS_KEY) || '[]'); } catch { return []; }
};
export const saveImportedExamModels = (models) => {
    localStorage.setItem(EXAM_MODELS_KEY, JSON.stringify(models));
    dispatchDataEvents('examModelsUpdated');
    return true;
};
export const deleteImportedExamModel = (id) => {
    const current = getImportedExamModels();
    const filtered = current.filter(m => m.id !== id);
    return saveImportedExamModels(filtered);
};
export const clearImportedExamModels = () => {
    localStorage.removeItem(EXAM_MODELS_KEY);
    dispatchDataEvents('examModelsUpdated');
    return true;
};

// Lessons
export const getImportedLessons = () => {
    try { return JSON.parse(localStorage.getItem(LESSONS_KEY) || '[]'); } catch { return []; }
};
export const saveImportedLessons = (lessons) => {
    localStorage.setItem(LESSONS_KEY, JSON.stringify(lessons));
    dispatchDataEvents('lessonsUpdated');
    return true;
};
export const deleteImportedLesson = (id) => {
    const current = getImportedLessons();
    const filtered = current.filter(l => l.id !== id);
    return saveImportedLessons(filtered);
};

// Kids Data
export const getKidsVocabulary = () => {
    try {
        const storedData = JSON.parse(localStorage.getItem(KIDS_VOCABULARY_KEY) || '[]');
        const normalizedData = dedupeByKey(normalizeKidsVocabulary(storedData), getVocabularyDedupKey);

        if (JSON.stringify(storedData) !== JSON.stringify(normalizedData)) {
            localStorage.setItem(KIDS_VOCABULARY_KEY, JSON.stringify(normalizedData));
        }

        return normalizedData;
    } catch {
        return [];
    }
};
export const saveKidsVocabulary = (data) => {
    const normalizedData = dedupeByKey(normalizeKidsVocabulary(data), getVocabularyDedupKey);
    localStorage.setItem(KIDS_VOCABULARY_KEY, JSON.stringify(normalizedData));
    dispatchDataEvents('kidsVocabularyUpdated');
    return true;
};

export const getKidsVerbs = () => { try { return JSON.parse(localStorage.getItem(KIDS_VERBS_KEY) || '[]'); } catch { return []; } };
export const saveKidsVerbs = (data) => { localStorage.setItem(KIDS_VERBS_KEY, JSON.stringify(data)); dispatchDataEvents('kidsVerbsUpdated'); return true; };

export const getKidsSentences = () => { try { return JSON.parse(localStorage.getItem(KIDS_SENTENCES_KEY) || '[]'); } catch { return []; } };
export const saveKidsSentences = (data) => { localStorage.setItem(KIDS_SENTENCES_KEY, JSON.stringify(data)); dispatchDataEvents('kidsSentencesUpdated'); return true; };

export const getKidsExercises = () => { try { return JSON.parse(localStorage.getItem(KIDS_EXERCISES_KEY) || '[]'); } catch { return []; } };
export const saveKidsExercises = (data) => { localStorage.setItem(KIDS_EXERCISES_KEY, JSON.stringify(data)); dispatchDataEvents('kidsExercisesUpdated'); return true; };

export const getKidsProgress = () => { try { return JSON.parse(localStorage.getItem(KIDS_PROGRESS_KEY) || '{}'); } catch { return {}; } };
export const saveKidsProgress = (data) => { localStorage.setItem(KIDS_PROGRESS_KEY, JSON.stringify(data)); dispatchDataEvents('kidsProgressUpdated'); return true; };

export const getKidsTopics = () => { try { return JSON.parse(localStorage.getItem(KIDS_TOPICS_KEY) || '[]'); } catch { return []; } };
export const saveKidsTopics = (data) => { localStorage.setItem(KIDS_TOPICS_KEY, JSON.stringify(data)); dispatchDataEvents('kidsTopicsUpdated'); return true; };

// Custom Quizzes
export const getCustomQuizzes = () => { try { return JSON.parse(localStorage.getItem(CUSTOM_QUIZZES_KEY) || '[]'); } catch { return []; } };
export const saveCustomQuizzes = (data) => { localStorage.setItem(CUSTOM_QUIZZES_KEY, JSON.stringify(data)); dispatchDataEvents('customQuizzesUpdated'); return true; };

export const saveCustomQuiz = (quiz) => {
    const current = getCustomQuizzes();
    const index = current.findIndex(q => q.id === quiz.id);
    if (index >= 0) {
        current[index] = quiz;
    } else {
        current.push(quiz);
    }
    return saveCustomQuizzes(current);
};

export const deleteCustomQuiz = (id) => {
    const current = getCustomQuizzes();
    const filtered = current.filter(q => q.id !== id);
    return saveCustomQuizzes(filtered);
};

// Manual Questions
export const getManualQuestions = () => {
    try { return JSON.parse(localStorage.getItem(MANUAL_QUESTIONS_KEY) || '[]'); } catch { return []; }
};

export const saveManualQuestion = (question) => {
    const current = getManualQuestions();
    const newQuestion = { ...question, id: question.id || `manual_q_${Date.now()}` };
    current.push(newQuestion);
    localStorage.setItem(MANUAL_QUESTIONS_KEY, JSON.stringify(current));
    dispatchDataEvents('manualQuestionsUpdated');
    return true;
};

export const updateManualQuestion = (id, question) => {
    const current = getManualQuestions();
    const index = current.findIndex(q => q.id === id);
    if (index >= 0) {
        current[index] = { ...current[index], ...question };
        localStorage.setItem(MANUAL_QUESTIONS_KEY, JSON.stringify(current));
        dispatchDataEvents('manualQuestionsUpdated');
        return true;
    }
    return false;
};

export const deleteManualQuestion = (id) => {
    const current = getManualQuestions();
    const filtered = current.filter(q => q.id !== id);
    localStorage.setItem(MANUAL_QUESTIONS_KEY, JSON.stringify(filtered));
    dispatchDataEvents('manualQuestionsUpdated');
    return true;
};

// Helper Exports
export const getImportedPlacementTestExams = getCustomPlacementTestQuestions;
export const savePlacementTestExams = saveCustomPlacementTestQuestions;
export const deletePlacementTestExam = deleteCustomPlacementTestQuestion;
export const clearPlacementTestExams = () => localStorage.removeItem(CUSTOM_PLACEMENT_TEST_KEY);
export const mergeWithDefaults = mergeDataWithDefaults;

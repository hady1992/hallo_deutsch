import { supabase } from '@/lib/customSupabaseClient';
import { vocabularyA1 } from '@/data/vocabularyA1';
import { vocabularyA2 } from '@/data/vocabularyA2';
import { vocabularyB1 } from '@/data/vocabularyB1';
import { vocabularyB2 } from '@/data/vocabularyB2';
import { nounsDatabase } from '@/data/nounsDatabase';
import { germanVerbsComprehensive } from '@/data/germanVerbsComprehensive';
import { grammarA1Full } from '@/data/grammarA1Full';
import { grammarA2Full } from '@/data/grammarA2Full';
import { grammarB1Full } from '@/data/grammarB1Full';
import { grammarB2Full } from '@/data/grammarB2Full';
import { exercisesData } from '@/data/exercisesData';
import { placementTestQuestions } from '@/data/placementTestQuestions';
import { examsA1 } from '@/data/examsA1';
import { examsA2 } from '@/data/examsA2';
import { examsB1 } from '@/data/examsB1';
import { examsB2 } from '@/data/examsB2';
import { kidsVocabularyData } from '@/data/kidsVocabularyData';
import { kidsVerbsDatabase } from '@/data/kidsVerbsDatabase';
import { kidsConversationsDatabase } from '@/data/kidsConversationsDatabase';
import { kidsQuizzesData } from '@/data/kidsQuizzesData';
import {
  getCustomQuizzes as getLocalCustomQuizzes,
  getCustomPlacementTestQuestions,
  getImportedExams,
  getImportedExercises,
  getImportedGrammarRules,
  getImportedNouns,
  getImportedVerbs,
  getImportedVocabulary,
  getKidsExercises as getLocalKidsExercises,
  getKidsSentences,
  getKidsTopics as getLocalKidsTopics,
  getKidsVerbs as getLocalKidsVerbs,
  getKidsVocabulary as getLocalKidsVocabulary,
} from '@/utils/storageManager';
import {
  dedupeByKey,
  getContentDedupKey,
  splitNewUniqueItems,
} from '@/utils/contentDedupUtils';

const EXISTING_TABLES = {
  vocabulary: 'vocabulary',
  exercises: 'exercises',
  placement_tests: 'placement_tests',
  exams: 'exams',
};

const STATIC_CONTENT = {
  vocabulary: [...vocabularyA1, ...vocabularyA2, ...vocabularyB1, ...vocabularyB2],
  nouns: nounsDatabase,
  verbs: germanVerbsComprehensive,
  grammar: [...grammarA1Full, ...grammarA2Full, ...grammarB1Full, ...grammarB2Full],
  exercises: exercisesData,
  placement_tests: placementTestQuestions,
  exams: [
    ...examsA1.map((item) => ({ ...item, level: item.level || 'A1' })),
    ...examsA2.map((item) => ({ ...item, level: item.level || 'A2' })),
    ...examsB1.map((item) => ({ ...item, level: item.level || 'B1' })),
    ...examsB2.map((item) => ({ ...item, level: item.level || 'B2' })),
  ],
  kids_vocabulary: kidsVocabularyData,
  kids_conversations: kidsConversationsDatabase,
  kids_verbs: kidsVerbsDatabase,
  kids_exercises: [],
  kids_topics: [],
  custom_quizzes: kidsQuizzesData,
};

const LOCAL_READERS = {
  vocabulary: getImportedVocabulary,
  nouns: getImportedNouns,
  verbs: getImportedVerbs,
  grammar: getImportedGrammarRules,
  exercises: getImportedExercises,
  placement_tests: getCustomPlacementTestQuestions,
  exams: () => ['A1', 'A2', 'B1', 'B2'].flatMap((level) => getImportedExams(level)),
  kids_vocabulary: getLocalKidsVocabulary,
  kids_conversations: getKidsSentences,
  kids_verbs: getLocalKidsVerbs,
  kids_exercises: getLocalKidsExercises,
  kids_topics: getLocalKidsTopics,
  custom_quizzes: getLocalCustomQuizzes,
};

const asArray = (value) => (Array.isArray(value) ? value : []);

const readLocalFallback = (contentType) => {
  try {
    return asArray(LOCAL_READERS[contentType]?.());
  } catch (error) {
    console.warn(`[ContentRepository] Local fallback failed for ${contentType}:`, error);
    return [];
  }
};

const unwrapRow = (row, contentType) => {
  const content = row?.content && typeof row.content === 'object' ? row.content : row;
  return {
    ...content,
    level: row?.level || content?.level,
    topic: row?.topic || content?.topic,
    supabaseId: row?.id,
    source: 'cloud',
    contentType,
  };
};

const fetchCloudContent = async (contentType) => {
  const tableName = EXISTING_TABLES[contentType];
  const query = tableName
    ? supabase.from(tableName).select('*')
    : supabase
      .from('content_items')
      .select('*')
      .eq('content_type', contentType)
      .eq('is_published', true);

  const { data, error } = await query;
  if (error) throw error;
  return asArray(data).map((row) => unwrapRow(row, contentType));
};

const mergeContent = (contentType, extraItems = []) => {
  const keyGetter = (item) => getContentDedupKey(contentType, item);
  return dedupeByKey([
    ...asArray(STATIC_CONTENT[contentType]),
    ...asArray(extraItems),
  ], keyGetter, { prefer: 'last' });
};

export const getContent = async (contentType) => {
  try {
    const cloudItems = await fetchCloudContent(contentType);
    return mergeContent(contentType, cloudItems);
  } catch (error) {
    console.warn(`[ContentRepository] Supabase read failed for ${contentType}; using local fallback.`, error);
    return mergeContent(contentType, readLocalFallback(contentType));
  }
};

const ensureItemId = (contentType, item, index) => ({
  ...item,
  id: item.id || `${contentType}_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 8)}`,
});

export const publishContentItems = async (contentType, items) => {
  const incoming = asArray(items).map((item, index) => ensureItemId(contentType, item, index));
  if (incoming.length === 0) return { success: true, count: 0, duplicates: 0, items: [] };

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session?.user) throw new Error('Admin authentication is required to publish content.');

    const existing = await fetchCloudContent(contentType);
    const keyGetter = (item) => getContentDedupKey(contentType, item);
    const { unique, skipped } = splitNewUniqueItems(incoming, existing, keyGetter);
    if (unique.length === 0) {
      return { success: true, count: 0, duplicates: skipped, items: [] };
    }

    const tableName = EXISTING_TABLES[contentType];
    const now = new Date().toISOString();
    const payload = tableName
      ? unique.map((item) => ({
        level: item.level || (contentType === 'placement_tests' ? 'mixed' : 'A1'),
        content: item,
        updated_at: now,
      }))
      : unique.map((item) => ({
        content_type: contentType,
        level: item.level || null,
        topic: item.topic || item.category || null,
        title: typeof item.title === 'string' ? item.title : item.title?.ar || item.title?.de || null,
        content: item,
        metadata: item.metadata || {},
        is_published: true,
        created_by: session.user.id,
      }));

    const targetTable = tableName || 'content_items';
    const { data, error } = await supabase.from(targetTable).insert(payload).select();
    if (error) throw error;

    window.dispatchEvent(new Event('dataImported'));
    window.dispatchEvent(new Event(`${contentType}Updated`));
    return {
      success: true,
      count: unique.length,
      duplicates: skipped,
      items: asArray(data).map((row) => unwrapRow(row, contentType)),
    };
  } catch (error) {
    console.error(`[ContentRepository] Failed to publish ${contentType}:`, error);
    return { success: false, count: 0, duplicates: 0, items: [], error: error.message };
  }
};

export const publishContentItem = (contentType, item) => publishContentItems(contentType, [item]);

export const getVocabulary = () => getContent('vocabulary');
export const getNouns = () => getContent('nouns');
export const getVerbs = () => getContent('verbs');
export const getGrammarRules = () => getContent('grammar');
export const getExercises = () => getContent('exercises');
export const getPlacementTests = () => getContent('placement_tests');
export const getExams = () => getContent('exams');
export const getKidsVocabulary = () => getContent('kids_vocabulary');
export const getKidsConversations = () => getContent('kids_conversations');
export const getKidsVerbs = () => getContent('kids_verbs');
export const getKidsExercises = () => getContent('kids_exercises');
export const getKidsTopics = () => getContent('kids_topics');
export const getCustomQuizzes = () => getContent('custom_quizzes');

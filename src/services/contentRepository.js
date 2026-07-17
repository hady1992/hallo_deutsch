import { supabase } from '@/lib/customSupabaseClient';
import {
  dedupeByKey,
  getContentDedupKey,
  splitNewUniqueItems,
} from '@/utils/contentDedupUtils';
import { normalizeGrammarRuleForDisplay } from '@/utils/grammarNormalizer';
import { normalizeLessonForDisplay } from '@/utils/lessonNormalizer';

const LEGACY_TABLES = {
  vocabulary: 'vocabulary',
  exercises: 'exercises',
  placement_tests: 'placement_tests',
  exams: 'exams',
};

const missingLegacyTables = new Set();

const asArray = (value) => (Array.isArray(value) ? value : []);

const LEVELS = ['A1', 'A2', 'B1', 'B2'];
const contentPromiseCache = new Map();
const staticPromiseCache = new Map();

const vocabularyLoaders = {
  A1: () => import('@/data/vocabularyA1').then(({ vocabularyA1 }) => vocabularyA1),
  A2: () => import('@/data/vocabularyA2').then(({ vocabularyA2 }) => vocabularyA2),
  B1: () => import('@/data/vocabularyB1').then(({ vocabularyB1 }) => vocabularyB1),
  B2: () => import('@/data/vocabularyB2').then(({ vocabularyB2 }) => vocabularyB2),
};

const grammarLoaders = {
  A1: () => import('@/data/grammarA1Full').then(({ grammarA1Full }) => grammarA1Full),
  A2: () => import('@/data/grammarA2Full').then(({ grammarA2Full }) => grammarA2Full),
  B1: () => import('@/data/grammarB1Full').then(({ grammarB1Full }) => grammarB1Full),
  B2: () => import('@/data/grammarB2Full').then(({ grammarB2Full }) => grammarB2Full),
};

const examLoaders = {
  A1: () => import('@/data/examsA1').then(({ examsA1 }) => examsA1),
  A2: () => import('@/data/examsA2').then(({ examsA2 }) => examsA2),
  B1: () => import('@/data/examsB1').then(({ examsB1 }) => examsB1),
  B2: () => import('@/data/examsB2').then(({ examsB2 }) => examsB2),
};

const loadLevelData = async (loaders, level) => {
  const selectedLevels = level && loaders[level] ? [level] : LEVELS;
  const groups = await Promise.all(selectedLevels.map(async (currentLevel) => {
    const items = asArray(await loaders[currentLevel]());
    return items.map((item) => ({ ...item, level: item.level || currentLevel }));
  }));
  return groups.flat();
};

const loadStaticContentUncached = async (contentType, level = null) => {
  switch (contentType) {
    case 'lessons': return [];
    case 'vocabulary': return loadLevelData(vocabularyLoaders, level);
    case 'grammar': return loadLevelData(grammarLoaders, level);
    case 'exams': return loadLevelData(examLoaders, level);
    case 'nouns': return import('@/data/nounsDatabase').then(({ nounsDatabase }) => asArray(nounsDatabase));
    case 'verbs': return import('@/data/germanVerbsComprehensive').then(({ germanVerbsComprehensive }) => asArray(germanVerbsComprehensive));
    case 'exercises': return import('@/data/exercisesData').then(({ exercisesData }) => asArray(exercisesData));
    case 'placement_tests': return import('@/data/placementTestQuestions').then(({ placementTestQuestions }) => asArray(placementTestQuestions));
    case 'kids_vocabulary': return import('@/data/kidsVocabularyData').then(({ kidsVocabularyData }) => asArray(kidsVocabularyData));
    case 'kids_conversations': return import('@/data/kidsConversationsDatabase').then(({ kidsConversationsDatabase }) => asArray(kidsConversationsDatabase));
    case 'kids_verbs': return import('@/data/kidsVerbsDatabase').then(({ kidsVerbsDatabase }) => asArray(kidsVerbsDatabase));
    case 'custom_quizzes': return import('@/data/kidsQuizzesData').then(({ kidsQuizzesData }) => asArray(kidsQuizzesData));
    case 'kids_exercises':
    case 'kids_topics':
    default: return [];
  }
};

const loadStaticContent = (contentType, level = null) => {
  const cacheKey = `${contentType}:${level || 'all'}`;
  if (!staticPromiseCache.has(cacheKey)) {
    staticPromiseCache.set(cacheKey, loadStaticContentUncached(contentType, level));
  }
  return staticPromiseCache.get(cacheKey);
};

const localReaderNames = {
  lessons: 'getImportedLessons',
  vocabulary: 'getImportedVocabulary',
  nouns: 'getImportedNouns',
  verbs: 'getImportedVerbs',
  grammar: 'getImportedGrammarRules',
  exercises: 'getImportedExercises',
  placement_tests: 'getCustomPlacementTestQuestions',
  kids_vocabulary: 'getKidsVocabulary',
  kids_conversations: 'getKidsSentences',
  kids_verbs: 'getKidsVerbs',
  kids_exercises: 'getKidsExercises',
  kids_topics: 'getKidsTopics',
  custom_quizzes: 'getCustomQuizzes',
};

const readLocalFallback = async (contentType) => {
  try {
    const storage = await import('@/utils/storageManager');
    if (contentType === 'exams') {
      return LEVELS.flatMap((level) => asArray(storage.getImportedExams(level)));
    }
    const reader = storage[localReaderNames[contentType]];
    return typeof reader === 'function' ? asArray(reader()) : [];
  } catch (error) {
    console.warn(`[ContentRepository] Local fallback failed for ${contentType}:`, error);
    return [];
  }
};

const unwrapRow = (row, contentType, storageTable = 'content_items') => {
  const content = row?.content && typeof row.content === 'object' ? row.content : row;
  return {
    ...content,
    level: row?.level || content?.level,
    topic: row?.topic || content?.topic,
    supabaseId: row?.id,
    source: 'cloud',
    contentType,
    storageTable,
  };
};

const isMissingTableError = (error) => (
  ['42P01', 'PGRST205'].includes(error?.code)
  || /could not find the table|relation .* does not exist|schema cache/i.test(error?.message || '')
);

const isUnsupportedContentTypeError = (error) => (
  error?.code === '23514'
  && /content_items_content_type_check|content_type/i.test(error?.message || '')
);

const queryContentItems = async (contentType, level = null) => {
  let query = supabase
    .from('content_items')
    .select('*')
    .eq('content_type', contentType)
    .eq('is_published', true);

  if (level) query = query.eq('level', level);
  return query;
};

const queryLegacyTable = async (tableName, level = null) => {
  let query = supabase.from(tableName).select('*');
  if (level) query = query.eq('level', level);
  return query;
};

const fetchCloudContent = async (contentType, level = null) => {
  const legacyTable = LEGACY_TABLES[contentType];
  const contentItemsResult = await queryContentItems(contentType, level);

  if (!contentItemsResult.error) {
    return asArray(contentItemsResult.data)
      .map((row) => unwrapRow(row, contentType, 'content_items'));
  }

  if (!legacyTable || missingLegacyTables.has(legacyTable)) throw contentItemsResult.error;

  console.warn(`[ContentRepository] content_items read failed for ${contentType}; trying legacy table ${legacyTable}.`, contentItemsResult.error);
  const legacyResult = await queryLegacyTable(legacyTable, level);
  if (isMissingTableError(legacyResult.error)) missingLegacyTables.add(legacyTable);
  if (legacyResult.error) throw contentItemsResult.error;

  return asArray(legacyResult.data)
    .map((row) => unwrapRow(row, contentType, legacyTable));
};

const normalizeContent = (contentType, items) => {
  if (contentType === 'grammar') return asArray(items).map(normalizeGrammarRuleForDisplay);
  if (contentType === 'lessons') return asArray(items).map(normalizeLessonForDisplay);
  return asArray(items);
};

const mergeContent = (contentType, staticItems = [], extraItems = [], level = null) => {
  const keyGetter = (item) => getContentDedupKey(contentType, item);
  const merged = dedupeByKey([
    ...asArray(staticItems),
    ...asArray(extraItems),
  ], keyGetter, { prefer: 'last' });
  const filtered = level ? merged.filter((item) => item?.level === level) : merged;
  return normalizeContent(contentType, filtered);
};

const clearContentCache = (contentType = null) => {
  if (!contentType) {
    contentPromiseCache.clear();
    return;
  }
  for (const key of contentPromiseCache.keys()) {
    if (key.startsWith(`${contentType}:`)) contentPromiseCache.delete(key);
  }
};

const loadContent = async (contentType, level = null) => {
  const staticItems = await loadStaticContent(contentType, level);
  try {
    const cloudItems = await fetchCloudContent(contentType, level);
    return mergeContent(contentType, staticItems, cloudItems, level);
  } catch (error) {
    console.warn(`[ContentRepository] Supabase read failed for ${contentType}; using local fallback.`, error);
    const localItems = await readLocalFallback(contentType);
    return mergeContent(contentType, staticItems, localItems, level);
  }
};

export const getContent = (contentType, level = null) => {
  const cacheKey = `${contentType}:${level || 'all'}`;
  if (!contentPromiseCache.has(cacheKey)) {
    const request = loadContent(contentType, level).catch((error) => {
      contentPromiseCache.delete(cacheKey);
      throw error;
    });
    contentPromiseCache.set(cacheKey, request);
  }
  return contentPromiseCache.get(cacheKey);
};

const ensureItemId = (contentType, item, index) => ({
  ...item,
  id: item.id || `${contentType}_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 8)}`,
});

const dispatchContentEvents = (contentType) => {
  clearContentCache(contentType);
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('dataImported'));
  window.dispatchEvent(new Event(`${contentType}Updated`));
};

if (typeof window !== 'undefined' && !window.__halloDeutschContentCacheListener) {
  window.__halloDeutschContentCacheListener = true;
  window.addEventListener('dataImported', () => clearContentCache());
}

const buildUnifiedPayload = (contentType, items, userId) => items.map((item) => ({
  content_type: contentType,
  level: item.level || (contentType === 'placement_tests' ? 'mixed' : null),
  topic: item.topic || item.category || null,
  title: typeof item.title === 'string' ? item.title : item.title?.ar || item.title?.de || null,
  slug: item.slug || null,
  content: item,
  metadata: item.metadata || {},
  is_published: true,
  created_by: userId,
}));

const insertPublishedItems = async (contentType, items, userId) => {
  const unifiedResult = await supabase
    .from('content_items')
    .insert(buildUnifiedPayload(contentType, items, userId))
    .select();

  if (!unifiedResult.error) {
    return { ...unifiedResult, storageTable: 'content_items' };
  }

  const legacyTable = LEGACY_TABLES[contentType];
  const canUseLegacyTable = legacyTable
    && (isMissingTableError(unifiedResult.error) || isUnsupportedContentTypeError(unifiedResult.error));

  if (!canUseLegacyTable) return { ...unifiedResult, storageTable: 'content_items' };

  const now = new Date().toISOString();
  const legacyPayload = items.map((item) => ({
    level: item.level || (contentType === 'placement_tests' ? 'mixed' : 'A1'),
    content: item,
    updated_at: now,
  }));
  const legacyResult = await supabase.from(legacyTable).insert(legacyPayload).select();
  return { ...legacyResult, storageTable: legacyTable };
};

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

    const { data, error, storageTable } = await insertPublishedItems(
      contentType,
      unique,
      session.user.id
    );
    if (error) throw error;

    dispatchContentEvents(contentType);
    return {
      success: true,
      count: unique.length,
      duplicates: skipped,
      storageTable,
      items: asArray(data).map((row) => unwrapRow(row, contentType, storageTable)),
    };
  } catch (error) {
    console.error(`[ContentRepository] Failed to publish ${contentType}:`, error);
    return { success: false, count: 0, duplicates: 0, items: [], error: error.message };
  }
};

export const publishContentItem = (contentType, item) => publishContentItems(contentType, [item]);

export const getPublishedContent = async (contentType, level = null) => (
  normalizeContent(contentType, await fetchCloudContent(contentType, level))
);

export const deletePublishedContentItem = async (contentType, itemOrId) => {
  const item = typeof itemOrId === 'object' ? itemOrId : { supabaseId: itemOrId };
  const id = item?.supabaseId || item?.id;
  const storageTable = item?.storageTable || 'content_items';

  if (!id) return { success: false, error: 'A database item id is required.' };

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session?.user) throw new Error('Admin authentication is required to delete content.');

    let query = supabase.from(storageTable).delete().eq('id', id);
    if (storageTable === 'content_items') query = query.eq('content_type', contentType);
    const { error } = await query;
    if (error) throw error;

    dispatchContentEvents(contentType);
    return { success: true };
  } catch (error) {
    console.error(`[ContentRepository] Failed to delete ${contentType}:`, error);
    return { success: false, error: error.message };
  }
};

export const getLessons = async (level = null, options = {}) => {
  const { includeLocal = false } = options;
  const cacheKey = `lessons:published:${level || 'all'}`;
  if (!contentPromiseCache.has(cacheKey)) {
    contentPromiseCache.set(cacheKey, fetchCloudContent('lessons', level).catch((error) => {
      console.warn('[ContentRepository] Supabase lessons read failed; published lessons are unavailable.', error);
      return [];
    }));
  }
  const cloudItems = await contentPromiseCache.get(cacheKey);

  const localItems = includeLocal
    ? (await readLocalFallback('lessons'))
      .filter((item) => !level || item.level === level)
      .map((item) => ({
        ...item,
        source: item.source || 'local',
        publicationStatus: item.publicationStatus || 'local-only',
      }))
    : [];

  return dedupeByKey(
    [...localItems, ...cloudItems],
    (item) => getContentDedupKey('lessons', item),
    { prefer: 'last' }
  ).map(normalizeLessonForDisplay);
};

export const saveLesson = (lesson) => publishContentItem('lessons', lesson);
export const importLessons = (lessons) => publishContentItems('lessons', lessons);

export const unpublishLesson = async (itemOrId) => {
  const item = typeof itemOrId === 'object' ? itemOrId : { supabaseId: itemOrId };
  const id = item?.supabaseId || (item?.storageTable === 'content_items' ? item.id : null);

  if (!id) return { success: false, error: 'A Supabase lesson id is required.' };

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session?.user) throw new Error('Admin authentication is required to unpublish lessons.');

    const { error } = await supabase
      .from('content_items')
      .update({ is_published: false })
      .eq('id', id)
      .eq('content_type', 'lessons');
    if (error) throw error;

    dispatchContentEvents('lessons');
    return { success: true };
  } catch (error) {
    console.error('[ContentRepository] Failed to unpublish lesson:', error);
    return { success: false, error: error.message };
  }
};

export const getVocabulary = (level = null) => getContent('vocabulary', level);
export const getNouns = () => getContent('nouns');
export const getVerbs = () => getContent('verbs');
export const getGrammarRules = (level = null) => getContent('grammar', level);
export const getExercises = (level = null) => getContent('exercises', level);
export const getPlacementTests = () => getContent('placement_tests');
export const getExams = (level = null) => getContent('exams', level);
export const getKidsVocabulary = () => getContent('kids_vocabulary');
export const getKidsConversations = () => getContent('kids_conversations');
export const getKidsVerbs = () => getContent('kids_verbs');
export const getKidsExercises = () => getContent('kids_exercises');
export const getKidsTopics = () => getContent('kids_topics');
export const getCustomQuizzes = () => getContent('custom_quizzes');

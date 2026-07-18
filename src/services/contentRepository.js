import { supabase } from '@/lib/customSupabaseClient';
import {
  dedupeByKey,
  getContentDedupKey,
  splitNewUniqueItems,
} from '@/utils/contentDedupUtils';
import { normalizeGrammarRuleForDisplay } from '@/utils/grammarNormalizer';
import { normalizeLessonForDisplay } from '@/utils/lessonNormalizer';

const PROTECTED_KIDS_TYPES = new Set([
  'kids_vocabulary',
  'kids_conversations',
  'kids_verbs',
  'kids_exercises',
  'kids_topics',
  'custom_quizzes',
]);

const contentPromiseCache = new Map();
const asArray = (value) => (Array.isArray(value) ? value : []);
const asNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const unwrapRow = (row, contentType) => {
  const content = row?.content && typeof row.content === 'object' ? row.content : {};
  return {
    ...content,
    level: row?.level || content.level,
    topic: row?.topic || content.topic,
    title: content.title || row?.title,
    slug: content.slug || row?.slug,
    metadata: row?.metadata || content.metadata || {},
    supabaseId: row?.id,
    source: 'cloud',
    contentType,
    storageTable: 'content_items',
  };
};

const normalizeContent = (contentType, items) => {
  if (contentType === 'grammar') return asArray(items).map(normalizeGrammarRuleForDisplay);
  if (contentType === 'lessons') return asArray(items).map(normalizeLessonForDisplay);
  return asArray(items);
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

const queryPublishedContent = async (contentType, level = null, columns = '*') => {
  let query = supabase
    .from('content_items')
    .select(columns)
    .eq('content_type', contentType)
    .eq('is_published', true);

  if (level) query = query.eq('level', level);
  return query;
};

const fetchCloudContent = async (contentType, level = null) => {
  const { data, error } = await queryPublishedContent(contentType, level);
  if (error) throw error;
  return asArray(data).map((row) => unwrapRow(row, contentType));
};

const loadProtectedStaticContent = async (contentType) => {
  switch (contentType) {
    case 'kids_vocabulary':
      return import('@/data/kidsVocabularyData').then(({ kidsVocabularyData }) => asArray(kidsVocabularyData));
    case 'kids_conversations':
      return import('@/data/kidsConversationsDatabase').then(({ kidsConversationsDatabase }) => asArray(kidsConversationsDatabase));
    case 'kids_verbs':
      return import('@/data/kidsVerbsDatabase').then(({ kidsVerbsDatabase }) => asArray(kidsVerbsDatabase));
    case 'custom_quizzes':
      return import('@/data/kidsQuizzesData').then(({ kidsQuizzesData }) => asArray(kidsQuizzesData));
    default:
      return [];
  }
};

const kidsLocalReaderNames = {
  kids_vocabulary: 'getKidsVocabulary',
  kids_conversations: 'getKidsSentences',
  kids_verbs: 'getKidsVerbs',
  kids_exercises: 'getKidsExercises',
  kids_topics: 'getKidsTopics',
  custom_quizzes: 'getCustomQuizzes',
};

const readProtectedLocalContent = async (contentType) => {
  try {
    const storage = await import('@/utils/storageManager');
    const reader = storage[kidsLocalReaderNames[contentType]];
    return typeof reader === 'function' ? asArray(reader()) : [];
  } catch (error) {
    console.warn(`[ContentRepository] Kids local fallback failed for ${contentType}:`, error);
    return [];
  }
};

const mergeByType = (contentType, groups) => dedupeByKey(
  groups.flatMap(asArray),
  (item) => getContentDedupKey(contentType, item),
  { prefer: 'last' }
);

const loadProtectedKidsContent = async (contentType) => {
  const [staticItems, localItems] = await Promise.all([
    loadProtectedStaticContent(contentType),
    readProtectedLocalContent(contentType),
  ]);

  try {
    const cloudItems = await fetchCloudContent(contentType);
    return mergeByType(contentType, [staticItems, localItems, cloudItems]);
  } catch (error) {
    console.warn(`[ContentRepository] Supabase kids read failed for ${contentType}; keeping protected local content.`, error);
    return mergeByType(contentType, [staticItems, localItems]);
  }
};

const loadContent = async (contentType, level = null) => {
  if (PROTECTED_KIDS_TYPES.has(contentType)) {
    return loadProtectedKidsContent(contentType);
  }

  const cloudItems = await fetchCloudContent(contentType, level);
  return normalizeContent(contentType, cloudItems);
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

const buildLessonMetadata = (item) => ({
  ...(item.metadata || {}),
  unit: item.unit || item.metadata?.unit || null,
  unitOrder: asNumber(item.unitOrder ?? item.metadata?.unitOrder, 0),
  unitTitleAr: item.unitTitleAr || item.metadata?.unitTitleAr || null,
  unitTitleDe: item.unitTitleDe || item.metadata?.unitTitleDe || null,
  order: asNumber(item.order ?? item.metadata?.order, 0),
  estimatedMinutes: asNumber(item.estimatedMinutes ?? item.duration ?? item.metadata?.estimatedMinutes, 0),
});

const buildUnifiedPayload = (contentType, items, userId) => items.map((item) => ({
  content_type: contentType,
  level: item.level || (contentType === 'placement_tests' ? 'mixed' : null),
  topic: item.topic || item.category || (contentType === 'lessons' ? item.unit : null),
  title: typeof item.title === 'string' ? item.title : item.title?.ar || item.title?.de || null,
  slug: item.slug || null,
  content: item,
  metadata: contentType === 'lessons' ? buildLessonMetadata(item) : (item.metadata || {}),
  is_published: item.is_published !== false,
  created_by: userId,
}));

const requireAdminSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!session?.user) throw new Error('Admin authentication is required.');
  return session.user;
};

export const publishContentItems = async (contentType, items) => {
  const incoming = asArray(items).map((item, index) => ensureItemId(contentType, item, index));
  if (incoming.length === 0) return { success: true, count: 0, duplicates: 0, items: [] };

  try {
    const user = await requireAdminSession();
    const existing = await fetchCloudContent(contentType);
    const keyGetter = (item) => getContentDedupKey(contentType, item);
    const { unique, skipped } = splitNewUniqueItems(incoming, existing, keyGetter);
    if (unique.length === 0) {
      return { success: true, count: 0, duplicates: skipped, items: [] };
    }

    const { data, error } = await supabase
      .from('content_items')
      .insert(buildUnifiedPayload(contentType, unique, user.id))
      .select();
    if (error) throw error;

    dispatchContentEvents(contentType);
    return {
      success: true,
      count: unique.length,
      duplicates: skipped,
      storageTable: 'content_items',
      items: asArray(data).map((row) => unwrapRow(row, contentType)),
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
  if (!id) return { success: false, error: 'A database item id is required.' };

  try {
    await requireAdminSession();
    const { error } = await supabase
      .from('content_items')
      .delete()
      .eq('id', id)
      .eq('content_type', contentType);
    if (error) throw error;
    dispatchContentEvents(contentType);
    return { success: true };
  } catch (error) {
    console.error(`[ContentRepository] Failed to delete ${contentType}:`, error);
    return { success: false, error: error.message };
  }
};

const normalizeLessonSummary = (row) => {
  const metadata = row?.metadata || {};
  const unit = metadata.unit || row?.topic || 'general';
  return {
    id: row?.id,
    supabaseId: row?.id,
    source: 'cloud',
    storageTable: 'content_items',
    level: row?.level,
    title: row?.title || 'درس بدون عنوان',
    slug: row?.slug || row?.id,
    unit,
    unitOrder: asNumber(metadata.unitOrder, 0),
    unitTitleAr: metadata.unitTitleAr || 'وحدة عامة',
    unitTitleDe: metadata.unitTitleDe || '',
    order: asNumber(metadata.order, 0),
    estimatedMinutes: asNumber(metadata.estimatedMinutes, 0),
  };
};

export const getCourseLessons = async (level) => {
  const normalizedLevel = String(level || '').toUpperCase();
  const { data, error } = await queryPublishedContent(
    'lessons',
    normalizedLevel,
    'id,level,topic,title,slug,metadata,is_published,created_at'
  );
  if (error) throw error;

  return asArray(data)
    .map(normalizeLessonSummary)
    .sort((a, b) => (
      a.unitOrder - b.unitOrder
      || a.order - b.order
      || a.title.localeCompare(b.title, 'ar')
    ));
};

export const getLessonBySlug = async (level, lessonSlug) => {
  const normalizedLevel = String(level || '').toUpperCase();
  const normalizedSlug = String(lessonSlug || '').trim();
  if (!normalizedLevel || !normalizedSlug) return null;

  let query = supabase
    .from('content_items')
    .select('*')
    .eq('content_type', 'lessons')
    .eq('is_published', true)
    .eq('level', normalizedLevel)
    .eq('slug', normalizedSlug)
    .limit(1);

  let { data, error } = await query;
  if (error) throw error;

  if (asArray(data).length === 0 && /^[0-9a-f-]{36}$/i.test(normalizedSlug)) {
    ({ data, error } = await supabase
      .from('content_items')
      .select('*')
      .eq('id', normalizedSlug)
      .eq('content_type', 'lessons')
      .eq('is_published', true)
      .limit(1));
    if (error) throw error;
  }

  const row = asArray(data)[0];
  return row ? normalizeLessonForDisplay(unwrapRow(row, 'lessons')) : null;
};

export const getLessons = async (level = null) => (
  normalizeContent('lessons', await fetchCloudContent('lessons', level))
);

export const saveLesson = (lesson) => publishContentItem('lessons', lesson);
export const importLessons = (lessons) => publishContentItems('lessons', lessons);

export const updateLesson = async (lesson) => {
  const id = lesson?.supabaseId || lesson?.id;
  if (!id) return { success: false, error: 'A Supabase lesson id is required.' };

  try {
    await requireAdminSession();
    const payload = buildUnifiedPayload('lessons', [lesson], null)[0];
    delete payload.created_by;
    const { data, error } = await supabase
      .from('content_items')
      .update(payload)
      .eq('id', id)
      .eq('content_type', 'lessons')
      .select()
      .single();
    if (error) throw error;
    dispatchContentEvents('lessons');
    return { success: true, item: normalizeLessonForDisplay(unwrapRow(data, 'lessons')) };
  } catch (error) {
    console.error('[ContentRepository] Failed to update lesson:', error);
    return { success: false, error: error.message };
  }
};

export const unpublishLesson = async (itemOrId) => {
  const item = typeof itemOrId === 'object' ? itemOrId : { supabaseId: itemOrId };
  const id = item?.supabaseId || item?.id;
  if (!id) return { success: false, error: 'A Supabase lesson id is required.' };

  try {
    await requireAdminSession();
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

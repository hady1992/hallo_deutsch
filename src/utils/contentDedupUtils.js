const ARTICLE_OPTIONS = ['der', 'die', 'das'];

export const normalizeGermanText = (value = '') => (
  String(value ?? '')
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
);

export const normalizeArabicText = (value = '') => (
  String(value ?? '')
    .normalize('NFKC')
    .replace(/\u0640/g, '')
    .trim()
    .replace(/\s+/g, ' ')
);

export const normalizeArticle = (value = '') => {
  const article = normalizeGermanText(value);
  return ARTICLE_OPTIONS.includes(article) ? article : '';
};

export const splitGermanArticle = (value = '') => {
  const german = normalizeGermanText(value);
  const match = german.match(/^(der|die|das)\s+(.+)$/i);
  return {
    article: normalizeArticle(match?.[1]),
    word: match?.[2] || german,
  };
};

export const removeLeadingGermanArticle = (value = '') => splitGermanArticle(value).word;

const normalizeLevel = (value = '') => normalizeGermanText(value || 'global').toUpperCase();

const keyPart = (value) => normalizeGermanText(value || '');

const makeKey = (...parts) => parts.map(keyPart).join('|');

const getArticleAndWord = (item = {}) => {
  const german = item.german || item.word || item.noun || '';
  const parsed = splitGermanArticle(german);
  const article = normalizeArticle(item.article) || parsed.article;
  const word = removeLeadingGermanArticle(item.noun || item.word || parsed.word || german);

  return { article, word };
};

export const getNounDedupKey = (item = {}) => {
  const { article, word } = getArticleAndWord(item);
  if (!article || !word) return '';
  return makeKey(normalizeLevel(item.level), article, word);
};

export const getArticleHuntNounDedupKey = (item = {}) => {
  const { article, word } = getArticleAndWord(item);
  if (!article || !word) return '';
  return makeKey(article, word);
};

export const getVocabularyDedupKey = (item = {}) => {
  const german = item.german || item.word || '';
  const parsed = splitGermanArticle(german);
  const article = normalizeArticle(item.article) || parsed.article;
  const word = removeLeadingGermanArticle(german);
  if (!word) return '';

  return article
    ? makeKey(normalizeLevel(item.level), article, word)
    : makeKey(normalizeLevel(item.level), word);
};

export const getVerbDedupKey = (item = {}) => {
  const verb = item.infinitive || item.verb || item.german || '';
  if (!verb) return '';
  return makeKey(normalizeLevel(item.level), verb);
};

export const getExerciseDedupKey = (item = {}) => {
  if (!item.question) return '';
  return makeKey(normalizeLevel(item.level), item.question);
};

export const getPlacementQuestionDedupKey = (item = {}) => {
  if (!item.question) return '';
  return makeKey(normalizeLevel(item.level || item.targetLevel), item.question);
};

export const getExamDedupKey = (item = {}) => {
  if (item.id) return makeKey(item.id);
  return item.title ? makeKey(normalizeLevel(item.level), item.title) : '';
};

export const getContentDedupKey = (contentType, item) => {
  switch (contentType) {
    case 'nouns':
      return getNounDedupKey(item);
    case 'vocabulary':
      return getVocabularyDedupKey(item);
    case 'verbs':
      return getVerbDedupKey(item);
    case 'exercises':
      return getExerciseDedupKey(item);
    case 'placement':
    case 'placement-tests':
      return getPlacementQuestionDedupKey(item);
    case 'exams':
      return getExamDedupKey(item);
    default:
      return makeKey(item?.id || item?.title || item?.german || item?.question || '');
  }
};

export const dedupeByKey = (items = [], getKey, options = {}) => {
  const { prefer = 'first', returnStats = false } = options;
  const map = new Map();
  let skipped = 0;

  (Array.isArray(items) ? items : []).forEach((item) => {
    const key = getKey(item);
    if (!key) {
      map.set(Symbol('unkeyed'), item);
      return;
    }

    if (map.has(key)) {
      skipped += 1;
      if (prefer === 'last') {
        map.set(key, item);
      }
      return;
    }

    map.set(key, item);
  });

  const deduped = Array.from(map.values());
  return returnStats ? { items: deduped, skipped } : deduped;
};

export const splitNewUniqueItems = (incoming = [], existing = [], getKey) => {
  const existingKeys = new Set(
    (Array.isArray(existing) ? existing : [])
      .map((item) => getKey(item))
      .filter(Boolean)
  );

  const seenIncoming = new Set();
  const unique = [];
  let skipped = 0;

  (Array.isArray(incoming) ? incoming : []).forEach((item) => {
    const key = getKey(item);
    if (!key) {
      unique.push(item);
      return;
    }

    if (existingKeys.has(key) || seenIncoming.has(key)) {
      skipped += 1;
      return;
    }

    seenIncoming.add(key);
    unique.push(item);
  });

  return { unique, skipped };
};

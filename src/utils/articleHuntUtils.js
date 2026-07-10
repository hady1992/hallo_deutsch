import {
  getKidsVocabulary,
  getNouns,
  getVocabulary,
} from '@/services/contentRepository';
import { dedupeByKey, getArticleHuntNounDedupKey } from '@/utils/contentDedupUtils';

export const ARTICLE_OPTIONS = ['der', 'die', 'das'];

const TOPIC_LABELS = {
  all: 'كل المواضيع',
  animals: 'الحيوانات',
  animal: 'الحيوانات',
  tiere: 'الحيوانات',
  home: 'البيت',
  house: 'البيت',
  furniture: 'البيت',
  school: 'المدرسة',
  food: 'الطعام',
  essen: 'الطعام',
  family: 'العائلة',
  clothes: 'الملابس',
  clothing: 'الملابس',
  nature: 'الطبيعة',
  transport: 'المواصلات',
  transportation: 'المواصلات',
  traffic: 'المواصلات',
  objects: 'أدوات وأشياء',
  object: 'أدوات وأشياء',
  things: 'أدوات وأشياء',
  tools: 'أدوات وأشياء',
  items: 'أدوات وأشياء',
  shapes: 'الأشكال',
  colors: 'الألوان',
  general: 'عام',
  default: 'عام',
  عام: 'عام',
};

const REQUIRED_TOPIC_ORDER = [
  'الحيوانات',
  'البيت',
  'المدرسة',
  'الطعام',
  'العائلة',
  'الملابس',
  'الطبيعة',
  'المواصلات',
  'أدوات وأشياء',
  'عام',
];

const normalizeString = (value = '') => String(value).trim();

const normalizeArticle = (value = '') => {
  const article = normalizeString(value).toLowerCase();
  return ARTICLE_OPTIONS.includes(article) ? article : '';
};

const getArticleFromGerman = (german = '') => {
  const match = normalizeString(german).match(/^(der|die|das)\s+/i);
  return normalizeArticle(match?.[1]);
};

const removeArticleFromGerman = (german = '') => (
  normalizeString(german).replace(/^(der|die|das)\s+/i, '').trim()
);

export const normalizeTopicName = (topic) => {
  const rawTopic = normalizeString(topic);
  if (!rawTopic) return 'عام';

  const normalizedKey = rawTopic.toLowerCase();
  return TOPIC_LABELS[normalizedKey] || TOPIC_LABELS[rawTopic] || rawTopic;
};

const getTopicSortIndex = (topic) => {
  const index = REQUIRED_TOPIC_ORDER.indexOf(topic);
  return index === -1 ? REQUIRED_TOPIC_ORDER.length : index;
};

const normalizeNounItem = (item, source) => {
  if (!item || typeof item !== 'object') return null;

  const german = normalizeString(item.german || item.word || item.noun);
  const article = normalizeArticle(item.article) || getArticleFromGerman(german);
  if (!article) return null;

  const word = removeArticleFromGerman(item.noun || german);
  if (!word || ARTICLE_OPTIONS.includes(word.toLowerCase())) return null;

  const topic = normalizeTopicName(item.topic || item.category);
  const translation = normalizeString(item.translation || item.arabic || item.exampleArabic);
  const fullGerman = `${article} ${word}`;

  return {
    id: item.id || `${source}-${article}-${word}`,
    article,
    word,
    german: fullGerman,
    translation,
    topic,
    source,
  };
};

export const getKidNounsByTopic = async () => {
  const [kidsItems, nouns, vocabulary] = await Promise.all([
    getKidsVocabulary(),
    getNouns(),
    getVocabulary(),
  ]);
  const sources = [
    { name: 'kids', items: kidsItems },
    { name: 'nouns', items: nouns },
    { name: 'vocabulary', items: vocabulary },
  ];

  const merged = [];
  sources.forEach(({ name, items }) => {
    (Array.isArray(items) ? items : []).forEach((item) => {
      const normalized = normalizeNounItem(item, name);
      if (!normalized) return;
      merged.push(normalized);
    });
  });

  return dedupeByKey(merged, getArticleHuntNounDedupKey).sort((a, b) => (
    getTopicSortIndex(a.topic) - getTopicSortIndex(b.topic) ||
    a.topic.localeCompare(b.topic, 'ar') ||
    a.word.localeCompare(b.word, 'de')
  ));
};

export const getAvailableArticleHuntTopics = (nouns) => {
  const counts = new Map();
  nouns.forEach((noun) => {
    counts.set(noun.topic, (counts.get(noun.topic) || 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([label, count]) => ({ id: label, label, count }))
    .filter((topic) => topic.count > 0)
    .sort((a, b) => (
      getTopicSortIndex(a.label) - getTopicSortIndex(b.label) ||
      a.label.localeCompare(b.label, 'ar')
    ));
};

export const shuffleQuestions = (items, count) => {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

const isRecord = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const asArray = (value) => (Array.isArray(value) ? value : []);

const asCollection = (value) => {
  if (Array.isArray(value)) return value;
  if (!isRecord(value)) return [];
  return asArray(value.items || value.lines || value.entries || value.content);
};

const asText = (value) => {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number') return String(value);
  return '';
};

const firstText = (...values) => values.map(asText).find(Boolean) || '';

const normalizeTitle = (value) => {
  if (isRecord(value)) return firstText(value.ar, value.de, value.title);
  return asText(value);
};

const normalizeStringList = (value) => {
  if (Array.isArray(value)) return value.map(asText).filter(Boolean);
  const text = asText(value);
  return text ? text.split('|').map((item) => item.trim()).filter(Boolean) : [];
};

const normalizeDetailItems = (value, prefix) => asArray(value).map((item, index) => {
  if (!isRecord(item)) {
    return { id: `${prefix}-${index}`, text: asText(item) };
  }

  return {
    ...item,
    sourceId: asText(item.id),
    id: item.id || `${prefix}-${index}`,
    title: normalizeTitle(item.title || item.heading || item.name || item.germanTitle),
    text: firstText(
      item.text,
      item.explanation,
      item.explanationArabic,
      item.explanationGerman,
      item.description,
      item.summaryArabic,
      typeof item.content === 'string' ? item.content : '',
      item.arabic,
      item.translation
    ),
    germanTitle: asText(item.germanTitle),
    german: asText(item.german),
    word: asText(item.word),
    noun: asText(item.noun),
    arabic: asText(item.arabic),
    translation: asText(item.translation),
    example: asText(item.example),
    exampleArabic: asText(item.exampleArabic),
    question: firstText(item.question, item.prompt),
    options: normalizeStringList(item.options),
    examples: asArray(item.examples),
  };
}).filter((item) => item.text || item.title || item.german || item.word || item.question);

const normalizeQuiz = (value) => {
  const questions = Array.isArray(value)
    ? value
    : (isRecord(value) ? asArray(value.questions || value.items) : []);
  return normalizeDetailItems(questions, 'quiz');
};

export const normalizeLessonForDisplay = (rawLesson = {}) => {
  const lesson = isRecord(rawLesson) ? rawLesson : {};
  const structuredContent = isRecord(lesson.content) ? lesson.content : {};
  const metadata = isRecord(lesson.metadata) ? lesson.metadata : {};
  const rawExplanation = asText(lesson.explanation);
  const explanation = firstText(
    rawExplanation === '[object Object]' ? '' : rawExplanation,
    lesson.description,
    lesson.summaryArabic,
    typeof lesson.content === 'string' ? lesson.content : '',
    structuredContent.introArabic,
    structuredContent.introGerman,
    structuredContent.description,
    structuredContent.explanation
  );
  const sections = normalizeDetailItems(
    asCollection(lesson.sections).length ? asCollection(lesson.sections) : asCollection(structuredContent.sections),
    'section'
  );
  const vocabulary = normalizeDetailItems(
    asCollection(lesson.vocabulary).length ? asCollection(lesson.vocabulary) : asCollection(structuredContent.vocabulary),
    'vocabulary'
  );
  const exercises = normalizeDetailItems(
    asCollection(lesson.exercises).length ? asCollection(lesson.exercises) : asCollection(structuredContent.exercises),
    'exercise'
  );
  const examples = normalizeDetailItems(
    asCollection(lesson.examples).length ? asCollection(lesson.examples) : asCollection(structuredContent.examples),
    'example'
  );
  const grammar = normalizeDetailItems(
    asCollection(lesson.grammar).length ? asCollection(lesson.grammar) : asCollection(structuredContent.grammar),
    'grammar'
  );
  const conversation = normalizeDetailItems(
    asCollection(lesson.conversation).length ? asCollection(lesson.conversation) : asCollection(structuredContent.conversation),
    'conversation'
  );
  const reading = normalizeDetailItems(
    asCollection(lesson.reading).length ? asCollection(lesson.reading) : asCollection(structuredContent.reading),
    'reading'
  );
  const shortQuiz = normalizeQuiz(lesson.shortQuiz || structuredContent.shortQuiz);

  return {
    ...lesson,
    title: normalizeTitle(lesson.title) || firstText(lesson.slug, 'درس بدون عنوان'),
    description: asText(lesson.description),
    explanation,
    germanTitle: asText(lesson.germanTitle || structuredContent.germanTitle),
    level: firstText(lesson.level, metadata.level).toUpperCase(),
    slug: firstText(lesson.slug, lesson.id),
    unit: firstText(lesson.unit, metadata.unit, lesson.topic, 'general'),
    unitOrder: Number(lesson.unitOrder ?? metadata.unitOrder) || 0,
    unitTitleAr: firstText(lesson.unitTitleAr, metadata.unitTitleAr, 'وحدة عامة'),
    unitTitleDe: firstText(lesson.unitTitleDe, metadata.unitTitleDe),
    order: Number(lesson.order ?? metadata.order) || 0,
    estimatedMinutes: Number(lesson.estimatedMinutes ?? lesson.duration ?? metadata.estimatedMinutes) || 0,
    content: structuredContent,
    objectives: normalizeStringList(lesson.objectives || structuredContent.objectives),
    resources: normalizeStringList(lesson.resources || structuredContent.resources),
    sections,
    vocabulary,
    exercises,
    examples,
    grammar,
    conversation,
    reading,
    shortQuiz,
    introArabic: asText(structuredContent.introArabic),
    introGerman: asText(structuredContent.introGerman),
    hasLessonDetails: Boolean(
      explanation
      || sections.length
      || vocabulary.length
      || exercises.length
      || examples.length
      || grammar.length
      || conversation.length
      || reading.length
      || normalizeStringList(lesson.objectives || structuredContent.objectives).length
      || shortQuiz.length
    ),
  };
};

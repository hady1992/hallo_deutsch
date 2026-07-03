// أدوات مساعدة مشتركة لنظام التمارين: تنظيف نص القراءة الصوتية، وتوحيد
// أسماء الفئات (category/topic) لعرضها بشكل ودّي للمستخدم بغض النظر عن
// مصدر البيانات (تمارين ثابتة قديمة بأسماء إنجليزية، أو تمارين مستوردة
// حديثًا بأسماء ألمانية عبر حقل category).

// خريطة توحيد الفئات: تحوّل قيم topic/category الخام (كما هي مخزّنة فعليًا
// بالبيانات، إنجليزية كانت أو ألمانية) إلى تسمية ألمانية موحّدة للعرض.
// أي قيمة غير موجودة بهذه الخريطة تُعرض كما هي بدون كسر أي شيء (توافق كامل
// مع البيانات القديمة والمستوردة على حد سواء).
const TOPIC_LABELS = {
  // من ملف exercisesData.js الثابت (أسماء إنجليزية)
  'articles': 'Artikel',
  'verbs': 'Verben',
  'plural': 'Plural',
  'questions': 'Fragen',
  'negation': 'Negation',
  'prepositions': 'Präpositionen',
  'modal verbs': 'Modalverben',
  'comparison': 'Komparativ',
  'connectors': 'Konnektoren',
  'genitive': 'Genitiv',
  'infinitive zu': 'Infinitiv mit zu',
  'konjunktiv ii': 'Konjunktiv II',
  'nomen-verb': 'Nomen-Verb',
  'passive': 'Passiv',
  'perfect tense': 'Perfekt',
  'relative clauses': 'Relativsätze',
  'adjectives': 'Adjektive',
  // من تمارين مستوردة محتملة (أسماء ألمانية مباشرة أو مختصرة)
  'sein': 'Sein / Haben',
  'haben': 'Sein / Haben',
  'sein/haben': 'Sein / Haben',
  'satzbau': 'Satzbau',
  'schreiben': 'Schreiben',
  'artikel': 'Artikel',
  'präpositionen': 'Präpositionen',
  'fragen': 'Fragen',
};

/**
 * يحدد الفئة الفعلية لتمرين معيّن حسب أولوية الحقول الموجودة فعليًا بالبيانات:
 * category ثم topic، وإن لم يوجد أي منهما يُصنَّف تحت "عام".
 * متوافق تمامًا مع التمارين القديمة (تستخدم topic فقط) والمستوردة حديثًا
 * (قد تستخدم category).
 */
export const getExerciseCategoryKey = (exercise) => {
  if (!exercise) return 'عام';
  return exercise.category || exercise.topic || 'عام';
};

/**
 * يحوّل مفتاح الفئة الخام إلى تسمية ودّية للعرض (ألمانية موحّدة إن وُجدت
 * بالخريطة، وإلا القيمة الأصلية كما هي).
 */
export const getCategoryLabel = (rawCategory) => {
  if (!rawCategory || rawCategory === 'عام') return 'عام';
  const key = String(rawCategory).trim().toLowerCase();
  return TOPIC_LABELS[key] || rawCategory;
};

/**
 * يحدد النص الذي يجب قراءته صوتيًا لسؤال تمرين معيّن.
 *
 * المنطق:
 * - إذا وُجد exercise.audioText، يُستخدم مباشرة (أدق نطق، معدّ يدويًا).
 * - غير ذلك، يُستخدم exercise.question بعد تنظيفه من علامات الفراغ.
 * - لا تُقرأ الخيارات (options) ولا الإجابة الصحيحة (correctAnswer) إطلاقًا،
 *   لأن الدالة لا تصل لهذين الحقلين أصلًا ببنيتها.
 *
 * تنظيف الفراغات يشمل: ____ / ___ (شرطات سفلية متتالية)، [blank]،
 * .... (نقاط متتالية)، وشرطات مفردة قائمة بذاتها كعلامة فراغ.
 */
export const getExerciseAudioText = (exercise) => {
  if (!exercise) return '';
  let text = exercise.audioText || exercise.question || '';
  if (!text) return '';

  text = text
    .replace(/\[blank\]/gi, ' ')        // [blank]
    .replace(/_{2,}/g, ' ')             // ___ أو ____ (شرطات سفلية متتالية)
    .replace(/\.{3,}/g, ' ')            // .... (نقاط متتالية كعلامة فراغ)
    .replace(/(^|\s)-{1,}(\s|$)/g, ' ') // شرطة قائمة بذاتها كعلامة فراغ (لا تمس كلمات مركّبة مثل U-Bahn)
    .replace(/\s+([.,?!:])/g, '$1')     // إزالة أي مسافة قبل علامة ترقيم (تمنع ظهور النقطة أول الجملة بصريًا)
    .replace(/\s+/g, ' ')               // توحيد المسافات المتعددة
    .trim();

  return text;
};

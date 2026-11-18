// Lektion 01 — exercises and answer key from printed pages 06–08.
const choice = (id, prompt, options, answer, explanation, display = '') => ({
  id, type: 'choice', prompt, options, answer, explanation, display,
});
const input = (id, prompt, answer, explanation, display, type = 'letter') => ({
  id, type, prompt, answer, explanation, display,
});

export const LESSON01_GROUPS = [
  {
    id: 'matching', title: 'مطابقة الحروف', german: 'Zuordnen', page: 6, review: 'A1-01-01',
    instruction: 'اختر الحرف الصغير المطابق لكل حرف كبير.',
    questions: ['A', 'M', 'H', 'Z', 'B'].map((letter) => choice(`match-${letter}`, 'اختر الشكل الصغير',
      ['m', 'z', 'b', 'a', 'h'], letter.toLowerCase(), `الحرف ${letter} وشكله الصغير ${letter.toLowerCase()} لهما الاسم نفسه.`, letter)),
  },
  {
    id: 'missing', title: 'الحرف الناقص', german: 'Ergänzen', page: 6, review: 'A1-01-01',
    instruction: 'اكتب الحرف الناقص بحسب ترتيب الأبجدية.',
    questions: [
      input('missing-b', 'أكمل التسلسل', 'B', 'يأتي B بين A وC.', 'A _ C'),
      input('missing-i', 'أكمل التسلسل', 'I', 'يأتي I بين H وJ.', 'H _ J'),
      input('missing-o', 'أكمل التسلسل', 'O', 'يأتي O بعد N.', 'M N _'),
      input('missing-y', 'أكمل التسلسل', 'Y', 'يأتي Y بين X وZ.', 'X _ Z'),
    ],
  },
  {
    id: 'sounds', title: 'التركيبات الصوتية', german: 'Erkennen', page: 6, review: 'A1-01-03',
    instruction: 'اختر الجزء من الكلمة الذي يعطي الصوت المطلوب. النطق العربي تقريبي.',
    questions: [
      choice('sound-ei', 'صوت «آي»', ['Ei', 'E', 's'], 'Ei', 'تركيب ei يُنطق قريبًا من «آي».', 'Eis'),
      choice('sound-sch', 'صوت «ش»', ['S', 'ch', 'Sch'], 'Sch', 'sch يعطي صوت «ش».', 'Schule'),
      choice('sound-au', 'صوت «آو»', ['H', 'au', 'us'], 'au', 'au يعطي صوتًا قريبًا من «آو».', 'Haus'),
      choice('sound-ie', 'صوت «إي» الطويلة', ['i', 'e', 'ie'], 'ie', 'ie في Liebe يعطي صوت i طويلًا.', 'Liebe'),
      choice('sound-z', 'صوت «تس»', ['ah', 'Z', 'n'], 'Z', 'الحرف Z يعطي الصوت /ts/.', 'Zahn'),
    ],
  },
  {
    id: 'spelling', title: 'تهجئة الأسماء', german: 'Buchstabieren', page: 7, review: 'A1-01-04',
    instruction: 'افصل كل اسم إلى حروف، باستخدام مسافة أو شرطة بين الحروف، ثم انطق أسماءها.',
    questions: [
      input('spell-mira', 'هجّئ الاسم', 'M – I – R – A', 'إم، إي، إر، آ.', 'Mira', 'spelling'),
      input('spell-ali', 'هجّئ الاسم', 'A – L – I', 'آ، إل، إي.', 'Ali', 'spelling'),
      input('spell-lina', 'هجّئ الاسم', 'L – I – N – A', 'إل، إي، إن، آ.', 'Lina', 'spelling'),
    ],
  },
  { id: 'personal', title: 'اسمي الشخصي', german: 'Mein Name', page: 7, review: 'A1-01-04', instruction: 'اكتب اسمًا بالأحرف اللاتينية ثم هجّئه حرفًا حرفًا. يمكنك اختيار اسم تدريبي بدل اسمك الحقيقي.' },
  { id: 'test', title: 'الاختبار القصير', german: 'Mini-Test', page: 7, instruction: 'اختر إجابة واحدة لكل سؤال. لكل سؤال نقطة واحدة، وتظهر النتيجة بعد إنهاء الاختبار.' },
];

export const LESSON01_TEST = [
  { ...choice('test-count', 'كم عدد الحروف الأساسية؟', ['26', '30'], '26', 'الأبجدية الأساسية تتكوّن من 26 حرفًا.'), review: 'A1-01-01' },
  { ...choice('test-lower', 'ما الشكل الصغير للحرف B؟', ['d', 'b'], 'b', 'الشكل الصغير للحرف B هو b.'), review: 'A1-01-01' },
  { ...choice('test-ei', 'أي تركيب يُنطق «آي»؟', ['ei', 'ie'], 'ei', 'ei قريب من «آي»، أما ie فهو غالبًا صوت i طويل.'), review: 'A1-01-03' },
  { ...choice('test-eszett', 'كيف يُنطق ß؟', ['س', 'ب'], 'س', 'ß يُنطق مثل السين المهموسة، وليس الباء.'), review: 'A1-01-02' },
  { ...choice('test-ali', 'كيف نتهجّى Ali؟', ['A – L – I', 'A – I – L'], 'A – L – I', 'يجب الحفاظ على ترتيب الحروف: A ثم L ثم I.'), review: 'A1-01-04' },
];

export const LESSON01_PRACTICE = LESSON01_GROUPS.flatMap((group) => group.questions || []);
const fold = (text) => text.normalize('NFC').trim().toLowerCase();
const splitLetters = (text) => fold(text).split(/[\s,،\-‐‑‒–—]+/u).filter(Boolean);
const sameLetters = (left, right) => left.length === right.length && left.every((value, index) => value === right[index]);

export function checkAnswer(question, value) {
  if (typeof value !== 'string' || !value.trim()) return false;
  if (question.type === 'spelling') return sameLetters(splitLetters(value), splitLetters(question.answer));
  return fold(value) === fold(question.answer);
}

export function scoreTest(answers) {
  const complete = LESSON01_TEST.every((question) => question.options.includes(answers[question.id]));
  const correct = LESSON01_TEST.filter((question) => question.options.includes(answers[question.id]) && checkAnswer(question, answers[question.id]));
  return { complete, score: correct.length, total: LESSON01_TEST.length, passed: complete && correct.length >= 4 };
}

export function extractNameLetters(name) {
  const normalized = name.normalize('NFC').trim();
  if (!/^[\p{Script=Latin}]+(?:[\s\-‐‑‒–—'’]+[\p{Script=Latin}]+)*$/u.test(normalized)) return [];
  return Array.from(fold(normalized).replace(/[\s\-‐‑‒–—'’]/gu, ''));
}

export function checkNameSpelling(name, spelling) {
  const letters = extractNameLetters(name);
  return letters.length > 0 && sameLetters(letters, splitLetters(spelling));
}

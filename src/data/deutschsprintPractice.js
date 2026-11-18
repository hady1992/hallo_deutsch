// Lesson 01, printed pages 02–05. Order and examples follow the book.
const item = (text, meaning, spoken = text) => ({ text, meaning, spoken });
const word = (text, meaning) => item(text, meaning);
const letterRow = (letter, name, example, meaning) => ({
  label: `${letter} ${letter.toLowerCase()}`,
  items: [item(name, 'اسم الحرف', letter), word(example, meaning)],
});

export const ALPHABET_ROWS = [
  ['A', 'A', 'Apfel', 'تفاحة'], ['B', 'Be', 'Ball', 'كرة'],
  ['C', 'Ce', 'Computer', 'حاسوب'], ['D', 'De', 'Dose', 'علبة'],
  ['E', 'E', 'Elefant', 'فيل'], ['F', 'Ef', 'Fisch', 'سمكة'],
  ['G', 'Ge', 'Gabel', 'شوكة'], ['H', 'Ha', 'Haus', 'منزل'],
  ['I', 'I', 'Insel', 'جزيرة'], ['J', 'Jot', 'Jacke', 'سترة'],
  ['K', 'Ka', 'Kaffee', 'قهوة'], ['L', 'El', 'Lampe', 'مصباح'],
  ['M', 'Em', 'Milch', 'حليب'], ['N', 'En', 'Nase', 'أنف'],
  ['O', 'O', 'Oma', 'جدّة'], ['P', 'Pe', 'Pizza', 'بيتزا'],
  ['Q', 'Qu', 'Quelle', 'نبع'], ['R', 'Er', 'Rose', 'وردة'],
  ['S', 'Es', 'Sonne', 'شمس'], ['T', 'Te', 'Tee', 'شاي'],
  ['U', 'U', 'Uhr', 'ساعة'], ['V', 'Vau', 'Vater', 'أب'],
  ['W', 'We', 'Wasser', 'ماء'], ['X', 'Ix', 'Taxi', 'سيارة أجرة'],
  ['Y', 'Ypsilon', 'Yoga', 'يوغا'], ['Z', 'Zett', 'Zahn', 'سنّ'],
].map((entry) => letterRow(...entry));

export const SPECIAL_ROWS = [
  { label: 'Ä ä', items: [item('Ä', 'اسم الحرف'), word('Äpfel', 'تفاح (جمع)'), word('Käse', 'جبن')] },
  { label: 'Ö ö', items: [item('Ö', 'اسم الحرف'), word('Öl', 'زيت'), word('schön', 'جميل')] },
  { label: 'Ü ü', items: [item('Ü', 'اسم الحرف'), word('Tür', 'باب'), word('grün', 'أخضر')] },
  { label: 'ß', items: [word('Eszett', 'اسم الحرف'), word('Straße', 'شارع'), word('Fuß', 'قدم')] },
];

// Do not synthesize isolated digraphs: the engine may spell them instead of
// demonstrating their sound. Each example shows the sound in a real word.
export const SOUND_ROWS = [
  { label: 'ei', items: [word('Eis', 'مثلّجات')] },
  { label: 'ie', items: [word('Liebe', 'حبّ')] },
  { label: 'eu / äu', items: [word('Eule', 'بومة'), word('Häuser', 'منازل')] },
  { label: 'au', items: [word('Haus', 'منزل')] },
  { label: 'sch', items: [word('Schule', 'مدرسة')] },
  { label: 'ch', items: [word('ich', 'أنا'), word('Buch', 'كتاب')] },
  { label: 'sp / st', items: [word('Sport', 'رياضة'), word('Stein', 'حجر'), word('Kiste', 'صندوق')] },
  { label: 'ph', items: [word('Alphabet', 'أبجدية')] },
  { label: 'z', items: [word('Zahn', 'سنّ')] },
];

export const DIALOG_ROWS = [
  { label: 'A', items: [word('Wie heißen Sie?', 'ما اسمك؟ (بصيغة الاحترام)')] },
  { label: 'B', items: [word('Ich heiße Ahmad.', 'اسمي أحمد.')] },
  { label: 'A', items: [word('Wie schreibt man das?', 'كيف يُكتب ذلك؟')] },
  { label: 'B', items: [item('A – H – M – A – D', 'تهجئة أحمد', ['A', 'H', 'M', 'A', 'D'])] },
  { label: 'Ahmad', items: [item('A – H – M – A – D', 'تهجئة أحمد', ['A', 'H', 'M', 'A', 'D'])] },
  { label: 'Mira', items: [item('M – I – R – A', 'تهجئة ميرا', ['M', 'I', 'R', 'A'])] },
];

export const BOOK_PRACTICE = {
  'A1-01-01': { page: 2, rows: ALPHABET_ROWS },
  'A1-01-02': { page: 3, rows: SPECIAL_ROWS },
  'A1-01-03': { page: 4, rows: SOUND_ROWS },
  'A1-01-04': { page: 5, rows: DIALOG_ROWS },
};

export const getPracticeItems = (rows) => rows.flatMap((row, rowIndex) =>
  row.items.map((entry, itemIndex) => ({ ...entry, key: `${rowIndex}-${itemIndex}` })));

export const expandPracticeSpeech = (items) => items.flatMap((entry) =>
  (Array.isArray(entry.spoken) ? entry.spoken : [entry.spoken]).map((spoken) => ({ ...entry, spoken })));

export function getGermanVoices(voices) {
  return voices.filter((voice) => /^de(?:-DE)?$/i.test(voice.lang.replaceAll('_', '-')))
    .sort((a, b) => Number(/google|neural|natural/i.test(b.name)) - Number(/google|neural|natural/i.test(a.name)));
}

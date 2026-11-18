// Permanent public IDs printed in DeutschSprint books. Never reassign an ID.
// Set source only when the matching recording has been reviewed and uploaded.
export const DEUTSCHSPRINT_PATH = '/deutschsprint';
export const DEUTSCHSPRINT_EXERCISES_PATH = '/deutschsprint/a1/lektion-01/uebungen';
export const A1_FIRST_LESSON_PATH = '/level/a1/lesson/a1-01-01-alphabet-und-laute';

export const BOOK_AUDIO = [
  {
    id: 'A1-01-01', title: 'الأبجدية الألمانية', german: 'Das Alphabet',
    description: 'أسماء الحروف من A إلى Z مع الأمثلة. استمع ثم كرّر.', source: null,
  },
  {
    id: 'A1-01-02', title: 'الحروف الخاصة', german: 'Besondere Buchstaben',
    description: 'الحروف Ä وÖ وÜ وß مع الأمثلة، ببطء ثم بسرعة طبيعية.', source: null,
  },
  {
    id: 'A1-01-03', title: 'أساسيات النطق', german: 'Aussprache',
    description: 'التركيبات الصوتية مع أمثلة ومقارنة ei وie، وich وBuch.', source: null,
  },
  {
    id: 'A1-01-04', title: 'الحوار وتهجئة الأسماء', german: 'Buchstabieren',
    description: 'استمع إلى الحوار ثم تدرّب على تهجئة الأسماء ببطء.', source: null,
  },
];

export const audioPath = (id) => `/audio/${id.toLowerCase()}`;
export const findBookAudio = (id) => BOOK_AUDIO.find((track) => track.id === id?.toUpperCase()) ?? null;

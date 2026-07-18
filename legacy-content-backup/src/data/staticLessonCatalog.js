export const STATIC_LESSON_CATALOG = {
  A1: [
    'الأبجدية والنطق (Das Alphabet)',
    'التحيات والتعريف بالنفس (Begrüßung)',
    'الأرقام (Die Zahlen)',
    'الألوان (Die Farben)',
    'الأيام والشهور (Tage und Monate)',
    'الضمائر الشخصية (Personalpronomen)',
    'الأفعال الأساسية (Basisverben)',
    'بناء الجملة البسيطة (Der einfache Satz)',
  ],
  A2: ['الماضي التام (Das Perfekt)'],
  B1: ['الجمل الجانبية (Nebensätze: weil, dass, wenn, ob)'],
  B2: ['الجمل الموصولة (Relativsätze)'],
};

export const getStaticLessonEntries = (level) => (
  (STATIC_LESSON_CATALOG[level] || []).map((title) => ({ level, title, source: 'static' }))
);


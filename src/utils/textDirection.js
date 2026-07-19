const RTL_STRONG_CHAR = /[\p{Script=Arabic}\p{Script=Hebrew}]/u;
const LTR_STRONG_CHAR = /[\p{Script=Latin}]/u;

export const getTextDirection = (value, fallback = 'rtl') => {
  const text = String(value ?? '');
  for (const character of text) {
    if (RTL_STRONG_CHAR.test(character)) return 'rtl';
    if (LTR_STRONG_CHAR.test(character)) return 'ltr';
  }
  return fallback === 'ltr' ? 'ltr' : 'rtl';
};

export const getTextLanguage = (value, fallbackDirection = 'rtl') => (
  getTextDirection(value, fallbackDirection) === 'ltr' ? 'de' : 'ar'
);

export const getBidiTextProps = (value, fallbackDirection = 'rtl') => {
  const dir = getTextDirection(value, fallbackDirection);
  return { dir, lang: dir === 'ltr' ? 'de' : 'ar' };
};

const asSortOrder = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : Number.MAX_SAFE_INTEGER;
};

const compareText = (a, b) => String(a || '').localeCompare(String(b || ''), 'ar');

export const groupLessonsByUnit = (lessons) => {
  const units = new Map();
  (Array.isArray(lessons) ? lessons : []).forEach((lesson) => {
    if (!lesson || typeof lesson !== 'object') return;
    const key = String(lesson.unit || 'general').trim() || 'general';
    if (!units.has(key)) {
      units.set(key, {
        unit: key,
        unitOrder: asSortOrder(lesson.unitOrder),
        unitTitleAr: lesson.unitTitleAr || key,
        unitTitleDe: lesson.unitTitleDe || '',
        lessons: [],
      });
    }

    const unit = units.get(key);
    if ((!unit.unitTitleAr || unit.unitTitleAr === key) && lesson.unitTitleAr) unit.unitTitleAr = lesson.unitTitleAr;
    if (!unit.unitTitleDe && lesson.unitTitleDe) unit.unitTitleDe = lesson.unitTitleDe;
    if (unit.unitOrder === Number.MAX_SAFE_INTEGER && lesson.unitOrder) unit.unitOrder = asSortOrder(lesson.unitOrder);
    unit.lessons.push(lesson);
  });

  return [...units.values()]
    .filter((unit) => unit.lessons.length > 0)
    .map((unit) => ({
      ...unit,
      lessons: [...unit.lessons].sort((a, b) => (
        asSortOrder(a.order) - asSortOrder(b.order)
        || compareText(a.title, b.title)
      )),
    }))
    .sort((a, b) => a.unitOrder - b.unitOrder || compareText(a.unit, b.unit));
};

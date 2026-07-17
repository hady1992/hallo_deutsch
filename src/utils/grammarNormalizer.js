const asText = (value) => {
  if (typeof value === 'string' || typeof value === 'number') return String(value).trim();
  return '';
};

const normalizeTitle = (title) => {
  if (typeof title === 'string') return { ar: title.trim(), de: '' };
  if (!title || typeof title !== 'object' || Array.isArray(title)) return { ar: '', de: '' };

  return {
    ar: asText(title.ar || title.arabic || title.title),
    de: asText(title.de || title.german),
  };
};

const normalizeExample = (example) => {
  if (typeof example === 'string') {
    const parts = example.split(/\s*[—–]\s*/);
    return {
      de: asText(parts.shift()),
      ar: asText(parts.join(' — ')),
    };
  }

  if (!example || typeof example !== 'object' || Array.isArray(example)) {
    return { de: '', ar: '' };
  }

  return {
    ...example,
    de: asText(example.de || example.german || example.example),
    ar: asText(example.ar || example.arabic || example.translation),
  };
};

const normalizeExamples = (examples) => {
  const values = Array.isArray(examples) ? examples : (examples ? [examples] : []);
  return values
    .map(normalizeExample)
    .filter((example) => example.de || example.ar);
};

const normalizeNotes = (notes) => {
  const values = Array.isArray(notes)
    ? notes
    : (typeof notes === 'string' ? notes.split('|') : []);

  return values
    .map((note) => {
      if (note && typeof note === 'object' && !Array.isArray(note)) {
        return asText(note.text || note.ar || note.de || note.note);
      }
      return asText(note);
    })
    .filter(Boolean);
};

const normalizeTable = (table) => {
  if (!table || typeof table !== 'object' || Array.isArray(table)) return null;
  if (!Array.isArray(table.headers) || !Array.isArray(table.rows)) return null;

  const headers = table.headers.map(asText);
  const rows = table.rows
    .filter(Array.isArray)
    .map((row) => row.map(asText));

  return headers.length > 0 && rows.length > 0 ? { headers, rows } : null;
};

export const normalizeGrammarRuleForDisplay = (rule = {}) => {
  const safeRule = rule && typeof rule === 'object' && !Array.isArray(rule) ? rule : {};
  const explanation = safeRule.explanation && typeof safeRule.explanation === 'object'
    ? asText(
      safeRule.explanation.ar
      || safeRule.explanation.arabic
      || safeRule.explanation.de
      || safeRule.explanation.german
      || safeRule.explanation.text
    )
    : asText(safeRule.explanation);

  return {
    ...safeRule,
    title: normalizeTitle(safeRule.title),
    explanation,
    examples: normalizeExamples(safeRule.examples),
    notes: normalizeNotes(safeRule.notes),
    table: normalizeTable(safeRule.table),
  };
};


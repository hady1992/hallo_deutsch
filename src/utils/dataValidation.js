export const parseCSV = (text) => {
  const lines = text.split(/\r\n|\n|\r/).filter(line => line.trim());
  if (lines.length < 2) throw new Error("الملف لا يحتوي على بيانات كافية (صفوف).");
  
  // Handle CSV parsing with basic quote support
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  if (headers.length < 2) throw new Error("تنسيق CSV غير صحيح. تأكد من استخدام الفواصل.");

  return lines.slice(1).map((line, lineIdx) => {
    const values = [];
    let inQuote = false;
    let currentValue = '';
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuote = !inQuote;
      } else if (char === ',' && !inQuote) {
        values.push(currentValue.trim().replace(/^"|"$/g, ''));
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim().replace(/^"|"$/g, ''));

    // Construct nested object
    const obj = {};
    headers.forEach((header, index) => {
      if (values[index] !== undefined) {
        let value = values[index];
        
        // Basic type inference
        if (value.toLowerCase() === 'true') value = true;
        else if (value.toLowerCase() === 'false') value = false;
        
        // Handle Dot Notation (e.g. conjugation.Präsens.ich)
        const keys = header.split('.');
        let current = obj;
        
        for (let k = 0; k < keys.length - 1; k++) {
            const key = keys[k];
            if (!current[key]) current[key] = {};
            current = current[key];
        }
        
        const lastKey = keys[keys.length - 1];
        
        // Handle Arrays (pipe separated)
        if (typeof value === 'string' && value.includes('|')) {
            current[lastKey] = value.split('|').map(s => s.trim());
        } else {
            current[lastKey] = value;
        }
      }
    });
    return obj;
  });
};

export const parseJSON = (text) => {
    try {
        const content = JSON.parse(text);
        return Array.isArray(content) ? content : [content];
    } catch (err) {
        throw new Error(`JSON Error: ${err.message}`);
    }
};

export const validateGrammarRule = (rule, index) => {
    const errors = [];
    if (!rule.title) errors.push("العنوان (title) مفقود");
    
    // Allow level to be nested or flat
    const level = rule.level;
    if (!level) errors.push("المستوى (level) مفقود");
    else {
        const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        if (!validLevels.includes(level.toUpperCase())) errors.push("المستوى غير صحيح (يجب أن يكون A1-C2)");
    }
    
    if (!rule.explanation) errors.push("الشرح (explanation) مفقود");
    
    return { valid: errors.length === 0, errors, row: index + 1 };
};

export const validateExamModel = (model, index) => {
    const errors = [];
    if (!model.name) errors.push("الاسم (name) مفقود");
    
    const level = model.level;
    if (!level) errors.push("المستوى (level) مفقود");
    
    if (!model.pdfUrl && !model.audioUrl) errors.push("يجب توفر رابط PDF أو ملف صوتي على الأقل");

    return { valid: errors.length === 0, errors, row: index + 1 };
};

export const validateFileFormat = (file) => {
    const fileName = file.name.toLowerCase();
    return fileName.endsWith('.json') || fileName.endsWith('.csv');
};
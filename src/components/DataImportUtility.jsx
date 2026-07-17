import React, { useState, useRef } from 'react';
import { Check, AlertTriangle, FileText, FileUp, Loader2, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { migrateVerbData } from '@/utils/verbDataMigration';
import { nounsDatabase } from '@/data/nounsDatabase';
import { vocabularyA1 } from '@/data/vocabularyA1';
import { vocabularyA2 } from '@/data/vocabularyA2';
import { vocabularyB1 } from '@/data/vocabularyB1';
import { vocabularyB2 } from '@/data/vocabularyB2';
import { dedupeByKey, getContentDedupKey, splitNewUniqueItems } from '@/utils/contentDedupUtils';
import { publishContentItems } from '@/services/contentRepository';

const DEFAULT_REFERENCES = {
  nouns: nounsDatabase,
  vocabulary: [...vocabularyA1, ...vocabularyA2, ...vocabularyB1, ...vocabularyB2],
  verbs: [],
  grammar: [],
};

export const parseImportCSV = (text) => {
  const rows = [];
  let row = [];
  let currentValue = '';
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentValue += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentValue.trim());
      currentValue = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') index += 1;
      row.push(currentValue.trim());
      if (row.some((value) => value !== '')) rows.push(row);
      row = [];
      currentValue = '';
    } else {
      currentValue += char;
    }
  }

  row.push(currentValue.trim());
  if (row.some((value) => value !== '')) rows.push(row);
  if (inQuotes) throw new Error('تنسيق CSV غير صحيح: توجد علامة اقتباس غير مغلقة.');
  if (rows.length < 2) throw new Error('الملف لا يحتوي على بيانات كافية (صفوف).');

  const headers = rows[0].map((header) => String(header).replace(/^\uFEFF/, '').trim());
  if (headers.length < 2) throw new Error('تنسيق CSV غير صحيح. تأكد من استخدام الفواصل.');

  return rows.slice(1).map((values) => {
    const item = {};

    headers.forEach((header, index) => {
      if (!header || values[index] === undefined) return;

      const parts = header.split('.');
      let current = item;

      for (let partIndex = 0; partIndex < parts.length - 1; partIndex += 1) {
        const part = parts[partIndex];
        const nextPart = parts[partIndex + 1];
        const isArray = /^\d+$/.test(nextPart);
        if (!current[part]) current[part] = isArray ? [] : {};
        current = current[part];
      }

      current[parts[parts.length - 1]] = values[index];
    });

    return item;
  });
};

const DataImportUtility = ({ contentType = 'verbs', className }) => {
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [importStats, setImportStats] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const getLabel = () => {
    switch(contentType) {
        case 'verbs': return 'أفعال (نسخة مطورة)';
        case 'nouns': return 'أسماء';
        case 'vocabulary': return 'مفردات عامة';
        case 'grammar': return 'قواعد اللغة';
        default: return 'بيانات';
    }
  };

  const handleButtonClick = () => {
    if (isProcessing) return;

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const downloadTemplate = () => {
    let csvContent = "";
    let filename = "";

    if (contentType === 'verbs') {
      csvContent = "german,translation,type,level,conjugations.Präsens.ich,conjugations.Präsens.du,conjugations.Präteritum.ich,examples.Präsens.de,examples.Präsens.ar\nmachen,يفعل,weak,A1,mache,machst,machte,Was machst du?,ماذا تفعل؟";
      filename = "verbs_template_v2.csv";
    } else if (contentType === 'nouns') {
      csvContent = "german,translation,article,noun,gender,plural,example,exampleArabic\nder Mann,الرجل,der,Mann,masculine,die Männer,Der Mann arbeitet.,الرجل يعمل.";
      filename = "nouns_template.csv";
    } else if (contentType === 'vocabulary') {
      csvContent = "german,translation,type,level,category,pronunciation,example,exampleArabic\ngut,جيد,صفة,A1,عام,gut,Das ist gut.,هذا جيد.";
      filename = "vocabulary_template.csv";
    } else if (contentType === 'grammar') {
      csvContent = `title,level,explanation,examples,notes
Nominativ,A1,"The subject of the sentence performing the action.","Der Mann ist groß.|Die Frau singt.","The basic form of nouns."
Akkusativ,A1,"The direct object receiving the action.","Ich sehe den Mann.|Wir essen den Apfel.","Changes masculine 'der' to 'den'."
Dativ,A2,"The indirect object, indicating to whom or for whom an action is done.","Ich gebe dem Mann ein Buch.|Sie hilft der Frau.","Often used with prepositions like 'mit', 'nach', 'von', 'zu'."
Genitiv,B1,"Indicates possession or belonging.","Das ist das Auto des Mannes.|Die Farbe der Blume ist schön.","Often translated with 'of the', but used less frequently in spoken German."`;
      filename = "grammar_rules_template.csv";
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const fileName = selectedFile.name.toLowerCase();

      if (!fileName.endsWith('.json') && !fileName.endsWith('.csv')) {
        toast({
          title: "نوع الملف غير مدعوم",
          description: "يرجى اختيار ملف بصيغة .json أو .csv",
          variant: "destructive"
        });
        return;
      }
      setFile(selectedFile);
      setImportStats(null);
      setValidationErrors([]);
    }
  };

  const validateVerbData = (data) => {
    const validItems = [];
    const errors = [];

    data.forEach((item, index) => {
        const rowNum = index + 1;
        const itemErrors = [];
        const uniqueId = `custom_v_${Date.now()}_${index}`;

        const german = item.german || item.infinitive;
        const translation = item.translation;
        const type = item.type;
        let conjugations = item.conjugations || item.conjugation;
        const examples = item.examples;

        if (!german) itemErrors.push("الحقل 'german' أو 'infinitive' مفقود");
        if (!translation) itemErrors.push("الحقل 'translation' مفقود");
        if (!type) itemErrors.push("الحقل 'type' مفقود");

        // Flexible Conjugation Validation
        if (!conjugations || typeof conjugations !== 'object') {
           // If conjugations are missing, it's a soft error, allow empty object.
           conjugations = {};
        }

        if (itemErrors.length === 0) {
            const migratedItem = migrateVerbData({
                ...item,
                id: item.id || uniqueId,
                german: german,
                infinitive: german,
                translation: translation,
                type: type || 'weak',
                conjugations: conjugations,
                examples: examples || {}
            });

            validItems.push(migratedItem);
        } else {
            errors.push({ row: rowNum, messages: itemErrors });
        }
    });
    return { validItems, errors };
  };

  const validateNounData = (data) => {
    const validItems = [];
    const errors = [];

    data.forEach((item, index) => {
        const rowNum = index + 1;
        const itemErrors = [];
        const uniqueId = `custom_n_${Date.now()}_${index}`;

        const german = String(item.german || '').trim();
        const translation = String(item.translation || '').trim();
        const article = String(item.article || '').trim().toLowerCase();
        const noun = String(item.noun || '').trim();
        const gender = String(item.gender || '').trim().toLowerCase();

        if (!german) itemErrors.push("الحقل 'german' مفقود");
        if (!translation) itemErrors.push("الحقل 'translation' مفقود");
        if (!noun) itemErrors.push("الحقل 'noun' مفقود");
        if (!gender) itemErrors.push("الحقل 'gender' مفقود");
        if (!article) itemErrors.push("الحقل 'article' مفقود");

        const validArticles = ['der', 'die', 'das'];
        if (article && !validArticles.includes(article)) {
             itemErrors.push(`أداة التعريف '${article}' غير صحيحة. يجب أن تكون der, die, أو das.`);
        }

        if (itemErrors.length === 0) {
            validItems.push({
                ...item,
                id: item.id || uniqueId,
                german,
                translation,
                article,
                noun,
                gender,
                plural: String(item.plural || '-').trim(),
                example: String(item.example || '').trim(),
                exampleArabic: String(item.exampleArabic || '').trim(),
                level: item.level || 'A1',
            });
        } else {
            errors.push({ row: rowNum, messages: itemErrors });
        }
    });

    return { validItems, errors };
  };

  const validateVocabularyData = (data) => {
    const validItems = [];
    const errors = [];

    data.forEach((item, index) => {
        const rowNum = index + 1;
        const itemErrors = [];
        const uniqueId = `custom_voc_${Date.now()}_${index}`;

        // Required fields
        if (!item.german) itemErrors.push("الحقل 'german' مفقود");
        if (!item.translation && !item.arabic) itemErrors.push("الحقل 'translation' أو 'arabic' مفقود");
        if (!item.type) itemErrors.push("الحقل 'type' مفقود");
        if (!item.example) itemErrors.push("الحقل 'example' مفقود");
        if (!item.exampleArabic) itemErrors.push("الحقل 'exampleArabic' مفقود");

        if (itemErrors.length === 0) {
            validItems.push({
                ...item,
                id: item.id || uniqueId,
                german: item.german,
                arabic: item.translation || item.arabic,
                type: item.type,
                level: item.level || 'A1',
                category: item.category || 'عام',
                pronunciation: item.pronunciation || '',
                example: item.example,
                exampleArabic: item.exampleArabic
            });
        } else {
            errors.push({ row: rowNum, messages: itemErrors });
        }
    });

    return { validItems, errors };
  };

  const validateGrammarData = (data) => {
    const validItems = [];
    const errors = [];

    data.forEach((item, index) => {
        const rowNum = index + 1;
        const itemErrors = [];
        const uniqueId = `custom_gram_${Date.now()}_${index}`;

        if (!item.title) itemErrors.push("الحقل 'title' مفقود");
        if (!item.level) itemErrors.push("الحقل 'level' مفقود");
        if (!item.explanation) itemErrors.push("الحقل 'explanation' مفقود");

        if (itemErrors.length === 0) {
            // Handle array fields that might come as strings from CSV
            let examples = item.examples;
            if (typeof examples === 'string') {
                examples = examples.includes('|') ? examples.split('|').map(s => s.trim()) : [examples];
            }

            validItems.push({
                ...item,
                id: item.id || uniqueId,
                title: item.title,
                level: item.level,
                explanation: item.explanation,
                examples: examples || [],
                notes: item.notes || '',
                uploadedAt: new Date().toISOString()
            });
        } else {
            errors.push({ row: rowNum, messages: itemErrors });
        }
    });

    return { validItems, errors };
  };

  const processImport = async () => {
    if (!file) return;

    setIsProcessing(true);
    setImportStats(null);
    setValidationErrors([]);

    try {
        let content;
        // Parse File
        const reader = new FileReader();

        const text = await new Promise((resolve, reject) => {
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });

        if (file.name.toLowerCase().endsWith('.csv')) {
            content = parseImportCSV(text);
        } else {
            try {
                content = JSON.parse(text);
            } catch (err) {
                console.error('JSON parse error:', err);
                throw new Error('صيغة الملف غير صحيحة.');
            }
        }

        if (!Array.isArray(content)) content = [content];

        // Validate & Migrate
        let validationResult;
        let storageKey;

        if (contentType === 'verbs') {
            validationResult = validateVerbData(content);
            storageKey = 'importedVerbs';
        } else if (contentType === 'nouns') {
            validationResult = validateNounData(content);
            storageKey = 'importedNouns';
        } else if (contentType === 'vocabulary') {
            validationResult = validateVocabularyData(content);
            storageKey = 'importedVocabulary';
        } else if (contentType === 'grammar') {
            validationResult = validateGrammarData(content);
            storageKey = 'importedGrammarRules';
        } else {
            validationResult = { validItems: content, errors: [] };
        }

        const { validItems, errors } = validationResult;

        if (errors.length > 0) {
            setValidationErrors(errors);
        }

        if (validItems.length > 0) {
            let existingData = [];
            try {
              const storedData = JSON.parse(localStorage.getItem(storageKey) || '[]');
              existingData = Array.isArray(storedData) ? storedData : [];
            } catch {
              existingData = [];
            }

            const dedupKey = (item) => getContentDedupKey(contentType, item);
            const { unique: newItems, skipped: localDuplicates } = splitNewUniqueItems(
              validItems,
              DEFAULT_REFERENCES[contentType] || [],
              dedupKey
            );
            const publishResult = await publishContentItems(contentType, newItems);

            if (!publishResult.success) {
              setImportStats({
                count: 0,
                duplicates: localDuplicates,
                total: content.length,
                errors: errors.length,
                publication: 'failed',
                publicationMessage: 'فشل الحفظ السحابي، لن يظهر المحتوى للزوار',
              });
              clearSelectedFile();
              toast({
                title: "فشل النشر",
                description: "فشل الحفظ السحابي، لن يظهر المحتوى للزوار",
                variant: "destructive"
              });
              return;
            }

            // Local storage is an offline backup only after cloud publication succeeds.
            const mergedData = dedupeByKey([...existingData, ...newItems], dedupKey, { prefer: 'last' });
            localStorage.setItem(storageKey, JSON.stringify(mergedData));

            setImportStats({
                count: publishResult.count,
                duplicates: localDuplicates + publishResult.duplicates,
                total: content.length,
                errors: errors.length,
                publication: 'published',
                publicationMessage: 'تم النشر للزوار',
            });
            clearSelectedFile();
            window.dispatchEvent(new Event('dataImported'));

            toast({
                title: "تم النشر للزوار",
                description: `تم إضافة: ${publishResult.count}، تم تجاهل مكرر: ${localDuplicates + publishResult.duplicates}، أخطاء: ${errors.length}.`,
                className: errors.length === 0
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-yellow-50 border-yellow-200 text-yellow-800"
            });
        } else {
             setImportStats({
                count: 0,
                duplicates: 0,
                total: content.length,
                errors: errors.length,
                publication: 'invalid',
                publicationMessage: 'لم يبدأ النشر بسبب أخطاء الملف',
             });
             clearSelectedFile();
             toast({
                title: "فشل الاستيراد",
                description: "لم يتم قبول أي عناصر. يرجى مراجعة الأخطاء.",
                variant: "destructive"
            });
        }

      } catch (error) {
        console.error(error);
        setImportStats({
          count: 0,
          duplicates: 0,
          total: 0,
          errors: 1,
          publication: 'invalid',
          publicationMessage: 'لم يبدأ النشر بسبب خطأ في الملف',
        });
        clearSelectedFile();
        toast({
          title: "خطأ في الملف",
          description: error.message && /[\u0600-\u06FF]/.test(error.message) ? error.message : 'صيغة الملف غير صحيحة.',
          variant: "destructive"
        });
      } finally {
        setIsProcessing(false);
      }
  };

  const clearSelectedFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCancel = () => {
    clearSelectedFile();
    setImportStats(null);
    setValidationErrors([]);
  };

  return (
    <div className={cn("w-full mb-8", className)}>
      <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".json,.csv"
          onChange={handleFileChange}
      />

      <div className="flex gap-2 mb-2">
         <Button
            onClick={handleButtonClick}
            className={cn("flex-1 bg-slate-900 hover:bg-slate-800 text-white shadow-md p-6 h-auto flex flex-col items-center gap-2 rounded-xl",
              contentType === 'grammar' ? 'bg-amber-600 hover:bg-amber-700' : ''
            )}
        >
            <div className="flex items-center gap-2 text-lg font-bold">
                <FileUp size={24} />
                <span>رفع ملف {getLabel()}</span>
            </div>
            <span className="text-white/70 text-sm font-normal">JSON أو CSV</span>
        </Button>
        <Button
            onClick={downloadTemplate}
            variant="outline"
            className="flex-shrink-0 h-auto flex flex-col items-center justify-center p-4 rounded-xl border-dashed"
            title="تحميل قالب"
        >
            <FileDown size={20} className="mb-1" />
            <span className="text-xs">قالب</span>
        </Button>
      </div>


      <AnimatePresence>
        {file && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-4"
            data-testid="selected-import-file-panel"
          >
             <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4">
                {/* File Info */}
                <div className="mb-4 flex min-w-0 items-center gap-3">
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                            <FileText size={24} />
                        </div>
                        <div className="min-w-0">
                            <p className="break-all font-bold text-slate-800 text-sm">{file.name}</p>
                            <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                    <Button
                        type="button"
                        onClick={processImport}
                        disabled={isProcessing}
                        className="w-full gap-2 bg-red-600 hover:bg-red-700"
                        data-testid="import-file-action"
                    >
                        {isProcessing ? (
                          <>
                            <Loader2 className="animate-spin" size={18} />
                            جاري الاستيراد...
                          </>
                        ) : (
                          <>
                            <FileUp size={18} />
                            استيراد الآن
                          </>
                        )}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCancel} disabled={isProcessing} className="w-full">
                        إلغاء
                    </Button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {importStats && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-3 flex items-center gap-2 font-black text-slate-800">
              {importStats.publication === 'published' ? (
                <Check className="text-green-600" size={20} />
              ) : (
                <AlertTriangle className="text-red-600" size={20} />
              )}
              تقرير الاستيراد
            </div>
            <div className="grid gap-2 text-sm font-bold sm:grid-cols-3">
              <span className="rounded-md bg-green-100 px-3 py-2 text-green-700">تم إضافة: {importStats.count}</span>
              <span className="rounded-md bg-yellow-100 px-3 py-2 text-yellow-800">تم تجاهل مكرر: {importStats.duplicates || 0}</span>
              <span className="rounded-md bg-red-100 px-3 py-2 text-red-700">أخطاء: {importStats.errors}</span>
            </div>
            <div className={cn(
              'mt-3 rounded-md px-3 py-2 text-sm font-black',
              importStats.publication === 'published'
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            )}>
              حالة النشر: {importStats.publicationMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {validationErrors.length > 0 && (
          <div className="mt-4 max-h-60 overflow-y-auto rounded-lg border border-red-100 bg-red-50 p-4">
              <div className="sticky top-0 mb-2 flex items-center gap-2 bg-red-50 pb-2 font-bold text-red-700">
                  <AlertTriangle size={18} />
                  <span>تم العثور على أخطاء ({validationErrors.length})</span>
              </div>
              <ul className="space-y-2">
                  {validationErrors.map((err, idx) => (
                      <li key={idx} className="rounded border border-red-100 bg-white p-2 text-xs text-red-600">
                          <span className="block font-bold text-red-800">صف (Row) {err.row}:</span>
                          {err.messages.join(', ')}
                      </li>
                  ))}
              </ul>
          </div>
      )}
    </div>
  );
};

export default DataImportUtility;

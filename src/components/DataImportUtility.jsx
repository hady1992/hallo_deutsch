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
import { getContentDedupKey, splitNewUniqueItems } from '@/utils/contentDedupUtils';

const DEFAULT_REFERENCES = {
  nouns: nounsDatabase,
  vocabulary: [...vocabularyA1, ...vocabularyA2, ...vocabularyB1, ...vocabularyB2],
  verbs: [],
  grammar: [],
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

  const parseCSV = (text) => {
    const lines = text.split(/\r\n|\n|\r/).filter(line => line.trim());
    if (lines.length < 2) throw new Error("الملف لا يحتوي على بيانات كافية (صفوف).");
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    if (headers.length < 2) throw new Error("تنسيق CSV غير صحيح. تأكد من استخدام الفواصل.");

    return lines.slice(1).map((line, lineIdx) => {
      const values = [];
      let inQuote = false;
      let currentValue = '';
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' && (i === 0 || line[i-1] === ',' || line[i-1] === ' ' || line[i-1] === '\n')) { // Start or end of a quoted field
          inQuote = !inQuote;
          if (!inQuote && line[i+1] === '"') { // Handle escaped quotes inside field
            currentValue += '"';
            i++;
          }
        } else if (char === ',' && !inQuote) {
          values.push(currentValue.trim().replace(/^"|"$/g, ''));
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim().replace(/^"|"$/g, '')); // Add last value

      const obj = {};
      headers.forEach((header, index) => {
        if (values[index] !== undefined) {
             const val = values[index];
             if (header.includes('.')) {
                 const parts = header.split('.');
                 let current = obj;
                 for(let k=0; k<parts.length-1; k++) {
                     const nextPart = parts[k+1];
                     // Only array if next part is strictly a number
                     const isArray = !isNaN(nextPart) && !isNaN(parseFloat(nextPart));
                     
                     if (!current[parts[k]]) {
                        current[parts[k]] = isArray ? [] : {};
                     }
                     current = current[parts[k]];
                 }
                 current[parts[parts.length-1]] = val;
             } else {
                 obj[header] = val;
             }
        }
      });
      return obj;
    });
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

        if (!item.german) itemErrors.push("الحقل 'german' مفقود");
        if (!item.translation) itemErrors.push("الحقل 'translation' مفقود");
        if (!item.noun) itemErrors.push("الحقل 'noun' مفقود");
        if (!item.gender) itemErrors.push("الحقل 'gender' مفقود");
        if (!item.article) itemErrors.push("الحقل 'article' مفقود");
        
        const validArticles = ['der', 'die', 'das'];
        if (item.article && !validArticles.includes(item.article.toLowerCase())) {
             itemErrors.push(`أداة التعريف '${item.article}' غير صحيحة. يجب أن تكون der, die, أو das.`);
        }
        
        if (itemErrors.length === 0) {
            validItems.push({
                ...item,
                id: item.id || uniqueId,
                article: item.article || (item.gender === 'masculine' ? 'der' : item.gender === 'feminine' ? 'die' : 'das'),
                plural: item.plural || '-',
                example: item.example || '',
                exampleArabic: item.exampleArabic || ''
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
            content = parseCSV(text);
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
            const existingData = JSON.parse(localStorage.getItem(storageKey) || '[]');
            const referenceData = [
              ...(DEFAULT_REFERENCES[contentType] || []),
              ...existingData,
            ];
            const dedupKey = (item) => getContentDedupKey(contentType, item);
            const { unique: newItems, skipped: duplicates } = splitNewUniqueItems(validItems, referenceData, dedupKey);
            const mergedData = [...existingData, ...newItems];
            localStorage.setItem(storageKey, JSON.stringify(mergedData));

            setImportStats({
                count: newItems.length,
                duplicates,
                total: content.length,
                errors: errors.length
            });

            if (errors.length === 0) {
                toast({
                    title: newItems.length > 0 ? "تم الاستيراد بنجاح" : "لم تتم إضافة عناصر جديدة",
                    description: `تمت إضافة ${newItems.length}، وتم تجاهل مكرر: ${duplicates}، أخطاء: ${errors.length}.`,
                    className: "bg-green-50 border-green-200 text-green-800"
                });
                 setTimeout(() => {
                    setFile(null);
                    setImportStats(null);
                    setValidationErrors([]);
                    window.dispatchEvent(new Event('dataImported'));
                }, 2000);
            } else {
                 toast({
                     title: "تم الاستيراد جزئياً",
                    description: `تمت إضافة ${newItems.length}، وتم تجاهل مكرر: ${duplicates}، أخطاء: ${errors.length}.`,
                     variant: "warning"
                });
            }
        } else {
             toast({
                title: "فشل الاستيراد",
                description: "لم يتم قبول أي عناصر. يرجى مراجعة الأخطاء.",
                variant: "destructive"
            });
        }

      } catch (error) {
        console.error(error);
        toast({
          title: "خطأ في الملف",
          description: error.message && /[\u0600-\u06FF]/.test(error.message) ? error.message : 'صيغة الملف غير صحيحة.',
          variant: "destructive"
        });
      } finally {
        setIsProcessing(false);
      }
  };

  const handleCancel = () => {
    setFile(null);
    setImportStats(null);
    setValidationErrors([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
              contentType === 'grammar' ? 'bg-orange-600 hover:bg-orange-700' : ''
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
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-4"
          >
             <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4">
                {/* File Info */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <FileText size={24} />
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 text-sm">{file.name}</p>
                            <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {!importStats || validationErrors.length > 0 ? (
                            <>
                                <Button onClick={processImport} disabled={isProcessing} className="bg-blue-600">
                                    {isProcessing ? <Loader2 className="animate-spin" /> : 'استيراد وتحويل'}
                                </Button>
                                <Button variant="outline" onClick={handleCancel} disabled={isProcessing}>
                                    إلغاء
                                </Button>
                            </>
                        ) : (
                             <div className="text-green-700 bg-green-50 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                                <Check size={18} /> تم بنجاح
                             </div>
                        )}
                    </div>
                </div>

                {/* Validation Errors Box */}
                {importStats && (
                    <div className="mb-4 grid gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm font-bold text-slate-700 sm:grid-cols-3">
                        <span className="rounded-md bg-green-100 px-3 py-2 text-green-700">تمت إضافة: {importStats.count}</span>
                        <span className="rounded-md bg-yellow-100 px-3 py-2 text-yellow-800">تم تجاهل مكرر: {importStats.duplicates || 0}</span>
                        <span className="rounded-md bg-red-100 px-3 py-2 text-red-700">أخطاء: {importStats.errors}</span>
                    </div>
                )}

                {validationErrors.length > 0 && (
                    <div className="bg-red-50 border border-red-100 rounded-lg p-4 max-h-60 overflow-y-auto">
                        <div className="flex items-center gap-2 text-red-700 font-bold mb-2 sticky top-0 bg-red-50 pb-2">
                            <AlertTriangle size={18} />
                            <span>تم العثور على أخطاء ({validationErrors.length})</span>
                        </div>
                        <ul className="space-y-2">
                            {validationErrors.map((err, idx) => (
                                <li key={idx} className="text-xs text-red-600 bg-white p-2 rounded border border-red-100">
                                    <span className="font-bold block text-red-800">صفحة (Row) {err.row}:</span>
                                    {err.messages.join(', ')}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DataImportUtility;

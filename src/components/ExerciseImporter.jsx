import React, { useState, useEffect, useRef } from 'react';
import { FileUp, Trash2, FileText, ChevronDown, ChevronUp, Search, FileDown, FileJson, AlertTriangle, Check, Loader2, Database, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getPersistentExercises, saveExercises } from '@/utils/persistentDataStorage';
import { Badge } from '@/components/ui/badge';
import { getExerciseDedupKey, splitNewUniqueItems } from '@/utils/contentDedupUtils';

// رسائل عربية مبسّطة تُعرض للمستخدم دائمًا. التفاصيل التقنية الكاملة (سبب رفض
// كل عنصر بالضبط) تُسجَّل بالـ Console فقط عبر console.error.
const FRIENDLY_ERRORS = {
  BAD_FORMAT: 'صيغة الملف غير صحيحة',
  NO_VALID_ITEMS: 'الملف لا يحتوي على أسئلة صالحة',
  PARTIAL_SKIPPED: 'تم استيراد بعض العناصر وتجاهل العناصر الناقصة',
};

const ExerciseImporter = () => {
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  
  // Data State
  const [exercises, setExercises] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingData, setLoadingData] = useState(false);
  
  // Import State
  const [isImporting, setIsImporting] = useState(false);
  const [importStats, setImportStats] = useState(null);

  const loadData = async () => {
      setLoadingData(true);
      try {
        const data = await getPersistentExercises();
        setExercises(data || []);
      } catch (e) {
          console.error("Failed to load:", e);
      } finally {
          setLoadingData(false);
      }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('exercisesUpdated', loadData);
    return () => {
        window.removeEventListener('exercisesUpdated', loadData);
    };
  }, []);

  const downloadTemplate = () => {
    const csvContent = `question,optionA,optionB,optionC,optionD,correctAnswer,difficulty,category,type
"Was ist das?",Das Auto,Der Baum,Die Katze,Der Hund,Das Auto,easy,A1,multipleChoice
"Ich _____ nach Hause.",gehe,geht,gehen,gehst,gehe,medium,A1,multipleChoice
"Der Zug ist _____ als der Bus.",schnell,schneller,am schnellsten,schnellsten,schneller,medium,A2,multipleChoice`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "exercises_template.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    toast({
        title: "تم التحميل",
        description: "تم تحميل قالب التمارين (CSV) بنجاح.",
        className: "bg-green-50 border-green-200 text-green-800"
    });
  };

  const downloadJsonTemplate = () => {
    const jsonContent = JSON.stringify([
      {
        question: "Ich ___ Ahmad.",
        questionArabic: "اختر الفعل الصحيح.",
        audioText: "Ich heiße Ahmad.",
        options: ["bin", "bist", "ist", "sind"],
        correctAnswer: "bin",
        difficulty: "easy",
        level: "A1",
        type: "multipleChoice",
        category: "sein",
        explanation: "مع ich نستخدم bin."
      },
      {
        question: "Das ist ___ Auto.",
        questionArabic: "اختر أداة النكرة الصحيحة.",
        options: ["ein", "eine", "einen", "einer"],
        correctAnswer: "ein",
        difficulty: "medium",
        level: "A1",
        type: "multipleChoice",
        category: "artikel"
      }
    ], null, 2);

    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "exercises_template.json");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
        title: "تم التحميل",
        description: "تم تحميل قالب التمارين (JSON) بنجاح.",
        className: "bg-green-50 border-green-200 text-green-800"
    });
  };

  // تحويل الإجابة الصحيحة إلى رقم موضع الخيار (index) عند الحاجة:
  // - إن كانت رقمًا أصلًا، تُترك كما هي.
  // - إن كانت نصًا مطابقًا لأحد عناصر options، تُحوَّل لرقم موضعه.
  // - إن تعذّر إيجاد تطابق، تُرجع -1 (يُعتبر العنصر غير صالح ويُستبعد).
  const normalizeCorrectAnswer = (options, correctAnswer) => {
    if (typeof correctAnswer === 'number') {
      return (correctAnswer >= 0 && correctAnswer < options.length) ? correctAnswer : -1;
    }
    const idx = options.findIndex(o => String(o).trim() === String(correctAnswer).trim());
    return idx;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
    e.target.value = ''; // Reset input
  };

  const processFile = async (file) => {
    setIsImporting(true);
    setImportStats(null);

    try {
      const isJson = file.name.toLowerCase().endsWith('.json');
      const { newExercises, errors } = isJson
        ? await processJsonFile(file)
        : await processCsvFile(file);

      if (newExercises.length === 0) throw new Error(FRIENDLY_ERRORS.NO_VALID_ITEMS);

      // Fetch fresh list
      const currentExercises = await getPersistentExercises();

      const { unique, skipped: duplicates } = splitNewUniqueItems(
        newExercises,
        currentExercises,
        getExerciseDedupKey
      );

      if (unique.length === 0 && errors === 0) {
        setImportStats({ success: 0, duplicates, errors });
        toast({
          title: "لم تتم إضافة تمارين جديدة",
          description: `تم تجاهل مكرر: ${duplicates}.`,
          variant: "warning"
        });
        return;
      }

      // Only keep custom ones for saving back (exclude defaults to avoid bloat)
      const customOnly = currentExercises.filter(ex => ex.source !== 'default');
      const merged = [...customOnly, ...unique];

      // Save
      const result = await saveExercises(merged);

      setImportStats({ success: unique.length, duplicates, errors });

      // Update View
      loadData();
      window.dispatchEvent(new Event('exercisesUpdated'));

      if (result.success) {
        toast({
          title: "تم الاستيراد بنجاح",
          description: `تمت إضافة ${unique.length} تمرين، وتم تجاهل مكرر: ${duplicates}، أخطاء: ${errors}.`,
          className: "bg-green-50 border-green-200 text-green-800"
        });
      } else {
        toast({
          title: "فشل النشر",
          description: "فشل الحفظ السحابي، لن يظهر المحتوى للزوار",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('خطأ استيراد تمارين:', error);
      toast({
        title: "خطأ في الاستيراد",
        description: error.message || FRIENDLY_ERRORS.BAD_FORMAT,
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const processCsvFile = async (file) => {
    const text = await file.text();
    const lines = text.split(/\r\n|\n|\r/).filter(line => line.trim());

    if (lines.length < 2) throw new Error(FRIENDLY_ERRORS.BAD_FORMAT);

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    // Basic required headers
    const requiredHeaders = ['question', 'correctAnswer', 'category'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

    if (missingHeaders.length > 0) {
      console.error('أعمدة CSV مفقودة:', missingHeaders);
      throw new Error(FRIENDLY_ERRORS.BAD_FORMAT);
    }

    const newExercises = [];
    let errors = 0;

    for (let i = 1; i < lines.length; i++) {
      try {
        // Better CSV parser loop
        const row = [];
        let inQuote = false;
        let val = '';
        for (let char of lines[i]) {
          if (char === '"') inQuote = !inQuote;
          else if (char === ',' && !inQuote) {
            row.push(val.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
            val = '';
          }
          else val += char;
        }
        row.push(val.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));

        const obj = {};
        headers.forEach((h, idx) => {
          obj[h] = row[idx] || '';
        });

        if (!obj.question || !obj.correctAnswer || !obj.category) {
          errors++;
          continue;
        }

        const options = [obj.optionA, obj.optionB, obj.optionC, obj.optionD].filter(o => o && o.trim() !== '');
        const correctIdx = normalizeCorrectAnswer(options, obj.correctAnswer);
        if (correctIdx < 0) {
          console.error(`تعذر مطابقة الإجابة الصحيحة بالسطر ${i}:`, obj.correctAnswer, options);
          errors++;
          continue;
        }

        // Construct ID
        const id = crypto.randomUUID ? crypto.randomUUID() : `custom_ex_${Date.now()}_${i}`;

        newExercises.push({
          id: id,
          type: obj.type || 'multipleChoice', // Default type
          question: obj.question,
          options,
          correctAnswer: correctIdx,
          difficulty: obj.difficulty || 'medium',
          level: obj.category || 'A1',
          topic: obj.topic || 'مستورد',
          uploadedAt: new Date().toISOString(),
          source: 'local'
        });
      } catch (err) {
        console.error(`Error parsing row ${i}:`, err);
        errors++;
      }
    }

    return { newExercises, errors };
  };

  // تحقق من عنصر تمرين واحد بصيغة JSON، ويرجع قائمة الأخطاء (فارغة = صالح).
  const validateExerciseItem = (item) => {
    const errors = [];
    if (!item.question || typeof item.question !== 'string') errors.push('question مطلوب');
    if (!Array.isArray(item.options) || item.options.length === 0) errors.push('options يجب أن تكون قائمة (array)');
    if (item.correctAnswer === undefined || item.correctAnswer === null || item.correctAnswer === '') errors.push('correctAnswer مطلوب');
    return errors;
  };

  const processJsonFile = async (file) => {
    const text = await file.text();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      console.error('JSON parse error:', e);
      throw new Error(FRIENDLY_ERRORS.BAD_FORMAT);
    }

    const itemsArray = Array.isArray(parsed) ? parsed : [parsed];
    if (itemsArray.length === 0) throw new Error(FRIENDLY_ERRORS.NO_VALID_ITEMS);

    const newExercises = [];
    let errors = 0;

    itemsArray.forEach((item, idx) => {
      const itemErrors = validateExerciseItem(item);
      if (itemErrors.length > 0) {
        console.error(`سؤال ${idx + 1} غير صالح:`, itemErrors, item);
        errors++;
        return;
      }

      const correctIdx = normalizeCorrectAnswer(item.options, item.correctAnswer);
      if (correctIdx < 0) {
        console.error(`تعذر مطابقة الإجابة الصحيحة للسؤال ${idx + 1}:`, item.correctAnswer, item.options);
        errors++;
        return;
      }

      const id = item.id || (crypto.randomUUID ? crypto.randomUUID() : `custom_ex_${Date.now()}_${idx}`);

      newExercises.push({
        id,
        type: item.type || 'multipleChoice',
        question: item.question,
        questionArabic: item.questionArabic || item.translation || item.arabic || '', // ترجمة اختيارية
        audioText: item.audioText || '', // نص صوتي مخصص اختياري
        options: item.options,
        correctAnswer: correctIdx,
        difficulty: item.difficulty || 'medium',
        level: item.level || 'A1', // level مطلوب أو افتراضي A1
        category: item.category || '', // الفئة كما وردت بالملف (اختياري)
        topic: item.category || item.topic || 'مستورد', // متوافق مع الحقل القديم topic
        explanation: item.explanation || '', // explanation اختياري
        uploadedAt: new Date().toISOString(),
        source: 'local'
      });
    });

    return { newExercises, errors };
  };

  const handleDelete = async (id) => {
    if(window.confirm("حذف هذا التمرين؟")) {
        const current = await getPersistentExercises();
        const filtered = current.filter(ex => ex.id !== id && ex.source !== 'default');
        
        await saveExercises(filtered);
        loadData();
        window.dispatchEvent(new Event('exercisesUpdated'));

        toast({ title: "تم الحذف", description: "تم حذف التمرين بنجاح", className: "bg-red-50 border-red-200 text-red-800" });
    }
  };

  const handleClearAll = async () => {
    if(window.confirm("تحذير: هل أنت متأكد من حذف جميع التمارين المستوردة؟")) {
        // Clear only custom
        await saveExercises([]); 
        loadData();
        window.dispatchEvent(new Event('exercisesUpdated'));
        toast({ title: "تم مسح الكل محلياً", className: "bg-red-50 border-red-200 text-red-800" });
    }
  };

  const filteredExercises = exercises.filter(ex => 
    ex.question && ex.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 mb-12">
        <div className="flex items-center gap-2 mb-4">
            <Database className="text-purple-600" />
            <h2 className="text-xl font-bold text-slate-800">إدارة التمارين (المسؤول)</h2>
        </div>

        {/* Import Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
             <div className="flex flex-col md:flex-row gap-4 items-stretch">
                <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".csv,.json"
                    className="hidden"
                />
                
                <Button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImporting}
                    className="flex-1 h-auto py-6 bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex flex-col gap-2 rounded-xl transition-all hover:scale-[1.01]"
                >
                    {isImporting ? (
                        <Loader2 className="animate-spin h-8 w-8 text-blue-200" />
                    ) : (
                        <FileUp className="h-8 w-8 text-blue-200" />
                    )}
                    <div className="flex flex-col items-center">
                        <span className="text-lg font-bold">رفع تمارين (CSV أو JSON)</span>
                        <span className="text-blue-200 text-sm font-normal">استيراد أسئلة جديدة</span>
                    </div>
                </Button>

                <Button 
                    onClick={downloadTemplate}
                    className="h-auto py-6 flex-1 bg-green-600 hover:bg-green-700 text-white shadow-lg flex flex-col gap-2 rounded-xl transition-all hover:scale-[1.01] min-w-[160px]"
                >
                    <FileDown className="h-8 w-8 text-green-200" />
                    <div className="flex flex-col items-center">
                        <span className="font-bold text-lg">قالب CSV</span>
                        <span className="text-green-200 text-sm">ملف Excel/CSV جاهز</span>
                    </div>
                </Button>

                <Button
                    onClick={downloadJsonTemplate}
                    className="h-auto py-6 flex-1 bg-amber-600 hover:bg-amber-700 text-white shadow-lg flex flex-col gap-2 rounded-xl transition-all hover:scale-[1.01] min-w-[160px]"
                >
                    <FileJson className="h-8 w-8 text-amber-200" />
                    <div className="flex flex-col items-center">
                        <span className="font-bold text-lg">قالب JSON</span>
                        <span className="text-amber-200 text-sm">ملف JSON جاهز</span>
                    </div>
                </Button>
             </div>

             {importStats && (
                <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-lg flex items-center justify-between text-sm">
                    <span className="text-green-800 flex items-center gap-2">
                        <Check size={16} /> تم إضافة {importStats.success} تمرين
                    </span>
                    {importStats.duplicates > 0 && (
                        <span className="text-yellow-700 flex items-center gap-2">
                            <AlertTriangle size={16} /> مكرر تم تجاهله: {importStats.duplicates}
                    </span>
                    )}
                    {importStats.errors > 0 && (
                        <span className="text-amber-600 flex items-center gap-2">
                            <AlertTriangle size={16} /> {FRIENDLY_ERRORS.PARTIAL_SKIPPED} ({importStats.errors} عنصر)
                        </span>
                    )}
                </div>
             )}
        </div>

        {/* Database Management Section */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50">
            <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="text-blue-600" size={18} />
                    التمارين ({exercises.length})
                </h3>
                <Button variant="ghost" size="sm" onClick={loadData} disabled={loadingData}>
                    <RefreshCw size={14} className={loadingData ? "animate-spin" : ""} />
                </Button>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                        type="text" 
                        placeholder="بحث في الأسئلة..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-9 pl-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                {exercises.length > 0 && (
                    <Button variant="destructive" size="sm" onClick={handleClearAll} title="مسح الكل">
                        <Trash2 size={14} /> مسح
                    </Button>
                )}
            </div>
            </div>

            <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
            {filteredExercises.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                    <p>لا توجد تمارين مستوردة.</p>
                </div>
            ) : (
                filteredExercises.map(ex => (
                <div key={ex.id} className="border border-slate-100 rounded-lg overflow-hidden">
                    <div 
                        className="p-3 flex items-start justify-between bg-white cursor-pointer hover:bg-slate-50 transition-colors"
                        onClick={() => setExpandedId(expandedId === ex.id ? null : ex.id)}
                    >
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-[10px] px-1">{ex.level}</Badge>
                                <Badge className={cn("text-[10px] px-1", 
                                    ex.difficulty === 'easy' ? 'bg-green-100 text-green-800' : 
                                    ex.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                )}>{ex.difficulty}</Badge>
                                {ex.source === 'default' && <Badge variant="outline" className="text-[10px] text-slate-400">افتراضي</Badge>}
                                {ex.source === 'cloud' && <Badge variant="outline" className="text-[10px] text-blue-400 border-blue-200 bg-blue-50">سحابي</Badge>}
                                <span className="font-medium text-slate-800 text-sm line-clamp-1 mr-2">{ex.question}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400">
                                {expandedId === ex.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </Button>
                            {ex.source !== 'default' && (
                                <Button 
                                    variant="ghost" size="icon" className="h-6 w-6 text-red-300 hover:text-red-600" 
                                    onClick={(e) => { e.stopPropagation(); handleDelete(ex.id); }}
                                >
                                    <Trash2 size={14} />
                                </Button>
                            )}
                        </div>
                    </div>
                    
                    <AnimatePresence>
                        {expandedId === ex.id && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }} 
                                animate={{ height: 'auto', opacity: 1 }} 
                                exit={{ height: 0, opacity: 0 }} 
                                className="bg-slate-50 border-t border-slate-100 p-3 text-sm"
                            >
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    {ex.options && ex.options.map((opt, i) => (
                                        <div key={i} className={cn(
                                            "p-1.5 rounded text-xs text-center border",
                                            i === ex.correctAnswer ? "bg-green-100 border-green-200 text-green-800 font-bold" : "bg-white border-slate-200 text-slate-600"
                                        )}>
                                            {opt}
                                        </div>
                                    ))}
                                </div>
                                <div className="text-xs text-slate-400">
                                    الإجابة الصحيحة: {ex.options?.[ex.correctAnswer] ?? ex.correctAnswer}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                ))
            )}
            </div>
        </div>
    </div>
  );
};

export default ExerciseImporter;

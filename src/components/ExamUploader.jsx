import React, { useState, useRef, useEffect } from 'react';
import { FileUp, Trash2, FileText, FileDown, Check, AlertTriangle, Loader2, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { getImportedExams, saveImportedExams, deleteImportedExam } from '@/utils/storageManager';
import { publishContentItems } from '@/services/contentRepository';
import { getExamDedupKey, splitNewUniqueItems } from '@/utils/contentDedupUtils';

// رسائل عربية مبسّطة تُعرض للمستخدم دائمًا (بدل أي نص تقني إنجليزي طويل).
// التفاصيل التقنية الكاملة تُسجَّل بالـ Console فقط عبر console.error.
const FRIENDLY_ERRORS = {
  BAD_FORMAT: 'صيغة الملف غير صحيحة.',
  NO_QUESTIONS: 'الملف لا يحتوي على أسئلة.',
  PARTIAL_SKIPPED: 'بعض العناصر ناقصة ولم يتم استيرادها.',
};

const ExamUploader = ({ level }) => {
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [exams, setExams] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadData = () => {
      const data = getImportedExams(level);
      setExams(data);
    };
    loadData();
    window.addEventListener('dataImported', loadData);
    return () => window.removeEventListener('dataImported', loadData);
  }, [level]);

  const downloadTemplate = () => {
    const csvContent = `title,description,duration
"اختبار A1 تجريبي","اختبار يغطي القواعد الأساسية",30
###QUESTIONS###
question,optionA,optionB,optionC,optionD,correctAnswer
"Was ist das?",Das Auto,Der Baum,Die Katze,Der Hund,Das Auto
"Ich _____ nach Hause.",gehe,geht,gehen,gehst,gehe`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `exam_template_${level}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "تم التحميل",
      description: "تم تحميل قالب الامتحان (CSV) بنجاح.",
      className: "bg-green-50 border-green-200 text-green-800"
    });
  };

  const downloadJsonTemplate = () => {
    const jsonContent = JSON.stringify([
      {
        id: `exam-${level.toLowerCase()}-001`,
        level: level,
        title: `اختبار ${level} تجريبي`,
        questions: [
          {
            question: "Ich ___ Ahmad.",
            options: ["bin", "bist", "ist", "sind"],
            correctAnswer: "bin",
            explanation: "مع ich نستخدم bin."
          }
        ]
      }
    ], null, 2);

    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `exam_template_${level}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "تم التحميل",
      description: "تم تحميل قالب الامتحان (JSON) بنجاح.",
      className: "bg-green-50 border-green-200 text-green-800"
    });
  };

  const parseCSVLine = (text) => {
    const result = [];
    let cell = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(cell.trim().replace(/^"|"$/g, ''));
        cell = '';
      } else {
        cell += char;
      }
    }
    result.push(cell.trim().replace(/^"|"$/g, ''));
    return result;
  };

  // تحويل الإجابة الصحيحة من نص (كما تُكتب بملفات الاستيراد) إلى رقم موضع
  // الخيار (index)، لأن محرّك تشغيل الامتحان (ExamComponent) يقارن بالموضع
  // الرقمي فقط. بدون هذا التحويل، أي امتحان مستورد يبقى غير قابل للتصحيح
  // (كل إجابة تُحسب خاطئة دائمًا مهما اختار الطالب) — تم اكتشاف هذا الخلل
  // أثناء الفحص وإصلاحه هنا لكلا مسارَي CSV وJSON.
  const normalizeCorrectAnswer = (options, correctAnswer) => {
    if (typeof correctAnswer === 'number') return correctAnswer;
    const idx = options.findIndex(o => String(o).trim() === String(correctAnswer).trim());
    return idx >= 0 ? idx : 0;
  };

  const processCsvFile = async (file) => {
    const text = await file.text();
    const parts = text.split('###QUESTIONS###');
    if (parts.length < 2) throw new Error(FRIENDLY_ERRORS.BAD_FORMAT);

    const metaLines = parts[0].trim().split(/\r\n|\n/).filter(l => l.trim());
    if (metaLines.length < 2) throw new Error(FRIENDLY_ERRORS.BAD_FORMAT);

    const metaRow = parseCSVLine(metaLines[1]);
    const examTitle = metaRow[0];
    const examDesc = metaRow[1];
    const examDuration = parseInt(metaRow[2]) || 30;

    const questionLines = parts[1].trim().split(/\r\n|\n/).filter(l => l.trim());
    const questions = [];
    let skipped = 0;

    for (let i = 1; i < questionLines.length; i++) {
      try {
        const row = parseCSVLine(questionLines[i]);
        if (row.length < 6) { skipped++; continue; }

        const options = [row[1], row[2], row[3], row[4]];
        questions.push({
          id: `q_${Date.now()}_${i}`,
          question: row[0],
          options,
          correctAnswer: normalizeCorrectAnswer(options, row[5]),
        });
      } catch (err) {
        console.error(`تعذر تحليل السطر ${i}:`, err);
        skipped++;
      }
    }

    if (questions.length === 0) throw new Error(FRIENDLY_ERRORS.NO_QUESTIONS);

    const newExam = {
      id: `custom_exam_${Date.now()}`,
      title: examTitle || "امتحان جديد",
      description: examDesc || "تم استيراده من CSV",
      duration: examDuration,
      difficulty: 'متوسط',
      level,
      questions,
      uploadedAt: new Date().toISOString()
    };

    const currentExams = getImportedExams(level);
    const publishResult = await publishContentItems('exams', [newExam]);
    if (!publishResult.success) throw new Error('فشل الحفظ السحابي، لن يظهر المحتوى للزوار');
    saveImportedExams(level, [...currentExams, newExam]);

    return { successCount: questions.length, skipped, examsAdded: 1 };
  };

  // تحقق من صحة سؤال واحد بصيغة JSON، ويرجع قائمة الأخطاء (فارغة لو كل شيء سليم).
  const validateJsonQuestion = (q) => {
    const errors = [];
    if (!q.question || typeof q.question !== 'string') errors.push('question مطلوب');
    if (!Array.isArray(q.options) || q.options.length === 0) errors.push('options يجب أن تكون قائمة (array)');
    if (q.correctAnswer === undefined || q.correctAnswer === null || q.correctAnswer === '') errors.push('correctAnswer مطلوب');
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

    const examsArray = Array.isArray(parsed) ? parsed : [parsed];
    if (examsArray.length === 0) throw new Error(FRIENDLY_ERRORS.NO_QUESTIONS);

    const validExams = [];
    let skippedExams = 0;
    let totalQuestions = 0;
    const technicalErrors = [];

    examsArray.forEach((exam, examIdx) => {
      const itemErrors = [];
      if (!exam.title || typeof exam.title !== 'string') itemErrors.push(`title مطلوب (امتحان ${examIdx + 1})`);
      if (!exam.level || typeof exam.level !== 'string') itemErrors.push(`level مطلوب (امتحان ${examIdx + 1})`);
      if (!Array.isArray(exam.questions) || exam.questions.length === 0) {
        itemErrors.push(`questions يجب أن تكون قائمة غير فارغة (امتحان ${examIdx + 1})`);
      } else {
        exam.questions.forEach((q, qIdx) => {
          const qErrors = validateJsonQuestion(q);
          if (qErrors.length > 0) {
            itemErrors.push(`سؤال ${qIdx + 1} بالامتحان ${examIdx + 1}: ${qErrors.join(', ')}`);
          }
        });
      }

      if (itemErrors.length > 0) {
        technicalErrors.push(...itemErrors);
        skippedExams++;
        return;
      }

      const normalizedQuestions = exam.questions.map((q, qi) => ({
        id: q.id || `q_${Date.now()}_${examIdx}_${qi}`,
        question: q.question,
        options: q.options,
        correctAnswer: normalizeCorrectAnswer(q.options, q.correctAnswer),
        explanation: q.explanation || '',
      }));

      validExams.push({
        id: exam.id || `custom_exam_${Date.now()}_${examIdx}`,
        title: exam.title,
        description: exam.description || 'تم استيراده من JSON',
        duration: exam.duration || 30,
        difficulty: exam.difficulty || 'متوسط',
        level: exam.level,
        questions: normalizedQuestions,
        uploadedAt: new Date().toISOString()
      });
      totalQuestions += normalizedQuestions.length;
    });

    if (technicalErrors.length > 0) {
      console.error('أخطاء تحقق JSON بالامتحانات:', technicalErrors);
    }

    if (validExams.length === 0) {
      throw new Error(FRIENDLY_ERRORS.PARTIAL_SKIPPED);
    }

    // كل امتحان صالح يُحفظ ضمن سلة مستواه الخاصة (قد يختلف عن التبويب الحالي
    // لو حدد ملف الـ JSON مستويات متعددة دفعة واحدة).
    const byLevel = {};
    validExams.forEach(exam => {
      const lvl = exam.level || level;
      if (!byLevel[lvl]) byLevel[lvl] = [];
      byLevel[lvl].push(exam);
    });
    let duplicateExams = 0;
    let addedExams = 0;
    for (const [lvl, newExams] of Object.entries(byLevel)) {
      const current = getImportedExams(lvl);
      const { unique, skipped } = splitNewUniqueItems(newExams, current, getExamDedupKey);
      duplicateExams += skipped;
      addedExams += unique.length;
      if (unique.length > 0) {
        const publishResult = await publishContentItems('exams', unique);
        if (!publishResult.success) throw new Error('فشل الحفظ السحابي، لن يظهر المحتوى للزوار');
        saveImportedExams(lvl, [...current, ...unique]);
      }
    }

    if (addedExams === 0 && skippedExams === 0) {
      throw new Error('كل نماذج الامتحان موجودة مسبقًا.');
    }

    return {
      successCount: totalQuestions,
      skipped: skippedExams,
      duplicates: duplicateExams,
      examsAdded: addedExams,
    };
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsImporting(true);
    setStats(null);

    try {
      const isJson = file.name.toLowerCase().endsWith('.json');
      const result = isJson ? await processJsonFile(file) : await processCsvFile(file);

      setStats({ success: result.successCount, skipped: result.skipped, duplicates: result.duplicates || 0 });
      toast({
        title: "تم الاستيراد",
        description: result.examsAdded > 1
          ? `تم إضافة ${result.examsAdded} امتحانات بنجاح.`
          : `تم إضافة الامتحان بنجاح (${result.successCount} سؤال).`,
        className: "bg-green-50 border-green-200 text-green-800"
      });

    } catch (error) {
      console.error('خطأ استيراد امتحان:', error);
      toast({
        title: "خطأ في الاستيراد",
        description: error.message || FRIENDLY_ERRORS.BAD_FORMAT,
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("حذف هذا الامتحان؟")) {
      deleteImportedExam(level, id);
      toast({ title: "تم الحذف", description: "تم حذف الامتحان بنجاح", className: "bg-red-50 border-red-200 text-red-800" });
    }
  };

  return (
    <div className="mt-8 p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
            <FileUp className="text-red-600" size={24} />
            إدارة الامتحانات - المستوى {level}
        </h3>
        <Badge variant="outline" className="text-xs font-bold px-2 py-1 bg-slate-50 border-slate-200">
           لوحة المشرف (Admin)
        </Badge>
      </div>

      {/* Buttons Section - Prominent Layout */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".csv,.json"
            className="hidden"
        />

        {/* Upload Button */}
        <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex-1 h-auto py-6 bg-red-600 hover:bg-red-700 text-white shadow-lg flex flex-col items-center gap-2 rounded-xl transition-all hover:scale-[1.01]"
        >
            {isImporting ? <Loader2 className="animate-spin h-8 w-8 text-red-200" /> : <FileUp className="h-8 w-8 text-red-100" />}
            <div className="flex flex-col items-center">
                <span className="text-lg font-bold">رفع امتحان (CSV أو JSON)</span>
                <span className="text-red-100 text-sm font-medium opacity-90">استيراد أسئلة جديدة</span>
            </div>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Download CSV Template Button */}
        <Button
            onClick={downloadTemplate}
            className="flex-1 h-auto py-4 bg-green-600 hover:bg-green-700 text-white shadow-sm flex items-center justify-center gap-2 rounded-xl transition-all hover:scale-[1.01]"
        >
            <FileDown className="h-5 w-5 text-green-100" />
            <span className="font-bold">قالب CSV</span>
        </Button>

        {/* Download JSON Template Button */}
        <Button
            onClick={downloadJsonTemplate}
            className="flex-1 h-auto py-4 bg-amber-600 hover:bg-amber-700 text-white shadow-sm flex items-center justify-center gap-2 rounded-xl transition-all hover:scale-[1.01]"
        >
            <FileJson className="h-5 w-5 text-amber-100" />
            <span className="font-bold">قالب JSON</span>
        </Button>
      </div>

      {stats && (
         <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-lg flex items-center gap-3 text-sm text-green-800 font-medium">
             <div className="bg-green-200 p-1 rounded-full"><Check size={16} className="text-green-700" /></div>
             تم استيراد الامتحان بنجاح ({stats.success} سؤال).
             {stats.skipped > 0 && (
                <span className="text-amber-600 flex items-center gap-1 mr-2">
                    <AlertTriangle size={14} /> تم تخطي {stats.skipped} عنصر ناقص.
                </span>
             )}
             {stats.duplicates > 0 && (
                <span className="text-yellow-700 flex items-center gap-1 mr-2">
                    <AlertTriangle size={14} /> مكرر تم تجاهله: {stats.duplicates}
                </span>
             )}
         </div>
      )}

      <div className="space-y-3">
        {exams.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                <FileText className="mx-auto mb-2 text-slate-300" size={32} />
                <p>لا توجد امتحانات مضافة لهذا المستوى.</p>
            </div>
        ) : (
            exams.map(exam => (
                <div key={exam.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-start gap-4">
                        <div className="bg-red-50 p-2.5 rounded-lg text-red-600">
                             <FileText size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 text-base">{exam.title}</h4>
                            <div className="text-xs text-slate-500 flex flex-wrap gap-2 mt-1.5 items-center">
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">{exam.questions?.length || 0} سؤال</span>
                                <span className="text-slate-300">•</span>
                                <span>{exam.duration} دقيقة</span>
                                <span className="text-slate-300">•</span>
                                <span>{new Date(exam.uploadedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                        onClick={() => handleDelete(exam.id)}
                    >
                        <Trash2 size={18} />
                    </Button>
                </div>
            ))
        )}
      </div>
    </div>
  );
};

export default ExamUploader;

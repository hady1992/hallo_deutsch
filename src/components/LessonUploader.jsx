import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileDown, Check, AlertTriangle, Loader2, FilePlus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getImportedLessons, saveImportedLessons } from '@/utils/storageManager';
import { importLessons } from '@/services/contentRepository';
import { dedupeByKey, getLessonDedupKey, splitNewUniqueItems } from '@/utils/contentDedupUtils';

const LessonUploader = ({ levelId }) => {
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importStats, setImportStats] = useState(null);

  const parseList = (value) => String(value || '')
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);

  const downloadTemplate = () => {
    const csvContent = `title,content,duration,objectives,resources
"درس تجريبي: التسوق","شرح كيفية التسوق في السوبر ماركت والعبارات المستخدمة.",30,"تعلم مفردات الطعام|القدرة على السؤال عن السعر","كتاب A1 صفحة 20|فيديو تعليمي"
"المحادثة في المطار","كيفية التعامل مع إجراءات المطار باللغة الألمانية.",45,"مصطلحات السفر|الجوازات والتذاكر","تسجيل صوتي مرفق"`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `lesson_template_${levelId}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    toast({
        title: "تم التحميل",
        description: "تم تحميل قالب الدروس بنجاح.",
        className: "bg-green-50 border-green-200 text-green-800"
    });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
    e.target.value = ''; // Reset
  };

  const processFile = async (file) => {
    setIsUploading(true);
    setImportStats(null);
    try {
        const text = await file.text();
        const lines = text.split(/\r\n|\n|\r/).filter(line => line.trim());
        
        if (lines.length < 2) throw new Error("الملف فارغ أو لا يحتوي على بيانات");

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
        const requiredHeaders = ['title', 'content'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

        if (missingHeaders.length > 0) {
            throw new Error(`الأعمدة التالية مفقودة: ${missingHeaders.join(', ')}`);
        }

        const newLessons = [];
        let errors = 0;

        for (let i = 1; i < lines.length; i++) {
            try {
                // CSV Parsing Logic
                const row = [];
                let inQuote = false;
                let val = '';
                for (let char of lines[i]) {
                    if (char === '"') inQuote = !inQuote;
                    else if (char === ',' && !inQuote) { row.push(val.trim().replace(/^"|"$/g, '')); val = ''; }
                    else val += char;
                }
                row.push(val.trim().replace(/^"|"$/g, ''));

                const obj = {};
                headers.forEach((h, idx) => obj[h] = row[idx]);

                if (!obj.title || !obj.content) {
                    errors++;
                    continue;
                }

                newLessons.push({
                    id: `lesson_${Date.now()}_${i}`,
                    title: obj.title,
                    explanation: obj.content, // Map content to explanation
                    level: levelId,
                    duration: obj.duration || 'غير محدد',
                    objectives: parseList(obj.objectives),
                    resources: parseList(obj.resources),
                    isCustom: true,
                });
            } catch (err) {
                console.error(`Error parsing row ${i}:`, err);
                errors++;
            }
        }

        if (newLessons.length === 0) throw new Error("لم يتم العثور على دروس صالحة");

        const publishResult = await importLessons(newLessons);

        if (publishResult.success) {
          const publishedKeys = new Set(newLessons.map(getLessonDedupKey).filter(Boolean));
          const localLessons = getImportedLessons();
          const remainingLocal = localLessons.filter((lesson) => !publishedKeys.has(getLessonDedupKey(lesson)));
          if (remainingLocal.length !== localLessons.length) saveImportedLessons(remainingLocal);

          setImportStats({
            count: publishResult.count,
            duplicates: publishResult.duplicates,
            errors,
            publication: 'published',
          });
          toast({
              title: "تم النشر للزوار",
              description: `تم إضافة ${publishResult.count} درس، وتم تجاهل مكرر: ${publishResult.duplicates}، أخطاء: ${errors}.`,
              className: "bg-green-50 border-green-200 text-green-800"
          });
          return;
        }

        const currentLessons = getImportedLessons();
        const { unique: localOnlyLessons, skipped: localDuplicates } = splitNewUniqueItems(
          newLessons,
          currentLessons,
          getLessonDedupKey
        );
        const fallbackLessons = localOnlyLessons.map((lesson) => ({
          ...lesson,
          source: 'local',
          publicationStatus: 'local-only',
        }));
        const merged = dedupeByKey(
          [...currentLessons, ...fallbackLessons],
          getLessonDedupKey,
          { prefer: 'last' }
        );
        const savedLocally = saveImportedLessons(merged);
        if (!savedLocally) throw new Error("مساحة التخزين ممتلئة");

        setImportStats({
          count: fallbackLessons.length,
          duplicates: localDuplicates,
          errors,
          publication: 'local-only',
        });
        toast({
          title: "حفظ محلي فقط",
          description: "محلي فقط — لن يظهر للزوار",
          variant: "destructive"
        });

    } catch (error) {
        toast({
            title: "خطأ في الاستيراد",
            description: error.message,
            variant: "destructive"
        });
    } finally {
        setIsUploading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                    <FilePlus className="text-blue-600" size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800">إضافة دروس جديدة</h3>
                    <p className="text-xs text-slate-500">يمكنك رفع ملف CSV لإضافة دروس إضافية لهذا المستوى</p>
                </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
                <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".csv"
                    className="hidden"
                />
                
                <Button 
                    onClick={downloadTemplate}
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-none gap-2"
                >
                    <FileDown size={16} />
                    تحميل القالب
                </Button>

                <Button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                    {isUploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                    رفع ملف CSV
                </Button>
            </div>

            {importStats && (
              <div className={`mt-4 flex w-full flex-wrap items-center gap-4 rounded-lg border p-3 text-sm ${
                importStats.publication === 'published'
                  ? 'border-green-200 bg-green-50 text-green-800'
                  : 'border-amber-200 bg-amber-50 text-amber-900'
              }`}>
                <span className="flex items-center gap-1 font-bold">
                  {importStats.publication === 'published' ? <Check size={16} /> : <AlertTriangle size={16} />}
                  {importStats.publication === 'published' ? 'تم النشر للزوار' : 'محلي فقط — لن يظهر للزوار'}
                </span>
                <span>تم إضافة: {importStats.count}</span>
                <span>تم تجاهل مكرر: {importStats.duplicates}</span>
                <span>أخطاء: {importStats.errors}</span>
              </div>
            )}
        </div>
    </div>
  );
};

export default LessonUploader;

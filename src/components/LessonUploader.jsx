import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileDown, Check, AlertTriangle, Loader2, FilePlus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getImportedLessons, saveImportedLessons } from '@/utils/storageManager';

const LessonUploader = ({ levelId }) => {
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

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
                    objectives: obj.objectives || '',
                    resources: obj.resources || '',
                    isCustom: true
                });
            } catch (err) {
                console.error(`Error parsing row ${i}:`, err);
                errors++;
            }
        }

        if (newLessons.length === 0) throw new Error("لم يتم العثور على دروس صالحة");

        const currentLessons = getImportedLessons();
        const merged = [...currentLessons, ...newLessons];
        const success = saveImportedLessons(merged);

        if (!success) throw new Error("مساحة التخزين ممتلئة");

        toast({
            title: "تم الاستيراد بنجاح",
            description: `تمت إضافة ${newLessons.length} درس. ${errors > 0 ? `(تم تخطي ${errors} صفوف)` : ''}`,
            className: "bg-green-50 border-green-200 text-green-800"
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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
        </div>
    </div>
  );
};

export default LessonUploader;
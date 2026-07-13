import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, BookOpen, Check, FileDown, FilePlus, Loader2, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { deleteImportedLesson, getImportedLessons, saveImportedLessons } from '@/utils/storageManager';
import { getPublishedContent, importLessons, unpublishLesson } from '@/services/contentRepository';
import { dedupeByKey, getLessonDedupKey, splitNewUniqueItems } from '@/utils/contentDedupUtils';

const parseList = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value || '')
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);
};

const parseLessonCSV = (text) => {
  const rows = [];
  let row = [];
  let value = '';
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        value += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(value.trim());
      value = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') index += 1;
      row.push(value.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      value = '';
    } else {
      value += char;
    }
  }

  row.push(value.trim());
  if (row.some(Boolean)) rows.push(row);
  if (inQuotes) throw new Error('تنسيق CSV غير صحيح: توجد علامة اقتباس غير مغلقة.');
  if (rows.length < 2) throw new Error('الملف فارغ أو لا يحتوي على بيانات.');

  const headers = rows[0].map((header) => header.replace(/^\uFEFF/, '').trim().toLowerCase());
  return rows.slice(1).map((values) => Object.fromEntries(
    headers.map((header, index) => [header, values[index] || ''])
  ));
};

const normalizeLessonItems = (items, levelId) => {
  const lessons = [];
  let errors = 0;

  items.forEach((rawItem, index) => {
    const item = rawItem && typeof rawItem === 'object' ? rawItem : {};
    const title = typeof item.title === 'object'
      ? item.title.ar || item.title.de || ''
      : String(item.title || '').trim();
    const explanation = String(item.explanation || item.content || '').trim();

    if (!title || !explanation) {
      errors += 1;
      return;
    }

    lessons.push({
      ...item,
      id: item.id || `lesson_${Date.now()}_${index}`,
      title,
      explanation,
      level: levelId || item.level || 'A1',
      duration: item.duration || 'غير محدد',
      objectives: parseList(item.objectives),
      resources: parseList(item.resources),
      isCustom: true,
    });
  });

  return { lessons, errors };
};

const LessonUploader = ({
  levelId,
  templateFormat = 'csv',
  acceptedFormats,
  uploadLabel,
  showPublishedLessons = false,
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importStats, setImportStats] = useState(null);
  const [publishedLessons, setPublishedLessons] = useState([]);
  const [localLessons, setLocalLessons] = useState([]);
  const [isLoadingPublished, setIsLoadingPublished] = useState(false);
  const [deletingLessonId, setDeletingLessonId] = useState(null);
  const isJsonMode = templateFormat === 'json';
  const accept = acceptedFormats || (isJsonMode ? '.json' : '.csv');

  const loadPublishedLessons = useCallback(async () => {
    if (!showPublishedLessons) return;
    setIsLoadingPublished(true);
    const storedLessons = getImportedLessons()
      .filter((lesson) => !levelId || lesson.level === levelId)
      .map((lesson) => ({
        ...lesson,
        source: 'local',
        publicationStatus: 'local-only',
      }));
    setLocalLessons(storedLessons);
    try {
      const lessons = await getPublishedContent('lessons', levelId || null);
      setPublishedLessons(lessons);
    } catch (error) {
      console.error('[LessonUploader] Failed to load published lessons:', error);
      setPublishedLessons([]);
    } finally {
      setIsLoadingPublished(false);
    }
  }, [levelId, showPublishedLessons]);

  const handleDeleteLesson = async (lesson) => {
    const isCloudLesson = lesson.source === 'cloud' || Boolean(lesson.supabaseId);
    const confirmation = isCloudLesson
      ? 'هل أنت متأكد من حذف هذا الدرس؟ لن يظهر للزوار بعد الحذف.'
      : 'هل أنت متأكد من حذف هذا الدرس المحلي؟';
    if (!window.confirm(confirmation)) return;

    const lessonId = lesson.supabaseId || lesson.id;
    setDeletingLessonId(lessonId);
    try {
      if (isCloudLesson) {
        const result = await unpublishLesson(lesson);
        if (!result.success) throw new Error(result.error || 'تعذر إلغاء نشر الدرس.');
        toast({
          title: 'تم إلغاء نشر الدرس بنجاح',
          className: 'bg-green-50 border-green-200 text-green-800',
        });
      } else {
        if (!deleteImportedLesson(lesson.id)) throw new Error('تعذر حذف الدرس المحلي.');
        toast({
          title: 'تم حذف الدرس المحلي',
          className: 'bg-green-50 border-green-200 text-green-800',
        });
      }

      await loadPublishedLessons();
    } catch (error) {
      console.error('[LessonUploader] Failed to remove lesson:', error);
      toast({
        title: `فشل حذف الدرس: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setDeletingLessonId(null);
    }
  };

  useEffect(() => {
    loadPublishedLessons();
    window.addEventListener('lessonsUpdated', loadPublishedLessons);
    return () => window.removeEventListener('lessonsUpdated', loadPublishedLessons);
  }, [loadPublishedLessons]);

  const downloadTemplate = () => {
    const jsonTemplate = JSON.stringify([{
      title: 'درس تجريبي: التسوق',
      content: 'شرح مفردات وعبارات التسوق الأساسية باللغة الألمانية.',
      level: levelId || 'A1',
      duration: 30,
      objectives: ['تعلم مفردات الطعام', 'السؤال عن السعر'],
      resources: ['كتاب المستوى', 'تسجيل صوتي'],
    }], null, 2);
    const csvTemplate = `title,content,duration,objectives,resources
"درس تجريبي: التسوق","شرح مفردات وعبارات التسوق الأساسية باللغة الألمانية.",30,"تعلم مفردات الطعام|السؤال عن السعر","كتاب المستوى|تسجيل صوتي"`;
    const content = isJsonMode ? jsonTemplate : csvTemplate;
    const extension = isJsonMode ? 'json' : 'csv';
    const mimeType = isJsonMode ? 'application/json' : 'text/csv;charset=utf-8;';
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `lesson_template_${levelId || 'A1'}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'تم التحميل',
      description: `تم تحميل قالب الدرس بصيغة ${extension.toUpperCase()}.`,
      className: 'bg-green-50 border-green-200 text-green-800',
    });
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setIsUploading(true);
    setImportStats(null);

    try {
      const text = await file.text();
      const isJsonFile = file.name.toLowerCase().endsWith('.json');
      let rawItems;

      if (isJsonFile) {
        const parsed = JSON.parse(text);
        rawItems = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.lessons) ? parsed.lessons : [parsed]);
      } else {
        rawItems = parseLessonCSV(text);
      }

      const { lessons, errors } = normalizeLessonItems(rawItems, levelId);
      if (lessons.length === 0) throw new Error('لم يتم العثور على دروس صالحة. يجب توفير title وcontent.');

      const publishResult = await importLessons(lessons);
      if (publishResult.success) {
        const publishedKeys = new Set(lessons.map(getLessonDedupKey).filter(Boolean));
        const localLessons = getImportedLessons();
        const remainingLocal = localLessons.filter((lesson) => !publishedKeys.has(getLessonDedupKey(lesson)));
        if (remainingLocal.length !== localLessons.length) saveImportedLessons(remainingLocal);

        setImportStats({
          count: publishResult.count,
          duplicates: publishResult.duplicates,
          errors,
          publication: 'published',
        });
        await loadPublishedLessons();
        toast({
          title: 'تم النشر للزوار',
          description: `تم إضافة: ${publishResult.count}، مكرر: ${publishResult.duplicates}، أخطاء: ${errors}.`,
          className: 'bg-green-50 border-green-200 text-green-800',
        });
        return;
      }

      const currentLessons = getImportedLessons();
      const { unique: localOnlyLessons, skipped: localDuplicates } = splitNewUniqueItems(
        lessons,
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
      if (!saveImportedLessons(merged)) throw new Error('تعذر الحفظ المحلي.');

      setImportStats({
        count: fallbackLessons.length,
        duplicates: localDuplicates,
        errors,
        publication: 'local-only',
      });
      toast({
        title: 'حفظ محلي فقط',
        description: 'محلي فقط — لن يظهر للزوار',
        variant: 'destructive',
      });
    } catch (error) {
      console.error('[LessonUploader] Import failed:', error);
      setImportStats({ count: 0, duplicates: 0, errors: 1, publication: 'invalid' });
      toast({
        title: 'خطأ في استيراد الدرس',
        description: error instanceof SyntaxError ? 'ملف JSON غير صالح.' : error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mb-8 rounded-lg border border-slate-200 bg-white p-4 shadow-sm" data-testid="lesson-uploader">
      <div className="flex flex-col flex-wrap items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2">
            <FilePlus className="text-blue-600" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">إضافة دروس جديدة</h3>
            <p className="text-xs text-slate-500">ارفع ملف {isJsonMode ? 'JSON' : 'CSV'} لإضافة دروس إلى المستوى {levelId}.</p>
          </div>
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept={accept}
            className="hidden"
          />
          <Button type="button" onClick={downloadTemplate} variant="outline" size="sm" className="flex-1 gap-2 sm:flex-none">
            <FileDown size={16} />
            تحميل قالب درس {isJsonMode ? 'JSON' : 'CSV'}
          </Button>
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex-1 gap-2 bg-blue-600 text-white hover:bg-blue-700 sm:flex-none"
            data-testid="lesson-upload-action"
          >
            {isUploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
            {isUploading ? 'جاري الاستيراد...' : (uploadLabel || `رفع ملف ${isJsonMode ? 'JSON' : 'CSV'}`)}
          </Button>
        </div>

        {importStats && (
          <div className={`mt-2 grid w-full gap-2 rounded-lg border p-3 text-sm sm:grid-cols-4 ${
            importStats.publication === 'published'
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-amber-200 bg-amber-50 text-amber-900'
          }`} data-testid="lesson-import-report">
            <span className="flex items-center gap-1 font-bold">
              {importStats.publication === 'published' ? <Check size={16} /> : <AlertTriangle size={16} />}
              {importStats.publication === 'published' ? 'تم النشر للزوار' : 'محلي فقط — لن يظهر للزوار'}
            </span>
            <span>تم إضافة: {importStats.count}</span>
            <span>مكرر: {importStats.duplicates}</span>
            <span>أخطاء: {importStats.errors}</span>
          </div>
        )}
      </div>

      {showPublishedLessons && (
        <div className="mt-6 border-t border-slate-200 pt-5" data-testid="published-lessons-list">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h4 className="flex items-center gap-2 font-black text-slate-800">
              <BookOpen size={18} className="text-blue-600" />
              قائمة الدروس
            </h4>
            <span className="text-xs font-bold text-slate-500">{publishedLessons.length + localLessons.length} درس</span>
          </div>
          {isLoadingPublished ? (
            <div className="flex items-center gap-2 py-4 text-sm text-slate-500">
              <Loader2 className="animate-spin" size={16} /> جاري تحميل الدروس...
            </div>
          ) : publishedLessons.length + localLessons.length > 0 ? (
            <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
              {[...publishedLessons, ...localLessons].map((lesson) => {
                const isCloudLesson = lesson.source === 'cloud' || Boolean(lesson.supabaseId);
                const lessonId = lesson.supabaseId || lesson.id;
                return (
                <div key={lesson.supabaseId || lesson.id} className="flex flex-col items-stretch justify-between gap-3 px-4 py-3 sm:flex-row sm:items-center">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-800">{lesson.title}</p>
                    <p className="text-xs text-slate-500">المستوى {lesson.level || levelId}</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 sm:shrink-0 sm:justify-end">
                    <span className={`rounded-md px-2 py-1 text-xs font-bold ${
                      isCloudLesson
                        ? 'bg-green-50 text-green-700'
                        : 'bg-amber-50 text-amber-800'
                    }`}>
                      {isCloudLesson ? 'منشور' : 'محلي فقط — لن يظهر للزوار'}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={deletingLessonId === lessonId}
                      onClick={() => handleDeleteLesson(lesson)}
                      className="gap-1 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                    >
                      {deletingLessonId === lessonId
                        ? <Loader2 className="animate-spin" size={15} />
                        : <Trash2 size={15} />}
                      حذف
                    </Button>
                  </div>
                </div>
                );
              })}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-200 py-5 text-center text-sm font-bold text-slate-400">
              لا توجد دروس منشورة أو محلية لهذا المستوى بعد.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default LessonUploader;

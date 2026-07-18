import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Ban,
  BookOpen,
  Check,
  Eye,
  FileDown,
  FilePlus,
  Loader2,
  Pencil,
  Save,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  deletePublishedContentItem,
  getPublishedContent,
  importLessons,
  saveLesson,
  unpublishLesson,
  updateLesson,
} from '@/services/contentRepository';

const parseList = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value || '').split('|').map((item) => item.trim()).filter(Boolean);
};

const emptyForm = (level) => ({
  title: '',
  germanTitle: '',
  level: level || 'A1',
  unit: '',
  unitOrder: '1',
  unitTitleAr: '',
  unitTitleDe: '',
  order: '1',
  slug: '',
  estimatedMinutes: '20',
  objectives: '',
  content: '{\n  "sections": []\n}',
});

const normalizeLesson = (rawItem, forcedLevel, index = 0) => {
  const item = rawItem && typeof rawItem === 'object' ? rawItem : {};
  const metadata = item.metadata && typeof item.metadata === 'object' ? item.metadata : {};
  const title = typeof item.title === 'object' ? item.title.ar || item.title.de || '' : String(item.title || '').trim();
  const level = String(forcedLevel || item.level || 'A1').toUpperCase();
  const unit = String(item.unit || metadata.unit || item.topic || '').trim();
  const slug = String(item.slug || '').trim();
  const content = item.content && typeof item.content === 'object'
    ? item.content
    : { explanation: String(item.explanation || item.content || '').trim() };

  const missing = [];
  if (!title) missing.push('title');
  if (!unit) missing.push('unit');
  if (!slug) missing.push('slug');
  if (!Number.isFinite(Number(item.unitOrder ?? metadata.unitOrder))) missing.push('unitOrder');
  if (!Number.isFinite(Number(item.order ?? metadata.order))) missing.push('order');

  if (missing.length > 0) return { error: `السطر ${index + 1}: الحقول المطلوبة مفقودة أو غير صالحة: ${missing.join(', ')}` };

  return {
    lesson: {
      ...item,
      id: item.id || `lesson_${Date.now()}_${index}`,
      title,
      germanTitle: String(item.germanTitle || '').trim(),
      level,
      unit,
      unitOrder: Number(item.unitOrder ?? metadata.unitOrder),
      unitTitleAr: String(item.unitTitleAr || metadata.unitTitleAr || '').trim(),
      unitTitleDe: String(item.unitTitleDe || metadata.unitTitleDe || '').trim(),
      order: Number(item.order ?? metadata.order),
      slug,
      estimatedMinutes: Number(item.estimatedMinutes ?? metadata.estimatedMinutes) || 0,
      objectives: parseList(item.objectives || content.objectives),
      content,
      is_published: true,
    },
  };
};

const validateUniqueLessons = (lessons, existing = [], ignoredId = null) => {
  const usedIds = new Set();
  const usedSlugs = new Set();
  const usedOrders = new Set();
  existing.forEach((item) => {
    const itemId = item.supabaseId || item.id;
    if (itemId === ignoredId) return;
    if (item.id) usedIds.add(String(item.id));
    usedSlugs.add(`${item.level}:${item.slug}`);
    usedOrders.add(`${item.level}:${item.unit}:${Number(item.order) || 0}`);
  });

  const unique = [];
  let duplicates = 0;
  lessons.forEach((lesson) => {
    const idKey = String(lesson.id || '');
    const slugKey = `${lesson.level}:${lesson.slug}`;
    const orderKey = `${lesson.level}:${lesson.unit}:${lesson.order}`;
    if ((idKey && usedIds.has(idKey)) || usedSlugs.has(slugKey) || usedOrders.has(orderKey)) {
      duplicates += 1;
      return;
    }
    if (idKey) usedIds.add(idKey);
    usedSlugs.add(slugKey);
    usedOrders.add(orderKey);
    unique.push(lesson);
  });
  return { unique, duplicates };
};

const LessonUploader = ({ levelId = 'A1', showPublishedLessons = false }) => {
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [importStats, setImportStats] = useState(null);
  const [publishedLessons, setPublishedLessons] = useState([]);
  const [isLoadingPublished, setIsLoadingPublished] = useState(false);
  const [actionLessonId, setActionLessonId] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(() => emptyForm(levelId));

  const sortedLessons = useMemo(() => [...publishedLessons].sort((a, b) => (
    (Number(a.unitOrder) || 0) - (Number(b.unitOrder) || 0)
    || (Number(a.order) || 0) - (Number(b.order) || 0)
    || String(a.title || '').localeCompare(String(b.title || ''), 'ar')
  )), [publishedLessons]);

  const loadPublishedLessons = useCallback(async () => {
    if (!showPublishedLessons) return;
    setIsLoadingPublished(true);
    try {
      setPublishedLessons(await getPublishedContent('lessons', levelId));
    } catch (error) {
      console.error('[LessonUploader] Failed to load published lessons:', error);
      setPublishedLessons([]);
      toast({ title: 'تعذر تحميل الدروس المنشورة', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoadingPublished(false);
    }
  }, [levelId, showPublishedLessons, toast]);

  useEffect(() => {
    setForm(emptyForm(levelId));
    setEditingLesson(null);
    setShowForm(false);
  }, [levelId]);

  useEffect(() => {
    loadPublishedLessons();
    window.addEventListener('lessonsUpdated', loadPublishedLessons);
    return () => window.removeEventListener('lessonsUpdated', loadPublishedLessons);
  }, [loadPublishedLessons]);

  const downloadTemplate = () => {
    const template = [{
      id: 'a1-unit-1-lesson-1',
      level: levelId,
      unit: 'unit-1',
      unitOrder: 1,
      unitTitleAr: 'التعارف والتحية',
      unitTitleDe: 'Begrüßung und Vorstellung',
      order: 1,
      slug: 'begrussung-und-vorstellung',
      estimatedMinutes: 25,
      title: 'التحية والتعارف',
      germanTitle: 'Begrüßung und Vorstellung',
      objectives: ['إلقاء التحية', 'التعريف بالنفس'],
      content: {
        explanation: 'شرح مختصر للدرس.',
        sections: [],
        vocabulary: [],
        grammar: [],
        examples: [],
        conversation: [],
        reading: [],
        exercises: [],
        shortQuiz: [],
      },
    }];
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lesson_template_${levelId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setIsUploading(true);
    setImportStats(null);

    try {
      const parsed = JSON.parse(await file.text());
      const rawItems = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.lessons) ? parsed.lessons : [parsed]);
      const normalized = rawItems.map((item, index) => normalizeLesson(item, levelId, index));
      const errors = normalized.filter((result) => result.error).map((result) => result.error);
      const validLessons = normalized.map((result) => result.lesson).filter(Boolean);
      const { unique, duplicates } = validateUniqueLessons(validLessons, publishedLessons);

      if (unique.length === 0) {
        setImportStats({ count: 0, duplicates, errors: errors.length, publication: errors.length ? 'invalid' : 'published' });
        if (errors.length) throw new Error(errors.join(' | '));
        return;
      }

      const result = await importLessons(unique);
      if (!result.success) throw new Error(result.error || 'فشل الحفظ السحابي.');
      setImportStats({ count: result.count, duplicates: duplicates + result.duplicates, errors: errors.length, publication: 'published' });
      await loadPublishedLessons();
      toast({
        title: 'تم النشر للزوار',
        description: `تم إضافة: ${result.count}، مكرر: ${duplicates + result.duplicates}، أخطاء: ${errors.length}.`,
        className: 'bg-green-50 border-green-200 text-green-800',
      });
    } catch (error) {
      console.error('[LessonUploader] Import failed:', error);
      setImportStats((current) => current || { count: 0, duplicates: 0, errors: 1, publication: 'failed' });
      toast({ title: 'فشل استيراد الدرس', description: error instanceof SyntaxError ? 'ملف JSON غير صالح.' : error.message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const openCreateForm = () => {
    setEditingLesson(null);
    setForm(emptyForm(levelId));
    setShowForm(true);
  };

  const openEditForm = (lesson) => {
    setEditingLesson(lesson);
    setForm({
      title: lesson.title || '',
      germanTitle: lesson.germanTitle || '',
      level: lesson.level || levelId,
      unit: lesson.unit || '',
      unitOrder: String(lesson.unitOrder ?? 0),
      unitTitleAr: lesson.unitTitleAr || '',
      unitTitleDe: lesson.unitTitleDe || '',
      order: String(lesson.order ?? 0),
      slug: lesson.slug || '',
      estimatedMinutes: String(lesson.estimatedMinutes ?? 0),
      objectives: parseList(lesson.objectives).join(' | '),
      content: JSON.stringify(lesson.content || {}, null, 2),
    });
    setShowForm(true);
  };

  const handleSaveForm = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const parsedContent = JSON.parse(form.content || '{}');
      const normalized = normalizeLesson({ ...form, id: editingLesson?.id, content: parsedContent }, form.level);
      if (normalized.error) throw new Error(normalized.error);
      const ignoredId = editingLesson?.supabaseId || editingLesson?.id || null;
      const { unique, duplicates } = validateUniqueLessons([normalized.lesson], publishedLessons, ignoredId);
      if (duplicates || unique.length === 0) throw new Error('يوجد درس بنفس slug أو بنفس ترتيب الدرس داخل الوحدة.');

      const result = editingLesson
        ? await updateLesson({ ...editingLesson, ...unique[0] })
        : await saveLesson(unique[0]);
      if (!result.success) throw new Error(result.error || 'فشل حفظ الدرس.');
      toast({ title: editingLesson ? 'تم تعديل الدرس' : 'تم نشر الدرس', className: 'bg-green-50 border-green-200 text-green-800' });
      setShowForm(false);
      setEditingLesson(null);
      setForm(emptyForm(levelId));
      await loadPublishedLessons();
    } catch (error) {
      console.error('[LessonUploader] Save failed:', error);
      toast({ title: 'فشل حفظ الدرس', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const runLessonAction = async (lesson, action) => {
    const id = lesson.supabaseId || lesson.id;
    setActionLessonId(id);
    try {
      const result = await action();
      if (!result.success) throw new Error(result.error || 'تعذر تنفيذ العملية.');
      await loadPublishedLessons();
      return true;
    } catch (error) {
      console.error('[LessonUploader] Lesson action failed:', error);
      toast({ title: 'فشلت العملية', description: error.message, variant: 'destructive' });
      return false;
    } finally {
      setActionLessonId(null);
    }
  };

  const handleUnpublish = async (lesson) => {
    if (!window.confirm('هل أنت متأكد من إلغاء نشر هذا الدرس؟ لن يظهر للزوار بعد ذلك.')) return;
    if (await runLessonAction(lesson, () => unpublishLesson(lesson))) {
      toast({ title: 'تم إلغاء نشر الدرس بنجاح', className: 'bg-green-50 border-green-200 text-green-800' });
    }
  };

  const handleDelete = async (lesson) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الدرس نهائيًا؟ لا يمكن التراجع عن هذا الإجراء.')) return;
    if (await runLessonAction(lesson, () => deletePublishedContentItem('lessons', lesson))) {
      toast({ title: 'تم حذف الدرس نهائيًا', className: 'bg-green-50 border-green-200 text-green-800' });
    }
  };

  const handleMove = async (lesson, direction) => {
    const index = sortedLessons.findIndex((item) => (item.supabaseId || item.id) === (lesson.supabaseId || lesson.id));
    const target = sortedLessons[index + direction];
    if (!target || target.unit !== lesson.unit) return;
    setActionLessonId(lesson.supabaseId || lesson.id);
    try {
      const first = await updateLesson({ ...lesson, order: target.order });
      const second = first.success ? await updateLesson({ ...target, order: lesson.order }) : first;
      if (!first.success || !second.success) throw new Error(first.error || second.error || 'تعذر تغيير الترتيب.');
      await loadPublishedLessons();
    } catch (error) {
      toast({ title: 'فشل تغيير ترتيب الدروس', description: error.message, variant: 'destructive' });
    } finally {
      setActionLessonId(null);
    }
  };

  const updateForm = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  return (
    <div className="mb-8 space-y-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm" data-testid="lesson-uploader">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-red-50 p-2"><FilePlus className="text-red-600" size={24} /></div>
          <div>
            <h3 className="font-bold text-slate-800">إضافة وإدارة دروس {levelId}</h3>
            <p className="text-xs text-slate-500">الحفظ والنشر يتمان في Supabase فقط.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileSelect} className="hidden" />
          <Button type="button" variant="outline" size="sm" onClick={downloadTemplate} className="gap-2"><FileDown size={16} /> تحميل قالب درس JSON</Button>
          <Button type="button" variant="outline" size="sm" onClick={openCreateForm} className="gap-2"><FilePlus size={16} /> إضافة درس</Button>
          <Button type="button" size="sm" disabled={isUploading} onClick={() => fileInputRef.current?.click()} className="gap-2 bg-red-600 text-white hover:bg-red-700">
            {isUploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
            {isUploading ? 'جاري الاستيراد...' : 'رفع درس JSON'}
          </Button>
        </div>
      </div>

      {importStats && (
        <div className={`grid gap-2 rounded-lg border p-3 text-sm sm:grid-cols-4 ${importStats.publication === 'published' ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-800'}`} data-testid="lesson-import-report">
          <span className="flex items-center gap-1 font-bold">
            {importStats.publication === 'published' ? <Check size={16} /> : <AlertTriangle size={16} />}
            {importStats.publication === 'published' ? 'تم النشر للزوار' : 'فشل الحفظ السحابي — لن يظهر للزوار'}
          </span>
          <span>تم إضافة: {importStats.count}</span><span>مكرر: {importStats.duplicates}</span><span>أخطاء: {importStats.errors}</span>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSaveForm} className="space-y-4 rounded-lg border border-amber-200 bg-amber-50/50 p-4">
          <div className="flex items-center justify-between"><h4 className="font-black">{editingLesson ? 'تعديل الدرس' : 'إضافة درس جديد'}</h4><Button type="button" variant="ghost" size="icon" onClick={() => setShowForm(false)}><X size={18} /></Button></div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm font-bold">العنوان العربي<input required value={form.title} onChange={updateForm('title')} className="mt-1 h-10 w-full rounded-md border bg-white px-3" /></label>
            <label className="text-sm font-bold">العنوان الألماني<input value={form.germanTitle} onChange={updateForm('germanTitle')} dir="ltr" className="mt-1 h-10 w-full rounded-md border bg-white px-3" /></label>
            <label className="text-sm font-bold">المستوى<select value={form.level} onChange={updateForm('level')} className="mt-1 h-10 w-full rounded-md border bg-white px-3">{['A1', 'A2', 'B1', 'B2'].map((level) => <option key={level}>{level}</option>)}</select></label>
            <label className="text-sm font-bold">Slug<input required value={form.slug} onChange={updateForm('slug')} dir="ltr" className="mt-1 h-10 w-full rounded-md border bg-white px-3" /></label>
            <label className="text-sm font-bold">معرّف الوحدة<input required value={form.unit} onChange={updateForm('unit')} dir="ltr" className="mt-1 h-10 w-full rounded-md border bg-white px-3" /></label>
            <label className="text-sm font-bold">ترتيب الوحدة<input required type="number" min="0" value={form.unitOrder} onChange={updateForm('unitOrder')} className="mt-1 h-10 w-full rounded-md border bg-white px-3" /></label>
            <label className="text-sm font-bold">عنوان الوحدة عربي<input value={form.unitTitleAr} onChange={updateForm('unitTitleAr')} className="mt-1 h-10 w-full rounded-md border bg-white px-3" /></label>
            <label className="text-sm font-bold">عنوان الوحدة ألماني<input value={form.unitTitleDe} onChange={updateForm('unitTitleDe')} dir="ltr" className="mt-1 h-10 w-full rounded-md border bg-white px-3" /></label>
            <label className="text-sm font-bold">ترتيب الدرس<input required type="number" min="0" value={form.order} onChange={updateForm('order')} className="mt-1 h-10 w-full rounded-md border bg-white px-3" /></label>
            <label className="text-sm font-bold">المدة بالدقائق<input type="number" min="0" value={form.estimatedMinutes} onChange={updateForm('estimatedMinutes')} className="mt-1 h-10 w-full rounded-md border bg-white px-3" /></label>
            <label className="text-sm font-bold md:col-span-2">الأهداف، افصل بينها بـ |<input value={form.objectives} onChange={updateForm('objectives')} className="mt-1 h-10 w-full rounded-md border bg-white px-3" /></label>
          </div>
          <label className="block text-sm font-bold">محتوى الدرس JSON<textarea required value={form.content} onChange={updateForm('content')} dir="ltr" rows={12} className="mt-1 w-full rounded-md border bg-white p-3 font-mono text-xs" /></label>
          <Button type="submit" disabled={isSaving} className="gap-2 bg-red-600 text-white hover:bg-red-700">{isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}{editingLesson ? 'حفظ التعديلات' : 'نشر الدرس'}</Button>
        </form>
      )}

      {showPublishedLessons && (
        <div className="border-t border-slate-200 pt-5" data-testid="published-lessons-list">
          <div className="mb-3 flex items-center justify-between"><h4 className="flex items-center gap-2 font-black"><BookOpen size={18} className="text-red-600" />الدروس المنشورة</h4><span className="text-xs font-bold text-slate-500">{sortedLessons.length} درس</span></div>
          {isLoadingPublished ? (
            <div className="flex items-center gap-2 py-4 text-sm text-slate-500"><Loader2 className="animate-spin" size={16} /> جاري تحميل الدروس...</div>
          ) : sortedLessons.length > 0 ? (
            <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
              {sortedLessons.map((lesson, index) => {
                const id = lesson.supabaseId || lesson.id;
                const busy = actionLessonId === id;
                const previous = sortedLessons[index - 1];
                const next = sortedLessons[index + 1];
                return (
                  <div key={id} className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0"><p className="truncate font-bold text-slate-800">{lesson.title}</p><p className="text-xs text-slate-500">{lesson.unitTitleAr || lesson.unit} · ترتيب {lesson.order} · {lesson.slug}</p></div>
                    <div className="flex flex-wrap gap-1.5">
                      <Button type="button" variant="outline" size="icon" title="تحريك لأعلى" disabled={busy || !previous || previous.unit !== lesson.unit} onClick={() => handleMove(lesson, -1)}><ArrowUp size={15} /></Button>
                      <Button type="button" variant="outline" size="icon" title="تحريك لأسفل" disabled={busy || !next || next.unit !== lesson.unit} onClick={() => handleMove(lesson, 1)}><ArrowDown size={15} /></Button>
                      <Button asChild variant="outline" size="sm" className="gap-1"><Link target="_blank" to={`/level/${String(lesson.level).toLowerCase()}/lesson/${encodeURIComponent(lesson.slug)}`}><Eye size={15} /> معاينة</Link></Button>
                      <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => openEditForm(lesson)}><Pencil size={15} /> تعديل</Button>
                      <Button type="button" variant="outline" size="sm" disabled={busy} className="gap-1 border-amber-200 text-amber-800" onClick={() => handleUnpublish(lesson)}>{busy ? <Loader2 className="animate-spin" size={15} /> : <Ban size={15} />} إلغاء نشر</Button>
                      <Button type="button" variant="outline" size="sm" disabled={busy} className="gap-1 border-red-200 text-red-700" onClick={() => handleDelete(lesson)}>{busy ? <Loader2 className="animate-spin" size={15} /> : <Trash2 size={15} />} حذف</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <p className="rounded-lg border border-dashed py-5 text-center text-sm font-bold text-slate-400">لا توجد دروس منشورة لهذا المستوى بعد.</p>}
        </div>
      )}
    </div>
  );
};

export default LessonUploader;

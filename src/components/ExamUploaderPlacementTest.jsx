import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileJson,
  FileUp,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Target,
  Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { getPlacementQuestionDedupKey, splitNewUniqueItems } from '@/utils/contentDedupUtils';
import {
  getPersistentPlacementTestQuestions,
  replacePlacementTestQuestions,
  savePlacementTestQuestions,
} from '@/utils/persistentDataStorage';
import { deletePublishedContentItem } from '@/services/contentRepository';
import { PLACEMENT_TEST_VERSION } from '@/utils/placementTestNormalizer';
import { validatePlacementQuestionBank } from '@/utils/placementTestValidator';
import BidiText from '@/components/common/BidiText';

const downloadJson = (content, filename) => {
  const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const createTemplate = () => ([{
  id: 'pt-a1-use-core-001',
  testVersion: PLACEMENT_TEST_VERSION,
  level: 'A1',
  skill: 'language_use',
  stage: 'core',
  difficulty: 1,
  question: 'Ich ___ aus Syrien.',
  stimulus: null,
  options: ['komme', 'kommt', 'kommst', 'kommen'],
  correctAnswer: 0,
  explanation: 'مع ich نستخدم komme.',
  descriptor: 'Can give basic personal information.',
}]);

const SummaryCell = ({ label, value }) => (
  <div className="rounded-md border border-black/10 bg-white px-3 py-2">
    <p className="text-xs font-bold text-slate-500">{label}</p>
    <p className="mt-1 text-lg font-black text-[#111111]">{value}</p>
  </div>
);

const ExamUploaderPlacementTest = () => {
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [questionsList, setQuestionsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [preview, setPreview] = useState(null);
  const [operationReport, setOperationReport] = useState(null);
  const [showReplacement, setShowReplacement] = useState(false);
  const [replacementWord, setReplacementWord] = useState('');
  const [backupDownloaded, setBackupDownloaded] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      setQuestionsList(await getPersistentPlacementTestQuestions());
    } catch (error) {
      console.error('[PlacementAdmin] Failed to load questions:', error);
      toast({ title: 'تعذر تحميل أسئلة تحديد المستوى', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('placement_testsUpdated', loadData);
    return () => window.removeEventListener('placement_testsUpdated', loadData);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const existingDuplicateCount = useMemo(() => {
    if (!preview) return 0;
    return splitNewUniqueItems(
      preview.validation.validQuestions,
      questionsList,
      getPlacementQuestionDedupKey
    ).skipped;
  }, [preview, questionsList]);

  const resetSelection = () => {
    setSelectedFileName('');
    setPreview(null);
    setShowReplacement(false);
    setReplacementWord('');
    setBackupDownloaded(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFileName(file.name);
    setOperationReport(null);
    setShowReplacement(false);
    setReplacementWord('');
    setBackupDownloaded(false);
    try {
      const parsed = JSON.parse(await file.text());
      const items = Array.isArray(parsed) ? parsed : [parsed];
      const validation = validatePlacementQuestionBank(items, { requireComplete: false });
      const fullValidation = validatePlacementQuestionBank(items, { requireComplete: true });
      setPreview({ validation, fullValidation });
    } catch (error) {
      console.error('[PlacementAdmin] Invalid JSON file:', error);
      setPreview(null);
      toast({ title: 'صيغة ملف JSON غير صحيحة', variant: 'destructive' });
    }
  };

  const handleAddQuestions = async () => {
    if (!preview?.validation.validQuestions.length) return;
    const { unique, skipped } = splitNewUniqueItems(
      preview.validation.validQuestions,
      questionsList,
      getPlacementQuestionDedupKey
    );
    setImporting(true);
    try {
      const saveResult = await savePlacementTestQuestions(unique);
      if (!saveResult.success) throw new Error(saveResult.error || 'Cloud save failed.');
      setOperationReport({
        type: 'add',
        added: saveResult.count,
        duplicates: skipped + (saveResult.duplicates || 0),
        errors: preview.validation.itemErrors.length,
      });
      resetSelection();
      await loadData();
      toast({ title: 'تم نشر الأسئلة الجديدة بنجاح' });
    } catch (error) {
      console.error('[PlacementAdmin] Add failed:', error);
      toast({ title: 'فشل الحفظ السحابي، لم يتم نشر الأسئلة', variant: 'destructive' });
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadBackup = () => {
    downloadJson(questionsList, `placement-test-backup-${new Date().toISOString().slice(0, 10)}.json`);
    setBackupDownloaded(true);
  };

  const handleReplace = async () => {
    if (!preview?.fullValidation.complete || replacementWord.trim() !== 'استبدال' || !backupDownloaded) return;
    setImporting(true);
    try {
      const replaceResult = await replacePlacementTestQuestions(preview.fullValidation.validQuestions);
      if (!replaceResult.success) throw new Error(replaceResult.error || 'Cloud replacement failed.');
      setOperationReport({
        type: 'replace',
        added: replaceResult.count,
        unpublished: replaceResult.unpublished,
        duplicates: 0,
        errors: 0,
      });
      resetSelection();
      await loadData();
      toast({ title: 'تم استبدال اختبار تحديد المستوى ونشر البنك الجديد' });
    } catch (error) {
      console.error('[PlacementAdmin] Replacement failed:', error);
      toast({ title: 'فشل استبدال الاختبار أو حفظ البنك الجديد', variant: 'destructive' });
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = async (question) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا السؤال؟')) return;
    const deletion = await deletePublishedContentItem('placement_tests', question);
    if (!deletion.success) {
      console.error('[PlacementAdmin] Delete failed:', deletion.error);
      toast({ title: 'فشل حذف السؤال من التخزين السحابي', variant: 'destructive' });
      return;
    }
    await loadData();
    toast({ title: 'تم حذف السؤال' });
  };

  const summary = preview?.validation.summary;

  return (
    <section className="overflow-hidden rounded-md border border-black/10 bg-white" dir="rtl">
      <header className="flex flex-col gap-4 border-b border-black/10 bg-[#fcfaf6] p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-xl font-black text-[#111111]"><Target className="text-[#d71920]" /> إدارة اختبار تحديد المستوى</h3>
          <p className="mt-2 text-sm text-slate-600">إدارة بنك {PLACEMENT_TEST_VERSION} داخل content_items.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-white">{questionsList.length} سؤال منشور</Badge>
          <Button type="button" size="icon" variant="outline" onClick={loadData} disabled={loading} title="تحديث القائمة">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </header>

      <div className="p-6">
        <div className="rounded-md border border-black/10 bg-[#fcfaf6] p-5">
          <h4 className="flex items-center gap-2 font-black text-[#111111]"><FileJson size={19} className="text-[#b08000]" /> رفع بنك أسئلة JSON</h4>
          <p className="mt-2 text-sm leading-6 text-slate-600">يتم فحص الحقول والتوزيع والمكررات قبل إتاحة أي عملية حفظ.</p>
          <input ref={fileInputRef} type="file" accept=".json,application/json" onChange={handleFileSelect} className="hidden" />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button type="button" onClick={() => fileInputRef.current?.click()} disabled={importing} className="min-h-11 gap-2 bg-[#111111] text-white hover:bg-black">
              <FileUp size={18} /> اختيار ملف JSON
            </Button>
            <Button type="button" variant="outline" onClick={() => downloadJson(createTemplate(), 'cefr-placement-question-template.json')} className="min-h-11 gap-2">
              <Download size={18} /> تحميل قالب سؤال
            </Button>
          </div>
          {selectedFileName && <p className="mt-3 text-sm font-bold text-slate-700">الملف المختار: <span dir="ltr">{selectedFileName}</span></p>}
        </div>

        {preview && summary && (
          <section className="mt-6 rounded-md border border-[#d7a900]/40 bg-[#fffaf0] p-5" aria-labelledby="placement-import-report">
            <h4 id="placement-import-report" className="font-black text-[#111111]">تقرير التحقق قبل الحفظ</h4>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              <SummaryCell label="الإجمالي الصالح" value={summary.total} />
              {Object.entries(summary.levels).map(([level, count]) => <SummaryCell key={level} label={level} value={count} />)}
              <SummaryCell label="Core" value={summary.stages.core} />
              <SummaryCell label="Tiebreaker" value={summary.stages.tiebreaker} />
              <SummaryCell label="القواعد والمفردات" value={summary.skills.language_use} />
              <SummaryCell label="القراءة" value={summary.skills.reading} />
              <SummaryCell label="الاستماع" value={summary.skills.listening} />
              <SummaryCell label="أخطاء البنية" value={preview.validation.itemErrors.length} />
              <SummaryCell label="مكرر داخل الملف" value={preview.validation.duplicates} />
              <SummaryCell label="مكرر منشور" value={existingDuplicateCount} />
            </div>

            {preview.validation.itemErrors.length > 0 && (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                <p className="font-black">أخطاء يجب مراجعتها</p>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  {preview.validation.itemErrors.slice(0, 8).map((item) => (
                    <li key={`${item.index}-${item.id || 'unknown'}`}>العنصر {item.index + 1}: {item.errors.join('، ')}</li>
                  ))}
                </ul>
              </div>
            )}

            {!preview.fullValidation.complete && (
              <p className="mt-4 flex items-start gap-2 rounded-md border border-amber-300 bg-white p-4 text-sm font-bold text-amber-900">
                <AlertTriangle className="mt-0.5 shrink-0" size={18} />
                الملف ليس بنكًا كاملًا من 60 سؤالًا بالتوزيع المطلوب، لذلك يمكن إضافة أسئلته الصالحة فقط ولا يمكن استخدامه للاستبدال الكامل.
              </p>
            )}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                onClick={handleAddQuestions}
                disabled={importing || preview.validation.validQuestions.length === 0}
                className="min-h-11 gap-2 bg-[#d71920] text-white hover:bg-[#b91218]"
              >
                {importing ? <Loader2 className="animate-spin" size={18} /> : <FileUp size={18} />}
                إضافة أسئلة جديدة
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowReplacement(true)}
                disabled={importing || !preview.fullValidation.complete}
                className="min-h-11 gap-2 border-red-300 text-red-800"
              >
                <ShieldAlert size={18} /> استبدال الاختبار بالكامل
              </Button>
            </div>
          </section>
        )}

        {showReplacement && preview?.fullValidation.complete && (
          <section className="mt-6 rounded-md border-2 border-red-300 bg-red-50 p-5" aria-labelledby="replace-placement-heading">
            <h4 id="replace-placement-heading" className="flex items-center gap-2 font-black text-red-900"><ShieldAlert size={20} /> تأكيد الاستبدال الكامل</h4>
            <p className="mt-3 leading-7 text-red-900">سيتم إلغاء نشر جميع أسئلة تحديد المستوى الحالية ثم نشر البنك الجديد. إذا فشل الرفع، يحاول النظام إعادة نشر البنك السابق تلقائيًا.</p>
            <Button type="button" variant="outline" onClick={handleDownloadBackup} className="mt-4 min-h-11 gap-2 border-red-300 bg-white">
              <Download size={18} /> تنزيل نسخة JSON احتياطية
            </Button>
            <div className="mt-4 max-w-md">
              <Label htmlFor="placement-replace-word">اكتب كلمة «استبدال» للتأكيد</Label>
              <Input id="placement-replace-word" value={replacementWord} onChange={(event) => setReplacementWord(event.target.value)} className="mt-2 bg-white" autoComplete="off" />
            </div>
            <Button
              type="button"
              onClick={handleReplace}
              disabled={importing || !backupDownloaded || replacementWord.trim() !== 'استبدال'}
              className="mt-4 min-h-11 gap-2 bg-red-700 text-white hover:bg-red-800"
            >
              {importing ? <Loader2 className="animate-spin" size={18} /> : <ShieldAlert size={18} />}
              تنفيذ الاستبدال
            </Button>
            {!backupDownloaded && <p className="mt-3 text-sm font-bold text-red-800">نزّل النسخة الاحتياطية أولًا لتفعيل زر التنفيذ.</p>}
          </section>
        )}

        {operationReport && (
          <section className="mt-6 rounded-md border border-green-200 bg-green-50 p-5 text-green-900" aria-live="polite">
            <h4 className="flex items-center gap-2 font-black"><CheckCircle2 size={19} /> تقرير العملية</h4>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold">
              <span>تمت إضافة: {operationReport.added}</span>
              <span>مكرر تم تجاهله: {operationReport.duplicates}</span>
              <span>أخطاء: {operationReport.errors}</span>
              {operationReport.type === 'replace' && <span>تم إلغاء نشر القديم: {operationReport.unpublished}</span>}
              <span>حالة النشر: تم النشر للزوار</span>
            </div>
          </section>
        )}

        <section className="mt-8" aria-labelledby="published-placement-heading">
          <h4 id="published-placement-heading" className="font-black text-[#111111]">الأسئلة المنشورة حاليًا</h4>
          {questionsList.length === 0 ? (
            <p className="mt-4 rounded-md border border-dashed border-black/15 p-8 text-center text-slate-500">لا توجد أسئلة منشورة.</p>
          ) : (
            <div className="mt-4 max-h-[520px] space-y-3 overflow-y-auto pl-1">
              {questionsList.map((question, index) => (
                <article key={question.supabaseId || question.id || index} className="flex items-start justify-between gap-4 rounded-md border border-black/10 p-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{question.testVersion || 'إصدار قديم'}</Badge>
                      <Badge variant="outline">{question.level || 'بلا مستوى'}</Badge>
                      {question.skill && <Badge variant="outline">{question.skill}</Badge>}
                      {question.stage && <Badge variant="outline">{question.stage}</Badge>}
                    </div>
                    <BidiText as="p" text={question.question} className="mt-3 font-bold leading-7 text-slate-800" />
                  </div>
                  <Button type="button" size="icon" variant="ghost" onClick={() => handleDelete(question)} className="shrink-0 text-red-700" title="حذف السؤال">
                    <Trash2 size={18} />
                  </Button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
};

export default ExamUploaderPlacementTest;

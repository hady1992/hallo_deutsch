import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Plus, Save, Target, ListOrdered, CheckCircle, RefreshCw, AlertTriangle, FileUp, FileJson, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input'; 
import { Label } from '@/components/ui/label';
import { 
    savePlacementTestQuestions, 
    getPersistentPlacementTestQuestions 
} from '@/utils/persistentDataStorage';

// رسائل عربية مبسّطة تُعرض للمستخدم دائمًا. التفاصيل التقنية الكاملة تُسجَّل
// بالـ Console فقط عبر console.error.
const FRIENDLY_ERRORS = {
  BAD_FORMAT: 'صيغة الملف غير صحيحة',
  NO_VALID_ITEMS: 'الملف لا يحتوي على أسئلة صالحة',
  PARTIAL_SKIPPED: 'تم استيراد بعض العناصر وتجاهل العناصر الناقصة',
};

const ExamUploaderPlacementTest = () => {
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [questionsList, setQuestionsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStats, setImportStats] = useState(null);
  
  // Manual Entry State
  const [newQuestion, setNewQuestion] = useState({
      question: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      correctAnswer: '0', 
      level: 'A1'
  });

  const loadData = async () => {
      setLoading(true);
      try {
        const data = await getPersistentPlacementTestQuestions();
        // Filter out duplicates if any in view
        setQuestionsList(data || []);
      } catch (e) {
        console.error("Load error:", e);
        toast({ title: "Error loading data", variant: "destructive" });
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('placementTestsUpdated', loadData);
    return () => {
        window.removeEventListener('placementTestsUpdated', loadData);
    };
  }, []);

  const handleManualAdd = async () => {
      if (!newQuestion.question || !newQuestion.option1 || !newQuestion.option2 || !newQuestion.option3 || !newQuestion.option4) {
          toast({
              title: "حقول ناقصة",
              description: "يرجى ملء السؤال وجميع الخيارات.",
              variant: "destructive"
          });
          return;
      }

      setSaving(true);
      try {
          // Robust UUID generation
          const newId = crypto.randomUUID ? crypto.randomUUID() : `pt_${Date.now()}_${Math.random().toString(36).slice(2)}`;

          const formattedQuestion = {
              id: newId, 
              question: newQuestion.question,
              options: [newQuestion.option1, newQuestion.option2, newQuestion.option3, newQuestion.option4],
              correctAnswer: parseInt(newQuestion.correctAnswer),
              level: newQuestion.level,
              source: 'local' // Mark as local initially
          };

          // 1. Get FRESH current data to ensure we don't overwrite concurrent updates from this session
          const current = await getPersistentPlacementTestQuestions();
          
          // 2. Append new
          // We only save the "User Added" or "Modified" ones typically, but our saver handles the full list logic for LS
          // Filter out defaults if we only want to save custom, BUT getPersistent.. returns ALL.
          // IMPORTANT: We should only pass user-modifiable data to save if we want to avoid saving defaults to DB
          // For now, let's assume we save everything that isn't flagged 'default' OR we just append to the custom list.
          
          // Actually, `getPersistentPlacementTestQuestions` merges default + local.
          // If we save `[...current, new]`, we might re-save defaults as custom.
          // Better: Get current, filter to only non-default, add new, then save.
          const customOnly = current.filter(q => q.source !== 'default');
          const updatedList = [...customOnly, formattedQuestion];
          
          const result = await savePlacementTestQuestions(updatedList);
          
          if (result.success) {
            toast({
                title: "تم الحفظ بنجاح",
                description: "تم حفظ السؤال ومزامنته.",
                className: "bg-green-50 border-green-200 text-green-800"
            });
            // Reset form
            setNewQuestion({
                question: '',
                option1: '',
                option2: '',
                option3: '',
                option4: '',
                correctAnswer: '0',
                level: 'A1'
            });
            // Refresh list
            loadData();
            // Dispatch event
            window.dispatchEvent(new Event('placementTestsUpdated'));
          } else {
             toast({
                title: "تم الحفظ محلياً",
                description: "فشلت المزامنة السحابية: " + (result.error || "Unknown error"),
                variant: "warning"
            });
             // Still refresh list to show local add
             loadData();
          }

      } catch (err) {
          console.error(err);
          toast({ title: "Error saving question", description: err.message, variant: "destructive" });
      } finally {
          setSaving(false);
      }
  };

  const handleDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا السؤال؟")) {
      const current = await getPersistentPlacementTestQuestions();
      // Only allow deleting custom ones usually, but let's assume admin can delete any 'local/cloud' copy
      const updated = current.filter(q => q.id !== id && q.source !== 'default');
      
      await savePlacementTestQuestions(updated);
      loadData();
      window.dispatchEvent(new Event('placementTestsUpdated'));
      toast({ title: "تم الحذف", className: "bg-red-50 border-red-200 text-red-800" });
    }
  };

  // تحويل الإجابة الصحيحة إلى رقم موضع الخيار (index):
  // - رقم أصلًا → يُترك كما هو.
  // - نص مطابق لأحد عناصر options → يُحوَّل لرقم موضعه.
  // - تعذّر المطابقة → يُرجع -1 (يُعتبر السؤال غير صالح ويُستبعد).
  const normalizeCorrectAnswer = (options, correctAnswer) => {
    if (typeof correctAnswer === 'number') {
      return (correctAnswer >= 0 && correctAnswer < options.length) ? correctAnswer : -1;
    }
    const idx = options.findIndex(o => String(o).trim() === String(correctAnswer).trim());
    return idx;
  };

  const validatePlacementQuestion = (item) => {
    const errors = [];
    if (!item.question || typeof item.question !== 'string') errors.push('question مطلوب');
    if (!Array.isArray(item.options) || item.options.length === 0) errors.push('options يجب أن تكون قائمة (array)');
    if (item.correctAnswer === undefined || item.correctAnswer === null || item.correctAnswer === '') errors.push('correctAnswer مطلوب');
    return errors;
  };

  const downloadJsonTemplate = () => {
    const jsonContent = JSON.stringify([
      {
        id: "pt-101",
        question: "Wie ___ du?",
        options: ["heißt", "heißen", "hast", "heiße"],
        correctAnswer: 0,
        level: "A1"
      },
      {
        id: "pt-102",
        question: "___ Frau ist Lehrerin.",
        options: ["Der", "Die", "Das", "Den"],
        correctAnswer: 1,
        level: "A1"
      }
    ], null, 2);

    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "placement_test_template.json");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "تم التحميل",
      description: "تم تحميل قالب اختبار تحديد المستوى (JSON) بنجاح.",
      className: "bg-green-50 border-green-200 text-green-800"
    });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) processJsonFile(file);
    e.target.value = '';
  };

  const processJsonFile = async (file) => {
    setIsImporting(true);
    setImportStats(null);

    try {
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

      const validQuestions = [];
      let errors = 0;

      itemsArray.forEach((item, idx) => {
        const itemErrors = validatePlacementQuestion(item);
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

        const id = item.id || (crypto.randomUUID ? crypto.randomUUID() : `pt_${Date.now()}_${idx}`);
        validQuestions.push({
          id,
          question: item.question,
          options: item.options,
          correctAnswer: correctIdx,
          level: item.level || item.targetLevel || 'A1', // level أو targetLevel اختياري
          explanation: item.explanation || '', // explanation اختياري
          source: 'local'
        });
      });

      if (validQuestions.length === 0) throw new Error(FRIENDLY_ERRORS.NO_VALID_ITEMS);

      const current = await getPersistentPlacementTestQuestions();
      const customOnly = current.filter(q => q.source !== 'default');
      const updatedList = [...customOnly, ...validQuestions];
      const result = await savePlacementTestQuestions(updatedList);

      setImportStats({ success: validQuestions.length, errors });
      loadData();
      window.dispatchEvent(new Event('placementTestsUpdated'));

      if (result.success) {
        toast({
          title: "تم الاستيراد بنجاح",
          description: errors > 0
            ? `${FRIENDLY_ERRORS.PARTIAL_SKIPPED} (تمت إضافة ${validQuestions.length} سؤال، وتجاهل ${errors}).`
            : `تمت إضافة ${validQuestions.length} سؤال ومزامنتها مع السحابة.`,
          className: "bg-green-50 border-green-200 text-green-800"
        });
      } else {
        toast({
          title: "تم الحفظ محلياً",
          description: "فشلت المزامنة مع السحابة، لكن تم الحفظ محليًا بنجاح.",
          variant: "warning"
        });
      }

    } catch (error) {
      console.error('خطأ استيراد أسئلة تحديد المستوى:', error);
      toast({
        title: "خطأ في الاستيراد",
        description: error.message || FRIENDLY_ERRORS.BAD_FORMAT,
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-50 p-6 border-b border-slate-200 flex items-center justify-between">
        <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-xl">
                <Target className="text-purple-600" size={24} />
                إدارة اختبار تحديد المستوى
            </h3>
            <p className="text-slate-500 text-sm mt-1">أضف وعدل الأسئلة التي تظهر في اختبار تحديد المستوى.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </Button>
            <Badge variant="outline" className="bg-white border-slate-200 shadow-sm">
            {questionsList.length} سؤال
            </Badge>
        </div>
      </div>

      <div className="p-6">
          {/* Bulk JSON Import Section */}
          <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-700 mb-1 flex items-center gap-2">
                  <FileJson className="w-5 h-5 text-amber-600" /> رفع دفعة أسئلة (JSON)
              </h4>
              <p className="text-slate-500 text-sm mb-4">
                  بدل إضافة سؤال واحد يدويًا، يمكنك رفع ملف JSON يحتوي عدة أسئلة دفعة واحدة.
              </p>
              <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".json"
                  className="hidden"
              />
              <div className="flex flex-col md:flex-row gap-3">
                  <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isImporting}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                  >
                      {isImporting ? <Loader2 className="animate-spin w-4 h-4" /> : <FileUp className="w-4 h-4" />}
                      رفع ملف أسئلة (JSON)
                  </Button>
                  <Button
                      onClick={downloadJsonTemplate}
                      variant="outline"
                      className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50 flex items-center justify-center gap-2"
                  >
                      <FileJson className="w-4 h-4" />
                      تحميل قالب JSON
                  </Button>
              </div>
              {importStats && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-lg flex items-center justify-between text-sm flex-wrap gap-2">
                      <span className="text-green-800 flex items-center gap-2">
                          <Check size={16} /> تم إضافة {importStats.success} سؤال بنجاح
                      </span>
                      {importStats.errors > 0 && (
                          <span className="text-amber-600 flex items-center gap-2">
                              <AlertTriangle size={16} /> {FRIENDLY_ERRORS.PARTIAL_SKIPPED} ({importStats.errors} عنصر)
                          </span>
                      )}
                  </div>
              )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form Section */}
              <div className="lg:col-span-1 space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-100 h-fit">
                  <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                      <Plus className="w-5 h-5 text-blue-500" /> إضافة سؤال جديد
                  </h4>
                  
                  <div className="space-y-3">
                      <div>
                          <Label className="text-xs text-slate-500 mb-1.5 block">نص السؤال</Label>
                          <Input 
                              value={newQuestion.question}
                              onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
                              placeholder="اكتب السؤال بالألمانية..."
                              className="bg-white border-slate-200 focus:border-blue-400"
                              dir="ltr"
                          />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map((num, idx) => (
                             <div key={idx}>
                                <Label className="text-xs text-slate-500 mb-1.5 block">خيار {num}</Label>
                                <Input 
                                    value={newQuestion[`option${num}`]}
                                    onChange={(e) => setNewQuestion({...newQuestion, [`option${num}`]: e.target.value})}
                                    placeholder={`Option ${num}`}
                                    className="bg-white text-sm"
                                    dir="ltr"
                                />
                             </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                          <div>
                              <Label className="text-xs text-slate-500 mb-1.5 block">الإجابة الصحيحة</Label>
                              <select 
                                  className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                  value={newQuestion.correctAnswer}
                                  onChange={(e) => setNewQuestion({...newQuestion, correctAnswer: e.target.value})}
                              >
                                  <option value="0">الخيار 1</option>
                                  <option value="1">الخيار 2</option>
                                  <option value="2">الخيار 3</option>
                                  <option value="3">الخيار 4</option>
                              </select>
                          </div>

                          <div>
                              <Label className="text-xs text-slate-500 mb-1.5 block">المستوى</Label>
                              <select 
                                  className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                  value={newQuestion.level}
                                  onChange={(e) => setNewQuestion({...newQuestion, level: e.target.value})}
                              >
                                  <option value="A1">A1 (مبتدئ)</option>
                                  <option value="A2">A2 (أساسي)</option>
                                  <option value="B1">B1 (متوسط)</option>
                                  <option value="B2">B2 (متقدم)</option>
                              </select>
                          </div>
                      </div>

                      <Button onClick={handleManualAdd} disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4">
                          {saving ? <RefreshCw className="animate-spin w-4 h-4 mr-2"/> : <Save className="w-4 h-4 mr-2" />} 
                          {saving ? "جاري الحفظ..." : "حفظ السؤال"}
                      </Button>
                  </div>
              </div>

              {/* List Section */}
              <div className="lg:col-span-2">
                  <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                      <ListOrdered className="w-5 h-5 text-slate-500" /> قائمة الأسئلة
                  </h4>
                  
                  <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                      {questionsList.length === 0 ? (
                          <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                              <p className="text-slate-400">لا توجد أسئلة مضافة حتى الآن.</p>
                          </div>
                      ) : (
                          questionsList.map((q, idx) => (
                              <div key={q.id || idx} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow relative group">
                                  {q.source !== 'default' && (
                                      <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <Button 
                                              variant="ghost" 
                                              size="icon" 
                                              className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                                              onClick={() => handleDelete(q.id)}
                                          >
                                              <Trash2 size={16} />
                                          </Button>
                                      </div>
                                  )}
                                  
                                  <div className="flex items-start gap-3 mb-2 pr-8">
                                      <Badge variant="secondary" className={`${
                                          q.level === 'A1' ? 'bg-green-100 text-green-800' :
                                          q.level === 'A2' ? 'bg-blue-100 text-blue-800' :
                                          q.level === 'B1' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                      }`}>
                                          {q.level}
                                      </Badge>
                                      {q.source === 'default' && <Badge variant="outline" className="text-xs text-slate-400">افتراضي</Badge>}
                                      {q.source === 'cloud' && <Badge variant="outline" className="text-xs text-blue-400 border-blue-200 bg-blue-50">سحابي</Badge>}
                                      <h5 className="font-bold text-slate-800 text-lg" dir="ltr">{q.question}</h5>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm pl-2 border-r-2 border-slate-100 mr-1" dir="ltr">
                                      {q.options && q.options.map((opt, i) => (
                                          <div key={i} className={`flex items-center gap-2 ${i === parseInt(q.correctAnswer) ? 'text-green-600 font-bold bg-green-50 px-2 rounded' : 'text-slate-600 px-2'}`}>
                                              <span className="text-xs opacity-50">{i + 1}.</span> {opt}
                                              {i === parseInt(q.correctAnswer) && <CheckCircle size={12} />}
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default ExamUploaderPlacementTest;
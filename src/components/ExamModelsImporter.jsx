import React, { useState, useEffect, useRef } from 'react';
import { Trash2, FileBox, Download, Play, Pause, Upload, Check, AlertCircle, FileAudio, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getImportedExamModels, deleteImportedExamModel, clearImportedExamModels, saveImportedExamModels } from '@/utils/storageManager';
import { Badge } from '@/components/ui/badge';

const ExamModelsImporter = () => {
  const { toast } = useToast();
  const [models, setModels] = useState([]);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [audio] = useState(new Audio());

  // Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    level: 'A1',
    description: '',
    date: new Date().toISOString().split('T')[0],
    pdfFile: null,
    audioFile: null
  });
  const pdfInputRef = useRef(null);
  const audioInputRef = useRef(null);

  useEffect(() => {
    setModels(getImportedExamModels());
    const handleUpdate = () => setModels(getImportedExamModels());
    window.addEventListener('dataImported', handleUpdate);
    return () => window.removeEventListener('dataImported', handleUpdate);
  }, []);

  useEffect(() => {
    const handleEnded = () => setPlayingAudio(null);
    audio.addEventListener('ended', handleEnded);
    return () => {
        audio.removeEventListener('ended', handleEnded);
        audio.pause();
    };
  }, [audio]);

  const toggleAudio = (url) => {
    if (playingAudio === url) {
        audio.pause();
        setPlayingAudio(null);
    } else {
        audio.src = url;
        audio.play();
        setPlayingAudio(url);
    }
  };

  const handleDelete = (id) => {
    if(window.confirm("حذف هذا النموذج؟")) {
        deleteImportedExamModel(id);
        toast({ title: "تم الحذف", description: "تم حذف النموذج بنجاح", className: "bg-red-50 border-red-200 text-red-800" });
    }
  };

  const handleClearAll = () => {
    if(window.confirm("هل أنت متأكد من حذف جميع النماذج؟")) {
        clearImportedExamModels();
        toast({ title: "تم مسح الكل", className: "bg-red-50 border-red-200 text-red-800" });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'pdfFile') {
          // Limit: 10MB for PDF
          const limit = 10 * 1024 * 1024;
          if (file.size > limit) {
             toast({
                title: "حجم الملف كبير جداً",
                description: "الحد الأقصى لملفات PDF هو 10 ميجابايت.",
                variant: "destructive"
             });
             e.target.value = null;
             return;
          }
      } else if (type === 'audioFile') {
          // Limit: 100MB for Audio
          const limit = 100 * 1024 * 1024;
          if (file.size > limit) {
             toast({
                title: "حجم الملف كبير جداً",
                description: "الحد الأقصى لملفات الصوت هو 100 ميجابايت.",
                variant: "destructive"
             });
             e.target.value = null;
             return;
          }
      }

      setFormData(prev => ({ ...prev, [type]: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.name || !formData.level) {
        throw new Error("الاسم والمستوى حقول مطلوبة");
      }

      if (formData.pdfFile || formData.audioFile) {
        throw new Error("تخزين الملفات الكبيرة محليًا غير مناسب للإنتاج. سيتم ربط تخزين ملفات خارجي لاحقًا.");
      }

      const newModel = {
        id: `exam_${Date.now()}`,
        name: formData.name,
        level: formData.level,
        description: formData.description,
        date: formData.date,
        pdfUrl: null,
        audioUrl: null,
        uploadedAt: new Date().toISOString()
      };

      const currentModels = getImportedExamModels();
      const updatedModels = [...currentModels, newModel];

      // Attempt to save
      try {
        const success = saveImportedExamModels(updatedModels);
        if (!success) throw new Error("Storage Full");
      } catch (storageError) {
        throw new Error("عذراً، مساحة التخزين المحلي ممتلئة. لا يمكن حفظ ملفات كبيرة بهذا الحجم في المتصفح مباشرة. يرجى حذف بعض الملفات القديمة أو استخدام ملفات أصغر.");
      }

      toast({
        title: "تم الإضافة بنجاح",
        description: "تمت إضافة نموذج الامتحان بنجاح.",
        className: "bg-green-50 border-green-200 text-green-800"
      });

      // Reset Form
      setFormData({
        name: '',
        level: 'A1',
        description: '',
        date: new Date().toISOString().split('T')[0],
        pdfFile: null,
        audioFile: null
      });
      if (pdfInputRef.current) pdfInputRef.current.value = null;
      if (audioInputRef.current) audioInputRef.current.value = null;

    } catch (error) {
      console.error(error);
      toast({
        title: "خطأ في الحفظ",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="space-y-8">
        {/* Upload Form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                <Upload size={20} className="text-red-600" />
                إضافة نموذج امتحان جديد
            </h3>
            <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
              تخزين الملفات الكبيرة محليًا غير مناسب للإنتاج. سيتم ربط تخزين ملفات خارجي لاحقًا.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">اسم الامتحان <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="مثال: امتحان B1 تجريبي 2024"
                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">المستوى <span className="text-red-500">*</span></label>
                        <select
                            name="level"
                            value={formData.level}
                            onChange={handleInputChange}
                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white transition-all"
                        >
                            <option value="A1">A1</option>
                            <option value="A2">A2</option>
                            <option value="B1">B1</option>
                            <option value="B2">B2</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">الوصف (اختياري)</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="وصف مختصر لمحتوى الامتحان..."
                        rows="3"
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all resize-none"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <FileText size={16} className="text-red-500"/> ملف PDF (الأسئلة)
                        </label>
                        <input
                            type="file"
                            accept="application/pdf"
                            ref={pdfInputRef}
                            onChange={(e) => handleFileChange(e, 'pdfFile')}
                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer"
                        />
                         <p className="text-xs text-slate-400 flex items-center gap-1">
                            <AlertCircle size={10} /> الحد الأقصى: 10 ميجابايت
                         </p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                             <FileAudio size={16} className="text-amber-500"/> ملف الصوت (للاستماع)
                        </label>
                        <input
                            type="file"
                            accept="audio/*"
                            ref={audioInputRef}
                            onChange={(e) => handleFileChange(e, 'audioFile')}
                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-600 file:text-white hover:file:bg-amber-700 cursor-pointer"
                        />
                         <p className="text-xs text-slate-400 flex items-center gap-1">
                             <AlertCircle size={10} /> الحد الأقصى: 100 ميجابايت
                         </p>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto min-w-[180px] bg-slate-900 hover:bg-slate-800 text-white shadow-lg">
                        {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Check className="mr-2" size={18} />}
                        {isSubmitting ? 'جاري الحفظ...' : 'حفظ النموذج'}
                    </Button>
                </div>
            </form>
        </div>

        {/* Existing Models List */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-lg text-slate-800">نماذج الامتحانات ({models.length})</h3>
            {models.length > 0 && (
                <Button variant="destructive" size="sm" onClick={handleClearAll} className="gap-2">
                    <Trash2 size={14} /> مسح الكل
                </Button>
            )}
            </div>

            <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.length === 0 ? (
                <div className="col-span-full text-center py-16 text-slate-400 bg-slate-50 rounded-xl border-dashed border-2 border-slate-200">
                    <FileBox size={48} className="mx-auto mb-3 opacity-20" />
                    <p>لا توجد نماذج محفوظة حتى الآن.</p>
                </div>
            ) : (
                models.map(model => (
                <motion.div
                    key={model.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all relative group flex flex-col h-full"
                >
                    <div className="flex justify-between items-start mb-3">
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">{model.level || '?'}</Badge>
                        <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">{model.date}</span>
                    </div>

                    <h4 className="font-bold text-slate-800 text-lg mb-2 line-clamp-1" title={model.name}>{model.name}</h4>
                    <p className="text-sm text-slate-600 mb-6 line-clamp-2 min-h-[40px]">{model.description || 'لا يوجد وصف'}</p>

                    <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-100">
                        {model.pdfUrl ? (
                            <a
                                href={model.pdfUrl}
                                download={`${model.name}.pdf`}
                                className="flex-1 inline-flex items-center justify-center gap-2 text-xs font-medium bg-red-50 hover:bg-red-100 text-red-700 py-2.5 rounded-lg transition-colors"
                            >
                                <Download size={14} /> PDF
                            </a>
                        ) : (
                            <span className="flex-1 text-center text-xs text-slate-300 py-2.5 bg-slate-50 rounded-lg">لا يوجد PDF</span>
                        )}

                        {model.audioUrl ? (
                            <Button
                                size="sm"
                                variant={playingAudio === model.audioUrl ? "default" : "secondary"}
                                className={cn("flex-1 gap-2 text-xs py-2.5 h-auto", playingAudio === model.audioUrl ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-amber-50 text-amber-700 hover:bg-amber-100")}
                                onClick={() => toggleAudio(model.audioUrl)}
                            >
                                {playingAudio === model.audioUrl ? <Pause size={14} /> : <Play size={14} />}
                                {playingAudio === model.audioUrl ? 'إيقاف' : 'صوت'}
                            </Button>
                        ) : (
                            <span className="flex-1 text-center text-xs text-slate-300 py-2.5 bg-slate-50 rounded-lg">لا يوجد صوت</span>
                        )}
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -top-2 -right-2 bg-white shadow-sm border border-slate-100 text-red-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full h-8 w-8"
                        onClick={() => handleDelete(model.id)}
                    >
                        <Trash2 size={14} />
                    </Button>
                </motion.div>
                ))
            )}
            </div>
        </div>
      </div>
  );
};

export default ExamModelsImporter;

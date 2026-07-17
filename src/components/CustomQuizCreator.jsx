import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, Plus, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { getAvailableQuestions } from '@/utils/getAvailableQuestions';
import { saveCustomQuiz } from '@/utils/storageManager';
import { publishContentItem } from '@/services/contentRepository';

const CustomQuizCreator = ({ onCancel, onSave }) => {
    const [quizName, setQuizName] = useState('');
    const [availableQuestions, setAvailableQuestions] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        setAvailableQuestions(getAvailableQuestions());
    }, []);

    const handleAddQuestion = (question) => {
        if (!selectedQuestions.some(q => q.id === question.id)) {
            setSelectedQuestions([...selectedQuestions, question]);
        }
    };

    const handleRemoveQuestion = (id) => {
        setSelectedQuestions(selectedQuestions.filter(q => q.id !== id));
    };

    const handleSave = async () => {
        if (!quizName.trim()) {
            toast({ title: 'خطأ', description: 'الرجاء إدخال اسم المسابقة', variant: 'destructive' });
            return;
        }
        if (selectedQuestions.length < 1) {
            toast({ title: 'خطأ', description: 'يجب اختيار سؤال واحد على الأقل', variant: 'destructive' });
            return;
        }

        const newQuiz = {
            id: `custom_${Date.now()}`,
            title: quizName,
            icon: '🏆', // Default icon
            questions: selectedQuestions,
            createdAt: new Date().toISOString()
        };

        const publishResult = await publishContentItem('custom_quizzes', newQuiz);
        if (!publishResult.success) {
            toast({ title: 'فشل النشر', description: 'فشل الحفظ السحابي، لن يظهر المحتوى للزوار', variant: 'destructive' });
            return;
        }
        saveCustomQuiz(newQuiz);
        toast({ title: 'تم النشر للزوار', description: 'تم إنشاء المسابقة ونشرها بنجاح', className: "bg-green-50" });
        onSave();
    };

    const filteredQuestions = availableQuestions.filter(q =>
        (q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
         q.source.toLowerCase().includes(searchTerm.toLowerCase())) &&
        !selectedQuestions.some(selected => selected.id === q.id)
    );

    return (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-lg border-2 border-slate-100">
            <div className="flex justify-between items-center mb-6">
                <Button onClick={onCancel} variant="ghost"><ArrowLeft className="mr-2" /> إلغاء</Button>
                <h2 className="text-2xl font-black text-slate-800">إنشاء مسابقة جديدة</h2>
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">
                    <Save className="mr-2" size={18} /> حفظ
                </Button>
            </div>

            <div className="mb-8">
                <label className="block text-slate-700 font-bold mb-2">اسم المسابقة</label>
                <input
                    type="text"
                    value={quizName}
                    onChange={(e) => setQuizName(e.target.value)}
                    className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-red-500 outline-none text-xl"
                    placeholder="مثال: مسابقة الحيوانات الممتعة"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px]">
                {/* Available Questions */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col">
                    <h3 className="font-bold text-slate-700 mb-4 flex items-center justify-between">
                        <span>الأسئلة المتاحة</span>
                        <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded-full">{filteredQuestions.length}</span>
                    </h3>

                    <div className="relative mb-4">
                        <Search className="absolute right-3 top-3 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="بحث..."
                            className="w-full pl-4 pr-10 py-2 rounded-lg border border-slate-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {filteredQuestions.slice(0, 100).map(question => (
                            <div key={question.id} className="bg-white p-3 rounded-xl border border-slate-200 hover:border-red-400 cursor-pointer group flex justify-between items-center transition-all" onClick={() => handleAddQuestion(question)}>
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{question.icon}</span>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">{question.q}</p>
                                        <p className="text-xs text-slate-500">{question.source} • الجواب: {question.a}</p>
                                    </div>
                                </div>
                                <Plus className="text-red-500 opacity-0 group-hover:opacity-100" size={20} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Selected Questions */}
                <div className="bg-red-50 p-4 rounded-2xl border border-red-200 flex flex-col">
                    <h3 className="font-bold text-red-800 mb-4 flex items-center justify-between">
                        <span>الأسئلة المختارة</span>
                        <span className="text-sm bg-white text-red-700 px-2 py-1 rounded-full">{selectedQuestions.length}</span>
                    </h3>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                         {selectedQuestions.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <p>لم يتم اختيار أي أسئلة بعد</p>
                            </div>
                         ) : (
                            selectedQuestions.map((question, idx) => (
                                <motion.div layout key={question.id} className="bg-white p-3 rounded-xl border border-red-100 shadow-sm flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <span className="bg-red-100 text-red-700 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold">{idx + 1}</span>
                                        <span className="text-xl">{question.icon}</span>
                                        <p className="font-bold text-slate-800 text-sm">{question.q}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleRemoveQuestion(question.id)}>
                                        <Trash2 size={16} />
                                    </Button>
                                </motion.div>
                            ))
                         )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomQuizCreator;

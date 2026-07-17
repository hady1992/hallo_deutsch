import React, { useState, useEffect } from 'react';
import { Plus, Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import CustomQuizCreator from '@/components/CustomQuizCreator';
import CustomQuizRunner from '@/components/CustomQuizRunner';
import { getCustomQuizzes, deleteCustomQuiz } from '@/utils/storageManager';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const CustomQuizManager = () => {
    const [view, setView] = useState('list'); // list, create, run
    const [quizzes, setQuizzes] = useState([]);
    const [activeQuiz, setActiveQuiz] = useState(null);
    const { toast } = useToast();

    const loadQuizzes = () => {
        setQuizzes(getCustomQuizzes());
    };

    useEffect(() => {
        loadQuizzes();
        window.addEventListener('customQuizzesUpdated', loadQuizzes);
        return () => window.removeEventListener('customQuizzesUpdated', loadQuizzes);
    }, []);

    const handleDelete = (id) => {
        deleteCustomQuiz(id);
        toast({ title: "تم الحذف", description: "تم حذف المسابقة بنجاح" });
    };

    const handleRunQuiz = (quiz) => {
        setActiveQuiz(quiz);
        setView('run');
    };

    if (view === 'create') {
        return <CustomQuizCreator onCancel={() => setView('list')} onSave={() => setView('list')} />;
    }

    if (view === 'run' && activeQuiz) {
        return <CustomQuizRunner quiz={activeQuiz} onBack={() => setView('list')} />;
    }

    return (
        <div className="max-w-6xl mx-auto p-4">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-slate-800">المسابقات المخصصة</h2>
                <Button onClick={() => setView('create')} className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-lg shadow-amber-200">
                    <Plus className="mr-2" /> إنشاء مسابقة
                </Button>
            </div>

            {quizzes.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-slate-100 border-dashed">
                    <div className="text-6xl mb-4">🎨</div>
                    <h3 className="text-2xl font-bold text-slate-600 mb-2">لا توجد مسابقات مخصصة بعد</h3>
                    <p className="text-slate-400 mb-6">أنشئ مسابقتك الخاصة مع الأسئلة التي تختارها!</p>
                    <Button onClick={() => setView('create')} variant="outline">ابدأ الآن</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.map((quiz, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={quiz.id}
                            className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-lg hover:shadow-xl transition-all relative group"
                        >
                            <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full">
                                            <Trash2 size={16} />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                سيتم حذف مسابقة "{quiz.title}" نهائياً.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(quiz.id)} className="bg-red-600">حذف</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>

                            <div className="text-5xl mb-4">{quiz.icon}</div>
                            <h3 className="text-xl font-black text-slate-800 mb-1">{quiz.title}</h3>
                            <p className="text-slate-400 font-bold text-sm mb-6">{quiz.questions.length} أسئلة • {new Date(quiz.createdAt).toLocaleDateString('ar-EG')}</p>

                            <Button onClick={() => handleRunQuiz(quiz)} className="w-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-bold rounded-xl transition-all">
                                <Play className="mr-2" size={18} /> ابدأ اللعب
                            </Button>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomQuizManager;

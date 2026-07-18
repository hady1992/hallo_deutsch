import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dumbbell, ArrowRight, Layers, ListFilter, Hash, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getExercises } from '@/services/contentRepository';
import { getExerciseCategoryKey, getCategoryLabel, getExerciseAudioText } from '@/utils/exerciseAudio';
import AudioButton from '@/components/AudioButton';
import ExerciseResults from '@/components/ExerciseResults';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

const QUESTION_COUNT_OPTIONS = [5, 10, 15, 20, 'all'];

const Exercises = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedLevel = (searchParams.get('level') || '').toUpperCase();
  const requestedUnit = searchParams.get('unit') || '';
  const requestedLesson = searchParams.get('lesson') || searchParams.get('lessonId') || '';
  // selection: 'level' -> 'options' (category + count) -> running -> results
  const [selectionStep, setSelectionStep] = useState(requestedLevel ? 'options' : 'level');
  const [selectedLevel, setSelectedLevel] = useState(requestedLevel || null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCount, setSelectedCount] = useState('all');

  const [exerciseMode, setExerciseMode] = useState('selection'); // 'selection', 'running', 'results'
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [allExercises, setAllExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const loadImported = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const persistent = await getExercises();
        // توحيد شكل الإجابة الصحيحة للعرض فقط: بعض التمارين المستوردة قديمًا قد
        // تكون بصيغة نصية، بينما هذه الصفحة تقارن بموضع الخيار (index) — نحوّلها
        // هنا فقط لغرض العرض، دون تغيير البيانات المخزّنة أصلًا.
        const normalized = persistent
          .filter(ex => Array.isArray(ex.options) && ex.options.length > 0 && ex.question)
          .map(ex => {
            if (typeof ex.correctAnswer === 'number') return ex;
            const idx = ex.options.findIndex(o => o === ex.correctAnswer);
            return {
              ...ex,
              correctAnswer: idx >= 0 ? idx : ex.correctAnswer,
              explanation: ex.explanation || '',
            };
          });
        setAllExercises(normalized);
      } catch (e) {
        console.error('[Exercises] Failed to load published exercises:', e);
        setAllExercises([]);
        setLoadError('تعذر تحميل المحتوى حاليًا');
      } finally {
        setLoading(false);
      }
    };
    loadImported();
    window.addEventListener('exercisesUpdated', loadImported);
    return () => window.removeEventListener('exercisesUpdated', loadImported);
  }, []);

  // Group exercises by level for display stats
  const getLevelCount = (level) => allExercises.filter(ex => ex.level === level).length;

  // تمارين المستوى المختار فقط (تُستخدم لبناء قائمة الفئات المتاحة فعليًا)
  const levelExercises = useMemo(() => {
    if (!selectedLevel) return [];
    return allExercises.filter((exercise) => {
      if (exercise.level !== selectedLevel) return false;
      const exerciseUnit = String(exercise.unit || exercise.unitId || exercise.topic || '');
      const exerciseLesson = String(exercise.lessonId || exercise.lesson || exercise.lessonSlug || '');
      if (requestedUnit && exerciseUnit !== requestedUnit) return false;
      if (requestedLesson && exerciseLesson !== requestedLesson) return false;
      return true;
    });
  }, [allExercises, requestedLesson, requestedUnit, selectedLevel]);

  // بناء قائمة الفئات ديناميكيًا من البيانات الفعلية الموجودة بهذا المستوى فقط
  // (متوافق تمامًا مع أي تمرين قديم أو مستورد، بغض النظر عن اسم الحقل المستخدم).
  const availableCategories = useMemo(() => {
    const counts = {};
    levelExercises.forEach(ex => {
      const key = getExerciseCategoryKey(ex);
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([key, count]) => ({ key, label: getCategoryLabel(key), count }))
      .sort((a, b) => b.count - a.count);
  }, [levelExercises]);

  // تمارين بعد تطبيق فلتر الفئة (تُستخدم لعرض العدد المتاح لكل خيار عدد أسئلة)
  const categoryFilteredExercises = useMemo(() => {
    if (selectedCategory === 'all') return levelExercises;
    return levelExercises.filter(ex => getExerciseCategoryKey(ex) === selectedCategory);
  }, [levelExercises, selectedCategory]);

  const chooseLevel = (level) => {
    setSelectedLevel(level);
    setSelectedCategory('all');
    setSelectedCount('all');
    setSelectionStep('options');
  };

  const backToLevelSelection = () => {
    setSelectionStep('level');
    setSelectedLevel(null);
  };

  const startSession = () => {
    const shuffled = [...categoryFilteredExercises].sort(() => 0.5 - Math.random());
    const finalCount = selectedCount === 'all' ? shuffled.length : Math.min(Number(selectedCount), shuffled.length);
    const sessionQuestions = shuffled.slice(0, finalCount);

    setCurrentQuestions(sessionQuestions);
    setCurrentIndex(0);
    setAnswers({});
    setScore(0);
    setExerciseMode('running');
  };

  const handleAnswer = (optionIndex) => {
    const currentQ = currentQuestions[currentIndex];
    const isCorrect = optionIndex === currentQ.correctAnswer;

    setAnswers(prev => ({ ...prev, [currentIndex]: optionIndex }));
    if (isCorrect) setScore(prev => prev + 1);

    // Auto-advance after delay
    setTimeout(() => {
        if (currentIndex < currentQuestions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            handleFinish();
        }
    }, 400); // Fast transition
  };

  const handleFinish = () => {
    setExerciseMode('results');
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleRetake = () => {
      startSession();
  };

  const handleBackToSelection = () => {
      setExerciseMode('selection');
      setSelectionStep('level');
      setSelectedLevel(null);
      setSelectedCategory('all');
      setSelectedCount('all');
  };

  const handleChangeLevelOrCategory = () => {
      setExerciseMode('selection');
      setSelectionStep(selectedLevel ? 'options' : 'level');
  };

  const currentQuestion = currentQuestions[currentIndex];
  // نص الترجمة العربية للسؤال، بالأولوية المطلوبة بالضبط
  const questionArabic = currentQuestion
    ? (currentQuestion.questionArabic || currentQuestion.translation || currentQuestion.arabic || '')
    : '';

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 bg-slate-50 px-4 pb-12 pt-24" dir="rtl">
        <Loader2 className="animate-spin text-red-600" />
        <span className="font-bold text-slate-600">جاري تحميل التمارين...</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 pb-12 pt-24" dir="rtl">
        <p className="font-bold text-red-700">{loadError}</p>
      </div>
    );
  }

  // Render Logic
  return (
    <div className="min-h-screen pt-24 pb-12 bg-slate-50 px-4" dir="rtl">
      <Helmet>
        <title>{'التمارين والتدريبات - Hallo Deutsch'}</title>
        <meta name="description" content="تمارين وتدريبات تفاعلية في القواعد والمفردات الألمانية لجميع المستويات." />
      </Helmet>

      {/* Step 1: Level Selection */}
      {exerciseMode === 'selection' && selectionStep === 'level' && (
        <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
           <div className="text-center mb-12">
               <h1 className="text-4xl font-black text-slate-800 mb-4 flex items-center justify-center gap-3">
                   <Dumbbell className="text-amber-600 w-10 h-10" />
                   تمارين القواعد والمفردات
               </h1>
               <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                   اختر مستواك الدراسي للبدء في حل التمارين التفاعلية وتحسين مهاراتك.
               </p>
           </div>

           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
               {['A1', 'A2', 'B1', 'B2'].map((level) => (
                   <motion.div
                        key={level}
                        whileHover={{ y: -5 }}
                        className="h-full"
                   >
                       <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden cursor-pointer group" onClick={() => chooseLevel(level)}>
                           <div className={`h-2 w-full ${
                               level === 'A1' ? 'bg-green-500' :
                               level === 'A2' ? 'bg-red-500' :
                               level === 'B1' ? 'bg-yellow-500' : 'bg-red-500'
                           }`} />
                           <CardContent className="p-6 flex flex-col items-center text-center h-full">
                               <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black mb-4 shadow-sm group-hover:scale-110 transition-transform ${
                                   level === 'A1' ? 'bg-green-50 text-green-600' :
                                   level === 'A2' ? 'bg-red-50 text-red-600' :
                                   level === 'B1' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
                               }`}>
                                   {level}
                               </div>
                               <h3 className="text-xl font-bold text-slate-800 mb-2">المستوى {level}</h3>
                               <p className="text-slate-400 text-sm mb-6 flex-grow">
                                   قواعد أساسية، مفردات شائعة، وتراكيب جمل للمستوى {level}.
                               </p>
                               <div className="w-full pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-medium text-slate-500">
                                   <span className="flex items-center gap-1"><Layers className="w-4 h-4" /> {getLevelCount(level)} تمرين</span>
                                   <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-amber-500 rotate-180" />
                               </div>
                           </CardContent>
                       </Card>
                   </motion.div>
               ))}
           </div>
        </div>
      )}

      {/* Step 2: Category + Question Count Selection */}
      {exerciseMode === 'selection' && selectionStep === 'options' && selectedLevel && (
        <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
            <Button variant="ghost" onClick={backToLevelSelection} className="mb-6 text-slate-400 hover:text-slate-600">
                <ArrowRight className="w-4 h-4 ml-2" /> تغيير المستوى
            </Button>

            <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-1.5 rounded-full text-sm font-bold mb-4">
                    المستوى {selectedLevel}
                </div>
                <h1 className="text-3xl font-black text-slate-800 mb-2">اختر فئة التمارين وعددها</h1>
                <p className="text-slate-500">حدّد الموضوع الذي تريد التركيز عليه، وعدد الأسئلة المناسب لوقتك.</p>
            </div>

            {/* Category Selector */}
            <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-500 mb-3 flex items-center gap-2">
                    <ListFilter className="w-4 h-4" /> الفئة
                </h3>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={cn(
                            "px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all",
                            selectedCategory === 'all'
                                ? "bg-amber-600 border-amber-600 text-white shadow-md"
                                : "bg-white border-slate-200 text-slate-600 hover:border-amber-300"
                        )}
                    >
                        كل التمارين ({levelExercises.length})
                    </button>
                    {availableCategories.map(cat => (
                        <button
                            key={cat.key}
                            onClick={() => setSelectedCategory(cat.key)}
                            className={cn(
                                "german-text px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all",
                                selectedCategory === cat.key
                                    ? "bg-amber-600 border-amber-600 text-white shadow-md"
                                    : "bg-white border-slate-200 text-slate-600 hover:border-amber-300"
                            )}
                        >
                            {cat.label} ({cat.count})
                        </button>
                    ))}
                </div>
            </div>

            {/* Question Count Selector */}
            <div className="mb-10">
                <h3 className="text-sm font-bold text-slate-500 mb-3 flex items-center gap-2">
                    <Hash className="w-4 h-4" /> عدد الأسئلة
                </h3>
                <div className="flex flex-wrap gap-2">
                    {QUESTION_COUNT_OPTIONS.map(opt => (
                        <button
                            key={opt}
                            onClick={() => setSelectedCount(opt)}
                            className={cn(
                                "px-5 py-2 rounded-xl text-sm font-bold border-2 transition-all min-w-[90px]",
                                selectedCount === opt
                                    ? "bg-slate-800 border-slate-800 text-white shadow-md"
                                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-400"
                            )}
                        >
                            {opt === 'all' ? `كل الأسئلة (${categoryFilteredExercises.length})` : `${opt} أسئلة`}
                        </button>
                    ))}
                </div>
            </div>

            <Button
                onClick={startSession}
                disabled={categoryFilteredExercises.length === 0}
                className="w-full h-14 text-lg font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-lg"
            >
                ابدأ التمرين
            </Button>
            {categoryFilteredExercises.length === 0 && (
                <div className="mt-3 text-center">
                  <p className="text-sm font-bold text-red-600">لا توجد تمارين مرتبطة بهذا الدرس أو الوحدة حاليًا.</p>
                  {(requestedLesson || requestedUnit) && (
                    <Button type="button" variant="link" onClick={() => navigate(-1)} className="mt-1 text-red-700">
                      العودة إلى الدرس
                    </Button>
                  )}
                </div>
            )}
        </div>
      )}

      {/* Mode: Running */}
      {exerciseMode === 'running' && currentQuestion && (
        <div className="max-w-3xl mx-auto animate-in slide-in-from-left duration-500">
            <div className="flex justify-between items-center mb-6">
                <Button variant="ghost" onClick={handleChangeLevelOrCategory} className="text-slate-400 hover:text-slate-600">
                    إنهاء التمرين
                </Button>
                <div className="text-sm font-bold text-slate-400">
                    السؤال {currentIndex + 1} / {currentQuestions.length}
                </div>
            </div>

            <div className="h-2 bg-slate-200 rounded-full mb-8 overflow-hidden">
                <motion.div
                    className="h-full bg-amber-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentIndex + 1) / currentQuestions.length) * 100}%` }}
                />
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="shadow-xl border-slate-100 overflow-hidden">
                        <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                            <span className="german-text text-xs font-bold uppercase tracking-wider text-slate-400 bg-white px-2 py-1 rounded border border-slate-200">
                                {getCategoryLabel(getExerciseCategoryKey(currentQuestion))}
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">
                                {selectedLevel}
                            </span>
                        </div>
                        <CardContent className="p-8">
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <h2 className="german-text text-2xl font-bold text-slate-800 leading-relaxed flex-1">
                                    {currentQuestion.question}
                                </h2>
                                <AudioButton
                                    text={getExerciseAudioText(currentQuestion)}
                                    lang="de-DE"
                                    className="mt-1 flex-shrink-0"
                                />
                            </div>
                            {questionArabic && (
                                <p className="text-slate-400 text-base mb-6">{questionArabic}</p>
                            )}
                            {!questionArabic && <div className="mb-6" />}

                            <div className="space-y-3">
                                {currentQuestion.options.map((opt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(idx)}
                                        className={cn(
                                            "w-full p-4 rounded-xl border-2 transition-all hover:bg-slate-50 relative flex items-center justify-between group",
                                            answers[currentIndex] === idx ? "border-amber-500 bg-amber-50" : "border-slate-100 hover:border-amber-200"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-5 h-5 rounded-full border-2 flex items-center justify-center ml-4 flex-shrink-0",
                                            answers[currentIndex] === idx ? "border-amber-600" : "border-slate-300 group-hover:border-amber-400"
                                        )}>
                                            {answers[currentIndex] === idx && <div className="w-2.5 h-2.5 bg-amber-600 rounded-full" />}
                                        </div>
                                        <span className={cn("german-text font-medium text-lg flex-grow", answers[currentIndex] === idx ? "text-amber-900" : "text-slate-600")}>
                                            {opt}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </AnimatePresence>
        </div>
      )}

      {/* Mode: Results */}
      {exerciseMode === 'results' && (
          <ExerciseResults
              results={{
                  score,
                  total: currentQuestions.length,
                  answers,
                  questions: currentQuestions
              }}
              onRetake={handleRetake}
              onBack={handleBackToSelection}
          />
      )}
    </div>
  );
};

export default Exercises;

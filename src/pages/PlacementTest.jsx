import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlayCircle, GraduationCap, CheckCircle, ArrowRight, ArrowLeft, RefreshCw, BarChart, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPlacementTests } from '@/services/contentRepository';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

const PlacementTest = () => {
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const loadImported = async () => {
      setLoading(true);
      setLoadError('');
      try {
        setQuestions(await getPlacementTests());
      } catch (e) {
        console.error('[PlacementTest] Failed to load published questions:', e);
        setQuestions([]);
        setLoadError('تعذر تحميل المحتوى حاليًا');
      } finally {
        setLoading(false);
      }
    };
    loadImported();
    window.addEventListener('placementTestsUpdated', loadImported);
    return () => window.removeEventListener('placementTestsUpdated', loadImported);
  }, []);

  // Calculate results
  const calculateResult = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) score++;
    });

    const percentage = Math.round((score / questions.length) * 100);

    // Logic for recommended level
    let recommendedLevel = 'A1';
    if (percentage >= 85) recommendedLevel = 'B2';
    else if (percentage >= 65) recommendedLevel = 'B1';
    else if (percentage >= 40) recommendedLevel = 'A2';

    return { score, percentage, recommendedLevel, total: questions.length };
  };

  const handleFinish = () => {
    const res = calculateResult();
    setResult(res);
    setCompleted(true);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#d71920', '#e8b21e', '#111111']
    });
    // Save locally
    localStorage.setItem('placement_test_result', JSON.stringify({ ...res, date: new Date().toISOString() }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleAnswer = (optionIdx) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionIdx
    }));
  };

  const resetTest = () => {
    setStarted(false);
    setCompleted(false);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setResult(null);
  };

  if (loading) {
      return (
        <div className="min-h-screen pt-24 pb-12 bg-slate-50 px-4 flex items-center justify-center">
            <div className="text-center text-slate-500">
                <Loader2 className="animate-spin w-10 h-10 mx-auto mb-4 text-red-500" />
                <p>جاري تحميل الاختبار...</p>
            </div>
        </div>
      );
  }

  if (loadError || !questions || questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 pb-12 pt-24" dir="rtl">
        <p className="font-bold text-red-700">{loadError || 'لا يوجد اختبار منشور حاليًا'}</p>
      </div>
    );
  }

  if (completed && result) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-slate-50 px-4" dir="rtl">
        <Helmet>
          <title>{'نتائج الاختبار | Hallo Deutsch'}</title>
        </Helmet>
        <div className="max-w-3xl mx-auto text-center space-y-8 animate-in zoom-in-95 duration-500">
           <Card className="border-t-4 border-t-red-600 shadow-xl overflow-hidden">
             <div className="bg-red-50/50 p-8 pb-0">
               <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <GraduationCap className="w-12 h-12 text-red-600" />
               </div>
               <h1 className="text-3xl font-black text-slate-800">نتيجة الاختبار</h1>
               <p className="text-slate-500 mt-2">بناءً على أدائك في الأسئلة</p>
             </div>

             <CardContent className="p-8 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="text-sm text-slate-500 uppercase font-bold tracking-wider mb-1">الدرجة</div>
                    <div className="text-3xl font-bold text-slate-800">{result.score} <span className="text-sm text-slate-400 font-normal">/ {result.total}</span></div>
                  </div>
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-100 ring-2 ring-red-100">
                     <div className="text-sm text-red-600 uppercase font-bold tracking-wider mb-1">المستوى المناسب</div>
                     <div className="text-4xl font-black text-red-700">{result.recommendedLevel}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="text-sm text-slate-500 uppercase font-bold tracking-wider mb-1">الدقة</div>
                    <div className="text-3xl font-bold text-slate-800">{result.percentage}%</div>
                  </div>
               </div>

               <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-right">
                  <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" /> التوصية
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    بناءً على نتيجتك، نوصي بالبدء في دراسة <span className="font-bold text-red-600">المستوى {result.recommendedLevel}</span>.
                    هذا المستوى يتناسب بشكل أفضل مع معرفتك الحالية بالقواعد والمفردات.
                  </p>
               </div>

               <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button onClick={() => window.location.href = `/level/${result.recommendedLevel.toLowerCase()}`} className="h-12 px-8 text-lg bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-200 transition-all rounded-xl gap-2">
                     الذهاب للمستوى {result.recommendedLevel} <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <Button onClick={resetTest} variant="outline" className="h-12 px-8 text-lg rounded-xl gap-2">
                     <RefreshCw className="w-4 h-4" /> إعادة الاختبار
                  </Button>
               </div>
             </CardContent>
           </Card>
        </div>
      </div>
    );
  }

  if (started) {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen pt-24 pb-12 bg-slate-50 px-4" dir="rtl">
         <Helmet>
           <title>{`السؤال ${currentQuestionIndex + 1} | اختبار تحديد المستوى`}</title>
         </Helmet>
         <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 text-sm font-medium text-slate-500">
              <span>السؤال {currentQuestionIndex + 1} من {questions.length}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold bg-white border ${
                  currentQuestion.level === 'A1' ? 'text-green-600 border-green-200' :
                  currentQuestion.level === 'A2' ? 'text-red-600 border-red-200' :
                  'text-amber-600 border-amber-200'
              }`}>{currentQuestion.level}</span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full bg-slate-200 rounded-full mb-8 overflow-hidden" dir="ltr">
                <motion.div
                   className="h-full bg-red-600"
                   initial={{ width: 0 }}
                   animate={{ width: `${progress}%` }}
                   transition={{ duration: 0.5 }}
                />
            </div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-0 shadow-lg overflow-hidden">
                   <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white min-h-[160px] flex items-center justify-center text-center">
                      <h2 className="text-2xl md:text-3xl font-bold leading-relaxed" dir="auto">{currentQuestion.question}</h2>
                   </div>
                   <CardContent className="p-6 md:p-8 space-y-4">
                      {currentQuestion.options.map((opt, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleAnswer(idx)}
                            className={cn(
                                "p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between group hover:shadow-md",
                                answers[currentQuestionIndex] === idx
                                    ? "border-red-500 bg-red-50"
                                    : "border-slate-100 hover:border-red-200 hover:bg-slate-50"
                            )}
                          >
                             <div className={cn(
                                 "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ml-4",
                                 answers[currentQuestionIndex] === idx
                                     ? "border-red-600"
                                     : "border-slate-300 group-hover:border-red-400"
                             )}>
                                {answers[currentQuestionIndex] === idx && <div className="w-3 h-3 bg-red-600 rounded-full" />}
                             </div>
                             <span className={cn(
                                 "text-lg font-medium transition-colors flex-grow text-right",
                                 answers[currentQuestionIndex] === idx ? "text-red-900" : "text-slate-700"
                             )} dir="auto">{opt}</span>
                          </div>
                      ))}
                   </CardContent>
                   <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between">
                      <Button
                         variant="ghost"
                         onClick={handlePrev}
                         disabled={currentQuestionIndex === 0}
                         className="text-slate-400 hover:text-slate-600 gap-2"
                      >
                         <ArrowRight className="w-4 h-4" /> السابق
                      </Button>
                      <Button
                         onClick={handleNext}
                         disabled={answers[currentQuestionIndex] === undefined}
                         className={cn(
                             "px-8 rounded-xl transition-all gap-2",
                             currentQuestionIndex === questions.length - 1
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "bg-red-600 hover:bg-red-700 text-white"
                         )}
                      >
                         {currentQuestionIndex === questions.length - 1 ? 'إنهاء الاختبار' : 'التالي'}
                         {currentQuestionIndex !== questions.length - 1 && <ArrowLeft className="w-4 h-4" />}
                      </Button>
                   </div>
                </Card>
              </motion.div>
            </AnimatePresence>
         </div>
      </div>
    );
  }

  // Intro Screen
  return (
    <div className="min-h-screen pt-24 pb-12 bg-slate-50 px-4" dir="rtl">
      <Helmet>
        <title>{'اختبار تحديد المستوى | Hallo Deutsch'}</title>
        <meta name="description" content="اختبر مستواك في اللغة الألمانية مجاناً واحصل على تقييم فوري لمستواك من A1 إلى B2." />
      </Helmet>

      <div className="max-w-4xl mx-auto text-center pt-8">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100"
        >
            <div className="bg-gradient-to-r from-red-600 to-amber-600 p-12 text-white">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
                    <BarChart className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl font-black mb-4">اختبار تحديد المستوى</h1>
                <p className="text-red-100 text-lg max-w-2xl mx-auto">
                    40 سؤالًا تغطي القواعد والمفردات والفهم القرائي
                </p>
            </div>

            <div className="p-8 md:p-12">
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    <div className="text-center p-4">
                        <div className="bg-red-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-red-600 font-bold">40</div>
                        <h3 className="font-bold text-slate-800">سؤال</h3>
                        <p className="text-sm text-slate-500">تغطية شاملة</p>
                    </div>
                    <div className="text-center p-4">
                        <div className="bg-amber-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-amber-600 font-bold">20د</div>
                        <h3 className="font-bold text-slate-800">المدة</h3>
                        <p className="text-sm text-slate-500">وقت تقريبي</p>
                    </div>
                    <div className="text-center p-4">
                        <div className="bg-green-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-green-600 font-bold">AI</div>
                        <h3 className="font-bold text-slate-800">نتائج فورية</h3>
                        <p className="text-sm text-slate-500">احصل على مستواك فوراً</p>
                    </div>
                </div>

                <Button
                    size="lg"
                    onClick={() => setStarted(true)}
                    className="h-14 px-10 text-lg bg-slate-900 hover:bg-black text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all rounded-xl gap-2"
                >
                    <PlayCircle className="w-6 h-6" /> ابدأ الاختبار الآن
                </Button>
                <p className="mt-4 text-xs text-slate-400">لا يلزم التسجيل لأداء الاختبار</p>
            </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PlacementTest;

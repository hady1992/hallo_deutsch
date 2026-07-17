import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AudioButton from '@/components/AudioButton';
import { useToast } from '@/components/ui/use-toast';
import { shuffleAnswers } from '@/utils/answerShuffler';

const ExamComponent = ({ exam, onComplete }) => {
  const durationMinutes = Number.isFinite(Number(exam?.duration)) ? Number(exam.duration) : 30;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    if (exam && Array.isArray(exam.questions)) {
      const processedQuestions = exam.questions
        .filter((question) => question && typeof question === 'object' && Array.isArray(question.options) && question.options.length > 0)
        .map(q => {
        // Use the utility to shuffle options and get the new correct index
        const { shuffledOptions, newCorrectAnswer } = shuffleAnswers(q.options, q.correctAnswer);

        return {
          ...q,
          options: shuffledOptions,
          correctAnswer: newCorrectAnswer,
        };
        });
      setShuffledQuestions(processedQuestions);
      setAnswers({});
      setCurrentQuestionIndex(0);
      setTimeLeft(durationMinutes * 60);
    }
  }, [durationMinutes, exam]);

  useEffect(() => {
    if (timeLeft > 0 && shuffledQuestions.length > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && shuffledQuestions.length > 0) {
      handleFinishExam();
    }
  }, [timeLeft, shuffledQuestions]);

  const handleOptionSelect = (index) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: index
    }));
  };

  const handleNext = () => {
    if (answers[currentQuestionIndex] === undefined) {
      toast({
        title: "تنبيه",
        description: "يجب اختيار إجابة قبل المتابعة",
        variant: "destructive",
      });
      return;
    }

    if (currentQuestionIndex === shuffledQuestions.length - 1) {
      handleFinishExam();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      // Ensure audio stops when moving to next question
      window.speechSynthesis?.cancel();
    }
  };

  const handleFinishExam = () => {
    window.speechSynthesis?.cancel();
    let correctCount = 0;
    
    shuffledQuestions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / shuffledQuestions.length) * 100);
    
    const resultData = {
      examId: exam.id,
      score,
      totalQuestions: shuffledQuestions.length,
      correctAnswers: correctCount,
      incorrectAnswers: shuffledQuestions.length - correctCount,
      date: new Date().toISOString(),
      answers, 
      questionsState: shuffledQuestions,
      timeSpent: (durationMinutes * 60) - timeLeft
    };

    let savedResults = [];
    try {
      const parsedResults = JSON.parse(localStorage.getItem('exam_results') || '[]');
      savedResults = Array.isArray(parsedResults) ? parsedResults : [];
    } catch (error) {
      console.warn('[ExamComponent] Ignoring invalid local exam history:', error);
    }
    const historyEntry = {
      ...resultData,
      questionsState: null 
    };
    
    localStorage.setItem('exam_results', JSON.stringify([...savedResults, historyEntry]));
    if (typeof onComplete === 'function') onComplete(resultData);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (shuffledQuestions.length === 0) return <div className="p-8 text-center">جاري تحميل الامتحان...</div>;

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === shuffledQuestions.length - 1;
  const progress = ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header Info */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 sticky top-20 z-10 border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{exam.title}</h2>
            <p className="text-slate-500 text-sm">سؤال {currentQuestionIndex + 1} من {shuffledQuestions.length}</p>
          </div>
          <div className={`flex items-center gap-2 font-bold text-lg ${timeLeft < 300 ? 'text-red-500' : 'text-blue-600'}`}>
            <Clock size={20} />
            {formatTime(timeLeft)}
          </div>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <motion.div
        key={currentQuestionIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-3xl shadow-lg p-6 md:p-10 border border-slate-100 min-h-[400px] flex flex-col"
      >
        <div className="flex justify-between items-start mb-6">
          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            {currentQuestion.category}
          </span>
          {/* AudioButton receives ONLY the question text. The component handles stripping emojis internally. */}
          <AudioButton text={currentQuestion.question} />
        </div>

        <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8 leading-relaxed" dir="auto">
          {currentQuestion.question}
        </h3>

        <div className="grid grid-cols-1 gap-4 mb-8">
          {(Array.isArray(currentQuestion.options) ? currentQuestion.options : []).map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleOptionSelect(idx)}
              className={`p-5 rounded-xl border-2 text-right transition-all text-lg font-medium flex items-center justify-between group relative overflow-hidden
                ${answers[currentQuestionIndex] === idx 
                  ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-md' 
                  : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50 text-slate-600'
                }
              `}
            >
              <span className="relative z-10">{option}</span>
              {answers[currentQuestionIndex] === idx && (
                <motion.div 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }}
                  className="bg-blue-500 text-white rounded-full p-1"
                >
                  <CheckCircle size={20} />
                </motion.div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-auto pt-6 flex justify-end">
          <Button 
            onClick={handleNext}
            size="lg"
            className={`min-w-[160px] text-lg h-14 transition-all duration-300 ${
              answers[currentQuestionIndex] === undefined
                ? 'bg-slate-200 text-slate-400 hover:bg-slate-200 cursor-not-allowed' 
                : isLastQuestion
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-green-200'
                  : 'bg-slate-900 hover:bg-black text-white shadow-lg hover:shadow-slate-200'
            }`}
          >
            {isLastQuestion ? 'إنهاء الامتحان' : 'التالي'} 
            {!isLastQuestion && <ArrowLeft className="mr-2 h-5 w-5" />}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default ExamComponent;

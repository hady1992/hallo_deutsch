import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Lightbulb, ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import AudioButton from '@/components/AudioButton';
import { shuffleAnswers } from '@/utils/answerShuffler';

function GrammarExerciseComponent({ topic, onClose }) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [currentOptions, setCurrentOptions] = useState([]);
  const { toast } = useToast();

  const currentExercise = topic.exercises[currentExerciseIndex];
  const progress = ((currentExerciseIndex + 1) / topic.exercises.length) * 100;

  useEffect(() => {
    if (currentExercise && currentExercise.type === 'multipleChoice') {
      // Shuffle options when exercise changes.
      // Note: GrammarExerciseComponent usually stores correct answer as a string value
      const { shuffledOptions } = shuffleAnswers(currentExercise.options, currentExercise.correctAnswer);
      setCurrentOptions(shuffledOptions);
    } else {
      setCurrentOptions([]);
    }
  }, [currentExerciseIndex, topic]);

  const checkAnswer = () => {
    const correct = userAnswer.trim().toLowerCase() === currentExercise.correctAnswer.toLowerCase();
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setCompletedExercises([...completedExercises, currentExerciseIndex]);
      toast({
        title: "إجابة صحيحة! 🎉",
        description: currentExercise.explanation,
        className: "bg-green-50 border-green-200",
      });
    } else {
      toast({
        title: "إجابة خاطئة",
        description: "حاول مرة أخرى أو اطلع على التفسير",
        variant: "destructive",
      });
    }
  };

  const nextExercise = () => {
    if (currentExerciseIndex < topic.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      resetExercise();
    } else {
      const score = completedExercises.length;
      const total = topic.exercises.length;
      toast({
        title: "أحسنت! انتهيت من جميع التمارين 🎊",
        description: `النتيجة: ${score}/${total}`,
        className: "bg-red-50 border-red-200",
      });
    }
  };

  const previousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
      resetExercise();
    }
  };

  const resetExercise = () => {
    setUserAnswer('');
    setShowFeedback(false);
    setIsCorrect(false);
    setShowHint(false);
  };

  const restartExercises = () => {
    setCurrentExerciseIndex(0);
    setCompletedExercises([]);
    resetExercise();
  };

  const renderExercise = () => {
    if (currentExercise.type === 'multipleChoice') {
      return (
        <div className="space-y-4">
          <p className="text-xl font-semibold text-gray-800 mb-6">{currentExercise.question}</p>
          <div className="grid gap-3">
            {currentOptions.map((option, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setUserAnswer(option);
                  if (!showFeedback) {
                    setTimeout(() => {
                      const correct = option === currentExercise.correctAnswer;
                      setIsCorrect(correct);
                      setShowFeedback(true);
                      if (correct) {
                        setCompletedExercises([...completedExercises, currentExerciseIndex]);
                        toast({
                          title: "إجابة صحيحة! 🎉",
                          description: currentExercise.explanation,
                          className: "bg-green-50 border-green-200",
                        });
                      } else {
                        toast({
                          title: "إجابة خاطئة",
                          description: "حاول مرة أخرى",
                          variant: "destructive",
                        });
                      }
                    }, 100);
                  }
                }}
                disabled={showFeedback}
                className={`p-4 rounded-xl border-2 transition-all text-right text-lg font-medium ${
                  showFeedback
                    ? option === currentExercise.correctAnswer
                      ? 'bg-green-100 border-green-500 text-green-800'
                      : option === userAnswer
                      ? 'bg-red-100 border-red-500 text-red-800'
                      : 'bg-gray-50 border-gray-200 text-gray-500'
                    : userAnswer === option
                    ? 'bg-red-100 border-red-500 text-red-800'
                    : 'bg-white border-gray-300 text-gray-800 hover:border-red-400 hover:bg-red-50'
                }`}
                dir="ltr"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      );
    } else if (currentExercise.type === 'fillInBlank') {
      const parts = currentExercise.sentence.split('{blank}');
      return (
        <div className="space-y-4">
          <p className="text-lg text-gray-700 mb-4">أكمل الجملة بالكلمة الصحيحة:</p>
          <div className="bg-gray-50 p-6 rounded-xl text-xl font-semibold" dir="ltr">
            <span className="text-gray-800">{parts[0]}</span>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !showFeedback && checkAnswer()}
              disabled={showFeedback}
              className={`mx-2 px-4 py-2 border-2 rounded-lg min-w-[150px] text-center ${
                showFeedback
                  ? isCorrect
                    ? 'border-green-500 bg-green-50 text-green-800'
                    : 'border-red-500 bg-red-50 text-red-800'
                  : 'border-red-400 bg-white text-gray-800'
              }`}
              placeholder="..."
            />
            <span className="text-gray-800">{parts[1]}</span>
          </div>
          {!showFeedback && (
            <Button
              onClick={checkAnswer}
              disabled={!userAnswer.trim()}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl"
            >
              تحقق من الإجابة
            </Button>
          )}
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{topic.title}</h2>
              <p className="text-amber-100">
                التمرين {currentExerciseIndex + 1} من {topic.exercises.length}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Progress Bar */}
          <div className="bg-white/20 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="bg-white h-full rounded-full"
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Exercise Content */}
        <div className="p-8">
          {renderExercise()}

          {/* Hint Button */}
          {currentExercise.hint && !showFeedback && (
            <div className="mt-6">
              <Button
                onClick={() => setShowHint(!showHint)}
                variant="outline"
                className="border-amber-400 text-amber-700 hover:bg-amber-50"
              >
                <Lightbulb className="ml-2" size={18} />
                {showHint ? 'إخفاء التلميح' : 'إظهار تلميح'}
              </Button>
              <AnimatePresence>
                {showHint && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 p-4 bg-amber-50 border-r-4 border-amber-400 rounded-lg"
                  >
                    <p className="text-amber-900">💡 {currentExercise.hint}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Feedback */}
          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`mt-6 p-6 rounded-xl border-2 ${
                  isCorrect
                    ? 'bg-green-50 border-green-500'
                    : 'bg-red-50 border-red-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={24} />
                  ) : (
                    <XCircle className="text-red-600 flex-shrink-0 mt-1" size={24} />
                  )}
                  <div className="flex-1">
                    <h4 className={`font-bold mb-2 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                      {isCorrect ? 'ممتاز! إجابة صحيحة 🎉' : 'إجابة خاطئة'}
                    </h4>
                    <p className="text-gray-700 mb-2">{currentExercise.explanation}</p>
                    {!isCorrect && (
                      <p className="font-semibold text-gray-800">
                        الإجابة الصحيحة: <span className="text-green-700" dir="ltr">{currentExercise.correctAnswer}</span>
                        <AudioButton text={currentExercise.correctAnswer} size={16} className="mr-2" />
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="p-6 bg-gray-50 rounded-b-2xl flex justify-between items-center gap-4">
          <Button
            onClick={previousExercise}
            disabled={currentExerciseIndex === 0}
            variant="outline"
            className="flex-1"
          >
            <ArrowRight className="ml-2" size={18} />
            السابق
          </Button>

          {currentExerciseIndex === topic.exercises.length - 1 ? (
            <Button
              onClick={restartExercises}
              className="flex-1 bg-gradient-to-r from-red-500 to-amber-600 hover:from-red-600 hover:to-amber-700 text-white"
            >
              <RotateCcw className="ml-2" size={18} />
              ابدأ من جديد
            </Button>
          ) : (
            <Button
              onClick={nextExercise}
              disabled={!showFeedback}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              التالي
              <ArrowLeft className="mr-2" size={18} />
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default GrammarExerciseComponent;
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, HelpCircle, RefreshCw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { shuffleAnswers } from '@/utils/answerShuffler';
import BidiText from '@/components/common/BidiText';

const GrammarExercisePanel = ({ exercises, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [currentOptions, setCurrentOptions] = useState([]);
  const { toast } = useToast();

  const currentExercise = exercises[currentIndex];

  useEffect(() => {
    if (currentExercise && currentExercise.type === 'multipleChoice') {
       // Using utility to shuffle options, preserving correct answer value
       const { shuffledOptions } = shuffleAnswers(currentExercise.options, currentExercise.correctAnswer);
       setCurrentOptions(shuffledOptions);
    } else {
       setCurrentOptions([]);
    }
  }, [currentIndex, exercises]);

  const handleCheckAnswer = () => {
    if (isAnswered) return;

    let correct = false;
    if (currentExercise.type === 'multipleChoice') {
      correct = selectedOption === currentExercise.correctAnswer;
    } else {
      correct = textAnswer.trim().toLowerCase() === currentExercise.correctAnswer.toLowerCase();
    }

    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      setScore(score + 1);
      toast({
        title: "إجابة صحيحة! 🎉",
        className: "bg-green-50 border-green-200",
      });
    } else {
      toast({
        title: "إجابة خاطئة",
        description: "حاول التركيز في السؤال القادم",
        variant: "destructive",
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setTextAnswer('');
      setIsAnswered(false);
      setIsCorrect(false);
    } else {
      setShowResults(true);
    }
  };

  const resetExercises = () => {
    setCurrentIndex(0);
    setScore(0);
    setShowResults(false);
    setSelectedOption(null);
    setTextAnswer('');
    setIsAnswered(false);
    setIsCorrect(false);
  };

  if (showResults) {
    const percentage = Math.round((score / exercises.length) * 100);
    return (
      <div className="bg-gradient-to-br from-amber-50 to-amber-50 p-8 rounded-xl text-center border border-amber-100">
        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-white rounded-full shadow-lg">
            <Trophy className={cn("w-16 h-16", percentage >= 70 ? "text-yellow-500" : "text-gray-400")} />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">اكتملت التمارين!</h3>
        <p className="text-gray-600 mb-6">لقد أجبت بشكل صحيح على {score} من {exercises.length}</p>

        <div className="w-full bg-gray-200 rounded-full h-4 mb-6 overflow-hidden">
          <div
            className={cn("h-full transition-all duration-1000", percentage >= 70 ? "bg-green-500" : "bg-red-500")}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <Button onClick={resetExercises} className="bg-amber-600 hover:bg-amber-700 text-white">
          <RefreshCw className="mr-2 h-4 w-4" />
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8">
      <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-bold text-gray-700 flex items-center">
          <HelpCircle className="w-5 h-5 mr-2 text-amber-500" />
          تمارين: {title}
        </h3>
        <span className="text-sm font-medium bg-white px-3 py-1 rounded-full text-gray-500 border border-gray-200">
          {currentIndex + 1} / {exercises.length}
        </span>
      </div>

      <div className="p-6">
        <BidiText as="h4" text={currentExercise.question} className="text-lg font-medium text-gray-800 mb-6" />

        {currentExercise.type === 'multipleChoice' ? (
          <div className="space-y-3">
            {currentOptions.map((option, idx) => (
              <button
                key={idx}
                onClick={() => !isAnswered && setSelectedOption(option)}
                className={cn(
                  "w-full p-4 rounded-lg border-2 text-right transition-all flex justify-between items-center",
                  selectedOption === option ? "border-amber-500 bg-amber-50" : "border-gray-200 hover:border-amber-200",
                  isAnswered && option === currentExercise.correctAnswer ? "border-green-500 bg-green-50" : "",
                  isAnswered && selectedOption === option && !isCorrect ? "border-red-500 bg-red-50" : ""
                )}
                disabled={isAnswered}
              >
                <BidiText as="span" text={option} className="flex-1" />
                {isAnswered && option === currentExercise.correctAnswer && <Check className="text-green-600 w-5 h-5" />}
                {isAnswered && selectedOption === option && !isCorrect && <X className="text-red-600 w-5 h-5" />}
              </button>
            ))}
          </div>
        ) : (
          <div className="mb-6">
            <input
              type="text"
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              placeholder="اكتب إجابتك هنا..."
              className={cn(
                "w-full p-4 rounded-lg border-2 outline-none text-lg transition-all",
                isAnswered
                  ? isCorrect
                    ? "border-green-500 bg-green-50"
                    : "border-red-500 bg-red-50"
                  : "border-gray-200 focus:border-amber-500"
              )}
              disabled={isAnswered}
            />
          </div>
        )}

        <AnimatePresence>
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-4 bg-red-50 rounded-lg border border-red-100 text-sm text-red-800 text-right"
            >
              <p className="font-bold mb-1">الشرح:</p>
              <BidiText as="div" text={currentExercise.explanation} />
              {!isCorrect && (
                <div className="mt-2 text-green-700 font-bold">
                  <span>الإجابة الصحيحة:</span>
                  <BidiText as="span" text={currentExercise.correctAnswer} className="mt-1" />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 flex justify-end">
          {!isAnswered ? (
            <Button
              onClick={handleCheckAnswer}
              disabled={(!selectedOption && currentExercise.type === 'multipleChoice') || (!textAnswer && currentExercise.type !== 'multipleChoice')}
              className="bg-amber-600 hover:bg-amber-700 text-white min-w-[120px]"
            >
              تحقق
            </Button>
          ) : (
            <Button onClick={handleNext} className="bg-gray-800 hover:bg-gray-900 text-white min-w-[120px]">
              {currentIndex < exercises.length - 1 ? 'التالي' : 'إنهاء'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GrammarExercisePanel;

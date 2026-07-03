import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, CheckCircle, XCircle, RefreshCw, Home } from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

const ExerciseRunner = ({ exercises, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [answered, setAnswered] = useState(false);

  const currentExercise = exercises[currentIndex];

  const handleAnswer = (index) => {
    if (answered) return;
    
    setSelectedAnswer(index);
    const correct = index === currentExercise.correctAnswer;
    setIsCorrect(correct);
    setAnswered(true);
    
    if (correct) {
      setScore(prev => prev + 1);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#4ade80', '#22c55e']
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setAnswered(false);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      setShowResult(true);
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 }
      });
    }
  };

  if (showResult) {
    const percentage = Math.round((score / exercises.length) * 100);
    return (
      <Card className="max-w-xl mx-auto text-center p-8 shadow-lg border-slate-200">
        <CardContent className="space-y-6">
          <div className="w-24 h-24 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800">Practice Completed!</h2>
          
          <div className="py-6">
            <span className="text-6xl font-black text-purple-600 block mb-2">{percentage}%</span>
            <p className="text-slate-500">You correctly answered {score} out of {exercises.length}</p>
          </div>

          <div className="flex gap-4 justify-center">
            <Button onClick={onBack} variant="outline" className="gap-2">
              <Home className="w-4 h-4" /> Back to Exercises
            </Button>
            <Button onClick={() => window.location.reload()} className="gap-2 bg-purple-600 hover:bg-purple-700">
              <RefreshCw className="w-4 h-4" /> Practice Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex justify-between items-center text-sm text-slate-500 font-medium">
        <span>Exercise {currentIndex + 1} / {exercises.length}</span>
        <Badge variant="outline">{currentExercise.difficulty}</Badge>
      </div>

      <div className="w-full h-2 bg-slate-100 rounded-full mb-8 overflow-hidden">
        <motion.div 
          className="h-full bg-purple-600"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / exercises.length) * 100}%` }}
        />
      </div>

      <Card className="shadow-lg border-slate-200 overflow-hidden">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-8 leading-relaxed" dir="auto">
            {currentExercise.question}
          </h2>

          <div className="space-y-3">
            {currentExercise.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={answered}
                className={cn(
                  "w-full p-4 rounded-xl border-2 text-left transition-all relative flex justify-between items-center",
                  !answered && "hover:border-purple-300 hover:bg-purple-50 border-slate-200",
                  answered && index === currentExercise.correctAnswer && "border-green-500 bg-green-50 text-green-800",
                  answered && index === selectedAnswer && index !== currentExercise.correctAnswer && "border-red-500 bg-red-50 text-red-800",
                  answered && index !== currentExercise.correctAnswer && index !== selectedAnswer && "opacity-50 border-slate-100"
                )}
                dir="auto"
              >
                <span className="font-medium text-lg">{option}</span>
                {answered && index === currentExercise.correctAnswer && <CheckCircle className="text-green-600" />}
                {answered && index === selectedAnswer && index !== currentExercise.correctAnswer && <XCircle className="text-red-600" />}
              </button>
            ))}
          </div>

          <div className="mt-8 flex justify-end h-12">
            <AnimatePresence>
              {answered && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Button onClick={handleNext} size="lg" className="bg-slate-900 hover:bg-black text-white gap-2">
                    {currentIndex === exercises.length - 1 ? 'Finish' : 'Next Exercise'}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-8 text-center">
         <Button variant="ghost" onClick={onBack} className="text-slate-400 hover:text-slate-600">
            Exit Practice
         </Button>
      </div>
    </div>
  );
};

export default ExerciseRunner;
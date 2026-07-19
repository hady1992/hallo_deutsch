import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, HelpCircle, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AudioButton from '@/components/AudioButton';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { shuffleAnswers } from '@/utils/answerShuffler';
import { Alert, AlertDescription } from '@/components/ui/alert';
import BidiText from '@/components/common/BidiText';

const AdvancedExerciseComponent = ({ exercise, onComplete, onNext, hasNext }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [wordOrder, setWordOrder] = useState([]);
  const [currentOptions, setCurrentOptions] = useState([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Cleanup audio
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }

    // Reset State
    setSelectedOption(null);
    setTextAnswer('');
    setIsAnswered(false);
    setIsCorrect(false);
    setShowHint(false);

    // Initialize Exercise
    if (exercise.type === 'multipleChoice') {
      const { shuffledOptions } = shuffleAnswers(exercise.options, exercise.correctAnswer);
      setCurrentOptions(shuffledOptions);
    } else if (exercise.type === 'wordOrder') {
      // Shuffle words for word order exercise
      setWordOrder([...exercise.words].sort(() => Math.random() - 0.5));
    } else {
      setCurrentOptions([]);
    }
  }, [exercise]);

  const checkAnswer = () => {
    if (isAnswered) return;

    let correct = false;

    if (exercise.type === 'multipleChoice') {
      correct = selectedOption === exercise.correctAnswer;
    } else if (exercise.type === 'fillBlank') {
      correct = textAnswer.trim().toLowerCase() === exercise.correctAnswer.toLowerCase();
    } else if (exercise.type === 'wordOrder') {
      correct = wordOrder.join(' ') === exercise.correctAnswer;
    } else if (exercise.type === 'matching') {
      correct = true; // Placeholder for matching logic
    }

    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      toast({ title: "Ausgezeichnet! (ممتاز) 🎉", className: "bg-green-50 border-green-200" });
    } else {
      toast({ title: "Falsch (خطأ)", variant: "destructive" });
    }

    onComplete(correct);
  };

  const renderMultipleChoice = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {currentOptions.map((opt, idx) => (
        <motion.button
          key={idx}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => !isAnswered && setSelectedOption(opt)}
          disabled={isAnswered}
          className={cn(
            "p-4 rounded-xl border-2 text-left transition-all flex justify-between items-center relative overflow-hidden",
            selectedOption === opt ? "border-red-500 bg-red-50 text-red-700" : "border-slate-100 bg-white hover:border-red-200",
            isAnswered && opt === exercise.correctAnswer && "border-green-500 bg-green-50 text-green-700",
            isAnswered && selectedOption === opt && !isCorrect && "border-red-500 bg-red-50 text-red-700"
          )}
        >
          <BidiText as="span" text={opt} className="font-medium text-lg flex-1" />
          {isAnswered && opt === exercise.correctAnswer && <Check size={20} className="text-green-600" />}
          {isAnswered && selectedOption === opt && !isCorrect && <X size={20} className="text-red-600" />}
        </motion.button>
      ))}
    </div>
  );

  const renderFillBlank = () => (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        value={textAnswer}
        onChange={(e) => setTextAnswer(e.target.value)}
        disabled={isAnswered}
        placeholder="Schreiben Sie hier..."
        className={cn(
          "w-full p-4 text-xl rounded-xl border-2 outline-none transition-all",
          isAnswered
            ? isCorrect
              ? "border-green-500 bg-green-50 text-green-700"
              : "border-red-500 bg-red-50 text-red-700"
            : "border-slate-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
        )}
        dir="ltr"
      />
    </div>
  );

  const renderWordOrder = () => (
    <div className="space-y-6">
      <div className={cn(
        "min-h-[80px] p-4 rounded-xl border-2 border-dashed flex flex-wrap gap-2 items-center content-center transition-colors",
        isAnswered
          ? isCorrect ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
          : "border-slate-300 bg-slate-50"
      )}>
        {wordOrder.length === 0 && <span className="text-slate-400 w-full text-center">Klicken Sie auf die Wörter</span>}
        <p className="w-full text-center font-bold text-xl text-slate-700" dir="ltr">
          {wordOrder.join(' ')}
        </p>
      </div>

       <div className="bg-yellow-50 p-4 rounded-lg text-sm text-yellow-800 flex items-center gap-2">
         <AlertCircle size={16} />
         Hinweis: Ordnen Sie die Wörter (Demo-Modus)
       </div>
       <div className="flex flex-wrap gap-2 justify-center" dir="ltr">
          {wordOrder.map((word, idx) => (
             <motion.div layout key={idx} className="bg-white border shadow-sm px-4 py-2 rounded-lg font-medium cursor-grab active:cursor-grabbing hover:border-red-300">
                {word}
             </motion.div>
          ))}
       </div>
       <Button
         variant="outline"
         size="sm"
         onClick={() => setWordOrder([...exercise.words].sort(() => Math.random() - 0.5))}
       >
         <RefreshCw size={14} className="mr-2" /> Mischen
       </Button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100"
      >
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={cn(
                "px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide",
                exercise.difficulty === 'easy' ? "bg-green-100 text-green-700" :
                exercise.difficulty === 'medium' ? "bg-yellow-100 text-yellow-700" :
                "bg-red-100 text-red-700"
              )}>
                {exercise.difficulty}
              </span>
              <span className="text-xs text-slate-500 font-medium bg-white px-2 py-0.5 rounded-full border">
                {exercise.topic}
              </span>
            </div>
            <BidiText as="h2" text={exercise.question} className="text-2xl font-bold text-slate-800 leading-tight mt-2" />
          </div>

          {/* Robust Audio Button integration */}
          <div className="flex-shrink-0 ml-4">
             <AudioButton
                text={exercise.question}
                size={24}
                className="hover:bg-red-100 text-slate-400 hover:text-red-600"
             />
          </div>
        </div>

        <div className="p-8">
          {exercise.type === 'multipleChoice' && renderMultipleChoice()}
          {exercise.type === 'fillBlank' && renderFillBlank()}
          {exercise.type === 'wordOrder' && renderWordOrder()}

          {exercise.type === 'matching' && (
              <Alert className="bg-slate-50 border-slate-200">
                  <AlertDescription>Matching exercises are simplified in this view.</AlertDescription>
              </Alert>
          )}

          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setShowHint(!showHint)}
              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              {showHint ? 'Hinweis verbergen' : 'Hinweis anzeigen'}
            </Button>

            {!isAnswered ? (
              <Button
                onClick={checkAnswer}
                disabled={(!selectedOption && exercise.type === 'multipleChoice') || (!textAnswer && exercise.type === 'fillBlank')}
                className="bg-red-600 hover:bg-red-700 text-white min-w-[140px] h-12 text-lg shadow-lg shadow-red-200"
              >
                Prüfen
              </Button>
            ) : (
              <Button
                onClick={onNext}
                disabled={!hasNext}
                className="bg-slate-900 hover:bg-black text-white min-w-[140px] h-12 text-lg"
              >
                Weiter <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
              </Button>
            )}
          </div>

          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-4 text-amber-800 text-sm overflow-hidden"
              >
                <span className="font-bold block mb-1 flex items-center gap-2">
                    <HelpCircle size={14} /> TIPP:
                </span>
                <BidiText as="div" text={exercise.hint} />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "mt-6 rounded-2xl p-6 border-l-4",
                  isCorrect ? "bg-green-50 border-green-500" : "bg-red-50 border-red-500"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className={cn("font-bold text-lg", isCorrect ? "text-green-800" : "text-red-800")}>
                    {isCorrect ? "Richtig! (صحيح)" : "Leider falsch (خطأ)"}
                  </h3>
                  {exercise.correctAnswer && !isCorrect && (
                    <span className="text-sm bg-white/60 px-2 py-1 rounded text-red-800 border border-red-100">
                       Lösung: <BidiText as="span" text={exercise.correctAnswer} className="font-bold" />
                    </span>
                  )}
                </div>
                <BidiText as="p" text={exercise.explanation} className="text-slate-700 leading-relaxed text-sm md:text-base" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default AdvancedExerciseComponent;

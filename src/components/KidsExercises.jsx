import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import KidsFileUploader from './KidsFileUploader';
import { saveKidsExercises, getKidsProgress, saveKidsProgress } from '@/utils/storageManager';
import { getKidsExercises } from '@/services/contentRepository';
import BidiText from '@/components/common/BidiText';

const defaultExercises = [
  {
    id: 1,
    type: 'choice',
    question: 'ما معنى "Der Hund"?',
    options: ['قطة', 'كلب', 'فأر'],
    correct: 'كلب'
  },
  {
    id: 2,
    type: 'choice',
    question: 'ما لون "Rot"?',
    options: ['أزرق', 'أحمر', 'أخضر'],
    correct: 'أحمر'
  }
];

const KidsExercises = ({ isAdmin }) => {
  const [exercises, setExercises] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const loadData = async () => {
    const loaded = await getKidsExercises();
    if (loaded && loaded.length > 0) {
      setExercises(loaded);
    } else {
      setExercises(defaultExercises);
    }

    // Load progress
    getKidsProgress();
    };
    loadData();
  }, []);

  const handleUpload = (data) => {
    const newEx = [...exercises, ...data.map((item, idx) => ({ ...item, id: Date.now() + idx }))];
    setExercises(newEx);
    saveKidsExercises(newEx);
  };

  const checkAnswer = (answer) => {
    setSelected(answer);
    const correct = answer === exercises[currentIdx].correct;
    setIsCorrect(correct);

    if (correct) {
      const newProg = { ...getKidsProgress(), exercises: { ...getKidsProgress().exercises, [exercises[currentIdx].id]: true } };
      saveKidsProgress(newProg);
      setTimeout(() => {
        if (currentIdx < exercises.length - 1) {
            setCurrentIdx(prev => prev + 1);
            setSelected(null);
            setIsCorrect(null);
        } else {
            // Finished
            setIsCorrect('finished');
        }
      }, 1500);
    }
  };

  if (isCorrect === 'finished') {
      return (
          <div className="text-center py-12 bg-yellow-50 rounded-3xl border-4 border-yellow-200">
              <Trophy size={64} className="mx-auto text-yellow-500 mb-4 animate-bounce" />
              <h2 className="text-3xl font-black text-slate-800 mb-2">ممتاز! 🎉</h2>
              <p className="text-slate-600 font-bold mb-6">لقد أنهيت جميع التمارين!</p>
              <Button onClick={() => { setCurrentIdx(0); setIsCorrect(null); setSelected(null); }} size="lg" className="rounded-full font-bold">
                  العب مجدداً
              </Button>
          </div>
      );
  }

  const currentExercise = exercises[currentIdx];

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-800">العب وتعلم</h2>
        {isAdmin && (
           <KidsFileUploader
             onUpload={handleUpload}
             label="إضافة تمارين"
             templateData={[{ type: 'choice', question: '?', options: ['a','b'], correct: 'a' }]}
           />
        )}
      </div>

      {currentExercise && (
          <div className="bg-white rounded-3xl p-8 shadow-lg border-b-8 border-slate-100 relative overflow-hidden">
              <div className="flex justify-between text-sm font-bold text-slate-400 mb-6 uppercase tracking-wider">
                  <span>سؤال {currentIdx + 1} / {exercises.length}</span>
                  <span>نقاطك: {currentIdx * 10}</span>
              </div>

              <BidiText as="h3" text={currentExercise.question} className="text-2xl md:text-3xl font-black text-slate-800 mb-8" />

              <div className="grid gap-4 max-w-md mx-auto">
                  {currentExercise.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => checkAnswer(opt)}
                        disabled={isCorrect !== null}
                        className={`
                            w-full p-4 rounded-2xl text-xl font-bold transition-all transform hover:scale-105
                            ${selected === opt
                                ? (isCorrect ? 'bg-green-500 text-white shadow-green-200' : 'bg-red-500 text-white shadow-red-200')
                                : 'bg-slate-100 text-slate-700 hover:bg-red-100 hover:text-red-700'}
                        `}
                      >
                          <BidiText as="span" text={opt} />
                      </button>
                  ))}
              </div>

              <AnimatePresence>
                  {isCorrect !== null && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`mt-8 p-4 rounded-2xl text-center font-black text-xl flex items-center justify-center gap-2 ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                      >
                          {isCorrect ? <Check size={24} /> : <X size={24} />}
                          {isCorrect ? 'إجابة صحيحة! أحسنت!' : 'حاول مرة أخرى!'}
                      </motion.div>
                  )}
              </AnimatePresence>
          </div>
      )}
    </div>
  );
};

export default KidsExercises;

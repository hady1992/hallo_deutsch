import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Volume2, CheckCircle, XCircle, Trophy, RefreshCcw, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { kidsGamesQuestionsData } from '@/data/kidsGamesQuestionsData';
import confetti from 'canvas-confetti';
import AudioSpeedControl from '@/components/AudioSpeedControl';

const KidsGamesAndQuestions = () => {
  const [activeGameType, setActiveGameType] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  const gameTypes = [
    { id: 'multiple-choice', title: 'الاختيار الذكي', icon: '🧠', desc: 'اختر الإجابة الصحيحة', color: 'bg-blue-500' },
    { id: 'fill-in', title: 'أكمل الجملة', icon: '✍️', desc: 'اكتب الكلمة الناقصة', color: 'bg-green-500' },
    { id: 'true-false', title: 'صح أم خطأ', icon: '🤔', desc: 'هل هذه الجملة صحيحة؟', color: 'bg-orange-500' },
  ];

  const startGame = (type) => {
    const filtered = kidsGamesQuestionsData.filter(q => q.type === type);
    const shuffled = [...filtered].sort(() => 0.5 - Math.random()).slice(0, 10);
    setQuestions(shuffled);
    setActiveGameType(type);
    setCurrentIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setFeedback(null);
    setTextInput('');
  };

  // Strictly plays ONLY the provided text (Question)
  const playAudio = (text) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    utterance.rate = playbackSpeed;
    window.speechSynthesis.speak(utterance);
  };

  const handleAnswer = (answer) => {
    if (selectedAnswer) return;

    const currentQ = questions[currentIndex];
    setSelectedAnswer(answer);

    const isCorrect = 
        currentQ.type === 'fill-in' 
        ? answer.toLowerCase().trim() === currentQ.correctAnswer.toLowerCase().trim()
        : answer === currentQ.correctAnswer;

    if (isCorrect) {
        setScore(prev => prev + 1);
        setFeedback({ type: 'success', text: currentQ.feedback || 'Richtig! ممتاز!' });
        
        // Play success sound effect/feedback only AFTER answer is selected
        // We do NOT read the answer text itself to avoid hints
        const utterance = new SpeechSynthesisUtterance('Richtig!');
        utterance.lang = 'de-DE';
        utterance.rate = playbackSpeed;
        window.speechSynthesis.speak(utterance);

        confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
        });
    } else {
        setFeedback({ type: 'error', text: `خطأ! الإجابة الصحيحة: ${currentQ.correctAnswer}` });
        
        // Play error sound effect/feedback only AFTER answer is selected
        const utterance = new SpeechSynthesisUtterance('Das war falsch.');
        utterance.lang = 'de-DE';
        utterance.rate = playbackSpeed;
        window.speechSynthesis.speak(utterance);
    }

    setTimeout(() => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setFeedback(null);
            setTextInput('');
        } else {
            setShowResult(true);
        }
    }, 2500);
  };

  const returnToMenu = () => {
    setActiveGameType(null);
    window.speechSynthesis.cancel();
  };

  if (!activeGameType) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto p-4">
        {gameTypes.map((game) => (
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 1 }}
            whileTap={{ scale: 0.95 }}
            key={game.id}
            onClick={() => startGame(game.id)}
            className={`${game.color} rounded-[2rem] p-8 text-white cursor-pointer shadow-xl relative overflow-hidden group`}
          >
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-10 -mt-10 blur-xl group-hover:scale-150 transition-transform duration-500" />
             <div className="relative z-10 flex flex-col items-center text-center gap-4">
               <div className="text-7xl mb-2 filter drop-shadow-md">{game.icon}</div>
               <h3 className="text-3xl font-black">{game.title}</h3>
               <p className="font-bold opacity-90 text-lg">{game.desc}</p>
               <div className="mt-4 bg-white/20 px-6 py-2 rounded-full font-bold backdrop-blur-sm group-hover:bg-white group-hover:text-slate-800 transition-colors">
                  ابدأ اللعب 🎮
               </div>
             </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (showResult) {
      return (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-2xl mx-auto bg-white rounded-[3rem] p-12 text-center shadow-2xl border-4 border-yellow-200"
          >
             <div className="mb-6 relative inline-block">
                <Trophy size={120} className="text-yellow-400 drop-shadow-lg" />
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-4 -right-4 text-4xl"
                >⭐</motion.div>
             </div>
             
             <h2 className="text-5xl font-black text-slate-800 mb-4">انتهت اللعبة!</h2>
             
             <div className="flex justify-center items-center gap-4 mb-8">
                <div className="bg-blue-100 px-8 py-4 rounded-3xl">
                   <span className="block text-slate-500 font-bold text-sm">النتيجة</span>
                   <span className="text-5xl font-black text-blue-600">{score}/{questions.length}</span>
                </div>
             </div>

             <div className="flex gap-4 justify-center">
                 <Button onClick={returnToMenu} variant="outline" size="lg" className="rounded-2xl border-2 text-lg h-14">
                    قائمة الألعاب
                 </Button>
                 <Button onClick={() => startGame(activeGameType)} size="lg" className="rounded-2xl bg-green-500 hover:bg-green-600 text-white text-lg h-14 shadow-lg shadow-green-200">
                    <RefreshCcw className="mr-2" /> العب مرة أخرى
                 </Button>
             </div>
          </motion.div>
      );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       {/* Header Bar */}
       <div className="flex justify-between items-center bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100">
          <Button onClick={returnToMenu} variant="ghost" className="rounded-xl text-slate-400 font-bold">
             خروج
          </Button>
          
          <div className="flex items-center gap-4">
             <div className="bg-yellow-100 text-yellow-600 px-4 py-2 rounded-full font-black flex items-center gap-2">
                <Star size={18} fill="currentColor" /> {score}
             </div>
             <AudioSpeedControl onSpeedChange={setPlaybackSpeed} />
          </div>
       </div>

       {/* Question Card */}
       <motion.div 
          key={currentIndex}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border-4 border-slate-100 text-center relative overflow-hidden"
       >
          <div className="mb-10">
             <div className="bg-blue-50 inline-block px-10 py-8 rounded-[2rem] border-2 border-blue-100 relative mb-8">
                {/* Question Text - Ensure it's readable */}
                <h2 className="text-4xl md:text-5xl font-black text-slate-800 leading-tight" dir="ltr">
                  {currentQ.question || "Frage..."}
                </h2>
                
                {/* Audio Button - STRICTLY for Question only */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
                   <Button 
                      onClick={() => playAudio(currentQ.audioText || currentQ.question)}
                      className="rounded-full w-14 h-14 bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-200 text-white p-0 border-4 border-white"
                      title="استمع للسؤال"
                   >
                      <Volume2 size={24} />
                   </Button>
                </div>
             </div>
          </div>

          {/* Options Area - STRICTLY Visual Only, No Audio Triggers */}
          <div className="max-w-2xl mx-auto mt-8">
             {currentQ.type === 'multiple-choice' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {currentQ.options.map((opt, idx) => (
                      <motion.button
                         whileHover={{ scale: 1.02 }}
                         whileTap={{ scale: 0.98 }}
                         key={idx}
                         onClick={() => handleAnswer(opt)}
                         disabled={!!selectedAnswer}
                         className={`
                            p-6 rounded-2xl font-bold text-2xl border-2 transition-all shadow-sm
                            ${selectedAnswer === opt 
                              ? (opt === currentQ.correctAnswer 
                                 ? 'bg-green-500 border-green-600 text-white' 
                                 : 'bg-red-500 border-red-600 text-white')
                              : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50'}
                         `}
                      >
                         {/* Text only, no speaker icons */}
                         {opt}
                      </motion.button>
                   ))}
                </div>
             )}

             {currentQ.type === 'true-false' && (
                <div className="flex gap-6 justify-center">
                   {currentQ.options.map((opt) => (
                      <motion.button
                         whileHover={{ scale: 1.05 }}
                         whileTap={{ scale: 0.95 }}
                         key={opt}
                         onClick={() => handleAnswer(opt)}
                         disabled={!!selectedAnswer}
                         className={`
                            w-40 h-40 rounded-[2.5rem] font-black text-3xl border-b-8 transition-all
                            ${opt === 'Richtig' 
                                ? 'bg-green-100 border-green-300 text-green-600 hover:bg-green-200' 
                                : 'bg-red-100 border-red-300 text-red-600 hover:bg-red-200'}
                            ${selectedAnswer === opt ? 'ring-4 ring-offset-4 ring-slate-200' : ''}
                         `}
                      >
                         {/* Visual cues only */}
                         {opt === 'Richtig' ? '✅' : '❌'}
                         <div className="text-lg mt-2">{opt}</div>
                      </motion.button>
                   ))}
                </div>
             )}

             {currentQ.type === 'fill-in' && (
                <div className="bg-slate-50 p-8 rounded-[2rem] border-2 border-slate-100">
                   <div className="flex gap-4">
                      <input 
                         value={textInput}
                         onChange={(e) => setTextInput(e.target.value)}
                         placeholder="?"
                         className="flex-1 text-center text-3xl font-bold p-4 rounded-2xl border-2 border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none"
                         disabled={!!selectedAnswer}
                      />
                      <Button 
                         onClick={() => handleAnswer(textInput)}
                         disabled={!textInput || !!selectedAnswer}
                         className="h-auto px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl"
                      >
                         OK
                      </Button>
                   </div>
                </div>
             )}
          </div>

          <AnimatePresence>
             {feedback && (
                <motion.div 
                   initial={{ y: 50, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   exit={{ y: 50, opacity: 0 }}
                   className={`
                      absolute bottom-0 left-0 w-full p-6 text-white font-bold text-xl backdrop-blur-md z-20
                      ${feedback.type === 'success' ? 'bg-green-500/90' : 'bg-red-500/90'}
                   `}
                >
                   <div className="flex items-center justify-center gap-3">
                      {feedback.type === 'success' ? <CheckCircle size={32} /> : <XCircle size={32} />}
                      {feedback.text}
                   </div>
                </motion.div>
             )}
          </AnimatePresence>
       </motion.div>
       
       <div className="flex justify-center gap-2">
          {questions.map((_, idx) => (
             <div 
                key={idx} 
                className={`w-3 h-3 rounded-full transition-colors ${idx === currentIndex ? 'bg-blue-500 scale-125' : idx < currentIndex ? 'bg-blue-200' : 'bg-slate-200'}`} 
             />
          ))}
       </div>
    </div>
  );
};

export default KidsGamesAndQuestions;
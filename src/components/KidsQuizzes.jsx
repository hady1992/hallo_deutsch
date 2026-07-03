import React, { useState } from 'react';
import { Trophy, ArrowLeft, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { kidsQuizzesData } from '@/data/kidsQuizzesData';
import confetti from 'canvas-confetti';
import AudioSpeedControl from '@/components/AudioSpeedControl';
import AudioButton from '@/components/AudioButton';
import { motion } from 'framer-motion';
import { shuffleAnswers } from '@/utils/answerShuffler';

const KidsQuizzes = () => {
  const [activeQuizId, setActiveQuizId] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerStatus, setAnswerStatus] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);

  // Get active quiz metadata (title, icon) from static data
  const activeQuizInfo = kidsQuizzesData.find(q => q.id === activeQuizId);

  const startQuiz = (id) => {
    const quizData = kidsQuizzesData.find(q => q.id === id);
    if (!quizData) return;

    // Shuffle options for all questions at the start of the quiz
    const preparedQuestions = quizData.questions.map(q => {
      const { shuffledOptions } = shuffleAnswers(q.options, q.a);
      return {
        ...q,
        options: shuffledOptions,
        originalAnswer: q.a // Keep original answer for validation
      };
    });

    setShuffledQuestions(preparedQuestions);
    setActiveQuizId(id);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
    setAnswerStatus(null);
  };

  const handleAnswer = (option) => {
      if(selectedOption) return;

      setSelectedOption(option);
      // Validate against the correct answer stored in the question object
      const currentQuestion = shuffledQuestions[currentQuestionIndex];
      const correct = currentQuestion.originalAnswer === option;
      
      if(correct) {
          setScore(s => s + 1);
          setAnswerStatus('correct');
          if (currentQuestionIndex === shuffledQuestions.length - 1) {
             confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          }
      } else {
          setAnswerStatus('incorrect');
      }
      
      setTimeout(() => {
          if (currentQuestionIndex < shuffledQuestions.length - 1) {
              setCurrentQuestionIndex(prev => prev + 1);
              setSelectedOption(null);
              setAnswerStatus(null);
          } else {
              setShowResult(true);
          }
      }, 1500);
  };

  const reset = () => {
      setActiveQuizId(null);
      setCurrentQuestionIndex(0);
      setScore(0);
      setShowResult(false);
      setShuffledQuestions([]);
      window.speechSynthesis.cancel();
  };

  if (!activeQuizId) {
      return (
          <div className="max-w-6xl mx-auto p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {kidsQuizzesData.map((quiz, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ y: -5, shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
                        key={quiz.id}
                        onClick={() => startQuiz(quiz.id)}
                        className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-lg cursor-pointer group text-center relative overflow-hidden"
                      >
                          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-purple-400" />
                          <div className="text-7xl mb-6 transform group-hover:scale-110 transition-transform duration-300 filter drop-shadow-sm">{quiz.icon}</div>
                          <h3 className="text-2xl font-black text-slate-800 mb-2">{quiz.title}</h3>
                          <p className="text-slate-400 font-bold mb-6">{quiz.questions.length} أسئلة ممتعة</p>
                          <div className="inline-block bg-blue-50 text-blue-600 px-6 py-2 rounded-full font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                             ابدأ التحدي 🚀
                          </div>
                      </motion.div>
                  ))}
              </div>
          </div>
      );
  }

  if (showResult) {
      const percentage = Math.round((score / shuffledQuestions.length) * 100);
      let message = '';
      if(percentage === 100) message = 'أسطوري! 🏆';
      else if(percentage >= 80) message = 'رائع جداً! 🌟';
      else if(percentage >= 50) message = 'عمل جيد! 👍';
      else message = 'حاول مرة أخرى 💪';

      return (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-2xl mx-auto text-center space-y-8 bg-white p-12 rounded-[3rem] shadow-2xl border-4 border-purple-100 mt-8"
          >
              <div className="text-9xl mb-4 animate-bounce filter drop-shadow-lg">{percentage === 100 ? '👑' : '🎉'}</div>
              <h2 className="text-4xl font-black text-slate-800">{message}</h2>
              
              <div className="py-8 bg-slate-50 rounded-3xl mx-8">
                 <div className="text-6xl font-black text-purple-600 mb-2">{score} / {shuffledQuestions.length}</div>
                 <div className="text-slate-400 font-bold text-xl">إجابة صحيحة</div>
              </div>

              <div className="flex gap-4 justify-center">
                  <Button onClick={reset} variant="outline" size="lg" className="rounded-2xl border-2 h-14 text-lg">
                      <ArrowLeft className="mr-2" /> قائمة المسابقات
                  </Button>
                  <Button onClick={() => startQuiz(activeQuizId)} size="lg" className="rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold h-14 text-lg shadow-lg shadow-purple-200">
                      <RefreshCw className="mr-2" /> إعادة المحاولة
                  </Button>
              </div>
          </motion.div>
      );
  }

  const currentQuestion = shuffledQuestions[currentQuestionIndex];

  return (
      <div className="max-w-3xl mx-auto mt-4">
          {/* Header Progress */}
          <div className="flex items-center justify-between mb-8 gap-4 px-4">
              <div className="flex items-center gap-4 flex-1">
                <Button onClick={reset} variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 bg-white shadow-sm rounded-xl">
                    <ArrowLeft />
                </Button>
                <div className="flex-1 h-5 bg-white rounded-full overflow-hidden shadow-inner border border-slate-100 p-1">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentQuestionIndex + 1) / shuffledQuestions.length) * 100}%` }}
                        className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
                    />
                </div>
                <span className="font-black text-slate-500 bg-white px-3 py-1 rounded-lg shadow-sm text-sm whitespace-nowrap">
                    {currentQuestionIndex + 1} / {shuffledQuestions.length}
                </span>
              </div>
              <AudioSpeedControl onSpeedChange={setPlaybackSpeed} />
          </div>

          <motion.div 
             key={currentQuestionIndex}
             initial={{ x: 20, opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border-b-8 border-slate-100"
          >
              <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-5xl font-black text-slate-800 leading-tight mb-6" dir="ltr">
                      {currentQuestion.q}
                  </h2>
                  
                  {/* Icon separated from question text */}
                  {currentQuestion.icon && (
                      <div className="text-8xl my-6 filter drop-shadow-md animate-in zoom-in duration-300">
                          {currentQuestion.icon}
                      </div>
                  )}

                  <div className="flex justify-center mt-4">
                    {/* AudioButton ONLY receives the clean question text */}
                    {/* Data validation: trim() ensures whitespace is removed */}
                    <div className="bg-blue-50 hover:bg-blue-100 transition-colors rounded-full px-6 py-3 flex items-center gap-3 cursor-pointer group"
                         onClick={(e) => {
                             // Programmatically trigger the audio button click if container is clicked
                             // This is a UI wrapper to make the small AudioButton look like a big "Listen" button
                             const btn = e.currentTarget.querySelector('button');
                             if(btn) btn.click();
                         }}>
                        <AudioButton 
                            text={currentQuestion.q ? currentQuestion.q.trim() : ''} 
                            speed={playbackSpeed}
                            className="bg-blue-600 text-white hover:bg-blue-700 h-10 w-10"
                            size={20}
                        />
                        <span className="font-bold text-blue-600 text-lg group-hover:text-blue-700">استمع للسؤال</span>
                    </div>
                  </div>
              </div>

              {/* Options Grid - Visual Only, No Audio */}
              <div className="grid gap-4">
                  {currentQuestion.options.map((opt, idx) => {
                      const isSelected = selectedOption === opt;
                      const isCorrect = currentQuestion.originalAnswer === opt;
                      
                      let btnClass = "bg-white border-2 border-slate-100 text-slate-600 hover:border-blue-300 hover:shadow-md"; 
                      if (isSelected) {
                          if (answerStatus === 'correct') btnClass = "bg-green-500 border-green-600 text-white shadow-lg shadow-green-200";
                          if (answerStatus === 'incorrect') btnClass = "bg-red-500 border-red-600 text-white shadow-lg shadow-red-200";
                      }
                      if (answerStatus === 'incorrect' && isCorrect && selectedOption) {
                          btnClass = "bg-green-100 border-green-300 text-green-700 ring-2 ring-green-400";
                      }

                      return (
                          <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            key={idx}
                            onClick={() => handleAnswer(opt)}
                            disabled={!!selectedOption}
                            className={`
                                w-full p-6 rounded-2xl text-xl font-bold transition-all duration-200 flex justify-between items-center group
                                ${btnClass}
                            `}
                          >
                              {/* Option text without speaker icons */}
                              <span>{opt}</span>
                              <div className="flex items-center">
                                {isSelected && answerStatus === 'correct' && <CheckCircle2 size={28} className="text-white" />}
                                {isSelected && answerStatus === 'incorrect' && <XCircle size={28} className="text-white" />}
                                {!selectedOption && <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-blue-400" />}
                              </div>
                          </motion.button>
                      );
                  })}
              </div>
          </motion.div>
      </div>
  );
};

export default KidsQuizzes;
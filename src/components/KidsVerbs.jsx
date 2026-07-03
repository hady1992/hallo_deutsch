import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Play, Pause, ChevronDown, ChevronUp, Star, Filter, Trophy, RefreshCw, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AudioButton from '@/components/AudioButton';
import KidsFileUploader from './KidsFileUploader';
import { getKidsVerbs, saveKidsVerbs } from '@/utils/storageManager';
import { kidsVerbsDatabase } from '@/data/kidsVerbsDatabase';
import { useToast } from '@/components/ui/use-toast';
import confetti from 'canvas-confetti';

const KidsVerbs = ({ isAdmin }) => {
  const [verbs, setVerbs] = useState([]);
  const [filteredVerbs, setFilteredVerbs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  
  // Practice Mode States
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null); // 'correct' or 'incorrect'

  const { toast } = useToast();

  useEffect(() => {
    const loadData = () => {
      const stored = getKidsVerbs();
      
      // Merge: create a map to handle duplicates, prioritize imported/stored items if needed
      // Assuming IDs are unique enough (static are 'v1', imported are timestamps)
      const mergedMap = new Map();
      kidsVerbsDatabase.forEach(item => mergedMap.set(item.id, item));
      stored.forEach(item => mergedMap.set(item.id, item));
      
      const allVerbs = Array.from(mergedMap.values());
      setVerbs(allVerbs);
      setFilteredVerbs(allVerbs);
    };
    loadData();
    window.addEventListener('kidsDataUpdated', loadData);
    return () => window.removeEventListener('kidsDataUpdated', loadData);
  }, []);

  useEffect(() => {
    let result = verbs;

    if (activeCategory !== 'all') {
      result = result.filter(v => v.category === activeCategory);
    }

    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(v => 
        v.infinitive.toLowerCase().includes(lower) || 
        v.arabic.includes(lower)
      );
    }

    setFilteredVerbs(result);
  }, [verbs, activeCategory, searchTerm]);

  const handleUpload = (data) => {
    // Process uploaded data to match structure
    const processed = data.map((item, idx) => ({
      ...item,
      id: Date.now() + idx,
      infinitive: item.infinitive || item.german || '',
      category: item.category || 'daily',
      level: item.level || 'medium'
    }));
    
    const newVerbs = [...verbs, ...processed];
    setVerbs(newVerbs);
    saveKidsVerbs(newVerbs);
  };

  const categories = [
    { id: 'all', label: 'الكل', color: 'bg-slate-100 text-slate-600' },
    { id: 'daily', label: 'يومي', color: 'bg-orange-100 text-orange-600' },
    { id: 'movement', label: 'حركة', color: 'bg-blue-100 text-blue-600' },
    { id: 'emotions', label: 'مشاعر', color: 'bg-red-100 text-red-600' },
    { id: 'learning', label: 'تعلم', color: 'bg-yellow-100 text-yellow-600' },
    { id: 'sports', label: 'رياضة', color: 'bg-green-100 text-green-600' },
    { id: 'family', label: 'عائلة', color: 'bg-purple-100 text-purple-600' },
    { id: 'nature', label: 'طبيعة', color: 'bg-emerald-100 text-emerald-600' },
    { id: 'creative', label: 'إبداع', color: 'bg-pink-100 text-pink-600' },
  ];

  // --- Quiz Logic ---

  const startPractice = () => {
    if (verbs.length < 5) {
      toast({ title: "عذراً", description: "لا يوجد عدد كافٍ من الأفعال لبدء التمرين." });
      return;
    }

    // Shuffle and pick 5
    const shuffled = [...verbs].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);
    
    // Generate questions with distractors
    const questions = selected.map(verb => {
      const distractors = verbs
        .filter(v => v.id !== verb.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(v => v.arabic);
        
      const options = [...distractors, verb.arabic].sort(() => 0.5 - Math.random());
      
      return {
        verb,
        options,
        correctAnswer: verb.arabic
      };
    });

    setQuizQuestions(questions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
    setIsPracticeMode(true);
    setFeedback(null);
    setSelectedAnswer(null);
  };

  const handleAnswer = (option) => {
    if (selectedAnswer) return; // Prevent double clicking

    setSelectedAnswer(option);
    const isCorrect = option === quizQuestions[currentQuestionIndex].correctAnswer;
    
    if (isCorrect) {
      setFeedback('correct');
      setScore(prev => prev + 1);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#22c55e', '#ffffff']
      });
      // Play audio automatically on correct answer
      const verbText = quizQuestions[currentQuestionIndex].verb.infinitive;
      const utterance = new SpeechSynthesisUtterance(verbText);
      utterance.lang = 'de-DE';
      window.speechSynthesis.speak(utterance);
    } else {
      setFeedback('incorrect');
    }

    // Next question delay
    setTimeout(() => {
      if (currentQuestionIndex < quizQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setFeedback(null);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
      }
    }, 2000);
  };

  const exitPractice = () => {
    setIsPracticeMode(false);
    setQuizQuestions([]);
    setShowResult(false);
  };

  // --- Render ---

  if (isPracticeMode) {
    // Practice Mode UI
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm">
          <Button variant="ghost" onClick={exitPractice}>خروج</Button>
          <div className="font-black text-xl text-slate-700">تمرين الأفعال</div>
          <div className="bg-yellow-100 text-yellow-700 px-4 py-1 rounded-full font-bold">
            {currentQuestionIndex + 1} / {quizQuestions.length}
          </div>
        </div>

        {!showResult ? (
          <motion.div 
            key={currentQuestionIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border-4 border-slate-100 text-center space-y-8"
          >
            <div className="text-8xl mb-6 animate-bounce-slow">
              {quizQuestions[currentQuestionIndex].verb.image}
            </div>
            
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-slate-800">
                {quizQuestions[currentQuestionIndex].verb.infinitive}
              </h2>
              <div className="flex justify-center">
                 <AudioButton 
                    text={quizQuestions[currentQuestionIndex].verb.infinitive} 
                    size={32} 
                    className="w-16 h-16 bg-blue-50 text-blue-600 hover:bg-blue-100" 
                  />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              {quizQuestions[currentQuestionIndex].options.map((option, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswer(option)}
                  disabled={!!selectedAnswer}
                  className={`
                    p-6 rounded-2xl text-xl font-bold border-4 transition-all
                    ${selectedAnswer === option 
                      ? option === quizQuestions[currentQuestionIndex].correctAnswer 
                        ? 'bg-green-100 border-green-400 text-green-700'
                        : 'bg-red-100 border-red-400 text-red-700'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-white'}
                    ${selectedAnswer && option === quizQuestions[currentQuestionIndex].correctAnswer && 'bg-green-100 border-green-400 text-green-700 ring-2 ring-green-200'}
                  `}
                >
                  {option}
                </motion.button>
              ))}
            </div>
            
            {feedback && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-2xl font-black ${feedback === 'correct' ? 'text-green-500' : 'text-red-500'}`}
              >
                {feedback === 'correct' ? '🎉 ممتاز!' : '😕 حاول مرة أخرى!'}
              </motion.div>
            )}

          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-[3rem] p-12 text-center space-y-8 shadow-xl"
          >
            <div className="text-8xl">🏆</div>
            <h2 className="text-4xl font-black text-slate-800">انتهى التمرين!</h2>
            <div className="text-2xl font-bold text-slate-600">
              نتيجتك: <span className="text-blue-600 text-4xl">{score}</span> / {quizQuestions.length}
            </div>
            <div className="flex justify-center gap-4 pt-4">
              <Button onClick={exitPractice} variant="outline" size="lg" className="rounded-xl border-2">العودة للقائمة</Button>
              <Button onClick={startPractice} size="lg" className="rounded-xl bg-green-500 hover:bg-green-600 text-white">العب مجدداً</Button>
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  // List View UI
  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 sticky top-24 z-10">
        <div className="flex items-center gap-4 w-full md:w-auto">
           <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
             <Star className="text-yellow-400 fill-yellow-400" />
             مكتبة الأفعال
           </h2>
           <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
             {filteredVerbs.length} فعل
           </span>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
             <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <input 
               type="text" 
               placeholder="بحث..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-200 text-right text-sm"
             />
          </div>
          
          <Button 
            onClick={startPractice}
            className="bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
          >
            <Trophy size={18} className="mr-2" />
            تمرين
          </Button>

          {isAdmin && (
             <KidsFileUploader 
               onUpload={handleUpload} 
               label="" 
               templateData={[{ infinitive: 'singen', arabic: 'يغني', category: 'creative' }]}
             />
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`
              px-4 py-2 rounded-xl text-sm font-bold transition-all border-2
              ${activeCategory === cat.id 
                ? `${cat.color} border-current scale-105 shadow-md` 
                : 'bg-white border-transparent text-slate-500 hover:bg-slate-50'}
            `}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Verbs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredVerbs.map((verb, index) => (
            <motion.div
              key={verb.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
            >
              <div className="p-6 text-center relative">
                <div className={`
                  absolute top-4 right-4 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full
                  ${verb.level === 'easy' ? 'bg-green-100 text-green-700' : 
                    verb.level === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}
                `}>
                  {verb.level === 'easy' ? 'سهل' : verb.level === 'medium' ? 'متوسط' : 'صعب'}
                </div>

                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {verb.image}
                </div>
                
                <h3 className="text-2xl font-black text-slate-800 mb-1">{verb.infinitive}</h3>
                <p className="text-lg text-slate-500 font-bold mb-4">{verb.arabic}</p>
                
                <div className="flex justify-center gap-2">
                  <AudioButton text={verb.infinitive} className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white" size={20} />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400"
                    onClick={() => setExpandedId(expandedId === verb.id ? null : verb.id)}
                  >
                    {expandedId === verb.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </Button>
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {expandedId === verb.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-slate-50 px-6 pb-6 border-t border-slate-100"
                  >
                    <div className="pt-4 space-y-3 text-right">
                       <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                         <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mithilfe</span>
                            <AudioButton text={verb.example} size={14} className="h-6 w-6" />
                         </div>
                         <p className="font-medium text-slate-800 text-sm leading-relaxed" dir="ltr">{verb.example}</p>
                         <p className="text-slate-500 text-sm mt-1 border-t border-slate-50 pt-1">{verb.exampleAr}</p>
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredVerbs.length === 0 && (
        <div className="text-center py-20">
           <div className="text-6xl mb-4">🔍</div>
           <p className="text-xl font-bold text-slate-400">لا توجد نتائج</p>
           <Button variant="link" onClick={() => {setSearchTerm(''); setActiveCategory('all');}}>
             إعادة تعيين البحث
           </Button>
        </div>
      )}
    </div>
  );
};

export default KidsVerbs;
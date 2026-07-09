import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Smile, Book, Gamepad2, Trophy, BookOpen, MessageCircle, Dumbbell, Star } from 'lucide-react';
import KidsTopics from '@/components/KidsTopics';
import KidsVocabulary from '@/components/KidsVocabulary';
import KidsVerbs from '@/components/KidsVerbs';
import KidsSentences from '@/components/KidsSentences';
import KidsExercises from '@/components/KidsExercises';
import KidsGamesAndQuestions from '@/components/KidsGamesAndQuestions';
import KidsQuizzes from '@/components/KidsQuizzes';
import { kidsConversationsDatabase } from '@/data/kidsConversationsDatabase';
import { getKidsProgress } from '@/utils/storageManager';

const Kids = () => {
  const [activeTab, setActiveTab] = useState("topics");
  const [conversationsCount, setConversationsCount] = useState(0);
  const [completedExercises, setCompletedExercises] = useState(0);

  useEffect(() => {
    setConversationsCount(kidsConversationsDatabase.length);

    // Load child's progress (stars) and keep it in sync as exercises are completed
    const loadProgress = () => {
        const progress = getKidsProgress();
        const count = progress?.exercises ? Object.keys(progress.exercises).length : 0;
        setCompletedExercises(count);
    };
    loadProgress();
    window.addEventListener('kidsProgressUpdated', loadProgress);
    return () => window.removeEventListener('kidsProgressUpdated', loadProgress);
  }, []);

  const tabs = [
    { id: 'topics', label: 'المواضيع', icon: <Book size={18} />, color: 'data-[state=active]:bg-orange-500' },
    { id: 'vocab', label: 'كلمات', icon: <Smile size={18} />, color: 'data-[state=active]:bg-yellow-500' },
    { id: 'verbs', label: 'أفعال', icon: <BookOpen size={18} />, color: 'data-[state=active]:bg-pink-500' },
    { id: 'sentences', label: 'محادثات', icon: <MessageCircle size={18} />, color: 'data-[state=active]:bg-blue-500' },
    { id: 'exercises', label: 'تمارين', icon: <Dumbbell size={18} />, color: 'data-[state=active]:bg-teal-500' },
    { id: 'games', label: 'ألعاب', icon: <Gamepad2 size={18} />, color: 'data-[state=active]:bg-purple-500' },
    { id: 'quizzes', label: 'مسابقات مخصصة', icon: <Trophy size={18} />, color: 'data-[state=active]:bg-green-500' },
  ];

  return (
    <>
      <Helmet>
        <title>{'Kids German Learning | Hallo Deutsch'}</title>
      </Helmet>

      <div className="min-h-screen bg-[#FFF9F0] pb-24 font-sans selection:bg-yellow-200">
        
        {/* Header */}
        <div className="bg-yellow-400 py-6 pt-28 pb-12 rounded-b-[2rem] md:rounded-b-[3rem] shadow-sm mb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-10 left-10 text-4xl">🎈</div>
                <div className="absolute top-20 right-20 text-4xl">🎨</div>
                <div className="absolute bottom-10 left-1/4 text-4xl">🚗</div>
            </div>
            
            <div className="container mx-auto px-4 text-center relative z-10">
                <motion.h1 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-3xl md:text-6xl font-black text-slate-900 mb-3 tracking-tight drop-shadow-sm"
                >
                    تعلم الألمانية <span className="text-white drop-shadow-md">بمرح!</span>
                </motion.h1>
                <div className="flex flex-col md:flex-row justify-center items-center gap-2 md:gap-4 mt-2">
                    <p className="text-yellow-900/70 font-bold text-base md:text-lg">للأطفال من عمر 5 إلى 13 سنة</p>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold text-yellow-900 flex items-center gap-1">
                      <MessageCircle size={14} /> {conversationsCount} محادثة
                    </span>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold text-yellow-900 flex items-center gap-1">
                      <Star size={14} className="fill-yellow-900 text-yellow-900" /> {completedExercises} نجمة
                    </span>
                </div>
            </div>
        </div>

        <div className="container mx-auto px-4 max-w-7xl">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                
                {/* Custom Tab List - Scrollable on Mobile */}
                <div className="flex justify-start md:justify-center mb-8 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0">
                    <TabsList className="bg-white p-2 h-auto rounded-full shadow-lg border-2 border-slate-100 flex gap-2 min-w-max md:min-w-0 mx-auto">
                        {tabs.map(tab => (
                            <TabsTrigger
                                key={tab.id}
                                value={tab.id}
                                className={`
                                    rounded-full px-4 md:px-5 py-2 md:py-3 font-black text-slate-500 transition-all data-[state=active]:text-white data-[state=active]:shadow-md
                                    flex items-center gap-2 ${tab.color} whitespace-nowrap text-sm md:text-base
                                `}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                {/* Content Areas */}
                <div className="min-h-[400px]">
                    <TabsContent value="topics">
                        <KidsTopics isAdmin={false} />
                    </TabsContent>
                    
                    <TabsContent value="vocab">
                        <KidsVocabulary isAdmin={false} />
                    </TabsContent>

                    <TabsContent value="verbs">
                        <KidsVerbs isAdmin={false} />
                    </TabsContent>

                    <TabsContent value="sentences">
                        <KidsSentences isAdmin={false} />
                    </TabsContent>

                    <TabsContent value="exercises">
                        <KidsExercises isAdmin={false} />
                    </TabsContent>

                    <TabsContent value="games">
                        <KidsGamesAndQuestions />
                    </TabsContent>

                    <TabsContent value="quizzes">
                        <KidsQuizzes />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
      </div>
    </>
  );
};

export default Kids;

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Search, Filter, PlayCircle, PauseCircle, StopCircle,
  ChevronDown, ChevronUp, Star, Users, BarChart3, Volume2,
  ArrowRight, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AudioButton from '@/components/AudioButton';
import AudioSpeedControl from '@/components/AudioSpeedControl';
import { getKidsProgress, saveKidsProgress } from '@/utils/storageManager';
import { getKidsConversations } from '@/services/contentRepository';
import { useToast } from '@/components/ui/use-toast';

const KidsSentences = ({ isAdmin }) => {
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [activeTopic, setActiveTopic] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [favorites, setFavorites] = useState([]);
  
  // Audio Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeConvId, setActiveConvId] = useState(null);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(-1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const speechRef = useRef(null);

  const { toast } = useToast();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const loadData = async () => {
    // Load favorites
    const storedFavs = JSON.parse(localStorage.getItem('kidsConvFavorites') || '[]');
    setFavorites(storedFavs);
    const allConvs = await getKidsConversations();
    setConversations(allConvs);
    setFilteredConversations(allConvs);
    };
    loadData();
  }, []);

  useEffect(() => {
    let result = conversations;

    if (activeTopic !== 'All') {
      result = result.filter(c => c.topic === activeTopic);
    }

    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.title.toLowerCase().includes(lower) || 
        c.sentences.some(s => s.german.toLowerCase().includes(lower) || s.arabic.includes(lower))
      );
    }

    setFilteredConversations(result);
    setCurrentPage(1); 
  }, [conversations, activeTopic, searchTerm]);

  // Audio Logic
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const playFullConversation = (convId, sentences) => {
    if (activeConvId === convId && isPlaying) {
        stopAudio();
        return;
    }

    stopAudio();
    setActiveConvId(convId);
    setIsPlaying(true);
    playSentenceRecursive(sentences, 0);
  };

  const playSentenceRecursive = (sentences, index) => {
    if (index >= sentences.length) {
      stopAudio();
      return;
    }

    setActiveSentenceIndex(index);
    
    const text = sentences[index].german;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    utterance.rate = playbackSpeed;
    
    utterance.onend = () => {
       setTimeout(() => {
           if (speechRef.current) { 
               playSentenceRecursive(sentences, index + 1);
           }
       }, 800);
    };

    utterance.onerror = (e) => {
        console.error("Audio error", e);
        stopAudio();
    };

    speechRef.current = true;
    window.speechSynthesis.speak(utterance);
  };

  const stopAudio = () => {
    window.speechSynthesis.cancel();
    speechRef.current = false;
    setIsPlaying(false);
    setActiveConvId(null);
    setActiveSentenceIndex(-1);
  };

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    let newFavs;
    if (favorites.includes(id)) {
      newFavs = favorites.filter(fid => fid !== id);
    } else {
      newFavs = [...favorites, id];
    }
    setFavorites(newFavs);
    localStorage.setItem('kidsConvFavorites', JSON.stringify(newFavs));
  };

  const topics = ['All', ...new Set(conversations.map(c => c.topic))];
  const totalPages = Math.ceil(filteredConversations.length / itemsPerPage);
  const paginatedItems = filteredConversations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
       {/* Filters & Controls */}
       <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
         <div className="flex flex-wrap gap-2 justify-center md:justify-start w-full md:w-auto">
            <AudioSpeedControl 
                onSpeedChange={setPlaybackSpeed} 
                className="order-last md:order-first" 
            />
            <div className="flex gap-2 overflow-x-auto max-w-full pb-2 md:pb-0 scrollbar-hide">
                {topics.map(topic => (
                <button
                    key={topic}
                    onClick={() => setActiveTopic(topic)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border-2
                    ${activeTopic === topic ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'}
                    `}
                >
                    {topic === 'All' ? 'الكل' : topic}
                </button>
                ))}
            </div>
         </div>
         <div className="relative w-full md:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="بحث..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-200 text-right font-bold text-sm"
            />
         </div>
       </div>

       {/* List */}
       <div className="space-y-4">
         <AnimatePresence>
            {paginatedItems.map((conv, idx) => (
               <motion.div
                 key={conv.id}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0 }}
                 transition={{ delay: idx * 0.05 }}
                 className={`bg-white rounded-[2rem] border-2 overflow-hidden shadow-sm transition-all hover:shadow-md
                    ${expandedId === conv.id ? 'border-blue-400 ring-2 ring-blue-50' : 'border-slate-100'}
                 `}
               >
                 {/* Header */}
                 <div 
                   onClick={() => {
                     setExpandedId(expandedId === conv.id ? null : conv.id);
                     if(expandedId === conv.id) stopAudio();
                   }}
                   className="p-6 cursor-pointer flex flex-col md:flex-row gap-4 items-center justify-between"
                 >
                    <div className="flex items-center gap-4 w-full">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${activeConvId === conv.id ? 'bg-blue-100 text-blue-600 animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
                          {activeConvId === conv.id ? <Volume2 /> : '💬'}
                       </div>
                       <div className="flex-1">
                          <h3 className="text-xl font-black text-slate-800">{conv.title}</h3>
                          <div className="flex gap-3 text-xs font-bold text-slate-400 mt-1">
                             <span className="bg-slate-100 px-2 py-0.5 rounded-md">{conv.topic}</span>
                             <span className="flex items-center gap-1"><Users size={12}/> {conv.characters.join(' & ')}</span>
                          </div>
                       </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                       <Badge variant={conv.level === 'Easy' ? 'success' : conv.level === 'Medium' ? 'warning' : 'destructive'} className="rounded-lg">
                          {conv.level}
                       </Badge>
                       <div className="flex gap-2">
                          <Button 
                             size="icon" 
                             variant="ghost" 
                             onClick={(e) => toggleFavorite(conv.id, e)}
                             className={favorites.includes(conv.id) ? 'text-red-500 bg-red-50' : 'text-slate-300'}
                          >
                             <Star fill={favorites.includes(conv.id) ? "currentColor" : "none"} size={20} />
                          </Button>
                          <div className={`p-2 rounded-full bg-slate-50 transition-transform duration-300 ${expandedId === conv.id ? 'rotate-180' : ''}`}>
                             <ChevronDown size={20} className="text-slate-400" />
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Body */}
                 <AnimatePresence>
                   {expandedId === conv.id && (
                      <motion.div 
                        initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                        className="bg-slate-50/50 border-t-2 border-slate-100"
                      >
                         <div className="p-6">
                            <div className="flex flex-col items-center mb-6 gap-4">
                               <Button 
                                 onClick={() => playFullConversation(conv.id, conv.sentences)}
                                 className={`rounded-full px-8 py-6 font-black text-lg gap-2 shadow-lg transition-all hover:scale-105 w-full md:w-auto
                                   ${activeConvId === conv.id ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}
                                 `}
                               >
                                  {activeConvId === conv.id ? <StopCircle size={24} /> : <PlayCircle size={24} />}
                                  {activeConvId === conv.id ? 'إيقاف الاستماع' : 'استمع للمحادثة كاملة'}
                               </Button>
                            </div>

                            <div className="space-y-3">
                               {conv.sentences.map((sent, i) => (
                                  <motion.div 
                                    key={i}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`
                                      flex gap-4 p-4 rounded-2xl border-2 transition-all duration-300
                                      ${activeConvId === conv.id && activeSentenceIndex === i 
                                         ? 'bg-blue-50 border-blue-300 scale-[1.02] shadow-md' 
                                         : 'bg-white border-transparent hover:border-slate-200'}
                                    `}
                                  >
                                     <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 
                                        ${i % 2 === 0 ? 'bg-orange-100 text-orange-600' : 'bg-purple-100 text-purple-600'}
                                     `}>
                                        {conv.characters[i % 2 === 0 ? 0 : 1].charAt(0)}
                                     </div>
                                     <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                           <p className="text-lg font-bold text-slate-800">{sent.german}</p>
                                           <AudioButton text={sent.german} speed={playbackSpeed} size={18} className="shrink-0 text-slate-400 hover:text-blue-500" />
                                        </div>
                                        <p className="text-slate-500 font-medium text-right dir-rtl">{sent.arabic}</p>
                                     </div>
                                  </motion.div>
                               ))}
                            </div>
                         </div>
                      </motion.div>
                   )}
                 </AnimatePresence>
               </motion.div>
            ))}
         </AnimatePresence>
       </div>

       {/* Pagination */}
       {totalPages > 1 && (
         <div className="flex justify-center gap-4 py-4">
             <Button variant="outline" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
               <ArrowLeft />
             </Button>
             <span className="py-2 font-bold text-slate-600">صفحة {currentPage} من {totalPages}</span>
             <Button variant="outline" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
               <ArrowRight />
             </Button>
         </div>
       )}
    </div>
  );
};

export default KidsSentences;

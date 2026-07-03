import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Volume2 } from 'lucide-react';
import AudioButton from '@/components/AudioButton';
import { getKidsVocabulary, saveKidsVocabulary } from '@/utils/storageManager';
import { kidsVocabularyData } from '@/data/kidsVocabularyData';
import { Button } from '@/components/ui/button';

const KidsVocabulary = ({ isAdmin, onSwitchToImport }) => {
  const [vocab, setVocab] = useState([]);
  const [filteredVocab, setFilteredVocab] = useState([]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [displayCount, setDisplayCount] = useState(20);

  // Initial Data Load & Merge
  useEffect(() => {
    const loadData = () => {
      const stored = getKidsVocabulary();
      // Merge static data with stored (imported) data
      // Ensure no duplicates by ID if possible, but static IDs are short (e.g. 'an1') and imports are timestamps
      
      // Use a Map to prioritize stored items if they override static ones (though unlikely here)
      const mergedMap = new Map();
      
      // 1. Add static data
      kidsVocabularyData.forEach(item => mergedMap.set(item.id, item));
      
      // 2. Add stored data (mostly dynamic imports)
      stored.forEach(item => mergedMap.set(item.id, item));

      setVocab(Array.from(mergedMap.values()));
    };

    loadData();
    // Listen for updates from importer
    window.addEventListener('kidsDataUpdated', loadData); // Custom event triggers re-load
    return () => window.removeEventListener('kidsDataUpdated', loadData);
  }, []);

  // Filtering Logic
  useEffect(() => {
    let result = vocab;

    // Category Filter
    if (filterCategory !== 'all') {
      result = result.filter(v => v.category === filterCategory);
    }

    // Search Filter
    if (searchTerm.trim() !== '') {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(v => 
        v.german.toLowerCase().includes(lowerSearch) || 
        v.arabic.includes(lowerSearch)
      );
    }

    setFilteredVocab(result);
    setDisplayCount(20); // Reset pagination on filter change
  }, [vocab, filterCategory, searchTerm]);

  const categories = [
    { id: 'all', label: 'الكل', icon: '🌟' },
    { id: 'animals', label: 'حيوانات', icon: '🦁' },
    { id: 'colors', label: 'ألوان', icon: '🎨' },
    { id: 'food', label: 'طعام', icon: '🍎' },
    { id: 'transport', label: 'مواصلات', icon: '🚗' },
    { id: 'home', label: 'منزل', icon: '🏠' },
    { id: 'shapes', label: 'أشكال', icon: '🔶' },
    { id: 'school', label: 'مدرسة', icon: '🎒' },
  ];

  return (
    <div className="space-y-8">
      {/* Controls Container */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-6 sticky top-24 z-10 backdrop-blur-md bg-white/90">
        
        {/* Top Bar: Search & Admin Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="ابحث عن كلمة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-3 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all text-right font-bold text-slate-700 placeholder:font-normal"
            />
          </div>
          
          {isAdmin && (
            <Button 
              onClick={onSwitchToImport}
              className="bg-slate-800 text-white rounded-xl hover:bg-slate-700 font-bold"
            >
              إدارة واستيراد المفردات
            </Button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide py-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`
                px-5 py-3 rounded-2xl font-black whitespace-nowrap transition-all border-2 flex items-center gap-2
                ${filterCategory === cat.id 
                  ? 'bg-yellow-400 border-yellow-400 text-yellow-900 shadow-lg scale-105' 
                  : 'bg-white border-slate-100 text-slate-500 hover:border-yellow-200 hover:text-yellow-600 hover:bg-yellow-50'}
              `}
            >
              <span className="text-xl">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vocabulary Grid */}
      {filteredVocab.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredVocab.slice(0, displayCount).map((word, index) => (
              <motion.div
                key={word.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="bg-white rounded-3xl p-6 border-b-8 border-slate-100 shadow-sm hover:translate-y-1 hover:border-b-4 hover:shadow-md transition-all group relative overflow-hidden"
              >
                {/* Category Badge */}
                <span className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-wider text-slate-300 bg-slate-50 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                  {word.category}
                </span>

                <div className="text-6xl mb-6 text-center group-hover:scale-110 transition-transform duration-300 drop-shadow-sm filter flex justify-center h-20 items-center">
                  {word.image}
                </div>
                
                <div className="text-center space-y-1 mb-4">
                  <h3 className="text-xl font-black text-slate-800 line-clamp-1" title={word.german}>{word.german}</h3>
                  <p className="text-base font-bold text-slate-400 line-clamp-1">{word.arabic}</p>
                </div>
                
                <div className="flex justify-center">
                  <AudioButton 
                    text={word.german} 
                    size={20} 
                    className="bg-blue-50 hover:bg-blue-500 hover:text-white text-blue-500 p-3 w-10 h-10 rounded-full transition-all shadow-sm" 
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Load More Button */}
          {filteredVocab.length > displayCount && (
            <div className="flex justify-center pt-8">
              <Button 
                onClick={() => setDisplayCount(prev => prev + 20)}
                variant="outline"
                className="rounded-full px-8 py-6 text-lg font-bold border-2 border-blue-100 text-blue-600 hover:bg-blue-50 hover:border-blue-200"
              >
                عرض المزيد ({filteredVocab.length - displayCount})
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <p className="text-xl font-bold text-slate-400">لا توجد كلمات مطابقة للبحث 😕</p>
          <button 
            onClick={() => {setFilterCategory('all'); setSearchTerm('');}}
            className="mt-4 text-blue-500 font-bold hover:underline"
          >
            مسح الفلتر
          </button>
        </div>
      )}
    </div>
  );
};

export default KidsVocabulary;
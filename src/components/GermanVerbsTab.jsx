import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, ChevronDown, ChevronUp, FileUp } from 'lucide-react';
import { getImportedVerbs } from '@/utils/storageManager';
import VerbConjugationDetail from './VerbConjugationDetail';

const GermanVerbsTab = () => {
  const [verbs, setVerbs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [expandedVerbId, setExpandedVerbId] = useState(null);

  useEffect(() => {
    setVerbs(getImportedVerbs());
  }, []);

  const verbTypes = ['All', 'Regular', 'Strong', 'Irregular', 'Modal', 'Separable'];

  const filteredVerbs = verbs.filter(verb => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = verb.infinitive.toLowerCase().includes(searchLower) || 
                          verb.translation.includes(searchTerm);
    const matchesFilter = filterType === 'All' || 
                          (verb.type && verb.type.toLowerCase() === filterType.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  if (verbs.length === 0) {
      return (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
               <FileUp className="h-16 w-16 text-slate-200 mb-6" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">لا توجد أفعال متاحة</h3>
                <p className="text-slate-500 mb-6 max-w-lg">لم يتم العثور على أفعال جاهزة للعرض في هذا القسم حاليًا.</p>
          </div>
      );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 min-h-[600px] p-6">
      {/* Header & Controls */}
      <div className="mb-8 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-2">
              <BookOpen className="text-blue-600" />
              المكتبة الشاملة للأفعال الألمانية
            </h2>
            <p className="text-slate-600 text-sm">
              استكشف تصريفات واستخدامات أكثر من {verbs.length} فعل.
            </p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="ابحث عن فعل (مثال: sein, يعمل)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white shadow-sm"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {verbTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                filterType === type 
                  ? 'bg-blue-600 text-white shadow-md transform scale-105' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {type === 'All' ? 'الكل' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Verbs List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
        {filteredVerbs.length > 0 ? (
          filteredVerbs.map((verb) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              key={verb.id}
              className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                expandedVerbId === verb.id 
                  ? 'col-span-1 md:col-span-2 lg:col-span-3 bg-white border-blue-200 shadow-xl ring-1 ring-blue-100 z-10' 
                  : 'bg-white border-slate-100 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <div 
                onClick={() => setExpandedVerbId(expandedVerbId === verb.id ? null : verb.id)}
                className="p-5 cursor-pointer flex justify-between items-center bg-white hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100/50 flex items-center justify-center text-blue-700 font-black text-xl">
                        {verb.infinitive.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">{verb.infinitive}</h3>
                        <p className="text-slate-500 font-medium text-sm">{verb.translation}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                   <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider ${
                     verb.type === 'Irregular' ? 'bg-red-100 text-red-700' :
                     verb.type === 'Strong' ? 'bg-orange-100 text-orange-700' :
                     'bg-green-100 text-green-700'
                   }`}>
                     {verb.type}
                   </span>
                   {expandedVerbId === verb.id ? <ChevronUp size={20} className="text-blue-500" /> : <ChevronDown size={20} className="text-slate-300" />}
                </div>
              </div>

              {/* Expanded View */}
              <AnimatePresence>
                {expandedVerbId === verb.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-slate-100 bg-slate-50/30"
                  >
                    <div className="p-4 md:p-6">
                        <VerbConjugationDetail verb={verb} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Search className="mx-auto h-12 w-12 mb-4 opacity-20" />
            <h3 className="text-lg font-bold text-slate-600 mb-1">لا توجد نتائج</h3>
            <p>لم نجد أي أفعال تطابق بحثك. جرب كلمة أخرى.</p>
          </div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GermanVerbsTab;

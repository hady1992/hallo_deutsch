import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, BookOpen } from 'lucide-react';
import { verbsComprehensive } from '@/data/verbsComprehensive';

const VerbsTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [expandedVerb, setExpandedVerb] = useState(null);

  const verbTypes = ['All', 'Regular', 'Strong', 'Irregular', 'Modal', 'Auxiliary', 'Separable', 'Reflexive'];

  const filteredVerbs = verbsComprehensive.filter(verb => {
    const matchesSearch = verb.infinitive.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          verb.translation.includes(searchTerm);
    const matchesFilter = filterType === 'All' || verb.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 min-h-[600px] p-6">
      {/* Header & Controls */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="text-blue-600" />
            قاموس الأفعال الشامل
          </h2>
          <div className="relative w-full md:w-72">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="ابحث عن فعل (ألماني أو عربي)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {verbTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filterType === type 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type === 'All' ? 'الكل' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Verbs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVerbs.length > 0 ? (
          filteredVerbs.map((verb) => (
            <motion.div
              layout
              key={verb.id}
              onClick={() => setExpandedVerb(expandedVerb === verb.id ? null : verb.id)}
              className={`cursor-pointer rounded-xl border transition-all duration-300 overflow-hidden ${
                expandedVerb === verb.id 
                  ? 'col-span-1 md:col-span-2 lg:col-span-3 bg-blue-50 border-blue-200 shadow-lg ring-1 ring-blue-200' 
                  : 'bg-white border-slate-100 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <div className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{verb.infinitive}</h3>
                  <p className="text-slate-500">{verb.translation}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                   <span className="text-xs px-2 py-1 bg-white border border-slate-200 rounded-full text-slate-500">
                     {verb.type}
                   </span>
                   {verb.level && (
                     <span className="text-xs px-2 py-1 bg-slate-800 text-white rounded-full">
                       {verb.level}
                     </span>
                   )}
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {expandedVerb === verb.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-blue-100 bg-white"
                  >
                    <div className="p-6 grid gap-8">
                      {/* Conjugation Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {['präsens', 'präteritum', 'perfekt', 'futur'].map((tense) => (
                          <div key={tense} className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                            <h4 className="font-bold text-blue-700 mb-3 capitalize border-b border-slate-200 pb-2">
                              {tense}
                            </h4>
                            <ul className="space-y-1 text-sm" dir="ltr">
                              {Object.entries(verb.conjugation[tense] || {}).map(([person, form]) => (
                                <li key={person} className="flex justify-between">
                                  <span className="text-slate-400 w-12">{person}</span>
                                  <span className="font-medium text-slate-700">{form}</span>
                                </li>
                              ))}
                            </ul>
                            {/* Example for Tense */}
                            {verb.examples && verb.examples[tense] && (
                                <div className="mt-3 pt-2 border-t border-slate-200/50">
                                    <p className="text-xs text-slate-600 italic">"{verb.examples[tense].de}"</p>
                                    <p className="text-xs text-slate-400 mt-0.5" dir="rtl">{verb.examples[tense].ar}</p>
                                </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* Notes & Collocations */}
                      <div className="grid md:grid-cols-2 gap-6">
                         {verb.notes && (
                             <div className="bg-amber-50 p-4 rounded-xl text-sm">
                                 <h4 className="font-bold text-amber-800 mb-2">ملاحظات:</h4>
                                 <p className="text-amber-900">{verb.notes}</p>
                             </div>
                         )}
                         {verb.collocations && (
                             <div className="bg-emerald-50 p-4 rounded-xl text-sm">
                                 <h4 className="font-bold text-emerald-800 mb-2">تعبيرات شائعة:</h4>
                                 <ul className="list-disc list-inside text-emerald-900">
                                     {verb.collocations.map((c, i) => <li key={i}>{c}</li>)}
                                 </ul>
                             </div>
                         )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Search className="mx-auto h-10 w-10 mb-2 opacity-50" />
            <p>لا توجد أفعال مطابقة للبحث</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerbsTab;
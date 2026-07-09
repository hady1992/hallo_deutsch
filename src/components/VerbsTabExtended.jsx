import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, ChevronDown, ChevronUp, FileUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getImportedVerbs } from '@/utils/storageManager';
import { dedupeByKey, getVerbDedupKey } from '@/utils/contentDedupUtils';

const VerbsTabExtended = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [expandedVerb, setExpandedVerb] = useState(null);
  const [importedVerbs, setImportedVerbs] = useState([]);

  useEffect(() => {
    setImportedVerbs(getImportedVerbs());
    const handleUpdate = () => setImportedVerbs(getImportedVerbs());
    window.addEventListener('dataImported', handleUpdate);
    return () => window.removeEventListener('dataImported', handleUpdate);
  }, []);

  // Use only imported verbs
  const allVerbs = useMemo(() => dedupeByKey(importedVerbs, getVerbDedupKey), [importedVerbs]);

  const verbTypes = ['All', 'Regular', 'Strong', 'Irregular', 'Modal', 'Auxiliary', 'Separable'];

  const filteredVerbs = allVerbs.filter(verb => {
    const matchesSearch = (verb.infinitive || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (verb.translation || '').includes(searchTerm);
    const matchesFilter = filterType === 'All' || (verb.type && verb.type.toLowerCase() === filterType.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'regular': return 'bg-green-100 text-green-700 border-green-200';
      case 'strong': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'irregular': return 'bg-red-100 text-red-700 border-red-200';
      case 'modal': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const pronouns = ['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie'];
  const tenses = ['Präsens', 'Präteritum', 'Perfekt', 'Imperativ']; 

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 min-h-[600px] p-6">
      {/* Header & Controls */}
      <div className="mb-8 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-2">
              <BookOpen className="text-blue-600" />
              قاموس الأفعال (المستوردة)
            </h2>
            <p className="text-slate-600 text-sm">
              تصفح الأفعال الألمانية التي تمت إضافتها ({allVerbs.length} فعل)
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
             <div className="relative w-full md:w-64">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                type="text"
                placeholder="بحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {verbTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filterType === type 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {type === 'All' ? 'الكل' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Verbs List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredVerbs.length > 0 ? (
          filteredVerbs.map((verb) => (
            <motion.div
              layout
              key={verb.id || verb.infinitive}
              className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                expandedVerb === verb.id 
                  ? 'bg-white border-blue-200 shadow-xl ring-1 ring-blue-100' 
                  : 'bg-white border-slate-100 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <div 
                onClick={() => setExpandedVerb(expandedVerb === verb.id ? null : verb.id)}
                className="p-5 cursor-pointer flex flex-col md:flex-row justify-between items-center gap-4 bg-white"
              >
                <div className="flex items-center gap-4 w-full">
                    <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xl shrink-0">
                        {(verb.infinitive || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="german-text text-xl font-bold text-slate-800">{verb.infinitive}</h3>
                            <Badge variant="outline" className={getTypeColor(verb.type)}>
                                {verb.type || 'Unknown'}
                            </Badge>
                             {verb.level && <Badge variant="secondary" className="text-xs">{verb.level}</Badge>}
                        </div>
                        <p className="text-slate-500 font-medium">{verb.translation}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    {expandedVerb === verb.id ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                </div>
              </div>

              {/* Expanded Details: Conjugation Table */}
              <AnimatePresence>
                {expandedVerb === verb.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-slate-100 bg-slate-50/50"
                  >
                    <div className="p-4 md:p-6 overflow-x-auto">
                        <table className="w-full text-sm border-collapse bg-white rounded-lg shadow-sm">
                             <thead>
                                 <tr className="bg-slate-100 border-b border-slate-200">
                                     <th className="p-3 text-left font-bold text-slate-600 border-r border-slate-200 w-32">الضمير</th>
                                     {tenses.map(tense => (
                                         <th key={tense} className="german-text p-3 text-center font-bold text-slate-700 min-w-[120px]">{tense}</th>
                                     ))}
                                 </tr>
                             </thead>
                             <tbody>
                                 {pronouns.map((pronoun, idx) => (
                                     <tr key={pronoun} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                         <td className="p-3 font-medium text-slate-500 border-r border-slate-100 border-b border-slate-100">{pronoun}</td>
                                         {tenses.map(tense => {
                                             // Safe access to nested properties
                                             let val = '-';
                                             if (verb.conjugation && verb.conjugation[tense]) {
                                                 val = verb.conjugation[tense][pronoun] || verb.conjugation[tense][pronoun.split('/')[0]] || '-';
                                             } else if (verb.conjugations && verb.conjugations[tense]) {
                                                 // Fallback for plural key 'conjugations'
                                                 val = verb.conjugations[tense][pronoun] || '-';
                                             }
                                             
                                             return (
                                                 <td key={tense} className="german-text p-3 text-center border-b border-slate-100 text-slate-800 font-medium">
                                                     {val}
                                                 </td>
                                             );
                                         })}
                                     </tr>
                                 ))}
                             </tbody>
                        </table>

                        {/* Examples */}
                        {verb.examples && verb.examples.length > 0 && (
                            <div className="mt-6 bg-white p-4 rounded-xl border border-slate-200">
                                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <BookOpen size={16} className="text-blue-500" /> أمثلة
                                </h4>
                                <ul className="space-y-2">
                                    {verb.examples.map((ex, i) => (
                                        <li key={i} className="text-sm text-slate-700 border-l-2 border-blue-200 pl-3">
                                            {typeof ex === 'string' ? ex : (
                                                <>
                                                    <span className="german-text block font-medium">{ex.de || ex.german}</span>
                                                    <span className="block text-slate-500 text-xs">{ex.ar || ex.arabic}</span>
                                                </>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        ) : (
          <div className="py-16 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
             {allVerbs.length === 0 ? (
                 <>
                    <FileUp className="mx-auto h-12 w-12 mb-4 opacity-20" />
                    <h3 className="text-lg font-bold text-slate-600 mb-2">لا توجد أفعال مستوردة</h3>
                    <p className="mx-auto mb-4 max-w-md">لا توجد أفعال متاحة حاليًا في هذا القسم.</p>
                 </>
             ) : (
                 <>
                    <Search className="mx-auto h-12 w-12 mb-4 opacity-20" />
                    <p>لا توجد نتائج تطابق بحثك</p>
                 </>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerbsTabExtended;

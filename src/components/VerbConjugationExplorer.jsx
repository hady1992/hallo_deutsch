import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Printer, Play, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getImportedVerbs } from '@/utils/storageManager';
import { germanVerbsComprehensive } from '@/data/germanVerbsComprehensive';

// Defined order for sorting, everything else comes after
const TENSE_ORDER = ['Präsens', 'Präteritum', 'Perfekt', 'Plusquamperfekt', 'Futur I', 'Futur II', 'Konjunktiv I', 'Konjunktiv II'];
const PRONOUN_ORDER = ['ich', 'du', 'er', 'sie', 'es', 'er/sie/es', 'wir', 'ihr', 'Sie', 'sie/Sie'];

const VerbConjugationExplorer = () => {
  const [verbs, setVerbs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [selectedVerb, setSelectedVerb] = useState(null);
  const [activeTense, setActiveTense] = useState('');

  useEffect(() => {
    const imported = getImportedVerbs();
    const defaults = Array.isArray(germanVerbsComprehensive) ? germanVerbsComprehensive : [];
    setVerbs(imported.length > 0 ? imported : defaults);
  }, []);

  const verbTypes = ['All', 'Weak', 'Strong', 'Irregular', 'Modal'];

  const filteredVerbs = verbs.filter(verb => {
    const matchesSearch = 
      verb.infinitive.toLowerCase().includes(searchTerm.toLowerCase()) || 
      verb.translation.includes(searchTerm);
    const matchesFilter = filterType === 'All' || 
                          (verb.type && verb.type.toLowerCase() === filterType.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  // Determine available tenses for selected verb
  const availableTenses = selectedVerb ? Object.keys(selectedVerb.conjugations || {}).sort((a, b) => {
    const idxA = TENSE_ORDER.indexOf(a);
    const idxB = TENSE_ORDER.indexOf(b);
    if (idxA === -1 && idxB === -1) return a.localeCompare(b);
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  }) : [];

  // Set default active tense when verb changes
  useEffect(() => {
    if (selectedVerb && availableTenses.length > 0) {
      if (availableTenses.includes('Präsens')) setActiveTense('Präsens');
      else setActiveTense(availableTenses[0]);
    }
  }, [selectedVerb]);

  // Get pronouns for current active tense
  const currentConjugations = selectedVerb?.conjugations?.[activeTense] || {};
  const currentPronouns = Object.keys(currentConjugations).sort((a, b) => {
    const idxA = PRONOUN_ORDER.indexOf(a);
    const idxB = PRONOUN_ORDER.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (a === 'ich') return -1;
    if (b === 'ich') return 1;
    return a.localeCompare(b);
  });

  if (verbs.length === 0) {
      return (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
               <FileUp className="h-16 w-16 text-slate-200 mb-6" />
               <h3 className="text-xl font-bold text-slate-800 mb-2">قاعدة الأفعال العامة غير جاهزة بعد</h3>
               <p className="text-slate-500 mb-6 max-w-lg">
                لا توجد أفعال مستوردة أو قاعدة افتراضية متاحة حاليًا. يمكن للمدير إضافة ملف أفعال من لوحة التحكم، وباقي صفحات القواعد والمفردات تعمل بشكل طبيعي.
               </p>
               <Button variant="outline" onClick={() => window.location.href = '/grammar'}>العودة إلى القواعد</Button>
          </div>
      );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 min-h-0 md:min-h-[800px] flex flex-col md:flex-row">
      
      {/* Sidebar List */}
      <div className="w-full md:w-1/3 border-l border-slate-200 bg-slate-50 flex flex-col max-h-[70vh] md:max-h-none">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h2 className="font-bold text-lg mb-4 text-slate-800">مستكشف الأفعال</h2>
          <div className="relative mb-3">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="ابحث..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {verbTypes.map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`text-xs px-2 py-1 rounded-md transition-colors ${filterType === type ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
              >
                {type === 'All' ? 'الكل' : type}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2 no-scrollbar">
          {filteredVerbs.length > 0 ? (
            filteredVerbs.map((verb, idx) => (
                <div 
                key={verb.id || idx}
                onClick={() => setSelectedVerb(verb)}
                className={`p-3 rounded-xl cursor-pointer transition-all border ${selectedVerb?.id === verb.id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-transparent hover:bg-slate-100'}`}
                >
                <div className="flex justify-between items-center">
                    <div>
                    <h3 className={`german-text font-bold ${selectedVerb?.id === verb.id ? 'text-blue-700' : 'text-slate-800'}`}>{verb.infinitive}</h3>
                    <p className="text-xs text-slate-500">{verb.translation}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] h-5">{verb.type}</Badge>
                </div>
                </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400 text-sm">
                لا توجد نتائج
            </div>
          )}
        </div>
      </div>

      {/* Main Detail View */}
      <div className="w-full md:w-2/3 bg-white p-6 md:p-8 flex flex-col">
        {selectedVerb ? (
          <motion.div 
            key={selectedVerb.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-8 border-b border-slate-100 pb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="german-text text-4xl font-black text-slate-900">{selectedVerb.infinitive}</h1>
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none text-sm px-3 py-1">{selectedVerb.type}</Badge>
                </div>
                <p className="text-2xl text-slate-500 font-medium">{selectedVerb.translation}</p>
              </div>
              <Button variant="outline" size="icon" onClick={() => window.print()}>
                <Printer size={18} />
              </Button>
            </div>

            {/* Tense Selector (Dynamic) */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
              {availableTenses.map(tense => (
                <button
                  key={tense}
                  onClick={() => setActiveTense(tense)}
                  className={`german-text px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${
                    activeTense === tense 
                    ? 'bg-slate-900 text-white shadow-lg' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {tense}
                </button>
              ))}
            </div>

            {/* Dynamic Conjugation Table */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-slate-200">
                 <div className="p-0">
                    <div className="bg-slate-100/50 p-2 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">المفرد</div>
                    {currentPronouns.slice(0, Math.ceil(currentPronouns.length / 2)).map(pronoun => (
                        <div key={pronoun} className="flex justify-between items-center p-4 border-b last:border-0 border-slate-100 hover:bg-white transition-colors">
                            <span className="text-slate-400 font-mono text-sm w-20">{pronoun}</span>
                            <span className="german-text text-lg font-bold text-slate-800">{currentConjugations[pronoun] || '-'}</span>
                        </div>
                    ))}
                 </div>
                 <div className="p-0">
                    <div className="bg-slate-100/50 p-2 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">الجمع / الصيغة الرسمية</div>
                    {currentPronouns.slice(Math.ceil(currentPronouns.length / 2)).map(pronoun => (
                        <div key={pronoun} className="flex justify-between items-center p-4 border-b last:border-0 border-slate-100 hover:bg-white transition-colors">
                            <span className="text-slate-400 font-mono text-sm w-20">{pronoun}</span>
                            <span className="german-text text-lg font-bold text-slate-800">{currentConjugations[pronoun] || '-'}</span>
                        </div>
                    ))}
                 </div>
              </div>
            </div>

            {/* Examples & Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <Play size={16} className="fill-blue-600 text-blue-600" /> 
                  مثال ({activeTense})
                </h3>
                {selectedVerb.examples?.[activeTense] ? (
                  <div>
                    <p className="german-text text-lg font-bold text-slate-800 mb-2">"{selectedVerb.examples[activeTense].de}"</p>
                    <p className="text-slate-600">{selectedVerb.examples[activeTense].ar}</p>
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">لا يوجد مثال متوفر.</p>
                )}
              </div>

              {selectedVerb.notes && (
                <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
                  <h3 className="font-bold text-amber-900 mb-2 text-sm uppercase">ملاحظات</h3>
                  <p className="text-amber-800 text-sm leading-relaxed">{selectedVerb.notes}</p>
                </div>
              )}
            </div>

          </motion.div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
            <Search size={64} className="mb-4 opacity-20" />
            <p className="text-xl font-medium text-slate-400">اختر فعلاً من القائمة لعرض التفاصيل</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerbConjugationExplorer;

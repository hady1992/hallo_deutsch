import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const VerbDisplayComponent = ({ verbs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedVerb, setExpandedVerb] = useState(null);

  const safeVerbs = (Array.isArray(verbs) ? verbs : [])
    .filter((verb) => verb && typeof verb === 'object' && !Array.isArray(verb))
    .map((verb) => ({
      ...verb,
      infinitive: typeof verb.infinitive === 'string' ? verb.infinitive : '',
      translation: typeof verb.translation === 'string' ? verb.translation : '',
    }));
  const normalizedSearch = searchTerm.toLowerCase();
  const filteredVerbs = safeVerbs.filter(verb =>
    verb.infinitive.toLowerCase().includes(normalizedSearch) ||
    verb.translation.toLowerCase().includes(normalizedSearch)
  );

  // Expanded Tense Configuration to handle data variations
  const tenses = [
    { 
      id: 'präsens', 
      label: 'Präsens (الحاضر)', 
      dataKeys: ['Präsens', 'präsens', 'prasens'] 
    },
    { 
      id: 'präteritum', 
      label: 'Präteritum (الماضي البسيط)', 
      dataKeys: ['Präteritum', 'präteritum', 'prateritum', 'impf'] 
    },
    { 
      id: 'perfekt', 
      label: 'Perfekt (الماضي التام)', 
      dataKeys: ['Perfekt', 'perfekt'] 
    },
    { 
      id: 'futurI', 
      label: 'Futur I (المستقبل)', 
      dataKeys: ['Futur I', 'Futur 1', 'futurI', 'futur I', 'futur'] 
    }
  ];

  // Expanded Pronouns List (7 items as requested)
  const pronouns = [
    { label: 'ich', keys: ['ich'] },
    { label: 'du', keys: ['du'] },
    { label: 'er/sie/es', keys: ['er/sie/es', 'er_sie_es', 'er', 'sie', 'es'] }, // Grouped 3rd person singular
    { label: 'wir', keys: ['wir'] },
    { label: 'ihr', keys: ['ihr'] },
    { label: 'sie (Plural)', keys: ['sie', 'sie/Sie', 'sie_Sie', 'siePl'] },
    { label: 'Sie (Formal)', keys: ['Sie', 'sie/Sie', 'sie_Sie', 'sieFormal'] }
  ];

  const getConjugation = (verb, tenseConfig, pronounConfig) => {
    // 1. Get Conjugation Object (handle legacy vs new structure)
    const conjugationSource = verb.conjugations || verb.conjugation;
    const allConjugations = conjugationSource && typeof conjugationSource === 'object' && !Array.isArray(conjugationSource)
      ? conjugationSource
      : {};
    
    // 2. Find the specific Tense Data Object using possible keys
    let tenseData = null;
    for (const key of tenseConfig.dataKeys) {
      if (allConjugations[key]) {
        tenseData = allConjugations[key];
        break;
      }
    }

    if (!tenseData || typeof tenseData !== 'object' || Array.isArray(tenseData)) return '-';

    // 3. Find the specific Pronoun Value using possible keys
    for (const key of pronounConfig.keys) {
      if (typeof tenseData[key] === 'string' || typeof tenseData[key] === 'number') return String(tenseData[key]);
    }
    
    // 4. Special Fallback: If pronoun is 'Sie (Formal)' or 'sie (Plural)' and we only found 'sie/Sie' earlier
    if (pronounConfig.label.includes('sie') || pronounConfig.label.includes('Sie')) {
         if (tenseData['sie/Sie']) return tenseData['sie/Sie'];
         if (tenseData['sie_Sie']) return tenseData['sie_Sie'];
    }

    return '-';
  };

  const getExampleText = (verb, tenseConfig) => {
    if (!verb.examples || typeof verb.examples !== 'object' || Array.isArray(verb.examples)) return '';
    const example = verb.examples[tenseConfig.id] || verb.examples[tenseConfig.dataKeys[0]];
    if (typeof example === 'string' || typeof example === 'number') return String(example);
    if (example && typeof example === 'object' && !Array.isArray(example)) {
      return typeof example.de === 'string' ? example.de : '';
    }
    return '';
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="ابحث عن فعل (مثال: gehen, يذهب)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pr-12 pl-4 py-4 rounded-xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-lg"
        />
      </div>

      {/* Verbs List */}
      <div className="grid gap-4">
        {filteredVerbs.length > 0 ? (
          filteredVerbs.map((verb) => (
            <motion.div
              layout
              key={verb.id || verb.infinitive}
              className={cn(
                "bg-white rounded-xl border transition-all overflow-hidden",
                expandedVerb === (verb.id || verb.infinitive) 
                  ? "border-blue-500 ring-1 ring-blue-500 shadow-md" 
                  : "border-slate-200 shadow-sm hover:border-blue-300"
              )}
            >
              <div
                onClick={() => setExpandedVerb(expandedVerb === (verb.id || verb.infinitive) ? null : (verb.id || verb.infinitive))}
                className="p-4 cursor-pointer flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg shrink-0">
                    {verb.infinitive.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="german-text text-xl font-bold text-slate-900">{verb.infinitive}</h3>
                    <p className="text-slate-500">{verb.translation}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={cn(
                    verb.type === 'irregular' ? 'bg-red-50 text-red-600 border-red-100' : 
                    verb.type === 'strong' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                    'bg-green-50 text-green-600 border-green-100'
                  )}>
                    {verb.type || 'weak'}
                  </Badge>
                  {expandedVerb === (verb.id || verb.infinitive) ? <ChevronUp className="text-blue-500" /> : <ChevronDown className="text-slate-300" />}
                </div>
              </div>

              <AnimatePresence>
                {expandedVerb === (verb.id || verb.infinitive) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-100 bg-slate-50/50"
                  >
                    <div className="p-6 grid gap-8">
                      {tenses.map((tense) => (
                        <div key={tense.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                          <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                            <span className="font-bold text-slate-700 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                {tense.label}
                            </span>
                            {getExampleText(verb, tense) && (
                                <span className="german-text hidden sm:inline-block text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-200 max-w-[200px] truncate">
                                    Example: {getExampleText(verb, tense)}
                                </span>
                            )}
                          </div>
                          
                          {/* Responsive Grid for Conjugations */}
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-slate-100">
                             {pronouns.map((pronoun, idx) => (
                                 <div 
                                    key={pronoun.label} 
                                    className={cn(
                                        "p-3 text-center hover:bg-blue-50/50 transition-colors flex flex-col justify-center min-h-[80px]",
                                        // Specific styling for the last item (Sie Formal) to span col if needed on small screens
                                        idx === pronouns.length - 1 ? "col-span-2 md:col-span-1" : ""
                                    )}
                                 >
                                     <div className="text-xs text-slate-400 mb-1.5 font-medium uppercase tracking-wider">{pronoun.label}</div>
                                     <div className="german-text font-bold text-slate-800 text-sm break-words px-1">
                                         {getConjugation(verb, tense, pronoun)}
                                     </div>
                                 </div>
                             ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Search className="mx-auto h-10 w-10 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">لا توجد نتائج مطابقة لبحثك.</p>
            <p className="text-xs text-slate-400 mt-1">جرب كلمات مفتاحية أخرى</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerbDisplayComponent;

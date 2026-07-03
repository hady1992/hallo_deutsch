import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const VerbConjugationTable = ({ conjugations }) => {
  const [activeTense, setActiveTense] = useState('');
  const [copied, setCopied] = useState(null);

  // Sort tenses logically
  const TENSE_ORDER = ['Präsens', 'Präteritum', 'Perfekt', 'Plusquamperfekt', 'Futur I', 'Futur II', 'Konjunktiv I', 'Konjunktiv II'];
  const availableTenses = Object.keys(conjugations || {}).sort((a, b) => {
    const idxA = TENSE_ORDER.indexOf(a);
    const idxB = TENSE_ORDER.indexOf(b);
    if (idxA === -1 && idxB === -1) return a.localeCompare(b);
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });

  useEffect(() => {
    if (availableTenses.length > 0 && !activeTense) {
        if (availableTenses.includes('Präsens')) setActiveTense('Präsens');
        else setActiveTense(availableTenses[0]);
    }
  }, [conjugations, availableTenses, activeTense]);


  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const PRONOUN_ORDER = ['ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'Sie', 'er/sie/es', 'sie/Sie'];
  const currentConjugations = conjugations[activeTense] || {};
  const pronouns = Object.keys(currentConjugations).sort((a, b) => {
    const idxA = PRONOUN_ORDER.indexOf(a);
    const idxB = PRONOUN_ORDER.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (a === 'ich') return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Tense Selection */}
      <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50 p-1 no-scrollbar gap-1">
        {availableTenses.map((tense) => (
          <button
            key={tense}
            onClick={() => setActiveTense(tense)}
            className={`flex-1 min-w-[100px] py-2 px-4 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTense === tense
                ? 'bg-white text-blue-600 shadow-sm border border-slate-100'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            {tense}
          </button>
        ))}
      </div>

      {/* Conjugation Table */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTense}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid gap-2"
          >
            {pronouns.map((pronoun) => {
              const conjugation = currentConjugations[pronoun] || '-';
              return (
                <div 
                  key={pronoun} 
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-slate-400 font-medium w-16 text-sm">{pronoun}</span>
                    <span className="text-slate-800 font-bold">{conjugation}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0"
                    onClick={() => handleCopy(`${pronoun} ${conjugation}`, `${activeTense}-${pronoun}`)}
                  >
                    {copied === `${activeTense}-${pronoun}` ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-slate-400" />
                    )}
                  </Button>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VerbConjugationTable;
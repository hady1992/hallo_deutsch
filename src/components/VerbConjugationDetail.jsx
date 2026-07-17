import React, { useState, useEffect } from 'react';
import { Copy, Check, Volume2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const VerbConjugationDetail = ({ verb }) => {
  const [activeTense, setActiveTense] = useState('');
  const [copied, setCopied] = useState(null);

  // Sorting constants
  const TENSE_ORDER = ['Präsens', 'Präteritum', 'Perfekt', 'Plusquamperfekt', 'Futur I', 'Futur II', 'Konjunktiv I', 'Konjunktiv II'];
  const PRONOUN_ORDER = ['ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'Sie', 'er/sie/es', 'sie/Sie'];

  // Determine available tenses
  const availableTenses = Object.keys(verb.conjugations || {}).sort((a, b) => {
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
  }, [verb, availableTenses, activeTense]);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const currentConjugations = verb.conjugations?.[activeTense] || {};

  // Sort pronouns
  const pronouns = Object.keys(currentConjugations).sort((a, b) => {
    const idxA = PRONOUN_ORDER.indexOf(a);
    const idxB = PRONOUN_ORDER.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (a === 'ich') return -1;
    if (b === 'ich') return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Verb Header */}
      <div className="p-6 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">{verb.infinitive}</h3>
              <Badge variant="outline" className="text-sm font-medium border-slate-300 text-slate-500">
                {verb.type}
              </Badge>
            </div>
            <p className="text-xl text-amber-600 font-medium">{verb.translation}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Volume2 size={16} /> نطق
            </Button>
          </div>
        </div>
      </div>

      {/* Tense Tabs */}
      <div className="flex overflow-x-auto p-2 bg-slate-50/50 border-b border-slate-100 gap-2 no-scrollbar">
        {availableTenses.map((tense) => (
          <button
            key={tense}
            onClick={() => setActiveTense(tense)}
            className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTense === tense
                ? 'bg-white text-red-700 shadow-sm border border-red-200'
                : 'text-slate-500 hover:bg-slate-100 border border-transparent'
            }`}
          >
            {tense}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
              <span className="font-bold text-slate-700">جدول التصريف</span>
              <span className="text-xs text-slate-400 font-mono uppercase">{activeTense}</span>
            </div>
            <div className="divide-y divide-slate-50">
              {pronouns.map((pronoun) => (
                <div key={pronoun} className="grid grid-cols-3 px-4 py-3 hover:bg-slate-50 transition-colors group">
                  <span className="text-slate-400 font-medium text-sm col-span-1">{pronoun}</span>
                  <span className="text-slate-800 font-bold text-lg col-span-1">{currentConjugations[pronoun] || '-'}</span>
                  <div className="col-span-1 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopy(`${pronoun} ${currentConjugations[pronoun]}`, `${activeTense}-${pronoun}`)}
                      className="text-slate-400 hover:text-amber-600"
                    >
                      {copied === `${activeTense}-${pronoun}` ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Details & Examples */}
          <div className="space-y-6">
            {/* Example Box */}
            <div className="bg-amber-50/50 rounded-xl p-5 border border-amber-100">
              <h4 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                <Info size={16} /> مثال في سياق {activeTense}
              </h4>
              {verb.examples?.[activeTense] ? (
                <div className="space-y-2">
                  <p className="text-lg font-medium text-slate-800" dir="ltr">
                    "{verb.examples[activeTense].de}"
                  </p>
                  <p className="text-slate-600">
                    {verb.examples[activeTense].ar}
                  </p>
                </div>
              ) : (
                <p className="text-slate-400 italic text-sm">لا يوجد مثال متوفر لهذا الزمن.</p>
              )}
            </div>

            {/* Notes */}
            {verb.notes && (
              <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
                <h4 className="font-bold text-amber-800 mb-2 text-sm">ملاحظات هامة</h4>
                <p className="text-amber-900 text-sm leading-relaxed">{verb.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerbConjugationDetail;
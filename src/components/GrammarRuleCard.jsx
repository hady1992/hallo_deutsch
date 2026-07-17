import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Star, AlertTriangle, Lightbulb, PlayCircle } from 'lucide-react';
import { normalizeGrammarRuleForDisplay } from '@/utils/grammarNormalizer';

const GrammarRuleCard = ({ rule }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const normalizedRule = normalizeGrammarRuleForDisplay(rule);
  const title = typeof rule?.title === 'string'
    ? rule.title
    : normalizedRule.title.ar || normalizedRule.title.de || 'قاعدة لغوية';
  const explanationDe = rule?.explanation && typeof rule.explanation === 'object'
    ? rule.explanation.de
    : '';
  const tips = Array.isArray(rule?.tips) ? rule.tips.filter((tip) => typeof tip === 'string') : [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-5 cursor-pointer flex items-center justify-between bg-gradient-to-r from-white to-slate-50 hover:to-slate-100 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg">
            <Star size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            <span className="text-xs font-semibold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
              {rule?.level}
            </span>
          </div>
        </div>
        <ChevronDown 
          className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
        />
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6 border-t border-slate-100 space-y-6 bg-white">
              {/* Explanation */}
              <div className="prose prose-sm max-w-none">
                <p className="text-slate-600 leading-relaxed text-lg font-arabic">{normalizedRule.explanation || 'لا يوجد شرح تفصيلي لهذه القاعدة بعد.'}</p>
                {typeof explanationDe === 'string' && explanationDe && (
                  <p className="text-slate-500 italic mt-2 font-medium bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {explanationDe}
                  </p>
                )}
              </div>

              {/* Examples */}
              <div className="space-y-3">
                <h4 className="font-bold text-indigo-700 flex items-center gap-2">
                  <PlayCircle size={18} /> أمثلة تطبيقية
                </h4>
                <div className="grid gap-3">
                  {normalizedRule.examples.map((ex, idx) => (
                    <div key={idx} className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 hover:border-indigo-200 transition-colors">
                      <p className="text-lg font-medium text-slate-800 mb-1" dir="ltr">{ex.de}</p>
                      <p className="text-slate-600 text-sm">{ex.ar}</p>
                      {ex.note && <p className="text-xs text-indigo-500 mt-2 font-medium">{ex.note}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes & Tips Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Notes */}
                {normalizedRule.notes.length > 0 && (
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                    <h4 className="font-bold text-amber-700 flex items-center gap-2 mb-2">
                      <AlertTriangle size={18} /> ملاحظات هامة
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-amber-900">
                      {normalizedRule.notes.map((note, idx) => (
                        <li key={idx}>{note}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Memory Tips */}
                {tips.length > 0 && (
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                    <h4 className="font-bold text-emerald-700 flex items-center gap-2 mb-2">
                      <Lightbulb size={18} /> تلميحات للحفظ (Merkhilfe)
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-emerald-900">
                      {tips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GrammarRuleCard;

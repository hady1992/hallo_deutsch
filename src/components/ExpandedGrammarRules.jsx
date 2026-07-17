import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, AlertTriangle, Lightbulb, PlayCircle, Table, ChevronDown, List, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { normalizeGrammarRuleForDisplay } from '@/utils/grammarNormalizer';

const ExpandedGrammarRules = ({ rule }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const normalizedRule = normalizeGrammarRuleForDisplay(rule);
  const originalExplanation = rule?.explanation && typeof rule.explanation === 'object'
    ? rule.explanation
    : {};
  const title = typeof rule?.title === 'string'
    ? rule.title
    : normalizedRule.title.ar || normalizedRule.title.de || 'قاعدة لغوية';
  const tips = Array.isArray(rule?.tips) ? rule.tips.filter((tip) => typeof tip === 'string') : [];

  return (
    <Card className={`border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${isExpanded ? 'ring-1 ring-blue-100' : ''}`}>
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="cursor-pointer bg-white p-5 flex items-start justify-between gap-4"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100">
              {rule?.level || 'Grammar'}
            </Badge>
            <h3 className="text-lg font-bold text-slate-800 leading-tight">
              {title}
            </h3>
          </div>
          <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
            {normalizedRule.explanation.substring(0, 100)}{normalizedRule.explanation.length > 100 ? '...' : ''}
          </p>
        </div>
        <div className={`p-2 rounded-full bg-slate-50 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-blue-50 text-blue-600' : 'text-slate-400'}`}>
          <ChevronDown size={20} />
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="border-t border-slate-100 bg-slate-50/50 p-6 space-y-8">
              
              {/* Detailed Explanation */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <List size={16} className="text-blue-500" /> الشرح التفصيلي
                </h4>
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                  <p className="text-slate-700 leading-loose text-lg font-arabic">
                    {normalizedRule.explanation || 'لا يوجد شرح تفصيلي لهذه القاعدة بعد.'}
                  </p>
                  {typeof originalExplanation.de === 'string' && originalExplanation.de && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="german-text text-slate-500 italic text-sm font-medium bg-slate-50 inline-block px-3 py-1 rounded-lg">
                        {originalExplanation.de}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Examples Section */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <PlayCircle size={16} className="text-green-500" /> أمثلة تطبيقية
                </h4>
                <div className="grid gap-3">
                  {normalizedRule.examples.map((ex, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border-l-4 border-green-400 shadow-sm hover:translate-x-1 transition-transform duration-200">
                      <p className="german-text text-lg font-bold text-slate-800 mb-1">{ex.de}</p>
                      <p className="text-slate-600 font-medium">{ex.ar}</p>
                      {ex.note && <p className="text-xs text-green-600 mt-2 bg-green-50 inline-block px-2 py-1 rounded">{ex.note}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tables (if any) */}
              {rule.tables && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                    <Table size={16} className="text-indigo-500" /> جداول توضيحية
                  </h4>
                  <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                     {/* Basic rendering of generic table data structure if provided */}
                     {/* Assume rule.tables is array of objects or simple html-like structure */}
                     <pre className="text-xs text-slate-500 whitespace-pre-wrap font-mono">
                        {JSON.stringify(rule.tables, null, 2)}
                     </pre>
                  </div>
                </div>
              )}

              {/* Tips & Warnings Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {normalizedRule.notes.length > 0 && (
                  <div className="bg-amber-50 p-5 rounded-xl border border-amber-100">
                    <h4 className="font-bold text-amber-800 flex items-center gap-2 mb-3 text-sm">
                      <AlertTriangle size={16} /> تنبيهات وملاحظات
                    </h4>
                    <ul className="space-y-2">
                      {normalizedRule.notes.map((note, i) => (
                        <li key={i} className="text-amber-900 text-sm flex items-start gap-2">
                          <span className="mt-1.5 w-1.5 h-1.5 bg-amber-400 rounded-full flex-shrink-0" />
                          <span className="leading-relaxed">{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {tips.length > 0 && (
                  <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100">
                    <h4 className="font-bold text-emerald-800 flex items-center gap-2 mb-3 text-sm">
                      <Lightbulb size={16} /> تلميحات ذكية
                    </h4>
                    <ul className="space-y-2">
                      {tips.map((tip, i) => (
                        <li key={i} className="text-emerald-900 text-sm flex items-start gap-2">
                          <span className="mt-1.5 w-1.5 h-1.5 bg-emerald-400 rounded-full flex-shrink-0" />
                          <span className="leading-relaxed">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default ExpandedGrammarRules;

import React from 'react';
import { motion } from 'framer-motion';
import { Info, AlertTriangle, BookOpen } from 'lucide-react';

const GrammarDisplayComponent = ({ rule }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-blue-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <BookOpen size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 mb-1">{rule.title.ar}</h3>
            <p className="german-text text-sm font-medium text-blue-600 font-mono tracking-wide">{rule.title.de}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-8">
        {/* Explanation */}
        <div className="text-lg text-slate-700 leading-relaxed font-medium">
          {rule.explanation}
        </div>

        {/* Examples Table/List */}
        <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
          <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
            أمثلة توضيحية
          </div>
          <div className="divide-y divide-slate-100">
            {rule.examples.map((example, index) => (
              <div key={index} className="p-4 hover:bg-white transition-colors flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex-shrink-0">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="german-text text-base font-bold text-slate-800 mb-1">{example.de}</p>
                  <p className="text-sm text-slate-500">{example.ar}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grammar Table (if exists) */}
        {rule.table && (
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-right bg-white">
              <thead>
                <tr className="bg-slate-800 text-white">
                  {rule.table.headers.map((header, idx) => (
                    <th key={idx} className="px-4 py-3 text-sm font-bold whitespace-nowrap">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rule.table.rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-blue-50/50 transition-colors">
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="german-text px-4 py-3 text-sm text-slate-700 font-medium whitespace-nowrap">
                        {cellIdx === 0 ? <span className="font-bold text-slate-900">{cell}</span> : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Notes Section */}
        {rule.notes && rule.notes.length > 0 && (
          <div className="bg-amber-50 rounded-xl p-5 border border-amber-100 flex gap-3">
            <AlertTriangle className="text-amber-500 flex-shrink-0 mt-1" size={20} />
            <div>
              <h4 className="font-bold text-amber-800 mb-2">ملاحظات هامة</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-amber-900">
                {rule.notes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default GrammarDisplayComponent;
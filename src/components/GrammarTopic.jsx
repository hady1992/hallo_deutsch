import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, BookOpen, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ExpandedGrammarRules from '@/components/ExpandedGrammarRules';

const GrammarTopic = ({ topic, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRules = topic.rules ? topic.rules.filter(rule =>
    rule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.explanation.ar.includes(searchTerm)
  ) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
    >
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-red-700 to-amber-800 p-8 md:p-12 text-white relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500 opacity-10 rounded-full -ml-10 -mb-10 blur-2xl"></div>

        <div className="relative z-10">
            <Button
            variant="ghost"
            onClick={onBack}
            className="text-white/80 hover:text-white hover:bg-white/10 mb-8 pl-0 -ml-2 transition-all group"
            >
            <ChevronLeft className="ml-2 group-hover:translate-x-1 transition-transform" />
            العودة للقائمة
            </Button>

            <div className="flex items-center gap-3 mb-4 text-red-200">
            <span className="bg-red-600/50 border border-red-400/30 px-3 py-1 rounded-full text-sm font-medium uppercase tracking-wider">
                {topic.description || "قواعد اللغة"}
            </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
            {topic.title}
            </h1>

            <p className="text-red-100 text-lg md:text-xl max-w-2xl leading-relaxed opacity-90 font-light">
            {topic.content.intro}
            </p>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 md:p-8 bg-slate-50 min-h-[500px]">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 sticky top-0 z-20 py-4 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="ابحث في قواعد هذا الدرس..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
            />
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-sm font-medium px-2">
            <Filter size={16} />
            <span>{filteredRules.length} قاعدة</span>
          </div>
        </div>

        {/* Rules Grid */}
        <div className="space-y-6">
          {filteredRules.length > 0 ? (
            filteredRules.map((rule, idx) => (
              <ExpandedGrammarRules key={idx} rule={rule} />
            ))
          ) : (
            <div className="text-center py-16 text-slate-400">
              <BookOpen className="mx-auto h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg">لا توجد قواعد مطابقة للبحث</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default GrammarTopic;
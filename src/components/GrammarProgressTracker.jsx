import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, TrendingUp } from 'lucide-react';

const GrammarProgressTracker = ({ total, completed, level }) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  // Local storage logic moved to parent or hook, this component just displays
  
  return (
    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden mb-6">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Trophy size={120} />
      </div>
      
      <div className="relative z-10 flex items-center justify-between mb-4">
        <div>
          <h3 className="text-indigo-200 text-sm font-medium mb-1">تقدم المستوى {level}</h3>
          <div className="text-3xl font-bold flex items-baseline gap-2">
            {percentage}%
            <span className="text-sm font-normal text-indigo-300 opacity-70">مكتمل</span>
          </div>
        </div>
        <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10 shadow-inner">
          {percentage === 100 ? (
            <Trophy className="text-yellow-400 fill-yellow-400" size={24} />
          ) : (
            <Star className={percentage > 0 ? "text-yellow-400 fill-yellow-400" : "text-gray-400"} size={24} />
          )}
        </div>
      </div>

      <div className="relative h-3 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm shadow-inner">
        <motion.div 
          className="absolute top-0 right-0 h-full bg-gradient-to-l from-green-400 to-emerald-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      
      <div className="mt-4 flex justify-between items-center text-xs text-indigo-200 font-medium bg-white/5 p-2 rounded-lg">
        <span className="flex items-center gap-1"><TrendingUp size={12}/> {completed} من {total} موضوعات</span>
        <span className="opacity-70">{total - completed} متبقي</span>
      </div>
    </div>
  );
};

export default GrammarProgressTracker;
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Lock } from 'lucide-react';

function GrammarLevelSelector({ levels, selectedLevel, onSelectLevel, progress }) {
  const levelInfo = {
    A1: { name: 'مبتدئ', color: 'from-green-500 to-emerald-600', bgColor: 'bg-green-50', borderColor: 'border-green-500' },
    A2: { name: 'ما قبل المتوسط', color: 'from-blue-500 to-indigo-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-500' },
    B1: { name: 'متوسط', color: 'from-purple-500 to-pink-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-500' },
  };

  return (
    <div className="mb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {levels.map((level, index) => {
          const info = levelInfo[level];
          const levelProgress = progress[level] || { completed: 0, total: 0 };
          const isCompleted = levelProgress.completed === levelProgress.total && levelProgress.total > 0;
          const progressPercentage = levelProgress.total > 0 ? (levelProgress.completed / levelProgress.total) * 100 : 0;

          return (
            <motion.button
              key={level}
              onClick={() => onSelectLevel(level)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                selectedLevel === level
                  ? `${info.bgColor} ${info.borderColor} shadow-xl scale-105`
                  : 'bg-white border-gray-200 hover:shadow-lg hover:scale-102'
              }`}
            >
              {/* Level Badge */}
              <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${info.color} text-white font-bold text-2xl mb-3`}>
                {level}
              </div>

              {/* Level Name */}
              <h3 className="text-xl font-bold text-gray-800 mb-2">{info.name}</h3>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
                  <span>التقدم</span>
                  <span>{levelProgress.completed}/{levelProgress.total}</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`h-full bg-gradient-to-r ${info.color} rounded-full`}
                  />
                </div>
              </div>

              {/* Completion Badge */}
              {isCompleted && (
                <div className="flex items-center justify-center gap-2 text-green-600 mt-3">
                  <CheckCircle2 size={20} />
                  <span className="font-semibold">مكتمل</span>
                </div>
              )}

              {/* Active Indicator */}
              {selectedLevel === level && (
                <motion.div
                  layoutId="activeLevel"
                  className="absolute inset-0 border-4 border-blue-500 rounded-2xl pointer-events-none"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default GrammarLevelSelector;
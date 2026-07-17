import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Clock, Target, TrendingUp, Award } from 'lucide-react';

const ExerciseStatistics = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
      >
        <div className="p-3 bg-red-50 text-red-600 rounded-xl">
          <Target size={24} />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">معدل الدقة</p>
          <h3 className="text-2xl font-bold text-gray-800">
            {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%
          </h3>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
      >
        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
          <Trophy size={24} />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">النقاط الكلية</p>
          <h3 className="text-2xl font-bold text-gray-800">{stats.correct * 10}</h3>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
      >
        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
          <TrendingUp size={24} />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">أعلى تتابع</p>
          <h3 className="text-2xl font-bold text-gray-800">{stats.maxStreak || 0}</h3>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
      >
        <div className="p-3 bg-green-50 text-green-600 rounded-xl">
          <Award size={24} />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">تمارين مكتملة</p>
          <h3 className="text-2xl font-bold text-gray-800">{stats.total}</h3>
        </div>
      </motion.div>
    </div>
  );
};

export default ExerciseStatistics;
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Zap, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ExerciseProgressTracker = ({ stats, onReset }) => {
  const percentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6 sticky top-24">
      <div className="text-center space-y-2">
        <h3 className="font-bold text-gray-800">إحصائيات الجلسة</h3>
        <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-gray-100"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={351}
              strokeDashoffset={351 - (351 * percentage) / 100}
              className="text-red-600 transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-red-600">{percentage}%</span>
            <span className="text-xs text-gray-500">دقة</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-amber-50 rounded-xl p-4 flex flex-col items-center">
          <Target className="text-amber-500 mb-2" size={24} />
          <span className="text-2xl font-bold text-amber-700">{stats.correct}/{stats.total}</span>
          <span className="text-xs text-amber-400">الإجابات الصحيحة</span>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 flex flex-col items-center">
          <Zap className="text-amber-500 mb-2" size={24} />
          <span className="text-2xl font-bold text-amber-700">{stats.streak}</span>
          <span className="text-xs text-amber-400">تتابع صحيح</span>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-500">حسب المستوى</h4>
        <div className="space-y-2">
          {['A1', 'A2', 'B1', 'B2'].map(lvl => (
            <div key={lvl} className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-600">{lvl}</span>
              <div className="flex-1 mx-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full transition-all duration-500"
                  style={{ width: `${stats.byLevel?.[lvl] || 0}%` }}
                />
              </div>
              <span className="text-gray-400">{stats.byLevel?.[lvl] || 0}%</span>
            </div>
          ))}
        </div>
      </div>

      <Button variant="outline" className="w-full text-gray-500 hover:text-red-500" onClick={onReset}>
        <RotateCcw size={16} className="ml-2" />
        تصفير التقدم
      </Button>
    </div>
  );
};

export default ExerciseProgressTracker;
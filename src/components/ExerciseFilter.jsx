import React from 'react';
import { Filter, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ExerciseFilter = ({ filters, onFilterChange, onReset, counts }) => {
  const levels = ['A1', 'A2', 'B1', 'B2'];
  const types = [
    { id: 'multipleChoice', label: 'اختيار من متعدد' },
    { id: 'fillBlank', label: 'إكمال الفراغ' },
    { id: 'wordOrder', label: 'ترتيب الكلمات' },
    { id: 'matching', label: 'توصيل' }
  ];
  const difficulties = [
    { id: 'easy', label: 'سهل' },
    { id: 'medium', label: 'متوسط' },
    { id: 'hard', label: 'صعب' }
  ];

  const handleLevelChange = (level) => {
    onFilterChange({ ...filters, level });
  };

  const toggleType = (typeId) => {
    const currentTypes = filters.types || [];
    const newTypes = currentTypes.includes(typeId)
      ? currentTypes.filter(t => t !== typeId)
      : [...currentTypes, typeId];
    onFilterChange({ ...filters, types: newTypes });
  };

  const setDifficulty = (diffId) => {
    // Single selection logic: toggle off if already selected, otherwise set new
    const newDiff = filters.difficulty === diffId ? null : diffId;
    onFilterChange({ ...filters, difficulty: newDiff });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <Filter size={20} className="text-blue-600" />
          تصفية التمارين
        </h3>
        <Button variant="ghost" size="sm" onClick={onReset} className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8">
          <X size={16} className="ml-1" /> إعادة تعيين
        </Button>
      </div>

      {/* Levels */}
      <div>
        <label className="text-sm font-medium text-gray-500 mb-2 block">المستوى</label>
        <div className="flex flex-wrap gap-2">
          {levels.map(lvl => (
            <button
              key={lvl}
              onClick={() => handleLevelChange(lvl)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                filters.level === lvl
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {lvl} <span className="text-xs opacity-70 ml-1">({counts[lvl] || 0})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Types */}
      <div>
        <label className="text-sm font-medium text-gray-500 mb-2 block">نوع التمرين</label>
        <div className="flex flex-wrap gap-2">
          {types.map(t => (
            <button
              key={t.id}
              onClick={() => toggleType(t.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1 ${
                filters.types?.includes(t.id)
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {filters.types?.includes(t.id) && <Check size={12} />}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty - Single Select */}
      <div>
        <label className="text-sm font-medium text-gray-500 mb-2 block">الصعوبة</label>
        <div className="flex flex-wrap gap-2">
          {difficulties.map(d => (
            <button
              key={d.id}
              onClick={() => setDifficulty(d.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1 relative ${
                filters.difficulty === d.id
                  ? d.id === 'easy' ? 'bg-green-50 border-green-200 text-green-700 ring-2 ring-green-100' :
                    d.id === 'medium' ? 'bg-yellow-50 border-yellow-200 text-yellow-700 ring-2 ring-yellow-100' :
                    'bg-red-50 border-red-200 text-red-700 ring-2 ring-red-100'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <div className={`w-3 h-3 rounded-full border-2 mr-1 flex items-center justify-center ${
                  filters.difficulty === d.id ? 'border-current' : 'border-gray-300'
              }`}>
                  {filters.difficulty === d.id && <div className="w-1.5 h-1.5 rounded-full bg-current"></div>}
              </div>
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExerciseFilter;
import React from 'react';
import { Search, Filter, X, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const VocabularyFilter = ({
  searchTerm,
  setSearchTerm,
  selectedLevels,
  setSelectedLevels,
  selectedCategory,
  setSelectedCategory,
  categories,
  totalCount,
  filteredCount,
  onClearFilters
}) => {
  const levels = ['A1', 'A2', 'B1', 'B2'];

  const toggleLevel = (level) => {
    if (selectedLevels.includes(level)) {
      setSelectedLevels(selectedLevels.filter(l => l !== level));
    } else {
      setSelectedLevels([...selectedLevels, level]);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
      {/* Top Row: Search & Count */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="ابحث عن كلمة أو ترجمة أو مثال (ألماني/عربي)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-gray-800 bg-gray-50 focus:bg-white"
          />
        </div>
        
        <div className="flex items-center gap-2 text-gray-500 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
          <BarChart3 size={18} />
          <span className="font-medium text-sm">
            عرض {filteredCount} من {totalCount} كلمة
          </span>
        </div>
      </div>

      {/* Bottom Row: Filters */}
      <div className="flex flex-col md:flex-row gap-6 border-t border-gray-100 pt-6">
        
        {/* Level Filter */}
        <div className="flex-1">
          <label className="text-sm font-bold text-gray-700 mb-3 block">المستوى:</label>
          <div className="flex flex-wrap gap-2">
            {levels.map(level => (
              <button
                key={level}
                onClick={() => toggleLevel(level)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${
                  selectedLevels.includes(level)
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex-1">
          <label className="text-sm font-bold text-gray-700 mb-3 block">التصنيف:</label>
          <div className="relative">
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:border-blue-400 cursor-pointer appearance-none hover:border-gray-300 transition-colors"
            >
              <option value="All">كل التصنيفات</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Button */}
        <div className="flex items-end">
          <Button 
            variant="ghost" 
            onClick={onClearFilters}
            className="text-gray-500 hover:text-red-500 hover:bg-red-50 w-full md:w-auto"
          >
            <X size={16} className="ml-2" />
            مسح الفلاتر
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VocabularyFilter;
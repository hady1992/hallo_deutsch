import React from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, Circle, Book } from 'lucide-react';

const GrammarNavigationPanel = ({ 
  levels, 
  currentLevel, 
  onSelectLevel, 
  topics, 
  currentTopicId, 
  onSelectTopic,
  completedTopics,
  searchQuery,
  onSearchChange 
}) => {
  
  const filteredTopics = topics.filter(t => 
    t.title.includes(searchQuery) || t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-140px)] sticky top-24">
      {/* Level Selector */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">المستوى</h3>
        <div className="flex gap-2 bg-gray-200 p-1 rounded-xl">
          {levels.map(level => (
            <button
              key={level}
              onClick={() => onSelectLevel(level)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
                currentLevel === level 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="بحث في المواضيع..." 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Topics List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {filteredTopics.length > 0 ? (
          filteredTopics.map((topic, idx) => {
            const isCompleted = completedTopics.includes(topic.id);
            const isActive = currentTopicId === topic.id;
            
            return (
              <motion.button
                key={topic.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onSelectTopic(topic)}
                className={`w-full text-right p-3 rounded-xl flex items-center gap-3 transition-all duration-200 group ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className={`flex-shrink-0 transition-colors ${
                  isCompleted ? 'text-green-500' : isActive ? 'text-indigo-500' : 'text-gray-300 group-hover:text-gray-400'
                }`}>
                  {isCompleted ? <CheckCircle size={18} /> : isActive ? <Book size={18} /> : <Circle size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold truncate ${isActive ? 'text-indigo-700' : 'text-gray-800'}`}>
                    {topic.title}
                  </div>
                  <div className="text-xs text-gray-400 truncate font-sans" dir="ltr">
                    {topic.description}
                  </div>
                </div>
              </motion.button>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>لا توجد نتائج</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GrammarNavigationPanel;
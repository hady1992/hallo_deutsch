import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import AudioButton from '@/components/AudioButton';

function GrammarSection({ title, explanation, examples, index }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-md overflow-hidden"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        {isExpanded ? (
          <ChevronUp className="text-red-600" size={24} />
        ) : (
          <ChevronDown className="text-red-600" size={24} />
        )}
      </button>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="px-6 pb-6"
        >
          <div className="bg-red-50 p-4 rounded-lg mb-4">
            <p className="text-gray-700 leading-relaxed">{explanation}</p>
          </div>

          <div>
            <h4 className="font-bold text-gray-800 mb-3">أمثلة:</h4>
            <div className="space-y-3">
              {examples.map((example, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-center">
                  <div className="flex items-center gap-2">
                     <p className="text-lg font-semibold text-gray-800 mb-1" dir="ltr">{example.german}</p>
                     <AudioButton text={example.german} size={16} />
                  </div>
                  <p className="text-gray-600">{example.arabic}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default GrammarSection;
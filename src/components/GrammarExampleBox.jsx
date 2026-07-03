import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, Info } from 'lucide-react';
import AudioButton from '@/components/AudioButton';

const GrammarExampleBox = ({ example, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-lg text-indigo-700" dir="ltr">{example.german}</span>
            <AudioButton text={example.german} size={20} className="text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50" />
          </div>
        </div>
        
        <div className="flex flex-col gap-1 text-sm">
          <span className="text-gray-600 font-medium" dir="ltr">{example.translation}</span>
          <span className="text-gray-800 font-arabic font-medium">{example.arabic}</span>
        </div>

        {example.note && (
          <div className="mt-2 pt-2 border-t border-gray-100 flex items-start gap-2 text-xs text-amber-700 bg-amber-50/50 p-2 rounded-lg">
            <Info size={14} className="mt-0.5 flex-shrink-0" />
            <span>{example.note}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default GrammarExampleBox;
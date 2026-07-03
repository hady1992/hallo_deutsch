import React from 'react';
import { motion } from 'framer-motion';

function ProgressBar({ progress }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6 dark:bg-gray-700" dir="rtl">
      <motion.div 
        className="bg-blue-600 h-2.5 rounded-full" 
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
    </div>
  );
}

export default ProgressBar;
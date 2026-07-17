import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, CheckCircle, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AudioButton from '@/components/AudioButton';

export const LessonSection = ({ title, children, className = "" }) => (
  <div className={`mb-8 ${className}`}>
    {title && <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 border-gray-100">{title}</h3>}
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

export const PronunciationButton = ({ text, pronunciation }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <span className="font-semibold text-red-700" dir="ltr">{text}</span>
      <AudioButton text={text} size={16} />
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        onClick={() => setShow(!show)}
        title="عرض النطق المكتوب"
      >
        {show ? 'إخفاء النطق' : 'كيف يُقرأ؟'}
      </Button>
      <AnimatePresence>
        {show && (
          <motion.span
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded border border-gray-200"
          >
            {pronunciation}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ExampleBox = ({ examples }) => (
  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden my-4">
    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center gap-2">
      <CheckCircle size={16} className="text-green-600" />
      <span className="font-bold text-sm text-gray-700">أمثلة توضيحية</span>
    </div>
    <div className="p-4 space-y-3">
      {examples.map((ex, idx) => (
        <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 hover:bg-red-50 rounded transition-colors border-b last:border-0 border-gray-50">
          <div className="flex items-center gap-2 w-full sm:w-1/2">
             <span className="font-semibold text-red-700 text-lg" dir="ltr">{ex.german}</span>
             <AudioButton text={ex.german} size={18} />
             {ex.pronunciation && (
               <span className="text-xs text-gray-400 bg-gray-50 px-1 rounded hidden sm:inline-block">({ex.pronunciation})</span>
             )}
          </div>
          <span className="text-gray-600 text-sm w-full sm:w-1/2 mt-1 sm:mt-0">{ex.arabic}</span>
        </div>
      ))}
    </div>
  </div>
);

export const ImportantNote = ({ children }) => (
  <div className="bg-amber-50 border-r-4 border-amber-400 p-4 rounded-md my-4 flex gap-3">
    <Info className="text-amber-500 flex-shrink-0 mt-1" size={20} />
    <div className="text-amber-900 text-sm leading-relaxed">
      {children}
    </div>
  </div>
);

export const ExerciseBox = ({ question, answer }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  return (
    <div className="bg-amber-50 rounded-lg p-4 my-4 border border-amber-100">
      <div className="flex items-start gap-3 mb-3">
        <HelpCircle className="text-amber-500 flex-shrink-0 mt-1" size={20} />
        <span className="font-semibold text-amber-900">{question}</span>
      </div>

      <div className="mt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAnswer(!showAnswer)}
          className="text-xs border-amber-200 hover:bg-amber-100 text-amber-700"
        >
          {showAnswer ? 'إخفاء الإجابة' : 'إظهار الإجابة'}
          {showAnswer ? <ChevronUp size={14} className="mr-1" /> : <ChevronDown size={14} className="mr-1" />}
        </Button>

        <AnimatePresence>
          {showAnswer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-2 pt-2 border-t border-amber-200 text-amber-800 font-medium flex items-center gap-2" dir="ltr">
                <span>{answer}</span>
                {/* Attempt to clean answer from parentheses for cleaner TTS */}
                <AudioButton text={answer.replace(/\(.*?\)/g, '')} size={16} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
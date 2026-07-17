import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, BookOpen, Target, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AudioButton from '@/components/AudioButton';

function GrammarTopicCard({ topic, index, onStartExercises }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const difficultyColors = {
    beginner: 'from-green-500 to-emerald-600',
    intermediate: 'from-red-500 to-amber-600',
    advanced: 'from-amber-500 to-red-600'
  };

  const difficultyLabels = {
    beginner: 'مبتدئ',
    intermediate: 'متوسط',
    advanced: 'متقدم'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      {/* Header */}
      <div className={`bg-gradient-to-r ${difficultyColors[topic.difficulty]} p-6 text-white`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-2">{topic.title}</h3>
            <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm">
              {difficultyLabels[topic.difficulty]}
            </span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
          >
            {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 space-y-6">
              {/* Learning Objectives */}
              <div className="bg-red-50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="text-red-600" size={20} />
                  <h4 className="font-bold text-gray-800">أهداف التعلم:</h4>
                </div>
                <ul className="space-y-2">
                  {topic.learningObjectives.map((obj, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={16} />
                      <span className="text-gray-700">{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Explanation */}
              <div className="bg-amber-50 p-4 rounded-xl border-r-4 border-amber-400">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="text-amber-600" size={20} />
                  <h4 className="font-bold text-gray-800">الشرح:</h4>
                </div>
                <p className="text-gray-700 leading-relaxed">{topic.explanation}</p>
              </div>

              {/* Rules */}
              <div>
                <h4 className="font-bold text-gray-800 mb-3 text-lg">القواعد الأساسية:</h4>
                <div className="space-y-4">
                  {topic.rules.map((rule, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-lg border-l-4 border-amber-500">
                      <h5 className="font-bold text-amber-700 mb-2">{rule.rule}</h5>
                      <p className="text-gray-600 mb-2">{rule.details}</p>
                      <div className="bg-white p-3 rounded-md flex items-center gap-2">
                        <span className="text-sm text-gray-500">مثال:</span>
                        <span className="font-semibold text-amber-600" dir="ltr">{rule.example}</span>
                        <AudioButton text={rule.example} size={16} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Examples */}
              <div>
                <h4 className="font-bold text-gray-800 mb-3 text-lg">أمثلة توضيحية:</h4>
                <div className="grid gap-3">
                  {topic.examples.map((example, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-red-50 to-amber-50 p-4 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold text-red-700" dir="ltr">{example.german}</span>
                          <AudioButton text={example.german} size={18} />
                        </div>
                        <span className="text-gray-600">{example.arabic}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Start Exercises Button */}
              <div className="pt-4 border-t border-gray-200">
                <Button
                  onClick={() => onStartExercises(topic)}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-6 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  <BookOpen className="ml-2" size={24} />
                  ابدأ التمارين ({topic.exercises.length} تمرين)
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default GrammarTopicCard;
import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BidiText from '@/components/common/BidiText';

const ExamReview = ({ exam, userAnswers, onBack, onRetake }) => {
  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="bg-white sticky top-20 z-10 shadow-sm rounded-xl p-4 mb-8 border border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="ghost" className="hover:bg-slate-100">
            <ArrowRight className="ml-2 h-5 w-5" /> العودة للنتائج
          </Button>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="text-red-600" /> المراجعة الشاملة
          </h2>
        </div>
        <Button onClick={onRetake} size="sm" className="bg-slate-900 text-white hover:bg-black">
          إعادة الامتحان
        </Button>
      </div>

      <div className="space-y-6">
        {exam.questions.map((q, idx) => {
          const userAnsIdx = userAnswers[idx];
          const isCorrect = userAnsIdx === q.correctAnswer;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.05, 0.5) }}
              className={`bg-white rounded-2xl shadow-sm border-2 p-6 md:p-8
                ${isCorrect ? 'border-transparent shadow-green-100' : 'border-red-100 shadow-red-50'}`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0
                    ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {idx + 1}
                  </span>
                  <BidiText as="h3" text={q.question} className="text-xl font-bold text-slate-800 leading-relaxed flex-1" />
                </div>
                <div className="flex-shrink-0 mr-4">
                   {isCorrect
                     ? <div className="bg-green-100 p-2 rounded-full"><Check className="text-green-600" size={24} /></div>
                     : <div className="bg-red-100 p-2 rounded-full"><X className="text-red-600" size={24} /></div>
                   }
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 mr-12">
                {q.options.map((opt, i) => {
                  const isSelected = userAnsIdx === i;
                  const isAnswer = q.correctAnswer === i;

                  let itemClass = "border-slate-100 bg-white text-slate-600";
                  if (isAnswer) itemClass = "border-green-200 bg-green-50 text-green-800 font-bold ring-1 ring-green-200";
                  else if (isSelected && !isCorrect) itemClass = "border-red-200 bg-red-50 text-red-800 font-medium ring-1 ring-red-200";

                  return (
                    <div
                      key={i}
                      className={`p-4 rounded-xl text-base border flex justify-between items-center transition-colors ${itemClass}`}
                    >
                    <BidiText as="span" text={opt} className="flex-1" />
                      {isAnswer && <Check size={18} className="text-green-600" />}
                      {isSelected && !isCorrect && <X size={18} className="text-red-600" />}
                    </div>
                  );
                })}
              </div>

              <div className="mr-12 space-y-3">
                <div className="bg-red-50 rounded-xl p-5 border border-red-100">
                  <h4 className="text-sm font-bold text-red-700 mb-2 flex items-center gap-2">
                     💡 تلميح:
                  </h4>
                  <p className="text-red-900 text-sm">{q.hint}</p>
                </div>

                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                  <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                     📚 الشرح التفصيلي:
                  </h4>
                  <BidiText as="p" text={q.explanation} className="text-slate-800 text-sm leading-relaxed" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ExamReview;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, RotateCcw, Home, Eye, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import BidiText from '@/components/common/BidiText';

const ExamResults = ({ results, examData, onReview, onRetake }) => {
  const navigate = useNavigate();
  const percentage = results.score;
  const isPass = percentage >= 60;

  // Get detailed stats for incorrect answers
  const incorrectDetails = examData.questions.map((q, idx) => {
    const userAnsIdx = results.answers[idx];
    if (userAnsIdx !== q.correctAnswer) {
      return {
        ...q,
        userAnswer: q.options[userAnsIdx],
        correctAnswerText: q.options[q.correctAnswer],
        questionIndex: idx + 1
      };
    }
    return null;
  }).filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto space-y-8 p-4"
    >
      {/* Main Score Card */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 p-8 md:p-12 text-center relative">
        <div className={`absolute top-0 left-0 w-full h-2 ${isPass ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-red-400 to-red-600'}`} />

        <div className="mb-8 flex justify-center">
          <div className={`w-40 h-40 rounded-full flex flex-col items-center justify-center border-8 shadow-inner
            ${isPass ? 'border-green-100 bg-green-50 text-green-600' : 'border-red-100 bg-red-50 text-red-600'}`}
          >
            <span className="text-5xl font-black tracking-tighter">{percentage}%</span>
            <span className="text-sm font-bold uppercase mt-1 opacity-80">{isPass ? 'ناجح' : 'راسب'}</span>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-slate-800 mb-4">
          {isPass ? 'أداء رائع! مبروك 🎉' : 'حظ أوفر في المرة القادمة 💪'}
        </h2>
        <p className="text-slate-500 text-lg mb-8 max-w-lg mx-auto">
          لقد أجبت بشكل صحيح على <span className="font-bold text-green-600">{results.correctAnswers}</span> سؤال
          وأخطأت في <span className="font-bold text-red-600">{results.incorrectAnswers}</span> من أصل {results.totalQuestions}.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
          <Button onClick={onRetake} className="bg-slate-900 hover:bg-black text-white h-14 rounded-xl text-lg flex-1 shadow-lg hover:shadow-xl transition-all">
            <RotateCcw className="ml-2" size={20} /> إعادة الامتحان
          </Button>
          <Button onClick={onReview} variant="outline" className="border-2 h-14 rounded-xl text-lg flex-1 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all">
            <Eye className="ml-2" size={20} /> مراجعة الإجابات
          </Button>
          <Button onClick={() => navigate('/')} variant="ghost" className="h-14 rounded-xl text-lg flex-1 hover:bg-slate-100">
            <Home className="ml-2" size={20} /> الرئيسية
          </Button>
        </div>
      </div>

      {/* Quick Review of Incorrect Answers */}
      {incorrectDetails.length > 0 && (
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="bg-red-50 p-6 border-b border-red-100 flex items-center gap-3">
            <AlertTriangle className="text-red-500" />
            <h3 className="text-xl font-bold text-red-800">مراجعة الأخطاء ({incorrectDetails.length})</h3>
          </div>

          <div className="divide-y divide-slate-100">
            {incorrectDetails.map((item, i) => (
              <div key={i} className="p-6 md:p-8 hover:bg-slate-50 transition-colors">
                <div className="flex gap-4 mb-4">
                  <span className="bg-slate-200 text-slate-700 w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    {item.questionIndex}
                  </span>
                  <BidiText as="h4" text={item.question} className="text-lg font-bold text-slate-800 leading-relaxed flex-1" />
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4 mr-12">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <span className="text-xs font-bold text-red-500 uppercase block mb-1">إجابتك</span>
                    <div className="flex items-center gap-2 text-red-700 font-medium">
                      <XCircle size={18} className="shrink-0" />
                      <BidiText as="span" text={item.userAnswer || 'لم يتم الاختيار'} className="flex-1" />
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <span className="text-xs font-bold text-green-600 uppercase block mb-1">الإجابة الصحيحة</span>
                    <div className="flex items-center gap-2 text-green-800 font-medium">
                      <CheckCircle size={18} className="shrink-0" />
                      <BidiText as="span" text={item.correctAnswerText} className="flex-1" />
                    </div>
                  </div>
                </div>

                <div className="mr-12 bg-red-50 rounded-xl p-4 text-sm text-red-800 leading-relaxed">
                  <span className="font-bold block mb-1">الشرح:</span>
                  <BidiText as="span" text={item.explanation} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ExamResults;

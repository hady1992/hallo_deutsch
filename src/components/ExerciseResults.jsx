import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, ArrowLeft, RefreshCw, XCircle, CheckCircle, PieChart, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import AudioButton from '@/components/AudioButton';
import { getExerciseCategoryKey, getCategoryLabel, getExerciseAudioText } from '@/utils/exerciseAudio';

const ExerciseResults = ({ results, onRetake, onBack }) => {
  const { score, total, answers, questions } = results;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  // Group incorrect answers for review
  const incorrectIndices = questions.map((_, idx) => idx).filter(idx => answers[idx] !== questions[idx].correctAnswer);

  // Calculate topic performance (متوافق مع category أو topic أو "عام")
  const topicStats = questions.reduce((acc, q, idx) => {
    const key = getExerciseCategoryKey(q);
    const label = getCategoryLabel(key);
    if (!acc[label]) acc[label] = { total: 0, correct: 0 };
    acc[label].total += 1;
    if (answers[idx] === q.correctAnswer) acc[label].correct += 1;
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Score Card */}
      <Card className="border-t-4 border-t-purple-600 shadow-lg bg-white/50 backdrop-blur-sm">
        <CardContent className="p-8 text-center space-y-6">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto"
          >
            <Trophy className="w-12 h-12 text-purple-600" />
          </motion.div>
          
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">اكتمل التمرين!</h2>
            <div className="text-6xl font-black text-purple-600 mb-2">{percentage}%</div>
            <p className="text-slate-500 text-lg">نتيجتك: {score} من {total}</p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
             <Button onClick={onBack} variant="outline" className="gap-2 h-12 px-6">
                <ArrowLeft className="w-4 h-4" /> اختيار مستوى أو فئة أخرى
             </Button>
             <Button onClick={onRetake} className="gap-2 h-12 px-6 bg-purple-600 hover:bg-purple-700 text-white">
                <RefreshCw className="w-4 h-4" /> إعادة التمرين
             </Button>
          </div>
        </CardContent>
      </Card>

      {/* Topic Performance Grid */}
      <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-sm border-slate-200 h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <PieChart className="w-5 h-5 text-blue-500" /> الأداء حسب الفئة
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {Object.entries(topicStats).map(([topic, stat]) => (
                    <div key={topic} className="space-y-1">
                        <div className="flex justify-between text-sm font-medium">
                            <span className="german-text text-slate-700">{topic}</span>
                            <span className="text-slate-500">{stat.correct}/{stat.total}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full ${stat.correct === stat.total ? 'bg-green-500' : 'bg-blue-500'}`} 
                                style={{ width: `${(stat.correct/stat.total)*100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 h-full flex flex-col justify-center items-center p-8 bg-slate-50">
             <div className="text-center space-y-2">
                <h3 className="font-bold text-slate-700">ملخص سريع</h3>
                <div className="flex gap-4 justify-center mt-4">
                    <div className="bg-green-100 p-4 rounded-xl text-center min-w-[100px]">
                        <div className="text-2xl font-bold text-green-700">{score}</div>
                        <div className="text-xs text-green-600 uppercase font-bold">إجابات صحيحة</div>
                    </div>
                    <div className="bg-red-100 p-4 rounded-xl text-center min-w-[100px]">
                        <div className="text-2xl font-bold text-red-700">{total - score}</div>
                        <div className="text-xs text-red-600 uppercase font-bold">إجابات خاطئة</div>
                    </div>
                </div>
             </div>
          </Card>
      </div>

      {/* Wrong Answers Review */}
      {incorrectIndices.length > 0 && (
          <Card className="border-red-100 bg-red-50/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                    <XCircle className="w-5 h-5" /> مراجعة الأخطاء
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {incorrectIndices.map(idx => {
                    const question = questions[idx];
                    const userAnswerIdx = answers[idx];
                    return (
                        <div key={idx} className="bg-white p-6 rounded-xl border border-red-100 shadow-sm">
                            <div className="flex items-start gap-3 mb-4">
                                <span className="bg-red-100 text-red-600 w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm">
                                    {idx + 1}
                                </span>
                                <h4 className="german-text font-semibold text-slate-800 text-lg leading-snug flex-1">{question.question}</h4>
                                <AudioButton
                                    text={getExerciseAudioText(question)}
                                    lang="de-DE"
                                    className="flex-shrink-0"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mb-4 pr-11">
                                <div className="p-3 rounded-lg border-2 border-red-100 bg-red-50">
                                    <div className="text-xs text-red-500 font-bold mb-1 uppercase">إجابتك</div>
                                    <div className="german-text text-red-900 font-medium">
                                        {userAnswerIdx !== undefined ? question.options[userAnswerIdx] : '—'}
                                    </div>
                                </div>
                                <div className="p-3 rounded-lg border-2 border-green-100 bg-green-50">
                                    <div className="text-xs text-green-600 font-bold mb-1 uppercase">الإجابة الصحيحة</div>
                                    <div className="german-text text-green-900 font-medium">{question.options[question.correctAnswer]}</div>
                                </div>
                            </div>

                            {question.explanation && (
                                <div className="mr-11 flex items-start gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                                    <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <span>{question.explanation}</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </CardContent>
          </Card>
      )}
    </div>
  );
};

export default ExerciseResults;

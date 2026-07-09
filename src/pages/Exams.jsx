import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Clock, BarChart2, PlayCircle, Loader2, AlertCircle } from 'lucide-react';
import { examsA1 } from '@/data/examsA1';
import { examsA2 } from '@/data/examsA2';
import { examsB1 } from '@/data/examsB1';
import { examsB2 } from '@/data/examsB2';
import ExamComponent from '@/components/ExamComponent';
import ExamResults from '@/components/ExamResults';
import ExamReview from '@/components/ExamReview';
import { getImportedExams } from '@/utils/storageManager';
import { useSupabaseData } from '@/hooks/useSupabaseData';

const defaultExams = {
  A1: examsA1,
  A2: examsA2,
  B1: examsB1,
  B2: examsB2
};

function Exams() {
  const [activeTab, setActiveTab] = useState('A1');
  const [currentExam, setCurrentExam] = useState(null);
  const [examState, setExamState] = useState('list');
  const [results, setResults] = useState(null);
  const [userHistory, setUserHistory] = useState({});
  const [importedExams, setImportedExams] = useState({ A1: [], A2: [], B1: [], B2: [] });
  const [supabaseExams, setSupabaseExams] = useState({ A1: [], A2: [], B1: [], B2: [] });
  const [cloudError, setCloudError] = useState(false);

  const { fetchExams, loading: cloudLoading } = useSupabaseData();

  useEffect(() => {
    // History
    const savedHistory = localStorage.getItem('exam_results');
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory);
      const historyMap = {};
      parsed.forEach(res => {
        if (!historyMap[res.examId] || new Date(res.date) > new Date(historyMap[res.examId].date)) {
          historyMap[res.examId] = res;
        }
      });
      setUserHistory(historyMap);
    }

    // Load Local Data
    loadImportedData();
    
    // Load Cloud Data
    const loadCloud = async () => {
        try {
            // Fetch all levels? Or just active? 
            // For now, fetch ALL to populate all tabs properly.
            const allData = await fetchExams();
            if (allData) {
                const grouped = { A1: [], A2: [], B1: [], B2: [] };
                allData.forEach(exam => {
                    if (grouped[exam.level]) grouped[exam.level].push(exam);
                });
                setSupabaseExams(grouped);
                setCloudError(false);
            } else {
                // fetchExams يرجع null عند فشل الاتصال (التفاصيل التقنية مسجّلة بالفعل بالـ Console).
                // الامتحانات المحلية/الافتراضية تبقى ظاهرة بشكل طبيعي عبر getAllExams أدناه.
                setCloudError(true);
            }
        } catch (e) {
            console.error("Failed to load exams:", e);
            setCloudError(true);
        }
    };
    loadCloud();

    window.addEventListener('dataImported', loadImportedData);
    return () => window.removeEventListener('dataImported', loadImportedData);
  }, [fetchExams]);

  const loadImportedData = () => {
    setImportedExams({
        A1: getImportedExams('A1'),
        A2: getImportedExams('A2'),
        B1: getImportedExams('B1'),
        B2: getImportedExams('B2')
    });
  };

  const getAllExams = (level) => {
    const defaults = defaultExams[level] || [];
    const local = importedExams[level] || [];
    const cloud = supabaseExams[level] || [];
    
    // Deduplicate
    const map = new Map();
    defaults.forEach(e => map.set(e.id, e));
    local.forEach(e => map.set(e.id, e));
    cloud.forEach(e => map.set(e.id || e.supabaseId, e));
    
    return Array.from(map.values());
  };

  const startExam = (exam) => {
    setCurrentExam(exam);
    setExamState('taking');
    window.scrollTo(0, 0);
  };

  const handleExamComplete = (resultData) => {
    setResults(resultData);
    setExamState('results');
    window.scrollTo(0, 0);
  };

  return (
    <>
      <Helmet>
        <title>{'Comprehensive Exams | Hallo Deutsch'}</title>
      </Helmet>

      <div className="min-h-screen bg-slate-50 pt-24 pb-16">
        <div className="container mx-auto px-4">
          
          {examState === 'list' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="text-center max-w-3xl mx-auto relative">
                <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-6 tracking-tight">
                  مركز الامتحانات
                </h1>
                {cloudLoading && (
                    <div className="flex justify-center items-center gap-2 text-blue-500 mb-2">
                        <Loader2 className="animate-spin" size={16} /> تحديث الامتحانات...
                    </div>
                )}
                {!cloudLoading && cloudError && (
                    <div className="max-w-xl mx-auto mt-4 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-xl px-4 py-3 flex items-center justify-center gap-2">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>تعذر تحميل الامتحانات حاليًا. يرجى المحاولة لاحقًا أو التحقق من الاتصال.</span>
                    </div>
                )}
              </div>

              <Tabs defaultValue="A1" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="flex flex-wrap justify-center gap-3 mb-12 bg-transparent h-auto p-0">
                  {Object.keys(defaultExams).map(level => (
                    <TabsTrigger 
                      key={level} 
                      value={level}
                      className="px-8 py-4 rounded-2xl text-lg font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-300 w-32 md:w-40"
                    >
                      {level}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.keys(defaultExams).map(level => (
                  <TabsContent key={level} value={level}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
                      {getAllExams(level).map((exam) => {
                        const history = userHistory[exam.id];
                        return (
                          <motion.div 
                            key={exam.id}
                            whileHover={{ y: -8 }}
                            className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-300"
                          >
                            <div className={`h-3 w-full bg-slate-200`} />
                            
                            <div className="p-8 flex-1 flex flex-col">
                              <div className="flex justify-between items-start mb-6">
                                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
                                  {exam.difficulty || 'Standard'}
                                </span>
                                {history && (
                                  <div className={`flex flex-col items-end`}>
                                    <span className={`text-xl font-black ${history.score >= 60 ? 'text-green-600' : 'text-red-500'}`}>
                                      {history.score}% 
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              <h3 className="text-2xl font-bold text-slate-800 mb-4">{exam.title}</h3>
                              <p className="text-slate-500 mb-8 leading-relaxed flex-1">
                                {exam.description}
                              </p>
                              
                              <div className="flex items-center gap-6 text-sm text-slate-500 font-medium mb-8 border-t border-slate-100 pt-6">
                                <span className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-lg"><Clock size={18} className="text-blue-500" /> {exam.duration} دقيقة</span>
                                <span className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-lg"><BarChart2 size={18} className="text-purple-500" /> {exam.questions?.length || 0} سؤال</span>
                              </div>

                              <Button 
                                onClick={() => startExam(exam)}
                                className="w-full bg-slate-900 hover:bg-black text-white h-14 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all group"
                              >
                                {history ? 'إعادة الامتحان' : 'ابدأ الآن'} 
                                <PlayCircle className="mr-2 group-hover:scale-110 transition-transform" size={20} />
                              </Button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </motion.div>
          )}

          {/* Exam Runner Components (Taking, Results, Review) */}
          <AnimatePresence mode="wait">
            {examState === 'taking' && currentExam && (
              <motion.div key="taking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                 <Button variant="ghost" onClick={() => setExamState('list')} className="mb-4 text-red-500 hover:bg-red-50">خروج</Button>
                 <ExamComponent exam={currentExam} onComplete={handleExamComplete} />
              </motion.div>
            )}
            
            {examState === 'results' && results && (
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <ExamResults 
                  results={results} 
                  examData={currentExam} 
                  onReview={() => setExamState('review')} 
                  onRetake={() => { setResults(null); setExamState('taking'); }} 
                />
              </motion.div>
            )}

            {examState === 'review' && (
              <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <ExamReview 
                    exam={currentExam} 
                    userAnswers={results.answers} 
                    onBack={() => setExamState('results')} 
                    onRetake={() => { setResults(null); setExamState('taking'); }}
                />
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </>
  );
}

export default Exams;

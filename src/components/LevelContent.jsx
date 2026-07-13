import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, CheckCircle, ArrowRight, ArrowLeft, BookOpen, Clock, Trash2, FileText, List, PenTool, LayoutList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProgressBar from '@/components/ProgressBar';
import { useToast } from '@/components/ui/use-toast';
import LessonUploader from '@/components/LessonUploader';
import QuestionAdder from '@/components/QuestionAdder';
import QuestionList from '@/components/QuestionList';
import QuestionImporter from '@/components/QuestionImporter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { isAuthorizedAdminEmail } from '@/components/AdminGate';

function LevelContent({ title, description, objectives, sections, prevLevel, nextLevel, levelId, onDeleteLesson }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [expandedSection, setExpandedSection] = useState(0);
  const [completedSections, setCompletedSections] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const isAdmin = isAuthorizedAdminEmail(user?.email);
  
  // Tabs for managing content vs viewing lessons
  const [viewMode, setViewMode] = useState('lessons'); // 'lessons' or 'questions'

  const toggleSection = (index) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  const markComplete = (index, e) => {
    e.stopPropagation();
    if (!completedSections.includes(index)) {
      setCompletedSections([...completedSections, index]);
      toast({
        title: "أحسنت!",
        description: "تم إكمال هذا القسم بنجاح.",
        className: "bg-green-50 border-green-200",
      });
    }
  };
  
  const startExercises = (e) => {
      e.stopPropagation();
      navigate('/exercises');
      toast({
          title: "انتقال للتمارين",
          description: "يمكنك الآن تطبيق ما تعلمته في صفحة التمارين."
      });
  };

  const progress = Math.round((completedSections.length / (sections.length || 1)) * 100);

  return (
    <div className="min-h-screen py-16 mt-16 bg-gray-50" dir="rtl">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 relative"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">{title}</h1>
          <p className="text-xl text-gray-600 mb-6">{description}</p>
          
          {/* Admin Toggle for Question Management */}
          {isAdmin && (
              <div className="absolute top-0 right-0">
                  <div className="inline-flex bg-white rounded-lg p-1 shadow-sm border border-slate-200">
                      <button 
                        onClick={() => setViewMode('lessons')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'lessons' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                          الدروس
                      </button>
                      <button 
                        onClick={() => setViewMode('questions')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${viewMode === 'questions' ? 'bg-purple-100 text-purple-700' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                          <PenTool size={14} /> إدارة الأسئلة
                      </button>
                  </div>
              </div>
          )}
          
          <div className="bg-blue-50 p-6 rounded-xl text-right mb-8 shadow-sm border border-blue-100">
            <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
              <BookOpen size={20}/>
              أهداف هذا المستوى:
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {objectives.map((obj, idx) => (
                <li key={idx} className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-blue-500 rounded-full ml-2 flex-shrink-0"></span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-2 flex justify-between text-sm font-medium text-gray-600">
             <span>تقدمك في المستوى</span>
             <span>{progress}%</span>
          </div>
          <ProgressBar progress={progress} />
        </motion.div>

        {/* --- QUESTIONS MANAGEMENT VIEW --- */}
        {viewMode === 'questions' && isAdmin ? (
             <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="space-y-8"
             >
                 <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl mb-6 flex items-center gap-3">
                     <div className="bg-white p-2 rounded-full shadow-sm text-purple-600">
                        <PenTool size={24} />
                     </div>
                     <div>
                         <h3 className="font-bold text-purple-800">إدارة بنك الأسئلة ({levelId})</h3>
                         <p className="text-purple-600 text-sm">أضف أو عدل الأسئلة الخاصة بهذا المستوى لتظهر في الاختبارات والتمارين.</p>
                     </div>
                 </div>

                 <Tabs defaultValue="add" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-white border border-slate-200 p-1 rounded-xl mb-6 h-auto">
                        <TabsTrigger value="add" className="py-3 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">إضافة سؤال</TabsTrigger>
                        <TabsTrigger value="list" className="py-3 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">قائمة الأسئلة</TabsTrigger>
                        <TabsTrigger value="import" className="py-3 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">استيراد (CSV)</TabsTrigger>
                    </TabsList>

                    <TabsContent value="add" className="mt-0">
                        <QuestionAdder 
                            levelId={levelId} 
                            editingQuestion={editingQuestion} 
                            onSave={() => setEditingQuestion(null)}
                            onCancelEdit={() => setEditingQuestion(null)}
                        />
                    </TabsContent>

                    <TabsContent value="list" className="mt-0">
                        <QuestionList 
                            levelId={levelId} 
                            onEdit={(q) => {
                                setEditingQuestion(q);
                                // Switch tab logic requires controlled tabs or manual dom manipulation, 
                                // simplified here by just setting state and user manually clicks 'add' to see edit form usually.
                                // But to be better UX:
                                document.querySelector('[value="add"]').click(); 
                            }}
                        />
                    </TabsContent>

                    <TabsContent value="import" className="mt-0">
                        <QuestionImporter levelId={levelId} />
                    </TabsContent>
                 </Tabs>

             </motion.div>
        ) : (
            /* --- LESSONS VIEW (Default) --- */
            <>
                {/* Uploader */}
                {levelId && isAdmin && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <LessonUploader levelId={levelId} />
                    </motion.div>
                )}

                {/* Sections */}
                <div className="space-y-4 mb-12">
                {sections.map((section, index) => (
                    <motion.div
                    key={section.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-white rounded-xl shadow-md overflow-hidden border transition-all ${
                        expandedSection === index ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'
                    }`}
                    >
                    <div 
                        onClick={() => toggleSection(index)}
                        className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                            completedSections.includes(index) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                        }`}>
                            {completedSections.includes(index) ? <CheckCircle size={20} /> : <span>{index + 1}</span>}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">{section.title}</h3>
                            {section.isCustom && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mr-2">مخصص</span>}
                            {section.publicationStatus === 'local-only' && (
                                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full mr-2">محلي فقط</span>
                            )}
                        </div>
                        </div>
                        {expandedSection === index ? <ChevronUp className="text-gray-400"/> : <ChevronDown className="text-gray-400"/>}
                    </div>

                    <AnimatePresence>
                        {expandedSection === index && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-gray-100"
                        >
                            <div className="p-6 bg-gray-50/50">
                            {/* Check if section has a specific component content, otherwise use text */}
                            {section.content ? (
                                section.content
                            ) : (
                                <>
                                <div className="prose max-w-none text-gray-700 mb-6 leading-relaxed whitespace-pre-line">
                                    {section.explanation}
                                </div>

                                {/* Render imported extra fields if they exist */}
                                {(section.duration || section.objectives?.length > 0 || section.resources?.length > 0) && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
                                        {section.duration && (
                                            <div className="flex items-center gap-2 bg-white p-3 rounded border border-gray-100">
                                                <Clock size={16} className="text-blue-500"/>
                                                <span className="text-gray-600">المدة: {section.duration} دقيقة</span>
                                            </div>
                                        )}
                                        {section.objectives && section.objectives.length > 0 && (
                                            <div className="bg-white p-3 rounded border border-gray-100 col-span-1 md:col-span-2">
                                                <h5 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                                                    <List size={16} className="text-green-500"/> الأهداف:
                                                </h5>
                                                <ul className="list-disc list-inside text-gray-600 space-y-1">
                                                    {Array.isArray(section.objectives) ? section.objectives.map((obj, i) => (
                                                        <li key={i}>{obj}</li>
                                                    )) : <li>{section.objectives}</li>}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {section.examples && section.examples.length > 0 && (
                                    <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6 shadow-sm">
                                    <h4 className="font-bold text-gray-800 mb-3 text-sm border-b pb-2">أمثلة توضيحية:</h4>
                                    <div className="space-y-3">
                                        {section.examples.map((ex, idx) => (
                                        <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 hover:bg-blue-50 rounded transition-colors">
                                            <span className="font-semibold text-blue-700 text-left w-full sm:w-1/2" dir="ltr">{ex.german}</span>
                                            <span className="text-gray-600 text-sm w-full sm:w-1/2 mt-1 sm:mt-0">{ex.arabic}</span>
                                        </div>
                                        ))}
                                    </div>
                                    </div>
                                )}
                                </>
                            )}

                            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-200 justify-between items-center">
                                <div className="flex gap-3">
                                    <Button 
                                    onClick={startExercises}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                    ابدأ التمارين
                                    </Button>
                                    <Button 
                                    onClick={(e) => markComplete(index, e)}
                                    variant="outline"
                                    className={completedSections.includes(index) ? "text-green-600 border-green-200 bg-green-50 hover:bg-green-100" : "hover:bg-gray-100"}
                                    >
                                    {completedSections.includes(index) ? (
                                        <>
                                        <CheckCircle className="ml-2 h-4 w-4" />
                                        تم الإكمال
                                        </>
                                    ) : "تحديد كمكتمل"}
                                    </Button>
                                </div>

                                {isAdmin && section.isCustom && section.source !== 'cloud' && onDeleteLesson && (
                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteLesson(section.id);
                                        }}
                                        variant="destructive"
                                        size="sm"
                                        className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 hover:border-red-300 shadow-none"
                                    >
                                        <Trash2 size={16} className="ml-2" />
                                        حذف الدرس
                                    </Button>
                                )}
                            </div>
                            </div>
                        </motion.div>
                        )}
                    </AnimatePresence>
                    </motion.div>
                ))}
                </div>
            </>
        )}

        {/* Navigation Footer */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mt-8 pt-8 border-t border-gray-200">
          {prevLevel ? (
             <Button variant="outline" onClick={() => navigate(prevLevel.path)} className="flex items-center gap-2 w-full md:w-auto">
               <ArrowRight size={16}/>
               {prevLevel.label}
             </Button>
          ) : (
            <div className="hidden md:block w-32"></div> // Spacer
          )}

          <Button variant="ghost" onClick={() => navigate('/levels')} className="text-gray-500 hover:text-gray-700 w-full md:w-auto">
            العودة لقائمة المستويات
          </Button>

          {nextLevel ? (
             <Button onClick={() => navigate(nextLevel.path)} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 w-full md:w-auto">
               {nextLevel.label}
               <ArrowLeft size={16}/>
             </Button>
          ) : (
            <div className="hidden md:block w-32"></div> // Spacer
          )}
        </div>
      </div>
    </div>
  );
}

export default LevelContent;

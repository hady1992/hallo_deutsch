import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { ShieldCheck, BookOpen, GraduationCap, LogOut, Dumbbell, Target, Archive, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DataImportUtility from '@/components/DataImportUtility';
import GrammarRulesImporter from '@/components/GrammarRulesImporter';
import ExamModelsImporter from '@/components/ExamModelsImporter';
import ExerciseImporter from '@/components/ExerciseImporter';
import ExamUploaderPlacementTest from '@/components/ExamUploaderPlacementTest';
import AdminDataManager from '@/components/AdminDataManager';
import DataSyncStatus from '@/components/DataSyncStatus';
import StorageDebugPanel from '@/components/StorageDebugPanel';
import AdminGate from '@/components/AdminGate';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const AdminPanel = () => {
  const { signOut } = useAuth();
  const [showLegacyGrammarTool, setShowLegacyGrammarTool] = useState(false);

  return (
    <AdminGate>
    <div className="min-h-screen bg-slate-50 pt-24 pb-12" dir="rtl">
      <Helmet>
        <title>{'Admin Panel | Hallo Deutsch'}</title>
      </Helmet>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-3 rounded-xl text-white shadow-lg">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900">لوحة التحكم</h1>
              <p className="text-slate-500">استيراد وإدارة البيانات</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              عودة للرئيسية
            </Button>
            <Button variant="ghost" onClick={signOut} className="text-slate-500">
              <LogOut className="w-4 h-4 mr-2" /> تسجيل الخروج
            </Button>
          </div>
        </div>

        <DataSyncStatus />
        
        <div className="space-y-12">
            {/* Section: Supabase Cloud Data */}
            <section className="mb-12">
                 <AdminDataManager />
            </section>

             {/* Debug Section */}
            <section className="mb-12">
                <StorageDebugPanel />
            </section>

            {/* Section 1: Vocabulary & Verbs & Nouns Import (Legacy/Local) */}
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold mb-6 text-slate-800 border-b pb-2 flex items-center gap-2">
                    <BookOpen className="text-blue-600" />
                    استيراد البيانات الأساسية (محلي)
                </h2>
                <div className="grid lg:grid-cols-3 gap-8">
                    <div>
                        <h3 className="font-bold text-lg mb-3 text-blue-700">الأفعال</h3>
                        <DataImportUtility contentType="verbs" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-3 text-green-700">الأسماء</h3>
                        <DataImportUtility contentType="nouns" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-3 text-purple-700">المفردات العامة</h3>
                        <DataImportUtility contentType="vocabulary" />
                    </div>
                </div>
            </section>

            {/* Section 2: Grammar Rules */}
            <section>
                <div className="flex items-center gap-2 mb-6">
                    <div className="h-8 w-1 bg-orange-500 rounded-full"></div>
                    <h2 className="text-2xl font-bold text-slate-800">قواعد اللغة</h2>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
                     <h3 className="font-bold text-lg mb-4 text-orange-700">استيراد القواعد (JSON أو CSV)</h3>
                     <DataImportUtility contentType="grammar" className="max-w-md" />
                </div>

                {/* أداة قديمة مكررة (نفس المفتاح importedGrammarRules) — أُبقيت متاحة لكن مخفية
                    افتراضيًا تفاديًا للالتباس، لأن الأداة أعلاه تغطي نفس الوظيفة وتدعم JSON أيضًا. */}
                <div className="border border-dashed border-slate-300 rounded-2xl overflow-hidden">
                    <button
                        onClick={() => setShowLegacyGrammarTool(v => !v)}
                        className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 hover:bg-slate-100 transition-colors text-slate-500"
                    >
                        <span className="flex items-center gap-2 font-bold text-sm">
                            <Archive size={16} /> أداة استيراد قواعد قديمة (Legacy) — تكتب لنفس البيانات أعلاه، غير موصى بها
                        </span>
                        <ChevronDown size={16} className={`transition-transform ${showLegacyGrammarTool ? 'rotate-180' : ''}`} />
                    </button>
                    {showLegacyGrammarTool && (
                        <div className="p-6 bg-white">
                            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                                ⚠️ هذه الأداة تكتب لنفس مكان تخزين البيانات المستخدَم بالأداة أعلاه (CSV فقط، بدون دعم JSON).
                                استخدم الأداة أعلاه إن أمكن؛ أُبقيت هذه هنا للتوافق فقط ولم تُحذف.
                            </p>
                            <GrammarRulesImporter />
                        </div>
                    )}
                </div>

                {/* توضيح مكان عرض القواعد المستوردة فعليًا للمستخدم */}
                <div className="mt-4 text-sm text-slate-500 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                    💡 القواعد المستوردة من هذا القسم تظهر للمستخدم داخل تبويب
                    <span className="font-bold text-blue-700 mx-1">"قواعد مستوردة"</span>
                    بصفحة المفردات (<code className="bg-white px-1 rounded">/vocabulary</code>) — وليس بصفحة
                    <code className="bg-white px-1 rounded mx-1">/grammar</code> الرئيسية، لأن تلك الصفحة تعرض القواعد
                    الثابتة المُعدَّة مسبقًا فقط.
                </div>
            </section>

            {/* Section 3: Exercises Import */}
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold mb-6 text-slate-800 border-b pb-2 flex items-center gap-2">
                    <Dumbbell className="text-teal-600" />
                    استيراد التمارين
                </h2>
                <p className="text-sm text-slate-500 mb-4">
                    التمارين المستوردة هنا تظهر مباشرة لكل الطلاب بصفحة
                    <code className="bg-slate-100 px-1 rounded mx-1">/exercises</code>
                    ضمن نفس مستواها (A1–B2)، بجانب التمارين الأصلية للموقع.
                </p>
                <ExerciseImporter />
            </section>

            {/* Section 4: Placement Test Import */}
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold mb-6 text-slate-800 border-b pb-2 flex items-center gap-2">
                    <Target className="text-indigo-600" />
                    استيراد اختبار تحديد المستوى
                </h2>
                <p className="text-sm text-slate-500 mb-4">
                    الأسئلة المضافة هنا تظهر مباشرة ضمن اختبار تحديد المستوى بصفحة
                    <code className="bg-slate-100 px-1 rounded mx-1">/placement-test</code>
                    بجانب الأسئلة الأصلية للاختبار.
                </p>
                <ExamUploaderPlacementTest />
            </section>

            {/* Section 5: Exam Models */}
            <section>
                 <div className="flex items-center gap-2 mb-6">
                    <div className="h-8 w-1 bg-pink-500 rounded-full"></div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <GraduationCap className="text-pink-600" />
                        نماذج الامتحانات
                    </h2>
                </div>
                <ExamModelsImporter />
            </section>
        </div>
      </div>
    </div>
    </AdminGate>
  );
};

export default AdminPanel;
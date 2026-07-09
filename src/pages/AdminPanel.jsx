import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import {
  Archive,
  Baby,
  BookOpen,
  ChevronDown,
  Database,
  Dumbbell,
  FileUp,
  GraduationCap,
  LogOut,
  Settings,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DataImportUtility from '@/components/DataImportUtility';
import GrammarRulesImporter from '@/components/GrammarRulesImporter';
import ExamModelsImporter from '@/components/ExamModelsImporter';
import ExerciseImporter from '@/components/ExerciseImporter';
import ExamUploaderPlacementTest from '@/components/ExamUploaderPlacementTest';
import ExamUploader from '@/components/ExamUploader';
import AdminDataManager from '@/components/AdminDataManager';
import DataSyncStatus from '@/components/DataSyncStatus';
import StorageDebugPanel from '@/components/StorageDebugPanel';
import AdminGate from '@/components/AdminGate';
import KidsVocabularyImporter from '@/components/KidsVocabularyImporter';
import KidsConversationAdder from '@/components/KidsConversationAdder';
import CustomQuizManager from '@/components/CustomQuizManager';
import KidsFileUploader from '@/components/KidsFileUploader';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import {
  getKidsExercises,
  getKidsTopics,
  getKidsVerbs,
  saveKidsExercises,
  saveKidsTopics,
  saveKidsVerbs,
} from '@/utils/storageManager';
import { cn } from '@/lib/utils';

const ADMIN_SECTIONS = [
  {
    id: 'content',
    title: 'إدارة المحتوى',
    description: 'عرض وتعديل المحتوى الموجود من مكان واحد.',
    icon: BookOpen,
    color: 'bg-blue-50 text-blue-700 border-blue-100',
  },
  {
    id: 'upload',
    title: 'رفع ملفات',
    description: 'استيراد JSON/CSV والقوالب ونتائج الرفع.',
    icon: FileUp,
    color: 'bg-green-50 text-green-700 border-green-100',
  },
  {
    id: 'kids',
    title: 'محتوى الأطفال',
    description: 'إضافة مفردات ومحادثات ومسابقات الأطفال.',
    icon: Baby,
    color: 'bg-yellow-50 text-yellow-700 border-yellow-100',
  },
  {
    id: 'tests',
    title: 'الاختبارات والتمارين',
    description: 'إدارة التمارين، تحديد المستوى، والامتحانات.',
    icon: Dumbbell,
    color: 'bg-purple-50 text-purple-700 border-purple-100',
  },
  {
    id: 'system',
    title: 'النظام والإعدادات',
    description: 'أدوات الصيانة والمزامنة، مغلقة افتراضيًا.',
    icon: Settings,
    color: 'bg-slate-50 text-slate-700 border-slate-100',
  },
];

const AdminSection = ({ section, isOpen, onToggle, children }) => {
  const Icon = section.icon;
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full flex-col gap-4 p-5 text-right transition-colors hover:bg-slate-50 md:flex-row md:items-center md:justify-between"
      >
        <span className="flex items-center gap-4">
          <span className={cn('flex h-12 w-12 items-center justify-center rounded-xl border', section.color)}>
            <Icon size={24} />
          </span>
          <span>
            <span className="block text-xl font-black text-slate-900">{section.title}</span>
            <span className="block text-sm font-bold text-slate-500">{section.description}</span>
          </span>
        </span>
        <ChevronDown className={cn('text-slate-400 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="border-t border-slate-100 p-5 md:p-6">
          {children}
        </div>
      )}
    </section>
  );
};

const AdminPanel = () => {
  const { signOut } = useAuth();
  const [openSections, setOpenSections] = useState({
    content: false,
    upload: false,
    kids: true,
    tests: false,
    system: false,
  });
  const [showLegacyGrammarTool, setShowLegacyGrammarTool] = useState(false);

  const toggleSection = (sectionId) => {
    setOpenSections((current) => ({
      ...current,
      [sectionId]: !current[sectionId],
    }));
  };

  const refreshKidsData = () => {
    window.dispatchEvent(new Event('kidsDataUpdated'));
  };

  const normalizeOptions = (options) => {
    if (Array.isArray(options)) return options;
    if (typeof options === 'string') {
      return options.split('|').map((option) => option.trim()).filter(Boolean);
    }
    return [];
  };

  const appendKidsItems = (readItems, writeItems, items, normalizeItem) => {
    const currentItems = readItems();
    const timestamp = Date.now();
    const preparedItems = items
      .map((item, index) => {
        const sourceItem = item && typeof item === 'object' ? item : {};
        const normalizedItem = normalizeItem(sourceItem, index);
        if (!normalizedItem) return null;
        return {
          ...normalizedItem,
          id: normalizedItem.id || sourceItem.id || timestamp + index,
        };
      })
      .filter(Boolean);

    if (preparedItems.length === 0) return;

    writeItems([...currentItems, ...preparedItems]);
    refreshKidsData();
  };

  const handleKidsTopicsImport = (items) => {
    appendKidsItems(getKidsTopics, saveKidsTopics, items, (item) => ({
      ...item,
      title: item.title || item.german || '',
      arabicTitle: item.arabicTitle || item.arabic || item.translation || '',
      icon: item.icon || 'star',
      color: item.color || 'bg-yellow-100 text-yellow-700',
    }));
  };

  const handleKidsVerbsImport = (items) => {
    appendKidsItems(getKidsVerbs, saveKidsVerbs, items, (item) => ({
      ...item,
      infinitive: item.infinitive || item.german || '',
      arabic: item.arabic || item.translation || '',
      category: item.category || 'daily',
      level: item.level || 'medium',
    }));
  };

  const handleKidsExercisesImport = (items) => {
    appendKidsItems(getKidsExercises, saveKidsExercises, items, (item) => {
      const options = normalizeOptions(item.options);
      return {
        ...item,
        type: item.type || 'choice',
        question: item.question || '',
        options: options.length > 0 ? options : ['a', 'b'],
        correct: item.correct || item.answer || '',
      };
    });
  };

  return (
    <AdminGate>
    <div className="min-h-screen bg-slate-50 pt-24 pb-12" dir="rtl">
      <Helmet>
        <title>{'Admin Panel | Hallo Deutsch'}</title>
      </Helmet>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-3 rounded-xl text-white shadow-lg">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900">لوحة التحكم</h1>
              <p className="text-slate-500">إضافة المحتوى وإدارته من مكان واحد</p>
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

        <div className="mb-6 grid gap-3 md:grid-cols-5">
          {ADMIN_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => toggleSection(section.id)}
                className={cn(
                  'rounded-2xl border bg-white p-4 text-right shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md',
                  openSections[section.id] ? 'border-slate-300 ring-2 ring-slate-100' : 'border-slate-100'
                )}
              >
                <Icon className="mb-3 text-slate-700" size={24} />
                <span className="block text-sm font-black text-slate-900">{section.title}</span>
                <span className="mt-1 block text-xs font-bold leading-5 text-slate-500">{section.description}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-5">
          <AdminSection
            section={ADMIN_SECTIONS[0]}
            isOpen={openSections.content}
            onToggle={() => toggleSection('content')}
          >
            <div className="mb-4 grid gap-3 md:grid-cols-4">
              {['المفردات العامة', 'الأسماء', 'الأفعال', 'القواعد', 'التمارين', 'اختبار تحديد المستوى', 'نماذج الامتحانات', 'محتوى الأطفال'].map((label) => (
                <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-black text-slate-700">
                  {label}
                </div>
              ))}
            </div>
            <AdminDataManager />
          </AdminSection>

          <AdminSection
            section={ADMIN_SECTIONS[1]}
            isOpen={openSections.upload}
            onToggle={() => toggleSection('upload')}
          >
            <div className="mb-5 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-bold text-green-800">
              بعد كل رفع يظهر تقرير بعدد العناصر المضافة والمكررة التي تم تجاهلها والأخطاء.
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              <div>
                <h3 className="mb-3 text-lg font-black text-blue-700">الأفعال</h3>
                <DataImportUtility contentType="verbs" />
              </div>
              <div>
                <h3 className="mb-3 text-lg font-black text-green-700">الأسماء</h3>
                <DataImportUtility contentType="nouns" />
              </div>
              <div>
                <h3 className="mb-3 text-lg font-black text-purple-700">المفردات العامة</h3>
                <DataImportUtility contentType="vocabulary" />
              </div>
              <div className="lg:col-span-3">
                <h3 className="mb-3 text-lg font-black text-orange-700">القواعد</h3>
                <DataImportUtility contentType="grammar" />
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-dashed border-slate-300">
              <button
                type="button"
                onClick={() => setShowLegacyGrammarTool(v => !v)}
                className="flex w-full items-center justify-between bg-slate-50 px-6 py-4 text-slate-500 transition-colors hover:bg-slate-100"
              >
                <span className="flex items-center gap-2 text-sm font-bold">
                  <Archive size={16} /> أداة استيراد قواعد قديمة، مطوية للتوافق فقط
                </span>
                <ChevronDown size={16} className={cn('transition-transform', showLegacyGrammarTool && 'rotate-180')} />
              </button>
              {showLegacyGrammarTool && (
                <div className="bg-white p-6">
                  <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    هذه الأداة تكتب لنفس بيانات القواعد، لذلك استخدم أداة الرفع أعلاه عند الإمكان.
                  </p>
                  <GrammarRulesImporter />
                </div>
              )}
            </div>
          </AdminSection>

          <AdminSection
            section={ADMIN_SECTIONS[2]}
            isOpen={openSections.kids}
            onToggle={() => toggleSection('kids')}
          >
            <Tabs defaultValue="kids-words" className="w-full">
              <div className="mb-6 overflow-x-auto pb-2">
                <TabsList className="h-auto min-w-max rounded-2xl bg-yellow-50 p-1">
                  <TabsTrigger value="kids-words" className="rounded-xl px-4 py-2 font-black data-[state=active]:bg-white data-[state=active]:text-yellow-700">
                    {'\u0643\u0644\u0645\u0627\u062a \u0627\u0644\u0623\u0637\u0641\u0627\u0644'}
                  </TabsTrigger>
                  <TabsTrigger value="kids-conversations" className="rounded-xl px-4 py-2 font-black data-[state=active]:bg-white data-[state=active]:text-yellow-700">
                    {'\u0645\u062d\u0627\u062f\u062b\u0627\u062a \u0627\u0644\u0623\u0637\u0641\u0627\u0644'}
                  </TabsTrigger>
                  <TabsTrigger value="kids-quizzes" className="rounded-xl px-4 py-2 font-black data-[state=active]:bg-white data-[state=active]:text-yellow-700">
                    {'\u0623\u0633\u0626\u0644\u0629 \u0648\u0645\u0633\u0627\u0628\u0642\u0627\u062a'}
                  </TabsTrigger>
                  <TabsTrigger value="kids-import" className="rounded-xl px-4 py-2 font-black data-[state=active]:bg-white data-[state=active]:text-yellow-700">
                    {'\u0627\u0633\u062a\u064a\u0631\u0627\u062f \u0645\u0644\u0641\u0627\u062a'}
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="kids-words" className="mt-0">
                <KidsVocabularyImporter refreshData={refreshKidsData} />
              </TabsContent>

              <TabsContent value="kids-conversations" className="mt-0">
                <KidsConversationAdder />
              </TabsContent>

              <TabsContent value="kids-quizzes" className="mt-0">
                <CustomQuizManager />
              </TabsContent>

              <TabsContent value="kids-import" className="mt-0">
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="rounded-2xl border border-yellow-100 bg-white p-5 shadow-sm">
                    <h3 className="mb-2 text-lg font-black text-slate-800">{'\u0627\u0633\u062a\u064a\u0631\u0627\u062f \u0645\u0648\u0627\u0636\u064a\u0639 \u0627\u0644\u0623\u0637\u0641\u0627\u0644'}</h3>
                    <p className="mb-4 text-sm font-bold text-slate-500">{'JSON/CSV \u0644\u0645\u0648\u0627\u0636\u064a\u0639 \u0642\u0633\u0645 \u0627\u0644\u0623\u0637\u0641\u0627\u0644.'}</p>
                    <KidsFileUploader
                      onUpload={handleKidsTopicsImport}
                      label={'\u0627\u0633\u062a\u064a\u0631\u0627\u062f \u0645\u0648\u0627\u0636\u064a\u0639'}
                      templateData={[{ title: 'Space', arabicTitle: '\u0627\u0644\u0641\u0636\u0627\u0621', icon: 'star', color: 'bg-indigo-100 text-indigo-700' }]}
                    />
                  </div>
                  <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
                    <h3 className="mb-2 text-lg font-black text-slate-800">{'\u0627\u0633\u062a\u064a\u0631\u0627\u062f \u0623\u0641\u0639\u0627\u0644 \u0627\u0644\u0623\u0637\u0641\u0627\u0644'}</h3>
                    <p className="mb-4 text-sm font-bold text-slate-500">{'JSON/CSV \u0644\u0623\u0641\u0639\u0627\u0644 \u0642\u0633\u0645 \u0627\u0644\u0623\u0637\u0641\u0627\u0644.'}</p>
                    <KidsFileUploader
                      onUpload={handleKidsVerbsImport}
                      label={'\u0627\u0633\u062a\u064a\u0631\u0627\u062f \u0623\u0641\u0639\u0627\u0644'}
                      templateData={[{ infinitive: 'singen', arabic: '\u064a\u063a\u0646\u064a', category: 'creative', level: 'medium' }]}
                    />
                  </div>
                  <div className="rounded-2xl border border-teal-100 bg-white p-5 shadow-sm">
                    <h3 className="mb-2 text-lg font-black text-slate-800">{'\u0627\u0633\u062a\u064a\u0631\u0627\u062f \u062a\u0645\u0627\u0631\u064a\u0646 \u0627\u0644\u0623\u0637\u0641\u0627\u0644'}</h3>
                    <p className="mb-4 text-sm font-bold text-slate-500">{'\u0644\u0644\u062a\u0645\u0627\u0631\u064a\u0646 \u0628\u0635\u064a\u063a\u0629 JSON/CSV\u060c \u0648\u0627\u0641\u0635\u0644 \u0627\u0644\u062e\u064a\u0627\u0631\u0627\u062a \u0641\u064a CSV \u0628\u0631\u0645\u0632 |.'}</p>
                    <KidsFileUploader
                      onUpload={handleKidsExercisesImport}
                      label={'\u0627\u0633\u062a\u064a\u0631\u0627\u062f \u062a\u0645\u0627\u0631\u064a\u0646'}
                      templateData={[{ type: 'choice', question: '?', options: 'a|b', correct: 'a' }]}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </AdminSection>

          <AdminSection
            section={ADMIN_SECTIONS[3]}
            isOpen={openSections.tests}
            onToggle={() => toggleSection('tests')}
          >
            <div className="space-y-8">
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-xl font-black text-slate-800">
                  <Dumbbell className="text-teal-600" /> التمارين
                </h3>
                <ExerciseImporter />
              </div>
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-xl font-black text-slate-800">
                  <Target className="text-indigo-600" /> اختبار تحديد المستوى
                </h3>
                <ExamUploaderPlacementTest />
              </div>
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-xl font-black text-slate-800">
                  <GraduationCap className="text-pink-600" /> امتحانات المستويات
                </h3>
                <div className="grid gap-4 lg:grid-cols-2">
                  {['A1', 'A2', 'B1', 'B2'].map((level) => (
                    <ExamUploader key={level} level={level} />
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-xl font-black text-slate-800">
                  <GraduationCap className="text-pink-600" /> نماذج الامتحانات
                </h3>
                <ExamModelsImporter />
              </div>
            </div>
          </AdminSection>

          <AdminSection
            section={ADMIN_SECTIONS[4]}
            isOpen={openSections.system}
            onToggle={() => toggleSection('system')}
          >
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
              <Database size={18} />
              المزامنة السحابية غير مفعلة بالكامل بعد
            </div>
            <DataSyncStatus />
            <StorageDebugPanel />
          </AdminSection>
        </div>
      </div>
    </div>
    </AdminGate>
  );
};

export default AdminPanel;

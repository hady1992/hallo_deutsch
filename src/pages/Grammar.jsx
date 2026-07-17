import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Layers, BookA, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import AudioButton from '@/components/AudioButton';

// Import Data
import { getGrammarRules, getNouns, getVerbs } from '@/services/contentRepository';

// Import Components
import GrammarDisplayComponent from '@/components/GrammarDisplayComponent';
import VerbDisplayComponent from '@/components/VerbDisplayComponent';

const DataStatus = ({ loading, error, emptyMessage }) => (
  <div role="status" className="border border-dashed border-slate-200 bg-white py-16 text-center">
    {loading ? (
      <>
        <span className="mx-auto mb-3 block h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
        <p className="font-bold text-slate-600">جاري تحميل المحتوى...</p>
      </>
    ) : (
      <p className={error ? 'font-bold text-red-600' : 'text-slate-500'}>{error || emptyMessage}</p>
    )}
  </div>
);

function Grammar() {
  const [activeLevel, setActiveLevel] = useState('A1');
  const [activeMainTab, setActiveMainTab] = useState('grammar');
  const [allVerbs, setAllVerbs] = useState([]);
  const [allNouns, setAllNouns] = useState([]);
  const [rulesByLevel, setRulesByLevel] = useState({});
  const [loading, setLoading] = useState({ grammar: false, verbs: false, nouns: false });
  const [errors, setErrors] = useState({ grammar: '', verbs: '', nouns: '' });
  const [refreshVersion, setRefreshVersion] = useState(0);
  const loadedTabs = useRef({ verbs: false, nouns: false });

  // Grammar Rules Search State
  const [grammarSearch, setGrammarSearch] = useState("");

  // Noun Filter State
  const [nounSearch, setNounSearch] = useState("");
  const [nounGenderFilter, setNounGenderFilter] = useState("all");

  const currentRules = Array.isArray(rulesByLevel[activeLevel]) ? rulesByLevel[activeLevel] : [];

  const filteredRules = useMemo(() => {
    const q = grammarSearch.trim().toLowerCase();
    if (!q) return currentRules;
    return currentRules.filter(rule => {
      const titleAr = (rule.title?.ar || '').toLowerCase();
      const titleDe = (rule.title?.de || '').toLowerCase();
      const explanation = (rule.explanation || '').toLowerCase();
      const examplesMatch = (Array.isArray(rule.examples) ? rule.examples : []).some(ex =>
        (ex.de || '').toLowerCase().includes(q) || (ex.ar || '').toLowerCase().includes(q)
      );
      return titleAr.includes(q) || titleDe.includes(q) || explanation.includes(q) || examplesMatch;
    });
  }, [currentRules, grammarSearch]);

  useEffect(() => {
    const refreshData = () => {
      loadedTabs.current = { verbs: false, nouns: false };
      setRulesByLevel({});
      setRefreshVersion((version) => version + 1);
    };
    window.addEventListener('dataImported', refreshData);
    return () => window.removeEventListener('dataImported', refreshData);
  }, []);

  useEffect(() => {
    if (activeMainTab !== 'grammar' || rulesByLevel[activeLevel]) return undefined;
    let active = true;
    setLoading((state) => ({ ...state, grammar: true }));
    setErrors((state) => ({ ...state, grammar: '' }));

    getGrammarRules(activeLevel)
      .then((rules) => {
        if (!active) return;
        setRulesByLevel((state) => ({
          ...state,
          [activeLevel]: Array.isArray(rules) ? rules : [],
        }));
      })
      .catch((error) => {
        if (active) setErrors((state) => ({ ...state, grammar: error?.message || 'تعذر تحميل القواعد.' }));
      })
      .finally(() => {
        if (active) setLoading((state) => ({ ...state, grammar: false }));
      });

    return () => { active = false; };
  }, [activeLevel, activeMainTab, refreshVersion, rulesByLevel]);

  useEffect(() => {
    if (activeMainTab !== 'verbs' || loadedTabs.current.verbs) return undefined;
    let active = true;
    setLoading((state) => ({ ...state, verbs: true }));
    setErrors((state) => ({ ...state, verbs: '' }));
    getVerbs()
      .then((verbs) => {
        if (!active) return;
        setAllVerbs(Array.isArray(verbs) ? verbs : []);
        loadedTabs.current.verbs = true;
      })
      .catch((error) => {
        if (active) setErrors((state) => ({ ...state, verbs: error?.message || 'تعذر تحميل الأفعال.' }));
      })
      .finally(() => {
        if (active) setLoading((state) => ({ ...state, verbs: false }));
      });
    return () => { active = false; };
  }, [activeMainTab, refreshVersion]);

  useEffect(() => {
    if (activeMainTab !== 'nouns' || loadedTabs.current.nouns) return undefined;
    let active = true;
    setLoading((state) => ({ ...state, nouns: true }));
    setErrors((state) => ({ ...state, nouns: '' }));
    getNouns()
      .then((nouns) => {
        if (!active) return;
        setAllNouns(Array.isArray(nouns) ? nouns : []);
        loadedTabs.current.nouns = true;
      })
      .catch((error) => {
        if (active) setErrors((state) => ({ ...state, nouns: error?.message || 'تعذر تحميل الأسماء.' }));
      })
      .finally(() => {
        if (active) setLoading((state) => ({ ...state, nouns: false }));
      });
    return () => { active = false; };
  }, [activeMainTab, refreshVersion]);

  const filteredNouns = useMemo(() => {
    return (Array.isArray(allNouns) ? allNouns : []).filter(noun => {
      const matchesSearch = 
        (noun.german || "").toLowerCase().includes(nounSearch.toLowerCase()) || 
        (noun.translation || "").includes(nounSearch);
      
      const matchesGender = nounGenderFilter === 'all' || noun.gender === nounGenderFilter;

      return matchesSearch && matchesGender;
    });
  }, [allNouns, nounSearch, nounGenderFilter]);

  return (
    <>
      <Helmet>
        <title>{'Grammar and Verbs | Hallo Deutsch'}</title>
      </Helmet>

      <div className="min-h-screen bg-slate-50 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-5xl">
          
          {/* Hero Section */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
              المكتبة <span className="text-blue-600">الشاملة</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              مرجعك الكامل لقواعد اللغة، الأفعال، والأسماء الألمانية.
            </p>
          </div>

          <Tabs defaultValue="grammar" value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
            {/* Main Navigation Tabs */}
            <div className="flex justify-center mb-8">
              <TabsList className="bg-white p-1 rounded-full shadow-sm border border-slate-200 overflow-x-auto flex-nowrap max-w-full">
                <TabsTrigger 
                  value="grammar" 
                  className="px-6 py-3 rounded-full text-base font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all flex items-center gap-2 whitespace-nowrap"
                >
                  <BookOpen size={18} />
                  قواعد اللغة
                </TabsTrigger>
                <TabsTrigger 
                  value="verbs" 
                  className="px-6 py-3 rounded-full text-base font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all flex items-center gap-2 whitespace-nowrap"
                >
                  <Layers size={18} />
                  قاموس الأفعال
                </TabsTrigger>
                <TabsTrigger 
                  value="nouns" 
                  className="px-6 py-3 rounded-full text-base font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all flex items-center gap-2 whitespace-nowrap"
                >
                  <BookA size={18} />
                  قاموس الأسماء
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Grammar Tab Content */}
            <TabsContent value="grammar" className="mt-0">
              {/* Search Bar */}
              <div className="relative max-w-xl mx-auto mb-6">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={grammarSearch}
                  onChange={(e) => setGrammarSearch(e.target.value)}
                  placeholder="ابحث في قواعد هذا المستوى (عربي أو ألماني)..."
                  className="w-full pr-11 pl-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-800"
                />
              </div>

              {/* Level Selector */}
              <div className="flex justify-center mb-8 gap-2">
                {['A1', 'A2', 'B1', 'B2'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setActiveLevel(level)}
                    className={`
                      w-12 h-12 rounded-full font-black text-lg transition-all shadow-sm
                      ${activeLevel === level 
                        ? 'bg-slate-900 text-white scale-110 ring-4 ring-slate-100' 
                        : 'bg-white text-slate-400 hover:bg-slate-100 hover:text-slate-600'}
                    `}
                  >
                    {level}
                  </button>
                ))}
              </div>

              {/* Rules List */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeLevel + grammarSearch}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {loading.grammar ? (
                    <DataStatus loading />
                  ) : errors.grammar ? (
                    <DataStatus error={errors.grammar} />
                  ) : filteredRules.length > 0 ? (
                    filteredRules.map((rule) => (
                      <GrammarDisplayComponent key={rule.id} rule={rule} />
                    ))
                  ) : grammarSearch ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                      <Search className="mx-auto h-10 w-10 text-slate-200 mb-3" />
                      <p className="text-slate-500 text-lg font-bold mb-1">لا توجد نتائج مطابقة لبحثك</p>
                      <p className="text-slate-400 text-sm mb-4">لم نجد "{grammarSearch}" ضمن قواعد المستوى {activeLevel}. جرّب كلمة أخرى أو مستوى مختلف.</p>
                      <Button variant="outline" size="sm" onClick={() => setGrammarSearch("")}>
                        مسح البحث
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                      <p className="text-slate-400 text-lg">محتوى هذا المستوى قيد الإعداد...</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </TabsContent>

            {/* Verbs Tab Content */}
            <TabsContent value="verbs" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
                  <div className="mb-6 pb-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800">مستكشف الأفعال</h2>
                      <p className="text-slate-500 mt-1">ابحث في تصريفات أكثر من {allVerbs.length} فعل أساسي.</p>
                    </div>
                    <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium border border-blue-100">
                      يتم عرض 7 ضمائر لكل زمن
                    </div>
                  </div>
                  {loading.verbs || errors.verbs ? (
                    <DataStatus loading={loading.verbs} error={errors.verbs} />
                  ) : allVerbs.length > 0 ? (
                    <VerbDisplayComponent verbs={allVerbs} />
                  ) : (
                    <DataStatus emptyMessage="لا توجد أفعال متاحة حاليًا." />
                  )}
                </div>
              </motion.div>
            </TabsContent>

            {/* Nouns Tab Content */}
            <TabsContent value="nouns" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                 {/* Filters */}
                 <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative w-full md:flex-1">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                        <input 
                            type="text" 
                            placeholder="ابحث عن كلمة ألمانية أو عربية..." 
                            value={nounSearch}
                            onChange={(e) => setNounSearch(e.target.value)}
                            className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                        {['all', 'masculine', 'feminine', 'neuter'].map(g => (
                            <button
                                key={g}
                                onClick={() => setNounGenderFilter(g)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors",
                                    nounGenderFilter === g 
                                    ? "bg-slate-900 text-white" 
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                )}
                            >
                                {g === 'all' ? 'الكل' : g === 'masculine' ? 'مذكر (der)' : g === 'feminine' ? 'مؤنث (die)' : 'محايد (das)'}
                            </button>
                        ))}
                    </div>
                 </div>

                 {/* Nouns Grid */}
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading.nouns ? (
                        <div className="col-span-full"><DataStatus loading /></div>
                    ) : errors.nouns ? (
                        <div className="col-span-full"><DataStatus error={errors.nouns} /></div>
                    ) : filteredNouns.length > 0 ? (
                        filteredNouns.map(noun => (
                            <div key={noun.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                                <div className={cn("absolute top-0 right-0 w-2 h-full", 
                                    noun.gender === 'masculine' ? 'bg-blue-400' :
                                    noun.gender === 'feminine' ? 'bg-red-400' :
                                    'bg-green-400'
                                )}></div>
                                
                                <div className="flex justify-between items-start mb-2 pr-4">
                                    <div className="flex items-center gap-2">
                                        <span className={cn("text-xs font-bold px-2 py-1 rounded uppercase",
                                            noun.gender === 'masculine' ? 'bg-blue-50 text-blue-600' :
                                            noun.gender === 'feminine' ? 'bg-red-50 text-red-600' :
                                            'bg-green-50 text-green-600'
                                        )}>
                                            {noun.article}
                                        </span>
                                        <AudioButton text={noun.german} size={18} />
                                    </div>
                                    <span className="text-xs text-slate-400 font-mono">{noun.plural}</span>
                                </div>

                                <h3 className="text-2xl font-black text-slate-800 mb-1">{noun.noun}</h3>
                                <p className="text-lg text-slate-600 mb-4 font-medium">{noun.translation}</p>
                                
                                {noun.example && (
                                    <div className="bg-slate-50 p-3 rounded-lg text-sm border border-slate-100">
                                        <p className="text-slate-800 italic mb-1">"{noun.example}"</p>
                                        <p className="text-slate-500">{noun.exampleArabic}</p>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <Filter size={48} className="mx-auto text-slate-300 mb-4" />
                            <h3 className="text-xl font-bold text-slate-800">لا توجد نتائج</h3>
                            <p className="text-slate-500">جرب البحث عن كلمة أخرى أو تغيير الفلتر</p>
                            <Button onClick={() => {setNounSearch(""); setNounGenderFilter("all");}} variant="link" className="mt-2 text-blue-600">
                                إعادة تعيين
                            </Button>
                        </div>
                    )}
                 </div>

              </motion.div>
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </>
  );
}

export default Grammar;

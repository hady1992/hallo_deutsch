import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams } from 'react-router-dom';
import VocabularyCardSimple from '@/components/VocabularyCardSimple';
import VocabularyFilter from '@/components/VocabularyFilter';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, Book, FileText, GraduationCap, LayoutList, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VerbsTabExtended from '@/components/VerbsTabExtended';
import NounsTab from '@/components/NounsTab';
import { getGrammarRules, getVocabulary } from '@/services/contentRepository';
import GrammarDisplayComponent from '@/components/GrammarDisplayComponent';
import { normalizeGrammarRuleForDisplay } from '@/utils/grammarNormalizer';

const LIBRARY_TABS = ['words', 'nouns', 'verbs', 'grammar'];

// Grammar Rules View (Internal Component)
const GrammarRulesView = () => {
  const [rules, setRules] = useState([]);
  const [filterLevel, setFilterLevel] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const handleUpdate = async () => {
      setLoadError('');
      setLoading(true);
      try {
        const allRules = await getGrammarRules();
        setRules(Array.isArray(allRules) ? allRules : []);
      } catch (error) {
        console.error('[Vocabulary] Failed to load grammar rules:', error);
        setRules([]);
        setLoadError('تعذر تحميل المحتوى حاليًا');
      } finally {
        setLoading(false);
      }
    };
    handleUpdate();
    window.addEventListener('dataImported', handleUpdate);
    return () => window.removeEventListener('dataImported', handleUpdate);
  }, []);

  const filtered = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase('de-DE');
    return (Array.isArray(rules) ? rules : []).filter((rule) => {
      if (filterLevel !== 'All' && String(rule?.level || '').toUpperCase() !== filterLevel) return false;
      if (!query) return true;
      const normalized = normalizeGrammarRuleForDisplay(rule);
      const searchable = [
        normalized.title.ar,
        normalized.title.de,
        normalized.explanation,
        ...normalized.examples.flatMap((example) => [example.de, example.ar]),
      ].filter(Boolean).join(' ').toLocaleLowerCase('de-DE');
      return searchable.includes(query);
    });
  }, [filterLevel, rules, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div className="relative">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="ابحث في القواعد بالعربية أو الألمانية"
            className="brand-focus min-h-11 w-full rounded-md border border-slate-300 bg-white py-2 pl-3 pr-10 text-slate-800"
          />
        </div>
        <div className="overflow-x-auto pb-1 scrollbar-hide md:pb-0">
         <div className="inline-flex min-w-max gap-1 rounded-md bg-slate-50 p-1">
             {['All', 'A1', 'A2', 'B1', 'B2'].map(lvl => (
                 <button
                    key={lvl}
                    type="button"
                    onClick={() => setFilterLevel(lvl)}
                    className={`brand-focus min-h-10 rounded-md px-4 text-sm transition-colors ${filterLevel === lvl ? 'bg-[#111111] text-white font-bold' : 'text-slate-600 hover:bg-white'}`}
                 >
                    {lvl === 'All' ? 'الكل' : lvl}
                 </button>
             ))}
         </div>
        </div>
      </div>

      <div>
         {loading ? (
            <div role="status" className="flex min-h-48 items-center justify-center gap-2 font-bold text-slate-600"><Loader2 className="h-5 w-5 animate-spin text-[#d71920]" /> جاري تحميل القواعد...</div>
         ) : loadError ? (
            <div className="py-12 text-center font-bold text-red-700">{loadError}</div>
         ) : filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white py-12 text-center text-slate-400">
                <GraduationCap size={48} className="mx-auto mb-3 opacity-20" />
                <p>{searchTerm ? 'لا توجد قواعد مطابقة لبحثك.' : 'لا توجد قواعد منشورة لهذا المستوى.'}</p>
            </div>
         ) : (
            filtered.map((rule) => <GrammarDisplayComponent key={rule.id || `${rule.level}-${String(rule.title)}`} rule={rule} />)
         )}
      </div>
    </div>
  );
};

function Vocabulary() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab') || 'words';
  const activeTab = LIBRARY_TABS.includes(requestedTab) ? requestedTab : 'words';
  const [allVocabulary, setAllVocabulary] = useState([]);
  const [cloudLoading, setCloudLoading] = useState(true);
  const [cloudError, setCloudError] = useState('');

  useEffect(() => {
    const loadVocab = async () => {
      setCloudLoading(true);
      setCloudError('');
      try {
        const vocabulary = await getVocabulary();
        setAllVocabulary(Array.isArray(vocabulary) ? vocabulary : []);
      } catch (error) {
        console.error('[Vocabulary] Failed to load published vocabulary:', error);
        setAllVocabulary([]);
        setCloudError('تعذر تحميل المحتوى حاليًا');
      } finally {
        setCloudLoading(false);
      }
    };
    loadVocab();

    window.addEventListener('dataImported', loadVocab);
    return () => window.removeEventListener('dataImported', loadVocab);
  }, []);

  const categories = useMemo(() => {
    const cats = new Set((Array.isArray(allVocabulary) ? allVocabulary : []).map(item => item?.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [allVocabulary]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevels, setSelectedLevels] = useState(['A1', 'A2', 'B1', 'B2']);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('simple_vocab_favorites');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('[Vocabulary] Ignoring invalid favorites data:', error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('simple_vocab_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const isFav = prev.includes(id);
      if (isFav) {
        toast({ title: "تم الحذف", description: "تمت إزالة الكلمة من المفضلة", duration: 1000 });
        return prev.filter(item => item !== id);
      } else {
        toast({ title: "تم الحفظ", description: "تمت إضافة الكلمة إلى المفضلة ❤️", className: "bg-green-50 border-green-200", duration: 1000 });
        return [...prev, id];
      }
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedLevels(['A1', 'A2', 'B1', 'B2']);
    setSelectedCategory("All");
    setShowFavoritesOnly(false);
  };

  const filteredWords = (Array.isArray(allVocabulary) ? allVocabulary : []).filter(word => {
    if (!word || typeof word !== 'object') return false;
    if (selectedLevels.length > 0 && !selectedLevels.includes(word.level)) return false;
    if (selectedCategory !== "All" && word.category !== selectedCategory) return false;
    const searchLower = searchTerm.trim().toLowerCase();
    const matchesSearch =
      String(word.german || '').toLowerCase().includes(searchLower) ||
      String(word.arabic || '').toLowerCase().includes(searchLower) ||
      String(word.example || '').toLowerCase().includes(searchLower) ||
      String(word.exampleArabic || '').toLowerCase().includes(searchLower);
    if (searchTerm && !matchesSearch) return false;
    if (showFavoritesOnly && !favorites.includes(word.id)) return false;
    return true;
  });

  return (
    <>
      <Helmet>
        <title>{'Vocabulary and Grammar | Hallo Deutsch'}</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12 md:py-20 mt-8 md:mt-0" dir="rtl">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">

          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
              المكتبة <span className="text-red-600">الشاملة</span>
            </h1>
            {cloudLoading && (
                <div className="flex justify-center items-center gap-2 text-sm text-red-500 mb-4">
                    <Loader2 className="animate-spin w-4 h-4" /> جاري مزامنة المكتبة...
                </div>
            )}
            {cloudError && <p className="mb-4 text-center font-bold text-red-700">{cloudError}</p>}
          </div>

          <Tabs value={activeTab} className="w-full space-y-8">
            <div className="flex justify-start md:justify-center overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0">
                <TabsList className="bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm h-auto flex flex-nowrap md:flex-wrap gap-2 min-w-max md:min-w-0">
                    <TabsTrigger value="words" asChild className="px-5 md:px-6 py-2.5 rounded-xl transition-all flex gap-2 items-center text-sm md:text-base">
                      <a href="/vocabulary?tab=words">
                        <Book size={18} /> المفردات
                      </a>
                    </TabsTrigger>
                    <TabsTrigger value="nouns" asChild className="px-5 md:px-6 py-2.5 rounded-xl transition-all flex gap-2 items-center text-sm md:text-base">
                      <a href="/vocabulary?tab=nouns">
                        <FileText size={18} /> الأسماء
                      </a>
                    </TabsTrigger>
                    <TabsTrigger value="verbs" asChild className="px-5 md:px-6 py-2.5 rounded-xl transition-all flex gap-2 items-center text-sm md:text-base">
                      <a href="/vocabulary?tab=verbs">
                        <LayoutList size={18} /> الأفعال
                      </a>
                    </TabsTrigger>
                    <TabsTrigger value="grammar" asChild className="px-5 md:px-6 py-2.5 rounded-xl transition-all flex gap-2 items-center text-sm md:text-base">
                      <a href="/vocabulary?tab=grammar">
                        <GraduationCap size={18} /> القواعد
                      </a>
                    </TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="words" className="outline-none">
                <VocabularyFilter
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    selectedLevels={selectedLevels}
                    setSelectedLevels={setSelectedLevels}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    categories={categories}
                    totalCount={allVocabulary.length}
                    filteredCount={filteredWords.length}
                    onClearFilters={clearFilters}
                />

                {filteredWords.length > 0 ? (
                    <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    <AnimatePresence>
                        {filteredWords.map((word) => (
                        <VocabularyCardSimple
                            key={word.id || word.german}
                            word={word}
                            isFavorite={favorites.includes(word.id)}
                            onToggleFavorite={toggleFavorite}
                        />
                        ))}
                    </AnimatePresence>
                    </motion.div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 mx-4 md:mx-0">
                    <Inbox size={48} className="text-gray-300 mb-4" />
                    {searchTerm ? (
                        <>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد نتائج مطابقة لبحثك</h3>
                            <p className="text-gray-500 text-sm mb-4">لم نجد أي كلمة تحتوي على "{searchTerm}". جرّب كلمة أخرى أو تحقق من الإملاء.</p>
                            <Button variant="outline" size="sm" onClick={() => setSearchTerm("")}>
                                مسح البحث
                            </Button>
                        </>
                    ) : (
                        <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد نتائج</h3>
                    )}
                    </div>
                )}
            </TabsContent>

            <TabsContent value="verbs" className="outline-none">
                <VerbsTabExtended />
            </TabsContent>

            <TabsContent value="nouns" className="outline-none">
                <NounsTab />
            </TabsContent>

            <TabsContent value="grammar" className="outline-none">
                <GrammarRulesView />
            </TabsContent>

          </Tabs>

        </div>
      </div>
    </>
  );
}

export default Vocabulary;

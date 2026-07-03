import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { vocabularyA1 } from '@/data/vocabularyA1';
import { vocabularyA2 } from '@/data/vocabularyA2';
import { vocabularyB1 } from '@/data/vocabularyB1';
import { vocabularyB2 } from '@/data/vocabularyB2';
import VocabularyCardSimple from '@/components/VocabularyCardSimple';
import VocabularyFilter from '@/components/VocabularyFilter';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Inbox, Book, FileText, GraduationCap, LayoutList, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VerbsTabExtended from '@/components/VerbsTabExtended';
import NounsTab from '@/components/NounsTab';
import { getImportedVocabulary, mergeWithDefaults, getImportedGrammarRules } from '@/utils/storageManager';
import { Badge } from '@/components/ui/badge';
import { useSupabaseData } from '@/hooks/useSupabaseData';

// Grammar Rules View (Internal Component)
const GrammarRulesView = () => {
  const [rules, setRules] = useState([]);
  const [filterLevel, setFilterLevel] = useState('All');
  
  useEffect(() => {
    setRules(getImportedGrammarRules());
    const handleUpdate = () => setRules(getImportedGrammarRules());
    window.addEventListener('dataImported', handleUpdate);
    return () => window.removeEventListener('dataImported', handleUpdate);
  }, []);

  const filtered = rules.filter(r => filterLevel === 'All' || r.level === filterLevel);

  return (
    <div className="space-y-6">
      <div className="text-sm text-slate-500 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
        هذه قواعد أضافها فريق الموقع عبر لوحة التحكم، منفصلة عن قواعد صفحة
        <span className="font-bold text-orange-700 mx-1">"القواعد"</span>
        الرئيسية.
      </div>
      <div className="flex justify-start md:justify-end overflow-x-auto pb-2 scrollbar-hide">
         <div className="bg-white p-1 rounded-lg border border-slate-200 inline-flex min-w-max">
             {['All', 'A1', 'A2', 'B1', 'B2'].map(lvl => (
                 <button 
                    key={lvl}
                    onClick={() => setFilterLevel(lvl)}
                    className={`px-4 py-2 text-sm rounded-md transition-all ${filterLevel === lvl ? 'bg-orange-100 text-orange-800 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
                 >
                    {lvl === 'All' ? 'الكل' : lvl}
                 </button>
             ))}
         </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {filtered.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                <GraduationCap size={48} className="mx-auto mb-3 opacity-20" />
                <p>لا توجد قواعد مضافة لهذا المستوى.</p>
            </div>
         ) : (
            filtered.map(rule => (
                <div key={rule.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all">
                    <div className="p-5 border-b border-slate-50">
                        <div className="flex justify-between items-start mb-2">
                             <h3 className="font-bold text-lg text-slate-800">{rule.title}</h3>
                             <Badge variant="outline" className="bg-slate-50">{rule.level}</Badge>
                        </div>
                        <p className="text-slate-600 text-sm">{rule.description}</p>
                    </div>
                </div>
            ))
         )}
      </div>
    </div>
  );
};

function Vocabulary() {
  const { toast } = useToast();
  const [importedVocabulary, setImportedVocabulary] = useState([]);
  const [supabaseVocabulary, setSupabaseVocabulary] = useState([]);
  const { fetchVocabulary, loading: cloudLoading } = useSupabaseData();

  useEffect(() => {
    const loadVocab = () => setImportedVocabulary(getImportedVocabulary());
    loadVocab();

    const loadCloud = async () => {
        try {
            const data = await fetchVocabulary();
            if(data) setSupabaseVocabulary(data);
        } catch (e) { console.error(e); }
    };
    loadCloud();

    window.addEventListener('dataImported', loadVocab);
    return () => window.removeEventListener('dataImported', loadVocab);
  }, [fetchVocabulary]);

  const allVocabulary = useMemo(() => {
    const defaultVocab = [...vocabularyA1, ...vocabularyA2, ...vocabularyB1, ...vocabularyB2];
    const importedWithFlag = importedVocabulary.map(item => ({ ...item, isImported: true }));
    const cloudWithFlag = supabaseVocabulary.map(item => ({ ...item, isCloud: true }));
    
    // Merge: Cloud + Imported + Defaults
    // Use mergeWithDefaults for intelligent deduplication based on German word
    return mergeWithDefaults([...importedWithFlag, ...cloudWithFlag], defaultVocab, 'german');
  }, [importedVocabulary, supabaseVocabulary]);

  const categories = useMemo(() => {
    const cats = new Set(allVocabulary.map(item => item.category));
    return Array.from(cats).sort();
  }, [allVocabulary]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevels, setSelectedLevels] = useState(['A1', 'A2', 'B1', 'B2']);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('simple_vocab_favorites');
    return saved ? JSON.parse(saved) : [];
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

  const filteredWords = allVocabulary.filter(word => {
    if (selectedLevels.length > 0 && !selectedLevels.includes(word.level)) return false;
    if (selectedCategory !== "All" && word.category !== selectedCategory) return false;
    const searchLower = searchTerm.trim().toLowerCase();
    const matchesSearch =
      (word.german || '').toLowerCase().includes(searchLower) ||
      (word.arabic || '').toLowerCase().includes(searchLower) ||
      (word.example || '').toLowerCase().includes(searchLower) ||
      (word.exampleArabic || '').toLowerCase().includes(searchLower);
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
              المكتبة <span className="text-blue-600">الشاملة</span>
            </h1>
            {cloudLoading && (
                <div className="flex justify-center items-center gap-2 text-sm text-blue-500 mb-4">
                    <Loader2 className="animate-spin w-4 h-4" /> جاري مزامنة المكتبة...
                </div>
            )}
          </div>

          <Tabs defaultValue="vocabulary" className="w-full space-y-8">
            <div className="flex justify-start md:justify-center overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0">
                <TabsList className="bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm h-auto flex flex-nowrap md:flex-wrap gap-2 min-w-max md:min-w-0">
                    <TabsTrigger value="vocabulary" className="px-5 md:px-6 py-2.5 rounded-xl transition-all flex gap-2 items-center text-sm md:text-base">
                        <Book size={18} /> المفردات
                    </TabsTrigger>
                    <TabsTrigger value="verbs" className="px-5 md:px-6 py-2.5 rounded-xl transition-all flex gap-2 items-center text-sm md:text-base">
                        <LayoutList size={18} /> الأفعال
                    </TabsTrigger>
                    <TabsTrigger value="nouns" className="px-5 md:px-6 py-2.5 rounded-xl transition-all flex gap-2 items-center text-sm md:text-base">
                        <FileText size={18} /> الأسماء
                    </TabsTrigger>
                    <TabsTrigger value="grammar" className="px-5 md:px-6 py-2.5 rounded-xl transition-all flex gap-2 items-center text-sm md:text-base">
                        <GraduationCap size={18} />قواعد مستوردة
                    </TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="vocabulary" className="outline-none">
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
import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Bookmark, BookOpen, Share2, Printer, X, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ExpandedGrammarRules from '@/components/ExpandedGrammarRules';
import { getGrammarRules } from '@/services/contentRepository';

const GrammarRulesDatabase = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [allRules, setAllRules] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [bookmarked, setBookmarked] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('grammar_bookmarks') || '[]');
      return Array.isArray(stored) ? stored : [];
    } catch (error) {
      console.warn('[GrammarRulesDatabase] Ignoring invalid bookmark data:', error);
      return [];
    }
  });

  useEffect(() => {
    const loadRules = async () => {
      setLoadError('');
      try {
        setAllRules(await getGrammarRules());
      } catch (error) {
        console.error('[GrammarRulesDatabase] Failed to load published rules:', error);
        setAllRules([]);
        setLoadError('تعذر تحميل المحتوى حاليًا');
      }
    };
    loadRules();
    window.addEventListener('grammarUpdated', loadRules);
    return () => window.removeEventListener('grammarUpdated', loadRules);
  }, []);

  const categories = useMemo(() =>
    ['All', ...new Set(allRules.map(r => r.category).filter(Boolean))],
    [allRules]
  );

  const toggleBookmark = (id) => {
    const newBookmarks = bookmarked.includes(id)
      ? bookmarked.filter(b => b !== id)
      : [...bookmarked, id];
    setBookmarked(newBookmarks);
    localStorage.setItem('grammar_bookmarks', JSON.stringify(newBookmarks));
  };

  const downloadTemplate = () => {
    const csvContent = `title,level,explanation,examples,notes
Nominativ,A1,حالة الفاعل,Der Mann arbeitet; Die Frau singt,الفاعل دائماً في حالة Nominativ
Akkusativ,A1,حالة المفعول,Ich sehe den Mann; Sie liebt die Musik,المفعول المباشر في حالة Akkusativ
Dativ,A2,حالة الجار والمجرور,Ich gebe dem Mann ein Buch,تستخدم مع الفعل geben
Genitiv,B1,حالة الإضافة,Das Buch des Mannes,تستخدم للملكية`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "grammar_rules_template.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const filteredRules = allRules.filter(rule => {
    const q = searchTerm.trim().toLowerCase();
    const title = typeof rule?.title === 'string'
      ? rule.title
      : rule?.title?.ar || rule?.title?.de || '';
    const explanationAr = typeof rule?.explanation === 'string'
      ? rule.explanation
      : rule?.explanation?.ar || '';
    const explanationDe = typeof rule?.explanation === 'object' ? rule?.explanation?.de || '' : '';
    const matchesSearch = !q || (
      title.toLowerCase().includes(q) ||
      explanationAr.toLowerCase().includes(q) ||
      explanationDe.toLowerCase().includes(q) ||
      (Array.isArray(rule?.examples) ? rule.examples : []).some(ex =>
        typeof ex === 'string'
          ? ex.toLowerCase().includes(q)
          : (ex?.de || '').toLowerCase().includes(q) || (ex?.ar || '').toLowerCase().includes(q)
      )
    );
    const matchesLevel = selectedLevel === 'All' || rule.level === selectedLevel;
    const matchesCategory = selectedCategory === 'All' || rule.category === selectedCategory;
    return matchesSearch && matchesLevel && matchesCategory;
  });

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-slate-900 text-white py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl font-black mb-4 flex items-center gap-3">
            <BookOpen className="text-red-400" size={40} />
            المرجع الشامل لقواعد اللغة الألمانية
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mb-8">
            أكثر من 200 قاعدة مفصلة مع الأمثلة والجداول، مصنفة حسب المستوى والموضوع.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث عن قاعدة (مثال: Akkusativ, Passive)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-4 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="border-b border-slate-200 sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div className="container mx-auto max-w-6xl px-6 py-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto no-scrollbar pb-2 md:pb-0">
            {['All', 'A1', 'A2', 'B1', 'B2'].map(level => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  selectedLevel === level
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {level === 'All' ? 'كل المستويات' : level}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
             <Button
                onClick={downloadTemplate}
                variant="outline"
                size="sm"
                className="hidden md:flex items-center gap-2 text-slate-600 hover:text-slate-900"
            >
                <FileDown size={16} />
                <span>تحميل قالب</span>
            </Button>

            <div className="flex items-center gap-2">
                <Filter size={18} className="text-slate-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat === 'All' ? 'جميع التصنيفات' : cat}</option>
                  ))}
                </select>
            </div>
          </div>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="container mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-6">
          {loadError ? (
            <div className="py-16 text-center font-bold text-red-700">{loadError}</div>
          ) : filteredRules.length > 0 ? (
            filteredRules.map((rule, idx) => (
              <div key={idx} className="relative group">
                <ExpandedGrammarRules rule={rule} />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBookmark(rule.id);
                  }}
                  className="absolute top-6 left-16 z-10 p-2 rounded-full bg-white shadow-sm border border-slate-100 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:text-red-500"
                >
                  <Bookmark size={16} className={bookmarked.includes(rule.id) ? "fill-red-500 text-red-500" : ""} />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-20 text-slate-400">
              <Search size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-xl mb-4">لا توجد قواعد تطابق بحثك</p>
              {(searchTerm || selectedLevel !== 'All' || selectedCategory !== 'All') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setSearchTerm(''); setSelectedLevel('All'); setSelectedCategory('All'); }}
                >
                  مسح البحث والفلاتر
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GrammarRulesDatabase;

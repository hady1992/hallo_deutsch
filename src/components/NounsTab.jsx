import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Trash2, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import AudioButton from '@/components/AudioButton';
import { getImportedNouns, deleteImportedNoun, clearImportedNouns, mergeWithDefaults } from '@/utils/storageManager';
import { nounsDatabase } from '@/data/nounsDatabase';

const NounsTab = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState('All');
  const [expandedId, setExpandedId] = useState(null);
  const [importedNouns, setImportedNouns] = useState([]);

  useEffect(() => {
    setImportedNouns(getImportedNouns());
    const handleUpdate = () => setImportedNouns(getImportedNouns());
    window.addEventListener('dataImported', handleUpdate);
    return () => window.removeEventListener('dataImported', handleUpdate);
  }, []);

  const allNouns = useMemo(() => {
    const defaults = Array.isArray(nounsDatabase) ? nounsDatabase : [];
    return mergeWithDefaults(importedNouns, defaults, 'noun');
  }, [importedNouns]);

  const filteredNouns = allNouns.filter(noun => {
    const searchLower = searchTerm.toLowerCase();
    const word = noun.noun || noun.word || noun.german || '';
    const matchSearch = 
      word.toLowerCase().includes(searchLower) ||
      (noun.translation || '').includes(searchLower);
    
    const nounGender = (noun.gender || '').toLowerCase();
    const nounArticle = (noun.article || '').toLowerCase();
    
    const matchGender = selectedGender === 'All' || 
      nounGender === selectedGender.toLowerCase() ||
      (selectedGender === 'Masculine' && nounArticle === 'der') ||
      (selectedGender === 'Feminine' && nounArticle === 'die') ||
      (selectedGender === 'Neuter' && nounArticle === 'das');

    return matchSearch && matchGender;
  });

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if(window.confirm("حذف هذا الاسم؟")) {
        deleteImportedNoun(id);
        toast({ title: "تم الحذف", description: "تم حذف الاسم بنجاح", className: "bg-red-50 border-red-200 text-red-800" });
    }
  };

  const handleClearAll = () => {
    if(window.confirm("هل أنت متأكد من حذف جميع الأسماء المستوردة؟")) {
        clearImportedNouns();
        toast({ title: "تم مسح الكل", className: "bg-red-50 border-red-200 text-red-800" });
    }
  };

  const getArticleColor = (article) => {
    switch(article?.toLowerCase()) {
      case 'der': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'die': return 'bg-red-100 text-red-700 border-red-200';
      case 'das': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="ابحث عن اسم..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto items-center">
            <div className="flex gap-1 overflow-x-auto pb-2 md:pb-0">
                {['All', 'Masculine', 'Feminine', 'Neuter'].map(gender => (
                    <Button
                    key={gender}
                    variant={selectedGender === gender ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedGender(gender)}
                    className={selectedGender === gender ? 'bg-slate-800' : ''}
                    >
                    {gender}
                    </Button>
                ))}
            </div>
            {importedNouns.length > 0 && (
                <Button variant="destructive" size="icon" onClick={handleClearAll} title="مسح الكل">
                    <Trash2 size={16} />
                </Button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNouns.length > 0 ? (
          filteredNouns.map((noun, idx) => {
             const word = noun.noun || noun.word || noun.german;
             const article = noun.article;
             const uniqueId = noun.id || `noun-${idx}`;
             
             return (
              <motion.div 
                key={uniqueId}
                layout
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden relative group"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className={`text-xs font-bold px-2 py-0.5 ${getArticleColor(article)}`}>
                      {article || '?'}
                    </Badge>
                    <div className="flex gap-1">
                        <AudioButton text={`${article || ''} ${word}`} size={16} />
                        {noun.isImported && (
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 text-red-300 hover:text-red-500 hover:bg-red-50"
                                onClick={(e) => handleDelete(e, uniqueId)}
                            >
                                <Trash2 size={14} />
                            </Button>
                        )}
                    </div>
                  </div>
                  
                  <h3 className="german-text text-xl font-bold text-slate-800 mb-1">{word}</h3>
                  <p className="text-slate-500 text-sm mb-3">{noun.translation || noun.arabic}</p>
                  
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono bg-slate-50 p-2 rounded justify-between">
                    <span>Plural: <span className="font-bold text-slate-600">{noun.plural || '-'}</span></span>
                  </div>
                </div>

                {(noun.example || noun.examples) && (
                  <div className="border-t border-slate-100">
                    <button 
                      onClick={() => setExpandedId(expandedId === uniqueId ? null : uniqueId)}
                      className="w-full p-2 flex items-center justify-center gap-2 text-xs text-slate-500 hover:bg-slate-50 transition-colors"
                    >
                      {expandedId === uniqueId ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {expandedId === uniqueId ? 'إخفاء الأمثلة' : 'أمثلة'}
                    </button>
                    
                    <AnimatePresence>
                      {expandedId === uniqueId && (
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden bg-slate-50"
                        >
                          <div className="p-3 text-sm space-y-2">
                            {noun.example && typeof noun.example === 'string' && (
                                <div className="border-l-2 border-blue-300 pl-2">
                                    <p className="german-text font-medium text-slate-700">{noun.example}</p>
                                </div>
                            )}
                            {Array.isArray(noun.examples) && noun.examples.map((ex, i) => (
                                <div key={i} className="border-l-2 border-blue-300 pl-2">
                                    <p className="german-text font-medium text-slate-700">{typeof ex === 'string' ? ex : ex.german}</p>
                                </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
             );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400">
            <BookOpen size={48} className="mx-auto mb-3 opacity-20" />
            <p>لا توجد نتائج</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NounsTab;
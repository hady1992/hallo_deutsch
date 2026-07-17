import React, { useState, useEffect, useRef } from 'react';
import { FileUp, Trash2, FileText, ChevronDown, ChevronUp, Search, FileDown, AlertTriangle, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getImportedGrammarRules, deleteImportedGrammarRule, clearImportedGrammarRules, saveImportedGrammarRules } from '@/utils/storageManager';
import { Badge } from '@/components/ui/badge';
import { publishContentItems } from '@/services/contentRepository';

const GrammarRulesImporter = () => {
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  // Data State
  const [rules, setRules] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('All');

  // Import State
  const [isImporting, setIsImporting] = useState(false);
  const [importStats, setImportStats] = useState(null);

  useEffect(() => {
    setRules(getImportedGrammarRules());
    const handleUpdate = () => setRules(getImportedGrammarRules());
    window.addEventListener('dataImported', handleUpdate);
    return () => window.removeEventListener('dataImported', handleUpdate);
  }, []);

  // --- Import Functionality ---

  const downloadTemplate = () => {
    const csvContent = `title,level,explanation,examples,notes
Nominativ,A1,حالة الفاعل,"Der Mann arbeitet.|Die Frau singt.",الفاعل دائماً في حالة Nominativ
Akkusativ,A1,حالة المفعول,"Ich sehe den Mann.|Sie liebt die Musik.",المفعول المباشر في حالة Akkusativ
Dativ,A2,حالة الجار والمجرور,"Ich gebe dem Mann ein Buch.",تستخدم مع الفعل geben
Genitiv,B1,حالة الإضافة,"Das Buch des Mannes.",تستخدم للملكية`;

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
    toast({
        title: "تم التحميل",
        description: "تم تحميل قالب ملف القواعد بنجاح.",
        className: "bg-green-50 border-green-200 text-green-800"
    });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
    e.target.value = ''; // Reset input
  };

  const processFile = async (file) => {
    setIsImporting(true);
    setImportStats(null);

    try {
        const text = await file.text();
        const lines = text.split(/\r\n|\n|\r/).filter(line => line.trim());

        if (lines.length < 2) throw new Error("الملف فارغ أو لا يحتوي على بيانات");

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
        const requiredHeaders = ['title', 'level', 'explanation'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

        if (missingHeaders.length > 0) {
            throw new Error(`الأعمدة التالية مفقودة: ${missingHeaders.join(', ')}`);
        }

        const newRules = [];
        let errors = 0;

        // Start from index 1 to skip header
        for (let i = 1; i < lines.length; i++) {
            try {
                // Simple CSV parser respecting quotes
                const row = [];
                let inQuote = false;
                let val = '';
                for (let char of lines[i]) {
                    if (char === '"') inQuote = !inQuote;
                    else if (char === ',' && !inQuote) { row.push(val.trim().replace(/^"|"$/g, '')); val = ''; }
                    else val += char;
                }
                row.push(val.trim().replace(/^"|"$/g, ''));

                const obj = {};
                headers.forEach((h, idx) => obj[h] = row[idx]);

                if (!obj.title || !obj.explanation) {
                    errors++;
                    continue;
                }

                // Process examples (handle pipe separated)
                let examples = [];
                if (obj.examples) {
                    examples = obj.examples.includes('|')
                        ? obj.examples.split('|').map(s => s.trim())
                        : [obj.examples];
                }

                newRules.push({
                    id: `custom_gram_${Date.now()}_${i}`,
                    title: obj.title,
                    level: obj.level || 'A1',
                    explanation: obj.explanation,
                    examples: examples,
                    notes: obj.notes || '',
                    category: 'Custom',
                    uploadedAt: new Date().toISOString()
                });
            } catch (err) {
                console.error(`Error parsing row ${i}:`, err);
                errors++;
            }
        }

        if (newRules.length === 0) throw new Error("لم يتم العثور على قواعد صالحة للاستيراد");

        // Merge with existing
        const currentRules = getImportedGrammarRules();
        const merged = [...currentRules, ...newRules];
        const publishResult = await publishContentItems('grammar', newRules);
        if (!publishResult.success) throw new Error('فشل الحفظ السحابي، لن يظهر المحتوى للزوار');
        saveImportedGrammarRules(merged);

        setImportStats({ success: newRules.length, errors });
        setRules(merged);

        toast({
            title: "تم النشر للزوار",
            description: `تمت إضافة ${newRules.length} قاعدة جديدة.`,
            className: "bg-green-50 border-green-200 text-green-800"
        });

    } catch (error) {
        toast({
            title: "خطأ في الاستيراد",
            description: error.message,
            variant: "destructive"
        });
    } finally {
        setIsImporting(false);
    }
  };

  // --- Management Functionality ---

  const handleDelete = (id) => {
    if(window.confirm("حذف هذه القاعدة؟")) {
        deleteImportedGrammarRule(id);
        toast({ title: "تم الحذف", description: "تم حذف القاعدة بنجاح", className: "bg-red-50 border-red-200 text-red-800" });
    }
  };

  const handleClearAll = () => {
    if(window.confirm("تحذير: هل أنت متأكد من حذف جميع القواعد؟")) {
        clearImportedGrammarRules();
        toast({ title: "تم مسح الكل", className: "bg-red-50 border-red-200 text-red-800" });
    }
  };

  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (rule.explanation || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'All' || (rule.level || '').toUpperCase() === filterLevel;
    return matchesSearch && matchesLevel;
  });

  const getLevelColor = (level) => {
    switch(level?.toUpperCase()) {
        case 'A1': return 'bg-red-100 text-red-800';
        case 'A2': return 'bg-green-100 text-green-800';
        case 'B1': return 'bg-amber-100 text-amber-800';
        case 'B2': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
        {/* Import Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
             <div className="flex flex-col md:flex-row gap-4 items-stretch">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".csv"
                    className="hidden"
                />

                <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImporting}
                    className="flex-1 h-auto py-6 bg-slate-900 hover:bg-slate-800 text-white shadow-md flex flex-col gap-2 rounded-xl transition-all hover:scale-[1.01]"
                >
                    {isImporting ? (
                        <Loader2 className="animate-spin h-8 w-8 text-red-400" />
                    ) : (
                        <FileUp className="h-8 w-8 text-red-400" />
                    )}
                    <div className="flex flex-col items-center">
                        <span className="text-lg font-bold">رفع ملف قواعد (CSV)</span>
                        <span className="text-slate-400 text-sm font-normal">استيراد بيانات من ملف CSV</span>
                    </div>
                </Button>

                <Button
                    onClick={downloadTemplate}
                    variant="outline"
                    className="h-auto py-6 flex flex-col gap-2 rounded-xl border-2 border-dashed border-slate-200 hover:border-red-400 hover:bg-red-50 transition-all min-w-[160px]"
                >
                    <FileDown className="h-6 w-6 text-slate-500" />
                    <div className="flex flex-col items-center">
                        <span className="font-bold text-slate-700">تحميل القالب</span>
                        <span className="text-slate-400 text-xs">ملف Excel/CSV جاهز</span>
                    </div>
                </Button>
             </div>

             {importStats && (
                <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-lg flex items-center justify-between text-sm">
                    <span className="text-green-800 flex items-center gap-2">
                        <Check size={16} /> تم إضافة {importStats.success} قاعدة بنجاح
                    </span>
                    {importStats.errors > 0 && (
                        <span className="text-amber-600 flex items-center gap-2">
                            <AlertTriangle size={16} /> تخطي {importStats.errors} صفوف (بيانات ناقصة)
                        </span>
                    )}
                </div>
             )}
        </div>

        {/* Database Management Section */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <FileText className="text-red-600" size={20} />
                قواعد النحو المسجلة ({rules.length})
            </h3>

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="بحث في القواعد..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-10 pl-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none"
                    />
                </div>
                <select
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white outline-none focus:ring-2 focus:ring-red-500"
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                >
                    <option value="All">كل المستويات</option>
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                </select>
                {rules.length > 0 && (
                    <Button variant="destructive" size="icon" onClick={handleClearAll} title="مسح الكل">
                        <Trash2 size={16} />
                    </Button>
                )}
            </div>
            </div>

            <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
            {filteredRules.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                    <FileText size={48} className="mx-auto mb-3 opacity-20" />
                    <p>لا توجد قواعد محفوظة.</p>
                </div>
            ) : (
                filteredRules.map(rule => (
                <div key={rule.id} className="border border-slate-100 rounded-xl overflow-hidden hover:shadow-md transition-all">
                    <div
                        className="p-4 flex items-start justify-between bg-white cursor-pointer hover:bg-slate-50 transition-colors"
                        onClick={() => setExpandedId(expandedId === rule.id ? null : rule.id)}
                    >
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <Badge className={cn("text-xs px-2 shadow-sm", getLevelColor(rule.level))}>{rule.level}</Badge>
                                <h4 className="font-bold text-slate-800">{rule.title}</h4>
                            </div>
                            <p className="text-sm text-slate-600 line-clamp-2 pl-4">{rule.description || rule.explanation}</p>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-slate-400"
                            >
                                {expandedId === rule.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-300 hover:text-red-600 hover:bg-red-50"
                                onClick={(e) => { e.stopPropagation(); handleDelete(rule.id); }}
                            >
                                <Trash2 size={16} />
                            </Button>
                        </div>
                    </div>

                    <AnimatePresence>
                        {expandedId === rule.id && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="bg-slate-50 border-t border-slate-100"
                            >
                                <div className="p-4 text-sm space-y-4">
                                    <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                                        <span className="font-bold text-slate-700 block mb-1 flex items-center gap-2">
                                            <div className="w-1 h-4 bg-red-500 rounded-full"></div>
                                            الشرح
                                        </span>
                                        <p className="text-slate-700 leading-relaxed">{rule.explanation}</p>
                                    </div>

                                    {(rule.examples && rule.examples.length > 0) && (
                                        <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                                            <span className="font-bold text-slate-700 block mb-2 flex items-center gap-2">
                                                <div className="w-1 h-4 bg-green-500 rounded-full"></div>
                                                أمثلة
                                            </span>
                                            <ul className="space-y-2">
                                                {Array.isArray(rule.examples)
                                                    ? rule.examples.map((ex, i) => (
                                                        <li key={i} className="flex gap-2 text-slate-600 bg-slate-50 p-2 rounded text-xs font-medium">
                                                            <span className="text-green-600 font-bold">•</span>
                                                            {typeof ex === 'string' ? ex : ex.german}
                                                        </li>
                                                    ))
                                                    : <li className="text-slate-600">{rule.examples}</li>
                                                }
                                            </ul>
                                        </div>
                                    )}

                                    {rule.notes && (
                                        <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-xs">
                                            <span className="font-bold text-amber-800 block mb-1 flex items-center gap-2">
                                                <AlertTriangle size={12} />
                                                ملاحظات
                                            </span>
                                            <p className="text-amber-700">{rule.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                ))
            )}
            </div>
        </div>
    </div>
  );
};

export default GrammarRulesImporter;

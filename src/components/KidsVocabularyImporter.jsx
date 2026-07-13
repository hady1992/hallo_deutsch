import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Download, RefreshCw, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import KidsFileUploader from './KidsFileUploader';
import { 
  getKidsVocabulary, 
  saveKidsVocabulary
} from '@/utils/storageManager';
import { kidsVocabularyData } from '@/data/kidsVocabularyData';
import { getKidsVocabularyDedupKey, splitNewUniqueItems } from '@/utils/contentDedupUtils';
import { publishContentItems } from '@/services/contentRepository';

const isImportedVocabularyItem = (item) => {
  if (!item || typeof item !== 'object') return false;

  const id = String(item.id ?? '').trim();
  const hasImportMarker = item.isImported === true
    || item.source === 'admin-import'
    || item.source === 'legacy-import'
    || Boolean(item.uploadedAt);

  return hasImportMarker || /^\d{10,}$/.test(id);
};

const KidsVocabularyImporter = ({ refreshData }) => {
  const [importedItems, setImportedItems] = useState(() => (
    getKidsVocabulary().filter(isImportedVocabularyItem)
  ));
  const { toast } = useToast();

  const handleUpload = async (data, category) => {
    // Basic validation & enhancement
    const processedData = data.map(item => ({
      ...item,
      category: category || item.category || 'general',
      image: item.image || item.icon || '📝', // Fallback icon
      german: item.german || item.word || '',
      arabic: item.arabic || item.translation || ''
    })).filter(item => item.german && item.arabic);

    if (processedData.length === 0) {
      toast({
        variant: "destructive",
        title: "بيانات غير صالحة",
        description: "لم يتم العثور على كلمات صالحة في الملف."
      });
      return;
    }

    const currentVocab = getKidsVocabulary();
    const uploadedAt = new Date().toISOString();
    const preparedItems = processedData.map((item, idx) => ({
      ...item,
      id: Date.now() + idx,
      isImported: true,
      source: 'admin-import',
      uploadedAt,
    }));
    const { unique: newItems, skipped: duplicates } = splitNewUniqueItems(
      preparedItems,
      [...kidsVocabularyData, ...currentVocab],
      getKidsVocabularyDedupKey
    );

    const publishResult = await publishContentItems('kids_vocabulary', newItems);
    if (!publishResult.success) {
      toast({
        title: "فشل النشر",
        description: "فشل الحفظ السحابي، لن يظهر المحتوى للزوار",
        variant: "destructive"
      });
      throw new Error("فشل الحفظ السحابي، لن يظهر المحتوى للزوار");
    }

    const updatedVocab = [...currentVocab, ...newItems];
    saveKidsVocabulary(updatedVocab);
    setImportedItems(prev => [...prev, ...newItems]);
    
    if(refreshData) refreshData();

    toast({
      title: "تم النشر للزوار",
      description: `تمت إضافة ${newItems.length} كلمة، وتم تجاهل مكرر: ${duplicates}.`,
      className: "bg-green-50 text-green-800"
    });
  };

  const downloadTemplate = (category) => {
    const headers = ['german', 'arabic', 'image'];
    const exampleRow = category === 'animals' ? ['Der Hund', 'الكلب', '🐶'] :
                       category === 'food' ? ['Der Apfel', 'التفاحة', '🍎'] :
                       ['Das Auto', 'السيارة', '🚗'];
    
    const csvContent = [
      headers.join(','),
      exampleRow.join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `template_${category}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAllImported = () => {
    if(!window.confirm('هل أنت متأكد من حذف جميع الكلمات المستوردة؟')) return;
    
    const allVocab = getKidsVocabulary();
    const staticVocab = allVocab.filter((item) => !isImportedVocabularyItem(item));
    
    saveKidsVocabulary(staticVocab);
    setImportedItems([]);
    if(refreshData) refreshData();
    
    toast({
      title: "تم المسح",
      description: "تم حذف جميع الكلمات المستوردة.",
    });
  };

  const categories = [
    { id: 'animals', label: 'حيوانات' },
    { id: 'colors', label: 'ألوان' },
    { id: 'food', label: 'طعام' },
    { id: 'transport', label: 'مواصلات' },
    { id: 'home', label: 'منزل' },
    { id: 'shapes', label: 'أشكال' },
    { id: 'school', label: 'مدرسة' },
  ];

  return (
    <div className="space-y-8 p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
      
      <div className="flex items-center justify-between border-b border-slate-100 pb-6">
        <div>
          <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Database className="text-blue-500" />
            إدارة قاعدة البيانات
          </h3>
          <p className="text-slate-500 mt-1">استيراد وتصدير المفردات لجميع الفئات</p>
        </div>
        
        {importedItems.length > 0 && (
          <Button 
            variant="destructive" 
            onClick={clearAllImported}
            className="flex items-center gap-2"
          >
            <Trash2 size={16} />
            حذف الكل
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Import Section */}
        <div className="space-y-6">
          <h4 className="font-bold text-lg text-slate-700">تحميل ملفات CSV</h4>
          <div className="grid gap-4">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-600">{cat.label}</span>
                <div className="flex gap-2">
                   <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => downloadTemplate(cat.id)}
                    title="تحميل النموذج"
                   >
                     <Download size={16} className="text-slate-400" />
                   </Button>
                   <KidsFileUploader 
                     label="استيراد" 
                     onUpload={(data) => handleUpload(data, cat.id)}
                   />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Section */}
        <div className="space-y-6">
          <h4 className="font-bold text-lg text-slate-700">حالة البيانات</h4>
          <div className="bg-blue-50 p-6 rounded-2xl text-center space-y-2">
            <div className="text-4xl font-black text-blue-600">{importedItems.length}</div>
            <div className="font-bold text-blue-800">كلمة مستوردة</div>
            <p className="text-xs text-blue-600/70">تضاف إلى قاعدة البيانات الأصلية</p>
          </div>

          <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {importedItems.slice().reverse().map((item, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-lg text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.image}</span>
                  <div>
                    <div className="font-bold text-slate-800">{item.german}</div>
                    <div className="text-xs text-slate-500">{item.arabic}</div>
                  </div>
                </div>
                <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">{item.category}</span>
              </div>
            ))}
            {importedItems.length === 0 && (
              <div className="text-center py-8 text-slate-400 font-bold text-sm">
                لا توجد بيانات مستوردة حالياً
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KidsVocabularyImporter;

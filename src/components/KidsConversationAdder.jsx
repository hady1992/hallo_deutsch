import React, { useState } from 'react';
import { Plus, Trash2, Save, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { getKidsSentences, saveKidsSentences } from '@/utils/storageManager';
import { publishContentItem } from '@/services/contentRepository';

const KidsConversationAdder = () => {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('General');
  const [char1, setChar1] = useState('A');
  const [char2, setChar2] = useState('B');
  const [sentences, setSentences] = useState([
    { german: '', arabic: '' },
    { german: '', arabic: '' }
  ]);

  const addSentence = () => {
    setSentences([...sentences, { german: '', arabic: '' }]);
  };

  const removeSentence = (index) => {
    if (sentences.length <= 2) return;
    const newSentences = [...sentences];
    newSentences.splice(index, 1);
    setSentences(newSentences);
  };

  const updateSentence = (index, field, value) => {
    const newSentences = [...sentences];
    newSentences[index][field] = value;
    setSentences(newSentences);
  };

  const handleSave = async () => {
    // Validation
    if (!title || !topic || !char1 || !char2) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول الأساسية", variant: "destructive" });
      return;
    }
    
    if (sentences.length < 7) {
        toast({ title: "تنبيه", description: "يجب إضافة 7 جمل على الأقل للمحادثة", variant: "warning" });
        return;
    }

    if (sentences.some(s => !s.german || !s.arabic)) {
        toast({ title: "خطأ", description: "يرجى إكمال جميع الجمل وترجمتها", variant: "destructive" });
        return;
    }

    const newConversation = {
      id: Date.now(),
      title,
      topic,
      level: 'Custom',
      characters: [char1, char2],
      sentences
    };

    const existing = getKidsSentences() || [];
    const publishResult = await publishContentItem('kids_conversations', newConversation);
    if (!publishResult.success) {
      toast({ title: "فشل النشر", description: "فشل الحفظ السحابي، لن يظهر المحتوى للزوار", variant: "destructive" });
      return;
    }
    saveKidsSentences([...existing, newConversation]);
    
    toast({ title: "تم النشر للزوار", description: "تمت إضافة المحادثة ونشرها بنجاح", className: "bg-green-500 text-white" });
    
    // Reset form
    setTitle('');
    setSentences([{ german: '', arabic: '' }, { german: '', arabic: '' }]);
  };

  return (
    <div className="bg-white p-8 rounded-[2rem] border-2 border-slate-100 shadow-sm space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-3 rounded-full text-blue-600">
          <MessageCircle size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800">إضافة محادثة جديدة</h2>
          <p className="text-slate-500">قم بإنشاء محادثات مخصصة للأطفال</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
           <label className="text-sm font-bold text-slate-700">عنوان المحادثة</label>
           <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثلاً: في المتجر" className="w-full px-4 py-2 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-200" />
        </div>
        <div className="space-y-2">
           <label className="text-sm font-bold text-slate-700">الموضوع</label>
           <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="مثلاً: التسوق" className="w-full px-4 py-2 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-200" />
        </div>
        <div className="space-y-2">
           <label className="text-sm font-bold text-slate-700">الشخصية 1</label>
           <input value={char1} onChange={(e) => setChar1(e.target.value)} placeholder="الاسم" className="w-full px-4 py-2 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-200" />
        </div>
        <div className="space-y-2">
           <label className="text-sm font-bold text-slate-700">الشخصية 2</label>
           <input value={char2} onChange={(e) => setChar2(e.target.value)} placeholder="الاسم" className="w-full px-4 py-2 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-200" />
        </div>
      </div>

      <div className="space-y-4">
         <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-700">الجمل ({sentences.length})</h3>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">يجب إضافة 7 جمل على الأقل</span>
         </div>
         
         {sentences.map((sent, idx) => (
           <div key={idx} className="flex gap-4 items-start p-4 rounded-xl bg-slate-50 border border-slate-200">
             <div className="bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center font-bold text-slate-600 shrink-0 mt-2">
               {idx + 1}
             </div>
             <div className="grid md:grid-cols-2 gap-4 flex-1">
               <input 
                 placeholder="النص بالألمانية" 
                 value={sent.german}
                 onChange={(e) => updateSentence(idx, 'german', e.target.value)}
                 dir="ltr"
                 className="w-full px-4 py-2 rounded-xl border-2 border-slate-200 bg-white focus:ring-2 focus:ring-blue-200"
               />
               <input 
                 placeholder="الترجمة العربية" 
                 value={sent.arabic}
                 onChange={(e) => updateSentence(idx, 'arabic', e.target.value)}
                 dir="rtl"
                 className="w-full px-4 py-2 rounded-xl border-2 border-slate-200 bg-white focus:ring-2 focus:ring-blue-200 text-right"
               />
             </div>
             <Button variant="ghost" size="icon" onClick={() => removeSentence(idx)} className="text-red-400 hover:text-red-600 hover:bg-red-50 mt-1">
               <Trash2 size={18} />
             </Button>
           </div>
         ))}

         <Button onClick={addSentence} variant="outline" className="w-full py-6 border-dashed border-2 text-slate-500 hover:text-blue-600 hover:border-blue-300">
            <Plus className="mr-2" /> إضافة جملة جديدة
         </Button>
      </div>

      <div className="pt-4 flex justify-end gap-4">
         <Button variant="ghost" onClick={() => {setTitle(''); setSentences([]);}}>إلغاء</Button>
         <Button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white px-8 font-bold text-lg shadow-lg shadow-green-200">
            <Save className="mr-2" size={20} /> حفظ المحادثة
         </Button>
      </div>
    </div>
  );
};

export default KidsConversationAdder;

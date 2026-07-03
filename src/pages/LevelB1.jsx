import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import LevelContent from '@/components/LevelContent';
import { LessonSection, ExampleBox, ImportantNote, ExerciseBox } from '@/components/LessonUtilities';
import AudioButton from '@/components/AudioButton';
import { getImportedLessons, deleteImportedLesson } from '@/utils/storageManager';
import { useToast } from '@/components/ui/use-toast';

function LevelB1() {
  const { toast } = useToast();
  const [customLessons, setCustomLessons] = useState([]);

  const staticSections = useMemo(() => [
    {
      title: 'الجمل الجانبية (Nebensätze: weil, dass, wenn, ob)',
      content: (
        <div>
           <LessonSection>
             <p className="text-gray-700 mb-4 leading-relaxed">
               الجمل الجانبية هي السمة الأكثر تعقيداً وتميزاً في الألمانية. القاعدة الذهبية هنا:
               <br/>
               <span className="font-bold text-red-600">الفعل المصرف يرمى إلى آخر الجملة تماماً!</span>
             </p>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
               {['weil', 'dass', 'wenn', 'ob'].map((word, idx) => (
                 <div key={idx} className="bg-orange-50 p-4 rounded border border-orange-100">
                   <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-bold text-orange-900">{word}</h5>
                      <AudioButton text={word} size={14}/>
                   </div>
                   {word === 'weil' && <p className="text-sm mt-2 font-mono text-gray-600" dir="ltr">Ich esse, weil ich Hunger <span className="font-bold text-red-500">habe</span>. <AudioButton text="Ich esse, weil ich Hunger habe" size={12}/></p>}
                   {word === 'dass' && <p className="text-sm mt-2 font-mono text-gray-600" dir="ltr">Ich weiß, dass du klug <span className="font-bold text-red-500">bist</span>. <AudioButton text="Ich weiß, dass du klug bist" size={12}/></p>}
                   {word === 'wenn' && <p className="text-sm mt-2 font-mono text-gray-600" dir="ltr">Wenn ich Zeit habe, <span className="font-bold text-red-500">komme</span> ich. <AudioButton text="Wenn ich Zeit habe, komme ich" size={12}/></p>}
                   {word === 'ob' && <p className="text-sm mt-2 font-mono text-gray-600" dir="ltr">Er fragt, ob wir <span className="font-bold text-red-500">kommen</span>. <AudioButton text="Er fragt, ob wir kommen" size={12}/></p>}
                 </div>
               ))}
             </div>
           </LessonSection>
           <ExampleBox examples={[
             { german: 'Ich kann nicht kommen, weil ich krank bin.', arabic: 'لا أستطيع القدوم لأنني مريض.' },
             { german: 'Er hat gesagt, dass er Deutsch lernt.', arabic: 'قال إنه يتعلم الألمانية.' },
             { german: 'Ich weiß nicht, ob der Zug pünktlich ist.', arabic: 'لا أعلم ما إذا كان القطار في موعده.' }
           ]} />
           <ImportantNote>
             إذا بدأت الجملة بـ Nebensatz (مثل Wenn...)، فإن الجملة الرئيسية تبدأ بالفعل مباشرة.
             <br/>
             <span dir="ltr" className="flex items-center gap-2">Wenn ich esse, <strong>trinke</strong> ich Wasser. <AudioButton text="Wenn ich esse, trinke ich Wasser" size={14}/></span>
           </ImportantNote>
        </div>
      )
    },
    // ... rest of B1 content ...
  ], []);

  const loadLessons = () => {
      const allLessons = getImportedLessons();
      setCustomLessons(allLessons.filter(l => l.level === 'B1'));
  };

  useEffect(() => {
      loadLessons();
      const handleImport = () => loadLessons();
      window.addEventListener('dataImported', handleImport);
      return () => window.removeEventListener('dataImported', handleImport);
  }, []);

  const handleDeleteLesson = (id) => {
      if(window.confirm("هل أنت متأكد من حذف هذا الدرس؟")) {
          deleteImportedLesson(id);
          toast({
              title: "تم الحذف",
              description: "تم حذف الدرس بنجاح.",
              className: "bg-red-50 border-red-200 text-red-800"
          });
      }
  };

  const allSections = [...staticSections, ...customLessons];

  return (
    <>
      <Helmet>
        <title>{'المستوى الثالث B1 - Hallo Deutsch'}</title>
        <meta name="description" content="دروس المستوى الثالث B1 في اللغة الألمانية - الجمل الجانبية، المبني للمجهول، الأفعال المنعكسة." />
      </Helmet>
      
      <LevelContent 
        title="المستوى الثالث (B1)"
        levelId="B1"
        description="في هذا المستوى المتوسط، ستتمكن من التعامل مع معظم المواقف اللغوية. ستتعلم التعبير عن رأيك، وبناء جمل معقدة، واستخدام صيغ المبني للمجهول."
        objectives={[
          "استخدام الجمل الجانبية المختلفة (dass, weil, wenn...) بطلاقة",
          "فهم واستخدام الأفعال المنعكسة وحروف الجر الخاصة بها",
          "استخدام المبني للمجهول لوصف العمليات والأحداث",
          "التعبير عن الخيارات والبدائل باستخدام أدوات الربط المزدوجة"
        ]}
        sections={allSections}
        prevLevel={{ label: "المستوى الثاني A2", path: "/level/a2" }}
        nextLevel={{ label: "المستوى الرابع B2", path: "/level/b2" }}
        onDeleteLesson={handleDeleteLesson}
      />
    </>
  );
}

export default LevelB1;
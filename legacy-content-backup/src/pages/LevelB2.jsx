import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import LevelContent from '@/components/LevelContent';
import { LessonSection, ExampleBox, ImportantNote, ExerciseBox } from '@/components/LessonUtilities';
import AudioButton from '@/components/AudioButton';
import { getImportedLessons, deleteImportedLesson } from '@/utils/storageManager';
import { useToast } from '@/components/ui/use-toast';

function LevelB2() {
  const { toast } = useToast();
  const [customLessons, setCustomLessons] = useState([]);

  const staticSections = useMemo(() => [
    {
      title: 'الجمل الموصولة (Relativsätze)',
      content: (
        <div>
          <LessonSection>
            <p className="text-gray-700 mb-4 leading-relaxed">
              الجمل الموصولة هي جمل جانبية تصف اسماً سابقاً (الاسم المرجعي). تبدأ بضمير وصل (Relativpronomen).
            </p>
            {/* ... content ... */}
          </LessonSection>
           {/* ... example box ... */}
        </div>
      )
    },
    // ... rest of B2 content ...
  ], []);

  const loadLessons = () => {
      const allLessons = getImportedLessons();
      setCustomLessons(allLessons.filter(l => l.level === 'B2'));
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
        <title>{'المستوى الرابع B2 - Hallo Deutsch'}</title>
        <meta name="description" content="دروس المستوى الرابع B2 في اللغة الألمانية - الجمل الموصولة، صيغ التمني، النصوص المعقدة." />
      </Helmet>
      
      <LevelContent 
        title="المستوى الرابع (B2)"
        levelId="B2"
        description="مرحباً بك في المستوى المتقدم. هنا ستصقل مهاراتك لتتحدث بطلاقة، تفهم الفروق الدقيقة، وتتعامل مع نصوص معقدة."
        objectives={[
          "استخدام الجمل الموصولة المعقدة بدقة",
          "التعبير عن الافتراضات والتمنيات باستخدام Konjunktiv II",
          "استخدام اللغة في سياقات رسمية وأكاديمية",
          "فهم المعاني الضمنية والتعبيرات الاصطلاحية"
        ]}
        sections={allSections}
        prevLevel={{ label: "المستوى الثالث B1", path: "/level/b1" }}
        nextLevel={null}
        onDeleteLesson={handleDeleteLesson}
      />
    </>
  );
}

export default LevelB2;
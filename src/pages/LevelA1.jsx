import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import LevelContent from '@/components/LevelContent';
import AlphabetLesson from '@/components/lessons/a1/AlphabetLesson';
import NumbersLesson from '@/components/lessons/a1/NumbersLesson';
import GreetingsLesson from '@/components/lessons/a1/GreetingsLesson';
import ColorsLesson from '@/components/lessons/a1/ColorsLesson';
import DaysMonthsLesson from '@/components/lessons/a1/DaysMonthsLesson';
import PersonalPronounsLesson from '@/components/lessons/a1/PersonalPronounsLesson';
import BasicVerbsLesson from '@/components/lessons/a1/BasicVerbsLesson';
import SimpleSentenceLesson from '@/components/lessons/a1/SimpleSentenceLesson';
import { deleteImportedLesson } from '@/utils/storageManager';
import { getLessons } from '@/services/contentRepository';
import { dedupeByKey, getLessonDedupKey } from '@/utils/contentDedupUtils';
import { useToast } from '@/components/ui/use-toast';

function LevelA1() {
  const { toast } = useToast();
  const [customLessons, setCustomLessons] = useState([]);
  
  const staticSections = useMemo(() => [
    {
      title: 'الأبجدية والنطق (Das Alphabet)',
      content: <AlphabetLesson />
    },
    {
      title: 'التحيات والتعريف بالنفس (Begrüßung)',
      content: <GreetingsLesson />
    },
    {
      title: 'الأرقام (Die Zahlen)',
      content: <NumbersLesson />
    },
    {
      title: 'الألوان (Die Farben)',
      content: <ColorsLesson />
    },
    {
      title: 'الأيام والشهور (Tage und Monate)',
      content: <DaysMonthsLesson />
    },
    {
      title: 'الضمائر الشخصية (Personalpronomen)',
      content: <PersonalPronounsLesson />
    },
    {
      title: 'الأفعال الأساسية (Basisverben)',
      content: <BasicVerbsLesson />
    },
    {
      title: 'بناء الجملة البسيطة (Der einfache Satz)',
      content: <SimpleSentenceLesson />
    }
  ], []);

  useEffect(() => {
      let active = true;
      const loadLessons = async () => {
          const lessons = await getLessons('A1');
          if (active) setCustomLessons(lessons);
      };
      loadLessons();
      window.addEventListener('dataImported', loadLessons);
      window.addEventListener('lessonsUpdated', loadLessons);
      return () => {
          active = false;
          window.removeEventListener('dataImported', loadLessons);
          window.removeEventListener('lessonsUpdated', loadLessons);
      };
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

  const allSections = useMemo(() => dedupeByKey(
      [...staticSections, ...customLessons],
      getLessonDedupKey,
      { prefer: 'first' }
  ), [staticSections, customLessons]);

  return (
    <>
      <Helmet>
        <title>{'المستوى الأول A1 - Hallo Deutsch'}</title>
        <meta name="description" content="دروس المستوى الأول A1 في اللغة الألمانية - تعلم الأساسيات والحروف والأرقام والمحادثات البسيطة." />
      </Helmet>
      
      <LevelContent 
        title="المستوى الأول (A1)"
        levelId="A1"
        description="مرحباً بك في بداية رحلتك! في هذا المستوى ستتعلم الأساسيات الضرورية للتواصل البسيط في الحياة اليومية، من الحروف والأرقام إلى بناء جملك الأولى."
        objectives={[
          "نطق الحروف والكلمات الألمانية بشكل صحيح",
          "استخدام الأرقام والتواريخ والألوان في سياقها الصحيح",
          "تقديم نفسك والآخرين وإجراء حوارات تعارف بسيطة",
          "فهم وتكوين جمل بسيطة وأسئلة مباشرة"
        ]}
        sections={allSections}
        prevLevel={null}
        nextLevel={{ label: "المستوى الثاني A2", path: "/level/a2" }}
        onDeleteLesson={handleDeleteLesson}
      />
    </>
  );
}

export default LevelA1;

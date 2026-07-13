import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import LevelContent from '@/components/LevelContent';
import { LessonSection, ExampleBox, ImportantNote, ExerciseBox } from '@/components/LessonUtilities';
import AudioButton from '@/components/AudioButton';
import { getLessons } from '@/services/contentRepository';
import { dedupeByKey, getLessonDedupKey } from '@/utils/contentDedupUtils';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { isAuthorizedAdminEmail } from '@/components/AdminGate';

function LevelA2() {
  const { user } = useAuth();
  const isAdmin = isAuthorizedAdminEmail(user?.email);
  const [customLessons, setCustomLessons] = useState([]);

  const staticSections = useMemo(() => [
    {
      title: 'الماضي التام (Das Perfekt)',
      content: (
        <div>
          <LessonSection>
            <p className="text-gray-700 mb-4 leading-relaxed">
              الماضي التام (Perfekt) هو الزمن الأكثر استخداماً في اللغة الألمانية المحكية للحديث عن الماضي.
              على عكس اللغة الإنجليزية أو العربية الفصحى، نستخدم هذا الزمن في المحادثات اليومية ورسائل البريد الإلكتروني غير الرسمية.
            </p>
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 text-center mb-6">
              <h4 className="font-bold text-blue-800 mb-3">صيغة التكوين</h4>
              <div className="text-xl flex items-center justify-center gap-2 flex-wrap" dir="ltr">
                <span className="font-bold text-blue-600">haben / sein</span> (تصريف مضارع) + ... + <span className="font-bold text-red-600">Partizip II</span> (آخر الجملة)
              </div>
            </div>
            
            <h4 className="font-bold text-gray-800 mb-2">متى نستخدم sein ومتى haben؟</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
               <div className="bg-white p-4 rounded border border-gray-200">
                 <div className="flex items-center justify-center gap-2 mb-2">
                   <span className="font-bold text-blue-600 text-lg" dir="ltr">sein</span>
                   <AudioButton text="sein" size={16}/>
                 </div>
                 <ul className="list-disc list-inside text-sm space-y-2 text-gray-600">
                   <li>أفعال الانتقال من مكان لآخر (gehen, fahren, fliegen).</li>
                   <li>أفعال تغير الحالة (aufwachen, sterben, wachsen).</li>
                   <li>أفعال خاصة: sein, bleiben, passieren.</li>
                 </ul>
               </div>
               <div className="bg-white p-4 rounded border border-gray-200">
                 <div className="flex items-center justify-center gap-2 mb-2">
                   <span className="font-bold text-green-600 text-lg" dir="ltr">haben</span>
                   <AudioButton text="haben" size={16}/>
                 </div>
                 <ul className="list-disc list-inside text-sm space-y-2 text-gray-600">
                   <li>مع جميع الأفعال المتعدية (التي تأخذ مفعول به Akkusativ).</li>
                   <li>مع الأفعال الانعكاسية (sich waschen).</li>
                   <li>مع معظم الأفعال الأخرى (schlafen, essen, arbeiten).</li>
                 </ul>
               </div>
            </div>
          </LessonSection>

          <ExampleBox examples={[
             { german: 'Ich habe gestern Fußball gespielt.', arabic: 'لعبت كرة القدم البارحة. (haben - فعل عادي)' },
             { german: 'Er ist nach Berlin gefahren.', arabic: 'سافر إلى برلين. (sein - حركة وانتقال)' },
             { german: 'Wir sind spät aufgewacht.', arabic: 'استيقظنا متأخرين. (sein - تغير حالة)' },
             { german: 'Hast du das Buch gelesen?', arabic: 'هل قرأت الكتاب؟ (haben - متعدي)' },
             { german: 'Was ist passiert?', arabic: 'ماذا حدث؟ (sein - فعل خاص)' }
          ]} />
          
          <ImportantNote>
            لاحظ أن التصريف الثالث (Partizip II) يرمى دائماً إلى <strong>نهاية الجملة</strong> تماماً. هذا "قوس الجملة" (Satzklammer) هو سمة مميزة للألمانية.
          </ImportantNote>
          
          <ExerciseBox 
            question="أكمل: Meine Eltern _____ in den Urlaub gefahren." 
            answer="sind (لأن fahren فعل حركة)" 
          />
        </div>
      )
    },
    // ... rest of A2 content ...
  ], []);

  useEffect(() => {
      let active = true;
      const loadLessons = async () => {
          const lessons = await getLessons('A2', { includeLocal: isAdmin });
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
  }, [isAdmin]);

  const allSections = useMemo(() => dedupeByKey(
      [...staticSections, ...customLessons],
      getLessonDedupKey,
      { prefer: 'first' }
  ), [staticSections, customLessons]);

  return (
    <>
      <Helmet>
        <title>{'المستوى الثاني A2 - Hallo Deutsch'}</title>
        <meta name="description" content="دروس المستوى الثاني A2 في اللغة الألمانية - الماضي التام، حروف الجر، الصفات والمقارنة." />
      </Helmet>
      
      <LevelContent 
        title="المستوى الثاني (A2)"
        levelId="A2"
        description="في هذا المستوى ستنتقل من الجمل البسيطة إلى القدرة على سرد القصص ووصف الماضي. ستركز على توسيع حصيلتك اللغوية وقدرتك على ربط الجمل."
        objectives={[
          "الحديث عن الأحداث الماضية بطلاقة باستخدام Perfekt و Präteritum",
          "وصف الأشخاص والأماكن بدقة والمقارنة بينها",
          "استخدام حروف الجر المتغيرة لتحديد الأماكن والاتجاهات",
          "فهم واستخدام أدوات الربط لتكوين نصوص مترابطة"
        ]}
        sections={allSections}
        prevLevel={{ label: "المستوى الأول A1", path: "/level/a1" }}
        nextLevel={{ label: "المستوى الثالث B1", path: "/level/b1" }}
      />
    </>
  );
}

export default LevelA2;

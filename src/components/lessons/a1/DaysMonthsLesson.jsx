import React from 'react';
import { LessonSection, ExampleBox, ImportantNote, ExerciseBox } from '@/components/LessonUtilities';
import AudioButton from '@/components/AudioButton';

const DaysMonthsLesson = () => {
  const days = [
    { de: 'Montag', ar: 'الاثنين', code: 'Mo' },
    { de: 'Dienstag', ar: 'الثلاثاء', code: 'Di' },
    { de: 'Mittwoch', ar: 'الأربعاء', code: 'Mi' },
    { de: 'Donnerstag', ar: 'الخميس', code: 'Do' },
    { de: 'Freitag', ar: 'الجمعة', code: 'Fr' },
    { de: 'Samstag', ar: 'السبت', code: 'Sa' },
    { de: 'Sonntag', ar: 'الأحد', code: 'So' },
  ];

  const months = [
    ['Januar', 'يناير'], ['Februar', 'فبراير'], ['März', 'مارس'],
    ['April', 'أبريل'], ['Mai', 'مايو'], ['Juni', 'يونيو'],
    ['Juli', 'يوليو'], ['August', 'أغسطس'], ['September', 'سبتمبر'],
    ['Oktober', 'أكتوبر'], ['November', 'نوفمبر'], ['Dezember', 'ديسمبر']
  ];

  return (
    <div>
      <LessonSection title="أيام الأسبوع (Die Wochentage)">
        <p className="mb-4 text-gray-700">
          في ألمانيا، يبدأ أسبوع العمل يوم الاثنين وينتهي يوم الجمعة. السبت والأحد هما عطلة نهاية الأسبوع (Wochenende).
          تنتهي جميع أيام الأسبوع بالمقطع <strong>-tag</strong> ما عدا الأربعاء (Mittwoch = منتصف الأسبوع).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {days.map((day, idx) => (
            <div key={idx} className={`p-3 rounded border flex items-center gap-3 ${idx >= 5 ? 'bg-red-50 border-red-100' : 'bg-white border-gray-200'}`}>
              <div className="bg-gray-200 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs">
                {day.code}
              </div>
              <div>
                <div className="font-bold text-gray-800 flex items-center gap-2">
                  {day.de}
                  <AudioButton text={day.de} size={14} />
                </div>
                <div className="text-xs text-gray-500">{day.ar}</div>
              </div>
            </div>
          ))}
        </div>
      </LessonSection>

      <LessonSection title="شهور السنة (Die Monate)">
        <p className="mb-4 text-gray-700">أسماء الشهور في الألمانية مشابهة جداً للإنجليزية.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {months.map(([m, ar], idx) => (
            <div key={idx} className="bg-white p-3 border border-gray-200 rounded text-center shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 bg-blue-50 text-blue-300 text-[40px] font-bold leading-none opacity-20 -mr-2 -mt-1 select-none">
                 {idx + 1}
               </div>
               <div className="flex items-center justify-center gap-2 mb-1 relative z-10">
                 <span className="block font-bold text-gray-800">{m}</span>
                 <AudioButton text={m} size={14} />
               </div>
               <span className="text-xs text-gray-500 block relative z-10">{ar}</span>
            </div>
          ))}
        </div>
      </LessonSection>

      <LessonSection title="فصول السنة (Die Jahreszeiten)">
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-green-50 p-3 rounded text-center border border-green-100 flex flex-col items-center">
             <span className="font-bold text-green-800 block flex items-center gap-2">
               Der Frühling <AudioButton text="Der Frühling" size={14} />
             </span>
             <span className="text-sm text-green-600">الربيع</span>
           </div>
           <div className="bg-yellow-50 p-3 rounded text-center border border-yellow-100 flex flex-col items-center">
             <span className="font-bold text-yellow-800 block flex items-center gap-2">
               Der Sommer <AudioButton text="Der Sommer" size={14} />
             </span>
             <span className="text-sm text-yellow-600">الصيف</span>
           </div>
           <div className="bg-orange-50 p-3 rounded text-center border border-orange-100 flex flex-col items-center">
             <span className="font-bold text-orange-800 block flex items-center gap-2">
               Der Herbst <AudioButton text="Der Herbst" size={14} />
             </span>
             <span className="text-sm text-orange-600">الخريف</span>
           </div>
           <div className="bg-blue-50 p-3 rounded text-center border border-blue-100 flex flex-col items-center">
             <span className="font-bold text-blue-800 block flex items-center gap-2">
               Der Winter <AudioButton text="Der Winter" size={14} />
             </span>
             <span className="text-sm text-blue-600">الشتاء</span>
           </div>
        </div>
      </LessonSection>

      <LessonSection title="أمثلة للاستخدام مع حروف الجر">
        <ExampleBox examples={[
          { german: 'Am Montag gehe ich zur Schule.', arabic: 'في يوم الاثنين أذهب للمدرسة. (am + يوم)' },
          { german: 'Im Sommer ist es heiß.', arabic: 'في الصيف يكون الطقس حاراً. (im + فصل/شهر)' },
          { german: 'Mein Geburtstag ist im Januar.', arabic: 'عيد ميلادي في يناير.' },
          { german: 'Wir haben am Wochenende frei.', arabic: 'لدينا عطلة في نهاية الأسبوع.' },
          { german: 'Was machst du am Freitag?', arabic: 'ماذا ستفعل يوم الجمعة؟' }
        ]} />
      </LessonSection>

      <ImportantNote>
        قاعدة ذهبية:
        <br/>
        الأيام وأجزاء اليوم (الصباح، المساء) تأخذ حرف الجر <strong>am</strong>.
        <br/>
        الشهور والفصول والسنين تأخذ حرف الجر <strong>im</strong>.
      </ImportantNote>

      <ExerciseBox 
        question="أكمل الجملة: _____ Mai fahre ich nach Berlin." 
        answer="Im (لأن Mai شهر)" 
      />
    </div>
  );
};

export default DaysMonthsLesson;
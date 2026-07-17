import React from 'react';
import { LessonSection, ExampleBox, ImportantNote, ExerciseBox } from '@/components/LessonUtilities';
import AudioButton from '@/components/AudioButton';

const BasicVerbsLesson = () => {
  const verbs = [
    { inf: 'sein', meaning: 'يكون (To be)', conj: ['bin', 'bist', 'ist', 'sind', 'seid', 'sind'] },
    { inf: 'haben', meaning: 'يملك (To have)', conj: ['habe', 'hast', 'hat', 'haben', 'habt', 'haben'] },
    { inf: 'wohnen', meaning: 'يسكن (To live)', conj: ['wohne', 'wohnst', 'wohnt', 'wohnen', 'wohnt', 'wohnen'] },
    { inf: 'kommen', meaning: 'يأتي (To come)', conj: ['komme', 'kommst', 'kommt', 'kommen', 'kommt', 'kommen'] },
    { inf: 'gehen', meaning: 'يذهب (To go)', conj: ['gehe', 'gehst', 'geht', 'gehen', 'geht', 'gehen'] },
    { inf: 'machen', meaning: 'يفعل (To do/make)', conj: ['mache', 'machst', 'macht', 'machen', 'macht', 'machen'] },
  ];

  return (
    <div>
      <LessonSection title="مقدمة في تصريف الأفعال">
        <p className="text-gray-700 mb-4 leading-relaxed">
          في اللغة الألمانية، الفعل هو ملك الجملة. يتغير شكل الفعل (التصريف) ليتناسب مع الفاعل.
          الأفعال تنقسم إلى قسمين: <strong>منتظمة</strong> (تتبع قاعدة ثابتة) و <strong>غير منتظمة</strong> (شاذة يجب حفظها).
        </p>
      </LessonSection>

      <LessonSection title="أهم الأفعال الشاذة (sein & haben)">
        <p className="text-gray-700 mb-4">هذان الفعلان هما الأهم على الإطلاق، ويستخدمان في آلاف الجمل يومياً.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {verbs.slice(0, 2).map((v, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-red-200 overflow-hidden shadow-sm">
              <div className="bg-red-100 p-3 border-b border-red-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-red-900 text-xl" dir="ltr">{v.inf}</span>
                  <AudioButton text={v.inf} size={18} />
                </div>
                <span className="text-red-800 font-medium">{v.meaning}</span>
              </div>
              <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="flex justify-between border-b border-gray-100 pb-1"><span>ich</span> <span className="font-bold text-gray-800">{v.conj[0]}</span></div>
                <div className="flex justify-between border-b border-gray-100 pb-1"><span>wir</span> <span className="font-bold text-gray-800">{v.conj[3]}</span></div>
                <div className="flex justify-between border-b border-gray-100 pb-1"><span>du</span> <span className="font-bold text-gray-800">{v.conj[1]}</span></div>
                <div className="flex justify-between border-b border-gray-100 pb-1"><span>ihr</span> <span className="font-bold text-gray-800">{v.conj[4]}</span></div>
                <div className="flex justify-between"><span>er/sie/es</span> <span className="font-bold text-gray-800">{v.conj[2]}</span></div>
                <div className="flex justify-between"><span>sie/Sie</span> <span className="font-bold text-gray-800">{v.conj[5]}</span></div>
              </div>
            </div>
          ))}
        </div>
      </LessonSection>

      <LessonSection title="الأفعال المنتظمة (Regelmäßige Verben)">
        <p className="text-gray-700 mb-4">
          الأفعال المنتظمة سهلة جداً. نحذف النهاية <strong>-en</strong> ونضيف نهايات ثابتة:
          <br/>
          (ich: -e), (du: -st), (er/sie/es: -t), (wir: -en), (ihr: -t), (sie/Sie: -en).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {verbs.slice(2).map((v, idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
               <div className="flex justify-between items-center font-bold text-gray-700 mb-2 border-b border-gray-200 pb-1">
                 <div className="flex items-center gap-2">
                   <span dir="ltr">{v.inf}</span>
                   <AudioButton text={v.inf} size={14} />
                 </div>
                 <span>{v.meaning}</span>
               </div>
               <div className="grid grid-cols-2 gap-2 text-xs">
                 <div>ich <span className="font-semibold text-red-600">{v.conj[0]}</span></div>
                 <div>wir <span className="font-semibold text-red-600">{v.conj[3]}</span></div>
                 <div>du <span className="font-semibold text-red-600">{v.conj[1]}</span></div>
                 <div>ihr <span className="font-semibold text-red-600">{v.conj[4]}</span></div>
                 <div>er/sie/es <span className="font-semibold text-red-600">{v.conj[2]}</span></div>
                 <div>sie/Sie <span className="font-semibold text-red-600">{v.conj[5]}</span></div>
               </div>
            </div>
          ))}
        </div>
      </LessonSection>

      <LessonSection title="أمثلة عملية (Praktische Beispiele)">
        <ExampleBox examples={[
          { german: 'Ich bin müde.', arabic: 'أنا متعب. (sein)' },
          { german: 'Du bist sehr nett.', arabic: 'أنت لطيف جداً. (sein)' },
          { german: 'Ich habe einen Bruder.', arabic: 'لدي أخ. (haben)' },
          { german: 'Er hat kein Geld.', arabic: 'ليس لديه مال. (haben)' },
          { german: 'Wir wohnen in Deutschland.', arabic: 'نحن نسكن في ألمانيا. (wohnen)' },
          { german: 'Woher kommst du?', arabic: 'من أين أنت قادم؟ (kommen)' },
          { german: 'Ich gehe nach Hause.', arabic: 'أنا ذاهب إلى المنزل. (gehen)' },
          { german: 'Was machst du heute?', arabic: 'ماذا ستفعل اليوم؟ (machen)' }
        ]} />
      </LessonSection>

      <ExerciseBox
        question="أكمل الجملة: Wir ______ Fußball. (spielen - يلعب)"
        answer="spielen (لأن الفاعل Wir يأخذ النهاية -en)"
      />
    </div>
  );
};

export default BasicVerbsLesson;
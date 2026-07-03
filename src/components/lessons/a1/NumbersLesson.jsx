import React from 'react';
import { LessonSection, ExampleBox, ImportantNote, ExerciseBox } from '@/components/LessonUtilities';
import AudioButton from '@/components/AudioButton';

const NumbersLesson = () => {
  return (
    <div>
      <LessonSection title="الأرقام الأساسية (0-12)">
        <p className="text-gray-700 mb-4">هذه الأرقام فريدة ويجب حفظها كما هي، لأنها لا تتبع قاعدة محددة وهي الأساس لكل الأرقام القادمة.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {[
            ['0', 'null', 'نُل'], ['1', 'eins', 'آينس'], ['2', 'zwei', 'تسفاي'], ['3', 'drei', 'دراي'],
            ['4', 'vier', 'فير'], ['5', 'fünf', 'فُنف'], ['6', 'sechs', 'زِكس'], ['7', 'sieben', 'زيبن'],
            ['8', 'acht', 'أخت'], ['9', 'neun', 'نوين'], ['10', 'zehn', 'تسين'], ['11', 'elf', 'إِلف'],
            ['12', 'zwölf', 'تسفُلف']
          ].map(([num, word, pron], idx) => (
            <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:border-blue-200 transition-colors relative group">
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <AudioButton text={word} size={16} />
              </div>
              <span className="text-3xl font-bold text-blue-600 mb-1">{num}</span>
              <span className="font-bold text-gray-800 text-lg">{word}</span>
              <span className="text-sm text-gray-500">{pron}</span>
            </div>
          ))}
        </div>
      </LessonSection>

      <LessonSection title="الأرقام من 13 إلى 19">
        <p className="text-gray-700 mb-4">القاعدة بسيطة: الرقم + zehn (عشرة). لاحظ التغييرات الطفيفة في 16 و 17.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {[
             { n: '13', d: 'dreizehn', a: 'ثلاثة عشر' },
             { n: '14', d: 'vierzehn', a: 'أربعة عشر' },
             { n: '15', d: 'fünfzehn', a: 'خمسة عشر' },
             { n: '16', d: 'sechzehn', a: 'ستة عشر (حذفنا s من sechs)', highlight: true },
             { n: '17', d: 'siebzehn', a: 'سبعة عشر (حذفنا en من sieben)', highlight: true },
             { n: '18', d: 'achtzehn', a: 'ثمانية عشر' },
             { n: '19', d: 'neunzehn', a: 'تسعة عشر' }
           ].map((item, idx) => (
             <div key={idx} className={`flex items-center justify-between p-3 rounded border ${item.highlight ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}`}>
               <div className="flex items-center gap-3">
                 <span className="font-bold text-xl text-blue-700 w-8">{item.n}</span>
                 <span className="font-semibold text-gray-800" dir="ltr">{item.d}</span>
                 <AudioButton text={item.d} size={14} />
               </div>
               <span className="text-sm text-gray-600">{item.a}</span>
             </div>
           ))}
        </div>
      </LessonSection>

      <LessonSection title="العشرات (20, 30, ... 90)">
        <p className="text-gray-700 mb-4">تنتهي العشرات عادة بالمقطع <strong>-zig</strong>، ما عدا 30 تنتهي بـ <strong>-ßig</strong>.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            ['20', 'zwanzig'], ['30', 'dreißig'], ['40', 'vierzig'], ['50', 'fünfzig'],
            ['60', 'sechzig'], ['70', 'siebzig'], ['80', 'achtzig'], ['90', 'neunzig']
          ].map(([n, w], idx) => (
             <div key={idx} className="bg-blue-50 p-3 rounded text-center border border-blue-100 relative group">
               <div className="absolute top-1 right-1">
                 <AudioButton text={w} size={14} />
               </div>
               <div className="font-bold text-blue-800">{n}</div>
               <div className="text-sm font-semibold">{w}</div>
             </div>
          ))}
        </div>
      </LessonSection>

      <LessonSection title="الأرقام المركبة (21-99)">
        <div className="bg-green-50 p-6 rounded-lg border border-green-200 mb-6">
          <h4 className="font-bold text-green-900 mb-4 text-center text-lg">قاعدة "واحد وعشرون"</h4>
          <p className="text-center text-green-800 mb-4">في الألمانية، نقرأ الآحاد أولاً، ثم "و" (und)، ثم العشرات. تماماً مثل اللغة العربية!</p>
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-2xl font-bold text-gray-800" dir="ltr">
             <span>eins</span>
             <span className="text-gray-400 text-sm">(واحد)</span>
             <span>+</span>
             <span>und</span>
             <span className="text-gray-400 text-sm">(و)</span>
             <span>+</span>
             <span>zwanzig</span>
             <span className="text-gray-400 text-sm">(عشرين)</span>
             <span>=</span>
             <div className="flex items-center gap-2">
               <span className="text-blue-600 bg-white px-3 py-1 rounded shadow-sm">einundzwanzig</span>
               <AudioButton text="einundzwanzig" size={20} />
             </div>
          </div>
        </div>
        
        <ExampleBox examples={[
          { german: '21 - einundzwanzig', arabic: 'واحد وعشرون (لاحظ حذف s من eins)' },
          { german: '35 - fünfunddreißig', arabic: 'خمسة وثلاثون' },
          { german: '42 - zweiundvierzig', arabic: 'اثنان وأربعون' },
          { german: '58 - achtundfünfzig', arabic: 'ثمانية وخمسون' },
          { german: '99 - neunundneunzig', arabic: 'تسعة وتسعون' },
          { german: '100 - einhundert', arabic: 'مائة' }
        ]} />
      </LessonSection>

      <LessonSection title="أمثلة حياتية للأرقام">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="bg-white p-4 rounded border border-gray-200">
             <h5 className="font-bold mb-2 border-b pb-1">الأسعار (Preise)</h5>
             <ul className="space-y-2 text-sm">
               <li className="flex justify-between items-center">
                 <span className="flex items-center gap-2">
                   Das kostet 15 Euro. <AudioButton text="Das kostet fünfzehn Euro" size={14} />
                 </span>
                 <span>هذا يكلف 15 يورو.</span>
               </li>
               <li className="flex justify-between items-center">
                 <span className="flex items-center gap-2">
                    Ein Kaffee kostet 3 Euro. <AudioButton text="Ein Kaffee kostet drei Euro" size={14} />
                 </span> 
                 <span>القهوة بـ 3 يورو.</span>
               </li>
             </ul>
           </div>
           <div className="bg-white p-4 rounded border border-gray-200">
             <h5 className="font-bold mb-2 border-b pb-1">الأعمار (Alter)</h5>
             <ul className="space-y-2 text-sm">
               <li className="flex justify-between items-center">
                 <span className="flex items-center gap-2">
                   Ich bin 28 Jahre alt. <AudioButton text="Ich bin achtundzwanzig Jahre alt" size={14} />
                 </span>
                 <span>عمري 28 سنة.</span>
               </li>
               <li className="flex justify-between items-center">
                 <span className="flex items-center gap-2">
                   Mein Sohn ist 5. <AudioButton text="Mein Sohn ist fünf" size={14} />
                 </span>
                 <span>ابني عمره 5 سنوات.</span>
               </li>
             </ul>
           </div>
        </div>
      </LessonSection>

      <ExerciseBox 
        question="اكتب الرقم 67 بالألمانية." 
        answer="siebenundsechzig (7 + و + 60)" 
      />
    </div>
  );
};

export default NumbersLesson;
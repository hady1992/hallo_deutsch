import React from 'react';
import { LessonSection, ExampleBox, ImportantNote, ExerciseBox } from '@/components/LessonUtilities';
import AudioButton from '@/components/AudioButton';

const ColorsLesson = () => {
  const colors = [
    { name: 'Rot', hex: '#ef4444', arabic: 'أحمر', desc: 'لون الدم والنار' },
    { name: 'Blau', hex: '#3b82f6', arabic: 'أزرق', desc: 'لون السماء والبحر' },
    { name: 'Gelb', hex: '#eab308', arabic: 'أصفر', desc: 'لون الشمس' },
    { name: 'Grün', hex: '#22c55e', arabic: 'أخضر', desc: 'لون العشب والطبيعة' },
    { name: 'Schwarz', hex: '#000000', arabic: 'أسود', desc: 'لون الليل' },
    { name: 'Weiß', hex: '#ffffff', arabic: 'أبيض', desc: 'لون الثلج', border: true },
    { name: 'Grau', hex: '#6b7280', arabic: 'رمادي', desc: 'بين الأبيض والأسود' },
    { name: 'Braun', hex: '#a16207', arabic: 'بني', desc: 'لون الخشب' },
    { name: 'Orange', hex: '#f97316', arabic: 'برتقالي', desc: 'لون البرتقال' },
    { name: 'Lila', hex: '#a855f7', arabic: 'بنفسجي', desc: 'لون الزهور' },
    { name: 'Rosa', hex: '#f472b6', arabic: 'زهري', desc: 'لون الوردي' },
    { name: 'Türkis', hex: '#2dd4bf', arabic: 'تركواز', desc: 'لون البحر الصافي' },
  ];

  return (
    <div>
      <LessonSection title="الألوان الأساسية (Grundfarben)">
        <p className="mb-4 text-gray-700">الألوان صفات مهمة جداً لوصف الأشياء من حولنا. إليك قائمة بالألوان الأكثر استخداماً:</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {colors.map((c, idx) => (
            <div key={idx} className="group bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-all relative">
              <div 
                className={`w-16 h-16 rounded-full mb-3 shadow-inner transition-transform group-hover:scale-110 ${c.border ? 'border border-gray-200' : ''}`} 
                style={{ backgroundColor: c.hex }}
              />
              <div className="font-bold text-gray-800 text-lg mb-1 flex items-center gap-1 justify-center">
                {c.name}
                <AudioButton text={c.name} size={14} />
              </div>
              <div className="text-sm font-medium text-blue-600 mb-1">{c.arabic}</div>
              <div className="text-xs text-gray-400">{c.desc}</div>
            </div>
          ))}
        </div>
      </LessonSection>

      <LessonSection title="درجات الألوان (Farbnuancen)">
        <p className="text-gray-700 mb-4">لجعل اللون فاتحاً أو غامقاً، نضيف كلمات بسيطة قبل اللون:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded border border-blue-100 flex items-center gap-3">
             <div className="w-10 h-10 rounded bg-sky-200"></div>
             <div>
               <span className="font-bold text-blue-900 block flex items-center gap-2">
                 Hell + blau = Hellblau
                 <AudioButton text="Hellblau" size={14} />
               </span>
               <span className="text-sm text-blue-700">أزرق فاتح</span>
             </div>
          </div>
          <div className="bg-blue-50 p-4 rounded border border-blue-100 flex items-center gap-3">
             <div className="w-10 h-10 rounded bg-blue-900"></div>
             <div>
               <span className="font-bold text-blue-900 block flex items-center gap-2">
                 Dunkel + blau = Dunkelblau
                 <AudioButton text="Dunkelblau" size={14} />
               </span>
               <span className="text-sm text-blue-700">أزرق غامق</span>
             </div>
          </div>
        </div>
      </LessonSection>

      <LessonSection title="أمثلة وصفية (Beschreibungen)">
        <ExampleBox examples={[
          { german: 'Der Himmel ist heute hellblau.', arabic: 'السماء اليوم زرقاء فاتحة.' },
          { german: 'Ich trage ein schwarzes T-Shirt.', arabic: 'أرتدي قميصاً أسوداً.' },
          { german: 'Tomaten sind rot, Bananen sind gelb.', arabic: 'الطماطم حمراء، والموز أصفر.' },
          { german: 'Deine Augen sind grün.', arabic: 'عيناك خضراوان.' },
          { german: 'Schnee ist weiß und kalt.', arabic: 'الثلج أبيض وبارد.' },
          { german: 'Ich mag die Farbe Orange.', arabic: 'أحب اللون البرتقالي.' }
        ]} />
      </LessonSection>

      <ImportantNote>
        عندما نستخدم اللون كاسم (مثلاً "أحب الأحمر")، نكتبه بحرف كبير: <strong>Das Rot</strong>.
        <br/>
        عندما نستخدمه كصفة (مثلاً "السيارة حمراء")، نكتبه بحرف صغير: <strong>rot</strong>.
      </ImportantNote>

      <ExerciseBox 
        question="كيف تقول 'سيارة زرقاء غامقة'؟" 
        answer="Ein dunkelblaues Auto." 
      />
    </div>
  );
};

export default ColorsLesson;
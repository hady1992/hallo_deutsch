import React from 'react';
import { LessonSection, PronunciationButton, ImportantNote, ExerciseBox } from '@/components/LessonUtilities';

const AlphabetLesson = () => {
  const letters = [
    { char: 'A a', pron: 'آ', example: 'Apfel (تفاحة)', exPron: 'أبفل' },
    { char: 'B b', pron: 'بِي', example: 'Buch (كتاب)', exPron: 'بوخ' },
    { char: 'C c', pron: 'تسِي', example: 'Computer (حاسوب)', exPron: 'كمبيوتر' },
    { char: 'D d', pron: 'دِي', example: 'Danke (شكراً)', exPron: 'دانكه' },
    { char: 'E e', pron: 'إِي', example: 'Esel (حمار)', exPron: 'إيزل' },
    { char: 'F f', pron: 'إِف', example: 'Fisch (سمك)', exPron: 'فِش' },
    { char: 'G g', pron: 'جِي', example: 'Gut (جيد)', exPron: 'جوت' },
    { char: 'H h', pron: 'هَا', example: 'Haus (منزل)', exPron: 'هاوس' },
    { char: 'I i', pron: 'إِي', example: 'Igel (قنفذ)', exPron: 'إيجل' },
    { char: 'J j', pron: 'يوت', example: 'Jacke (سترة)', exPron: 'ياكه' },
    { char: 'K k', pron: 'كَا', example: 'Kind (طفل)', exPron: 'كيند' },
    { char: 'L l', pron: 'إِل', example: 'Lampe (مصباح)', exPron: 'لامبه' },
    { char: 'M m', pron: 'إِم', example: 'Mund (فم)', exPron: 'موند' },
    { char: 'N n', pron: 'إِن', example: 'Nase (أنف)', exPron: 'نازه' },
    { char: 'O o', pron: 'أُو', example: 'Ohr (أذن)', exPron: 'أور' },
    { char: 'P p', pron: 'بِي', example: 'Park (حديقة)', exPron: 'بارك' },
    { char: 'Q q', pron: 'كُو', example: 'Quelle (ينبوع)', exPron: 'كفيله' },
    { char: 'R r', pron: 'إِر', example: 'Rot (أحمر)', exPron: 'روت' },
    { char: 'S s', pron: 'إِس', example: 'Sonne (شمس)', exPron: 'زونه' },
    { char: 'T t', pron: 'تِي', example: 'Tisch (طاولة)', exPron: 'تِش' },
    { char: 'U u', pron: 'أُو', example: 'Uhr (ساعة)', exPron: 'أور' },
    { char: 'V v', pron: 'فَاُو', example: 'Vogel (طائر)', exPron: 'فوجل' },
    { char: 'W w', pron: 'فِي', example: 'Wasser (ماء)', exPron: 'فاسر' },
    { char: 'X x', pron: 'إِكس', example: 'Xylophon (إكسيليفون)', exPron: 'كسيلوفون' },
    { char: 'Y y', pron: 'إِبسلون', example: 'Yoga (يوغا)', exPron: 'يوجا' },
    { char: 'Z z', pron: 'تسِت', example: 'Zoo (حديقة حيوان)', exPron: 'تسو' },
  ];

  const specialLetters = [
    { char: 'Ä ä', pron: 'إِي (ممدودة)', desc: 'ينطق مثل حرف A في كلمة Air الإنجليزية.', example: 'Mädchen (فتاة)' },
    { char: 'Ö ö', pron: 'أُو (مفخمة)', desc: 'ينطق بضم الشفاه وتفخيم الصوت، مثل Bird بالإنجليزية.', example: 'Schön (جميل)' },
    { char: 'Ü ü', pron: 'إِي (مضمومة)', desc: 'صوت بين الياء والواو، مثل حرف U في اللغة الفرنسية.', example: 'München (ميونخ)' },
    { char: 'ß', pron: 'إِس تسِت', desc: 'يسمى "Scharfes S" وينطق كحرف سين مشددة (ss).', example: 'Straße (شارع)' },
  ];

  return (
    <div>
      <LessonSection title="الحروف الألمانية الأساسية (Das Alphabet)">
        <p className="mb-4 text-gray-700 leading-relaxed">
          تتكون الأبجدية الألمانية من 26 حرفاً أساسياً مثل اللغة الإنجليزية تماماً، ولكن النطق يختلف في بعض الحروف بشكل جوهري. 
          التمكن من الأبجدية هو مفتاح القراءة الصحيحة، حيث أن الألمانية لغة تُقرأ كما تُكتب غالباً.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {letters.map((l, idx) => (
            <div key={idx} className="bg-white p-4 rounded border border-gray-100 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center w-full">
                <span className="text-2xl font-bold text-blue-600 font-mono">{l.char}</span>
                <PronunciationButton text="استمع" pronunciation={l.pron} />
              </div>
              <div className="text-sm text-gray-600 flex justify-between border-t pt-2 mt-1">
                <span dir="ltr" className="font-semibold">{l.example}</span>
                <span className="text-gray-400 text-xs">{l.exPron}</span>
              </div>
            </div>
          ))}
        </div>
      </LessonSection>

      <LessonSection title="الحروف الصوتية الخاصة (Umlaute)">
        <p className="mb-4 text-gray-700 leading-relaxed">
          هذه الحروف تميز اللغة الألمانية وتعطيها طابعها الخاص. تغيير النقاط فوق الحرف يغير المعنى تماماً، لذا يجب الانتباه لها جيداً.
        </p>
        <div className="grid grid-cols-1 gap-4">
          {specialLetters.map((l, idx) => (
            <div key={idx} className="bg-amber-50 p-4 rounded-lg border border-amber-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-amber-700 w-12 text-center">{l.char}</span>
                <div>
                  <div className="font-bold text-gray-800 mb-1">{l.pron}</div>
                  <div className="text-sm text-gray-600">{l.desc}</div>
                </div>
              </div>
              <div className="bg-white px-4 py-2 rounded border border-amber-200 min-w-[150px] text-center">
                <span dir="ltr" className="font-bold text-gray-800 block">{l.example}</span>
              </div>
            </div>
          ))}
        </div>
      </LessonSection>

      <ImportantNote>
        <h4 className="font-bold mb-2">قواعد نطق ذهبية:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>حرف <strong>W</strong> ينطق دائماً مثل "V" الإنجليزية (فِي). مثال: <em>Wasser</em> (فاسر).</li>
          <li>حرف <strong>V</strong> ينطق غالباً مثل "F" الإنجليزية (إِف). مثال: <em>Vater</em> (فاتر).</li>
          <li>حرف <strong>Z</strong> ينطق دائماً مثل "تس" (ts). مثال: <em>Zeit</em> (تسايت).</li>
          <li>حرف <strong>J</strong> ينطق مثل "Y" الإنجليزية (ي). مثال: <em>Ja</em> (يا).</li>
          <li>المقطع <strong>ei</strong> ينطق "آي". مثال: <em>Nein</em> (ناين).</li>
          <li>المقطع <strong>ie</strong> ينطق "إِي" ممدودة. مثال: <em>Liebe</em> (ليبه).</li>
        </ul>
      </ImportantNote>

      <ExerciseBox 
        question="بناءً على القواعد السابقة، كيف تنطق كلمة 'Wein' (نبيذ)؟" 
        answer="فاين (لأن W تنطق V، و ei تنطق آي)" 
      />
      <ExerciseBox 
        question="كيف تنطق كلمة 'Vier' (أربعة)؟" 
        answer="فير (لأن V تنطق F، و ie تنطق إي ممدودة)" 
      />
    </div>
  );
};

export default AlphabetLesson;
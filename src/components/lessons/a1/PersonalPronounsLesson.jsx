import React from 'react';
import { LessonSection, ExampleBox, ImportantNote, ExerciseBox } from '@/components/LessonUtilities';
import AudioButton from '@/components/AudioButton';

const PersonalPronounsLesson = () => {
  return (
    <div>
      <LessonSection title="الضمائر الشخصية في حالة الرفع (Nominativ)">
        <p className="mb-4 text-gray-700">الضمائر هي كلمات قصيرة تحل محل الأسماء وتساعدنا على تجنب التكرار. في الألمانية، التمييز بين المخاطب الرسمي وغير الرسمي مهم جداً.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Singular */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-red-50 p-3 text-center font-bold text-red-800 border-b border-red-100">المفرد (Singular)</div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="p-3 font-bold text-gray-700 w-24 align-middle" dir="ltr">
                    <div className="flex items-center gap-2">ich <AudioButton text="ich" size={14}/></div>
                  </td>
                  <td className="p-3 text-gray-600">أنا (المتكلم)</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-gray-700 align-middle" dir="ltr">
                    <div className="flex items-center gap-2">du <AudioButton text="du" size={14}/></div>
                  </td>
                  <td className="p-3 text-gray-600">أنتَ / أنتِ (مخاطب غير رسمي - صديق/طفل)</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-gray-700 align-middle" dir="ltr">
                    <div className="flex items-center gap-2">er <AudioButton text="er" size={14}/></div>
                  </td>
                  <td className="p-3 text-gray-600">هو (للغائب المذكر)</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-gray-700 align-middle" dir="ltr">
                    <div className="flex items-center gap-2">sie <AudioButton text="sie" size={14}/></div>
                  </td>
                  <td className="p-3 text-gray-600">هي (للغائب المؤنث)</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-gray-700 align-middle" dir="ltr">
                    <div className="flex items-center gap-2">es <AudioButton text="es" size={14}/></div>
                  </td>
                  <td className="p-3 text-gray-600">هو/هي (للغائب المحايد - مثل "الطفل" أو "الفتاة")</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Plural */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-green-50 p-3 text-center font-bold text-green-800 border-b border-green-100">الجمع (Plural)</div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="p-3 font-bold text-gray-700 w-24 align-middle" dir="ltr">
                    <div className="flex items-center gap-2">wir <AudioButton text="wir" size={14}/></div>
                  </td>
                  <td className="p-3 text-gray-600">نحن (المتكلمون)</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-gray-700 align-middle" dir="ltr">
                    <div className="flex items-center gap-2">ihr <AudioButton text="ihr" size={14}/></div>
                  </td>
                  <td className="p-3 text-gray-600">أنتم / أنتن (مخاطب جمع غير رسمي - يا شباب)</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-gray-700 align-middle" dir="ltr">
                    <div className="flex items-center gap-2">sie <AudioButton text="sie" size={14}/></div>
                  </td>
                  <td className="p-3 text-gray-600">هم / هن (للغائب الجمع)</td>
                </tr>
                <tr className="bg-yellow-50">
                  <td className="p-3 font-bold text-gray-700 border-l-4 border-yellow-400 align-middle" dir="ltr">
                    <div className="flex items-center gap-2">Sie <AudioButton text="Sie" size={14}/></div>
                  </td>
                  <td className="p-3 text-gray-800 font-medium">حضرتك / حضراتكم (صيغة الاحترام للمفرد والجمع)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </LessonSection>

      <LessonSection title="أمثلة توضيحية شاملة">
        <ExampleBox examples={[
          { german: 'Ich heiße Max. Ich bin Student.', arabic: 'اسمي ماكس. أنا طالب.' },
          { german: 'Das ist Anna. Sie kommt aus Berlin.', arabic: 'هذه آنا. هي قادمة من برلين.' },
          { german: 'Woher kommst du, Ahmed?', arabic: 'من أين أنت يا أحمد؟ (غير رسمي)' },
          { german: 'Woher kommen Sie, Herr Müller?', arabic: 'من أين حضرتك يا سيد مولر؟ (رسمي)' },
          { german: 'Wir lernen Deutsch zusammen.', arabic: 'نحن نتعلم الألمانية معاً.' },
          { german: 'Seid ihr fertig?', arabic: 'هل أنتم جاهزون؟' },
          { german: 'Das Kind spielt. Es ist glücklich.', arabic: 'الطفل يلعب. هو (المحايد) سعيد.' }
        ]} />
      </LessonSection>

      <ImportantNote>
        <h4 className="font-bold mb-1">كيف تفرق بين sie و Sie؟</h4>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li><strong>sie</strong> (صغيرة): تعني "هي" (إذا كان الفعل مفرداً) أو "هم" (إذا كان الفعل جمعاً).</li>
          <li><strong>Sie</strong> (كبيرة): تعني "حضرتك" وتكتب دائماً بحرف كبير وتأخذ فعل الجمع دائماً.</li>
        </ul>
      </ImportantNote>

      <ExerciseBox
        question="ما هو الضمير المناسب للحديث عن مجموعة أصدقاء تخاطبهم؟"
        answer="ihr (أنتم)"
      />
    </div>
  );
};

export default PersonalPronounsLesson;
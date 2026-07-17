import React from 'react';
import { LessonSection, ExampleBox, ImportantNote, ExerciseBox } from '@/components/LessonUtilities';
import AudioButton from '@/components/AudioButton';

const GreetingsLesson = () => {
  const dialogues = [
    {
      title: "لقاء غير رسمي (بين الأصدقاء)",
      lines: [
        { speaker: "Ahmed", text: "Hallo, Sarah!", trans: "مرحباً سارة!" },
        { speaker: "Sarah", text: "Hallo Ahmed! Wie geht es dir?", trans: "أهلاً أحمد! كيف حالك؟" },
        { speaker: "Ahmed", text: "Danke, gut. Und dir?", trans: "شكراً، بخير. وأنتِ؟" },
        { speaker: "Sarah", text: "Auch gut, danke.", trans: "بخير أيضاً، شكراً." }
      ]
    },
    {
      title: "لقاء رسمي (في العمل أو مع الغرباء)",
      lines: [
        { speaker: "Frau Müller", text: "Guten Tag, Herr Schmidt.", trans: "نهار سعيد سيد شميدت." },
        { speaker: "Herr Schmidt", text: "Guten Tag, Frau Müller. Wie geht es Ihnen?", trans: "نهار سعيد سيدة مولر. كيف حال حضرتك؟" },
        { speaker: "Frau Müller", text: "Sehr gut, danke. Und Ihnen?", trans: "جيد جداً، شكراً. وحضرتك؟" },
        { speaker: "Herr Schmidt", text: "Es geht mir gut, danke.", trans: "أنا بخير، شكراً." }
      ]
    }
  ];

  return (
    <div>
      <LessonSection title="التحيات حسب الوقت (Die Begrüßung)">
        <p className="mb-4 text-gray-700">يستخدم الألمان تحيات محددة بناءً على وقت اليوم. الدقة في اختيار التحية تعكس احترامك للوقت وللآخرين.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-4 rounded-lg border border-amber-100">
            <h4 className="font-bold text-amber-800 mb-3 border-b border-amber-200 pb-2">تحيات النهار</h4>
            <ul className="space-y-3">
              <li className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-800">Guten Morgen</span>
                  <AudioButton text="Guten Morgen" size={14} />
                </div>
                <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded">6:00 - 11:00 صباحاً</span>
              </li>
              <li className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-800">Guten Tag</span>
                  <AudioButton text="Guten Tag" size={14} />
                </div>
                <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded">11:00 - 18:00 (طوال النهار)</span>
              </li>
              <li className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-800">Mahlzeit</span>
                  <AudioButton text="Mahlzeit" size={14} />
                </div>
                <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded">وقت الغداء (في العمل)</span>
              </li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-red-50 p-4 rounded-lg border border-amber-100">
            <h4 className="font-bold text-amber-800 mb-3 border-b border-amber-200 pb-2">تحيات المساء والوداع</h4>
            <ul className="space-y-3">
              <li className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-800">Guten Abend</span>
                  <AudioButton text="Guten Abend" size={14} />
                </div>
                <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded">بدءاً من 18:00 مساءً</span>
              </li>
              <li className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-800">Gute Nacht</span>
                  <AudioButton text="Gute Nacht" size={14} />
                </div>
                <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded">عند الذهاب للنوم فقط</span>
              </li>
              <li className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-800">Auf Wiedersehen</span>
                  <AudioButton text="Auf Wiedersehen" size={14} />
                </div>
                <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded">إلى اللقاء (رسمي)</span>
              </li>
            </ul>
          </div>
        </div>
      </LessonSection>

      <LessonSection title="حوارات تطبيقية (Dialoge)">
        <div className="space-y-6">
          {dialogues.map((dialog, idx) => (
            <div key={idx} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 font-bold text-gray-700">
                {dialog.title}
              </div>
              <div className="p-4 space-y-4">
                {dialog.lines.map((line, lIdx) => (
                  <div key={lIdx} className={`flex flex-col ${lIdx % 2 === 0 ? 'items-start' : 'items-end'}`}>
                    <div className={`max-w-[80%] rounded-lg p-3 ${lIdx % 2 === 0 ? 'bg-red-50 text-red-900 rounded-tr-none' : 'bg-green-50 text-green-900 rounded-tl-none'}`}>
                      <span className="text-xs font-bold block mb-1 opacity-70">{line.speaker}</span>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-lg mb-1" dir="ltr">{line.text}</p>
                        <AudioButton text={line.text} size={16} />
                      </div>
                      <p className="text-sm opacity-80 border-t border-black/10 pt-1 mt-1">{line.trans}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </LessonSection>

      <LessonSection title="جمل التعريف بالنفس (Sich vorstellen)">
        <ExampleBox examples={[
          { german: 'Ich heiße Sarah.', arabic: 'اسمي سارة.', pronunciation: 'إيش هايسه سارة' },
          { german: 'Mein Name ist Ahmed.', arabic: 'اسمي أحمد.', pronunciation: 'ماين نامه إست أحمد' },
          { german: 'Ich bin 25 Jahre alt.', arabic: 'عمري 25 سنة.', pronunciation: 'إيش بن 25 ياره ألت' },
          { german: 'Ich komme aus Ägypten.', arabic: 'أنا من مصر.', pronunciation: 'إيش كومه أوس إجيبتن' },
          { german: 'Ich wohne in Kairo.', arabic: 'أسكن في القاهرة.', pronunciation: 'إيش فونه إن كايرو' },
          { german: 'Ich spreche Arabisch und etwas Deutsch.', arabic: 'أتحدث العربية وقليلاً من الألمانية.', pronunciation: 'إيش شبريخه أرابيش أوند إتفاس دويتش' }
        ]} />
      </LessonSection>

      <ImportantNote>
        <span className="font-bold">ملاحظة ثقافية:</span> في ألمانيا، السؤال "Wie geht es dir?" (كيف حالك؟) ليس مجرد تحية عابرة دائماً. قد يتوقع الشخص إجابة صادقة ومختصرة عن حالك، وليس مجرد "بخير" آلية.
      </ImportantNote>

      <ExerciseBox
        question="ماذا تقول لشخص تقابله الساعة 10 صباحاً في سياق رسمي؟"
        answer="Guten Morgen (صباح الخير)"
      />
    </div>
  );
};

export default GreetingsLesson;
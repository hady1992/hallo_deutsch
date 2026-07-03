import React from 'react';
import { LessonSection, ExampleBox, ImportantNote, ExerciseBox } from '@/components/LessonUtilities';

const SimpleSentenceLesson = () => {
  return (
    <div>
      <LessonSection title="تركيب الجملة الألمانية (Satzbau)">
        <p className="text-gray-700 mb-4 text-lg">
          أهم قاعدة في اللغة الألمانية هي: <br/>
          <span className="font-bold text-blue-700 block mt-2 text-center text-xl bg-blue-50 p-2 rounded">الفعل دائماً في المركز الثاني!</span>
        </p>
        
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="font-bold text-gray-800 mb-2">1. الجملة الخبرية (Aussagesatz)</h4>
            <div className="flex flex-col md:flex-row gap-2 items-center justify-center text-center p-3 bg-gray-50 rounded mb-3" dir="ltr">
               <span className="bg-green-100 text-green-800 px-3 py-1 rounded">Position 1 (Subject)</span>
               <span className="font-bold text-gray-400">+</span>
               <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded font-bold border-2 border-blue-200">Position 2 (Verb)</span>
               <span className="font-bold text-gray-400">+</span>
               <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded">Rest</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">يمكن للفاعل أن يتبادل الأماكن مع "باقي الجملة"، لكن الفعل يبقى ثابتاً في المركز 2.</p>
            <ExampleBox examples={[
              { german: 'Ich lerne heute Deutsch.', arabic: 'أنا أتعلم اليوم الألمانية. (الفاعل أولاً)' },
              { german: 'Heute lerne ich Deutsch.', arabic: 'اليوم أتعلم أنا الألمانية. (الظرف أولاً - لاحظ الفعل بقي رقم 2!)' }
            ]} />
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="font-bold text-gray-800 mb-2">2. السؤال بأداة استفهام (W-Frage)</h4>
            <div className="flex flex-col md:flex-row gap-2 items-center justify-center text-center p-3 bg-gray-50 rounded mb-3" dir="ltr">
               <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded font-bold">W-Wort</span>
               <span className="font-bold text-gray-400">+</span>
               <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded font-bold border-2 border-blue-200">Verb</span>
               <span className="font-bold text-gray-400">+</span>
               <span className="bg-green-100 text-green-800 px-3 py-1 rounded">Subject</span>
            </div>
            <ExampleBox examples={[
              { german: 'Wo wohnst du?', arabic: 'أين تسكن أنت؟' },
              { german: 'Was machst du?', arabic: 'ماذا تفعل أنت؟' },
              { german: 'Wie heißt er?', arabic: 'ما اسمه؟' }
            ]} />
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="font-bold text-gray-800 mb-2">3. السؤال بنعم أو لا (Ja/Nein-Frage)</h4>
            <p className="text-sm text-gray-600 mb-2">هنا فقط يأتي الفعل في المركز الأول!</p>
            <div className="flex flex-col md:flex-row gap-2 items-center justify-center text-center p-3 bg-gray-50 rounded mb-3" dir="ltr">
               <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded font-bold border-2 border-blue-200">Verb</span>
               <span className="font-bold text-gray-400">+</span>
               <span className="bg-green-100 text-green-800 px-3 py-1 rounded">Subject</span>
               <span className="font-bold text-gray-400">+</span>
               <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded">Rest</span>
               <span className="font-bold text-gray-400">?</span>
            </div>
            <ExampleBox examples={[
              { german: 'Wohnst du in Berlin?', arabic: 'هل تسكن في برلين؟' },
              { german: 'Hast du Zeit?', arabic: 'هل لديك وقت؟' }
            ]} />
          </div>
        </div>
      </LessonSection>

      <ImportantNote>
        تذكر دائماً: في الجملة العادية، لا يهم بماذا تبدأ (الفاعل، الزمان، المكان)، المهم أن يأتي <strong>الفعل المصرف في المركز الثاني</strong> مباشرة.
      </ImportantNote>

      <ExerciseBox 
        question="رتب الجملة: (Fußball - spiele - ich - heute)" 
        answer="Ich spiele heute Fußball. / Heute spiele ich Fußball." 
      />
    </div>
  );
};

export default SimpleSentenceLesson;
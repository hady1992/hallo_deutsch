import React from 'react';
import { ArrowLeft, BookOpenCheck, CheckCircle2, ClipboardList, RotateCcw, TriangleAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PlacementSkillProfile from './PlacementSkillProfile';

const PlacementResult = ({ result, suggestedContentAvailable, onReview, onRestart }) => (
  <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-24 md:px-8" dir="rtl">
    <header className="border-b border-black/10 pb-8">
      <p className="font-bold text-[#b08000]">نتيجة تشخيصية وفق CEFR</p>
      <h1 className="mt-2 text-3xl font-black text-[#111111] md:text-5xl">نتيجة اختبار تحديد المستوى</h1>
      <p className="mt-3 max-w-3xl leading-7 text-slate-600">
        هذا التقدير يساعدك على اختيار نقطة بداية مناسبة، ولا يُعد شهادة لغة رسمية.
      </p>
    </header>

    {result.timedOut && (
      <p role="status" className="mt-6 rounded-md border border-amber-300 bg-amber-50 px-5 py-4 font-bold text-amber-900">
        انتهى الاختبار بسبب انتهاء الوقت، وتم تقييم الإجابات التي أرسلتها فقط.
      </p>
    )}

    <section className="mt-7 grid gap-5 md:grid-cols-2">
      <article className="rounded-md border border-black/10 bg-[#111111] p-6 text-white">
        <p className="font-bold text-white/65">المستوى المقدر حاليًا</p>
        <p className="mt-3 text-5xl font-black text-[#f2c221]">{result.estimatedLevel}</p>
      </article>
      <article className="rounded-md border border-[#d71920]/20 bg-white p-6">
        <p className="font-bold text-slate-500">المستوى المقترح للدراسة</p>
        <p className="mt-3 text-5xl font-black text-[#d71920]">{result.suggestedDisplay}</p>
      </article>
    </section>

    <section className="mt-7 grid gap-5 border-y border-black/10 py-7 sm:grid-cols-3">
      <div>
        <p className="text-sm font-bold text-slate-500">درجة الثقة</p>
        <p className="mt-1 text-2xl font-black text-[#111111]">{result.confidence}</p>
      </div>
      <div>
        <p className="text-sm font-bold text-slate-500">الأسئلة المجاب عنها</p>
        <p className="mt-1 text-2xl font-black text-[#111111]">{result.total}</p>
      </div>
      <div>
        <p className="text-sm font-bold text-slate-500">النتيجة الإجمالية</p>
        <p className="mt-1 text-2xl font-black text-[#111111]">{result.correct} من {result.total} ({result.percentage}%)</p>
      </div>
    </section>

    <section className="mt-8" aria-labelledby="level-results-heading">
      <h2 id="level-results-heading" className="text-xl font-black text-[#111111]">نتائج المستويات المختبرة</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {result.levelResults.map((levelResult) => (
          <article key={levelResult.level} className="flex items-center justify-between rounded-md border border-black/10 bg-white p-4">
            <div>
              <h3 className="text-lg font-black">{levelResult.level}</h3>
              <p className="text-sm text-slate-500">{levelResult.score} من {levelResult.total}</p>
            </div>
            <span className={`font-bold ${levelResult.passed ? 'text-green-700' : 'text-red-700'}`}>
              {levelResult.passed ? 'اجتاز' : 'لم يجتز'}
            </span>
          </article>
        ))}
      </div>
    </section>

    <div className="mt-9">
      <PlacementSkillProfile skills={result.skillProfile} />
    </div>

    <section className="mt-9 grid gap-5 md:grid-cols-2">
      <article className="rounded-md border border-green-200 bg-green-50 p-5">
        <h2 className="flex items-center gap-2 font-black text-green-900"><CheckCircle2 size={20} /> نقاط القوة</h2>
        <p className="mt-3 leading-7 text-green-900">
          {result.strengths.length > 0 ? result.strengths.join('، ') : 'تحتاج النتائج الحالية إلى مزيد من الأسئلة لإظهار نقطة قوة ثابتة.'}
        </p>
      </article>
      <article className="rounded-md border border-amber-200 bg-amber-50 p-5">
        <h2 className="flex items-center gap-2 font-black text-amber-900"><TriangleAlert size={20} /> مهارات تحتاج مراجعة</h2>
        <p className="mt-3 leading-7 text-amber-900">
          {result.reviewSkills.length > 0 ? result.reviewSkills.join('، ') : 'لا توجد مهارة تحت حد المراجعة في الأسئلة المجاب عنها.'}
        </p>
      </article>
    </section>

    <section className="mt-7 rounded-md border-r-4 border-[#d71920] bg-white p-6 shadow-sm">
      <h2 className="flex items-center gap-2 font-black text-[#111111]"><BookOpenCheck size={21} /> التوصية</h2>
      <p className="mt-3 leading-8 text-slate-700">{result.recommendation}</p>
      <p className="mt-3 text-sm font-bold text-slate-500">هذا الاختبار لا يقيس مستوى C1.</p>
    </section>

    <p className="mt-7 rounded-md bg-slate-100 px-5 py-4 text-sm leading-7 text-slate-700">
      النتيجة تشخيصية، ولا تشمل تقييمًا مباشرًا للكتابة الحرة أو المحادثة الشفهية.
    </p>

    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      {suggestedContentAvailable === true && (
        <Button asChild className="brand-focus min-h-12 gap-2 bg-[#d71920] text-white hover:bg-[#b91218]">
          <Link to={`/level/${result.suggestedLevel.toLowerCase()}`}>
            الانتقال إلى المستوى المقترح <ArrowLeft size={18} />
          </Link>
        </Button>
      )}
      {suggestedContentAvailable === false && (
        <p className="flex min-h-12 items-center rounded-md border border-black/10 bg-white px-4 font-bold text-slate-600">
          محتوى المستوى المقترح قيد الإعداد حاليًا.
        </p>
      )}
      <Button type="button" variant="outline" onClick={onReview} className="brand-focus min-h-12 gap-2">
        <ClipboardList size={18} /> مراجعة الإجابات
      </Button>
      <Button type="button" variant="outline" onClick={onRestart} className="brand-focus min-h-12 gap-2">
        <RotateCcw size={18} /> إعادة الاختبار
      </Button>
    </div>
  </main>
);

export default PlacementResult;

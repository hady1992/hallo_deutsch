import React from 'react';
import { Clock3, FileCheck2, Headphones, PlayCircle, RotateCcw, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const facts = [
  'متوافق مع مستويات CEFR من A1 إلى B2.',
  'اختبار تشخيصي وليس شهادة رسمية.',
  'يتضمن القواعد والمفردات والقراءة والاستماع.',
  'عدد الأسئلة يتغير حسب الأداء.',
  'المدة القصوى 45 دقيقة.',
  'لا يمكن رؤية التصحيح أثناء الاختبار.',
  'استخدم سماعات الرأس لأسئلة الاستماع.',
];

const PlacementTestIntro = ({ hasSavedAttempt, onStart, onResume, onStartNew }) => (
  <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-28 md:px-8" dir="rtl">
    <section className="overflow-hidden rounded-md border border-black/10 bg-white shadow-sm">
      <header className="border-b border-black/10 bg-[#111111] px-6 py-10 text-white md:px-10">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-[#d71920]">
          <FileCheck2 aria-hidden="true" />
        </div>
        <p className="font-bold text-[#f2c221]">CEFR Placement Test</p>
        <h1 className="mt-2 max-w-3xl text-3xl font-black leading-tight md:text-5xl">
          اختبار تحديد المستوى في اللغة الألمانية
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-white/75">
          تقييم تكيفي هادئ يقدّر مستواك الحالي ويقترح نقطة البداية الأنسب للدراسة.
        </p>
      </header>

      <div className="grid gap-8 p-6 md:grid-cols-[1fr_280px] md:p-10">
        <ul className="grid gap-3" aria-label="معلومات الاختبار">
          {facts.map((fact) => (
            <li key={fact} className="flex items-start gap-3 leading-7 text-slate-700">
              <ShieldCheck className="mt-1 shrink-0 text-[#b91218]" size={18} aria-hidden="true" />
              <span>{fact}</span>
            </li>
          ))}
        </ul>

        <aside className="border-t border-black/10 pt-6 md:border-r md:border-t-0 md:pr-7 md:pt-0">
          <div className="space-y-4 text-sm font-bold text-slate-700">
            <p className="flex items-center gap-2"><Clock3 size={18} className="text-[#b08000]" /> 45 دقيقة كحد أقصى</p>
            <p className="flex items-center gap-2"><Headphones size={18} className="text-[#b08000]" /> الاستماع ضمن التقييم</p>
          </div>

          <div className="mt-7 grid gap-3">
            {hasSavedAttempt ? (
              <>
                <Button type="button" onClick={onResume} className="brand-focus min-h-12 gap-2 bg-[#d71920] text-white hover:bg-[#b91218]">
                  <PlayCircle size={20} /> متابعة الاختبار
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="outline" className="brand-focus min-h-12 gap-2">
                      <RotateCcw size={18} /> بدء محاولة جديدة
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent dir="rtl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>بدء محاولة جديدة؟</AlertDialogTitle>
                      <AlertDialogDescription>
                        سيُحذف تقدم المحاولة الحالية فقط، ولن تتأثر أي بيانات أخرى في المتصفح.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0">
                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                      <AlertDialogAction onClick={onStartNew} className="bg-[#d71920] hover:bg-[#b91218]">
                        بدء محاولة جديدة
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : (
              <Button type="button" onClick={onStart} className="brand-focus min-h-12 gap-2 bg-[#d71920] text-white hover:bg-[#b91218]">
                <PlayCircle size={20} /> ابدأ الاختبار
              </Button>
            )}
          </div>
        </aside>
      </div>
    </section>
  </main>
);

export default PlacementTestIntro;

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, CheckCircle2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { LessonRenderBoundary } from '@/components/SafeLessonRenderer';
import LessonOutline from '@/components/course/LessonOutline';
import LessonStepContent from '@/components/course/LessonStepContent';
import LessonStepNavigation from '@/components/course/LessonStepNavigation';
import { buildLessonSteps, resolveLessonStepId } from '@/utils/lessonSteps';
import { getLessonStepProgress, saveLessonStepProgress } from '@/utils/lessonStepProgress';

const LessonPlayer = ({ lesson: rawLesson, onLessonComplete, completionContent }) => {
  const { lesson, steps } = useMemo(() => buildLessonSteps(rawLesson), [rawLesson]);
  const lessonKey = `${lesson.slug || lesson.supabaseId || lesson.id || 'lesson'}-lesson`;
  const lessonActivityKey = lesson.id || lesson.supabaseId || lesson.slug || lessonKey;
  const initialProgress = useMemo(() => getLessonStepProgress(lessonKey), [lessonKey]);
  const validStepIds = useMemo(() => new Set(steps.map((step) => step.id)), [steps]);
  const hiddenCompletedStepIds = useMemo(
    () => initialProgress.completedStepIds.filter((stepId) => !validStepIds.has(stepId)),
    [initialProgress, validStepIds]
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedStepId = searchParams.get('step');
  const initialStepId = resolveLessonStepId(requestedStepId, steps);
  const [currentStepId, setCurrentStepId] = useState(initialStepId);
  const [completedStepIds, setCompletedStepIds] = useState(
    initialProgress.completedStepIds.filter((stepId) => validStepIds.has(stepId))
  );
  const [mobileOutlineOpen, setMobileOutlineOpen] = useState(false);
  const [activitiesAllComplete, setActivitiesAllComplete] = useState(false);
  const [finished, setFinished] = useState(false);
  const contentRef = useRef(null);

  const currentIndex = Math.max(0, steps.findIndex((step) => step.id === currentStepId));
  const currentStep = steps[currentIndex] || steps[0];
  const resumeStep = steps.find((step) => step.id === initialProgress.currentStepId && step.id !== 'intro');
  const progressPercent = finished ? 100 : Math.round(((currentIndex + 1) / Math.max(steps.length, 1)) * 100);

  const persistProgress = (stepId, completedIds) => {
    saveLessonStepProgress(lessonKey, {
      currentStepId: stepId,
      completedStepIds: [...new Set([...hiddenCompletedStepIds, ...completedIds])],
    });
  };

  useEffect(() => {
    const nextStepId = resolveLessonStepId(requestedStepId, steps);
    if (nextStepId && nextStepId !== currentStepId) {
      setCurrentStepId(nextStepId);
      setFinished(false);
    }
    if (nextStepId && requestedStepId !== nextStepId) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('step', nextStepId);
      setSearchParams(nextParams, { replace: true });
    }
  }, [currentStepId, requestedStepId, searchParams, setSearchParams, steps, validStepIds]);

  useEffect(() => {
    setCompletedStepIds(initialProgress.completedStepIds.filter((stepId) => validStepIds.has(stepId)));
    setCurrentStepId(resolveLessonStepId(requestedStepId, steps));
    setActivitiesAllComplete(false);
    setFinished(false);
  }, [lessonKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (currentStep?.type !== 'exercises') return;
    setCompletedStepIds((current) => {
      const alreadyCompleted = current.includes(currentStep.id);
      if (alreadyCompleted === activitiesAllComplete) return current;
      const next = activitiesAllComplete
        ? [...current, currentStep.id]
        : current.filter((stepId) => stepId !== currentStep.id);
      persistProgress(currentStepId, next);
      return next;
    });
  }, [activitiesAllComplete, currentStep, currentStepId, lessonKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateUrlStep = (stepId, replace = false) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('step', stepId);
    setSearchParams(nextParams, { replace });
  };

  const goToStep = (stepId) => {
    if (!validStepIds.has(stepId) || stepId === currentStepId) return;
    const shouldCompleteCurrent = currentStep.type !== 'exercises' || activitiesAllComplete;
    const nextCompleted = shouldCompleteCurrent
      ? [...new Set([...completedStepIds, currentStepId])]
      : completedStepIds.filter((id) => id !== currentStepId);
    const targetStep = steps.find((step) => step.id === stepId);
    if (targetStep?.type === 'exercises') setActivitiesAllComplete(false);
    setCompletedStepIds(nextCompleted);
    setCurrentStepId(stepId);
    setFinished(false);
    persistProgress(stepId, nextCompleted);
    updateUrlStep(stepId);
    window.requestAnimationFrame(() => contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const finishLesson = () => {
    const shouldCompleteCurrent = currentStep.type !== 'exercises' || activitiesAllComplete;
    const nextCompleted = shouldCompleteCurrent
      ? [...new Set([...completedStepIds, currentStepId])]
      : completedStepIds.filter((id) => id !== currentStepId);
    setCompletedStepIds(nextCompleted);
    setFinished(true);
    persistProgress(currentStepId, nextCompleted);
    onLessonComplete?.();
    window.requestAnimationFrame(() => contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  if (!currentStep || steps.length === 0) {
    return <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 font-bold text-amber-900">هذا الدرس منشور لكنه لا يحتوي تفاصيل كاملة بعد.</p>;
  }

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:items-start">
      <LessonOutline
        steps={steps}
        currentStepId={currentStepId}
        completedStepIds={completedStepIds}
        mobileOpen={mobileOutlineOpen}
        onMobileOpen={() => setMobileOutlineOpen(true)}
        onMobileClose={() => setMobileOutlineOpen(false)}
        onSelect={goToStep}
      />

      <section ref={contentRef} className="min-w-0 scroll-mt-24">
        <div className="mb-4 rounded-lg border border-black/10 bg-white px-4 py-3 sm:px-5">
          <div className="mb-2 flex items-center justify-between gap-3 text-sm font-black text-slate-600">
            <span>{finished ? 'اكتمل الدرس' : `الخطوة ${currentIndex + 1} من ${steps.length}`}</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100" dir="ltr">
            <div className="h-full rounded-full bg-[#d71920] transition-[width] duration-300" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <article className="mx-auto w-full max-w-[880px] rounded-lg border border-black/10 bg-white p-5 shadow-sm sm:p-7 md:p-9">
          {finished ? (
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 size={34} />
              </div>
              <h2 className="mt-4 text-2xl font-black text-[#111111]">أحسنت، أنهيت الدرس</h2>
              <p className="mt-2 leading-7 text-slate-600">يمكنك الآن بدء التمارين، أو الانتقال إلى درس آخر باختيارك.</p>
              <div className="mt-7 text-right">{completionContent}</div>
            </div>
          ) : (
            <>
              <header className="mb-6 border-b border-black/10 pb-5">
                <p className="mb-2 flex items-center gap-2 text-sm font-black text-[#b08000]">
                  <BookOpen size={17} /> {currentStep.type === 'intro' ? 'بداية الدرس' : 'محتوى الدرس'}
                </p>
                <h2 className="text-2xl font-black leading-tight text-[#111111] sm:text-3xl">{currentStep.title || 'جزء من الدرس'}</h2>
                {currentStep.germanTitle && (
                  <p dir="ltr" className="german-text mt-2 text-lg font-bold text-[#b91218]">{currentStep.germanTitle}</p>
                )}
              </header>

              <LessonRenderBoundary key={currentStep.id}>
                <LessonStepContent
                  step={currentStep}
                  lessonId={lessonActivityKey}
                  onActivitiesCompletionChange={setActivitiesAllComplete}
                  resumeTitle={currentStep.id === 'intro' ? resumeStep?.title : ''}
                  onResume={() => resumeStep && goToStep(resumeStep.id)}
                />
              </LessonRenderBoundary>

              <LessonStepNavigation
                canGoBack={currentIndex > 0}
                isLastStep={currentIndex === steps.length - 1}
                onBack={() => goToStep(steps[currentIndex - 1]?.id)}
                onNext={() => goToStep(steps[currentIndex + 1]?.id)}
                onFinish={finishLesson}
              />
            </>
          )}
        </article>
      </section>
    </div>
  );
};

export default LessonPlayer;

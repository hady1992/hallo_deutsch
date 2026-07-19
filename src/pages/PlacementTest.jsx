import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Loader2 } from 'lucide-react';
import PlacementQuestion from '@/components/placement/PlacementQuestion';
import PlacementResult from '@/components/placement/PlacementResult';
import PlacementReview from '@/components/placement/PlacementReview';
import PlacementTestIntro from '@/components/placement/PlacementTestIntro';
import { getCourseLessons, getPlacementTests } from '@/services/contentRepository';
import {
  advancePlacementAttempt,
  createPlacementAttempt,
  finishPlacementAttemptForTimeout,
  getAttemptRemainingSeconds,
  getCurrentPlacementQuestion,
  getPlacementQuestionMap,
  preparePlacementBank,
  recordAudioPlayCount,
  recordPlacementAnswer,
} from '@/utils/placementTestEngine';
import { PLACEMENT_TEST_VERSION } from '@/utils/placementTestNormalizer';
import { buildPlacementResult } from '@/utils/placementTestScoring';
import {
  clearPlacementSession,
  loadPlacementAttempt,
  loadPlacementResult,
  removeLegacyPlacementResult,
  savePlacementAttempt,
  savePlacementResult,
} from '@/utils/placementTestStorage';
import { validatePlacementQuestionBank } from '@/utils/placementTestValidator';

const CONTENT_PREPARATION_MESSAGE = 'اختبار تحديد المستوى الجديد قيد الإعداد حاليًا.';

const PlacementTest = () => {
  const [view, setView] = useState('loading');
  const [bank, setBank] = useState([]);
  const [bankSignature, setBankSignature] = useState('');
  const [preparedBank, setPreparedBank] = useState([]);
  const [attempt, setAttempt] = useState(null);
  const [result, setResult] = useState(null);
  const [suggestedContentAvailable, setSuggestedContentAvailable] = useState(null);

  const questionMap = useMemo(() => getPlacementQuestionMap(preparedBank), [preparedBank]);
  const currentQuestion = useMemo(
    () => getCurrentPlacementQuestion(attempt, questionMap),
    [attempt, questionMap]
  );

  useEffect(() => {
    let active = true;

    const loadBank = async () => {
      removeLegacyPlacementResult();
      setView('loading');
      try {
        const publishedQuestions = await getPlacementTests();
        const versionQuestions = publishedQuestions.filter(
          (question) => question.testVersion === PLACEMENT_TEST_VERSION
        );
        const validation = validatePlacementQuestionBank(versionQuestions);

        if (!validation.complete) {
          console.warn('[PlacementTest] CEFR bank validation failed:', {
            summary: validation.summary,
            itemErrors: validation.itemErrors,
            distributionErrors: validation.distributionErrors,
          });
          if (active) setView('unavailable');
          return;
        }

        if (!active) return;
        setBank(validation.validQuestions);
        setBankSignature(validation.bankSignature);

        const savedResult = loadPlacementResult(validation.bankSignature);
        const savedAttempt = loadPlacementAttempt(validation.bankSignature);
        if (savedResult) {
          setResult(savedResult);
          setPreparedBank(preparePlacementBank(validation.validQuestions, savedResult.seed));
          setAttempt(savedAttempt);
          setView('result');
          return;
        }

        if (savedAttempt && !savedAttempt.completed) {
          const prepared = preparePlacementBank(validation.validQuestions, savedAttempt.seed);
          const resumedAttempt = {
            ...savedAttempt,
            remainingSeconds: getAttemptRemainingSeconds(savedAttempt),
          };
          if (resumedAttempt.remainingSeconds <= 0) {
            const finishedAttempt = finishPlacementAttemptForTimeout(resumedAttempt, prepared);
            const timedResult = buildPlacementResult(finishedAttempt, prepared);
            savePlacementAttempt(finishedAttempt);
            savePlacementResult(timedResult);
            setPreparedBank(prepared);
            setAttempt(finishedAttempt);
            setResult(timedResult);
            setView('result');
            return;
          }
          setPreparedBank(prepared);
          setAttempt(resumedAttempt);
        }
        setView('intro');
      } catch (error) {
        console.error('[PlacementTest] Failed to load the CEFR bank:', error);
        if (active) setView('unavailable');
      }
    };

    loadBank();
    window.addEventListener('placement_testsUpdated', loadBank);
    return () => {
      active = false;
      window.removeEventListener('placement_testsUpdated', loadBank);
    };
  }, []);

  useEffect(() => {
    if (view !== 'test' || !attempt || attempt.completed || preparedBank.length === 0) return undefined;

    const timer = window.setInterval(() => {
      setAttempt((currentAttempt) => {
        if (!currentAttempt || currentAttempt.completed) return currentAttempt;
        const remainingSeconds = getAttemptRemainingSeconds(currentAttempt);
        if (remainingSeconds <= 0) {
          const finishedAttempt = finishPlacementAttemptForTimeout(
            { ...currentAttempt, remainingSeconds: 0 },
            preparedBank
          );
          const timedResult = buildPlacementResult(finishedAttempt, preparedBank);
          savePlacementAttempt(finishedAttempt);
          savePlacementResult(timedResult);
          setResult(timedResult);
          setView('result');
          return finishedAttempt;
        }

        const updatedAttempt = { ...currentAttempt, remainingSeconds };
        savePlacementAttempt(updatedAttempt);
        return updatedAttempt;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [attempt, preparedBank, view]);

  useEffect(() => {
    let active = true;
    if (!result?.suggestedLevel) return undefined;
    setSuggestedContentAvailable(null);
    getCourseLessons(result.suggestedLevel)
      .then((lessons) => {
        if (active) setSuggestedContentAvailable(lessons.length > 0);
      })
      .catch((error) => {
        console.error('[PlacementTest] Failed to check suggested level content:', error);
        if (active) setSuggestedContentAvailable(false);
      });
    return () => {
      active = false;
    };
  }, [result]);

  const startNewAttempt = () => {
    clearPlacementSession();
    const newAttempt = createPlacementAttempt(bank, bankSignature);
    const prepared = preparePlacementBank(bank, newAttempt.seed);
    savePlacementAttempt(newAttempt);
    setPreparedBank(prepared);
    setAttempt(newAttempt);
    setResult(null);
    setView('test');
  };

  const handleSelectAnswer = (answerIndex) => {
    if (!attempt || !currentQuestion) return;
    const updatedAttempt = recordPlacementAnswer(attempt, currentQuestion.id, answerIndex);
    savePlacementAttempt(updatedAttempt);
    setAttempt(updatedAttempt);
  };

  const handleNext = () => {
    if (!attempt || !currentQuestion || attempt.answers[currentQuestion.id] === undefined) return;
    const updatedAttempt = advancePlacementAttempt(attempt, preparedBank);
    savePlacementAttempt(updatedAttempt);
    setAttempt(updatedAttempt);
    if (updatedAttempt.completed) {
      const completedResult = buildPlacementResult(updatedAttempt, preparedBank);
      savePlacementResult(completedResult);
      setResult(completedResult);
      setView('result');
    }
  };

  const handleSuccessfulAudioPlay = () => {
    if (!attempt || !currentQuestion) return;
    const currentCount = Number(attempt.audioPlayCounts[currentQuestion.id]) || 0;
    if (currentCount >= 3) return;
    const updatedAttempt = recordAudioPlayCount(attempt, currentQuestion.id, currentCount + 1);
    savePlacementAttempt(updatedAttempt);
    setAttempt(updatedAttempt);
  };

  if (view === 'loading') {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-4 pt-20" dir="rtl">
        <div role="status" className="text-center font-bold text-slate-600">
          <Loader2 className="mx-auto mb-4 animate-spin text-[#d71920]" size={36} />
          جاري تجهيز الاختبار...
        </div>
      </main>
    );
  }

  if (view === 'unavailable') {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#fcfaf6] px-4 pt-20" dir="rtl">
        <section className="w-full max-w-xl rounded-md border border-black/10 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black text-[#111111]">{CONTENT_PREPARATION_MESSAGE}</h1>
          <p className="mt-4 leading-7 text-slate-600">نعمل على تجهيز بنك أسئلة متكامل قبل إتاحة الاختبار للزوار.</p>
        </section>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfaf6]">
      <Helmet>
        <title>اختبار تحديد المستوى | Hallo Deutsch</title>
        <meta name="description" content="اختبار تشخيصي متوافق مع CEFR لتقدير مستوى اللغة الألمانية من Pre-A1 إلى B2." />
      </Helmet>

      {view === 'intro' && (
        <PlacementTestIntro
          hasSavedAttempt={Boolean(attempt && !attempt.completed)}
          onStart={startNewAttempt}
          onResume={() => setView('test')}
          onStartNew={startNewAttempt}
        />
      )}

      {view === 'test' && currentQuestion && (
        <PlacementQuestion
          question={currentQuestion}
          selectedAnswer={attempt.answers[currentQuestion.id]}
          onSelectAnswer={handleSelectAnswer}
          onNext={handleNext}
          questionNumber={attempt.presentedQuestionIds.length}
          answeredCount={Object.keys(attempt.answers).length}
          remainingSeconds={attempt.remainingSeconds}
          audioPlayCount={Number(attempt.audioPlayCounts[currentQuestion.id]) || 0}
          onSuccessfulAudioPlay={handleSuccessfulAudioPlay}
        />
      )}

      {view === 'test' && !currentQuestion && (
        <main className="flex min-h-[70vh] items-center justify-center px-4 pt-20" dir="rtl">
          <p role="alert" className="font-bold text-red-700">تعذر متابعة الاختبار بسبب نقص في بيانات السؤال.</p>
        </main>
      )}

      {view === 'result' && result && (
        <PlacementResult
          result={result}
          suggestedContentAvailable={suggestedContentAvailable}
          onReview={() => setView('review')}
          onRestart={startNewAttempt}
        />
      )}

      {view === 'review' && result && (
        <PlacementReview
          result={result}
          preparedQuestions={preparedBank}
          onBack={() => setView('result')}
        />
      )}
    </div>
  );
};

export default PlacementTest;

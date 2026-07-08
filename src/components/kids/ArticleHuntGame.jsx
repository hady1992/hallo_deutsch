import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  ArrowRight,
  CheckCircle2,
  MousePointerClick,
  RefreshCcw,
  Sparkles,
  Trophy,
} from 'lucide-react';
import AudioButton from '@/components/AudioButton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ARTICLE_OPTIONS,
  getAvailableArticleHuntTopics,
  getKidNounsByTopic,
  shuffleQuestions,
} from '@/utils/articleHuntUtils';

const QUESTION_COUNTS = [5, 10, 15, 20];

const ARTICLE_STYLES = {
  der: {
    button: 'bg-sky-400 border-sky-500 shadow-sky-200 text-white',
    idle: 'hover:bg-sky-500',
    bubble: 'bg-sky-100 text-sky-700',
  },
  die: {
    button: 'bg-rose-400 border-rose-500 shadow-rose-200 text-white',
    idle: 'hover:bg-rose-500',
    bubble: 'bg-rose-100 text-rose-700',
  },
  das: {
    button: 'bg-emerald-400 border-emerald-500 shadow-emerald-200 text-white',
    idle: 'hover:bg-emerald-500',
    bubble: 'bg-emerald-100 text-emerald-700',
  },
};

const getTopicPool = (nouns, topic) => (
  topic === 'all' ? nouns : nouns.filter((noun) => noun.topic === topic)
);

const ArticleHuntGame = ({ onExit }) => {
  const [nouns, setNouns] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [questionCount, setQuestionCount] = useState(10);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [mistakes, setMistakes] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [locked, setLocked] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const loadNouns = () => setNouns(getKidNounsByTopic());
    loadNouns();

    const events = [
      'dataImported',
      'kidsDataUpdated',
      'kidsVocabularyUpdated',
      'nounsUpdated',
      'vocabularyUpdated',
    ];

    events.forEach((eventName) => window.addEventListener(eventName, loadNouns));
    return () => events.forEach((eventName) => window.removeEventListener(eventName, loadNouns));
  }, []);

  const topics = useMemo(() => getAvailableArticleHuntTopics(nouns), [nouns]);

  const availablePool = useMemo(
    () => getTopicPool(nouns, selectedTopic),
    [nouns, selectedTopic]
  );

  const visibleTopics = useMemo(() => [
    { id: 'all', label: 'كل المواضيع', count: nouns.length },
    ...topics,
  ].filter((topic) => topic.count > 0), [nouns.length, topics]);

  const actualQuestionCount = Math.min(questionCount, availablePool.length);
  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const successRate = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  const resetPlayState = () => {
    setCurrentIndex(0);
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setMistakes([]);
    setSelectedArticle(null);
    setFeedback(null);
    setShowAnswer(false);
    setLocked(false);
    setFinished(false);
  };

  const startGame = () => {
    const nextQuestions = shuffleQuestions(availablePool, questionCount);
    if (nextQuestions.length === 0) return;
    setQuestions(nextQuestions);
    resetPlayState();
  };

  const chooseAnotherTopic = () => {
    setQuestions([]);
    resetPlayState();
  };

  const replaySameSettings = () => {
    const nextQuestions = shuffleQuestions(availablePool, questionCount);
    setQuestions(nextQuestions);
    resetPlayState();
  };

  const goToNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((index) => index + 1);
      setSelectedArticle(null);
      setFeedback(null);
      setShowAnswer(false);
      setLocked(false);
      return;
    }

    setFinished(true);
    setLocked(false);
  };

  const handleTargetClick = (article) => {
    if (!currentQuestion || locked) return;

    setSelectedArticle(article);

    if (article === currentQuestion.article) {
      setLocked(true);
      setShowAnswer(true);
      setFeedback({ type: 'success', text: 'رائع! فقاعتك وصلت للهدف الصحيح' });
      setScore((value) => value + 1);
      setCorrectCount((value) => value + 1);

      confetti({
        particleCount: 80,
        spread: 65,
        origin: { y: 0.65 },
        colors: ['#38bdf8', '#fb7185', '#34d399', '#facc15'],
      });

      window.setTimeout(goToNextQuestion, 1400);
      return;
    }

    setWrongCount((value) => value + 1);
    setFeedback({ type: 'try-again', text: 'حاول مرة أخرى' });
    setMistakes((items) => [
      ...items,
      {
        id: `${currentQuestion.id}-${currentIndex}-${article}-${items.length}`,
        word: currentQuestion.word,
        translation: currentQuestion.translation,
        chosen: article,
        correct: currentQuestion.article,
      },
    ]);

    window.setTimeout(() => {
      setSelectedArticle(null);
      setFeedback(null);
    }, 900);
  };

  if (finished) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-4xl rounded-[2rem] border-4 border-yellow-200 bg-white p-6 text-center shadow-xl md:p-10"
        dir="rtl"
      >
        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-yellow-100 text-yellow-500">
          <Trophy size={56} className="drop-shadow-sm" />
        </div>
        <h2 className="mb-2 text-3xl font-black text-slate-800 md:text-5xl">انتهت رحلة صيد الأرتيكل!</h2>
        <p className="mb-8 text-lg font-bold text-slate-500">نتيجتك: {score} من {questions.length}</p>

        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-3xl bg-blue-50 p-4">
            <span className="block text-sm font-bold text-blue-500">النسبة</span>
            <span className="text-3xl font-black text-blue-700">{successRate}%</span>
          </div>
          <div className="rounded-3xl bg-green-50 p-4">
            <span className="block text-sm font-bold text-green-500">الصحيح</span>
            <span className="text-3xl font-black text-green-700">{correctCount}</span>
          </div>
          <div className="rounded-3xl bg-rose-50 p-4">
            <span className="block text-sm font-bold text-rose-500">المحاولات الخاطئة</span>
            <span className="text-3xl font-black text-rose-700">{wrongCount}</span>
          </div>
          <div className="rounded-3xl bg-yellow-50 p-4">
            <span className="block text-sm font-bold text-yellow-600">الأسئلة</span>
            <span className="text-3xl font-black text-yellow-700">{questions.length}</span>
          </div>
        </div>

        <div className="mb-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            onClick={replaySameSettings}
            className="h-12 rounded-2xl bg-purple-600 px-6 text-base font-black text-white hover:bg-purple-700"
          >
            <RefreshCcw className="ml-2" size={18} />
            إعادة اللعب
          </Button>
          <Button
            onClick={chooseAnotherTopic}
            variant="outline"
            className="h-12 rounded-2xl border-2 px-6 text-base font-black"
          >
            اختيار موضوع آخر
          </Button>
          <Button
            onClick={onExit}
            variant="ghost"
            className="h-12 rounded-2xl px-6 text-base font-black text-slate-500"
          >
            الرجوع للألعاب
          </Button>
        </div>

        <div className="rounded-[1.5rem] bg-slate-50 p-4 text-right">
          <h3 className="mb-4 text-xl font-black text-slate-800">مراجعة الأخطاء</h3>
          {mistakes.length === 0 ? (
            <p className="rounded-2xl bg-green-100 p-4 text-center font-bold text-green-700">
              ممتاز! لم تسجل أي محاولة خاطئة.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {mistakes.map((mistake) => (
                <div key={mistake.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-xl font-black text-slate-800" dir="ltr">{mistake.word}</span>
                    <span className="text-sm font-bold text-slate-400">{mistake.translation}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm font-bold">
                    <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-700">اختيارك: {mistake.chosen}</span>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">الصحيح: {mistake.correct}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 p-4" dir="rtl">
        <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-cyan-100 via-white to-yellow-100 p-6 shadow-xl md:p-10">
          <div className="grid items-center gap-8 md:grid-cols-[1fr_0.8fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-black text-cyan-700 shadow-sm">
                <Sparkles size={18} />
                Artikel-Jagd
              </div>
              <h2 className="mb-3 text-4xl font-black text-slate-900 md:text-6xl">صيد الأرتيكل</h2>
              <p className="max-w-2xl text-lg font-bold leading-relaxed text-slate-600">
                اختر الهدف الصحيح: der أو die أو das. أطلق الفقاعة على الأرتيكل المناسب وتعلّم أسماء ألمانية بطريقة مرحة.
              </p>
            </div>

            <div className="relative mx-auto flex h-56 w-full max-w-sm items-center justify-center">
              <div className="absolute bottom-5 h-20 w-28 rounded-t-[3rem] rounded-b-2xl bg-purple-500 shadow-lg shadow-purple-200" />
              <div className="absolute bottom-20 h-16 w-16 rounded-full border-4 border-white bg-cyan-300 shadow-lg" />
              <motion.div
                animate={{ y: [-8, 8, -8], scale: [1, 1.08, 1] }}
                transition={{ duration: 2.4, repeat: Infinity }}
                className="absolute top-6 h-24 w-24 rounded-full border-4 border-white/80 bg-white/50 shadow-xl"
              />
              <motion.div
                animate={{ y: [12, -12, 12] }}
                transition={{ duration: 2.8, repeat: Infinity }}
                className="absolute right-12 top-20 h-14 w-14 rounded-full border-4 border-white/80 bg-cyan-200/70"
              />
              <motion.div
                animate={{ y: [-14, 10, -14] }}
                transition={{ duration: 3.1, repeat: Infinity }}
                className="absolute left-12 top-28 h-12 w-12 rounded-full border-4 border-white/80 bg-yellow-200/80"
              />
            </div>
          </div>
        </div>

        {nouns.length === 0 ? (
          <div className="rounded-[2rem] border-2 border-dashed border-slate-200 bg-white p-10 text-center">
            <p className="text-xl font-black text-slate-500">لا توجد أسماء مع أرتيكل جاهزة للعبة بعد.</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="rounded-[2rem] bg-white p-5 shadow-lg md:p-6">
              <h3 className="mb-4 text-2xl font-black text-slate-800">1. اختيار الموضوع</h3>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {visibleTopics.map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => setSelectedTopic(topic.id)}
                    className={cn(
                      'rounded-2xl border-2 p-4 text-right transition-all',
                      selectedTopic === topic.id
                        ? 'border-purple-400 bg-purple-50 shadow-md'
                        : 'border-slate-100 bg-slate-50 hover:border-purple-200 hover:bg-white'
                    )}
                  >
                    <span className="block text-base font-black text-slate-800">{topic.label}</span>
                    <span className="mt-1 block text-sm font-bold text-slate-400">{topic.count} اسم</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-5 shadow-lg md:p-6">
              <h3 className="mb-4 text-2xl font-black text-slate-800">2. عدد الأسئلة</h3>
              <div className="grid grid-cols-2 gap-3">
                {QUESTION_COUNTS.map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setQuestionCount(count)}
                    className={cn(
                      'rounded-2xl border-2 p-5 text-center text-2xl font-black transition-all',
                      questionCount === count
                        ? 'border-cyan-400 bg-cyan-50 text-cyan-700 shadow-md'
                        : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-cyan-200 hover:bg-white'
                    )}
                  >
                    {count}
                  </button>
                ))}
              </div>

              <div className="mt-5 rounded-2xl bg-yellow-50 p-4 text-sm font-bold leading-relaxed text-yellow-800">
                المتاح في هذا الاختيار: {availablePool.length} اسم.
                {actualQuestionCount < questionCount && (
                  <span> سيتم اللعب بـ {actualQuestionCount} سؤال فقط لأن هذا هو المتاح.</span>
                )}
              </div>

              <Button
                onClick={startGame}
                disabled={availablePool.length === 0}
                className="mt-5 h-14 w-full rounded-2xl bg-slate-900 text-lg font-black text-white hover:bg-black"
              >
                ابدأ صيد الأرتيكل
                <ArrowRight className="mr-2" size={20} />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-3 md:p-4" dir="rtl">
      <div className="rounded-[2rem] bg-white p-4 shadow-lg">
        <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Button onClick={chooseAnotherTopic} variant="ghost" className="self-start rounded-xl font-bold text-slate-500">
            تغيير الإعدادات
          </Button>
          <div className="flex flex-wrap items-center gap-2 text-sm font-black">
            <span className="rounded-full bg-yellow-100 px-4 py-2 text-yellow-700">السكور: {score}</span>
            <span className="rounded-full bg-green-100 px-4 py-2 text-green-700">الصحيح: {correctCount}</span>
            <span className="rounded-full bg-rose-100 px-4 py-2 text-rose-700">الخطأ: {wrongCount}</span>
            <span className="rounded-full bg-slate-100 px-4 py-2 text-slate-700">السؤال {currentIndex + 1} من {questions.length}</span>
          </div>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100" dir="ltr">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.35 }}
          />
        </div>
      </div>

      <motion.div
        key={currentQuestion?.id || currentIndex}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] border-4 border-cyan-100 bg-gradient-to-br from-white via-cyan-50 to-yellow-50 p-5 shadow-xl md:p-8"
      >
        <div className="pointer-events-none absolute -left-8 top-10 h-24 w-24 rounded-full bg-white/50" />
        <div className="pointer-events-none absolute right-10 top-20 h-14 w-14 rounded-full bg-cyan-200/40" />

        <div className="relative z-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-purple-700 shadow-sm">
            <MousePointerClick size={18} />
            اضغط على الأرتيكل الصحيح
          </div>

          <div className="mx-auto mb-6 max-w-xl rounded-[2rem] border-2 border-white bg-white/80 p-6 shadow-sm">
            <div className="mb-2 flex items-center justify-center gap-3">
              <h2 className="text-5xl font-black text-slate-900 md:text-7xl" dir="ltr">
                {currentQuestion.word}
              </h2>
              {!showAnswer && (
                <AudioButton
                  text={currentQuestion.word}
                  className="h-12 w-12 bg-blue-100 text-blue-600 hover:bg-blue-500 hover:text-white"
                  size={22}
                />
              )}
              {showAnswer && (
                <AudioButton
                  text={currentQuestion.german}
                  className="h-12 w-12 bg-green-100 text-green-600 hover:bg-green-500 hover:text-white"
                  size={22}
                />
              )}
            </div>
            {currentQuestion.translation && (
              <p className="text-xl font-bold text-slate-500">{currentQuestion.translation}</p>
            )}
            <AnimatePresence>
              {showAnswer && (
                <motion.p
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="mt-4 text-3xl font-black text-green-600"
                  dir="ltr"
                >
                  {currentQuestion.german}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="mx-auto grid max-w-3xl grid-cols-3 gap-3 md:gap-5" dir="ltr">
            {ARTICLE_OPTIONS.map((article, index) => {
              const style = ARTICLE_STYLES[article];
              const isChosen = selectedArticle === article;
              const isCorrect = article === currentQuestion.article;
              return (
                <motion.button
                  key={article}
                  type="button"
                  disabled={locked}
                  onClick={() => handleTargetClick(article)}
                  animate={{ y: [0, index % 2 === 0 ? -8 : 8, 0] }}
                  transition={{ duration: 2.4 + index * 0.25, repeat: Infinity, ease: 'easeInOut' }}
                  whileTap={{ scale: 0.94 }}
                  className={cn(
                    'relative flex aspect-square min-h-[92px] flex-col items-center justify-center rounded-full border-b-8 text-3xl font-black shadow-xl transition-all md:min-h-[132px] md:text-5xl',
                    style.button,
                    !locked && style.idle,
                    isChosen && isCorrect && 'ring-4 ring-green-300 ring-offset-4',
                    isChosen && !isCorrect && 'ring-4 ring-rose-300 ring-offset-4'
                  )}
                  aria-label={`اختر ${article}`}
                >
                  <span>{article}</span>
                  <span className={cn('mt-2 rounded-full px-3 py-1 text-xs font-black md:text-sm', style.bubble)}>
                    فقاعة
                  </span>
                </motion.button>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-center gap-3 text-sm font-black text-slate-500">
            <span className="rounded-full bg-purple-500 px-4 py-2 text-white shadow-md">قاذف الفقاعات</span>
            <span className="h-4 w-4 rounded-full bg-cyan-200" />
            <span className="h-6 w-6 rounded-full bg-yellow-200" />
            <span className="h-3 w-3 rounded-full bg-rose-200" />
            <span>أطلق الفقاعة نحو الهدف الصحيح</span>
          </div>
        </div>

        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className={cn(
                'absolute bottom-0 left-0 z-20 flex w-full items-center justify-center gap-3 p-5 text-xl font-black text-white shadow-2xl',
                feedback.type === 'success' ? 'bg-green-500/95' : 'bg-yellow-500/95'
              )}
            >
              {feedback.type === 'success' && <CheckCircle2 size={30} />}
              {feedback.text}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ArticleHuntGame;

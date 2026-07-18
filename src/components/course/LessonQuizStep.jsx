import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react';

const asText = (value) => (typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '');

const getCorrectAnswer = (question, options) => {
  const explicit = question.correctAnswer ?? question.answer ?? question.correct ?? question.correctOption;
  if (typeof explicit === 'number') return options[explicit] ?? options[Math.max(0, explicit - 1)] ?? String(explicit);
  if (typeof explicit === 'string') return explicit.trim();
  if (typeof question.correctIndex === 'number') return options[question.correctIndex] ?? '';
  return '';
};

const LessonQuizStep = ({ questions }) => {
  const safeQuestions = useMemo(() => (Array.isArray(questions) ? questions : []), [questions]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setQuestionIndex(0);
    setSelectedAnswer('');
    setAnswers([]);
    setFinished(false);
  }, [safeQuestions]);

  const question = safeQuestions[questionIndex];
  if (!question) return null;

  const options = Array.isArray(question.options) ? question.options.map(asText).filter(Boolean) : [];
  const correctAnswer = getCorrectAnswer(question, options);
  const answered = Boolean(selectedAnswer);
  const isCorrect = answered && Boolean(correctAnswer) && selectedAnswer === correctAnswer;

  const selectAnswer = (option) => {
    if (answered) return;
    setSelectedAnswer(option);
    setAnswers((current) => [...current, { questionIndex, selectedAnswer: option, correct: option === correctAnswer }]);
  };

  const goNext = () => {
    if (questionIndex >= safeQuestions.length - 1) {
      setFinished(true);
      return;
    }
    setQuestionIndex((current) => current + 1);
    setSelectedAnswer('');
  };

  const restart = () => {
    setQuestionIndex(0);
    setSelectedAnswer('');
    setAnswers([]);
    setFinished(false);
  };

  const score = answers.filter((answer) => answer.correct).length;
  const percentage = safeQuestions.length ? Math.round((score / safeQuestions.length) * 100) : 0;

  if (finished) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${percentage >= 60 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
          {percentage >= 60 ? <CheckCircle2 size={34} /> : <RotateCcw size={31} />}
        </div>
        <h3 className="mt-4 text-2xl font-black text-[#111111]">
          {percentage >= 60 ? 'أحسنت، أنهيت اختبار الدرس' : 'أنهيت الاختبار، وننصحك بمحاولة أخرى'}
        </h3>
        <p className="mt-2 text-lg font-bold text-slate-600">النتيجة: {score} من {safeQuestions.length} ({percentage}%)</p>
        <button type="button" onClick={restart} className="brand-focus mt-5 inline-flex min-h-11 items-center gap-2 rounded-md border border-black/15 bg-white px-5 font-black text-[#111111] hover:border-[#d71920]/50">
          <RotateCcw size={18} /> إعادة الاختبار
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5 flex items-center justify-between gap-3 text-sm font-bold text-slate-500">
        <span>السؤال {questionIndex + 1} من {safeQuestions.length}</span>
        <span>الصحيح: {score}</span>
      </div>
      <h3 className="text-xl font-black leading-8 text-[#111111]">{question.question || question.title || question.text || 'اختر الإجابة الصحيحة'}</h3>
      {options.length > 0 ? (
        <div className="mt-5 grid gap-3">
          {options.map((option) => {
            const chosen = selectedAnswer === option;
            const correctChoice = answered && option === correctAnswer;
            const wrongChoice = chosen && !isCorrect;
            return (
              <button
                key={option}
                type="button"
                onClick={() => selectAnswer(option)}
                disabled={answered}
                dir={/^[^\u0600-\u06ff]*$/.test(option) ? 'ltr' : 'rtl'}
                className={`brand-focus min-h-12 rounded-md border px-4 py-3 text-start font-bold transition ${
                  correctChoice
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                    : wrongChoice
                      ? 'border-red-400 bg-red-50 text-red-900'
                      : 'border-black/10 bg-white text-[#111111] hover:border-[#e8b21e]'
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="mt-5 rounded-md bg-amber-50 p-4 font-bold text-amber-900">خيارات هذا السؤال غير مكتملة.</p>
      )}

      {answered && (
        <div className={`mt-5 rounded-md border p-4 ${isCorrect ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-red-200 bg-red-50 text-red-900'}`}>
          <p className="flex items-center gap-2 font-black">
            {isCorrect ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
            {isCorrect ? 'إجابة صحيحة' : 'إجابة غير صحيحة'}
          </p>
          {!isCorrect && correctAnswer && <p className="mt-2">الإجابة الصحيحة: <strong dir="ltr">{correctAnswer}</strong></p>}
          {(question.explanation || question.explanationArabic) && (
            <p className="mt-2 leading-7">{question.explanationArabic || question.explanation}</p>
          )}
          <button type="button" onClick={goNext} className="brand-focus mt-4 min-h-10 rounded-md bg-[#111111] px-5 font-black text-white">
            {questionIndex === safeQuestions.length - 1 ? 'عرض النتيجة' : 'السؤال التالي'}
          </button>
        </div>
      )}
    </div>
  );
};

export default LessonQuizStep;


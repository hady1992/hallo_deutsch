import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Dumbbell, Layers, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getExercises, getLessons } from '@/services/contentRepository';
import { getExerciseCategoryKey, getCategoryLabel, getExerciseAudioText } from '@/utils/exerciseAudio';
import {
  buildExerciseTaxonomy,
  EXERCISE_SKILLS,
  filterExercisesBySkill,
  filterExercisesByTopic,
  getExerciseLessonKey,
  getExerciseSkillKey,
  getExerciseUnitKey,
  normalizeExerciseTaxonomyText,
} from '@/utils/exerciseTaxonomy';
import AudioButton from '@/components/AudioButton';
import ExerciseResults from '@/components/ExerciseResults';
import BidiText from '@/components/common/BidiText';
import ExercisesHeader from '@/components/exercises/ExercisesHeader';
import ExerciseQuickPractice from '@/components/exercises/ExerciseQuickPractice';
import ExercisesBrowseTabs from '@/components/exercises/ExercisesBrowseTabs';
import ExerciseUnitsView from '@/components/exercises/ExerciseUnitsView';
import ExerciseSkillsView from '@/components/exercises/ExerciseSkillsView';
import ExerciseTopicsView from '@/components/exercises/ExerciseTopicsView';
import ExerciseSessionBuilder from '@/components/exercises/ExerciseSessionBuilder';
import ExerciseEmptyState from '@/components/exercises/ExerciseEmptyState';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

const LEVELS = ['A1', 'A2', 'B1', 'B2'];
const VIEWS = ['units', 'skills', 'topics'];

const shuffleQuestions = (questions) => {
  const shuffled = [...questions];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
};

const normalizeExercise = (exercise) => {
  if (typeof exercise.correctAnswer === 'number') return exercise;
  const answerIndex = exercise.options.findIndex((option) => option === exercise.correctAnswer);
  return {
    ...exercise,
    correctAnswer: answerIndex >= 0 ? answerIndex : exercise.correctAnswer,
    explanation: exercise.explanation || '',
  };
};

const Exercises = () => {
  const navigate = useNavigate();
  const browseSectionRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const queryLevel = String(searchParams.get('level') || '').toUpperCase();
  const selectedLevel = LEVELS.includes(queryLevel) ? queryLevel : '';
  const requestedView = searchParams.get('view');
  const selectedView = VIEWS.includes(requestedView) ? requestedView : 'units';
  const requestedUnit = searchParams.get('unit') || '';
  const requestedLesson = searchParams.get('lessonId') || searchParams.get('lesson') || '';
  const selectedSkill = searchParams.get('skill') || '';
  const selectedTopic = searchParams.get('topic') || '';

  const [exerciseMode, setExerciseMode] = useState('selection');
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [sessionPool, setSessionPool] = useState([]);
  const [sessionCount, setSessionCount] = useState(0);
  const [allExercises, setAllExercises] = useState([]);
  const [publishedLessons, setPublishedLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [unitSkill, setUnitSkill] = useState('all');
  const [sessionUnit, setSessionUnit] = useState('all');
  const [sessionDifficulty, setSessionDifficulty] = useState('all');

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const [persistent, lessons] = await Promise.all([
          getExercises(),
          getLessons().catch((lessonError) => {
            console.warn('[Exercises] Published lessons could not enrich unit labels:', lessonError);
            return [];
          }),
        ]);
        const normalized = persistent
          .filter((exercise) => Array.isArray(exercise.options) && exercise.options.length > 0 && exercise.question)
          .map(normalizeExercise);
        setAllExercises(normalized);
        setPublishedLessons(lessons);
      } catch (error) {
        console.error('[Exercises] Failed to load published exercises:', error);
        setAllExercises([]);
        setLoadError('تعذر تحميل التمارين حاليًا. حاول مرة أخرى بعد قليل.');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
    window.addEventListener('exercisesUpdated', loadContent);
    return () => window.removeEventListener('exercisesUpdated', loadContent);
  }, []);

  useEffect(() => {
    setUnitSkill('all');
    setSessionUnit('all');
    setSessionDifficulty('all');
  }, [requestedLesson, requestedUnit, selectedLevel, selectedSkill, selectedTopic]);

  const levelExercises = useMemo(() => (
    selectedLevel
      ? allExercises.filter((exercise) => String(exercise.level || '').toUpperCase() === selectedLevel)
      : []
  ), [allExercises, selectedLevel]);

  const levelLessons = useMemo(() => publishedLessons.filter(
    (lesson) => String(lesson.level || '').toUpperCase() === selectedLevel,
  ), [publishedLessons, selectedLevel]);

  const taxonomy = useMemo(
    () => buildExerciseTaxonomy(levelExercises, levelLessons),
    [levelExercises, levelLessons],
  );

  const directLessonMatches = useMemo(() => {
    if (!requestedLesson) return [];
    const lessonKey = normalizeExerciseTaxonomyText(requestedLesson);
    return levelExercises.filter(
      (exercise) => normalizeExerciseTaxonomyText(getExerciseLessonKey(exercise)) === lessonKey,
    );
  }, [levelExercises, requestedLesson]);

  const directLessonExercises = useMemo(() => {
    if (directLessonMatches.length > 0 || !requestedUnit) return directLessonMatches;
    return levelExercises.filter((exercise) => getExerciseUnitKey(exercise) === requestedUnit);
  }, [directLessonMatches, levelExercises, requestedUnit]);

  const selectedUnitData = taxonomy.units.find((unit) => unit.key === requestedUnit) || null;
  const selectedSkillData = taxonomy.skills.find((skill) => skill.key === selectedSkill) || null;
  const selectedTopicData = taxonomy.topics.find(
    (topic) => topic.normalizedKey === normalizeExerciseTaxonomyText(selectedTopic),
  ) || null;

  const unitExercises = useMemo(() => (
    requestedUnit
      ? levelExercises.filter((exercise) => getExerciseUnitKey(exercise) === requestedUnit)
      : []
  ), [levelExercises, requestedUnit]);

  const unitSessionExercises = useMemo(() => (
    unitSkill === 'all' ? unitExercises : filterExercisesBySkill(unitExercises, unitSkill)
  ), [unitExercises, unitSkill]);

  const skillBaseExercises = useMemo(
    () => filterExercisesBySkill(levelExercises, selectedSkill),
    [levelExercises, selectedSkill],
  );

  const skillSessionExercises = useMemo(() => skillBaseExercises.filter((exercise) => {
    if (sessionUnit !== 'all' && getExerciseUnitKey(exercise) !== sessionUnit) return false;
    if (sessionDifficulty !== 'all' && String(exercise.difficulty || exercise.metadata?.difficulty || '') !== sessionDifficulty) return false;
    return true;
  }), [sessionDifficulty, sessionUnit, skillBaseExercises]);

  const topicExercises = useMemo(
    () => filterExercisesByTopic(levelExercises, selectedTopic),
    [levelExercises, selectedTopic],
  );

  const difficultyOptions = useMemo(() => [...new Set(skillBaseExercises
    .map((exercise) => String(exercise.difficulty || exercise.metadata?.difficulty || '').trim())
    .filter(Boolean))].sort(), [skillBaseExercises]);

  const unitSkillOptions = useMemo(() => {
    const counts = {};
    unitExercises.forEach((exercise) => {
      const skill = getExerciseSkillKey(exercise);
      counts[skill] = (counts[skill] || 0) + 1;
    });
    return [
      { key: 'all', label: 'كل التمارين', count: unitExercises.length },
      ...EXERCISE_SKILLS.filter((skill) => skill.key !== 'mixed' && counts[skill.key] > 0)
        .map((skill) => ({ ...skill, count: counts[skill.key] })),
    ];
  }, [unitExercises]);

  const updateQuery = (updates, remove = []) => {
    const next = new URLSearchParams(searchParams);
    remove.forEach((key) => next.delete(key));
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    setSearchParams(next);
  };

  const chooseLevel = (level) => {
    setExerciseMode('selection');
    setSearchParams({ level, view: 'units' });
  };

  const changeView = (view) => {
    updateQuery({ view }, ['unit', 'skill', 'topic', 'lesson', 'lessonId']);
  };

  const selectUnit = (unit) => updateQuery({ view: 'units', unit }, ['skill', 'topic']);
  const selectSkill = (skill) => updateQuery({ view: 'skills', skill }, ['unit', 'topic']);
  const selectTopic = (topic) => updateQuery({ view: 'topics', topic }, ['unit', 'skill']);

  const startSession = (sourceExercises, requestedCount) => {
    const safePool = Array.isArray(sourceExercises) ? sourceExercises : [];
    const safeCount = Math.min(Math.max(Number(requestedCount) || 0, 0), safePool.length);
    if (safeCount === 0) return;
    const sessionQuestions = shuffleQuestions(safePool).slice(0, safeCount);
    setSessionPool(safePool);
    setSessionCount(safeCount);
    setCurrentQuestions(sessionQuestions);
    setCurrentIndex(0);
    setAnswers({});
    setScore(0);
    setExerciseMode('running');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnswer = (optionIndex) => {
    const currentQuestion = currentQuestions[currentIndex];
    const isCorrect = optionIndex === currentQuestion.correctAnswer;
    setAnswers((previous) => ({ ...previous, [currentIndex]: optionIndex }));
    if (isCorrect) setScore((previous) => previous + 1);

    setTimeout(() => {
      if (currentIndex < currentQuestions.length - 1) setCurrentIndex((previous) => previous + 1);
      else {
        setExerciseMode('results');
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    }, 400);
  };

  const handleRetake = () => startSession(sessionPool, sessionCount);
  const handleBackToSelection = () => {
    setExerciseMode('selection');
    setCurrentQuestions([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentQuestion = currentQuestions[currentIndex];
  const questionArabic = currentQuestion
    ? (currentQuestion.questionArabic || currentQuestion.translation || currentQuestion.arabic || '')
    : '';
  const getLevelCount = (level) => allExercises.filter(
    (exercise) => String(exercise.level || '').toUpperCase() === level,
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 bg-slate-50 px-4 pb-12 pt-24" dir="rtl">
        <Loader2 className="animate-spin text-[#d71920]" aria-hidden="true" />
        <span className="font-bold text-slate-600">جاري تحميل التمارين...</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 pb-12 pt-24" dir="rtl">
        <p className="font-bold text-red-700">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12 pt-20" dir="rtl">
      <Helmet>
        <title>التمارين التفاعلية - Hallo Deutsch</title>
        <meta name="description" content="تمارين ألمانية تفاعلية منظّمة حسب المستوى والوحدة والمهارة والموضوع." />
      </Helmet>

      {exerciseMode === 'selection' && !selectedLevel && (
        <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-3xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-red-50 text-[#d71920]">
              <Dumbbell size={25} aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-black text-[#111111] sm:text-4xl">التمارين التفاعلية</h1>
            <p className="mt-3 text-base leading-7 text-slate-600">اختر مستواك أولًا، ثم تصفّح التمارين حسب الوحدة أو المهارة أو الموضوع.</p>
            <p className="mt-3 font-bold text-[#b08000]">{allExercises.length} تمرين منشور متاح</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => chooseLevel(level)}
                className="brand-focus group min-h-52 rounded-lg border border-slate-200 bg-white p-5 text-right shadow-sm transition hover:-translate-y-1 hover:border-red-200 hover:shadow-md"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-md bg-[#111111] text-lg font-black text-white group-hover:bg-[#d71920]">{level}</span>
                <h2 className="mt-5 text-xl font-black text-[#111111]">المستوى {level}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">وحدات ومهارات وموضوعات منظّمة لهذا المستوى.</p>
                <span className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 font-bold text-slate-700">
                  <span className="flex items-center gap-2"><Layers size={17} aria-hidden="true" /> {getLevelCount(level)} تمرين</span>
                  <ArrowRight className="h-4 w-4 rotate-180 text-[#d71920]" aria-hidden="true" />
                </span>
              </button>
            ))}
          </div>
        </main>
      )}

      {exerciseMode === 'selection' && selectedLevel && (
        <>
          <ExercisesHeader
            level={selectedLevel}
            total={requestedLesson ? directLessonExercises.length : levelExercises.length}
            unitsCount={requestedLesson
              ? (directLessonExercises.length > 0 ? 1 : 0)
              : taxonomy.units.filter((unit) => unit.key !== 'general').length}
            skillsCount={requestedLesson
              ? new Set(directLessonExercises.map(getExerciseSkillKey)).size
              : taxonomy.skills.length}
            lessonMode={Boolean(requestedLesson)}
            onChangeLevel={() => setSearchParams({})}
          />

          <main className="mx-auto max-w-6xl space-y-6 px-4 py-7 sm:px-6 lg:px-8">
            {requestedLesson ? (
              <div className="space-y-5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/level/${selectedLevel.toLowerCase()}/lesson/${encodeURIComponent(requestedLesson)}`)}
                  className="min-h-11 gap-2 rounded-md"
                >
                  <ArrowRight size={17} aria-hidden="true" /> العودة إلى الدرس
                </Button>
                {directLessonMatches.length === 0 && directLessonExercises.length > 0 && (
                  <p className="rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-bold text-yellow-900">
                    لا تحتوي التمارين القديمة على معرّف درس دقيق؛ لذلك تُعرض تمارين الوحدة المرتبطة مع بقاء رابط الدرس محفوظًا.
                  </p>
                )}
                <ExerciseSessionBuilder
                  sourceKey={`lesson:${requestedLesson}`}
                  level={selectedLevel}
                  sourceLabel="تمارين الدرس"
                  available={directLessonExercises.length}
                  onStart={(count) => startSession(directLessonExercises, count)}
                />
              </div>
            ) : (
              <>
                {!requestedUnit && !selectedSkill && !selectedTopic && (
                  <ExerciseQuickPractice
                    available={levelExercises.length}
                    onStart={(count) => startSession(levelExercises, count)}
                    onCustomize={() => browseSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  />
                )}

                <section ref={browseSectionRef} className="scroll-mt-24 space-y-5" aria-labelledby="browse-title">
                  <div>
                    <h2 id="browse-title" className="text-2xl font-black text-[#111111]">تخصيص التدريب</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">اختر المسار الأنسب لهدفك الحالي.</p>
                  </div>
                  <ExercisesBrowseTabs value={selectedView} onChange={changeView} />

                  {selectedView === 'units' && !requestedUnit && (
                    <ExerciseUnitsView units={taxonomy.units} onSelect={selectUnit} />
                  )}

                  {selectedView === 'units' && requestedUnit && (
                    <div className="space-y-5">
                      <Button type="button" variant="outline" onClick={() => updateQuery({}, ['unit'])} className="min-h-11 gap-2 rounded-md">
                        <ArrowRight size={17} aria-hidden="true" /> العودة إلى الوحدات
                      </Button>
                      {selectedUnitData ? (
                        <>
                          <div className="border-r-4 border-[#d71920] bg-white px-5 py-4 shadow-sm">
                            <p className="text-sm font-black text-[#d71920]">{selectedUnitData.key === 'general' ? 'تدريب عام' : `الوحدة ${selectedUnitData.key}`}</p>
                            <h3 className="mt-1 text-2xl font-black text-[#111111]">{selectedUnitData.unitTitleAr || `الوحدة ${selectedUnitData.key}`}</h3>
                            {selectedUnitData.unitTitleDe && <BidiText as="p" text={selectedUnitData.unitTitleDe} className="mt-1 font-bold text-slate-500" />}
                            {selectedUnitData.description && <p className="mt-3 text-sm leading-6 text-slate-600">{selectedUnitData.description}</p>}
                          </div>

                          <div className="flex flex-wrap gap-2" aria-label="مهارات الوحدة">
                            {unitSkillOptions.map((skill) => (
                              <button
                                key={skill.key}
                                type="button"
                                onClick={() => setUnitSkill(skill.key)}
                                className={cn(
                                  'brand-focus min-h-11 rounded-md border px-4 font-bold transition',
                                  unitSkill === skill.key
                                    ? 'border-[#111111] bg-[#111111] text-white'
                                    : 'border-slate-300 bg-white text-slate-700 hover:border-[#d71920]',
                                )}
                              >
                                {skill.label} ({skill.count})
                              </button>
                            ))}
                          </div>

                          <ExerciseSessionBuilder
                            sourceKey={`unit:${requestedUnit}:${unitSkill}`}
                            level={selectedLevel}
                            sourceLabel={`${selectedUnitData.unitTitleAr || selectedUnitData.key} · ${unitSkillOptions.find((item) => item.key === unitSkill)?.label || 'كل التمارين'}`}
                            available={unitSessionExercises.length}
                            onStart={(count) => startSession(unitSessionExercises, count)}
                          />
                        </>
                      ) : <ExerciseEmptyState message="لا توجد تمارين في هذه الوحدة." />}
                    </div>
                  )}

                  {selectedView === 'skills' && !selectedSkill && (
                    <ExerciseSkillsView skills={taxonomy.skills} onSelect={selectSkill} />
                  )}

                  {selectedView === 'skills' && selectedSkill && (
                    <div className="space-y-5">
                      <Button type="button" variant="outline" onClick={() => updateQuery({}, ['skill'])} className="min-h-11 gap-2 rounded-md">
                        <ArrowRight size={17} aria-hidden="true" /> العودة إلى المهارات
                      </Button>
                      {selectedSkillData ? (
                        <ExerciseSessionBuilder
                          sourceKey={`skill:${selectedSkill}:${sessionUnit}:${sessionDifficulty}`}
                          level={selectedLevel}
                          sourceLabel={selectedSkillData.label}
                          available={skillSessionExercises.length}
                          onStart={(count) => startSession(skillSessionExercises, count)}
                        >
                          <div className="grid gap-4 sm:grid-cols-2">
                            <label className="font-bold text-slate-700">
                              الوحدة
                              <select value={sessionUnit} onChange={(event) => setSessionUnit(event.target.value)} className="brand-focus mt-2 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3">
                                <option value="all">كل الوحدات</option>
                                {taxonomy.units.map((unit) => <option key={unit.key} value={unit.key}>{unit.unitTitleAr || unit.key}</option>)}
                              </select>
                            </label>
                            {difficultyOptions.length > 0 && (
                              <label className="font-bold text-slate-700">
                                الصعوبة
                                <select value={sessionDifficulty} onChange={(event) => setSessionDifficulty(event.target.value)} className="brand-focus mt-2 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3">
                                  <option value="all">كل درجات الصعوبة</option>
                                  {difficultyOptions.map((difficulty) => <option key={difficulty} value={difficulty}>{difficulty}</option>)}
                                </select>
                              </label>
                            )}
                          </div>
                        </ExerciseSessionBuilder>
                      ) : <ExerciseEmptyState message="لا توجد تمارين منشورة لهذه المهارة." />}
                    </div>
                  )}

                  {selectedView === 'topics' && !selectedTopic && (
                    <ExerciseTopicsView topics={taxonomy.topics} onSelect={selectTopic} />
                  )}

                  {selectedView === 'topics' && selectedTopic && (
                    <div className="space-y-5">
                      <Button type="button" variant="outline" onClick={() => updateQuery({}, ['topic'])} className="min-h-11 gap-2 rounded-md">
                        <ArrowRight size={17} aria-hidden="true" /> العودة إلى الموضوعات
                      </Button>
                      {selectedTopicData ? (
                        <ExerciseSessionBuilder
                          sourceKey={`topic:${selectedTopicData.normalizedKey}`}
                          level={selectedLevel}
                          sourceLabel={selectedTopicData.label}
                          available={topicExercises.length}
                          onStart={(count) => startSession(topicExercises, count)}
                        />
                      ) : <ExerciseEmptyState message="لا توجد نتائج مطابقة للبحث." />}
                    </div>
                  )}
                </section>
              </>
            )}
          </main>
        </>
      )}

      {exerciseMode === 'running' && currentQuestion && (
        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <Button type="button" variant="ghost" onClick={handleBackToSelection} className="text-slate-500 hover:text-slate-700">إنهاء التمرين</Button>
            <div className="text-sm font-bold text-slate-500">السؤال {currentIndex + 1} / {currentQuestions.length}</div>
          </div>
          <div className="mb-8 h-2 overflow-hidden rounded-full bg-slate-200">
            <motion.div className="h-full bg-[#d71920]" initial={{ width: 0 }} animate={{ width: `${((currentIndex + 1) / currentQuestions.length) * 100}%` }} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={currentIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <Card className="overflow-hidden border-slate-200 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-100 bg-white p-4">
                  <BidiText as="span" text={getCategoryLabel(getExerciseCategoryKey(currentQuestion))} className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-500" />
                  <span className="rounded border border-red-100 bg-red-50 px-2 py-1 text-xs font-bold text-[#d71920]">{selectedLevel}</span>
                </div>
                <CardContent className="p-5 sm:p-8">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <BidiText as="h2" text={currentQuestion.question} className="min-w-0 flex-1 text-xl font-bold leading-relaxed text-slate-800 sm:text-2xl" />
                    <AudioButton text={getExerciseAudioText(currentQuestion)} lang="de-DE" className="mt-1 shrink-0" />
                  </div>
                  {questionArabic && <BidiText as="p" text={questionArabic} fallbackDirection="rtl" className="mb-6 text-base text-slate-500" />}
                  {!questionArabic && <div className="mb-6" />}

                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={`${currentQuestion.id || currentIndex}-${index}`}
                        type="button"
                        onClick={() => handleAnswer(index)}
                        dir="rtl"
                        className={cn(
                          'brand-focus group relative flex min-h-14 w-full items-center justify-between rounded-lg border-2 p-4 transition hover:bg-slate-50',
                          answers[currentIndex] === index ? 'border-[#d71920] bg-red-50' : 'border-slate-100 hover:border-red-200',
                        )}
                      >
                        <span className={cn(
                          'ml-4 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                          answers[currentIndex] === index ? 'border-[#d71920]' : 'border-slate-300 group-hover:border-red-300',
                        )}>
                          {answers[currentIndex] === index && <span className="h-2.5 w-2.5 rounded-full bg-[#d71920]" />}
                        </span>
                        <BidiText text={option} className={cn('min-w-0 flex-1 text-base font-medium sm:text-lg', answers[currentIndex] === index ? 'text-red-900' : 'text-slate-700')} />
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </main>
      )}

      {exerciseMode === 'results' && (
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <ExerciseResults
            results={{ score, total: currentQuestions.length, answers, questions: currentQuestions }}
            onRetake={handleRetake}
            onBack={handleBackToSelection}
          />
        </main>
      )}
    </div>
  );
};

export default Exercises;

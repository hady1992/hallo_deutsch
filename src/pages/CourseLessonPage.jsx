import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { BookOpen, Clock3, Loader2, Target } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { getCourseLessons, getLessonBySlug } from '@/services/contentRepository';
import SafeLessonRenderer from '@/components/SafeLessonRenderer';
import LessonSidebar from '@/components/course/LessonSidebar';
import LessonNavigation from '@/components/course/LessonNavigation';
import {
  getCourseProgress,
  markLessonCompleted,
  markLessonStarted,
} from '@/utils/courseProgress';

const CourseLessonPage = () => {
  const { level: levelParam = '', lessonSlug = '' } = useParams();
  const level = levelParam.toUpperCase();
  const [lesson, setLesson] = useState(null);
  const [lessonIndex, setLessonIndex] = useState([]);
  const [progress, setProgress] = useState(getCourseProgress);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadLesson = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [selectedLesson, summaries] = await Promise.all([
        getLessonBySlug(level, lessonSlug),
        getCourseLessons(level),
      ]);
      setLesson(selectedLesson);
      setLessonIndex(summaries);
      if (selectedLesson?.id || selectedLesson?.supabaseId) {
        const lessonId = selectedLesson.supabaseId || selectedLesson.id;
        setProgress(markLessonStarted(lessonId, level));
      }
    } catch (loadError) {
      console.error('[CourseLessonPage] Failed to load lesson:', loadError);
      setError('تعذر تحميل المحتوى حاليًا');
      setLesson(null);
      setLessonIndex([]);
    } finally {
      setLoading(false);
    }
  }, [lessonSlug, level]);

  useEffect(() => {
    loadLesson();
  }, [loadLesson]);

  const lessonId = lesson?.supabaseId || lesson?.id;
  const currentIndex = lessonIndex.findIndex((item) => item.id === lessonId || item.slug === lessonSlug);
  const currentSummary = currentIndex >= 0 ? lessonIndex[currentIndex] : null;
  const previousLesson = currentIndex > 0 ? lessonIndex[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < lessonIndex.length - 1 ? lessonIndex[currentIndex + 1] : null;
  const unit = lesson?.unit || currentSummary?.unit || 'general';
  const unitTitle = lesson?.unitTitleAr || currentSummary?.unitTitleAr || 'وحدة عامة';
  const unitLessons = useMemo(
    () => lessonIndex.filter((item) => (item.unit || 'general') === unit),
    [lessonIndex, unit]
  );
  const completed = Boolean(lessonId && progress.completedLessonIds.includes(lessonId));

  const handleComplete = () => {
    if (!lessonId) return;
    setProgress(markLessonCompleted(lessonId, level));
  };

  if (loading) {
    return (
      <div role="status" className="flex min-h-[70vh] items-center justify-center gap-3 bg-[#fcfaf6] pt-20 font-bold text-slate-600">
        <Loader2 className="animate-spin text-[#d71920]" /> جاري تحميل الدرس...
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#fcfaf6] px-4 pt-20 text-center">
        <div>
          <BookOpen size={48} className="mx-auto mb-4 text-slate-300" />
          <h1 className="text-2xl font-black text-[#111111]">{error || 'الدرس غير موجود أو غير منشور'}</h1>
          <Link to={`/level/${level.toLowerCase()}`} className="mt-5 inline-flex font-black text-[#b91218]">العودة إلى المستوى</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfaf6] pb-16 pt-24" dir="rtl">
      <Helmet><title>{lesson.title} | Hallo Deutsch</title></Helmet>
      <main className="container mx-auto max-w-7xl px-4 md:px-8">
        <nav aria-label="مسار الدرس" className="mb-6 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500">
          <Link to="/levels" className="hover:text-[#b91218]">المستويات</Link><span>←</span>
          <Link to={`/level/${level.toLowerCase()}`} className="hover:text-[#b91218]">{level}</Link><span>←</span>
          <span>{unitTitle}</span><span>←</span>
          <span className="text-[#111111]">{lesson.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <article className="min-w-0">
            <header className="border-b border-black/10 pb-6">
              <p dir="ltr" className="german-text font-bold text-[#b08000]">{lesson.unitTitleDe || currentSummary?.unitTitleDe || unit}</p>
              <h1 className="mt-2 text-3xl font-black leading-tight text-[#111111] md:text-5xl">{lesson.title}</h1>
              {lesson.germanTitle && <p dir="ltr" className="german-text mt-2 text-xl font-bold text-[#b91218]">{lesson.germanTitle}</p>}
              <div className="mt-4 flex flex-wrap gap-4 text-sm font-bold text-slate-500">
                <span>{unitTitle}</span>
                {(lesson.estimatedMinutes || currentSummary?.estimatedMinutes) > 0 && (
                  <span className="flex items-center gap-1"><Clock3 size={16} /> {lesson.estimatedMinutes || currentSummary.estimatedMinutes} دقيقة</span>
                )}
              </div>
            </header>

            {lesson.objectives?.length > 0 && (
              <section className="border-b border-black/10 py-7">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-[#111111]"><Target size={20} className="text-[#d71920]" /> أهداف الدرس</h2>
                <ul className="grid gap-2 md:grid-cols-2">
                  {lesson.objectives.map((objective, index) => (
                    <li key={`${objective}-${index}`} className="border-r-2 border-[#e8b21e] pr-3 leading-7 text-slate-700">{objective}</li>
                  ))}
                </ul>
              </section>
            )}

            <div className="py-7">
              <SafeLessonRenderer lesson={lesson} />
            </div>

            <LessonNavigation
              previousLesson={previousLesson}
              nextLesson={nextLesson}
              level={level}
              lesson={{ ...lesson, id: lessonId, exerciseLessonId: lesson.id || lesson.slug, unit }}
              completed={completed}
              onComplete={handleComplete}
            />
          </article>

          <LessonSidebar
            lessons={unitLessons}
            currentLessonId={lessonId}
            level={level}
            unitTitle={unitTitle}
          />
        </div>
      </main>
    </div>
  );
};

export default CourseLessonPage;

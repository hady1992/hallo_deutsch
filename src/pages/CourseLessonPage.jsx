import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { BookOpen, Clock3, Loader2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { getCourseLessons, getLessonBySlug } from '@/services/contentRepository';
import LessonPlayer from '@/components/course/LessonPlayer';
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

        <article className="min-w-0">
            <header className="mb-6 border-b border-black/10 pb-5">
              <p dir="ltr" className="german-text font-bold text-[#b08000]">{lesson.unitTitleDe || currentSummary?.unitTitleDe || unit}</p>
              <h1 className="mt-2 text-3xl font-black leading-tight text-[#111111] md:text-4xl">{lesson.title}</h1>
              {lesson.germanTitle && <p dir="ltr" className="german-text mt-2 text-xl font-bold text-[#b91218]">{lesson.germanTitle}</p>}
              <div className="mt-4 flex flex-wrap gap-4 text-sm font-bold text-slate-500">
                <span>{unitTitle}</span>
                {(lesson.estimatedMinutes || currentSummary?.estimatedMinutes) > 0 && (
                  <span className="flex items-center gap-1"><Clock3 size={16} /> {lesson.estimatedMinutes || currentSummary.estimatedMinutes} دقيقة</span>
                )}
              </div>
            </header>

          <LessonPlayer
            lesson={lesson}
            onLessonComplete={handleComplete}
            completionContent={(
              <LessonNavigation
                previousLesson={previousLesson}
                nextLesson={nextLesson}
                level={level}
                lesson={{ ...lesson, id: lessonId, exerciseLessonId: lesson.id || lesson.slug, unit }}
                completed={completed}
                onComplete={handleComplete}
              />
            )}
          />
        </article>
      </main>
    </div>
  );
};

export default CourseLessonPage;

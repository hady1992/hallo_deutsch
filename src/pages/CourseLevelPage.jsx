import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { ArrowLeft, ArrowRight, BookOpen, Layers3, Loader2, Settings } from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { getLessons } from '@/services/contentRepository';
import CourseProgress from '@/components/course/CourseProgress';
import CourseUnitCard from '@/components/course/CourseUnitCard';
import CourseUnitOverviewCard from '@/components/course/CourseUnitOverviewCard';
import {
  getCourseProgress,
  getCourseLessonId,
  getLevelProgressPercent,
} from '@/utils/courseProgress';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { isAuthorizedAdminEmail } from '@/components/AdminGate';
import { groupLessonsByUnit } from '@/utils/courseUnits';

const LEVEL_DETAILS = {
  A1: { title: 'المستوى الأول A1', description: 'الأساسيات اللازمة لبدء التواصل باللغة الألمانية.' },
  A2: { title: 'المستوى الثاني A2', description: 'توسيع المفردات وبناء جمل أوضح للمواقف اليومية.' },
  B1: { title: 'المستوى الثالث B1', description: 'تطوير الاستقلالية في القراءة والمحادثة والتعبير.' },
  B2: { title: 'المستوى الرابع B2', description: 'تعميق الفهم والتعبير في الموضوعات المتقدمة.' },
};

const CourseLevelPage = () => {
  const { level: levelParam = '' } = useParams();
  const level = levelParam.toUpperCase();
  const details = LEVEL_DETAILS[level];
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const isAdmin = isAuthorizedAdminEmail(user?.email);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState(getCourseProgress);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadLessons = useCallback(async () => {
    if (!details) return;
    setLoading(true);
    setError('');
    try {
      setLessons(await getLessons(level));
    } catch (loadError) {
      console.error(`[CourseLevelPage] Failed to load ${level}:`, loadError);
      setError('تعذر تحميل المحتوى حاليًا');
      setLessons([]);
    } finally {
      setLoading(false);
    }
  }, [details, level]);

  useEffect(() => {
    loadLessons();
    window.addEventListener('lessonsUpdated', loadLessons);
    return () => window.removeEventListener('lessonsUpdated', loadLessons);
  }, [loadLessons]);

  useEffect(() => {
    const refreshProgress = () => setProgress(getCourseProgress());
    window.addEventListener('courseProgressUpdated', refreshProgress);
    return () => window.removeEventListener('courseProgressUpdated', refreshProgress);
  }, []);

  const units = useMemo(() => groupLessonsByUnit(lessons), [lessons]);
  const selectedUnitKey = searchParams.get('unit') || '';
  const selectedUnit = units.find((unit) => unit.unit === selectedUnitKey) || null;
  const progressPercent = getLevelProgressPercent(lessons, progress);
  const completedCount = lessons.filter((lesson) => progress.completedLessonIds.includes(getCourseLessonId(lesson))).length;
  const lastLessonId = progress.lastLessonIdByLevel[level];
  const continueLesson = lessons.find((lesson) => getCourseLessonId(lesson) === lastLessonId) || lessons[0];

  if (!details) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center px-4 text-center">
        <div>
          <h1 className="text-2xl font-black">المستوى غير موجود</h1>
          <Link to="/levels" className="mt-4 inline-flex font-bold text-[#b91218]">العودة إلى المستويات</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfaf6] pb-16 pt-24" dir="rtl">
      <Helmet>
        <title>{details.title} | Hallo Deutsch</title>
      </Helmet>
      <main className="container mx-auto max-w-7xl px-4 md:px-8">
        <header className="border-b border-black/10 pb-8">
          <p className="font-bold text-[#b08000]">المسار الدراسي</p>
          <div className="mt-2 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-3xl font-black text-[#111111] md:text-5xl">المستوى {level}</h1>
              <p className="mt-3 max-w-2xl leading-7 text-[#5f6368]">{details.description}</p>
            </div>
            {continueLesson && (
              <Link
                to={`/level/${level.toLowerCase()}/lesson/${encodeURIComponent(continueLesson.slug)}`}
                className="brand-focus inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#d71920] px-6 font-black text-white hover:bg-[#b91218]"
              >
                متابعة من آخر درس <ArrowLeft size={18} />
              </Link>
            )}
          </div>

          {!loading && !error && lessons.length > 0 && (
            <div className="mt-7 grid gap-5 border-t border-black/10 pt-6 md:grid-cols-[1fr_auto] md:items-end">
              <CourseProgress value={progressPercent} completed={completedCount} total={lessons.length} />
              <div className="flex gap-5 text-sm font-bold text-slate-600">
                <span className="flex items-center gap-2"><Layers3 size={17} className="text-[#d71920]" /> {units.length} وحدة</span>
                <span className="flex items-center gap-2"><BookOpen size={17} className="text-[#d71920]" /> {lessons.length} درس</span>
              </div>
            </div>
          )}
        </header>

        {loading ? (
          <div role="status" className="flex min-h-[360px] items-center justify-center gap-3 font-bold text-slate-600">
            <Loader2 className="animate-spin text-[#d71920]" /> جاري تحميل المنهج...
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <p className="font-black text-red-700">{error}</p>
            <button type="button" onClick={loadLessons} className="mt-4 font-bold text-[#b91218] underline">إعادة المحاولة</button>
          </div>
        ) : units.length === 0 ? (
          <div className="py-20 text-center">
            <BookOpen size={48} className="mx-auto mb-4 text-slate-300" />
            <h2 className="text-2xl font-black text-[#111111]">يجري إعداد منهج هذا المستوى حاليًا</h2>
            <Link to="/levels" className="mt-5 inline-flex min-h-11 items-center font-black text-[#b91218]">العودة إلى المستويات</Link>
            {isAdmin && (
              <Link to="/admin" className="mx-auto mt-3 flex w-fit items-center gap-2 text-sm font-bold text-slate-600"><Settings size={16} /> إدارة الدروس</Link>
            )}
          </div>
        ) : selectedUnit ? (
          <div className="mt-9">
            <Link
              to={`/level/${level.toLowerCase()}`}
              className="brand-focus mb-7 inline-flex min-h-11 items-center gap-2 rounded-md border border-black/15 bg-white px-4 font-black text-[#111111] hover:border-[#d71920]/50"
            >
              <ArrowRight size={18} /> العودة إلى الوحدات
            </Link>
            <CourseUnitCard
              unit={selectedUnit}
              level={level}
              progress={progress}
            />
          </div>
        ) : (
          <section className="mt-9">
            <div className="mb-6">
              <p className="font-bold text-[#b08000]">المستوى {level}</p>
              <h2 className="mt-1 text-2xl font-black text-[#111111] md:text-3xl">اختر الوحدة التعليمية</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {units.map((unit) => (
                <CourseUnitOverviewCard
                  key={unit.unit}
                  unit={unit}
                  level={level}
                  completedCount={unit.lessons.filter((lesson) => progress.completedLessonIds.includes(getCourseLessonId(lesson))).length}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default CourseLevelPage;

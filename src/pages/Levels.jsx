import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import LevelCard from '@/components/LevelCard';
import { getCourseLessons } from '@/services/contentRepository';

const LEVEL_NAMES = ['A1', 'A2', 'B1', 'B2'];

const LEVEL_CONFIG = {
  A1: {
    name: 'المستوى الأول',
    description: 'مستوى المبتدئين - تعلم الأساسيات والتعبيرات البسيطة',
    color: 'from-[#d71920] to-[#a90f16]',
  },
  A2: {
    name: 'المستوى الثاني',
    description: 'مستوى ما قبل المتوسط - بناء المهارات الأساسية',
    color: 'from-[#e8b21e] to-[#8a6500]',
  },
  B1: {
    name: 'المستوى الثالث',
    description: 'المستوى المتوسط - تطوير القدرة على التواصل',
    color: 'from-[#2f2f2f] to-[#111111]',
  },
  B2: {
    name: 'المستوى الرابع',
    description: 'المستوى فوق المتوسط - إتقان اللغة بشكل متقدم',
    color: 'from-[#7a0d12] to-[#111111]',
  },
};

function Levels() {
  const [lessonCounts, setLessonCounts] = useState({});
  const [failedLevels, setFailedLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLessonCounts = useCallback(async () => {
    setLoading(true);
    const results = await Promise.all(LEVEL_NAMES.map(async (level) => {
      try {
        const lessons = await getCourseLessons(level);
        return { level, count: lessons.length, failed: false };
      } catch (error) {
        console.error(`[Levels] Failed to load ${level} lesson count:`, error);
        return { level, count: null, failed: true };
      }
    }));

    setLessonCounts(Object.fromEntries(results.map(({ level, count }) => [level, count])));
    setFailedLevels(results.filter(({ failed }) => failed).map(({ level }) => level));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadLessonCounts();
    window.addEventListener('lessonsUpdated', loadLessonCounts);
    return () => window.removeEventListener('lessonsUpdated', loadLessonCounts);
  }, [loadLessonCounts]);

  const levels = LEVEL_NAMES.map((level) => {
    const count = lessonCounts[level];
    let statusText = 'جاري تحميل الدروس...';
    if (!loading && failedLevels.includes(level)) statusText = 'تعذر تحميل المحتوى حاليًا';
    else if (!loading && count === 0) statusText = 'قيد الإعداد';
    else if (!loading) statusText = `${count} دروس متاحة`;

    return {
      level,
      ...LEVEL_CONFIG[level],
      statusText,
      path: `/level/${level.toLowerCase()}`,
    };
  });

  return (
    <>
      <Helmet>
        <title>المستويات الدراسية - Hallo Deutsch</title>
        <meta name="description" content="اختر مستواك من A1 إلى B2 وابدأ رحلتك في تعلم اللغة الألمانية" />
      </Helmet>

      <div className="mt-8 min-h-screen bg-brand-ivory py-16 md:mt-0 md:py-24" dir="rtl">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 text-center md:mb-16"
          >
            <h1 className="mb-4 text-4xl font-black tracking-tight text-gray-900 md:text-5xl">مستويات التعلّم</h1>
            <p className="mx-auto max-w-2xl px-4 text-lg text-gray-600 md:text-xl">
              اختر المستوى المناسب لك وابدأ رحلتك في تعلم اللغة الألمانية
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            {levels.map((level, index) => (
              <LevelCard key={level.level} {...level} index={index} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Levels;

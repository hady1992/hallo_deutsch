import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import LevelCard from '@/components/LevelCard';
import { getLessons } from '@/services/contentRepository';
import { dedupeByKey, getLessonDedupKey } from '@/utils/contentDedupUtils';
import { getStaticLessonEntries, STATIC_LESSON_CATALOG } from '@/data/staticLessonCatalog';

function Levels() {
  const fallbackCounts = useMemo(() => Object.fromEntries(
    Object.entries(STATIC_LESSON_CATALOG).map(([level, lessons]) => [level, lessons.length])
  ), []);
  const [lessonCounts, setLessonCounts] = useState(fallbackCounts);

  useEffect(() => {
    let active = true;
    const loadLessonCounts = async () => {
      const levelNames = Object.keys(STATIC_LESSON_CATALOG);
      const results = await Promise.all(levelNames.map(async (level) => {
        try {
          const publishedLessons = await getLessons(level);
          const lessons = dedupeByKey(
            [...getStaticLessonEntries(level), ...publishedLessons],
            getLessonDedupKey,
            { prefer: 'last' }
          );
          return [level, lessons.length];
        } catch (error) {
          console.warn(`[Levels] Failed to load ${level} lesson count:`, error);
          return [level, fallbackCounts[level]];
        }
      }));

      if (active) setLessonCounts(Object.fromEntries(results));
    };

    loadLessonCounts();
    window.addEventListener('lessonsUpdated', loadLessonCounts);
    return () => {
      active = false;
      window.removeEventListener('lessonsUpdated', loadLessonCounts);
    };
  }, [fallbackCounts]);

  const levels = [
    {
      level: 'A1',
      name: 'المستوى الأول',
      description: 'مستوى المبتدئين - تعلم الأساسيات والتعبيرات البسيطة',
      statusText: `${lessonCounts.A1 ?? fallbackCounts.A1} دروس متاحة`,
      color: 'from-[#d71920] to-[#a90f16]',
      path: '/level/a1'
    },
    {
      level: 'A2',
      name: 'المستوى الثاني',
      description: 'مستوى ما قبل المتوسط - بناء المهارات الأساسية',
      statusText: `${lessonCounts.A2 ?? fallbackCounts.A2} دروس متاحة`,
      color: 'from-[#e8b21e] to-[#8a6500]',
      path: '/level/a2'
    },
    {
      level: 'B1',
      name: 'المستوى الثالث',
      description: 'المستوى المتوسط - تطوير القدرة على التواصل',
      statusText: `${lessonCounts.B1 ?? fallbackCounts.B1} دروس متاحة`,
      color: 'from-[#2f2f2f] to-[#111111]',
      path: '/level/b1'
    },
    {
      level: 'B2',
      name: 'المستوى الرابع',
      description: 'المستوى فوق المتوسط - إتقان اللغة بشكل متقدم',
      statusText: `${lessonCounts.B2 ?? fallbackCounts.B2} دروس متاحة`,
      color: 'from-[#7a0d12] to-[#111111]',
      path: '/level/b2'
    }
  ];

  return (
    <>
      <Helmet>
        <title>{'المستويات الدراسية - Hallo Deutsch'}</title>
        <meta name="description" content="اختر مستواك من A1 إلى B2 وابدأ رحلتك في تعلم اللغة الألمانية" />
      </Helmet>

      <div className="min-h-screen bg-brand-ivory py-16 md:mt-0 md:py-24 mt-8" dir="rtl">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10 md:mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-black mb-4 text-gray-900 tracking-tight">مستويات التعلّم</h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              اختر المستوى المناسب لك وابدأ رحلتك في تعلم اللغة الألمانية
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {levels.map((level, index) => (
              <LevelCard
                key={level.level}
                {...level}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Levels;

import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import LevelCard from '@/components/LevelCard';

function Levels() {
  const levels = [
    {
      level: 'A1',
      name: 'المستوى الأول',
      description: 'مستوى المبتدئين - تعلم الأساسيات والتعبيرات البسيطة',
      lessonsCount: 25,
      color: 'from-green-400 to-green-600',
      path: '/level/a1'
    },
    {
      level: 'A2',
      name: 'المستوى الثاني',
      description: 'مستوى ما قبل المتوسط - بناء المهارات الأساسية',
      lessonsCount: 30,
      color: 'from-blue-400 to-blue-600',
      path: '/level/a2'
    },
    {
      level: 'B1',
      name: 'المستوى الثالث',
      description: 'المستوى المتوسط - تطوير القدرة على التواصل',
      lessonsCount: 35,
      color: 'from-orange-400 to-orange-600',
      path: '/level/b1'
    },
    {
      level: 'B2',
      name: 'المستوى الرابع',
      description: 'المستوى فوق المتوسط - إتقان اللغة بشكل متقدم',
      lessonsCount: 40,
      color: 'from-red-400 to-red-600',
      path: '/level/b2'
    }
  ];

  return (
    <>
      <Helmet>
        <title>{'المستويات الدراسية - Hallo Deutsch'}</title>
        <meta name="description" content="اختر مستواك من A1 إلى B2 وابدأ رحلتك في تعلم اللغة الألمانية" />
      </Helmet>

      <div className="min-h-screen py-16 md:py-24 mt-8 md:mt-0 bg-gray-50" dir="rtl">
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
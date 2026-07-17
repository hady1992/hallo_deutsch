import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Shapes, Car, Apple, Cat, Home, Sun, School } from 'lucide-react';
import KidsFileUploader from './KidsFileUploader';
import { getKidsTopics, saveKidsTopics } from '@/utils/storageManager';
import { getKidsTopics as getPublishedKidsTopics } from '@/services/contentRepository';

const defaultTopics = [
  { id: 1, title: 'Animals', arabicTitle: 'الحيوانات', icon: 'cat', color: 'bg-amber-100 text-amber-600', count: 15 },
  { id: 2, title: 'Colors', arabicTitle: 'الألوان', icon: 'sun', color: 'bg-red-100 text-red-600', count: 12 },
  { id: 3, title: 'Food', arabicTitle: 'الطعام', icon: 'apple', color: 'bg-green-100 text-green-600', count: 20 },
  { id: 4, title: 'Transport', arabicTitle: 'المواصلات', icon: 'car', color: 'bg-red-100 text-red-600', count: 10 },
  { id: 5, title: 'Home', arabicTitle: 'المنزل', icon: 'home', color: 'bg-amber-100 text-amber-600', count: 18 },
  { id: 6, title: 'Shapes', arabicTitle: 'الأشكال', icon: 'shapes', color: 'bg-red-100 text-red-600', count: 8 },
  { id: 7, title: 'School', arabicTitle: 'المدرسة', icon: 'school', color: 'bg-yellow-100 text-yellow-600', count: 14 },
];

const KidsTopics = ({ isAdmin }) => {
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    const loadData = async () => {
    const loaded = await getPublishedKidsTopics();
    if (loaded && loaded.length > 0) {
      const merged = new Map(defaultTopics.map((topic) => [topic.title, topic]));
      loaded.forEach((topic) => merged.set(topic.title, topic));
      setTopics(Array.from(merged.values()));
    } else {
      setTopics(defaultTopics);
    }
    };
    loadData();
  }, []);

  const handleUpload = (data) => {
    const newTopics = [...topics, ...data.map((item, idx) => ({ ...item, id: Date.now() + idx }))];
    setTopics(newTopics);
    saveKidsTopics(newTopics);
  };

  const getIcon = (iconName) => {
    switch (iconName?.toLowerCase()) {
      case 'cat': return <Cat size={40} />;
      case 'sun': return <Sun size={40} />;
      case 'apple': return <Apple size={40} />;
      case 'car': return <Car size={40} />;
      case 'home': return <Home size={40} />;
      case 'shapes': return <Shapes size={40} />;
      case 'school': return <School size={40} />;
      default: return <Star size={40} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
          <Star className="text-yellow-400 fill-yellow-400" />
          مواضيع شيقة
        </h2>
        {isAdmin && (
          <KidsFileUploader
            onUpload={handleUpload}
            label="إضافة مواضيع"
            templateData={[{ title: 'Space', arabicTitle: 'الفضاء', icon: 'star', color: 'bg-amber-100' }]}
          />
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {topics.map((topic, index) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, rotate: 2 }}
            className={`
              ${topic.color || 'bg-slate-100 text-slate-600'}
              aspect-square rounded-3xl p-6 flex flex-col items-center justify-center gap-4 shadow-sm cursor-pointer border-4 border-white
              group relative overflow-hidden
            `}
          >
            <div className="bg-white/50 p-4 rounded-full backdrop-blur-sm group-hover:scale-110 transition-transform">
              {getIcon(topic.icon)}
            </div>
            <div className="text-center z-10">
              <h3 className="font-black text-xl">{topic.title}</h3>
              <p className="font-bold opacity-80">{topic.arabicTitle}</p>
            </div>
            {/* Decorative background circle */}
            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/20 rounded-full" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default KidsTopics;

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function LevelCard({ level, name, description, lessonsCount, color, index, path }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.05, y: -5 }}
      onClick={handleClick}
      className={`bg-gradient-to-br ${color} p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer text-white`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-4xl font-bold">{level}</h2>
        <BookOpen size={40} />
      </div>
      <h3 className="text-2xl font-bold mb-3">{name}</h3>
      <p className="text-white/90 mb-4 leading-relaxed">{description}</p>
      <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm flex justify-between items-center">
        <p className="text-sm">
          <span className="font-semibold">{lessonsCount}</span> درس متاح
        </p>
        <span className="text-xs bg-white/20 px-2 py-1 rounded">اضغط للدخول</span>
      </div>
    </motion.div>
  );
}

export default LevelCard;
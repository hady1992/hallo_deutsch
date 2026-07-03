import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Repeat, Heart, CheckCircle2, Circle } from 'lucide-react';
import AudioButton from '@/components/AudioButton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function VocabularyCard({ 
  id,
  german, 
  arabic, 
  pronunciation, 
  type, 
  example, 
  exampleAr,
  isFavorite,
  isLearned,
  onToggleFavorite,
  onToggleLearned
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = (e) => {
    // Prevent flip if clicking buttons
    if (e.target.closest('button')) return;
    setIsFlipped(!isFlipped);
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case 'Noun': return 'bg-blue-100 text-blue-700';
      case 'Verb': return 'bg-green-100 text-green-700';
      case 'Adjective': return 'bg-purple-100 text-purple-700';
      case 'Phrase': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <motion.div
      className="relative h-64 w-full cursor-pointer perspective-1000 print:h-48 print:break-inside-avoid"
      onClick={handleFlip}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Front Side */}
      <motion.div
        className={cn(
          "absolute inset-0 bg-white rounded-xl shadow-md border border-gray-100 p-6 flex flex-col justify-between backface-hidden",
          isLearned && "border-green-200 bg-green-50/30"
        )}
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ backfaceVisibility: 'hidden' }}
      >
        <div className="flex justify-between items-start">
          <span className={cn("text-xs px-2 py-1 rounded-full font-medium print:border print:border-gray-300", getBadgeColor(type))}>
            {type}
          </span>
          <div className="flex gap-2 print:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-red-50 hover:text-red-500 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(id);
              }}
            >
              <Heart 
                size={18} 
                className={cn("transition-colors", isFavorite ? "fill-red-500 text-red-500" : "text-gray-400")} 
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-green-50 hover:text-green-500 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onToggleLearned(id);
              }}
            >
              {isLearned ? (
                <CheckCircle2 size={18} className="text-green-600" />
              ) : (
                <Circle size={18} className="text-gray-400" />
              )}
            </Button>
          </div>
        </div>

        <div className="text-center w-full my-auto">
          <h3 className="text-3xl font-bold text-gray-800 mb-2" dir="ltr">{german}</h3>
          <div className="flex justify-center items-center gap-2 print:hidden">
            <AudioButton text={german} size={20} className="text-blue-600 hover:bg-blue-50" />
            <span className="text-xs text-gray-400">استمع</span>
          </div>
          {/* Print only content */}
          <div className="hidden print:block text-xl text-gray-600 mt-2">{arabic}</div>
        </div>

        <div className="text-center text-xs text-gray-400 flex items-center justify-center gap-1 print:hidden">
          <Repeat size={12} />
          <span>اقلب البطاقة للمعنى</span>
        </div>
      </motion.div>

      {/* Back Side */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md p-6 flex flex-col justify-center items-center text-white backface-hidden print:hidden"
        initial={false}
        animate={{ rotateY: isFlipped ? 0 : -180 }}
        transition={{ duration: 0.6 }}
        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
      >
        <div className="text-center w-full" style={{ transform: 'rotateY(180deg)' }}>
          <h3 className="text-3xl font-bold mb-4 border-b border-white/20 pb-2">{arabic}</h3>
          
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm text-right">
            <p className="text-sm font-medium opacity-80 mb-1">مثال:</p>
            <div className="flex items-center justify-end gap-2 mb-1">
               <AudioButton text={example} size={16} variant="ghost" className="text-white hover:bg-white/20" />
               <p className="text-lg font-semibold" dir="ltr">{example}</p>
            </div>
            <p className="text-sm opacity-90" dir="rtl">{exampleAr}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default VocabularyCard;
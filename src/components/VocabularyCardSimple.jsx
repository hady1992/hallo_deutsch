import React from 'react';
import { motion } from 'framer-motion';
import { Heart, FileInput } from 'lucide-react';
import AudioButton from '@/components/AudioButton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const VocabularyCardSimple = ({ 
  word,
  isFavorite,
  onToggleFavorite
}) => {
  const getTypeColor = (type) => {
    switch(type) {
      case 'اسم': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'فعل': return 'bg-green-100 text-green-700 border-green-200';
      case 'صفة': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 overflow-hidden flex flex-col h-full relative group"
    >
      {/* Top Section: German Word & Type */}
      <div className="p-5 pb-2">
        <div className="flex justify-between items-start mb-2">
          <div className="flex gap-2 items-center">
            <span className={cn("text-xs px-2 py-1 rounded-full border font-medium", getTypeColor(word.type))}>
                {word.type}
            </span>
            {word.isImported && (
                <Badge variant="outline" className="text-[10px] h-5 gap-1 border-amber-200 bg-amber-50 text-amber-700">
                    <FileInput size={10} /> مستورد
                </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <AudioButton text={word.german} size={18} className="text-blue-600 hover:bg-blue-50" />
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-full transition-all duration-200",
                isFavorite 
                  ? "text-red-500 bg-red-50 hover:bg-red-100" 
                  : "text-gray-300 hover:text-red-400 hover:bg-gray-50"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(word.id);
              }}
            >
              <Heart size={18} className={cn(isFavorite && "fill-current")} />
            </Button>
          </div>
        </div>
        
        <h3 className="german-text text-2xl font-bold text-gray-800 mb-1">
          {word.german}
        </h3>
        {word.pronunciation && (
             <p className="german-text text-xs text-gray-400 font-mono">/{word.pronunciation}/</p>
        )}
      </div>

      {/* Middle Section: Arabic Translation */}
      <div className="px-5 py-2 bg-gradient-to-r from-gray-50 to-white border-y border-gray-50">
        <p className="text-xl font-bold text-blue-700 text-right">
          {word.arabic}
        </p>
      </div>

      {/* Bottom Section: Example */}
      <div className="p-5 pt-4 bg-white flex-grow flex flex-col justify-end">
        <div className="bg-gray-50 rounded-lg p-3 text-sm border border-gray-100 group-hover:border-blue-100 transition-colors">
          <div className="flex items-start gap-2 mb-2">
            <div className="mt-0.5">
              <AudioButton text={word.example} size={14} className="h-6 w-6 text-gray-500 hover:text-blue-600" />
            </div>
            <p className="german-text text-gray-700 font-medium italic">
              "{word.example}"
            </p>
          </div>
          <p className="text-gray-500 text-right border-t border-gray-200 pt-2 mt-1" dir="rtl">
            {word.exampleArabic}
          </p>
        </div>
      </div>
      
      {/* Category Tag */}
      <div className="absolute bottom-2 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <span className="text-[10px] text-gray-400 bg-white px-1 rounded shadow-sm border border-gray-100">
          {word.category}
        </span>
      </div>
    </motion.div>
  );
};

export default VocabularyCardSimple;
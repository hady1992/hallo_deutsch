import React, { useState, useEffect } from 'react';
import { Volume2, StopCircle, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

const AudioButton = ({ text, lang = 'de-DE', speed = 0.9, className, size = 18, variant = "ghost" }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [supported, setSupported] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined' && !('speechSynthesis' in window)) {
      setSupported(false);
    }
    
    // Cleanup on unmount
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Function to strip emojis, symbols, and underscores from text before reading
  const cleanTextForAudio = (input) => {
    if (!input) return '';
    return input
      .replace(/_/g, ' ')                     // Replace underscores with space (blank lines)
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Symbols & Pictographs
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport & Map Symbols
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
      .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
      .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
      .replace(/[\u{2B50}\u{2B55}]/gu, '')    // Stars/Circles
      .replace(/\s+/g, ' ')                   // Normalize spaces
      .trim();
  };

  const handlePlay = (e) => {
    e.stopPropagation();
    e.preventDefault(); 

    if (!supported) {
      toast({
        variant: "destructive",
        title: "Nicht unterstützt",
        description: "Ihr Browser unterstützt keine Sprachausgabe."
      });
      return;
    }
    
    if (!text) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    // Cancel any current speaking
    window.speechSynthesis.cancel();

    // Clean text
    const cleanText = cleanTextForAudio(text);
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang;
    utterance.rate = speed; 
    utterance.volume = 1;
    
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes("Google Deutsch")) ||
                           voices.find(v => v.name.includes("German") || v.name.includes("Deutsch")) ||
                           voices.find(v => v.lang.startsWith("de"));
                           
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = (err) => {
      console.error('Speech synthesis error:', err);
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  if (!supported) return (
      <Button variant="ghost" size="sm" disabled className="opacity-50 cursor-not-allowed">
          <VolumeX size={size} />
      </Button>
  );

  return (
    <Button
      variant={variant}
      size="sm"
      className={cn(
          "h-8 w-8 p-0 rounded-full transition-all duration-200 inline-flex items-center justify-center",
          isPlaying ? "bg-blue-100 text-blue-600" : "hover:bg-blue-100 text-slate-500 hover:text-blue-600",
          className
      )}
      onClick={handlePlay}
      title="Vorlesen"
      type="button"
    >
      {isPlaying ? (
        <StopCircle size={size} className="animate-pulse text-blue-600" />
      ) : (
        <Volume2 size={size} />
      )}
    </Button>
  );
};

export default AudioButton;
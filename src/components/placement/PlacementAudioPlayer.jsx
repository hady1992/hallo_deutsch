import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MAX_PLAYS = 3;

const PlacementAudioPlayer = ({ stimulus, playCount = 0, onSuccessfulPlay }) => {
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');
  const audioRef = useRef(null);
  const remaining = Math.max(0, MAX_PLAYS - playCount);

  useEffect(() => () => {
    if (audioRef.current) audioRef.current.pause();
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
  }, []);

  const playAudioUrl = async () => {
    const audio = new Audio(stimulus.audioUrl);
    audio.lang = 'de-DE';
    audioRef.current = audio;
    await audio.play();
    onSuccessfulPlay();
  };

  const playSpeech = () => new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window) || !stimulus.audioText) {
      reject(new Error('Speech synthesis is unavailable.'));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(stimulus.audioText);
    utterance.lang = 'de-DE';
    const germanVoice = window.speechSynthesis.getVoices().find((voice) => voice.lang?.toLowerCase().startsWith('de'));
    if (germanVoice) utterance.voice = germanVoice;
    utterance.rate = 0.9;
    utterance.onstart = () => {
      onSuccessfulPlay();
      resolve();
    };
    utterance.onerror = (event) => reject(new Error(event.error || 'Speech synthesis failed.'));
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  });

  const handlePlay = async () => {
    if (playing || remaining === 0) return;
    setPlaying(true);
    setError('');
    try {
      if (stimulus?.audioUrl) await playAudioUrl();
      else await playSpeech();
    } catch (playError) {
      console.error('[PlacementAudio] Playback failed:', playError);
      setError('تعذر تشغيل المقطع الصوتي. حاول مرة أخرى أو تحقق من إعدادات الصوت.');
    } finally {
      setPlaying(false);
    }
  };

  return (
    <div className="rounded-md border border-[#e0b21b]/35 bg-[#fffaf0] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handlePlay}
          disabled={playing || remaining === 0}
          className="brand-focus min-h-11 gap-2 border-[#d7a900] bg-white text-[#111111]"
        >
          {playing ? <Loader2 className="animate-spin" size={18} /> : <Volume2 size={18} />}
          تشغيل المقطع الصوتي
        </Button>
        <p className="text-sm font-bold text-slate-600">مرات التشغيل: {playCount} من {MAX_PLAYS}</p>
      </div>
      {remaining === 0 && <p className="mt-3 text-sm text-slate-600">تم استخدام مرات التشغيل الثلاث المتاحة.</p>}
      {error && <p role="alert" className="mt-3 text-sm font-bold text-red-700">{error}</p>}
    </div>
  );
};

export default PlacementAudioPlayer;

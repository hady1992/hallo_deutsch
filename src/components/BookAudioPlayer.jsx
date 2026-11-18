import React, { useRef, useState } from 'react';
import { Clock3, Repeat2 } from 'lucide-react';

export default function BookAudioPlayer({ track }) {
  const player = useRef(null);
  const [speed, setSpeed] = useState(1);
  const [repeat, setRepeat] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!track.source) {
    return (
      <div className="rounded-xl border border-[#D5AC55] bg-amber-50 p-5" role="status">
        <p className="flex items-center gap-2 font-black text-[#15344B]"><Clock3 size={20} aria-hidden="true" /> التسجيل قيد التجهيز</p>
        <p className="mt-2 leading-7 text-slate-700">هذا هو المكان المخصص للتسجيل في الكتاب. سيظهر مشغّل الصوت هنا بعد نشر التسجيل ومراجعته.</p>
      </div>
    );
  }

  const changeSpeed = (value) => {
    setSpeed(value);
    if (player.current) player.current.playbackRate = value;
  };

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <audio ref={player} src={track.source} controls preload="metadata" loop={repeat}
        className="w-full" aria-label={`تسجيل ${track.title}`} onError={() => setFailed(true)}
        onLoadedMetadata={() => { setFailed(false); if (player.current) player.current.playbackRate = speed; }} />
      {failed && <p role="alert" className="font-bold text-[#C0392B]">تعذّر تحميل التسجيل. تحقق من اتصالك وحاول مجددًا.</p>}
      <div className="flex flex-wrap items-center gap-2" aria-label="سرعة التشغيل">
        <span className="text-sm font-bold text-[#15344B]">سرعة التشغيل:</span>
        {[0.75, 1, 1.25].map((value) => (
          <button key={value} type="button" dir="ltr" aria-pressed={speed === value} onClick={() => changeSpeed(value)}
            className={`brand-focus min-h-11 rounded-lg border px-3 text-sm font-bold ${speed === value ? 'border-[#087F80] bg-[#087F80] text-white' : 'border-slate-300 bg-white text-[#15344B]'}`}>
            {value}×
          </button>
        ))}
        <button type="button" aria-pressed={repeat} onClick={() => setRepeat((value) => !value)}
          className={`brand-focus flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm font-bold ${repeat ? 'border-[#087F80] bg-[#087F80] text-white' : 'border-slate-300 bg-white text-[#15344B]'}`}>
          <Repeat2 size={18} aria-hidden="true" /> تكرار
        </button>
      </div>
    </div>
  );
}

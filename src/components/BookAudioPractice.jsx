import React, { useEffect, useRef, useState } from 'react';
import { Volume2, Square, Play } from 'lucide-react';
import { expandPracticeSpeech, getGermanVoices, getPracticeItems } from '@/data/deutschsprintPractice';

export default function BookAudioPractice({ practice }) {
  const [voices, setVoices] = useState([]);
  const [voiceURI, setVoiceURI] = useState('');
  const [rate, setRate] = useState(0.8);
  const [active, setActive] = useState(null);
  const [error, setError] = useState('');
  const session = useRef(0);
  const timer = useRef(null);
  const ownsPlayback = useRef(false);
  const utteranceRef = useRef(null);
  const supported = typeof window !== 'undefined' && !!window.speechSynthesis && typeof window.SpeechSynthesisUtterance === 'function';
  const voice = voices.find((entry) => entry.voiceURI === voiceURI) || voices[0];
  const allItems = getPracticeItems(practice.rows);

  useEffect(() => {
    if (!supported) return undefined;
    const synth = window.speechSynthesis;
    const refresh = () => setVoices(getGermanVoices(synth.getVoices()));
    refresh();
    synth.addEventListener('voiceschanged', refresh);
    return () => {
      session.current += 1;
      window.clearTimeout(timer.current);
      if (ownsPlayback.current) synth.cancel();
      synth.removeEventListener('voiceschanged', refresh);
    };
  }, [supported]);

  const stop = () => {
    session.current += 1;
    window.clearTimeout(timer.current);
    if (ownsPlayback.current) window.speechSynthesis.cancel();
    ownsPlayback.current = false;
    utteranceRef.current = null;
    setActive(null);
  };

  const play = (selectedItems) => {
    const items = expandPracticeSpeech(selectedItems);
    if (!supported || !voice || !items.length) return;
    stop();
    setError('');
    const token = session.current;
    const synth = window.speechSynthesis;
    const next = (index) => {
      if (token !== session.current) return;
      if (index >= items.length) {
        ownsPlayback.current = false;
        utteranceRef.current = null;
        setActive(null);
        return;
      }
      const entry = items[index];
      const utterance = new window.SpeechSynthesisUtterance(entry.spoken);
      utterance.voice = voice;
      utterance.lang = 'de-DE';
      utterance.rate = rate;
      utteranceRef.current = utterance;
      ownsPlayback.current = true;
      setActive(entry.key);
      utterance.onend = () => {
        if (token !== session.current) return;
        timer.current = window.setTimeout(() => next(index + 1), items.length > 1 ? 900 : 0);
      };
      utterance.onerror = () => {
        if (token !== session.current) return;
        stop();
        setError('تعذّر تشغيل الصوت. جرّب صوتًا ألمانيًا آخر أو جهازًا آخر.');
      };
      synth.speak(utterance);
    };
    // Cancel any queued browser speech before starting this practice session.
    synth.cancel();
    next(0);
  };

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 p-4 sm:p-6" aria-labelledby="practice-title">
      <p className="text-sm font-bold text-[#087F80]">الكتاب · الصفحة {practice.page}</p>
      <h2 id="practice-title" className="mt-1 text-xl font-black text-[#15344B]">استمع وكرّر</h2>
      <p className="mt-2 leading-7 text-slate-700">اضغط على أي حرف أو كلمة لتسمعها منفردة، أو استمع إلى المجموعة بالترتيب. هذا صوت آلي من المتصفح للتدريب، وليس التسجيل المعتمد للكتاب؛ قد يختلف نطقه بحسب الجهاز.</p>
      {!voice && <p role="status" className="mt-4 rounded-lg bg-amber-50 p-3 text-sm leading-6 text-slate-800">{supported ? 'لم يتوفر صوت ألماني (ألمانيا) في المتصفح حتى الآن. فعّل صوتًا ألمانيًا في إعدادات جهازك، أو اقرأ النص دون صوت.' : 'متصفحك لا يدعم النطق الآلي. يمكنك قراءة النص أدناه.'}</p>}
      {voice && (
        <div className="mt-4 space-y-3 rounded-xl bg-slate-50 p-3">
          <label className="block text-sm font-bold text-[#15344B]">الصوت الألماني
            <select dir="ltr" value={voice.voiceURI} onChange={(event) => { stop(); setVoiceURI(event.target.value); }} className="mt-1 block w-full rounded-md border border-slate-300 bg-white p-2 font-normal">
              {voices.map((entry) => <option key={entry.voiceURI} value={entry.voiceURI}>{entry.name}</option>)}
            </select>
          </label>
          <div className="flex flex-wrap gap-2">
            {[0.8, 1].map((value) => <button type="button" key={value} aria-pressed={rate === value} onClick={() => { stop(); setRate(value); }} className={`brand-focus min-h-11 rounded-lg border px-3 font-bold ${rate === value ? 'bg-[#15344B] text-white' : 'bg-white text-[#15344B]'}`}>{value === 0.8 ? 'بطيء' : 'طبيعي'}</button>)}
            <button type="button" onClick={() => active ? stop() : play(allItems)} className="brand-focus inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#087F80] px-4 font-bold text-white">{active ? <Square size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}{active ? 'إيقاف' : 'استمع للكل'}</button>
          </div>
        </div>
      )}
      {error && <p role="alert" className="mt-3 font-bold text-[#C0392B]">{error}</p>}
      <ul className={`mt-5 grid gap-3 ${practice.rows.length > 10 ? 'sm:grid-cols-2' : ''}`}>
        {practice.rows.map((row, rowIndex) => (
          <li key={`${row.label}-${rowIndex}`} className="rounded-xl border border-slate-200 p-3">
            <div dir="ltr" lang="de" className="german-text mb-2 font-black text-[#087F80]">{row.label}</div>
            <div className="flex flex-wrap gap-2">
              {row.items.map((entry, itemIndex) => {
                const key = `${rowIndex}-${itemIndex}`;
                const playing = active === key;
                return <button key={key} type="button" disabled={!voice} onClick={() => playing ? stop() : play([{ ...entry, key }])} aria-label={`استمع إلى ${entry.text}`} aria-pressed={playing} className={`brand-focus min-h-12 rounded-lg border px-3 py-2 text-right transition-colors disabled:cursor-default ${playing ? 'border-[#087F80] bg-[#087F80]/10' : 'border-slate-200 bg-white enabled:hover:border-[#087F80]'}`}>
                  <span className="flex items-center gap-2"><Volume2 size={16} aria-hidden="true" className={voice ? 'text-[#087F80]' : 'text-slate-400'} /><span dir="ltr" lang="de" className="german-text font-bold text-[#15344B]">{entry.text}</span></span>
                  <span className="mt-1 block text-xs text-slate-600">{entry.meaning}</span>
                </button>;
              })}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

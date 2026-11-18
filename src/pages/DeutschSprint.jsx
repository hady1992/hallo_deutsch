import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Headphones } from 'lucide-react';
import BookAudioPlayer from '@/components/BookAudioPlayer';
import BookAudioPractice from '@/components/BookAudioPractice';
import { A1_FIRST_LESSON_PATH, BOOK_AUDIO, DEUTSCHSPRINT_PATH, audioPath, findBookAudio } from '@/data/deutschsprintAudio';
import { BOOK_PRACTICE } from '@/data/deutschsprintPractice';

const SITE_URL = 'https://hallodeutschpro.com';

function SprintHeader() {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#D5AC55] pb-4">
      <Link to={DEUTSCHSPRINT_PATH} dir="ltr" className="brand-focus german-text text-2xl font-black text-[#15344B]">Deutsch<span className="text-[#087F80]">Sprint</span></Link>
      <span className="text-sm font-bold text-slate-600" lang="de" dir="ltr">A1 · Deutsch von Null</span>
    </div>
  );
}

function TrackList({ activeId }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {BOOK_AUDIO.map((track) => (
        <li key={track.id}>
          <Link to={audioPath(track.id)} aria-current={track.id === activeId ? 'page' : undefined}
            className={`brand-focus flex h-full items-start gap-3 rounded-xl border p-4 transition-colors hover:border-[#087F80] ${track.id === activeId ? 'border-[#087F80] bg-[#087F80]/5' : 'border-slate-200 bg-white'}`}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#087F80]/10 text-[#087F80]"><Headphones size={22} aria-hidden="true" /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-bold text-[#087F80]" dir="ltr">{track.id}</span>
              <span className="mt-1 block font-black text-[#15344B]">{track.title}</span>
              <span lang="de" dir="ltr" className="german-text mt-1 block text-sm text-slate-600">{track.german}</span>
              <span className="mt-3 inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{track.source ? 'التسجيل متاح' : 'تدريب نطق · التسجيل قيد التجهيز'}</span>
            </span>
            <ArrowLeft size={17} className="mt-3 shrink-0 text-[#087F80]" aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function DeutschSprint() {
  return (
    <div dir="rtl" className="min-h-screen bg-white px-4 pb-16 pt-24 text-[#15344B] md:px-8 md:pt-28">
      <Helmet>
        <title>DeutschSprint A1 | كتب الألمانية والتسجيلات</title>
        <meta name="description" content="التسجيلات المرافقة لكتاب DeutschSprint A1 لتعلّم الألمانية من الصفر." />
        <link rel="canonical" href={`${SITE_URL}${DEUTSCHSPRINT_PATH}`} />
      </Helmet>
      <div className="mx-auto max-w-4xl">
        <SprintHeader />
        <div className="rounded-2xl bg-[#15344B] p-6 text-white md:p-9">
          <p className="mb-3 text-sm font-bold text-[#D5AC55]">الكتاب الأول · الدرس 01</p>
          <h1 className="text-3xl font-black leading-tight md:text-4xl">الأبجدية وأساسيات النطق</h1>
          <p lang="de" dir="ltr" className="german-text mt-3 text-lg font-bold text-white/80">Lektion 01 – Alphabet und Aussprache</p>
          <p className="mt-4 max-w-xl leading-7 text-white/90">اختر المقطع الذي يظهر رمزه في صفحتك. يمكنك قراءة أمثلة الكتاب والتدرّب على النطق بصوت آلي ألماني إن كان متاحًا على جهازك، حتى نشر التسجيلات المعتمدة.</p>
        </div>
        <section className="mt-8" aria-labelledby="tracks-title">
          <h2 id="tracks-title" className="mb-4 text-xl font-black">المقاطع الصوتية للدرس الأول</h2>
          <TrackList />
        </section>
        <Link to={A1_FIRST_LESSON_PATH} className="brand-focus mt-8 inline-flex min-h-12 items-center gap-2 rounded-lg border border-[#087F80] px-4 py-3 font-bold text-[#087F80] hover:bg-[#087F80]/5"><BookOpen size={20} aria-hidden="true" /> انتقل إلى درس الأبجدية التفاعلي</Link>
      </div>
    </div>
  );
}

export function DeutschSprintAudio() {
  const { audioId } = useParams();
  const track = findBookAudio(audioId);
  return (
    <div dir="rtl" className="min-h-screen bg-white px-4 pb-16 pt-24 text-[#15344B] md:px-8 md:pt-28">
      <Helmet>
        <title>{track ? `${track.title} | DeutschSprint ${track.id}` : 'التسجيل غير موجود | DeutschSprint'}</title>
        {track ? <link rel="canonical" href={`${SITE_URL}${audioPath(track.id)}`} /> : <meta name="robots" content="noindex" />}
      </Helmet>
      <div className="mx-auto max-w-3xl">
        <SprintHeader />
        {track ? (
          <>
            <section className="rounded-2xl border border-slate-200 p-5 sm:p-8">
              <p className="mb-3 flex flex-wrap items-center gap-2 text-sm font-bold text-[#087F80]"><Headphones size={20} aria-hidden="true" /><span dir="ltr">{track.id}</span><span>· الدرس 01</span></p>
              <h1 className="text-3xl font-black">{track.title}</h1>
              <p lang="de" dir="ltr" className="german-text mt-2 text-lg font-bold text-[#087F80]">{track.german}</p>
              <p className="mb-6 mt-4 leading-7 text-slate-700">{track.description}</p>
              <BookAudioPlayer key={track.id} track={track} />
            </section>
            {BOOK_PRACTICE[track.id] && <BookAudioPractice key={track.id} practice={BOOK_PRACTICE[track.id]} />}
            <section className="mt-8" aria-labelledby="other-tracks"><h2 id="other-tracks" className="mb-4 text-xl font-black">مقاطع الدرس الأول</h2><TrackList activeId={track.id} /></section>
          </>
        ) : (
          <section className="rounded-xl border border-slate-200 p-6">
            <h1 className="text-2xl font-black">التسجيل غير موجود</h1>
            <p className="mt-3 text-slate-700">تأكّد من رمز المقطع الموجود في كتابك أو اختره من قائمة التسجيلات.</p>
          </section>
        )}
        <Link to={DEUTSCHSPRINT_PATH} className="brand-focus mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg font-bold text-[#087F80]"><ArrowLeft size={18} aria-hidden="true" /> جميع تسجيلات الكتاب</Link>
      </div>
    </div>
  );
}

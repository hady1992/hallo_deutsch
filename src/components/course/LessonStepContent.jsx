import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, Target } from 'lucide-react';
import AudioButton from '@/components/AudioButton';
import LessonQuizStep from '@/components/course/LessonQuizStep';

const hasArabic = (text) => /[\u0600-\u06ff]/.test(String(text || ''));
const hasLatin = (text) => /[A-Za-zÄÖÜäöüß]/.test(String(text || ''));
const asText = (value) => (typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '');

const GermanLine = ({ children, className = '' }) => (
  <div dir="ltr" className={`german-text rounded-md border border-[#e8b21e]/35 bg-[#fcfaf6] px-4 py-3 text-lg font-bold leading-8 text-[#111111] ${className}`}>
    {children}
  </div>
);

const RichText = ({ text }) => {
  const lines = asText(text).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length === 0) return null;
  return (
    <div className="space-y-3">
      {lines.map((line, index) => {
        const germanLine = !hasArabic(line) && hasLatin(line);
        return germanLine ? (
          <GermanLine key={`${line}-${index}`}>{line}</GermanLine>
        ) : (
          <p key={`${line}-${index}`} className="whitespace-pre-line leading-8 text-slate-700">{line}</p>
        );
      })}
    </div>
  );
};

const IntroStep = ({ lesson, onResume, resumeTitle }) => (
  <div className="space-y-6">
    {(lesson.description || lesson.explanation || lesson.introArabic) && (
      <RichText text={lesson.description || lesson.explanation || lesson.introArabic} />
    )}
    {lesson.introGerman && <GermanLine>{lesson.introGerman}</GermanLine>}

    {lesson.objectives?.length > 0 && (
      <section>
        <h3 className="mb-4 flex items-center gap-2 text-xl font-black text-[#111111]">
          <Target size={21} className="text-[#d71920]" /> أهداف الدرس
        </h3>
        <ul className="grid gap-3 sm:grid-cols-2">
          {lesson.objectives.map((objective, index) => (
            <li key={`${objective}-${index}`} className="flex items-start gap-2 rounded-md bg-[#fcfaf6] p-3 leading-7 text-slate-700">
              <CheckCircle2 size={18} className="mt-1 shrink-0 text-emerald-600" />
              <span>{objective}</span>
            </li>
          ))}
        </ul>
      </section>
    )}

    {resumeTitle && (
      <button type="button" onClick={onResume} className="brand-focus inline-flex min-h-11 items-center gap-2 rounded-md bg-[#d71920] px-5 font-black text-white hover:bg-[#b91218]">
        <BookOpen size={18} /> متابعة الدرس: {resumeTitle}
      </button>
    )}
  </div>
);

const SectionStep = ({ item }) => {
  const examples = Array.isArray(item.examples) ? item.examples : [];
  return (
    <div className="space-y-5">
      <RichText text={item.text || item.explanation || item.description} />
      {item.german && <GermanLine>{item.german}</GermanLine>}
      {item.example && (
        <div className="space-y-2 rounded-md bg-red-50 p-4">
          <p dir="ltr" className="german-text text-lg font-bold text-[#b91218]">{item.example}</p>
          {item.exampleArabic && <p className="text-slate-600">{item.exampleArabic}</p>}
        </div>
      )}
      {examples.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {examples.map((example, index) => {
            const german = asText(example?.german || example?.example || example);
            const arabic = asText(example?.arabic || example?.translation || example?.exampleArabic);
            return (
              <div key={example?.id || index} className="rounded-md border border-black/10 bg-white p-4">
                {german && <p dir="ltr" className="german-text font-bold text-[#b91218]">{german}</p>}
                {arabic && <p className="mt-1 text-slate-600">{arabic}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const VocabularyStep = ({ items }) => {
  const pageSize = 8;
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  useEffect(() => setPage(0), [items]);
  const visibleItems = items.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        {visibleItems.map((item, index) => {
          const german = asText(item.german || item.word || item.noun || item.title);
          const translation = asText(item.translation || item.arabic || item.text);
          return (
            <article key={item.id || `${german}-${index}`} className="rounded-lg border border-black/10 bg-[#fcfaf6] p-4">
              <div className="flex items-start justify-between gap-3" dir="ltr">
                <div className="min-w-0">
                  <p className="german-text break-words text-xl font-black text-[#b91218]">{german || '-'}</p>
                  {translation && <p dir="rtl" className="mt-1 text-right font-bold text-slate-600">{translation}</p>}
                </div>
                {german && <AudioButton text={german} className="shrink-0 bg-white" />}
              </div>
              {item.example && (
                <div className="mt-4 border-t border-black/10 pt-3">
                  <p dir="ltr" className="german-text font-semibold text-[#111111]">{item.example}</p>
                  {item.exampleArabic && <p className="mt-1 text-sm text-slate-500">{item.exampleArabic}</p>}
                </div>
              )}
            </article>
          );
        })}
      </div>

      {pageCount > 1 && (
        <nav aria-label="صفحات المفردات" className="mt-5 flex flex-wrap justify-center gap-2">
          {Array.from({ length: pageCount }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setPage(index)}
              aria-current={page === index ? 'page' : undefined}
              className={`brand-focus min-h-10 rounded-md px-4 text-sm font-black ${page === index ? 'bg-[#d71920] text-white' : 'border border-black/10 bg-white text-slate-700'}`}
            >
              {index * pageSize + 1}–{Math.min((index + 1) * pageSize, items.length)}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
};

const splitSpeakerText = (text) => {
  const value = asText(text);
  const marker = /(?:^|\s)([A-ZÄÖÜ][A-Za-zÄÖÜäöüß]{0,20}):\s*/g;
  const matches = [...value.matchAll(marker)];
  if (matches.length < 2) return [];
  return matches.map((match, index) => ({
    speaker: match[1],
    text: value.slice(match.index + match[0].length, matches[index + 1]?.index ?? value.length).trim(),
  })).filter((line) => line.text);
};

const expandConversationItems = (items) => items.flatMap((item, itemIndex) => {
  const germanSource = asText(item.german || item.sentence || item.dialogue || item.text || item.example);
  const germanLines = splitSpeakerText(germanSource);
  if (germanLines.length === 0) return [{ ...item, conversationIndex: itemIndex }];
  const translationLines = splitSpeakerText(item.translation || item.arabic || item.exampleArabic);
  return germanLines.map((line, lineIndex) => ({
    ...item,
    id: `${item.id || `conversation-${itemIndex}`}-${lineIndex}`,
    speaker: line.speaker,
    german: line.text,
    translation: translationLines[lineIndex]?.text || '',
    conversationIndex: lineIndex,
  }));
});

const ConversationStep = ({ items }) => (
  <div className="space-y-4">
    {expandConversationItems(items).map((item, index) => {
      const speaker = asText(item.speaker || item.name || item.role || item.person || item.label) || (index % 2 === 0 ? 'A' : 'B');
      const german = asText(item.german || item.sentence || item.dialogue || item.text || item.example);
      const translation = asText(item.translation || item.arabic || item.exampleArabic);
      return (
        <div key={item.id || index} className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
          <article className={`w-full max-w-[92%] rounded-lg border p-4 sm:max-w-[78%] ${index % 2 === 0 ? 'border-red-100 bg-red-50' : 'border-amber-200 bg-amber-50'}`}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="font-black text-[#111111]">{speaker}</span>
              {german && <AudioButton text={german} className="shrink-0 bg-white" />}
            </div>
            {german && <p dir="ltr" className="german-text text-lg font-bold leading-8 text-[#111111]">{german}</p>}
            {translation && translation !== german && <p className="mt-2 text-slate-600">{translation}</p>}
          </article>
        </div>
      );
    })}
  </div>
);

const ItemGrid = ({ items, tone = 'neutral' }) => (
  <div className="grid gap-4 sm:grid-cols-2">
    {items.map((item, index) => {
      const german = asText(item.german || item.example || item.germanTitle);
      const title = asText(item.title);
      const text = asText(item.text || item.translation || item.arabic || item.question);
      return (
        <article key={item.id || index} className={`rounded-lg border p-4 ${tone === 'gold' ? 'border-amber-200 bg-amber-50' : 'border-black/10 bg-[#fcfaf6]'}`}>
          {title && <h3 className="font-black text-[#111111]">{title}</h3>}
          {german && <p dir="ltr" className="german-text mt-2 text-lg font-bold text-[#b91218]">{german}</p>}
          {text && <div className="mt-2"><RichText text={text} /></div>}
          {item.exampleArabic && <p className="mt-2 text-sm text-slate-500">{item.exampleArabic}</p>}
        </article>
      );
    })}
  </div>
);

const LessonStepContent = ({ step, onResume, resumeTitle }) => {
  if (!step) return null;
  if (step.type === 'intro') return <IntroStep lesson={step.data} onResume={onResume} resumeTitle={resumeTitle} />;
  if (step.type === 'section') return <SectionStep item={step.data || {}} />;
  if (step.type === 'vocabulary') return <VocabularyStep items={step.data || []} />;
  if (step.type === 'conversation') return <ConversationStep items={step.data || []} />;
  if (step.type === 'quiz') return <LessonQuizStep questions={step.data || []} />;
  if (step.type === 'reading') return <ItemGrid items={step.data || []} />;
  if (step.type === 'grammar') return <ItemGrid items={step.data || []} tone="gold" />;
  return <ItemGrid items={step.data || []} />;
};

export default LessonStepContent;

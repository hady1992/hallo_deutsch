import React from 'react';
import { AlertTriangle, BookOpen, ClipboardCheck, Languages } from 'lucide-react';
import { normalizeLessonForDisplay } from '@/utils/lessonNormalizer';

const INCOMPLETE_LESSON_MESSAGE = 'هذا الدرس منشور لكنه لا يحتوي تفاصيل كاملة بعد.';

class LessonRenderBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[SafeLessonRenderer] Lesson rendering failed:', error, errorInfo);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
        <AlertTriangle className="mb-2" size={22} />
        <p className="font-bold">{INCOMPLETE_LESSON_MESSAGE}</p>
      </div>
    );
  }
}

const DetailList = ({ title, icon: Icon, items, renderItem }) => {
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h4 className="mb-3 flex items-center gap-2 font-black text-slate-800">
        <Icon size={18} className="text-blue-600" />
        {title}
      </h4>
      <div className="space-y-3">
        {items.map((item, index) => renderItem(item, index))}
      </div>
    </section>
  );
};

const SafeLessonContent = ({ lesson }) => {
  const normalized = normalizeLessonForDisplay(lesson);

  if (!normalized.hasLessonDetails) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 font-bold text-amber-900">
        {INCOMPLETE_LESSON_MESSAGE}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {normalized.explanation && (
        <p className="whitespace-pre-line leading-8 text-slate-700">{normalized.explanation}</p>
      )}

      <DetailList
        title="محتوى الدرس"
        icon={BookOpen}
        items={normalized.sections}
        renderItem={(item, index) => (
          <div key={item.id || index} className="rounded-md bg-slate-50 p-3">
            {item.title && <h5 className="mb-1 font-bold text-slate-800">{item.title}</h5>}
            {item.germanTitle && item.germanTitle !== item.title && (
              <p dir="ltr" className="mb-2 font-semibold text-blue-700">{item.germanTitle}</p>
            )}
            {item.text && <p className="whitespace-pre-line leading-7 text-slate-600">{item.text}</p>}
            {item.examples.length > 0 && (
              <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">
                {item.examples.map((example, exampleIndex) => (
                  <div key={example.id || exampleIndex} className="rounded bg-white p-2 text-sm">
                    {typeof example.german === 'string' && <p dir="ltr" className="font-bold text-blue-800">{example.german}</p>}
                    {typeof example.arabic === 'string' && <p className="text-slate-600">{example.arabic}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      />

      <DetailList
        title="المفردات"
        icon={Languages}
        items={normalized.vocabulary}
        renderItem={(item, index) => {
          const german = item.german || item.word || item.noun || item.title;
          const translation = item.translation || item.arabic || item.text;
          return (
            <div key={item.id || index} className="flex flex-col justify-between gap-1 rounded-md bg-blue-50 p-3 sm:flex-row">
              <span dir="ltr" className="font-bold text-blue-800">{german || '—'}</span>
              <div>
                <p className="text-slate-600">{translation || '—'}</p>
                {item.example && <p dir="ltr" className="mt-1 text-xs text-blue-700">{item.example}</p>}
                {item.exampleArabic && <p className="text-xs text-slate-500">{item.exampleArabic}</p>}
              </div>
            </div>
          );
        }}
      />

      <DetailList
        title="اختبار قصير"
        icon={ClipboardCheck}
        items={normalized.shortQuiz}
        renderItem={(item, index) => (
          <div key={item.id || index} className="rounded-md bg-emerald-50 p-3">
            <p className="font-bold text-emerald-900">{item.question || item.title || item.text}</p>
          </div>
        )}
      />

      <DetailList
        title="تمارين الدرس"
        icon={ClipboardCheck}
        items={normalized.exercises}
        renderItem={(item, index) => (
          <div key={item.id || index} className="rounded-md bg-slate-50 p-3 text-slate-700">
            {item.question || item.title || item.text}
          </div>
        )}
      />
    </div>
  );
};

const SafeLessonRenderer = ({ lesson }) => (
  <LessonRenderBoundary>
    <SafeLessonContent lesson={lesson} />
  </LessonRenderBoundary>
);

export default SafeLessonRenderer;

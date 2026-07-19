import React, { useMemo, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import BidiText from '@/components/common/BidiText';
import ExerciseEmptyState from '@/components/exercises/ExerciseEmptyState';
import { TOPIC_GROUPS, normalizeExerciseTaxonomyText } from '@/utils/exerciseTaxonomy';

const TopicRow = ({ topic, onSelect }) => (
  <div className="flex min-h-12 items-center gap-3 border-b border-slate-100 px-1 py-2 last:border-b-0">
    <BidiText text={topic.label} className="min-w-0 flex-1 font-bold text-slate-800" />
    <span className="shrink-0 text-sm text-slate-500">{topic.count} تمرين</span>
    <button type="button" onClick={() => onSelect(topic.key)} className="brand-focus min-h-9 shrink-0 rounded-md border border-slate-300 px-3 text-sm font-bold text-slate-700 hover:border-[#d71920] hover:text-[#d71920]">
      ابدأ
    </button>
  </div>
);

const ExerciseTopicsView = ({ topics, onSelect }) => {
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);
  const normalizedSearch = normalizeExerciseTaxonomyText(search);

  const filteredTopics = useMemo(() => {
    if (!normalizedSearch) return topics;
    return topics.filter((topic) => normalizeExerciseTaxonomyText(`${topic.label} ${topic.key}`).includes(normalizedSearch));
  }, [normalizedSearch, topics]);

  const groupedTopics = useMemo(() => {
    const groups = [...TOPIC_GROUPS, { key: 'additional', label: 'موضوعات إضافية' }];
    return groups
      .map((group) => ({ ...group, topics: filteredTopics.filter((topic) => topic.groupKey === group.key) }))
      .filter((group) => group.topics.length > 0);
  }, [filteredTopics]);

  const visiblePopular = normalizedSearch ? filteredTopics : topics.slice(0, 12);

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="ابحث عن قاعدة أو موضوع"
          className="brand-focus min-h-12 w-full rounded-lg border border-slate-300 bg-white py-3 pl-4 pr-12 text-base text-slate-800"
        />
      </div>

      {visiblePopular.length === 0 ? (
        <ExerciseEmptyState message="لا توجد نتائج مطابقة للبحث." />
      ) : (
        <section aria-labelledby="popular-topics-title">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 id="popular-topics-title" className="text-lg font-black text-[#111111]">{normalizedSearch ? 'نتائج البحث' : 'الأكثر استخدامًا'}</h3>
            {!normalizedSearch && <span className="text-sm text-slate-500">أعلى 12 موضوعًا</span>}
          </div>
          <div className="rounded-lg border border-slate-200 bg-white px-4 shadow-sm">
            {visiblePopular.map((topic) => <TopicRow key={topic.normalizedKey} topic={topic} onSelect={onSelect} />)}
          </div>
        </section>
      )}

      {!normalizedSearch && topics.length > 12 && (
        <button
          type="button"
          onClick={() => setShowAll((current) => !current)}
          className="brand-focus inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 font-bold text-slate-700 hover:border-[#d71920] hover:text-[#d71920]"
          aria-expanded={showAll}
        >
          {showAll ? 'إخفاء بقية الموضوعات' : 'عرض جميع الموضوعات'}
          <ChevronDown className={`h-4 w-4 transition ${showAll ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
      )}

      {showAll && !normalizedSearch && groupedTopics.map((group) => (
        <details key={group.key} className="group rounded-lg border border-slate-200 bg-white shadow-sm" open={Boolean(normalizedSearch)}>
          <summary className="brand-focus flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-4 font-black text-slate-800">
            {group.label}
            <span className="flex items-center gap-2 text-sm font-normal text-slate-500">
              {group.topics.length} موضوع
              <ChevronDown className="h-4 w-4 transition group-open:rotate-180" aria-hidden="true" />
            </span>
          </summary>
          <div className="border-t border-slate-100 px-4">
            {group.topics.map((topic) => <TopicRow key={topic.normalizedKey} topic={topic} onSelect={onSelect} />)}
          </div>
        </details>
      ))}
    </div>
  );
};

export default ExerciseTopicsView;

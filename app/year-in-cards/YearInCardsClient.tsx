'use client';

import { useEffect, useMemo, useState } from 'react';
import { cardYears, YEAR_GRADE_STYLE, type CardYear, type YearGrade } from '@/data/year-in-cards';

type SectionTab = 'stories' | 'hammers' | 'products' | 'events' | 'all';

const VOTE_KEY = 'cv_year_in_cards_vote_v1';
const NOTE_KEY = 'cv_year_in_cards_notes_v1';

export default function YearInCardsClient() {
  const [yearFilter, setYearFilter] = useState<number | 'ALL'>('ALL');
  const [sectionTab, setSectionTab] = useState<SectionTab>('all');
  const [favoriteYear, setFavoriteYear] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const rawVote = localStorage.getItem(VOTE_KEY);
      if (rawVote) {
        const n = parseInt(rawVote, 10);
        if (!Number.isNaN(n)) setFavoriteYear(n);
      }
      const rawNotes = localStorage.getItem(NOTE_KEY);
      if (rawNotes) setNotes(JSON.parse(rawNotes));
    } catch {}
  }, []);

  const toggleFavorite = (year: number) => {
    setFavoriteYear((prev) => {
      const next = prev === year ? null : year;
      try {
        if (next === null) localStorage.removeItem(VOTE_KEY);
        else localStorage.setItem(VOTE_KEY, String(next));
      } catch {}
      return next;
    });
  };

  const saveNote = (yearId: string, value: string) => {
    setNotes((prev) => {
      const next = { ...prev };
      if (value.trim() === '') delete next[yearId];
      else next[yearId] = value;
      try {
        localStorage.setItem(NOTE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const filtered = useMemo(() => {
    if (yearFilter === 'ALL') return cardYears;
    return cardYears.filter((y) => y.year === yearFilter);
  }, [yearFilter]);

  const totals = useMemo(() => {
    const hammers = cardYears.reduce((acc, y) => acc + y.bigHammers.length, 0);
    const products = cardYears.reduce((acc, y) => acc + y.productLaunches.length, 0);
    const events = cardYears.reduce((acc, y) => acc + y.industryEvents.length, 0);
    const stories = cardYears.reduce((acc, y) => acc + y.topStories.length, 0);
    return { hammers, products, events, stories };
  }, []);

  const copyYear = async (y: CardYear) => {
    const lines = [
      `${y.year} in Cards — ${y.mood} — Grade ${y.grade}`,
      `Theme: ${y.theme}`,
      `Market: ${y.marketMove}`,
      '',
      'TOP STORIES:',
      ...y.topStories.map((s) => `  \u2022 ${s.label}: ${s.detail}`),
      '',
      'BIG HAMMERS:',
      ...y.bigHammers.map((h) => `  \u2022 ${h.label}: ${h.detail}`),
      '',
      `Watershed: ${y.watershedMoment}`,
      `Lookback: ${y.lookback}`,
      '',
      'via CardVault · Year in Cards',
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopiedId(y.id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {}
  };

  return (
    <div>
      {/* Stats strip */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-5 gap-2">
        <Stat label="Years" value={String(cardYears.length)} />
        <Stat label="Top stories" value={String(totals.stories)} />
        <Stat label="Big hammers" value={String(totals.hammers)} />
        <Stat label="Product launches" value={String(totals.products)} />
        <Stat label="Industry events" value={String(totals.events)} />
      </div>

      {/* Favorite-year poll */}
      <div className="mb-6 rounded-2xl border border-indigo-900/50 bg-gradient-to-br from-indigo-950/40 to-slate-950/40 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">Which year was best for you?</div>
            <div className="mt-1 text-sm text-slate-300">
              Your pick stays in your browser. Switch any time.{' '}
              {favoriteYear ? (
                <span className="text-indigo-300">
                  Locked: <strong>{favoriteYear}</strong>
                </span>
              ) : (
                <span className="text-slate-500">No pick yet.</span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {cardYears.map((y) => (
              <button
                key={y.id}
                onClick={() => toggleFavorite(y.year)}
                className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold transition ${
                  favoriteYear === y.year
                    ? 'border-indigo-500/60 bg-indigo-500/15 text-indigo-200'
                    : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-indigo-500/40 hover:text-indigo-200'
                }`}
              >
                {y.year}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 sm:p-5">
        <div className="flex flex-wrap items-start gap-4">
          <FilterGroup
            label="Year"
            options={['ALL', ...cardYears.map((y) => String(y.year))]}
            value={yearFilter === 'ALL' ? 'ALL' : String(yearFilter)}
            onChange={(v) => setYearFilter(v === 'ALL' ? 'ALL' : parseInt(v, 10))}
          />
          <FilterGroup
            label="Section"
            options={['all', 'stories', 'hammers', 'products', 'events']}
            value={sectionTab}
            onChange={(v) => setSectionTab(v as SectionTab)}
            titleize={{
              all: 'All sections',
              stories: 'Top stories',
              hammers: 'Big hammers',
              products: 'Product launches',
              events: 'Industry events',
            }}
          />
        </div>
        <div className="mt-3 border-t border-slate-800 pt-3 text-xs text-slate-400">
          Showing <span className="font-semibold text-slate-200">{filtered.length}</span> of {cardYears.length} years
        </div>
      </div>

      {/* Year entries */}
      <div className="space-y-5">
        {filtered.map((y) => (
          <YearCard
            key={y.id}
            y={y}
            sectionTab={sectionTab}
            note={notes[y.id] ?? ''}
            onNoteChange={(v) => saveNote(y.id, v)}
            onCopy={() => copyYear(y)}
            copied={copiedId === y.id}
            isFavorite={favoriteYear === y.year}
          />
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-xs text-slate-500">
        Editorial commentary with reported hammer prices from public auction records. Private-sale and
        rumored figures are labeled. Year grades reflect hobby condition, not portfolio outcomes.
        Next calendar year ships January 2027.
      </div>
    </div>
  );
}

function YearCard({
  y,
  sectionTab,
  note,
  onNoteChange,
  onCopy,
  copied,
  isFavorite,
}: {
  y: CardYear;
  sectionTab: SectionTab;
  note: string;
  onNoteChange: (v: string) => void;
  onCopy: () => void;
  copied: boolean;
  isFavorite: boolean;
}) {
  const gradeStyle = YEAR_GRADE_STYLE[y.grade];
  const showStories = sectionTab === 'all' || sectionTab === 'stories';
  const showHammers = sectionTab === 'all' || sectionTab === 'hammers';
  const showProducts = sectionTab === 'all' || sectionTab === 'products';
  const showEvents = sectionTab === 'all' || sectionTab === 'events';

  return (
    <article
      className={`overflow-hidden rounded-2xl border ${
        isFavorite ? 'border-indigo-500/50 ring-1 ring-indigo-500/40' : 'border-slate-800'
      } bg-gradient-to-br ${y.moodTint}`}
    >
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/60 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="font-serif text-4xl font-black text-white sm:text-5xl">{y.year}</div>
          <span
            className={`rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${y.moodTint}`}
          >
            {y.mood}
          </span>
          <span
            className={`rounded-full border px-2 py-0.5 text-xs font-bold ${gradeStyle.bg} ${gradeStyle.fg}`}
            aria-label={`Year grade ${y.grade}`}
          >
            Grade {y.grade}
          </span>
          <span className="rounded-md border border-slate-700 bg-slate-950/80 px-2 py-0.5 text-[11px] font-semibold text-slate-300">
            {y.marketMove}
          </span>
          {isFavorite && (
            <span className="rounded-md border border-indigo-500/60 bg-indigo-500/15 px-2 py-0.5 text-[11px] font-bold text-indigo-200">
              &#9733; Your pick
            </span>
          )}
        </div>
        <p className="mt-3 text-sm italic text-slate-300">{y.theme}</p>
        <p className="mt-2 text-sm text-slate-300 leading-relaxed">{y.narrative}</p>
      </header>

      <div className="space-y-4 p-4 sm:p-5">
        {showStories && (
          <Section title="Top stories" tint="text-emerald-300" items={y.topStories} />
        )}
        {showHammers && (
          <Section title="Big hammers" tint="text-amber-300" items={y.bigHammers} />
        )}
        {showProducts && (
          <Section title="Product launches" tint="text-sky-300" items={y.productLaunches} />
        )}
        {showEvents && (
          <Section title="Industry events" tint="text-violet-300" items={y.industryEvents} />
        )}

        {sectionTab === 'all' && (
          <>
            <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-3 text-sm text-amber-200">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">Watershed</div>
              <p className="mt-0.5 leading-relaxed">{y.watershedMoment}</p>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-3 text-sm text-slate-300 italic">
              &ldquo;{y.lookback}&rdquo;
            </div>

            <div>
              <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Key stats</div>
              <ul className="grid gap-1.5 sm:grid-cols-3">
                {y.stats.map((s, i) => (
                  <li
                    key={i}
                    className="rounded-lg border border-slate-700 bg-slate-950/70 p-2"
                  >
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{s.label}</div>
                    <div className="mt-0.5 text-xs text-slate-200">{s.detail}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <label
                htmlFor={`note-${y.id}`}
                className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500"
              >
                Your {y.year} note
              </label>
              <textarea
                id={`note-${y.id}`}
                value={note}
                onChange={(e) => onNoteChange(e.target.value)}
                placeholder={`What were you buying / selling / chasing in ${y.year}? (saved in your browser)`}
                rows={2}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/60 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end">
              <button
                onClick={onCopy}
                className="rounded-md border border-slate-700 bg-slate-950 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:border-indigo-500/40 hover:text-indigo-300"
              >
                {copied ? '\u2713 Copied year' : 'Copy year summary'}
              </button>
            </div>
          </>
        )}
      </div>
    </article>
  );
}

function Section({
  title,
  tint,
  items,
}: {
  title: string;
  tint: string;
  items: { label: string; detail: string }[];
}) {
  return (
    <section>
      <h3 className={`mb-2 text-xs font-bold uppercase tracking-wider ${tint}`}>{title}</h3>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li
            key={i}
            className="rounded-lg border border-slate-800 bg-slate-950/50 p-3"
          >
            <div className="text-sm font-semibold text-white">{it.label}</div>
            <div className="mt-0.5 text-xs text-slate-400 leading-relaxed">{it.detail}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
  titleize,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  titleize?: Record<string, string>;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</span>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`rounded-md border px-2 py-1 text-[11px] font-medium transition ${
              value === opt
                ? 'border-indigo-500/60 bg-indigo-500/15 text-indigo-200'
                : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-600 hover:text-slate-200'
            }`}
          >
            {titleize ? titleize[opt] ?? opt : opt === 'ALL' ? 'All' : opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3 text-center">
      <div className="text-lg font-bold text-white">{value}</div>
      <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</div>
    </div>
  );
}

export type { YearGrade };

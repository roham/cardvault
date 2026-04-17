'use client';

import { useEffect, useMemo, useState } from 'react';
import { almanacMonths, VIBE_STYLE, SPEND_STYLE, type AlmanacMonth, type MonthVibe } from '@/data/hobby-almanac';

type SectionTab = 'all' | 'releases' | 'events' | 'storylines' | 'advice';
type SportFilter = 'ALL' | 'MLB' | 'NBA' | 'NFL' | 'NHL' | 'Multi' | 'Pokemon';

const BOOKMARK_KEY = 'cv_hobby_almanac_bookmarks_v1';
const NOTES_KEY = 'cv_hobby_almanac_notes_v1';

function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}

export default function HobbyAlmanacClient() {
  const [monthFilter, setMonthFilter] = useState<number | 'ALL'>('ALL');
  const [sportFilter, setSportFilter] = useState<SportFilter>('ALL');
  const [vibeFilter, setVibeFilter] = useState<MonthVibe | 'ALL'>('ALL');
  const [sectionTab, setSectionTab] = useState<SectionTab>('all');
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState<number | null>(null);

  useEffect(() => {
    setCurrentMonth(getCurrentMonth());
    try {
      const rawBookmarks = localStorage.getItem(BOOKMARK_KEY);
      if (rawBookmarks) {
        const arr = JSON.parse(rawBookmarks) as number[];
        if (Array.isArray(arr)) setBookmarks(new Set(arr));
      }
      const rawNotes = localStorage.getItem(NOTES_KEY);
      if (rawNotes) setNotes(JSON.parse(rawNotes));
    } catch {}
  }, []);

  const toggleBookmark = (month: number) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(month)) next.delete(month);
      else next.add(month);
      try {
        localStorage.setItem(BOOKMARK_KEY, JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  const saveNote = (month: number, value: string) => {
    setNotes((prev) => {
      const next = { ...prev };
      if (value.trim() === '') delete next[month];
      else next[month] = value;
      try {
        localStorage.setItem(NOTES_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const filtered = useMemo(() => {
    let out = almanacMonths;
    if (monthFilter !== 'ALL') out = out.filter((m) => m.month === monthFilter);
    if (vibeFilter !== 'ALL') out = out.filter((m) => m.vibe === vibeFilter);
    if (sportFilter !== 'ALL') {
      out = out.filter(
        (m) =>
          m.releases.some((r) => r.sport === sportFilter) ||
          m.storylines.some((s) => s.sport === sportFilter)
      );
    }
    return out;
  }, [monthFilter, vibeFilter, sportFilter]);

  const totals = useMemo(() => {
    const releases = almanacMonths.reduce((a, m) => a + m.releases.length, 0);
    const events = almanacMonths.reduce((a, m) => a + m.events.length, 0);
    const storylines = almanacMonths.reduce((a, m) => a + m.storylines.length, 0);
    const peakMonths = almanacMonths.filter((m) => m.vibe === 'PEAK').length;
    return { releases, events, storylines, peakMonths };
  }, []);

  const copyMonth = async (m: AlmanacMonth) => {
    const lines = [
      `${m.emoji} ${m.name} — ${m.theme}`,
      `Vibe: ${m.vibe} · ${SPEND_STYLE[m.spend].label}`,
      '',
      `Tagline: ${m.tagline}`,
      '',
      'RELEASES:',
      ...m.releases.map((r) => `  • [${r.sport}] ${r.label}: ${r.detail}`),
      '',
      'EVENTS:',
      ...m.events.map((e) => `  • ${e.label}${e.location ? ` (${e.location})` : ''}: ${e.detail}`),
      '',
      'STORYLINES:',
      ...m.storylines.map((s) => `  • [${s.sport}] ${s.label}: ${s.detail}`),
      '',
      `BUY: ${m.buyAdvice}`,
      `SELL: ${m.sellAdvice}`,
      '',
      'via CardVault · The Hobby Almanac',
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopiedId(m.month);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {}
  };

  const sportChips: SportFilter[] = ['ALL', 'MLB', 'NBA', 'NFL', 'NHL', 'Multi', 'Pokemon'];
  const vibeChips: (MonthVibe | 'ALL')[] = ['ALL', 'PEAK', 'HOT', 'STEADY', 'BUILD', 'COLD'];
  const sectionChips: SectionTab[] = ['all', 'releases', 'events', 'storylines', 'advice'];

  return (
    <div>
      {/* Stats strip */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Stat label="Months" value={String(almanacMonths.length)} />
        <Stat label="Releases" value={String(totals.releases)} />
        <Stat label="Major events" value={String(totals.events)} />
        <Stat label="PEAK months" value={String(totals.peakMonths)} />
      </div>

      {/* Month selector strip */}
      <div className="mb-6">
        <div className="text-xs font-semibold text-gray-400 mb-2">Jump to month</div>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-1.5">
          <button
            onClick={() => setMonthFilter('ALL')}
            className={`px-2 py-1.5 rounded border text-xs font-medium transition ${
              monthFilter === 'ALL'
                ? 'bg-orange-600 border-orange-500 text-white'
                : 'bg-gray-800/60 border-gray-700 text-gray-300 hover:border-orange-700'
            }`}
          >
            All
          </button>
          {almanacMonths.map((m) => (
            <button
              key={m.month}
              onClick={() => setMonthFilter(m.month)}
              className={`px-2 py-1.5 rounded border text-xs font-medium transition relative ${
                monthFilter === m.month
                  ? 'bg-orange-600 border-orange-500 text-white'
                  : 'bg-gray-800/60 border-gray-700 text-gray-300 hover:border-orange-700'
              }`}
            >
              <span>{m.emoji}</span>
              <span className="ml-1">{m.name.slice(0, 3)}</span>
              {currentMonth === m.month && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Filter rail */}
      <div className="mb-6 space-y-3">
        <FilterRow
          label="Vibe"
          chips={vibeChips.map((v) => ({ key: v, label: v === 'ALL' ? 'All' : v }))}
          activeKey={vibeFilter}
          onPick={(k) => setVibeFilter(k as MonthVibe | 'ALL')}
        />
        <FilterRow
          label="Sport focus"
          chips={sportChips.map((s) => ({ key: s, label: s === 'ALL' ? 'All' : s }))}
          activeKey={sportFilter}
          onPick={(k) => setSportFilter(k as SportFilter)}
        />
        <FilterRow
          label="Section"
          chips={sectionChips.map((s) => ({
            key: s,
            label: s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1),
          }))}
          activeKey={sectionTab}
          onPick={(k) => setSectionTab(k as SectionTab)}
        />
      </div>

      {/* Bookmarks strip */}
      {bookmarks.size > 0 && (
        <div className="mb-6 bg-amber-950/40 border border-amber-800/40 rounded-lg p-4">
          <div className="text-xs font-semibold text-amber-300 mb-2">
            Your bookmarked months ({bookmarks.size})
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from(bookmarks)
              .sort((a, b) => a - b)
              .map((monthNum) => {
                const m = almanacMonths.find((x) => x.month === monthNum);
                if (!m) return null;
                return (
                  <button
                    key={monthNum}
                    onClick={() => setMonthFilter(monthNum)}
                    className="inline-flex items-center gap-1 bg-amber-900/40 border border-amber-700/40 text-amber-200 text-xs px-2.5 py-1 rounded hover:bg-amber-800/40"
                  >
                    <span>{m.emoji}</span>
                    <span>{m.name}</span>
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* Month cards */}
      <div className="space-y-5">
        {filtered.map((m) => {
          const vibe = VIBE_STYLE[m.vibe];
          const spend = SPEND_STYLE[m.spend];
          const isBookmarked = bookmarks.has(m.month);
          const isCurrent = currentMonth === m.month;

          const filteredReleases = sportFilter === 'ALL' ? m.releases : m.releases.filter((r) => r.sport === sportFilter);
          const filteredStorylines =
            sportFilter === 'ALL' ? m.storylines : m.storylines.filter((s) => s.sport === sportFilter);

          return (
            <div
              key={m.month}
              className={`bg-gray-900/40 border ${vibe.border} rounded-xl p-5 ${
                isCurrent ? 'ring-2 ring-emerald-500/40' : ''
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-3xl">{m.emoji}</span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                      {m.name}
                    </h2>
                    {isCurrent && (
                      <span className="inline-flex items-center gap-1 bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 text-xs px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        This month
                      </span>
                    )}
                  </div>
                  <div className="text-orange-300 font-medium text-sm">{m.theme}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 ${vibe.bg} border ${vibe.border} ${vibe.text} text-xs font-semibold px-2.5 py-1 rounded-full`}
                  >
                    {vibe.label}
                  </span>
                  <span className={`text-xs font-medium ${spend.color}`}>{spend.label}</span>
                  <button
                    onClick={() => toggleBookmark(m.month)}
                    className={`ml-1 w-8 h-8 flex items-center justify-center rounded-full border transition ${
                      isBookmarked
                        ? 'bg-amber-900/60 border-amber-600 text-amber-300'
                        : 'bg-gray-800/40 border-gray-700 text-gray-500 hover:text-amber-300'
                    }`}
                    aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark month'}
                    title={isBookmarked ? 'Remove bookmark' : 'Bookmark this month'}
                  >
                    {isBookmarked ? '★' : '☆'}
                  </button>
                </div>
              </div>

              <p className="text-gray-300 text-sm leading-relaxed mb-4">{m.tagline}</p>

              {(sectionTab === 'all' || sectionTab === 'releases') && filteredReleases.length > 0 && (
                <Section title="Product releases">
                  <div className="space-y-2">
                    {filteredReleases.map((r, i) => (
                      <div key={i} className="bg-gray-800/40 border border-gray-700/40 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-sky-900/50 border border-sky-700/40 text-sky-300 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                            {r.sport}
                          </span>
                          <span className="text-white font-medium text-sm">{r.label}</span>
                        </div>
                        <p className="text-gray-400 text-xs leading-relaxed">{r.detail}</p>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {(sectionTab === 'all' || sectionTab === 'events') && m.events.length > 0 && (
                <Section title="Major events">
                  <div className="space-y-2">
                    {m.events.map((e, i) => (
                      <div key={i} className="bg-gray-800/40 border border-gray-700/40 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium text-sm">{e.label}</span>
                          {e.location && (
                            <span className="text-[10px] text-gray-500 italic">{e.location}</span>
                          )}
                        </div>
                        <p className="text-gray-400 text-xs leading-relaxed">{e.detail}</p>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {(sectionTab === 'all' || sectionTab === 'storylines') && filteredStorylines.length > 0 && (
                <Section title="Watch storylines">
                  <div className="space-y-2">
                    {filteredStorylines.map((s, i) => (
                      <div key={i} className="bg-gray-800/40 border border-gray-700/40 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-violet-900/50 border border-violet-700/40 text-violet-300 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                            {s.sport}
                          </span>
                          <span className="text-white font-medium text-sm">{s.label}</span>
                        </div>
                        <p className="text-gray-400 text-xs leading-relaxed">{s.detail}</p>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {(sectionTab === 'all' || sectionTab === 'advice') && (
                <Section title="Buy / Sell timing">
                  <div className="grid sm:grid-cols-2 gap-2">
                    <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-lg p-3">
                      <div className="text-[10px] font-semibold text-emerald-300 mb-1">BUY</div>
                      <p className="text-gray-300 text-xs leading-relaxed">{m.buyAdvice}</p>
                    </div>
                    <div className="bg-rose-950/40 border border-rose-800/40 rounded-lg p-3">
                      <div className="text-[10px] font-semibold text-rose-300 mb-1">SELL</div>
                      <p className="text-gray-300 text-xs leading-relaxed">{m.sellAdvice}</p>
                    </div>
                  </div>
                </Section>
              )}

              {sectionTab === 'all' && m.historical.length > 0 && (
                <Section title="Historical notes">
                  <div className="space-y-1.5">
                    {m.historical.map((h, i) => (
                      <div key={i} className="text-xs text-gray-400 leading-relaxed">
                        <span className="text-orange-300 font-semibold">{h.year}:</span> {h.note}
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              <details className="mt-4 group">
                <summary className="cursor-pointer text-xs font-semibold text-gray-400 hover:text-white">
                  My notes for {m.name}
                </summary>
                <textarea
                  value={notes[m.month] || ''}
                  onChange={(e) => saveNote(m.month, e.target.value)}
                  placeholder={`What were you buying / selling / chasing in ${m.name}?`}
                  className="mt-2 w-full bg-gray-800/40 border border-gray-700 rounded p-2 text-sm text-gray-200 placeholder-gray-600 min-h-[60px]"
                />
              </details>

              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => copyMonth(m)}
                  className="text-xs bg-gray-800/60 border border-gray-700 text-gray-300 px-3 py-1.5 rounded hover:bg-gray-700/60"
                >
                  {copiedId === m.month ? 'Copied ✓' : 'Copy month summary'}
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-6 text-center text-gray-400 text-sm">
            No months match the current filters. Reset filters to see all 12 months.
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-900/40 border border-gray-800 rounded p-3">
      <div className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</div>
      <div className="text-xl font-bold text-white">{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{title}</div>
      {children}
    </div>
  );
}

function FilterRow({
  label,
  chips,
  activeKey,
  onPick,
}: {
  label: string;
  chips: { key: string; label: string }[];
  activeKey: string;
  onPick: (k: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-20">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {chips.map((c) => (
          <button
            key={c.key}
            onClick={() => onPick(c.key)}
            className={`px-2.5 py-1 rounded border text-xs font-medium transition ${
              activeKey === c.key
                ? 'bg-orange-600 border-orange-500 text-white'
                : 'bg-gray-800/60 border-gray-700 text-gray-300 hover:border-orange-700'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CelebrityCollector, CollectorCategory } from '@/data/celebrity-collectors';
import { celebrityCollectors } from '@/data/celebrity-collectors';

type SortMode = 'influence' | 'name' | 'category';

const CATEGORY_LABEL: Record<CollectorCategory, string> = {
  ATHLETE: 'Athletes',
  ENTERTAINMENT: 'Entertainment',
  MEDIA: 'Media',
  BUSINESS: 'Business',
  TECH: 'Tech',
};

const CATEGORY_ORDER: CollectorCategory[] = ['ATHLETE', 'ENTERTAINMENT', 'MEDIA', 'BUSINESS', 'TECH'];

const ACCENT_MAP: Record<string, { border: string; bg: string; text: string; ring: string }> = {
  pink:     { border: 'border-pink-700/40',    bg: 'bg-pink-950/30',    text: 'text-pink-300',    ring: 'ring-pink-500/30' },
  fuchsia:  { border: 'border-fuchsia-700/40', bg: 'bg-fuchsia-950/30', text: 'text-fuchsia-300', ring: 'ring-fuchsia-500/30' },
  rose:     { border: 'border-rose-700/40',    bg: 'bg-rose-950/30',    text: 'text-rose-300',    ring: 'ring-rose-500/30' },
  amber:    { border: 'border-amber-700/40',   bg: 'bg-amber-950/30',   text: 'text-amber-300',   ring: 'ring-amber-500/30' },
  sky:      { border: 'border-sky-700/40',     bg: 'bg-sky-950/30',     text: 'text-sky-300',     ring: 'ring-sky-500/30' },
  emerald:  { border: 'border-emerald-700/40', bg: 'bg-emerald-950/30', text: 'text-emerald-300', ring: 'ring-emerald-500/30' },
  violet:   { border: 'border-violet-700/40',  bg: 'bg-violet-950/30',  text: 'text-violet-300',  ring: 'ring-violet-500/30' },
  orange:   { border: 'border-orange-700/40',  bg: 'bg-orange-950/30',  text: 'text-orange-300',  ring: 'ring-orange-500/30' },
};

const STORAGE_KEY = 'cv_celebrity_collectors_votes_v1';
const FAVORITE_KEY = 'cv_celebrity_collectors_fav_v1';

type VoteMap = Record<string, 'up' | 'down' | null>;

export default function CelebrityCollectorsClient() {
  const [category, setCategory] = useState<'ALL' | CollectorCategory>('ALL');
  const [sortMode, setSortMode] = useState<SortMode>('influence');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [votes, setVotes] = useState<VoteMap>({});
  const [favorite, setFavorite] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const rawVotes = localStorage.getItem(STORAGE_KEY);
      if (rawVotes) setVotes(JSON.parse(rawVotes));
      const rawFav = localStorage.getItem(FAVORITE_KEY);
      if (rawFav) setFavorite(rawFav);
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));
    } catch {}
  }, [votes, ready]);

  useEffect(() => {
    if (!ready) return;
    try {
      if (favorite) localStorage.setItem(FAVORITE_KEY, favorite);
      else localStorage.removeItem(FAVORITE_KEY);
    } catch {}
  }, [favorite, ready]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = celebrityCollectors.filter(c => {
      if (category !== 'ALL' && c.category !== category) return false;
      if (q) {
        const hit =
          c.name.toLowerCase().includes(q) ||
          c.profession.toLowerCase().includes(q) ||
          c.focus.some(f => f.toLowerCase().includes(q)) ||
          c.signaturePiece.toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sortMode === 'influence') return b.hobbyInfluence - a.hobbyInfluence;
      if (sortMode === 'name') return a.name.localeCompare(b.name);
      if (sortMode === 'category') return CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
      return 0;
    });
    return list;
  }, [category, sortMode, query]);

  const voteFor = (slug: string, dir: 'up' | 'down') => {
    setVotes(prev => ({
      ...prev,
      [slug]: prev[slug] === dir ? null : dir,
    }));
  };

  const voteCount = useMemo(() => {
    const up = Object.values(votes).filter(v => v === 'up').length;
    const down = Object.values(votes).filter(v => v === 'down').length;
    return { up, down };
  }, [votes]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: celebrityCollectors.length };
    for (const cat of CATEGORY_ORDER) counts[cat] = celebrityCollectors.filter(c => c.category === cat).length;
    return counts;
  }, []);

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCategory('ALL')}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              category === 'ALL'
                ? 'border-pink-500/50 bg-pink-500/10 text-pink-200'
                : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            All <span className="ml-1 text-[10px] opacity-70">{categoryCounts.ALL}</span>
          </button>
          {CATEGORY_ORDER.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                category === cat
                  ? 'border-pink-500/50 bg-pink-500/10 text-pink-200'
                  : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {CATEGORY_LABEL[cat]} <span className="ml-1 text-[10px] opacity-70">{categoryCounts[cat]}</span>
            </button>
          ))}
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name, focus, signature piece…"
            className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-pink-500/50 focus:outline-none"
          />
          <div className="flex flex-wrap items-center gap-1.5">
            <SortBtn current={sortMode} mode="influence" onClick={() => setSortMode('influence')}>Influence</SortBtn>
            <SortBtn current={sortMode} mode="name" onClick={() => setSortMode('name')}>Name A–Z</SortBtn>
            <SortBtn current={sortMode} mode="category" onClick={() => setSortMode('category')}>Category</SortBtn>
          </div>
        </div>

        {ready && (voteCount.up > 0 || voteCount.down > 0) && (
          <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
            <span>You&apos;ve rated {voteCount.up + voteCount.down} collectors:</span>
            <span className="text-emerald-400">👍 {voteCount.up} legit</span>
            <span className="text-rose-400">👎 {voteCount.down} overrated</span>
            {favorite && <span className="text-pink-400">★ fav: {celebrityCollectors.find(c => c.slug === favorite)?.name}</span>}
          </div>
        )}
      </div>

      <div className="text-xs text-slate-500">
        Showing {filtered.length} of {celebrityCollectors.length} collectors.
      </div>

      <div className="grid gap-3">
        {filtered.map(c => {
          const accent = ACCENT_MAP[c.accent] || ACCENT_MAP.pink;
          const isExpanded = expanded === c.slug;
          const vote = votes[c.slug] ?? null;
          const isFav = favorite === c.slug;
          return (
            <article
              key={c.slug}
              className={`rounded-2xl border ${accent.border} ${accent.bg} p-4 sm:p-5 transition-all ${isFav ? `ring-2 ${accent.ring}` : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-serif text-lg font-bold text-slate-100 sm:text-xl">
                      {c.name}
                      {isFav && <span className="ml-2 text-pink-400">★</span>}
                    </h3>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${accent.border} ${accent.text}`}>
                      {CATEGORY_LABEL[c.category]}
                    </span>
                    <InfluenceBar score={c.hobbyInfluence} />
                  </div>
                  <div className="mt-0.5 text-xs text-slate-400">{c.profession} · Collecting since {c.collectingSince}</div>
                </div>
                <button
                  onClick={() => setFavorite(isFav ? null : c.slug)}
                  className={`rounded-full border px-2 py-1 text-xs transition-colors ${
                    isFav
                      ? 'border-pink-500/50 bg-pink-500/20 text-pink-200'
                      : 'border-slate-800 bg-slate-900/40 text-slate-500 hover:text-pink-400'
                  }`}
                  aria-label={isFav ? 'Remove favorite' : 'Mark as favorite'}
                >
                  {isFav ? '★ Fav' : '☆ Fav'}
                </button>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
                <div>
                  <div className="text-sm text-slate-300 leading-relaxed">{c.bio}</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {c.focus.map(f => (
                      <span key={f} className="rounded-full border border-slate-800 bg-slate-900/60 px-2 py-0.5 text-[10px] text-slate-400">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={`rounded-xl border ${accent.border} bg-slate-950/40 px-3 py-2 min-w-[180px]`}>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Signature Piece</div>
                  <div className={`mt-0.5 text-sm font-medium ${accent.text}`}>{c.signaturePiece}</div>
                  <div className="mt-2 text-[10px] uppercase tracking-wider text-slate-500">Est. Collection</div>
                  <div className="mt-0.5 text-sm text-slate-300">{c.estimatedCollectionSize}</div>
                </div>
              </div>

              <blockquote className="mt-3 border-l-2 border-slate-700 pl-3 text-sm italic text-slate-400">
                {c.famousQuote}
              </blockquote>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setExpanded(isExpanded ? null : c.slug)}
                  className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300 hover:border-slate-700 hover:text-slate-100"
                >
                  {isExpanded ? '− Collapse' : '+ Notable purchases & impact'}
                </button>
                <div className="ml-auto flex items-center gap-1.5">
                  <button
                    onClick={() => voteFor(c.slug, 'up')}
                    className={`rounded-lg border px-2.5 py-1 text-xs transition-colors ${
                      vote === 'up'
                        ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-200'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-emerald-700/50 hover:text-emerald-300'
                    }`}
                  >
                    👍 Legit
                  </button>
                  <button
                    onClick={() => voteFor(c.slug, 'down')}
                    className={`rounded-lg border px-2.5 py-1 text-xs transition-colors ${
                      vote === 'down'
                        ? 'border-rose-500/50 bg-rose-500/20 text-rose-200'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-rose-700/50 hover:text-rose-300'
                    }`}
                  >
                    👎 Overrated
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-3 space-y-3 border-t border-slate-800 pt-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">Notable Purchases</div>
                    <ul className="mt-1 space-y-1">
                      {c.notablePurchases.map((p, i) => (
                        <li key={i} className="text-sm text-slate-300 flex gap-2">
                          <span className={accent.text}>•</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">Hobby Impact</div>
                    <p className="mt-1 text-sm text-slate-300 leading-relaxed">{c.hobbyImpact}</p>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-10 text-center">
          <p className="text-sm text-slate-400">No collectors match your filters.</p>
          <button
            onClick={() => { setCategory('ALL'); setQuery(''); }}
            className="mt-3 rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-1.5 text-xs text-slate-300 hover:text-slate-100"
          >
            Reset filters
          </button>
        </div>
      )}
    </section>
  );
}

function SortBtn({ current, mode, onClick, children }: { current: SortMode; mode: SortMode; onClick: () => void; children: React.ReactNode }) {
  const active = current === mode;
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
        active
          ? 'border-pink-500/50 bg-pink-500/10 text-pink-200'
          : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
      }`}
    >
      {children}
    </button>
  );
}

function InfluenceBar({ score }: { score: number }) {
  const cells = Array.from({ length: 10 }, (_, i) => i < score);
  return (
    <div className="flex items-center gap-0.5" aria-label={`Hobby influence: ${score} of 10`}>
      {cells.map((filled, i) => (
        <span
          key={i}
          className={`h-1.5 w-2 rounded-sm ${filled ? (score >= 9 ? 'bg-pink-400' : score >= 7 ? 'bg-pink-500/70' : 'bg-pink-500/40') : 'bg-slate-800'}`}
        />
      ))}
      <span className="ml-1 text-[10px] font-semibold text-pink-300">{score}/10</span>
    </div>
  );
}

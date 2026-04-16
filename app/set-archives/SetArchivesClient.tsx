'use client';

import { useEffect, useMemo, useState } from 'react';
import { greatestSets, type GreatestSet, type SetTier, type SetSport, type SetEra } from '@/data/greatest-sets';

type SortMode = 'tier' | 'era' | 'rating' | 'alpha';

const TIERS: SetTier[] = ['LEGENDARY', 'ICONIC', 'CLASSIC', 'NOTABLE'];
const SPORTS: SetSport[] = ['MLB', 'NBA', 'NFL', 'NHL'];
const ERAS: SetEra[] = ['Pre-War', 'Vintage', 'Junk Wax', 'Premium', 'Modern'];

const TIER_STYLE: Record<SetTier, { label: string; badge: string; ring: string; bg: string }> = {
  LEGENDARY: {
    label: 'Legendary',
    badge: 'bg-gradient-to-r from-amber-400 to-amber-600 text-amber-950',
    ring: 'ring-amber-500/40',
    bg: 'from-amber-950/30 to-transparent',
  },
  ICONIC: {
    label: 'Iconic',
    badge: 'bg-gradient-to-r from-purple-400 to-purple-600 text-purple-950',
    ring: 'ring-purple-500/40',
    bg: 'from-purple-950/30 to-transparent',
  },
  CLASSIC: {
    label: 'Classic',
    badge: 'bg-gradient-to-r from-sky-400 to-sky-600 text-sky-950',
    ring: 'ring-sky-500/40',
    bg: 'from-sky-950/30 to-transparent',
  },
  NOTABLE: {
    label: 'Notable',
    badge: 'bg-slate-600 text-slate-100',
    ring: 'ring-slate-500/40',
    bg: 'from-slate-900/30 to-transparent',
  },
};

const SPORT_COLOR: Record<SetSport, string> = {
  MLB: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/5',
  NBA: 'text-orange-300 border-orange-500/40 bg-orange-500/5',
  NFL: 'text-red-300 border-red-500/40 bg-red-500/5',
  NHL: 'text-cyan-300 border-cyan-500/40 bg-cyan-500/5',
  Multi: 'text-slate-300 border-slate-500/40 bg-slate-500/5',
};

const VOTE_KEY = 'cv_set_archives_votes_v1';

export default function SetArchivesClient() {
  const [sportFilter, setSportFilter] = useState<SetSport | 'ALL'>('ALL');
  const [eraFilter, setEraFilter] = useState<SetEra | 'ALL'>('ALL');
  const [tierFilter, setTierFilter] = useState<SetTier | 'ALL'>('ALL');
  const [sortMode, setSortMode] = useState<SortMode>('tier');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, 'agree' | 'disagree'>>({});
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(VOTE_KEY);
      if (raw) setVotes(JSON.parse(raw));
    } catch {}
  }, []);

  const persistVote = (id: string, vote: 'agree' | 'disagree') => {
    setVotes(prev => {
      const next = { ...prev };
      if (next[id] === vote) delete next[id];
      else next[id] = vote;
      try {
        localStorage.setItem(VOTE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const filtered = useMemo(() => {
    let rows = greatestSets.slice();
    if (sportFilter !== 'ALL') rows = rows.filter(s => s.sport === sportFilter);
    if (eraFilter !== 'ALL') rows = rows.filter(s => s.era === eraFilter);
    if (tierFilter !== 'ALL') rows = rows.filter(s => s.tier === tierFilter);
    switch (sortMode) {
      case 'tier': {
        const tierRank = (t: SetTier) => TIERS.indexOf(t);
        rows.sort((a, b) => tierRank(a.tier) - tierRank(b.tier) || b.rating - a.rating || a.year.localeCompare(b.year));
        break;
      }
      case 'era': {
        const eraRank = (e: SetEra) => ERAS.indexOf(e);
        rows.sort((a, b) => eraRank(a.era) - eraRank(b.era) || a.year.localeCompare(b.year));
        break;
      }
      case 'rating':
        rows.sort((a, b) => b.rating - a.rating || a.year.localeCompare(b.year));
        break;
      case 'alpha':
        rows.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    return rows;
  }, [sportFilter, eraFilter, tierFilter, sortMode]);

  const agreeCount = Object.values(votes).filter(v => v === 'agree').length;
  const disagreeCount = Object.values(votes).filter(v => v === 'disagree').length;

  const copySummary = async (set: GreatestSet) => {
    const text = `${set.year} ${set.name} (${set.sport}) — ${TIER_STYLE[set.tier].label} tier\nKey cards: ${set.keyCards.join(', ')}\n${set.significance}\nvia CardVault Set Archives`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(set.id);
      setTimeout(() => setCopied(null), 1800);
    } catch {}
  };

  // Group by tier when sorted by tier for visual tier blocks
  const groupedByTier: Record<SetTier, GreatestSet[]> = {
    LEGENDARY: [],
    ICONIC: [],
    CLASSIC: [],
    NOTABLE: [],
  };
  if (sortMode === 'tier') {
    for (const s of filtered) groupedByTier[s.tier].push(s);
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 sm:p-5">
        <div className="flex flex-wrap items-start gap-4">
          <FilterGroup
            label="Sport"
            options={['ALL', ...SPORTS]}
            value={sportFilter}
            onChange={(v) => setSportFilter(v as SetSport | 'ALL')}
          />
          <FilterGroup
            label="Era"
            options={['ALL', ...ERAS]}
            value={eraFilter}
            onChange={(v) => setEraFilter(v as SetEra | 'ALL')}
          />
          <FilterGroup
            label="Tier"
            options={['ALL', ...TIERS]}
            value={tierFilter}
            onChange={(v) => setTierFilter(v as SetTier | 'ALL')}
          />
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Sort</span>
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 hover:border-purple-500/40 focus:border-purple-500/60 focus:outline-none"
            >
              <option value="tier">By tier</option>
              <option value="era">By era (chronological)</option>
              <option value="rating">By rating</option>
              <option value="alpha">Alphabetical</option>
            </select>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-3 text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-200">{filtered.length}</span> of {greatestSets.length} sets
          </div>
          <div className="flex items-center gap-3">
            <span className="text-emerald-300">👍 {agreeCount}</span>
            <span className="text-rose-300">👎 {disagreeCount}</span>
            {Object.keys(votes).length > 0 && (
              <button
                onClick={() => {
                  setVotes({});
                  try { localStorage.removeItem(VOTE_KEY); } catch {}
                }}
                className="rounded-md border border-slate-700 px-2 py-0.5 text-[11px] text-slate-400 hover:border-rose-500/40 hover:text-rose-300"
              >
                Reset votes
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tier-grouped rendering when sorted by tier */}
      {sortMode === 'tier' ? (
        <div className="space-y-8">
          {TIERS.map((tier) =>
            groupedByTier[tier].length > 0 ? (
              <section key={tier}>
                <div className="mb-3 flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${TIER_STYLE[tier].badge}`}>
                    {TIER_STYLE[tier].label}
                  </span>
                  <span className="text-xs text-slate-500">{groupedByTier[tier].length} sets</span>
                  <div className="h-px flex-1 bg-slate-800" />
                </div>
                <div className="space-y-3">
                  {groupedByTier[tier].map((s) => (
                    <SetCard
                      key={s.id}
                      set={s}
                      expanded={expandedId === s.id}
                      onToggle={() => setExpandedId(expandedId === s.id ? null : s.id)}
                      vote={votes[s.id]}
                      onVote={(v) => persistVote(s.id, v)}
                      copied={copied === s.id}
                      onCopy={() => copySummary(s)}
                    />
                  ))}
                </div>
              </section>
            ) : null
          )}
          {filtered.length === 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center text-sm text-slate-500">
              No sets match the current filters. Try loosening one.
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => (
            <SetCard
              key={s.id}
              set={s}
              expanded={expandedId === s.id}
              onToggle={() => setExpandedId(expandedId === s.id ? null : s.id)}
              vote={votes[s.id]}
              onVote={(v) => persistVote(s.id, v)}
              copied={copied === s.id}
              onCopy={() => copySummary(s)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center text-sm text-slate-500">
              No sets match the current filters. Try loosening one.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
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
                ? 'border-purple-500/60 bg-purple-500/15 text-purple-200'
                : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-600 hover:text-slate-200'
            }`}
          >
            {opt === 'ALL' ? 'All' : opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function SetCard({
  set,
  expanded,
  onToggle,
  vote,
  onVote,
  copied,
  onCopy,
}: {
  set: GreatestSet;
  expanded: boolean;
  onToggle: () => void;
  vote?: 'agree' | 'disagree';
  onVote: (v: 'agree' | 'disagree') => void;
  copied: boolean;
  onCopy: () => void;
}) {
  const style = TIER_STYLE[set.tier];
  return (
    <article
      className={`group rounded-2xl border border-slate-800 bg-gradient-to-br ${style.bg} p-4 transition hover:ring-1 ${style.ring} sm:p-5`}
    >
      <button onClick={onToggle} className="flex w-full items-start justify-between gap-3 text-left">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${style.badge}`}>
              {style.label}
            </span>
            <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${SPORT_COLOR[set.sport]}`}>
              {set.sport}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-slate-500">{set.era}</span>
            <span className="text-[11px] text-amber-400" aria-label={`${set.rating} out of 5`}>
              {'★'.repeat(set.rating)}
              <span className="text-slate-700">{'★'.repeat(5 - set.rating)}</span>
            </span>
          </div>
          <h3 className="mt-2 font-serif text-xl font-bold text-white sm:text-2xl">
            <span className="text-purple-300">{set.year}</span> {set.name}
          </h3>
          <p className="mt-1 text-sm text-slate-400">{set.design}</p>
        </div>
        <svg
          className={`mt-2 h-5 w-5 flex-shrink-0 text-slate-500 transition ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-4 space-y-4 border-t border-slate-800 pt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoBlock label="Publisher" value={set.publisher} />
            <InfoBlock label="Checklist size" value={`${set.checklistSize} cards`} />
            <InfoBlock label="Sealed box value" value={set.boxValue} />
          </div>

          <div>
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Key cards</div>
            <ul className="flex flex-wrap gap-1.5">
              {set.keyCards.map((card) => (
                <li
                  key={card}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200"
                >
                  {card}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Why it matters</div>
            <p className="text-sm text-slate-300 leading-relaxed">{set.significance}</p>
          </div>

          <div className="rounded-lg border border-amber-900/40 bg-amber-950/20 p-3 text-xs text-amber-200">
            <span className="font-semibold uppercase tracking-wider text-amber-400">Trivia ·</span>{' '}
            {set.trivia}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">Agree with tier?</span>
              <button
                onClick={() => onVote('agree')}
                className={`rounded-md border px-2 py-1 text-[11px] font-semibold transition ${
                  vote === 'agree'
                    ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300'
                    : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-emerald-500/40 hover:text-emerald-300'
                }`}
              >
                👍 Yes
              </button>
              <button
                onClick={() => onVote('disagree')}
                className={`rounded-md border px-2 py-1 text-[11px] font-semibold transition ${
                  vote === 'disagree'
                    ? 'border-rose-500/60 bg-rose-500/15 text-rose-300'
                    : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-rose-500/40 hover:text-rose-300'
                }`}
              >
                👎 No
              </button>
            </div>
            <button
              onClick={onCopy}
              className="rounded-md border border-slate-700 bg-slate-950 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:border-purple-500/40 hover:text-purple-300"
            >
              {copied ? '✓ Copied' : 'Copy summary'}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-2.5">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-0.5 text-sm text-slate-200">{value}</div>
    </div>
  );
}

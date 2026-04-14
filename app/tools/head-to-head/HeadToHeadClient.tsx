'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards, SportsCard } from '@/data/sports-cards';

// ─── Constants ──────────────────────────────────────────────────────

const VOTE_KEY = 'cardvault-h2h-votes';

const sportIcons: Record<string, string> = {
  baseball: '⚾',
  basketball: '🏀',
  football: '🏈',
  hockey: '🏒',
};

const QUICK_MATCHUPS: [string, string][] = [
  ['1986-87-fleer-michael-jordan-57', '1952-topps-mickey-mantle-311'],
  ['2009-bowman-chrome-mike-trout-bdpp89', '2023-24-panini-prizm-victor-wembanyama-301'],
  ['2003-04-topps-chrome-lebron-james-111', '1996-97-topps-chrome-kobe-bryant-138'],
  ['2000-playoff-contenders-tom-brady-144', '2017-national-treasures-patrick-mahomes-auto'],
  ['1979-80-o-pee-chee-wayne-gretzky-18', '2005-06-upper-deck-young-guns-sidney-crosby-201'],
];

// ─── Price Parsing ──────────────────────────────────────────────────

function parseMidValue(val: string): number {
  const matches = val.match(/\$([\d,]+)/g);
  if (!matches || matches.length === 0) return 0;
  const nums = matches.map(m => parseInt(m.replace(/[$,]/g, ''), 10));
  if (nums.length === 1) return nums[0];
  return Math.round((nums[0] + nums[1]) / 2);
}

function formatCurrency(n: number): string {
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(2) + 'M';
  if (n >= 10000) return '$' + (n / 1000).toFixed(1) + 'K';
  if (n >= 1000) return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (n >= 1) return '$' + n.toFixed(2);
  return '$' + n.toFixed(2);
}

// ─── Deterministic Hash ─────────────────────────────────────────────

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

// ─── Price Simulation ───────────────────────────────────────────────

function generatePriceHistory(slug: string, basePrice: number): number[] {
  const prices: number[] = [];
  const slugHash = simpleHash(slug);
  const trendBias = ((slugHash % 100) - 40) / 1000;
  let cumulative = 0;

  for (let day = 0; day < 90; day++) {
    const dayStr = slug + ':' + day;
    const dayHash = simpleHash(dayStr);
    const dailyVariation = ((dayHash % 200) - 100) / 1000;
    cumulative += dailyVariation * 0.3 + trendBias * 0.05;
    cumulative = Math.max(-0.4, Math.min(0.6, cumulative));
    const price = basePrice * (1 + cumulative);
    prices.push(Math.round(price * 100) / 100);
  }

  return prices;
}

// ─── Mini Sparkline ─────────────────────────────────────────────────

function Sparkline({ prices, color }: { prices: number[]; color: string }) {
  const last30 = prices.slice(-30);
  const min = Math.min(...last30);
  const max = Math.max(...last30);
  const range = max - min || max * 0.01 || 1;
  const w = 200;
  const h = 50;
  const pad = 2;
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;

  const points = last30.map((p, i) => {
    const x = pad + (i / (last30.length - 1)) * innerW;
    const y = pad + innerH - ((p - min) / range) * innerH;
    return `${x},${y}`;
  }).join(' ');

  const fillPoints = [
    ...last30.map((p, i) => {
      const x = pad + (i / (last30.length - 1)) * innerW;
      const y = pad + innerH - ((p - min) / range) * innerH;
      return `${x},${y}`;
    }),
    `${pad + innerW},${pad + innerH}`,
    `${pad},${pad + innerH}`,
  ].join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-12">
      <defs>
        <linearGradient id={`sparkFill-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fillPoints} fill={`url(#sparkFill-${color})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Card Search Component ──────────────────────────────────────────

function CardSearch({ onSelect, excludeSlug, label }: {
  onSelect: (card: SportsCard) => void;
  excludeSlug: string | null;
  label: string;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return sportsCards
      .filter(c => excludeSlug !== c.slug)
      .filter(c => c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q))
      .slice(0, 6);
  }, [query, excludeSlug]);

  return (
    <div className="relative">
      <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Search by player or card name..."
        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent"
      />
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-gray-900 border border-gray-700 rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {results.map(card => (
            <button
              key={card.slug}
              onClick={() => { onSelect(card); setQuery(''); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 hover:bg-gray-800 transition-colors border-b border-gray-800/50 last:border-0"
            >
              <p className="text-white text-sm font-medium">{sportIcons[card.sport]} {card.player}</p>
              <p className="text-gray-500 text-xs">{card.name}</p>
            </button>
          ))}
        </div>
      )}
      {open && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-gray-900 border border-gray-700 rounded-xl p-4">
          <p className="text-gray-500 text-sm">No cards found for &quot;{query}&quot;</p>
        </div>
      )}
    </div>
  );
}

// ─── Selected Card Display ──────────────────────────────────────────

function SelectedCard({ card, onClear, side }: {
  card: SportsCard;
  onClear: () => void;
  side: 'a' | 'b';
}) {
  const borderColor = side === 'a' ? 'border-orange-500/30' : 'border-yellow-500/30';
  const rawVal = parseMidValue(card.estimatedValueRaw);
  const gemVal = parseMidValue(card.estimatedValueGem);

  return (
    <div className={`bg-gray-800/60 border ${borderColor} rounded-xl p-4 mt-3`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-white font-semibold text-sm truncate">{sportIcons[card.sport]} {card.player}</p>
          <p className="text-gray-400 text-xs mt-0.5">{card.name}</p>
          <p className="text-gray-500 text-xs mt-1">{card.set} &middot; {card.year}</p>
        </div>
        <button
          onClick={onClear}
          className="shrink-0 w-7 h-7 flex items-center justify-center text-gray-600 hover:text-red-400 transition-colors rounded-lg hover:bg-gray-700/50"
          aria-label="Remove card"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex gap-4 mt-3">
        <div>
          <p className="text-gray-500 text-xs">Raw</p>
          <p className="text-white text-sm font-medium">{formatCurrency(rawVal)}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">PSA 10</p>
          <p className="text-emerald-400 text-sm font-medium">{formatCurrency(gemVal)}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Comparison Bar ─────────────────────────────────────────────────

function ComparisonRow({ label, valueA, valueB, formatFn, higherWins = true }: {
  label: string;
  valueA: number;
  valueB: number;
  formatFn: (n: number) => string;
  higherWins?: boolean;
}) {
  const maxVal = Math.max(valueA, valueB) || 1;
  const pctA = (valueA / maxVal) * 100;
  const pctB = (valueB / maxVal) * 100;

  const aWins = higherWins ? valueA > valueB : valueA < valueB;
  const bWins = higherWins ? valueB > valueA : valueA > valueB;
  const tie = valueA === valueB;

  return (
    <div className="py-3 border-b border-gray-800/50 last:border-0">
      <p className="text-center text-xs font-medium text-gray-500 mb-2">{label}</p>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        {/* Card A value */}
        <div className="text-right">
          <p className={`text-sm font-bold ${aWins && !tie ? 'text-emerald-400' : 'text-gray-300'}`}>
            {formatFn(valueA)}
          </p>
          <div className="flex justify-end mt-1">
            <div className="h-2 rounded-full overflow-hidden bg-gray-800 w-full max-w-[160px]">
              <div
                className={`h-full rounded-full transition-all duration-500 ${aWins && !tie ? 'bg-emerald-500' : 'bg-gray-600'}`}
                style={{ width: `${pctA}%`, marginLeft: 'auto' }}
              />
            </div>
          </div>
        </div>

        {/* VS indicator */}
        <div className="w-8 flex justify-center">
          {tie ? (
            <span className="text-xs text-gray-600 font-medium">=</span>
          ) : aWins ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-emerald-500 rotate-180">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-emerald-500">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>

        {/* Card B value */}
        <div className="text-left">
          <p className={`text-sm font-bold ${bWins && !tie ? 'text-emerald-400' : 'text-gray-300'}`}>
            {formatFn(valueB)}
          </p>
          <div className="mt-1">
            <div className="h-2 rounded-full overflow-hidden bg-gray-800 w-full max-w-[160px]">
              <div
                className={`h-full rounded-full transition-all duration-500 ${bWins && !tie ? 'bg-emerald-500' : 'bg-gray-600'}`}
                style={{ width: `${pctB}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────

export default function HeadToHeadClient() {
  const [cardA, setCardA] = useState<SportsCard | null>(null);
  const [cardB, setCardB] = useState<SportsCard | null>(null);
  const [votes, setVotes] = useState<Record<string, { a: number; b: number }>>({});
  const [voted, setVoted] = useState(false);
  const [copied, setCopied] = useState(false);

  // Read URL params on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const slugA = params.get('a');
    const slugB = params.get('b');
    if (slugA) {
      const found = sportsCards.find(c => c.slug === slugA);
      if (found) setCardA(found);
    }
    if (slugB) {
      const found = sportsCards.find(c => c.slug === slugB);
      if (found) setCardB(found);
    }
  }, []);

  // Load votes from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(VOTE_KEY);
      if (stored) setVotes(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  // Check if user already voted for this matchup
  useEffect(() => {
    if (!cardA || !cardB) { setVoted(false); return; }
    const key = [cardA.slug, cardB.slug].sort().join('|');
    const votedKey = `${VOTE_KEY}-voted`;
    try {
      const stored = localStorage.getItem(votedKey);
      if (stored) {
        const votedSet: string[] = JSON.parse(stored);
        setVoted(votedSet.includes(key));
      } else {
        setVoted(false);
      }
    } catch { setVoted(false); }
  }, [cardA, cardB]);

  // Update URL when cards change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams();
    if (cardA) params.set('a', cardA.slug);
    if (cardB) params.set('b', cardB.slug);
    const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [cardA, cardB]);

  const handleVote = useCallback((side: 'a' | 'b') => {
    if (!cardA || !cardB || voted) return;
    const key = [cardA.slug, cardB.slug].sort().join('|');

    setVotes(prev => {
      const existing = prev[key] || { a: 0, b: 0 };
      const updated = { ...prev, [key]: { ...existing, [side]: existing[side] + 1 } };
      try { localStorage.setItem(VOTE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });

    // Mark as voted
    const votedKey = `${VOTE_KEY}-voted`;
    try {
      const stored = localStorage.getItem(votedKey);
      const votedSet: string[] = stored ? JSON.parse(stored) : [];
      votedSet.push(key);
      localStorage.setItem(votedKey, JSON.stringify(votedSet));
    } catch { /* ignore */ }

    setVoted(true);
  }, [cardA, cardB, voted]);

  const handleShare = useCallback(() => {
    if (!cardA || !cardB) return;
    const url = `${window.location.origin}/tools/head-to-head?a=${cardA.slug}&b=${cardB.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [cardA, cardB]);

  const handleQuickMatch = useCallback((slugA: string, slugB: string) => {
    const a = sportsCards.find(c => c.slug === slugA);
    const b = sportsCards.find(c => c.slug === slugB);
    if (a) setCardA(a);
    if (b) setCardB(b);
  }, []);

  // Computed metrics
  const rawA = cardA ? parseMidValue(cardA.estimatedValueRaw) : 0;
  const rawB = cardB ? parseMidValue(cardB.estimatedValueRaw) : 0;
  const gemA = cardA ? parseMidValue(cardA.estimatedValueGem) : 0;
  const gemB = cardB ? parseMidValue(cardB.estimatedValueGem) : 0;
  const roiA = rawA > 0 ? gemA / rawA : 0;
  const roiB = rawB > 0 ? gemB / rawB : 0;

  const pricesA = useMemo(() => cardA ? generatePriceHistory(cardA.slug, rawA) : [], [cardA, rawA]);
  const pricesB = useMemo(() => cardB ? generatePriceHistory(cardB.slug, rawB) : [], [cardB, rawB]);

  const change30A = pricesA.length >= 30 ? ((pricesA[pricesA.length - 1] - pricesA[pricesA.length - 30]) / pricesA[pricesA.length - 30]) * 100 : 0;
  const change30B = pricesB.length >= 30 ? ((pricesB[pricesB.length - 1] - pricesB[pricesB.length - 30]) / pricesB[pricesB.length - 30]) * 100 : 0;

  const voteKey = cardA && cardB ? [cardA.slug, cardB.slug].sort().join('|') : '';
  const currentVotes = voteKey ? (votes[voteKey] || { a: 0, b: 0 }) : { a: 0, b: 0 };
  // Map votes correctly: if sorted order flipped slugs, swap a/b
  const sortedSlugs = cardA && cardB ? [cardA.slug, cardB.slug].sort() : [];
  const isFlipped = cardA && sortedSlugs[0] !== cardA.slug;
  const votesA = isFlipped ? currentVotes.b : currentVotes.a;
  const votesB = isFlipped ? currentVotes.a : currentVotes.b;
  const totalVotes = votesA + votesB;

  // Investment verdict
  const investmentVerdict = useMemo(() => {
    if (!cardA || !cardB) return null;
    if (roiA > roiB) return { winner: 'a' as const, name: cardA.player, roi: roiA };
    if (roiB > roiA) return { winner: 'b' as const, name: cardB.player, roi: roiB };
    return { winner: 'tie' as const, name: 'Tie', roi: roiA };
  }, [cardA, cardB, roiA, roiB]);

  const bothSelected = cardA && cardB;

  return (
    <div>
      {/* ── Card Selection ── */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-6 items-start">
        {/* Card A */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold flex items-center justify-center">A</span>
            Card A
          </h3>
          {cardA ? (
            <SelectedCard card={cardA} onClear={() => setCardA(null)} side="a" />
          ) : (
            <CardSearch onSelect={setCardA} excludeSlug={cardB?.slug ?? null} label="Select Card A" />
          )}
        </div>

        {/* VS Badge */}
        <div className="flex items-center justify-center md:mt-10">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <span className="text-white font-extrabold text-lg">VS</span>
          </div>
        </div>

        {/* Card B */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-bold flex items-center justify-center">B</span>
            Card B
          </h3>
          {cardB ? (
            <SelectedCard card={cardB} onClear={() => setCardB(null)} side="b" />
          ) : (
            <CardSearch onSelect={setCardB} excludeSlug={cardA?.slug ?? null} label="Select Card B" />
          )}
        </div>
      </div>

      {/* ── Quick Compare Suggestions ── */}
      {!bothSelected && (
        <div className="mt-8">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-3">Popular matchups</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_MATCHUPS.map(([slugA, slugB]) => {
              const a = sportsCards.find(c => c.slug === slugA);
              const b = sportsCards.find(c => c.slug === slugB);
              if (!a || !b) return null;
              return (
                <button
                  key={`${slugA}-${slugB}`}
                  onClick={() => handleQuickMatch(slugA, slugB)}
                  className="inline-flex items-center gap-1.5 bg-gray-900 border border-gray-800 hover:border-orange-500/30 text-gray-300 hover:text-white text-xs font-medium px-3 py-2 rounded-xl transition-colors"
                >
                  {a.player} <span className="text-gray-600">vs</span> {b.player}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Comparison Panel ── */}
      {bothSelected && cardA && cardB && (
        <div className="mt-8 space-y-6">

          {/* Metric Comparison */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 sm:p-6">
            <div className="grid grid-cols-[1fr_auto_1fr] gap-3 mb-4">
              <p className="text-right text-sm font-bold text-orange-400 truncate">{cardA.player}</p>
              <p className="text-gray-600 text-sm font-medium">Metric</p>
              <p className="text-left text-sm font-bold text-yellow-400 truncate">{cardB.player}</p>
            </div>

            <ComparisonRow
              label="Raw Price"
              valueA={rawA}
              valueB={rawB}
              formatFn={formatCurrency}
              higherWins
            />
            <ComparisonRow
              label="PSA 10 Price"
              valueA={gemA}
              valueB={gemB}
              formatFn={formatCurrency}
              higherWins
            />
            <ComparisonRow
              label="Grading ROI"
              valueA={roiA}
              valueB={roiB}
              formatFn={(n) => n.toFixed(1) + 'x'}
              higherWins
            />
            <ComparisonRow
              label="Year (Vintage Appeal)"
              valueA={cardA.year}
              valueB={cardB.year}
              formatFn={(n) => String(n)}
              higherWins={false}
            />

            {/* Sport & Set (display only) */}
            <div className="py-3 border-b border-gray-800/50">
              <p className="text-center text-xs font-medium text-gray-500 mb-2">Sport</p>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <p className="text-right text-sm text-gray-300">{sportIcons[cardA.sport]} {cardA.sport.charAt(0).toUpperCase() + cardA.sport.slice(1)}</p>
                <div className="w-8" />
                <p className="text-left text-sm text-gray-300">{sportIcons[cardB.sport]} {cardB.sport.charAt(0).toUpperCase() + cardB.sport.slice(1)}</p>
              </div>
            </div>

            <div className="py-3">
              <p className="text-center text-xs font-medium text-gray-500 mb-2">Set</p>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <p className="text-right text-sm text-gray-300 truncate">{cardA.set}</p>
                <div className="w-8" />
                <p className="text-left text-sm text-gray-300 truncate">{cardB.set}</p>
              </div>
            </div>
          </div>

          {/* Investment Verdict */}
          {investmentVerdict && (
            <div className={`rounded-2xl p-5 border ${
              investmentVerdict.winner === 'tie'
                ? 'bg-gray-900 border-gray-800'
                : 'bg-emerald-950/30 border-emerald-800/40'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Investment Pick</p>
                  {investmentVerdict.winner === 'tie' ? (
                    <p className="text-gray-400 text-sm">These cards have equal grading ROI &mdash; it&apos;s a tie!</p>
                  ) : (
                    <p className="text-gray-400 text-sm">
                      <span className="text-emerald-400 font-semibold">{investmentVerdict.name}</span> has the better grading ROI at{' '}
                      <span className="text-white font-medium">{investmentVerdict.roi.toFixed(1)}x</span> return from raw to PSA 10.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Price Simulation */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 sm:p-6">
            <h3 className="text-white font-bold text-sm mb-4">30-Day Price Simulation</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-orange-400 text-xs font-semibold">{cardA.player}</p>
                  <p className={`text-xs font-bold ${change30A >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {change30A >= 0 ? '+' : ''}{change30A.toFixed(1)}%
                  </p>
                </div>
                <Sparkline prices={pricesA} color={change30A >= 0 ? '#34d399' : '#f87171'} />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>30d ago</span>
                  <span>Today</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-yellow-400 text-xs font-semibold">{cardB.player}</p>
                  <p className={`text-xs font-bold ${change30B >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {change30B >= 0 ? '+' : ''}{change30B.toFixed(1)}%
                  </p>
                </div>
                <Sparkline prices={pricesB} color={change30B >= 0 ? '#34d399' : '#f87171'} />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>30d ago</span>
                  <span>Today</span>
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-xs text-center mt-4">
              Simulated prices based on deterministic market patterns. Not actual market data.
            </p>
          </div>

          {/* Who Would You Pick? */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 sm:p-6">
            <h3 className="text-white font-bold text-sm mb-4">Who Would You Pick?</h3>
            {!voted ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleVote(isFlipped ? 'b' : 'a')}
                  className="bg-orange-500/10 border border-orange-500/30 hover:border-orange-500/60 text-orange-400 hover:text-orange-300 font-semibold text-sm py-3 rounded-xl transition-colors"
                >
                  {cardA.player}
                </button>
                <button
                  onClick={() => handleVote(isFlipped ? 'a' : 'b')}
                  className="bg-yellow-500/10 border border-yellow-500/30 hover:border-yellow-500/60 text-yellow-400 hover:text-yellow-300 font-semibold text-sm py-3 rounded-xl transition-colors"
                >
                  {cardB.player}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <p className="text-orange-400 text-xs font-semibold w-24 truncate text-right">{cardA.player}</p>
                  <div className="flex-1 h-6 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-end pr-2 transition-all duration-700"
                      style={{ width: `${totalVotes > 0 ? (votesA / totalVotes) * 100 : 50}%` }}
                    >
                      {totalVotes > 0 && <span className="text-white text-xs font-bold">{Math.round((votesA / totalVotes) * 100)}%</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-yellow-400 text-xs font-semibold w-24 truncate text-right">{cardB.player}</p>
                  <div className="flex-1 h-6 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full flex items-center justify-end pr-2 transition-all duration-700"
                      style={{ width: `${totalVotes > 0 ? (votesB / totalVotes) * 100 : 50}%` }}
                    >
                      {totalVotes > 0 && <span className="text-white text-xs font-bold">{Math.round((votesB / totalVotes) * 100)}%</span>}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-xs text-center">{totalVotes} vote{totalVotes !== 1 ? 's' : ''} on this device</p>
              </div>
            )}
          </div>

          {/* Share & Links */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              {copied ? 'Link Copied!' : 'Share Comparison'}
            </button>
            <Link
              href={`/cards/${cardA.slug}`}
              className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors border border-gray-700"
            >
              View {cardA.player}
            </Link>
            <Link
              href={`/cards/${cardB.slug}`}
              className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors border border-gray-700"
            >
              View {cardB.player}
            </Link>
          </div>
        </div>
      )}

      {/* ── Related Tools ── */}
      <div className="border-t border-gray-800 pt-10 mt-10">
        <h3 className="text-white font-semibold mb-4">Related Tools</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/tools/trade" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
            Trade Evaluator
          </Link>
          <Link href="/tools/price-history" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Price History
          </Link>
          <Link href="/tools/grading-roi" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Grading ROI
          </Link>
          <Link href="/tools" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            All Tools
          </Link>
        </div>
      </div>
    </div>
  );
}

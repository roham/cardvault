'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sealedProducts } from '@/data/sealed-products';

// ─── Types ───────────────────────────────────────────────────────────

interface Vote {
  date: string;
  productSlug: string;
  vote: 'rip' | 'skip';
}

interface RipOrSkipState {
  votes: Vote[];
  totalRips: number;
  totalSkips: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────

const STORAGE_KEY = 'cardvault-rip-or-skip';

const sportEmoji: Record<string, string> = {
  baseball: '\u26BE',
  basketball: '\uD83C\uDFC0',
  football: '\uD83C\uDFC8',
  hockey: '\uD83C\uDFD2',
  pokemon: '\u26A1',
};

const typeLabels: Record<string, string> = {
  'hobby-box': 'Hobby Box',
  'blaster': 'Blaster',
  'mega-box': 'Mega Box',
  'hanger': 'Hanger',
  'fat-pack': 'Bundle / Fat Pack',
  'etb': 'Elite Trainer Box',
};

function dateHash(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const ch = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0;
  }
  return Math.abs(hash);
}

function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getProductForDate(dateStr: string): typeof sealedProducts[0] {
  const hash = dateHash(dateStr);
  return sealedProducts[hash % sealedProducts.length];
}

/** Deterministic community vote percentage for a given product on a given date */
function getCommunityRipPercent(productSlug: string): number {
  const hash = dateHash(productSlug + '-community');
  // Range: 25% to 85% rip — some products are clearly better value
  return 25 + (hash % 61);
}

/** Parse odds string like "1:12 packs" into a fraction */
function parseOdds(odds: string): number {
  const match = odds.match(/1:(\d+)/);
  if (!match) return 0;
  return 1 / parseInt(match[1], 10);
}

/** Calculate expected value of a box */
function calculateEV(product: typeof sealedProducts[0]): number {
  let ev = product.baseCardValue;
  for (const hit of product.hitRates) {
    const probabilityPerPack = parseOdds(hit.odds);
    ev += hit.avgValue * probabilityPerPack * product.packsPerBox;
  }
  return Math.round(ev * 100) / 100;
}

function loadState(): RipOrSkipState {
  if (typeof window === 'undefined') return { votes: [], totalRips: 0, totalSkips: 0 };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* empty */ }
  return { votes: [], totalRips: 0, totalSkips: 0 };
}

function saveState(state: RipOrSkipState): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* empty */ }
}

function getDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Components ──────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
        <div className="h-6 bg-gray-800 rounded w-2/3 mx-auto mb-4" />
        <div className="h-4 bg-gray-800 rounded w-1/2 mx-auto mb-3" />
        <div className="h-8 bg-gray-800 rounded w-1/3 mx-auto mb-4" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-800 rounded w-full" />
          <div className="h-3 bg-gray-800 rounded w-5/6" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-14 bg-gray-800 rounded-lg" />
        <div className="h-14 bg-gray-800 rounded-lg" />
      </div>
    </div>
  );
}

function ResultsBar({ ripPercent, userVote }: { ripPercent: number; userVote: 'rip' | 'skip' }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const skipPercent = 100 - ripPercent;
  const verdict = ripPercent >= 50 ? 'RIP' : 'SKIP';

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-lg font-bold text-white mb-1">
          Community says: <span className={ripPercent >= 50 ? 'text-emerald-400' : 'text-red-400'}>{verdict}!</span>
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className={`font-medium ${userVote === 'rip' ? 'text-emerald-400' : 'text-gray-400'}`}>
            RIP IT {userVote === 'rip' && '(You)'}
          </span>
          <span className="text-gray-400">{ripPercent}%</span>
        </div>
        <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-1000 ease-out"
            style={{ width: animated ? `${ripPercent}%` : '0%' }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className={`font-medium ${userVote === 'skip' ? 'text-red-400' : 'text-gray-400'}`}>
            SKIP IT {userVote === 'skip' && '(You)'}
          </span>
          <span className="text-gray-400">{skipPercent}%</span>
        </div>
        <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-1000 ease-out"
            style={{ width: animated ? `${skipPercent}%` : '0%' }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────

export default function RipOrSkipClient() {
  const [state, setState] = useState<RipOrSkipState | null>(null);
  const [mounted, setMounted] = useState(false);

  const today = useMemo(() => getTodayString(), []);
  const product = useMemo(() => getProductForDate(today), [today]);
  const ev = useMemo(() => calculateEV(product), [product]);
  const communityRipPercent = useMemo(() => getCommunityRipPercent(product.slug), [product.slug]);

  useEffect(() => {
    const loaded = loadState();
    setState(loaded);
    setMounted(true);
  }, []);

  const todayVote = useMemo(() => {
    if (!state) return null;
    return state.votes.find(v => v.date === today)?.vote ?? null;
  }, [state, today]);

  const handleVote = useCallback((vote: 'rip' | 'skip') => {
    if (!state || todayVote) return;

    const newVote: Vote = { date: today, productSlug: product.slug, vote };
    const newVotes = [newVote, ...state.votes.filter(v => v.date !== today)].slice(0, 60);
    const newState: RipOrSkipState = {
      votes: newVotes,
      totalRips: state.totalRips + (vote === 'rip' ? 1 : 0),
      totalSkips: state.totalSkips + (vote === 'skip' ? 1 : 0),
    };

    setState(newState);
    saveState(newState);
  }, [state, todayVote, today, product.slug]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!state) return { total: 0, ripPercent: 0, skipPercent: 0, ripStreak: 0 };

    const total = state.totalRips + state.totalSkips;
    const ripPercent = total > 0 ? Math.round((state.totalRips / total) * 100) : 0;
    const skipPercent = total > 0 ? 100 - ripPercent : 0;

    // Calculate rip streak (consecutive rips from most recent)
    let ripStreak = 0;
    const sorted = [...state.votes].sort((a, b) => b.date.localeCompare(a.date));
    for (const v of sorted) {
      if (v.vote === 'rip') ripStreak++;
      else break;
    }

    return { total, ripPercent, skipPercent, ripStreak };
  }, [state]);

  // History: last 7 days
  const history = useMemo(() => {
    if (!state) return [];
    const items: Array<{
      date: string;
      productName: string;
      userVote: 'rip' | 'skip' | null;
      communityRip: number;
    }> = [];

    for (let i = 1; i <= 7; i++) {
      const dateStr = getDaysAgo(i);
      const prod = getProductForDate(dateStr);
      const vote = state.votes.find(v => v.date === dateStr);
      items.push({
        date: dateStr,
        productName: prod.name,
        userVote: vote?.vote ?? null,
        communityRip: getCommunityRipPercent(prod.slug),
      });
    }

    return items;
  }, [state]);

  // Top 3 hit rates sorted by value
  const topHits = useMemo(() => {
    return [...product.hitRates]
      .sort((a, b) => b.avgValue - a.avgValue)
      .slice(0, 3);
  }, [product.hitRates]);

  if (!mounted) return <LoadingSkeleton />;

  return (
    <div>
      {/* Stats */}
      {stats.total > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Votes Cast</p>
          </div>
          <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.ripPercent}%</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Rip Rate</p>
          </div>
          <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-orange-400">{stats.ripStreak}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Rip Streak</p>
          </div>
        </div>
      )}

      {/* Today's Product Card */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6 mb-6">
        <p className="text-xs text-gray-500 uppercase tracking-wider text-center mb-2">Today&apos;s Product</p>

        <div className="text-center mb-4">
          <span className="text-4xl mb-2 block">{sportEmoji[product.sport] ?? ''}</span>
          <h2 className="text-2xl font-bold text-white mb-1">{product.name}</h2>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-gray-800 text-gray-300 capitalize">
              {product.sport}
            </span>
            <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-gray-800 text-gray-300">
              {typeLabels[product.type] ?? product.type}
            </span>
            <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-gray-800 text-gray-300">
              {product.year}
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="text-center mb-5">
          <span className="text-3xl font-extrabold text-white">${product.retailPrice}</span>
          <span className="text-sm text-gray-500 ml-1">retail</span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-400 text-center mb-5 max-w-lg mx-auto leading-relaxed">
          {product.description}
        </p>

        {/* Key Hits */}
        <div className="mb-5">
          <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2 text-center">Top Hits</h3>
          <div className="space-y-2 max-w-md mx-auto">
            {topHits.map((hit, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg">
                <div>
                  <span className="text-sm text-white font-medium">{hit.insert}</span>
                  <span className="text-xs text-gray-500 ml-2">{hit.odds}</span>
                </div>
                <span className="text-sm font-bold text-emerald-400">${hit.avgValue}</span>
              </div>
            ))}
          </div>
        </div>

        {/* EV Summary */}
        <div className="text-center p-3 bg-gray-800/40 rounded-lg max-w-md mx-auto">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Expected Value</p>
          <p className={`text-2xl font-bold ${ev >= product.retailPrice ? 'text-emerald-400' : 'text-red-400'}`}>
            ${ev.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {ev >= product.retailPrice
              ? `+$${(ev - product.retailPrice).toFixed(2)} above retail — positive EV`
              : `-$${(product.retailPrice - ev).toFixed(2)} below retail — negative EV`}
          </p>
        </div>
      </div>

      {/* Voting / Results */}
      {todayVote ? (
        <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6 mb-8">
          <ResultsBar ripPercent={communityRipPercent} userVote={todayVote} />
          <p className="text-center text-xs text-gray-500 mt-4">
            Come back tomorrow for a new product!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => handleVote('rip')}
            className="py-4 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-lg font-bold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            RIP IT! <span className="inline-block ml-1" aria-hidden="true">{'\uD83D\uDD25'}</span>
          </button>
          <button
            onClick={() => handleVote('skip')}
            className="py-4 px-6 rounded-xl bg-red-600 hover:bg-red-500 text-white text-lg font-bold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            SKIP IT <span className="inline-block ml-1" aria-hidden="true">{'\u274C'}</span>
          </button>
        </div>
      )}

      {/* History */}
      {history.some(h => h.userVote) && (
        <section className="mb-8">
          <h3 className="text-lg font-bold text-white mb-4">Last 7 Days</h3>
          <div className="space-y-2">
            {history.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-900/50 border border-gray-800 rounded-lg">
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-gray-500 mr-2">{formatDate(item.date)}</span>
                  <span className="text-sm text-white truncate">{item.productName}</span>
                </div>
                <div className="flex items-center gap-3 ml-3 shrink-0">
                  {item.userVote ? (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      item.userVote === 'rip'
                        ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/50'
                        : 'bg-red-950/50 text-red-400 border border-red-800/50'
                    }`}>
                      {item.userVote === 'rip' ? 'RIP' : 'SKIP'}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-600">--</span>
                  )}
                  <span className="text-xs text-gray-500 w-16 text-right">
                    {item.communityRip}% rip
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Links Section */}
      <section className="mt-12 text-center">
        <p className="text-gray-400 mb-3">Want more?</p>
        <div className="flex justify-center gap-3 flex-wrap">
          <Link href="/tools/pack-sim" className="inline-block py-3 px-6 rounded-lg bg-gray-800 text-white font-bold hover:bg-gray-700 transition-colors text-sm">
            Rip Virtually
          </Link>
          <Link href="/tools/sealed-ev" className="inline-block py-3 px-6 rounded-lg bg-gray-800 text-white font-bold hover:bg-gray-700 transition-colors text-sm">
            Full EV Breakdown
          </Link>
          <Link href="/tools/daily-pack" className="inline-block py-3 px-6 rounded-lg bg-gray-800 text-white font-bold hover:bg-gray-700 transition-colors text-sm">
            Daily Free Pack
          </Link>
        </div>
      </section>
    </div>
  );
}

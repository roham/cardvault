'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

function parseValue(raw: string): number {
  const m = raw.match(/\$[\d,]+/);
  if (!m) return 0;
  return parseInt(m[0].replace(/[$,]/g, ''), 10);
}

function seededRng(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

interface SubTier {
  id: string;
  name: string;
  price: number;
  cardsPerMonth: number;
  guaranteedHit: boolean;
  rookieChance: number;
  description: string;
  color: string;
  bg: string;
}

const TIERS: SubTier[] = [
  { id: 'starter', name: 'Starter', price: 25, cardsPerMonth: 5, guaranteedHit: false, rookieChance: 0.2, description: '5 cards/month, fun variety mix', color: 'text-blue-400', bg: 'bg-blue-950/40 border-blue-800/40' },
  { id: 'collector', name: 'Collector', price: 50, cardsPerMonth: 8, guaranteedHit: false, rookieChance: 0.35, description: '8 cards/month, higher rookie rate', color: 'text-purple-400', bg: 'bg-purple-950/40 border-purple-800/40' },
  { id: 'premium', name: 'Premium', price: 100, cardsPerMonth: 10, guaranteedHit: true, rookieChance: 0.4, description: '10 cards/month, guaranteed hit ($20+)', color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-800/40' },
  { id: 'elite', name: 'Elite', price: 200, cardsPerMonth: 12, guaranteedHit: true, rookieChance: 0.5, description: '12 cards/month, premium hits guaranteed', color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-800/40' },
];

interface MonthPull {
  month: number;
  year: number;
  label: string;
  cards: typeof sportsCards;
  totalValue: number;
  cost: number;
}

const SPORT_COLORS: Record<string, string> = {
  baseball: 'text-red-400',
  basketball: 'text-orange-400',
  football: 'text-blue-400',
  hockey: 'text-cyan-400',
};

const LS_KEY = 'cardvault-pack-subscription';

interface SavedState {
  tierId: string;
  monthsActive: number;
  sportFilter: string;
}

export default function SubscriptionClient() {
  const [mounted, setMounted] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>('collector');
  const [monthsActive, setMonthsActive] = useState(0);
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const state: SavedState = JSON.parse(saved);
        setSelectedTier(state.tierId);
        setMonthsActive(state.monthsActive);
        setSportFilter(state.sportFilter);
      }
    } catch {}
  }, []);

  const save = useCallback((tierId: string, months: number, sport: string) => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ tierId, monthsActive: months, sportFilter: sport }));
    } catch {}
  }, []);

  const tier = useMemo(() => TIERS.find(t => t.id === selectedTier) || TIERS[1], [selectedTier]);

  const filteredCards = useMemo(() => {
    return sportFilter === 'all' ? sportsCards : sportsCards.filter(c => c.sport === sportFilter);
  }, [sportFilter]);

  const monthlyPulls = useMemo((): MonthPull[] => {
    if (monthsActive === 0) return [];
    const pulls: MonthPull[] = [];
    const now = new Date();

    for (let m = 0; m < monthsActive; m++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const seed = monthDate.getFullYear() * 100 + monthDate.getMonth() + tier.id.charCodeAt(0) * 1000;
      const rng = seededRng(seed);

      const monthCards: typeof sportsCards = [];
      const usedSlugs = new Set<string>();
      const pool = [...filteredCards];

      for (let i = 0; i < tier.cardsPerMonth; i++) {
        // Guaranteed hit on first card for premium+ tiers
        if (i === 0 && tier.guaranteedHit) {
          const hits = pool.filter(c => parseValue(c.estimatedValueRaw) >= 20 && !usedSlugs.has(c.slug));
          if (hits.length > 0) {
            const idx = Math.floor(rng() * hits.length);
            monthCards.push(hits[idx]);
            usedSlugs.add(hits[idx].slug);
            continue;
          }
        }

        // Rookie chance
        const wantRookie = rng() < tier.rookieChance;
        const candidates = pool.filter(c =>
          !usedSlugs.has(c.slug) && (!wantRookie || c.rookie)
        );

        if (candidates.length === 0) {
          const fallback = pool.filter(c => !usedSlugs.has(c.slug));
          if (fallback.length > 0) {
            const idx = Math.floor(rng() * fallback.length);
            monthCards.push(fallback[idx]);
            usedSlugs.add(fallback[idx].slug);
          }
        } else {
          const idx = Math.floor(rng() * candidates.length);
          monthCards.push(candidates[idx]);
          usedSlugs.add(candidates[idx].slug);
        }
      }

      const totalValue = monthCards.reduce((sum, c) => sum + parseValue(c.estimatedValueRaw), 0);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      pulls.push({
        month: monthDate.getMonth(),
        year: monthDate.getFullYear(),
        label: `${monthNames[monthDate.getMonth()]} ${monthDate.getFullYear()}`,
        cards: monthCards,
        totalValue,
        cost: tier.price,
      });
    }

    return pulls;
  }, [monthsActive, tier, filteredCards]);

  // Cumulative stats
  const totalSpent = monthsActive * tier.price;
  const totalPulled = monthlyPulls.reduce((s, m) => s + m.cards.length, 0);
  const totalValue = monthlyPulls.reduce((s, m) => s + m.totalValue, 0);
  const roi = totalSpent > 0 ? ((totalValue - totalSpent) / totalSpent * 100) : 0;
  const totalRookies = monthlyPulls.reduce((s, m) => s + m.cards.filter(c => c.rookie).length, 0);
  const bestPull = monthlyPulls.flatMap(m => m.cards).sort((a, b) => parseValue(b.estimatedValueRaw) - parseValue(a.estimatedValueRaw))[0];

  const handleOpenMonth = () => {
    const newMonths = monthsActive + 1;
    setMonthsActive(newMonths);
    setExpandedMonth(0);
    save(selectedTier, newMonths, sportFilter);
  };

  const handleReset = () => {
    setMonthsActive(0);
    setExpandedMonth(null);
    save(selectedTier, 0, sportFilter);
  };

  const handleTierChange = (tierId: string) => {
    setSelectedTier(tierId);
    setMonthsActive(0);
    setExpandedMonth(null);
    save(tierId, 0, sportFilter);
  };

  return (
    <div className="space-y-6">
      {/* Tier Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {TIERS.map(t => (
          <button
            key={t.id}
            onClick={() => handleTierChange(t.id)}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedTier === t.id
                ? `${t.bg} ring-1 ring-white/20`
                : 'bg-gray-900/40 border-gray-800/40 hover:border-gray-700/50'
            }`}
          >
            <p className={`text-lg font-bold ${selectedTier === t.id ? t.color : 'text-white'}`}>${t.price}/mo</p>
            <p className="text-xs text-gray-400 font-medium">{t.name}</p>
            <p className="text-[10px] text-gray-500 mt-1">{t.description}</p>
          </button>
        ))}
      </div>

      {/* Sport Filter */}
      <div className="flex flex-wrap gap-2">
        {['all', 'baseball', 'basketball', 'football', 'hockey'].map(s => (
          <button
            key={s}
            onClick={() => { setSportFilter(s); save(selectedTier, monthsActive, s); }}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              sportFilter === s
                ? 'bg-purple-900/60 border-purple-600/50 text-purple-300'
                : 'bg-gray-800/40 border-gray-700/40 text-gray-400 hover:text-white'
            }`}
          >
            {s === 'all' ? 'All Sports' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Stats Bar */}
      {monthsActive > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Months', value: `${monthsActive}`, sub: `$${totalSpent} spent` },
            { label: 'Cards Pulled', value: `${totalPulled}`, sub: `${tier.cardsPerMonth}/mo` },
            { label: 'Total Value', value: `$${totalValue.toLocaleString()}`, sub: 'estimated' },
            { label: 'ROI', value: `${roi >= 0 ? '+' : ''}${roi.toFixed(0)}%`, sub: roi >= 0 ? 'profit' : 'loss' },
            { label: 'Rookies', value: `${totalRookies}`, sub: `${totalPulled > 0 ? Math.round(totalRookies / totalPulled * 100) : 0}% rate` },
            { label: 'Best Pull', value: bestPull ? `$${parseValue(bestPull.estimatedValueRaw)}` : '—', sub: bestPull ? bestPull.player.split(' ').pop() : '' },
          ].map((s, i) => (
            <div key={i} className="bg-gray-900/60 border border-gray-800/60 rounded-lg p-3 text-center">
              <p className="text-[10px] text-gray-500 uppercase">{s.label}</p>
              <p className={`text-lg font-bold ${s.label === 'ROI' ? (roi >= 0 ? 'text-emerald-400' : 'text-red-400') : 'text-white'}`}>{s.value}</p>
              <p className="text-[10px] text-gray-500">{s.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleOpenMonth}
          className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-medium py-3 px-6 rounded-xl transition-colors"
        >
          {monthsActive === 0 ? `Start Subscription ($${tier.price}/mo)` : `Open Month ${monthsActive + 1} ($${tier.price})`}
        </button>
        {monthsActive > 0 && (
          <button
            onClick={handleReset}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 px-4 rounded-xl transition-colors text-sm"
          >
            Reset
          </button>
        )}
      </div>

      {/* Monthly Pulls */}
      {monthlyPulls.map((pull, idx) => (
        <div key={idx} className="bg-gray-900/60 border border-gray-800/60 rounded-xl overflow-hidden">
          <button
            onClick={() => setExpandedMonth(expandedMonth === idx ? null : idx)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-800/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-white">{pull.label}</span>
              <span className="text-xs text-gray-500">{pull.cards.length} cards</span>
              <span className="text-xs text-gray-500">&middot;</span>
              <span className={`text-xs font-medium ${pull.totalValue >= pull.cost ? 'text-emerald-400' : 'text-red-400'}`}>
                ${pull.totalValue} value
              </span>
              {pull.totalValue >= pull.cost && <span className="text-[10px] text-emerald-600 bg-emerald-950/40 px-1.5 py-0.5 rounded">W</span>}
              {pull.totalValue < pull.cost && <span className="text-[10px] text-red-600 bg-red-950/40 px-1.5 py-0.5 rounded">L</span>}
            </div>
            <span className={`text-gray-600 transition-transform ${expandedMonth === idx ? 'rotate-180' : ''}`}>&#9662;</span>
          </button>
          {expandedMonth === idx && (
            <div className="border-t border-gray-800/40 p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {pull.cards.map((card, ci) => (
                  <Link
                    key={ci}
                    href={`/sports/${card.slug}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/40 transition-colors"
                  >
                    <span className={`text-[10px] font-bold uppercase ${SPORT_COLORS[card.sport] || 'text-gray-400'}`}>{card.sport.slice(0, 3)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{card.name}</p>
                      <p className="text-xs text-gray-500">{card.player} &middot; {card.year}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-medium text-white">{card.estimatedValueRaw.split('(')[0].trim()}</p>
                      {card.rookie && <span className="text-[9px] text-amber-400 font-bold">RC</span>}
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-800/40 flex justify-between text-xs text-gray-500">
                <span>Cost: ${pull.cost}</span>
                <span>Value: ${pull.totalValue}</span>
                <span className={pull.totalValue >= pull.cost ? 'text-emerald-400' : 'text-red-400'}>
                  {pull.totalValue >= pull.cost ? '+' : ''}${pull.totalValue - pull.cost} ({pull.cost > 0 ? ((pull.totalValue - pull.cost) / pull.cost * 100).toFixed(0) : 0}%)
                </span>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Empty state */}
      {monthsActive === 0 && mounted && (
        <div className="bg-gray-900/40 border border-gray-800/40 rounded-xl p-8 text-center">
          <p className="text-4xl mb-3">&#128230;</p>
          <p className="text-gray-400">Choose your tier and click Start Subscription</p>
          <p className="text-xs text-gray-600 mt-2">Open monthly packs, track ROI over time, build your collection</p>
        </div>
      )}
    </div>
  );
}

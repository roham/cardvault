'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards, type SportsCard } from '@/data/sports-cards';

function parseValue(v: string): number {
  const m = v.match(/\$([0-9,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function getEraLabel(year: number): 'vintage' | 'modern' | 'ultra-modern' {
  if (year < 1980) return 'vintage';
  if (year < 2015) return 'modern';
  return 'ultra-modern';
}

function getTierLabel(val: number): 'budget' | 'mid-range' | 'premium' {
  if (val < 50) return 'budget';
  if (val < 500) return 'mid-range';
  return 'premium';
}

type Sport = 'baseball' | 'basketball' | 'football' | 'hockey';
type Era = 'vintage' | 'modern' | 'ultra-modern';
type Tier = 'budget' | 'mid-range' | 'premium';

interface Allocation {
  sport: Record<Sport, number>;
  era: Record<Era, number>;
  tier: Record<Tier, number>;
}

const PRESETS: Record<string, { name: string; desc: string; allocation: Allocation }> = {
  balanced: {
    name: 'Balanced',
    desc: 'Equal exposure across sports, mixed eras, diversified tiers',
    allocation: {
      sport: { baseball: 30, basketball: 25, football: 25, hockey: 20 },
      era: { vintage: 25, modern: 40, 'ultra-modern': 35 },
      tier: { budget: 40, 'mid-range': 35, premium: 25 },
    },
  },
  growth: {
    name: 'Growth',
    desc: 'Aggressive — basketball/football heavy, ultra-modern, higher risk',
    allocation: {
      sport: { baseball: 15, basketball: 35, football: 35, hockey: 15 },
      era: { vintage: 10, modern: 30, 'ultra-modern': 60 },
      tier: { budget: 30, 'mid-range': 30, premium: 40 },
    },
  },
  conservative: {
    name: 'Conservative',
    desc: 'Defensive — baseball/vintage heavy, established value, lower risk',
    allocation: {
      sport: { baseball: 40, basketball: 20, football: 20, hockey: 20 },
      era: { vintage: 40, modern: 40, 'ultra-modern': 20 },
      tier: { budget: 25, 'mid-range': 40, premium: 35 },
    },
  },
};

function computeAllocation(cards: SportsCard[]): Allocation {
  const total = cards.length || 1;
  const sport: Record<Sport, number> = { baseball: 0, basketball: 0, football: 0, hockey: 0 };
  const era: Record<Era, number> = { vintage: 0, modern: 0, 'ultra-modern': 0 };
  const tier: Record<Tier, number> = { budget: 0, 'mid-range': 0, premium: 0 };

  for (const c of cards) {
    sport[c.sport as Sport] = (sport[c.sport as Sport] || 0) + 1;
    era[getEraLabel(c.year)] += 1;
    tier[getTierLabel(parseValue(c.estimatedValueRaw))] += 1;
  }

  const pct = (n: number) => Math.round((n / total) * 100);
  return {
    sport: { baseball: pct(sport.baseball), basketball: pct(sport.basketball), football: pct(sport.football), hockey: pct(sport.hockey) },
    era: { vintage: pct(era.vintage), modern: pct(era.modern), 'ultra-modern': pct(era['ultra-modern']) },
    tier: { budget: pct(tier.budget), 'mid-range': pct(tier['mid-range']), premium: pct(tier.premium) },
  };
}

interface Recommendation {
  action: 'BUY' | 'SELL' | 'HOLD';
  category: string;
  label: string;
  currentPct: number;
  targetPct: number;
  gap: number;
  suggestion: string;
}

function generateRecommendations(current: Allocation, target: Allocation, cards: SportsCard[]): Recommendation[] {
  const recs: Recommendation[] = [];

  // Sport recommendations
  for (const sport of ['baseball', 'basketball', 'football', 'hockey'] as Sport[]) {
    const cur = current.sport[sport];
    const tgt = target.sport[sport];
    const gap = tgt - cur;
    if (Math.abs(gap) >= 5) {
      const action = gap > 0 ? 'BUY' : 'SELL';
      const sportLabel = sport.charAt(0).toUpperCase() + sport.slice(1);
      const suggestions = sportsCards
        .filter(c => c.sport === sport && c.rookie && !cards.some(pc => pc.slug === c.slug))
        .sort((a, b) => parseValue(b.estimatedValueRaw) - parseValue(a.estimatedValueRaw))
        .slice(0, 3);
      const suggestion = gap > 0
        ? `Add ${Math.abs(gap)}% more ${sportLabel}. Consider: ${suggestions.map(s => s.player).join(', ') || 'browse our card database'}`
        : `Reduce ${sportLabel} by ${Math.abs(gap)}%. Sell lower-conviction positions first.`;
      recs.push({ action, category: 'Sport', label: sportLabel, currentPct: cur, targetPct: tgt, gap, suggestion });
    } else {
      recs.push({ action: 'HOLD', category: 'Sport', label: sport.charAt(0).toUpperCase() + sport.slice(1), currentPct: cur, targetPct: tgt, gap, suggestion: 'On target — no changes needed.' });
    }
  }

  // Era recommendations
  for (const era of ['vintage', 'modern', 'ultra-modern'] as Era[]) {
    const cur = current.era[era];
    const tgt = target.era[era];
    const gap = tgt - cur;
    const label = era === 'ultra-modern' ? 'Ultra-Modern' : era.charAt(0).toUpperCase() + era.slice(1);
    if (Math.abs(gap) >= 5) {
      const action = gap > 0 ? 'BUY' : 'SELL';
      const yearRange = era === 'vintage' ? 'pre-1980' : era === 'modern' ? '1980-2014' : '2015+';
      const suggestion = gap > 0
        ? `Add ${Math.abs(gap)}% more ${label} (${yearRange}) cards to your portfolio.`
        : `Reduce ${label} exposure by ${Math.abs(gap)}%. Consider trading for other eras.`;
      recs.push({ action, category: 'Era', label, currentPct: cur, targetPct: tgt, gap, suggestion });
    }
  }

  // Tier recommendations
  for (const tier of ['budget', 'mid-range', 'premium'] as Tier[]) {
    const cur = current.tier[tier];
    const tgt = target.tier[tier];
    const gap = tgt - cur;
    const label = tier === 'mid-range' ? 'Mid-Range ($50-500)' : tier === 'premium' ? 'Premium ($500+)' : 'Budget (<$50)';
    if (Math.abs(gap) >= 5) {
      const action = gap > 0 ? 'BUY' : 'SELL';
      const suggestion = gap > 0
        ? `Add ${Math.abs(gap)}% more ${tier} cards.`
        : `Reduce ${tier} tier by ${Math.abs(gap)}%.`;
      recs.push({ action, category: 'Tier', label, currentPct: cur, targetPct: tgt, gap, suggestion });
    }
  }

  return recs.sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap));
}

export default function PortfolioRebalancerClient() {
  const [query, setQuery] = useState('');
  const [portfolio, setPortfolio] = useState<SportsCard[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [strategy, setStrategy] = useState<string>('balanced');
  const [customAllocation, setCustomAllocation] = useState<Allocation>(PRESETS.balanced.allocation);

  const searchResults = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return sportsCards
      .filter(c => (c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q)) && !portfolio.some(p => p.slug === c.slug))
      .slice(0, 8);
  }, [query, portfolio]);

  const currentAllocation = useMemo(() => computeAllocation(portfolio), [portfolio]);
  const targetAllocation = strategy === 'custom' ? customAllocation : PRESETS[strategy].allocation;
  const recommendations = useMemo(
    () => portfolio.length >= 3 ? generateRecommendations(currentAllocation, targetAllocation, portfolio) : [],
    [currentAllocation, targetAllocation, portfolio]
  );

  const totalValue = portfolio.reduce((s, c) => s + parseValue(c.estimatedValueRaw), 0);

  function addCard(card: SportsCard) {
    setPortfolio(prev => [...prev, card]);
    setQuery('');
    setShowSearch(false);
  }

  function removeCard(slug: string) {
    setPortfolio(prev => prev.filter(c => c.slug !== slug));
  }

  return (
    <div>
      {/* Search */}
      <div className="relative mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Add cards to your portfolio</label>
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setShowSearch(true); }}
          onFocus={() => setShowSearch(true)}
          placeholder="Search by player name, card name, or year..."
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 outline-none"
        />
        {showSearch && searchResults.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-h-64 overflow-y-auto">
            {searchResults.map(c => (
              <button
                key={c.slug}
                onClick={() => addCard(c)}
                className="w-full text-left px-4 py-3 hover:bg-gray-800 border-b border-gray-800 last:border-b-0 transition-colors"
              >
                <div className="text-white text-sm font-medium">{c.name}</div>
                <div className="text-gray-500 text-xs">{c.player} &middot; {c.sport} &middot; {c.estimatedValueRaw}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Portfolio Cards */}
      {portfolio.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-bold text-sm">Your Portfolio ({portfolio.length} cards &middot; ${totalValue.toLocaleString()} est. value)</h3>
            <button onClick={() => setPortfolio([])} className="text-xs text-gray-500 hover:text-red-400 transition-colors">Clear all</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {portfolio.map(c => (
              <div key={c.slug} className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2">
                <div>
                  <div className="text-white text-xs font-medium">{c.player}</div>
                  <div className="text-gray-500 text-[10px]">{c.year} &middot; {c.sport} &middot; {c.estimatedValueRaw}</div>
                </div>
                <button onClick={() => removeCard(c.slug)} className="text-gray-600 hover:text-red-400 text-sm ml-1">&times;</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strategy Selector */}
      <div className="mb-8">
        <h3 className="text-white font-bold text-sm mb-3">Target Strategy</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Object.entries(PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => setStrategy(key)}
              className={`text-left p-4 rounded-xl border transition-colors ${strategy === key ? 'bg-cyan-950/40 border-cyan-700/50 ring-1 ring-cyan-800/30' : 'bg-gray-900 border-gray-800 hover:border-gray-600'}`}
            >
              <div className={`font-bold text-sm ${strategy === key ? 'text-cyan-400' : 'text-white'}`}>{preset.name}</div>
              <div className="text-gray-500 text-xs mt-1">{preset.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Current vs Target — Only show with 3+ cards */}
      {portfolio.length >= 3 && (
        <>
          {/* Allocation Comparison */}
          <div className="space-y-6 mb-8">
            {/* Sport Allocation */}
            <AllocationRow
              title="Sport Allocation"
              items={[
                { label: 'Baseball', current: currentAllocation.sport.baseball, target: targetAllocation.sport.baseball, color: '#ef4444' },
                { label: 'Basketball', current: currentAllocation.sport.basketball, target: targetAllocation.sport.basketball, color: '#f97316' },
                { label: 'Football', current: currentAllocation.sport.football, target: targetAllocation.sport.football, color: '#22c55e' },
                { label: 'Hockey', current: currentAllocation.sport.hockey, target: targetAllocation.sport.hockey, color: '#3b82f6' },
              ]}
            />
            {/* Era Allocation */}
            <AllocationRow
              title="Era Allocation"
              items={[
                { label: 'Vintage (<1980)', current: currentAllocation.era.vintage, target: targetAllocation.era.vintage, color: '#a855f7' },
                { label: 'Modern (1980-2014)', current: currentAllocation.era.modern, target: targetAllocation.era.modern, color: '#06b6d4' },
                { label: 'Ultra-Modern (2015+)', current: currentAllocation.era['ultra-modern'], target: targetAllocation.era['ultra-modern'], color: '#eab308' },
              ]}
            />
            {/* Tier Allocation */}
            <AllocationRow
              title="Value Tier Allocation"
              items={[
                { label: 'Budget (<$50)', current: currentAllocation.tier.budget, target: targetAllocation.tier.budget, color: '#22d3ee' },
                { label: 'Mid-Range ($50-500)', current: currentAllocation.tier['mid-range'], target: targetAllocation.tier['mid-range'], color: '#a78bfa' },
                { label: 'Premium ($500+)', current: currentAllocation.tier.premium, target: targetAllocation.tier.premium, color: '#f472b6' },
              ]}
            />
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-8">
              <h3 className="text-white font-bold mb-4">Rebalancing Recommendations</h3>
              <div className="space-y-3">
                {recommendations.map((rec, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${
                    rec.action === 'BUY' ? 'bg-emerald-950/20 border border-emerald-800/30' :
                    rec.action === 'SELL' ? 'bg-red-950/20 border border-red-800/30' :
                    'bg-gray-800/30 border border-gray-700/30'
                  }`}>
                    <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded ${
                      rec.action === 'BUY' ? 'bg-emerald-900/60 text-emerald-400' :
                      rec.action === 'SELL' ? 'bg-red-900/60 text-red-400' :
                      'bg-gray-800 text-gray-400'
                    }`}>
                      {rec.action}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-medium">{rec.label}</span>
                        <span className="text-gray-500 text-xs">({rec.category})</span>
                      </div>
                      <div className="text-gray-400 text-xs mt-0.5">
                        Current: {rec.currentPct}% &rarr; Target: {rec.targetPct}% ({rec.gap > 0 ? '+' : ''}{rec.gap}%)
                      </div>
                      <p className="text-gray-500 text-xs mt-1">{rec.suggestion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {portfolio.length < 3 && (
        <div className="text-center py-12 bg-gray-900/50 border border-gray-800 border-dashed rounded-xl">
          <div className="text-4xl mb-3">&#9878;</div>
          <h3 className="text-white font-semibold mb-2">
            {portfolio.length === 0 ? 'Add cards to get started' : `Add ${3 - portfolio.length} more card${3 - portfolio.length > 1 ? 's' : ''} to see your allocation`}
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Search for at least 3 cards from your collection above. We will analyze your allocation and recommend rebalancing moves.
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-6 bg-amber-950/20 border border-amber-800/20 rounded-xl p-4">
        <p className="text-amber-400/70 text-xs leading-relaxed">
          <strong>Disclaimer:</strong> This tool is for entertainment and educational purposes only. It is not financial or investment advice. Card values are estimated and can change rapidly. Always do your own research.
        </p>
      </div>
    </div>
  );
}

// --- Allocation Row Component ---
function AllocationRow({ title, items }: {
  title: string;
  items: { label: string; current: number; target: number; color: string }[];
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h3 className="text-white font-bold text-sm mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map(item => {
          const diff = item.current - item.target;
          const status = Math.abs(diff) < 5 ? 'on-target' : diff > 0 ? 'overweight' : 'underweight';
          return (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-300 text-xs">{item.label}</span>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500">Current: <span className="text-white">{item.current}%</span></span>
                  <span className="text-gray-600">&rarr;</span>
                  <span className="text-gray-500">Target: <span className="text-cyan-400">{item.target}%</span></span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    status === 'on-target' ? 'bg-emerald-900/40 text-emerald-400' :
                    status === 'overweight' ? 'bg-amber-900/40 text-amber-400' :
                    'bg-red-900/40 text-red-400'
                  }`}>
                    {status === 'on-target' ? 'OK' : status === 'overweight' ? `+${diff}%` : `${diff}%`}
                  </span>
                </div>
              </div>
              <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="absolute h-full rounded-full opacity-40"
                  style={{ width: `${item.target}%`, backgroundColor: item.color }}
                />
                <div
                  className="absolute h-full rounded-full transition-all duration-500"
                  style={{ width: `${item.current}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

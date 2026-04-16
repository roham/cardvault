'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { sportsCards, type SportsCard, type Sport } from '@/data/sports-cards';

type Goal = 'max-cards' | 'best-single' | 'investment' | 'rookies' | 'set-completion' | 'diversified';

const GOALS: { id: Goal; label: string; icon: string; description: string }[] = [
  { id: 'max-cards', label: 'Maximum Cards', icon: '📦', description: 'Get the most cards for your money' },
  { id: 'best-single', label: 'Best Single Card', icon: '💎', description: 'One high-value centerpiece card' },
  { id: 'investment', label: 'Investment Portfolio', icon: '📈', description: 'Cards with the best appreciation potential' },
  { id: 'rookies', label: 'Rookie Collection', icon: '⭐', description: 'Focus on rookie cards with upside' },
  { id: 'set-completion', label: 'Set Starter', icon: '📋', description: 'Start completing a specific set' },
  { id: 'diversified', label: 'Diversified Mix', icon: '🎯', description: 'Balanced portfolio across sports and eras' },
];

const BUDGETS = [25, 50, 100, 250, 500, 1000, 2500, 5000];

function parseValue(raw: string): number {
  const match = raw.match(/\$([0-9,]+)/);
  if (!match) return 0;
  return parseInt(match[1].replace(/,/g, ''), 10);
}

function slugifyPlayer(name: string): string {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function getCardsInBudget(cards: SportsCard[], budget: number): SportsCard[] {
  return cards.filter(c => {
    const val = parseValue(c.estimatedValueRaw);
    return val > 0 && val <= budget;
  });
}

function optimizeForGoal(budget: number, goal: Goal, sportFilter: Sport | 'all'): { cards: SportsCard[]; summary: string; tips: string[] } {
  let pool = sportsCards.filter(c => {
    const val = parseValue(c.estimatedValueRaw);
    return val > 0 && val <= budget;
  });

  if (sportFilter !== 'all') {
    pool = pool.filter(c => c.sport === sportFilter);
  }

  let selected: SportsCard[] = [];
  let summary = '';
  const tips: string[] = [];

  switch (goal) {
    case 'max-cards': {
      // Sort by lowest value first, pick as many as fit in budget
      const sorted = [...pool].sort((a, b) => parseValue(a.estimatedValueRaw) - parseValue(b.estimatedValueRaw));
      let remaining = budget;
      const seen = new Set<string>();
      for (const card of sorted) {
        const val = parseValue(card.estimatedValueRaw);
        if (val <= remaining && !seen.has(card.slug)) {
          selected.push(card);
          seen.add(card.slug);
          remaining -= val;
          if (selected.length >= 20) break; // Cap display at 20
        }
      }
      summary = `${selected.length} cards for $${budget} — avg $${selected.length > 0 ? Math.round(selected.reduce((s, c) => s + parseValue(c.estimatedValueRaw), 0) / selected.length) : 0}/card`;
      tips.push('Buy in lots on eBay to save on shipping');
      tips.push('Check card shows for bulk deals on commons');
      tips.push('Sort by set to find cheap base cards');
      break;
    }
    case 'best-single': {
      // Find the single most expensive card within budget
      const sorted = [...pool].sort((a, b) => parseValue(b.estimatedValueRaw) - parseValue(a.estimatedValueRaw));
      if (sorted.length > 0) {
        selected = [sorted[0]];
        const remaining = budget - parseValue(sorted[0].estimatedValueRaw);
        // Add a few cheaper supporting cards with remaining budget
        const cheaper = sorted.filter(c => parseValue(c.estimatedValueRaw) <= remaining && c.slug !== sorted[0].slug);
        for (let i = 0; i < Math.min(3, cheaper.length); i++) {
          selected.push(cheaper[i]);
        }
      }
      summary = selected.length > 0 ? `Centerpiece: ${selected[0].name} ($${parseValue(selected[0].estimatedValueRaw)})` : 'No cards found in budget';
      tips.push('Consider buying graded for your centerpiece card');
      tips.push('Negotiate at card shows — dealers often have flexibility on high-value cards');
      tips.push('Check PSA population reports before buying — lower pop = rarer');
      break;
    }
    case 'investment': {
      // Prefer rookies with high gem-mint multipliers
      const withMultiplier = pool.map(c => {
        const raw = parseValue(c.estimatedValueRaw);
        const gem = parseValue(c.estimatedValueGem);
        return { card: c, raw, gem, multiplier: gem > 0 && raw > 0 ? gem / raw : 1 };
      }).filter(c => c.raw > 0 && c.multiplier > 2);
      withMultiplier.sort((a, b) => b.multiplier - a.multiplier);

      let remaining = budget;
      const seen = new Set<string>();
      for (const { card, raw } of withMultiplier) {
        if (raw <= remaining && !seen.has(slugifyPlayer(card.player))) {
          selected.push(card);
          seen.add(slugifyPlayer(card.player));
          remaining -= raw;
          if (selected.length >= 10) break;
        }
      }
      const avgMultiplier = selected.length > 0
        ? (selected.reduce((s, c) => s + parseValue(c.estimatedValueGem) / Math.max(1, parseValue(c.estimatedValueRaw)), 0) / selected.length).toFixed(1)
        : '0';
      summary = `${selected.length} high-upside cards — avg ${avgMultiplier}x grading multiplier`;
      tips.push('Buy raw, grade at PSA/BGS for maximum appreciation');
      tips.push('Focus on rookie cards — they have the highest ceiling');
      tips.push('Diversify across players to reduce single-player risk');
      break;
    }
    case 'rookies': {
      const rookies = pool.filter(c => c.rookie);
      const sorted = [...rookies].sort((a, b) => {
        const va = parseValue(a.estimatedValueRaw), vb = parseValue(b.estimatedValueRaw);
        return vb - va; // Highest value first
      });
      let remaining = budget;
      const seen = new Set<string>();
      for (const card of sorted) {
        const val = parseValue(card.estimatedValueRaw);
        if (val <= remaining && !seen.has(slugifyPlayer(card.player))) {
          selected.push(card);
          seen.add(slugifyPlayer(card.player));
          remaining -= val;
          if (selected.length >= 12) break;
        }
      }
      summary = `${selected.length} rookie cards from ${new Set(selected.map(c => c.sport)).size} sports`;
      tips.push('Modern rookies (2020+) have the most upside but also the most risk');
      tips.push('Vintage rookies (pre-2000) are safer long-term holds');
      tips.push('Buy before the player\'s breakout season for maximum ROI');
      break;
    }
    case 'set-completion': {
      // Find the set with the most affordable cards in budget
      const setCounts = new Map<string, { cards: SportsCard[]; total: number }>();
      for (const card of pool) {
        const val = parseValue(card.estimatedValueRaw);
        const existing = setCounts.get(card.set);
        if (existing) {
          existing.cards.push(card);
          existing.total += val;
        } else {
          setCounts.set(card.set, { cards: [card], total: val });
        }
      }
      // Find set where total cost <= budget and has most cards
      let bestSet = '';
      let bestCards: SportsCard[] = [];
      for (const [setName, data] of setCounts.entries()) {
        if (data.total <= budget && data.cards.length > bestCards.length) {
          bestSet = setName;
          bestCards = data.cards;
        }
      }
      if (bestCards.length === 0) {
        // Fallback: get most cards from any set within budget
        for (const [setName, data] of setCounts.entries()) {
          const affordable = data.cards.filter(c => parseValue(c.estimatedValueRaw) <= budget / 3);
          if (affordable.length > bestCards.length) {
            bestSet = setName;
            bestCards = affordable.slice(0, 10);
          }
        }
      }
      selected = bestCards.slice(0, 15);
      summary = bestSet ? `${selected.length} cards from ${bestSet}` : 'No complete sets found in budget';
      tips.push('Start with base cards — they are cheapest and form the foundation');
      tips.push('Track your set completion on CardVault\'s Set Checklist tool');
      tips.push('Buy the expensive cards first — prices tend to rise as sets age');
      break;
    }
    case 'diversified': {
      // One card per sport, mix of eras and values
      const sports: Sport[] = ['baseball', 'basketball', 'football', 'hockey'];
      let remaining = budget;
      const perSport = Math.floor(budget / sports.length);
      for (const sport of sports) {
        const sportCards = pool.filter(c => c.sport === sport && parseValue(c.estimatedValueRaw) <= perSport);
        if (sportCards.length === 0) continue;
        // Pick one high, one mid, one low from each sport
        const sorted = [...sportCards].sort((a, b) => parseValue(b.estimatedValueRaw) - parseValue(a.estimatedValueRaw));
        const seen = new Set<string>();
        let sportBudget = perSport;
        for (const card of sorted) {
          const val = parseValue(card.estimatedValueRaw);
          if (val <= sportBudget && !seen.has(slugifyPlayer(card.player))) {
            selected.push(card);
            seen.add(slugifyPlayer(card.player));
            sportBudget -= val;
            if (selected.length % 3 === 0) break; // Max 3 per sport
          }
        }
      }
      summary = `${selected.length} cards across ${new Set(selected.map(c => c.sport)).size} sports`;
      tips.push('Diversification reduces risk — if one sport dips, others may hold');
      tips.push('Mix modern and vintage for a balanced portfolio');
      tips.push('Rebalance quarterly based on market trends');
      break;
    }
  }

  return { cards: selected, summary, tips };
}

const sportColors: Record<string, string> = {
  baseball: 'text-red-400 bg-red-950/50 border-red-800/30',
  basketball: 'text-orange-400 bg-orange-950/50 border-orange-800/30',
  football: 'text-blue-400 bg-blue-950/50 border-blue-800/30',
  hockey: 'text-cyan-400 bg-cyan-950/50 border-cyan-800/30',
};

const sportLabels: Record<string, string> = {
  baseball: 'MLB', basketball: 'NBA', football: 'NFL', hockey: 'NHL',
};

export default function BudgetOptimizerClient() {
  const [mounted, setMounted] = useState(false);
  const [budget, setBudget] = useState(100);
  const [customBudget, setCustomBudget] = useState('');
  const [goal, setGoal] = useState<Goal>('investment');
  const [sportFilter, setSportFilter] = useState<Sport | 'all'>('all');
  const [showResults, setShowResults] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const effectiveBudget = customBudget ? parseInt(customBudget, 10) || budget : budget;

  const result = useMemo(() => {
    if (!showResults) return null;
    return optimizeForGoal(effectiveBudget, goal, sportFilter);
  }, [showResults, effectiveBudget, goal, sportFilter]);

  const totalCost = result ? result.cards.reduce((s, c) => s + parseValue(c.estimatedValueRaw), 0) : 0;
  const totalGemValue = result ? result.cards.reduce((s, c) => s + parseValue(c.estimatedValueGem), 0) : 0;

  const handleOptimize = useCallback(() => {
    setShowResults(true);
  }, []);

  if (!mounted) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  return (
    <div>
      {/* Budget selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Your Budget</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {BUDGETS.map(b => (
            <button
              key={b}
              onClick={() => { setBudget(b); setCustomBudget(''); setShowResults(false); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${budget === b && !customBudget ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              ${b.toLocaleString()}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm">Custom:</span>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={customBudget}
              onChange={e => { setCustomBudget(e.target.value); setShowResults(false); }}
              placeholder="Enter amount"
              className="pl-7 pr-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm w-36 focus:outline-none focus:border-amber-600"
            />
          </div>
        </div>
      </div>

      {/* Goal selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Your Goal</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {GOALS.map(g => (
            <button
              key={g.id}
              onClick={() => { setGoal(g.id); setShowResults(false); }}
              className={`p-3 rounded-xl text-left transition-colors border ${goal === g.id ? 'bg-amber-950/50 border-amber-600/50 ring-1 ring-amber-600/30' : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600'}`}
            >
              <div className="text-lg mb-1">{g.icon}</div>
              <div className="text-sm font-medium text-white">{g.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{g.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Sport filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Sport Filter</label>
        <div className="flex flex-wrap gap-2">
          {(['all', 'baseball', 'basketball', 'football', 'hockey'] as const).map(s => (
            <button
              key={s}
              onClick={() => { setSportFilter(s); setShowResults(false); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${sportFilter === s ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              {s === 'all' ? 'All Sports' : sportLabels[s] || s}
            </button>
          ))}
        </div>
      </div>

      {/* Optimize button */}
      <button
        onClick={handleOptimize}
        className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-colors text-lg"
      >
        Optimize My ${effectiveBudget.toLocaleString()} Budget
      </button>

      {/* Results */}
      {result && (
        <div className="mt-8">
          {/* Summary */}
          <div className="bg-gradient-to-r from-amber-950/50 to-yellow-950/30 border border-amber-800/50 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-bold text-amber-400 mb-2">
              {GOALS.find(g => g.id === goal)?.icon} {GOALS.find(g => g.id === goal)?.label} — ${effectiveBudget.toLocaleString()}
            </h3>
            <p className="text-gray-300 text-sm">{result.summary}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm">
              <div>
                <span className="text-gray-500">Est. Cost:</span>{' '}
                <span className="text-white font-mono">${totalCost.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-500">Gem Mint Value:</span>{' '}
                <span className="text-emerald-400 font-mono">${totalGemValue.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-500">Upside:</span>{' '}
                <span className="text-amber-400 font-mono">{totalCost > 0 ? ((totalGemValue / totalCost) * 100 - 100).toFixed(0) : 0}%</span>
              </div>
              <div>
                <span className="text-gray-500">Remaining:</span>{' '}
                <span className="text-gray-300 font-mono">${(effectiveBudget - totalCost).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Card list */}
          {result.cards.length > 0 ? (
            <div className="space-y-3">
              {result.cards.map((card, i) => {
                const rawVal = parseValue(card.estimatedValueRaw);
                const gemVal = parseValue(card.estimatedValueGem);
                const multiplier = rawVal > 0 ? (gemVal / rawVal).toFixed(1) : '—';
                return (
                  <div key={card.slug} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-3 sm:p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-gray-500 text-xs font-mono mt-1">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link href={`/sports/${card.slug}`} className="text-white font-medium text-sm hover:text-amber-400 transition-colors">
                            {card.name}
                          </Link>
                          {card.rookie && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-amber-900/50 text-amber-400 rounded font-medium">RC</span>
                          )}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${sportColors[card.sport]}`}>
                            {sportLabels[card.sport]}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs">
                          <span className="text-gray-400">Raw: <span className="text-white">{card.estimatedValueRaw}</span></span>
                          <span className="text-gray-400">Gem: <span className="text-emerald-400">{card.estimatedValueGem}</span></span>
                          <span className="text-gray-400">Multiplier: <span className="text-amber-400">{multiplier}x</span></span>
                        </div>
                        <Link href={`/players/${slugifyPlayer(card.player)}`} className="text-gray-500 text-xs hover:text-gray-300 transition-colors mt-1 block">
                          {card.player} &middot; {card.year} &middot; {card.set}
                        </Link>
                      </div>
                      <a href={card.ebaySearchUrl} target="_blank" rel="noopener noreferrer" className="text-xs bg-blue-900/40 text-blue-400 px-2 py-1 rounded hover:bg-blue-800/40 transition-colors shrink-0">
                        Buy
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No cards found matching your budget and filters. Try increasing your budget or changing the sport filter.
            </div>
          )}

          {/* Tips */}
          {result.tips.length > 0 && (
            <div className="mt-6 bg-gray-800/40 border border-gray-700/50 rounded-xl p-4">
              <h4 className="text-sm font-bold text-white mb-2">💡 Buying Tips</h4>
              <ul className="space-y-1.5">
                {result.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sport breakdown */}
          <div className="mt-6 bg-gray-800/40 border border-gray-700/50 rounded-xl p-4">
            <h4 className="text-sm font-bold text-white mb-3">Portfolio Breakdown</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['baseball', 'basketball', 'football', 'hockey'] as Sport[]).map(sport => {
                const sportCards = result.cards.filter(c => c.sport === sport);
                const sportTotal = sportCards.reduce((s, c) => s + parseValue(c.estimatedValueRaw), 0);
                return (
                  <div key={sport} className="text-center">
                    <div className={`text-lg font-bold ${sportCards.length > 0 ? 'text-white' : 'text-gray-600'}`}>
                      {sportCards.length}
                    </div>
                    <div className="text-xs text-gray-500">{sportLabels[sport]} cards</div>
                    {sportTotal > 0 && (
                      <div className="text-xs text-gray-400 mt-0.5">${sportTotal.toLocaleString()}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Related tools */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { href: '/tools/budget-planner', title: 'Budget Planner', desc: 'Monthly budget allocation' },
          { href: '/tools/investment-calc', title: 'Investment Calc', desc: 'Card ROI vs stocks & gold' },
          { href: '/tools/grading-roi', title: 'Grading ROI', desc: 'Is grading worth it?' },
          { href: '/tools/flip-calc', title: 'Flip Calculator', desc: 'Calculate flip profit' },
          { href: '/tools/wax-vs-singles', title: 'Wax vs Singles', desc: 'Buy sealed or singles?' },
          { href: '/tools/sealed-ev', title: 'Sealed EV', desc: 'Expected value per box' },
        ].map(link => (
          <Link key={link.href} href={link.href} className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2.5 hover:border-gray-600 transition-colors">
            <div className="text-sm font-medium text-white">{link.title}</div>
            <div className="text-xs text-gray-500">{link.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

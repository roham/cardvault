'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

function parseValue(s: string): number {
  const m = s.match(/\$([0-9,.]+)/);
  if (!m) return 0;
  return parseFloat(m[1].replace(/,/g, '')) || 0;
}

function fmt(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

// Heat factors based on card attributes
function computeHeatScore(card: typeof sportsCards[0]): {
  score: number;
  factors: { name: string; score: number; desc: string }[];
  action: string;
} {
  const factors: { name: string; score: number; desc: string }[] = [];
  const rawVal = parseValue(card.estimatedValueRaw);
  const gemVal = parseValue(card.estimatedValueGem);
  const currentYear = 2026;
  const cardAge = currentYear - card.year;

  // Rookie premium
  if (card.rookie) {
    factors.push({ name: 'Rookie Status', score: 20, desc: 'Rookie cards command premium pricing' });
  } else {
    factors.push({ name: 'Non-Rookie', score: 5, desc: 'Base/veteran cards have steadier but lower heat' });
  }

  // Recency (newer = hotter for modern)
  if (cardAge <= 2) {
    factors.push({ name: 'Recent Release', score: 18, desc: 'Released in last 2 years — peak demand window' });
  } else if (cardAge <= 5) {
    factors.push({ name: 'Modern Card', score: 12, desc: '3-5 years old — still in active demand cycle' });
  } else if (cardAge <= 20) {
    factors.push({ name: 'Mid-Era', score: 8, desc: 'Settled market — less volatile' });
  } else {
    factors.push({ name: 'Vintage', score: 15, desc: 'Vintage cards have steady collector demand' });
  }

  // Grade multiplier (gem/raw ratio = grading heat)
  const mult = gemVal > 0 && rawVal > 0 ? gemVal / rawVal : 1;
  if (mult >= 10) {
    factors.push({ name: 'High Grade Premium', score: 20, desc: `${mult.toFixed(0)}x gem multiplier — huge grading upside` });
  } else if (mult >= 5) {
    factors.push({ name: 'Good Grade Premium', score: 14, desc: `${mult.toFixed(0)}x multiplier — grading adds real value` });
  } else {
    factors.push({ name: 'Low Grade Premium', score: 6, desc: `${mult.toFixed(1)}x multiplier — grading impact is modest` });
  }

  // Value tier (higher value = more collector interest)
  if (rawVal >= 500) {
    factors.push({ name: 'High Value', score: 18, desc: `${fmt(rawVal)} raw — premium collector tier` });
  } else if (rawVal >= 100) {
    factors.push({ name: 'Mid Value', score: 14, desc: `${fmt(rawVal)} raw — solid collector card` });
  } else if (rawVal >= 20) {
    factors.push({ name: 'Entry Level', score: 10, desc: `${fmt(rawVal)} raw — accessible price point drives volume` });
  } else {
    factors.push({ name: 'Low Value', score: 4, desc: `${fmt(rawVal)} raw — commons have limited upside` });
  }

  // Sport seasonality (rough: April = baseball hot, Jan = football playoffs)
  const month = new Date().getMonth(); // 0-indexed
  const sportSeasonality: Record<string, number> = {
    baseball: [8, 6, 10, 16, 16, 14, 14, 12, 12, 14, 8, 6][month],
    basketball: [12, 12, 14, 16, 14, 8, 6, 6, 8, 12, 14, 14][month],
    football: [10, 14, 10, 8, 14, 12, 10, 12, 16, 14, 14, 12][month],
    hockey: [12, 12, 14, 16, 14, 14, 6, 6, 8, 12, 14, 14][month],
  };
  const seasonal = sportSeasonality[card.sport] || 10;
  factors.push({ name: `${card.sport.charAt(0).toUpperCase() + card.sport.slice(1)} Season`, score: seasonal, desc: seasonal >= 14 ? 'In-season demand boost' : seasonal >= 10 ? 'Moderate seasonal interest' : 'Off-season — lower demand' });

  const totalScore = Math.min(100, factors.reduce((s, f) => s + f.score, 0));

  const action = totalScore >= 75 ? 'SELL NOW — Peak heat, maximize value'
    : totalScore >= 55 ? 'HOLD — Good position, watch for catalysts'
    : totalScore >= 35 ? 'HOLD or BUY — Moderate heat, potential upside'
    : 'BUY THE DIP — Low heat = opportunity';

  return { score: totalScore, factors, action };
}

function getHeatColor(score: number): string {
  if (score >= 80) return 'text-red-400';
  if (score >= 60) return 'text-orange-400';
  if (score >= 40) return 'text-yellow-400';
  if (score >= 20) return 'text-blue-400';
  return 'text-gray-400';
}

function getHeatBg(score: number): string {
  if (score >= 80) return 'bg-red-950/50 border-red-800/50';
  if (score >= 60) return 'bg-orange-950/50 border-orange-800/50';
  if (score >= 40) return 'bg-yellow-950/50 border-yellow-800/50';
  if (score >= 20) return 'bg-blue-950/50 border-blue-800/50';
  return 'bg-gray-900/50 border-gray-800/50';
}

function getHeatLabel(score: number): string {
  if (score >= 80) return 'FIRE';
  if (score >= 60) return 'HOT';
  if (score >= 40) return 'WARM';
  if (score >= 20) return 'COOL';
  return 'COLD';
}

export default function HeatScore() {
  const [query, setQuery] = useState('');
  const [selectedCards, setSelectedCards] = useState<typeof sportsCards[0][]>([]);

  const filtered = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return sportsCards.filter(c =>
      c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [query]);

  const addCard = (card: typeof sportsCards[0]) => {
    if (!selectedCards.find(c => c.slug === card.slug)) {
      setSelectedCards([...selectedCards, card]);
    }
    setQuery('');
  };

  const removeCard = (slug: string) => {
    setSelectedCards(selectedCards.filter(c => c.slug !== slug));
  };

  const results = useMemo(() => {
    return selectedCards.map(card => ({
      card,
      heat: computeHeatScore(card),
    }));
  }, [selectedCards]);

  const avgScore = results.length > 0 ? results.reduce((s, r) => s + r.heat.score, 0) / results.length : 0;
  const hottest = results.length > 0 ? results.reduce((best, r) => r.heat.score > best.heat.score ? r : best) : null;
  const coldest = results.length > 0 ? results.reduce((worst, r) => r.heat.score < worst.heat.score ? r : worst) : null;

  return (
    <div className="space-y-8">
      {/* Card Search */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Add Cards to Analyze</h2>
        <div className="relative">
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search 5,300+ cards... (e.g., Ohtani Chrome RC)"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
          {filtered.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg max-h-64 overflow-y-auto">
              {filtered.map(c => (
                <button key={c.slug} onClick={() => addCard(c)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors border-b border-gray-700/50 last:border-0"
                >
                  <div className="text-white text-sm font-medium">{c.name}</div>
                  <div className="text-gray-400 text-xs">{c.player} &middot; {c.sport} &middot; Raw: {c.estimatedValueRaw}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        {selectedCards.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedCards.map(c => (
              <div key={c.slug} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-800 border border-gray-700 rounded-full text-sm text-gray-300">
                <span className="truncate max-w-[200px]">{c.player} ({c.year})</span>
                <button onClick={() => removeCard(c.slug)} className="text-gray-500 hover:text-red-400 ml-1">x</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Collection Overview */}
      {results.length > 0 && (
        <>
          <div className={`border rounded-xl p-6 ${getHeatBg(avgScore)}`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="text-gray-400 text-sm">Collection Heat Score</div>
                <div className={`text-4xl font-black ${getHeatColor(avgScore)}`}>
                  {Math.round(avgScore)}/100 <span className="text-lg">{getHeatLabel(avgScore)}</span>
                </div>
              </div>
              <div className="text-right text-sm">
                <div className="text-gray-400">{results.length} cards analyzed</div>
                {hottest && <div className="text-orange-400 mt-1">Hottest: {hottest.card.player} ({hottest.heat.score})</div>}
                {coldest && coldest !== hottest && <div className="text-blue-400">Coldest: {coldest.card.player} ({coldest.heat.score})</div>}
              </div>
            </div>
          </div>

          {/* Per-Card Scores */}
          <div className="space-y-4">
            {results.sort((a, b) => b.heat.score - a.heat.score).map(({ card, heat }) => (
              <div key={card.slug} className={`border rounded-xl p-4 ${getHeatBg(heat.score)}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-white font-semibold text-sm">{card.name}</div>
                    <div className="text-gray-400 text-xs mt-0.5">{card.player} &middot; {card.sport} &middot; Raw: {card.estimatedValueRaw}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-black ${getHeatColor(heat.score)}`}>{heat.score}</div>
                    <div className={`text-xs ${getHeatColor(heat.score)}`}>{getHeatLabel(heat.score)}</div>
                  </div>
                </div>

                {/* Heat bar */}
                <div className="w-full bg-gray-800 rounded-full h-2 mb-3">
                  <div className={`h-2 rounded-full transition-all ${
                    heat.score >= 80 ? 'bg-red-500' : heat.score >= 60 ? 'bg-orange-500' : heat.score >= 40 ? 'bg-yellow-500' : heat.score >= 20 ? 'bg-blue-500' : 'bg-gray-500'
                  }`} style={{ width: `${heat.score}%` }} />
                </div>

                {/* Factors */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                  {heat.factors.map(f => (
                    <div key={f.name} className="text-xs">
                      <span className="text-gray-400">{f.name}: </span>
                      <span className="text-white font-medium">{f.score}pts</span>
                    </div>
                  ))}
                </div>

                {/* Action */}
                <div className="text-sm font-medium text-indigo-400">{heat.action}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Related Tools */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
        <h3 className="text-white font-bold mb-4">Related Tools</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { href: '/tools/seasonality', label: 'Market Seasonality', desc: 'Best times to buy/sell each sport' },
            { href: '/tools/investment-calc', label: 'Investment Calculator', desc: 'Annualized returns analysis' },
            { href: '/tools/diversification', label: 'Diversification Analyzer', desc: 'Portfolio balance check' },
            { href: '/tools/grade-value-chart', label: 'Grade Value Chart', desc: 'Value at every PSA grade' },
            { href: '/tools/flip-calc', label: 'Flip Profit Calculator', desc: 'Calculate per-card profit' },
            { href: '/tools/grading-probability', label: 'Grading Probability', desc: 'Should you grade this card?' },
          ].map(t => (
            <Link key={t.href} href={t.href}
              className="p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <div className="text-white text-sm font-medium">{t.label}</div>
              <div className="text-gray-500 text-xs mt-1">{t.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

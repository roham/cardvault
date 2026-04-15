'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

function parseValue(s: string): number {
  const m = s.match(/\$([0-9,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function fmt(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return `$${n.toLocaleString()}`;
}

const SPORT_COLORS: Record<string, string> = {
  baseball: 'bg-red-900/30 border-red-800/50 text-red-400',
  basketball: 'bg-orange-900/30 border-orange-800/50 text-orange-400',
  football: 'bg-green-900/30 border-green-800/50 text-green-400',
  hockey: 'bg-blue-900/30 border-blue-800/50 text-blue-400',
};

const DIMENSIONS = [
  { key: 'sport', label: 'Sport' },
  { key: 'year', label: 'Year' },
  { key: 'set', label: 'Set' },
  { key: 'rookie', label: 'Rookie?' },
  { key: 'rawValue', label: 'Raw Value' },
  { key: 'gemValue', label: 'Gem Mint Value' },
  { key: 'gradeMultiplier', label: 'Grade Multiplier' },
  { key: 'age', label: 'Card Age' },
  { key: 'era', label: 'Era' },
] as const;

type Dim = typeof DIMENSIONS[number]['key'];

export default function CompareMatrix() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  const results = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return sportsCards
      .filter(c => !selected.includes(c.slug) && (c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q)))
      .slice(0, 6);
  }, [query, selected]);

  const cards = useMemo(() => selected.map(s => sportsCards.find(c => c.slug === s)).filter(Boolean) as typeof sportsCards, [selected]);

  const addCard = (slug: string) => {
    if (selected.length < 5 && !selected.includes(slug)) {
      setSelected([...selected, slug]);
      setQuery('');
      setShowSearch(false);
    }
  };

  const removeCard = (slug: string) => setSelected(selected.filter(s => s !== slug));

  const getVal = (card: typeof sportsCards[0], dim: Dim): string => {
    const raw = parseValue(card.estimatedValueRaw);
    const gem = parseValue(card.estimatedValueGem);
    const age = 2026 - card.year;
    switch (dim) {
      case 'sport': return card.sport.charAt(0).toUpperCase() + card.sport.slice(1);
      case 'year': return String(card.year);
      case 'set': return card.set;
      case 'rookie': return card.rookie ? 'Yes' : 'No';
      case 'rawValue': return fmt(raw);
      case 'gemValue': return fmt(gem);
      case 'gradeMultiplier': return raw > 0 ? `${(gem / raw).toFixed(1)}x` : 'N/A';
      case 'age': return `${age} years`;
      case 'era': return card.year < 1950 ? 'Pre-War' : card.year < 1970 ? 'Golden Age' : card.year < 1981 ? 'Vintage' : card.year < 1994 ? 'Junk Wax' : card.year < 2011 ? 'Modern' : 'Ultra-Modern';
      default: return '';
    }
  };

  const getBest = (dim: Dim): string | null => {
    if (cards.length < 2) return null;
    const vals = cards.map(c => {
      const raw = parseValue(c.estimatedValueRaw);
      const gem = parseValue(c.estimatedValueGem);
      switch (dim) {
        case 'rawValue': return raw;
        case 'gemValue': return gem;
        case 'gradeMultiplier': return raw > 0 ? gem / raw : 0;
        case 'age': return 2026 - c.year;
        case 'rookie': return c.rookie ? 1 : 0;
        default: return 0;
      }
    });
    if (['sport', 'year', 'set', 'era'].includes(dim)) return null;
    const maxIdx = vals.indexOf(Math.max(...vals));
    return cards[maxIdx]?.slug ?? null;
  };

  return (
    <div>
      {/* Card slots */}
      <div className="flex flex-wrap gap-3 mb-6">
        {cards.map(c => (
          <div key={c.slug} className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${SPORT_COLORS[c.sport] || 'bg-gray-800 border-gray-700 text-gray-300'}`}>
            <span className="text-sm font-medium truncate max-w-48">{c.player}</span>
            <span className="text-xs opacity-60">{c.year}</span>
            <button onClick={() => removeCard(c.slug)} className="text-gray-500 hover:text-red-400 text-lg leading-none">&times;</button>
          </div>
        ))}
        {selected.length < 5 && (
          <button onClick={() => setShowSearch(true)} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-dashed border-gray-600 rounded-xl text-gray-400 text-sm transition-colors">
            + Add Card ({5 - selected.length} remaining)
          </button>
        )}
      </div>

      {/* Search */}
      {showSearch && (
        <div className="mb-6">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by player name or card name..."
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            autoFocus
          />
          {results.length > 0 && (
            <div className="mt-2 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
              {results.map(c => (
                <button key={c.slug} onClick={() => addCard(c.slug)} className="w-full text-left px-4 py-2.5 hover:bg-gray-700 border-b border-gray-700/50 last:border-0 transition-colors">
                  <span className="text-white text-sm">{c.name}</span>
                  <span className="text-gray-500 text-xs ml-2">{c.sport}</span>
                </button>
              ))}
            </div>
          )}
          <button onClick={() => { setShowSearch(false); setQuery(''); }} className="mt-2 text-gray-500 text-sm hover:text-gray-300">Cancel</button>
        </div>
      )}

      {/* Comparison table */}
      {cards.length >= 2 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-x-auto mb-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left px-4 py-3 text-gray-500 font-medium w-36">Dimension</th>
                {cards.map(c => (
                  <th key={c.slug} className="text-left px-4 py-3">
                    <Link href={`/sports/${c.slug}`} className="text-blue-400 hover:underline font-medium text-xs">{c.player}</Link>
                    <div className="text-gray-600 text-xs">{c.year}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {DIMENSIONS.map(d => {
                const best = getBest(d.key);
                return (
                  <tr key={d.key}>
                    <td className="px-4 py-2.5 text-gray-400 font-medium">{d.label}</td>
                    {cards.map(c => (
                      <td key={c.slug} className={`px-4 py-2.5 ${best === c.slug ? 'text-emerald-400 font-semibold' : 'text-white'}`}>
                        {getVal(c, d.key)}
                        {best === c.slug && <span className="ml-1 text-xs">&#x2713;</span>}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Verdict */}
      {cards.length >= 2 && (
        <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-xl p-4 mb-8">
          <h3 className="text-emerald-400 font-semibold mb-2">Quick Verdict</h3>
          {(() => {
            const scored = cards.map(c => ({
              slug: c.slug,
              player: c.player,
              score: parseValue(c.estimatedValueGem) + (c.rookie ? 50 : 0) + (2026 - c.year > 20 ? 30 : 0),
            }));
            const winner = scored.reduce((a, b) => a.score > b.score ? a : b);
            return <p className="text-gray-400 text-sm"><strong className="text-white">{winner.player}</strong> scores highest based on gem value, rookie premium, and vintage factor. Use the detailed breakdown above to compare on the dimensions that matter most to you.</p>;
          })()}
        </div>
      )}

      {/* Empty state */}
      {cards.length < 2 && (
        <div className="text-center py-16 text-gray-500">
          <div className="text-4xl mb-3">&#x2696;&#xFE0F;</div>
          <p className="text-lg">Add at least 2 cards to compare them side by side</p>
          <p className="text-sm mt-2">Compare up to 5 cards across 9 dimensions</p>
        </div>
      )}

      {/* Related tools */}
      <div className="mt-10 pt-6 border-t border-gray-800">
        <h3 className="text-white font-semibold mb-3">Related Tools</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/tools/head-to-head', label: 'Head-to-Head' },
            { href: '/tools/grade-value-chart', label: 'Grade Value Chart' },
            { href: '/tools/rarity-score', label: 'Rarity Score' },
            { href: '/tools/investment-calc', label: 'Investment Calculator' },
            { href: '/tools/grading-roi', label: 'Grading ROI' },
            { href: '/tools/compare', label: 'Player Compare' },
          ].map(t => (
            <Link key={t.href} href={t.href} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-lg text-sm transition-colors">
              {t.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

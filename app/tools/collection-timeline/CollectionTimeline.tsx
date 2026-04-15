'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

interface Era {
  name: string;
  start: number;
  end: number;
  color: string;
  bg: string;
  desc: string;
}

const ERAS: Era[] = [
  { name: 'Pre-War', start: 1900, end: 1941, color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-800/40', desc: 'T-cards, tobacco era, extreme scarcity' },
  { name: 'Golden Age', start: 1948, end: 1959, color: 'text-yellow-400', bg: 'bg-yellow-950/40 border-yellow-800/40', desc: 'Topps/Bowman debut, iconic rookie cards' },
  { name: 'Post-War', start: 1960, end: 1972, color: 'text-orange-400', bg: 'bg-orange-950/40 border-orange-800/40', desc: 'Expansion era, rising hobby awareness' },
  { name: 'Vintage', start: 1973, end: 1980, color: 'text-red-400', bg: 'bg-red-950/40 border-red-800/40', desc: 'Last pre-boom era, strong long-term holds' },
  { name: 'Junk Wax', start: 1981, end: 1994, color: 'text-pink-400', bg: 'bg-pink-950/40 border-pink-800/40', desc: 'Mass production era, key rookies still valuable' },
  { name: 'Modern', start: 1995, end: 2015, color: 'text-blue-400', bg: 'bg-blue-950/40 border-blue-800/40', desc: 'Insert cards, refractors, serial numbering' },
  { name: 'Ultra-Modern', start: 2016, end: 2026, color: 'text-violet-400', bg: 'bg-violet-950/40 border-violet-800/40', desc: 'Current hobby boom, Prizm/Optic dominance' },
];

function getEra(year: number): Era | undefined {
  return ERAS.find(e => year >= e.start && year <= e.end);
}

function parseValue(s: string): number {
  const m = s.match(/\$([0-9,.]+)/);
  if (!m) return 0;
  return parseFloat(m[1].replace(/,/g, '')) || 0;
}

function fmt(n: number): string {
  if (n >= 10000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

export default function CollectionTimeline() {
  const [query, setQuery] = useState('');
  const [selectedCards, setSelectedCards] = useState<typeof sportsCards[0][]>([]);

  const filtered = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return sportsCards.filter(c =>
      c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q)
    ).slice(0, 8);
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

  const clearAll = () => setSelectedCards([]);

  // Group by decade
  const byDecade = useMemo(() => {
    const map = new Map<number, typeof sportsCards[0][]>();
    for (const card of selectedCards) {
      const decade = Math.floor(card.year / 10) * 10;
      if (!map.has(decade)) map.set(decade, []);
      map.get(decade)!.push(card);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [selectedCards]);

  // Era coverage
  const eraCoverage = useMemo(() => {
    return ERAS.map(era => {
      const cards = selectedCards.filter(c => c.year >= era.start && c.year <= era.end);
      const dbCards = sportsCards.filter(c => c.year >= era.start && c.year <= era.end);
      return {
        era,
        count: cards.length,
        dbCount: dbCards.length,
        pct: selectedCards.length > 0 ? (cards.length / selectedCards.length) * 100 : 0,
      };
    });
  }, [selectedCards]);

  // Stats
  const totalValue = selectedCards.reduce((s, c) => s + parseValue(c.estimatedValueRaw), 0);
  const oldestCard = selectedCards.length > 0 ? selectedCards.reduce((o, c) => c.year < o.year ? c : o) : null;
  const newestCard = selectedCards.length > 0 ? selectedCards.reduce((n, c) => c.year > n.year ? c : n) : null;
  const mostValuable = selectedCards.length > 0 ? selectedCards.reduce((v, c) => parseValue(c.estimatedValueRaw) > parseValue(v.estimatedValueRaw) ? c : v) : null;
  const sportCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of selectedCards) {
      counts[c.sport] = (counts[c.sport] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [selectedCards]);
  const rookieCount = selectedCards.filter(c => c.rookie).length;
  const yearSpan = oldestCard && newestCard ? newestCard.year - oldestCard.year : 0;

  // Collection personality
  const personality = useMemo(() => {
    if (selectedCards.length < 3) return null;
    const vintageCount = selectedCards.filter(c => c.year < 1990).length;
    const modernCount = selectedCards.filter(c => c.year >= 2020).length;
    const rookiePct = rookieCount / selectedCards.length;
    const highValueCount = selectedCards.filter(c => parseValue(c.estimatedValueRaw) >= 100).length;

    if (vintageCount >= selectedCards.length * 0.5) return { label: 'Vintage Connoisseur', desc: 'You appreciate the history and scarcity of classic cards.', emoji: '\uD83C\uDFDB\uFE0F' };
    if (modernCount >= selectedCards.length * 0.7) return { label: 'Modern Chaser', desc: 'You follow current players and the latest releases.', emoji: '\u26A1' };
    if (rookiePct >= 0.6) return { label: 'Rookie Hunter', desc: 'You chase first-year cards for maximum upside.', emoji: '\uD83C\uDFAF' };
    if (highValueCount >= selectedCards.length * 0.5) return { label: 'High Roller', desc: 'You gravitate toward premium, high-value cards.', emoji: '\uD83D\uDCB0' };
    if (yearSpan >= 40) return { label: 'Era Spanner', desc: 'Your collection bridges generations of the hobby.', emoji: '\uD83C\uDF0D' };
    if (sportCounts.length >= 3) return { label: 'Cross-Sport Collector', desc: 'You diversify across multiple sports.', emoji: '\uD83C\uDFC6' };
    return { label: 'Balanced Builder', desc: 'A well-rounded approach to collecting.', emoji: '\u2696\uFE0F' };
  }, [selectedCards, rookieCount, yearSpan, sportCounts]);

  return (
    <div className="space-y-8">
      {/* Search */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">Add Cards to Timeline</h2>
          {selectedCards.length > 0 && (
            <button onClick={clearAll} className="text-xs text-red-400 hover:text-red-300 transition-colors">
              Clear All ({selectedCards.length})
            </button>
          )}
        </div>
        <div className="relative">
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search 5,500+ cards... (e.g., Mantle 1952, Ohtani Chrome)"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500" />
          {filtered.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg max-h-64 overflow-y-auto">
              {filtered.map(c => (
                <button key={c.slug} onClick={() => addCard(c)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors border-b border-gray-700/50 last:border-0">
                  <div className="text-white text-sm font-medium">{c.name}</div>
                  <div className="text-gray-500 text-xs">{c.player} &middot; {c.sport} &middot; {c.year} &middot; {c.estimatedValueRaw}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      {selectedCards.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{selectedCards.length}</div>
            <div className="text-xs text-gray-500">Cards</div>
          </div>
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-violet-400">{yearSpan}yr</div>
            <div className="text-xs text-gray-500">Year Span</div>
          </div>
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">{fmt(totalValue)}</div>
            <div className="text-xs text-gray-500">Est. Value</div>
          </div>
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-amber-400">{rookieCount}</div>
            <div className="text-xs text-gray-500">Rookies</div>
          </div>
        </div>
      )}

      {/* Personality Badge */}
      {personality && (
        <div className="bg-violet-950/30 border border-violet-800/40 rounded-xl p-4 flex items-center gap-4">
          <div className="text-3xl">{personality.emoji}</div>
          <div>
            <div className="text-violet-400 font-bold">{personality.label}</div>
            <div className="text-gray-400 text-sm">{personality.desc}</div>
          </div>
        </div>
      )}

      {/* Visual Timeline */}
      {byDecade.length > 0 && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-6">Your Collection Timeline</h2>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-700" />

            {byDecade.map(([decade, cards]) => {
              const era = getEra(decade + 5);
              return (
                <div key={decade} className="relative pl-12 pb-8 last:pb-0">
                  {/* Timeline dot */}
                  <div className={`absolute left-2.5 top-1 w-3 h-3 rounded-full border-2 ${era ? era.color.replace('text-', 'border-') : 'border-gray-500'} bg-gray-900`} />

                  {/* Decade header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-white font-bold text-lg">{decade}s</div>
                    {era && <span className={`text-xs px-2 py-0.5 rounded-full ${era.bg} ${era.color}`}>{era.name}</span>}
                    <span className="text-gray-500 text-xs">{cards.length} card{cards.length !== 1 ? 's' : ''}</span>
                  </div>

                  {/* Cards in decade */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {cards.sort((a, b) => a.year - b.year).map(card => (
                      <div key={card.slug} className="flex items-center gap-3 bg-gray-800/50 border border-gray-700/50 rounded-lg p-2 group">
                        <div className="flex-1 min-w-0">
                          <Link href={`/sports/cards/${card.slug}`} className="text-white text-sm font-medium hover:text-violet-400 truncate block">
                            {card.name}
                          </Link>
                          <div className="text-gray-500 text-xs truncate">
                            {card.player} &middot; {card.estimatedValueRaw}
                            {card.rookie && <span className="ml-1 text-amber-400">RC</span>}
                          </div>
                        </div>
                        <button onClick={() => removeCard(card.slug)}
                          className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-sm flex-shrink-0">
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Era Coverage */}
      {selectedCards.length > 0 && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Era Coverage</h2>
          <div className="space-y-3">
            {eraCoverage.map((ec, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <span className={ec.era.color}>{ec.era.name}</span>
                    <span className="text-gray-600 text-xs">({ec.era.start}-{ec.era.end})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={ec.count > 0 ? 'text-white' : 'text-gray-600'}>{ec.count} card{ec.count !== 1 ? 's' : ''}</span>
                    <span className="text-gray-600 text-xs">({ec.pct.toFixed(0)}%)</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${ec.count > 0 ? ec.era.color.replace('text-', 'bg-') : ''}`}
                    style={{ width: `${Math.max(ec.pct, ec.count > 0 ? 2 : 0)}%` }} />
                </div>
                {ec.count === 0 && (
                  <div className="text-xs text-gray-600 mt-1">No cards from this era yet &mdash; {ec.dbCount} available in database</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sport Breakdown */}
      {sportCounts.length > 0 && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Sport Distribution</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['baseball', 'basketball', 'football', 'hockey'].map(sport => {
              const count = sportCounts.find(([s]) => s === sport)?.[1] || 0;
              const pct = selectedCards.length > 0 ? (count / selectedCards.length * 100).toFixed(0) : '0';
              const colors: Record<string, string> = {
                baseball: 'text-red-400 bg-red-950/40 border-red-800/40',
                basketball: 'text-orange-400 bg-orange-950/40 border-orange-800/40',
                football: 'text-green-400 bg-green-950/40 border-green-800/40',
                hockey: 'text-blue-400 bg-blue-950/40 border-blue-800/40',
              };
              return (
                <div key={sport} className={`rounded-xl p-4 text-center border ${colors[sport]}`}>
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-xs capitalize mt-1">{sport} ({pct}%)</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Highlights */}
      {selectedCards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {oldestCard && (
            <div className="bg-amber-950/30 border border-amber-800/30 rounded-xl p-4">
              <div className="text-xs text-amber-400 font-medium mb-1">Oldest Card</div>
              <div className="text-white text-sm font-medium truncate">{oldestCard.name}</div>
              <div className="text-amber-400 text-lg font-bold">{oldestCard.year}</div>
            </div>
          )}
          {newestCard && (
            <div className="bg-violet-950/30 border border-violet-800/30 rounded-xl p-4">
              <div className="text-xs text-violet-400 font-medium mb-1">Newest Card</div>
              <div className="text-white text-sm font-medium truncate">{newestCard.name}</div>
              <div className="text-violet-400 text-lg font-bold">{newestCard.year}</div>
            </div>
          )}
          {mostValuable && (
            <div className="bg-emerald-950/30 border border-emerald-800/30 rounded-xl p-4">
              <div className="text-xs text-emerald-400 font-medium mb-1">Most Valuable</div>
              <div className="text-white text-sm font-medium truncate">{mostValuable.name}</div>
              <div className="text-emerald-400 text-lg font-bold">{mostValuable.estimatedValueRaw}</div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {selectedCards.length === 0 && (
        <div className="bg-gray-900/60 border border-gray-800 border-dashed rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">&#128197;</div>
          <div className="text-gray-400 text-lg mb-2">Your timeline is empty</div>
          <div className="text-gray-500 text-sm max-w-md mx-auto">
            Search for cards above to add them to your timeline. See your collection spread across 100+ years of sports card history.
          </div>
        </div>
      )}
    </div>
  );
}

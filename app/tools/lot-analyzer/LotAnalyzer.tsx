'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

interface LotCard {
  id: string;
  name: string;
  askingPrice: number;
  estimatedValue: number;
  sport: string;
  matchedSlug: string | null;
  isGem: boolean;
}

function parseEstValue(raw: string): number {
  const m = raw.match(/\$([0-9,]+)/);
  if (!m) return 0;
  return parseInt(m[1].replace(/,/g, ''), 10);
}

function searchCards(query: string) {
  if (query.length < 2) return [];
  const q = query.toLowerCase();
  return sportsCards
    .filter(c => c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q))
    .slice(0, 8);
}

export default function LotAnalyzer() {
  const [cards, setCards] = useState<LotCard[]>([]);
  const [askingTotal, setAskingTotal] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof sportsCards>([]);
  const [manualName, setManualName] = useState('');
  const [manualValue, setManualValue] = useState('');
  const [showSearch, setShowSearch] = useState(true);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setSearchResults(searchCards(q));
  };

  const addFromSearch = (card: typeof sportsCards[0]) => {
    const value = parseEstValue(card.estimatedValueRaw);
    setCards(prev => [...prev, {
      id: `${card.slug}-${Date.now()}`,
      name: card.name,
      askingPrice: 0,
      estimatedValue: value,
      sport: card.sport,
      matchedSlug: card.slug,
      isGem: false,
    }]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const addManual = () => {
    if (!manualName.trim()) return;
    const val = parseFloat(manualValue) || 0;
    setCards(prev => [...prev, {
      id: `manual-${Date.now()}`,
      name: manualName.trim(),
      askingPrice: 0,
      estimatedValue: val,
      sport: 'unknown',
      matchedSlug: null,
      isGem: false,
    }]);
    setManualName('');
    setManualValue('');
  };

  const removeCard = (id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
  };

  const totalEstimated = useMemo(() => cards.reduce((s, c) => s + c.estimatedValue, 0), [cards]);
  const lotPrice = parseFloat(askingTotal) || 0;
  const savings = totalEstimated - lotPrice;
  const perCardCost = cards.length > 0 ? lotPrice / cards.length : 0;
  const dealScore = lotPrice > 0 ? Math.round((totalEstimated / lotPrice) * 100) : 0;

  const gems = useMemo(() => {
    if (cards.length === 0) return [];
    const avg = totalEstimated / cards.length;
    return cards.filter(c => c.estimatedValue > avg * 2).sort((a, b) => b.estimatedValue - a.estimatedValue);
  }, [cards, totalEstimated]);

  const sportBreakdown = useMemo(() => {
    const map: Record<string, { count: number; value: number }> = {};
    for (const c of cards) {
      const s = c.sport || 'unknown';
      if (!map[s]) map[s] = { count: 0, value: 0 };
      map[s].count++;
      map[s].value += c.estimatedValue;
    }
    return Object.entries(map).sort((a, b) => b[1].value - a[1].value);
  }, [cards]);

  const verdict = useMemo(() => {
    if (cards.length === 0 || lotPrice <= 0) return null;
    const ratio = totalEstimated / lotPrice;
    if (ratio >= 2.0) return { label: 'Steal', color: 'text-emerald-400', bg: 'bg-emerald-950/60 border-emerald-800/50', msg: `This lot is worth ${ratio.toFixed(1)}x the asking price. Jump on this deal.` };
    if (ratio >= 1.5) return { label: 'Great Deal', color: 'text-green-400', bg: 'bg-green-950/60 border-green-800/50', msg: `Getting $${totalEstimated.toLocaleString()} in cards for $${lotPrice.toLocaleString()}. Strong buy.` };
    if (ratio >= 1.15) return { label: 'Fair Deal', color: 'text-blue-400', bg: 'bg-blue-950/60 border-blue-800/50', msg: `Modest upside. Worth it if you want the specific cards, but don't expect big flip profit.` };
    if (ratio >= 0.85) return { label: 'Break Even', color: 'text-yellow-400', bg: 'bg-yellow-950/60 border-yellow-800/50', msg: `Close to market value. Only buy if you need specific cards from the lot.` };
    return { label: 'Overpriced', color: 'text-red-400', bg: 'bg-red-950/60 border-red-800/50', msg: `You'd pay ${((1 - ratio) * 100).toFixed(0)}% over market value. Negotiate down or pass.` };
  }, [cards, lotPrice, totalEstimated]);

  return (
    <div className="space-y-8">
      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">{cards.length}</div>
          <div className="text-xs text-gray-400">Cards in Lot</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">${totalEstimated.toLocaleString()}</div>
          <div className="text-xs text-gray-400">Total Value</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-amber-400">${perCardCost.toFixed(2)}</div>
          <div className="text-xs text-gray-400">Per Card Cost</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 text-center">
          <div className={`text-2xl font-bold ${savings >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {savings >= 0 ? '+' : ''}${savings.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400">Savings</div>
        </div>
      </div>

      {/* Lot asking price */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-3">Lot Asking Price</h2>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-lg">$</span>
          <input
            type="number"
            value={askingTotal}
            onChange={e => setAskingTotal(e.target.value)}
            placeholder="Enter the seller's asking price"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="flex gap-2 mt-3">
          {[25, 50, 100, 250, 500, 1000].map(v => (
            <button
              key={v}
              onClick={() => setAskingTotal(String(v))}
              className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-sm text-gray-300 transition-colors"
            >${v}
            </button>
          ))}
        </div>
      </div>

      {/* Add cards */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Add Cards to Lot</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSearch(true)}
              className={`px-3 py-1.5 rounded text-sm ${showSearch ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400'}`}
            >Search DB</button>
            <button
              onClick={() => setShowSearch(false)}
              className={`px-3 py-1.5 rounded text-sm ${!showSearch ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400'}`}
            >Manual</button>
          </div>
        </div>

        {showSearch ? (
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search by player name or card..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                {searchResults.map(c => (
                  <button
                    key={c.slug}
                    onClick={() => addFromSearch(c)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors border-b border-gray-700/50 last:border-0"
                  >
                    <div className="text-sm text-white font-medium">{c.name}</div>
                    <div className="text-xs text-gray-400">{c.player} &middot; {c.sport} &middot; {c.estimatedValueRaw}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-3">
            <input
              type="text"
              value={manualName}
              onChange={e => setManualName(e.target.value)}
              placeholder="Card name (e.g., 2024 Topps Chrome Ohtani)"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
            <input
              type="number"
              value={manualValue}
              onChange={e => setManualValue(e.target.value)}
              placeholder="Est. value"
              className="w-28 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={addManual}
              className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
            >Add</button>
          </div>
        )}
      </div>

      {/* Card list */}
      {cards.length > 0 && (
        <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Cards in Lot ({cards.length})</h2>
          <div className="space-y-2">
            {cards.map((c, i) => {
              const isGem = gems.some(g => g.id === c.id);
              return (
                <div key={c.id} className={`flex items-center gap-3 p-3 rounded-lg ${isGem ? 'bg-amber-950/40 border border-amber-800/50' : 'bg-gray-800/60'}`}>
                  <span className="text-gray-500 text-sm w-6">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">
                      {c.matchedSlug ? (
                        <Link href={`/sports/${c.matchedSlug}`} className="hover:text-emerald-400 transition-colors">
                          {c.name}
                        </Link>
                      ) : c.name}
                    </div>
                    <div className="text-xs text-gray-400">{c.sport !== 'unknown' ? c.sport : 'unmatched'}</div>
                  </div>
                  {isGem && (
                    <span className="px-2 py-0.5 bg-amber-900/60 border border-amber-700/50 text-amber-400 text-xs rounded-full">Hidden Gem</span>
                  )}
                  <span className="text-emerald-400 font-medium text-sm">${c.estimatedValue.toLocaleString()}</span>
                  <button
                    onClick={() => removeCard(c.id)}
                    className="text-gray-500 hover:text-red-400 transition-colors text-lg leading-none"
                  >&times;</button>
                </div>
              );
            })}
          </div>

          {cards.length > 1 && (
            <button
              onClick={() => setCards([])}
              className="mt-4 px-4 py-2 text-sm text-gray-400 hover:text-red-400 transition-colors"
            >Clear All</button>
          )}
        </div>
      )}

      {/* Deal verdict */}
      {verdict && (
        <div className={`border rounded-xl p-6 ${verdict.bg}`}>
          <div className="flex items-center gap-3 mb-3">
            <span className={`text-2xl font-bold ${verdict.color}`}>{verdict.label}</span>
            <span className="text-sm text-gray-400">Deal Score: {dealScore}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 mb-3">
            <div
              className={`h-3 rounded-full transition-all ${dealScore >= 200 ? 'bg-emerald-500' : dealScore >= 150 ? 'bg-green-500' : dealScore >= 115 ? 'bg-blue-500' : dealScore >= 85 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${Math.min(dealScore / 2.5, 100)}%` }}
            />
          </div>
          <p className="text-gray-300 text-sm">{verdict.msg}</p>
          <div className="grid grid-cols-3 gap-4 mt-4 text-center text-sm">
            <div>
              <div className="text-gray-400">Lot Price</div>
              <div className="text-white font-medium">${lotPrice.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-400">Card Value</div>
              <div className="text-emerald-400 font-medium">${totalEstimated.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-400">{savings >= 0 ? 'You Save' : 'Overpay'}</div>
              <div className={`font-medium ${savings >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>${Math.abs(savings).toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden gems */}
      {gems.length > 0 && (
        <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-amber-400 mb-3">Hidden Gems ({gems.length})</h2>
          <p className="text-sm text-gray-400 mb-4">These cards are worth significantly more than the lot average — they drive most of the value.</p>
          <div className="space-y-2">
            {gems.map(c => (
              <div key={c.id} className="flex items-center justify-between bg-gray-900/60 rounded-lg p-3">
                <div className="text-sm text-white">
                  {c.matchedSlug ? (
                    <Link href={`/sports/${c.matchedSlug}`} className="hover:text-amber-400 transition-colors">{c.name}</Link>
                  ) : c.name}
                </div>
                <span className="text-amber-400 font-semibold">${c.estimatedValue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sport breakdown */}
      {sportBreakdown.length > 1 && (
        <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Sport Breakdown</h2>
          <div className="space-y-3">
            {sportBreakdown.map(([sport, data]) => {
              const pct = totalEstimated > 0 ? (data.value / totalEstimated) * 100 : 0;
              const sportColors: Record<string, string> = {
                baseball: 'bg-red-500', basketball: 'bg-orange-500', football: 'bg-blue-500', hockey: 'bg-cyan-500', unknown: 'bg-gray-500',
              };
              return (
                <div key={sport}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300 capitalize">{sport} ({data.count} cards)</span>
                    <span className="text-gray-400">${data.value.toLocaleString()} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className={`h-2 rounded-full ${sportColors[sport] || 'bg-gray-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Lot Buying Tips</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          {[
            { title: 'Check comps first', desc: 'Verify values on eBay sold listings before buying any lot over $100.' },
            { title: 'Factor in shipping', desc: 'Lots often have high shipping costs. Add this to your total cost analysis.' },
            { title: 'Hidden gem strategy', desc: 'Buy lots where 1-2 key cards cover the cost. Everything else is profit.' },
            { title: 'Condition matters', desc: 'Lot cards are usually raw and ungraded. Discount 20-30% for condition uncertainty.' },
            { title: 'Bulk cards have value', desc: 'Even common cards sell in lots of 100+ for $5-10. Don\'t throw them away.' },
            { title: 'Negotiate on Facebook', desc: 'Facebook card groups often have better lot deals than eBay. Lower fees = lower prices.' },
          ].map((tip, i) => (
            <div key={i} className="bg-gray-800/60 rounded-lg p-3">
              <div className="text-white font-medium mb-1">{tip.title}</div>
              <div className="text-gray-400">{tip.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Related tools */}
      <div className="flex flex-wrap gap-3">
        {[
          { href: '/tools/flip-calc', label: 'Flip Calculator', icon: '💸' },
          { href: '/tools/condition-grader', label: 'Condition Grader', icon: '🔬' },
          { href: '/tools/collection-value', label: 'Collection Value', icon: '💎' },
          { href: '/tools/auth-check', label: 'Auth Checker', icon: '🔐' },
          { href: '/tools/dealer-scanner', label: 'Dealer Scanner', icon: '📱' },
          { href: '/card-show', label: 'Card Show Companion', icon: '🎪' },
        ].map(t => (
          <Link key={t.href} href={t.href} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors">
            <span>{t.icon}</span> {t.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

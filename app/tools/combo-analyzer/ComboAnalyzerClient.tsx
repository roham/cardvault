'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { sportsCards } from '@/data/sports-cards';
import Link from 'next/link';

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseValue(v: string | undefined): number {
  if (!v) return 0;
  const m = v.match(/\$[\d,]+/);
  if (!m) return 0;
  return parseInt(m[0].replace(/[$,]/g, ''), 10) || 0;
}

function parseGemValue(v: string | undefined): number {
  if (!v) return 0;
  const m = v.match(/\$[\d,]+/);
  if (!m) return 0;
  return parseInt(m[0].replace(/[$,]/g, ''), 10) || 0;
}

function slugifyPlayer(name: string): string {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

type Sport = 'baseball' | 'basketball' | 'football' | 'hockey';

interface CardEntry {
  card: typeof sportsCards[0];
  rawValue: number;
  gemValue: number;
}

const sportColors: Record<string, { text: string; bg: string; border: string }> = {
  baseball: { text: 'text-red-400', bg: 'bg-red-950/30', border: 'border-red-800/40' },
  basketball: { text: 'text-orange-400', bg: 'bg-orange-950/30', border: 'border-orange-800/40' },
  football: { text: 'text-blue-400', bg: 'bg-blue-950/30', border: 'border-blue-800/40' },
  hockey: { text: 'text-cyan-400', bg: 'bg-cyan-950/30', border: 'border-cyan-800/40' },
};

const STORAGE_KEY = 'cardvault-combo-analyzer';

// ── Analysis Functions ──────────────────────────────────────────────────────

function getDiversificationScore(cards: CardEntry[]): { score: number; label: string; color: string } {
  if (cards.length === 0) return { score: 0, label: 'N/A', color: 'text-gray-500' };
  const sports = new Set(cards.map(c => c.card.sport));
  const players = new Set(cards.map(c => c.card.player));
  const eras = new Set(cards.map(c => {
    if (c.card.year < 1970) return 'vintage';
    if (c.card.year < 1994) return 'junk-wax';
    if (c.card.year < 2010) return 'modern';
    return 'ultra-modern';
  }));
  const rookieRatio = cards.filter(c => c.card.rookie).length / cards.length;

  // Score from 0-100
  const sportDiv = Math.min(sports.size / 4, 1) * 25;
  const playerDiv = Math.min(players.size / cards.length, 1) * 25;
  const eraDiv = Math.min(eras.size / 4, 1) * 25;
  const rookieMix = (rookieRatio > 0.2 && rookieRatio < 0.8) ? 25 : (rookieRatio > 0 ? 15 : 10);
  const score = Math.round(sportDiv + playerDiv + eraDiv + rookieMix);

  if (score >= 80) return { score, label: 'Excellent', color: 'text-emerald-400' };
  if (score >= 60) return { score, label: 'Good', color: 'text-blue-400' };
  if (score >= 40) return { score, label: 'Fair', color: 'text-amber-400' };
  return { score, label: 'Low', color: 'text-red-400' };
}

function getGradingPotential(cards: CardEntry[]): { avgMultiplier: number; totalUpside: number } {
  const multipliers = cards.map(c => {
    const raw = c.rawValue;
    const gem = c.gemValue;
    if (raw <= 0 || gem <= 0) return 1;
    return gem / raw;
  });
  const avgMultiplier = multipliers.reduce((s, m) => s + m, 0) / multipliers.length;
  const totalUpside = cards.reduce((s, c) => s + Math.max(0, c.gemValue - c.rawValue), 0);
  return { avgMultiplier, totalUpside };
}

function getTradeRating(totalValue: number, count: number): { rating: string; color: string; description: string } {
  const avgValue = totalValue / Math.max(count, 1);
  if (totalValue >= 1000 && count >= 3) return { rating: 'Premium Package', color: 'text-emerald-400', description: 'High-value multi-card package — strong trade leverage' };
  if (totalValue >= 500) return { rating: 'Strong Package', color: 'text-blue-400', description: 'Solid value for mid-tier trades' };
  if (totalValue >= 100) return { rating: 'Decent Package', color: 'text-amber-400', description: 'Good for casual trades or starter deals' };
  if (avgValue >= 50) return { rating: 'Quality Cards', color: 'text-purple-400', description: 'Fewer but higher-quality cards' };
  return { rating: 'Budget Package', color: 'text-gray-400', description: 'Low-value package — consider adding premium cards' };
}

// ── Component ────────────────────────────────────────────────────────────────

export default function ComboAnalyzerClient() {
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState('');
  const [sportFilter, setSportFilter] = useState<Sport | 'all'>('all');
  const [combo, setCombo] = useState<CardEntry[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Load saved combo
  useEffect(() => {
    if (!mounted) return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const slugs: string[] = JSON.parse(saved);
        const entries = slugs.map(slug => {
          const card = sportsCards.find(c => c.slug === slug);
          if (!card) return null;
          return { card, rawValue: parseValue(card.estimatedValueRaw), gemValue: parseGemValue(card.estimatedValueGem) };
        }).filter(Boolean) as CardEntry[];
        setCombo(entries);
      }
    } catch { /* ignore */ }
  }, [mounted]);

  // Save combo
  const saveCombo = useCallback((entries: CardEntry[]) => {
    setCombo(entries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.map(e => e.card.slug)));
  }, []);

  // Search results
  const searchResults = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    const comboSlugs = new Set(combo.map(c => c.card.slug));
    return sportsCards
      .filter(c => {
        if (comboSlugs.has(c.slug)) return false;
        if (sportFilter !== 'all' && c.sport !== sportFilter) return false;
        return c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q);
      })
      .slice(0, 8)
      .map(card => ({ card, rawValue: parseValue(card.estimatedValueRaw), gemValue: parseGemValue(card.estimatedValueGem) }));
  }, [query, sportFilter, combo]);

  const addCard = useCallback((entry: CardEntry) => {
    if (combo.length >= 10) return;
    saveCombo([...combo, entry]);
    setQuery('');
  }, [combo, saveCombo]);

  const removeCard = useCallback((slug: string) => {
    saveCombo(combo.filter(c => c.card.slug !== slug));
  }, [combo, saveCombo]);

  const clearAll = useCallback(() => {
    saveCombo([]);
    setShowResults(false);
  }, [saveCombo]);

  // Analysis
  const totalRawValue = combo.reduce((s, c) => s + c.rawValue, 0);
  const totalGemValue = combo.reduce((s, c) => s + c.gemValue, 0);
  const diversification = getDiversificationScore(combo);
  const grading = getGradingPotential(combo);
  const tradeRating = getTradeRating(totalRawValue, combo.length);

  const sportBreakdown = useMemo(() => {
    const counts: Record<string, { count: number; value: number }> = {};
    for (const c of combo) {
      const sport = c.card.sport;
      if (!counts[sport]) counts[sport] = { count: 0, value: 0 };
      counts[sport].count++;
      counts[sport].value += c.rawValue;
    }
    return Object.entries(counts).sort((a, b) => b[1].value - a[1].value);
  }, [combo]);

  const rookieCount = combo.filter(c => c.card.rookie).length;
  const uniquePlayers = new Set(combo.map(c => c.card.player)).size;

  // Suggestions
  const suggestions = useMemo(() => {
    const tips: string[] = [];
    if (combo.length === 0) return tips;
    if (combo.length === 1) tips.push('Add more cards to build a trade package');
    if (new Set(combo.map(c => c.card.sport)).size === 1 && combo.length >= 3) tips.push('Consider adding cards from other sports for better diversification');
    if (rookieCount === 0 && combo.length >= 2) tips.push('Adding rookie cards increases trade appeal');
    if (rookieCount === combo.length) tips.push('Mix in some veteran/vintage cards for balance');
    if (combo.every(c => c.card.year >= 2020)) tips.push('Consider adding a vintage card as an anchor — older cards hold value better');
    if (grading.avgMultiplier > 3) tips.push('High grading upside! Consider grading before trading');
    const highValue = combo.filter(c => c.rawValue >= 100);
    if (highValue.length === 0 && combo.length >= 3) tips.push('Package needs an anchor card worth $100+ for premium trades');
    return tips;
  }, [combo, rookieCount, grading.avgMultiplier]);

  if (!mounted) return <div className="min-h-[400px] flex items-center justify-center"><div className="text-gray-500">Loading...</div></div>;

  return (
    <div className="space-y-8">
      {/* Search + add */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search cards to add to your combo..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500"
            />
            {searchResults.length > 0 && (
              <div className="absolute z-10 top-full mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-80 overflow-y-auto">
                {searchResults.map(entry => (
                  <button
                    key={entry.card.slug}
                    onClick={() => addCard(entry)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-700/50 transition-colors border-b border-gray-700/50 last:border-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm text-white font-medium truncate">{entry.card.name}</div>
                        <div className="text-xs text-gray-400">{entry.card.player} &middot; <span className={sportColors[entry.card.sport]?.text || 'text-gray-400'}>{entry.card.sport}</span></div>
                      </div>
                      <div className="text-sm font-bold text-emerald-400 ml-3">${entry.rawValue.toLocaleString()}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'baseball', 'basketball', 'football', 'hockey'] as const).map(sport => (
            <button
              key={sport}
              onClick={() => setSportFilter(sport)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${sportFilter === sport ? 'bg-emerald-900/50 border-emerald-700 text-emerald-400' : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:text-white'}`}
            >
              {sport === 'all' ? 'All Sports' : sport.charAt(0).toUpperCase() + sport.slice(1)}
            </button>
          ))}
          <span className="text-xs text-gray-600 ml-auto self-center">{combo.length}/10 cards</span>
        </div>
      </div>

      {/* Combo list */}
      {combo.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-400 uppercase">Your Card Combo</h3>
            <button onClick={clearAll} className="text-xs text-red-400 hover:text-red-300">Clear All</button>
          </div>
          {combo.map((entry, i) => {
            const sc = sportColors[entry.card.sport] || sportColors.baseball;
            return (
              <div key={entry.card.slug} className={`flex items-center gap-3 p-3 rounded-lg border ${sc.bg} ${sc.border}`}>
                <span className="text-gray-500 text-sm font-mono w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <Link href={`/sports/${entry.card.slug}`} className="text-sm text-white font-medium hover:text-emerald-400 truncate block">{entry.card.name}</Link>
                  <div className="text-xs text-gray-400">
                    {entry.card.player} &middot; <span className={sc.text}>{entry.card.sport}</span>
                    {entry.card.rookie && <span className="text-amber-400 ml-1">RC</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">${entry.rawValue.toLocaleString()}</div>
                  <div className="text-xs text-emerald-500">Gem: ${entry.gemValue.toLocaleString()}</div>
                </div>
                <button onClick={() => removeCard(entry.card.slug)} className="text-gray-600 hover:text-red-400 transition-colors text-lg">&times;</button>
              </div>
            );
          })}
        </div>
      )}

      {/* Analyze button */}
      {combo.length >= 2 && (
        <button
          onClick={() => setShowResults(true)}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-colors"
        >
          Analyze Combo ({combo.length} cards)
        </button>
      )}

      {/* Analysis results */}
      {showResults && combo.length >= 2 && (
        <div className="space-y-6">
          {/* Value summary */}
          <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Package Value</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-white">${totalRawValue.toLocaleString()}</div>
                <div className="text-xs text-gray-500">Raw Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-400">${totalGemValue.toLocaleString()}</div>
                <div className="text-xs text-gray-500">Gem Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-400">{grading.avgMultiplier.toFixed(1)}x</div>
                <div className="text-xs text-gray-500">Avg Grade Multiplier</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">${grading.totalUpside.toLocaleString()}</div>
                <div className="text-xs text-gray-500">Grading Upside</div>
              </div>
            </div>
          </div>

          {/* Trade rating */}
          <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-white">Trade Package Rating</h3>
              <span className={`text-lg font-bold ${tradeRating.color}`}>{tradeRating.rating}</span>
            </div>
            <p className="text-sm text-gray-400">{tradeRating.description}</p>
          </div>

          {/* Diversification */}
          <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Diversification</h3>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${diversification.color}`}>{diversification.score}</span>
                <span className={`text-sm ${diversification.color}`}>{diversification.label}</span>
              </div>
            </div>
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden mb-4">
              <div
                className={`h-full rounded-full transition-all ${diversification.score >= 80 ? 'bg-emerald-500' : diversification.score >= 60 ? 'bg-blue-500' : diversification.score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${diversification.score}%` }}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-sm">
              <div>
                <div className="text-white font-bold">{new Set(combo.map(c => c.card.sport)).size}</div>
                <div className="text-xs text-gray-500">Sports</div>
              </div>
              <div>
                <div className="text-white font-bold">{uniquePlayers}</div>
                <div className="text-xs text-gray-500">Players</div>
              </div>
              <div>
                <div className="text-white font-bold">{rookieCount}</div>
                <div className="text-xs text-gray-500">Rookies</div>
              </div>
              <div>
                <div className="text-white font-bold">{new Set(combo.map(c => c.card.year < 1970 ? 'vintage' : c.card.year < 1994 ? 'junk-wax' : c.card.year < 2010 ? 'modern' : 'ultra-modern')).size}</div>
                <div className="text-xs text-gray-500">Eras</div>
              </div>
            </div>
          </div>

          {/* Sport breakdown */}
          {sportBreakdown.length > 0 && (
            <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Sport Breakdown</h3>
              <div className="space-y-3">
                {sportBreakdown.map(([sport, data]) => {
                  const pct = totalRawValue > 0 ? (data.value / totalRawValue * 100) : 0;
                  const sc = sportColors[sport] || sportColors.baseball;
                  return (
                    <div key={sport} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className={sc.text}>{sport.charAt(0).toUpperCase() + sport.slice(1)} ({data.count})</span>
                        <span className="text-white font-bold">${data.value.toLocaleString()} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${sport === 'baseball' ? 'bg-red-500' : sport === 'basketball' ? 'bg-orange-500' : sport === 'football' ? 'bg-blue-500' : 'bg-cyan-500'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-amber-400 uppercase mb-3">Improvement Suggestions</h3>
              <ul className="space-y-2">
                {suggestions.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-amber-400">💡</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Share */}
          <button
            onClick={() => {
              const text = `My Card Combo (${combo.length} cards)\n${combo.map(c => `• ${c.card.name} — $${c.rawValue}`).join('\n')}\nTotal: $${totalRawValue.toLocaleString()} raw / $${totalGemValue.toLocaleString()} gem\nTrade Rating: ${tradeRating.rating}\nDiversification: ${diversification.score}/100\nhttps://cardvault-two.vercel.app/tools/combo-analyzer`;
              navigator.clipboard.writeText(text);
            }}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors"
          >
            📋 Copy Combo Summary
          </button>
        </div>
      )}

      {/* Empty state */}
      {combo.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-3">🃏</div>
          <p className="text-lg">Search and add cards to build your combo</p>
          <p className="text-sm mt-1">Add 2-10 cards for trade package analysis</p>
        </div>
      )}

      {/* Related tools */}
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">Related Tools</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Link href="/tools/trade" className="text-emerald-400 hover:text-emerald-300">🔄 Trade Evaluator</Link>
          <Link href="/tools/collection-value" className="text-emerald-400 hover:text-emerald-300">💎 Collection Value</Link>
          <Link href="/tools/diversification" className="text-emerald-400 hover:text-emerald-300">📊 Diversification Analyzer</Link>
          <Link href="/tools/flip-calc" className="text-emerald-400 hover:text-emerald-300">💰 Flip Profit Calculator</Link>
          <Link href="/tools/grading-roi" className="text-emerald-400 hover:text-emerald-300">📈 Grading ROI</Link>
          <Link href="/tools/investment-calc" className="text-emerald-400 hover:text-emerald-300">🧮 Investment Calculator</Link>
        </div>
      </div>
    </div>
  );
}

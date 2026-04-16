'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { sportsCards } from '@/data/sports-cards';

type Budget = 25 | 50 | 100 | 250;
type Theme = 'mixed' | 'baseball' | 'basketball' | 'football' | 'hockey' | 'rookies' | 'vintage' | 'modern' | 'graded';
type Phase = 'setup' | 'revealing' | 'complete';
type Mode = 'daily' | 'random';

interface CrateCard {
  slug: string;
  name: string;
  player: string;
  sport: string;
  year: number;
  value: number;
  revealed: boolean;
  isHit: boolean;
}

interface CrateStats {
  cratesOpened: number;
  totalSpent: number;
  totalValue: number;
  bestCrateValue: number;
  bestSingleCard: number;
  wins: number;
  losses: number;
}

function parseValue(val: string): number {
  const m = val.match(/\$([0-9,.]+)/);
  return m ? parseFloat(m[1].replace(',', '')) : 5;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function dateHash(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

const BUDGET_CONFIG: Record<Budget, { cards: number; label: string; icon: string }> = {
  25: { cards: 5, label: 'Starter Crate', icon: '📦' },
  50: { cards: 8, label: 'Standard Crate', icon: '🎁' },
  100: { cards: 12, label: 'Premium Crate', icon: '💎' },
  250: { cards: 15, label: 'Elite Crate', icon: '👑' },
};

const THEMES: { id: Theme; label: string; desc: string; icon: string }[] = [
  { id: 'mixed', label: 'Mixed', desc: 'All sports & eras', icon: '🎲' },
  { id: 'baseball', label: 'Baseball', desc: 'MLB cards only', icon: '⚾' },
  { id: 'basketball', label: 'Basketball', desc: 'NBA cards only', icon: '🏀' },
  { id: 'football', label: 'Football', desc: 'NFL cards only', icon: '🏈' },
  { id: 'hockey', label: 'Hockey', desc: 'NHL cards only', icon: '🏒' },
  { id: 'rookies', label: 'Rookies Only', desc: 'First-year cards', icon: '⭐' },
  { id: 'vintage', label: 'Vintage', desc: 'Pre-2000 classics', icon: '🏛️' },
  { id: 'modern', label: 'Modern Hits', desc: '2020+ releases', icon: '🔥' },
  { id: 'graded', label: 'Graded Slabs', desc: 'Higher-value picks', icon: '🏆' },
];

function getGrade(ratio: number): { letter: string; label: string; color: string } {
  if (ratio >= 1.5) return { letter: 'S', label: 'INCREDIBLE', color: 'text-yellow-400' };
  if (ratio >= 1.25) return { letter: 'A', label: 'GREAT', color: 'text-green-400' };
  if (ratio >= 1.0) return { letter: 'B', label: 'SOLID', color: 'text-emerald-400' };
  if (ratio >= 0.8) return { letter: 'C', label: 'BREAK EVEN', color: 'text-zinc-400' };
  if (ratio >= 0.5) return { letter: 'D', label: 'BELOW AVG', color: 'text-orange-400' };
  return { letter: 'F', label: 'BUST', color: 'text-red-400' };
}

function getSportColor(sport: string): string {
  switch (sport) {
    case 'baseball': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'basketball': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'football': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'hockey': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
  }
}

function loadStats(): CrateStats {
  if (typeof window === 'undefined') return { cratesOpened: 0, totalSpent: 0, totalValue: 0, bestCrateValue: 0, bestSingleCard: 0, wins: 0, losses: 0 };
  try {
    const s = localStorage.getItem('cardvault-mystery-crate-stats');
    return s ? JSON.parse(s) : { cratesOpened: 0, totalSpent: 0, totalValue: 0, bestCrateValue: 0, bestSingleCard: 0, wins: 0, losses: 0 };
  } catch { return { cratesOpened: 0, totalSpent: 0, totalValue: 0, bestCrateValue: 0, bestSingleCard: 0, wins: 0, losses: 0 }; }
}

function saveStats(stats: CrateStats) {
  try { localStorage.setItem('cardvault-mystery-crate-stats', JSON.stringify(stats)); } catch {}
}

export default function MysteryCrateClient() {
  const [budget, setBudget] = useState<Budget>(50);
  const [theme, setTheme] = useState<Theme>('mixed');
  const [mode, setMode] = useState<Mode>('daily');
  const [phase, setPhase] = useState<Phase>('setup');
  const [crateCards, setCrateCards] = useState<CrateCard[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [stats, setStats] = useState<CrateStats>(loadStats);

  // Build crate cards when opened
  const buildCrate = useCallback(() => {
    const seed = mode === 'daily' ? dateHash() * 1000 + budget + THEMES.findIndex(t => t.id === theme) : Date.now();
    const rng = seededRandom(seed);
    const count = BUDGET_CONFIG[budget].cards;

    // Filter cards by theme
    let pool = sportsCards.filter(c => {
      const v = parseValue(c.estimatedValueRaw);
      if (v <= 0) return false;
      switch (theme) {
        case 'baseball': return c.sport === 'baseball';
        case 'basketball': return c.sport === 'basketball';
        case 'football': return c.sport === 'football';
        case 'hockey': return c.sport === 'hockey';
        case 'rookies': return c.rookie === true;
        case 'vintage': return c.year < 2000;
        case 'modern': return c.year >= 2020;
        case 'graded': return v >= 30;
        default: return true;
      }
    });

    if (pool.length < count * 2) {
      // Fallback to mixed if theme is too restrictive
      pool = sportsCards.filter(c => parseValue(c.estimatedValueRaw) > 0);
    }

    // Shuffle pool
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Value-weighted selection: higher budget = higher avg card value
    const avgTarget = budget / count;
    const scoredPool = pool.map(c => {
      const v = parseValue(c.estimatedValueRaw);
      // Cards closer to the target avg per card get higher scores
      const dist = Math.abs(v - avgTarget);
      const score = 1 / (1 + dist / avgTarget) + rng() * 0.4;
      return { card: c, score, value: v };
    });

    scoredPool.sort((a, b) => b.score - a.score);

    // Pick cards, ensuring at least one "hit" (above avg)
    const selected: CrateCard[] = [];
    const usedSlugs = new Set<string>();
    let totalVal = 0;
    const hitThreshold = avgTarget * 1.5;

    for (const { card, value } of scoredPool) {
      if (selected.length >= count) break;
      if (usedSlugs.has(card.slug)) continue;
      // Skip if one card is too expensive (>60% of budget)
      if (value > budget * 0.6 && selected.length < count - 1) continue;
      usedSlugs.add(card.slug);
      selected.push({
        slug: card.slug,
        name: card.name,
        player: card.player,
        sport: card.sport,
        year: card.year,
        value,
        revealed: false,
        isHit: value >= hitThreshold,
      });
      totalVal += value;
    }

    // Shuffle reveal order
    for (let i = selected.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [selected[i], selected[j]] = [selected[j], selected[i]];
    }

    setCrateCards(selected);
    setRevealedCount(0);
    setPhase('revealing');
  }, [budget, theme, mode]);

  const revealCard = useCallback((index: number) => {
    setCrateCards(prev => {
      const next = [...prev];
      if (!next[index].revealed) {
        next[index] = { ...next[index], revealed: true };
        return next;
      }
      return prev;
    });
    setRevealedCount(prev => prev + 1);
  }, []);

  const revealAll = useCallback(() => {
    setCrateCards(prev => prev.map(c => ({ ...c, revealed: true })));
    setRevealedCount(crateCards.length);
  }, [crateCards.length]);

  // Auto-complete when all cards revealed
  useEffect(() => {
    if (phase === 'revealing' && revealedCount >= crateCards.length && crateCards.length > 0) {
      const timer = setTimeout(() => {
        setPhase('complete');
        // Update stats
        const totalVal = crateCards.reduce((s, c) => s + c.value, 0);
        const bestCard = Math.max(...crateCards.map(c => c.value));
        const isWin = totalVal >= budget;
        setStats(prev => {
          const next = {
            cratesOpened: prev.cratesOpened + 1,
            totalSpent: prev.totalSpent + budget,
            totalValue: Math.round((prev.totalValue + totalVal) * 100) / 100,
            bestCrateValue: Math.max(prev.bestCrateValue, totalVal),
            bestSingleCard: Math.max(prev.bestSingleCard, bestCard),
            wins: prev.wins + (isWin ? 1 : 0),
            losses: prev.losses + (isWin ? 0 : 1),
          };
          saveStats(next);
          return next;
        });
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [phase, revealedCount, crateCards, budget]);

  const totalValue = useMemo(() => crateCards.reduce((s, c) => s + c.value, 0), [crateCards]);
  const valueRatio = budget > 0 ? totalValue / budget : 0;
  const grade = getGrade(valueRatio);
  const biggestHit = useMemo(() => {
    if (crateCards.length === 0) return null;
    return crateCards.reduce((best, c) => c.value > best.value ? c : best, crateCards[0]);
  }, [crateCards]);

  const shareText = useMemo(() => {
    if (phase !== 'complete') return '';
    const tierLabel = BUDGET_CONFIG[budget].label;
    const themeLabel = THEMES.find(t => t.id === theme)?.label || 'Mixed';
    const emojis = crateCards.map(c => c.isHit ? '🟡' : c.value >= budget / crateCards.length ? '🟢' : '⚪').join('');
    return `CardVault Mystery Crate ${mode === 'daily' ? '(Daily)' : ''}\n${tierLabel} ($${budget}) | ${themeLabel}\n${emojis}\nValue: $${totalValue.toFixed(2)} | Grade: ${grade.letter}\nhttps://cardvault-two.vercel.app/vault/mystery-crate`;
  }, [phase, budget, theme, mode, crateCards, totalValue, grade]);

  const reset = useCallback(() => {
    setPhase('setup');
    setCrateCards([]);
    setRevealedCount(0);
  }, []);

  return (
    <div>
      {/* Stats Bar */}
      {stats.cratesOpened > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[
            { label: 'Opened', value: stats.cratesOpened.toString() },
            { label: 'Win Rate', value: stats.cratesOpened > 0 ? `${Math.round((stats.wins / stats.cratesOpened) * 100)}%` : '—' },
            { label: 'Best Crate', value: `$${stats.bestCrateValue.toFixed(0)}` },
            { label: 'Best Card', value: `$${stats.bestSingleCard.toFixed(0)}` },
          ].map(s => (
            <div key={s.label} className="bg-zinc-800/30 border border-zinc-700/30 rounded-lg p-2 text-center">
              <div className="text-xs text-zinc-500">{s.label}</div>
              <div className="text-sm font-bold text-white">{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* SETUP PHASE */}
      {phase === 'setup' && (
        <div className="space-y-6">
          {/* Mode Toggle */}
          <div className="flex gap-2">
            {(['daily', 'random'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  mode === m
                    ? 'bg-purple-600/30 border-purple-500/50 text-purple-300'
                    : 'bg-zinc-800/40 border-zinc-700/30 text-zinc-400 hover:border-zinc-600'
                }`}
              >
                {m === 'daily' ? '📅 Daily' : '🎲 Random'}
              </button>
            ))}
          </div>

          {/* Budget Selection */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-300 mb-3">Choose Your Budget</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {([25, 50, 100, 250] as Budget[]).map(b => {
                const cfg = BUDGET_CONFIG[b];
                return (
                  <button
                    key={b}
                    onClick={() => setBudget(b)}
                    className={`p-4 rounded-lg border text-center transition-all ${
                      budget === b
                        ? 'bg-purple-600/20 border-purple-500/50 ring-1 ring-purple-500/30'
                        : 'bg-zinc-800/40 border-zinc-700/30 hover:border-zinc-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">{cfg.icon}</div>
                    <div className="text-lg font-bold text-white">${b}</div>
                    <div className="text-xs text-zinc-500">{cfg.label}</div>
                    <div className="text-xs text-zinc-600 mt-1">{cfg.cards} cards</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theme Selection */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-300 mb-3">Choose Your Theme</h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    theme === t.id
                      ? 'bg-purple-600/20 border-purple-500/50 ring-1 ring-purple-500/30'
                      : 'bg-zinc-800/40 border-zinc-700/30 hover:border-zinc-600'
                  }`}
                >
                  <div className="text-xl mb-1">{t.icon}</div>
                  <div className="text-xs font-medium text-white">{t.label}</div>
                  <div className="text-[10px] text-zinc-500">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Open Button */}
          <button
            onClick={buildCrate}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold text-lg transition-all shadow-lg shadow-purple-900/30"
          >
            Open {BUDGET_CONFIG[budget].label} — ${budget}
          </button>
        </div>
      )}

      {/* REVEALING PHASE */}
      {phase === 'revealing' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-zinc-400">
              Revealed: <span className="text-white font-bold">{revealedCount}</span> / {crateCards.length}
            </div>
            <button
              onClick={revealAll}
              className="text-xs text-purple-400 hover:text-purple-300 border border-purple-800/40 px-3 py-1 rounded-lg"
            >
              Reveal All
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {crateCards.map((card, i) => (
              <button
                key={card.slug}
                onClick={() => !card.revealed && revealCard(i)}
                disabled={card.revealed}
                className={`relative rounded-xl border p-4 transition-all duration-300 min-h-[140px] flex flex-col items-center justify-center ${
                  card.revealed
                    ? card.isHit
                      ? 'bg-yellow-900/20 border-yellow-600/50'
                      : 'bg-zinc-800/40 border-zinc-700/40'
                    : 'bg-purple-900/20 border-purple-700/40 hover:border-purple-500/60 hover:bg-purple-900/30 cursor-pointer'
                }`}
              >
                {card.revealed ? (
                  <>
                    {card.isHit && (
                      <div className="absolute top-1 right-1 text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full font-bold">HIT</div>
                    )}
                    <div className={`text-[10px] px-2 py-0.5 rounded-full border mb-2 ${getSportColor(card.sport)}`}>
                      {card.sport}
                    </div>
                    <div className="text-xs font-semibold text-white text-center leading-tight mb-1">
                      {card.player}
                    </div>
                    <div className="text-[10px] text-zinc-500 text-center leading-tight mb-2">
                      {card.year}
                    </div>
                    <div className={`text-sm font-bold ${card.isHit ? 'text-yellow-400' : 'text-green-400'}`}>
                      ${card.value.toFixed(2)}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-3xl mb-2">❓</div>
                    <div className="text-xs text-purple-400 font-medium">Card #{i + 1}</div>
                    <div className="text-[10px] text-purple-600">Tap to reveal</div>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* COMPLETE PHASE */}
      {phase === 'complete' && (
        <div>
          {/* Grade Banner */}
          <div className="text-center mb-6 bg-zinc-800/40 border border-zinc-700/30 rounded-xl p-6">
            <div className={`text-6xl font-black ${grade.color} mb-1`}>{grade.letter}</div>
            <div className="text-sm text-zinc-400 mb-3">{grade.label}</div>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div>
                <span className="text-zinc-500">Crate Cost:</span>{' '}
                <span className="text-white font-bold">${budget}</span>
              </div>
              <div>
                <span className="text-zinc-500">Total Value:</span>{' '}
                <span className={`font-bold ${totalValue >= budget ? 'text-green-400' : 'text-red-400'}`}>
                  ${totalValue.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-zinc-500">Return:</span>{' '}
                <span className={`font-bold ${totalValue >= budget ? 'text-green-400' : 'text-red-400'}`}>
                  {totalValue >= budget ? '+' : '-'}${Math.abs(totalValue - budget).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Biggest Hit */}
          {biggestHit && (
            <div className="mb-4 bg-yellow-900/10 border border-yellow-700/30 rounded-lg p-3 flex items-center gap-3">
              <div className="text-2xl">🌟</div>
              <div>
                <div className="text-xs text-yellow-500 font-medium">Biggest Hit</div>
                <div className="text-sm text-white font-semibold">{biggestHit.player} — {biggestHit.year}</div>
                <div className="text-xs text-yellow-400 font-bold">${biggestHit.value.toFixed(2)}</div>
              </div>
            </div>
          )}

          {/* Card List */}
          <div className="space-y-2 mb-6">
            {crateCards
              .slice()
              .sort((a, b) => b.value - a.value)
              .map((card, i) => (
              <div key={card.slug} className={`flex items-center justify-between p-3 rounded-lg border ${
                card.isHit ? 'bg-yellow-900/10 border-yellow-700/30' : 'bg-zinc-800/30 border-zinc-700/30'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-600 w-5 text-right">{i + 1}</span>
                  <div>
                    <div className="text-sm text-white font-medium">{card.player}</div>
                    <div className="text-xs text-zinc-500">{card.name} &middot; {card.year}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getSportColor(card.sport)}`}>{card.sport}</span>
                  <span className={`text-sm font-bold ${card.isHit ? 'text-yellow-400' : 'text-white'}`}>
                    ${card.value.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Value Breakdown */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-zinc-800/30 border border-zinc-700/30 rounded-lg p-3 text-center">
              <div className="text-xs text-zinc-500">Hits</div>
              <div className="text-lg font-bold text-yellow-400">{crateCards.filter(c => c.isHit).length}</div>
              <div className="text-[10px] text-zinc-600">of {crateCards.length} cards</div>
            </div>
            <div className="bg-zinc-800/30 border border-zinc-700/30 rounded-lg p-3 text-center">
              <div className="text-xs text-zinc-500">Avg Per Card</div>
              <div className="text-lg font-bold text-white">${crateCards.length > 0 ? (totalValue / crateCards.length).toFixed(2) : '0'}</div>
              <div className="text-[10px] text-zinc-600">target: ${(budget / crateCards.length).toFixed(2)}</div>
            </div>
          </div>

          {/* Sport Breakdown */}
          {(() => {
            const sportBreakdown: Record<string, { count: number; value: number }> = {};
            for (const c of crateCards) {
              if (!sportBreakdown[c.sport]) sportBreakdown[c.sport] = { count: 0, value: 0 };
              sportBreakdown[c.sport].count++;
              sportBreakdown[c.sport].value += c.value;
            }
            const sports = Object.entries(sportBreakdown).sort((a, b) => b[1].value - a[1].value);
            if (sports.length <= 1) return null;
            return (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-zinc-300 mb-2">Sport Breakdown</h3>
                <div className="space-y-1">
                  {sports.map(([sport, data]) => (
                    <div key={sport} className="flex items-center justify-between text-xs py-1">
                      <span className="text-zinc-400 capitalize">{sport}</span>
                      <span className="text-zinc-300">{data.count} cards &middot; ${data.value.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={reset}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold text-sm transition-all"
            >
              Open Another Crate
            </button>
            <button
              onClick={() => {
                if (navigator.clipboard) navigator.clipboard.writeText(shareText);
              }}
              className="px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white text-sm font-medium transition-colors"
            >
              Share
            </button>
          </div>

          {/* Real Mystery Lot Comparison */}
          <div className="mt-6 bg-zinc-800/20 border border-zinc-700/30 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-zinc-300 mb-2">How Real Mystery Lots Compare</h3>
            <div className="space-y-2 text-xs text-zinc-400">
              <div className="flex justify-between"><span>eBay Mystery Lots</span><span className="text-zinc-300">Avg 40-60% value return</span></div>
              <div className="flex justify-between"><span>Card Show Mystery Bags</span><span className="text-zinc-300">Avg 50-70% value return</span></div>
              <div className="flex justify-between"><span>LCS Mystery Packs</span><span className="text-zinc-300">Avg 60-80% value return</span></div>
              <div className="flex justify-between"><span>Reputable Online Sellers</span><span className="text-zinc-300">Avg 70-90% value return</span></div>
              <div className="flex justify-between"><span>Your Crate</span><span className={`font-bold ${totalValue >= budget ? 'text-green-400' : 'text-red-400'}`}>{Math.round((totalValue / budget) * 100)}% value return</span></div>
            </div>
            <div className="mt-2 text-[10px] text-zinc-600">Real mystery lots rarely beat the advertised value. Sellers keep the best cards and price lots to profit.</div>
          </div>
        </div>
      )}
    </div>
  );
}

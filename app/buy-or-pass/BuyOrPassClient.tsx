'use client';

import { useEffect, useMemo, useState } from 'react';
import { sportsCards } from '@/data/sports-cards';

type Decision = 'buy' | 'pass';

interface Choice {
  card: typeof sportsCards[number];
  decision: Decision;
  askPrice: number;
  gemPrice: number;
}

type Phase = 'config' | 'playing' | 'results';

function parseLowPrice(v: string): number {
  // e.g. "$15,000–$80,000 (PSA 7)" → 15000. Also handles "$250", "$1,200+", etc.
  const m = v.replace(/,/g, '').match(/\$([0-9]+(?:\.[0-9]+)?)/);
  if (!m) return 0;
  return Math.round(parseFloat(m[1]));
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
}

const SPORT_COLORS: Record<string, string> = {
  baseball: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
  basketball: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  football: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  hockey: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
};

const ROUND_SIZE = 20;

export default function BuyOrPassClient() {
  const [phase, setPhase] = useState<Phase>('config');
  const [deck, setDeck] = useState<typeof sportsCards>([]);
  const [index, setIndex] = useState(0);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [stats, setStats] = useState({ rounds: 0, bestSpend: 0, bestFmv: 0 });

  useEffect(() => {
    try {
      const s = localStorage.getItem('cv-buy-or-pass-stats');
      if (s) setStats(JSON.parse(s));
    } catch {}
  }, []);

  const persistStats = (next: typeof stats) => {
    setStats(next);
    try { localStorage.setItem('cv-buy-or-pass-stats', JSON.stringify(next)); } catch {}
  };

  const startRound = () => {
    // Pick 20 cards with valid raw and gem prices
    const eligible = sportsCards.filter(c => parseLowPrice(c.estimatedValueRaw) > 0 && parseLowPrice(c.estimatedValueGem) > 0);
    const picked = shuffle(eligible).slice(0, ROUND_SIZE);
    setDeck(picked);
    setIndex(0);
    setChoices([]);
    setPhase('playing');
  };

  const current = deck[index];
  const askPrice = current ? parseLowPrice(current.estimatedValueRaw) : 0;
  const gemPrice = current ? parseLowPrice(current.estimatedValueGem) : 0;

  const makeChoice = (d: Decision) => {
    if (!current) return;
    const choice: Choice = { card: current, decision: d, askPrice, gemPrice };
    const next = [...choices, choice];
    setChoices(next);
    if (index + 1 >= deck.length) {
      const bought = next.filter(c => c.decision === 'buy');
      const totalSpend = bought.reduce((s, c) => s + c.askPrice, 0);
      const totalGem = bought.reduce((s, c) => s + c.gemPrice, 0);
      persistStats({
        rounds: stats.rounds + 1,
        bestSpend: Math.max(stats.bestSpend, totalSpend),
        bestFmv: Math.max(stats.bestFmv, totalGem),
      });
      setPhase('results');
    } else {
      setIndex(i => i + 1);
    }
  };

  if (phase === 'config') {
    return (
      <div className="bg-gradient-to-br from-pink-500/10 to-violet-500/5 border border-pink-500/30 rounded-2xl p-8 sm:p-12 text-center">
        <div className="text-5xl mb-4">🎮</div>
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">Ready to Play?</h2>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          20 random sports cards, one at a time. Snap decisions only — BUY to add to your collection, PASS to skip. See your collector personality at the end.
        </p>
        {stats.rounds > 0 && (
          <div className="bg-black/40 border border-gray-800 rounded-xl p-4 max-w-sm mx-auto mb-6">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Your Stats</div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-xs text-gray-500">Rounds</div>
                <div className="text-xl font-black text-white">{stats.rounds}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Biggest Haul</div>
                <div className="text-xl font-black text-pink-400">{formatMoney(stats.bestSpend)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Best FMV</div>
                <div className="text-xl font-black text-emerald-400">{formatMoney(stats.bestFmv)}</div>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={startRound}
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-500 text-white font-black text-lg hover:scale-105 transition-transform shadow-lg shadow-pink-500/30"
        >
          Start Round →
        </button>
      </div>
    );
  }

  if (phase === 'playing' && current) {
    const progress = ((index + 1) / deck.length) * 100;
    const sportColor = SPORT_COLORS[current.sport] || 'text-gray-400 bg-gray-500/10 border-gray-500/30';

    return (
      <div>
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Card {index + 1} of {deck.length}</div>
            <div className="text-xs text-gray-500">{choices.filter(c => c.decision === 'buy').length} bought</div>
          </div>
          <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-violet-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-gradient-to-br from-gray-900/80 to-black border border-gray-800 rounded-2xl p-6 sm:p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${sportColor}`}>
              {current.sport}
            </span>
            {current.rookie && (
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                ⭐ ROOKIE
              </span>
            )}
          </div>

          <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">{current.year} · {current.set}</div>
          <h3 className="text-2xl sm:text-3xl font-black text-white mb-1 leading-tight">{current.player}</h3>
          <div className="text-sm text-gray-400 mb-4">Card #{current.cardNumber}</div>

          <p className="text-sm text-gray-400 leading-relaxed mb-5 italic">&ldquo;{current.description}&rdquo;</p>

          <div className="bg-black/60 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Asking price</div>
              <div className="text-3xl sm:text-4xl font-black text-white mt-1">{formatMoney(askPrice)}</div>
            </div>
            <div className="text-right text-xs text-gray-600 font-mono">
              <div>raw condition</div>
              <div className="mt-1">gem-mint pot: {formatMoney(gemPrice)}</div>
            </div>
          </div>
        </div>

        {/* Decision buttons */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <button
            onClick={() => makeChoice('pass')}
            className="py-4 sm:py-6 rounded-2xl bg-gray-900/80 border-2 border-gray-800 hover:border-rose-500/60 hover:bg-rose-500/10 text-rose-400 font-black text-lg sm:text-xl transition-all"
          >
            ← PASS
          </button>
          <button
            onClick={() => makeChoice('buy')}
            className="py-4 sm:py-6 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/40 hover:bg-emerald-500/30 hover:border-emerald-500/60 text-emerald-300 font-black text-lg sm:text-xl transition-all"
          >
            BUY {formatMoney(askPrice)} →
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'results') {
    const bought = choices.filter(c => c.decision === 'buy');
    const totalSpend = bought.reduce((s, c) => s + c.askPrice, 0);
    const totalGem = bought.reduce((s, c) => s + c.gemPrice, 0);
    const upside = totalSpend > 0 ? ((totalGem - totalSpend) / totalSpend) * 100 : 0;
    const profile = computeProfile(choices);

    const buyRatio = bought.length / choices.length;
    const avgPrice = bought.length > 0 ? totalSpend / bought.length : 0;
    const sportsCount = new Set(bought.map(c => c.card.sport)).size;
    const eraSpread = bought.length > 0 ? Math.max(...bought.map(c => c.card.year)) - Math.min(...bought.map(c => c.card.year)) : 0;

    return (
      <div>
        {/* Profile hero */}
        <div className={`bg-gradient-to-br ${profile.gradient} border ${profile.border} rounded-2xl p-6 sm:p-8 mb-6 text-center`}>
          <div className="text-5xl mb-3">{profile.icon}</div>
          <div className="text-xs font-bold uppercase tracking-wider text-white/60 mb-1">You are a</div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">{profile.name}</h2>
          <p className="text-sm text-white/80 max-w-md mx-auto leading-relaxed">{profile.description}</p>
        </div>

        {/* Money stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <StatCard label="Bought" value={`${bought.length}/${choices.length}`} subtitle={`${Math.round(buyRatio * 100)}% buy rate`} />
          <StatCard label="Spent" value={formatMoney(totalSpend)} subtitle={bought.length > 0 ? `Avg ${formatMoney(avgPrice)}` : '—'} color="pink" />
          <StatCard label="Gem-Mint FMV" value={formatMoney(totalGem)} subtitle={`${upside > 0 ? '+' : ''}${upside.toFixed(0)}% upside`} color="emerald" />
        </div>

        {/* Deep stats */}
        <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-4 sm:p-6 mb-6">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Breakdown</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <MiniStat label="Sports" value={sportsCount} />
            <MiniStat label="Era Spread" value={`${eraSpread}y`} />
            <MiniStat label="Rookies" value={bought.filter(c => c.card.rookie).length} />
            <MiniStat label="Pre-1980" value={bought.filter(c => c.card.year < 1980).length} />
          </div>
        </div>

        {/* Purchased cards */}
        {bought.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-3">Your collection from this round</h3>
            <div className="space-y-2">
              {bought.map((c, i) => (
                <div key={i} className="bg-gray-900/40 border border-gray-800 rounded-xl p-3 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500">{c.card.year} {c.card.set}</div>
                    <div className="font-bold text-white text-sm truncate">{c.card.player}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm text-gray-400">Paid {formatMoney(c.askPrice)}</div>
                    <div className="text-xs text-emerald-400">Gem {formatMoney(c.gemPrice)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Share + Replay */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              const text = `Buy or Pass on CardVault — I'm a ${profile.name} ${profile.icon}\n\nBought ${bought.length}/${choices.length} cards\nSpent ${formatMoney(totalSpend)}\nGem-Mint FMV: ${formatMoney(totalGem)} (${upside > 0 ? '+' : ''}${upside.toFixed(0)}% upside)\n\nPlay: https://cardvault-two.vercel.app/buy-or-pass`;
              if (navigator.share) {
                navigator.share({ text }).catch(() => navigator.clipboard.writeText(text));
              } else {
                navigator.clipboard.writeText(text).then(() => alert('Copied to clipboard!'));
              }
            }}
            className="py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-500 text-white font-black hover:scale-105 transition-transform"
          >
            Share Result
          </button>
          <button
            onClick={() => { setPhase('config'); setChoices([]); setIndex(0); }}
            className="py-3 rounded-2xl bg-gray-900 border-2 border-gray-800 hover:border-pink-500/40 text-white font-black transition-colors"
          >
            New Round
          </button>
        </div>
      </div>
    );
  }

  return null;
}

function StatCard({ label, value, subtitle, color = 'white' }: { label: string; value: string; subtitle?: string; color?: string }) {
  const colors: Record<string, string> = {
    white: 'text-white',
    pink: 'text-pink-400',
    emerald: 'text-emerald-400',
  };
  return (
    <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-4">
      <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">{label}</div>
      <div className={`text-2xl font-black ${colors[color] || 'text-white'}`}>{value}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-xl font-black text-white">{value}</div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

interface Profile {
  name: string;
  icon: string;
  description: string;
  gradient: string;
  border: string;
}

function computeProfile(choices: Choice[]): Profile {
  const bought = choices.filter(c => c.decision === 'buy');
  if (bought.length === 0) {
    return {
      name: 'THE GHOST',
      icon: '👻',
      description: 'You passed on everything. Either you saw nothing you liked, or you are saving up for one very specific card. Patience is a collector virtue.',
      gradient: 'from-gray-500/20 to-gray-700/10',
      border: 'border-gray-500/40',
    };
  }

  const buyRatio = bought.length / choices.length;
  const totalSpend = bought.reduce((s, c) => s + c.askPrice, 0);
  const totalGem = bought.reduce((s, c) => s + c.gemPrice, 0);
  const avgPrice = totalSpend / bought.length;
  const sportsCount = new Set(bought.map(c => c.card.sport)).size;
  const eraSpread = Math.max(...bought.map(c => c.card.year)) - Math.min(...bought.map(c => c.card.year));
  const upsideRatio = totalSpend > 0 ? totalGem / totalSpend : 1;

  // Archetype selection
  if (buyRatio <= 0.25) {
    return {
      name: 'CAUTIOUS',
      icon: '🧘',
      description: 'You passed on most of what you saw. Patient and selective — the collector who buys 5 cards a year, each one a perfect fit for a long-term vision.',
      gradient: 'from-sky-500/20 to-blue-600/10',
      border: 'border-sky-500/40',
    };
  }

  if (avgPrice >= 5000 && buyRatio >= 0.4) {
    return {
      name: 'CHASER',
      icon: '🏆',
      description: 'You bought high-value cards on instinct. Price barely matters — the grail-hunting drive takes over. Your collection is a shortlist of prestige pieces.',
      gradient: 'from-pink-500/20 to-fuchsia-600/10',
      border: 'border-pink-500/40',
    };
  }

  if (upsideRatio >= 5 && buyRatio <= 0.5) {
    return {
      name: 'DEAL HUNTER',
      icon: '💰',
      description: 'You bought only when the gem-mint upside dwarfed your cost. Flipper mindset — every purchase is a trade setup. You are here to profit, not to collect.',
      gradient: 'from-emerald-500/20 to-green-600/10',
      border: 'border-emerald-500/40',
    };
  }

  if (sportsCount >= 3 && eraSpread >= 30) {
    return {
      name: 'TASTEMAKER',
      icon: '🎨',
      description: 'You bought across sports, eras, and price tiers. No single-category collection — a curated mix that reflects broad card IQ. Your binder tells a story.',
      gradient: 'from-violet-500/20 to-purple-600/10',
      border: 'border-violet-500/40',
    };
  }

  return {
    name: 'BREAKEVEN BOUNTY',
    icon: '⚖️',
    description: 'You bought at fair market — nothing more, nothing less. Ruthless about paying the right price. Spread bets evenly. Neither a flipper nor a grail chaser — a true market-price collector.',
    gradient: 'from-amber-500/20 to-yellow-600/10',
    border: 'border-amber-500/40',
  };
}

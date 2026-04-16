'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ── helpers ─────────────────────────────────────────────────────── */

function dateHash(d: Date): number {
  const str = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRng(seed: number) {
  let s = seed || 42;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function parseValue(raw: string): number {
  const m = raw.match(/\$(\d[\d,]*)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function formatMoney(n: number): string {
  return n >= 1000 ? `$${n.toLocaleString()}` : `$${n}`;
}

const sportColors: Record<string, string> = {
  baseball: 'border-red-800/50 bg-red-900/20',
  basketball: 'border-orange-800/50 bg-orange-900/20',
  football: 'border-green-800/50 bg-green-900/20',
  hockey: 'border-blue-800/50 bg-blue-900/20',
};

const sportEmoji: Record<string, string> = {
  baseball: '\u26be', basketball: '\ud83c\udfc0', football: '\ud83c\udfc8', hockey: '\ud83c\udfd2',
};

type SportFilter = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey';
type GameMode = 'daily' | 'random';

interface BracketCard {
  seed: number;
  player: string;
  name: string;
  sport: string;
  year: number;
  value: number;
  slug: string;
  rookie: boolean;
}

const BRACKET_SIZE = 16;
const ROUND_NAMES = ['Sweet 16', 'Elite 8', 'Final 4', 'Championship'];

/* ── component ───────────────────────────────────────────────────── */

export default function CardBracketClient() {
  const [mode, setMode] = useState<GameMode>('daily');
  const [sportFilter, setSportFilter] = useState<SportFilter>('all');
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'result'>('menu');
  const [bracket, setBracket] = useState<BracketCard[]>([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [matchIndex, setMatchIndex] = useState(0);
  const [currentRound, setCurrentRound] = useState<BracketCard[]>([]);
  const [nextRound, setNextRound] = useState<BracketCard[]>([]);
  const [champion, setChampion] = useState<BracketCard | null>(null);
  const [allPicks, setAllPicks] = useState<string[]>([]);
  const [stats, setStats] = useState({ played: 0, upsets: 0 });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cv-bracket-stats');
      if (saved) setStats(JSON.parse(saved));
    } catch { /* empty */ }
  }, []);

  const startGame = useCallback(() => {
    const seed = mode === 'daily' ? dateHash(new Date()) + (sportFilter === 'all' ? 0 : sportFilter.charCodeAt(0)) : Date.now();
    const rng = seededRng(seed);

    const eligible = (sportFilter === 'all' ? sportsCards : sportsCards.filter(c => c.sport === sportFilter))
      .filter(c => parseValue(c.estimatedValueRaw) > 0);

    // Dedupe by player, pick 16
    const seen = new Set<string>();
    const pool: typeof sportsCards = [];
    for (const c of shuffle(eligible, rng)) {
      if (seen.has(c.player)) continue;
      seen.add(c.player);
      pool.push(c);
      if (pool.length >= BRACKET_SIZE) break;
    }

    // Sort by value descending for seeding
    pool.sort((a, b) => parseValue(b.estimatedValueRaw) - parseValue(a.estimatedValueRaw));

    const bracketCards: BracketCard[] = pool.map((c, i) => ({
      seed: i + 1,
      player: c.player,
      name: c.name,
      sport: c.sport,
      year: c.year,
      value: parseValue(c.estimatedValueRaw),
      slug: c.slug,
      rookie: c.rookie,
    }));

    // Arrange in bracket order: 1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15
    const order = [0, 15, 7, 8, 4, 11, 3, 12, 5, 10, 2, 13, 6, 9, 1, 14];
    const arranged = order.map(i => bracketCards[i]).filter(Boolean);

    setBracket(arranged);
    setCurrentRound(arranged);
    setNextRound([]);
    setRoundIndex(0);
    setMatchIndex(0);
    setChampion(null);
    setAllPicks([]);
    setGameState('playing');
  }, [mode, sportFilter]);

  const pickWinner = useCallback((card: BracketCard) => {
    const newNext = [...nextRound, card];
    const newPicks = [...allPicks, card.player];
    setNextRound(newNext);
    setAllPicks(newPicks);

    const matchesInRound = currentRound.length / 2;

    if (matchIndex + 1 >= matchesInRound) {
      // Round complete
      if (newNext.length === 1) {
        // Champion!
        setChampion(newNext[0]);
        const upsets = newPicks.filter((p, i) => {
          // Check if lower seed won (simplified)
          return false; // simplified — just count
        }).length;
        const newStats = { played: stats.played + 1, upsets: stats.upsets };
        setStats(newStats);
        try { localStorage.setItem('cv-bracket-stats', JSON.stringify(newStats)); } catch { /* empty */ }
        setGameState('result');
      } else {
        setCurrentRound(newNext);
        setNextRound([]);
        setRoundIndex(r => r + 1);
        setMatchIndex(0);
      }
    } else {
      setMatchIndex(m => m + 1);
    }
  }, [currentRound, nextRound, matchIndex, allPicks, stats]);

  const shareResults = useCallback(() => {
    if (!champion) return;
    const text = `Card Bracket Challenge ${mode === 'daily' ? '(Daily)' : ''}\n\ud83c\udfc6 Champion: ${champion.player} (#${champion.seed} seed)\n${allPicks.length} picks made\nhttps://cardvault-two.vercel.app/card-bracket`;
    navigator.clipboard.writeText(text).catch(() => {});
  }, [champion, allPicks, mode]);

  /* ── render: menu ─────────────────────────────────────────────── */
  if (gameState === 'menu') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3 text-center">
            <div className="text-white font-bold text-lg">{stats.played}</div>
            <div className="text-zinc-500 text-xs">Brackets Filled</div>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3 text-center">
            <div className="text-white font-bold text-lg">{stats.played * 15}</div>
            <div className="text-zinc-500 text-xs">Total Picks</div>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-3">Game Mode</h3>
          <div className="flex gap-3">
            <button onClick={() => setMode('daily')} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${mode === 'daily' ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
              Daily Bracket
            </button>
            <button onClick={() => setMode('random')} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${mode === 'random' ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
              Random Bracket
            </button>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-3">Sport</h3>
          <div className="flex flex-wrap gap-2">
            {(['all', 'baseball', 'basketball', 'football', 'hockey'] as SportFilter[]).map(s => (
              <button key={s} onClick={() => setSportFilter(s)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${sportFilter === s ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
                {s === 'all' ? 'All Sports' : `${sportEmoji[s]} ${s.charAt(0).toUpperCase() + s.slice(1)}`}
              </button>
            ))}
          </div>
        </div>

        <button onClick={startGame} className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold text-lg rounded-xl transition-colors">
          Start Bracket (16 Cards, 15 Picks)
        </button>
      </div>
    );
  }

  /* ── render: playing ──────────────────────────────────────────── */
  if (gameState === 'playing') {
    const cardA = currentRound[matchIndex * 2];
    const cardB = currentRound[matchIndex * 2 + 1];
    if (!cardA || !cardB) return null;

    const matchesInRound = currentRound.length / 2;
    const totalPicks = allPicks.length;

    return (
      <div className="space-y-5">
        {/* Progress */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-purple-400 font-bold text-sm">{ROUND_NAMES[roundIndex]}</span>
            <span className="text-zinc-500 text-sm ml-2">Match {matchIndex + 1}/{matchesInRound}</span>
          </div>
          <span className="text-zinc-500 text-sm">{totalPicks}/15 picks</span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full">
          <div className="bg-purple-500 h-2 rounded-full transition-all" style={{ width: `${(totalPicks / 15) * 100}%` }} />
        </div>

        <div className="text-center text-zinc-400 text-sm mb-2">Which card would you rather own?</div>

        {/* Matchup */}
        <div className="grid grid-cols-2 gap-3">
          {[cardA, cardB].map((card) => (
            <button key={card.seed} onClick={() => pickWinner(card)} className={`text-left border rounded-xl p-4 transition-all hover:scale-[1.02] hover:shadow-lg ${sportColors[card.sport]} hover:border-purple-500`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-zinc-500">#{card.seed} seed</span>
                <span className="text-lg">{sportEmoji[card.sport]}</span>
              </div>
              <div className="text-white font-bold text-sm mb-1">{card.player}</div>
              <div className="text-zinc-500 text-xs mb-2 line-clamp-2">{card.name}</div>
              <div className="flex items-center justify-between">
                <span className="text-white font-medium text-sm">{formatMoney(card.value)}</span>
                {card.rookie && <span className="text-yellow-500 text-xs font-bold">RC</span>}
              </div>
              <div className="text-zinc-600 text-xs mt-1">{card.year}</div>
            </button>
          ))}
        </div>

        {/* Bracket progress visualization */}
        {allPicks.length > 0 && (
          <div className="text-center text-xs text-zinc-600">
            Picks: {allPicks.map((p, i) => (
              <span key={i} className="text-zinc-500">{i > 0 ? ' > ' : ''}{p.split(' ').pop()}</span>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── render: result ───────────────────────────────────────────── */
  if (gameState === 'result' && champion) {
    return (
      <div className="space-y-5">
        <div className="bg-zinc-900/60 border border-purple-800/50 rounded-xl p-6 text-center">
          <div className="text-4xl mb-2">{'\ud83c\udfc6'}</div>
          <div className="text-purple-400 text-sm font-medium mb-1">Your Champion</div>
          <div className="text-white text-2xl font-black">{champion.player}</div>
          <div className="text-zinc-400 text-sm mt-1">{champion.name}</div>
          <div className="flex justify-center gap-4 mt-3">
            <span className="text-zinc-500 text-sm">#{champion.seed} seed</span>
            <span className="text-white font-medium">{formatMoney(champion.value)}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${sportColors[champion.sport]}`}>
              {sportEmoji[champion.sport]} {champion.sport}
            </span>
          </div>
        </div>

        {/* All picks */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-3 text-sm">Your Bracket Path</h3>
          <div className="space-y-1">
            {allPicks.map((pick, i) => {
              const roundName = i < 8 ? 'R1' : i < 12 ? 'R2' : i < 14 ? 'R3' : 'Final';
              return (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="text-zinc-600 w-10">{roundName}</span>
                  <span className={`text-zinc-300 ${pick === champion.player ? 'text-purple-400 font-bold' : ''}`}>{pick}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={shareResults} className="flex-1 py-3 bg-zinc-700 hover:bg-zinc-600 text-white font-medium rounded-xl transition-colors text-sm">
            Copy Results
          </button>
          <button onClick={() => setGameState('menu')} className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors text-sm">
            New Bracket
          </button>
        </div>
      </div>
    );
  }

  return null;
}

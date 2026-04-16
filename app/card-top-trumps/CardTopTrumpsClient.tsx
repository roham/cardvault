'use client';

import { useState, useMemo, useCallback } from 'react';
import { sportsCards } from '@/data/sports-cards';

interface TrumpCard {
  slug: string;
  name: string;
  player: string;
  sport: string;
  year: number;
  valueRaw: number;
  valueGem: number;
  rookie: boolean;
  set: string;
}

type GameState = 'menu' | 'pick' | 'reveal' | 'won' | 'lost' | 'draw';
type Stat = 'year' | 'valueRaw' | 'valueGem' | 'age' | 'rookieBonus';

function parseValue(val: string): number {
  const m = val.match(/\$([0-9,.]+)/);
  return m ? parseFloat(m[1].replace(',', '')) : 5;
}

function seededRng(seed: number): () => number {
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

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const SPORT_LABELS: Record<string, string> = { baseball: 'MLB', basketball: 'NBA', football: 'NFL', hockey: 'NHL' };
const SPORT_COLORS: Record<string, string> = { baseball: 'text-red-400', basketball: 'text-orange-400', football: 'text-blue-400', hockey: 'text-cyan-400' };

const STATS: { key: Stat; label: string; desc: string; higherWins: boolean }[] = [
  { key: 'valueRaw', label: 'Raw Value', desc: 'PSA 9 estimated value', higherWins: true },
  { key: 'valueGem', label: 'Gem Value', desc: 'PSA 10 / BGS 9.5 estimated value', higherWins: true },
  { key: 'year', label: 'Card Year', desc: 'Year card was produced', higherWins: true },
  { key: 'age', label: 'Card Age', desc: 'Years since card was made', higherWins: true },
  { key: 'rookieBonus', label: 'Rookie Power', desc: 'Rookie cards score 100, others 0', higherWins: true },
];

function getStatValue(card: TrumpCard, stat: Stat): number {
  switch (stat) {
    case 'valueRaw': return card.valueRaw;
    case 'valueGem': return card.valueGem;
    case 'year': return card.year;
    case 'age': return new Date().getFullYear() - card.year;
    case 'rookieBonus': return card.rookie ? 100 : 0;
  }
}

function formatStatValue(stat: Stat, val: number): string {
  switch (stat) {
    case 'valueRaw': return `$${val.toLocaleString()}`;
    case 'valueGem': return `$${val.toLocaleString()}`;
    case 'year': return val.toString();
    case 'age': return `${val} yr${val !== 1 ? 's' : ''}`;
    case 'rookieBonus': return val === 100 ? 'RC' : 'Base';
  }
}

function getGrade(wins: number, total: number): { grade: string; color: string } {
  const pct = total > 0 ? wins / total : 0;
  if (pct >= 0.9) return { grade: 'S', color: 'text-yellow-400' };
  if (pct >= 0.75) return { grade: 'A', color: 'text-green-400' };
  if (pct >= 0.6) return { grade: 'B', color: 'text-blue-400' };
  if (pct >= 0.4) return { grade: 'C', color: 'text-gray-400' };
  if (pct >= 0.2) return { grade: 'D', color: 'text-orange-400' };
  return { grade: 'F', color: 'text-red-400' };
}

const STATS_KEY = 'cv_toptrumps_stats';

interface GameStats {
  played: number;
  bestWins: number;
  totalWins: number;
  totalRounds: number;
}

function loadStats(): GameStats {
  if (typeof window === 'undefined') return { played: 0, bestWins: 0, totalWins: 0, totalRounds: 0 };
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw ? JSON.parse(raw) : { played: 0, bestWins: 0, totalWins: 0, totalRounds: 0 };
  } catch { return { played: 0, bestWins: 0, totalWins: 0, totalRounds: 0 }; }
}

function saveStats(s: GameStats) {
  try { localStorage.setItem(STATS_KEY, JSON.stringify(s)); } catch {}
}

export default function CardTopTrumpsClient() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [mode, setMode] = useState<'daily' | 'random'>('daily');
  const [sportFilter, setSportFilter] = useState('all');
  const [playerDeck, setPlayerDeck] = useState<TrumpCard[]>([]);
  const [cpuDeck, setCpuDeck] = useState<TrumpCard[]>([]);
  const [round, setRound] = useState(0);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [draws, setDraws] = useState(0);
  const [selectedStat, setSelectedStat] = useState<Stat | null>(null);
  const [roundResult, setRoundResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [stats, setStats] = useState<GameStats>(loadStats);
  const totalRounds = 10;

  const allCards = useMemo(() => {
    return sportsCards
      .filter(c => sportFilter === 'all' || c.sport === sportFilter)
      .map(c => ({
        slug: c.slug,
        name: c.name,
        player: c.player,
        sport: c.sport,
        year: c.year,
        valueRaw: parseValue(c.estimatedValueRaw),
        valueGem: parseValue(c.estimatedValueGem),
        rookie: c.rookie,
        set: c.set,
      }));
  }, [sportFilter]);

  const startGame = useCallback((m: 'daily' | 'random') => {
    const seed = m === 'daily' ? dateHash() + 777 : Math.floor(Math.random() * 999999);
    const rng = seededRng(seed);
    const pool = shuffle(allCards, rng);
    if (pool.length < totalRounds * 2) return;
    setPlayerDeck(pool.slice(0, totalRounds));
    setCpuDeck(pool.slice(totalRounds, totalRounds * 2));
    setMode(m);
    setRound(0);
    setWins(0);
    setLosses(0);
    setDraws(0);
    setSelectedStat(null);
    setRoundResult(null);
    setGameState('pick');
  }, [allCards]);

  const pickStat = useCallback((stat: Stat) => {
    if (gameState !== 'pick' || round >= totalRounds) return;
    setSelectedStat(stat);

    const myCard = playerDeck[round];
    const cpuCard = cpuDeck[round];
    const myVal = getStatValue(myCard, stat);
    const cpuVal = getStatValue(cpuCard, stat);

    let result: 'win' | 'lose' | 'draw';
    if (myVal > cpuVal) result = 'win';
    else if (cpuVal > myVal) result = 'lose';
    else result = 'draw';

    setRoundResult(result);
    if (result === 'win') setWins(w => w + 1);
    else if (result === 'lose') setLosses(l => l + 1);
    else setDraws(d => d + 1);

    setGameState('reveal');
  }, [gameState, round, playerDeck, cpuDeck]);

  const nextRound = useCallback(() => {
    const nextR = round + 1;
    if (nextR >= totalRounds) {
      // Game over
      const finalWins = wins + (roundResult === 'win' ? 0 : 0); // already counted
      const finalState = wins > losses ? 'won' : wins < losses ? 'lost' : 'draw';
      setGameState(finalState);
      const ns = { ...stats };
      ns.played++;
      ns.bestWins = Math.max(ns.bestWins, wins);
      ns.totalWins += wins;
      ns.totalRounds += totalRounds;
      setStats(ns);
      saveStats(ns);
      return;
    }
    setRound(nextR);
    setSelectedStat(null);
    setRoundResult(null);
    setGameState('pick');
  }, [round, wins, losses, roundResult, stats]);

  const shareResults = useCallback(() => {
    const grade = getGrade(wins, totalRounds);
    const text = `Card Top Trumps ${mode === 'daily' ? 'Daily' : 'Random'}\n${wins}W-${losses}L-${draws}D\nGrade: ${grade.grade}\nhttps://cardvault-two.vercel.app/card-top-trumps`;
    navigator.clipboard.writeText(text).catch(() => {});
  }, [wins, losses, draws, mode]);

  if (gameState === 'menu') {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2 justify-center">
          {['all', 'baseball', 'basketball', 'football', 'hockey'].map(s => (
            <button key={s} onClick={() => setSportFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${sportFilter === s ? 'bg-teal-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
              {s === 'all' ? 'All Sports' : SPORT_LABELS[s] || s}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => startGame('daily')} className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition text-lg">
            Daily Battle
          </button>
          <button onClick={() => startGame('random')} className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition text-lg">
            Random Battle
          </button>
        </div>

        <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-5">
          <h3 className="text-lg font-bold text-white mb-3">How to Play</h3>
          <ol className="space-y-2 text-gray-300 text-sm list-decimal list-inside">
            <li>You and the CPU each get 10 random sports cards</li>
            <li>Each round, you see YOUR card face-up and the CPU&rsquo;s card face-down</li>
            <li>Pick a stat category (Raw Value, Gem Value, Year, Age, Rookie Power)</li>
            <li>Higher stat wins the round &mdash; strategize based on your card&rsquo;s strengths</li>
            <li>Win more rounds than the CPU to claim victory</li>
          </ol>
        </div>

        {stats.played > 0 && (
          <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-5">
            <h3 className="text-lg font-bold text-white mb-3">Your Stats</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div><p className="text-2xl font-bold text-teal-400">{stats.played}</p><p className="text-xs text-gray-400">Games</p></div>
              <div><p className="text-2xl font-bold text-green-400">{stats.bestWins}</p><p className="text-xs text-gray-400">Best Wins</p></div>
              <div><p className="text-2xl font-bold text-yellow-400">{stats.totalWins}</p><p className="text-xs text-gray-400">Total Wins</p></div>
              <div><p className="text-2xl font-bold text-blue-400">{stats.totalRounds > 0 ? Math.round(stats.totalWins / stats.totalRounds * 100) : 0}%</p><p className="text-xs text-gray-400">Win Rate</p></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Game over states
  if (gameState === 'won' || gameState === 'lost' || gameState === 'draw') {
    const grade = getGrade(wins, totalRounds);
    return (
      <div className="space-y-6 text-center">
        <p className="text-3xl font-black">{gameState === 'won' ? 'Victory!' : gameState === 'lost' ? 'Defeated' : 'Draw!'}</p>
        <p className={`text-6xl font-black ${grade.color}`}>{grade.grade}</p>
        <div className="flex justify-center gap-6">
          <div><p className="text-2xl font-bold text-green-400">{wins}</p><p className="text-xs text-gray-400">Wins</p></div>
          <div><p className="text-2xl font-bold text-red-400">{losses}</p><p className="text-xs text-gray-400">Losses</p></div>
          <div><p className="text-2xl font-bold text-gray-400">{draws}</p><p className="text-xs text-gray-400">Draws</p></div>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={shareResults} className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm font-bold transition">Share Results</button>
          <button onClick={() => setGameState('menu')} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition">Play Again</button>
        </div>
      </div>
    );
  }

  // Playing states (pick or reveal)
  const myCard = playerDeck[round];
  const cpuCard = cpuDeck[round];

  return (
    <div className="space-y-4">
      {/* Score bar */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">Round {round + 1}/{totalRounds}</span>
        <div className="flex gap-3">
          <span className="text-green-400 font-bold">{wins}W</span>
          <span className="text-red-400 font-bold">{losses}L</span>
          <span className="text-gray-500 font-bold">{draws}D</span>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Player card */}
        <div className="bg-gray-900/80 border-2 border-teal-600/60 rounded-xl p-4">
          <p className="text-xs text-teal-400 font-bold mb-2 uppercase tracking-wider">Your Card</p>
          <p className="text-sm font-bold text-white mb-1 leading-tight">{myCard.player}</p>
          <p className={`text-xs ${SPORT_COLORS[myCard.sport]} mb-3`}>{SPORT_LABELS[myCard.sport]} &middot; {myCard.year}{myCard.rookie ? ' · RC' : ''}</p>
          <div className="space-y-1.5">
            {STATS.map(s => {
              const val = getStatValue(myCard, s.key);
              const isSelected = selectedStat === s.key;
              const isWin = roundResult === 'win' && isSelected;
              const isLose = roundResult === 'lose' && isSelected;
              return (
                <button key={s.key} onClick={() => gameState === 'pick' ? pickStat(s.key) : undefined} disabled={gameState !== 'pick'}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition
                    ${gameState === 'pick' ? 'hover:bg-teal-900/50 cursor-pointer' : 'cursor-default'}
                    ${isSelected ? (isWin ? 'bg-green-900/50 ring-1 ring-green-500' : isLose ? 'bg-red-900/50 ring-1 ring-red-500' : 'bg-yellow-900/50 ring-1 ring-yellow-500') : 'bg-gray-800/50'}`}>
                  <span className="text-gray-400">{s.label}</span>
                  <span className="text-white font-bold">{formatStatValue(s.key, val)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CPU card */}
        <div className={`bg-gray-900/80 border-2 rounded-xl p-4 ${gameState === 'reveal' ? 'border-red-600/60' : 'border-gray-600/40'}`}>
          <p className="text-xs text-red-400 font-bold mb-2 uppercase tracking-wider">CPU Card</p>
          {gameState === 'reveal' ? (
            <>
              <p className="text-sm font-bold text-white mb-1 leading-tight">{cpuCard.player}</p>
              <p className={`text-xs ${SPORT_COLORS[cpuCard.sport]} mb-3`}>{SPORT_LABELS[cpuCard.sport]} &middot; {cpuCard.year}{cpuCard.rookie ? ' · RC' : ''}</p>
              <div className="space-y-1.5">
                {STATS.map(s => {
                  const val = getStatValue(cpuCard, s.key);
                  const isSelected = selectedStat === s.key;
                  return (
                    <div key={s.key} className={`w-full flex items-center justify-between p-2 rounded-lg text-xs
                      ${isSelected ? (roundResult === 'lose' ? 'bg-green-900/50 ring-1 ring-green-500' : roundResult === 'win' ? 'bg-red-900/50 ring-1 ring-red-500' : 'bg-yellow-900/50 ring-1 ring-yellow-500') : 'bg-gray-800/50'}`}>
                      <span className="text-gray-400">{s.label}</span>
                      <span className="text-white font-bold">{formatStatValue(s.key, val)}</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[180px] sm:h-[220px]">
              <span className="text-5xl mb-2">🂠</span>
              <p className="text-gray-500 text-xs">Pick a stat to reveal</p>
            </div>
          )}
        </div>
      </div>

      {/* Round result + next */}
      {gameState === 'reveal' && (
        <div className="text-center space-y-3">
          <p className={`text-xl font-black ${roundResult === 'win' ? 'text-green-400' : roundResult === 'lose' ? 'text-red-400' : 'text-yellow-400'}`}>
            {roundResult === 'win' ? 'You Win This Round!' : roundResult === 'lose' ? 'CPU Wins This Round!' : 'Draw!'}
          </p>
          <button onClick={nextRound} className="px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold transition">
            {round + 1 >= totalRounds ? 'See Results' : 'Next Round →'}
          </button>
        </div>
      )}

      {/* Pick prompt */}
      {gameState === 'pick' && (
        <p className="text-center text-gray-400 text-sm animate-pulse">
          ↑ Tap a stat on your card to challenge the CPU
        </p>
      )}
    </div>
  );
}

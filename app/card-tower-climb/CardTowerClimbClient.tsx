'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

type GameState = 'menu' | 'playing' | 'busted' | 'cashed' | 'crown';
type Mode = 'daily' | 'random';
type SportFilter = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey';

interface TCard {
  slug: string;
  name: string;
  player: string;
  sport: string;
  year: number;
  value: number;
}

interface Floor {
  tiles: TCard[];
  safeIdx: number;
  multiplier: number;
  tierLabel: string;
}

interface ClimbStats {
  games: number;
  bestScore: number;
  longestClimb: number;
  crowns: number;
  busts: number;
  cashOuts: number;
}

const STORAGE_KEY = 'cv_card_tower_climb_stats_v1';

const FLOOR_CONFIG: Array<{ mult: number; minVal: number; maxVal: number; tier: string }> = [
  { mult: 1.0, minVal: 5, maxVal: 25, tier: 'Common $5–25' },
  { mult: 1.2, minVal: 5, maxVal: 50, tier: 'Common $5–50' },
  { mult: 1.4, minVal: 25, maxVal: 100, tier: 'Mid $25–100' },
  { mult: 1.6, minVal: 50, maxVal: 250, tier: 'Mid $50–250' },
  { mult: 2.0, minVal: 100, maxVal: 500, tier: 'Mid $100–500' },
  { mult: 2.5, minVal: 250, maxVal: 1000, tier: 'High $250–1K' },
  { mult: 3.0, minVal: 500, maxVal: 2000, tier: 'High $500–2K' },
  { mult: 4.0, minVal: 1000, maxVal: 5000, tier: 'Elite $1K–5K' },
  { mult: 5.0, minVal: 2000, maxVal: 10000, tier: 'Elite $2K–10K' },
  { mult: 8.0, minVal: 5000, maxVal: 1000000, tier: 'Trophy $5K+' },
];

const CROWN_BONUS = 10000;

function seededRng(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function dateHash(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function parseValue(v: string): number {
  const m = v.match(/\$([0-9,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 5;
}

function formatMoney(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`;
  if (n >= 10000) return `$${(n / 1000).toFixed(1)}K`;
  if (n >= 1000) return `$${(n / 1000).toFixed(2)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

function gradeFor(bank: number): string {
  if (bank >= 25000) return 'S';
  if (bank >= 10000) return 'A';
  if (bank >= 3500) return 'B';
  if (bank >= 1500) return 'C';
  if (bank >= 500) return 'D';
  return 'F';
}

function buildTower(mode: Mode, sport: SportFilter): Floor[] {
  const sportLetter = sport === 'all' ? 0 : sport.charCodeAt(0);
  const seed = mode === 'daily' ? dateHash() + sportLetter : Math.floor(Math.random() * 1e9);
  const rng = seededRng(seed);

  const filtered = sport === 'all'
    ? sportsCards
    : sportsCards.filter((c) => c.sport === sport);

  const pool: TCard[] = filtered.map((c) => ({
    slug: c.slug,
    name: c.name,
    player: c.player,
    sport: c.sport,
    year: c.year,
    value: parseValue(c.estimatedValueRaw || c.estimatedValueGem || '$5'),
  }));

  return FLOOR_CONFIG.map((cfg, floorIdx) => {
    const tierPool = pool.filter((c) => c.value >= cfg.minVal && c.value <= cfg.maxVal);
    const active = tierPool.length >= 3 ? tierPool : pool;

    const picks: TCard[] = [];
    const used = new Set<string>();
    let attempts = 0;
    while (picks.length < 3 && attempts < 200) {
      attempts++;
      const c = active[Math.floor(rng() * active.length)];
      if (c && !used.has(c.slug)) {
        picks.push(c);
        used.add(c.slug);
      }
    }
    while (picks.length < 3) {
      const c = pool[Math.floor(rng() * pool.length)];
      if (c && !used.has(c.slug)) {
        picks.push(c);
        used.add(c.slug);
      }
    }

    const safeIdx = Math.floor(rng() * 3);
    return { tiles: picks, safeIdx, multiplier: cfg.mult, tierLabel: cfg.tier };
    void floorIdx;
  });
}

export default function CardTowerClimbClient() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [mode, setMode] = useState<Mode>('daily');
  const [sport, setSport] = useState<SportFilter>('all');
  const [tower, setTower] = useState<Floor[]>([]);
  const [currentFloor, setCurrentFloor] = useState(0);
  const [bank, setBank] = useState(0);
  const [lastPickIdx, setLastPickIdx] = useState<number | null>(null);
  const [path, setPath] = useState<Array<{ floor: number; safe: boolean; card: TCard; gain: number }>>([]);
  const [stats, setStats] = useState<ClimbStats>({ games: 0, bestScore: 0, longestClimb: 0, crowns: 0, busts: 0, cashOuts: 0 });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setStats({ ...stats, ...JSON.parse(raw) });
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistStats = useCallback((s: ClimbStats) => {
    setStats(s);
    if (typeof window !== 'undefined') {
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
    }
  }, []);

  function startGame() {
    const t = buildTower(mode, sport);
    setTower(t);
    setCurrentFloor(0);
    setBank(0);
    setLastPickIdx(null);
    setPath([]);
    setGameState('playing');
  }

  function pickTile(idx: number) {
    if (gameState !== 'playing') return;
    const floor = tower[currentFloor];
    setLastPickIdx(idx);
    const safe = idx === floor.safeIdx;
    const card = floor.tiles[idx];
    if (!safe) {
      const newStats: ClimbStats = {
        ...stats,
        games: stats.games + 1,
        busts: stats.busts + 1,
        longestClimb: Math.max(stats.longestClimb, currentFloor),
      };
      persistStats(newStats);
      setPath([...path, { floor: currentFloor + 1, safe: false, card, gain: 0 }]);
      setGameState('busted');
      return;
    }
    const gain = Math.round(card.value * floor.multiplier);
    const newBank = bank + gain;
    setBank(newBank);
    setPath([...path, { floor: currentFloor + 1, safe: true, card, gain }]);

    if (currentFloor === 9) {
      const finalBank = newBank + CROWN_BONUS;
      setBank(finalBank);
      const newStats: ClimbStats = {
        ...stats,
        games: stats.games + 1,
        crowns: stats.crowns + 1,
        longestClimb: 10,
        bestScore: Math.max(stats.bestScore, finalBank),
      };
      persistStats(newStats);
      setGameState('crown');
      return;
    }
    setCurrentFloor(currentFloor + 1);
    setLastPickIdx(null);
  }

  function cashOut() {
    if (gameState !== 'playing' || currentFloor === 0) return;
    const newStats: ClimbStats = {
      ...stats,
      games: stats.games + 1,
      cashOuts: stats.cashOuts + 1,
      longestClimb: Math.max(stats.longestClimb, currentFloor),
      bestScore: Math.max(stats.bestScore, bank),
    };
    persistStats(newStats);
    setGameState('cashed');
  }

  function reset() {
    setGameState('menu');
    setTower([]);
    setCurrentFloor(0);
    setBank(0);
    setPath([]);
    setLastPickIdx(null);
  }

  const grade = useMemo(() => gradeFor(bank), [bank]);

  const shareText = useMemo(() => {
    const ladder = path.slice().reverse().map((p) => {
      const floorLabel = `F${String(p.floor).padStart(2, '0')}`;
      const emoji = p.safe ? (p.floor === 10 ? '👑' : '🟩') : '💥';
      return `${floorLabel} ${emoji}`;
    }).join('\n');
    const modeTag = mode === 'daily' ? 'Daily' : 'Random';
    const sportTag = sport === 'all' ? 'All Sports' : sport[0].toUpperCase() + sport.slice(1);
    return `Card Tower Climb — ${modeTag} ${sportTag}
${gameState === 'crown' ? '👑 CROWN' : gameState === 'busted' ? '💥 BUST' : 'CASH OUT'}
Bank: ${formatMoney(bank)} · Grade ${grade}
Reached floor: ${currentFloor + (gameState === 'crown' ? 1 : gameState === 'busted' ? 0 : 1)}

${ladder}

cardvault-two.vercel.app/card-tower-climb`;
  }, [path, bank, grade, mode, sport, gameState, currentFloor]);

  function copyShare() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }).catch(() => {});
    }
  }

  const floor = gameState === 'playing' ? tower[currentFloor] : null;
  const remainingBustOdds = gameState === 'playing'
    ? (2 / 3 * 100).toFixed(1)
    : '0';

  return (
    <div>
      {/* MENU */}
      {gameState === 'menu' && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
          <h2 className="mb-3 text-lg font-semibold text-amber-200">Climb the tower</h2>
          <p className="mb-4 text-sm text-slate-300">
            Each floor: pick the safe tile from three. Bank grows with every correct pick. Cash out any floor to lock it in. One wrong pick and you fall — lose everything.
          </p>
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">Mode</label>
              <div className="flex gap-2">
                <button onClick={() => setMode('daily')} className={`flex-1 rounded-lg border px-3 py-2 text-sm ${mode === 'daily' ? 'border-amber-500/60 bg-amber-500/10 text-amber-200' : 'border-slate-700 bg-slate-900 text-slate-400'}`}>Daily</button>
                <button onClick={() => setMode('random')} className={`flex-1 rounded-lg border px-3 py-2 text-sm ${mode === 'random' ? 'border-amber-500/60 bg-amber-500/10 text-amber-200' : 'border-slate-700 bg-slate-900 text-slate-400'}`}>Random</button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">Sport</label>
              <select value={sport} onChange={(e) => setSport(e.target.value as SportFilter)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200">
                <option value="all">All sports</option>
                <option value="baseball">Baseball</option>
                <option value="basketball">Basketball</option>
                <option value="football">Football</option>
                <option value="hockey">Hockey</option>
              </select>
            </div>
          </div>
          <button onClick={startGame} className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-base font-bold text-white shadow-lg shadow-amber-500/30 hover:brightness-110">
            Start climb →
          </button>

          <div className="mt-6 grid grid-cols-3 gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-center text-xs">
            <div><div className="text-slate-500 text-[10px] uppercase">Games</div><div className="text-lg font-bold text-slate-200">{stats.games}</div></div>
            <div><div className="text-slate-500 text-[10px] uppercase">Best</div><div className="text-lg font-bold text-amber-300">{formatMoney(stats.bestScore)}</div></div>
            <div><div className="text-slate-500 text-[10px] uppercase">Longest</div><div className="text-lg font-bold text-slate-200">F{stats.longestClimb}</div></div>
            <div><div className="text-slate-500 text-[10px] uppercase">Crowns</div><div className="text-lg font-bold text-yellow-400">{stats.crowns} 👑</div></div>
            <div><div className="text-slate-500 text-[10px] uppercase">Cash Outs</div><div className="text-lg font-bold text-emerald-400">{stats.cashOuts}</div></div>
            <div><div className="text-slate-500 text-[10px] uppercase">Busts</div><div className="text-lg font-bold text-rose-400">{stats.busts}</div></div>
          </div>
        </div>
      )}

      {/* PLAYING */}
      {gameState === 'playing' && floor && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3">
            <div className="text-sm">
              <span className="text-slate-400">Floor</span>{' '}
              <span className="font-bold text-amber-300">F{currentFloor + 1}</span>
              <span className="mx-2 text-slate-700">·</span>
              <span className="text-slate-400">Multiplier</span>{' '}
              <span className="font-bold text-amber-300">×{floor.multiplier}</span>
              <span className="mx-2 text-slate-700">·</span>
              <span className="text-slate-400">Bust odds</span>{' '}
              <span className="font-bold text-rose-400">{remainingBustOdds}%</span>
            </div>
            <div className="text-sm">
              <span className="text-slate-400">Bank</span>{' '}
              <span className="font-bold text-emerald-300">{formatMoney(bank)}</span>
            </div>
          </div>

          <div className="text-xs text-slate-500">{floor.tierLabel}</div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {floor.tiles.map((c, idx) => {
              const isPicked = lastPickIdx === idx;
              return (
                <button
                  key={`${currentFloor}-${idx}`}
                  onClick={() => pickTile(idx)}
                  disabled={isPicked}
                  className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition-all ${
                    isPicked
                      ? 'border-amber-500/60 bg-amber-500/10'
                      : 'border-slate-700 bg-slate-900 hover:border-amber-500/60 hover:bg-amber-500/5'
                  }`}
                >
                  <div className="text-5xl opacity-40 group-hover:opacity-60">🂠</div>
                  <div className="mt-3 text-xs text-slate-500">Tile {idx + 1}</div>
                  <div className="mt-1 text-sm font-semibold text-slate-300">?</div>
                </button>
              );
            })}
          </div>

          {currentFloor > 0 && (
            <button
              onClick={cashOut}
              className="mt-2 w-full rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-6 py-3 text-sm font-bold text-emerald-300 hover:bg-emerald-500/20"
            >
              💰 Cash Out — bank {formatMoney(bank)}
            </button>
          )}

          {path.length > 0 && (
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/40 p-3">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Climb history</div>
              <div className="space-y-1 text-xs">
                {path.slice().reverse().map((p) => (
                  <div key={p.floor} className="flex items-center justify-between">
                    <span className="text-slate-400">F{p.floor} · {p.card.year} {p.card.player}</span>
                    <span className="font-semibold text-emerald-400">+{formatMoney(p.gain)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ENDGAME */}
      {(gameState === 'busted' || gameState === 'cashed' || gameState === 'crown') && (
        <div className={`rounded-2xl border p-6 ${
          gameState === 'crown' ? 'border-yellow-500/60 bg-gradient-to-br from-yellow-500/10 to-amber-500/10'
            : gameState === 'cashed' ? 'border-emerald-500/40 bg-emerald-500/5'
              : 'border-rose-500/40 bg-rose-500/5'
        }`}>
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {gameState === 'crown' ? '👑 Tower Cleared' : gameState === 'cashed' ? 'Cash Out' : '💥 Busted'}
              </div>
              <div className="mt-1 text-3xl font-bold">
                {gameState === 'busted' ? formatMoney(0) : formatMoney(bank)}
              </div>
              <div className="mt-1 text-sm text-slate-400">
                Reached floor F{gameState === 'crown' ? 10 : path.filter((p) => p.safe).length} · Grade <span className="font-bold text-amber-300">{gameState === 'busted' ? 'F' : grade}</span>
              </div>
            </div>
            <div className="text-5xl">
              {gameState === 'crown' ? '👑' : gameState === 'cashed' ? '💰' : '💥'}
            </div>
          </div>

          {gameState === 'busted' && (
            <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200">
              You picked the wrong tile on F{path[path.length - 1]?.floor}. The safe tile was <span className="font-bold">#{tower[path[path.length - 1]?.floor - 1]?.safeIdx + 1}</span>. All bank lost.
            </div>
          )}

          <div className="mb-4 rounded-xl border border-slate-800 bg-slate-900/40 p-3">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Climb recap</div>
            <div className="max-h-60 space-y-1 overflow-auto text-xs">
              {path.map((p) => (
                <div key={p.floor} className="flex items-center justify-between">
                  <span className="text-slate-400">
                    {p.safe ? '🟩' : '💥'} F{p.floor} · {p.card.year} {p.card.player}
                  </span>
                  <span className={p.safe ? 'text-emerald-400' : 'text-rose-400'}>
                    {p.safe ? `+${formatMoney(p.gain)}` : 'BUST'}
                  </span>
                </div>
              ))}
              {gameState === 'crown' && (
                <div className="flex items-center justify-between border-t border-slate-800 pt-1">
                  <span className="text-yellow-300">👑 Crown Bonus</span>
                  <span className="font-bold text-yellow-300">+{formatMoney(CROWN_BONUS)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={reset} className="flex-1 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-400">Play again</button>
            <button onClick={copyShare} className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-amber-500/40">
              {copied ? 'Copied ✓' : 'Share'}
            </button>
            <Link href="/games" className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-amber-500/40">
              More games
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { sportsCards, type SportsCard } from '@/data/sports-cards';

type Owner = 'player' | 'ai';

interface TriadCard {
  card: SportsCard;
  stats: { n: number; e: number; s: number; w: number };
  key: string;
}

interface GridCell {
  entry: TriadCard | null;
  owner: Owner | null;
}

interface Match {
  grid: GridCell[];
  playerHand: TriadCard[];
  aiHand: TriadCard[];
  turn: Owner;
  log: string[];
  over: boolean;
  mode: 'daily' | 'free';
  dailyKey: string;
}

const STORAGE_KEY = 'cv_card_triad_stats_v1';

const STAT_LABEL = { n: 'Heritage', e: 'Market', s: 'Rookie', w: 'Clout' } as const;

function seededRandom(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return ((s >>> 0) % 100000) / 100000;
  };
}

function dateSeed(d: Date) {
  return d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
}

function parseValue(raw: string): number {
  if (!raw) return 0;
  const nums = raw.replace(/,/g, '').match(/\d+(?:\.\d+)?/g);
  if (!nums || nums.length === 0) return 0;
  const parsed = nums.map((n) => parseFloat(n)).filter((n) => !isNaN(n));
  if (parsed.length === 0) return 0;
  return Math.max(...parsed);
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function edgeStats(card: SportsCard) {
  const now = 2026;
  const age = clamp(now - card.year, 0, 80);
  const v = parseValue(card.estimatedValueRaw);
  const logV = v > 0 ? Math.log10(v) : 0;

  const heritage = clamp(Math.round(1 + (age / 80) * 9), 1, 10);
  const market = clamp(Math.round(1 + (logV / 5) * 9), 1, 10);
  const rookieBase = card.rookie ? 7 : 2;
  const rookie = clamp(rookieBase + Math.round(logV / 2), 1, 10);
  const sportBonus = card.sport === 'basketball' ? 2 : card.sport === 'football' ? 1.5 : card.sport === 'baseball' ? 1 : 0.5;
  const eraBonus = card.year >= 2015 ? 1.5 : card.year >= 2000 ? 1 : 0.5;
  const clout = clamp(Math.round(logV * 1.2 + sportBonus + eraBonus + (card.rookie ? 1 : 0)), 1, 10);

  return { n: heritage, e: market, s: rookie, w: clout };
}

function formatEdge(n: number) {
  return n === 10 ? 'A' : String(n);
}

function pickHands(seed: number): { player: TriadCard[]; ai: TriadCard[] } {
  const rng = seededRandom(seed);
  // Filter to cards with value so stats are interesting
  const pool = sportsCards.filter((c) => parseValue(c.estimatedValueRaw) >= 10);
  // Shuffle
  const picks: TriadCard[] = [];
  const used = new Set<string>();
  while (picks.length < 10) {
    const idx = Math.floor(rng() * pool.length);
    const c = pool[idx];
    if (!c || used.has(c.slug)) continue;
    used.add(c.slug);
    picks.push({ card: c, stats: edgeStats(c), key: c.slug });
  }
  return { player: picks.slice(0, 5), ai: picks.slice(5, 10) };
}

function emptyGrid(): GridCell[] {
  return Array.from({ length: 9 }, () => ({ entry: null, owner: null }));
}

function neighbors(idx: number) {
  const row = Math.floor(idx / 3);
  const col = idx % 3;
  const out: { dir: 'n' | 'e' | 's' | 'w'; idx: number }[] = [];
  if (row > 0) out.push({ dir: 'n', idx: idx - 3 });
  if (col < 2) out.push({ dir: 'e', idx: idx + 1 });
  if (row < 2) out.push({ dir: 's', idx: idx + 3 });
  if (col > 0) out.push({ dir: 'w', idx: idx - 1 });
  return out;
}

const OPPOSITE: Record<'n' | 'e' | 's' | 'w', 'n' | 'e' | 's' | 'w'> = {
  n: 's',
  e: 'w',
  s: 'n',
  w: 'e',
};

function resolveCaptures(grid: GridCell[], placedIdx: number, placedOwner: Owner): number[] {
  const placed = grid[placedIdx];
  if (!placed?.entry) return [];
  const captured: number[] = [];
  for (const { dir, idx } of neighbors(placedIdx)) {
    const neighbor = grid[idx];
    if (!neighbor.entry || !neighbor.owner || neighbor.owner === placedOwner) continue;
    const myEdge = placed.entry.stats[dir];
    const theirEdge = neighbor.entry.stats[OPPOSITE[dir]];
    if (myEdge > theirEdge) {
      neighbor.owner = placedOwner;
      captured.push(idx);
    }
  }
  return captured;
}

function simulatePlacement(grid: GridCell[], card: TriadCard, idx: number, owner: Owner): { captures: number } {
  if (grid[idx].entry) return { captures: -Infinity };
  const clone: GridCell[] = grid.map((c) => ({ entry: c.entry, owner: c.owner }));
  clone[idx] = { entry: card, owner };
  const caps = resolveCaptures(clone, idx, owner);
  return { captures: caps.length };
}

function countOwners(grid: GridCell[]): { player: number; ai: number } {
  let player = 0;
  let ai = 0;
  for (const cell of grid) {
    if (cell.owner === 'player') player++;
    else if (cell.owner === 'ai') ai++;
  }
  return { player, ai };
}

function aiChoose(grid: GridCell[], hand: TriadCard[], rng: () => number): { cardKey: string; idx: number } | null {
  if (hand.length === 0) return null;
  const emptyCells = grid.map((c, i) => (c.entry ? -1 : i)).filter((i) => i >= 0);
  if (emptyCells.length === 0) return null;

  let best: { cardKey: string; idx: number; score: number } | null = null;
  for (const c of hand) {
    for (const i of emptyCells) {
      const cornerBias = [0, 2, 6, 8].includes(i) ? 1.5 : [1, 3, 5, 7].includes(i) ? 0.8 : 0.4;
      const sim = simulatePlacement(grid, c, i, 'ai');
      // Defensive: average of facing edges that could be attacked
      const vulnerability = neighbors(i).reduce((acc, n) => {
        if (grid[n.idx].entry) return acc;
        return acc + (10 - c.stats[n.dir]);
      }, 0);
      const score = sim.captures * 10 + cornerBias - vulnerability * 0.15 + rng() * 0.8;
      if (!best || score > best.score) best = { cardKey: c.key, idx: i, score };
    }
  }
  return best ? { cardKey: best.cardKey, idx: best.idx } : null;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

interface Stats {
  played: number;
  dailyPlayed: number;
  dailyWon: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  currentStreak: number;
  bestStreak: number;
  lastDailyDate: string;
  lastDailyResult: 'win' | 'loss' | 'draw' | null;
}

function defaultStats(): Stats {
  return {
    played: 0,
    dailyPlayed: 0,
    dailyWon: 0,
    totalWins: 0,
    totalLosses: 0,
    totalDraws: 0,
    currentStreak: 0,
    bestStreak: 0,
    lastDailyDate: '',
    lastDailyResult: null,
  };
}

function loadStats(): Stats {
  if (typeof window === 'undefined') return defaultStats();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStats();
    return { ...defaultStats(), ...JSON.parse(raw) };
  } catch {
    return defaultStats();
  }
}

function saveStats(s: Stats) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

function buildMatch(mode: 'daily' | 'free'): Match {
  const seed = mode === 'daily' ? dateSeed(new Date()) : Math.floor(Math.random() * 1_000_000);
  const { player, ai } = pickHands(seed);
  return {
    grid: emptyGrid(),
    playerHand: player,
    aiHand: ai,
    turn: 'player',
    log: [`Match started. ${mode === 'daily' ? 'Today\'s Triad' : 'Free Play'}.`],
    over: false,
    mode,
    dailyKey: todayKey(),
  };
}

export default function CardTriadClient() {
  const [match, setMatch] = useState<Match | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>(defaultStats);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStats(loadStats());
    setMatch(buildMatch('daily'));
    setHydrated(true);
  }, []);

  const { playerOwned, aiOwned } = useMemo(() => {
    if (!match) return { playerOwned: 0, aiOwned: 0 };
    const c = countOwners(match.grid);
    return { playerOwned: c.player, aiOwned: c.ai };
  }, [match]);

  if (!hydrated || !match) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
        Loading board…
      </div>
    );
  }

  const canPlayerMove = match.turn === 'player' && !match.over && match.playerHand.length > 0;
  const dailyAlreadyPlayed = match.mode === 'daily' && stats.lastDailyDate === todayKey();

  function placeCard(cardKey: string, idx: number) {
    if (!match) return;
    if (match.over || match.turn !== 'player') return;
    if (match.grid[idx].entry) return;
    const card = match.playerHand.find((c) => c.key === cardKey);
    if (!card) return;

    const newGrid: GridCell[] = match.grid.map((c) => ({ entry: c.entry, owner: c.owner }));
    newGrid[idx] = { entry: card, owner: 'player' };
    const captures = resolveCaptures(newGrid, idx, 'player');
    const newHand = match.playerHand.filter((c) => c.key !== cardKey);
    const logEntry =
      captures.length > 0
        ? `You placed ${card.card.name.split(' ').slice(0, 4).join(' ')}… and captured ${captures.length} card${captures.length === 1 ? '' : 's'}.`
        : `You placed ${card.card.name.split(' ').slice(0, 4).join(' ')}…`;

    const empties = newGrid.filter((c) => !c.entry).length;
    const over = empties === 0;
    const nextTurn: Owner = over ? match.turn : 'ai';
    const next: Match = {
      ...match,
      grid: newGrid,
      playerHand: newHand,
      turn: nextTurn,
      log: [logEntry, ...match.log].slice(0, 10),
      over,
    };
    setMatch(next);
    setSelectedKey(null);
    if (over) finalize(next);
  }

  function aiTurn() {
    if (!match) return;
    if (match.over || match.turn !== 'ai') return;
    const rng = seededRandom(dateSeed(new Date()) + match.grid.filter((c) => c.entry).length * 17);
    const choice = aiChoose(match.grid, match.aiHand, rng);
    if (!choice) return;
    const card = match.aiHand.find((c) => c.key === choice.cardKey);
    if (!card) return;

    const newGrid: GridCell[] = match.grid.map((c) => ({ entry: c.entry, owner: c.owner }));
    newGrid[choice.idx] = { entry: card, owner: 'ai' };
    const captures = resolveCaptures(newGrid, choice.idx, 'ai');
    const newAi = match.aiHand.filter((c) => c.key !== choice.cardKey);
    const logEntry =
      captures.length > 0
        ? `AI placed ${card.card.name.split(' ').slice(0, 4).join(' ')}… and captured ${captures.length} of your card${captures.length === 1 ? '' : 's'}.`
        : `AI placed ${card.card.name.split(' ').slice(0, 4).join(' ')}…`;

    const empties = newGrid.filter((c) => !c.entry).length;
    const over = empties === 0;
    const nextTurn: Owner = over ? match.turn : 'player';
    const next: Match = {
      ...match,
      grid: newGrid,
      aiHand: newAi,
      turn: nextTurn,
      log: [logEntry, ...match.log].slice(0, 10),
      over,
    };
    setMatch(next);
    if (over) finalize(next);
  }

  useEffect(() => {
    if (!match) return;
    if (match.turn !== 'ai' || match.over) return;
    const t = setTimeout(aiTurn, 850);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match?.turn, match?.over]);

  function finalize(finished: Match) {
    const { player, ai } = countOwners(finished.grid);
    const result: 'win' | 'loss' | 'draw' = player > ai ? 'win' : player < ai ? 'loss' : 'draw';

    setStats((prev) => {
      const today = todayKey();
      const isDaily = finished.mode === 'daily';
      const first = isDaily && prev.lastDailyDate !== today;
      const next: Stats = {
        ...prev,
        played: prev.played + 1,
        totalWins: prev.totalWins + (result === 'win' ? 1 : 0),
        totalLosses: prev.totalLosses + (result === 'loss' ? 1 : 0),
        totalDraws: prev.totalDraws + (result === 'draw' ? 1 : 0),
      };
      if (isDaily && first) {
        next.dailyPlayed = prev.dailyPlayed + 1;
        next.lastDailyDate = today;
        next.lastDailyResult = result;
        if (result === 'win') {
          next.dailyWon = prev.dailyWon + 1;
          next.currentStreak = prev.currentStreak + 1;
          next.bestStreak = Math.max(prev.bestStreak, next.currentStreak);
        } else {
          next.currentStreak = 0;
        }
      }
      saveStats(next);
      return next;
    });
  }

  function newMatch(mode: 'daily' | 'free') {
    setMatch(buildMatch(mode));
    setSelectedKey(null);
  }

  function shareResult() {
    if (!match || !match.over) return;
    const { player, ai } = countOwners(match.grid);
    const result = player > ai ? 'WON' : player < ai ? 'LOST' : 'DREW';
    const emoji = match.grid
      .map((c) => (c.owner === 'player' ? '🟩' : c.owner === 'ai' ? '🟥' : '⬜'))
      .reduce<string[]>((rows, cell, i) => {
        const row = Math.floor(i / 3);
        rows[row] = (rows[row] || '') + cell;
        return rows;
      }, [])
      .join('\n');
    const modeTag = match.mode === 'daily' ? `Card Triad · ${todayKey()}` : 'Card Triad · Free Play';
    const text = `${modeTag}\n${result} ${player}–${ai}\n${emoji}\nhttps://cardvault-two.vercel.app/card-triad`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  }

  const finalResult = match.over
    ? playerOwned > aiOwned
      ? { label: 'You win', tone: 'emerald' }
      : playerOwned < aiOwned
        ? { label: 'AI wins', tone: 'red' }
        : { label: 'Draw', tone: 'slate' }
    : null;

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-800 bg-slate-900/40 p-3 sm:grid-cols-5">
        <StatBox label="Daily streak" value={String(stats.currentStreak)} />
        <StatBox label="Best streak" value={String(stats.bestStreak)} />
        <StatBox label="Daily W–L" value={`${stats.dailyWon}–${Math.max(0, stats.dailyPlayed - stats.dailyWon)}`} />
        <StatBox label="Total W–L–D" value={`${stats.totalWins}–${stats.totalLosses}–${stats.totalDraws}`} />
        <StatBox label="Mode" value={match.mode === 'daily' ? "Today's Triad" : 'Free Play'} />
      </div>

      {/* Mode / actions */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => newMatch('daily')}
          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          Today&apos;s Triad
        </button>
        <button
          onClick={() => newMatch('free')}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-slate-500"
        >
          New Free Match
        </button>
        {match.over && (
          <button
            onClick={shareResult}
            className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/20"
          >
            Copy Result
          </button>
        )}
        {dailyAlreadyPlayed && match.mode === 'daily' && (
          <span className="text-xs text-slate-500">
            Daily result banked: <span className={`font-semibold ${stats.lastDailyResult === 'win' ? 'text-emerald-300' : stats.lastDailyResult === 'loss' ? 'text-red-300' : 'text-slate-300'}`}>
              {stats.lastDailyResult?.toUpperCase()}
            </span>
          </span>
        )}
      </div>

      {/* Scores */}
      <div className="grid grid-cols-3 items-center rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="text-center">
          <div className="text-xs uppercase tracking-wide text-emerald-300">You</div>
          <div className="text-4xl font-bold text-emerald-300">{playerOwned}</div>
        </div>
        <div className="text-center text-xs text-slate-500">
          {match.over
            ? finalResult?.label
            : match.turn === 'player'
              ? 'Your turn'
              : 'AI thinking…'}
        </div>
        <div className="text-center">
          <div className="text-xs uppercase tracking-wide text-red-300">AI</div>
          <div className="text-4xl font-bold text-red-300">{aiOwned}</div>
        </div>
      </div>

      {/* Board + hands */}
      <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr]">
        {/* Player hand */}
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-300">Your hand</div>
          <div className="space-y-2">
            {match.playerHand.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-800 p-4 text-center text-xs text-slate-500">
                Hand empty
              </div>
            )}
            {match.playerHand.map((c) => (
              <button
                key={c.key}
                onClick={() => canPlayerMove && setSelectedKey(c.key === selectedKey ? null : c.key)}
                disabled={!canPlayerMove}
                className={`flex w-full items-center justify-between gap-2 rounded-xl border p-3 text-left transition ${
                  selectedKey === c.key
                    ? 'border-emerald-400 bg-emerald-500/10 ring-2 ring-emerald-400/50'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-600'
                } ${!canPlayerMove ? 'opacity-60' : ''}`}
              >
                <div className="min-w-0">
                  <div className="truncate text-xs font-semibold text-slate-200">
                    {c.card.player}
                  </div>
                  <div className="truncate text-[10px] text-slate-500">
                    {c.card.year} {c.card.set}
                  </div>
                </div>
                <EdgeBadges stats={c.stats} compact />
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="mx-auto">
          <div className="grid grid-cols-3 gap-1.5 rounded-2xl border border-slate-800 bg-slate-950/60 p-2">
            {match.grid.map((cell, i) => (
              <GridCellView
                key={i}
                cell={cell}
                onClick={() => {
                  if (!canPlayerMove || !selectedKey) return;
                  if (cell.entry) return;
                  placeCard(selectedKey, i);
                }}
                highlight={canPlayerMove && selectedKey !== null && !cell.entry}
              />
            ))}
          </div>
          <div className="mt-2 text-center text-[10px] text-slate-600">
            {canPlayerMove ? (selectedKey ? 'Pick a cell →' : 'Pick a card ←') : '—'}
          </div>
        </div>

        {/* AI hand */}
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-300">AI hand ({match.aiHand.length})</div>
          <div className="space-y-2">
            {match.aiHand.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-800 p-4 text-center text-xs text-slate-500">
                Hand empty
              </div>
            )}
            {match.aiHand.map((c) => (
              <div
                key={c.key}
                className="rounded-xl border border-slate-800 bg-gradient-to-br from-red-950/30 to-slate-900/60 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[10px] uppercase tracking-wide text-red-400">Face-down</div>
                  <div className="text-[10px] text-slate-500">#{c.card.year}</div>
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-300">?????</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Log */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Match log</div>
        <ul className="space-y-1 text-xs text-slate-400">
          {match.log.map((l, i) => (
            <li key={i} className={i === 0 ? 'text-slate-200' : ''}>
              {l}
            </li>
          ))}
        </ul>
      </div>

      {/* Final reveal of AI hand */}
      {match.over && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="mb-3 text-sm font-semibold text-slate-200">
            Final Board · {finalResult?.label} · {playerOwned}–{aiOwned}
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {match.grid.map((cell, i) => {
              if (!cell.entry) return null;
              return (
                <Link
                  key={i}
                  href={`/cards/${cell.entry.card.slug}`}
                  className={`block rounded-lg border p-2 text-xs ${
                    cell.owner === 'player'
                      ? 'border-emerald-500/40 bg-emerald-500/10'
                      : 'border-red-500/40 bg-red-500/10'
                  }`}
                >
                  <div className="truncate font-semibold text-slate-200">{cell.entry.card.player}</div>
                  <div className="truncate text-[10px] text-slate-500">
                    {cell.entry.card.year} · {cell.entry.card.set}
                  </div>
                  <div className="mt-1">
                    <EdgeBadges stats={cell.entry.stats} compact />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-2 text-center">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-slate-200">{value}</div>
    </div>
  );
}

function EdgeBadges({ stats, compact = false }: { stats: TriadCard['stats']; compact?: boolean }) {
  const size = compact ? 'h-6 w-6 text-[10px]' : 'h-8 w-8 text-xs';
  const dim = (k: 'n' | 'e' | 's' | 'w') => {
    const colors: Record<'n' | 'e' | 's' | 'w', string> = {
      n: 'bg-red-500/20 border-red-500/40 text-red-200',
      e: 'bg-amber-500/20 border-amber-500/40 text-amber-200',
      s: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200',
      w: 'bg-violet-500/20 border-violet-500/40 text-violet-200',
    };
    return (
      <span
        title={`${STAT_LABEL[k]}: ${stats[k]}`}
        className={`inline-flex ${size} items-center justify-center rounded border font-mono font-bold ${colors[k]}`}
      >
        {formatEdge(stats[k])}
      </span>
    );
  };
  return (
    <div className="flex items-center gap-1">
      {dim('n')}
      {dim('e')}
      {dim('s')}
      {dim('w')}
    </div>
  );
}

function GridCellView({
  cell,
  onClick,
  highlight,
}: {
  cell: GridCell;
  onClick: () => void;
  highlight: boolean;
}) {
  if (!cell.entry) {
    return (
      <button
        onClick={onClick}
        className={`h-24 w-24 rounded-lg border sm:h-28 sm:w-28 ${
          highlight
            ? 'border-emerald-400/60 bg-emerald-500/5 hover:bg-emerald-500/20'
            : 'border-dashed border-slate-800 bg-slate-950/30'
        }`}
      />
    );
  }
  const ownerColor =
    cell.owner === 'player'
      ? 'border-emerald-500/60 bg-gradient-to-br from-emerald-900/40 to-emerald-950/80'
      : 'border-red-500/60 bg-gradient-to-br from-red-900/40 to-red-950/80';
  const { stats, card } = cell.entry;
  return (
    <div
      className={`relative h-24 w-24 rounded-lg border p-1.5 sm:h-28 sm:w-28 ${ownerColor}`}
      title={`${card.name} — H${formatEdge(stats.n)} M${formatEdge(stats.e)} R${formatEdge(stats.s)} C${formatEdge(stats.w)}`}
    >
      {/* Edge numbers */}
      <span className="absolute left-1/2 top-1 -translate-x-1/2 rounded bg-red-500/30 px-1 text-[10px] font-mono font-bold text-red-100">
        {formatEdge(stats.n)}
      </span>
      <span className="absolute right-1 top-1/2 -translate-y-1/2 rounded bg-amber-500/30 px-1 text-[10px] font-mono font-bold text-amber-100">
        {formatEdge(stats.e)}
      </span>
      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded bg-emerald-500/30 px-1 text-[10px] font-mono font-bold text-emerald-100">
        {formatEdge(stats.s)}
      </span>
      <span className="absolute left-1 top-1/2 -translate-y-1/2 rounded bg-violet-500/30 px-1 text-[10px] font-mono font-bold text-violet-100">
        {formatEdge(stats.w)}
      </span>
      <div className="flex h-full w-full flex-col items-center justify-center gap-0.5 px-1 text-center">
        <div className="line-clamp-2 text-[10px] font-semibold leading-tight text-slate-100">
          {card.player}
        </div>
        <div className="text-[9px] text-slate-400">{card.year}</div>
      </div>
    </div>
  );
}

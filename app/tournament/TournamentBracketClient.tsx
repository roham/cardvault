'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { sportsCards } from '@/data/sports-cards';
import type { SportsCard } from '@/data/sports-cards';

const STORAGE_KEY = 'cardvault-tournament';

/* ── Types ─────────────────────────────────────────────────── */

interface Matchup {
  id: string;
  round: number;
  position: number;         // position within the round (0-indexed)
  cardA: SportsCard | null;
  cardB: SportsCard | null;
  seedA: number;
  seedB: number;
  winner: SportsCard | null;
  scoreA: number;
  scoreB: number;
  isUpset: boolean;
}

interface TournamentState {
  size: 8 | 16;
  sport: string;
  matchups: Matchup[];
  currentRound: number;
  champion: SportsCard | null;
  upsets: number;
  totalMatchups: number;
  decided: number;
}

interface TournamentHistory {
  tournaments: {
    date: string;
    size: number;
    sport: string;
    champion: string;
    upsets: number;
  }[];
}

type Phase = 'setup' | 'playing' | 'complete';

/* ── Helpers ───────────────────────────────────────────────── */

const sportIcons: Record<string, string> = {
  baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒', all: '🏆',
};

function parseValue(v: string): number {
  const m = v.match(/\$([\d,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function battleScore(card: SportsCard, seed: number): number {
  const value = parseValue(card.estimatedValueRaw);
  const currentYear = new Date().getFullYear();
  const power = Math.min(100, Math.floor(Math.log2(Math.max(1, value)) * 8));
  const experience = Math.min(50, currentYear - card.year);
  const potential = card.rookie ? 25 : 0;
  const clutch = Math.floor(Math.random() * 25) + 1;
  // Seed advantage: higher seed (lower number) gets a small bonus
  const seedBonus = Math.max(0, 10 - seed);
  return power + experience + potential + clutch + seedBonus;
}

function getHistory(): TournamentHistory {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* fresh */ }
  return { tournaments: [] };
}

function saveHistory(h: TournamentHistory): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(h));
}

function buildBracket(cards: SportsCard[], size: 8 | 16): Matchup[] {
  // Sort by value descending, take top N
  const pool = [...cards]
    .map(c => ({ card: c, value: parseValue(c.estimatedValueRaw) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, size)
    .map((c, i) => ({ card: c.card, seed: i + 1 }));

  const totalRounds = size === 16 ? 4 : 3;
  const matchups: Matchup[] = [];

  // Round 1: standard bracket seeding (#1 vs #N, #2 vs #N-1, etc.)
  const firstRoundPairs = size / 2;
  for (let i = 0; i < firstRoundPairs; i++) {
    const high = pool[i];
    const low = pool[size - 1 - i];
    matchups.push({
      id: `r1-m${i}`,
      round: 1,
      position: i,
      cardA: high.card,
      cardB: low.card,
      seedA: high.seed,
      seedB: low.seed,
      winner: null,
      scoreA: 0,
      scoreB: 0,
      isUpset: false,
    });
  }

  // Later rounds: empty matchups to be filled as winners advance
  for (let round = 2; round <= totalRounds; round++) {
    const matchesInRound = firstRoundPairs / Math.pow(2, round - 1);
    for (let i = 0; i < matchesInRound; i++) {
      matchups.push({
        id: `r${round}-m${i}`,
        round,
        position: i,
        cardA: null,
        cardB: null,
        seedA: 0,
        seedB: 0,
        winner: null,
        scoreA: 0,
        scoreB: 0,
        isUpset: false,
      });
    }
  }

  return matchups;
}

function getRoundName(round: number, totalRounds: number): string {
  const fromEnd = totalRounds - round;
  if (fromEnd === 0) return 'Final';
  if (fromEnd === 1) return 'Semifinals';
  if (fromEnd === 2) return 'Quarterfinals';
  return `Round ${round}`;
}

/* ── Component ─────────────────────────────────────────────── */

export default function TournamentBracketClient() {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>('setup');
  const [bracketSize, setBracketSize] = useState<8 | 16>(8);
  const [sportFilter, setSportFilter] = useState('all');
  const [tournament, setTournament] = useState<TournamentState | null>(null);
  const [animating, setAnimating] = useState<string | null>(null);
  const [history, setHistory] = useState<TournamentHistory>({ tournaments: [] });

  useEffect(() => {
    setMounted(true);
    setHistory(getHistory());
  }, []);

  const availableCards = useMemo(() => {
    let cards = sportsCards.filter(c => parseValue(c.estimatedValueRaw) >= 10);
    if (sportFilter !== 'all') {
      cards = cards.filter(c => c.sport === sportFilter);
    }
    return cards;
  }, [sportFilter]);

  const canStart = availableCards.length >= bracketSize;

  const startTournament = useCallback(() => {
    const matchups = buildBracket(availableCards, bracketSize);
    const totalRounds = bracketSize === 16 ? 4 : 3;
    setTournament({
      size: bracketSize,
      sport: sportFilter,
      matchups,
      currentRound: 1,
      champion: null,
      upsets: 0,
      totalMatchups: bracketSize - 1,
      decided: 0,
    });
    setPhase('playing');
  }, [availableCards, bracketSize, sportFilter]);

  const resolveMatchup = useCallback((matchupId: string, pickedWinner: 'A' | 'B' | 'auto') => {
    if (!tournament || animating) return;

    setAnimating(matchupId);

    setTimeout(() => {
      setTournament(prev => {
        if (!prev) return prev;
        const matchups = [...prev.matchups];
        const idx = matchups.findIndex(m => m.id === matchupId);
        if (idx === -1) return prev;

        const m = { ...matchups[idx] };
        if (!m.cardA || !m.cardB || m.winner) return prev;

        const scoreA = battleScore(m.cardA, m.seedA);
        const scoreB = battleScore(m.cardB, m.seedB);
        m.scoreA = scoreA;
        m.scoreB = scoreB;

        if (pickedWinner === 'auto') {
          m.winner = scoreA >= scoreB ? m.cardA : m.cardB;
        } else {
          m.winner = pickedWinner === 'A' ? m.cardA : m.cardB;
        }

        const winnerSeed = m.winner === m.cardA ? m.seedA : m.seedB;
        const loserSeed = m.winner === m.cardA ? m.seedB : m.seedA;
        m.isUpset = winnerSeed > loserSeed;

        matchups[idx] = m;

        // Advance winner to next round
        const totalRounds = prev.size === 16 ? 4 : 3;
        if (m.round < totalRounds) {
          const nextRound = m.round + 1;
          const nextPosition = Math.floor(m.position / 2);
          const nextIdx = matchups.findIndex(
            n => n.round === nextRound && n.position === nextPosition
          );
          if (nextIdx !== -1) {
            const next = { ...matchups[nextIdx] };
            if (m.position % 2 === 0) {
              next.cardA = m.winner;
              next.seedA = winnerSeed;
            } else {
              next.cardB = m.winner;
              next.seedB = winnerSeed;
            }
            matchups[nextIdx] = next;
          }
        }

        const decided = prev.decided + 1;
        const upsets = prev.upsets + (m.isUpset ? 1 : 0);
        const isComplete = decided === prev.totalMatchups;

        // Determine current round (lowest round with undecided matchups)
        let currentRound = prev.currentRound;
        const roundHasUndecided = (r: number) =>
          matchups.some(mm => mm.round === r && !mm.winner && mm.cardA && mm.cardB);
        if (!roundHasUndecided(currentRound)) {
          for (let r = currentRound + 1; r <= totalRounds; r++) {
            if (roundHasUndecided(r)) {
              currentRound = r;
              break;
            }
          }
        }

        const champion = isComplete ? m.winner : null;

        if (isComplete && m.winner) {
          const h = getHistory();
          h.tournaments.unshift({
            date: new Date().toISOString().split('T')[0],
            size: prev.size,
            sport: prev.sport,
            champion: `${m.winner.year} ${m.winner.player} ${m.winner.name}`,
            upsets,
          });
          if (h.tournaments.length > 20) h.tournaments = h.tournaments.slice(0, 20);
          saveHistory(h);
          setHistory(h);
          setPhase('complete');
        }

        return { ...prev, matchups, currentRound, champion, upsets, decided };
      });

      setAnimating(null);
    }, 600);
  }, [tournament, animating]);

  const autoPlayAll = useCallback(() => {
    if (!tournament) return;
    const totalRounds = tournament.size === 16 ? 4 : 3;

    // Find all undecided matchups that are ready
    let delay = 0;
    const processRound = (round: number) => {
      const undecided = tournament.matchups.filter(
        m => m.round === round && !m.winner && m.cardA && m.cardB
      );
      undecided.forEach((m, i) => {
        setTimeout(() => resolveMatchup(m.id, 'auto'), delay + i * 800);
      });
      delay += undecided.length * 800 + 400;
    };

    for (let r = 1; r <= totalRounds; r++) {
      processRound(r);
    }
  }, [tournament, resolveMatchup]);

  if (!mounted) {
    return <div className="h-96 flex items-center justify-center text-gray-500">Loading tournament...</div>;
  }

  /* ── Setup Phase ─────────────────────────────────────────── */

  if (phase === 'setup') {
    return (
      <div className="space-y-8">
        {/* Configuration */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Tournament Setup</h2>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-400 block mb-2">Bracket Size</label>
              <div className="flex gap-3">
                {([8, 16] as const).map(s => (
                  <button key={s} onClick={() => setBracketSize(s)}
                    className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all ${
                      bracketSize === s
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}>
                    {s} Cards
                    <span className="block text-xs font-normal mt-0.5 opacity-70">
                      {s === 8 ? '3 rounds' : '4 rounds'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-2">Sport Filter</label>
              <div className="flex flex-wrap gap-2">
                {['all', 'baseball', 'basketball', 'football', 'hockey'].map(s => (
                  <button key={s} onClick={() => setSportFilter(s)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      sportFilter === s
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}>
                    {sportIcons[s] || ''} {s === 'all' ? 'All Sports' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {availableCards.length} cards available
              {!canStart && <span className="text-red-400 ml-2">(need at least {bracketSize})</span>}
            </p>
            <button onClick={startTournament} disabled={!canStart}
              className={`px-6 py-3 rounded-xl font-bold text-lg transition-all ${
                canStart
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-gray-800 text-gray-600 cursor-not-allowed'
              }`}>
              Start Tournament
            </button>
          </div>
        </div>

        {/* History */}
        {history.tournaments.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Tournament History</h2>
            <div className="space-y-2">
              {history.tournaments.slice(0, 10).map((t, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-800/50 rounded-lg px-4 py-3">
                  <div>
                    <p className="text-white text-sm font-medium">{t.champion}</p>
                    <p className="text-xs text-gray-500">{t.date} &middot; {t.size}-card {t.sport === 'all' ? 'all sports' : t.sport}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      t.upsets > 0 ? 'bg-red-950/50 text-red-400' : 'bg-green-950/50 text-green-400'
                    }`}>
                      {t.upsets} upset{t.upsets !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── Playing & Complete Phases ────────────────────────────── */

  if (!tournament) return null;

  const totalRounds = tournament.size === 16 ? 4 : 3;

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2">
          <span className="text-xs text-gray-500">Round</span>
          <p className="text-white font-bold">{getRoundName(tournament.currentRound, totalRounds)}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2">
          <span className="text-xs text-gray-500">Progress</span>
          <p className="text-white font-bold">{tournament.decided}/{tournament.totalMatchups}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2">
          <span className="text-xs text-gray-500">Upsets</span>
          <p className={`font-bold ${tournament.upsets > 0 ? 'text-red-400' : 'text-green-400'}`}>
            {tournament.upsets}
          </p>
        </div>
        {phase === 'playing' && (
          <button onClick={autoPlayAll}
            className="ml-auto bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            Auto-Play Remaining
          </button>
        )}
        {phase === 'complete' && (
          <button onClick={() => { setPhase('setup'); setTournament(null); }}
            className="ml-auto bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            New Tournament
          </button>
        )}
      </div>

      {/* Champion banner */}
      {tournament.champion && (
        <div className="bg-gradient-to-r from-amber-950/60 via-amber-900/40 to-amber-950/60 border border-amber-700/50 rounded-2xl p-6 text-center">
          <p className="text-amber-400 text-sm font-medium mb-1">Champion</p>
          <p className="text-2xl sm:text-3xl font-bold text-white">
            {tournament.champion.year} {tournament.champion.player}
          </p>
          <p className="text-gray-400 mt-1">{tournament.champion.name}</p>
          <p className="text-sm text-gray-500 mt-2">
            {tournament.upsets} upset{tournament.upsets !== 1 ? 's' : ''} in {tournament.totalMatchups} matchups
          </p>
        </div>
      )}

      {/* Bracket visualization */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {Array.from({ length: totalRounds }, (_, ri) => ri + 1).map(round => {
            const roundMatchups = tournament.matchups.filter(m => m.round === round);
            return (
              <div key={round} className="flex-shrink-0" style={{ width: round === totalRounds && tournament.size === 8 ? 280 : 260 }}>
                <h3 className="text-sm font-semibold text-gray-400 mb-3 text-center">
                  {getRoundName(round, totalRounds)}
                </h3>
                <div className="space-y-3" style={{ paddingTop: round > 1 ? `${Math.pow(2, round - 2) * 24}px` : 0 }}>
                  {roundMatchups.map((m) => (
                    <MatchupCard
                      key={m.id}
                      matchup={m}
                      isAnimating={animating === m.id}
                      isActive={phase === 'playing' && !m.winner && !!m.cardA && !!m.cardB}
                      onPickWinner={(side) => resolveMatchup(m.id, side)}
                      round={round}
                      totalRounds={totalRounds}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Matchup Card ──────────────────────────────────────────── */

function MatchupCard({
  matchup,
  isAnimating,
  isActive,
  onPickWinner,
  round,
  totalRounds,
}: {
  matchup: Matchup;
  isAnimating: boolean;
  isActive: boolean;
  onPickWinner: (side: 'A' | 'B' | 'auto') => void;
  round: number;
  totalRounds: number;
}) {
  const isFinal = round === totalRounds;

  if (!matchup.cardA && !matchup.cardB) {
    return (
      <div className={`border border-gray-800 rounded-xl bg-gray-900/30 ${isFinal ? 'p-4' : 'p-3'}`}
        style={{ marginBottom: round > 1 ? `${Math.pow(2, round - 2) * 24}px` : 0 }}>
        <div className="text-center text-gray-600 text-xs py-4">Waiting for winners...</div>
      </div>
    );
  }

  return (
    <div className={`border rounded-xl transition-all ${
      isAnimating ? 'border-amber-500 bg-amber-950/20' :
      matchup.winner ? 'border-gray-800 bg-gray-900/60' :
      isActive ? 'border-amber-700/50 bg-gray-900' :
      'border-gray-800 bg-gray-900/40'
    } ${isFinal ? 'p-4' : 'p-3'}`}
      style={{ marginBottom: round > 1 ? `${Math.pow(2, round - 2) * 24}px` : 0 }}>

      {/* Card A */}
      <CardSlot
        card={matchup.cardA}
        seed={matchup.seedA}
        score={matchup.scoreA}
        isWinner={matchup.winner === matchup.cardA && matchup.winner !== null}
        isLoser={matchup.winner !== null && matchup.winner !== matchup.cardA && matchup.cardA !== null}
        isUpset={matchup.isUpset && matchup.winner === matchup.cardA}
        isActive={isActive}
        isAnimating={isAnimating}
        onClick={() => isActive && onPickWinner('A')}
      />

      <div className="flex items-center gap-2 my-1.5">
        <div className="flex-1 h-px bg-gray-800" />
        <span className="text-xs text-gray-600 font-medium">VS</span>
        <div className="flex-1 h-px bg-gray-800" />
      </div>

      {/* Card B */}
      <CardSlot
        card={matchup.cardB}
        seed={matchup.seedB}
        score={matchup.scoreB}
        isWinner={matchup.winner === matchup.cardB && matchup.winner !== null}
        isLoser={matchup.winner !== null && matchup.winner !== matchup.cardB && matchup.cardB !== null}
        isUpset={matchup.isUpset && matchup.winner === matchup.cardB}
        isActive={isActive}
        isAnimating={isAnimating}
        onClick={() => isActive && onPickWinner('B')}
      />

      {/* Auto-battle button */}
      {isActive && !isAnimating && (
        <button onClick={() => onPickWinner('auto')}
          className="w-full mt-2 py-1.5 text-xs text-gray-500 hover:text-amber-400 hover:bg-gray-800/50 rounded-lg transition-colors">
          Auto-Battle
        </button>
      )}
    </div>
  );
}

/* ── Card Slot ─────────────────────────────────────────────── */

function CardSlot({
  card,
  seed,
  score,
  isWinner,
  isLoser,
  isUpset,
  isActive,
  isAnimating,
  onClick,
}: {
  card: SportsCard | null;
  seed: number;
  score: number;
  isWinner: boolean;
  isLoser: boolean;
  isUpset: boolean;
  isActive: boolean;
  isAnimating: boolean;
  onClick: () => void;
}) {
  if (!card) {
    return <div className="py-3 text-center text-gray-700 text-xs">TBD</div>;
  }

  const icon = sportIcons[card.sport] || '';

  return (
    <button
      onClick={onClick}
      disabled={!isActive || isAnimating}
      className={`w-full text-left rounded-lg px-3 py-2 transition-all ${
        isWinner ? 'bg-green-950/30 border border-green-800/40' :
        isLoser ? 'bg-gray-950/50 opacity-40' :
        isActive ? 'hover:bg-gray-800 cursor-pointer' :
        ''
      } ${isAnimating ? 'animate-pulse' : ''}`}>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
          seed <= 4 ? 'bg-amber-900/50 text-amber-400' : 'bg-gray-800 text-gray-500'
        }`}>
          #{seed}
        </span>
        <span className="text-xs">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${isWinner ? 'text-green-400' : isLoser ? 'text-gray-600' : 'text-white'}`}>
            {card.player}
          </p>
          <p className="text-xs text-gray-500 truncate">{card.year} {card.name}</p>
        </div>
        {score > 0 && (
          <span className={`text-xs font-mono ${isWinner ? 'text-green-400' : 'text-gray-600'}`}>
            {score}
          </span>
        )}
        {isUpset && isWinner && (
          <span className="text-xs bg-red-950/60 text-red-400 px-1.5 py-0.5 rounded-full">Upset!</span>
        )}
      </div>
    </button>
  );
}

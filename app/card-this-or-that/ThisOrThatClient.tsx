'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import Link from 'next/link';
import type { SportsCard } from '@/data/sports-cards';

/* ── helpers ─────────────────────────────────────────────────────── */

function dateHash(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
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

function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

const sportColors: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  baseball: { border: 'border-red-700/60', bg: 'bg-red-950/30', text: 'text-red-400', badge: 'bg-red-900/60 text-red-300' },
  basketball: { border: 'border-orange-700/60', bg: 'bg-orange-950/30', text: 'text-orange-400', badge: 'bg-orange-900/60 text-orange-300' },
  football: { border: 'border-green-700/60', bg: 'bg-green-950/30', text: 'text-green-400', badge: 'bg-green-900/60 text-green-300' },
  hockey: { border: 'border-blue-700/60', bg: 'bg-blue-950/30', text: 'text-blue-400', badge: 'bg-blue-900/60 text-blue-300' },
};

const sportEmoji: Record<string, string> = {
  baseball: '\u26be',
  basketball: '\ud83c\udfc0',
  football: '\ud83c\udfc8',
  hockey: '\ud83c\udfd2',
};

const sportPatternColors: Record<string, { primary: string; secondary: string }> = {
  baseball: { primary: '#8B1A1A', secondary: '#1a0a0a' },
  basketball: { primary: '#B84B00', secondary: '#1a0c00' },
  football: { primary: '#1A3A6B', secondary: '#0a0d1a' },
  hockey: { primary: '#0A4D6B', secondary: '#000d1a' },
};

const TOTAL_ROUNDS = 20;
const STORAGE_KEY = 'cv-this-or-that-stats';

/* ── types ───────────────────────────────────────────────────────── */

interface Matchup {
  cardA: SportsCard;
  cardB: SportsCard;
}

interface Pick {
  chosen: SportsCard;
  other: SportsCard;
}

type PersonalityType =
  | 'Vintage Connoisseur'
  | 'Modern Flipper'
  | 'Bargain Hunter'
  | 'Big Spender'
  | 'Rookie Chaser'
  | 'Cross-Sport Collector'
  | 'Brand Loyalist'
  | 'The Contrarian';

interface PersonalityResult {
  type: PersonalityType;
  description: string;
  emoji: string;
}

interface GameStats {
  gamesPlayed: number;
  personalityHistory: string[];
  favoriteSport: string;
  favoriteEra: string;
  lastDailyDate: string;
}

type GameMode = 'daily' | 'random';
type GamePhase = 'menu' | 'playing' | 'result';

/* ── personality logic ───────────────────────────────────────────── */

function getEraLabel(year: number): string {
  if (year < 1970) return 'Pre-1970';
  if (year < 1990) return '1970s-1980s';
  if (year < 2010) return '1990s-2000s';
  return '2010s+';
}

function getBrand(set: string): string {
  if (set.includes('Topps') || set.includes('Bowman')) return 'Topps';
  if (set.includes('Panini') || set.includes('Prizm') || set.includes('Donruss') || set.includes('National Treasures') || set.includes('Contenders') || set.includes('Mosaic') || set.includes('Select') || set.includes('Optic')) return 'Panini';
  if (set.includes('Upper Deck') || set.includes('UD') || set.includes('SP ') || set.includes(' SP')) return 'Upper Deck';
  if (set.includes('Fleer')) return 'Fleer';
  if (set.includes('O-Pee-Chee')) return 'O-Pee-Chee';
  return 'Other';
}

function determinePersonality(picks: Pick[]): PersonalityResult {
  const chosen = picks.map(p => p.chosen);
  const totalPicks = chosen.length;

  // Calculate metrics
  const avgValue = chosen.reduce((s, c) => s + parseValue(c.estimatedValueRaw), 0) / totalPicks;
  const vintageCount = chosen.filter(c => c.year < 1990).length;
  const modernCount = chosen.filter(c => c.year >= 2010).length;
  const rookieCount = chosen.filter(c => c.rookie).length;
  const sports = new Set(chosen.map(c => c.sport));
  const brands = chosen.map(c => getBrand(c.set));
  const brandCounts: Record<string, number> = {};
  for (const b of brands) brandCounts[b] = (brandCounts[b] || 0) + 1;
  const topBrandCount = Math.max(...Object.values(brandCounts));

  // How many times the user chose the LESS valuable card
  let contrarianCount = 0;
  let lowValueCount = 0;
  let highValueCount = 0;
  for (const p of picks) {
    const chosenVal = parseValue(p.chosen.estimatedValueRaw);
    const otherVal = parseValue(p.other.estimatedValueRaw);
    if (chosenVal < otherVal) contrarianCount++;
    if (chosenVal < 100) lowValueCount++;
    if (chosenVal >= 1000) highValueCount++;
  }

  // Score each personality
  const scores: { type: PersonalityType; score: number; description: string; emoji: string }[] = [
    {
      type: 'Vintage Connoisseur',
      score: vintageCount / totalPicks,
      description: `You chose ${vintageCount} cards from before 1990. You appreciate the history and timelessness of classic cards. Tobacco-era cardboard and junk wax legends call to you.`,
      emoji: '\ud83c\udfdb\ufe0f',
    },
    {
      type: 'Modern Flipper',
      score: modernCount >= 14 && avgValue > 200 ? 0.85 : (modernCount / totalPicks) * 0.7 + (avgValue > 500 ? 0.15 : 0),
      description: `You gravitated toward newer, higher-value cards. ${modernCount} of your picks were from 2010 or later. You have an eye for the modern market and potential flips.`,
      emoji: '\ud83d\udcb8',
    },
    {
      type: 'Bargain Hunter',
      score: lowValueCount / totalPicks,
      description: `You chose ${lowValueCount} cards valued under $100. You see value where others don't and know that a smart collection doesn't have to break the bank.`,
      emoji: '\ud83c\udff7\ufe0f',
    },
    {
      type: 'Big Spender',
      score: highValueCount / totalPicks,
      description: `You went for the premium cards, picking ${highValueCount} cards worth $1,000+. Average pick value: ${formatMoney(Math.round(avgValue))}. Go big or go home.`,
      emoji: '\ud83d\udc8e',
    },
    {
      type: 'Rookie Chaser',
      score: rookieCount / totalPicks,
      description: `${rookieCount} of your 20 picks were rookie cards. You love the thrill of a first-year card and the upside potential that comes with it.`,
      emoji: '\u2b50',
    },
    {
      type: 'Cross-Sport Collector',
      score: sports.size >= 4 ? 0.8 : sports.size >= 3 ? 0.55 : sports.size / 4 * 0.4,
      description: `Your picks spanned ${sports.size} different sport${sports.size > 1 ? 's' : ''}. You don't limit yourself to one league — the whole world of cards is your playground.`,
      emoji: '\ud83c\udf0d',
    },
    {
      type: 'Brand Loyalist',
      score: topBrandCount / totalPicks,
      description: `You kept coming back to the same brand: ${topBrandCount} of your picks were from ${Object.entries(brandCounts).sort((a, b) => b[1] - a[1])[0][0]}. You know what you like and you stick with it.`,
      emoji: '\ud83c\udff4',
    },
    {
      type: 'The Contrarian',
      score: contrarianCount / totalPicks,
      description: `You chose the less valuable card ${contrarianCount} out of 20 times. You follow your gut, not the market. Collecting is personal, and you prove it.`,
      emoji: '\ud83e\udd18',
    },
  ];

  scores.sort((a, b) => b.score - a.score);
  const winner = scores[0];
  return { type: winner.type, description: winner.description, emoji: winner.emoji };
}

/* ── card display ────────────────────────────────────────────────── */

function MiniCardFrame({ card }: { card: SportsCard }) {
  const colors = sportPatternColors[card.sport] || sportPatternColors.baseball;
  const initials = card.player.split(' ').filter(p => p.length > 0).map(p => p[0].toUpperCase()).slice(0, 2).join('');

  return (
    <div
      className="relative w-full aspect-[2.5/3.5] rounded-xl overflow-hidden select-none"
      style={{ background: colors.secondary, border: `2px solid ${colors.primary}` }}
    >
      {/* Top band */}
      <div
        className="absolute top-0 left-0 right-0 h-7 flex items-center justify-between px-2"
        style={{ background: colors.primary }}
      >
        <span className="text-white text-xs font-bold opacity-90" style={{ fontSize: '0.6rem', letterSpacing: '0.1em' }}>
          {card.sport === 'baseball' ? 'MLB' : card.sport === 'basketball' ? 'NBA' : card.sport === 'football' ? 'NFL' : 'NHL'}
        </span>
        <span className="text-white font-bold" style={{ fontSize: '0.6rem' }}>{card.year}</span>
        {card.rookie && (
          <span className="bg-yellow-400 text-black font-black px-1 rounded" style={{ fontSize: '0.55rem' }}>RC</span>
        )}
      </div>

      {/* Art area */}
      <div
        className="absolute top-7 left-1.5 right-1.5 bottom-10 rounded flex flex-col items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${colors.primary}33 0%, ${colors.secondary}CC 100%)` }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(135deg, ${colors.primary}08 0px, ${colors.primary}08 1px, transparent 1px, transparent 8px)`,
          }}
        />
        <span
          className="relative z-10 font-black leading-none font-sans"
          style={{
            fontSize: '2.2rem',
            color: colors.primary,
            opacity: 0.80,
            textShadow: `0 2px 10px ${colors.secondary}CC`,
          }}
        >
          {initials}
        </span>
        {card.rookie && (
          <div
            className="absolute bottom-1 right-1 px-1 rounded font-black"
            style={{
              background: '#FFD700',
              color: '#000',
              transform: 'rotate(-8deg)',
              fontSize: '0.38rem',
            }}
          >
            RC
          </div>
        )}
        <div className="absolute bottom-1 left-1 right-1 text-center">
          <p
            className="text-white font-black leading-tight font-sans"
            style={{
              fontSize: card.player.length > 14 ? '0.5rem' : '0.6rem',
              textShadow: `0 1px 4px ${colors.secondary}`,
            }}
          >
            {card.player.toUpperCase()}
          </p>
        </div>
      </div>

      {/* Bottom strip */}
      <div
        className="absolute bottom-0 left-0 right-0 h-10 flex flex-col items-center justify-center px-2"
        style={{ background: `linear-gradient(0deg, ${colors.secondary} 0%, ${colors.secondary}CC 100%)` }}
      >
        <p
          className="font-bold truncate w-full text-center"
          style={{ fontSize: '0.5rem', letterSpacing: '0.05em', color: `${colors.primary}CC` }}
        >
          {card.set.toUpperCase()}
        </p>
        <p className="text-gray-400 opacity-50" style={{ fontSize: '0.45rem' }}>#{card.cardNumber}</p>
      </div>
    </div>
  );
}

/* ── main component ──────────────────────────────────────────────── */

interface ThisOrThatClientProps {
  cards: SportsCard[];
}

export default function ThisOrThatClient({ cards }: ThisOrThatClientProps) {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<GameMode>('daily');
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [round, setRound] = useState(0);
  const [matchups, setMatchups] = useState<Matchup[]>([]);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [personality, setPersonality] = useState<PersonalityResult | null>(null);
  const [selectedSide, setSelectedSide] = useState<'left' | 'right' | null>(null);
  const [stats, setStats] = useState<GameStats>({
    gamesPlayed: 0,
    personalityHistory: [],
    favoriteSport: '',
    favoriteEra: '',
    lastDailyDate: '',
  });
  const [copied, setCopied] = useState(false);
  const [dailyCompleted, setDailyCompleted] = useState(false);

  // Mount + load stats
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setStats(parsed);
        if (parsed.lastDailyDate === getTodayString()) {
          setDailyCompleted(true);
        }
      }
    } catch { /* empty */ }
  }, []);

  // Filter eligible cards
  const eligible = useMemo(() =>
    cards.filter(c =>
      (c.sport === 'baseball' || c.sport === 'basketball' || c.sport === 'football' || c.sport === 'hockey') &&
      parseValue(c.estimatedValueRaw) > 0
    ),
    [cards]
  );

  // Generate matchups
  const generateMatchups = useCallback((gameMode: GameMode): Matchup[] => {
    const seed = gameMode === 'daily'
      ? dateHash(getTodayString() + '-this-or-that')
      : Date.now() + Math.floor(Math.random() * 100000);
    const rng = seededRng(seed);
    const shuffled = shuffle(eligible, rng);

    // Pick 40 unique cards (20 pairs), dedupe by player
    const seen = new Set<string>();
    const pool: SportsCard[] = [];
    for (const c of shuffled) {
      if (seen.has(c.player)) continue;
      seen.add(c.player);
      pool.push(c);
      if (pool.length >= TOTAL_ROUNDS * 2) break;
    }

    const result: Matchup[] = [];
    for (let i = 0; i < TOTAL_ROUNDS && i * 2 + 1 < pool.length; i++) {
      result.push({ cardA: pool[i * 2], cardB: pool[i * 2 + 1] });
    }
    return result;
  }, [eligible]);

  const startGame = useCallback((gameMode: GameMode) => {
    const newMatchups = generateMatchups(gameMode);
    setMode(gameMode);
    setMatchups(newMatchups);
    setPicks([]);
    setRound(0);
    setPersonality(null);
    setSelectedSide(null);
    setPhase('playing');
  }, [generateMatchups]);

  const handlePick = useCallback((side: 'left' | 'right') => {
    if (selectedSide !== null) return; // prevent double-click
    setSelectedSide(side);

    const matchup = matchups[round];
    const chosen = side === 'left' ? matchup.cardA : matchup.cardB;
    const other = side === 'left' ? matchup.cardB : matchup.cardA;
    const newPicks = [...picks, { chosen, other }];

    setTimeout(() => {
      if (round + 1 >= TOTAL_ROUNDS) {
        // Game over
        const result = determinePersonality(newPicks);
        setPersonality(result);
        setPicks(newPicks);

        // Update stats
        const chosenCards = newPicks.map(p => p.chosen);
        const sportCounts: Record<string, number> = {};
        const eraCounts: Record<string, number> = {};
        for (const c of chosenCards) {
          sportCounts[c.sport] = (sportCounts[c.sport] || 0) + 1;
          const era = getEraLabel(c.year);
          eraCounts[era] = (eraCounts[era] || 0) + 1;
        }
        const favSport = Object.entries(sportCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
        const favEra = Object.entries(eraCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

        setStats(prev => {
          const updated: GameStats = {
            gamesPlayed: prev.gamesPlayed + 1,
            personalityHistory: [...prev.personalityHistory, result.type].slice(-20),
            favoriteSport: favSport,
            favoriteEra: favEra,
            lastDailyDate: mode === 'daily' ? getTodayString() : prev.lastDailyDate,
          };
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /* empty */ }
          return updated;
        });

        if (mode === 'daily') setDailyCompleted(true);
        setPhase('result');
      } else {
        setPicks(newPicks);
        setRound(round + 1);
        setSelectedSide(null);
      }
    }, 600);
  }, [round, matchups, picks, selectedSide, mode]);

  const shareResult = useCallback(() => {
    if (!personality) return;
    const chosenCards = picks.map(p => p.chosen);
    const avgVal = Math.round(chosenCards.reduce((s, c) => s + parseValue(c.estimatedValueRaw), 0) / chosenCards.length);
    const rookiePct = Math.round((chosenCards.filter(c => c.rookie).length / chosenCards.length) * 100);
    const text = [
      `Card This or That ${personality.emoji}`,
      `My Collector Personality: ${personality.type}`,
      ``,
      `Avg pick value: ${formatMoney(avgVal)}`,
      `Rookie %: ${rookiePct}%`,
      `Sports: ${[...new Set(chosenCards.map(c => c.sport))].join(', ')}`,
      ``,
      `https://cardvault-two.vercel.app/card-this-or-that`,
    ].join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => { /* empty */ });
  }, [personality, picks]);

  if (!mounted) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center">
        <div className="text-gray-400">Loading game...</div>
      </div>
    );
  }

  /* ── MENU PHASE ─────────────────────────────────────────────────── */

  if (phase === 'menu') {
    return (
      <div className="space-y-6">
        {/* How to play */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-3 text-center">
            <div className="text-2xl mb-1">{'\ud83c\udccf'}</div>
            <p className="text-white text-sm font-medium">Two Cards</p>
            <p className="text-gray-500 text-xs">Shown side by side</p>
          </div>
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-3 text-center">
            <div className="text-2xl mb-1">{'\ud83d\udc46'}</div>
            <p className="text-white text-sm font-medium">Pick One</p>
            <p className="text-gray-500 text-xs">Which would you rather own?</p>
          </div>
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-3 text-center">
            <div className="text-2xl mb-1">{'\ud83e\udde0'}</div>
            <p className="text-white text-sm font-medium">Get Results</p>
            <p className="text-gray-500 text-xs">Discover your type</p>
          </div>
        </div>

        {/* Mode selection */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg mb-4">Choose Mode</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => startGame('daily')}
              disabled={dailyCompleted}
              className={`text-left p-5 rounded-xl border transition-all ${
                dailyCompleted
                  ? 'bg-gray-900/50 border-gray-700 opacity-50 cursor-not-allowed'
                  : 'bg-violet-950/40 border-violet-700/50 hover:border-violet-500 hover:bg-violet-950/60 cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{'\ud83d\udcc5'}</span>
                <span className="text-white font-bold">Daily Challenge</span>
              </div>
              <p className="text-gray-400 text-sm">
                {dailyCompleted
                  ? 'Already completed today. Come back tomorrow!'
                  : 'Same 20 matchups for everyone today. Compare with friends.'}
              </p>
            </button>
            <button
              onClick={() => startGame('random')}
              className="text-left p-5 rounded-xl border bg-gray-900/50 border-gray-700 hover:border-violet-500 hover:bg-violet-950/30 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{'\ud83c\udfb2'}</span>
                <span className="text-white font-bold">Random Mode</span>
              </div>
              <p className="text-gray-400 text-sm">
                Fresh matchups every time. Play as many rounds as you want.
              </p>
            </button>
          </div>
        </div>

        {/* Stats */}
        {stats.gamesPlayed > 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-white font-bold text-lg mb-3">Your Stats</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold text-violet-400">{stats.gamesPlayed}</div>
                <div className="text-gray-500 text-xs">Games Played</div>
              </div>
              <div>
                <div className="text-sm font-bold text-violet-400">{stats.personalityHistory[stats.personalityHistory.length - 1] || '---'}</div>
                <div className="text-gray-500 text-xs">Last Personality</div>
              </div>
              <div>
                <div className="text-sm font-bold text-violet-400 capitalize">{stats.favoriteSport || '---'}</div>
                <div className="text-gray-500 text-xs">Favorite Sport</div>
              </div>
              <div>
                <div className="text-sm font-bold text-violet-400">{stats.favoriteEra || '---'}</div>
                <div className="text-gray-500 text-xs">Favorite Era</div>
              </div>
            </div>
            {stats.personalityHistory.length > 1 && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="text-gray-500 text-xs mb-2">Personality History (last {stats.personalityHistory.length})</div>
                <div className="flex flex-wrap gap-1.5">
                  {stats.personalityHistory.map((p, i) => (
                    <span key={i} className="bg-violet-950/50 border border-violet-800/40 text-violet-400 text-xs px-2 py-0.5 rounded-full">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  /* ── PLAYING PHASE ──────────────────────────────────────────────── */

  if (phase === 'playing' && matchups.length > 0) {
    const matchup = matchups[round];
    const progressPct = (round / TOTAL_ROUNDS) * 100;

    return (
      <div className="space-y-5">
        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <span className="text-violet-400 text-sm font-bold whitespace-nowrap">
            Round {round + 1}/{TOTAL_ROUNDS}
          </span>
          <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-gray-500 text-xs whitespace-nowrap">
            {picks.length} picked
          </span>
        </div>

        {/* Question */}
        <div className="text-center">
          <h2 className="text-white font-bold text-xl">Which card would you rather own?</h2>
          <p className="text-gray-500 text-sm mt-1">Tap or click to pick your choice</p>
        </div>

        {/* VS display */}
        <div className="text-center text-gray-600 font-bold text-sm tracking-wider">
          THIS {'\u2022'} OR {'\u2022'} THAT
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5">
          {[
            { card: matchup.cardA, side: 'left' as const },
            { card: matchup.cardB, side: 'right' as const },
          ].map(({ card, side }) => {
            const isSelected = selectedSide === side;
            const isRejected = selectedSide !== null && selectedSide !== side;
            const sc = sportColors[card.sport] || sportColors.baseball;

            return (
              <button
                key={card.slug}
                onClick={() => handlePick(side)}
                disabled={selectedSide !== null}
                className={`text-left rounded-2xl border-2 p-3 sm:p-4 transition-all duration-500 ${
                  isSelected
                    ? 'border-violet-500 bg-violet-950/40 scale-[1.02] ring-2 ring-violet-500/40'
                    : isRejected
                      ? 'border-gray-800 bg-gray-900/30 opacity-40 scale-95'
                      : `${sc.border} ${sc.bg} hover:border-violet-500/70 hover:scale-[1.01] cursor-pointer`
                }`}
              >
                {/* Mini card frame */}
                <div className="w-full max-w-[140px] mx-auto mb-3">
                  <MiniCardFrame card={card} />
                </div>

                {/* Card info */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${sc.badge}`}>
                      {sportEmoji[card.sport]} {card.sport}
                    </span>
                    {card.rookie && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-900/50 text-yellow-400">RC</span>
                    )}
                  </div>
                  <h3 className="text-white font-bold text-sm sm:text-base leading-tight">{card.player}</h3>
                  <p className="text-gray-500 text-xs">{card.year} {card.set.replace(/^\d{4}(-\d{2})?\s+/, '')}</p>
                  <div className="text-violet-400 font-bold text-sm">{card.estimatedValueRaw}</div>
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <div className="mt-2 text-center">
                    <span className="inline-flex items-center gap-1 text-violet-400 text-xs font-bold">
                      {'\u2713'} Selected
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── RESULT PHASE ───────────────────────────────────────────────── */

  if (phase === 'result' && personality) {
    const chosenCards = picks.map(p => p.chosen);
    const avgValue = Math.round(chosenCards.reduce((s, c) => s + parseValue(c.estimatedValueRaw), 0) / chosenCards.length);
    const rookiePct = Math.round((chosenCards.filter(c => c.rookie).length / chosenCards.length) * 100);
    const vintPct = Math.round((chosenCards.filter(c => c.year < 1990).length / chosenCards.length) * 100);
    const modPct = Math.round((chosenCards.filter(c => c.year >= 2010).length / chosenCards.length) * 100);
    const sportBreakdown: Record<string, number> = {};
    for (const c of chosenCards) sportBreakdown[c.sport] = (sportBreakdown[c.sport] || 0) + 1;
    const eraBreakdown: Record<string, number> = {};
    for (const c of chosenCards) {
      const era = getEraLabel(c.year);
      eraBreakdown[era] = (eraBreakdown[era] || 0) + 1;
    }

    return (
      <div className="space-y-6">
        {/* Personality Result Card */}
        <div className="bg-gradient-to-br from-violet-950/80 via-gray-900 to-gray-900 border-2 border-violet-700/60 rounded-2xl p-6 sm:p-8 text-center">
          <div className="text-5xl mb-3">{personality.emoji}</div>
          <div className="text-violet-400 text-xs font-bold tracking-widest uppercase mb-2">Your Collector Personality</div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">{personality.type}</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">{personality.description}</p>
        </div>

        {/* Stats Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
            <div className="text-xl font-bold text-violet-400">{formatMoney(avgValue)}</div>
            <div className="text-gray-500 text-xs mt-1">Avg Value Chosen</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
            <div className="text-xl font-bold text-violet-400">{rookiePct}%</div>
            <div className="text-gray-500 text-xs mt-1">Rookie Cards</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
            <div className="text-xl font-bold text-violet-400">{vintPct}%</div>
            <div className="text-gray-500 text-xs mt-1">Vintage (pre-1990)</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
            <div className="text-xl font-bold text-violet-400">{modPct}%</div>
            <div className="text-gray-500 text-xs mt-1">Modern (2010+)</div>
          </div>
        </div>

        {/* Sport Breakdown */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
          <h3 className="text-white font-bold text-sm mb-3">Sports Breakdown</h3>
          <div className="space-y-2">
            {Object.entries(sportBreakdown)
              .sort((a, b) => b[1] - a[1])
              .map(([sport, count]) => (
                <div key={sport} className="flex items-center gap-3">
                  <span className="text-sm w-24 capitalize">{sportEmoji[sport]} {sport}</span>
                  <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-600 rounded-full"
                      style={{ width: `${(count / TOTAL_ROUNDS) * 100}%` }}
                    />
                  </div>
                  <span className="text-gray-400 text-xs w-8 text-right">{count}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Era Breakdown */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
          <h3 className="text-white font-bold text-sm mb-3">Era Breakdown</h3>
          <div className="space-y-2">
            {Object.entries(eraBreakdown)
              .sort((a, b) => {
                const order = ['Pre-1970', '1970s-1980s', '1990s-2000s', '2010s+'];
                return order.indexOf(a[0]) - order.indexOf(b[0]);
              })
              .map(([era, count]) => (
                <div key={era} className="flex items-center gap-3">
                  <span className="text-sm text-gray-300 w-28">{era}</span>
                  <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-600 rounded-full"
                      style={{ width: `${(count / TOTAL_ROUNDS) * 100}%` }}
                    />
                  </div>
                  <span className="text-gray-400 text-xs w-8 text-right">{count}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={shareResult}
            className="flex-1 bg-violet-700 hover:bg-violet-600 text-white font-bold py-3 px-6 rounded-xl transition-colors cursor-pointer"
          >
            {copied ? '\u2713 Copied!' : 'Share Result'}
          </button>
          <button
            onClick={() => startGame('random')}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-colors cursor-pointer"
          >
            Play Again (Random)
          </button>
          <button
            onClick={() => { setPhase('menu'); setSelectedSide(null); }}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-3 px-6 rounded-xl border border-gray-700 transition-colors cursor-pointer"
          >
            Back to Menu
          </button>
        </div>

        {/* Pick history */}
        <details className="bg-gray-800 border border-gray-700 rounded-2xl">
          <summary className="cursor-pointer px-5 py-4 text-sm font-bold text-white">
            View All 20 Picks
          </summary>
          <div className="px-5 pb-5 space-y-2">
            {picks.map((p, i) => {
              const chosenVal = parseValue(p.chosen.estimatedValueRaw);
              const otherVal = parseValue(p.other.estimatedValueRaw);
              const pickedHigher = chosenVal >= otherVal;
              return (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-700/50 last:border-0">
                  <span className="text-gray-600 text-xs w-6">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-violet-400 text-xs">{'\u2713'}</span>
                      <span className="text-white text-sm font-medium truncate">{p.chosen.player}</span>
                      <span className="text-gray-600 text-xs">{p.chosen.year}</span>
                      {p.chosen.rookie && <span className="text-yellow-500 text-xs">RC</span>}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-gray-600 text-xs">vs</span>
                      <span className="text-gray-500 text-xs truncate">{p.other.player} ({p.other.year})</span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${pickedHigher ? 'bg-green-900/40 text-green-400' : 'bg-amber-900/40 text-amber-400'}`}>
                    {pickedHigher ? 'Higher' : 'Lower'}
                  </span>
                </div>
              );
            })}
          </div>
        </details>
      </div>
    );
  }

  return null;
}

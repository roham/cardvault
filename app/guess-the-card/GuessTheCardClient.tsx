'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { sportsCards, type SportsCard } from '@/data/sports-cards';

// ─── Types ───────────────────────────────────────────────────────────

interface GuessResult {
  card: SportsCard;
  sport: 'correct' | 'wrong';
  year: 'correct' | 'close' | 'wrong';
  yearDir: 'up' | 'down' | 'exact';
  value: 'correct' | 'close' | 'wrong';
  valueDir: 'up' | 'down' | 'exact';
  rookie: 'correct' | 'wrong';
  set: 'correct' | 'wrong';
}

interface DayState {
  date: string;
  guesses: string[]; // slugs
  solved: boolean;
}

interface GameStats {
  played: number;
  won: number;
  streak: number;
  maxStreak: number;
  lastPlayDate: string;
  distribution: number[]; // [0]=1-guess, [1]=2-guess, ... [5]=6-guess
}

type Phase = 'playing' | 'won' | 'lost';

// ─── Helpers ─────────────────────────────────────────────────────────

const STORAGE_KEY = 'cardvault-guess-the-card';
const STATS_KEY = 'cardvault-guess-stats';
const MAX_GUESSES = 6;

const sportEmoji: Record<string, string> = {
  baseball: '\u26BE',
  basketball: '\uD83C\uDFC0',
  football: '\uD83C\uDFC8',
  hockey: '\uD83C\uDFD2',
};

function dateHash(dateStr: string): number {
  let hash = 0;
  const str = dateStr + '-guess-the-card-v1';
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseValueToNumber(val: string): number {
  // Extract the first dollar amount from strings like "$10-$30 (PSA 7)"
  const match = val.match(/\$([0-9,]+)/);
  if (!match) return 0;
  return parseInt(match[1].replace(/,/g, ''), 10);
}

function valueTier(val: number): number {
  if (val >= 10000) return 6;
  if (val >= 1000) return 5;
  if (val >= 100) return 4;
  if (val >= 25) return 3;
  if (val >= 5) return 2;
  return 1;
}

const tierLabels: Record<number, string> = {
  1: 'Under $5',
  2: '$5–$24',
  3: '$25–$99',
  4: '$100–$999',
  5: '$1K–$9.9K',
  6: '$10K+',
};

function compareGuess(guess: SportsCard, answer: SportsCard): GuessResult {
  const guessVal = parseValueToNumber(guess.estimatedValueRaw);
  const answerVal = parseValueToNumber(answer.estimatedValueRaw);
  const guessTier = valueTier(guessVal);
  const answerTier = valueTier(answerVal);

  const yearDiff = Math.abs(guess.year - answer.year);

  return {
    card: guess,
    sport: guess.sport === answer.sport ? 'correct' : 'wrong',
    year: guess.year === answer.year ? 'correct' : yearDiff <= 5 ? 'close' : 'wrong',
    yearDir: guess.year === answer.year ? 'exact' : guess.year < answer.year ? 'up' : 'down',
    value: guessTier === answerTier ? 'correct' : Math.abs(guessTier - answerTier) === 1 ? 'close' : 'wrong',
    valueDir: guessTier === answerTier ? 'exact' : guessTier < answerTier ? 'up' : 'down',
    rookie: guess.rookie === answer.rookie ? 'correct' : 'wrong',
    set: guess.set === answer.set ? 'correct' : 'wrong',
  };
}

function clueEmoji(result: 'correct' | 'close' | 'wrong'): string {
  if (result === 'correct') return '\uD83D\uDFE9'; // green
  if (result === 'close') return '\uD83D\uDFE8'; // yellow
  return '\uD83D\uDFE5'; // red
}

function dirEmoji(dir: 'up' | 'down' | 'exact'): string {
  if (dir === 'up') return '\u2B06\uFE0F';
  if (dir === 'down') return '\u2B07\uFE0F';
  return '';
}

// ─── Component ───────────────────────────────────────────────────────

export default function GuessTheCardClient() {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [phase, setPhase] = useState<Phase>('playing');
  const [stats, setStats] = useState<GameStats>({ played: 0, won: 0, streak: 0, maxStreak: 0, lastPlayDate: '', distribution: [0, 0, 0, 0, 0, 0] });
  const [copied, setCopied] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const today = useMemo(() => todayStr(), []);

  // Pick today's mystery card
  const answer = useMemo(() => {
    const idx = dateHash(today) % sportsCards.length;
    return sportsCards[idx];
  }, [today]);

  // Load state
  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const state: DayState = JSON.parse(raw);
        if (state.date === today) {
          // Restore guesses
          const restored: GuessResult[] = [];
          for (const slug of state.guesses) {
            const card = sportsCards.find(c => c.slug === slug);
            if (card) restored.push(compareGuess(card, answer));
          }
          setGuesses(restored);
          if (state.solved) {
            setPhase('won');
          } else if (state.guesses.length >= MAX_GUESSES) {
            setPhase('lost');
          }
        }
      }
      const statsRaw = localStorage.getItem(STATS_KEY);
      if (statsRaw) setStats(JSON.parse(statsRaw));
    } catch { /* ignore */ }
  }, [today, answer]);

  // Filter cards for search
  const filtered = useMemo(() => {
    if (search.length < 2) return [];
    const q = search.toLowerCase();
    const usedSlugs = new Set(guesses.map(g => g.card.slug));
    return sportsCards
      .filter(c => !usedSlugs.has(c.slug) && (c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q)))
      .slice(0, 8);
  }, [search, guesses]);

  const submitGuess = useCallback((card: SportsCard) => {
    if (phase !== 'playing') return;
    if (guesses.some(g => g.card.slug === card.slug)) return;

    const result = compareGuess(card, answer);
    const newGuesses = [...guesses, result];
    setGuesses(newGuesses);
    setSearch('');
    setShowDropdown(false);
    setSelectedIndex(-1);

    const isCorrect = card.slug === answer.slug;
    const isGameOver = newGuesses.length >= MAX_GUESSES;

    // Save day state
    const dayState: DayState = {
      date: today,
      guesses: newGuesses.map(g => g.card.slug),
      solved: isCorrect,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dayState));

    if (isCorrect) {
      setPhase('won');
      updateStats(true, newGuesses.length);
    } else if (isGameOver) {
      setPhase('lost');
      updateStats(false, MAX_GUESSES);
    }
  }, [phase, guesses, answer, today]);

  const updateStats = (won: boolean, numGuesses: number) => {
    setStats(prev => {
      const isConsecutive = prev.lastPlayDate === new Date(new Date(today).getTime() - 86400000).toISOString().slice(0, 10);
      const newStreak = won ? (isConsecutive ? prev.streak + 1 : 1) : 0;
      const newDist = [...prev.distribution];
      if (won) newDist[numGuesses - 1]++;
      const updated: GameStats = {
        played: prev.played + 1,
        won: won ? prev.won + 1 : prev.won,
        streak: newStreak,
        maxStreak: Math.max(prev.maxStreak, newStreak),
        lastPlayDate: today,
        distribution: newDist,
      };
      localStorage.setItem(STATS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const shareResults = () => {
    const lines = [`Guess the Card #${dateHash(today) % 10000} ${phase === 'won' ? guesses.length : 'X'}/${MAX_GUESSES}`, ''];
    for (const g of guesses) {
      lines.push(
        `${clueEmoji(g.sport)}${clueEmoji(g.year)}${clueEmoji(g.value)}${clueEmoji(g.rookie)}${clueEmoji(g.set)}`
      );
    }
    lines.push('', 'cardvault-two.vercel.app/guess-the-card');
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || filtered.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      submitGuess(filtered[selectedIndex]);
    }
  };

  // Countdown to next puzzle
  const [countdown, setCountdown] = useState('');
  useEffect(() => {
    if (phase === 'playing') return;
    const tick = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${h}h ${m}m ${s}s`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  if (!mounted) {
    return <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-8 text-center text-gray-500">Loading puzzle...</div>;
  }

  const clueCell = (label: string, value: string, result: 'correct' | 'close' | 'wrong', dir?: string) => {
    const bg = result === 'correct' ? 'bg-emerald-900/60 border-emerald-700/50' : result === 'close' ? 'bg-amber-900/60 border-amber-700/50' : 'bg-red-950/60 border-red-800/50';
    const text = result === 'correct' ? 'text-emerald-300' : result === 'close' ? 'text-amber-300' : 'text-red-300';
    return (
      <div className={`${bg} border rounded-lg p-2 text-center`}>
        <div className="text-[10px] text-gray-500 uppercase tracking-wide">{label}</div>
        <div className={`text-xs font-medium ${text} truncate`}>{value}{dir ? ` ${dir}` : ''}</div>
      </div>
    );
  };

  return (
    <div>
      {/* Search input */}
      {phase === 'playing' && (
        <div className="relative mb-6">
          <div className="text-sm text-gray-400 mb-2">
            Guess {guesses.length + 1} of {MAX_GUESSES} — Search by player name, set, or year
          </div>
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setShowDropdown(true); setSelectedIndex(-1); }}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={handleKeyDown}
            placeholder="Type a player name or card..."
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-600 transition-colors"
          />
          {showDropdown && filtered.length > 0 && (
            <div ref={dropdownRef} className="absolute z-50 top-full mt-1 w-full bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-h-72 overflow-y-auto">
              {filtered.map((card, i) => (
                <button
                  key={card.slug}
                  onClick={() => submitGuess(card)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors border-b border-gray-800/50 last:border-0 ${i === selectedIndex ? 'bg-gray-800' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{sportEmoji[card.sport] || ''}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">{card.name}</div>
                      <div className="text-gray-500 text-xs">{card.set} &middot; {card.estimatedValueRaw}</div>
                    </div>
                    {card.rookie && <span className="text-[10px] bg-amber-900/60 text-amber-400 px-1.5 py-0.5 rounded font-medium">RC</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
          {showDropdown && search.length >= 2 && filtered.length === 0 && (
            <div className="absolute z-50 top-full mt-1 w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-gray-500 text-sm text-center">
              No matching cards found
            </div>
          )}
        </div>
      )}

      {/* Guess history */}
      {guesses.length > 0 && (
        <div className="space-y-3 mb-6">
          <div className="grid grid-cols-5 gap-1 text-[10px] text-gray-500 uppercase tracking-wide text-center px-1">
            <div>Sport</div>
            <div>Year</div>
            <div>Value</div>
            <div>Rookie</div>
            <div>Set</div>
          </div>
          {guesses.map((g, i) => (
            <div key={i}>
              <div className="text-xs text-gray-400 mb-1 truncate">
                <span className="text-gray-600">#{i + 1}</span> {g.card.name}
              </div>
              <div className="grid grid-cols-5 gap-1">
                {clueCell('Sport', `${sportEmoji[g.card.sport]} ${g.card.sport}`, g.sport)}
                {clueCell('Year', `${g.card.year}`, g.year, g.yearDir !== 'exact' ? dirEmoji(g.yearDir) : undefined)}
                {clueCell('Value', tierLabels[valueTier(parseValueToNumber(g.card.estimatedValueRaw))], g.value, g.valueDir !== 'exact' ? dirEmoji(g.valueDir) : undefined)}
                {clueCell('Rookie', g.card.rookie ? 'Yes' : 'No', g.rookie)}
                {clueCell('Set', g.card.set.length > 12 ? g.card.set.slice(0, 12) + '...' : g.card.set, g.set)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Win/Loss result */}
      {phase !== 'playing' && (
        <div className={`p-6 rounded-2xl border mb-6 ${phase === 'won' ? 'bg-emerald-950/40 border-emerald-800/50' : 'bg-red-950/40 border-red-800/50'}`}>
          <div className="text-center mb-4">
            <div className="text-2xl mb-2">{phase === 'won' ? '\uD83C\uDF89' : '\uD83D\uDE14'}</div>
            <h3 className="text-xl font-bold text-white">
              {phase === 'won' ? `Solved in ${guesses.length}!` : 'Better luck tomorrow!'}
            </h3>
          </div>

          {/* Reveal the answer */}
          <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4 mb-4">
            <div className="text-xs text-gray-500 uppercase mb-1">Today&apos;s Card</div>
            <div className="text-white font-semibold">{answer.name}</div>
            <div className="text-gray-400 text-sm mt-1">
              {sportEmoji[answer.sport]} {answer.sport.charAt(0).toUpperCase() + answer.sport.slice(1)} &middot; {answer.set} &middot; {answer.estimatedValueRaw}
              {answer.rookie && <span className="ml-2 text-amber-400 text-xs font-medium">[Rookie]</span>}
            </div>
            <Link href={`/sports/${answer.slug}`} className="text-amber-400 hover:text-amber-300 text-xs mt-2 inline-block">
              View card page &rarr;
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="text-center">
              <div className="text-xl font-bold text-white">{stats.played}</div>
              <div className="text-[10px] text-gray-500">Played</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">{stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0}%</div>
              <div className="text-[10px] text-gray-500">Win Rate</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">{stats.streak}</div>
              <div className="text-[10px] text-gray-500">Streak</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">{stats.maxStreak}</div>
              <div className="text-[10px] text-gray-500">Max Streak</div>
            </div>
          </div>

          {/* Distribution */}
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-2">Guess Distribution</div>
            {stats.distribution.map((count, i) => {
              const max = Math.max(...stats.distribution, 1);
              const pct = (count / max) * 100;
              const isThis = phase === 'won' && guesses.length === i + 1;
              return (
                <div key={i} className="flex items-center gap-2 mb-1">
                  <div className="text-xs text-gray-500 w-3">{i + 1}</div>
                  <div className="flex-1 h-5">
                    <div
                      className={`h-full rounded text-xs text-white flex items-center justify-end pr-2 ${isThis ? 'bg-emerald-600' : 'bg-gray-700'}`}
                      style={{ width: `${Math.max(pct, 8)}%` }}
                    >
                      {count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={shareResults}
              className="flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-xl transition-colors text-sm"
            >
              {copied ? 'Copied!' : 'Share Results'}
            </button>
            <div className="flex-1 text-center py-2.5">
              <div className="text-[10px] text-gray-500">Next puzzle in</div>
              <div className="text-white text-sm font-mono">{countdown}</div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {phase === 'playing' && guesses.length === 0 && (
        <div className="p-8 bg-gray-900/40 border border-gray-800 rounded-2xl text-center">
          <div className="text-4xl mb-3">&#129300;</div>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            A mystery sports card has been selected. Start typing a player name, year, or set to make your first guess.
            You have {MAX_GUESSES} tries.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
            <span className="px-2 py-1 bg-gray-800 text-gray-500 rounded">4,000+ sports cards</span>
            <span className="px-2 py-1 bg-gray-800 text-gray-500 rounded">4 sports</span>
            <span className="px-2 py-1 bg-gray-800 text-gray-500 rounded">1909–2025</span>
          </div>
        </div>
      )}
    </div>
  );
}

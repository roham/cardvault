'use client';

import { useState, useMemo, useCallback } from 'react';
import { sportsCards } from '@/data/sports-cards';
import type { SportsCard } from '@/data/sports-cards';

function dateHash(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const ch = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0;
  }
  return Math.abs(hash);
}

function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getDailyCard(): SportsCard {
  const today = getToday();
  // Filter to cards with enough info for good clues
  const eligible = sportsCards.filter(c => c.description.length > 50 && c.player.length > 3);
  const idx = dateHash(today + 'detective-v1') % eligible.length;
  return eligible[idx];
}

function getDecade(year: number): string {
  const decade = Math.floor(year / 10) * 10;
  return `${decade}s`;
}

function getValueTier(card: SportsCard): string {
  const gemStr = card.estimatedValueGem;
  const nums = gemStr.match(/[\d,]+/g);
  if (!nums) return 'Unknown';
  const max = Math.max(...nums.map(n => parseInt(n.replace(/,/g, ''), 10)));
  if (max >= 10000) return '$10,000+';
  if (max >= 1000) return '$1,000-$9,999';
  if (max >= 100) return '$100-$999';
  if (max >= 25) return '$25-$99';
  return 'Under $25';
}

function extractKeyword(desc: string): string {
  // Find an interesting word from the description
  const keywords = desc.split(/[.!,;:]/).filter(s => s.trim().length > 10);
  if (keywords.length === 0) return 'A notable card in the hobby.';
  const sentence = keywords[0].trim();
  // Obscure the player name from the hint
  return sentence.length > 80 ? sentence.slice(0, 80) + '...' : sentence;
}

interface Clue {
  label: string;
  value: string;
  icon: string;
}

function generateClues(card: SportsCard): Clue[] {
  return [
    { label: 'Sport', value: card.sport.charAt(0).toUpperCase() + card.sport.slice(1), icon: '1' },
    { label: 'Era', value: getDecade(card.year), icon: '2' },
    { label: 'Rookie Card?', value: card.rookie ? 'Yes, this is a rookie card' : 'No, not a rookie card', icon: '3' },
    { label: 'Value Tier (Gem)', value: getValueTier(card), icon: '4' },
    { label: 'Card Year', value: card.year.toString(), icon: '5' },
    { label: 'Set', value: card.set, icon: '6' },
  ];
}

type GameState = 'playing' | 'won' | 'lost';

const STORAGE_KEY = 'cardvault-detective-v1';

interface SavedState {
  date: string;
  revealedClues: number;
  guesses: string[];
  state: GameState;
}

function loadState(): SavedState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as SavedState;
    if (saved.date !== getToday()) return null;
    return saved;
  } catch { return null; }
}

function saveState(state: SavedState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Stats
const STATS_KEY = 'cardvault-detective-stats';
interface Stats {
  played: number;
  won: number;
  streak: number;
  maxStreak: number;
  distribution: number[]; // index = clues used (1-6), value = count
}

function loadStats(): Stats {
  if (typeof window === 'undefined') return { played: 0, won: 0, streak: 0, maxStreak: 0, distribution: [0,0,0,0,0,0] };
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return { played: 0, won: 0, streak: 0, maxStreak: 0, distribution: [0,0,0,0,0,0] };
    return JSON.parse(raw);
  } catch { return { played: 0, won: 0, streak: 0, maxStreak: 0, distribution: [0,0,0,0,0,0] }; }
}

function saveStats(stats: Stats) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export default function CardDetectiveClient() {
  const card = useMemo(() => getDailyCard(), []);
  const clues = useMemo(() => generateClues(card), [card]);

  const savedState = useMemo(() => loadState(), []);
  const [revealedClues, setRevealedClues] = useState(savedState?.revealedClues ?? 1);
  const [guesses, setGuesses] = useState<string[]>(savedState?.guesses ?? []);
  const [gameState, setGameState] = useState<GameState>(savedState?.state ?? 'playing');
  const [guessInput, setGuessInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = useMemo(() => {
    if (guessInput.length < 2) return [];
    const q = guessInput.toLowerCase();
    const seen = new Set<string>();
    return sportsCards
      .filter(c => {
        const playerLower = c.player.toLowerCase();
        if (seen.has(playerLower)) return false;
        if (!playerLower.includes(q)) return false;
        seen.add(playerLower);
        return true;
      })
      .slice(0, 8)
      .map(c => c.player);
  }, [guessInput]);

  const persist = useCallback((cluesN: number, guessesArr: string[], state: GameState) => {
    saveState({ date: getToday(), revealedClues: cluesN, guesses: guessesArr, state });
  }, []);

  const handleGuess = (playerName: string) => {
    const guess = playerName.trim();
    if (!guess || gameState !== 'playing') return;

    const newGuesses = [...guesses, guess];
    const isCorrect = guess.toLowerCase() === card.player.toLowerCase();

    if (isCorrect) {
      setGuesses(newGuesses);
      setGameState('won');
      setGuessInput('');
      setShowSuggestions(false);
      persist(revealedClues, newGuesses, 'won');
      // Update stats
      const stats = loadStats();
      stats.played++;
      stats.won++;
      stats.streak++;
      if (stats.streak > stats.maxStreak) stats.maxStreak = stats.streak;
      if (revealedClues >= 1 && revealedClues <= 6) stats.distribution[revealedClues - 1]++;
      saveStats(stats);
      return;
    }

    // Wrong guess
    if (revealedClues >= 6) {
      // Used all clues and still wrong
      setGuesses(newGuesses);
      setGameState('lost');
      setGuessInput('');
      setShowSuggestions(false);
      persist(revealedClues, newGuesses, 'lost');
      const stats = loadStats();
      stats.played++;
      stats.streak = 0;
      saveStats(stats);
    } else {
      // Reveal next clue
      const newRevealed = revealedClues + 1;
      setRevealedClues(newRevealed);
      setGuesses(newGuesses);
      setGuessInput('');
      setShowSuggestions(false);
      persist(newRevealed, newGuesses, 'playing');
    }
  };

  const stats = useMemo(() => loadStats(), [gameState]);
  const maxDist = Math.max(...stats.distribution, 1);

  return (
    <div className="space-y-6">
      {/* Game Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Clue {revealedClues}/6</span>
          <span className="text-sm text-gray-500">Guesses: {guesses.length}</span>
        </div>
        {gameState === 'playing' && (
          <span className="text-xs font-medium bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full">ACTIVE</span>
        )}
        {gameState === 'won' && (
          <span className="text-xs font-medium bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full">SOLVED in {revealedClues} clue{revealedClues > 1 ? 's' : ''}</span>
        )}
        {gameState === 'lost' && (
          <span className="text-xs font-medium bg-red-500/20 text-red-400 px-2.5 py-1 rounded-full">MISSED</span>
        )}
      </div>

      {/* Clues */}
      <div className="space-y-3">
        {clues.map((clue, i) => {
          const isRevealed = i < revealedClues;
          return (
            <div
              key={clue.label}
              className={`rounded-xl border p-4 transition-all ${
                isRevealed
                  ? 'border-gray-700 bg-gray-900'
                  : 'border-gray-800/50 bg-gray-900/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  isRevealed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-600'
                }`}>
                  {clue.icon}
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-medium ${isRevealed ? 'text-gray-400' : 'text-gray-600'}`}>{clue.label}</p>
                  {isRevealed ? (
                    <p className="text-white font-semibold">{clue.value}</p>
                  ) : (
                    <p className="text-gray-700 italic">Locked — make a guess to reveal</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Guess Input */}
      {gameState === 'playing' && (
        <div className="relative">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={guessInput}
                onChange={(e) => { setGuessInput(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Guess the player..."
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
                onKeyDown={(e) => { if (e.key === 'Enter' && guessInput.trim()) handleGuess(guessInput); }}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                  {suggestions.map(name => (
                    <button
                      key={name}
                      onClick={() => { handleGuess(name); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-700 border-b border-gray-700/50 last:border-0 text-white text-sm transition-colors"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => { if (guessInput.trim()) handleGuess(guessInput); }}
              disabled={!guessInput.trim()}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Guess
            </button>
          </div>
          <p className="text-gray-600 text-xs mt-2">
            Wrong guess reveals the next clue. You have {6 - revealedClues} clue{6 - revealedClues !== 1 ? 's' : ''} remaining.
          </p>
        </div>
      )}

      {/* Previous Guesses */}
      {guesses.length > 0 && (
        <div className="space-y-2">
          <p className="text-gray-500 text-xs font-medium">Previous Guesses</p>
          <div className="flex flex-wrap gap-2">
            {guesses.map((g, i) => {
              const isCorrect = g.toLowerCase() === card.player.toLowerCase();
              return (
                <span
                  key={`${g}-${i}`}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    isCorrect
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/10 text-red-400/80 border border-red-500/20'
                  }`}
                >
                  {g} {isCorrect ? '\u2713' : '\u2717'}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Result */}
      {gameState !== 'playing' && (
        <div className={`rounded-xl border p-6 ${
          gameState === 'won' ? 'border-emerald-500/50 bg-emerald-950/20' : 'border-red-500/50 bg-red-950/20'
        }`}>
          <div className="text-center mb-4">
            <span className={`text-3xl font-black ${gameState === 'won' ? 'text-emerald-400' : 'text-red-400'}`}>
              {gameState === 'won' ? 'SOLVED!' : 'The card was...'}
            </span>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h3 className="text-white font-bold text-lg">{card.name}</h3>
            <p className="text-gray-400 text-sm mt-1">{card.player} &middot; {card.sport} &middot; {card.year}</p>
            <p className="text-gray-500 text-sm mt-2">{card.description}</p>
            <div className="flex gap-4 mt-3 text-xs text-gray-500">
              <span>Raw: {card.estimatedValueRaw}</span>
              <span>Gem: {card.estimatedValueGem}</span>
            </div>
          </div>
          {gameState === 'won' && (
            <p className="text-center text-gray-400 text-sm mt-4">
              You solved it with {revealedClues} clue{revealedClues > 1 ? 's' : ''} and {guesses.length} guess{guesses.length !== 1 ? 'es' : ''}!
            </p>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">Your Stats</h3>
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="text-center">
            <p className="text-white font-bold text-xl">{stats.played}</p>
            <p className="text-gray-500 text-xs">Played</p>
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-xl">{stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0}%</p>
            <p className="text-gray-500 text-xs">Win Rate</p>
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-xl">{stats.streak}</p>
            <p className="text-gray-500 text-xs">Streak</p>
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-xl">{stats.maxStreak}</p>
            <p className="text-gray-500 text-xs">Max Streak</p>
          </div>
        </div>
        <p className="text-gray-500 text-xs font-medium mb-2">Clue Distribution</p>
        <div className="space-y-1">
          {stats.distribution.map((count, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-gray-400 text-xs w-3">{i + 1}</span>
              <div className="flex-1 h-5 bg-gray-800 rounded overflow-hidden">
                <div
                  className={`h-full rounded ${count > 0 ? 'bg-emerald-600' : 'bg-gray-700'}`}
                  style={{ width: `${Math.max((count / maxDist) * 100, count > 0 ? 8 : 0)}%` }}
                />
              </div>
              <span className="text-gray-500 text-xs w-6 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Next game countdown */}
      {gameState !== 'playing' && (
        <div className="text-center text-gray-500 text-sm">
          New mystery card tomorrow. Come back for your daily detective challenge!
        </div>
      )}
    </div>
  );
}

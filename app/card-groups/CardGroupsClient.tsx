'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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

/* ── types ───────────────────────────────────────────────────────── */

interface Group {
  name: string;
  items: string[];         // 4 player names
  difficulty: 0 | 1 | 2 | 3; // yellow, green, blue, purple
}

interface Puzzle {
  groups: Group[];
  allItems: string[];      // 16 shuffled player names
}

interface Stats {
  played: number;
  won: number;
  streak: number;
  bestStreak: number;
  perfectGames: number;
}

/* ── difficulty colors ───────────────────────────────────────────── */

const GROUP_COLORS = [
  { bg: 'bg-yellow-500', text: 'text-yellow-950', label: 'Easy' },
  { bg: 'bg-green-500', text: 'text-green-950', label: 'Medium' },
  { bg: 'bg-blue-500', text: 'text-blue-950', label: 'Hard' },
  { bg: 'bg-purple-500', text: 'text-purple-950', label: 'Tricky' },
];

const SPORTS_ICONS: Record<string, string> = { baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒' };

/* ── puzzle generator ────────────────────────────────────────────── */

function buildPlayerMap() {
  const map = new Map<string, { sport: string; years: number[]; sets: string[]; cards: typeof sportsCards; rookie: boolean; value: number }>();
  for (const c of sportsCards) {
    if ((c.sport as string) === 'pokemon') continue;
    const existing = map.get(c.player);
    const val = parseValue(c.estimatedValueRaw || '$0');
    if (existing) {
      existing.years.push(c.year);
      if (!existing.sets.includes(c.set)) existing.sets.push(c.set);
      existing.cards.push(c);
      if (c.rookie) existing.rookie = true;
      if (val > existing.value) existing.value = val;
    } else {
      map.set(c.player, { sport: c.sport, years: [c.year], sets: [c.set], cards: [c], rookie: !!c.rookie, value: val });
    }
  }
  return map;
}

function getDecade(years: number[]): string {
  const min = Math.min(...years);
  const d = Math.floor(min / 10) * 10;
  return `${d}s`;
}

function generatePuzzle(seed: number): Puzzle {
  const rng = seededRng(seed);
  const playerMap = buildPlayerMap();
  const players = Array.from(playerMap.entries()).filter(([, d]) => d.cards.length >= 2);

  // Category generators — each returns { name, items } or null
  type CatGen = () => { name: string; items: string[] } | null;

  const usedPlayers = new Set<string>();

  function pickFromPool(pool: string[], count: number): string[] | null {
    const available = pool.filter(p => !usedPlayers.has(p));
    if (available.length < count) return null;
    const picked = shuffle(available, rng).slice(0, count);
    return picked;
  }

  // 1. Same sport
  const bySport: CatGen = () => {
    const sports = ['baseball', 'basketball', 'football', 'hockey'];
    const sport = sports[Math.floor(rng() * sports.length)];
    const pool = players.filter(([, d]) => d.sport === sport).map(([n]) => n);
    const picked = pickFromPool(pool, 4);
    if (!picked) return null;
    return { name: `${SPORTS_ICONS[sport] || ''} ${sport.charAt(0).toUpperCase() + sport.slice(1)} Players`, items: picked };
  };

  // 2. Same decade debut
  const byDecade: CatGen = () => {
    const decades = ['1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];
    const decade = decades[Math.floor(rng() * decades.length)];
    const decStart = parseInt(decade);
    const pool = players.filter(([, d]) => {
      const minYear = Math.min(...d.years);
      return minYear >= decStart && minYear < decStart + 10;
    }).map(([n]) => n);
    const picked = pickFromPool(pool, 4);
    if (!picked) return null;
    return { name: `First Card in the ${decade}`, items: picked };
  };

  // 3. All rookies
  const byRookie: CatGen = () => {
    const pool = players.filter(([, d]) => d.rookie).map(([n]) => n);
    const picked = pickFromPool(pool, 4);
    if (!picked) return null;
    return { name: 'Has a Rookie Card', items: picked };
  };

  // 4. Same card set
  const bySet: CatGen = () => {
    const setCount = new Map<string, string[]>();
    for (const [name, data] of players) {
      if (usedPlayers.has(name)) continue;
      for (const s of data.sets) {
        const arr = setCount.get(s) || [];
        arr.push(name);
        setCount.set(s, arr);
      }
    }
    const validSets = Array.from(setCount.entries()).filter(([, p]) => p.length >= 6);
    if (validSets.length === 0) return null;
    const [setName, pool] = validSets[Math.floor(rng() * validSets.length)];
    const picked = pickFromPool(pool, 4);
    if (!picked) return null;
    const shortSet = setName.length > 30 ? setName.slice(0, 28) + '...' : setName;
    return { name: `${shortSet} Cards`, items: picked };
  };

  // 5. Value tier
  const byValue: CatGen = () => {
    const tiers = [
      { label: 'Budget Gems (Under $10)', min: 0, max: 10 },
      { label: 'Mid-Range ($25-$99)', min: 25, max: 99 },
      { label: 'Premium ($100-$499)', min: 100, max: 499 },
      { label: 'High-End ($500+)', min: 500, max: Infinity },
    ];
    const tier = tiers[Math.floor(rng() * tiers.length)];
    const pool = players.filter(([, d]) => d.value >= tier.min && d.value <= tier.max).map(([n]) => n);
    const picked = pickFromPool(pool, 4);
    if (!picked) return null;
    return { name: tier.label, items: picked };
  };

  // 6. Name pattern — players sharing a common last name initial
  const byNameLetter: CatGen = () => {
    const letter = 'ABCDEFGHJKLMNPRSTW'[Math.floor(rng() * 18)];
    const pool = players.filter(([name]) => {
      const parts = name.split(' ');
      const last = parts[parts.length - 1];
      return last.charAt(0).toUpperCase() === letter && !usedPlayers.has(name);
    }).map(([n]) => n);
    if (pool.length < 6) return null;
    const picked = shuffle(pool, rng).slice(0, 4);
    return { name: `Last Name Starts with "${letter}"`, items: picked };
  };

  // 7. Multi-sport mix — all different sports
  const byMixedSports: CatGen = () => {
    const sports = ['baseball', 'basketball', 'football', 'hockey'];
    const picked: string[] = [];
    for (const sport of sports) {
      const pool = players.filter(([name, d]) => d.sport === sport && !usedPlayers.has(name)).map(([n]) => n);
      if (pool.length === 0) return null;
      picked.push(pool[Math.floor(rng() * pool.length)]);
    }
    return { name: 'One From Each Sport', items: picked };
  };

  // Build 4 groups with different generators, ensuring no overlap
  const generators: CatGen[] = [bySport, byDecade, byRookie, bySet, byValue, byNameLetter, byMixedSports];
  const groups: Group[] = [];
  const tried = new Set<number>();

  // Shuffle generator order
  const genOrder = shuffle([...generators.keys()], rng);

  for (const idx of genOrder) {
    if (groups.length >= 4) break;
    if (tried.has(idx)) continue;
    tried.add(idx);
    const result = generators[idx]();
    if (result) {
      result.items.forEach(p => usedPlayers.add(p));
      groups.push({ name: result.name, items: result.items, difficulty: groups.length as 0 | 1 | 2 | 3 });
    }
  }

  // Fallback — if we couldn't get 4 groups, retry with different generators
  if (groups.length < 4) {
    for (const gen of generators) {
      if (groups.length >= 4) break;
      const result = gen();
      if (result && !result.items.some(i => usedPlayers.has(i))) {
        result.items.forEach(p => usedPlayers.add(p));
        groups.push({ name: result.name, items: result.items, difficulty: groups.length as 0 | 1 | 2 | 3 });
      }
    }
  }

  // Last resort — fill remaining groups with sport-based selection
  while (groups.length < 4) {
    const sports = ['baseball', 'basketball', 'football', 'hockey'];
    const sport = sports[groups.length % 4];
    const pool = players.filter(([name, d]) => d.sport === sport && !usedPlayers.has(name)).map(([n]) => n);
    const picked = shuffle(pool, rng).slice(0, 4);
    picked.forEach(p => usedPlayers.add(p));
    groups.push({
      name: `${SPORTS_ICONS[sport] || ''} ${sport.charAt(0).toUpperCase() + sport.slice(1)} Players`,
      items: picked,
      difficulty: groups.length as 0 | 1 | 2 | 3,
    });
  }

  const allItems = shuffle(groups.flatMap(g => g.items), rng);

  return { groups, allItems };
}

/* ── component ───────────────────────────────────────────────────── */

const STORAGE_KEY = 'cardvault-card-groups-stats';
const STATE_KEY = 'cardvault-card-groups-state';
const MAX_MISTAKES = 4;

export default function CardGroupsClient() {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<'daily' | 'random'>('daily');
  const [seed, setSeed] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [solvedGroups, setSolvedGroups] = useState<Group[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [shakeWrong, setShakeWrong] = useState(false);
  const [stats, setStats] = useState<Stats>({ played: 0, won: 0, streak: 0, bestStreak: 0, perfectGames: 0 });
  const [copied, setCopied] = useState(false);
  const [guessHistory, setGuessHistory] = useState<Array<{ items: string[]; correct: boolean }>>([]);

  const puzzle = useMemo(() => generatePuzzle(seed), [seed]);

  const remainingItems = useMemo(() => {
    const solved = new Set(solvedGroups.flatMap(g => g.items));
    return puzzle.allItems.filter(i => !solved.has(i));
  }, [puzzle, solvedGroups]);

  // Load state
  useEffect(() => {
    setMounted(true);
    const dailySeed = dateHash(new Date());
    setSeed(dailySeed);

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setStats(JSON.parse(saved));

      // Restore daily game state
      const state = localStorage.getItem(STATE_KEY);
      if (state) {
        const s = JSON.parse(state);
        if (s.seed === dailySeed) {
          setSolvedGroups(s.solvedGroups || []);
          setMistakes(s.mistakes || 0);
          setGameOver(s.gameOver || false);
          setWon(s.won || false);
          setGuessHistory(s.guessHistory || []);
        }
      }
    } catch {}
  }, []);

  // Save state
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
      if (mode === 'daily') {
        localStorage.setItem(STATE_KEY, JSON.stringify({
          seed, solvedGroups, mistakes, gameOver, won, guessHistory,
        }));
      }
    } catch {}
  }, [mounted, stats, seed, solvedGroups, mistakes, gameOver, won, mode, guessHistory]);

  const toggleSelect = useCallback((item: string) => {
    if (gameOver) return;
    setSelected(prev => {
      if (prev.includes(item)) return prev.filter(i => i !== item);
      if (prev.length >= 4) return prev;
      return [...prev, item];
    });
  }, [gameOver]);

  const submitGuess = useCallback(() => {
    if (selected.length !== 4 || gameOver) return;

    // Check if all 4 selected belong to the same group
    const matchingGroup = puzzle.groups.find(g =>
      !solvedGroups.includes(g) && g.items.every(i => selected.includes(i))
    );

    if (matchingGroup) {
      const newSolved = [...solvedGroups, matchingGroup];
      setSolvedGroups(newSolved);
      setGuessHistory(prev => [...prev, { items: [...selected], correct: true }]);
      setSelected([]);

      if (newSolved.length === 4) {
        setWon(true);
        setGameOver(true);
        setStats(prev => {
          const newStreak = prev.streak + 1;
          return {
            played: prev.played + 1,
            won: prev.won + 1,
            streak: newStreak,
            bestStreak: Math.max(prev.bestStreak, newStreak),
            perfectGames: mistakes === 0 ? prev.perfectGames + 1 : prev.perfectGames,
          };
        });
      }
    } else {
      // Check for "one away"
      const oneAway = puzzle.groups.some(g =>
        !solvedGroups.includes(g) && g.items.filter(i => selected.includes(i)).length === 3
      );

      setShakeWrong(true);
      setTimeout(() => setShakeWrong(false), 600);

      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      setGuessHistory(prev => [...prev, { items: [...selected], correct: false }]);
      setSelected([]);

      if (oneAway) {
        // Brief notification handled in UI
      }

      if (newMistakes >= MAX_MISTAKES) {
        setGameOver(true);
        setStats(prev => ({
          ...prev,
          played: prev.played + 1,
          streak: 0,
        }));
        // Reveal all remaining groups
        const remaining = puzzle.groups.filter(g => !solvedGroups.includes(g));
        setSolvedGroups([...solvedGroups, ...remaining]);
      }
    }
  }, [selected, gameOver, puzzle, solvedGroups, mistakes, stats]);

  const deselectAll = useCallback(() => setSelected([]), []);

  const startRandom = useCallback(() => {
    const newSeed = Date.now() + Math.floor(Math.random() * 99999);
    setSeed(newSeed);
    setMode('random');
    setSelected([]);
    setSolvedGroups([]);
    setMistakes(0);
    setGameOver(false);
    setWon(false);
    setGuessHistory([]);
  }, []);

  const startDaily = useCallback(() => {
    const dailySeed = dateHash(new Date());
    setSeed(dailySeed);
    setMode('daily');
    setSelected([]);
    setSolvedGroups([]);
    setMistakes(0);
    setGameOver(false);
    setWon(false);
    setGuessHistory([]);
    // Clear saved state for fresh daily
    try { localStorage.removeItem(STATE_KEY); } catch {}
  }, []);

  const shareResults = useCallback(() => {
    const emojiMap = ['🟨', '🟩', '🟦', '🟪'];
    const lines = guessHistory.map(g => {
      if (g.correct) {
        const group = puzzle.groups.find(gr => gr.items.every(i => g.items.includes(i)));
        return group ? emojiMap[group.difficulty].repeat(4) : '⬜⬜⬜⬜';
      }
      // Wrong guess — show which groups selected items came from
      return g.items.map(item => {
        const group = puzzle.groups.find(gr => gr.items.includes(item));
        return group ? emojiMap[group.difficulty] : '⬛';
      }).join('');
    });

    const text = `Card Groups ${mode === 'daily' ? '(Daily)' : '(Random)'}\n${won ? `Solved! (${mistakes} mistake${mistakes !== 1 ? 's' : ''})` : 'Failed'}\n\n${lines.join('\n')}\n\nhttps://cardvault-two.vercel.app/card-groups`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [guessHistory, puzzle, mode, won, mistakes]);

  // Check if latest wrong guess was "one away"
  const lastGuessOneAway = useMemo(() => {
    if (guessHistory.length === 0) return false;
    const last = guessHistory[guessHistory.length - 1];
    if (last.correct) return false;
    return puzzle.groups.some(g =>
      !solvedGroups.includes(g) && g.items.filter(i => last.items.includes(i)).length === 3
    );
  }, [guessHistory, puzzle, solvedGroups]);

  if (!mounted) {
    return <div className="text-center py-20 text-gray-400">Loading...</div>;
  }

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Card Groups</h1>
        <p className="text-gray-400">Find 4 groups of 4 players that share something in common</p>
      </div>

      {/* Mode toggle + Stats bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex gap-2">
          <button
            onClick={startDaily}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'daily' ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >
            Daily
          </button>
          <button
            onClick={startRandom}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'random' ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >
            Random
          </button>
        </div>

        <div className="flex gap-4 text-xs text-gray-400">
          <span>Played: <span className="text-white font-medium">{stats.played}</span></span>
          <span>Won: <span className="text-green-400 font-medium">{stats.won}</span></span>
          <span>Streak: <span className="text-amber-400 font-medium">{stats.streak}</span></span>
          <span>Perfect: <span className="text-purple-400 font-medium">{stats.perfectGames}</span></span>
        </div>
      </div>

      {/* Mistakes tracker */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="text-sm text-gray-400">Mistakes remaining:</span>
        <div className="flex gap-1">
          {Array.from({ length: MAX_MISTAKES }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors ${i < MAX_MISTAKES - mistakes ? 'bg-gray-400' : 'bg-red-500'}`}
            />
          ))}
        </div>
      </div>

      {/* One-away notification */}
      {lastGuessOneAway && !gameOver && (
        <div className="text-center mb-3">
          <span className="text-amber-400 text-sm font-medium animate-pulse">One away!</span>
        </div>
      )}

      {/* Solved groups */}
      <div className="space-y-2 mb-4">
        {solvedGroups.map((group, i) => (
          <div
            key={i}
            className={`${GROUP_COLORS[group.difficulty].bg} rounded-lg p-4 text-center transition-all duration-500`}
          >
            <div className={`text-sm font-bold ${GROUP_COLORS[group.difficulty].text} uppercase tracking-wide`}>
              {group.name}
            </div>
            <div className={`text-sm ${GROUP_COLORS[group.difficulty].text} mt-1`}>
              {group.items.join(', ')}
            </div>
          </div>
        ))}
      </div>

      {/* Card grid */}
      {remainingItems.length > 0 && (
        <div className={`grid grid-cols-4 gap-2 mb-6 ${shakeWrong ? 'animate-shake' : ''}`}>
          {remainingItems.map(item => {
            const isSelected = selected.includes(item);
            return (
              <button
                key={item}
                onClick={() => toggleSelect(item)}
                disabled={gameOver}
                className={`p-3 rounded-lg text-center text-xs sm:text-sm font-medium transition-all duration-200
                  ${isSelected
                    ? 'bg-gray-600 text-white scale-95 ring-2 ring-amber-500'
                    : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}
                  ${gameOver ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer active:scale-90'}
                `}
              >
                <span className="line-clamp-2 leading-tight">{item}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Action buttons */}
      {!gameOver && (
        <div className="flex justify-center gap-3 mb-6">
          <button
            onClick={deselectAll}
            disabled={selected.length === 0}
            className="px-5 py-2 rounded-lg text-sm font-medium bg-gray-800 text-gray-300 hover:text-white disabled:opacity-40 transition-colors"
          >
            Deselect All
          </button>
          <button
            onClick={submitGuess}
            disabled={selected.length !== 4}
            className="px-6 py-2 rounded-lg text-sm font-medium bg-amber-600 text-white hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Submit ({selected.length}/4)
          </button>
        </div>
      )}

      {/* Game over */}
      {gameOver && (
        <div className="text-center py-6 border-t border-gray-800 mt-6">
          {won ? (
            <div>
              <div className="text-3xl mb-2">{mistakes === 0 ? '🏆' : '🎉'}</div>
              <h2 className="text-xl font-bold text-white mb-1">
                {mistakes === 0 ? 'Perfect!' : 'Solved!'}
              </h2>
              <p className="text-gray-400 text-sm">
                {mistakes === 0
                  ? 'You found all 4 groups without a single mistake!'
                  : `You found all 4 groups with ${mistakes} mistake${mistakes !== 1 ? 's' : ''}.`}
              </p>
            </div>
          ) : (
            <div>
              <div className="text-3xl mb-2">😞</div>
              <h2 className="text-xl font-bold text-white mb-1">Better Luck Next Time</h2>
              <p className="text-gray-400 text-sm">The remaining groups have been revealed above.</p>
            </div>
          )}

          <div className="flex justify-center gap-3 mt-4">
            <button
              onClick={shareResults}
              className="px-5 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-500 transition-colors"
            >
              {copied ? 'Copied!' : 'Share Results'}
            </button>
            <button
              onClick={startRandom}
              className="px-5 py-2 rounded-lg text-sm font-medium bg-gray-700 text-white hover:bg-gray-600 transition-colors"
            >
              Play Random
            </button>
          </div>
        </div>
      )}

      {/* How to play */}
      <section className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-lg font-bold text-white mb-3">How to Play</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-400">
          <div className="bg-gray-900/60 p-3 rounded-lg">
            <span className="text-amber-400 font-medium">1.</span> Find 4 groups of 4 players that share a theme
          </div>
          <div className="bg-gray-900/60 p-3 rounded-lg">
            <span className="text-amber-400 font-medium">2.</span> Tap 4 players, then hit Submit to guess
          </div>
          <div className="bg-gray-900/60 p-3 rounded-lg">
            <span className="text-amber-400 font-medium">3.</span> Correct groups are revealed with their category
          </div>
          <div className="bg-gray-900/60 p-3 rounded-lg">
            <span className="text-amber-400 font-medium">4.</span> You have {MAX_MISTAKES} mistakes — use them wisely
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {GROUP_COLORS.map((c, i) => (
            <span key={i} className={`px-3 py-1 rounded text-xs font-medium ${c.bg} ${c.text}`}>
              {c.label}
            </span>
          ))}
        </div>
      </section>

      {/* Related links */}
      <section className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-lg font-bold text-white mb-3">More Card Games</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { href: '/card-connections', label: 'Card Connections', desc: 'Link two players through shared attributes' },
            { href: '/card-detective', label: 'Card Detective', desc: 'Daily mystery card guessing game' },
            { href: '/card-hangman', label: 'Card Hangman', desc: 'Guess the mystery player name' },
            { href: '/card-crossword', label: 'Card Crossword', desc: 'Daily mini crossword with hobby clues' },
            { href: '/card-tycoon', label: 'Card Tycoon', desc: 'Buy low, sell high market simulator' },
            { href: '/trivia', label: 'Card Trivia', desc: '40 questions across 6 categories' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="block p-3 rounded-lg bg-gray-900/60 border border-gray-800 hover:border-gray-600 transition-colors">
              <div className="text-sm font-medium text-white">{l.label}</div>
              <div className="text-xs text-gray-400">{l.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* shake animation */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}

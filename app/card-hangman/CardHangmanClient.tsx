'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

function dateHash(d: Date): number {
  const str = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const SPORTS_ICONS: Record<string, string> = { baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒' };
const SPORTS_COLORS: Record<string, string> = {
  baseball: 'text-rose-400',
  basketball: 'text-orange-400',
  football: 'text-blue-400',
  hockey: 'text-cyan-400',
};

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const MAX_WRONG = 6;

interface Stats {
  played: number;
  won: number;
  streak: number;
  bestStreak: number;
  totalGuesses: number;
}

function getPlayers() {
  const playerMap = new Map<string, { sport: string; cards: number }>();
  for (const c of sportsCards) {
    if ((c.sport as string) === 'pokemon') continue;
    const existing = playerMap.get(c.player);
    if (existing) {
      existing.cards++;
    } else {
      playerMap.set(c.player, { sport: c.sport, cards: 1 });
    }
  }
  return Array.from(playerMap.entries())
    .filter(([name, data]) => name.length >= 5 && data.cards >= 2)
    .map(([name, data]) => ({ name, sport: data.sport, cards: data.cards }));
}

function getPositionHint(name: string, sport: string): string {
  const card = sportsCards.find(c => c.player === name && c.description);
  if (!card?.description) return '';
  const desc = card.description.toLowerCase();
  if (sport === 'baseball') {
    if (desc.includes(' sp') || desc.includes('pitcher') || desc.includes('starting pitcher')) return 'Pitcher';
    if (desc.includes('catcher') || desc.includes(' c,') || desc.includes(' c ')) return 'Catcher';
    if (desc.includes('outfield') || desc.includes(' of') || desc.includes(' cf') || desc.includes(' rf') || desc.includes(' lf')) return 'Outfielder';
    if (desc.includes('first base') || desc.includes(' 1b')) return 'First Baseman';
    if (desc.includes('shortstop') || desc.includes(' ss')) return 'Shortstop';
    if (desc.includes('second base') || desc.includes(' 2b')) return 'Second Baseman';
    if (desc.includes('third base') || desc.includes(' 3b')) return 'Third Baseman';
    if (desc.includes('closer') || desc.includes('reliever') || desc.includes(' rp')) return 'Reliever';
    if (desc.includes('designated hitter') || desc.includes(' dh')) return 'Designated Hitter';
  }
  if (sport === 'basketball') {
    if (desc.includes('point guard') || desc.includes(' pg')) return 'Point Guard';
    if (desc.includes('shooting guard') || desc.includes(' sg')) return 'Shooting Guard';
    if (desc.includes('small forward') || desc.includes(' sf')) return 'Small Forward';
    if (desc.includes('power forward') || desc.includes(' pf')) return 'Power Forward';
    if (desc.includes('center') || desc.includes(' c,') || desc.includes(' c ')) return 'Center';
    if (desc.includes('guard')) return 'Guard';
    if (desc.includes('forward')) return 'Forward';
  }
  if (sport === 'football') {
    if (desc.includes('quarterback') || desc.includes(' qb')) return 'Quarterback';
    if (desc.includes('running back') || desc.includes(' rb')) return 'Running Back';
    if (desc.includes('wide receiver') || desc.includes(' wr')) return 'Wide Receiver';
    if (desc.includes('tight end') || desc.includes(' te')) return 'Tight End';
    if (desc.includes('linebacker') || desc.includes(' lb')) return 'Linebacker';
    if (desc.includes('cornerback') || desc.includes(' cb')) return 'Cornerback';
    if (desc.includes('safety') || desc.includes(' s,') || desc.includes(' s ') || desc.includes('free safety') || desc.includes('strong safety')) return 'Safety';
    if (desc.includes('defensive end') || desc.includes(' de')) return 'Defensive End';
    if (desc.includes('defensive tackle') || desc.includes(' dt')) return 'Defensive Tackle';
    if (desc.includes('offensive tackle') || desc.includes(' ot') || desc.includes('offensive line') || desc.includes(' ol') || desc.includes('tackle')) return 'Offensive Lineman';
    if (desc.includes('kicker') || desc.includes('punter')) return 'Kicker';
  }
  if (sport === 'hockey') {
    if (desc.includes('goaltender') || desc.includes('goalie') || desc.includes(' g,') || desc.includes('netminder')) return 'Goaltender';
    if (desc.includes('defenseman') || desc.includes('blueliner') || desc.includes(' d,') || desc.includes('blue line')) return 'Defenseman';
    if (desc.includes('center') || desc.includes(' c,') || desc.includes(' c ')) return 'Center';
    if (desc.includes('left wing') || desc.includes(' lw')) return 'Left Wing';
    if (desc.includes('right wing') || desc.includes(' rw')) return 'Right Wing';
    if (desc.includes('forward') || desc.includes('winger')) return 'Forward';
  }
  return '';
}

function getEraHint(name: string): string {
  const cards = sportsCards.filter(c => c.player === name);
  if (cards.length === 0) return '';
  const years = cards.map(c => c.year).sort((a, b) => a - b);
  const avg = Math.round(years.reduce((a, b) => a + b, 0) / years.length);
  if (avg < 1960) return 'Pre-1960 era';
  if (avg < 1980) return '1960s-1970s era';
  if (avg < 2000) return '1980s-1990s era';
  if (avg < 2015) return '2000s-2010s era';
  return 'Modern era (2015+)';
}

export default function CardHangmanClient() {
  const players = useMemo(() => getPlayers(), []);
  const [gameMode, setGameMode] = useState<'daily' | 'random'>('daily');
  const [seed, setSeed] = useState(() => dateHash(new Date()));
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [hintsUsed, setHintsUsed] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [stats, setStats] = useState<Stats>({ played: 0, won: 0, streak: 0, bestStreak: 0, totalGuesses: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('cv-hangman-stats');
      if (saved) setStats(JSON.parse(saved));
    } catch { /* empty */ }
  }, []);

  const target = useMemo(() => {
    const rng = seededRng(seed + 42);
    const idx = Math.floor(rng() * players.length);
    return players[idx];
  }, [seed, players]);

  const targetName = target.name.toUpperCase();
  const lettersInName = new Set(targetName.replace(/[^A-Z]/g, '').split(''));

  const wrongGuesses = useMemo(() => {
    return Array.from(guessed).filter(l => !lettersInName.has(l)).length;
  }, [guessed, lettersInName]);

  const isWon = useMemo(() => {
    return Array.from(lettersInName).every(l => guessed.has(l));
  }, [lettersInName, guessed]);

  const isLost = wrongGuesses >= MAX_WRONG;

  const saveStats = useCallback((newStats: Stats) => {
    setStats(newStats);
    try { localStorage.setItem('cv-hangman-stats', JSON.stringify(newStats)); } catch { /* empty */ }
  }, []);

  useEffect(() => {
    if (!gameOver && (isWon || isLost)) {
      setGameOver(true);
      const newStats = { ...stats, played: stats.played + 1, totalGuesses: stats.totalGuesses + guessed.size };
      if (isWon) {
        newStats.won++;
        newStats.streak++;
        if (newStats.streak > newStats.bestStreak) newStats.bestStreak = newStats.streak;
      } else {
        newStats.streak = 0;
      }
      saveStats(newStats);
    }
  }, [isWon, isLost, gameOver, stats, guessed.size, saveStats]);

  const handleGuess = (letter: string) => {
    if (gameOver || guessed.has(letter)) return;
    setGuessed(prev => new Set([...prev, letter]));
  };

  const handleNewGame = (mode: 'daily' | 'random') => {
    setGameMode(mode);
    setSeed(mode === 'daily' ? dateHash(new Date()) : Math.floor(Math.random() * 999999));
    setGuessed(new Set());
    setHintsUsed(0);
    setGameOver(false);
  };

  const hints = useMemo(() => [
    { label: 'Sport', value: `${SPORTS_ICONS[target.sport] || ''} ${target.sport.charAt(0).toUpperCase() + target.sport.slice(1)}` },
    { label: 'Position', value: getPositionHint(target.name, target.sport) || 'Unknown' },
    { label: 'Era', value: getEraHint(target.name) },
    { label: 'Cards in DB', value: `${target.cards} cards` },
  ], [target]);

  const hangmanParts = [
    // head
    <circle key="head" cx="150" cy="55" r="15" stroke="currentColor" strokeWidth="2" fill="none" />,
    // body
    <line key="body" x1="150" y1="70" x2="150" y2="120" stroke="currentColor" strokeWidth="2" />,
    // left arm
    <line key="larm" x1="150" y1="85" x2="125" y2="105" stroke="currentColor" strokeWidth="2" />,
    // right arm
    <line key="rarm" x1="150" y1="85" x2="175" y2="105" stroke="currentColor" strokeWidth="2" />,
    // left leg
    <line key="lleg" x1="150" y1="120" x2="130" y2="150" stroke="currentColor" strokeWidth="2" />,
    // right leg
    <line key="rleg" x1="150" y1="120" x2="170" y2="150" stroke="currentColor" strokeWidth="2" />,
  ];

  if (!mounted) return <div className="text-gray-500 text-center py-20">Loading...</div>;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-purple-950/60 border border-purple-800/50 text-purple-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
          {players.length.toLocaleString()}+ Players &middot; Daily + Random &middot; 4 Hints &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Hangman</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Guess the mystery player name, letter by letter. Use hints about sport, position, and era.
          6 wrong guesses and you lose!
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Played', value: stats.played },
          { label: 'Win Rate', value: stats.played > 0 ? `${Math.round(stats.won / stats.played * 100)}%` : '—' },
          { label: 'Streak', value: stats.streak },
          { label: 'Best Streak', value: stats.bestStreak },
        ].map(s => (
          <div key={s.label} className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => handleNewGame('daily')} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${gameMode === 'daily' ? 'bg-purple-600 text-white' : 'bg-gray-800/60 text-gray-400 hover:text-white'}`}>
          Daily Challenge
        </button>
        <button onClick={() => handleNewGame('random')} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${gameMode === 'random' ? 'bg-purple-600 text-white' : 'bg-gray-800/60 text-gray-400 hover:text-white'}`}>
          Random
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Hangman + Word */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
          {/* Hangman SVG */}
          <div className="flex justify-center mb-6">
            <svg viewBox="0 0 220 170" className="w-48 h-36 text-gray-400">
              {/* gallows */}
              <line x1="30" y1="160" x2="100" y2="160" stroke="currentColor" strokeWidth="3" />
              <line x1="65" y1="160" x2="65" y2="20" stroke="currentColor" strokeWidth="3" />
              <line x1="65" y1="20" x2="150" y2="20" stroke="currentColor" strokeWidth="3" />
              <line x1="150" y1="20" x2="150" y2="40" stroke="currentColor" strokeWidth="2" />
              {/* body parts */}
              {hangmanParts.slice(0, wrongGuesses).map(part => (
                <g key={part.key} className={isLost ? 'text-red-500' : 'text-amber-400'}>{part}</g>
              ))}
            </svg>
          </div>

          {/* Wrong guess counter */}
          <div className="text-center mb-4">
            <span className={`text-sm font-medium ${wrongGuesses >= 4 ? 'text-red-400' : wrongGuesses >= 2 ? 'text-amber-400' : 'text-gray-400'}`}>
              {wrongGuesses}/{MAX_WRONG} wrong guesses
            </span>
          </div>

          {/* Word Display */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {targetName.split('').map((ch, i) => {
              if (ch === ' ') return <div key={i} className="w-4" />;
              if (ch === '.' || ch === '\'' || ch === '-') return (
                <div key={i} className="w-6 h-10 flex items-center justify-center text-xl font-bold text-gray-400">{ch}</div>
              );
              const revealed = guessed.has(ch) || gameOver;
              return (
                <div key={i} className={`w-8 h-10 border-b-2 flex items-center justify-center text-xl font-bold ${
                  revealed
                    ? (isLost && !guessed.has(ch) ? 'text-red-400 border-red-600' : isWon ? 'text-emerald-400 border-emerald-600' : 'text-white border-purple-500')
                    : 'border-gray-600'
                }`}>
                  {revealed ? ch : ''}
                </div>
              );
            })}
          </div>

          {/* Result Message */}
          {gameOver && (
            <div className={`text-center p-4 rounded-xl mb-4 ${isWon ? 'bg-emerald-950/40 border border-emerald-800/40' : 'bg-red-950/40 border border-red-800/40'}`}>
              <div className={`text-lg font-bold ${isWon ? 'text-emerald-400' : 'text-red-400'}`}>
                {isWon ? 'You got it!' : 'Game Over!'}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                The player was <Link href={`/players/${target.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className={`font-medium ${SPORTS_COLORS[target.sport] || 'text-white'} hover:underline`}>{target.name}</Link>
              </div>
              <div className="text-xs text-gray-500 mt-1">{guessed.size} letters guessed {hintsUsed > 0 ? `| ${hintsUsed} hints used` : ''}</div>
              <button onClick={() => handleNewGame('random')} className="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg transition-colors">
                Play Again (Random)
              </button>
            </div>
          )}

          {/* Keyboard */}
          <div className="space-y-2">
            {[ALPHABET.slice(0, 9), ALPHABET.slice(9, 18), ALPHABET.slice(18)].map((row, ri) => (
              <div key={ri} className="flex justify-center gap-1">
                {row.map(letter => {
                  const isGuessed = guessed.has(letter);
                  const isCorrect = isGuessed && lettersInName.has(letter);
                  const isWrong = isGuessed && !lettersInName.has(letter);
                  return (
                    <button
                      key={letter}
                      onClick={() => handleGuess(letter)}
                      disabled={isGuessed || gameOver}
                      className={`w-8 h-10 sm:w-9 sm:h-11 rounded-lg text-sm font-bold transition-all ${
                        isCorrect ? 'bg-emerald-700 text-white' :
                        isWrong ? 'bg-red-900/50 text-red-400/50' :
                        isGuessed ? 'bg-gray-800 text-gray-600' :
                        'bg-gray-700/60 text-white hover:bg-purple-700 active:scale-95'
                      }`}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Hints */}
        <div className="space-y-4">
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
            <h2 className="text-lg font-bold text-white mb-4">Hints</h2>
            <div className="space-y-3">
              {hints.map((hint, i) => {
                const isRevealed = i < hintsUsed;
                return (
                  <div key={hint.label} className={`p-3 rounded-xl border transition-all ${
                    isRevealed ? 'bg-purple-950/30 border-purple-800/40' : 'bg-gray-800/30 border-gray-700/30'
                  }`}>
                    <div className="text-xs text-gray-500 mb-1">Hint {i + 1}: {hint.label}</div>
                    {isRevealed ? (
                      <div className="text-sm font-medium text-white">{hint.value}</div>
                    ) : (
                      <button
                        onClick={() => setHintsUsed(Math.max(hintsUsed, i + 1))}
                        disabled={i > hintsUsed || gameOver}
                        className={`text-sm ${
                          i === hintsUsed
                            ? 'text-purple-400 hover:text-purple-300 cursor-pointer'
                            : 'text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        {i === hintsUsed ? 'Reveal hint' : 'Reveal previous hints first'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* How to Play */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
            <h2 className="text-lg font-bold text-white mb-3">How to Play</h2>
            <ol className="space-y-2 text-sm text-gray-400">
              <li className="flex gap-2"><span className="text-purple-400 font-bold">1.</span> Guess letters to reveal the mystery player name</li>
              <li className="flex gap-2"><span className="text-purple-400 font-bold">2.</span> Each wrong guess adds a body part (6 max)</li>
              <li className="flex gap-2"><span className="text-purple-400 font-bold">3.</span> Use up to 4 hints: Sport, Position, Era, Cards in DB</li>
              <li className="flex gap-2"><span className="text-purple-400 font-bold">4.</span> Daily Challenge uses the same player for everyone</li>
              <li className="flex gap-2"><span className="text-purple-400 font-bold">5.</span> Win without hints for maximum bragging rights!</li>
            </ol>
          </div>

          {/* Wrong Letters */}
          {wrongGuesses > 0 && (
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-red-400 mb-2">Wrong Guesses</h2>
              <div className="flex flex-wrap gap-2">
                {Array.from(guessed).filter(l => !lettersInName.has(l)).map(l => (
                  <span key={l} className="w-8 h-8 rounded-lg bg-red-900/30 border border-red-800/40 flex items-center justify-center text-sm font-bold text-red-400">{l}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { sportsCards } from '@/data/sports-cards';

function seededRng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}
function dateHash(): number {
  const d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

const HOBBY_WORDS = [
  'REFRACTOR', 'PRIZM', 'CHROME', 'TOPPS', 'PANINI', 'BOWMAN', 'FLEER', 'ROOKIE', 'GRADING',
  'PARALLEL', 'INSERT', 'AUTOGRAPH', 'MEMORABILIA', 'PROSPECT', 'VINTAGE', 'SLAB', 'CENTERING',
  'SURFACE', 'CORNERS', 'EDGES', 'MINT', 'HOBBY', 'BLASTER', 'RETAIL', 'CHECKLIST',
  'REDEMPTION', 'VARIATION', 'SERIAL', 'NUMBERED', 'ACETATE',
];

type GameState = 'idle' | 'playing' | 'done';

interface Round {
  word: string;
  typed: string;
  correct: boolean;
  timeMs: number;
  wpm: number;
}

export default function CardTypingClient() {
  const [mode, setMode] = useState<'daily' | 'random'>('daily');
  const [state, setState] = useState<GameState>('idle');
  const [words, setWords] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [input, setInput] = useState('');
  const [rounds, setRounds] = useState<Round[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [wordStart, setWordStart] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const playerNames = useMemo(() => {
    const names = new Set<string>();
    for (const c of sportsCards) {
      const parts = c.player.split(' ');
      if (parts.length >= 2) names.add(c.player.toUpperCase());
    }
    return [...names];
  }, []);

  const generateWords = useCallback((seed: number) => {
    const rng = seededRng(seed);
    const pool: string[] = [];
    // 5 hobby words
    const shuffledHobby = [...HOBBY_WORDS].sort(() => rng() - 0.5);
    pool.push(...shuffledHobby.slice(0, 5));
    // 5 player last names
    const shuffledPlayers = [...playerNames].sort(() => rng() - 0.5);
    for (let i = 0; i < 5 && i < shuffledPlayers.length; i++) {
      const lastName = shuffledPlayers[i].split(' ').pop() || shuffledPlayers[i];
      pool.push(lastName);
    }
    return pool.sort(() => rng() - 0.5);
  }, [playerNames]);

  const startGame = useCallback(() => {
    const seed = mode === 'daily' ? dateHash() : Math.floor(Math.random() * 999999);
    const w = generateWords(seed);
    setWords(w);
    setCurrentIdx(0);
    setInput('');
    setRounds([]);
    setState('playing');
    const now = Date.now();
    setStartTime(now);
    setWordStart(now);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [mode, generateWords]);

  const handleInput = useCallback((val: string) => {
    setInput(val.toUpperCase());
  }, []);

  const submitWord = useCallback(() => {
    if (state !== 'playing' || currentIdx >= words.length) return;
    const now = Date.now();
    const timeMs = now - wordStart;
    const word = words[currentIdx];
    const correct = input.trim() === word;
    const charCount = word.length;
    const wpm = timeMs > 0 ? Math.round((charCount / 5) / (timeMs / 60000)) : 0;

    const round: Round = { word, typed: input.trim(), correct, timeMs, wpm };
    const newRounds = [...rounds, round];
    setRounds(newRounds);

    if (currentIdx + 1 >= words.length) {
      setState('done');
      setTotalTime(now - startTime);
    } else {
      setCurrentIdx(currentIdx + 1);
      setInput('');
      setWordStart(now);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [state, currentIdx, words, input, wordStart, rounds, startTime]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); submitWord(); }
  }, [submitWord]);

  // Stats
  const correctCount = rounds.filter(r => r.correct).length;
  const avgWpm = rounds.length > 0 ? Math.round(rounds.reduce((s, r) => s + r.wpm, 0) / rounds.length) : 0;
  const accuracy = rounds.length > 0 ? Math.round((correctCount / rounds.length) * 100) : 0;
  const score = correctCount * 100 + avgWpm * 2 + (accuracy >= 100 ? 200 : accuracy >= 80 ? 100 : 0);
  const grade = score >= 1200 ? 'S' : score >= 900 ? 'A' : score >= 700 ? 'B' : score >= 500 ? 'C' : score >= 300 ? 'D' : 'F';
  const gradeColor = grade === 'S' ? 'text-yellow-400' : grade === 'A' ? 'text-emerald-400' : grade === 'B' ? 'text-blue-400' : grade === 'C' ? 'text-purple-400' : grade === 'D' ? 'text-orange-400' : 'text-red-400';

  // Persist stats
  useEffect(() => {
    if (state !== 'done') return;
    try {
      const key = 'cardvault-typing-stats';
      const prev = JSON.parse(localStorage.getItem(key) || '{}');
      const stats = {
        gamesPlayed: (prev.gamesPlayed || 0) + 1,
        bestScore: Math.max(prev.bestScore || 0, score),
        bestWpm: Math.max(prev.bestWpm || 0, avgWpm),
        totalCorrect: (prev.totalCorrect || 0) + correctCount,
      };
      localStorage.setItem(key, JSON.stringify(stats));
    } catch {}
  }, [state, score, avgWpm, correctCount]);

  const [savedStats, setSavedStats] = useState<{ gamesPlayed: number; bestScore: number; bestWpm: number; totalCorrect: number } | null>(null);
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem('cardvault-typing-stats') || 'null');
      if (s) setSavedStats(s);
    } catch {}
  }, [state]);

  const shareText = useMemo(() => {
    if (state !== 'done') return '';
    const emojis = rounds.map(r => r.correct ? '🟩' : '🟥').join('');
    return `Card Typing Challenge ${emojis}\nScore: ${score} (${grade}) | ${correctCount}/${rounds.length} correct | ${avgWpm} WPM\nhttps://cardvault-two.vercel.app/card-typing`;
  }, [state, rounds, score, grade, correctCount, avgWpm]);

  return (
    <div>
      {/* Mode Toggle */}
      {state === 'idle' && (
        <div className="text-center space-y-6">
          <div className="flex justify-center gap-2 mb-4">
            <button onClick={() => setMode('daily')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'daily' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>Daily Challenge</button>
            <button onClick={() => setMode('random')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'random' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>Random</button>
          </div>
          <p className="text-gray-400 text-sm max-w-md mx-auto">Type 10 card hobby terms and player names as fast as you can. Score based on speed and accuracy.</p>
          <button onClick={startGame} className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl text-lg hover:scale-105 transition-transform">Start Typing</button>
          {savedStats && (
            <div className="flex justify-center gap-6 text-sm text-gray-500 mt-4">
              <span>Games: {savedStats.gamesPlayed}</span>
              <span>Best: {savedStats.bestScore}</span>
              <span>Best WPM: {savedStats.bestWpm}</span>
            </div>
          )}
        </div>
      )}

      {/* Playing */}
      {state === 'playing' && currentIdx < words.length && (
        <div className="text-center space-y-6">
          {/* Progress */}
          <div className="flex justify-center gap-1.5 mb-4">
            {words.map((_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i < currentIdx ? (rounds[i]?.correct ? 'bg-emerald-500' : 'bg-red-500') : i === currentIdx ? 'bg-blue-500 animate-pulse' : 'bg-gray-700'}`} />
            ))}
          </div>

          <div className="text-xs text-gray-500 uppercase tracking-wider">Word {currentIdx + 1} of {words.length}</div>

          {/* Current Word */}
          <div className="text-4xl sm:text-5xl font-mono font-bold tracking-widest text-white py-4">
            {words[currentIdx].split('').map((char, ci) => {
              const inputChar = input[ci]?.toUpperCase();
              const color = !inputChar ? 'text-gray-500' : inputChar === char ? 'text-emerald-400' : 'text-red-400';
              return <span key={ci} className={color}>{char}</span>;
            })}
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => handleInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-gray-900 border-2 border-gray-700 focus:border-blue-500 rounded-xl px-6 py-3 text-xl text-center text-white font-mono tracking-wider w-full max-w-md outline-none transition-colors"
            placeholder="Type here..."
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />

          <div className="text-xs text-gray-600">Press Enter to submit</div>
        </div>
      )}

      {/* Results */}
      {state === 'done' && (
        <div className="space-y-6">
          <div className="text-center">
            <div className={`text-6xl font-bold ${gradeColor} mb-2`}>{grade}</div>
            <div className="text-2xl font-bold text-white">{score} points</div>
            <div className="text-sm text-gray-400 mt-1">{(totalTime / 1000).toFixed(1)}s total | {correctCount}/{rounds.length} correct | {avgWpm} avg WPM | {accuracy}% accuracy</div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-emerald-400">{correctCount}</div>
              <div className="text-xs text-gray-500">Correct</div>
            </div>
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-blue-400">{avgWpm}</div>
              <div className="text-xs text-gray-500">Avg WPM</div>
            </div>
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-purple-400">{accuracy}%</div>
              <div className="text-xs text-gray-500">Accuracy</div>
            </div>
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-amber-400">{(totalTime / 1000).toFixed(1)}s</div>
              <div className="text-xs text-gray-500">Total Time</div>
            </div>
          </div>

          {/* Round Breakdown */}
          <div className="space-y-1">
            {rounds.map((r, i) => (
              <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg ${r.correct ? 'bg-emerald-900/20 border border-emerald-800/30' : 'bg-red-900/20 border border-red-800/30'}`}>
                <span className={`text-sm font-mono ${r.correct ? 'text-emerald-400' : 'text-red-400'}`}>{r.correct ? 'Y' : 'X'}</span>
                <span className="text-sm font-mono text-white flex-1">{r.word}</span>
                {!r.correct && <span className="text-xs text-red-400 font-mono">{r.typed || '(empty)'}</span>}
                <span className="text-xs text-gray-500">{(r.timeMs / 1000).toFixed(1)}s</span>
                <span className="text-xs text-gray-400">{r.wpm} WPM</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={startGame} className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-500 transition-colors">Play Again</button>
            <button
              onClick={() => { navigator.clipboard.writeText(shareText); }}
              className="px-6 py-2.5 bg-gray-800 text-white font-medium rounded-xl hover:bg-gray-700 transition-colors"
            >
              Share Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { sportsCards } from '@/data/sports-cards';

type Sport = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey';
type Phase = 'setup' | 'active' | 'bingo';

interface BingoCell {
  text: string;
  marked: boolean;
  autoMarked: boolean;
}

interface BingoStats {
  gamesPlayed: number;
  bingos: number;
  fastestBingo: number;
  totalMarks: number;
}

function seededRandom(seed: number): () => number {
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

function parseValue(val: string): number {
  const m = val.match(/\$([0-9,.]+)/);
  return m ? parseFloat(m[1].replace(',', '')) : 5;
}

const BINGO_EVENTS = [
  { id: 'base-card', text: 'Base Card Pulled', trigger: (v: number) => v < 5 },
  { id: 'rookie-card', text: 'Rookie Card!', trigger: (_v: number, r: boolean) => r },
  { id: 'value-10', text: '$10+ Card', trigger: (v: number) => v >= 10 },
  { id: 'value-25', text: '$25+ Card', trigger: (v: number) => v >= 25 },
  { id: 'value-50', text: '$50+ Card', trigger: (v: number) => v >= 50 },
  { id: 'value-100', text: '$100+ Hit!', trigger: (v: number) => v >= 100 },
  { id: 'baseball-pull', text: 'Baseball Card', trigger: (_v: number, _r: boolean, s: string) => s === 'baseball' },
  { id: 'basketball-pull', text: 'Basketball Card', trigger: (_v: number, _r: boolean, s: string) => s === 'basketball' },
  { id: 'football-pull', text: 'Football Card', trigger: (_v: number, _r: boolean, s: string) => s === 'football' },
  { id: 'hockey-pull', text: 'Hockey Card', trigger: (_v: number, _r: boolean, s: string) => s === 'hockey' },
  { id: 'under-1', text: 'Dollar Bin Card', trigger: (v: number) => v < 1 },
  { id: 'chrome-prizm', text: 'Chrome/Prizm Pull', trigger: (_v: number, _r: boolean, _s: string, set: string) => /chrome|prizm/i.test(set) },
  { id: 'topps-pull', text: 'Topps Card', trigger: (_v: number, _r: boolean, _s: string, set: string) => /topps/i.test(set) },
  { id: 'panini-pull', text: 'Panini Card', trigger: (_v: number, _r: boolean, _s: string, set: string) => /panini|donruss|prizm|optic/i.test(set) },
  { id: 'upper-deck', text: 'Upper Deck Card', trigger: (_v: number, _r: boolean, _s: string, set: string) => /upper deck/i.test(set) },
  { id: 'vintage', text: 'Pre-2000 Card', trigger: (_v: number, _r: boolean, _s: string, _set: string, year: number) => year < 2000 },
  { id: 'modern', text: '2024+ Card', trigger: (_v: number, _r: boolean, _s: string, _set: string, year: number) => year >= 2024 },
  { id: 'bowman', text: 'Bowman Pull', trigger: (_v: number, _r: boolean, _s: string, set: string) => /bowman/i.test(set) },
  { id: 'double-digit', text: '$10-$49 Range', trigger: (v: number) => v >= 10 && v < 50 },
  { id: 'budget-card', text: '$1-$5 Card', trigger: (v: number) => v >= 1 && v <= 5 },
  { id: 'mid-value', text: '$5-$10 Card', trigger: (v: number) => v >= 5 && v < 10 },
  { id: 'three-digit', text: 'Triple-Digit Hit!', trigger: (v: number) => v >= 100 },
  { id: 'back-to-back-rookie', text: 'Back-to-Back Rookies', trigger: (_v: number, r: boolean) => r },
  { id: 'five-pulls', text: '5 Cards Pulled', trigger: () => true },
  { id: 'ten-pulls', text: '10 Cards Pulled', trigger: () => true },
  { id: 'hot-streak', text: '3 $5+ in a Row', trigger: (v: number) => v >= 5 },
  { id: 'cold-streak', text: '3 Under $2 in a Row', trigger: (v: number) => v < 2 },
  { id: 'sport-switch', text: 'Different Sport Than Last', trigger: () => true },
];

function getGrade(pullCount: number, bingoTime: number): { letter: string; color: string } {
  if (bingoTime <= 30 && pullCount <= 15) return { letter: 'S', color: 'text-yellow-400' };
  if (bingoTime <= 60 && pullCount <= 25) return { letter: 'A', color: 'text-emerald-400' };
  if (bingoTime <= 90 && pullCount <= 35) return { letter: 'B', color: 'text-blue-400' };
  if (bingoTime <= 120) return { letter: 'C', color: 'text-purple-400' };
  if (bingoTime <= 180) return { letter: 'D', color: 'text-orange-400' };
  return { letter: 'F', color: 'text-red-400' };
}

export default function BreakBingoClient() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [sportFilter, setSportFilter] = useState<Sport>('all');
  const [mode, setMode] = useState<'daily' | 'random'>('daily');
  const [board, setBoard] = useState<BingoCell[][]>([]);
  const [pullLog, setPullLog] = useState<{ name: string; player: string; value: number; sport: string }[]>([]);
  const [pullCount, setPullCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [stats, setStats] = useState<BingoStats>({ gamesPlayed: 0, bingos: 0, fastestBingo: 999, totalMarks: 0 });
  const [bingoLines, setBingoLines] = useState<number[][]>([]);
  const [randomSeed, setRandomSeed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pullRng = useRef<(() => number) | null>(null);

  const seed = mode === 'daily' ? dateHash() : (randomSeed || dateHash() + 999);

  // Load stats
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cardvault-bingo-stats');
      if (saved) setStats(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('cardvault-bingo-stats', JSON.stringify(stats));
    } catch {}
  }, [stats]);

  // Generate bingo board
  const generateBoard = useCallback(() => {
    const rng = seededRandom(seed);
    const shuffled = [...BINGO_EVENTS].sort(() => rng() - 0.5);
    const selected = shuffled.slice(0, 24);

    const cells: BingoCell[][] = [];
    let idx = 0;
    for (let r = 0; r < 5; r++) {
      const row: BingoCell[] = [];
      for (let c = 0; c < 5; c++) {
        if (r === 2 && c === 2) {
          row.push({ text: 'FREE', marked: true, autoMarked: true });
        } else {
          row.push({ text: selected[idx].text, marked: false, autoMarked: false });
          idx++;
        }
      }
      cells.push(row);
    }
    return cells;
  }, [seed]);

  // Check for bingo
  const checkBingo = useCallback((b: BingoCell[][]) => {
    const lines: number[][] = [];

    // Rows
    for (let r = 0; r < 5; r++) {
      if (b[r].every(c => c.marked)) {
        lines.push(b[r].map((_, c) => r * 5 + c));
      }
    }
    // Columns
    for (let c = 0; c < 5; c++) {
      if (b.every(row => row[c].marked)) {
        lines.push([0, 1, 2, 3, 4].map(r => r * 5 + c));
      }
    }
    // Diagonals
    if ([0, 1, 2, 3, 4].every(i => b[i][i].marked)) {
      lines.push([0, 6, 12, 18, 24]);
    }
    if ([0, 1, 2, 3, 4].every(i => b[i][4 - i].marked)) {
      lines.push([4, 8, 12, 16, 20]);
    }

    return lines;
  }, []);

  // Start game
  const startGame = useCallback(() => {
    const newBoard = generateBoard();
    setBoard(newBoard);
    setPullLog([]);
    setPullCount(0);
    setElapsedTime(0);
    setBingoLines([]);
    setPhase('active');
    setIsPaused(false);
    pullRng.current = seededRandom(seed + 42);

    // Timer
    timerRef.current = setInterval(() => {
      setElapsedTime(t => t + 1);
    }, 1000);
  }, [generateBoard, seed]);

  // Pull a card
  const pullCard = useCallback(() => {
    if (phase !== 'active' || isPaused || !pullRng.current) return;

    const filtered = sportsCards.filter(c => sportFilter === 'all' || c.sport === sportFilter);
    if (filtered.length === 0) return;

    const rng = pullRng.current;
    const idx = Math.floor(rng() * filtered.length);
    const card = filtered[idx];
    const value = parseValue(card.estimatedValueRaw);

    const pull = { name: card.name, player: card.player, value, sport: card.sport };
    setPullLog(prev => [pull, ...prev].slice(0, 30));
    setPullCount(prev => prev + 1);

    // Check which events this pull triggers
    setBoard(prev => {
      const newBoard = prev.map(row => row.map(cell => ({ ...cell })));
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          if (newBoard[r][c].marked) continue;
          const cellText = newBoard[r][c].text;
          // Match cell text to events
          const matchingEvent = BINGO_EVENTS.find(e => e.text === cellText);
          if (matchingEvent) {
            const triggered = matchingEvent.trigger(value, card.rookie, card.sport, card.set, card.year);
            if (triggered) {
              newBoard[r][c].marked = true;
              newBoard[r][c].autoMarked = true;
            }
          }
        }
      }

      // Check bingo
      const lines = checkBingo(newBoard);
      if (lines.length > 0) {
        setBingoLines(lines);
        setPhase('bingo');
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (timerRef.current) clearInterval(timerRef.current);

        setStats(prev => ({
          gamesPlayed: prev.gamesPlayed + 1,
          bingos: prev.bingos + 1,
          fastestBingo: Math.min(prev.fastestBingo, elapsedTime),
          totalMarks: prev.totalMarks + newBoard.flat().filter(c => c.marked).length,
        }));
      }

      return newBoard;
    });
  }, [phase, isPaused, sportFilter, checkBingo, elapsedTime]);

  // Auto-pull every 3 seconds
  useEffect(() => {
    if (phase === 'active' && !isPaused) {
      intervalRef.current = setInterval(pullCard, 3000);
      // Initial pull
      const timeout = setTimeout(pullCard, 500);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        clearTimeout(timeout);
      };
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase, isPaused, pullCard]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const manualMark = (r: number, c: number) => {
    if (phase !== 'active') return;
    if (board[r][c].marked) return;
    setBoard(prev => {
      const newBoard = prev.map(row => row.map(cell => ({ ...cell })));
      newBoard[r][c].marked = true;
      const lines = checkBingo(newBoard);
      if (lines.length > 0) {
        setBingoLines(lines);
        setPhase('bingo');
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
        setStats(prev => ({
          gamesPlayed: prev.gamesPlayed + 1,
          bingos: prev.bingos + 1,
          fastestBingo: Math.min(prev.fastestBingo, elapsedTime),
          totalMarks: prev.totalMarks + newBoard.flat().filter(c2 => c2.marked).length,
        }));
      }
      return newBoard;
    });
  };

  const sportLabel = (s: string) => {
    const map: Record<string, string> = { baseball: 'MLB', basketball: 'NBA', football: 'NFL', hockey: 'NHL' };
    return map[s] || s;
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const grade = phase === 'bingo' ? getGrade(pullCount, elapsedTime) : null;

  const shareResult = () => {
    const emojiGrid = board.map(row =>
      row.map(cell => cell.marked ? (cell.autoMarked ? '🟢' : '🟡') : '⬜').join('')
    ).join('\n');
    const text = `Break Bingo ${mode === 'daily' ? 'Daily' : 'Random'}\n${grade?.letter} Grade | ${pullCount} pulls | ${formatTime(elapsedTime)}\n\n${emojiGrid}\n\ncardvault-two.vercel.app/break-bingo`;
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <div>
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-cyan-400 text-xl font-bold">{stats.gamesPlayed}</div>
          <div className="text-gray-500 text-xs">Games</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-emerald-400 text-xl font-bold">{stats.bingos}</div>
          <div className="text-gray-500 text-xs">Bingos</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-white text-xl font-bold">{stats.fastestBingo < 999 ? formatTime(stats.fastestBingo) : '--'}</div>
          <div className="text-gray-500 text-xs">Fastest</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-amber-400 text-xl font-bold">{stats.totalMarks}</div>
          <div className="text-gray-500 text-xs">Total Marks</div>
        </div>
      </div>

      {/* Setup Phase */}
      {phase === 'setup' && (
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1">
              <button onClick={() => setMode('daily')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'daily' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'}`}>Daily</button>
              <button onClick={() => { setMode('random'); setRandomSeed(Date.now()); }} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'random' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'}`}>Random</button>
            </div>
            <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1">
              {(['all', 'baseball', 'basketball', 'football', 'hockey'] as Sport[]).map(s => (
                <button key={s} onClick={() => setSportFilter(s)} className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${sportFilter === s ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                  {s === 'all' ? 'All' : sportLabel(s)}
                </button>
              ))}
            </div>
          </div>

          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎱</div>
            <h3 className="text-xl font-bold text-white mb-2">Ready to Play Break Bingo?</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">Watch a simulated card break. Your bingo card fills up as cards are pulled. Get 5 in a row to win!</p>
            <button onClick={startGame} className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-lg transition-colors">
              Start Break
            </button>
          </div>
        </div>
      )}

      {/* Active + Bingo Phase */}
      {(phase === 'active' || phase === 'bingo') && (
        <div>
          {/* Game bar */}
          <div className="flex items-center justify-between mb-4 bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2">
            <div className="flex items-center gap-4">
              <div className="text-white text-sm"><span className="text-gray-500">Pulls:</span> {pullCount}</div>
              <div className="text-white text-sm"><span className="text-gray-500">Time:</span> {formatTime(elapsedTime)}</div>
            </div>
            {phase === 'active' && (
              <div className="flex gap-2">
                <button onClick={() => setIsPaused(!isPaused)} className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors">
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
              </div>
            )}
            {phase === 'bingo' && grade && (
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${grade.color}`}>{grade.letter}</span>
                <button onClick={shareResult} className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-sm rounded-lg transition-colors">
                  Share
                </button>
              </div>
            )}
          </div>

          {phase === 'bingo' && (
            <div className="text-center mb-4 bg-cyan-950/40 border border-cyan-800/50 rounded-xl py-3">
              <div className="text-2xl font-bold text-cyan-400">BINGO!</div>
              <div className="text-gray-400 text-sm">{pullCount} pulls in {formatTime(elapsedTime)}</div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Bingo Board */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-5 gap-1.5">
                {/* Header */}
                {['B', 'I', 'N', 'G', 'O'].map(letter => (
                  <div key={letter} className="text-center text-cyan-400 font-bold text-lg py-1">{letter}</div>
                ))}
                {/* Cells */}
                {board.flat().map((cell, i) => {
                  const r = Math.floor(i / 5);
                  const c = i % 5;
                  const isBingoCell = bingoLines.some(line => line.includes(i));
                  return (
                    <button
                      key={i}
                      onClick={() => manualMark(r, c)}
                      disabled={cell.marked || phase === 'bingo'}
                      className={`aspect-square flex items-center justify-center p-1 rounded-lg text-xs sm:text-sm font-medium transition-all border ${
                        cell.text === 'FREE'
                          ? 'bg-cyan-900/50 border-cyan-700/50 text-cyan-300'
                          : cell.marked
                            ? isBingoCell
                              ? 'bg-cyan-600 border-cyan-400 text-white scale-105 shadow-lg shadow-cyan-500/30'
                              : cell.autoMarked
                                ? 'bg-emerald-900/60 border-emerald-700/50 text-emerald-300'
                                : 'bg-yellow-900/60 border-yellow-700/50 text-yellow-300'
                            : 'bg-gray-900/80 border-gray-700/50 text-gray-300 hover:border-cyan-700/50 hover:bg-gray-800/80'
                      }`}
                    >
                      <span className="text-center leading-tight">{cell.text}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-900/60 border border-emerald-700/50 rounded" /> Auto-marked</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-900/60 border border-yellow-700/50 rounded" /> Manual</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-cyan-600 border border-cyan-400 rounded" /> Bingo line</span>
              </div>
            </div>

            {/* Pull Feed */}
            <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-3 max-h-96 overflow-y-auto">
              <h3 className="text-sm font-bold text-white mb-2">Live Pull Feed</h3>
              {pullLog.length === 0 ? (
                <div className="text-gray-500 text-xs text-center py-6">Waiting for first pull...</div>
              ) : (
                <div className="space-y-1.5">
                  {pullLog.map((pull, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-800/50 rounded-lg px-2 py-1.5">
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-xs font-medium truncate">{pull.player}</div>
                        <div className="text-gray-500 text-[10px] truncate">{pull.name}</div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <span className="text-gray-400 text-[10px]">{sportLabel(pull.sport)}</span>
                        <span className={`text-xs font-bold ${pull.value >= 50 ? 'text-cyan-400' : pull.value >= 10 ? 'text-emerald-400' : 'text-gray-400'}`}>${pull.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {phase === 'bingo' && (
            <div className="mt-6 text-center">
              <button
                onClick={() => { setPhase('setup'); setPullLog([]); setBoard([]); setBingoLines([]); }}
                className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      )}

      {/* How It Works */}
      <section className="mt-12 bg-gray-900/40 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">How Break Bingo Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-400">
          <div>
            <h3 className="text-cyan-400 font-medium mb-1">1. Get Your Card</h3>
            <p>You receive a 5x5 bingo card with 24 break events (plus a FREE center space). Events include card values, types, sports, and sets.</p>
          </div>
          <div>
            <h3 className="text-cyan-400 font-medium mb-1">2. Watch the Break</h3>
            <p>Cards are pulled every 3 seconds from our database of 9,700+ real cards. Each pull is checked against your bingo card.</p>
          </div>
          <div>
            <h3 className="text-cyan-400 font-medium mb-1">3. Mark Your Card</h3>
            <p>Matching events are auto-marked in green. You can also manually mark squares you think have been hit. Get 5 in a row (any direction) to win!</p>
          </div>
          <div>
            <h3 className="text-cyan-400 font-medium mb-1">4. Call BINGO!</h3>
            <p>Your grade is based on speed — S-grade for quick bingos (under 30 seconds), all the way down to F for long games. Share your results!</p>
          </div>
        </div>
      </section>
    </div>
  );
}

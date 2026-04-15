'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface SnapCard { player: string; year: number; set: string; sport: string; gemValue: number; displayValue: string; }
interface RoundResult { left: SnapCard; right: SnapCard; correct: boolean; pickedSide: 'left' | 'right' | null; timeMs: number; points: number; }
type GameState = 'ready' | 'playing' | 'reveal' | 'done';

function seededRandom(seed: number): () => number { let s = seed; return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; }; }
function getDaySeed(): number { const d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate() + 7777; }
function shuffle<T>(arr: T[], rand: () => number): T[] { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

const CARDS: SnapCard[] = [
  { player: 'Mickey Mantle', year: 1952, set: 'Topps', sport: 'baseball', gemValue: 50000, displayValue: '$50,000+' },
  { player: 'Michael Jordan', year: 1986, set: 'Fleer', sport: 'basketball', gemValue: 40000, displayValue: '$40,000+' },
  { player: 'Wayne Gretzky', year: 1979, set: 'O-Pee-Chee', sport: 'hockey', gemValue: 25000, displayValue: '$25,000+' },
  { player: 'LeBron James', year: 2003, set: 'Topps Chrome', sport: 'basketball', gemValue: 10000, displayValue: '$10,000+' },
  { player: 'Tom Brady', year: 2000, set: 'Bowman Chrome', sport: 'football', gemValue: 8000, displayValue: '$8,000+' },
  { player: 'Kobe Bryant', year: 1996, set: 'Topps Chrome', sport: 'basketball', gemValue: 7500, displayValue: '$7,500+' },
  { player: 'Derek Jeter', year: 1993, set: 'SP', sport: 'baseball', gemValue: 5000, displayValue: '$5,000+' },
  { player: 'Ken Griffey Jr.', year: 1989, set: 'Upper Deck', sport: 'baseball', gemValue: 4000, displayValue: '$4,000+' },
  { player: 'Mike Trout', year: 2011, set: 'Topps Update', sport: 'baseball', gemValue: 3000, displayValue: '$3,000+' },
  { player: 'Patrick Mahomes', year: 2017, set: 'Panini Prizm', sport: 'football', gemValue: 2500, displayValue: '$2,500+' },
  { player: 'Shohei Ohtani', year: 2018, set: 'Topps Update', sport: 'baseball', gemValue: 2000, displayValue: '$2,000+' },
  { player: 'Luka Doncic', year: 2018, set: 'Panini Prizm', sport: 'basketball', gemValue: 1800, displayValue: '$1,800+' },
  { player: 'Connor McDavid', year: 2015, set: 'Upper Deck YG', sport: 'hockey', gemValue: 1500, displayValue: '$1,500+' },
  { player: 'Victor Wembanyama', year: 2023, set: 'Panini Prizm', sport: 'basketball', gemValue: 1200, displayValue: '$1,200+' },
  { player: 'Nikola Jokic', year: 2015, set: 'Panini Prizm', sport: 'basketball', gemValue: 1000, displayValue: '$1,000+' },
  { player: 'Josh Allen', year: 2018, set: 'Panini Prizm', sport: 'football', gemValue: 800, displayValue: '$800+' },
  { player: 'Jayson Tatum', year: 2017, set: 'Panini Prizm', sport: 'basketball', gemValue: 600, displayValue: '$600+' },
  { player: 'Joe Burrow', year: 2020, set: 'Panini Prizm', sport: 'football', gemValue: 500, displayValue: '$500+' },
  { player: 'Justin Herbert', year: 2020, set: 'Panini Prizm', sport: 'football', gemValue: 450, displayValue: '$450+' },
  { player: 'Cale Makar', year: 2019, set: 'Upper Deck YG', sport: 'hockey', gemValue: 400, displayValue: '$400+' },
  { player: 'Anthony Edwards', year: 2020, set: 'Panini Prizm', sport: 'basketball', gemValue: 350, displayValue: '$350+' },
  { player: 'Gunnar Henderson', year: 2023, set: 'Topps Chrome', sport: 'baseball', gemValue: 300, displayValue: '$300+' },
  { player: 'Caitlin Clark', year: 2024, set: 'Panini Prizm', sport: 'basketball', gemValue: 300, displayValue: '$300+' },
  { player: 'Paul Skenes', year: 2024, set: 'Bowman Chrome', sport: 'baseball', gemValue: 250, displayValue: '$250+' },
  { player: 'Connor Bedard', year: 2023, set: 'Upper Deck YG', sport: 'hockey', gemValue: 250, displayValue: '$250+' },
  { player: 'Bobby Witt Jr.', year: 2022, set: 'Topps Chrome', sport: 'baseball', gemValue: 200, displayValue: '$200+' },
  { player: 'Lamar Jackson', year: 2018, set: 'Panini Prizm', sport: 'football', gemValue: 200, displayValue: '$200+' },
  { player: 'Shai Gilgeous-Alexander', year: 2018, set: 'Panini Prizm', sport: 'basketball', gemValue: 200, displayValue: '$200+' },
  { player: 'CJ Stroud', year: 2023, set: 'Panini Prizm', sport: 'football', gemValue: 180, displayValue: '$180+' },
  { player: 'Roki Sasaki', year: 2025, set: 'Topps Chrome', sport: 'baseball', gemValue: 300, displayValue: '$300+' },
  { player: 'Macklin Celebrini', year: 2024, set: 'Upper Deck YG', sport: 'hockey', gemValue: 150, displayValue: '$150+' },
  { player: 'Julio Rodriguez', year: 2022, set: 'Topps Chrome', sport: 'baseball', gemValue: 150, displayValue: '$150+' },
  { player: 'Ja Morant', year: 2019, set: 'Panini Prizm', sport: 'basketball', gemValue: 150, displayValue: '$150+' },
  { player: 'Elly De La Cruz', year: 2023, set: 'Topps Chrome', sport: 'baseball', gemValue: 120, displayValue: '$120+' },
  { player: 'Caleb Williams', year: 2024, set: 'Panini Prizm', sport: 'football', gemValue: 120, displayValue: '$120+' },
  { player: 'Reed Sheppard', year: 2024, set: 'Panini Prizm', sport: 'basketball', gemValue: 120, displayValue: '$120+' },
  { player: 'Jayden Daniels', year: 2024, set: 'Panini Prizm', sport: 'football', gemValue: 100, displayValue: '$100+' },
  { player: 'Cooper Flagg', year: 2025, set: 'Prizm Draft', sport: 'basketball', gemValue: 100, displayValue: '$100+' },
  { player: 'Zach Edey', year: 2024, set: 'Panini Prizm', sport: 'basketball', gemValue: 100, displayValue: '$100+' },
  { player: 'Cam Ward', year: 2025, set: 'Bowman University', sport: 'football', gemValue: 60, displayValue: '$60+' },
];

const ROUNDS = 20;
const TIME_LIMIT_MS = 8000;

function generateMatchups(): Array<[SnapCard, SnapCard]> {
  const rand = seededRandom(getDaySeed());
  const shuffled = shuffle(CARDS, rand);
  const matchups: Array<[SnapCard, SnapCard]> = [];
  for (let i = 0; i < ROUNDS; i++) {
    const a = shuffled[i % shuffled.length];
    let b = shuffled[(i + 7) % shuffled.length];
    if (b.player === a.player || b.gemValue === a.gemValue) b = shuffled[(i + 13) % shuffled.length];
    if (b.player === a.player) b = shuffled[(i + 19) % shuffled.length];
    matchups.push(rand() > 0.5 ? [a, b] : [b, a]);
  }
  return matchups;
}

function calcPoints(timeMs: number, correct: boolean): number {
  if (!correct) return 0;
  if (timeMs <= 2000) return 500;
  if (timeMs >= TIME_LIMIT_MS) return 50;
  return Math.round(500 - ((timeMs - 2000) / (TIME_LIMIT_MS - 2000)) * 450);
}

const sportColors: Record<string, string> = { baseball: 'bg-red-900/50 text-red-300', basketball: 'bg-orange-900/50 text-orange-300', football: 'bg-green-900/50 text-green-300', hockey: 'bg-blue-900/50 text-blue-300' };

export default function ValueSnapClient() {
  const [state, setState] = useState<GameState>('ready');
  const [matchups, setMatchups] = useState<Array<[SnapCard, SnapCard]>>([]);
  const [round, setRound] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_MS);
  const [shareText, setShareText] = useState('');
  const startRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setMatchups(generateMatchups());
    const saved = localStorage.getItem('cardvault-value-snap');
    if (saved) { try { const d = JSON.parse(saved) as { date: string; results: RoundResult[] }; if (d.date === new Date().toISOString().split('T')[0] && d.results.length === ROUNDS) { setResults(d.results); setState('done'); } } catch { /* */ } }
  }, []);

  const startTimer = useCallback(() => {
    startRef.current = Date.now();
    setTimeLeft(TIME_LIMIT_MS);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => { const r = Math.max(0, TIME_LIMIT_MS - (Date.now() - startRef.current)); setTimeLeft(r); if (r <= 0 && timerRef.current) clearInterval(timerRef.current); }, 50);
  }, []);

  const startGame = useCallback(() => { if (!matchups.length) return; setState('playing'); setRound(0); setResults([]); startTimer(); }, [matchups, startTimer]);

  const pick = useCallback((side: 'left' | 'right' | null) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const timeMs = Date.now() - startRef.current;
    const [left, right] = matchups[round];
    const correctSide = left.gemValue >= right.gemValue ? 'left' : 'right';
    const correct = side === correctSide;
    const points = calcPoints(timeMs, correct);
    const result: RoundResult = { left, right, correct, pickedSide: side, timeMs, points };
    const nr = [...results, result];
    setResults(nr);
    setState('reveal');
    setTimeout(() => {
      if (round + 1 >= ROUNDS) {
        setState('done');
        localStorage.setItem('cardvault-value-snap', JSON.stringify({ date: new Date().toISOString().split('T')[0], results: nr }));
        const total = nr.reduce((s, r) => s + r.points, 0);
        const sh = localStorage.getItem('cardvault-value-snap-high');
        if (total > (sh ? parseInt(sh, 10) : 0)) localStorage.setItem('cardvault-value-snap-high', String(total));
      } else { setRound(p => p + 1); setState('playing'); startTimer(); }
    }, 1800);
  }, [matchups, round, results, startTimer]);

  useEffect(() => { if (state === 'playing' && timeLeft <= 0) pick(null); }, [state, timeLeft, pick]);
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const share = useCallback(() => {
    const total = results.reduce((s, r) => s + r.points, 0);
    const correct = results.filter(r => r.correct).length;
    const bars = results.map(r => r.correct ? '\u{1F7E2}' : '\u{1F534}').join('');
    const text = `Card Value Snap - ${total.toLocaleString()} pts\n${bars}\n${correct}/${ROUNDS} correct\n\ncardvault-two.vercel.app/card-value-snap`;
    navigator.clipboard.writeText(text).then(() => { setShareText('Copied!'); setTimeout(() => setShareText(''), 2000); }).catch(() => { setShareText('Failed'); setTimeout(() => setShareText(''), 2000); });
  }, [results]);

  if (state === 'ready') {
    const sh = typeof window !== 'undefined' ? localStorage.getItem('cardvault-value-snap-high') : null;
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-6">{'\u{1F4B5}'}</div>
        <h2 className="text-2xl font-bold text-white mb-3">Which Card Is Worth More?</h2>
        <p className="text-zinc-400 mb-8 max-w-md mx-auto">{ROUNDS} matchups. 8 seconds each. Tap the higher value card. Perfect: {(ROUNDS * 500).toLocaleString()}.</p>
        {sh && parseInt(sh, 10) > 0 && <p className="text-sky-400 text-sm mb-6">Best: {parseInt(sh, 10).toLocaleString()} pts</p>}
        <button onClick={startGame} className="px-8 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-lg transition-colors">Start Game</button>
      </div>
    );
  }

  if (state === 'done') {
    const total = results.reduce((s, r) => s + r.points, 0);
    const correct = results.filter(r => r.correct).length;
    const sh = typeof window !== 'undefined' ? localStorage.getItem('cardvault-value-snap-high') : null;
    const high = sh ? parseInt(sh, 10) : 0;
    const grade = correct >= 19 ? 'S' : correct >= 17 ? 'A+' : correct >= 15 ? 'A' : correct >= 12 ? 'B' : correct >= 9 ? 'C' : 'D';

    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-br from-sky-950/50 to-zinc-900 border border-sky-800/30 rounded-2xl p-8 text-center">
          {total >= high && total > 0 && <p className="text-amber-400 text-sm font-bold mb-2">NEW HIGH SCORE!</p>}
          <div className="text-5xl font-black text-white mb-2">{total.toLocaleString()}</div>
          <p className="text-zinc-400 mb-6">points</p>
          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-6">
            <div className="bg-white/5 rounded-xl p-3"><div className="text-2xl font-bold text-sky-400">{correct}/{ROUNDS}</div><div className="text-xs text-zinc-500">Correct</div></div>
            <div className="bg-white/5 rounded-xl p-3"><div className="text-2xl font-bold text-sky-400">{grade}</div><div className="text-xs text-zinc-500">Grade</div></div>
            <div className="bg-white/5 rounded-xl p-3"><div className="text-2xl font-bold text-sky-400">{ROUNDS - correct}</div><div className="text-xs text-zinc-500">Missed</div></div>
          </div>
          <div className="flex gap-2 justify-center">
            <button onClick={share} className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-medium transition-colors">{shareText || 'Copy Results'}</button>
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Card Value Snap: ${total.toLocaleString()} pts | ${correct}/${ROUNDS} correct\ncardvault-two.vercel.app/card-value-snap`)}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors">Share to X</a>
          </div>
        </div>
        <div><h2 className="text-lg font-bold text-white mb-4">Round by Round</h2>
          <div className="space-y-2">{results.map((r, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${r.correct ? 'bg-emerald-950/30 border border-emerald-800/30' : 'bg-red-950/30 border border-red-800/30'}`}>
              <span className="text-xs text-zinc-500 w-6 text-right">#{i + 1}</span>
              <span className={`text-lg ${r.correct ? 'text-emerald-400' : 'text-red-400'}`}>{r.correct ? '\u2713' : '\u2717'}</span>
              <div className="flex-1 min-w-0"><div className="text-sm text-white truncate"><span className="font-medium">{r.left.player}</span> <span className="text-zinc-500">({r.left.displayValue})</span> <span className="text-zinc-600">vs</span> <span className="font-medium ml-1">{r.right.player}</span> <span className="text-zinc-500">({r.right.displayValue})</span></div></div>
              <div className="text-sm font-bold text-white">{r.points}</div>
            </div>
          ))}</div>
        </div>
        <p className="text-center text-zinc-500 text-sm">New matchups tomorrow!</p>
      </div>
    );
  }

  const [left, right] = matchups[round] ?? [null, null];
  if (!left || !right) return null;
  const pct = (timeLeft / TIME_LIMIT_MS) * 100;
  const tColor = pct > 50 ? 'bg-sky-500' : pct > 25 ? 'bg-amber-500' : 'bg-red-500';
  const last = state === 'reveal' && results.length > 0 ? results[results.length - 1] : null;
  const correctSide = left.gemValue >= right.gemValue ? 'left' : 'right';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><span className="text-sm text-zinc-400">Round {round + 1}/{ROUNDS}</span><span className="text-sm text-zinc-400">{results.reduce((s, r) => s + r.points, 0).toLocaleString()} pts</span></div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden"><div className={`h-full ${tColor} transition-all duration-100 rounded-full`} style={{ width: `${pct}%` }} /></div>
      <p className="text-center text-zinc-400 text-sm">{state === 'reveal' ? 'Revealing values...' : 'Tap the card worth MORE in gem mint'}</p>
      <div className="grid grid-cols-2 gap-4">
        {[{ card: left, side: 'left' as const }, { card: right, side: 'right' as const }].map(({ card, side }) => {
          let bc = 'border-zinc-700 hover:border-sky-600';
          if (state === 'reveal' && last) { bc = side === correctSide ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-red-500/50'; }
          return (
            <button key={side} onClick={() => state === 'playing' ? pick(side) : undefined} disabled={state !== 'playing'} className={`bg-zinc-900/80 border-2 ${bc} rounded-xl p-5 text-center transition-all ${state === 'playing' ? 'cursor-pointer active:scale-95' : ''}`}>
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] mb-3 ${sportColors[card.sport] ?? 'bg-zinc-800 text-zinc-400'}`}>{card.sport}</span>
              <div className="text-lg sm:text-xl font-bold text-white mb-1">{card.player}</div>
              <div className="text-xs text-zinc-500 mb-3">{card.year} {card.set}</div>
              {state === 'reveal' && <div className={`text-lg font-black ${side === correctSide ? 'text-emerald-400' : 'text-red-400'}`}>{card.displayValue}</div>}
            </button>
          );
        })}
      </div>
      {state === 'reveal' && last && <div className={`text-center py-2 ${last.correct ? 'text-emerald-400' : 'text-red-400'}`}><span className="font-bold">{last.correct ? `+${last.points} pts (${(last.timeMs / 1000).toFixed(1)}s)` : last.pickedSide === null ? "Time's up!" : 'Wrong pick!'}</span></div>}
      <div className="flex justify-center gap-1.5 pt-2">{Array.from({ length: ROUNDS }, (_, i) => { let c = 'bg-zinc-700'; if (i < results.length) c = results[i].correct ? 'bg-emerald-500' : 'bg-red-500'; else if (i === round) c = 'bg-sky-500 animate-pulse'; return <div key={i} className={`w-2 h-2 rounded-full ${c}`} />; })}</div>
    </div>
  );
}

'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

function parseValue(raw: string): number {
  const m = raw.match(/\$[\d,]+/);
  if (!m) return 0;
  return parseInt(m[0].replace(/[$,]/g, ''), 10);
}

function dateHash(): number {
  const d = new Date();
  const str = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h + str.charCodeAt(i)) | 0; }
  return Math.abs(h);
}

function seededRng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

const SPORT_COLORS: Record<string, string> = {
  baseball: 'text-red-400', basketball: 'text-orange-400', football: 'text-blue-400', hockey: 'text-cyan-400',
};
const SPORT_BG: Record<string, string> = {
  baseball: 'bg-red-950/40 border-red-800/40', basketball: 'bg-orange-950/40 border-orange-800/40',
  football: 'bg-blue-950/40 border-blue-800/40', hockey: 'bg-cyan-950/40 border-cyan-800/40',
};
const SPORT_ICONS: Record<string, string> = {
  baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒',
};

interface DraftCard {
  slug: string;
  name: string;
  player: string;
  sport: string;
  year: number;
  value: number;
  rookie: boolean;
  set: string;
}

interface AIPlayer {
  name: string;
  strategy: string;
  emoji: string;
  description: string;
  cards: DraftCard[];
}

const AI_PROFILES: Omit<AIPlayer, 'cards'>[] = [
  { name: 'The Investor', strategy: 'value', emoji: '💰', description: 'Always chases the highest-value card' },
  { name: 'The Rookie Hunter', strategy: 'rookie', emoji: '🌟', description: 'Prioritizes rookie cards above all' },
  { name: 'The Vintage Collector', strategy: 'vintage', emoji: '🏛️', description: 'Goes for the oldest cards first' },
];

const POOL_SIZE = 32;
const ROUNDS = 8;
const PICKS_PER_ROUND = 4; // 4 players

function pickForAI(available: DraftCard[], strategy: string, rng: () => number): number {
  if (available.length === 0) return -1;
  switch (strategy) {
    case 'value': {
      let best = 0;
      for (let i = 1; i < available.length; i++) {
        if (available[i].value > available[best].value) best = i;
      }
      return best;
    }
    case 'rookie': {
      const rookies = available.map((c, i) => ({ c, i })).filter(x => x.c.rookie);
      if (rookies.length > 0) {
        let best = rookies[0];
        for (const r of rookies) { if (r.c.value > best.c.value) best = r; }
        return best.i;
      }
      let best = 0;
      for (let i = 1; i < available.length; i++) {
        if (available[i].value > available[best].value) best = i;
      }
      return best;
    }
    case 'vintage': {
      let oldest = 0;
      for (let i = 1; i < available.length; i++) {
        if (available[i].year < available[oldest].year || (available[i].year === available[oldest].year && available[i].value > available[oldest].value)) {
          oldest = i;
        }
      }
      return oldest;
    }
    default:
      return Math.floor(rng() * available.length);
  }
}

// Snake draft order: 0-1-2-3-3-2-1-0
function getDraftOrder(): number[] {
  const order: number[] = [];
  for (let round = 0; round < ROUNDS; round++) {
    if (round % 2 === 0) {
      order.push(0, 1, 2, 3);
    } else {
      order.push(3, 2, 1, 0);
    }
  }
  return order;
}

function getGrade(yourValue: number, bestAI: number): { grade: string; color: string } {
  const diff = yourValue - bestAI;
  const pct = bestAI > 0 ? (diff / bestAI) * 100 : 0;
  if (pct >= 20) return { grade: 'S', color: 'text-yellow-400' };
  if (pct >= 10) return { grade: 'A', color: 'text-emerald-400' };
  if (pct >= 0) return { grade: 'B', color: 'text-blue-400' };
  if (pct >= -10) return { grade: 'C', color: 'text-orange-400' };
  if (pct >= -25) return { grade: 'D', color: 'text-red-400' };
  return { grade: 'F', color: 'text-red-500' };
}

export default function CardDraftClient() {
  const [mode, setMode] = useState<'menu' | 'drafting' | 'done'>('menu');
  const [isDaily, setIsDaily] = useState(true);
  const [pickIndex, setPickIndex] = useState(0);
  const [pool, setPool] = useState<DraftCard[]>([]);
  const [myCards, setMyCards] = useState<DraftCard[]>([]);
  const [aiPlayers, setAiPlayers] = useState<AIPlayer[]>([]);
  const [draftOrder, setDraftOrder] = useState<number[]>([]);
  const [rngFn, setRngFn] = useState<() => number>(() => () => 0);
  const [lastPick, setLastPick] = useState<{ player: string; card: DraftCard } | null>(null);
  const [showResults, setShowResults] = useState(false);

  const validCards = useMemo(() =>
    sportsCards.filter(c => {
      const v = parseValue(c.estimatedValueRaw);
      return v >= 5 && v <= 2000;
    }).map(c => ({
      slug: c.slug,
      name: c.name,
      player: c.player,
      sport: c.sport,
      year: c.year,
      value: parseValue(c.estimatedValueRaw),
      rookie: c.rookie,
      set: c.set,
    })), []);

  const startGame = useCallback((daily: boolean) => {
    const seed = daily ? dateHash() : Date.now();
    const rng = seededRng(seed);
    setRngFn(() => rng);
    setIsDaily(daily);

    // Select pool of 32 cards — ensure sport diversity
    const bySport: Record<string, DraftCard[]> = { baseball: [], basketball: [], football: [], hockey: [] };
    const shuffled = [...validCards].sort(() => rng() - 0.5);
    for (const c of shuffled) {
      if (bySport[c.sport] && bySport[c.sport].length < 8) {
        bySport[c.sport].push(c);
      }
    }
    const selectedPool = [...bySport.baseball, ...bySport.basketball, ...bySport.football, ...bySport.hockey]
      .sort(() => rng() - 0.5);

    setPool(selectedPool);
    setMyCards([]);
    setAiPlayers(AI_PROFILES.map(p => ({ ...p, cards: [] })));
    setDraftOrder(getDraftOrder());
    setPickIndex(0);
    setLastPick(null);
    setShowResults(false);
    setMode('drafting');
  }, [validCards]);

  const currentPicker = draftOrder[pickIndex] ?? -1;
  const currentRound = Math.floor(pickIndex / PICKS_PER_ROUND) + 1;
  const isMyPick = currentPicker === 0;
  const isGameOver = pickIndex >= draftOrder.length || pool.length === 0;

  const processAIPicks = useCallback(() => {
    let idx = pickIndex;
    let currentPool = [...pool];
    const updatedAI = aiPlayers.map(a => ({ ...a, cards: [...a.cards] }));
    let last: { player: string; card: DraftCard } | null = null;

    while (idx < draftOrder.length && draftOrder[idx] !== 0 && currentPool.length > 0) {
      const aiIdx = draftOrder[idx] - 1; // AI 0-2
      const ai = updatedAI[aiIdx];
      const pickIdx = pickForAI(currentPool, ai.strategy, rngFn);
      if (pickIdx >= 0) {
        const picked = currentPool[pickIdx];
        ai.cards.push(picked);
        currentPool.splice(pickIdx, 1);
        last = { player: `${ai.emoji} ${ai.name}`, card: picked };
      }
      idx++;
    }

    setAiPlayers(updatedAI);
    setPool(currentPool);
    setPickIndex(idx);
    if (last) setLastPick(last);

    if (idx >= draftOrder.length || currentPool.length === 0) {
      setMode('done');
    }
  }, [pickIndex, pool, aiPlayers, draftOrder, rngFn]);

  const handlePick = useCallback((cardIdx: number) => {
    if (!isMyPick || isGameOver) return;
    const picked = pool[cardIdx];
    const newPool = pool.filter((_, i) => i !== cardIdx);
    const newMyCards = [...myCards, picked];
    setMyCards(newMyCards);
    setPool(newPool);
    setLastPick({ player: '🎯 You', card: picked });

    const nextIdx = pickIndex + 1;
    setPickIndex(nextIdx);

    // Process AI picks after a short delay
    setTimeout(() => {
      let idx = nextIdx;
      let currentPool = [...newPool];
      const updatedAI = aiPlayers.map(a => ({ ...a, cards: [...a.cards] }));
      let last: { player: string; card: DraftCard } | null = null;

      while (idx < draftOrder.length && draftOrder[idx] !== 0 && currentPool.length > 0) {
        const aiIdx = draftOrder[idx] - 1;
        const ai = updatedAI[aiIdx];
        const pickI = pickForAI(currentPool, ai.strategy, rngFn);
        if (pickI >= 0) {
          const p = currentPool[pickI];
          ai.cards.push(p);
          currentPool.splice(pickI, 1);
          last = { player: `${ai.emoji} ${ai.name}`, card: p };
        }
        idx++;
      }

      setAiPlayers(updatedAI);
      setPool(currentPool);
      setPickIndex(idx);
      if (last) setLastPick(last);

      if (idx >= draftOrder.length || currentPool.length === 0) {
        setMode('done');
      }
    }, 400);
  }, [isMyPick, isGameOver, pool, myCards, pickIndex, aiPlayers, draftOrder, rngFn]);

  // Results
  const myTotal = myCards.reduce((s, c) => s + c.value, 0);
  const standings = useMemo(() => {
    const all = [
      { name: '🎯 You', cards: myCards, total: myTotal, isYou: true },
      ...aiPlayers.map(a => ({
        name: `${a.emoji} ${a.name}`,
        cards: a.cards,
        total: a.cards.reduce((s, c) => s + c.value, 0),
        isYou: false,
      })),
    ].sort((a, b) => b.total - a.total);
    return all;
  }, [myCards, myTotal, aiPlayers]);

  const yourRank = standings.findIndex(s => s.isYou) + 1;
  const bestAI = Math.max(...aiPlayers.map(a => a.cards.reduce((s, c) => s + c.value, 0)), 1);
  const grade = getGrade(myTotal, bestAI);

  const shareText = `Card Draft Showdown${isDaily ? ' (Daily)' : ''}\n${yourRank === 1 ? '🏆' : yourRank === 2 ? '🥈' : yourRank === 3 ? '🥉' : '4th'} Place — $${myTotal.toLocaleString()} portfolio\nGrade: ${grade.grade}\n${myCards.map(c => `${SPORT_ICONS[c.sport] || '🃏'} ${c.player}`).join('\n')}\n\nhttps://cardvault-two.vercel.app/card-draft`;

  // Menu
  if (mode === 'menu') {
    return (
      <div className="space-y-6">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-3">How to Play</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm text-zinc-400">
            <div className="flex gap-3">
              <span className="text-2xl">🎯</span>
              <div><p className="text-white font-medium">Snake Draft</p><p>You and 3 AI opponents take turns picking cards. Order reverses each round.</p></div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">🃏</span>
              <div><p className="text-white font-medium">32-Card Pool</p><p>8 cards per sport. Pick the best 8 for your portfolio.</p></div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">🤖</span>
              <div><p className="text-white font-medium">3 AI Opponents</p><p>Each AI has a different drafting strategy you must outmaneuver.</p></div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">🏆</span>
              <div><p className="text-white font-medium">Highest Portfolio Wins</p><p>The player whose 8 cards have the highest total value wins.</p></div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Your Opponents</h3>
          <div className="grid sm:grid-cols-3 gap-3">
            {AI_PROFILES.map(ai => (
              <div key={ai.name} className="bg-zinc-800/60 border border-zinc-700/40 rounded-lg p-4">
                <div className="text-2xl mb-2">{ai.emoji}</div>
                <p className="text-white font-semibold text-sm">{ai.name}</p>
                <p className="text-zinc-500 text-xs mt-1">{ai.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => startGame(true)} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-lg transition-colors text-center">
            Daily Draft
          </button>
          <button onClick={() => startGame(false)} className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 px-6 rounded-lg transition-colors text-center">
            Random Draft
          </button>
        </div>
      </div>
    );
  }

  // Results
  if (mode === 'done') {
    return (
      <div className="space-y-6">
        {/* Final Standings */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6">
          <div className="text-center mb-6">
            <div className={`text-5xl font-black ${grade.color} mb-2`}>{grade.grade}</div>
            <p className="text-white text-xl font-bold">
              {yourRank === 1 ? '🏆 Draft Champion!' : yourRank === 2 ? '🥈 Runner Up' : yourRank === 3 ? '🥉 Third Place' : 'Fourth Place'}
            </p>
            <p className="text-zinc-400 text-sm mt-1">Your portfolio: ${myTotal.toLocaleString()}</p>
          </div>

          <div className="space-y-3">
            {standings.map((s, i) => (
              <div key={s.name} className={`flex items-center gap-4 p-3 rounded-lg ${s.isYou ? 'bg-emerald-950/40 border border-emerald-800/40' : 'bg-zinc-800/40 border border-zinc-700/30'}`}>
                <div className="text-xl font-bold text-zinc-500 w-8 text-center">
                  {i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : '#4'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${s.isYou ? 'text-emerald-400' : 'text-white'}`}>{s.name}</p>
                  <p className="text-zinc-500 text-xs">{s.cards.length} cards &middot; {s.cards.filter(c => c.rookie).length} rookies</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">${s.total.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Your Picks Detail */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Your Draft Picks</h3>
          <div className="grid sm:grid-cols-2 gap-2">
            {myCards.map((c, i) => (
              <Link key={c.slug} href={`/sports/${c.slug}`} className="flex items-center gap-3 p-3 bg-zinc-800/60 border border-zinc-700/30 rounded-lg hover:border-emerald-600/40 transition-colors group">
                <div className="text-zinc-500 text-xs font-mono w-6">#{i + 1}</div>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm border ${SPORT_BG[c.sport]}`}>
                  {SPORT_ICONS[c.sport]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate group-hover:text-emerald-400 transition-colors">{c.player}</p>
                  <p className="text-zinc-500 text-xs truncate">{c.year} {c.set.split(' ').slice(0, 3).join(' ')}{c.rookie ? ' · RC' : ''}</p>
                </div>
                <p className="text-emerald-400 text-sm font-bold">${c.value.toLocaleString()}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* AI Picks */}
        {!showResults ? (
          <button onClick={() => setShowResults(true)} className="w-full text-sm text-zinc-400 hover:text-white py-2 transition-colors">
            Show AI picks ▼
          </button>
        ) : (
          <div className="space-y-4">
            {aiPlayers.map(ai => (
              <div key={ai.name} className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{ai.emoji}</span>
                  <span className="text-white font-semibold text-sm">{ai.name}</span>
                  <span className="text-zinc-500 text-xs">· {ai.description}</span>
                  <span className="ml-auto text-zinc-400 font-bold text-sm">${ai.cards.reduce((s, c) => s + c.value, 0).toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ai.cards.map(c => (
                    <div key={c.slug} className="text-xs bg-zinc-800/50 rounded-lg p-2">
                      <p className="text-zinc-300 truncate">{c.player}</p>
                      <p className="text-zinc-500">{c.year} · ${c.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Share + Play Again */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigator.clipboard.writeText(shareText)}
            className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 px-6 rounded-lg transition-colors text-center text-sm"
          >
            Copy Results
          </button>
          <button onClick={() => setMode('menu')} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-lg transition-colors text-center text-sm">
            Play Again
          </button>
        </div>
      </div>
    );
  }

  // Drafting
  return (
    <div className="space-y-4">
      {/* Status Bar */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-zinc-400 text-xs">Round {currentRound} of {ROUNDS}</span>
            <span className="mx-2 text-zinc-600">·</span>
            <span className="text-zinc-400 text-xs">{pool.length} cards left</span>
          </div>
          <span className={`text-sm font-bold ${isMyPick ? 'text-emerald-400 animate-pulse' : 'text-zinc-500'}`}>
            {isMyPick ? '🎯 YOUR PICK' : 'AI picking...'}
          </span>
        </div>
        {/* Draft Progress */}
        <div className="w-full bg-zinc-800 rounded-full h-2">
          <div className="bg-emerald-500 h-2 rounded-full transition-all duration-300" style={{ width: `${(pickIndex / draftOrder.length) * 100}%` }} />
        </div>
      </div>

      {/* Last Pick Notification */}
      {lastPick && (
        <div className="bg-zinc-800/60 border border-zinc-700/40 rounded-lg p-3 text-sm flex items-center gap-3">
          <span className="text-zinc-400">Last pick:</span>
          <span className="text-white font-medium">{lastPick.player}</span>
          <span className="text-zinc-500">drafted</span>
          <span className={`font-medium ${SPORT_COLORS[lastPick.card.sport]}`}>{lastPick.card.player}</span>
          <span className="text-zinc-500">(${lastPick.card.value.toLocaleString()})</span>
        </div>
      )}

      {/* Scoreboard */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-lg p-3 text-center">
          <p className="text-xs text-emerald-400 font-medium">🎯 You</p>
          <p className="text-white font-bold text-lg">${myTotal.toLocaleString()}</p>
          <p className="text-zinc-500 text-xs">{myCards.length} cards</p>
        </div>
        {aiPlayers.map(ai => (
          <div key={ai.name} className="bg-zinc-800/40 border border-zinc-700/30 rounded-lg p-3 text-center">
            <p className="text-xs text-zinc-400 font-medium">{ai.emoji} {ai.name.split(' ').pop()}</p>
            <p className="text-zinc-300 font-bold text-lg">${ai.cards.reduce((s, c) => s + c.value, 0).toLocaleString()}</p>
            <p className="text-zinc-500 text-xs">{ai.cards.length} cards</p>
          </div>
        ))}
      </div>

      {/* Available Cards */}
      {isMyPick && (
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">Pick a card for your portfolio:</h3>
          <div className="grid sm:grid-cols-2 gap-2 max-h-[500px] overflow-y-auto">
            {pool.map((card, i) => (
              <button
                key={card.slug}
                onClick={() => handlePick(i)}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left hover:scale-[1.01] ${SPORT_BG[card.sport]} hover:border-emerald-500/60`}
              >
                <div className="text-lg">{SPORT_ICONS[card.sport]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{card.player}</p>
                  <p className="text-zinc-500 text-xs truncate">{card.year} · {card.set.split(' ').slice(0, 3).join(' ')}{card.rookie ? ' · 🌟 RC' : ''}</p>
                </div>
                <p className="text-emerald-400 font-bold text-sm">${card.value.toLocaleString()}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Your Cards So Far */}
      {myCards.length > 0 && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-2">Your Roster ({myCards.length}/{ROUNDS})</h3>
          <div className="flex flex-wrap gap-2">
            {myCards.map(c => (
              <div key={c.slug} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs ${SPORT_BG[c.sport]}`}>
                <span>{SPORT_ICONS[c.sport]}</span>
                <span className="text-zinc-300">{c.player}</span>
                <span className="text-emerald-400 font-bold">${c.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

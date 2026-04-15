'use client';

import { useState, useMemo, useCallback } from 'react';

interface CardData {
  name: string;
  player: string;
  sport: string;
  year: number;
  set: string;
  estimatedValueRaw: string;
  slug: string;
  rookie: boolean;
}

interface AiPlayer {
  name: string;
  emoji: string;
  aggression: number;
  budget: number;
  won: CardData[];
}

function parseValue(s: string): number {
  const m = s.match(/\$([0-9,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 5;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

function dateHash(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

const SPORT_COLORS: Record<string, string> = {
  baseball: 'text-red-400',
  basketball: 'text-orange-400',
  football: 'text-green-400',
  hockey: 'text-blue-400',
};

export default function CardAuctionClient({ cards }: { cards: CardData[] }) {
  const [mode, setMode] = useState<'menu' | 'playing' | 'results'>('menu');
  const [isPractice, setIsPractice] = useState(false);
  const [round, setRound] = useState(0);
  const [budget, setBudget] = useState(500);
  const [bidAmount, setBidAmount] = useState(10);
  const [won, setWon] = useState<CardData[]>([]);
  const [message, setMessage] = useState('');
  const [ai, setAi] = useState<AiPlayer[]>([]);

  const pool = useMemo(() => {
    const seed = isPractice ? Math.floor(Math.random() * 99999) : dateHash();
    const rng = seededRandom(seed);
    const valid = cards.filter(c => parseValue(c.estimatedValueRaw) >= 3);
    const shuffled = [...valid].sort(() => rng() - 0.5);
    return shuffled.slice(0, 8);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards, isPractice, mode]);

  const currentCard = round < pool.length ? pool[round] : null;
  const currentValue = currentCard ? parseValue(currentCard.estimatedValueRaw) : 0;

  const startGame = useCallback((practice: boolean) => {
    setIsPractice(practice);
    setMode('playing');
    setRound(0);
    setBudget(500);
    setBidAmount(10);
    setWon([]);
    setMessage('');
    setAi([
      { name: 'The Whale', emoji: '\u{1F40B}', aggression: 1.3, budget: 500, won: [] },
      { name: 'The Sniper', emoji: '\u{1F3AF}', aggression: 0.8, budget: 500, won: [] },
      { name: 'The Rookie', emoji: '\u{1F423}', aggression: 1.0, budget: 500, won: [] },
    ]);
  }, []);

  const placeBid = useCallback(() => {
    if (!currentCard || bidAmount > budget) return;
    const rng = seededRandom(dateHash() + round * 1000);

    const aiBids = ai.map(a => {
      if (a.budget < 10) return { ...a, bid: 0 };
      const base = currentValue * (0.6 + rng() * 0.8) * a.aggression;
      const bid = Math.min(Math.round(base), a.budget);
      return { ...a, bid: Math.max(bid, 10) };
    });

    const allBids = [
      { name: 'You', bid: bidAmount },
      ...aiBids.map(a => ({ name: a.name, bid: a.bid })),
    ];
    const winner = allBids.reduce((best, b) => b.bid > best.bid ? b : best);

    const newAi = ai.map((a, i) => {
      if (aiBids[i].name === winner.name) {
        return { ...a, budget: a.budget - aiBids[i].bid, won: [...a.won, currentCard] };
      }
      return a;
    });
    setAi(newAi);

    if (winner.name === 'You') {
      setBudget(b => b - bidAmount);
      setWon(w => [...w, currentCard]);
      setMessage(`You won ${currentCard.player} for $${bidAmount}!`);
    } else {
      setMessage(`${winner.name} won ${currentCard.player} for $${winner.bid}`);
    }

    setTimeout(() => {
      if (round + 1 >= pool.length) {
        setMode('results');
      } else {
        setRound(r => r + 1);
        setBidAmount(10);
        setMessage('');
      }
    }, 1500);
  }, [currentCard, bidAmount, budget, ai, round, pool.length, currentValue]);

  const passRound = useCallback(() => {
    setMessage(`You passed on ${currentCard?.player ?? 'this card'}`);
    const rng = seededRandom(dateHash() + round * 1000);
    const newAi = ai.map(a => {
      if (a.budget < 10) return a;
      const base = currentValue * (0.5 + rng() * 0.6) * a.aggression;
      const bid = Math.min(Math.round(base), a.budget);
      if (bid >= 10) {
        return { ...a, budget: a.budget - bid, won: [...a.won, currentCard!] };
      }
      return a;
    });
    setAi(newAi);

    setTimeout(() => {
      if (round + 1 >= pool.length) setMode('results');
      else { setRound(r => r + 1); setBidAmount(10); setMessage(''); }
    }, 1200);
  }, [currentCard, ai, round, pool.length, currentValue]);

  const totalValue = won.reduce((s, c) => s + parseValue(c.estimatedValueRaw), 0);

  if (mode === 'menu') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button onClick={() => startGame(false)} className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 px-6 rounded-xl transition-colors">
            Daily Auction
            <span className="block text-sm font-normal opacity-80">Same cards for everyone today</span>
          </button>
          <button onClick={() => startGame(true)} className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-4 px-6 rounded-xl transition-colors">
            Practice Mode
            <span className="block text-sm font-normal opacity-80">Random cards, unlimited plays</span>
          </button>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-2">How to Play</h3>
          <ul className="text-zinc-400 text-sm space-y-1">
            <li>Start with $500 budget, compete in 8 auction rounds</li>
            <li>Bid against 3 AI collectors with unique strategies</li>
            <li>Highest bid wins the card (you pay your bid)</li>
            <li>Goal: build the most valuable collection</li>
          </ul>
        </div>
      </div>
    );
  }

  if (mode === 'results') {
    const all = [
      { name: 'You', value: totalValue, spent: 500 - budget, cards: won },
      ...ai.map(a => ({ name: `${a.emoji} ${a.name}`, value: a.won.reduce((s, c) => s + parseValue(c.estimatedValueRaw), 0), spent: 500 - a.budget, cards: a.won })),
    ].sort((a, b) => b.value - a.value);
    const place = all.findIndex(a => a.name === 'You') + 1;
    const grade = place === 1 ? 'S' : place === 2 ? 'A' : place === 3 ? 'B' : 'C';

    return (
      <div className="space-y-6">
        <div className="text-center py-6">
          <div className="text-5xl font-black text-amber-400 mb-2">{grade}</div>
          <div className="text-white text-xl font-bold">{place === 1 ? 'You Won!' : `You placed #${place}`}</div>
          <div className="text-zinc-400 text-sm mt-1">Collection value: ${totalValue} | Spent: ${500 - budget} | Profit: ${totalValue - (500 - budget)}</div>
        </div>
        <div className="space-y-3">
          {all.map((p, i) => (
            <div key={p.name} className={`flex items-center gap-3 p-3 rounded-xl ${p.name === 'You' ? 'bg-amber-950/30 border border-amber-800/50' : 'bg-zinc-900/50 border border-zinc-800'}`}>
              <span className="text-lg font-bold text-zinc-500 w-6">#{i + 1}</span>
              <span className="text-white font-medium flex-1">{p.name}</span>
              <span className="text-zinc-400 text-sm">{p.cards.length} cards</span>
              <span className="text-amber-400 font-bold">${p.value}</span>
            </div>
          ))}
        </div>
        <button onClick={() => setMode('menu')} className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 rounded-xl transition-colors">
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2">
        <span className="text-zinc-400 text-sm">Round {round + 1}/8</span>
        <span className="text-white font-bold">Budget: ${budget}</span>
        <span className="text-amber-400 text-sm">Won: {won.length} cards</span>
      </div>

      <div className="flex gap-1">
        {pool.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${i < round ? 'bg-amber-500' : i === round ? 'bg-amber-400 animate-pulse' : 'bg-zinc-800'}`} />
        ))}
      </div>

      {currentCard && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 text-center">
          <span className={`text-xs font-medium uppercase ${SPORT_COLORS[currentCard.sport] || 'text-zinc-400'}`}>{currentCard.sport}</span>
          <h3 className="text-white text-lg font-bold mt-1">{currentCard.player}</h3>
          <p className="text-zinc-500 text-sm">{currentCard.set} &middot; {currentCard.year}</p>
          {currentCard.rookie && <span className="inline-block bg-amber-900/50 text-amber-400 text-xs px-2 py-0.5 rounded mt-1">RC</span>}
          <div className="text-amber-400 font-bold text-xl mt-3">Est. Value: {currentCard.estimatedValueRaw}</div>
        </div>
      )}

      {message && (
        <div className="text-center text-white font-medium py-2 bg-zinc-800/50 rounded-xl">{message}</div>
      )}

      {!message && currentCard && (
        <>
          <div className="flex items-center gap-3">
            <button onClick={() => setBidAmount(a => Math.max(10, a - 10))} className="bg-zinc-800 hover:bg-zinc-700 text-white w-10 h-10 rounded-lg font-bold">-</button>
            <input
              type="number"
              value={bidAmount}
              onChange={e => setBidAmount(Math.max(10, Math.min(budget, Number(e.target.value))))}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-center text-lg font-bold"
            />
            <button onClick={() => setBidAmount(a => Math.min(budget, a + 10))} className="bg-zinc-800 hover:bg-zinc-700 text-white w-10 h-10 rounded-lg font-bold">+</button>
          </div>

          <div className="flex gap-2">
            {[10, 25, 50, 100].filter(v => v <= budget).map(v => (
              <button key={v} onClick={() => setBidAmount(v)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-1.5 rounded-lg text-sm">${v}</button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={placeBid} disabled={bidAmount > budget} className="bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-colors">
              Bid ${bidAmount}
            </button>
            <button onClick={passRound} className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 rounded-xl transition-colors">
              Pass
            </button>
          </div>
        </>
      )}

      <div className="grid grid-cols-3 gap-2">
        {ai.map(a => (
          <div key={a.name} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-center">
            <div className="text-lg">{a.emoji}</div>
            <div className="text-xs text-white font-medium">{a.name}</div>
            <div className="text-xs text-zinc-500">${a.budget} left</div>
            <div className="text-xs text-zinc-500">{a.won.length} cards</div>
          </div>
        ))}
      </div>
    </div>
  );
}

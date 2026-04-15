'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ── Card Data ──────────────────────────────────────────────────────────────
const CARDS = [
  { name: '2023 Panini Prizm Victor Wembanyama RC', player: 'Victor Wembanyama', sport: 'Basketball', basePrice: 350 },
  { name: '2020 Panini Prizm Justin Herbert RC', player: 'Justin Herbert', sport: 'Football', basePrice: 200 },
  { name: '2018 Panini Prizm Luka Doncic RC', player: 'Luka Doncic', sport: 'Basketball', basePrice: 450 },
  { name: '2011 Topps Update Mike Trout RC', player: 'Mike Trout', sport: 'Baseball', basePrice: 400 },
  { name: '2019 Topps Chrome Fernando Tatis Jr. RC', player: 'Fernando Tatis Jr.', sport: 'Baseball', basePrice: 120 },
  { name: '2020 Panini Prizm Joe Burrow RC', player: 'Joe Burrow', sport: 'Football', basePrice: 150 },
  { name: '2023 Topps Chrome Corbin Carroll RC', player: 'Corbin Carroll', sport: 'Baseball', basePrice: 80 },
  { name: '2019 Panini Prizm Ja Morant RC', player: 'Ja Morant', sport: 'Basketball', basePrice: 100 },
  { name: '2021 Panini Prizm Trevor Lawrence RC', player: 'Trevor Lawrence', sport: 'Football', basePrice: 60 },
  { name: '2022 Topps Chrome Julio Rodriguez RC', player: 'Julio Rodriguez', sport: 'Baseball', basePrice: 90 },
  { name: '2015 Panini Prizm Nikola Jokic RC', player: 'Nikola Jokic', sport: 'Basketball', basePrice: 350 },
  { name: '2017 Panini Prizm Patrick Mahomes RC', player: 'Patrick Mahomes', sport: 'Football', basePrice: 600 },
  { name: '2018 Topps Update Shohei Ohtani RC', player: 'Shohei Ohtani', sport: 'Baseball', basePrice: 300 },
  { name: '2024 Panini Prizm Caleb Williams RC', player: 'Caleb Williams', sport: 'Football', basePrice: 75 },
  { name: '2023 Bowman Chrome Paul Skenes', player: 'Paul Skenes', sport: 'Baseball', basePrice: 110 },
  { name: '2024 Panini Prizm Caitlin Clark RC', player: 'Caitlin Clark', sport: 'Basketball', basePrice: 180 },
  { name: '2022 Panini Prizm Paolo Banchero RC', player: 'Paolo Banchero', sport: 'Basketball', basePrice: 55 },
  { name: '2023 Upper Deck Connor Bedard RC', player: 'Connor Bedard', sport: 'Hockey', basePrice: 200 },
  { name: '2020 Panini Prizm Tua Tagovailoa RC', player: 'Tua Tagovailoa', sport: 'Football', basePrice: 45 },
  { name: '2024 Topps Chrome Jackson Chourio RC', player: 'Jackson Chourio', sport: 'Baseball', basePrice: 65 },
];

const SPORT_COLORS: Record<string, string> = {
  Basketball: 'text-orange-400',
  Football: 'text-green-400',
  Baseball: 'text-blue-400',
  Hockey: 'text-cyan-400',
};

const TOTAL_ROUNDS = 10;
const TICK_MS = 150; // price update speed
const STORAGE_KEY = 'cardvault-hot-potato';

type GameState = 'menu' | 'buying' | 'watching' | 'sold' | 'crashed' | 'roundEnd' | 'gameOver';

interface RoundResult {
  card: typeof CARDS[number];
  buyPrice: number;
  sellPrice: number | null;
  profit: number;
  multiplier: number;
  crashed: boolean;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

export default function HotPotatoClient() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [round, setRound] = useState(0);
  const [currentCard, setCurrentCard] = useState(CARDS[0]);
  const [buyPrice, setBuyPrice] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [highScore, setHighScore] = useState(0);
  const [crashPoint, setCrashPoint] = useState(0);
  const [ticks, setTicks] = useState(0);
  const [hasCrashed, setHasCrashed] = useState(false);
  const [usedCardIndexes, setUsedCardIndexes] = useState<number[]>([]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rngRef = useRef(seededRandom(Date.now()));

  // Load high score
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.highScore) setHighScore(data.highScore);
      }
    } catch { /* empty */ }
  }, []);

  const saveHighScore = useCallback((score: number) => {
    if (score > highScore) {
      setHighScore(score);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ highScore: score })); } catch { /* empty */ }
    }
  }, [highScore]);

  // ── Start Game ───────────────────────────────────────────────────────────
  function startGame() {
    rngRef.current = seededRandom(Date.now());
    setResults([]);
    setRound(0);
    setUsedCardIndexes([]);
    startRound(0, []);
  }

  // ── Start Round ──────────────────────────────────────────────────────────
  function startRound(roundNum: number, used: number[]) {
    // Pick a card not yet used
    let idx: number;
    do {
      idx = Math.floor(rngRef.current() * CARDS.length);
    } while (used.includes(idx) && used.length < CARDS.length);

    const card = CARDS[idx];
    const price = Math.round(card.basePrice * (0.8 + rngRef.current() * 0.4)); // vary +-20%

    // Crash point: between tick 8 and tick 50 (1.2s to 7.5s)
    const crash = 8 + Math.floor(rngRef.current() * 42);

    setCurrentCard(card);
    setBuyPrice(price);
    setCurrentPrice(price);
    setPriceHistory([price]);
    setCrashPoint(crash);
    setTicks(0);
    setHasCrashed(false);
    setRound(roundNum + 1);
    setUsedCardIndexes([...used, idx]);
    setGameState('buying');
  }

  // ── Buy Card ─────────────────────────────────────────────────────────────
  function buyCard() {
    setGameState('watching');
    setTicks(0);
  }

  // ── Price Tick ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState !== 'watching') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTicks(prev => {
        const nextTick = prev + 1;

        setCurrentPrice(prevPrice => {
          if (nextTick >= crashPoint) {
            // CRASH: rapid decline
            const crashDecay = 0.85 - (nextTick - crashPoint) * 0.03;
            const newPrice = Math.round(prevPrice * Math.max(crashDecay, 0.5));

            if (newPrice <= buyPrice * 0.4) {
              // Total crash — round over
              setHasCrashed(true);
              setGameState('crashed');
              setPriceHistory(h => [...h, newPrice]);
              return newPrice;
            }

            setPriceHistory(h => [...h, newPrice]);
            return newPrice;
          }

          // Rising phase: generally upward with volatility
          const volatility = 0.02 + rngRef.current() * 0.06;
          const direction = rngRef.current() < 0.75 ? 1 : -1; // 75% chance up
          const change = 1 + direction * volatility;

          // Acceleration near crash point — faster gains to tempt greed
          const nearCrash = nextTick / crashPoint;
          const acceleration = nearCrash > 0.7 ? 1 + (nearCrash - 0.7) * 0.15 : 1;

          const newPrice = Math.round(prevPrice * change * acceleration);
          setPriceHistory(h => [...h, newPrice]);
          return newPrice;
        });

        return nextTick;
      });
    }, TICK_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [gameState, crashPoint, buyPrice]);

  // Auto-end on crash
  useEffect(() => {
    if (hasCrashed && gameState === 'crashed') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [hasCrashed, gameState]);

  // ── Sell ─────────────────────────────────────────────────────────────────
  function sellCard() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const profit = currentPrice - buyPrice;
    const multiplier = currentPrice / buyPrice;
    const result: RoundResult = {
      card: currentCard,
      buyPrice,
      sellPrice: currentPrice,
      profit,
      multiplier,
      crashed: false,
    };

    const newResults = [...results, result];
    setResults(newResults);
    setGameState('sold');
  }

  // Handle crash result
  useEffect(() => {
    if (gameState === 'crashed' && !results.find(r => r.card === currentCard && r.crashed)) {
      const result: RoundResult = {
        card: currentCard,
        buyPrice,
        sellPrice: null,
        profit: -buyPrice,
        multiplier: 0,
        crashed: true,
      };
      setResults(prev => [...prev, result]);
    }
  }, [gameState, currentCard, buyPrice, results]);

  // ── Next Round / End Game ────────────────────────────────────────────────
  function nextRound() {
    if (round >= TOTAL_ROUNDS) {
      const totalProfit = results.reduce((s, r) => s + r.profit, 0);
      saveHighScore(totalProfit);
      setGameState('gameOver');
    } else {
      startRound(round, usedCardIndexes);
    }
  }

  // ── Computed Stats ───────────────────────────────────────────────────────
  const totalProfit = results.reduce((s, r) => s + r.profit, 0);
  const multiplier = buyPrice > 0 ? currentPrice / buyPrice : 1;
  const pctChange = buyPrice > 0 ? ((currentPrice - buyPrice) / buyPrice) * 100 : 0;

  // ── Mini Chart ───────────────────────────────────────────────────────────
  function MiniChart({ data }: { data: number[] }) {
    if (data.length < 2) return null;
    const min = Math.min(...data) * 0.95;
    const max = Math.max(...data) * 1.05;
    const range = max - min || 1;
    const w = 300;
    const h = 80;
    const points = data.map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    }).join(' ');

    const isUp = data[data.length - 1] >= data[0];
    const color = isUp ? '#10b981' : '#ef4444';

    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-20" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
        />
        {/* Buy line */}
        <line
          x1="0"
          y1={h - ((data[0] - min) / range) * h}
          x2={w}
          y2={h - ((data[0] - min) / range) * h}
          stroke="#6b7280"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
      </svg>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div>
      {/* ── Menu ─────────────────────────────────────────────────────── */}
      {gameState === 'menu' && (
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-6 sm:p-8 text-center">
          <div className="text-5xl mb-4">{'\uD83E\uDD54'}</div>
          <h2 className="text-2xl font-bold text-white mb-3">Card Hot Potato</h2>
          <p className="text-zinc-400 max-w-md mx-auto mb-6">
            Buy a card and watch the price climb. Sell before it crashes to lock in profit.
            Hold too long and you lose your entire investment. 10 rounds.
          </p>

          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-6 text-sm">
            <div className="bg-zinc-800/60 rounded-lg p-3">
              <div className="text-white font-bold">{TOTAL_ROUNDS}</div>
              <div className="text-zinc-500 text-xs">Rounds</div>
            </div>
            <div className="bg-zinc-800/60 rounded-lg p-3">
              <div className="text-emerald-400 font-bold">Sell</div>
              <div className="text-zinc-500 text-xs">Lock Profit</div>
            </div>
            <div className="bg-zinc-800/60 rounded-lg p-3">
              <div className="text-red-400 font-bold">Crash</div>
              <div className="text-zinc-500 text-xs">Lose All</div>
            </div>
          </div>

          {highScore > 0 && (
            <p className="text-sm text-amber-400 mb-4">
              Best Score: ${highScore.toLocaleString()}
            </p>
          )}

          <button
            onClick={startGame}
            className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-lg font-bold transition-colors"
          >
            Start Game
          </button>
        </div>
      )}

      {/* ── Buying Phase ─────────────────────────────────────────────── */}
      {gameState === 'buying' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-zinc-500">Round {round} of {TOTAL_ROUNDS}</span>
            <span className="text-sm text-zinc-400">
              Running P&L: <span className={totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                {totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString()}
              </span>
            </span>
          </div>

          <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-6 text-center">
            <div className="text-sm text-zinc-500 mb-2">Round {round} Card</div>
            <h3 className="text-lg font-bold text-white mb-1">{currentCard.name}</h3>
            <p className={`text-sm mb-4 ${SPORT_COLORS[currentCard.sport] || 'text-zinc-400'}`}>
              {currentCard.player} &middot; {currentCard.sport}
            </p>

            <div className="text-4xl font-bold text-white mb-2">${buyPrice.toLocaleString()}</div>
            <p className="text-sm text-zinc-500 mb-6">Buy Price</p>

            <button
              onClick={buyCard}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-lg font-bold transition-colors"
            >
              Buy This Card
            </button>

            <p className="text-xs text-zinc-600 mt-4">
              After buying, the price will start moving. Sell before it crashes!
            </p>
          </div>
        </div>
      )}

      {/* ── Watching / Active ────────────────────────────────────────── */}
      {gameState === 'watching' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-zinc-500">Round {round} of {TOTAL_ROUNDS}</span>
            <span className="text-sm text-zinc-400">
              Running P&L: <span className={totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                {totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString()}
              </span>
            </span>
          </div>

          <div className="bg-zinc-900/70 border border-red-800/30 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-white">{currentCard.player}</h3>
                <p className="text-xs text-zinc-500">{currentCard.name}</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-zinc-500">Bought at</div>
                <div className="text-sm text-zinc-400">${buyPrice.toLocaleString()}</div>
              </div>
            </div>

            {/* Price Display */}
            <div className="text-center mb-4">
              <div className={`text-5xl font-bold mb-1 ${pctChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                ${currentPrice.toLocaleString()}
              </div>
              <div className={`text-lg font-medium ${pctChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {pctChange >= 0 ? '+' : ''}{pctChange.toFixed(1)}% ({multiplier.toFixed(2)}x)
              </div>
              <div className={`text-sm font-bold ${currentPrice - buyPrice >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {currentPrice - buyPrice >= 0 ? '+' : ''}${(currentPrice - buyPrice).toLocaleString()} profit
              </div>
            </div>

            {/* Chart */}
            <div className="bg-zinc-950 rounded-lg p-2 mb-4">
              <MiniChart data={priceHistory} />
            </div>

            {/* Multiplier indicators */}
            <div className="flex justify-center gap-2 mb-6">
              {[1.5, 2, 2.5, 3, 4].map(m => (
                <span
                  key={m}
                  className={`text-xs px-2 py-1 rounded ${
                    multiplier >= m
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                      : 'bg-zinc-800/50 text-zinc-600'
                  }`}
                >
                  {m}x
                </span>
              ))}
            </div>

            {/* SELL BUTTON */}
            <button
              onClick={sellCard}
              className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xl font-bold transition-colors animate-pulse"
            >
              SELL NOW — ${currentPrice.toLocaleString()}
            </button>
            <p className="text-center text-xs text-red-400/60 mt-2">
              Sell before the crash!
            </p>
          </div>
        </div>
      )}

      {/* ── Sold ─────────────────────────────────────────────────────── */}
      {gameState === 'sold' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-zinc-500">Round {round} of {TOTAL_ROUNDS}</span>
            <span className="text-sm text-zinc-400">
              Running P&L: <span className={totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                {totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString()}
              </span>
            </span>
          </div>

          <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-6 text-center">
            <div className="text-4xl mb-3">{'\uD83D\uDCB0'}</div>
            <h3 className="text-xl font-bold text-emerald-400 mb-2">
              {currentPrice >= buyPrice ? 'Sold for Profit!' : 'Sold at a Loss'}
            </h3>
            <p className="text-white text-lg mb-1">{currentCard.player}</p>

            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto my-6">
              <div>
                <div className="text-xs text-zinc-500">Bought</div>
                <div className="text-white font-bold">${buyPrice.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500">Sold</div>
                <div className="text-emerald-400 font-bold">${currentPrice.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500">Profit</div>
                <div className={`font-bold ${currentPrice - buyPrice >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {currentPrice - buyPrice >= 0 ? '+' : ''}${(currentPrice - buyPrice).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="bg-zinc-950 rounded-lg p-2 mb-6">
              <MiniChart data={priceHistory} />
            </div>

            <button
              onClick={nextRound}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors"
            >
              {round >= TOTAL_ROUNDS ? 'See Final Results' : `Next Card (Round ${round + 1})`}
            </button>
          </div>
        </div>
      )}

      {/* ── Crashed ──────────────────────────────────────────────────── */}
      {gameState === 'crashed' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-zinc-500">Round {round} of {TOTAL_ROUNDS}</span>
            <span className="text-sm text-zinc-400">
              Running P&L: <span className={totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                {totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString()}
              </span>
            </span>
          </div>

          <div className="bg-red-950/30 border border-red-800/40 rounded-xl p-6 text-center">
            <div className="text-4xl mb-3">{'\uD83D\uDCA5'}</div>
            <h3 className="text-xl font-bold text-red-400 mb-2">CRASHED!</h3>
            <p className="text-white text-lg mb-1">{currentCard.player}</p>
            <p className="text-sm text-zinc-500 mb-4">You held too long. Investment lost.</p>

            <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto my-6">
              <div>
                <div className="text-xs text-zinc-500">Invested</div>
                <div className="text-white font-bold">${buyPrice.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500">Lost</div>
                <div className="text-red-400 font-bold">-${buyPrice.toLocaleString()}</div>
              </div>
            </div>

            <div className="bg-zinc-950 rounded-lg p-2 mb-6">
              <MiniChart data={priceHistory} />
            </div>

            <button
              onClick={nextRound}
              className="px-8 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl font-bold transition-colors"
            >
              {round >= TOTAL_ROUNDS ? 'See Final Results' : `Next Card (Round ${round + 1})`}
            </button>
          </div>
        </div>
      )}

      {/* ── Game Over ────────────────────────────────────────────────── */}
      {gameState === 'gameOver' && (
        <div>
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-6 sm:p-8 text-center mb-6">
            <div className="text-4xl mb-3">{totalProfit >= 0 ? '\uD83C\uDFC6' : '\uD83D\uDCB8'}</div>
            <h2 className="text-2xl font-bold text-white mb-2">Game Over</h2>

            <div className={`text-4xl font-bold mb-2 ${totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString()}
            </div>
            <p className="text-sm text-zinc-500 mb-1">Total Profit</p>

            {totalProfit > highScore && (
              <p className="text-amber-400 text-sm font-medium mt-2">New High Score!</p>
            )}

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto my-6">
              <div className="bg-zinc-800/60 rounded-lg p-3">
                <div className="text-lg font-bold text-emerald-400">
                  {results.filter(r => !r.crashed && r.profit >= 0).length}
                </div>
                <div className="text-xs text-zinc-500">Profitable</div>
              </div>
              <div className="bg-zinc-800/60 rounded-lg p-3">
                <div className="text-lg font-bold text-red-400">
                  {results.filter(r => r.crashed).length}
                </div>
                <div className="text-xs text-zinc-500">Crashed</div>
              </div>
              <div className="bg-zinc-800/60 rounded-lg p-3">
                <div className="text-lg font-bold text-amber-400">
                  {results.length > 0 ? Math.max(...results.filter(r => !r.crashed).map(r => r.multiplier || 0)).toFixed(1) : '0.0'}x
                </div>
                <div className="text-xs text-zinc-500">Best Multi</div>
              </div>
            </div>
          </div>

          {/* Round-by-round results */}
          <div className="space-y-2 mb-8">
            <h3 className="text-sm font-semibold text-zinc-400 mb-3">Round-by-Round Results</h3>
            {results.map((r, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-4 py-3 rounded-lg ${
                  r.crashed ? 'bg-red-950/20 border border-red-900/30' : 'bg-zinc-900/60 border border-zinc-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-zinc-600 text-xs w-6">R{i + 1}</span>
                  <div>
                    <div className="text-sm text-white font-medium">{r.card.player}</div>
                    <div className="text-xs text-zinc-500">{r.card.sport}</div>
                  </div>
                </div>
                <div className="text-right">
                  {r.crashed ? (
                    <div className="text-red-400 text-sm font-bold">CRASHED -${r.buyPrice.toLocaleString()}</div>
                  ) : (
                    <div>
                      <div className={`text-sm font-bold ${r.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {r.profit >= 0 ? '+' : ''}${r.profit.toLocaleString()}
                      </div>
                      <div className="text-xs text-zinc-500">{r.multiplier.toFixed(2)}x</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Verdict */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 mb-6 text-center">
            <h3 className="font-semibold text-white mb-2">
              {totalProfit >= 2000 ? 'Market Genius!' :
               totalProfit >= 500 ? 'Solid Trader' :
               totalProfit >= 0 ? 'Cautious Player' :
               totalProfit >= -500 ? 'Rough Day' :
               'Diamond Hands Gone Wrong'}
            </h3>
            <p className="text-sm text-zinc-400">
              {totalProfit >= 2000 ? 'You have incredible market timing instincts. You know when to take profits.' :
               totalProfit >= 500 ? 'Good discipline — you took profits consistently without being too greedy.' :
               totalProfit >= 0 ? 'You played it safe. Try holding a bit longer for bigger gains next time.' :
               totalProfit >= -500 ? 'A few costly crashes. Remember: a bird in the hand is worth two in the bush.' :
               'You held too long too often. In card markets, taking profits early beats waiting for the moonshot.'}
            </p>
          </div>

          <div className="text-center">
            <button
              onClick={startGame}
              className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

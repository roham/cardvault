'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { sportsCards } from '@/data/sports-cards';

const TOTAL_SPINS = 20;
const STARTING_BUDGET = 500;
const TIMER_SECONDS = 5;
const STORAGE_KEY = 'cardvault_card_roulette';

interface GameCard {
  name: string;
  player: string;
  sport: string;
  year: number;
  marketValue: number;
  askingPrice: number;
  isDeal: boolean;
}

interface GameState {
  status: 'idle' | 'spinning' | 'showing' | 'timeout' | 'result' | 'gameover';
  budget: number;
  spin: number;
  collected: GameCard[];
  passed: GameCard[];
  currentCard: GameCard | null;
  timer: number;
}

interface HighScore {
  score: number;
  date: string;
  collected: number;
  budget: number;
}

function parseValue(est: string): number {
  const match = est.match(/\$([0-9,]+)/);
  if (!match) return 5;
  return parseInt(match[1].replace(/,/g, ''), 10) || 5;
}

function getRandomCard(seed: number): GameCard {
  const idx = Math.abs(seed) % sportsCards.length;
  const card = sportsCards[idx];
  const mv = parseValue(card.estimatedValueRaw || '$5');
  // Randomize asking price: 60-140% of market value
  const priceMult = 0.6 + (((seed * 7919) % 800) / 1000);
  const askingPrice = Math.max(1, Math.round(mv * priceMult));
  return {
    name: card.name,
    player: card.player,
    sport: card.sport,
    year: card.year,
    marketValue: mv,
    askingPrice,
    isDeal: askingPrice < mv,
  };
}

function fmt(n: number): string {
  return n < 0 ? `-$${Math.abs(n).toFixed(0)}` : `$${n.toFixed(0)}`;
}

function loadHighScore(): HighScore | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveHighScore(hs: HighScore) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(hs)); } catch {}
}

export default function CardRouletteClient() {
  const [game, setGame] = useState<GameState>({
    status: 'idle',
    budget: STARTING_BUDGET,
    spin: 0,
    collected: [],
    passed: [],
    currentCard: null,
    timer: TIMER_SECONDS,
  });
  const [highScore, setHighScore] = useState<HighScore | null>(null);
  const [spinAnim, setSpinAnim] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { setHighScore(loadHighScore()); }, []);

  // Timer
  useEffect(() => {
    if (game.status === 'showing') {
      timerRef.current = setInterval(() => {
        setGame(prev => {
          if (prev.timer <= 1) {
            // Time ran out — auto-pass
            return {
              ...prev,
              status: prev.spin >= TOTAL_SPINS ? 'gameover' : 'timeout',
              passed: prev.currentCard ? [...prev.passed, prev.currentCard] : prev.passed,
              timer: 0,
            };
          }
          return { ...prev, timer: prev.timer - 1 };
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [game.status]);

  const totalCollectedValue = useMemo(() => game.collected.reduce((s, c) => s + c.marketValue, 0), [game.collected]);
  const totalSpent = useMemo(() => game.collected.reduce((s, c) => s + c.askingPrice, 0), [game.collected]);
  const score = totalCollectedValue - totalSpent;

  const spin = useCallback(() => {
    if (game.spin >= TOTAL_SPINS || game.budget <= 0) {
      setGame(prev => ({ ...prev, status: 'gameover' }));
      return;
    }

    const nextSpin = game.spin + 1;
    const seed = Date.now() + nextSpin * 1337;
    const card = getRandomCard(seed);

    // Spin animation
    setSpinAnim(true);
    setGame(prev => ({ ...prev, status: 'spinning', spin: nextSpin }));

    setTimeout(() => {
      setSpinAnim(false);
      setGame(prev => ({
        ...prev,
        status: 'showing',
        currentCard: card,
        timer: TIMER_SECONDS,
      }));
    }, 800);
  }, [game.spin, game.budget]);

  const buy = useCallback(() => {
    if (!game.currentCard || game.status !== 'showing') return;
    if (timerRef.current) clearInterval(timerRef.current);

    const newBudget = game.budget - game.currentCard.askingPrice;
    const newCollected = [...game.collected, game.currentCard];
    const isGameOver = game.spin >= TOTAL_SPINS || newBudget <= 0;

    setGame(prev => ({
      ...prev,
      status: isGameOver ? 'gameover' : 'result',
      budget: newBudget,
      collected: newCollected,
      timer: 0,
    }));
  }, [game]);

  const pass = useCallback(() => {
    if (!game.currentCard || game.status !== 'showing') return;
    if (timerRef.current) clearInterval(timerRef.current);

    const isGameOver = game.spin >= TOTAL_SPINS;
    setGame(prev => ({
      ...prev,
      status: isGameOver ? 'gameover' : 'result',
      passed: [...prev.passed, prev.currentCard!],
      timer: 0,
    }));
  }, [game]);

  const newGame = useCallback(() => {
    // Check high score
    if (score > (highScore?.score ?? 0)) {
      const hs: HighScore = { score, date: new Date().toISOString().split('T')[0], collected: game.collected.length, budget: game.budget };
      saveHighScore(hs);
      setHighScore(hs);
    }
    setGame({
      status: 'idle',
      budget: STARTING_BUDGET,
      spin: 0,
      collected: [],
      passed: [],
      currentCard: null,
      timer: TIMER_SECONDS,
    });
  }, [score, highScore, game.collected.length, game.budget]);

  // Game Over
  useEffect(() => {
    if (game.status === 'gameover' && score > (highScore?.score ?? 0)) {
      const hs: HighScore = { score, date: new Date().toISOString().split('T')[0], collected: game.collected.length, budget: game.budget };
      saveHighScore(hs);
      setHighScore(hs);
    }
  }, [game.status, score, highScore, game.collected.length, game.budget]);

  return (
    <div className="space-y-6">
      {/* Status Bar */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-white">{game.spin}/{TOTAL_SPINS}</div>
          <div className="text-xs text-gray-500">Spin</div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-3 text-center">
          <div className={`text-lg font-bold ${game.budget < 50 ? 'text-red-400' : 'text-emerald-400'}`}>{fmt(game.budget)}</div>
          <div className="text-xs text-gray-500">Budget</div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-amber-400">{game.collected.length}</div>
          <div className="text-xs text-gray-500">Collected</div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-3 text-center">
          <div className={`text-lg font-bold ${score >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(score)}</div>
          <div className="text-xs text-gray-500">Score</div>
        </div>
      </div>

      {/* High Score */}
      {highScore && (
        <div className="text-center text-sm text-gray-500">
          High Score: <span className="text-amber-400 font-medium">{fmt(highScore.score)}</span> ({highScore.collected} cards, {highScore.date})
        </div>
      )}

      {/* Main Game Area */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 min-h-[300px] flex items-center justify-center">
        {game.status === 'idle' && (
          <div className="text-center">
            <div className="text-6xl mb-4">🎰</div>
            <h2 className="text-2xl font-bold text-white mb-2">Ready to Spin?</h2>
            <p className="text-gray-400 mb-6">20 spins. $500 budget. 5 seconds per card. Build the best collection.</p>
            <button
              onClick={spin}
              className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-lg transition-colors"
            >
              Start Game
            </button>
          </div>
        )}

        {game.status === 'spinning' && (
          <div className="text-center">
            <div className={`text-6xl ${spinAnim ? 'animate-bounce' : ''}`}>🎰</div>
            <p className="text-gray-400 mt-4 animate-pulse">Spinning...</p>
          </div>
        )}

        {(game.status === 'showing' || game.status === 'timeout') && game.currentCard && (
          <div className="w-full">
            {/* Timer */}
            {game.status === 'showing' && (
              <div className="flex justify-center mb-4">
                <div className={`text-3xl font-bold ${game.timer <= 2 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                  {game.timer}s
                </div>
              </div>
            )}

            {/* Card Display */}
            <div className="bg-gray-900/80 border border-gray-600 rounded-xl p-6 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 uppercase tracking-wider">{game.currentCard.sport} &middot; {game.currentCard.year}</span>
                <span className="text-xs text-gray-500">Spin {game.spin}/{TOTAL_SPINS}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">{game.currentCard.player}</h3>
              <p className="text-sm text-gray-400 mb-4">{game.currentCard.name}</p>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">Asking Price</div>
                  <div className="text-2xl font-bold text-white">{fmt(game.currentCard.askingPrice)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Market Value</div>
                  <div className="text-lg text-gray-400">{fmt(game.currentCard.marketValue)}</div>
                </div>
                <div>
                  {game.currentCard.isDeal ? (
                    <span className="px-3 py-1 bg-emerald-900/50 text-emerald-400 border border-emerald-800/50 rounded-full text-sm font-medium">DEAL</span>
                  ) : (
                    <span className="px-3 py-1 bg-red-900/50 text-red-400 border border-red-800/50 rounded-full text-sm font-medium">OVERPRICED</span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            {game.status === 'showing' && (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={buy}
                  disabled={game.currentCard.askingPrice > game.budget}
                  className="py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-xl text-lg transition-colors"
                >
                  BUY {fmt(game.currentCard.askingPrice)}
                </button>
                <button
                  onClick={pass}
                  className="py-4 bg-red-600/80 hover:bg-red-500/80 text-white font-bold rounded-xl text-lg transition-colors"
                >
                  PASS
                </button>
              </div>
            )}

            {game.status === 'timeout' && (
              <div className="text-center">
                <p className="text-red-400 font-medium mb-3">Time&apos;s up! Auto-passed.</p>
                <button onClick={spin} className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-medium transition-colors">
                  Next Spin
                </button>
              </div>
            )}
          </div>
        )}

        {game.status === 'result' && (
          <div className="text-center">
            <div className="text-4xl mb-2">{game.collected.length > 0 && game.collected[game.collected.length - 1] === game.currentCard ? '✅' : '⏭️'}</div>
            <p className="text-gray-400 mb-4">
              {game.spin < TOTAL_SPINS ? `${TOTAL_SPINS - game.spin} spins remaining` : 'Last spin!'}
            </p>
            <button onClick={spin} className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-lg transition-colors">
              {game.spin < TOTAL_SPINS ? 'Spin Again' : 'See Results'}
            </button>
          </div>
        )}

        {game.status === 'gameover' && (
          <div className="w-full text-center">
            <div className="text-5xl mb-4">{score > 0 ? '🏆' : '💸'}</div>
            <h2 className="text-2xl font-bold text-white mb-2">Game Over!</h2>
            <div className="grid grid-cols-3 gap-4 my-6">
              <div className="bg-gray-900/50 rounded-xl p-4">
                <div className={`text-2xl font-bold ${score >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(score)}</div>
                <div className="text-xs text-gray-500">Final Score</div>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-4">
                <div className="text-2xl font-bold text-amber-400">{game.collected.length}</div>
                <div className="text-xs text-gray-500">Cards Collected</div>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-4">
                <div className="text-2xl font-bold text-white">{fmt(game.budget)}</div>
                <div className="text-xs text-gray-500">Budget Left</div>
              </div>
            </div>

            {score > 0 && score === (highScore?.score ?? 0) && (
              <p className="text-amber-400 font-medium mb-4">New High Score!</p>
            )}

            {/* Collected Cards */}
            {game.collected.length > 0 && (
              <div className="mb-6 text-left">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Your Collection</h3>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {game.collected.map((c, i) => (
                    <div key={i} className="flex items-center justify-between text-sm bg-gray-900/50 rounded-lg px-3 py-2">
                      <span className="text-white truncate flex-1">{c.player} ({c.year})</span>
                      <span className="text-gray-400 ml-2">Paid {fmt(c.askingPrice)}</span>
                      <span className={`ml-2 font-medium ${c.marketValue > c.askingPrice ? 'text-emerald-400' : 'text-red-400'}`}>
                        Worth {fmt(c.marketValue)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={newGame} className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-lg transition-colors">
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

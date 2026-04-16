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

interface OwnedCard {
  slug: string;
  name: string;
  player: string;
  sport: string;
  boughtAt: number;
  currentValue: number;
}

interface MarketCard {
  slug: string;
  name: string;
  player: string;
  sport: string;
  baseValue: number;
  currentPrice: number;
  trend: number; // % change
}

const TOTAL_ROUNDS = 10;
const STARTING_CASH = 500;
const CARDS_PER_ROUND = 3;

export default function CardTycoonClient() {
  const [mode, setMode] = useState<'menu' | 'playing' | 'done'>('menu');
  const [isDaily, setIsDaily] = useState(true);
  const [round, setRound] = useState(1);
  const [cash, setCash] = useState(STARTING_CASH);
  const [portfolio, setPortfolio] = useState<OwnedCard[]>([]);
  const [marketCards, setMarketCards] = useState<MarketCard[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [rng, setRng] = useState<() => number>(() => () => 0);

  const validCards = useMemo(() =>
    sportsCards.filter(c => {
      const v = parseValue(c.estimatedValueRaw);
      return v >= 5 && v <= 500;
    }), []);

  const generateMarketCards = useCallback((rngFn: () => number, roundNum: number): MarketCard[] => {
    const cards: MarketCard[] = [];
    const used = new Set<number>();
    for (let i = 0; i < CARDS_PER_ROUND; i++) {
      let idx = Math.floor(rngFn() * validCards.length);
      while (used.has(idx)) idx = (idx + 1) % validCards.length;
      used.add(idx);
      const card = validCards[idx];
      const baseValue = parseValue(card.estimatedValueRaw);
      const fluctuation = roundNum > 1 ? (rngFn() - 0.45) * 0.4 : 0; // slight upward bias
      const currentPrice = Math.max(1, Math.round(baseValue * (1 + fluctuation)));
      cards.push({
        slug: card.slug,
        name: card.name,
        player: card.player,
        sport: card.sport,
        baseValue,
        currentPrice,
        trend: Math.round(fluctuation * 100),
      });
    }
    return cards;
  }, [validCards]);

  const startGame = useCallback((daily: boolean) => {
    const seed = daily ? dateHash() : Math.floor(Math.random() * 1000000);
    const rngFn = seededRng(seed);
    setRng(() => rngFn);
    setIsDaily(daily);
    setRound(1);
    setCash(STARTING_CASH);
    setPortfolio([]);
    setHistory([]);
    setMode('playing');
    setMarketCards(generateMarketCards(rngFn, 1));
  }, [generateMarketCards]);

  const buyCard = (card: MarketCard) => {
    if (cash < card.currentPrice) return;
    setCash(prev => prev - card.currentPrice);
    setPortfolio(prev => [...prev, {
      slug: card.slug,
      name: card.name,
      player: card.player,
      sport: card.sport,
      boughtAt: card.currentPrice,
      currentValue: card.currentPrice,
    }]);
    setHistory(prev => [...prev, `R${round}: Bought ${card.player} for $${card.currentPrice}`]);
  };

  const sellCard = (index: number) => {
    const card = portfolio[index];
    const sellPrice = card.currentValue;
    setCash(prev => prev + sellPrice);
    setHistory(prev => [...prev, `R${round}: Sold ${card.player} for $${sellPrice} (${sellPrice >= card.boughtAt ? '+' : ''}$${sellPrice - card.boughtAt})`]);
    setPortfolio(prev => prev.filter((_, i) => i !== index));
  };

  const nextRound = () => {
    if (round >= TOTAL_ROUNDS) {
      setMode('done');
      return;
    }
    const newRound = round + 1;
    setRound(newRound);

    // Update portfolio card values with market fluctuation
    setPortfolio(prev => prev.map(card => {
      const change = (rng() - 0.45) * 0.3;
      const newValue = Math.max(1, Math.round(card.currentValue * (1 + change)));
      return { ...card, currentValue: newValue };
    }));

    setMarketCards(generateMarketCards(rng, newRound));
  };

  const portfolioValue = portfolio.reduce((sum, c) => sum + c.currentValue, 0);
  const totalValue = cash + portfolioValue;
  const totalProfit = totalValue - STARTING_CASH;
  const roi = ((totalProfit / STARTING_CASH) * 100).toFixed(1);

  const getGrade = () => {
    if (totalProfit >= 200) return { grade: 'S', label: 'Card Mogul', color: 'text-amber-400' };
    if (totalProfit >= 100) return { grade: 'A', label: 'Smart Investor', color: 'text-green-400' };
    if (totalProfit >= 50) return { grade: 'B', label: 'Savvy Trader', color: 'text-blue-400' };
    if (totalProfit >= 0) return { grade: 'C', label: 'Careful Collector', color: 'text-gray-400' };
    if (totalProfit >= -100) return { grade: 'D', label: 'Learning Curve', color: 'text-orange-400' };
    return { grade: 'F', label: 'Bust', color: 'text-red-400' };
  };

  const shareText = mode === 'done'
    ? `Card Tycoon ${isDaily ? '(Daily)' : ''}: $${STARTING_CASH} -> $${totalValue} (${totalProfit >= 0 ? '+' : ''}${roi}% ROI)\nGrade: ${getGrade().grade} - ${getGrade().label}\nPlay at cardvault-two.vercel.app/card-tycoon`
    : '';

  // Menu
  if (mode === 'menu') {
    return (
      <div className="space-y-6">
        <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-3">How to Play</h2>
          <div className="space-y-2 text-gray-400 text-sm">
            <p>You start with <span className="text-green-400 font-bold">${STARTING_CASH}</span> in cash.</p>
            <p>Each round, the market shows {CARDS_PER_ROUND} cards with current prices.</p>
            <p><span className="text-green-400">BUY</span> cards you think will go up. <span className="text-red-400">SELL</span> from your portfolio when prices peak.</p>
            <p>Card prices fluctuate each round &mdash; some go up, some go down.</p>
            <p>After <span className="text-amber-400 font-bold">{TOTAL_ROUNDS} rounds</span>, your total value (cash + portfolio) is your final score.</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <button
            onClick={() => startGame(true)}
            className="p-6 bg-gradient-to-r from-amber-950/60 to-gray-900/80 border border-amber-800/40 rounded-xl hover:border-amber-600/60 transition-colors text-left"
          >
            <div className="text-lg font-bold text-amber-400 mb-1">Daily Challenge</div>
            <div className="text-sm text-gray-400">Same market for everyone today. Compare scores!</div>
          </button>
          <button
            onClick={() => startGame(false)}
            className="p-6 bg-gradient-to-r from-purple-950/60 to-gray-900/80 border border-purple-800/40 rounded-xl hover:border-purple-600/60 transition-colors text-left"
          >
            <div className="text-lg font-bold text-purple-400 mb-1">Random Market</div>
            <div className="text-sm text-gray-400">Fresh market each game. Practice your strategy.</div>
          </button>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { href: '/tools/flip-calc', label: 'Flip Calculator', desc: 'Real flip profit math' },
            { href: '/tools/flip-scorer', label: 'Flip Scorer', desc: 'Rate card flippability' },
            { href: '/tools/investment-calc', label: 'Investment Calc', desc: 'Annualized returns' },
          ].map(t => (
            <Link key={t.href} href={t.href} className="p-3 bg-gray-900/80 hover:bg-gray-800 border border-gray-800 rounded-lg transition-colors">
              <div className="text-sm font-medium text-amber-400">{t.label}</div>
              <div className="text-xs text-gray-500">{t.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Game Over
  if (mode === 'done') {
    const grade = getGrade();
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-amber-950/60 to-gray-900/80 border border-amber-800/40 rounded-xl p-6 text-center">
          <div className={`text-6xl font-bold ${grade.color} mb-2`}>{grade.grade}</div>
          <div className="text-xl font-bold text-white mb-1">{grade.label}</div>
          <div className="text-gray-400 text-sm">
            {isDaily ? 'Daily Challenge' : 'Random Market'} &mdash; {TOTAL_ROUNDS} Rounds
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Final Value', value: `$${totalValue}`, color: totalProfit >= 0 ? 'text-green-400' : 'text-red-400' },
            { label: 'Starting Cash', value: `$${STARTING_CASH}`, color: 'text-gray-400' },
            { label: 'Profit/Loss', value: `${totalProfit >= 0 ? '+' : ''}$${totalProfit}`, color: totalProfit >= 0 ? 'text-green-400' : 'text-red-400' },
            { label: 'ROI', value: `${totalProfit >= 0 ? '+' : ''}${roi}%`, color: totalProfit >= 0 ? 'text-green-400' : 'text-red-400' },
          ].map(s => (
            <div key={s.label} className="bg-gray-900/80 border border-gray-800 rounded-lg p-3 text-center">
              <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {portfolio.length > 0 && (
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4">
            <h3 className="text-sm font-bold text-white mb-3">Remaining Portfolio</h3>
            {portfolio.map((card, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0 text-sm">
                <div className="flex items-center gap-2">
                  <span className={`${SPORT_COLORS[card.sport] || 'text-gray-400'}`}>{card.player}</span>
                </div>
                <div className="text-right">
                  <span className={card.currentValue >= card.boughtAt ? 'text-green-400' : 'text-red-400'}>
                    ${card.currentValue}
                  </span>
                  <span className="text-gray-600 text-xs ml-1">(paid ${card.boughtAt})</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {history.length > 0 && (
          <details className="bg-gray-900/80 border border-gray-800 rounded-xl">
            <summary className="px-4 py-3 text-sm font-medium text-gray-300 cursor-pointer">Trade History ({history.length} trades)</summary>
            <div className="px-4 pb-4 space-y-1">
              {history.map((h, i) => (
                <div key={i} className="text-xs text-gray-500">{h}</div>
              ))}
            </div>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigator.clipboard.writeText(shareText)}
            className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm rounded-lg transition-colors"
          >
            Copy Results
          </button>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-2.5 bg-blue-900/60 hover:bg-blue-900/80 border border-blue-700/50 text-blue-300 text-sm rounded-lg transition-colors text-center"
          >
            Share on X
          </a>
          <button
            onClick={() => setMode('menu')}
            className="flex-1 px-4 py-2.5 bg-amber-900/60 hover:bg-amber-900/80 border border-amber-700/50 text-amber-300 text-sm rounded-lg transition-colors"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  // Playing
  return (
    <div className="space-y-6">
      {/* Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Round', value: `${round}/${TOTAL_ROUNDS}`, color: 'text-amber-400' },
          { label: 'Cash', value: `$${cash}`, color: 'text-green-400' },
          { label: 'Portfolio', value: `$${portfolioValue}`, color: 'text-blue-400' },
          { label: 'Total', value: `$${totalValue}`, color: totalProfit >= 0 ? 'text-green-400' : 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-gray-900/80 border border-gray-800 rounded-lg p-3 text-center">
            <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Market */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Market &mdash; Round {round}</h3>
          <span className="text-xs text-gray-500">{CARDS_PER_ROUND} cards available</span>
        </div>
        <div className="space-y-3">
          {marketCards.map(card => {
            const canAfford = cash >= card.currentPrice;
            const isGood = card.trend > 5;
            const isBad = card.trend < -5;
            return (
              <div key={card.slug} className={`flex items-center gap-3 p-3 border rounded-lg ${SPORT_BG[card.sport] || 'bg-gray-800 border-gray-700'}`}>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{card.player}</div>
                  <div className="text-xs text-gray-500 truncate">{card.name}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-white">${card.currentPrice}</div>
                  {card.trend !== 0 && (
                    <div className={`text-xs ${isGood ? 'text-green-400' : isBad ? 'text-red-400' : 'text-gray-500'}`}>
                      {card.trend > 0 ? '+' : ''}{card.trend}%
                    </div>
                  )}
                </div>
                <button
                  onClick={() => buyCard(card)}
                  disabled={!canAfford}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 ${canAfford ? 'bg-green-800/60 hover:bg-green-700/60 text-green-300 border border-green-700/50' : 'bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed'}`}
                >
                  Buy
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Portfolio */}
      {portfolio.length > 0 && (
        <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-bold text-white mb-3">Your Portfolio ({portfolio.length} cards)</h3>
          <div className="space-y-2">
            {portfolio.map((card, i) => {
              const pnl = card.currentValue - card.boughtAt;
              const pnlPct = ((pnl / card.boughtAt) * 100).toFixed(0);
              return (
                <div key={i} className="flex items-center gap-3 p-2 bg-gray-800/60 border border-gray-700/50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${SPORT_COLORS[card.sport] || 'text-gray-300'}`}>{card.player}</div>
                    <div className="text-xs text-gray-500">Paid ${card.boughtAt}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-white">${card.currentValue}</div>
                    <div className={`text-xs ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {pnl >= 0 ? '+' : ''}{pnlPct}%
                    </div>
                  </div>
                  <button
                    onClick={() => sellCard(i)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-900/60 hover:bg-red-800/60 text-red-300 border border-red-700/50 transition-colors shrink-0"
                  >
                    Sell
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={nextRound}
          className="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg transition-colors"
        >
          {round >= TOTAL_ROUNDS ? 'Finish Game' : `Next Round (${round + 1}/${TOTAL_ROUNDS})`}
        </button>
      </div>
    </div>
  );
}

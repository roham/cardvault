'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { sportsCards } from '@/data/sports-cards';

interface TickerItem {
  player: string;
  name: string;
  sport: string;
  basePrice: number;
  change: number;
  changePct: number;
  currentPrice: number;
}

function parseValue(est: string): number {
  const m = est.match(/\$([0-9,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) || 5 : 5;
}

function hashSeed(str: string, n: number): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h + n);
}

function generateTickerItems(seed: number, count: number): TickerItem[] {
  const items: TickerItem[] = [];
  const used = new Set<number>();

  for (let i = 0; i < count; i++) {
    let idx: number;
    do {
      idx = hashSeed(String(seed + i), i * 31 + 7) % sportsCards.length;
    } while (used.has(idx));
    used.add(idx);

    const card = sportsCards[idx];
    const basePrice = parseValue(card.estimatedValueRaw || '$5');
    // Deterministic change: -8% to +8%
    const changeBasis = ((hashSeed(card.slug, seed) % 1600) - 800) / 10000;
    const change = Math.round(basePrice * changeBasis * 100) / 100;
    const changePct = basePrice > 0 ? (change / basePrice) * 100 : 0;

    items.push({
      player: card.player,
      name: card.name,
      sport: card.sport,
      basePrice,
      change,
      changePct,
      currentPrice: basePrice + change,
    });
  }
  return items;
}

function fmt(n: number): string {
  return n < 0 ? `-$${Math.abs(n).toFixed(2)}` : `$${n.toFixed(2)}`;
}

function ChangeIndicator({ change, pct }: { change: number; pct: number }) {
  if (Math.abs(pct) < 0.1) return <span className="text-gray-500">—</span>;
  const isUp = change > 0;
  return (
    <span className={`font-medium ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
      {isUp ? '▲' : '▼'} {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

export default function LiveTickerClient() {
  const [seed, setSeed] = useState(0);
  const [tickerOffset, setTickerOffset] = useState(0);
  const tickerRef = useRef<HTMLDivElement>(null);

  // Initialize with current date hash
  useEffect(() => {
    const now = new Date();
    const dateSeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
    setSeed(dateSeed + Math.floor(now.getHours() / 2)); // Changes every 2 hours
  }, []);

  // Scroll ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerOffset(prev => prev + 1);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const allItems = useMemo(() => seed > 0 ? generateTickerItems(seed, 50) : [], [seed]);

  const scrollingItems = useMemo(() => {
    // Create doubled array for seamless scrolling
    return [...allItems.slice(0, 20), ...allItems.slice(0, 20)];
  }, [allItems]);

  const biggestGainers = useMemo(() =>
    [...allItems].sort((a, b) => b.changePct - a.changePct).slice(0, 5), [allItems]);

  const biggestLosers = useMemo(() =>
    [...allItems].sort((a, b) => a.changePct - b.changePct).slice(0, 5), [allItems]);

  const sportBreakdown = useMemo(() => {
    const sports: Record<string, { up: number; down: number; flat: number }> = {};
    allItems.forEach(item => {
      if (!sports[item.sport]) sports[item.sport] = { up: 0, down: 0, flat: 0 };
      if (item.changePct > 0.1) sports[item.sport].up++;
      else if (item.changePct < -0.1) sports[item.sport].down++;
      else sports[item.sport].flat++;
    });
    return sports;
  }, [allItems]);

  const alerts = useMemo(() => {
    const a: string[] = [];
    const bigMoves = allItems.filter(i => Math.abs(i.changePct) > 3);
    if (bigMoves.length > 0) a.push(`${bigMoves.length} cards showing 3%+ movement today`);
    const rookiesMoV = allItems.filter(i => i.name.toLowerCase().includes('rc') && Math.abs(i.changePct) > 1);
    if (rookiesMoV.length > 0) a.push(`${rookiesMoV.length} rookie cards with significant price changes`);
    const ups = allItems.filter(i => i.changePct > 0).length;
    const downs = allItems.filter(i => i.changePct < 0).length;
    a.push(`Market sentiment: ${ups > downs ? 'Bullish' : ups < downs ? 'Bearish' : 'Neutral'} (${ups} up / ${downs} down)`);
    return a;
  }, [allItems]);

  if (seed === 0) return <div className="text-center py-12 text-gray-500">Loading ticker...</div>;

  return (
    <div className="space-y-6">
      {/* Scrolling Ticker Bar */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
        <div className="flex items-center bg-red-900/30 border-b border-gray-700 px-4 py-1.5">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />
          <span className="text-red-400 text-xs font-bold uppercase tracking-wider">Live Ticker</span>
        </div>
        <div className="overflow-hidden relative h-10" ref={tickerRef}>
          <div
            className="flex items-center gap-8 absolute whitespace-nowrap h-full"
            style={{ transform: `translateX(-${tickerOffset % 3000}px)` }}
          >
            {scrollingItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="text-gray-400 font-medium">{item.player}</span>
                <span className="text-white">{fmt(item.currentPrice)}</span>
                <ChangeIndicator change={item.change} pct={item.changePct} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Market Alerts */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <h3 className="text-sm font-bold text-yellow-400 mb-2 flex items-center gap-2">
          <span>⚠️</span> Market Alerts
        </h3>
        <div className="space-y-1">
          {alerts.map((a, i) => (
            <div key={i} className="text-sm text-gray-400 flex items-start gap-2">
              <span className="text-gray-600">&bull;</span>
              {a}
            </div>
          ))}
        </div>
      </div>

      {/* Biggest Movers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Gainers */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <h3 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2">
            <span>📈</span> Biggest Gainers
          </h3>
          <div className="space-y-2">
            {biggestGainers.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium truncate">{item.player}</div>
                  <div className="text-xs text-gray-500">{item.sport} &middot; {fmt(item.currentPrice)}</div>
                </div>
                <span className="text-emerald-400 font-bold ml-2">+{item.changePct.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Losers */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <h3 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2">
            <span>📉</span> Biggest Decliners
          </h3>
          <div className="space-y-2">
            {biggestLosers.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium truncate">{item.player}</div>
                  <div className="text-xs text-gray-500">{item.sport} &middot; {fmt(item.currentPrice)}</div>
                </div>
                <span className="text-red-400 font-bold ml-2">{item.changePct.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sport Breakdown */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <h3 className="text-sm font-bold text-white mb-3">Market by Sport</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(sportBreakdown).map(([sport, data]) => (
            <div key={sport} className="bg-gray-900/50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 capitalize mb-1">{sport}</div>
              <div className="flex items-center justify-center gap-2 text-xs">
                <span className="text-emerald-400">{data.up}↑</span>
                <span className="text-gray-500">{data.flat}—</span>
                <span className="text-red-400">{data.down}↓</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Ticker Table */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <h3 className="text-sm font-bold text-white mb-3">All Tracked Cards ({allItems.length})</h3>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-800">
              <tr className="text-gray-500 text-xs">
                <th className="text-left pb-2 font-medium">Player</th>
                <th className="text-left pb-2 font-medium">Sport</th>
                <th className="text-right pb-2 font-medium">Price</th>
                <th className="text-right pb-2 font-medium">Change</th>
                <th className="text-right pb-2 font-medium">%</th>
              </tr>
            </thead>
            <tbody>
              {allItems.map((item, i) => (
                <tr key={i} className="border-t border-gray-700/30">
                  <td className="py-2 text-white truncate max-w-[200px]">{item.player}</td>
                  <td className="py-2 text-gray-500 capitalize">{item.sport}</td>
                  <td className="py-2 text-right text-white">{fmt(item.currentPrice)}</td>
                  <td className={`py-2 text-right ${item.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{item.change >= 0 ? '+' : ''}{fmt(item.change)}</td>
                  <td className="py-2 text-right"><ChangeIndicator change={item.change} pct={item.changePct} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

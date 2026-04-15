'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

interface Alert {
  id: string;
  cardSlug: string;
  cardName: string;
  player: string;
  sport: string;
  targetPrice: number;
  type: 'buy' | 'sell';
  rawValue: number;
  gemValue: number;
  ebayUrl: string;
  createdAt: string;
}

function parseValue(s: string): number {
  const m = s.match(/\$([0-9,.]+)/);
  if (!m) return 0;
  return parseFloat(m[1].replace(/,/g, '')) || 0;
}

function fmt(n: number): string {
  if (n >= 10000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

function getStrategy(targetPrice: number, marketValue: number): { label: string; desc: string; color: string; emoji: string } {
  if (marketValue <= 0) return { label: 'Unknown', desc: 'No market data available', color: 'text-gray-400', emoji: '\u2753' };
  const ratio = targetPrice / marketValue;
  if (ratio <= 0.6) return { label: 'Stretch', desc: `Target is ${((1 - ratio) * 100).toFixed(0)}% below market. Very rare finds only.`, color: 'text-red-400', emoji: '\uD83C\uDFAF' };
  if (ratio <= 0.8) return { label: 'Snipe', desc: `Target is ${((1 - ratio) * 100).toFixed(0)}% below market. Wait for underpriced auctions ending at odd hours.`, color: 'text-amber-400', emoji: '\u26A1' };
  if (ratio <= 1.1) return { label: 'Watch', desc: 'Target is near market value. Deals come regularly, be patient.', color: 'text-sky-400', emoji: '\uD83D\uDC41\uFE0F' };
  return { label: 'Buy Now', desc: 'Target is at or above market. Plenty of listings available.', color: 'text-emerald-400', emoji: '\u2705' };
}

function getSellStrategy(targetPrice: number, marketValue: number): { label: string; desc: string; color: string; emoji: string } {
  if (marketValue <= 0) return { label: 'Unknown', desc: 'No market data', color: 'text-gray-400', emoji: '\u2753' };
  const ratio = targetPrice / marketValue;
  if (ratio <= 0.8) return { label: 'Below Market', desc: 'Target is below current value. Consider raising your ask.', color: 'text-red-400', emoji: '\u26A0\uFE0F' };
  if (ratio <= 1.0) return { label: 'Fair', desc: 'Target is near market. Should sell within 1-2 weeks.', color: 'text-sky-400', emoji: '\uD83D\uDCB2' };
  if (ratio <= 1.3) return { label: 'Premium', desc: `Asking ${((ratio - 1) * 100).toFixed(0)}% above market. May take longer to sell.`, color: 'text-amber-400', emoji: '\u2B50' };
  return { label: 'Moon Shot', desc: `Asking ${((ratio - 1) * 100).toFixed(0)}% above market. List as BIN and wait.`, color: 'text-violet-400', emoji: '\uD83C\uDF19' };
}

const STORAGE_KEY = 'cardvault-price-alerts';

export default function PriceAlert() {
  const [query, setQuery] = useState('');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [targetPrice, setTargetPrice] = useState('');
  const [alertType, setAlertType] = useState<'buy' | 'sell'>('buy');
  const [selectedCard, setSelectedCard] = useState<typeof sportsCards[0] | null>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setAlerts(JSON.parse(saved));
    } catch {}
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
    } catch {}
  }, [alerts]);

  const filtered = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return sportsCards.filter(c =>
      c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [query]);

  const selectCard = (card: typeof sportsCards[0]) => {
    setSelectedCard(card);
    setQuery('');
  };

  const addAlert = () => {
    if (!selectedCard || !targetPrice) return;
    const tp = parseFloat(targetPrice);
    if (isNaN(tp) || tp <= 0) return;

    const alert: Alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      cardSlug: selectedCard.slug,
      cardName: selectedCard.name,
      player: selectedCard.player,
      sport: selectedCard.sport,
      targetPrice: tp,
      type: alertType,
      rawValue: parseValue(selectedCard.estimatedValueRaw),
      gemValue: parseValue(selectedCard.estimatedValueGem),
      ebayUrl: selectedCard.ebaySearchUrl,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setAlerts([alert, ...alerts]);
    setSelectedCard(null);
    setTargetPrice('');
  };

  const removeAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const clearAll = () => setAlerts([]);

  const buyAlerts = alerts.filter(a => a.type === 'buy');
  const sellAlerts = alerts.filter(a => a.type === 'sell');
  const totalBuyBudget = buyAlerts.reduce((s, a) => s + a.targetPrice, 0);
  const totalSellTarget = sellAlerts.reduce((s, a) => s + a.targetPrice, 0);

  return (
    <div className="space-y-8">
      {/* Card Search + Alert Creation */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Create Price Alert</h2>

        {!selectedCard ? (
          <div className="relative">
            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search 5,500+ cards... (e.g., Ohtani Chrome RC)"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-sky-500" />
            {filtered.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg max-h-64 overflow-y-auto">
                {filtered.map(c => (
                  <button key={c.slug} onClick={() => selectCard(c)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors border-b border-gray-700/50 last:border-0">
                    <div className="text-white text-sm font-medium">{c.name}</div>
                    <div className="text-gray-500 text-xs">{c.player} &middot; Raw: {c.estimatedValueRaw} &middot; Gem: {c.estimatedValueGem}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Selected card */}
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-white font-medium">{selectedCard.name}</div>
                  <div className="text-gray-500 text-sm">{selectedCard.player} &middot; {selectedCard.sport} &middot; Raw: {selectedCard.estimatedValueRaw} &middot; Gem: {selectedCard.estimatedValueGem}</div>
                </div>
                <button onClick={() => setSelectedCard(null)} className="text-gray-500 hover:text-red-400 text-sm">&times; Change</button>
              </div>
            </div>

            {/* Alert type + target price */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Alert Type</label>
                <div className="flex gap-2">
                  <button onClick={() => setAlertType('buy')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${alertType === 'buy' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                    Buy Target
                  </button>
                  <button onClick={() => setAlertType('sell')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${alertType === 'sell' ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                    Sell Target
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Target Price ($)</label>
                <input type="number" value={targetPrice} onChange={e => setTargetPrice(e.target.value)}
                  placeholder={alertType === 'buy' ? 'Max you want to pay' : 'Min you want to get'}
                  min="0" step="1"
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-sky-500" />
              </div>
              <div className="flex items-end">
                <button onClick={addAlert}
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg transition-colors">
                  Create Alert
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {alerts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{alerts.length}</div>
            <div className="text-xs text-gray-500">Active Alerts</div>
          </div>
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">{buyAlerts.length}</div>
            <div className="text-xs text-gray-500">Buy Targets</div>
          </div>
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-amber-400">{sellAlerts.length}</div>
            <div className="text-xs text-gray-500">Sell Targets</div>
          </div>
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-sky-400">{fmt(totalBuyBudget)}</div>
            <div className="text-xs text-gray-500">Buy Budget</div>
          </div>
        </div>
      )}

      {/* Alert List */}
      {alerts.length > 0 && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white">Your Alerts</h2>
            <button onClick={clearAll} className="text-xs text-red-400 hover:text-red-300 transition-colors">Clear All</button>
          </div>
          <div className="space-y-4">
            {alerts.map(a => {
              const marketVal = a.type === 'buy' ? a.rawValue : a.rawValue;
              const strategy = a.type === 'buy'
                ? getStrategy(a.targetPrice, marketVal)
                : getSellStrategy(a.targetPrice, marketVal);
              const pctDiff = marketVal > 0 ? ((a.targetPrice - marketVal) / marketVal * 100).toFixed(0) : '?';

              return (
                <div key={a.id} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${a.type === 'buy' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/50' : 'bg-amber-950/50 text-amber-400 border border-amber-800/50'}`}>
                          {a.type === 'buy' ? 'BUY' : 'SELL'}
                        </span>
                        <Link href={`/sports/cards/${a.cardSlug}`} className="text-white font-medium hover:text-sky-400 text-sm">
                          {a.cardName}
                        </Link>
                      </div>
                      <div className="text-gray-500 text-xs mt-1">{a.player} &middot; {a.sport} &middot; Created {a.createdAt}</div>
                    </div>
                    <button onClick={() => removeAlert(a.id)} className="text-gray-600 hover:text-red-400 text-lg">&times;</button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                    <div>
                      <div className="text-xs text-gray-500">Target Price</div>
                      <div className={`font-bold ${a.type === 'buy' ? 'text-emerald-400' : 'text-amber-400'}`}>{fmt(a.targetPrice)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Market (Raw)</div>
                      <div className="text-white font-bold">{fmt(a.rawValue)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Market (Gem)</div>
                      <div className="text-white font-bold">{fmt(a.gemValue)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">vs Market</div>
                      <div className={`font-bold ${Number(pctDiff) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{pctDiff}%</div>
                    </div>
                  </div>

                  {/* Strategy */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{strategy.emoji}</span>
                    <span className={`font-bold text-sm ${strategy.color}`}>{strategy.label}</span>
                    <span className="text-gray-500 text-xs">{strategy.desc}</span>
                  </div>

                  {/* Price position bar */}
                  <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden mb-3">
                    {marketVal > 0 && (
                      <>
                        <div className="absolute h-full bg-gray-500 rounded-full" style={{ width: `${Math.min((a.rawValue / Math.max(a.gemValue, a.targetPrice * 1.5)) * 100, 95)}%` }} />
                        <div className={`absolute h-full w-1.5 rounded-full ${a.type === 'buy' ? 'bg-emerald-400' : 'bg-amber-400'}`}
                          style={{ left: `${Math.min((a.targetPrice / Math.max(a.gemValue, a.targetPrice * 1.5)) * 100, 95)}%` }} />
                      </>
                    )}
                  </div>

                  {/* Action links */}
                  <div className="flex gap-2">
                    <a href={`${a.ebayUrl}&_udhi=${a.targetPrice}`} target="_blank" rel="noopener noreferrer"
                      className="text-xs px-3 py-1.5 bg-sky-950/50 text-sky-400 border border-sky-800/50 rounded-lg hover:bg-sky-900/50 transition-colors">
                      Search eBay (under {fmt(a.targetPrice)})
                    </a>
                    <a href={a.ebayUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs px-3 py-1.5 bg-gray-800 text-gray-400 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors">
                      All Listings
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {alerts.length === 0 && (
        <div className="bg-gray-900/60 border border-gray-800 border-dashed rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">&#128276;</div>
          <div className="text-gray-400 text-lg mb-2">No price alerts yet</div>
          <div className="text-gray-500 text-sm max-w-md mx-auto">
            Search for a card above, set a buy or sell target price, and get personalized alerts with eBay links and bidding strategy.
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';
import type { SportsCard } from '@/data/sports-cards';

const sportIcons: Record<string, string> = {
  baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒',
};

function parseValue(v: string): number {
  const m = v.match(/\$([\d,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function seededRng(seed: number) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0x7fffffff; return s / 0x7fffffff; };
}

function dateHash(): number {
  const d = new Date();
  const str = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

interface Order { price: number; quantity: number; }
interface Trade { price: number; quantity: number; time: string; side: 'buy' | 'sell'; }

export default function OrderBookClient() {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCard, setSelectedCard] = useState<SportsCard | null>(null);
  const [sportFilter, setSportFilter] = useState<string>('all');

  useEffect(() => { setMounted(true); }, []);

  const filteredCards = useMemo(() => {
    let cards = sportsCards.filter(c => parseValue(c.estimatedValueRaw) >= 5);
    if (sportFilter !== 'all') cards = cards.filter(c => c.sport === sportFilter);
    if (search) {
      const q = search.toLowerCase();
      cards = cards.filter(c => c.player.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
    }
    return cards.slice(0, 50);
  }, [search, sportFilter]);

  const generateOrderBook = useCallback((card: SportsCard) => {
    const basePrice = parseValue(card.estimatedValueRaw);
    const rng = seededRng(dateHash() + card.slug.length);
    const spread = Math.max(1, Math.floor(basePrice * 0.05));
    const bids: Order[] = [];
    const asks: Order[] = [];
    const trades: Trade[] = [];
    for (let i = 0; i < 8; i++) {
      const price = basePrice - spread - (i * Math.max(1, Math.floor(basePrice * 0.02)));
      if (price > 0) bids.push({ price, quantity: Math.floor(rng() * 5) + 1 });
    }
    for (let i = 0; i < 8; i++) {
      const price = basePrice + spread + (i * Math.max(1, Math.floor(basePrice * 0.02)));
      asks.push({ price, quantity: Math.floor(rng() * 5) + 1 });
    }
    const hours = ['2m ago', '5m ago', '12m ago', '28m ago', '45m ago', '1h ago', '2h ago', '3h ago'];
    for (let i = 0; i < 8; i++) {
      trades.push({ price: Math.max(1, Math.round(basePrice + (rng() - 0.5) * spread * 2)), quantity: Math.floor(rng() * 3) + 1, time: hours[i], side: rng() > 0.5 ? 'buy' : 'sell' });
    }
    return { bids, asks: asks.reverse(), trades, spread, midPrice: basePrice };
  }, []);

  if (!mounted) return <div className="min-h-[400px] flex items-center justify-center text-gray-500">Loading order book...</div>;

  if (selectedCard) {
    const book = generateOrderBook(selectedCard);
    const maxQty = Math.max(...book.bids.map(o => o.quantity), ...book.asks.map(o => o.quantity));
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedCard(null)} className="text-sm text-emerald-400 hover:underline">&larr; Back to search</button>
        <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{sportIcons[selectedCard.sport]}</span>
            <div>
              <h2 className="text-xl font-bold text-white">{selectedCard.player}</h2>
              <p className="text-sm text-gray-400">{selectedCard.year} {selectedCard.set} #{selectedCard.cardNumber}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 text-center">
            <div className="bg-emerald-950/30 border border-emerald-800/30 rounded-lg p-3">
              <div className="text-xs text-gray-500">Best Bid</div>
              <div className="text-lg font-bold text-emerald-400">${book.bids[0]?.price || 0}</div>
            </div>
            <div className="bg-gray-800/60 rounded-lg p-3">
              <div className="text-xs text-gray-500">Spread</div>
              <div className="text-lg font-bold text-white">${book.spread}</div>
            </div>
            <div className="bg-red-950/30 border border-red-800/30 rounded-lg p-3">
              <div className="text-xs text-gray-500">Best Ask</div>
              <div className="text-lg font-bold text-red-400">${book.asks[book.asks.length - 1]?.price || 0}</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5">
            <h3 className="text-lg font-bold text-white mb-4">Depth of Market</h3>
            <div className="space-y-1 mb-3">
              {book.asks.map((o, i) => (
                <div key={`a${i}`} className="relative flex items-center justify-between px-3 py-1.5 rounded text-sm">
                  <div className="absolute inset-0 bg-red-900/20 rounded" style={{ width: `${(o.quantity / maxQty) * 100}%` }} />
                  <span className="relative text-red-400 font-mono">${o.price}</span>
                  <span className="relative text-gray-400">{o.quantity}</span>
                </div>
              ))}
            </div>
            <div className="text-center py-2 border-y border-gray-700 mb-3">
              <span className="text-lg font-bold text-white">${book.midPrice}</span>
              <span className="text-xs text-gray-500 ml-2">mid price</span>
            </div>
            <div className="space-y-1">
              {book.bids.map((o, i) => (
                <div key={`b${i}`} className="relative flex items-center justify-between px-3 py-1.5 rounded text-sm">
                  <div className="absolute inset-0 bg-emerald-900/20 rounded" style={{ width: `${(o.quantity / maxQty) * 100}%` }} />
                  <span className="relative text-emerald-400 font-mono">${o.price}</span>
                  <span className="relative text-gray-400">{o.quantity}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5">
            <h3 className="text-lg font-bold text-white mb-4">Recent Trades</h3>
            <div className="space-y-2">
              {book.trades.map((t, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-800/40 rounded-lg px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${t.side === 'buy' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <span className={`font-mono ${t.side === 'buy' ? 'text-emerald-400' : 'text-red-400'}`}>${t.price}</span>
                  </div>
                  <span className="text-gray-400">x{t.quantity}</span>
                  <span className="text-gray-500 text-xs">{t.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="text-center">
          <Link href={`/sports/${selectedCard.slug}`} className="text-sm text-emerald-400 hover:underline">View full card details &rarr;</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <input type="text" placeholder="Search by player or card name..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-600" />
        <div className="flex gap-2">
          {['all', 'baseball', 'basketball', 'football', 'hockey'].map(s => (
            <button key={s} onClick={() => setSportFilter(s)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${sportFilter === s ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
              {s === 'all' ? 'All' : sportIcons[s]}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredCards.map(card => (
          <button key={card.slug} onClick={() => setSelectedCard(card)} className="bg-gray-900/80 border border-gray-800 hover:border-gray-600 rounded-xl p-4 text-left transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg">{sportIcons[card.sport]}</span>
                <div className="min-w-0">
                  <div className="font-medium text-white truncate">{card.player}</div>
                  <div className="text-xs text-gray-500 truncate">{card.year} {card.set}</div>
                </div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <div className="text-sm font-bold text-emerald-400">${parseValue(card.estimatedValueRaw)}</div>
                <div className="text-xs text-gray-500">mid</div>
              </div>
            </div>
          </button>
        ))}
      </div>
      {filteredCards.length === 0 && <div className="text-center text-gray-500 py-8">No cards found. Try a different search.</div>}
    </div>
  );
}

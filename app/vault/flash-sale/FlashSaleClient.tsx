'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

// --- Types ---
interface FlashDeal {
  id: string;
  type: 'pack-deal' | 'single-steal' | 'bundle' | 'mystery-box';
  title: string;
  description: string;
  originalPrice: number;
  salePrice: number;
  discount: number;
  sport: string;
  inventory: number;
  maxInventory: number;
  endsAt: number; // ms timestamp
  cardSlug?: string;
  cardName?: string;
}

interface PurchaseRecord {
  dealId: string;
  title: string;
  price: number;
  saved: number;
  timestamp: number;
}

// --- Deterministic RNG ---
function seededRng(seed: number) {
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

// --- Parse value from string ---
function parseValue(v: string): number {
  const m = v.match(/\$([0-9,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 5;
}

// --- Sports labels ---
const sportColors: Record<string, string> = {
  baseball: 'text-red-400',
  basketball: 'text-orange-400',
  football: 'text-blue-400',
  hockey: 'text-cyan-400',
};

const sportBg: Record<string, string> = {
  baseball: 'bg-red-950/40 border-red-800/40',
  basketball: 'bg-orange-950/40 border-orange-800/40',
  football: 'bg-blue-950/40 border-blue-800/40',
  hockey: 'bg-cyan-950/40 border-cyan-800/40',
};

const typeLabels: Record<string, { label: string; color: string; icon: string }> = {
  'pack-deal': { label: 'PACK DEAL', color: 'text-green-400', icon: '📦' },
  'single-steal': { label: 'SINGLE STEAL', color: 'text-yellow-400', icon: '🔥' },
  'bundle': { label: 'BUNDLE', color: 'text-purple-400', icon: '🎁' },
  'mystery-box': { label: 'MYSTERY BOX', color: 'text-pink-400', icon: '❓' },
};

// --- Generate daily flash sales ---
function generateDeals(seed: number): FlashDeal[] {
  const rng = seededRng(seed);
  const now = Date.now();
  const sports = ['baseball', 'basketball', 'football', 'hockey'];
  const dealTypes: FlashDeal['type'][] = ['pack-deal', 'single-steal', 'bundle', 'mystery-box'];

  const cardsBySport: Record<string, typeof sportsCards> = {};
  for (const s of sports) {
    cardsBySport[s] = sportsCards.filter(c => c.sport === s && parseValue(c.estimatedValueRaw) >= 5);
  }

  const deals: FlashDeal[] = [];

  for (let i = 0; i < 8; i++) {
    const type = dealTypes[i % 4];
    const sport = sports[Math.floor(rng() * sports.length)];
    const pool = cardsBySport[sport] || [];
    const card = pool.length > 0 ? pool[Math.floor(rng() * pool.length)] : null;

    // Stagger end times: 2-8 hours from now
    const hoursLeft = 2 + rng() * 6;
    const endsAt = now + hoursLeft * 3600 * 1000;

    let originalPrice: number;
    let discount: number;
    let title: string;
    let description: string;
    let maxInventory: number;

    switch (type) {
      case 'pack-deal': {
        const tier = Math.floor(rng() * 4);
        const tiers = [
          { name: 'Bronze', price: 4.99 },
          { name: 'Silver', price: 14.99 },
          { name: 'Gold', price: 29.99 },
          { name: 'Platinum', price: 49.99 },
        ];
        const t = tiers[tier];
        originalPrice = t.price;
        discount = 20 + Math.floor(rng() * 25); // 20-44% off
        title = `${t.name} ${sport.charAt(0).toUpperCase() + sport.slice(1)} Pack`;
        description = `${discount}% off ${t.name} tier ${sport} packs. Premium pulls guaranteed.`;
        maxInventory = 20 + Math.floor(rng() * 30);
        break;
      }
      case 'single-steal': {
        const val = card ? parseValue(card.estimatedValueRaw) : 20;
        originalPrice = val;
        discount = 30 + Math.floor(rng() * 20); // 30-49% off
        title = card ? card.name : `${sport} Star Card`;
        description = card
          ? `Steal price on ${card.player}! ${card.rookie ? 'Rookie card.' : ''} Below market value.`
          : 'Premium single at steal pricing.';
        maxInventory = 5 + Math.floor(rng() * 10);
        break;
      }
      case 'bundle': {
        originalPrice = 25 + Math.floor(rng() * 50);
        discount = 25 + Math.floor(rng() * 15); // 25-39% off
        const count = 3 + Math.floor(rng() * 3); // 3-5 packs
        title = `${count}-Pack ${sport.charAt(0).toUpperCase() + sport.slice(1)} Bundle`;
        description = `${count} packs for the price of ${count - 1}. Mix of tiers included.`;
        maxInventory = 10 + Math.floor(rng() * 15);
        break;
      }
      case 'mystery-box': {
        const tier = Math.floor(rng() * 3);
        const tiers = [
          { name: 'Mini Mystery', price: 9.99 },
          { name: 'Standard Mystery', price: 24.99 },
          { name: 'Premium Mystery', price: 49.99 },
        ];
        const t = tiers[tier];
        originalPrice = t.price;
        discount = 15 + Math.floor(rng() * 20); // 15-34% off
        title = `${t.name} Box — ${sport.charAt(0).toUpperCase() + sport.slice(1)}`;
        description = `Guaranteed hit card inside. Could be a gem mint rookie. ${sport} themed.`;
        maxInventory = 8 + Math.floor(rng() * 12);
        break;
      }
    }

    const salePrice = Math.round(originalPrice * (1 - discount / 100) * 100) / 100;
    const sold = Math.floor(rng() * maxInventory * 0.6);

    deals.push({
      id: `flash-${seed}-${i}`,
      type,
      title,
      description,
      originalPrice,
      salePrice,
      discount,
      sport,
      inventory: maxInventory - sold,
      maxInventory,
      endsAt,
      cardSlug: card?.slug,
      cardName: card?.name,
    });
  }

  return deals;
}

// --- Countdown timer ---
function useCountdown(targetMs: number) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);
  const diff = Math.max(0, targetMs - now);
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { hours, minutes, seconds, expired: diff <= 0 };
}

// --- Deal Card Component ---
function DealCard({ deal, onBuy, balance }: { deal: FlashDeal; onBuy: (deal: FlashDeal) => void; balance: number }) {
  const { hours, minutes, seconds, expired } = useCountdown(deal.endsAt);
  const soldOut = deal.inventory <= 0;
  const cantAfford = balance < deal.salePrice;
  const typeInfo = typeLabels[deal.type];
  const inventoryPct = (deal.inventory / deal.maxInventory) * 100;

  return (
    <div className={`border rounded-xl p-5 transition-all ${
      expired || soldOut
        ? 'bg-zinc-900/40 border-zinc-700/30 opacity-60'
        : `${sportBg[deal.sport] || 'bg-zinc-900/60 border-zinc-700/50'} hover:border-zinc-500/60`
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{typeInfo.icon}</span>
          <span className={`text-[10px] font-bold tracking-wider ${typeInfo.color}`}>{typeInfo.label}</span>
        </div>
        <span className={`text-xs font-medium capitalize ${sportColors[deal.sport] || 'text-zinc-400'}`}>
          {deal.sport}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-zinc-100 mb-1 line-clamp-2">{deal.title}</h3>
      <p className="text-xs text-zinc-400 mb-3 line-clamp-2">{deal.description}</p>

      {/* Pricing */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-xl font-bold text-green-400">${deal.salePrice.toFixed(2)}</span>
        <span className="text-sm text-zinc-500 line-through">${deal.originalPrice.toFixed(2)}</span>
        <span className="text-xs font-bold text-green-500 bg-green-950/50 px-1.5 py-0.5 rounded">
          -{deal.discount}%
        </span>
      </div>

      {/* Inventory bar */}
      <div className="mb-3">
        <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
          <span>{deal.inventory} remaining</span>
          <span>{deal.maxInventory - deal.inventory} sold</span>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${
              inventoryPct < 20 ? 'bg-red-500' : inventoryPct < 50 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${inventoryPct}%` }}
          />
        </div>
      </div>

      {/* Countdown */}
      <div className="flex items-center gap-1 mb-4">
        {expired ? (
          <span className="text-xs text-red-400 font-medium">EXPIRED</span>
        ) : (
          <>
            <span className="text-[10px] text-zinc-500">Ends in</span>
            <span className="text-xs font-mono font-medium text-amber-400">
              {hours}h {String(minutes).padStart(2, '0')}m {String(seconds).padStart(2, '0')}s
            </span>
          </>
        )}
      </div>

      {/* Buy button */}
      {expired || soldOut ? (
        <div className="w-full py-2 text-center text-xs font-medium text-zinc-500 bg-zinc-800/50 rounded-lg">
          {soldOut ? 'SOLD OUT' : 'EXPIRED'}
        </div>
      ) : (
        <button
          onClick={() => onBuy(deal)}
          disabled={cantAfford}
          className={`w-full py-2 rounded-lg text-xs font-bold transition-all ${
            cantAfford
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-500 text-white cursor-pointer'
          }`}
        >
          {cantAfford ? 'Insufficient Funds' : `BUY NOW — $${deal.salePrice.toFixed(2)}`}
        </button>
      )}

      {/* Card link */}
      {deal.cardSlug && (
        <Link href={`/sports/${deal.cardSlug}`} className="block text-[10px] text-zinc-500 hover:text-zinc-300 mt-2 text-center">
          View card details &rarr;
        </Link>
      )}
    </div>
  );
}

// --- Main Client Component ---
export default function FlashSaleClient() {
  const [balance, setBalance] = useState(250);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [notification, setNotification] = useState<string | null>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cv-flash-sale');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.balance !== undefined) setBalance(data.balance);
        if (data.purchases) setPurchases(data.purchases);
      } else {
        // Initialize from vault wallet if available
        const wallet = localStorage.getItem('cv-wallet');
        if (wallet) {
          const w = JSON.parse(wallet);
          if (w.balance !== undefined) setBalance(w.balance);
        }
      }
    } catch { /* ignore */ }
  }, []);

  // Save to localStorage
  const save = useCallback((b: number, p: PurchaseRecord[]) => {
    try {
      localStorage.setItem('cv-flash-sale', JSON.stringify({ balance: b, purchases: p }));
    } catch { /* ignore */ }
  }, []);

  // Generate deals
  const deals = useMemo(() => generateDeals(dateHash()), []);

  // Filter deals
  const filtered = useMemo(() => {
    if (filter === 'all') return deals;
    return deals.filter(d => d.sport === filter);
  }, [deals, filter]);

  // Buy handler
  const handleBuy = useCallback((deal: FlashDeal) => {
    if (balance < deal.salePrice) return;
    if (deal.inventory <= 0) return;

    const newBalance = Math.round((balance - deal.salePrice) * 100) / 100;
    const saved = Math.round((deal.originalPrice - deal.salePrice) * 100) / 100;
    const record: PurchaseRecord = {
      dealId: deal.id,
      title: deal.title,
      price: deal.salePrice,
      saved,
      timestamp: Date.now(),
    };

    deal.inventory--;
    const newPurchases = [record, ...purchases];
    setBalance(newBalance);
    setPurchases(newPurchases);
    save(newBalance, newPurchases);

    setNotification(`Purchased "${deal.title}" for $${deal.salePrice.toFixed(2)} — saved $${saved.toFixed(2)}!`);
    setTimeout(() => setNotification(null), 3000);
  }, [balance, purchases, save]);

  // Stats
  const totalSaved = purchases.reduce((sum, p) => sum + p.saved, 0);
  const totalSpent = purchases.reduce((sum, p) => sum + p.price, 0);

  return (
    <div>
      {/* Notification toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-green-900/90 border border-green-700/60 text-green-300 text-sm px-4 py-3 rounded-lg shadow-lg animate-pulse">
          {notification}
        </div>
      )}

      {/* Wallet & Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-zinc-900/60 border border-zinc-700/40 rounded-lg p-3 text-center">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Balance</div>
          <div className="text-lg font-bold text-green-400">${balance.toFixed(2)}</div>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-700/40 rounded-lg p-3 text-center">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Deals Snagged</div>
          <div className="text-lg font-bold text-zinc-100">{purchases.length}</div>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-700/40 rounded-lg p-3 text-center">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Total Spent</div>
          <div className="text-lg font-bold text-amber-400">${totalSpent.toFixed(2)}</div>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-700/40 rounded-lg p-3 text-center">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Total Saved</div>
          <div className="text-lg font-bold text-green-400">${totalSaved.toFixed(2)}</div>
        </div>
      </div>

      {/* Sport Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'baseball', 'basketball', 'football', 'hockey'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              filter === s
                ? 'bg-zinc-100 text-zinc-900'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {s === 'all' ? 'All Sports' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Active Deals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {filtered.map(deal => (
          <DealCard key={deal.id} deal={deal} onBuy={handleBuy} balance={balance} />
        ))}
      </div>

      {/* Recent Purchases */}
      {purchases.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-zinc-100 mb-3">Recent Purchases</h2>
          <div className="bg-zinc-900/50 border border-zinc-700/40 rounded-xl overflow-hidden">
            <div className="divide-y divide-zinc-800/50">
              {purchases.slice(0, 10).map((p, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="text-sm text-zinc-200">{p.title}</div>
                    <div className="text-[10px] text-zinc-500">
                      {new Date(p.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-zinc-200">${p.price.toFixed(2)}</div>
                    <div className="text-[10px] text-green-400">Saved ${p.saved.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* How Flash Sales Work */}
      <div className="bg-zinc-900/50 border border-zinc-700/40 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">How Flash Sales Work</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { step: '1', title: 'Browse Deals', desc: '8 flash deals rotate daily — packs, singles, bundles, and mystery boxes across all sports.' },
            { step: '2', title: 'Act Fast', desc: 'Each deal has limited inventory and a countdown timer. When it sells out or expires, it is gone.' },
            { step: '3', title: 'Save Big', desc: '15-50% off regular prices. Track your total savings and deals snagged in the stats bar.' },
            { step: '4', title: 'Build Your Vault', desc: 'Purchased items add to your vault collection. Visit My Vault to see everything you own.' },
          ].map(s => (
            <div key={s.step} className="flex gap-3">
              <div className="w-7 h-7 flex-shrink-0 rounded-full bg-zinc-800 border border-zinc-600 flex items-center justify-center text-xs font-bold text-zinc-300">
                {s.step}
              </div>
              <div>
                <div className="text-sm font-medium text-zinc-200">{s.title}</div>
                <div className="text-xs text-zinc-400">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pro Tips */}
      <div className="bg-zinc-900/50 border border-zinc-700/40 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-zinc-100 mb-3">Flash Sale Tips</h2>
        <ul className="space-y-2 text-sm text-zinc-300">
          <li className="flex gap-2"><span className="text-green-400 flex-shrink-0">1.</span> Check back multiple times per day — deals rotate on different timers.</li>
          <li className="flex gap-2"><span className="text-green-400 flex-shrink-0">2.</span> Single steals often offer the best value — 30-50% below market on named cards.</li>
          <li className="flex gap-2"><span className="text-green-400 flex-shrink-0">3.</span> Mystery boxes have the highest variance — potential for huge wins or modest pulls.</li>
          <li className="flex gap-2"><span className="text-green-400 flex-shrink-0">4.</span> Bundles are the safest bet for building collection depth across a sport.</li>
          <li className="flex gap-2"><span className="text-green-400 flex-shrink-0">5.</span> Low inventory (under 20% remaining) means a deal is popular — buy before it sells out.</li>
        </ul>
      </div>

      {/* Related Links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { href: '/packs', label: 'Pack Store', desc: 'Browse all packs' },
          { href: '/vault', label: 'My Vault', desc: 'View your collection' },
          { href: '/marketplace', label: 'Marketplace', desc: 'Buy & sell cards' },
          { href: '/vault/auction-sniper', label: 'Auction Sniper', desc: 'Bid on timed auctions' },
          { href: '/vault/crafting', label: 'Crafting Station', desc: 'Combine cards' },
          { href: '/vault/value-tracker', label: 'Value Tracker', desc: 'Track portfolio value' },
        ].map(link => (
          <Link key={link.href} href={link.href} className="bg-zinc-900/50 border border-zinc-700/40 rounded-lg p-3 hover:border-zinc-500/60 transition-all">
            <div className="text-sm font-medium text-zinc-200">{link.label}</div>
            <div className="text-[10px] text-zinc-500">{link.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

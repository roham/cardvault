'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ─── helpers ─── */
function parseValue(est: string): number {
  const m = est.match(/\$([0-9,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) || 5 : 5;
}
function fmt(n: number): string { return `$${n.toLocaleString()}`; }

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

/* ─── customer types ─── */
const CUSTOMER_TYPES = [
  { type: 'collector', name: 'Collector', emoji: '🧑‍💼', willPay: 1.1, willSellAt: 0.85, patience: 2 },
  { type: 'flipper', name: 'Flipper', emoji: '💰', willPay: 0.8, willSellAt: 0.7, patience: 1 },
  { type: 'dad', name: 'Returning Dad', emoji: '👨‍👦', willPay: 1.2, willSellAt: 0.9, patience: 3 },
  { type: 'kid', name: 'Kid', emoji: '🧒', willPay: 0.6, willSellAt: 0.5, patience: 1 },
  { type: 'whale', name: 'Whale Buyer', emoji: '🐋', willPay: 1.3, willSellAt: 0.95, patience: 3 },
  { type: 'dealer', name: 'Rival Dealer', emoji: '🏪', willPay: 0.75, willSellAt: 0.65, patience: 1 },
  { type: 'completionist', name: 'Set Builder', emoji: '📋', willPay: 1.15, willSellAt: 0.88, patience: 2 },
  { type: 'newbie', name: 'New Collector', emoji: '🌟', willPay: 1.0, willSellAt: 0.8, patience: 2 },
] as const;

const CUSTOMER_NAMES = [
  'Marcus', 'Dave', 'Kai', 'Mia', 'Tony', 'Jess', 'Alex', 'Sam',
  'Jordan', 'Casey', 'Riley', 'Morgan', 'Quinn', 'Devon', 'Avery', 'Blake',
];

interface Customer {
  name: string;
  type: typeof CUSTOMER_TYPES[number];
  action: 'buy' | 'sell';
  card: (typeof sportsCards)[number];
  cardValue: number;
  offerPrice: number;
}

interface GameState {
  phase: 'setup' | 'playing' | 'results';
  cash: number;
  startCash: number;
  inventory: { card: (typeof sportsCards)[number]; costBasis: number }[];
  customers: Customer[];
  currentCustomerIndex: number;
  transactions: { customer: string; action: string; card: string; price: number; profit: number }[];
  customersServed: number;
  customersLost: number;
  dayLength: number;
}

function generateCustomers(count: number, rng: () => number): Customer[] {
  const pool = sportsCards.filter(c => {
    const v = parseValue(c.estimatedValueRaw);
    return v >= 5 && v <= 500;
  });

  return Array.from({ length: count }, () => {
    const typeIdx = Math.floor(rng() * CUSTOMER_TYPES.length);
    const cType = CUSTOMER_TYPES[typeIdx];
    const nameIdx = Math.floor(rng() * CUSTOMER_NAMES.length);
    const cardIdx = Math.floor(rng() * pool.length);
    const card = pool[cardIdx];
    const cardValue = parseValue(card.estimatedValueRaw);
    const isBuying = rng() > 0.45; // slightly more buyers than sellers

    let offerPrice: number;
    if (isBuying) {
      // Customer wants to buy — they offer based on their willingness to pay
      offerPrice = Math.round(cardValue * (cType.willPay * (0.85 + rng() * 0.3)));
    } else {
      // Customer wants to sell to you — they want this much
      offerPrice = Math.round(cardValue * (cType.willSellAt * (0.9 + rng() * 0.2)));
    }

    return {
      name: CUSTOMER_NAMES[nameIdx],
      type: cType,
      action: isBuying ? 'buy' : 'sell',
      card,
      cardValue,
      offerPrice: Math.max(1, offerPrice),
    };
  });
}

export default function CardDealerClient() {
  const [game, setGame] = useState<GameState>({
    phase: 'setup',
    cash: 1000,
    startCash: 1000,
    inventory: [],
    customers: [],
    currentCustomerIndex: 0,
    transactions: [],
    customersServed: 0,
    customersLost: 0,
    dayLength: 15,
  });
  const [counterOffer, setCounterOffer] = useState('');
  const [negotiating, setNegotiating] = useState(false);
  const [negotiationRound, setNegotiationRound] = useState(0);
  const [currentOffer, setCurrentOffer] = useState(0);
  const [message, setMessage] = useState('');

  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

  function startGame() {
    const rng = seededRandom(seed);
    const customers = generateCustomers(15, rng);
    setGame({
      phase: 'playing',
      cash: 1000,
      startCash: 1000,
      inventory: [],
      customers,
      currentCustomerIndex: 0,
      transactions: [],
      customersServed: 0,
      customersLost: 0,
      dayLength: 15,
    });
    setCurrentOffer(customers[0].offerPrice);
    setMessage('');
    setNegotiating(false);
    setNegotiationRound(0);
  }

  const customer = game.customers[game.currentCustomerIndex];

  function nextCustomer() {
    const nextIdx = game.currentCustomerIndex + 1;
    if (nextIdx >= game.customers.length) {
      setGame(g => ({ ...g, phase: 'results' }));
    } else {
      setGame(g => ({ ...g, currentCustomerIndex: nextIdx }));
      setCurrentOffer(game.customers[nextIdx]?.offerPrice || 0);
    }
    setNegotiating(false);
    setNegotiationRound(0);
    setCounterOffer('');
    setMessage('');
  }

  function acceptDeal() {
    if (!customer) return;
    if (customer.action === 'buy') {
      // Customer is buying from us — we receive money
      // Check if we have the card in inventory
      const invIdx = game.inventory.findIndex(i => i.card.slug === customer.card.slug);
      const profit = invIdx >= 0
        ? currentOffer - game.inventory[invIdx].costBasis
        : currentOffer - customer.cardValue * 0.7; // estimated cost basis if we had it

      setGame(g => ({
        ...g,
        cash: g.cash + currentOffer,
        inventory: invIdx >= 0 ? g.inventory.filter((_, i) => i !== invIdx) : g.inventory,
        transactions: [...g.transactions, {
          customer: `${customer.type.emoji} ${customer.name}`,
          action: 'Sold to',
          card: customer.card.name,
          price: currentOffer,
          profit,
        }],
        customersServed: g.customersServed + 1,
      }));
      setMessage(`Sold ${customer.card.name} to ${customer.name} for ${fmt(currentOffer)}!`);
    } else {
      // Customer is selling to us — we pay money
      if (game.cash < currentOffer) {
        setMessage("You don't have enough cash!");
        return;
      }
      setGame(g => ({
        ...g,
        cash: g.cash - currentOffer,
        inventory: [...g.inventory, { card: customer.card, costBasis: currentOffer }],
        transactions: [...g.transactions, {
          customer: `${customer.type.emoji} ${customer.name}`,
          action: 'Bought from',
          card: customer.card.name,
          price: -currentOffer,
          profit: customer.cardValue - currentOffer, // paper profit
        }],
        customersServed: g.customersServed + 1,
      }));
      setMessage(`Bought ${customer.card.name} from ${customer.name} for ${fmt(currentOffer)}!`);
    }
    setTimeout(nextCustomer, 1500);
  }

  function passDeal() {
    setGame(g => ({ ...g, customersLost: g.customersLost + 1 }));
    setMessage(`${customer?.name} walks away...`);
    setTimeout(nextCustomer, 800);
  }

  function handleCounter() {
    if (!customer) return;
    const offer = parseInt(counterOffer) || 0;
    if (offer <= 0) return;

    const maxRounds = customer.type.patience;
    if (negotiationRound >= maxRounds) {
      setMessage(`${customer.name} has lost patience and walks away!`);
      setGame(g => ({ ...g, customersLost: g.customersLost + 1 }));
      setTimeout(nextCustomer, 1200);
      return;
    }

    // Customer counter-logic
    const diff = Math.abs(offer - currentOffer);
    const tolerance = customer.cardValue * 0.15; // 15% tolerance

    if (customer.action === 'buy') {
      // We're selling, customer offered. We counter with higher.
      if (offer <= currentOffer) {
        // They won't go lower
        setMessage(`${customer.name}: "I already offered ${fmt(currentOffer)}. That's fair!"`);
      } else {
        // We want more, customer might accept
        if (offer <= customer.cardValue * customer.type.willPay * 1.1) {
          setCurrentOffer(offer);
          setMessage(`${customer.name}: "Okay, ${fmt(offer)} works for me!"`);
        } else {
          const counter = Math.round((currentOffer + offer) / 2);
          setCurrentOffer(counter);
          setMessage(`${customer.name}: "That's too high. How about ${fmt(counter)}?"`);
        }
      }
    } else {
      // We're buying, customer wants to sell. We counter with lower.
      if (offer >= currentOffer) {
        setMessage(`${customer.name}: "I won't go higher than ${fmt(currentOffer)}."`);
      } else {
        if (offer >= customer.cardValue * customer.type.willSellAt * 0.85) {
          setCurrentOffer(offer);
          setMessage(`${customer.name}: "Alright, ${fmt(offer)} it is."`);
        } else {
          const counter = Math.round((currentOffer + offer) / 2);
          setCurrentOffer(counter);
          setMessage(`${customer.name}: "I can't go that low. ${fmt(counter)} is my bottom."`);
        }
      }
    }

    setNegotiationRound(r => r + 1);
    setNegotiating(true);
    setCounterOffer('');
  }

  // Results calculations
  const inventoryValue = game.inventory.reduce((s, i) => s + parseValue(i.card.estimatedValueRaw), 0);
  const totalAssets = game.cash + inventoryValue;
  const profit = totalAssets - game.startCash;
  const profitPct = ((profit / game.startCash) * 100).toFixed(1);

  function getGrade(): string {
    if (profit >= 500) return 'S';
    if (profit >= 300) return 'A+';
    if (profit >= 150) return 'A';
    if (profit >= 50) return 'B';
    if (profit >= 0) return 'C';
    if (profit >= -200) return 'D';
    return 'F';
  }

  function handleShare() {
    const grade = getGrade();
    const text = `Card Dealer Simulator on @CardVault\n\nStarted: ${fmt(game.startCash)}\nEnded: ${fmt(totalAssets)} (${profit >= 0 ? '+' : ''}${fmt(profit)})\nCustomers: ${game.customersServed}/${game.dayLength}\nGrade: ${grade}\n\nRun YOUR card shop:`;
    const url = 'https://cardvault-two.vercel.app/card-dealer';
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  }

  if (game.phase === 'setup') {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 text-center">
        <div className="text-5xl mb-4">🏪</div>
        <h2 className="text-2xl font-bold text-white mb-3">Ready to Open Shop?</h2>
        <p className="text-gray-400 mb-2">You start with <span className="text-green-400 font-bold">{fmt(game.startCash)}</span> in cash.</p>
        <p className="text-gray-400 mb-6">
          {game.dayLength} customers will visit today. Buy low, sell high, negotiate deals.
          <br />Cards and customers are the same for everyone today.
        </p>
        <button onClick={startGame} className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-colors text-lg">
          Open for Business
        </button>
      </div>
    );
  }

  if (game.phase === 'results') {
    const grade = getGrade();
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-amber-950/40 to-gray-800/40 border border-amber-800/30 rounded-2xl p-8 text-center">
          <div className="text-6xl mb-2">{profit >= 0 ? '🏆' : '📉'}</div>
          <div className={`text-5xl font-bold mb-2 ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {grade}
          </div>
          <div className="text-gray-400 mb-4">Day Complete</div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl mx-auto">
            <div>
              <div className="text-xl font-bold text-white">{fmt(totalAssets)}</div>
              <div className="text-xs text-gray-400">Total Assets</div>
            </div>
            <div>
              <div className={`text-xl font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {profit >= 0 ? '+' : ''}{fmt(profit)}
              </div>
              <div className="text-xs text-gray-400">Profit ({profitPct}%)</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white">{game.customersServed}</div>
              <div className="text-xs text-gray-400">Deals Made</div>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-400">{game.customersLost}</div>
              <div className="text-xs text-gray-400">Walked Away</div>
            </div>
          </div>
        </div>

        {/* Inventory remaining */}
        {game.inventory.length > 0 && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-3">Remaining Inventory ({game.inventory.length} cards, est. {fmt(inventoryValue)})</h3>
            <div className="space-y-2">
              {game.inventory.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-300">{item.card.name}</span>
                  <span className="text-gray-400">Paid {fmt(item.costBasis)} / Worth ~{fmt(parseValue(item.card.estimatedValueRaw))}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transaction log */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-3">Transaction Log</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {game.transactions.map((t, i) => (
              <div key={i} className="flex items-center justify-between text-sm border-b border-gray-700/50 pb-2">
                <div>
                  <span className="text-gray-400">{t.customer}</span>
                  <span className="text-gray-500 mx-1">&middot;</span>
                  <span className="text-gray-300">{t.action} {t.card}</span>
                </div>
                <div className="flex gap-3">
                  <span className={t.price >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {t.price >= 0 ? '+' : ''}{fmt(t.price)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={startGame} className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-medium transition-colors">
            Play Again
          </button>
          <button onClick={handleShare} className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm font-medium transition-colors">
            Share to X
          </button>
        </div>
      </div>
    );
  }

  // Playing phase
  if (!customer) return null;
  const progress = ((game.currentCustomerIndex + 1) / game.customers.length) * 100;

  return (
    <div className="space-y-4">
      {/* Status bar */}
      <div className="flex items-center justify-between gap-4 bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <div className="flex gap-4">
          <div>
            <div className="text-xs text-gray-500">Cash</div>
            <div className="text-green-400 font-bold">{fmt(game.cash)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Inventory</div>
            <div className="text-white font-bold">{game.inventory.length} cards</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Deals</div>
            <div className="text-amber-400 font-bold">{game.customersServed}</div>
          </div>
        </div>
        <div className="text-sm text-gray-400">
          Customer {game.currentCustomerIndex + 1}/{game.customers.length}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>

      {/* Customer card */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{customer.type.emoji}</span>
          <div>
            <div className="text-white font-semibold">{customer.name} <span className="text-gray-500 text-sm">({customer.type.name})</span></div>
            <div className="text-sm text-gray-400">
              {customer.action === 'buy'
                ? 'Wants to buy from you'
                : 'Wants to sell to you'}
            </div>
          </div>
        </div>

        {/* The card */}
        <div className="bg-gray-700/30 border border-gray-600 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href={`/sports/${customer.card.slug}`} className="text-white font-medium hover:text-amber-400 transition-colors">
                {customer.card.name}
              </Link>
              <div className="text-xs text-gray-400 mt-1">
                {customer.card.sport} &middot; {customer.card.set}
                {customer.card.rookie && <span className="text-yellow-400 ml-1">RC</span>}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Market Value</div>
              <div className="text-amber-400 font-bold">{fmt(customer.cardValue)}</div>
            </div>
          </div>
        </div>

        {/* Offer */}
        <div className={`text-center p-4 rounded-xl mb-4 ${
          customer.action === 'buy'
            ? 'bg-green-950/30 border border-green-800/30'
            : 'bg-blue-950/30 border border-blue-800/30'
        }`}>
          <div className="text-sm text-gray-400 mb-1">
            {customer.action === 'buy' ? 'Offering to pay' : 'Asking price'}
          </div>
          <div className="text-3xl font-bold text-white">{fmt(currentOffer)}</div>
          <div className="text-xs text-gray-500 mt-1">
            {currentOffer > customer.cardValue
              ? `${Math.round(((currentOffer - customer.cardValue) / customer.cardValue) * 100)}% above market`
              : currentOffer < customer.cardValue
                ? `${Math.round(((customer.cardValue - currentOffer) / customer.cardValue) * 100)}% below market`
                : 'At market value'}
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="text-center text-sm text-amber-400 mb-4 animate-pulse">{message}</div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <div className="flex gap-3">
            <button
              onClick={acceptDeal}
              className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-colors"
            >
              Accept {fmt(currentOffer)}
            </button>
            <button
              onClick={passDeal}
              className="flex-1 px-4 py-3 bg-red-600/80 hover:bg-red-500/80 text-white font-bold rounded-xl transition-colors"
            >
              Pass
            </button>
          </div>

          {/* Negotiate */}
          <div className="flex gap-2">
            <input
              type="number"
              value={counterOffer}
              onChange={e => setCounterOffer(e.target.value)}
              placeholder={customer.action === 'buy' ? 'Counter (higher)...' : 'Counter (lower)...'}
              className="flex-1 px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-xl text-white text-sm placeholder-gray-500 focus:border-amber-500 focus:outline-none"
              onKeyDown={e => e.key === 'Enter' && handleCounter()}
            />
            <button
              onClick={handleCounter}
              disabled={negotiationRound >= customer.type.patience}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Counter ({customer.type.patience - negotiationRound} left)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

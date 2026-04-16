'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ── helpers ─────────────────────────────────────────────────────── */

function parseValue(raw: string): number {
  const m = raw.match(/\$(\d[\d,]*)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function dateHash(d: Date): number {
  const str = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRng(seed: number) {
  let s = seed || 42;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ── types ───────────────────────────────────────────────────────── */

interface CardItem {
  name: string;
  player: string;
  sport: string;
  year: number;
  value: number;
  slug: string;
}

interface Seller {
  name: string;
  personality: 'firm' | 'flexible' | 'desperate' | 'savvy' | 'friendly';
  avatar: string;
  description: string;
  minDiscount: number; // won't go below this % of asking
  flexibility: number; // 0-1, how much they move per counter
}

interface NegotiationState {
  card: CardItem;
  seller: Seller;
  askingPrice: number;
  currentOffer: number;
  sellerCounter: number;
  round: number;
  maxRounds: number;
  history: { actor: 'you' | 'seller'; amount: number; message: string }[];
  status: 'offering' | 'countered' | 'accepted' | 'rejected' | 'walkaway';
}

interface Stats {
  deals: number;
  totalSaved: number;
  bestDiscount: number;
  walkAways: number;
  avgDiscount: number;
}

/* ── seller personalities ────────────────────────────────────────── */

const SELLERS: Seller[] = [
  { name: 'Card Show Tony', personality: 'firm', avatar: '\uD83D\uDC68\u200D\uD83E\uDDB3', description: 'Veteran dealer. Knows every comp. Hard to budge.', minDiscount: 0.88, flexibility: 0.3 },
  { name: 'Garage Sale Gary', personality: 'flexible', avatar: '\uD83D\uDE04', description: 'Just cleaning out the closet. Open to offers.', minDiscount: 0.55, flexibility: 0.7 },
  { name: 'Desperate Dan', personality: 'desperate', avatar: '\uD83D\uDE30', description: 'Needs cash fast. Willing to deal but has a floor.', minDiscount: 0.60, flexibility: 0.8 },
  { name: 'Savvy Sarah', personality: 'savvy', avatar: '\uD83E\uDDD0', description: 'Full-time flipper. Tests your knowledge. Respects fair offers.', minDiscount: 0.82, flexibility: 0.4 },
  { name: 'Friendly Frank', personality: 'friendly', avatar: '\uD83D\uDE0A', description: 'Hobby collector selling extras. Wants fair deals for both sides.', minDiscount: 0.72, flexibility: 0.55 },
];

const SPORT_ICONS: Record<string, string> = {
  baseball: '\u26BE', basketball: '\uD83C\uDFC0', football: '\uD83C\uDFC8', hockey: '\uD83C\uDFD2',
};

/* ── seller response logic ───────────────────────────────────────── */

function getSellerResponse(seller: Seller, askingPrice: number, yourOffer: number, round: number, maxRounds: number): { counter: number; message: string; accepted: boolean; rejected: boolean } {
  const offerPct = yourOffer / askingPrice;
  const floorPrice = askingPrice * seller.minDiscount;

  // Auto-accept if offer >= asking or very close
  if (yourOffer >= askingPrice * 0.97) {
    return { counter: yourOffer, message: 'Deal! You got it at your price.', accepted: true, rejected: false };
  }

  // Auto-reject if way too low (below 40% of asking)
  if (offerPct < 0.40) {
    const messages = [
      'Ha! Come on, be serious. That\'s barely scrap value.',
      'I\'d rather keep it than sell it for that.',
      'You\'re going to have to do a LOT better than that.',
    ];
    const msg = messages[round % messages.length];
    // Counter at 95% of asking
    return { counter: Math.round(askingPrice * 0.95), message: msg, accepted: false, rejected: false };
  }

  // If offer is at or above the seller's floor
  if (yourOffer >= floorPrice) {
    // Probability of acceptance increases with offer and round
    const acceptChance = (offerPct - seller.minDiscount) / (1 - seller.minDiscount) + (round / maxRounds) * 0.3;
    if (acceptChance > 0.7 || round >= maxRounds - 1) {
      return { counter: yourOffer, message: getAcceptMessage(seller, offerPct), accepted: true, rejected: false };
    }
    // Counter slightly above offer
    const midpoint = (yourOffer + askingPrice) / 2;
    const counter = Math.round(yourOffer + (midpoint - yourOffer) * (1 - seller.flexibility));
    return { counter: Math.max(counter, Math.round(floorPrice)), message: getCounterMessage(seller, round), accepted: false, rejected: false };
  }

  // Below floor — counter toward floor
  if (round >= maxRounds - 1) {
    return { counter: 0, message: getRejectMessage(seller), accepted: false, rejected: true };
  }

  const gap = floorPrice - yourOffer;
  const counter = Math.round(yourOffer + gap * (0.6 + (1 - seller.flexibility) * 0.3));
  return { counter, message: getCounterMessage(seller, round), accepted: false, rejected: false };
}

function getAcceptMessage(seller: Seller, pct: number): string {
  if (pct > 0.92) return 'Deal. That\'s fair for both of us.';
  switch (seller.personality) {
    case 'firm': return 'Alright, you wore me down. Deal.';
    case 'flexible': return 'Sure, that works for me! Deal.';
    case 'desperate': return 'Fine, I need the cash. It\'s yours.';
    case 'savvy': return 'You drive a hard bargain. Deal.';
    case 'friendly': return 'That feels right. Let\'s shake on it!';
    default: return 'Deal!';
  }
}

function getCounterMessage(seller: Seller, round: number): string {
  const messages: Record<string, string[]> = {
    firm: ['I know what this is worth. How about...', 'That\'s below comps. Best I can do is...', 'I\'m not budging much. Let\'s meet at...'],
    flexible: ['Hmm, that\'s a bit low. What about...', 'I could come down a little...', 'Tell you what, let me offer...'],
    desperate: ['I really need to sell, but not that low...', 'Can you come up a bit? How about...', 'Last offer before I try someone else...'],
    savvy: ['I checked eBay sold just this morning...', 'PSA 10 pop is only 200, so...', 'The market says this is worth at least...'],
    friendly: ['I want to make a deal, but...', 'We\'re getting close! What about...', 'Almost there — can you do...'],
  };
  const m = messages[seller.personality] || messages.friendly;
  return m[round % m.length];
}

function getRejectMessage(seller: Seller): string {
  switch (seller.personality) {
    case 'firm': return 'Sorry, can\'t do it at that price. Maybe next time.';
    case 'flexible': return 'I wish I could but that\'s below what I paid. No deal.';
    case 'desperate': return 'Even I can\'t go that low. Sorry, no deal.';
    case 'savvy': return 'I know what this is worth. I\'ll find another buyer.';
    case 'friendly': return 'I want to make a deal but I can\'t go that low. No hard feelings!';
    default: return 'No deal. Thanks for your time.';
  }
}

function getTip(seller: Seller, round: number, offerPct: number): string {
  if (round === 0 && offerPct > 0.9) return 'Tip: Starting high leaves no room to negotiate. Try opening at 60-75% of asking.';
  if (round === 0 && offerPct < 0.5) return 'Tip: Very low openers can offend sellers. 60-70% is a good starting point.';
  if (round === 0) return 'Tip: Good opening offer! Leave yourself room for 2-3 rounds of back-and-forth.';
  if (seller.personality === 'firm' && round >= 2) return 'Tip: Firm sellers rarely move more than 10-15%. Know when to walk away or accept.';
  if (seller.personality === 'desperate' && round >= 1) return 'Tip: Desperate sellers have lower floors. Be patient but fair.';
  if (round >= 3) return 'Tip: After 3+ rounds, the seller is running out of patience. Make your best final offer.';
  return 'Tip: Each counter should split the difference. Gradual moves show you\'re serious.';
}

/* ── main component ──────────────────────────────────────────────── */

export default function NegotiatorClient() {
  const [phase, setPhase] = useState<'browse' | 'negotiate' | 'result'>('browse');
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [negotiation, setNegotiation] = useState<NegotiationState | null>(null);
  const [offerInput, setOfferInput] = useState('');
  const [tip, setTip] = useState('');
  const [stats, setStats] = useState<Stats>({ deals: 0, totalSaved: 0, bestDiscount: 0, walkAways: 0, avgDiscount: 0 });
  const [mounted, setMounted] = useState(false);

  const cards = useMemo(() => {
    return sportsCards
      .filter(c => (c.sport as string) !== 'pokemon')
      .map(c => ({
        name: c.name,
        player: c.player,
        sport: c.sport as string,
        year: c.year,
        value: parseValue(c.estimatedValueRaw || '$0'),
        slug: c.slug,
      }))
      .filter(c => c.value >= 10) // only negotiate cards worth $10+
      .sort((a, b) => b.value - a.value);
  }, []);

  const filteredCards = useMemo(() => {
    let list = cards;
    if (sportFilter !== 'all') list = list.filter(c => c.sport === sportFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c => c.player.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
    }
    return list.slice(0, 50);
  }, [cards, sportFilter, search]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const saved = localStorage.getItem('cv-negotiator-stats');
    if (saved) {
      try { setStats(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, [mounted]);

  const startNegotiation = useCallback((card: CardItem) => {
    // Pick random seller based on card value
    const rng = seededRng(dateHash(new Date()) + card.value);
    const seller = SELLERS[Math.floor(rng() * SELLERS.length)];

    // Seller marks up 15-40% above card's estimated value
    const markup = 1.15 + rng() * 0.25;
    const askingPrice = Math.round(card.value * markup);

    setNegotiation({
      card,
      seller,
      askingPrice,
      currentOffer: 0,
      sellerCounter: askingPrice,
      round: 0,
      maxRounds: 5,
      history: [{ actor: 'seller', amount: askingPrice, message: `I\'m asking $${askingPrice.toLocaleString()} for this ${card.player} card. What\'s your offer?` }],
      status: 'offering',
    });
    setOfferInput('');
    setTip('Tip: Start at 60-75% of the asking price to leave room for negotiation.');
    setPhase('negotiate');
  }, []);

  const submitOffer = useCallback(() => {
    if (!negotiation) return;
    const offer = parseInt(offerInput.replace(/[^0-9]/g, ''), 10);
    if (isNaN(offer) || offer <= 0) return;

    const { seller, askingPrice, round, maxRounds, history } = negotiation;

    // Add your offer to history
    const newHistory = [...history, {
      actor: 'you' as const,
      amount: offer,
      message: `I\'ll offer $${offer.toLocaleString()}.`,
    }];

    // Get seller response
    const response = getSellerResponse(seller, askingPrice, offer, round, maxRounds);
    const offerPct = offer / askingPrice;

    if (response.accepted) {
      // Deal made
      const savedAmount = askingPrice - offer;
      const discountPct = Math.round((savedAmount / askingPrice) * 100);
      newHistory.push({ actor: 'seller', amount: offer, message: response.message });
      setNegotiation({ ...negotiation, history: newHistory, currentOffer: offer, status: 'accepted', round: round + 1 });
      setTip(`You saved $${savedAmount.toLocaleString()} (${discountPct}% off asking)!`);

      // Update stats
      setStats(prev => {
        const updated = {
          deals: prev.deals + 1,
          totalSaved: prev.totalSaved + savedAmount,
          bestDiscount: Math.max(prev.bestDiscount, discountPct),
          walkAways: prev.walkAways,
          avgDiscount: Math.round(((prev.avgDiscount * prev.deals) + discountPct) / (prev.deals + 1)),
        };
        localStorage.setItem('cv-negotiator-stats', JSON.stringify(updated));
        return updated;
      });
      setPhase('result');
    } else if (response.rejected) {
      // Deal fell through
      newHistory.push({ actor: 'seller', amount: 0, message: response.message });
      setNegotiation({ ...negotiation, history: newHistory, status: 'rejected', round: round + 1 });
      setTip('The seller walked away. Try a higher opening offer next time.');
      setPhase('result');
    } else {
      // Counter offer
      newHistory.push({ actor: 'seller', amount: response.counter, message: `${response.message} $${response.counter.toLocaleString()}.` });
      setNegotiation({ ...negotiation, history: newHistory, sellerCounter: response.counter, currentOffer: offer, round: round + 1, status: 'countered' });
      setTip(getTip(seller, round + 1, offerPct));
    }
    setOfferInput('');
  }, [negotiation, offerInput]);

  const walkAway = useCallback(() => {
    if (!negotiation) return;
    setNegotiation({ ...negotiation, status: 'walkaway' });
    setTip('Walking away is a valid strategy. Sometimes the best deal is no deal.');
    setStats(prev => {
      const updated = { ...prev, walkAways: prev.walkAways + 1 };
      localStorage.setItem('cv-negotiator-stats', JSON.stringify(updated));
      return updated;
    });
    setPhase('result');
  }, [negotiation]);

  const acceptCounter = useCallback(() => {
    if (!negotiation) return;
    const { seller, askingPrice, sellerCounter, history } = negotiation;
    const savedAmount = askingPrice - sellerCounter;
    const discountPct = Math.round((savedAmount / askingPrice) * 100);

    const newHistory = [...history,
      { actor: 'you' as const, amount: sellerCounter, message: `OK, I\'ll take it at $${sellerCounter.toLocaleString()}.` },
      { actor: 'seller' as const, amount: sellerCounter, message: 'Done deal! Pleasure doing business.' },
    ];

    setNegotiation({ ...negotiation, history: newHistory, currentOffer: sellerCounter, status: 'accepted' });
    setTip(savedAmount > 0 ? `You saved $${savedAmount.toLocaleString()} (${discountPct}% off asking)!` : 'You paid the asking price.');

    setStats(prev => {
      const updated = {
        deals: prev.deals + 1,
        totalSaved: prev.totalSaved + savedAmount,
        bestDiscount: Math.max(prev.bestDiscount, discountPct),
        walkAways: prev.walkAways,
        avgDiscount: Math.round(((prev.avgDiscount * prev.deals) + discountPct) / (prev.deals + 1)),
      };
      localStorage.setItem('cv-negotiator-stats', JSON.stringify(updated));
      return updated;
    });
    setPhase('result');
  }, [negotiation]);

  if (!mounted) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  /* ── result screen ─────────────────────────────────────────────── */
  if (phase === 'result' && negotiation) {
    const { card, seller, askingPrice, currentOffer, status, history } = negotiation;
    const savedAmount = status === 'accepted' ? askingPrice - currentOffer : 0;
    const discountPct = status === 'accepted' ? Math.round((savedAmount / askingPrice) * 100) : 0;

    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Negotiation Result</h1>

        <div className={`bg-gray-900/50 border rounded-xl p-6 text-center ${
          status === 'accepted' ? 'border-green-600/50' : status === 'walkaway' ? 'border-amber-600/50' : 'border-red-600/50'
        }`}>
          <p className="text-4xl mb-2">
            {status === 'accepted' ? '\u2705' : status === 'walkaway' ? '\uD83D\uDEB6' : '\u274C'}
          </p>
          <p className={`text-2xl font-bold ${
            status === 'accepted' ? 'text-green-400' : status === 'walkaway' ? 'text-amber-400' : 'text-red-400'
          }`}>
            {status === 'accepted' ? 'Deal Made!' : status === 'walkaway' ? 'You Walked Away' : 'No Deal'}
          </p>

          {status === 'accepted' && (
            <div className="mt-4 space-y-2">
              <p className="text-gray-300"><span className="text-gray-500">Card:</span> {card.player} ({card.year})</p>
              <p className="text-gray-300"><span className="text-gray-500">Asking:</span> <span className="line-through text-gray-500">${askingPrice.toLocaleString()}</span></p>
              <p className="text-2xl text-white font-bold">Paid: ${currentOffer.toLocaleString()}</p>
              {savedAmount > 0 && <p className="text-green-400 font-bold">Saved ${savedAmount.toLocaleString()} ({discountPct}% off)</p>}
            </div>
          )}
        </div>

        {/* Negotiation replay */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mt-4">
          <h3 className="text-sm font-bold text-gray-300 mb-3">Negotiation Replay</h3>
          <div className="space-y-3">
            {history.map((h, i) => (
              <div key={i} className={`flex ${h.actor === 'you' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                  h.actor === 'you' ? 'bg-blue-900/50 text-blue-200' : 'bg-gray-800 text-gray-300'
                }`}>
                  <p className="text-xs text-gray-500 mb-1">{h.actor === 'you' ? 'You' : seller.name}</p>
                  <p>{h.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-amber-900/20 border border-amber-800/30 rounded-xl p-4 mt-4">
          <p className="text-amber-400 text-sm font-medium">{tip}</p>
        </div>

        {/* Lifetime stats */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mt-4">
          <h3 className="text-sm font-bold text-gray-300 mb-3">Your Negotiation Stats</h3>
          <div className="grid grid-cols-4 gap-3 text-center text-xs">
            <div><p className="text-white font-bold">{stats.deals}</p><p className="text-gray-500">Deals</p></div>
            <div><p className="text-green-400 font-bold">${stats.totalSaved.toLocaleString()}</p><p className="text-gray-500">Total Saved</p></div>
            <div><p className="text-amber-400 font-bold">{stats.bestDiscount}%</p><p className="text-gray-500">Best Discount</p></div>
            <div><p className="text-gray-300 font-bold">{stats.walkAways}</p><p className="text-gray-500">Walk Aways</p></div>
          </div>
        </div>

        <div className="flex gap-3 mt-6 justify-center">
          <button onClick={() => setPhase('browse')} className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium">Negotiate Another</button>
        </div>

        {/* Related links */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/tools/flip-calc', label: 'Flip Calculator', icon: '\uD83D\uDCB0' },
            { href: '/card-dealer', label: 'Dealer Sim', icon: '\uD83C\uDCCF' },
            { href: '/card-show-prep', label: 'Show Prep Kit', icon: '\uD83D\uDCCB' },
            { href: '/tools/smart-buy-list', label: 'Smart Buy List', icon: '\uD83D\uDED2' },
            { href: '/vault/appraisal', label: 'Card Appraisal', icon: '\uD83D\uDD0D' },
            { href: '/vault/bulk-sale', label: 'Bulk Sale Calc', icon: '\uD83D\uDCE6' },
            { href: '/tools/trade', label: 'Trade Evaluator', icon: '\u2696\uFE0F' },
            { href: '/card-blackjack', label: 'Card Blackjack', icon: '\uD83C\uDCCF' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="bg-gray-900/50 border border-gray-800 rounded-lg p-3 text-center hover:border-amber-600/50 transition-colors">
              <span className="text-lg">{l.icon}</span>
              <p className="text-xs text-gray-300 mt-1">{l.label}</p>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  /* ── negotiation screen ────────────────────────────────────────── */
  if (phase === 'negotiate' && negotiation) {
    const { card, seller, askingPrice, sellerCounter, round, maxRounds, history, status } = negotiation;
    const roundsLeft = maxRounds - round;

    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">Negotiate</h1>
          <span className="text-sm text-gray-400">Round {round + 1}/{maxRounds}</span>
        </div>

        {/* Card + Seller info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">{SPORT_ICONS[card.sport]} Card</p>
            <p className="text-white font-bold text-sm">{card.player}</p>
            <p className="text-gray-400 text-xs">{card.name}</p>
            <p className="text-green-400 text-sm mt-1">Market: ~${card.value.toLocaleString()}</p>
            <p className="text-amber-400 text-sm">Asking: ${askingPrice.toLocaleString()}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <p className="text-2xl mb-1">{seller.avatar}</p>
            <p className="text-white font-bold text-sm">{seller.name}</p>
            <p className="text-gray-400 text-xs">{seller.description}</p>
            <p className="text-xs mt-2 text-gray-500">Rounds left: {roundsLeft}</p>
          </div>
        </div>

        {/* Chat history */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mb-4 max-h-60 overflow-y-auto">
          <div className="space-y-3">
            {history.map((h, i) => (
              <div key={i} className={`flex ${h.actor === 'you' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                  h.actor === 'you' ? 'bg-blue-900/50 text-blue-200' : 'bg-gray-800 text-gray-300'
                }`}>
                  <p>{h.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tip bar */}
        {tip && (
          <div className="bg-amber-900/20 border border-amber-800/30 rounded-lg px-4 py-2 mb-4">
            <p className="text-amber-400 text-xs">{tip}</p>
          </div>
        )}

        {/* Actions */}
        {(status === 'offering' || status === 'countered') && roundsLeft > 0 && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="text"
                  value={offerInput}
                  onChange={e => setOfferInput(e.target.value.replace(/[^0-9]/g, ''))}
                  onKeyDown={e => e.key === 'Enter' && submitOffer()}
                  placeholder={status === 'countered' ? `Counter to $${sellerCounter.toLocaleString()}...` : 'Your offer...'}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-8 py-3 text-white text-lg focus:border-amber-500 focus:outline-none"
                />
              </div>
              <button onClick={submitOffer} className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold">Offer</button>
            </div>
            <div className="flex gap-2 justify-center">
              {status === 'countered' && (
                <button onClick={acceptCounter} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm">Accept ${sellerCounter.toLocaleString()}</button>
              )}
              <button onClick={walkAway} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm">Walk Away</button>
            </div>
            {/* Quick offer buttons */}
            <div className="flex gap-2 justify-center flex-wrap">
              {[0.60, 0.70, 0.80, 0.90].map(pct => {
                const amt = Math.round(askingPrice * pct);
                return (
                  <button
                    key={pct}
                    onClick={() => setOfferInput(String(amt))}
                    className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs rounded-full"
                  >
                    {Math.round(pct * 100)}% (${amt.toLocaleString()})
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── browse / card selection screen ────────────────────────────── */
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Card Price Negotiator</h1>
      <p className="text-gray-400 text-sm mb-6">Practice your card show haggling skills. Pick a card, negotiate with an AI seller, and see how much you can save.</p>

      {/* Stats bar */}
      {stats.deals > 0 && (
        <div className="flex justify-between items-center bg-gray-900/50 border border-gray-800 rounded-lg px-4 py-2 mb-4 text-xs">
          <span className="text-gray-400">{stats.deals} deals closed</span>
          <span className="text-green-400 font-bold">${stats.totalSaved.toLocaleString()} saved</span>
          <span className="text-amber-400">Best: {stats.bestDiscount}% off</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {['all', 'baseball', 'basketball', 'football', 'hockey'].map(s => (
          <button
            key={s}
            onClick={() => setSportFilter(s)}
            className={`px-3 py-1.5 text-sm rounded-full ${
              sportFilter === s ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {s === 'all' ? 'All' : `${SPORT_ICONS[s]} ${s.charAt(0).toUpperCase() + s.slice(1)}`}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by player or card name..."
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm mb-4 focus:border-amber-500 focus:outline-none"
      />

      {/* Card list */}
      <div className="space-y-2">
        {filteredCards.map(card => (
          <button
            key={card.slug}
            onClick={() => startNegotiation(card)}
            className="w-full text-left bg-gray-900/50 border border-gray-800 hover:border-amber-600/50 rounded-lg p-3 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium">{SPORT_ICONS[card.sport]} {card.player}</p>
                <p className="text-gray-500 text-xs">{card.name}</p>
              </div>
              <div className="text-right">
                <p className="text-green-400 text-sm font-bold">${card.value.toLocaleString()}</p>
                <p className="text-gray-500 text-xs">est. value</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {filteredCards.length === 0 && (
        <p className="text-center text-gray-500 py-8">No cards found. Try a different search or filter.</p>
      )}
    </div>
  );
}

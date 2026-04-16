'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { sportsCards } from '@/data/sports-cards';

type HouseId = 'heritage' | 'goldin' | 'pwcc' | 'rea' | 'lelands';
type LotPhase = 'opening' | 'active' | 'going-once' | 'going-twice' | 'last-call' | 'sold' | 'passed';

interface AuctionHouse {
  id: HouseId;
  name: string;
  short: string;
  emoji: string;
  accent: string;
  border: string;
  dot: string;
  specialty: string;
  buyerPremium: number;
  tempo: number;         // ms per tick (lower = faster)
  aggression: number;    // 0-1, how aggressively AI bids
  topEnd: number;        // multiplier on estimate for top AI willingness
}

interface Lot {
  id: string;
  card: typeof sportsCards[number];
  estimate: number;
  currentBid: number;
  leadingBidder: string;
  youLeading: boolean;
  phase: LotPhase;
  chant: string;
  callCountdown: number; // ticks remaining in current call phase
  history: { bidder: string; amount: number }[];
  startedAt: number;
}

interface HouseState {
  house: AuctionHouse;
  lot: Lot;
  idleTicks: number;     // ticks since last bid
}

interface WonLot {
  cardSlug: string;
  cardName: string;
  cardSport: string;
  cardYear: number;
  hammer: number;
  premium: number;
  total: number;
  estimate: number;
  house: string;
  wonAt: number;
}

interface Stats {
  lotsWon: number;
  lotsLost: number;
  totalSpent: number;
  biggestSteal: number;   // estimate - hammer (positive = steal)
  biggestOverpay: number; // hammer - estimate (positive = overpay)
}

const HOUSES: AuctionHouse[] = [
  {
    id: 'heritage',
    name: 'Heritage Auctions',
    short: 'Heritage',
    emoji: '🏛️',
    accent: 'text-amber-400',
    border: 'border-amber-700/50',
    dot: 'bg-amber-500',
    specialty: 'Vintage + high-end modern',
    buyerPremium: 0.20,
    tempo: 1700,
    aggression: 0.55,
    topEnd: 1.15,
  },
  {
    id: 'goldin',
    name: 'Goldin',
    short: 'Goldin',
    emoji: '🔥',
    accent: 'text-orange-400',
    border: 'border-orange-700/50',
    dot: 'bg-orange-500',
    specialty: 'Modern stars + influencer hype',
    buyerPremium: 0.22,
    tempo: 1200,
    aggression: 0.75,
    topEnd: 1.25,
  },
  {
    id: 'pwcc',
    name: 'PWCC Marketplace',
    short: 'PWCC',
    emoji: '📦',
    accent: 'text-sky-400',
    border: 'border-sky-700/50',
    dot: 'bg-sky-500',
    specialty: 'Graded cards bridge',
    buyerPremium: 0.20,
    tempo: 1500,
    aggression: 0.6,
    topEnd: 1.12,
  },
  {
    id: 'rea',
    name: 'Robert Edward Auctions',
    short: 'REA',
    emoji: '📜',
    accent: 'text-emerald-400',
    border: 'border-emerald-700/50',
    dot: 'bg-emerald-500',
    specialty: 'Pre-war + 1950s cardboard',
    buyerPremium: 0.20,
    tempo: 1900,
    aggression: 0.5,
    topEnd: 1.08,
  },
  {
    id: 'lelands',
    name: 'Lelands',
    short: 'Lelands',
    emoji: '🎽',
    accent: 'text-violet-400',
    border: 'border-violet-700/50',
    dot: 'bg-violet-500',
    specialty: 'Memorabilia + unusual lots',
    buyerPremium: 0.23,
    tempo: 1600,
    aggression: 0.45,
    topEnd: 1.30,
  },
];

const AI_BIDDERS = [
  'Paddle #247', 'Paddle #118', 'Paddle #093', 'Paddle #412',
  'Phone Bidder A', 'Phone Bidder B', 'Phone Bidder C',
  'The Room', 'Back Row',
  'Internet Bidder #12', 'Internet Bidder #47', 'Internet Bidder #188',
  'Floor Agent', 'Absentee Bid',
];

const STARTING_BUDGET = 10000;
const STORAGE_KEY = 'cv-auction-paddle-v1';

function formatMoney(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}
function formatMoneyFull(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

function parseCardValue(val: string): number {
  const m = val.match(/\$([0-9,.]+)/);
  return m ? parseFloat(m[1].replace(/,/g, '')) : 50;
}

function nextIncrement(bid: number): number {
  if (bid < 100) return 10;
  if (bid < 500) return 25;
  if (bid < 1000) return 50;
  if (bid < 2500) return 100;
  if (bid < 10000) return 250;
  if (bid < 50000) return 500;
  return 1000;
}

function pickCardForHouse(house: AuctionHouse, rng: () => number): typeof sportsCards[number] {
  // Heritage + REA lean vintage (year < 2000). Goldin + PWCC lean modern. Lelands random.
  const pool = sportsCards.filter(c => {
    const val = parseCardValue(c.estimatedValueRaw);
    if (val < 25) return false;
    if (house.id === 'heritage' || house.id === 'rea') return c.year < 2005 || val > 500;
    if (house.id === 'goldin') return c.year >= 2015 || val > 200;
    if (house.id === 'pwcc') return val >= 100;
    return true;
  });
  const source = pool.length > 50 ? pool : sportsCards.filter(c => parseCardValue(c.estimatedValueRaw) >= 25);
  return source[Math.floor(rng() * source.length)];
}

function createLot(house: AuctionHouse, rng: () => number, now: number): Lot {
  const card = pickCardForHouse(house, rng);
  const rawVal = parseCardValue(card.estimatedValueRaw);
  const estimate = Math.max(50, Math.round(rawVal * (0.85 + rng() * 0.4)));
  const opening = Math.max(25, Math.round(estimate * (0.3 + rng() * 0.15)));
  return {
    id: `${house.id}-${now}-${Math.floor(rng() * 10000)}`,
    card,
    estimate,
    currentBid: opening,
    leadingBidder: AI_BIDDERS[Math.floor(rng() * AI_BIDDERS.length)],
    youLeading: false,
    phase: 'opening',
    chant: `Opening at ${formatMoneyFull(opening)}, ${formatMoneyFull(opening)} bid on the floor`,
    callCountdown: 0,
    history: [],
    startedAt: now,
  };
}

function loadStats(): Stats {
  if (typeof window === 'undefined') return { lotsWon: 0, lotsLost: 0, totalSpent: 0, biggestSteal: 0, biggestOverpay: 0 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { lotsWon: 0, lotsLost: 0, totalSpent: 0, biggestSteal: 0, biggestOverpay: 0 };
    return JSON.parse(raw).stats ?? { lotsWon: 0, lotsLost: 0, totalSpent: 0, biggestSteal: 0, biggestOverpay: 0 };
  } catch {
    return { lotsWon: 0, lotsLost: 0, totalSpent: 0, biggestSteal: 0, biggestOverpay: 0 };
  }
}

function saveStats(stats: Stats, recentWins: WonLot[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ stats, recentWins: recentWins.slice(0, 20) }));
  } catch { /* noop */ }
}

export default function AuctionPaddleClient() {
  const [focused, setFocused] = useState<HouseId>('heritage');
  const [budget, setBudget] = useState<number>(STARTING_BUDGET);
  const [houseStates, setHouseStates] = useState<HouseState[]>(() => {
    const rng = Math.random;
    const now = Date.now();
    return HOUSES.map(h => ({
      house: h,
      lot: createLot(h, rng, now),
      idleTicks: 0,
    }));
  });
  const [wonLots, setWonLots] = useState<WonLot[]>([]);
  const [stats, setStats] = useState<Stats>({ lotsWon: 0, lotsLost: 0, totalSpent: 0, biggestSteal: 0, biggestOverpay: 0 });
  const [paused, setPaused] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const stateRef = useRef(houseStates);
  stateRef.current = houseStates;
  const budgetRef = useRef(budget);
  budgetRef.current = budget;

  useEffect(() => { setStats(loadStats()); }, []);

  useEffect(() => { saveStats(stats, wonLots); }, [stats, wonLots]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const advanceLot = useCallback((hs: HouseState, now: number): HouseState => {
    const { house, lot } = hs;
    const rng = Math.random;
    let newLot = { ...lot };
    let idleTicks = hs.idleTicks + 1;

    // AI bid attempt (probabilistic)
    const aiMaxBid = lot.estimate * house.topEnd;
    const canAiAfford = lot.currentBid + nextIncrement(lot.currentBid) <= aiMaxBid;
    // AI bids more aggressively early, less when price exceeds estimate
    const priceHeat = Math.min(1, lot.currentBid / lot.estimate);
    const bidChance = house.aggression * (1.2 - priceHeat * 0.9);

    if (
      canAiAfford &&
      lot.phase !== 'sold' &&
      lot.phase !== 'passed' &&
      rng() < bidChance &&
      idleTicks >= 1
    ) {
      const inc = nextIncrement(lot.currentBid);
      const newBid = lot.currentBid + inc;
      const bidder = AI_BIDDERS[Math.floor(rng() * AI_BIDDERS.length)];
      newLot = {
        ...newLot,
        currentBid: newBid,
        leadingBidder: bidder,
        youLeading: false,
        phase: 'active',
        chant: `${formatMoneyFull(newBid)} bid! ${bidder}. Do I hear ${formatMoneyFull(newBid + nextIncrement(newBid))}?`,
        callCountdown: 0,
        history: [...newLot.history, { bidder, amount: newBid }],
      };
      idleTicks = 0;
      return { ...hs, lot: newLot, idleTicks };
    }

    // No new bid — advance phase based on idle ticks
    if (lot.phase === 'sold' || lot.phase === 'passed') {
      // Start a new lot after a pause (2 idle ticks)
      if (idleTicks >= 2) {
        return { house, lot: createLot(house, rng, now), idleTicks: 0 };
      }
      return { ...hs, idleTicks };
    }

    if (lot.phase === 'opening' || lot.phase === 'active') {
      if (idleTicks >= 3) {
        newLot = {
          ...newLot,
          phase: 'going-once',
          chant: `Going once at ${formatMoneyFull(lot.currentBid)}... ${lot.leadingBidder} leads`,
          callCountdown: 2,
        };
      } else {
        newLot = {
          ...newLot,
          chant: `${formatMoneyFull(lot.currentBid)} bid... do I hear ${formatMoneyFull(lot.currentBid + nextIncrement(lot.currentBid))}?`,
        };
      }
      return { ...hs, lot: newLot, idleTicks };
    }

    if (lot.phase === 'going-once') {
      if (newLot.callCountdown > 0) {
        newLot = { ...newLot, callCountdown: newLot.callCountdown - 1, chant: `Going once... ${formatMoneyFull(lot.currentBid)}` };
        return { ...hs, lot: newLot, idleTicks };
      }
      newLot = {
        ...newLot,
        phase: 'going-twice',
        chant: `Going twice at ${formatMoneyFull(lot.currentBid)}...`,
        callCountdown: 2,
      };
      return { ...hs, lot: newLot, idleTicks };
    }

    if (lot.phase === 'going-twice') {
      if (newLot.callCountdown > 0) {
        newLot = { ...newLot, callCountdown: newLot.callCountdown - 1, chant: `Going twice... ${formatMoneyFull(lot.currentBid)}` };
        return { ...hs, lot: newLot, idleTicks };
      }
      newLot = {
        ...newLot,
        phase: 'last-call',
        chant: `Last call at ${formatMoneyFull(lot.currentBid)}...`,
        callCountdown: 1,
      };
      return { ...hs, lot: newLot, idleTicks };
    }

    if (lot.phase === 'last-call') {
      // Hammer down
      if (lot.youLeading) {
        const hammer = lot.currentBid;
        const premium = Math.round(hammer * house.buyerPremium);
        const total = hammer + premium;
        // Check budget
        if (total <= budgetRef.current) {
          setBudget(b => b - total);
          const won: WonLot = {
            cardSlug: lot.card.slug,
            cardName: lot.card.name,
            cardSport: lot.card.sport,
            cardYear: lot.card.year,
            hammer,
            premium,
            total,
            estimate: lot.estimate,
            house: house.short,
            wonAt: now,
          };
          setWonLots(prev => [won, ...prev].slice(0, 40));
          setStats(prev => {
            const diff = lot.estimate - hammer;
            return {
              lotsWon: prev.lotsWon + 1,
              lotsLost: prev.lotsLost,
              totalSpent: prev.totalSpent + total,
              biggestSteal: diff > 0 ? Math.max(prev.biggestSteal, diff) : prev.biggestSteal,
              biggestOverpay: diff < 0 ? Math.max(prev.biggestOverpay, -diff) : prev.biggestOverpay,
            };
          });
          setToast(`🔨 HAMMER! ${lot.card.name} — ${formatMoneyFull(total)} (${house.short})`);
          newLot = {
            ...newLot,
            phase: 'sold',
            chant: `🔨 SOLD! ${formatMoneyFull(hammer)} to YOU at paddle! +${formatMoneyFull(premium)} premium = ${formatMoneyFull(total)}`,
          };
        } else {
          // Can't afford premium — forfeit
          setToast(`❌ Can't cover ${formatMoneyFull(total)} premium — lot forfeited`);
          setStats(prev => ({ ...prev, lotsLost: prev.lotsLost + 1 }));
          newLot = {
            ...newLot,
            phase: 'passed',
            chant: `⚠️ Paddle can't cover premium — lot passed`,
          };
        }
      } else {
        setStats(prev => ({ ...prev, lotsLost: lot.history.some(h => h.bidder === 'YOU') ? prev.lotsLost + 1 : prev.lotsLost }));
        newLot = {
          ...newLot,
          phase: 'sold',
          chant: `🔨 SOLD! ${formatMoneyFull(lot.currentBid)} to ${lot.leadingBidder}`,
        };
      }
      return { ...hs, lot: newLot, idleTicks: 0 };
    }

    return hs;
  }, []);

  // Game tick loop — each house ticks on its own tempo via a master loop
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      const now = Date.now();
      setHouseStates(prev =>
        prev.map(hs => {
          // Only tick if enough time since startedAt + (tickNumber * tempo)
          const elapsed = now - hs.lot.startedAt;
          const expectedTicks = Math.floor(elapsed / hs.house.tempo);
          const actualTicks = hs.lot.history.length + hs.idleTicks;
          if (expectedTicks > actualTicks) {
            return advanceLot(hs, now);
          }
          return hs;
        }),
      );
    }, 400);
    return () => clearInterval(timer);
  }, [paused, advanceLot]);

  const focusedState = houseStates.find(hs => hs.house.id === focused)!;

  const raisePaddle = () => {
    if (focusedState.lot.phase === 'sold' || focusedState.lot.phase === 'passed') return;
    if (focusedState.lot.youLeading) {
      setToast('You already lead this lot');
      return;
    }
    const inc = nextIncrement(focusedState.lot.currentBid);
    const newBid = focusedState.lot.currentBid + inc;
    const premium = Math.round(newBid * focusedState.house.buyerPremium);
    const total = newBid + premium;
    if (total > budgetRef.current) {
      setToast(`Budget short — need ${formatMoneyFull(total)} incl. ${Math.round(focusedState.house.buyerPremium * 100)}% premium`);
      return;
    }
    setHouseStates(prev =>
      prev.map(hs => {
        if (hs.house.id !== focused) return hs;
        return {
          ...hs,
          idleTicks: 0,
          lot: {
            ...hs.lot,
            currentBid: newBid,
            leadingBidder: 'YOU',
            youLeading: true,
            phase: 'active',
            chant: `🎯 ${formatMoneyFull(newBid)} from the paddle! Do I hear ${formatMoneyFull(newBid + nextIncrement(newBid))}?`,
            callCountdown: 0,
            history: [...hs.lot.history, { bidder: 'YOU', amount: newBid }],
          },
        };
      }),
    );
  };

  const resetSession = () => {
    setBudget(STARTING_BUDGET);
    setWonLots([]);
    const rng = Math.random;
    const now = Date.now();
    setHouseStates(HOUSES.map(h => ({ house: h, lot: createLot(h, rng, now), idleTicks: 0 })));
    setToast('Session reset — budget restored');
  };

  const resetAllStats = () => {
    if (!confirm('Clear all-time stats and won lots? This cannot be undone.')) return;
    const fresh = { lotsWon: 0, lotsLost: 0, totalSpent: 0, biggestSteal: 0, biggestOverpay: 0 };
    setStats(fresh);
    setWonLots([]);
    saveStats(fresh, []);
    setToast('Stats cleared');
  };

  const totalLotsWonThisSession = wonLots.length;
  const totalSpentThisSession = wonLots.reduce((sum, w) => sum + w.total, 0);
  const rawCurrentBid = focusedState.lot.currentBid;
  const focusedPremium = focusedState.house.buyerPremium;
  const focusedNextInc = nextIncrement(rawCurrentBid);
  const yourNextBidTotal = Math.round((rawCurrentBid + focusedNextInc) * (1 + focusedPremium));

  const estimateDelta = useMemo(() => {
    const lot = focusedState.lot;
    const pct = ((lot.currentBid / lot.estimate) - 1) * 100;
    return pct;
  }, [focusedState.lot]);

  return (
    <div className="space-y-4">
      {/* Top bar: budget + session controls */}
      <div className="bg-gradient-to-br from-red-950/40 to-gray-900 border border-red-900/40 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-red-300/70 text-xs uppercase tracking-wide">Paddle Budget</div>
            <div className="text-3xl font-bold text-white tabular-nums">{formatMoneyFull(budget)}</div>
            <div className="text-gray-500 text-xs mt-0.5">
              {totalLotsWonThisSession} lot{totalLotsWonThisSession === 1 ? '' : 's'} won · {formatMoneyFull(totalSpentThisSession)} spent this session
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPaused(p => !p)}
              className="px-3 py-2 text-sm bg-gray-800 border border-gray-700 hover:border-gray-600 text-white rounded-lg transition-colors"
            >
              {paused ? '▶ Resume' : '⏸ Pause'}
            </button>
            <button
              onClick={resetSession}
              className="px-3 py-2 text-sm bg-gray-800 border border-gray-700 hover:border-gray-600 text-white rounded-lg transition-colors"
            >
              ↺ Reset
            </button>
          </div>
        </div>
      </div>

      {/* House chips */}
      <div className="grid grid-cols-5 gap-2">
        {houseStates.map(hs => {
          const active = hs.house.id === focused;
          const lot = hs.lot;
          const youLead = lot.youLeading;
          return (
            <button
              key={hs.house.id}
              onClick={() => setFocused(hs.house.id)}
              className={`relative text-left p-2 sm:p-3 rounded-xl border transition-all ${
                active
                  ? `bg-gray-900 ${hs.house.border} ring-2 ring-offset-2 ring-offset-black ring-red-600`
                  : 'bg-gray-900/60 border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center gap-1 mb-1">
                <span className={`w-1.5 h-1.5 rounded-full ${hs.house.dot} ${lot.phase !== 'sold' && lot.phase !== 'passed' ? 'animate-pulse' : 'opacity-40'}`} />
                <span className={`text-[10px] sm:text-xs font-semibold ${hs.house.accent}`}>{hs.house.short}</span>
              </div>
              <div className="text-white text-sm sm:text-base font-bold tabular-nums">
                {formatMoney(lot.currentBid)}
              </div>
              <div className="text-[10px] text-gray-500 truncate">
                {lot.phase === 'sold' || lot.phase === 'passed' ? '—loading—' : `est ${formatMoney(lot.estimate)}`}
              </div>
              {youLead && (
                <div className="absolute top-1 right-1 text-[9px] font-bold text-emerald-400 bg-emerald-950/80 px-1 rounded">YOU</div>
              )}
            </button>
          );
        })}
      </div>

      {/* Focused lot */}
      <div className={`bg-gradient-to-br from-gray-950 to-gray-900 border-2 ${focusedState.house.border} rounded-2xl overflow-hidden`}>
        {/* House header */}
        <div className="px-4 sm:px-5 py-3 border-b border-gray-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{focusedState.house.emoji}</span>
            <div>
              <div className={`text-sm font-bold ${focusedState.house.accent}`}>{focusedState.house.name}</div>
              <div className="text-gray-500 text-[10px]">{focusedState.house.specialty} · {Math.round(focusedState.house.buyerPremium * 100)}% premium</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-gray-500 uppercase tracking-wide">Lot</div>
            <div className="text-sm text-white tabular-nums">#{focusedState.lot.id.slice(-4)}</div>
          </div>
        </div>

        {/* Card info + bid state */}
        <div className="p-4 sm:p-5">
          <div className="mb-3">
            <div className="text-[11px] text-gray-500 uppercase tracking-wide mb-1">Current Lot</div>
            <div className="text-white text-lg sm:text-xl font-bold leading-tight">{focusedState.lot.card.name}</div>
            <div className="text-gray-400 text-sm mt-0.5 capitalize">
              {focusedState.lot.card.sport} · {focusedState.lot.card.player}
              {focusedState.lot.card.rookie && <span className="ml-2 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">ROOKIE</span>}
            </div>
          </div>

          {/* Big bid display */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="col-span-2 bg-black/40 border border-gray-800 rounded-xl p-3">
              <div className="text-[10px] text-gray-500 uppercase tracking-wide">Hammer at</div>
              <div className="text-white text-3xl sm:text-4xl font-bold tabular-nums">{formatMoneyFull(focusedState.lot.currentBid)}</div>
              <div className={`text-xs mt-0.5 ${focusedState.lot.youLeading ? 'text-emerald-400 font-semibold' : 'text-gray-400'}`}>
                {focusedState.lot.youLeading ? '🎯 YOU lead' : `${focusedState.lot.leadingBidder} leads`}
              </div>
            </div>
            <div className="bg-black/40 border border-gray-800 rounded-xl p-3">
              <div className="text-[10px] text-gray-500 uppercase tracking-wide">Estimate</div>
              <div className="text-white text-lg font-semibold tabular-nums">{formatMoney(focusedState.lot.estimate)}</div>
              <div className={`text-xs mt-0.5 ${estimateDelta < 0 ? 'text-emerald-400' : estimateDelta > 15 ? 'text-rose-400' : 'text-gray-400'}`}>
                {estimateDelta > 0 ? '+' : ''}{estimateDelta.toFixed(0)}% vs est
              </div>
            </div>
          </div>

          {/* Auctioneer chant */}
          <div className="bg-black/60 border border-gray-800 rounded-xl p-3 mb-3 min-h-[64px]">
            <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Auctioneer</div>
            <div className={`text-sm sm:text-base font-medium ${
              focusedState.lot.phase === 'sold' ? 'text-amber-400' :
              focusedState.lot.phase === 'passed' ? 'text-rose-400' :
              focusedState.lot.phase === 'last-call' ? 'text-red-400' :
              focusedState.lot.phase === 'going-twice' ? 'text-orange-400' :
              focusedState.lot.phase === 'going-once' ? 'text-yellow-400' :
              'text-white'
            }`}>
              {focusedState.lot.chant}
            </div>
          </div>

          {/* Paddle button */}
          <button
            onClick={raisePaddle}
            disabled={focusedState.lot.phase === 'sold' || focusedState.lot.phase === 'passed' || focusedState.lot.youLeading}
            className="w-full py-4 sm:py-5 rounded-xl font-bold text-lg sm:text-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-lg shadow-red-900/30"
          >
            {focusedState.lot.youLeading
              ? '✓ You lead — wait for counterbid'
              : focusedState.lot.phase === 'sold' || focusedState.lot.phase === 'passed'
              ? 'Lot closed — next coming up'
              : `🪧 RAISE PADDLE — ${formatMoneyFull(rawCurrentBid + focusedNextInc)}`}
          </button>
          <div className="text-center text-[11px] text-gray-500 mt-2">
            Next bid: {formatMoneyFull(rawCurrentBid + focusedNextInc)} hammer · {formatMoneyFull(yourNextBidTotal)} total with {Math.round(focusedPremium * 100)}% premium
          </div>
        </div>

        {/* Bid history */}
        {focusedState.lot.history.length > 0 && (
          <div className="border-t border-gray-800 px-4 sm:px-5 py-3 bg-black/30">
            <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-2">Bid History</div>
            <div className="flex flex-wrap gap-1.5">
              {focusedState.lot.history.slice(-8).map((h, i) => (
                <div
                  key={i}
                  className={`text-[11px] px-2 py-1 rounded ${
                    h.bidder === 'YOU'
                      ? 'bg-emerald-950/60 border border-emerald-800/50 text-emerald-300'
                      : 'bg-gray-800/60 border border-gray-700 text-gray-400'
                  }`}
                >
                  {h.bidder} · {formatMoney(h.amount)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Won lots */}
      {wonLots.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm sm:text-base font-bold text-white">
              🏆 Your Won Lots <span className="text-gray-500 font-normal">({wonLots.length})</span>
            </h2>
            <div className="text-[11px] text-gray-500">Total: {formatMoneyFull(totalSpentThisSession)}</div>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {wonLots.map((w, i) => {
              const delta = w.estimate - w.hammer;
              const isSteal = delta > 0;
              return (
                <div key={i} className="flex items-center gap-3 p-2.5 bg-black/30 border border-gray-800 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{w.cardName}</div>
                    <div className="text-gray-500 text-[11px] capitalize">
                      {w.house} · {w.cardSport} · est {formatMoney(w.estimate)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-sm font-semibold tabular-nums">{formatMoneyFull(w.total)}</div>
                    <div className={`text-[10px] ${isSteal ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isSteal ? 'steal' : 'over'} {formatMoney(Math.abs(delta))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm sm:text-base font-bold text-white">All-Time Stats</h2>
          <button
            onClick={resetAllStats}
            className="text-[11px] text-gray-500 hover:text-rose-400 transition-colors"
          >
            clear
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Stat label="Lots Won" value={stats.lotsWon.toString()} />
          <Stat label="Lots Lost" value={stats.lotsLost.toString()} />
          <Stat label="Total Spent" value={formatMoney(stats.totalSpent)} />
          <Stat label="Best Steal" value={formatMoney(stats.biggestSteal)} tone="emerald" />
          <Stat label="Worst Overpay" value={formatMoney(stats.biggestOverpay)} tone="rose" />
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 border border-red-700/50 text-white text-sm px-4 py-2.5 rounded-xl shadow-xl max-w-md text-center">
          {toast}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone = 'gray' }: { label: string; value: string; tone?: 'gray' | 'emerald' | 'rose' }) {
  const toneClass = tone === 'emerald' ? 'text-emerald-400' : tone === 'rose' ? 'text-rose-400' : 'text-white';
  return (
    <div className="bg-black/30 border border-gray-800 rounded-lg p-2.5 text-center">
      <div className="text-[10px] text-gray-500 uppercase tracking-wide">{label}</div>
      <div className={`text-base sm:text-lg font-bold tabular-nums ${toneClass}`}>{value}</div>
    </div>
  );
}

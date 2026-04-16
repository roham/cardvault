'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { sportsCards, type SportsCard } from '@/data/sports-cards';

type ShowTier = 'local' | 'regional' | 'national';
type Specialty = 'vintage' | 'modern' | 'autos' | 'mixed';
type Phase = 'config' | 'live' | 'results';
type PersonaKey =
  | 'grail'
  | 'flipper'
  | 'parent'
  | 'dealer'
  | 'firsttimer'
  | 'nostalgic'
  | 'speculator'
  | 'kid';

interface Persona {
  key: PersonaKey;
  emoji: string;
  name: string;
  opener: string;
  // offer as fraction of list price (low, high)
  offerPct: [number, number];
  // ceiling as fraction of list price (if you counter above this, they walk)
  ceilingPct: [number, number];
  // how often to show up per 20 interactions (relative weight)
  weight: number;
  // whether they tolerate counter at all — kids don't
  accepts_counter: boolean;
  targetHint: string;
}

interface TierConfig {
  key: ShowTier;
  label: string;
  rental: number;
  interactions: number;
  traffic: string;
  budgetMult: number;
  weights: Partial<Record<PersonaKey, number>>;
}

interface InventoryCard {
  slug: string;
  name: string;
  player: string;
  year: number;
  sport: string;
  set: string;
  fmv: number;
  list: number;
  rookie: boolean;
  sold: boolean;
  soldFor?: number;
  soldTo?: PersonaKey;
}

interface CustomerRound {
  idx: number;
  persona: Persona;
  cardIdx: number;
  offer: number;
  ceiling: number;
  resolved: 'accepted' | 'countered' | 'rejected' | 'walked' | null;
  counterPrice?: number;
  finalPrice?: number;
  notes: string;
}

const PERSONAS: Record<PersonaKey, Persona> = {
  grail: {
    key: 'grail',
    emoji: '💎',
    name: 'Grail Hunter',
    opener: 'Heard you had a nice piece. What\'s your best on this?',
    offerPct: [0.78, 0.88],
    ceilingPct: [0.9, 0.96],
    weight: 8,
    accepts_counter: true,
    targetHint: 'wants vintage or HoF rookies',
  },
  flipper: {
    key: 'flipper',
    emoji: '🔄',
    name: 'Flipper',
    opener: 'Gotta be honest — I\'m flipping this. What\'s the floor?',
    offerPct: [0.5, 0.65],
    ceilingPct: [0.68, 0.75],
    weight: 11,
    accepts_counter: true,
    targetHint: 'wants 30%+ under FMV',
  },
  parent: {
    key: 'parent',
    emoji: '👨‍👦',
    name: 'Parent',
    opener: 'Getting a card for my kid\'s birthday. Reasonable?',
    offerPct: [0.78, 0.88],
    ceilingPct: [0.85, 0.92],
    weight: 9,
    accepts_counter: true,
    targetHint: 'wants giftable rookies/stars',
  },
  dealer: {
    key: 'dealer',
    emoji: '🤝',
    name: 'Dealer Peer',
    opener: 'Peer-to-peer — what\'s your dealer number on this?',
    offerPct: [0.52, 0.62],
    ceilingPct: [0.65, 0.72],
    weight: 7,
    accepts_counter: true,
    targetHint: 'wholesale volume offer',
  },
  firsttimer: {
    key: 'firsttimer',
    emoji: '🌱',
    name: 'First-Timer',
    opener: 'This is my first show. Is this a good one?',
    offerPct: [0.88, 1.0],
    ceilingPct: [0.95, 1.05],
    weight: 10,
    accepts_counter: true,
    targetHint: 'pays close to asking',
  },
  nostalgic: {
    key: 'nostalgic',
    emoji: '📻',
    name: 'Nostalgic',
    opener: 'Man, my dad had this one. What are we thinking?',
    offerPct: [0.82, 0.95],
    ceilingPct: [0.95, 1.08],
    weight: 9,
    accepts_counter: true,
    targetHint: 'emotional ceiling on era/player',
  },
  speculator: {
    key: 'speculator',
    emoji: '🎲',
    name: 'Speculator',
    opener: 'I watch his minor league numbers. What\'s the number?',
    offerPct: [0.65, 0.78],
    ceilingPct: [0.78, 0.88],
    weight: 8,
    accepts_counter: true,
    targetHint: 'prospects / young rookies only',
  },
  kid: {
    key: 'kid',
    emoji: '🧒',
    name: 'Kid + Allowance',
    opener: 'Mister, how much for this one? I have $[BUDGET] saved.',
    offerPct: [0.9, 1.0],
    ceilingPct: [0.9, 1.0],
    weight: 6,
    accepts_counter: false,
    targetHint: '$5-25 only, pure joy sale',
  },
};

const TIERS: Record<ShowTier, TierConfig> = {
  local: {
    key: 'local',
    label: 'Small Local',
    rental: 150,
    interactions: 18,
    traffic: 'Folding tables in a Holiday Inn banquet hall. 300 people over the weekend.',
    budgetMult: 0.9,
    weights: { firsttimer: 14, kid: 12, parent: 11, nostalgic: 10, flipper: 8, speculator: 6, grail: 4, dealer: 3 },
  },
  regional: {
    key: 'regional',
    label: 'Regional',
    rental: 400,
    interactions: 22,
    traffic: 'Convention center side room. 1,200 people over 3 days. Mix of locals and drive-ins.',
    budgetMult: 1.1,
    weights: { flipper: 13, parent: 10, speculator: 10, grail: 9, nostalgic: 9, firsttimer: 9, dealer: 8, kid: 5 },
  },
  national: {
    key: 'national',
    label: 'National',
    rental: 1200,
    interactions: 26,
    traffic: 'Big showroom — National Sports Collectors Convention energy. 40,000+ walk the floor.',
    budgetMult: 1.35,
    weights: { grail: 13, dealer: 12, speculator: 11, flipper: 10, nostalgic: 8, parent: 6, firsttimer: 5, kid: 3 },
  },
};

const SPECIALTIES: { key: Specialty; label: string; blurb: string }[] = [
  { key: 'vintage', label: 'Vintage', blurb: 'Pre-1980. Mantle/Mays/Koufax/Ali territory. Attracts Grail Hunters and Nostalgics.' },
  { key: 'modern', label: 'Modern RC', blurb: '2015+ rookies. Prizm, Bowman Chrome, Upper Deck YG. Attracts Flippers and Speculators.' },
  { key: 'autos', label: 'Autos / Star Cards', blurb: 'High-value rookies and HoF cards regardless of era. Attracts Grail Hunters, Parents.' },
  { key: 'mixed', label: 'Mixed', blurb: 'Everything from $5 commons to 4-figure stars. Broadest customer mix.' },
];

// Seeded RNG (mulberry32)
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function parseValue(s: string | undefined): number {
  if (!s) return 0;
  const clean = s.replace(/[$,]/g, '');
  const parts = clean.split(/[-–]/).map((p) => parseFloat(p.trim())).filter((n) => !isNaN(n));
  if (parts.length >= 2) return (parts[0] + parts[1]) / 2;
  if (parts.length === 1) return parts[0];
  return 0;
}

function filterBySpecialty(cards: SportsCard[], specialty: Specialty): SportsCard[] {
  switch (specialty) {
    case 'vintage':
      return cards.filter((c) => c.year < 1980);
    case 'modern':
      return cards.filter((c) => c.year >= 2015 && c.rookie);
    case 'autos':
      return cards.filter((c) => {
        const v = parseValue(c.estimatedValueRaw);
        return v >= 150 && (c.rookie || c.year < 1985);
      });
    case 'mixed':
    default:
      return cards;
  }
}

function pickWeighted<T>(rng: () => number, items: { item: T; weight: number }[]): T {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = rng() * total;
  for (const it of items) {
    r -= it.weight;
    if (r <= 0) return it.item;
  }
  return items[items.length - 1].item;
}

function pickPersona(rng: () => number, weights: Partial<Record<PersonaKey, number>>): Persona {
  const items = (Object.keys(weights) as PersonaKey[]).map((k) => ({
    item: PERSONAS[k],
    weight: weights[k] ?? 0,
  }));
  return pickWeighted(rng, items);
}

function generateInventory(cards: SportsCard[], rng: () => number, count: number): InventoryCard[] {
  const filtered = cards.filter((c) => {
    const v = parseValue(c.estimatedValueRaw);
    return v >= 5 && v <= 8000;
  });
  const picked: SportsCard[] = [];
  const used = new Set<string>();
  let attempts = 0;
  while (picked.length < count && attempts < count * 20) {
    const c = filtered[Math.floor(rng() * filtered.length)];
    if (c && !used.has(c.slug)) {
      used.add(c.slug);
      picked.push(c);
    }
    attempts++;
  }
  return picked.map((c) => {
    const fmv = parseValue(c.estimatedValueRaw) || 15;
    // Pricing: asking 5-15% above FMV (dealer markup)
    const markup = 1.05 + rng() * 0.1;
    return {
      slug: c.slug,
      name: c.name,
      player: c.player,
      year: c.year,
      sport: c.sport,
      set: c.set,
      fmv,
      list: Math.round(fmv * markup),
      rookie: c.rookie,
      sold: false,
    };
  });
}

function generateRounds(
  inventory: InventoryCard[],
  tier: TierConfig,
  rng: () => number
): CustomerRound[] {
  const rounds: CustomerRound[] = [];
  for (let i = 0; i < tier.interactions; i++) {
    const persona = pickPersona(rng, tier.weights);
    // pick a card they're interested in — weighted loosely by their targeting
    let cardIdx = Math.floor(rng() * inventory.length);
    // persona bias
    if (persona.key === 'grail' || persona.key === 'nostalgic') {
      // prefer higher fmv cards
      const sorted = inventory.map((c, idx) => ({ idx, fmv: c.fmv })).sort((a, b) => b.fmv - a.fmv);
      cardIdx = sorted[Math.floor(rng() * Math.min(8, sorted.length))].idx;
    } else if (persona.key === 'kid') {
      // prefer lowest fmv cards
      const sorted = inventory.map((c, idx) => ({ idx, fmv: c.fmv })).sort((a, b) => a.fmv - b.fmv);
      cardIdx = sorted[Math.floor(rng() * Math.min(6, sorted.length))].idx;
    } else if (persona.key === 'speculator') {
      // prefer rookies
      const rooks = inventory
        .map((c, idx) => ({ idx, rookie: c.rookie }))
        .filter((c) => c.rookie);
      if (rooks.length > 0) {
        cardIdx = rooks[Math.floor(rng() * rooks.length)].idx;
      }
    }
    const card = inventory[cardIdx];
    const [offerLo, offerHi] = persona.offerPct;
    const [ceilLo, ceilHi] = persona.ceilingPct;
    const offer = Math.max(1, Math.round(card.list * (offerLo + rng() * (offerHi - offerLo)) * tier.budgetMult));
    const ceiling = Math.max(
      offer,
      Math.round(card.list * (ceilLo + rng() * (ceilHi - ceilLo)) * tier.budgetMult)
    );
    rounds.push({
      idx: i,
      persona,
      cardIdx,
      offer,
      ceiling,
      resolved: null,
      notes: '',
    });
  }
  return rounds;
}

function todaySeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function gradeBooth(recovery: number, turnover: number, sentiment: number): { grade: string; color: string; score: number } {
  const score = recovery * 0.6 + turnover * 0.25 + sentiment * 0.15;
  if (score >= 0.85) return { grade: 'A', color: 'text-emerald-400', score };
  if (score >= 0.75) return { grade: 'B', color: 'text-sky-400', score };
  if (score >= 0.65) return { grade: 'C', color: 'text-amber-400', score };
  if (score >= 0.55) return { grade: 'D', color: 'text-orange-400', score };
  return { grade: 'F', color: 'text-rose-400', score };
}

function formatUSD(n: number): string {
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${Math.round(n).toLocaleString()}`;
}

const STATS_KEY = 'cv_card_show_booth_v1';

export default function CardShowBoothClient() {
  const [phase, setPhase] = useState<Phase>('config');
  const [mode, setMode] = useState<'daily' | 'free'>('daily');
  const [tierKey, setTierKey] = useState<ShowTier>('regional');
  const [specialty, setSpecialty] = useState<Specialty>('mixed');
  const [seed, setSeed] = useState(0);
  const [inventory, setInventory] = useState<InventoryCard[]>([]);
  const [rounds, setRounds] = useState<CustomerRound[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [counterInput, setCounterInput] = useState<string>('');
  const [showingCounter, setShowingCounter] = useState(false);
  const [stats, setStats] = useState<{ played: number; best: string; totalRevenue: number }>({
    played: 0,
    best: '—',
    totalRevenue: 0,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STATS_KEY);
      if (raw) setStats(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const tier = TIERS[tierKey];

  const startBooth = useCallback(() => {
    const s = mode === 'daily' ? todaySeed() + tierKey.charCodeAt(0) + specialty.charCodeAt(0) : Date.now() + Math.floor(Math.random() * 10000);
    setSeed(s);
    const rng = mulberry32(s);
    const filteredCards = filterBySpecialty(sportsCards, specialty);
    const pool = filteredCards.length >= 30 ? filteredCards : sportsCards;
    const inv = generateInventory(pool, rng, 18);
    setInventory(inv);
    const r = generateRounds(inv, tier, rng);
    setRounds(r);
    setCurrentRound(0);
    setShowingCounter(false);
    setCounterInput('');
    setPhase('live');
  }, [mode, tierKey, specialty, tier]);

  const resetBooth = useCallback(() => {
    setPhase('config');
    setInventory([]);
    setRounds([]);
    setCurrentRound(0);
    setShowingCounter(false);
  }, []);

  const resolveAccept = useCallback(() => {
    const round = rounds[currentRound];
    if (!round || round.resolved) return;
    const card = inventory[round.cardIdx];
    if (card.sold) {
      // already sold by someone else — walk away
      const newRounds = [...rounds];
      newRounds[currentRound] = { ...round, resolved: 'walked', notes: 'Card was sold in a previous round.' };
      setRounds(newRounds);
      setTimeout(() => {
        if (currentRound + 1 >= rounds.length) setPhase('results');
        else setCurrentRound(currentRound + 1);
      }, 600);
      return;
    }
    const newInv = [...inventory];
    newInv[round.cardIdx] = { ...card, sold: true, soldFor: round.offer, soldTo: round.persona.key };
    setInventory(newInv);
    const newRounds = [...rounds];
    newRounds[currentRound] = {
      ...round,
      resolved: 'accepted',
      finalPrice: round.offer,
      notes: `${round.persona.name} grabbed it for ${formatUSD(round.offer)}.`,
    };
    setRounds(newRounds);
    setTimeout(() => {
      if (currentRound + 1 >= rounds.length) setPhase('results');
      else setCurrentRound(currentRound + 1);
    }, 900);
  }, [currentRound, rounds, inventory]);

  const resolveReject = useCallback(() => {
    const round = rounds[currentRound];
    if (!round || round.resolved) return;
    const newRounds = [...rounds];
    newRounds[currentRound] = { ...round, resolved: 'rejected', notes: `Passed on ${round.persona.name}'s offer.` };
    setRounds(newRounds);
    setTimeout(() => {
      if (currentRound + 1 >= rounds.length) setPhase('results');
      else setCurrentRound(currentRound + 1);
    }, 700);
  }, [currentRound, rounds]);

  const startCounter = useCallback(() => {
    const round = rounds[currentRound];
    if (!round) return;
    const card = inventory[round.cardIdx];
    setCounterInput(String(Math.round((round.offer + card.list) / 2)));
    setShowingCounter(true);
  }, [currentRound, rounds, inventory]);

  const submitCounter = useCallback(() => {
    const round = rounds[currentRound];
    if (!round || round.resolved) return;
    const card = inventory[round.cardIdx];
    const val = parseFloat(counterInput);
    if (isNaN(val) || val <= 0) return;
    setShowingCounter(false);
    if (card.sold) {
      const newRounds = [...rounds];
      newRounds[currentRound] = {
        ...round,
        resolved: 'walked',
        counterPrice: val,
        notes: 'Card was sold in a previous round.',
      };
      setRounds(newRounds);
      setTimeout(() => {
        if (currentRound + 1 >= rounds.length) setPhase('results');
        else setCurrentRound(currentRound + 1);
      }, 600);
      return;
    }
    // if they accept_counter and val <= ceiling → sold
    const accepts = round.persona.accepts_counter && val <= round.ceiling && val >= round.offer;
    if (accepts) {
      const newInv = [...inventory];
      newInv[round.cardIdx] = { ...card, sold: true, soldFor: val, soldTo: round.persona.key };
      setInventory(newInv);
      const newRounds = [...rounds];
      newRounds[currentRound] = {
        ...round,
        resolved: 'countered',
        counterPrice: val,
        finalPrice: val,
        notes: `Countered to ${formatUSD(val)}. ${round.persona.name} accepted.`,
      };
      setRounds(newRounds);
    } else {
      const newRounds = [...rounds];
      newRounds[currentRound] = {
        ...round,
        resolved: 'walked',
        counterPrice: val,
        notes: round.persona.accepts_counter
          ? `Countered to ${formatUSD(val)}. Over their ceiling (${formatUSD(round.ceiling)}). Walked away.`
          : `${round.persona.name} doesn't counter — walked away.`,
      };
      setRounds(newRounds);
    }
    setTimeout(() => {
      if (currentRound + 1 >= rounds.length) setPhase('results');
      else setCurrentRound(currentRound + 1);
    }, 1100);
  }, [currentRound, rounds, inventory, counterInput]);

  const metrics = useMemo(() => {
    const totalFmv = inventory.reduce((s, c) => s + c.fmv, 0);
    const revenue = inventory.filter((c) => c.sold).reduce((s, c) => s + (c.soldFor ?? 0), 0);
    const soldCount = inventory.filter((c) => c.sold).length;
    const satisfied = rounds.filter((r) => r.resolved === 'accepted' || r.resolved === 'countered').length;
    const netProfit = revenue - tier.rental;
    const recovery = totalFmv > 0 ? revenue / totalFmv : 0;
    const turnover = inventory.length > 0 ? soldCount / inventory.length : 0;
    const sentiment = rounds.length > 0 ? satisfied / rounds.length : 0;
    return { totalFmv, revenue, soldCount, satisfied, netProfit, recovery, turnover, sentiment };
  }, [inventory, rounds, tier]);

  const grade = useMemo(
    () => gradeBooth(metrics.recovery, metrics.turnover, metrics.sentiment),
    [metrics]
  );

  useEffect(() => {
    if (phase === 'results') {
      try {
        const next = {
          played: stats.played + 1,
          best: grade.grade.localeCompare(stats.best) < 0 || stats.best === '—' ? grade.grade : stats.best,
          totalRevenue: stats.totalRevenue + metrics.revenue,
        };
        setStats(next);
        localStorage.setItem(STATS_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const shareText = useMemo(() => {
    if (phase !== 'results') return '';
    const emojis = rounds
      .map((r) => {
        if (r.resolved === 'accepted') return '✅';
        if (r.resolved === 'countered') return '🤝';
        if (r.resolved === 'rejected') return '❌';
        return '🚶';
      })
      .join('');
    return `Card Show Booth — ${TIERS[tierKey].label} (${SPECIALTIES.find((s) => s.key === specialty)?.label})
Grade ${grade.grade} · Revenue ${formatUSD(metrics.revenue)} · Net ${metrics.netProfit >= 0 ? '+' : ''}${formatUSD(metrics.netProfit)}
${emojis}
cardvault-two.vercel.app/card-show-booth`;
  }, [phase, rounds, tierKey, specialty, grade, metrics]);

  const copyShare = useCallback(() => {
    try {
      navigator.clipboard?.writeText(shareText);
    } catch {
      // ignore
    }
  }, [shareText]);

  // ==== RENDER ====

  if (phase === 'config') {
    return (
      <div className="space-y-6">
        {/* Mode toggle */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Mode</h2>
            <div className="text-[11px] text-slate-500">
              Played: {stats.played} · Best: {stats.best} · Lifetime rev: {formatUSD(stats.totalRevenue)}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setMode('daily')}
              className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition ${
                mode === 'daily'
                  ? 'border-orange-500 bg-orange-950/40 text-orange-200'
                  : 'border-slate-700 bg-slate-900/40 text-slate-300 hover:border-slate-600'
              }`}
            >
              🗓️ Today&apos;s Show
              <div className="mt-0.5 text-[11px] font-normal text-slate-400">Seeded. Everyone faces the same weekend.</div>
            </button>
            <button
              onClick={() => setMode('free')}
              className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition ${
                mode === 'free'
                  ? 'border-orange-500 bg-orange-950/40 text-orange-200'
                  : 'border-slate-700 bg-slate-900/40 text-slate-300 hover:border-slate-600'
              }`}
            >
              🎲 Free Play
              <div className="mt-0.5 text-[11px] font-normal text-slate-400">Random seed. Replay as many shows as you want.</div>
            </button>
          </div>
        </div>

        {/* Tier picker */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="mb-3 text-sm font-semibold text-white">1. Pick your show tier</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {(Object.keys(TIERS) as ShowTier[]).map((k) => {
              const t = TIERS[k];
              const selected = tierKey === k;
              return (
                <button
                  key={k}
                  onClick={() => setTierKey(k)}
                  className={`rounded-lg border p-4 text-left transition ${
                    selected
                      ? 'border-orange-500 bg-orange-950/30'
                      : 'border-slate-700 bg-slate-900/40 hover:border-slate-600'
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <div className="font-semibold text-white">{t.label}</div>
                    <div className="text-xs text-orange-300">{formatUSD(t.rental)}</div>
                  </div>
                  <div className="mb-2 text-[11px] text-slate-400">{t.traffic}</div>
                  <div className="text-[11px] text-slate-500">
                    {t.interactions} customer offers · budget mult {t.budgetMult.toFixed(2)}×
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Specialty picker */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="mb-3 text-sm font-semibold text-white">2. Pick your booth specialty</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {SPECIALTIES.map((s) => {
              const selected = specialty === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => setSpecialty(s.key)}
                  className={`rounded-lg border p-4 text-left transition ${
                    selected
                      ? 'border-orange-500 bg-orange-950/30'
                      : 'border-slate-700 bg-slate-900/40 hover:border-slate-600'
                  }`}
                >
                  <div className="mb-1 font-semibold text-white">{s.label}</div>
                  <div className="text-[11px] text-slate-400">{s.blurb}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Persona cheat sheet */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <h2 className="mb-3 text-sm font-semibold text-white">3. Know your customers</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(PERSONAS) as PersonaKey[]).map((k) => {
              const p = PERSONAS[k];
              return (
                <div key={k} className="rounded border border-slate-700 bg-slate-900/60 p-2.5">
                  <div className="mb-1 flex items-center gap-1.5">
                    <span className="text-base">{p.emoji}</span>
                    <span className="text-xs font-semibold text-white">{p.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">{p.targetHint}</div>
                  <div className="mt-1 text-[10px] text-slate-500">
                    Offer {Math.round(p.offerPct[0] * 100)}–{Math.round(p.offerPct[1] * 100)}% · Ceiling{' '}
                    {Math.round(p.ceilingPct[0] * 100)}–{Math.round(p.ceilingPct[1] * 100)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={startBooth}
          className="w-full rounded-lg bg-orange-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-orange-900/40 hover:bg-orange-400"
        >
          🎪 Open the Booth ({formatUSD(tier.rental)} rental, {tier.interactions} customers)
        </button>
      </div>
    );
  }

  if (phase === 'live') {
    const round = rounds[currentRound];
    const card = round ? inventory[round.cardIdx] : null;
    const history = rounds.slice(0, currentRound).reverse();
    return (
      <div className="space-y-5">
        {/* Progress header */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="mb-2 flex items-center justify-between text-xs">
            <div className="text-slate-400">
              Customer <span className="font-semibold text-white">{currentRound + 1}</span> / {rounds.length}
            </div>
            <div className="text-slate-400">
              Revenue <span className="font-semibold text-emerald-300">{formatUSD(metrics.revenue)}</span> · Sold{' '}
              <span className="font-semibold text-white">
                {metrics.soldCount} / {inventory.length}
              </span>
            </div>
          </div>
          <div className="h-1.5 w-full rounded bg-slate-800">
            <div
              className="h-1.5 rounded bg-orange-500 transition-all"
              style={{ width: `${((currentRound + 1) / rounds.length) * 100}%` }}
            />
          </div>
        </div>

        {round && card && (
          <div className="rounded-xl border border-orange-800/40 bg-gradient-to-br from-orange-950/30 via-slate-900/60 to-slate-900/80 p-5">
            {/* Customer */}
            <div className="mb-4 flex items-start gap-3">
              <div className="text-4xl">{round.persona.emoji}</div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-orange-200">{round.persona.name}</div>
                <div className="text-[11px] text-slate-400">{round.persona.targetHint}</div>
                <div className="mt-2 rounded bg-slate-950/60 px-3 py-2 text-sm italic text-slate-200">
                  &ldquo;{round.persona.opener}&rdquo;
                </div>
              </div>
            </div>

            {/* Card */}
            <div className="mb-4 rounded-lg border border-slate-700 bg-slate-950/50 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-500">Showing interest in</div>
                  <Link
                    href={`/cards/${card.slug}`}
                    className="text-sm font-semibold text-white hover:text-orange-300"
                  >
                    {card.year} {card.set} — {card.player}
                  </Link>
                  <div className="mt-0.5 text-[11px] capitalize text-slate-400">
                    {card.sport} · {card.rookie ? 'Rookie' : 'Star/HoF'} · FMV {formatUSD(card.fmv)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Your List</div>
                  <div className="text-lg font-bold text-white">{formatUSD(card.list)}</div>
                </div>
              </div>
              {card.sold && (
                <div className="mt-2 rounded bg-rose-950/30 px-2 py-1 text-[11px] text-rose-300">
                  ⚠️ Already sold to a previous customer. This sale will walk.
                </div>
              )}
            </div>

            {/* Offer */}
            <div className="mb-4 rounded-lg bg-orange-950/30 p-3">
              <div className="mb-1 text-[11px] uppercase tracking-wider text-orange-300">Their offer</div>
              <div className="flex items-baseline gap-3">
                <div className="text-3xl font-bold text-orange-300">{formatUSD(round.offer)}</div>
                <div className="text-xs text-slate-400">
                  ({Math.round((round.offer / card.list) * 100)}% of ask)
                </div>
              </div>
            </div>

            {/* Actions */}
            {!showingCounter ? (
              <div className="grid gap-2 sm:grid-cols-3">
                <button
                  onClick={resolveAccept}
                  className="rounded-lg border border-emerald-700 bg-emerald-950/40 px-4 py-3 text-sm font-semibold text-emerald-200 hover:bg-emerald-900/40"
                >
                  ✅ Accept {formatUSD(round.offer)}
                </button>
                <button
                  onClick={startCounter}
                  disabled={!round.persona.accepts_counter}
                  className="rounded-lg border border-sky-700 bg-sky-950/40 px-4 py-3 text-sm font-semibold text-sky-200 hover:bg-sky-900/40 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  🤝 Counter {!round.persona.accepts_counter && '(n/a)'}
                </button>
                <button
                  onClick={resolveReject}
                  className="rounded-lg border border-rose-700 bg-rose-950/40 px-4 py-3 text-sm font-semibold text-rose-200 hover:bg-rose-900/40"
                >
                  ❌ Reject
                </button>
              </div>
            ) : (
              <div className="rounded-lg border border-sky-700 bg-sky-950/30 p-4">
                <div className="mb-2 text-xs text-sky-200">
                  Counter between {formatUSD(round.offer)} and {formatUSD(card.list)}. You can&apos;t see their ceiling.
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={counterInput}
                    onChange={(e) => setCounterInput(e.target.value)}
                    className="flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                    placeholder="Enter counter price"
                  />
                  <button
                    onClick={submitCounter}
                    className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-400"
                  >
                    Counter
                  </button>
                  <button
                    onClick={() => setShowingCounter(false)}
                    className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-slate-500"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* History tail */}
        {history.length > 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Recent interactions
            </h3>
            <div className="space-y-1.5 text-xs">
              {history.slice(0, 6).map((r) => {
                const c = inventory[r.cardIdx];
                const icon =
                  r.resolved === 'accepted'
                    ? '✅'
                    : r.resolved === 'countered'
                    ? '🤝'
                    : r.resolved === 'rejected'
                    ? '❌'
                    : '🚶';
                const color =
                  r.resolved === 'accepted' || r.resolved === 'countered'
                    ? 'text-emerald-300'
                    : r.resolved === 'rejected'
                    ? 'text-rose-300'
                    : 'text-slate-500';
                return (
                  <div key={r.idx} className="flex items-start gap-2">
                    <span className="w-6">{icon}</span>
                    <span className="text-slate-400">#{r.idx + 1}</span>
                    <span className={color}>{r.persona.name}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-300">{c?.player}</span>
                    <span className="ml-auto text-slate-400">{r.notes}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // results phase
  return (
    <div className="space-y-6">
      {/* Grade banner */}
      <div className="rounded-xl border border-orange-700/40 bg-gradient-to-br from-orange-950/60 via-slate-900 to-slate-900 p-6 text-center">
        <div className="mb-2 text-[11px] uppercase tracking-wider text-orange-300">Booth Grade</div>
        <div className={`text-7xl font-bold ${grade.color}`}>{grade.grade}</div>
        <div className="mt-2 text-sm text-slate-300">
          {grade.grade === 'A' && 'Legendary weekend. Collectors are talking.'}
          {grade.grade === 'B' && 'Solid take. The rental paid for itself with room.'}
          {grade.grade === 'C' && 'Fine. You moved inventory and netted modest profit.'}
          {grade.grade === 'D' && 'Rough. Half the table is still wrapped up.'}
          {grade.grade === 'F' && 'The rental ate you. Rethink pricing or specialty.'}
        </div>
      </div>

      {/* P&L */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-emerald-800/40 bg-emerald-950/30 p-3">
          <div className="text-[10px] uppercase tracking-wider text-emerald-300">Revenue</div>
          <div className="text-xl font-bold text-emerald-200">{formatUSD(metrics.revenue)}</div>
        </div>
        <div className="rounded-lg border border-rose-800/40 bg-rose-950/30 p-3">
          <div className="text-[10px] uppercase tracking-wider text-rose-300">Rental</div>
          <div className="text-xl font-bold text-rose-200">−{formatUSD(tier.rental)}</div>
        </div>
        <div
          className={`rounded-lg border p-3 ${
            metrics.netProfit >= 0 ? 'border-sky-800/40 bg-sky-950/30' : 'border-rose-800/40 bg-rose-950/30'
          }`}
        >
          <div
            className={`text-[10px] uppercase tracking-wider ${
              metrics.netProfit >= 0 ? 'text-sky-300' : 'text-rose-300'
            }`}
          >
            Net
          </div>
          <div
            className={`text-xl font-bold ${
              metrics.netProfit >= 0 ? 'text-sky-200' : 'text-rose-200'
            }`}
          >
            {metrics.netProfit >= 0 ? '+' : ''}
            {formatUSD(metrics.netProfit)}
          </div>
        </div>
        <div className="rounded-lg border border-amber-800/40 bg-amber-950/30 p-3">
          <div className="text-[10px] uppercase tracking-wider text-amber-300">Sold</div>
          <div className="text-xl font-bold text-amber-200">
            {metrics.soldCount}/{inventory.length}
          </div>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <h3 className="mb-3 text-sm font-semibold text-white">Grade breakdown</h3>
        <div className="space-y-3">
          {[
            { label: 'Recovery rate (60%)', value: metrics.recovery, desc: `${formatUSD(metrics.revenue)} revenue vs ${formatUSD(metrics.totalFmv)} total FMV` },
            { label: 'Turnover (25%)', value: metrics.turnover, desc: `${metrics.soldCount} of ${inventory.length} cards sold` },
            { label: 'Customer satisfaction (15%)', value: metrics.sentiment, desc: `${metrics.satisfied} of ${rounds.length} interactions ended in a sale` },
          ].map((m) => (
            <div key={m.label}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <div className="text-slate-300">{m.label}</div>
                <div className="font-mono text-slate-200">{Math.round(m.value * 100)}%</div>
              </div>
              <div className="h-1.5 w-full rounded bg-slate-800">
                <div
                  className="h-1.5 rounded bg-gradient-to-r from-orange-500 to-amber-400"
                  style={{ width: `${Math.min(100, m.value * 100)}%` }}
                />
              </div>
              <div className="mt-0.5 text-[10px] text-slate-500">{m.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Inventory recap */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
        <h3 className="mb-3 text-sm font-semibold text-white">Inventory recap</h3>
        <div className="grid gap-1.5 text-xs">
          {inventory.map((c) => (
            <div key={c.slug} className="flex items-center gap-2 rounded border border-slate-800 bg-slate-950/40 px-2 py-1.5">
              <div className="w-5">{c.sold ? '✅' : '📦'}</div>
              <div className="flex-1 truncate">
                <Link href={`/cards/${c.slug}`} className="text-slate-200 hover:text-orange-300">
                  {c.year} {c.player}
                </Link>
                <span className="text-slate-500"> · {c.set}</span>
              </div>
              <div className="text-slate-400">List {formatUSD(c.list)}</div>
              {c.sold ? (
                <div className="w-24 text-right text-emerald-300">
                  Sold {formatUSD(c.soldFor ?? 0)}
                  {c.soldTo && <span className="ml-1">{PERSONAS[c.soldTo].emoji}</span>}
                </div>
              ) : (
                <div className="w-24 text-right text-slate-500">—</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={resetBooth}
          className="flex-1 rounded-lg bg-orange-500 px-4 py-3 text-sm font-bold text-white hover:bg-orange-400"
        >
          🎪 Try Another Show
        </button>
        <button
          onClick={copyShare}
          className="flex-1 rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-200 hover:border-orange-500"
        >
          📋 Copy Share
        </button>
      </div>
      <pre className="rounded border border-slate-800 bg-slate-950 p-3 text-[10px] leading-tight text-slate-400 whitespace-pre-wrap">
{shareText}
      </pre>
    </div>
  );
}

'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

type Phase = 'card' | 'packing' | 'carrier' | 'insurance' | 'signature' | 'simulate' | 'result';

interface PackingTier {
  id: string;
  name: string;
  blurb: string;
  cost: number;
  protection: number; // 0-100
  layers: string[];
  bestFor: string;
}

const PACKING: PackingTier[] = [
  {
    id: 'bare',
    name: 'Bare Bones',
    blurb: 'Penny sleeve + plain envelope. Crosses fingers.',
    cost: 0.50,
    protection: 10,
    layers: ['Penny sleeve', '#10 envelope', 'Regular stamp'],
    bestFor: '$5 common cards only',
  },
  {
    id: 'standard',
    name: 'Standard (PWE)',
    blurb: 'Penny sleeve, top loader, team bag, plain white envelope.',
    cost: 1.25,
    protection: 45,
    layers: ['Penny sleeve', 'Top loader', 'Team bag', 'PWE envelope'],
    bestFor: '$20-$100 cards',
  },
  {
    id: 'pro',
    name: 'Pro Seller',
    blurb: 'Top loader + cardboard sandwich + bubble mailer.',
    cost: 2.50,
    protection: 75,
    layers: ['Penny sleeve', 'Top loader', 'Team bag', 'Cardboard sandwich', 'Bubble mailer', 'Fragile sticker'],
    bestFor: '$100-$1,000 cards',
  },
  {
    id: 'museum',
    name: 'Museum Grade',
    blurb: 'Semi-rigid + slab box + rigid mailer + fragile stickers.',
    cost: 5.50,
    protection: 95,
    layers: ['Semi-rigid holder', 'Slab box with foam', 'Bubble wrap', 'Rigid cardboard box', 'Fragile stickers', 'Signature-required label'],
    bestFor: '$1,000+ slabs & vintage',
  },
];

interface Carrier {
  id: string;
  name: string;
  speed: string;
  speedRating: number; // 1-5
  cost: number;
  reliability: number; // 0-100
  notes: string;
  includedInsurance: number; // $ included
}

const CARRIERS: Carrier[] = [
  {
    id: 'usps-ga',
    name: 'USPS Ground Advantage',
    speed: '2-5 business days',
    speedRating: 3,
    cost: 4.75,
    reliability: 82,
    notes: 'Cheapest tracked option. Gets the job done.',
    includedInsurance: 0,
  },
  {
    id: 'usps-priority',
    name: 'USPS Priority Mail',
    speed: '1-3 business days',
    speedRating: 4,
    cost: 9.50,
    reliability: 87,
    notes: '$100 insurance included. Most common choice for slabs.',
    includedInsurance: 100,
  },
  {
    id: 'usps-express',
    name: 'USPS Priority Express',
    speed: '1-2 business days',
    speedRating: 5,
    cost: 29.00,
    reliability: 93,
    notes: 'Overnight-tier service. $100 included insurance.',
    includedInsurance: 100,
  },
  {
    id: 'ups-ground',
    name: 'UPS Ground',
    speed: '1-5 business days',
    speedRating: 3,
    cost: 12.00,
    reliability: 90,
    notes: 'Fewer sort-line incidents than USPS. Good for slabs.',
    includedInsurance: 100,
  },
  {
    id: 'ups-2day',
    name: 'UPS 2-Day Air',
    speed: '2 business days',
    speedRating: 5,
    cost: 24.50,
    reliability: 94,
    notes: 'Best handling record for $1,000+ shipments.',
    includedInsurance: 100,
  },
  {
    id: 'fedex-ground',
    name: 'FedEx Ground',
    speed: '1-5 business days',
    speedRating: 3,
    cost: 11.00,
    reliability: 84,
    notes: 'Rougher with small mailers. OK for boxed slabs.',
    includedInsurance: 100,
  },
];

interface InsuranceOption {
  id: string;
  name: string;
  blurb: string;
  ratePct: number; // % of declared value
  flatFee: number; // extra flat fee
  coverageMultiplier: number; // max coverage as multiple of declared
  payoutSpeed: number; // 1-5
  claimApprovalRate: number; // 0-100
}

const INSURANCE: InsuranceOption[] = [
  {
    id: 'none',
    name: 'No Insurance',
    blurb: 'Tracking alone. You eat any loss or damage.',
    ratePct: 0,
    flatFee: 0,
    coverageMultiplier: 0,
    payoutSpeed: 0,
    claimApprovalRate: 0,
  },
  {
    id: 'carrier',
    name: 'Carrier Insurance',
    blurb: 'USPS/UPS/FedEx add-on. Slow claims (30-60 days).',
    ratePct: 1.7,
    flatFee: 0,
    coverageMultiplier: 1,
    payoutSpeed: 2,
    claimApprovalRate: 70,
  },
  {
    id: 'private',
    name: 'Private (Shipsurance/U-PIC)',
    blurb: 'Third-party insurer. Faster claims (7-14 days), higher approval.',
    ratePct: 0.80,
    flatFee: 0,
    coverageMultiplier: 1,
    payoutSpeed: 4,
    claimApprovalRate: 92,
  },
];

interface Stats {
  shipments: number;
  safeDeliveries: number;
  damages: number;
  losses: number;
  claimsFiled: number;
  claimsPaid: number;
  netProfit: number;
  bestGrade: string;
}

const STORAGE_KEY = 'cv_ship_it_stats_v1';
const DEFAULT_STATS: Stats = {
  shipments: 0,
  safeDeliveries: 0,
  damages: 0,
  losses: 0,
  claimsFiled: 0,
  claimsPaid: 0,
  netProfit: 0,
  bestGrade: '—',
};

function parseDollarFrom(raw: string): number {
  const m = raw.match(/\$([\d,]+)/);
  if (!m) return 50;
  return parseInt(m[1].replace(/,/g, ''), 10);
}

function fmt(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n.toFixed(2)}`;
}

function gradeRank(g: string): number {
  const order = ['F', 'D', 'C', 'B', 'A', 'A+'];
  return order.indexOf(g);
}

type Outcome = 'safe' | 'delayed' | 'damaged' | 'lost' | 'stolen';

interface SimResult {
  outcome: Outcome;
  customerMood: string;
  claimFiled: boolean;
  claimPaid: boolean;
  claimPayout: number;
  netProfit: number;
  grade: string;
  storyLines: string[];
}

export default function ShipItClient() {
  const [phase, setPhase] = useState<Phase>('card');
  const [selectedCardSlug, setSelectedCardSlug] = useState<string | null>(null);
  const [salePrice, setSalePrice] = useState<number>(250);
  const [declaredValue, setDeclaredValue] = useState<number>(250);
  const [search, setSearch] = useState('');
  const [packingId, setPackingId] = useState<string>('');
  const [carrierId, setCarrierId] = useState<string>('');
  const [insuranceId, setInsuranceId] = useState<string>('');
  const [signature, setSignature] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<SimResult | null>(null);
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setStats(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const persistStats = useCallback((next: Stats) => {
    setStats(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch { /* ignore */ }
  }, []);

  const searchResults = useMemo(() => {
    if (!search.trim()) return [] as typeof sportsCards;
    const q = search.toLowerCase();
    return sportsCards
      .filter(c => c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q))
      .slice(0, 10);
  }, [search]);

  const selectedCard = useMemo(
    () => sportsCards.find(c => c.slug === selectedCardSlug) || null,
    [selectedCardSlug]
  );

  const packing = useMemo(() => PACKING.find(p => p.id === packingId) || null, [packingId]);
  const carrier = useMemo(() => CARRIERS.find(c => c.id === carrierId) || null, [carrierId]);
  const insurance = useMemo(() => INSURANCE.find(i => i.id === insuranceId) || null, [insuranceId]);

  const insuranceCost = useMemo(() => {
    if (!insurance || insurance.id === 'none') return 0;
    const coveredAbove = Math.max(0, declaredValue - (carrier?.includedInsurance || 0));
    return coveredAbove * (insurance.ratePct / 100) + insurance.flatFee;
  }, [insurance, declaredValue, carrier]);

  const signatureCost = signature ? (declaredValue >= 500 ? 5.85 : 3.65) : 0;
  const packingCost = packing?.cost || 0;
  const carrierCost = carrier?.cost || 0;
  const totalShippingCost = packingCost + carrierCost + insuranceCost + signatureCost;

  const protectionScore = useMemo(() => {
    if (!packing || !carrier) return 0;
    let score = packing.protection * 0.55 + carrier.reliability * 0.30;
    if (insurance && insurance.id !== 'none') score += insurance.claimApprovalRate * 0.10;
    if (signature) score += 5;
    return Math.min(100, Math.round(score));
  }, [packing, carrier, insurance, signature]);

  const pickCardFromSearch = (slug: string, defaultDollar: number) => {
    setSelectedCardSlug(slug);
    setSalePrice(defaultDollar);
    setDeclaredValue(defaultDollar);
    setSearch('');
  };

  const usePreset = (price: number) => {
    setSelectedCardSlug(null);
    setSalePrice(price);
    setDeclaredValue(price);
  };

  const runSimulation = useCallback(() => {
    if (!packing || !carrier || !insurance) return;

    const declared = declaredValue;
    const shippingCost = totalShippingCost;

    // Base damage/loss probabilities before modifiers
    let pDamage = 0.14;
    let pLost = 0.04;
    let pStolen = 0.05;
    let pDelayed = 0.10;

    // Packing protection reduces damage substantially
    pDamage *= (1 - packing.protection / 110);

    // Carrier reliability reduces loss & stolen
    const carrierFactor = 1 - carrier.reliability / 140;
    pLost *= carrierFactor;
    pStolen *= carrierFactor;

    // Signature crushes porch piracy
    if (signature) pStolen *= 0.15;

    // High-value adds target risk
    if (declared >= 1000) {
      pStolen *= 1.5;
      pLost *= 1.2;
    }

    // Express/fast services have slightly fewer sort incidents
    if (carrier.speedRating >= 4) {
      pDamage *= 0.85;
      pDelayed *= 0.6;
    }

    const rand = Math.random();
    let outcome: Outcome;
    let cursor = 0;
    if (rand < (cursor += pLost)) outcome = 'lost';
    else if (rand < (cursor += pStolen)) outcome = 'stolen';
    else if (rand < (cursor += pDamage)) outcome = 'damaged';
    else if (rand < (cursor += pDelayed)) outcome = 'delayed';
    else outcome = 'safe';

    // Claim logic
    let claimFiled = false;
    let claimPaid = false;
    let claimPayout = 0;
    const isLossEvent = outcome === 'lost' || outcome === 'stolen' || outcome === 'damaged';

    if (isLossEvent && insurance.id !== 'none') {
      claimFiled = true;
      const approvalRoll = Math.random() * 100;
      if (approvalRoll < insurance.claimApprovalRate) {
        claimPaid = true;
        claimPayout = declared;
      }
    }

    // Profit math
    // Revenue = salePrice. Cost = shippingCost. Loss = declared if loss event & not paid.
    let netProfit = salePrice - shippingCost;
    if (outcome === 'stolen' || outcome === 'lost') {
      netProfit -= salePrice; // buyer refunded
      netProfit += claimPaid ? claimPayout : 0;
    } else if (outcome === 'damaged') {
      netProfit -= salePrice * 0.5; // partial refund/dispute
      netProfit += claimPaid ? claimPayout * 0.7 : 0;
    }

    // Customer mood
    const moods: Record<Outcome, string> = {
      safe: "5 stars. Buyer posted the unboxing on Reddit with a 'A+ packing' comment.",
      delayed: '4 stars. Buyer complained once but card arrived intact. No dispute.',
      damaged: claimPaid
        ? "2 stars, but you refunded and claim paid. You broke even. Kind of."
        : "1 star. Buyer filed 'Not as described'. You ate the loss.",
      lost: claimPaid
        ? 'Tracking never updated. Refunded buyer. Insurance paid out. Frustrating but whole.'
        : "Tracking never updated. Refunded buyer. No insurance. Full loss.",
      stolen: claimPaid
        ? 'Tracking shows delivered, buyer says no package. Insurance paid. Close call.'
        : "Tracking shows delivered. Buyer opens case. You lose the case. Ouch.",
    };

    // Grade math
    let grade = 'C';
    if (outcome === 'safe' && netProfit >= salePrice * 0.85) grade = 'A+';
    else if (outcome === 'safe') grade = 'A';
    else if (outcome === 'delayed' && netProfit >= 0) grade = 'B';
    else if (isLossEvent && claimPaid && netProfit >= -salePrice * 0.1) grade = 'C';
    else if (isLossEvent && claimPaid) grade = 'D';
    else grade = 'F';

    // Story lines
    const storyLines: string[] = [];
    storyLines.push(`You sold the card for ${fmt(salePrice)} and shipped via ${carrier.name}.`);
    storyLines.push(`Packed it ${packing.name.toLowerCase()} (${packing.layers.length} layers). Protection ${protectionScore}/100.`);
    if (insurance.id !== 'none') {
      storyLines.push(`Insured through ${insurance.name} for ${fmt(declared)}.`);
    } else {
      storyLines.push('No insurance purchased. Tracking only.');
    }
    if (signature) storyLines.push('Required signature on delivery.');

    const labels: Record<Outcome, string> = {
      safe: 'Clean delivery, no issues.',
      delayed: 'Carrier held the package for 6 extra days. Arrived intact.',
      damaged: 'Arrived bent/cracked. Buyer sent photos of the damage.',
      lost: 'Package disappeared between sort facilities. Tracking dead.',
      stolen: 'Tracking shows delivered, buyer claims no package received.',
    };
    storyLines.push(labels[outcome]);

    if (claimFiled) {
      storyLines.push(claimPaid
        ? `Filed claim with ${insurance.name}. Approved, ${fmt(outcome === 'damaged' ? claimPayout * 0.7 : claimPayout)} paid out.`
        : `Filed claim with ${insurance.name}. Denied — insufficient documentation or claim outside coverage terms.`);
    }

    const result: SimResult = {
      outcome,
      customerMood: moods[outcome],
      claimFiled,
      claimPaid,
      claimPayout,
      netProfit,
      grade,
      storyLines,
    };
    setSimResult(result);
    setPhase('result');

    // Update stats
    const next: Stats = {
      ...stats,
      shipments: stats.shipments + 1,
      safeDeliveries: stats.safeDeliveries + (outcome === 'safe' || outcome === 'delayed' ? 1 : 0),
      damages: stats.damages + (outcome === 'damaged' ? 1 : 0),
      losses: stats.losses + (outcome === 'lost' || outcome === 'stolen' ? 1 : 0),
      claimsFiled: stats.claimsFiled + (claimFiled ? 1 : 0),
      claimsPaid: stats.claimsPaid + (claimPaid ? 1 : 0),
      netProfit: stats.netProfit + netProfit,
      bestGrade: gradeRank(grade) > gradeRank(stats.bestGrade) ? grade : stats.bestGrade,
    };
    persistStats(next);
  }, [declaredValue, totalShippingCost, packing, carrier, insurance, signature, salePrice, protectionScore, stats, persistStats]);

  const restart = () => {
    setPhase('card');
    setSelectedCardSlug(null);
    setPackingId('');
    setCarrierId('');
    setInsuranceId('');
    setSignature(false);
    setSimResult(null);
  };

  const shareResult = () => {
    if (!simResult) return;
    const emoji = { 'A+': '🟢', A: '🟢', B: '🟡', C: '🟡', D: '🟠', F: '🔴' }[simResult.grade] || '⬜';
    const text = `📦 Card Shipping Simulator
${emoji} Grade: ${simResult.grade}
Outcome: ${simResult.outcome.toUpperCase()}
Net: ${simResult.netProfit >= 0 ? '+' : ''}${fmt(simResult.netProfit)}
Try it → https://cardvault-two.vercel.app/vault/ship-it`;
    try { navigator.clipboard.writeText(text); } catch { /* ignore */ }
  };

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      {stats.shipments > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
            <div className="text-gray-500 text-xs">Shipments</div>
            <div className="text-white text-lg font-bold">{stats.shipments}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
            <div className="text-gray-500 text-xs">Safe Rate</div>
            <div className="text-emerald-400 text-lg font-bold">
              {Math.round((stats.safeDeliveries / stats.shipments) * 100)}%
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
            <div className="text-gray-500 text-xs">Net P&amp;L</div>
            <div className={`text-lg font-bold ${stats.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {stats.netProfit >= 0 ? '+' : ''}{fmt(stats.netProfit)}
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
            <div className="text-gray-500 text-xs">Best Grade</div>
            <div className="text-sky-400 text-lg font-bold">{stats.bestGrade}</div>
          </div>
        </div>
      )}

      {/* Phase 1: Card pick */}
      {phase === 'card' && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-2">Step 1 · You Sold a Card</h2>
          <p className="text-gray-400 text-sm mb-4">Pick the card you just sold, or use a preset sale price.</p>

          <div className="mb-4">
            <label className="block text-gray-400 text-xs mb-1">Search cards</label>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Player or card name..."
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-sky-700"
            />
            {searchResults.length > 0 && (
              <div className="mt-2 space-y-1 max-h-64 overflow-y-auto border border-gray-800 rounded-xl bg-gray-950 p-2">
                {searchResults.map(c => (
                  <button
                    key={c.slug}
                    onClick={() => pickCardFromSearch(c.slug, parseDollarFrom(c.estimatedValueRaw))}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-sky-950/50 text-white text-sm transition-colors"
                  >
                    <div className="font-medium">{c.name}</div>
                    <div className="text-gray-500 text-xs">{c.estimatedValueRaw}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedCard && (
            <div className="mb-4 p-3 bg-sky-950/30 border border-sky-800/50 rounded-xl">
              <div className="text-sky-400 text-xs mb-1">Selected</div>
              <div className="text-white font-medium">{selectedCard.name}</div>
              <div className="text-gray-400 text-xs">{selectedCard.estimatedValueRaw}</div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-400 text-xs mb-1">Or use a preset</label>
            <div className="flex flex-wrap gap-2">
              {[50, 250, 1000, 5000, 15000].map(p => (
                <button
                  key={p}
                  onClick={() => usePreset(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    !selectedCardSlug && salePrice === p
                      ? 'bg-sky-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {fmt(p)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div>
              <label className="block text-gray-400 text-xs mb-1">Sale price</label>
              <input
                type="number"
                value={salePrice}
                onChange={e => setSalePrice(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-sky-700"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Declared value (for insurance)</label>
              <input
                type="number"
                value={declaredValue}
                onChange={e => setDeclaredValue(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-sky-700"
              />
            </div>
          </div>

          <button
            onClick={() => setPhase('packing')}
            disabled={salePrice <= 0}
            className="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-medium rounded-xl py-3 transition-colors"
          >
            Next: Choose Packaging →
          </button>
        </div>
      )}

      {/* Phase 2: Packing */}
      {phase === 'packing' && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-2">Step 2 · Packaging Tier</h2>
          <p className="text-gray-400 text-sm mb-4">
            More layers = more protection but more cost. For a {fmt(salePrice)} card, match the tier.
          </p>

          <div className="space-y-3 mb-5">
            {PACKING.map(p => (
              <button
                key={p.id}
                onClick={() => setPackingId(p.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  packingId === p.id
                    ? 'border-sky-500 bg-sky-950/40'
                    : 'border-gray-800 bg-gray-950 hover:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between mb-1 gap-2">
                  <div className="text-white font-semibold">{p.name}</div>
                  <div className="text-sky-400 text-sm font-medium">${p.cost.toFixed(2)}</div>
                </div>
                <div className="text-gray-400 text-xs mb-2">{p.blurb}</div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 rounded-full transition-all"
                      style={{ width: `${p.protection}%` }}
                    />
                  </div>
                  <div className="text-gray-500 text-xs">{p.protection}/100 protection</div>
                </div>
                <div className="flex flex-wrap gap-1 mb-1">
                  {p.layers.map(l => (
                    <span key={l} className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded">
                      {l}
                    </span>
                  ))}
                </div>
                <div className="text-gray-500 text-xs">Best for: {p.bestFor}</div>
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setPhase('card')}
              className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm"
            >
              ← Back
            </button>
            <button
              onClick={() => setPhase('carrier')}
              disabled={!packingId}
              className="flex-1 bg-sky-600 hover:bg-sky-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-medium rounded-xl py-2.5 transition-colors"
            >
              Next: Choose Carrier →
            </button>
          </div>
        </div>
      )}

      {/* Phase 3: Carrier */}
      {phase === 'carrier' && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-2">Step 3 · Carrier &amp; Service</h2>
          <p className="text-gray-400 text-sm mb-4">Pick who handles the package.</p>

          <div className="space-y-2 mb-5">
            {CARRIERS.map(c => (
              <button
                key={c.id}
                onClick={() => setCarrierId(c.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  carrierId === c.id
                    ? 'border-sky-500 bg-sky-950/40'
                    : 'border-gray-800 bg-gray-950 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1 gap-2">
                  <div className="text-white text-sm font-semibold">{c.name}</div>
                  <div className="text-sky-400 text-sm">${c.cost.toFixed(2)}</div>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-gray-400">{c.speed}</span>
                  <span className="text-emerald-500">{c.reliability}% rel.</span>
                  {c.includedInsurance > 0 && (
                    <span className="text-amber-500">${c.includedInsurance} inc.</span>
                  )}
                </div>
                <div className="text-gray-500 text-xs mt-1">{c.notes}</div>
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setPhase('packing')}
              className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm"
            >
              ← Back
            </button>
            <button
              onClick={() => setPhase('insurance')}
              disabled={!carrierId}
              className="flex-1 bg-sky-600 hover:bg-sky-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-medium rounded-xl py-2.5 transition-colors"
            >
              Next: Choose Insurance →
            </button>
          </div>
        </div>
      )}

      {/* Phase 4: Insurance */}
      {phase === 'insurance' && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-2">Step 4 · Insurance</h2>
          <p className="text-gray-400 text-sm mb-4">
            Declared value: <span className="text-white font-medium">{fmt(declaredValue)}</span>
            {carrier && carrier.includedInsurance > 0 && (
              <span className="text-amber-400 ml-2">(${carrier.includedInsurance} already included)</span>
            )}
          </p>

          <div className="space-y-3 mb-5">
            {INSURANCE.map(ins => {
              const coveredAbove = Math.max(0, declaredValue - (carrier?.includedInsurance || 0));
              const cost = ins.id === 'none' ? 0 : coveredAbove * (ins.ratePct / 100) + ins.flatFee;
              return (
                <button
                  key={ins.id}
                  onClick={() => setInsuranceId(ins.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    insuranceId === ins.id
                      ? 'border-sky-500 bg-sky-950/40'
                      : 'border-gray-800 bg-gray-950 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1 gap-2">
                    <div className="text-white font-semibold">{ins.name}</div>
                    <div className="text-sky-400 text-sm font-medium">
                      {ins.id === 'none' ? 'Free' : `+$${cost.toFixed(2)}`}
                    </div>
                  </div>
                  <div className="text-gray-400 text-xs mb-2">{ins.blurb}</div>
                  {ins.id !== 'none' && (
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-emerald-500">{ins.claimApprovalRate}% approval</span>
                      <span className="text-gray-500">
                        {['instant', 'slow', 'medium', 'medium', 'fast'][ins.payoutSpeed] || 'medium'} payout
                      </span>
                      <span className="text-gray-500">{ins.ratePct}% rate</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setPhase('carrier')}
              className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm"
            >
              ← Back
            </button>
            <button
              onClick={() => setPhase('signature')}
              disabled={!insuranceId}
              className="flex-1 bg-sky-600 hover:bg-sky-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-medium rounded-xl py-2.5 transition-colors"
            >
              Next: Signature Option →
            </button>
          </div>
        </div>
      )}

      {/* Phase 5: Signature */}
      {phase === 'signature' && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-2">Step 5 · Signature on Delivery?</h2>
          <p className="text-gray-400 text-sm mb-4">
            Eliminates &quot;delivered but not received&quot; disputes. Add ${declaredValue >= 500 ? '5.85' : '3.65'} for adult signature confirmation.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              onClick={() => setSignature(false)}
              className={`p-4 rounded-xl border text-left transition-all ${
                !signature
                  ? 'border-sky-500 bg-sky-950/40'
                  : 'border-gray-800 bg-gray-950 hover:border-gray-700'
              }`}
            >
              <div className="text-white font-semibold mb-1">No Signature</div>
              <div className="text-gray-500 text-xs">Save $3-$5. Porch pirates welcome.</div>
              <div className="text-emerald-500 text-xs mt-1">+$0.00</div>
            </button>
            <button
              onClick={() => setSignature(true)}
              className={`p-4 rounded-xl border text-left transition-all ${
                signature
                  ? 'border-sky-500 bg-sky-950/40'
                  : 'border-gray-800 bg-gray-950 hover:border-gray-700'
              }`}
            >
              <div className="text-white font-semibold mb-1">Require Signature</div>
              <div className="text-gray-500 text-xs">Kills porch piracy risk by 85%.</div>
              <div className="text-sky-400 text-xs mt-1">+${signatureCost.toFixed(2)}</div>
            </button>
          </div>

          {/* Summary */}
          <div className="mb-5 p-4 bg-gray-950 border border-gray-800 rounded-xl">
            <div className="text-gray-400 text-xs mb-2 font-semibold uppercase tracking-wider">Shipment Summary</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Sale price</span><span className="text-white">{fmt(salePrice)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Packaging ({packing?.name})</span><span className="text-white">${packingCost.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">{carrier?.name}</span><span className="text-white">${carrierCost.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Insurance ({insurance?.name})</span><span className="text-white">${insuranceCost.toFixed(2)}</span></div>
              {signature && <div className="flex justify-between"><span className="text-gray-400">Signature</span><span className="text-white">${signatureCost.toFixed(2)}</span></div>}
              <div className="flex justify-between pt-2 border-t border-gray-800 mt-2">
                <span className="text-gray-400 font-semibold">Total ship cost</span>
                <span className="text-sky-400 font-semibold">${totalShippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Protection score</span>
                <span className={`font-semibold ${
                  protectionScore >= 80 ? 'text-emerald-400' :
                  protectionScore >= 60 ? 'text-amber-400' :
                  'text-rose-400'
                }`}>{protectionScore}/100</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setPhase('insurance')}
              className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm"
            >
              ← Back
            </button>
            <button
              onClick={runSimulation}
              className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl py-2.5 transition-colors"
            >
              Ship It →
            </button>
          </div>
        </div>
      )}

      {/* Phase 7: Result */}
      {phase === 'result' && simResult && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className={`text-center mb-6 p-6 rounded-xl border-2 ${
            simResult.grade === 'A+' || simResult.grade === 'A' ? 'border-emerald-600 bg-emerald-950/30' :
            simResult.grade === 'B' ? 'border-amber-600 bg-amber-950/30' :
            simResult.grade === 'C' ? 'border-amber-600 bg-amber-950/20' :
            'border-rose-600 bg-rose-950/30'
          }`}>
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-2">Ship Grade</div>
            <div className={`text-7xl font-bold mb-2 ${
              simResult.grade === 'A+' || simResult.grade === 'A' ? 'text-emerald-400' :
              simResult.grade === 'B' ? 'text-amber-400' :
              simResult.grade === 'C' ? 'text-amber-500' :
              'text-rose-400'
            }`}>{simResult.grade}</div>
            <div className="text-white text-lg font-semibold uppercase tracking-wide">{simResult.outcome}</div>
          </div>

          <div className="mb-5 p-4 bg-gray-950 border border-gray-800 rounded-xl">
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-2">Shipment Story</div>
            <div className="space-y-1.5 text-sm text-gray-300">
              {simResult.storyLines.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          </div>

          <div className="mb-5 p-4 bg-gray-950 border border-gray-800 rounded-xl">
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-2">Customer</div>
            <div className="text-sm text-gray-300 italic">&quot;{simResult.customerMood}&quot;</div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-5">
            <div className="bg-gray-950 border border-gray-800 rounded-xl p-3 text-center">
              <div className="text-gray-500 text-xs mb-1">Sale</div>
              <div className="text-white text-lg font-bold">{fmt(salePrice)}</div>
            </div>
            <div className="bg-gray-950 border border-gray-800 rounded-xl p-3 text-center">
              <div className="text-gray-500 text-xs mb-1">Ship Cost</div>
              <div className="text-gray-300 text-lg font-bold">${totalShippingCost.toFixed(2)}</div>
            </div>
            <div className="bg-gray-950 border border-gray-800 rounded-xl p-3 text-center">
              <div className="text-gray-500 text-xs mb-1">Net P&amp;L</div>
              <div className={`text-lg font-bold ${simResult.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {simResult.netProfit >= 0 ? '+' : ''}{fmt(simResult.netProfit)}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={shareResult}
              className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-medium"
            >
              📋 Copy Results
            </button>
            <button
              onClick={restart}
              className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl py-2.5 transition-colors"
            >
              Ship Another →
            </button>
          </div>
        </div>
      )}

      {/* Educational sidebar (always shown under phases 2-5) */}
      {(phase === 'packing' || phase === 'carrier' || phase === 'insurance' || phase === 'signature') && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-3 text-sm">Real-World Ship Rules</h3>
          <ul className="space-y-2 text-xs text-gray-400">
            <li><span className="text-sky-400">•</span> Under $50: Ground Advantage + top loader + bubble mailer is fine.</li>
            <li><span className="text-sky-400">•</span> $50-$250: Priority Mail + insurance to declared value.</li>
            <li><span className="text-sky-400">•</span> $250-$1,000: Priority + private insurance + signature required.</li>
            <li><span className="text-sky-400">•</span> $1,000+: UPS 2-Day + private insurance + adult signature + rigid box.</li>
            <li><span className="text-sky-400">•</span> Always photo the packed package before shipping — claim evidence.</li>
          </ul>
        </div>
      )}
    </div>
  );
}

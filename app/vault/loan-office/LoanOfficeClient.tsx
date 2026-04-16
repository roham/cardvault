'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

type Sport = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey';
type Phase = 'pick' | 'offers' | 'active' | 'outcome';
type TermDays = 30 | 60 | 90;

interface Lender {
  id: string;
  name: string;
  blurb: string;
  tagline: string;
  ltv: number;       // 0-1, % of card value
  monthlyRate: number; // monthly interest rate (decimal)
  originationFee: number; // % of principal taken upfront
  strictness: number; // 0-1, chance of refusing high-LTV requests
  color: string;
  accent: string;
}

const LENDERS: Lender[] = [
  {
    id: 'first-city',
    name: 'First City Trust',
    blurb: 'Conservative. Boring. Reliable. The credit union of card lenders.',
    tagline: 'Low rate, low LTV, zero surprises.',
    ltv: 0.35,
    monthlyRate: 0.0125, // 1.25%/mo ≈ 15% APR
    originationFee: 0.02,
    strictness: 0.8,
    color: 'emerald',
    accent: 'text-emerald-400',
  },
  {
    id: 'hobby-capital',
    name: 'Hobby Capital',
    blurb: 'Sharp-dressed loan officer who has seen every grade of every card.',
    tagline: 'Middle of the road. Fair LTV, fair APR.',
    ltv: 0.5,
    monthlyRate: 0.02, // 2%/mo = 24% APR
    originationFee: 0.03,
    strictness: 0.5,
    color: 'amber',
    accent: 'text-amber-400',
  },
  {
    id: 'quick-cash',
    name: 'Quick Cash Cards',
    blurb: 'Neon sign, open 24 hours, no questions asked.',
    tagline: 'Highest LTV, highest rate. Desperate money.',
    ltv: 0.7,
    monthlyRate: 0.04, // 4%/mo = 48% APR
    originationFee: 0.05,
    strictness: 0.2,
    color: 'rose',
    accent: 'text-rose-400',
  },
];

interface Stats {
  loansTaken: number;
  repaidOnTime: number;
  defaulted: number;
  totalBorrowed: number;
  totalInterestPaid: number;
  cardsLost: number;
}

const STORAGE_KEY = 'cv_loan_office_stats_v1';
const DEFAULT_STATS: Stats = {
  loansTaken: 0,
  repaidOnTime: 0,
  defaulted: 0,
  totalBorrowed: 0,
  totalInterestPaid: 0,
  cardsLost: 0,
};

function parseValue(val: string): number {
  if (!val) return 5;
  const m = val.match(/\$([0-9,.]+)/);
  if (!m) return 5;
  return parseFloat(m[1].replace(/,/g, ''));
}

function money(n: number): string {
  if (n >= 1000) return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  return `$${n.toFixed(2)}`;
}

function computeOffer(lender: Lender, cardValue: number, term: TermDays, ltvOverride?: number) {
  const ltv = Math.min(ltvOverride ?? lender.ltv, lender.ltv);
  const principal = Math.round(cardValue * ltv);
  const months = term / 30;
  const monthlyInterest = principal * lender.monthlyRate;
  const totalInterest = Math.round(monthlyInterest * months);
  const origination = Math.round(principal * lender.originationFee);
  const totalRepayment = principal + totalInterest;
  const netReceived = principal - origination;
  const apr = lender.monthlyRate * 12 * 100;
  return {
    principal,
    monthlyInterest: Math.round(monthlyInterest),
    totalInterest,
    origination,
    totalRepayment,
    netReceived,
    apr,
    months,
  };
}

export default function LoanOfficeClient() {
  const [phase, setPhase] = useState<Phase>('pick');
  const [sport, setSport] = useState<Sport>('all');
  const [search, setSearch] = useState('');
  const [selectedCard, setSelectedCard] = useState<{ slug: string; name: string; player: string; value: number; sport: string } | null>(null);
  const [term, setTerm] = useState<TermDays>(30);
  const [chosenLender, setChosenLender] = useState<Lender | null>(null);
  const [outcome, setOutcome] = useState<{ scenario: string; repaid: boolean; cardKept: boolean; netCash: number; narrative: string } | null>(null);
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);

  // Load stats
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setStats({ ...DEFAULT_STATS, ...JSON.parse(raw) });
    } catch {}
  }, []);

  const saveStats = useCallback((next: Stats) => {
    setStats(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  }, []);

  // Filter/search candidate cards (collateral picker)
  const pickList = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matches: Array<{ slug: string; name: string; player: string; value: number; sport: string }> = [];
    for (let i = 0; i < sportsCards.length && matches.length < 40; i++) {
      const c = sportsCards[i];
      if (sport !== 'all' && c.sport !== sport) continue;
      if (q && !c.name.toLowerCase().includes(q) && !c.player.toLowerCase().includes(q)) continue;
      const v = parseValue(c.estimatedValueRaw);
      if (v < 10) continue; // lenders won't take sub-$10 collateral
      matches.push({ slug: c.slug, name: c.name, player: c.player, value: v, sport: c.sport });
    }
    return matches;
  }, [sport, search]);

  // Popular picks — high-value cards to showcase
  const featured = useMemo(() => {
    const seen = new Set<string>();
    const out: Array<{ slug: string; name: string; player: string; value: number; sport: string }> = [];
    for (const c of sportsCards) {
      const v = parseValue(c.estimatedValueRaw);
      if (v < 500) continue;
      if (seen.has(c.player)) continue;
      seen.add(c.player);
      out.push({ slug: c.slug, name: c.name, player: c.player, value: v, sport: c.sport });
      if (out.length >= 6) break;
    }
    return out;
  }, []);

  function pickCard(card: typeof selectedCard) {
    setSelectedCard(card);
    setPhase('offers');
  }

  function acceptOffer(lender: Lender) {
    setChosenLender(lender);
    setPhase('active');
  }

  function simulateOutcome(scenario: 'repay' | 'default' | 'lucky' | 'crash') {
    if (!selectedCard || !chosenLender) return;
    const offer = computeOffer(chosenLender, selectedCard.value, term);

    let repaid = false;
    let cardKept = false;
    let netCash = 0;
    let narrative = '';

    switch (scenario) {
      case 'repay': {
        // You pay on time. Keep card. Net cash = (loan received) - (total repayment)
        repaid = true;
        cardKept = true;
        netCash = offer.netReceived - offer.totalRepayment;
        narrative = `You made every payment on time. ${chosenLender.name} releases the collateral — your ${selectedCard.name} is back in your vault. You paid ${money(offer.totalInterest + offer.origination)} in interest and fees for short-term liquidity.`;
        break;
      }
      case 'lucky': {
        // You flipped the borrowed cash at a profit, then repaid. Net = flip profit - total cost
        repaid = true;
        cardKept = true;
        const flipGain = Math.round(offer.netReceived * 0.6); // 60% return on borrowed capital
        netCash = flipGain - (offer.totalRepayment - offer.netReceived);
        narrative = `You used the ${money(offer.netReceived)} to flip another deal. The flip cleared ${money(flipGain)} profit. You repaid on time, kept your card, and still netted ${money(netCash)} after interest. This is the dream case — and why collectors use collateral loans.`;
        break;
      }
      case 'default': {
        // You miss payments, card is seized. You keep the cash, lose the card.
        repaid = false;
        cardKept = false;
        netCash = offer.netReceived; // you kept the loan proceeds
        narrative = `You missed payments past the grace period. ${chosenLender.name} seizes ${selectedCard.name} as full satisfaction of the debt. You walked away with ${money(offer.netReceived)} in cash but lost a card valued at ${money(selectedCard.value)}. Opportunity cost: ${money(selectedCard.value - offer.netReceived)}.`;
        break;
      }
      case 'crash': {
        // Card value drops below loan balance — lender forces liquidation. You lose card AND still owe.
        repaid = false;
        cardKept = false;
        netCash = offer.netReceived - offer.totalRepayment; // worst case
        narrative = `The market crashed mid-loan. ${selectedCard.name} fell ~40% below the loan balance. ${chosenLender.name} called the loan early, liquidated the collateral, and you still owe the shortfall. Net outcome: you lost the card AND paid out of pocket. This is why high-LTV short-term loans are dangerous in volatile markets.`;
        break;
      }
    }

    // Update stats
    const nextStats: Stats = {
      loansTaken: stats.loansTaken + 1,
      repaidOnTime: stats.repaidOnTime + (repaid ? 1 : 0),
      defaulted: stats.defaulted + (repaid ? 0 : 1),
      totalBorrowed: stats.totalBorrowed + offer.principal,
      totalInterestPaid: stats.totalInterestPaid + (repaid ? offer.totalInterest + offer.origination : 0),
      cardsLost: stats.cardsLost + (cardKept ? 0 : 1),
    };
    saveStats(nextStats);
    setOutcome({ scenario, repaid, cardKept, netCash, narrative });
    setPhase('outcome');
  }

  function reset() {
    setPhase('pick');
    setSelectedCard(null);
    setChosenLender(null);
    setOutcome(null);
  }

  function resetStats() {
    saveStats(DEFAULT_STATS);
  }

  // ---- PICK PHASE ----
  if (phase === 'pick') {
    return (
      <div className="space-y-6">
        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatTile label="Loans" value={stats.loansTaken} />
          <StatTile label="Repaid" value={stats.repaidOnTime} valueClass="text-emerald-400" />
          <StatTile label="Defaulted" value={stats.defaulted} valueClass="text-rose-400" />
          <StatTile label="Cards Lost" value={stats.cardsLost} valueClass="text-amber-400" />
        </div>

        <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-5">
          <h2 className="text-lg font-bold text-white mb-2">Step 1 · Pick Collateral</h2>
          <p className="text-gray-400 text-sm mb-4">
            Choose a card with estimated value $10+. The lender will fund a percentage of this value as a cash loan. Higher-value cards qualify for larger loans.
          </p>

          {/* Featured picks */}
          <div className="mb-4">
            <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Popular Collateral</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {featured.map(c => (
                <button
                  key={c.slug}
                  onClick={() => pickCard(c)}
                  className="flex items-center justify-between gap-3 px-3 py-2 bg-gray-900/60 border border-gray-800 hover:border-amber-700/50 rounded-lg text-left transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-white text-sm font-medium truncate">{c.name}</div>
                    <div className="text-gray-500 text-xs truncate">{c.player} &middot; {c.sport}</div>
                  </div>
                  <div className="text-amber-400 font-bold text-sm whitespace-nowrap">{money(c.value)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-3">
            {(['all', 'baseball', 'basketball', 'football', 'hockey'] as Sport[]).map(s => (
              <button
                key={s}
                onClick={() => setSport(s)}
                className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                  sport === s
                    ? 'bg-amber-900/40 border-amber-700 text-amber-300'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                {s === 'all' ? 'All Sports' : s[0].toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search player or card name..."
            className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:border-amber-700 focus:outline-none text-sm"
          />
        </div>

        {pickList.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {pickList.map(c => (
              <button
                key={c.slug}
                onClick={() => pickCard(c)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-amber-700/50 rounded-lg text-left transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-white text-sm font-medium truncate">{c.name}</div>
                  <div className="text-gray-500 text-xs truncate">{c.player} &middot; {c.sport}</div>
                </div>
                <div className="text-amber-400 font-bold text-sm whitespace-nowrap">{money(c.value)}</div>
              </button>
            ))}
          </div>
        )}

        {stats.loansTaken > 0 && (
          <button
            onClick={resetStats}
            className="text-xs text-gray-500 hover:text-gray-400 underline"
          >
            Reset stats
          </button>
        )}
      </div>
    );
  }

  // ---- OFFERS PHASE ----
  if (phase === 'offers' && selectedCard) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Collateral</div>
            <div className="text-white font-bold truncate">{selectedCard.name}</div>
            <div className="text-gray-400 text-sm">{selectedCard.player} &middot; {selectedCard.sport}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Est. Value</div>
            <div className="text-2xl font-bold text-amber-400">{money(selectedCard.value)}</div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-lg font-bold text-white mb-3">Step 2 · Choose Term</h2>
          <div className="grid grid-cols-3 gap-2">
            {([30, 60, 90] as TermDays[]).map(t => (
              <button
                key={t}
                onClick={() => setTerm(t)}
                className={`px-3 py-3 rounded-lg border text-center transition-colors ${
                  term === t
                    ? 'bg-amber-900/40 border-amber-700 text-amber-300'
                    : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                <div className="font-bold text-lg">{t} days</div>
                <div className="text-xs opacity-70">{t / 30} month{t > 30 ? 's' : ''}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3">Step 3 · Review Offers</h2>
          <div className="space-y-3">
            {LENDERS.map(lender => {
              const offer = computeOffer(lender, selectedCard.value, term);
              const colorMap: Record<string, { bg: string; border: string; text: string; btn: string }> = {
                emerald: { bg: 'bg-emerald-950/20', border: 'border-emerald-900/40', text: 'text-emerald-400', btn: 'bg-emerald-700 hover:bg-emerald-600' },
                amber: { bg: 'bg-amber-950/20', border: 'border-amber-900/40', text: 'text-amber-400', btn: 'bg-amber-700 hover:bg-amber-600' },
                rose: { bg: 'bg-rose-950/20', border: 'border-rose-900/40', text: 'text-rose-400', btn: 'bg-rose-700 hover:bg-rose-600' },
              };
              const c = colorMap[lender.color];
              return (
                <div key={lender.id} className={`${c.bg} border ${c.border} rounded-xl p-5`}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className={`text-lg font-bold ${c.text}`}>{lender.name}</div>
                      <div className="text-gray-400 text-xs italic">{lender.blurb}</div>
                      <div className="text-gray-300 text-sm mt-1">{lender.tagline}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs uppercase tracking-wide text-gray-500">You Get</div>
                      <div className={`text-2xl font-bold ${c.text}`}>{money(offer.netReceived)}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
                    <MiniStat label="LTV" value={`${Math.round(lender.ltv * 100)}%`} />
                    <MiniStat label="APR" value={`${offer.apr.toFixed(0)}%`} />
                    <MiniStat label="Total Repay" value={money(offer.totalRepayment)} />
                    <MiniStat label="Orig. Fee" value={money(offer.origination)} />
                  </div>
                  <div className="text-xs text-gray-500 mb-4">
                    Monthly interest: {money(offer.monthlyInterest)} &middot; Term: {term} days &middot; Balloon at end: {money(offer.totalRepayment)}
                  </div>
                  <button
                    onClick={() => acceptOffer(lender)}
                    className={`w-full px-4 py-2.5 ${c.btn} text-white text-sm font-bold rounded-lg transition-colors`}
                  >
                    Accept {lender.name} Offer
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={reset}
          className="text-sm text-gray-500 hover:text-gray-400 underline"
        >
          ← Pick a different card
        </button>
      </div>
    );
  }

  // ---- ACTIVE LOAN PHASE ----
  if (phase === 'active' && selectedCard && chosenLender) {
    const offer = computeOffer(chosenLender, selectedCard.value, term);
    return (
      <div className="space-y-6">
        <div className="bg-amber-950/30 border border-amber-700/50 rounded-xl p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="text-xs uppercase tracking-wide text-amber-400 mb-1">Loan Active</div>
              <div className="text-2xl font-bold text-white">{money(offer.netReceived)} cash received</div>
              <div className="text-gray-400 text-sm mt-1">{chosenLender.name} · {term}-day term · {offer.apr.toFixed(0)}% APR</div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-wide text-gray-500">Collateral Held</div>
              <div className="text-sm text-gray-300 font-medium">{selectedCard.name}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MiniStat label="Principal" value={money(offer.principal)} />
            <MiniStat label="Interest" value={money(offer.totalInterest)} />
            <MiniStat label="Orig. Fee" value={money(offer.origination)} />
            <MiniStat label="Due at End" value={money(offer.totalRepayment)} strong />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3">Step 4 · How does it play out?</h2>
          <p className="text-gray-400 text-sm mb-4">
            Pick a scenario to fast-forward through the life of the loan. Each outcome teaches a different lesson about collector-finance dynamics.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ScenarioCard
              title="Repay On Time"
              emoji="✅"
              subtitle="The plain-vanilla case"
              description="You budget the repayment, pay monthly, get your card back."
              onClick={() => simulateOutcome('repay')}
              color="emerald"
            />
            <ScenarioCard
              title="Flip & Repay"
              emoji="🚀"
              subtitle="The dream case"
              description="You use the borrowed cash to clear a bigger flip. Net positive after interest."
              onClick={() => simulateOutcome('lucky')}
              color="blue"
            />
            <ScenarioCard
              title="Default"
              emoji="🚫"
              subtitle="You can't repay"
              description="Miss payments, grace period ends, lender keeps the card as full payment."
              onClick={() => simulateOutcome('default')}
              color="amber"
            />
            <ScenarioCard
              title="Market Crash"
              emoji="📉"
              subtitle="Worst case"
              description="Card value drops below balance. Lender forces liquidation — you lose card AND owe shortfall."
              onClick={() => simulateOutcome('crash')}
              color="rose"
            />
          </div>
        </div>

        <button onClick={reset} className="text-sm text-gray-500 hover:text-gray-400 underline">
          ← Start over
        </button>
      </div>
    );
  }

  // ---- OUTCOME PHASE ----
  if (phase === 'outcome' && outcome && selectedCard && chosenLender) {
    const offer = computeOffer(chosenLender, selectedCard.value, term);
    const good = outcome.netCash >= 0 && outcome.cardKept;
    return (
      <div className="space-y-6">
        <div className={`border rounded-xl p-6 ${good ? 'bg-emerald-950/30 border-emerald-700/50' : outcome.cardKept ? 'bg-amber-950/30 border-amber-700/50' : 'bg-rose-950/30 border-rose-700/50'}`}>
          <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">Outcome</div>
          <div className="text-3xl font-bold text-white mb-2">
            {good ? 'Loan Worked Out' : outcome.cardKept ? 'Survived, But Paid For It' : 'You Lost The Card'}
          </div>
          <div className={`text-2xl font-bold mb-3 ${outcome.netCash >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            Net: {outcome.netCash >= 0 ? '+' : ''}{money(outcome.netCash)}
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">{outcome.narrative}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-bold mb-3">Loan Breakdown</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <MiniStat label="Card Value" value={money(selectedCard.value)} />
            <MiniStat label="Principal" value={money(offer.principal)} />
            <MiniStat label="Net Received" value={money(offer.netReceived)} />
            <MiniStat label="Total Interest" value={money(offer.totalInterest)} />
            <MiniStat label="Origination Fee" value={money(offer.origination)} />
            <MiniStat label="APR" value={`${offer.apr.toFixed(0)}%`} />
          </div>
        </div>

        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-bold mb-2">Lesson Learned</h3>
          <p className="text-gray-400 text-sm">
            {outcome.scenario === 'repay' && 'Card loans cost money. In exchange, you avoided a taxable sale and kept future upside. Worth it if the card appreciates above your total interest cost.'}
            {outcome.scenario === 'lucky' && 'Borrowed capital is leverage. It magnifies wins — but also losses. If the flip had failed, you would still owe the same balloon payment.'}
            {outcome.scenario === 'default' && 'Defaulting means lenders took your card at a steep discount to its true value. If you knew you couldn\'t repay, selling outright would usually net more.'}
            {outcome.scenario === 'crash' && 'High-LTV loans on volatile assets are a margin-call risk. Conservative lenders cap LTV at 30-40% precisely to prevent this outcome.'}
          </p>
        </div>

        <div className="flex gap-3">
          <button onClick={reset} className="flex-1 px-4 py-3 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors">
            Take Another Loan
          </button>
          <Link href="/vault" className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white text-center font-bold rounded-lg transition-colors">
            Back to Vault
          </Link>
        </div>
      </div>
    );
  }

  return null;
}

function StatTile({ label, value, valueClass }: { label: string; value: number; valueClass?: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-3">
      <div className="text-xs uppercase tracking-wide text-gray-500 mb-0.5">{label}</div>
      <div className={`text-xl font-bold ${valueClass || 'text-white'}`}>{value}</div>
    </div>
  );
}

function MiniStat({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="bg-gray-950/50 border border-gray-800 rounded-lg px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-gray-500">{label}</div>
      <div className={`${strong ? 'text-white font-bold' : 'text-gray-200'} text-sm`}>{value}</div>
    </div>
  );
}

function ScenarioCard({ title, emoji, subtitle, description, onClick, color }: {
  title: string;
  emoji: string;
  subtitle: string;
  description: string;
  onClick: () => void;
  color: 'emerald' | 'blue' | 'amber' | 'rose';
}) {
  const colorMap: Record<string, string> = {
    emerald: 'hover:border-emerald-700/50 hover:bg-emerald-950/20',
    blue: 'hover:border-blue-700/50 hover:bg-blue-950/20',
    amber: 'hover:border-amber-700/50 hover:bg-amber-950/20',
    rose: 'hover:border-rose-700/50 hover:bg-rose-950/20',
  };
  return (
    <button
      onClick={onClick}
      className={`text-left bg-gray-900/60 border border-gray-800 rounded-xl p-4 transition-colors ${colorMap[color]}`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">{emoji}</span>
        <span className="text-white font-bold">{title}</span>
      </div>
      <div className="text-xs text-gray-500 mb-2">{subtitle}</div>
      <p className="text-sm text-gray-400">{description}</p>
    </button>
  );
}

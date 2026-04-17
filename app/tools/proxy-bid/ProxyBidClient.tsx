'use client';

import { useMemo, useState } from 'react';

// eBay-style bid increment ladder
// Returns the increment that applies to a CURRENT price point.
function incrementFor(price: number): number {
  if (price < 1) return 0.05;
  if (price < 5) return 0.25;
  if (price < 25) return 0.5;
  if (price < 100) return 1;
  if (price < 250) return 2.5;
  if (price < 500) return 5;
  if (price < 1000) return 10;
  if (price < 2500) return 25;
  if (price < 5000) return 50;
  return 100;
}

// Given a second-highest max (losing bidder's cap), compute what the winner
// actually pays — the minimum bid above that cap per the increment ladder.
function clearingPriceAbove(secondHighest: number): number {
  if (secondHighest <= 0) return 0.99; // Opening bid if unopposed
  const inc = incrementFor(secondHighest);
  return Math.round((secondHighest + inc) * 100) / 100;
}

// Suggest a deterrent max bid just above a user's stated target (e.g. 500 -> 503, 1000 -> 1013).
function deterrentAbove(target: number): number {
  const inc = incrementFor(target);
  // Add 1.3 * increment so the bid sits clearly above a round-number anchor.
  const extra = inc * 1.3;
  return Math.round((target + extra) * 100) / 100;
}

function fmt(n: number): string {
  if (!isFinite(n)) return '—';
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

type Rival = { id: number; max: number };

const DEFAULT_RIVALS: Rival[] = [
  { id: 1, max: 350 },
  { id: 2, max: 0 },
  { id: 3, max: 0 },
  { id: 4, max: 0 },
];

type WindowTiming = 'early' | 'late-lastday' | '10min' | '1min' | '10sec';

export default function ProxyBidClient() {
  const [currentBid, setCurrentBid] = useState<number>(50);
  const [yourMax, setYourMax] = useState<number>(500);
  const [rivals, setRivals] = useState<Rival[]>(DEFAULT_RIVALS);
  const [timing, setTiming] = useState<WindowTiming>('10sec');
  const [deterrentTarget, setDeterrentTarget] = useState<number>(500);

  const activeRivalMaxes = useMemo(
    () => rivals.map((r) => r.max).filter((m) => m > 0),
    [rivals],
  );

  const topRivalMax = useMemo(
    () => (activeRivalMaxes.length > 0 ? Math.max(...activeRivalMaxes) : 0),
    [activeRivalMaxes],
  );

  const youAreWinning = yourMax > topRivalMax && yourMax > currentBid;
  const loserMax = youAreWinning ? topRivalMax : yourMax;
  const effectiveSecondHighest = Math.max(currentBid - incrementFor(currentBid), loserMax);
  const clearingPrice = youAreWinning
    ? Math.max(clearingPriceAbove(loserMax), currentBid)
    : // If you are losing, you need to bid at least one increment above yourMax; show that price
      clearingPriceAbove(yourMax);

  const worstCase = yourMax;

  const savingsVsMax = youAreWinning ? Math.max(0, yourMax - clearingPrice) : 0;

  const deterrent = useMemo(() => deterrentAbove(deterrentTarget), [deterrentTarget]);

  const nextIncrement = incrementFor(currentBid);

  const timingAdvice: Record<WindowTiming, { label: string; color: string; advice: string }> = {
    early: {
      label: 'Days early',
      color: 'text-amber-700',
      advice:
        'Entering now signals interest. Rivals will have time to react — sophisticated bidders will raise; casuals may get anchored. Fine for commodity cards with predictable rivals. Risky for rare grails that pull emotional bidders out of the woodwork.',
    },
    'late-lastday': {
      label: 'Last day (hours out)',
      color: 'text-amber-600',
      advice:
        'Worst window if you have casuals bidding. They see your entry, panic-raise, and push the clearing price up. Skip this window.',
    },
    '10min': {
      label: 'Last 10 minutes',
      color: 'text-orange-600',
      advice:
        'The danger zone. Rivals are watching. Your bid triggers a proxy war in the final minutes. Only enter now if you have a clear max ceiling and accept paying it.',
    },
    '1min': {
      label: 'Last minute',
      color: 'text-sky-600',
      advice:
        'Good window. Most casuals are not monitoring second-by-second. You deny rivals time to emotionally escalate. Execute cleanly with a pre-typed max.',
    },
    '10sec': {
      label: 'Last 10 seconds (snipe)',
      color: 'text-emerald-700',
      advice:
        'Optimal against emotional rivals. They cannot respond. Your proxy max fights only whatever was already set. Use a snipe tool (Gixen, BidSlammer) or hit Confirm Bid with under 10 seconds remaining. Failure mode: network latency eats your bid — snipe tools mitigate this.',
    },
  };

  const updateRival = (id: number, val: number) => {
    setRivals((rs) => rs.map((r) => (r.id === id ? { ...r, max: val } : r)));
  };

  const reset = () => {
    setCurrentBid(50);
    setYourMax(500);
    setRivals(DEFAULT_RIVALS);
    setTiming('10sec');
    setDeterrentTarget(500);
  };

  const verdict = useMemo(() => {
    if (!yourMax || yourMax <= 0) {
      return {
        label: 'ENTER YOUR MAX',
        tone: 'bg-gray-200 text-gray-700 border-gray-400',
        summary: 'Enter your maximum bid to see expected clearing price.',
      };
    }
    if (!youAreWinning) {
      return {
        label: 'YOU ARE OUTBID',
        tone: 'bg-rose-100 text-rose-800 border-rose-400',
        summary: `To win, you would need to raise to at least ${fmt(clearingPriceAbove(yourMax))}. The top rival\u2019s max (${fmt(topRivalMax)}) is above your current max.`,
      };
    }
    const margin = yourMax - clearingPrice;
    if (margin >= yourMax * 0.3) {
      return {
        label: 'WINNING COMFORTABLY',
        tone: 'bg-emerald-100 text-emerald-800 border-emerald-400',
        summary: `You clear well below your max — ${fmt(clearingPrice)} vs your ${fmt(yourMax)} ceiling. Pad is ${fmt(margin)} (${Math.round((margin / yourMax) * 100)}%).`,
      };
    }
    if (margin >= yourMax * 0.05) {
      return {
        label: 'WINNING TIGHT',
        tone: 'bg-sky-100 text-sky-800 border-sky-400',
        summary: `You clear at ${fmt(clearingPrice)} — only ${fmt(margin)} below your max. A new rival bidding above ${fmt(yourMax)} wins this lot.`,
      };
    }
    return {
      label: 'AT YOUR CEILING',
      tone: 'bg-amber-100 text-amber-900 border-amber-400',
      summary: `You clear within one increment of your max. Any new rival above ${fmt(yourMax)} takes the lot.`,
    };
  }, [yourMax, youAreWinning, topRivalMax, clearingPrice]);

  return (
    <section className="space-y-5">
      {/* Input form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-indigo-200 rounded-xl p-4">
          <label className="text-xs text-gray-600 uppercase tracking-wider block mb-1">
            Current high bid
          </label>
          <input
            type="number"
            value={currentBid}
            onChange={(e) => setCurrentBid(Math.max(0, parseFloat(e.target.value) || 0))}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 text-lg font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <div className="text-xs text-gray-500 mt-1">
            Next increment: <span className="font-semibold">{fmt(nextIncrement)}</span>
          </div>
        </div>

        <div className="bg-white border border-indigo-200 rounded-xl p-4">
          <label className="text-xs text-gray-600 uppercase tracking-wider block mb-1">
            Your max bid
          </label>
          <input
            type="number"
            value={yourMax}
            onChange={(e) => setYourMax(Math.max(0, parseFloat(e.target.value) || 0))}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 text-lg font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <div className="text-xs text-gray-500 mt-1">
            Worst-case payment: <span className="font-semibold">{fmt(worstCase)}</span>
          </div>
        </div>
      </div>

      {/* Rival bidders */}
      <div className="bg-white border border-indigo-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-indigo-900">
            Rival maxes (what you think the competition will bid)
          </div>
          <button
            type="button"
            onClick={reset}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Reset
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {rivals.map((r) => (
            <div key={r.id}>
              <label className="text-[11px] text-gray-500 uppercase tracking-wider block mb-1">
                Rival {r.id}
              </label>
              <input
                type="number"
                value={r.max}
                onChange={(e) => updateRival(r.id, Math.max(0, parseFloat(e.target.value) || 0))}
                min="0"
                step="0.01"
                placeholder="0"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          ))}
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Enter 0 for rivals who have not bid. Clearing price is set by the highest rival max + one increment.
        </div>
      </div>

      {/* Verdict + Results */}
      <div className={`border-2 rounded-xl p-5 ${verdict.tone}`}>
        <div className="flex items-baseline justify-between gap-3 flex-wrap mb-2">
          <div className="text-sm font-bold uppercase tracking-wider">{verdict.label}</div>
          {yourMax > 0 && youAreWinning && (
            <div className="text-xs">
              You save <span className="font-bold">{fmt(savingsVsMax)}</span> vs your max
            </div>
          )}
        </div>
        <p className="text-sm">{verdict.summary}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-4 text-center">
          <div className="text-xs uppercase tracking-wider text-gray-600">Expected clearing</div>
          <div className="text-3xl font-bold text-indigo-700 mt-1">{fmt(clearingPrice)}</div>
          <div className="text-xs text-gray-500 mt-1">
            One increment above the top rival max
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 text-center">
          <div className="text-xs uppercase tracking-wider text-gray-600">Worst case</div>
          <div className="text-3xl font-bold text-amber-700 mt-1">{fmt(worstCase)}</div>
          <div className="text-xs text-gray-500 mt-1">If a new rival exactly matches your max</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 text-center">
          <div className="text-xs uppercase tracking-wider text-gray-600">Savings vs max</div>
          <div className="text-3xl font-bold text-emerald-700 mt-1">{fmt(savingsVsMax)}</div>
          <div className="text-xs text-gray-500 mt-1">
            {yourMax > 0 && savingsVsMax > 0
              ? `${Math.round((savingsVsMax / yourMax) * 100)}% under your ceiling`
              : 'When you bid above your actual win need'}
          </div>
        </div>
      </div>

      {/* Timing advice */}
      <div className="bg-white border border-indigo-200 rounded-xl p-4">
        <div className="text-sm font-semibold text-indigo-900 mb-2">Bid-timing window</div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {(Object.keys(timingAdvice) as WindowTiming[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTiming(t)}
              className={`px-3 py-1.5 text-xs rounded-full border transition ${
                timing === t
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
              }`}
            >
              {timingAdvice[t].label}
            </button>
          ))}
        </div>
        <div className={`text-sm leading-relaxed ${timingAdvice[timing].color}`}>
          <div className="font-semibold mb-0.5">{timingAdvice[timing].label}</div>
          <div className="text-gray-700">{timingAdvice[timing].advice}</div>
        </div>
      </div>

      {/* Deterrent bid suggester */}
      <div className="bg-white border border-violet-200 rounded-xl p-4">
        <div className="text-sm font-semibold text-violet-900 mb-2">Deterrent bid suggester</div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[160px]">
            <label className="text-xs text-gray-600 block mb-1">Rival\u2019s likely round-number target</label>
            <input
              type="number"
              value={deterrentTarget}
              onChange={(e) =>
                setDeterrentTarget(Math.max(0, parseFloat(e.target.value) || 0))
              }
              min="0"
              step="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>
          <div className="flex-1 min-w-[160px] bg-violet-50 border border-violet-300 rounded-lg px-3 py-2">
            <div className="text-xs text-violet-700 uppercase tracking-wider">Suggested max</div>
            <div className="text-2xl font-bold text-violet-800">{fmt(deterrent)}</div>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Beats a rival who anchors on the round-number target by exactly one increment + a nudge. Across many auctions this 1–3% edge compounds into real savings.
        </p>
      </div>

      {/* Increment math breakdown */}
      <details className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <summary className="text-sm font-semibold cursor-pointer text-gray-800 hover:text-indigo-700">
          How the math works (click to expand)
        </summary>
        <div className="mt-3 space-y-2 text-sm text-gray-700">
          <p>
            <strong>Top rival max:</strong> {fmt(topRivalMax)}.{' '}
            {activeRivalMaxes.length > 0 ? `Derived from ${activeRivalMaxes.length} active rival bidder${activeRivalMaxes.length > 1 ? 's' : ''}.` : 'No rivals entered yet.'}
          </p>
          <p>
            <strong>Effective second-highest:</strong> {fmt(effectiveSecondHighest)}. Current bid ({fmt(currentBid)}) minus the band\u2019s increment represents the minimum max that produced the current price.
          </p>
          <p>
            <strong>Clearing formula:</strong>{' '}
            <code className="bg-white px-1.5 py-0.5 rounded border">
              max(currentBid, topRivalMax + increment(topRivalMax))
            </code>
            . Result: {fmt(clearingPrice)}.
          </p>
          <p>
            <strong>Worst case:</strong> A new rival you have not modeled enters and bids exactly your max or slightly below. Then you pay one increment above THEIR max — up to your ceiling of {fmt(worstCase)}.
          </p>
          <p>
            <strong>Increment at your max:</strong> {fmt(incrementFor(yourMax))}. That is the granularity of the clearing price in your max\u2019s band.
          </p>
        </div>
      </details>

      {/* Strategy callouts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-200 rounded-lg p-4">
          <div className="text-sm font-bold text-sky-900 mb-1">🎯 The single-bid rule</div>
          <p className="text-xs text-gray-700">
            Enter your TRUE max once. Do not nibble upward in small bumps — each bump signals commitment and pushes anchored rivals to raise. If you would pay {fmt(yourMax)}, enter {fmt(yourMax)} in one bid. Proxy does the work.
          </p>
        </div>
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 rounded-lg p-4">
          <div className="text-sm font-bold text-rose-900 mb-1">⚠️ The anchor trap</div>
          <p className="text-xs text-gray-700">
            Do not let the current high bid become your emotional anchor. If the lot sits at $350 and jumps to $400, that does not mean your max should be $500. Decide your max from comps BEFORE you look at the current price.
          </p>
        </div>
      </div>
    </section>
  );
}

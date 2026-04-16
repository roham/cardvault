'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { sportsCards, type SportsCard } from '@/data/sports-cards';

type Action = 'quick' | 'online' | 'consign' | 'keep';

interface EstateCard {
  slug: string;
  name: string;
  year: number;
  sport: string;
  player: string;
  fmvMid: number;
  rookie: boolean;
  set: string;
  era: 'prewar' | 'vintage' | 'junk' | 'modern' | 'current';
  condition: 'poor' | 'good' | 'vgex' | 'nm' | 'mint';
  storyTag: string;
}

interface ActionResult {
  cashRecovered: number;
  feeRate: number;
  daysToSettle: number;
  label: string;
  color: string;
}

const CONDITION_BLURBS: Record<string, string> = {
  poor: 'Creased corners, off-center, surface wear — a project card.',
  good: 'Rounded corners but intact surface. Typical attic find.',
  vgex: 'Light corner wear, honest centering, clean surface. Very gradable.',
  nm: 'Sharp corners, mint-adjacent. Surprise in a decades-old box.',
  mint: 'Binder-preserved, pack-fresh. The heir who knew what they had.',
};

const STORY_TAGS = [
  'Found in an envelope marked "Uncle Frank"',
  'From a 1968 Sears stamp album',
  'Tucked inside a baseball glove',
  'Boxed with a spring-training program',
  'Loose at the bottom of a toolbox',
  'Still sleeved — "don\'t touch" sticker',
  'In a Dunkin\'Donuts tin',
  'Wrapped in a local newspaper clipping',
  'Slipped inside a 1989 Christmas card',
  'Behind a framed baseball poster',
  'Under a false bottom in a desk drawer',
  'Left in an attic since the 1990s',
  'In a shoebox marked "Do Not Sell"',
  'With a handwritten note: "save for the grandson"',
  'Mounted in a Beckett magazine still in the wrapper',
];

const getEra = (year: number): EstateCard['era'] => {
  if (year < 1945) return 'prewar';
  if (year < 1980) return 'vintage';
  if (year < 1995) return 'junk';
  if (year < 2015) return 'modern';
  return 'current';
};

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
  // Strip $, commas, take midpoint of "1,200-2,500" if range
  const clean = s.replace(/[$,]/g, '');
  const parts = clean.split('-').map(p => parseFloat(p.trim())).filter(n => !isNaN(n));
  if (parts.length === 2) return (parts[0] + parts[1]) / 2;
  if (parts.length === 1) return parts[0];
  return 0;
}

function buildEstate(seed: number): EstateCard[] {
  const rng = mulberry32(seed);
  const pool = (sportsCards as unknown as SportsCard[]).filter(c => {
    const v = parseValue(c.estimatedValueRaw);
    return v >= 5 && v <= 50000;
  });
  const estate: EstateCard[] = [];
  const usedSlugs = new Set<string>();
  const maxAttempts = 500;
  let attempts = 0;
  // Weight distribution: 2 pre-1960s gems, 4 junk wax, 5 modern, 4 current-ish (2015+)
  const weights = [
    { era: 'prewar', count: 1 },
    { era: 'vintage', count: 3 },
    { era: 'junk', count: 4 },
    { era: 'modern', count: 4 },
    { era: 'current', count: 3 },
  ];
  for (const w of weights) {
    let got = 0;
    let localAttempts = 0;
    while (got < w.count && localAttempts < 200) {
      localAttempts++;
      attempts++;
      const card = pool[Math.floor(rng() * pool.length)];
      if (!card || usedSlugs.has(card.slug)) continue;
      const era = getEra(card.year);
      if (era !== w.era) continue;
      usedSlugs.add(card.slug);
      const fmvMid = parseValue(card.estimatedValueRaw);
      // Condition: vintage tends poor, modern tends nm
      const condRand = rng();
      let condition: EstateCard['condition'];
      if (era === 'prewar' || era === 'vintage') {
        condition = condRand < 0.35 ? 'poor' : condRand < 0.75 ? 'good' : condRand < 0.95 ? 'vgex' : 'nm';
      } else if (era === 'junk') {
        condition = condRand < 0.15 ? 'poor' : condRand < 0.5 ? 'good' : condRand < 0.85 ? 'vgex' : condRand < 0.97 ? 'nm' : 'mint';
      } else {
        condition = condRand < 0.05 ? 'good' : condRand < 0.3 ? 'vgex' : condRand < 0.7 ? 'nm' : 'mint';
      }
      estate.push({
        slug: card.slug,
        name: card.name,
        year: card.year,
        sport: card.sport,
        player: card.player,
        fmvMid,
        rookie: card.rookie,
        set: card.set,
        era,
        condition,
        storyTag: STORY_TAGS[Math.floor(rng() * STORY_TAGS.length)],
      });
      got++;
    }
    if (attempts > maxAttempts) break;
  }
  // Fill to 15 if needed
  while (estate.length < 15 && attempts < maxAttempts * 2) {
    attempts++;
    const card = pool[Math.floor(rng() * pool.length)];
    if (!card || usedSlugs.has(card.slug)) continue;
    usedSlugs.add(card.slug);
    estate.push({
      slug: card.slug,
      name: card.name,
      year: card.year,
      sport: card.sport,
      player: card.player,
      fmvMid: parseValue(card.estimatedValueRaw),
      rookie: card.rookie,
      set: card.set,
      era: getEra(card.year),
      condition: 'vgex',
      storyTag: STORY_TAGS[Math.floor(rng() * STORY_TAGS.length)],
    });
  }
  return estate;
}

function conditionMultiplier(c: EstateCard['condition']): number {
  return { poor: 0.35, good: 0.55, vgex: 0.8, nm: 1.0, mint: 1.15 }[c];
}

function resultFor(card: EstateCard, action: Action): ActionResult {
  const effectiveFmv = card.fmvMid * conditionMultiplier(card.condition);
  switch (action) {
    case 'quick': {
      // 40-55% FMV, 1 day
      const rate = 0.48;
      return { cashRecovered: effectiveFmv * rate, feeRate: 1 - rate, daysToSettle: 1, label: 'Quick Sell to Dealer', color: 'rose' };
    }
    case 'online': {
      // 80% after eBay + PayPal ~13% fees = 87% gross × fill rate
      const rate = 0.72;
      return { cashRecovered: effectiveFmv * rate, feeRate: 1 - rate, daysToSettle: 45, label: 'List Online (eBay/COMC)', color: 'blue' };
    }
    case 'consign': {
      // High-end: 88% FMV for big lots, 12% seller fee ≈ 78% net; strong for rare/high value
      let rate = 0.78;
      // Consignment works best for high-value
      if (effectiveFmv >= 1000) rate = 0.83;
      if (effectiveFmv >= 10000) rate = 0.88;
      return { cashRecovered: effectiveFmv * rate, feeRate: 1 - rate, daysToSettle: 110, label: 'Consign to Auction House', color: 'emerald' };
    }
    case 'keep':
      return { cashRecovered: 0, feeRate: 0, daysToSettle: 0, label: 'Keep in Collection', color: 'amber' };
  }
}

function grade(recoveryRate: number, avgDays: number, judgmentScore: number): { letter: string; desc: string; color: string } {
  // recoveryRate: cash / totalFMV (0..1), avgDays: weighted avg, judgmentScore: 0..1 right-path ratio
  const recoveryComp = Math.max(0, Math.min(1, recoveryRate)) * 60;
  const speedComp = Math.max(0, (1 - Math.min(avgDays, 180) / 180)) * 30;
  const judgComp = judgmentScore * 10;
  const total = recoveryComp + speedComp + judgComp;
  if (total >= 90) return { letter: 'A+', desc: 'Textbook executor. Every card routed right. Professional-grade.', color: 'text-emerald-400' };
  if (total >= 82) return { letter: 'A', desc: 'Elite executor. High recovery, right paths, decent speed.', color: 'text-emerald-400' };
  if (total >= 72) return { letter: 'B', desc: 'Solid executor. Most decisions sound, some yield left on the table.', color: 'text-cyan-400' };
  if (total >= 60) return { letter: 'C', desc: 'Average executor. Rushed some big cards, over-consigned small ones.', color: 'text-yellow-400' };
  if (total >= 48) return { letter: 'D', desc: 'Below-average. Too much quick-selling. Estate left money behind.', color: 'text-orange-400' };
  return { letter: 'F', desc: 'Fire sale. Dumped everything to a dealer. Grandfather is rolling.', color: 'text-rose-400' };
}

const SPORT_COLORS: Record<string, string> = {
  baseball: 'bg-emerald-900/40 text-emerald-300 border-emerald-800/40',
  basketball: 'bg-orange-900/40 text-orange-300 border-orange-800/40',
  football: 'bg-blue-900/40 text-blue-300 border-blue-800/40',
  hockey: 'bg-cyan-900/40 text-cyan-300 border-cyan-800/40',
};

const ERA_COLORS: Record<string, string> = {
  prewar: 'text-amber-400',
  vintage: 'text-yellow-300',
  junk: 'text-gray-400',
  modern: 'text-sky-300',
  current: 'text-emerald-300',
};

export default function EstateSaleClient() {
  const [seed, setSeed] = useState<number>(0);
  const [decisions, setDecisions] = useState<Record<string, Action>>({});
  const [showResults, setShowResults] = useState(false);
  const [bestGrade, setBestGrade] = useState<string>('—');

  useEffect(() => {
    // Daily seed from today's date
    const today = new Date();
    const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    setSeed(dateSeed);
    const stored = localStorage.getItem('cv_estate_best');
    if (stored) setBestGrade(stored);
  }, []);

  const estate = useMemo(() => (seed ? buildEstate(seed) : []), [seed]);

  const totalFmv = useMemo(() => estate.reduce((s, c) => s + c.fmvMid * conditionMultiplier(c.condition), 0), [estate]);

  const onDecide = useCallback((slug: string, action: Action) => {
    setDecisions(prev => ({ ...prev, [slug]: action }));
  }, []);

  const allDecided = estate.length > 0 && estate.every(c => decisions[c.slug]);

  const summary = useMemo(() => {
    if (!allDecided) return null;
    let totalCash = 0;
    let totalDays = 0;
    let decidedCount = 0;
    let judgmentHits = 0;
    const breakdown: Record<Action, { count: number; cash: number }> = {
      quick: { count: 0, cash: 0 },
      online: { count: 0, cash: 0 },
      consign: { count: 0, cash: 0 },
      keep: { count: 0, cash: 0 },
    };
    for (const card of estate) {
      const action = decisions[card.slug];
      const r = resultFor(card, action);
      totalCash += r.cashRecovered;
      totalDays += r.daysToSettle * r.cashRecovered; // weighted by cash
      decidedCount++;
      breakdown[action].count++;
      breakdown[action].cash += r.cashRecovered;
      // Judgment scoring: right-path heuristic
      const effFmv = card.fmvMid * conditionMultiplier(card.condition);
      if (action === 'consign' && effFmv >= 500) judgmentHits++;
      else if (action === 'quick' && effFmv < 30) judgmentHits++;
      else if (action === 'online' && effFmv >= 30 && effFmv < 500) judgmentHits++;
      else if (action === 'keep' && (card.rookie || card.era === 'prewar') && effFmv < 2000) judgmentHits++;
    }
    const avgDays = totalCash > 0 ? totalDays / totalCash : 0;
    const recoveryRate = totalFmv > 0 ? totalCash / totalFmv : 0;
    const judgment = decidedCount > 0 ? judgmentHits / decidedCount : 0;
    const g = grade(recoveryRate, avgDays, judgment);
    return { totalCash, avgDays, recoveryRate, judgment, grade: g, breakdown };
  }, [decisions, estate, totalFmv, allDecided]);

  useEffect(() => {
    if (showResults && summary) {
      const gradeKey = `${summary.grade.letter} ($${summary.totalCash.toFixed(0)})`;
      const stored = localStorage.getItem('cv_estate_best');
      if (!stored) {
        localStorage.setItem('cv_estate_best', gradeKey);
        setBestGrade(gradeKey);
      } else {
        // Compare letter ranks
        const rank = (l: string) => ['F', 'D', 'C', 'B', 'A', 'A+'].indexOf(l.split(' ')[0]);
        if (rank(summary.grade.letter) > rank(stored.split(' ')[0])) {
          localStorage.setItem('cv_estate_best', gradeKey);
          setBestGrade(gradeKey);
        }
      }
    }
  }, [showResults, summary]);

  const reset = () => {
    setDecisions({});
    setShowResults(false);
    setSeed(s => s + 1);
  };

  const shareText = summary
    ? `📦 Estate Sale Executor Grade: ${summary.grade.letter}\n💰 Recovered: $${summary.totalCash.toFixed(0)} of $${totalFmv.toFixed(0)} FMV (${(summary.recoveryRate * 100).toFixed(0)}%)\n⏱️ Avg settle: ${summary.avgDays.toFixed(0)} days\n🎯 Judgment: ${(summary.judgment * 100).toFixed(0)}%\n\n${summary.grade.desc}\n\ncardvault-two.vercel.app/estate-sale`
    : '';

  if (estate.length === 0) {
    return <div className="text-gray-500 text-sm">Loading estate inventory...</div>;
  }

  if (showResults && summary) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-stone-900 via-amber-950/40 to-stone-900 border border-amber-800/40 rounded-2xl p-6 text-center">
          <div className="text-xs uppercase tracking-wider text-amber-400 font-semibold mb-2">Executor Grade</div>
          <div className={`text-7xl font-bold mb-3 ${summary.grade.color}`}>{summary.grade.letter}</div>
          <p className="text-white text-sm max-w-md mx-auto mb-4">{summary.grade.desc}</p>
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto text-left">
            <div className="bg-gray-900/60 rounded-lg p-3">
              <div className="text-[10px] uppercase tracking-wider text-gray-500">Recovered</div>
              <div className="text-xl font-bold text-emerald-300">${summary.totalCash.toFixed(0)}</div>
              <div className="text-[11px] text-gray-400">{(summary.recoveryRate * 100).toFixed(0)}% of FMV</div>
            </div>
            <div className="bg-gray-900/60 rounded-lg p-3">
              <div className="text-[10px] uppercase tracking-wider text-gray-500">Settle</div>
              <div className="text-xl font-bold text-cyan-300">{summary.avgDays.toFixed(0)}d</div>
              <div className="text-[11px] text-gray-400">weighted avg</div>
            </div>
            <div className="bg-gray-900/60 rounded-lg p-3">
              <div className="text-[10px] uppercase tracking-wider text-gray-500">Judgment</div>
              <div className="text-xl font-bold text-purple-300">{(summary.judgment * 100).toFixed(0)}%</div>
              <div className="text-[11px] text-gray-400">right-path rate</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-4">
          <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">Path Breakdown</div>
          <div className="space-y-2">
            {(['quick', 'online', 'consign', 'keep'] as Action[]).map(a => {
              const b = summary.breakdown[a];
              const label = a === 'quick' ? 'Quick Sell' : a === 'online' ? 'Online' : a === 'consign' ? 'Consignment' : 'Kept';
              const color = a === 'quick' ? 'text-rose-400' : a === 'online' ? 'text-blue-400' : a === 'consign' ? 'text-emerald-400' : 'text-amber-400';
              return (
                <div key={a} className="flex justify-between items-center text-sm">
                  <span className={color}>{label}</span>
                  <span className="text-gray-400">{b.count} cards &middot; <span className="text-white">${b.cash.toFixed(0)}</span></span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { navigator.clipboard.writeText(shareText); }}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            📋 Copy Results
          </button>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Share to X
          </a>
          <button
            onClick={reset}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            🔄 Next Estate
          </button>
        </div>

        <div className="bg-gray-900/40 border border-gray-700/40 rounded-xl p-4">
          <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">Card-by-card</div>
          <div className="space-y-2">
            {estate.map(card => {
              const a = decisions[card.slug];
              const r = resultFor(card, a);
              const effFmv = card.fmvMid * conditionMultiplier(card.condition);
              return (
                <div key={card.slug} className="flex items-center gap-3 text-xs py-1.5 border-b border-gray-800/40 last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="text-white truncate">{card.name}</div>
                    <div className="text-gray-500">FMV ~${effFmv.toFixed(0)} · {card.condition.toUpperCase()}</div>
                  </div>
                  <div className={`text-${r.color}-400 font-medium whitespace-nowrap`}>{r.label.split(' ')[0]}</div>
                  <div className="text-emerald-300 font-mono tabular-nums whitespace-nowrap w-16 text-right">
                    ${r.cashRecovered.toFixed(0)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const decidedCount = Object.keys(decisions).length;

  return (
    <div className="space-y-5">
      {/* Status bar */}
      <div className="flex flex-wrap justify-between items-center gap-2 bg-stone-900/60 border border-stone-800/40 rounded-xl px-4 py-3">
        <div className="text-sm text-gray-400">
          Progress: <span className="text-white font-semibold">{decidedCount} / {estate.length}</span> cards decided
          {' · '}Total FMV in estate: <span className="text-amber-300">${totalFmv.toFixed(0)}</span>
        </div>
        <div className="text-xs text-gray-500">Best grade: <span className="text-emerald-300">{bestGrade}</span></div>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {estate.map((card, idx) => {
          const effFmv = card.fmvMid * conditionMultiplier(card.condition);
          const activeAction = decisions[card.slug];
          return (
            <div
              key={card.slug}
              className={`bg-gray-800/40 border rounded-xl p-4 transition-colors ${
                activeAction ? 'border-gray-600/60' : 'border-gray-700/40'
              }`}
            >
              <div className="flex justify-between items-start gap-3 flex-wrap mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-white font-semibold text-sm">{card.name}</span>
                    <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded border ${SPORT_COLORS[card.sport] || 'bg-gray-900 text-gray-400'}`}>
                      {card.sport}
                    </span>
                    {card.rookie && (
                      <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-800/40">
                        RC
                      </span>
                    )}
                    <span className={`text-[10px] uppercase ${ERA_COLORS[card.era]}`}>
                      {card.era}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 italic mb-1">"{card.storyTag}"</div>
                  <div className="text-xs text-gray-400">
                    {card.condition.toUpperCase()} &middot; {CONDITION_BLURBS[card.condition]}
                  </div>
                  <div className="text-sm mt-1">
                    <span className="text-gray-500">FMV @ condition:</span>{' '}
                    <span className="text-amber-300 font-semibold">${effFmv.toFixed(0)}</span>
                  </div>
                </div>
                <div className="text-[10px] text-gray-600 font-mono whitespace-nowrap">#{String(idx + 1).padStart(2, '0')} / 15</div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                {(['quick', 'online', 'consign', 'keep'] as Action[]).map(a => {
                  const r = resultFor(card, a);
                  const isActive = activeAction === a;
                  const colorClasses: Record<string, string> = {
                    rose: isActive ? 'bg-rose-600 border-rose-500 text-white' : 'bg-rose-950/40 border-rose-900/50 text-rose-300 hover:bg-rose-900/40',
                    blue: isActive ? 'bg-blue-600 border-blue-500 text-white' : 'bg-blue-950/40 border-blue-900/50 text-blue-300 hover:bg-blue-900/40',
                    emerald: isActive ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-emerald-950/40 border-emerald-900/50 text-emerald-300 hover:bg-emerald-900/40',
                    amber: isActive ? 'bg-amber-600 border-amber-500 text-white' : 'bg-amber-950/40 border-amber-900/50 text-amber-300 hover:bg-amber-900/40',
                  };
                  const label = a === 'quick' ? 'Quick Sell' : a === 'online' ? 'List Online' : a === 'consign' ? 'Consign' : 'Keep';
                  return (
                    <button
                      key={a}
                      onClick={() => onDecide(card.slug, a)}
                      className={`border rounded-lg px-2.5 py-2 text-xs text-left transition-colors ${colorClasses[r.color]}`}
                    >
                      <div className="font-semibold mb-0.5">{label}</div>
                      {a === 'keep' ? (
                        <div className="text-[10px] opacity-80">$0 · in your collection</div>
                      ) : (
                        <div className="text-[10px] opacity-80">
                          ${r.cashRecovered.toFixed(0)} · {r.daysToSettle}d
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit */}
      <div className="sticky bottom-4 bg-stone-900/95 backdrop-blur border border-stone-700/60 rounded-xl p-4 shadow-2xl">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div className="text-sm text-gray-400">
            {allDecided ? (
              <span className="text-emerald-400 font-semibold">All cards decided — ready to settle</span>
            ) : (
              <span>Decide every card to settle the estate. {estate.length - decidedCount} remaining.</span>
            )}
          </div>
          <button
            onClick={() => setShowResults(true)}
            disabled={!allDecided}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              allDecided
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            Settle Estate &rarr;
          </button>
        </div>
      </div>

      {/* Primer */}
      <div className="bg-gray-800/30 border border-gray-700/40 rounded-xl p-4 mt-8">
        <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">The Four Paths</div>
        <div className="grid sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-rose-950/30 border border-rose-900/40 rounded-lg p-3">
            <div className="text-rose-300 font-semibold mb-0.5">Quick Sell (Dealer)</div>
            <div className="text-gray-400">~48% FMV. Cash today. Dealer needs to profit after grading + flip risk.</div>
          </div>
          <div className="bg-blue-950/30 border border-blue-900/40 rounded-lg p-3">
            <div className="text-blue-300 font-semibold mb-0.5">List Online</div>
            <div className="text-gray-400">~72% FMV after fees. 45 days to settle. Good for mid-tier cards.</div>
          </div>
          <div className="bg-emerald-950/30 border border-emerald-900/40 rounded-lg p-3">
            <div className="text-emerald-300 font-semibold mb-0.5">Consign (Auction House)</div>
            <div className="text-gray-400">78-88% FMV. 110 days. Premium tier pays best on $1K+ cards.</div>
          </div>
          <div className="bg-amber-950/30 border border-amber-900/40 rounded-lg p-3">
            <div className="text-amber-300 font-semibold mb-0.5">Keep</div>
            <div className="text-gray-400">$0 recovered, but starts your own collection. Sentimental picks only.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ─── helpers ─── */
function parseValue(est: string): number {
  const m = est.match(/\$([0-9,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) || 5 : 5;
}
function fmt(n: number): string { return `$${n.toLocaleString()}`; }

type Sport = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey';
type Style = 'balanced' | 'flipper' | 'investor' | 'completionist' | 'fan';
type Budget = 25 | 50 | 100 | 250 | 500 | 1000 | 2500 | 5000;

const BUDGETS: Budget[] = [25, 50, 100, 250, 500, 1000, 2500, 5000];
const SPORTS: { value: Sport; label: string }[] = [
  { value: 'all', label: 'All Sports' },
  { value: 'baseball', label: 'Baseball' },
  { value: 'basketball', label: 'Basketball' },
  { value: 'football', label: 'Football' },
  { value: 'hockey', label: 'Hockey' },
];
const STYLES: { value: Style; label: string; desc: string }[] = [
  { value: 'balanced', label: 'Balanced Collector', desc: 'A mix of everything — value, fun, and growth potential' },
  { value: 'flipper', label: 'Flipper / Reseller', desc: 'Cards with highest short-term profit potential' },
  { value: 'investor', label: 'Long-Term Investor', desc: 'Blue-chip cards that hold and grow value over years' },
  { value: 'completionist', label: 'Set Completionist', desc: 'Foundation pieces from key sets at affordable prices' },
  { value: 'fan', label: 'Casual Fan', desc: 'Iconic cards of the greatest players — just for fun' },
];

const SPORT_COLORS: Record<string, string> = {
  baseball: 'bg-red-500/20 text-red-400 border-red-500/30',
  basketball: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  football: 'bg-green-500/20 text-green-400 border-green-500/30',
  hockey: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

interface KitCard {
  card: (typeof sportsCards)[number];
  rawValue: number;
  reason: string;
  category: string;
}

/* ─── kit scoring ─── */
function scoreCard(card: (typeof sportsCards)[number], style: Style): number {
  const raw = parseValue(card.estimatedValueRaw);
  const gem = parseValue(card.estimatedValueGem);
  const spread = gem > 0 && raw > 0 ? gem / raw : 1;
  const isRookie = card.rookie;
  const isVintage = card.year < 1990;
  const isModern = card.year >= 2020;

  let score = 50; // base

  switch (style) {
    case 'flipper':
      // High spread = high grading ROI = good flip
      score += Math.min(spread * 8, 40);
      if (isRookie) score += 15;
      if (isModern) score += 10;
      if (raw >= 20 && raw <= 200) score += 15; // sweet spot for flipping
      break;
    case 'investor':
      // Blue chips, vintage, HOF players
      if (isVintage) score += 20;
      if (gem >= 500) score += 15;
      if (spread > 3) score += 10;
      if (!isRookie && card.year < 2015) score += 10; // established value
      if (raw >= 50) score += 10;
      break;
    case 'completionist':
      // Lower-value cards from popular sets, variety
      if (raw <= 50) score += 20;
      if (raw <= 20) score += 10;
      score += 5; // every card gets a small bonus (completionists want more cards)
      break;
    case 'fan':
      // Iconic players, name recognition
      if (gem >= 1000) score += 10; // famous players have high gem values
      if (isRookie) score += 10;
      score += Math.min(raw / 10, 15); // mid-range cards are fun to own
      break;
    case 'balanced':
    default:
      if (isRookie) score += 10;
      if (spread > 2) score += 10;
      if (raw >= 10 && raw <= 150) score += 10;
      if (isVintage) score += 5;
      if (isModern) score += 5;
      break;
  }

  return score;
}

function getCardCategory(card: (typeof sportsCards)[number], style: Style): string {
  const raw = parseValue(card.estimatedValueRaw);
  if (card.rookie) return 'Rookie Card';
  if (card.year < 1980) return 'Vintage Classic';
  if (card.year < 2000) return 'Junk Wax / 90s Era';
  if (raw >= 200) return 'Premium Pick';
  if (style === 'flipper') return 'Flip Candidate';
  if (style === 'investor') return 'Blue Chip';
  return 'Core Card';
}

function getCardReason(card: (typeof sportsCards)[number], style: Style): string {
  const raw = parseValue(card.estimatedValueRaw);
  const gem = parseValue(card.estimatedValueGem);
  const spread = gem > 0 && raw > 0 ? (gem / raw).toFixed(1) : '?';

  switch (style) {
    case 'flipper':
      if (card.rookie) return `Rookie card with ${spread}x grading multiplier — high flip potential`;
      return `${spread}x raw-to-gem spread — strong grading ROI at this price point`;
    case 'investor':
      if (card.year < 1980) return `Vintage ${card.year} — scarcity increases with every passing year`;
      if (gem >= 1000) return `Blue-chip asset — gem mint copies command ${fmt(gem)}+`;
      return `Established value with steady appreciation potential`;
    case 'completionist':
      return `Key card from ${card.set} — foundation piece for this set`;
    case 'fan':
      return `Iconic ${card.player} card — a must-have for any collection`;
    default:
      if (card.rookie) return `Rookie card — upside potential with ${spread}x grading multiplier`;
      if (card.year < 1990) return `Vintage piece from ${card.year} — adds era diversity`;
      return `Solid ${card.sport} card with good value at this price`;
  }
}

function buildKit(sport: Sport, budget: Budget, style: Style): KitCard[] {
  // Filter cards by sport and value range
  const pool = sportsCards.filter(c => {
    if (sport !== 'all' && c.sport !== sport) return false;
    const raw = parseValue(c.estimatedValueRaw);
    // Cards must be affordable within the budget (no single card > 60% of budget)
    return raw >= 3 && raw <= budget * 0.6;
  });

  if (pool.length === 0) return [];

  // Score and sort
  const scored = pool.map(c => ({
    card: c,
    rawValue: parseValue(c.estimatedValueRaw),
    score: scoreCard(c, style),
    reason: getCardReason(c, style),
    category: getCardCategory(c, style),
  })).sort((a, b) => b.score - a.score);

  // Greedy knapsack: pick top-scoring cards that fit the budget
  // Ensure player diversity (max 1 card per player)
  const kit: KitCard[] = [];
  let spent = 0;
  const usedPlayers = new Set<string>();
  const usedSports = new Set<string>();

  for (const item of scored) {
    if (kit.length >= 15) break; // max 15 cards per kit
    if (spent + item.rawValue > budget) continue;
    if (usedPlayers.has(item.card.player)) continue;

    // For "all sports" mode, try to maintain sport balance
    if (sport === 'all' && kit.length >= 4) {
      const sportCount = kit.filter(k => k.card.sport === item.card.sport).length;
      if (sportCount >= Math.ceil(kit.length / 2)) continue; // don't let one sport dominate
    }

    kit.push({
      card: item.card,
      rawValue: item.rawValue,
      reason: item.reason,
      category: item.category,
    });
    spent += item.rawValue;
    usedPlayers.add(item.card.player);
    usedSports.add(item.card.sport);
  }

  return kit;
}

/* ─── component ─── */
export default function StarterKitClient() {
  const [sport, setSport] = useState<Sport>('all');
  const [budget, setBudget] = useState<Budget>(100);
  const [style, setStyle] = useState<Style>('balanced');
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  const kit = useMemo(() => {
    if (!generated) return [];
    return buildKit(sport, budget, style);
  }, [sport, budget, style, generated]);

  const totalValue = kit.reduce((s, k) => s + k.rawValue, 0);
  const totalGem = kit.reduce((s, k) => s + parseValue(k.card.estimatedValueGem), 0);
  const sportBreakdown = kit.reduce((acc, k) => {
    acc[k.card.sport] = (acc[k.card.sport] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const rookieCount = kit.filter(k => k.card.rookie).length;
  const vintageCount = kit.filter(k => k.card.year < 1990).length;

  function handleGenerate() {
    setGenerated(false);
    // Force re-render with new params
    setTimeout(() => setGenerated(true), 0);
  }

  function handleShare() {
    const lines = kit.map((k, i) => `${i + 1}. ${k.card.name} (${fmt(k.rawValue)} raw)`);
    const text = `My CardVault Starter Kit (${fmt(budget)} ${STYLES.find(s => s.value === style)?.label})\n\n${lines.join('\n')}\n\nTotal: ${fmt(totalValue)} | Cards: ${kit.length}\n\nBuild yours: https://cardvault-two.vercel.app/tools/starter-kit`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleShareX() {
    const text = `Just built my ${fmt(budget)} card collecting starter kit on @CardVault!\n\n${kit.length} cards, ${fmt(totalValue)} total value, ${rookieCount} rookies\n\nBuild yours free:`;
    const url = 'https://cardvault-two.vercel.app/tools/starter-kit';
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  }

  return (
    <div className="space-y-8">
      {/* Configuration */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 space-y-6">
        <h2 className="text-lg font-semibold text-white">Build Your Kit</h2>

        {/* Sport */}
        <div>
          <label className="text-sm text-gray-400 mb-2 block">Sport</label>
          <div className="flex flex-wrap gap-2">
            {SPORTS.map(s => (
              <button
                key={s.value}
                onClick={() => { setSport(s.value); setGenerated(false); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sport === s.value
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div>
          <label className="text-sm text-gray-400 mb-2 block">Total Budget</label>
          <div className="flex flex-wrap gap-2">
            {BUDGETS.map(b => (
              <button
                key={b}
                onClick={() => { setBudget(b); setGenerated(false); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  budget === b
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {fmt(b)}
              </button>
            ))}
          </div>
        </div>

        {/* Style */}
        <div>
          <label className="text-sm text-gray-400 mb-2 block">Collector Style</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {STYLES.map(s => (
              <button
                key={s.value}
                onClick={() => { setStyle(s.value); setGenerated(false); }}
                className={`p-3 rounded-lg text-left transition-colors border ${
                  style === s.value
                    ? 'bg-amber-600/20 border-amber-500/50 text-white'
                    : 'bg-gray-700/30 border-gray-700 text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                <div className="text-sm font-medium">{s.label}</div>
                <div className="text-xs text-gray-400 mt-1">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          className="w-full sm:w-auto px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-colors text-lg"
        >
          Generate My Starter Kit
        </button>
      </div>

      {/* Results */}
      {generated && kit.length > 0 && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-gradient-to-r from-amber-950/40 to-gray-800/40 border border-amber-800/30 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Your {fmt(budget)} {STYLES.find(s => s.value === style)?.label} Kit
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold text-amber-400">{kit.length}</div>
                <div className="text-xs text-gray-400">Cards</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">{fmt(totalValue)}</div>
                <div className="text-xs text-gray-400">Total Raw Value</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">{fmt(totalGem)}</div>
                <div className="text-xs text-gray-400">If All Gem Mint</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">
                  {totalGem > 0 && totalValue > 0 ? `${(totalGem / totalValue).toFixed(1)}x` : '—'}
                </div>
                <div className="text-xs text-gray-400">Grading Upside</div>
              </div>
            </div>

            {/* Sport breakdown */}
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(sportBreakdown).map(([s, count]) => (
                <span key={s} className={`text-xs px-2 py-1 rounded-full border ${SPORT_COLORS[s] || 'text-gray-400'}`}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}: {count}
                </span>
              ))}
              {rookieCount > 0 && (
                <span className="text-xs px-2 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/20 text-yellow-400">
                  Rookies: {rookieCount}
                </span>
              )}
              {vintageCount > 0 && (
                <span className="text-xs px-2 py-1 rounded-full border border-amber-500/30 bg-amber-500/20 text-amber-400">
                  Vintage: {vintageCount}
                </span>
              )}
            </div>

            {/* Budget bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Budget Used</span>
                <span>{fmt(totalValue)} / {fmt(budget)} ({Math.round(totalValue / budget * 100)}%)</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (totalValue / budget) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card list */}
          <div className="space-y-3">
            {kit.map((k, i) => (
              <div key={k.card.slug} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-gray-600 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/sports/${k.card.slug}`}
                          className="text-white font-medium hover:text-amber-400 transition-colors"
                        >
                          {k.card.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${SPORT_COLORS[k.card.sport] || 'text-gray-400'}`}>
                            {k.card.sport}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full border border-gray-600 text-gray-400">
                            {k.category}
                          </span>
                          {k.card.rookie && (
                            <span className="text-xs px-2 py-0.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400">
                              RC
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-green-400 font-bold">{fmt(k.rawValue)}</div>
                        <div className="text-xs text-gray-500">raw</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">{k.reason}</p>
                    <div className="flex gap-2 mt-2">
                      <a
                        href={k.card.ebaySearchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Buy on eBay &rarr;
                      </a>
                      <Link
                        href={`/sports/${k.card.slug}`}
                        className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        Card Details &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Share */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleShare}
              className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm font-medium transition-colors"
            >
              {copied ? 'Copied!' : 'Copy Kit List'}
            </button>
            <button
              onClick={handleShareX}
              className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-medium transition-colors border border-gray-600"
            >
              Share to X
            </button>
          </div>

          {/* Tips */}
          <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-3">Buying Tips for Your Kit</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex gap-2">
                <span className="text-amber-400 flex-shrink-0">1.</span>
                <span>Check eBay &ldquo;Sold&rdquo; listings to verify current market prices before buying.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400 flex-shrink-0">2.</span>
                <span>Buy raw cards from reputable sellers with clear photos of all four corners.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400 flex-shrink-0">3.</span>
                <span>Start with the highest-value card first — prices fluctuate and you want to lock in your anchor piece.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400 flex-shrink-0">4.</span>
                <span>Consider grading cards with high raw-to-gem spreads — that&rsquo;s where the biggest value jumps are.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400 flex-shrink-0">5.</span>
                <span>Don&rsquo;t blow your entire budget at once. Save 10-20% for deals that pop up later.</span>
              </li>
            </ul>
          </div>

          {/* Related tools */}
          <div className="border-t border-gray-800 pt-6">
            <h3 className="text-white font-semibold mb-3">Next Steps</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { href: '/tools/grading-roi', label: 'Grading ROI', desc: 'Should you grade these cards?' },
                { href: '/tools/flip-calc', label: 'Flip Calculator', desc: 'Calculate your profit potential' },
                { href: '/tools/storage-calc', label: 'Storage Supplies', desc: 'Protect your new collection' },
                { href: '/tools/insurance-calc', label: 'Insurance Calc', desc: 'Insure your collection' },
                { href: '/tools/card-scout', label: 'Card Scout', desc: 'Find more recommendations' },
                { href: '/tools/budget-planner', label: 'Budget Planner', desc: 'Plan your monthly spend' },
              ].map(l => (
                <Link key={l.href} href={l.href} className="p-3 bg-gray-800/40 hover:bg-gray-800/70 border border-gray-700 rounded-lg transition-colors group">
                  <div className="text-white text-sm font-medium group-hover:text-amber-400 transition-colors">{l.label}</div>
                  <div className="text-gray-500 text-xs">{l.desc}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {generated && kit.length === 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 text-center">
          <p className="text-gray-400">No cards found matching your criteria. Try increasing your budget or selecting &ldquo;All Sports.&rdquo;</p>
        </div>
      )}
    </div>
  );
}

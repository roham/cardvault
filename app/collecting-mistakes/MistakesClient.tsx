'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';

interface Mistake {
  id: number;
  title: string;
  impact: number; // 1-10 financial impact
  category: 'buying' | 'selling' | 'storage' | 'grading' | 'strategy';
  description: string;
  example: string;
  fix: string;
  icon: string;
}

const MISTAKES: Mistake[] = [
  { id: 1, title: 'Buying at Peak Hype', impact: 9, category: 'buying', icon: '📈', description: 'Purchasing cards immediately after a draft pick, championship win, or viral moment when prices are at their absolute highest.', example: 'Buying a Zion Williamson Prizm RC for $1,800 on draft night 2019 — now worth $200-$400.', fix: 'Wait 2-4 weeks after any major event. The initial hype fades and prices typically drop 30-50%. Set price alerts on eBay and buy when the frenzy cools.' },
  { id: 2, title: 'Neglecting Card Storage', impact: 9, category: 'storage', icon: '☀️', description: 'Storing cards in direct sunlight, high humidity, or without proper protection — causing fading, warping, or mold damage over years.', example: 'A 1986 Fleer Jordan stored in an attic for 20 years — yellowed, warped, and downgraded from potential PSA 8 to PSA 4. Lost $5,000+ in value.', fix: 'Penny sleeves + toploaders for raw cards, store in a cool dark place (65-72°F, 40-50% humidity). One-touch magnetic holders for premium cards.' },
  { id: 3, title: 'Paying Graded Prices for Raw Cards', impact: 8, category: 'buying', icon: '💸', description: 'Paying what a PSA 10 is worth for an ungraded card, assuming it will grade gem mint.', example: 'Paying $150 for a raw 2022 Topps Chrome card because PSA 10s sell for $200 — then it grades PSA 8 and is worth $30.', fix: 'Always price raw cards at the PSA 7-8 value, not PSA 10. Only 10-20% of modern cards grade PSA 10. Use our Grading ROI Calculator to check before buying.' },
  { id: 4, title: 'Chasing Short Prints Blindly', impact: 7, category: 'buying', icon: '🎰', description: 'Overpaying for cards labeled "SP" or "SSP" without checking actual print runs or sales volume.', example: 'Paying $50 for a "short print" base variation that has 5,000+ copies — short relative to the set, but not actually scarce.', fix: 'Check eBay sold listings for the specific card. If there are 50+ sold in the last month, it is not truly scarce. Look at the price trend, not just the label.' },
  { id: 5, title: 'Selling During Market Panics', impact: 8, category: 'selling', icon: '😱', description: 'Panic-selling cards when the market dips due to news, offseason, or economic fears — locking in losses at the worst time.', example: 'Selling a Wembanyama RC during a 2024 market correction for $100, only to see it recover to $300+ within months.', fix: 'Quality cards always recover from temporary dips. If the player is still elite, hold through the panic. Only sell if the fundamentals changed (career-ending injury, scandal).' },
  { id: 6, title: 'Ignoring eBay Fees', impact: 6, category: 'selling', icon: '🧾', description: 'Listing a card without factoring in eBay\'s 13% final value fee + PayPal/payment processing fees + shipping costs.', example: 'Selling a card for $50 and expecting $50 profit — but after 13% eBay fee ($6.50), shipping ($4), and supplies ($1), the actual profit is $38.50.', fix: 'Use our Flip Profit Calculator before listing. Always calculate net profit after ALL fees. Consider selling on lower-fee platforms for cards under $20.' },
  { id: 7, title: 'Submitting Everything for Grading', impact: 7, category: 'grading', icon: '📦', description: 'Sending every card to PSA/BGS regardless of value or condition, spending $30+ per card on submissions worth $10 raw.', example: 'Submitting 50 base Topps cards at $30 each ($1,500 total) — getting mostly PSA 8-9s worth $3-$5 each. Net loss: $1,350.', fix: 'Only grade cards where PSA 10 value exceeds 3x the raw value plus grading cost. Our Grading ROI Calculator shows exactly which cards are worth submitting.' },
  { id: 8, title: 'Not Checking Comps Before Buying', impact: 6, category: 'buying', icon: '🔍', description: 'Buying cards based on listing price rather than recently sold prices — paying 2-3x actual market value.', example: 'Buying a card listed at $75 "Buy It Now" when the last 10 sold listings averaged $35. The seller was just testing a high price.', fix: 'ALWAYS check "Sold" listings on eBay (filter by Sold Items). The asking price is irrelevant — only sold prices matter. Use CardVault price guides as a starting point.' },
  { id: 9, title: 'Buying Reprint/Counterfeit Cards', impact: 8, category: 'buying', icon: '🚫', description: 'Purchasing fake cards, reprints, or trimmed cards without knowing how to authenticate them.', example: 'Buying a "1952 Topps Mickey Mantle" for $500 that turns out to be a $2 reprint. Common on Facebook Marketplace and at flea markets.', fix: 'Learn the authentication basics: card stock thickness, print dot patterns, corner sharpness. For high-value cards ($500+), only buy graded or from reputable dealers.' },
  { id: 10, title: 'Overconcentrating in One Player', impact: 7, category: 'strategy', icon: '🎯', description: 'Putting 50%+ of your card budget into one player — a single injury or decline wipes out your portfolio.', example: 'Investing $5,000 in Ja Morant cards before his off-court issues caused a 60% market decline. Portfolio dropped to $2,000.', fix: 'Diversify across at least 3-4 players, multiple sports, and a mix of rookies + veterans. No single player should exceed 20-25% of your collection value.' },
  { id: 11, title: 'Handling Cards Without Clean Hands', impact: 5, category: 'storage', icon: '🤲', description: 'Touching raw cards with oily or dirty hands, leaving fingerprints that show under grading light and cause grade dings.', example: 'A PSA submission returned as PSA 8 due to "surface contamination" — fingerprint oils that were invisible to the naked eye but visible under UV.', fix: 'Always handle raw cards by the edges or use clean cotton gloves. Wash and dry hands thoroughly before handling any cards you plan to grade.' },
  { id: 12, title: 'FOMO Buying from Breakers', impact: 6, category: 'buying', icon: '📺', description: 'Buying into breaks at inflated prices because the streamer just pulled a big hit and the chat is going crazy.', example: 'Buying a $200 spot in a break after seeing a $5,000 hit pulled — your spot yields $15 worth of base cards. The house always wins over time.', fix: 'Track your break spending vs. value received over 10+ breaks. Most breakers have a 30-50% loss rate for participants. Buy singles instead — the math almost always favors singles.' },
  { id: 13, title: 'Ignoring Centering on Raw Cards', impact: 5, category: 'grading', icon: '↔️', description: 'Buying raw cards for grading without checking centering — the #1 reason modern cards miss PSA 10.', example: 'Buying 10 raw cards at $15 each ($150 total) for grading — 8 of them are 55/45 or worse centered, capping them at PSA 9 max.', fix: 'Use our Centering Checker tool before buying. Learn to eye-check centering: hold the card at arm\'s length and look for equal borders. Only buy cards that appear dead-center.' },
  { id: 14, title: 'Not Insuring High-Value Collections', impact: 8, category: 'storage', icon: '🔥', description: 'Keeping $10,000+ in cards at home without specific collectibles insurance — homeowner\'s policies cap at $1,000-$2,500 for collectibles.', example: 'A house fire destroying an uninsured $25,000 collection. Standard homeowner\'s insurance paid out only $1,500. Net loss: $23,500.', fix: 'Get collectibles insurance from CollectInsure or Hugh Wood for collections over $5,000. Costs roughly $10-$15 per $1,000 of coverage annually. Use our Insurance Estimator.' },
  { id: 15, title: 'Buying Wax Instead of Singles', impact: 6, category: 'buying', icon: '📦', description: 'Ripping boxes hoping to pull specific cards instead of just buying the cards you want as singles.', example: 'Buying 3 hobby boxes of Topps Chrome ($600 total) hoping for a specific rookie auto — pulled $150 worth of cards. The auto itself sells for $80 as a single.', fix: 'Use our Wax vs Singles Calculator. For 90%+ of products, buying singles is more cost-effective. Only rip wax for the entertainment value, not as an investment strategy.' },
  { id: 16, title: 'Listing Cards with Bad Photos', impact: 4, category: 'selling', icon: '📸', description: 'Taking blurry, poorly-lit photos of cards for sale — buyers assume the worst and bid lower or skip entirely.', example: 'A PSA 9 card selling for $30 below market because the listing photo was dark and blurry, making buyers suspicious of the condition.', fix: 'Use natural light or a ring light. Place card on a dark background. Take photos of front, back, and all four corners. Show the PSA label clearly for graded cards.' },
  { id: 17, title: 'Ignoring Card Population Reports', impact: 5, category: 'strategy', icon: '📊', description: 'Not checking how many copies exist at each grade before buying — a PSA 10 with 50,000 copies is not rare.', example: 'Paying a "PSA 10 premium" for a 2021 Topps Chrome base card with 45,000 PSA 10s in the population — the scarcity is an illusion.', fix: 'Check PSA\'s Pop Report before buying any graded card. If there are 1,000+ PSA 10s, the grading premium is minimal. Our Pop Report Lookup tool makes this easy.' },
  { id: 18, title: 'Selling Before Key Career Milestones', impact: 7, category: 'selling', icon: '⏰', description: 'Selling a player\'s cards right before they hit a major milestone (3,000 hits, MVP, HOF induction) that would spike demand.', example: 'Selling all Albert Pujols cards in 2021 for $50 each — then he hit 700 home runs in 2022 and prices doubled overnight.', fix: 'Track career milestones with our Player Milestone Tracker. If a player is within striking distance of a major milestone, hold until after the achievement and initial price spike.' },
  { id: 19, title: 'Buying Junk Wax as Investment', impact: 5, category: 'buying', icon: '🗑️', description: 'Buying 1987-1993 baseball cards thinking they\'re valuable because they\'re old — but millions of copies were printed.', example: 'Paying $200 for a "complete 1989 Upper Deck set" because it contains the Griffey RC — individual Griffey RCs sell for $15-$30 raw.', fix: 'Learn about print runs by era. 1987-1993 is the "junk wax" era with massive overproduction. Use our History Timeline to understand which eras have actual scarcity.' },
  { id: 20, title: 'Not Tracking Purchases and Sales', impact: 4, category: 'strategy', icon: '📝', description: 'Failing to log what you paid for cards and what you sold them for — making tax reporting impossible and hiding actual P&L.', example: 'Selling $5,000 worth of cards on eBay without tracking the cost basis — owing taxes on the full $5,000 instead of just the $1,200 profit.', fix: 'Use a spreadsheet, our Flip Tracker, or the Vault to log every purchase with date and cost. Come tax time, you\'ll know your actual profit. Cards sold for gain are taxable at 28% (collectibles rate).' },
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  buying: { bg: 'bg-red-900/30', text: 'text-red-400', label: 'Buying' },
  selling: { bg: 'bg-amber-900/30', text: 'text-amber-400', label: 'Selling' },
  storage: { bg: 'bg-blue-900/30', text: 'text-blue-400', label: 'Storage' },
  grading: { bg: 'bg-purple-900/30', text: 'text-purple-400', label: 'Grading' },
  strategy: { bg: 'bg-green-900/30', text: 'text-green-400', label: 'Strategy' },
};

const STORAGE_KEY = 'cardvault-mistakes-checked';

export default function MistakesClient() {
  const [mounted, setMounted] = useState(false);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<string>('all');
  const [sort, setSort] = useState<'impact' | 'id'>('impact');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setChecked(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...checked]));
    } catch {}
  }, [mounted, checked]);

  const toggleCheck = useCallback((id: number) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const healthScore = useMemo(() => {
    let score = 100;
    for (const m of MISTAKES) {
      if (checked.has(m.id)) score -= m.impact * 1.5;
    }
    return Math.max(0, Math.round(score));
  }, [checked]);

  const grade = healthScore >= 90 ? { label: 'Elite Collector', color: 'text-green-400', emoji: '🏆' }
    : healthScore >= 75 ? { label: 'Solid Collector', color: 'text-blue-400', emoji: '👍' }
    : healthScore >= 60 ? { label: 'Learning Collector', color: 'text-amber-400', emoji: '📚' }
    : { label: 'Needs Improvement', color: 'text-red-400', emoji: '⚠️' };

  const filtered = useMemo(() => {
    let list = [...MISTAKES];
    if (filter !== 'all') list = list.filter(m => m.category === filter);
    if (sort === 'impact') list.sort((a, b) => b.impact - a.impact);
    return list;
  }, [filter, sort]);

  const shareScore = useCallback(() => {
    const text = `My Card Collecting Health Score: ${healthScore}/100 ${grade.emoji}\n${checked.size} of 20 mistakes made\nGrade: ${grade.label}\n\nhttps://cardvault-two.vercel.app/collecting-mistakes`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [healthScore, grade, checked]);

  if (!mounted) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  return (
    <div className="mt-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">20 Collecting Mistakes</h1>
        <p className="text-gray-400">That Cost Collectors Thousands — Check Yours</p>
      </div>

      {/* Health Score */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 mb-8 text-center">
        <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">Collector Health Score</div>
        <div className={`text-5xl font-bold ${grade.color} mb-1`}>{healthScore}</div>
        <div className="text-sm text-gray-400 mb-1">{grade.emoji} {grade.label}</div>
        <div className="text-xs text-gray-500">{checked.size} of 20 mistakes checked</div>

        <div className="w-full bg-gray-700 rounded-full h-3 mt-4 max-w-xs mx-auto">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${healthScore >= 75 ? 'bg-green-500' : healthScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
            style={{ width: `${healthScore}%` }}
          />
        </div>

        <button
          onClick={shareScore}
          className="mt-4 px-4 py-1.5 rounded-lg text-xs bg-gray-700 text-gray-300 hover:text-white transition-colors"
        >
          {copied ? 'Copied!' : 'Share Score'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'All' },
            { value: 'buying', label: 'Buying' },
            { value: 'selling', label: 'Selling' },
            { value: 'storage', label: 'Storage' },
            { value: 'grading', label: 'Grading' },
            { value: 'strategy', label: 'Strategy' },
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                ${filter === f.value ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setSort(s => s === 'impact' ? 'id' : 'impact')}
          className="text-xs text-gray-500 hover:text-gray-300"
        >
          Sort: {sort === 'impact' ? 'Impact' : 'Order'}
        </button>
      </div>

      {/* Mistakes list */}
      <div className="space-y-4">
        {filtered.map(m => {
          const isChecked = checked.has(m.id);
          const cat = CATEGORY_COLORS[m.category];
          return (
            <div
              key={m.id}
              className={`border rounded-xl p-4 transition-all ${isChecked ? 'bg-red-950/20 border-red-800/40' : 'bg-gray-900/60 border-gray-800'}`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleCheck(m.id)}
                  className={`mt-1 w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors
                    ${isChecked ? 'bg-red-600 border-red-600 text-white' : 'border-gray-600 text-transparent hover:border-gray-400'}`}
                >
                  {isChecked && '✓'}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{m.icon}</span>
                    <h3 className={`text-sm font-bold ${isChecked ? 'text-red-300 line-through' : 'text-white'}`}>
                      #{m.id}. {m.title}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${cat.bg} ${cat.text}`}>{cat.label}</span>
                  </div>

                  {/* Impact bar */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] text-gray-500 w-12">Impact:</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-2 rounded-sm ${i < m.impact ? 'bg-red-500' : 'bg-gray-800'}`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-500">{m.impact}/10</span>
                  </div>

                  <p className="text-sm text-gray-400 mb-2">{m.description}</p>

                  <details className="group">
                    <summary className="text-xs text-amber-400 cursor-pointer hover:text-amber-300">Example + Fix</summary>
                    <div className="mt-2 space-y-2 text-xs">
                      <div className="bg-red-950/20 border border-red-900/30 rounded-lg p-2">
                        <span className="text-red-400 font-medium">Example: </span>
                        <span className="text-gray-400">{m.example}</span>
                      </div>
                      <div className="bg-green-950/20 border border-green-900/30 rounded-lg p-2">
                        <span className="text-green-400 font-medium">Fix: </span>
                        <span className="text-gray-400">{m.fix}</span>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Related links */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-lg font-bold text-white mb-3">Fix Your Mistakes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { href: '/tools/grading-roi', label: 'Grading ROI Calculator', desc: 'Should you grade? Math-based answer' },
            { href: '/tools/flip-profit', label: 'Flip Profit Calculator', desc: 'Calculate profit after all fees' },
            { href: '/tools/wax-vs-singles', label: 'Wax vs Singles Calculator', desc: 'Should you rip or buy singles?' },
            { href: '/vault/insurance', label: 'Insurance Estimator', desc: 'Protect your collection' },
            { href: '/vault/appraisal', label: 'Card Appraisal', desc: 'Get instant card valuations' },
            { href: '/tools/centering-calc', label: 'Centering Checker', desc: 'Check centering before grading' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="block p-3 rounded-lg bg-gray-900/60 border border-gray-800 hover:border-gray-600 transition-colors">
              <div className="text-sm font-medium text-white">{l.label}</div>
              <div className="text-xs text-gray-400">{l.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

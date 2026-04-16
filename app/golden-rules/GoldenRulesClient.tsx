'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';

interface Rule {
  id: number;
  title: string;
  shortName: string;
  category: 'buying' | 'selling' | 'grading' | 'investing' | 'protecting';
  description: string;
  example: string;
  toolLink?: { href: string; label: string };
  icon: string;
}

const RULES: Rule[] = [
  { id: 1, title: 'The 3x Grading Rule', shortName: '3x Rule', category: 'grading', icon: '3', description: 'Only submit a card for grading if the PSA 10 value is at least 3x the raw value plus grading fees. If raw is $20 and PSA 10 is $50 with a $30 grading fee, you lose money even with a gem mint.', example: 'A 2024 Topps Chrome base rookie worth $5 raw and $18 PSA 10 — grading costs $30. Net loss of $17 even with a PSA 10. Skip it.', toolLink: { href: '/tools/grading-roi', label: 'Grading ROI Calculator' } },
  { id: 2, title: 'The 90-Day Hype Rule', shortName: '90-Day Rule', category: 'buying', icon: '90', description: 'Wait at least 90 days after any major event (draft, championship, viral moment) before buying a player\'s cards. Prices drop 30-60% from the initial hype peak as the market digests the news.', example: 'Zion Williamson Prizm RC: $1,800 on draft night 2019, $350 three months later. Patience saved $1,450 per card.', toolLink: { href: '/tools/flip-window', label: 'Flip Window Calculator' } },
  { id: 3, title: 'The 20% Concentration Limit', shortName: '20% Cap', category: 'investing', icon: '%', description: 'Never put more than 20% of your total collection value into one player. A single injury, scandal, or decline can wipe out half your portfolio overnight if you are over-concentrated.', example: 'Putting $5,000 into Ja Morant cards before his off-court issues — collection dropped 60% overnight. Diversified collectors lost 12%.', toolLink: { href: '/tools/portfolio-rebalancer', label: 'Portfolio Rebalancer' } },
  { id: 4, title: 'The Sold Listings Rule', shortName: 'Sold Only', category: 'buying', icon: '$', description: 'Never buy based on asking price. Always check eBay "Sold Items" first. The asking price is aspirational — the sold price is reality. Cards are routinely listed at 2-3x actual market value.', example: 'A card listed at $75 "Buy It Now" but the last 10 sold listings averaged $32. You just saved $43 by checking comps first.', toolLink: { href: '/tools/dealer-scanner', label: 'Dealer Scanner' } },
  { id: 5, title: 'The Singles Math Rule', shortName: 'Buy Singles', category: 'buying', icon: '1', description: 'If you want a specific card, buy the single. Ripping boxes has a negative expected value 90%+ of the time. The thrill of the rip is entertainment, not investment strategy.', example: 'Buying 3 hobby boxes of Topps Chrome ($600) hoping for one specific auto that sells for $80 as a single. The math never works.', toolLink: { href: '/tools/wax-vs-singles', label: 'Wax vs Singles Calculator' } },
  { id: 6, title: 'The Centering Check Rule', shortName: 'Check Center', category: 'grading', icon: 'C', description: 'Always check centering before buying a card for grading. Centering is the #1 reason modern cards miss PSA 10. Hold the card at arm\'s length — if the borders don\'t look equal, they aren\'t.', example: '8 out of 10 raw cards pulled from packs are 55/45 or worse — automatically capping them at PSA 9 max. Save $240 in grading fees.', toolLink: { href: '/tools/centering-calc', label: 'Centering Checker' } },
  { id: 7, title: 'The Penny Sleeve First Rule', shortName: 'Sleeve First', category: 'protecting', icon: 'S', description: 'Every card goes into a penny sleeve before a toploader. Every time. No exceptions. Naked cards in toploaders get scratched, and that scratch costs you 2+ PSA grades on the surface score.', example: 'A PSA 10 candidate dropped to PSA 8 due to toploader scratches on the surface — a $200 difference on a $50 card.', toolLink: { href: '/tools/condition-grader', label: 'Condition Grader' } },
  { id: 8, title: 'The 65°F Storage Rule', shortName: '65°F Rule', category: 'protecting', icon: 'T', description: 'Store cards at 65-72°F with 40-50% humidity. Attics and garages destroy cards through heat warping, UV fading, and moisture damage. A climate-controlled room or closet is the minimum.', example: 'A 1986 Fleer Jordan stored in an attic for 20 years: yellowed, warped, PSA 4 instead of PSA 8. Lost $5,000+ in value.', toolLink: { href: '/tools/insurance-calc', label: 'Insurance Calculator' } },
  { id: 9, title: 'The Fee Calculator Rule', shortName: 'Know Fees', category: 'selling', icon: 'F', description: 'Always calculate ALL fees before listing. eBay takes 13.25%, PayPal/payments 2.9%, shipping costs $3-5, supplies $1. Your $50 sale nets $38. Price accordingly or sell elsewhere.', example: 'Selling a $30 card on eBay: $3.97 FVF + $0.87 payment + $4 shipping + $0.50 supplies = $20.66 net. That is a 31% haircut.', toolLink: { href: '/tools/flip-calc', label: 'Flip Profit Calculator' } },
  { id: 10, title: 'The Pop Report Rule', shortName: 'Check Pop', category: 'investing', icon: 'P', description: 'Check the PSA Population Report before buying any graded card. A PSA 10 with 45,000 copies is not rare — the grading premium is an illusion. True scarcity starts under 500 PSA 10s for modern cards.', example: '2021 Topps Chrome base has 42,000+ PSA 10s. The $15 premium over raw ($3) is just the slab fee, not rarity. Save your money.', toolLink: { href: '/tools/pop-report', label: 'Pop Report Lookup' } },
  { id: 11, title: 'The Milestone Watch Rule', shortName: 'Hold for Milestones', category: 'selling', icon: 'M', description: 'Never sell a player\'s cards within 6 months of a major career milestone (3,000 hits, 500 HR, HOF induction, MVP). The milestone spike can be 50-200% above pre-milestone prices.', example: 'Selling Albert Pujols cards at $50 in 2021, then watching them hit $120+ when he reached 700 HR in 2022.', toolLink: { href: '/tools/milestone-tracker', label: 'Milestone Tracker' } },
  { id: 12, title: 'The Seasonal Buy Rule', shortName: 'Buy Offseason', category: 'buying', icon: 'B', description: 'Buy baseball cards in winter, football in spring, basketball in fall, and hockey in summer. Every sport hits its lowest prices during the offseason when demand drops.', example: 'A Shohei Ohtani Topps Chrome RC: $80 in February (offseason), $130 in August (pennant race). Same card, same condition, 60% swing.', toolLink: { href: '/tools/flip-window', label: 'Flip Window Calculator' } },
  { id: 13, title: 'The Auction End Time Rule', shortName: 'End Sunday Night', category: 'selling', icon: 'A', description: 'End eBay auctions on Sunday between 7-9 PM EST. This is when the most collectors are browsing — more eyeballs means more bids. Tuesday afternoon auctions get 15-20% less.', example: 'The same card listed twice: Tuesday 2 PM auction sold for $42, Sunday 8 PM auction sold for $56. Time it right.', toolLink: { href: '/tools/flip-calc', label: 'Flip Profit Calculator' } },
  { id: 14, title: 'The $5,000 Insurance Rule', shortName: 'Insure $5K+', category: 'protecting', icon: 'I', description: 'Insure any collection worth $5,000+. Standard homeowner\'s insurance caps collectibles at $1,000-$2,500. Specialized collectibles insurance costs roughly $10-15 per $1,000 annually.', example: 'A house fire destroyed a $25,000 uninsured collection. Homeowner\'s paid $1,500. CollectInsure would have cost $300/year for full coverage.', toolLink: { href: '/tools/insurance-calc', label: 'Insurance Calculator' } },
  { id: 15, title: 'The 3-Sport Diversification Rule', shortName: '3+ Sports', category: 'investing', icon: 'D', description: 'Collect across at least 3 sports. Each sport has different seasonal cycles, different risk profiles, and different buyer pools. Multi-sport collectors weather downturns better.', example: 'When football cards dipped in 2023, baseball cards surged. Three-sport collectors were flat while single-sport holders lost 20%+.', toolLink: { href: '/tools/portfolio-rebalancer', label: 'Portfolio Rebalancer' } },
  { id: 16, title: 'The Clean Hands Rule', shortName: 'Clean Hands', category: 'protecting', icon: 'H', description: 'Wash and dry your hands before handling raw cards, or use clean cotton gloves. Fingerprint oils are invisible to the eye but glow under grading light — costing 1-2 grades on surface.', example: 'A "flawless" card returned as PSA 8 with "surface contamination" — fingerprints that only showed under UV during grading.', toolLink: { href: '/tools/condition-grader', label: 'Condition Grader' } },
  { id: 17, title: 'The Break Math Rule', shortName: 'Track Breaks', category: 'buying', icon: 'X', description: 'Track every dollar you spend on breaks vs. value received. Over 10+ breaks, most participants see a 30-50% loss rate. The house always wins. Buy singles unless you genuinely enjoy the entertainment.', example: 'Tracking 15 breaks at $100 each ($1,500 total) yielded $680 in card value. 55% loss rate. The same $1,500 in singles would be worth $1,500.', toolLink: { href: '/tools/box-break', label: 'Box Break Calculator' } },
  { id: 18, title: 'The Rookie Premium Rule', shortName: 'RC Premium', category: 'investing', icon: 'R', description: 'Rookie cards command 2-10x the price of second-year cards of the same player. Always buy the rookie card if investing. The designation "RC" on the card matters more than the player\'s actual rookie season.', example: 'Luka Doncic 2018 Prizm RC (PSA 10): $4,000. His 2019 Prizm (year 2): $40. The RC premium is 100x and grows over time.', toolLink: { href: '/tools/rookie-finder', label: 'Rookie Card Finder' } },
  { id: 19, title: 'The Photo Quality Rule', shortName: 'Good Photos', category: 'selling', icon: 'L', description: 'Photograph cards with natural light or a ring light on a dark background. Show front, back, and all four corners for raw cards. Show the slab label for graded cards. Bad photos cost 15-25% on sale price.', example: 'A PSA 9 card sold for $30 below market because the listing photo was dark and blurry — buyers assumed the worst and avoided it.' },
  { id: 20, title: 'The Junk Wax Awareness Rule', shortName: 'Know Eras', category: 'buying', icon: 'J', description: 'Cards from 1987-1993 were massively overproduced. Millions of copies exist. Unless it is a true key rookie (Griffey, Jeter, Chipper), these "vintage" cards are worth pennies despite being 30+ years old.', example: 'Paying $200 for a "complete 1989 Upper Deck set" for the Griffey RC — which sells for $15-$30 raw as an individual single.', toolLink: { href: '/collecting-history', label: 'Hobby History Timeline' } },
  { id: 21, title: 'The Tax Tracking Rule', shortName: 'Track Taxes', category: 'selling', icon: 'W', description: 'Log every purchase with date and price paid. Collectibles are taxed at 28% on gains. Without cost basis records, the IRS taxes you on the full sale price, not just the profit.', example: 'Selling $5,000 in cards without tracking cost basis — owing taxes on $5,000 instead of the $1,200 actual profit. $1,064 in unnecessary taxes.', toolLink: { href: '/vault/tax-reporter', label: 'Tax Reporter' } },
  { id: 22, title: 'The Patience Principle', shortName: 'Be Patient', category: 'investing', icon: 'Z', description: 'The best card investments compound over 3-5+ years. Day-trading cards has high fees, high stress, and inconsistent returns. Buy quality, hold through dips, and let time work for you.', example: 'A 2018 Luka Doncic Prizm RC bought for $300 in 2020. Dipped to $200 in 2021. Worth $4,000+ by 2025. Patience paid 13x.', toolLink: { href: '/tools/investment-calc', label: 'Investment Calculator' } },
  { id: 23, title: 'The Authentication Rule', shortName: 'Authenticate', category: 'buying', icon: 'Q', description: 'For any card over $500, only buy graded or from a reputable dealer with a return policy. Counterfeits, reprints, and trimmed cards are rampant on Facebook Marketplace and flea markets.', example: 'Buying a "1952 Topps Mickey Mantle" for $500 at a flea market — turns out to be a $2 reprint. No recourse, no refund, total loss.', toolLink: { href: '/tools/slab-verifier', label: 'Slab Verifier' } },
  { id: 24, title: 'The Comparison Shopping Rule', shortName: 'Compare Platforms', category: 'selling', icon: 'K', description: 'Check at least 3 platforms before selling any card over $50. eBay, COMC, MySlabs, Mercari, Facebook Groups, and card shows all have different buyer pools, fees, and price levels.', example: 'A PSA 9 card sold on eBay for $80 (net $67 after fees). The same card on a Facebook group would have sold for $75 (net $75). Platform choice matters.', toolLink: { href: '/tools/flip-calc', label: 'Flip Profit Calculator' } },
  { id: 25, title: 'The Fun First Rule', shortName: 'Have Fun', category: 'investing', icon: 'G', description: 'Collect what you love, not just what might make money. The collectors who enjoy the hobby longest — and ultimately profit most — are the ones who genuinely love the cards they own.', example: 'The collector who buys their childhood hero\'s cards enjoys them for 20 years AND sees them appreciate. The pure speculator burns out in 18 months.' },
];

const CATEGORY_CONFIG: Record<string, { bg: string; text: string; label: string; border: string }> = {
  buying: { bg: 'bg-blue-900/30', text: 'text-blue-400', label: 'Buying', border: 'border-blue-700/40' },
  selling: { bg: 'bg-amber-900/30', text: 'text-amber-400', label: 'Selling', border: 'border-amber-700/40' },
  grading: { bg: 'bg-purple-900/30', text: 'text-purple-400', label: 'Grading', border: 'border-purple-700/40' },
  investing: { bg: 'bg-emerald-900/30', text: 'text-emerald-400', label: 'Investing', border: 'border-emerald-700/40' },
  protecting: { bg: 'bg-red-900/30', text: 'text-red-400', label: 'Protecting', border: 'border-red-700/40' },
};

const STORAGE_KEY = 'cardvault-golden-rules-followed';

export default function GoldenRulesClient() {
  const [mounted, setMounted] = useState(false);
  const [followed, setFollowed] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setFollowed(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...followed]));
    }
  }, [followed, mounted]);

  const toggleRule = useCallback((id: number) => {
    setFollowed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return RULES;
    return RULES.filter(r => r.category === filter);
  }, [filter]);

  const score = useMemo(() => Math.round((followed.size / 25) * 100), [followed]);

  const grade = useMemo(() => {
    if (score >= 90) return { label: 'Elite Collector', color: 'text-emerald-400' };
    if (score >= 75) return { label: 'Advanced Collector', color: 'text-blue-400' };
    if (score >= 50) return { label: 'Intermediate Collector', color: 'text-amber-400' };
    if (score >= 25) return { label: 'Getting Started', color: 'text-orange-400' };
    return { label: 'Rookie Collector', color: 'text-red-400' };
  }, [score]);

  const shareResults = useCallback(() => {
    const cats = ['buying', 'selling', 'grading', 'investing', 'protecting'] as const;
    const catScores = cats.map(c => {
      const total = RULES.filter(r => r.category === c).length;
      const done = RULES.filter(r => r.category === c && followed.has(r.id)).length;
      return done === total ? '★' : done > 0 ? '◆' : '○';
    });
    const text = `CardVault Golden Rules Score: ${score}/100 (${followed.size}/25 rules)\n${grade.label}\n${catScores.join(' ')} [B|S|G|I|P]\nhttps://cardvault-two.vercel.app/golden-rules`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [score, grade, followed]);

  return (
    <div>
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">25 Golden Rules of Card Collecting</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">The definitive rules every collector should live by. Check off the ones you follow and get your collector discipline score.</p>
      </div>

      {/* Score Bar */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <div className="text-sm text-gray-400 mb-1">Your Discipline Score</div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white">{mounted ? score : 0}</span>
              <span className="text-gray-500">/100</span>
            </div>
            <div className={`text-sm font-medium mt-1 ${mounted ? grade.color : 'text-gray-500'}`}>
              {mounted ? grade.label : '—'}
            </div>
          </div>
          <div className="flex-1 max-w-md w-full">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{mounted ? followed.size : 0} of 25 rules</span>
              <span>{mounted ? score : 0}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className="h-3 rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-600 to-emerald-400"
                style={{ width: `${mounted ? score : 0}%` }}
              />
            </div>
          </div>
          <button
            onClick={shareResults}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-white transition-colors"
          >
            {copied ? 'Copied!' : 'Share Score'}
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[{ key: 'all', label: 'All Rules' }, ...Object.entries(CATEGORY_CONFIG).map(([k, v]) => ({ key: k, label: v.label }))].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === key
                ? 'bg-white text-gray-900'
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {label} {key !== 'all' && `(${RULES.filter(r => r.category === key).length})`}
          </button>
        ))}
      </div>

      {/* Rules Grid */}
      <div className="space-y-3">
        {filtered.map(rule => {
          const cat = CATEGORY_CONFIG[rule.category];
          const isFollowed = mounted && followed.has(rule.id);
          const isExpanded = expandedId === rule.id;

          return (
            <div
              key={rule.id}
              className={`border rounded-xl overflow-hidden transition-all ${
                isFollowed ? 'border-emerald-700/50 bg-emerald-900/10' : `${cat.border} bg-gray-800/40`
              }`}
            >
              <div className="p-4 flex items-start gap-3">
                {/* Checkbox */}
                <button
                  onClick={() => toggleRule(rule.id)}
                  className={`mt-0.5 w-6 h-6 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                    isFollowed
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'border-gray-600 hover:border-gray-400'
                  }`}
                >
                  {isFollowed && <span className="text-sm font-bold">&#10003;</span>}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${cat.bg} ${cat.text}`}>{cat.label}</span>
                    <span className="text-xs text-gray-500">Rule #{rule.id}</span>
                  </div>
                  <h3
                    className={`font-semibold cursor-pointer hover:text-white transition-colors ${
                      isFollowed ? 'text-emerald-300' : 'text-gray-200'
                    }`}
                    onClick={() => setExpandedId(isExpanded ? null : rule.id)}
                  >
                    {rule.title}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1 leading-relaxed">{rule.description}</p>

                  {isExpanded && (
                    <div className="mt-3 space-y-3">
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Real Example</div>
                        <p className="text-sm text-gray-300 leading-relaxed">{rule.example}</p>
                      </div>
                      {rule.toolLink && (
                        <Link
                          href={rule.toolLink.href}
                          className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          Use {rule.toolLink.label} &rarr;
                        </Link>
                      )}
                    </div>
                  )}
                </div>

                {/* Expand toggle */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : rule.id)}
                  className="text-gray-500 hover:text-white transition-colors text-lg flex-shrink-0"
                  aria-label={isExpanded ? 'Collapse' : 'Expand'}
                >
                  {isExpanded ? '−' : '+'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Summary */}
      <div className="mt-10 bg-gray-800/60 border border-gray-700/50 rounded-xl p-5">
        <h2 className="text-lg font-bold text-white mb-4">Category Breakdown</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Object.entries(CATEGORY_CONFIG).map(([key, cat]) => {
            const total = RULES.filter(r => r.category === key).length;
            const done = mounted ? RULES.filter(r => r.category === key && followed.has(r.id)).length : 0;
            const pct = Math.round((done / total) * 100);
            return (
              <div key={key} className={`rounded-lg p-3 ${cat.bg} border ${cat.border}`}>
                <div className={`text-xs font-medium ${cat.text}`}>{cat.label}</div>
                <div className="text-xl font-bold text-white mt-1">{done}/{total}</div>
                <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      key === 'buying' ? 'bg-blue-400' :
                      key === 'selling' ? 'bg-amber-400' :
                      key === 'grading' ? 'bg-purple-400' :
                      key === 'investing' ? 'bg-emerald-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Related Links */}
      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-lg font-bold text-white mb-4">Related Resources</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/collecting-mistakes', label: '20 Collecting Mistakes' },
            { href: '/cheat-sheets', label: 'Cheat Sheets' },
            { href: '/bucket-list', label: 'Collector Bucket List' },
            { href: '/investing-playbook', label: 'Investing Playbook' },
            { href: '/tools/grading-roi', label: 'Grading ROI Calculator' },
            { href: '/tools/flip-calc', label: 'Flip Profit Calculator' },
            { href: '/tools/condition-grader', label: 'Condition Grader' },
            { href: '/tools/insurance-calc', label: 'Insurance Calculator' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="block bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
            >
              {link.label} &rarr;
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

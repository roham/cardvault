'use client';

import { useState, useEffect, useMemo } from 'react';
import { sportsCards } from '@/data/sports-cards';

// --- Types ---
type Verdict = 'TRUE' | 'FALSE' | 'IT DEPENDS';
type Category = 'Investment' | 'Grading' | 'Collecting' | 'Market' | 'Selling';

interface Myth {
  id: number;
  title: string;
  myth: string;
  verdict: Verdict;
  category: Category;
  evidence: string;
  counterPoint: string;
  bottomLine: string;
  dataPoint?: string;
}

function parseValue(v: string): number {
  const m = v.match(/\$([0-9,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

// --- Generate data points from the card database ---
function generateDataPoints() {
  const rookieCards = sportsCards.filter(c => c.rookie);
  const nonRookieCards = sportsCards.filter(c => !c.rookie);
  const avgRookieVal = rookieCards.reduce((s, c) => s + parseValue(c.estimatedValueRaw), 0) / (rookieCards.length || 1);
  const avgNonRookieVal = nonRookieCards.reduce((s, c) => s + parseValue(c.estimatedValueRaw), 0) / (nonRookieCards.length || 1);

  const vintageCards = sportsCards.filter(c => c.year < 1980);
  const modernCards = sportsCards.filter(c => c.year >= 2010);
  const avgVintageRaw = vintageCards.reduce((s, c) => s + parseValue(c.estimatedValueRaw), 0) / (vintageCards.length || 1);
  const avgModernRaw = modernCards.reduce((s, c) => s + parseValue(c.estimatedValueRaw), 0) / (modernCards.length || 1);

  const junkWaxCards = sportsCards.filter(c => c.year >= 1986 && c.year <= 1993);
  const avgJunkWaxVal = junkWaxCards.reduce((s, c) => s + parseValue(c.estimatedValueRaw), 0) / (junkWaxCards.length || 1);

  const baseballCards = sportsCards.filter(c => c.sport === 'baseball');
  const basketballCards = sportsCards.filter(c => c.sport === 'basketball');
  const footballCards = sportsCards.filter(c => c.sport === 'football');
  const hockeyCards = sportsCards.filter(c => c.sport === 'hockey');

  return {
    rookieCount: rookieCards.length,
    nonRookieCount: nonRookieCards.length,
    avgRookieVal: Math.round(avgRookieVal),
    avgNonRookieVal: Math.round(avgNonRookieVal),
    avgVintageRaw: Math.round(avgVintageRaw),
    avgModernRaw: Math.round(avgModernRaw),
    junkWaxCount: junkWaxCards.length,
    avgJunkWaxVal: Math.round(avgJunkWaxVal),
    vintageCount: vintageCards.length,
    modernCount: modernCards.length,
    sportCounts: {
      baseball: baseballCards.length,
      basketball: basketballCards.length,
      football: footballCards.length,
      hockey: hockeyCards.length,
    },
    totalCards: sportsCards.length,
  };
}

// --- Myth Database ---
function getMyths(data: ReturnType<typeof generateDataPoints>): Myth[] {
  return [
    {
      id: 1,
      title: 'Rookie cards are always the best investment',
      myth: 'You should always buy the rookie card — it will always outperform other cards of the same player.',
      verdict: 'IT DEPENDS',
      category: 'Investment',
      evidence: `In our database of ${data.totalCards.toLocaleString()} cards, rookie cards average $${data.avgRookieVal} raw vs $${data.avgNonRookieVal} for non-rookies. Rookie cards of Hall of Famers and superstars have historically been the best long-term holds. However, many rookie cards of busts and journeymen players have gone to zero. The key is the PLAYER, not just the rookie status.`,
      counterPoint: 'Some non-rookie cards actually outperform rookies. A 1986 Fleer Michael Jordan sticker (#8) has appreciated faster than some Jordan rookie alternatives. Autograph and relic inserts from later career years can surpass base rookies for certain players.',
      bottomLine: 'Rookie cards are the default starting point for player investing, but player quality matters far more than rookie status alone. A rookie card of a bust is still a bad investment.',
      dataPoint: `${data.rookieCount} rookie cards in DB averaging $${data.avgRookieVal} raw vs ${data.nonRookieCount} non-rookies at $${data.avgNonRookieVal}`,
    },
    {
      id: 2,
      title: 'PSA 10 cards always go up in value',
      myth: 'If you get a card graded PSA 10, its value will only go up over time.',
      verdict: 'FALSE',
      category: 'Grading',
      evidence: 'PSA 10 cards experienced massive inflation during 2020-2021, with some cards jumping 3-5x. Many of those same cards lost 40-60% of their value in the 2022-2023 correction. The hobby-wide PSA 10 population has exploded — PSA alone has graded over 80 million cards lifetime, diluting the premium for common modern cards.',
      counterPoint: 'For truly scarce vintage cards (pre-1970), PSA 10 status remains extremely rare and valuable. A PSA 10 1952 Topps Mantle is in a completely different class than a PSA 10 2023 Topps base card.',
      bottomLine: 'PSA 10 is not a guarantee of appreciation. For high-population modern cards, the PSA 10 premium has compressed. For genuinely scarce vintage, PSA 10 remains the gold standard.',
      dataPoint: 'PSA has graded 80M+ cards total — modern PSA 10s are far less rare than collectors assume',
    },
    {
      id: 3,
      title: 'Vintage cards are always better than modern',
      myth: 'Older cards are always a safer and better investment than modern cards.',
      verdict: 'IT DEPENDS',
      category: 'Investment',
      evidence: `Our data shows vintage cards (pre-1980) average $${data.avgVintageRaw} raw across ${data.vintageCount} cards, while modern cards (2010+) average $${data.avgModernRaw} raw across ${data.modernCount} cards. Vintage has a higher floor due to scarcity, but modern cards of breakout players can deliver 10-50x returns in months that vintage can't match.`,
      counterPoint: 'Modern cards carry higher variance. A Wemby Prizm rookie might 5x or drop 50% in a year. A T206 Honus Wagner moves maybe 10% in either direction. Different risk profiles serve different investors.',
      bottomLine: 'Vintage offers stability and scarcity. Modern offers explosive potential with higher risk. The "better" investment depends on your risk tolerance and time horizon.',
      dataPoint: `Vintage avg: $${data.avgVintageRaw} raw (${data.vintageCount} cards) | Modern avg: $${data.avgModernRaw} raw (${data.modernCount} cards)`,
    },
    {
      id: 4,
      title: 'Junk wax era cards are worthless',
      myth: 'Every card from 1986-1993 is worthless due to massive overproduction. Don\'t bother collecting them.',
      verdict: 'FALSE',
      category: 'Market',
      evidence: `While the average junk wax card in our database is only $${data.avgJunkWaxVal} raw (across ${data.junkWaxCount} tracked cards), this includes some genuinely valuable cards. Key rookie cards from this era — 1986 Fleer Jordan, 1989 Upper Deck Griffey, 1986 Topps Jerry Rice — are worth thousands in high grade.`,
      counterPoint: 'The vast majority of junk wax commons ARE essentially worthless in bulk. You can buy complete sets for less than $20. The myth is true for 99% of cards from this era — but the top 1% includes some of the hobby\'s most iconic issues.',
      bottomLine: 'Junk wax era cards are mostly low-value, but calling them ALL worthless ignores major exceptions. The right cards from this era in PSA 10 are five and six-figure items.',
      dataPoint: `${data.junkWaxCount} junk wax cards tracked, avg $${data.avgJunkWaxVal} raw — but includes $10K+ exceptions`,
    },
    {
      id: 5,
      title: 'You should grade every card you own',
      myth: 'Sending every card to PSA or BGS will increase its value and is always worth the cost.',
      verdict: 'FALSE',
      category: 'Grading',
      evidence: 'Grading costs $20-150+ per card depending on service level. For cards worth less than $50 raw, grading often costs more than the value increase — especially if the card doesn\'t achieve a PSA 10 or BGS 9.5. A PSA 8 of a $20 card might only be worth $25, meaning you lost money on the grading fee.',
      counterPoint: 'For high-value cards ($100+ raw) or vintage cards where grade dramatically affects value, grading is almost always worthwhile. The authentication alone can add value by proving a card is genuine.',
      bottomLine: 'Only grade cards where the potential grade premium exceeds the grading cost. As a rule of thumb: if the raw card is worth less than 3x the grading fee, think twice.',
    },
    {
      id: 6,
      title: 'Basketball cards are the future — baseball is dying',
      myth: 'Basketball has overtaken baseball as the dominant card sport and baseball cards will continue to decline.',
      verdict: 'FALSE',
      category: 'Market',
      evidence: `Our database tracks ${data.sportCounts.baseball} baseball cards vs ${data.sportCounts.basketball} basketball cards. Baseball still commands the deepest collector base, the most auction house volume, and the strongest vintage market. Heritage Auctions, Goldin, and PWCC all report baseball as their largest category by revenue.`,
      counterPoint: 'Basketball has grown dramatically since 2019, driven by international appeal and social media. Young collectors do skew toward basketball and football. The growth rate of basketball card sales has outpaced baseball in recent years.',
      bottomLine: 'Basketball is growing, but baseball isn\'t dying — it\'s the bedrock of the hobby. Different sports serve different collector demographics. A diversified collector holds both.',
      dataPoint: `Database: ${data.sportCounts.baseball} baseball, ${data.sportCounts.basketball} basketball, ${data.sportCounts.football} football, ${data.sportCounts.hockey} hockey cards`,
    },
    {
      id: 7,
      title: 'Card shows are dead — everything is online now',
      myth: 'Physical card shows are obsolete. You can find better deals and selection online.',
      verdict: 'FALSE',
      category: 'Selling',
      evidence: 'The National Sports Collectors Convention grew from 30,000 attendees in 2019 to over 100,000 in 2023. Regional card shows have exploded, with many cities hosting weekly shows. Dealers report that shows account for 30-50% of their annual revenue.',
      counterPoint: 'Online marketplaces (eBay, COMC, MySlabs) do offer broader selection and price transparency. For specific card searches, online is often more efficient than hoping a dealer at a show has your target card.',
      bottomLine: 'Card shows are thriving and offer negotiation opportunities, instant gratification, and community that online can\'t replicate. The hobby is both online AND in-person — they complement each other.',
    },
    {
      id: 8,
      title: 'You need thousands of dollars to start collecting',
      myth: 'Card collecting is an expensive hobby that requires significant capital to get started.',
      verdict: 'FALSE',
      category: 'Collecting',
      evidence: 'Thousands of collectible cards are available for under $5. Complete junk wax era sets can be had for $10-20. Modern base rookie cards of current stars are often $1-5. The hobby has entry points at every price level.',
      counterPoint: 'If you want to collect high-end graded rookies or vintage Hall of Famers, yes, you need significant capital. But that\'s like saying you need millions to invest — it depends on what you\'re buying.',
      bottomLine: 'You can start a meaningful collection for under $50. The best collections are built over time with patience and knowledge, not money. Budget collecting is one of the most rewarding segments of the hobby.',
    },
    {
      id: 9,
      title: 'Topps Chrome/Prizm are the only cards worth collecting',
      myth: 'If it\'s not Topps Chrome (baseball) or Panini Prizm (basketball/football), it\'s not worth collecting.',
      verdict: 'FALSE',
      category: 'Collecting',
      evidence: 'While Chrome and Prizm are the flagship modern products, many other products hold and gain value. Topps Heritage is beloved by vintage-style collectors. Bowman Chrome dominates the prospect market. Upper Deck has exclusive NHL rights. Panini National Treasures and Flawless command ultra-premium prices.',
      counterPoint: 'Chrome and Prizm DO command the largest market share for modern card investing. If you\'re purely focused on maximizing resale value, they are the safest mainstream choice.',
      bottomLine: 'Chrome and Prizm are important, but the hobby is much richer than two products. Collect what you enjoy — many niches (vintage, prospects, international, WNBA) offer strong communities and appreciation potential.',
    },
    {
      id: 10,
      title: 'Buying sealed boxes is better than buying singles',
      myth: 'Opening sealed hobby boxes gives you better value than just buying the specific cards you want.',
      verdict: 'FALSE',
      category: 'Investment',
      evidence: 'The expected value (EV) of most sealed products is 60-80% of the purchase price. Hobby box EV is typically $150-200 for a $250 box. You\'re paying a premium for the "rip experience" — the entertainment value of not knowing what you\'ll get. Singles buying is almost always more cost-effective for building a collection.',
      counterPoint: 'Sealed products can occasionally produce results far above EV (hitting a 1/1 or premium auto), and sealed products themselves appreciate over time as an asset class. The experience of opening packs has its own value.',
      bottomLine: 'If your goal is specific cards, buy singles. If your goal is entertainment and you enjoy the gamble, buy sealed. The math almost always favors singles for pure collection building.',
    },
    {
      id: 11,
      title: 'Hockey cards are a waste of money',
      myth: 'Hockey cards have no market and you\'ll never make money collecting them.',
      verdict: 'FALSE',
      category: 'Market',
      evidence: `We track ${data.sportCounts.hockey} hockey cards in our database. Key hockey rookies like Wayne Gretzky, Bobby Orr, and Connor McDavid command strong prices. The Canadian collector base is loyal and deep. Upper Deck\'s exclusive NHL license limits supply relative to multi-license sports.`,
      counterPoint: 'Hockey does have the smallest US market share among the four major sports. Liquidity is lower, and casual US collectors often overlook hockey entirely. The resale audience is more niche.',
      bottomLine: 'Hockey cards are undervalued relative to the sport\'s cultural significance, especially in Canada. For collectors who know the market, hockey offers opportunities that the more crowded baseball and basketball markets don\'t.',
      dataPoint: `${data.sportCounts.hockey} hockey cards tracked — the most undervalued major sport in the hobby`,
    },
    {
      id: 12,
      title: 'Card prices always crash during recessions',
      myth: 'When the economy goes down, card prices follow. Cards are a pure luxury and discretionary spend.',
      verdict: 'IT DEPENDS',
      category: 'Market',
      evidence: 'During the 2008-2009 recession, the broader card market did decline. But during the 2020 COVID recession, card prices exploded — the stimulus checks, stay-at-home boredom, and nostalgia created a massive bull market. The relationship between the economy and card prices is not linear.',
      counterPoint: 'High-end cards ($10K+) are more sensitive to economic conditions because buyers at that level are more affected by stock market performance and liquidity. Budget cards are more recession-resistant.',
      bottomLine: 'Cards are partially correlated with the economy, but other factors (nostalgia cycles, new product releases, player performance, social media trends) can override macro conditions. The 2020 boom proved cards can defy economic gravity.',
    },
    {
      id: 13,
      title: 'You should never sell your cards — just hold forever',
      myth: 'The best strategy is to never sell. Cards always go up given enough time.',
      verdict: 'FALSE',
      category: 'Investment',
      evidence: 'Many cards from the early 2000s are still worth LESS than they were at their 2021 peaks. Player cards lose value when careers end prematurely, scandals occur, or the hobby cycle shifts. "Hodling" indefinitely ignores opportunity cost — money tied up in a declining card can\'t be invested elsewhere.',
      counterPoint: 'For blue-chip vintage (Mantle, Ruth, Jordan, Gretzky), holding for decades has been extremely rewarding. The key distinction is between "hold forever" on proven all-time greats vs. speculative modern holds.',
      bottomLine: 'Have an exit strategy. Know your time horizon. Taking profits on speculative positions is smart. Only "hold forever" cards that represent truly transcendent players with established legacies.',
    },
    {
      id: 14,
      title: 'eBay is the only place to sell cards',
      myth: 'eBay is the only viable marketplace for selling sports cards.',
      verdict: 'FALSE',
      category: 'Selling',
      evidence: 'While eBay remains the largest marketplace, alternatives have grown significantly. COMC offers consignment with no listing effort. MySlabs has lower fees (5%). Facebook Marketplace and card groups enable direct sales. Heritage, Goldin, and PWCC serve the $500+ market. Card shows offer zero-fee cash transactions.',
      counterPoint: 'eBay does offer the largest buyer audience, best search visibility, and strongest buyer protection. For most sellers, eBay\'s 13.25% fee is the price of accessing the largest market of card buyers on the internet.',
      bottomLine: 'eBay is the default, not the only option. Smart sellers use multiple channels: eBay for broad reach, COMC for low-effort bulk, Facebook for zero-fee sales, and auction houses for premium pieces. Match the venue to the card.',
    },
    {
      id: 15,
      title: 'AI and technology will make card collecting obsolete',
      myth: 'With AI-generated art, digital collectibles, and technology disruption, physical card collecting will die.',
      verdict: 'FALSE',
      category: 'Market',
      evidence: 'Physical card collecting has survived the transition from tobacco cards to bubble gum cards, the junk wax crash, the digital age, and every technology shift for 130+ years. The tactile experience of holding a card, the thrill of a pack rip, and the nostalgia factor cannot be digitally replicated. Card sales hit record highs in 2024-2025.',
      counterPoint: 'Technology IS changing the hobby — online grading submissions, AI-powered card identification, price tracking apps, and digital authentication are becoming standard. Technology enhances collecting rather than replacing it.',
      bottomLine: 'Physical cards have an irreplaceable emotional and nostalgic value. Technology will transform HOW we collect (better tools, data, authentication) but not WHETHER we collect. The hobby is not going anywhere.',
    },
  ];
}

// --- Verdict styling ---
function verdictStyle(v: Verdict) {
  switch (v) {
    case 'TRUE': return { bg: 'bg-emerald-950/60', border: 'border-emerald-700/50', text: 'text-emerald-400', icon: '\u2713' };
    case 'FALSE': return { bg: 'bg-red-950/60', border: 'border-red-700/50', text: 'text-red-400', icon: '\u2717' };
    case 'IT DEPENDS': return { bg: 'bg-amber-950/60', border: 'border-amber-700/50', text: 'text-amber-400', icon: '~' };
  }
}

function categoryColor(c: Category) {
  switch (c) {
    case 'Investment': return 'bg-emerald-900/40 text-emerald-400 border-emerald-700/30';
    case 'Grading': return 'bg-blue-900/40 text-blue-400 border-blue-700/30';
    case 'Collecting': return 'bg-violet-900/40 text-violet-400 border-violet-700/30';
    case 'Market': return 'bg-orange-900/40 text-orange-400 border-orange-700/30';
    case 'Selling': return 'bg-pink-900/40 text-pink-400 border-pink-700/30';
  }
}

// --- Storage keys ---
const VOTES_KEY = 'cardvault-mythbusters-votes';

export default function MythBustersClient() {
  const data = useMemo(() => generateDataPoints(), []);
  const myths = useMemo(() => getMyths(data), [data]);

  const [votes, setVotes] = useState<Record<number, 'believed' | 'doubted'>>({});
  const [expandedMyth, setExpandedMyth] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<Category | 'All'>('All');
  const [filterVerdict, setFilterVerdict] = useState<Verdict | 'All'>('All');

  // Load votes from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(VOTES_KEY);
      if (saved) setVotes(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  function vote(mythId: number, choice: 'believed' | 'doubted') {
    const updated = { ...votes, [mythId]: choice };
    setVotes(updated);
    try { localStorage.setItem(VOTES_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
  }

  const filteredMyths = myths.filter(m => {
    if (filterCategory !== 'All' && m.category !== filterCategory) return false;
    if (filterVerdict !== 'All' && m.verdict !== filterVerdict) return false;
    return true;
  });

  const verdictCounts = {
    TRUE: myths.filter(m => m.verdict === 'TRUE').length,
    FALSE: myths.filter(m => m.verdict === 'FALSE').length,
    'IT DEPENDS': myths.filter(m => m.verdict === 'IT DEPENDS').length,
  };

  const categories: Category[] = ['Investment', 'Grading', 'Collecting', 'Market', 'Selling'];
  const verdicts: Verdict[] = ['TRUE', 'FALSE', 'IT DEPENDS'];

  return (
    <div>
      {/* Stats Banner */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-emerald-950/30 border border-emerald-800/30 rounded-xl p-4 text-center">
          <div className="text-2xl font-black text-emerald-400">{verdictCounts.TRUE}</div>
          <div className="text-xs text-emerald-400/70 mt-1">TRUE</div>
        </div>
        <div className="bg-red-950/30 border border-red-800/30 rounded-xl p-4 text-center">
          <div className="text-2xl font-black text-red-400">{verdictCounts.FALSE}</div>
          <div className="text-xs text-red-400/70 mt-1">FALSE</div>
        </div>
        <div className="bg-amber-950/30 border border-amber-800/30 rounded-xl p-4 text-center">
          <div className="text-2xl font-black text-amber-400">{verdictCounts['IT DEPENDS']}</div>
          <div className="text-xs text-amber-400/70 mt-1">IT DEPENDS</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilterCategory('All')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${filterCategory === 'All' ? 'bg-white text-gray-900 border-white' : 'bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-500'}`}
        >
          All Categories
        </button>
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setFilterCategory(filterCategory === c ? 'All' : c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${filterCategory === c ? categoryColor(c) : 'bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-500'}`}
          >
            {c}
          </button>
        ))}
        <div className="w-px bg-gray-700 mx-1" />
        {verdicts.map(v => {
          const s = verdictStyle(v);
          return (
            <button
              key={v}
              onClick={() => setFilterVerdict(filterVerdict === v ? 'All' : v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${filterVerdict === v ? `${s.bg} ${s.text} ${s.border}` : 'bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-500'}`}
            >
              {v}
            </button>
          );
        })}
      </div>

      {/* Myth Cards */}
      <div className="space-y-4">
        {filteredMyths.map(myth => {
          const style = verdictStyle(myth.verdict);
          const isExpanded = expandedMyth === myth.id;
          const userVote = votes[myth.id];

          return (
            <div key={myth.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              {/* Header — always visible */}
              <button
                onClick={() => setExpandedMyth(isExpanded ? null : myth.id)}
                className="w-full text-left p-5 flex items-start gap-4 hover:bg-gray-800/50 transition-colors"
              >
                <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg font-black ${style.bg} ${style.text} border ${style.border}`}>
                  {style.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${style.bg} ${style.text} ${style.border}`}>
                      {myth.verdict}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${categoryColor(myth.category)}`}>
                      {myth.category}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold text-sm sm:text-base">&ldquo;{myth.title}&rdquo;</h3>
                  <p className="text-gray-500 text-xs mt-1 line-clamp-1">{myth.myth}</p>
                </div>
                <div className="text-gray-600 text-xl shrink-0">
                  {isExpanded ? '\u2212' : '+'}
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-5 pb-5 space-y-4 border-t border-gray-800 pt-4">
                  {/* The myth statement */}
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">The Myth</div>
                    <p className="text-gray-300 text-sm italic">&ldquo;{myth.myth}&rdquo;</p>
                  </div>

                  {/* Evidence */}
                  <div>
                    <h4 className="text-white font-semibold text-sm mb-2">The Evidence</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">{myth.evidence}</p>
                  </div>

                  {/* Data Point */}
                  {myth.dataPoint && (
                    <div className="bg-blue-950/20 border border-blue-800/30 rounded-lg p-3">
                      <div className="text-xs text-blue-400 font-medium">From Our Data</div>
                      <p className="text-blue-300 text-sm mt-1">{myth.dataPoint}</p>
                    </div>
                  )}

                  {/* Counter-Point */}
                  <div>
                    <h4 className="text-white font-semibold text-sm mb-2">The Counter-Argument</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">{myth.counterPoint}</p>
                  </div>

                  {/* Bottom Line */}
                  <div className={`rounded-lg p-4 ${style.bg} border ${style.border}`}>
                    <div className={`text-xs uppercase tracking-wider mb-1 ${style.text}`}>Bottom Line — {myth.verdict}</div>
                    <p className={`text-sm ${style.text}`}>{myth.bottomLine}</p>
                  </div>

                  {/* Vote Section */}
                  <div className="border-t border-gray-800 pt-4">
                    <p className="text-gray-500 text-xs mb-3">Before reading this analysis, did you believe this myth?</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => vote(myth.id, 'believed')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${userVote === 'believed'
                          ? 'bg-amber-950/60 border-amber-600 text-amber-300'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-amber-700 hover:text-amber-400'
                        }`}
                      >
                        I believed it
                      </button>
                      <button
                        onClick={() => vote(myth.id, 'doubted')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${userVote === 'doubted'
                          ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-emerald-700 hover:text-emerald-400'
                        }`}
                      >
                        I doubted it
                      </button>
                    </div>
                    {userVote && (
                      <p className="text-gray-600 text-xs mt-2 text-center">
                        You {userVote === 'believed' ? 'believed' : 'doubted'} this myth. Your vote is saved.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state for filters */}
      {filteredMyths.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-sm">No myths match your current filters. Try adjusting the category or verdict filter.</p>
        </div>
      )}

      {/* Your Score */}
      {Object.keys(votes).length > 0 && (
        <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-bold mb-3">Your Myth Awareness Score</h3>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-black text-white">
              {Object.entries(votes).filter(([id, v]) => {
                const myth = myths.find(m => m.id === Number(id));
                if (!myth) return false;
                return (myth.verdict === 'FALSE' && v === 'doubted') || (myth.verdict === 'TRUE' && v === 'believed');
              }).length}
              <span className="text-gray-500 text-lg">/{Object.keys(votes).length}</span>
            </div>
            <div className="text-gray-400 text-sm">
              myths you correctly identified. {Object.keys(votes).length < myths.length && `Vote on all ${myths.length} to get your full score.`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

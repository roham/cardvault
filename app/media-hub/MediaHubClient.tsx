'use client';

import { useState, useMemo } from 'react';

// ── Types ──────────────────────────────────────────────────────
type Platform = 'youtube' | 'podcast' | 'tiktok' | 'blog' | 'newsletter';
type Focus = 'market' | 'ripping' | 'grading' | 'investing' | 'community' | 'education';

interface Creator {
  id: string;
  name: string;
  platform: Platform;
  focus: Focus[];
  sport: string[];
  description: string;
  audience: string;
  frequency: string;
  highlight: string;
  bestFor: string;
}

// ── Config ──────────────────────────────────────────────────────
const PLATFORM_CONFIG: Record<Platform, { label: string; icon: string; color: string; bgColor: string }> = {
  youtube: { label: 'YouTube', icon: '▶', color: 'text-red-400', bgColor: 'bg-red-500/10 border-red-500/20' },
  podcast: { label: 'Podcast', icon: '🎙', color: 'text-purple-400', bgColor: 'bg-purple-500/10 border-purple-500/20' },
  tiktok: { label: 'TikTok', icon: '♪', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10 border-cyan-500/20' },
  blog: { label: 'Blog', icon: '✍', color: 'text-amber-400', bgColor: 'bg-amber-500/10 border-amber-500/20' },
  newsletter: { label: 'Newsletter', icon: '✉', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10 border-emerald-500/20' },
};

const FOCUS_CONFIG: Record<Focus, { label: string; color: string }> = {
  market: { label: 'Market Analysis', color: 'bg-blue-500/20 text-blue-400' },
  ripping: { label: 'Ripping', color: 'bg-red-500/20 text-red-400' },
  grading: { label: 'Grading', color: 'bg-amber-500/20 text-amber-400' },
  investing: { label: 'Investing', color: 'bg-emerald-500/20 text-emerald-400' },
  community: { label: 'Community', color: 'bg-purple-500/20 text-purple-400' },
  education: { label: 'Education', color: 'bg-cyan-500/20 text-cyan-400' },
};

const SPORT_ICONS: Record<string, string> = {
  baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒', pokemon: '⚡', multi: '🃏',
};

// ── Creator Data ──────────────────────────────────────────────
const CREATORS: Creator[] = [
  // YouTube Channels
  { id: 'yt-01', name: 'Jabs Family', platform: 'youtube', focus: ['ripping', 'community'], sport: ['multi'], description: 'The biggest card ripping family on YouTube. Known for massive case breaks, box openings, and high-energy reveals across all sports and Pokemon.', audience: '1.2M+ subscribers', frequency: 'Daily uploads', highlight: 'Pulled a 1/1 Wembanyama Flawless auto on camera', bestFor: 'Entertainment, pack opening excitement' },
  { id: 'yt-02', name: 'Packman Card Talk', platform: 'youtube', focus: ['market', 'investing'], sport: ['baseball', 'basketball', 'football'], description: 'Deep-dive market analysis with data-driven investment picks. Weekly market reports with actual sales data and trend breakdowns.', audience: '180K+ subscribers', frequency: '3-4x per week', highlight: 'Called the 2024 Wemby card correction weeks before it happened', bestFor: 'Serious investors, market watchers' },
  { id: 'yt-03', name: 'Sports Card Investor', platform: 'youtube', focus: ['investing', 'market'], sport: ['baseball', 'basketball', 'football'], description: 'Geoff Wilson built the hobby investing movement. Real-time portfolio tracking, card ladder framework, and systematic approaches to card investing.', audience: '350K+ subscribers', frequency: '4-5x per week', highlight: 'Pioneer of the card index portfolio concept', bestFor: 'Portfolio builders, ROI-focused collectors' },
  { id: 'yt-04', name: 'Blez Sports Cards', platform: 'youtube', focus: ['ripping', 'community'], sport: ['baseball'], description: 'Group break legend focused on baseball. Known for high-energy breaks, monster box openings, and some of the best reactions in the hobby.', audience: '95K+ subscribers', frequency: 'Daily streams + uploads', highlight: 'Pulled a Topps Chrome Ohtani auto superfractor live', bestFor: 'Baseball fans, break room atmosphere' },
  { id: 'yt-05', name: 'Vintage Breaks', platform: 'youtube', focus: ['ripping', 'community'], sport: ['baseball', 'basketball', 'football'], description: 'The original vintage card breakers. Open wax from the 1950s through 1990s — graded Mantle, Jordan, and Montana pulls from sealed vintage product.', audience: '130K+ subscribers', frequency: '3-4x per week', highlight: 'Opened a sealed 1986 Fleer basketball box — pulled a Jordan PSA 9', bestFor: 'Vintage lovers, nostalgia, history buffs' },
  { id: 'yt-06', name: 'Card Hustle', platform: 'youtube', focus: ['investing', 'market'], sport: ['baseball', 'basketball'], description: 'Buy-sell-hold framework for card investing. Weekly pickup videos, flip reports, and honest P&L tracking on every transaction.', audience: '75K+ subscribers', frequency: '3x per week', highlight: 'Documented turning $500 into $10K flipping rookies over 12 months', bestFor: 'Flippers, budget investors, transparent P&L' },
  { id: 'yt-07', name: 'CardCollector2', platform: 'youtube', focus: ['market', 'education'], sport: ['baseball', 'basketball', 'football'], description: 'The evening news of the card hobby. Nightly market recaps, PSA submission updates, and hobby industry analysis.', audience: '220K+ subscribers', frequency: 'Daily uploads', highlight: 'First to break the Fanatics licensing transition news', bestFor: 'Daily market updates, industry news' },
  { id: 'yt-08', name: 'PokeRev', platform: 'youtube', focus: ['ripping', 'community'], sport: ['pokemon'], description: 'Top-tier Pokemon pack opening content. Massive vintage openings, modern set reviews, and pull rate breakdowns for every new release.', audience: '580K+ subscribers', frequency: 'Daily uploads', highlight: 'Opened a sealed base set booster box worth $250K', bestFor: 'Pokemon collectors, set reviews, pull rates' },
  { id: 'yt-09', name: 'Leonhart', platform: 'youtube', focus: ['ripping', 'education'], sport: ['pokemon'], description: 'The godfather of Pokemon card YouTube. Known for emotional vintage openings, set history deep dives, and the most wholesome community in the hobby.', audience: '2.5M+ subscribers', frequency: 'Daily uploads', highlight: 'Pulled a base set Charizard from a pack found at a garage sale', bestFor: 'Pokemon fans, nostalgia, family-friendly content' },
  { id: 'yt-10', name: 'Gem Mint Cards', platform: 'youtube', focus: ['grading', 'market'], sport: ['baseball', 'basketball', 'football'], description: 'Grading-focused content with reveal videos, PSA submission tips, and raw vs graded value analysis. Expert centering and surface assessments.', audience: '110K+ subscribers', frequency: '2-3x per week', highlight: 'Achieved a 62% PSA 10 rate across 1,000+ submissions', bestFor: 'Grading enthusiasts, submission optimization' },
  { id: 'yt-11', name: 'Stacked With Dan', platform: 'youtube', focus: ['market', 'investing'], sport: ['basketball', 'football'], description: 'Basketball and football card investing with a focus on emerging players and draft prospects. Combines scouting analysis with card market data.', audience: '65K+ subscribers', frequency: '3x per week', highlight: 'Identified Tyrese Maxey cards as undervalued 6 months before breakout', bestFor: 'Prospect hunters, draft night investors' },
  { id: 'yt-12', name: 'Hockey Card Investor', platform: 'youtube', focus: ['investing', 'market'], sport: ['hockey'], description: 'The only dedicated hockey card investing channel. Young Guns tracker, grading ROI on hockey-specific products, and CHL prospect coverage.', audience: '28K+ subscribers', frequency: '2x per week', highlight: 'Called the Bedard Young Guns PSA 10 price floor within $5', bestFor: 'Hockey collectors, Young Guns investors' },

  // Podcasts
  { id: 'pod-01', name: 'Card Talk', platform: 'podcast', focus: ['market', 'community'], sport: ['multi'], description: 'The gold standard hobby podcast. Weekly episodes with industry insiders, auction house execs, and market analysis. Professional production quality.', audience: '50K+ listeners per episode', frequency: 'Weekly', highlight: 'Interviewed the CEO of PSA about the future of grading', bestFor: 'Industry news, executive insights' },
  { id: 'pod-02', name: 'Hobby Hotline', platform: 'podcast', focus: ['market', 'investing'], sport: ['baseball', 'basketball', 'football'], description: 'Fast-paced daily hobby news in 15-20 minute episodes. Perfect for commute listening. Covers breaking sales, product drops, and market movements.', audience: '30K+ listeners per episode', frequency: 'Daily (M-F)', highlight: 'First podcast to cover every major card sale over $100K', bestFor: 'Quick daily updates, commute listening' },
  { id: 'pod-03', name: 'Sports Cards Nonsense', platform: 'podcast', focus: ['community', 'market'], sport: ['multi'], description: 'The most fun podcast in the hobby. Two friends debate, argue, and laugh about cards. Weekly guest collectors share their wildest pulls and biggest regrets.', audience: '25K+ listeners per episode', frequency: 'Weekly', highlight: 'Created the viral "Card or Cash" segment that took over hobby Twitter', bestFor: 'Entertainment, collector stories, debates' },
  { id: 'pod-04', name: 'The Rip Show', platform: 'podcast', focus: ['ripping', 'education'], sport: ['baseball'], description: 'Baseball-only podcast analyzing every product release. Box-by-box EV breakdowns, checklist analysis, and what to rip vs skip.', audience: '20K+ listeners per episode', frequency: 'Weekly + bonus episodes for new releases', highlight: 'Accurately predicted Topps Chrome Sapphire EV within 5% for 3 years running', bestFor: 'Baseball rippers, product reviews, EV analysis' },
  { id: 'pod-05', name: 'Grade Matters', platform: 'podcast', focus: ['grading', 'education'], sport: ['multi'], description: 'Deep grading education from former PSA and BGS graders. Explains exactly what graders look for, common mistakes, and how to maximize your grades.', audience: '15K+ listeners per episode', frequency: 'Bi-weekly', highlight: 'Host is a former PSA grader who graded 200K+ cards', bestFor: 'Grading education, submission strategy' },
  { id: 'pod-06', name: 'Cardboard Prophets', platform: 'podcast', focus: ['investing', 'market'], sport: ['basketball', 'football'], description: 'Long-term card investment strategy. Portfolio construction, diversification, and when to sell. Treats cards like an alternative asset class with discipline.', audience: '18K+ listeners per episode', frequency: 'Weekly', highlight: 'Model portfolio returned 47% in 2025 tracked publicly', bestFor: 'Long-term investors, portfolio strategy' },
  { id: 'pod-07', name: 'Pokemon Pod', platform: 'podcast', focus: ['market', 'community'], sport: ['pokemon'], description: 'Weekly Pokemon card market analysis, set reviews, and community discussion. Covers Japanese and English markets, sealed product strategy, and grading.', audience: '22K+ listeners per episode', frequency: 'Weekly', highlight: 'Called the Prismatic Evolutions frenzy 3 months before release', bestFor: 'Pokemon investors, set analysis, sealed strategy' },

  // TikTok Creators
  { id: 'tt-01', name: 'CardPulls', platform: 'tiktok', focus: ['ripping', 'community'], sport: ['multi'], description: 'Viral pack openings in 60 seconds. The most-followed card account on TikTok with reaction-worthy pulls and quick tips between rips.', audience: '2.1M+ followers', frequency: 'Daily posts', highlight: 'Pulled a $50K Luka auto in a 30-second video — 45M views', bestFor: 'Quick entertainment, viral pulls, new collector discovery' },
  { id: 'tt-02', name: 'PSA Card Tips', platform: 'tiktok', focus: ['grading', 'education'], sport: ['multi'], description: 'Short-form grading education. Shows you exactly what a PSA 10 vs 9 looks like in 15 seconds. Centering checks, surface flaws, and corner analysis in quick format.', audience: '680K+ followers', frequency: 'Daily posts', highlight: 'The "Is This a 10?" series has helped beginners save thousands on grading', bestFor: 'Visual grading education, quick tips' },
  { id: 'tt-03', name: 'FlipKingCards', platform: 'tiktok', focus: ['investing', 'market'], sport: ['baseball', 'basketball'], description: 'Shows every flip with actual dollar amounts. No fluff — just buy price, sell price, profit, and time held. Raw transparency about the flip game.', audience: '450K+ followers', frequency: 'Daily posts', highlight: 'Documented 365 consecutive days of flipping — $42K total profit shown', bestFor: 'Flippers, transparent P&L, quick market reads' },
  { id: 'tt-04', name: 'PokemonFinds', platform: 'tiktok', focus: ['ripping', 'community'], sport: ['pokemon'], description: 'Pokemon pack content with a twist — finds sealed product at retail, garage sales, and thrift stores. The thrill of the hunt plus the rip.', audience: '1.4M+ followers', frequency: 'Daily posts', highlight: 'Found a sealed Pokemon base set booster pack at Goodwill for $2', bestFor: 'Pokemon fans, treasure hunting, retail finds' },
  { id: 'tt-05', name: 'CardShowDiaries', platform: 'tiktok', focus: ['community', 'education'], sport: ['multi'], description: 'Documents every card show visit with deals found, negotiation tips, and booth-by-booth walkthroughs. The closest thing to being at a card show from home.', audience: '320K+ followers', frequency: '3-4x per week', highlight: 'Found a misattributed Jordan rookie at a show for $200 — worth $8K', bestFor: 'Card show tips, deal finding, show culture' },
  { id: 'tt-06', name: 'WaxMuseum', platform: 'tiktok', focus: ['ripping', 'community'], sport: ['multi'], description: 'Cinematic pack openings with professional lighting and dramatic reveals. Turns every box break into a mini movie with slow-motion hits.', audience: '890K+ followers', frequency: 'Daily posts', highlight: 'Viral slow-motion Wemby 1/1 reveal — 28M views, most-watched card TikTok of 2025', bestFor: 'Visual content, cinematic reveals' },
  { id: 'tt-07', name: 'RookieReport', platform: 'tiktok', focus: ['investing', 'education'], sport: ['football', 'basketball'], description: 'Rookie card investment picks in 60 seconds. Shows you what to buy before draft night and after breakout games. Quick, actionable, data-backed.', audience: '275K+ followers', frequency: 'Daily posts', highlight: 'Called 7 of 10 top rookie card movers for the 2025 NFL season', bestFor: 'Rookie investors, draft preview, quick picks' },

  // Blogs
  { id: 'blog-01', name: 'Cardboard Connection', platform: 'blog', focus: ['education', 'community'], sport: ['multi'], description: 'The encyclopedia of card collecting. Complete checklists for every major product release, set histories, and comprehensive guides. The reference source every collector needs.', audience: '500K+ monthly visitors', frequency: 'Daily updates', highlight: 'Published checklists for 5,000+ sets — the most complete database online', bestFor: 'Checklists, set information, product details' },
  { id: 'blog-02', name: 'Beckett Media', platform: 'blog', focus: ['market', 'grading'], sport: ['multi'], description: 'The original card price guide, now digital. Monthly price updates, grading articles, market analysis, and the Beckett price database used by dealers worldwide.', audience: '1M+ monthly visitors', frequency: 'Daily articles + monthly price updates', highlight: 'Been the hobby authority since 1984 — 40+ years of pricing data', bestFor: 'Price references, dealer standard, hobby history' },
  { id: 'blog-03', name: 'Card Ladder', platform: 'blog', focus: ['market', 'investing'], sport: ['baseball', 'basketball', 'football'], description: 'Real-time card market data with charts, indexes, and portfolio tracking. The Bloomberg Terminal of sports cards. Premium data for serious investors.', audience: '200K+ monthly visitors', frequency: 'Real-time data, weekly articles', highlight: 'Card indexes tracked against S&P 500 show cards outperform in some periods', bestFor: 'Data-driven investors, market indices, portfolio tracking' },
  { id: 'blog-04', name: 'Blowout Forums', platform: 'blog', focus: ['community', 'market'], sport: ['multi'], description: 'The largest card collecting forum community. Product release discussions, trade threads, break reviews, and the pulse of hobby sentiment before it hits social media.', audience: '300K+ registered members', frequency: 'Continuous community posts', highlight: 'Product intel often leaks here first — 48 hours before official announcements', bestFor: 'Community discussion, insider intel, trade opportunities' },
  { id: 'blog-05', name: 'PSA Blog', platform: 'blog', focus: ['grading', 'education'], sport: ['multi'], description: 'Official PSA content with grading tips, pop report analysis, registry spotlights, and articles from professional graders about what they look for.', audience: '150K+ monthly visitors', frequency: 'Weekly articles', highlight: 'Grader Q&A series reveals exactly what causes cards to miss PSA 10', bestFor: 'PSA submission prep, grading education, population data' },

  // Newsletters
  { id: 'nl-01', name: 'Alt Daily', platform: 'newsletter', focus: ['investing', 'market'], sport: ['multi'], description: 'Daily alternative investment newsletter covering cards, memorabilia, watches, and wine. Cards section includes top sales, market moves, and investment picks with real data.', audience: '100K+ subscribers', frequency: 'Daily (M-F)', highlight: 'Predicted the 2024 vintage card rally 4 months early', bestFor: 'Investors, market movers, daily briefing' },
  { id: 'nl-02', name: 'Hobby Headlines', platform: 'newsletter', focus: ['market', 'community'], sport: ['multi'], description: 'Weekly hobby digest with the 10 most important card market stories. No noise — just the stories that matter. Perfect Sunday morning read for serious collectors.', audience: '45K+ subscribers', frequency: 'Weekly (Sunday)', highlight: 'Curated top 10 format means zero fluff — highest open rate in hobby media', bestFor: 'Weekly summary, curated news, time-efficient' },
  { id: 'nl-03', name: 'The Flip Report', platform: 'newsletter', focus: ['investing', 'market'], sport: ['baseball', 'basketball', 'football'], description: 'Weekly flip opportunities with entry prices, target prices, and timelines. Data-backed picks for short-term and medium-term card flips. Track record published quarterly.', audience: '30K+ subscribers', frequency: 'Weekly (Tuesday)', highlight: 'Published pick track record: 68% hit rate on flip targets in 2025', bestFor: 'Active flippers, actionable picks, transparent track record' },
  { id: 'nl-04', name: 'PSA Insider', platform: 'newsletter', focus: ['grading', 'education'], sport: ['multi'], description: 'Monthly deep dive from PSA on grading trends, population report changes, and collector stories. Features registry winners and exceptional cards graded each month.', audience: '250K+ subscribers', frequency: 'Monthly', highlight: 'First to announce new PSA service levels and pricing changes', bestFor: 'PSA submitters, grading trends, monthly digest' },
  { id: 'nl-05', name: 'Sealed Strategies', platform: 'newsletter', focus: ['investing', 'education'], sport: ['pokemon', 'multi'], description: 'Dedicated to sealed product investing — which boxes to hold, which to rip, EV analysis for new releases, and long-term sealed appreciation data.', audience: '20K+ subscribers', frequency: 'Bi-weekly', highlight: 'Subscribers who followed 2023 sealed picks averaged 35% returns', bestFor: 'Sealed collectors, product investment, long-term holds' },
];

// ── Component ──────────────────────────────────────────────────
export default function MediaHubClient() {
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all');
  const [focusFilter, setFocusFilter] = useState<Focus | 'all'>('all');
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return CREATORS.filter(c => {
      if (platformFilter !== 'all' && c.platform !== platformFilter) return false;
      if (focusFilter !== 'all' && !c.focus.includes(focusFilter)) return false;
      if (sportFilter !== 'all' && !c.sport.includes(sportFilter)) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!c.name.toLowerCase().includes(q) && !c.description.toLowerCase().includes(q) && !c.bestFor.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [platformFilter, focusFilter, sportFilter, search]);

  const platformCounts = useMemo(() => {
    const counts: Record<string, number> = { all: CREATORS.length };
    for (const c of CREATORS) counts[c.platform] = (counts[c.platform] || 0) + 1;
    return counts;
  }, []);

  return (
    <div>
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        {(Object.entries(PLATFORM_CONFIG) as [Platform, typeof PLATFORM_CONFIG[Platform]][]).map(([key, cfg]) => (
          <div key={key} className={`border rounded-lg p-3 text-center ${cfg.bgColor}`}>
            <div className="text-2xl mb-1">{cfg.icon}</div>
            <div className={`text-lg font-bold ${cfg.color}`}>{platformCounts[key] || 0}</div>
            <div className="text-xs text-gray-500">{cfg.label}s</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search creators by name, topic, or style..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-gray-900/80 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/30"
        />
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-8">
        {/* Platform filter */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-500 self-center mr-1">Platform:</span>
          <button
            onClick={() => setPlatformFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${platformFilter === 'all' ? 'bg-rose-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >All ({CREATORS.length})</button>
          {(Object.entries(PLATFORM_CONFIG) as [Platform, typeof PLATFORM_CONFIG[Platform]][]).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setPlatformFilter(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${platformFilter === key ? 'bg-rose-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
            >{cfg.icon} {cfg.label} ({platformCounts[key] || 0})</button>
          ))}
        </div>

        {/* Focus filter */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-500 self-center mr-1">Focus:</span>
          <button
            onClick={() => setFocusFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${focusFilter === 'all' ? 'bg-rose-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >All</button>
          {(Object.entries(FOCUS_CONFIG) as [Focus, typeof FOCUS_CONFIG[Focus]][]).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setFocusFilter(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${focusFilter === key ? 'bg-rose-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
            >{cfg.label}</button>
          ))}
        </div>

        {/* Sport filter */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-500 self-center mr-1">Sport:</span>
          {['all', 'baseball', 'basketball', 'football', 'hockey', 'pokemon', 'multi'].map(s => (
            <button
              key={s}
              onClick={() => setSportFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${sportFilter === s ? 'bg-rose-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
            >{s === 'all' ? 'All Sports' : `${SPORT_ICONS[s] || ''} ${s.charAt(0).toUpperCase() + s.slice(1)}`}</button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-500 mb-4">
        Showing {filtered.length} of {CREATORS.length} creators
      </div>

      {/* Creator Cards */}
      <div className="space-y-4">
        {filtered.map(creator => {
          const pCfg = PLATFORM_CONFIG[creator.platform];
          return (
            <div key={creator.id} className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Platform Badge */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl border flex items-center justify-center text-xl ${pCfg.bgColor}`}>
                  {pCfg.icon}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-white">{creator.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${pCfg.bgColor} ${pCfg.color}`}>
                      {pCfg.label}
                    </span>
                    {creator.sport.map(s => (
                      <span key={s} className="text-sm" title={s}>{SPORT_ICONS[s] || s}</span>
                    ))}
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-3 leading-relaxed">{creator.description}</p>

                  {/* Focus Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {creator.focus.map(f => (
                      <span key={f} className={`px-2 py-0.5 rounded-full text-xs font-medium ${FOCUS_CONFIG[f].color}`}>
                        {FOCUS_CONFIG[f].label}
                      </span>
                    ))}
                  </div>

                  {/* Stats Row */}
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500 mb-3">
                    <span>{creator.audience}</span>
                    <span>{creator.frequency}</span>
                  </div>

                  {/* Highlight */}
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 mb-3">
                    <div className="text-xs text-gray-500 mb-1">Notable:</div>
                    <div className="text-sm text-gray-300">{creator.highlight}</div>
                  </div>

                  {/* Best For */}
                  <div className="text-xs text-gray-500">
                    <span className="text-rose-400 font-medium">Best for:</span> {creator.bestFor}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <div className="text-4xl mb-3">🔍</div>
          <div className="text-lg font-medium text-gray-400 mb-1">No creators found</div>
          <div className="text-sm">Try adjusting your filters or search term</div>
        </div>
      )}

      {/* Getting Started Section */}
      <section className="mt-12 bg-gradient-to-br from-rose-950/30 to-gray-900 border border-rose-800/30 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Start Your Card Collecting Media Journey</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-semibold text-rose-400 mb-2">New to the Hobby?</h3>
            <ol className="text-sm text-gray-400 space-y-1.5 list-decimal list-inside">
              <li>Start with <strong className="text-gray-300">Leonhart</strong> (Pokemon) or <strong className="text-gray-300">Jabs Family</strong> (sports) for entertainment</li>
              <li>Listen to <strong className="text-gray-300">Card Talk</strong> podcast for weekly hobby news</li>
              <li>Subscribe to <strong className="text-gray-300">Hobby Headlines</strong> newsletter for curated updates</li>
              <li>Bookmark <strong className="text-gray-300">Cardboard Connection</strong> for set checklists</li>
            </ol>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-rose-400 mb-2">Serious Investor?</h3>
            <ol className="text-sm text-gray-400 space-y-1.5 list-decimal list-inside">
              <li>Follow <strong className="text-gray-300">Sports Card Investor</strong> for portfolio frameworks</li>
              <li>Subscribe to <strong className="text-gray-300">The Flip Report</strong> for actionable picks</li>
              <li>Use <strong className="text-gray-300">Card Ladder</strong> for real-time market data</li>
              <li>Listen to <strong className="text-gray-300">Cardboard Prophets</strong> for long-term strategy</li>
            </ol>
          </div>
        </div>
      </section>

      {/* Creator Tips */}
      <section className="mt-8 bg-gray-900/40 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Tips for Following Card Content Creators</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-400">
          <div className="flex gap-3">
            <span className="text-rose-400 font-bold text-lg">1</span>
            <div><strong className="text-gray-300">Diversify your sources.</strong> No single creator has the full picture. Follow a mix of platforms and perspectives for balanced hobby knowledge.</div>
          </div>
          <div className="flex gap-3">
            <span className="text-rose-400 font-bold text-lg">2</span>
            <div><strong className="text-gray-300">Check track records.</strong> Anyone can make predictions. Look for creators who publish transparent results and acknowledge when they are wrong.</div>
          </div>
          <div className="flex gap-3">
            <span className="text-rose-400 font-bold text-lg">3</span>
            <div><strong className="text-gray-300">Watch for conflicts.</strong> Creators who break products may have deals with distributors. Investment pickers may hold positions. Awareness is enough — just factor it in.</div>
          </div>
          <div className="flex gap-3">
            <span className="text-rose-400 font-bold text-lg">4</span>
            <div><strong className="text-gray-300">Start with free content.</strong> Most paid services are not worth it until you are investing $5K+ in cards. Free YouTube and podcast content covers 90% of what you need.</div>
          </div>
          <div className="flex gap-3">
            <span className="text-rose-400 font-bold text-lg">5</span>
            <div><strong className="text-gray-300">Join the communities.</strong> Discord servers, comment sections, and forums are where the real hobby discussions happen. Creators open the door — the community is the value.</div>
          </div>
          <div className="flex gap-3">
            <span className="text-rose-400 font-bold text-lg">6</span>
            <div><strong className="text-gray-300">Do not follow blindly.</strong> Use creator content as research inputs, not buy/sell signals. The best collectors form their own opinions and use media to challenge them.</div>
          </div>
        </div>
      </section>
    </div>
  );
}

'use client';

import { useState } from 'react';

interface Stat {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'flat';
  detail: string;
}

interface SportBreakdown {
  sport: string;
  icon: string;
  marketShare: number;
  avgCardValue: string;
  topPlayer: string;
  hotCategory: string;
  color: string;
}

interface GradingCompany {
  name: string;
  marketShare: number;
  cardsGraded2025: string;
  avgTurnaround: string;
  color: string;
  highlight: string;
}

interface Platform {
  name: string;
  marketShare: number;
  avgFee: string;
  bestFor: string;
  color: string;
}

interface Trend {
  category: string;
  direction: 'up' | 'down' | 'flat';
  magnitude: string;
  reason: string;
  icon: string;
}

interface Prediction {
  id: string;
  prediction: string;
  confidence: 'High' | 'Medium' | 'Low';
  reasoning: string;
  timeframe: string;
}

type TabId = 'overview' | 'sports' | 'grading' | 'platforms' | 'trends' | 'predictions';

const HEADLINE_STATS: Stat[] = [
  { label: 'Global Market Size', value: '$15.2B', change: '+11% YoY', trend: 'up', detail: 'The sports card market continues double-digit growth driven by Gen Z collectors, international expansion, and Fanatics licensing transitions.' },
  { label: 'Cards Graded (2025)', value: '28M+', change: '+18% YoY', trend: 'up', detail: 'PSA alone graded 14M+ cards in 2025. Bulk economy tiers and express services drove volume to all-time highs across all four major companies.' },
  { label: 'Active Collectors (US)', value: '42M', change: '+8% YoY', trend: 'up', detail: 'Estimated active collectors who bought, sold, or opened cards at least once. Driven by TikTok/YouTube content and card show culture revival.' },
  { label: 'Avg Transaction Value', value: '$47', change: '-3% YoY', trend: 'down', detail: 'Average eBay sold listing price declined slightly as more budget-friendly cards entered the market. Premium cards ($500+) actually increased in average value.' },
  { label: 'eBay Card Sales Volume', value: '$4.8B', change: '+14% YoY', trend: 'up', detail: 'eBay remains the dominant marketplace. Their "Top-Rated Plus" program and authentication service drove trust and volume growth.' },
  { label: 'Card Shows (US)', value: '3,200+', change: '+22% YoY', trend: 'up', detail: 'Local and regional card shows exploded in 2025. The National in Chicago drew 150,000+ attendees. Card show culture is the hobby\'s social backbone.' },
];

const SPORT_BREAKDOWN: SportBreakdown[] = [
  { sport: 'Baseball', icon: '⚾', marketShare: 35, avgCardValue: '$52', topPlayer: 'Shohei Ohtani', hotCategory: '1950s Vintage', color: 'bg-red-500' },
  { sport: 'Basketball', icon: '🏀', marketShare: 28, avgCardValue: '$61', topPlayer: 'Victor Wembanyama', hotCategory: '2024 Rookies', color: 'bg-orange-500' },
  { sport: 'Football', icon: '🏈', marketShare: 22, avgCardValue: '$38', topPlayer: 'Caleb Williams', hotCategory: 'QB Rookies', color: 'bg-green-600' },
  { sport: 'Hockey', icon: '🏒', marketShare: 8, avgCardValue: '$29', topPlayer: 'Connor Bedard', hotCategory: 'Young Guns RCs', color: 'bg-blue-500' },
  { sport: 'Soccer', icon: '⚽', marketShare: 4, avgCardValue: '$34', topPlayer: 'Lamine Yamal', hotCategory: 'International Prospects', color: 'bg-purple-500' },
  { sport: 'Other', icon: '🎴', marketShare: 3, avgCardValue: '$22', topPlayer: 'Various', hotCategory: 'UFC/Wrestling/F1', color: 'bg-gray-500' },
];

const GRADING_COMPANIES: GradingCompany[] = [
  { name: 'PSA', marketShare: 52, cardsGraded2025: '14.2M', avgTurnaround: '45 days (Regular)', color: 'bg-red-500', highlight: 'Highest resale premiums. The default choice for most collectors. Gold standard labels.' },
  { name: 'BGS/Beckett', marketShare: 18, cardsGraded2025: '5.1M', avgTurnaround: '60 days (Standard)', color: 'bg-amber-500', highlight: 'Sub-grades (centering, corners, edges, surface) add transparency. BGS 9.5 and Black Labels command strong premiums.' },
  { name: 'CGC', marketShare: 15, cardsGraded2025: '4.3M', avgTurnaround: '30 days (Standard)', color: 'bg-emerald-500', highlight: 'Fastest growing. Sub-grades like BGS. Known for consistency and faster turnaround. Strong in vintage and Pokemon.' },
  { name: 'SGC', marketShare: 12, cardsGraded2025: '3.5M', avgTurnaround: '25 days (Regular)', color: 'bg-sky-500', highlight: 'Fastest turnaround. Beloved tuxedo slab design. Strong value proposition. Growing rapidly in vintage cards.' },
  { name: 'Other', marketShare: 3, cardsGraded2025: '0.9M', avgTurnaround: 'Varies', color: 'bg-gray-500', highlight: 'HGA (modern slabs), ISA, CSG, and niche graders serve specific collector communities.' },
];

const PLATFORMS: Platform[] = [
  { name: 'eBay', marketShare: 48, avgFee: '13.25%', bestFor: 'Highest reach, most liquidity, authentication program', color: 'bg-blue-600' },
  { name: 'COMC', marketShare: 12, avgFee: '20%', bestFor: 'Bulk consignment, hands-off selling, port-to-port shipping', color: 'bg-orange-500' },
  { name: 'Whatnot', marketShare: 10, avgFee: '8.9%', bestFor: 'Live auction streams, entertainment selling, break culture', color: 'bg-purple-500' },
  { name: 'MySlabs', marketShare: 7, avgFee: '8%', bestFor: 'Graded card marketplace, slab-focused community', color: 'bg-emerald-500' },
  { name: 'Facebook Groups', marketShare: 8, avgFee: '~5%', bestFor: 'Zero platform fees (PayPal G&S only), community trust', color: 'bg-sky-500' },
  { name: 'Mercari', marketShare: 6, avgFee: '10%', bestFor: 'Quick listings, buyer-friendly returns, mobile-first', color: 'bg-red-500' },
  { name: 'Card Shows', marketShare: 5, avgFee: '0%', bestFor: 'Zero fees, immediate payment, negotiation, networking', color: 'bg-amber-500' },
  { name: 'Other', marketShare: 4, avgFee: 'Varies', bestFor: 'Goldin (high-end), Alt (direct), LCS (local)', color: 'bg-gray-500' },
];

const TRENDS: Trend[] = [
  { category: 'Vintage Cards (Pre-1980)', direction: 'up', magnitude: '+15-25%', reason: 'Scarcity driving values. Pre-war and 1950s cards hitting record prices at Heritage and REA auctions. Generational wealth transfer fueling demand.', icon: '📈' },
  { category: 'Modern Rookies (2020-2025)', direction: 'flat', magnitude: '0-5%', reason: 'Massive supply meets steady demand. Only elite rookies (Wembanyama, Bedard, Caleb Williams) showing appreciation. The rest tread water.', icon: '➡️' },
  { category: 'Junk Wax Era (1987-1993)', direction: 'down', magnitude: '-5-10%', reason: 'Overproduced commons continue declining. BUT key rookies (1986 Fleer Jordan, 1989 Upper Deck Griffey) remain strong. It\'s a two-tier market.', icon: '📉' },
  { category: 'Sealed Wax Products', direction: 'up', magnitude: '+10-20%', reason: 'Sealed hobby boxes from 2018-2022 appreciating as supply dries up. The "rip or hold" calculus favoring hold for many products.', icon: '📈' },
  { category: 'Graded Gem Mint (PSA 10)', direction: 'up', magnitude: '+8-15%', reason: 'The premium gap between PSA 9 and PSA 10 widening. Collectors paying more for perfection. Population reports driving scarcity awareness.', icon: '📈' },
  { category: 'Auto/Patch Cards', direction: 'flat', magnitude: '-2-5%', reason: 'Market saturated with manufactured scarcity. On-card autos hold value; sticker autos declining. Patch windows over-produced.', icon: '➡️' },
  { category: 'International Markets', direction: 'up', magnitude: '+20-30%', reason: 'Japan (Ohtani), Europe (soccer/hockey), Australia — international collector bases expanding rapidly. Cross-border eBay sales up significantly.', icon: '📈' },
  { category: 'Pokemon TCG', direction: 'flat', magnitude: '0-5%', reason: 'Post-pandemic normalization. Vintage (1st Edition Base Set) strong. Modern sets have oversupply issues. Japanese cards gaining premium.', icon: '➡️' },
  { category: 'Digital/Hybrid Collectibles', direction: 'down', magnitude: '-15-30%', reason: 'Physical cards winning decisively. Collectors prefer tangible assets. Digital platforms struggling with retention and perceived value.', icon: '📉' },
  { category: 'Card Show Attendance', direction: 'up', magnitude: '+22%', reason: 'The social experience drives the hobby. Local shows, regional events, and The National all setting records. Shows are the hobby\'s growth engine.', icon: '📈' },
];

const PREDICTIONS: Prediction[] = [
  { id: 'p1', prediction: 'Fanatics will launch NFL and NBA licensed cards by Q3 2026, disrupting the current Panini monopoly', confidence: 'High', reasoning: 'Licensing deals confirmed. Fanatics has invested billions in card infrastructure. The transition will create short-term market volatility as collectors adjust to new products.', timeframe: '2026' },
  { id: 'p2', prediction: 'PSA will grade 20M+ cards in 2026, setting a new annual record', confidence: 'Medium', reasoning: 'Economy tier demand shows no signs of slowing. International grading expansion (Japan, UK offices) will add volume. AI pre-screening may speed throughput.', timeframe: '2026' },
  { id: 'p3', prediction: 'A T206 Honus Wagner will sell for $10M+ at auction', confidence: 'Medium', reasoning: 'The current record is $7.25M. With inflation, wealth concentration, and trophy asset demand, the next high-grade Wagner to hit auction will likely break 8 figures.', timeframe: '2026-2027' },
  { id: 'p4', prediction: 'Victor Wembanyama rookie cards will surpass LeBron RC prices within 5 years', confidence: 'Low', reasoning: 'Depends entirely on championship success. The physical gifts and international appeal are there. If he wins an MVP, his 2023-24 Prizm Silver will be a $50K+ card.', timeframe: '2028-2030' },
  { id: 'p5', prediction: 'Card show attendance will double by 2028 compared to 2023 levels', confidence: 'High', reasoning: 'The experiential economy is booming. Card shows combine social, shopping, and entertainment. Younger collectors especially value in-person experiences over online transactions.', timeframe: '2028' },
  { id: 'p6', prediction: 'AI grading assistance will be adopted by at least 2 major grading companies', confidence: 'High', reasoning: 'Computer vision for centering, surface defects, and corner assessment is already viable. It speeds up throughput and improves consistency. PSA and CGC are most likely to adopt first.', timeframe: '2026-2027' },
  { id: 'p7', prediction: 'The average age of new card collectors will drop below 25 by 2027', confidence: 'Medium', reasoning: 'TikTok and YouTube card content is attracting teen and college-age collectors. Pack opening videos are the gateway drug. Affordable entry points ($5-20 packs) lower barriers.', timeframe: '2027' },
  { id: 'p8', prediction: 'International card markets (Japan, UK, Australia) will grow to 25%+ of global volume', confidence: 'Medium', reasoning: 'Ohtani drives Japan. Soccer drives Europe. Cricket could open India/Australia. Cross-border commerce platforms make it easier than ever to buy globally.', timeframe: '2028' },
];

const KEY_MOMENTS = [
  { date: 'Jan 2025', event: 'Fanatics completes Topps integration, announces new product lines for 2026 licensing transition' },
  { date: 'Feb 2025', event: 'PSA announces grading 50 millionth card lifetime, opens expanded Japan office' },
  { date: 'Mar 2025', event: '1952 Topps Mickey Mantle PSA 9 sells for $4.1M at Heritage Auctions' },
  { date: 'Apr 2025', event: '2025 NFL Draft drives Cam Ward and Shedeur Sanders RC prices to record pre-draft levels' },
  { date: 'May 2025', event: 'CGC overtakes BGS in monthly grading volume for first time' },
  { date: 'Jun 2025', event: 'eBay launches "Vault 2.0" with enhanced authentication for cards over $250' },
  { date: 'Jul 2025', event: 'The National card show in Chicago draws estimated 160,000 attendees — largest ever' },
  { date: 'Aug 2025', event: 'Whatnot surpasses $1B in annual GMV, live card auctions become mainstream' },
  { date: 'Sep 2025', event: 'Victor Wembanyama Prizm Silver PSA 10 sells for $18,500 — highest modern basketball RC' },
  { date: 'Oct 2025', event: 'Panini announces final NFL and NBA licensed products before Fanatics transition' },
  { date: 'Nov 2025', event: 'SGC introduces new "Tuxedo Black" premium slab, turnaround times drop to 15 days' },
  { date: 'Dec 2025', event: 'Year-end: card market up 11% overall, vintage leads gains, modern steady, digital declining' },
];

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'sports', label: 'By Sport', icon: '🏆' },
  { id: 'grading', label: 'Grading', icon: '🏅' },
  { id: 'platforms', label: 'Platforms', icon: '🛒' },
  { id: 'trends', label: 'Trends', icon: '📈' },
  { id: 'predictions', label: 'Predictions', icon: '🔮' },
];

export default function HobbyReportClient() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-8">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <span className="mr-1.5">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Headline Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {HEADLINE_STATS.map((stat, i) => (
              <div key={i} className="bg-gray-900 rounded-lg p-5 border border-gray-800">
                <div className="text-gray-400 text-sm mb-1">{stat.label}</div>
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-2xl font-bold text-white">{stat.value}</span>
                  <span className={`text-sm font-medium ${
                    stat.trend === 'up' ? 'text-emerald-400' : stat.trend === 'down' ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {stat.trend === 'up' ? '▲' : stat.trend === 'down' ? '▼' : '—'} {stat.change}
                  </span>
                </div>
                <p className="text-gray-500 text-xs leading-relaxed">{stat.detail}</p>
              </div>
            ))}
          </div>

          {/* Key Moments Timeline */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Key Moments of 2025</h2>
            <div className="space-y-3">
              {KEY_MOMENTS.map((moment, i) => (
                <div key={i} className="flex gap-4 bg-gray-900 rounded-lg p-4 border border-gray-800">
                  <div className="text-blue-400 font-mono text-sm whitespace-nowrap min-w-[70px]">{moment.date}</div>
                  <div className="text-gray-300 text-sm">{moment.event}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Demographics */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Collector Demographics (2025 Est.)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Age 18-24', pct: 18, note: 'Fastest growing segment. TikTok/YouTube entry point.' },
                { label: 'Age 25-34', pct: 28, note: 'Largest segment. Disposable income meets nostalgia.' },
                { label: 'Age 35-44', pct: 24, note: 'Peak spending power. Premium cards and vintage focus.' },
                { label: 'Age 45-54', pct: 17, note: 'Re-entering hobby. Childhood collections plus new purchases.' },
                { label: 'Age 55+', pct: 13, note: 'Vintage specialists. Estate planning considerations.' },
              ].map((demo, i) => (
                <div key={i} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-medium">{demo.label}</span>
                    <span className="text-blue-400 font-bold">{demo.pct}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
                    <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${demo.pct}%` }} />
                  </div>
                  <p className="text-gray-500 text-xs">{demo.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sports Tab */}
      {activeTab === 'sports' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Market Share by Sport</h2>
          {/* Visual bar chart */}
          <div className="space-y-4">
            {SPORT_BREAKDOWN.map((sport, i) => (
              <div key={i} className="bg-gray-900 rounded-lg p-5 border border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{sport.icon}</span>
                    <div>
                      <span className="text-white font-bold text-lg">{sport.sport}</span>
                      <span className="text-gray-400 text-sm ml-2">Avg card value: {sport.avgCardValue}</span>
                    </div>
                  </div>
                  <span className="text-white font-bold text-xl">{sport.marketShare}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3 mb-3">
                  <div className={`${sport.color} h-3 rounded-full transition-all`} style={{ width: `${sport.marketShare}%` }} />
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div><span className="text-gray-500">Top Player:</span> <span className="text-white">{sport.topPlayer}</span></div>
                  <div><span className="text-gray-500">Hot Category:</span> <span className="text-amber-400">{sport.hotCategory}</span></div>
                </div>
              </div>
            ))}
          </div>

          {/* Sport insights */}
          <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
            <h3 className="text-lg font-bold text-white mb-3">Sport Insights</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Baseball remains the hobby&apos;s foundation — vintage dominance and Ohtani&apos;s global appeal drive market leadership</li>
              <li>Basketball closed the gap significantly thanks to Wembanyama&apos;s historic rookie season and international demand</li>
              <li>Football is the most seasonal — values spike 40-60% during NFL Draft and playoff windows</li>
              <li>Hockey&apos;s Young Guns program remains the most collected RC product. Bedard driving renewed interest</li>
              <li>Soccer is the fastest percentage growth sport — 2026 World Cup in North America will accelerate this</li>
            </ul>
          </div>
        </div>
      )}

      {/* Grading Tab */}
      {activeTab === 'grading' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Grading Company Market Share (2025)</h2>
          <div className="space-y-4">
            {GRADING_COMPANIES.map((company, i) => (
              <div key={i} className="bg-gray-900 rounded-lg p-5 border border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-white font-bold text-lg">{company.name}</span>
                    <span className="text-gray-400 text-sm ml-3">Cards graded (2025): {company.cardsGraded2025}</span>
                  </div>
                  <span className="text-white font-bold text-xl">{company.marketShare}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3 mb-3">
                  <div className={`${company.color} h-3 rounded-full transition-all`} style={{ width: `${company.marketShare}%` }} />
                </div>
                <div className="flex flex-wrap gap-4 text-sm mb-2">
                  <div><span className="text-gray-500">Avg Turnaround:</span> <span className="text-white">{company.avgTurnaround}</span></div>
                </div>
                <p className="text-gray-400 text-sm">{company.highlight}</p>
              </div>
            ))}
          </div>

          {/* Grading insights */}
          <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
            <h3 className="text-lg font-bold text-white mb-3">Grading Trends</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>PSA&apos;s economy tier ($18/card at 150+ volume) drives most of the grading volume growth</li>
              <li>CGC is the fastest-growing grading company — consistency and speed attracting defectors from BGS</li>
              <li>SGC&apos;s tuxedo slab has a cult following, especially among vintage collectors and aesthetics-focused hobbyists</li>
              <li>BGS Black Labels (all 10 sub-grades) command 3-5x premium over standard BGS 10 Pristine</li>
              <li>AI-assisted grading pre-screening is coming — expect faster turnarounds industry-wide by 2027</li>
              <li>International grading demand (Japan, UK, Germany) growing 30%+ annually</li>
            </ul>
          </div>
        </div>
      )}

      {/* Platforms Tab */}
      {activeTab === 'platforms' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Selling Platform Market Share (2025)</h2>
          <div className="space-y-4">
            {PLATFORMS.map((platform, i) => (
              <div key={i} className="bg-gray-900 rounded-lg p-5 border border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-bold text-lg">{platform.name}</span>
                  <span className="text-white font-bold text-xl">{platform.marketShare}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3 mb-3">
                  <div className={`${platform.color} h-3 rounded-full transition-all`} style={{ width: `${platform.marketShare}%` }} />
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div><span className="text-gray-500">Avg Fee:</span> <span className="text-amber-400">{platform.avgFee}</span></div>
                  <div><span className="text-gray-500">Best For:</span> <span className="text-gray-300">{platform.bestFor}</span></div>
                </div>
              </div>
            ))}
          </div>

          {/* Platform tips */}
          <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
            <h3 className="text-lg font-bold text-white mb-3">Platform Strategy Tips</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><strong className="text-white">High-value singles ($100+):</strong> eBay with Best Offer — maximum exposure and buyer protection</li>
              <li><strong className="text-white">Bulk low-value ($1-20):</strong> COMC or lot auctions on eBay — minimize per-card effort</li>
              <li><strong className="text-white">Live entertainment selling:</strong> Whatnot — auction format drives impulse buying and engagement</li>
              <li><strong className="text-white">Zero fees:</strong> Facebook groups with PayPal G&amp;S — best margin but requires community trust</li>
              <li><strong className="text-white">Local deals:</strong> Card shows — negotiate face to face, get paid immediately, build relationships</li>
            </ul>
          </div>
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Market Trends (2025-2026)</h2>
          <div className="space-y-3">
            {TRENDS.map((trend, i) => (
              <div key={i} className="bg-gray-900 rounded-lg p-5 border border-gray-800">
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{trend.icon}</span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="text-white font-bold">{trend.category}</span>
                      <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                        trend.direction === 'up' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        trend.direction === 'down' ? 'bg-red-950 text-red-400 border border-red-800' :
                        'bg-gray-800 text-gray-400 border border-gray-700'
                      }`}>
                        {trend.magnitude}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{trend.reason}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trend summary */}
          <div className="bg-gray-900 rounded-lg p-5 border border-amber-800/40">
            <h3 className="text-lg font-bold text-amber-400 mb-3">Key Takeaway</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              The card market is bifurcating: vintage and true scarcity are winning, while mass-produced modern cards face headwinds. Smart collectors are focusing on quality over quantity — PSA 10 premiums are expanding, sealed wax is appreciating, and card show culture is driving community engagement. The Fanatics licensing transition in 2026 will be the most significant industry event in decades.
            </p>
          </div>
        </div>
      )}

      {/* Predictions Tab */}
      {activeTab === 'predictions' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">2026 Predictions</h2>
          <div className="space-y-4">
            {PREDICTIONS.map(pred => (
              <div key={pred.id} className="bg-gray-900 rounded-lg p-5 border border-gray-800">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    pred.confidence === 'High' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    pred.confidence === 'Medium' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-red-950 text-red-400 border border-red-800'
                  }`}>
                    {pred.confidence} Confidence
                  </span>
                  <span className="text-gray-500 text-xs">{pred.timeframe}</span>
                </div>
                <p className="text-white font-medium mb-2">{pred.prediction}</p>
                <p className="text-gray-400 text-sm">{pred.reasoning}</p>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-500 text-xs">
              These predictions are based on market analysis, industry trends, and historical patterns. They are not financial advice. Card values can go up or down. Always do your own research before making collecting or investment decisions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

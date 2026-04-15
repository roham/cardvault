'use client';

import { useState } from 'react';

// ── Correlation Data ───────────────────────────────────────────────────────
type Category = 'sports-events' | 'player-events' | 'market-forces' | 'media-culture' | 'product-releases';

interface Correlation {
  id: string;
  name: string;
  category: Category;
  impact: number; // 1-10
  direction: 'up' | 'down' | 'mixed';
  typicalChange: string;
  duration: string;
  timing: string;
  description: string;
  example: string;
  actionableTip: string;
  affectedCards: string;
  sports: string[];
}

const correlations: Correlation[] = [
  // Sports Events
  {
    id: 'draft', name: 'Draft Night', category: 'sports-events', impact: 10, direction: 'up',
    typicalChange: '+200-500%', duration: '2-4 weeks peak', timing: 'NFL: late April, NBA: late June',
    description: 'The single biggest price catalyst in the hobby. Top draft picks see their pre-draft card prices explode overnight as collectors rush to buy the next franchise player.',
    example: 'Caleb Williams 2024 Bowman Chrome went from $15 pre-draft to $80+ on draft night when picked #1 by the Bears.',
    actionableTip: 'Buy prospects 3-6 months before the draft. Sell into the draft night spike. Prices typically settle 30-50% within 2 weeks.',
    affectedCards: 'Bowman 1st, Bowman Chrome, Prizm Draft, Contenders Draft', sports: ['football', 'basketball'],
  },
  {
    id: 'championship', name: 'Championship Win', category: 'sports-events', impact: 9, direction: 'up',
    typicalChange: '+50-150%', duration: '1-3 months', timing: 'SB: Feb, NBA Finals: Jun, WS: Oct, Cup: Jun',
    description: 'Championship victories create massive demand for the winning team\'s star players. The MVP of the finals/series sees the biggest spike.',
    example: 'Patrick Mahomes cards spiked 80% after Super Bowl LVII. His Prizm RC went from $350 to $650 within days.',
    actionableTip: 'Buy during the conference finals/semifinals when a team looks strong but hasn\'t won yet. The championship price-in happens fast.',
    affectedCards: 'Rookie cards, key parallels, autographs of franchise players', sports: ['football', 'basketball', 'baseball', 'hockey'],
  },
  {
    id: 'allstar', name: 'All-Star / Pro Bowl Selection', category: 'sports-events', impact: 5, direction: 'up',
    typicalChange: '+15-40%', duration: '1-2 weeks', timing: 'Varies by sport, typically mid-season',
    description: 'First-time All-Star selections have the biggest impact, especially for young players. The market prices in "arrival" status.',
    example: 'Tyrese Haliburton\'s first All-Star selection in 2024 pushed his Prizm RC from $60 to $95.',
    actionableTip: 'Identify likely first-time All-Stars before announcements. The selection is often predictable from stats and narrative.',
    affectedCards: 'Prizm, Optic, Select RCs and key inserts', sports: ['football', 'basketball', 'baseball', 'hockey'],
  },
  {
    id: 'playoffs', name: 'Playoff Run', category: 'sports-events', impact: 7, direction: 'up',
    typicalChange: '+25-80%', duration: 'Duration of run', timing: 'Post-season schedule',
    description: 'Deep playoff runs create sustained demand. Each round eliminated increases scarcity pressure as more collectors pile in.',
    example: 'Nikola Jokic cards climbed steadily through the 2023 playoffs, peaking at +120% after winning the title and Finals MVP.',
    actionableTip: 'Buy when a team clinches a playoff spot. Sell in the conference finals if your team loses. Hold through championship if they win.',
    affectedCards: 'Franchise player RCs, team star parallels', sports: ['football', 'basketball', 'baseball', 'hockey'],
  },

  // Player Events
  {
    id: 'injury', name: 'Major Player Injury', category: 'player-events', impact: 8, direction: 'down',
    typicalChange: '-20-40%', duration: '1-6 months', timing: 'Unpredictable',
    description: 'Serious injuries (ACL, Achilles, Tommy John) cause immediate sell-offs. The severity of the drop depends on injury type, player age, and career trajectory.',
    example: 'Tua Tagovailoa\'s concussion concerns dropped his cards 35% in 2024. Joe Burrow\'s wrist injury caused a 30% dip before recovering.',
    actionableTip: 'Post-injury dips are often the best buying opportunity in the hobby. Young stars (under 27) with recoverable injuries typically bounce back to pre-injury prices within 12-18 months.',
    affectedCards: 'All cards of the injured player, especially RCs', sports: ['football', 'basketball', 'baseball', 'hockey'],
  },
  {
    id: 'mvp', name: 'MVP / Major Award', category: 'player-events', impact: 8, direction: 'up',
    typicalChange: '+40-100%', duration: '2-4 weeks', timing: 'End of season / awards ceremonies',
    description: 'MVP awards cement a player\'s legacy and drive both collector and investor demand. First-time MVPs see the biggest spikes.',
    example: 'Shohei Ohtani\'s 2023 AL MVP (unanimous) pushed his Bowman Chrome RC from $800 to $1,500.',
    actionableTip: 'Track award race leaders mid-season. Buy frontrunners early. The announcement spike is real but short-lived — sell within 2 weeks for max profit.',
    affectedCards: 'Rookie cards, flagship parallels, autographs', sports: ['football', 'basketball', 'baseball', 'hockey'],
  },
  {
    id: 'retirement', name: 'Player Retirement', category: 'player-events', impact: 6, direction: 'mixed',
    typicalChange: '+10-30% or -20%', duration: '1-3 months', timing: 'Off-season typically',
    description: 'HOF-caliber retirements create nostalgia demand (+). Mid-career unexpected retirements can cause drops (-). The effect depends heavily on the player\'s legacy.',
    example: 'Tom Brady\'s retirement announcement spiked his RCs 25%. His 2000 Bowman Chrome RC is now a top-5 investment card.',
    actionableTip: 'Buy HOF-lock players early in their final season when retirement rumors start. Sell into the announcement spike, then buy back 3 months later when prices settle.',
    affectedCards: 'Vintage RCs, graded high-end copies', sports: ['football', 'basketball', 'baseball', 'hockey'],
  },
  {
    id: 'trade', name: 'Player Trade / Free Agency', category: 'player-events', impact: 6, direction: 'mixed',
    typicalChange: '+/-15-50%', duration: '1-2 weeks', timing: 'Trade deadline, off-season',
    description: 'Trades to contenders boost prices. Trades to rebuilding teams drop prices. The market reacts to perceived championship odds.',
    example: 'Davante Adams\' trade to the Jets in 2024 initially boosted cards 20%, then settled back when the team struggled.',
    actionableTip: 'Buy when a star gets traded to a contender — the price bump is real if the team is a championship threat. Avoid buying into hype for bad teams.',
    affectedCards: 'Player RCs, team-specific parallels', sports: ['football', 'basketball', 'baseball', 'hockey'],
  },
  {
    id: 'milestone', name: 'Career Milestone', category: 'player-events', impact: 7, direction: 'up',
    typicalChange: '+20-60%', duration: '1-2 weeks', timing: 'When milestone is reached',
    description: 'Major milestones (3,000 hits, 500 HRs, 40,000 points, 200 wins) create demand spikes, especially for vintage cards.',
    example: 'Albert Pujols\' 700th HR in 2022 pushed his 2001 Bowman Chrome RC from $1,200 to $2,000.',
    actionableTip: 'Track players approaching milestones and buy 1-2 months before they reach it. The market prices in milestones gradually, but the actual achievement still creates a pop.',
    affectedCards: 'Rookie cards, early career cards, graded premium copies', sports: ['baseball', 'basketball', 'football', 'hockey'],
  },

  // Market Forces
  {
    id: 'offseason', name: 'Off-Season Lull', category: 'market-forces', impact: 6, direction: 'down',
    typicalChange: '-15-30%', duration: '2-3 months', timing: 'Sport-specific off-season',
    description: 'When a sport is out of season, demand for those cards drops. This is the best buying window for patient collectors.',
    example: 'Football cards are 20-30% cheaper in March-April compared to September-November. Baseball cards dip in December-January.',
    actionableTip: 'Build your football collection in spring. Build your basketball collection in late summer. Build your baseball collection in winter. Sell into the season.',
    affectedCards: 'All cards of that sport', sports: ['football', 'basketball', 'baseball', 'hockey'],
  },
  {
    id: 'inflation', name: 'Economic Conditions', category: 'market-forces', impact: 5, direction: 'mixed',
    typicalChange: '+/-10-25%', duration: 'Months to years', timing: 'Macro economic cycles',
    description: 'During recessions, discretionary spending on cards drops. During economic booms, collector spending increases. High-end cards are more resilient than mid-range.',
    example: 'The 2020-2021 stimulus era saw card prices double or triple across the board. The 2022-2023 rate hike cycle caused a 30-50% market correction.',
    actionableTip: 'Buy during economic uncertainty when sellers are desperate. High-end graded vintage cards are the most recession-resistant category.',
    affectedCards: 'All segments, mid-range most volatile', sports: ['football', 'basketball', 'baseball', 'hockey'],
  },
  {
    id: 'grading-backlog', name: 'Grading Company Backlog', category: 'market-forces', impact: 4, direction: 'up',
    typicalChange: '+5-15%', duration: 'Months', timing: 'When backlogs peak',
    description: 'Large grading backlogs reduce the supply of newly graded cards entering the market, pushing up prices for existing graded inventory.',
    example: 'PSA\'s 2021 submission pause (18-month backlog) pushed PSA 10 premiums to all-time highs as supply dried up.',
    actionableTip: 'When grading backlogs are high, existing graded cards become more valuable. Submit cards during low-backlog periods for faster returns.',
    affectedCards: 'All graded cards, especially PSA 10 and BGS 9.5', sports: ['football', 'basketball', 'baseball', 'hockey'],
  },
  {
    id: 'product-release', name: 'New Product Release', category: 'market-forces', impact: 6, direction: 'down',
    typicalChange: '-10-25% on older products', duration: '2-4 weeks', timing: 'Product release dates',
    description: 'New product releases pull attention and money away from older products. The shiny new product draws collectors from the previous release.',
    example: 'When 2024 Prizm Football released, 2023 Prizm Football prices dropped 15% as collectors moved to the new product.',
    actionableTip: 'If you want cards from last year\'s product, buy them right after the new version releases — sellers are dumping to fund new purchases.',
    affectedCards: 'Previous year\'s flagship products', sports: ['football', 'basketball', 'baseball', 'hockey'],
  },

  // Media & Culture
  {
    id: 'viral', name: 'Viral Moment / Highlight', category: 'media-culture', impact: 7, direction: 'up',
    typicalChange: '+30-200%', duration: '1-2 weeks', timing: 'Unpredictable',
    description: 'Viral sports moments create immediate demand spikes. The effect is amplified by social media sharing and mainstream coverage.',
    example: 'Steph Curry\'s 62-point game created a 50% spike in his Prizm RC. Shohei Ohtani going 2-way in the WBC caused a 100% jump.',
    actionableTip: 'Viral spikes are short-lived. If you own the card, sell within 48-72 hours. If you want to buy, wait 2 weeks for the price to settle back down.',
    affectedCards: 'Flagship RCs and popular parallels', sports: ['football', 'basketball', 'baseball', 'hockey'],
  },
  {
    id: 'celebrity', name: 'Celebrity / Pop Culture Connection', category: 'media-culture', impact: 5, direction: 'up',
    typicalChange: '+20-80%', duration: '1-4 weeks', timing: 'When connection becomes public',
    description: 'Celebrity connections bring non-collector attention and money into the hobby. The Travis Kelce-Taylor Swift effect is the prime example.',
    example: 'Travis Kelce\'s Prizm RC went from $35 to $120+ after his relationship with Taylor Swift went public in 2023.',
    actionableTip: 'These price increases can be sticky if the celebrity connection persists. Kelce cards have stayed elevated because the relationship continues.',
    affectedCards: 'Player RCs, mainstream-friendly products', sports: ['football', 'basketball', 'baseball'],
  },
  {
    id: 'documentary', name: 'Documentary / Film Release', category: 'media-culture', impact: 4, direction: 'up',
    typicalChange: '+15-40%', duration: '2-4 weeks', timing: 'Release date',
    description: 'Documentaries about athletes create renewed interest in their cards. The Netflix/ESPN effect is real for legacy players.',
    example: 'The Last Dance (2020) pushed Michael Jordan\'s 1986 Fleer RC from $20K to $50K+ as millions rediscovered his legacy.',
    actionableTip: 'When a major documentary is announced, buy the featured player\'s cards BEFORE release. The price spike happens on release day.',
    affectedCards: 'Vintage RCs of featured player, flagship modern reprints', sports: ['football', 'basketball', 'baseball', 'hockey'],
  },
  {
    id: 'tiktok', name: 'TikTok / YouTube Break Trend', category: 'media-culture', impact: 5, direction: 'up',
    typicalChange: '+20-60%', duration: '1-2 weeks', timing: 'When video goes viral',
    description: 'Viral box break videos on TikTok and YouTube drive demand for the specific products opened. A big hit caught on camera creates product-wide demand.',
    example: 'Multiple viral Bowman Chrome 1st breaks in 2023 drove hobby box prices from $250 to $400+ in weeks.',
    actionableTip: 'Watch what products popular breakers are opening. If a product starts trending on TikTok, buy sealed product quickly before prices spike.',
    affectedCards: 'Sealed product prices, specific hit cards featured in videos', sports: ['football', 'basketball', 'baseball'],
  },

  // Product & Season
  {
    id: 'holiday', name: 'Holiday Season', category: 'product-releases', impact: 5, direction: 'up',
    typicalChange: '+10-25%', duration: 'Nov-Dec', timing: 'Thanksgiving through Christmas',
    description: 'Gift-giving season increases demand for sealed products and mid-range cards. Retail products especially see demand spikes.',
    example: 'Retail hobby boxes at Target and Walmart sell out faster in December. Sealed product premiums increase 15-20%.',
    actionableTip: 'Stock up on sealed products in September-October before holiday demand kicks in. Sell sealed products in late November.',
    affectedCards: 'Sealed retail products, gift-friendly price range ($20-$100)', sports: ['football', 'basketball', 'baseball', 'hockey'],
  },
  {
    id: 'hof', name: 'Hall of Fame Induction', category: 'player-events', impact: 7, direction: 'up',
    typicalChange: '+30-80%', duration: '1-3 months', timing: 'HOF announcement + ceremony',
    description: 'HOF induction is the ultimate career validation. Two price spikes: (1) when announced, (2) during ceremony. Vintage RCs see the biggest increases.',
    example: 'Derek Jeter\'s 1993 SP RC went from $500 to $900 around his 2020 HOF induction. Adrian Beltre saw similar spikes in 2024.',
    actionableTip: 'Buy likely HOF candidates 1-2 years before eligibility. The announcement is more impactful than the ceremony itself.',
    affectedCards: 'Rookie cards, especially graded vintage copies', sports: ['football', 'basketball', 'baseball', 'hockey'],
  },
  {
    id: 'rookie-debut', name: 'Rookie Regular Season Debut', category: 'player-events', impact: 6, direction: 'mixed',
    typicalChange: '+/-20-50%', duration: '1-4 weeks', timing: 'Season opener',
    description: 'A strong debut validates the hype and pushes prices up. A poor debut or injury in the first game can crash prices. The market is extremely reactive to early performance.',
    example: 'Victor Wembanyama\'s strong NBA debut in 2023 pushed his Prizm RC up 40% in the first week. Anthony Richardson\'s injury dropped his cards 30%.',
    actionableTip: 'Sell into pre-season hype if you want to lock in profits. Buy on debut-day dips if you believe in the long-term talent.',
    affectedCards: 'Current year RCs, especially Prizm, Optic, Bowman Chrome', sports: ['football', 'basketball', 'baseball', 'hockey'],
  },
];

const categories: { key: Category; label: string; icon: string; color: string }[] = [
  { key: 'sports-events', label: 'Sports Events', icon: '🏆', color: 'bg-amber-600' },
  { key: 'player-events', label: 'Player Events', icon: '⭐', color: 'bg-blue-600' },
  { key: 'market-forces', label: 'Market Forces', icon: '📊', color: 'bg-emerald-600' },
  { key: 'media-culture', label: 'Media & Culture', icon: '📱', color: 'bg-purple-600' },
  { key: 'product-releases', label: 'Product & Season', icon: '📦', color: 'bg-rose-600' },
];

const impactColor = (n: number): string => {
  if (n >= 8) return 'text-red-400 bg-red-950/40 border-red-800/40';
  if (n >= 6) return 'text-orange-400 bg-orange-950/40 border-orange-800/40';
  if (n >= 4) return 'text-yellow-400 bg-yellow-950/40 border-yellow-800/40';
  return 'text-green-400 bg-green-950/40 border-green-800/40';
};

const directionIcon = (d: string) => d === 'up' ? '📈' : d === 'down' ? '📉' : '↕️';

export default function MarketCorrelationsClient() {
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'impact' | 'name'>('impact');

  const filtered = correlations
    .filter(c => activeCategory === 'all' || c.category === activeCategory)
    .sort((a, b) => sortBy === 'impact' ? b.impact - a.impact : a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
      {/* Top stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{correlations.length}</div>
          <div className="text-xs text-gray-500">Correlations</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{correlations.filter(c => c.impact >= 8).length}</div>
          <div className="text-xs text-gray-500">High Impact</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{correlations.filter(c => c.direction === 'up').length}</div>
          <div className="text-xs text-gray-500">Price Increases</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-rose-400">{correlations.filter(c => c.direction === 'down').length}</div>
          <div className="text-xs text-gray-500">Price Decreases</div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeCategory === 'all' ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
        >
          All ({correlations.length})
        </button>
        {categories.map(cat => {
          const count = correlations.filter(c => c.category === cat.key).length;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeCategory === cat.key ? `${cat.color} text-white` : 'bg-gray-800 text-gray-400 hover:text-white'}`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label} ({count})</span>
            </button>
          );
        })}
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-500">Sort:</span>
        <button onClick={() => setSortBy('impact')} className={`px-3 py-1 rounded-lg ${sortBy === 'impact' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}>
          Impact
        </button>
        <button onClick={() => setSortBy('name')} className={`px-3 py-1 rounded-lg ${sortBy === 'name' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}>
          A-Z
        </button>
      </div>

      {/* Correlation cards */}
      <div className="space-y-3">
        {filtered.map(c => {
          const isExpanded = expandedId === c.id;
          const cat = categories.find(cat => cat.key === c.category);
          return (
            <div key={c.id} className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedId(isExpanded ? null : c.id)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-800/30 transition-colors"
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold border ${impactColor(c.impact)}`}>
                  {c.impact}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{c.name}</span>
                    <span className="text-lg">{directionIcon(c.direction)}</span>
                  </div>
                  <div className="text-xs text-gray-500">{c.typicalChange} &middot; {c.duration}</div>
                </div>
                <div className="hidden sm:flex items-center gap-1">
                  {c.sports.map(s => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 capitalize">{s.slice(0, 3)}</span>
                  ))}
                </div>
                <span className={`text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>&#9662;</span>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-4 border-t border-gray-800 pt-4">
                  <p className="text-sm text-gray-300">{c.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Real Example</div>
                      <div className="text-sm text-gray-300">{c.example}</div>
                    </div>
                    <div className="bg-violet-950/30 border border-violet-800/30 rounded-lg p-3">
                      <div className="text-xs text-violet-400 mb-1">Actionable Tip</div>
                      <div className="text-sm text-violet-200">{c.actionableTip}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                    <span>Timing: <span className="text-gray-300">{c.timing}</span></span>
                    <span>Affected: <span className="text-gray-300">{c.affectedCards}</span></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Category:</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${cat?.color} text-white`}>{cat?.icon} {cat?.label}</span>
                  </div>

                  {/* Impact bar */}
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Impact Score: {c.impact}/10</div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${c.impact >= 8 ? 'bg-red-500' : c.impact >= 6 ? 'bg-orange-500' : c.impact >= 4 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${c.impact * 10}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

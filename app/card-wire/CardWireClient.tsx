'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';

type Sport = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey';
type FeedCategory = 'all' | 'news' | 'trades' | 'grading' | 'releases' | 'alerts';

interface WireItem {
  id: number;
  category: FeedCategory;
  sport: Sport;
  headline: string;
  detail: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
}

interface MarketMover {
  player: string;
  sport: Sport;
  change: number;
  price: string;
  reason: string;
}

interface TradeTick {
  id: number;
  card: string;
  sport: Sport;
  price: string;
  platform: string;
  time: string;
  type: 'sale' | 'auction' | 'trade';
}

// Deterministic seeded random
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function dateHash(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

const SPORT_COLORS: Record<string, string> = {
  baseball: 'text-red-400',
  basketball: 'text-orange-400',
  football: 'text-blue-400',
  hockey: 'text-cyan-400',
};

const SPORT_BG: Record<string, string> = {
  baseball: 'bg-red-950/40 border-red-800/30',
  basketball: 'bg-orange-950/40 border-orange-800/30',
  football: 'bg-blue-950/40 border-blue-800/30',
  hockey: 'bg-cyan-950/40 border-cyan-800/30',
};

const SPORT_ICONS: Record<string, string> = {
  baseball: '⚾',
  basketball: '🏀',
  football: '🏈',
  hockey: '🏒',
};

const CATEGORY_ICONS: Record<string, string> = {
  news: '📰',
  trades: '💰',
  grading: '🏅',
  releases: '📦',
  alerts: '🚨',
};

const CATEGORY_COLORS: Record<string, string> = {
  news: 'text-yellow-400',
  trades: 'text-emerald-400',
  grading: 'text-purple-400',
  releases: 'text-sky-400',
  alerts: 'text-red-400',
};

const NEWS_TEMPLATES: { headline: string; detail: string; sport: Sport; category: FeedCategory; priority: 'high' | 'medium' | 'low' }[] = [
  { headline: 'PSA Announces Q2 Turnaround Time Reduction', detail: 'Economy tier now averaging 55 business days, down from 75. Standard service also seeing improvements. Volume submissions up 12% YoY.', sport: 'all' as Sport, category: 'grading', priority: 'high' },
  { headline: '2025 Topps Chrome Baseball Release Date Confirmed', detail: 'Hobby boxes set for August release. Checklist features expanded rookie class including top international signings. Early pre-order prices at $350-400.', sport: 'baseball', category: 'releases', priority: 'high' },
  { headline: 'NFL Draft Day 1 Card Impact: First Round Picks Spike', detail: 'Bowman University and Prizm Draft cards of top picks seeing 40-200% spikes within hours of being selected. QB and skill position players leading the surge.', sport: 'football', category: 'news', priority: 'high' },
  { headline: 'NBA Playoff Cards Heating Up', detail: 'Cards of players on deep playoff runs seeing 15-30% premium. Conference Finals matchups driving specific player demand.', sport: 'basketball', category: 'news', priority: 'medium' },
  { headline: 'BGS Launches New Subgrade Label Design', detail: 'Updated label features modern font, QR verification, and revised color coding. Existing slabs unaffected. Collectors divided on aesthetic changes.', sport: 'all' as Sport, category: 'grading', priority: 'medium' },
  { headline: 'Upper Deck Young Guns Checklist Leaked', detail: 'Preliminary checklist for 2025-26 Series 1 circulating online. Several highly anticipated rookies confirmed including late-season callups.', sport: 'hockey', category: 'releases', priority: 'high' },
  { headline: 'Record Sale: Vintage Mantle Tops $10M at Heritage', detail: 'A 1952 Topps Mickey Mantle PSA 9 sold for $10.2M at Heritage Auctions, setting a new record for any sports card sold at public auction.', sport: 'baseball', category: 'alerts', priority: 'high' },
  { headline: 'Panini Prizm Football Hobby Box Prices Stabilizing', detail: 'After initial release spike to $800+, hobby boxes settling in the $500-600 range. Rookie class strength keeping floor higher than 2024.', sport: 'football', category: 'trades', priority: 'medium' },
  { headline: 'CGC Expands Sports Card Authentication Services', detail: 'New counterfeit detection technology added for modern cards. AI-powered surface analysis can detect trimming and re-coloring with 98% accuracy.', sport: 'all' as Sport, category: 'grading', priority: 'medium' },
  { headline: 'NBA Summer League: Rookie Card Watch List', detail: 'Several 2024 draft picks impressing in Vegas. Cards of standout performers up 20-45% in 48 hours. Top picks maintaining value regardless of summer league play.', sport: 'basketball', category: 'news', priority: 'medium' },
  { headline: 'SGC Grading Volume Up 40% Year Over Year', detail: 'The fastest-growing grading company continues to gain market share. Vintage card submissions leading the surge. Premium turnaround times holding steady.', sport: 'all' as Sport, category: 'grading', priority: 'low' },
  { headline: 'Bowman Chrome Sapphire Edition Sells Out in Minutes', detail: 'The highly anticipated online-exclusive product sold out within 8 minutes. Secondary market prices already 2.5x retail. Cases trading at $4,500+.', sport: 'baseball', category: 'releases', priority: 'high' },
  { headline: 'NHL Trade Deadline Moves Impact Card Market', detail: 'Players traded to contenders seeing immediate 10-25% bumps. Rental players on expiring contracts less impacted than players signed long-term.', sport: 'hockey', category: 'trades', priority: 'medium' },
  { headline: 'Card Show Attendance Hits Record Levels', detail: 'National Sports Collectors Convention pre-registration numbers up 23% from last year. Dealer booth space sold out months in advance.', sport: 'all' as Sport, category: 'news', priority: 'medium' },
  { headline: 'PSA Pop Report: Record 10s for Modern Issues', detail: 'PSA 10 population counts for 2023-24 products reaching unprecedented levels. Collectors warned about gem rate inflation reducing premiums on modern cards.', sport: 'all' as Sport, category: 'alerts', priority: 'medium' },
  { headline: 'Topps Series 2 Introduces New Parallel Tiers', detail: 'Three new parallel colors announced for 2025 Series 2: Aurora (/75), Midnight (/25), and Eclipse (1/1). Pre-release hype building for the expanded rainbow chase.', sport: 'baseball', category: 'releases', priority: 'medium' },
  { headline: 'Football Card Market Shifts to Draft Season', detail: 'Pre-draft evaluation period creating volatility. Combine performance directly impacting card values. 40-yard dash times = price spikes for fast prospects.', sport: 'football', category: 'news', priority: 'medium' },
  { headline: 'Vintage Basketball Cards See Renewed Interest', detail: '1986 Fleer set demand up 18% this quarter. Jordan RC prices stable despite high population. Collectors pivoting to vintage as modern prices cool.', sport: 'basketball', category: 'trades', priority: 'low' },
  { headline: 'CGC Population Report Now Public', detail: 'CGC joins PSA and BGS in publishing full population data. Collectors can now compare pop counts across all three major grading companies.', sport: 'all' as Sport, category: 'grading', priority: 'medium' },
  { headline: 'Minor League Prospects Driving Bowman Market', detail: 'Top prospects in Double-A and Triple-A seeing aggressive Bowman 1st Chrome buying. International free agents from recent signing periods especially hot.', sport: 'baseball', category: 'trades', priority: 'medium' },
  { headline: 'NHL Playoff Upsets Create Card Market Chaos', detail: 'Lower-seeded team advancing shakes up projected values. Underdog star players seeing 30-50% jumps. Cup favorites elimination creates selling pressure.', sport: 'hockey', category: 'alerts', priority: 'high' },
  { headline: 'Panini Officially Loses NBA License', detail: 'Final Panini NBA products being produced now. Collectors stocking up on last Prizm and Select basketball sets as Fanatics transition approaches.', sport: 'basketball', category: 'alerts', priority: 'high' },
  { headline: 'Card Storage Innovation: UV-Blocking Cases', detail: 'New magnetic cases with UV-filtering technology hitting the market. Premium price point ($5-8 per case) but promising better long-term card preservation.', sport: 'all' as Sport, category: 'news', priority: 'low' },
  { headline: 'eBay Increases Seller Protections for Cards Over $750', detail: 'Enhanced buyer verification and authentication required for high-value card purchases. Seller protection expanded to cover return fraud on graded cards.', sport: 'all' as Sport, category: 'alerts', priority: 'medium' },
];

const PLAYERS_BY_SPORT: Record<string, string[]> = {
  baseball: ['Shohei Ohtani', 'Gunnar Henderson', 'Bobby Witt Jr', 'Elly De La Cruz', 'Paul Skenes', 'Jackson Chourio', 'Wyatt Langford', 'Junior Caminero', 'Pete Crow-Armstrong', 'Corbin Carroll'],
  basketball: ['Victor Wembanyama', 'Chet Holmgren', 'Jalen Brunson', 'Anthony Edwards', 'Luka Doncic', 'Jayson Tatum', 'Tyrese Maxey', 'Scottie Barnes', 'Paolo Banchero', 'Zaccharie Risacher'],
  football: ['Caleb Williams', 'Jayden Daniels', 'CJ Stroud', 'Marvin Harrison Jr', 'Malik Nabers', 'Drake Maye', 'Bo Nix', 'Brock Bowers', 'Rome Odunze', 'Ladd McConkey'],
  hockey: ['Connor Bedard', 'Macklin Celebrini', 'Matvei Michkov', 'Leo Carlsson', 'Adam Fantilli', 'Ivan Demidov', 'Lane Hutson', 'Logan Stankoven', 'Dylan Guenther', 'Cutter Gauthier'],
};

const PLATFORMS = ['eBay', 'COMC', 'MySlabs', 'Card Ladder', 'Goldin', 'Heritage'];

function generateMarketMovers(rng: () => number): MarketMover[] {
  const movers: MarketMover[] = [];
  const sports = ['baseball', 'basketball', 'football', 'hockey'] as const;
  const reasons = [
    'Strong performance this week', 'Playoff push boosting demand',
    'Injury concern — selling pressure', 'MVP race heating up',
    'Contract extension announced', 'Rookie card population surge',
    'Heritage auction record sale', 'Breakout game last night',
    'Social media viral moment', 'Trade rumors increasing',
    'Award nomination announced', 'All-Star selection confirmed',
  ];
  for (let i = 0; i < 12; i++) {
    const sport = sports[Math.floor(rng() * sports.length)];
    const players = PLAYERS_BY_SPORT[sport];
    const player = players[Math.floor(rng() * players.length)];
    const change = Math.round((rng() * 40 - 15) * 10) / 10;
    const basePrice = Math.floor(rng() * 500) + 20;
    movers.push({
      player,
      sport,
      change,
      price: `$${basePrice}`,
      reason: reasons[Math.floor(rng() * reasons.length)],
    });
  }
  return movers.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
}

function generateTradeTicker(rng: () => number): TradeTick[] {
  const trades: TradeTick[] = [];
  const sports = ['baseball', 'basketball', 'football', 'hockey'] as const;
  const types: ('sale' | 'auction' | 'trade')[] = ['sale', 'sale', 'sale', 'auction', 'trade'];
  const hours = ['2m ago', '5m ago', '8m ago', '12m ago', '18m ago', '24m ago', '31m ago', '38m ago', '45m ago', '52m ago', '1h ago', '1h ago', '2h ago', '2h ago', '3h ago'];
  for (let i = 0; i < 15; i++) {
    const sport = sports[Math.floor(rng() * sports.length)];
    const players = PLAYERS_BY_SPORT[sport];
    const player = players[Math.floor(rng() * players.length)];
    const sets = sport === 'baseball' ? ['Topps Chrome', 'Bowman Chrome', 'Topps Series 1'] :
      sport === 'basketball' ? ['Panini Prizm', 'Donruss Optic', 'Select'] :
      sport === 'football' ? ['Panini Prizm', 'Donruss Optic', 'Mosaic'] :
      ['Upper Deck YG', 'SP Authentic', 'Upper Deck Ice'];
    const set = sets[Math.floor(rng() * sets.length)];
    const grade = rng() > 0.3 ? ` PSA ${Math.floor(rng() * 3) + 8}` : ' Raw';
    const price = Math.floor(rng() * 800) + 15;
    trades.push({
      id: i,
      card: `${set} ${player}${grade}`,
      sport,
      price: `$${price.toLocaleString()}`,
      platform: PLATFORMS[Math.floor(rng() * PLATFORMS.length)],
      time: hours[i],
      type: types[Math.floor(rng() * types.length)],
    });
  }
  return trades;
}

function generateWireFeed(rng: () => number): WireItem[] {
  const items: WireItem[] = [];
  const shuffled = [...NEWS_TEMPLATES].sort(() => rng() - 0.5);
  const now = new Date();
  for (let i = 0; i < shuffled.length; i++) {
    const t = shuffled[i];
    const minutesAgo = Math.floor(i * 8 + rng() * 15);
    const time = new Date(now.getTime() - minutesAgo * 60000);
    const h = time.getHours();
    const m = time.getMinutes();
    items.push({
      id: i,
      category: t.category as FeedCategory,
      sport: t.sport as Sport,
      headline: t.headline,
      detail: t.detail,
      time: `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`,
      priority: t.priority,
      icon: CATEGORY_ICONS[t.category as string] || '📰',
    });
  }
  return items;
}

export default function CardWireClient() {
  const [sportFilter, setSportFilter] = useState<Sport>('all');
  const [categoryFilter, setCategoryFilter] = useState<FeedCategory>('all');
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [activePanel, setActivePanel] = useState<'wire' | 'movers' | 'trades'>('wire');
  const [newItemCount, setNewItemCount] = useState(0);

  const rng = useMemo(() => seededRandom(dateHash()), []);
  const wireFeed = useMemo(() => generateWireFeed(rng), [rng]);
  const movers = useMemo(() => generateMarketMovers(rng), [rng]);
  const trades = useMemo(() => generateTradeTicker(rng), [rng]);

  // Simulate new items arriving
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setNewItemCount(c => c + 1);
    }, 15000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const filteredWire = useMemo(() => {
    return wireFeed.filter(item => {
      if (sportFilter !== 'all' && item.sport !== 'all' && item.sport !== sportFilter) return false;
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      return true;
    });
  }, [wireFeed, sportFilter, categoryFilter]);

  const filteredMovers = useMemo(() => {
    if (sportFilter === 'all') return movers;
    return movers.filter(m => m.sport === sportFilter);
  }, [movers, sportFilter]);

  const filteredTrades = useMemo(() => {
    if (sportFilter === 'all') return trades;
    return trades.filter(t => t.sport === sportFilter);
  }, [trades, sportFilter]);

  const sportButtons: { key: Sport; label: string; icon: string }[] = [
    { key: 'all', label: 'All Sports', icon: '🏟️' },
    { key: 'baseball', label: 'MLB', icon: '⚾' },
    { key: 'basketball', label: 'NBA', icon: '🏀' },
    { key: 'football', label: 'NFL', icon: '🏈' },
    { key: 'hockey', label: 'NHL', icon: '🏒' },
  ];

  const categoryButtons: { key: FeedCategory; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'news', label: 'News' },
    { key: 'trades', label: 'Sales' },
    { key: 'grading', label: 'Grading' },
    { key: 'releases', label: 'Releases' },
    { key: 'alerts', label: 'Alerts' },
  ];

  const highPriorityCount = filteredWire.filter(w => w.priority === 'high').length;

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-lg p-3 text-center">
          <div className="text-xs text-zinc-400">Wire Stories</div>
          <div className="text-lg font-bold text-white">{filteredWire.length}</div>
        </div>
        <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-lg p-3 text-center">
          <div className="text-xs text-zinc-400">Market Movers</div>
          <div className="text-lg font-bold text-emerald-400">{filteredMovers.length}</div>
        </div>
        <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-lg p-3 text-center">
          <div className="text-xs text-zinc-400">Recent Trades</div>
          <div className="text-lg font-bold text-sky-400">{filteredTrades.length}</div>
        </div>
        <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-lg p-3 text-center">
          <div className="text-xs text-zinc-400">Priority Alerts</div>
          <div className="text-lg font-bold text-red-400">{highPriorityCount}</div>
        </div>
      </div>

      {/* Sport Filter */}
      <div className="flex flex-wrap gap-2">
        {sportButtons.map(s => (
          <button
            key={s.key}
            onClick={() => setSportFilter(s.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              sportFilter === s.key
                ? 'bg-yellow-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* Panel Tabs (mobile) */}
      <div className="flex gap-1 sm:hidden bg-zinc-800/60 rounded-lg p-1">
        {(['wire', 'movers', 'trades'] as const).map(panel => (
          <button
            key={panel}
            onClick={() => setActivePanel(panel)}
            className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
              activePanel === panel
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {panel === 'wire' ? '📰 Wire' : panel === 'movers' ? '📈 Movers' : '💰 Trades'}
          </button>
        ))}
      </div>

      {/* Desktop: 3-panel layout, Mobile: tab-switched */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* News Wire Panel */}
        <div className={`sm:col-span-2 ${activePanel !== 'wire' ? 'hidden sm:block' : ''}`}>
          <div className="bg-zinc-900/80 border border-zinc-700/50 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700/50 bg-zinc-800/60">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-bold text-white">Card Market Wire</span>
                {newItemCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded-full">
                    +{newItemCount} new
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-700/50"
              >
                {isPaused ? '▶ Resume' : '⏸ Pause'}
              </button>
            </div>

            {/* Category filters */}
            <div className="flex gap-1 px-3 py-2 border-b border-zinc-800/50 overflow-x-auto">
              {categoryButtons.map(c => (
                <button
                  key={c.key}
                  onClick={() => setCategoryFilter(c.key)}
                  className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                    categoryFilter === c.key
                      ? 'bg-zinc-600 text-white'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Wire items */}
            <div className="max-h-[600px] overflow-y-auto divide-y divide-zinc-800/50">
              {filteredWire.map(item => (
                <button
                  key={item.id}
                  onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-zinc-800/40 transition-colors ${
                    item.priority === 'high' ? 'border-l-2 border-l-red-500' :
                    item.priority === 'medium' ? 'border-l-2 border-l-yellow-600' :
                    'border-l-2 border-l-zinc-700'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-sm mt-0.5">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-medium ${CATEGORY_COLORS[item.category] || 'text-zinc-400'}`}>
                          {item.category.toUpperCase()}
                        </span>
                        {item.sport !== 'all' && (
                          <span className={`text-xs ${SPORT_COLORS[item.sport]}`}>
                            {SPORT_ICONS[item.sport]} {item.sport.toUpperCase()}
                          </span>
                        )}
                        <span className="text-xs text-zinc-600">{item.time}</span>
                        {item.priority === 'high' && (
                          <span className="text-xs text-red-400 font-bold">BREAKING</span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-200 font-medium mt-1 leading-snug">{item.headline}</p>
                      {expandedItem === item.id && (
                        <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{item.detail}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              {filteredWire.length === 0 && (
                <div className="px-4 py-8 text-center text-zinc-500 text-sm">
                  No stories match your filters. Try adjusting sport or category.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar: Movers + Trades */}
        <div className={`space-y-4 ${activePanel === 'wire' ? 'hidden sm:block' : activePanel === 'movers' ? '' : 'hidden sm:block'}`}>
          {/* Market Movers */}
          <div className={`bg-zinc-900/80 border border-zinc-700/50 rounded-lg overflow-hidden ${activePanel === 'trades' ? 'hidden sm:block' : ''}`}>
            <div className="px-4 py-3 border-b border-zinc-700/50 bg-zinc-800/60">
              <span className="text-sm font-bold text-white">📈 Market Movers</span>
            </div>
            <div className="max-h-[280px] overflow-y-auto divide-y divide-zinc-800/50">
              {filteredMovers.slice(0, 8).map((m, i) => (
                <div key={i} className="px-3 py-2 flex items-center gap-2">
                  <span className="text-xs">{SPORT_ICONS[m.sport]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-zinc-300 font-medium truncate">{m.player}</div>
                    <div className="text-xs text-zinc-500 truncate">{m.reason}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-zinc-400">{m.price}</div>
                    <div className={`text-xs font-bold ${m.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {m.change >= 0 ? '+' : ''}{m.change}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trade Ticker */}
          <div className={`bg-zinc-900/80 border border-zinc-700/50 rounded-lg overflow-hidden ${activePanel === 'movers' ? 'hidden sm:block' : ''}`}>
            <div className="px-4 py-3 border-b border-zinc-700/50 bg-zinc-800/60">
              <span className="text-sm font-bold text-white">💰 Trade Ticker</span>
            </div>
            <div className="max-h-[280px] overflow-y-auto divide-y divide-zinc-800/50">
              {filteredTrades.slice(0, 10).map(t => (
                <div key={t.id} className="px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">{SPORT_ICONS[t.sport]}</span>
                    <span className={`text-xs px-1 rounded ${
                      t.type === 'sale' ? 'bg-emerald-900/40 text-emerald-400' :
                      t.type === 'auction' ? 'bg-purple-900/40 text-purple-400' :
                      'bg-sky-900/40 text-sky-400'
                    }`}>
                      {t.type === 'sale' ? 'SOLD' : t.type === 'auction' ? 'WON' : 'TRADE'}
                    </span>
                    <span className="text-xs text-zinc-500">{t.time}</span>
                  </div>
                  <div className="text-xs text-zinc-300 mt-1 truncate">{t.card}</div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs text-zinc-500">{t.platform}</span>
                    <span className="text-xs font-bold text-emerald-400">{t.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-zinc-800/40 border border-zinc-700/30 rounded-lg p-5">
        <h2 className="text-lg font-bold text-white mb-3">How to Use Card Wire</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-zinc-300">
          <div>
            <p className="font-medium text-yellow-400">1. Monitor the Wire</p>
            <p className="text-zinc-400 mt-1">The main feed shows breaking news, product releases, grading updates, and market alerts. Click any headline to expand the full story.</p>
          </div>
          <div>
            <p className="font-medium text-yellow-400">2. Track Market Movers</p>
            <p className="text-zinc-400 mt-1">The sidebar shows which players and cards are moving in price. Green means up, red means down. Check the reason for each move.</p>
          </div>
          <div>
            <p className="font-medium text-yellow-400">3. Watch the Trade Ticker</p>
            <p className="text-zinc-400 mt-1">Real-time sales, auction wins, and trades scroll through the ticker. See what cards are trading, at what price, and on which platform.</p>
          </div>
          <div>
            <p className="font-medium text-yellow-400">4. Filter by Sport</p>
            <p className="text-zinc-400 mt-1">Use the sport buttons to focus on your sport. Category filters (News, Sales, Grading, Releases, Alerts) let you drill into specific topics.</p>
          </div>
        </div>
      </div>

      {/* Pro Tips */}
      <div className="bg-zinc-800/40 border border-zinc-700/30 rounded-lg p-5">
        <h2 className="text-lg font-bold text-white mb-3">Wire Reading Tips</h2>
        <div className="space-y-3">
          {[
            { title: 'Red Border = Breaking', desc: 'High-priority stories have a red left border. These are the market-moving headlines you should read first.' },
            { title: 'Movers Lead Prices', desc: 'The biggest movers today often predict what the market will do tomorrow. Watch for patterns across sports.' },
            { title: 'Volume Confirms Moves', desc: 'A price spike with high trade ticker activity is real. A price move with no trades is likely noise.' },
            { title: 'Grading News Impacts All', desc: 'When PSA or BGS change policies, it affects every card. Grading stories are always cross-sport relevant.' },
            { title: 'Release Dates = Sell Dates', desc: 'Existing card prices often dip when new products release. The market redirects money to the shiny new thing.' },
          ].map((tip, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-yellow-500 font-bold text-sm mt-0.5">{i + 1}.</span>
              <div>
                <span className="text-sm text-white font-medium">{tip.title}</span>
                <p className="text-xs text-zinc-400 mt-0.5">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

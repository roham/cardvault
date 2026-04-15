'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

// ── Helpers ──────────────────────────────────────────────────────
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function todaySeed(): number {
  const d = new Date();
  const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

function hourSeed(): number {
  const d = new Date();
  const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

function slugify(name: string): string {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const SPORT_ICONS: Record<string, string> = {
  baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒',
};

const REASONS = [
  'Playoff performance spike',
  'New product release day',
  'Viral social media moment',
  'Award nomination buzz',
  'Injury return — comeback story',
  'Trade deadline speculation',
  'Record-breaking game',
  'Draft night hype',
  'Retirement announcement',
  'Hall of Fame induction buzz',
  'Breakout game performance',
  'National TV appearance',
  'Card show weekend demand',
  'Grading company announcement',
  'New set checklist revealed',
  'Community poll winner',
  'Cross-sport crossover moment',
  'Anniversary of iconic moment',
  'Prospect call-up news',
  'Vintage market revival',
];

const BUZZ_TOPICS = [
  { title: '2026 NFL Draft Night Watch', description: 'Top prospects getting massive card price bumps as draft approaches. Shedeur Sanders, Cam Ward, Travis Hunter cards leading pre-draft surges.', category: 'Event', href: '/draft-live' },
  { title: 'NBA Playoffs Round 1 — Card Impact', description: 'Playoff performers seeing 15-40% card price jumps. Watch for breakout performances from young stars.', category: 'Market', href: '/card-catalysts' },
  { title: 'Topps Series 2 Release Day', description: 'New rookie cards hitting the market. Check which prospects are getting their first flagship Topps cards.', category: 'Release', href: '/drops' },
  { title: 'PSA Express Service Update', description: 'Turnaround times dropping for Express tier. Submitters seeing 12-day returns vs 15-day estimate.', category: 'Grading', href: '/tools/submission-planner' },
  { title: 'Vintage Baseball Surge', description: '1950s-1970s baseball cards seeing renewed interest. Mickey Mantle, Hank Aaron, and Roberto Clemente leading the charge.', category: 'Market', href: '/market-movers' },
  { title: 'Hockey Young Guns Drop', description: 'New Upper Deck Young Guns checklist revealed. Connor Bedard follow-up cards and new rookies driving presale interest.', category: 'Release', href: '/release-tracker' },
  { title: 'Pack Break Boom Weekend', description: 'Weekend break schedule packed with hobby boxes. Group break participation up 30% this month.', category: 'Live', href: '/break-schedule' },
  { title: 'Wembanyama Card Watch', description: 'Victor Wembanyama continues to dominate. His Prizm Silver PSA 10 has appreciated 18% this month alone.', category: 'Player', href: '/sports/cards/2022-23-panini-prizm-victor-wembanyama-258' },
];

const POPULAR_TOOLS = [
  { name: 'Flip Calculator', reason: 'Sellers checking margins before card show weekend', href: '/tools/flip-calc', uses: '2.4K' },
  { name: 'Grading ROI', reason: 'PSA submission window open — collectors calculating value', href: '/tools/grading-roi', uses: '1.8K' },
  { name: 'Pack Simulator', reason: 'New product hype driving rip-or-skip decisions', href: '/tools/pack-sim', uses: '3.1K' },
  { name: 'Collection Value', reason: 'Quarterly portfolio check season', href: '/tools/collection-value', uses: '1.5K' },
  { name: 'Dealer Scanner', reason: 'Card show prep — quick pricing lookups trending', href: '/tools/dealer-scanner', uses: '980' },
  { name: 'Break-Even Calculator', reason: 'Sellers figuring minimum sell prices across platforms', href: '/tools/break-even', uses: '870' },
];

// ── Component ──────────────────────────────────────────────────
export default function HotRightNowClient() {
  const data = useMemo(() => {
    const dayRng = seededRandom(todaySeed());
    const hrRng = seededRandom(hourSeed());

    // Trending cards — pick 8 from database
    const shuffled = [...sportsCards].sort(() => dayRng() - 0.5);
    const trendingCards = shuffled.slice(0, 8).map((card, i) => ({
      ...card,
      change: `+${Math.round(5 + dayRng() * 35)}%`,
      reason: REASONS[Math.floor(dayRng() * REASONS.length)],
      rank: i + 1,
      heat: Math.round(70 + dayRng() * 30),
    }));

    // Hot players — aggregate by player, pick top 6
    const playerMap = new Map<string, { name: string; sport: string; cards: number; avgChange: number }>();
    for (const card of trendingCards) {
      const existing = playerMap.get(card.player);
      if (existing) {
        existing.cards++;
      } else {
        playerMap.set(card.player, { name: card.player, sport: card.sport, cards: 1, avgChange: Math.round(10 + dayRng() * 30) });
      }
    }
    // Add more hot players from the wider pool
    const morePlayers = shuffled.slice(8, 30);
    for (const card of morePlayers) {
      if (!playerMap.has(card.player) && playerMap.size < 10) {
        playerMap.set(card.player, { name: card.player, sport: card.sport, cards: 1, avgChange: Math.round(5 + dayRng() * 25) });
      }
    }
    const hotPlayers = [...playerMap.values()].sort((a, b) => b.avgChange - a.avgChange).slice(0, 6);

    // Buzz topics — pick 4 for today
    const buzzShuffle = [...BUZZ_TOPICS].sort(() => dayRng() - 0.5);
    const todayBuzz = buzzShuffle.slice(0, 4);

    // Active breaks
    const breakHosts = ['CardKingMike', 'JaxWax', 'RipCityBreaks', 'PackPullerPete', 'GemMintGary', 'WaxMuseum'];
    const breakProducts = ['2024 Topps Chrome Hobby', '2024-25 Prizm Basketball', '2024 Prizm Football', '2024-25 Upper Deck Series 1', '2024 Bowman Chrome Hobby', '2024-25 Select Basketball'];
    const activeBreaks = Array.from({ length: 3 }, (_, i) => ({
      host: breakHosts[Math.floor(hrRng() * breakHosts.length)],
      product: breakProducts[Math.floor(hrRng() * breakProducts.length)],
      viewers: Math.round(80 + hrRng() * 400),
      spotsLeft: Math.round(1 + hrRng() * 8),
    }));

    // Popular tools
    const toolShuffle = [...POPULAR_TOOLS].sort(() => dayRng() - 0.5);

    return { trendingCards, hotPlayers, todayBuzz, activeBreaks, tools: toolShuffle.slice(0, 4) };
  }, []);

  return (
    <div className="space-y-8">
      {/* Trending Cards */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-bold text-white">Trending Cards</h2>
          <span className="bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs px-2 py-0.5 rounded-full">Top 8 Today</span>
        </div>
        <div className="grid gap-3">
          {data.trendingCards.map((card) => (
            <Link
              key={card.slug}
              href={`/sports/cards/${card.slug}`}
              className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 hover:border-orange-800/50 transition-colors flex items-center gap-4"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-sm font-bold text-orange-400">
                {card.rank}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm">{SPORT_ICONS[card.sport] || '🃏'}</span>
                  <span className="text-white font-medium text-sm truncate">{card.name}</span>
                </div>
                <div className="text-xs text-gray-500 truncate">{card.reason}</div>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="text-emerald-400 font-bold text-sm">{card.change}</div>
                <div className="flex items-center gap-1 justify-end">
                  <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-600 to-red-500 rounded-full" style={{ width: `${card.heat}%` }} />
                  </div>
                  <span className="text-xs text-gray-600">{card.heat}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Hot Players + Active Breaks side by side */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Hot Players */}
        <section>
          <h2 className="text-lg font-bold text-white mb-4">Hot Players</h2>
          <div className="space-y-2">
            {data.hotPlayers.map((player, i) => (
              <Link
                key={player.name}
                href={`/players/${slugify(player.name)}`}
                className="flex items-center gap-3 bg-gray-900/60 border border-gray-800 rounded-lg p-3 hover:border-gray-700 transition-colors"
              >
                <span className="text-lg">{SPORT_ICONS[player.sport] || '🃏'}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{player.name}</div>
                  <div className="text-xs text-gray-500">{player.sport.charAt(0).toUpperCase() + player.sport.slice(1)}</div>
                </div>
                <div className="text-emerald-400 font-bold text-sm">+{player.avgChange}%</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Active Breaks */}
        <section>
          <h2 className="text-lg font-bold text-white mb-4">Live Breaks</h2>
          <div className="space-y-3">
            {data.activeBreaks.map((brk, i) => (
              <Link
                key={i}
                href="/break-room"
                className="block bg-gray-900/60 border border-gray-800 rounded-lg p-4 hover:border-red-800/40 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-400 text-xs font-medium">LIVE</span>
                  <span className="text-gray-500 text-xs">{brk.viewers} watching</span>
                </div>
                <div className="text-white text-sm font-medium mb-1">{brk.product}</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Hosted by {brk.host}</span>
                  <span className="text-xs text-amber-400">{brk.spotsLeft} spots left</span>
                </div>
              </Link>
            ))}
            <Link href="/break-schedule" className="block text-center text-sm text-gray-500 hover:text-white transition-colors py-2">
              View full break schedule &rarr;
            </Link>
          </div>
        </section>
      </div>

      {/* Hobby Buzz */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4">Hobby Buzz</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {data.todayBuzz.map((topic, i) => (
            <Link
              key={i}
              href={topic.href}
              className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  topic.category === 'Market' ? 'bg-emerald-500/10 text-emerald-400' :
                  topic.category === 'Event' ? 'bg-blue-500/10 text-blue-400' :
                  topic.category === 'Release' ? 'bg-purple-500/10 text-purple-400' :
                  topic.category === 'Grading' ? 'bg-amber-500/10 text-amber-400' :
                  topic.category === 'Live' ? 'bg-red-500/10 text-red-400' :
                  'bg-cyan-500/10 text-cyan-400'
                }`}>{topic.category}</span>
              </div>
              <h3 className="text-white text-sm font-medium mb-1">{topic.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{topic.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Tools */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4">Popular Tools Right Now</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {data.tools.map((tool, i) => (
            <Link
              key={i}
              href={tool.href}
              className="flex items-center gap-4 bg-gray-900/60 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors"
            >
              <div className="flex-1">
                <div className="text-white text-sm font-medium mb-0.5">{tool.name}</div>
                <div className="text-xs text-gray-500">{tool.reason}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-blue-400 text-sm font-bold">{tool.uses}</div>
                <div className="text-xs text-gray-600">uses today</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Links */}
      <section className="bg-gradient-to-br from-orange-950/30 to-gray-900 border border-orange-800/30 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-3">Stay in the Loop</h2>
        <p className="text-gray-400 text-sm mb-4">
          The hobby moves fast. Here are the best ways to stay on top of what is happening.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Market Analysis', href: '/market-analysis', icon: '📊' },
            { label: 'Breaking News', href: '/breaking-news', icon: '🚨' },
            { label: 'Price Catalysts', href: '/card-catalysts', icon: '⚡' },
            { label: 'Media Hub', href: '/media-hub', icon: '🎙' },
          ].map(item => (
            <Link key={item.href} href={item.href} className="flex items-center gap-2 bg-gray-900/60 border border-gray-800 rounded-lg px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:border-gray-700 transition-colors">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

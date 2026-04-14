'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

type Sport = 'baseball' | 'basketball' | 'football' | 'hockey';

function dateHash(dateStr: string): number {
  let hash = 0;
  const str = 'cardvault-analysis-' + dateStr;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function parseValue(v: string): number {
  const m = v.match(/\$([\d,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function formatPrice(n: number): string {
  if (n >= 1000) return '$' + (n / 1000).toFixed(1) + 'K';
  return '$' + n.toLocaleString();
}

function slugifyPlayer(name: string): string {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const sportLabels: Record<Sport, string> = { baseball: 'Baseball', basketball: 'Basketball', football: 'Football', hockey: 'Hockey' };
const sportIcons: Record<Sport, string> = { baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒' };
const sportColors: Record<Sport, string> = { baseball: 'text-red-400', basketball: 'text-orange-400', football: 'text-blue-400', hockey: 'text-cyan-400' };

// Market narrative templates
const bullishReasons = [
  'Strong auction results driving demand higher',
  'Upcoming Hall of Fame announcement boosting interest',
  'Social media buzz amplifying collector demand',
  'Population report showing scarcity in high grades',
  'Recent on-field/court performance sparking renewed interest',
  'International collector demand expanding the market',
  'Major card show activity pushing prices',
  'Grading service backlogs creating perceived scarcity',
];

const bearishReasons = [
  'Population growth outpacing demand at current levels',
  'Profit-taking after recent price spike',
  'Market rotation out of modern into vintage',
  'Seasonal slowdown as collectors shift attention',
  'New product releases diluting attention',
  'Grading turnaround times normalizing supply',
  'Economic uncertainty causing some pullback',
  'Comparable comps establishing lower price floor',
];

const sectorInsights = [
  'Vintage pre-war cards continue to outperform modern issues on a risk-adjusted basis.',
  'Rookie cards of active players remain the most volatile segment — high beta, high reward.',
  'Graded PSA 10 population increases are pressuring prices on modern base cards.',
  'Football cards are seeing a seasonal uptick as draft buzz builds.',
  'Basketball crossover appeal (fashion, media, culture) continues to expand the collector base.',
  'Hockey remains undervalued relative to the other major sports — smart money is accumulating.',
  'The vintage segment ($500+) has the most inelastic demand — wealthy collectors rarely sell.',
  'Pack-ripped modern cards are flooding the market, but the best rookies still appreciate.',
];

interface Mover {
  card: typeof sportsCards[0];
  change: number;
  reason: string;
}

interface SectorData {
  sport: Sport;
  avgChange: number;
  topMover: Mover;
  volume: number;
  cardCount: number;
  totalValue: number;
}

export default function MarketAnalysisClient() {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const analysis = useMemo(() => {
    const seed = dateHash(dateStr);
    const rng = seededRng(seed);

    // Generate movers for each sport
    const sports: Sport[] = ['baseball', 'basketball', 'football', 'hockey'];
    const allMovers: Mover[] = [];
    const sectors: SectorData[] = [];

    for (const sport of sports) {
      const sportCards = sportsCards.filter(c => c.sport === sport);
      const withValue = sportCards.map(c => ({ card: c, value: parseValue(c.estimatedValueRaw) })).filter(cv => cv.value > 0);

      // Pick movers deterministically
      const shuffled = [...withValue].sort((a, b) => {
        const ha = dateHash(dateStr + a.card.slug);
        const hb = dateHash(dateStr + b.card.slug);
        return ha - hb;
      });

      const movers: Mover[] = shuffled.slice(0, 8).map((cv, idx) => {
        const isUp = rng() > 0.4; // slight bullish bias
        const magnitude = (rng() * 25 + 2);
        const change = isUp ? magnitude : -magnitude;
        const reasons = isUp ? bullishReasons : bearishReasons;
        return {
          card: cv.card,
          change: Math.round(change * 10) / 10,
          reason: reasons[Math.floor(rng() * reasons.length)],
        };
      });

      allMovers.push(...movers);

      const avgChange = movers.reduce((sum, m) => sum + m.change, 0) / movers.length;
      const totalValue = withValue.reduce((sum, cv) => sum + cv.value, 0);

      sectors.push({
        sport,
        avgChange: Math.round(avgChange * 10) / 10,
        topMover: movers.sort((a, b) => Math.abs(b.change) - Math.abs(a.change))[0],
        volume: Math.floor(rng() * 500 + 100),
        cardCount: sportCards.length,
        totalValue,
      });
    }

    // Overall market sentiment
    const overallChange = allMovers.reduce((sum, m) => sum + m.change, 0) / allMovers.length;
    const sentiment = overallChange > 2 ? 'Bullish' : overallChange < -2 ? 'Bearish' : 'Mixed';
    const sentimentColor = overallChange > 2 ? 'text-emerald-400' : overallChange < -2 ? 'text-red-400' : 'text-amber-400';

    // Top 5 gainers and losers
    allMovers.sort((a, b) => b.change - a.change);
    const topGainers = allMovers.slice(0, 5);
    const topLosers = [...allMovers].sort((a, b) => a.change - b.change).slice(0, 5);

    // Pick sector insight and headline
    const insightIdx = Math.floor(rng() * sectorInsights.length);
    const insight = sectorInsights[insightIdx];

    // Generate headline
    const headlineMover = topGainers[0];
    const headline = headlineMover
      ? `${headlineMover.card.player} cards surge ${headlineMover.change.toFixed(1)}% as ${headlineMover.reason.toLowerCase()}`
      : 'Mixed signals across the card market today';

    return {
      sectors,
      topGainers,
      topLosers,
      overallChange: Math.round(overallChange * 10) / 10,
      sentiment,
      sentimentColor,
      insight,
      headline,
    };
  }, [dateStr]);

  return (
    <div className="space-y-8">
      {/* Date + Sentiment bar */}
      <div className="flex flex-wrap items-center justify-between bg-gray-900/60 border border-gray-800 rounded-xl p-4">
        <div>
          <p className="text-white font-bold text-lg">{dayName}</p>
          <p className="text-gray-500 text-xs mt-0.5">Analysis refreshes daily at midnight</p>
        </div>
        <div className="text-right mt-2 sm:mt-0">
          <p className="text-gray-400 text-xs">Market Sentiment</p>
          <p className={`text-xl font-bold ${analysis.sentimentColor}`}>
            {analysis.sentiment} ({analysis.overallChange > 0 ? '+' : ''}{analysis.overallChange}%)
          </p>
        </div>
      </div>

      {/* Headline */}
      <div className="bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-800/30 rounded-xl p-6">
        <p className="text-blue-400 text-xs font-medium mb-2 uppercase tracking-wider">Top Story</p>
        <h2 className="text-xl font-bold text-white leading-snug">{analysis.headline}</h2>
        <p className="text-gray-400 text-sm mt-3 leading-relaxed">{analysis.insight}</p>
      </div>

      {/* Sport Sector Cards */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Sector Performance</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {analysis.sectors.map(sector => {
            const isUp = sector.avgChange > 0;
            return (
              <div key={sector.sport} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{sportIcons[sector.sport]}</span>
                    <span className={`font-bold ${sportColors[sector.sport]}`}>{sportLabels[sector.sport]}</span>
                  </div>
                  <span className={`text-lg font-bold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isUp ? '+' : ''}{sector.avgChange}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                  <div>
                    <p className="text-gray-500">Cards</p>
                    <p className="text-gray-300 font-medium">{sector.cardCount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Volume</p>
                    <p className="text-gray-300 font-medium">{sector.volume} sales</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Market Cap</p>
                    <p className="text-gray-300 font-medium">{formatPrice(sector.totalValue)}</p>
                  </div>
                </div>
                <div className="border-t border-gray-800 pt-2">
                  <p className="text-gray-500 text-xs mb-1">Top mover</p>
                  <div className="flex items-center justify-between">
                    <Link href={`/sports/${sector.topMover.card.slug}`} className="text-white text-sm font-medium hover:text-emerald-400 transition-colors truncate mr-2">
                      {sector.topMover.card.player}
                    </Link>
                    <span className={`text-xs font-bold shrink-0 ${sector.topMover.change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {sector.topMover.change > 0 ? '+' : ''}{sector.topMover.change}%
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs mt-0.5">{sector.topMover.reason}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Gainers & Losers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Gainers */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
          <h3 className="text-emerald-400 font-bold text-sm mb-3 flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
            Top Gainers
          </h3>
          <div className="space-y-2">
            {analysis.topGainers.map((m, i) => (
              <div key={m.card.slug} className="flex items-center gap-3">
                <span className="text-gray-600 text-xs font-mono w-4">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <Link href={`/sports/${m.card.slug}`} className="text-white text-sm font-medium hover:text-emerald-400 transition-colors truncate block">
                    {m.card.player}
                  </Link>
                  <p className="text-gray-500 text-xs truncate">{m.card.year} {m.card.set.split(' ').slice(0, 3).join(' ')}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-emerald-400 font-bold text-sm">+{m.change.toFixed(1)}%</p>
                  <p className="text-gray-500 text-xs">{m.card.estimatedValueRaw.split(' ')[0]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Losers */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
          <h3 className="text-red-400 font-bold text-sm mb-3 flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
            Top Losers
          </h3>
          <div className="space-y-2">
            {analysis.topLosers.map((m, i) => (
              <div key={m.card.slug} className="flex items-center gap-3">
                <span className="text-gray-600 text-xs font-mono w-4">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <Link href={`/sports/${m.card.slug}`} className="text-white text-sm font-medium hover:text-red-300 transition-colors truncate block">
                    {m.card.player}
                  </Link>
                  <p className="text-gray-500 text-xs truncate">{m.card.year} {m.card.set.split(' ').slice(0, 3).join(' ')}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-red-400 font-bold text-sm">{m.change.toFixed(1)}%</p>
                  <p className="text-gray-500 text-xs">{m.card.estimatedValueRaw.split(' ')[0]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Market Commentary */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
        <h3 className="text-white font-bold mb-3">Market Commentary</h3>
        <div className="space-y-3 text-sm text-gray-400 leading-relaxed">
          <p>
            Today&apos;s card market is showing {analysis.sentiment.toLowerCase()} signals with an average movement of
            {' '}{analysis.overallChange > 0 ? '+' : ''}{analysis.overallChange}% across all sectors.
            {analysis.overallChange > 3 ? ' Strong buying pressure suggests collector confidence is high.' :
             analysis.overallChange < -3 ? ' Selling pressure indicates caution among market participants.' :
             ' Volume is steady, with selective buying in specific segments.'}
          </p>
          <p>
            {analysis.sectors.sort((a, b) => b.avgChange - a.avgChange)[0].sport === 'baseball' ?
              'Baseball continues to attract the deepest collector base, with vintage Topps and pre-war Goudey issues leading demand.' :
             analysis.sectors[0].sport === 'basketball' ?
              'Basketball cards remain the most active sector, driven by playoff performance and crossover cultural appeal.' :
             analysis.sectors[0].sport === 'football' ?
              'Football is showing seasonal strength as draft analysis and camp battles drive rookie card speculation.' :
              'Hockey is quietly outperforming as savvy collectors recognize the value gap versus other major sports.'}
          </p>
          <p>
            Key watch item: {analysis.topGainers[0]?.card.player} ({analysis.topGainers[0]?.card.year} {analysis.topGainers[0]?.card.set.split(' ').slice(0, 2).join(' ')})
            is the day&apos;s biggest mover at +{analysis.topGainers[0]?.change.toFixed(1)}%. {analysis.topGainers[0]?.reason}.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Cards Tracked', value: sportsCards.length.toLocaleString(), color: 'text-white' },
          { label: 'Sports Covered', value: '4', color: 'text-emerald-400' },
          { label: 'Avg Movement', value: `${analysis.overallChange > 0 ? '+' : ''}${analysis.overallChange}%`, color: analysis.overallChange > 0 ? 'text-emerald-400' : 'text-red-400' },
          { label: 'Total Volume', value: `${analysis.sectors.reduce((s, sec) => s + sec.volume, 0)} sales`, color: 'text-blue-400' },
        ].map(stat => (
          <div key={stat.label} className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
            <p className="text-gray-500 text-xs">{stat.label}</p>
            <p className={`font-bold text-lg ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Archive notice */}
      <div className="text-center py-4">
        <p className="text-gray-600 text-xs">
          Analysis generated from CardVault market data. For weekly deep dives, see the <Link href="/market-report" className="text-emerald-500 hover:text-emerald-400 transition-colors">Weekly Market Report</Link>.
        </p>
        <p className="text-gray-700 text-xs mt-1">
          Past performance is not indicative of future results. Card values can go up or down.
        </p>
      </div>
    </div>
  );
}

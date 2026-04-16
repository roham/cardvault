'use client';

import { useState, useMemo } from 'react';

type Sport = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey';
type TimeRange = 'today' | 'week' | 'month';

interface BreakResult {
  rank: number;
  username: string;
  avatar: string;
  card: string;
  player: string;
  sport: Sport;
  product: string;
  value: number;
  grade: string;
  time: string;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  totalValue: number;
  breaks: number;
  bestHit: string;
  bestHitValue: number;
  sport: Sport;
}

const AVATARS = ['🃏', '🎴', '🏆', '⭐', '🔥', '💎', '🎯', '🎰', '🏅', '🌟', '💪', '🎪', '🎲', '👑', '🦅', '🐻', '🦁', '🐺', '🐍', '🦈'];
const USERNAMES = [
  'CardKing99', 'WaxRipper', 'GemMint10', 'BoxBuster', 'HobbyHero',
  'PrizmHunter', 'ChromeChaser', 'SerialSniper', 'RookieRush', 'PullMachine',
  'SlabDaddy', 'CaseBreaker', 'HitHunter', 'MintCondish', 'PackAttack',
  'ValueVault', 'GradingGuru', 'FlipKing', 'WaxAddict', 'RCCollector',
  'ToppsKing', 'PaniniPro', 'UpperDeckUK', 'BowmanBoss', 'DonrussDude',
];

const PRODUCTS: Record<string, Sport> = {
  '2024 Topps Chrome': 'baseball',
  '2024 Bowman Chrome': 'baseball',
  '2025 Topps Series 1': 'baseball',
  '2024 Topps Update': 'baseball',
  '2024 Panini Prizm': 'football',
  '2024 Panini Select': 'football',
  '2024 Donruss Optic': 'football',
  '2024 Panini Mosaic': 'football',
  '2024-25 Panini Prizm': 'basketball',
  '2024-25 Donruss Optic': 'basketball',
  '2024-25 Panini Select': 'basketball',
  '2024-25 Panini Mosaic': 'basketball',
  '2024-25 Upper Deck': 'hockey',
  '2024-25 Upper Deck Ice': 'hockey',
  '2024-25 SP Authentic': 'hockey',
};

const PLAYERS: Record<string, { name: string; sport: Sport }[]> = {
  baseball: [
    { name: 'Shohei Ohtani', sport: 'baseball' }, { name: 'Paul Skenes', sport: 'baseball' },
    { name: 'Gunnar Henderson', sport: 'baseball' }, { name: 'Elly De La Cruz', sport: 'baseball' },
    { name: 'Jackson Chourio', sport: 'baseball' }, { name: 'Junior Caminero', sport: 'baseball' },
    { name: 'Bobby Witt Jr.', sport: 'baseball' }, { name: 'Bryce Harper', sport: 'baseball' },
  ],
  football: [
    { name: 'Caleb Williams', sport: 'football' }, { name: 'Jayden Daniels', sport: 'football' },
    { name: 'Marvin Harrison Jr.', sport: 'football' }, { name: 'Drake Maye', sport: 'football' },
    { name: 'Brock Bowers', sport: 'football' }, { name: 'Malik Nabers', sport: 'football' },
    { name: 'Ladd McConkey', sport: 'football' }, { name: 'Patrick Mahomes', sport: 'football' },
  ],
  basketball: [
    { name: 'Victor Wembanyama', sport: 'basketball' }, { name: 'Zach Edey', sport: 'basketball' },
    { name: 'Reed Sheppard', sport: 'basketball' }, { name: 'Alex Sarr', sport: 'basketball' },
    { name: 'Stephon Castle', sport: 'basketball' }, { name: 'Dalton Knecht', sport: 'basketball' },
    { name: 'Anthony Edwards', sport: 'basketball' }, { name: 'Luka Doncic', sport: 'basketball' },
  ],
  hockey: [
    { name: 'Connor Bedard', sport: 'hockey' }, { name: 'Macklin Celebrini', sport: 'hockey' },
    { name: 'Connor McDavid', sport: 'hockey' }, { name: 'Matvei Michkov', sport: 'hockey' },
    { name: 'Leo Carlsson', sport: 'hockey' }, { name: 'Cale Makar', sport: 'hockey' },
    { name: 'Adam Fantilli', sport: 'hockey' }, { name: 'Logan Cooley', sport: 'hockey' },
  ],
};

const CARD_TYPES = ['Base', 'Silver Prizm', 'Gold /10', 'Auto', 'Patch Auto /25', 'Superfractor 1/1', 'Refractor', 'Shimmer', 'Green /99', 'Blue /75', 'Red /5', 'Black 1/1'];
const GRADES = ['Raw', 'PSA 10', 'BGS 9.5', 'PSA 9', 'CGC 9.5', 'SGC 10'];

function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

function generateDailySeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function generateBreakResults(seed: number, count: number): BreakResult[] {
  const rng = seededRandom(seed);
  const results: BreakResult[] = [];
  const sports: Sport[] = ['baseball', 'basketball', 'football', 'hockey'];

  for (let i = 0; i < count; i++) {
    const sport = sports[Math.floor(rng() * sports.length)];
    const playerPool = PLAYERS[sport];
    const player = playerPool[Math.floor(rng() * playerPool.length)];
    const productEntries = Object.entries(PRODUCTS).filter(([, s]) => s === sport);
    const [product] = productEntries[Math.floor(rng() * productEntries.length)];
    const cardType = CARD_TYPES[Math.floor(rng() * CARD_TYPES.length)];
    const grade = GRADES[Math.floor(rng() * GRADES.length)];
    const username = USERNAMES[Math.floor(rng() * USERNAMES.length)];
    const avatar = AVATARS[Math.floor(rng() * AVATARS.length)];

    let baseValue = 5 + Math.floor(rng() * 50);
    if (cardType.includes('1/1')) baseValue *= 50 + Math.floor(rng() * 100);
    else if (cardType.includes('/5')) baseValue *= 20 + Math.floor(rng() * 30);
    else if (cardType.includes('/10')) baseValue *= 10 + Math.floor(rng() * 20);
    else if (cardType.includes('/25')) baseValue *= 5 + Math.floor(rng() * 15);
    else if (cardType.includes('/75')) baseValue *= 3 + Math.floor(rng() * 8);
    else if (cardType.includes('/99')) baseValue *= 2 + Math.floor(rng() * 5);
    else if (cardType.includes('Auto')) baseValue *= 4 + Math.floor(rng() * 10);
    else if (cardType.includes('Prizm') || cardType.includes('Refractor')) baseValue *= 2 + Math.floor(rng() * 4);
    if (grade === 'PSA 10' || grade === 'SGC 10') baseValue = Math.round(baseValue * 1.8);
    else if (grade === 'BGS 9.5' || grade === 'CGC 9.5') baseValue = Math.round(baseValue * 1.5);

    const hour = Math.floor(rng() * 24);
    const min = Math.floor(rng() * 60);

    results.push({
      rank: i + 1,
      username,
      avatar,
      card: `${product} ${player.name} ${cardType}`,
      player: player.name,
      sport: player.sport,
      product,
      value: baseValue,
      grade,
      time: `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
    });
  }

  return results.sort((a, b) => b.value - a.value).map((r, i) => ({ ...r, rank: i + 1 }));
}

function generateLeaderboard(results: BreakResult[]): LeaderboardEntry[] {
  const byUser = new Map<string, { avatar: string; totalValue: number; breaks: number; bestHit: string; bestHitValue: number; sports: Set<Sport> }>();

  for (const r of results) {
    const existing = byUser.get(r.username);
    if (existing) {
      existing.totalValue += r.value;
      existing.breaks++;
      existing.sports.add(r.sport);
      if (r.value > existing.bestHitValue) { existing.bestHit = r.card; existing.bestHitValue = r.value; }
    } else {
      byUser.set(r.username, { avatar: r.avatar, totalValue: r.value, breaks: 1, bestHit: r.card, bestHitValue: r.value, sports: new Set([r.sport]) });
    }
  }

  return [...byUser.entries()]
    .map(([username, data]) => ({
      rank: 0,
      username,
      avatar: data.avatar,
      totalValue: data.totalValue,
      breaks: data.breaks,
      bestHit: data.bestHit,
      bestHitValue: data.bestHitValue,
      sport: 'all' as Sport,
    }))
    .sort((a, b) => b.totalValue - a.totalValue)
    .map((entry, i) => ({ ...entry, rank: i + 1 }));
}

function formatValue(v: number): string {
  return v >= 1000 ? `$${(v / 1000).toFixed(1)}K` : `$${v}`;
}

export default function BreaksLeaderboardClient() {
  const [sportFilter, setSportFilter] = useState<Sport>('all');
  const [timeRange, setTimeRange] = useState<TimeRange>('today');
  const [view, setView] = useState<'hits' | 'leaderboard'>('hits');

  const seed = useMemo(() => {
    const base = generateDailySeed();
    if (timeRange === 'today') return base;
    if (timeRange === 'week') return base - (base % 7);
    return base - (base % 30);
  }, [timeRange]);

  const hitCount = timeRange === 'today' ? 50 : timeRange === 'week' ? 200 : 500;
  const allResults = useMemo(() => generateBreakResults(seed, hitCount), [seed, hitCount]);

  const filteredResults = useMemo(() =>
    sportFilter === 'all' ? allResults : allResults.filter(r => r.sport === sportFilter),
    [allResults, sportFilter]
  );

  const leaderboard = useMemo(() => generateLeaderboard(filteredResults), [filteredResults]);

  const bestHitToday = allResults[0];
  const totalValue = allResults.reduce((sum, r) => sum + r.value, 0);
  const avgValue = Math.round(totalValue / allResults.length);
  const bigHits = allResults.filter(r => r.value >= 500).length;

  return (
    <div>
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Best Hit', value: bestHitToday ? formatValue(bestHitToday.value) : '-', color: 'text-amber-400' },
          { label: 'Total Pulled', value: formatValue(totalValue), color: 'text-emerald-400' },
          { label: 'Avg Hit Value', value: formatValue(avgValue), color: 'text-blue-400' },
          { label: 'Big Hits ($500+)', value: String(bigHits), color: 'text-purple-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-gray-900 rounded-lg p-3 border border-gray-800 text-center">
            <div className="text-gray-500 text-xs mb-1">{stat.label}</div>
            <div className={`font-bold text-lg ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Best Hit Card */}
      {bestHitToday && (
        <div className="bg-gradient-to-r from-amber-950/60 to-orange-950/60 rounded-lg p-5 border border-amber-800/50 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-wide">Hit of the Day</span>
            <span className="text-xl">🏆</span>
          </div>
          <div className="text-white font-bold text-lg mb-1">{bestHitToday.card}</div>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="text-amber-300 font-bold">{formatValue(bestHitToday.value)}</span>
            <span className="text-gray-400">{bestHitToday.grade}</span>
            <span className="text-gray-400">by {bestHitToday.avatar} {bestHitToday.username}</span>
            <span className="text-gray-500">{bestHitToday.time}</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* View Toggle */}
        <div className="flex gap-1 bg-gray-900 rounded-lg p-1 border border-gray-800">
          {(['hits', 'leaderboard'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 rounded text-sm font-medium transition ${view === v ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              {v === 'hits' ? 'Top Hits' : 'Leaderboard'}
            </button>
          ))}
        </div>

        {/* Sport Filter */}
        <div className="flex gap-1 bg-gray-900 rounded-lg p-1 border border-gray-800">
          {([
            { id: 'all' as Sport, label: 'All', icon: '🏆' },
            { id: 'baseball' as Sport, label: 'MLB', icon: '⚾' },
            { id: 'basketball' as Sport, label: 'NBA', icon: '🏀' },
            { id: 'football' as Sport, label: 'NFL', icon: '🏈' },
            { id: 'hockey' as Sport, label: 'NHL', icon: '🏒' },
          ]).map(s => (
            <button key={s.id} onClick={() => setSportFilter(s.id)} className={`px-2 py-1.5 rounded text-xs font-medium transition ${sportFilter === s.id ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        {/* Time Range */}
        <div className="flex gap-1 bg-gray-900 rounded-lg p-1 border border-gray-800">
          {([
            { id: 'today' as TimeRange, label: 'Today' },
            { id: 'week' as TimeRange, label: 'This Week' },
            { id: 'month' as TimeRange, label: 'This Month' },
          ]).map(t => (
            <button key={t.id} onClick={() => setTimeRange(t.id)} className={`px-3 py-1.5 rounded text-xs font-medium transition ${timeRange === t.id ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Hits View */}
      {view === 'hits' && (
        <div className="space-y-2">
          {filteredResults.slice(0, 30).map((result, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border transition ${
              i === 0 ? 'bg-amber-950/30 border-amber-800/50' :
              i === 1 ? 'bg-gray-900 border-gray-700' :
              i === 2 ? 'bg-gray-900 border-orange-800/30' :
              'bg-gray-900 border-gray-800'
            }`}>
              <div className={`w-8 text-center font-bold text-sm ${
                i === 0 ? 'text-amber-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-orange-400' : 'text-gray-500'
              }`}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${result.rank}`}
              </div>
              <div className="text-lg">{result.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">{result.card}</div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{result.username}</span>
                  <span>·</span>
                  <span>{result.grade}</span>
                  <span>·</span>
                  <span>{result.time}</span>
                </div>
              </div>
              <div className={`font-bold text-sm whitespace-nowrap ${result.value >= 1000 ? 'text-amber-400' : result.value >= 500 ? 'text-emerald-400' : 'text-white'}`}>
                {formatValue(result.value)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Leaderboard View */}
      {view === 'leaderboard' && (
        <div className="space-y-2">
          {leaderboard.slice(0, 20).map((entry, i) => (
            <div key={i} className={`flex items-center gap-3 p-4 rounded-lg border transition ${
              i === 0 ? 'bg-amber-950/30 border-amber-800/50' :
              i === 1 ? 'bg-gray-900 border-gray-700' :
              i === 2 ? 'bg-gray-900 border-orange-800/30' :
              'bg-gray-900 border-gray-800'
            }`}>
              <div className={`w-8 text-center font-bold text-sm ${
                i === 0 ? 'text-amber-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-orange-400' : 'text-gray-500'
              }`}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${entry.rank}`}
              </div>
              <div className="text-xl">{entry.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-bold">{entry.username}</div>
                <div className="text-xs text-gray-500">
                  {entry.breaks} breaks · Best: {formatValue(entry.bestHitValue)}
                </div>
                <div className="text-xs text-gray-600 truncate">{entry.bestHit}</div>
              </div>
              <div className="text-right">
                <div className={`font-bold ${entry.totalValue >= 5000 ? 'text-amber-400' : entry.totalValue >= 2000 ? 'text-emerald-400' : 'text-white'}`}>
                  {formatValue(entry.totalValue)}
                </div>
                <div className="text-xs text-gray-500">total value</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer info */}
      <div className="mt-6 text-center text-gray-600 text-xs">
        Simulated break results refresh daily · Same results for all collectors each day · {allResults.length} hits tracked
      </div>
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

function dateHash(d: Date): number {
  const s = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; }
  return Math.abs(h);
}

function seededRng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

function parseValue(v: string): number {
  const m = v.match(/\$[\d,]+/);
  return m ? parseInt(m[0].replace(/[$,]/g, ''), 10) : 0;
}

function formatDateStr(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function toInputDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

const SPORT_EMOJI: Record<string, string> = { baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒' };
const SPORT_COLORS: Record<string, string> = { baseball: 'text-rose-400', basketball: 'text-orange-400', football: 'text-emerald-400', hockey: 'text-sky-400' };

const EVENTS_BY_MONTH: Record<number, string[]> = {
  0: ['HOF Voting', 'NFL Playoffs', 'NHL All-Star Weekend'],
  1: ['Super Bowl', 'NBA All-Star Weekend', 'Spring Training Begins'],
  2: ['March Madness', 'NHL Trade Deadline', 'MLB Spring Training'],
  3: ['Opening Day (MLB)', 'NFL Draft', 'NBA Playoffs Start'],
  4: ['NBA Conference Finals', 'NHL Playoffs', 'MLB Trade Rumors'],
  5: ['NBA Finals', 'NBA Draft', 'Stanley Cup Finals', 'MLB All-Star Voting'],
  6: ['MLB All-Star Game', 'MLB Trade Deadline', 'NFL Training Camps', 'NBA Free Agency'],
  7: ['NFL Preseason', 'MLB Pennant Race', 'NHL Preseason'],
  8: ['NFL Season Start', 'MLB Playoffs', 'NHL Season Start'],
  9: ['World Series', 'NFL Mid-Season', 'NBA Tipoff', 'NHL Early Season'],
  10: ['NBA Early Season', 'NFL Playoff Push', 'MLB Awards'],
  11: ['Holiday Shopping', 'NFL Playoff Clinching', 'NHL Outdoor Games'],
};

const INSIGHTS = [
  'Vintage cards tend to appreciate steadily regardless of season.',
  'Modern rookies are most volatile during their sport\'s playoff push.',
  'Graded cards move less than raw cards during market swings.',
  'The eBay best offer acceptance rate is highest during off-seasons.',
  'Card show attendance peaks in the 3 weeks before Christmas.',
  'PSA submission volume drops 40% in summer — expect faster turnarounds.',
  'The average card flip generates 22% gross margin before fees.',
  'Sealed product values are inversely correlated with interest rates.',
  'Hockey cards see the biggest percentage swings of any sport.',
  'Baseball has the deepest vintage market — cards from 1880s still trade regularly.',
  'The junk wax era (1987-1993) produced more cards than all prior years combined.',
  'BGS 9.5 and PSA 10 command similar premiums for modern cards.',
  'Error cards appreciate fastest when they are widely known but low-population.',
  'Draft night creates more card market volume than any single event except the Super Bowl.',
];

function generateSnapshot(date: Date) {
  const seed = dateHash(date);
  const r = seededRng(seed);
  const cards = [...sportsCards].sort(() => r() - 0.5);
  const month = date.getMonth();

  // Market mood
  const moodVal = r();
  const mood: 'Bullish' | 'Neutral' | 'Bearish' = moodVal > 0.55 ? 'Bullish' : moodVal > 0.25 ? 'Neutral' : 'Bearish';
  const moodPct = mood === 'Bullish' ? `+${(r() * 3.5 + 0.5).toFixed(1)}%` : mood === 'Bearish' ? `-${(r() * 3 + 0.3).toFixed(1)}%` : `${(r() > 0.5 ? '+' : '-')}${(r() * 0.8 + 0.1).toFixed(1)}%`;

  // Top 5 gainers
  const used = new Set<string>();
  const gainers = cards
    .filter(c => !used.has(c.player) && parseValue(c.estimatedValueGem) > 20)
    .slice(0, 15)
    .map(c => { used.add(c.player); return { card: c, change: `+${(r() * 20 + 2).toFixed(1)}%` }; })
    .sort((a, b) => parseFloat(b.change) - parseFloat(a.change))
    .slice(0, 5);

  // Top 5 losers
  const losers = cards
    .filter(c => !used.has(c.player) && parseValue(c.estimatedValueGem) > 20)
    .slice(0, 15)
    .map(c => { used.add(c.player); return { card: c, change: `-${(r() * 15 + 1).toFixed(1)}%` }; })
    .sort((a, b) => parseFloat(a.change) - parseFloat(b.change))
    .slice(0, 5);

  // Sport performance
  const sports = ['baseball', 'basketball', 'football', 'hockey'];
  const sportPerf = sports.map(s => {
    const v = r();
    return {
      sport: s,
      change: v > 0.55 ? `+${(r() * 5 + 0.5).toFixed(1)}%` : v > 0.2 ? `${(r() > 0.5 ? '+' : '-')}${(r() * 1).toFixed(1)}%` : `-${(r() * 4 + 0.3).toFixed(1)}%`,
      direction: v > 0.55 ? 'up' as const : v > 0.2 ? 'flat' as const : 'down' as const,
    };
  });

  // Events for this month
  const events = EVENTS_BY_MONTH[month] || [];
  const activeEvent = events[Math.floor(r() * events.length)];

  // Market cap estimate
  const baseCap = 12500000000; // $12.5B base
  const capMod = 1 + (r() - 0.5) * 0.08;
  const marketCap = Math.round(baseCap * capMod);

  // Volume
  const baseVolume = 2800000;
  const volMod = 1 + (r() - 0.5) * 0.3;
  const volume = Math.round(baseVolume * volMod);

  // Card of the day (for this date)
  const cotdIndex = seed % sportsCards.length;
  const cardOfDay = sportsCards[cotdIndex];

  // Insight
  const insight = INSIGHTS[seed % INSIGHTS.length];

  return { mood, moodPct, gainers, losers, sportPerf, activeEvent, events, marketCap, volume, cardOfDay, insight, seed };
}

export default function MarketReplayClient() {
  const today = new Date();
  const [dateA, setDateA] = useState(toInputDate(today));
  const [dateB, setDateB] = useState('');
  const [showCompare, setShowCompare] = useState(false);

  const snapA = useMemo(() => generateSnapshot(new Date(dateA + 'T12:00:00')), [dateA]);
  const snapB = useMemo(() => dateB ? generateSnapshot(new Date(dateB + 'T12:00:00')) : null, [dateB]);

  const renderSnapshot = (snap: ReturnType<typeof generateSnapshot>, date: string, label?: string) => {
    const d = new Date(date + 'T12:00:00');
    return (
      <div className="space-y-5">
        {label && <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">{label}</div>}

        {/* Date + Mood */}
        <div className="p-4 bg-gray-800/40 border border-gray-700/40 rounded-xl">
          <div className="text-gray-400 text-sm">{formatDateStr(d)}</div>
          <div className="flex items-center justify-between mt-2">
            <div className={`text-2xl font-bold ${snap.mood === 'Bullish' ? 'text-emerald-400' : snap.mood === 'Bearish' ? 'text-red-400' : 'text-yellow-400'}`}>
              {snap.mood === 'Bullish' ? '🟢' : snap.mood === 'Bearish' ? '🔴' : '🟡'} {snap.mood}
            </div>
            <div className={`text-xl font-bold ${snap.moodPct.startsWith('+') ? 'text-emerald-400' : snap.moodPct.startsWith('-') ? 'text-red-400' : 'text-gray-400'}`}>
              {snap.moodPct}
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-800/30 border border-gray-700/30 rounded-xl text-center">
            <div className="text-xs text-gray-500">Market Cap</div>
            <div className="text-white font-bold">${(snap.marketCap / 1e9).toFixed(1)}B</div>
          </div>
          <div className="p-3 bg-gray-800/30 border border-gray-700/30 rounded-xl text-center">
            <div className="text-xs text-gray-500">Daily Volume</div>
            <div className="text-white font-bold">${(snap.volume / 1e6).toFixed(1)}M</div>
          </div>
        </div>

        {/* Sport Performance */}
        <div className="grid grid-cols-4 gap-2">
          {snap.sportPerf.map(sp => (
            <div key={sp.sport} className="p-2 bg-gray-800/30 border border-gray-700/30 rounded-lg text-center">
              <div className="text-lg">{SPORT_EMOJI[sp.sport]}</div>
              <div className={`text-xs font-bold ${sp.direction === 'up' ? 'text-emerald-400' : sp.direction === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
                {sp.change}
              </div>
            </div>
          ))}
        </div>

        {/* Active Event */}
        {snap.activeEvent && (
          <div className="p-3 bg-amber-950/30 border border-amber-800/30 rounded-xl flex items-center gap-2">
            <span className="text-amber-400 text-sm">📅</span>
            <span className="text-amber-400 text-sm font-medium">{snap.activeEvent}</span>
          </div>
        )}

        {/* Top Movers */}
        <div className="grid grid-cols-1 gap-3">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Top Gainers</div>
            {snap.gainers.map((g, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-800/30 last:border-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-gray-600 w-3">{i + 1}</span>
                  <span className="text-xs">{SPORT_EMOJI[g.card.sport]}</span>
                  <Link href={`/sports/${g.card.slug}`} className="text-gray-300 text-xs truncate hover:text-white">{g.card.player}</Link>
                </div>
                <span className="text-emerald-400 text-xs font-bold shrink-0 ml-2">{g.change}</span>
              </div>
            ))}
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Top Decliners</div>
            {snap.losers.map((l, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-800/30 last:border-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-gray-600 w-3">{i + 1}</span>
                  <span className="text-xs">{SPORT_EMOJI[l.card.sport]}</span>
                  <Link href={`/sports/${l.card.slug}`} className="text-gray-300 text-xs truncate hover:text-white">{l.card.player}</Link>
                </div>
                <span className="text-red-400 text-xs font-bold shrink-0 ml-2">{l.change}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card of the Day */}
        <div className="p-3 bg-gray-800/30 border border-gray-700/30 rounded-xl">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Card of the Day</div>
          <Link href={`/sports/${snap.cardOfDay.slug}`} className="text-white text-sm font-medium hover:text-amber-400">{snap.cardOfDay.name}</Link>
          <div className="text-gray-500 text-xs mt-0.5">{snap.cardOfDay.player} &middot; {snap.cardOfDay.estimatedValueRaw}</div>
        </div>

        {/* Insight */}
        <div className="p-3 bg-violet-950/20 border border-violet-800/20 rounded-xl">
          <div className="text-xs text-violet-400 uppercase tracking-wider mb-1">Market Insight</div>
          <p className="text-gray-300 text-sm">{snap.insight}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Date Picker */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">
            {showCompare ? 'Date A' : 'Select Date'}
          </label>
          <input
            type="date"
            value={dateA}
            onChange={e => setDateA(e.target.value)}
            max={toInputDate(today)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-amber-600"
          />
        </div>
        {showCompare && (
          <div className="flex-1">
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Date B</label>
            <input
              type="date"
              value={dateB}
              onChange={e => setDateB(e.target.value)}
              max={toInputDate(today)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-amber-600"
            />
          </div>
        )}
        <div className="flex items-end">
          <button
            onClick={() => { setShowCompare(!showCompare); if (showCompare) setDateB(''); }}
            className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${showCompare ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'}`}
          >
            {showCompare ? 'Single View' : 'Compare Dates'}
          </button>
        </div>
      </div>

      {/* Quick Date Buttons */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'Today', days: 0 },
          { label: 'Yesterday', days: 1 },
          { label: '1 Week Ago', days: 7 },
          { label: '1 Month Ago', days: 30 },
          { label: '3 Months Ago', days: 90 },
          { label: '6 Months Ago', days: 180 },
          { label: '1 Year Ago', days: 365 },
        ].map(({ label, days }) => {
          const d = new Date(today);
          d.setDate(d.getDate() - days);
          const val = toInputDate(d);
          return (
            <button
              key={label}
              onClick={() => setDateA(val)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${dateA === val ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700/50'}`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Snapshots */}
      {showCompare && dateB ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 bg-gray-900/50 border border-gray-700/40 rounded-2xl">
            {renderSnapshot(snapA, dateA, 'Date A')}
          </div>
          <div className="p-5 bg-gray-900/50 border border-gray-700/40 rounded-2xl">
            {snapB && renderSnapshot(snapB, dateB, 'Date B')}
          </div>
        </div>
      ) : (
        <div className="p-5 bg-gray-900/50 border border-gray-700/40 rounded-2xl">
          {renderSnapshot(snapA, dateA)}
        </div>
      )}
    </div>
  );
}

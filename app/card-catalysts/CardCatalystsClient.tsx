'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

/* ------------------------------------------------------------------ */
/*  Data — upcoming sports events that move card prices               */
/* ------------------------------------------------------------------ */

type Sport = 'all' | 'football' | 'basketball' | 'hockey' | 'baseball';
type Signal = 'BUY' | 'SELL' | 'HOLD';

interface CatalystCard {
  name: string;
  slug?: string;
  signal: Signal;
  reason: string;
}

interface Catalyst {
  id: string;
  event: string;
  sport: Sport;
  date: string;          // ISO string
  location?: string;
  emoji: string;
  impact: 'high' | 'medium' | 'low';
  description: string;
  historicalPattern: string;
  cards: CatalystCard[];
}

const catalysts: Catalyst[] = [
  {
    id: 'nfl-draft-2026',
    event: '2026 NFL Draft',
    sport: 'football',
    date: '2026-04-23',
    location: 'Pittsburgh, PA',
    emoji: '\uD83C\uDFC8',
    impact: 'high',
    description: 'Top QB and skill position prospects will see massive price spikes on draft night. Pre-draft is the best time to buy rookie cards of projected top picks.',
    historicalPattern: 'First-round QB picks typically see 40-80% price increases within 48 hours of being drafted. Skill position players (WR/RB) see 20-40% spikes.',
    cards: [
      { name: 'Shedeur Sanders Bowman U', slug: 'shedeur-sanders', signal: 'BUY', reason: 'Projected #1 pick — maximum draft night spike potential' },
      { name: 'Cam Ward Prizm Draft', slug: 'cam-ward', signal: 'BUY', reason: 'Top-5 QB prospect, strong Heisman campaign' },
      { name: 'Travis Hunter Contenders Draft', slug: 'travis-hunter', signal: 'BUY', reason: 'Rare two-way player, Heisman winner — unique collectibility' },
      { name: 'Caleb Williams Prizm', slug: 'caleb-williams', signal: 'HOLD', reason: 'Sophomore season will determine next move — wait for NFL results' },
      { name: 'Jayden Daniels Prizm', slug: 'jayden-daniels', signal: 'HOLD', reason: 'Strong rookie year priced in — hold through draft for next wave' },
    ],
  },
  {
    id: 'nba-playoffs-2026',
    event: '2026 NBA Playoffs',
    sport: 'basketball',
    date: '2026-04-19',
    emoji: '\uD83C\uDFC0',
    impact: 'high',
    description: 'Playoff performers see consistent price increases. Deep playoff runs and Finals appearances create lasting demand. Stars who underperform see corrections.',
    historicalPattern: 'Players who make the Conference Finals see 15-30% appreciation. Finals MVP candidates can spike 50-100%. Early exits often trigger 10-20% declines.',
    cards: [
      { name: 'Victor Wembanyama Prizm', slug: 'victor-wembanyama', signal: 'BUY', reason: 'First playoff run — any highlight moments will drive demand' },
      { name: 'Luka Doncic Prizm Silver', slug: 'luka-doncic', signal: 'HOLD', reason: 'Playoff track record priced in — but Finals run would spike prices' },
      { name: 'Anthony Edwards Prizm', slug: 'anthony-edwards', signal: 'BUY', reason: 'Deep playoff run expected — face of the next generation' },
      { name: 'Nikola Jokic Prizm', slug: 'nikola-jokic', signal: 'HOLD', reason: 'Consistent MVP candidate — steady growth regardless of playoffs' },
      { name: 'Chet Holmgren Prizm', slug: 'chet-holmgren', signal: 'BUY', reason: 'Young star in playoff mix — breakout potential undervalued' },
    ],
  },
  {
    id: 'nhl-playoffs-2026',
    event: '2026 NHL Stanley Cup Playoffs',
    sport: 'hockey',
    date: '2026-04-15',
    emoji: '\uD83C\uDFD2',
    impact: 'medium',
    description: 'Hockey card prices are heavily influenced by playoff success. Conn Smythe candidates see the biggest spikes. Goalie cards surge during hot streaks.',
    historicalPattern: 'Stanley Cup champions see 20-40% appreciation on key cards. Conn Smythe winners can spike 60%+. Goalies with hot playoff runs see the most dramatic moves.',
    cards: [
      { name: 'Connor McDavid Young Guns', slug: 'connor-mcdavid', signal: 'BUY', reason: 'Cup window closing — championship would send prices soaring' },
      { name: 'Cale Makar Young Guns', slug: 'cale-makar', signal: 'HOLD', reason: 'Already a champion — steady blue-chip hold' },
      { name: 'Connor Bedard Young Guns', slug: 'connor-bedard', signal: 'HOLD', reason: 'Young star — playoff experience alone adds value long-term' },
      { name: 'Artemi Panarin Young Guns', slug: 'artemi-panarin', signal: 'BUY', reason: 'Deep Cup run would validate career — undervalued vs. peers' },
    ],
  },
  {
    id: 'mlb-allstar-2026',
    event: '2026 MLB All-Star Game',
    sport: 'baseball',
    date: '2026-07-14',
    location: 'Citizens Bank Park, Philadelphia',
    emoji: '\u26BE',
    impact: 'medium',
    description: 'All-Star selections validate first-half performance and drive buying interest. First-time All-Stars see the biggest bumps. Home Run Derby participants get extra attention.',
    historicalPattern: 'First-time All-Stars see 10-25% price increases around selection weekend. Home Run Derby winners can spike 30%+ in the 48 hours after the event.',
    cards: [
      { name: 'Paul Skenes Bowman Chrome', slug: 'paul-skenes', signal: 'BUY', reason: 'Dominant young arm — All-Star nod would confirm superstar trajectory' },
      { name: 'Shohei Ohtani Topps Chrome', slug: 'shohei-ohtani', signal: 'HOLD', reason: 'Blue chip — already priced as generational talent' },
      { name: 'Jackson Holliday Bowman 1st', slug: 'jackson-holliday', signal: 'BUY', reason: 'Breakout potential — ASG selection would validate hype' },
      { name: 'Gunnar Henderson Topps Chrome', slug: 'gunnar-henderson', signal: 'BUY', reason: 'Young star on the rise — Derby participation adds hype' },
      { name: 'Mike Trout Topps Update', slug: 'mike-trout', signal: 'HOLD', reason: 'Legacy card — health is the only catalyst left' },
    ],
  },
  {
    id: 'nba-draft-2026',
    event: '2026 NBA Draft',
    sport: 'basketball',
    date: '2026-06-25',
    emoji: '\uD83C\uDFC0',
    impact: 'high',
    description: 'The NBA Draft reshapes the hobby. Top picks immediately become the most sought-after rookies. Pre-draft cards from college sets spike on draft night.',
    historicalPattern: '#1 overall picks see 100-300% price increases on college/international cards within a week of being drafted. Top-5 picks consistently see 50%+ gains.',
    cards: [
      { name: 'Cooper Flagg (Duke)', signal: 'BUY', reason: 'Consensus #1 — buy any available product before draft night' },
      { name: 'Ace Bailey (Rutgers)', signal: 'BUY', reason: 'Top-3 prospect — scoring wing with star potential' },
      { name: 'Dylan Harper (Rutgers)', signal: 'BUY', reason: 'Lottery lock — guard with NBA-ready game' },
      { name: 'VJ Edgecombe (Baylor)', signal: 'BUY', reason: 'Athletic freak — upside play at lottery value' },
    ],
  },
  {
    id: 'nfl-training-camp-2026',
    event: 'NFL Training Camps Open',
    sport: 'football',
    date: '2026-07-22',
    emoji: '\uD83C\uDFC8',
    impact: 'medium',
    description: 'Training camp buzz creates the next wave of hype. Breakout reports from camp drive buying. Fantasy football draft prep starts — casual collectors enter the market.',
    historicalPattern: 'Camp standouts see 15-25% price bumps from beat reporter hype. Fantasy football draft guides drive traffic to card markets starting in late July.',
    cards: [
      { name: 'Shedeur Sanders Rookie Cards', slug: 'shedeur-sanders', signal: 'HOLD', reason: 'Post-draft cool-off — buy the dip if camp reports are positive' },
      { name: 'Bijan Robinson Prizm', slug: 'bijan-robinson', signal: 'BUY', reason: 'Volume RB entering prime — camp buzz will reignite demand' },
      { name: 'CJ Stroud Prizm', slug: 'cj-stroud', signal: 'HOLD', reason: 'Established star — camp won\'t move the needle much' },
    ],
  },
  {
    id: 'mlb-trade-deadline-2026',
    event: '2026 MLB Trade Deadline',
    sport: 'baseball',
    date: '2026-07-29',
    emoji: '\u26BE',
    impact: 'medium',
    description: 'Prospect trades to contenders create instant demand. Players traded to big-market teams see card price spikes from new fan bases discovering them.',
    historicalPattern: 'Prospects traded to contenders see 20-40% price increases. Stars traded to big-market teams (Yankees, Dodgers) see 10-25% bumps from expanded fan interest.',
    cards: [
      { name: 'Top Prospect Cards', signal: 'BUY', reason: 'Prospects on the block become instant stars if traded to contenders' },
      { name: 'Shohei Ohtani Topps Chrome', slug: 'shohei-ohtani', signal: 'HOLD', reason: 'Blue chip — trade deadline contender positioning already priced in' },
    ],
  },
  {
    id: 'mlb-postseason-2026',
    event: '2026 MLB Postseason',
    sport: 'baseball',
    date: '2026-10-01',
    emoji: '\u26BE',
    impact: 'high',
    description: 'October baseball creates the biggest card market moves in the sport. World Series heroes become legends overnight. Rookie postseason performers see lasting demand.',
    historicalPattern: 'World Series MVPs see 40-80% price spikes. Postseason walk-off heroes see immediate 20-50% jumps. Even solid role players see 10-15% appreciation from a ring.',
    cards: [
      { name: 'Paul Skenes Bowman Chrome', slug: 'paul-skenes', signal: 'BUY', reason: 'If Pirates contend, a playoff Skenes is a generational moment' },
      { name: 'Mookie Betts Topps Chrome', slug: 'mookie-betts', signal: 'HOLD', reason: 'Championship pedigree — another ring solidifies HOF case' },
      { name: 'Gunnar Henderson Topps Chrome', slug: 'gunnar-henderson', signal: 'BUY', reason: 'Young star on contending team — October stage would elevate' },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function daysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const impactColors = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const signalColors: Record<Signal, string> = {
  BUY: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  SELL: 'bg-red-500/20 text-red-400 border-red-500/40',
  HOLD: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
};

const sportFilters: { value: Sport; label: string; emoji: string }[] = [
  { value: 'all', label: 'All Sports', emoji: '\uD83C\uDFAF' },
  { value: 'football', label: 'Football', emoji: '\uD83C\uDFC8' },
  { value: 'basketball', label: 'Basketball', emoji: '\uD83C\uDFC0' },
  { value: 'baseball', label: 'Baseball', emoji: '\u26BE' },
  { value: 'hockey', label: 'Hockey', emoji: '\uD83C\uDFD2' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function CardCatalystsClient() {
  const [filter, setFilter] = useState<Sport>('all');
  const [, setTick] = useState(0);

  // Re-render every minute for live countdowns
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const filtered = catalysts
    .filter(c => filter === 'all' || c.sport === filter)
    .sort((a, b) => {
      const da = daysUntil(a.date);
      const db = daysUntil(b.date);
      // Show upcoming first, then past
      if (da >= 0 && db >= 0) return da - db;
      if (da < 0 && db < 0) return db - da;
      return da >= 0 ? -1 : 1;
    });

  const nextEvent = filtered.find(c => daysUntil(c.date) >= 0);
  const totalBuySignals = catalysts.flatMap(c => c.cards).filter(c => c.signal === 'BUY').length;
  const totalHoldSignals = catalysts.flatMap(c => c.cards).filter(c => c.signal === 'HOLD').length;

  return (
    <div>
      {/* Market Pulse Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{catalysts.length}</div>
          <div className="text-xs text-gray-400 mt-1">Upcoming Events</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{totalBuySignals}</div>
          <div className="text-xs text-gray-400 mt-1">Buy Signals</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{totalHoldSignals}</div>
          <div className="text-xs text-gray-400 mt-1">Hold Signals</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">
            {nextEvent ? `${daysUntil(nextEvent.date)}d` : '--'}
          </div>
          <div className="text-xs text-gray-400 mt-1">Next Event</div>
        </div>
      </div>

      {/* Sport Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {sportFilters.map(sf => (
          <button
            key={sf.value}
            onClick={() => setFilter(sf.value)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
              filter === sf.value
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-gray-900/60 text-gray-400 border-gray-800 hover:border-gray-600 hover:text-gray-300'
            }`}
          >
            <span>{sf.emoji}</span>
            <span>{sf.label}</span>
          </button>
        ))}
      </div>

      {/* Catalyst Cards */}
      <div className="space-y-6">
        {filtered.map(catalyst => {
          const days = daysUntil(catalyst.date);
          const isPast = days < 0;

          return (
            <div
              key={catalyst.id}
              className={`bg-gray-900/40 border rounded-2xl overflow-hidden ${
                isPast ? 'border-gray-800/50 opacity-60' : 'border-gray-800'
              }`}
            >
              {/* Event Header */}
              <div className="p-5 sm:p-6 border-b border-gray-800/60">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{catalyst.emoji}</span>
                    <div>
                      <h3 className="text-lg font-bold text-white">{catalyst.event}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-sm text-gray-400">{formatDate(catalyst.date)}</span>
                        {catalyst.location && (
                          <span className="text-sm text-gray-500">
                            &middot; {catalyst.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${impactColors[catalyst.impact]}`}>
                      {catalyst.impact.toUpperCase()} IMPACT
                    </span>
                    {!isPast && (
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                        days <= 7
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                          : days <= 30
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : 'bg-gray-800 text-gray-400 border border-gray-700'
                      }`}>
                        {days === 0 ? 'TODAY' : days === 1 ? 'TOMORROW' : `${days} days`}
                      </span>
                    )}
                    {isPast && (
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-800 text-gray-500 border border-gray-700">
                        PASSED
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{catalyst.description}</p>
              </div>

              {/* Historical Pattern */}
              <div className="px-5 sm:px-6 py-3 bg-blue-950/20 border-b border-gray-800/40">
                <div className="flex items-start gap-2">
                  <span className="text-blue-400 text-xs mt-0.5 shrink-0">PATTERN</span>
                  <p className="text-xs text-blue-300/80 leading-relaxed">{catalyst.historicalPattern}</p>
                </div>
              </div>

              {/* Cards to Watch */}
              <div className="p-5 sm:p-6">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Cards to Watch</h4>
                <div className="space-y-2.5">
                  {catalyst.cards.map((card, i) => (
                    <div
                      key={i}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 bg-gray-800/30 rounded-xl"
                    >
                      <div className="flex items-center gap-2 sm:w-28 shrink-0">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold border ${signalColors[card.signal]}`}>
                          {card.signal}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        {card.slug ? (
                          <Link
                            href={`/players/${card.slug}`}
                            className="text-sm font-medium text-white hover:text-emerald-400 transition-colors"
                          >
                            {card.name}
                          </Link>
                        ) : (
                          <span className="text-sm font-medium text-white">{card.name}</span>
                        )}
                        <p className="text-xs text-gray-500 mt-0.5">{card.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No catalysts found for this sport filter.</p>
          <button
            onClick={() => setFilter('all')}
            className="mt-4 px-6 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-lg text-sm font-medium hover:bg-emerald-500/30 transition-colors"
          >
            Show All Sports
          </button>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-8 p-4 bg-gray-900/30 border border-gray-800/50 rounded-xl">
        <p className="text-xs text-gray-500 leading-relaxed">
          <strong className="text-gray-400">Disclaimer:</strong> Catalyst signals are based on historical patterns and market analysis. They are not financial advice. Card prices are volatile and past performance does not guarantee future results. Always do your own research before making buying or selling decisions.
        </p>
      </div>
    </div>
  );
}

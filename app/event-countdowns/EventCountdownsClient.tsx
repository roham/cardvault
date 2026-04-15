'use client';

import { useState, useEffect, useMemo } from 'react';

/* ─── types ─── */
type Sport = 'football' | 'basketball' | 'baseball' | 'hockey' | 'multi';
type ImpactLevel = 'extreme' | 'high' | 'moderate' | 'low';

interface HobbyEvent {
  name: string;
  date: Date;
  sport: Sport;
  impact: number; // 1-10
  impactLevel: ImpactLevel;
  strategy: string;
  description: string;
  priceEffect: string;
}

/* ─── event data (2025-2026 calendar) ─── */
function getEvents(): HobbyEvent[] {
  const year = new Date().getFullYear();
  const nextYear = year + 1;

  const list: HobbyEvent[] = [
    {
      name: '2025 NFL Draft',
      date: new Date(2025, 3, 24), // April 24, 2025
      sport: 'football',
      impact: 10,
      impactLevel: 'extreme',
      strategy: 'Buy prospect cards BEFORE draft night. Sell into the spike within 48 hours of being drafted. First-round picks see 100-300% spikes on draft night.',
      description: 'The biggest single-day catalyst in the card hobby. Top picks see instant price explosions. Green Bay hosts in 2025.',
      priceEffect: 'Draft picks: +100-300%. Undrafted seniors: -30-50%.',
    },
    {
      name: '2025 NBA Draft',
      date: new Date(2025, 5, 25), // June 25, 2025
      sport: 'basketball',
      impact: 8,
      impactLevel: 'high',
      strategy: 'Position in top prospect Bowman University and college cards before draft. Cooper Flagg likely #1 — his cards will spike. Sell lottery picks within first week.',
      description: 'The 2025 class is headlined by Cooper Flagg (Duke). Two-round format with lottery intrigue.',
      priceEffect: 'Lottery picks: +50-200%. Second rounders: +20-50%.',
    },
    {
      name: '2025 MLB Draft',
      date: new Date(2025, 6, 13), // July 13, 2025
      sport: 'baseball',
      impact: 5,
      impactLevel: 'moderate',
      strategy: 'MLB Draft impact is delayed — prospects take 2-3 years to reach majors. Buy Bowman 1st Chrome of top picks and hold. Immediate spike is small compared to NFL/NBA.',
      description: 'College and high school players selected. Impact is long-term as prospects develop through minors.',
      priceEffect: 'Top picks Bowman 1st: +20-80%. Slow burn over 2-3 years.',
    },
    {
      name: '2025 NHL Draft',
      date: new Date(2025, 6, 27), // June 27, 2025
      sport: 'hockey',
      impact: 4,
      impactLevel: 'low',
      strategy: 'Hockey draft picks take 1-2 years to appear on NHL cards. Buy Young Guns when they debut, not at draft. Focus on CHL/European league cards of top picks.',
      description: 'Two-day event selecting top junior and international prospects. Impact is delayed until NHL debut.',
      priceEffect: 'Minimal immediate impact. Young Guns debut: +50-150%.',
    },
    {
      name: 'Super Bowl LIX',
      date: new Date(2025, 1, 9), // Feb 9, 2025
      sport: 'football',
      impact: 9,
      impactLevel: 'extreme',
      strategy: 'Buy cards of likely contenders in November/December. Sell into Super Bowl week hype. MVP cards spike 50-100% on game night. Losing team cards drop 20-30%.',
      description: 'The pinnacle of NFL card demand. MVP and key performer cards see massive movement. New Orleans hosts.',
      priceEffect: 'MVP: +50-100%. Winner RCs: +30-50%. Losers: -20-30%.',
    },
    {
      name: '2025 NBA Finals',
      date: new Date(2025, 5, 5), // June 5, 2025 (approximate)
      sport: 'basketball',
      impact: 8,
      impactLevel: 'high',
      strategy: 'Buy cards of conference finals teams. Sell into Finals hype. Championship winners see lasting premium — Finals MVP cards can hold 30-50% above pre-playoff levels.',
      description: 'The NBA championship series. Finals MVP creates the single biggest basketball card catalyst of the year.',
      priceEffect: 'Finals MVP: +50-100%. Champion RCs: +20-40%.',
    },
    {
      name: '2025 World Series',
      date: new Date(2025, 9, 24), // October 24, 2025 (approximate)
      sport: 'baseball',
      impact: 7,
      impactLevel: 'high',
      strategy: 'Buy October heroes during the regular season when prices are lower. WS MVP cards see strong spikes. Rookie cards of breakout postseason performers are the best targets.',
      description: 'The Fall Classic. Postseason heroes see dramatic card price movement. First-time champions create the biggest spikes.',
      priceEffect: 'WS MVP: +40-80%. Champion rookies: +20-40%.',
    },
    {
      name: '2025 Stanley Cup Finals',
      date: new Date(2025, 5, 14), // June 14, 2025 (approximate)
      sport: 'hockey',
      impact: 5,
      impactLevel: 'moderate',
      strategy: 'Hockey card demand is lower volume but dedicated collectors pay premiums. Conn Smythe winners see significant spikes in a smaller market. Young Guns are the key cards.',
      description: 'The NHL championship. Conn Smythe (playoff MVP) winner cards see the biggest movement in hockey.',
      priceEffect: 'Conn Smythe winner: +30-60%. Cup champion YGs: +15-30%.',
    },
    {
      name: 'NSCC National 2025',
      date: new Date(2025, 6, 23), // July 23-27, 2025 (approximate)
      sport: 'multi',
      impact: 9,
      impactLevel: 'extreme',
      strategy: 'The best in-person buying event of the year. Dealers discount to move inventory. Exclusive show cards from Topps/Panini/UD create instant collectibles. Attend if possible — or buy NSCC exclusives on eBay.',
      description: 'The National Sports Collectors Convention — the largest card show in the world. 500+ dealer booths, exclusive releases, celebrity signings. Cleveland hosts in 2025.',
      priceEffect: 'NSCC exclusives: instant premium. Show deals: 10-30% below market.',
    },
    {
      name: 'MLB Opening Day 2025',
      date: new Date(2025, 2, 27), // March 27, 2025
      sport: 'baseball',
      impact: 6,
      impactLevel: 'moderate',
      strategy: 'Buy baseball cards during winter when demand is lowest. Opening Day creates the annual baseball hype cycle. Rookie cards of promoted prospects spike on debut day.',
      description: 'The start of the MLB season. Annual optimism and prospect promotions drive early-season card demand.',
      priceEffect: 'MLB rookies: +15-40% around debut. Season-long uptrend begins.',
    },
    {
      name: 'NFL Kickoff 2025',
      date: new Date(2025, 8, 4), // September 4, 2025
      sport: 'football',
      impact: 7,
      impactLevel: 'high',
      strategy: 'The start of peak football card season. Buy in July/August while prices are still at summer lows. Sell into mid-season hype (October-November). Fantasy football drives massive retail demand.',
      description: 'The first game of the NFL season. Football card demand goes from off-season lows to peak over the next 5 months.',
      priceEffect: 'Football RCs: +20-40% from summer lows. Season builds to Super Bowl peak.',
    },
    {
      name: 'MLB All-Star Game 2025',
      date: new Date(2025, 6, 15), // July 15, 2025
      sport: 'baseball',
      impact: 4,
      impactLevel: 'low',
      strategy: 'Modest catalyst. First-time All-Stars see a small bump. The bigger play is the Home Run Derby — derby winners and participants get a short-term spike.',
      description: 'Mid-season showcase with the Home Run Derby. Minor catalyst but first-time selections create brief demand.',
      priceEffect: 'First-time All-Stars: +5-15%. HR Derby winner: +10-20% (brief).',
    },
    {
      name: 'NBA All-Star Weekend 2026',
      date: new Date(nextYear, 1, 15), // February 15, 2026 (approximate)
      sport: 'basketball',
      impact: 4,
      impactLevel: 'low',
      strategy: 'Dunk Contest participants and Rising Stars game players create brief hype. Minor catalyst overall. Focus on first-time All-Star selections for sustained demand.',
      description: 'Three-day NBA showcase with Skills Challenge, Dunk Contest, and the All-Star Game.',
      priceEffect: 'First-time selections: +5-15%. Dunk Contest winner: brief spike.',
    },
    {
      name: 'Baseball HOF Induction 2025',
      date: new Date(2025, 6, 27), // July 27, 2025 (approximate)
      sport: 'baseball',
      impact: 6,
      impactLevel: 'moderate',
      strategy: 'Buy HOF candidates\' rookie cards BEFORE the voting results announcement (January). Cards spike 30-80% on election day and often hold. Ichiro\'s 2025 induction will be massive for the Japanese market.',
      description: 'Annual Hall of Fame induction ceremony in Cooperstown. Newly elected members see permanent card value increases.',
      priceEffect: 'New HOFers: +30-80% on announcement. Vintage RCs see lasting premium.',
    },
    {
      name: 'Pro Football HOF Induction 2025',
      date: new Date(2025, 7, 2), // August 2, 2025 (approximate)
      sport: 'football',
      impact: 5,
      impactLevel: 'moderate',
      strategy: 'Buy potential inductees\' rookie cards before announcement in February. Football HOF creates a lasting premium, especially for players from popular teams. Canton weekend is a collecting event.',
      description: 'Annual enshrinement in Canton, Ohio. New inductees\' cards see sustained premium. The class includes several modern-era players.',
      priceEffect: 'New inductees: +20-50% on announcement. RCs see lasting floor.',
    },
  ];
  list.sort((a, b) => {
    const now = Date.now();
    const aFuture = a.date.getTime() > now;
    const bFuture = b.date.getTime() > now;
    if (aFuture && !bFuture) return -1;
    if (!aFuture && bFuture) return 1;
    if (aFuture && bFuture) return a.date.getTime() - b.date.getTime();
    return b.date.getTime() - a.date.getTime();
  });
  return list;
}

/* ─── countdown calc ─── */
function getCountdown(target: Date): { days: number; hours: number; mins: number; secs: number; isPast: boolean } {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, isPast: true };
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return { days, hours, mins, secs, isPast: false };
}

/* ─── display helpers ─── */
const sportColor: Record<Sport, { text: string; bg: string; border: string }> = {
  football: { text: 'text-green-400', bg: 'bg-green-950/40', border: 'border-green-800/40' },
  basketball: { text: 'text-orange-400', bg: 'bg-orange-950/40', border: 'border-orange-800/40' },
  baseball: { text: 'text-red-400', bg: 'bg-red-950/40', border: 'border-red-800/40' },
  hockey: { text: 'text-blue-400', bg: 'bg-blue-950/40', border: 'border-blue-800/40' },
  multi: { text: 'text-purple-400', bg: 'bg-purple-950/40', border: 'border-purple-800/40' },
};

const impactColor: Record<ImpactLevel, string> = {
  extreme: 'text-red-400',
  high: 'text-orange-400',
  moderate: 'text-amber-400',
  low: 'text-gray-400',
};

/* ─── component ─── */
export default function EventCountdownsClient() {
  const events = useMemo(() => getEvents(), []);
  const [filter, setFilter] = useState<Sport | 'all'>('all');
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [, setTick] = useState(0);

  // Tick every second for live countdowns
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const filtered = filter === 'all' ? events : events.filter(e => e.sport === filter);
  const upcoming = filtered.filter(e => e.date.getTime() > Date.now());
  const past = filtered.filter(e => e.date.getTime() <= Date.now());

  const nextEvent = upcoming[0];
  const avgImpact = upcoming.length > 0
    ? (upcoming.reduce((s, e) => s + e.impact, 0) / upcoming.length).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Next Event Hero */}
      {nextEvent && (() => {
        const cd = getCountdown(nextEvent.date);
        const sc = sportColor[nextEvent.sport];
        return (
          <div className={`${sc.bg} border ${sc.border} rounded-xl p-6`}>
            <div className="text-cyan-400 text-xs font-mono uppercase tracking-wider mb-2">Next Major Event</div>
            <h2 className="text-2xl font-bold text-white mb-1">{nextEvent.name}</h2>
            <p className="text-gray-400 text-sm mb-4">{nextEvent.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                { val: cd.days, label: 'Days' },
                { val: cd.hours, label: 'Hours' },
                { val: cd.mins, label: 'Minutes' },
                { val: cd.secs, label: 'Seconds' },
              ].map(u => (
                <div key={u.label} className="bg-gray-900/60 rounded-lg p-3 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white font-mono">{String(u.val).padStart(2, '0')}</div>
                  <div className="text-gray-500 text-xs">{u.label}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-400">Market Impact:</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 10 }, (_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-4 rounded-sm ${
                      i < nextEvent.impact ? 'bg-cyan-500' : 'bg-gray-800'
                    }`}
                  />
                ))}
              </div>
              <span className={`font-medium ${impactColor[nextEvent.impactLevel]}`}>
                {nextEvent.impact}/10 ({nextEvent.impactLevel})
              </span>
            </div>
          </div>
        );
      })()}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4 text-center">
          <div className="text-gray-400 text-xs mb-1">Upcoming Events</div>
          <div className="text-cyan-400 text-2xl font-bold">{upcoming.length}</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4 text-center">
          <div className="text-gray-400 text-xs mb-1">Avg Impact</div>
          <div className="text-amber-400 text-2xl font-bold">{avgImpact}/10</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4 text-center">
          <div className="text-gray-400 text-xs mb-1">High Impact</div>
          <div className="text-red-400 text-2xl font-bold">{upcoming.filter(e => e.impact >= 7).length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['all', 'football', 'basketball', 'baseball', 'hockey', 'multi'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              filter === f
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {f === 'all' ? 'All Sports' : f === 'multi' ? 'Multi-Sport' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Upcoming Events */}
      {upcoming.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Upcoming Events</h2>
          {upcoming.map(event => {
            const cd = getCountdown(event.date);
            const sc = sportColor[event.sport];
            const isExpanded = expandedEvent === event.name;

            return (
              <div key={event.name} className="bg-gray-900/50 border border-gray-800/50 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedEvent(isExpanded ? null : event.name)}
                  className="w-full p-4 sm:p-5 text-left hover:bg-gray-800/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium uppercase ${sc.text}`}>
                        {event.sport === 'multi' ? 'ALL' : event.sport.slice(0, 3)}
                      </span>
                      <span className="text-white font-semibold">{event.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-cyan-400 font-mono text-sm">
                        {cd.days}d {cd.hours}h {cd.mins}m
                      </span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 10 }, (_, i) => (
                          <div
                            key={i}
                            className={`w-1 h-3 rounded-sm ${i < event.impact ? 'bg-cyan-500' : 'bg-gray-800'}`}
                          />
                        ))}
                      </div>
                      <span className={`text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>&#9662;</span>
                    </div>
                  </div>
                  <div className="mt-1 text-gray-500 text-xs">
                    {event.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    {' '}&middot;{' '}
                    <span className={impactColor[event.impactLevel]}>Impact: {event.impact}/10</span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-800/50 p-4 sm:p-5 space-y-3">
                    <p className="text-gray-300 text-sm">{event.description}</p>
                    <div className="bg-cyan-950/20 border border-cyan-800/30 rounded-lg p-3">
                      <div className="text-cyan-400 text-xs font-medium mb-1">Collecting Strategy</div>
                      <p className="text-gray-300 text-sm">{event.strategy}</p>
                    </div>
                    <div className="bg-gray-800/40 rounded-lg p-3">
                      <div className="text-amber-400 text-xs font-medium mb-1">Expected Price Effect</div>
                      <p className="text-gray-400 text-sm">{event.priceEffect}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Past Events */}
      {past.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-500">Recent Past Events</h2>
          {past.slice(0, 5).map(event => {
            const sc = sportColor[event.sport];
            return (
              <div key={event.name} className="bg-gray-900/30 border border-gray-800/30 rounded-xl p-4 opacity-60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium uppercase ${sc.text}`}>
                      {event.sport === 'multi' ? 'ALL' : event.sport.slice(0, 3)}
                    </span>
                    <span className="text-gray-400 font-semibold">{event.name}</span>
                  </div>
                  <span className="text-gray-600 text-xs">
                    {event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

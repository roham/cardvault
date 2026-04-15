'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

/* ───── Types ───── */
type Sport = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey';
type Impact = 'extreme' | 'high' | 'medium' | 'low';
type Urgency = 'imminent' | 'approaching' | 'watch' | 'long-term';

interface Milestone {
  player: string;
  sport: Sport;
  milestone: string;
  current: string;
  target: string;
  progress: number; // 0-100
  projectedDate: string;
  urgency: Urgency;
  impact: Impact;
  cardImpact: string;
  keyCard: string;
  keyCardSlug: string;
  context: string;
}

/* ───── Milestone data ───── */
const milestones: Milestone[] = [
  // HOCKEY
  {
    player: 'Alex Ovechkin',
    sport: 'hockey',
    milestone: 'All-Time NHL Goal Record (895)',
    current: '879 goals',
    target: '895 goals (Wayne Gretzky)',
    progress: 98,
    projectedDate: '2025-26 season',
    urgency: 'imminent',
    impact: 'extreme',
    cardImpact: 'His Young Guns RC could see 50-100% spike. This is the biggest milestone in hockey since Gretzky himself.',
    keyCard: '2005-06 UD Young Guns #443',
    keyCardSlug: '2005-06-upper-deck-young-guns-alexander-ovechkin-443',
    context: 'Only 16 goals away from the most sacred record in hockey. Every game is appointment viewing. Media coverage will be relentless as he approaches.',
  },
  {
    player: 'Sidney Crosby',
    sport: 'hockey',
    milestone: '600 Career Goals',
    current: '592 goals',
    target: '600 goals',
    progress: 99,
    projectedDate: 'Early 2025-26 season',
    urgency: 'imminent',
    impact: 'high',
    cardImpact: 'Young Guns RC should see 15-25% bump. Crosby milestones always move the hockey card market.',
    keyCard: '2005-06 UD Young Guns #201',
    keyCardSlug: '2005-06-upper-deck-sidney-crosby-201',
    context: '8 goals away. Crosby is the greatest player of his generation and 600 goals cements his offensive legacy alongside his 3 Cups.',
  },
  {
    player: 'Nathan MacKinnon',
    sport: 'hockey',
    milestone: '1,000 Career Points',
    current: '898 points',
    target: '1,000 points',
    progress: 90,
    projectedDate: 'Mid 2025-26 season',
    urgency: 'approaching',
    impact: 'high',
    cardImpact: 'His YG RC should spike 20-30%. MacKinnon is the consensus best active hockey player after Crosby.',
    keyCard: '2013-14 UD Young Guns #227',
    keyCardSlug: '2013-14-upper-deck-young-guns-nathan-mackinnon-227',
    context: '102 points away. At his current pace (~115 pts/season), MacKinnon will reach 1,000 during the 2025-26 season.',
  },
  // BASEBALL
  {
    player: 'Shohei Ohtani',
    sport: 'baseball',
    milestone: '250 Career Home Runs',
    current: '225 HR',
    target: '250 HR',
    progress: 90,
    projectedDate: 'Mid-2025 season',
    urgency: 'approaching',
    impact: 'high',
    cardImpact: 'His Topps Update RC and Bowman Chrome 1st could see 15-25% bumps. Every Ohtani milestone is global news.',
    keyCard: '2018 Topps Update #US1 RC',
    keyCardSlug: '2018-topps-update-shohei-ohtani-us1-rc',
    context: '25 HR away. As a pitcher AND hitter, Ohtani reaching milestones that pure hitters take careers to reach amplifies the significance.',
  },
  {
    player: 'Mike Trout',
    sport: 'baseball',
    milestone: '400 Career Home Runs',
    current: '389 HR',
    target: '400 HR',
    progress: 97,
    projectedDate: '2025 season (if healthy)',
    urgency: 'imminent',
    impact: 'high',
    cardImpact: 'His Topps Update RC and Bowman Chrome 1st are already premium — expect 15-20% spike at 400. Health is the wildcard.',
    keyCard: '2011 Topps Update #US175 RC',
    keyCardSlug: '2011-topps-update-mike-trout-us175',
    context: '11 HR away if healthy. Trout has battled injuries but reaching 400 HR at age 33 would silence the "what if" narrative.',
  },
  {
    player: 'Clayton Kershaw',
    sport: 'baseball',
    milestone: '200 Career Wins',
    current: '197 wins',
    target: '200 wins',
    progress: 99,
    projectedDate: '2025 season',
    urgency: 'imminent',
    impact: 'medium',
    cardImpact: 'His Bowman Chrome 1st and Topps Chrome RC will see 10-15% bumps. 200 wins is increasingly rare in modern baseball.',
    keyCard: '2006 Bowman Chrome Kershaw 1st',
    keyCardSlug: '2006-bowman-chrome-clayton-kershaw-1st',
    context: '3 wins away. In the era of pitch counts and bullpenning, reaching 200 wins marks Kershaw as one of the last great workhorses.',
  },
  {
    player: 'Freddie Freeman',
    sport: 'baseball',
    milestone: '3,000 Career Hits',
    current: '2,350 hits',
    target: '3,000 hits',
    progress: 78,
    projectedDate: '2027-2028',
    urgency: 'long-term',
    impact: 'extreme',
    cardImpact: 'If Freeman reaches 3,000, his RC cards could double. Only 33 players in history have done it.',
    keyCard: '2007 Bowman Chrome Freeman',
    keyCardSlug: '2007-bowman-chrome-freddie-freeman',
    context: '650 hits away. At ~170 hits/year, Freeman could reach 3,000 by age 38. Would make him a first-ballot Hall of Famer.',
  },
  // BASKETBALL
  {
    player: 'LeBron James',
    sport: 'basketball',
    milestone: '50,000 Career Points (regular season + playoffs)',
    current: '~47,500 combined',
    target: '50,000 combined points',
    progress: 95,
    projectedDate: '2025-26 season',
    urgency: 'approaching',
    impact: 'extreme',
    cardImpact: 'His Topps Chrome RC is the most valuable modern basketball card. Expect 20-30% spikes at each milestone.',
    keyCard: '2003-04 Topps Chrome #111 RC',
    keyCardSlug: '2003-04-topps-chrome-lebron-james-111',
    context: 'Already the all-time regular season scoring leader. The combined 50K mark would be an unprecedented achievement in NBA history.',
  },
  {
    player: 'Stephen Curry',
    sport: 'basketball',
    milestone: '4,000 Career Three-Pointers',
    current: '3,747 threes',
    target: '4,000 threes',
    progress: 94,
    projectedDate: 'Late 2025-26 season',
    urgency: 'approaching',
    impact: 'high',
    cardImpact: 'His Prizm RC and Topps Chrome RC should see 15-25% spikes. Curry owns the 3-point record and extending it is must-watch.',
    keyCard: '2009-10 Topps Chrome #101 RC',
    keyCardSlug: '2009-topps-chrome-stephen-curry-101-rc',
    context: '253 threes away. At ~260/season, Curry should reach 4,000 during the 2025-26 season. An absurd number nobody else will approach for decades.',
  },
  {
    player: 'Kevin Durant',
    sport: 'basketball',
    milestone: '30,000 Career Points',
    current: '28,944 points',
    target: '30,000 points',
    progress: 96,
    projectedDate: 'Mid 2025-26 season',
    urgency: 'approaching',
    impact: 'high',
    cardImpact: 'His Topps Chrome RC and refractor should see 15-20% bumps. Only 8 players have ever scored 30K.',
    keyCard: '2007-08 Topps Chrome #131 RC',
    keyCardSlug: '2007-08-topps-chrome-kevin-durant-131-rc',
    context: 'About 1,056 points away. KD averages ~25 ppg so this should happen during the 2025-26 season. An exclusive club with LeBron, Kareem, Malone, and Kobe.',
  },
  // FOOTBALL
  {
    player: 'Patrick Mahomes',
    sport: 'football',
    milestone: '4th Super Bowl Championship',
    current: '3 Super Bowl wins',
    target: '4 Super Bowl wins (tie Montana/Bradshaw)',
    progress: 75,
    projectedDate: 'February 2026',
    urgency: 'watch',
    impact: 'extreme',
    cardImpact: 'A 4th ring would put Mahomes in GOAT territory. His Prizm RC could spike 30-50% with a fourth championship.',
    keyCard: '2017 Panini Prizm #269 RC',
    keyCardSlug: '2017-panini-prizm-patrick-mahomes-269-rc',
    context: 'Already has 3 rings at age 29. A 4th would tie Montana and Bradshaw and put Mahomes squarely in the Brady conversation.',
  },
  {
    player: 'Travis Kelce',
    sport: 'football',
    milestone: '12,000 Career Receiving Yards (TE Record)',
    current: '11,328 yards',
    target: '12,000 yards',
    progress: 94,
    projectedDate: '2025 NFL season',
    urgency: 'approaching',
    impact: 'medium',
    cardImpact: 'His cards have dual appeal (football + Taylor Swift cultural moment). Expect 10-20% bump at TE yardage record.',
    keyCard: '2013 Panini Prizm #292 RC',
    keyCardSlug: '2013-panini-prizm-travis-kelce-292',
    context: '672 yards away. Kelce is already the GOAT TE and the most famous current NFL player. Extending his own record cements his legacy.',
  },
  {
    player: 'Aaron Donald',
    sport: 'football',
    milestone: 'Hall of Fame Induction',
    current: 'Retired 2024',
    target: 'First-ballot HOF (2029)',
    progress: 100,
    projectedDate: '2029 (5-year wait)',
    urgency: 'long-term',
    impact: 'high',
    cardImpact: 'HOF induction weekend always spikes player cards 20-40%. Buy 6-12 months before the ceremony.',
    keyCard: '2014 Topps Chrome #175 RC',
    keyCardSlug: '2014-topps-chrome-aaron-donald-175',
    context: 'The most dominant defensive player since Lawrence Taylor. First-ballot HOF is guaranteed. His cards will spike on induction weekend.',
  },
  {
    player: 'Derrick Henry',
    sport: 'football',
    milestone: '100 Career Rushing Touchdowns',
    current: '97 rushing TDs',
    target: '100 rushing TDs',
    progress: 97,
    projectedDate: 'Early 2025 NFL season',
    urgency: 'imminent',
    impact: 'medium',
    cardImpact: 'His Prizm RC should see 10-15% bump. Only 8 players in history have rushed for 100+ TDs.',
    keyCard: '2016 Panini Prizm #290 RC',
    keyCardSlug: '2016-panini-prizm-derrick-henry-290',
    context: '3 TDs away from an exclusive club. Henry is a physical marvel — 6-foot-3, 247 lbs of pure violence at RB.',
  },
];

/* ───── Config ───── */
const impactConfig: Record<Impact, { label: string; bg: string; text: string }> = {
  extreme: { label: 'Extreme', bg: 'bg-red-900/50', text: 'text-red-300' },
  high: { label: 'High', bg: 'bg-orange-900/50', text: 'text-orange-300' },
  medium: { label: 'Medium', bg: 'bg-yellow-900/50', text: 'text-yellow-300' },
  low: { label: 'Low', bg: 'bg-gray-700/50', text: 'text-gray-300' },
};

const urgencyConfig: Record<Urgency, { label: string; bg: string; text: string; dot: string }> = {
  imminent: { label: 'Imminent', bg: 'bg-red-950/60', text: 'text-red-300', dot: 'bg-red-400 animate-pulse' },
  approaching: { label: 'Approaching', bg: 'bg-orange-950/60', text: 'text-orange-300', dot: 'bg-orange-400' },
  watch: { label: 'Watch', bg: 'bg-yellow-950/60', text: 'text-yellow-300', dot: 'bg-yellow-400' },
  'long-term': { label: 'Long-Term', bg: 'bg-gray-800/60', text: 'text-gray-300', dot: 'bg-gray-400' },
};

const sportTabs: { value: Sport; label: string; icon: string }[] = [
  { value: 'all', label: 'All Sports', icon: '🏆' },
  { value: 'baseball', label: 'Baseball', icon: '⚾' },
  { value: 'basketball', label: 'Basketball', icon: '🏀' },
  { value: 'football', label: 'Football', icon: '🏈' },
  { value: 'hockey', label: 'Hockey', icon: '🏒' },
];

/* ───── Component ───── */
export default function MilestoneTracker() {
  const [sportFilter, setSportFilter] = useState<Sport>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<Urgency | 'all'>('all');

  const filtered = useMemo(() => {
    let result = milestones;
    if (sportFilter !== 'all') result = result.filter(m => m.sport === sportFilter);
    if (urgencyFilter !== 'all') result = result.filter(m => m.urgency === urgencyFilter);
    return result;
  }, [sportFilter, urgencyFilter]);

  const stats = useMemo(() => ({
    imminent: milestones.filter(m => m.urgency === 'imminent').length,
    approaching: milestones.filter(m => m.urgency === 'approaching').length,
    extreme: milestones.filter(m => m.impact === 'extreme').length,
    total: milestones.length,
  }), []);

  return (
    <div className="space-y-8">
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-red-950/30 border border-red-800/30 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-300">{stats.imminent}</p>
          <p className="text-xs text-gray-400">Imminent</p>
        </div>
        <div className="bg-orange-950/30 border border-orange-800/30 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-orange-300">{stats.approaching}</p>
          <p className="text-xs text-gray-400">Approaching</p>
        </div>
        <div className="bg-emerald-950/30 border border-emerald-800/30 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-300">{stats.extreme}</p>
          <p className="text-xs text-gray-400">Extreme Impact</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-xs text-gray-400">Total Milestones</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-wrap gap-2">
          {sportTabs.map(s => (
            <button
              key={s.value}
              onClick={() => setSportFilter(s.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sportFilter === s.value
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-700/60 text-gray-300 hover:bg-gray-600/60'
              }`}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all' as const, label: 'All Urgency' },
            { value: 'imminent' as const, label: 'Imminent' },
            { value: 'approaching' as const, label: 'Approaching' },
            { value: 'watch' as const, label: 'Watch' },
            { value: 'long-term' as const, label: 'Long-Term' },
          ].map(u => (
            <button
              key={u.value}
              onClick={() => setUrgencyFilter(u.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                urgencyFilter === u.value
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-700/60 text-gray-400 hover:text-gray-200'
              }`}
            >
              {u.label}
            </button>
          ))}
        </div>
      </div>

      {/* Milestone cards */}
      <div className="space-y-4">
        {filtered.map((m, idx) => {
          const impact = impactConfig[m.impact];
          const urgency = urgencyConfig[m.urgency];
          return (
            <div key={idx} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 hover:border-gray-600/50 transition-colors">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">
                      {m.sport === 'baseball' ? '⚾' : m.sport === 'basketball' ? '🏀' : m.sport === 'football' ? '🏈' : '🏒'}
                    </span>
                    <h3 className="text-lg font-semibold text-white">{m.player}</h3>
                  </div>
                  <p className="text-sm text-emerald-400 font-medium">{m.milestone}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${urgency.bg} ${urgency.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${urgency.dot}`} />
                    {urgency.label}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${impact.bg} ${impact.text}`}>
                    {impact.label} Impact
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                  <span>{m.current}</span>
                  <span>{m.target}</span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, m.progress)}%`,
                      background: m.progress >= 95 ? '#ef4444' : m.progress >= 85 ? '#f97316' : m.progress >= 70 ? '#eab308' : '#10b981',
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-gray-500">{m.progress}% complete</span>
                  <span className="text-gray-400">Projected: {m.projectedDate}</span>
                </div>
              </div>

              {/* Context */}
              <p className="text-sm text-gray-400 mb-4">{m.context}</p>

              {/* Card impact */}
              <div className="bg-gray-900/50 rounded-lg p-4 mb-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Card Market Impact</p>
                <p className="text-sm text-gray-300">{m.cardImpact}</p>
              </div>

              {/* Key card link */}
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-400">
                  Key Card: <span className="text-white">{m.keyCard}</span>
                </div>
                <Link
                  href={`/sports/${m.keyCardSlug}`}
                  className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  View Card &rarr;
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No milestones match your filters. Try adjusting the sport or urgency filter.
        </div>
      )}

      {/* Pro tips */}
      <section className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Milestone Investing Tips</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { title: 'Buy 2-6 months before', tip: 'Prices start climbing 1-2 months before a milestone hits. Buy early to maximize your gain and sell into the spike.' },
            { title: 'Sell within 72 hours', tip: 'Most milestone spikes fade within a week. The best returns come from selling in the first 1-3 days of peak excitement.' },
            { title: 'Rookie cards spike most', tip: 'The flagship rookie card (Topps Chrome, Prizm) sees the biggest % gain. Base cards move less. Autos and numbered parallels also spike.' },
            { title: 'Records > round numbers', tip: 'Breaking an all-time record creates permanent price increases. Round-number milestones (500 HR, 1000 points) create temporary spikes.' },
            { title: 'Watch the injury report', tip: 'Injuries delay milestones and can crash prices. Track health closely for players approaching milestones — health IS the timeline.' },
            { title: 'Stack imminent milestones', tip: 'When multiple milestones converge in the same season, the combined media attention amplifies all of them. Look for overlap.' },
          ].map((t, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-emerald-400 text-lg mt-0.5 shrink-0">*</span>
              <div>
                <p className="text-sm font-medium text-white">{t.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t.tip}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Related tools */}
      <section className="pt-8 border-t border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Related Tools</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/tools/seasonality', label: 'Market Seasonality', icon: '📅' },
            { href: '/tools/investment-calc', label: 'Investment Calculator', icon: '📊' },
            { href: '/tools/watchlist', label: 'Price Watchlist', icon: '👀' },
            { href: '/tools/prospect-tracker', label: 'Prospect Pipeline', icon: '🔮' },
            { href: '/tools/roi-heatmap', label: 'ROI Heatmap', icon: '🗺️' },
            { href: '/tools/diversification', label: 'Diversification', icon: '📊' },
            { href: '/tools/flip-calc', label: 'Flip Calculator', icon: '💸' },
            { href: '/market-movers', label: 'Market Movers', icon: '📈' },
          ].map(t => (
            <Link
              key={t.href}
              href={t.href}
              className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-xl text-sm text-gray-300 hover:text-white transition-colors"
            >
              <span>{t.icon}</span>
              <span className="truncate">{t.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

const SPORT_ICONS: Record<string, string> = {
  baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒',
};
const SPORT_COLORS: Record<string, string> = {
  baseball: 'text-red-400', basketball: 'text-orange-400', football: 'text-blue-400', hockey: 'text-cyan-400',
};

type Severity = 'out' | 'questionable' | 'day-to-day' | 'probable' | 'returning';

const SEVERITY_CONFIG: Record<Severity, { label: string; color: string; bg: string; textColor: string; icon: string }> = {
  out: { label: 'OUT', color: 'text-red-400', bg: 'bg-red-950/60 border-red-700/50', textColor: 'text-red-300', icon: '🔴' },
  questionable: { label: 'QUESTIONABLE', color: 'text-orange-400', bg: 'bg-orange-950/60 border-orange-700/50', textColor: 'text-orange-300', icon: '🟠' },
  'day-to-day': { label: 'DAY-TO-DAY', color: 'text-yellow-400', bg: 'bg-yellow-950/60 border-yellow-700/50', textColor: 'text-yellow-300', icon: '🟡' },
  probable: { label: 'PROBABLE', color: 'text-green-400', bg: 'bg-green-950/60 border-green-700/50', textColor: 'text-green-300', icon: '🟢' },
  returning: { label: 'RETURNING FROM IR', color: 'text-blue-400', bg: 'bg-blue-950/60 border-blue-700/50', textColor: 'text-blue-300', icon: '🔵' },
};

const INJURY_REASONS: Record<Severity, string[]> = {
  out: [
    'Season-ending performance decline — card values in freefall',
    'Major scandal or off-field issue crushing demand',
    'Trade to small-market team — collector interest evaporated',
    'Severe real-life injury — long-term recovery expected',
    'Retirement rumors — panic selling across all grades',
    'Product oversaturation — too many parallels flooded the market',
  ],
  questionable: [
    'Slumping performance — 3-week cold streak hurting value',
    'Lost starting position — playing time concerns',
    'Team tanking — fewer eyes on the player',
    'Grading company backlog delays keeping slabs off market',
    'Competing RC from a hotter prospect stealing demand',
    'Off-season doldrums — sport not in season',
  ],
  'day-to-day': [
    'Minor injury (day-to-day IRL) — slight value wobble',
    'Bad game viral clip — temporary sentiment dip',
    'Market-wide correction affecting all cards',
    'New product release redirected buying dollars',
    'Weekend dip — casual sellers undercutting',
    'Award snub — expected recognition did not come',
  ],
  probable: [
    'Short bench stint — expected back within a week',
    'Minor slump but underlying stats still elite',
    'Trade deadline uncertainty — should resolve soon',
    'Seasonal pattern — this sport always dips this month',
    'Single bad outing — market overreacting',
    'Price consolidation after a big spike — healthy pullback',
  ],
  returning: [
    'Comeback from injury — rehab highlights going viral',
    'Trade to contender — renewed playoff hype',
    'Award nomination announced — demand surging',
    'Breakout performance after cold stretch — buyers returning',
    'Set going out of print — supply drying up',
    'All-Star selection — mainstream attention boosting prices',
    'Playoff push — team in contention driving card interest',
    'Viral highlight moment — social media driving new buyers',
  ],
};

const RECOVERY_TIMELINES: Record<Severity, string[]> = {
  out: ['3-6 months', '6-12 months', 'Season-long', 'Indefinite', 'May never recover'],
  questionable: ['2-4 weeks', '1-2 months', '2-3 months', 'Until next breakout game'],
  'day-to-day': ['1-3 days', '1 week', 'By next game day', 'This weekend'],
  probable: ['Expected tomorrow', '2-3 days', 'By end of week', 'Next home game'],
  returning: ['Recovering now', 'Back to form', 'Trending up daily', 'Full recovery imminent'],
};

const TREATMENTS: Record<Severity, string[]> = {
  out: ['Hold if long-term believer', 'Sell now if you need liquidity', 'Wait for buy-the-dip floor', 'Monitor for roster moves'],
  questionable: ['Hold and monitor weekly', 'Set price alerts for further drops', 'Small position add if you believe', 'Watch for positive news catalysts'],
  'day-to-day': ['No action needed', 'Possible buying opportunity', 'Normal market fluctuation', 'Check back in 48 hours'],
  probable: ['Stay the course', 'Consider adding to position', 'Value buying window closing', 'Prepare to list if it fully recovers'],
  returning: ['Buy before full recovery pricing', 'Upgrade to graded copies now', 'Ride the momentum', 'Take partial profits if overextended'],
};

function seededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xFFFFFFFF;
    return (s >>> 0) / 0xFFFFFFFF;
  };
}

function parseValue(raw: string): number {
  const m = raw.match(/\$(\d[\d,]*)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 5;
}

interface InjuredCard {
  card: typeof sportsCards[0];
  severity: Severity;
  decline: number;
  currentPrice: number;
  previousPrice: number;
  reason: string;
  recovery: string;
  treatment: string;
  daysSinceOnset: number;
  id: string;
}

function generateInjuryReport(rng: () => number): InjuredCard[] {
  const eligible = sportsCards.filter(c => parseValue(c.estimatedValueRaw) >= 5);
  const reports: InjuredCard[] = [];
  const used = new Set<string>();

  // Generate ~40 cards on the injury report
  const severityWeights: Severity[] = [
    'out', 'out', 'questionable', 'questionable', 'questionable',
    'day-to-day', 'day-to-day', 'day-to-day', 'day-to-day',
    'probable', 'probable', 'probable',
    'returning', 'returning', 'returning', 'returning',
  ];

  for (let i = 0; i < 200 && reports.length < 40; i++) {
    const idx = Math.floor(rng() * eligible.length);
    const card = eligible[idx];
    if (used.has(card.player)) continue;
    used.add(card.player);

    const severity = severityWeights[Math.floor(rng() * severityWeights.length)];
    const previousPrice = parseValue(card.estimatedValueRaw);

    let declineRange: [number, number];
    switch (severity) {
      case 'out': declineRange = [20, 45]; break;
      case 'questionable': declineRange = [10, 25]; break;
      case 'day-to-day': declineRange = [3, 12]; break;
      case 'probable': declineRange = [1, 8]; break;
      case 'returning': declineRange = [-15, -3]; break; // negative = gaining
    }

    const decline = severity === 'returning'
      ? -(Math.floor(rng() * 13) + 3)
      : Math.floor(rng() * (declineRange[1] - declineRange[0]) + declineRange[0]);

    const currentPrice = Math.max(1, Math.round(previousPrice * (1 - decline / 100)));
    const reasons = INJURY_REASONS[severity];
    const recoveries = RECOVERY_TIMELINES[severity];
    const treatments = TREATMENTS[severity];

    reports.push({
      card,
      severity,
      decline,
      currentPrice,
      previousPrice,
      reason: reasons[Math.floor(rng() * reasons.length)],
      recovery: recoveries[Math.floor(rng() * recoveries.length)],
      treatment: treatments[Math.floor(rng() * treatments.length)],
      daysSinceOnset: severity === 'out' ? Math.floor(rng() * 30) + 7 : Math.floor(rng() * 14) + 1,
      id: `injury-${card.slug}`,
    });
  }

  // Sort: out first, then questionable, day-to-day, probable, returning
  const order: Record<Severity, number> = { out: 0, questionable: 1, 'day-to-day': 2, probable: 3, returning: 4 };
  reports.sort((a, b) => order[a.severity] - order[b.severity]);

  return reports;
}

export default function InjuryReportClient() {
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const reports = useMemo(() => {
    const now = new Date();
    const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
    return generateInjuryReport(seededRng(seed));
  }, []);

  const filtered = useMemo(() => {
    return reports.filter(r => {
      if (sportFilter !== 'all' && r.card.sport !== sportFilter) return false;
      if (severityFilter !== 'all' && r.severity !== severityFilter) return false;
      return true;
    });
  }, [reports, sportFilter, severityFilter]);

  const stats = useMemo(() => {
    const outCount = reports.filter(r => r.severity === 'out').length;
    const returningCount = reports.filter(r => r.severity === 'returning').length;
    const avgDecline = reports.filter(r => r.severity !== 'returning').reduce((sum, r) => sum + r.decline, 0) /
      Math.max(1, reports.filter(r => r.severity !== 'returning').length);
    const totalImpact = reports.reduce((sum, r) => sum + (r.previousPrice - r.currentPrice), 0);
    return { total: reports.length, outCount, returningCount, avgDecline: avgDecline.toFixed(1), totalImpact };
  }, [reports]);

  const sports = ['all', 'baseball', 'basketball', 'football', 'hockey'];
  const severities: (Severity | 'all')[] = ['all', 'out', 'questionable', 'day-to-day', 'probable', 'returning'];

  return (
    <div>
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-xs text-gray-400">Cards on Report</div>
        </div>
        <div className="bg-red-950/30 border border-red-700/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-400">{stats.outCount}</div>
          <div className="text-xs text-gray-400">Out (Major)</div>
        </div>
        <div className="bg-blue-950/30 border border-blue-700/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.returningCount}</div>
          <div className="text-xs text-gray-400">Returning</div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-orange-400">{stats.avgDecline}%</div>
          <div className="text-xs text-gray-400">Avg Decline</div>
        </div>
      </div>

      {/* Sport Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {sports.map(s => (
          <button key={s} onClick={() => setSportFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              sportFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}>
            {s === 'all' ? 'All Sports' : `${SPORT_ICONS[s] || ''} ${s.charAt(0).toUpperCase() + s.slice(1)}`}
          </button>
        ))}
      </div>

      {/* Severity Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {severities.map(s => {
          const cfg = s === 'all' ? null : SEVERITY_CONFIG[s];
          return (
            <button key={s} onClick={() => setSeverityFilter(s)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                severityFilter === s
                  ? cfg ? `${cfg.bg} ${cfg.color} border` : 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}>
              {s === 'all' ? 'All Severities' : `${cfg!.icon} ${cfg!.label}`}
            </button>
          );
        })}
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-500 mb-4">{filtered.length} card{filtered.length !== 1 ? 's' : ''} on the injury report</div>

      {/* Injury Cards */}
      <div className="space-y-3">
        {filtered.map(r => {
          const cfg = SEVERITY_CONFIG[r.severity];
          const isExpanded = expandedId === r.id;
          const isGaining = r.severity === 'returning';

          return (
            <div key={r.id} className={`border rounded-lg overflow-hidden transition-all ${cfg.bg}`}>
              <button onClick={() => setExpandedId(isExpanded ? null : r.id)}
                className="w-full text-left p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${cfg.color} bg-black/30`}>
                        {cfg.icon} {cfg.label}
                      </span>
                      <span className="text-xs text-gray-500">{r.daysSinceOnset}d</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${SPORT_COLORS[r.card.sport] || 'text-gray-400'}`}>
                        {SPORT_ICONS[r.card.sport] || ''}
                      </span>
                      <span className="font-semibold text-white truncate">{r.card.player}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 truncate">{r.card.name}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-lg font-bold ${isGaining ? 'text-green-400' : 'text-red-400'}`}>
                      {isGaining ? '+' : '-'}{Math.abs(r.decline)}%
                    </div>
                    <div className="text-xs text-gray-500">${r.currentPrice} / ${r.previousPrice}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-2 line-clamp-1">{r.reason}</div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-700/30 pt-3 space-y-3">
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="bg-black/20 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Diagnosis</div>
                      <div className="text-sm text-gray-300">{r.reason}</div>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Recovery Timeline</div>
                      <div className={`text-sm font-medium ${cfg.textColor}`}>{r.recovery}</div>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Recommended Treatment</div>
                      <div className="text-sm text-gray-300">{r.treatment}</div>
                    </div>
                  </div>

                  {/* Price Impact Bar */}
                  <div className="bg-black/20 rounded-lg p-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Previous: ${r.previousPrice}</span>
                      <span>Current: ${r.currentPrice}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${isGaining ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(100, isGaining ? 100 : (r.currentPrice / r.previousPrice) * 100)}%` }} />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <Link href={`/sports/${r.card.slug}`} className="text-blue-400 hover:text-blue-300">View Card</Link>
                    <span className="text-gray-700">|</span>
                    <Link href={`/players/${r.card.player.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`} className="text-blue-400 hover:text-blue-300">Player Profile</Link>
                    <span className="text-gray-700">|</span>
                    <Link href="/tools/investment-calc" className="text-blue-400 hover:text-blue-300">Investment Calc</Link>
                    <span className="text-gray-700">|</span>
                    <Link href="/tools/watchlist" className="text-blue-400 hover:text-blue-300">Add to Watchlist</Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No cards match your filters. Try changing the sport or severity filter.
        </div>
      )}

      {/* How to Read Section */}
      <section className="mt-10 bg-gray-800/30 border border-gray-700/50 rounded-lg p-6">
        <h2 className="text-lg font-bold text-white mb-4">How to Read the Injury Report</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {(Object.entries(SEVERITY_CONFIG) as [Severity, typeof SEVERITY_CONFIG[Severity]][]).map(([key, cfg]) => (
            <div key={key} className="flex items-start gap-3">
              <span className="text-lg">{cfg.icon}</span>
              <div>
                <div className={`font-semibold text-sm ${cfg.color}`}>{cfg.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {key === 'out' && 'Card value down 20%+ with no near-term recovery catalyst. Consider selling or holding long-term only.'}
                  {key === 'questionable' && 'Card value down 10-25%. Could go either way. Monitor for news that changes the outlook.'}
                  {key === 'day-to-day' && 'Minor dip of 3-12%. Normal market fluctuation. Usually resolves within days.'}
                  {key === 'probable' && 'Slight wobble under 8%. Card is likely fine. May be a micro buying opportunity.'}
                  {key === 'returning' && 'Card is recovering from a previous dip. Value trending up 3-15%. Momentum is positive.'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tips */}
      <section className="mt-8 bg-gray-800/30 border border-gray-700/50 rounded-lg p-6">
        <h2 className="text-lg font-bold text-white mb-3">Injury Report Trading Tips</h2>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex items-start gap-2"><span className="text-green-400 mt-0.5">1.</span> Cards marked &ldquo;OUT&rdquo; are highest-risk but highest-reward if the player recovers</li>
          <li className="flex items-start gap-2"><span className="text-green-400 mt-0.5">2.</span> &ldquo;RETURNING FROM IR&rdquo; cards are the safest buy-the-dip plays &mdash; momentum is already positive</li>
          <li className="flex items-start gap-2"><span className="text-green-400 mt-0.5">3.</span> &ldquo;DAY-TO-DAY&rdquo; dips often fully recover within a week &mdash; patience is usually rewarded</li>
          <li className="flex items-start gap-2"><span className="text-green-400 mt-0.5">4.</span> Never catch a falling knife: wait for &ldquo;QUESTIONABLE&rdquo; cards to stabilize before buying</li>
          <li className="flex items-start gap-2"><span className="text-green-400 mt-0.5">5.</span> Use the Price Watchlist to track injured cards and get alerts when they start recovering</li>
          <li className="flex items-start gap-2"><span className="text-green-400 mt-0.5">6.</span> Check back daily &mdash; the injury report updates every 24 hours with fresh analysis</li>
        </ul>
      </section>
    </div>
  );
}

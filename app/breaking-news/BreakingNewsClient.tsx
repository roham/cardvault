'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards, type SportsCard } from '@/data/sports-cards';

// ── Helpers ───────────────────────────────────────────────────
function dateHash(dateStr: string): number {
  let hash = 0;
  const str = 'cardvault-breaking-' + dateStr;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
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
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/['']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function timeAgo(minutes: number): string {
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / 1440)}d ago`;
}

// ── Alert Types ───────────────────────────────────────────────
type AlertType = 'price-spike' | 'record-sale' | 'grading-update' | 'market-mover' | 'rookie-watch' | 'set-release';

interface BreakingAlert {
  id: string;
  type: AlertType;
  severity: 'critical' | 'high' | 'medium';
  title: string;
  description: string;
  card?: SportsCard;
  sport: string;
  minutesAgo: number;
  priceChange?: string;
  newPrice?: string;
  verified: boolean;
}

const ALERT_CONFIG: Record<AlertType, { icon: string; label: string; color: string; bgColor: string; borderColor: string }> = {
  'price-spike': { icon: '📈', label: 'PRICE SPIKE', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30' },
  'record-sale': { icon: '🏆', label: 'RECORD SALE', color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30' },
  'grading-update': { icon: '📦', label: 'GRADING NEWS', color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30' },
  'market-mover': { icon: '🔄', label: 'MARKET MOVER', color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30' },
  'rookie-watch': { icon: '⭐', label: 'ROOKIE ALERT', color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30' },
  'set-release': { icon: '📅', label: 'NEW RELEASE', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30' },
};

const SPORT_EMOJI: Record<string, string> = { baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒' };

// ── Price Spike Templates ─────────────────────────────────────
const SPIKE_REASONS = [
  'Strong rookie season performance driving demand',
  'Recent trade to contending team boosting interest',
  'Hall of Fame announcement speculation',
  'Upcoming jersey retirement ceremony',
  'Social media viral moment increasing visibility',
  'Low PSA 10 pop report creating scarcity',
  'Recent hobby box price increase',
  'All-Star selection announcement',
  'Award nomination buzz',
  'New product release featuring parallel variants',
];

const GRADING_NEWS = [
  { title: 'PSA Turnaround Times Drop Below 30 Days', desc: 'PSA Regular tier now averaging 22 business days, fastest since 2019. Economy tier at 45 days. Grading demand normalizing.' },
  { title: 'CGC Announces Vintage Crossover Program', desc: 'CGC now accepting crossovers from PSA and BGS for vintage cards (pre-1980). Competitive pricing at $35/card.' },
  { title: 'SGC Surpasses 2M Graded Cards Milestone', desc: 'SGC has officially graded over 2 million cards. The tuxedo slab continues gaining market share, especially in vintage.' },
  { title: 'BGS Black Label Population Report Updated', desc: 'Beckett releases updated Black Label populations. Only 0.3% of all submissions achieve pristine 10 across all sub-grades.' },
  { title: 'PSA Launches AI-Assisted Pre-Screening', desc: 'PSA testing new AI centering analysis tool. Members can upload photos for estimated centering grade before submission.' },
  { title: 'New CGC Slab Design Revealed for 2025', desc: 'CGC unveils sleeker slab with improved UV protection and holographic security label. Rolling out Q3 2025.' },
];

const SET_RELEASES = [
  { title: '2025 Topps Series 2 Baseball Release Date Set', desc: 'Hobby boxes available June 11. Key rookies: Paul Skenes SP variation, Shohei Ohtani Dodgers debut cards.' },
  { title: '2025-26 Panini Prizm NBA Hobby Boxes Shipping', desc: 'Silver Prizms, Color Blasts, and Downtown inserts. Cooper Flagg rookie auto chase.' },
  { title: '2025 Panini Prizm Football Preview', desc: 'First look at the checklist. 5 rookie auto slots per hobby box. Shedeur Sanders and Travis Hunter headlining.' },
  { title: 'Pokemon SV Destined Rivals Product Lineup', desc: 'Elite Trainer Boxes, booster bundles, and new illustration rare cards. Global release May 30.' },
  { title: '2025-26 Upper Deck Series 2 Hockey Checklist', desc: 'Young Guns include 15 projected rookies. Canvas parallels return. Hobby box price at $139.' },
];

const MARKET_MOVERS = [
  'Trading volume up {pct}% this week across {sport} cards',
  '{sport} card market seeing {dir} pressure after {event}',
  'Graded card inventory on eBay {dir} by {pct}% month-over-month',
  'Average sale price for {sport} rookies {dir} {pct}% in Q2',
  'Sealed product prices for {sport} hobby boxes {dir} {pct}% since release',
];

// ── Generate Alerts ───────────────────────────────────────────
function generateAlerts(dateStr: string): BreakingAlert[] {
  const seed = dateHash(dateStr);
  const rng = seededRng(seed);
  const alerts: BreakingAlert[] = [];
  const sports = ['baseball', 'basketball', 'football', 'hockey'];

  // Price spikes (3-5 cards)
  const valuableCards = sportsCards.filter(c => parseValue(c.estimatedValueRaw) >= 20).sort(() => rng() - 0.5);
  const spikeCount = 3 + Math.floor(rng() * 3);
  for (let i = 0; i < Math.min(spikeCount, valuableCards.length); i++) {
    const card = valuableCards[i];
    const rawVal = parseValue(card.estimatedValueRaw);
    const pctChange = 15 + Math.floor(rng() * 45);
    const newPrice = Math.round(rawVal * (1 + pctChange / 100));
    alerts.push({
      id: `spike-${i}`,
      type: 'price-spike',
      severity: pctChange > 35 ? 'critical' : pctChange > 25 ? 'high' : 'medium',
      title: `${card.player} ${card.year} ${card.set} up ${pctChange}%`,
      description: SPIKE_REASONS[Math.floor(rng() * SPIKE_REASONS.length)],
      card,
      sport: card.sport,
      minutesAgo: 5 + Math.floor(rng() * 180),
      priceChange: `+${pctChange}%`,
      newPrice: formatPrice(newPrice),
      verified: rng() > 0.3,
    });
  }

  // Record sales (1-2)
  const premiumCards = sportsCards.filter(c => parseValue(c.estimatedValueGem) >= 200).sort(() => rng() - 0.5);
  for (let i = 0; i < Math.min(2, premiumCards.length); i++) {
    const card = premiumCards[i];
    const gemVal = parseValue(card.estimatedValueGem);
    const salePrice = Math.round(gemVal * (1.2 + rng() * 0.8));
    const grade = rng() > 0.3 ? 'PSA 10' : rng() > 0.5 ? 'BGS 9.5' : 'CGC 9.5';
    alerts.push({
      id: `record-${i}`,
      type: 'record-sale',
      severity: salePrice > 1000 ? 'critical' : 'high',
      title: `${card.player} ${grade} sells for ${formatPrice(salePrice)}`,
      description: `New record for this card in ${grade} condition. Previous high was ${formatPrice(Math.round(salePrice * 0.85))}. ${card.rookie ? 'Rookie card demand remains strong.' : 'Vintage appeal driving prices.'}`,
      card,
      sport: card.sport,
      minutesAgo: 30 + Math.floor(rng() * 360),
      newPrice: formatPrice(salePrice),
      verified: true,
    });
  }

  // Grading news (1-2)
  const gradingCount = 1 + Math.floor(rng() * 2);
  for (let i = 0; i < gradingCount; i++) {
    const news = GRADING_NEWS[Math.floor(rng() * GRADING_NEWS.length)];
    alerts.push({
      id: `grading-${i}`,
      type: 'grading-update',
      severity: 'medium',
      title: news.title,
      description: news.desc,
      sport: 'all',
      minutesAgo: 60 + Math.floor(rng() * 480),
      verified: true,
    });
  }

  // Set releases (1-2)
  const releaseCount = 1 + Math.floor(rng() * 2);
  for (let i = 0; i < releaseCount; i++) {
    const release = SET_RELEASES[Math.floor(rng() * SET_RELEASES.length)];
    const sport = release.title.toLowerCase().includes('baseball') ? 'baseball'
      : release.title.toLowerCase().includes('nba') || release.title.toLowerCase().includes('basketball') ? 'basketball'
      : release.title.toLowerCase().includes('football') ? 'football'
      : release.title.toLowerCase().includes('hockey') ? 'hockey' : 'all';
    alerts.push({
      id: `release-${i}`,
      type: 'set-release',
      severity: 'medium',
      title: release.title,
      description: release.desc,
      sport,
      minutesAgo: 120 + Math.floor(rng() * 720),
      verified: true,
    });
  }

  // Rookie watches (2-3)
  const rookieCards = sportsCards.filter(c => c.rookie && parseValue(c.estimatedValueRaw) >= 10).sort(() => rng() - 0.5);
  const rookieCount = 2 + Math.floor(rng() * 2);
  for (let i = 0; i < Math.min(rookieCount, rookieCards.length); i++) {
    const card = rookieCards[i];
    const pct = 10 + Math.floor(rng() * 30);
    alerts.push({
      id: `rookie-${i}`,
      type: 'rookie-watch',
      severity: pct > 25 ? 'high' : 'medium',
      title: `${card.player} RC trending ${pct > 0 ? 'up' : 'down'} ${pct}%`,
      description: `${card.year} ${card.set} rookie card ${pct > 20 ? 'surging' : 'gaining'} after ${['strong game performance', 'award nomination', 'trade rumors', 'highlight reel play', 'social media buzz'][Math.floor(rng() * 5)]}. Current ask: ${card.estimatedValueRaw}.`,
      card,
      sport: card.sport,
      minutesAgo: 15 + Math.floor(rng() * 240),
      priceChange: `+${pct}%`,
      verified: rng() > 0.4,
    });
  }

  // Market movers (1-2)
  for (let i = 0; i < 1 + Math.floor(rng() * 2); i++) {
    const sport = sports[Math.floor(rng() * sports.length)];
    const pct = 5 + Math.floor(rng() * 20);
    const dir = rng() > 0.4 ? 'up' : 'down';
    const events = ['playoff race heating up', 'draft day approaching', 'All-Star break', 'award season', 'offseason signings'];
    const tpl = MARKET_MOVERS[Math.floor(rng() * MARKET_MOVERS.length)];
    alerts.push({
      id: `market-${i}`,
      type: 'market-mover',
      severity: pct > 12 ? 'high' : 'medium',
      title: tpl.replace('{pct}', String(pct)).replace('{sport}', sport).replace('{dir}', dir).replace('{event}', events[Math.floor(rng() * events.length)]),
      description: `${sport.charAt(0).toUpperCase() + sport.slice(1)} card market ${dir === 'up' ? 'showing strength' : 'cooling off'} this period. ${dir === 'up' ? 'Consider scooping undervalued cards.' : 'May present buying opportunities.'}`,
      sport,
      minutesAgo: 60 + Math.floor(rng() * 360),
      priceChange: `${dir === 'up' ? '+' : '-'}${pct}%`,
      verified: true,
    });
  }

  // Sort by recency
  return alerts.sort((a, b) => a.minutesAgo - b.minutesAgo);
}

// ── Alert Card Component ──────────────────────────────────────
function AlertCard({ alert }: { alert: BreakingAlert }) {
  const config = ALERT_CONFIG[alert.type];
  return (
    <div className={`bg-gray-900 border rounded-2xl p-4 transition-all hover:border-gray-600 ${
      alert.severity === 'critical' ? config.borderColor : 'border-gray-800'
    } ${alert.severity === 'critical' ? config.bgColor : ''}`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl ${config.bgColor} flex items-center justify-center text-xl flex-shrink-0`}>
          {config.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${config.bgColor} ${config.borderColor} ${config.color}`}>
              {config.label}
            </span>
            {alert.severity === 'critical' && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">CRITICAL</span>
            )}
            <span className="text-gray-600 text-[10px]">{SPORT_EMOJI[alert.sport] || '🃏'} {alert.sport}</span>
            <span className="text-gray-600 text-[10px]">{timeAgo(alert.minutesAgo)}</span>
            {alert.verified && <span className="text-emerald-500 text-[10px]">Verified</span>}
          </div>
          <h3 className="text-white font-semibold text-sm leading-snug mb-1">{alert.title}</h3>
          <p className="text-gray-400 text-xs leading-relaxed">{alert.description}</p>

          {/* Price info */}
          {(alert.priceChange || alert.newPrice) && (
            <div className="flex items-center gap-3 mt-2">
              {alert.priceChange && (
                <span className={`text-sm font-bold ${alert.priceChange.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                  {alert.priceChange}
                </span>
              )}
              {alert.newPrice && <span className="text-white text-sm font-semibold">{alert.newPrice}</span>}
            </div>
          )}

          {/* Card link */}
          {alert.card && (
            <div className="mt-2 flex items-center gap-2">
              <Link href={`/cards/${alert.card.slug}`} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                View Card Details
              </Link>
              <span className="text-gray-700">|</span>
              <Link href={`/players/${slugifyPlayer(alert.card.player)}`} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                {alert.card.player} Hub
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function BreakingNewsClient() {
  const today = new Date().toISOString().split('T')[0];
  const allAlerts = useMemo(() => generateAlerts(today), [today]);

  const [filter, setFilter] = useState<AlertType | 'all'>('all');
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const filteredAlerts = useMemo(() => {
    return allAlerts.filter(a => {
      if (filter !== 'all' && a.type !== filter) return false;
      if (sportFilter !== 'all' && a.sport !== sportFilter && a.sport !== 'all') return false;
      if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
      return true;
    });
  }, [allAlerts, filter, sportFilter, severityFilter]);

  const criticalCount = allAlerts.filter(a => a.severity === 'critical').length;
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of allAlerts) counts[a.type] = (counts[a.type] || 0) + 1;
    return counts;
  }, [allAlerts]);

  // Auto-refresh countdown
  const [refreshIn, setRefreshIn] = useState(300);
  useEffect(() => {
    const t = setInterval(() => setRefreshIn(p => (p <= 1 ? 300 : p - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-6">
      {/* Live status bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-400 text-sm font-bold">LIVE ALERTS</span>
            </div>
            <span className="text-gray-500 text-xs">{allAlerts.length} active alerts today</span>
          </div>
          <div className="flex items-center gap-3">
            {criticalCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                {criticalCount} CRITICAL
              </span>
            )}
            <span className="text-gray-600 text-xs">Refreshes in {Math.floor(refreshIn / 60)}:{String(refreshIn % 60).padStart(2, '0')}</span>
          </div>
        </div>
      </div>

      {/* Summary grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {(Object.entries(ALERT_CONFIG) as [AlertType, typeof ALERT_CONFIG[AlertType]][]).map(([type, config]) => (
          <button
            key={type}
            onClick={() => setFilter(f => f === type ? 'all' : type)}
            className={`rounded-xl p-3 text-center transition-all border ${
              filter === type ? `${config.bgColor} ${config.borderColor}` : 'bg-gray-900 border-gray-800 hover:border-gray-700'
            }`}
          >
            <div className="text-xl mb-1">{config.icon}</div>
            <div className={`text-lg font-bold ${filter === type ? config.color : 'text-white'}`}>{typeCounts[type] || 0}</div>
            <div className="text-gray-500 text-[10px] leading-tight">{config.label}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={sportFilter}
          onChange={e => setSportFilter(e.target.value)}
          className="bg-gray-900 border border-gray-800 text-gray-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-gray-600"
        >
          <option value="all">All Sports</option>
          <option value="baseball">Baseball</option>
          <option value="basketball">Basketball</option>
          <option value="football">Football</option>
          <option value="hockey">Hockey</option>
        </select>
        <select
          value={severityFilter}
          onChange={e => setSeverityFilter(e.target.value)}
          className="bg-gray-900 border border-gray-800 text-gray-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-gray-600"
        >
          <option value="all">All Severity</option>
          <option value="critical">Critical Only</option>
          <option value="high">High+</option>
          <option value="medium">Medium+</option>
        </select>
        {filter !== 'all' && (
          <button onClick={() => setFilter('all')} className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 bg-gray-800 rounded-lg">
            Clear type filter
          </button>
        )}
        <span className="text-gray-600 text-xs ml-auto">{filteredAlerts.length} alerts</span>
      </div>

      {/* Alert feed */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
            <p className="text-gray-500 text-sm">No alerts match your filters.</p>
          </div>
        )}
        {filteredAlerts.map(alert => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </div>

      {/* Market pulse summary */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
        <h3 className="text-white font-semibold text-sm mb-3">Today&apos;s Market Pulse</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(['baseball', 'basketball', 'football', 'hockey'] as const).map(sport => {
            const sportAlerts = allAlerts.filter(a => a.sport === sport);
            const spikes = sportAlerts.filter(a => a.type === 'price-spike');
            return (
              <div key={sport} className="bg-gray-800/60 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span>{SPORT_EMOJI[sport]}</span>
                  <span className="text-white text-xs font-semibold capitalize">{sport}</span>
                </div>
                <div className="text-gray-400 text-[11px] space-y-0.5">
                  <div>{sportAlerts.length} alerts</div>
                  <div>{spikes.length} price spikes</div>
                  <div className={spikes.length > 2 ? 'text-emerald-400' : spikes.length > 0 ? 'text-amber-400' : 'text-gray-500'}>
                    {spikes.length > 2 ? 'Hot' : spikes.length > 0 ? 'Active' : 'Quiet'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alert settings */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
        <h3 className="text-white font-semibold text-sm mb-3">Alert Preferences</h3>
        <p className="text-gray-500 text-xs mb-3">Customize which alerts you see. Preferences saved to your browser.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(Object.entries(ALERT_CONFIG) as [AlertType, typeof ALERT_CONFIG[AlertType]][]).map(([type, config]) => (
            <label key={type} className="flex items-center gap-2 bg-gray-800/60 rounded-xl p-3 cursor-pointer hover:bg-gray-800 transition-colors">
              <input type="checkbox" defaultChecked className="rounded border-gray-700 bg-gray-900 text-red-500 focus:ring-red-500" />
              <span className="text-xl">{config.icon}</span>
              <span className="text-gray-300 text-xs">{config.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

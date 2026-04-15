'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

type Tab = 'overview' | 'sports' | 'eras' | 'distribution' | 'top-cards' | 'players' | 'sets';

function parseValue(v: string): number {
  const match = v.match(/\$[\d,]+/);
  if (!match) return 0;
  return parseInt(match[0].replace(/[$,]/g, ''), 10);
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n}`;
}

function formatCount(n: number): string {
  return n.toLocaleString();
}

function getEra(year: number): string {
  if (year < 1970) return 'Vintage (Pre-1970)';
  if (year < 1980) return 'Classic (1970-1979)';
  if (year < 1990) return 'Junk Wax (1980-1989)';
  if (year < 2000) return '90s Boom (1990-1999)';
  if (year < 2010) return 'Modern (2000-2009)';
  if (year < 2020) return 'Ultra-Modern (2010-2019)';
  return 'Current (2020+)';
}

const SPORT_COLORS: Record<string, string> = {
  baseball: 'text-red-400 bg-red-950/50 border-red-800/40',
  basketball: 'text-orange-400 bg-orange-950/50 border-orange-800/40',
  football: 'text-green-400 bg-green-950/50 border-green-800/40',
  hockey: 'text-cyan-400 bg-cyan-950/50 border-cyan-800/40',
};

const SPORT_ICONS: Record<string, string> = {
  baseball: '\u26be',
  basketball: '\ud83c\udfc0',
  football: '\ud83c\udfc8',
  hockey: '\ud83c\udfd2',
};

const TABS: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'sports', label: 'By Sport' },
  { key: 'eras', label: 'By Era' },
  { key: 'distribution', label: 'Price Tiers' },
  { key: 'top-cards', label: 'Top 25' },
  { key: 'players', label: 'Players' },
  { key: 'sets', label: 'Sets' },
];

export default function MarketDataRoomClient() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const stats = useMemo(() => {
    const cards = sportsCards;
    const totalCards = cards.length;
    const uniquePlayers = new Set(cards.map(c => c.player)).size;
    const uniqueSets = new Set(cards.map(c => c.set)).size;
    const rookieCards = cards.filter(c => c.rookie).length;

    // Parse all values
    const cardValues = cards.map(c => ({
      ...c,
      rawVal: parseValue(c.estimatedValueRaw),
      gemVal: parseValue(c.estimatedValueGem),
    }));

    const totalRawValue = cardValues.reduce((sum, c) => sum + c.rawVal, 0);
    const totalGemValue = cardValues.reduce((sum, c) => sum + c.gemVal, 0);
    const avgRawValue = Math.round(totalRawValue / totalCards);
    const avgGemValue = Math.round(totalGemValue / totalCards);
    const medianRaw = cardValues.map(c => c.rawVal).sort((a, b) => a - b)[Math.floor(totalCards / 2)];

    // Sport breakdown
    const sportMap = new Map<string, typeof cardValues>();
    for (const c of cardValues) {
      const arr = sportMap.get(c.sport) || [];
      arr.push(c);
      sportMap.set(c.sport, arr);
    }

    const sportBreakdown = ['baseball', 'basketball', 'football', 'hockey'].map(sport => {
      const sc = sportMap.get(sport) || [];
      const players = new Set(sc.map(c => c.player)).size;
      const sets = new Set(sc.map(c => c.set)).size;
      const rookies = sc.filter(c => c.rookie).length;
      const totalRaw = sc.reduce((s, c) => s + c.rawVal, 0);
      const totalGem = sc.reduce((s, c) => s + c.gemVal, 0);
      const avgRaw = sc.length ? Math.round(totalRaw / sc.length) : 0;
      const avgGem = sc.length ? Math.round(totalGem / sc.length) : 0;
      const mostValuable = [...sc].sort((a, b) => b.gemVal - a.gemVal).slice(0, 5);
      const topPlayers = [...new Map(sc.map(c => [c.player, c])).values()]
        .sort((a, b) => b.gemVal - a.gemVal)
        .slice(0, 5);
      return { sport, count: sc.length, players, sets, rookies, totalRaw, totalGem, avgRaw, avgGem, mostValuable, topPlayers, pctOfTotal: Math.round((sc.length / totalCards) * 100) };
    });

    // Era breakdown
    const eraMap = new Map<string, typeof cardValues>();
    for (const c of cardValues) {
      const era = getEra(c.year);
      const arr = eraMap.get(era) || [];
      arr.push(c);
      eraMap.set(era, arr);
    }

    const eraOrder = ['Vintage (Pre-1970)', 'Classic (1970-1979)', 'Junk Wax (1980-1989)', '90s Boom (1990-1999)', 'Modern (2000-2009)', 'Ultra-Modern (2010-2019)', 'Current (2020+)'];
    const eraBreakdown = eraOrder.map(era => {
      const ec = eraMap.get(era) || [];
      const avgRaw = ec.length ? Math.round(ec.reduce((s, c) => s + c.rawVal, 0) / ec.length) : 0;
      const avgGem = ec.length ? Math.round(ec.reduce((s, c) => s + c.gemVal, 0) / ec.length) : 0;
      const top = [...ec].sort((a, b) => b.gemVal - a.gemVal)[0];
      return { era, count: ec.length, avgRaw, avgGem, topCard: top, pctOfTotal: Math.round((ec.length / totalCards) * 100) };
    });

    // Price distribution tiers
    const tiers = [
      { label: 'Under $5', min: 0, max: 5 },
      { label: '$5 - $24', min: 5, max: 25 },
      { label: '$25 - $99', min: 25, max: 100 },
      { label: '$100 - $499', min: 100, max: 500 },
      { label: '$500 - $999', min: 500, max: 1000 },
      { label: '$1,000 - $9,999', min: 1000, max: 10000 },
      { label: '$10,000+', min: 10000, max: Infinity },
    ];

    const priceDist = tiers.map(t => {
      const raw = cardValues.filter(c => c.rawVal >= t.min && c.rawVal < t.max).length;
      const gem = cardValues.filter(c => c.gemVal >= t.min && c.gemVal < t.max).length;
      return { ...t, rawCount: raw, gemCount: gem, rawPct: Math.round((raw / totalCards) * 100), gemPct: Math.round((gem / totalCards) * 100) };
    });

    // Top 25 most valuable (by gem)
    const top25 = [...cardValues].sort((a, b) => b.gemVal - a.gemVal).slice(0, 25);

    // Player rankings — by card count & total gem value
    const playerMap = new Map<string, { player: string; sport: string; count: number; totalGem: number; totalRaw: number; bestCard: string; bestVal: number }>();
    for (const c of cardValues) {
      const existing = playerMap.get(c.player);
      if (existing) {
        existing.count++;
        existing.totalGem += c.gemVal;
        existing.totalRaw += c.rawVal;
        if (c.gemVal > existing.bestVal) {
          existing.bestCard = c.name;
          existing.bestVal = c.gemVal;
        }
      } else {
        playerMap.set(c.player, { player: c.player, sport: c.sport, count: 1, totalGem: c.gemVal, totalRaw: c.rawVal, bestCard: c.name, bestVal: c.gemVal });
      }
    }
    const playersByCount = [...playerMap.values()].sort((a, b) => b.count - a.count).slice(0, 20);
    const playersByValue = [...playerMap.values()].sort((a, b) => b.totalGem - a.totalGem).slice(0, 20);

    // Set rankings
    const setMap = new Map<string, { set: string; sport: string; count: number; avgGem: number; totalGem: number }>();
    for (const c of cardValues) {
      const existing = setMap.get(c.set);
      if (existing) {
        existing.count++;
        existing.totalGem += c.gemVal;
        existing.avgGem = Math.round(existing.totalGem / existing.count);
      } else {
        setMap.set(c.set, { set: c.set, sport: c.sport, count: 1, avgGem: c.gemVal, totalGem: c.gemVal });
      }
    }
    const setsByCount = [...setMap.values()].sort((a, b) => b.count - a.count).slice(0, 20);
    const setsByValue = [...setMap.values()].filter(s => s.count >= 3).sort((a, b) => b.avgGem - a.avgGem).slice(0, 20);

    return {
      totalCards, uniquePlayers, uniqueSets, rookieCards,
      totalRawValue, totalGemValue, avgRawValue, avgGemValue, medianRaw,
      sportBreakdown, eraBreakdown, priceDist, top25,
      playersByCount, playersByValue, setsByCount, setsByValue,
    };
  }, []);

  return (
    <div>
      {/* Tab navigation */}
      <div className="flex flex-wrap gap-1 mb-6 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === t.key ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Cards', value: formatCount(stats.totalCards), sub: 'in database' },
              { label: 'Unique Players', value: formatCount(stats.uniquePlayers), sub: 'across 4 sports' },
              { label: 'Unique Sets', value: formatCount(stats.uniqueSets), sub: 'tracked' },
              { label: 'Rookie Cards', value: formatCount(stats.rookieCards), sub: `${Math.round((stats.rookieCards / stats.totalCards) * 100)}% of total` },
            ].map(m => (
              <div key={m.label} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                <div className="text-zinc-500 text-xs uppercase tracking-wide">{m.label}</div>
                <div className="text-2xl font-bold text-white mt-1">{m.value}</div>
                <div className="text-zinc-500 text-xs mt-0.5">{m.sub}</div>
              </div>
            ))}
          </div>

          {/* Value metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Raw Value', value: formatNumber(stats.totalRawValue), sub: 'all cards (low est.)' },
              { label: 'Total Gem Value', value: formatNumber(stats.totalGemValue), sub: 'all cards (gem mint)' },
              { label: 'Avg Raw Value', value: formatNumber(stats.avgRawValue), sub: 'per card' },
              { label: 'Avg Gem Value', value: formatNumber(stats.avgGemValue), sub: 'per card (PSA 10)' },
            ].map(m => (
              <div key={m.label} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                <div className="text-zinc-500 text-xs uppercase tracking-wide">{m.label}</div>
                <div className="text-2xl font-bold text-emerald-400 mt-1">{m.value}</div>
                <div className="text-zinc-500 text-xs mt-0.5">{m.sub}</div>
              </div>
            ))}
          </div>

          {/* Sport composition bar */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-3">Market Composition by Sport</h3>
            <div className="flex rounded-lg overflow-hidden h-8">
              {stats.sportBreakdown.map(s => (
                <div
                  key={s.sport}
                  style={{ width: `${s.pctOfTotal}%` }}
                  className={`flex items-center justify-center text-xs font-bold ${
                    s.sport === 'baseball' ? 'bg-red-600' :
                    s.sport === 'basketball' ? 'bg-orange-600' :
                    s.sport === 'football' ? 'bg-green-600' : 'bg-cyan-600'
                  } text-white`}
                  title={`${s.sport}: ${s.pctOfTotal}%`}
                >
                  {s.pctOfTotal >= 10 ? `${s.sport.charAt(0).toUpperCase() + s.sport.slice(1)} ${s.pctOfTotal}%` : `${s.pctOfTotal}%`}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 mt-3">
              {stats.sportBreakdown.map(s => (
                <div key={s.sport} className="flex items-center gap-2 text-sm">
                  <span>{SPORT_ICONS[s.sport]}</span>
                  <span className="text-zinc-400 capitalize">{s.sport}</span>
                  <span className="text-white font-medium">{formatCount(s.count)}</span>
                  <span className="text-zinc-600">({s.pctOfTotal}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick era summary */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-3">Cards by Era</h3>
            <div className="space-y-2">
              {stats.eraBreakdown.map(e => (
                <div key={e.era} className="flex items-center gap-3">
                  <div className="w-40 sm:w-52 text-sm text-zinc-400 flex-shrink-0">{e.era}</div>
                  <div className="flex-1 bg-zinc-800 rounded-full h-5 overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${Math.max(e.pctOfTotal, 3)}%` }}
                    >
                      <span className="text-[10px] font-bold text-white">{e.count}</span>
                    </div>
                  </div>
                  <div className="text-zinc-500 text-xs w-10 text-right">{e.pctOfTotal}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sports Tab */}
      {activeTab === 'sports' && (
        <div className="space-y-6">
          {stats.sportBreakdown.map(s => (
            <div key={s.sport} className={`border rounded-xl p-5 ${SPORT_COLORS[s.sport]}`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{SPORT_ICONS[s.sport]}</span>
                <div>
                  <h3 className="text-white text-xl font-bold capitalize">{s.sport}</h3>
                  <p className="text-zinc-400 text-sm">{formatCount(s.count)} cards &middot; {s.players} players &middot; {s.sets} sets</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Cards', value: formatCount(s.count) },
                  { label: 'Rookie Cards', value: formatCount(s.rookies) },
                  { label: 'Avg Raw', value: formatNumber(s.avgRaw) },
                  { label: 'Avg Gem', value: formatNumber(s.avgGem) },
                ].map(m => (
                  <div key={m.label} className="bg-black/30 rounded-lg p-3">
                    <div className="text-zinc-500 text-xs">{m.label}</div>
                    <div className="text-white font-bold">{m.value}</div>
                  </div>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-zinc-300 text-sm font-semibold mb-2">Most Valuable Cards</h4>
                  <div className="space-y-1.5">
                    {s.mostValuable.map((c, i) => (
                      <Link key={c.slug} href={`/sports/${c.slug}`} className="flex items-center gap-2 text-sm hover:text-emerald-400 transition-colors">
                        <span className="text-zinc-600 w-5 text-right">{i + 1}.</span>
                        <span className="text-zinc-300 flex-1 truncate">{c.name}</span>
                        <span className="text-emerald-400 font-medium">{formatNumber(c.gemVal)}</span>
                      </Link>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-zinc-300 text-sm font-semibold mb-2">Top Players by Card Value</h4>
                  <div className="space-y-1.5">
                    {s.topPlayers.map((c, i) => (
                      <div key={c.player} className="flex items-center gap-2 text-sm">
                        <span className="text-zinc-600 w-5 text-right">{i + 1}.</span>
                        <span className="text-zinc-300 flex-1 truncate">{c.player}</span>
                        <span className="text-emerald-400 font-medium">{formatNumber(c.gemVal)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Eras Tab */}
      {activeTab === 'eras' && (
        <div className="space-y-4">
          {stats.eraBreakdown.map((e, i) => {
            const colors = ['text-amber-400 border-amber-800/40 bg-amber-950/30', 'text-yellow-400 border-yellow-800/40 bg-yellow-950/30', 'text-zinc-400 border-zinc-700/40 bg-zinc-900/50', 'text-purple-400 border-purple-800/40 bg-purple-950/30', 'text-blue-400 border-blue-800/40 bg-blue-950/30', 'text-indigo-400 border-indigo-800/40 bg-indigo-950/30', 'text-emerald-400 border-emerald-800/40 bg-emerald-950/30'];
            return (
              <div key={e.era} className={`border rounded-xl p-5 ${colors[i]}`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-white text-lg font-bold">{e.era}</h3>
                    <p className="text-zinc-400 text-sm">{formatCount(e.count)} cards ({e.pctOfTotal}% of database)</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-center">
                      <div className="text-zinc-500 text-xs">Avg Raw</div>
                      <div className="text-white font-bold">{formatNumber(e.avgRaw)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-zinc-500 text-xs">Avg Gem</div>
                      <div className="text-emerald-400 font-bold">{formatNumber(e.avgGem)}</div>
                    </div>
                  </div>
                </div>
                {e.topCard && (
                  <div className="bg-black/30 rounded-lg p-3">
                    <div className="text-zinc-500 text-xs mb-1">Most Valuable Card in Era</div>
                    <Link href={`/sports/${e.topCard.slug}`} className="text-white text-sm font-medium hover:text-emerald-400 transition-colors">
                      {e.topCard.name} — <span className="text-emerald-400">{formatNumber(e.topCard.gemVal)}</span> gem mint
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Price Distribution Tab */}
      {activeTab === 'distribution' && (
        <div className="space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Raw Card Value Distribution</h3>
            <div className="space-y-3">
              {stats.priceDist.map(t => (
                <div key={t.label} className="flex items-center gap-3">
                  <div className="w-28 sm:w-36 text-sm text-zinc-400 flex-shrink-0">{t.label}</div>
                  <div className="flex-1 bg-zinc-800 rounded-full h-7 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${Math.max(t.rawPct, 2)}%` }}
                    >
                      {t.rawPct >= 5 && <span className="text-[10px] font-bold text-white">{formatCount(t.rawCount)}</span>}
                    </div>
                  </div>
                  <div className="text-zinc-400 text-sm w-20 text-right">
                    {formatCount(t.rawCount)} <span className="text-zinc-600">({t.rawPct}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Gem Mint Value Distribution</h3>
            <div className="space-y-3">
              {stats.priceDist.map(t => (
                <div key={t.label} className="flex items-center gap-3">
                  <div className="w-28 sm:w-36 text-sm text-zinc-400 flex-shrink-0">{t.label}</div>
                  <div className="flex-1 bg-zinc-800 rounded-full h-7 overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${Math.max(t.gemPct, 2)}%` }}
                    >
                      {t.gemPct >= 5 && <span className="text-[10px] font-bold text-white">{formatCount(t.gemCount)}</span>}
                    </div>
                  </div>
                  <div className="text-zinc-400 text-sm w-20 text-right">
                    {formatCount(t.gemCount)} <span className="text-zinc-600">({t.gemPct}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-2">Key Insight</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              The grading multiplier effect is dramatic. In raw condition, the majority of cards are valued under $25.
              In gem mint condition (PSA 10), the distribution shifts significantly upward. This gap represents the
              potential return on investment from professional grading — but also the risk, since most cards don&apos;t
              receive a perfect grade.
            </p>
          </div>
        </div>
      )}

      {/* Top 25 Tab */}
      {activeTab === 'top-cards' && (
        <div className="space-y-1">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs text-zinc-500 uppercase tracking-wide border-b border-zinc-800">
              <div className="col-span-1">#</div>
              <div className="col-span-5 sm:col-span-4">Card</div>
              <div className="col-span-2 hidden sm:block">Sport</div>
              <div className="col-span-2">Year</div>
              <div className="col-span-2">Raw</div>
              <div className="col-span-2 sm:col-span-1">Gem</div>
            </div>
            {stats.top25.map((c, i) => (
              <Link
                key={c.slug}
                href={`/sports/${c.slug}`}
                className={`grid grid-cols-12 gap-2 px-4 py-3 text-sm hover:bg-zinc-800/50 transition-colors ${i < 3 ? 'bg-emerald-950/20' : ''} ${i > 0 ? 'border-t border-zinc-800/50' : ''}`}
              >
                <div className="col-span-1 text-zinc-500 font-medium">
                  {i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                </div>
                <div className="col-span-5 sm:col-span-4 text-white font-medium truncate">{c.name}</div>
                <div className="col-span-2 hidden sm:block text-zinc-400 capitalize">{c.sport}</div>
                <div className="col-span-2 text-zinc-400">{c.year}</div>
                <div className="col-span-2 text-zinc-300">{formatNumber(c.rawVal)}</div>
                <div className="col-span-2 sm:col-span-1 text-emerald-400 font-bold">{formatNumber(c.gemVal)}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Players Tab */}
      {activeTab === 'players' && (
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Most Cards in Database</h3>
            <div className="space-y-2">
              {stats.playersByCount.map((p, i) => (
                <div key={p.player} className="flex items-center gap-2 text-sm">
                  <span className="text-zinc-600 w-6 text-right flex-shrink-0">{i + 1}.</span>
                  <span className={`w-5 flex-shrink-0 ${SPORT_ICONS[p.sport] ? '' : 'text-zinc-600'}`}>
                    {SPORT_ICONS[p.sport] || '?'}
                  </span>
                  <span className="text-zinc-300 flex-1 truncate">{p.player}</span>
                  <span className="text-white font-bold">{p.count} cards</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Highest Total Gem Value</h3>
            <div className="space-y-2">
              {stats.playersByValue.map((p, i) => (
                <div key={p.player} className="flex items-center gap-2 text-sm">
                  <span className="text-zinc-600 w-6 text-right flex-shrink-0">{i + 1}.</span>
                  <span className={`w-5 flex-shrink-0 ${SPORT_ICONS[p.sport] ? '' : 'text-zinc-600'}`}>
                    {SPORT_ICONS[p.sport] || '?'}
                  </span>
                  <span className="text-zinc-300 flex-1 truncate">{p.player}</span>
                  <span className="text-emerald-400 font-bold">{formatNumber(p.totalGem)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sets Tab */}
      {activeTab === 'sets' && (
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Largest Sets (by card count)</h3>
            <div className="space-y-2">
              {stats.setsByCount.map((s, i) => (
                <div key={s.set} className="flex items-center gap-2 text-sm">
                  <span className="text-zinc-600 w-6 text-right flex-shrink-0">{i + 1}.</span>
                  <span className="w-5 flex-shrink-0">{SPORT_ICONS[s.sport] || '?'}</span>
                  <span className="text-zinc-300 flex-1 truncate">{s.set}</span>
                  <span className="text-white font-bold">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Most Valuable Sets (avg gem, 3+ cards)</h3>
            <div className="space-y-2">
              {stats.setsByValue.map((s, i) => (
                <div key={s.set} className="flex items-center gap-2 text-sm">
                  <span className="text-zinc-600 w-6 text-right flex-shrink-0">{i + 1}.</span>
                  <span className="w-5 flex-shrink-0">{SPORT_ICONS[s.sport] || '?'}</span>
                  <span className="text-zinc-300 flex-1 truncate">{s.set}</span>
                  <span className="text-emerald-400 font-bold">{formatNumber(s.avgGem)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

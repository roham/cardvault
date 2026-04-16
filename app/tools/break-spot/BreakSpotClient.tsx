'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

/* ── types ───────────────────────────────────────────────────────── */

type Sport = 'baseball' | 'basketball' | 'football' | 'hockey';

interface TeamSpot {
  team: string;
  fullName: string;
  slug: string;
  playerCount: number;
  topPlayers: { name: string; slug: string; value: number }[];
  avgValue: number;
  totalValue: number;
  ev: number;
  verdict: 'BUY' | 'FAIR' | 'AVOID';
  color: string;
}

interface ProductOption {
  slug: string;
  name: string;
  sport: Sport;
  retailPrice: number;
  ev: number;
}

/* ── data (passed from server) ───────────────────────────────────── */

interface Props {
  products: ProductOption[];
  teamsByTeam: Record<string, {
    name: string;
    fullName: string;
    slug: string;
    sport: Sport;
    primaryColor: string;
    players: { name: string; slug: string; avgValue: number }[];
  }>;
}

/* ── helpers ──────────────────────────────────────────────────────── */

function parseValue(v: string): number {
  const match = v.match(/\$([0-9,.]+)/);
  if (!match) return 5;
  return parseFloat(match[1].replace(/,/g, ''));
}

function sportLabel(s: Sport): string {
  return { baseball: 'Baseball', basketball: 'Basketball', football: 'Football', hockey: 'Hockey' }[s];
}

/* ── component ───────────────────────────────────────────────────── */

export default function BreakSpotClient({ products, teamsByTeam }: Props) {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [spotPrice, setSpotPrice] = useState('');
  const [sportFilter, setSportFilter] = useState<Sport | 'all'>('all');

  const filteredProducts = useMemo(() => {
    if (sportFilter === 'all') return products;
    return products.filter(p => p.sport === sportFilter);
  }, [products, sportFilter]);

  const product = products.find(p => p.slug === selectedProduct);

  const teamSpots = useMemo((): TeamSpot[] => {
    if (!product) return [];
    const sport = product.sport;
    const sportTeams = Object.values(teamsByTeam).filter(t => t.sport === sport);
    const totalPlayersInSport = sportTeams.reduce((sum, t) => sum + t.players.length, 0);
    if (totalPlayersInSport === 0) return [];

    const price = spotPrice ? parseFloat(spotPrice) : product.retailPrice / sportTeams.length;

    return sportTeams
      .map(team => {
        const topPlayers = team.players
          .map(p => ({ name: p.name, slug: p.slug, value: p.avgValue }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);
        const totalValue = team.players.reduce((s, p) => s + p.avgValue, 0);
        const avgValue = team.players.length > 0 ? totalValue / team.players.length : 0;
        // EV = team's share of product EV proportional to player count
        const ev = (team.players.length / totalPlayersInSport) * product.ev;
        const ratio = price > 0 ? ev / price : 0;
        const verdict: 'BUY' | 'FAIR' | 'AVOID' = ratio >= 1.3 ? 'BUY' : ratio >= 0.8 ? 'FAIR' : 'AVOID';

        return {
          team: team.name,
          fullName: team.fullName,
          slug: team.slug,
          playerCount: team.players.length,
          topPlayers,
          avgValue,
          totalValue,
          ev,
          verdict,
          color: team.primaryColor,
        };
      })
      .sort((a, b) => b.ev - a.ev);
  }, [product, spotPrice, teamsByTeam]);

  const bestTeam = teamSpots[0];
  const worstTeam = teamSpots[teamSpots.length - 1];
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {/* Sport filter */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'baseball', 'basketball', 'football', 'hockey'] as const).map(s => (
          <button
            key={s}
            onClick={() => { setSportFilter(s); setSelectedProduct(''); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              sportFilter === s
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {s === 'all' ? 'All Sports' : sportLabel(s as Sport)}
          </button>
        ))}
      </div>

      {/* Product selector */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Select a Sealed Product</label>
        <select
          value={selectedProduct}
          onChange={e => setSelectedProduct(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Choose a product...</option>
          {filteredProducts.map(p => (
            <option key={p.slug} value={p.slug}>
              {p.name} — ${p.retailPrice} retail — EV ${p.ev.toFixed(0)}
            </option>
          ))}
        </select>
      </div>

      {/* Spot price input */}
      {product && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Your Spot Price (optional — defaults to equal split: ${(product.retailPrice / Object.values(teamsByTeam).filter(t => t.sport === product.sport).length).toFixed(2)})
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">$</span>
            <input
              type="number"
              value={spotPrice}
              onChange={e => setSpotPrice(e.target.value)}
              placeholder={(product.retailPrice / Object.values(teamsByTeam).filter(t => t.sport === product.sport).length).toFixed(2)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-7 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.01"
            />
          </div>
        </div>
      )}

      {/* Results */}
      {product && teamSpots.length > 0 && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-800/80 border border-gray-700 rounded-xl p-4 text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Teams in Break</div>
              <div className="text-2xl font-bold text-white">{teamSpots.length}</div>
            </div>
            {bestTeam && (
              <div className="bg-emerald-950/40 border border-emerald-800/50 rounded-xl p-4 text-center">
                <div className="text-xs text-emerald-500 uppercase tracking-wider mb-1">Best Value</div>
                <div className="text-2xl font-bold text-emerald-400">{bestTeam.team}</div>
                <div className="text-xs text-emerald-600">EV ${bestTeam.ev.toFixed(2)} &middot; {bestTeam.playerCount} players</div>
              </div>
            )}
            {worstTeam && (
              <div className="bg-red-950/40 border border-red-800/50 rounded-xl p-4 text-center">
                <div className="text-xs text-red-500 uppercase tracking-wider mb-1">Lowest Value</div>
                <div className="text-2xl font-bold text-red-400">{worstTeam.team}</div>
                <div className="text-xs text-red-600">EV ${worstTeam.ev.toFixed(2)} &middot; {worstTeam.playerCount} players</div>
              </div>
            )}
          </div>

          {/* Team list */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500 px-4">
              <span>Team</span>
              <div className="flex gap-8">
                <span className="w-16 text-center">Players</span>
                <span className="w-20 text-right">Team EV</span>
                <span className="w-16 text-center">Verdict</span>
              </div>
            </div>

            {teamSpots.map((t, i) => (
              <div key={t.slug}>
                <button
                  onClick={() => setExpandedTeam(expandedTeam === t.slug ? null : t.slug)}
                  className="w-full bg-gray-800/60 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600 rounded-lg px-4 py-3 flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 text-xs w-5">{i + 1}</span>
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: t.color }}
                    />
                    <span className="text-white font-medium text-sm">{t.fullName}</span>
                  </div>
                  <div className="flex items-center gap-8">
                    <span className="w-16 text-center text-gray-400 text-sm">{t.playerCount}</span>
                    <span className="w-20 text-right text-white font-mono text-sm">${t.ev.toFixed(2)}</span>
                    <span className={`w-16 text-center text-xs font-bold px-2 py-0.5 rounded ${
                      t.verdict === 'BUY' ? 'bg-emerald-900/60 text-emerald-400' :
                      t.verdict === 'FAIR' ? 'bg-yellow-900/60 text-yellow-400' :
                      'bg-red-900/60 text-red-400'
                    }`}>
                      {t.verdict}
                    </span>
                  </div>
                </button>

                {/* Expanded detail */}
                {expandedTeam === t.slug && (
                  <div className="bg-gray-900/80 border border-gray-700/30 rounded-b-lg mx-1 px-4 py-3 -mt-1">
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <div className="text-xs text-gray-500">Avg Card Value</div>
                        <div className="text-white font-mono">${t.avgValue.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Total Player Value</div>
                        <div className="text-white font-mono">${t.totalValue.toFixed(0)}</div>
                      </div>
                    </div>
                    {t.topPlayers.length > 0 && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Top Players</div>
                        <div className="space-y-1">
                          {t.topPlayers.map(p => (
                            <Link
                              key={p.slug}
                              href={`/players/${p.slug}`}
                              className="flex items-center justify-between text-sm hover:bg-gray-800/60 rounded px-2 py-0.5 transition-colors"
                            >
                              <span className="text-blue-400 hover:text-blue-300">{p.name}</span>
                              <span className="text-gray-500 font-mono text-xs">${p.value.toFixed(0)}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                    <Link
                      href={`/teams/${t.slug}`}
                      className="inline-block mt-2 text-xs text-blue-500 hover:text-blue-400"
                    >
                      View {t.fullName} cards &rarr;
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* How it works */}
          <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6 mt-8">
            <h3 className="text-lg font-bold text-white mb-3">How Break Spot Value is Calculated</h3>
            <ol className="space-y-2 text-sm text-gray-400 list-decimal list-inside">
              <li>We count every player from each team in our {'>'}8,000 card database for the product&apos;s sport</li>
              <li>More players = more chances to pull valuable cards for that team</li>
              <li>Team EV = (team&apos;s player share) &times; (product&apos;s total expected value)</li>
              <li>Verdict compares your spot price to the team&apos;s EV — BUY if EV is 30%+ above price, AVOID if 20%+ below</li>
            </ol>
            <p className="text-xs text-gray-600 mt-3">
              Note: EV estimates are based on average card values in our database. Actual break results depend on specific hits, parallels, and autographs pulled.
            </p>
          </div>
        </>
      )}

      {/* Empty state */}
      {!product && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-3">📦</div>
          <p className="text-lg">Select a product above to see team spot values</p>
          <p className="text-sm mt-1">We&apos;ll calculate which teams give you the best bang for your buck in a group break</p>
        </div>
      )}

      {/* Related tools */}
      <div className="border-t border-gray-800 pt-8">
        <h3 className="text-lg font-bold text-white mb-4">Related Tools</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/tools/box-break', label: 'Box Break Calculator', icon: '📦' },
            { href: '/tools/sealed-ev', label: 'Sealed Product EV', icon: '📊' },
            { href: '/tools/flip-calc', label: 'Flip Profit Calculator', icon: '💸' },
            { href: '/tools/wax-vs-singles', label: 'Wax vs Singles', icon: '🃏' },
            { href: '/tools/set-break', label: 'Set Break Calculator', icon: '📦' },
            { href: '/tools/pack-sim', label: 'Pack Simulator', icon: '🎰' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 bg-gray-800/60 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

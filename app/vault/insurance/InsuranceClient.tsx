'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards, type SportsCard } from '@/data/sports-cards';
import { getVaultCards, type VaultCard } from '@/lib/vault';

function parseValue(v: string): number {
  const m = v.match(/\$([\d,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function formatCurrency(n: number): string {
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return '$' + (n / 1000).toFixed(1) + 'K';
  return '$' + n.toLocaleString();
}

function formatExact(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

interface InsuredCard {
  card: SportsCard;
  rawValue: number;
  gemValue: number;
  replacementValue: number;
  condition: 'raw' | 'graded';
}

type CoverageTier = 'standard' | 'recommended' | 'premium';
type Source = 'vault' | 'manual';

const COVERAGE_TIERS: { id: CoverageTier; label: string; multiplier: number; description: string; color: string }[] = [
  { id: 'standard', label: 'Standard', multiplier: 1.0, description: 'Fair market value coverage. Covers current estimated value.', color: 'text-blue-400' },
  { id: 'recommended', label: 'Recommended', multiplier: 1.15, description: 'FMV + 15% buffer for market fluctuation and replacement costs.', color: 'text-emerald-400' },
  { id: 'premium', label: 'Premium', multiplier: 1.30, description: 'FMV + 30% for full replacement including shipping, grading, and time.', color: 'text-amber-400' },
];

const INSURANCE_PROVIDERS = [
  { name: 'CollectInsure', type: 'Hobby-Specific', cost: '~$1.50 per $100/year', coverage: 'All collectibles, door-to-door transit, shows', pros: 'Built for collectors, covers in transit and at shows', cons: 'Requires appraisal above $5K' },
  { name: 'Hugh Wood', type: 'Specialty', cost: '~$2.00 per $100/year', coverage: 'High-value collections, scheduled items', pros: 'Covers appreciation, agreed value policies', cons: 'Higher minimums, slower claims' },
  { name: 'Homeowner/Renter Rider', type: 'General', cost: '~$0.50-$1.50 per $100/year', coverage: 'Adds to existing policy, covers fire/theft at home', pros: 'Cheapest option, easy to add', cons: 'May not cover transit, shows, or full replacement' },
  { name: 'Standalone Inland Marine', type: 'General', cost: '~$1.00-$2.50 per $100/year', coverage: 'Portable property, covers anywhere', pros: 'Broad coverage, travels with you', cons: 'May exclude certain loss types' },
];

const DOC_TIPS = [
  { icon: '📸', title: 'Photograph Everything', desc: 'Front, back, and close-up of each card. Include slab labels for graded cards.' },
  { icon: '🧾', title: 'Keep Purchase Receipts', desc: 'eBay, PWCC, card show receipts. Screenshots of completed purchases count.' },
  { icon: '📋', title: 'Maintain an Inventory Spreadsheet', desc: 'Card name, purchase date, price paid, current estimated value, and grade.' },
  { icon: '🏷️', title: 'Save Grading Certificates', desc: 'PSA/BGS/CGC cert numbers link to verification pages. Record all of them.' },
  { icon: '📅', title: 'Update Annually', desc: 'Card values change. Review and update your insured value at least once per year.' },
  { icon: '🔐', title: 'Store Securely', desc: 'Fireproof safe, safety deposit box, or climate-controlled storage. Insurers may require proof of secure storage.' },
];

export default function InsuranceClient() {
  const [mounted, setMounted] = useState(false);
  const [source, setSource] = useState<Source>('vault');
  const [vaultCards, setVaultCards] = useState<VaultCard[]>([]);
  const [manualCards, setManualCards] = useState<InsuredCard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [coverageTier, setCoverageTier] = useState<CoverageTier>('recommended');
  const [conditionDefault, setConditionDefault] = useState<'raw' | 'graded'>('raw');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    setVaultCards(getVaultCards());
  }, []);

  const vaultInsuredCards = useMemo(() => {
    return vaultCards.map(vc => {
      const card = sportsCards.find(c => c.slug === vc.slug);
      if (!card) return null;
      const rawVal = parseValue(card.estimatedValueRaw);
      const gemVal = parseValue(card.estimatedValueGem);
      return {
        card,
        rawValue: rawVal,
        gemValue: gemVal,
        replacementValue: conditionDefault === 'graded' ? gemVal : rawVal,
        condition: conditionDefault,
      } as InsuredCard;
    }).filter(Boolean) as InsuredCard[];
  }, [vaultCards, conditionDefault]);

  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return sportsCards
      .filter(c => c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q))
      .slice(0, 8);
  }, [searchQuery]);

  const activeCards = source === 'vault' ? vaultInsuredCards : manualCards;
  const tierMultiplier = COVERAGE_TIERS.find(t => t.id === coverageTier)?.multiplier || 1.15;

  const totalReplacement = activeCards.reduce((s, c) => s + c.replacementValue, 0);
  const insuredValue = Math.round(totalReplacement * tierMultiplier);

  const sportBreakdown = useMemo(() => {
    const map: Record<string, { count: number; value: number }> = {};
    activeCards.forEach(c => {
      const s = c.card.sport;
      if (!map[s]) map[s] = { count: 0, value: 0 };
      map[s].count++;
      map[s].value += c.replacementValue;
    });
    return Object.entries(map).sort((a, b) => b[1].value - a[1].value);
  }, [activeCards]);

  const topCards = useMemo(() => {
    return [...activeCards].sort((a, b) => b.replacementValue - a.replacementValue).slice(0, 10);
  }, [activeCards]);

  function addManualCard(card: SportsCard) {
    const rawVal = parseValue(card.estimatedValueRaw);
    const gemVal = parseValue(card.estimatedValueGem);
    setManualCards(prev => [...prev, {
      card,
      rawValue: rawVal,
      gemValue: gemVal,
      replacementValue: conditionDefault === 'graded' ? gemVal : rawVal,
      condition: conditionDefault,
    }]);
    setSearchQuery('');
  }

  function removeManualCard(idx: number) {
    setManualCards(prev => prev.filter((_, i) => i !== idx));
  }

  function toggleCardCondition(idx: number) {
    const update = (cards: InsuredCard[]) => cards.map((c, i) => {
      if (i !== idx) return c;
      const newCondition: 'raw' | 'graded' = c.condition === 'raw' ? 'graded' : 'raw';
      return { ...c, condition: newCondition, replacementValue: newCondition === 'graded' ? c.gemValue : c.rawValue };
    });
    if (source === 'vault') {
      // Can't toggle vault cards individually in this simplified version
    } else {
      setManualCards(update);
    }
  }

  function copyReport() {
    const tier = COVERAGE_TIERS.find(t => t.id === coverageTier)!;
    const lines = [
      'CARDVAULT COLLECTION INSURANCE ESTIMATE',
      `Generated: ${new Date().toLocaleDateString()}`,
      `Coverage Tier: ${tier.label} (${Math.round((tier.multiplier - 1) * 100)}% buffer)`,
      '',
      `Total Cards: ${activeCards.length}`,
      `Total Replacement Value: ${formatExact(totalReplacement)}`,
      `Recommended Insured Amount: ${formatExact(insuredValue)}`,
      '',
      'TOP 10 HIGHEST VALUE CARDS:',
      ...topCards.map((c, i) => `${i + 1}. ${c.card.name} — ${formatExact(c.replacementValue)} (${c.condition})`),
      '',
      'SPORT BREAKDOWN:',
      ...sportBreakdown.map(([sport, data]) => `${sport}: ${data.count} cards, ${formatExact(data.value)}`),
      '',
      'Generated by CardVault — https://cardvault-two.vercel.app/vault/insurance',
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const sportIcons: Record<string, string> = { baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒' };

  if (!mounted) {
    return <div className="text-center text-gray-500 py-20">Loading insurance estimator...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Source Toggle */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setSource('vault')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${source === 'vault' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
        >
          From My Vault ({vaultCards.length} cards)
        </button>
        <button
          onClick={() => setSource('manual')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${source === 'manual' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
        >
          Manual Entry
        </button>
        {source === 'vault' && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-gray-500 text-xs">Condition:</span>
            <button
              onClick={() => setConditionDefault(conditionDefault === 'raw' ? 'graded' : 'raw')}
              className={`px-3 py-1 rounded text-xs font-medium ${conditionDefault === 'graded' ? 'bg-purple-600/30 text-purple-300 border border-purple-600/50' : 'bg-gray-700 text-gray-300 border border-gray-600'}`}
            >
              {conditionDefault === 'graded' ? 'Gem Mint Values' : 'Raw Values'}
            </button>
          </div>
        )}
      </div>

      {/* Manual Search */}
      {source === 'manual' && (
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cards to add (e.g. 'Mike Trout', 'Topps Chrome')..."
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
          />
          {searchResults.length > 0 && (
            <div className="absolute z-20 top-full mt-1 w-full bg-gray-900 border border-gray-700 rounded-xl shadow-xl max-h-64 overflow-y-auto">
              {searchResults.map(card => (
                <button
                  key={card.slug}
                  onClick={() => addManualCard(card)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-800 transition-colors border-b border-gray-800 last:border-0"
                >
                  <div className="text-white text-sm">{sportIcons[card.sport] || ''} {card.name}</div>
                  <div className="text-gray-500 text-xs">Raw: {card.estimatedValueRaw} | Gem: {card.estimatedValueGem}</div>
                </button>
              ))}
            </div>
          )}
          {manualCards.length > 0 && (
            <div className="mt-3 space-y-1">
              {manualCards.map((mc, idx) => (
                <div key={idx} className="flex items-center justify-between px-3 py-2 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm">{sportIcons[mc.card.sport]}</span>
                    <span className="text-white text-sm truncate">{mc.card.name}</span>
                    <button
                      onClick={() => toggleCardCondition(idx)}
                      className={`px-2 py-0.5 rounded text-xs shrink-0 ${mc.condition === 'graded' ? 'bg-purple-600/30 text-purple-300' : 'bg-gray-700 text-gray-400'}`}
                    >
                      {mc.condition === 'graded' ? 'Gem' : 'Raw'}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-emerald-400 text-sm font-medium">{formatCurrency(mc.replacementValue)}</span>
                    <button onClick={() => removeManualCard(idx)} className="text-gray-500 hover:text-red-400 text-sm">x</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeCards.length === 0 ? (
        <div className="text-center py-16 bg-gray-900/50 border border-gray-800 rounded-2xl">
          <div className="text-4xl mb-3">🛡️</div>
          <h3 className="text-white text-lg font-medium mb-2">
            {source === 'vault' ? 'No Cards in Vault' : 'No Cards Added'}
          </h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            {source === 'vault'
              ? 'Open some packs to add cards to your vault, then come back to estimate your insurance needs.'
              : 'Search for cards above to add them to your insurance estimate.'}
          </p>
          {source === 'vault' && (
            <Link href="/packs" className="inline-block mt-4 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors">
              Open Packs
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Coverage Tier Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {COVERAGE_TIERS.map(tier => (
              <button
                key={tier.id}
                onClick={() => setCoverageTier(tier.id)}
                className={`text-left p-4 rounded-xl border transition-all ${coverageTier === tier.id ? 'bg-gray-800 border-emerald-600 ring-1 ring-emerald-600' : 'bg-gray-900/50 border-gray-800 hover:border-gray-600'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-semibold text-sm ${tier.color}`}>{tier.label}</span>
                  {tier.id === 'recommended' && <span className="text-[10px] bg-emerald-900/50 text-emerald-400 px-1.5 py-0.5 rounded">Best</span>}
                </div>
                <div className="text-white text-xl font-bold">{formatExact(Math.round(totalReplacement * tier.multiplier))}</div>
                <p className="text-gray-500 text-xs mt-1">{tier.description}</p>
              </button>
            ))}
          </div>

          {/* Summary Dashboard */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-gray-500 text-xs mb-1">Total Cards</div>
              <div className="text-white text-2xl font-bold">{activeCards.length}</div>
            </div>
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-gray-500 text-xs mb-1">Replacement Value</div>
              <div className="text-white text-2xl font-bold">{formatCurrency(totalReplacement)}</div>
            </div>
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-gray-500 text-xs mb-1">Insured Amount</div>
              <div className="text-emerald-400 text-2xl font-bold">{formatCurrency(insuredValue)}</div>
            </div>
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-gray-500 text-xs mb-1">Est. Annual Premium</div>
              <div className="text-amber-400 text-2xl font-bold">{formatCurrency(Math.round(insuredValue * 0.015))}</div>
              <div className="text-gray-600 text-[10px]">~$1.50/$100/yr</div>
            </div>
          </div>

          {/* Sport Breakdown */}
          {sportBreakdown.length > 0 && (
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-3">Value by Sport</h3>
              <div className="space-y-2">
                {sportBreakdown.map(([sport, data]) => {
                  const pct = totalReplacement > 0 ? (data.value / totalReplacement) * 100 : 0;
                  return (
                    <div key={sport}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-300 capitalize">{sportIcons[sport] || ''} {sport}</span>
                        <span className="text-gray-400">{data.count} cards &mdash; {formatExact(data.value)} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500/70"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top 10 Highest Value Cards */}
          {topCards.length > 0 && (
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-3">Top 10 Highest Value Cards</h3>
              <div className="space-y-2">
                {topCards.map((c, i) => {
                  const pct = totalReplacement > 0 ? (c.replacementValue / totalReplacement) * 100 : 0;
                  return (
                    <div key={i} className="flex items-center gap-3 px-3 py-2 bg-gray-800/30 rounded-lg">
                      <span className="text-gray-600 text-sm font-mono w-5 shrink-0">#{i + 1}</span>
                      <span className="text-sm">{sportIcons[c.card.sport]}</span>
                      <Link href={`/sports/${c.card.slug}`} className="text-white text-sm hover:text-emerald-400 transition-colors truncate min-w-0">
                        {c.card.name}
                      </Link>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${c.condition === 'graded' ? 'bg-purple-600/20 text-purple-400' : 'bg-gray-700 text-gray-400'}`}>
                        {c.condition === 'graded' ? 'Gem' : 'Raw'}
                      </span>
                      <span className="text-emerald-400 text-sm font-medium ml-auto shrink-0">{formatExact(c.replacementValue)}</span>
                      <span className="text-gray-600 text-xs shrink-0">({pct.toFixed(1)}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Insurance Provider Comparison */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-4">Insurance Options for Your Collection</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {INSURANCE_PROVIDERS.map((p) => {
                const estCost = p.name === 'CollectInsure' ? Math.round(insuredValue * 0.015) :
                  p.name === 'Hugh Wood' ? Math.round(insuredValue * 0.02) :
                  p.name.includes('Homeowner') ? Math.round(insuredValue * 0.01) :
                  Math.round(insuredValue * 0.0175);
                return (
                  <div key={p.name} className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-white font-medium text-sm">{p.name}</div>
                        <div className="text-gray-500 text-xs">{p.type}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-emerald-400 font-semibold text-sm">~{formatExact(estCost)}/yr</div>
                        <div className="text-gray-600 text-[10px]">{p.cost}</div>
                      </div>
                    </div>
                    <p className="text-gray-400 text-xs mb-2">{p.coverage}</p>
                    <div className="flex gap-3 text-xs">
                      <div><span className="text-emerald-500">+</span> <span className="text-gray-400">{p.pros}</span></div>
                    </div>
                    <div className="text-xs mt-1">
                      <span className="text-red-500">-</span> <span className="text-gray-500">{p.cons}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Documentation Tips */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-4">Documentation Best Practices</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {DOC_TIPS.map((tip) => (
                <div key={tip.title} className="flex items-start gap-3 p-3 bg-gray-800/30 rounded-lg">
                  <span className="text-xl shrink-0">{tip.icon}</span>
                  <div>
                    <div className="text-white text-sm font-medium">{tip.title}</div>
                    <p className="text-gray-500 text-xs mt-0.5">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Copy Report */}
          <div className="flex justify-center">
            <button
              onClick={copyReport}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors"
            >
              {copied ? 'Copied to Clipboard!' : 'Copy Insurance Report'}
            </button>
          </div>
        </>
      )}

      {/* Related Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-gray-800">
        <Link href="/vault/analytics" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors">
          <span className="text-lg">📊</span>
          <div>
            <div className="text-white text-sm font-medium">Vault Analytics</div>
            <div className="text-gray-500 text-xs">Portfolio breakdown and ROI</div>
          </div>
        </Link>
        <Link href="/vault/wishlist" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors">
          <span className="text-lg">🎯</span>
          <div>
            <div className="text-white text-sm font-medium">Wishlist</div>
            <div className="text-gray-500 text-xs">Cards you want to buy</div>
          </div>
        </Link>
        <Link href="/tools/holder-guide" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors">
          <span className="text-lg">📦</span>
          <div>
            <div className="text-white text-sm font-medium">Holder Guide</div>
            <div className="text-gray-500 text-xs">Protect your cards properly</div>
          </div>
        </Link>
      </div>
    </div>
  );
}

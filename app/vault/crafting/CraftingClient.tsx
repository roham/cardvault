'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards, type SportsCard } from '@/data/sports-cards';
import { getVaultCards, addToVault, removeFromVault, type VaultCard } from '@/lib/vault';

// ─── Types ───────────────────────────────────────────────────────────

interface CraftResult {
  inputCards: SportsCard[];
  outputCard: SportsCard;
  tier: string;
  timestamp: string;
}

interface CraftStats {
  totalCrafts: number;
  bestCraft: string;
  craftsByTier: Record<string, number>;
}

// ─── Helpers ─────────────────────────────────────────────────────────

const STATS_KEY = 'cardvault-craft-stats';
const HISTORY_KEY = 'cardvault-craft-history';

function parseValue(val: string): number {
  const m = val.match(/\$([0-9,]+)/);
  if (!m) return 0;
  return parseInt(m[1].replace(/,/g, ''), 10);
}

function getValueTier(val: number): string {
  if (val >= 1000) return 'Legendary';
  if (val >= 200) return 'Epic';
  if (val >= 50) return 'Rare';
  if (val >= 10) return 'Uncommon';
  return 'Common';
}

const tierColors: Record<string, string> = {
  Common: 'text-gray-400 bg-gray-800/60 border-gray-700',
  Uncommon: 'text-green-400 bg-green-900/30 border-green-800',
  Rare: 'text-blue-400 bg-blue-900/30 border-blue-800',
  Epic: 'text-purple-400 bg-purple-900/30 border-purple-800',
  Legendary: 'text-yellow-400 bg-yellow-900/30 border-yellow-800',
};

const sportEmoji: Record<string, string> = {
  baseball: '\u26BE',
  basketball: '\uD83C\uDFC0',
  football: '\uD83C\uDFC8',
  hockey: '\uD83C\uDFD2',
};

const sportColors: Record<string, string> = {
  baseball: 'border-red-700 bg-red-900/40',
  basketball: 'border-orange-700 bg-orange-900/40',
  football: 'border-blue-700 bg-blue-900/40',
  hockey: 'border-cyan-700 bg-cyan-900/40',
};

// ─── Component ───────────────────────────────────────────────────────

export default function CraftingClient() {
  const [mounted, setMounted] = useState(false);
  const [vaultCards, setVaultCards] = useState<VaultCard[]>([]);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [crafting, setCrafting] = useState(false);
  const [result, setResult] = useState<CraftResult | null>(null);
  const [stats, setStats] = useState<CraftStats>({ totalCrafts: 0, bestCraft: '', craftsByTier: {} });
  const [history, setHistory] = useState<CraftResult[]>([]);

  useEffect(() => {
    setMounted(true);
    setVaultCards(getVaultCards());
    try {
      const s = localStorage.getItem(STATS_KEY);
      if (s) setStats(JSON.parse(s));
      const h = localStorage.getItem(HISTORY_KEY);
      if (h) setHistory(JSON.parse(h));
    } catch { /* ignore */ }
  }, []);

  // Map vault cards to full card data
  const vaultWithData = useMemo(() => {
    return vaultCards.map(vc => {
      const card = sportsCards.find(sc => sc.slug === vc.slug);
      return card ? { vault: vc, card } : null;
    }).filter((x): x is { vault: VaultCard; card: SportsCard } => x !== null);
  }, [vaultCards]);

  // Filter by sport
  const filtered = useMemo(() => {
    if (sportFilter === 'all') return vaultWithData;
    return vaultWithData.filter(x => x.card.sport === sportFilter);
  }, [vaultWithData, sportFilter]);

  // Get sport counts
  const sportCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const x of vaultWithData) {
      counts[x.card.sport] = (counts[x.card.sport] || 0) + 1;
    }
    return counts;
  }, [vaultWithData]);

  // Selected cards with data
  const selectedCards = useMemo(() => {
    return selectedSlugs.map(slug => {
      const found = vaultWithData.find(x => x.card.slug === slug);
      return found?.card;
    }).filter((c): c is SportsCard => c !== undefined);
  }, [selectedSlugs, vaultWithData]);

  // Can craft?
  const canCraft = useMemo(() => {
    if (selectedCards.length !== 3) return false;
    const sport = selectedCards[0].sport;
    return selectedCards.every(c => c.sport === sport);
  }, [selectedCards]);

  // Toggle card selection
  const toggleSelect = useCallback((slug: string) => {
    setSelectedSlugs(prev => {
      if (prev.includes(slug)) return prev.filter(s => s !== slug);
      if (prev.length >= 3) return prev;
      return [...prev, slug];
    });
  }, []);

  // Craft!
  const doCraft = useCallback(() => {
    if (!canCraft || crafting) return;
    setCrafting(true);

    setTimeout(() => {
      const sport = selectedCards[0].sport;
      const avgValue = selectedCards.reduce((sum, c) => sum + parseValue(c.estimatedValueGem), 0) / 3;

      // Output card is randomly selected from same sport, higher value tier
      const candidates = sportsCards.filter(c => {
        if (c.sport !== sport) return false;
        const v = parseValue(c.estimatedValueGem);
        return v > avgValue * 0.8; // must be at least 80% of avg input value
      });

      // Weight toward higher-value cards
      const rng = Math.random();
      let outputCard: SportsCard;
      if (rng < 0.05 && candidates.length > 0) {
        // 5% chance: top 5% of candidates (jackpot)
        const sorted = [...candidates].sort((a, b) => parseValue(b.estimatedValueGem) - parseValue(a.estimatedValueGem));
        outputCard = sorted[Math.floor(Math.random() * Math.max(1, Math.floor(sorted.length * 0.05)))];
      } else if (rng < 0.25 && candidates.length > 0) {
        // 20% chance: top 25%
        const sorted = [...candidates].sort((a, b) => parseValue(b.estimatedValueGem) - parseValue(a.estimatedValueGem));
        outputCard = sorted[Math.floor(Math.random() * Math.max(1, Math.floor(sorted.length * 0.25)))];
      } else {
        // 75% chance: random from candidates
        outputCard = candidates.length > 0
          ? candidates[Math.floor(Math.random() * candidates.length)]
          : sportsCards.filter(c => c.sport === sport)[Math.floor(Math.random() * sportsCards.filter(c => c.sport === sport).length)];
      }

      // Remove input cards from vault
      for (const slug of selectedSlugs) {
        removeFromVault(slug);
      }

      // Add output card to vault
      addToVault([{
        slug: outputCard.slug,
        acquiredAt: new Date().toISOString(),
        acquiredFrom: 'pack',
        pricePaid: 0,
      }]);

      const tier = getValueTier(parseValue(outputCard.estimatedValueGem));
      const craftResult: CraftResult = {
        inputCards: selectedCards,
        outputCard,
        tier,
        timestamp: new Date().toISOString(),
      };

      // Update stats
      const newStats: CraftStats = {
        totalCrafts: stats.totalCrafts + 1,
        bestCraft: parseValue(outputCard.estimatedValueGem) > parseValue(stats.bestCraft || '$0')
          ? outputCard.estimatedValueGem : stats.bestCraft,
        craftsByTier: { ...stats.craftsByTier, [tier]: (stats.craftsByTier[tier] || 0) + 1 },
      };
      setStats(newStats);
      localStorage.setItem(STATS_KEY, JSON.stringify(newStats));

      // Update history
      const newHistory = [craftResult, ...history].slice(0, 50);
      setHistory(newHistory);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));

      setResult(craftResult);
      setSelectedSlugs([]);
      setVaultCards(getVaultCards());
      setCrafting(false);
    }, 1500);
  }, [canCraft, crafting, selectedCards, selectedSlugs, stats, history]);

  if (!mounted) return <div className="text-gray-500 text-center py-20">Loading...</div>;

  // ─── Result view ───────────────────────────────────────────────────
  if (result) {
    const tier = result.tier;
    return (
      <div className="space-y-6">
        <div className={`border rounded-2xl p-6 text-center ${tierColors[tier]}`}>
          <div className="text-sm uppercase tracking-wider opacity-70 mb-2">Crafted!</div>
          <div className="text-3xl font-black mb-2">{sportEmoji[result.outputCard.sport]} {result.outputCard.player}</div>
          <div className="text-lg opacity-80">{result.outputCard.year} {result.outputCard.set}</div>
          <div className={`inline-block mt-3 px-3 py-1 rounded-full text-sm font-bold ${tierColors[tier]}`}>
            {tier} — {result.outputCard.estimatedValueGem}
          </div>
        </div>

        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
          <div className="text-gray-500 text-xs uppercase mb-2">Sacrificed</div>
          <div className="space-y-1">
            {result.inputCards.map((c, i) => (
              <div key={i} className="text-sm text-gray-400">
                {sportEmoji[c.sport]} {c.player} — {c.year} {c.set}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => setResult(null)} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-all">
            Craft Again
          </button>
          <Link href="/vault" className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-medium text-center transition-all">
            View Vault
          </Link>
        </div>
      </div>
    );
  }

  // ─── Main crafting view ────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats.totalCrafts > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
            <div className="text-white text-xl font-bold">{stats.totalCrafts}</div>
            <div className="text-gray-500 text-xs">Crafts</div>
          </div>
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
            <div className="text-white text-xl font-bold">{stats.bestCraft || '—'}</div>
            <div className="text-gray-500 text-xs">Best Craft</div>
          </div>
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
            <div className="text-white text-xl font-bold">{Object.keys(stats.craftsByTier).length}</div>
            <div className="text-gray-500 text-xs">Tiers Hit</div>
          </div>
        </div>
      )}

      {/* Selected cards */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4">
        <div className="text-gray-500 text-xs uppercase tracking-wider mb-3">Crafting Slots (3 same-sport cards)</div>
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map(i => {
            const card = selectedCards[i];
            return (
              <div
                key={i}
                className={`min-h-[80px] rounded-xl border-2 border-dashed flex items-center justify-center text-center p-2 transition-all ${
                  card
                    ? `${sportColors[card.sport]} border-solid`
                    : 'border-gray-700 bg-gray-900/30'
                }`}
              >
                {card ? (
                  <div>
                    <div className="text-white text-sm font-bold">{sportEmoji[card.sport]} {card.player}</div>
                    <div className="text-gray-400 text-xs">{card.year}</div>
                  </div>
                ) : (
                  <span className="text-gray-600 text-sm">Empty</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Craft button */}
        <button
          onClick={doCraft}
          disabled={!canCraft || crafting}
          className={`w-full mt-4 py-3 rounded-xl font-bold text-lg transition-all ${
            canCraft && !crafting
              ? 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white'
              : 'bg-gray-800 text-gray-600 cursor-not-allowed'
          }`}
        >
          {crafting ? 'Crafting...' : canCraft ? 'Craft!' : 'Select 3 cards of the same sport'}
        </button>
      </div>

      {/* Sport filter */}
      <div className="flex flex-wrap gap-2">
        {['all', 'baseball', 'basketball', 'football', 'hockey'].map(sport => (
          <button
            key={sport}
            onClick={() => { setSportFilter(sport); setSelectedSlugs([]); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              sportFilter === sport
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {sport === 'all' ? `All (${vaultWithData.length})` : `${sportEmoji[sport]} ${sport.charAt(0).toUpperCase() + sport.slice(1)} (${sportCounts[sport] || 0})`}
          </button>
        ))}
      </div>

      {/* Vault cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p className="text-lg mb-2">No cards in vault</p>
          <p className="text-sm">Open packs to add cards to your vault, then come back to craft!</p>
          <Link href="/packs" className="inline-block mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all">
            Open Packs
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto">
          {filtered.map(({ vault, card }) => {
            const selected = selectedSlugs.includes(card.slug);
            const tier = getValueTier(parseValue(card.estimatedValueGem));
            return (
              <button
                key={card.slug + vault.acquiredAt}
                onClick={() => toggleSelect(card.slug)}
                className={`text-left rounded-xl border p-3 transition-all ${
                  selected
                    ? 'border-emerald-500 bg-emerald-900/30 ring-2 ring-emerald-500/30'
                    : `${sportColors[card.sport]} hover:opacity-80`
                }`}
              >
                <div className="text-white text-sm font-bold truncate">{sportEmoji[card.sport]} {card.player}</div>
                <div className="text-gray-400 text-xs">{card.year} {card.set}</div>
                <div className={`text-xs mt-1 ${tierColors[tier].split(' ')[0]}`}>{tier}</div>
              </button>
            );
          })}
        </div>
      )}

      {/* Crafting history */}
      {history.length > 0 && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4">
          <h3 className="text-white font-semibold mb-3">Craft History</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {history.slice(0, 10).map((h, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2 text-sm">
                <div>
                  <span className={tierColors[h.tier].split(' ')[0]}>{h.tier}</span>
                  <span className="text-gray-400 ml-2">{sportEmoji[h.outputCard.sport]} {h.outputCard.player}</span>
                </div>
                <span className="text-gray-500 text-xs">{h.outputCard.estimatedValueGem}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

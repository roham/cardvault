'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards, type SportsCard } from '@/data/sports-cards';
import { getVaultCards, addToVault, removeFromVault, type VaultCard } from '@/lib/vault';

// ── Rarity Tiers ────────────────────────────────────────────────────────

interface RarityTier {
  name: string;
  label: string;
  minValue: number;
  maxValue: number;
  color: string;
  bg: string;
  border: string;
  icon: string;
}

const TIERS: RarityTier[] = [
  { name: 'common', label: 'Common', minValue: 0, maxValue: 24, color: 'text-gray-400', bg: 'bg-gray-800/50', border: 'border-gray-600/50', icon: '○' },
  { name: 'uncommon', label: 'Uncommon', minValue: 25, maxValue: 99, color: 'text-green-400', bg: 'bg-green-950/50', border: 'border-green-700/50', icon: '◆' },
  { name: 'rare', label: 'Rare', minValue: 100, maxValue: 499, color: 'text-blue-400', bg: 'bg-blue-950/50', border: 'border-blue-700/50', icon: '★' },
  { name: 'epic', label: 'Epic', minValue: 500, maxValue: 999, color: 'text-purple-400', bg: 'bg-purple-950/50', border: 'border-purple-700/50', icon: '✦' },
  { name: 'legendary', label: 'Legendary', minValue: 1000, maxValue: Infinity, color: 'text-yellow-400', bg: 'bg-yellow-950/50', border: 'border-yellow-600/50', icon: '♛' },
];

const SPORT_COLORS: Record<string, string> = {
  baseball: 'text-red-400',
  basketball: 'text-orange-400',
  football: 'text-blue-400',
  hockey: 'text-cyan-400',
};

const SPORT_ICONS: Record<string, string> = {
  baseball: '⚾',
  basketball: '🏀',
  football: '🏈',
  hockey: '🏒',
};

const CARDS_REQUIRED = 3;
const STORAGE_KEY = 'cardvault-crafting-stats';

interface CraftingStats {
  totalCrafts: number;
  highestTierCrafted: string;
  totalValueCreated: number;
  lastCraftDate: string;
  craftHistory: { date: string; inputTier: string; outputCard: string; outputValue: number }[];
}

function parseValue(raw: string): number {
  const m = raw.match(/\$(\d[\d,]*)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 5;
}

function getTier(value: number): RarityTier {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (value >= TIERS[i].minValue) return TIERS[i];
  }
  return TIERS[0];
}

function getNextTier(tier: RarityTier): RarityTier | null {
  const idx = TIERS.indexOf(tier);
  return idx < TIERS.length - 1 ? TIERS[idx + 1] : null;
}

function getStats(): CraftingStats {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* fresh stats */ }
  return { totalCrafts: 0, highestTierCrafted: 'common', totalValueCreated: 0, lastCraftDate: '', craftHistory: [] };
}

function saveStats(stats: CraftingStats): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

// ── Seeded random for crafting output ────────────────────────────────────

function seededRandom(seed: number): number {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export default function CraftingBenchClient() {
  const [mounted, setMounted] = useState(false);
  const [vaultCards, setVaultCards] = useState<VaultCard[]>([]);
  const [stats, setStats] = useState<CraftingStats>(getStats());
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [selectedTier, setSelectedTier] = useState<RarityTier | null>(null);
  const [craftedCard, setCraftedCard] = useState<SportsCard | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sportFilter, setSportFilter] = useState<string>('all');

  useEffect(() => {
    setMounted(true);
    setVaultCards(getVaultCards());
    setStats(getStats());
  }, []);

  // Map vault cards to full SportsCard data with tier info
  const vaultWithData = useMemo(() => {
    if (!mounted) return [];
    const cardMap = new Map(sportsCards.map(c => [c.slug, c]));
    return vaultCards
      .map(vc => {
        const full = cardMap.get(vc.slug);
        if (!full) return null;
        const val = parseValue(full.estimatedValueRaw);
        const tier = getTier(val);
        return { vault: vc, card: full, value: val, tier };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [mounted, vaultCards]);

  // Group vault cards by tier
  const cardsByTier = useMemo(() => {
    const groups: Record<string, typeof vaultWithData> = {};
    for (const tier of TIERS) groups[tier.name] = [];
    for (const item of vaultWithData) {
      if (sportFilter !== 'all' && item.card.sport !== sportFilter) continue;
      groups[item.tier.name].push(item);
    }
    return groups;
  }, [vaultWithData, sportFilter]);

  // Eligible tiers (need 3+ cards)
  const eligibleTiers = useMemo(() => {
    return TIERS.filter((t, i) => i < TIERS.length - 1 && (cardsByTier[t.name]?.length ?? 0) >= CARDS_REQUIRED);
  }, [cardsByTier]);

  const handleSelectTier = useCallback((tier: RarityTier) => {
    setSelectedTier(tier);
    setSelectedSlugs([]);
    setCraftedCard(null);
  }, []);

  const handleToggleCard = useCallback((slug: string) => {
    setSelectedSlugs(prev => {
      if (prev.includes(slug)) return prev.filter(s => s !== slug);
      if (prev.length >= CARDS_REQUIRED) return prev;
      return [...prev, slug];
    });
  }, []);

  const handleCraft = useCallback(() => {
    if (!selectedTier || selectedSlugs.length < CARDS_REQUIRED) return;

    const nextTier = getNextTier(selectedTier);
    if (!nextTier) return;

    setIsRevealing(true);

    // Remove the 3 cards from vault
    for (const slug of selectedSlugs) {
      removeFromVault(slug);
    }

    // Pick a random card from the next tier
    const eligibleCards = sportsCards.filter(c => {
      const val = parseValue(c.estimatedValueRaw);
      return val >= nextTier.minValue && val <= nextTier.maxValue;
    });

    const seed = Date.now() + selectedSlugs.reduce((s, slug) => s + slug.charCodeAt(0), 0);
    const idx = Math.floor(seededRandom(seed) * eligibleCards.length);
    const resultCard = eligibleCards[idx] || eligibleCards[0];

    // Add crafted card to vault
    setTimeout(() => {
      const newVaultCard: VaultCard = {
        slug: resultCard.slug,
        acquiredAt: new Date().toISOString(),
        acquiredFrom: 'pack',
        pricePaid: 0,
      };
      addToVault([newVaultCard]);

      // Update stats
      const newStats = { ...getStats() };
      newStats.totalCrafts += 1;
      const resultValue = parseValue(resultCard.estimatedValueRaw);
      newStats.totalValueCreated += resultValue;
      const tierIdx = TIERS.findIndex(t => t.name === nextTier.name);
      const highestIdx = TIERS.findIndex(t => t.name === newStats.highestTierCrafted);
      if (tierIdx > highestIdx) newStats.highestTierCrafted = nextTier.name;
      newStats.lastCraftDate = new Date().toISOString();
      newStats.craftHistory = [
        { date: new Date().toISOString(), inputTier: selectedTier.name, outputCard: resultCard.name, outputValue: resultValue },
        ...newStats.craftHistory.slice(0, 49),
      ];
      saveStats(newStats);

      setCraftedCard(resultCard);
      setStats(newStats);
      setVaultCards(getVaultCards());
      setSelectedSlugs([]);

      setTimeout(() => setIsRevealing(false), 600);
    }, 1500);
  }, [selectedTier, selectedSlugs]);

  const handleReset = useCallback(() => {
    setCraftedCard(null);
    setSelectedTier(null);
    setSelectedSlugs([]);
  }, []);

  if (!mounted) {
    return <div className="text-center py-20 text-gray-400">Loading crafting bench...</div>;
  }

  const currentTierCards = selectedTier ? (cardsByTier[selectedTier.name] ?? []) : [];
  const nextTier = selectedTier ? getNextTier(selectedTier) : null;

  return (
    <div className="space-y-8">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-white">{stats.totalCrafts}</p>
          <p className="text-xs text-gray-400">Total Crafts</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-emerald-400">${stats.totalValueCreated.toLocaleString()}</p>
          <p className="text-xs text-gray-400">Value Created</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 text-center">
          <p className={`text-2xl font-bold ${TIERS.find(t => t.name === stats.highestTierCrafted)?.color ?? 'text-gray-400'}`}>
            {TIERS.find(t => t.name === stats.highestTierCrafted)?.icon ?? '○'} {TIERS.find(t => t.name === stats.highestTierCrafted)?.label ?? 'None'}
          </p>
          <p className="text-xs text-gray-400">Best Craft</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-white">{vaultCards.length}</p>
          <p className="text-xs text-gray-400">Vault Cards</p>
        </div>
      </div>

      {/* Reveal Animation */}
      {isRevealing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center animate-pulse">
            <div className="text-6xl mb-4">🔥</div>
            <p className="text-2xl font-bold text-white">Crafting...</p>
            <p className="text-gray-400">Combining {CARDS_REQUIRED} cards into something better</p>
          </div>
        </div>
      )}

      {/* Crafted Card Result */}
      {craftedCard && !isRevealing && (
        <div className="bg-gradient-to-br from-yellow-950/40 to-amber-900/20 border border-yellow-700/50 rounded-xl p-6 text-center">
          <p className="text-sm text-yellow-400 font-medium mb-2">CRAFTED!</p>
          <div className={`inline-block ${nextTier?.bg ?? ''} ${nextTier?.border ?? ''} border rounded-lg p-4 mb-3`}>
            <p className="text-xs text-gray-400">{SPORT_ICONS[craftedCard.sport] ?? ''} {craftedCard.sport}</p>
            <p className={`text-lg font-bold ${nextTier?.color ?? 'text-white'}`}>{craftedCard.name}</p>
            <p className="text-sm text-gray-300">{craftedCard.player} &middot; {craftedCard.year}</p>
            <p className="text-emerald-400 font-semibold mt-1">{craftedCard.estimatedValueRaw}</p>
            <p className={`text-xs ${nextTier?.color ?? ''} mt-1`}>{nextTier?.icon} {nextTier?.label} Tier</p>
          </div>
          <p className="text-gray-400 text-sm mb-4">Added to your vault</p>
          <div className="flex gap-3 justify-center">
            <button onClick={handleReset} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
              Craft Again
            </button>
            <Link href="/vault" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors">
              View Vault
            </Link>
          </div>
        </div>
      )}

      {/* How It Works */}
      {!selectedTier && !craftedCard && (
        <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-5">
          <h2 className="text-lg font-bold text-white mb-3">How Crafting Works</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl mb-2">3️⃣</div>
              <p className="text-sm text-gray-300 font-medium">Select 3 Cards</p>
              <p className="text-xs text-gray-500">Choose 3 cards of the same rarity tier from your vault</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🔥</div>
              <p className="text-sm text-gray-300 font-medium">Combine</p>
              <p className="text-xs text-gray-500">The 3 cards are consumed and transformed into something better</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">⬆️</div>
              <p className="text-sm text-gray-300 font-medium">Get Upgraded Card</p>
              <p className="text-xs text-gray-500">Receive 1 card from the next tier up. Common becomes Uncommon, etc.</p>
            </div>
          </div>
        </div>
      )}

      {/* Sport Filter */}
      {!craftedCard && (
        <div className="flex gap-2 flex-wrap">
          {['all', 'baseball', 'basketball', 'football', 'hockey'].map(s => (
            <button
              key={s}
              onClick={() => { setSportFilter(s); setSelectedTier(null); setSelectedSlugs([]); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${sportFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
            >
              {s === 'all' ? 'All Sports' : `${SPORT_ICONS[s] ?? ''} ${s.charAt(0).toUpperCase() + s.slice(1)}`}
            </button>
          ))}
        </div>
      )}

      {/* Tier Selection */}
      {!selectedTier && !craftedCard && (
        <div>
          <h2 className="text-lg font-bold text-white mb-3">Choose a Tier to Craft</h2>
          {vaultCards.length === 0 ? (
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-8 text-center">
              <p className="text-gray-400 mb-3">Your vault is empty. Open some packs first!</p>
              <div className="flex gap-3 justify-center">
                <Link href="/packs" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
                  Open Packs
                </Link>
                <Link href="/digital-pack" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors">
                  Daily Free Pack
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {TIERS.slice(0, -1).map(tier => {
                const count = cardsByTier[tier.name]?.length ?? 0;
                const canCraft = count >= CARDS_REQUIRED;
                const next = getNextTier(tier);
                return (
                  <button
                    key={tier.name}
                    onClick={() => canCraft && handleSelectTier(tier)}
                    disabled={!canCraft}
                    className={`${tier.bg} ${tier.border} border rounded-xl p-4 text-left transition-all ${canCraft ? 'hover:scale-[1.02] cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-lg font-bold ${tier.color}`}>{tier.icon} {tier.label}</span>
                      <span className="text-xs text-gray-500">${tier.minValue}{tier.maxValue < Infinity ? `–$${tier.maxValue}` : '+'}</span>
                    </div>
                    <p className="text-sm text-gray-300">{count} cards in vault</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {canCraft
                        ? `Craft → ${next?.icon ?? ''} ${next?.label ?? ''}`
                        : `Need ${CARDS_REQUIRED - count} more`}
                    </p>
                    {canCraft && (
                      <div className="mt-2 text-xs font-medium text-emerald-400">
                        {Math.floor(count / CARDS_REQUIRED)} craft{Math.floor(count / CARDS_REQUIRED) !== 1 ? 's' : ''} available
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Card Selection */}
      {selectedTier && !craftedCard && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-white">
                Select {CARDS_REQUIRED} {selectedTier.icon} {selectedTier.label} Cards
              </h2>
              <p className="text-sm text-gray-400">
                {selectedSlugs.length}/{CARDS_REQUIRED} selected &middot; Crafting into {nextTier?.icon} {nextTier?.label}
              </p>
            </div>
            <button onClick={() => { setSelectedTier(null); setSelectedSlugs([]); }} className="text-sm text-gray-400 hover:text-white transition-colors">
              Back
            </button>
          </div>

          {/* Selection progress bar */}
          <div className="flex gap-2 mb-4">
            {Array.from({ length: CARDS_REQUIRED }).map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-colors ${i < selectedSlugs.length ? 'bg-emerald-500' : 'bg-gray-700'}`}
              />
            ))}
          </div>

          {/* Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto">
            {currentTierCards.map(item => {
              const isSelected = selectedSlugs.includes(item.vault.slug);
              return (
                <button
                  key={item.vault.slug + item.vault.acquiredAt}
                  onClick={() => handleToggleCard(item.vault.slug)}
                  disabled={!isSelected && selectedSlugs.length >= CARDS_REQUIRED}
                  className={`text-left p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-600/60 ring-1 ring-emerald-500/30'
                      : selectedSlugs.length >= CARDS_REQUIRED
                        ? 'bg-gray-800/30 border-gray-700/30 opacity-40 cursor-not-allowed'
                        : 'bg-gray-800/30 border-gray-700/50 hover:border-gray-500/50 cursor-pointer'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{item.card.name}</p>
                      <p className="text-xs text-gray-400">{item.card.player} &middot; {item.card.year}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs ${SPORT_COLORS[item.card.sport] ?? 'text-gray-400'}`}>
                          {SPORT_ICONS[item.card.sport] ?? ''} {item.card.sport}
                        </span>
                        <span className="text-xs text-emerald-400">{item.card.estimatedValueRaw}</span>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${isSelected ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                      {isSelected ? '✓' : ''}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Craft Button */}
          <div className="mt-4 text-center">
            <button
              onClick={handleCraft}
              disabled={selectedSlugs.length < CARDS_REQUIRED}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                selectedSlugs.length >= CARDS_REQUIRED
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-900/30 cursor-pointer'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {selectedSlugs.length >= CARDS_REQUIRED
                ? `🔥 Craft into ${nextTier?.icon ?? ''} ${nextTier?.label ?? ''}`
                : `Select ${CARDS_REQUIRED - selectedSlugs.length} more card${CARDS_REQUIRED - selectedSlugs.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      )}

      {/* Crafting Recipes Overview */}
      {!selectedTier && !craftedCard && (
        <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-5">
          <h2 className="text-lg font-bold text-white mb-3">Crafting Recipes</h2>
          <div className="space-y-2">
            {TIERS.slice(0, -1).map(tier => {
              const next = getNextTier(tier);
              return (
                <div key={tier.name} className="flex items-center gap-3 text-sm">
                  <span className={tier.color}>{tier.icon} {tier.label} x3</span>
                  <span className="text-gray-600">→</span>
                  <span className={next?.color ?? ''}>{next?.icon} {next?.label} x1</span>
                  <span className="text-xs text-gray-500 ml-auto">${tier.minValue}{tier.maxValue < Infinity ? `–$${tier.maxValue}` : '+'} → ${next?.minValue}{next && next.maxValue < Infinity ? `–$${next.maxValue}` : '+'}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Craft History */}
      <div>
        <button onClick={() => setShowHistory(!showHistory)} className="text-sm text-gray-400 hover:text-white transition-colors">
          {showHistory ? 'Hide' : 'Show'} Craft History ({stats.craftHistory.length})
        </button>
        {showHistory && stats.craftHistory.length > 0 && (
          <div className="mt-3 space-y-2 max-h-[300px] overflow-y-auto">
            {stats.craftHistory.map((entry, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-800/30 border border-gray-700/30 rounded-lg p-3 text-sm">
                <div>
                  <p className="text-white">{entry.outputCard}</p>
                  <p className="text-xs text-gray-500">{new Date(entry.date).toLocaleDateString()} &middot; from {entry.inputTier} tier</p>
                </div>
                <span className="text-emerald-400 font-medium">${entry.outputValue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
        {showHistory && stats.craftHistory.length === 0 && (
          <p className="mt-3 text-sm text-gray-500">No crafts yet. Start combining cards!</p>
        )}
      </div>

      {/* Related Links */}
      <div className="border-t border-gray-800 pt-6">
        <h2 className="text-lg font-bold text-white mb-3">Related Features</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <Link href="/packs" className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3 hover:border-gray-500/50 transition-colors">
            <p className="text-sm font-medium text-white">Pack Store</p>
            <p className="text-xs text-gray-400">Open packs to get cards for crafting</p>
          </Link>
          <Link href="/vault" className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3 hover:border-gray-500/50 transition-colors">
            <p className="text-sm font-medium text-white">My Vault</p>
            <p className="text-xs text-gray-400">View your full card collection</p>
          </Link>
          <Link href="/trade-hub" className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3 hover:border-gray-500/50 transition-colors">
            <p className="text-sm font-medium text-white">Trade Hub</p>
            <p className="text-xs text-gray-400">Trade cards with other collectors</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

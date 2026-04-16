'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ── helpers ─────────────────────────────────────────────────────── */

function parseValue(raw: string): number {
  const m = raw.match(/\$(\d[\d,]*)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function fmt(n: number): string {
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n}`;
}

/* ── types ───────────────────────────────────────────────────────── */

type BundleType = 'team' | 'player' | 'sport' | 'era' | 'custom';

interface BundleCard {
  slug: string;
  name: string;
  player: string;
  sport: string;
  year: number;
  value: number;
  rookie: boolean;
}

interface SavedBundle {
  id: string;
  name: string;
  type: BundleType;
  cards: BundleCard[];
  discount: number;
  createdAt: string;
}

/* ── constants ───────────────────────────────────────────────────── */

const BUNDLE_TYPES: { value: BundleType; label: string; icon: string; desc: string }[] = [
  { value: 'team', label: 'Team Lot', icon: '🏟️', desc: 'Cards from the same team' },
  { value: 'player', label: 'Player Bundle', icon: '⭐', desc: 'Multiple cards of one player' },
  { value: 'sport', label: 'Sport Bundle', icon: '🏅', desc: 'Mixed cards from one sport' },
  { value: 'era', label: 'Era Bundle', icon: '📅', desc: 'Cards from a specific decade' },
  { value: 'custom', label: 'Custom Lot', icon: '🎨', desc: 'Any mix of cards you want' },
];

const SPORT_COLORS: Record<string, string> = {
  baseball: 'text-red-400 border-red-800/50 bg-red-950/30',
  basketball: 'text-orange-400 border-orange-800/50 bg-orange-950/30',
  football: 'text-green-400 border-green-800/50 bg-green-950/30',
  hockey: 'text-blue-400 border-blue-800/50 bg-blue-950/30',
};

const SPORT_DOTS: Record<string, string> = {
  baseball: 'bg-red-400',
  basketball: 'bg-orange-400',
  football: 'bg-green-400',
  hockey: 'bg-blue-400',
};

const PLATFORMS = [
  { name: 'eBay', fee: 0.13, desc: '13% final value fee' },
  { name: 'Mercari', fee: 0.10, desc: '10% seller fee' },
  { name: 'COMC', fee: 0.20, desc: '20% commission' },
  { name: 'MySlabs', fee: 0.08, desc: '8% seller fee' },
  { name: 'Card Show', fee: 0.00, desc: 'No fees (in person)' },
];

/* ── component ───────────────────────────────────────────────────── */

export default function BundleCreatorClient() {
  const [bundleType, setBundleType] = useState<BundleType>('custom');
  const [bundleName, setBundleName] = useState('');
  const [bundleCards, setBundleCards] = useState<BundleCard[]>([]);
  const [discount, setDiscount] = useState(15);
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [savedBundles, setSavedBundles] = useState<SavedBundle[]>([]);
  const [showListing, setShowListing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  // Load saved bundles from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('cv-bundles');
      if (raw) setSavedBundles(JSON.parse(raw));
    } catch { /* noop */ }
  }, []);

  // All cards with parsed values
  const allCards = useMemo(() => {
    return sportsCards.map(c => ({
      slug: c.slug,
      name: c.name,
      player: c.player,
      sport: c.sport,
      year: c.year,
      value: parseValue(c.estimatedValueRaw),
      rookie: !!c.rookie,
    })).filter(c => c.value > 0);
  }, []);

  // Search results
  const searchResults = useMemo(() => {
    if (!search || search.length < 2) return [];
    const q = search.toLowerCase();
    const inBundle = new Set(bundleCards.map(c => c.slug));
    return allCards
      .filter(c => {
        if (inBundle.has(c.slug)) return false;
        if (sportFilter !== 'all' && c.sport !== sportFilter) return false;
        return c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q);
      })
      .slice(0, 20);
  }, [search, sportFilter, allCards, bundleCards]);

  // Bundle calculations
  const totalValue = bundleCards.reduce((s, c) => s + c.value, 0);
  const bundlePrice = Math.round(totalValue * (1 - discount / 100));
  const savings = totalValue - bundlePrice;
  const avgValue = bundleCards.length > 0 ? Math.round(totalValue / bundleCards.length) : 0;
  const rookieCount = bundleCards.filter(c => c.rookie).length;
  const sports = [...new Set(bundleCards.map(c => c.sport))];
  const players = [...new Set(bundleCards.map(c => c.player))];

  const addCard = useCallback((card: BundleCard) => {
    setBundleCards(prev => [...prev, card]);
    setSearch('');
  }, []);

  const removeCard = useCallback((slug: string) => {
    setBundleCards(prev => prev.filter(c => c.slug !== slug));
  }, []);

  const saveBundle = useCallback(() => {
    const bundle: SavedBundle = {
      id: Date.now().toString(36),
      name: bundleName || `${BUNDLE_TYPES.find(t => t.value === bundleType)?.label} — ${bundleCards.length} cards`,
      type: bundleType,
      cards: bundleCards,
      discount,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = [bundle, ...savedBundles].slice(0, 20);
    setSavedBundles(updated);
    localStorage.setItem('cv-bundles', JSON.stringify(updated));
  }, [bundleName, bundleType, bundleCards, discount, savedBundles]);

  const loadBundle = useCallback((b: SavedBundle) => {
    setBundleName(b.name);
    setBundleType(b.type);
    setBundleCards(b.cards);
    setDiscount(b.discount);
    setShowSaved(false);
  }, []);

  const deleteBundle = useCallback((id: string) => {
    const updated = savedBundles.filter(b => b.id !== id);
    setSavedBundles(updated);
    localStorage.setItem('cv-bundles', JSON.stringify(updated));
  }, [savedBundles]);

  const clearBundle = useCallback(() => {
    setBundleCards([]);
    setBundleName('');
    setShowListing(false);
  }, []);

  // Generate listing copy
  const listingTitle = useMemo(() => {
    if (bundleCards.length === 0) return '';
    const sportLabel = sports.length === 1 ? sports[0].charAt(0).toUpperCase() + sports[0].slice(1) : 'Sports';
    const playerLabel = players.length === 1 ? players[0] : `${bundleCards.length}-Card`;
    const rookieTag = rookieCount > 0 ? ` ${rookieCount} RC` : '';
    return `${playerLabel} ${sportLabel} Card Lot (${bundleCards.length} Cards${rookieTag}) — ${fmt(bundlePrice)}`;
  }, [bundleCards, sports, players, rookieCount, bundlePrice]);

  const listingBody = useMemo(() => {
    if (bundleCards.length === 0) return '';
    const lines = [
      `${bundleCards.length}-Card Bundle — ${discount}% Off Individual Prices`,
      '',
      `Bundle Price: ${fmt(bundlePrice)} (Individual Value: ${fmt(totalValue)}, You Save: ${fmt(savings)})`,
      '',
      'Cards Included:',
      ...bundleCards.map((c, i) => `${i + 1}. ${c.name} — ${fmt(c.value)}${c.rookie ? ' (RC)' : ''}`),
      '',
      `Sports: ${sports.join(', ')}`,
      `Players: ${players.length}`,
      `Rookies: ${rookieCount}`,
      '',
      'All cards shipped in penny sleeves and top loaders.',
      'Bundle lots ship in a bubble mailer or small box depending on quantity.',
      '',
      `Values sourced from CardVault (cardvault-two.vercel.app)`,
    ];
    return lines.join('\n');
  }, [bundleCards, discount, bundlePrice, totalValue, savings, sports, players, rookieCount]);

  const copyListing = useCallback(() => {
    navigator.clipboard.writeText(`${listingTitle}\n\n${listingBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [listingTitle, listingBody]);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Card Bundle Creator</h1>
        <p className="text-gray-400 text-lg">
          Build card lots and bundles for selling. Search 8,100+ cards, set a discount, generate listing copy.
        </p>
      </div>

      {/* Bundle Type Selection */}
      <div className="mb-6">
        <label className="text-sm text-gray-400 mb-2 block">Bundle Type</label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {BUNDLE_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => setBundleType(t.value)}
              className={`px-3 py-2 rounded-lg border text-left transition-colors ${
                bundleType === t.value
                  ? 'border-emerald-500 bg-emerald-950/40 text-white'
                  : 'border-gray-700 bg-gray-900/40 text-gray-400 hover:border-gray-500'
              }`}
            >
              <div className="text-lg">{t.icon}</div>
              <div className="text-xs font-medium mt-1">{t.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Bundle Name */}
      <div className="mb-6">
        <label className="text-sm text-gray-400 mb-2 block">Bundle Name (optional)</label>
        <input
          type="text"
          value={bundleName}
          onChange={e => setBundleName(e.target.value)}
          placeholder="e.g., 2024 Yankees Rookie Lot"
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
        />
      </div>

      {/* Search + Add Cards */}
      <div className="mb-6">
        <label className="text-sm text-gray-400 mb-2 block">Add Cards to Bundle</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by player name or card name..."
            className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
          />
          <select
            value={sportFilter}
            onChange={e => setSportFilter(e.target.value)}
            className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">All Sports</option>
            <option value="baseball">Baseball</option>
            <option value="basketball">Basketball</option>
            <option value="football">Football</option>
            <option value="hockey">Hockey</option>
          </select>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="border border-gray-700 rounded-lg bg-gray-900/80 max-h-64 overflow-y-auto">
            {searchResults.map(c => (
              <button
                key={c.slug}
                onClick={() => addCard(c)}
                className="w-full text-left px-4 py-2 hover:bg-gray-800 border-b border-gray-800 last:border-0 transition-colors flex items-center justify-between gap-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm truncate">{c.name}</div>
                  <div className="text-gray-500 text-xs">{c.player} &middot; {c.year} &middot; {c.sport}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-emerald-400 text-sm font-medium">{fmt(c.value)}</span>
                  {c.rookie && <span className="text-[10px] bg-amber-900/50 text-amber-400 px-1 rounded">RC</span>}
                  <span className="text-gray-600 text-lg">+</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bundle Cards List */}
      {bundleCards.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-400">Bundle Cards ({bundleCards.length})</label>
            <button onClick={clearBundle} className="text-xs text-red-400 hover:text-red-300">Clear All</button>
          </div>
          <div className="border border-gray-700 rounded-lg bg-gray-900/40 divide-y divide-gray-800 max-h-80 overflow-y-auto">
            {bundleCards.map((c, i) => (
              <div key={c.slug + i} className="px-4 py-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-gray-600 text-xs w-5 shrink-0">{i + 1}.</span>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${SPORT_DOTS[c.sport] || 'bg-gray-500'}`} />
                  <div className="min-w-0">
                    <Link href={`/cards/${c.slug}`} className="text-white text-sm hover:text-emerald-400 truncate block">{c.name}</Link>
                    <div className="text-gray-500 text-xs">{c.player} &middot; {c.year}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {c.rookie && <span className="text-[10px] bg-amber-900/50 text-amber-400 px-1 rounded">RC</span>}
                  <span className="text-emerald-400 text-sm font-medium">{fmt(c.value)}</span>
                  <button onClick={() => removeCard(c.slug)} className="text-gray-600 hover:text-red-400 transition-colors">&times;</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Discount Slider */}
      {bundleCards.length > 0 && (
        <div className="mb-8">
          <label className="text-sm text-gray-400 mb-2 block">Bundle Discount: <span className="text-white font-bold">{discount}%</span></label>
          <input
            type="range"
            min={5}
            max={30}
            value={discount}
            onChange={e => setDiscount(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>5% (Premium)</span>
            <span>15% (Standard)</span>
            <span>30% (Clearance)</span>
          </div>
        </div>
      )}

      {/* Bundle Summary */}
      {bundleCards.length > 0 && (
        <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">Bundle Summary</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div>
              <div className="text-gray-500 text-xs uppercase">Individual Value</div>
              <div className="text-white text-xl font-bold">{fmt(totalValue)}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs uppercase">Bundle Price</div>
              <div className="text-emerald-400 text-xl font-bold">{fmt(bundlePrice)}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs uppercase">Buyer Saves</div>
              <div className="text-amber-400 text-xl font-bold">{fmt(savings)}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs uppercase">Avg / Card</div>
              <div className="text-white text-xl font-bold">{fmt(avgValue)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-sm">
            <div>
              <span className="text-gray-500">Cards:</span>{' '}
              <span className="text-white">{bundleCards.length}</span>
            </div>
            <div>
              <span className="text-gray-500">Rookies:</span>{' '}
              <span className="text-amber-400">{rookieCount}</span>
            </div>
            <div>
              <span className="text-gray-500">Players:</span>{' '}
              <span className="text-white">{players.length}</span>
            </div>
            <div>
              <span className="text-gray-500">Sports:</span>{' '}
              <span className="text-white">{sports.join(', ')}</span>
            </div>
          </div>

          {/* Platform Profit Breakdown */}
          <h3 className="text-sm font-bold text-gray-300 mb-2">Net Profit by Platform</h3>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mb-6">
            {PLATFORMS.map(p => {
              const net = Math.round(bundlePrice * (1 - p.fee));
              return (
                <div key={p.name} className="bg-gray-800/50 rounded-lg px-3 py-2 text-center">
                  <div className="text-white text-sm font-medium">{p.name}</div>
                  <div className="text-emerald-400 font-bold">{fmt(net)}</div>
                  <div className="text-gray-500 text-[10px]">{p.desc}</div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowListing(!showListing)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors text-sm"
            >
              {showListing ? 'Hide' : 'Generate'} Listing Copy
            </button>
            <button
              onClick={saveBundle}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors text-sm"
            >
              Save Bundle
            </button>
            <button
              onClick={() => setShowSaved(!showSaved)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors text-sm"
            >
              {showSaved ? 'Hide' : 'Load'} Saved ({savedBundles.length})
            </button>
          </div>
        </div>
      )}

      {/* Listing Copy */}
      {showListing && bundleCards.length > 0 && (
        <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Listing Copy</h2>
            <button
              onClick={copyListing}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                copied ? 'bg-emerald-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-1">Title</div>
            <div className="bg-gray-800 rounded-lg px-4 py-2 text-white text-sm font-medium">{listingTitle}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Description</div>
            <pre className="bg-gray-800 rounded-lg px-4 py-3 text-gray-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">{listingBody}</pre>
          </div>
        </div>
      )}

      {/* Saved Bundles */}
      {showSaved && (
        <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">Saved Bundles</h2>
          {savedBundles.length === 0 ? (
            <p className="text-gray-500 text-sm">No saved bundles yet. Build one above and click Save.</p>
          ) : (
            <div className="space-y-2">
              {savedBundles.map(b => (
                <div key={b.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg px-4 py-3">
                  <div>
                    <div className="text-white text-sm font-medium">{b.name}</div>
                    <div className="text-gray-500 text-xs">
                      {b.cards.length} cards &middot; {b.discount}% off &middot; {b.createdAt}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => loadBundle(b)} className="text-xs text-emerald-400 hover:text-emerald-300">Load</button>
                    <button onClick={() => deleteBundle(b.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {bundleCards.length === 0 && (
        <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-8 text-center mb-6">
          <div className="text-4xl mb-3">📦</div>
          <h2 className="text-lg font-bold text-white mb-2">Start Building Your Bundle</h2>
          <p className="text-gray-400 text-sm mb-4 max-w-md mx-auto">
            Search for cards above and click to add them. Build team lots, player bundles,
            or any custom mix. Set your discount and generate listing copy for eBay or Mercari.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-left">
            <div className="bg-gray-800/50 rounded-lg px-3 py-2">
              <div className="text-emerald-400 text-sm font-medium">Team Lots</div>
              <div className="text-gray-500 text-xs">All Yankees, all Lakers</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg px-3 py-2">
              <div className="text-emerald-400 text-sm font-medium">Player Sets</div>
              <div className="text-gray-500 text-xs">Every Ohtani card</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg px-3 py-2">
              <div className="text-emerald-400 text-sm font-medium">Rookie Lots</div>
              <div className="text-gray-500 text-xs">2024 RC mega-bundle</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg px-3 py-2">
              <div className="text-emerald-400 text-sm font-medium">Era Packs</div>
              <div className="text-gray-500 text-xs">90s nostalgia lot</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg px-3 py-2">
              <div className="text-emerald-400 text-sm font-medium">Value Lots</div>
              <div className="text-gray-500 text-xs">Under $10 deals</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg px-3 py-2">
              <div className="text-emerald-400 text-sm font-medium">Custom Mix</div>
              <div className="text-gray-500 text-xs">Whatever sells</div>
            </div>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">How to Create a Selling Bundle</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-emerald-400 font-bold text-lg mb-1">1. Search</div>
            <p className="text-gray-400 text-sm">Find cards by player name. Filter by sport. Add them to your bundle.</p>
          </div>
          <div>
            <div className="text-emerald-400 font-bold text-lg mb-1">2. Bundle</div>
            <p className="text-gray-400 text-sm">Choose a theme — team lot, player set, era pack, or any custom mix.</p>
          </div>
          <div>
            <div className="text-emerald-400 font-bold text-lg mb-1">3. Price</div>
            <p className="text-gray-400 text-sm">Set your discount (5-30%). See the bundle price and platform profits.</p>
          </div>
          <div>
            <div className="text-emerald-400 font-bold text-lg mb-1">4. List</div>
            <p className="text-gray-400 text-sm">Generate a listing title and description. Copy and paste to eBay or Mercari.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

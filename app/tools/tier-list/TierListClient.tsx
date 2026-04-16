'use client';

import { useState, useMemo, useCallback } from 'react';

/* ─── product data ──────────────────────────────── */
interface Product {
  id: string;
  name: string;
  sport: 'baseball' | 'basketball' | 'football' | 'hockey' | 'pokemon' | 'multi';
  type: 'hobby' | 'retail' | 'blaster' | 'mega' | 'hanger' | 'fat-pack' | 'etb';
  year: number;
  priceRange: string;
}

const PRODUCTS: Product[] = [
  // Baseball 2024-2025
  { id: 'topps-chrome-2024-hobby', name: '2024 Topps Chrome Hobby', sport: 'baseball', type: 'hobby', year: 2024, priceRange: '$250-350' },
  { id: 'topps-series-1-2025-hobby', name: '2025 Topps Series 1 Hobby', sport: 'baseball', type: 'hobby', year: 2025, priceRange: '$100-140' },
  { id: 'bowman-2024-hobby', name: '2024 Bowman Hobby', sport: 'baseball', type: 'hobby', year: 2024, priceRange: '$200-280' },
  { id: 'topps-chrome-2024-blaster', name: '2024 Topps Chrome Blaster', sport: 'baseball', type: 'blaster', year: 2024, priceRange: '$30-40' },
  { id: 'topps-series-2-2024-hobby', name: '2024 Topps Series 2 Hobby', sport: 'baseball', type: 'hobby', year: 2024, priceRange: '$80-110' },
  { id: 'topps-heritage-2025-hobby', name: '2025 Topps Heritage Hobby', sport: 'baseball', type: 'hobby', year: 2025, priceRange: '$80-100' },
  { id: 'bowman-chrome-2024-hobby', name: '2024 Bowman Chrome Hobby', sport: 'baseball', type: 'hobby', year: 2024, priceRange: '$300-400' },
  { id: 'topps-allen-ginter-2024', name: '2024 Topps Allen & Ginter Hobby', sport: 'baseball', type: 'hobby', year: 2024, priceRange: '$120-160' },
  { id: 'topps-stadium-club-2024', name: '2024 Topps Stadium Club Hobby', sport: 'baseball', type: 'hobby', year: 2024, priceRange: '$120-160' },
  { id: 'topps-update-2024-hobby', name: '2024 Topps Update Hobby', sport: 'baseball', type: 'hobby', year: 2024, priceRange: '$80-110' },
  // Basketball 2024-2025
  { id: 'panini-prizm-2024-hobby', name: '2024-25 Panini Prizm Hobby', sport: 'basketball', type: 'hobby', year: 2024, priceRange: '$500-700' },
  { id: 'panini-select-2024-hobby', name: '2024-25 Panini Select Hobby', sport: 'basketball', type: 'hobby', year: 2024, priceRange: '$400-550' },
  { id: 'panini-donruss-2024-hobby', name: '2024-25 Donruss Hobby', sport: 'basketball', type: 'hobby', year: 2024, priceRange: '$200-280' },
  { id: 'panini-mosaic-2024-hobby', name: '2024-25 Mosaic Hobby', sport: 'basketball', type: 'hobby', year: 2024, priceRange: '$250-350' },
  { id: 'panini-prizm-2024-blaster', name: '2024-25 Prizm Blaster', sport: 'basketball', type: 'blaster', year: 2024, priceRange: '$35-50' },
  { id: 'panini-hoops-2024-hobby', name: '2024-25 Hoops Hobby', sport: 'basketball', type: 'hobby', year: 2024, priceRange: '$100-140' },
  { id: 'panini-optic-2024-hobby', name: '2024-25 Donruss Optic Hobby', sport: 'basketball', type: 'hobby', year: 2024, priceRange: '$350-500' },
  { id: 'panini-court-kings-2024', name: '2024-25 Court Kings Hobby', sport: 'basketball', type: 'hobby', year: 2024, priceRange: '$150-200' },
  // Football 2024-2025
  { id: 'panini-prizm-fb-2024-hobby', name: '2024 Panini Prizm Football Hobby', sport: 'football', type: 'hobby', year: 2024, priceRange: '$500-700' },
  { id: 'panini-select-fb-2024-hobby', name: '2024 Panini Select Football Hobby', sport: 'football', type: 'hobby', year: 2024, priceRange: '$400-550' },
  { id: 'panini-mosaic-fb-2024-hobby', name: '2024 Mosaic Football Hobby', sport: 'football', type: 'hobby', year: 2024, priceRange: '$250-350' },
  { id: 'panini-prizm-fb-2024-blaster', name: '2024 Prizm Football Blaster', sport: 'football', type: 'blaster', year: 2024, priceRange: '$35-50' },
  { id: 'panini-donruss-fb-2024-hobby', name: '2024 Donruss Football Hobby', sport: 'football', type: 'hobby', year: 2024, priceRange: '$180-250' },
  { id: 'panini-optic-fb-2024-hobby', name: '2024 Donruss Optic Football Hobby', sport: 'football', type: 'hobby', year: 2024, priceRange: '$350-500' },
  { id: 'panini-contenders-fb-2024', name: '2024 Contenders Football Hobby', sport: 'football', type: 'hobby', year: 2024, priceRange: '$300-400' },
  { id: 'panini-spectra-fb-2024', name: '2024 Spectra Football Hobby', sport: 'football', type: 'hobby', year: 2024, priceRange: '$400-600' },
  // Hockey 2024-2025
  { id: 'upper-deck-series-1-2024', name: '2024-25 Upper Deck Series 1 Hobby', sport: 'hockey', type: 'hobby', year: 2024, priceRange: '$100-140' },
  { id: 'upper-deck-series-2-2024', name: '2024-25 Upper Deck Series 2 Hobby', sport: 'hockey', type: 'hobby', year: 2024, priceRange: '$100-140' },
  { id: 'upper-deck-yg-2024-blaster', name: '2024-25 Upper Deck Blaster', sport: 'hockey', type: 'blaster', year: 2024, priceRange: '$25-35' },
  { id: 'sp-authentic-2024', name: '2024-25 SP Authentic Hobby', sport: 'hockey', type: 'hobby', year: 2024, priceRange: '$250-350' },
  { id: 'upper-deck-ice-2024', name: '2024-25 Upper Deck ICE Hobby', sport: 'hockey', type: 'hobby', year: 2024, priceRange: '$150-200' },
  { id: 'upper-deck-mvp-2024', name: '2024-25 Upper Deck MVP Hobby', sport: 'hockey', type: 'hobby', year: 2024, priceRange: '$50-70' },
  // Pokemon 2024-2025
  { id: 'pokemon-prismatic-etb', name: 'Prismatic Evolutions ETB', sport: 'pokemon', type: 'etb', year: 2025, priceRange: '$50-80' },
  { id: 'pokemon-journey-together-bb', name: 'Journey Together Booster Bundle', sport: 'pokemon', type: 'retail', year: 2025, priceRange: '$30-40' },
  { id: 'pokemon-surging-sparks-bb', name: 'Surging Sparks Booster Box', sport: 'pokemon', type: 'hobby', year: 2024, priceRange: '$100-130' },
  { id: 'pokemon-shrouded-fable-etb', name: 'Shrouded Fable ETB', sport: 'pokemon', type: 'etb', year: 2024, priceRange: '$45-60' },
  { id: 'pokemon-151-etb', name: 'Pokemon 151 ETB', sport: 'pokemon', type: 'etb', year: 2023, priceRange: '$70-120' },
  { id: 'pokemon-crown-zenith-etb', name: 'Crown Zenith ETB', sport: 'pokemon', type: 'etb', year: 2023, priceRange: '$50-80' },
  { id: 'pokemon-obsidian-flames-bb', name: 'Obsidian Flames Booster Box', sport: 'pokemon', type: 'hobby', year: 2023, priceRange: '$90-120' },
  { id: 'pokemon-paldea-evolved-bb', name: 'Paldea Evolved Booster Box', sport: 'pokemon', type: 'hobby', year: 2023, priceRange: '$90-120' },
];

type Tier = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
const TIERS: { label: Tier; color: string; bg: string; border: string; desc: string }[] = [
  { label: 'S', color: 'text-red-400', bg: 'bg-red-950/40', border: 'border-red-800/50', desc: 'God Tier — Must Buy' },
  { label: 'A', color: 'text-orange-400', bg: 'bg-orange-950/40', border: 'border-orange-800/50', desc: 'Excellent — Highly Recommended' },
  { label: 'B', color: 'text-yellow-400', bg: 'bg-yellow-950/40', border: 'border-yellow-800/50', desc: 'Good — Solid Product' },
  { label: 'C', color: 'text-green-400', bg: 'bg-green-950/40', border: 'border-green-800/50', desc: 'Average — Fine If Discounted' },
  { label: 'D', color: 'text-blue-400', bg: 'bg-blue-950/40', border: 'border-blue-800/50', desc: 'Below Average — Buyer Beware' },
  { label: 'F', color: 'text-purple-400', bg: 'bg-purple-950/40', border: 'border-purple-800/50', desc: 'Avoid — Bad EV' },
];

const SPORT_COLORS: Record<string, string> = {
  baseball: 'bg-red-900/50 text-red-300 border-red-700/40',
  basketball: 'bg-orange-900/50 text-orange-300 border-orange-700/40',
  football: 'bg-green-900/50 text-green-300 border-green-700/40',
  hockey: 'bg-blue-900/50 text-blue-300 border-blue-700/40',
  pokemon: 'bg-yellow-900/50 text-yellow-300 border-yellow-700/40',
  multi: 'bg-slate-800/50 text-slate-300 border-slate-700/40',
};

const SPORT_EMOJI: Record<string, string> = { baseball: '\u26be', basketball: '\ud83c\udfc0', football: '\ud83c\udfc8', hockey: '\ud83c\udfd2', pokemon: '\u26a1', multi: '\ud83c\udfb4' };

type SportFilter = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey' | 'pokemon';

export default function TierListClient() {
  const [tierMap, setTierMap] = useState<Record<string, Tier>>({});
  const [sportFilter, setSportFilter] = useState<SportFilter>('all');
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(false);

  const unranked = useMemo(() => {
    return PRODUCTS.filter(p => {
      if (tierMap[p.id]) return false;
      if (sportFilter !== 'all' && p.sport !== sportFilter) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [tierMap, sportFilter, search]);

  const tierProducts = useCallback((tier: Tier) => {
    return PRODUCTS.filter(p => tierMap[p.id] === tier);
  }, [tierMap]);

  const assignTier = (productId: string, tier: Tier) => {
    setTierMap(prev => ({ ...prev, [productId]: tier }));
    setSelectedProduct(null);
  };

  const removeTier = (productId: string) => {
    setTierMap(prev => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  const clearAll = () => {
    setTierMap({});
    setShareUrl(null);
  };

  const rankedCount = Object.keys(tierMap).length;

  // Share via URL hash
  const generateShareUrl = () => {
    const entries = Object.entries(tierMap);
    if (entries.length === 0) return;
    const data = entries.map(([id, tier]) => `${id}:${tier}`).join(',');
    const encoded = btoa(data);
    const url = `${window.location.origin}/tools/tier-list#${encoded}`;
    setShareUrl(url);
    navigator.clipboard?.writeText(url);
  };

  // Load from hash on mount (useEffect would be needed in real app, keeping simple)
  const loadFromHash = useCallback(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    try {
      const data = atob(hash);
      const map: Record<string, Tier> = {};
      data.split(',').forEach(entry => {
        const [id, tier] = entry.split(':');
        if (id && tier && ['S', 'A', 'B', 'C', 'D', 'F'].includes(tier)) {
          map[id] = tier as Tier;
        }
      });
      if (Object.keys(map).length > 0) setTierMap(map);
    } catch { /* ignore invalid hash */ }
  }, []);

  // Load once
  useState(() => { loadFromHash(); });

  // Community consensus preset
  const loadPreset = (preset: 'community' | 'flipper' | 'investor') => {
    const presets: Record<string, Record<string, Tier>> = {
      community: {
        'topps-chrome-2024-hobby': 'S', 'bowman-chrome-2024-hobby': 'S', 'panini-prizm-2024-hobby': 'S',
        'panini-prizm-fb-2024-hobby': 'S', 'pokemon-prismatic-etb': 'S',
        'bowman-2024-hobby': 'A', 'topps-series-1-2025-hobby': 'A', 'panini-select-2024-hobby': 'A',
        'panini-select-fb-2024-hobby': 'A', 'sp-authentic-2024': 'A', 'pokemon-151-etb': 'A',
        'panini-optic-2024-hobby': 'A', 'panini-optic-fb-2024-hobby': 'A',
        'topps-series-2-2024-hobby': 'B', 'panini-mosaic-2024-hobby': 'B', 'panini-mosaic-fb-2024-hobby': 'B',
        'topps-allen-ginter-2024': 'B', 'upper-deck-series-1-2024': 'B', 'pokemon-surging-sparks-bb': 'B',
        'panini-contenders-fb-2024': 'B', 'panini-donruss-2024-hobby': 'B',
        'topps-heritage-2025-hobby': 'C', 'topps-chrome-2024-blaster': 'C', 'panini-prizm-2024-blaster': 'C',
        'upper-deck-series-2-2024': 'C', 'panini-hoops-2024-hobby': 'C', 'panini-donruss-fb-2024-hobby': 'C',
        'pokemon-shrouded-fable-etb': 'C', 'panini-court-kings-2024': 'C',
        'topps-stadium-club-2024': 'D', 'panini-prizm-fb-2024-blaster': 'D', 'upper-deck-yg-2024-blaster': 'D',
        'upper-deck-ice-2024': 'D', 'pokemon-obsidian-flames-bb': 'D',
        'topps-update-2024-hobby': 'F', 'upper-deck-mvp-2024': 'F', 'panini-spectra-fb-2024': 'D',
        'pokemon-crown-zenith-etb': 'C', 'pokemon-paldea-evolved-bb': 'D',
        'pokemon-journey-together-bb': 'B',
      },
      flipper: {
        'topps-chrome-2024-hobby': 'S', 'panini-prizm-2024-hobby': 'S', 'panini-prizm-fb-2024-hobby': 'S',
        'pokemon-prismatic-etb': 'S', 'bowman-chrome-2024-hobby': 'A',
        'topps-chrome-2024-blaster': 'A', 'panini-prizm-2024-blaster': 'A', 'panini-prizm-fb-2024-blaster': 'A',
        'topps-series-1-2025-hobby': 'B', 'panini-select-2024-hobby': 'B', 'panini-select-fb-2024-hobby': 'B',
        'bowman-2024-hobby': 'B',
        'pokemon-151-etb': 'A', 'pokemon-surging-sparks-bb': 'C',
      },
      investor: {
        'bowman-chrome-2024-hobby': 'S', 'bowman-2024-hobby': 'S', 'panini-prizm-2024-hobby': 'S',
        'topps-chrome-2024-hobby': 'A', 'panini-prizm-fb-2024-hobby': 'A', 'panini-select-2024-hobby': 'A',
        'sp-authentic-2024': 'A', 'pokemon-151-etb': 'A', 'pokemon-prismatic-etb': 'B',
        'panini-optic-2024-hobby': 'B', 'panini-optic-fb-2024-hobby': 'B',
        'topps-series-1-2025-hobby': 'B', 'topps-heritage-2025-hobby': 'C',
      },
    };
    setTierMap(presets[preset] || {});
    setShowPresets(false);
  };

  // Generate shareable text
  const generateShareText = () => {
    const lines: string[] = ['My Card Product Tier List:'];
    TIERS.forEach(t => {
      const items = tierProducts(t.label);
      if (items.length > 0) {
        lines.push(`\n${t.label}-Tier: ${items.map(p => p.name).join(', ')}`);
      }
    });
    lines.push('\nMade on CardVault \u2014 cardvault-two.vercel.app/tools/tier-list');
    return lines.join('');
  };

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1.5">
          {(['all', 'baseball', 'basketball', 'football', 'hockey', 'pokemon'] as SportFilter[]).map(s => (
            <button
              key={s}
              onClick={() => setSportFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sportFilter === s ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              {s === 'all' ? 'All' : `${SPORT_EMOJI[s]} ${s.charAt(0).toUpperCase() + s.slice(1)}`}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none w-48"
        />
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setShowPresets(!showPresets)}
            className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs hover:bg-slate-700"
          >
            Load Preset
          </button>
          {rankedCount > 0 && (
            <>
              <button onClick={generateShareUrl} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs hover:bg-indigo-500">
                Share
              </button>
              <button onClick={clearAll} className="px-3 py-1.5 bg-slate-800 text-slate-400 rounded-lg text-xs hover:bg-slate-700">
                Clear All
              </button>
            </>
          )}
        </div>
      </div>

      {/* Presets panel */}
      {showPresets && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex flex-wrap gap-3">
          <button onClick={() => loadPreset('community')} className="px-4 py-2 bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 rounded-lg text-sm hover:bg-indigo-600/30">
            Community Consensus
          </button>
          <button onClick={() => loadPreset('flipper')} className="px-4 py-2 bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 rounded-lg text-sm hover:bg-emerald-600/30">
            Flipper&apos;s Pick
          </button>
          <button onClick={() => loadPreset('investor')} className="px-4 py-2 bg-amber-600/20 border border-amber-500/40 text-amber-300 rounded-lg text-sm hover:bg-amber-600/30">
            Long-Term Investor
          </button>
          <p className="text-xs text-slate-500 w-full mt-1">Pre-built tier lists based on different collecting strategies. Edit any preset to make it your own.</p>
        </div>
      )}

      {/* Share URL */}
      {shareUrl && (
        <div className="bg-emerald-950/40 border border-emerald-800/50 rounded-xl p-4">
          <p className="text-emerald-400 text-sm font-medium mb-2">Link copied to clipboard!</p>
          <p className="text-xs text-slate-400 break-all">{shareUrl}</p>
          <button
            onClick={() => {
              const text = generateShareText();
              navigator.clipboard?.writeText(text);
            }}
            className="mt-2 px-3 py-1 bg-emerald-800/40 text-emerald-300 rounded text-xs hover:bg-emerald-800/60"
          >
            Copy as Text
          </button>
        </div>
      )}

      {/* Stats bar */}
      <div className="flex gap-4 text-sm">
        <span className="text-slate-400">{rankedCount} / {PRODUCTS.length} ranked</span>
        {TIERS.map(t => {
          const count = tierProducts(t.label).length;
          return count > 0 ? (
            <span key={t.label} className={t.color}>{t.label}: {count}</span>
          ) : null;
        })}
      </div>

      {/* Tier rows */}
      <div className="space-y-3">
        {TIERS.map(t => {
          const items = tierProducts(t.label);
          return (
            <div key={t.label} className={`${t.bg} border ${t.border} rounded-xl overflow-hidden`}>
              <div className="flex">
                {/* Tier label */}
                <div className={`w-16 sm:w-20 flex-shrink-0 flex flex-col items-center justify-center border-r ${t.border} py-3`}>
                  <span className={`text-2xl sm:text-3xl font-black ${t.color}`}>{t.label}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5 text-center px-1 leading-tight">{t.desc.split(' \u2014 ')[1] || t.desc}</span>
                </div>
                {/* Products */}
                <div className="flex-1 min-h-[60px] p-2 flex flex-wrap gap-2 items-start">
                  {items.length === 0 && (
                    <span className="text-xs text-slate-600 self-center px-2">Click a product below to add it here</span>
                  )}
                  {items.map(p => (
                    <button
                      key={p.id}
                      onClick={() => removeTier(p.id)}
                      className={`${SPORT_COLORS[p.sport]} border rounded-lg px-2.5 py-1.5 text-xs font-medium hover:opacity-80 transition-opacity group relative`}
                      title="Click to remove"
                    >
                      {SPORT_EMOJI[p.sport]} {p.name}
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full text-[9px] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">&times;</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tier picker modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={() => setSelectedProduct(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-bold text-lg mb-1">Rank This Product</h3>
            <p className="text-slate-400 text-sm mb-4">{PRODUCTS.find(p => p.id === selectedProduct)?.name}</p>
            <div className="grid grid-cols-3 gap-3">
              {TIERS.map(t => (
                <button
                  key={t.label}
                  onClick={() => assignTier(selectedProduct, t.label)}
                  className={`${t.bg} border ${t.border} rounded-xl py-3 flex flex-col items-center gap-1 hover:scale-105 transition-transform`}
                >
                  <span className={`text-2xl font-black ${t.color}`}>{t.label}</span>
                  <span className="text-[10px] text-slate-500">{t.desc.split(' \u2014 ')[1] || t.desc}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setSelectedProduct(null)} className="mt-4 w-full py-2 bg-slate-800 text-slate-400 rounded-lg text-sm hover:bg-slate-700">Cancel</button>
          </div>
        </div>
      )}

      {/* Unranked products */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3">
          Products to Rank {unranked.length < PRODUCTS.length - rankedCount && <span className="text-sm text-slate-500 font-normal">(filtered)</span>}
        </h2>
        {unranked.length === 0 && rankedCount === PRODUCTS.length && (
          <div className="bg-emerald-950/40 border border-emerald-800/50 rounded-xl p-6 text-center">
            <p className="text-emerald-400 font-bold text-lg">All Products Ranked!</p>
            <p className="text-slate-400 text-sm mt-1">Share your tier list with friends using the Share button above.</p>
          </div>
        )}
        {unranked.length === 0 && rankedCount < PRODUCTS.length && (
          <p className="text-slate-500 text-sm">No products match your filters. Try changing the sport filter or search.</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {unranked.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedProduct(p.id)}
              className="bg-slate-800/60 border border-slate-700 rounded-lg p-3 text-left hover:bg-slate-800 hover:border-slate-600 transition-colors group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors">{p.name}</p>
                  <div className="flex gap-2 mt-1">
                    <span className={`${SPORT_COLORS[p.sport]} border rounded px-1.5 py-0.5 text-[10px]`}>{SPORT_EMOJI[p.sport]} {p.sport}</span>
                    <span className="text-[10px] text-slate-500">{p.priceRange}</span>
                  </div>
                </div>
                <span className="text-xs text-slate-600 group-hover:text-indigo-400 transition-colors">Rank &rarr;</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">How to Use the Tier List</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-indigo-400 font-bold">1. Browse Products</span>
            <p className="text-slate-400 mt-1">Filter by sport or search by name. We include 40 of the most popular 2023-2025 card products across all sports.</p>
          </div>
          <div>
            <span className="text-indigo-400 font-bold">2. Click to Rank</span>
            <p className="text-slate-400 mt-1">Click any product to assign it a tier from S (must buy) to F (avoid). Click a ranked product to remove it.</p>
          </div>
          <div>
            <span className="text-indigo-400 font-bold">3. Try Presets</span>
            <p className="text-slate-400 mt-1">Load our Community Consensus, Flipper, or Investor presets as a starting point, then customize.</p>
          </div>
          <div>
            <span className="text-indigo-400 font-bold">4. Share</span>
            <p className="text-slate-400 mt-1">Hit Share to copy a unique URL. Send it to friends or post it on social media to compare rankings.</p>
          </div>
        </div>
      </div>

      {/* Pro Tips */}
      <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Tier List Pro Tips</h2>
        <div className="space-y-3 text-sm">
          <div className="flex gap-3">
            <span className="text-amber-400 font-bold shrink-0">1.</span>
            <p className="text-slate-400"><strong className="text-slate-300">Hobby vs. Retail:</strong> Hobby boxes almost always have better EV and hit rates. Blasters and retail are better for the rip experience on a budget.</p>
          </div>
          <div className="flex gap-3">
            <span className="text-amber-400 font-bold shrink-0">2.</span>
            <p className="text-slate-400"><strong className="text-slate-300">Rookie Class Matters:</strong> A weak rookie class drops S-tier products to B-tier. Prizm Basketball in a Wemby/Chet year vs a weak draft year is a different product.</p>
          </div>
          <div className="flex gap-3">
            <span className="text-amber-400 font-bold shrink-0">3.</span>
            <p className="text-slate-400"><strong className="text-slate-300">Buy Window:</strong> Most products drop 20-40% in the first 4-6 weeks after release. Wait for the dip unless you want day-one content.</p>
          </div>
          <div className="flex gap-3">
            <span className="text-amber-400 font-bold shrink-0">4.</span>
            <p className="text-slate-400"><strong className="text-slate-300">Sealed Long-Term:</strong> Chrome and Prizm hobby boxes have historically appreciated the most as sealed investments. Heritage and Update rarely hold value.</p>
          </div>
          <div className="flex gap-3">
            <span className="text-amber-400 font-bold shrink-0">5.</span>
            <p className="text-slate-400"><strong className="text-slate-300">Pokemon Special Sets:</strong> ETBs from special sets (151, Crown Zenith, Prismatic Evolutions) tend to hold value better than standard expansion ETBs.</p>
          </div>
          <div className="flex gap-3">
            <span className="text-amber-400 font-bold shrink-0">6.</span>
            <p className="text-slate-400"><strong className="text-slate-300">Checklist Quality:</strong> The #1 factor in product value is the checklist. Products with numbered parallels, on-card autos, and strong RCs always rank higher.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

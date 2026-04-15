'use client';

import { useState, useMemo, useCallback } from 'react';

type TierRank = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
type Category = 'rookies_2024' | 'goat_baseball' | 'goat_basketball' | 'goat_football' | 'goat_hockey' | 'grading_companies' | 'sealed_products';

interface TierItem {
  id: string;
  name: string;
  subtitle?: string;
}

interface TierConfig {
  rank: TierRank;
  label: string;
  color: string;
  bg: string;
  border: string;
}

const TIERS: TierConfig[] = [
  { rank: 'S', label: 'S', color: 'text-red-400', bg: 'bg-red-950/50', border: 'border-red-800/50' },
  { rank: 'A', label: 'A', color: 'text-orange-400', bg: 'bg-orange-950/50', border: 'border-orange-800/50' },
  { rank: 'B', label: 'B', color: 'text-yellow-400', bg: 'bg-yellow-950/50', border: 'border-yellow-800/50' },
  { rank: 'C', label: 'C', color: 'text-green-400', bg: 'bg-green-950/50', border: 'border-green-800/50' },
  { rank: 'D', label: 'D', color: 'text-blue-400', bg: 'bg-blue-950/50', border: 'border-blue-800/50' },
  { rank: 'F', label: 'F', color: 'text-gray-400', bg: 'bg-gray-900/50', border: 'border-gray-700/50' },
];

const CATEGORIES: { id: Category; label: string; items: TierItem[] }[] = [
  {
    id: 'rookies_2024',
    label: '2024 Rookie Class',
    items: [
      { id: 'caleb', name: 'Caleb Williams', subtitle: 'Bears QB' },
      { id: 'jayden', name: 'Jayden Daniels', subtitle: 'Commanders QB' },
      { id: 'malik', name: 'Malik Nabers', subtitle: 'Giants WR' },
      { id: 'marvin', name: 'Marvin Harrison Jr.', subtitle: 'Cardinals WR' },
      { id: 'brock', name: 'Brock Bowers', subtitle: 'Raiders TE' },
      { id: 'drake', name: 'Drake Maye', subtitle: 'Patriots QB' },
      { id: 'rome', name: 'Rome Odunze', subtitle: 'Bears WR' },
      { id: 'jared', name: 'Jared Verse', subtitle: 'Rams DE' },
      { id: 'joe', name: 'Joe Alt', subtitle: 'Chargers OT' },
      { id: 'bo', name: 'Bo Nix', subtitle: 'Broncos QB' },
      { id: 'ladd', name: 'Ladd McConkey', subtitle: 'Chargers WR' },
      { id: 'brian', name: 'Brian Thomas Jr.', subtitle: 'Jaguars WR' },
    ],
  },
  {
    id: 'goat_baseball',
    label: 'GOAT Baseball Cards',
    items: [
      { id: 'mantle52', name: '1952 Topps Mantle', subtitle: '#311' },
      { id: 'wagner', name: 'T206 Honus Wagner', subtitle: '1909-11' },
      { id: 'griffey89', name: '1989 UD Griffey Jr.', subtitle: '#1 RC' },
      { id: 'jeter93', name: '1993 SP Jeter', subtitle: '#279 RC' },
      { id: 'trout11', name: '2011 Topps Update Trout', subtitle: '#US175 RC' },
      { id: 'ruth33', name: '1933 Goudey Ruth', subtitle: '#53' },
      { id: 'mays52', name: '1952 Topps Mays', subtitle: '#261 RC' },
      { id: 'aaron54', name: '1954 Topps Aaron', subtitle: '#128 RC' },
      { id: 'ohtani18', name: '2018 Topps Update Ohtani', subtitle: '#US1 RC' },
      { id: 'clemente55', name: '1955 Topps Clemente', subtitle: '#164 RC' },
    ],
  },
  {
    id: 'goat_basketball',
    label: 'GOAT Basketball Cards',
    items: [
      { id: 'jordan86', name: '1986 Fleer Jordan', subtitle: '#57 RC' },
      { id: 'lebron03', name: '2003 Topps LeBron', subtitle: '#221 RC' },
      { id: 'kobe96', name: '1996 Topps Chrome Kobe', subtitle: '#138 RC' },
      { id: 'curry09', name: '2009 Topps Chrome Curry', subtitle: '#101 RC' },
      { id: 'wemby23', name: '2023 Prizm Wembanyama', subtitle: 'RC' },
      { id: 'giannis13', name: '2013 Prizm Giannis', subtitle: '#290 RC' },
      { id: 'luka18', name: '2018 Prizm Luka', subtitle: '#280 RC' },
      { id: 'bird80', name: '1980 Topps Bird', subtitle: '#34 RC' },
      { id: 'magic80', name: '1980 Topps Magic', subtitle: '#18 RC' },
      { id: 'shaq92', name: '1992 Topps Gold Shaq', subtitle: '#362 RC' },
    ],
  },
  {
    id: 'goat_football',
    label: 'GOAT Football Cards',
    items: [
      { id: 'brady00', name: '2000 Bowman Chrome Brady', subtitle: '#236 RC' },
      { id: 'mahomes17', name: '2017 Prizm Mahomes', subtitle: '#269 RC' },
      { id: 'montana81', name: '1981 Topps Montana', subtitle: '#216 RC' },
      { id: 'unitas57', name: '1957 Topps Unitas', subtitle: '#138 RC' },
      { id: 'manning98', name: '1998 Topps Chrome Manning', subtitle: '#165 RC' },
      { id: 'rice86', name: '1986 Topps Rice', subtitle: '#161 RC' },
      { id: 'sanders89', name: '1989 Score Sanders', subtitle: '#257 RC' },
      { id: 'namath65', name: '1965 Topps Namath', subtitle: '#122 RC' },
      { id: 'stroud23', name: '2023 Prizm Stroud', subtitle: 'RC' },
      { id: 'daniels24', name: '2024 Prizm Daniels', subtitle: 'RC' },
    ],
  },
  {
    id: 'goat_hockey',
    label: 'GOAT Hockey Cards',
    items: [
      { id: 'gretzky79', name: '1979 OPC Gretzky', subtitle: '#18 RC' },
      { id: 'lemieux85', name: '1985 OPC Lemieux', subtitle: '#9 RC' },
      { id: 'orr66', name: '1966 Topps Orr', subtitle: '#35 RC' },
      { id: 'howe51', name: '1951 Parkhurst Howe', subtitle: '#66 RC' },
      { id: 'crosby05', name: '2005 UD YG Crosby', subtitle: '#201 RC' },
      { id: 'mcdavid15', name: '2015 UD YG McDavid', subtitle: '#201 RC' },
      { id: 'ovy05', name: '2005 UD YG Ovechkin', subtitle: '#443 RC' },
      { id: 'roy86', name: '1986 OPC Roy', subtitle: '#53 RC' },
      { id: 'jagr90', name: '1990 UD Jagr', subtitle: '#356 RC' },
      { id: 'messier80', name: '1980 OPC Messier', subtitle: '#289 RC' },
    ],
  },
  {
    id: 'grading_companies',
    label: 'Grading Companies',
    items: [
      { id: 'psa', name: 'PSA', subtitle: 'Professional Sports Authenticator' },
      { id: 'bgs', name: 'BGS', subtitle: 'Beckett Grading Services' },
      { id: 'cgc', name: 'CGC', subtitle: 'Certified Guaranty Company' },
      { id: 'sgc', name: 'SGC', subtitle: 'Sportscard Guaranty Corp' },
      { id: 'hga', name: 'HGA', subtitle: 'Hybrid Grading Approach' },
      { id: 'csg', name: 'CSG', subtitle: 'Certified Sports Guaranty' },
      { id: 'isa', name: 'ISA', subtitle: 'International Sports Authentication' },
      { id: 'aga', name: 'AGA', subtitle: 'Arena Grading & Authentication' },
    ],
  },
  {
    id: 'sealed_products',
    label: 'Sealed Products to Rip',
    items: [
      { id: 'topps_chrome', name: 'Topps Chrome Hobby', subtitle: 'Baseball' },
      { id: 'prizm_football', name: 'Prizm Football Hobby', subtitle: 'Football' },
      { id: 'bowman_chrome', name: 'Bowman Chrome Hobby', subtitle: 'Baseball' },
      { id: 'select_football', name: 'Select Football Hobby', subtitle: 'Football' },
      { id: 'prizm_basketball', name: 'Prizm Basketball Hobby', subtitle: 'Basketball' },
      { id: 'optic_football', name: 'Optic Football Hobby', subtitle: 'Football' },
      { id: 'topps_series1', name: 'Topps Series 1 Hobby', subtitle: 'Baseball' },
      { id: 'upper_deck_hockey', name: 'Upper Deck Series 1', subtitle: 'Hockey' },
      { id: 'national_treasures', name: 'National Treasures', subtitle: 'Football' },
      { id: 'pokemon_etb', name: 'Pokemon ETB', subtitle: 'Pokemon' },
    ],
  },
];

const STORAGE_KEY = 'cardvault_tier_list';

function loadSavedState(): Record<string, Record<TierRank, string[]>> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveState(catId: string, placements: Record<TierRank, string[]>) {
  try {
    const all = loadSavedState();
    all[catId] = placements;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {}
}

export default function TierListMaker() {
  const [selectedCat, setSelectedCat] = useState<Category>('rookies_2024');
  const [placements, setPlacements] = useState<Record<TierRank, string[]>>({
    S: [], A: [], B: [], C: [], D: [], F: [],
  });
  const [dragItem, setDragItem] = useState<string | null>(null);

  const category = CATEGORIES.find(c => c.id === selectedCat)!;

  const placedIds = useMemo(() => {
    const set = new Set<string>();
    Object.values(placements).forEach(ids => ids.forEach(id => set.add(id)));
    return set;
  }, [placements]);

  const unplacedItems = category.items.filter(item => !placedIds.has(item.id));

  const handleCategoryChange = useCallback((catId: Category) => {
    setSelectedCat(catId);
    const saved = loadSavedState();
    if (saved[catId]) {
      setPlacements(saved[catId]);
    } else {
      setPlacements({ S: [], A: [], B: [], C: [], D: [], F: [] });
    }
  }, []);

  const placeItem = useCallback((itemId: string, tier: TierRank) => {
    setPlacements(prev => {
      const next = { ...prev };
      // Remove from all tiers first
      for (const t of Object.keys(next) as TierRank[]) {
        next[t] = next[t].filter(id => id !== itemId);
      }
      next[tier] = [...next[tier], itemId];
      saveState(selectedCat, next);
      return next;
    });
  }, [selectedCat]);

  const removeItem = useCallback((itemId: string) => {
    setPlacements(prev => {
      const next = { ...prev };
      for (const t of Object.keys(next) as TierRank[]) {
        next[t] = next[t].filter(id => id !== itemId);
      }
      saveState(selectedCat, next);
      return next;
    });
  }, [selectedCat]);

  const resetAll = useCallback(() => {
    setPlacements({ S: [], A: [], B: [], C: [], D: [], F: [] });
    saveState(selectedCat, { S: [], A: [], B: [], C: [], D: [], F: [] });
  }, [selectedCat]);

  const shareText = useMemo(() => {
    const lines = ['My CardVault Tier List:'];
    lines.push(`Category: ${category.label}`);
    for (const tier of TIERS) {
      const items = placements[tier.rank];
      if (items.length > 0) {
        const names = items.map(id => category.items.find(i => i.id === id)?.name || id);
        lines.push(`${tier.rank}: ${names.join(', ')}`);
      }
    }
    lines.push('');
    lines.push('Make yours at cardvault-two.vercel.app/tier-list');
    return lines.join('\n');
  }, [placements, category]);

  const totalPlaced = Object.values(placements).reduce((sum, arr) => sum + arr.length, 0);
  const pct = category.items.length > 0 ? Math.round((totalPlaced / category.items.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Category Selector */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => handleCategoryChange(c.id)}
            className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
              selectedCat === c.id
                ? 'bg-rose-600 border-rose-500 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-sm text-gray-400">{totalPlaced}/{category.items.length} placed</span>
        <button onClick={resetAll} className="text-xs text-gray-500 hover:text-red-400 transition-colors">
          Reset
        </button>
      </div>

      {/* Tiers */}
      <div className="space-y-2">
        {TIERS.map(tier => (
          <div
            key={tier.rank}
            className={`flex items-stretch rounded-xl border ${tier.border} overflow-hidden min-h-[56px]`}
            onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('ring-2', 'ring-white/20'); }}
            onDragLeave={e => { e.currentTarget.classList.remove('ring-2', 'ring-white/20'); }}
            onDrop={e => {
              e.preventDefault();
              e.currentTarget.classList.remove('ring-2', 'ring-white/20');
              if (dragItem) {
                placeItem(dragItem, tier.rank);
                setDragItem(null);
              }
            }}
          >
            <div className={`w-14 sm:w-16 flex-shrink-0 flex items-center justify-center ${tier.bg} border-r ${tier.border}`}>
              <span className={`text-2xl font-black ${tier.color}`}>{tier.label}</span>
            </div>
            <div className="flex-1 flex flex-wrap gap-2 p-2 bg-gray-900/30">
              {placements[tier.rank].map(itemId => {
                const item = category.items.find(i => i.id === itemId);
                if (!item) return null;
                return (
                  <div
                    key={itemId}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${tier.bg} border ${tier.border} cursor-grab`}
                    draggable
                    onDragStart={() => setDragItem(itemId)}
                  >
                    <span className="text-sm text-white font-medium">{item.name}</span>
                    <button
                      onClick={() => removeItem(itemId)}
                      className="text-gray-500 hover:text-red-400 text-xs ml-1"
                    >
                      x
                    </button>
                  </div>
                );
              })}
              {placements[tier.rank].length === 0 && (
                <span className="text-xs text-gray-600 py-1.5">Drag items here or tap below to place</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Unplaced Items */}
      {unplacedItems.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Tap to place (or drag to a tier)</h3>
          <div className="flex flex-wrap gap-2">
            {unplacedItems.map(item => (
              <div
                key={item.id}
                className="group relative"
                draggable
                onDragStart={() => setDragItem(item.id)}
              >
                <div className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg cursor-grab hover:border-gray-600 transition-colors">
                  <span className="text-sm text-white font-medium">{item.name}</span>
                  {item.subtitle && <span className="text-xs text-gray-500 ml-1.5">{item.subtitle}</span>}
                </div>
                {/* Quick-place buttons on hover */}
                <div className="hidden group-hover:flex absolute top-full left-0 mt-1 gap-0.5 z-10">
                  {TIERS.map(t => (
                    <button
                      key={t.rank}
                      onClick={() => placeItem(item.id, t.rank)}
                      className={`w-7 h-7 text-xs font-bold rounded ${t.bg} ${t.color} border ${t.border} hover:opacity-80`}
                    >
                      {t.rank}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Share */}
      {totalPlaced > 0 && (
        <div className="flex gap-3">
          <button
            onClick={() => {
              navigator.clipboard.writeText(shareText);
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg text-sm transition-colors"
          >
            Copy Tier List
          </button>
          <button
            onClick={() => {
              const url = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
              window.open(url, '_blank');
            }}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-lg text-sm border border-gray-700 transition-colors"
          >
            Share to X
          </button>
        </div>
      )}
    </div>
  );
}

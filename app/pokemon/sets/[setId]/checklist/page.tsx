'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface ChecklistCard {
  id: string;
  name: string;
  number: string;
  rarity?: string;
  images?: { small?: string };
  tcgplayer?: {
    prices?: {
      holofoil?: { market?: number };
      normal?: { market?: number };
      reverseHolofoil?: { market?: number };
      firstEditionHolofoil?: { market?: number };
    };
  };
}

interface PokemonSet {
  id: string;
  name: string;
  series: string;
  total: number;
  printedTotal?: number;
  releaseDate: string;
  images: { logo?: string; symbol?: string };
}

function getBestPrice(card: ChecklistCard): number {
  const p = card.tcgplayer?.prices;
  if (!p) return 0;
  return (
    p.holofoil?.market ??
    p.firstEditionHolofoil?.market ??
    p.normal?.market ??
    p.reverseHolofoil?.market ??
    0
  );
}

function getStorageKey(setId: string) {
  return `pokemon-checklist-${setId}`;
}

export default function PokemonChecklistPage() {
  const params = useParams();
  const setId = params.setId as string;

  const [cards, setCards] = useState<ChecklistCard[]>([]);
  const [setInfo, setSetInfo] = useState<PokemonSet | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [printMode, setPrintMode] = useState(false);

  // Load saved checklist from localStorage
  useEffect(() => {
    if (!setId) return;
    try {
      const saved = localStorage.getItem(getStorageKey(setId));
      if (saved) setChecked(new Set(JSON.parse(saved)));
    } catch {}
  }, [setId]);

  // Persist to localStorage
  const saveChecked = useCallback((next: Set<string>) => {
    try {
      localStorage.setItem(getStorageKey(setId), JSON.stringify(Array.from(next)));
    } catch {}
  }, [setId]);

  // Fetch all cards in set (paginated)
  useEffect(() => {
    if (!setId) return;
    setLoading(true);

    async function fetchAll() {
      try {
        const setRes = await fetch(`https://api.pokemontcg.io/v2/sets/${setId}`);
        if (!setRes.ok) throw new Error('Set not found');
        const setData = await setRes.json();
        setSetInfo(setData.data);

        const total = setData.data.total ?? 200;
        const pages = Math.ceil(total / 250);
        const fetched: ChecklistCard[] = [];

        for (let page = 1; page <= pages; page++) {
          const res = await fetch(
            `https://api.pokemontcg.io/v2/cards?q=set.id:${setId}&pageSize=250&page=${page}&orderBy=number`
          );
          if (!res.ok) break;
          const data = await res.json();
          fetched.push(...(data.data ?? []));
        }

        // Sort numerically then alphabetically
        fetched.sort((a, b) => {
          const na = parseInt(a.number) || 0;
          const nb = parseInt(b.number) || 0;
          if (na !== nb) return na - nb;
          return a.number.localeCompare(b.number);
        });

        setCards(fetched);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [setId]);

  const toggleCard = useCallback((id: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveChecked(next);
      return next;
    });
  }, [saveChecked]);

  const checkAll = () => {
    const next = new Set(cards.map(c => c.id));
    setChecked(next);
    saveChecked(next);
  };

  const uncheckAll = () => {
    const next = new Set<string>();
    setChecked(next);
    saveChecked(next);
  };

  const checkedCount = checked.size;
  const total = setInfo?.printedTotal ?? setInfo?.total ?? cards.length;
  const completionPct = total > 0 ? Math.round((checkedCount / total) * 100) : 0;

  const totalValue = cards
    .filter(c => checked.has(c.id))
    .reduce((sum, c) => sum + getBestPrice(c), 0);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="inline-block w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400">Loading cards&hellip;</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <Link href={`/pokemon/sets/${setId}`} className="text-emerald-400 hover:text-emerald-300 text-sm">
          Back to set
        </Link>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 ${printMode ? 'print:py-2' : ''}`}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 print:hidden">
        <Link href="/pokemon" className="hover:text-gray-300">Pokémon</Link>
        <span>/</span>
        <Link href={`/pokemon/sets/${setId}`} className="hover:text-gray-300">{setInfo?.name ?? setId}</Link>
        <span>/</span>
        <span className="text-gray-300">Checklist</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">
          {setInfo?.name ?? 'Set'} Checklist
        </h1>
        <p className="text-gray-400 text-sm">
          {setInfo?.series} · {setInfo?.releaseDate} · {total} cards
        </p>
      </div>

      {/* Progress bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white font-semibold text-lg">
              You have {checkedCount} of {total} cards
            </p>
            <p className="text-gray-400 text-sm">{completionPct}% complete</p>
          </div>
          <div className="text-right">
            <p className="text-emerald-400 font-bold text-xl">
              ${totalValue.toFixed(2)}
            </p>
            <p className="text-gray-500 text-xs">estimated value (TCGPlayer market)</p>
          </div>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <p className="text-gray-600 text-xs mt-2">Saved in your browser · No account required</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6 print:hidden">
        <button
          onClick={checkAll}
          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-900/50 text-emerald-400 border border-emerald-800/50 hover:bg-emerald-900/80 transition-colors"
        >
          Check All
        </button>
        <button
          onClick={uncheckAll}
          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700 transition-colors"
        >
          Uncheck All
        </button>
        <button
          onClick={() => { setPrintMode(true); setTimeout(() => { window.print(); setPrintMode(false); }, 100); }}
          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-900/50 text-blue-400 border border-blue-800/50 hover:bg-blue-900/80 transition-colors ml-auto"
        >
          Print Checklist
        </button>
        <Link
          href={`/pokemon/sets/${setId}`}
          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700 transition-colors"
        >
          ← Back to Set
        </Link>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        {cards.map(card => {
          const isChecked = checked.has(card.id);
          const price = getBestPrice(card);
          return (
            <button
              key={card.id}
              onClick={() => toggleCard(card.id)}
              className={`group relative rounded-xl border transition-all text-left ${
                isChecked
                  ? 'border-emerald-500/70 bg-emerald-950/30 shadow-emerald-900/20 shadow-md'
                  : 'border-gray-800 bg-gray-900 hover:border-gray-600'
              }`}
            >
              {/* Checkbox indicator */}
              <div className={`absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center z-10 transition-all ${
                isChecked
                  ? 'border-emerald-400 bg-emerald-500'
                  : 'border-gray-600 bg-transparent group-hover:border-gray-400'
              }`}>
                {isChecked && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>

              {/* Card image */}
              <div className="relative aspect-[2.5/3.5] rounded-t-xl overflow-hidden bg-gray-800">
                {card.images?.small ? (
                  <Image
                    src={card.images.small}
                    alt={card.name}
                    fill
                    sizes="120px"
                    className={`object-contain transition-all ${isChecked ? 'opacity-100' : 'opacity-60 group-hover:opacity-80'}`}
                    unoptimized
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-600 text-xl">⚡</div>
                )}
                {isChecked && (
                  <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none" />
                )}
              </div>

              {/* Card info */}
              <div className="p-1.5">
                <p className={`text-xs font-medium truncate leading-snug ${isChecked ? 'text-emerald-300' : 'text-gray-300'}`}>
                  {card.name}
                </p>
                <p className="text-gray-600 text-xs">#{card.number}</p>
                {price > 0 && (
                  <p className="text-emerald-400 text-xs font-semibold">${price.toFixed(2)}</p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="text-gray-600 text-xs text-center mt-8 print:hidden">
        Prices sourced from TCGPlayer via Pokémon TCG API · Checklist saved locally in your browser
      </p>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

interface SetSummary {
  setSlug: string;
  setName: string;
  sport: string;
  totalInDb: number;
  owned: number;
  pct: number;
  estimatedValue: number;
  type: 'sports';
}

interface PokemonSetSummary {
  setId: string;
  setName: string;
  owned: number;
  type: 'pokemon';
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function parseValue(val: string): number {
  const m = val.match(/\$([\d,]+)/);
  if (!m) return 0;
  return parseInt(m[1].replace(/,/g, ''), 10) || 0;
}

const sportIcons: Record<string, string> = {
  baseball: '⚾',
  basketball: '🏀',
  football: '🏈',
  hockey: '🏒',
};

export default function CollectionPage() {
  const [sportsSets, setSportsSets] = useState<SetSummary[]>([]);
  const [pokemonSets, setPokemonSets] = useState<PokemonSetSummary[]>([]);
  const [totalOwned, setTotalOwned] = useState(0);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    // Build sports set summaries
    const setMap = new Map<string, { setName: string; sport: string; cards: typeof sportsCards }>();
    for (const card of sportsCards) {
      const slug = slugify(card.set);
      if (!setMap.has(slug)) {
        setMap.set(slug, { setName: card.set, sport: card.sport, cards: [] });
      }
      setMap.get(slug)!.cards.push(card);
    }

    const summaries: SetSummary[] = [];
    let totalO = 0;
    let totalV = 0;

    for (const [slug, { setName, sport, cards }] of setMap.entries()) {
      try {
        const saved = localStorage.getItem(`sports-checklist-${slug}`);
        const ownedSlugs: string[] = saved ? JSON.parse(saved) : [];
        const ownedSet = new Set(ownedSlugs);
        const owned = cards.filter(c => ownedSet.has(c.slug)).length;

        if (owned > 0) {
          const value = cards
            .filter(c => ownedSet.has(c.slug))
            .reduce((sum, c) => sum + parseValue(c.estimatedValueRaw), 0);

          summaries.push({
            setSlug: slug,
            setName,
            sport,
            totalInDb: cards.length,
            owned,
            pct: Math.round((owned / cards.length) * 100),
            estimatedValue: value,
            type: 'sports',
          });

          totalO += owned;
          totalV += value;
        }
      } catch {}
    }

    // Pokemon sets
    const pokeSummaries: PokemonSetSummary[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key?.startsWith('pokemon-checklist-')) continue;
        const setId = key.replace('pokemon-checklist-', '');
        const saved = localStorage.getItem(key);
        if (!saved) continue;
        const ids: string[] = JSON.parse(saved);
        if (ids.length > 0) {
          pokeSummaries.push({
            setId,
            setName: setId.toUpperCase().replace(/-/g, ' '),
            owned: ids.length,
            type: 'pokemon',
          });
          totalO += ids.length;
        }
      }
    } catch {}

    setSportsSets(summaries.sort((a, b) => b.owned - a.owned));
    setPokemonSets(pokeSummaries.sort((a, b) => b.owned - a.owned));
    setTotalOwned(totalO);
    setTotalValue(totalV);
  }, []);

  const hasAny = sportsSets.length > 0 || pokemonSets.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Collection</h1>
        <p className="text-gray-400 text-sm">No account required — saved in your browser. Use set checklists to track what you own.</p>
      </div>

      {/* Summary stats */}
      {hasAny && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-gray-500 text-xs mb-1">Total Cards Owned</p>
            <p className="text-emerald-400 font-black text-3xl">{totalOwned.toLocaleString()}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-gray-500 text-xs mb-1">Estimated Value</p>
            <p className="text-white font-black text-3xl">${totalValue.toLocaleString()}+</p>
            <p className="text-gray-600 text-xs">sports cards (mid grade)</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-gray-500 text-xs mb-1">Sets Tracked</p>
            <p className="text-blue-400 font-black text-3xl">{sportsSets.length + pokemonSets.length}</p>
          </div>
        </div>
      )}

      {!hasAny && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center mb-8">
          <p className="text-gray-400 text-lg mb-2">No cards tracked yet</p>
          <p className="text-gray-600 text-sm mb-6">
            Use a set checklist to mark cards you own. Your collection is saved automatically — no account needed.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/pokemon/sets/base1/checklist"
              className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-600/40 text-yellow-300 px-4 py-2 rounded-xl text-sm font-medium hover:bg-yellow-500/30 transition-colors"
            >
              Try: Pokémon Base Set Checklist
            </Link>
            <Link
              href="/sports/sets/1986-87-fleer/checklist"
              className="inline-flex items-center gap-2 bg-emerald-900/40 border border-emerald-800/40 text-emerald-400 px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-900/60 transition-colors"
            >
              Try: 1986-87 Fleer Checklist
            </Link>
          </div>
        </div>
      )}

      {/* Sports sets */}
      {sportsSets.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4">Sports Cards</h2>
          <div className="space-y-3">
            {sportsSets.map(s => (
              <div key={s.setSlug} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
                <span className="text-2xl">{sportIcons[s.sport] ?? '🃏'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{s.setName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-gray-800 rounded-full h-1.5 max-w-48">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${s.pct}%` }}
                      />
                    </div>
                    <span className="text-gray-400 text-xs whitespace-nowrap">{s.owned}/{s.totalInDb} · {s.pct}%</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-emerald-400 font-semibold text-sm">${s.estimatedValue.toLocaleString()}+</p>
                  <Link
                    href={`/sports/sets/${s.setSlug}/checklist`}
                    className="text-blue-400 hover:text-blue-300 text-xs transition-colors"
                  >
                    Edit checklist →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pokemon sets */}
      {pokemonSets.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4">Pokémon Cards</h2>
          <div className="space-y-3">
            {pokemonSets.map(s => (
              <div key={s.setId} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
                <span className="text-2xl">⚡</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{s.setName}</p>
                  <p className="text-gray-400 text-xs">{s.owned} cards owned</p>
                </div>
                <Link
                  href={`/pokemon/sets/${s.setId}/checklist`}
                  className="text-blue-400 hover:text-blue-300 text-xs transition-colors"
                >
                  Edit checklist →
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Start tracking CTA */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
        <p className="text-white font-semibold mb-2">Track more sets</p>
        <p className="text-gray-400 text-sm mb-4">Browse any set and click &ldquo;Track Your Collection&rdquo; to start marking cards.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/pokemon" className="bg-yellow-500/20 border border-yellow-600/40 text-yellow-300 px-4 py-2 rounded-xl text-sm font-medium hover:bg-yellow-500/30 transition-colors">
            Browse Pokémon Sets
          </Link>
          <Link href="/sports/sets" className="bg-emerald-900/40 border border-emerald-800/40 text-emerald-400 px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-900/60 transition-colors">
            Browse Sports Sets
          </Link>
        </div>
      </div>
    </div>
  );
}

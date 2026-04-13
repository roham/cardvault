'use client';

import { useEffect, useState, useCallback } from 'react';
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

function encodeCollection(): string {
  const owned: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (key.startsWith('sports-checklist-') || key.startsWith('pokemon-checklist-')) {
        const val = localStorage.getItem(key);
        if (val) {
          const items: string[] = JSON.parse(val);
          if (items.length > 0) {
            owned.push(`${key}=${items.join(',')}`);
          }
        }
      }
    }
  } catch {}
  if (owned.length === 0) return '';
  return btoa(owned.join('|'));
}

function decodeCollection(hash: string): Map<string, string[]> {
  const result = new Map<string, string[]>();
  try {
    const decoded = atob(hash);
    const pairs = decoded.split('|');
    for (const pair of pairs) {
      const eqIdx = pair.indexOf('=');
      if (eqIdx === -1) continue;
      const key = pair.slice(0, eqIdx);
      const items = pair.slice(eqIdx + 1).split(',').filter(Boolean);
      if (items.length > 0) result.set(key, items);
    }
  } catch {}
  return result;
}

export default function CollectionPage() {
  const [sportsSets, setSportsSets] = useState<SetSummary[]>([]);
  const [pokemonSets, setPokemonSets] = useState<PokemonSetSummary[]>([]);
  const [totalOwned, setTotalOwned] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isViewingShared, setIsViewingShared] = useState(false);
  const [sharedOwnerName, setSharedOwnerName] = useState('');

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

    // Check if viewing a shared collection
    const hash = window.location.hash;
    if (hash.startsWith('#shared=')) {
      const encoded = hash.slice('#shared='.length);
      setIsViewingShared(true);
      const sharedData = decodeCollection(encoded);
      // Re-calculate with shared data
      const sharedSummaries: SetSummary[] = [];
      let sharedTotal = 0;
      let sharedValue = 0;

      for (const [key, items] of sharedData.entries()) {
        if (key.startsWith('sports-checklist-')) {
          const setSlug = key.replace('sports-checklist-', '');
          const entry = setMap.get(setSlug);
          if (!entry) continue;
          const ownedSet = new Set(items);
          const owned = entry.cards.filter(c => ownedSet.has(c.slug)).length;
          const value = entry.cards
            .filter(c => ownedSet.has(c.slug))
            .reduce((sum, c) => sum + parseValue(c.estimatedValueRaw), 0);
          if (owned > 0) {
            sharedSummaries.push({ setSlug, setName: entry.setName, sport: entry.sport, totalInDb: entry.cards.length, owned, pct: Math.round((owned / entry.cards.length) * 100), estimatedValue: value, type: 'sports' });
            sharedTotal += owned;
            sharedValue += value;
          }
        } else if (key.startsWith('pokemon-checklist-')) {
          const setId = key.replace('pokemon-checklist-', '');
          sharedTotal += items.length;
        }
      }
      setSportsSets(sharedSummaries.sort((a, b) => b.owned - a.owned));
      setTotalOwned(sharedTotal);
      setTotalValue(sharedValue);
    }
  }, []);

  const hasAny = sportsSets.length > 0 || pokemonSets.length > 0;

  const handleShare = useCallback(() => {
    const encoded = encodeCollection();
    if (!encoded) return;
    const url = `${window.location.origin}/collection#shared=${encoded}`;
    setShareUrl(url);
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  }, []);

  const handleImport = useCallback(() => {
    const hash = window.location.hash;
    if (!hash.startsWith('#shared=')) return;
    const encoded = hash.slice('#shared='.length);
    const sharedData = decodeCollection(encoded);
    for (const [key, items] of sharedData.entries()) {
      localStorage.setItem(key, JSON.stringify(items));
    }
    window.location.hash = '';
    window.location.reload();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Shared collection banner */}
      {isViewingShared && (
        <div className="mb-6 bg-violet-950/40 border border-violet-800/40 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-violet-300 font-semibold text-sm">Viewing a shared collection</p>
            <p className="text-gray-400 text-xs mt-0.5">This is someone else&apos;s collection. You can import it to your own tracker.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleImport}
              className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              Import to My Collection
            </button>
            <Link
              href="/collection"
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              View My Collection
            </Link>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{isViewingShared ? 'Shared Collection' : 'My Collection'}</h1>
          <p className="text-gray-400 text-sm">No account required — saved in your browser. Use set checklists to track what you own.</p>
        </div>
        {hasAny && !isViewingShared && (
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 bg-emerald-900/40 border border-emerald-800/40 text-emerald-400 px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-900/60 transition-colors shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            {copied ? 'Link copied!' : 'Share Collection'}
          </button>
        )}
      </div>

      {/* Share URL display */}
      {shareUrl && !isViewingShared && (
        <div className="mb-6 bg-gray-900 border border-emerald-800/30 rounded-xl p-4">
          <p className="text-emerald-400 text-xs font-medium mb-2">Share this link with anyone:</p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300 text-xs font-mono"
            />
            <button
              onClick={() => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 3000); }}
              className="bg-emerald-800 hover:bg-emerald-700 text-emerald-200 px-3 py-2 rounded-lg text-xs font-medium transition-colors shrink-0"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-gray-500 text-xs mt-2">Anyone with this link can view your collection. No account needed.</p>
        </div>
      )}

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

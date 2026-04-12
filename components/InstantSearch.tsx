'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SearchResult {
  type: 'sports' | 'pokemon';
  slug: string;
  name: string;
  set: string;
  year: string;
  sport?: string;
  price: string;
  rookie?: boolean;
  imageUrl?: string;
  pokemonHref?: string;
}

interface InstantSearchProps {
  sportsCards: Array<{
    slug: string;
    name: string;
    set: string;
    year: number;
    sport: string;
    estimatedValueRaw: string;
    rookie: boolean;
    player: string;
  }>;
  large?: boolean;
  placeholder?: string;
}

const sportIcons: Record<string, string> = {
  baseball: '⚾',
  basketball: '🏀',
  football: '🏈',
  hockey: '🏒',
};

export default function InstantSearch({ sportsCards, large = false, placeholder = 'Search cards...' }: InstantSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const search = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const lower = q.toLowerCase();
    const sportResults: SearchResult[] = sportsCards
      .filter(c =>
        c.name.toLowerCase().includes(lower) ||
        c.player.toLowerCase().includes(lower) ||
        c.set.toLowerCase().includes(lower)
      )
      .slice(0, 5)
      .map(c => ({
        type: 'sports' as const,
        slug: c.slug,
        name: c.name,
        set: c.set,
        year: c.year.toString(),
        sport: c.sport,
        price: c.estimatedValueRaw,
        rookie: c.rookie,
      }));

    // Fetch Pokémon results in parallel
    let pokemonResults: SearchResult[] = [];
    try {
      const res = await fetch(
        `https://api.pokemontcg.io/v2/cards?q=name:${encodeURIComponent(q)}*&pageSize=5&orderBy=-cardmarket.prices.averageSellPrice`,
        { signal: AbortSignal.timeout(3000) }
      );
      if (res.ok) {
        const data = await res.json();
        pokemonResults = (data.data ?? []).slice(0, 5).map((card: {
          id: string;
          name: string;
          set?: { name?: string; releaseDate?: string };
          cardmarket?: { prices?: { averageSellPrice?: number } };
          tcgplayer?: { prices?: { holofoil?: { market?: number }; normal?: { market?: number }; reverseHolofoil?: { market?: number } } };
          images?: { small?: string };
        }) => {
          const tcgPrices = card.tcgplayer?.prices;
          const price =
            tcgPrices?.holofoil?.market ??
            tcgPrices?.normal?.market ??
            tcgPrices?.reverseHolofoil?.market ??
            card.cardmarket?.prices?.averageSellPrice;
          return {
            type: 'pokemon' as const,
            slug: card.id,
            name: card.name,
            set: card.set?.name ?? 'Unknown Set',
            year: card.set?.releaseDate?.split('/')?.[0] ?? '',
            price: price ? `$${price.toFixed(2)}` : 'N/A',
            imageUrl: card.images?.small,
            pokemonHref: `/pokemon/cards/${card.id}`,
          };
        });
      }
    } catch {
      // silently fail — just show sports results
    }

    const combined = [...sportResults, ...pokemonResults];
    setResults(combined);
    setIsOpen(combined.length > 0);
    setHighlightIndex(-1);
  }, [sportsCards]);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 120);
    return () => clearTimeout(timer);
  }, [query, search]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIndex >= 0 && results[highlightIndex]) {
        const result = results[highlightIndex];
        const href = result.type === 'pokemon' ? (result.pokemonHref ?? `/pokemon/cards/${result.slug}`) : `/sports/${result.slug}`;
        router.push(href);
        setIsOpen(false);
        setQuery('');
      } else if (query.trim()) {
        router.push(`/price-guide?q=${encodeURIComponent(query)}`);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (highlightIndex >= 0 && results[highlightIndex]) {
      const result = results[highlightIndex];
      const href = result.type === 'pokemon' ? (result.pokemonHref ?? `/pokemon/cards/${result.slug}`) : `/sports/${result.slug}`;
      router.push(href);
    } else if (query.trim()) {
      router.push(`/price-guide?q=${encodeURIComponent(query)}`);
    }
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <svg
            className={`absolute left-4 text-gray-400 ${large ? 'w-5 h-5' : 'w-4 h-4'}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
            }}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoComplete="off"
            className={`w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-400 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors ${
              large ? 'pl-12 pr-32 py-4 text-base' : 'pl-10 pr-24 py-2.5 text-sm'
            } ${isOpen ? 'rounded-b-none border-b-transparent' : ''}`}
          />
          <button
            type="submit"
            className={`absolute right-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors ${
              large ? 'px-5 py-2 text-sm' : 'px-3 py-1.5 text-xs'
            }`}
          >
            Search
          </button>
        </div>
      </form>

      {/* Dropdown results */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full bg-gray-900 border border-emerald-500/30 border-t-0 rounded-b-xl shadow-2xl shadow-black/60 overflow-hidden">
          <div className="py-1">
            {results.map((result, i) => {
              const href = result.type === 'pokemon'
                ? (result.pokemonHref ?? `/pokemon/cards/${result.slug}`)
                : `/sports/${result.slug}`;
              return (
                <Link
                  key={`${result.type}-${result.slug}`}
                  href={href}
                  onClick={() => {
                    setIsOpen(false);
                    setQuery('');
                  }}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                    i === highlightIndex ? 'bg-gray-800' : 'hover:bg-gray-800/60'
                  } ${i < results.length - 1 ? 'border-b border-gray-800/60' : ''}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-base shrink-0 overflow-hidden">
                    {result.type === 'pokemon' && result.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={result.imageUrl} alt={result.name} className="w-full h-full object-contain" />
                    ) : (
                      <span>{result.sport ? (sportIcons[result.sport] ?? '🃏') : '⚡'}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm font-medium truncate">{result.name}</p>
                    <p className="text-gray-500 text-xs truncate">
                      {result.set}
                      {result.year && ` · ${result.year}`}
                      {result.rookie && ' · RC'}
                      {result.type === 'pokemon' && <span className="text-yellow-600"> · Pokémon</span>}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-emerald-400 text-xs font-semibold">{result.price.split('(')[0].trim()}</p>
                    {result.sport && (
                      <p className="text-gray-600 text-xs capitalize">{result.sport}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
          {/* View all link */}
          <div className="border-t border-gray-800 px-4 py-2.5">
            <button
              onClick={() => {
                router.push(`/price-guide?q=${encodeURIComponent(query)}`);
                setIsOpen(false);
              }}
              className="text-emerald-400 hover:text-emerald-300 text-xs font-medium transition-colors"
            >
              View all results for &ldquo;{query}&rdquo; →
            </button>
          </div>
        </div>
      )}

      {/* No results */}
      {isOpen && query.length >= 2 && results.length === 0 && (
        <div className="absolute z-50 w-full bg-gray-900 border border-emerald-500/30 border-t-0 rounded-b-xl shadow-2xl shadow-black/60 px-4 py-4">
          <p className="text-gray-500 text-sm">No cards found for &ldquo;{query}&rdquo;</p>
          <p className="text-gray-600 text-xs mt-1">Try searching by player name, card name, or set</p>
        </div>
      )}
    </div>
  );
}

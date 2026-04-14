'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import CardFrame from '@/components/CardFrame';
import { sportsCards } from '@/data/sports-cards';

const STORAGE_KEY = 'cardvault-showcase';
const MAX_CARDS = 9;

function encodeShowcase(slugs: string[], name: string): string {
  return btoa(JSON.stringify({ s: slugs, n: name }));
}

function decodeShowcase(hash: string): { slugs: string[]; name: string } | null {
  try {
    const decoded = JSON.parse(atob(hash));
    return { slugs: decoded.s || [], name: decoded.n || '' };
  } catch {
    return null;
  }
}

const sportIcons: Record<string, string> = {
  baseball: '⚾',
  basketball: '🏀',
  football: '🏈',
  hockey: '🏒',
};

export default function ShowcaseClient() {
  const [mounted, setMounted] = useState(false);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [displayName, setDisplayName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [viewName, setViewName] = useState('');

  useEffect(() => {
    setMounted(true);

    // Check for shared showcase in URL hash
    const hash = window.location.hash;
    if (hash.startsWith('#showcase=')) {
      const encoded = hash.slice('#showcase='.length);
      const data = decodeShowcase(encoded);
      if (data) {
        setSelectedSlugs(data.slugs);
        setViewName(data.name);
        setIsViewing(true);
        return;
      }
    }

    // Load from localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSelectedSlugs(parsed.slugs || []);
        setDisplayName(parsed.name || '');
      }
    } catch {}
  }, []);

  // Save to localStorage when selection changes
  useEffect(() => {
    if (!mounted || isViewing) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ slugs: selectedSlugs, name: displayName }));
    } catch {}
  }, [selectedSlugs, displayName, mounted, isViewing]);

  const selectedCards = useMemo(() => {
    return selectedSlugs
      .map(slug => sportsCards.find(c => c.slug === slug))
      .filter(Boolean) as typeof sportsCards;
  }, [selectedSlugs]);

  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return sportsCards
      .filter(c =>
        c.player.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.set.toLowerCase().includes(q)
      )
      .filter(c => !selectedSlugs.includes(c.slug))
      .slice(0, 8);
  }, [searchQuery, selectedSlugs]);

  const totalValue = useMemo(() => {
    return selectedCards.reduce((sum, card) => {
      const match = card.estimatedValueRaw.match(/\$([\d,]+)/);
      return sum + (match ? parseInt(match[1].replace(/,/g, ''), 10) : 0);
    }, 0);
  }, [selectedCards]);

  function addCard(slug: string) {
    if (selectedSlugs.length >= MAX_CARDS) return;
    setSelectedSlugs(prev => [...prev, slug]);
    setSearchQuery('');
  }

  function removeCard(slug: string) {
    setSelectedSlugs(prev => prev.filter(s => s !== slug));
  }

  function shareShowcase() {
    const encoded = encodeShowcase(selectedSlugs, displayName);
    const url = `${window.location.origin}/showcase#showcase=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function shareToX() {
    const cardNames = selectedCards.slice(0, 3).map(c => c.player).join(', ');
    const more = selectedCards.length > 3 ? ` and ${selectedCards.length - 3} more` : '';
    const text = `Check out my CardVault showcase! ${cardNames}${more} - $${totalValue.toLocaleString()} estimated value`;
    const encoded = encodeShowcase(selectedSlugs, displayName);
    const url = `${window.location.origin}/showcase#showcase=${encoded}`;
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  }

  function buildMyOwn() {
    window.location.hash = '';
    setIsViewing(false);
    setSelectedSlugs([]);
    setDisplayName('');
    setViewName('');
  }

  const showcaseName = isViewing ? (viewName || 'A Collector') : (displayName || 'My Showcase');

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-300">Showcase</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {isViewing ? `${showcaseName}'s Trophy Case` : 'My Trophy Case'}
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {isViewing
                ? `Viewing a shared collection of ${selectedCards.length} cards`
                : `Curate your top ${MAX_CARDS} cards. Share your showcase with anyone.`
              }
            </p>
          </div>
          {isViewing && (
            <button
              onClick={buildMyOwn}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              Build My Own
            </button>
          )}
        </div>

        {/* Stats bar */}
        {selectedCards.length > 0 && (
          <div className="flex flex-wrap items-center gap-6 bg-gray-900 border border-gray-800 rounded-xl px-5 py-3 mb-8">
            <div>
              <p className="text-gray-500 text-xs">Cards</p>
              <p className="text-white font-bold">{selectedCards.length}/{MAX_CARDS}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Est. Value</p>
              <p className="text-emerald-400 font-bold">${totalValue.toLocaleString()}+</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Sports</p>
              <p className="text-white font-bold">
                {[...new Set(selectedCards.map(c => c.sport))].map(s => sportIcons[s] || s).join(' ')}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Year Range</p>
              <p className="text-white font-bold">
                {Math.min(...selectedCards.map(c => c.year))}–{Math.max(...selectedCards.map(c => c.year))}
              </p>
            </div>
            {!isViewing && selectedCards.length > 0 && (
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={shareShowcase}
                  className="inline-flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium px-4 py-2 rounded-lg border border-gray-700 transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
                <button
                  onClick={shareToX}
                  className="inline-flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium px-4 py-2 rounded-lg border border-gray-700 transition-colors"
                >
                  Share to X
                </button>
              </div>
            )}
          </div>
        )}

        {/* Display case grid */}
        {selectedCards.length > 0 && (
          <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 border border-gray-700 rounded-2xl p-6 sm:p-8 mb-8">
            {!isViewing && displayName === '' && (
              <div className="mb-6">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Name your showcase (optional)"
                  className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm w-full max-w-xs focus:border-emerald-500 focus:outline-none transition-colors placeholder:text-gray-600"
                />
              </div>
            )}
            {displayName && !isViewing && (
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl font-bold text-white">{displayName}</h2>
                <button onClick={() => setDisplayName('')} className="text-gray-500 hover:text-gray-400 text-xs">edit</button>
              </div>
            )}
            <div className={`grid gap-4 ${
              selectedCards.length <= 3
                ? 'grid-cols-1 sm:grid-cols-3'
                : selectedCards.length <= 6
                ? 'grid-cols-2 sm:grid-cols-3'
                : 'grid-cols-3'
            }`}>
              {selectedCards.map((card, i) => (
                <div key={card.slug} className="relative group">
                  <Link href={`/sports/${card.slug}`}>
                    <div className="bg-gray-950/50 border border-gray-800 rounded-xl p-4 hover:border-emerald-700/50 transition-all">
                      <div className="flex justify-center mb-3">
                        <div className="w-28 sm:w-32">
                          <CardFrame card={card} size="large" />
                        </div>
                      </div>
                      <p className="text-white text-xs font-semibold text-center truncate">{card.player}</p>
                      <p className="text-gray-500 text-xs text-center truncate">{card.year} {card.set.split(' ').slice(1, 3).join(' ')}</p>
                      <p className="text-emerald-400 text-xs font-bold text-center mt-1">{card.estimatedValueRaw}</p>
                    </div>
                  </Link>
                  {!isViewing && (
                    <button
                      onClick={() => removeCard(card.slug)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-900/80 hover:bg-red-800 border border-red-700 rounded-full flex items-center justify-center text-red-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      x
                    </button>
                  )}
                </div>
              ))}
              {/* Empty slots */}
              {!isViewing && Array.from({ length: MAX_CARDS - selectedCards.length }).map((_, i) => (
                <div key={`empty-${i}`} className="border-2 border-dashed border-gray-800 rounded-xl p-4 flex items-center justify-center min-h-[200px]">
                  <p className="text-gray-700 text-xs text-center">
                    {selectedCards.length === 0 && i === 0
                      ? 'Search below to add cards'
                      : `Slot ${selectedCards.length + i + 1}`
                    }
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search to add cards (only in edit mode) */}
        {!isViewing && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-white mb-3">
              {selectedCards.length === 0 ? 'Search for cards to build your showcase' : 'Add more cards'}
            </h2>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by player, card name, or set..."
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 focus:outline-none transition-colors placeholder:text-gray-600"
                disabled={selectedSlugs.length >= MAX_CARDS}
              />
              {selectedSlugs.length >= MAX_CARDS && (
                <p className="text-amber-400 text-xs mt-2">Trophy case is full ({MAX_CARDS} cards max). Remove a card to add another.</p>
              )}
            </div>
            {searchResults.length > 0 && (
              <div className="mt-2 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                {searchResults.map(card => (
                  <button
                    key={card.slug}
                    onClick={() => addCard(card.slug)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors text-left border-b border-gray-800 last:border-0"
                  >
                    <span className="text-lg shrink-0">{sportIcons[card.sport] || ''}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-medium truncate">{card.name}</p>
                      <p className="text-gray-500 text-xs">{card.player} · {card.year}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-emerald-400 text-xs font-bold">{card.estimatedValueRaw}</p>
                      <p className="text-gray-600 text-xs">+ Add</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Showcase suggestions for empty state */}
        {!isViewing && selectedCards.length === 0 && mounted && (
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-400 mb-3">Popular showcase themes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { title: 'GOAT Collection', desc: 'Jordan, Mantle, Brady, Gretzky, LeBron', slugs: ['1986-87-fleer-michael-jordan-57', '1952-topps-mickey-mantle-311', '2000-playoff-contenders-tom-brady-144', '1979-80-opee-chee-wayne-gretzky-18', '2003-04-topps-chrome-lebron-james-111'] },
                { title: 'Modern Rookies', desc: 'Wemby, Luka, Mahomes, McDavid', slugs: ['2022-23-panini-prizm-victor-wembanyama-258', '2018-19-panini-prizm-luka-doncic-280', '2017-panini-prizm-patrick-mahomes-269', '2015-16-upper-deck-connor-mcdavid-201'] },
                { title: 'Pre-War Legends', desc: 'Wagner, Ruth, Gehrig, Cobb', slugs: ['1909-t206-honus-wagner', '1933-goudey-babe-ruth-53', '1933-goudey-lou-gehrig-92', '1909-t206-ty-cobb'] },
              ].map(theme => (
                <button
                  key={theme.title}
                  onClick={() => {
                    const valid = theme.slugs.filter(s => sportsCards.some(c => c.slug === s));
                    setSelectedSlugs(valid);
                  }}
                  className="text-left bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-emerald-700/50 transition-all"
                >
                  <p className="text-white text-sm font-bold">{theme.title}</p>
                  <p className="text-gray-500 text-xs mt-1">{theme.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Related features */}
        <div className="border-t border-gray-800 pt-8">
          <h3 className="text-sm font-bold text-gray-400 mb-3">Related</h3>
          <div className="flex flex-wrap gap-3">
            {[
              { href: '/collection', label: 'My Collection', desc: 'Track what you own by set' },
              { href: '/tools/collection-value', label: 'Collection Value', desc: 'Calculate your total value' },
              { href: '/tools/head-to-head', label: 'Head-to-Head', desc: 'Compare any two cards' },
              { href: '/tools/watchlist', label: 'Price Watchlist', desc: 'Track price movements' },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="flex-1 min-w-[180px] bg-gray-900 border border-gray-800 rounded-xl p-3 hover:border-emerald-700/50 transition-all"
              >
                <p className="text-white text-sm font-medium">{link.label}</p>
                <p className="text-gray-500 text-xs">{link.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards, SportsCard } from '@/data/sports-cards';

const sportIcons: Record<string, string> = {
  baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒',
};

function scoreCard(card: SportsCard, tokens: string[]): number {
  let score = 0;
  const name = card.name.toLowerCase();
  const player = card.player.toLowerCase();
  const set = card.set.toLowerCase();
  const desc = card.description.toLowerCase();
  const yearStr = card.year.toString();

  for (const token of tokens) {
    if (player.includes(token)) score += 10;
    if (name.includes(token)) score += 5;
    if (set.includes(token)) score += 3;
    if (desc.includes(token)) score += 1;
    if (yearStr === token) score += 8;
    if (card.sport === token) score += 6;
    if (card.cardNumber?.toLowerCase() === token) score += 12;
    if (token === 'rookie' && card.rookie) score += 8;
    if (token === 'rc' && card.rookie) score += 8;
  }

  return score;
}

export default function CardIdentifier() {
  const [query, setQuery] = useState('');
  const [sportFilter, setSportFilter] = useState<string>('all');

  const results = useMemo(() => {
    if (query.length < 3) return [];
    const tokens = query.toLowerCase().split(/\s+/).filter(t => t.length >= 2);
    if (tokens.length === 0) return [];

    let cards = sportsCards;
    if (sportFilter !== 'all') {
      cards = cards.filter(c => c.sport === sportFilter);
    }

    const scored = cards
      .map(card => ({ card, score: scoreCard(card, tokens) }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);

    return scored;
  }, [query, sportFilter]);

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Describe Your Card</h2>
        <p className="text-gray-400 text-sm mb-4">
          Type anything you know: player name, year, set name, card number, sport, &quot;rookie&quot; — we&apos;ll find the closest matches.
        </p>

        {/* Sport filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          {['all', 'baseball', 'basketball', 'football', 'hockey'].map(s => (
            <button
              key={s}
              onClick={() => setSportFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sportFilter === s
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              {s === 'all' ? 'All Sports' : `${sportIcons[s]} ${s.charAt(0).toUpperCase() + s.slice(1)}`}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='e.g. "Mike Trout 2009 Bowman Chrome rookie" or "Jordan 1986 Fleer"'
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        <p className="text-gray-600 text-xs mt-2">
          Try: player names, years, set names (Topps, Prizm, Upper Deck), card numbers, or &quot;rookie&quot;
        </p>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-white font-bold text-sm">
            {results.length} match{results.length !== 1 ? 'es' : ''} found
          </h3>
          {results.map(({ card, score }) => (
            <Link
              key={card.slug}
              href={`/sports/${card.slug}`}
              className="block bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-600 transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{sportIcons[card.sport]}</span>
                    <span className="text-white font-semibold text-sm group-hover:text-emerald-400 transition-colors truncate">{card.player}</span>
                    {card.rookie && (
                      <span className="shrink-0 text-xs bg-amber-900/40 text-amber-400 px-1.5 py-0.5 rounded font-medium">RC</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs truncate">{card.name}</p>
                  <p className="text-gray-500 text-xs mt-1">{card.set} &middot; {card.year}{card.cardNumber ? ` &middot; #${card.cardNumber}` : ''}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-gray-400 text-xs mb-0.5">Raw</p>
                  <p className="text-white text-sm font-medium">{card.estimatedValueRaw}</p>
                  <p className="text-gray-400 text-xs mt-1 mb-0.5">Gem</p>
                  <p className="text-emerald-400 text-sm font-medium">{card.estimatedValueGem}</p>
                </div>
              </div>
              <p className="text-gray-600 text-xs mt-2 line-clamp-2">{card.description}</p>
            </Link>
          ))}
        </div>
      )}

      {query.length >= 3 && results.length === 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
          <p className="text-gray-400 text-sm mb-2">No matches found for &quot;{query}&quot;</p>
          <p className="text-gray-600 text-xs">Try different keywords, check spelling, or search for the player name only.</p>
          <a
            href={`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&_sacat=212&LH_Sold=1`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-xl text-sm font-medium transition-colors"
          >
            Search eBay Sold Listings
          </a>
        </div>
      )}

      {/* Tips */}
      {query.length < 3 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-white font-bold text-lg mb-4">Search Tips</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { example: '"Trout 2009 Bowman"', desc: 'Player + year + set name — most specific' },
              { example: '"Jordan rookie"', desc: 'Player + "rookie" to find RC cards' },
              { example: '"2024 Prizm football"', desc: 'Year + set + sport for recent releases' },
              { example: '"Wembanyama 275"', desc: 'Player + card number for exact match' },
              { example: '"1986 Fleer basketball"', desc: 'Vintage set + sport' },
              { example: '"Mahomes"', desc: 'Just a player name to see all their cards' },
            ].map(tip => (
              <button
                key={tip.example}
                onClick={() => setQuery(tip.example.replace(/"/g, ''))}
                className="text-left bg-gray-800/50 rounded-xl p-3 hover:bg-gray-800 transition-colors"
              >
                <p className="text-emerald-400 text-sm font-medium">{tip.example}</p>
                <p className="text-gray-500 text-xs mt-0.5">{tip.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

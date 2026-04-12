'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards, type SportsCard } from '@/data/sports-cards';
import { getGradePricing } from '@/data/grade-pricing';

const PSA_GRADES = ['Raw', 'PSA 1', 'PSA 2', 'PSA 3', 'PSA 4', 'PSA 5', 'PSA 6', 'PSA 7', 'PSA 8', 'PSA 9', 'PSA 10'];

const SPORTS = [
  { value: '', label: 'All Sports' },
  { value: 'baseball', label: 'Baseball' },
  { value: 'basketball', label: 'Basketball' },
  { value: 'football', label: 'Football' },
  { value: 'hockey', label: 'Hockey' },
];

interface LookupResult {
  card: SportsCard;
  value: string;
  grade: string;
  hasFullData: boolean;
}

function getValueForGrade(card: SportsCard, gradeLabel: string): string {
  if (gradeLabel === 'Raw') {
    return card.estimatedValueRaw;
  }
  const pricing = getGradePricing(card.slug);
  if (pricing) {
    const gradeNum = parseInt(gradeLabel.replace('PSA ', ''));
    const row = pricing.grades.find(g => g.grade === gradeNum);
    if (row) return row.estimatedValue;
  }
  // Fallback: approximate from raw/gem values
  const gradeNum = parseInt(gradeLabel.replace('PSA ', ''));
  if (gradeNum >= 9) return card.estimatedValueGem;
  if (gradeNum >= 7) return card.estimatedValueRaw;
  return 'Contact dealer for estimate';
}

export default function CardLookup() {
  const [query, setQuery] = useState('');
  const [sport, setSport] = useState('');
  const [grade, setGrade] = useState('PSA 8');
  const [searched, setSearched] = useState(false);

  const results: LookupResult[] = useMemo(() => {
    if (!query.trim() && !sport) return [];

    const q = query.toLowerCase().trim();

    return sportsCards
      .filter(card => {
        const matchesSport = !sport || card.sport === sport;
        if (!q) return matchesSport;
        const matchesQuery =
          card.player.toLowerCase().includes(q) ||
          card.name.toLowerCase().includes(q) ||
          card.set.toLowerCase().includes(q) ||
          card.year.toString().includes(q);
        return matchesSport && matchesQuery;
      })
      .slice(0, 12)
      .map(card => ({
        card,
        value: getValueForGrade(card, grade),
        grade,
        hasFullData: !!getGradePricing(card.slug),
      }));
  }, [query, sport, grade]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
  };

  const sportIcons: Record<string, string> = {
    baseball: '⚾',
    basketball: '🏀',
    football: '🏈',
    hockey: '🏒',
  };

  return (
    <div id="lookup" className="scroll-mt-20">
      {/* Lookup form */}
      <form onSubmit={handleSearch} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Player/card name */}
          <div className="lg:col-span-2">
            <label className="block text-gray-400 text-xs font-medium mb-1.5">Player or Card Name</label>
            <input
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setSearched(false); }}
              placeholder="e.g. Michael Jordan, Trout, Gretzky..."
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 placeholder-gray-500"
            />
          </div>

          {/* Sport */}
          <div>
            <label className="block text-gray-400 text-xs font-medium mb-1.5">Sport / Category</label>
            <select
              value={sport}
              onChange={e => setSport(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
            >
              {SPORTS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Grade */}
          <div>
            <label className="block text-gray-400 text-xs font-medium mb-1.5">Grade</label>
            <select
              value={grade}
              onChange={e => setGrade(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
            >
              {PSA_GRADES.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          Get Instant Estimate
        </button>
      </form>

      {/* Results */}
      {searched && (
        <div>
          {results.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
              <p className="text-gray-400 text-sm mb-2">No cards found matching your search.</p>
              <p className="text-gray-600 text-xs">Try searching by player name, year, or set name.</p>
              <Link href="/sports" className="inline-block mt-4 text-emerald-400 hover:text-emerald-300 text-sm transition-colors">
                Browse all sports cards →
              </Link>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400 text-sm">
                  {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{grade}&rdquo; grade
                </p>
                <p className="text-gray-600 text-xs">Values are estimates based on recent sold comps</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map(result => (
                  <Link key={result.card.slug} href={`/sports/${result.card.slug}`} className="group block">
                    <div className="bg-gray-900 border border-gray-800 hover:border-emerald-500/40 rounded-2xl p-5 transition-all hover:-translate-y-0.5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{sportIcons[result.card.sport]}</span>
                            {result.card.rookie && (
                              <span className="text-xs font-bold text-amber-400 bg-amber-900/30 px-1.5 py-0.5 rounded">RC</span>
                            )}
                          </div>
                          <h3 className="text-white font-semibold text-sm group-hover:text-emerald-400 transition-colors leading-snug truncate">
                            {result.card.player}
                          </h3>
                          <p className="text-gray-500 text-xs truncate">{result.card.set}</p>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <p className="text-xs text-gray-500 mb-0.5">{result.grade}</p>
                          <p className="text-emerald-400 font-bold text-sm">{result.value}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-gray-600 text-xs">{result.card.year}</p>
                        {result.hasFullData ? (
                          <span className="text-xs text-emerald-600">Full grade table available →</span>
                        ) : (
                          <span className="text-xs text-gray-600">View full profile →</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {results.length >= 12 && (
                <p className="text-gray-500 text-xs text-center mt-4">
                  Showing top 12 results. <Link href="/sports" className="text-emerald-400 hover:text-emerald-300">Browse full catalog →</Link>
                </p>
              )}
              <div className="mt-4 bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                <p className="text-gray-600 text-xs">
                  All values are estimates based on recent eBay sold comps, PWCC, Heritage, and Goldin auction results.
                  Actual value depends on centering, surface quality, and current market conditions. For precise valuations,
                  consult PSA&apos;s SMR price guide or recent eBay sold listings.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {!searched && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Try: Michael Jordan', q: 'Jordan', sport: 'basketball' },
            { label: 'Try: Gretzky PSA 9', q: 'Gretzky', sport: 'hockey' },
            { label: 'Try: Tom Brady RC', q: 'Brady', sport: 'football' },
            { label: 'Try: Mike Trout', q: 'Trout', sport: 'baseball' },
          ].map(example => (
            <button
              key={example.label}
              onClick={() => {
                setQuery(example.q);
                setSport(example.sport);
                setSearched(true);
              }}
              className="text-left bg-gray-900 border border-gray-800 hover:border-emerald-500/40 rounded-xl p-3 transition-all"
            >
              <p className="text-emerald-400 text-xs font-medium">{example.label}</p>
              <p className="text-gray-600 text-xs mt-0.5">Quick example</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

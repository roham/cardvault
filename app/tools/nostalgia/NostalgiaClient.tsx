'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

function parseValue(raw: string): number {
  const m = raw.match(/\$[\d,]+/);
  if (!m) return 0;
  return parseInt(m[0].replace(/[$,]/g, ''), 10);
}

const SPORT_COLORS: Record<string, string> = {
  baseball: 'text-red-400',
  basketball: 'text-orange-400',
  football: 'text-blue-400',
  hockey: 'text-cyan-400',
};

const SPORT_BG: Record<string, string> = {
  baseball: 'bg-red-950/40 border-red-800/40',
  basketball: 'bg-orange-950/40 border-orange-800/40',
  football: 'bg-blue-950/40 border-blue-800/40',
  hockey: 'bg-cyan-950/40 border-cyan-800/40',
};

const ERA_INFO: Record<string, { name: string; description: string; color: string }> = {
  'pre-war': { name: 'Pre-War Era', description: 'Tobacco cards, Goudey, Play Ball. The dawn of card collecting. These cards are museum pieces.', color: 'text-amber-400' },
  'post-war': { name: 'Post-War Vintage', description: 'Bowman and early Topps. Baseball dominated. Cards came with gum. Condition is everything.', color: 'text-yellow-400' },
  'vintage': { name: 'Classic Vintage', description: 'Topps monopoly era. Iconic designs like 1952 Topps, 1969 Topps. The golden age of baseball cards.', color: 'text-orange-400' },
  'early-modern': { name: 'Early Modern', description: 'Competition arrives. Fleer, Donruss enter the market. The hobby starts growing beyond just kids.', color: 'text-green-400' },
  'junk-wax': { name: 'Junk Wax Era', description: 'Mass production explosion. Everyone collected. Print runs in the millions. Most cards from this era have minimal value, but the rookies are iconic.', color: 'text-red-400' },
  'insert': { name: 'Insert Era', description: 'Refractors, die-cuts, serial numbers. Chrome, Finest, SPx. The hobby reinvented itself with chase cards and parallels.', color: 'text-purple-400' },
  'modern': { name: 'Modern Era', description: 'Panini enters. Prizm debuts. Autographs and memorabilia cards everywhere. The investor era begins.', color: 'text-blue-400' },
  'ultra-modern': { name: 'Ultra-Modern', description: 'COVID boom. Card prices skyrocket. Breaks go mainstream. Everyone is a card investor. Prizm, Optic, and Chrome dominate.', color: 'text-cyan-400' },
};

function getEra(year: number): string {
  if (year < 1946) return 'pre-war';
  if (year < 1957) return 'post-war';
  if (year < 1981) return 'vintage';
  if (year < 1987) return 'early-modern';
  if (year < 1994) return 'junk-wax';
  if (year < 2005) return 'insert';
  if (year < 2020) return 'modern';
  return 'ultra-modern';
}

function getCollectingContext(startYear: number, endYear: number): string[] {
  const contexts: string[] = [];
  for (let y = startYear; y <= endYear; y++) {
    if (y === 1952) contexts.push('1952 Topps — the most iconic baseball card set ever produced');
    if (y === 1986) contexts.push('1986 Fleer Basketball — Michael Jordan rookie year');
    if (y === 1989) contexts.push('1989 Upper Deck — premium cards arrive, Ken Griffey Jr. #1');
    if (y === 1993) contexts.push('1993 SP Foil — Derek Jeter rookie, holy grail of modern baseball');
    if (y === 1996) contexts.push('1996 Topps Chrome — refractors change everything');
    if (y === 1998) contexts.push('1998 — Sosa vs McGwire home run chase electrifies baseball cards');
    if (y === 2003) contexts.push('2003 Topps Chrome — LeBron James rookie class arrives');
    if (y === 2009) contexts.push('2009 — Mike Trout drafted, Stephen Curry enters NBA');
    if (y === 2012) contexts.push('2012 Panini Prizm — the modern chase card is born');
    if (y === 2017) contexts.push('2017 — Patrick Mahomes, Shohei Ohtani debut year cards');
    if (y === 2020) contexts.push('2020 — COVID lockdowns ignite the card collecting boom');
    if (y === 2023) contexts.push('2023 — Victor Wembanyama mania, Connor Bedard NHL arrival');
  }
  return contexts;
}

export default function NostalgiaClient() {
  const [birthYear, setBirthYear] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);

  const goldenStart = birthYear ? birthYear + 8 : 0;
  const goldenEnd = birthYear ? birthYear + 14 : 0;

  const results = useMemo(() => {
    if (!birthYear) return null;

    const eraCards = sportsCards.filter(c => c.year >= goldenStart && c.year <= goldenEnd);
    const sorted = [...eraCards].sort((a, b) => parseValue(b.estimatedValueRaw) - parseValue(a.estimatedValueRaw));
    const topCards = sorted.slice(0, 20);
    const rookies = eraCards.filter(c => c.rookie);
    const topRookies = [...rookies].sort((a, b) => parseValue(b.estimatedValueRaw) - parseValue(a.estimatedValueRaw)).slice(0, 10);

    const sportCounts: Record<string, number> = {};
    eraCards.forEach(c => { sportCounts[c.sport] = (sportCounts[c.sport] || 0) + 1; });

    const totalValue = topCards.slice(0, 10).reduce((sum, c) => sum + parseValue(c.estimatedValueRaw), 0);
    const totalGemValue = topCards.slice(0, 10).reduce((sum, c) => sum + parseValue(c.estimatedValueGem), 0);

    const uniquePlayers = new Set(eraCards.map(c => c.player));
    const uniqueSets = new Set(eraCards.map(c => c.set));

    const dominantEra = getEra(Math.floor((goldenStart + goldenEnd) / 2));
    const eraInfo = ERA_INFO[dominantEra];

    const contexts = getCollectingContext(goldenStart, goldenEnd);

    return {
      eraCards,
      topCards,
      topRookies,
      sportCounts,
      totalValue,
      totalGemValue,
      uniquePlayers: uniquePlayers.size,
      uniqueSets: uniqueSets.size,
      dominantEra: eraInfo,
      contexts,
      cardCount: eraCards.length,
    };
  }, [birthYear, goldenStart, goldenEnd]);

  const handleGenerate = () => {
    if (birthYear) setShowResults(true);
  };

  const shareText = results && birthYear
    ? `My card collecting golden years were ${goldenStart}-${goldenEnd} (${results.dominantEra.name}). ${results.cardCount} cards from my era worth up to $${results.totalGemValue.toLocaleString()} in gem mint! What's YOUR era? cardvault-two.vercel.app/tools/nostalgia`
    : '';

  return (
    <div>
      {/* Birth Year Input */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Enter Your Birth Year</h2>
        <p className="text-gray-400 text-sm mb-6">
          We&apos;ll show you the cards from your collecting golden years (ages 8-14) &mdash; when card collecting hits hardest.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm text-gray-400 mb-2">Birth Year</label>
            <select
              value={birthYear || ''}
              onChange={(e) => { setBirthYear(parseInt(e.target.value, 10)); setShowResults(false); }}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Select your birth year...</option>
              {Array.from({ length: 66 }, (_, i) => 2015 - i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleGenerate}
            disabled={!birthYear}
            className="px-8 py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-lg transition-colors"
          >
            Discover My Era
          </button>
        </div>

        {birthYear && !showResults && (
          <p className="mt-4 text-gray-500 text-sm">
            Your golden years: <span className="text-amber-400 font-medium">{goldenStart}&ndash;{goldenEnd}</span>
          </p>
        )}
      </div>

      {/* Results */}
      {showResults && results && birthYear && (
        <div className="space-y-8">
          {/* Era Header */}
          <div className="bg-gradient-to-r from-amber-950/60 to-gray-900/80 border border-amber-800/40 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">&#x1F4C5;</span>
              <div>
                <h2 className="text-2xl font-bold text-white">Your Golden Years: {goldenStart}&ndash;{goldenEnd}</h2>
                <p className={`text-sm font-medium ${results.dominantEra.color}`}>{results.dominantEra.name}</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm">{results.dominantEra.description}</p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Cards From Your Era', value: results.cardCount.toLocaleString() },
              { label: 'Players', value: results.uniquePlayers.toLocaleString() },
              { label: 'Sets', value: results.uniqueSets.toLocaleString() },
              { label: 'Top 10 Gem Value', value: `$${results.totalGemValue.toLocaleString()}` },
            ].map(s => (
              <div key={s.label} className="bg-gray-900/80 border border-gray-800 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-amber-400">{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Key Moments */}
          {results.contexts.length > 0 && (
            <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Key Moments From Your Era</h3>
              <div className="space-y-2">
                {results.contexts.map((ctx, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-amber-400 mt-0.5">&#x2605;</span>
                    <p className="text-gray-300 text-sm">{ctx}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sport Breakdown */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Sport Breakdown</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(results.sportCounts).sort((a, b) => b[1] - a[1]).map(([sport, count]) => (
                <div key={sport} className={`border rounded-lg p-3 text-center ${SPORT_BG[sport] || 'bg-gray-800 border-gray-700'}`}>
                  <div className={`text-lg font-bold ${SPORT_COLORS[sport] || 'text-gray-300'}`}>{count}</div>
                  <div className="text-xs text-gray-400 capitalize">{sport}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Cards */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Most Valuable Cards From Your Era</h3>
            <div className="space-y-3">
              {results.topCards.slice(0, 12).map((card, i) => (
                <Link key={card.slug} href={`/sports/${card.slug}`} className="flex items-center gap-4 p-3 bg-gray-800/60 hover:bg-gray-800 border border-gray-700/50 rounded-lg transition-colors">
                  <div className="w-8 h-8 rounded-full bg-amber-900/60 border border-amber-700/50 flex items-center justify-center text-sm font-bold text-amber-400">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white text-sm truncate">{card.name}</div>
                    <div className="text-xs text-gray-500">{card.player} &middot; {card.year} &middot; {card.set}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-medium text-green-400">{card.estimatedValueGem}</div>
                    <div className="text-xs text-gray-500">Raw: {card.estimatedValueRaw}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${SPORT_BG[card.sport] || ''} ${SPORT_COLORS[card.sport] || 'text-gray-400'}`}>
                    {card.sport}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Top Rookies */}
          {results.topRookies.length > 0 && (
            <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Top Rookie Cards From Your Era</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {results.topRookies.map(card => (
                  <Link key={card.slug} href={`/sports/${card.slug}`} className="flex items-center gap-3 p-3 bg-gray-800/60 hover:bg-gray-800 border border-gray-700/50 rounded-lg transition-colors">
                    <div className="w-2 h-8 rounded-full bg-amber-500/80 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm truncate">{card.player}</div>
                      <div className="text-xs text-gray-500">{card.year} {card.set} #{card.cardNumber}</div>
                    </div>
                    <div className="text-sm font-medium text-green-400 shrink-0">{card.estimatedValueGem}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* What If Portfolio */}
          <div className="bg-gradient-to-r from-green-950/40 to-gray-900/80 border border-green-800/40 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-2">What If You Kept Your Childhood Cards?</h3>
            <p className="text-gray-400 text-sm mb-4">
              If you had the top 10 cards from your era in raw condition, they&apos;d be worth:
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-gray-900/80 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">${results.totalValue.toLocaleString()}</div>
                <div className="text-xs text-gray-500">Raw Condition</div>
              </div>
              <div className="bg-gray-900/80 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-amber-400">${results.totalGemValue.toLocaleString()}</div>
                <div className="text-xs text-gray-500">Gem Mint (PSA 10 / BGS 9.5)</div>
              </div>
            </div>
            <p className="text-gray-500 text-xs mt-3">
              *Based on estimated market values for the top 10 most valuable cards from {goldenStart}&ndash;{goldenEnd} in our database.
            </p>
          </div>

          {/* Share */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-3">Share Your Era</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigator.clipboard.writeText(shareText)}
                className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm rounded-lg transition-colors"
              >
                Copy to Clipboard
              </button>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2.5 bg-blue-900/60 hover:bg-blue-900/80 border border-blue-700/50 text-blue-300 text-sm rounded-lg transition-colors text-center"
              >
                Share on X
              </a>
            </div>
          </div>

          {/* Explore Links */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Explore Your Era</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              {Array.from({ length: goldenEnd - goldenStart + 1 }, (_, i) => goldenStart + i).map(y => (
                <Link key={y} href={`/sports/years/${y}`} className="px-3 py-2 bg-gray-800/60 hover:bg-gray-800 border border-gray-700/50 rounded-lg text-sm text-gray-300 hover:text-white transition-colors text-center">
                  {y} Cards
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="mt-8 bg-gray-900/80 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Nostalgia Collecting Tips</h3>
        <div className="space-y-3">
          {[
            { title: 'Buy the Memories', tip: 'Cards you collected as a kid have emotional value beyond market price. Reuniting with childhood favorites is one of the best parts of the hobby.' },
            { title: 'Condition Matters More for Vintage', tip: 'Cards from the 1980s-1990s were often mishandled by kids. Finding your childhood cards in PSA 9-10 condition can be worth 10-50x the raw price.' },
            { title: 'Junk Wax Gems Exist', tip: 'If your era is 1987-1993, don\'t write off everything. Key rookies (Griffey, Jeter, Jordan) and error cards still command premium prices.' },
            { title: 'Complete Sets Are Underrated', tip: 'A complete set from your birth year or childhood era is a meaningful collection piece. Base set values have been climbing for 1990s and earlier sets.' },
          ].map(t => (
            <div key={t.title} className="flex items-start gap-3">
              <span className="text-amber-400 mt-1 shrink-0">&#x25B6;</span>
              <div>
                <span className="text-white text-sm font-medium">{t.title}:</span>{' '}
                <span className="text-gray-400 text-sm">{t.tip}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-8 grid sm:grid-cols-3 gap-3">
        {[
          { href: '/tools/era-guide', label: 'Era Guide', desc: 'Deep dive into every card era' },
          { href: '/tools/investment-calc', label: 'Investment Calculator', desc: 'Annualized card returns' },
          { href: '/tools/price-history', label: 'Price History', desc: '90-day price charts' },
          { href: '/tools/grading-roi', label: 'Grading ROI', desc: 'Should you grade it?' },
          { href: '/tools/rarity-score', label: 'Rarity Score', desc: 'How rare is your card?' },
          { href: '/tools/condition-grader', label: 'Condition Grader', desc: 'Self-grade your card' },
        ].map(t => (
          <Link key={t.href} href={t.href} className="p-3 bg-gray-900/80 hover:bg-gray-800 border border-gray-800 rounded-lg transition-colors">
            <div className="text-sm font-medium text-amber-400">{t.label}</div>
            <div className="text-xs text-gray-500">{t.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

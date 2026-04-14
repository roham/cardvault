'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';
import CardFrame from '@/components/CardFrame';

// Deterministic hash: same date → same card for everyone
function dateHash(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const ch = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0;
  }
  return Math.abs(hash);
}

// Filter to cards with rich data for a good daily feature
const featuredPool = sportsCards.filter(c => c.description.length > 80);

// Fun fact templates based on card properties
function generateTrivia(card: typeof sportsCards[0], dayOfYear: number): string[] {
  const facts: string[] = [];
  const era = card.year < 1941 ? 'pre-war' : card.year < 1970 ? 'vintage' : card.year < 2000 ? 'modern classic' : 'modern';

  facts.push(`This ${era} card is from the ${card.set} set.`);

  if (card.rookie) {
    facts.push(`This is a rookie card — the first major release for ${card.player}.`);
  }

  const yearAge = new Date().getFullYear() - card.year;
  if (yearAge > 50) {
    facts.push(`This card is over ${yearAge} years old — a true vintage collectible.`);
  } else if (yearAge > 20) {
    facts.push(`Released ${yearAge} years ago, this card has stood the test of time.`);
  }

  // Sport-specific facts
  const sportFacts: Record<string, string[]> = {
    baseball: [
      'Baseball cards are the oldest form of sports collectibles, dating back to the 1860s.',
      'The T206 set (1909-1911) is considered the most important vintage baseball card set.',
      'Topps has been the dominant baseball card manufacturer since 1952.',
    ],
    basketball: [
      'The 1986-87 Fleer set is considered the most important basketball card set ever.',
      'Basketball card collecting exploded in the early 1990s during the Jordan era.',
      'Panini Prizm has become the most popular modern basketball card brand.',
    ],
    football: [
      'The first football cards appeared in cigarette packs in the early 1900s.',
      'Rookie cards of quarterbacks typically command the highest premiums in football.',
      'The 2000 Playoff Contenders Tom Brady auto is the most valuable modern football card.',
    ],
    hockey: [
      'Upper Deck Young Guns are the most collected modern hockey rookie cards.',
      'The 1979-80 O-Pee-Chee Wayne Gretzky is the most valuable hockey card.',
      'Hockey cards are generally considered undervalued compared to other sports.',
    ],
  };

  const sportTrivia = sportFacts[card.sport] || [];
  if (sportTrivia.length > 0) {
    facts.push(sportTrivia[dayOfYear % sportTrivia.length]);
  }

  return facts;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function getDayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default function CardOfTheDayClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const today = new Date();
  const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  const hash = dateHash(dateStr);
  const cardIndex = hash % featuredPool.length;
  const card = featuredPool[cardIndex];
  const dayOfYear = getDayOfYear(today);
  const trivia = generateTrivia(card, dayOfYear);

  // Previous days (for "recent" section)
  const recentDays: Array<{ date: Date; card: typeof sportsCards[0] }> = [];
  for (let i = 1; i <= 6; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    const h = dateHash(ds);
    const idx = h % featuredPool.length;
    recentDays.push({ date: d, card: featuredPool[idx] });
  }

  if (!mounted) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-800 rounded w-48 mb-4" />
        <div className="h-64 bg-gray-800 rounded-2xl mb-6" />
        <div className="h-4 bg-gray-800 rounded w-96" />
      </div>
    );
  }

  const sportColors: Record<string, string> = {
    baseball: 'from-red-950/40 via-gray-900/40',
    basketball: 'from-orange-950/40 via-gray-900/40',
    football: 'from-blue-950/40 via-gray-900/40',
    hockey: 'from-cyan-950/40 via-gray-900/40',
  };

  const sportBadgeColors: Record<string, string> = {
    baseball: 'bg-red-900/60 text-red-400 border-red-700/40',
    basketball: 'bg-orange-900/60 text-orange-400 border-orange-700/40',
    football: 'bg-blue-900/60 text-blue-400 border-blue-700/40',
    hockey: 'bg-cyan-900/60 text-cyan-400 border-cyan-700/40',
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          Changes daily
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Card of the Day</h1>
        <p className="text-gray-400">{formatDate(today)}</p>
      </div>

      {/* Today's Card */}
      <div className={`bg-gradient-to-br ${sportColors[card.sport] || 'from-gray-900/40 via-gray-900/40'} to-gray-900/20 border border-gray-700/50 rounded-2xl p-6 sm:p-8 mb-8`}>
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Card visual */}
          <div className="sm:w-56 shrink-0">
            <CardFrame card={card} size="large" />
          </div>

          {/* Card details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${sportBadgeColors[card.sport]}`}>
                {card.sport.charAt(0).toUpperCase() + card.sport.slice(1)}
              </span>
              {card.rookie && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-emerald-900/60 text-emerald-400 border-emerald-700/40">
                  Rookie Card
                </span>
              )}
              <span className="text-gray-600 text-xs">{card.year}</span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-1">{card.name}</h2>
            <p className="text-gray-400 text-sm mb-4">{card.player} &middot; {card.set}</p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-800/60 rounded-xl p-3">
                <div className="text-gray-500 text-xs mb-1">Raw Value</div>
                <div className="text-emerald-400 text-sm font-semibold">{card.estimatedValueRaw}</div>
              </div>
              <div className="bg-gray-800/60 rounded-xl p-3">
                <div className="text-gray-500 text-xs mb-1">Gem Mint Value</div>
                <div className="text-amber-400 text-sm font-semibold">{card.estimatedValueGem}</div>
              </div>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed mb-4">{card.description}</p>

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/sports/${card.slug}`}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
              >
                View Full Card Details
              </Link>
              <a
                href={card.ebaySearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700"
              >
                Buy on eBay
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Trivia */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-amber-400">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          Did You Know?
        </h3>
        <ul className="space-y-2">
          {trivia.map((fact, i) => (
            <li key={i} className="text-gray-400 text-sm flex items-start gap-2">
              <span className="text-amber-400 mt-0.5 shrink-0">&bull;</span>
              {fact}
            </li>
          ))}
        </ul>
      </div>

      {/* Recent Days */}
      <div className="mb-8">
        <h3 className="text-white font-bold mb-4">Recent Days</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {recentDays.map(({ date, card: rc }) => (
            <Link
              key={date.toISOString()}
              href={`/sports/${rc.slug}`}
              className="group bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-3 transition-colors"
            >
              <div className="text-gray-600 text-xs mb-1">
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div className="text-white text-xs font-semibold leading-tight line-clamp-2 group-hover:text-emerald-400 transition-colors">
                {rc.name}
              </div>
              <div className="text-gray-500 text-xs mt-1 capitalize">{rc.sport}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-amber-950/40 to-gray-900/20 border border-amber-800/30 rounded-2xl p-6 text-center">
        <p className="text-amber-400 font-bold text-lg mb-1">Come back tomorrow!</p>
        <p className="text-gray-400 text-sm mb-4">A new featured card appears every day at midnight.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700"
          >
            Explore Tools
          </Link>
          <Link
            href="/tools/pack-sim"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            Open a Pack
          </Link>
        </div>
      </div>
    </>
  );
}

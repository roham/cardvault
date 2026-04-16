'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards, type SportsCard } from '@/data/sports-cards';

// ─── Helpers ─────────────────────────────────────────────────────────

function dateHash(d: Date): number {
  const s = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-today-in-cards`;
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; }
  return Math.abs(h);
}

function seededRng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

function todayStr(): string {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function parseValue(val: string): number {
  const m = val.match(/\$([0-9,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

const sportEmoji: Record<string, string> = {
  baseball: '\u26BE', basketball: '\uD83C\uDFC0', football: '\uD83C\uDFC8', hockey: '\uD83C\uDFD2',
};

const sportColors: Record<string, string> = {
  baseball: 'text-red-400', basketball: 'text-orange-400', football: 'text-blue-400', hockey: 'text-cyan-400',
};

const headlines = [
  'Rookie cards surge as playoffs heat up',
  'Vintage market shows steady appreciation',
  'New set releases driving hobby excitement',
  'Grading submissions reach record levels',
  'International collecting market expanding rapidly',
  'Card show attendance hits post-pandemic highs',
  'Digital tools transforming how collectors track values',
  'Prospect cards seeing increased pre-draft interest',
  'Sealed product demand outpacing supply',
  'Cross-sport collectors driving market diversification',
  'Autograph card demand at all-time high',
  'Modern rookie cards outperforming vintage this quarter',
  'PSA turnaround times improve, submission volume steady',
  'Card collecting influencers reaching millions of new hobbyists',
];

const tips = [
  'Buy raw cards you believe can grade PSA 9 or 10 — the grading uplift is where real ROI lives.',
  'Set a monthly hobby budget and stick to it. Card collecting should be fun, not stressful.',
  'Research completed eBay sales, not active listings. What something sold for matters more than asking price.',
  'Diversify across sports and eras. A well-balanced collection weathers market downturns better.',
  'Protect your investment: top loaders, penny sleeves, and proper storage are non-negotiable.',
  'Watch for buy-the-dip opportunities when players get injured or have a bad stretch.',
  'Pre-order sealed products early — hobby boxes often appreciate before release day.',
  'Grade your best cards, but only if the grading cost is less than 20% of the expected graded value.',
  'Build relationships at local card shops and shows. Deals happen in person, not just online.',
  'Follow prospect pipelines — the biggest RC spikes happen on debut day.',
  'Don\'t chase every parallel. Focus on base RCs and key numbered cards for long-term holds.',
  'Keep a want list and check it at every card show. Impulse buys kill budgets.',
  'Consider the player\'s career trajectory, not just their last game. Cards are long-term investments.',
  'Clean your card storage area regularly. Dust, humidity, and sunlight damage cards over time.',
];

// ─── Component ───────────────────────────────────────────────────────

export default function TodayInCardsClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const today = useMemo(() => {
    const seed = dateHash(new Date());
    const rng = seededRng(seed);

    // Card of the day
    const cotdIndex = Math.floor(rng() * sportsCards.length);
    const cardOfDay = sportsCards[cotdIndex];

    // Top movers (5 cards with price changes)
    const movers = Array.from({ length: 5 }, () => {
      const card = sportsCards[Math.floor(rng() * sportsCards.length)];
      const change = (rng() - 0.35) * 30; // slight positive bias
      return { card, change: Math.round(change * 10) / 10 };
    }).sort((a, b) => b.change - a.change);

    // Set spotlight
    const sets = [...new Set(sportsCards.filter(c => c.year >= 2023).map(c => c.set))];
    const spotlightSet = sets[Math.floor(rng() * sets.length)];
    const setCards = sportsCards.filter(c => c.set === spotlightSet);

    // Headline
    const headline = headlines[Math.floor(rng() * headlines.length)];

    // Tip
    const tip = tips[Math.floor(rng() * tips.length)];

    // Trending players (4)
    const players = [...new Set(sportsCards.map(c => c.player))];
    const trending = Array.from({ length: 4 }, () => {
      const player = players[Math.floor(rng() * players.length)];
      const cards = sportsCards.filter(c => c.player === player);
      return { player, cardCount: cards.length, sport: cards[0]?.sport || 'baseball' };
    });

    // Market sentiment
    const sentimentScore = Math.floor(rng() * 40) + 50; // 50-90
    const sentiment = sentimentScore >= 75 ? 'Bullish' : sentimentScore >= 60 ? 'Neutral' : 'Cautious';

    return { cardOfDay, movers, spotlightSet, setCards, headline, tip, trending, sentimentScore, sentiment };
  }, []);

  if (!mounted) return <div className="text-gray-500 text-center py-20">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Date + headline */}
      <div className="bg-gradient-to-r from-emerald-900/30 to-blue-900/30 border border-emerald-800/30 rounded-2xl p-5">
        <div className="text-gray-500 text-sm">{todayStr()}</div>
        <h2 className="text-white text-xl font-bold mt-1">{today.headline}</h2>
        <div className="flex items-center gap-4 mt-3 text-sm">
          <div className={`font-bold ${today.sentimentScore >= 75 ? 'text-emerald-400' : today.sentimentScore >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
            Market: {today.sentiment} ({today.sentimentScore}/100)
          </div>
        </div>
      </div>

      {/* Card of the day */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
          <span className="text-amber-400">&#11088;</span> Card of the Day
        </h3>
        <div className="border border-gray-700 rounded-xl p-4 bg-gray-800/30">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-white font-bold">{sportEmoji[today.cardOfDay.sport]} {today.cardOfDay.player}</div>
              <div className="text-gray-400 text-sm">{today.cardOfDay.year} {today.cardOfDay.set}</div>
              <div className="text-gray-500 text-xs mt-1">#{today.cardOfDay.cardNumber}</div>
            </div>
            <div className="text-right">
              <div className="text-emerald-400 font-bold text-sm">{today.cardOfDay.estimatedValueGem}</div>
              <div className="text-gray-600 text-xs">Gem Mint</div>
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-3 line-clamp-3">{today.cardOfDay.description}</p>
          <Link href={`/sports/${today.cardOfDay.slug}`} className="text-emerald-400 text-sm hover:underline mt-2 inline-block">
            View card details →
          </Link>
        </div>
      </div>

      {/* Market movers */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
          <span>&#128200;</span> Market Movers
        </h3>
        <div className="space-y-2">
          {today.movers.map((m, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-800/40 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <span className={sportColors[m.card.sport]}>{sportEmoji[m.card.sport]}</span>
                <div>
                  <div className="text-white text-sm font-medium truncate max-w-[200px] sm:max-w-none">{m.card.player}</div>
                  <div className="text-gray-600 text-xs">{m.card.year} {m.card.set}</div>
                </div>
              </div>
              <span className={`font-bold text-sm ${m.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {m.change >= 0 ? '+' : ''}{m.change}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Trending players */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
          <span>&#128293;</span> Trending Players
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {today.trending.map((t, i) => (
            <Link
              key={i}
              href={`/players/${t.player.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/['']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`}
              className="bg-gray-800/40 rounded-lg p-3 hover:bg-gray-800/60 transition-all"
            >
              <div className={`text-sm font-bold ${sportColors[t.sport]}`}>
                {sportEmoji[t.sport]} {t.player}
              </div>
              <div className="text-gray-600 text-xs mt-1">{t.cardCount} cards in database</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Set spotlight */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
          <span>&#127775;</span> Set Spotlight
        </h3>
        <div className="text-emerald-400 font-bold">{today.spotlightSet}</div>
        <div className="text-gray-500 text-sm mt-1">{today.setCards.length} cards in database</div>
        <div className="flex flex-wrap gap-1 mt-3">
          {today.setCards.slice(0, 8).map(c => (
            <Link
              key={c.slug}
              href={`/sports/${c.slug}`}
              className="text-xs text-gray-400 hover:text-white bg-gray-800 px-2 py-1 rounded transition-colors"
            >
              {c.player}
            </Link>
          ))}
          {today.setCards.length > 8 && (
            <span className="text-xs text-gray-600 px-2 py-1">+{today.setCards.length - 8} more</span>
          )}
        </div>
      </div>

      {/* Collecting tip */}
      <div className="bg-amber-950/30 border border-amber-800/30 rounded-2xl p-5">
        <h3 className="text-amber-400 font-bold mb-2 flex items-center gap-2">
          <span>&#128161;</span> Today&apos;s Collecting Tip
        </h3>
        <p className="text-gray-300 text-sm leading-relaxed">{today.tip}</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { href: '/tools/pack-sim', label: 'Open a Pack', icon: '📦' },
          { href: '/tools/daily-pack', label: 'Daily Free Pack', icon: '🎁' },
          { href: '/card-set-rush', label: 'Play Set Rush', icon: '⚡' },
          { href: '/tools/watchlist', label: 'Check Watchlist', icon: '👀' },
        ].map(a => (
          <Link key={a.href} href={a.href} className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center hover:border-gray-600 transition-all">
            <div className="text-xl">{a.icon}</div>
            <div className="text-white text-sm font-medium mt-1">{a.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

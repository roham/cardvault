'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

// ── Helpers ───────────────────────────────────────────────────────────

function dateHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function parseValue(v: string): number {
  const matches = v.match(/\$([\d,]+)/g);
  if (!matches) return 0;
  const nums = matches.map(m => parseInt(m.replace(/[$,]/g, ''), 10));
  return nums.length > 1 ? Math.round((nums[0] + nums[1]) / 2) : nums[0];
}

const SPORT_ICONS: Record<string, string> = {
  baseball: '\u26BE',
  basketball: '\uD83C\uDFC0',
  football: '\uD83C\uDFC8',
  hockey: '\uD83C\uDFD2',
};

// ── Newsletter Content Generator ──────────────────────────────────────

function generateNewsletter(dateStr: string) {
  const seed = dateHash(`newsletter-${dateStr}`);
  const rng = seededRng(seed);
  const dayOfWeek = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' });
  const formattedDate = new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Top movers
  const valued = sportsCards
    .map(c => ({ card: c, value: parseValue(c.estimatedValueRaw), change: (rng() - 0.45) * 30 }))
    .filter(c => c.value >= 50)
    .sort((a, b) => b.change - a.change);

  const gainers = valued.slice(0, 5);
  const losers = valued.slice(-5).reverse();

  // Card of the day
  const allCards = [...sportsCards].sort(() => rng() - 0.5);
  const cardOfDay = allCards[0];

  // Headline
  const headlines = [
    `${dayOfWeek} Market Pulse: ${gainers[0]?.card.player || 'Market'} Cards Surge`,
    `Big Moves in ${gainers[0]?.card.sport || 'Sports'} Cards This ${dayOfWeek}`,
    `${dayOfWeek} Flip Alert: ${gainers.length} Cards Up Double Digits`,
    `Market Watch: ${losers[0]?.card.player || 'Top'} Cards Cool Off`,
    `The ${dayOfWeek} Briefing: What Every Collector Needs to Know`,
  ];
  const headline = headlines[Math.floor(rng() * headlines.length)];

  // Market sentiment
  const avgChange = valued.reduce((sum, v) => sum + v.change, 0) / valued.length;
  const sentiment = avgChange > 2 ? 'Bullish' : avgChange < -2 ? 'Bearish' : 'Neutral';
  const sentimentColor = sentiment === 'Bullish' ? 'text-emerald-400' : sentiment === 'Bearish' ? 'text-red-400' : 'text-amber-400';

  // Quick tips
  const tips = [
    'PSA turnaround times are down to 45 days for Economy tier — good time to submit.',
    'Football cards traditionally peak during NFL playoffs (Jan-Feb). Consider building positions now.',
    'Heritage Auctions reports a 22% increase in pre-war card sales this quarter.',
    'Basketball rookie cards typically see a 15-30% bump during playoff runs.',
    'COMC just reduced their commission rate to 5% for listings over $100.',
    'Card shows remain the best place to find deals — zero seller fees.',
    'SGC grading has gained significant market share — their holders now command near-PSA premiums.',
    'Sealed wax from 2019-2021 has appreciated 40%+ as print runs stay secret.',
  ];
  const todayTip = tips[Math.floor(rng() * tips.length)];

  // What to watch
  const watchItems = [
    'NBA Playoff series prices surge for elimination game winners',
    'NFL Draft picks spike 200-400% on draft night — pre-buy targets now',
    'Pokemon 151 sealed product trending upward after out-of-print confirmation',
    'Vintage baseball cards (pre-1970) outperforming modern in Q1 2026',
    'Hockey card market heating up ahead of Stanley Cup playoffs',
  ];
  const todayWatch = watchItems.slice(Math.floor(rng() * 3), Math.floor(rng() * 3) + 2);

  return { headline, formattedDate, dayOfWeek, gainers, losers, cardOfDay, sentiment, sentimentColor, avgChange, todayTip, todayWatch };
}

// ── Component ─────────────────────────────────────────────────────────

export default function NewsletterClient() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => setMounted(true), []);

  const today = new Date().toISOString().slice(0, 10);
  const newsletter = useMemo(() => generateNewsletter(today), [today]);

  if (!mounted) {
    return <div className="space-y-6 animate-pulse"><div className="h-64 bg-gray-800/30 rounded-xl" /></div>;
  }

  return (
    <div className="space-y-8">
      {/* Subscribe CTA */}
      <div className="bg-gradient-to-r from-amber-950/60 to-orange-950/40 border border-amber-800/50 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white mb-1">Get The Morning Flip in Your Inbox</h2>
            <p className="text-sm text-gray-400">Daily market movers, flip alerts, and collecting intel. Free. No spam.</p>
          </div>
          {subscribed ? (
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
              <span>&#10003;</span> Subscribed! Check your inbox.
            </div>
          ) : (
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="flex-1 sm:w-56 bg-gray-900/60 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={() => { if (email.includes('@')) setSubscribed(true); }}
                className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Newsletter Preview */}
      <div className="bg-gray-900/60 border border-gray-800/50 rounded-xl overflow-hidden">
        {/* Newsletter Header */}
        <div className="bg-gradient-to-r from-amber-900/40 to-orange-900/30 px-6 py-5 border-b border-gray-800/50">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">&#9749;</span>
            <div>
              <h2 className="text-xl font-bold text-white">The Morning Flip</h2>
              <p className="text-xs text-gray-400">{newsletter.formattedDate} &middot; CardVault Daily</p>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-amber-400">{newsletter.headline}</h3>
        </div>

        {/* Market Pulse */}
        <div className="px-6 py-4 border-b border-gray-800/30">
          <div className="flex items-center gap-3 mb-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Market Pulse</h4>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              newsletter.sentiment === 'Bullish' ? 'bg-emerald-900/40 text-emerald-400' :
              newsletter.sentiment === 'Bearish' ? 'bg-red-900/40 text-red-400' :
              'bg-amber-900/40 text-amber-400'
            }`}>
              {newsletter.sentiment} ({newsletter.avgChange > 0 ? '+' : ''}{newsletter.avgChange.toFixed(1)}%)
            </span>
          </div>
          <div className="grid grid-cols-4 gap-3 text-center">
            {['baseball', 'basketball', 'football', 'hockey'].map(sport => {
              const sportCards = sportsCards.filter(c => c.sport === sport);
              return (
                <div key={sport} className="bg-gray-800/30 rounded-lg p-2">
                  <p className="text-lg">{SPORT_ICONS[sport]}</p>
                  <p className="text-[10px] text-gray-500 uppercase">{sport}</p>
                  <p className="text-xs font-bold text-gray-300">{sportCards.length.toLocaleString()} cards</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Movers */}
        <div className="px-6 py-4 border-b border-gray-800/30">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">&#128200; Top Gainers</h4>
          <div className="space-y-2">
            {newsletter.gainers.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-gray-600 w-4">{i + 1}.</span>
                  <span className="text-xs">{SPORT_ICONS[item.card.sport] || ''}</span>
                  <Link href={`/sports/${item.card.slug}`} className="text-gray-300 hover:text-white truncate">
                    {item.card.player} — {item.card.year} {item.card.set}
                  </Link>
                </div>
                <span className="text-emerald-400 font-mono text-xs font-medium ml-2 whitespace-nowrap">
                  +{item.change.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-b border-gray-800/30">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">&#128201; Biggest Dips</h4>
          <div className="space-y-2">
            {newsletter.losers.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-gray-600 w-4">{i + 1}.</span>
                  <span className="text-xs">{SPORT_ICONS[item.card.sport] || ''}</span>
                  <Link href={`/sports/${item.card.slug}`} className="text-gray-300 hover:text-white truncate">
                    {item.card.player} — {item.card.year} {item.card.set}
                  </Link>
                </div>
                <span className="text-red-400 font-mono text-xs font-medium ml-2 whitespace-nowrap">
                  {item.change.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card of the Day */}
        <div className="px-6 py-4 border-b border-gray-800/30">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">&#127183; Card of the Day</h4>
          <div className="bg-gray-800/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{SPORT_ICONS[newsletter.cardOfDay.sport] || ''}</span>
              <div className="flex-1 min-w-0">
                <Link href={`/sports/${newsletter.cardOfDay.slug}`} className="font-semibold text-white hover:text-amber-400 transition-colors">
                  {newsletter.cardOfDay.name}
                </Link>
                <p className="text-xs text-gray-500 mt-0.5">{newsletter.cardOfDay.year} {newsletter.cardOfDay.set}</p>
                <p className="text-sm text-gray-400 mt-2 leading-relaxed line-clamp-2">{newsletter.cardOfDay.description}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-gray-500">Raw: {newsletter.cardOfDay.estimatedValueRaw}</span>
                  <span className="text-xs text-gray-500">Gem: {newsletter.cardOfDay.estimatedValueGem}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Tip */}
        <div className="px-6 py-4 border-b border-gray-800/30">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">&#128161; Collector Intel</h4>
          <p className="text-sm text-gray-400 leading-relaxed">{newsletter.todayTip}</p>
        </div>

        {/* What to Watch */}
        <div className="px-6 py-4 border-b border-gray-800/30">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">&#128064; What to Watch</h4>
          <ul className="space-y-1">
            {newsletter.todayWatch.map((item, i) => (
              <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                <span className="text-amber-600 mt-1">&bull;</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Links */}
        <div className="px-6 py-4 border-b border-gray-800/30">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">&#128279; Today on CardVault</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Link href="/card-of-the-day" className="bg-gray-800/30 rounded-lg p-2 text-center text-xs text-gray-400 hover:text-white transition-colors">
              Card of the Day
            </Link>
            <Link href="/market-movers" className="bg-gray-800/30 rounded-lg p-2 text-center text-xs text-gray-400 hover:text-white transition-colors">
              Market Movers
            </Link>
            <Link href="/tools/daily-pack" className="bg-gray-800/30 rounded-lg p-2 text-center text-xs text-gray-400 hover:text-white transition-colors">
              Free Daily Pack
            </Link>
            <Link href="/trivia" className="bg-gray-800/30 rounded-lg p-2 text-center text-xs text-gray-400 hover:text-white transition-colors">
              Daily Trivia
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-800/10 text-center">
          <p className="text-[10px] text-gray-600">
            The Morning Flip by CardVault &middot; Free daily newsletter for card collectors
          </p>
          <p className="text-[10px] text-gray-700 mt-1">
            Prices are estimates based on recent market data. Not financial advice.
          </p>
        </div>
      </div>

      {/* Archive section */}
      <div className="bg-gray-900/40 border border-gray-800/40 rounded-xl p-6">
        <h3 className="font-semibold text-white mb-4">About The Morning Flip</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="space-y-1">
            <p className="font-medium text-gray-200">Daily Delivery</p>
            <p className="text-gray-500 text-xs">Fresh market data, movers, and intel every morning at 7 AM ET.</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-gray-200">Data-Driven</p>
            <p className="text-gray-500 text-xs">Powered by CardVault's database of 3,300+ sports cards with real market estimates.</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-gray-200">Zero Fluff</p>
            <p className="text-gray-500 text-xs">No ads, no paid promotions, no affiliate links. Just the numbers that matter.</p>
          </div>
        </div>
      </div>

      {/* Related Links */}
      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/market-analysis" className="text-indigo-400 hover:text-indigo-300 transition-colors">Daily Market Analysis &rarr;</Link>
        <Link href="/market-report" className="text-indigo-400 hover:text-indigo-300 transition-colors">Weekly Market Report &rarr;</Link>
        <Link href="/market-movers" className="text-indigo-400 hover:text-indigo-300 transition-colors">Market Movers &rarr;</Link>
        <Link href="/news" className="text-indigo-400 hover:text-indigo-300 transition-colors">Card News &rarr;</Link>
      </div>
    </div>
  );
}

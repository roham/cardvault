import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import BuyOrPassClient from './BuyOrPassClient';

export const metadata: Metadata = {
  title: 'Buy or Pass — Snap Judgment Card Collector Game | CardVault',
  description: 'Free snap-judgment card game. 20 real sports cards flash one at a time — you have seconds to decide BUY or PASS. End with a collection, a bill, and a collector personality. Chaser, deal-hunter, cautious, or tastemaker — what\'s your style?',
  openGraph: {
    title: 'Buy or Pass — Sports Card Snap Judgment Game',
    description: '20 cards. Buy or pass in seconds. See your collector profile at the end. Free browser game.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Buy or Pass — CardVault',
    description: '20 real cards. Snap decisions. Collector personality revealed. Play free.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Buy or Pass' },
];

const faqItems = [
  {
    question: 'How does Buy or Pass work?',
    answer: 'You see 20 real sports cards pulled from CardVault\'s 9,900+ card database, one at a time. Each card shows the asking price, player, year, and set. You tap BUY to add it to your collection at that price, or PASS to skip it. At the end you see: what you spent, what the cards are worth at gem-mint grades, and a collector personality based on your buying pattern (Chaser, Deal Hunter, Cautious, or Tastemaker).',
  },
  {
    question: 'Is the pricing realistic?',
    answer: 'Yes — every asking price is pulled from CardVault\'s estimated raw value for that card (the low end of the market range for ungraded copies). Gem-mint values shown in the results use PSA 9/10 pricing for the same card. Both numbers reflect 2025-2026 market conditions and are updated when CardVault\'s card database is refreshed.',
  },
  {
    question: 'What do the collector personalities mean?',
    answer: 'Chaser: bought lots of high-value cards regardless of deal quality — you\'re a grail collector. Deal Hunter: bought cards where your buy-in was below their gem-mint potential — you\'re a flipper\'s mindset. Cautious: passed on most cards — you\'re patient and selective. Tastemaker: bought across eras and sports — you have a broad-palette collection instinct. Breakeven Bounty: bought only when the raw price closely matched value — you\'re a fair-market player.',
  },
  {
    question: 'Can I replay with different cards?',
    answer: 'Yes. Every session pulls 20 random cards from the database. Tap "New Round" after your results to start a fresh 20-card session. No two sessions are identical because the pool is 9,900+ cards.',
  },
  {
    question: 'Does this track my actual collection?',
    answer: 'No — Buy or Pass is a game, not a portfolio tracker. If you want to track a real collection, use CardVault\'s /binder or /vault tools. Buy or Pass is about training your snap-judgment instincts and having fun with real card data.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map(f => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
};

export default function BuyOrPassPage() {
  return (
    <div className="min-h-screen bg-black text-gray-100">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={faqSchema} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8">
          <div className="inline-block px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 text-xs font-semibold mb-4 border border-pink-500/20">
            🎮 SNAP JUDGMENT GAME
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-3 tracking-tight">
            Buy or Pass
          </h1>
          <p className="text-base sm:text-lg text-gray-400 max-w-3xl">
            20 real cards. One at a time. Buy it or pass — you have seconds. At the end you see what you spent, what it&apos;s worth, and your collector personality.
          </p>
        </div>

        <BuyOrPassClient />

        <div className="mt-12 space-y-8">
          <section className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">The Five Collector Personalities</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-black/40 border border-pink-500/30 rounded-xl p-4">
                <div className="text-2xl mb-1">🏆</div>
                <div className="font-bold text-pink-400 text-sm">CHASER</div>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">Buys high-value cards on instinct. Doesn\'t care about deals — cares about grails. The collector who pays whatever it takes for the right card.</p>
              </div>
              <div className="bg-black/40 border border-emerald-500/30 rounded-xl p-4">
                <div className="text-2xl mb-1">💰</div>
                <div className="font-bold text-emerald-400 text-sm">DEAL HUNTER</div>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">Buys only when the upside beats the cost. Flipper mindset — every purchase is a trade setup. Avoids overpays religiously.</p>
              </div>
              <div className="bg-black/40 border border-sky-500/30 rounded-xl p-4">
                <div className="text-2xl mb-1">🧘</div>
                <div className="font-bold text-sky-400 text-sm">CAUTIOUS</div>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">Passes on most cards. Waits for the right moment, the right piece. The collector who buys 5 cards a year, all perfect fits.</p>
              </div>
              <div className="bg-black/40 border border-violet-500/30 rounded-xl p-4">
                <div className="text-2xl mb-1">🎨</div>
                <div className="font-bold text-violet-400 text-sm">TASTEMAKER</div>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">Buys across eras, sports, and price tiers. No single-category collection — a curated mix. Calls their collection "eclectic" at card shows.</p>
              </div>
              <div className="sm:col-span-2 bg-black/40 border border-amber-500/30 rounded-xl p-4">
                <div className="text-2xl mb-1">⚖️</div>
                <div className="font-bold text-amber-400 text-sm">BREAKEVEN BOUNTY</div>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">Buys at fair market — nothing more, nothing less. Ruthless about paying the right price. Spreads bets evenly across what they see. Neither a flipper nor a grail chaser.</p>
              </div>
            </div>
          </section>

          <section className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqItems.map((f, i) => (
                <details key={i} className="group bg-black/40 border border-gray-800 rounded-xl p-4 hover:border-pink-500/40 transition-colors">
                  <summary className="font-semibold text-white cursor-pointer list-none flex items-start justify-between gap-4">
                    <span>{f.question}</span>
                    <span className="text-pink-400 text-sm mt-0.5 group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-3 text-gray-400 text-sm leading-relaxed">{f.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="bg-gradient-to-br from-pink-500/10 to-violet-500/5 border border-pink-500/30 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">More Games</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/card-double-or-nothing" className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-gray-800 hover:border-pink-500/40 transition-colors">
                <span className="text-2xl">🎲</span>
                <div>
                  <div className="font-semibold text-white text-sm">Double or Nothing</div>
                  <div className="text-xs text-gray-400">Push-your-luck card game</div>
                </div>
              </Link>
              <Link href="/card-snap" className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-gray-800 hover:border-pink-500/40 transition-colors">
                <span className="text-2xl">⚡</span>
                <div>
                  <div className="font-semibold text-white text-sm">Card Snap</div>
                  <div className="text-xs text-gray-400">60-second matching game</div>
                </div>
              </Link>
              <Link href="/guess-the-card" className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-gray-800 hover:border-pink-500/40 transition-colors">
                <span className="text-2xl">🎯</span>
                <div>
                  <div className="font-semibold text-white text-sm">Guess the Card</div>
                  <div className="text-xs text-gray-400">Wordle-style daily puzzle</div>
                </div>
              </Link>
              <Link href="/card-zodiac" className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-gray-800 hover:border-pink-500/40 transition-colors">
                <span className="text-2xl">♈</span>
                <div>
                  <div className="font-semibold text-white text-sm">Card Zodiac</div>
                  <div className="text-xs text-gray-400">Birthday → collector sign</div>
                </div>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

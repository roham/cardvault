import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import OpeningBellClient from './OpeningBellClient';

export const metadata: Metadata = {
  title: 'The Opening Bell — Daily Card Market Morning Show | CardVault',
  description: 'A scripted daily morning show for the card market. Five segments every day: Opening monologue, Gainer of the Day, Loser of the Day, One to Watch, and the Closing Bell. New episode every 24 hours. Free.',
  openGraph: {
    title: 'The Opening Bell — Daily Card Market Morning Show | CardVault',
    description: 'Your morning market show for sports cards. Five segments, one episode per day, over 9,800 cards in rotation.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'The Opening Bell — CardVault',
    description: 'Daily morning market show for card collectors. New episode every 24 hours.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Opening Bell' },
];

const faqItems = [
  {
    question: 'What is The Opening Bell?',
    answer: 'The Opening Bell is a daily five-segment morning show for the sports card market. Every day at midnight a new episode drops, scripted from a date-seeded pull across our 9,800+ card database. The segments are: Opening Monologue (market mood and the CardVault Index), Gainer of the Day, Loser of the Day, One to Watch (a sleeper pick), and the Closing Bell (final thought and tomorrow teaser). Each episode lasts as long as you want to stay — you can play through the segments one-by-one or jump straight to any chapter.',
  },
  {
    question: 'Is this real market data?',
    answer: 'No. The Opening Bell is a simulation. Each episode is scripted deterministically from our card database so everyone sees the same show on the same calendar day. The gain/loss percentages, market index, and commentary are illustrative — they are meant to teach market reasoning and give the hobby a daily cadence, not to price individual cards. For real price research use the Price Guide, Comp Calculator, or Card Pages.',
  },
  {
    question: 'Why date-seeded?',
    answer: 'Because the show is meant to give the hobby a shared daily ritual. If every visitor got a different random episode, you could not talk about "Tuesday\'s Gainer" with a friend. Date-seeded means Monday\'s show is the same for everyone, Tuesday\'s is different, and collectors can compare notes on what aired today.',
  },
  {
    question: 'Can I watch past episodes?',
    answer: 'Yes. The navigator jumps back through the last 7 trading days. Each date renders the exact episode that aired on that day — the Gainer, Loser, featured cards, and commentary all regenerate from the same seed used on that date. You can also catch up on yesterday\'s show if you missed it, or binge the full week.',
  },
  {
    question: 'How long is each episode?',
    answer: 'Auto-play runs about 90 seconds from opening to close. You can pause at any segment, jump to any chapter via the rundown, or read through at your own pace. There is no video or audio — just scripted on-screen copy, so it works perfectly on mute at your desk.',
  },
  {
    question: 'What does the CardVault Index represent?',
    answer: 'A simulated composite index of card market health, normalized to a base of 1,000. It shifts each day based on the scripted seed and is meant to give the morning a "market temperature" in one glance: green above 1,000 is bullish, red below 1,000 is bearish. It is not a traded product and is not derived from real sales — it is a narrative device.',
  },
];

export default function OpeningBellPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'The Opening Bell',
        description: 'Daily scripted morning market show for sports card collectors. Five segments, one new episode per day.',
        url: 'https://cardvault-two.vercel.app/opening-bell',
        applicationCategory: 'Entertainment',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-red-950/60 border border-red-800/50 text-red-400 text-xs font-mono font-medium px-3 py-1.5 rounded-full mb-4 tracking-widest uppercase">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          On Air &middot; Live Market Show &middot; New Episode Daily
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3 tracking-tight">The Opening Bell</h1>
        <p className="text-gray-400 text-lg">
          A scripted daily morning show for the sports card market. Five segments. One new episode every 24 hours. Same show
          for every collector that day — so you can talk about today&apos;s gainer at tonight&apos;s group chat.
        </p>
      </div>

      <OpeningBellClient />

      <section className="mt-16 border-t border-gray-800 pt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map(f => (
            <details key={f.question} className="group bg-gray-900 border border-gray-800 rounded-xl">
              <summary className="px-5 py-4 text-white font-medium cursor-pointer hover:text-red-400 transition-colors">
                {f.question}
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm">
                {f.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-8 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">More Live Market Experiences</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/market-roundtable" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-red-700/50 rounded-xl transition-colors">
            <span className="text-xl">🎙️</span>
            <div><div className="text-white text-sm font-medium">Market Roundtable</div><div className="text-gray-500 text-xs">Five AI analysts debate hot topics</div></div>
          </Link>
          <Link href="/market-reactions" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-red-700/50 rounded-xl transition-colors">
            <span className="text-xl">⚡</span>
            <div><div className="text-white text-sm font-medium">Market Reactions</div><div className="text-gray-500 text-xs">Live event impact simulator</div></div>
          </Link>
          <Link href="/live-ticker" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-red-700/50 rounded-xl transition-colors">
            <span className="text-xl">📈</span>
            <div><div className="text-white text-sm font-medium">Live Ticker</div><div className="text-gray-500 text-xs">Scrolling price ticker</div></div>
          </Link>
          <Link href="/market-movers" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-red-700/50 rounded-xl transition-colors">
            <span className="text-xl">🚀</span>
            <div><div className="text-white text-sm font-medium">Market Movers</div><div className="text-gray-500 text-xs">Today&apos;s biggest price changes</div></div>
          </Link>
          <Link href="/card-of-the-day" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-red-700/50 rounded-xl transition-colors">
            <span className="text-xl">🗓️</span>
            <div><div className="text-white text-sm font-medium">Card of the Day</div><div className="text-gray-500 text-xs">Featured pick with trivia</div></div>
          </Link>
          <Link href="/market-report" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-red-700/50 rounded-xl transition-colors">
            <span className="text-xl">📰</span>
            <div><div className="text-white text-sm font-medium">Market Report</div><div className="text-gray-500 text-xs">Weekly analysis digest</div></div>
          </Link>
        </div>
      </section>
    </div>
  );
}

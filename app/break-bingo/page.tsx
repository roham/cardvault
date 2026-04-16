import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import BreakBingoClient from './BreakBingoClient';

export const metadata: Metadata = {
  title: 'Break Bingo — Card Break Bingo Game | CardVault',
  description: 'Play bingo during a simulated card break! Watch cards get pulled from 9,700+ real sports cards. Auto-marking board fills as events happen. Get 5 in a row to win. Daily + random modes.',
  openGraph: {
    title: 'Break Bingo — Card Break Bingo Game | CardVault',
    description: 'Bingo meets card breaks. Watch pulls, mark your card, call bingo. Free to play.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Break Bingo — CardVault',
    description: 'Card break bingo game. Watch simulated pulls, get 5 in a row. Free.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Break Bingo' },
];

const faqItems = [
  {
    question: 'What is Break Bingo?',
    answer: 'Break Bingo combines the excitement of watching a card break with classic bingo gameplay. You get a 5x5 bingo card filled with break events like "Rookie Card!", "$50+ Card", "Chrome/Prizm Pull", and more. As a simulated break pulls real cards from our 9,700+ card database, your board auto-marks matching events. Get 5 in a row to call BINGO!',
  },
  {
    question: 'How are squares marked?',
    answer: 'Squares can be marked two ways: automatically (shown in green) when a pulled card matches the event criteria, or manually by tapping (shown in yellow) if you spot a match the system missed or want to mark a square you believe is correct. The FREE center space is always marked.',
  },
  {
    question: 'What determines my grade?',
    answer: 'Your grade is based on how quickly you achieve bingo. S-grade requires bingo in under 30 seconds with fewer than 15 pulls. A-grade is under 60 seconds. The faster the break produces your bingo events, the better your grade. Daily and Random modes give different board layouts.',
  },
  {
    question: 'Can I play with a specific sport?',
    answer: 'Yes! Use the sport filter before starting to limit pulled cards to MLB, NBA, NFL, or NHL only. This changes which cards appear in the break feed but your bingo card stays the same. All-sports mode gives the most variety.',
  },
  {
    question: 'What is the difference between Daily and Random modes?',
    answer: 'Daily mode gives everyone the same bingo card and pull sequence for that day — you can compare results with friends. Random mode generates a new card and sequence each time you play, for unlimited practice games.',
  },
];

export default function BreakBingoPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Break Bingo',
        description: 'Card break bingo game. Watch simulated card pulls, mark your bingo card, get 5 in a row.',
        url: 'https://cardvault-two.vercel.app/break-bingo',
        applicationCategory: 'GameApplication',
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
        <div className="inline-flex items-center gap-2 bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
          Break Game &middot; 9,700+ Cards &middot; Daily + Random
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Break Bingo</h1>
        <p className="text-gray-400 text-lg">
          Watch a simulated card break and fill your bingo card. Cards are pulled every 3 seconds from real data.
          Get 5 in a row to call BINGO!
        </p>
      </div>

      <BreakBingoClient />

      {/* FAQ section */}
      <section className="mt-16 border-t border-gray-800 pt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map(f => (
            <details key={f.question} className="group bg-gray-900 border border-gray-800 rounded-xl">
              <summary className="px-5 py-4 text-white font-medium cursor-pointer hover:text-cyan-400 transition-colors">
                {f.question}
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm">
                {f.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Related Links */}
      <section className="mt-8 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">More Card Games</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/hobby-radio" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-cyan-700/50 rounded-xl transition-colors">
            <span className="text-xl">📻</span>
            <div><div className="text-white text-sm font-medium">Hobby Radio</div><div className="text-gray-500 text-xs">Live card market broadcast</div></div>
          </Link>
          <Link href="/card-gauntlet" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-cyan-700/50 rounded-xl transition-colors">
            <span className="text-xl">🔥</span>
            <div><div className="text-white text-sm font-medium">Card Gauntlet</div><div className="text-gray-500 text-xs">Endless survival card game</div></div>
          </Link>
          <Link href="/market-roundtable" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-cyan-700/50 rounded-xl transition-colors">
            <span className="text-xl">🎙️</span>
            <div><div className="text-white text-sm font-medium">Market Roundtable</div><div className="text-gray-500 text-xs">5 analysts debate card topics</div></div>
          </Link>
          <Link href="/card-plinko" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-cyan-700/50 rounded-xl transition-colors">
            <span className="text-xl">📍</span>
            <div><div className="text-white text-sm font-medium">Card Plinko</div><div className="text-gray-500 text-xs">Drop cards for multipliers</div></div>
          </Link>
          <Link href="/card-snap" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-cyan-700/50 rounded-xl transition-colors">
            <span className="text-xl">⚡</span>
            <div><div className="text-white text-sm font-medium">Card Snap</div><div className="text-gray-500 text-xs">Speed matching game</div></div>
          </Link>
          <Link href="/card-grid" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-cyan-700/50 rounded-xl transition-colors">
            <span className="text-xl">🟩</span>
            <div><div className="text-white text-sm font-medium">Card Grid</div><div className="text-gray-500 text-xs">Immaculate Grid for cards</div></div>
          </Link>
        </div>
      </section>
    </div>
  );
}

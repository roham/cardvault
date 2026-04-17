import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardKenoClient from './CardKenoClient';

export const metadata: Metadata = {
  title: 'Card Keno — Daily Lottery Pick-and-Match Card Game | CardVault',
  description: 'Pick 1 to 8 cards from a 40-card grid. Ten cards are drawn. Your payout scales by matches — 8-for-8 pays 5,000 dust, 1-for-1 pays 3. Classic keno reimagined for sports card collectors. Daily seeded game + free-play mode, real cards, printable pay table.',
  openGraph: {
    title: 'Card Keno — CardVault',
    description: 'Lottery meets the hobby. Pick your spots, watch the draw, collect dust on every match.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Keno — CardVault',
    description: 'Pick up to 8 cards. Ten are drawn. How many do you match?',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Keno' },
];

const faqItems = [
  {
    question: 'How does Card Keno work?',
    answer: 'Forty cards are displayed in a grid. You pick between 1 and 8 of them as your "spots" — the cards you think will be drawn. After you lock in your picks, the system randomly draws 10 cards from the 40-card pool. For each of your spots that matches one of the 10 drawn cards, you score a "hit." The total hits, combined with the number of spots you picked, determines the payout from a fixed pay table: 8-for-8 pays 5,000 dust, 7-for-7 pays 2,000, 1-for-1 pays 3. Picking fewer spots is safer; picking more is higher-variance.',
  },
  {
    question: 'What is "dust" and can I redeem it?',
    answer: 'Dust is CardVault\u2019s virtual engagement currency — no real-money value, not redeemable for cards, not a cryptocurrency. It\u2019s the internal scorekeeping unit used across CardVault\u2019s game catalog so you can compare your lifetime performance across Keno, Card Briefcase, Card Dozen, Card Tower Climb, and other games on a single yardstick. All games use the same dust unit; the cross-game leaderboard (coming soon) ranks collectors by total lifetime dust.',
  },
  {
    question: 'Why pick fewer spots?',
    answer: 'The pay table rewards precision at each pick level. Picking 1 spot and hitting it pays 3x your bet — a low ceiling but a 25% hit rate (10 drawn / 40 pool). Picking 8 spots and hitting all 8 pays 5,000x — a massive ceiling but a 0.00003% hit rate. The math works out such that the expected value (EV) of each pick count is roughly similar (slight house edge across all counts), but the variance is dramatically different. Pick 1 or 2 spots for stable small wins; pick 6-8 for the rare grail moment.',
  },
  {
    question: 'Is there a strategy for Card Keno?',
    answer: 'Not really. Every card in the grid has an equal draw probability (1/40 per draw, uniform random), so selecting "hot" cards or "lucky" numbers has no mathematical edge — that\'s what makes it pure lottery. The only strategic choice is how many spots to pick. If you want the lowest variance (stable gameplay feel), pick 2-3 spots. If you want the highest dust ceiling (occasional massive wins, many blank rounds), pick 6-8 spots. Think of it like a slot machine\u2019s volatility dial.',
  },
  {
    question: 'What is the difference between Daily and Free-Play mode?',
    answer: 'Daily mode uses a deterministic seed based on the current calendar date — every CardVault visitor playing today sees the same 40-card grid, the same 10 drawn cards, and can only play once per day. Daily results are comparable across the collector community. Free-Play mode uses fresh randomness on every play, lets you play as many rounds as you like, but does not count toward the daily leaderboard. Use Daily for competitive comparison, Free-Play for practice or for running your own pay-table math.',
  },
  {
    question: 'What are the best possible outcomes?',
    answer: 'The top-tier win is 8-of-8 (pick 8 spots, hit all 8): 5,000 dust in a single round. The second-highest is 7-of-7 at 2,000 dust, then 6-of-6 at 800, 5-of-5 at 300, 4-of-4 at 125, 3-of-3 at 50, 2-of-2 at 15, and 1-of-1 at 3. Partial hits (matching some but not all spots) pay progressively smaller amounts per the full pay table. The single rarest outcome in the game is 8-of-8, occurring roughly once every 230,000 plays at uniform randomness.',
  },
  {
    question: 'Can I share my Keno result?',
    answer: 'Yes. After each round the "Share result" button generates a compact emoji-grid summary showing which spots you picked and which hit, along with your payout tier. Paste it anywhere — X, Discord, Bluesky — without leaking card identifiers beyond what appears visually in the emoji grid. The share format mirrors Wordle and other daily-puzzle shares, so friends see your outcome without needing to open the link.',
  },
];

export default function CardKenoPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Game',
        name: 'Card Keno',
        description: 'Daily lottery pick-and-match game for sports card collectors. Pick up to 8 cards from a 40-card grid; ten are drawn; earn dust by matching.',
        url: 'https://cardvault-two.vercel.app/card-keno',
        genre: 'Lottery / Pick-and-Match',
        gamePlatform: 'Web',
        numberOfPlayers: '1',
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-pink-950/60 border border-pink-800/50 text-pink-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse" />
          Pick 1-8 &middot; draw 10 &middot; 8-for-8 pays 5,000 dust
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Card Keno</h1>
        <p className="text-gray-400 text-lg max-w-3xl">
          Classic lottery keno, reimagined for the hobby. Pick between one and eight cards from a 40-card grid of sports greats. Ten are drawn at random. Match to win dust. Pick fewer for stable wins; pick more for the rare grail moment.
        </p>
      </div>

      <CardKenoClient />

      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-pink-300 transition-colors">{faq.question}<span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span></summary>
              <div className="px-4 pb-4 text-sm text-gray-400 leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-gray-800 pt-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Related Games</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/card-dozen" className="text-pink-300 hover:text-pink-200">Card Dozen</Link>
          <Link href="/card-briefcase" className="text-pink-300 hover:text-pink-200">Card Briefcase</Link>
          <Link href="/card-pincer" className="text-pink-300 hover:text-pink-200">Card Pincer</Link>
          <Link href="/card-tower-climb" className="text-pink-300 hover:text-pink-200">Card Tower Climb</Link>
          <Link href="/card-nim" className="text-pink-300 hover:text-pink-200">Card Nim</Link>
          <Link href="/rank-or-tank" className="text-pink-300 hover:text-pink-200">Rank or Tank</Link>
          <Link href="/card-mastermind" className="text-pink-300 hover:text-pink-200">Card Mastermind</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/games" className="text-pink-300 hover:text-pink-200">&larr; All Games</Link>
        <Link href="/tools" className="text-pink-300 hover:text-pink-200">Tools</Link>
        <Link href="/" className="text-pink-300 hover:text-pink-200">Home</Link>
      </div>
    </div>
  );
}

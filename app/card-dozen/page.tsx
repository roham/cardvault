import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardDozenClient from './CardDozenClient';

export const metadata: Metadata = {
  title: 'Card Dozen — Pick the Top 3 Most Valuable Cards in 30 Seconds | CardVault',
  description: 'Daily snap-judgment card valuation game. Twelve real sports cards drop on the table — three per sport. You have thirty seconds to pick the three worth the most money. Sum of your picks over sum of the actual top three is your score. Gold, silver, bronze, bust.',
  openGraph: {
    title: 'Card Dozen — CardVault',
    description: 'Twelve cards. Thirty seconds. Pick the top three by value. Daily snap-judgment game for hobby sharks.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Dozen — CardVault',
    description: 'Can you spot the three most valuable cards in a dozen in thirty seconds? Daily challenge.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Dozen' },
];

const faqItems = [
  {
    question: 'How does scoring work?',
    answer: 'At the end of the round, the game sorts the twelve cards by value and adds up the real top three. Your score is the sum of your three picks as a percentage of that maximum, clamped to 0-100. Pick the actual top three and you score 100. Miss them all and you score whatever the three cards you did pick happen to sum to, divided by the max \u2014 which is why picking even the fourth, fifth, and sixth most valuable cards can still score 75+ on rounds where the distribution is tight.',
  },
  {
    question: 'Where do the cards come from?',
    answer: 'Every card is a real sports card sourced from the CardVault database of 10,000+ graded and raw cards with published eBay and auction-house comps. Each round pulls three cards per sport (MLB, NBA, NFL, NHL), prioritizing distinct players and a range of value tiers. Estimated values are raw-card comps unless the card is only sold graded \u2014 in which case the gem-mint comp is used.',
  },
  {
    question: 'What is the difference between Daily and Free Play?',
    answer: 'Daily Dozen is the same twelve cards for every player on a given calendar day, seeded by date. Your Daily score counts toward your streak and compares directly against other players\u2019 scores for the day. Free Play reshuffles a new dozen every time and lets you practice without affecting your streak. The emoji share grid labels which mode you played.',
  },
  {
    question: 'Can I beat the timer by thinking longer?',
    answer: 'No \u2014 the clock is hard thirty seconds, and the round auto-reveals the moment you select your third card or the timer hits zero. If you pick fewer than three before the timer expires, your partial selection is scored (so picking two of the top three beats picking none, even if you did not fill all three slots). The game is designed to test snap judgment, not analysis. Experienced collectors often beat it on instinct alone in under ten seconds.',
  },
  {
    question: 'Why does Card Dozen include all four major sports?',
    answer: 'Cross-sport valuation is a real collector skill \u2014 most people specialize in one or two sports and develop blind spots in the others. A Card Dozen round forces you to compare a 2011 Update Trout to a 1986 Fleer Jordan to a 1979 OPC Gretzky to a 2000 Playoff Brady, all in the same grid. If you hit gold consistently, you have a well-calibrated cross-sport value sense that 95% of collectors lack.',
  },
  {
    question: 'What makes a card worth more?',
    answer: 'The fast heuristic: rookie year for a major player (Trout, Jordan, Mantle, Brady) in a flagship set with strong market demand. The deeper heuristic: grading pop-report scarcity (PSA 10 of a common rookie can be rare even if raw is cheap), auto / patch hits (numbered parallels usually beat base), and era (pre-1980 vintage is generally thinner supply than 2010s+). The game rewards recognizing all three.',
  },
  {
    question: 'Does the share grid give away the answer?',
    answer: 'No \u2014 it only shows your pick accuracy as an emoji grid (green = you picked a top-3, black = you picked a non-top-3, yellow = top-3 you missed, white = correctly skipped). The actual card names and values are not in the share text, so you can post your result without spoiling today\u2019s Daily for anyone else.',
  },
];

export default function CardDozenPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Game',
        name: 'Card Dozen',
        description: 'A thirty-second snap-judgment card valuation game. Twelve real sports cards are dealt, three per sport; the player picks the three they believe are worth the most money and scores a percentage of the actual top-three total value.',
        url: 'https://cardvault-two.vercel.app/card-dozen',
        genre: 'Card valuation game',
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
        <div className="inline-flex items-center gap-2 bg-lime-950/60 border border-lime-800/50 text-lime-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-pulse" />
          Daily game &middot; 12 cards &middot; pick 3 &middot; 30-second clock
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Card Dozen</h1>
        <p className="text-gray-400 text-lg max-w-3xl">
          Twelve real sports cards drop on the table \u2014 three from each major sport. You get thirty seconds to pick the three you think are worth the most money. Sum of your picks over sum of the actual top three is your score. Gold at 95, silver at 80, bronze at 60, bust below.
        </p>
      </div>

      <CardDozenClient />

      {/* FAQ */}
      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-lime-300 transition-colors">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-400">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      {/* Related */}
      <div className="mt-8 border-t border-gray-800 pt-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Related Games</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/rank-or-tank" className="text-lime-300 hover:text-lime-200">Rank or Tank</Link>
          <Link href="/card-streak" className="text-lime-300 hover:text-lime-200">Card Streak</Link>
          <Link href="/card-briefcase" className="text-lime-300 hover:text-lime-200">Card Briefcase</Link>
          <Link href="/card-mastermind" className="text-lime-300 hover:text-lime-200">Card Mastermind</Link>
          <Link href="/flip-or-keep" className="text-lime-300 hover:text-lime-200">Flip or Keep</Link>
          <Link href="/guess-the-card" className="text-lime-300 hover:text-lime-200">Guess the Card</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/games" className="text-lime-300 hover:text-lime-200">&larr; All Games</Link>
        <Link href="/tools" className="text-lime-300 hover:text-lime-200">Tools</Link>
        <Link href="/" className="text-lime-300 hover:text-lime-200">Home</Link>
      </div>
    </div>
  );
}

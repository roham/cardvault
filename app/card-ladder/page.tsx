import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardLadderClient from './CardLadderClient';
import { sportsCards } from '@/data/sports-cards';

export const metadata: Metadata = {
  title: 'Card Ladder — Higher or Lower Card Value Game',
  description: 'Free daily card collecting game. Is the next card worth more or less? Test your knowledge of sports card values in this addictive higher/lower game. Streaks, grades, and shareable results.',
  openGraph: {
    title: 'Card Ladder — Higher or Lower Card Value Game — CardVault',
    description: 'Is the next card worth more or less? Test your sports card value knowledge.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Ladder — CardVault',
    description: 'Higher or lower? Test your card value knowledge in this daily game.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/tools' },
  { label: 'Card Ladder' },
];

const faqItems = [
  {
    question: 'How do you play Card Ladder?',
    answer: 'You see a sports card and its estimated raw value. Then a second card appears with its value hidden. You guess whether the next card is worth MORE (Higher) or LESS (Lower) than the current card. If you guess correctly, you climb a rung and the next card becomes the new current card. The game ends when you guess wrong. Try to build the longest streak possible.',
  },
  {
    question: 'What card values are used in Card Ladder?',
    answer: 'Card Ladder uses estimated raw (ungraded) values from CardVault\'s database of 5,000+ sports cards. Values are based on recent market data and represent typical selling prices for cards in average condition. The daily card pool is randomized so every day is a new challenge.',
  },
  {
    question: 'What do the grades mean in Card Ladder?',
    answer: 'Your grade is based on how many consecutive correct guesses (rungs) you achieve: S (20+) = Card Market Savant, A (15+) = Expert Collector, B (10+) = Sharp Eye, C (5+) = Getting There, D (2+) = Keep Learning, F (0-1) = Card Newbie. The game tracks your all-time high score in your browser.',
  },
  {
    question: 'Does Card Ladder reset daily?',
    answer: 'Yes, the card pool shuffles every day using a date-based seed, so you get a fresh set of 50 cards each day. Your high score persists across days so you can always try to beat your personal best. Share your score with friends to see who knows card values better.',
  },
];

export default function CardLadderPage() {
  // Pass minimal card data to the client
  const cardData = sportsCards.map(c => ({
    name: c.name,
    player: c.player,
    sport: c.sport,
    year: c.year,
    estimatedValueRaw: c.estimatedValueRaw,
    slug: c.slug,
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Ladder — Higher or Lower Card Value Game',
        description: 'Test your sports card value knowledge. Is the next card worth more or less? Daily game with streaks, grades, and shareable results.',
        url: 'https://cardvault-two.vercel.app/card-ladder',
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

      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Daily Game &middot; 50 Cards &middot; Higher or Lower &middot; Shareable &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">🪜 Card Ladder</h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Is the next card worth more or less? Climb the ladder by guessing correctly. One wrong guess and it&apos;s over.
        </p>
      </div>

      <CardLadderClient cards={cardData} />

      {/* FAQ */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((f, i) => (
            <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <h3 className="font-semibold text-white mb-2">{f.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 pt-8 border-t border-gray-800">
        <p className="text-gray-500 text-sm text-center">
          More games: <a href="/grade-or-fade" className="text-emerald-400 hover:underline">Grade or Fade</a> · <a href="/price-is-right" className="text-emerald-400 hover:underline">The Price is Right</a> · <a href="/flip-or-keep" className="text-emerald-400 hover:underline">Flip or Keep</a> · <a href="/guess-the-card" className="text-emerald-400 hover:underline">Guess the Card</a> · <a href="/trivia" className="text-emerald-400 hover:underline">Daily Trivia</a>
        </p>
      </section>
    </div>
  );
}

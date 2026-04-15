import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import PriceIsRightClient from './PriceIsRightClient';

export const metadata: Metadata = {
  title: 'The Price is Right — Card Value Guessing Game | CardVault',
  description: 'How well do you know card values? Guess the price of 10 real sports cards. Score points for accuracy — the closer your guess, the higher your score. New cards every day. Track your best score.',
  openGraph: {
    title: 'The Price is Right — CardVault',
    description: 'Guess the price of 10 real sports cards. How well do you know the market?',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'The Price is Right — CardVault',
    description: 'Card value guessing game. 10 cards, score points for accuracy.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'The Price is Right' },
];

const faqItems = [
  {
    question: 'How does The Price is Right work?',
    answer: 'You are shown 10 real sports cards one at a time. For each card, you guess the raw estimated value. You score 0-100 points per card based on accuracy. A perfect guess scores 100. Being within 20% scores 80+. The further off you are, the fewer points you earn. Your total out of 1,000 determines your grade.',
  },
  {
    question: 'What values am I guessing?',
    answer: 'You are guessing the estimated raw (ungraded) value of each card. These are market estimates based on recent sales data. The actual value may vary based on condition, seller, and market timing.',
  },
  {
    question: 'When do the cards change?',
    answer: 'A new set of 10 cards is selected every day at midnight. The selection is deterministic — everyone gets the same 10 cards on the same day. Come back daily to test your knowledge across different sports and eras.',
  },
  {
    question: 'How is the score calculated?',
    answer: 'Points = 100 * max(0, 1 - |guess - actual| / actual). So if a card is worth $100 and you guess $80, you are 20% off and score 80 points. Guessing over by $50 on a $100 card scores 50. You cannot score below 0 on any card.',
  },
  {
    question: 'What do the grades mean?',
    answer: 'S-tier (950+) means you know the market like a dealer. A (850-949) is expert collector level. B (700-849) is solid knowledge. C (500-699) is average. D (300-499) is learning. F (below 300) means you should check more price guides!',
  },
];

export default function PriceIsRightPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'The Price is Right — Card Value Guessing Game',
        description: 'Guess the value of 10 real sports cards. Score points for accuracy. New cards daily.',
        url: 'https://cardvault-two.vercel.app/price-is-right',
        applicationCategory: 'GameApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      }} />

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          Daily Game
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          The Price is Right
        </h1>
        <p className="text-gray-400 text-lg">
          How well do you know card values? Guess the price of 10 real cards. Closest guess wins.
        </p>
      </div>

      <PriceIsRightClient />

      {/* FAQ Section */}
      <div className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((item, i) => (
            <div key={i}>
              <h3 className="text-white font-semibold mb-2">{item.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Internal Links */}
      <div className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-lg font-bold text-white mb-4">More Games &amp; Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link href="/guess-the-card" className="bg-gray-900 border border-gray-800 rounded-lg p-3 hover:border-gray-600 transition-colors">
            <div className="text-sm font-medium text-white">Guess the Card</div>
            <div className="text-xs text-gray-500">Daily puzzle</div>
          </Link>
          <Link href="/trading-sim" className="bg-gray-900 border border-gray-800 rounded-lg p-3 hover:border-gray-600 transition-colors">
            <div className="text-sm font-medium text-white">Trading Sim</div>
            <div className="text-xs text-gray-500">Buy &amp; sell cards</div>
          </Link>
          <Link href="/card-battle" className="bg-gray-900 border border-gray-800 rounded-lg p-3 hover:border-gray-600 transition-colors">
            <div className="text-sm font-medium text-white">Card Battle</div>
            <div className="text-xs text-gray-500">Stats-based combat</div>
          </Link>
          <Link href="/trivia" className="bg-gray-900 border border-gray-800 rounded-lg p-3 hover:border-gray-600 transition-colors">
            <div className="text-sm font-medium text-white">Trivia</div>
            <div className="text-xs text-gray-500">Test your knowledge</div>
          </Link>
          <Link href="/tools/market-dashboard" className="bg-gray-900 border border-gray-800 rounded-lg p-3 hover:border-gray-600 transition-colors">
            <div className="text-sm font-medium text-white">Market Dashboard</div>
            <div className="text-xs text-gray-500">Real prices &amp; data</div>
          </Link>
          <Link href="/market-sentiment" className="bg-gray-900 border border-gray-800 rounded-lg p-3 hover:border-gray-600 transition-colors">
            <div className="text-sm font-medium text-white">Sentiment Index</div>
            <div className="text-xs text-gray-500">Fear &amp; Greed gauge</div>
          </Link>
        </div>
      </div>
    </div>
  );
}

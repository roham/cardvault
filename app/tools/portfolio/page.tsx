import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import PortfolioGame from './PortfolioGame';

export const metadata: Metadata = {
  title: 'Fantasy Card Portfolio — Pick 5 Cards, Compete for Gains',
  description: 'Free fantasy card portfolio game. Draft 5 sports cards, track simulated price movement over a week, and compete on the leaderboard. No real money — just bragging rights.',
  openGraph: {
    title: 'Fantasy Card Portfolio — CardVault',
    description: 'Draft 5 cards. Track simulated price movement. Compete for the top of the leaderboard.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Fantasy Card Portfolio — CardVault',
    description: 'Pick 5 cards. Watch them move. Compete on the leaderboard.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Fantasy Card Portfolio' },
];

const faqItems = [
  {
    question: 'How does the Fantasy Card Portfolio work?',
    answer: 'Pick 5 cards from our database to build your portfolio. Each card gets a simulated price movement over 7 days based on realistic market dynamics — rookies are volatile, vintage is stable, and current events create spikes. Your goal is to pick the cards with the best price performance.',
  },
  {
    question: 'Is real money involved?',
    answer: 'No! This is purely for fun and bragging rights. No real money, no real card purchases. It\'s a game to test your card market knowledge and instincts.',
  },
  {
    question: 'How are price movements simulated?',
    answer: 'Price movements use a Monte Carlo simulation factoring in each card\'s base volatility (rookies swing more than vintage), market trends (seasonal patterns, playoff spikes), and random events. It\'s not a real price prediction — it\'s a fun game mechanic.',
  },
  {
    question: 'Can I compete with friends?',
    answer: 'Yes! Share your portfolio link with friends. The leaderboard tracks the best-performing portfolios. Build your lineup, share the link, and see who has the best card market instincts.',
  },
];

export default function PortfolioPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Fantasy Card Portfolio',
        description: 'Free fantasy sports card portfolio game. Draft 5 cards, track simulated prices, compete on the leaderboard.',
        url: 'https://cardvault-two.vercel.app/tools/portfolio',
        applicationCategory: 'GameApplication',
        operatingSystem: 'Any',
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

      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-500 bg-clip-text text-transparent mb-3">
          Fantasy Card Portfolio
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Draft 5 cards. Track their simulated price movement over 7 days. Compete for the top of the leaderboard.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          No real money. Just bragging rights and card market instincts.
        </p>
      </div>

      <PortfolioGame />

      {/* FAQ Section */}
      <section className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group border border-gray-800 rounded-lg">
              <summary className="px-5 py-4 cursor-pointer text-gray-200 font-medium hover:text-white transition-colors">
                {item.question}
              </summary>
              <p className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Related Tools */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Related Tools</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Link href="/tools/pack-sim" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold text-white">Pack Simulator</h3>
            <p className="text-sm text-gray-400 mt-1">Open virtual packs for free.</p>
          </Link>
          <Link href="/tools/trade" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold text-white">Trade Evaluator</h3>
            <p className="text-sm text-gray-400 mt-1">Is that trade fair? Find out.</p>
          </Link>
          <Link href="/tools/grading-roi" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold text-white">Grading ROI</h3>
            <p className="text-sm text-gray-400 mt-1">Is grading worth it for your card?</p>
          </Link>
        </div>
      </section>
    </div>
  );
}

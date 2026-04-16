import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import PlayerPortfolioClient from './PlayerPortfolioClient';

export const metadata: Metadata = {
  title: 'Player Card Portfolio — See Every Card for Any Player | CardVault',
  description: 'Search any player and see their complete card portfolio: every card in our 9,600+ database, total value, investment grade, value distribution, best card to buy, cheapest entry point. Free player card analysis.',
  openGraph: {
    title: 'Player Card Portfolio — Complete Card Analysis | CardVault',
    description: 'See every card for any player. Total value, investment grade, value distribution, buying recommendations.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Player Card Portfolio | CardVault',
    description: 'Complete card portfolio analysis for any player. 9,600+ cards across MLB, NBA, NFL, NHL.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Player Portfolio' },
];

const faqItems = [
  {
    question: 'What is a player card portfolio?',
    answer: 'A player card portfolio shows every card we track for a specific player across all sets and years. It includes total estimated value (raw and gem mint), an investment grade (S through D), value distribution across price tiers, their most valuable card, and the cheapest entry point to start collecting that player.',
  },
  {
    question: 'How is the investment grade calculated?',
    answer: 'The investment grade considers average card value, whether the player has rookie cards, total number of cards tracked, and the span of years covered. Players with high-value rookie cards and extensive card histories receive S or A grades. The grade helps you quickly assess whether a player is a strong collecting target.',
  },
  {
    question: 'What does cheapest entry mean?',
    answer: 'The cheapest entry point is the lowest-value card in our database for that player. It represents the most affordable way to start collecting a specific player. Many star players have base cards under $5 that make great entry points.',
  },
  {
    question: 'How many players are in the database?',
    answer: 'We track cards for over 2,800 players across baseball, basketball, football, and hockey. The database includes legends, current stars, rookies, and emerging prospects from 1909 to 2025.',
  },
  {
    question: 'Can I compare two players?',
    answer: 'Yes! After viewing a player portfolio, you can search for another player or use our Player Comparison tool at /tools/compare to do a side-by-side analysis of two players investment profiles.',
  },
];

export default function PlayerPortfolioPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Player Card Portfolio',
        description: 'Search any player and see their complete card portfolio with investment analysis.',
        url: 'https://cardvault-two.vercel.app/tools/player-portfolio',
        applicationCategory: 'UtilityApplication',
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
        <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-800/50 text-indigo-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
          Player Portfolio &middot; 9,600+ Cards &middot; 2,800+ Players
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Player Card Portfolio</h1>
        <p className="text-gray-400 text-lg">
          Search any player to see their complete card portfolio. Total value, investment grade,
          value distribution, best card to buy, and cheapest entry point.
        </p>
      </div>

      <PlayerPortfolioClient />

      {/* FAQ */}
      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-indigo-400 transition-colors">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-400">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      {/* Related Links */}
      <div className="mt-8 border-t border-gray-800 pt-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Related Tools</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/tools/compare" className="text-indigo-500 hover:text-indigo-400">Compare Players</Link>
          <Link href="/tools/collection-value" className="text-indigo-500 hover:text-indigo-400">Collection Value</Link>
          <Link href="/tools/investment-calc" className="text-indigo-500 hover:text-indigo-400">Investment Calculator</Link>
          <Link href="/tools/card-scout" className="text-indigo-500 hover:text-indigo-400">Card Scout</Link>
          <Link href="/tools/diversification" className="text-indigo-500 hover:text-indigo-400">Diversification</Link>
          <Link href="/tools/price-history" className="text-indigo-500 hover:text-indigo-400">Price History</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/tools" className="text-indigo-500 hover:text-indigo-400">&larr; All Tools</Link>
        <Link href="/games" className="text-indigo-500 hover:text-indigo-400">Games</Link>
        <Link href="/" className="text-indigo-500 hover:text-indigo-400">Home</Link>
      </div>
    </div>
  );
}

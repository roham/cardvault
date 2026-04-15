import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardLadderClient from './CardLadderClient';

export const metadata: Metadata = {
  title: 'Card Ladder Builder — Player Upgrade Path from Budget to Premium | CardVault',
  description: 'Build a card upgrade ladder for any player. See the value progression from budget base cards to premium gem mint slabs. Plan your collection upgrade path with estimated values, set details, and upgrade reasoning for 1,800+ players across baseball, basketball, football, and hockey.',
  openGraph: {
    title: 'Card Ladder Builder — CardVault',
    description: 'Plan your card upgrade path. See every value tier from budget to premium for any player.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Ladder Builder — CardVault',
    description: 'Build a card upgrade ladder. Budget to premium for any player across 4 sports.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Card Ladder Builder' },
];

const faqItems = [
  {
    question: 'What is a card ladder?',
    answer: 'A card ladder is an upgrade path showing every value tier of a player\'s cards, from the cheapest base card to the most premium gem mint slab. It helps collectors plan their next purchase by showing exactly what each upgrade step costs and what you gain — better condition, rarer set, higher grade, or more desirable year. Think of it as a roadmap for building your collection one upgrade at a time.',
  },
  {
    question: 'How does the Card Ladder Builder work?',
    answer: 'Search any player and the tool instantly finds all their cards in CardVault\'s database, then arranges them from lowest to highest estimated value. Each step on the ladder shows the card name, set, year, estimated value, and what makes it more desirable than the previous step (better set, rookie year, higher demand). You can see the price gap between each rung to plan your budget.',
  },
  {
    question: 'Should I skip rungs on the ladder?',
    answer: 'It depends on your budget and goals. If you\'re collecting for enjoyment, climbing one rung at a time lets you appreciate each upgrade. If you\'re investing, sometimes skipping to a higher rung makes more sense — mid-tier cards often have the worst return on investment. The ladder shows the cost per rung so you can make an informed decision.',
  },
  {
    question: 'What makes a card higher on the ladder?',
    answer: 'Several factors increase a card\'s position: (1) Premium sets (Prizm, Chrome, Topps flagship vs. off-brand), (2) Rookie year designation, (3) Graded condition (PSA 10 vs raw), (4) Scarcity (numbered parallels, 1/1 cards), (5) Historical significance (vintage cards from key years), and (6) Player demand (MVPs, Hall of Famers command premiums at every tier).',
  },
  {
    question: 'How accurate are the estimated values?',
    answer: 'Values are based on recent market data and represent typical selling prices for each card in the specified condition. Raw values reflect ungraded copies in near-mint condition. Gem mint values reflect PSA 10 or BGS 9.5+ copies. Actual prices vary by exact condition, market timing, and buyer demand. Use the eBay links on each card page to check current live pricing.',
  },
];

export default function CardLadderPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Ladder Builder',
        description: 'Build a card upgrade ladder for any player. See the value progression from budget base cards to premium gem mint slabs across baseball, basketball, football, and hockey.',
        url: 'https://cardvault-two.vercel.app/tools/card-ladder',
        applicationCategory: 'FinanceApplication',
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
        <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-800/50 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          1,800+ Players &middot; 6,100+ Cards &middot; Budget to Premium
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Ladder Builder</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Plan your collection upgrade path. Search any player to see every value tier from a $5 base card
          to a premium gem mint slab — with the cost and reasoning for each step up.
        </p>
      </div>

      <CardLadderClient />

      {/* FAQ */}
      <section className="mt-16 mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((f, i) => (
            <details key={i} className="group bg-gray-800/50 border border-gray-700 rounded-xl">
              <summary className="cursor-pointer px-6 py-4 text-white font-medium list-none flex items-center justify-between">
                {f.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9662;</span>
              </summary>
              <div className="px-6 pb-4 text-gray-400 text-sm leading-relaxed">{f.answer}</div>
            </details>
          ))}
        </div>
      </section>

      {/* Related */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-white mb-4">Related Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/tools/rookie-finder', label: 'Rookie Card Finder', icon: '🔍' },
            { href: '/tools/investment-return', label: 'Investment Return', icon: '📊' },
            { href: '/tools/grading-roi', label: 'Grading ROI', icon: '💎' },
            { href: '/tools/portfolio-rebalancer', label: 'Portfolio Rebalancer', icon: '⚖️' },
            { href: '/tools/watchlist', label: 'Price Watchlist', icon: '👀' },
            { href: '/tools/flip-calc', label: 'Flip Profit Calc', icon: '💸' },
          ].map(t => (
            <Link
              key={t.href}
              href={t.href}
              className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl text-sm text-gray-300 hover:text-white transition-colors"
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

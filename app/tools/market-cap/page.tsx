import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import MarketCapClient from './MarketCapClient';

export const metadata: Metadata = {
  title: 'Card Market Cap Calculator — Player Card Portfolio Rankings | CardVault',
  description: 'See the total market cap of every player\'s card portfolio. Rankings by sport, position, and era. Find the most valuable player card collections across baseball, basketball, football, and hockey.',
  openGraph: {
    title: 'Card Market Cap Calculator — CardVault',
    description: 'Player card market cap rankings. Which athlete\'s cards are worth the most?',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Market Cap Calculator — CardVault',
    description: 'Rank players by total card value. Market cap rankings for 1,900+ athletes.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Card Market Cap' },
];

const faqItems = [
  {
    question: 'What is a player\'s card market cap?',
    answer: 'A player\'s card market cap is the total estimated value of all their cards in our database when graded at gem mint condition (PSA 10 equivalent). It represents the maximum portfolio value a collector could hold by owning one of each card at top grade. This metric helps identify which athletes have the most valuable overall card presence in the hobby.',
  },
  {
    question: 'How is the raw market cap different from gem mint?',
    answer: 'Raw market cap uses ungraded card values (typically PSA 8-9 equivalent), while gem mint uses PSA 10/BGS 9.5 values. The difference between raw and gem mint market cap shows the "grading premium" — how much value professional grading adds to a player\'s portfolio. Players with high grading premiums tend to have cards where condition is especially important.',
  },
  {
    question: 'Which sport has the highest average player market cap?',
    answer: 'Baseball typically has the highest average player market cap due to the combination of vintage cards (pre-1970) commanding premium prices and a longer history of card production. Basketball cards tend to have higher individual card values for modern stars, while football and hockey offer more affordable entry points for most players.',
  },
  {
    question: 'Can I use market cap to decide which cards to invest in?',
    answer: 'Market cap is one useful metric but shouldn\'t be the only factor. High market cap players like Mike Trout or Victor Wembanyama have proven demand but also higher entry costs. Lower market cap players may represent undervalued opportunities. Consider market cap alongside card count, rookie card availability, and the player\'s career trajectory for investment decisions.',
  },
  {
    question: 'How often do player market caps change?',
    answer: 'Card market caps shift constantly based on player performance, hobby trends, and market conditions. Rookie seasons, MVP awards, championships, and Hall of Fame inductions can dramatically increase a player\'s card market cap. Injuries, scandals, or retirement can decrease it. Our estimates reflect general market conditions and are updated periodically.',
  },
];

export default function MarketCapPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Market Cap Calculator',
        description: 'Rank athletes by total card portfolio value. See market caps across 1,900+ players and 6,500+ cards.',
        url: 'https://cardvault-two.vercel.app/tools/market-cap',
        applicationCategory: 'FinanceApplication',
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

      <h1 className="text-3xl sm:text-4xl font-bold mb-3">Card Market Cap Calculator</h1>
      <p className="text-gray-400 mb-8 max-w-2xl">
        Rank every player by total card portfolio value. See which athletes have the most
        valuable card collections across baseball, basketball, football, and hockey.
      </p>

      <MarketCapClient />

      {/* FAQ Section */}
      <section className="mt-16 border-t border-gray-800 pt-10">
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((item, i) => (
            <details key={i} className="group bg-gray-900 rounded-lg p-5">
              <summary className="font-semibold cursor-pointer group-open:mb-3">{item.question}</summary>
              <p className="text-gray-400 text-sm leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Related Tools */}
      <section className="mt-12 border-t border-gray-800 pt-10">
        <h2 className="text-xl font-bold mb-4">Related Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/tools/collection-value', label: 'Collection Value' },
            { href: '/tools/investment-calc', label: 'Investment Calculator' },
            { href: '/tools/diversification', label: 'Diversification Analyzer' },
            { href: '/tools/roi-heatmap', label: 'ROI Heatmap' },
            { href: '/tools/heat-score', label: 'Collection Heat Score' },
            { href: '/tools/portfolio', label: 'Fantasy Portfolio' },
          ].map(tool => (
            <Link key={tool.href} href={tool.href} className="bg-gray-900 hover:bg-gray-800 rounded-lg p-3 text-sm text-center transition-colors">
              {tool.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

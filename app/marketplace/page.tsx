import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import MarketplaceClient from './MarketplaceClient';

export const metadata: Metadata = {
  title: 'Marketplace — Buy & Sell Cards | CardVault',
  description: 'Browse the CardVault marketplace. Find cards listed by other collectors, snag deals below market value, or list your vault cards for sale.',
  openGraph: {
    title: 'Marketplace — CardVault',
    description: 'Buy and sell sports cards on the CardVault marketplace.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Marketplace — CardVault',
    description: 'Browse sports cards for sale. Real data, simulated marketplace.',
  },
  alternates: { canonical: './' },
};

const faqItems = [
  {
    question: 'How does the marketplace work?',
    answer: 'The marketplace shows cards listed for sale by simulated sellers. You can browse by sport, filter by price range, and buy cards directly into your vault using your wallet balance. Prices are based on real market data with small seller-set discounts or premiums.',
  },
  {
    question: 'How are marketplace prices determined?',
    answer: 'Each listing is priced relative to the card\'s estimated market value. Some sellers offer deals (5-15% below market), while premium cards may carry a slight markup. Look for the "Deal" badge for cards priced below market value.',
  },
  {
    question: 'Can I sell my cards on the marketplace?',
    answer: 'Yes! Cards in your vault can be listed for sale. You set the price, and when a simulated buyer purchases your card, the proceeds go to your wallet balance minus a 5% marketplace fee.',
  },
  {
    question: 'What is the difference between marketplace and buyback?',
    answer: 'Buyback (in your vault) gives you an instant 90% of fair market value. The marketplace lets you set your own price and potentially earn more, but the card may take time to sell. The marketplace also lets you buy specific cards you want.',
  },
];

export default function MarketplacePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Marketplace' }]} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Marketplace',
        description: 'Browse and buy sports cards from other collectors. Real card data, simulated marketplace.',
        url: 'https://cardvault-two.vercel.app/marketplace',
        applicationCategory: 'EntertainmentApplication',
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

      <MarketplaceClient />

      {/* FAQ */}
      <section className="mt-16 border-t border-gray-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map(item => (
            <details key={item.question} className="group bg-gray-900 border border-gray-800 rounded-xl">
              <summary className="px-5 py-4 text-white font-medium cursor-pointer list-none flex items-center justify-between">
                {item.question}
                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

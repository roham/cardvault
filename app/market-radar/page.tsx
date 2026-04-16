import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import MarketRadarClient from './MarketRadarClient';

export const metadata: Metadata = {
  title: 'Card Market Radar — Live Activity Scanner | CardVault',
  description: 'Real-time card market radar showing price movements, trending players, new listings, and completed sales across MLB, NBA, NFL, and NHL. Visual radar scanner with sport filtering, signal categories, and live activity feed.',
  openGraph: {
    title: 'Card Market Radar — Live Scanner | CardVault',
    description: 'Visual radar showing real-time card market activity. Price spikes, trending players, deals, and more.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Market Radar — CardVault',
    description: 'Live card market scanner. See price movements, trending cards, and deals in real time.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Live', href: '/live-hub' },
  { label: 'Market Radar' },
];

const faqItems = [
  {
    question: 'What is the Card Market Radar?',
    answer: 'The Card Market Radar is a visual scanner that displays simulated real-time card market activity. It shows price movements, trending players, new listings, and completed sales across baseball, basketball, football, and hockey cards. Signals are categorized as Hot (price spikes), Cold (price drops), New (fresh listings), and Sale (completed transactions).',
  },
  {
    question: 'How often does the radar update?',
    answer: 'The radar generates new market signals every 3-5 seconds, simulating real-time market activity. Each signal includes the player name, card details, price information, and the type of activity detected. The radar sweep animation completes a full rotation every 4 seconds.',
  },
  {
    question: 'Are these real market prices?',
    answer: 'The prices shown are estimates based on real card data from our database of 9,000+ sports cards. The market signals are simulated to demonstrate what a real-time market monitoring tool would look like. For actual prices, check eBay sold listings or use our Price Check tool.',
  },
  {
    question: 'Can I filter by sport?',
    answer: 'Yes. Use the sport filter buttons to show only signals from a specific sport (MLB, NBA, NFL, or NHL) or view all sports simultaneously. The radar adapts in real time when you change filters.',
  },
  {
    question: 'What do the signal categories mean?',
    answer: 'Hot (red) = price spike or surge in demand. Cold (blue) = price decline or cooling interest. New (green) = newly listed card or product. Sale (amber) = completed transaction or auction result. Each category helps you identify different types of market activity at a glance.',
  },
];

export default function MarketRadarPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Market Radar',
        description: 'Real-time visual radar scanner for card market activity. Track price movements, trending players, new listings, and sales across MLB, NBA, NFL, and NHL.',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        url: 'https://cardvault-two.vercel.app/market-radar',
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

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-green-950/60 border border-green-800/50 text-green-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          Live Scanner · Auto-Updating · 9,000+ Cards
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Market Radar
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Visual scanner showing real-time card market activity. Price spikes, trending players, new deals, and completed sales — all on one radar.
        </p>
      </div>

      <MarketRadarClient />

      {/* FAQ Section */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group border border-gray-800 rounded-lg">
              <summary className="flex items-center justify-between cursor-pointer px-4 py-3 text-white font-medium hover:bg-gray-900/50 rounded-lg">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform ml-2">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Related Links */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Related Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { href: '/market-movers', label: 'Market Movers', desc: 'Daily gainers and losers' },
            { href: '/live-ticker', label: 'Live Ticker', desc: 'Scrolling price ticker' },
            { href: '/market-pulse', label: 'Market Pulse', desc: 'Activity dashboard' },
            { href: '/market-weather', label: 'Market Weather', desc: 'Weather-style conditions' },
            { href: '/market-alerts', label: 'Market Alerts', desc: 'Real-time notifications' },
            { href: '/hobby-buzz', label: 'Hobby Buzz', desc: 'Collector discussion feed' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col gap-1 p-3 rounded-lg border border-gray-800 hover:border-green-700/50 hover:bg-green-950/20 transition-colors"
            >
              <span className="text-white text-sm font-medium">{link.label}</span>
              <span className="text-gray-500 text-xs">{link.desc}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

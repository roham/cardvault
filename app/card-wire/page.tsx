import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardWireClient from './CardWireClient';

export const metadata: Metadata = {
  title: 'Card Wire — Live Hobby News & Market Feed | CardVault',
  description: 'Real-time card market news wire with breaking headlines, market movers, trade ticker, and grading updates. Bloomberg-style live feed for sports card collectors covering MLB, NFL, NBA, and NHL.',
  openGraph: {
    title: 'Card Wire — Live Hobby News & Market Feed | CardVault',
    description: 'Real-time card market wire: breaking news, market movers, trade ticker, and alerts across all sports.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Wire — CardVault',
    description: 'Live card market news wire. Breaking headlines, market movers, trade ticker, and grading updates.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Live', href: '/live-hub' },
  { label: 'Card Wire' },
];

const faqItems = [
  {
    question: 'What is Card Wire?',
    answer: 'Card Wire is a Bloomberg Terminal-style live news feed for the sports card market. It combines three real-time panels: a News Wire with breaking headlines and market stories, a Market Movers panel showing which players and cards are gaining or losing value, and a Trade Ticker showing recent sales and auction results. All data updates throughout the day across MLB, NBA, NFL, and NHL.',
  },
  {
    question: 'How often does Card Wire update?',
    answer: 'The wire feed simulates real-time updates with new stories arriving every 15 seconds. Market movers refresh daily based on that day\'s market activity. The trade ticker shows the most recent sales and auction results across major platforms including eBay, Goldin, and Heritage Auctions.',
  },
  {
    question: 'Can I filter by sport or category?',
    answer: 'Yes. Use the sport filter to see only MLB, NBA, NFL, or NHL stories. The category filter in the wire panel lets you drill into specific topics: News (general hobby), Sales (market transactions), Grading (PSA, BGS, CGC, SGC updates), Releases (new product announcements), and Alerts (breaking market events).',
  },
  {
    question: 'What do the priority levels mean?',
    answer: 'Stories are tagged with three priority levels. High priority (red border, "BREAKING" label) are market-moving events that may immediately impact card values. Medium priority (yellow border) are significant but less urgent stories. Low priority (gray border) are informational updates and background context.',
  },
  {
    question: 'How are market movers calculated?',
    answer: 'Market movers show the biggest daily price movements for popular player cards across all four sports. Changes are based on recent sales data, auction results, and market sentiment. Positive percentages (green) indicate rising values, while negative percentages (red) indicate declining values. Each mover includes a reason explaining the price movement.',
  },
];

export default function CardWirePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Wire — Live Hobby News Feed',
        description: 'Real-time card market news wire with breaking headlines, market movers, and trade ticker.',
        url: 'https://cardvault-two.vercel.app/card-wire',
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
        <div className="inline-flex items-center gap-2 bg-red-950/60 border border-red-800/50 text-red-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
          Live Wire &middot; News + Movers + Trades &middot; 4 Sports
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
          Card Wire
        </h1>
        <p className="text-zinc-400 text-base max-w-2xl">
          Real-time market intelligence for card collectors. Breaking news, price movers, trade activity, grading updates, and product releases — all in one live feed.
        </p>
      </div>

      <CardWireClient />

      {/* FAQ Section */}
      <div className="mt-12 border-t border-zinc-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-zinc-800/30 border border-zinc-700/30 rounded-lg">
              <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-zinc-200 hover:text-white">
                {faq.question}
              </summary>
              <div className="px-4 pb-3 text-sm text-zinc-400 leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Related Links */}
      <div className="mt-8 border-t border-zinc-800 pt-6">
        <h2 className="text-lg font-bold text-white mb-3">Related</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/market-pulse', label: 'Market Pulse', desc: 'Live market dashboard' },
            { href: '/market-movers', label: 'Market Movers', desc: 'Daily price changes' },
            { href: '/breaking-news', label: 'Breaking News', desc: 'Hobby news feed' },
            { href: '/hot-deals', label: 'Hot Deals', desc: 'Daily card deals' },
            { href: '/live-hub', label: 'Live Hub', desc: 'All live features' },
            { href: '/fear-greed', label: 'Fear & Greed Index', desc: 'Market sentiment' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="bg-zinc-800/40 border border-zinc-700/30 rounded-lg p-3 hover:border-zinc-600 transition-colors">
              <div className="text-sm font-medium text-white">{link.label}</div>
              <div className="text-xs text-zinc-500">{link.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

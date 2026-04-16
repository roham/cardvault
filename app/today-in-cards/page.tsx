import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import TodayInCardsClient from './TodayInCardsClient';

export const metadata: Metadata = {
  title: 'Today in Cards — Daily Card Market Digest | CardVault',
  description: 'Your daily card collecting digest. Market movers, card of the day, trending players, set spotlight, and collecting tips. Fresh content every day for sports card and Pokemon collectors.',
  openGraph: {
    title: 'Today in Cards — CardVault',
    description: 'Daily card market digest. Market movers, trending players, set spotlight, and tips.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Today in Cards — CardVault',
    description: 'Your daily card collecting digest. Fresh content every day.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Today in Cards' },
];

const faqItems = [
  {
    question: 'How often is Today in Cards updated?',
    answer: 'Every day at midnight. A new card of the day, market movers, trending players, set spotlight, and collecting tip are generated fresh each day. The content is the same for every visitor on the same day.',
  },
  {
    question: 'Are the market movements real?',
    answer: 'Market movements shown are simulated based on card characteristics, sport seasonality, and historical hobby trends. For real-time pricing, check individual card pages which link to eBay sold listings.',
  },
  {
    question: 'How are trending players selected?',
    answer: 'Trending players are algorithmically selected daily from the 7,500+ card database based on market activity signals, seasonal relevance, and card count in the database.',
  },
  {
    question: 'Can I see previous days?',
    answer: 'Currently, only today\'s digest is available. Each day generates completely fresh content. Bookmark the page and check back daily to stay current with the hobby.',
  },
  {
    question: 'How can I get alerts for specific cards?',
    answer: 'Use the Price Watchlist tool to track specific cards and get alerts when they move more than 5%. You can also set up a daily routine with My Hub to check all your engagement features.',
  },
];

export default function TodayInCardsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Today in Cards',
        description: 'Daily card collecting digest with market movers, card of the day, trending players, and tips.',
        url: 'https://cardvault-two.vercel.app/today-in-cards',
        applicationCategory: 'NewsApplication',
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

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-blue-950/60 border border-blue-800/50 text-blue-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
          Updated Daily &middot; Market Moves &middot; Trending &middot; Tips
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Today in Cards</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Your daily card collecting digest. Market movers, card of the day, trending players, set spotlight, and a collecting tip to start your day.
        </p>
      </div>

      {/* Content */}
      <TodayInCardsClient />

      {/* FAQ */}
      <section className="mt-12 border-t border-gray-800 pt-10">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((faq, i) => (
            <details key={i} className="group">
              <summary className="cursor-pointer text-white font-medium hover:text-blue-400 transition-colors">
                {faq.question}
              </summary>
              <p className="mt-2 text-gray-400 text-sm leading-relaxed pl-4">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Related */}
      <section className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-lg font-semibold text-white mb-3">More Daily Content</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/news', label: 'Hobby News' },
            { href: '/market-movers', label: 'Market Movers' },
            { href: '/market-report', label: 'Weekly Report' },
            { href: '/card-of-the-day', label: 'Card of the Day' },
            { href: '/trivia', label: 'Daily Trivia' },
            { href: '/tools/daily-pack', label: 'Daily Pack' },
            { href: '/tools/watchlist', label: 'Price Watchlist' },
            { href: '/my-hub', label: 'My Hub' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="text-sm text-gray-400 hover:text-blue-400 bg-gray-900 border border-gray-800 rounded-full px-3 py-1 transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

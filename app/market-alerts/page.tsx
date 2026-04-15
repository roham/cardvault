import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import MarketAlertsClient from './MarketAlertsClient';

export const metadata: Metadata = {
  title: 'Live Market Alerts — Real-Time Card Market Notifications | CardVault',
  description: 'Never miss a market move. Live alerts for sports card price spikes, price drops, new product releases, auction endings, and grading results. Filter by type and sport. Free real-time card market notifications.',
  openGraph: {
    title: 'Live Market Alerts — CardVault',
    description: 'Real-time card market notifications. Price spikes, drops, releases, auction endings.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Live Market Alerts — CardVault',
    description: 'Never miss a card market move. Live alerts for price spikes, drops, and releases.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Live Experience' },
  { label: 'Market Alerts' },
];

const faqItems = [
  {
    question: 'What are Live Market Alerts?',
    answer: 'Live Market Alerts is a real-time notification feed for sports card market activity. Alerts fire for price spikes (cards up 10%+ in a day), price drops (buying opportunities), new product releases, auction endings, and grading results. Each alert includes the card or product involved, the magnitude of the event, and a suggested action. Think of it as your personal card market news ticker.',
  },
  {
    question: 'How often do new alerts appear?',
    answer: 'New alerts appear every 15-30 seconds during active sessions, simulating a real-time market feed. Alert frequency varies by time of day and market activity. Peak hours (evenings and weekends when most collectors are active) see more frequent alerts. You can pause the feed at any time to catch up on alerts you missed.',
  },
  {
    question: 'Can I filter alerts by type or sport?',
    answer: 'Yes. Filter by alert type (price spike, price drop, new release, auction ending, grading result) and by sport (baseball, basketball, football, hockey). Filters combine so you can see only basketball price spikes or only football auction endings. Your filter preferences are saved in your browser.',
  },
  {
    question: 'What should I do when I see a price spike alert?',
    answer: 'A price spike alert means a card has moved up significantly. For cards you own, this could be a selling opportunity. For cards you want, it may mean the window to buy at the old price is closing. Check the reason for the spike (player news, seasonal demand, auction result) to judge whether the increase is temporary or a new baseline. The alert includes a link to the card page for more details.',
  },
  {
    question: 'Are these alerts based on real market data?',
    answer: 'Alerts are generated using deterministic simulations based on our database of 6,100+ real cards with realistic market behaviors. Price movements reflect seasonal trends, player performance, and hobby event cycles. While not connected to live exchange feeds, the alerts demonstrate the types of notifications a real-time card market monitoring system would produce.',
  },
];

export default function MarketAlertsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Live Market Alerts',
        description: 'Real-time sports card market notification feed. Price spike alerts, price drop alerts, new release alerts, auction ending alerts, and grading result alerts for baseball, basketball, football, and hockey cards.',
        url: 'https://cardvault-two.vercel.app/market-alerts',
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
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          LIVE FEED &middot; Price Spikes &middot; Drops &middot; Releases &middot; Auctions &middot; Grades
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Live Market Alerts</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Your real-time notification center for the sports card market. Price spikes, buying opportunities,
          new releases, auction endings, and grading results — all in one feed.
        </p>
      </div>

      <MarketAlertsClient />

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
        <h2 className="text-xl font-bold text-white mb-4">Related</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/live-ticker', label: 'Live Price Ticker', icon: '📊' },
            { href: '/market-movers', label: 'Market Movers', icon: '📈' },
            { href: '/market-pulse', label: 'Market Pulse', icon: '💓' },
            { href: '/hot-right-now', label: 'Hot Right Now', icon: '🔥' },
            { href: '/tools/watchlist', label: 'Price Watchlist', icon: '👀' },
            { href: '/market-weather', label: 'Market Weather', icon: '🌤️' },
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

import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import WaxWatchClient from './WaxWatchClient';

export const metadata: Metadata = {
  title: 'Live Wax Watch — Sealed Product Price Tracker | CardVault',
  description: 'Track sealed sports card product prices in real time. Hobby boxes, blasters, and ETBs across MLB, NFL, NBA, and NHL with price movements, buy/hold/sell signals, and hot product alerts. Free sealed wax price tracker.',
  openGraph: {
    title: 'Live Wax Watch — Sealed Product Tracker | CardVault',
    description: 'Real-time sealed product price movements, buy/sell signals, and hot product alerts across 4 sports.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Live Wax Watch — CardVault',
    description: 'Track sealed product prices: hobby boxes, blasters, ETBs. Buy/hold/sell signals for card investors.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Live', href: '/' },
  { label: 'Wax Watch' },
];

const faqItems = [
  {
    question: 'What is Wax Watch?',
    answer: 'Wax Watch is a live sealed product price tracker that monitors hobby boxes, blasters, and ETBs across MLB, NFL, NBA, and NHL. Each product shows current market price, daily change, 7-day trend, and a buy/hold/sell signal based on price momentum and product lifecycle.',
  },
  {
    question: 'How are buy/sell signals calculated?',
    answer: 'Signals combine three factors: price momentum (rising vs falling), product lifecycle stage (new release premium, stabilization, or long-term hold), and historical patterns (seasonal demand by sport). A BUY signal means the price is below typical market value with positive momentum. SELL means the price has peaked relative to expected demand.',
  },
  {
    question: 'How often do prices update?',
    answer: 'Prices simulate real-time market movement throughout the day. Each product has its own volatility profile — hobby boxes move more than blasters, and new releases are more volatile than established products. Refresh the page to see the latest simulated movements.',
  },
  {
    question: 'Should I invest in sealed wax?',
    answer: 'Sealed wax investing can be profitable but carries risk. Key factors: buy at or below retail, focus on hobby boxes over retail products, prioritize strong draft classes and rookie-loaded sets, and store properly (cool, dry, away from sunlight). Never invest more than you can afford to lose. Use our Sealed Wax Vault tool for detailed analysis.',
  },
  {
    question: 'What products are tracked?',
    answer: 'We track 24 products across 4 sports: flagship hobby boxes (Topps Series 1, Prizm, etc.), premium products (Bowman Chrome, National Treasures), mid-range (Donruss Optic, Select), and retail (blasters, ETBs). Coverage spans the current season\'s most-traded sealed products.',
  },
];

export default function WaxWatchPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Live Wax Watch',
        description: 'Real-time sealed product price tracker for sports card hobby boxes, blasters, and ETBs.',
        url: 'https://cardvault-two.vercel.app/wax-watch',
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
        <div className="inline-flex items-center gap-2 bg-orange-950/60 border border-orange-800/50 text-orange-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
          Live &middot; 24 Products &middot; 4 Sports &middot; Buy/Sell Signals
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Live Wax Watch</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Track sealed product prices in real time. Hobby boxes, blasters, and ETBs
          with price movements, buy/hold/sell signals, and hot product alerts.
        </p>
      </div>

      <WaxWatchClient />

      <section className="mt-16 border-t border-gray-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-900/60 border border-gray-800 rounded-lg">
              <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-white font-medium">
                {faq.question}
                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-12 border-t border-gray-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-4">Related Features</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { href: '/vault/sealed-wax', label: 'Sealed Wax Vault', desc: 'Track your sealed product investments' },
            { href: '/tools/sealed-ev', label: 'Sealed EV Calculator', desc: 'Expected value per product' },
            { href: '/market-reactions', label: 'Market Reactions', desc: 'How events move card values' },
            { href: '/live-ticker', label: 'Live Price Ticker', desc: 'Scrolling card price feed' },
            { href: '/tools/pack-simulator', label: 'Pack Simulator', desc: 'Rip packs virtually' },
            { href: '/hot-right-now', label: 'Hot Right Now', desc: 'Trending cards dashboard' },
          ].map(t => (
            <Link key={t.href} href={t.href} className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 hover:border-orange-700/50 transition-colors">
              <span className="text-white text-sm font-medium">{t.label}</span>
              <span className="text-gray-500 text-xs block mt-0.5">{t.desc}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

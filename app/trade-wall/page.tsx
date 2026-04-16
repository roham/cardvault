import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import TradeWallClient from './TradeWallClient';

export const metadata: Metadata = {
  title: 'Live Trade Wall — Real-Time Card Trading Floor | CardVault',
  description: 'Watch the live card trade wall. See trade offers posted, matched, and completed in real-time across all sports. Filter by sport, value tier, and trade type. The card collecting stock exchange.',
  openGraph: {
    title: 'Live Trade Wall — Card Trading Floor | CardVault',
    description: 'Real-time card trading floor. Watch offers, matches, and completed trades scroll by. The hobby stock exchange.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Live Trade Wall — CardVault',
    description: 'Real-time card trading floor with live offers, matches, and completions.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Live', href: '/live-hub' },
  { label: 'Trade Wall' },
];

const faqItems = [
  {
    question: 'What is the Live Trade Wall?',
    answer: 'The Live Trade Wall is a simulated real-time trading floor for sports cards. It shows trade offers being posted, matched, and completed across all four major sports. Think of it as a stock exchange ticker for the card hobby — you can watch the flow of trades, see what cards are in demand, spot trends in trade volume, and get a feel for market sentiment. New trades appear every few seconds, creating a dynamic, always-moving experience.',
  },
  {
    question: 'Are these real trades?',
    answer: 'The trades shown are simulated using real card data from our database of 7,600+ cards. The trade values, card names, and player information are all real, but the trades themselves are algorithmically generated to represent realistic trading activity. The simulation uses deterministic daily seeds so everyone sees the same trade flow on a given day.',
  },
  {
    question: 'What do the trade types mean?',
    answer: 'OFFER means someone is proposing a trade — they want to swap their card(s) for specific cards. MATCH means two offers have been paired up as a fair trade. COMPLETED means a trade has been executed. WANTED is a buy request — someone is looking for a specific card. HOT TRADE means a trade involving a trending or high-value card that is generating buzz.',
  },
  {
    question: 'How is trade fairness calculated?',
    answer: 'Trade fairness is based on the estimated market value of cards on each side. A trade within 10% of equal value is rated as Fair. Trades where one side is 10-25% higher are rated Slight Edge. Trades with more than 25% imbalance show the overpay percentage. The fairness rating helps you learn to evaluate trades by comparing your gut feeling to the calculated value.',
  },
  {
    question: 'Can I filter trades by sport or value?',
    answer: 'Yes. Use the sport filter to see only baseball, basketball, football, or hockey trades. Use the value tier filter to focus on budget trades (under $50), mid-range ($50-$200), or premium trades ($200+). You can also filter by trade type (offers, matches, completed, wanted, hot trades). Filters can be combined for precise trade watching.',
  },
];

export default function TradeWallPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Live Trade Wall — Real-Time Card Trading Floor',
        description: 'Watch real-time card trade offers, matches, and completions across all sports. The card collecting stock exchange.',
        url: 'https://cardvault-two.vercel.app/trade-wall',
        applicationCategory: 'SocialNetworkingApplication',
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
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Live Feed &middot; All Sports &middot; Real Card Data
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Live Trade Wall</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          The card collecting stock exchange. Watch trade offers, matches, and completions scroll by in real-time.
        </p>
      </div>

      <TradeWallClient />

      {/* FAQ */}
      <div className="mt-12 space-y-4">
        <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
        {faqItems.map((f, i) => (
          <details key={i} className="group bg-gray-900/40 border border-gray-800/40 rounded-lg">
            <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-gray-300 hover:text-white flex items-center justify-between">
              {f.question}
              <span className="text-gray-600 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <p className="px-4 pb-4 text-sm text-gray-400 leading-relaxed">{f.answer}</p>
          </details>
        ))}
      </div>

      {/* Related Live Features */}
      <div className="mt-10 bg-gray-900/40 border border-gray-800/40 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-3">More Live Features</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/trade-hub', label: 'Trade Hub' },
            { href: '/live-rip-feed', label: 'Live Rip Feed' },
            { href: '/live-hub', label: 'Live Hub' },
            { href: '/live-ticker', label: 'Price Ticker' },
            { href: '/market-scoreboard', label: 'Market Scoreboard' },
            { href: '/hobby-buzz', label: 'Hobby Buzz' },
            { href: '/hot-deals', label: 'Hot Card Deals' },
            { href: '/card-show-feed', label: 'Card Show Feed' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="text-sm text-emerald-400 hover:text-emerald-300 underline underline-offset-2">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

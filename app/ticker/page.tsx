import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import TickerClient from './TickerClient';

export const metadata: Metadata = {
  title: 'Live Card Price Ticker — Sports Card Market Index',
  description: 'Real-time sports card price ticker tracking the 20 most iconic cards across MLB, NBA, NFL, and NHL. Market sentiment, biggest movers, and price alerts.',
  openGraph: {
    title: 'Live Card Price Ticker — CardVault',
    description: 'Track the card market like the stock market. Real-time prices on 20 iconic cards across 4 sports.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Live Card Price Ticker — CardVault Market Index',
    description: 'Real-time card price ticker. Gainers, losers, and market sentiment across MLB, NBA, NFL, NHL.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Price Ticker' },
];

const faqItems = [
  {
    question: 'How does the CardVault Price Ticker work?',
    answer: 'The CardVault Price Ticker tracks 20 of the most iconic and actively-traded cards across baseball, basketball, football, and hockey. It displays real-time price changes, trading volume, and market sentiment indicators. Use it as a daily pulse check on the overall card market.',
  },
  {
    question: 'What cards are in the index?',
    answer: 'The index includes blue-chip cards from each sport: 1952 Topps Mantle, 1986 Fleer Jordan, 2017 Prizm Mahomes, 1979 OPC Gretzky, and modern stars like Wembanyama, Ohtani, and Bedard. These are the cards that define the market direction.',
  },
  {
    question: 'Should I make buying decisions based on the ticker?',
    answer: 'The ticker is best for awareness, not timing. Cards are illiquid — unlike stocks, you cannot buy and sell instantly. Use the ticker to understand market direction, then use our Price Watchlist tool to set alerts for specific cards you want to buy or sell at target prices.',
  },
  {
    question: 'What does market sentiment mean?',
    answer: 'Market sentiment reflects the overall direction of the card market. BULLISH means more cards are gaining value than losing. BEARISH means the opposite. The average change across all 20 tracked cards determines the sentiment. A market moving +2% average is strongly bullish.',
  },
];

export default function TickerPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Live Price Ticker',
        description: 'Real-time sports card price ticker tracking 20 iconic cards across MLB, NBA, NFL, and NHL.',
        url: 'https://cardvault-two.vercel.app/ticker',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
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

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Live Prices - 20 Blue Chip Cards - Updates Every 5s
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Market Ticker
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Track the card market like Wall Street. Real-time prices on the 20 most iconic
          cards across all four major sports. See who is up, who is down, and where the market is heading.
        </p>
      </div>

      <TickerClient />

      {/* FAQ */}
      <section className="mt-16 mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item) => (
            <details key={item.question} className="group bg-zinc-900/60 border border-zinc-800 rounded-xl">
              <summary className="p-5 cursor-pointer text-white font-medium flex items-center justify-between">
                {item.question}
                <span className="text-zinc-500 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <p className="px-5 pb-5 text-zinc-400 text-sm leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <div className="text-center text-zinc-600 text-xs mt-8">
        <p>Prices are simulated for demonstration. Not financial advice.</p>
        <p className="mt-1">
          <Link href="/tools/watchlist" className="text-emerald-500 hover:text-emerald-400">Price Watchlist</Link>
          {' '}&middot;{' '}
          <Link href="/market-movers" className="text-emerald-500 hover:text-emerald-400">Market Movers</Link>
          {' '}&middot;{' '}
          <Link href="/market-report" className="text-emerald-500 hover:text-emerald-400">Weekly Report</Link>
        </p>
      </div>
    </div>
  );
}

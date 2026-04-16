import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import MarketScoreboardClient from './MarketScoreboardClient';

export const metadata: Metadata = {
  title: 'Card Market Live Scoreboard — Bulls vs Bears Daily Market Game | CardVault',
  description: 'Watch today\'s card market as a live sports game. Bulls (buyers) vs Bears (sellers) with per-sport scores, MVP card of the day, rookie sensation, play-by-play ticker, and halftime report. Updated daily.',
  openGraph: {
    title: 'Card Market Live Scoreboard — Bulls vs Bears | CardVault',
    description: 'Today\'s card market as a live sports game. Bulls vs Bears with scores, MVP, and play-by-play.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Market Live Scoreboard — CardVault',
    description: 'Bulls vs Bears — watch today\'s card market unfold like a live sports game.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Live', href: '/live-hub' },
  { label: 'Market Scoreboard' },
];

const faqItems = [
  {
    question: 'What is the Card Market Live Scoreboard?',
    answer: 'The Card Market Live Scoreboard presents the daily card market as a live sports game between Bulls (buyers) and Bears (sellers). The score represents simulated buy volume vs sell volume across all four major sports. It updates daily with new scores, MVPs, and play-by-play events — making market data fun and approachable for all collectors.',
  },
  {
    question: 'How are the scores calculated?',
    answer: 'Scores are generated using a deterministic algorithm seeded by today\'s date, so every visitor sees the same game on the same day. Bull scores represent simulated buying pressure (demand, price increases, new collectors entering) while Bear scores represent selling pressure (profit-taking, price decreases, inventory liquidation). The algorithm factors in seasonal trends and sport-specific patterns.',
  },
  {
    question: 'What does the MVP Card of the Day mean?',
    answer: 'The MVP Card is the card with the highest simulated trading volume for the day — think of it as the most actively discussed and traded card in the hobby. It\'s selected from a curated list of high-profile cards across all sports. The Rookie Sensation highlights the best-performing rookie card, and the Sleeper Pick flags an undervalued card worth watching.',
  },
  {
    question: 'Are these real market prices?',
    answer: 'The scoreboard uses simulated data to illustrate market dynamics in an entertaining way. For real prices, use our Price Guide with actual eBay sold listings, or check the Market Data Room for comprehensive market statistics. The scoreboard is designed to make market trends approachable and fun, not to provide real-time pricing.',
  },
  {
    question: 'How often does the scoreboard update?',
    answer: 'The scoreboard generates a new game every day at midnight. Each day brings fresh scores, new MVPs, different play-by-play events, and updated sport matchups. The quarters advance throughout the day (Q1: morning, Q2: midday, Q3: afternoon, Q4: evening) to simulate a real game clock.',
  },
];

export default function MarketScoreboardPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Market Live Scoreboard',
        description: 'Daily card market presented as a live sports game. Bulls vs Bears with scores, MVP, and play-by-play.',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        url: 'https://cardvault-two.vercel.app/market-scoreboard',
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

      <MarketScoreboardClient />

      <section className="mt-16 border-t border-gray-800 pt-10">
        <h2 className="text-xl font-bold mb-4 text-white">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((f, i) => (
            <details key={i} className="group" open={i === 0}>
              <summary className="cursor-pointer text-gray-300 hover:text-white font-medium">{f.question}</summary>
              <p className="mt-2 text-gray-400 text-sm leading-relaxed">{f.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-12 border-t border-gray-800 pt-10">
        <h2 className="text-xl font-bold mb-4 text-white">Related Resources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { href: '/market-analysis', label: 'Daily Market Analysis', desc: 'AI-powered market intelligence' },
            { href: '/market-weather', label: 'Market Weather', desc: 'Daily market conditions report' },
            { href: '/market-data', label: 'Market Data Room', desc: 'Comprehensive market statistics' },
            { href: '/hot-deals', label: 'Hot Card Deals', desc: 'Today\'s best deals and price drops' },
            { href: '/ticker', label: 'Price Ticker', desc: 'Scrolling live card prices' },
            { href: '/market-alerts', label: 'Market Alerts', desc: 'Real-time price notifications' },
            { href: '/fear-greed', label: 'Fear & Greed Index', desc: '10-signal market sentiment gauge' },
            { href: '/sector-report', label: 'Sector Report', desc: 'Sport-by-sport market breakdown' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="block p-3 rounded-lg bg-gray-900/60 border border-gray-800 hover:border-gray-600 transition-colors">
              <div className="text-sm font-medium text-white">{l.label}</div>
              <div className="text-xs text-gray-400">{l.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import MarketTycoonClient from './MarketTycoonClient';

export const metadata: Metadata = {
  title: 'Card Market Tycoon — Trading Simulation Game for Card Collectors',
  description: 'Free card market simulation game. Start with $10,000, buy and sell sports cards over 20 market days as prices fluctuate from injuries, awards, and market events. Maximize your portfolio value. Learn card investing through gameplay.',
  openGraph: {
    title: 'Card Market Tycoon — CardVault',
    description: 'Start with $10K. Trade 8 cards over 20 days. Beat the market. Free simulation game.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Market Tycoon — CardVault',
    description: 'Card market trading simulation. $10K, 20 days, 8 cards. Can you beat the market?',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Card Market Tycoon' },
];

const faqItems = [
  {
    question: 'How do card prices move in the simulation?',
    answer: 'Prices are driven by three factors: random daily market movement (3-13% volatility based on card hype), scheduled market events (injuries, awards, trades) that impact specific cards, and mean reversion that prevents prices from straying too far from base value. Higher-hype cards like Caitlin Clark and Wembanyama have more volatile price swings, while established stars like Jayson Tatum trade more steadily.',
  },
  {
    question: 'What is the best strategy to win Card Market Tycoon?',
    answer: 'Buy cards that have dipped below their base price (mean reversion will pull them back up), sell into event-driven spikes before they correct, diversify across at least 3-4 cards to reduce risk, and keep some cash reserve for buying opportunities. Avoid going all-in on one card — a single negative event can wipe out gains. The best players use events as trading signals rather than holding through them.',
  },
  {
    question: 'Does this simulation reflect real card market behavior?',
    answer: 'The simulation captures key real-world dynamics: events drive price spikes (just like a real MVP award or injury), hype increases volatility (just like rookie cards are more volatile than established stars), and markets tend to mean-revert after extreme moves. However, real card markets have additional factors like grading populations, auction timing, and broader economic conditions that are not modeled here.',
  },
  {
    question: 'What do the ratings mean?',
    answer: 'S-tier: 30%+ return (exceptional trader), A-tier: 20-30% return (strong performance), B-tier: 10-20% return (solid gains), C-tier: 0-10% return (modest gains), D-tier: negative return (lost money). The starting portfolio of $10,000 is your benchmark — any return above 0% means you beat holding cash.',
  },
];

export default function MarketTycoonPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Market Tycoon',
        description: 'Card market trading simulation game. Start with $10,000, buy and sell cards over 20 market days.',
        url: 'https://cardvault-two.vercel.app/market-tycoon',
        applicationCategory: 'GameApplication',
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
          $10K Start &middot; 20 Days &middot; 8 Cards &middot; Market Events &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Market Tycoon</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Can you beat the card market? Start with $10,000 in cash, trade 8 real sports cards
          over 20 market days, navigate injuries, awards, and market events. Maximize your portfolio.
        </p>
      </div>

      <MarketTycoonClient />

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
        <h2 className="text-xl font-bold text-white mb-4">More Games & Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/card-roulette', label: 'Card Roulette', icon: '🎰' },
            { href: '/card-streak', label: 'Card Streak', icon: '🔥' },
            { href: '/tools/portfolio', label: 'Fantasy Portfolio', icon: '📈' },
            { href: '/tools/investment-calc', label: 'Investment Calculator', icon: '📊' },
            { href: '/tools/flip-calc', label: 'Flip Profit Calculator', icon: '💰' },
            { href: '/card-auction', label: 'Auction Showdown', icon: '🔨' },
          ].map(t => (
            <Link key={t.href} href={t.href}
              className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl text-sm text-gray-300 hover:text-white transition-colors">
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import MarketSectorsClient from './MarketSectorsClient';

export const metadata: Metadata = {
  title: 'Card Market Sector Report — Performance by Category | CardVault',
  description: 'Comprehensive sports card market analysis by sector. Track performance of vintage cards, modern rookies, sealed products, graded slabs, memorabilia, and prospects. Sector rotation signals, investment implications, and actionable insights updated daily.',
  openGraph: {
    title: 'Card Market Sector Report — CardVault',
    description: 'Sports card market broken down by sector. Vintage, modern, sealed, graded, memorabilia, and prospects performance analysis.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Market Sector Report — CardVault',
    description: 'Which card sectors are hot right now? Full performance breakdown with investment signals.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Market', href: '/market-movers' },
  { label: 'Sector Report' },
];

const faqItems = [
  {
    question: 'What are the main sectors of the sports card market?',
    answer: 'The sports card market is divided into six major sectors: Vintage (pre-1980 cards valued for scarcity and history), Modern Rookies (current star and rookie cards that fluctuate with player performance), Sealed Products (unopened boxes and packs that appreciate as print runs deplete), Graded Cards (PSA, BGS, CGC, SGC authenticated cards that trade at premiums), Memorabilia & Patches (game-used jersey, bat, or patch cards with unique embedded materials), and Prospects (pre-debut or minor league cards that represent speculative plays on future performance).',
  },
  {
    question: 'What is sector rotation in the card market?',
    answer: 'Sector rotation describes the natural movement of collector and investor interest between different segments of the card market over time. For example, during the NFL draft season, prospect cards surge while vintage cards may cool. In the off-season, sealed products often gain attention as collectors look for value. Understanding these cycles helps collectors buy low in sectors experiencing less attention and sell when sectors heat up. The sector rotation pattern typically follows: Prospects (pre-season) → Modern Rookies (season) → Vintage (year-round steady) → Sealed (off-season).',
  },
  {
    question: 'Which card market sector is the safest investment?',
    answer: 'Vintage cards (pre-1980) are generally considered the safest long-term investment in sports cards. Their supply is permanently fixed and decreasing as cards are lost or damaged over time. Key vintage cards from the 1952 Topps, 1986 Fleer, and 1979 O-Pee-Chee sets have shown consistent appreciation over decades regardless of broader market conditions. However, they require more capital upfront and have less liquidity than modern cards.',
  },
  {
    question: 'How do I use sector data to make collecting decisions?',
    answer: 'The sector report helps you identify which categories are overheated (caution zone) versus undervalued (opportunity zone). When a sector shows "Overheated" status with high momentum scores, it may be a good time to sell holdings in that category. When a sector shows "Undervalued" or "Cooling" status, it may present buying opportunities. Combine sector analysis with sport-specific seasonality — for example, basketball cards typically peak during the NBA playoffs (April-June) and cool during the football season (September-January).',
  },
  {
    question: 'How often is the sector data updated?',
    answer: 'The sector performance indicators are calculated daily using a combination of our card database metrics (price ranges, volume, grade distributions) and seasonal market patterns. The model factors in sport-specific seasonality (baseball peak Feb-April, football August-October, basketball October-June, hockey October-June), day-of-week trading patterns (weekend activity is typically lower), and broader market cycle indicators. While individual card prices are estimates, the relative sector performance and rotation signals reflect real market dynamics observed across major auction houses and marketplaces.',
  },
];

export default function MarketSectorsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Market Sector Report',
        description: 'Sports card market performance analysis by sector. Track vintage, modern, sealed, graded, memorabilia, and prospect sectors.',
        url: 'https://cardvault-two.vercel.app/market-sectors',
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
        <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-800/50 text-indigo-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
          6 Sectors &middot; Daily Signals &middot; Rotation Tracking
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Market Sector Report</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          The card market isn&apos;t one market — it&apos;s six. Track performance across vintage, modern rookies, sealed products, graded slabs, memorabilia, and prospects. Spot sector rotation before the crowd.
        </p>
      </div>

      <MarketSectorsClient />

      {/* Related pages */}
      <section className="mt-16 mb-12">
        <h2 className="text-xl font-bold text-white mb-4">Related Market Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/market-movers', label: 'Market Movers', icon: '📈' },
            { href: '/fear-greed', label: 'Fear & Greed Index', icon: '😱' },
            { href: '/tools/market-dashboard', label: 'Market Dashboard', icon: '📊' },
            { href: '/tools/seasonality', label: 'Seasonality Guide', icon: '📅' },
            { href: '/tools/investment-return', label: 'Investment Return Calc', icon: '💰' },
            { href: '/tools/stress-test', label: 'Portfolio Stress Test', icon: '🧪' },
            { href: '/hobby-timeline', label: 'Hobby Timeline', icon: '📜' },
            { href: '/tools/trend-predictor', label: 'Trend Predictor', icon: '🔮' },
          ].map(t => (
            <Link key={t.href} href={t.href} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-lg text-sm transition-colors">
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/50 border border-gray-700/50 rounded-xl">
              <summary className="cursor-pointer px-5 py-4 text-white font-medium text-sm flex items-center justify-between">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform ml-2">&#9662;</span>
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </section>

      <section className="border-t border-gray-800 pt-8 mt-8 text-sm text-gray-500">
        <p>
          Pair this with the <Link href="/fear-greed" className="text-emerald-400 hover:underline">Fear &amp; Greed Index</Link> for overall market sentiment,
          the <Link href="/tools/seasonality" className="text-emerald-400 hover:underline">Seasonality Guide</Link> for timing,
          and <Link href="/market-movers" className="text-emerald-400 hover:underline">Market Movers</Link> for individual card momentum.
          Browse <Link href="/tools" className="text-emerald-400 hover:underline">84+ collecting tools</Link>.
        </p>
      </section>
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import SeasonalCalendarClient from './SeasonalCalendarClient';

export const metadata: Metadata = {
  title: 'When to Buy & Sell Sports Cards — Seasonal Calendar Guide | CardVault',
  description: 'Month-by-month guide to the best times to buy and sell sports cards. See buy/sell/hold signals for baseball, basketball, football, and hockey cards. Key events like the NFL Draft, World Series, and NBA Finals that move card prices. Free interactive calendar.',
  openGraph: {
    title: 'When to Buy & Sell Sports Cards — Seasonal Calendar | CardVault',
    description: 'Month-by-month buy/sell/hold signals for baseball, basketball, football, and hockey cards. Key events that move card prices.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'When to Buy & Sell Sports Cards — Seasonal Calendar',
    description: 'The best times to buy and sell sports cards, month by month. Free interactive calendar.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Seasonal Calendar' },
];

const faqItems = [
  {
    question: 'When is the best time to buy sports cards?',
    answer: 'The best time to buy sports cards depends on the sport. Baseball cards are cheapest in January and November when the off-season reduces demand. Basketball and hockey cards are cheapest in July and August during their off-seasons. Football cards dip in late February after the Super Bowl and again in May after the NFL Draft hype fades. The general rule is to buy during a sport\'s off-season and sell during peak-season events like playoffs and championships.',
  },
  {
    question: 'When is the best time to sell sports cards?',
    answer: 'Sell sports cards when demand is highest: football cards peak around the NFL Draft (late April) and during the NFL season (September-January). Baseball cards peak during the MLB All-Star Game (July) and World Series (October). Basketball cards peak during All-Star Weekend (February) and the NBA Finals (June). Hockey cards peak during the Stanley Cup Playoffs (April-June). Holiday season (December) also drives higher prices across all sports due to gift-buying demand.',
  },
  {
    question: 'What events cause sports card prices to spike?',
    answer: 'The biggest card price catalysts are: the NFL Draft (prospect cards spike 50-200%), the Super Bowl (winning team cards spike), NBA and NHL championship wins (champion cards spike 30-50%), player awards like MVP and Rookie of the Year (winner cards spike), major trades to contending teams (15-25% spike), and breakout performances in the first weeks of a new season. Injuries cause immediate price drops. The key is to position before the event, not after.',
  },
  {
    question: 'Do sports card prices follow predictable seasonal patterns?',
    answer: 'Yes, sports card prices follow surprisingly predictable seasonal cycles driven by each sport\'s schedule. The pattern repeats annually: prices rise during a sport\'s active season (especially playoffs), peak around championship events, then decline during the off-season. This cycle is well-known among experienced collectors and dealers, but new collectors often buy at peak demand (when cards are most expensive) instead of during off-season dips.',
  },
  {
    question: 'Should I buy cards during Black Friday and holiday sales?',
    answer: 'Black Friday and holiday sales are great for sealed product (hobby boxes, blasters) but not necessarily for individual cards. Retailers discount sealed product to move inventory, so you can find 15-30% off hobby boxes. However, individual card prices on eBay and marketplaces actually increase during December due to gift-buying demand. The smart move is to buy sealed product on Black Friday and buy individual cards during the off-season months.',
  },
];

export default function SeasonalCalendarPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Seasonal Calendar — When to Buy & Sell Sports Cards',
        description: 'Interactive month-by-month guide showing the best times to buy and sell sports cards across baseball, basketball, football, and hockey.',
        url: 'https://cardvault-two.vercel.app/seasonal-calendar',
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

      <Breadcrumb items={breadcrumbs} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          12 Months - 4 Sports - Buy/Sell/Hold Signals
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Market Seasonal Calendar
        </h1>
        <p className="text-white/60 text-lg max-w-3xl">
          The best times to buy and sell sports cards follow predictable seasonal patterns. This interactive calendar shows month-by-month buy, sell, and hold signals for baseball, basketball, football, and hockey cards — plus the key events that move prices.
        </p>
      </div>

      <SeasonalCalendarClient />

      {/* FAQ Section */}
      <div className="mt-12 bg-white/[0.03] border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((faq, i) => (
            <div key={i} className="border-b border-white/5 pb-5 last:border-0 last:pb-0">
              <h3 className="text-base font-semibold text-white/90 mb-2">{faq.question}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA / Internal Links */}
      <div className="mt-8 text-center">
        <p className="text-white/50 text-sm mb-4">
          Want more market intelligence?
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/market-analysis" className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors">
            Daily Market Analysis
          </Link>
          <Link href="/market-data" className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors">
            Market Data Room
          </Link>
          <Link href="/tools/seasonality" className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors">
            Seasonality Guide
          </Link>
          <Link href="/card-catalysts" className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors">
            Price Catalysts
          </Link>
          <Link href="/tools" className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors">
            All Tools
          </Link>
        </div>
      </div>
    </div>
  );
}

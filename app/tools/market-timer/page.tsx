import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import MarketTimerClient from './MarketTimerClient';

export const metadata: Metadata = {
  title: 'Card Market Timer — When to Buy & Sell Sports Cards | CardVault',
  description: 'Free card market timing tool. See the best months to buy and sell sports cards by sport and card type. Seasonal calendar, key events, current verdict, and pro tips for baseball, basketball, football, and hockey cards.',
  alternates: { canonical: './' },
  openGraph: {
    title: 'Card Market Timer — When to Buy & Sell Sports Cards | CardVault',
    description: 'Seasonal timing calendar for buying and selling sports cards. Best months, key events, pro tips.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Market Timer — CardVault',
    description: 'When to buy and sell sports cards. Seasonal calendar by sport. Free tool.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Card Market Timer' },
];

const faqItems = [
  {
    question: 'When is the best time to buy sports cards?',
    answer: 'The best time to buy sports cards is during the offseason for that sport. Baseball cards are cheapest November-January, basketball cards July-September, football cards March-June, and hockey cards July-September. During these periods, collector attention shifts to in-season sports, reducing demand and prices by 15-30% on average.',
  },
  {
    question: 'When should I sell my sports cards?',
    answer: 'Sell during peak demand periods: baseball cards during Spring Training and All-Star break (March-April, July), basketball cards at season start and All-Star Weekend (October, February), football cards at season opener and playoffs (September, January), and hockey cards at Young Guns release (October). Player-specific events like breakout performances, playoff runs, and awards can also create optimal sell windows.',
  },
  {
    question: 'Do vintage cards follow the same seasonal patterns?',
    answer: 'Vintage cards (pre-1990) are less affected by seasonal patterns than modern cards. Their prices are more influenced by major auction house schedules (Heritage Auctions in February and August), collector conventions like The National, and broader market sentiment. Vintage cards tend to appreciate steadily with less volatility than modern cards.',
  },
  {
    question: 'How does the NFL Draft affect card prices?',
    answer: 'The NFL Draft creates a short hype cycle: prospect cards spike in the weeks before the draft as speculation builds. After the draft, prices often drop 15-30% within a month as the initial excitement fades. The best buying window for draft picks is May-June, after the post-draft hype dies down but before training camp generates new attention.',
  },
  {
    question: 'Should I buy sealed product on release day or wait?',
    answer: 'For most products, waiting 4-6 weeks after release saves 20-40% as supply normalizes. However, there are exceptions: limited-run hobby products and products with confirmed low print runs can appreciate immediately. For long-term sealed investment, buying at or near retail on release day and holding 2-5 years has historically provided the best returns, as supply dries up over time.',
  },
];

export default function MarketTimerPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Market Timer',
        description: 'Free card market timing tool. Seasonal calendar showing best months to buy and sell sports cards by sport and card type.',
        url: 'https://cardvault-two.vercel.app/tools/market-timer',
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

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-800/50 text-indigo-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
          4 Sports &bull; 5 Card Types &bull; 12-Month Calendar &bull; Key Events &bull; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
          Card Market Timer
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          When is the best time to buy or sell your cards? Use our seasonal timing calendar to find the optimal windows for each sport and card type.
        </p>
      </div>

      <MarketTimerClient />

      {/* FAQ Section */}
      <div className="mt-12 border-t border-slate-800 pt-10">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((item, i) => (
            <div key={i}>
              <h3 className="text-sm font-bold text-white mb-2">{item.question}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 text-center">
        <Link href="/tools" className="text-indigo-400 hover:text-indigo-300 text-sm">
          &larr; Back to All Tools
        </Link>
      </div>
    </div>
  );
}
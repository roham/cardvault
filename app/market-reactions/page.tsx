import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import MarketReactionsClient from './MarketReactionsClient';

export const metadata: Metadata = {
  title: 'Card Market Reactions — How Sports Events Impact Card Values | CardVault',
  description: 'See how real-world sports events move the card market. Trade rumors, injuries, awards, draft picks, and milestone performances — watch card values react in real time. Daily simulated events with impact scores and strategy tips.',
  openGraph: {
    title: 'Card Market Reactions — Event Impact Simulator | CardVault',
    description: 'How do sports events impact card values? Watch trade rumors, injuries, awards, and draft picks move the market.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Market Reactions — CardVault',
    description: 'See how real-world sports events impact card values. Daily event simulations with market impact analysis.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Live', href: '/live-hub' },
  { label: 'Market Reactions' },
];

const faqItems = [
  {
    question: 'What is Card Market Reactions?',
    answer: 'Card Market Reactions is a daily simulator that shows how real-world sports events impact card collecting values. Each day features 6 simulated breaking events — trade rumors, injury reports, award announcements, draft picks, milestone performances, and game results — along with their market impact analysis. For each event, you can see which cards spike in value, which decline, and what strategy to use. It helps collectors understand the cause-and-effect relationship between sports news and card prices.',
  },
  {
    question: 'How are the daily events generated?',
    answer: 'Events are algorithmically generated using a date-based seed, so every visitor sees the same events on the same day. The event types, affected players, impact magnitudes, and card price movements are all deterministically calculated from our database of 8,000+ real sports cards. While the specific events are simulated, they represent realistic scenarios that regularly occur in sports — the kind of news that actually moves card markets.',
  },
  {
    question: 'What do the impact scores mean?',
    answer: 'Each event receives an Impact Score from 1 to 10 based on how significantly it would affect card values. A score of 1-3 means minimal market impact — prices might nudge slightly. A score of 4-6 indicates moderate impact with noticeable price swings. A score of 7-9 means major impact that could move entire sectors. A perfect 10 represents a once-in-a-decade event like a generational player trade or a record-breaking performance that reshapes the market.',
  },
  {
    question: 'How should I use this to improve my collecting?',
    answer: 'Use Market Reactions to develop pattern recognition for how different event types affect card values. Key patterns: trade rumors spike both the player leaving and the new team\'s existing stars. Injuries temporarily suppress prices (buying opportunity). Awards and milestones create short-term spikes that often correct. Draft picks permanently elevate rookie card demand. Understanding these patterns helps you react faster when real events happen and avoid panic buying or selling.',
  },
  {
    question: 'Are the price changes based on real market data?',
    answer: 'The base card values come from our real database of estimated market prices. The price reactions to events are simulated using realistic impact models — for example, a trade rumor typically moves prices 5-15%, an injury drops values 10-30%, and award announcements can spike prices 10-25%. These ranges are based on observed patterns in real card markets. For actual current pricing, check our Price Guide or Market Movers page.',
  },
];

export default function MarketReactionsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Market Reactions — Event Impact Simulator',
        description: 'See how real-world sports events impact card values. Daily simulated events with market impact analysis and strategy tips.',
        url: 'https://cardvault-two.vercel.app/market-reactions',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Any',
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
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
          Card Market Reactions
        </h1>
        <p className="text-zinc-400">
          How do sports events move the card market? See today&#39;s breaking events and their impact on card values.
        </p>
      </div>

      <MarketReactionsClient />

      {/* FAQ Section */}
      <div className="mt-12 border-t border-zinc-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((f, i) => (
            <div key={i}>
              <h3 className="text-white font-semibold mb-2">{f.question}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{f.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Internal Links */}
      <div className="mt-10 border-t border-zinc-800 pt-8">
        <h2 className="text-lg font-bold text-white mb-4">More Live Features</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: '/market-movers', title: 'Market Movers', desc: 'Today\'s biggest gainers and losers' },
            { href: '/market-scoreboard', title: 'Market Scoreboard', desc: 'Bulls vs Bears live market game' },
            { href: '/flip-of-the-day', title: 'Flip of the Day', desc: 'Daily card deal — vote FLIP or SKIP' },
            { href: '/card-catalysts', title: 'Price Catalysts', desc: 'Events that move card prices' },
            { href: '/market-weather', title: 'Market Weather Report', desc: 'Weather-style market conditions' },
            { href: '/market-alerts', title: 'Market Alerts', desc: 'Real-time price notifications' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="block p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 hover:border-zinc-600 transition-colors">
              <div className="text-white font-medium text-sm">{link.title}</div>
              <div className="text-zinc-500 text-xs mt-0.5">{link.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

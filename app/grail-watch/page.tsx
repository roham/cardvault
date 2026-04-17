import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import GrailWatchClient from './GrailWatchClient';

export const metadata: Metadata = {
  title: 'Grail Watch Live — $1K+ Card Moments Feed | CardVault',
  description: 'Live simulated feed of grail-tier card events — $1K+ auction hammers, private sales, trade packages, break pulls, and graded-gem returns. Watch the high end of the hobby move in real time.',
  openGraph: {
    title: 'Grail Watch Live — CardVault',
    description: 'Grail-only live feed. $1K+ auction hammers, sales, pulls, mails. Five context streams in one ticker.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Grail Watch Live — CardVault',
    description: 'Live-simulated feed of $1K+ card moments — hammers, sales, pulls, mails, all in one stream.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Live', href: '/live-hub' },
  { label: 'Grail Watch' },
];

const faqItems = [
  {
    question: 'What counts as a grail?',
    answer: 'For Grail Watch, a "grail" is any card with an estimated fair-market value of $1,000 or more. You can raise the bar with filter chips: $5K+, $10K+, or $50K+. Below $1K, events are filtered out entirely — this feed is curated to the high end of the hobby.',
  },
  {
    question: 'What are the five context streams?',
    answer: 'Every event on Grail Watch is tagged with one of five contexts. AUCTION HAMMER: a live-auction lot closes with a buyer premium. PRIVATE SALE: a dealer-to-collector or collector-to-collector deal closes off-market. TRADE PACKAGE: a peer-to-peer swap where the grail changes hands as part of a multi-card deal. BREAK PULL: a live group break produces a grail from sealed wax. MAILDAY RETURN: a graded gem returns from PSA, BGS, CGC, SGC, or TAG. The context determines the card\u2019s journey and price-discovery dynamics.',
  },
  {
    question: 'Is this showing real sales?',
    answer: 'No. Every event on Grail Watch is simulated using CardVault\u2019s 10,000-card database with weighted selection toward value-tier membership. This is a live-feel demonstration of what a grail-aggregator ticker COULD look like if it were hooked to live data sources from Goldin, Heritage, PWCC, eBay Live, Whatnot, and grader APIs. Use it for entertainment and to learn what a grail moment looks like across contexts \u2014 not as a record of actual historical sales.',
  },
  {
    question: 'How do the filters work?',
    answer: 'The value-tier filter acts as a floor: selecting $5K+ hides $1K\u2013$4.999K events, $10K+ hides $1K\u2013$9.999K, $50K+ hides everything under $50K. The context filter is inclusive: toggling OFF a context removes only that stream. The sport filter is inclusive the same way. Pause halts the event timer while keeping the existing feed visible. All filter combinations can be stacked.',
  },
  {
    question: 'Can I follow specific cards?',
    answer: 'Yes. Every event in the feed has a star button. Starring a card adds it to your Watchlist panel (persisted in localStorage). Future simulated events involving that exact card slug appear in the Watchlist stream separately from the main feed. Good for tracking when a specific grail reappears across contexts.',
  },
  {
    question: 'How is Grail Watch different from Mailday Live, Pop Watch, or Listing Wire?',
    answer: 'Mailday Live surfaces ALL arrivals (raw, penny breaks, junk wax included). Pop Watch tracks grading-population velocity across all price points. Listing Wire shows listing churn regardless of price. Grail Watch only surfaces the $1K+ end of the hobby, across all five transaction contexts at once. It is the one ticker a high-end collector or market-watcher can leave running for the day.',
  },
];

export default function GrailWatchPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Breadcrumb items={breadcrumbs} />
      <header className="mb-6">
        <div className="inline-flex items-center gap-2 mb-2">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">Live Simulation</span>
        </div>
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-600 bg-clip-text text-transparent">
          Grail Watch Live
        </h1>
        <p className="text-lg text-gray-700">
          The $1K+ ticker. Auction hammers, private sales, trade packages, break pulls, and graded-gem returns — one feed for every grail-tier moment in the hobby.
        </p>
      </header>

      <GrailWatchClient />

      <section className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Related</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Link href="/mailday" className="p-3 rounded-lg border border-gray-200 hover:border-amber-400 hover:bg-amber-50 transition">
            <div className="font-semibold text-sm">Mailday Live</div>
            <div className="text-xs text-gray-600">All-tier arrivals feed</div>
          </Link>
          <Link href="/pop-watch" className="p-3 rounded-lg border border-gray-200 hover:border-amber-400 hover:bg-amber-50 transition">
            <div className="font-semibold text-sm">Pop Watch</div>
            <div className="text-xs text-gray-600">Grading population velocity</div>
          </Link>
          <Link href="/listing-wire" className="p-3 rounded-lg border border-gray-200 hover:border-amber-400 hover:bg-amber-50 transition">
            <div className="font-semibold text-sm">Listing Wire</div>
            <div className="text-xs text-gray-600">Live marketplace listings</div>
          </Link>
          <Link href="/auction-wire" className="p-3 rounded-lg border border-gray-200 hover:border-amber-400 hover:bg-amber-50 transition">
            <div className="font-semibold text-sm">Auction Wire</div>
            <div className="text-xs text-gray-600">Auction-only events</div>
          </Link>
          <Link href="/rip-wire" className="p-3 rounded-lg border border-gray-200 hover:border-amber-400 hover:bg-amber-50 transition">
            <div className="font-semibold text-sm">Rip Wire</div>
            <div className="text-xs text-gray-600">Live pack-pull reactions</div>
          </Link>
          <Link href="/auction-archive" className="p-3 rounded-lg border border-gray-200 hover:border-amber-400 hover:bg-amber-50 transition">
            <div className="font-semibold text-sm">Auction Archive</div>
            <div className="text-xs text-gray-600">Historic grail hammers</div>
          </Link>
        </div>
      </section>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Grail Watch Live',
          url: 'https://cardvault-two.vercel.app/grail-watch',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Any',
          description:
            'Simulated live feed of $1K+ sports card events across five transaction contexts: auction hammer, private sale, trade package, break pull, and mailday return. Filters by value tier, context, and sport. Starrable watchlist for per-card tracking.',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqItems.map((i) => ({
            '@type': 'Question',
            name: i.question,
            acceptedAnswer: { '@type': 'Answer', text: i.answer },
          })),
        }}
      />
    </main>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import AuctionTickerClient from './AuctionTickerClient';

export const metadata: Metadata = {
  title: 'Live Auction Ticker — Real-Time Sports Card Auction Results | CardVault',
  description: 'Watch sports card auction results as they happen. Live feed of sales from eBay, Goldin, Heritage, PWCC, MySlabs, and Whatnot. Auction heat index, buyer types, and bid counts across all four major sports. Free real-time card market intelligence.',
  openGraph: {
    title: 'Live Auction Ticker — CardVault',
    description: 'Real-time sports card auction results. See what is selling, at what price, and on which platform.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Live Auction Ticker — CardVault',
    description: 'Real-time card auction results from 6 platforms. Prices, bids, grades, and buyer types.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Live', href: '/live-hub' },
  { label: 'Auction Ticker' },
];

const faqItems = [
  {
    question: 'What is the Live Auction Ticker?',
    answer: 'The Live Auction Ticker is a real-time feed of sports card auction results from major platforms including eBay, Goldin, Heritage, PWCC, MySlabs, and Whatnot. Each entry shows the card sold, hammer price, number of bids, buyer type, and auction house. The feed updates continuously throughout the day to give you a pulse on what is selling right now.',
  },
  {
    question: 'What does the Auction Heat Index measure?',
    answer: 'The Auction Heat Index (0-100) measures overall auction market activity and intensity. A score above 70 indicates a hot market with aggressive bidding and high sell-through rates. Between 40-70 is normal market activity. Below 40 suggests a slower market with fewer competitive auctions. The index factors in bid counts, sale prices relative to estimates, and the percentage of sales classified as hot.',
  },
  {
    question: 'What determines if an auction is marked as HOT?',
    answer: 'An auction is marked HOT when it receives more than 25 bids or when the hammer price exceeds $1,000. These thresholds indicate significant collector interest. Hot auctions typically feature high-demand rookie cards, graded gems (PSA 10 or BGS 9.5+), or cards of players having exceptional on-field performances. Filtering to see only hot auctions gives you a quick view of where the market energy is concentrated.',
  },
  {
    question: 'What do the buyer types mean?',
    answer: 'Buyer types indicate the likely motivation behind the purchase. Collectors buy for personal collections and long-term enjoyment. Flippers buy to resell quickly at a profit. Investors buy and hold for appreciation. Dealers buy for retail inventory. Museums acquire historically significant cards. First-Timers are new to card auctions. Knowing who is buying helps you understand market dynamics — heavy investor buying suggests price appreciation expectations.',
  },
  {
    question: 'How can I use the auction ticker to make buying decisions?',
    answer: 'Watch for patterns: if the same card sells multiple times at increasing prices, demand is building. If a card appears frequently with low bid counts, supply may be outpacing demand (potential buying opportunity). The auction house filter helps you compare platforms — some houses consistently get higher prices for certain types of cards. Use the sport filter to track your specific collecting focus and identify emerging trends.',
  },
];

export default function AuctionTickerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Live Auction Ticker',
        description: 'Real-time sports card auction results from major platforms. Live feed with prices, bids, and market heat.',
        url: 'https://cardvault-two.vercel.app/auction-ticker',
        applicationCategory: 'UtilitiesApplication',
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
        <div className="inline-flex items-center gap-2 bg-red-950/60 border border-red-800/50 text-red-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          Live Feed &middot; 6 Auction Houses &middot; 4 Sports
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Live Auction Ticker
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Real-time auction results from eBay, Goldin, Heritage, PWCC, MySlabs, and Whatnot.
          See what&apos;s selling, at what price, and who&apos;s buying. The pulse of the card market.
        </p>
      </div>

      <AuctionTickerClient />

      {/* FAQ Section */}
      <div className="mt-16 border-t border-zinc-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((faq, i) => (
            <div key={i}>
              <h3 className="font-semibold text-white mb-2">{faq.question}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Pages */}
      <div className="mt-12 border-t border-zinc-800 pt-8">
        <p className="text-sm text-zinc-500">
          Explore more: <Link href="/market-movers" className="text-amber-400 hover:underline">Market Movers</Link>
          {' '}&middot;{' '}
          <Link href="/price-ticker" className="text-amber-400 hover:underline">Price Ticker</Link>
          {' '}&middot;{' '}
          <Link href="/market-alerts" className="text-amber-400 hover:underline">Market Alerts</Link>
          {' '}&middot;{' '}
          <Link href="/auction" className="text-amber-400 hover:underline">Auction House</Link>
          {' '}&middot;{' '}
          <Link href="/hobby-awards" className="text-amber-400 hover:underline">2025 Hobby Awards</Link>
        </p>
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import FlipOfTheDayClient from './FlipOfTheDayClient';

export const metadata: Metadata = {
  title: 'Flip of the Day — Daily Card Deal Challenge | CardVault',
  description: 'Should you flip it or skip it? Every day we feature one sports card deal — vote whether you\'d buy to resell. See the community consensus, track your profit, and sharpen your card flipping instincts.',
  openGraph: {
    title: 'Flip of the Day — Daily Card Flip Challenge | CardVault',
    description: 'Daily sports card deal — vote FLIP or SKIP, see community results, track your profit. Train your card flipping instincts.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Flip of the Day — CardVault',
    description: 'Daily card deal challenge. Vote FLIP or SKIP, see what the community thinks.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Live', href: '/live-hub' },
  { label: 'Flip of the Day' },
];

const faqItems = [
  {
    question: 'What is Flip of the Day?',
    answer: 'Flip of the Day is a daily card collecting challenge. Each day we feature one sports card with a deal price from a realistic buying scenario — card shows, estate sales, garage sales, or online marketplace listings. You vote whether you\'d buy the card to resell (FLIP) or pass on the deal (SKIP). After voting, you see the community consensus and your potential profit or loss. It\'s a fun way to sharpen your card pricing instincts and learn what makes a good flip.',
  },
  {
    question: 'How is the daily card selected?',
    answer: 'The daily card is algorithmically selected using a date-based seed, meaning everyone sees the same card on the same day. Cards are drawn from our database of 8,000+ real sports cards across baseball, basketball, football, and hockey. The deal scenario (card show find, estate sale, garage sale, etc.) and discount percentage are also deterministically generated so the experience is consistent for all collectors.',
  },
  {
    question: 'How is profit calculated?',
    answer: 'Profit is calculated as the difference between the card\'s estimated market value and the asking price. If you vote FLIP, we calculate your potential profit by subtracting the asking price from the market value. The sell platform breakdown shows your net profit after fees on each platform (eBay 13%, COMC 20%, Mercari 10%, MySlabs 8%, Card Show 0%). Real flipping also involves shipping costs and time, which aren\'t factored into the base calculation.',
  },
  {
    question: 'What do the verdict ratings mean?',
    answer: 'STRONG FLIP means the deal offers 40%+ ROI — a genuine steal that most experienced flippers would jump on. DECENT FLIP means 20-40% ROI — a solid deal with comfortable margin. MARGINAL means 5-20% ROI — barely profitable after fees, only worth it if you can sell at a card show (no fees). SKIP IT means under 5% ROI — the margin is too thin to justify the effort and risk.',
  },
  {
    question: 'Are the deals based on real market data?',
    answer: 'The card values are based on real estimated market prices from our database. The deal scenarios are simulated but represent realistic buying situations that collectors encounter regularly — card show tables, estate sales, local card shop clearance bins, and online marketplace listings. Use this as a training tool to develop your instinct for spotting good deals in real life.',
  },
];

export default function FlipOfTheDayPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Flip of the Day — Daily Card Deal Challenge',
        description: 'Daily sports card deal challenge. Vote FLIP or SKIP, see community results, track your profit, and sharpen your flipping instincts.',
        url: 'https://cardvault-two.vercel.app/flip-of-the-day',
        applicationCategory: 'GameApplication',
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
          Flip of the Day
        </h1>
        <p className="text-zinc-400">
          One card. One deal. Should you buy to resell? Vote daily and track your flipping instincts.
        </p>
      </div>

      <FlipOfTheDayClient />

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
            { href: '/hot-deals', title: 'Hot Card Deals', desc: 'Daily price drops and undervalued listings' },
            { href: '/rip-or-skip', title: 'Rip or Skip', desc: 'Daily vote on sealed products' },
            { href: '/market-movers', title: 'Market Movers', desc: 'Today\'s biggest gainers and losers' },
            { href: '/tools/flip-calc', title: 'Flip Profit Calculator', desc: 'Calculate exact profit after fees' },
            { href: '/trade-wall', title: 'Live Trade Wall', desc: 'Real-time card trading floor' },
            { href: '/tools/dealer-scanner', title: 'Dealer Scanner', desc: 'Fast mobile pricing for card shows' },
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

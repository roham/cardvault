import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import BestOfferClient from './BestOfferClient';

export const metadata: Metadata = {
  title: 'Best Offer Calculator — Accept, Counter, or Reject? Instant Decision for Card Sellers',
  description: 'Free Best Offer decision tool for eBay, Whatnot, COMC, MySlabs, and PWCC sellers. Enter your ask, the offer received, and your cost basis — get an instant Accept / Counter / Reject verdict with net proceeds, suggested counter price, and three ready-to-send counter scripts. Stop second-guessing Best Offers.',
  openGraph: {
    title: 'Best Offer Calculator — CardVault',
    description: 'Should you accept, counter, or reject that Best Offer? Get an instant verdict with net proceeds and counter scripts.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Best Offer Calculator — CardVault',
    description: 'Instant Accept/Counter/Reject verdict for eBay & marketplace Best Offers.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Best Offer Calculator' },
];

const faqItems = [
  {
    question: 'What percentage of asking price should I accept on a Best Offer?',
    answer: 'The consensus flipper target is 85–92% of asking price for a listing in its first 30 days. Below 85% usually means the asking was aspirational; above 92% is rare and should be accepted immediately. After 30 days with no serious action, the floor drops to 75–80% because stale listings lose search rank on eBay and conversion probability falls sharply.',
  },
  {
    question: 'How do I calculate a fair counter offer?',
    answer: 'Split-the-difference (midpoint between ask and offer) is the classic move and keeps the buyer engaged. A more aggressive tactic is countering at 93% of asking — signals a small concession without capitulating. Countering at your original asking price (no concession) usually kills the negotiation. Avoid ending your counter in a round number like $100 or $150; $97 or $148 reads as more calculated and less like a bluff.',
  },
  {
    question: 'What eBay fees come out of a Best Offer sale?',
    answer: 'eBay takes 13.25% final value fee on the sold price (plus shipping if buyer paid) and $0.40 per order (rising to $0.40 on lower-priced items from the old $0.30). If you use Promoted Listings Standard, add another 2–15% ad rate. On a $100 accepted offer, expect ~$13.65 in eBay fees before shipping. Factor this in before accepting — a $100 offer nets ~$86 after fees, not $100.',
  },
  {
    question: 'How long should I wait before accepting a lowball Best Offer?',
    answer: 'eBay Best Offers auto-expire in 48 hours. If the offer is within 10% of your walk-away price, counter immediately with your lowest acceptable number — do not wait and hope. If the offer is more than 20% below asking, counter or decline within 4 hours so the buyer feels engaged. Letting a Best Offer sit past 24 hours is the #1 reason buyers retract.',
  },
  {
    question: 'Is it better to accept a Best Offer or hold for the asking price?',
    answer: 'Run the expected value math: probability of selling at asking × net proceeds at asking, vs probability of selling at offer × net proceeds at offer. For a listing with an active Best Offer, the offer probability is 100%. For a listing without, the probability it sells at asking within 30 days is typically 15–35% depending on card, platform, and comps. If 100% × offer net > 30% × asking net, accept. The Best Offer Calculator above runs this math for you.',
  },
  {
    question: 'Should I counter if the buyer already countered me?',
    answer: 'Yes — unless their counter is at or below your walk-away price. A typical negotiation is offer → counter → counter → accept, and 70% of successful eBay Best Offer deals involve 2+ rounds of countering. If the buyer re-counters within $5–$10 of your last counter, accept to close the deal. If they drop more than 10% below your counter, they are not serious — decline.',
  },
  {
    question: 'Do Best Offer sales hurt my eBay search rank?',
    answer: 'No — eBay treats a Best Offer acceptance as a completed sale for search relevance purposes. In fact, listings with Best Offer enabled rank slightly higher in "Best Match" because eBay favors flexible sellers. The only rank hit comes from declining too many offers (3+ auto-declines in a week can depress impressions). Counter-offers do not hurt rank; outright declines accumulate.',
  },
  {
    question: 'How is this different from the Negotiation Calculator?',
    answer: 'The Negotiation Calculator is buyer-side — it tells you what to offer when buying a card. The Best Offer Calculator is seller-side — it tells you how to respond when you receive an offer on your listing. Opposite sides of the same transaction. Use Negotiation when you are shopping; use Best Offer when your listing is live and an offer comes in.',
  },
];

export default function BestOfferPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Best Offer Calculator',
        description: 'Free seller-side Best Offer decision tool with Accept/Counter/Reject verdict, net proceeds, suggested counter price, and counter scripts.',
        url: 'https://cardvault-two.vercel.app/tools/best-offer',
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
        <div className="inline-flex items-center gap-2 bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
          Seller-side - Instant Verdict - Counter Scripts - Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Best Offer Calculator</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          That Best Offer notification just popped. Accept, counter, or reject? Enter your ask, the offer, and your cost basis — get an instant verdict with net proceeds, a smart counter price, and three ready-to-send scripts.
        </p>
      </div>

      <BestOfferClient />

      <div className="mt-12 bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((item, i) => (
            <div key={i} className="border-b border-gray-700/50 pb-5 last:border-0 last:pb-0">
              <h3 className="text-white font-semibold mb-2">{item.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Related Seller Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link href="/tools/flip-calc" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">💰</span>
            <div>
              <div className="text-white text-sm font-medium">Flip Profit</div>
              <div className="text-gray-500 text-xs">Margin after fees</div>
            </div>
          </Link>
          <Link href="/tools/negotiation-calc" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">🤝</span>
            <div>
              <div className="text-white text-sm font-medium">Negotiation Calc</div>
              <div className="text-gray-500 text-xs">Buyer-side offers</div>
            </div>
          </Link>
          <Link href="/tools/ebay-fee-calc" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">🏷️</span>
            <div>
              <div className="text-white text-sm font-medium">eBay Fee Calc</div>
              <div className="text-gray-500 text-xs">Platform breakdown</div>
            </div>
          </Link>
          <Link href="/tools/listing-generator" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">📝</span>
            <div>
              <div className="text-white text-sm font-medium">Listing Generator</div>
              <div className="text-gray-500 text-xs">Titles + descriptions</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

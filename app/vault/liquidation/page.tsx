import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import LiquidationPlannerClient from './LiquidationPlannerClient';

export const metadata: Metadata = {
  title: 'Collection Liquidation Planner — Sell Your Cards for Maximum Value | CardVault',
  description: 'Plan how to sell your card collection for the most money. Analyzes each card by value tier and recommends the best selling platform — eBay, COMC, Goldin, Heritage, local card shop, or Facebook groups. Calculates fees, net proceeds, time to sell, and total expected payout. Free card selling strategy tool.',
  openGraph: {
    title: 'Collection Liquidation Planner — CardVault',
    description: 'Sell your card collection strategically. Get platform recommendations, fee calculations, and a liquidation timeline.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Collection Liquidation Planner — CardVault',
    description: 'Plan how to sell your cards for maximum value. Platform recs, fee calc, timeline.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Liquidation Planner' },
];

const faqItems = [
  {
    question: 'How does the Collection Liquidation Planner work?',
    answer: 'Add your cards with estimated values, and the planner categorizes each into value tiers: bulk ($0-10), mid-range ($10-50), notable ($50-200), high-value ($200-1,000), and premium ($1,000+). Each tier gets a recommended selling strategy with the best platform, expected fees, and estimated time to sell. The summary dashboard shows your total collection value, expected net proceeds after all fees, and a realistic liquidation timeline.',
  },
  {
    question: 'Which selling platforms does the planner recommend?',
    answer: 'The planner considers 8 selling channels: eBay (individual listings and auctions), COMC (Check Out My Cards for mid-range consignment), Goldin Auctions (premium sports cards), Heritage Auctions (high-end vintage), local card shops (quick cash, lower return), Facebook card groups (low fees, community sales), MySlabs (graded card marketplace), and bulk dealers (fastest but lowest return). Each tier maps to the platform with the best net return.',
  },
  {
    question: 'How accurate are the fee estimates?',
    answer: 'Fee estimates are based on published platform rates as of 2025: eBay charges ~13.25% (final value fee + payment processing), COMC takes 20-30% commission, Goldin charges 15-20% seller premium, Heritage takes 10-15%, local card shops typically offer 50-70% of market value, and Facebook groups have minimal fees (just PayPal/Venmo at ~3%). Actual fees may vary based on your account level, listing type, and current promotions.',
  },
  {
    question: 'How long does it take to liquidate a collection?',
    answer: 'Time varies dramatically by method. Quick liquidation (selling everything to a dealer or bulk buyer) can happen in 1-2 days but nets 40-60% of market value. Moderate liquidation (mix of platforms) takes 2-8 weeks. Maximum value liquidation (individually listing everything on the optimal platform) can take 3-6 months for a large collection. The planner estimates time based on your chosen speed preference.',
  },
  {
    question: 'Should I grade cards before selling?',
    answer: 'The planner flags cards in the $50+ tiers where grading could significantly increase value. Generally, cards worth $100+ raw that are in excellent condition benefit most from grading. However, grading adds $20-150 per card plus 1-6 months of turnaround time. For liquidation, only grade if you can wait and the expected grade bump exceeds the grading cost by at least 2x.',
  },
];

export default function LiquidationPlannerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Collection Liquidation Planner',
        description: 'Plan how to sell your card collection for maximum value. Platform recommendations, fee calculations, and liquidation timeline.',
        url: 'https://cardvault-two.vercel.app/vault/liquidation',
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
        <div className="inline-flex items-center gap-2 bg-rose-950/60 border border-rose-800/50 text-rose-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          8 Platforms &middot; Fee Calculator &middot; Liquidation Timeline
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Collection Liquidation Planner
        </h1>
        <p className="text-gray-400 text-lg">
          Sell your card collection strategically for maximum value. Add your cards, get platform
          recommendations per value tier, see estimated fees, net proceeds, and a realistic selling timeline.
        </p>
      </div>

      <LiquidationPlannerClient />

      {/* How It Works */}
      <div className="mt-12 bg-gray-900/50 border border-gray-800/50 rounded-xl p-6 sm:p-8">
        <h2 className="text-xl font-bold text-white mb-6">How It Works</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          <div>
            <div className="text-2xl font-bold text-rose-400 mb-2">1</div>
            <h3 className="font-semibold text-white mb-1">Add Your Cards</h3>
            <p className="text-gray-400 text-sm">Enter cards with their estimated market values, or load sample cards to see how the planner works.</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-rose-400 mb-2">2</div>
            <h3 className="font-semibold text-white mb-1">Set Your Speed</h3>
            <p className="text-gray-400 text-sm">Choose quick liquidation (fastest, lowest return), balanced (moderate timeline), or maximum value (patience pays).</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-rose-400 mb-2">3</div>
            <h3 className="font-semibold text-white mb-1">Get Your Plan</h3>
            <p className="text-gray-400 text-sm">See which platform to use for each tier, expected fees, net proceeds, and your liquidation timeline.</p>
          </div>
        </div>
      </div>

      {/* Platform Guide */}
      <div className="mt-8 bg-gray-900/50 border border-gray-800/50 rounded-xl p-6 sm:p-8">
        <h2 className="text-xl font-bold text-white mb-6">Platform Quick Guide</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { name: 'eBay', fee: '~13.25%', best: 'All value ranges', speed: '3-14 days', note: 'Largest audience, most buyers' },
            { name: 'Goldin Auctions', fee: '15-20%', best: '$200+ cards', speed: '30-60 days', note: 'Premium sports card auctions' },
            { name: 'Heritage Auctions', fee: '10-15%', best: '$500+ vintage', speed: '60-90 days', note: 'Best for vintage and high-end' },
            { name: 'COMC', fee: '20-30%', best: '$10-200 cards', speed: '14-60 days', note: 'Consign and forget' },
            { name: 'MySlabs', fee: '8-10%', best: '$50+ graded', speed: '7-30 days', note: 'Growing graded card market' },
            { name: 'Facebook Groups', fee: '~3%', best: '$20-500', speed: '1-7 days', note: 'Low fees, community trust' },
            { name: 'Local Card Shop', fee: '30-50%', best: 'Quick cash', speed: '1 day', note: 'Instant but lowest return' },
            { name: 'Bulk Dealer', fee: '50-70%', best: 'Sub-$10 cards', speed: '1-3 days', note: 'Move volume fast' },
          ].map(p => (
            <div key={p.name} className="bg-gray-800/40 border border-gray-700/40 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-white">{p.name}</span>
                <span className="text-xs text-rose-400 font-medium">{p.fee} fees</span>
              </div>
              <p className="text-gray-400 text-xs mb-1">Best for: {p.best}</p>
              <p className="text-gray-400 text-xs mb-1">Typical time: {p.speed}</p>
              <p className="text-gray-500 text-xs">{p.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Selling Tips */}
      <div className="mt-8 bg-gray-900/50 border border-gray-800/50 rounded-xl p-6 sm:p-8">
        <h2 className="text-xl font-bold text-white mb-4">Liquidation Tips</h2>
        <div className="space-y-3">
          {[
            { title: 'Start with high-value cards', text: 'Sell your most valuable cards individually first. These have the biggest margin between quick-sell and max-value approaches.' },
            { title: 'Batch mid-range cards', text: 'Cards in the $10-50 range sell well in small lots (3-5 similar cards). Saves time vs individual listings.' },
            { title: 'Dump bulk last', text: 'Sub-$10 cards are not worth listing individually. Sell as bulk lots by sport, year, or team. Accept 30-50 cents on the dollar.' },
            { title: 'Time it right', text: 'Football cards peak during NFL season (Sep-Feb). Baseball peaks during playoffs and HOF weekend. Basketball peaks during March Madness and playoffs.' },
            { title: 'Document everything', text: 'Photograph cards before shipping. Keep tracking numbers. Screenshot sold prices for tax purposes if total sales exceed $600/year.' },
            { title: 'Consider grading first', text: 'Cards worth $100+ raw in near-mint condition often double or triple in value with a PSA 10 or BGS 9.5. Factor in grading cost and wait time.' },
          ].map(tip => (
            <div key={tip.title} className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 flex-shrink-0" />
              <div>
                <span className="text-white font-medium">{tip.title}</span>
                <span className="text-gray-400"> — {tip.text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-8 bg-gray-900/50 border border-gray-800/50 rounded-xl p-6 sm:p-8">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((faq, i) => (
            <div key={i}>
              <h3 className="font-semibold text-white mb-2">{faq.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Links */}
      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        <Link href="/vault/bulk-sale" className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4 hover:border-gray-700/60 transition-colors">
          <h3 className="font-semibold text-white mb-1">Bulk Sale Calculator</h3>
          <p className="text-gray-400 text-xs">Compare 6 selling methods side-by-side</p>
        </Link>
        <Link href="/vault/consignment" className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4 hover:border-gray-700/60 transition-colors">
          <h3 className="font-semibold text-white mb-1">Consignment Tracker</h3>
          <p className="text-gray-400 text-xs">Track cards consigned to auction houses</p>
        </Link>
        <Link href="/tools/ebay-fee-calc" className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4 hover:border-gray-700/60 transition-colors">
          <h3 className="font-semibold text-white mb-1">eBay Fee Calculator</h3>
          <p className="text-gray-400 text-xs">Calculate exact eBay selling fees</p>
        </Link>
      </div>

      <div className="mt-8 text-center text-gray-600 text-xs">
        Fee estimates based on published platform rates as of 2025. Actual fees may vary.
      </div>
    </div>
  );
}

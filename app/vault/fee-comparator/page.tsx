import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import FeeComparatorClient from './FeeComparatorClient';

export const metadata: Metadata = {
  title: 'Marketplace Fee Comparator — Net Proceeds Across 12 Card Platforms | CardVault',
  description: 'Compare seller fees across eBay, Whatnot, MySlabs, Fanatics Collect, PWCC, Goldin, Heritage, COMC, Mercari, StockX, Facebook Marketplace, and OfferUp. Enter a sale price and see exact net-to-seller after final value fees, payment processing, buyer’s premium offsets, listing fees, and payout timing.',
  openGraph: {
    title: 'Marketplace Fee Comparator — CardVault',
    description: 'Where should you list that card? Net-to-seller math across 12 real hobby marketplaces.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Marketplace Fee Comparator — CardVault',
    description: 'Net-to-seller ranked across 12 real card marketplaces. 2026 fee schedules.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Fee Comparator' },
];

const faqItems = [
  {
    question: 'Which marketplace takes the smallest bite out of a card sale?',
    answer: 'It depends on card type and price point. For raw modern cards under $200, Facebook Marketplace local-pickup is zero-fee and wins every time — risk of the buyer being a flaker aside. For online-shipped modern cards $50-$500, MySlabs (6% flat) and PWCC Marketplace (10%) typically net more than eBay (13.25%). For high-end graded cards $2K+, consignment houses (Goldin, Heritage, PWCC Premier) can NET MORE than direct-sell despite the higher headline commission because they expose your card to a premium bidder pool and the buyer’s premium is not a deduction from your hammer. For sealed wax, eBay and Fanatics Collect are comparably priced — pick based on audience fit.',
  },
  {
    question: 'Why does MySlabs look so much cheaper than eBay?',
    answer: 'MySlabs charges 6% flat with no payment processing on their end — Stripe passes through at 2.9% + $0.30 but is payed by the buyer on checkout as a line item in most cases. eBay bundles Final Value Fee (13.25% on trading cards up to $2000) with managed-payments processing inline so the "fee" is higher but not double-billed. The difference is MySlabs has ~1/50th the audience — the cheaper fee is a function of the smaller buyer pool. For a card that will sell in 48 hours on either platform, MySlabs wins. For a card that needs eBay’s 180M-user reach to find a buyer in any reasonable time, eBay wins despite the fee.',
  },
  {
    question: 'How should I think about buyer’s premium at auction houses?',
    answer: 'Buyer’s premium is added to the hammer price and paid by the winning bidder. It does NOT reduce your proceeds as a consignor. If a card hammers at $10,000 at Goldin with a 20% BP and a 10% seller commission, the buyer pays $12,000 total and you receive $9,000 ($10K − 10% commission). However, BP does affect bidder behavior — a $10K hammer costs the bidder $12K, so bidders anchor on $12K all-in, which means hammer prices at houses with high BP tend to come in slightly lower. The effective seller-side cost of a BP is usually estimated at 20-40% of the BP rate depending on market conditions. This comparator treats BP as buyer-facing only; account for the psychological drag on hammer separately.',
  },
  {
    question: 'What about promoted listings on eBay?',
    answer: 'eBay Promoted Listings Standard adds 2-15% on top of the FVF, paid only when the item sells via a promoted click. The default in this comparator assumes no promotion. If you enable promotion at 5% (the platform median for competitive categories), your eBay net drops by about 5% of sale price — moving eBay behind MySlabs and PWCC Marketplace in the ranking. Rule of thumb: promote only when your listing has been live for 14+ days with fewer than 100 views, OR when the card is in a hyper-competitive category (rookie PSA 10s of current stars) where getting surfaced matters more than fee optimization.',
  },
  {
    question: 'How do payout timelines factor in?',
    answer: 'Fast payout (eBay / Mercari / Whatnot / MySlabs — 1-3 business days after delivery confirmation) matters if you’re reinvesting capital or needing cash flow. Slow payout (Goldin / Heritage / PWCC Premier — 30-45 days after the auction closes) is acceptable for grail consignments where you’re not time-sensitive. COMC has two modes: instant marketplace credit (use immediately for buying on COMC) or Cashout (1-3 weeks, with a small cashout fee). StockX holds 2-5 business days while authenticating, then pays out within 3 business days after authentication. The comparator surfaces payout days so you can trade headline fee against cash-cycle impact.',
  },
  {
    question: 'Are sales taxes and 1099-K reporting part of the net?',
    answer: 'No. Sales tax is collected from the buyer and remitted by the platform (in most US states) — it does not reduce your proceeds. IRS 1099-K reporting kicks in at $2,500 in gross payments in 2025 and $600 from 2026 forward (current IRS posture — check with your tax advisor, the threshold has been delayed multiple times). The net-to-seller shown here is your GROSS proceeds after marketplace fees. Your taxable income is that gross minus your cost basis (what you paid for the card) minus any allowable expenses. For 28% collectibles capital gains math, use the Card Tax Reporter in Tools.',
  },
  {
    question: 'What platforms are missing from this comparator?',
    answer: 'Deliberate omissions: Sportlots (bulk-only, tiny audience), BlowoutCards Forum (peer-to-peer with no managed payments), Discord-based servers (informal, no fees but buyer-protection risk), and local card shop cash-out (handled separately in Dealer Cash Offer Estimator). Also omitted: TCGPlayer (Pokemon/MTG only, different fee structure), BreakerCulture Marketplace (pre-launch), and Instagram sales (managed via DMs with zero fee but also zero buyer protection). If you sell primarily in one of these channels, run the math manually — typical peer-to-peer deals run 0% fee + 3% payment-processing if using PayPal G&S.',
  },
];

export default function FeeComparatorPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Marketplace Fee Comparator',
        description: 'Interactive calculator comparing seller-side net proceeds across 12 real sports and Pokemon card marketplaces using 2026 fee schedules.',
        url: 'https://cardvault-two.vercel.app/vault/fee-comparator',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-rose-950/60 border border-rose-800/50 text-rose-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse" />
          12 Marketplaces &middot; 2026 fee schedules &middot; net-to-seller math
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Marketplace Fee Comparator</h1>
        <p className="text-gray-400 text-lg max-w-3xl">
          Where should you list that card? Enter a sale price, pick your card type, and see net-to-seller ranked across eBay, Whatnot, MySlabs, Fanatics Collect, PWCC Marketplace, Goldin, Heritage, COMC, Mercari, StockX, Facebook Marketplace, and OfferUp &mdash; with full fee breakdowns and payout timing.
        </p>
      </div>

      <FeeComparatorClient />

      <div className="mt-6 rounded-xl bg-amber-950/30 border border-amber-900/40 p-4 text-sm text-amber-200">
        Fee schedules sourced from public 2026 marketplace documentation as of April 2026. Rates change &mdash; verify against the platform’s current terms before committing to a consignment or high-value listing. Consignment houses (Goldin / Heritage / PWCC Premier) negotiate reduced commissions for grail-tier and bulk consignments; the headline rates shown here apply to retail-tier single-card consignments.
      </div>

      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-rose-300 transition-colors">{faq.question}<span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span></summary>
              <div className="px-4 pb-4 text-sm text-gray-400 leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-gray-800 pt-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Related Tools & Documents</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/vault/cash-offer" className="text-rose-300 hover:text-rose-200">Dealer Cash Offer</Link>
          <Link href="/vault/bulk-sale" className="text-rose-300 hover:text-rose-200">Bulk Sale Calculator</Link>
          <Link href="/vault/liquidation" className="text-rose-300 hover:text-rose-200">Liquidation Planner</Link>
          <Link href="/vault/consignment" className="text-rose-300 hover:text-rose-200">Consignment Tracker</Link>
          <Link href="/vault/consignment-agreement" className="text-rose-300 hover:text-rose-200">Consignment Agreement</Link>
          <Link href="/tools/ebay-fee-calc" className="text-rose-300 hover:text-rose-200">eBay Fee Calculator</Link>
          <Link href="/tools/auction-bid" className="text-rose-300 hover:text-rose-200">Auction Bid Calculator</Link>
          <Link href="/vault/bill-of-sale" className="text-rose-300 hover:text-rose-200">Bill of Sale</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/vault" className="text-rose-300 hover:text-rose-200">&larr; All Vault Tools</Link>
        <Link href="/tools" className="text-rose-300 hover:text-rose-200">Tools</Link>
        <Link href="/" className="text-rose-300 hover:text-rose-200">Home</Link>
      </div>
    </div>
  );
}

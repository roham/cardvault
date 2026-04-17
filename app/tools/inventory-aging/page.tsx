import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import InventoryAgingClient from './InventoryAgingClient';

export const metadata: Metadata = {
  title: 'Inventory Aging Report — Stale Listing Tracker for Dealers | CardVault',
  description: 'Free inventory-aging report for card sellers and dealers. Log your listed cards with list date, platform, and ask price; tool flags stale inventory (>90d held) and suggests re-list price cuts, platform migration, or consignment-out based on age-band thresholds used by professional dealers.',
  openGraph: {
    title: 'Inventory Aging Report — CardVault',
    description: 'Track days-held per listing. Flag stale inventory. Get re-list + consignment recommendations.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Inventory Aging Report — CardVault',
    description: 'Flag stale card listings. Re-list + migration recommendations.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Inventory Aging Report' },
];

const faqItems = [
  {
    question: 'What is inventory aging?',
    answer: 'The number of days a specific card has been listed for sale without selling. Fresh (0-30d), warm (30-90d), aged (90-180d), stale (180-365d), dead (365d+). Professional dealers track aging obsessively — a card that has been listed 180+ days is signaling something (overpriced, wrong platform, wrong season, wrong category match). The longer a card sits, the more psychological and opportunity cost attaches to it.',
  },
  {
    question: 'Why do aging thresholds matter for card sellers?',
    answer: 'Card values drift. A 90-day-old listing at the original ask price is no longer at MARKET price — the market has moved 2-5% in either direction since listing. Aged listings lose search-algorithm ranking on eBay/Whatnot/PWCC (platforms prefer fresh listings in default sort order), which further reduces visibility. Stale listings also tie up cash basis and carrying cost (storage, insurance, opportunity-cost of capital). Moving stale inventory through a price cut, platform migration, or consignment-out recovers that capital faster than waiting.',
  },
  {
    question: 'What do the recommended actions mean?',
    answer: 'FRESH (0-30d): Hold — give the listing time to work. WARM (30-90d): Check comps — is the price still market? If yes, hold. If no, cut 5-10%. AGED (90-180d): Cut price 10-15% OR migrate to a different platform (eBay auction, Whatnot live stream). STALE (180-365d): Cut 20-30% OR consign to an auction house (Heritage, Goldin, PWCC) to let their algorithm + buyer list do the work. DEAD (365d+): Consider bulk-lot liquidation or deep discount (40-60% off ask) — the card has signaled persistent mispricing or wrong-category-match; continued holding compounds cost.',
  },
  {
    question: 'What is the opportunity cost of stale inventory?',
    answer: 'Rough math: $10,000 in stale inventory at a typical 15% annual card-market appreciation rate has an ANNUAL opportunity cost of $1,500 if the capital were redeployed into fresh cards at market. Add 1-2% for storage + insurance ($100-200/year), 2-5% for psychological drag (sellers lose negotiation leverage on stale lots), and the total annual cost of holding $10K in stale inventory is ~$2,000-$2,500. After 180 days, the right cut to move the inventory is frequently 10-20% — which recoverable in opportunity-cost + carrying-cost savings within 12 months.',
  },
  {
    question: 'How does this pair with other CardVault tools?',
    answer: 'Inventory Aging pairs with: FEE COMPARATOR (when migrating a listing, see which platform nets the most), RESERVE PRICE CALCULATOR (if consigning to auction, set smart reserves), LISTING TEMPLATE GENERATOR (regenerate a fresh title/description for re-listing), COST BASIS AGGREGATOR (check if cut-to-sell would realize a loss vs a gain for tax-planning). Full workflow: age-track → cut-or-migrate decision → regenerate listing → tax check.',
  },
  {
    question: 'Does this track eBay / Whatnot listings automatically?',
    answer: 'No — this is a manual-entry log. You enter each card with: ask price, list date, platform. The tool computes days-held + age band + recommendation. For automated tracking, use eBay Seller Hub (native aging view) or CardLadder Pro. CardVault\'s value-add is the DECISION FRAMEWORK (aging bands + specific recommendations) + cross-platform aggregation — you can log listings across eBay, Whatnot, PWCC, MySlabs in one view.',
  },
];

export default function InventoryAgingPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Inventory Aging Report',
        description: 'Days-held aging tracker with stale-inventory flag and platform-migration recommendations for card dealers.',
        url: 'https://cardvault-two.vercel.app/tools/inventory-aging',
        applicationCategory: 'BusinessApplication',
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-teal-950/60 border border-teal-800/50 text-teal-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span>📅</span>
          Dealer inventory aging · 5-band thresholds · Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Inventory Aging Report</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Track days-held per listing. The tool flags stale inventory and recommends price cuts, platform migration,
          or consignment-out based on professional-dealer aging bands.
        </p>
      </div>

      <InventoryAgingClient />

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/vault/fee-comparator" className="block bg-slate-900/60 border border-slate-800 hover:border-teal-700 rounded-lg p-4 transition">
          <div className="text-sm font-semibold text-white mb-1">Fee Comparator →</div>
          <div className="text-xs text-slate-400">When migrating a listing, see which platform nets the most after fees.</div>
        </Link>
        <Link href="/tools/reserve-price" className="block bg-slate-900/60 border border-slate-800 hover:border-teal-700 rounded-lg p-4 transition">
          <div className="text-sm font-semibold text-white mb-1">Reserve Price Calculator →</div>
          <div className="text-xs text-slate-400">If consigning stale inventory to auction, set smart reserves.</div>
        </Link>
        <Link href="/vault/listing-generator" className="block bg-slate-900/60 border border-slate-800 hover:border-teal-700 rounded-lg p-4 transition">
          <div className="text-sm font-semibold text-white mb-1">Listing Template Generator →</div>
          <div className="text-xs text-slate-400">Regenerate a fresh title + description when re-listing stale inventory.</div>
        </Link>
        <Link href="/tools/cost-basis" className="block bg-slate-900/60 border border-slate-800 hover:border-teal-700 rounded-lg p-4 transition">
          <div className="text-sm font-semibold text-white mb-1">Cost Basis Aggregator →</div>
          <div className="text-xs text-slate-400">Check if cutting to sell realizes a loss (tax-harvest opportunity).</div>
        </Link>
      </div>

      <div className="mt-12 bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((f, i) => (
            <details key={i} className="group border-b border-slate-800 pb-3 last:border-0">
              <summary className="cursor-pointer text-sm font-semibold text-white py-2 hover:text-teal-300 transition">
                {f.question}
              </summary>
              <div className="text-sm text-slate-300 leading-relaxed mt-2 pl-2">
                {f.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

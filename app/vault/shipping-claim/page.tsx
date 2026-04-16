import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ShippingClaimClient from './ShippingClaimClient';

export const metadata: Metadata = {
  title: 'Shipping Insurance Claim Generator — USPS / UPS / FedEx | CardVault',
  description: 'Free claim-letter generator for lost or damaged sports cards and Pokemon cards in transit. Supports USPS Form 1000, UPS claims, FedEx claims, Priority Mail Insurance. Fill in the shipment, item value, and incident details — get a ready-to-submit claim package with the evidence checklist for each carrier.',
  openGraph: {
    title: 'Shipping Claim Generator — CardVault',
    description: 'Draft a carrier-ready insurance claim for a lost or damaged card shipment in minutes.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Shipping Insurance Claim Generator — CardVault',
    description: 'Lost or damaged card shipment? Draft the claim letter and the evidence checklist for USPS, UPS, or FedEx.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Shipping Claim' },
];

const faqItems = [
  {
    question: 'When do I file a shipping insurance claim for a lost card?',
    answer: 'USPS: wait 15 days after the mailing date for Priority Mail / Priority Mail Express, or 7 days for Priority Mail Express — after that the package is officially presumed lost. File at usps.com/help/claims or on PS Form 1000. Deadline: within 60 days of the mailing date for Priority Mail and 60 days for Ground Advantage. UPS: file any time after the scheduled delivery date passes, but within 60 days of the scheduled delivery. FedEx: file within 60 days of the ship date for domestic, 21 days for international. The earlier you file inside the window, the better — carrier investigation quality degrades over time.',
  },
  {
    question: 'What evidence do I need to win a damaged-card claim?',
    answer: 'Photographs are the single biggest determinant. Before you unpack further, shoot: (1) the outer shipping box showing damage + label, (2) packing materials (bubble wrap, cardboard sandwiches), (3) the card inside its inner protection still in the damaged state, (4) the card out of the holder showing specific damage (corners, edges, surface), (5) a side-by-side photo with the seller listing photo. Plus: your original purchase receipt or eBay/COMC order detail, the tracking number printout, and any signed delivery confirmation. USPS requires these uploaded via PS Form 1000; UPS accepts upload; FedEx wants them emailed to the claim case number.',
  },
  {
    question: 'How much is a card actually covered for?',
    answer: 'USPS Ground Advantage includes $100 of insurance free; Priority Mail includes $100 (non-Amazon) or $50 (commercial). Priority Mail Express includes $100. Additional insurance is sold in $100 tiers — max $5,000 via post office counter and $10,000 via usps.com. UPS includes $100 of Declared Value free and adds coverage at ~$1.10 per $100 of value above $100 (max $50,000 for ground, $100,000 for air). FedEx includes $100 of Declared Value and adds coverage at $3.90 minimum or ~$1.25 per $100 (max $50,000 for Home Delivery and $1,000 for Express Saver with a signature). Your claim payout cannot exceed the declared value you paid for — if you shipped a $2,000 card with only $100 declared, you collect $100.',
  },
  {
    question: 'Will the carrier pay replacement cost or purchase cost?',
    answer: 'Carriers pay the LESSER of: (a) declared value, (b) actual documented purchase price (receipt/invoice), or (c) fair market value at the time of loss (for high-value items, they may require an appraisal or recent comparable sales). For graded cards, include the PSA/CGC/SGC cert photo + a recent comparable sale from 130point.com, eBay sold listings, or Card Ladder. For raw cards, include the seller\'s listing, your payment receipt, and a recent comparable sold listing. Sentimental value, projected appreciation, and future grading potential are NOT covered.',
  },
  {
    question: 'Should the shipper (seller) or recipient (buyer) file?',
    answer: 'The SHIPPER files with the carrier — they are the contract-holder with the carrier and have the mailing receipt. But: eBay/COMC/Whatnot require the BUYER to open the platform dispute separately. Best practice: buyer opens the marketplace dispute and notifies the seller; seller files the carrier claim and forwards the case number to the buyer. Seller refunds the buyer once the carrier pays out, or (on eBay) the seller refunds first and then collects from the carrier — eBay Money Back Guarantee makes the seller responsible regardless of the carrier outcome.',
  },
  {
    question: 'What if my card was shipped in a PWE (plain white envelope) with no insurance?',
    answer: 'PWE shipments are almost always uninsured and have no tracking, which makes them ineligible for a formal carrier claim. Options: (1) if the buyer paid via credit card or PayPal, file an "item not received" dispute — the seller is responsible unless they can prove delivery, (2) file an eBay / Marketplace claim — the seller is on the hook under buyer-protection rules, (3) direct negotiation with the seller. Lesson for the future: any card over $20 should ship tracked with at least $100 insurance (included with USPS Ground Advantage).',
  },
  {
    question: 'Can I file for a collectible over $5,000?',
    answer: 'Yes, but high-value cards (commonly $5,000+) trigger extra scrutiny: USPS may require appraisal documentation with the claim, UPS may require a Registered Letter of Authenticity, and FedEx may request a recent comparable sale within 90 days. For very-high-value cards ($10K+), carriers may ask to inspect the remains in person at a distribution center before paying. For shipments over $5,000: use USPS Registered Mail (max insurance $50,000, chain-of-custody signature at every handoff — slow but the safest), or a private collectibles insurer (Hugh Wood, Distinguished, Collectibles Insurance Services) that covers in-transit value up to six-figures on a standalone policy.',
  },
  {
    question: 'Is this letter enough to actually win the claim?',
    answer: 'A well-written letter with a complete evidence package dramatically improves your chances but does not guarantee payout. Carriers approve roughly 70-80% of properly-documented lost / damaged claims on the first pass. Denials usually cite: (a) insufficient packaging per carrier packaging standards, (b) declared value exceeds documented purchase price, (c) signature of receipt without noting damage at delivery, or (d) concealment or reshipment after damage was noticed. If your first-pass claim is denied, you have the right to appeal — cite the exact policy clause the denial references, add any missing evidence, and re-submit within the appeal window (USPS 30 days, UPS 90 days, FedEx 90 days).',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map(f => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
};

const appSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Shipping Insurance Claim Generator',
  description: 'Draft USPS, UPS, or FedEx insurance claim letters for lost or damaged trading card shipments with a carrier-specific evidence checklist.',
  url: 'https://cardvault-two.vercel.app/vault/shipping-claim',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

export default function ShippingClaimPage() {
  return (
    <div className="min-h-screen bg-black text-gray-100">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={faqSchema} />
      <JsonLd data={appSchema} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8">
          <div className="inline-block px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-semibold mb-4 border border-teal-500/20">
            📦 DOCUMENT GENERATOR
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-3 tracking-tight">
            Shipping Insurance Claim
          </h1>
          <p className="text-base sm:text-lg text-gray-400 max-w-3xl">
            Lost or damaged card shipment? Draft a carrier-ready claim letter for USPS, UPS, FedEx, or a private insurer — with the exact evidence checklist you need to attach.
          </p>
        </div>

        <ShippingClaimClient />

        <div className="mt-12 space-y-8">
          <section className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqItems.map((f, i) => (
                <details key={i} className="group bg-black/40 border border-gray-800 rounded-xl p-4 hover:border-teal-500/40 transition-colors">
                  <summary className="font-semibold text-white cursor-pointer list-none flex items-start justify-between gap-4">
                    <span>{f.question}</span>
                    <span className="text-teal-400 text-sm mt-0.5 group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-3 text-gray-400 text-sm leading-relaxed">{f.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="bg-amber-500/5 border border-amber-500/30 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">⚠️</span>
              <div>
                <h3 className="font-bold text-amber-300 mb-1 text-sm">Not legal or claims advice</h3>
                <p className="text-sm text-amber-100/80 leading-relaxed">
                  This generator produces a standard claim letter based on common carrier templates. Carrier claim rules change; always verify deadlines and evidence requirements on the carrier&apos;s own site before submitting. For claims over $5,000, cross-border shipments, or denials under appeal, consult the carrier&apos;s claims department or a shipping-law attorney in your jurisdiction.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-br from-teal-500/10 to-cyan-500/5 border border-teal-500/30 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Related Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/vault/return-request" className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-gray-800 hover:border-teal-500/40 transition-colors">
                <span className="text-2xl">📨</span>
                <div>
                  <div className="font-semibold text-white text-sm">Return &amp; Refund Request</div>
                  <div className="text-xs text-gray-400">Buyer-side dispute letter</div>
                </div>
              </Link>
              <Link href="/vault/bill-of-sale" className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-gray-800 hover:border-teal-500/40 transition-colors">
                <span className="text-2xl">📜</span>
                <div>
                  <div className="font-semibold text-white text-sm">Bill of Sale Generator</div>
                  <div className="text-xs text-gray-400">Seller-side transaction doc</div>
                </div>
              </Link>
              <Link href="/vault/ship-it" className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-gray-800 hover:border-teal-500/40 transition-colors">
                <span className="text-2xl">🚚</span>
                <div>
                  <div className="font-semibold text-white text-sm">Ship It Workflow</div>
                  <div className="text-xs text-gray-400">Pre-ship packaging checklist</div>
                </div>
              </Link>
              <Link href="/tools/shipping-calc" className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-gray-800 hover:border-teal-500/40 transition-colors">
                <span className="text-2xl">📮</span>
                <div>
                  <div className="font-semibold text-white text-sm">Shipping Cost Calculator</div>
                  <div className="text-xs text-gray-400">USPS / UPS / FedEx pricing</div>
                </div>
              </Link>
              <Link href="/vault/insurance" className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-gray-800 hover:border-teal-500/40 transition-colors">
                <span className="text-2xl">🛡️</span>
                <div>
                  <div className="font-semibold text-white text-sm">Insurance Tracker</div>
                  <div className="text-xs text-gray-400">Log covered items + policies</div>
                </div>
              </Link>
              <Link href="/tools/damage-assessment" className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-gray-800 hover:border-teal-500/40 transition-colors">
                <span className="text-2xl">🔬</span>
                <div>
                  <div className="font-semibold text-white text-sm">Damage Assessment</div>
                  <div className="text-xs text-gray-400">Document card condition issues</div>
                </div>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

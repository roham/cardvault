import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ProvenanceClient from './ProvenanceClient';

export const metadata: Metadata = {
  title: 'Card Provenance Tracker — Ownership Chain & Chain-of-Custody Record | CardVault',
  description: 'Document the full ownership history of a high-end card. Record each owner, acquisition date, price, grading events, and notable moments. Generate a printable provenance document — essential for vintage, 1-of-1 parallels, and investment-grade slabs.',
  openGraph: {
    title: 'Card Provenance Tracker — CardVault',
    description: 'Chain-of-custody record for high-end cards. Owners, dates, prices, grading events, provenance statement.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Provenance Tracker | CardVault',
    description: 'Build a printable ownership chain for any card. Vintage, 1-of-1, graded slab — provenance adds real value.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Provenance Tracker' },
];

const faqItems = [
  {
    question: 'Why does provenance matter for a trading card?',
    answer: 'Provenance — the documented ownership history of a card — adds real market value once you enter vintage, low-pop graded, or 1-of-1 parallel territory. A 1952 Topps Mantle with a clean chain-of-custody from the Copeland or Gidwitz collection commands a meaningful premium over an identical grade sold from an unknown seller. Graders and major auction houses catalog known examples, and buyers pay up for cards that can be traced to famous collections, notable hits, or clean private ownership. For cards under $500, provenance is mostly a curiosity. For cards over $5,000, it is a line item in the sale.',
  },
  {
    question: 'What should a complete provenance record include?',
    answer: 'At minimum: the name (or pseudonym) of each owner, the approximate acquisition date, the acquisition method (auction, private sale, raw pull, trade, inheritance, consignment), the price paid or auction hammer, and any notable events during ownership (grading, resubmission, magazine feature, public display, insurance appraisal). A good provenance also notes any custody breaks — periods when ownership is uncertain or the card was in a grading queue, auction house warehouse, or transfer agent. The gold standard is a clean chain from pack-fresh pull to current owner.',
  },
  {
    question: 'How do I verify a provenance claim before buying?',
    answer: 'Cross-check auction records (Heritage, Goldin, PWCC, REA public archives), PSA / CGC / SGC cert lookups (same cert number across transactions proves continuity), and collector databases like Net54 or Blowout Cards forum threads. For named collections (Gidwitz, Copeland, Lipset, Mastro), look for published provenance lists from the Robert Edward Auctions catalogs or the hobby press. A seller who cannot produce documentation for claimed provenance is selling a story, not a record. Ask for the auction lot number, the purchase receipt, or the sticker code on the slab.',
  },
  {
    question: 'Does changing the grade reset the provenance?',
    answer: 'No — but it does introduce a visible checkpoint. A card that went from PSA 7 to PSA 8 via resubmission and crack-out has a different story than a card that went straight from raw to PSA 8. Both are valid; the resubmission path is common and not suspicious on its own. Record the cert numbers before and after so the chain is legible. For high-end cards, a single cert history (same slab from grading to sale) is the cleanest possible provenance and typically trades at a premium.',
  },
  {
    question: 'Can I use this for insurance or estate purposes?',
    answer: 'The exported document is a reasonable starting point for insurance declarations, estate inventories, and collection summaries — but it is not a legally-binding appraisal. For insurance above $10,000 per card, pair this provenance with a recent third-party appraisal from a certified appraiser or the latest auction comp from a major house. For estates, hand this document to your executor with the physical slab and any original purchase receipts. Most major insurers require both a provenance narrative AND a dollar-figure appraisal — this tool produces the first.',
  },
  {
    question: 'What counts as a "named collection" and does it matter?',
    answer: 'A named collection is a documented, published grouping of cards owned by a single collector or estate that was sold as a unit or catalogued publicly. Examples: the Copeland Collection (REA 2012), the Gidwitz Collection (Goldin 2022), the Newman Family Collection (Heritage 2020), the Marshall Fogel Collection (various). Cards from named collections trade at 10-30% premiums over identical-grade examples from unknown provenance, because the collection itself signals vetting. If your card is from a named collection, record the collection name, the auction house, and the lot number — this is the most valuable provenance entry you can make.',
  },
];

export default function ProvenancePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Provenance Tracker',
        description: 'Build a chain-of-custody record for any sports or trading card — owners, dates, prices, grading events, and notable moments. Produces a printable provenance document.',
        url: 'https://cardvault-two.vercel.app/tools/provenance',
        applicationCategory: 'BusinessApplication',
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
        <div className="inline-flex items-center gap-2 bg-teal-950/60 border border-teal-800/50 text-teal-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
          Provenance &middot; Chain-of-custody &middot; Ownership history &middot; Printable
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Card Provenance Tracker</h1>
        <p className="text-gray-400 text-lg">
          High-end cards deserve a documented ownership chain. Record every owner, acquisition, grading event, and
          notable moment. Export a clean provenance document for insurance, estate planning, or the next sale — the
          cleaner the chain, the higher the premium.
        </p>
      </div>

      <ProvenanceClient />

      {/* FAQ */}
      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-teal-400 transition-colors">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-400">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-8 border-t border-gray-800 pt-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Related Tools</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/vault/bill-of-sale" className="text-teal-500 hover:text-teal-400">Bill of Sale Generator</Link>
          <Link href="/tools/appraisal-report" className="text-teal-500 hover:text-teal-400">Appraisal Report</Link>
          <Link href="/tools/insurance-calc" className="text-teal-500 hover:text-teal-400">Insurance Calculator</Link>
          <Link href="/tools/estate-planner" className="text-teal-500 hover:text-teal-400">Estate Planner</Link>
          <Link href="/tools/inheritance-guide" className="text-teal-500 hover:text-teal-400">Inheritance Guide</Link>
          <Link href="/tools/cert-check" className="text-teal-500 hover:text-teal-400">Cert Check</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/tools" className="text-teal-500 hover:text-teal-400">&larr; All Tools</Link>
        <Link href="/games" className="text-teal-500 hover:text-teal-400">Games</Link>
        <Link href="/" className="text-teal-500 hover:text-teal-400">Home</Link>
      </div>
    </div>
  );
}

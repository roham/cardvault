import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ListingGeneratorClient from './ListingGeneratorClient';

export const metadata: Metadata = {
  title: 'Listing Template Generator — eBay Card Listing Title + Description + Keywords | CardVault',
  description: 'Free card-listing generator for eBay, Whatnot, MySlabs, Mercari. Input card details, get an 80-character optimized title (3 variations), full description, 15-20 search keywords, eBay category suggestion, and shipping recommendation.',
  openGraph: {
    title: 'Listing Template Generator — CardVault',
    description: 'Free eBay + marketplace card-listing generator. Title, description, keywords, category.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Listing Template Generator — CardVault',
    description: 'Generate optimized card-listing title + description + keywords + category in one click.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Listing Generator' },
];

const faqItems = [
  {
    question: 'What does the Listing Template Generator produce?',
    answer: 'Seven outputs: (1) Three optimized title variations at 80 characters or less — keyword-front, feature-front, and search-volume-front. (2) Full long-form description with bullet specs, condition notes, shipping terms, return policy. (3) 15-20 relevant keywords for the listing tags / search terms field. (4) Suggested eBay category. (5) Suggested shipping class with cost + insurance. (6) Starting-bid range. (7) Best-offer floor + BIN price. Copy-paste ready for eBay, Whatnot, MySlabs, Mercari.',
  },
  {
    question: 'Why do titles matter so much?',
    answer: 'The eBay title is the single biggest SEO lever you control. eBay indexes the title against buyer search queries with heavy weight on the first 40 characters (the portion visible in most listing previews). Common mistakes: wasting characters on "WOW RARE MINT LQQK" fluff (eBay ignores these), missing critical keywords, burying the grade at the end. A well-structured 80-character title can increase impressions 3-5x vs a poorly-structured one.',
  },
  {
    question: 'How should I pick between the 3 title variations?',
    answer: 'KEYWORD-FRONT: use for commodity cards where buyers search by name + year. FEATURE-FRONT: use for premium cards with special attributes (auto, patch, 1/1). Puts the scarce feature first. SEARCH-VOLUME-FRONT: use for vintage or obscure cards where buyers search by era. Puts era/sport first. Best for broad-demand collectibles.',
  },
  {
    question: 'Does this tool work for non-eBay platforms?',
    answer: 'Yes. Title + description are platform-agnostic and paste cleanly into Whatnot, MySlabs, Mercari, OfferUp. Platform notes: Whatnot live-auction benefits from shorter titles (40-50 chars). MySlabs supports cert numbers — include them in description. Mercari has no bidding — skip auction fields. Fanatics Collect handles shipping/returns — strip that boilerplate. Category is eBay-specific.',
  },
  {
    question: 'How are keywords generated?',
    answer: 'From five pools: (1) Player synonyms (last name, full name). (2) Set synonyms (full + abbreviation). (3) Feature tags (RC, auto, patch, SSP, refractor, parallel, 1/1, numbered). (4) Grade tags (PSA + grade, BGS, SGC, raw). (5) Cross-category anchors (sport, era, team). Ranked by search-volume heuristic.',
  },
  {
    question: 'What shipping class should I use for cards?',
    answer: 'UNDER $20 = PWE with penny sleeve + top loader (no tracking, buyer-risk). $20-75 = First-Class Envelope with tracking (~$5). $75-500 = Ground Advantage or Priority Mail with insurance (~$10-12). $500+ = Priority Express or signature-required insured (~$30-50). Include tracking ALWAYS above $20 or you are exposed to false-delivery chargebacks.',
  },
  {
    question: 'Can I save my draft?',
    answer: 'Yes — auto-saves to localStorage (cv_listing_generator_v1). Refreshing or returning preserves your draft. For a template you reuse (e.g. 2025 Topps Chrome Base Rookie — any player), fill fixed fields, bookmark the URL, overwrite only player + card# next time.',
  },
  {
    question: 'Does the tool pull card data from your catalog?',
    answer: 'No — pure generator. You input card details; tool formats and optimizes. Keeps the tool fast and platform-agnostic. Use CardVault card pages for price reference + Fee Comparator for net-proceeds math, then paste results here.',
  },
];

export default function ListingGeneratorPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Listing Template Generator',
        description: 'eBay / marketplace card-listing title + description + keywords generator with 3 title styles and platform-agnostic output.',
        url: 'https://cardvault-two.vercel.app/vault/listing-generator',
        applicationCategory: 'BusinessApplication',
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-cyan-950/60 border border-cyan-800/50 text-cyan-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span>📝</span>
          <span>Seller workflow accelerator · P3 Commerce · 46th /vault tool</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
          Listing Template Generator
        </h1>
        <p className="text-lg text-slate-300 max-w-3xl">
          Input your card details. Get three optimized 80-character title variations, a full description,
          15-20 search keywords, an eBay category suggestion, and a shipping recommendation. 10-minute
          listing drafts become 30-second copy-paste.
        </p>
      </div>

      <ListingGeneratorClient />

      <section className="mt-12 border-t border-slate-800 pt-8">
        <h2 className="text-2xl font-bold text-white mb-6">FAQ</h2>
        <div className="space-y-4">
          {faqItems.map((f, i) => (
            <details key={i} className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 group">
              <summary className="font-semibold text-white cursor-pointer list-none flex justify-between items-start gap-4">
                <span>{f.question}</span>
                <span className="text-cyan-400 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="mt-3 text-slate-300 leading-relaxed">{f.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-12 border-t border-slate-800 pt-8">
        <h2 className="text-2xl font-bold text-white mb-4">Related tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/tools/reserve-price" className="bg-slate-900/60 border border-slate-800 hover:border-cyan-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">Reserve Price Calculator</div>
            <div className="text-sm text-slate-400">Set auction reserve + starting bid</div>
          </Link>
          <Link href="/vault/fee-comparator" className="bg-slate-900/60 border border-slate-800 hover:border-cyan-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">Marketplace Fee Comparator</div>
            <div className="text-sm text-slate-400">Net proceeds across 12 platforms</div>
          </Link>
          <Link href="/vault/ship-it" className="bg-slate-900/60 border border-slate-800 hover:border-cyan-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">Shipping Label Helper</div>
            <div className="text-sm text-slate-400">Pick the right shipping class</div>
          </Link>
          <Link href="/tools/best-offer" className="bg-slate-900/60 border border-slate-800 hover:border-cyan-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">Best Offer Calculator</div>
            <div className="text-sm text-slate-400">Seller Accept / Counter / Reject engine</div>
          </Link>
          <Link href="/vault/return-request" className="bg-slate-900/60 border border-slate-800 hover:border-cyan-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">Return Request Handler</div>
            <div className="text-sm text-slate-400">Post-sale dispute paperwork</div>
          </Link>
          <Link href="/vault" className="bg-slate-900/60 border border-slate-800 hover:border-cyan-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">All Vault Tools →</div>
            <div className="text-sm text-slate-400">Browse 45+ commerce & paperwork tools</div>
          </Link>
        </div>
      </section>
    </div>
  );
}

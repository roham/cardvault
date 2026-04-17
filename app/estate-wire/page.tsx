import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import EstateWireClient from './EstateWireClient';

export const metadata: Metadata = {
  title: 'Estate Wire — Named-Collection Auctions Hitting Market | CardVault',
  description: 'Live feed of named estate, attic-find, and collection auctions entering the hobby market. Childhood-basement finds, lifetime collections, dealer estate liquidations, and curated-collector cataloged sales — sorted by type, sport, era, and auction house. Simulated feed modeled on real 2020-2026 estate-auction activity.',
  openGraph: {
    title: 'Estate Wire — CardVault',
    description: 'Named-collection and estate-find auctions hitting the hobby market — attic finds, lifetime collections, dealer liquidations, cataloged consignments.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Estate Wire — CardVault',
    description: 'Watch named estate + attic-find auctions drop. The collectors-behind-the-cards feed.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Live', href: '/live-hub' },
  { label: 'Estate Wire' },
];

const faqItems = [
  {
    question: 'What is Estate Wire?',
    answer: 'A live feed of named-source auctions hitting the hobby market — the moment a specific collection, estate, or attic-find drops a lot into public sale. Different from Auction Wire (generic auction countdowns) and Grail Watch (value-based high-price alerts). Estate Wire is specifically about PROVENANCE: cards with a known origin story — a deceased collector whose family is liquidating, an attic discovery after a parent passes, a dealer retiring their inventory, or a documented single-owner collection being cataloged for sale. Provenance is often the single biggest driver of premium pricing in the hobby — a 1986 Fleer Jordan PSA 9 from "The Smith Basement Find" sells for 15-30% more than an identical raw-market copy because buyers value the story.',
  },
  {
    question: 'What are the 5 estate types?',
    answer: 'ATTIC FIND (childhood cards rediscovered after decades — ungraded, often water/humidity damaged, but authentic and sometimes extraordinary). LIFETIME COLLECTION (single collector documented over 20-60 years, usually with binders, boxes, grading submissions, and a story). DEALER ESTATE (retired card shop owner liquidating their decades-long inventory — mixed condition, mixed eras, volume lots). CURATED CONSIGNMENT (wealthy collector partnering with an auction house for a cataloged sale — white-glove treatment, detailed provenance, often with photos of the collector with the cards). ONE-OWNER COLLECTION (single-source cards that never hit the secondary market — holdings from a relative of a player, a stadium employee, or a long-ago breaker who quietly built a stack).',
  },
  {
    question: 'Are these real estates?',
    answer: 'No — the feed is simulated for visualization. Real named estate auctions are cataloged by Heritage, Goldin, PWCC, REA, Lelands, Memory Lane, Huggins & Scott, and others. The modeled distribution of type, frequency, sport mix, and era mix is drawn from 2020-2026 public catalog data — we studied patterns in which types drop, when they drop, and what they contain. If you want real estate sales, subscribe to auction-house newsletters (Heritage Sports Collectibles, Goldin Signature, PWCC Premier, REA Spring/Fall) for weekly announcements.',
  },
  {
    question: 'What is the "provenance premium"?',
    answer: 'A documented ownership story raises sale price beyond the card-value alone. Three mechanisms: (1) AUTHENTICATION — provenance provides forensic evidence against counterfeits, which matters most for pre-war and high-value vintage. (2) NARRATIVE — buyers value owning a card with a story ("from Mickey Mantle\'s clubhouse attendant\'s son\'s collection") and pay for the narrative. (3) FRESHNESS — cards out of a private collection for 40 years have never hit the public comp line, so buyers interpret them as rarer than the pop report suggests. Heritage documents provenance premiums of 10-35% for top-tier single-owner sales; McWilliams Collection, Shoeless Joe Jackson Find, and Lelands Basement Find are canonical examples.',
  },
  {
    question: 'Which auction houses are in the rotation?',
    answer: 'Eight houses active in the simulated feed: Heritage Auctions (largest volume, all sports), Goldin (dedicated single-collector sales quarterly), PWCC (Premier catalog 4x/year), REA (Robert Edward Auctions — vintage + pre-war specialists), Lelands (Americana + vintage baseball heritage), Memory Lane (mid-tier vintage specialists), Huggins & Scott (mixed consignor + curated), Love of the Game (focused vintage cataloged sales). The distribution weight by house reflects roughly which houses typically announce named-estate sales in public press.',
  },
  {
    question: 'How is this different from Auction Wire, Grail Watch, or Vintage Wire?',
    answer: 'AUCTION WIRE = countdown ticker for all active auctions on 6 platforms (generic, no provenance). GRAIL WATCH = sales clearing above $1K value cutoff (value-based, regardless of source). VINTAGE WIRE = pre-1980 cards hitting listing (era-based, not source-based). ESTATE WIRE = named-source consignments and attic finds entering market (provenance-based, cross-value, cross-era). Four complementary axes: by countdown (Auction), by value (Grail), by era (Vintage), by story (Estate). A collector hunting provenance plays Estate Wire; a buyer wanting a cheap entry watches Vintage Wire; an investor chasing high-dollar sales watches Grail Watch; a bidder tracking deadlines follows Auction Wire.',
  },
  {
    question: 'Why does freshness matter?',
    answer: 'A card that has been in a private collection for 30+ years — never graded, never listed, never part of a public comp — is interpreted by the market as structurally rarer than the same card already circulating. The pop report might show 2,000 copies of a 1952 Topps Mantle PSA 7, but if only 800 of those are "active market" (have traded in the last 5 years), a freshly-surfaced PSA 7 from a basement find is effectively one more entry into the 800-item active universe — not the 2,000-item pop. Freshness is why estate sales consistently beat open-market comps for same-grade comparables. The tool flags each feed item with a "freshness years" stamp where disclosed.',
  },
  {
    question: 'Who owns the cards after an estate sale?',
    answer: 'A single-owner estate typically disperses across 10-500 individual buyers depending on the size of the collection. The buyers are a mix: (1) end-collectors buying one or two key cards for their own collection, (2) dealers buying inventory to resell, (3) investors buying graded high-dollar items, (4) hobby museums or curators preserving historical collections. A well-cataloged estate (Goldin or Heritage white-glove) often sees 60-70% dealer-vs-investor buys on the headline lots and 40-60% individual-collector buys on the mid-tier lots. Dispersal is worth watching — a collection that splits cleanly across 200 buyers seeds a 3-year uptick in secondary-market activity for those specific cards.',
  },
];

export default function EstateWirePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Estate Wire',
        description: 'Live feed of named-collection, estate, and attic-find card auctions hitting the hobby market.',
        url: 'https://cardvault-two.vercel.app/estate-wire',
        applicationCategory: 'BusinessApplication',
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-purple-950/60 border border-purple-800/50 text-purple-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
          Live · Named estate + attic-find consignments · Simulated
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Estate Wire</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Provenance-driven consignments hitting the market — attic finds, lifetime collections, dealer estates, curated single-owner sales.
          Filter by type, sport, era, or auction house. The feed cycles every 5 seconds.
        </p>
      </div>

      <EstateWireClient />

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/auction-wire" className="block bg-slate-900/60 border border-slate-800 hover:border-purple-700 rounded-lg p-4 transition">
          <div className="text-sm font-semibold text-white mb-1">Auction Wire →</div>
          <div className="text-xs text-slate-400">Countdown ticker for all active auctions across 6 platforms.</div>
        </Link>
        <Link href="/grail-watch" className="block bg-slate-900/60 border border-slate-800 hover:border-purple-700 rounded-lg p-4 transition">
          <div className="text-sm font-semibold text-white mb-1">Grail Watch →</div>
          <div className="text-xs text-slate-400">Sales clearing above $1K, cross-sport, cross-era.</div>
        </Link>
        <Link href="/vintage-wire" className="block bg-slate-900/60 border border-slate-800 hover:border-purple-700 rounded-lg p-4 transition">
          <div className="text-sm font-semibold text-white mb-1">Vintage Wire →</div>
          <div className="text-xs text-slate-400">Pre-1980 cards entering the secondary market.</div>
        </Link>
        <Link href="/live-hub" className="block bg-slate-900/60 border border-slate-800 hover:border-purple-700 rounded-lg p-4 transition">
          <div className="text-sm font-semibold text-white mb-1">All live feeds →</div>
          <div className="text-xs text-slate-400">Hub for every CardVault real-time feed.</div>
        </Link>
      </div>

      <div className="mt-12 bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((f, i) => (
            <details key={i} className="group border-b border-slate-800 pb-3 last:border-0">
              <summary className="cursor-pointer text-sm font-semibold text-white py-2 hover:text-purple-300 transition">
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

import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CounterfeitScannerClient from './CounterfeitScannerClient';

export const metadata: Metadata = {
  title: 'Counterfeit Risk Scanner — Is This Card Fake? | CardVault',
  description: 'Free fake-card risk scanner for sports and Pokémon cards. Enter venue, seller, photos, price, and encapsulation — get a 0-100 counterfeit risk score with specific red flags and next-step recommendations before you pay.',
  openGraph: {
    title: 'Counterfeit Risk Scanner — CardVault',
    description: 'Check a listing before you buy. 18 hot-target card families, 9 venues, 7 seller tiers, 4 off-platform red flags. 0-100 risk score with verdict.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Counterfeit Risk Scanner — CardVault',
    description: 'How fake is this listing? Free 0-100 risk scanner for sports and Pokémon cards.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Counterfeit Risk Scanner' },
];

const faqItems = [
  {
    question: 'Is this scanner a guarantee that a card is real or fake?',
    answer: 'No. The scanner is a heuristic tool that combines the hobby\'s most common fraud patterns — hot-target card families, venue risk profiles, seller reputation, encapsulation, photo quality, price anomalies, and procedural red flags — into a single 0-100 score. It is meant to guide your decision before you pay. A LOW RISK score does not prove the card is genuine, and a LIKELY FAKE score does not prove the card is fake. The only authoritative authentication is a reputable grader (PSA, BGS, CGC, SGC) physically examining the card.',
  },
  {
    question: 'Which cards are the most counterfeited?',
    answer: 'The all-time worst counterfeit target is the 1909 T206 Honus Wagner — so many fakes exist that provenance matters almost as much as the card. Close behind: 1952 Topps Mantle, 1986 Fleer Jordan RC, 1979 O-Pee-Chee Gretzky, 2003-04 Upper Deck Exquisite LeBron, the Pokémon Pikachu Illustrator, and early Pokémon Base Set Charizard. Any card with a raw market value above roughly $5,000 is an economic target for counterfeiters, especially refractors and color-shift parallels from modern sets where printing technology is easier to replicate.',
  },
  {
    question: 'Why does venue matter so much in the risk score?',
    answer: 'Venue sets the buyer-protection floor. Major auction houses (Heritage, Goldin, PWCC) pre-authenticate and stake their reputation on every lot, so risk is lowest there. eBay and Whatnot have formal dispute processes but place the burden of proof on the buyer. Facebook Marketplace, Instagram DM, Twitter DM, and Craigslist have zero structural buyer protection — if the card is fake after money changes hands, you have no recourse except small-claims court. The scanner weights these by real-world fraud rates observed in hobby forums and r/sportscards report threads.',
  },
  {
    question: 'What is the single biggest red flag?',
    answer: 'A cert number that does not verify on the grader\'s website. Fake PSA, BGS, and CGC slabs have been produced in volume — some with real case serials stolen from low-value cards and re-applied to counterfeit cards. Every legitimate slab has a cert number printed on the label. Always type it into PSA\'s or the relevant grader\'s verification page AND confirm that the photo shown in their population report matches the card in the listing. If the cert does not verify, walk away. If the photo shows a different card, walk away. This check takes 30 seconds and catches a disproportionate share of fakes.',
  },
  {
    question: 'The price is 40% below market — why is that a red flag and not a deal?',
    answer: 'Legitimate grail cards rarely sell at 40% below market on a public venue. If the seller had a genuine card priced that low, another buyer, dealer, or marketplace arbitrage bot would have snapped it up within minutes. When a deeply under-priced listing sits long enough for you to find it, the most common explanation is that experienced buyers have already identified it as counterfeit and passed. The occasional estate-sale mispricing exists but is rare. Below 70% of FMV, treat the discount as a counterfeit risk signal, not a buying opportunity — especially on hot-target cards.',
  },
  {
    question: 'What should I do if the scanner flags HIGH RISK or LIKELY FAKE?',
    answer: 'Do not pay. Take these steps in order: (1) Ask the seller for 4+ macro photos of the actual card including both sides and both edges at 45°. (2) If slabbed, verify the cert number on the grader\'s website AND match the database photo. (3) Require the transaction to happen on a platform with buyer protection (eBay, Whatnot, Goldin — never Zelle or Venmo F&F). (4) If still interested, ask for a return window contingent on cross-authentication at PSA or BGS, with the seller splitting or absorbing the fee. (5) If any of these conditions are refused, walk away. A legitimate seller with a real card will accept reasonable authentication terms; a counterfeit seller will not.',
  },
];

export default function CounterfeitScannerPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Counterfeit Risk Scanner',
        description: 'Interactive counterfeit risk scoring tool for sports and Pokémon cards. Combines venue, seller, photos, price, encapsulation, and procedural red flags into a 0-100 risk score with verdict and recommendations.',
        url: 'https://cardvault-two.vercel.app/tools/counterfeit-scanner',
        applicationCategory: 'SecurityApplication',
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
          <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse" />
          Counterfeit Risk &middot; 0-100 score &middot; 18 hot targets &middot; 9 venues
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Counterfeit Risk Scanner</h1>
        <p className="text-gray-400 text-lg">
          Before you hit Pay, run the listing through the scanner. It combines the hot-target card family, venue,
          seller reputation, photos, price-vs-FMV, return policy, and a handful of procedural red flags into a 0-100
          counterfeit risk score with an actionable verdict and next-step checklist.
        </p>
      </div>

      <CounterfeitScannerClient />

      {/* FAQ */}
      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-rose-400 transition-colors">
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
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Related Tools & Guides</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/guides/fake-cards" className="text-rose-500 hover:text-rose-400">How to Spot Fake Cards Guide</Link>
          <Link href="/tools/cert-check" className="text-rose-500 hover:text-rose-400">Cert Check</Link>
          <Link href="/tools/provenance" className="text-rose-500 hover:text-rose-400">Provenance Tracker</Link>
          <Link href="/tools/comp-calculator" className="text-rose-500 hover:text-rose-400">Comp Calculator</Link>
          <Link href="/tools/damage-assessment" className="text-rose-500 hover:text-rose-400">Damage Assessment</Link>
          <Link href="/tools/identify" className="text-rose-500 hover:text-rose-400">Card Identifier</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/tools" className="text-rose-500 hover:text-rose-400">&larr; All Tools</Link>
        <Link href="/games" className="text-rose-500 hover:text-rose-400">Games</Link>
        <Link href="/" className="text-rose-500 hover:text-rose-400">Home</Link>
      </div>
    </div>
  );
}

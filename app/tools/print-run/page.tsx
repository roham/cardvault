import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import PrintRunEstimator from './PrintRunEstimator';

export const metadata: Metadata = {
  title: 'Print Run Estimator — How Many Copies of My Card Exist?',
  description: 'Free print run estimator for sports cards and Pokemon. Estimate how many copies were printed and how many survive today based on era, year, card type, and brand. Includes known print run examples.',
  openGraph: {
    title: 'Print Run Estimator — CardVault',
    description: 'Estimate how many copies of any card were printed and how many survive. Covers every era from T206 to modern.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Print Run Estimator — CardVault',
    description: 'How many copies exist? Free tool to estimate card print runs by era, type, and year.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Print Run Estimator' },
];

const faqItems = [
  {
    question: 'How many copies of a sports card are typically printed?',
    answer: 'It varies enormously by era. Pre-war cards (1887-1945) were printed in hundreds to low thousands. Post-war Topps cards (1950s-1960s) reached tens of thousands to hundreds of thousands. The junk wax era (1987-1993) saw billions of cards printed across multiple brands. Modern cards (2020+) are produced in millions for flagship products but also include serial-numbered parallels limited to as few as one copy.',
  },
  {
    question: 'Why don\'t card companies disclose exact print runs?',
    answer: 'Card manufacturers consider production numbers proprietary business information. Disclosing exact print runs would reduce the mystique and collectibility of cards. However, serial-numbered cards (/25, /50, /99, etc.) do reveal their exact print run on the card itself. For unnumbered cards, collectors must rely on estimates based on production clues, PSA population reports, and hobby industry knowledge.',
  },
  {
    question: 'What is the survival rate for vintage cards?',
    answer: 'Pre-war cards (before 1945) have an estimated survival rate of only 1-5% — most were discarded, damaged by children, or destroyed over time. Post-war cards (1950s-1960s) survive at roughly 5-15%. Junk wax era cards (1987-1993) have very high survival rates of 60-90% because collectors hoarded them. Modern cards survive at 80-95%+ since most go directly into protective sleeves.',
  },
  {
    question: 'What was the most overproduced era in card collecting?',
    answer: 'The junk wax era (1987-1993) was by far the most overproduced period. The 1989 Topps, Donruss, Fleer, Score, and Upper Deck sets combined for billions of cards. The 1991 Fleer set alone is estimated at 500 million+ copies. This massive overproduction destroyed the perceived value of most cards from this era, leading to the hobby crash of the mid-1990s.',
  },
  {
    question: 'How does a high-number series affect print runs?',
    answer: 'In many vintage sets (especially 1950s-1970s Topps), the last series of cards in a set was printed in significantly smaller quantities — typically 50-70% fewer copies than the first series. This is because card shops ordered less product later in the season. The most famous example is the 1952 Topps high-number series (#311-407), which includes the Mickey Mantle #311. Topps reportedly dumped unsold cases in the Atlantic Ocean.',
  },
];

export default function PrintRunPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Print Run Estimator',
        description: 'Estimate how many copies of any sports card were printed and how many survive today. Covers every era from 1887 T206 tobacco cards to modern 2024 Topps Chrome.',
        url: 'https://cardvault-two.vercel.app/tools/print-run',
        applicationCategory: 'UtilitiesApplication',
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
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          7 Eras &middot; 7 Card Types &middot; Survival Rates &middot; Famous Examples &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Print Run Estimator</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          How many copies of your card were printed? Estimate production numbers and survival rates based on era, year, card type, and series position. Includes famous examples with known print runs.
        </p>
      </div>

      <PrintRunEstimator />

      {/* FAQ Section */}
      <div className="mt-12 space-y-6">
        <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
        {faqItems.map(f => (
          <div key={f.question} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-2">{f.question}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{f.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

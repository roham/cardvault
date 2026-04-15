import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import LotAnalyzer from './LotAnalyzer';

export const metadata: Metadata = {
  title: 'Bulk Lot Analyzer — Is This Card Lot Worth Buying?',
  description: 'Free card lot value calculator. Add cards from an eBay lot, card show, or Facebook group — see total market value, hidden gems, per-card cost, and a Deal Score verdict. Know if a lot is a steal or overpriced before you buy.',
  openGraph: {
    title: 'Bulk Lot Analyzer — CardVault',
    description: 'Evaluate any card lot before buying. Total value, hidden gems, deal score verdict.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Bulk Lot Analyzer — CardVault',
    description: 'Free lot evaluator for card collectors. Know if a deal is worth it before you buy.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Bulk Lot Analyzer' },
];

const faqItems = [
  {
    question: 'How do I know if a card lot is worth buying?',
    answer: 'Add each card in the lot to our analyzer, enter the seller\'s asking price, and check the Deal Score. A score of 150%+ means the cards are worth 1.5x the asking price — a strong buy. Below 100% means you\'d overpay. Also look for "Hidden Gems" — individual cards worth more than the lot average that drive most of the value.',
  },
  {
    question: 'Where do the card values come from?',
    answer: 'Values are estimated from recent eBay sold data, auction results, and market trends for raw (ungraded) cards. For cards not in our database, you can enter manual estimates. Always verify high-value cards on eBay sold listings before making large purchases.',
  },
  {
    question: 'Should I factor in card condition for lots?',
    answer: 'Yes. Most lot cards are raw and condition varies. As a rule of thumb, discount estimated values by 20-30% for condition uncertainty unless the seller provides clear photos of each card. Lots described as "near mint" often contain cards ranging from VG to NM.',
  },
  {
    question: 'What is a good Deal Score for a card lot?',
    answer: 'A Deal Score of 200%+ is a steal — the cards are worth double the asking price. 150-200% is a great deal. 115-150% is fair with some upside. 85-115% is break-even territory. Below 85% means the lot is overpriced relative to individual card values.',
  },
  {
    question: 'What about shipping costs and fees?',
    answer: 'Remember to add shipping costs to the asking price when evaluating lots on eBay or online. Card lots are often heavy and expensive to ship ($8-15 for padded mailers, $15-30 for flat rate boxes). Facebook Marketplace lots may offer local pickup with no shipping cost.',
  },
];

export default function LotAnalyzerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Bulk Lot Analyzer — Card Lot Value Calculator',
        description: 'Evaluate card lots before buying. See total market value, hidden gems, per-card cost, and Deal Score verdict.',
        url: 'https://cardvault-two.vercel.app/tools/lot-analyzer',
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
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Search 4,200+ cards &middot; Hidden Gem Detection &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Bulk Lot Analyzer</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Evaluating a card lot on eBay, Facebook, or at a card show? Add the cards, enter the asking price, and instantly see if it&apos;s a deal — or a ripoff.
        </p>
      </div>

      <LotAnalyzer />

      {/* FAQ */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-900/80 border border-gray-800 rounded-lg">
              <summary className="flex items-center justify-between cursor-pointer p-4 text-white font-medium">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#x25BC;</span>
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      {/* Internal links */}
      <div className="mt-10 pt-8 border-t border-gray-800">
        <h3 className="text-sm font-medium text-gray-500 mb-3">More Tools for Buyers</h3>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href="/tools/flip-calc" className="text-emerald-400 hover:text-emerald-300">Flip Calculator</Link>
          <span className="text-gray-700">&middot;</span>
          <Link href="/tools/condition-grader" className="text-emerald-400 hover:text-emerald-300">Condition Grader</Link>
          <span className="text-gray-700">&middot;</span>
          <Link href="/tools/collection-value" className="text-emerald-400 hover:text-emerald-300">Collection Value</Link>
          <span className="text-gray-700">&middot;</span>
          <Link href="/tools/auth-check" className="text-emerald-400 hover:text-emerald-300">Authentication Checker</Link>
          <span className="text-gray-700">&middot;</span>
          <Link href="/tools/dealer-scanner" className="text-emerald-400 hover:text-emerald-300">Dealer Scanner</Link>
          <span className="text-gray-700">&middot;</span>
          <Link href="/card-show" className="text-emerald-400 hover:text-emerald-300">Card Show Companion</Link>
        </div>
      </div>
    </div>
  );
}

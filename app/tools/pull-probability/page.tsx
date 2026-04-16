import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import PullProbClient from './PullProbClient';

export const metadata: Metadata = {
  title: 'Pull Probability Calculator — How Many Packs to Pull a Card? | CardVault',
  description: 'Free pull probability calculator for sports cards and Pokemon TCG. Enter card odds and see how many packs, boxes, or cases you need for a 50%, 75%, 90%, or 99% chance of pulling your chase card. Includes cost estimates.',
  openGraph: {
    title: 'Pull Probability Calculator — How Many Packs Do You Need? | CardVault',
    description: 'Calculate exactly how many packs you need to open for a real chance at pulling your chase card. Free tool with cost estimates for sports cards and Pokemon.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Pull Probability Calculator — CardVault',
    description: 'How many packs do you need to pull your chase card? Calculate the odds with cost estimates.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Pull Probability Calculator' },
];

const faqItems = [
  {
    question: 'How many packs do I need to open to pull a specific card?',
    answer: 'It depends on the card\'s pull rate. For a card with 1-in-100 odds, you need 69 packs for a 50% chance, 138 packs for a 75% chance, and 230 packs for a 90% chance. The formula is: packs = log(1 - desired_probability) / log(1 - 1/odds). Our calculator does this math instantly for any product and odds combination.',
  },
  {
    question: 'What are typical pull rates for chase cards?',
    answer: 'Pull rates vary widely by product and insert level. Common inserts might be 1-in-4 packs. Numbered parallels like Silver Prizms are roughly 1-in-4 to 1-in-8 packs in hobby boxes. Autographs range from 1-in-6 (high-end hobby) to 1-in-72 (retail blasters). Ultra-rare cards like 1/1s or low-numbered parallels (/10, /25) can be 1-in-500 to 1-in-5000+ packs. Always check the product\'s official odds on the packaging or manufacturer website.',
  },
  {
    question: 'Is it cheaper to buy packs or just buy the card I want?',
    answer: 'In most cases, buying singles is significantly cheaper than trying to pull a specific card. For example, if a card sells for $50 but the pull probability calculator shows you need $500 worth of packs for a 90% chance of pulling it, buying the single saves you $450. The exception is if you enjoy the ripping experience and value the other cards you pull along the way. Use our Wax vs Singles Calculator for a detailed comparison.',
  },
  {
    question: 'Do box-level guarantees affect these calculations?',
    answer: 'Yes. Many hobby boxes guarantee a certain number of hits (e.g., "2 autographs per box"). Our calculator uses per-pack independent probability, which is the worst-case statistical baseline. If a box guarantees hits, your actual odds are better than what the calculator shows. However, the guarantee applies to the category (any auto) not a specific card, so for chasing one particular auto, the per-pack calculation is still useful.',
  },
  {
    question: 'Why do I need so many more packs to go from 90% to 99% confidence?',
    answer: 'This is due to the diminishing returns of probability. Going from 0% to 50% requires about 69 trials for 1-in-100 odds. But going from 90% to 99% requires an additional 230 packs (from 230 to 460 total). Each additional percentage point of confidence requires exponentially more packs. This is why most collectors consider 90% a practical threshold — the cost to reach 99% rarely justifies the marginal confidence gain.',
  },
];

export default function PullProbPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Pull Probability Calculator — How Many Packs to Pull a Card?',
        description: 'Calculate how many packs, boxes, or cases you need to open for a real chance at pulling your chase card. Free tool with cost estimates.',
        url: 'https://cardvault-two.vercel.app/tools/pull-probability',
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
        <div className="inline-flex items-center gap-2 bg-purple-950/60 border border-purple-800/50 text-purple-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
          Sports Cards &middot; Pokemon TCG &middot; All Products
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Pull Probability Calculator</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          How many packs do you really need to pull your chase card? Select a product or enter custom odds to see the
          math — with confidence thresholds, cost estimates, and a clear verdict.
        </p>
      </div>

      <PullProbClient />

      {/* FAQ */}
      <div className="mt-12 space-y-4">
        <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
        {faqItems.map((f, i) => (
          <details key={i} className="group bg-gray-900/40 border border-gray-800/40 rounded-lg">
            <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-gray-300 hover:text-white flex items-center justify-between">
              {f.question}
              <span className="text-gray-600 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <p className="px-4 pb-4 text-sm text-gray-400 leading-relaxed">{f.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

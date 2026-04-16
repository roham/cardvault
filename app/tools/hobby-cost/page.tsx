import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import HobbyCostClient from './HobbyCostClient';

export const metadata: Metadata = {
  title: 'Hobby Cost Calculator — How Much Does Card Collecting Really Cost? | CardVault',
  description: 'Free hobby cost calculator for sports card collectors. See exactly how much card collecting costs per year based on your intensity level. Breakdown by sealed product, singles, grading, supplies, shows, subscriptions, and shipping. Compare to other hobbies. Money-saving tips.',
  alternates: { canonical: './' },
  openGraph: {
    title: 'Hobby Cost Calculator — How Much Does Card Collecting Really Cost?',
    description: 'See the true annual cost of card collecting. Full breakdown by category. Compare to other hobbies.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Hobby Cost Calculator — CardVault',
    description: 'How much does card collecting really cost? Free calculator with full breakdown.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Hobby Cost Calculator' },
];

const faqItems = [
  {
    question: 'How much does card collecting cost per year?',
    answer: 'Card collecting costs vary dramatically by intensity. A casual collector spending on blasters and occasional singles might spend $600-$1,200 per year. A moderate collector adding hobby boxes, grading, and local shows typically spends $2,500-$5,000. Serious collectors with regular grading submissions and major show travel can spend $8,000-$15,000+. Hardcore collectors buying cases, high-end singles, and traveling to multiple shows can easily exceed $25,000-$50,000 annually.',
  },
  {
    question: 'What is the biggest expense in card collecting?',
    answer: 'For most collectors, sealed product (hobby boxes, blasters, retail) and singles purchases make up 60-70% of total spending. Grading services are the third largest expense for active collectors, typically 10-20% of annual spending. Supplies and shipping round out the recurring costs. For serious collectors, show travel can also be a significant expense.',
  },
  {
    question: 'Is card collecting an expensive hobby?',
    answer: 'Card collecting scales to any budget. At the casual level ($50-$100/month), it is comparable to streaming subscriptions or casual gaming. At the moderate level ($200-$400/month), it aligns with hobbies like golf, photography, or craft beer. At the serious and hardcore levels, it can rival luxury hobbies. The key advantage: unlike many hobbies, cards retain and sometimes appreciate in value, partially offsetting costs.',
  },
  {
    question: 'How can I reduce my card collecting costs?',
    answer: 'The biggest savings come from buying singles instead of ripping sealed product (the expected value of opening boxes is almost always negative). Other strategies: buy supplies in bulk (50% cheaper), use economy grading tiers ($20 vs $100+), join Facebook groups for zero-fee purchases (10-20% savings), negotiate at card shows, and set a strict monthly budget to avoid FOMO spending.',
  },
  {
    question: 'Does card collecting pay for itself?',
    answer: 'For most collectors, card collecting is a net cost — similar to any hobby. However, strategic collectors who buy singles at market lows, grade wisely, and sell at market highs can offset a significant portion of their hobby costs. Some flippers and investors do generate net positive returns, but this requires treating cards as a business rather than a hobby. The joy of collecting should be the primary motivation, not profit.',
  },
];

export default function HobbyCostPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Hobby Cost Calculator',
        description: 'Free calculator showing the true annual cost of card collecting. Breakdown by category, hobby comparison, and money-saving tips.',
        url: 'https://cardvault-two.vercel.app/tools/hobby-cost',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      }} />

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-green-950/60 border border-green-800/50 text-green-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          7 Cost Categories - Hobby Comparison - Savings Tips - Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Hobby Cost Calculator
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          How much does card collecting really cost? Select your intensity level and see a full annual cost breakdown — from sealed product to grading to shows.
        </p>
      </div>

      <HobbyCostClient />

      {/* How It Works */}
      <section className="mt-16 bg-gray-900/50 border border-gray-800 rounded-2xl p-6 sm:p-8">
        <h2 className="text-xl font-bold text-white mb-6">How It Works</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            { step: '1', title: 'Choose Your Intensity', desc: 'From casual (a few packs per month) to hardcore (cases, high-end singles, and shows). Pick what matches your collecting style.' },
            { step: '2', title: 'Select Your Category', desc: 'Baseball, basketball, football, hockey, Pokemon, or multi-category. Some sports cost more due to product pricing and demand.' },
            { step: '3', title: 'See Your Breakdown', desc: 'Get a detailed annual cost breakdown across 7 categories: sealed, singles, grading, supplies, shows, subscriptions, and shipping.' },
            { step: '4', title: 'Compare & Save', desc: 'See how card collecting compares to other hobbies and get tips to reduce your costs without reducing your fun.' },
          ].map(item => (
            <div key={item.step} className="flex gap-4">
              <div className="shrink-0 w-8 h-8 rounded-full bg-green-600/20 border border-green-600/40 flex items-center justify-center text-green-400 font-bold text-sm">
                {item.step}
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-12">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group bg-gray-900/50 border border-gray-800 rounded-xl">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-green-400 transition-colors">
                {item.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform ml-2">&#9662;</span>
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Related Tools */}
      <section className="mt-12 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Related Tools</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { href: '/tools/budget-planner', label: 'Hobby Budget Planner', desc: 'Allocate your monthly budget' },
            { href: '/tools/flip-calc', label: 'Flip Profit Calculator', desc: 'Calculate profit on card flips' },
            { href: '/tools/tax-calc', label: 'Card Tax Calculator', desc: 'Capital gains on collectibles' },
            { href: '/tools/insurance-calc', label: 'Insurance Calculator', desc: 'Protect your collection value' },
            { href: '/tools/sealed-portfolio', label: 'Sealed Portfolio Tracker', desc: 'Track sealed wax investments' },
            { href: '/tools/grading-roi', label: 'Grading ROI Calculator', desc: 'Is grading worth it?' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="block p-3 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-green-600/50 transition-colors">
              <div className="text-white font-medium text-sm">{link.label}</div>
              <div className="text-gray-500 text-xs mt-0.5">{link.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

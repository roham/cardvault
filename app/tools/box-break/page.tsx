import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import BoxBreakCalculator from './BoxBreakCalculator';

export const metadata: Metadata = {
  title: 'Box Break Calculator — Group Break Cost & EV Estimator',
  description: 'Free box break calculator for sports card group breaks. Calculate cost per spot, expected value per participant, and compare break formats. Baseball, basketball, football, and hockey.',
  openGraph: {
    title: 'Box Break Calculator — CardVault',
    description: 'Calculate cost per spot and expected value for sports card group breaks. Compare Random Team, PYT, Hit Draft, and Division formats.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Box Break Calculator — CardVault',
    description: 'Free group break cost calculator. Know your cost per spot and EV before you join.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Box Break Calculator' },
];

const faqItems = [
  {
    question: 'What is a box break in card collecting?',
    answer: 'A box break (or group break) is when multiple collectors split the cost of opening a sealed box of cards. Each participant is assigned one or more teams, and they receive all the cards pulled for their team(s). It lets collectors access premium products at a fraction of the full box price.',
  },
  {
    question: 'What is the difference between Random Team and Pick Your Team (PYT)?',
    answer: 'In a Random Team break, teams are randomly assigned to participants at equal cost. In PYT, participants choose their team before the break — popular teams (like the Chiefs, Lakers, or Yankees) cost more because demand is higher. Random Team is generally better value, while PYT lets you target specific players.',
  },
  {
    question: 'How is the breaker fee calculated?',
    answer: 'The breaker fee is a percentage markup on top of the product cost that the person hosting the break charges for their time, equipment, and service. Most reputable breakers charge 10-20%. This fee is divided across all spots in the break. A higher fee means higher cost per spot.',
  },
  {
    question: 'What does EV ratio mean?',
    answer: 'EV (Expected Value) ratio compares what you can expect to receive in card value versus what you pay for your spot. A 100% ratio means break-even on average. Below 100% means the average spot loses money (typical for most breaks due to breaker fees). Remember, EV is an average — individual spots can be much higher or lower.',
  },
  {
    question: 'Are box breaks worth it?',
    answer: 'It depends on your goals. If you want to collect cards of a specific team at a lower price than buying a full box, breaks can be great value. If you\'re purely looking at expected value, most break spots are negative EV due to breaker fees and shipping. The excitement and community aspect is a big part of the appeal — think of the premium as entertainment value.',
  },
];

export default function BoxBreakPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Box Break Calculator',
        description: 'Free box break calculator for sports card group breaks. Calculate cost per spot, expected value per participant, and compare break formats.',
        url: 'https://cardvault-two.vercel.app/tools/box-break',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      }} />

      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 bg-clip-text text-transparent mb-3">
          Box Break Calculator
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Calculate cost per spot, expected value, and compare break formats before you join a group break.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          16 products across 4 sports. Random Team, PYT, Hit Draft, and Division formats.
        </p>
      </div>

      <BoxBreakCalculator />

      {/* FAQ Section */}
      <section className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group border border-gray-800 rounded-lg">
              <summary className="px-5 py-4 cursor-pointer text-gray-200 font-medium hover:text-white transition-colors">
                {item.question}
              </summary>
              <p className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Related Tools */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Related Tools</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Link href="/tools/sealed-ev" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold text-white">Sealed Product EV Calculator</h3>
            <p className="text-sm text-gray-400 mt-1">Full expected value breakdown per product.</p>
          </Link>
          <Link href="/tools/pack-sim" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold text-white">Pack Simulator</h3>
            <p className="text-sm text-gray-400 mt-1">Simulate opening packs before you buy.</p>
          </Link>
          <Link href="/tools/trade" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold text-white">Trade Evaluator</h3>
            <p className="text-sm text-gray-400 mt-1">Compare both sides of a card trade.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}

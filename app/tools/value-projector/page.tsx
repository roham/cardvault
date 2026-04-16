import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ValueProjectorClient from './ValueProjectorClient';

export const metadata: Metadata = {
  title: 'Card Value Projector — Estimate Future Card Values | CardVault',
  description: 'Free card value projection tool. Select any sports card and see estimated future values at 1, 2, 3, 5, 7, and 10 years. Bear, base, and bull case scenarios based on player trajectory. Factors analysis, visual charts, and confidence ratings.',
  alternates: { canonical: './' },
  openGraph: {
    title: 'Card Value Projector — Estimate Future Card Values | CardVault',
    description: 'Project your card values 1-10 years into the future. Bear, base, and bull case scenarios.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Value Projector — CardVault',
    description: 'Estimate future card values. 3 scenarios. 10-year projections. Free tool.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Card Value Projector' },
];

const faqItems = [
  {
    question: 'How accurate are card value projections?',
    answer: 'Card value projections are estimates based on historical market patterns and player trajectory analysis. They should be used as directional guidance, not investment advice. Key variables that can dramatically change outcomes include: player injuries, championships, scandals, market-wide cycles, and changes in collector demand. Projections for established stars and retired HOFers tend to be more reliable than those for prospects or young players.',
  },
  {
    question: 'What determines a card value trajectory?',
    answer: 'Six main factors drive card value over time: (1) Player performance and career trajectory, (2) Card scarcity and population reports, (3) Overall market conditions and collector demand, (4) Card condition and grade, (5) Historical significance of the set and card, (6) Supply dynamics (no new vintage cards can be created, increasing scarcity over time). The relative importance of each factor varies by player type and timeline.',
  },
  {
    question: 'Which cards are the safest long-term investments?',
    answer: 'Historically, the safest card investments are PSA 10 / BGS 9.5 graded rookie cards of confirmed Hall of Famers in iconic sets (e.g., 1986 Fleer Jordan, 2003 Topps Chrome LeBron). Vintage cards from the 1950s-1970s also have strong long-term appreciation due to scarcity. The riskiest investments are prospect cards and cards of active players who could suffer career-ending injuries.',
  },
  {
    question: 'Do all rookie cards go up in value?',
    answer: 'No. An estimated 60-70% of rookie cards lose value over time. Only players who establish themselves as stars or Hall of Famers see sustained appreciation. The key is identifying which rookies will break through. Waiting 1-2 seasons to confirm breakout performance before buying often provides better risk-adjusted returns than buying during rookie hype.',
  },
  {
    question: 'How does grading affect long-term card value?',
    answer: 'Grading amplifies both gains and losses. A PSA 10 version of a card typically trades at 2-5x the price of a PSA 9, and 5-20x the price of a raw card. Over time, the grading premium tends to increase for desirable cards and decrease for unwanted cards. For long-term investments, gem mint graded cards in tamper-evident slabs provide the best combination of condition assurance and value preservation.',
  },
];

export default function ValueProjectorPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Value Projector',
        description: 'Free card value projection tool. Estimate future values at 1-10 years with bear, base, and bull case scenarios.',
        url: 'https://cardvault-two.vercel.app/tools/value-projector',
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
        <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-800/50 text-indigo-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
          9,000+ Cards - 6 Trajectories - 3 Scenarios - 10-Year Projections - Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Value Projector
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          What will your card be worth in 5 years? 10 years? Select a card and player trajectory to see projected values with bear, base, and bull case scenarios.
        </p>
      </div>

      <ValueProjectorClient />

      {/* How It Works */}
      <section className="mt-16 bg-gray-900/50 border border-gray-800 rounded-2xl p-6 sm:p-8">
        <h2 className="text-xl font-bold text-white mb-6">How It Works</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            { step: '1', title: 'Select Your Card', desc: 'Search our database of 9,000+ sports cards or manually enter a current value for any card.' },
            { step: '2', title: 'Choose Player Trajectory', desc: 'Select the trajectory that best matches the player: Rising Star, Established Star, Aging Legend, Retired HOF, Prospect, or Declining.' },
            { step: '3', title: 'View Projections', desc: 'See estimated values at 1, 2, 3, 5, 7, and 10 years in bear (worst), base (likely), and bull (best) case scenarios.' },
            { step: '4', title: 'Review Factors', desc: 'Understand the positive and negative factors that could influence your card value over time.' },
          ].map(item => (
            <div key={item.step} className="flex gap-4">
              <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-600/40 flex items-center justify-center text-indigo-400 font-bold text-sm">
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
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-indigo-400 transition-colors">
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
            { href: '/tools/investment-calc', label: 'Investment Calculator', desc: 'Returns vs S&P 500' },
            { href: '/tools/investment-planner', label: 'Investment Planner', desc: 'Portfolio allocation' },
            { href: '/tools/price-history', label: 'Price History', desc: 'Past value trends' },
            { href: '/tools/grading-roi', label: 'Grading ROI Calculator', desc: 'Is grading worth it?' },
            { href: '/tools/sealed-portfolio', label: 'Sealed Portfolio Tracker', desc: 'Track sealed investments' },
            { href: '/tools/trend-predictor', label: 'Trend Predictor', desc: 'Market direction analysis' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="block p-3 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-indigo-600/50 transition-colors">
              <div className="text-white font-medium text-sm">{link.label}</div>
              <div className="text-gray-500 text-xs mt-0.5">{link.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

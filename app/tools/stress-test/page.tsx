import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import StressTestClient from './StressTestClient';

export const metadata: Metadata = {
  title: 'Card Portfolio Stress Test — Market Crash, Lockout, Bubble Scenarios | CardVault',
  description: 'Stress test your sports card portfolio against 8 market scenarios: crash, lockout, player injury, grading scandal, rookie bubble pop, vintage surge, rookie boom, and seasonal dip. See per-card impact, resilience grade, risk score, and hedging recommendations. Free portfolio risk analysis tool.',
  openGraph: {
    title: 'Card Portfolio Stress Test — CardVault',
    description: 'How would your card collection survive a market crash? Test your portfolio against 8 scenarios and get a resilience grade.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Portfolio Stress Test — CardVault',
    description: 'Stress test your card portfolio against market crashes, lockouts, and bubbles. Free risk analysis.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Portfolio Stress Test' },
];

const faqItems = [
  {
    question: 'How does the card portfolio stress test work?',
    answer: 'Build a portfolio of up to 20 cards from our 6,200+ card database (or pick a preset like Top Rookies or Vintage Collection). Then select one of 8 market scenarios — such as Market Crash, Rookie Bubble Pop, or Grading Scandal — to see how your portfolio would be affected. The tool calculates per-card impact based on factors like card era, rookie status, sport, grade, and value tier. You get a total portfolio impact percentage, resilience letter grade (S through F), risk score out of 100, and personalized hedging recommendations.',
  },
  {
    question: 'What market scenarios can I test against?',
    answer: 'There are 8 scenarios spanning different risk types: Market Crash (broad 30-40% downturn), Sport Lockout (single sport drops 25-35%), Star Player Injury (top player cards drop 40-60%), Grading Scandal (graded premiums drop 20-30%), Rookie Bubble Pop (speculative rookies crash 40%), Vintage Surge (pre-1980 cards gain 25-50%), Rookie Boom (hot class drives 30-60% gains), and Off-Season Dip (predictable seasonal 15% dip). Each scenario affects different card types differently.',
  },
  {
    question: 'How can I make my card portfolio more resilient to market downturns?',
    answer: 'The most resilient card portfolios share four traits: multi-sport diversification (3+ sports reduces lockout and seasonal risk), vintage allocation (10-25% pre-1980 cards provide stability), balanced rookie exposure (30-50% rookies instead of 70%+), and mixed grading status (some raw cards hedge against grading company risk). The single most impactful change is adding vintage cards — they consistently hold value through market corrections because supply is permanently fixed.',
  },
  {
    question: 'Are the stress test results based on real market data?',
    answer: 'The scenario impacts are modeled on historical card market patterns. For example, the 2020-2022 card market bubble and correction saw modern rookies drop 40-60% while vintage cards held or gained. The 2021 PSA authentication concerns caused a temporary 15-20% drop in graded premiums. NBA lockouts historically depressed basketball card prices 20-30%. The tool applies these patterns proportionally based on each card\'s characteristics — era, sport, grade status, rookie status, and value tier.',
  },
  {
    question: 'What does the resilience grade mean?',
    answer: 'The resilience grade rates your portfolio\'s ability to withstand the selected scenario. S grade means virtually no impact (risk score 0-10), A means minimal impact (10-20), B means moderate impact (20-30), C means significant impact (30-45), D means severe impact (45-60), and F means devastating impact (60+). A well-diversified portfolio with vintage cards, multiple sports, and balanced rookie exposure typically earns an A or B grade across most scenarios.',
  },
];

export default function StressTestPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Portfolio Stress Test',
        description: 'Stress test your sports card portfolio against 8 market scenarios. Get resilience grades, risk scores, and hedging recommendations.',
        url: 'https://cardvault-two.vercel.app/tools/stress-test',
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

      <Breadcrumb items={breadcrumbs} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          8 Scenarios &middot; Per-Card Analysis &middot; Risk Score &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Portfolio Stress Test
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          How would your card collection survive a market crash? Build your portfolio, pick a scenario, and see exactly which cards are vulnerable and which are resilient.
        </p>
      </div>

      <StressTestClient />

      {/* FAQ section */}
      <section className="mt-12 border-t border-gray-800 pt-10">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((faq, i) => (
            <details key={i} className="group">
              <summary className="cursor-pointer text-white font-medium hover:text-emerald-400 transition-colors">
                {faq.question}
              </summary>
              <p className="mt-2 text-gray-400 text-sm leading-relaxed pl-4 border-l-2 border-gray-800">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Internal links */}
      <section className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-lg font-bold text-white mb-3">More Portfolio Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { href: '/tools/collection-report', label: 'Collection Report Card', desc: 'Grade your collection across 8 dimensions' },
            { href: '/tools/diversification', label: 'Diversification Analyzer', desc: 'See how diversified your collection is' },
            { href: '/tools/investment-return', label: 'Investment Return Calculator', desc: 'Compare card returns to S&P 500' },
            { href: '/tools/portfolio-rebalancer', label: 'Portfolio Rebalancer', desc: 'Optimize your collection allocation' },
            { href: '/tools/heat-score', label: 'Collection Heat Score', desc: 'Rate your collection\'s market heat' },
            { href: '/tools/seasonality', label: 'Market Seasonality Guide', desc: 'Know when to buy and sell' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="block p-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl transition-colors"
            >
              <div className="text-white font-medium text-sm">{link.label}</div>
              <div className="text-gray-500 text-xs mt-0.5">{link.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

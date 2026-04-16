import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CollectionHealthClient from './CollectionHealthClient';

export const metadata: Metadata = {
  title: 'Collection Health Score — Rate Your Sports Card Portfolio | CardVault',
  description: 'Get a 0-100 health score for your sports card collection. Measures diversification, grade quality, risk exposure, growth potential, and liquidity across 5 dimensions. Free portfolio analysis with actionable recommendations.',
  openGraph: {
    title: 'Collection Health Score — How Healthy is Your Collection? | CardVault',
    description: 'Rate your card collection on 5 dimensions. Get a score, actionable tips, and improvement roadmap.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Collection Health Score — CardVault',
    description: 'Free collection analysis. Score your portfolio on diversification, grade quality, risk, growth, and liquidity.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Collection Health Score' },
];

const faqItems = [
  {
    question: 'What does the Collection Health Score measure?',
    answer: 'The score evaluates your collection across 5 dimensions: Diversification (sport/era/player spread), Grade Quality (average condition and graded percentage), Risk Exposure (concentration in volatile assets), Growth Potential (rookie cards, trending players, modern sets), and Liquidity (how easily you could sell your collection). Each dimension scores 0-20, combining for a 0-100 total.',
  },
  {
    question: 'How do I enter my collection?',
    answer: 'Add cards manually by specifying the sport, era, estimated value, condition (raw or graded with grade), and card type (rookie, base, insert, auto). You can add as many cards as you want. The tool also offers 5 preset collection profiles if you want to see example scores for common collector types.',
  },
  {
    question: 'What is a good health score?',
    answer: 'Scores above 80 are considered Excellent — well-diversified, high-quality, liquid collections. Scores 60-79 are Good with room for improvement. Scores 40-59 indicate moderate risk areas. Below 40 suggests significant concentration risk or quality issues. Most casual collectors score between 50-70.',
  },
  {
    question: 'How can I improve my score?',
    answer: 'The tool provides specific recommendations based on your weakest dimensions. Common improvements include: diversifying across sports and eras, getting key cards graded, reducing concentration in a single player, adding rookie cards for growth potential, and ensuring you have liquid assets that sell quickly on eBay.',
  },
  {
    question: 'Does this tool save my collection data?',
    answer: 'Your collection data is stored only in your browser\'s local storage. Nothing is sent to any server. You can export your analysis or clear your data at any time. The tool is designed for quick assessments — for detailed tracking, use the CardVault Vault or Collection Value tool.',
  },
];

export default function CollectionHealthPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Collection Health Score — Rate Your Sports Card Portfolio',
        description: 'Free sports card collection health analysis. Score your portfolio on diversification, grade quality, risk, growth potential, and liquidity.',
        url: 'https://cardvault-two.vercel.app/tools/collection-health',
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
          Portfolio Analysis &middot; 5 Dimensions &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Collection Health Score
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Rate your card collection on a 0-100 scale. Measures diversification, grade quality, risk, growth potential, and liquidity.
        </p>
      </div>

      <CollectionHealthClient />

      {/* Related Tools */}
      <div className="mt-8 bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-3">Related Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/tools/collection-value', label: 'Collection Value', desc: 'Calculate total collection worth' },
            { href: '/tools/diversification', label: 'Diversification', desc: 'Entropy-based portfolio analysis' },
            { href: '/tools/investment-calc', label: 'Investment Calc', desc: 'Annualized return calculator' },
            { href: '/tools/grading-roi', label: 'Grading ROI', desc: 'Should you grade this card?' },
            { href: '/tools/stress-test', label: 'Stress Test', desc: 'Market crash simulation' },
            { href: '/tools/portfolio-rebalancer', label: 'Rebalancer', desc: 'Optimize portfolio allocation' },
          ].map(t => (
            <Link key={t.href} href={t.href} className="block bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3 hover:border-emerald-600/50 transition-colors">
              <div className="text-white text-sm font-medium">{t.label}</div>
              <div className="text-zinc-500 text-xs mt-0.5">{t.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-8 space-y-4">
        <h2 className="text-lg font-bold text-white">Frequently Asked Questions</h2>
        {faqItems.map((f) => (
          <details key={f.question} className="group bg-zinc-900/60 border border-zinc-800 rounded-lg">
            <summary className="cursor-pointer px-5 py-4 text-sm font-medium text-white group-open:border-b group-open:border-zinc-800">
              {f.question}
            </summary>
            <div className="px-5 py-4 text-sm text-zinc-400">{f.answer}</div>
          </details>
        ))}
      </div>

      <p className="text-center text-zinc-600 text-xs mt-10">
        Collection Health Score is for educational purposes. Scores are estimates based on general market principles. Not financial advice.
      </p>
    </div>
  );
}

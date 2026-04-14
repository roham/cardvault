import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import DraftPredictor from './DraftPredictor';

export const metadata: Metadata = {
  title: '2025 Draft Night Card Predictor — Which Rookies\' Cards Will Spike?',
  description: 'Free 2025 NFL and NBA Draft card predictor. See which rookies\' cards will spike on draft night. Projected values, spike probability, and key cards to watch for each prospect.',
  openGraph: {
    title: '2025 Draft Night Card Predictor — CardVault',
    description: 'Which rookies\' cards will spike on draft night? NFL + NBA 2025 draft predictions with card values.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '2025 Draft Night Card Predictor — CardVault',
    description: 'NFL + NBA 2025 draft card predictions. Pre-draft values, post-draft projections, spike probability.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: '2025 Draft Predictor' },
];

const faqItems = [
  {
    question: 'Do cards spike on draft night?',
    answer: 'Yes — dramatically. When a player is drafted, especially in the top 5, their cards can jump 2-10x in value within hours. The spike is driven by hype, landing spot (big market teams = bigger spike), and the rush of collectors wanting to own the "next big thing." The spike often corrects within 1-2 weeks as supply catches up.',
  },
  {
    question: 'Should I buy cards before or after the draft?',
    answer: 'If you want to invest: buy BEFORE the draft when prices are low. You\'re betting on draft position and landing spot. If you want to collect: wait until AFTER the draft when prices correct. The best strategy for most collectors is to buy 2-4 weeks after the draft when the initial hype dies down.',
  },
  {
    question: 'Which positions have the most card value?',
    answer: 'Quarterbacks dominate the football card market — they generate 3-5x the demand of any other position. In basketball, guards and forwards who score are most valuable. Defensive players and offensive linemen rarely move the card market, regardless of talent.',
  },
  {
    question: 'What cards should I buy for 2025 draft prospects?',
    answer: 'Bowman University Chrome cards are available now for most top prospects. After the draft, the key cards will be: Panini Prizm (Silver Prizm parallels), Panini Select, and Optic. For the best ROI, buy Bowman University Chrome now and sell into the draft night spike.',
  },
];

export default function DraftPredictorPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault 2025 Draft Night Card Predictor',
        description: 'Predict which rookies\' cards will spike on draft night. NFL and NBA 2025 draft card projections.',
        url: 'https://cardvault-two.vercel.app/tools/draft-predictor',
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

      <Breadcrumb items={breadcrumbs} />

      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-800/50 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
          NFL + NBA 2025 · Pre-draft values · Spike probability
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          2025 Draft Night Card Predictor
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Which rookies&apos; cards will spike on draft night? See projected values, spike probability, and key cards to watch for every top prospect.
        </p>
      </div>

      {/* Predictor */}
      <DraftPredictor />

      {/* FAQ */}
      <section className="mt-16 mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map(item => (
            <div key={item.question} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-white font-semibold text-sm mb-2">{item.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Internal links */}
      <div className="border-t border-gray-800 pt-10">
        <h3 className="text-white font-semibold mb-4">Related Tools & Guides</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/guides/best-rookie-cards-to-invest-2026" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
            Rookie Investment Guide
          </Link>
          <Link href="/tools/grading-roi" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Grading ROI Calculator
          </Link>
          <Link href="/tools/sealed-ev" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Sealed Product EV
          </Link>
          <Link href="/sports" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Sports Cards
          </Link>
          <Link href="/calendar" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Release Calendar
          </Link>
        </div>
      </div>
    </div>
  );
}

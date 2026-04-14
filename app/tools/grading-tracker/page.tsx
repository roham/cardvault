import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import GradingTracker from './GradingTracker';

export const metadata: Metadata = {
  title: 'Card Grading Tracker — Track Your PSA, BGS, CGC Submissions',
  description: 'Free card grading tracker. Log cards submitted to PSA, BGS, CGC, or SGC. Track status, turnaround times, costs, and ROI. See how much your grading investments are returning.',
  openGraph: {
    title: 'Card Grading Tracker — CardVault',
    description: 'Track your card grading submissions. Status tracking, cost analysis, and ROI for PSA, BGS, CGC, and SGC.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Grading Tracker — CardVault',
    description: 'Track cards sent for grading. Status, turnaround times, and ROI calculator.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Grading Tracker' },
];

const faqItems = [
  {
    question: 'How long does PSA grading take?',
    answer: 'PSA turnaround times vary by service tier: Value ($20/card) takes 90-150 days, Regular ($50) takes 65-90 days, Express ($100) takes 20-30 days, Super Express ($150) takes 5-10 days, and Walk-Through ($300) takes 1-3 days. Times are estimates and can fluctuate based on submission volume.',
  },
  {
    question: 'Is it worth grading a card?',
    answer: 'Grading is worth it when the price difference between raw and graded is significantly more than the grading cost. For example, if a raw card is worth $50 and a PSA 10 is worth $200, spending $20-$50 on grading makes sense. Use our Grading ROI Calculator to check specific cards before submitting.',
  },
  {
    question: 'Which grading company should I use?',
    answer: 'PSA is the most recognized and commands the highest premiums, especially for vintage and sports cards. BGS/Beckett is preferred for modern cards and offers subgrades. CGC is growing in popularity with competitive pricing. SGC is popular for vintage cards and has fast turnaround. The best choice depends on your card type and target buyer.',
  },
  {
    question: 'How do I track my grading submission status?',
    answer: 'Each grading company has its own online tracking system: PSA has Order Status Tracker, BGS has My Submissions, CGC has My CGC, and SGC has their online portal. This CardVault tracker lets you consolidate all your submissions from every company in one place with cost tracking and ROI analysis.',
  },
  {
    question: 'What percentage of cards get a PSA 10?',
    answer: 'The PSA 10 rate varies significantly by card type and era. Modern cards (2020+) from sealed packs have roughly a 20-30% chance of getting a PSA 10. Vintage cards (pre-1980) have much lower gem rates, often under 5%. Print quality, centering, and handling all affect the likelihood. Our Centering Calculator can help you pre-screen centering before submitting.',
  },
];

export default function GradingTrackerPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Grading Tracker',
        description: 'Free card grading submission tracker for PSA, BGS, CGC, and SGC. Track status, costs, and ROI.',
        url: 'https://cardvault-two.vercel.app/tools/grading-tracker',
        applicationCategory: 'UtilityApplication',
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
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          PSA - BGS - CGC - SGC - Status Tracking - ROI Analysis - Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Grading Tracker</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Track every card you submit for grading in one place. Monitor status, turnaround times, costs, and see exactly how much your grading investments are returning.
        </p>
      </div>

      <GradingTracker />

      {/* FAQ Section */}
      <div className="mt-12 bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((item, i) => (
            <div key={i} className="border-b border-gray-700/50 pb-5 last:border-0 last:pb-0">
              <h3 className="text-white font-semibold mb-2">{item.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-8 bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Related Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/tools/grading-roi" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">💰</span>
            <div>
              <div className="text-white text-sm font-medium">Grading ROI Calculator</div>
              <div className="text-gray-500 text-xs">Is it worth grading this card?</div>
            </div>
          </Link>
          <Link href="/tools/centering-calc" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">📐</span>
            <div>
              <div className="text-white text-sm font-medium">Centering Calculator</div>
              <div className="text-gray-500 text-xs">Check centering before submitting</div>
            </div>
          </Link>
          <Link href="/tools/flip-calc" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">💸</span>
            <div>
              <div className="text-white text-sm font-medium">Flip Profit Calculator</div>
              <div className="text-gray-500 text-xs">Calculate profit after grading + selling</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

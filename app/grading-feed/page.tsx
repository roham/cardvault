import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import GradingFeedClient from './GradingFeedClient';

export const metadata: Metadata = {
  title: 'Live Grading Results Feed — PSA, BGS, CGC, SGC Returns | CardVault',
  description: 'Watch grading results come back in real-time. PSA, BGS, CGC, and SGC grades on popular sports cards. Grade distribution stats, company comparison, value impact. Free grading companion.',
  openGraph: {
    title: 'Live Grading Results Feed — CardVault',
    description: 'Real-time grading results from PSA, BGS, CGC, SGC. Watch grades come back and track value impact.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Live Grading Results Feed — CardVault',
    description: 'Watch card grading results come back live. PSA 10 celebrations, grade distribution, value tracking.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Live', href: '/live-hub' },
  { label: 'Grading Feed' },
];

const faqItems = [
  {
    question: 'What is the Live Grading Results Feed?',
    answer: 'The Live Grading Results Feed simulates the experience of watching your card grading submissions come back from PSA, BGS, CGC, and SGC. Each result shows the card, the grade, the grading company, the raw vs graded value, and the value impact. It updates in real-time with new results every 12 seconds. The feed includes grade distribution charts, company comparison stats, and gem mint celebrations.',
  },
  {
    question: 'How are the grades determined?',
    answer: 'Grades follow a realistic distribution based on actual grading company data. About 8% of cards receive a perfect 10 (gem mint), 25% receive a 9, and the majority fall between 7 and 9.5. BGS results include subgrades for centering, corners, edges, and surface. The distribution mirrors what real submitters experience when sending cards to PSA, BGS, CGC, and SGC.',
  },
  {
    question: 'How does grading affect card value?',
    answer: 'Grading significantly impacts card value. A PSA 10 or BGS 9.5+ typically commands a 2-3.5x premium over the raw card value. A grade of 9 adds about 80% to the value. Cards graded 8 or above generally increase in value, while cards below a 7 can actually decrease from their raw value. The exact multiplier varies by card rarity, player popularity, and the grading company.',
  },
  {
    question: 'Which grading company should I use?',
    answer: 'PSA is the most popular and commands the highest premiums for most modern cards. BGS (Beckett) is preferred for ultra-modern cards because of their subgrade system and the coveted Black Label designation. CGC is newer to sports cards but growing fast with competitive pricing. SGC offers fast turnaround times and has a strong reputation for vintage cards. The best choice depends on your card type, budget, and timeline.',
  },
  {
    question: 'What does BGS subgrades mean?',
    answer: 'BGS (Beckett Grading Services) provides four subgrades in addition to the overall grade: Centering measures how well-centered the image is on the card, Corners evaluates the sharpness of all four corners, Edges checks for chipping or wear along the edges, and Surface examines the card face for scratches, print defects, or other imperfections. All four subgrades must be 10 to receive a BGS Black Label Pristine 10, the highest possible grade.',
  },
];

export default function GradingFeedPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Live Grading Results Feed',
        description: 'Watch card grading results come back in real-time from PSA, BGS, CGC, and SGC.',
        url: 'https://cardvault-two.vercel.app/grading-feed',
        applicationCategory: 'ReferenceApplication',
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
        <div className="inline-flex items-center gap-2 bg-green-950/60 border border-green-800/50 text-green-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          Live Feed &middot; PSA &middot; BGS &middot; CGC &middot; SGC
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Live Grading Results Feed
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Watch grading results come back in real-time. PSA 10 celebrations, BGS subgrades,
          grade distribution stats, and value impact tracking across all major grading companies.
        </p>
      </div>

      <GradingFeedClient />

      {/* Related Pages */}
      <div className="mt-16 border-t border-zinc-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-4">Grading Resources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/tools/grading-roi" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-green-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Grading ROI Calculator</h3>
            <p className="text-xs text-zinc-500">Is it worth grading your card?</p>
          </Link>
          <Link href="/vault/grading-queue" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-green-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Grading Queue Manager</h3>
            <p className="text-xs text-zinc-500">Track your submissions across companies</p>
          </Link>
          <Link href="/tools/grading-probability" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-green-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Grading Probability</h3>
            <p className="text-xs text-zinc-500">Estimate your grade before submitting</p>
          </Link>
          <Link href="/tools/cross-grade" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-green-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Cross-Grade Analyzer</h3>
            <p className="text-xs text-zinc-500">Should you crack and resubmit?</p>
          </Link>
          <Link href="/tools/condition-grader" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-green-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Condition Self-Grader</h3>
            <p className="text-xs text-zinc-500">Grade your card step by step</p>
          </Link>
          <Link href="/market-alerts" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-green-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Market Alerts</h3>
            <p className="text-xs text-zinc-500">Price spikes, drops, and grading news</p>
          </Link>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-16 border-t border-zinc-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((faq) => (
            <div key={faq.question}>
              <h3 className="font-semibold text-white mb-2">{faq.question}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

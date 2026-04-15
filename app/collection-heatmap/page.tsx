import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CollectionHeatmap from './CollectionHeatmap';

export const metadata: Metadata = {
  title: 'Collection Heatmap — Visualize Your Card Portfolio',
  description: 'Free visual analytics for your card collection. See heatmaps of your cards by sport, era, and value tier. Get a diversity score, find collection gaps, and discover what to collect next.',
  openGraph: {
    title: 'Collection Heatmap — CardVault',
    description: 'Visualize your card collection across sports, eras, and value tiers with interactive heatmaps.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Collection Heatmap — CardVault',
    description: 'Visual analytics for card collectors. Heatmaps, diversity scores, and gap analysis.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Collection Heatmap' },
];

const faqItems = [
  {
    question: 'What does the Collection Heatmap show?',
    answer: 'The heatmap visualizes how your cards are distributed across different dimensions — sport vs era, sport vs value, or era vs value. Darker green cells mean more cards in that category. Empty (dark) cells reveal gaps in your collection. You can analyze all 4,200+ cards in the CardVault database, or focus on just your binder or vault.',
  },
  {
    question: 'What is the Diversity Score?',
    answer: 'The Diversity Score (0-100%) measures how evenly your collection is spread across the four major sports (baseball, basketball, football, hockey). A score of 100% means perfectly balanced. A low score means your collection is concentrated in one sport. Higher diversity generally means a more resilient portfolio — if one sport\'s market dips, others may hold value.',
  },
  {
    question: 'How do I improve my Collection Diversity Score?',
    answer: 'Add cards from your weakest sports. If you\'re 90% baseball, pick up some basketball or football rookies. The Collection Gaps section shows specific recommendations. You don\'t need to be perfectly balanced — a 60-70% score is healthy for most collectors.',
  },
  {
    question: 'Can I analyze just my personal collection?',
    answer: 'Yes. Switch the Source toggle from "All Cards" to "My Binder" (cards in your digital binder at /binder) or "My Vault" (cards from the pack store at /vault). The heatmap and stats update to reflect only your personal collection.',
  },
  {
    question: 'What are the value tiers?',
    answer: 'Cards are grouped into 5 value tiers based on raw (ungraded) estimated value: Under $5, $5-$24, $25-$99, $100-$499, and $500+. This helps you see whether your collection skews toward budget cards or high-end investments.',
  },
];

export default function CollectionHeatmapPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Collection Heatmap — Card Portfolio Visualizer',
        description: 'Visualize your card collection with interactive heatmaps across sports, eras, and value tiers.',
        url: 'https://cardvault-two.vercel.app/collection-heatmap',
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
          4,200+ cards &middot; 3 heatmap views &middot; Diversity scoring
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Collection Heatmap</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          See your card collection from above. Heatmaps reveal where you&apos;re heavy, where you have gaps, and what to collect next.
        </p>
      </div>

      <CollectionHeatmap />

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
        <h3 className="text-sm font-medium text-gray-500 mb-3">Collection Management</h3>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href="/binder" className="text-emerald-400 hover:text-emerald-300">Digital Binder</Link>
          <span className="text-gray-700">&middot;</span>
          <Link href="/vault" className="text-emerald-400 hover:text-emerald-300">My Vault</Link>
          <span className="text-gray-700">&middot;</span>
          <Link href="/tools/collection-value" className="text-emerald-400 hover:text-emerald-300">Collection Value</Link>
          <span className="text-gray-700">&middot;</span>
          <Link href="/tools/investment-calc" className="text-emerald-400 hover:text-emerald-300">Investment Calculator</Link>
          <span className="text-gray-700">&middot;</span>
          <Link href="/showcase" className="text-emerald-400 hover:text-emerald-300">Trophy Case</Link>
          <span className="text-gray-700">&middot;</span>
          <Link href="/tools/budget-planner" className="text-emerald-400 hover:text-emerald-300">Budget Planner</Link>
        </div>
      </div>
    </div>
  );
}

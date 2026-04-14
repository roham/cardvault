import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import SetChecklistClient from './SetChecklistClient';

export const metadata: Metadata = {
  title: 'Set Checklist Manager — Track Your Collection Completion',
  description: 'Pick any sports card set and track your completion. Check off cards you own, see completion percentage, missing cards, and estimated cost to complete. Supports all major sets.',
  openGraph: {
    title: 'Set Checklist Manager — CardVault',
    description: 'Track your sports card set completion. Check off what you own, see what you need, estimate cost to complete.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Set Checklist Manager — CardVault',
    description: 'Track your set completion. Check off owned cards, see missing list, estimate cost.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Set Checklist' },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How does the Set Checklist Manager work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Select a sports card set from the dropdown. You will see every card in that set listed as a checklist. Tap cards to mark them as owned. Your progress is saved automatically and you can see your completion percentage, missing cards, and estimated cost to finish the set.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is my checklist progress saved?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Your checklist progress is saved locally in your browser using localStorage. It persists between visits on the same device. You can also share your checklist via a URL to show friends what you need.',
      },
    },
    {
      '@type': 'Question',
      name: 'How is the estimated cost to complete calculated?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The estimated cost is based on the raw card values (PSA 7 equivalent) of each missing card in the set. This gives you a rough idea of what it would cost to buy the remaining cards at market prices.',
      },
    },
    {
      '@type': 'Question',
      name: 'What sets are available?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'All sets in the CardVault database are available. This includes sets from baseball, basketball, football, and hockey spanning from pre-war (1930s) through modern day. Sets need at least 3 cards to appear in the checklist.',
      },
    },
  ],
};

export default function SetChecklistPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Set Checklist Manager',
        description: 'Track your sports card set completion with an interactive checklist.',
        url: 'https://cardvault-two.vercel.app/tools/set-checklist',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />
      <JsonLd data={faqSchema} />

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-teal-950/60 border border-teal-800/50 text-teal-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
          Track your sets
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Set Checklist Manager</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Pick a set. Check off what you own. See your completion percentage and what it costs to finish.
        </p>
      </div>

      <SetChecklistClient />

      {/* Related tools */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Related Tools</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Link href="/tools/set-cost" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold text-white">Set Completion Cost</h3>
            <p className="text-sm text-gray-400">Estimate the full cost of completing a set</p>
          </Link>
          <Link href="/tools/collection-value" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold text-white">Collection Value</h3>
            <p className="text-sm text-gray-400">Calculate your total collection value</p>
          </Link>
          <Link href="/sports/sets" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold text-white">Browse All Sets</h3>
            <p className="text-sm text-gray-400">Explore every set in the database</p>
          </Link>
        </div>
      </section>
    </div>
  );
}

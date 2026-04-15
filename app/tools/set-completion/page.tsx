import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import SetCompletionClient from './SetCompletionClient';

export const metadata: Metadata = {
  title: 'Set Completion Tracker v2 — Multi-Set Dashboard & Want List | CardVault',
  description: 'Track your sports card set completion across every set. See progress bars, cost to complete, want list of missing cards, and milestone badges. The ultimate completionist tool.',
  openGraph: {
    title: 'Set Completion Tracker v2 — CardVault',
    description: 'Multi-set dashboard: track completion, cost to complete, want list, and milestones across all sports card sets.',
    type: 'website',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Set Completion v2' },
];

const faqItems = [
  {
    question: 'How does the Set Completion Tracker v2 work?',
    answer: 'The dashboard shows every sports card set in our database with a progress bar. Click any set to see every card as a checklist. Tap cards to mark them as owned. Your progress saves automatically and you can track multiple sets simultaneously.',
  },
  {
    question: 'What is the Want List?',
    answer: 'The Want List combines all missing cards across every set you are tracking. It shows each card you need, which set it belongs to, and the estimated cost. Sort by cheapest first to find the best deals to fill gaps in your collection.',
  },
  {
    question: 'How is cost to complete calculated?',
    answer: 'Cost to complete is the sum of estimated values for all cards you have not yet marked as owned in a set. Values are based on recent eBay sold prices and auction records. The number updates in real time as you check off cards.',
  },
  {
    question: 'What do the milestone badges mean?',
    answer: 'Badges track your progress: STARTED (any cards owned), 25%+, 50%+, 75%+, and COMPLETE (100%). The dashboard sorts by "Closest to Complete" by default so you can focus on finishing sets you have nearly completed.',
  },
  {
    question: 'Is my progress saved between visits?',
    answer: 'Yes. All completion data is saved locally in your browser using localStorage. Your progress persists between visits on the same device. You can track hundreds of sets simultaneously without any account needed.',
  },
];

export default function SetCompletionPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Set Completion Tracker v2 — CardVault',
        description: 'Multi-set sports card completion tracker with want list, cost to complete, and milestone badges.',
        url: 'https://cardvault-two.vercel.app/tools/set-completion',
        applicationCategory: 'GameApplication',
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
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Set Completion Tracker</h1>
          <span className="text-xs bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 px-2 py-0.5 rounded-full">v2</span>
        </div>
        <p className="text-gray-400 text-lg">
          Track your collection across every set. Multi-set dashboard, want list, cost to complete, and milestone badges.
        </p>
      </div>

      <SetCompletionClient />

      {/* FAQ */}
      <section className="mt-16 border-t border-gray-800 pt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map(f => (
            <details key={f.question} className="group bg-gray-900 border border-gray-800 rounded-xl">
              <summary className="px-5 py-4 text-white font-medium cursor-pointer hover:text-emerald-400 transition-colors">
                {f.question}
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm">{f.answer}</div>
            </details>
          ))}
        </div>
      </section>

      {/* Internal links */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-lg font-semibold text-white mb-4">Related Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href="/tools/set-checklist" className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-300 hover:text-emerald-400 hover:border-gray-700 transition-colors">
            Set Checklist
          </Link>
          <Link href="/tools/visual-binder" className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-300 hover:text-emerald-400 hover:border-gray-700 transition-colors">
            Visual Binder
          </Link>
          <Link href="/tools/collection-value" className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-300 hover:text-emerald-400 hover:border-gray-700 transition-colors">
            Collection Value
          </Link>
          <Link href="/vault" className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-300 hover:text-emerald-400 hover:border-gray-700 transition-colors">
            My Vault
          </Link>
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CollectionGoals from './CollectionGoals';

export const metadata: Metadata = {
  title: 'Collection Goals Tracker — Set & Track Your Card Collecting Goals',
  description: 'Set and track your card collecting goals. Target set completions, card acquisitions, grading submissions, and value milestones. Progress tracking with quick presets. Free and saved locally.',
  openGraph: {
    title: 'Collection Goals Tracker — CardVault',
    description: 'Set collecting goals. Track progress on set completion, acquisitions, grading, and value targets.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Collection Goals Tracker — CardVault',
    description: 'Track your card collecting goals. Set completion, acquisitions, grading, value targets.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Collection Goals' },
];

const faqItems = [
  {
    question: 'How do collection goals work?',
    answer: 'Create goals for anything related to your collection — completing a set, acquiring a specific card, submitting cards for grading, or hitting a value target. Track progress with quick percentage buttons (10%, 25%, 50%, 75%, 100%). Goals are saved locally in your browser so you can come back and update them anytime.',
  },
  {
    question: 'What goal categories are available?',
    answer: 'Five categories: Set Completion (tracking progress on finishing a full set), Card Acquisition (targeting specific cards), Grading (tracking grading submissions and results), Value Target (hitting a collection value milestone), and Custom (anything else). Each has a priority level (High, Medium, Low) to help you focus.',
  },
  {
    question: 'Can I share my goals with friends?',
    answer: 'Goals are currently stored locally on your device. Sharing is on the roadmap. For now, you can screenshot your goals page to share progress with friends or on social media.',
  },
];

export default function CollectionGoalsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Collection Goals Tracker',
        description: 'Set and track card collecting goals including set completion, card acquisition, grading submissions, and value targets.',
        url: 'https://cardvault-two.vercel.app/collection-goals',
        applicationCategory: 'UtilitiesApplication',
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
        <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-800/50 text-indigo-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
          5 Categories &middot; Progress Tracking &middot; Quick Presets &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Collection Goals</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Set goals for your card collection and track your progress. Whether you&rsquo;re completing a set,
          hunting for a grail card, or building toward a value target — stay focused and motivated.
        </p>
      </div>

      <CollectionGoals />

      {/* FAQ */}
      <div className="mt-12 space-y-6">
        <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
        {faqItems.map(f => (
          <div key={f.question} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-2">{f.question}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{f.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

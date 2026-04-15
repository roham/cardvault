import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ChallengeClient from './ChallengeClient';

export const metadata: Metadata = {
  title: 'Card Collection Challenges — Weekly Collecting Goals & Rewards',
  description: 'Take on weekly card collection challenges. Complete themed goals like Rookie Rush, Vintage Hunter, and Team Builder to earn XP, badges, and track your collecting streak.',
  openGraph: {
    title: 'Card Collection Challenges — CardVault',
    description: 'Weekly themed collecting challenges with progress tracking, XP rewards, and badges. Complete goals to level up your collector profile.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Collection Challenges — CardVault',
    description: 'Weekly themed collecting challenges. Earn XP and badges by completing collection goals.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Collection Challenges' },
];

const faqItems = [
  {
    question: 'How do weekly collection challenges work?',
    answer: 'Each week, four new themed challenges rotate in automatically. Every collector sees the same challenges. Complete them by adding matching cards to your binder or manually marking progress. Challenges reset every Sunday at midnight, so check in early to maximize your time.',
  },
  {
    question: 'What rewards do I earn from completing challenges?',
    answer: 'Each challenge awards XP based on its difficulty: Easy challenges give 50 XP, Medium 100 XP, Hard 200 XP, and Expert 300 XP. You also earn a unique badge for each completed challenge. XP and badges are tracked in your stats dashboard and persist across weeks.',
  },
  {
    question: 'What is the challenge streak and how do I maintain it?',
    answer: 'Your challenge streak counts consecutive weeks where you completed at least one challenge. Miss a full week without completing any challenge and your streak resets to zero. Even finishing one Easy challenge per week keeps your streak alive.',
  },
  {
    question: 'Can I check my binder automatically for challenge progress?',
    answer: 'Yes! The "Check Binder" button scans your digital binder (stored locally) and automatically detects cards that match the current challenge criteria. You can also manually mark progress if you prefer to track physical cards that are not in your digital binder.',
  },
  {
    question: 'How are the weekly challenges selected?',
    answer: 'Challenges rotate from a bank of 24 themed goals using a deterministic weekly schedule. This means all collectors see the same four challenges each week, creating a shared community experience. The rotation ensures variety so you rarely see the same challenge two weeks in a row.',
  },
];

export default function CollectionChallengePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Collection Challenges',
        description: 'Weekly themed card collection challenges with progress tracking, XP rewards, and badges.',
        url: 'https://cardvault-two.vercel.app/collection-challenge',
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

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Weekly Goals &middot; XP &middot; Badges &middot; Streaks
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Collection Challenges</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Take on weekly themed challenges to grow your collection. Complete goals to earn XP, unlock badges, and build your collector streak. New challenges rotate every Sunday.
        </p>
      </div>

      <ChallengeClient />

      {/* FAQ Section */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((f, i) => (
            <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <h3 className="font-semibold text-white mb-2">{f.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

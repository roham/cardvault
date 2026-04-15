import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import DailyChallengesClient from './DailyChallengesClient';

export const metadata: Metadata = {
  title: 'Daily Collector Challenges — Earn XP & Streak Rewards | CardVault',
  description: 'Complete 3 daily challenges to earn XP, build streaks, and unlock collector rewards. New challenges every day — browse cards, use tools, explore features, and level up your collecting game.',
  openGraph: {
    title: 'Daily Collector Challenges — CardVault',
    description: 'Three new challenges every day. Earn XP, build streaks, unlock rewards. Return daily to level up.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Daily Collector Challenges — CardVault',
    description: 'Complete 3 daily challenges for XP and streak rewards. New challenges every day.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/card-battle' },
  { label: 'Daily Challenges' },
];

const faqItems = [
  {
    question: 'How do Daily Challenges work?',
    answer: 'Each day you get 3 new collector challenges. Complete all 3 to earn bonus XP and extend your streak. Challenges reset at midnight and include tasks like browsing specific card categories, using tools, checking market data, and exploring features. Each challenge awards XP, and completing all 3 earns a daily bonus.',
  },
  {
    question: 'What rewards do I get for streaks?',
    answer: 'Streaks reward consistency. At 3 days you earn a 1.5x XP multiplier, at 7 days you get 2x XP, at 14 days you reach 2.5x, and at 30 days you hit the maximum 3x XP multiplier. Your streak resets if you miss a day. The longest streak you have ever achieved is tracked as your personal best.',
  },
  {
    question: 'When do challenges reset?',
    answer: 'New challenges appear every day at midnight (your local time). You have 24 hours to complete all 3 challenges. Unfinished challenges do not carry over — each day is a fresh set. The challenge selection rotates through different categories to keep things interesting.',
  },
  {
    question: 'What types of challenges are there?',
    answer: 'Challenges fall into 6 categories: Browse (explore cards and players), Tools (use calculators and analyzers), Market (check prices and trends), Collection (manage your binder and vault), Games (play card games and quizzes), and Social (share results and visit community features). Each day draws from different categories.',
  },
  {
    question: 'Do challenges connect to my Progression level?',
    answer: 'Yes. XP earned from daily challenges counts toward your overall Progression level at /progression. Daily challenges are one of the best ways to earn consistent XP. The streak multiplier makes them even more valuable over time — a 30-day streak with 3x multiplier earns 3 times the base XP per challenge.',
  },
];

export default function DailyChallengesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Daily Collector Challenges',
        description: 'Complete 3 daily challenges to earn XP and build streaks.',
        url: 'https://cardvault-two.vercel.app/daily-challenges',
        applicationCategory: 'Game',
        operatingSystem: 'Web',
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

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          New Challenges Daily
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Daily Collector Challenges</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Complete 3 challenges every day to earn XP, build streaks, and level up your collecting game. New challenges drop at midnight.
        </p>
      </div>

      <DailyChallengesClient />

      {/* FAQ Section */}
      <section className="mt-16 border-t border-gray-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((item, i) => (
            <details key={i} className="group bg-gray-900/50 border border-gray-800 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-amber-400 transition-colors">
                {item.question}
                <span className="ml-2 text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <p className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Related Links */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-lg font-bold text-white mb-4">Related</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Progression & XP', href: '/progression' },
            { label: 'Achievements', href: '/achievements' },
            { label: 'Season Pass', href: '/season-pass' },
            { label: 'Daily Pack', href: '/digital-pack' },
            { label: 'Streak Tracker', href: '/streak' },
            { label: 'Card Trivia', href: '/trivia' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="bg-gray-900/60 border border-gray-800 rounded-lg px-4 py-3 text-sm text-gray-300 hover:text-white hover:border-gray-700 transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

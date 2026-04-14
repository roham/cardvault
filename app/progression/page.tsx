import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ProgressionClient from './ProgressionClient';

export const metadata: Metadata = {
  title: 'Collector Progression — Level Up by Exploring CardVault',
  description: 'Track your collector level, earn XP from every CardVault activity, unlock perks, and climb from Rookie Collector to Card Master. 50 levels, 12 perks, 5 ranks.',
  openGraph: {
    title: 'Collector Progression — CardVault',
    description: 'Level up your collector profile. Earn XP from packs, battles, trivia, and trading. 50 levels to Card Master.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Collector Progression — CardVault',
    description: 'Track your level, earn XP, unlock perks. 50 levels from Rookie to Card Master.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Progression' },
];

const faqItems = [
  {
    question: 'How do I earn XP on CardVault?',
    answer: 'You earn XP from almost every activity: viewing cards (+5 XP), opening packs (+25 XP), reading guides (+15 XP), using tools (+10 XP), winning card battles (+30 XP), playing trivia (+20 XP), maintaining your daily streak (+10 XP/day), and unlocking achievements (+100 XP each).',
  },
  {
    question: 'How many levels are there?',
    answer: 'There are 50 levels organized into 5 ranks: Rookie Collector (1-10), Card Enthusiast (11-20), Seasoned Trader (21-30), Expert Collector (31-40), and Card Master (41-50). Each rank unlocks a new title and visual style for your profile.',
  },
  {
    question: 'What perks do I unlock by leveling up?',
    answer: 'There are 12 perks across all 50 levels. Early perks include daily pack access and market insights. Higher levels unlock collection badges, showcase spotlights, custom card frames, and the legendary Hall of Fame at level 50.',
  },
  {
    question: 'Does my progress carry over between sessions?',
    answer: 'Yes! Your XP is calculated from all your accumulated activity stored in your browser. Your level updates automatically as you use CardVault features. No sign-up required.',
  },
  {
    question: 'What is the fastest way to level up?',
    answer: 'Achievements give the most XP per action (100 XP each). After that, opening packs (25 XP), winning card battles (30 XP), and creating fantasy portfolios (40 XP) are the fastest ways to earn XP. Daily streaks compound over time too.',
  },
];

export default function ProgressionPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Collector Progression',
        description: 'Level up your collector profile by earning XP from CardVault activities. 50 levels, 12 perks, 5 ranks.',
        url: 'https://cardvault-two.vercel.app/progression',
        applicationCategory: 'GameApplication',
        operatingSystem: 'Any',
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

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          XP &amp; Levels
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Collector Progression</h1>
        <p className="text-gray-400 max-w-2xl">
          Every action on CardVault earns experience. Level up from Rookie Collector to Card Master
          across 50 levels. Unlock perks and earn your rank.
        </p>
      </div>

      <ProgressionClient />

      {/* FAQ */}
      <div className="mt-12 border-t border-gray-800/50 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group bg-gray-900/40 border border-gray-800/40 rounded-lg">
              <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-gray-200 hover:text-white transition-colors">
                {item.question}
              </summary>
              <div className="px-4 pb-3 text-sm text-gray-400 leading-relaxed">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

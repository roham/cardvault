import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import SeasonPassClient from './SeasonPassClient';

export const metadata: Metadata = {
  title: 'Season Pass — Earn Rewards Every Season | CardVault',
  description: 'Free season pass for card collectors. Earn XP through daily activities — pack openings, trivia, card battles, and more. Unlock digital packs, badges, XP boosts, and exclusive rewards across 50 tiers.',
  openGraph: {
    title: 'Season Pass — Earn Rewards Every Season | CardVault',
    description: 'Free 50-tier season pass. Earn XP, unlock packs, badges, and exclusive rewards through daily collecting activities.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Season Pass — CardVault',
    description: '50 tiers of rewards for card collectors. Free pass + premium upgrade.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Season Pass' },
];

const faqItems = [
  {
    question: 'What is the Season Pass?',
    answer: 'The Season Pass is a seasonal progression system with 50 tiers of rewards. Earn XP through daily activities like opening packs, completing trivia, winning card battles, and using tools. Each tier unlocks rewards like digital packs, profile badges, and XP boosts. A new season starts every quarter with fresh rewards.',
  },
  {
    question: 'How do I earn Season Pass XP?',
    answer: 'XP is earned through activities across CardVault: daily logins (10 XP), opening daily packs (15 XP), winning card battles (20 XP), completing trivia (25 XP), Card Bingo lines (50 XP), weekly challenges (100 XP), using tools (5 XP each), and more. The more you engage with CardVault, the faster you progress.',
  },
  {
    question: 'What is the difference between Free and Premium pass?',
    answer: 'The Free pass includes rewards every 3-5 tiers — packs, badges, and XP boosts. The Premium pass adds additional rewards at nearly every tier including exclusive packs (Chrome, Prizm, Select, National Treasures), rare cards (numbered, short prints, superfractors), and exclusive profile badges.',
  },
  {
    question: 'Do I lose my progress when the season ends?',
    answer: 'Any claimed rewards are yours permanently — packs, badges, and cards stay in your collection. However, unclaimed rewards and XP progress reset at the end of each season. Make sure to claim all unlocked rewards before the season ends.',
  },
  {
    question: 'How long does each season last?',
    answer: 'Each season runs for approximately 3 months (one quarter). The current Spring 2026 season runs from April 1 to June 30. New seasons bring fresh reward tracks, new badges, and updated pack contents.',
  },
];

export default function SeasonPassPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Season Pass',
        description: 'Seasonal progression system for card collectors with 50 tiers of rewards.',
        url: 'https://cardvault-two.vercel.app/season-pass',
        applicationCategory: 'GameApplication',
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

      <SeasonPassClient />

      {/* FAQ Section */}
      <div className="mt-12 border-t border-gray-800 pt-10">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group bg-gray-900/60 border border-gray-800 rounded-xl">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium text-sm hover:text-indigo-400 transition-colors">
                {item.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform ml-2">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-400 leading-relaxed">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-10 text-center">
        <p className="text-gray-500 text-sm mb-3">Start earning XP now:</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/tools/daily-pack" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-sm text-gray-300 hover:text-white transition-colors">
            Open Daily Pack
          </Link>
          <Link href="/trivia" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-sm text-gray-300 hover:text-white transition-colors">
            Play Trivia
          </Link>
          <Link href="/bingo" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-sm text-gray-300 hover:text-white transition-colors">
            Card Bingo
          </Link>
          <Link href="/weekly-challenge" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-sm text-gray-300 hover:text-white transition-colors">
            Weekly Challenge
          </Link>
        </div>
      </div>
    </div>
  );
}

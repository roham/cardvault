import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import FortuneWheelClient from './FortuneWheelClient';

export const metadata: Metadata = {
  title: 'Card Fortune Wheel — Daily Free Spin for Vault Rewards | CardVault',
  description: 'Spin the Fortune Wheel once per day for free vault credits, bonus cards, and rare prizes. Build your spin streak for bigger rewards. Daily engagement feature for card collectors.',
  openGraph: {
    title: 'Card Fortune Wheel — Spin Daily for Free Prizes | CardVault',
    description: 'Free daily spin for vault credits and cards. 9 prize tiers from +$10 to Jackpot. Build your streak!',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Fortune Wheel — CardVault',
    description: 'Spin the wheel daily for free cards and credits. How lucky are you?',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Daily', href: '/my-hub' },
  { label: 'Fortune Wheel' },
];

const faqItems = [
  {
    question: 'How does the Fortune Wheel work?',
    answer: 'The Fortune Wheel gives you one free spin per day. The wheel has 9 prize tiers ranging from +$10 vault credits to the Jackpot (+$1,000 credits and 3 bonus cards). Your spin results are tracked across sessions, including total spins, credits won, cards won, and your consecutive spin streak.',
  },
  {
    question: 'What prizes can I win?',
    answer: 'Prizes include vault credits (+$10, +$25, +$50, +$100, +$250, +$500), free cards from the 7,000+ card database, double card awards, and the Jackpot which gives $1,000 in credits plus 3 random cards. Rarer prizes have lower drop rates but bigger rewards.',
  },
  {
    question: 'What is the spin streak?',
    answer: 'Your spin streak tracks how many consecutive days you have spun the wheel. It resets if you miss a day. Building a long streak shows dedication to daily collecting habits. Visit every day to keep your streak alive!',
  },
  {
    question: 'When does my daily spin reset?',
    answer: 'Your spin resets at midnight in your local time zone. You get exactly one free spin per day. If you miss a day, your streak resets but your total spins and credits are preserved.',
  },
  {
    question: 'How do I use the credits I win?',
    answer: 'Credits are added to your CardVault vault balance. You can use them to open packs in the Pack Store, buy cards from the Marketplace, or participate in other vault-powered features. Visit your Vault page to see your current balance and collection.',
  },
];

export default function FortuneWheelPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Fortune Wheel — Daily Free Spin for Vault Rewards',
        description: 'Spin the Fortune Wheel once per day for free vault credits, bonus cards, and rare prizes.',
        url: 'https://cardvault-two.vercel.app/fortune-wheel',
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
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          Free Daily Spin &middot; 9 Prize Tiers &middot; Streak Tracking
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Fortune Wheel</h1>
        <p className="text-gray-400 text-lg">
          Spin the wheel once per day for free vault credits, bonus cards, and rare prizes.
          Build your streak for bragging rights!
        </p>
      </div>

      <FortuneWheelClient />

      {/* FAQ */}
      <div className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map(f => (
            <details key={f.question} className="group bg-gray-900/80 border border-gray-800 rounded-lg">
              <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-gray-200 hover:text-white flex items-center justify-between">
                {f.question}
                <span className="text-gray-600 group-open:rotate-180 transition-transform">&#x25BC;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-400">{f.answer}</div>
            </details>
          ))}
        </div>
      </div>

      {/* Internal Links */}
      <div className="mt-8 text-sm text-gray-500 space-y-1">
        <p>
          Daily activities: <Link href="/tools/daily-pack" className="text-amber-400 hover:underline">Daily Pack</Link> &middot;{' '}
          <Link href="/trivia" className="text-amber-400 hover:underline">Daily Trivia</Link> &middot;{' '}
          <Link href="/flip-or-keep" className="text-amber-400 hover:underline">Flip or Keep</Link> &middot;{' '}
          <Link href="/rip-or-skip" className="text-amber-400 hover:underline">Rip or Skip</Link> &middot;{' '}
          <Link href="/my-hub" className="text-amber-400 hover:underline">Collector Hub</Link>
        </p>
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardScrambleClient from './CardScrambleClient';

export const metadata: Metadata = {
  title: 'Card Scramble — Unscramble Card Hobby Words | CardVault',
  description: 'Free daily word game for card collectors. Unscramble player names, set names, and hobby terms against the clock. 10 words, 90 seconds. Daily challenges and shareable results.',
  openGraph: {
    title: 'Card Scramble — CardVault',
    description: 'Unscramble card hobby words against the clock. 10 words, 90 seconds. Daily challenge.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Scramble — CardVault',
    description: 'Daily word unscrambling game for card collectors.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/my-hub' },
  { label: 'Card Scramble' },
];

const faqItems = [
  {
    question: 'How does Card Scramble work?',
    answer: 'You get 10 scrambled words from three categories: hobby terms (like REFRACTOR or GRADING), card brand/set names (like TOPPS or PRIZM), and player names from the CardVault database. You have 90 seconds total to unscramble all 10 words. Type your answer and press Enter or tap Go. Faster correct answers earn bonus points.',
  },
  {
    question: 'How is scoring calculated?',
    answer: 'Each correct answer is worth 100 base points, plus a speed bonus of up to 45 points for answering within 15 seconds. Using a hint costs 30 points. Skipping a word earns 0 points. The maximum possible score is about 1,450 points (all correct with maximum speed bonuses and no hints). Grades range from S (900+) to F (under 150).',
  },
  {
    question: 'What is the Daily Challenge mode?',
    answer: 'The Daily Challenge uses the same 10 scrambled words for every player on the same day. This lets you compare scores with friends. The Random mode generates a fresh set of words each time for unlimited practice. Both modes track your stats separately.',
  },
  {
    question: 'What types of words appear in the game?',
    answer: 'Words come from three categories: Hobby Terms (collecting vocabulary like ROOKIE, SLAB, AUTOGRAPH), Card Brands/Sets (real brands like TOPPS, PANINI, PRIZM, BOWMAN), and Player Names (real athletes from the CardVault database across baseball, basketball, football, and hockey).',
  },
  {
    question: 'Can I share my results?',
    answer: 'Yes! After finishing a game, tap "Copy Results" to get a shareable emoji grid showing which words you solved (green), solved with a hint (yellow), or missed (red), along with your score and grade. Paste it into social media or text messages to challenge friends.',
  },
];

export default function CardScramblePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Scramble',
        description: 'Daily word unscrambling game for card collectors. Unscramble player names, set names, and hobby terms.',
        url: 'https://cardvault-two.vercel.app/card-scramble',
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
        <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-800/50 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          Word Game &middot; 90 Seconds &middot; {10} Words
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Scramble</h1>
        <p className="text-gray-400 text-lg">
          Unscramble player names, set names, and hobby terms before time runs out. How well do you know the card collecting hobby?
        </p>
      </div>

      <CardScrambleClient />

      {/* FAQ */}
      <div className="mt-12 space-y-4">
        <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
        {faqItems.map((faq, i) => (
          <details key={i} className="bg-gray-900/50 border border-gray-800/50 rounded-xl overflow-hidden group">
            <summary className="px-6 py-4 cursor-pointer text-gray-200 font-medium hover:text-white transition-colors list-none flex items-center justify-between">
              {faq.question}
              <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </summary>
            <div className="px-6 pb-4 text-gray-400 text-sm leading-relaxed">{faq.answer}</div>
          </details>
        ))}
      </div>

      {/* Related links */}
      <div className="mt-8 bg-gray-900/50 border border-gray-800/50 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">Explore CardVault</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Link href="/guess-the-card" className="text-emerald-400 hover:text-emerald-300">🔮 Guess the Card</Link>
          <Link href="/trivia" className="text-emerald-400 hover:text-emerald-300">🧠 Daily Trivia</Link>
          <Link href="/price-blitz" className="text-emerald-400 hover:text-emerald-300">⏱️ Price Blitz</Link>
          <Link href="/card-connections" className="text-emerald-400 hover:text-emerald-300">🔗 Card Connections</Link>
          <Link href="/tools/pack-sim" className="text-emerald-400 hover:text-emerald-300">🎰 Pack Simulator</Link>
          <Link href="/my-hub" className="text-emerald-400 hover:text-emerald-300">🏠 Collector Hub</Link>
          <Link href="/card-keeper" className="text-emerald-400 hover:text-emerald-300">⚡ Card Keeper</Link>
          <Link href="/achievements" className="text-emerald-400 hover:text-emerald-300">🏆 Achievements</Link>
        </div>
      </div>
    </div>
  );
}

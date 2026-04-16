import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardSnakeClient from './CardSnakeClient';

export const metadata: Metadata = {
  title: 'Card Snake — Collect Cards, Grow Your Snake | CardVault',
  description: 'Free card collecting snake game. Guide your snake to collect sports cards and Pokemon. Rare pulls score more points. How long can you survive? Mobile-friendly with swipe controls.',
  alternates: { canonical: './' },
  openGraph: {
    title: 'Card Snake — Card Collecting Arcade Game | CardVault',
    description: 'Classic snake game meets card collecting. Collect base cards, rookies, autos, and 1/1s. Beat your high score.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Snake | CardVault',
    description: 'Snake game + card collecting. Rare pulls = more points. How long can you survive?',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Snake' },
];

const faqItems = [
  {
    question: 'How do I play Card Snake?',
    answer: 'Use arrow keys, WASD, or swipe on mobile to guide your snake around the board. Collect card icons to score points and grow longer. Avoid hitting walls or your own tail. Different cards are worth different amounts — a base card is 10 points while a Logoman 1/1 is worth 1,000.',
  },
  {
    question: 'Why does the game speed up?',
    answer: 'The snake gets faster as you collect more cards, just like how the hobby gets more intense the deeper you get. Every card you collect increases the speed slightly. This means high scores require both quick reflexes and strategic pathing.',
  },
  {
    question: 'What are the rarest cards to find?',
    answer: 'The Logoman 1/1 (crown emoji, 1,000 points) is the rarest and most valuable. Case Hits (target, 400 points) and PSA 10 Gems (diamond, 300 points) are also rare. Common cards like base cards and rookies appear more frequently but are worth less.',
  },
  {
    question: 'Does the game save my high score?',
    answer: 'Yes. Your high score is saved in your browser localStorage and persists between sessions. Try to beat your personal best each time you play.',
  },
  {
    question: 'Can I play on mobile?',
    answer: 'Yes. Card Snake works on mobile with swipe controls and an on-screen directional pad. The board scales to fit your screen. Swipe in the direction you want the snake to move, or use the arrow buttons below the board.',
  },
];

export default function CardSnakePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Snake',
        description: 'Card collecting snake arcade game. Collect sports cards and Pokemon to score points. Rare pulls worth more.',
        url: 'https://cardvault-two.vercel.app/card-snake',
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

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Arcade Game &middot; Card Collecting &middot; High Scores
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Snake</h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          Classic snake game meets card collecting. Guide your snake to collect cards — base cards, rookies, refractors, autos, and legendary 1/1s. Rarer cards score more points. How long can you survive?
        </p>
      </div>

      <CardSnakeClient />

      {/* Tips */}
      <div className="mt-12 bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Strategy Tips</h2>
        <div className="space-y-3">
          {[
            { title: 'Plan Your Route', tip: 'Do not just chase the nearest card. Look ahead and plan a path that avoids boxing yourself into a corner.' },
            { title: 'Target Rare Pulls', tip: 'A single Logoman 1/1 is worth 100 base cards. When you see a crown or diamond emoji, prioritize it.' },
            { title: 'Use the Edges', tip: 'Early on, use the edges of the board to keep your path predictable. As you get longer, stay in the center for more escape routes.' },
            { title: 'Speed Management', tip: 'The game speeds up with each card. Focus on rare high-value cards over quantity to maximize your score-to-speed ratio.' },
          ].map((t, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-emerald-400 mt-0.5">&#x2022;</span>
              <div>
                <span className="text-white font-medium text-sm">{t.title}:</span>{' '}
                <span className="text-slate-400 text-sm">{t.tip}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-8 bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((f, i) => (
            <details key={i} className="group">
              <summary className="cursor-pointer text-white font-medium text-sm hover:text-emerald-400 transition-colors">
                {f.question}
              </summary>
              <p className="text-slate-400 text-sm mt-2 pl-4 border-l-2 border-slate-700">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Related Links */}
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { href: '/games', label: 'Games Hub', desc: 'All CardVault games' },
          { href: '/card-2048', label: 'Card 2048', desc: 'Merge cards to reach Gem Mint' },
          { href: '/card-battle', label: 'Card Battle', desc: 'Battle with card stats' },
          { href: '/card-wordle', label: 'Card Wordle', desc: 'Guess the player daily' },
          { href: '/tools/pack-sim', label: 'Pack Simulator', desc: 'Open virtual packs' },
          { href: '/card-slots', label: 'Card Slots', desc: 'Spin for card prizes' },
        ].map(link => (
          <Link key={link.href} href={link.href} className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-3 hover:border-emerald-700/50 transition-colors group">
            <span className="text-white text-sm font-medium group-hover:text-emerald-400 transition-colors">{link.label}</span>
            <span className="text-slate-500 text-xs block mt-0.5">{link.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

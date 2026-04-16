import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import SetBuilderClient from './SetBuilderClient';

export const metadata: Metadata = {
  title: 'Set Builder Challenge — Race to Complete a Card Set | CardVault',
  description: 'Race against the clock to build a complete card set! Pick the right cards from a shuffled pool of 24 to complete your 8-card target set. Daily challenge, practice, and blitz modes.',
  openGraph: {
    title: 'Set Builder Challenge — Race to Complete a Card Set | CardVault',
    description: 'Speed challenge: find all 8 target cards in a pool of 24. Daily challenge, practice mode, and 60-second blitz.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Set Builder Challenge — CardVault',
    description: 'Race to complete a card set! Find 8 target cards in a pool of 24 before time runs out.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Set Builder Challenge' },
];

const faqItems = [
  {
    question: 'How does Set Builder Challenge work?',
    answer: 'You are given a target set of 8 cards to find. Below the target, a shuffled pool of 24 cards is displayed — 8 correct matches plus 16 decoys from the same sport. Click cards you think belong in the set. Correct picks fill your target slots; wrong picks add a 3-second time penalty. Complete the set as fast as you can!',
  },
  {
    question: 'What are the different set themes?',
    answer: 'Sets are built around four themes: All-Rookie Set (8 rookie cards from one sport), Decade Set (8 cards from the same decade), Value Set (8 cards with mixed values from one sport), and Sport Collection (8 cards from the same sport with varied years). Each theme tests different card knowledge.',
  },
  {
    question: 'What is the difference between Daily, Practice, and Blitz modes?',
    answer: 'Daily Challenge gives everyone the same set each day — one attempt, compare with friends. Practice mode generates a random set each time with unlimited attempts. Blitz mode gives you 60 seconds to complete as many sets as possible for maximum points.',
  },
  {
    question: 'How is scoring and grading calculated?',
    answer: 'In Daily and Practice modes, your grade is based on completion time: under 30 seconds is S-rank, under 45s is A, under 60s is B, under 90s is C, under 120s is D, and over 120s is F. Each wrong pick adds a 3-second penalty to your time. A perfect game means no wrong picks and under 30 seconds.',
  },
  {
    question: 'What happens in Blitz mode?',
    answer: 'Blitz mode is a 60-second sprint. Complete a set and a new one appears immediately. Each completed set earns points based on how few wrong picks you made. The timer keeps counting down — see how many sets you can finish before time runs out. Wrong picks still add 3-second penalties.',
  },
];

export default function SetBuilderPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Set Builder Challenge — Race to Complete a Card Set',
        description: 'Speed challenge game where you race against the clock to find 8 target cards in a shuffled pool of 24. Daily challenge, practice, and blitz modes.',
        url: 'https://cardvault-two.vercel.app/set-builder',
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
          8 Cards &middot; 24 Pool &middot; Race the Clock
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Set Builder Challenge
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Race against the clock to complete a card set. Find all 8 target cards in a shuffled pool of 24 — wrong picks cost you 3 seconds. How fast can you build a set?
        </p>
      </div>

      <SetBuilderClient />

      {/* Related Games */}
      <div className="mt-8 bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-3">More Games</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/card-draft', label: 'Card Draft', desc: 'Snake draft vs AI opponents' },
            { href: '/card-bracket', label: 'Card Bracket', desc: '16-card tournament' },
            { href: '/card-jeopardy', label: 'Card Jeopardy', desc: 'Trivia across 6 categories' },
            { href: '/tools/set-cost', label: 'Set Cost Calculator', desc: 'Calculate set completion cost' },
            { href: '/collection-challenge', label: 'Collection Challenge', desc: 'Build your dream collection' },
            { href: '/card-speed-quiz', label: 'Speed Quiz', desc: 'Beat the clock trivia' },
          ].map(g => (
            <Link key={g.href} href={g.href} className="bg-zinc-800/60 border border-zinc-700/30 rounded-lg p-3 hover:border-zinc-600/50 transition-colors">
              <p className="text-white text-sm font-medium">{g.label}</p>
              <p className="text-zinc-500 text-xs">{g.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-8 border-t border-zinc-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqItems.map(f => (
            <details key={f.question} className="group bg-zinc-900/80 border border-zinc-800 rounded-lg">
              <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-zinc-200 hover:text-white flex items-center justify-between">
                {f.question}
                <span className="text-zinc-600 group-open:rotate-180 transition-transform">&#x25BC;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-zinc-400 leading-relaxed">
                {f.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardJeopardyClient from './CardJeopardyClient';

export const metadata: Metadata = {
  title: 'Card Jeopardy — Card Collecting Trivia Game | CardVault',
  description: 'Test your card collecting knowledge with Jeopardy-style trivia! 6 categories, 30 questions, Daily Doubles, and Final Jeopardy. How much do you really know about sports cards?',
  openGraph: {
    title: 'Card Jeopardy — Card Collecting Trivia Game | CardVault',
    description: 'Jeopardy-style trivia across 6 card collecting categories. Daily challenge, Daily Doubles, Final Jeopardy.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Jeopardy — CardVault',
    description: 'Card collecting trivia in Jeopardy format. 6 categories, 30 questions, Daily Doubles.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Jeopardy' },
];

const faqItems = [
  {
    question: 'How does Card Jeopardy work?',
    answer: 'Card Jeopardy is a trivia game with 6 card-collecting categories and 5 questions each, worth $200 to $1,000. Click any cell on the board to reveal a multiple-choice question. Answer correctly to earn the dollar amount. Answer wrong and you lose nothing — but the cell is used up. After all 30 questions, you face Final Jeopardy for a chance to wager big.',
  },
  {
    question: 'What are Daily Doubles?',
    answer: 'Two random cells on each board are Daily Doubles. When you land on one, you can wager up to your current score (minimum $200). If your score is $0 or negative, the maximum wager is $1,000. Get it right and you earn your wager amount. Get it wrong and you lose your wager.',
  },
  {
    question: 'How does Final Jeopardy work?',
    answer: 'After answering all 30 board questions, you face one Final Jeopardy question. You can wager any amount of your current score (from $0 up to your full total). A correct answer adds your wager; an incorrect answer subtracts it. This is your last chance to boost — or tank — your score.',
  },
  {
    question: 'Is the Daily board the same for everyone?',
    answer: 'Yes! Daily mode uses a date-based seed so every player sees the same board, same questions, and same Daily Double locations. This lets you compare scores with friends. Random mode generates a completely new board each time for unlimited practice.',
  },
  {
    question: 'What categories does the game cover?',
    answer: 'The six categories are Grading Lingo (PSA, BGS, CGC terminology), Rookie Records (famous rookie cards), Set Knowledge (popular brands and sets), Card Values (real card prices from the CardVault database), Player Legends (iconic players and their card history), and Hobby History (card collecting milestones and history).',
  },
];

export default function CardJeopardyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Jeopardy — Card Collecting Trivia Game',
        description: 'Test your card collecting knowledge with Jeopardy-style trivia across 6 categories with Daily Doubles and Final Jeopardy.',
        url: 'https://cardvault-two.vercel.app/card-jeopardy',
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
        <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-800/50 text-indigo-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
          6 Categories &middot; 30 Questions &middot; Daily Doubles
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Jeopardy
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Test your card collecting knowledge across 6 categories. Answer 30 questions, hit Daily Doubles, and face Final Jeopardy to prove you know the hobby.
        </p>
      </div>

      <CardJeopardyClient />

      {/* Related Games */}
      <div className="mt-8 bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-3">More Games</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/trivia', label: 'Card Trivia', desc: 'Quick-fire trivia rounds' },
            { href: '/guess-the-card', label: 'Guess the Card', desc: 'Identify cards from clues' },
            { href: '/card-draft', label: 'Card Draft', desc: 'Snake draft vs AI opponents' },
            { href: '/card-bracket', label: 'Card Bracket', desc: '16-card tournament' },
            { href: '/card-speed-quiz', label: 'Speed Quiz', desc: 'Beat the clock trivia' },
            { href: '/card-battle', label: 'Card Battles', desc: 'Stat-based card combat' },
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

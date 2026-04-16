import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardMillionaireClient from './CardMillionaireClient';

export const metadata: Metadata = {
  title: 'Card Millionaire — Card Collecting Knowledge Quiz Game | CardVault',
  description: 'Test your card collecting knowledge in this Millionaire-style quiz game. Answer 15 questions to climb from $100 to $1,000,000. Use lifelines: 50:50, Phone a Friend, Ask the Audience. Daily challenge plus unlimited random games.',
  openGraph: {
    title: 'Card Millionaire — Can You Reach $1,000,000? | CardVault',
    description: '15 card collecting questions. 3 lifelines. 2 safety nets. Can you become a Card Millionaire?',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Millionaire — CardVault',
    description: 'Millionaire-style card collecting quiz. 15 questions, 3 lifelines, $1M prize. Free.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Millionaire' },
];

const faqItems = [
  {
    question: 'How does Card Millionaire work?',
    answer: 'Card Millionaire is a quiz game inspired by Who Wants to Be a Millionaire. You answer 15 increasingly difficult questions about card collecting — grading, values, history, sets, players, and investing. Each correct answer moves you up the prize ladder from $100 to $1,000,000. Wrong answers drop you to the last safety net. Daily mode gives everyone the same questions; Random mode generates new questions each game.',
  },
  {
    question: 'What are the safety nets?',
    answer: 'There are two safety nets: Question 5 ($1,000) and Question 10 ($32,000). Once you reach a safety net, that prize is guaranteed even if you answer a later question wrong. For example, if you reach Q10 but miss Q12, you still take home $32,000 instead of $0.',
  },
  {
    question: 'What are the three lifelines?',
    answer: '50:50 removes two wrong answers, leaving just the correct answer and one wrong answer. Phone a Friend gives you a hint from a collecting expert (accuracy decreases on harder questions). Ask the Audience shows how a simulated audience voted across all four answers. Each lifeline can only be used once per game.',
  },
  {
    question: 'What topics do the questions cover?',
    answer: 'Questions span six categories: Basics (terminology, card types), Grading (PSA, BGS, CGC standards), Players (sports stars across MLB, NBA, NFL, NHL), History (card eras, milestones), Value (record sales, most valuable cards), Sets (products, parallels, brands), and Investing (fees, platforms, strategy).',
  },
  {
    question: 'Can I walk away with my winnings?',
    answer: 'Yes. After answering at least one question correctly, you can walk away at any time and keep your current prize. The Walk Away button shows how much you would take home. This is a risk-reward decision — you keep what you have, but you miss the chance to go higher.',
  },
];

export default function CardMillionairePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Millionaire',
        description: 'Millionaire-style card collecting knowledge quiz. 15 questions, 3 lifelines, climb to $1,000,000.',
        url: 'https://cardvault-two.vercel.app/card-millionaire',
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
          Quiz Game &middot; 15 Questions &middot; $1M Prize
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-2">Card Millionaire</h1>
        <p className="text-zinc-400 text-sm sm:text-base max-w-2xl">
          Test your card collecting expertise. Answer 15 questions of increasing difficulty to climb from $100 to $1,000,000. Use lifelines wisely, know when to walk away, and aim for the top.
        </p>
      </div>

      <CardMillionaireClient />

      {/* FAQ */}
      <div className="mt-12 border-t border-zinc-800 pt-8">
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-zinc-900/40 border border-zinc-800/50 rounded-lg">
              <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-zinc-200 hover:text-zinc-100">
                {faq.question}
              </summary>
              <div className="px-4 pb-3 text-sm text-zinc-400">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/games" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
          &larr; Back to All Games
        </Link>
      </div>
    </div>
  );
}

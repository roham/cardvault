import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardLingoClient from './CardLingoClient';

export const metadata: Metadata = {
  title: 'Card Lingo Quiz — Test Your Card Collecting Vocabulary | CardVault',
  description: 'Do you know your hobby lingo? Test your knowledge of card collecting terminology in this fun quiz. 60+ terms from wax to short prints to refractors. Daily mode and random mode.',
  openGraph: {
    title: 'Card Lingo Quiz — Know Your Hobby Terms? | CardVault',
    description: '60+ card collecting terms. Wax, hits, short prints, refractors — how many do you know?',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Lingo Quiz | CardVault',
    description: 'Test your card collecting vocabulary. 60+ hobby terms. How many do you really know?',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Lingo Quiz' },
];

const faqItems = [
  {
    question: 'How does the Card Lingo Quiz work?',
    answer: 'You are shown a card collecting term and four possible definitions. Pick the correct one within 15 seconds. Each quiz has 10 questions drawn from over 60 hobby terms. Score points for correct answers with speed bonuses for fast responses.',
  },
  {
    question: 'What terms are covered?',
    answer: 'The quiz covers terminology across all aspects of card collecting: grading (gem mint, slab, crossover), products (wax, hits, hobby box), card types (rookie card, short print, refractor, parallel), trading (comp, lot, break), and market terms (flip, hold, PC). Terms range from beginner to advanced.',
  },
  {
    question: 'Is there a daily challenge?',
    answer: 'Yes. Daily mode uses the same 10 questions for everyone each day, so you can compare scores with friends. Random mode generates a fresh quiz every time for unlimited practice.',
  },
  {
    question: 'How is scoring calculated?',
    answer: 'Correct answer: 100 base points plus a speed bonus of up to 50 points based on how fast you answer. Streak bonus: consecutive correct answers multiply your points. Wrong answer: 0 points and resets your streak. Maximum possible score is 1,500 per quiz.',
  },
  {
    question: 'Will new terms be added?',
    answer: 'The quiz database currently includes over 60 terms and grows over time. New hobby slang and terminology are added regularly as the collecting community evolves. If you know a term that is missing, let us know.',
  },
];

export default function CardLingoPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Card Lingo Quiz',
        description: 'Test your card collecting vocabulary with 60+ hobby terms. Daily and random modes.',
        url: 'https://cardvault-two.vercel.app/card-lingo',
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
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
          Card Lingo Quiz &middot; 60+ Terms &middot; Daily Challenge
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Lingo Quiz</h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          Do you really know your hobby lingo? Test your knowledge of card collecting terminology.
        </p>
      </div>

      <CardLingoClient />

      {/* FAQ */}
      <div className="mt-12 bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((f, i) => (
            <details key={i} className="group">
              <summary className="cursor-pointer text-white font-medium text-sm hover:text-violet-400 transition-colors">
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
          { href: '/trivia', label: 'Daily Trivia', desc: '5 daily card questions' },
          { href: '/card-jeopardy', label: 'Card Jeopardy', desc: '6 categories, Daily Doubles' },
          { href: '/guess-the-card', label: 'Guess the Card', desc: 'Wordle-style daily puzzle' },
          { href: '/guides/card-collecting-glossary', label: 'Full Glossary', desc: '80+ terms defined' },
          { href: '/card-speed-quiz', label: 'Speed Quiz', desc: 'Name that player fast' },
          { href: '/games', label: 'All Games', desc: '50+ free card games' },
        ].map(link => (
          <Link key={link.href} href={link.href} className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-3 hover:border-violet-700/50 transition-colors group">
            <span className="text-white text-sm font-medium group-hover:text-violet-400 transition-colors">{link.label}</span>
            <span className="text-slate-500 text-xs block mt-0.5">{link.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import GradingGameClient from './GradingGameClient';

export const metadata: Metadata = {
  title: 'Card Grading Game — Test Your Grading Eye | CardVault',
  description: 'Think you can grade cards like a PSA expert? Read condition descriptions and assign the correct grade (1-10). 10 rounds per game, daily challenge mode, score tracking, and letter grades. Free card grading practice game.',
  openGraph: {
    title: 'Card Grading Game — CardVault',
    description: 'Test your card grading skills. Guess the PSA grade from condition clues. Daily challenge, score tracking, letter grades.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Grading Game — CardVault',
    description: 'Can you grade cards like PSA? Test your eye with our free grading game.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Grading Game' },
];

const faqItems = [
  {
    question: 'How does the Card Grading Game work?',
    answer: 'Each round presents a card with detailed condition descriptions for centering, corners, edges, and surface — the same four criteria professional grading companies evaluate. You read the clues and select a PSA grade from 1-10. The closer your guess is to the actual grade, the more points you earn. A perfect match scores 100 points, while being off by 1 grade scores 70. Play 10 rounds per game and track your accuracy over time.',
  },
  {
    question: 'What grades does PSA use?',
    answer: 'PSA uses a 1-10 numerical scale: 1 (Poor), 2 (Good), 3 (Very Good), 4 (VG-EX), 5 (Excellent), 6 (EX-MT), 7 (Near Mint), 8 (NM-MT), 9 (Mint), and 10 (Gem Mint). Higher grades mean better condition, with 10 being virtually perfect. The most common grades for modern cards submitted to PSA are 8-10, while vintage cards often grade 3-7 due to age-related wear.',
  },
  {
    question: 'Will this game help me learn to grade cards?',
    answer: 'Yes! This game teaches you to recognize how specific condition issues correspond to PSA grades. After each round, you see the correct grade with an explanation of why that grade was assigned. Over time, you\'ll develop an eye for the differences between a PSA 7 and PSA 8, or why certain flaws drop a card from a 9 to a 7. Real grading also considers eye appeal and overall impression, which this game simulates through the descriptions.',
  },
  {
    question: 'What is the Daily Challenge mode?',
    answer: 'The Daily Challenge uses the same set of 10 cards for all players on a given day (seeded by the date). This lets you compare your score with friends or other collectors who played the same day. Your daily challenge history is saved locally, including your best score and longest streak of days played.',
  },
  {
    question: 'How is the scoring calculated?',
    answer: 'Scoring is based on accuracy: a perfect grade match earns 100 points, being off by 1 earns 70 points, off by 2 earns 40 points, off by 3 earns 20 points, and off by 4 or more earns 0 points. Your total score out of 1,000 (10 rounds × 100 max) determines your letter grade: S (950+), A (800+), B (600+), C (400+), D (200+), F (below 200). The game also tracks your average accuracy percentage across all games played.',
  },
];

export default function GradingGamePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Grading Game',
        description: 'Test your card grading skills. Read condition descriptions and assign the correct PSA grade (1-10). Daily challenges, score tracking, and letter grades.',
        url: 'https://cardvault-two.vercel.app/grading-game',
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
          10 Rounds &middot; Daily Challenge &middot; Score Tracking
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Grading Game</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Think you can grade cards like a PSA expert? Read the condition clues and assign the correct grade. 10 rounds, daily challenge mode, and letter grades to track your progress.
        </p>
      </div>

      <GradingGameClient />

      {/* Related tools & games */}
      <section className="mt-16 mb-12">
        <h2 className="text-xl font-bold text-white mb-4">Related Tools & Games</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/tools/condition-grader', label: 'Condition Self-Grader', icon: '🔬' },
            { href: '/tools/centering-check', label: 'Centering Checker', icon: '📐' },
            { href: '/tools/grading-roi', label: 'Grading ROI Calculator', icon: '💰' },
            { href: '/tools/grade-spread', label: 'Grade Price Spread', icon: '📊' },
            { href: '/tools/slab-weight', label: 'Slab Weight Verifier', icon: '⚖️' },
            { href: '/trivia', label: 'Card Trivia', icon: '🧠' },
            { href: '/guess-the-card', label: 'Guess the Card', icon: '🔮' },
            { href: '/grading', label: 'Grading Company Guide', icon: '🏅' },
          ].map(t => (
            <Link key={t.href} href={t.href} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-lg text-sm transition-colors">
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/50 border border-gray-700/50 rounded-xl">
              <summary className="cursor-pointer px-5 py-4 text-white font-medium text-sm flex items-center justify-between">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform ml-2">&#9662;</span>
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </section>

      <section className="border-t border-gray-800 pt-8 mt-8 text-sm text-gray-500">
        <p>
          Sharpen your grading skills with our <Link href="/tools/condition-grader" className="text-emerald-400 hover:underline">Condition Self-Grader</Link>,
          check your <Link href="/tools/centering-check" className="text-emerald-400 hover:underline">card centering</Link>,
          or test your knowledge with <Link href="/trivia" className="text-emerald-400 hover:underline">Card Trivia</Link>.
          Learn more about grading at the <Link href="/grading" className="text-emerald-400 hover:underline">Grading Company Hub</Link>.
        </p>
      </section>
    </div>
  );
}

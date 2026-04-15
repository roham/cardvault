import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardBingo from './CardBingo';

export const metadata: Metadata = {
  title: 'Card Bingo — Daily Collecting Challenge Board',
  description: 'Free daily bingo board for card collectors. Complete challenges across 5 categories: Browse, Tools, Games, Collect, Social. Get BINGO by completing rows, columns, or diagonals. Fresh board every day. Share your results.',
  openGraph: {
    title: 'Card Bingo — CardVault',
    description: 'Daily 5x5 bingo board with card collecting challenges. Complete rows, columns, and diagonals. Share your results. Free.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Bingo — CardVault',
    description: 'Daily collecting challenge bingo board. 5 categories, shareable results. Free.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/my-hub' },
  { label: 'Card Bingo' },
];

const faqItems = [
  {
    question: 'How does Card Bingo work?',
    answer: 'Each day you get a fresh 5x5 bingo board with 25 card collecting challenges across 5 categories: Browse, Tools, Games, Collect, and Social. Complete challenges by visiting features and using tools on CardVault. Mark squares as you go. Get 5 in a row for a BINGO!',
  },
  {
    question: 'Does the board change every day?',
    answer: 'Yes! A new board is generated every day at midnight. Your progress is saved locally so you can return throughout the day to mark off completed squares. Everyone gets the same board each day.',
  },
  {
    question: 'What counts as completing a square?',
    answer: 'Card Bingo uses the honor system — tap a square to mark it complete after you\'ve done the activity. Each square links to the relevant page so you can complete the challenge immediately.',
  },
  {
    question: 'Can I share my results?',
    answer: 'Yes! Use the "Copy Results" button to generate an emoji grid showing your progress (green for bingo lines, yellow for completed, black for incomplete). Share it on social media or with friends.',
  },
  {
    question: 'What is a perfect day?',
    answer: 'A perfect day means you completed all 25 squares on the board. This is tracked in your stats along with your current streak, total bingos, and perfect days count.',
  },
];

export default function CardBingoPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Bingo',
        description: 'Daily 5x5 bingo board with card collecting challenges across 5 categories. Complete rows, columns, or diagonals. Fresh board every day.',
        url: 'https://cardvault-two.vercel.app/card-bingo',
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
          Daily Board &middot; 5 Categories &middot; Shareable Results &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Bingo
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Complete challenges across CardVault to fill your daily bingo board. Get 5 in a row for a BINGO. New board every day.
        </p>
      </div>

      <CardBingo />

      {/* FAQ Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-900/60 border border-gray-800 rounded-xl">
              <summary className="cursor-pointer p-4 text-white font-medium hover:text-indigo-400 transition-colors list-none flex justify-between items-center">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

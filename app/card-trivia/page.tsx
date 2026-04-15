import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardTrivia from './CardTrivia';

export const metadata: Metadata = {
  title: 'Card Trivia Challenge — Test Your Sports Card Collecting Knowledge',
  description: 'Test your card collecting knowledge with 40 questions across 6 categories: history, grading, players, products, market, and culture. Daily challenge, random mix, or category focus. Score tracking and shareable results.',
  openGraph: {
    title: 'Card Trivia Challenge — CardVault',
    description: 'Test your sports card collecting knowledge. 40 questions, 6 categories, daily challenge mode.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Trivia Challenge — CardVault',
    description: 'How well do you know the card collecting hobby? Take the trivia challenge.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Card Trivia' },
];

const faqItems = [
  {
    question: 'How does the Card Trivia Challenge work?',
    answer: 'Choose from three modes: Daily Challenge (same 10 questions for everyone each day), Random Mix (10 random questions from all categories), or Category Focus (questions from one specific category). Answer multiple-choice questions about card collecting history, grading, players, products, markets, and hobby culture. Each question includes a detailed explanation after you answer.',
  },
  {
    question: 'What categories are available?',
    answer: 'Six categories cover the full hobby: History (origins, eras, landmark moments), Grading (PSA, BGS, CGC, SGC terminology), Players (record sales, iconic cards), Products (box types, parallels, inserts), Market (pricing, trends, selling), and Culture (shows, terminology, community).',
  },
  {
    question: 'How is the Daily Challenge scored?',
    answer: 'You receive one point per correct answer, with a letter grade (S/A/B/C/D/F) based on your percentage. The daily challenge uses the same questions for all players, so you can compare scores with friends. Your stats are tracked locally including best score, accuracy, and day streak.',
  },
  {
    question: 'Can I share my trivia score?',
    answer: 'Yes! After completing a game, click "Share Score" to copy your result to the clipboard. Share it on social media or with friends to see who knows more about card collecting.',
  },
];

export default function CardTriviaPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Trivia Challenge',
        description: 'Test your sports card collecting knowledge with 40 questions across 6 categories.',
        url: 'https://cardvault-two.vercel.app/card-trivia',
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
        <div className="inline-flex items-center gap-2 bg-purple-950/60 border border-purple-800/50 text-purple-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
          40 Questions &middot; 6 Categories &middot; Daily Challenge &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Trivia Challenge</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          How well do you know the card collecting hobby? Test your knowledge on history, grading, players,
          products, markets, and culture. Play the daily challenge or focus on your weakest category.
        </p>
      </div>

      <CardTrivia />

      {/* FAQ Section */}
      <div className="mt-12 border-t border-gray-700/50 pt-8">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/30 border border-gray-700/30 rounded-xl">
              <summary className="cursor-pointer p-4 text-white font-medium hover:text-purple-300 transition-colors list-none flex items-center justify-between">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform ml-2">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
